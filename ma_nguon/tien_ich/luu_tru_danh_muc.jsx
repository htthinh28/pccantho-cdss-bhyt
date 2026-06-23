import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import {
    COT_BYT_PL10_DOI_TUONG,
    DU_LIEU_BYT_PL10_DOI_TUONG,
    PHIEN_BAN_BYT_PL10_DOI_TUONG,
} from '../danh_muc_byt/10_ma_doi_tuong_kham/du_lieu_pl10_doi_tuong';
import {
    COT_DANH_MUC_DVKT_M05,
    DANH_MUC_DVKT_M05,
    PHIEN_BAN_DANH_MUC_DVKT_M05,
} from '../thanh_phan/dich_vu_ky_thuat';
import {
    COT_DANH_MUC_ICD10,
    DANH_MUC_ICD10,
    PHIEN_BAN_DANH_MUC_ICD10,
} from '../thanh_phan/dm_icd10_seed';
import {
    COT_DANH_MUC_KHOA_LS_M01,
    DANH_MUC_KHOA_LS_M01,
    PHIEN_BAN_DANH_MUC_KHOA_LS_M01,
} from '../thanh_phan/dm_khoals_m01dm';
import {
    COT_DANH_MUC_ICD10_KE_DON_TREN_30_NGAY,
    DANH_MUC_ICD10_KE_DON_TREN_30_NGAY,
    PHIEN_BAN_DANH_MUC_ICD10_KE_DON_TREN_30_NGAY,
} from '../thanh_phan/icd10_ke_don_tren_30_ngay';
import {
    COT_DANH_MUC_ICD10_CAP_CUU,
    DANH_MUC_ICD10_CAP_CUU,
    PHIEN_BAN_DANH_MUC_ICD10_CAP_CUU,
} from '../thanh_phan/icd10_nhap_vien_cap_cuu';
import {
    COT_DANH_MUC_MAPPING_NGUOI_HANH_NGHE,
    DANH_MUC_MAPPING_NGUOI_HANH_NGHE,
    PHIEN_BAN_DANH_MUC_MAPPING_NGUOI_HANH_NGHE,
} from '../thanh_phan/mapping_nguoi_hanh_nghe';
import {
    COT_DANH_MUC_NHAN_SU,
    DANH_MUC_NHAN_SU,
    PHIEN_BAN_DANH_MUC_NHAN_SU,
} from '../thanh_phan/nhan_su';
import {
    COT_DANH_MUC_THUOC_MAU_M03,
    DANH_MUC_THUOC_MAU_M03,
    PHIEN_BAN_DANH_MUC_THUOC_MAU_M03,
} from '../thanh_phan/thuoc_mau_cp';
import {
    COT_DANH_MUC_TRANG_THIET_BI_M06,
    DANH_MUC_TRANG_THIET_BI_M06,
    PHIEN_BAN_DANH_MUC_TRANG_THIET_BI_M06,
} from '../thanh_phan/trang_thiet_bi';
import {
    capNhatMetaDatasetCucBoTheoRows,
    hydrateDvktTableFromFirebase,
    layMetaDatasetCucBo,
    layMetaDatasetFirebase,
    syncDvktTablesToFirebase,
} from './firebase_cloud_bhyt';
import {
    COT_DVKT_PHAMVI_MAPPING,
    DU_LIEU_DVKT_PHAMVI_MAPPING,
    PHIEN_BAN_DVKT_PHAMVI_MAPPING,
} from './dvkt_phamvi_mapping_seed';
import { capNhatDanhMuc, docDanhMucTuKho } from './kho_du_lieu';
import DU_LIEU_TUONG_TAC_THUOC_SEED from '../chuyen_mon/tuong_tac_thuoc/du_lieu_tuong_tac_thuoc.seed.json';

const LOCAL_CHUNK_SIZE = 320000;
const CACHE_TTL_MS = 5 * 60 * 1000;
const STORAGE_SLOT_A = 'A';
const STORAGE_SLOT_B = 'B';

const localCache = new Map();
const localInFlight = new Map();
const pendingFirebaseSync = new Map();

let firebaseSyncTimer = null;
let pendingSyncUploader = '';
let pendingSyncSource = 'catalog_autosave';
let firebaseSyncInFlight = null;

const FIREBASE_SYNC_RETRY_MS = 5000;
const laMoiTruongWeb = () => Platform.OS === 'web' || typeof window !== 'undefined' || typeof document !== 'undefined';

const CODE_CATALOG_SEEDS = {
  DANH_MUC_KHOA_LS_M01: {
    version: PHIEN_BAN_DANH_MUC_KHOA_LS_M01,
    rows: DANH_MUC_KHOA_LS_M01,
    columns: COT_DANH_MUC_KHOA_LS_M01,
  },
  DANH_MUC_DVKT_M05: {
    version: PHIEN_BAN_DANH_MUC_DVKT_M05,
    rows: DANH_MUC_DVKT_M05,
    columns: COT_DANH_MUC_DVKT_M05,
  },
  DANH_MUC_NHAN_SU: {
    version: PHIEN_BAN_DANH_MUC_NHAN_SU,
    rows: DANH_MUC_NHAN_SU,
    columns: COT_DANH_MUC_NHAN_SU,
  },
  DANH_MUC_MAPPING_NGUOI_HANH_NGHE: {
    version: PHIEN_BAN_DANH_MUC_MAPPING_NGUOI_HANH_NGHE,
    rows: DANH_MUC_MAPPING_NGUOI_HANH_NGHE,
    columns: COT_DANH_MUC_MAPPING_NGUOI_HANH_NGHE,
  },
  DANH_MUC_THUOC_MAU_M03: {
    version: PHIEN_BAN_DANH_MUC_THUOC_MAU_M03,
    rows: DANH_MUC_THUOC_MAU_M03,
    columns: COT_DANH_MUC_THUOC_MAU_M03,
  },
  DANH_MUC_TRANG_THIET_BI_M06: {
    version: PHIEN_BAN_DANH_MUC_TRANG_THIET_BI_M06,
    rows: DANH_MUC_TRANG_THIET_BI_M06,
    columns: COT_DANH_MUC_TRANG_THIET_BI_M06,
  },
  DANH_MUC_ICD10_CAP_CUU: {
    version: PHIEN_BAN_DANH_MUC_ICD10_CAP_CUU,
    rows: DANH_MUC_ICD10_CAP_CUU,
    columns: COT_DANH_MUC_ICD10_CAP_CUU,
  },
  DANH_MUC_ICD10_KE_DON_TREN_30_NGAY: {
    version: PHIEN_BAN_DANH_MUC_ICD10_KE_DON_TREN_30_NGAY,
    rows: DANH_MUC_ICD10_KE_DON_TREN_30_NGAY,
    columns: COT_DANH_MUC_ICD10_KE_DON_TREN_30_NGAY,
  },
  DANH_MUC_ICD10: {
    version: PHIEN_BAN_DANH_MUC_ICD10,
    rows: DANH_MUC_ICD10,
    columns: COT_DANH_MUC_ICD10,
  },
  BYT_7603_PL10_DOI_TUONG: {
    version: PHIEN_BAN_BYT_PL10_DOI_TUONG,
    rows: DU_LIEU_BYT_PL10_DOI_TUONG,
    columns: COT_BYT_PL10_DOI_TUONG,
  },
  /** Giường & khám/chỉ định theo bảng mã nội bộ BV (thay định dạng cũ Kxx.xxxx). Import: mã giường bàn khám.xlsx */
  DANH_MUC_GIUONG_BAN_KHAM_BV: {
    version: '2026.04.2',
    rows: [],
    columns: [
      'STT', 'MA_TUONG_DUONG', 'TEN_DVKT_PHEDUYET', 'TEN_DVKT_GIA', 'PHAN_LOAI_PTTT', 'DON_GIA',
      'MA_TD_LIST', 'MA_DVKT_CU', 'MA_GIUONG_CU',
      'GHICHU', 'QUYET_DINH', 'TUNGAY', 'DENNGAY', 'CSKCB_CGKT', 'CSKCB_CLS', 'ID',
    ],
  },
  /** Cùng khóa lưu với DVKT-OP (`DVKT_ENGINE_STORAGE_KEYS.PHAMVI_MAPPING`) */
  DVKT_PHAMVI_MAPPING: {
    version: PHIEN_BAN_DVKT_PHAMVI_MAPPING,
    rows: DU_LIEU_DVKT_PHAMVI_MAPPING,
    columns: COT_DVKT_PHAMVI_MAPPING,
  },
  /** PREFIX_DVKT → MA_MAY_PREFIX bắt buộc (CHECK_EQUIPMENT / DVKT-OP-04) */
  DVKT_EQUIP_DVKT_MAP: {
    version: '2026-04-14-equip-dvkt-v1',
    rows: [],
    columns: ['PREFIX_DVKT', 'MA_MAY_PREFIX', 'GHI_CHU'],
  },
  /** Cặp mã thuốc nội bộ — tương tác lâm sàng / dược lâm sàng (đối chiếu XML2 cùng đợt KCB) */
  DANH_MUC_TUONG_TAC_THUOC: {
    version: DU_LIEU_TUONG_TAC_THUOC_SEED.phien_ban,
    rows: DU_LIEU_TUONG_TAC_THUOC_SEED.data,
    columns: DU_LIEU_TUONG_TAC_THUOC_SEED.columns,
  },
  DANH_MUC_THUOC_DIEU_KIEN_TT: {
    version: '2026-04-28-thuoc-dieu-kien-thanh-toan-v1',
    rows: [],
    columns: [
      'MA_GIAM_DINH', 'TEN_QUY_TAC', 'MA_THUOC_QD7603', 'HOAT_CHAT', 'DUONG_DUNG',
      'MA_ICD10', 'CHAN_DOAN', 'TU_KHOA_YEU_CAU', 'CANH_BAO_CDSS_ALERT',
    ],
  },
  /** Danh mục mã thẻ BHYT + quyền lợi + chi phí chuyển tuyến + hiệu lực thi hành (nạp từ file BV). */
  DANH_MUC_MA_THE_QUYEN_LOI: {
    version: '2026-04-28-ma-the-quyen-loi-v1',
    rows: [],
    columns: [
      'STT', 'MA', 'MA_NHOM_THE', 'MA_QUYEN_LOI', 'TEN',
      'NHOM_DOI_TUONG_BHYT', 'TY_LE_HUONG_BHYT',
      'DOI_TUONG_HUONG_CHI_PHI_CHUYEN_TUYEN', 'HIEU_LUC_THI_HANH',
      'TU_NGAY', 'DEN_NGAY', 'MIEU_TA',
    ],
  },
};
const LEGACY_INTERNAL_KHOA_CODES = new Set(['K01', 'K03']);
const LEGACY_INTERNAL_DVKT_CODES = new Set(['PT.001', 'HA.02']);
const LEGACY_INTERNAL_STAFF_NAMES = new Set(['Nguyễn Văn A', 'Trần Thị B']);
const LEGACY_INTERNAL_DRUG_CODES = new Set(['J01DC02', 'M01.01']);
const LEGACY_INTERNAL_EQUIPMENT_CODES = new Set(['80001.01', '80001.02']);

const normalizeBaseKey = (key) => {
  const raw = String(key || '').trim();
  if (!raw) return '';
  if (raw.includes('_CHUNK_')) return raw.slice(0, raw.indexOf('_CHUNK_'));
  if (raw.endsWith('_CHUNKS')) return raw.slice(0, -'_CHUNKS'.length);
  if (raw.endsWith('__MANIFEST')) return raw.slice(0, -'__MANIFEST'.length);
  if (raw.endsWith('__A') || raw.endsWith('__B')) return raw.slice(0, -3);
  return raw;
};

const normalizeArray = (value) => (Array.isArray(value) ? value : []);
const taoKetQuaDongBoTrong = () => ({
  ok: true,
  queued_count: 0,
  uploaded_count: 0,
  total_count: 0,
  details: [],
});
const henLichDongBoFirebase = (delayMs = 2500) => {
  if (firebaseSyncTimer) clearTimeout(firebaseSyncTimer);
  firebaseSyncTimer = setTimeout(() => {
    flushFirebaseDanhMucQueue().catch(() => {});
  }, Math.max(600, Number(delayMs) || 2500));
};
const getCodeCatalogSeed = (dataKey) => CODE_CATALOG_SEEDS[normalizeBaseKey(dataKey)] || null;
const isLegacyInternalDrugSeed = (dataKey, rows) => {
  if (normalizeBaseKey(dataKey) !== 'DANH_MUC_THUOC_MAU_M03') return false;
  const data = normalizeArray(rows);
  if (data.length !== 2) return false;
  const codes = data.map((row) => String(row?.MA_THUOC || '').trim()).filter(Boolean);
  return codes.length === 2 && codes.every((code) => LEGACY_INTERNAL_DRUG_CODES.has(code));
};
const isLegacyInternalKhoaSeed = (dataKey, rows) => {
  if (normalizeBaseKey(dataKey) !== 'DANH_MUC_KHOA_LS_M01') return false;
  const data = normalizeArray(rows);
  if (data.length !== 2) return false;
  const codes = data.map((row) => String(row?.MA_KHOA || '').trim()).filter(Boolean);
  return codes.length === 2 && codes.every((code) => LEGACY_INTERNAL_KHOA_CODES.has(code));
};
const isLegacyInternalDvktSeed = (dataKey, rows) => {
  if (normalizeBaseKey(dataKey) !== 'DANH_MUC_DVKT_M05') return false;
  const data = normalizeArray(rows);
  if (data.length !== 2) return false;
  const codes = data.map((row) => String(row?.MA_DICH_VU || '').trim()).filter(Boolean);
  return codes.length === 2 && codes.every((code) => LEGACY_INTERNAL_DVKT_CODES.has(code));
};
const isLegacyInternalStaffSeed = (dataKey, rows) => {
  if (normalizeBaseKey(dataKey) !== 'DANH_MUC_NHAN_SU') return false;
  const data = normalizeArray(rows);
  if (data.length !== 2) return false;
  const names = data.map((row) => String(row?.HO_TEN || '').trim()).filter(Boolean);
  return names.length === 2 && names.every((name) => LEGACY_INTERNAL_STAFF_NAMES.has(name));
};
const isOutdatedInternalStaffSeed = (dataKey, rows) => {
  if (normalizeBaseKey(dataKey) !== 'DANH_MUC_NHAN_SU') return false;
  const data = normalizeArray(rows);
  if (data.length === 0 || data.length !== DANH_MUC_NHAN_SU.length) return false;
  const sample = data[0] || {};
  return !Object.prototype.hasOwnProperty.call(sample, 'CHUCDANH_NN')
    && (
      Object.prototype.hasOwnProperty.call(sample, 'CHUC_DANH')
      || Object.prototype.hasOwnProperty.call(sample, 'MA_CDNN')
    );
};
const isLegacyInternalEquipmentSeed = (dataKey, rows) => {
  if (normalizeBaseKey(dataKey) !== 'DANH_MUC_TRANG_THIET_BI_M06') return false;
  const data = normalizeArray(rows);
  if (data.length !== 2) return false;
  const codes = data.map((row) => String(row?.MA_MAY || '').trim()).filter(Boolean);
  return codes.length === 2 && codes.every((code) => LEGACY_INTERNAL_EQUIPMENT_CODES.has(code));
};

const getCache = (key) => {
  const baseKey = normalizeBaseKey(key);
  if (!baseKey) return null;
  const hit = localCache.get(baseKey);
  if (!hit) return null;
  if (hit.expiredAt <= Date.now()) {
    localCache.delete(baseKey);
    return null;
  }
  return hit.value;
};

const setCache = (key, value) => {
  const baseKey = normalizeBaseKey(key);
  if (!baseKey) return;
  localCache.set(baseKey, {
    value: normalizeArray(value),
    expiredAt: Date.now() + CACHE_TTL_MS,
  });
};

const parseChunkedPayload = (raw) => {
  if (!raw) return [];
  try {
    return normalizeArray(JSON.parse(raw));
  } catch {
    return [];
  }
};

const getManifestKey = (baseKey) => `${baseKey}__MANIFEST`;
const getSlotBaseKey = (baseKey, slot) => `${baseKey}__${slot}`;
const getAlternateSlot = (slot) => (slot === STORAGE_SLOT_B ? STORAGE_SLOT_A : STORAGE_SLOT_B);

const laLoiVuotQuotaStorage = (error) => {
  const name = String(error?.name || '').toLowerCase();
  const message = String(error?.message || error || '').toLowerCase();
  return name.includes('quota')
    || message.includes('quota')
    || message.includes('exceeded the quota')
    || message.includes('quotaexceedederror');
};

const taoLoiVuotQuotaStorage = (baseKey, error) => {
  if (!laLoiVuotQuotaStorage(error)) return error;
  return new Error(`Bộ nhớ lưu trữ của trình duyệt đã đầy khi lưu ${baseKey}. Hãy tải từng tab, xóa bớt dữ liệu cũ hoặc dùng chức năng sao lưu trước khi dọn bộ nhớ local.`);
};

const ghiPayloadVaoStorageKey = async (targetBaseKey, payload) => {
  let totalChunks = 0;
  if (payload.length <= LOCAL_CHUNK_SIZE) {
    await AsyncStorage.setItem(targetBaseKey, payload);
    return { totalChunks };
  }

  totalChunks = Math.ceil(payload.length / LOCAL_CHUNK_SIZE);
  await AsyncStorage.setItem(`${targetBaseKey}_CHUNKS`, String(totalChunks));
  for (let index = 0; index < totalChunks; index += 1) {
    const chunk = payload.slice(index * LOCAL_CHUNK_SIZE, (index + 1) * LOCAL_CHUNK_SIZE);
    await AsyncStorage.setItem(`${targetBaseKey}_CHUNK_${index}`, chunk);
  }
  return { totalChunks };
};

const ghiManifestDanhMuc = async (baseKey, activeSlot) => {
  await AsyncStorage.setItem(
    getManifestKey(baseKey),
    JSON.stringify({
      version: 1,
      activeSlot,
      updatedAt: Date.now(),
    })
  );
};

const parseManifest = (raw) => {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    const activeSlot = parsed?.activeSlot === STORAGE_SLOT_B ? STORAGE_SLOT_B : STORAGE_SLOT_A;
    return {
      version: Number(parsed?.version || 1),
      activeSlot,
      updatedAt: Number(parsed?.updatedAt || 0),
    };
  } catch {
    return null;
  }
};

const docPayloadTheoKhoa = async (baseKey) => {
  const chunkCount = Number(await AsyncStorage.getItem(`${baseKey}_CHUNKS`)) || 0;
  if (chunkCount > 0) {
    const chunkKeys = Array.from({ length: chunkCount }, (_, index) => `${baseKey}_CHUNK_${index}`);
    const chunkPairs = await AsyncStorage.multiGet(chunkKeys);
    let payload = '';
    chunkPairs.forEach(([, value]) => {
      if (value) payload += value;
    });
    if (payload) return payload;
  }

  return String((await AsyncStorage.getItem(baseKey)) || '');
};

const docMangTheoBaseKey = async (baseKey) => parseChunkedPayload(await docPayloadTheoKhoa(baseKey));

const removeChunkedKey = async (key) => {
  const baseKey = normalizeBaseKey(key);
  if (!baseKey) return;

  try {
    const oldChunkCount = Number(await AsyncStorage.getItem(`${baseKey}_CHUNKS`)) || 0;
    if (oldChunkCount > 0) {
      const chunkKeys = Array.from({ length: oldChunkCount }, (_, index) => `${baseKey}_CHUNK_${index}`);
      await AsyncStorage.multiRemove(chunkKeys);
    }
  } catch {
    // ignore cleanup error
  }

  await AsyncStorage.removeItem(`${baseKey}_CHUNKS`).catch(() => {});
  await AsyncStorage.removeItem(baseKey).catch(() => {});
};

const removeSlotArtifacts = async (baseKey, slot) => {
  if (!baseKey || !slot) return;
  await removeChunkedKey(getSlotBaseKey(baseKey, slot));
};

const docMangDanhMucTheoManifest = async (baseKey) => {
  const manifest = parseManifest(await AsyncStorage.getItem(getManifestKey(baseKey)));
  if (!manifest) return null;

  const activeSlot = manifest.activeSlot || STORAGE_SLOT_A;
  const activeRows = await docMangTheoBaseKey(getSlotBaseKey(baseKey, activeSlot));
  if (activeRows.length > 0) {
    return { rows: activeRows, manifest };
  }

  const alternateSlot = getAlternateSlot(activeSlot);
  const alternateRows = await docMangTheoBaseKey(getSlotBaseKey(baseKey, alternateSlot));
  if (alternateRows.length > 0) {
    return {
      rows: alternateRows,
      manifest: {
        ...manifest,
        activeSlot: alternateSlot,
      },
      repaired: true,
    };
  }

  return {
    rows: [],
    manifest,
  };
};

export const docMangDanhMucTuStorage = async (key) => {
  const baseKey = normalizeBaseKey(key);
  if (!baseKey) return [];

  const cached = getCache(baseKey);
  if (cached) return cached;

  const pending = localInFlight.get(baseKey);
  if (pending) return pending;

  const loader = (async () => {
    try {
      if (laMoiTruongWeb()) {
        const rows = await docDanhMucTuKho(baseKey, []);
        setCache(baseKey, rows);
        return rows;
      }

      const manifestData = await docMangDanhMucTheoManifest(baseKey);
      if (manifestData) {
        const rows = normalizeArray(manifestData.rows);
        if (manifestData.repaired) {
          await AsyncStorage.setItem(
            getManifestKey(baseKey),
            JSON.stringify({
              version: 1,
              activeSlot: manifestData.manifest.activeSlot,
              updatedAt: Date.now(),
            })
          ).catch(() => {});
        }
        setCache(baseKey, rows);
        return rows;
      }

      const rows = await docMangTheoBaseKey(baseKey);
      setCache(baseKey, rows);
      return rows;
    } catch {
      setCache(baseKey, []);
      return [];
    } finally {
      localInFlight.delete(baseKey);
    }
  })();

  localInFlight.set(baseKey, loader);
  return loader;
};

export const ghiMangDanhMucVaoStorage = async (key, rows, options = {}) => {
  const baseKey = normalizeBaseKey(key);
  if (!baseKey) return { ok: false, reason: 'missing_key' };

  const data = normalizeArray(rows);
  const syncedWithFirebase = options?.syncedWithFirebase === true;
  const allowReplaceActiveOnQuota = options?.allowReplaceActiveOnQuota === true;

  if (laMoiTruongWeb()) {
    await capNhatDanhMuc(baseKey, data);
    setCache(baseKey, data);
    await capNhatMetaDatasetCucBoTheoRows(baseKey, data, { markSynced: syncedWithFirebase });
    return {
      ok: true,
      key: baseKey,
      chunked: false,
      chunks: 0,
      rows: data.length,
      slot: 'WEB_IDB',
    };
  }

  const payload = JSON.stringify(data);

  const manifest = parseManifest(await AsyncStorage.getItem(getManifestKey(baseKey)));
  const activeSlot = manifest?.activeSlot || STORAGE_SLOT_A;
  const nextSlot = getAlternateSlot(manifest?.activeSlot || STORAGE_SLOT_A);
  const targetBaseKey = getSlotBaseKey(baseKey, nextSlot);

  const hoanTatGhi = async (slotDaGhi, totalChunks, fallbackMode = '') => {
    await ghiManifestDanhMuc(baseKey, slotDaGhi);
    await Promise.all([
      removeSlotArtifacts(baseKey, getAlternateSlot(slotDaGhi)),
      removeChunkedKey(baseKey),
    ]).catch(() => {});

    setCache(baseKey, data);
    await capNhatMetaDatasetCucBoTheoRows(baseKey, data, { markSynced: syncedWithFirebase });
    return {
      ok: true,
      key: baseKey,
      chunked: totalChunks > 0,
      chunks: totalChunks,
      rows: data.length,
      slot: slotDaGhi,
      fallbackMode,
    };
  };

  try {
    await removeChunkedKey(targetBaseKey);
    await removeChunkedKey(baseKey).catch(() => {});
    const { totalChunks } = await ghiPayloadVaoStorageKey(targetBaseKey, payload);
    return await hoanTatGhi(nextSlot, totalChunks);
  } catch (error) {
    await removeChunkedKey(targetBaseKey).catch(() => {});
    if (!laLoiVuotQuotaStorage(error) || !allowReplaceActiveOnQuota) {
      throw taoLoiVuotQuotaStorage(baseKey, error);
    }
  }

  try {
    const activeBaseKey = getSlotBaseKey(baseKey, activeSlot);
    await Promise.all([
      removeChunkedKey(baseKey).catch(() => {}),
      removeSlotArtifacts(baseKey, getAlternateSlot(activeSlot)).catch(() => {}),
      removeChunkedKey(activeBaseKey).catch(() => {}),
    ]);
    const { totalChunks } = await ghiPayloadVaoStorageKey(activeBaseKey, payload);
    return await hoanTatGhi(activeSlot, totalChunks, 'replace_active_slot_on_quota');
  } catch (fallbackError) {
    throw taoLoiVuotQuotaStorage(baseKey, fallbackError);
  }
};

export const xoaCacheLuuTruDanhMuc = () => {
  localCache.clear();
  localInFlight.clear();
};

const tongHopMetaDanhMuc = (meta, rows) => ({
  ok: meta?.ok !== false,
  exists: meta?.exists === true,
  payload_hash: String(meta?.payload_hash || ''),
  row_count: Number(meta?.row_count ?? normalizeArray(rows).length ?? 0),
  payload_bytes: Number(meta?.payload_bytes || 0),
  updated_at_ms: Number(meta?.updated_at_ms || meta?.updated_at || 0),
  synced_payload_hash: String(meta?.synced_payload_hash || ''),
  synced_at_ms: Number(meta?.synced_at_ms || meta?.synced_at || 0),
  reason: meta?.reason || '',
  error_code: meta?.error_code || '',
});

const phanTichTrangThaiDoiSoat = ({ localRows = [], localMeta, remoteMeta } = {}) => {
  const localData = normalizeArray(localRows);
  const localHash = String(localMeta?.payload_hash || '');
  const syncedHash = String(localMeta?.synced_payload_hash || '');
  const remoteHash = String(remoteMeta?.payload_hash || '');
  const localExists = localData.length > 0 || !!localHash || Number(localMeta?.row_count || 0) > 0;
  const remoteExists = remoteMeta?.exists === true;
  const differs = remoteExists && (
    Number(remoteMeta?.row_count || 0) !== Number(localMeta?.row_count || 0)
    || (!!remoteHash && !!localHash && remoteHash !== localHash)
  );
  const hasUnsyncedLocalChanges = localExists && !!localHash && !!syncedHash && localHash !== syncedHash;
  const remoteNewer = remoteExists
    && Number(remoteMeta?.updated_at_ms || 0) > Number(localMeta?.synced_at_ms || localMeta?.updated_at_ms || 0) + 1000;
  const canAutoHydrate = coTheTuDongNapFirebase({
    localRows: localData,
    localMeta,
    remoteMeta,
    forceDownload: false,
    preferFirebaseIfNewer: true,
  });

  return {
    differs,
    local_exists: localExists,
    remote_exists: remoteExists,
    has_unsynced_local_changes: hasUnsyncedLocalChanges,
    remote_newer: remoteNewer,
    can_auto_hydrate: canAutoHydrate,
  };
};

const coTheTuDongNapFirebase = ({ localRows, localMeta, remoteMeta, forceDownload = false, preferFirebaseIfNewer = false }) => {
  if (!remoteMeta?.ok || !remoteMeta?.exists) return false;
  if (forceDownload) return true;
  if (normalizeArray(localRows).length === 0) return true;
  if (!preferFirebaseIfNewer) return false;

  const localHash = String(localMeta?.payload_hash || '');
  const syncedHash = String(localMeta?.synced_payload_hash || '');
  const remoteHash = String(remoteMeta?.payload_hash || '');
  const localDangSach = !!localHash && localHash === syncedHash;
  const remoteKhacHash = !!remoteHash && remoteHash !== localHash;
  const remoteMoiHon = Number(remoteMeta?.updated_at_ms || 0) > Number(localMeta?.synced_at_ms || localMeta?.updated_at_ms || 0) + 1000;

  return localDangSach && remoteKhacHash && remoteMoiHon;
};

const taiDatasetTuFirebase = async ({
  datasetKey,
  localRows = [],
  forceDownload = false,
  preferFirebaseIfNewer = false,
} = {}) => {
  const [localMetaRaw, remoteMetaRaw] = await Promise.all([
    layMetaDatasetCucBo(datasetKey),
    layMetaDatasetFirebase({ datasetKey }),
  ]);
  const localMeta = tongHopMetaDanhMuc(localMetaRaw, localRows);
  const remoteMeta = tongHopMetaDanhMuc(remoteMetaRaw, []);
  const nenTai = coTheTuDongNapFirebase({
    localRows,
    localMeta,
    remoteMeta,
    forceDownload,
    preferFirebaseIfNewer,
  });

  if (!nenTai) {
    return {
      rows: normalizeArray(localRows),
      hydrated: false,
      localMeta,
      remoteMeta,
    };
  }

  const res = await hydrateDvktTableFromFirebase({
    datasetKey,
    persistLocal: false,
  });
  if (!res?.ok || !Array.isArray(res.data)) {
    return {
      rows: normalizeArray(localRows),
      hydrated: false,
      localMeta,
      remoteMeta: {
        ...remoteMeta,
        reason: res?.reason || remoteMeta.reason,
        error_code: res?.error_code || remoteMeta.error_code,
      },
    };
  }

  await ghiMangDanhMucVaoStorage(datasetKey, res.data, {
    syncedWithFirebase: true,
    allowReplaceActiveOnQuota: forceDownload || normalizeArray(localRows).length === 0,
  });
  return {
    rows: normalizeArray(res.data),
    hydrated: true,
    localMeta,
    remoteMeta,
  };
};

const taiTuFirebaseNeuCan = async (datasetKey, fallback = [], options = {}) => {
  const res = await hydrateDvktTableFromFirebase({
    datasetKey,
    persistLocal: false,
  });
  if (!res?.ok || !Array.isArray(res.data)) return normalizeArray(fallback);
  await ghiMangDanhMucVaoStorage(datasetKey, res.data, {
    syncedWithFirebase: options?.syncedWithFirebase !== false,
    allowReplaceActiveOnQuota: options?.allowReplaceActiveOnQuota !== false,
  });
  return res.data;
};

export const taiBoDuLieuDanhMuc = async ({
  dataKey,
  columnsKey,
  fallbackColumns = [],
  preferFirebaseIfNewer = false,
  forceDownloadFromFirebase = false,
} = {}) => {
  const [dataLocal, columnsLocal] = await Promise.all([
    docMangDanhMucTuStorage(dataKey),
    docMangDanhMucTuStorage(columnsKey),
  ]);

  let data = normalizeArray(dataLocal);
  let columns = normalizeArray(columnsLocal);
  let hydratedFromFirebase = false;
  let seededFromCode = false;
  const codeSeed = getCodeCatalogSeed(dataKey);

  if (forceDownloadFromFirebase || preferFirebaseIfNewer) {
    const [dataRemote, columnsRemote] = await Promise.all([
      taiDatasetTuFirebase({
        datasetKey: dataKey,
        localRows: data,
        forceDownload: forceDownloadFromFirebase,
        preferFirebaseIfNewer,
      }),
      taiDatasetTuFirebase({
        datasetKey: columnsKey,
        localRows: columns,
        forceDownload: forceDownloadFromFirebase,
        preferFirebaseIfNewer,
      }),
    ]);

    if (dataRemote.hydrated) {
      data = dataRemote.rows;
      hydratedFromFirebase = true;
    }
    if (columnsRemote.hydrated) {
      columns = columnsRemote.rows;
      hydratedFromFirebase = true;
    }
  }

  if (data.length === 0) {
    const remoteData = await taiTuFirebaseNeuCan(dataKey);
    if (remoteData.length > 0) {
      data = remoteData;
      hydratedFromFirebase = true;
    }
  }

  if (
    (
      data.length === 0
      || isLegacyInternalKhoaSeed(dataKey, data)
      || isLegacyInternalDrugSeed(dataKey, data)
      || isLegacyInternalDvktSeed(dataKey, data)
      || isLegacyInternalStaffSeed(dataKey, data)
      || isOutdatedInternalStaffSeed(dataKey, data)
      || isLegacyInternalEquipmentSeed(dataKey, data)
    )
    && Array.isArray(codeSeed?.rows)
    && codeSeed.rows.length > 0
  ) {
    data = normalizeArray(codeSeed.rows);
    await ghiMangDanhMucVaoStorage(dataKey, data);
    seededFromCode = true;
  }

  if (columns.length === 0) {
    const remoteColumns = await taiTuFirebaseNeuCan(columnsKey);
    if (remoteColumns.length > 0) {
      columns = remoteColumns;
      hydratedFromFirebase = true;
    }
  }

  if ((columns.length === 0 || seededFromCode) && Array.isArray(codeSeed?.columns) && codeSeed.columns.length > 0) {
    columns = normalizeArray(codeSeed.columns);
    await ghiMangDanhMucVaoStorage(columnsKey, columns);
  }

  if (columns.length === 0 && data.length > 0) {
    columns = Object.keys(data[0] || {});
  }
  if (columns.length === 0) {
    columns = normalizeArray(fallbackColumns);
  }

  if (seededFromCode) {
    xepHangDongBoDanhMucFirebase({
      datasetMap: {
        [dataKey]: data,
        [columnsKey]: columns,
      },
      source: `catalog_code_seed_${codeSeed?.version || 'default'}`,
    });
  }

  return {
    data,
    columns,
    hydratedFromFirebase,
    seededFromCode,
  };
};

export const doiSoatBoDuLieuDanhMucVoiFirebase = async ({
  dataKey,
  columnsKey,
} = {}) => {
  const [dataLocal, columnsLocal, dataLocalMetaRaw, columnsLocalMetaRaw, dataRemoteMetaRaw, columnsRemoteMetaRaw] = await Promise.all([
    docMangDanhMucTuStorage(dataKey),
    docMangDanhMucTuStorage(columnsKey),
    layMetaDatasetCucBo(dataKey),
    layMetaDatasetCucBo(columnsKey),
    layMetaDatasetFirebase({ datasetKey: dataKey }),
    layMetaDatasetFirebase({ datasetKey: columnsKey }),
  ]);

  const dataLocalMeta = tongHopMetaDanhMuc(dataLocalMetaRaw, dataLocal);
  const columnsLocalMeta = tongHopMetaDanhMuc(columnsLocalMetaRaw, columnsLocal);
  const dataRemoteMeta = tongHopMetaDanhMuc(dataRemoteMetaRaw, []);
  const columnsRemoteMeta = tongHopMetaDanhMuc(columnsRemoteMetaRaw, []);
  const dataStatus = phanTichTrangThaiDoiSoat({
    localRows: dataLocal,
    localMeta: dataLocalMeta,
    remoteMeta: dataRemoteMeta,
  });
  const columnsStatus = phanTichTrangThaiDoiSoat({
    localRows: columnsLocal,
    localMeta: columnsLocalMeta,
    remoteMeta: columnsRemoteMeta,
  });

  return {
    ok: true,
    data: {
      local: dataLocalMeta,
      remote: dataRemoteMeta,
      differs: dataStatus.differs,
      status: dataStatus,
    },
    columns: {
      local: columnsLocalMeta,
      remote: columnsRemoteMeta,
      differs: columnsStatus.differs,
      status: columnsStatus,
    },
  };
};

export const flushFirebaseDanhMucQueue = async () => {
  if (firebaseSyncTimer) {
    clearTimeout(firebaseSyncTimer);
    firebaseSyncTimer = null;
  }
  if (firebaseSyncInFlight) {
    return firebaseSyncInFlight;
  }
  if (pendingFirebaseSync.size === 0) {
    return taoKetQuaDongBoTrong();
  }

  firebaseSyncInFlight = (async () => {
    const tongHop = taoKetQuaDongBoTrong();

    try {
      while (pendingFirebaseSync.size > 0) {
        const batchEntries = Array.from(pendingFirebaseSync.entries());
        const batchMap = {};
        const batchUploader = pendingSyncUploader;
        const batchSource = pendingSyncSource;

        pendingFirebaseSync.clear();
        batchEntries.forEach(([datasetKey, rows]) => {
          batchMap[datasetKey] = normalizeArray(rows);
        });

        const batchResult = await syncDvktTablesToFirebase({
          datasetMap: batchMap,
          uploader: batchUploader,
          source: batchSource,
          onlyChanged: true,
        });

        const batchDetails = Array.isArray(batchResult?.details) ? batchResult.details : [];
        const failedKeys = new Set(
          batchDetails
            .filter((item) => !item?.ok)
            .map((item) => normalizeBaseKey(item?.dataset_key))
            .filter(Boolean)
        );
        const batchThatBai = !batchResult?.ok || failedKeys.size > 0;

        tongHop.queued_count += batchEntries.length;
        tongHop.uploaded_count += Number(batchResult?.uploaded_count || 0);
        tongHop.total_count += Number(batchResult?.total_count || batchEntries.length);

        if (batchDetails.length > 0) {
          tongHop.details.push(...batchDetails);
        } else if (batchThatBai) {
          batchEntries.forEach(([datasetKey]) => {
            tongHop.details.push({
              dataset_key: datasetKey,
              ok: false,
              reason: batchResult?.reason || 'Đồng bộ Firebase thất bại.',
            });
          });
        }

        if (batchThatBai) {
          tongHop.ok = false;
          batchEntries.forEach(([datasetKey, rows]) => {
            const baseKey = normalizeBaseKey(datasetKey);
            if (!baseKey) return;
            if (failedKeys.size > 0 && !failedKeys.has(baseKey)) return;
            if (!pendingFirebaseSync.has(baseKey)) {
              pendingFirebaseSync.set(baseKey, normalizeArray(rows));
            }
          });
          break;
        }
      }
    } finally {
      firebaseSyncInFlight = null;
      if (pendingFirebaseSync.size > 0) {
        henLichDongBoFirebase(FIREBASE_SYNC_RETRY_MS);
      }
    }

    if (tongHop.queued_count === 0) {
      return taoKetQuaDongBoTrong();
    }
    if (tongHop.uploaded_count !== tongHop.total_count) {
      tongHop.ok = false;
    }
    return tongHop;
  })();

  return firebaseSyncInFlight;
};

export const xepHangDongBoDanhMucFirebase = ({
  datasetMap = {},
  uploader = '',
  source = 'catalog_autosave',
  debounceMs = 2500,
} = {}) => {
  Object.entries(datasetMap || {}).forEach(([datasetKey, rows]) => {
    const baseKey = normalizeBaseKey(datasetKey);
    if (!baseKey) return;
    pendingFirebaseSync.set(baseKey, normalizeArray(rows));
  });

  if (uploader) pendingSyncUploader = uploader;
  pendingSyncSource = source || pendingSyncSource;

  henLichDongBoFirebase(debounceMs);
};

export const luuBoDuLieuDanhMuc = async ({
  dataKey,
  columnsKey,
  data,
  columns,
  uploader = '',
  source = 'catalog_autosave',
  syncRemote = true,
} = {}) => {
  const rows = normalizeArray(data);
  const cols = normalizeArray(columns);

  await Promise.all([
    ghiMangDanhMucVaoStorage(dataKey, rows),
    ghiMangDanhMucVaoStorage(columnsKey, cols),
  ]);

  if (syncRemote) {
    xepHangDongBoDanhMucFirebase({
      datasetMap: {
        [dataKey]: rows,
        [columnsKey]: cols,
      },
      uploader,
      source,
    });
  }

  return {
    ok: true,
    data_count: rows.length,
    column_count: cols.length,
  };
};
