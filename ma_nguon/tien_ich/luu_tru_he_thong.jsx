/**
 * Lưu trữ hệ thống (tài khoản, RBAC, phiên đăng nhập, nhật ký) — IndexedDB trên web.
 * Tách khỏi localStorage để không mất dữ liệu khi build mới / quota 5MB đầy.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export const KHOA_NHAT_KY = 'HE_THONG_NHAT_KY_HOAT_DONG';
export const KHOA_TAI_KHOAN = 'DANH_SACH_TAI_KHOAN';
export const KHOA_PHIEN_EMAIL = 'USER_ACCOUNT';
export const KHOA_PHIEN_ROLE = 'USER_ROLE';

const IDB_HT_NAME = 'CDSS_HE_THONG_DB';
const IDB_HT_VERSION = 1;
const IDB_HT_STORE = 'kv';
let _idbHtDb = null;

const getIndexedDb = () => globalThis?.indexedDB ?? null;
export const laMoiTruongWeb = () => Platform.OS === 'web' && typeof window !== 'undefined' && !!window.localStorage;
export const coTheDungIdbHeThong = () => Platform.OS === 'web' && typeof window !== 'undefined' && !!getIndexedDb();

export const anToanArrayTuChuoi = (raw) => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const gopHaiMangTaiKhoan = (arrA, arrB) => {
  const map = new Map();
  const tsTaiKhoan = (u) => Date.parse(u?.capNhatLuc || u?.taoLuc || '') || 0;
  const them = (u) => {
    if (!u || typeof u !== 'object') return;
    const email = String(u.email || '').trim().toLowerCase();
    if (!email) return;
    const existing = map.get(email);
    if (!existing) {
      map.set(email, u);
      return;
    }
    const merged = tsTaiKhoan(u) >= tsTaiKhoan(existing)
      ? { ...existing, ...u }
      : { ...u, ...existing };
    map.set(email, merged);
  };
  for (const u of [...(Array.isArray(arrA) ? arrA : []), ...(Array.isArray(arrB) ? arrB : [])]) them(u);
  return Array.from(map.values());
};

const chonChuoiMangDaiHon = (r1, r2) => {
  const n1 = anToanArrayTuChuoi(r1).length;
  const n2 = anToanArrayTuChuoi(r2).length;
  if (n2 > n1) return r2 ?? r1;
  return r1 ?? r2;
};

const moHeThongDb = () => {
  if (_idbHtDb) return Promise.resolve(_idbHtDb);
  return new Promise((resolve, reject) => {
    const idb = getIndexedDb();
    if (!idb) {
      reject(new Error('IndexedDB không khả dụng'));
      return;
    }
    const req = idb.open(IDB_HT_NAME, IDB_HT_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(IDB_HT_STORE)) {
        db.createObjectStore(IDB_HT_STORE, { keyPath: 'key' });
      }
    };
    req.onsuccess = (e) => {
      const db = e.target.result;
      _idbHtDb = db;
      db.onversionchange = () => {
        try { db.close(); } catch { /* */ }
        if (_idbHtDb === db) _idbHtDb = null;
      };
      resolve(db);
    };
    req.onerror = () => reject(req.error);
  });
};

const idbHtGet = async (key) => {
  const db = await moHeThongDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_HT_STORE, 'readonly');
    const r = tx.objectStore(IDB_HT_STORE).get(key);
    r.onsuccess = () => {
      const row = r.result;
      resolve(row ? row.value : undefined);
    };
    r.onerror = () => reject(r.error);
  });
};

const idbHtPut = async (key, value) => {
  const db = await moHeThongDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_HT_STORE, 'readwrite');
    tx.objectStore(IDB_HT_STORE).put({ key, value: String(value) });
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
};

const idbHtDelete = async (key) => {
  const db = await moHeThongDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_HT_STORE, 'readwrite');
    tx.objectStore(IDB_HT_STORE).delete(key);
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
};

const docLegacyRaw = async (key) => {
  let rAsync = null;
  let rLocal = null;
  try {
    rAsync = await AsyncStorage.getItem(key);
  } catch { /* */ }
  try {
    if (laMoiTruongWeb()) rLocal = window.localStorage.getItem(key);
  } catch { /* */ }
  if (key === KHOA_TAI_KHOAN) {
    const merged = gopHaiMangTaiKhoan(anToanArrayTuChuoi(rAsync), anToanArrayTuChuoi(rLocal));
    return merged.length ? JSON.stringify(merged) : null;
  }
  return chonChuoiMangDaiHon(rAsync, rLocal);
};

export const xoaLegacyChoKhoa = async (key) => {
  try {
    if (laMoiTruongWeb()) window.localStorage?.removeItem(key);
  } catch { /* */ }
  try {
    await AsyncStorage.removeItem(key);
  } catch { /* */ }
};

const docChuoiHeThongWeb = async (key) => {
  let tuIdb;
  try {
    tuIdb = await idbHtGet(key);
  } catch (e) {
    console.warn('[luu_tru_he_thong] IndexedDB đọc lỗi:', key, e?.message || e);
    tuIdb = undefined;
  }

  const legacy = await docLegacyRaw(key);

  if (key === KHOA_TAI_KHOAN) {
    const fromIdb = tuIdb != null ? anToanArrayTuChuoi(tuIdb) : [];
    const fromLeg = legacy != null ? anToanArrayTuChuoi(legacy) : [];
    const merged = gopHaiMangTaiKhoan(fromIdb, fromLeg);
    if (!merged.length) return null;
    const mergedJson = JSON.stringify(merged);
    const canDongBoIdb = fromLeg.length > 0 && (
      merged.length > fromIdb.length
      || (legacy != null && tuIdb != null && legacy !== tuIdb)
    );
    if (canDongBoIdb) {
      try {
        await idbHtPut(key, mergedJson);
        await xoaLegacyChoKhoa(key);
      } catch (e) {
        console.warn('[luu_tru_he_thong] đồng bộ tài khoản sang IDB:', e?.message || e);
      }
    }
    return mergedJson;
  }

  if (tuIdb !== undefined && tuIdb !== null) return tuIdb;

  if (legacy != null) {
    try {
      await idbHtPut(key, legacy);
      await xoaLegacyChoKhoa(key);
    } catch (e) {
      console.warn('[luu_tru_he_thong] migrate sang IDB thất bại:', key, e?.message || e);
      return legacy;
    }
    return legacy;
  }
  return null;
};

const docStorageNative = async (key) => {
  if (laMoiTruongWeb()) {
    try {
      const localValue = window.localStorage.getItem(key);
      if (localValue !== null && localValue !== undefined) return localValue;
    } catch { /* */ }
  }
  return AsyncStorage.getItem(key);
};

/** Đọc chuỗi: web → IndexedDB (+ migrate legacy); native → AsyncStorage. */
export const docChuoiHeThong = async (key) => {
  if (coTheDungIdbHeThong()) {
    try {
      return await docChuoiHeThongWeb(key);
    } catch (e) {
      console.warn('[luu_tru_he_thong] docChuoiHeThong:', e?.message || e);
    }
    const leg = await docLegacyRaw(key);
    if (leg != null) return leg;
  }
  return docStorageNative(key);
};

/** Ghi chuỗi: web ưu tiên IndexedDB và xóa legacy trùng key. */
export const ghiChuoiHeThong = async (key, value) => {
  const normalizedValue = String(value ?? '');
  if (coTheDungIdbHeThong()) {
    try {
      await idbHtPut(key, normalizedValue);
      await xoaLegacyChoKhoa(key);
      return;
    } catch (e) {
      console.warn('[luu_tru_he_thong] IndexedDB ghi lỗi, fallback legacy:', key, e?.message || e);
      try { await idbHtDelete(key); } catch { /* */ }
    }
  }

  const tasks = [
    AsyncStorage.setItem(key, normalizedValue).catch((err) => {
      console.warn('[luu_tru_he_thong] AsyncStorage.setItem:', key, err?.message || err);
    }),
  ];
  if (laMoiTruongWeb()) {
    tasks.push((async () => {
      try {
        window.localStorage.setItem(key, normalizedValue);
      } catch (err) {
        console.warn('[luu_tru_he_thong] localStorage.setItem:', key, err?.message || err);
      }
    })());
  }
  await Promise.all(tasks);
};

export const xoaChuoiHeThong = async (key) => {
  if (coTheDungIdbHeThong()) {
    try { await idbHtDelete(key); } catch { /* */ }
  }
  await xoaLegacyChoKhoa(key);
};

/** Liệt kê key legacy ACL_USER_* trên web (để migrate). */
export const layKhoaLegacyAcl = () => {
  if (!laMoiTruongWeb()) return [];
  try {
    return Object.keys(window.localStorage).filter((k) => k.startsWith('ACL_USER_'));
  } catch {
    return [];
  }
};

let _chuoiGhiHeThong = Promise.resolve();
export const voiKhoaGhiHeThong = (fn) => {
  const job = _chuoiGhiHeThong.then(fn, fn);
  _chuoiGhiHeThong = job.catch(() => {});
  return job;
};

/**
 * Đọc + migrate một loạt key (RBAC, phiên, ACL) sang IndexedDB khi khởi động.
 * Gọi sớm sau đăng nhập / mở màn phân quyền để không mất dữ liệu sau build.
 */
export const damBaoMigrateKhoaHeThong = async (keys = []) => {
  const danhSach = Array.isArray(keys) ? keys.filter(Boolean) : [];
  for (const key of danhSach) {
    try {
      await docChuoiHeThong(key);
    } catch (e) {
      console.warn('[luu_tru_he_thong] migrate key:', key, e?.message || e);
    }
  }
  return { ok: true, count: danhSach.length };
};
