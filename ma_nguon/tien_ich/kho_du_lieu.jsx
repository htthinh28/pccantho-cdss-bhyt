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
 * Kho XML đầu vào (file gốc đã import — không dùng AsyncStorage tạm):
 *   store `xml_import` (web) / key `CDSS_XMLIMP_*` (mobile). Lưu raw XML + metadata;
 *   thay thế `CDSS_LICH_SU_XML` (migrate một lần).
 * ============================================================================
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { chuanHoaHoSoCanhBao } from './chuan_hoa_van_ban';

const laMoiTruongWeb = () => Platform.OS === 'web' || typeof window !== 'undefined' || typeof document !== 'undefined';
const getIndexedDb = () => globalThis?.indexedDB || null;
const getLocalStorage = () => globalThis?.localStorage || null;

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
const IDB_VERSION = 5;
const MAX_LAN_LICH_SU_PER_BN = 48;
const MAX_PHIEN_GD_PER_MA_LK = 48;
const MAX_XML_IMPORT_RECORDS = 600;
const MAX_PHIEN_KET_QUA_SNAPSHOT = 300;

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
  try {
    if (Platform.OS === 'web') {
      const all = await idbXmlImport.getAll();
      if (all.length <= MAX_XML_IMPORT_RECORDS) return;
      const sorted = [...all].sort((a, b) => String(b.ghi_luc_iso || '').localeCompare(String(a.ghi_luc_iso || '')));
      const canXoa = sorted.slice(MAX_XML_IMPORT_RECORDS);
      for (const rec of canXoa) {
        if (rec?.id) await idbXmlImport.delete(rec.id);
      }
      return;
    }
    const ids = await docDanhSachIdImportXmlMobile();
    if (ids.length <= MAX_XML_IMPORT_RECORDS) return;
    const metas = [];
    for (const id of ids) {
      const raw = await AsyncStorage.getItem(`${PREFIX_XML_IMPORT_MOBILE}${id}`);
      const meta = raw ? parseJsonAnToan(raw) : null;
      if (meta?.id) metas.push(meta);
    }
    metas.sort((a, b) => String(b.ghi_luc_iso || '').localeCompare(String(a.ghi_luc_iso || '')));
    const giu = new Set(metas.slice(0, MAX_XML_IMPORT_RECORDS).map((m) => m.id));
    for (const meta of metas) {
      if (giu.has(meta.id)) continue;
      await AsyncStorage.removeItem(`${PREFIX_XML_IMPORT_MOBILE}${meta.id}`).catch(() => {});
      await xoaJsonChunkTheoKhoa(`${PREFIX_XML_IMPORT_RAW_MOBILE}${meta.id}`).catch(() => {});
    }
    await ghiDanhSachIdImportXmlMobile([...giu]);
  } catch (e) {
    console.warn('[KHO_DU_LIEU] catGiamLichSuImportXml:', e?.message || e);
  }
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
  const limit = Math.max(1, Math.min(Number(gioiHan) || 300, MAX_XML_IMPORT_RECORDS));

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
      cac_lan: cac_lan.slice(0, MAX_LAN_LICH_SU_PER_BN),
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
  rec.cac_lan = rec.cac_lan.slice(0, MAX_LAN_LICH_SU_PER_BN);
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

/** Ghi một phiên kiểm tra (sau khi hồ sơ đã chuẩn hóa cảnh báo). Bỏ qua nếu chưa có mảng ket_qua_giam_dinh. */
const ghiMotPhienGiamDinh = async (hoSoChuan) => {
  const ma_lk = String(hoSoChuan?.ma_lk || '').trim();
  const kq = hoSoChuan?.ket_qua_giam_dinh;
  if (!ma_lk || !Array.isArray(kq)) return;

  const snapshot = kq.slice(0, MAX_PHIEN_KET_QUA_SNAPSHOT).map(rutGonDongKetQuaPhien);
  const phien = {
    id_phien: `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
    ghi_luc_iso: new Date().toISOString(),
    tom_tat: tomTatPhienGiamDinh(kq),
    ket_qua_snapshot: snapshot,
    so_dong_bi_cat: kq.length > MAX_PHIEN_KET_QUA_SNAPSHOT ? kq.length - MAX_PHIEN_KET_QUA_SNAPSHOT : 0,
    xml_import_id: String(hoSoChuan?.xml_import_id || '').trim() || undefined,
    ten_file_goc: String(hoSoChuan?.ten_file_goc || hoSoChuan?._ten_file || '').slice(0, 260) || undefined,
  };

  if (Platform.OS === 'web') {
    const cur = await idbPhienGd.get(ma_lk);
    const cac_phien = Array.isArray(cur?.cac_phien) ? [...cur.cac_phien] : [];
    cac_phien.unshift(phien);
    await idbPhienGd.put({
      ma_lk,
      cac_phien: cac_phien.slice(0, MAX_PHIEN_GD_PER_MA_LK),
      cap_nhat: Date.now(),
    });
    return;
  }

  const key = `${PREFIX_PHIEN_GD_MOBILE}${ma_lk}`;
  const raw = await AsyncStorage.getItem(key);
  let rec = raw ? parseJsonAnToan(raw) : null;
  if (!rec || !Array.isArray(rec.cac_phien)) rec = { ma_lk, cac_phien: [] };
  rec.cac_phien.unshift(phien);
  rec.cac_phien = rec.cac_phien.slice(0, MAX_PHIEN_GD_PER_MA_LK);
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
 * Lịch sử các phiên kiểm tra đã lưu (theo MA_LK): mới nhất trước, tối đa MAX_PHIEN_GD_PER_MA_LK.
 * Mỗi phiên: id_phien, ghi_luc_iso, tom_tat, ket_qua_snapshot (tối đa MAX_PHIEN_KET_QUA_SNAPSHOT dòng).
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
