/**
 * ============================================================================
 * FILE: tien_ich/kho_du_lieu.jsx
 * MỤC ĐÍCH: Quản lý lưu trữ nội bộ cho ứng dụng CDSS.
 *
 * KIẾN TRÚC LƯU TRỮ (BỀN TRÊN Ổ SSD/FLASH CỤC BỘ — KHÔNG PHẢI RAM):
 *   - WEB:    IndexedDB — nằm trong hồ sơ trình duyệt trên ổ đĩa; dung lượng lớn
 *             (GB), phù hợp hàng nghìn hồ sơ/ngày; không mất khi tắt tab (trừ khi
 *             xóa dữ liệu trang / ẩn danh).
 *   - MOBILE: AsyncStorage — sandbox ứng dụng trên bộ nhớ trong; Index-Detail để
 *             vượt giới hạn 2MB/key.
 *
 * LƯU Ý: Phiên bản này tự động chuyển đổi (migrate) dữ liệu cũ từ localStorage
 * sang IndexedDB trong lần chạy đầu tiên, giải phóng toàn bộ localStorage cho
 * các module khác (Quản lý luật, v.v.).
 *
 * Lịch sử phiên kiểm tra (tóm tắt + snapshot cảnh báo theo từng lần lưu kho):
 *   store `lich_su_phien_gd` (web) / key `CDSS_LSGDMLK_*` (mobile). Không xóa
 *   khi xóa kho làm việc; có API xóa tập trung nếu cần reset quyền riêng tư.
 *
 * Kho lịch sử hồ sơ đã giám định (metadata + kết quả giám định, XML gốc qua xml_import):
 *   store `ho_so_gd_luu_tru` (web) / key `CDSS_HSGD_*` (mobile). Không xóa khi
 *   `xoaToanBoKho`. Không giới hạn số bản trong code — chỉ giới hạn quota trình duyệt.
 *
 * Kho XML đầu vào (file gốc đã import — không dùng AsyncStorage tạm):
 *   store `xml_import` (web) / key `CDSS_XMLIMP_*` (mobile). Lưu raw XML + metadata;
 *   thay thế `CDSS_LICH_SU_XML` (migrate một lần).
 * ============================================================================
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { chuanHoaHoSoCanhBao } from './chuan_hoa_van_ban';
import { xuLyFileXML130Va4210 } from './xml_helper';

const laMoiTruongWeb = () => Platform.OS === 'web' || typeof window !== 'undefined' || typeof document !== 'undefined';
const getIndexedDb = () => globalThis?.indexedDB || null;
const getLocalStorage = () => globalThis?.localStorage || null;
const getNavigatorStorage = () => globalThis?.navigator?.storage || null;

const dinhDangBytesChoHienThi = (bytes = 0) => {
  const n = Number(bytes) || 0;
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(1)} MB`;
  return `${(n / (1024 * 1024 * 1024)).toFixed(2)} GB`;
};

const bytesSangBase64 = (bytes) => {
  const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let s = '';
  const chunk = 0x8000;
  for (let i = 0; i < u8.length; i += chunk) {
    s += String.fromCharCode(...u8.subarray(i, i + chunk));
  }
  return btoa(s);
};

const base64SangBytes = (b64 = '') => {
  const s = atob(String(b64 || ''));
  const out = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i += 1) out[i] = s.charCodeAt(i);
  return out;
};

const coHoTroNenGzipWeb = () => laMoiTruongWeb()
  && typeof globalThis.CompressionStream !== 'undefined'
  && typeof globalThis.DecompressionStream !== 'undefined';

const nenJsonGzipBase64 = async (value) => {
  if (!coHoTroNenGzipWeb()) return null;
  try {
    const json = JSON.stringify(value ?? null);
    const stream = new Blob([json]).stream().pipeThrough(new CompressionStream('gzip'));
    const buf = await new Response(stream).arrayBuffer();
    return bytesSangBase64(new Uint8Array(buf));
  } catch (e) {
    console.warn('[KHO_DU_LIEU] nenJsonGzipBase64:', e?.message || e);
    return null;
  }
};

const giaiNenJsonGzipBase64 = async (b64) => {
  if (!coHoTroNenGzipWeb() || !b64) return null;
  try {
    const bytes = base64SangBytes(b64);
    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
    const text = await new Response(stream).text();
    try {
      return JSON.parse(text);
    } catch {
      return null;
    }
  } catch (e) {
    console.warn('[KHO_DU_LIEU] giaiNenJsonGzipBase64:', e?.message || e);
    return null;
  }
};

/**
 * Xin quyền lưu trữ bền trên Web (navigator.storage.persist) — giảm rủi ro trình duyệt dọn cache.
 */
export const damBaoLuuTruBenTrenWeb = async () => {
  if (!laMoiTruongWeb()) {
    return { ok: true, web: false, persisted: false, ly_do: 'not_web' };
  }
  try {
    const storage = getNavigatorStorage();
    if (!storage) return { ok: false, web: true, persisted: false, ly_do: 'no_storage_api' };
    let persisted = false;
    if (typeof storage.persisted === 'function') {
      persisted = await storage.persisted();
    }
    if (!persisted && typeof storage.persist === 'function') {
      persisted = await storage.persist();
    }
    return { ok: true, web: true, persisted, ly_do: persisted ? 'persisted' : 'denied_or_unsupported' };
  } catch (e) {
    return { ok: false, web: true, persisted: false, ly_do: e?.message || 'error' };
  }
};

/** Ước lượng dung lượng IndexedDB / origin (chỉ Web). */
export const layThongTinDungLuongKho = async () => {
  if (!laMoiTruongWeb()) {
    return { ho_tro: false, ly_do: 'not_web' };
  }
  try {
    const storage = getNavigatorStorage();
    if (!storage?.estimate) return { ho_tro: false, ly_do: 'no_estimate_api' };
    const est = await storage.estimate();
    const quota = Number(est?.quota) || 0;
    const usage = Number(est?.usage) || 0;
    const conLai = Math.max(0, quota - usage);
    const persisted = typeof storage.persisted === 'function' ? await storage.persisted() : null;
    return {
      ho_tro: true,
      quota_bytes: quota,
      usage_bytes: usage,
      con_lai_bytes: conLai,
      phan_tram_da_dung: quota > 0 ? Math.round((usage / quota) * 1000) / 10 : 0,
      quota_hien_thi: dinhDangBytesChoHienThi(quota),
      usage_hien_thi: dinhDangBytesChoHienThi(usage),
      con_lai_hien_thi: dinhDangBytesChoHienThi(conLai),
      luu_ben: persisted === true,
      nen_gzip_ho_tro: coHoTroNenGzipWeb(),
    };
  } catch (e) {
    return { ho_tro: false, ly_do: e?.message || 'error' };
  }
};

// ============================================================================
// PHẦN 1: INDEXEDDB — DÙNG TRÊN WEB
// ============================================================================
const IDB_NAME = 'CDSS_HO_SO_DB';
const IDB_STORE = 'ho_so';
const IDB_STORE_DANH_MUC = 'danh_muc';
/** Lịch sử các lần kiểm tra theo MA_BN (cùng IndexedDB/ổ đĩa như trên) — không xóa khi xóa kho làm việc. */
const IDB_STORE_LICH_SU = 'lich_su_bn';
/** Từng phiên chạy engine theo MA_LK (append khi `luuHoSoVaoKho` có `ket_qua_giam_dinh`). */
const IDB_STORE_PHIEN_GD = 'lich_su_phien_gd';
/** File XML gốc đã import (raw + metadata) — kho chính thức, không xóa khi xóa kho làm việc. */
const IDB_STORE_XML_IMPORT = 'xml_import';
/** Bản lưu hồ sơ đã chạy giám định — không xóa khi xóa kho làm việc. */
const IDB_STORE_HO_SO_GD_LUU_TRU = 'ho_so_gd_luu_tru';
const IDB_VERSION = 6;
/** Bản lưu lịch sử giám định gọn (xml1 + kết quả; XML chi tiết qua xml_import). */
const PHIEN_BAN_HO_SO_GD_GON = 2;

let _dbCache = null;

const _openDB = () => {
  if (_dbCache && _dbCache.version === IDB_VERSION) {
    return Promise.resolve(_dbCache);
  }
  if (_dbCache) {
    try {
      _dbCache.close();
    } catch {
      /* ignore */
    }
    _dbCache = null;
  }
  return new Promise((resolve, reject) => {
    const indexedDb = getIndexedDb();
    if (!indexedDb) {
      reject(new Error('IndexedDB không khả dụng trong môi trường hiện tại.'));
      return;
    }

    const req = indexedDb.open(IDB_NAME, IDB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE, { keyPath: 'ma_lk' });
      }
      if (!db.objectStoreNames.contains(IDB_STORE_DANH_MUC)) {
        db.createObjectStore(IDB_STORE_DANH_MUC, { keyPath: 'key' });
      }
      if (!db.objectStoreNames.contains(IDB_STORE_LICH_SU)) {
        db.createObjectStore(IDB_STORE_LICH_SU, { keyPath: 'ma_bn' });
      }
      if (!db.objectStoreNames.contains(IDB_STORE_PHIEN_GD)) {
        db.createObjectStore(IDB_STORE_PHIEN_GD, { keyPath: 'ma_lk' });
      }
      if (!db.objectStoreNames.contains(IDB_STORE_XML_IMPORT)) {
        db.createObjectStore(IDB_STORE_XML_IMPORT, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(IDB_STORE_HO_SO_GD_LUU_TRU)) {
        db.createObjectStore(IDB_STORE_HO_SO_GD_LUU_TRU, { keyPath: 'id' });
      }
    };
    req.onsuccess = (e) => {
      const openedDb = e.target.result;
      _dbCache = openedDb;
      // Huỷ cache nếu có phiên bản mới
      openedDb.onversionchange = () => {
        try { openedDb.close(); } catch {}
        if (_dbCache === openedDb) _dbCache = null;
      };
      resolve(openedDb);
    };
    req.onerror = () => reject(req.error);
  });
};

// Helper bọc IndexedDB callback thành Promise
const idb = {
  put: async (record) => {
    const db = await _openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      tx.objectStore(IDB_STORE).put(record);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  },
  bulkPut: async (records = []) => {
    if (!Array.isArray(records) || records.length === 0) return true;
    const db = await _openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      const store = tx.objectStore(IDB_STORE);
      records.forEach((record) => store.put(record));
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  },
  getAll: async () => {
    const db = await _openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readonly');
      const req = tx.objectStore(IDB_STORE).getAll();
      req.onsuccess = () => resolve(req.result || []);
      tx.onerror = () => reject(tx.error);
    });
  },
  getAllKeys: async () => {
    const db = await _openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readonly');
      const req = tx.objectStore(IDB_STORE).getAllKeys();
      req.onsuccess = () => resolve(req.result || []);
      tx.onerror = () => reject(tx.error);
    });
  },
  getMany: async (keys = []) => {
    if (!Array.isArray(keys) || keys.length === 0) return [];
    const db = await _openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readonly');
      const store = tx.objectStore(IDB_STORE);
      const results = new Array(keys.length).fill(null);
      let pending = keys.length;
      let settled = false;

      const finish = () => {
        if (!settled && pending <= 0) {
          settled = true;
          resolve(results);
        }
      };

      keys.forEach((key, index) => {
        const req = store.get(key);
        req.onsuccess = () => {
          results[index] = req.result || null;
          pending -= 1;
          finish();
        };
        req.onerror = () => {
          pending -= 1;
          finish();
        };
      });

      tx.onerror = () => {
        if (!settled) {
          settled = true;
          reject(tx.error);
        }
      };
      tx.onabort = () => {
        if (!settled) {
          settled = true;
          reject(tx.error);
        }
      };
    });
  },
  delete: async (key) => {
    const db = await _openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      tx.objectStore(IDB_STORE).delete(key);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  },
  clear: async () => {
    const db = await _openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      tx.objectStore(IDB_STORE).clear();
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  },
};

const idbLichSu = {
  get: async (ma_bn) => {
    const db = await _openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE_LICH_SU, 'readonly');
      const req = tx.objectStore(IDB_STORE_LICH_SU).get(ma_bn);
      req.onsuccess = () => resolve(req.result || null);
      tx.onerror = () => reject(tx.error);
    });
  },
  put: async (record) => {
    const db = await _openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE_LICH_SU, 'readwrite');
      tx.objectStore(IDB_STORE_LICH_SU).put(record);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  },
};

const idbHoSoGdLuuTru = {
  put: async (record) => {
    const db = await _openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE_HO_SO_GD_LUU_TRU, 'readwrite');
      tx.objectStore(IDB_STORE_HO_SO_GD_LUU_TRU).put(record);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  },
  get: async (id) => {
    const db = await _openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE_HO_SO_GD_LUU_TRU, 'readonly');
      const req = tx.objectStore(IDB_STORE_HO_SO_GD_LUU_TRU).get(id);
      req.onsuccess = () => resolve(req.result || null);
      tx.onerror = () => reject(tx.error);
    });
  },
  getAll: async () => {
    const db = await _openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE_HO_SO_GD_LUU_TRU, 'readonly');
      const req = tx.objectStore(IDB_STORE_HO_SO_GD_LUU_TRU).getAll();
      req.onsuccess = () => resolve(req.result || []);
      tx.onerror = () => reject(tx.error);
    });
  },
  delete: async (id) => {
    const db = await _openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE_HO_SO_GD_LUU_TRU, 'readwrite');
      tx.objectStore(IDB_STORE_HO_SO_GD_LUU_TRU).delete(id);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  },
  clear: async () => {
    const db = await _openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE_HO_SO_GD_LUU_TRU, 'readwrite');
      tx.objectStore(IDB_STORE_HO_SO_GD_LUU_TRU).clear();
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  },
};

const idbPhienGd = {
  get: async (ma_lk) => {
    const db = await _openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE_PHIEN_GD, 'readonly');
      const req = tx.objectStore(IDB_STORE_PHIEN_GD).get(ma_lk);
      req.onsuccess = () => resolve(req.result || null);
      tx.onerror = () => reject(tx.error);
    });
  },
  put: async (record) => {
    const db = await _openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE_PHIEN_GD, 'readwrite');
      tx.objectStore(IDB_STORE_PHIEN_GD).put(record);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  },
};

const idbXmlImport = {
  put: async (record) => {
    const db = await _openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE_XML_IMPORT, 'readwrite');
      tx.objectStore(IDB_STORE_XML_IMPORT).put(record);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  },
  get: async (id) => {
    const db = await _openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE_XML_IMPORT, 'readonly');
      const req = tx.objectStore(IDB_STORE_XML_IMPORT).get(id);
      req.onsuccess = () => resolve(req.result || null);
      tx.onerror = () => reject(tx.error);
    });
  },
  getAll: async () => {
    const db = await _openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE_XML_IMPORT, 'readonly');
      const req = tx.objectStore(IDB_STORE_XML_IMPORT).getAll();
      req.onsuccess = () => resolve(req.result || []);
      tx.onerror = () => reject(tx.error);
    });
  },
  delete: async (id) => {
    const db = await _openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE_XML_IMPORT, 'readwrite');
      tx.objectStore(IDB_STORE_XML_IMPORT).delete(id);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  },
  clear: async () => {
    const db = await _openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE_XML_IMPORT, 'readwrite');
      tx.objectStore(IDB_STORE_XML_IMPORT).clear();
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  },
};

const idbDanhMuc = {
  put: async (record) => {
    const db = await _openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE_DANH_MUC, 'readwrite');
      tx.objectStore(IDB_STORE_DANH_MUC).put(record);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  },
  get: async (key) => {
    const db = await _openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE_DANH_MUC, 'readonly');
      const req = tx.objectStore(IDB_STORE_DANH_MUC).get(key);
      req.onsuccess = () => resolve(req.result || null);
      tx.onerror = () => reject(tx.error);
    });
  },
  getAll: async () => {
    const db = await _openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE_DANH_MUC, 'readonly');
      const req = tx.objectStore(IDB_STORE_DANH_MUC).getAll();
      req.onsuccess = () => resolve(req.result || []);
      tx.onerror = () => reject(tx.error);
    });
  },
  delete: async (key) => {
    const db = await _openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE_DANH_MUC, 'readwrite');
      tx.objectStore(IDB_STORE_DANH_MUC).delete(key);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  },
};

/**
 * Chuyển đổi dữ liệu cũ từ localStorage sang IndexedDB (chạy một lần duy nhất).
 * Sau khi migrate xong, xoá các key cũ để giải phóng không gian localStorage
 * cho module Quản lý luật và các module khác.
 */
const _migrateFromLocalStorage = async () => {
  try {
    const FLAG_KEY = 'CDSS_IDB_MIGRATED_V1';
    const localStorageRef = getLocalStorage();
    if (!localStorageRef) return;
    if (localStorageRef.getItem(FLAG_KEY)) return; // Đã migrate rồi

    const indexData = localStorageRef.getItem('CDSS_KHO_INDEX_MA_LK');
    if (!indexData) {
      localStorageRef.setItem(FLAG_KEY, '1');
      return;
    }

    let dsMaLK;
    try { dsMaLK = JSON.parse(indexData); } catch (_e) { dsMaLK = []; }

    let migrated = 0;
    for (const maLK of dsMaLK) {
      const key = `CDSS_HS_${maLK}`;
      const val = localStorageRef.getItem(key);
      if (val) {
        try {
          const hoSo = JSON.parse(val);
          await idb.put({ ...hoSo, ma_lk: maLK });
          localStorageRef.removeItem(key);
          migrated++;
        } catch (e) {
          console.warn(`[KHO_DU_LIEU] Bỏ qua migrate hồ sơ ${maLK}:`, e);
        }
      }
    }

    localStorageRef.removeItem('CDSS_KHO_INDEX_MA_LK');
    localStorageRef.setItem(FLAG_KEY, '1');

    if (migrated > 0) {
      console.log(`[KHO_DU_LIEU] Đã chuyển đổi ${migrated} hồ sơ từ localStorage → IndexedDB.`);
    }
  } catch (e) {
    console.error('[KHO_DU_LIEU] Lỗi migrate:', e);
  }
};

// ============================================================================
// PHẦN 2: ASYNCSTORAGE — DÙNG TRÊN MOBILE
// ============================================================================
const KHO_INDEX_KEY = 'CDSS_KHO_INDEX_MA_LK';
const PREFIX_HS_KEY = 'CDSS_HS_';
const DETAIL_CHUNK_BYTES = 280000;
const KHO_DANH_MUC_PREFIXES = ['DANH_MUC_', 'BYT_7603_', 'COLS_', 'BYT_7603_COLS_'];
const KHO_DANH_MUC_EXACT_KEYS = new Set(['THONG_TIN_CO_SO']);
const DANH_MUC_CACHE = new Map();
let dongBoDanhMucPromise = null;
let migrateDanhMucIdbPromise = null;
const chuanHoaBanGhiHoSo = (hoSo) => chuanHoaHoSoCanhBao(hoSo);

const PREFIX_LICH_SU_MOBILE = 'CDSS_LSBN_';
const KHO_LICH_SU_INDEX_MOBILE = 'CDSS_LSBN_INDEX_MA_BN';
const PREFIX_PHIEN_GD_MOBILE = 'CDSS_LSGDMLK_';
const PREFIX_XML_IMPORT_MOBILE = 'CDSS_XMLIMP_META_';
const PREFIX_XML_IMPORT_RAW_MOBILE = 'CDSS_XMLIMP_RAW_';
const KHO_XML_IMPORT_INDEX_MOBILE = 'CDSS_XMLIMP_INDEX_IDS';
const FLAG_XML_IMPORT_MIGRATED = 'CDSS_XMLIMP_MIGRATED_V1';
const PREFIX_HO_SO_GD_LUU_MOBILE = 'CDSS_HSGD_';
const KHO_HO_SO_GD_INDEX_MOBILE = 'CDSS_HSGD_INDEX_IDS';

const chuanHoaMaLKImport = (giaTri) => String(giaTri || '').trim().toUpperCase();

const taoIdBanGhiImportXml = () => `xmlimp_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

const rutGonMetaImportXml = (rec = {}) => ({
  id: String(rec.id || ''),
  ma_lk: chuanHoaMaLKImport(rec.ma_lk),
  tenFile: String(rec.ten_file || rec.tenFile || '').slice(0, 260),
  ten_file: String(rec.ten_file || rec.tenFile || '').slice(0, 260),
  ngay_giam_dinh: String(rec.ngay_giam_dinh || ''),
  ghi_luc_iso: String(rec.ghi_luc_iso || ''),
  nguon: String(rec.nguon || ''),
  kich_thuoc_bytes: Number(rec.kich_thuoc_bytes) || 0,
  co_raw_xml: Boolean(rec.co_raw_xml),
});

const luuRawXmlImportMobile = async (id, rawXml = '') => {
  const baseKey = `${PREFIX_XML_IMPORT_RAW_MOBILE}${id}`;
  const payload = String(rawXml || '');
  if (!payload) {
    await xoaJsonChunkTheoKhoa(baseKey).catch(() => {});
    return;
  }
  const keyMeta = `${baseKey}_CHUNKS`;
  const oldChunkCount = Number(await AsyncStorage.getItem(keyMeta)) || 0;
  if (payload.length <= DETAIL_CHUNK_BYTES) {
    await AsyncStorage.setItem(baseKey, payload);
    const dsCanXoa = [keyMeta];
    for (let i = 0; i < oldChunkCount; i += 1) {
      dsCanXoa.push(`${baseKey}_CHUNK_${i}`);
    }
    if (dsCanXoa.length > 0) await AsyncStorage.multiRemove(dsCanXoa);
    return;
  }
  const chunks = tachThanhChunkText(payload, DETAIL_CHUNK_BYTES);
  const pairs = [[keyMeta, String(chunks.length)]];
  chunks.forEach((chunk, index) => {
    pairs.push([`${baseKey}_CHUNK_${index}`, chunk]);
  });
  await AsyncStorage.multiSet(pairs);
  const dsCanXoa = [baseKey];
  for (let index = chunks.length; index < oldChunkCount; index += 1) {
    dsCanXoa.push(`${baseKey}_CHUNK_${index}`);
  }
  if (dsCanXoa.length > 0) await AsyncStorage.multiRemove(dsCanXoa);
};

const docRawXmlImportMobile = async (id) => {
  const baseKey = `${PREFIX_XML_IMPORT_RAW_MOBILE}${id}`;
  const keyMeta = `${baseKey}_CHUNKS`;
  const chunkCount = Number(await AsyncStorage.getItem(keyMeta)) || 0;
  if (chunkCount > 0) {
    const chunkKeys = Array.from({ length: chunkCount }, (_, index) => `${baseKey}_CHUNK_${index}`);
    const chunkPairs = await AsyncStorage.multiGet(chunkKeys);
    let payload = '';
    chunkPairs.forEach(([, raw]) => {
      if (raw) payload += String(raw);
    });
    return payload;
  }
  return String(await AsyncStorage.getItem(baseKey) || '');
};

const docDanhSachIdImportXmlMobile = async () => {
  const raw = await AsyncStorage.getItem(KHO_XML_IMPORT_INDEX_MOBILE);
  return Array.isArray(parseJsonAnToan(raw)) ? parseJsonAnToan(raw) : [];
};

const ghiDanhSachIdImportXmlMobile = async (ids = []) => {
  const unique = Array.from(new Set((Array.isArray(ids) ? ids : []).filter(Boolean)));
  await AsyncStorage.setItem(KHO_XML_IMPORT_INDEX_MOBILE, JSON.stringify(unique));
  return unique;
};

const catGiamLichSuImportXml = async () => {
  /* Không giới hạn số bản XML import — chỉ quota trình duyệt/OS. */
};

let migrateXmlImportPromise = null;

/** Migrate metadata cũ từ `CDSS_LICH_SU_XML` (AsyncStorage tạm) sang kho chính thức. */
export const damBaoMigrateLichSuXmlSangKhoChinhThuc = async () => {
  if (migrateXmlImportPromise) return migrateXmlImportPromise;

  migrateXmlImportPromise = (async () => {
    try {
      const daMigrate = await AsyncStorage.getItem(FLAG_XML_IMPORT_MIGRATED);
      if (daMigrate === '1') return { ok: true, migrated: 0, skipped: true };

      const stored = await AsyncStorage.getItem('CDSS_LICH_SU_XML');
      if (!stored) {
        await AsyncStorage.setItem(FLAG_XML_IMPORT_MIGRATED, '1');
        return { ok: true, migrated: 0 };
      }

      let items = [];
      try {
        items = JSON.parse(stored);
      } catch {
        items = [];
      }

      let migrated = 0;
      for (const item of Array.isArray(items) ? items : []) {
        const ma = chuanHoaMaLKImport(item?.ma_lk);
        if (!ma) continue;
        await luuBanGhiImportXml({
          ma_lk: ma,
          ten_file: item?.tenFile || item?.ten_file || '',
          raw_xml: '',
          nguon: 'legacy_migrate',
          ngay_giam_dinh: item?.ngay_giam_dinh || '',
        });
        migrated += 1;
      }

      await AsyncStorage.removeItem('CDSS_LICH_SU_XML').catch(() => {});
      await AsyncStorage.setItem(FLAG_XML_IMPORT_MIGRATED, '1');
      return { ok: true, migrated };
    } catch (e) {
      console.warn('[KHO_DU_LIEU] damBaoMigrateLichSuXmlSangKhoChinhThuc:', e?.message || e);
      return { ok: false, migrated: 0, error: e };
    } finally {
      migrateXmlImportPromise = null;
    }
  })();

  return migrateXmlImportPromise;
};

/** Lưu file XML gốc vào kho chính thức (IndexedDB / AsyncStorage chunked). */
export const luuBanGhiImportXml = async ({
  ma_lk,
  ten_file = '',
  raw_xml = '',
  nguon = 'nhap_xml',
  ngay_giam_dinh = '',
} = {}) => {
  const maChuan = chuanHoaMaLKImport(ma_lk);
  if (!maChuan || ['KHONG_XAC_DINH', 'LOI', 'LOI_DUNG_LUONG'].includes(maChuan)) return null;

  const id = taoIdBanGhiImportXml();
  const ghi_luc_iso = new Date().toISOString();
  const record = {
    id,
    ma_lk: maChuan,
    ten_file: String(ten_file || '').slice(0, 260),
    ghi_luc_iso,
    ngay_giam_dinh: String(ngay_giam_dinh || new Date().toLocaleString('vi-VN')),
    nguon: String(nguon || 'nhap_xml'),
    kich_thuoc_bytes: String(raw_xml || '').length,
    co_raw_xml: Boolean(raw_xml),
  };

  if (Platform.OS === 'web') {
    await idbXmlImport.put({ ...record, raw_xml: String(raw_xml || '') });
  } else {
    await AsyncStorage.setItem(`${PREFIX_XML_IMPORT_MOBILE}${id}`, JSON.stringify(record));
    await luuRawXmlImportMobile(id, raw_xml);
    const ids = await docDanhSachIdImportXmlMobile();
    if (!ids.includes(id)) {
      ids.unshift(id);
      await ghiDanhSachIdImportXmlMobile(ids);
    }
  }

  await catGiamLichSuImportXml();
  return record;
};

/** Danh sách lịch sử import XML (metadata, không trả raw_xml để nhẹ UI). */
export const layLichSuImportXml = async ({ ma_lk = '', gioiHan = 300 } = {}) => {
  await damBaoMigrateLichSuXmlSangKhoChinhThuc();
  const maLoc = chuanHoaMaLKImport(ma_lk);
  const limit = Math.max(1, Number(gioiHan) || 500);

  try {
    if (Platform.OS === 'web') {
      const all = await idbXmlImport.getAll();
      const filtered = maLoc
        ? all.filter((r) => chuanHoaMaLKImport(r?.ma_lk) === maLoc)
        : all;
      return filtered
        .sort((a, b) => String(b.ghi_luc_iso || '').localeCompare(String(a.ghi_luc_iso || '')))
        .slice(0, limit)
        .map(rutGonMetaImportXml);
    }

    const ids = await docDanhSachIdImportXmlMobile();
    const metas = [];
    for (const id of ids) {
      const raw = await AsyncStorage.getItem(`${PREFIX_XML_IMPORT_MOBILE}${id}`);
      const meta = raw ? parseJsonAnToan(raw) : null;
      if (!meta?.id) continue;
      if (maLoc && chuanHoaMaLKImport(meta.ma_lk) !== maLoc) continue;
      metas.push(rutGonMetaImportXml(meta));
    }
    return metas
      .sort((a, b) => String(b.ghi_luc_iso || '').localeCompare(String(a.ghi_luc_iso || '')))
      .slice(0, limit);
  } catch (e) {
    console.warn('[KHO_DU_LIEU] layLichSuImportXml:', e?.message || e);
    return [];
  }
};

/** Lấy raw XML gốc mới nhất theo MA_LK (hoặc theo id bản ghi). */
export const layRawXmlImport = async ({ ma_lk = '', id = '' } = {}) => {
  await damBaoMigrateLichSuXmlSangKhoChinhThuc();
  const maLoc = chuanHoaMaLKImport(ma_lk);
  const idLoc = String(id || '').trim();

  try {
    if (Platform.OS === 'web') {
      if (idLoc) {
        const rec = await idbXmlImport.get(idLoc);
        return rec?.raw_xml ? String(rec.raw_xml) : '';
      }
      if (!maLoc) return '';
      const all = await idbXmlImport.getAll();
      const newest = all
        .filter((r) => chuanHoaMaLKImport(r?.ma_lk) === maLoc && r?.co_raw_xml)
        .sort((a, b) => String(b.ghi_luc_iso || '').localeCompare(String(a.ghi_luc_iso || '')))[0];
      return newest?.raw_xml ? String(newest.raw_xml) : '';
    }

    if (idLoc) {
      return docRawXmlImportMobile(idLoc);
    }
    if (!maLoc) return '';
    const lichSu = await layLichSuImportXml({ ma_lk: maLoc, gioiHan: 1 });
    const top = lichSu[0];
    if (!top?.id || !top.co_raw_xml) return '';
    return docRawXmlImportMobile(top.id);
  } catch (e) {
    console.warn('[KHO_DU_LIEU] layRawXmlImport:', e?.message || e);
    return '';
  }
};

/** Xóa toàn bộ kho XML import (quyền riêng tư). Không xóa khi xóa kho làm việc. */
export const xoaToanBoLichSuImportXml = async () => {
  try {
    if (Platform.OS === 'web') {
      await idbXmlImport.clear();
      return true;
    }
    const ids = await docDanhSachIdImportXmlMobile();
    for (const id of ids) {
      await AsyncStorage.removeItem(`${PREFIX_XML_IMPORT_MOBILE}${id}`).catch(() => {});
      await xoaJsonChunkTheoKhoa(`${PREFIX_XML_IMPORT_RAW_MOBILE}${id}`).catch(() => {});
    }
    await AsyncStorage.removeItem(KHO_XML_IMPORT_INDEX_MOBILE).catch(() => {});
    return true;
  } catch (e) {
    console.error('[KHO_DU_LIEU] xoaToanBoLichSuImportXml:', e);
    return false;
  }
};

const parseNgayXml130 = (val) => {
  const digits = String(val || '').replace(/\D/g, '');
  if (digits.length < 8) return null;
  const nam = Number(digits.slice(0, 4));
  const thang = Number(digits.slice(4, 6)) - 1;
  const ngay = Number(digits.slice(6, 8));
  const gio = Number(digits.slice(8, 10) || '0');
  const phut = Number(digits.slice(10, 12) || '0');
  const parsed = new Date(nam, thang, ngay, gio, phut, 0, 0);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
};

const layBangHoSo = (hoSo, ten) => {
  const lower = ten.toLowerCase();
  const raw = hoSo?.[lower] ?? hoSo?.[ten];
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === 'object') return [raw];
  return [];
};

const tomTatHoSoChoLichSu = (hoSo) => {
  const xml2 = layBangHoSo(hoSo, 'XML2');
  const xml3 = layBangHoSo(hoSo, 'XML3');
  const maThuoc = xml2.map((r) => String(r?.MA_THUOC || r?.ma_thuoc || '').trim()).filter(Boolean);
  const maDv = xml3.map((r) => String(r?.MA_DVKT || r?.ma_dvkt || '').trim()).filter(Boolean);
  return {
    so_thuoc: xml2.length,
    so_dvkt: xml3.length,
    mau_ma_thuoc: [...new Set(maThuoc)].slice(0, 24),
    mau_ma_dvkt: [...new Set(maDv)].slice(0, 24),
  };
};

const ghiMotLanLichSu = async (hoSo) => {
  const x1 = hoSo?.xml1 || hoSo?.XML1;
  if (!x1 || typeof x1 !== 'object') return;
  const ma_bn = String(x1.MA_BN || x1.ma_bn || '').trim();
  const ma_lk = String(hoSo.ma_lk || x1.MA_LK || x1.ma_lk || '').trim();
  if (!ma_bn || !ma_lk) return;

  const lan = {
    ma_lk,
    ma_bn,
    ho_ten: String(x1.HO_TEN || '').trim(),
    ngay_vao: String(x1.NGAY_VAO || '').trim(),
    ngay_ra: String(x1.NGAY_RA || '').trim(),
    ghi_luc_iso: new Date().toISOString(),
    tom_tat: tomTatHoSoChoLichSu(hoSo),
  };

  if (Platform.OS === 'web') {
    const cur = await idbLichSu.get(ma_bn);
    const cac_lan = Array.isArray(cur?.cac_lan) ? cur.cac_lan.filter((x) => x?.ma_lk !== ma_lk) : [];
    cac_lan.push(lan);
    cac_lan.sort((a, b) => String(b.ngay_ra || '').localeCompare(String(a.ngay_ra || '')));
    await idbLichSu.put({
      ma_bn,
      cac_lan: cac_lan,
      cap_nhat: Date.now(),
    });
    return;
  }

  const key = `${PREFIX_LICH_SU_MOBILE}${ma_bn}`;
  const raw = await AsyncStorage.getItem(key);
  let rec = raw ? parseJsonAnToan(raw) : null;
  if (!rec || !Array.isArray(rec.cac_lan)) rec = { ma_bn, cac_lan: [] };
  rec.cac_lan = rec.cac_lan.filter((x) => x?.ma_lk !== ma_lk);
  rec.cac_lan.push(lan);
  rec.cac_lan.sort((a, b) => String(b.ngay_ra || '').localeCompare(String(a.ngay_ra || '')));
  rec.cac_lan = rec.cac_lan;
  rec.cap_nhat = Date.now();
  await AsyncStorage.setItem(key, JSON.stringify(rec));

  const rawIdx = await AsyncStorage.getItem(KHO_LICH_SU_INDEX_MOBILE);
  const idx = rawIdx ? (parseJsonAnToan(rawIdx) || []) : [];
  if (!idx.includes(ma_bn)) {
    idx.push(ma_bn);
    await AsyncStorage.setItem(KHO_LICH_SU_INDEX_MOBILE, JSON.stringify(idx));
  }
};

const rutGonDongKetQuaPhien = (row = {}) => ({
  ma_luat: String(row.ma_luat || row.MA_LUAT || '').trim(),
  muc_do: String(row.muc_do || row.MUC_DO || '').trim(),
  truong_loi: String(row.truong_loi || row.TRUONG_LOI || '').trim(),
  phan_he: String(row.phan_he || row.PHAN_HE || '').trim(),
  canh_bao: String(row.canh_bao || row.CANH_BAO || row.message || '').slice(0, 360),
  index: Number.isFinite(row.index) ? row.index : undefined,
});

const tomTatPhienGiamDinh = (ketQuaGiamDinh) => {
  const ds = Array.isArray(ketQuaGiamDinh) ? ketQuaGiamDinh : [];
  const demMucDo = { Error: 0, Warning: 0, Info: 0, Khac: 0 };
  const maLuatSet = new Set();
  for (let i = 0; i < ds.length; i += 1) {
    const row = ds[i] || {};
    const m = String(row.ma_luat || row.MA_LUAT || '').trim();
    if (m) maLuatSet.add(m);
    const md = String(row.muc_do || row.MUC_DO || '').trim();
    if (md === 'Error') demMucDo.Error += 1;
    else if (md === 'Warning') demMucDo.Warning += 1;
    else if (md === 'Info') demMucDo.Info += 1;
    else demMucDo.Khac += 1;
  }
  const ma_luat_lap = [...maLuatSet].sort();
  return {
    so_dong_canh_bao: ds.length,
    so_ma_luat_khac_biet: ma_luat_lap.length,
    dem_muc_do: demMucDo,
    ma_luat_lap: ma_luat_lap.slice(0, 400),
  };
};

const layMetaXml1TuHoSo = (hoSo = {}) => {
  const x1Data = hoSo?.xml1 || hoSo?.XML1 || {};
  const x1 = Array.isArray(x1Data) ? (x1Data[0] || {}) : x1Data;
  return {
    ten_bn: String(hoSo.ten_bn || hoSo.ten_benh_nhan || x1.HO_TEN || '').trim(),
    ma_loai_kcb: String(x1.MA_LOAI_KCB || x1.ma_loai_kcb || '').trim(),
    chan_doan_rv: String(x1.CHAN_DOAN_RV || hoSo.ten_benh || '').trim(),
    t_bhtt: Number(x1.T_BHTT || 0),
    t_bntt: Number(x1.T_BNTT || 0),
  };
};

const layKetQuaGiamDinhTuSnapshot = async (snap = {}) => {
  if (!snap || typeof snap !== 'object') return [];
  if (Array.isArray(snap.ket_qua_giam_dinh)) return snap.ket_qua_giam_dinh;
  if (snap.ket_qua_giam_dinh_gzip) {
    const giai = await giaiNenJsonGzipBase64(snap.ket_qua_giam_dinh_gzip);
    if (Array.isArray(giai)) return giai;
  }
  return [];
};

const taoHoSoSnapshotGon = async (hoSoChuan = {}, kq = []) => {
  const x1Data = hoSoChuan?.xml1 || hoSoChuan?.XML1 || {};
  const x1 = Array.isArray(x1Data) ? { ...(x1Data[0] || {}) } : { ...x1Data };
  const meta = layMetaXml1TuHoSo(hoSoChuan);
  const snap = {
    phien_ban: PHIEN_BAN_HO_SO_GD_GON,
    ma_lk: String(hoSoChuan.ma_lk || x1.MA_LK || '').trim(),
    ten_bn: meta.ten_bn,
    thoi_gian: hoSoChuan.thoi_gian,
    ten_file_goc: String(hoSoChuan.ten_file_goc || hoSoChuan._ten_file || '').slice(0, 260),
    xml_import_id: String(hoSoChuan.xml_import_id || '').trim(),
    xml1: x1,
  };
  const gzip = await nenJsonGzipBase64(kq);
  if (gzip) {
    snap.ket_qua_giam_dinh_gzip = gzip;
    snap.nen_ket_qua = true;
    snap.so_loi_goc = kq.length;
  } else {
    snap.ket_qua_giam_dinh = kq;
  }
  return snap;
};

const moRongBanGhiHoSoGdLuuTru = async (rec = null) => {
  if (!rec || typeof rec !== 'object') return rec;
  const snap = rec.ho_so_snapshot;
  if (!snap || typeof snap !== 'object') return rec;
  const kq = await layKetQuaGiamDinhTuSnapshot(snap);
  if (!kq.length && !snap.ket_qua_giam_dinh && !snap.ket_qua_giam_dinh_gzip) return rec;
  return {
    ...rec,
    ho_so_snapshot: {
      ...snap,
      ket_qua_giam_dinh: kq,
    },
  };
};

const taoBanGhiHoSoGdLuuTru = async (hoSoChuan = {}) => {
  const ma_lk = String(hoSoChuan?.ma_lk || '').trim();
  const kq = hoSoChuan?.ket_qua_giam_dinh;
  if (!ma_lk || !Array.isArray(kq)) return null;
  const meta = layMetaXml1TuHoSo(hoSoChuan);
  const hoSoSnapshot = await taoHoSoSnapshotGon(hoSoChuan, kq);
  return {
    id: `hsgd_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
    ma_lk,
    ghi_luc_iso: new Date().toISOString(),
    thoi_gian: String(hoSoChuan.thoi_gian || new Date().toLocaleString('vi-VN')),
    ten_bn: meta.ten_bn,
    ma_loai_kcb: meta.ma_loai_kcb,
    chan_doan_rv: meta.chan_doan_rv,
    t_bhtt: meta.t_bhtt,
    t_bntt: meta.t_bntt,
    ten_file_goc: String(hoSoChuan.ten_file_goc || hoSoChuan._ten_file || '').slice(0, 260),
    xml_import_id: String(hoSoChuan.xml_import_id || '').trim(),
    so_loi: kq.length,
    tom_tat: tomTatPhienGiamDinh(kq),
    ho_so_snapshot: hoSoSnapshot,
    luu_gon: true,
    nen_ket_qua: Boolean(hoSoSnapshot.nen_ket_qua),
  };
};

const docDanhSachIdHoSoGdLuuMobile = async () => {
  const raw = await AsyncStorage.getItem(KHO_HO_SO_GD_INDEX_MOBILE);
  const ids = raw ? (parseJsonAnToan(raw) || []) : [];
  return Array.isArray(ids) ? ids.filter(Boolean) : [];
};

const capNhatIndexHoSoGdLuuMobile = async (ids = []) => {
  const unique = Array.from(new Set((Array.isArray(ids) ? ids : []).filter(Boolean)));
  await AsyncStorage.setItem(KHO_HO_SO_GD_INDEX_MOBILE, JSON.stringify(unique));
  return unique;
};

/** Ghi bản lưu hồ sơ đã giám định vào kho lịch sử bền (không xóa khi làm mới kho làm việc). */
const ghiHoSoGiamDinhVaoLichSuLuuTru = async (hoSoChuan) => {
  const banGhi = await taoBanGhiHoSoGdLuuTru(hoSoChuan);
  if (!banGhi) return null;

  if (Platform.OS === 'web') {
    await idbHoSoGdLuuTru.put(banGhi);
    return banGhi;
  }

  await luuJsonChunkTheoKhoa(`${PREFIX_HO_SO_GD_LUU_MOBILE}${banGhi.id}`, banGhi);
  const ids = await docDanhSachIdHoSoGdLuuMobile();
  if (!ids.includes(banGhi.id)) ids.unshift(banGhi.id);
  await capNhatIndexHoSoGdLuuMobile(ids);
  return banGhi;
};

/** Ghi một phiên kiểm tra (sau khi hồ sơ đã chuẩn hóa cảnh báo). Bỏ qua nếu chưa có mảng ket_qua_giam_dinh. */
const ghiMotPhienGiamDinh = async (hoSoChuan) => {
  const ma_lk = String(hoSoChuan?.ma_lk || '').trim();
  const kq = hoSoChuan?.ket_qua_giam_dinh;
  if (!ma_lk || !Array.isArray(kq)) return;

  const meta = layMetaXml1TuHoSo(hoSoChuan);
  const snapshot = kq.map(rutGonDongKetQuaPhien);
  const phien = {
    id_phien: `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
    ghi_luc_iso: new Date().toISOString(),
    tom_tat: tomTatPhienGiamDinh(kq),
    ket_qua_snapshot: snapshot,
    so_dong_bi_cat: 0,
    xml_import_id: String(hoSoChuan?.xml_import_id || '').trim() || undefined,
    ten_file_goc: String(hoSoChuan?.ten_file_goc || hoSoChuan?._ten_file || '').slice(0, 260) || undefined,
    ten_bn: meta.ten_bn || undefined,
    ma_loai_kcb: meta.ma_loai_kcb || undefined,
    chan_doan_rv: meta.chan_doan_rv || undefined,
    so_loi: kq.length,
  };

  if (Platform.OS === 'web') {
    const cur = await idbPhienGd.get(ma_lk);
    const cac_phien = Array.isArray(cur?.cac_phien) ? [...cur.cac_phien] : [];
    cac_phien.unshift(phien);
    await idbPhienGd.put({
      ma_lk,
      cac_phien: cac_phien,
      cap_nhat: Date.now(),
    });
    return;
  }

  const key = `${PREFIX_PHIEN_GD_MOBILE}${ma_lk}`;
  const raw = await AsyncStorage.getItem(key);
  let rec = raw ? parseJsonAnToan(raw) : null;
  if (!rec || !Array.isArray(rec.cac_phien)) rec = { ma_lk, cac_phien: [] };
  rec.cac_phien.unshift(phien);
  rec.cac_phien = rec.cac_phien;
  rec.cap_nhat = Date.now();
  await AsyncStorage.setItem(key, JSON.stringify(rec));
};

/** Gọi từ module lưu kho khác (ví dụ kho EMR) khi đã có `ket_qua_giam_dinh` + MA_LK. */
export const ghiPhienGiamDinhSauLuuKho = async (hoSo) => {
  try {
    const maLK = hoSo?.ma_lk || hoSo?.XML1?.MA_LK || hoSo?.xml1?.MA_LK;
    if (!maLK) return;
    await ghiMotPhienGiamDinh(chuanHoaBanGhiHoSo({ ...hoSo, ma_lk: maLK }));
  } catch (e) {
    console.warn('[KHO_DU_LIEU] ghiPhienGiamDinhSauLuuKho:', e?.message || e);
  }
};

const taoKhoaHoSo = (maLK) => `${PREFIX_HS_KEY}${maLK}`;
const taoKhoaMetaChunkHoSo = (maLK) => `${taoKhoaHoSo(maLK)}_CHUNKS`;
const taoKhoaChunkHoSo = (maLK, index) => `${taoKhoaHoSo(maLK)}_CHUNK_${index}`;
const chuanHoaDanhSachMaLK = (danhSach = []) => Array.from(new Set((Array.isArray(danhSach) ? danhSach : []).filter(Boolean)));
const tachThanhChunkText = (payload = '', kichThuoc = DETAIL_CHUNK_BYTES) => {
  const text = String(payload || '');
  if (!text) return [''];
  const out = [];
  for (let i = 0; i < text.length; i += kichThuoc) {
    out.push(text.slice(i, i + kichThuoc));
  }
  return out;
};
const parseJsonAnToan = (raw) => {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (_error) {
    return null;
  }
};
const chuanHoaKhoaChunk = (key = '') => {
  const raw = String(key || '').trim();
  if (!raw) return '';
  if (raw.includes('_CHUNK_')) return raw.slice(0, raw.indexOf('_CHUNK_'));
  if (raw.endsWith('_CHUNKS')) return raw.slice(0, -'_CHUNKS'.length);
  return raw;
};
const laKhoaDanhMucUngDung = (key = '') => {
  const raw = chuanHoaKhoaChunk(key);
  if (!raw) return false;
  if (KHO_DANH_MUC_EXACT_KEYS.has(raw)) return true;
  return KHO_DANH_MUC_PREFIXES.some((prefix) => raw.startsWith(prefix));
};
const chuanHoaDuLieuDanhMuc = (value) => (Array.isArray(value) ? value : []);
const docJsonChunkTheoKhoa = async (key) => {
  const baseKey = chuanHoaKhoaChunk(key);
  if (!baseKey) return null;
  const chunkCount = Number(await AsyncStorage.getItem(`${baseKey}_CHUNKS`)) || 0;
  if (chunkCount > 0) {
    const chunkKeys = Array.from({ length: chunkCount }, (_, index) => `${baseKey}_CHUNK_${index}`);
    const chunkPairs = await AsyncStorage.multiGet(chunkKeys);
    let payload = '';
    chunkPairs.forEach(([, raw]) => {
      if (raw) payload += String(raw);
    });
    return parseJsonAnToan(payload);
  }
  return parseJsonAnToan(await AsyncStorage.getItem(baseKey));
};
const docJsonChunkTuLocalStorageDongBo = (key) => {
  const baseKey = chuanHoaKhoaChunk(key);
  const localStorageRef = getLocalStorage();
  if (!baseKey || !localStorageRef) return null;
  try {
    const chunkCount = Number(localStorageRef.getItem(`${baseKey}_CHUNKS`)) || 0;
    if (chunkCount > 0) {
      let payload = '';
      for (let index = 0; index < chunkCount; index += 1) {
        payload += String(localStorageRef.getItem(`${baseKey}_CHUNK_${index}`) || '');
      }
      return parseJsonAnToan(payload);
    }
    return parseJsonAnToan(localStorageRef.getItem(baseKey));
  } catch (_error) {
    return null;
  }
};
const luuJsonChunkTheoKhoa = async (key, value, chunkBytes = DETAIL_CHUNK_BYTES) => {
  const baseKey = chuanHoaKhoaChunk(key);
  if (!baseKey) return false;

  const payload = JSON.stringify(value ?? []);
  const keyMeta = `${baseKey}_CHUNKS`;
  const oldChunkCount = Number(await AsyncStorage.getItem(keyMeta)) || 0;

  if (payload.length <= chunkBytes) {
    await AsyncStorage.setItem(baseKey, payload);
    const dsCanXoa = [keyMeta];
    for (let index = 0; index < oldChunkCount; index += 1) {
      dsCanXoa.push(`${baseKey}_CHUNK_${index}`);
    }
    if (dsCanXoa.length > 0) await AsyncStorage.multiRemove(dsCanXoa);
    return true;
  }

  const chunks = tachThanhChunkText(payload, chunkBytes);
  const pairs = [[keyMeta, String(chunks.length)]];
  chunks.forEach((chunk, index) => {
    pairs.push([`${baseKey}_CHUNK_${index}`, chunk]);
  });
  await AsyncStorage.multiSet(pairs);

  const dsCanXoa = [baseKey];
  for (let index = chunks.length; index < oldChunkCount; index += 1) {
    dsCanXoa.push(`${baseKey}_CHUNK_${index}`);
  }
  if (dsCanXoa.length > 0) await AsyncStorage.multiRemove(dsCanXoa);
  return true;
};

const xoaJsonChunkTheoKhoa = async (key) => {
  const baseKey = chuanHoaKhoaChunk(key);
  if (!baseKey) return false;
  const oldChunkCount = Number(await AsyncStorage.getItem(`${baseKey}_CHUNKS`)) || 0;
  const dsCanXoa = [`${baseKey}_CHUNKS`, baseKey];
  for (let index = 0; index < oldChunkCount; index += 1) {
    dsCanXoa.push(`${baseKey}_CHUNK_${index}`);
  }
  await AsyncStorage.multiRemove(dsCanXoa).catch(() => {});
  return true;
};

const migrateDanhMucWebToIndexedDb = async ({ force = false } = {}) => {
  if (!laMoiTruongWeb()) return { ok: true, count: 0 };
  if (migrateDanhMucIdbPromise && !force) return migrateDanhMucIdbPromise;

  migrateDanhMucIdbPromise = (async () => {
    const localStorageRef = getLocalStorage();
    const flagKey = 'CDSS_IDB_CATALOG_MIGRATED_V2';
    try {
      if (!force && localStorageRef?.getItem(flagKey) === '1') {
        return { ok: true, count: 0, skipped: true };
      }

      const allKeys = await AsyncStorage.getAllKeys().catch(() => []);
      const baseKeys = Array.from(
        new Set((Array.isArray(allKeys) ? allKeys : []).map((key) => chuanHoaKhoaChunk(key)).filter(laKhoaDanhMucUngDung))
      );

      let migrated = 0;
      for (const baseKey of baseKeys) {
        const raw = await docJsonChunkTheoKhoa(baseKey);
        const normalized = chuanHoaDuLieuDanhMuc(raw);
        await idbDanhMuc.put({ key: baseKey, data: normalized, updated_at: Date.now() });
        await xoaJsonChunkTheoKhoa(baseKey).catch(() => {});
        DANH_MUC_CACHE.set(baseKey, normalized);
        migrated += 1;
      }

      localStorageRef?.setItem(flagKey, '1');
      return { ok: true, count: migrated };
    } catch (error) {
      console.warn('[KHO_DU_LIEU] Migrate danh mục web sang IndexedDB thất bại:', error);
      return { ok: false, count: 0, error };
    } finally {
      migrateDanhMucIdbPromise = null;
    }
  })();

  return migrateDanhMucIdbPromise;
};

// ============================================================================
// PHẦN 3: CÁC HÀM XUẤT KHẨU (API CHUNG CHO CẢ WEB VÀ MOBILE)
// ============================================================================

/**
 * 1. LƯU HỒ SƠ VÀO KHO
 * Web: IndexedDB (dung lượng GB). Mobile: AsyncStorage (phân mảnh).
 */
const docDanhSachMaLKMobile = async () => {
  const indexData = await AsyncStorage.getItem(KHO_INDEX_KEY);
  if (!indexData) return [];
  return chuanHoaDanhSachMaLK(parseJsonAnToan(indexData) || []);
};

const docNhieuPayloadHoSoMobile = async (danhSachMaLK = []) => {
  const dsMaLK = chuanHoaDanhSachMaLK(danhSachMaLK);
  if (dsMaLK.length === 0) return [];

  const dsKhoaHoSo = dsMaLK.map((maLK) => taoKhoaHoSo(maLK));
  const dsKhoaMeta = dsMaLK.map((maLK) => taoKhoaMetaChunkHoSo(maLK));
  const basePairs = await AsyncStorage.multiGet([...dsKhoaHoSo, ...dsKhoaMeta]);
  const baseMap = new Map(basePairs);
  const chunkCountMap = new Map();
  const dsKhoaChunk = [];

  dsMaLK.forEach((maLK) => {
    const soChunk = Number(baseMap.get(taoKhoaMetaChunkHoSo(maLK))) || 0;
    chunkCountMap.set(maLK, soChunk);
    for (let i = 0; i < soChunk; i += 1) {
      dsKhoaChunk.push(taoKhoaChunkHoSo(maLK, i));
    }
  });

  const chunkMap = dsKhoaChunk.length > 0
    ? new Map(await AsyncStorage.multiGet(dsKhoaChunk))
    : new Map();

  return dsMaLK.map((maLK) => {
    const soChunk = chunkCountMap.get(maLK) || 0;
    if (soChunk > 0) {
      let payload = '';
      for (let i = 0; i < soChunk; i += 1) {
        payload += String(chunkMap.get(taoKhoaChunkHoSo(maLK, i)) || '');
      }
      return payload || null;
    }
    return baseMap.get(taoKhoaHoSo(maLK)) || null;
  });
};

const luuChiTietHoSoMobile = async (maLK, hoSo) => {
  const key = taoKhoaHoSo(maLK);
  const keyMeta = taoKhoaMetaChunkHoSo(maLK);
  const payload = JSON.stringify(hoSo);
  const oldChunkCount = Number(await AsyncStorage.getItem(keyMeta)) || 0;

  if (payload.length <= DETAIL_CHUNK_BYTES) {
    await AsyncStorage.setItem(key, payload);
    const dsCanXoa = [keyMeta];
    for (let i = 0; i < oldChunkCount; i += 1) {
      dsCanXoa.push(taoKhoaChunkHoSo(maLK, i));
    }
    if (dsCanXoa.length > 0) await AsyncStorage.multiRemove(dsCanXoa);
    return;
  }

  const chunks = tachThanhChunkText(payload);
  const pairs = [[keyMeta, String(chunks.length)]];
  chunks.forEach((chunk, index) => {
    pairs.push([taoKhoaChunkHoSo(maLK, index), chunk]);
  });
  await AsyncStorage.multiSet(pairs);

  const dsCanXoa = [key];
  for (let i = chunks.length; i < oldChunkCount; i += 1) {
    dsCanXoa.push(taoKhoaChunkHoSo(maLK, i));
  }
  if (dsCanXoa.length > 0) await AsyncStorage.multiRemove(dsCanXoa);
};

const xoaChiTietHoSoMobile = async (maLK) => {
  const key = taoKhoaHoSo(maLK);
  const keyMeta = taoKhoaMetaChunkHoSo(maLK);
  const chunkCount = Number(await AsyncStorage.getItem(keyMeta)) || 0;
  const dsCanXoa = [key, keyMeta];
  for (let i = 0; i < chunkCount; i += 1) {
    dsCanXoa.push(taoKhoaChunkHoSo(maLK, i));
  }
  await AsyncStorage.multiRemove(dsCanXoa);
};

export const layDanhSachMaLKTuKho = async () => {
  try {
    if (Platform.OS === 'web') {
      await _migrateFromLocalStorage();
      return chuanHoaDanhSachMaLK(await idb.getAllKeys());
    }
    return await docDanhSachMaLKMobile();
  } catch (error) {
    console.error('[KHO_DU_LIEU] Lỗi lấy danh sách MA_LK:', error);
    return [];
  }
};

export const layNhieuHoSoTuKho = async (danhSachMaLK = []) => {
  try {
    const dsMaLK = chuanHoaDanhSachMaLK(danhSachMaLK);
    if (dsMaLK.length === 0) return [];

    if (Platform.OS === 'web') {
      await _migrateFromLocalStorage();
      const ketQua = await idb.getMany(dsMaLK);
      return ketQua.map(chuanHoaBanGhiHoSo).filter(Boolean);
    }

    const payloads = await docNhieuPayloadHoSoMobile(dsMaLK);
    return payloads
      .map((raw) => chuanHoaBanGhiHoSo(parseJsonAnToan(raw)))
      .filter(Boolean);
  } catch (error) {
    console.error('[KHO_DU_LIEU] Lỗi lấy nhiều hồ sơ:', error);
    return [];
  }
};

export const luuHoSoVaoKho = async (danhSachHoSoMoi) => {
  try {
    if (!danhSachHoSoMoi || danhSachHoSoMoi.length === 0) return;

    if (Platform.OS === 'web') {
      const dsCanLuu = [];
      for (const hoSo of danhSachHoSoMoi) {
        const maLK = hoSo.ma_lk || hoSo.XML1?.MA_LK || hoSo.xml1?.MA_LK;
        if (!maLK) continue;
        // Loại bỏ trường _raw (luôn rỗng) để tiết kiệm không gian
        const { _raw, ...hoSoLuu } = hoSo;
        const banGhi = chuanHoaBanGhiHoSo({
          ...hoSoLuu,
          ma_lk: maLK,
          thoi_gian: hoSoLuu.thoi_gian || new Date().toLocaleString('vi-VN'),
        });
        dsCanLuu.push(banGhi);
      }
      await idb.bulkPut(dsCanLuu);
    } else {
      const dsMaLK = await docDanhSachMaLKMobile();

      for (const hoSo of danhSachHoSoMoi) {
        const maLK = hoSo.ma_lk || hoSo.XML1?.MA_LK || hoSo.xml1?.MA_LK;
        if (!maLK) continue;
        const { _raw, ...hoSoLuu } = hoSo;
        await luuChiTietHoSoMobile(maLK, chuanHoaBanGhiHoSo({
          ...hoSoLuu,
          ma_lk: maLK,
          thoi_gian: hoSoLuu.thoi_gian || new Date().toLocaleString('vi-VN'),
        }));
        if (!dsMaLK.includes(maLK)) dsMaLK.push(maLK);
      }
      await AsyncStorage.setItem(KHO_INDEX_KEY, JSON.stringify(chuanHoaDanhSachMaLK(dsMaLK)));
    }

    for (const hoSo of danhSachHoSoMoi) {
      try {
        const maLK = hoSo.ma_lk || hoSo.XML1?.MA_LK || hoSo.xml1?.MA_LK;
        if (!maLK) continue;
        const hoSoCh = chuanHoaBanGhiHoSo({ ...hoSo, ma_lk: maLK });
        await ghiMotLanLichSu(hoSoCh);
        await ghiMotPhienGiamDinh(hoSoCh);
        await ghiHoSoGiamDinhVaoLichSuLuuTru(hoSoCh);
      } catch (e) {
        console.warn('[KHO_DU_LIEU] Không ghi được lịch sử điều trị / phiên kiểm tra:', e?.message || e);
      }
    }

    console.log(`[KHO_DU_LIEU] Đã lưu ${danhSachHoSoMoi.length} hồ sơ thành công.`);
    return true;
  } catch (error) {
    console.error('[KHO_DU_LIEU] Lỗi khi lưu kho:', error);
    throw new Error(`Lỗi lưu hồ sơ: ${error.message || 'Không xác định'}`);
  }
};

/**
 * 2. LẤY TOÀN BỘ HỒ SƠ TỪ KHO
 */
export const layTatCaHoSoTuKho = async () => {
  try {
    if (Platform.OS === 'web') {
      // Chuyển đổi dữ liệu cũ từ localStorage (chỉ chạy lần đầu)
      await _migrateFromLocalStorage();
      const ds = await idb.getAll();
      return ds.map(chuanHoaBanGhiHoSo).reverse();
    } else {
      const dsMaLK = await docDanhSachMaLKMobile();
      if (dsMaLK.length === 0) return [];
      const data = await layNhieuHoSoTuKho(dsMaLK);
      return data.reverse();
    }
  } catch (error) {
    console.error('[KHO_DU_LIEU] Lỗi truy xuất kho:', error);
    return [];
  }
};

/**
 * 3. XÓA MỘT HỒ SƠ KHỎI KHO
 */
export const xoaHoSoKhoiKho = async (maLK_CanXoa) => {
  try {
    if (!maLK_CanXoa) return false;
    if (Platform.OS === 'web') {
      await idb.delete(maLK_CanXoa);
    } else {
      await xoaChiTietHoSoMobile(maLK_CanXoa);
      const dsMaLK = await docDanhSachMaLKMobile();
      await AsyncStorage.setItem(
        KHO_INDEX_KEY,
        JSON.stringify(dsMaLK.filter((ma) => ma !== maLK_CanXoa))
      );
    }
    return true;
  } catch (error) {
    console.error(`[KHO_DU_LIEU] Lỗi xóa hồ sơ ${maLK_CanXoa}:`, error);
    return false;
  }
};

/**
 * 4. XÓA TOÀN BỘ KHO
 */
/**
 * Lịch sử kiểm tra theo MA_BN (để so sánh lần điều trị). Xóa riêng — không gọi khi xóa kho làm việc.
 */
export const layLichSuDieuTriTheoMaBN = async (ma_bn) => {
  const m = String(ma_bn || '').trim();
  if (!m) return { ma_bn: '', cac_lan: [] };
  try {
    if (Platform.OS === 'web') {
      const r = await idbLichSu.get(m);
      return r && Array.isArray(r.cac_lan) ? r : { ma_bn: m, cac_lan: [] };
    }
    const raw = await AsyncStorage.getItem(`${PREFIX_LICH_SU_MOBILE}${m}`);
    const rec = raw ? parseJsonAnToan(raw) : null;
    return rec && Array.isArray(rec.cac_lan) ? rec : { ma_bn: m, cac_lan: [] };
  } catch (e) {
    console.warn('[KHO_DU_LIEU] layLichSuDieuTriTheoMaBN:', e);
    return { ma_bn: m, cac_lan: [] };
  }
};

/**
 * So sánh hồ sơ hiện tại với lần điều trị cùng MA_BN gần nhất trước NGAY_VAO hiện tại.
 * Dùng cho cảnh báo trùng chỉ định/thuốc trong đợt gần nhau.
 */
export const phanTichKhoangCachDieuTri = async (hoSo) => {
  const x1 = hoSo?.xml1 || hoSo?.XML1;
  if (!x1 || typeof x1 !== 'object') {
    return { co_du_lieu: false, ly_do: 'Thiếu XML1' };
  }
  const ma_bn = String(x1.MA_BN || x1.ma_bn || '').trim();
  const ma_lk = String(hoSo?.ma_lk || x1.MA_LK || x1.ma_lk || '').trim();
  if (!ma_bn) return { co_du_lieu: false, ly_do: 'Thiếu MA_BN' };

  const ngay_vao_ht = parseNgayXml130(x1.NGAY_VAO);
  const ls = await layLichSuDieuTriTheoMaBN(ma_bn);
  const cac_lan = (ls.cac_lan || []).filter((l) => l.ma_lk !== ma_lk);

  const truoc = cac_lan
    .map((l) => ({ l, t: parseNgayXml130(l.ngay_ra) }))
    .filter((x) => x.t && ngay_vao_ht && x.t < ngay_vao_ht)
    .sort((a, b) => b.t - a.t)[0]?.l;

  if (!truoc) {
    return { co_du_lieu: true, co_lan_truoc_so_sanh: false };
  }

  const t_ra_truoc = parseNgayXml130(truoc.ngay_ra);
  const ms = ngay_vao_ht && t_ra_truoc ? ngay_vao_ht - t_ra_truoc : 0;
  const so_ngay = Math.max(0, Math.floor(ms / 86400000));
  const so_gio_du = Math.max(0, Math.floor((ms % 86400000) / 3600000));

  const tt_ht = tomTatHoSoChoLichSu(hoSo);
  const mt0 = truoc.tom_tat?.mau_ma_thuoc || [];
  const md0 = truoc.tom_tat?.mau_ma_dvkt || [];
  const trung_thuoc = mt0.filter((t) => tt_ht.mau_ma_thuoc.includes(t));
  const trung_dvkt = md0.filter((d) => tt_ht.mau_ma_dvkt.includes(d));

  return {
    co_du_lieu: true,
    co_lan_truoc_so_sanh: true,
    lan_truoc: truoc,
    so_ngay_tu_ngay_ra_lan_truoc: so_ngay,
    so_gio_du_trong_ngay_dau: so_gio_du,
    trung_ma_thuoc: trung_thuoc,
    trung_ma_dvkt: trung_dvkt,
  };
};

/**
 * Lịch sử các phiên kiểm tra đã lưu (theo MA_LK). Không giới hạn số phiên trong code.
 */
export const layLichSuPhienGiamDinhTheoMaLK = async (ma_lk) => {
  const m = String(ma_lk || '').trim();
  if (!m) return { ma_lk: '', cac_phien: [] };
  try {
    if (Platform.OS === 'web') {
      const r = await idbPhienGd.get(m);
      return r && Array.isArray(r.cac_phien) ? r : { ma_lk: m, cac_phien: [] };
    }
    const raw = await AsyncStorage.getItem(`${PREFIX_PHIEN_GD_MOBILE}${m}`);
    const rec = raw ? parseJsonAnToan(raw) : null;
    return rec && Array.isArray(rec.cac_phien) ? rec : { ma_lk: m, cac_phien: [] };
  } catch (e) {
    console.warn('[KHO_DU_LIEU] layLichSuPhienGiamDinhTheoMaLK:', e);
    return { ma_lk: m, cac_phien: [] };
  }
};

const rutGonBanGhiHoSoGdLuuTruChoDanhSach = (rec = {}) => ({
  id: String(rec.id || ''),
  ma_lk: String(rec.ma_lk || ''),
  ghi_luc_iso: String(rec.ghi_luc_iso || ''),
  thoi_gian: String(rec.thoi_gian || ''),
  ten_bn: String(rec.ten_bn || ''),
  ma_loai_kcb: String(rec.ma_loai_kcb || ''),
  chan_doan_rv: String(rec.chan_doan_rv || ''),
  ten_file_goc: String(rec.ten_file_goc || ''),
  xml_import_id: String(rec.xml_import_id || ''),
  so_loi: Number(rec.so_loi) || 0,
  tom_tat: rec.tom_tat || {},
});

/**
 * Danh sách hồ sơ đã giám định đã lưu bền (metadata — không gồm ho_so_snapshot).
 * Không bị xóa khi `xoaToanBoKho` (làm mới kho làm việc).
 */
export const layDanhSachHoSoGiamDinhLuuTru = async () => {
  try {
    if (Platform.OS === 'web') {
      const all = await idbHoSoGdLuuTru.getAll();
      return (Array.isArray(all) ? all : [])
        .map(rutGonBanGhiHoSoGdLuuTruChoDanhSach)
        .sort((a, b) => String(b.ghi_luc_iso).localeCompare(String(a.ghi_luc_iso)));
    }
    const ids = await docDanhSachIdHoSoGdLuuMobile();
    const out = [];
    for (const id of ids) {
      const raw = await docJsonChunkTheoKhoa(`${PREFIX_HO_SO_GD_LUU_MOBILE}${id}`);
      if (raw && raw.id) out.push(rutGonBanGhiHoSoGdLuuTruChoDanhSach(raw));
    }
    return out.sort((a, b) => String(b.ghi_luc_iso).localeCompare(String(a.ghi_luc_iso)));
  } catch (e) {
    console.warn('[KHO_DU_LIEU] layDanhSachHoSoGiamDinhLuuTru:', e);
    return [];
  }
};

/** Lấy đầy đủ bản lưu (gồm ho_so_snapshot đã giải nén) theo id. */
export const layHoSoGiamDinhLuuTruTheoId = async (id) => {
  const key = String(id || '').trim();
  if (!key) return null;
  try {
    let rec = null;
    if (Platform.OS === 'web') {
      rec = await idbHoSoGdLuuTru.get(key);
    } else {
      rec = await docJsonChunkTheoKhoa(`${PREFIX_HO_SO_GD_LUU_MOBILE}${key}`);
    }
    return await moRongBanGhiHoSoGdLuuTru(rec);
  } catch (e) {
    console.warn('[KHO_DU_LIEU] layHoSoGiamDinhLuuTruTheoId:', e);
    return null;
  }
};

const timHoSoTrongMangXmlTheoMaLK = (ds = [], maLK = '') => {
  const target = String(maLK || '').trim().toUpperCase();
  if (!target) return null;
  return (Array.isArray(ds) ? ds : []).find((hs) => {
    const x1 = hs?.xml1 || hs?.XML1;
    const x1o = Array.isArray(x1) ? (x1[0] || {}) : (x1 || {});
    const mk = String(hs?.ma_lk || x1o.MA_LK || x1o.ma_lk || '').trim().toUpperCase();
    return mk === target;
  }) || null;
};

const dungHoSoTuSnapshotGon = async (banGhi = {}, snap = {}) => {
  const maLK = String(banGhi.ma_lk || snap.ma_lk || '').trim();
  const kq = await layKetQuaGiamDinhTuSnapshot(snap);
  const xmlId = String(banGhi.xml_import_id || snap.xml_import_id || '').trim();
  const rawXml = xmlId ? await layRawXmlImport({ id: xmlId, ma_lk: maLK }) : '';
  if (rawXml) {
    const ds = xuLyFileXML130Va4210(rawXml);
    const found = timHoSoTrongMangXmlTheoMaLK(ds, maLK) || (ds.length === 1 ? ds[0] : null);
    if (found) {
      return chuanHoaBanGhiHoSo({
        ...found,
        ma_lk: maLK,
        ket_qua_giam_dinh: kq,
        xml_import_id: xmlId,
        ten_file_goc: banGhi.ten_file_goc || snap.ten_file_goc || found.ten_file_goc,
        thoi_gian: banGhi.thoi_gian || snap.thoi_gian || new Date().toLocaleString('vi-VN'),
      });
    }
  }
  return chuanHoaBanGhiHoSo({
    ma_lk: maLK,
    ten_bn: banGhi.ten_bn || snap.ten_bn,
    xml1: snap.xml1 || {},
    ket_qua_giam_dinh: kq,
    xml_import_id: xmlId,
    ten_file_goc: banGhi.ten_file_goc || snap.ten_file_goc,
    thoi_gian: banGhi.thoi_gian || snap.thoi_gian || new Date().toLocaleString('vi-VN'),
  });
};

/** Khôi phục hồ sơ từ lịch sử giám định vào kho làm việc. */
export const khoiPhucHoSoGiamDinhVaoKho = async (id) => {
  const banGhi = await layHoSoGiamDinhLuuTruTheoId(id);
  const snap = banGhi?.ho_so_snapshot;
  if (!snap || typeof snap !== 'object') {
    return { ok: false, loi: 'Không tìm thấy bản lưu hồ sơ.' };
  }

  let hoSo;
  const laSnapshotGon = snap.phien_ban === PHIEN_BAN_HO_SO_GD_GON
    || (snap.nen_ket_qua === true)
    || (Array.isArray(snap.ket_qua_giam_dinh) && !snap.du_lieu_goc && !snap.xml2 && !snap.XML2);

  if (laSnapshotGon) {
    hoSo = await dungHoSoTuSnapshotGon(banGhi, snap);
  } else {
    hoSo = chuanHoaBanGhiHoSo({
      ...snap,
      ma_lk: snap.ma_lk || banGhi.ma_lk,
      thoi_gian: banGhi.thoi_gian || snap.thoi_gian || new Date().toLocaleString('vi-VN'),
    });
  }

  if (!hoSo?.ma_lk) return { ok: false, loi: 'Bản lưu thiếu MA_LK.' };
  await luuHoSoVaoKho([hoSo]);
  return { ok: true, ma_lk: hoSo.ma_lk, tu_xml_import: Boolean(snap.xml_import_id) };
};

/** Lưu thủ công danh sách hồ sơ đã giám định vào kho lịch sử bền. */
export const luuThuCongHoSoGiamDinhVaoLichSu = async (danhSachHoSo = []) => {
  const ds = Array.isArray(danhSachHoSo) ? danhSachHoSo : [];
  let dem = 0;
  for (const hoSo of ds) {
    const maLK = hoSo?.ma_lk || hoSo?.XML1?.MA_LK || hoSo?.xml1?.MA_LK;
    if (!maLK || !Array.isArray(hoSo?.ket_qua_giam_dinh)) continue;
    await ghiHoSoGiamDinhVaoLichSuLuuTru(chuanHoaBanGhiHoSo({ ...hoSo, ma_lk: maLK }));
    dem += 1;
  }
  return dem;
};

export const xoaHoSoGiamDinhLuuTru = async (id) => {
  const key = String(id || '').trim();
  if (!key) return false;
  try {
    if (Platform.OS === 'web') {
      await idbHoSoGdLuuTru.delete(key);
      return true;
    }
    await xoaJsonChunkTheoKhoa(`${PREFIX_HO_SO_GD_LUU_MOBILE}${key}`);
    const ids = (await docDanhSachIdHoSoGdLuuMobile()).filter((x) => x !== key);
    await capNhatIndexHoSoGdLuuMobile(ids);
    return true;
  } catch (e) {
    console.error('[KHO_DU_LIEU] xoaHoSoGiamDinhLuuTru:', e);
    return false;
  }
};

/** Xóa toàn bộ lịch sử hồ sơ đã giám định (quyền riêng tư). Không xóa khi xóa kho làm việc. */
export const xoaToanBoHoSoGiamDinhLuuTru = async () => {
  try {
    if (Platform.OS === 'web') {
      await idbHoSoGdLuuTru.clear();
      return true;
    }
    const ids = await docDanhSachIdHoSoGdLuuMobile();
    for (const id of ids) {
      await xoaJsonChunkTheoKhoa(`${PREFIX_HO_SO_GD_LUU_MOBILE}${id}`).catch(() => {});
    }
    await AsyncStorage.removeItem(KHO_HO_SO_GD_INDEX_MOBILE);
    return true;
  } catch (e) {
    console.error('[KHO_DU_LIEU] xoaToanBoHoSoGiamDinhLuuTru:', e);
    return false;
  }
};

/** Xóa toàn bộ log phiên kiểm tra (quyền riêng tư). Không xóa khi xóa kho làm việc. */
export const xoaToanBoLichSuPhienGiamDinh = async () => {
  try {
    if (Platform.OS === 'web') {
      const db = await _openDB();
      await new Promise((resolve, reject) => {
        const tx = db.transaction(IDB_STORE_PHIEN_GD, 'readwrite');
        tx.objectStore(IDB_STORE_PHIEN_GD).clear();
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => reject(tx.error);
      });
      return true;
    }
    const allKeys = await AsyncStorage.getAllKeys().catch(() => []);
    const toRemove = (Array.isArray(allKeys) ? allKeys : []).filter(
      (k) => typeof k === 'string' && k.startsWith(PREFIX_PHIEN_GD_MOBILE)
    );
    if (toRemove.length > 0) await AsyncStorage.multiRemove(toRemove);
    return true;
  } catch (e) {
    console.error('[KHO_DU_LIEU] xoaToanBoLichSuPhienGiamDinh:', e);
    return false;
  }
};

/** Xóa toàn bộ lịch sử điều trị cục bộ (quyền riêng tư / reset sâu). Không xóa khi xóa kho làm việc. */
export const xoaToanBoLichSuDieuTri = async () => {
  try {
    if (Platform.OS === 'web') {
      const db = await _openDB();
      await new Promise((resolve, reject) => {
        const tx = db.transaction(IDB_STORE_LICH_SU, 'readwrite');
        tx.objectStore(IDB_STORE_LICH_SU).clear();
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => reject(tx.error);
      });
      return true;
    }
    const rawIdx = await AsyncStorage.getItem(KHO_LICH_SU_INDEX_MOBILE);
    const idx = rawIdx ? (parseJsonAnToan(rawIdx) || []) : [];
    for (const m of idx) {
      await AsyncStorage.removeItem(`${PREFIX_LICH_SU_MOBILE}${m}`);
    }
    await AsyncStorage.removeItem(KHO_LICH_SU_INDEX_MOBILE);
    return true;
  } catch (e) {
    console.error('[KHO_DU_LIEU] xoaToanBoLichSuDieuTri:', e);
    return false;
  }
};

export const xoaToanBoKho = async () => {
  try {
    if (Platform.OS === 'web') {
      await idb.clear();
      // Xóa cả flag migrate để reset sạch
      getLocalStorage()?.removeItem('CDSS_IDB_MIGRATED_V1');
    } else {
      const dsMaLK = await docDanhSachMaLKMobile();
      for (const maLK of dsMaLK) {
        await xoaChiTietHoSoMobile(maLK);
      }
      await AsyncStorage.removeItem(KHO_INDEX_KEY);
    }
    console.log('[KHO_DU_LIEU] Đã xóa toàn bộ kho lưu trữ.');
    return true;
  } catch (error) {
    console.error('[KHO_DU_LIEU] Lỗi dọn dẹp kho:', error);
    return false;
  }
};


export const layDanhMuc = (key, fallback = []) => {
  const baseKey = chuanHoaKhoaChunk(key);
  if (!baseKey) return chuanHoaDuLieuDanhMuc(fallback);

  if (DANH_MUC_CACHE.has(baseKey)) {
    return chuanHoaDuLieuDanhMuc(DANH_MUC_CACHE.get(baseKey));
  }

  if (Platform.OS === 'web') {
    const raw = docJsonChunkTuLocalStorageDongBo(baseKey);
    const normalized = chuanHoaDuLieuDanhMuc(raw);
    DANH_MUC_CACHE.set(baseKey, normalized);
    return normalized;
  }

  return chuanHoaDuLieuDanhMuc(fallback);
};

export const docDanhMucTuKho = async (key, fallback = []) => {
  const baseKey = chuanHoaKhoaChunk(key);
  if (!baseKey) return chuanHoaDuLieuDanhMuc(fallback);

  if (DANH_MUC_CACHE.has(baseKey)) {
    return chuanHoaDuLieuDanhMuc(DANH_MUC_CACHE.get(baseKey));
  }

  try {
    if (laMoiTruongWeb()) {
      await migrateDanhMucWebToIndexedDb();
      const idbRecord = await idbDanhMuc.get(baseKey).catch(() => null);
      if (idbRecord && Object.prototype.hasOwnProperty.call(idbRecord, 'data')) {
        const normalized = chuanHoaDuLieuDanhMuc(idbRecord.data);
        DANH_MUC_CACHE.set(baseKey, normalized);
        return normalized;
      }
    }

    const raw = await docJsonChunkTheoKhoa(baseKey);
    const normalized = chuanHoaDuLieuDanhMuc(raw);
    DANH_MUC_CACHE.set(baseKey, normalized);
    if (laMoiTruongWeb()) {
      await idbDanhMuc.put({ key: baseKey, data: normalized, updated_at: Date.now() }).catch(() => {});
      await xoaJsonChunkTheoKhoa(baseKey).catch(() => {});
    }
    return normalized;
  } catch (error) {
    console.warn('[KHO_DU_LIEU] Catalog read failed: ' + baseKey + ':', error);
    return chuanHoaDuLieuDanhMuc(fallback);
  }
};

export const capNhatDanhMuc = async (key, data) => {
  const baseKey = chuanHoaKhoaChunk(key);
  if (!baseKey) return false;

  const normalized = chuanHoaDuLieuDanhMuc(data);
  DANH_MUC_CACHE.set(baseKey, normalized);
  if (laMoiTruongWeb()) {
    await idbDanhMuc.put({ key: baseKey, data: normalized, updated_at: Date.now() });
    await xoaJsonChunkTheoKhoa(baseKey).catch(() => {});
    return true;
  }
  await luuJsonChunkTheoKhoa(baseKey, normalized);
  return true;
};

export const dongBoTuBoNho = async ({ force = false } = {}) => {
  if (dongBoDanhMucPromise && !force) return dongBoDanhMucPromise;

  dongBoDanhMucPromise = (async () => {
    try {
      if (laMoiTruongWeb()) {
        await migrateDanhMucWebToIndexedDb();
        const records = await idbDanhMuc.getAll();
        records.forEach((record) => {
          const baseKey = chuanHoaKhoaChunk(record?.key);
          if (!baseKey) return;
          DANH_MUC_CACHE.set(baseKey, chuanHoaDuLieuDanhMuc(record?.data));
        });
        return { ok: true, count: records.length };
      }

      const allKeys = await AsyncStorage.getAllKeys().catch(() => []);
      const baseKeys = Array.from(
        new Set((Array.isArray(allKeys) ? allKeys : []).map((key) => chuanHoaKhoaChunk(key)).filter(laKhoaDanhMucUngDung))
      );

      await Promise.all(
        baseKeys.map(async (baseKey) => {
          const raw = await docJsonChunkTheoKhoa(baseKey);
          DANH_MUC_CACHE.set(baseKey, chuanHoaDuLieuDanhMuc(raw));
        })
      );

      return { ok: true, count: baseKeys.length };
    } catch (error) {
      console.warn('[KHO_DU_LIEU] Catalog cache sync failed:', error);
      return { ok: false, count: 0, error };
    } finally {
      dongBoDanhMucPromise = null;
    }
  })();

  return dongBoDanhMucPromise;
};

const KhoDuLieu = {
  layDanhSachMaLKTuKho,
  layNhieuHoSoTuKho,
  luuHoSoVaoKho,
  layTatCaHoSoTuKho,
  xoaHoSoKhoiKho,
  xoaToanBoKho,
  layLichSuDieuTriTheoMaBN,
  layLichSuPhienGiamDinhTheoMaLK,
  layDanhSachHoSoGiamDinhLuuTru,
  layHoSoGiamDinhLuuTruTheoId,
  khoiPhucHoSoGiamDinhVaoKho,
  luuThuCongHoSoGiamDinhVaoLichSu,
  xoaHoSoGiamDinhLuuTru,
  xoaToanBoHoSoGiamDinhLuuTru,
  damBaoLuuTruBenTrenWeb,
  layThongTinDungLuongKho,
  ghiPhienGiamDinhSauLuuKho,
  phanTichKhoangCachDieuTri,
  xoaToanBoLichSuDieuTri,
  xoaToanBoLichSuPhienGiamDinh,
  luuBanGhiImportXml,
  layLichSuImportXml,
  layRawXmlImport,
  damBaoMigrateLichSuXmlSangKhoChinhThuc,
  xoaToanBoLichSuImportXml,
  layDanhMuc,
  docDanhMucTuKho,
  capNhatDanhMuc,
  dongBoTuBoNho,
};

export default KhoDuLieu;
