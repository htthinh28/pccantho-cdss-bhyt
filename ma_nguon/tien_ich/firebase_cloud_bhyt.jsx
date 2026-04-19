import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithEmailAndPassword } from 'firebase/auth';
import {
    addDoc,
    collection,
    doc,
    limit as fsLimit,
    getDoc,
    getDocs,
    getFirestore,
    orderBy,
    query,
    runTransaction,
    serverTimestamp,
    setDoc,
    writeBatch,
} from 'firebase/firestore';
import { DVKT_DATASET_SCHEMA_VERSION, danhGiaConflictPolicyTaiXuong } from './config_dataset_versioning';
  import appConfig from '../../app.json';

const LOCAL_CHUNK_SIZE = 320000;
const FIRESTORE_INLINE_LIMIT = 700000;
const FIRESTORE_CHUNK_SIZE = 280000;
const BATCH_WRITE_LIMIT = 400;
const LOCAL_FIREBASE_META_PREFIX = 'FIREBASE_DVKT_META_';
const FIREBASE_ALLOWED_READ_ROLES = new Set(['ADMIN', 'AUDITOR', 'OPERATOR', 'REVIEWER', 'USER']);
const FIREBASE_ALLOWED_WRITE_ROLES = new Set(['ADMIN', 'AUDITOR', 'OPERATOR']);

let firebaseRuntime = null;
let firebaseAuthEnsurePromise = null;
let firebaseAuthLastAttemptAt = 0;
let firebaseAuthBlockedUntil = 0;
let expoConstantsRuntime = undefined;

const FIREBASE_AUTH_MIN_INTERVAL_MS = 4000;
const FIREBASE_AUTH_TOO_MANY_BLOCK_MS = 15000;

const getExpoConstantsRuntime = () => {
  if (expoConstantsRuntime !== undefined) return expoConstantsRuntime;
  try {
    const dynamicRequire = new Function('moduleName', 'return require(moduleName);');
    const loaded = dynamicRequire('expo-constants');
    expoConstantsRuntime = loaded?.default || loaded || null;
  } catch {
    expoConstantsRuntime = null;
  }
  return expoConstantsRuntime;
};

const fastHash = (value) => {
  const str = String(value || '');
  let hash = 5381;
  for (let i = 0; i < str.length; i += 1) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
    hash >>>= 0;
  }
  return hash.toString(36);
};

const localMetaKey = (datasetKey) => `${LOCAL_FIREBASE_META_PREFIX}${toSafeToken(datasetKey)}`;

const readLocalDatasetMeta = async (datasetKey) => {
  try {
    const raw = await AsyncStorage.getItem(localMetaKey(datasetKey));
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const writeLocalDatasetMeta = async (datasetKey, meta) => {
  try {
    await AsyncStorage.setItem(localMetaKey(datasetKey), JSON.stringify(meta || {}));
  } catch {
    // ignore local meta write error
  }
};

const buildLocalDatasetMetaFromRows = (rows, { markSynced = false, now = Date.now(), updated_by = '' } = {}) => {
  const data = Array.isArray(rows) ? rows : [];
  const payload = JSON.stringify(data);
  const payloadHash = fastHash(payload);
  const meta = {
    schema_version: DVKT_DATASET_SCHEMA_VERSION,
    payload_hash: payloadHash,
    content_hash: payloadHash,
    row_count: data.length,
    payload_bytes: payload.length,
    updated_at: now,
  };
  if (String(updated_by || '').trim()) {
    meta.updated_by = String(updated_by || '').trim();
  }
  if (markSynced) {
    meta.synced_payload_hash = payloadHash;
    meta.synced_at = now;
  }
  return meta;
};

export const layMetaDatasetCucBo = async (datasetKey) => {
  const key = toSafeToken(datasetKey);
  const meta = await readLocalDatasetMeta(key);
  if (!meta || typeof meta !== 'object') {
    return {
      ok: true,
      exists: false,
      dataset_key: key,
      schema_version: 0,
      payload_hash: '',
      content_hash: '',
      row_count: 0,
      payload_bytes: 0,
      updated_at_ms: 0,
      synced_payload_hash: '',
      synced_at_ms: 0,
      updated_by: '',
    };
  }
  const payloadHash = String(meta.payload_hash || '');
  return {
    ok: true,
    exists: true,
    dataset_key: key,
    schema_version: Number(meta.schema_version) > 0 ? Number(meta.schema_version) : DVKT_DATASET_SCHEMA_VERSION,
    payload_hash: payloadHash,
    content_hash: String(meta.content_hash || payloadHash || ''),
    row_count: Number(meta.row_count || 0),
    payload_bytes: Number(meta.payload_bytes || 0),
    updated_at_ms: Number(meta.updated_at || 0),
    synced_payload_hash: String(meta.synced_payload_hash || ''),
    synced_at_ms: Number(meta.synced_at || 0),
    updated_by: String(meta.updated_by || ''),
  };
};

export const capNhatMetaDatasetCucBoTheoRows = async (datasetKey, rows, options = {}) => {
  const key = toSafeToken(datasetKey);
  const previous = await readLocalDatasetMeta(key);
  const nextMeta = buildLocalDatasetMetaFromRows(rows, options);
  if (previous && typeof previous === 'object' && !options?.markSynced) {
    if (previous.synced_payload_hash) nextMeta.synced_payload_hash = String(previous.synced_payload_hash || '');
    if (previous.synced_at) nextMeta.synced_at = Number(previous.synced_at || 0);
    if (previous.updated_by && !nextMeta.updated_by) nextMeta.updated_by = String(previous.updated_by || '');
  }
  await writeLocalDatasetMeta(key, nextMeta);
  return {
    ok: true,
    dataset_key: key,
    ...nextMeta,
  };
};

const toSafeToken = (value, fallback = 'unknown') => {
  const token = String(value || '').trim().replace(/[^a-zA-Z0-9._-]/g, '_');
  return token || fallback;
};

const parseBoolean = (value, fallback = false) => {
  const token = String(value ?? '').trim().toLowerCase();
  if (!token) return fallback;
  if (['1', 'true', 'yes', 'on'].includes(token)) return true;
  if (['0', 'false', 'no', 'off'].includes(token)) return false;
  return fallback;
};

const normalizeSecretValue = (value) => {
  const raw = String(value ?? '').trim();
  if (!raw) return '';
  // Handle accidental wrapping quotes from env/app config.
  if ((raw.startsWith('"') && raw.endsWith('"')) || (raw.startsWith("'") && raw.endsWith("'"))) {
    return raw.slice(1, -1).trim();
  }
  return raw;
};

const hasGiaTriCauHinh = (value) => {
  if (typeof value === 'boolean' || typeof value === 'number') return true;
  return String(value ?? '').trim() !== '';
};

const chonGiaTriCauHinh = (...values) => {
  for (const value of values) {
    if (hasGiaTriCauHinh(value)) return value;
  }
  return '';
};

const normalizeArrayData = (parsed) => {
  if (Array.isArray(parsed)) return parsed;
  if (parsed && Array.isArray(parsed.data)) return parsed.data;
  if (parsed && Array.isArray(parsed.rules)) return parsed.rules;
  return [];
};

const getEnv = (key) => {
  try {
    return process?.env?.[key] || '';
  } catch {
    return '';
  }
};

const inferFirebaseCodeFromMessage = (message) => {
  const text = String(message || '').toLowerCase();
  const match = text.match(/auth\/[a-z0-9-]+/i);
  return match ? String(match[0] || '').toLowerCase() : '';
};

const resolveFirebaseConfig = () => {
  const Constants = getExpoConstantsRuntime();
  const extraRuntime = Constants?.expoConfig?.extra || Constants?.manifest?.extra || {};
  const extraStatic = appConfig?.expo?.extra || {};
  const runtimeCfg = extraRuntime?.firebase || {};
  const staticCfg = extraStatic?.firebase || {};

  const apiKey = chonGiaTriCauHinh(runtimeCfg.apiKey, staticCfg.apiKey, getEnv('EXPO_PUBLIC_FIREBASE_API_KEY'));
  const authDomain = chonGiaTriCauHinh(runtimeCfg.authDomain, staticCfg.authDomain, getEnv('EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN'));
  const projectId = chonGiaTriCauHinh(runtimeCfg.projectId, staticCfg.projectId, getEnv('EXPO_PUBLIC_FIREBASE_PROJECT_ID'));
  const storageBucket = chonGiaTriCauHinh(runtimeCfg.storageBucket, staticCfg.storageBucket, getEnv('EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET'));
  const messagingSenderId = chonGiaTriCauHinh(runtimeCfg.messagingSenderId, staticCfg.messagingSenderId, getEnv('EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'));
  const appId = chonGiaTriCauHinh(runtimeCfg.appId, staticCfg.appId, getEnv('EXPO_PUBLIC_FIREBASE_APP_ID'));
  const enabledRaw = chonGiaTriCauHinh(runtimeCfg.enabled, staticCfg.enabled, getEnv('EXPO_PUBLIC_FIREBASE_ENABLED'));
  const orgIdRaw = chonGiaTriCauHinh(runtimeCfg.orgId, staticCfg.orgId, getEnv('EXPO_PUBLIC_FIREBASE_ORG_ID'));
  const authModeRaw = chonGiaTriCauHinh(runtimeCfg.authMode, staticCfg.authMode, getEnv('EXPO_PUBLIC_FIREBASE_AUTH_MODE'));
  const authEmail = normalizeSecretValue(chonGiaTriCauHinh(runtimeCfg.authEmail, staticCfg.authEmail, getEnv('EXPO_PUBLIC_FIREBASE_AUTH_EMAIL')));
  const authPassword = normalizeSecretValue(chonGiaTriCauHinh(runtimeCfg.authPassword, staticCfg.authPassword, getEnv('EXPO_PUBLIC_FIREBASE_AUTH_PASSWORD')));

  const hasAllKeys = [apiKey, projectId, appId].every((v) => String(v || '').trim() !== '');
  const enabled = parseBoolean(enabledRaw, hasAllKeys);
  const authMode = String(authModeRaw || 'anonymous').trim().toLowerCase();

  return {
    enabled,
    orgId: toSafeToken(orgIdRaw || 'default_org'),
    authMode,
    authEmail,
    authPassword,
    firebaseConfig: {
      apiKey,
      authDomain,
      projectId,
      storageBucket,
      messagingSenderId,
      appId,
    },
  };
};

const getFirebaseRuntime = () => {
  const resolved = resolveFirebaseConfig();
  if (firebaseRuntime?.ok) return firebaseRuntime;

  if (firebaseRuntime && !firebaseRuntime.ok) {
    const coTheKhoiPhuc = resolved.enabled === true;
    if (!coTheKhoiPhuc) return firebaseRuntime;
    firebaseRuntime = null;
  }

  if (!resolved.enabled) {
    firebaseRuntime = { ok: false, reason: 'Firebase chưa bật (firebase.enabled=false).' };
    return firebaseRuntime;
  }

  const { firebaseConfig } = resolved;
  const hasRequired = [firebaseConfig.apiKey, firebaseConfig.projectId, firebaseConfig.appId]
    .every((v) => String(v || '').trim() !== '');
  if (!hasRequired) {
    firebaseRuntime = { ok: false, reason: 'Thiếu cấu hình Firebase bắt buộc.' };
    return firebaseRuntime;
  }

  try {
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    firebaseRuntime = {
      ok: true,
      app,
      auth: getAuth(app),
      db: getFirestore(app),
      orgId: resolved.orgId,
      projectId: firebaseConfig.projectId,
      mode: 'firestore_only',
      authMode: resolved.authMode,
      authEmail: String(resolved.authEmail || '').trim(),
      authPassword: String(resolved.authPassword || ''),
    };
    return firebaseRuntime;
  } catch (error) {
    firebaseRuntime = { ok: false, reason: error?.message || 'Khởi tạo Firebase thất bại.' };
    return firebaseRuntime;
  }
};

const mapFirebaseError = (error, fallbackMessage = 'Firebase operation failed.') => {
  const rawCode = String(error?.code || '').toLowerCase();
  const rawMessage = String(error?.message || '').trim();
  const code = rawCode || inferFirebaseCodeFromMessage(rawMessage);

  if (code.includes('auth/too-many-requests')) {
    return {
      code,
      reason: 'Firebase tạm khóa do quá nhiều lần đăng nhập liên tiếp. Vui lòng chờ 1-2 phút rồi thử lại.',
    };
  }

  if (code.includes('permission-denied')) {
    return {
      code,
      reason: 'Không có quyền truy cập Firestore. Kiểm tra custom claims (org_id, role) và firestore.rules.',
    };
  }
  if (code.includes('unauthenticated')) {
    return {
      code,
      reason: 'Chưa đăng nhập Firebase. Vui lòng đăng nhập và thử lại.',
    };
  }
  if (code.includes('auth/operation-not-allowed')) {
    return {
      code,
      reason: 'Anonymous Authentication chưa được bật trong Firebase Console.',
    };
  }
  if (code.includes('auth/configuration-not-found')) {
    return {
      code,
      reason: 'Firebase Authentication chưa được cấu hình. Cần bật Authentication provider (anonymous hoặc email/password).',
    };
  }
  if (code.includes('auth/invalid-login-credentials')) {
    return {
      code,
      reason: 'Sai email/password Firebase được cấu hình.',
    };
  }
  if (code.includes('auth/invalid-credential')) {
    return {
      code,
      reason: 'Firebase auth bị invalid-credential. Kiểm tra lại authMode, authEmail, authPassword và API key của project.',
    };
  }
  if (code.includes('auth/user-not-found')) {
    return {
      code,
      reason: 'Không tìm thấy tài khoản Firebase theo authEmail đã cấu hình.',
    };
  }
  if (code.includes('auth/wrong-password')) {
    return {
      code,
      reason: 'Sai mật khẩu Firebase của tài khoản authEmail đã cấu hình.',
    };
  }
  if (code.includes('auth/invalid-api-key')) {
    return {
      code,
      reason: 'Firebase API key không hợp lệ hoặc không thuộc project hiện tại.',
    };
  }
  if (code.includes('unavailable')) {
    return {
      code,
      reason: 'Không kết nối được Firebase. Kiểm tra internet và thử lại.',
    };
  }

  if (rawMessage) return { code, reason: rawMessage };
  return { code, reason: fallbackMessage };
};

const normalizeClaimRole = (value) => String(value || '').trim().toUpperCase();

const readUserClaims = async (runtime, user, forceRefresh = false) => {
  if (!runtime?.auth || !user) {
    return { ok: false, reason: 'Không tìm thấy user Firebase hiện tại.' };
  }
  try {
    const tokenResult = await user.getIdTokenResult(!!forceRefresh);
    const claims = tokenResult?.claims || {};
    const orgId = String(claims.org_id || '').trim();
    const role = normalizeClaimRole(claims.role);
    return {
      ok: true,
      org_id: orgId,
      role,
      claims,
    };
  } catch (error) {
    const mapped = mapFirebaseError(error, 'Không đọc được custom claims từ Firebase ID token.');
    return { ok: false, reason: mapped.reason, error_code: mapped.code };
  }
};

const ensureUserClaims = async (runtime, user, { requireWrite = false } = {}) => {
  const claimsResult = await readUserClaims(runtime, user, true);
  if (!claimsResult.ok) {
    return { ok: false, stage: 'claims', reason: claimsResult.reason, error_code: claimsResult.error_code || '' };
  }

  if (!claimsResult.org_id || claimsResult.org_id !== runtime.orgId) {
    return {
      ok: false,
      stage: 'claims',
      reason: `Custom claim org_id không hợp lệ. Yêu cầu: ${runtime.orgId}.`,
      claims: claimsResult,
    };
  }

  const allowSet = requireWrite ? FIREBASE_ALLOWED_WRITE_ROLES : FIREBASE_ALLOWED_READ_ROLES;
  if (!allowSet.has(claimsResult.role)) {
    return {
      ok: false,
      stage: 'claims',
      reason: requireWrite
        ? `Role ${claimsResult.role || '(trống)'} không đủ quyền ghi dữ liệu Firebase.`
        : `Role ${claimsResult.role || '(trống)'} không đủ quyền đọc dữ liệu Firebase.`,
      claims: claimsResult,
    };
  }

  return { ok: true, claims: claimsResult };
};

const waitForCurrentUser = async (auth, timeoutMs = 2500) =>
  new Promise((resolve) => {
    if (!auth) {
      resolve(null);
      return;
    }
    if (auth.currentUser) {
      resolve(auth.currentUser);
      return;
    }

    let settled = false;
    let unsubscribe = () => {};
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      unsubscribe();
      resolve(auth.currentUser || null);
    }, timeoutMs);

    unsubscribe = auth.onAuthStateChanged((user) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      unsubscribe();
      resolve(user || null);
    });
  });

const formatWaitSeconds = (ms) => Math.max(1, Math.ceil((Number(ms) || 0) / 1000));
const formatWaitSecondsForNotice = (ms) => Math.min(20, formatWaitSeconds(ms));
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, Math.max(0, Number(ms) || 0)));
const buildAuthConfigHint = (runtime) => {
  const authMode = String(runtime?.authMode || 'anonymous');
  const authEmail = String(runtime?.authEmail || '').trim();
  const passwordLen = String(runtime?.authPassword || '').length;
  return `auth_mode=${authMode}, auth_email=${authEmail || '(trống)'}, auth_password_len=${passwordLen}`;
};

const ensureFirebaseAuthSession = async (runtime) => {
  if (!runtime?.ok) {
    return { ok: false, reason: runtime?.reason || 'Firebase chưa sẵn sàng.' };
  }
  if (runtime.auth?.currentUser) {
    return { ok: true, user: runtime.auth.currentUser, method: 'existing' };
  }

  if (firebaseAuthEnsurePromise) return firebaseAuthEnsurePromise;

  const now = Date.now();
  if (firebaseAuthBlockedUntil > now) {
    const retryAfterMs = Math.max(500, firebaseAuthBlockedUntil - now);
    const waitSeconds = formatWaitSecondsForNotice(firebaseAuthBlockedUntil - now);
    return {
      ok: false,
      reason: `Firebase auth đang tạm khóa do thử đăng nhập quá nhanh. Vui lòng chờ khoảng ${waitSeconds}s rồi kiểm tra lại.`,
      error_code: 'auth/too-many-requests',
      retry_after_ms: retryAfterMs,
    };
  }

  if (firebaseAuthLastAttemptAt > 0 && (now - firebaseAuthLastAttemptAt) < FIREBASE_AUTH_MIN_INTERVAL_MS) {
    const retryAfterMs = Math.max(300, FIREBASE_AUTH_MIN_INTERVAL_MS - (now - firebaseAuthLastAttemptAt));
    const waitSeconds = formatWaitSeconds(retryAfterMs);
    return {
      ok: false,
      reason: `Đang giới hạn tần suất đăng nhập Firebase để tránh bị khóa. Vui lòng chờ ${waitSeconds}s rồi thử lại.`,
      error_code: 'auth/rate-limited-local',
      retry_after_ms: retryAfterMs,
    };
  }

  firebaseAuthEnsurePromise = (async () => {
    try {
      const restoredUser = await waitForCurrentUser(runtime.auth, 3000);
      if (restoredUser) {
        return { ok: true, user: restoredUser, method: 'restored' };
      }

      firebaseAuthLastAttemptAt = Date.now();

      if (runtime.authMode === 'email_password') {
        if (!runtime.authEmail || !runtime.authPassword) {
          return {
            ok: false,
            reason: `Thiếu authEmail/authPassword cho Firebase auth mode email_password. (${buildAuthConfigHint(runtime)})`,
          };
        }
        if (String(runtime.authPassword || '').length < 6) {
          return {
            ok: false,
            reason: `authPassword quá ngắn cho email/password provider. (${buildAuthConfigHint(runtime)})`,
          };
        }
        const cred = await signInWithEmailAndPassword(runtime.auth, runtime.authEmail, runtime.authPassword);
        firebaseAuthBlockedUntil = 0;
        return { ok: true, user: cred.user, method: 'email_password' };
      }

      const cred = await signInAnonymously(runtime.auth);
      firebaseAuthBlockedUntil = 0;
      return { ok: true, user: cred.user, method: 'anonymous' };
    } catch (error) {
      const mapped = mapFirebaseError(error, 'Đăng nhập Firebase thất bại.');
      if (String(mapped.code || '').toLowerCase().includes('auth/too-many-requests')) {
        firebaseAuthBlockedUntil = Date.now() + FIREBASE_AUTH_TOO_MANY_BLOCK_MS;
      }
      const code = String(mapped.code || '').toLowerCase();
      const canHintCredential = code.includes('auth/invalid-credential')
        || code.includes('auth/invalid-login-credentials')
        || code.includes('auth/user-not-found')
        || code.includes('auth/wrong-password');
      const reason = canHintCredential ? `${mapped.reason} (${buildAuthConfigHint(runtime)})` : mapped.reason;
      return { ok: false, reason, error_code: mapped.code };
    } finally {
      firebaseAuthEnsurePromise = null;
    }
  })();

  return firebaseAuthEnsurePromise;
};

const ensureFirestoreReady = async ({ requireWrite = false } = {}) => {
  const runtime = getFirebaseRuntime();
  if (!runtime.ok) {
    return {
      ok: false,
      disabled: true,
      stage: 'config',
      reason: runtime.reason,
    };
  }

  const authResult = await ensureFirebaseAuthSession(runtime);
  if (!authResult.ok) {
    const coTheThuLai = ['auth/too-many-requests', 'auth/rate-limited-local'].includes(String(authResult.error_code || '').toLowerCase());
    const retryAfterMs = Math.max(0, Number(authResult.retry_after_ms) || 0);

    if (coTheThuLai && retryAfterMs > 0) {
      await delay(retryAfterMs + 250);
      const authRetryResult = await ensureFirebaseAuthSession(runtime);
      if (authRetryResult.ok) {
        const claimsRetryResult = await ensureUserClaims(runtime, authRetryResult.user, { requireWrite });
        if (!claimsRetryResult.ok) {
          return {
            ok: false,
            disabled: true,
            stage: claimsRetryResult.stage || 'claims',
            reason: claimsRetryResult.reason || 'Custom claims không hợp lệ.',
            error_code: claimsRetryResult.error_code || '',
            claims: claimsRetryResult.claims || null,
          };
        }

        return {
          ok: true,
          runtime,
          auth: authRetryResult,
          claims: claimsRetryResult.claims || null,
        };
      }

      return {
        ok: false,
        disabled: true,
        stage: 'auth',
        reason: authRetryResult.reason || authResult.reason,
        error_code: authRetryResult.error_code || authResult.error_code || '',
        retry_after_ms: authRetryResult.retry_after_ms || 0,
      };
    }

    return {
      ok: false,
      disabled: true,
      stage: 'auth',
      reason: authResult.reason,
      error_code: authResult.error_code || '',
      retry_after_ms: authResult.retry_after_ms || 0,
    };
  }

  const claimsResult = await ensureUserClaims(runtime, authResult.user, { requireWrite });
  if (!claimsResult.ok) {
    return {
      ok: false,
      disabled: true,
      stage: claimsResult.stage || 'claims',
      reason: claimsResult.reason || 'Custom claims không hợp lệ.',
      error_code: claimsResult.error_code || '',
      claims: claimsResult.claims || null,
    };
  }

  return {
    ok: true,
    runtime,
    auth: authResult,
    claims: claimsResult.claims || null,
  };
};

const splitText = (value, chunkSize) => {
  const text = String(value || '');
  if (!text) return [''];
  const chunks = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize));
  }
  return chunks;
};

const chunkDocRef = (runtime, collectionName, chunkId) =>
  doc(runtime.db, 'orgs', runtime.orgId, collectionName, chunkId);

const runChunkWrites = async (runtime, operations) => {
  if (!Array.isArray(operations) || operations.length === 0) return;

  let batch = writeBatch(runtime.db);
  let pending = 0;

  const commitBatch = async () => {
    if (pending === 0) return;
    await batch.commit();
    batch = writeBatch(runtime.db);
    pending = 0;
  };

  for (const op of operations) {
    if (op.type === 'set') {
      batch.set(op.ref, op.data, op.options || undefined);
    } else if (op.type === 'delete') {
      batch.delete(op.ref);
    }
    pending += 1;
    if (pending >= BATCH_WRITE_LIMIT) {
      await commitBatch();
    }
  }
  await commitBatch();
};

const deleteChunkRange = async (runtime, chunkCollectionName, chunkPrefix, fromIndex, toIndex) => {
  const start = Math.max(0, Number(fromIndex) || 0);
  const end = Math.max(start, Number(toIndex) || 0);
  if (end <= start) return;

  const ops = [];
  for (let i = start; i < end; i += 1) {
    const chunkId = `${chunkPrefix}__${i}`;
    ops.push({
      type: 'delete',
      ref: chunkDocRef(runtime, chunkCollectionName, chunkId),
    });
  }
  await runChunkWrites(runtime, ops);
};

const writeChunks = async (runtime, chunkCollectionName, chunkPrefix, chunks) => {
  const ops = chunks.map((chunkData, idx) => ({
    type: 'set',
    ref: chunkDocRef(runtime, chunkCollectionName, `${chunkPrefix}__${idx}`),
    data: {
      parent_id: String(chunkPrefix),
      chunk_index: idx,
      chunk_data: String(chunkData || ''),
      updated_at: serverTimestamp(),
    },
  }));
  await runChunkWrites(runtime, ops);
};

const persistPayload = async ({
  runtime,
  headerRef,
  headerData,
  previousHeaderData = null,
  payload,
  chunkCollectionName,
  chunkPrefix,
  inlineField,
  chunkCountField,
  bytesField,
}) => {
  const safePayload = String(payload || '');
  const oldData = previousHeaderData && typeof previousHeaderData === 'object'
    ? previousHeaderData
    : null;
  const resolvedOldData = oldData || ((await getDoc(headerRef).catch(() => null))?.data() || {});
  const oldChunkCount = Number(resolvedOldData?.[chunkCountField] || 0);
  const bytes = safePayload.length;

  if (bytes <= FIRESTORE_INLINE_LIMIT) {
    await setDoc(
      headerRef,
      {
        ...headerData,
        [inlineField]: safePayload,
        [chunkCountField]: 0,
        [bytesField]: bytes,
      },
      { merge: true }
    );
    await deleteChunkRange(runtime, chunkCollectionName, chunkPrefix, 0, oldChunkCount);
    return { ok: true, inline: true, chunk_count: 0, payload_bytes: bytes };
  }

  const chunks = splitText(safePayload, FIRESTORE_CHUNK_SIZE);
  await writeChunks(runtime, chunkCollectionName, chunkPrefix, chunks);

  if (oldChunkCount > chunks.length) {
    await deleteChunkRange(runtime, chunkCollectionName, chunkPrefix, chunks.length, oldChunkCount);
  }

  await setDoc(
    headerRef,
    {
      ...headerData,
      [inlineField]: '',
      [chunkCountField]: chunks.length,
      [bytesField]: bytes,
    },
    { merge: true }
  );

  return { ok: true, inline: false, chunk_count: chunks.length, payload_bytes: bytes };
};

const restorePayload = async ({
  runtime,
  headerData,
  chunkCollectionName,
  chunkPrefix,
  inlineField,
  chunkCountField,
}) => {
  const inline = String(headerData?.[inlineField] || '');
  if (inline) return inline;

  const chunkCount = Number(headerData?.[chunkCountField] || 0);
  if (chunkCount <= 0) return '';

  const refs = Array.from({ length: chunkCount }, (_, idx) =>
    chunkDocRef(runtime, chunkCollectionName, `${chunkPrefix}__${idx}`)
  );
  const snaps = await Promise.all(refs.map((refObj) => getDoc(refObj)));

  let payload = '';
  snaps.forEach((snap) => {
    if (!snap.exists()) return;
    payload += String(snap.data()?.chunk_data || '');
  });
  return payload;
};

const removeChunkedLocalKey = async (baseKey) => {
  try {
    const oldChunkCount = Number(await AsyncStorage.getItem(`${baseKey}_CHUNKS`)) || 0;
    if (oldChunkCount > 0) {
      const keys = Array.from({ length: oldChunkCount }, (_, i) => `${baseKey}_CHUNK_${i}`);
      await AsyncStorage.multiRemove(keys);
    }
  } catch {
    // ignore
  }

  await AsyncStorage.removeItem(`${baseKey}_CHUNKS`).catch(() => {});
  await AsyncStorage.removeItem(baseKey).catch(() => {});
};

const toMillisSafe = (value) => {
  if (!value) return 0;
  if (typeof value?.toMillis === 'function') {
    try {
      return Number(value.toMillis()) || 0;
    } catch {
      return 0;
    }
  }
  if (value instanceof Date) return Number(value.getTime()) || 0;
  if (typeof value === 'number') return Number(value) || 0;
  if (typeof value === 'string') {
    const ts = Date.parse(value);
    return Number.isFinite(ts) ? ts : 0;
  }
  if (typeof value?.seconds === 'number') {
    const nanos = typeof value?.nanoseconds === 'number' ? value.nanoseconds : 0;
    return (Number(value.seconds) * 1000) + Math.round(nanos / 1000000);
  }
  return 0;
};

export const writeArrayToLocalStorageKey = async (key, rows) => {
  const data = Array.isArray(rows) ? rows : [];
  const payload = JSON.stringify(data);

  await removeChunkedLocalKey(key);
  if (payload.length <= LOCAL_CHUNK_SIZE) {
    await AsyncStorage.setItem(key, payload);
    return { ok: true, key, chunked: false, bytes: payload.length };
  }

  const totalChunks = Math.ceil(payload.length / LOCAL_CHUNK_SIZE);
  await AsyncStorage.setItem(`${key}_CHUNKS`, String(totalChunks));
  for (let i = 0; i < totalChunks; i += 1) {
    const part = payload.slice(i * LOCAL_CHUNK_SIZE, (i + 1) * LOCAL_CHUNK_SIZE);
    await AsyncStorage.setItem(`${key}_CHUNK_${i}`, part);
  }

  return { ok: true, key, chunked: true, bytes: payload.length, chunks: totalChunks };
};

export const readArrayFromLocalStorageKey = async (key) => {
  try {
    const chunkCount = Number(await AsyncStorage.getItem(`${key}_CHUNKS`)) || 0;
    if (chunkCount > 0) {
      const chunkKeys = Array.from({ length: chunkCount }, (_, i) => `${key}_CHUNK_${i}`);
      const chunkPairs = await AsyncStorage.multiGet(chunkKeys);
      let full = '';
      chunkPairs.forEach(([, value]) => {
        if (value) full += value;
      });
      if (!full) return [];
      return normalizeArrayData(JSON.parse(full));
    }

    const raw = await AsyncStorage.getItem(key);
    if (!raw) return [];
    return normalizeArrayData(JSON.parse(raw));
  } catch {
    return [];
  }
};

export const layTrangThaiFirebase = () => {
  const state = getFirebaseRuntime();
  if (!state.ok) return { ok: false, reason: state.reason };
  return {
    ok: true,
    org_id: state.orgId,
    project_id: state.projectId,
    mode: state.mode,
    auth_mode: state.authMode || 'anonymous',
    auth_email: state.authEmail || '',
    auth_password_len: String(state.authPassword || '').length,
    claims_policy: 'org_id+role_required',
  };
};

export const kiemTraKetNoiFirebaseThucTe = async ({
  checkWrite = false,
} = {}) => {
  const ready = await ensureFirestoreReady({ requireWrite: !!checkWrite });
  if (!ready.ok) {
    return {
      ok: false,
      stage: ready.stage || 'unknown',
      reason: ready.reason || 'Firebase chưa sẵn sàng.',
      error_code: ready.error_code || '',
      retry_after_ms: ready.retry_after_ms || 0,
    };
  }

  const { runtime, auth } = ready;
  const probeRef = doc(runtime.db, 'orgs', runtime.orgId, 'dvkt_datasets', '_registry');

  try {
    await getDoc(probeRef);
  } catch (error) {
    const mapped = mapFirebaseError(error, 'Đọc thử Firestore thất bại.');
    return {
      ok: false,
      stage: 'read',
      reason: mapped.reason,
      error_code: mapped.code,
      project_id: runtime.projectId,
      org_id: runtime.orgId,
      uid: String(auth?.user?.uid || ''),
      claim_org_id: String(ready?.claims?.org_id || ''),
      claim_role: String(ready?.claims?.role || ''),
    };
  }

  if (checkWrite) {
    try {
      await setDoc(
        doc(runtime.db, 'orgs', runtime.orgId, 'dvkt_datasets', '_sync_probe'),
        {
          dataset_key: '_sync_probe',
          storage_path: `firestore://orgs/${runtime.orgId}/dvkt_datasets/_sync_probe`,
          source: 'connectivity_probe',
          updated_at: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (error) {
      const mapped = mapFirebaseError(error, 'Ghi thử Firestore thất bại.');
      return {
        ok: false,
        stage: 'write',
        reason: mapped.reason,
        error_code: mapped.code,
        project_id: runtime.projectId,
        org_id: runtime.orgId,
        uid: String(auth?.user?.uid || ''),
        claim_org_id: String(ready?.claims?.org_id || ''),
        claim_role: String(ready?.claims?.role || ''),
      };
    }
  }

  return {
    ok: true,
    stage: 'ready',
    project_id: runtime.projectId,
    org_id: runtime.orgId,
    mode: runtime.mode,
    auth_mode: runtime.authMode || 'anonymous',
    uid: String(auth?.user?.uid || ''),
    claim_org_id: String(ready?.claims?.org_id || ''),
    claim_role: String(ready?.claims?.role || ''),
    can_write: !!checkWrite,
  };
};

export const layMetaDatasetFirebase = async ({
  datasetKey,
} = {}) => {
  const ready = await ensureFirestoreReady();
  if (!ready.ok) {
    return {
      ok: false,
      disabled: true,
      exists: false,
      dataset_key: toSafeToken(datasetKey),
      reason: ready.reason || 'Firebase chưa sẵn sàng.',
      error_code: ready.error_code || '',
    };
  }

  const { runtime } = ready;
  const key = toSafeToken(datasetKey);
  try {
    const metaRef = doc(runtime.db, 'orgs', runtime.orgId, 'dvkt_datasets', key);
    const metaSnap = await getDoc(metaRef);
    if (!metaSnap.exists()) {
      return {
        ok: true,
        exists: false,
        dataset_key: key,
        schema_version: 0,
        payload_hash: '',
        content_hash: '',
        row_count: 0,
        payload_bytes: 0,
        chunk_count: 0,
        updated_at_ms: 0,
        updated_by: '',
      };
    }

    const meta = metaSnap.data() || {};
    const payloadHash = String(meta.payload_hash || '');
    const contentHash = String(meta.content_hash || payloadHash || '');
    return {
      ok: true,
      exists: true,
      dataset_key: key,
      schema_version: Number(meta.schema_version) > 0 ? Number(meta.schema_version) : DVKT_DATASET_SCHEMA_VERSION,
      payload_hash: payloadHash,
      content_hash: contentHash,
      row_count: Number(meta.row_count || 0),
      payload_bytes: Number(meta.payload_bytes || 0),
      chunk_count: Number(meta.payload_chunk_count || 0),
      updated_at_ms: toMillisSafe(meta.updated_at),
      updated_by: String(meta.updated_by || ''),
      storage_path: String(meta.storage_path || ''),
    };
  } catch (error) {
    const mapped = mapFirebaseError(error, 'Không đọc được metadata dataset từ Firebase.');
    return {
      ok: false,
      disabled: true,
      exists: false,
      dataset_key: key,
      reason: mapped.reason,
      error_code: mapped.code,
    };
  }
};

export const danhGiaTruocKhiTaiDvktDataset = async (datasetKey) => {
  const key = toSafeToken(datasetKey);
  const [local, remote] = await Promise.all([
    layMetaDatasetCucBo(key),
    layMetaDatasetFirebase({ datasetKey: key }),
  ]);
  if (!remote.ok) {
    return {
      ok: false,
      dataset_key: key,
      reason: remote.reason || 'Không đọc được meta remote.',
      policy: null,
      local,
      remote,
    };
  }
  const policy = danhGiaConflictPolicyTaiXuong({
    local_payload_hash: local.payload_hash,
    synced_payload_hash: local.synced_payload_hash,
    remote_payload_hash: remote.payload_hash,
    remote_exists: remote.exists,
  });
  return {
    ok: true,
    dataset_key: key,
    policy,
    local,
    remote,
  };
};

export const doiSoatDanhSachDatasetVoiFirebase = async ({ datasetKeys = [] } = {}) => {
  const keys = Array.from(new Set((Array.isArray(datasetKeys) ? datasetKeys : [])
    .map((k) => toSafeToken(k || ''))
    .filter(Boolean)));
  const details = await Promise.all(
    keys.map(async (storageKey) => {
      const [localMetaRaw, remoteMetaRaw] = await Promise.all([
        layMetaDatasetCucBo(storageKey),
        layMetaDatasetFirebase({ datasetKey: storageKey }),
      ]);
      const lm = {
        exists: localMetaRaw.exists,
        payload_hash: localMetaRaw.payload_hash,
        row_count: Number(localMetaRaw.row_count || 0),
      };
      const rm = {
        exists: remoteMetaRaw.exists,
        payload_hash: remoteMetaRaw.payload_hash,
        row_count: Number(remoteMetaRaw.row_count || 0),
      };
      const differs =
        rm.exists
        && (lm.row_count !== rm.row_count
          || (!!lm.payload_hash && !!rm.payload_hash && lm.payload_hash !== rm.payload_hash));
      const policy = danhGiaConflictPolicyTaiXuong({
        local_payload_hash: lm.payload_hash,
        synced_payload_hash: localMetaRaw.synced_payload_hash,
        remote_payload_hash: rm.payload_hash,
        remote_exists: rm.exists,
      });
      return {
        storage_key: storageKey,
        differs,
        policy,
        local: lm,
        remote: rm,
      };
    }),
  );
  const differs = details.filter((d) => d.differs);
  const conflict_risk = details.filter((d) => d.policy?.severity === 'conflict');
  return {
    ok: true,
    details,
    differs_count: differs.length,
    differs_keys: differs.map((d) => d.storage_key),
    conflict_risk_count: conflict_risk.length,
    conflict_risk_keys: conflict_risk.map((d) => d.storage_key),
  };
};

const DOC_CONFIG_SYNC_LOCK = 'config_sync_lock';

export const ghiNhatKyAuditConfigSync = async ({
  action = '',
  actor_email = '',
  source = '',
  dataset_summary = [],
  payload = {},
} = {}) => {
  const ready = await ensureFirestoreReady({ requireWrite: true });
  if (!ready.ok) return { ok: false, reason: ready.reason };
  const { runtime, auth } = ready;
  try {
    const col = collection(runtime.db, 'orgs', runtime.orgId, 'audit_config_sync');
    await addDoc(col, {
      action: String(action || ''),
      actor_email: String(actor_email || ''),
      actor_uid: String(auth?.user?.uid || ''),
      source: String(source || ''),
      dataset_summary: Array.isArray(dataset_summary) ? dataset_summary : [],
      extra: payload && typeof payload === 'object' ? payload : {},
      schema_registry_version: DVKT_DATASET_SCHEMA_VERSION,
      created_at: serverTimestamp(),
    });
    return { ok: true };
  } catch (error) {
    const mapped = mapFirebaseError(error, 'Không ghi được nhật ký audit.');
    return { ok: false, reason: mapped.reason };
  }
};

export const thuPhienDongBoCauHinh = async ({
  ttlMs = 15 * 60 * 1000,
  actor_email = '',
} = {}) => {
  const ready = await ensureFirestoreReady({ requireWrite: true });
  if (!ready.ok) return { ok: false, reason: ready.reason };
  const { runtime, auth } = ready;
  const uid = String(auth?.user?.uid || '');
  if (!uid) return { ok: false, reason: 'Thiếu UID Firebase để khóa phiên đồng bộ.' };
  const lockRef = doc(runtime.db, 'orgs', runtime.orgId, 'system_config', DOC_CONFIG_SYNC_LOCK);
  const now = Date.now();
  const expiresAt = now + Math.max(60_000, Number(ttlMs) || 0);

  try {
    let blocked = false;
    let holder = '';
    await runTransaction(runtime.db, async (transaction) => {
      const snap = await transaction.get(lockRef);
      const data = snap.exists() ? (snap.data() || {}) : {};
      const exp = Number(data.lock_expires_at_ms || 0);
      holder = String(data.lock_holder_uid || '');
      if (holder && holder !== uid && exp > now) {
        blocked = true;
        return;
      }
      transaction.set(lockRef, {
        lock_holder_uid: uid,
        lock_holder_email: String(actor_email || ''),
        lock_expires_at_ms: expiresAt,
        lock_acquired_at_ms: now,
        updated_at: serverTimestamp(),
      }, { merge: true });
    });
    if (blocked) {
      return {
        ok: false,
        reason: `Khóa đồng bộ đang giữ bởi phiên khác (${holder || 'unknown'}). Chờ hết TTL hoặc nhả khóa từ máy đã chiếm.`,
        code: 'config_sync_lock_held',
      };
    }
    return { ok: true, expires_at_ms: expiresAt };
  } catch (error) {
    const mapped = mapFirebaseError(error, 'Không chiếm được khóa đồng bộ.');
    return { ok: false, reason: mapped.reason, error_code: mapped.code };
  }
};

export const giangPhienDongBoCauHinh = async () => {
  const ready = await ensureFirestoreReady({ requireWrite: true });
  if (!ready.ok) return { ok: false, reason: ready.reason };
  const { runtime, auth } = ready;
  const uid = String(auth?.user?.uid || '');
  const lockRef = doc(runtime.db, 'orgs', runtime.orgId, 'system_config', DOC_CONFIG_SYNC_LOCK);
  try {
    await runTransaction(runtime.db, async (transaction) => {
      const snap = await transaction.get(lockRef);
      if (!snap.exists()) return;
      const data = snap.data() || {};
      const h = String(data.lock_holder_uid || '');
      if (h && h !== uid) return;
      transaction.set(lockRef, {
        lock_holder_uid: '',
        lock_holder_email: '',
        lock_expires_at_ms: 0,
        lock_released_at_ms: Date.now(),
        updated_at: serverTimestamp(),
      }, { merge: true });
    });
    return { ok: true };
  } catch (error) {
    const mapped = mapFirebaseError(error, 'Không nhả khóa đồng bộ.');
    return { ok: false, reason: mapped.reason };
  }
};

const DATASET_BAT_BUOC_MAC_DINH = [
  'CDSS_DATA_LUAT_DU_LIEU',
  'CDSS_DATA_LUAT_THUOC',
  'CDSS_DATA_LUAT_PTTT',
  'CDSS_DATA_LUAT_CDHA',
  'DANH_MUC_DVKT_M05',
  'DANH_MUC_TRANG_THIET_BI_M06',
  'DANH_MUC_NHAN_SU',
  'DANH_MUC_MAPPING_NGUOI_HANH_NGHE',
];

const DATASET_ALIAS_MAP = {
  CDSS_DATA_LUAT_DU_LIEU: ['CDSS_DATA_XML_DATA'],
  DANH_MUC_DVKT_M05: ['DVKT_DMKT'],
  DANH_MUC_TRANG_THIET_BI_M06: ['DVKT_EQUIPMENT'],
  DANH_MUC_NHAN_SU: ['DVKT_STAFF'],
  DANH_MUC_MAPPING_NGUOI_HANH_NGHE: ['DVKT_SERVICE_PRACTITIONER_MAP'],
  CDSS_DATA_LUAT_CDHA: ['DVKT_RULES'],
};

export const kiemTraDanhMucQuyTacFirebase = async ({
  requiredDatasetKeys = DATASET_BAT_BUOC_MAC_DINH,
} = {}) => {
  const ready = await ensureFirestoreReady();
  if (!ready.ok) {
    return {
      ok: false,
      stage: ready.stage || 'unknown',
      reason: ready.reason || 'Firebase chưa sẵn sàng.',
      error_code: ready.error_code || '',
      checked_count: 0,
      missing_count: 0,
      details: [],
    };
  }

  const { runtime, auth } = ready;
  const logicalKeys = Array.from(new Set((Array.isArray(requiredDatasetKeys) ? requiredDatasetKeys : [])
    .map((k) => toSafeToken(k || ''))
    .filter(Boolean)));

  try {
    const details = await Promise.all(logicalKeys.map(async (logicalKey) => {
      const aliasKeys = Array.isArray(DATASET_ALIAS_MAP[logicalKey]) ? DATASET_ALIAS_MAP[logicalKey] : [];
      const candidateKeys = Array.from(new Set([logicalKey, ...aliasKeys].map((k) => toSafeToken(k || '')).filter(Boolean)));

      let matchedKey = '';
      let matchedData = null;
      for (const key of candidateKeys) {
        const ref = doc(runtime.db, 'orgs', runtime.orgId, 'dvkt_datasets', key);
        const snap = await getDoc(ref);
        if (!snap.exists()) continue;
        matchedKey = key;
        matchedData = snap.data() || {};
        break;
      }

      if (!matchedKey) {
        return {
          dataset_key: logicalKey,
          matched_key: '',
          checked_keys: candidateKeys,
          exists: false,
          row_count: 0,
          payload_bytes: 0,
          chunk_count: 0,
          updated_at: null,
        };
      }

      return {
        dataset_key: logicalKey,
        matched_key: matchedKey,
        checked_keys: candidateKeys,
        exists: true,
        row_count: Number(matchedData?.row_count || 0),
        payload_bytes: Number(matchedData?.payload_bytes || 0),
        chunk_count: Number(matchedData?.payload_chunk_count || 0),
        updated_at: matchedData?.updated_at || null,
      };
    }));

    const missing = details.filter((d) => !d.exists).map((d) => d.dataset_key);
    const present = details.filter((d) => d.exists).map((d) => d.dataset_key);

    return {
      ok: missing.length === 0,
      stage: 'dataset_check',
      project_id: runtime.projectId,
      org_id: runtime.orgId,
      uid: String(auth?.user?.uid || ''),
      checked_count: details.length,
      present_count: present.length,
      missing_count: missing.length,
      present_keys: present,
      missing_keys: missing,
      details,
    };
  } catch (error) {
    const mapped = mapFirebaseError(error, 'Không thể kiểm tra danh mục/quy tắc trên Firebase.');
    return {
      ok: false,
      stage: 'dataset_check',
      reason: mapped.reason,
      error_code: mapped.code,
      project_id: runtime.projectId,
      org_id: runtime.orgId,
      uid: String(auth?.user?.uid || ''),
      checked_count: logicalKeys.length,
      missing_count: 0,
      details: [],
    };
  }
};

const layParentIdTuChunk = (chunkId, chunkData) => {
  const parentId = String(chunkData?.parent_id || '').trim();
  if (parentId) return parentId;
  const id = String(chunkId || '');
  const pos = id.indexOf('__');
  return pos > 0 ? id.slice(0, pos) : id;
};

const scanChunkMoCoiDvkt = async (runtime, maxDetailItems = 200) => {
  const headerSnap = await getDocs(collection(runtime.db, 'orgs', runtime.orgId, 'dvkt_datasets'));
  const validParentIds = new Set();
  headerSnap.forEach((snap) => {
    if (!snap.exists()) return;
    validParentIds.add(String(snap.id || ''));
  });

  const chunkSnap = await getDocs(collection(runtime.db, 'orgs', runtime.orgId, 'dvkt_dataset_chunks'));
  const orphanRefs = [];
  const byParentMap = new Map();
  const details = [];

  chunkSnap.forEach((snap) => {
    if (!snap.exists()) return;
    const data = snap.data() || {};
    const parentId = layParentIdTuChunk(snap.id, data);
    if (!parentId || validParentIds.has(parentId)) return;

    orphanRefs.push(snap.ref);
    byParentMap.set(parentId, Number(byParentMap.get(parentId) || 0) + 1);
    if (details.length < maxDetailItems) {
      details.push({
        chunk_id: snap.id,
        parent_id: parentId,
        chunk_index: Number(data.chunk_index || 0),
      });
    }
  });

  const byParent = Array.from(byParentMap.entries())
    .map(([parent_id, chunk_count]) => ({ parent_id, chunk_count }))
    .sort((a, b) => b.chunk_count - a.chunk_count || String(a.parent_id).localeCompare(String(b.parent_id)));

  return {
    valid_parent_count: validParentIds.size,
    total_chunk_count: chunkSnap.size,
    orphan_count: orphanRefs.length,
    orphan_parent_count: byParent.length,
    by_parent: byParent,
    details,
    orphan_refs: orphanRefs,
  };
};

export const kiemTraChunkMoCoiDvktFirebase = async ({
  maxDetailItems = 200,
} = {}) => {
  const ready = await ensureFirestoreReady();
  if (!ready.ok) {
    return {
      ok: false,
      stage: ready.stage || 'unknown',
      reason: ready.reason || 'Firebase chưa sẵn sàng.',
      error_code: ready.error_code || '',
    };
  }

  const { runtime, auth } = ready;
  try {
    const scan = await scanChunkMoCoiDvkt(runtime, maxDetailItems);
    return {
      ok: true,
      stage: 'chunk_orphan_check',
      project_id: runtime.projectId,
      org_id: runtime.orgId,
      uid: String(auth?.user?.uid || ''),
      ...scan,
    };
  } catch (error) {
    const mapped = mapFirebaseError(error, 'Không thể kiểm tra chunk mồ côi trên Firebase.');
    return {
      ok: false,
      stage: 'chunk_orphan_check',
      reason: mapped.reason,
      error_code: mapped.code,
      project_id: runtime.projectId,
      org_id: runtime.orgId,
      uid: String(auth?.user?.uid || ''),
    };
  }
};

export const donDepChunkMoCoiDvktFirebase = async ({
  dryRun = true,
  maxDelete = 20000,
  maxDetailItems = 200,
} = {}) => {
  const ready = await ensureFirestoreReady({ requireWrite: !dryRun });
  if (!ready.ok) {
    return {
      ok: false,
      stage: ready.stage || 'unknown',
      reason: ready.reason || 'Firebase chưa sẵn sàng.',
      error_code: ready.error_code || '',
    };
  }

  const { runtime, auth } = ready;
  try {
    const scan = await scanChunkMoCoiDvkt(runtime, maxDetailItems);
    if (dryRun) {
      return {
        ok: true,
        stage: 'chunk_orphan_cleanup',
        dry_run: true,
        deleted_count: 0,
        ...scan,
        project_id: runtime.projectId,
        org_id: runtime.orgId,
        uid: String(auth?.user?.uid || ''),
      };
    }

    const limitDelete = Math.max(0, Number(maxDelete) || 0);
    const refsToDelete = scan.orphan_refs.slice(0, limitDelete);
    let deletedCount = 0;

    for (let i = 0; i < refsToDelete.length; i += BATCH_WRITE_LIMIT) {
      const batch = writeBatch(runtime.db);
      refsToDelete.slice(i, i + BATCH_WRITE_LIMIT).forEach((ref) => batch.delete(ref));
      await batch.commit();
      deletedCount += Math.min(BATCH_WRITE_LIMIT, refsToDelete.length - i);
    }

    return {
      ok: true,
      stage: 'chunk_orphan_cleanup',
      dry_run: false,
      requested_delete: refsToDelete.length,
      deleted_count: deletedCount,
      remaining_orphan_count: Math.max(0, scan.orphan_count - deletedCount),
      total_chunk_count: scan.total_chunk_count,
      orphan_parent_count: scan.orphan_parent_count,
      by_parent: scan.by_parent,
      details: scan.details,
      project_id: runtime.projectId,
      org_id: runtime.orgId,
      uid: String(auth?.user?.uid || ''),
    };
  } catch (error) {
    const mapped = mapFirebaseError(error, 'Không thể dọn chunk mồ côi trên Firebase.');
    return {
      ok: false,
      stage: 'chunk_orphan_cleanup',
      reason: mapped.reason,
      error_code: mapped.code,
      project_id: runtime.projectId,
      org_id: runtime.orgId,
      uid: String(auth?.user?.uid || ''),
    };
  }
};

export const taiTaiLieuXmlLenFirebase = async ({
  maLk,
  fileName,
  rawXml,
  sizeByte = 0,
  uploader = '',
  metadata = {},
}) => {
  const ready = await ensureFirestoreReady({ requireWrite: true });
  if (!ready.ok) return { ok: false, disabled: true, reason: ready.reason };
  const { runtime } = ready;
  if (!rawXml || typeof rawXml !== 'string') return { ok: false, reason: 'Noi dung XML trong.' };

  try {
    const docId = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const docRef = doc(runtime.db, 'orgs', runtime.orgId, 'claim_documents', docId);
    const storagePath = `firestore://orgs/${runtime.orgId}/claim_documents/${docId}`;

    const persisted = await persistPayload({
      runtime,
      headerRef: docRef,
      headerData: {
        doc_id: docId,
        ma_lk: String(maLk || ''),
        file_name: String(fileName || ''),
        file_size: Number(sizeByte || 0),
        storage_path: storagePath,
        download_url: '',
        uploaded_by: String(uploader || ''),
        uploaded_at: serverTimestamp(),
        metadata: metadata && typeof metadata === 'object' ? metadata : {},
      },
      payload: rawXml,
      chunkCollectionName: 'claim_document_chunks',
      chunkPrefix: docId,
      inlineField: 'raw_xml_inline',
      chunkCountField: 'raw_xml_chunk_count',
      bytesField: 'raw_xml_bytes',
    });

    return {
      ok: true,
      doc_id: docId,
      storage_path: storagePath,
      download_url: '',
      chunk_count: persisted.chunk_count,
    };
  } catch (error) {
    const mapped = mapFirebaseError(error, 'Không tải lên Firebase được.');
    return { ok: false, reason: mapped.reason, error_code: mapped.code };
  }
};

export const lietKeTaiLieuXmlFirebase = async ({
  maLk = '',
  limitCount = 20,
} = {}) => {
  const ready = await ensureFirestoreReady();
  if (!ready.ok) return { ok: false, disabled: true, reason: ready.reason, documents: [] };
  const { runtime } = ready;

  try {
    const collectionRef = collection(runtime.db, 'orgs', runtime.orgId, 'claim_documents');
    const fetchLimit = Math.max(1, Math.min(200, Number(limitCount) || 20));
    const snap = await getDocs(query(collectionRef, orderBy('uploaded_at', 'desc'), fsLimit(fetchLimit * 3)));
    const filterMaLk = String(maLk || '').trim();

    const documents = [];
    snap.forEach((docSnap) => {
      if (!docSnap.exists()) return;
      const data = docSnap.data() || {};
      const itemMaLk = String(data.ma_lk || '').trim();
      if (filterMaLk && itemMaLk !== filterMaLk) return;
      documents.push({
        doc_id: docSnap.id,
        ma_lk: itemMaLk,
        file_name: String(data.file_name || ''),
        file_size: Number(data.file_size || 0),
        uploaded_by: String(data.uploaded_by || ''),
        uploaded_at: data.uploaded_at || null,
        raw_xml_chunk_count: Number(data.raw_xml_chunk_count || 0),
      });
    });

    return {
      ok: true,
      total_count: documents.length,
      documents: documents.slice(0, fetchLimit),
    };
  } catch (error) {
    const mapped = mapFirebaseError(error, 'Không liệt kê được tài liệu XML trên Firebase.');
    return { ok: false, reason: mapped.reason, error_code: mapped.code, documents: [] };
  }
};

export const taiNoiDungTaiLieuXmlFirebase = async ({
  docId,
} = {}) => {
  const ready = await ensureFirestoreReady();
  if (!ready.ok) return { ok: false, disabled: true, reason: ready.reason };
  const { runtime } = ready;
  const safeDocId = toSafeToken(docId || '');
  if (!safeDocId) return { ok: false, reason: 'Thiếu docId.' };

  try {
    const docRef = doc(runtime.db, 'orgs', runtime.orgId, 'claim_documents', safeDocId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return { ok: false, reason: `Không tìm thấy tài liệu XML [${safeDocId}].` };

    const meta = snap.data() || {};
    const payloadRaw = await restorePayload({
      runtime,
      headerData: meta,
      chunkCollectionName: 'claim_document_chunks',
      chunkPrefix: safeDocId,
      inlineField: 'raw_xml_inline',
      chunkCountField: 'raw_xml_chunk_count',
    });
    if (!payloadRaw) return { ok: false, reason: `Tài liệu XML [${safeDocId}] không có nội dung.` };

    return {
      ok: true,
      document: {
        doc_id: safeDocId,
        ma_lk: String(meta.ma_lk || ''),
        file_name: String(meta.file_name || ''),
        file_size: Number(meta.file_size || 0),
        uploaded_by: String(meta.uploaded_by || ''),
        uploaded_at: meta.uploaded_at || null,
      },
      raw_xml: payloadRaw,
    };
  } catch (error) {
    const mapped = mapFirebaseError(error, 'Không tải được nội dung XML từ Firebase.');
    return { ok: false, reason: mapped.reason, error_code: mapped.code };
  }
};

export const taiHoSoXmlTuFirebase = async ({
  maLk = '',
  limitCount = 10,
} = {}) => {
  const listed = await lietKeTaiLieuXmlFirebase({ maLk, limitCount });
  if (!listed?.ok) return { ok: false, reason: listed?.reason || 'Không lấy được danh sách XML.', documents: [] };
  if (!Array.isArray(listed.documents) || listed.documents.length === 0) {
    return { ok: false, reason: 'Không có dữ liệu XML phù hợp trên Firebase.', documents: [] };
  }

  const loaded = await Promise.all(
    listed.documents.map(async (item) => {
      const res = await taiNoiDungTaiLieuXmlFirebase({ docId: item.doc_id });
      if (!res?.ok) {
        return {
          ok: false,
          doc_id: item.doc_id,
          reason: res?.reason || 'Không tải được XML',
        };
      }
      return {
        ok: true,
        ...res.document,
        raw_xml: res.raw_xml,
      };
    })
  );

  const documents = loaded.filter((x) => x.ok);
  const failed = loaded.filter((x) => !x.ok);

  return {
    ok: documents.length > 0,
    requested_count: listed.documents.length,
    loaded_count: documents.length,
    failed_count: failed.length,
    documents,
    failed,
  };
};

export const dongBoDanhSachXmlLenFirebase = async ({
  documents = [],
  uploader = '',
} = {}) => {
  const items = Array.isArray(documents) ? documents : [];
  if (items.length === 0) {
    return { ok: false, reason: 'Không có XML để đồng bộ.', uploaded_count: 0, total_count: 0, details: [] };
  }

  const details = await Promise.all(
    items.map(async (item, index) => {
      const maLk = String(item?.ma_lk || item?.maLk || '').trim();
      const fileName = String(item?.file_name || item?.fileName || `xml_${index + 1}.xml`);
      const rawXml = String(item?.raw_xml || item?.rawXml || '');
      const sizeByte = Number(item?.file_size || item?.sizeByte || rawXml.length || 0);
      const result = await taiTaiLieuXmlLenFirebase({
        maLk,
        fileName,
        rawXml,
        sizeByte,
        uploader,
        metadata: item?.metadata || {},
      });
      return {
        ok: !!result?.ok,
        ma_lk: maLk,
        file_name: fileName,
        reason: result?.reason || '',
      };
    })
  );

  const uploadedCount = details.filter((x) => x.ok).length;
  return {
    ok: uploadedCount > 0,
    uploaded_count: uploadedCount,
    total_count: items.length,
    details,
  };
};

export const syncDvktTablesToFirebase = async ({
  datasetMap = {},
  uploader = '',
  source = 'manual_sync',
  onlyChanged = true,
}) => {
  const ready = await ensureFirestoreReady({ requireWrite: true });
  if (!ready.ok) return { ok: false, disabled: true, reason: ready.reason, details: [] };
  const { runtime } = ready;

  const entries = Object.entries(datasetMap || {});
  const details = [];
  let uploaded = 0;
  let skipped = 0;

  for (const [datasetKeyRaw, rowsRaw] of entries) {
    const datasetKey = toSafeToken(datasetKeyRaw);
    const rows = Array.isArray(rowsRaw) ? rowsRaw : [];

    try {
      const payload = JSON.stringify(rows);
      const datasetRef = doc(runtime.db, 'orgs', runtime.orgId, 'dvkt_datasets', datasetKey);
      const storagePath = `firestore://orgs/${runtime.orgId}/dvkt_datasets/${datasetKey}`;
      const payloadHash = fastHash(payload);
      const currentMetaSnap = await getDoc(datasetRef).catch(() => null);
      const currentMeta = currentMetaSnap?.exists() ? (currentMetaSnap.data() || {}) : {};
      const currentHash = String(currentMeta.payload_hash || '');

      if (onlyChanged && currentHash && currentHash === payloadHash) {
        details.push({
          dataset_key: datasetKey,
          ok: true,
          skipped: true,
          row_count: rows.length,
          payload_bytes: payload.length,
          chunk_count: Number(currentMeta.payload_chunk_count || 0),
        });
        skipped += 1;
        await capNhatMetaDatasetCucBoTheoRows(datasetKey, rows, { markSynced: true });
        continue;
      }

      const persisted = await persistPayload({
        runtime,
        headerRef: datasetRef,
        headerData: {
          dataset_key: datasetKey,
          storage_path: storagePath,
          download_url: '',
          row_count: rows.length,
          payload_hash: payloadHash,
          content_hash: payloadHash,
          schema_version: DVKT_DATASET_SCHEMA_VERSION,
          source: String(source || 'manual_sync'),
          updated_by: String(uploader || ''),
          updated_at: serverTimestamp(),
        },
        previousHeaderData: currentMeta,
        payload,
        chunkCollectionName: 'dvkt_dataset_chunks',
        chunkPrefix: datasetKey,
        inlineField: 'payload_inline',
        chunkCountField: 'payload_chunk_count',
        bytesField: 'payload_bytes',
      });

      details.push({
        dataset_key: datasetKey,
        ok: true,
        row_count: rows.length,
        skipped: false,
        payload_hash: payloadHash,
        payload_bytes: persisted.payload_bytes,
        chunk_count: persisted.chunk_count,
      });
      uploaded += 1;
      await capNhatMetaDatasetCucBoTheoRows(datasetKey, rows, { markSynced: true });
    } catch (error) {
      const mapped = mapFirebaseError(error, 'Tải lên thất bại.');
      details.push({ dataset_key: datasetKey, ok: false, reason: mapped.reason, error_code: mapped.code });
    }
  }

  await setDoc(
    doc(runtime.db, 'orgs', runtime.orgId, 'dvkt_datasets', '_registry'),
    {
      dataset_count: entries.length,
      uploaded_count: uploaded,
      updated_by: String(uploader || ''),
      updated_at: serverTimestamp(),
      source: String(source || 'manual_sync'),
      storage_mode: 'firestore_only',
      schema_registry_version: DVKT_DATASET_SCHEMA_VERSION,
    },
    { merge: true }
  ).catch(() => {});

  return {
    ok: (uploaded + skipped) > 0,
    uploaded_count: uploaded,
    skipped_count: skipped,
    processed_count: uploaded + skipped,
    total_count: entries.length,
    details,
  };
};

export const hydrateDvktTableFromFirebase = async ({
  datasetKey,
  persistLocal = true,
  localKey = '',
}) => {
  const ready = await ensureFirestoreReady();
  if (!ready.ok) return { ok: false, disabled: true, reason: ready.reason, data: [] };
  const { runtime } = ready;

  const key = toSafeToken(datasetKey);
  try {
    const metaRef = doc(runtime.db, 'orgs', runtime.orgId, 'dvkt_datasets', key);
    const metaSnap = await getDoc(metaRef);
    if (!metaSnap.exists()) {
      return { ok: false, reason: `Không tìm thấy dataset [${key}] trên Firebase.`, data: [] };
    }

    const meta = metaSnap.data() || {};
    const remoteHash = String(meta.payload_hash || '');
    const targetLocalKey = localKey || datasetKey;

    if (persistLocal && remoteHash) {
      const cachedMeta = await readLocalDatasetMeta(key);
      if (cachedMeta?.payload_hash && cachedMeta.payload_hash === remoteHash) {
        const localData = await readArrayFromLocalStorageKey(targetLocalKey);
        if (Array.isArray(localData) && (localData.length > 0 || Number(meta.row_count || 0) === 0)) {
          return {
            ok: true,
            dataset_key: key,
            row_count: localData.length,
            data: localData,
            storage_path: String(meta.storage_path || `firestore://orgs/${runtime.orgId}/dvkt_datasets/${key}`),
            from_cache: true,
          };
        }
      }
    }

    const payloadRaw = await restorePayload({
      runtime,
      headerData: meta,
      chunkCollectionName: 'dvkt_dataset_chunks',
      chunkPrefix: key,
      inlineField: 'payload_inline',
      chunkCountField: 'payload_chunk_count',
    });
    if (!payloadRaw) {
      return { ok: false, reason: `Dataset [${key}] không có nội dung payload.`, data: [] };
    }

    const parsed = JSON.parse(payloadRaw);
    const data = normalizeArrayData(parsed);

    if (persistLocal) {
      await writeArrayToLocalStorageKey(targetLocalKey, data);
      await capNhatMetaDatasetCucBoTheoRows(key, data, { markSynced: true });
    }

    return {
      ok: true,
      dataset_key: key,
      row_count: data.length,
      data,
      storage_path: String(meta.storage_path || `firestore://orgs/${runtime.orgId}/dvkt_datasets/${key}`),
      from_cache: false,
    };
  } catch (error) {
    const mapped = mapFirebaseError(error, 'Không tải được dataset từ Firebase.');
    return { ok: false, reason: mapped.reason, error_code: mapped.code, data: [] };
  }
};

export const taiKetQuaGiamDinhLenFirebase = async (record) => {
  const ready = await ensureFirestoreReady({ requireWrite: true });
  if (!ready.ok) return { ok: false, disabled: true, reason: ready.reason };
  const { runtime } = ready;

  try {
    const payload = record && typeof record === 'object' ? record : {};
    const claimId = toSafeToken(payload.claim_id || 'unknown_claim');
    const timestamp = Date.now();
    const docId = `${claimId}_${timestamp}`;
    const docRef = doc(runtime.db, 'orgs', runtime.orgId, 'claim_results', docId);
    const storagePath = `firestore://orgs/${runtime.orgId}/claim_results/${docId}`;

    const persisted = await persistPayload({
      runtime,
      headerRef: docRef,
      headerData: {
        claim_id: String(payload.claim_id || ''),
        total_lines: Number(payload.total_lines || 0),
        pass: Number(payload.pass || 0),
        warnings: Number(payload.warnings || 0),
        rejects: Number(payload.rejects || 0),
        storage_path: storagePath,
        download_url: '',
        created_at: serverTimestamp(),
      },
      payload: JSON.stringify(payload),
      chunkCollectionName: 'claim_result_chunks',
      chunkPrefix: docId,
      inlineField: 'payload_inline',
      chunkCountField: 'payload_chunk_count',
      bytesField: 'payload_bytes',
    });

    return {
      ok: true,
      storage_path: storagePath,
      download_url: '',
      chunk_count: persisted.chunk_count,
    };
  } catch (error) {
    const mapped = mapFirebaseError(error, 'Không tải kết quả kiểm tra lên Firebase được.');
    return { ok: false, reason: mapped.reason, error_code: mapped.code };
  }
};
