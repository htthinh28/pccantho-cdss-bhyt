/**
 * Kiểm tra DVKT-OP-* (VBHN 17 / TT12 — căn cứ resolveLegalBasis): toán tử và điều kiện **cố định trong mã nguồn**;
 * danh mục M05, thiết bị, nhân sự, Giường & khám BV… lấy từ AsyncStorage / Firebase / builtin.
 * Không còn gọi là “engine no-code” — rule mặc định là `DEFAULT_DVKT_RULES` trong repo.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import {
  CHUOI_DAY_DU_TT12_2026_D10_VA_D13 as TT_12_BTC_LEGACY_FULL,
  CHUOI_TRICH_DAN_TT12_2026_D10_VA_D13 as TT_12_BTC_D10_META,
} from './co_so_phap_ly_tt12_2026';
import { DANH_MUC_DVKT_M05 } from '../thanh_phan/dich_vu_ky_thuat';
import { DANH_MUC_MAPPING_NGUOI_HANH_NGHE } from '../thanh_phan/mapping_nguoi_hanh_nghe';
import { DANH_MUC_NHAN_SU } from '../thanh_phan/nhan_su';
import { DANH_MUC_TRANG_THIET_BI_M06 } from '../thanh_phan/trang_thiet_bi';
import { DU_LIEU_DVKT_PHAMVI_MAPPING } from './dvkt_phamvi_mapping_seed';
import {
  coVanBanChoPhepDvkt,
  laBacSiHoacYSy,
  laDongCongKhamXml3,
  moRongPhamViNhanSuCv3231,
} from './du_lieu_cv3231_phamvi';
import {
    danhGiaTruocKhiTaiDvktDataset,
    ghiNhatKyAuditConfigSync,
    hydrateDvktTableFromFirebase,
    syncDvktTablesToFirebase,
    taiKetQuaGiamDinhLenFirebase,
} from './firebase_cloud_bhyt';
import { layDanhSachLuatCdhaHardcoded } from './luat_cdha_hardcoded';
import { layDanhSachLuatCongKhamHardcoded } from './luat_cong_kham_hardcoded';
import { layDanhSachLuatDuLieuHardcoded } from './luat_du_lieu_hardcoded';
import { layDanhSachLuatGiamDinhChuyenDeHardcoded } from './luat_giam_dinh_chuyen_de_hardcoded';
import { layDanhSachLuatGiuongHardcoded } from './luat_giuong_hardcoded';
import { layDanhSachLuatHanhChinhHardcoded } from './luat_hanh_chinh_hardcoded';
import { layDanhSachLuatHopDongHardcoded } from './luat_hop_dong_hardcoded';
import { layDanhSachLuatNhanSuHardcoded } from './luat_nhan_su_hardcoded';
import { layDanhSachLuatThuocHardcoded } from './luat_thuoc_hardcoded';
import { isQuyTacNoiBoDangBat, taiMapTrangThaiQuyTacNoiBo } from './quy_tac_on_off_noi_bo';
import { damBaoSeedLuatPtttMuc11 } from './seed_luat_pttt_muc11';

export const DVKT_ENGINE_STORAGE_KEYS = {
  RULES: 'DVKT_RULES',
  DMKT: 'DVKT_DMKT',
  INTERNAL_APPROVAL: 'DVKT_INTERNAL_APPROVAL',
  EQUIPMENT: 'DVKT_EQUIPMENT',
  STAFF: 'DVKT_STAFF',
  SERVICE_PRACTITIONER_MAP: 'DVKT_SERVICE_PRACTITIONER_MAP',
  PHAMVI_MAPPING: 'DVKT_PHAMVI_MAPPING',
  ICD10_INDICATION: 'DVKT_ICD10_INDICATION',
  ICD10_CONTRAINDICATION: 'DVKT_ICD10_CONTRAINDICATION',
  EQUIP_DVKT_MAP: 'DVKT_EQUIP_DVKT_MAP',
  CLAIM_RESULTS: 'DVKT_CLAIM_RESULTS',
};

/** Tab Quản lý danh mục: Giường & khám (mã BV mới). Nguồn hợp lệ duy nhất cho DVKT-OP-09 — không dùng DM DVKT M05. */
const DVKT_OP09_CATALOG_STORAGE_KEY = 'DANH_MUC_GIUONG_BAN_KHAM_BV';
/** XML3.MA_NHOM (nhóm chi phí): 1 — phí khám; 15 — phí giường (đồng bộ rule DVKT-OP-16 / tiền giường). */
const OP09_XML3_MA_NHOM_KHAM = '1';
const OP09_XML3_MA_NHOM_GIUONG = '15';
/** Mọi khóa định danh nhân sự cần index trong staffById (XML thường gửi MACCHN làm MA_BAC_SI). */
const STAFF_LOOKUP_ID_KEYS = ['MA_BAC_SI', 'MA_BHXH', 'MACCHN', 'SO_CCHN', 'SO_GPHN', 'MA_NV', 'ID', 'SO_CCCD', 'SO_DINH_DANH'];

const DVKT_SYNC_TABLES = [
  { datasetKey: DVKT_ENGINE_STORAGE_KEYS.RULES, fallbackKey: 'CDSS_DATA_LUAT_CDHA' },
  { datasetKey: DVKT_ENGINE_STORAGE_KEYS.DMKT, fallbackKey: 'DANH_MUC_DVKT_M05' },
  { datasetKey: DVKT_ENGINE_STORAGE_KEYS.INTERNAL_APPROVAL, fallbackKey: DVKT_OP09_CATALOG_STORAGE_KEY },
  { datasetKey: DVKT_ENGINE_STORAGE_KEYS.EQUIPMENT, fallbackKey: 'DANH_MUC_TRANG_THIET_BI_M06' },
  { datasetKey: DVKT_ENGINE_STORAGE_KEYS.STAFF, fallbackKey: 'DANH_MUC_NHAN_SU' },
  { datasetKey: DVKT_ENGINE_STORAGE_KEYS.SERVICE_PRACTITIONER_MAP, fallbackKey: 'DANH_MUC_MAPPING_NGUOI_HANH_NGHE' },
  { datasetKey: DVKT_ENGINE_STORAGE_KEYS.PHAMVI_MAPPING, fallbackKey: '' },
  { datasetKey: DVKT_ENGINE_STORAGE_KEYS.ICD10_INDICATION, fallbackKey: '' },
  { datasetKey: DVKT_ENGINE_STORAGE_KEYS.ICD10_CONTRAINDICATION, fallbackKey: '' },
  { datasetKey: DVKT_ENGINE_STORAGE_KEYS.EQUIP_DVKT_MAP, fallbackKey: '' },
];

const FULL_SYNC_PREFIXES = [
  'CDSS_DATA_',
  'CDSS_COLS_',
  'COLS_',
  'DANH_MUC_',
  'BYT_7603_',
  'DVKT_',
  'LUAT_',
];
const FULL_SYNC_EXACT_KEYS = [
  'DATA_XML1_130',
  'DATA_XML2_THUOC',
  'DATA_XML3_DVKT_VTYT',
  'DATA_XML4_CAN_LAM_SANG',
  'DATA_XML5_DIEN_BIEN',
  'DATA_XML6_THANH_TOAN',
  'PTTT',
];
const FULL_SYNC_SKIP_PREFIXES = [
  'CDSS_BACKUP_',
  'FIREBASE_DVKT_META_',
];
const FULL_SYNC_SKIP_KEYS = new Set([
  'DVKT_CLAIM_RESULTS',
  'TAB_DANG_MO',
  'TAB_CHUYEN_MON_DANG_MO',
  'KHO_XML_MULTI_MA_LK',
  'KHO_XML_MULTI_INDEX',
  'LUAT_SEED_VERSION',
]);
const BUILTIN_ENGINE_TABLES = {
  [DVKT_ENGINE_STORAGE_KEYS.DMKT]: DANH_MUC_DVKT_M05,
  DANH_MUC_DVKT_M05,
  [DVKT_ENGINE_STORAGE_KEYS.EQUIPMENT]: DANH_MUC_TRANG_THIET_BI_M06,
  DANH_MUC_TRANG_THIET_BI_M06,
  [DVKT_ENGINE_STORAGE_KEYS.STAFF]: DANH_MUC_NHAN_SU,
  DANH_MUC_NHAN_SU,
  [DVKT_ENGINE_STORAGE_KEYS.SERVICE_PRACTITIONER_MAP]: DANH_MUC_MAPPING_NGUOI_HANH_NGHE,
  DANH_MUC_MAPPING_NGUOI_HANH_NGHE,
  [DVKT_ENGINE_STORAGE_KEYS.PHAMVI_MAPPING]: DU_LIEU_DVKT_PHAMVI_MAPPING,
};

const DEFAULT_DVKT_RULES = [
  { RULE_CODE: 'DVKT-OP-01', RULE_NAME: 'Chỉ định ICD10 phù hợp', OPERATOR: 'CHECK_ICD_INDICATION', STATUS: 'ON', SEVERITY: 'WARNING', ALERT_MESSAGE: 'Chỉ định ICD-10 không phù hợp với loại DVKT.' },
  { RULE_CODE: 'DVKT-OP-02', RULE_NAME: 'Chống chỉ định ICD10', OPERATOR: 'CHECK_ICD_CONTRAINDICATION', STATUS: 'ON', SEVERITY: 'REJECT', ALERT_MESSAGE: 'DVKT bị chống chỉ định theo mã bệnh ICD-10.' },
  { RULE_CODE: 'DVKT-OP-03', RULE_NAME: 'Phạm vi hành nghề (NGUOI_THUC_HIEN)', OPERATOR: 'CHECK_PHAMVI', STATUS: 'ON', SEVERITY: 'REJECT', ALERT_MESSAGE: 'NGUOI_THUC_HIEN không đúng phạm vi chuyên môn cho DVKT (MA_BAC_SI không bắt buộc đối chiếu phạm vi; DVKT giường bệnh miễn kiểm tra).' },
  { RULE_CODE: 'DVKT-OP-04', RULE_NAME: 'Máy móc thiết bị', OPERATOR: 'CHECK_EQUIPMENT', STATUS: 'ON', SEVERITY: 'REJECT', ALERT_MESSAGE: 'CSKCB không có thiết bị hợp lệ để thực hiện DVKT.' },
  { RULE_CODE: 'DVKT-OP-05', RULE_NAME: 'Giá DVKT', OPERATOR: 'CHECK_PRICE', STATUS: 'ON', SEVERITY: 'REJECT', ALERT_MESSAGE: 'Đơn giá DVKT vượt giá BHYT phê duyệt.' },
  { RULE_CODE: 'DVKT-OP-06', RULE_NAME: 'Hiệu lực DVKT', OPERATOR: 'CHECK_VALIDITY', STATUS: 'ON', SEVERITY: 'REJECT', ALERT_MESSAGE: 'DVKT ngoài khoảng hiệu lực áp dụng.' },
  { RULE_CODE: 'DVKT-OP-07', RULE_NAME: 'Phân loại PTTT', OPERATOR: 'CHECK_PTTT_LEVEL', STATUS: 'OFF', SEVERITY: 'WARNING', ALERT_MESSAGE: 'Thông tin phân loại PTTT chưa đúng quy định.' },
  { RULE_CODE: 'DVKT-OP-08', RULE_NAME: 'Ghi chú đặc thù', OPERATOR: 'CHECK_GHICHU', STATUS: 'ON', SEVERITY: 'REJECT', ALERT_MESSAGE: 'Thông tin VTYT không phù hợp ghi chú đặc thù DVKT.' },
  { RULE_CODE: 'DVKT-OP-09', RULE_NAME: 'Khám và giường bệnh (nội bộ) được phê duyệt', OPERATOR: 'CHECK_INTERNAL_APPROVAL', STATUS: 'ON', SEVERITY: 'REJECT', ALERT_MESSAGE: 'DVKT không nằm trong danh mục Khám và giường bệnh (nội bộ) được phê duyệt.' },
  { RULE_CODE: 'DVKT-OP-10', RULE_NAME: 'Thời gian hành nghề bác sỹ', OPERATOR: 'CHECK_STAFF_PRACTICE_TIME', STATUS: 'ON', SEVERITY: 'REJECT', ALERT_MESSAGE: 'Thông tin hành nghề bác sỹ không hợp lệ tại thời điểm thực hiện DVKT.' },
  { RULE_CODE: 'DVKT-OP-11', RULE_NAME: 'Danh mục 3 tạm thời chưa thanh toán', OPERATOR: 'CHECK_TEMP_LIST3', STATUS: 'ON', SEVERITY: 'REJECT', ALERT_MESSAGE: 'DVKT thuộc danh mục tạm thời chưa được quỹ BHYT thanh toán.' },
  { RULE_CODE: 'DVKT-OP-13', RULE_NAME: 'Đối soát tên DVKT theo danh mục', OPERATOR: 'CHECK_CATALOG_NAME_MATCH', STATUS: 'ON', SEVERITY: 'WARNING', ALERT_MESSAGE: 'Tên DVKT trên hồ sơ không khớp danh mục nội bộ M05.' },
  { RULE_CODE: 'DVKT-OP-14', RULE_NAME: 'Danh mục DVKT phải có đơn giá', OPERATOR: 'CHECK_CATALOG_PRICE_CONFIG', STATUS: 'ON', SEVERITY: 'WARNING', ALERT_MESSAGE: 'Danh mục nội bộ M05 chưa cấu hình đơn giá cho DVKT.' },
  { RULE_CODE: 'DVKT-OP-15', RULE_NAME: 'Danh mục DVKT phải có quyết định', OPERATOR: 'CHECK_CATALOG_DECISION', STATUS: 'ON', SEVERITY: 'WARNING', ALERT_MESSAGE: 'Danh mục nội bộ M05 chưa có thông tin quyết định phê duyệt DVKT.' },
  /** Tùy chọn: bật nếu cần cảnh báo hồ sơ còn mã giường dạng cũ Kxx.xxxx (4 số sau dấu chấm). */
  { RULE_CODE: 'DVKT-OP-16', RULE_NAME: 'Mã giường dạng cũ (Kxx.xxxx)', OPERATOR: 'CHECK_LEGACY_BED_SERVICE_FORMAT', STATUS: 'OFF', SEVERITY: 'WARNING', ALERT_MESSAGE: 'Mã DVKT nhóm giường theo định dạng cũ — đã chuyển sang bảng mã mới (tab Giường & khám BV).' },
];

/** Bản rời cho tra cứu (Thư viện) — cùng nội dung DEFAULT_DVKT_RULES (khai báo cố định trong mã nguồn). */
export const layQuyTacDvktOpMacDinh = () => DEFAULT_DVKT_RULES.map((r) => ({ ...r }));

const tronRuleKhongTrung = (...sources) => {
  const seen = new Set();
  const out = [];
  sources.flat().forEach((row) => {
    const ma = String(row?.MA_LUAT || row?.ma_luat || '').trim().toUpperCase();
    const ten = String(row?.TEN_QUY_TAC || row?.ten_quy_tac || '').trim().toUpperCase();
    const dk = String(row?.DIEU_KIEN || row?.dieu_kien || '').trim().toUpperCase();
    const cb = String(row?.CANH_BAO || row?.canh_bao || '').trim().toUpperCase();
    const signature = `${ma}||${ten}||${dk}||${cb}`;
    if (!ma && !ten && !dk && !cb) return;
    if (seen.has(signature)) return;
    seen.add(signature);
    out.push(row);
  });
  return out;
};

/** Trích dẫn ngắn (hiển thị trên báo cáo — không dài dòng). */
const VBHN_17_META = 'VBHN 17/BYT (31/12/2024)';
const ND_188_META = 'NĐ 188/2025/NĐ-CP';
const TT_01_META = 'TT 01/2025/TT-BYT';
const QD_3618_BHXH_META = 'QĐ 3618/QĐ-BHXH';
const LEGAL_BASIS_BY_OPERATOR = {
  CHECK_INTERNAL_APPROVAL: `${VBHN_17_META}: Điều 3 khoản 1 điểm a; Điều 3 khoản 2. ${ND_188_META}. ${TT_01_META}. ${QD_3618_BHXH_META}`,
  CHECK_PHAMVI: `${VBHN_17_META}: Điều 3 khoản 1 điểm b; Điều 3 khoản 2. ${ND_188_META}. ${QD_3618_BHXH_META}`,
  CHECK_STAFF_PRACTICE_TIME: `${VBHN_17_META}: Điều 3 khoản 1 điểm b; Điều 3 khoản 2. ${ND_188_META}. ${QD_3618_BHXH_META}`,
  CHECK_EQUIPMENT: `${VBHN_17_META}: Điều 3 khoản 1 điểm b; Điều 3 khoản 2. ${ND_188_META}. ${QD_3618_BHXH_META}`,
  CHECK_PRICE: `${VBHN_17_META}: Điều 3 khoản 1 điểm c. ${ND_188_META}. ${QD_3618_BHXH_META}`,
  CHECK_VALIDITY: `${VBHN_17_META}: Điều 3 khoản 2. ${ND_188_META}. ${QD_3618_BHXH_META}`,
  CHECK_GHICHU: `${VBHN_17_META}: Điều 2 khoản 2, 3; Điều 4a khoản 2, 3. ${ND_188_META}. ${QD_3618_BHXH_META}`,
  CHECK_TEMP_LIST3: `${VBHN_17_META}: Điều 1 khoản 2 điểm c; Điều 4 khoản 6. ${ND_188_META}. ${QD_3618_BHXH_META}`,
  CHECK_ICD_INDICATION: `${VBHN_17_META}: Điều 3 khoản 1 điểm b. ${ND_188_META}. ${QD_3618_BHXH_META}`,
  CHECK_ICD_CONTRAINDICATION: `${VBHN_17_META}: Điều 3 khoản 1 điểm b. ${ND_188_META}. ${QD_3618_BHXH_META}`,
  CHECK_PTTT_LEVEL: `${VBHN_17_META}: Điều 3 khoản 1 điểm b. ${ND_188_META}. ${QD_3618_BHXH_META}`,
  CHECK_CATALOG_NAME_MATCH: `${VBHN_17_META}: Điều 3 khoản 1 điểm a. ${ND_188_META}. ${QD_3618_BHXH_META}`,
  CHECK_CATALOG_PRICE_CONFIG: `${VBHN_17_META}: Điều 3 khoản 1 điểm c. ${ND_188_META}. ${QD_3618_BHXH_META}`,
  CHECK_CATALOG_DECISION: `${VBHN_17_META}: Điều 3 khoản 2. ${ND_188_META}. ${QD_3618_BHXH_META}`,
  CHECK_LEGACY_BED_SERVICE_FORMAT: `${VBHN_17_META}: Điều 3 khoản 1 điểm a. ${ND_188_META}. ${QD_3618_BHXH_META}`,
};

let cacheConfig = null;
const STORAGE_CACHE_TTL_MS = 5 * 60 * 1000;
const storageDataCache = new Map();
const storageDataInFlight = new Map();
const ENGINE_YIELD_EVERY = 120;
const yieldToMainThread = () => new Promise((resolve) => setTimeout(resolve, 0));

export const xoaCacheDvktOpGiamDinh = () => {
  cacheConfig = null;
  storageDataCache.clear();
  storageDataInFlight.clear();
};

const toUpper = (v) => String(v || '').trim().toUpperCase();
const isEmpty = (v) => v === undefined || v === null || String(v).trim() === '';
const POSITIVE_FLAGS = new Set([
  '1', 'TRUE', 'ON', 'ACTIVE', 'VALID', 'APPROVED',
  'PHE_DUYET', 'DADUYET', 'DAPHE_DUYET', 'DUOCPHE_DUYET',
  'HOP_LE', 'HIEU_LUC', 'CON_HIEU_LUC', 'CONHIEULUC', 'AP_DUNG', 'APDUNG',
]);
const NEGATIVE_FLAGS = new Set([
  '0', 'FALSE', 'OFF', 'INACTIVE', 'INVALID', 'EXPIRED', 'LOCK',
  'CHUA_DUYET', 'CHUADUYET', 'KHONG_PHE_DUYET', 'KHONGPHE_DUYET',
  'KHONG_HIEU_LUC', 'KHONGHIEULUC', 'NGUNG', 'TAM_NGUNG', 'TAMNGUNG',
  'HET_HIEU_LUC', 'HETHIEULUC', 'KHOA',
]);
const toNumber = (v) => {
  if (isEmpty(v)) return 0;
  const n = Number(String(v).replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
};
const removeAccents = (v) => String(v || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/đ/g, 'd')
  .replace(/Đ/g, 'D');
const normalizeToken = (v) => removeAccents(v).toUpperCase().replace(/[^A-Z0-9]/g, '');
const normalizeText = (v) => removeAccents(v).toUpperCase().replace(/\s+/g, ' ').trim();

const parseList = (raw) => String(raw || '')
  .split(/[,;|]/)
  .map((s) => s.trim())
  .filter(Boolean);

const collectFieldValues = (row, keys = []) => {
  if (!row || typeof row !== 'object') return [];
  const normCandidates = new Set((Array.isArray(keys) ? keys : []).map((k) => normalizeToken(k)));
  const out = [];
  const seen = new Set();

  const pushValue = (value) => {
    const text = String(value ?? '').trim();
    if (!text) return;
    const key = `${text}`;
    if (seen.has(key)) return;
    seen.add(key);
    out.push(text);
  };

  (Array.isArray(keys) ? keys : []).forEach((key) => {
    if (row[key] !== undefined && row[key] !== null && String(row[key]).trim() !== '') {
      pushValue(row[key]);
    }
  });
  Object.entries(row).forEach(([k, v]) => {
    if (!normCandidates.has(normalizeToken(k))) return;
    if (v === undefined || v === null || String(v).trim() === '') return;
    pushValue(v);
  });
  return out;
};

const collectListValues = (row, keys = []) => {
  const out = [];
  const seen = new Set();
  collectFieldValues(row, keys).forEach((raw) => {
    parseList(raw).forEach((item) => {
      const token = String(item || '').trim();
      if (!token || seen.has(token)) return;
      seen.add(token);
      out.push(token);
    });
  });
  return out;
};

const isPositiveFlag = (raw) => POSITIVE_FLAGS.has(normalizeToken(raw));
const isNegativeFlag = (raw) => NEGATIVE_FLAGS.has(normalizeToken(raw));
const isActiveStatus = (raw, fallback = true) => {
  const token = normalizeToken(raw);
  if (!token) return fallback;
  if (isPositiveFlag(token)) return true;
  if (isNegativeFlag(token)) return false;
  return fallback;
};

const pickValue = (row, keys, fallback = '') => {
  if (!row || typeof row !== 'object') return fallback;
  for (const key of keys) {
    if (row[key] !== undefined && row[key] !== null && String(row[key]).trim() !== '') return row[key];
  }
  const normCandidates = new Set(keys.map((k) => normalizeToken(k)));
  for (const [k, v] of Object.entries(row)) {
    if (normCandidates.has(normalizeToken(k)) && !isEmpty(v)) return v;
  }
  return fallback;
};

const toDateKeyFromDate = (date, withTime = '0000') => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}${m}${d}${withTime}`;
};

const dateToKey = (v) => {
  if (v instanceof Date) {
    return toDateKeyFromDate(v);
  }
  if (typeof v === 'number' && Number.isFinite(v) && v >= 20000 && v <= 60000) {
    const baseUtc = Date.UTC(1899, 11, 30);
    return toDateKeyFromDate(new Date(baseUtc + Math.round(v) * 86400000));
  }
  const raw = String(v || '').trim();
  if (!raw) return '';
  if (/[/:-]/.test(raw)) {
    const parsed = new Date(raw);
    if (!Number.isNaN(parsed.getTime())) return toDateKeyFromDate(parsed);
  }
  const digits = raw.replace(/\D/g, '');
  if (!digits) return '';
  if (digits.length >= 12) return digits.slice(0, 12);
  if (digits.length === 8) return `${digits}0000`;
  return digits.padEnd(12, '0').slice(0, 12);
};

const normalizePrefix = (value) => {
  const raw = String(value || '').trim();
  if (!raw) return '';
  if (/^\d+$/.test(raw)) return raw.padStart(2, '0').slice(0, 2);
  return toUpper(raw).slice(0, 2);
};

const normalizeDvktCode = (value) => {
  const raw = toUpper(value).replace(/\s+/g, '');
  if (!raw) return '';
  const normalizedSeparators = /^[0-9.,]+$/.test(raw) ? raw.replace(/,/g, '.') : raw;
  // Canonicalize dotted numeric DVKT codes (e.g. 2.03 -> 02.03)
  if (/^\d+(\.\d+)+$/.test(normalizedSeparators)) {
    const parts = normalizedSeparators.split('.');
    parts[0] = parts[0].padStart(2, '0');
    return parts.join('.');
  }
  return normalizedSeparators;
};

/**
 * Trích mã giường/khám nội bộ **cũ** trong ghi chú hoặc tên giá (vd. K27.1939, H005)
 * để map sang dòng danh mục có MA_TUONG_DUONG mới (15.xx, K27.NG3, …).
 */
const extractLegacyGiuongKhamCodesFromText = (text) => {
  const raw = String(text || '');
  if (!raw.trim()) return [];
  const upper = toUpper(raw);
  const found = [];
  const seen = new Set();
  const push = (c) => {
    const n = normalizeDvktCode(c);
    if (!n || seen.has(n)) return;
    seen.add(n);
    found.push(n);
  };
  const reK = /\b(K\d+\.\d{4})\b/gi;
  let m = reK.exec(upper);
  while (m) {
    push(m[1]);
    m = reK.exec(upper);
  }
  const reH = /\b(H\d{2,4})\b/gi;
  m = reH.exec(upper);
  while (m) {
    push(m[1]);
    m = reH.exec(upper);
  }
  return found;
};

/** Mọi mã đối chiếu DVKT-OP-09: mã mới + MA_TD_LIST + mã cũ explicit + mã trích từ TEN_DVKT_GIA/GHICHU. */
const collectOp09AliasCodesForRow = (row) => {
  if (!row || typeof row !== 'object') return [];
  const seen = new Set();
  const out = [];
  const push = (v) => {
    const c = normalizeDvktCode(v);
    if (!c || seen.has(c)) return;
    seen.add(c);
    out.push(c);
  };
  push(pickValue(row, ['MA_TUONG_DUONG', 'MA_DICH_VU']));
  parseList(pickValue(row, ['MA_TD_LIST', 'MA_LIEN_KET_MA_CU', 'MA_DVKT_CU', 'MA_GIUONG_CU'])).forEach((x) => push(x));
  [
    pickValue(row, ['TEN_DVKT_GIA']),
    pickValue(row, ['GHICHU', 'GHI_CHU', 'QUY_TRINH']),
    pickValue(row, ['TEN_DVKT_PHEDUYET']),
  ].forEach((t) => {
    extractLegacyGiuongKhamCodesFromText(String(t || '')).forEach((c) => push(c));
  });
  return out;
};

const buildDmktEntryFromGiuongBkRow = (row, canonicalMa) => ({
  raw: row,
  canonicalMa: normalizeDvktCode(canonicalMa) || '',
  tenDvkt: String(pickValue(row, ['TEN_DVKT_PHEDUYET', 'TEN_DICH_VU', 'TEN_DVKT_GIA', 'TEN_GIA', 'TEN_DVKT']) || '').trim(),
  tenDvktNorm: normalizeText(pickValue(row, ['TEN_DVKT_PHEDUYET', 'TEN_DICH_VU', 'TEN_DVKT_GIA', 'TEN_GIA', 'TEN_DVKT'])),
  donGia: toNumber(pickValue(row, ['DON_GIA', 'GIA_TT_BHYT', 'DON_GIA_BHYT', 'GIA_BH_TT'])),
  tuNgayKey: dateToKey(pickValue(row, ['TU_NGAY', 'TUNGAY', 'HD_TU'])),
  denNgayKey: dateToKey(pickValue(row, ['DEN_NGAY', 'DENNGAY', 'HD_DEN'])),
  prefixHint: normalizePrefix(pickValue(row, ['PREFIX', 'PREFIX_DVKT']) || canonicalMa || ''),
  maChuyenKhoa: normalizePrefix(pickValue(row, ['MA_CHUYEN_KHOA', 'Mã chuyên khoa', 'PREFIX_DVKT'])),
  phamviNeeded: new Set(collectListValues(row, ['PHAMVI_CM_NEEDED', 'PHAMVI_CM_OK']).map((value) => normalizeToken(value)).filter(Boolean)),
  phanLoaiPtttRaw: String(pickValue(row, ['PHAN_LOAI_PTTT', 'MA_PTTT', 'PHAN_LOAI'])).trim(),
  phanLoaiPtttNorm: normalizeToken(pickValue(row, ['PHAN_LOAI_PTTT', 'MA_PTTT', 'PHAN_LOAI'])),
  ghiChuNorm: normalizeText(pickValue(row, ['GHICHU', 'GHI_CHU', 'QUY_TRINH'])),
  danhMucNorm: normalizeText(pickValue(row, ['DANH_MUC', 'DANH_MUC_AP_DUNG', 'PHAN_LOAI_DM', 'LOAI_DVKT'])),
  danhMucToken: normalizeToken(pickValue(row, ['DANH_MUC', 'DANH_MUC_AP_DUNG', 'PHAN_LOAI_DM', 'LOAI_DVKT'])),
  dieuKienThanhToanNorm: normalizeText(pickValue(row, ['DIEU_KIEN_THANH_TOAN', 'DIEU_KIEN', 'COT_3', 'DIEUKIEN_COT3'])),
  quyetDinh: String(pickValue(row, ['QUYET_DINH', 'QUYETDINH', 'SO_QUYET_DINH'])).trim(),
  maCskcb: toUpper(pickValue(row, ['MA_CSKCB', 'MA_BV'])),
  approvalRaw: pickValue(row, ['TINHTRANG_DV', 'TRANG_THAI', 'TRANGTHAI', 'TRANG_THAI_SU_DUNG', 'PHE_DUYET', 'DUOC_PHE_DUYET']),
  approvalNorm: normalizeToken(pickValue(row, ['TINHTRANG_DV', 'TRANG_THAI', 'TRANGTHAI', 'TRANG_THAI_SU_DUNG', 'PHE_DUYET', 'DUOC_PHE_DUYET'])),
  approvalActive: isActiveStatus(pickValue(row, ['TINHTRANG_DV', 'TRANG_THAI', 'TRANGTHAI', 'TRANG_THAI_SU_DUNG', 'PHE_DUYET', 'DUOC_PHE_DUYET']), true),
});

const buildOp09DmktMapFromGiuongRows = (rows) => {
  const dmktByCode = new Map();
  (Array.isArray(rows) ? rows : []).forEach((row) => {
    const codes = collectOp09AliasCodesForRow(row);
    const canonicalMa = normalizeDvktCode(pickValue(row, ['MA_TUONG_DUONG', 'MA_DICH_VU'])) || codes[0];
    if (!canonicalMa || codes.length === 0) return;
    const entry = buildDmktEntryFromGiuongBkRow(row, canonicalMa);
    codes.forEach((code) => {
      if (!dmktByCode.has(code)) dmktByCode.set(code, entry);
    });
  });
  return dmktByCode;
};

const buildOp09InternalApprovalMapFromGiuongRows = (rows) => {
  const internalApprovalByCode = new Map();
  (Array.isArray(rows) ? rows : []).forEach((row) => {
    const codes = collectOp09AliasCodesForRow(row);
    const canonicalMa = normalizeDvktCode(pickValue(row, ['MA_TUONG_DUONG', 'MA_DICH_VU'])) || codes[0];
    if (!canonicalMa) return;
    const approvalEntry = {
      raw: row,
      canonicalMa: normalizeDvktCode(canonicalMa),
      maCskcb: toUpper(pickValue(row, ['MA_CSKCB', 'MA_BV'])),
      tuNgayKey: dateToKey(pickValue(row, ['TU_NGAY', 'TUNGAY', 'HD_TU', 'NGAY_HL_TU'])),
      denNgayKey: dateToKey(pickValue(row, ['DEN_NGAY', 'DENNGAY', 'HD_DEN', 'NGAY_HL_DEN'])),
      approvalRaw: pickValue(row, ['TINHTRANG_DV', 'TRANG_THAI', 'TRANGTHAI', 'TRANG_THAI_SU_DUNG', 'PHE_DUYET', 'DUOC_PHE_DUYET']),
      approvalNorm: normalizeToken(pickValue(row, ['TINHTRANG_DV', 'TRANG_THAI', 'TRANGTHAI', 'TRANG_THAI_SU_DUNG', 'PHE_DUYET', 'DUOC_PHE_DUYET'])),
      approvalActive: isActiveStatus(pickValue(row, ['TINHTRANG_DV', 'TRANG_THAI', 'TRANGTHAI', 'TRANG_THAI_SU_DUNG', 'PHE_DUYET', 'DUOC_PHE_DUYET']), true),
    };
    codes.forEach((code) => {
      if (!internalApprovalByCode.has(code)) internalApprovalByCode.set(code, approvalEntry);
    });
  });
  return internalApprovalByCode;
};

/** Chỉ mục TEN_DVKT_PHEDUYET (đã map sang TEN_DICH_VU) → entry OP09 — fallback khi hồ sơ còn mã cũ nhưng tên khớp danh mục. */
const buildOp09DmktByTenNorm = (rows, dmktByCode) => {
  const byTen = new Map();
  (Array.isArray(rows) ? rows : []).forEach((row) => {
    const canonicalMa = normalizeDvktCode(pickValue(row, ['MA_TUONG_DUONG', 'MA_DICH_VU']));
    if (!canonicalMa) return;
    const entry = dmktByCode.get(canonicalMa);
    if (!entry) return;
    const tenPheDuyet = normalizeText(pickValue(row, ['TEN_DVKT_PHEDUYET', 'TEN_DICH_VU']));
    if (tenPheDuyet.length >= 6 && !byTen.has(tenPheDuyet)) byTen.set(tenPheDuyet, entry);
  });
  return byTen;
};

const parseAllowedProfessionCodes = (raw) => {
  const matches = String(raw || '').match(/\d+/g) || [];
  return [...new Set(matches.map((item) => normalizeToken(item)).filter(Boolean))];
};
const PREFIX_KHONG_DU_TIN_CAY_DE_KET_LUAN_NGUOI_THUC_HIEN = new Set(['18', '21', '22', '23', '24', '25']);

const dateKeyToHHMM = (dateKey) => {
  const digits = String(dateKey || '').replace(/\D/g, '');
  if (digits.length < 12) return null;
  const hh = Number(digits.slice(8, 10));
  const mm = Number(digits.slice(10, 12));
  if (!Number.isFinite(hh) || !Number.isFinite(mm) || hh < 0 || hh > 23 || mm < 0 || mm > 59) return null;
  return hh * 100 + mm;
};

const parseHHMM = (value) => {
  const raw = String(value || '').trim();
  if (!raw) return null;
  const digits = raw.replace(/\D/g, '');
  if (!digits) return null;
  let hh = 0;
  let mm = 0;
  if (digits.length <= 2) {
    hh = Number(digits);
  } else if (digits.length === 3) {
    hh = Number(digits.slice(0, 1));
    mm = Number(digits.slice(1, 3));
  } else {
    hh = Number(digits.slice(0, 2));
    mm = Number(digits.slice(2, 4));
  }
  if (!Number.isFinite(hh) || !Number.isFinite(mm) || hh < 0 || hh > 23 || mm < 0 || mm > 59) return null;
  return hh * 100 + mm;
};

const parseTimeRanges = (raw) => {
  const text = String(raw || '');
  if (!text.trim()) return [];
  const rangeRegex = /(\d{1,2}(?::?\d{2})?)\s*[-~?]\s*(\d{1,2}(?::?\d{2})?)/g;
  const ranges = [];
  let match = rangeRegex.exec(text);
  while (match) {
    const from = parseHHMM(match[1]);
    const to = parseHHMM(match[2]);
    if (from !== null && to !== null) {
      ranges.push({ from, to, overnight: from > to });
    }
    match = rangeRegex.exec(text);
  }
  return ranges;
};

const isWithinRanges = (hhmm, ranges) => {
  if (!Number.isFinite(hhmm) || !Array.isArray(ranges) || ranges.length === 0) return true;
  return ranges.some((r) => {
    if (!r.overnight) return hhmm >= r.from && hhmm <= r.to;
    return hhmm >= r.from || hhmm <= r.to;
  });
};

const isRuleOn = (raw) => {
  const s = normalizeToken(raw);
  return ['ON', '1', 'TRUE', 'ACTIVE', 'HOATDONG', 'BAT'].includes(s);
};

const normalizeResult = (raw, fallback = 'WARNING') => {
  const s = normalizeToken(raw);
  if (!s) return fallback;
  if (['PASS', 'OK', 'SUCCESS'].includes(s)) return 'PASS';
  if (['REJECT', 'ERROR', 'CRITICAL', 'NGHIEMTRONG', 'TUCHOI'].includes(s)) return 'REJECT';
  return 'WARNING';
};

const toMucDo = (result, rawSeverity) => {
  const sev = normalizeToken(rawSeverity);
  if (result === 'REJECT') return sev.includes('CRITICAL') ? 'Critical' : 'Error';
  if (result === 'WARNING') return 'Warning';
  return 'Info';
};

const RESULT_PRIORITY = {
  PASS: 0,
  WARNING: 1,
  REJECT: 2,
};

const taoKhoaGopRule = (rule = {}) => {
  const operator = toUpper(rule?.OPERATOR);
  const msg = normalizeText(rule?.ALERT_MESSAGE || '');
  const name = normalizeText(rule?.RULE_NAME || '');
  const code = normalizeToken(rule?.RULE_CODE || '');
  const sig = msg || name || code || 'RULE';
  return `${operator}|${sig}`;
};

const locTrungRuleTheoYNgia = (rules = []) => {
  const map = new Map();
  (Array.isArray(rules) ? rules : []).forEach((rule) => {
    const key = taoKhoaGopRule(rule);
    const cu = map.get(key);
    if (!cu) {
      map.set(key, rule);
      return;
    }
    const cuPriority = RESULT_PRIORITY[normalizeResult(cu?.SEVERITY, 'WARNING')] ?? 1;
    const moiPriority = RESULT_PRIORITY[normalizeResult(rule?.SEVERITY, 'WARNING')] ?? 1;
    if (moiPriority > cuPriority) map.set(key, rule);
  });
  return Array.from(map.values());
};

const taoKhoaGopKetQua = (detail = {}) => {
  const phanHe = toUpper(detail.source_xml || '');
  const idx = Number.isFinite(detail.line_index) ? detail.line_index : -1;
  const maDv = toUpper(detail.ma_tuong_duong || '');
  const op = toUpper(detail.operator || '');
  const field = toUpper(detail.field || '');
  const result = toUpper(detail.result || '');
  const msg = normalizeText(detail.alert_message || '');
  return [phanHe, idx, maDv, op, field, result, msg].join('|');
};

const locTrungKetQuaTheoYNgia = (details = []) => {
  const seen = new Set();
  return (Array.isArray(details) ? details : []).filter((item) => {
    const key = taoKhoaGopKetQua(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const getStorageCache = (key) => {
  const hit = storageDataCache.get(key);
  if (!hit) return null;
  if (hit.expiredAt <= Date.now()) {
    storageDataCache.delete(key);
    return null;
  }
  return hit.value;
};

const setStorageCache = (key, value) => {
  storageDataCache.set(key, {
    value,
    expiredAt: Date.now() + STORAGE_CACHE_TTL_MS,
  });
};

const laMoiTruongWeb = () => Platform.OS === 'web' && typeof window !== 'undefined' && !!window.localStorage;

const parseRawStorageRows = (raw) => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    if (parsed && Array.isArray(parsed.data)) return parsed.data;
    if (parsed && Array.isArray(parsed.rules)) return parsed.rules;
    return [];
  } catch {
    return [];
  }
};

const fetchChunkedData = async (key) => {
  const cached = getStorageCache(key);
  if (cached) return cached;

  const pending = storageDataInFlight.get(key);
  if (pending) return pending;

  const loader = (async () => {
    try {
      if (laMoiTruongWeb()) {
        const rawWeb = window.localStorage.getItem(key);
        const parsedWeb = parseRawStorageRows(rawWeb);
        if (parsedWeb.length > 0) {
          setStorageCache(key, parsedWeb);
          return parsedWeb;
        }
      }

      const chunks = await AsyncStorage.getItem(`${key}_CHUNKS`);
      if (chunks) {
        const total = Number(chunks) || 0;
        let full = [];
        const chunkKeys = Array.from({ length: total }, (_, i) => `${key}_CHUNK_${i}`);
        const chunkPairs = await AsyncStorage.multiGet(chunkKeys);
        chunkPairs.forEach(([, raw]) => {
          if (!raw) return;
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) full = full.concat(parsed);
        });
        setStorageCache(key, full);
        return full;
      }
      const raw = await AsyncStorage.getItem(key);
      if (!raw) {
        setStorageCache(key, []);
        return [];
      }
      const parsed = JSON.parse(raw);
      const normalized = Array.isArray(parsed)
        ? parsed
        : (parsed && Array.isArray(parsed.data))
          ? parsed.data
          : (parsed && Array.isArray(parsed.rules))
            ? parsed.rules
            : [];
      setStorageCache(key, normalized);
      return normalized;
    } catch {
      return [];
    } finally {
      storageDataInFlight.delete(key);
    }
  })();

  storageDataInFlight.set(key, loader);
  return loader;
};

const loadTable = async (primaryKey, fallbackKey = '') => {
  const primary = await fetchChunkedData(primaryKey);
  if (Array.isArray(primary) && primary.length > 0) return primary;

  if (fallbackKey) {
    const fallback = await fetchChunkedData(fallbackKey);
    if (Array.isArray(fallback) && fallback.length > 0) return fallback;
  }

  const remotePrimary = await hydrateDvktTableFromFirebase({
    datasetKey: primaryKey,
    persistLocal: true,
    localKey: primaryKey,
  });
  if (remotePrimary?.ok && Array.isArray(remotePrimary.data) && remotePrimary.data.length > 0) {
    setStorageCache(primaryKey, remotePrimary.data);
    return remotePrimary.data;
  }

  if (fallbackKey) {
    const remoteFallback = await hydrateDvktTableFromFirebase({
      datasetKey: fallbackKey,
      persistLocal: false,
    });
    if (remoteFallback?.ok && Array.isArray(remoteFallback.data) && remoteFallback.data.length > 0) {
      return remoteFallback.data;
    }
  }

  return getBuiltinRows(primaryKey, fallbackKey);
};

const collectIcdCodes = (xml1) => {
  const rawFields = [
    pickValue(xml1, ['MA_BENH', 'MA_BENH_CHINH']),
    pickValue(xml1, ['MA_BENH_KT', 'MA_BENHKHAC']),
    pickValue(xml1, ['MA_BENH_PHU']),
  ];
  const codes = new Set();
  rawFields.forEach((raw) => {
    const parts = String(raw || '').split(/[,;|\s]+/).filter(Boolean);
    parts.forEach((p) => {
      const icd = toUpper(p);
      if (/^[A-Z]\d{2}[A-Z0-9.]{0,4}$/.test(icd)) codes.add(icd.replace('.', ''));
    });
  });
  return codes;
};

const normalizeRules = (rows) => {
  const output = [];
  (Array.isArray(rows) ? rows : []).forEach((r) => {
    const operator = toUpper(pickValue(r, ['OPERATOR', 'TOAN_TU', 'LOAI_OPERATOR']));
    if (!operator) return;
    output.push({
      ...r,
      RULE_CODE: pickValue(r, ['RULE_CODE', 'MA_LUAT', 'MALUAT'], ''),
      RULE_NAME: pickValue(r, ['RULE_NAME', 'TEN_QUY_TAC', 'TENQUYTAC'], ''),
      STATUS: pickValue(r, ['STATUS', 'TRANG_THAI', 'TRANGTHAI'], 'ON'),
      SEVERITY: pickValue(r, ['SEVERITY', 'MUC_DO', 'MUCDO', 'CAN_NANG'], 'WARNING'),
      ALERT_MESSAGE: pickValue(r, ['ALERT_MESSAGE', 'CANH_BAO', 'CANHBAO'], 'Vi ph?m quy t?c DVKT'),
      OPERATOR: operator,
    });
  });
  return output;
};

const mapByPrefix = (rows, prefixKeys, valueKeys) => {
  const m = new Map();
  (Array.isArray(rows) ? rows : []).forEach((row) => {
    const prefixes = parseList(pickValue(row, prefixKeys));
    const values = parseList(pickValue(row, valueKeys));
    prefixes.forEach((pf) => {
      const key = normalizePrefix(pf) || toUpper(pf).slice(0, 2);
      if (!key) return;
      if (!m.has(key)) m.set(key, []);
      m.get(key).push({ row, values });
    });
  });
  return m;
};

/**
 * Map sheet nội bộ Khám và giường bệnh (DANH_MUC_GIUONG_BAN_KHAM_BV) → dòng field tương thích engine.
 * DVKT-OP-09: MA_TUONG_DUONG = mã mới; MA_TD_LIST / MA_*_CU / mã trong TEN_DVKT_GIA (Kxx.xxxx, Hxxx) dùng ghép mã cũ từ hồ sơ.
 */
const mapGiuongBanKhamRowToDmkt = (row) => {
  if (!row || typeof row !== 'object') return null;
  const ma = normalizeDvktCode(pickValue(row, ['MA_TUONG_DUONG', 'MA_DICH_VU']));
  if (!ma) return null;
  return {
    ...row,
    MA_DICH_VU: ma,
    MA_TUONG_DUONG: ma,
    TEN_DICH_VU: String(pickValue(row, ['TEN_DVKT_PHEDUYET', 'TEN_DICH_VU']) || '').trim(),
    TEN_DVKT_GIA: String(pickValue(row, ['TEN_DVKT_GIA', 'TEN_DVKT_PHEDUYET']) || '').trim(),
    DON_GIA: pickValue(row, ['DON_GIA']),
    TINHTRANG_DV: pickValue(row, ['TINHTRANG_DV', 'TRANG_THAI']) || '1',
    TU_NGAY: pickValue(row, ['TU_NGAY', 'TUNGAY']),
    DEN_NGAY: pickValue(row, ['DEN_NGAY', 'DENNGAY']),
    GHICHU: pickValue(row, ['GHICHU', 'GHI_CHU', 'QUY_TRINH']),
    QUYET_DINH: pickValue(row, ['QUYET_DINH']),
    MA_CSKCB: pickValue(row, ['MA_CSKCB', 'CSKCB_CGKT']) || pickValue(row, ['CSKCB_CLS']),
    PHAN_LOAI_PTTT: pickValue(row, ['PHAN_LOAI_PTTT']),
  };
};

const mergeDvktRowsWithBuiltin = (rows, builtinRows = DANH_MUC_DVKT_M05) => {
  const out = [];
  const seen = new Set();
  const addRow = (row) => {
    if (!row || typeof row !== 'object') return;
    const code = normalizeDvktCode(pickValue(row, ['MA_TUONG_DUONG', 'MA_DICH_VU', 'MA_DVKT', 'MA_GIA']));
    if (!code || seen.has(code)) return;
    seen.add(code);
    out.push(row);
  };

  (Array.isArray(rows) ? rows : []).forEach(addRow);
  (Array.isArray(builtinRows) ? builtinRows : []).forEach(addRow);
  return out;
};

const buildDmktMapFromRows = (rows) => {
  const dmktByCode = new Map();
  (Array.isArray(rows) ? rows : []).forEach((row) => {
    const codes = [
      pickValue(row, ['MA_TUONG_DUONG', 'MA_DICH_VU', 'MA_DVKT', 'MA_GIA']),
      ...parseList(pickValue(row, ['MA_TD_LIST'])),
    ]
      .map((x) => normalizeDvktCode(x))
      .filter(Boolean);
    const entry = {
      raw: row,
      tenDvkt: String(pickValue(row, ['TEN_DICH_VU', 'TEN_DVKT_GIA', 'TEN_GIA', 'TEN_DVKT'])).trim(),
      tenDvktNorm: normalizeText(pickValue(row, ['TEN_DICH_VU', 'TEN_DVKT_GIA', 'TEN_GIA', 'TEN_DVKT'])),
      donGia: toNumber(pickValue(row, ['DON_GIA', 'GIA_TT_BHYT', 'DON_GIA_BHYT', 'GIA_BH_TT'])),
      tuNgayKey: dateToKey(pickValue(row, ['TU_NGAY', 'TUNGAY', 'HD_TU'])),
      denNgayKey: dateToKey(pickValue(row, ['DEN_NGAY', 'DENNGAY', 'HD_DEN'])),
      prefixHint: normalizePrefix(pickValue(row, ['PREFIX', 'PREFIX_DVKT']) || codes[0] || ''),
      maChuyenKhoa: normalizePrefix(pickValue(row, ['MA_CHUYEN_KHOA', 'Mã chuyên khoa', 'PREFIX_DVKT'])),
      phamviNeeded: new Set(collectListValues(row, ['PHAMVI_CM_NEEDED', 'PHAMVI_CM_OK']).map((value) => normalizeToken(value)).filter(Boolean)),
      phanLoaiPtttRaw: String(pickValue(row, ['PHAN_LOAI_PTTT', 'MA_PTTT', 'PHAN_LOAI'])).trim(),
      phanLoaiPtttNorm: normalizeToken(pickValue(row, ['PHAN_LOAI_PTTT', 'MA_PTTT', 'PHAN_LOAI'])),
      ghiChuNorm: normalizeText(pickValue(row, ['GHICHU', 'GHI_CHU', 'QUY_TRINH'])),
      danhMucNorm: normalizeText(pickValue(row, ['DANH_MUC', 'DANH_MUC_AP_DUNG', 'PHAN_LOAI_DM', 'LOAI_DVKT'])),
      danhMucToken: normalizeToken(pickValue(row, ['DANH_MUC', 'DANH_MUC_AP_DUNG', 'PHAN_LOAI_DM', 'LOAI_DVKT'])),
      dieuKienThanhToanNorm: normalizeText(pickValue(row, ['DIEU_KIEN_THANH_TOAN', 'DIEU_KIEN', 'COT_3', 'DIEUKIEN_COT3'])),
      quyetDinh: String(pickValue(row, ['QUYET_DINH', 'QUYETDINH', 'SO_QUYET_DINH'])).trim(),
      maCskcb: toUpper(pickValue(row, ['MA_CSKCB', 'MA_BV'])),
      approvalRaw: pickValue(row, ['TINHTRANG_DV', 'TRANG_THAI', 'TRANGTHAI', 'TRANG_THAI_SU_DUNG', 'PHE_DUYET', 'DUOC_PHE_DUYET']),
      approvalNorm: normalizeToken(pickValue(row, ['TINHTRANG_DV', 'TRANG_THAI', 'TRANGTHAI', 'TRANG_THAI_SU_DUNG', 'PHE_DUYET', 'DUOC_PHE_DUYET'])),
      approvalActive: isActiveStatus(pickValue(row, ['TINHTRANG_DV', 'TRANG_THAI', 'TRANGTHAI', 'TRANG_THAI_SU_DUNG', 'PHE_DUYET', 'DUOC_PHE_DUYET']), true),
    };
    codes.forEach((code) => {
      if (!dmktByCode.has(code)) dmktByCode.set(code, entry);
    });
  });
  return dmktByCode;
};

const buildInternalApprovalMapFromRows = (rows) => {
  const internalApprovalByCode = new Map();
  (Array.isArray(rows) ? rows : []).forEach((row) => {
    const codes = [
      pickValue(row, ['MA_TUONG_DUONG', 'MA_DICH_VU', 'MA_DVKT', 'MA_GIA']),
      ...parseList(pickValue(row, ['MA_TD_LIST'])),
    ].map((x) => normalizeDvktCode(x)).filter(Boolean);

    const approvalEntry = {
      raw: row,
      maCskcb: toUpper(pickValue(row, ['MA_CSKCB', 'MA_BV'])),
      tuNgayKey: dateToKey(pickValue(row, ['TU_NGAY', 'TUNGAY', 'HD_TU', 'NGAY_HL_TU'])),
      denNgayKey: dateToKey(pickValue(row, ['DEN_NGAY', 'DENNGAY', 'HD_DEN', 'NGAY_HL_DEN'])),
      approvalRaw: pickValue(row, ['TINHTRANG_DV', 'TRANG_THAI', 'TRANGTHAI', 'TRANG_THAI_SU_DUNG', 'PHE_DUYET', 'DUOC_PHE_DUYET']),
      approvalNorm: normalizeToken(pickValue(row, ['TINHTRANG_DV', 'TRANG_THAI', 'TRANGTHAI', 'TRANG_THAI_SU_DUNG', 'PHE_DUYET', 'DUOC_PHE_DUYET'])),
      approvalActive: isActiveStatus(pickValue(row, ['TINHTRANG_DV', 'TRANG_THAI', 'TRANGTHAI', 'TRANG_THAI_SU_DUNG', 'PHE_DUYET', 'DUOC_PHE_DUYET']), true),
    };

    codes.forEach((code) => {
      if (!internalApprovalByCode.has(code)) internalApprovalByCode.set(code, approvalEntry);
    });
  });
  return internalApprovalByCode;
};

const hasIntersectionSet = (setA, setB) => {
  if (!setA || !setB || setA.size === 0 || setB.size === 0) return false;
  for (const v of setB) {
    if (setA.has(v)) return true;
  }
  return false;
};

const toCompiledRule = (rule) => {
  const operator = toUpper(rule?.OPERATOR);
  const handler = OPERATOR_HANDLERS[operator];
  if (!handler) return null;
  return {
    ...rule,
    OPERATOR: operator,
    _handler: handler,
    _severity: normalizeResult(rule?.SEVERITY, 'WARNING'),
    _legal_basis: resolveLegalBasis(rule),
  };
};

const buildEngineConfig = async () => {
  if (cacheConfig) return cacheConfig;

  const [rulesRaw, dmkt, internalApprovalRows, equipment, staff, servicePractitionerMap, phamviMap, indicationMap, contraRows, equipDvktMap, mapTrangThaiNoiBo] = await Promise.all([
    loadTable(DVKT_ENGINE_STORAGE_KEYS.RULES, 'CDSS_DATA_LUAT_CDHA'),
    loadTable(DVKT_ENGINE_STORAGE_KEYS.DMKT, 'DANH_MUC_DVKT_M05'),
    loadTable(DVKT_ENGINE_STORAGE_KEYS.INTERNAL_APPROVAL, DVKT_OP09_CATALOG_STORAGE_KEY),
    loadTable(DVKT_ENGINE_STORAGE_KEYS.EQUIPMENT, 'DANH_MUC_TRANG_THIET_BI_M06'),
    loadTable(DVKT_ENGINE_STORAGE_KEYS.STAFF, 'DANH_MUC_NHAN_SU'),
    loadTable(DVKT_ENGINE_STORAGE_KEYS.SERVICE_PRACTITIONER_MAP, 'DANH_MUC_MAPPING_NGUOI_HANH_NGHE'),
    loadTable(DVKT_ENGINE_STORAGE_KEYS.PHAMVI_MAPPING),
    loadTable(DVKT_ENGINE_STORAGE_KEYS.ICD10_INDICATION),
    loadTable(DVKT_ENGINE_STORAGE_KEYS.ICD10_CONTRAINDICATION),
    loadTable(DVKT_ENGINE_STORAGE_KEYS.EQUIP_DVKT_MAP),
    taiMapTrangThaiQuyTacNoiBo(),
  ]);

  const rules = normalizeRules(rulesRaw);
  const activeRules = locTrungRuleTheoYNgia((rules.length > 0 ? rules : DEFAULT_DVKT_RULES)
    .filter((r) => isRuleOn(r.STATUS))
    .filter((r) => toUpper(r.RULE_CODE || r.MA_LUAT || '') !== 'DVKT-OP-12')
    .filter((r) => isQuyTacNoiBoDangBat(r.RULE_CODE || r.MA_LUAT || '', mapTrangThaiNoiBo, true))
    .map((rule) => toCompiledRule(rule))
    .filter(Boolean));

  const giuongBkRaw = await loadTable(DVKT_OP09_CATALOG_STORAGE_KEY, DVKT_ENGINE_STORAGE_KEYS.INTERNAL_APPROVAL);
  const giuongBkMapped = (Array.isArray(giuongBkRaw) ? giuongBkRaw : [])
    .map(mapGiuongBanKhamRowToDmkt)
    .filter(Boolean);

  const dmktRows = mergeDvktRowsWithBuiltin(
    [...giuongBkMapped, ...(Array.isArray(dmkt) ? dmkt : [])],
    DANH_MUC_DVKT_M05,
  );
  /** Không trộn DM M05: slot legacy (nếu còn dùng) chỉ phản ánh Giường & khám BV + bản sao đồng bộ DVKT_INTERNAL_APPROVAL. */
  const internalApprovalRowsResolved = mergeDvktRowsWithBuiltin(
    [...giuongBkMapped, ...(Array.isArray(internalApprovalRows) ? internalApprovalRows : [])],
    [],
  );

  const phamviRows = (Array.isArray(phamviMap) ? phamviMap : []).map((row) => ({
    row,
    prefix: normalizePrefix(pickValue(row, ['PREFIX_DVKT', 'PREFIX', 'DVKT_PREFIX'])),
    scopes: new Set(collectListValues(row, ['PHAMVI_CM_OK', 'PHAMVI_CM', 'ALLOW_PHAMVI']).map((value) => normalizeToken(value)).filter(Boolean)),
    titles: new Set(parseAllowedProfessionCodes(pickValue(row, ['CHUCDANH_NN_OK', 'CHUCDANH_OK', 'CHUC_DANH_OK']))),
    groupName: String(pickValue(row, ['NHOM_DVKT', 'NHOM', 'TEN_NHOM'])).trim(),
  })).filter((item) => item.prefix);
  const phamviByPrefix = new Map();
  phamviRows.forEach((item) => {
    if (!phamviByPrefix.has(item.prefix)) phamviByPrefix.set(item.prefix, []);
    phamviByPrefix.get(item.prefix).push(item);
  });
  const indicationByPrefix = mapByPrefix(indicationMap, ['PREFIX_DVKT', 'PREFIX', 'DVKT_PREFIX'], ['ICD_CODES', 'MA_BENH', 'ICD10_LIST']);
  const equipReqByPrefix = mapByPrefix(equipDvktMap, ['PREFIX_DVKT', 'DVKT_PREFIX_REQUIRED'], ['MA_MAY_PREFIX', 'EQUIP_PREFIX', 'REQUIRED_PREFIX']);

  const phamviAllowedByPrefix = new Map();
  const chucDanhAllowedByPrefix = new Map();
  const nhomDvktByPrefix = new Map();
  phamviByPrefix.forEach((rows, prefix) => {
    const allowedScopes = new Set();
    const allowedTitles = new Set();
    const groupNames = new Set();
    rows.forEach((item) => {
      item.scopes.forEach((scope) => allowedScopes.add(scope));
      item.titles.forEach((title) => allowedTitles.add(title));
      if (item.groupName) groupNames.add(item.groupName);
    });
    phamviAllowedByPrefix.set(prefix, allowedScopes);
    chucDanhAllowedByPrefix.set(prefix, allowedTitles);
    nhomDvktByPrefix.set(prefix, Array.from(groupNames).join('; '));
  });

  const servicePractitionerByCode = new Map();
  const servicePractitionerByName = new Map();
  (Array.isArray(servicePractitionerMap) ? servicePractitionerMap : []).forEach((row) => {
    const maTuongDuong = normalizeDvktCode(pickValue(row, ['MA_TUONG_DUONG', 'MA_DICH_VU', 'MA_DVKT']));
    const tenDvkt = String(pickValue(row, ['TEN_DVKT', 'TEN_DICH_VU'])).trim();
    const tenDvktNorm = normalizeText(tenDvkt);
    const requiredScopes = new Set(collectListValues(row, ['PHAMVI_CM_CAN', 'PHAMVI_CM cần', 'PHAMVI_CM_NEEDED', 'PHAMVI_CM_OK']).map((value) => normalizeToken(value)).filter(Boolean));
    const allowedStaffIds = new Set(collectListValues(row, ['DANH_SACH_MACCHN', 'DANH_SACH_MA_BHXH', 'MACCHN', 'MA_BHXH']).map((value) => toUpper(value)).filter(Boolean));
    const allowedStaffNames = collectListValues(row, ['DANH_SACH_NGUOI_THUC_HIEN', 'Danh sách người thực hiện', 'NGUOI_THUC_HIEN']).map((value) => String(value || '').trim()).filter(Boolean);
    const soNvDuDieuKien = Number(pickValue(row, ['SO_NV_DU_DIEU_KIEN', 'Số NV đủ điều kiện', 'SO_NV']));
    const entry = {
      raw: row,
      maTuongDuong,
      tenDvkt,
      tenDvktNorm,
      maChuyenKhoa: normalizePrefix(pickValue(row, ['MA_CHUYEN_KHOA', 'Mã chuyên khoa', 'PREFIX_DVKT'])),
      requiredScopes,
      allowedStaffIds,
      allowedStaffNames,
      soNvDuDieuKien: Number.isFinite(soNvDuDieuKien) ? soNvDuDieuKien : allowedStaffIds.size,
      statusNorm: normalizeToken(pickValue(row, ['TRANG_THAI', 'Trạng thái', 'STATUS'])),
    };
    if (maTuongDuong && !servicePractitionerByCode.has(maTuongDuong)) servicePractitionerByCode.set(maTuongDuong, entry);
    if (tenDvktNorm && !servicePractitionerByName.has(tenDvktNorm)) servicePractitionerByName.set(tenDvktNorm, entry);
  });

  const indicationRulesByPrefix = new Map();
  indicationByPrefix.forEach((rows, prefix) => {
    const compiled = rows.map((x) => {
      const codes = new Set(x.values.map((v) => toUpper(v).replace('.', '')));
      const hasAll = codes.has('TATCA') || codes.has('ALL') || codes.has('*');
      return { hasAll, codes };
    });
    indicationRulesByPrefix.set(prefix, compiled);
  });

  const equipRequiredByPrefix = new Map();
  equipReqByPrefix.forEach((rows, prefix) => {
    const required = new Set();
    rows.forEach((x) => x.values.forEach((v) => required.add(toUpper(v))));
    equipRequiredByPrefix.set(prefix, required);
  });

  const contraCompiled = (Array.isArray(contraRows) ? contraRows : []).map((row) => ({
    prefix: normalizePrefix(pickValue(row, ['PREFIX_DVKT', 'PREFIX'])),
    dvktTypeNorm: normalizeText(pickValue(row, ['DVKT_TYPE', 'LOAI_DVKT', 'TEN_DVKT'])),
    icdCodes: new Set(parseList(pickValue(row, ['ICD_CODES', 'MA_BENH', 'ICD10_LIST'])).map((x) => toUpper(x).replace('.', ''))),
    severity: normalizeResult(pickValue(row, ['SEVERITY', 'MUC_DO']), 'REJECT'),
  }));

  const dmktByCode = buildDmktMapFromRows(dmktRows);
  const approvalRows = internalApprovalRowsResolved;
  const internalApprovalByCode = buildInternalApprovalMapFromRows(approvalRows);

  /**
   * DVKT-OP-09 (CHECK_INTERNAL_APPROVAL): chỉ giuongBkMapped — sheet Giường & khám (mã BV mới).
   * Đối chiếu thêm MA_TD_LIST / mã cũ trong ghi chú (Kxx.xxxx, Hxxx) và tên TEN_DVKT_PHEDUYET khi mã hồ sơ là hệ cũ.
   */
  const op09DmktByCode = buildOp09DmktMapFromGiuongRows(giuongBkMapped);
  const op09InternalApprovalByCode = buildOp09InternalApprovalMapFromGiuongRows(giuongBkMapped);
  const op09DmktByTenNorm = buildOp09DmktByTenNorm(giuongBkMapped, op09DmktByCode);

  const staffById = new Map();
  const staffByMacchn = new Map();
  (Array.isArray(staff) ? staff : []).forEach((row) => {
    const ids = [
      ...collectFieldValues(row, STAFF_LOOKUP_ID_KEYS),
      ...parseList(pickValue(row, ['ALIAS_IDS', 'IDS'])),
    ].map((x) => toUpper(x)).filter(Boolean);
    const scopes = new Set(collectListValues(row, ['PHAMVI_CM', 'PHAMVI']).map((v) => normalizeToken(v)).filter((v) => /^\d+$/.test(v)));
    collectListValues(row, ['PHAMVI_CMBS']).map((v) => normalizeToken(v)).filter((v) => /^\d+$/.test(v)).forEach((v) => scopes.add(v));
    const practiceFromKey = dateToKey(pickValue(row, ['TU_NGAY', 'NGAY_HL_TU', 'NGAY_BAT_DAU', 'NGAY_HIEU_LUC_TU', 'NGAYCAP_CCHN']));
    const practiceToKey = dateToKey(pickValue(row, ['DEN_NGAY', 'NGAY_HL_DEN', 'NGAY_KET_THUC', 'NGAY_HIEU_LUC_DEN', 'NGAYHET_CCHN']));
    const licenseIssueKey = dateToKey(pickValue(row, ['NGAYCAP_CCHN', 'NGAY_CAP_CCHN', 'NGAYCAP']));
    const licenseExpireKey = dateToKey(pickValue(row, ['NGAYHET_CCHN', 'NGAY_HET_CCHN', 'NGAY_HET_HAN', 'DEN_NGAY_CCHN']));
    const lichHanhNgheRaw = collectFieldValues(row, ['THOIGIAN_NGAY', 'GIO_LAM_VIEC', 'CA_TRUC', 'THOIGIAN_DK']);
    const workRanges = lichHanhNgheRaw.flatMap((value) => parseTimeRanges(value));
    const staffEntry = {
      raw: row,
      scopes,
      hoTen: String(pickValue(row, ['HO_TEN', 'TEN_BAC_SI', 'TEN_NHAN_SU'])).trim(),
      maBhxh: toUpper(pickValue(row, ['MA_BHXH', 'MA_BAC_SI', 'MA_NV', 'ID'])),
      soCccd: toUpper(pickValue(row, ['SO_CCCD', 'SO_DINH_DANH'])),
      chucDanhNorm: normalizeToken(pickValue(row, ['CHUCDANH_NN', 'MA_CDNN', 'CHUC_DANH'])),
      workMode: normalizeToken(pickValue(row, ['THOIGIAN_DK'])),
      maCskcb: toUpper(pickValue(row, ['MA_CSKCB', 'MA_BV'])),
      macchn: toUpper(pickValue(row, ['MACCHN', 'SO_CCHN', 'SO_GPHN'])),
      soGphn: toUpper(pickValue(row, ['SO_GPHN', 'SO_CCHN', 'MACCHN'])),
      practiceFromKey,
      practiceToKey,
      licenseIssueKey,
      licenseExpireKey,
      workRanges,
      workScheduleRaw: lichHanhNgheRaw.join('; '),
      activeStatus: isActiveStatus(pickValue(row, ['TRANG_THAI', 'TRANGTHAI', 'TRANG_THAI_SU_DUNG', 'TINH_TRANG']), true),
    };
    ids.forEach((id) => {
      if (!staffById.has(id)) staffById.set(id, { ...staffEntry, lookupId: id });
    });
    if (staffEntry.macchn && !staffByMacchn.has(staffEntry.macchn)) {
      staffByMacchn.set(staffEntry.macchn, { ...staffEntry, lookupId: staffEntry.macchn });
    }
  });

  const staffIdsByName = new Map();
  (Array.isArray(staff) ? staff : []).forEach((row) => {
    const nameNorm = normalizeText(pickValue(row, ['HO_TEN', 'TEN_BAC_SI', 'TEN_NHAN_SU']));
    if (!nameNorm) return;
    if (!staffIdsByName.has(nameNorm)) staffIdsByName.set(nameNorm, new Set());
    const ids = [
      pickValue(row, ['MACCHN', 'SO_CCHN', 'SO_GPHN']),
      pickValue(row, ['MA_BHXH', 'MA_BAC_SI', 'MA_NV', 'ID']),
      pickValue(row, ['SO_CCCD', 'SO_DINH_DANH']),
    ].map((value) => toUpper(value)).filter(Boolean);
    ids.forEach((id) => staffIdsByName.get(nameNorm).add(id));
  });
  const hydratedServiceEntries = new Set();
  [...servicePractitionerByCode.values(), ...servicePractitionerByName.values()].forEach((entry) => {
    if (!entry || hydratedServiceEntries.has(entry)) return;
    hydratedServiceEntries.add(entry);
    entry.allowedStaffNames.forEach((name) => {
      const ids = staffIdsByName.get(normalizeText(name)) || new Set();
      ids.forEach((id) => entry.allowedStaffIds.add(id));
    });
  });

  const equipmentByPrefix = new Map();
  const equipmentByCode = new Map();
  (Array.isArray(equipment) ? equipment : []).forEach((row) => {
    const maMay = toUpper(pickValue(row, ['MA_MAY', 'KY_HIEU']));
    const kyHieu = toUpper(pickValue(row, ['KY_HIEU']));
    const baseCode = maMay || kyHieu;
    const pf = baseCode.match(/^[A-Z]{1,3}/)?.[0] || baseCode.slice(0, 2);
    if (!pf) return;
    const entry = {
      raw: row,
      maMay: baseCode,
      prefix: pf,
      fromKey: dateToKey(pickValue(row, ['HD_TU', 'TU_NGAY', 'NGAY_HL_TU'])),
      toKey: dateToKey(pickValue(row, ['HD_DEN', 'DEN_NGAY', 'NGAY_HL_DEN'])),
      maCskcb: toUpper(pickValue(row, ['MA_CSKCB', 'MA_BV'])),
      activeStatus: isActiveStatus(pickValue(row, ['TRANG_THAI', 'TRANGTHAI', 'TRANG_THAI_SU_DUNG', 'TINH_TRANG']), true),
    };
    if (!equipmentByPrefix.has(pf)) equipmentByPrefix.set(pf, []);
    equipmentByPrefix.get(pf).push(entry);
    if (baseCode && !equipmentByCode.has(baseCode)) equipmentByCode.set(baseCode, entry);
    if (maMay && !equipmentByCode.has(maMay)) equipmentByCode.set(maMay, entry);
    if (kyHieu && !equipmentByCode.has(kyHieu)) equipmentByCode.set(kyHieu, entry);
  });

  cacheConfig = {
    activeRules,
    dmktByCode,
    internalApprovalByCode,
    op09DmktByCode,
    op09InternalApprovalByCode,
    op09DmktByTenNorm,
    staffById,
    staffByMacchn,
    equipmentByPrefix,
    equipmentByCode,
    servicePractitionerByCode,
    servicePractitionerByName,
    phamviByPrefix,
    indicationByPrefix,
    equipReqByPrefix,
    phamviAllowedByPrefix,
    chucDanhAllowedByPrefix,
    nhomDvktByPrefix,
    indicationRulesByPrefix,
    equipRequiredByPrefix,
    contraCompiled,
  };
  return cacheConfig;
};

const loadTableForSync = async (primaryKey, fallbackKey = '') => {
  const primary = await fetchChunkedData(primaryKey);
  if (Array.isArray(primary) && primary.length > 0) return primary;
  if (!fallbackKey) return getBuiltinRows(primaryKey);
  const fallback = await fetchChunkedData(fallbackKey);
  if (Array.isArray(fallback) && fallback.length > 0) return fallback;
  return getBuiltinRows(primaryKey, fallbackKey);
};

export const dongBoDuLieuRuleEngineLenFirebase = async ({
  uploader = '',
  source = 'manual_sync',
} = {}) => {
  const datasetEntries = await Promise.all(
    DVKT_SYNC_TABLES.map(async (item) => {
      const rows = await loadTableForSync(item.datasetKey, item.fallbackKey);
      return [item.datasetKey, Array.isArray(rows) ? rows : []];
    })
  );
  const datasetMap = Object.fromEntries(datasetEntries);

  const ketQua = await syncDvktTablesToFirebase({
    datasetMap,
    uploader,
    source,
    onlyChanged: true,
  });

  return {
    ...ketQua,
    synced_tables: Object.keys(datasetMap).length,
  };
};

const normalizeBaseStorageKey = (key) => {
  const raw = String(key || '').trim();
  if (!raw) return '';
  if (raw.includes('_CHUNK_')) return raw.slice(0, raw.indexOf('_CHUNK_'));
  if (raw.endsWith('_CHUNKS')) return raw.slice(0, -'_CHUNKS'.length);
  return raw;
};

const getBuiltinRows = (...keys) => {
  for (const key of keys) {
    const baseKey = normalizeBaseStorageKey(key);
    const rows = BUILTIN_ENGINE_TABLES[baseKey];
    if (Array.isArray(rows) && rows.length > 0) return rows;
  }
  return [];
};

const shouldIncludeForFullSync = (key) => {
  if (!key) return false;
  if (FULL_SYNC_SKIP_KEYS.has(key)) return false;
  if (FULL_SYNC_SKIP_PREFIXES.some((prefix) => key.startsWith(prefix))) return false;
  if (FULL_SYNC_EXACT_KEYS.includes(key)) return true;
  return FULL_SYNC_PREFIXES.some((prefix) => key.startsWith(prefix));
};

export const dongBoTatCaDanhMucVaQuyTacLenFirebase = async ({
  uploader = '',
  source = 'helper_full_sync',
  onlyChanged = true,
} = {}) => {
  await Promise.all([
    damBaoSeedLuatPtttMuc11(),
  ]);
  const allKeysAsync = await AsyncStorage.getAllKeys().catch(() => []);
  const allKeysWeb = laMoiTruongWeb() ? Object.keys(window.localStorage || {}) : [];
  const allKeys = Array.from(new Set([...(Array.isArray(allKeysAsync) ? allKeysAsync : []), ...(Array.isArray(allKeysWeb) ? allKeysWeb : [])]));
  const discoveredKeySet = new Set();
  (Array.isArray(allKeys) ? allKeys : []).forEach((key) => {
    const baseKey = normalizeBaseStorageKey(key);
    if (shouldIncludeForFullSync(baseKey)) discoveredKeySet.add(baseKey);
  });

  const datasetMap = {};

  const discoveredEntries = await Promise.all(
    Array.from(discoveredKeySet).sort().map(async (datasetKey) => {
      const rows = await fetchChunkedData(datasetKey);
      return [datasetKey, Array.isArray(rows) ? rows : []];
    })
  );
  discoveredEntries.forEach(([datasetKey, rows]) => {
    if (Array.isArray(rows) && rows.length > 0) datasetMap[datasetKey] = rows;
  });

  const dvktEntries = await Promise.all(
    DVKT_SYNC_TABLES.map(async (item) => {
      const rows = await loadTableForSync(item.datasetKey, item.fallbackKey);
      return [item.datasetKey, Array.isArray(rows) ? rows : []];
    })
  );
  dvktEntries.forEach(([datasetKey, rows]) => {
    if (Array.isArray(rows) && rows.length > 0) datasetMap[datasetKey] = rows;
  });

  const luatDuLieuHardcoded = layDanhSachLuatDuLieuHardcoded();
  if ((!Array.isArray(datasetMap.CDSS_DATA_LUAT_DU_LIEU) || datasetMap.CDSS_DATA_LUAT_DU_LIEU.length === 0)
    && (!Array.isArray(datasetMap.CDSS_DATA_XML_DATA) || datasetMap.CDSS_DATA_XML_DATA.length === 0)
    && Array.isArray(luatDuLieuHardcoded) && luatDuLieuHardcoded.length > 0) {
    datasetMap.CDSS_DATA_LUAT_DU_LIEU = luatDuLieuHardcoded;
    datasetMap.CDSS_DATA_XML_DATA = luatDuLieuHardcoded;
  }

  const luatHanhChinhHardcoded = layDanhSachLuatHanhChinhHardcoded();
  if ((!Array.isArray(datasetMap.CDSS_DATA_LUAT_HANH_CHINH) || datasetMap.CDSS_DATA_LUAT_HANH_CHINH.length === 0)
    && (!Array.isArray(datasetMap.CDSS_DATA_XML1) || datasetMap.CDSS_DATA_XML1.length === 0)
    && Array.isArray(luatHanhChinhHardcoded) && luatHanhChinhHardcoded.length > 0) {
    datasetMap.CDSS_DATA_LUAT_HANH_CHINH = luatHanhChinhHardcoded;
    datasetMap.CDSS_DATA_XML1 = luatHanhChinhHardcoded;
  }

  const luatThuocHardcoded = layDanhSachLuatThuocHardcoded();
  if ((!Array.isArray(datasetMap.CDSS_DATA_LUAT_THUOC) || datasetMap.CDSS_DATA_LUAT_THUOC.length === 0)
    && (!Array.isArray(datasetMap.CDSS_DATA_XML2) || datasetMap.CDSS_DATA_XML2.length === 0)
    && Array.isArray(luatThuocHardcoded) && luatThuocHardcoded.length > 0) {
    datasetMap.CDSS_DATA_LUAT_THUOC = luatThuocHardcoded;
    datasetMap.CDSS_DATA_XML2 = luatThuocHardcoded;
  }

  const luatCdhaHardcoded = tronRuleKhongTrung(
    layDanhSachLuatCdhaHardcoded(),
    layDanhSachLuatGiamDinhChuyenDeHardcoded(),
  );
  if ((!Array.isArray(datasetMap.CDSS_DATA_LUAT_CDHA) || datasetMap.CDSS_DATA_LUAT_CDHA.length === 0)
    && (!Array.isArray(datasetMap.CDSS_DATA_XML3) || datasetMap.CDSS_DATA_XML3.length === 0)
    && Array.isArray(luatCdhaHardcoded) && luatCdhaHardcoded.length > 0) {
    datasetMap.CDSS_DATA_LUAT_CDHA = luatCdhaHardcoded;
    datasetMap.CDSS_DATA_XML3 = luatCdhaHardcoded;
  }

  const luatGiamDinhChuyenDeHardcoded = layDanhSachLuatGiamDinhChuyenDeHardcoded();
  if ((!Array.isArray(datasetMap.CDSS_DATA_LUAT_GIAM_DINH_CHUYEN_DE) || datasetMap.CDSS_DATA_LUAT_GIAM_DINH_CHUYEN_DE.length === 0)
    && (!Array.isArray(datasetMap.CDSS_DATA_GIAM_DINH_CHUYEN_DE) || datasetMap.CDSS_DATA_GIAM_DINH_CHUYEN_DE.length === 0)
    && Array.isArray(luatGiamDinhChuyenDeHardcoded) && luatGiamDinhChuyenDeHardcoded.length > 0) {
    datasetMap.CDSS_DATA_LUAT_GIAM_DINH_CHUYEN_DE = luatGiamDinhChuyenDeHardcoded;
    datasetMap.CDSS_DATA_GIAM_DINH_CHUYEN_DE = luatGiamDinhChuyenDeHardcoded;
  }

  const luatCongKhamHardcoded = layDanhSachLuatCongKhamHardcoded();
  if ((!Array.isArray(datasetMap.CDSS_DATA_LUAT_CONG_KHAM) || datasetMap.CDSS_DATA_LUAT_CONG_KHAM.length === 0)
    && (!Array.isArray(datasetMap.CDSS_DATA_KHAM_BENH) || datasetMap.CDSS_DATA_KHAM_BENH.length === 0)
    && Array.isArray(luatCongKhamHardcoded) && luatCongKhamHardcoded.length > 0) {
    datasetMap.CDSS_DATA_LUAT_CONG_KHAM = luatCongKhamHardcoded;
    datasetMap.CDSS_DATA_KHAM_BENH = luatCongKhamHardcoded;
  }

  const luatNhanSuHardcoded = layDanhSachLuatNhanSuHardcoded();
  if ((!Array.isArray(datasetMap.CDSS_DATA_LUAT_NHAN_SU) || datasetMap.CDSS_DATA_LUAT_NHAN_SU.length === 0)
    && (!Array.isArray(datasetMap.CDSS_DATA_HAU_PHAU) || datasetMap.CDSS_DATA_HAU_PHAU.length === 0)
    && Array.isArray(luatNhanSuHardcoded) && luatNhanSuHardcoded.length > 0) {
    datasetMap.CDSS_DATA_LUAT_NHAN_SU = luatNhanSuHardcoded;
    datasetMap.CDSS_DATA_HAU_PHAU = luatNhanSuHardcoded;
  }

  const luatGiuongHardcoded = layDanhSachLuatGiuongHardcoded();
  if ((!Array.isArray(datasetMap.CDSS_DATA_LUAT_GIUONG) || datasetMap.CDSS_DATA_LUAT_GIUONG.length === 0)
    && (!Array.isArray(datasetMap.CDSS_DATA_NOI_TRU) || datasetMap.CDSS_DATA_NOI_TRU.length === 0)
    && Array.isArray(luatGiuongHardcoded) && luatGiuongHardcoded.length > 0) {
    datasetMap.CDSS_DATA_LUAT_GIUONG = luatGiuongHardcoded;
    datasetMap.CDSS_DATA_NOI_TRU = luatGiuongHardcoded;
  }

  const luatHopDongHardcoded = layDanhSachLuatHopDongHardcoded();
  if ((!Array.isArray(datasetMap.CDSS_DATA_LUAT_HOP_DONG) || datasetMap.CDSS_DATA_LUAT_HOP_DONG.length === 0)
    && (!Array.isArray(datasetMap.CDSS_DATA_XUAT_VIEN) || datasetMap.CDSS_DATA_XUAT_VIEN.length === 0)
    && Array.isArray(luatHopDongHardcoded) && luatHopDongHardcoded.length > 0) {
    datasetMap.CDSS_DATA_LUAT_HOP_DONG = luatHopDongHardcoded;
    datasetMap.CDSS_DATA_XUAT_VIEN = luatHopDongHardcoded;
  }

  const totalDatasets = Object.keys(datasetMap).length;
  if (totalDatasets === 0) {
    return {
      ok: false,
      reason: 'Không tìm thấy dữ liệu danh mục/quy tắc nào trong máy để đồng bộ.',
      uploaded_count: 0,
      total_count: 0,
      synced_tables: 0,
      mode: 'full_catalog_rules_sync',
      details: [],
    };
  }

  const ketQua = await syncDvktTablesToFirebase({
    datasetMap,
    uploader,
    source,
    onlyChanged,
  });

  return {
    ...ketQua,
    synced_tables: totalDatasets,
    mode: 'full_catalog_rules_sync',
  };
};

export const layKhoaDatasetRuleEngineDongBo = () =>
  Array.from(new Set(DVKT_SYNC_TABLES.map((item) => item.datasetKey)));

export const lietKeCanhBaoTruocKhiTaiDvktOp = async () => {
  const details = await Promise.all(
    DVKT_SYNC_TABLES.map(async (item) => {
      const evaluation = await danhGiaTruocKhiTaiDvktDataset(item.datasetKey);
      return {
        dataset_key: item.datasetKey,
        ...evaluation,
      };
    }),
  );
  const warnings = details.filter(
    (d) => d.ok
      && d.policy
      && (d.policy.severity === 'conflict' || d.policy.severity === 'local_unsynced'),
  );
  return {
    ok: true,
    details,
    warnings,
    warning_count: warnings.length,
  };
};

export const taiDuLieuRuleEngineTuFirebase = async (options = {}) => {
  const opts = typeof options === 'object' && options !== null ? options : {};
  const {
    actor_email = '',
    source = 'dvkt_op_pull',
    ghi_audit = false,
  } = opts;

  const details = await Promise.all(
    DVKT_SYNC_TABLES.map(async (item) => {
      const res = await hydrateDvktTableFromFirebase({
        datasetKey: item.datasetKey,
        persistLocal: true,
        localKey: item.datasetKey,
      });
      return {
        dataset_key: item.datasetKey,
        ok: !!res?.ok,
        row_count: Number(res?.row_count || 0),
        reason: res?.reason || '',
        from_cache: !!res?.from_cache,
      };
    })
  );
  const downloaded = details.filter((x) => x.ok).length;

  xoaCacheDvktOpGiamDinh();
  const result = {
    ok: downloaded > 0,
    downloaded_count: downloaded,
    total_count: DVKT_SYNC_TABLES.length,
    details,
  };

  if (ghi_audit && result.ok) {
    await ghiNhatKyAuditConfigSync({
      action: 'pull_dvkt_op_tables',
      actor_email: String(actor_email || ''),
      source: String(source || ''),
      dataset_summary: details.map((d) => ({
        dataset_key: d.dataset_key,
        ok: d.ok,
        row_count: d.row_count,
      })),
    }).catch(() => {});
  }

  return result;
};

const getXml1 = (hoSo) => {
  const raw = hoSo?.XML1 ?? hoSo?.xml1;
  if (Array.isArray(raw)) return raw[0] || {};
  return raw && typeof raw === 'object' ? raw : {};
};

const getXmlRows = (hoSo, key) => {
  const raw = hoSo?.[key] ?? hoSo?.[key.toLowerCase()];
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === 'object') return [raw];
  return [];
};

const extractDvktLines = (hoSo) => {
  const xml3 = getXmlRows(hoSo, 'XML3');
  const normalized = [];

  xml3.forEach((row, index) => {
    // QD130/QD3176: dong DVKT duoc doi chieu tu XML3 (CHI_TIET_DVKT).
    const ma = normalizeDvktCode(pickValue(row, ['MA_DICH_VU', 'MA_DVKT']));
    if (!ma) return;
    normalized.push({
      source: 'XML3',
      index,
      raw: row,
      maTuongDuong: ma,
      prefix: normalizePrefix(ma),
      tenDvkt: String(pickValue(row, ['TEN_DICH_VU', 'TEN_DVKT'])),
      nguoiThucHien: String(pickValue(row, ['NGUOI_THUC_HIEN'])).trim(),
      maNhom: String(pickValue(row, ['MA_NHOM'])).trim(),
      nhomDv: String(pickValue(row, ['NHOM_DV'])),
      maBacSi: toUpper(pickValue(row, ['MA_BAC_SI', 'MA_BS'])),
      maCskcb: toUpper(pickValue(row, ['MA_CSKCB', 'MA_BV'])),
      ngayYl: pickValue(row, ['NGAY_TH_YL', 'NGAY_YL']),
      ngayYlKey: dateToKey(pickValue(row, ['NGAY_TH_YL', 'NGAY_YL'])),
      donGiaClaim: toNumber(pickValue(row, ['DON_GIA_BH', 'DON_GIA', 'DON_GIA_BV'])),
      // XML khong co MA_CHUYEN_KHOA rieng: lay ma chuyen khoa tu 2 ky tu dau MA_DICH_VU.
      maChuyenKhoa: normalizePrefix(ma),
      phanLoaiPttt: String(pickValue(row, ['MA_PTTT', 'PHAN_LOAI_PTTT'])),
      maPtttQt: toUpper(pickValue(row, ['MA_PTTT_QT'])),
      maVatTu: toUpper(pickValue(row, ['MA_VAT_TU'])),
      maMay: toUpper(pickValue(row, ['MA_MAY'])),
      stt: String(pickValue(row, ['STT'])),
      /** QĐ 130 XML3 — mã giường tại khoa (đối chiếu DM Giường & khám BV khi có). */
      maGiuong: normalizeDvktCode(pickValue(row, ['MA_GIUONG'])),
    });
  });

  return normalized;
};

const extractVtytLines = (hoSo) => {
  const xml3 = getXmlRows(hoSo, 'XML3');
  const out = [];

  xml3.forEach((row) => {
    const maVatTu = toUpper(pickValue(row, ['MA_VAT_TU']));
    const tenVatTu = String(pickValue(row, ['TEN_VAT_TU']));
    if (!maVatTu && isEmpty(tenVatTu) && isEmpty(pickValue(row, ['GOI_VTYT']))) return;
    out.push({
      source: 'XML3',
      stt: String(pickValue(row, ['STT'])),
      maTuongDuong: normalizeDvktCode(pickValue(row, ['MA_DICH_VU', 'MA_TUONG_DUONG'])),
      maVatTu,
      tenVatTu,
    });
  });

  return out;
};

const fail = (status, message, field = 'MA_DICH_VU') => ({ status, message, field });
const pass = () => ({ status: 'PASS' });
const resolveLegalBasis = (rule) => {
  const custom = String(pickValue(rule, ['LEGAL_BASIS', 'CAN_CU_PHAP_LY', 'CO_SO_PHAP_LY', 'VAN_BAN']) || '').trim();
  if (custom) {
    const normCustom = normalizeText(custom);
    const normTt12Short = normalizeText(TT_12_BTC_D10_META);
    const normTt12Full = normalizeText(TT_12_BTC_LEGACY_FULL);
    if (normCustom.includes(normTt12Short) || normCustom.includes(normTt12Full)) return custom;
    return `${custom}. ${TT_12_BTC_D10_META}`;
  }
  const base = LEGAL_BASIS_BY_OPERATOR[rule?.OPERATOR] || `${VBHN_17_META}. ${QD_3618_BHXH_META}`;
  return `${base}. ${TT_12_BTC_D10_META}`;
};
const appendLegalBasisIfMissing = (message, legalBasis) => {
  const text = String(message || '').trim();
  if (!legalBasis) return text;
  const normText = normalizeText(text);
  const normBasis = normalizeText(legalBasis);
  if (normText && normBasis && normText.includes(normBasis)) return text;
  return `${text}\nCăn cứ: ${legalBasis}`.trim();
};
const formatStaffDisplay = (staff, fallbackId = '') => {
  const license = toUpper(staff?.macchn || staff?.soGphn || '');
  const name = String(staff?.hoTen || '').trim();
  const fallback = toUpper(fallbackId || staff?.maBhxh || staff?.soCccd || staff?.lookupId || '');
  if (license && name) return `${license} (${name})`;
  if (license) return license;
  if (name) return name;
  return fallback || 'nhân sự';
};
const findServicePractitionerEntry = (line, config) => {
  const maTuongDuong = normalizeDvktCode(line?.maTuongDuong);
  if (maTuongDuong && config?.servicePractitionerByCode?.has(maTuongDuong)) {
    return config.servicePractitionerByCode.get(maTuongDuong);
  }
  const tenDvktNorm = normalizeText(line?.tenDvkt || '');
  if (tenDvktNorm && config?.servicePractitionerByName?.has(tenDvktNorm)) {
    return config.servicePractitionerByName.get(tenDvktNorm);
  }
  return null;
};
const collectActorCandidateIds = (line) => {
  const ids = [];
  const seen = new Set();
  const pushId = (value) => {
    const id = toUpper(value);
    if (!id || seen.has(id)) return;
    seen.add(id);
    ids.push(id);
  };
  pushId(line?.maBacSi);
  parseList(line?.nguoiThucHien).forEach(pushId);
  return ids;
};
/** XML3 MA_BAC_SI / NGUOI_THUC_HIEN đối chiếu cột MACCHN danh mục nhân sự; khớp = tìm thấy. */
const findStaffByActorCode = (config, actorCode) => {
  const id = toUpper(actorCode);
  if (!id || !config) return null;
  const byMacchn = config.staffByMacchn?.get(id);
  if (byMacchn) return byMacchn;
  return config.staffById?.get(id) || null;
};
const resolveStaffEvidence = (line, config) => {
  const maBacSiClaimId = toUpper(line?.maBacSi);
  const nguoiThucHienCandidates = parseList(line?.nguoiThucHien).map((id) => toUpper(id)).filter(Boolean);
  const actorCandidateIds = collectActorCandidateIds(line);
  const servicePractitionerEntry = findServicePractitionerEntry(line, config);
  const preferredActorId = servicePractitionerEntry
    ? actorCandidateIds.find((id) => servicePractitionerEntry.allowedStaffIds.has(id) && findStaffByActorCode(config, id))
    : '';
  const nguoiThucHienId = (
    preferredActorId
    || (
    (maBacSiClaimId && nguoiThucHienCandidates.includes(maBacSiClaimId) && findStaffByActorCode(config, maBacSiClaimId) && maBacSiClaimId)
    || nguoiThucHienCandidates.find((id) => findStaffByActorCode(config, id))
    || ''
    )
  );
  const nguoiThucHienStaff = nguoiThucHienId ? findStaffByActorCode(config, nguoiThucHienId) : null;
  const maBacSiStaff = maBacSiClaimId ? findStaffByActorCode(config, maBacSiClaimId) : null;
  const selectedStaff = nguoiThucHienStaff || maBacSiStaff || null;
  const selectedId = nguoiThucHienStaff
    ? nguoiThucHienId
    : (maBacSiClaimId || nguoiThucHienId);
  const selectedField = nguoiThucHienStaff
    ? 'NGUOI_THUC_HIEN'
    : (maBacSiClaimId ? 'MA_BAC_SI' : 'NGUOI_THUC_HIEN');

  return {
    selectedStaff,
    selectedId,
    selectedField,
    nguoiThucHienId,
    nguoiThucHienStaff,
    maBacSiId: maBacSiClaimId,
    maBacSiStaff,
    actorCandidateIds,
    servicePractitionerEntry,
    sameActorCode: !!(nguoiThucHienCandidates.length === 1 && nguoiThucHienId && maBacSiClaimId && nguoiThucHienId === maBacSiClaimId),
  };
};
const getStaffAllowedTitleCandidates = (staff) => {
  const titles = new Set();
  const title = normalizeToken(staff?.chucDanhNorm);
  if (title) titles.add(title);
  const hasClsTechScope = Array.from(staff?.scopes || []).some((scope) => String(scope || '').startsWith('5'));
  if (title === '10' && hasClsTechScope) titles.add('5');
  return titles;
};
const isTempList3NotPay = (dmRow) => {
  if (!dmRow) return false;
  const token = normalizeToken([
    dmRow.danhMucNorm,
    dmRow.danhMucToken,
    dmRow.dieuKienThanhToanNorm,
    dmRow.ghiChuNorm,
    dmRow.approvalNorm,
  ].join(' '));
  return token.includes('DANHMUC3')
    || token.includes('DANHMUCTAMTHOI')
    || token.includes('TAMTHOICHUATHANHTOAN')
    || (token.includes('DANHMUC3') && token.includes('CHUATHANHTOAN'));
};
const laDongCanLamSangKhongDuDuLieuNguoiThucHien = ({
  line,
  staff,
  evidence,
  allowedScopes,
  allowedTitles,
}) => {
  if (!line || !staff || !evidence) return false;
  if (!PREFIX_KHONG_DU_TIN_CAY_DE_KET_LUAN_NGUOI_THUC_HIEN.has(line.prefix)) return false;
  if (!allowedScopes || allowedScopes.size === 0) return false;
  if (hasIntersectionSet(staff.scopes, allowedScopes)) return false;
  if (evidence.selectedField === 'NGUOI_THUC_HIEN' && evidence.nguoiThucHienStaff && !evidence.sameActorCode) return false;
  const coChoPhepKtv = Array.from(allowedScopes).some((scope) => String(scope || '').startsWith('5'))
    || (allowedTitles && allowedTitles.has('5'));
  if (!(coChoPhepKtv || staff.chucDanhNorm === '1')) return false;
  const thieuBangChungNguoiThucHien = isEmpty(evidence.nguoiThucHienId)
    || !evidence.nguoiThucHienStaff
    || evidence.sameActorCode;
  return thieuBangChungNguoiThucHien;
};
const checkDateFacilityActive = ({ entry, ngayYlKey, maCskcb }) => {
  if (!entry) return false;
  if (entry.activeStatus === false) return false;
  if (entry.maCskcb && maCskcb && entry.maCskcb !== maCskcb) return false;
  if (ngayYlKey) {
    if (entry.fromKey && ngayYlKey < entry.fromKey) return false;
    if (entry.toKey && ngayYlKey > entry.toKey) return false;
  }
  return true;
};

const checkIcdIndication = ({ rule, line, claim, config }) => {
  const mappings = config.indicationRulesByPrefix.get(line.prefix) || [];
  if (mappings.length === 0) return pass();
  for (const item of mappings) {
    if (item.hasAll) return pass();
    if (hasIntersectionSet(claim.icdCodes, item.codes)) return pass();
  }
  return fail('WARNING', `${rule.ALERT_MESSAGE} Prefix ${line.prefix}, ICD hiện tại không khớp danh mục.`);
};

const checkIcdContraindication = ({ rule, line, claim, config }) => {
  const tenDvktNorm = normalizeText(line.tenDvkt || line.maTuongDuong);
  for (const row of config.contraCompiled) {
    if (row.prefix && row.prefix !== line.prefix) continue;
    if (row.dvktTypeNorm && !tenDvktNorm.includes(row.dvktTypeNorm)) continue;
    if (row.icdCodes.size === 0) continue;
    if (hasIntersectionSet(claim.icdCodes, row.icdCodes)) {
      return fail(row.severity, `${rule.ALERT_MESSAGE} Match ch?ng ch? ??nh: ${row.dvktTypeNorm || 'N/A'}.`);
    }
  }
  return pass();
};

/** DVKT giường bệnh: không bắt buộc đối chiếu phạm vi hành nghề (bác sĩ / điều dưỡng). */
const laDichVuGiuongMienPhamViHanhNghe = (line, config) => {
  if (!line) return false;
  const tenNorm = normalizeText(line.tenDvkt || '');
  if (tenNorm.includes('GIUONG')) return true;
  const dmRow = config?.dmktByCode?.get(line.maTuongDuong);
  const effectivePrefix = line.maChuyenKhoa || line.prefix || dmRow?.maChuyenKhoa;
  const nhomDvkt = normalizeText(config?.nhomDvktByPrefix?.get(effectivePrefix) || '');
  if (nhomDvkt.includes('GIUONG')) return true;
  const mn = String(line.maNhom || '').trim().replace(/^0+(?=\d)/, '');
  if (mn === OP09_XML3_MA_NHOM_GIUONG) return true;
  const maDvNorm = normalizeText(line.maTuongDuong || '');
  if (maDvNorm.includes('GIUONG')) return true;
  if (!isEmpty(line.maGiuong)) return true;
  if (/^K\d+\./i.test(String(line.maTuongDuong || ''))) return true;
  return false;
};

const checkPhamVi = ({ rule, line, config }) => {
  if (config.staffById.size === 0) return pass();
  if (laDichVuGiuongMienPhamViHanhNghe(line, config)) return pass();

  const evidence = resolveStaffEvidence(line, config);
  const nguoiThucHienCandidates = parseList(line?.nguoiThucHien).map((id) => toUpper(id)).filter(Boolean);
  // MA_BAC_SI: không bắt buộc đúng phạm vi hành nghề — chỉ kiểm tra khi có NGUOI_THUC_HIEN.
  if (nguoiThucHienCandidates.length === 0) return pass();

  const staffId = evidence.nguoiThucHienId;
  if (isEmpty(staffId)) {
    return fail(
      'WARNING',
      `${rule.ALERT_MESSAGE} Thiếu NGUOI_THUC_HIEN hợp lệ trong danh mục nhân sự để đối chiếu phạm vi hành nghề.`,
      'NGUOI_THUC_HIEN',
    );
  }
  const staff = evidence.nguoiThucHienStaff || findStaffByActorCode(config, staffId);
  const nhanSuText = formatStaffDisplay(staff, staffId);
  if (!staff) {
    return fail(
      'WARNING',
      `${rule.ALERT_MESSAGE} Không tìm thấy nhân viên ${nhanSuText} (NGUOI_THUC_HIEN) trong danh mục để kết luận.`,
      'NGUOI_THUC_HIEN',
    );
  }
  if (staff.activeStatus === false) {
    return fail(
      'REJECT',
      `${rule.ALERT_MESSAGE} Nhân viên ${nhanSuText} (NGUOI_THUC_HIEN) đang ở trạng thái không hoạt động.`,
      'NGUOI_THUC_HIEN',
    );
  }

  const dmRow = config.dmktByCode.get(line.maTuongDuong);
  // Ưu tiên: (1) 2 ký tự đầu MA_DICH_VU từ dòng hồ sơ (áp dụng cả công khám) → (2) prefix dòng DVKT → (3) mapping danh mục.
  const effectivePrefix = line.maChuyenKhoa || line.prefix || dmRow?.maChuyenKhoa;
  const allowedScopes = evidence.servicePractitionerEntry?.requiredScopes?.size
    ? evidence.servicePractitionerEntry.requiredScopes
    : (dmRow?.phamviNeeded?.size
    ? dmRow.phamviNeeded
    : (config.phamviAllowedByPrefix.get(effectivePrefix) || new Set()));
  const allowedTitles = config.chucDanhAllowedByPrefix.get(effectivePrefix) || new Set();
  const nhomDvkt = config.nhomDvktByPrefix.get(effectivePrefix) || `prefix ${effectivePrefix}`;
  if (laDongCanLamSangKhongDuDuLieuNguoiThucHien({
    line,
    staff,
    evidence,
    allowedScopes,
    allowedTitles,
  })) return pass();

  const titleCandidates = getStaffAllowedTitleCandidates(staff);
  if (allowedTitles.size > 0 && titleCandidates.size === 0) {
    return fail('WARNING', `${rule.ALERT_MESSAGE} Danh mục nhân sự của ${nhanSuText} (NGUOI_THUC_HIEN) thiếu CHUCDANH_NN để đối chiếu nhóm DVKT ${nhomDvkt}.`, 'CHUCDANH_NN');
  }
  if (allowedTitles.size > 0 && !hasIntersectionSet(titleCandidates, allowedTitles)) {
    return fail(
      'REJECT',
      `${rule.ALERT_MESSAGE} ${nhanSuText} (NGUOI_THUC_HIEN) có CHUCDANH_NN=${staff.chucDanhNorm}, không thuộc nhóm được phép [${Array.from(allowedTitles).join(', ')}] cho DVKT ${nhomDvkt}.`,
      'CHUCDANH_NN',
    );
  }

  if (coVanBanChoPhepDvkt(staff, line.maTuongDuong)) return pass();

  // CV 3231/BYT-KCB §1.2–§1.3: BS/Y sỹ được khám bệnh & thanh toán công khám.
  if (laDongCongKhamXml3(line, config.dmKhamSet) && laBacSiHoacYSy(staff)) return pass();

  const scopesHieuLuc = moRongPhamViNhanSuCv3231(staff);

  if (!allowedScopes || allowedScopes.size === 0) return pass();
  if (!scopesHieuLuc || scopesHieuLuc.size === 0) {
    return fail('WARNING', `${rule.ALERT_MESSAGE} Danh mục nhân sự của ${nhanSuText} (NGUOI_THUC_HIEN) thiếu PHAMVI_CM/PHAMVI_CMBS để đối chiếu DVKT ${nhomDvkt}.`, 'PHAMVI_CM');
  }
  if (hasIntersectionSet(scopesHieuLuc, allowedScopes)) return pass();
  return fail(
    'REJECT',
    `${rule.ALERT_MESSAGE} ${nhanSuText} (NGUOI_THUC_HIEN) không có phạm vi hành nghề phù hợp cho DVKT ${nhomDvkt}; yêu cầu [${Array.from(allowedScopes).join(', ')}].`,
    'PHAMVI_CM',
  );
};

const checkEquipment = ({ rule, line, claim, config }) => {
  const requiredPrefixes = config.equipRequiredByPrefix.get(line.prefix);
  const maMayRow = toUpper(line.maMay);
  const maCskcb = line.maCskcb || claim.maCskcb || '';
  const hasEquipmentCatalog = config.equipmentByCode.size > 0 || config.equipmentByPrefix.size > 0;
  if (!hasEquipmentCatalog) return pass();

  if (maMayRow) {
    const exact = config.equipmentByCode.get(maMayRow);
    if (!exact) {
      if (requiredPrefixes && requiredPrefixes.size > 0) {
        return fail('REJECT', `${rule.ALERT_MESSAGE} MA_MAY [${maMayRow}] không tồn tại trong danh mục trang thiết bị.`, 'MA_MAY');
      }
      return fail('WARNING', `${rule.ALERT_MESSAGE} MA_MAY [${maMayRow}] không tồn tại trong danh mục để đối chiếu.`, 'MA_MAY');
    }
    if (!checkDateFacilityActive({ entry: exact, ngayYlKey: line.ngayYlKey, maCskcb })) {
      return fail('REJECT', `${rule.ALERT_MESSAGE} MA_MAY [${maMayRow}] không còn hiệu lực/không đúng cơ sở KCB tại thời điểm thực hiện.`, 'MA_MAY');
    }
    if (requiredPrefixes && requiredPrefixes.size > 0 && !requiredPrefixes.has(exact.prefix)) {
      return fail('REJECT', `${rule.ALERT_MESSAGE} MA_MAY [${maMayRow}] không thuộc nhóm máy bắt buộc cho prefix DVKT ${line.prefix}.`, 'MA_MAY');
    }
    return pass();
  }

  if (!requiredPrefixes || requiredPrefixes.size === 0) return pass();
  for (const requiredPrefix of requiredPrefixes) {
    const equipRows = config.equipmentByPrefix.get(requiredPrefix) || [];
    const valid = equipRows.some((e) => checkDateFacilityActive({ entry: e, ngayYlKey: line.ngayYlKey, maCskcb }));
    if (!valid) {
      return fail('REJECT', `${rule.ALERT_MESSAGE} Thiếu hoặc thiết bị hết hạn cho prefix máy ${requiredPrefix}.`, 'MA_MAY');
    }
  }
  return pass();
};

/**
 * DVKT-OP-09: chỉ đối chiếu DM Giường & khám BV khi tên hoặc mã dịch vụ gợi nhận **giường** hoặc **khám**
 * (sau chuẩn hóa không dấu), hoặc có MA_GIUONG / mã dạng giường BV mới (K…).
 * Tránh so với danh mục nội viện khi dòng không mang tín hiệu đó (dù MA_NHOM có thể trùng nhóm phí).
 */
const hasTenHoacMaLienQuanGiuongKhamNoiDm = (line) => {
  const tenNorm = normalizeText(line?.tenDvkt || '');
  if (tenNorm.includes('GIUONG') || tenNorm.includes('KHAM')) return true;
  const maDv = String(line?.maTuongDuong || '').trim();
  if (/^K\d+\./i.test(maDv)) return true;
  const maG = String(line?.maGiuong || '').trim();
  if (maG) return true;
  const maDvNorm = normalizeText(maDv);
  if (maDvNorm.includes('GIUONG') || maDvNorm.includes('KHAM')) return true;
  const maGNorm = normalizeText(maG);
  if (maGNorm.includes('GIUONG') || maGNorm.includes('KHAM')) return true;
  return false;
};

/**
 * DVKT-OP-09: chỉ phí Khám (MA_NHOM=1) hoặc phí Giường (MA_NHOM=15); phải có dữ liệu để đối chiếu mã khám / mã giường.
 * — Khám: bắt buộc có MA_DICH_VU (mã khám).
 * — Giường: có MA_GIUONG hoặc MA_DICH_VU dạng mã giường BV mới (K…).
 * — MA_NHOM trống: chỉ khi MA_DICH_VU dạng K… (mã giường theo bảng BV).
 */
const isXml3HuongUngDvktOp09 = (line) => {
  const mnRaw = String(line?.maNhom || '').trim();
  const mn = mnRaw.replace(/^0+(?=\d)/, '');
  const maDv = String(line?.maTuongDuong || '').trim();
  const kieuMaGiuongBv = /^K\d+\./i.test(maDv);
  if (mn === OP09_XML3_MA_NHOM_KHAM) {
    return !isEmpty(line.maTuongDuong);
  }
  if (mn === OP09_XML3_MA_NHOM_GIUONG) {
    return kieuMaGiuongBv || !isEmpty(line.maGiuong);
  }
  if (mnRaw !== '') return false;
  return kieuMaGiuongBv;
};

const checkInternalApproval = ({ rule, line, claim, config }) => {
  if (!isXml3HuongUngDvktOp09(line)) return pass();
  if (!hasTenHoacMaLienQuanGiuongKhamNoiDm(line)) return pass();
  const dmMap = config.op09DmktByCode;
  const apMap = config.op09InternalApprovalByCode;
  if (!dmMap || (dmMap.size === 0 && (!apMap || apMap.size === 0))) return pass();
  const maDv = line.maTuongDuong;
  const maG = String(line.maGiuong || '').trim();
  const maGNorm = maG ? normalizeDvktCode(maG) : '';
  const tenNormLine = normalizeText(line.tenDvkt || '');

  let dmRow = dmMap.get(maDv) || (maGNorm ? dmMap.get(maGNorm) : undefined);
  if (!dmRow && config.op09DmktByTenNorm && tenNormLine.length >= 6) {
    dmRow = config.op09DmktByTenNorm.get(tenNormLine);
  }
  if (!dmRow && config.op09DmktByTenNorm && tenNormLine.length >= 10) {
    for (const [catNorm, ent] of config.op09DmktByTenNorm) {
      if (catNorm.length < 10) continue;
      if (tenNormLine.includes(catNorm) || catNorm.includes(tenNormLine)) {
        dmRow = ent;
        break;
      }
    }
  }
  if (!dmRow) {
    const chiTiet = maG
      ? `Mã dịch vụ [${maDv || '—'}]; mã giường [${maG}]`
      : `Mã dịch vụ [${maDv || '—'}]`;
    return fail(
      'WARNING',
      `${rule.ALERT_MESSAGE} ${chiTiet} chưa có trong danh mục Giường & khám (nội bộ) để đối chiếu.`,
      'MA_DICH_VU'
    );
  }

  const canonicalMa = normalizeDvktCode(dmRow.canonicalMa || pickValue(dmRow.raw, ['MA_TUONG_DUONG', 'MA_DICH_VU']) || maDv);
  let approvalRow = apMap.get(maDv) || (maGNorm ? apMap.get(maGNorm) : undefined);
  if (!approvalRow && canonicalMa) approvalRow = apMap.get(canonicalMa);
  if (!approvalRow) {
    return fail(
      'WARNING',
      `${rule.ALERT_MESSAGE} Có ghép được dòng danh mục nhưng thiếu bản ghi phê duyệt nội bộ (MA_TUONG_DUONG [${canonicalMa || '—'}]).`,
      'MA_DICH_VU'
    );
  }
  if (!approvalRow.approvalActive) {
    return fail('REJECT', `${rule.ALERT_MESSAGE} DVKT [${line.maTuongDuong}] thuộc Danh mục 3/tạm thời chưa thanh toán BHYT.`, 'MA_DICH_VU');
  }

  if (approvalRow.maCskcb && claim.maCskcb && approvalRow.maCskcb !== claim.maCskcb) {
    return fail('REJECT', `${rule.ALERT_MESSAGE} DVKT [${line.maTuongDuong}] không thuộc danh mục phê duyệt của cơ sở ${claim.maCskcb}.`, 'MA_CSKCB');
  }

  if (line.ngayYlKey) {
    if (approvalRow.tuNgayKey && line.ngayYlKey < approvalRow.tuNgayKey) {
      return fail('REJECT', `${rule.ALERT_MESSAGE} DVKT [${line.maTuongDuong}] chưa đến ngày hiệu lực phê duyệt nội bộ.`, 'NGAY_YL');
    }
    if (approvalRow.denNgayKey && line.ngayYlKey > approvalRow.denNgayKey) {
      return fail('REJECT', `${rule.ALERT_MESSAGE} DVKT [${line.maTuongDuong}] đã hết hiệu lực phê duyệt nội bộ.`, 'NGAY_YL');
    }
  }
  return pass();
};

const checkStaffPracticeTime = ({ rule, line, claim, config }) => {
  if (config.staffById.size === 0) return pass();
  const evidence = resolveStaffEvidence(line, config);
  const staffId = evidence.selectedId || line.maBacSi;
  if (isEmpty(staffId)) return fail('WARNING', `${rule.ALERT_MESSAGE} Thiếu MA_BAC_SI để đối chiếu thời gian hành nghề.`, 'MA_BAC_SI');
  const staff = evidence.selectedStaff || findStaffByActorCode(config, staffId);
  const nhanSuText = formatStaffDisplay(staff, staffId);
  if (!staff) return fail('WARNING', `${rule.ALERT_MESSAGE} Không tìm thấy nhân viên ${nhanSuText} trong danh mục để đối chiếu.`, 'MA_BAC_SI');
  if (staff.activeStatus === false) return fail('REJECT', `${rule.ALERT_MESSAGE} Nhân viên ${nhanSuText} đang ở trạng thái không hoạt động.`, 'MA_BAC_SI');
  if (!staff.macchn) return fail('WARNING', `${rule.ALERT_MESSAGE} Nhân viên ${nhanSuText} thiếu MACCHN/GPHN trong danh mục.`, 'MACCHN');

  const dmRow = config.dmktByCode.get(line.maTuongDuong);
  const allowedScopes = evidence.servicePractitionerEntry?.requiredScopes?.size
    ? evidence.servicePractitionerEntry.requiredScopes
    : (dmRow?.phamviNeeded?.size
    ? dmRow.phamviNeeded
    : (config.phamviAllowedByPrefix.get(line.prefix) || new Set()));
  const allowedTitles = config.chucDanhAllowedByPrefix.get(line.prefix) || new Set();
  if (laDongCanLamSangKhongDuDuLieuNguoiThucHien({
    line,
    staff,
    evidence,
    allowedScopes,
    allowedTitles,
  })) return pass();

  if (staff.maCskcb && claim.maCskcb && staff.maCskcb !== claim.maCskcb) {
    return fail('REJECT', `${rule.ALERT_MESSAGE} Nhân viên ${nhanSuText} không thuộc cơ sở KCB ${claim.maCskcb}.`, 'MA_CSKCB');
  }

  if (line.ngayYlKey) {
    if (staff.practiceFromKey && line.ngayYlKey < staff.practiceFromKey) {
      return fail('REJECT', `${rule.ALERT_MESSAGE} Thời điểm thực hiện sớm hơn thời điểm được phép hành nghề của ${nhanSuText}.`, 'NGAY_YL');
    }
    if (staff.practiceToKey && line.ngayYlKey > staff.practiceToKey) {
      return fail('REJECT', `${rule.ALERT_MESSAGE} Thời điểm thực hiện sau thời điểm kết thúc hành nghề của ${nhanSuText}.`, 'NGAY_YL');
    }
    if (staff.licenseIssueKey && line.ngayYlKey < staff.licenseIssueKey) {
      return fail('REJECT', `${rule.ALERT_MESSAGE} Thời điểm DVKT trước ngày cấp CCHN/GPHN của ${nhanSuText}.`, 'NGAY_YL');
    }
    if (staff.licenseExpireKey && line.ngayYlKey > staff.licenseExpireKey) {
      return fail('REJECT', `${rule.ALERT_MESSAGE} CCHN/GPHN của ${nhanSuText} đã hết hạn tại thời điểm thực hiện DVKT.`, 'NGAY_YL');
    }
  }

  const hhmm = dateKeyToHHMM(line.ngayYlKey);
  const canRangBuocKhungGio = staff.workMode === '2';
  if (canRangBuocKhungGio && staff.workRanges && staff.workRanges.length > 0 && hhmm !== null && !isWithinRanges(hhmm, staff.workRanges)) {
    return fail('WARNING', `${rule.ALERT_MESSAGE} DVKT nằm ngoài khung giờ hành nghề đăng ký của ${nhanSuText}.`, 'THOIGIAN_DK');
  }

  return pass();
};

const checkTempList3 = ({ rule, line, config }) => {
  const dmRow = config.dmktByCode.get(line.maTuongDuong);
  if (!dmRow) return pass();
  if (isTempList3NotPay(dmRow)) {
    return fail('REJECT', `${rule.ALERT_MESSAGE} DVKT [${line.maTuongDuong}] thuộc Danh mục 3/tạm thời chưa thanh toán BHYT.`, 'MA_DICH_VU');
  }
  return pass();
};

const checkPrice = ({ rule, line, config }) => {
  const dmRow = config.dmktByCode.get(line.maTuongDuong);
  if (!dmRow) return pass();
  if (dmRow.donGia <= 0) return pass();
  if (line.donGiaClaim > dmRow.donGia) {
    return fail('REJECT', `${rule.ALERT_MESSAGE} Đơn giá HS=${line.donGiaClaim} > giá BHYT=${dmRow.donGia}.`, 'DON_GIA');
  }
  return pass();
};

const checkValidity = ({ rule, line, config }) => {
  const dmRow = config.dmktByCode.get(line.maTuongDuong);
  if (!dmRow) return pass();
  if (!line.ngayYlKey) return pass();
  if (dmRow.tuNgayKey && line.ngayYlKey < dmRow.tuNgayKey) {
    return fail('REJECT', `${rule.ALERT_MESSAGE} NGAY_YL truoc TU_NGAY hieu luc DVKT.`, 'NGAY_YL');
  }
  if (dmRow.denNgayKey && line.ngayYlKey > dmRow.denNgayKey) {
    return fail('REJECT', `${rule.ALERT_MESSAGE} NGAY_YL sau DEN_NGAY hieu luc DVKT.`, 'NGAY_YL');
  }
  return pass();
};

const isLikelyPtttLine = (line, dmRow) => {
  const tenDvNorm = normalizeToken(line.tenDvkt || '');
  const nhomDvNorm = normalizeToken(line.nhomDv || '');
  const masterLevelNorm = dmRow ? dmRow.phanLoaiPtttNorm : '';
  if (masterLevelNorm) return true;
  if (line.maPtttQt) return true;
  if (line.maNhom === '4' || line.maNhom === '5') return true;
  if (line.prefix === '43' || line.prefix === '44') return true;
  if (nhomDvNorm.includes('PTTT') || nhomDvNorm.includes('PHAUTHUAT') || nhomDvNorm.includes('THUTHUAT')) return true;
  if (
    tenDvNorm.includes('PHAUTHUAT')
    || tenDvNorm.includes('THUTHUAT')
    || tenDvNorm.includes('TIEUPHAU')
    || tenDvNorm.includes('CANTHIEP')
    || tenDvNorm.includes('NOISOI')
  ) {
    return true;
  }
  return false;
};

const checkPtttLevel = ({ rule, line, claim, config }) => {
  const messages = [];
  let worst = 'PASS';
  const setWorst = (s) => {
    if (s === 'REJECT') worst = 'REJECT';
    else if (s === 'WARNING' && worst === 'PASS') worst = 'WARNING';
  };

  const dmRow = config.dmktByCode.get(line.maTuongDuong);
  if (!isLikelyPtttLine(line, dmRow)) return pass();
  const claimLevelRaw = String(line.phanLoaiPttt || '').trim();
  const claimLevelNum = Number(claimLevelRaw);
  const claimLevelNorm = normalizeToken(claimLevelRaw);
  const masterLevelNorm = dmRow ? dmRow.phanLoaiPtttNorm : '';

  if (claimLevelNorm && masterLevelNorm && claimLevelNorm !== masterLevelNorm) {
    messages.push('Phân loại PTTT khai báo không khớp danh mục master.');
    setWorst('WARNING');
  }

  const maLoaiKcb = String(pickValue(claim.xml1, ['MA_LOAI_KCB'])).trim();
  if ((maLoaiKcb === '1' || maLoaiKcb === '2') && Number.isFinite(claimLevelNum) && claimLevelNum > 0 && claimLevelNum < 3) {
    messages.push('Ngoại trú/ban ngày không được khai PTTT cấp < 3.');
    setWorst('REJECT');
  }

  if (['DB', '1', '2'].includes(claimLevelNorm)) {
    const staff = config.staffById.get(line.maBacSi);
    const chucDanh = staff?.chucDanhNorm || '';
    if (chucDanh !== '1') {
      messages.push('PTTT DB/1/2 yêu cầu CHUCDANH_NN = 1 (Bác sỹ).');
      setWorst('REJECT');
    }
  }

  if (worst === 'PASS') return pass();
  return fail(worst, `${rule.ALERT_MESSAGE} ${messages.join(' ')}`, 'PHAN_LOAI_PTTT');
};

const checkGhiChu = ({ rule, line, claim, config }) => {
  const dmRow = config.dmktByCode.get(line.maTuongDuong);
  if (!dmRow) return pass();
  const allowVatTu = dmRow.ghiChuNorm.includes('CHUA BAO GOM');

  const hasInlineVatTu = !isEmpty(line.maVatTu);
  const hasLinkedVatTu = (!isEmpty(line.stt) && claim.vtytByStt.has(line.stt))
    || (!isEmpty(line.maTuongDuong) && claim.vtytByMaTuongDuong.has(line.maTuongDuong));
  const hasVatTu = hasInlineVatTu || hasLinkedVatTu;

  if (!allowVatTu && hasVatTu) {
    return fail('REJECT', `${rule.ALERT_MESSAGE} DVKT đã bao gồm vật tư nhưng hồ sơ vẫn tách VTYT.`, 'MA_VAT_TU');
  }
  return pass();
};

const checkCatalogNameMatch = ({ rule, line, config }) => {
  const dmRow = config.dmktByCode.get(line.maTuongDuong);
  if (!dmRow) return pass();
  const tenHoSoNorm = normalizeText(line.tenDvkt || '');
  const tenDanhMucNorm = normalizeText(dmRow.tenDvktNorm || dmRow.tenDvkt || '');
  if (!tenHoSoNorm || !tenDanhMucNorm) return pass();
  if (tenHoSoNorm.includes(tenDanhMucNorm) || tenDanhMucNorm.includes(tenHoSoNorm)) return pass();
  return fail(
    'WARNING',
    `${rule.ALERT_MESSAGE} MA_DICH_VU [${line.maTuongDuong}] khai báo "${line.tenDvkt || 'N/A'}" khác danh mục "${dmRow.tenDvkt || 'N/A'}".`,
    'TEN_DICH_VU'
  );
};

const checkCatalogPriceConfig = ({ rule, line, config }) => {
  const dmRow = config.dmktByCode.get(line.maTuongDuong);
  if (!dmRow) return pass();
  if (Number(dmRow.donGia) > 0) return pass();
  return fail('WARNING', `${rule.ALERT_MESSAGE} MA_DICH_VU [${line.maTuongDuong}] chưa có đơn giá > 0 trong danh mục.`, 'DON_GIA');
};

const checkCatalogDecision = ({ rule, line, config }) => {
  const dmRow = config.dmktByCode.get(line.maTuongDuong);
  if (!dmRow) return pass();
  if (!isEmpty(dmRow.quyetDinh)) return pass();
  return fail('WARNING', `${rule.ALERT_MESSAGE} MA_DICH_VU [${line.maTuongDuong}] thiếu trường QUYET_DINH trong danh mục M05.`, 'QUYET_DINH');
};

/** Định dạng cũ tiền giường: K + hậu tố số.chỉ số 4 chữ số (vd. K27.1939) — không còn dùng; mặc định rule OFF. */
const checkLegacyBedServiceFormat = ({ rule, line }) => {
  if (String(line?.maNhom || '').trim() !== '15') return pass();
  const ma = String(line?.maTuongDuong || '').trim();
  if (!ma) return pass();
  if (/^K\d+\.\d{4}$/.test(ma)) {
    return fail('WARNING', `${rule.ALERT_MESSAGE} MA_DICH_VU [${ma}]`, 'MA_DICH_VU');
  }
  return pass();
};

const OPERATOR_HANDLERS = {
  CHECK_ICD_INDICATION: checkIcdIndication,
  CHECK_ICD_CONTRAINDICATION: checkIcdContraindication,
  CHECK_PHAMVI: checkPhamVi,
  CHECK_EQUIPMENT: checkEquipment,
  CHECK_INTERNAL_APPROVAL: checkInternalApproval,
  CHECK_STAFF_PRACTICE_TIME: checkStaffPracticeTime,
  CHECK_TEMP_LIST3: checkTempList3,
  CHECK_PRICE: checkPrice,
  CHECK_VALIDITY: checkValidity,
  CHECK_PTTT_LEVEL: checkPtttLevel,
  CHECK_GHICHU: checkGhiChu,
  CHECK_CATALOG_NAME_MATCH: checkCatalogNameMatch,
  CHECK_CATALOG_PRICE_CONFIG: checkCatalogPriceConfig,
  CHECK_CATALOG_DECISION: checkCatalogDecision,
  CHECK_LEGACY_BED_SERVICE_FORMAT: checkLegacyBedServiceFormat,
};

const evaluateRule = ({ rule, line, claim, config }) => {
  const fn = rule?._handler || OPERATOR_HANDLERS[rule.OPERATOR];
  if (!fn) return pass();
  try {
    return fn({ rule, line, claim, config });
  } catch (e) {
    return fail('WARNING', `L?i x? l? rule ${rule.RULE_CODE || 'N/A'}: ${e?.message || e}`);
  }
};

const luuClaimResults = async (summary, details) => {
  try {
    const current = await fetchChunkedData(DVKT_ENGINE_STORAGE_KEYS.CLAIM_RESULTS);
    const next = Array.isArray(current) ? current.slice(-1999) : [];
    const record = {
      ...summary,
      details,
      created_at: new Date().toISOString(),
    };
    next.push(record);
    await AsyncStorage.setItem(DVKT_ENGINE_STORAGE_KEYS.CLAIM_RESULTS, JSON.stringify(next));
    setStorageCache(DVKT_ENGINE_STORAGE_KEYS.CLAIM_RESULTS, next);

    // ??ng b? cloud theo c? ch? fire-and-forget ?? kh?ng ch?n lu?ng ki?m tra.
    taiKetQuaGiamDinhLenFirebase(record).catch(() => {});
  } catch {
    // silent
  }
};

export const verifyClaimDvktOp = async (hoSo) => {
  const config = await buildEngineConfig();
  const xml1 = getXml1(hoSo);
  const dvktLines = extractDvktLines(hoSo);
  const vtytLines = extractVtytLines(hoSo);
  const claimId = String(pickValue(xml1, ['MA_LK', 'MAHOSO'])).trim();
  const vtytByStt = new Set(vtytLines.map((v) => String(v.stt || '').trim()).filter(Boolean));
  const vtytByMaTuongDuong = new Set(vtytLines.map((v) => toUpper(v.maTuongDuong)).filter(Boolean));
  const claim = {
    id: claimId,
    xml1,
    maCskcb: toUpper(pickValue(xml1, ['MA_CSKCB', 'MACSKCB', 'MA_BV'])),
    icdCodes: collectIcdCodes(xml1),
    vtytLines,
    vtytByStt,
    vtytByMaTuongDuong,
  };

  const details = [];
  let evaluated = 0;

  for (const line of dvktLines) {
    for (const rule of config.activeRules) {
      const outcome = evaluateRule({ rule, line, claim, config });
      evaluated += 1;
      if (evaluated % ENGINE_YIELD_EVERY === 0) {
        // Nh??ng event-loop ?? UI kh?ng b? gi?t khi x? l? h? s? l?n.
        await yieldToMainThread();
      }
      if (outcome.status === 'PASS') continue;
      const ruleResult = normalizeResult(outcome.status, rule?._severity || normalizeResult(rule.SEVERITY));
      const legalBasis = rule?._legal_basis || resolveLegalBasis(rule);
      const alertRaw = outcome.message || rule.ALERT_MESSAGE || 'Vi pham quy tac DVKT';
      const alertWithLegal = appendLegalBasisIfMissing(alertRaw, legalBasis);

      details.push({
        claim_id: claimId,
        ma_tuong_duong: line.maTuongDuong,
        rule_code: rule.RULE_CODE || 'DVKT-RULE',
        rule_name: rule.RULE_NAME || rule.RULE_CODE || 'Rule DVKT',
        operator: rule.OPERATOR,
        result: ruleResult,
        severity: ruleResult,
        alert_message: alertWithLegal,
        legal_basis: legalBasis,
        source_xml: line.source,
        line_index: line.index,
        field: outcome.field || 'MA_DICH_VU',
        muc_do: toMucDo(ruleResult, rule.SEVERITY),
      });
    }
  }

  const detailsAfterDedupe = locTrungKetQuaTheoYNgia(details);
  const affectedLines = new Set(detailsAfterDedupe.map((d) => `${d.source_xml}:${d.line_index}`));
  const warnings = detailsAfterDedupe.filter((d) => d.result === 'WARNING').length;
  const rejects = detailsAfterDedupe.filter((d) => d.result === 'REJECT').length;

  const summary = {
    claim_id: claimId,
    total_lines: dvktLines.length,
    pass: Math.max(0, dvktLines.length - affectedLines.size),
    warnings,
    rejects,
    details: detailsAfterDedupe,
  };

  await luuClaimResults(summary, detailsAfterDedupe);
  return summary;
};

export const chayGiamDinhDvktOp = async (hoSo) => {
  const result = await verifyClaimDvktOp(hoSo);
  return result.details.map((d) => ({
    phan_he: d.source_xml,
    index: d.line_index,
    truong_loi: d.field,
    canh_bao: d.alert_message,
    muc_do: d.muc_do,
    ma_luat: d.rule_code,
    ten_quy_tac: d.rule_name,
    dieu_kien: d.operator,
    co_so_phap_ly: d.legal_basis || '',
  }));
};
