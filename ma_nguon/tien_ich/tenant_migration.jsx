/**
 * Migration một lần: dữ liệu legacy (không prefix) → CDSS_ORG_{orgId}_*
 * + IndexedDB CDSS_HO_SO_DB → CDSS_HO_SO_DB__{orgId}
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  matchesTenantKeyPrefix,
  resolveIdbName,
  resolveOrgId,
  tenantMigrationFlagKey,
  prefixStorageKey,
  layTenantProfile,
} from './tenant_context';
import { tenantGetItem, tenantSetItem } from './tenant_storage';

const LEGACY_IDB_HO_SO = 'CDSS_HO_SO_DB';
const LEGACY_IDB_HE_THONG = 'CDSS_HE_THONG_DB';

const getIndexedDb = () => globalThis?.indexedDB ?? null;
const getLocalStorage = () => globalThis?.localStorage ?? null;

let migrationPromise = null;

const copyIdbDatabase = async (fromName, toName) => {
  const idb = getIndexedDb();
  if (!idb || fromName === toName) return { copied: 0 };

  const openDb = (name) => new Promise((resolve, reject) => {
    const req = idb.open(name);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });

  let fromDb;
  let toDb;
  try {
    fromDb = await openDb(fromName);
  } catch {
    return { copied: 0, skipped: 'source_missing' };
  }

  try {
    toDb = await openDb(toName);
  } catch {
    return { copied: 0, skipped: 'target_open_failed' };
  }

  let copied = 0;
  const storeNames = Array.from(fromDb.objectStoreNames);
  for (const storeName of storeNames) {
    const rows = await new Promise((resolve, reject) => {
      const tx = fromDb.transaction(storeName, 'readonly');
      const req = tx.objectStore(storeName).getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });

    if (!rows.length) continue;

    if (!toDb.objectStoreNames.contains(storeName)) {
      try { fromDb.close(); toDb.close(); } catch { /* */ }
      return { copied, skipped: `missing_store_${storeName}` };
    }

    await new Promise((resolve, reject) => {
      const tx = toDb.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      rows.forEach((row) => store.put(row));
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
    copied += rows.length;
  }

  try { fromDb.close(); } catch { /* */ }
  try { toDb.close(); } catch { /* */ }
  return { copied };
};

const collectLegacyKeys = async () => {
  const keys = new Set();
  const asyncKeys = await AsyncStorage.getAllKeys().catch(() => []);
  asyncKeys.forEach((k) => {
    if (matchesTenantKeyPrefix(k) && !k.startsWith('CDSS_ORG_')) keys.add(k);
  });

  const ls = getLocalStorage();
  if (ls) {
    for (let i = 0; i < ls.length; i += 1) {
      const k = ls.key(i);
      if (k && matchesTenantKeyPrefix(k) && !k.startsWith('CDSS_ORG_')) keys.add(k);
    }
  }
  return Array.from(keys);
};

const docLegacyRaw = async (key) => {
  let fromAsync = null;
  let fromLocal = null;
  try {
    fromAsync = await AsyncStorage.getItem(key);
  } catch { /* */ }
  try {
    fromLocal = getLocalStorage()?.getItem(key) ?? null;
  } catch { /* */ }
  if (fromLocal != null && fromAsync != null) {
    return String(fromLocal).length >= String(fromAsync).length ? fromLocal : fromAsync;
  }
  return fromLocal ?? fromAsync;
};

const xoaLegacyKey = async (key) => {
  try { await AsyncStorage.removeItem(key); } catch { /* */ }
  try { getLocalStorage()?.removeItem(key); } catch { /* */ }
};

export const damBaoMigrationTenant = async () => {
  if (migrationPromise) return migrationPromise;

  migrationPromise = (async () => {
    const orgId = resolveOrgId();
    const flagBase = 'MIGRATION_V1_DONE';
    const already = await tenantGetItem(flagBase);
    if (already === '1') {
      return { ok: true, skipped: true, orgId };
    }

    const profile = layTenantProfile();
    const legacyAliases = Array.isArray(profile?.legacyOrgAliases)
      ? profile.legacyOrgAliases
      : (orgId === 'phuongchau_soc_trang' ? ['phuongchau'] : []);

    let migratedKeys = 0;
    const legacyKeys = await collectLegacyKeys();
    for (const key of legacyKeys) {
      const raw = await docLegacyRaw(key);
      if (raw == null) continue;
      const existing = await tenantGetItem(key);
      if (existing == null || existing === '') {
        await tenantSetItem(key, raw);
        migratedKeys += 1;
      }
      await xoaLegacyKey(key);
    }

    const idbHoSoTarget = resolveIdbName(LEGACY_IDB_HO_SO);
    const idbHtTarget = resolveIdbName(LEGACY_IDB_HE_THONG);
    const idbHoSo = await copyIdbDatabase(LEGACY_IDB_HO_SO, idbHoSoTarget);
    const idbHt = await copyIdbDatabase(LEGACY_IDB_HE_THONG, idbHtTarget);

    await tenantSetItem(flagBase, '1');
    console.log(`[tenant_migration] org=${orgId} keys=${migratedKeys} idb_ho_so=${idbHoSo.copied} idb_ht=${idbHt.copied} aliases=${legacyAliases.join(',')}`);

    return {
      ok: true,
      orgId,
      migratedKeys,
      idbHoSo,
      idbHt,
      legacyAliases,
    };
  })().catch((e) => {
    migrationPromise = null;
    console.warn('[tenant_migration] lỗi:', e?.message || e);
    return { ok: false, error: String(e?.message || e) };
  });

  return migrationPromise;
};

export default { damBaoMigrationTenant };
