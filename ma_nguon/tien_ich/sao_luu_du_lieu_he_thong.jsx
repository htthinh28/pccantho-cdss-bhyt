import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const BACKUP_INDEX_KEY = 'CDSS_BACKUP_INDEX_V1';
const BACKUP_META_PREFIX = 'CDSS_BACKUP_META_';
const BACKUP_DATA_PREFIX = 'CDSS_BACKUP_DATA_';
const BACKUP_CHUNK_SIZE = 350000;
const MAX_SNAPSHOT_KEEP = 12;
const NULL_SENTINEL = '__CDSS_BACKUP_NULL__';

const DEFAULT_KEY_PREFIXES = [
  'CDSS_DATA_',
  'CDSS_COLS_',
  'COLS_',
  'DANH_MUC_',
  'BYT_7603_',
  'DVKT_',
  'DATA_XML',
  'KHO_XML_',
  'SESSION_DOC_XML_',
  'TAB_DANG_MO',
];

const WEB_EXPORT_VERSION = 1;

const toSafeJson = (raw, fallback) => {
  try {
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const nowIso = () => new Date().toISOString();

const getLocalStorageRef = () => {
  if (Platform.OS !== 'web') return null;
  return globalThis?.localStorage || null;
};

const uniq = (arr) => Array.from(new Set(Array.isArray(arr) ? arr : []));

const matchesPrefixes = (key, prefixes) => prefixes.some((p) => key === p || key.startsWith(p));

const isBackupInternalKey = (key) =>
  key === BACKUP_INDEX_KEY
  || key.startsWith(BACKUP_META_PREFIX)
  || key.startsWith(BACKUP_DATA_PREFIX);

const getManagedKeys = async ({ keyPrefixes = DEFAULT_KEY_PREFIXES, includeKeys = [] } = {}) => {
  const prefixes = uniq([...(keyPrefixes || []), ...(includeKeys || [])]).filter(Boolean);
  const asyncKeysRaw = await AsyncStorage.getAllKeys().catch(() => []);
  const asyncKeys = asyncKeysRaw.filter((k) => !isBackupInternalKey(k) && matchesPrefixes(k, prefixes));

  const localRef = getLocalStorageRef();
  const localKeys = localRef
    ? Object.keys(localRef).filter((k) => !isBackupInternalKey(k) && matchesPrefixes(k, prefixes))
    : [];

  return { asyncKeys: uniq(asyncKeys), localKeys: uniq(localKeys), prefixes };
};

const docManagedValues = async ({ keyPrefixes = DEFAULT_KEY_PREFIXES, includeKeys = [] } = {}) => {
  const { asyncKeys, localKeys, prefixes } = await getManagedKeys({ keyPrefixes, includeKeys });
  const localRef = getLocalStorageRef();

  const asyncData = {};
  const localData = {};

  for (const key of asyncKeys) {
    asyncData[key] = await AsyncStorage.getItem(key);
  }
  if (localRef) {
    localKeys.forEach((key) => {
      localData[key] = localRef.getItem(key);
    });
  }

  return {
    prefixes,
    asyncData,
    localData,
    async_count: asyncKeys.length,
    local_count: localKeys.length,
  };
};

export const xuatDuLieuHeThongRaFileJsonWeb = async ({
  reason = 'MANUAL_EXPORT_JSON',
  keyPrefixes = DEFAULT_KEY_PREFIXES,
  includeKeys = [],
} = {}) => {
  const localRef = getLocalStorageRef();
  if (!localRef) {
    return { ok: false, message: 'Chức năng export JSON chỉ hỗ trợ trên web.' };
  }

  const payloadData = await docManagedValues({ keyPrefixes, includeKeys });
  const payload = {
    version: WEB_EXPORT_VERSION,
    exported_at: nowIso(),
    reason,
    prefixes: payloadData.prefixes,
    include_keys: includeKeys,
    async_data: payloadData.asyncData,
    local_data: payloadData.localData,
  };

  const fileName = `CDSS_EXPORT_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
  const blob = new Blob([JSON.stringify(payload)], { type: 'application/json;charset=utf-8' });
  const href = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = href;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(href);

  return {
    ok: true,
    file_name: fileName,
    async_count: payloadData.async_count,
    local_count: payloadData.local_count,
  };
};

export const phucHoiDuLieuHeThongTuJsonText = async (jsonText, {
  xoaKhoaMoiKhongCoTrongBanSao = true,
} = {}) => {
  const parsed = toSafeJson(jsonText, null);
  if (!parsed || typeof parsed !== 'object') {
    return { ok: false, message: 'File JSON không hợp lệ.' };
  }

  const asyncData = parsed.async_data && typeof parsed.async_data === 'object' ? parsed.async_data : {};
  const localData = parsed.local_data && typeof parsed.local_data === 'object' ? parsed.local_data : {};
  const prefixes = Array.isArray(parsed.prefixes) && parsed.prefixes.length > 0 ? parsed.prefixes : DEFAULT_KEY_PREFIXES;
  const includeKeys = Array.isArray(parsed.include_keys) ? parsed.include_keys : [];
  const localRef = getLocalStorageRef();

  if (xoaKhoaMoiKhongCoTrongBanSao) {
    const managed = await getManagedKeys({ keyPrefixes: prefixes, includeKeys });
    const asyncSet = new Set(Object.keys(asyncData));
    const localSet = new Set(Object.keys(localData));

    for (const k of managed.asyncKeys) {
      if (!asyncSet.has(k)) await AsyncStorage.removeItem(k);
    }
    if (localRef) {
      for (const k of managed.localKeys) {
        if (!localSet.has(k)) localRef.removeItem(k);
      }
    }
  }

  let restoredAsync = 0;
  let restoredLocal = 0;

  for (const [key, value] of Object.entries(asyncData)) {
    if (value === null || value === undefined) await AsyncStorage.removeItem(key);
    else await AsyncStorage.setItem(key, String(value));
    restoredAsync += 1;
  }

  if (localRef) {
    for (const [key, value] of Object.entries(localData)) {
      if (value === null || value === undefined) localRef.removeItem(key);
      else localRef.setItem(key, String(value));
      restoredLocal += 1;
    }
  }

  return {
    ok: true,
    restored_async: restoredAsync,
    restored_local: restoredLocal,
  };
};

const writeLargeValue = async (baseKey, valueRaw) => {
  const value = valueRaw === null || valueRaw === undefined ? NULL_SENTINEL : String(valueRaw);
  const oldChunks = Number(await AsyncStorage.getItem(`${baseKey}_CHUNKS`)) || 0;
  for (let i = 0; i < oldChunks; i += 1) {
    await AsyncStorage.removeItem(`${baseKey}_CHUNK_${i}`);
  }
  await AsyncStorage.removeItem(`${baseKey}_CHUNKS`);
  await AsyncStorage.removeItem(baseKey);

  if (value.length <= BACKUP_CHUNK_SIZE) {
    await AsyncStorage.setItem(baseKey, value);
    return;
  }

  const total = Math.ceil(value.length / BACKUP_CHUNK_SIZE);
  await AsyncStorage.setItem(`${baseKey}_CHUNKS`, String(total));
  for (let i = 0; i < total; i += 1) {
    const part = value.slice(i * BACKUP_CHUNK_SIZE, (i + 1) * BACKUP_CHUNK_SIZE);
    await AsyncStorage.setItem(`${baseKey}_CHUNK_${i}`, part);
  }
};

const readLargeValue = async (baseKey) => {
  const chunkCount = Number(await AsyncStorage.getItem(`${baseKey}_CHUNKS`)) || 0;
  if (chunkCount > 0) {
    let full = '';
    for (let i = 0; i < chunkCount; i += 1) {
      const part = await AsyncStorage.getItem(`${baseKey}_CHUNK_${i}`);
      if (part) full += part;
    }
    return full;
  }
  return AsyncStorage.getItem(baseKey);
};

const removeLargeValue = async (baseKey) => {
  const chunkCount = Number(await AsyncStorage.getItem(`${baseKey}_CHUNKS`)) || 0;
  for (let i = 0; i < chunkCount; i += 1) {
    await AsyncStorage.removeItem(`${baseKey}_CHUNK_${i}`);
  }
  await AsyncStorage.removeItem(`${baseKey}_CHUNKS`);
  await AsyncStorage.removeItem(baseKey);
};

const getBackupIndex = async () => {
  const raw = await AsyncStorage.getItem(BACKUP_INDEX_KEY);
  const parsed = toSafeJson(raw, { items: [] });
  if (!Array.isArray(parsed.items)) parsed.items = [];
  return parsed;
};

const setBackupIndex = async (indexObj) => {
  await AsyncStorage.setItem(BACKUP_INDEX_KEY, JSON.stringify(indexObj || { items: [] }));
};

const getBackupMetaKey = (snapshotId) => `${BACKUP_META_PREFIX}${snapshotId}`;

const deleteSnapshotInternal = async (snapshotId, shouldUpdateIndex = true) => {
  const metaRaw = await AsyncStorage.getItem(getBackupMetaKey(snapshotId));
  const meta = toSafeJson(metaRaw, null);
  if (meta && Array.isArray(meta.entries)) {
    for (const entry of meta.entries) {
      if (entry?.backupKey) {
        await removeLargeValue(entry.backupKey);
      }
    }
  }
  await AsyncStorage.removeItem(getBackupMetaKey(snapshotId));

  if (shouldUpdateIndex) {
    const index = await getBackupIndex();
    index.items = index.items.filter((x) => x.id !== snapshotId);
    await setBackupIndex(index);
  }
};

export const layDanhSachBanSaoDuLieu = async () => {
  const index = await getBackupIndex();
  return [...index.items].sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || '')));
};

export const taoBanSaoDuLieuHeThong = async ({
  reason = 'MANUAL_BACKUP',
  ten_hien_thi = '',
  keyPrefixes = DEFAULT_KEY_PREFIXES,
  includeKeys = [],
  maxKeep = MAX_SNAPSHOT_KEEP,
} = {}) => {
  const snapshotId = `BK_${Date.now()}`;
  const tenAnhXa = String(ten_hien_thi || '').trim();
  const { asyncKeys, localKeys, prefixes } = await getManagedKeys({ keyPrefixes, includeKeys });
  const localRef = getLocalStorageRef();
  const entries = [];

  for (const key of asyncKeys) {
    const value = await AsyncStorage.getItem(key);
    const backupKey = `${BACKUP_DATA_PREFIX}${snapshotId}_${entries.length}`;
    await writeLargeValue(backupKey, value);
    entries.push({ store: 'async', sourceKey: key, backupKey });
  }

  for (const key of localKeys) {
    const value = localRef ? localRef.getItem(key) : null;
    const backupKey = `${BACKUP_DATA_PREFIX}${snapshotId}_${entries.length}`;
    await writeLargeValue(backupKey, value);
    entries.push({ store: 'local', sourceKey: key, backupKey });
  }

  const meta = {
    id: snapshotId,
    reason,
    ten_hien_thi: tenAnhXa,
    created_at: nowIso(),
    prefixes,
    include_keys: includeKeys || [],
    entries,
  };
  await AsyncStorage.setItem(getBackupMetaKey(snapshotId), JSON.stringify(meta));

  const index = await getBackupIndex();
  index.items.unshift({
    id: snapshotId,
    reason,
    ten_hien_thi: tenAnhXa,
    created_at: meta.created_at,
    entry_count: entries.length,
  });
  await setBackupIndex(index);

  if (index.items.length > (maxKeep || MAX_SNAPSHOT_KEEP)) {
    const stale = index.items.slice(maxKeep || MAX_SNAPSHOT_KEEP);
    for (const item of stale) {
      await deleteSnapshotInternal(item.id, false);
    }
    index.items = index.items.slice(0, maxKeep || MAX_SNAPSHOT_KEEP);
    await setBackupIndex(index);
  }

  return {
    ok: true,
    snapshot_id: snapshotId,
    reason,
    created_at: meta.created_at,
    entry_count: entries.length,
  };
};

export const phucHoiBanSaoDuLieu = async (snapshotId, options = {}) => {
  const {
    xoaKhoaMoiKhongCoTrongBanSao = true,
  } = options;

  const metaRaw = await AsyncStorage.getItem(getBackupMetaKey(snapshotId));
  const meta = toSafeJson(metaRaw, null);
  if (!meta || !Array.isArray(meta.entries)) {
    return { ok: false, message: 'Không tìm thấy bản sao.' };
  }

  const localRef = getLocalStorageRef();

  if (xoaKhoaMoiKhongCoTrongBanSao) {
    const managed = await getManagedKeys({
      keyPrefixes: meta.prefixes || DEFAULT_KEY_PREFIXES,
      includeKeys: meta.include_keys || [],
    });
    const asyncSet = new Set(meta.entries.filter((e) => e.store === 'async').map((e) => e.sourceKey));
    const localSet = new Set(meta.entries.filter((e) => e.store === 'local').map((e) => e.sourceKey));

    for (const k of managed.asyncKeys) {
      if (!asyncSet.has(k)) {
        await AsyncStorage.removeItem(k);
      }
    }
    if (localRef) {
      for (const k of managed.localKeys) {
        if (!localSet.has(k)) localRef.removeItem(k);
      }
    }
  }

  let restored = 0;
  for (const entry of meta.entries) {
    const value = await readLargeValue(entry.backupKey);
    const targetStore = entry.store === 'local' ? 'local' : 'async';
    if (targetStore === 'local' && localRef) {
      if (value === NULL_SENTINEL || value === null) localRef.removeItem(entry.sourceKey);
      else localRef.setItem(entry.sourceKey, value);
      restored += 1;
      continue;
    }
    if (value === NULL_SENTINEL || value === null) {
      await AsyncStorage.removeItem(entry.sourceKey);
    } else {
      await AsyncStorage.setItem(entry.sourceKey, value);
    }
    restored += 1;
  }

  return { ok: true, restored, snapshot_id: snapshotId };
};

export const phucHoiBanSaoGanNhat = async (options = {}) => {
  const list = await layDanhSachBanSaoDuLieu();
  if (!list.length) return { ok: false, message: 'Chưa có bản sao nào.' };
  return phucHoiBanSaoDuLieu(list[0].id, options);
};

export const xoaBanSaoDuLieu = async (snapshotId) => {
  await deleteSnapshotInternal(snapshotId, true);
  return { ok: true };
};
