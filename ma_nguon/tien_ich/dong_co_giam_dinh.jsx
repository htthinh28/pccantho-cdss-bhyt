/**
 * ============================================================================
 * AUDITING ENGINE V15.0 - BỘ MÁY KIỂM TRA TOÀN DIỆN BHYT
 * KIẾN TRÚC 5 LỚP: HÀNH CHÍNH -> DANH MỤC BV -> DANH MỤC BYT -> LÂM SÀNG -> LUẬT ĐỘNG
 * ============================================================================
 * V15 Enhancements:
 * - [LAYER 0] Bộ lọc dương tính giả: loại trừ khoản không thuộc BHYT
 * - [LAYER 1] Kiểm tra hành chính XML1: HC-01 đến HC-10
 * - [LAYER 2] Đối soát Danh mục Bệnh viện 2 giai đoạn (BV -> BYT)
 * - [LAYER 3] Kiểm tra giá trúng thầu, số lượng hợp lý
 * - [LAYER 4] Kiểm tra lâm sàng: thuốc, CDHA, giường, PTTT, chuyển tuyến, tổng chi
 * - [LAYER 5] Luật động theo tab + DVKT-OP (`dvkt_op_giam_dinh.jsx` — toán tử cố định trong mã)
 * - Lọc trùng lặp + sắp xếp theo mức độ cuối pipeline
 * ============================================================================
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { chuanHoaMaIcdPhacDoCdss } from '../chuyen_mon/phac_do_benh_vien/phac_do_cdss_columns';
import { chuanHoaBangTuongTacKhongTrungKey } from '../chuyen_mon/tuong_tac_thuoc/chuan_hoa_bang_tuong_tac';
import tuongTacThuocSeed from '../chuyen_mon/tuong_tac_thuoc/du_lieu_tuong_tac_thuoc.seed.json';
import seedIcdDrugContraBhyt from './seed_icd_drug_contra_bhyt.json';
import { DANH_MUC_ICD10_CAP_CUU } from '../thanh_phan/icd10_nhap_vien_cap_cuu';
import { BANG_ICD10_TT06, PHIEN_BAN_ICD10_TT06 } from '../thanh_phan/icd10_tt06_bang_ma';
import { giamDinhIcd10MaKep } from './icd10_ma_kep_giam_dinh';
import { giamDinhCdssDmMatchingUpgrade } from './cdss_dm_matching_upgrade';
import { CHUOI_TRICH_DAN_TT12_2026_D10_VA_D13 as TT_12_2026_BTC_DIEU10_K1 } from './co_so_phap_ly_tt12_2026';
import { docDanhMucTuKho } from './kho_du_lieu';
import { kiemTraDinhDangXML } from './kiem_tra_xml';
import { layDanhSachLuatCdhaHardcoded } from './luat_cdha_hardcoded';
import { layDanhSachLuatCongKhamHardcoded } from './luat_cong_kham_hardcoded';
import { layDanhSachLuatDuLieuHardcoded } from './luat_du_lieu_hardcoded';
import {
    laDieuKienChuyenDeXml130Placeholder,
    layDanhSachLuatGiamDinhChuyenDeHardcoded,
} from './luat_giam_dinh_chuyen_de_hardcoded';
import { layDanhSachLuatGiuongHardcoded } from './luat_giuong_hardcoded';
import { layDanhSachLuatHanhChinhHardcoded } from './luat_hanh_chinh_hardcoded';
import { layDanhSachLuatHopDongHardcoded } from './luat_hop_dong_hardcoded';
import { layDanhSachLuatNhanSuHardcoded } from './luat_nhan_su_hardcoded';
import { layDanhSachLuatThuocHardcoded } from './luat_thuoc_hardcoded';
import {
    apGhiDeNoiDungLenDoiTuongCanhBao,
    isQuyTacNoiBoDangBat,
    locCanhBaoTheoTrangThaiQuyTacNoiBo,
    taiMapGhiDeNoiDungQuyTacNoiBo,
    taiMapTrangThaiQuyTacNoiBo,
} from './quy_tac_on_off_noi_bo';
import { chayGiamDinhDvktOp } from './dvkt_op_giam_dinh';
import { damBaoSeedLuatDuLieuMuc1 } from './seed_luat_du_lieu_muc1';
import { damBaoSeedLuatHanhChinhMuc2 } from './seed_luat_hanh_chinh_muc2';
import { damBaoSeedLuatPtttMuc11 } from './seed_luat_pttt_muc11';
import { damBaoSeedLuatThuocMuc8 } from './seed_luat_thuoc_muc8';
import { laCapCuuTheoXml1, viPhamQuy_tacCapCuuIcd10 } from './giam_dinh_icd10_cap_cuu';
import { giamDinhCv302Bhyt } from './giam_dinh_cv302_bhyt';
import { giamDinhCv4262Bhyt } from './giam_dinh_cv4262_bhyt';
import { giamDinhCv3231Bhyt } from './giam_dinh_cv3231_bhyt';
import { giamDinhBsMotCchnNhieuChuyenKhoaCongKham } from './giam_dinh_cong_kham_cchn';
import { buildDmKhamHeThong } from './dm_cong_kham_catalog';
import { laMotLanKcbDuoi15PhanTramLcs as laMotLanKcbDuoi15PhanTramLCS } from './muc_luong_co_so_bhyt';
import { tachChuoiNhieuMa } from './catalog_mapping_chuoi_ma';
import { hopNhatQuyTacTrungTheoDoiTuong } from './hop_nhat_quy_tac_trung_lap';
import { chuanHoaKhoaCanhBaoDedupe, rutGonPhanHoiQuyTac } from './rut_gon_phan_hoi_quy_tac';

// ============================================================
// [PHẦN 1] CACHE VÀ HÀM TIỆN ÍCH CƠ BẢN
// ============================================================
let cache_DanhMucHeThong = null;
let cache_LuatGiamDinh = {};
let cache_ChunkDuLieu = new Map();
let cache_ChunkDuLieuDangNap = new Map();
let cache_DanhSachTabLuatDong = null;
let cache_BienDichDieuKienLuat = new Map();
const STORAGE_CACHE_TTL_MS = 15000;
const KHOA_DAU_DON_DEP_LEGACY_HARDCODED_RULES = 'CDSS_CLEANUP_HARDCODED_RULES_V1';
const KHOA_MIGRATION_SEED = 'CDSS_RULE_SEED_MIGRATIONS_V1';

const DANH_SACH_KHOA_LEGACY_HARDCODED = [
    'CDSS_DATA_LUAT_DU_LIEU', 'CDSS_DATA_XML_DATA', 'CDSS_COLS_LUAT_DU_LIEU', 'CDSS_COLS_XML_DATA',
    'CDSS_DATA_LUAT_HANH_CHINH', 'CDSS_DATA_XML1', 'CDSS_COLS_LUAT_HANH_CHINH', 'CDSS_COLS_XML1',
    'CDSS_DATA_LUAT_THUOC', 'CDSS_DATA_XML2', 'CDSS_COLS_LUAT_THUOC', 'CDSS_COLS_XML2',
];

const donDepDuLieuLegacyLuatHardcoded = async () => {
    let daDonDep = '';
    try { daDonDep = String(await AsyncStorage.getItem(KHOA_DAU_DON_DEP_LEGACY_HARDCODED_RULES) || '').trim(); } catch {}

    if (!daDonDep && typeof window !== 'undefined' && window?.localStorage) {
        try { daDonDep = String(window.localStorage.getItem(KHOA_DAU_DON_DEP_LEGACY_HARDCODED_RULES) || '').trim(); } catch {}
    }
    if (daDonDep === '1') return;

    try {
        await Promise.all(DANH_SACH_KHOA_LEGACY_HARDCODED.map((key) => AsyncStorage.removeItem(key).catch(() => {})));
        const migrationRaw = await AsyncStorage.getItem(KHOA_MIGRATION_SEED).catch(() => null);
        const migrationMap = migrationRaw ? JSON.parse(migrationRaw) : {};
        if (migrationMap && typeof migrationMap === 'object') {
            delete migrationMap.LUAT_DU_LIEU_MUC1;
            delete migrationMap.updated_at;
            await AsyncStorage.setItem(KHOA_MIGRATION_SEED, JSON.stringify(migrationMap)).catch(() => {});
        }
        await AsyncStorage.setItem(KHOA_DAU_DON_DEP_LEGACY_HARDCODED_RULES, '1').catch(() => {});
    } catch {}

    if (typeof window !== 'undefined' && window?.localStorage) {
        try {
            DANH_SACH_KHOA_LEGACY_HARDCODED.forEach((key) => {
                try { window.localStorage.removeItem(key); } catch {}
            });
            const migrationRawWeb = window.localStorage.getItem(KHOA_MIGRATION_SEED);
            const migrationMapWeb = migrationRawWeb ? JSON.parse(migrationRawWeb) : {};
            if (migrationMapWeb && typeof migrationMapWeb === 'object') {
                delete migrationMapWeb.LUAT_DU_LIEU_MUC1;
                delete migrationMapWeb.updated_at;
                window.localStorage.setItem(KHOA_MIGRATION_SEED, JSON.stringify(migrationMapWeb));
            }
            window.localStorage.setItem(KHOA_DAU_DON_DEP_LEGACY_HARDCODED_RULES, '1');
        } catch {}
    }
};

export const xoaCacheBoMayGiamDinh = () => {
    cache_DanhMucHeThong = null;
    cache_LuatGiamDinh = {};
    cache_ChunkDuLieu.clear();
    cache_ChunkDuLieuDangNap.clear();
    cache_DanhSachTabLuatDong = null;
    cache_BienDichDieuKienLuat.clear();
};

const UPPER = (val) => String(val || "").toUpperCase().trim();
const LEN = (val) => String(val || "").trim().length;
const IS_EMPTY = (val) => (val === undefined || val === null || String(val).trim() === "" || String(val).trim() === "undefined");
const STARTS_WITH = (val, prefix) => String(val || "").trim().startsWith(String(prefix));
const TO_NUMBER = (val) => {
    if (IS_EMPTY(val)) return 0;
    const n = parseFloat(String(val).replace(',', '.'));
    return isNaN(n) ? 0 : n;
};
const SUBSTR = (val, start, length) => {
    if (IS_EMPTY(val)) return "";
    return String(val).substring(start - 1, (start - 1) + length);
};

/**
 * QĐ 1018/QĐ-BHXH (2024) sửa Điều 2 QĐ 1351/QĐ-BHXH; QĐ 1697/QĐ-BHXH (2023).
 * Ký tự thứ 3 trên mã thẻ BHYT quy định mức thanh toán cơ bản so với T_TONGCHI_BH (phạm vi chi trả).
 * 1,2,5 → 100%; 3 → 95%; 4 → 80%.
 * Ngoại lệ mức 3 và 4: 100% phạm vi khi (i) một lần KCB < 15% LCS; (ii) gợi ý KCB tuyến xã/trạm (MA_KHOA);
 * (iii) MA_KHUVUC K1/K2/K3 + khám ngoại trú (thường gắn KCB tại tuyến y tế cơ sở).
 *
 * Công văn 38/BYT-BH (06/01/2026) + điểm a khoản 1 Điều 2 Nghị quyết 261/2025/QH15: BHXH chuyển mã quyền lợi
 * trên thẻ — CN (hộ cận nghèo) từ 3→2; LH (≥75 tuổi, trợ cấp hưu trí xã hội) từ 4→2 kể từ 01/01/2026.
 * Hồ sơ XML có thể còn ký tự thứ 3 in cũ; `KY_HIEU_SO_THU_BA_THE_CHO_TYLE_TT` quy đổi khi suy tỷ lệ T_BHTT.
 */
const KY_HIEU_SO_THU_BA_THE_BHYT = (xml1) => String(SUBSTR(xml1?.MA_THE_BHYT, 3, 1) || '').trim();

/** YYYYMMDD từ NGAY_VAO / NGAY_RA / NGAY_TTOAN — so sánh chuỗi với mốc pháp lý. */
const mocNgayYyyyMmDdChoThe = (xml1) => {
    const s = String(xml1?.NGAY_VAO || xml1?.NGAY_RA || xml1?.NGAY_TTOAN || '').replace(/\D/g, '');
    return s.length >= 8 ? s.slice(0, 8) : '';
};

/**
 * Ký tự thứ 3 dùng suy tỷ lệ T_BHTT / T_TONGCHI_BH (sau quy đổi CV 38/BYT-BH + NQ 261/2025/QH15).
 * Giữ `KY_HIEU_SO_THU_BA_THE_BHYT` cho đúng ký tự in trên chuỗi MA_THE_BHYT (HC-01c, cảnh báo lệch prefix).
 */
const KY_HIEU_SO_THU_BA_THE_CHO_TYLE_TT = (xml1) => {
    const raw = KY_HIEU_SO_THU_BA_THE_BHYT(xml1);
    const moc = mocNgayYyyyMmDdChoThe(xml1);
    if (!moc || moc < '20260101') return raw;
    const ma = UPPER(String(xml1?.MA_THE_BHYT || '').trim());
    if (ma.startsWith('CN') && raw === '3') return '2';
    if (ma.startsWith('LH') && raw === '4') return '2';
    return raw;
};

/** Hai ký tự đầu (loại đối tượng) theo bảng kèm ký hiệu số thứ 3 — để phát hiện lệch khai báo (thẻ hỏng/sai số). */
const BANG_HAI_KY_TU_THEO_KY_HIEU_SO3 = Object.freeze({
    '1': new Set(['CC', 'TE']),
    '2': new Set(['CK', 'CB', 'KC', 'HN', 'DT', 'DK', 'XD', 'BT', 'TS', 'AK', 'CT', 'CN', 'LH']),
    '3': new Set(['HT', 'TC', 'CN', 'PV', 'TG', 'DS', 'HK']),
    '4': new Set([
        'DN', 'HX', 'CH', 'NN', 'TK', 'HC', 'XK', 'TB', 'NO', 'XB', 'TN', 'CS', 'XN', 'MS', 'HD', 'TQ', 'TA', 'TY',
        'HG', 'LS', 'LH', 'HS', 'SV', 'GB', 'GD', 'ND', 'TH', 'TV', 'TD', 'TU', 'BA',
    ]),
    '5': new Set(['QN', 'CA', 'CY']),
});

/** true = 2 ký tự đầu không thuộc nhóm đối tượng của ký hiệu số thứ 3 (cần đối chiếu thẻ cứng/BHXH). */
const THE_SO3_KHONG_KHOP_HAI_KY_TU_DAU = (xml1) => {
    const ma = String(xml1?.MA_THE_BHYT || '').trim().toUpperCase().replace(/\s/g, '');
    if (ma.length < 3) return false;
    const prefix = ma.substring(0, 2);
    const so3 = KY_HIEU_SO_THU_BA_THE_BHYT(xml1);
    const set = BANG_HAI_KY_TU_THEO_KY_HIEU_SO3[so3];
    if (!set) return false;
    return !set.has(prefix);
};

const TY_LE_KCB_BHYT_THEO_SO3 = (xml1) => {
    const d = KY_HIEU_SO_THU_BA_THE_CHO_TYLE_TT(xml1);
    if (d === '1' || d === '2' || d === '5') return 1;
    if (d === '3') return 0.95;
    if (d === '4') return 0.8;
    return -1;
};

/** Heuristic tuyến xã / trạm y tế / PK khu vực — không thay DM CSKCB. */
const laKhoaGoiYTuyenXaHoacTram = (xml1) => {
    const mk = UPPER(String(xml1?.MA_KHOA || '').replace(/\s+/g, ''));
    if (!mk) return false;
    if (/^(TYT|TYTT|TYTX|TTYT|TTDV|TRAM|TRAMYT|TRAMYTE|TYTXA)/.test(mk)) return true;
    if (mk.includes('TRAMY') || mk.includes('TRAMYTE') || mk.includes('TYTXA') || mk.includes('PKDKKV') || mk.includes('PKDK-KV')) return true;
    return false;
};

const laMaKhuVucK123 = (xml1) => {
    const v = UPPER(String(xml1?.MA_KHUVUC || '').trim());
    return v === 'K1' || v === 'K2' || v === 'K3';
};

/** Ngoại lệ 100% phạm vi chi trả đối với mức 3 và 4 (QĐ 1018 — điểm b, c, d). */
const laDuocApTyLe100NgoaiLeMuc3Va4 = (xml1) => {
    const d = KY_HIEU_SO_THU_BA_THE_CHO_TYLE_TT(xml1);
    if (d !== '3' && d !== '4') return false;
    if (laMotLanKcbDuoi15PhanTramLCS(xml1)) return true;
    if (laKhoaGoiYTuyenXaHoacTram(xml1)) return true;
    if (laMaKhuVucK123(xml1) && MATCH_MA_LOAI_KCB(xml1?.MA_LOAI_KCB, '1')) return true;
    return false;
};

/**
 * Tỷ lệ BHYT hiệu lực so với T_TONGCHI_BH sau khi áp ngoại lệ (mức 3/4 có thể = 1).
 * Dùng cho kiểm tra T_BHTT; không thay thế quy tắc tuyến/giấy chuyển tuyến riêng.
 */
const TY_LE_KCB_BHYT_SAU_NGOAI_LE = (xml1) => {
    const base = TY_LE_KCB_BHYT_THEO_SO3(xml1);
    if (base < 0) return -1;
    if (laDuocApTyLe100NgoaiLeMuc3Va4(xml1)) return 1;
    return base;
};

/** true = T_BHTT không khớp tỷ lệ (sai số làm tròn 1 đồng). Nếu thẻ lệch 2 ký tự đầu vs số thứ 3 → không kết luận vi phạm tỷ lệ (tránh báo sai). */
const VI_PHAM_TYLE_T_BHTT_TONGCHI_BH = (xml1) => {
    if (THE_SO3_KHONG_KHOP_HAI_KY_TU_DAU(xml1)) return false;
    const ty = TY_LE_KCB_BHYT_SAU_NGOAI_LE(xml1);
    if (ty < 0) return false;
    const tt = TO_NUMBER(xml1?.T_TONGCHI_BH);
    if (tt <= 0) return false;
    const tb = TO_NUMBER(xml1?.T_BHTT);
    const expected = tt * ty;
    const d = KY_HIEU_SO_THU_BA_THE_CHO_TYLE_TT(xml1);
    const tol = 1;
    if (d === '1' || d === '2' || d === '5') {
        return tb + tol < expected;
    }
    return Math.abs(tb - expected) > tol;
};

/**
 * HC_83 (thẻ TS): coi là hợp lệ nếu tỷ lệ T_BHTT / T_TONGCHI_BH ≥ 95%.
 * true = vi phạm (tỷ lệ thực tế dưới 95%). Không áp khớp từng đồng theo ký hiệu số thứ 3 như VI_PHAM_TYLE_T_BHTT_TONGCHI_BH.
 */
const VI_PHAM_TS_TYLE_BHTT_DUOI_95 = (xml1) => {
    const ma = UPPER(String(xml1?.MA_THE_BHYT || '').trim());
    if (!ma.startsWith('TS')) return false;
    const tt = TO_NUMBER(xml1?.T_TONGCHI_BH);
    if (tt <= 0) return false;
    const tb = TO_NUMBER(xml1?.T_BHTT);
    return tb * 100 < tt * 95;
};

/** Cảnh báo khai báo thẻ: 2 ký tự đầu không khớp nhóm theo ký hiệu số thứ 3 (dùng làm rule riêng). */
const VI_PHAM_KHAI_BAO_THE_SO3_LECH_PREFIX = (xml1) => THE_SO3_KHONG_KHOP_HAI_KY_TU_DAU(xml1);

const DIFF_HOURS = (d1, d2) => {
    if (IS_EMPTY(d1) || IS_EMPTY(d2)) return 0;
    const s1 = String(d1).replace(/\D/g, '').padEnd(12, '0');
    const s2 = String(d2).replace(/\D/g, '').padEnd(12, '0');
    const parse12 = (s) => new Date(s.substring(0,4), parseInt(s.substring(4,6))-1, s.substring(6,8), s.substring(8,10), s.substring(10,12));
    return Math.abs(parse12(s2) - parse12(s1)) / (1000 * 60 * 60);
};
const DIFF_DAYS = (d1, d2) => {
    if (IS_EMPTY(d1) || IS_EMPTY(d2)) return 0;
    const s1 = String(d1).replace(/\D/g, '').padEnd(12, '0');
    const s2 = String(d2).replace(/\D/g, '').padEnd(12, '0');
    const date1 = new Date(s1.substring(0,4), parseInt(s1.substring(4,6))-1, s1.substring(6,8));
    const date2 = new Date(s2.substring(0,4), parseInt(s2.substring(4,6))-1, s2.substring(6,8));
    return Math.floor(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));
};
const DIFF_MINUTES = (d1, d2) => Math.round(DIFF_HOURS(d1, d2) * 60);
const DIFF_MONTHS = (d1, d2) => {
    if (IS_EMPTY(d1) || IS_EMPTY(d2)) return 0;
    const s1 = String(d1).replace(/\D/g, '').padEnd(8, '0');
    const s2 = String(d2).replace(/\D/g, '').padEnd(8, '0');
    const y1 = parseInt(s1.substring(0, 4), 10);
    const m1 = parseInt(s1.substring(4, 6), 10);
    const y2 = parseInt(s2.substring(0, 4), 10);
    const m2 = parseInt(s2.substring(4, 6), 10);
    if ([y1, m1, y2, m2].some((value) => Number.isNaN(value))) return 0;
    return Math.abs((y2 - y1) * 12 + (m2 - m1));
};
const DIFF_YEARS = (d1, d2) => Math.floor(DIFF_DAYS(d1, d2) / 365);
const YEAR = (value) => {
    const digits = String(value || '').replace(/\D/g, '');
    if (digits.length < 4) return 0;
    const year = parseInt(digits.substring(0, 4), 10);
    return Number.isNaN(year) ? 0 : year;
};
const COUNT_IF = (arr, conditionFn) => {
    if (!Array.isArray(arr)) return 0;
    return arr.filter(item => { try { return conditionFn(item); } catch { return false; } }).length;
};
const COUNT = (value) => {
    if (Array.isArray(value)) return value.length;
    if (typeof value === 'boolean') return value ? 1 : 0;
    if (value && typeof value === 'object') return Object.keys(value).length > 0 ? 1 : 0;
    return IS_EMPTY(value) ? 0 : 1;
};
const ALL = (arr, conditionFn) => {
    if (!Array.isArray(arr)) return false;
    return arr.every((item) => {
        try { return !!conditionFn(item); } catch { return false; }
    });
};
const EXISTS = (arr, conditionFn) => {
    if (!Array.isArray(arr)) return false;
    if (typeof conditionFn !== 'function') return arr.length > 0;
    return arr.some((item) => {
        try { return !!conditionFn(item); } catch { return false; }
    });
};
const COUNT_DISTINCT = (arr, selectorFn) => {
    if (!Array.isArray(arr)) return 0;
    const seen = new Set();
    arr.forEach((item) => {
        try {
            const value = typeof selectorFn === 'function' ? selectorFn(item) : item;
            if (IS_EMPTY(value)) return;
            seen.add(String(value));
        } catch {}
    });
    return seen.size;
};
const SUM_IF = (arr, predicateFn, valueFn) => {
    if (!Array.isArray(arr)) return 0;
    return arr.reduce((sum, item) => {
        try {
            if (typeof predicateFn === 'function' && !predicateFn(item)) return sum;
            const value = typeof valueFn === 'function' ? valueFn(item) : item;
            return sum + TO_NUMBER(value);
        } catch {
            return sum;
        }
    }, 0);
};

const taoGiaTriNow = () => {
    const now = new Date();
    const pad = (value) => String(value).padStart(2, '0');
    return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}`;
};

const taoGiaTriToday = () => taoGiaTriNow().substring(0, 8);

const normalizeMaLoaiKcb = (val) => {
    const raw = String(val ?? '').trim();
    if (!raw) return '';
    const digits = raw.replace(/\D/g, '');
    return digits ? digits.padStart(2, '0') : raw;
};

const MA_LOAI_KCB_KHAM_VA_NGOAI_TRU = new Set(['01', '02', '05', '06', '07', '08']);
const MA_LOAI_KCB_NOI_TRU = new Set(['03', '09']);
const MA_LOAI_KCB_NOI_TRU_BAN_NGAY = new Set(['04']);

const layTapMaLoaiKcbTheoGiaTriRule = (expectedValue) => {
    const raw = String(expectedValue ?? '').trim().replace(/^['"]|['"]$/g, '');
    if (!raw) return new Set();
    if (raw === '1') return new Set(['01', '02', '05', '06', '07', '08']);
    if (raw === '2' || raw === '4') return new Set(['04']);
    if (raw === '3') return new Set(['03', '09']);
    const normalized = normalizeMaLoaiKcb(raw);
    return normalized ? new Set([normalized]) : new Set([raw]);
};

const MATCH_MA_LOAI_KCB = (actualValue, expectedValue) => {
    const actual = normalizeMaLoaiKcb(actualValue);
    if (!actual) return false;
    return layTapMaLoaiKcbTheoGiaTriRule(expectedValue).has(actual);
};

const MATCH_ANY_MA_LOAI_KCB = (actualValue, ...expectedValues) => {
    if (expectedValues.length === 0) return false;
    return expectedValues.some((value) => MATCH_MA_LOAI_KCB(actualValue, value));
};

const chuanHoaTokenDonViThuoc = (value) => String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\u0111/g, 'd')
    .toUpperCase()
    .replace(/[^A-Z]/g, '');

const laDonViDongGoiThuoc = (value) => /^(VIEN|GOI|ONG|LO|CHAI|BOM|TUYP|MIENG|CAI)$/.test(chuanHoaTokenDonViThuoc(value));
const laDonViKhoiLuongTheTichThuoc = (value) => /^(MG|MCG|G|GRAM|KG|ML|L|IU|UI)$/.test(chuanHoaTokenDonViThuoc(value));
const QUY_DOI_DON_VI_THUOC = Object.freeze({
    MCG: { dimension: 'mass', factor: 0.001 },
    MG: { dimension: 'mass', factor: 1 },
    G: { dimension: 'mass', factor: 1000 },
    GRAM: { dimension: 'mass', factor: 1000 },
    KG: { dimension: 'mass', factor: 1000000 },
    ML: { dimension: 'volume', factor: 1 },
    L: { dimension: 'volume', factor: 1000 },
});

const quyDoiGiaTriDonViThuoc = (value, fromUnit, toUnit) => {
    const from = QUY_DOI_DON_VI_THUOC[chuanHoaTokenDonViThuoc(fromUnit)];
    const to = QUY_DOI_DON_VI_THUOC[chuanHoaTokenDonViThuoc(toUnit)];
    const numericValue = TO_NUMBER(value);
    if (!(numericValue > 0) || !from || !to || from.dimension !== to.dimension) return 0;
    return (numericValue * from.factor) / to.factor;
};

const layHamLuongMotDonViQuyDoi = (row = {}, targetUnit = '') => {
    const hamLuongText = String(row?.HAM_LUONG || '').toUpperCase();
    if (!hamLuongText || !targetUnit) return 0;
    const match = hamLuongText.match(/(\d+(?:[.,]\d+)?)\s*(MCG|MG|G|GRAM|KG|ML|L)\b/);
    if (!match) return 0;
    const soLuong = parseFloat(String(match[1] || '0').replace(',', '.'));
    return quyDoiGiaTriDonViThuoc(soLuong, match[2], targetUnit);
};

const coDauHieuDonViCapPhatDangKhaiTheoHamLuongDonVi = (row = {}) => {
    const donViCapPhat = chuanHoaTokenDonViThuoc(row?.DON_VI_TINH || '');
    const soLuongXuat = TO_NUMBER(row?.SO_LUONG);
    if (!laDonViKhoiLuongTheTichThuoc(donViCapPhat) || !(soLuongXuat > 0)) return false;
    const hamLuongMotDonVi = layHamLuongMotDonViQuyDoi(row, donViCapPhat);
    if (!(hamLuongMotDonVi > 0)) return false;
    return soLuongXuat < hamLuongMotDonVi;
};

const laHoSoNgoaiTruTheoQd824 = (xml1 = {}) => MA_LOAI_KCB_KHAM_VA_NGOAI_TRU.has(normalizeMaLoaiKcb(xml1?.MA_LOAI_KCB));
const laHoSoNoiTruTheoQd824 = (xml1 = {}) => {
    const maLoai = normalizeMaLoaiKcb(xml1?.MA_LOAI_KCB);
    return MA_LOAI_KCB_NOI_TRU.has(maLoai) || (IS_EMPTY(maLoai) && !IS_EMPTY(xml1?.NGAY_VAO_NOI_TRU));
};
const laHoSoNoiTruBanNgayTheoQd824 = (xml1 = {}) => MA_LOAI_KCB_NOI_TRU_BAN_NGAY.has(normalizeMaLoaiKcb(xml1?.MA_LOAI_KCB));

/** Ngày y lệnh / thực hiện y lệnh trên dòng thuốc XML2 — YYYYMMDD (QĐ 130 / 3176) */
const layNgayYYYYMMDDtuDongXML2Thuoc = (row) => {
    const raw = row?.NGAY_YL || row?.NGAY_TH_YL || '';
    const s = String(raw || '').replace(/\D/g, '');
    return s.length >= 8 ? s.slice(0, 8) : '';
};

/**
 * Hai mã thuốc A/B trên XML2 cùng đợt KCB (cùng MA_LK trong một hồ sơ):
 * — Ưu tiên: có ít nhất một ngày y lệnh trùng (NGAY_YL hoặc NGAY_TH_YL).
 * — Nếu cả hai đều có mốc ngày nhưng không trùng ngày → không ghi nhận tương tác đồng thời (kê khác ngày).
 * — Nếu thiếu mốc ngày trên một hoặc hai thuốc → ghi nhận theo cả đợt (cùng tập dòng XML2 BHYT).
 */
const danhGiaDongThoiThuocABtrenXML2 = (maA, maB, mapMaSangNgay) => {
    const oa = mapMaSangNgay.get(maA);
    const ob = mapMaSangNgay.get(maB);
    if (!oa || !ob) return { ghiNhan: false, kieu: '', ngayGoiY: '' };
    const trungNgay = [...oa.ngay].filter((d) => ob.ngay.has(d));
    if (trungNgay.length > 0) {
        trungNgay.sort();
        return { ghiNhan: true, kieu: 'CUNG_NGAY_YL', ngayGoiY: trungNgay[0] };
    }
    const caHaiDeuCoItNhatMotNgay = oa.ngay.size > 0 && ob.ngay.size > 0;
    if (caHaiDeuCoItNhatMotNgay) {
        return { ghiNhan: false, kieu: 'KHAC_NGAY_YL', ngayGoiY: '' };
    }
    return { ghiNhan: true, kieu: 'CUNG_DOT_XML2', ngayGoiY: '' };
};

const layMoTaLoaiDieuTriXml1 = (xml1) => {
    if (laHoSoNoiTruTheoQd824(xml1)) return 'nội trú';
    if (laHoSoNgoaiTruTheoQd824(xml1)) return 'ngoại trú';
    if (laHoSoNoiTruBanNgayTheoQd824(xml1)) return 'nội trú ban ngày';
    const m = String(xml1?.MA_LOAI_KCB || '').trim();
    return m ? `đợt KCB (MA_LOAI_KCB ${m})` : 'đợt KCB';
};

const VAN_BAN_HANH_CHINH_HIEN_HANH = Object.freeze({
    ND_188: 'Nghị định 188/2025/NĐ-CP: quy định về thanh toán chi phí KCB BHYT, thủ tục thanh toán và xử lý vi phạm hành chính.',
    TT_01: 'Thông tư 01/2025/TT-BYT: quy định đăng ký KCB ban đầu, thẻ KCB BHYT điện tử và hồ sơ chuyển cơ sở KCB BHYT.',
    QD_3618_BHXH: 'Quyết định 3618/QĐ-BHXH: quy trình kiểm tra BHYT và bộ danh mục, chỉ tiêu dữ liệu phục vụ kiểm tra điện tử.',
    QD_130: 'Quyết định 130/QĐ-BYT: quy định cấu trúc và danh mục chỉ tiêu dữ liệu XML KCB BHYT.',
    QD_3176: 'Quyết định 3176/QĐ-BYT: quy trình tiếp nhận và kiểm tra dữ liệu XML liên thông BHYT.',
    LUAT_BHYT: 'Luật BHYT (đã sửa đổi, bổ sung): điều kiện hưởng và nguyên tắc thanh toán BHYT.',
    LUAT_KCB:
        'Luật Khám bệnh, chữa bệnh (15/2023/QH15; VBHN 26/VBHN-VPQH 2026 — hợp nhất): quyền/nghĩa vụ người bệnh; tổ chức KCB; người hành nghề; hồ sơ bệnh án; chất lượng và an toàn KCB — căn cứ chuyên môn khi kiểm tra chủ động / độ hợp lý dịch vụ (kết hợp TT 12/2026 Điều 10 khoản 1 điểm e, g, i).',
    ND_96_KCB:
        'Nghị định 96/2023/NĐ-CP: hướng dẫn Luật Khám bệnh, chữa bệnh (điều kiện hoạt động CSKCB, phạm vi hành nghề, phân tuyến kỹ thuật, quản lý chất lượng).',
    TT_32_KCB:
        'Thông tư 32/2023/TT-BYT: hướng dẫn Luật Khám bệnh, chữa bệnh (quy trình KCB, bệnh án, biểu mẫu hồ sơ — đối chiếu QĐ 130/QĐ-BYT và kiểm tra chủ động).',
    VBHN_17:
        '17/VBHN-BYT (31/12/2024): văn bản hợp nhất quy định danh mục và điều kiện thanh toán DVKT BHYT; gốc Thông tư 35/2016/TT-BYT, sửa đổi bổ sung tại Thông tư 13/2020/TT-BYT và Thông tư 39/2024/TT-BYT (HL 01/01/2025: một lượt KCB — khoản 7 Điều 4; Điều 4a–4d; hợp đồng KCB BHYT thể hiện số giường).',
    VBHN_VTYT:
        '14/VBHN-BYT (2025): văn bản hợp nhất quy định điều kiện thanh toán vật tư y tế (VTYT) thuộc phạm vi BHYT; gốc Thông tư 04/2017/TT-BYT (danh mục, tỷ lệ, điều kiện) và các thông tư sửa đổi, bổ sung được hợp nhất (tham chiếu 06/VBHN-BYT 2018 khi đối chiếu phiên bản hợp nhất trước đó).',
    TT_12_BTC_D10: TT_12_2026_BTC_DIEU10_K1,
});

const CO_SO_PHAP_LY_THUOC = Object.freeze({
    DANH_MUC_BHYT: `15/VBHN-BYT (2024) hợp nhất TT 20/2022/TT-BYT và TT 37/2024/TT-BYT: Điều 1, Điều 2, Điều 20; Thông tư 37/2024/TT-BYT: Điều 8 về nguyên tắc thanh toán thuốc BHYT. ${TT_12_2026_BTC_DIEU10_K1}`,
    KE_DON_NGOAI_TRU: `26/2025/TT-BYT: Điều 4, Điều 5, Điều 6 (quy định về kê đơn thuốc ngoại trú). ${TT_12_2026_BTC_DIEU10_K1}`,
    SO_NGAY_SU_DUNG: `26/2025/TT-BYT: Điều 6 khoản 8 (số ngày sử dụng mỗi thuốc). ${TT_12_2026_BTC_DIEU10_K1}`,
    NOI_BO_GIA_THAU: `15/VBHN-BYT (2024) + danh mục, giá trúng thầu nội bộ đã phê duyệt tại cơ sở KCB. ${TT_12_2026_BTC_DIEU10_K1}`,
});

const CO_SO_PHAP_LY_DVKT = Object.freeze({
    DANH_MUC_NOI_BO: `${VAN_BAN_HANH_CHINH_HIEN_HANH.VBHN_17} ${VAN_BAN_HANH_CHINH_HIEN_HANH.ND_188} ${VAN_BAN_HANH_CHINH_HIEN_HANH.QD_3618_BHXH} ${TT_12_2026_BTC_DIEU10_K1}`,
    GIA_DVKT: `${VAN_BAN_HANH_CHINH_HIEN_HANH.VBHN_17} ${VAN_BAN_HANH_CHINH_HIEN_HANH.ND_188} ${VAN_BAN_HANH_CHINH_HIEN_HANH.QD_3618_BHXH} ${TT_12_2026_BTC_DIEU10_K1}`,
    CHAT_LUONG_DANH_MUC_BV: `${VAN_BAN_HANH_CHINH_HIEN_HANH.QD_130} ${VAN_BAN_HANH_CHINH_HIEN_HANH.QD_3176} ${VAN_BAN_HANH_CHINH_HIEN_HANH.QD_3618_BHXH} ${TT_12_2026_BTC_DIEU10_K1}`,
});

const CO_SO_PHAP_LY_VTYT = Object.freeze({
    DANH_MUC_NOI_BO: `${VAN_BAN_HANH_CHINH_HIEN_HANH.VBHN_VTYT} ${VAN_BAN_HANH_CHINH_HIEN_HANH.ND_188} ${VAN_BAN_HANH_CHINH_HIEN_HANH.QD_3618_BHXH} ${TT_12_2026_BTC_DIEU10_K1}`,
    GIA_VTYT: `${VAN_BAN_HANH_CHINH_HIEN_HANH.VBHN_VTYT} ${VAN_BAN_HANH_CHINH_HIEN_HANH.ND_188} ${VAN_BAN_HANH_CHINH_HIEN_HANH.QD_3618_BHXH} ${TT_12_2026_BTC_DIEU10_K1}`,
});

const CO_SO_PHAP_LY_KCB = Object.freeze({
    CHUYEN_MON: `${VAN_BAN_HANH_CHINH_HIEN_HANH.LUAT_KCB} ${VAN_BAN_HANH_CHINH_HIEN_HANH.ND_96_KCB} ${VAN_BAN_HANH_CHINH_HIEN_HANH.TT_32_KCB} ${VAN_BAN_HANH_CHINH_HIEN_HANH.ND_188} ${VAN_BAN_HANH_CHINH_HIEN_HANH.QD_3618_BHXH} ${TT_12_2026_BTC_DIEU10_K1}`,
});

const CO_SO_PHAP_LY_HANH_CHINH = Object.freeze({
    'HC-01': `${VAN_BAN_HANH_CHINH_HIEN_HANH.TT_01} ${VAN_BAN_HANH_CHINH_HIEN_HANH.QD_130} ${TT_12_2026_BTC_DIEU10_K1}`,
    'HC-02': `${VAN_BAN_HANH_CHINH_HIEN_HANH.QD_130} ${VAN_BAN_HANH_CHINH_HIEN_HANH.ND_188} ${VAN_BAN_HANH_CHINH_HIEN_HANH.QD_3618_BHXH} ${TT_12_2026_BTC_DIEU10_K1}`,
    'HC-03': `${VAN_BAN_HANH_CHINH_HIEN_HANH.QD_130} ${VAN_BAN_HANH_CHINH_HIEN_HANH.ND_188} ${VAN_BAN_HANH_CHINH_HIEN_HANH.QD_3618_BHXH} ${TT_12_2026_BTC_DIEU10_K1}`,
    'HC-04': `${VAN_BAN_HANH_CHINH_HIEN_HANH.QD_130} ${VAN_BAN_HANH_CHINH_HIEN_HANH.ND_188} ${VAN_BAN_HANH_CHINH_HIEN_HANH.QD_3618_BHXH} ${TT_12_2026_BTC_DIEU10_K1}`,
    'HC-05': `${VAN_BAN_HANH_CHINH_HIEN_HANH.LUAT_BHYT} ${VAN_BAN_HANH_CHINH_HIEN_HANH.TT_01} ${TT_12_2026_BTC_DIEU10_K1}`,
    'HC-06': `${VAN_BAN_HANH_CHINH_HIEN_HANH.QD_130} ${TT_12_2026_BTC_DIEU10_K1}`,
    'HC-07': `${VAN_BAN_HANH_CHINH_HIEN_HANH.QD_130} ${TT_12_2026_BTC_DIEU10_K1}`,
    'HC-08': `${VAN_BAN_HANH_CHINH_HIEN_HANH.QD_130} ${VAN_BAN_HANH_CHINH_HIEN_HANH.ND_188} ${VAN_BAN_HANH_CHINH_HIEN_HANH.QD_3618_BHXH} ${TT_12_2026_BTC_DIEU10_K1}`,
    'HC-09': `${VAN_BAN_HANH_CHINH_HIEN_HANH.QD_130} ${VAN_BAN_HANH_CHINH_HIEN_HANH.ND_188} ${VAN_BAN_HANH_CHINH_HIEN_HANH.QD_3618_BHXH} ${TT_12_2026_BTC_DIEU10_K1}`,
    'HC-10': `${VAN_BAN_HANH_CHINH_HIEN_HANH.QD_130} ${VAN_BAN_HANH_CHINH_HIEN_HANH.ND_188} ${VAN_BAN_HANH_CHINH_HIEN_HANH.QD_3618_BHXH} ${TT_12_2026_BTC_DIEU10_K1}`,
    DEFAULT: `${VAN_BAN_HANH_CHINH_HIEN_HANH.QD_130} ${VAN_BAN_HANH_CHINH_HIEN_HANH.ND_188} ${VAN_BAN_HANH_CHINH_HIEN_HANH.QD_3618_BHXH} ${TT_12_2026_BTC_DIEU10_K1}`,
});

const CO_SO_PHAP_LY_THEO_PREFIX_MA_LUAT = Object.freeze({
    'STRUCT-': `${VAN_BAN_HANH_CHINH_HIEN_HANH.QD_3176} ${VAN_BAN_HANH_CHINH_HIEN_HANH.QD_130} ${VAN_BAN_HANH_CHINH_HIEN_HANH.QD_3618_BHXH} ${TT_12_2026_BTC_DIEU10_K1}`,
    'HC-': CO_SO_PHAP_LY_HANH_CHINH.DEFAULT,
    'HC_': CO_SO_PHAP_LY_HANH_CHINH.DEFAULT,
    'XML_': `${VAN_BAN_HANH_CHINH_HIEN_HANH.QD_130} ${VAN_BAN_HANH_CHINH_HIEN_HANH.ND_188} ${VAN_BAN_HANH_CHINH_HIEN_HANH.QD_3618_BHXH} ${TT_12_2026_BTC_DIEU10_K1}`,
    'HD_': `${VAN_BAN_HANH_CHINH_HIEN_HANH.QD_130} ${VAN_BAN_HANH_CHINH_HIEN_HANH.ND_188} ${VAN_BAN_HANH_CHINH_HIEN_HANH.QD_3618_BHXH} ${TT_12_2026_BTC_DIEU10_K1}`,
    'CK_': CO_SO_PHAP_LY_DVKT.DANH_MUC_NOI_BO,
    'GB_': CO_SO_PHAP_LY_DVKT.DANH_MUC_NOI_BO,
    'NS_': CO_SO_PHAP_LY_DVKT.CHAT_LUONG_DANH_MUC_BV,
    'THUOC_': CO_SO_PHAP_LY_THUOC.DANH_MUC_BHYT,
    'CDHA_': CO_SO_PHAP_LY_DVKT.DANH_MUC_NOI_BO,
    'DVKT_': CO_SO_PHAP_LY_DVKT.DANH_MUC_NOI_BO,
    'CHUYEN_DE_': CO_SO_PHAP_LY_DVKT.DANH_MUC_NOI_BO,
    'DMBV-': CO_SO_PHAP_LY_DVKT.CHAT_LUONG_DANH_MUC_BV,
    'DM-KHOA-': CO_SO_PHAP_LY_DVKT.DANH_MUC_NOI_BO,
    'DM-THUOC-': CO_SO_PHAP_LY_THUOC.DANH_MUC_BHYT,
    'DM-DVKT-': CO_SO_PHAP_LY_DVKT.DANH_MUC_NOI_BO,
    'DM-VTYT-': CO_SO_PHAP_LY_VTYT.DANH_MUC_NOI_BO,
    'CLN-THUOC-': CO_SO_PHAP_LY_THUOC.KE_DON_NGOAI_TRU,
    'CLN-CDHA-': CO_SO_PHAP_LY_DVKT.DANH_MUC_NOI_BO,
    'CLN-DVKT-': CO_SO_PHAP_LY_DVKT.DANH_MUC_NOI_BO,
    'CV4262-': 'Công văn 4262/BHXH-CSYT (28/10/2016) — thanh toán chi phí KCB BHYT',
    'CV3231-': 'Công văn 3231/BYT-KCB (27/05/2025) — phạm vi hành nghề & thanh toán KCB BHYT',
    'CLN-GIUONG-': CO_SO_PHAP_LY_DVKT.DANH_MUC_NOI_BO,
    'CLN-PTTT-': CO_SO_PHAP_LY_DVKT.DANH_MUC_NOI_BO,
    'CLN-CT-': `${VAN_BAN_HANH_CHINH_HIEN_HANH.TT_01} ${VAN_BAN_HANH_CHINH_HIEN_HANH.ND_188} ${TT_12_2026_BTC_DIEU10_K1}`,
    'CLN-CHI-': `${VAN_BAN_HANH_CHINH_HIEN_HANH.QD_130} ${VAN_BAN_HANH_CHINH_HIEN_HANH.ND_188} ${TT_12_2026_BTC_DIEU10_K1}`,
    'CLN-XDC-': `${VAN_BAN_HANH_CHINH_HIEN_HANH.QD_130} ${VAN_BAN_HANH_CHINH_HIEN_HANH.ND_188} ${TT_12_2026_BTC_DIEU10_K1}`,
    'ICD-TT06-': `Thông tư 06/2026/TT-BYT: Phụ lục danh mục mã bệnh ICD-10 (hướng dẫn mã hóa — không dùng làm bệnh chính, mã cụ thể hơn, giới tính...). ${TT_12_2026_BTC_DIEU10_K1}`,
    'ICD-KEP-': 'Quy định mã hóa bệnh tật ICD-10: hệ thống mã kép — mã dấu găm (†) và mã dấu sao (*).',
    'CLN-KCB-': CO_SO_PHAP_LY_KCB.CHUYEN_MON,
    'CLN-TT-': CO_SO_PHAP_LY_KCB.CHUYEN_MON,
    'TUONGTAC_': CO_SO_PHAP_LY_KCB.CHUYEN_MON,
});

const layCoSoPhapLyHanhChinh = (maLuat = '') => {
    const ma = String(maLuat || '').trim().toUpperCase();
    if (!ma) return CO_SO_PHAP_LY_HANH_CHINH.DEFAULT;
    const base = ma.replace(/[A-Z]$/, '');
    return CO_SO_PHAP_LY_HANH_CHINH[ma] || CO_SO_PHAP_LY_HANH_CHINH[base] || CO_SO_PHAP_LY_HANH_CHINH.DEFAULT;
};

const layCoSoPhapLyMacDinhTheoMaLuat = (maLuat = '') => {
    const ma = String(maLuat || '').trim().toUpperCase();
    if (!ma) return '';
    const directHc = layCoSoPhapLyHanhChinh(ma);
    if (ma.startsWith('HC-') && directHc) return directHc;
    const prefix = Object.keys(CO_SO_PHAP_LY_THEO_PREFIX_MA_LUAT).find((p) => ma.startsWith(p));
    return prefix ? CO_SO_PHAP_LY_THEO_PREFIX_MA_LUAT[prefix] : '';
};

const boSungCoSoPhapLyMacDinh = (danhSach = []) => (Array.isArray(danhSach) ? danhSach : []).map((loi) => {
    const coSoHienTai = String(loi?.co_so_phap_ly || '').trim();
    if (coSoHienTai) return loi;
    const coSoMacDinh = layCoSoPhapLyMacDinhTheoMaLuat(loi?.ma_luat || '');
    if (!coSoMacDinh) return loi;
    return { ...loi, co_so_phap_ly: coSoMacDinh };
});

/**
 * Tầng pipeline V15 (đồng bộ chayGiamDinhToanDienV15): L0 ngoại lệ/cấu trúc, L1 HC, L23 danh mục BV+BYT,
 * L4 lâm sàng / chuyên đề / PTTT / CDHA / tương tác, L5 DVKT-OP (toán tử cung), L5b CDSS mapping nâng cấp.
 * Giá trị gộp L2+L3 thành L23 để tránh map nặng; đủ cho lọc báo cáo/hồi quy.
 */
export const suyRaTangV15TuCanhBao = (loi = {}, namespaceQuyTacDaSuyRa = '') => {
    const maLuat = String(loi?.ma_luat || loi?._maLuat || '').trim().toUpperCase();
    const ns = String(namespaceQuyTacDaSuyRa || loi?.namespace_quy_tac || '').trim();
    const phanHe = String(loi?.phan_he || '').trim().toUpperCase();
    const nguonGd = String(loi?.nguon_giam_dinh || '').trim().toUpperCase();

    if (/^FPG-/.test(maLuat)) return 'L0';
    if (/^STRUCT/.test(maLuat)) return 'L0';
    if (/^XML\d+-(REQ|MISSING)/.test(maLuat)) return 'L0';

    if (/^HC-|^HC_/.test(maLuat)) return 'L1';

    if (/^DVKT-OP-/.test(maLuat)) return 'L5';
    if (/^CDSS_DM_UPGRADE/.test(maLuat)) return 'L5b';
    if (nguonGd === 'PYTHON_SERVICE') return 'L5';

    if (/^ICD-TT06-/.test(maLuat)) return 'L23';
    if (/^ICD-KEP-/.test(maLuat)) return 'L23';

    if (/^(DM-THUOC-|DMBV-THUOC-|DM-DVKT-|DMBV-DVKT-|DM-VTYT-|DMBV-VTYT-|DM-KHOA-)/.test(maLuat)) {
        return 'L23';
    }

    if (
        /^CLN-/.test(maLuat)
        || /^THUOC_/.test(maLuat)
        || /^CDHA_/.test(maLuat)
        || /^CHUYEN_DE/.test(maLuat)
        || /^NS_/.test(maLuat)
        || /^DVKT_/.test(maLuat)
        || /^TUONGTAC_/.test(maLuat)
    ) {
        return 'L4';
    }

    const nsMap = {
        DVKT_OP: 'L5',
        HANH_CHINH_BUILTIN: 'L1',
        HANH_CHINH_HARDCODED: 'L1',
        THUOC_DANH_MUC_BUILTIN: 'L23',
        THUOC_HARDCODED: 'L4',
        NHAN_SU_HARDCODED: 'L4',
        PTTT_BUILTIN: 'L4',
        PTTT_SEED: 'L4',
        CDHA_BUILTIN: 'L4',
        CDHA_HARDCODED: 'L4',
        XDC_BUILTIN: 'L4',
        ICD10_TT06_BUILTIN: 'L23',
        ICD10_MA_KEP_BUILTIN: 'L23',
        DVKT_DANH_MUC: 'L23',
        GIAM_DINH_CHUYEN_DE: 'L4',
        PYTHON_SERVICE: 'L5',
        XML3_KHAC: 'L4',
    };
    if (ns && nsMap[ns]) return nsMap[ns];

    if (ns === 'QUY_TAC_NOI_BO') {
        if (phanHe === 'XML5') return 'L4';
        if (phanHe === 'XML1') return 'L1';
        if (/^XML[234]/.test(phanHe)) return 'L23';
        return 'L23';
    }

    return 'L23';
};

export const suyRaNamespaceVaNguonQuyTac = (loi = {}) => {
    const maLuat = String(loi?.ma_luat || loi?._maLuat || '').trim().toUpperCase();
    const phanHe = String(loi?.phan_he || '').trim().toUpperCase();
    let namespaceQuyTac = String(loi?.namespace_quy_tac || '').trim();
    let nguonQuyTac = String(loi?.nguon_quy_tac || '').trim();
    let luongGiaiTrinh = String(loi?.luong_giai_trinh || '').trim();
    let tabQuanTriGoiY = String(loi?.tab_quan_tri_goi_y || '').trim();

    const ganMeta = (namespace, nguon, luong, tab = '') => {
        if (!namespaceQuyTac && namespace) namespaceQuyTac = namespace;
        if (!nguonQuyTac && nguon) nguonQuyTac = nguon;
        if (!luongGiaiTrinh && luong) luongGiaiTrinh = luong;
        if (!tabQuanTriGoiY && tab) tabQuanTriGoiY = tab;
    };

    if (String(loi?.nguon_giam_dinh || '').trim().toUpperCase() === 'PYTHON_SERVICE') {
        ganMeta('PYTHON_SERVICE', 'python_service', 'Python risk engine → ket_qua_giam_dinh', 'LUAT_DU_LIEU');
    }

    if (/^DVKT-OP-/.test(maLuat)) {
        ganMeta('DVKT_OP', 'dvkt_op_giam_dinh', 'XML3 -> DVKT-OP (cung) -> operator', 'LUAT_CDHA');
    } else if (/^HC-/.test(maLuat)) {
        ganMeta('HANH_CHINH_BUILTIN', 'dong_co_giam_dinh', 'XML1 -> built-in hành chính', 'LUAT_HANH_CHINH');
    } else if (/^HC_/.test(maLuat)) {
        ganMeta('HANH_CHINH_HARDCODED', 'luat_hanh_chinh_hardcoded', 'XML1 -> hardcoded hành chính', 'LUAT_HANH_CHINH');
    } else if (/^(CLN-THUOC-|DM-THUOC-|DMBV-THUOC-)/.test(maLuat)) {
        ganMeta('THUOC_DANH_MUC_BUILTIN', 'dong_co_giam_dinh', 'XML2 -> built-in thuốc/danh mục', 'LUAT_THUOC');
    } else if (/^THUOC_/.test(maLuat)) {
        ganMeta('THUOC_HARDCODED', 'luat_thuoc_hardcoded', 'XML2 -> hardcoded thuốc', 'LUAT_THUOC');
    } else if (/^NS_/.test(maLuat)) {
        ganMeta('NHAN_SU_HARDCODED', 'luat_nhan_su_hardcoded', 'XML3 -> hardcoded/batch nhân sự', 'LUAT_NHAN_SU');
    } else if (/^CLN-PTTT-/.test(maLuat)) {
        ganMeta('PTTT_BUILTIN', 'dong_co_giam_dinh', 'XML3/XML5 -> built-in PTTT', 'LUAT_PTTT');
    } else if (/^(CLN-CDHA-|CLN-DVKT-)/.test(maLuat)) {
        ganMeta('CDHA_BUILTIN', 'dong_co_giam_dinh', 'XML3 -> built-in CDHA/DVKT', 'LUAT_CDHA');
    } else if (/^CLN-XDC-/.test(maLuat)) {
        ganMeta('XDC_BUILTIN', 'dong_co_giam_dinh', 'XML1↔XML2 đa tầng / đa biến', 'LUAT_DU_LIEU');
    } else if (/^ICD-TT06-/.test(maLuat)) {
        ganMeta('ICD10_TT06_BUILTIN', 'dong_co_giam_dinh', 'XML1 MA_BENH — TT 06/2026/BYT (danh mục ICD-10)', 'LUAT_DU_LIEU');
    } else if (/^ICD-KEP-/.test(maLuat)) {
        ganMeta('ICD10_MA_KEP_BUILTIN', 'icd10_ma_kep_giam_dinh', 'XML1 MA_BENH — mã kép ICD-10 (†/*)', 'LUAT_DU_LIEU');
    } else if (/^(DMBV-DVKT-|DM-DVKT-)/.test(maLuat)) {
        ganMeta('DVKT_DANH_MUC', 'dong_co_giam_dinh', 'XML3 -> kiểm tra danh mục DVKT', 'LUAT_CDHA');
    } else if (/^CHUYEN_DE[_-]/.test(maLuat)) {
        ganMeta('GIAM_DINH_CHUYEN_DE', 'luat_giam_dinh_chuyen_de_hardcoded', 'XML3 -> hardcoded kiểm tra chuyên đề', 'LUAT_GIAM_DINH_CHUYEN_DE');
    } else if (/^CDHA_/.test(maLuat)) {
        ganMeta('CDHA_HARDCODED', 'luat_cdha_hardcoded', 'XML3 -> hardcoded CDHA', 'LUAT_CDHA');
    } else if (/^DVKT_/.test(maLuat)) {
        ganMeta('PTTT_SEED', 'seed_luat_pttt_muc11', 'XML3 -> seed PTTT', 'LUAT_PTTT');
    }

    if (!namespaceQuyTac && phanHe === 'XML3') {
        ganMeta('XML3_KHAC', 'dong_co_giam_dinh', 'XML3 -> rule chưa phân loại chi tiết');
    }

    if (!namespaceQuyTac) {
        ganMeta('QUY_TAC_NOI_BO', 'dong_co_giam_dinh', 'Suy ra từ MA_LUAT / phân hệ XML');
    }
    if (!nguonQuyTac) {
        nguonQuyTac = 'dong_co_giam_dinh';
    }

    const tangV15 = suyRaTangV15TuCanhBao(loi, namespaceQuyTac);

    return {
        namespace_quy_tac: namespaceQuyTac,
        nguon_quy_tac: nguonQuyTac,
        luong_giai_trinh: luongGiaiTrinh,
        tab_quan_tri_goi_y: tabQuanTriGoiY,
        tang_V15: tangV15,
    };
};

const boSungNamespaceVaGiaiTrinhQuyTac = (danhSach = []) => (Array.isArray(danhSach) ? danhSach : []).map((loi) => {
    const meta = suyRaNamespaceVaNguonQuyTac(loi);
    return {
        ...loi,
        ...(meta.namespace_quy_tac ? { namespace_quy_tac: meta.namespace_quy_tac } : {}),
        ...(meta.nguon_quy_tac ? { nguon_quy_tac: meta.nguon_quy_tac } : {}),
        ...(meta.luong_giai_trinh ? { luong_giai_trinh: meta.luong_giai_trinh } : {}),
        ...(meta.tab_quan_tri_goi_y ? { tab_quan_tri_goi_y: meta.tab_quan_tri_goi_y } : {}),
        tang_V15: meta.tang_V15,
    };
});

// ============================================================
// [PHẦN 2] CHUẨN HÓA VÀ XỬ LÝ DỮ LIỆU
// ============================================================
const parseLieuDungThuoc = (lieuDungText, soLuongXuat) => {
    let tanSuat = 0, slMoiLan = 0, slMoiNgay = 0, soNgay = 0;
    let donViLieuDung = '', donViTongNgay = '';
    let rawText = String(lieuDungText || '');
    try {
        rawText = rawText.normalize('NFKC');
    } catch {
        /* ignore */
    }
    rawText = rawText.replace(/[０-９]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xff10 + 0x30));
    const rawTextLower = rawText.toLowerCase();
    const text = rawTextLower.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\u0111/g, 'd');
    /** Gỡ cụm "đối chiếu" để không khớp nhầm "chieu" / buổi chiều khi parse (không dùng lookbehind — Hermes cũ). */
    const textChoBuoi = text
        .replace(/\bdoi\s+chieu\b/gi, 'doi-khieu')
        .replace(/\blien\s+chieu\b/gi, 'lien-khieu');
    const slTong = TO_NUMBER(soLuongXuat);
    const parseSo = (raw) => parseFloat(String(raw || '0').replace(',', '.'));
    const extractByPattern = (regex, haystack = text) => {
        const match = haystack.match(regex);
        return match ? parseSo(match[1]) : 0;
    };
    /**
     * Liều theo buổi: ưu tiên "Sáng: 1 viên", "Chiều: 1" (dấu : hoặc ：), kể cả sau dấu phẩy/ghi chú.
     * Trước đây `chieu.*?(\d+)` khớp nhầm "chiếu" trong "đối chiếu" rồi lấy số (MA, mg…) làm liều.
     */
    const extractDoseBuoi = (timeKeyword) => {
        const kw = String(timeKeyword || '').toLowerCase();
        const hay = textChoBuoi;
        const soTrongNhom = (re) => {
            const m = hay.match(re);
            return m ? parseSo(m[1]) : 0;
        };
        const tuColon = soTrongNhom(new RegExp(`\\b${kw}\\s*[:：]\\s*(\\d+(?:[.,]\\d+)?)`, 'i'));
        if (tuColon > 0) return tuColon;
        const tuKhoang = soTrongNhom(new RegExp(`\\b${kw}\\b\\s+(\\d+(?:[.,]\\d+)?)`, 'i'));
        if (tuKhoang > 0) return tuKhoang;
        /** Không dùng legacy cho "chieu" — dễ ăn nhầm "… chiếu" trong cụm khác (đã tách doi/lien chieu ở trên). */
        if (kw === 'chieu') return 0;
        const legacy = new RegExp(`${kw}.*?(\\d+(?:[.,]\\d+)?)`, 'i');
        const mLegacy = hay.match(legacy);
        return mLegacy ? parseSo(mLegacy[1]) : 0;
    };
    const buoiSang = extractByPattern(/\bbuoi\s+sang\s*[:：]?\s*(\d+(?:[.,]\d+)?)/i, textChoBuoi);
    const buoiTrua = extractByPattern(/\bbuoi\s+trua\s*[:：]?\s*(\d+(?:[.,]\d+)?)/i, textChoBuoi);
    const buoiChieu = extractByPattern(/\bbuoi\s+chieu\s*[:：]?\s*(\d+(?:[.,]\d+)?)/i, textChoBuoi);
    const buoiToi = extractByPattern(/\bbuoi\s+toi\s*[:：]?\s*(\d+(?:[.,]\d+)?)/i, textChoBuoi);
    const sang = Math.max(extractDoseBuoi('sang'), buoiSang);
    const trua = Math.max(extractDoseBuoi('trua'), buoiTrua);
    const chieu = Math.max(extractDoseBuoi('chieu'), buoiChieu);
    const toi = Math.max(extractDoseBuoi('toi'), buoiToi);
    slMoiNgay = sang + trua + chieu + toi;
    if (sang > 0) tanSuat++;
    if (trua > 0) tanSuat++;
    if (chieu > 0) tanSuat++;
    if (toi > 0) tanSuat++;
    if (tanSuat > 0) slMoiLan = slMoiNgay / tanSuat;
    if (slMoiNgay === 0) {
        const matchTongNgay = text.match(/\*\s*(\d+(?:[.,]\d+)?)\s*ngay\b/i);
        const matchMoiLanVaLanNgay = text.match(/(\d+(?:[.,]\d+)?)\s*(vien|lo|ong|goi|chai|bom|ml|mg|g|gram|mcg|iu|ui)\s*\/\s*lan.*?(\d+(?:[.,]\d+)?)\s*lan\s*\/\s*ngay/i);
        const matchTongNgayTrongNgoac = text.match(/\[\s*(\d+(?:[.,]\d+)?)\s*(vien|lo|ong|goi|chai|bom|ml|mg|g|gram|mcg|iu|ui)\s*\/\s*ngay\s*\]/i);
        if (matchMoiLanVaLanNgay) {
            slMoiLan = parseSo(matchMoiLanVaLanNgay[1]);
            donViLieuDung = chuanHoaTokenDonViThuoc(matchMoiLanVaLanNgay[2]);
            tanSuat = parseSo(matchMoiLanVaLanNgay[3]);
            slMoiNgay = slMoiLan * tanSuat;
            donViTongNgay = donViLieuDung;
        } else if (matchTongNgayTrongNgoac) {
            slMoiNgay = parseSo(matchTongNgayTrongNgoac[1]);
            donViTongNgay = chuanHoaTokenDonViThuoc(matchTongNgayTrongNgoac[2]);
            tanSuat = tanSuat || 1;
            slMoiLan = slMoiLan || slMoiNgay;
            donViLieuDung = donViLieuDung || donViTongNgay;
        }
        const matchNgayLan = text.match(/ngay.*?(?:uong|dung|tiem|nho).*?(\d+(?:[.,]\d+)?).*?lan/i);
        const matchMoiLan = text.match(/moi\s+lan.*?(\d+(?:[.,]\d+)?)/i);
        if (matchNgayLan && tanSuat <= 0) tanSuat = parseSo(matchNgayLan[1]);
        if (matchMoiLan && slMoiLan <= 0) slMoiLan = parseSo(matchMoiLan[1]);
        // TT 37 / thực địa: "Ngày TMC 3 lần, mỗi lần 0,5gram (buổi sáng, …)" — không có từ khóa uống/dùng/tiêm nên matchNgayLan bỏ sót; "buổi sáng" không khớp nhánh Sáng: X viên.
        if (tanSuat <= 0) {
            const mTmc = text.match(/\btmc\s*(\d+(?:[.,]\d+)?)\s*lan\b/i);
            if (mTmc) tanSuat = parseSo(mTmc[1]);
        }
        if (tanSuat <= 0) {
            const mLanRoiMoiLan = text.match(/(\d+(?:[.,]\d+)?)\s*lan\s*,\s*moi\s+lan\b/i);
            if (mLanRoiMoiLan) tanSuat = parseSo(mLanRoiMoiLan[1]);
        }
        if (tanSuat <= 0 && slMoiLan > 0) {
            const buoiCoMat = ['sang', 'trua', 'chieu', 'toi'].filter((k) => new RegExp(`buoi\\s+${k}\\b`, 'i').test(text));
            if (buoiCoMat.length >= 2) tanSuat = buoiCoMat.length;
        }
        if (matchMoiLan && /moi\s+lan[^[\]]*gram\b/i.test(text) && !donViLieuDung) {
            donViLieuDung = 'g';
            donViTongNgay = 'g';
        }
        if (tanSuat > 0 && slMoiLan > 0) {
            slMoiNgay = tanSuat * slMoiLan;
        } else if (/\/ngay\b|\b1\s+ng(?:a|à)y\b/i.test(text)) {
            const matchVienNgay = text.match(/(\d+(?:[.,]\d+)?).*?(vien|lo|ong|goi|chai|bom|ml|mg|g|gram|mcg|iu|ui).*?ngay/i);
            if (matchVienNgay && slMoiNgay <= 0) {
                slMoiNgay = parseSo(matchVienNgay[1]);
                donViTongNgay = chuanHoaTokenDonViThuoc(matchVienNgay[2]);
                tanSuat = 1;
                slMoiLan = slMoiNgay;
                donViLieuDung = donViLieuDung || donViTongNgay;
            }
        }
        const soNgayText = matchTongNgay ? parseSo(matchTongNgay[1]) : extractByPattern(/trong\s+(\d+(?:[.,]\d+)?)\s*ngay/i);
        if (soNgayText > 0) soNgay = soNgayText;
    }
    if (soNgay <= 0 && slMoiNgay > 0) soNgay = slTong / slMoiNgay;
    return {
        TAN_SUAT: tanSuat,
        SL_MOI_LAN: slMoiLan,
        SL_MOI_NGAY: slMoiNgay,
        CALC_SL_MOI_NGAY: slMoiNgay,
        SO_NGAY: soNgay,
        DON_VI_LIEU_DUNG: donViLieuDung,
        DON_VI_TONG_NGAY: donViTongNgay || donViLieuDung,
    };
};

/** Số mg hoạt chất trên 1 đơn vị kê (viên/gói…) từ chuỗi HAM_LUONG (vd "200mg"). */
const layMgHamLuongTuHamLuong = (hamLuong) => {
    const m = String(hamLuong || '').match(/(\d+(?:[.,]\d+)?)\s*mg\b/i);
    return m ? parseFloat(String(m[1]).replace(',', '.')) : 0;
};

/**
 * Toa xuất viện (nội trú): thường kê cùng ngày ra viện; SO_LUONG mang về có thể > SL_MOI_NGAY×SO_NGAY
 * nếu SO_NGAY chỉ phản ánh ngày điều trị nội trú — không áp dụng THUOC_417 (chỉ khi trùng ngày YL và NGAY_RA).
 */
const laDongThuocToaXuatVienNoiTru = (xml1 = {}, row = {}) => {
    if (!row || !laHoSoNoiTruTheoQd824(xml1)) return false;
    if (IS_EMPTY(xml1?.NGAY_RA)) return false;
    const dRa = layNgayYYYYMMDDtuDongXML2Thuoc({ NGAY_YL: xml1.NGAY_RA, NGAY_TH_YL: xml1.NGAY_RA });
    if (dRa.length !== 8) return false;
    const dYl = layNgayYYYYMMDDtuDongXML2Thuoc(row);
    if (dYl.length !== 8) return false;
    return dRa === dYl;
};

const coLechDonViYLenhVaCapPhatThuoc = (row = {}) => {
    const donViCapPhat = chuanHoaTokenDonViThuoc(row?.DON_VI_TINH || '');
    const donViYLenh = chuanHoaTokenDonViThuoc(row?.DON_VI_TONG_NGAY || row?.DON_VI_LIEU_DUNG || '');
    if (!donViCapPhat || !donViYLenh) return false;
    if (donViCapPhat === donViYLenh) return coDauHieuDonViCapPhatDangKhaiTheoHamLuongDonVi(row);
    if (laDonViDongGoiThuoc(donViCapPhat) && laDonViKhoiLuongTheTichThuoc(donViYLenh)) return true;
    if (laDonViKhoiLuongTheTichThuoc(donViCapPhat) && laDonViDongGoiThuoc(donViYLenh)) return true;
    return false;
};

const layGiaTriAnToan = (obj, tuKhoa) => {
    if (!obj) return '';
    const chuanHoaKhoa = (s) => String(s || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');
    const tuKhoaChuan = chuanHoaKhoa(tuKhoa);
    const keyTimThay = Object.keys(obj).find(k => chuanHoaKhoa(k) === tuKhoaChuan);
    if (!keyTimThay) return '';
    const val = obj[keyTimThay];
    return val === undefined || val === null ? '' : val;
};

/** Giá trúng thầu / BHYT tham chiếu trên DM thuốc Mẫu 03 nội bộ — ưu tiên GIA_BH_TT, sau đó DON_GIA_TT, rồi các cột dự phòng. */
const layGiaTrungThauNoiBoTuDmThuocM03 = (dmT) => {
    if (!dmT || typeof dmT !== 'object') return 0;
    const khoaGia = ['GIA_BH_TT', 'GIA_BH', 'DON_GIA_TT', 'DON_GIA_THAU', 'DON_GIA', 'GIA'];
    for (const k of khoaGia) {
        const raw = layGiaTriAnToan(dmT, k);
        if (raw === undefined || raw === null || String(raw).trim() === '') continue;
        const n = TO_NUMBER(raw);
        if (n > 0) return n;
    }
    return 0;
};

/** Tên thuốc trên dòng XML2 (QĐ 130 thường dùng TEN_THUOC). */
const layTenThuocTuDongXml2 = (row = {}) => String(row.TEN_THUOC || row.TEN_DICH_VU || row.TEN_PTHAU || '').trim();

const chuanHoaChuoiSoKhopChiTietM03 = (s) => String(s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();

const tenThuocM03KhopXml2 = (rowXml, rowDm) => {
    const a = chuanHoaChuoiSoKhopChiTietM03(layTenThuocTuDongXml2(rowXml));
    const b = chuanHoaChuoiSoKhopChiTietM03(layGiaTriAnToan(rowDm, 'TEN_THUOC') || rowDm.TEN_THUOC);
    if (!a && !b) return true;
    if (!a || !b) return false;
    return a === b || a.includes(b) || b.includes(a);
};

const donViTinhM03KhopXml2 = (rowXml, rowDm) => {
    const a = chuanHoaTokenDonViThuoc(layGiaTriAnToan(rowXml, 'DON_VI_TINH') || rowXml.DON_VI_TINH);
    const b = chuanHoaTokenDonViThuoc(layGiaTriAnToan(rowDm, 'DON_VI_TINH') || rowDm.DON_VI_TINH);
    if (!a && !b) return true;
    if (!a || !b) return false;
    return a === b;
};

const hamLuongM03KhopXml2 = (rowXml, rowDm) => {
    const a = chuanHoaChuoiSoKhopChiTietM03(layGiaTriAnToan(rowXml, 'HAM_LUONG') || rowXml.HAM_LUONG);
    const b = chuanHoaChuoiSoKhopChiTietM03(layGiaTriAnToan(rowDm, 'HAM_LUONG') || rowDm.HAM_LUONG);
    if (!a && !b) return true;
    if (!a || !b) return false;
    return a === b || a.includes(b) || b.includes(a);
};

/**
 * Cùng MA_THUOC nhưng Mẫu 03 nhiều dòng: chọn dòng khớp TEN_THUOC + DON_VI_TINH + HAM_LUONG với XML2
 * (tránh lấy nhầm GIA_BH_TT từ dòng khác cùng mã).
 * @returns {object|null} null nếu >1 dòng cùng mã mà không bám đủ 3 trường — không dùng giá tùy ý.
 */
const chonDongMau03KhopChiTietVsXml2 = (rowsCungMa, rowXml) => {
    if (!Array.isArray(rowsCungMa) || rowsCungMa.length === 0) return null;
    if (rowsCungMa.length === 1) return rowsCungMa[0];
    const khop = rowsCungMa.filter(
        (r) => tenThuocM03KhopXml2(rowXml, r) && donViTinhM03KhopXml2(rowXml, r) && hamLuongM03KhopXml2(rowXml, r),
    );
    if (khop.length === 1) return khop[0];
    if (khop.length > 1) return khop[0];
    return null;
};

const standardizeValue = (val, keyName) => {
    if (val === null || val === undefined) return "";
    const keyUpper = String(keyName || "").toUpperCase();
    /** CCCD / định danh: luôn chuỗi, không ép parseFloat (tránh mất số 0 đầu khi giá trị từng là số). */
    if (keyUpper === 'SO_CCCD' || keyUpper === 'SO_DINH_DANH') {
        return String(val).replace(/<!\[CDATA\[(.*?)\]\]>/is, '$1').trim().replace(/\s+/g, '');
    }
    let cleaned = String(val).replace(/<!\[CDATA\[(.*?)\]\]>/is, '$1').trim();
    const codePrefixes = ['MA_', 'SO_', 'NGAY_'];
    if (codePrefixes.some(p => keyUpper.startsWith(p)) && !keyUpper.includes('TEN') && !keyUpper.includes('DIA_CHI') && !keyUpper.includes('GHI_CHU')) {
        cleaned = cleaned.replace(/\s+/g, '');
    }
    if (keyUpper === 'MA_LOAI_KCB') return normalizeMaLoaiKcb(cleaned);
    const numericKeys = ['T_THUOC','T_VTYT','T_DVKT','T_KHAM','T_GIUONG','T_PTTT','T_XN','T_CDHA','T_TONGCHI','T_BHTT','T_BNCCT','T_NGUONKHAC','SO_LUONG','DON_GIA','THANH_TIEN','TYLE_TT','MUC_HUONG','T_TRANTT','SO_NGAY_DTRI'];
    if (numericKeys.includes(keyUpper) && cleaned !== "" && !isNaN(cleaned)) return parseFloat(cleaned);
    return cleaned;
};

const prepareData = (obj) => {
    if (!obj || typeof obj !== 'object') return {};
    let result = {};
    for (let k in obj) result[k] = standardizeValue(obj[k], k);
    if (IS_EMPTY(result.KET_QUA_DTRI) && !IS_EMPTY(result.MA_LOAI_RV)) {
        result.KET_QUA_DTRI = result.MA_LOAI_RV;
    }
    if (IS_EMPTY(result.MA_BENH) && !IS_EMPTY(result.MA_BENH_CHINH)) {
        result.MA_BENH = result.MA_BENH_CHINH;
    }
    if (IS_EMPTY(result.MA_BENHKEM) && !IS_EMPTY(result.MA_BENH_KT)) {
        result.MA_BENHKEM = result.MA_BENH_KT;
    }
    // Đồng nghĩa cột QĐ 130/3176 ↔ tên tắt trong quy tắc No-Code (XML gửi BHXH vẫn dùng tên chuẩn)
    if (!IS_EMPTY(result.MATINH_CU_TRU) && IS_EMPTY(result.MA_TINH)) {
        result.MA_TINH = result.MATINH_CU_TRU;
    }
    if (!IS_EMPTY(result.MA_DICH_VU) && IS_EMPTY(result.MA_DV)) {
        result.MA_DV = result.MA_DICH_VU;
    }
    if (!IS_EMPTY(result.MA_VAT_TU) && IS_EMPTY(result.MA_VTYT)) {
        result.MA_VTYT = result.MA_VAT_TU;
    }
    if (!IS_EMPTY(result.GIOI_TINH) && IS_EMPTY(result.MA_GIOI_TINH)) {
        result.MA_GIOI_TINH = result.GIOI_TINH;
    }
    if (!IS_EMPTY(result.MA_LY_DO_VNT) && IS_EMPTY(result.MA_LY_DO_VVIEN)) {
        result.MA_LY_DO_VVIEN = result.MA_LY_DO_VNT;
    }
    // QĐ 130: MA_LYDO_VVIEN / MA_LY_DO_VVIEN là mã chuẩn; MA_LY_DO_VV dùng trong nhiều luật DSL — ưu tiên đồng bộ từ đây trước LY_DO_VV (có thể là mô tả).
    if (IS_EMPTY(result.MA_LY_DO_VV) && !IS_EMPTY(result.MA_LYDO_VVIEN)) {
        result.MA_LY_DO_VV = String(result.MA_LYDO_VVIEN).trim();
    }
    if (IS_EMPTY(result.MA_LY_DO_VV) && !IS_EMPTY(result.MA_LY_DO_VVIEN)) {
        result.MA_LY_DO_VV = String(result.MA_LY_DO_VVIEN).trim();
    }
    if (!IS_EMPTY(result.LY_DO_VV) && IS_EMPTY(result.MA_LY_DO_VV)) {
        result.MA_LY_DO_VV = result.LY_DO_VV;
    }
    if (!IS_EMPTY(result.TEN_DICH_VU) && IS_EMPTY(result.TEN_DV)) {
        result.TEN_DV = result.TEN_DICH_VU;
    }
    if (!IS_EMPTY(result.DUONG_DUNG) && IS_EMPTY(result.MA_DUONG_DUNG)) {
        result.MA_DUONG_DUNG = result.DUONG_DUNG;
    }
    // Tuổi theo ngày/năm (quy tắc thuốc nhi): suy từ NGAY_SINH và mốc đợt KCB
    if (!IS_EMPTY(result.NGAY_SINH)) {
        const moc = result.NGAY_VAO || result.NGAY_RA || result.NGAY_TTOAN || '';
        if (!IS_EMPTY(moc)) {
            if (IS_EMPTY(result.TUOI_NGAY)) {
                result.TUOI_NGAY = DIFF_DAYS(result.NGAY_SINH, moc);
            }
            if (IS_EMPTY(result.TUOI_NAM)) {
                result.TUOI_NAM = DIFF_YEARS(result.NGAY_SINH, moc);
            }
        }
    }
    return result;
};

const enrichXML2Data = (row) => {
    const base = prepareData(row);
    const lieuParsed = parseLieuDungThuoc(base.LIEU_DUNG, base.SO_LUONG);
    const out = { ...base, ...lieuParsed };
    // MA_HOAT_CHAT không có trên XML2 theo QĐ 3176; quy tắc Mục 8 cần mã hoạt chất BYT — suy từ MA_THUOC khi CSKCB khai trùng mã (bổ sung map DM sau nếu lệch)
    if (IS_EMPTY(out.MA_HOAT_CHAT) && !IS_EMPTY(out.MA_THUOC)) {
        out.MA_HOAT_CHAT = String(out.MA_THUOC).trim();
    }
    out.GHI_CHU_BN = base.GHI_CHU;
    const gopGhiChu = [out.LIEU_DUNG, out.CACH_DUNG, out.DU_PHONG].filter((x) => !IS_EMPTY(x)).join(' ');
    if (IS_EMPTY(out.GHI_CHU)) {
        out.GHI_CHU = gopGhiChu;
    }
    out.MA_GIA = out.DON_GIA;
    out.TRANG_THAI = IS_EMPTY(out.NGAY_TH_YL) ? 'CHUA_MUA' : 'DA_MUA';
    const tbt = TO_NUMBER(out.T_BHTT);
    out.T_TRANTT = Number.isFinite(tbt) ? tbt : 0;
    if (IS_EMPTY(out.NGUON_GOC_YHCT)) {
        out.NGUON_GOC_YHCT = String(out.DU_PHONG || '');
    }
    const soNgay = TO_NUMBER(out.SO_NGAY) || 0;
    const soLuong = TO_NUMBER(out.SO_LUONG) || 0;
    out.SO_LUONG_NGAY = soNgay > 0 ? soLuong / soNgay : soLuong;
    if (IS_EMPTY(out.LOAI_THUOC)) {
        const u = `${out.TEN_THUOC || ''} ${out.CACH_DUNG || ''} ${out.LIEU_DUNG || ''}`;
        if (!IS_EMPTY(out.MA_PP_CHEBIEN)) {
            out.LOAI_THUOC = 'CP_YHCT';
        } else if (/thuốc thang|thang thuốc|vị thuốc|YHCT/i.test(u)) {
            out.LOAI_THUOC = 'THUOC_THANG';
        } else if (/pha chế|phache|pha che/i.test(u) && /YHCT|y học cổ|cổ truyền/i.test(u)) {
            out.LOAI_THUOC = 'PHA_CHE_YHCT';
        } else if (/pha chế|phache|pha che/i.test(u)) {
            out.LOAI_THUOC = 'PHA_CHE';
        } else if (/thực phẩm|TPCN|bảo vệ sức khỏe/i.test(u)) {
            out.LOAI_THUOC = 'TPCN';
        } else if (/sinh phẩm|biosimilar/i.test(u)) {
            out.LOAI_THUOC = 'SINH_PHAM';
        } else if (/vị thuốc|vi thuốc/i.test(u)) {
            out.LOAI_THUOC = 'VI_THUOC';
        } else {
            out.LOAI_THUOC = '';
        }
    }
    const _mg = layMgHamLuongTuHamLuong(out.HAM_LUONG);
    const _slNgay = TO_NUMBER(out.SL_MOI_NGAY) || 0;
    const _slLan = TO_NUMBER(out.SL_MOI_LAN) || 0;
    if (_mg > 0) {
        out.TONG_LIEU_24H = _mg * _slNgay;
        out.TONG_LIEU_1_LAN = _mg * _slLan;
    } else {
        out.TONG_LIEU_24H = 0;
        out.TONG_LIEU_1_LAN = 0;
    }
    return out;
};

const safeProxy = (obj) => new Proxy(obj, { get: (t, p) => p in t ? t[p] : "" });

const layCacheChunk = (key) => {
    const hit = cache_ChunkDuLieu.get(key);
    if (!hit) return null;
    if (hit.expiredAt <= Date.now()) {
        cache_ChunkDuLieu.delete(key);
        return null;
    }
    return hit.value;
};

const datCacheChunk = (key, value) => {
    cache_ChunkDuLieu.set(key, {
        value,
        expiredAt: Date.now() + STORAGE_CACHE_TTL_MS,
    });
};

const laKhoaDanhMucTaiKho = (key = '') => {
    const raw = String(key || '').trim();
    if (!raw) return false;
    if (raw === 'THONG_TIN_CO_SO') return true;
    return raw.startsWith('DANH_MUC_') || raw.startsWith('BYT_7603_') || raw.startsWith('COLS_') || raw.startsWith('BYT_7603_COLS_');
};

const fetchChunkedData = async (key) => {
    const cached = layCacheChunk(key);
    if (cached) return cached;
    const inFlight = cache_ChunkDuLieuDangNap.get(key);
    if (inFlight) return inFlight;

    const loader = (async () => {
    try {
        if (laKhoaDanhMucTaiKho(key)) {
            const data = await docDanhMucTuKho(key, []);
            datCacheChunk(key, data);
            return data;
        }
        const chunksStr = await AsyncStorage.getItem(`${key}_CHUNKS`);
        if (chunksStr) {
            const totalChunks = parseInt(chunksStr, 10);
            let fullData = [];
            const chunkKeys = Array.from({ length: totalChunks }, (_, i) => `${key}_CHUNK_${i}`);
            const chunkPairs = await AsyncStorage.multiGet(chunkKeys);
            chunkPairs.forEach(([, chunkStr]) => {
                if (chunkStr) fullData = fullData.concat(JSON.parse(chunkStr));
            });
            datCacheChunk(key, fullData);
            return fullData;
        }
        const raw = await AsyncStorage.getItem(key);
        const parsed = raw ? JSON.parse(raw) : [];
        datCacheChunk(key, parsed);
        return parsed;
    } catch (_e) { return []; }
    finally {
        cache_ChunkDuLieuDangNap.delete(key);
    }
    })();

    cache_ChunkDuLieuDangNap.set(key, loader);
    return loader;
};

const normalizeRuleList = (rawRules) => {
    if (Array.isArray(rawRules)) return rawRules;
    if (!rawRules || typeof rawRules !== 'object') return [];
    if (Array.isArray(rawRules.data)) return rawRules.data;
    if (Array.isArray(rawRules.rules)) return rawRules.rules;
    return [];
};

const trichXuatMetaLỗiTinh = (message = '') => {
    const phanHe = (String(message).match(/XML[1-6]/i) || ['XML1'])[0].toUpperCase();
    const dongMatch = String(message).match(/Dong\s+(\d+)/i);
    const index = dongMatch ? Math.max(0, Number(dongMatch[1]) - 1) : -1;
    const fieldMatch = String(message).match(/\[([A-Z0-9_]+)\]/);
    const truong = fieldMatch ? fieldMatch[1] : 'CAU_TRUC';
    return { phanHe, index, truong };
};

const layLỗiCauTrucTienXuLy = (hoSo) => {
    const ketQua = kiemTraDinhDangXML(hoSo);
    if (!ketQua || ketQua.hop_le) return [];

    if (Array.isArray(ketQua.chi_tiet_loi) && ketQua.chi_tiet_loi.length > 0) {
        return ketQua.chi_tiet_loi.map((loi, idx) => ({
            phan_he: loi.phan_he || 'XML1',
            index: typeof loi.index === 'number' ? loi.index : -1,
            truong_loi: loi.truong_loi || 'CAU_TRUC',
            canh_bao: loi.canh_bao || 'Lỗi cấu trúc dữ liệu XML.',
            muc_do: loi.muc_do || 'Error',
            ma_luat: loi.ma_luat || `STRUCT-${idx + 1}`,
            ten_quy_tac: loi.ten_quy_tac || 'Kiểm tra cấu trúc XML theo QD3176',
            dieu_kien: loi.dieu_kien || 'STATIC',
        }));
    }

    const dsThongBao = Array.isArray(ketQua.danh_sach_loi) ? ketQua.danh_sach_loi : [];
    return dsThongBao.map((message, idx) => {
        const meta = trichXuatMetaLỗiTinh(message);
        return {
            phan_he: meta.phanHe,
            index: meta.index,
            truong_loi: meta.truong,
            canh_bao: String(message || 'Lỗi cấu trúc dữ liệu XML.'),
            muc_do: 'Error',
            ma_luat: `STRUCT-${idx + 1}`,
            ten_quy_tac: 'Kiểm tra cấu trúc XML theo QD3176',
            dieu_kien: 'STATIC',
        };
    });
};

const chuanHoaChuoiGomCanhBao = (s) => chuanHoaKhoaCanhBaoDedupe(s);

/**
 * Gộp các dòng cảnh báo trùng trên cùng một hồ sơ: cùng mã luật + cùng nội dung cảnh báo (sau chuẩn hóa),
 * bất kể XML2/XML3 dòng index (tránh 10+ dòng giống hệt do lỗi mẫu tin nhắn / trùng engine).
 * Gọi sau boSungChiTietCanhBaoGiaiTrinh.
 */
export const gomTrungLapCanhBaoTheoMaLuatVaNoiDung = (danhSach = []) => {
    if (!Array.isArray(danhSach) || danhSach.length <= 1) return danhSach || [];
    const seen = new Set();
    const ketQua = [];
    for (let i = 0; i < danhSach.length; i += 1) {
        const loi = danhSach[i];
        const ma = String(loi?.ma_luat || '').trim().toUpperCase() || 'KHONG_MA_LUAT';
        const canh = chuanHoaChuoiGomCanhBao(loi?.canh_bao);
        const key = `${ma}::${canh}`;
        if (seen.has(key)) continue;
        seen.add(key);
        ketQua.push(loi);
    }
    return ketQua;
};

// ============================================================
// [PHẦN 3] TẢI DANH MỤC BV + BYT → MAP O(1)
// ============================================================
/** Từ mảng dòng phác đồ CDSS → Map mã ICD → có trong kho tri thức nội bộ (một mã = một dòng hợp lệ). */
const taoMetaPhacDoCdssTuBang = (rows) => {
    const arr = Array.isArray(rows) ? rows : [];
    const map = new Map();
    const cotIcd = 'MÃ ICD-10';
    arr.forEach((row) => {
        const v = row?.[cotIcd] ?? row?.['MA ICD-10'];
        const k = chuanHoaMaIcdPhacDoCdss(v);
        if (k) map.set(k, true);
    });
    return {
        MAP_PHAC_DO_CDSS: map,
        SO_DONG_PHAC_DO_CDSS: map.size,
        CO_KHO_PHAC_DO_CDSS: map.size > 0,
    };
};

const reMaTrongNgoacTuongTacThuoc = /\[([^\]]+)\]/g;

/** Mã trong ngoặc vuông [40.xxx] trong nội dung tương tác (thứ tự xuất hiện, không trùng). */
const trichDanhSachMaTrongNgoacTuNoiDungTT = (text) => {
    const out = [];
    const seen = new Set();
    const s = String(text || '');
    reMaTrongNgoacTuongTacThuoc.lastIndex = 0;
    let m;
    while ((m = reMaTrongNgoacTuongTacThuoc.exec(s)) !== null) {
        const code = UPPER(String(m[1] || '').trim());
        if (!code || seen.has(code)) continue;
        seen.add(code);
        out.push(code);
    }
    return out;
};

/** Tách «bên trái» và «bên phải» theo từ khóa « vs » (không phân biệt hoa thường). */
const tachHaiBenTheoVsNoiDungTT = (noiDung) => {
    const nd = String(noiDung || '');
    const match = nd.match(/\s+vs\s+/i);
    if (!match || match.index === undefined) return null;
    return {
        trai: nd.slice(0, match.index),
        phai: nd.slice(match.index + match[0].length),
    };
};

const MUC_DO_TUONG_TAC_ORDER_META = { Critical: 3, Error: 2, Warning: 1 };

const chuanHoaMucDoCanhBaoTuongTacThuoc = (raw, rowGoiY = null) => {
    const u = UPPER(String(raw || '').trim());
    if (u === 'CRITICAL' || u === 'NGHIEM_TRONG' || u === 'NGHIÊM_TRỌNG') return 'Critical';
    if (u === 'ERROR' || u === 'LOI' || u === 'LỖI') return 'Error';
    if (u === 'WARNING' || u === 'CANH BÁO' || u === 'CANH BAO') return 'Warning';
    if (u) return 'Warning';
    const cb = String(rowGoiY?.CANH_BAO_HE_THONG || '');
    if (/🚫|CHỐNG\s*CHỈ\s*ĐỊNH|CHONG\s*CHI\s*DINH/i.test(cb)) return 'Critical';
    return 'Warning';
};

/** Khi hai dòng sinh cùng một cặp mã: giữ mức độ nghiêm trọng hơn, rồi cảnh báo chi tiết hơn. */
const gopMetaTuongTacTrungCap = (current, incoming) => {
    if (!current) return incoming;
    const oC = MUC_DO_TUONG_TAC_ORDER_META[chuanHoaMucDoCanhBaoTuongTacThuoc(current.MUC_DO_CANH_BAO)] || 1;
    const oI = MUC_DO_TUONG_TAC_ORDER_META[chuanHoaMucDoCanhBaoTuongTacThuoc(incoming.MUC_DO_CANH_BAO)] || 1;
    if (oI > oC) return incoming;
    if (oI < oC) return current;
    const lenI = (incoming.CANH_BAO_HE_THONG || '').length;
    const lenC = (current.CANH_BAO_HE_THONG || '').length;
    if (lenI > lenC) return incoming;
    return current;
};

/**
 * Từ một dòng danh mục: danh sách khóa cặp mã đã sắp xếp (a|b, a<=b theo chuỗi).
 * — Nếu «Nội dung» có dạng «… vs …»: lấy mã trong ngoặc hai bên, tích chéo (bên trái × bên phải);
 *   một bên không có ngoặc thì dùng MA_THUOC_A / MA_THUOC_B tương ứng nếu có.
 * — Ngược lại: nếu đủ MA_THUOC_A và MA_THUOC_B thì một cặp; không thì mọi cặp từ các mã trong ngoặc (fallback).
 */
const taoDanhSachCapMaTuHangTuongTacThuoc = (r) => {
    const a = UPPER(r?.MA_THUOC_A);
    const b = UPPER(r?.MA_THUOC_B);
    const nd = String(r?.NOI_DUNG_TUONG_TAC || '');
    const capSet = new Set();
    const themCap = (x, y) => {
        if (!x || !y || x === y) return;
        capSet.add([x, y].sort().join('|'));
    };
    const hai = tachHaiBenTheoVsNoiDungTT(nd);
    if (hai) {
        let maTrai = trichDanhSachMaTrongNgoacTuNoiDungTT(hai.trai);
        let maPhai = trichDanhSachMaTrongNgoacTuNoiDungTT(hai.phai);
        if (maTrai.length === 0 && a) maTrai = [a];
        if (maPhai.length === 0 && b) maPhai = [b];
        if (maTrai.length > 0 && maPhai.length > 0) {
            maTrai.forEach((x) => maPhai.forEach((y) => themCap(x, y)));
            return Array.from(capSet);
        }
    }
    if (a && b) {
        themCap(a, b);
        return Array.from(capSet);
    }
    const tat = trichDanhSachMaTrongNgoacTuNoiDungTT(nd);
    for (let i = 0; i < tat.length; i += 1) {
        for (let j = i + 1; j < tat.length; j += 1) {
            themCap(tat[i], tat[j]);
        }
    }
    return Array.from(capSet);
};

/** Danh mục tương tác thuốc nội bộ: cặp MA_THUOC (không hướng) → mô tả cảnh báo + mức độ */
const taoMetaTuongTacThuocTuBang = (rows) => {
    const MAP_TUONG_TAC_CAP = new Map();
    if (!Array.isArray(rows)) {
        return { MAP_TUONG_TAC_CAP, SO_CAP_TUONG_TAC: 0, CO_BANG_TUONG_TAC: false };
    }
    rows.forEach((r) => {
        const tt = UPPER(r?.TRANG_THAI);
        if (tt === 'OFF' || tt === '0' || tt === 'FALSE' || tt === 'TAT') return;
        const capPkList = taoDanhSachCapMaTuHangTuongTacThuoc(r);
        if (capPkList.length === 0) return;
        const meta = {
            MA_TUONG_TAC: String(r?.MA_TUONG_TAC || '').trim(),
            CANH_BAO_HE_THONG: String(r?.CANH_BAO_HE_THONG || '').trim(),
            NOI_DUNG_TUONG_TAC: String(r?.NOI_DUNG_TUONG_TAC || '').trim(),
            MUC_DO_CANH_BAO: chuanHoaMucDoCanhBaoTuongTacThuoc(r?.MUC_DO_CANH_BAO, r),
        };
        capPkList.forEach((pk) => {
            const prev = MAP_TUONG_TAC_CAP.get(pk);
            MAP_TUONG_TAC_CAP.set(pk, gopMetaTuongTacTrungCap(prev, meta));
        });
    });
    return {
        MAP_TUONG_TAC_CAP,
        SO_CAP_TUONG_TAC: MAP_TUONG_TAC_CAP.size,
        CO_BANG_TUONG_TAC: MAP_TUONG_TAC_CAP.size > 0,
    };
};

/** Thẻ mapping nghiệp vụ ICD-10 → thuốc (AsyncStorage CATALOG_MAP_V1__ICD_DRUG) */
const KHOA_CATALOG_ICD_DRUG = 'CATALOG_MAP_V1__ICD_DRUG';
/** ICD-10 chống chỉ định với thuốc — cùng schema dòng mapping (nguồn = ICD cấm, đích = MA_THUOC); shard riêng. */
const KHOA_CATALOG_ICD_DRUG_CONTRA = 'CATALOG_MAP_V1__ICD_DRUG_CONTRA';

const layMaThuocTuRowMappingIcdDrug = (row) => {
    const md = row.metadata && typeof row.metadata === 'object' ? row.metadata : {};
    if (Array.isArray(md.target_codes) && md.target_codes.length) {
        return md.target_codes.map((c) => String(c || '').trim()).filter(Boolean);
    }
    return tachChuoiNhieuMa(String(row.target_code || ''));
};

const taoMetaTuBangMappingIcdThuoc = (rowsRaw) => {
    const fromStorage = Array.isArray(rowsRaw) ? rowsRaw : [];
    const seedArr = Array.isArray(seedIcdDrugContraBhyt) ? seedIcdDrugContraBhyt : [];
    const rows = [...seedArr, ...fromStorage];
    const icdDrug = rows.filter((r) => String(r.mapping_type || '').trim().toUpperCase() === 'ICD_DRUG');
    const icdDrugContra = rows.filter((r) => String(r.mapping_type || '').trim().toUpperCase() === 'ICD_DRUG_CONTRA');
    const setMa = new Set();
    icdDrug.forEach((row) => {
        if (row.is_active === false) return;
        layMaThuocTuRowMappingIcdDrug(row).forEach((t) => {
            if (t) setMa.add(t);
        });
    });
    const setMaCd = new Set();
    icdDrugContra.forEach((row) => {
        if (row.is_active === false) return;
        layMaThuocTuRowMappingIcdDrug(row).forEach((t) => {
            if (t) setMaCd.add(t);
        });
    });
    return {
        DM_MAPPING_ICD_THUOC_ROWS: icdDrug,
        DM_MAPPING_ICD_THUOC_CD_ROWS: icdDrugContra,
        SET_MA_THUOC_CO_MAPPING_ICD: setMa,
        SET_MA_THUOC_CO_MAPPING_ICD_CD: setMaCd,
    };
};

const taiDanhMucHeThong = async () => {
    if (cache_DanhMucHeThong) {
        const [phacRows, tuongTacRowsRaw, mappingRowsDrug, mappingRowsCd, congKhamBvRows] = await Promise.all([
            fetchChunkedData('CDSS_DATA_PHAC_DO_V3'),
            fetchChunkedData('DANH_MUC_TUONG_TAC_THUOC'),
            fetchChunkedData(KHOA_CATALOG_ICD_DRUG),
            fetchChunkedData(KHOA_CATALOG_ICD_DRUG_CONTRA),
            fetchChunkedData('DANH_MUC_CONG_KHAM_BV'),
        ]);
        const mappingRows = [
            ...(Array.isArray(mappingRowsDrug) ? mappingRowsDrug : []),
            ...(Array.isArray(mappingRowsCd) ? mappingRowsCd : []),
        ];
        let tuongTacRows = tuongTacRowsRaw;
        if (!Array.isArray(tuongTacRows) || tuongTacRows.length === 0) {
            tuongTacRows = Array.isArray(tuongTacThuocSeed?.data) ? tuongTacThuocSeed.data : [];
        }
        tuongTacRows = chuanHoaBangTuongTacKhongTrungKey(tuongTacRows);
        const base = {
            ...cache_DanhMucHeThong,
            ...taoMetaPhacDoCdssTuBang(phacRows),
            ...taoMetaTuongTacThuocTuBang(tuongTacRows),
            ...taoMetaTuBangMappingIcdThuoc(mappingRows),
            DM_TUONG_TAC_THUOC_ROWS: tuongTacRows,
            DM_KHAM: buildDmKhamHeThong(congKhamBvRows),
            DM_CONG_KHAM_BV_ROWS: Array.isArray(congKhamBvRows) ? congKhamBvRows : [],
        };
        if (!Array.isArray(base.DM_ICD10_CAP_CUU_ROWS) || base.DM_ICD10_CAP_CUU_ROWS.length === 0) {
            base.DM_ICD10_CAP_CUU_ROWS = DANH_MUC_ICD10_CAP_CUU;
        }
        return base;
    }
    try {
        const [icd10Arr, dvktArr, thuocArr, vtytArr, khoaArrRaw, icdKeDonTren30NgayArr, nhanSuArr, icdCapCuuArr, maTheQuyenLoiArr, thuocDieuKienTtArr, congKhamBvArr] = await Promise.all([
            fetchChunkedData('DANH_MUC_ICD10'),
            fetchChunkedData('DANH_MUC_DVKT_M05'),
            fetchChunkedData('DANH_MUC_THUOC_MAU_M03'),
            fetchChunkedData('DANH_MUC_VAT_TU_M04'),
            fetchChunkedData('DANH_MUC_KHOA_LS_M01'),
            fetchChunkedData('DANH_MUC_ICD10_KE_DON_TREN_30_NGAY'),
            fetchChunkedData('DANH_MUC_NHAN_SU'),
            fetchChunkedData('DANH_MUC_ICD10_CAP_CUU'),
            fetchChunkedData('DANH_MUC_MA_THE_QUYEN_LOI'),
            fetchChunkedData('DANH_MUC_THUOC_DIEU_KIEN_TT'),
            fetchChunkedData('DANH_MUC_CONG_KHAM_BV'),
        ]);
        const [pl1,pl2,pl3,pl4,pl5,pl6,pl7,pl8,pl9,pl10,pl11,pl12] = await Promise.all([
            fetchChunkedData('BYT_7603_PL1_DVKT'), fetchChunkedData('BYT_7603_PL2_KHAM'),
            fetchChunkedData('BYT_7603_PL3_GIUONG'), fetchChunkedData('BYT_7603_PL4_GIUONG_BN'),
            fetchChunkedData('BYT_7603_PL5_THUOC'), fetchChunkedData('BYT_7603_PL6_THUOC_YHCT'),
            fetchChunkedData('BYT_7603_PL7_BENH_YHCT'), fetchChunkedData('BYT_7603_PL8_VTYT'),
            fetchChunkedData('BYT_7603_PL9_MAU'), fetchChunkedData('BYT_7603_PL10_DOI_TUONG'),
            fetchChunkedData('BYT_7603_PL11_CLS'), fetchChunkedData('BYT_7603_PL12_NHIEN_LIEU')
        ]);

        const buildMap = (arr, keyField) => {
            const m = new Map();
            if (Array.isArray(arr)) arr.forEach(i => { if (i[keyField]) m.set(String(i[keyField]).trim().toUpperCase(), i); });
            return m;
        };
        const buildMapMulti = (arr, ...keys) => {
            const m = new Map();
            if (Array.isArray(arr)) arr.forEach(i => {
                for (const k of keys) { if (i[k]) { m.set(String(i[k]).trim().toUpperCase(), i); break; } }
            });
            return m;
        };
        const buildAliasMap = (arr, ...keys) => {
            const m = new Map();
            if (Array.isArray(arr)) arr.forEach(i => {
                keys.forEach((k) => {
                    if (!i[k]) return;
                    m.set(String(i[k]).trim().toUpperCase(), i);
                });
            });
            return m;
        };

        const khoaArr = Array.isArray(khoaArrRaw) ? khoaArrRaw : [];
        const boQuyTacDoiTuongKcb = taoBoQuyTacDoiTuongKcb(pl10);

        const phacDoRows = await fetchChunkedData('CDSS_DATA_PHAC_DO_V3');
        const metaPhacDo = taoMetaPhacDoCdssTuBang(phacDoRows);

        let tuongTacRows = await fetchChunkedData('DANH_MUC_TUONG_TAC_THUOC');
        if (!Array.isArray(tuongTacRows) || tuongTacRows.length === 0) {
            tuongTacRows = Array.isArray(tuongTacThuocSeed?.data) ? tuongTacThuocSeed.data : [];
        }
        tuongTacRows = chuanHoaBangTuongTacKhongTrungKey(tuongTacRows);
        const metaTuongTac = taoMetaTuongTacThuocTuBang(tuongTacRows);

        const [mappingRowsDrug, mappingRowsCd] = await Promise.all([
            fetchChunkedData(KHOA_CATALOG_ICD_DRUG),
            fetchChunkedData(KHOA_CATALOG_ICD_DRUG_CONTRA),
        ]);
        const mappingRows = [
            ...(Array.isArray(mappingRowsDrug) ? mappingRowsDrug : []),
            ...(Array.isArray(mappingRowsCd) ? mappingRowsCd : []),
        ];
        const metaMappingIcdThuoc = taoMetaTuBangMappingIcdThuoc(mappingRows);

        cache_DanhMucHeThong = {
            ...metaPhacDo,
            ...metaTuongTac,
            ...metaMappingIcdThuoc,
            DM_TUONG_TAC_THUOC_ROWS: tuongTacRows,
            DM_ICD10_CAP_CUU_ROWS: Array.isArray(icdCapCuuArr) && icdCapCuuArr.length ? icdCapCuuArr : DANH_MUC_ICD10_CAP_CUU,
            // Arrays for NLP engine (backward compatible)
            DM_ICD10: icd10Arr.map(i => i['MÃ BỆNH'] || i['MA_BENH'] || ''),
            DM_ICD10_KE_DON_TREN_30_NGAY: icdKeDonTren30NgayArr.map((i) => i['Mã bệnh theo ICD 10'] || i['Ma benh theo ICD 10'] || i['MA_BENH_THEO_ICD_10'] || ''),
            DM_BENH_MAN_TINH: icdKeDonTren30NgayArr.map((i) => i['Mã bệnh theo ICD 10'] || i['Ma benh theo ICD 10'] || i['MA_BENH_THEO_ICD_10'] || ''),
            DM_DVKT: dvktArr.map(i => i['MA_DICH_VU'] || ''),
            DM_KHAM: buildDmKhamHeThong(congKhamBvArr),
            DM_CONG_KHAM_BV_ROWS: Array.isArray(congKhamBvArr) ? congKhamBvArr : [],
            DM_THUOC: thuocArr.map(i => i['MA_THUOC'] || ''),
            DM_VTYT: vtytArr.map(i => i['MA_VAT_TU'] || ''),
            DM_KHOA: khoaArr.map(i => i['MA_KHOA'] || ''),
            PL1_DVKT: pl1.map(i => i['MÃ BỘ Y TẾ'] || i['MA_DVKT'] || ''),
            PL2_KHAM: pl2.map(i => i['MÃ KHÁM'] || i['MA_KHAM'] || ''),
            PL3_GIUONG: pl3.map(i => i['MÃ GIƯỜNG'] || i['MA_GIUONG'] || ''),
            PL4_GIUONG_BN: pl4.map(i => i['MÃ GIƯỜNG BN'] || i['MA_GIUONG'] || ''),
            PL5_THUOC: pl5.map(i => i['MÃ THUỐC'] || i['MA_THUOC'] || ''),
            PL6_THUOC_YHCT: pl6.map(i => i['MÃ YHCT'] || i['MA_THUOC'] || ''),
            PL7_BENH_YHCT: pl7.map(i => i['MÃ BỆNH'] || i['MA_BENH'] || ''),
            PL8_VTYT: pl8.map(i => i['MÃ VẬT TƯ'] || i['MA_VTYT'] || ''),
            PL9_MAU: pl9.map(i => i['MÃ MÁU'] || i['MA_MAU'] || ''),
            PL10_DOI_TUONG: Array.from(boQuyTacDoiTuongKcb.validCodes),
            PL11_CLS: pl11.map(i => i['MÃ DỊCH VỤ'] || i['MA_DVKT'] || ''),
            PL12_NHIEN_LIEU: pl12.map(i => i['MÃ NHIÊN LIỆU'] || i['MA_NHIEN_LIEU'] || ''),
            // Maps O(1) BV nội bộ
            MAP_DVKT_BV: buildMap(dvktArr, 'MA_DICH_VU'),
            MAP_THUOC_BV: buildMap(thuocArr, 'MA_THUOC'),
            /** Cùng Mẫu 03, đủ dòng để DM-THUOC-04 chọn đúng bản ghi khi trùng MA (khớp tên/ĐVT/HL với XML2). */
            DM_THUOC_M03_ROWS: Array.isArray(thuocArr) ? thuocArr : [],
            MAP_VTYT_BV: buildMap(vtytArr, 'MA_VAT_TU'),
            MAP_ICD10: buildMap(icd10Arr, 'MÃ BỆNH'),
            BO_QUY_TAC_ICD10_KE_DON_TREN_30_NGAY: taoBoQuyTacIcdKeDonTren30Ngay(icdKeDonTren30NgayArr),
            BO_QUY_TAC_DOI_TUONG_KCB: boQuyTacDoiTuongKcb,
            MAP_KHOA_BV: buildMap(khoaArr, 'MA_KHOA'),
            MAP_NHAN_SU: buildAliasMap(nhanSuArr, 'MA_BHXH', 'MA_BAC_SI', 'MACCHN', 'MA_NV', 'ID', 'SO_CCCD', 'SO_DINH_DANH'),
            DM_MA_THE_QUYEN_LOI_ROWS: Array.isArray(maTheQuyenLoiArr) ? maTheQuyenLoiArr : [],
            MAP_MA_THE_QUYEN_LOI: taoMetaMaTheQuyenLoiTuDanhMuc(maTheQuyenLoiArr),
            DM_THUOC_DIEU_KIEN_TT_ROWS: Array.isArray(thuocDieuKienTtArr) ? thuocDieuKienTtArr : [],
            // Maps O(1) BYT
            MAP_BYT_PL1: buildMapMulti(pl1, 'MÃ BỘ Y TẾ', 'MA_DVKT'),
            MAP_BYT_PL5: buildMapMulti(pl5, 'MÃ THUỐC', 'MA_THUOC'),
            MAP_BYT_PL8: buildMapMulti(pl8, 'MÃ VẬT TƯ', 'MA_VTYT'),
            MAP_BYT_PL11: buildMapMulti(pl11, 'MÃ DỊCH VỤ', 'MA_DVKT'),
        };
        return cache_DanhMucHeThong;
    } catch (_e) {
        return {
            MAP_PHAC_DO_CDSS: new Map(),
            SO_DONG_PHAC_DO_CDSS: 0,
            CO_KHO_PHAC_DO_CDSS: false,
            MAP_TUONG_TAC_CAP: new Map(),
            SO_CAP_TUONG_TAC: 0,
            CO_BANG_TUONG_TAC: false,
            DM_MAPPING_ICD_THUOC_ROWS: [],
            DM_MAPPING_ICD_THUOC_CD_ROWS: [],
            SET_MA_THUOC_CO_MAPPING_ICD: new Set(),
            SET_MA_THUOC_CO_MAPPING_ICD_CD: new Set(),
            DM_TUONG_TAC_THUOC_ROWS: [],
            DM_ICD10_CAP_CUU_ROWS: DANH_MUC_ICD10_CAP_CUU,
            DM_ICD10:[], DM_ICD10_KE_DON_TREN_30_NGAY:[], DM_BENH_MAN_TINH:[], DM_DVKT:[], DM_THUOC:[], DM_VTYT:[], DM_KHOA:[],
            PL1_DVKT:[],PL2_KHAM:[],PL3_GIUONG:[],PL4_GIUONG_BN:[],PL5_THUOC:[],
            PL6_THUOC_YHCT:[],PL7_BENH_YHCT:[],PL8_VTYT:[],PL9_MAU:[],
            PL10_DOI_TUONG:[],PL11_CLS:[],PL12_NHIEN_LIEU:[],
            MAP_DVKT_BV: new Map(), MAP_THUOC_BV: new Map(), DM_THUOC_M03_ROWS: [], MAP_VTYT_BV: new Map(),
            MAP_ICD10: new Map(), BO_QUY_TAC_ICD10_KE_DON_TREN_30_NGAY: { exact: new Set(), ranges: [] }, BO_QUY_TAC_DOI_TUONG_KCB: { validCodes: new Set(), byCode: new Map() }, MAP_KHOA_BV: new Map(), MAP_NHAN_SU: new Map(),
            DM_MA_THE_QUYEN_LOI_ROWS: [],
            MAP_MA_THE_QUYEN_LOI: new Map(),
            DM_THUOC_DIEU_KIEN_TT_ROWS: [],
            MAP_BYT_PL1: new Map(), MAP_BYT_PL5: new Map(), MAP_BYT_PL8: new Map(), MAP_BYT_PL11: new Map()
        };
    }
};


// ============================================================
// [PHẦN 4] LAYER 0: BỘ LỌC DƯƠNG TÍNH GIẢ (FALSE POSITIVE GUARD)
// ============================================================

/** TRUE nếu dòng chi này KHÔNG do BHYT thanh toán -> bỏ qua kiểm tra */
const laBHYTKhôngThanhToan = (row) => {
    if (!row) return true;
    const nguon = UPPER(row.NGUON_CTRA || row.NGUON_THANH_TOAN || '');
    if (nguon && nguon !== 'BHYT' && nguon !== '1') return true;
    const mucHuong = TO_NUMBER(row.MUC_HUONG);
    if (!IS_EMPTY(row.MUC_HUONG) && mucHuong === 0) return true;
    return false;
};

/** TRUE nếu toàn bộ hồ sơ không có thanh toán BHYT */
const laNguonKhôngPhaBHYT = (xml1) => {
    if (!xml1) return false;
    const tBhtt = TO_NUMBER(xml1.T_BHTT);
    const tNguonKhac = TO_NUMBER(xml1.T_NGUONKHAC);
    const tTongChi = TO_NUMBER(xml1.T_TONGCHI_BV);
    const tBncct = TO_NUMBER(xml1.T_BNCCT);
    return tBhtt === 0 && tNguonKhac > 0 && tTongChi > 0 && tBncct === 0;
};

const layDanhSachXml = (hoSo, xmlKey) => {
    const upper = String(xmlKey || '').toUpperCase();
    const lower = upper.toLowerCase();
    let data = hoSo?.[upper] ?? hoSo?.[lower];
    if ((data === undefined || data === null) && hoSo?._raw) {
        data = hoSo._raw[upper] ?? hoSo._raw[lower];
    }
    if (upper === 'XML1') {
        if (Array.isArray(data)) return data.length > 0 ? data[0] : {};
        return data || {};
    }
    return Array.isArray(data) ? data : [];
};

const normalizeDateKey = (val, padTail = '0') => {
    const s = String(val || '').replace(/\D/g, '');
    if (!s) return '';
    return s.padEnd(12, padTail).slice(0, 12);
};

const compareDateKey = (a, b) => {
    const k1 = normalizeDateKey(a, '0');
    const k2 = normalizeDateKey(b, '0');
    if (!k1 || !k2) return 0;
    if (k1 === k2) return 0;
    return k1 > k2 ? 1 : -1;
};

/** Chuẩn hóa mốc QĐ130 (YYYYMMDDHHmm) → ms UTC local — dùng so sánh thời điểm, không so sánh chuỗi/số học. */
const parseNgayGioXmlThanhMs = (val) => {
    if (IS_EMPTY(val)) return null;
    const s = String(val).replace(/\D/g, '').padEnd(12, '0');
    if (s.length < 8) return null;
    const y = parseInt(s.substring(0, 4), 10);
    const mo = parseInt(s.substring(4, 6), 10) - 1;
    const d = parseInt(s.substring(6, 8), 10);
    const hh = parseInt(s.substring(8, 10) || '0', 10);
    const mm = parseInt(s.substring(10, 12) || '0', 10);
    if ([y, mo, d, hh, mm].some((n) => Number.isNaN(n))) return null;
    const t = new Date(y, mo, d, hh, mm, 0, 0).getTime();
    return Number.isNaN(t) ? null : t;
};

const MA_THE_BHYT_REGEX = /^[A-Z]{2}\d{13}$/;
const CARD_BENEFIT_CODE_MAP = Object.freeze({ '1': 100, '2': 100, '3': 95, '4': 80 });

const normalizeTextNoAccent = (value) => String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/Đ/g, 'D')
    .replace(/đ/g, 'd');

/** Chẩn đoán vào viện / ra viện có từ «viêm» (sau chuẩn hóa: viem) — bổ sung bối cảnh chỉ định. */
const coChanDoanVaoRaCoTuViem = (xml1) => {
    const s = `${normalizeTextNoAccent(xml1?.CHAN_DOAN_RV || '')} ${normalizeTextNoAccent(xml1?.CHAN_DOAN_VAO || '')}`.toLowerCase();
    return s.includes('viem');
};

/**
 * THUOC_95 (40.177 Cefpodoxim / Vipocef): chỉ kiểm tra chỉ định (ICD/chẩn đoán), không kiểm liều.
 * Trả về true khi chỉ định không thuộc nhóm được phép.
 */
const THUOC_95_VI_PHAM_CHI_DINH = (xml1, xml2) => {
    if (String(xml2?.MA_THUOC || '').trim() !== '40.177') return false;
    if (coChanDoanVaoRaCoTuViem(xml1)) return false;

    const icdC = UPPER(String(xml1?.MA_BENH_CHINH || '').trim());
    const icdKt = UPPER(String(xml1?.MA_BENH_KT || ''));
    const blobIcd = `${icdC} ${icdKt}`;
    const cd = normalizeTextNoAccent(`${xml1?.CHAN_DOAN_RV || ''} ${xml1?.CHAN_DOAN_VAO || ''}`).toUpperCase();

    const hasMain = (pfx) => icdC.startsWith(pfx);
    const hasAny = (pfx) => hasMain(pfx) || blobIcd.includes(pfx);

    const nhomLau = hasAny('A54') || /LAU|GONORRHOEA|GONORRHEE|GONOCOCC|TIM LAU/i.test(cd);
    const nhomDaNK = hasMain('L')
        || /(^|[\s;+,])L(0[1-9]|[12][0-9]|3[0-9])/.test(blobIcd.replace(/\./g, ''))
        || /VIEM (DA|NANG|NHIEM TRUNG DA|NHIEM TRUNG MO MEM)|AP-XE|AP XE|ABSCESS/i.test(cd);
    const nhomHoHapNang = ['J12', 'J13', 'J14', 'J15', 'J16', 'J17', 'J18', 'J20', 'J44'].some((c) => hasAny(c))
        || /VIEM PHOI|VIEM PHE QUAN MAN|DOT CAP PHE QUAN|CAP TINH PHE QUAN/i.test(cd);
    const nhomHoHapNhe = ['J01', 'J02', 'J03', 'J04', 'J05', 'J06', 'H66', 'H67'].some((c) => hasAny(c))
        || /VIEM HONG|VIEM AMIDAN|VIEM TAI GIUA|VIEM TAI|VIEM XOANG/i.test(cd);
    const nhomTieu = ['N10', 'N30', 'N34', 'N39'].some((c) => hasAny(c))
        || /VIEM (DUONG TIET NIEU|BANG QUANG|BE THAN|THAN-TUY|THAN TUY)/i.test(cd);

    const coChiDinh = nhomLau || nhomDaNK || nhomHoHapNang || nhomHoHapNhe || nhomTieu;

    return !coChiDinh;
};

/**
 * THUOC_311 (40.48 Paracetamol): chỉ định giảm đau / hạ sốt và bối cảnh lâm sàng tương ứng.
 * Trả về true khi có vi phạm (không thấy chỉ định phù hợp trên ICD hoặc chẩn đoán).
 */
const THUOC_311_VI_PHAM_CHI_DINH = (xml1, xml2) => {
    if (String(xml2?.MA_THUOC || '').trim() !== '40.48') return false;
    if (coChanDoanVaoRaCoTuViem(xml1)) return false;

    const laMaIcdHopLeParacetamol = (raw) => {
        const m = String(raw || '').trim().toUpperCase().replace(/\s/g, '');
        if (!m) return false;
        const px = [
            'R50', 'R51', 'R52', 'R05', 'R06', 'R07', 'R09',
            'M15', 'M16', 'M17', 'M18', 'M19', 'M20', 'M21', 'M22', 'M23', 'M24', 'M25',
            'M54', 'M60', 'M61', 'M62', 'M63', 'M64', 'M65', 'M66', 'M67', 'M68', 'M69',
            'M70', 'M71', 'M72', 'M73', 'M74', 'M75', 'M76', 'M77', 'M78', 'M79',
            'K04', 'K05', 'K08',
            'N92', 'N93', 'N94',
            'J00', 'J01', 'J02', 'J03', 'J04', 'J05', 'J06', 'J09', 'J10', 'J11',
            'Z25', 'H65', 'H66', 'G43', 'G44', 'Y59',
        ];
        return px.some((p) => m === p || m.startsWith(`${p}.`));
    };

    const icdC = UPPER(String(xml1?.MA_BENH_CHINH || '').trim());
    const kt = UPPER(String(xml1?.MA_BENH_KT || ''));
    if (laMaIcdHopLeParacetamol(icdC)) return false;
    const blob = `${icdC} ${kt}`;
    const maTrich = blob.match(/[A-TV-Z]\d{2}(?:\.\d+)?/g) || [];
    for (let i = 0; i < maTrich.length; i += 1) {
        if (laMaIcdHopLeParacetamol(maTrich[i])) return false;
    }

    const cd = `${normalizeTextNoAccent(xml1?.CHAN_DOAN_RV || '')} ${normalizeTextNoAccent(xml1?.CHAN_DOAN_VAO || '')}`.toLowerCase().replace(/\s+/g, ' ').trim();
    if (!cd) return true;

    const reChung = /giam\s*dau|ha\s*sot|\bsot\b|nhuc\s*dau|dau\s*dau|dau\s*nua\s*dau|dau\s*rang|nhuc\s*rang|cam\s*cum|\bcum\b|cam\s*lanh|tiem\s*chung|tiem\s*ngua|vacxin|sau\s*tiem|nho\s*rang|hanh\s*kinh|dau\s*kinh|bung\s*kinh|dau\s*bung\s*kinh|dau\s*hong|vien\s*hong|vien\s*amidan|dau\s*co|dau\s*khop|viem\s*khop|dau\s*lung|that\s*lung|dau\s*cot\s*song|dau\s*tai|dau\s*nhuc|ret\s*run|dau\s*than|dau\s*nhuc\s*co|dau\s*nhuc\s*xuong/i;
    if (reChung.test(cd)) return false;

    return true;
};

/**
 * THUOC_41 (40.155 Amoxicillin + acid clavulanic): chỉ định nhiễm khuẩn theo hướng dẫn (điều trị ngắn ngày, thường dưới 14 ngày).
 * Trả về true khi vi phạm (chỉ định không phù hợp hoặc SO_NGAY > 14 khi khai được).
 */
const THUOC_41_VI_PHAM_CHI_DINH = (xml1, xml2) => {
    if (String(xml2?.MA_THUOC || '').trim() !== '40.155') return false;

    const soNgay = TO_NUMBER(xml2?.SO_NGAY);
    if (Number.isFinite(soNgay) && soNgay > 14) return true;
    if (coChanDoanVaoRaCoTuViem(xml1)) return false;

    const laMaIcdHopLeAmoxiClav = (raw) => {
        const m = String(raw || '').trim().toUpperCase().replace(/\s/g, '');
        if (!m) return false;
        const px = [
            'J00', 'J01', 'J02', 'J03', 'J04', 'J05', 'J06',
            'J09', 'J10', 'J11', 'J12', 'J13', 'J14', 'J15', 'J16', 'J17', 'J18', 'J20', 'J21', 'J22',
            'J31', 'J32', 'J33', 'J34', 'J35', 'J36', 'J37', 'J38', 'J39',
            'J40', 'J41', 'J42', 'J43', 'J44', 'J47',
            'H66', 'H67',
            'N10', 'N11', 'N12', 'N13', 'N30', 'N34', 'N39', 'N41', 'N70', 'N73', 'N74',
            'L01', 'L02', 'L03', 'L04', 'L05', 'L08',
            'M00', 'M01', 'M02', 'M03', 'M86',
            'K04', 'K05', 'K65', 'K81',
            'O08', 'O85', 'O86',
            'A40', 'A41', 'A49',
            'T81',
        ];
        return px.some((p) => m === p || m.startsWith(`${p}.`));
    };

    const icdC = UPPER(String(xml1?.MA_BENH_CHINH || '').trim());
    const kt = UPPER(String(xml1?.MA_BENH_KT || ''));
    if (laMaIcdHopLeAmoxiClav(icdC)) return false;
    const blob = `${icdC} ${kt}`;
    const maTrich = blob.match(/[A-TV-Z]\d{2}(?:\.\d+)?/g) || [];
    for (let i = 0; i < maTrich.length; i += 1) {
        if (laMaIcdHopLeAmoxiClav(maTrich[i])) return false;
    }

    const cd = `${normalizeTextNoAccent(xml1?.CHAN_DOAN_RV || '')} ${normalizeTextNoAccent(xml1?.CHAN_DOAN_VAO || '')}`
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .trim();
    if (!cd) return true;

    const reText = /viem\s*xoang|viem\s*amidan|viem\s*tai\s*giua|viem\s*hong|viem\s*mui|nhiem\s*khuan\s*duong\s*ho\s*hap|nhiem\s*khuan\s*ho\s*hap|hk\s*tren|ho\s*hap\s*tren|viem\s*phe\s*quan|viem\s*phoi|dot\s*cap|viem\s*phoi\s*phe\s*quan|hk\s*duoi|ho\s*hap\s*duoi|moraxella|influenz|viem\s*bang\s*quang|viem\s*nieu\s*dao|nhiem\s*duong\s*tieu\s*nieu|viem\s*be\s*than|nhiem\s*tiet\s*nieu|mun\s*nhot|ap\s*xe|con\s*trung\s*dot|vet\s*thuong|viem\s*mo\s*te\s*bao|nhiem\s*trung\s*da|viem\s*tuy\s*xuong|ap\s*xe\s*rang|chan\s*rang|nha\s*khoa|say\s*thai|nhiem\s*sau\s*san|nhiem\s*o\s*bung|viem\s*mang\s*bung|bung\s*mac|khong\s*do\s*sau\s*khang\s*sinh|khang\s*sinh\s*truoc|that\s*bai\s*dieu\s*tri|beta\s*lactamase|nhiem\s*khuan\s*sinh\s*duc/i;
    if (reText.test(cd)) return false;

    return true;
};

/**
 * THUOC_267 (40.775 Methylprednisolon): liệu pháp glucocorticoid — chống viêm / giảm miễn dịch theo chỉ định chuyên khoa.
 * Trả về true khi không thấy chỉ định phù hợp (ICD hoặc chẩn đoán).
 */
const THUOC_267_VI_PHAM_CHI_DINH = (xml1, xml2) => {
    if (String(xml2?.MA_THUOC || '').trim() !== '40.775') return false;
    if (coChanDoanVaoRaCoTuViem(xml1)) return false;

    const laMaIcdHopLeMethylpred = (raw) => {
        const m = String(raw || '').trim().toUpperCase().replace(/\s/g, '');
        if (!m) return false;
        const px = [
            'M05', 'M06', 'M32', 'M30', 'M31',
            'D86',
            'J45',
            'K51',
            'D55', 'D56', 'D57', 'D58', 'D59',
            'D70',
            'L50', 'T78',
            'C50', 'C61', 'C81', 'C82', 'C83', 'C84', 'C85',
            'C91', 'C92', 'C93', 'C94', 'C95',
            'N04',
        ];
        return px.some((p) => m === p || m.startsWith(`${p}.`));
    };

    const icdC = UPPER(String(xml1?.MA_BENH_CHINH || '').trim());
    const kt = UPPER(String(xml1?.MA_BENH_KT || ''));
    if (laMaIcdHopLeMethylpred(icdC)) return false;
    const blob = `${icdC} ${kt}`;
    const maTrich = blob.match(/[A-TV-Z]\d{2}(?:\.\d+)?/g) || [];
    for (let i = 0; i < maTrich.length; i += 1) {
        if (laMaIcdHopLeMethylpred(maTrich[i])) return false;
    }

    const cd = `${normalizeTextNoAccent(xml1?.CHAN_DOAN_RV || '')} ${normalizeTextNoAccent(xml1?.CHAN_DOAN_VAO || '')}`
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .trim();
    if (!cd) return true;

    const reText = /viem\s*khop\s*dang\s*thap|khop\s*dang\s*thap|lupus|ban\s*do\s*he\s*thong|viem\s*quanh\s*dong\s*mach|dong\s*mach\s*thai\s*duong|thai\s*duong|viem\s*mach|sarcoid|hen\s*phe\s*quan|hen\s*suyen|viem\s*loet\s*dai\s*trang|dai\s*trang\s*man|thieu\s*mau\s*tan\s*mau|tan\s*mau|giam\s*bach\s*cau|bach\s*cau\s*hat|phan\s*ve|dich\s*ung\s*nang|ung\s*thu|bai\s*cau|lympho|lymphoma|ung\s*thu\s*vu|tuyen\s*tien\s*liet|hoi\s*chung\s*than\s*hu|than\s*hu\s*nguyen\s*phat|\bthan\s*hu\b/i;
    if (reText.test(cd)) return false;

    return true;
};

/**
 * THUOC_451: TT 37/2024 — tiền BHYT (THANH_TIEN_BH) trên dòng là tổng dòng; so trần theo **1 đơn vị cấp phát**
 * (vd. 1 viên) = THANH_TIEN_BH / SO_LUONG khi SL > 0; nếu không có SL thì coi THANH_TIEN_BH đã là trên 1 đơn vị.
 * Trả về true khi (tiền BHYT / đơn vị) vượt DON_GIA (đơn giá / đơn vị).
 */
const THUOC_451_VI_PHAM_TRAN_BH_TREN_DON_VI = (xml1, xml2) => {
    void xml1;
    const donGia = TO_NUMBER(xml2?.DON_GIA);
    if (!(donGia > 0)) return false;
    const ttBh = TO_NUMBER(xml2?.THANH_TIEN_BH);
    if (!Number.isFinite(ttBh)) return false;
    const sl = TO_NUMBER(xml2?.SO_LUONG);
    const tienBhMotDonVi = Number.isFinite(sl) && sl > 0 ? ttBh / sl : ttBh;
    return tienBhMotDonVi > donGia;
};

/**
 * THUOC_533 (40.30.501 Wamlox): SO_LUONG khớp liều/ngày × số ngày; liều/ngày = SL_MOI_LAN×TAN_SUAT hoặc SL_MOI_NGAY; trần 2 viên/ngày.
 * Trả về true khi vi phạm.
 */
const THUOC_533_VI_PHAM_WAMLOX = (xml1, xml2) => {
    void xml1;
    if (String(xml2?.MA_THUOC || '').trim() !== '40.30.501') return false;

    const tan = TO_NUMBER(xml2?.TAN_SUAT);
    const slLan = TO_NUMBER(xml2?.SL_MOI_LAN);
    const slNgayParsed = TO_NUMBER(xml2?.SL_MOI_NGAY);
    let lieuNgay = 0;
    if (Number.isFinite(slNgayParsed) && slNgayParsed > 0) {
        lieuNgay = slNgayParsed;
    } else if (Number.isFinite(tan) && Number.isFinite(slLan) && tan >= 0 && slLan >= 0) {
        lieuNgay = tan * slLan;
    }
    if (!(lieuNgay > 0)) return false;

    if (lieuNgay > 2) return true;

    const soLuong = TO_NUMBER(xml2?.SO_LUONG);
    const soNgay = TO_NUMBER(xml2?.SO_NGAY);
    if (!Number.isFinite(soLuong)) return false;

    const kyVong = Number.isFinite(soNgay) && soNgay > 0 ? lieuNgay * soNgay : lieuNgay;
    const lech = Math.abs(soLuong - kyVong);
    return lech > 1e-4;
};

/**
 * THUOC_398 (40.688 Domperidon dạng viên):
 * - Dưới 12 tuổi: chống chỉ định (vi phạm nếu kê thuốc).
 * - Từ 12 tuổi: mg/ngày = mg/đơn vị × (SL_MOI_LAN×TAN_SUAT hoặc SL_MOI_NGAY) không được > 30 mg/ngày.
 * - Không rõ tuổi: chỉ kiểm tra quá 30 mg/ngày khi suy được liều.
 * Trả về true khi vi phạm.
 */
const THUOC_398_VI_PHAM_DOMPERIDON = (xml1, xml2) => {
    if (String(xml2?.MA_THUOC || '').trim() !== '40.688') return false;

    const tuoiNam = TO_NUMBER(xml1?.TUOI_NAM);
    const tuoiNgay = TO_NUMBER(xml1?.TUOI_NGAY);

    let nhomTuoi = null;
    if (Number.isFinite(tuoiNam)) {
        nhomTuoi = tuoiNam < 12 ? 'DUOI_12' : 'TU_12';
    } else if (Number.isFinite(tuoiNgay)) {
        nhomTuoi = tuoiNgay < 12 * 365 ? 'DUOI_12' : 'TU_12';
    }

    if (nhomTuoi === 'DUOI_12') {
        return true;
    }

    const mgMotDv = layMgHamLuongTuHamLuong(xml2?.HAM_LUONG);
    const slNgay = TO_NUMBER(xml2?.SL_MOI_NGAY);
    let donViTheoNgay = 0;
    if (Number.isFinite(slNgay) && slNgay > 0) {
        donViTheoNgay = slNgay;
    } else {
        const tan = TO_NUMBER(xml2?.TAN_SUAT);
        const slLan = TO_NUMBER(xml2?.SL_MOI_LAN);
        if (Number.isFinite(tan) && Number.isFinite(slLan)) donViTheoNgay = tan * slLan;
    }

    let tongMgNgay = 0;
    if (mgMotDv > 0 && donViTheoNgay > 0) {
        tongMgNgay = mgMotDv * donViTheoNgay;
    } else {
        tongMgNgay = TO_NUMBER(xml2?.TONG_LIEU_24H) || 0;
    }

    if (!(tongMgNgay > 0)) return false;

    return tongMgNgay > 30;
};

/** Gộp mã ICD từ XML1 (bỏ dấu chấm, in hoa) để khớp prefix. */
const tachMaIcdDaChuanHoaTuXml1 = (xml1) => {
    const out = [];
    const them = (raw) => {
        String(raw || '')
            .split(/[;,+|\s]+/)
            .map((t) => UPPER(String(t || '').trim().replace(/\./g, '')))
            .filter(Boolean)
            .forEach((c) => {
                if (!out.includes(c)) out.push(c);
            });
    };
    them(xml1?.MA_BENH_CHINH);
    them(xml1?.MA_BENH_KT);
    them(xml1?.MA_BENHKEM);
    return out;
};

/**
 * THUOC_540: Hydrochlorothiazide — chống chỉ định tương đối/tuyệt đối khi ICD chính/kèm (tachMaIcd) thuộc nhóm:
 * gút (M10, M1A), tăng acid uric máu (E79.0), vô niệu/thiểu niệu (R34), Addison (E27.4), tăng calci máu (E83.52),
 * suy thận nặng (N18.4–N18.6), suy gan nặng (K72.*).
 */
const laMaIcdChongChiDinhHydrochlorothiazide = (maNorm) => {
    if (!maNorm) return false;
    if (maNorm.startsWith('M10') || maNorm.startsWith('M1A')) return true;
    if (maNorm.startsWith('E790')) return true;
    if (maNorm.startsWith('R34')) return true;
    if (maNorm.startsWith('E274')) return true;
    if (maNorm.startsWith('E8352')) return true;
    if (maNorm.startsWith('N184') || maNorm.startsWith('N185') || maNorm.startsWith('N186')) return true;
    if (maNorm.startsWith('K72')) return true;
    return false;
};

const coHoSoCoIcdChongChiDinhHydrochlorothiazide = (xml1) => tachMaIcdDaChuanHoaTuXml1(xml1).some(laMaIcdChongChiDinhHydrochlorothiazide);

const ghepVanBanNhanDangHctTuXml2 = (cur = {}, mapThuoc) => {
    const maT = UPPER(String(cur?.MA_THUOC || '').trim());
    const dmRow = mapThuoc instanceof Map ? mapThuoc.get(maT) : null;
    const tuDm = dmRow ? String(layGiaTriDanhMuc(dmRow, ['TEN_THUOC', 'TEN_HOAT_CHAT', 'HOAT_CHAT', 'TEN']) || '').trim() : '';
    return [
        cur?.TEN_THUOC,
        cur?.TEN_HOAT_CHAT,
        cur?.HAM_LUONG,
        cur?.MA_HOAT_CHAT,
        tuDm,
    ].filter(Boolean).join(' ');
};

const laVanBanCoHydrochlorothiazide = (blob) => {
    const u = normalizeTextNoAccent(String(blob || '')).toUpperCase()
        .replace(/\+/g, ' ')
        .replace(/[^A-Z0-9 ]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    if (/HYDROCHLOROTHIAZIDE|HYDROCHLOROTHIAZID|HYDROCLOROTIAZID|HYDROCHLORTHIAZIDE/.test(u)) return true;
    if (/\bHCTZ\b/.test(u) || /\bHCT\b/.test(u)) return true;
    return false;
};

/**
 * THUOC_345 Simethicon (40.750): chỉ định theo HC — giảm đầy hơi/khó chịu do thừa hơi (R14),
 * khó tiêu chức năng (K30), trào ngược (K21), rối loạn dạ dày–tá tràng (K31.8), triệu chứng liên quan (R10.1, R12),
 * khám đặc biệt (Z01.8), hoặc bối cảnh nội soi/chụp đường tiêu hóa (phá bọt).
 * Trả về true nếu có ít nhất một cơ sở chỉ định hợp lệ.
 */
const coChiDinhHopLeSimethiconTheoHc = (xml1, contextRuleDong) => {
    const maHopLe = (ma) => {
        if (!ma) return false;
        if (ma.startsWith('R12')) return true;
        if (ma.startsWith('R14')) return true;
        if (ma.startsWith('R101')) return true;
        if (ma.startsWith('K21')) return true;
        if (ma.startsWith('K30')) return true;
        if (ma.startsWith('K318')) return true;
        if (ma.startsWith('Z018')) return true;
        return false;
    };
    if (tachMaIcdDaChuanHoaTuXml1(xml1).some(maHopLe)) return true;

    const cd = `${normalizeTextNoAccent(xml1?.CHAN_DOAN_RV || '')} ${normalizeTextNoAccent(xml1?.CHAN_DOAN_VAO || '')}`.toLowerCase();
    if (/(day hoi|chuong bung|day bung|bung day|thua hoi|kho chiu o bung|kho chiu tai bung)/i.test(cd)) return true;
    if (/(kho tieu|kho tieu chuc nang|roi loan tieu hoa|chung kho tieu)/i.test(cd)) return true;
    if (/(trao nguoc|gerd|reflux|viem thuc quan|viem long thuc quan)/i.test(cd)) return true;
    if (/(noi soi (da day|tieu hoa|duong tieu hoa|thuc quan|dai trang|o bung)|soi da day|soi tieu hoa)/i.test(cd)) return true;
    if (/(x[- ]?quang|xq|chup ct|chieu chup|can quang).*(da day|bung|tieu hoa|thuc quan|dai trang)/i.test(cd)) return true;
    if (/(pha bot|chat pha bot|giam bot|can quang noi soi)/i.test(cd)) return true;

    const dsXml3 = contextRuleDong?.rowsByTable?.XML3 || [];
    const coDv = dsXml3.some((r) => {
        const ten = `${normalizeTextNoAccent(r?.TEN_DICH_VU || r?.TEN_DV || '')}`.toLowerCase();
        if (/noi soi/.test(ten) && /(da day|tieu hoa|dai trang|thuc quan|bung)/.test(ten)) return true;
        if (/(chup|chieu|xq|x quang|ct scan|ct bung).*(da day|bung|tieu hoa|thuc quan)/i.test(ten)) return true;
        return false;
    });
    if (coDv) return true;

    return false;
};

/**
 * THUOC_139 Domperidon (40.688): điều trị triệu chứng nôn/buồn nôn (R11) và bệnh lý dạ dày–tá tràng
 * (K21 trào ngược; K25–K28 loét; K29 viêm; K30 khó tiêu chức năng; K31 khác).
 * Trả về true nếu có ít nhất một cơ sở chỉ định hợp lệ.
 */
const coChiDinhHopLeDomperidon139 = (xml1) => {
    const maHopLe = (ma) => {
        if (!ma) return false;
        if (ma.startsWith('R11')) return true;
        const kDaDayTaTrang = ['K21', 'K25', 'K26', 'K27', 'K28', 'K29', 'K30', 'K31'];
        return kDaDayTaTrang.some((pfx) => ma.startsWith(pfx));
    };
    if (tachMaIcdDaChuanHoaTuXml1(xml1).some(maHopLe)) return true;

    const cd = `${normalizeTextNoAccent(xml1?.CHAN_DOAN_RV || '')} ${normalizeTextNoAccent(xml1?.CHAN_DOAN_VAO || '')}`.toLowerCase();
    if (/(buon non|buon oi|non roi|non mua|oi mua|non|nausea|vomiting)/i.test(cd)) return true;
    if (/(da day|ta trang|tá tràng|loet da day|loet ta trang|viem da day|viem ta trang|viem loet|peptic|gastritis|ulcer)/i.test(cd)) return true;
    if (/(trao nguoc|gerd|reflux|kho tieu|kho tieu chuc nang)/i.test(cd)) return true;
    return false;
};

/**
 * THUOC_321 Protease+Amylase+Lipase / men tụy (40.740): suy tụy & viêm tụy mạn, xơ nang (E84),
 * kém hấp thu/ỉa mỡ (K90), bệnh tụy khác (K86), sau mổ tụy / nối dạ dày–ruột (K91), phân bất thường (R19.5), v.v.
 */
const coChiDinhHopLeMenTuyPancreatin321 = (xml1) => {
    const maHopLe = (ma) => {
        if (!ma) return false;
        if (ma.startsWith('E84')) return true;
        if (ma.startsWith('K86')) return true;
        if (ma.startsWith('K90')) return true;
        if (ma.startsWith('K91')) return true;
        if (ma.startsWith('R195')) return true;
        if (ma.startsWith('Z9089') || ma.startsWith('Z988')) return true;
        return false;
    };
    if (tachMaIcdDaChuanHoaTuXml1(xml1).some(maHopLe)) return true;

    const cd = `${normalizeTextNoAccent(xml1?.CHAN_DOAN_RV || '')} ${normalizeTextNoAccent(xml1?.CHAN_DOAN_VAO || '')}`.toLowerCase();
    if (/(suy tuy|suy ngoai tiet tuy|roi loan noi tiet ngoai tuy)/i.test(cd)) return true;
    if (/(viem tuy man|viem tuy man tinh)/i.test(cd)) return true;
    if (/(xo nang tuy|xo hoa tuy|benh xo nang|fibrosis|xo nang)/i.test(cd)) return true;
    if (/(phan (?:co|nhieu) mo|ia mo|phan nhot|steatorrhea|kem hap thu|hap thu kem)/i.test(cd)) return true;
    if (/(cat (?:bo )?tuy|phau thuat tuy|mo cat tuy|sau mo cat tuy|tac ong tuy)/i.test(cd)) return true;
    if (/(noi da day ruot|noi dd|phau thuat noi|sau noi)/i.test(cd)) return true;
    if (/(tro giup tieu hoa sau|tieu hoa sau mo)/i.test(cd)) return true;
    return false;
};

/**
 * THUOC_324 Racecadotril (40.732): tiêu chảy cấp — trẻ >3 tháng & trẻ em cần bù nước đường uống (ORS) cùng đơn/chẩn đoán;
 * người lớn: tiêu chảy cấp (ICD/chẩn đoán), không ép ORS trên hồ sơ.
 */
const laDuTuoiRacecadotril324 = (xml1) => {
    const t = TO_NUMBER(xml1?.TUOI_NGAY);
    if (Number.isFinite(t) && t < 90) return false;
    return true;
};

const laTreEmDuoi18TheoHoSo = (xml1) => {
    const tn = TO_NUMBER(xml1?.TUOI_NAM);
    if (Number.isFinite(tn)) return tn < 18;
    const tng = TO_NUMBER(xml1?.TUOI_NGAY);
    if (Number.isFinite(tng) && tng > 0) return tng < 18 * 365;
    return false;
};

const coIcdHoacTextTieuChayCapRacecadotril = (xml1) => {
    const maOk = (ma) => {
        if (!ma) return false;
        if (ma.startsWith('A09') || ma.startsWith('A08') || ma.startsWith('A04')) return true;
        if (ma.startsWith('R197')) return true;
        return false;
    };
    if (tachMaIcdDaChuanHoaTuXml1(xml1).some(maOk)) return true;
    const cd = `${normalizeTextNoAccent(xml1?.CHAN_DOAN_RV || '')} ${normalizeTextNoAccent(xml1?.CHAN_DOAN_VAO || '')}`.toLowerCase();
    return /(tieu chay cap|tieu chay|ia chay|co tham|gastroenteritis|diarrhoea|diarrhea)/i.test(cd);
};

const coBuNuocDuongUongTrenHoSo324 = (xml1, contextRuleDong) => {
    const cd = `${normalizeTextNoAccent(xml1?.CHAN_DOAN_RV || '')} ${normalizeTextNoAccent(xml1?.CHAN_DOAN_VAO || '')}`.toLowerCase();
    if (/(oresol|o\.?\s*r\.?\s*s|bu nuoc|duong uong|rehydra|phan hoi nuoc|ddkl|dich bo sung dien giai)/i.test(cd)) return true;
    const rows = contextRuleDong?.rowsByTable?.XML2 || [];
    return rows.some((r) => {
        const t = `${normalizeTextNoAccent(r?.TEN_THUOC || '')} ${normalizeTextNoAccent(r?.HAM_LUONG || '')}`.toLowerCase();
        return /oresol|rehydra|pedialyte|bio[\s-]?ors|\bors\b|electrolyte|glucose.*natri|natri.*clorid|nan biochek|bioral|hydration/i.test(t);
    });
};

const coChiDinhHopLeRacecadotril324 = (xml1, contextRuleDong) => {
    if (!laDuTuoiRacecadotril324(xml1)) return false;
    if (!coIcdHoacTextTieuChayCapRacecadotril(xml1)) return false;
    if (laTreEmDuoi18TheoHoSo(xml1) && !coBuNuocDuongUongTrenHoSo324(xml1, contextRuleDong)) return false;
    return true;
};

/**
 * THUOC_374 Vitamin B6 + magnesi lactat (40.1055): điều trị thiếu magnesi đơn độc hoặc kết hợp (E61.2, E83.4, thiếu đa chất E61.8…).
 */
const coChiDinhHopLeMagnesiB6374 = (xml1) => {
    const maOk = (ma) => {
        if (!ma) return false;
        if (ma.startsWith('E612')) return true;
        if (ma.startsWith('E834')) return true;
        if (ma.startsWith('E618')) return true;
        if (ma.startsWith('R252')) return true;
        return false;
    };
    if (tachMaIcdDaChuanHoaTuXml1(xml1).some(maOk)) return true;
    const cd = `${normalizeTextNoAccent(xml1?.CHAN_DOAN_RV || '')} ${normalizeTextNoAccent(xml1?.CHAN_DOAN_VAO || '')}`.toLowerCase();
    if (/(thieu magne|thieu magnesi|thieu magi|ha magie|ha magnesi|hipomagnesemia|hypomagnesemia|roi loan chuyen hoa magne|roi loan magne)/i.test(cd)) return true;
    if (/(chuot rut|co quap|co giat co).*magne|magne.*chuot rut/i.test(cd)) return true;
    return false;
};

/**
 * THUOC_63 Bacillus subtilis (40.718): tiêu chảy, viêm ruột cấp/mạn, rối loạn tiêu hóa, bất thường đi ngoài (phân lỏng/mỡ…).
 * Không coi K56 (tắc ruột) là chỉ định — THUOC_62 xử lý chống chỉ định.
 */
const coChiDinhHopLeBacillusSubtilis63 = (xml1) => {
    const maOk = (ma) => {
        if (!ma) return false;
        if (ma.startsWith('K56')) return false;
        if (ma.startsWith('A04') || ma.startsWith('A08') || ma.startsWith('A09')) return true;
        if (ma.startsWith('K50') || ma.startsWith('K51') || ma.startsWith('K52')) return true;
        if (ma.startsWith('K58')) return true;
        if (ma.startsWith('K591')) return true;
        if (ma.startsWith('K30')) return true;
        if (ma.startsWith('R197') || ma.startsWith('R195')) return true;
        return false;
    };
    if (tachMaIcdDaChuanHoaTuXml1(xml1).some(maOk)) return true;
    const cd = `${normalizeTextNoAccent(xml1?.CHAN_DOAN_RV || '')} ${normalizeTextNoAccent(xml1?.CHAN_DOAN_VAO || '')}`.toLowerCase();
    if (/(tieu chay|ia chay|di ngoai|phan long|phan loang|phan song|phan co mo|roi loan tieu hoa|roi loan nhu dong ruot)/i.test(cd)) return true;
    if (/(viem ruot cap|viem ruot man|viem dai trang|viem da day ruot|dang viem ruot)/i.test(cd)) return true;
    return false;
};

/** Hen phế quản với ICS/LABA (Seretide/Symbicort): từ 4 tuổi theo SmPC. COPD (J44) không áp trần này. */
const laDuTuoiHenTu4TreEm = (xml1) => {
    const tn = TO_NUMBER(xml1?.TUOI_NAM);
    if (Number.isFinite(tn)) return tn >= 4;
    const tng = TO_NUMBER(xml1?.TUOI_NGAY);
    if (Number.isFinite(tng)) return tng >= 4 * 365;
    return true;
};

/**
 * THUOC_338 (Seretide 40.982) / THUOC_76 (Symbicort 40.762), theo khung SmPC:
 * Hen — tắc nghẽn đường dẫn khí có hồi phục (duy trì ICS±LABA/LABA dài, còn triệu chứng trên ICS, chưa kiểm soát đủ ICS+SABA “khi cần”…): J45 hoặc chữ; từ 4 tuổi.
 * COPD — điều trị duy trì tắc nghẽn, giảm kịch phát (J44 hoặc chữ).
 */
const coChiDinhHopLeIcsLabaJ45J44 = (xml1) => {
    const mas = tachMaIcdDaChuanHoaTuXml1(xml1);
    if (mas.some((m) => m.startsWith('J44'))) return true;
    if (mas.some((m) => m.startsWith('J45'))) return laDuTuoiHenTu4TreEm(xml1);

    const cd = `${normalizeTextNoAccent(xml1?.CHAN_DOAN_RV || '')} ${normalizeTextNoAccent(xml1?.CHAN_DOAN_VAO || '')}`.toLowerCase();
    if (/(copd|benh phoi tac nghen man tinh|benh phoi tac nghen man\b|tat na khi man|bao phoi|phi van man|tat nghen duong dan khi man\b)/i.test(cd)) return true;
    // Hen theo mô tả “tắc nghẽn ĐDK có hồi phục” khi không ghi rõ chữ “hen”
    if (/(tat nghen duong dan khi co hoi phuc|co hoi phuc.*tat nghen|tat nghen.*co hoi phuc)/i.test(cd)) return laDuTuoiHenTu4TreEm(xml1);
    if (/(hen phe quan|hen suyen|benh hen|tat nghen duong dan khi|hen\s|asthma)/i.test(cd)) return laDuTuoiHenTu4TreEm(xml1);
    return false;
};

/**
 * THUOC_233: L-ornithin L-aspartat (40.747, HEPA-MERZ) — gan cấp/mạn (viêm gan, xơ gan, gan nhiễm mỡ…),
 * hội chứng tăng ammoniac, tiền hôn mê / não gan (G93.4; K72; R79.8 bối cảnh hóa máu).
 */
const coChiDinhHopLeLOrnithinAspartat233 = (xml1) => {
    const mas = tachMaIcdDaChuanHoaTuXml1(xml1);
    const icdHopLe = (ma) => {
        if (!ma) return false;
        if (/^K7[0-7]/.test(ma)) return true;
        if (ma.startsWith('G934')) return true;
        if (ma.startsWith('R798')) return true;
        if (ma.startsWith('E722')) return true;
        return false;
    };
    if (mas.some(icdHopLe)) return true;

    const cd = `${normalizeTextNoAccent(xml1?.CHAN_DOAN_RV || '')} ${normalizeTextNoAccent(xml1?.CHAN_DOAN_VAO || '')}`.toLowerCase();
    if (/(xo gan|gan nhiem mo|nhiem mo gan|steatohepat|nafld|viem gan|benh gan|ton thuong gan|suy gan|doc gan)/i.test(cd)) return true;
    if (/(hon me gan|tien hon me|nao gan|hepatic encephalopath|encephalopath.*gan|tang ammoni|tang amoni|amoniac|cao amoni|hoi chung tang ammoni)/i.test(cd)) return true;
    if (/(roi loan nhan thuc|roi loan tri giac).{0,80}(gan|gan-|hepat)/i.test(cd)) return true;
    return false;
};

/** Trẻ 6–18 tuổi (CF / xơ nang); nếu không có tuổi → cho phép (tránh báo sai). */
const laDuoi6Den18HoSo = (xml1) => {
    const tn = TO_NUMBER(xml1?.TUOI_NAM);
    if (Number.isFinite(tn)) return tn >= 6 && tn <= 18;
    const tng = TO_NUMBER(xml1?.TUOI_NGAY);
    if (Number.isFinite(tng)) return tng >= 6 * 365 && tng < 19 * 365;
    return true;
};

/**
 * THUOC_365: Ursodeoxycholic acid (40.756) — tan sỏi mật cản quang (K80); phòng sỏi khi béo phì/giảm cân (E66);
 * PBC / xơ gan ứ mật (K74.3–6, K71, K76.8); CF gan–mật (E84, 6–18); đường mật (K83.1–9, không K83.0 cấp);
 * viêm/ bất thường đường mật nguyên phát; bối cảnh phẫu thuật / thoát dịch (chữ).
 */
const coChiDinhHopLeUrsodeoxycholic365 = (xml1) => {
    const mas = tachMaIcdDaChuanHoaTuXml1(xml1);
    const icdChinhHop = (ma) => {
        if (!ma) return false;
        if (ma.startsWith('K80')) return true;
        if (ma.startsWith('K71')) return true;
        if (/^K74[3456]/.test(ma)) return true;
        if (ma.startsWith('K768')) return true;
        if (ma.startsWith('E66')) return true;
        if (/^K83[1-9]/.test(ma)) return true;
        if (ma.startsWith('E84') && laDuoi6Den18HoSo(xml1)) return true;
        return false;
    };
    if (mas.some(icdChinhHop)) return true;

    const cd = `${normalizeTextNoAccent(xml1?.CHAN_DOAN_RV || '')} ${normalizeTextNoAccent(xml1?.CHAN_DOAN_VAO || '')}`.toLowerCase();
    if (/(soi mat|soi tu mat|soi duong mat|tan soi|can quang|khong voi hoa|cholelith)/i.test(cd)) return true;
    if (/(xo gan u mat|benh gan u mat|u mat gan|primary biliary|\bpbc\b|xo gan nguyen phat)/i.test(cd)) return true;
    if (/(beo phi|thua can|obes)/i.test(cd) && /(giam can nhanh|dot giam can|giam can sau)/i.test(cd)) return true;
    if (/(xo nang|cystic fibrosis|fibrosis dam nang|di truyen xo nang)/i.test(cd) && laDuoi6Den18HoSo(xml1)) return true;
    if (/(viem duong mat nguyen phat|primary cholangitis|xo cung duong mat|sclerosing cholang|viem mat man)/i.test(cd)) return true;
    if (/(cholestas|roi loan gan mat|roi loan mat gan)/i.test(cd)) return true;
    if (/(bao hoa cholesterol|cholesterol mat|thoat dich ta trang|fistula.*mat|fistula mat)/i.test(cd)) return true;
    if (/(tu choi phau|tu choi mo|khong phau thuat|rui ro phau thuat|nguy co gay me|nguoi cao tuoi)/i.test(cd)
        && /(soi mat|tu mat|tui mat|duong mat)/i.test(cd)) return true;
    return false;
};

const normalizeDoiTuongKcbCode = (value) => String(value || '')
    .trim()
    .replace(/,/g, '.')
    .replace(/\s+/g, '');

const normalizeMaTheBHYT = (value) => String(value || '').replace(/\s/g, '').toUpperCase();

const parseBenefitFactorFromPL10 = (rawValue, noteText = '') => {
    const raw = String(rawValue ?? '').trim();
    if (!IS_EMPTY(raw)) {
        const numeric = Number(raw.replace(',', '.'));
        if (Number.isFinite(numeric)) {
            if (numeric > 1) return numeric / 100;
            if (numeric >= 0) return numeric;
        }
    }
    const normalizedNote = normalizeTextNoAccent(noteText).toUpperCase();
    if (/KHONG\s+DUOC\s+HUONG\s+BHYT/.test(normalizedNote)) return 0;
    if (/^0%\s*CHI\s*PHI/.test(normalizedNote) || /0%\s+CHI\s+PHI\s+KCB/.test(normalizedNote)) return 0;
    return null;
};

const extractDateRangeFromRuleText = (value) => {
    const matches = Array.from(String(value || '').matchAll(/(\d{1,2})\/(\d{1,2})\/(\d{4})/g))
        .map((match) => {
            const day = String(match[1]).padStart(2, '0');
            const month = String(match[2]).padStart(2, '0');
            const year = match[3];
            return `${year}${month}${day}`;
        });
    if (matches.length >= 2) {
        return { startDate: matches[0], endDate: matches[1] };
    }
    const normalized = normalizeTextNoAccent(value).toUpperCase();
    if (matches.length === 1 && /TU\s+NGAY/.test(normalized)) {
        return { startDate: matches[0], endDate: '' };
    }
    if (matches.length === 1 && /DEN\s+NGAY/.test(normalized)) {
        return { startDate: '', endDate: matches[0] };
    }
    return { startDate: '', endDate: '' };
};

const inferEncounterScopeFromRuleText = (value) => {
    const normalized = normalizeTextNoAccent(value).toUpperCase();
    const hasNgoaiTru = normalized.includes('NGOAI TRU');
    const hasNoiTru = normalized.includes('NOI TRU');
    if (hasNgoaiTru && !hasNoiTru) return 'OUTPATIENT';
    if (hasNoiTru && !hasNgoaiTru) return 'INPATIENT';
    return 'ALL';
};

const isVariableDoiTuongRule = (value, factor) => {
    const normalized = normalizeTextNoAccent(value).toUpperCase();
    if (/TUY\s+THUOC|TUY\s+THUOC\s+VAO|TUNG\s+TRUONG\s+HOP|TRUONG\s+HOP\s+CU\s+THE/.test(normalized)) return true;
    return factor === null && !/KHONG\s+DUOC\s+HUONG\s+BHYT|0%\s+CHI\s+PHI/.test(normalized);
};

const taoBoQuyTacDoiTuongKcb = (rows = []) => {
    const byCode = new Map();
    let lastCode = '';
    let lastName = '';
    let lastLegal = '';

    normalizeRuleList(rows).forEach((row) => {
        const rawCode = normalizeDoiTuongKcbCode(
            layGiaTriAnToan(row, 'MÃ ĐỐI TƯỢNG')
            || row?.MA_DOI_TUONG
            || row?.MA_DOITUONG
            || ''
        );
        const code = rawCode || lastCode;
        if (!code) return;
        const rawName = String(
            layGiaTriAnToan(row, 'TÊN ĐỐI TƯỢNG')
            || row?.TEN_DOI_TUONG
            || row?.TEN_DOITUONG
            || ''
        ).trim();
        const note = String(layGiaTriAnToan(row, 'GHI CHÚ') || row?.GHI_CHU || '').trim();
        const rawLegal = String(layGiaTriAnToan(row, 'Quy định') || row?.QUY_DINH || '').trim();
        const rawFactorValue = layGiaTriAnToan(row, 'MỨC HƯỞNG (%)');

        if (rawCode) lastCode = code;
        if (rawName) lastName = rawName;
        if (rawLegal) lastLegal = rawLegal;

        const name = rawName || lastName;
        const legalBasis = rawLegal || lastLegal;
        const mergedText = `${name} ${note} ${legalBasis}`;
        const factor = parseBenefitFactorFromPL10(rawFactorValue, note);
        const normalizedMergedText = normalizeTextNoAccent(mergedText).toUpperCase();

        const rule = {
            code,
            name,
            note,
            legalBasis,
            factor,
            benefitPercent: typeof factor === 'number' ? Math.round(factor * 1000) / 10 : null,
            scope: inferEncounterScopeFromRuleText(mergedText),
            ...extractDateRangeFromRuleText(mergedText),
            independentFromCard: /KHONG\s+PHU\s+THUOC\s+MUC\s+HUONG\s+TREN\s+THE\s+BHYT/.test(normalizedMergedText),
            dependsOnCardBenefit: /THEO\s+PHAM\s+VI\s+QUYEN\s+LOI,\s*MUC\s+HUONG/.test(normalizedMergedText),
            zeroCoverage: factor === 0 || (factor === null && /KHONG\s+DUOC\s+HUONG\s+BHYT|0%\s+CHI\s+PHI\s+KCB/.test(normalizedMergedText)),
            variableCase: isVariableDoiTuongRule(mergedText, factor),
        };

        const bucket = byCode.get(code) || [];
        bucket.push(rule);
        byCode.set(code, bucket);
    });

    return {
        validCodes: new Set(byCode.keys()),
        byCode,
    };
};

const layThongTinMucHuongTuThe = (xml1) => {
    const normalized = normalizeMaTheBHYT(xml1?.MA_THE_BHYT);
    const validFormat = MA_THE_BHYT_REGEX.test(normalized);
    const code = validFormat ? KY_HIEU_SO_THU_BA_THE_CHO_TYLE_TT({ ...xml1, MA_THE_BHYT: normalized }) : '';
    return {
        normalized,
        validFormat,
        benefitCode: code,
        benefitPercent: Object.prototype.hasOwnProperty.call(CARD_BENEFIT_CODE_MAP, code)
            ? CARD_BENEFIT_CODE_MAP[code]
            : null,
    };
};

const CO_TU_KHOA_KHAM_SUC_KHOE_THEO_YEU_CAU = (xml1 = {}) => {
    const noiDung = normalizeTextNoAccent([
        xml1?.LY_DO_VV,
        xml1?.LY_DO_VAO,
        xml1?.CHAN_DOAN_VAO,
    ].filter(Boolean).join(' ')).toUpperCase();
    if (!noiDung) return false;
    return (
        noiDung.includes('KHAM SUC KHOE')
        || noiDung.includes('THEO YEU CAU')
        || noiDung.includes('KIEM TRA')
    );
};

/** ICD-10 Z34* — Giám sát thai kỳ bình thường (khám thai định kỳ); không áp HC-07c cùng cờ từ khóa Điều 23 như các mã Z khác. */
const LA_ICD_Z34_KHAM_THAI_BINH_THUONG = (maBenhChinhUpper = '') => {
    const m = String(maBenhChinhUpper || '').trim().replace(/\./g, '');
    return /^Z34/i.test(m);
};

const chuanHoaCoKhong = (val) => {
    const s = normalizeTextNoAccent(String(val || '')).toUpperCase().trim();
    if (!s) return '';
    if (['CO', 'C', 'YES', 'Y', 'TRUE', '1'].includes(s)) return 'CO';
    if (['KHONG', 'K', 'NO', 'N', 'FALSE', '0'].includes(s)) return 'KHONG';
    return s;
};

const chuanHoaTyLePhanTram = (val) => {
    const n = TO_NUMBER(String(val || '').replace('%', ''));
    if (!Number.isFinite(n) || n <= 0) return null;
    if (n <= 1) return Math.round(n * 100);
    return Math.round(n);
};

const taoMetaMaTheQuyenLoiTuDanhMuc = (rows = []) => {
    const byMa = new Map();
    for (const row of (Array.isArray(rows) ? rows : [])) {
        const ma = UPPER(row?.MA || '');
        if (!ma || ma === 'MÃ' || ma.length < 3) continue;
        const maNhomThe = UPPER(row?.MA_NHOM_THE || SUBSTR(ma, 1, 2));
        const maQuyenLoi = String(row?.MA_QUYEN_LOI || SUBSTR(ma, 3, 1) || '').trim();
        if (!maNhomThe || !maQuyenLoi) continue;
        const item = {
            ma,
            maNhomThe,
            maQuyenLoi,
            ten: String(row?.TEN || '').trim(),
            nhomDoiTuong: String(row?.NHOM_DOI_TUONG_BHYT || '').trim(),
            tyLeHuong: chuanHoaTyLePhanTram(row?.TY_LE_HUONG_BHYT),
            huongChiPhiChuyenTuyen: chuanHoaCoKhong(row?.DOI_TUONG_HUONG_CHI_PHI_CHUYEN_TUYEN),
            hieuLucThiHanh: chuanHoaCoKhong(row?.HIEU_LUC_THI_HANH),
            tuNgay: normalizeDateKey(row?.TU_NGAY || '').slice(0, 8),
            denNgay: normalizeDateKey(row?.DEN_NGAY || '', '9').slice(0, 8),
            mieuTa: String(row?.MIEU_TA || '').trim(),
        };
        if (!byMa.has(ma)) byMa.set(ma, []);
        byMa.get(ma).push(item);
    }
    return byMa;
};

const layQuyTacTheoMaTheVaQuyenLoi = (xml1 = {}, dm = {}) => {
    const maThe = normalizeMaTheBHYT(xml1?.MA_THE_BHYT);
    if (!MA_THE_BHYT_REGEX.test(maThe)) return null;
    const maNhomThe = SUBSTR(maThe, 1, 2);
    const maQuyenLoi = KY_HIEU_SO_THU_BA_THE_BHYT({ ...xml1, MA_THE_BHYT: maThe });
    const maTong = `${maNhomThe}${maQuyenLoi}`;
    const byMa = dm?.MAP_MA_THE_QUYEN_LOI instanceof Map
        ? dm.MAP_MA_THE_QUYEN_LOI
        : taoMetaMaTheQuyenLoiTuDanhMuc(dm?.DM_MA_THE_QUYEN_LOI_ROWS || []);
    const bucket = byMa.get(maTong) || [];
    if (bucket.length === 0) return null;
    const ngayVao = normalizeDateKey(xml1?.NGAY_VAO || xml1?.NGAY_RA || xml1?.NGAY_TTOAN || '').slice(0, 8);
    const trongHieuLuc = bucket.filter((rule) => {
        if (!ngayVao) return true;
        if (rule.tuNgay && ngayVao < rule.tuNgay) return false;
        if (rule.denNgay && ngayVao > rule.denNgay) return false;
        return true;
    });
    const candidates = trongHieuLuc.length > 0 ? trongHieuLuc : bucket;
    return candidates.sort((a, b) => {
        const s = (x) => (x.tuNgay ? Number(x.tuNgay) : 0);
        return s(b) - s(a);
    })[0] || null;
};

const laDieuTriNgoaiTru = (xml1 = {}) => {
    return laHoSoNgoaiTruTheoQd824(xml1);
};

/** VBHN 17 — đếm số ngày điều trị nội trú (tiền giường): (d) ≤4h→0; (c) >4h–<24h cùng ngày hoặc qua đêm→1; (a) D+1 hoặc (b) D. Chỉ nội trú; ngoại trú trả null. */
const KY_VONG_SO_NGAY_DTRI_VBHN17 = (x1) => {
    if (!x1 || laDieuTriNgoaiTru(x1)) return null;
    if (IS_EMPTY(x1.NGAY_VAO) || IS_EMPTY(x1.NGAY_RA)) return null;
    const h = DIFF_HOURS(x1.NGAY_VAO, x1.NGAY_RA);
    const d = DIFF_DAYS(x1.NGAY_VAO, x1.NGAY_RA);
    const ketQua = String(x1.KET_QUA_DTRI || '').trim();
    const maLoaiRv = String(x1.MA_LOAI_RV || '').trim();
    if (h <= 4) return 0;
    if (h < 24 && (d === 0 || d === 1)) return 1;
    const apDungCongMotNgay = ketQua === '5' || maLoaiRv === '2' || maLoaiRv === '3';
    return apDungCongMotNgay ? (d + 1) : d;
};

/** Trẻ &lt; 15 ngày tuổi, họ tên theo mẹ (tiền tố CB hoặc Con bà) — không áp dụng HC_39 / HC_40. */
const NGOAI_TRU_HC39_HC40_TRE_SO_SINH = (x1) => {
    if (!x1) return false;
    let tuoiNgay = TO_NUMBER(x1.TUOI_NGAY);
    if (!(Number.isFinite(tuoiNgay) && tuoiNgay >= 0) && !IS_EMPTY(x1.NGAY_SINH)) {
        const moc = x1.NGAY_VAO || x1.NGAY_RA || x1.NGAY_TTOAN || '';
        if (!IS_EMPTY(moc)) tuoiNgay = DIFF_DAYS(x1.NGAY_SINH, moc);
    }
    if (!Number.isFinite(tuoiNgay) || tuoiNgay < 0 || tuoiNgay >= 15) return false;
    const ten = String(x1.HO_TEN || '').trim();
    if (!ten) return false;
    const u = normalizeTextNoAccent(ten).toUpperCase();
    if (u.startsWith('CON BA')) return true;
    if (u.startsWith('CB')) {
        if (u.length <= 2) return true;
        const c3 = u.charAt(2);
        if (' .,-_/'.includes(c3)) return true;
    }
    return false;
};

/**
 * HC_65: Có mốc chỉ định / thực hiện / trả KQ (XML2–4) nằm ngoài [NGAY_VAO, NGAY_RA] (so sánh sau khi parse YYYYMMDDHHmm).
 * Không dùng NGAY_TTOAN vs NGAY_RA — thanh toán có thể trước giờ ra viện.
 */
const HC_65_CO_MOC_DV_NGOAI_KHOANG_VAO_RA = (xml1, xml2, xml3, xml4) => {
    const vaoMs = parseNgayGioXmlThanhMs(xml1?.NGAY_VAO);
    const raMs = parseNgayGioXmlThanhMs(xml1?.NGAY_RA);
    if (vaoMs == null || raMs == null) return false;
    const ngoaiKhoang = (ms) => ms != null && (ms < vaoMs || ms > raMs);
    const xet = (...vals) => vals.some((v) => ngoaiKhoang(parseNgayGioXmlThanhMs(v)));
    const r2 = Array.isArray(xml2) ? xml2 : [];
    const r3 = Array.isArray(xml3) ? xml3 : [];
    const r4 = Array.isArray(xml4) ? xml4 : [];
    for (let i = 0; i < r2.length; i += 1) {
        if (xet(r2[i]?.NGAY_YL)) return true;
    }
    for (let i = 0; i < r3.length; i += 1) {
        const row = r3[i];
        if (xet(row?.NGAY_YL, row?.NGAY_TH_YL, row?.NGAY_KQ)) return true;
    }
    for (let i = 0; i < r4.length; i += 1) {
        if (xet(r4[i]?.NGAY_KQ)) return true;
    }
    return false;
};

const laQuyTacDoiTuongApDung = (rule, xml1 = {}) => {
    if (!rule) return false;
    const ngayKey = normalizeDateKey(xml1?.NGAY_RA || xml1?.NGAY_VAO || xml1?.NGAY_TTOAN).slice(0, 8);
    const outpatient = laDieuTriNgoaiTru(xml1);
    if (rule.scope === 'OUTPATIENT' && !outpatient) return false;
    if (rule.scope === 'INPATIENT' && outpatient) return false;
    if (rule.startDate && ngayKey && ngayKey < rule.startDate) return false;
    if (rule.endDate && ngayKey && ngayKey > rule.endDate) return false;
    return true;
};

const layQuyTacDoiTuongKcbApDung = (xml1 = {}, dm) => {
    const code = normalizeDoiTuongKcbCode(xml1?.MA_DOITUONG_KCB);
    const bucket = dm?.BO_QUY_TAC_DOI_TUONG_KCB?.byCode?.get(code) || [];
    if (bucket.length === 0) return null;
    const matched = bucket.filter((rule) => laQuyTacDoiTuongApDung(rule, xml1));
    const coQuyTacRangBuoc = bucket.some((rule) => rule?.scope !== 'ALL' || rule?.startDate || rule?.endDate);
    if (matched.length === 0 && coQuyTacRangBuoc) return null;
    const candidates = matched.length > 0 ? matched : bucket;
    return [...candidates].sort((a, b) => {
        const score = (rule) => {
            let total = 0;
            if (rule.scope !== 'ALL') total += 10;
            if (rule.startDate || rule.endDate) total += 5;
            if (rule.independentFromCard) total += 3;
            if (rule.variableCase) total -= 5;
            if (typeof rule.factor === 'number') total += rule.factor * 10;
            return total;
        };
        return score(b) - score(a);
    })[0] || null;
};

const laDoiTuongKcbHopLeMoRong = (val, dm) => {
    const raw = normalizeDoiTuongKcbCode(val);
    if (!raw) return true;
    if (dm?.BO_QUY_TAC_DOI_TUONG_KCB?.validCodes?.size) {
        return dm.BO_QUY_TAC_DOI_TUONG_KCB.validCodes.has(raw);
    }
    if (/^\d+$/.test(raw)) {
        const n = Number(raw);
        return Number.isFinite(n) && n >= 1 && n <= 14;
    }
    if (/^\d+\.\d+$/.test(raw)) {
        const base = Number(raw.split('.')[0]);
        return Number.isFinite(base) && base >= 1 && base <= 14;
    }
    return false;
};

const laDichVuCDHA = (row) => {
    if (!row) return false;
    const maNhom = String(row.MA_NHOM || '').trim();
    const tenDv = UPPER(row.TEN_DICH_VU || row.TEN_CHI_SO || row.MO_TA || '');
    if (maNhom === '2') return true;
    return /(X[\s-]?QUANG|SIEU[\s-]?AM|CT[\s-]?SCAN|MRI|NOI[\s-]?SOI|CHAN[\s-]?DOAN[\s-]?HINH[\s-]?ANH|CDHA)/i.test(tenDv);
};

const coDichVuVanChuyen = (xml3 = []) => xml3.some((row) =>
    /(VAN[\s-]?CHUYEN|CHUYEN[\s-]?TUYEN|VAN CHUYEN|CHUYEN TUYEN)/i.test(UPPER(row?.TEN_DICH_VU || ''))
);

const tachDanhSachMaIcdTuRule = (raw = '') => String(raw || '')
    .split(/[;,|]/)
    .map((x) => String(x || '').trim().toUpperCase())
    .filter(Boolean);

const tachDanhSachTuKhoaTuRule = (raw = '') => String(raw || '')
    .split(/[;,|]/)
    .map((x) => normalizeTextNoAccent(String(x || '')).toUpperCase().trim())
    .filter(Boolean);

const layTuoiNamHoSo = (xml1 = {}) => {
    const tuoiNam = TO_NUMBER(xml1?.TUOI);
    if (Number.isFinite(tuoiNam) && tuoiNam > 0) return tuoiNam;
    const tuoiNgay = TO_NUMBER(xml1?.TUOI_NGAY);
    if (Number.isFinite(tuoiNgay) && tuoiNgay > 0) return tuoiNgay / 365;
    if (!IS_EMPTY(xml1?.NGAY_SINH) && !IS_EMPTY(xml1?.NGAY_VAO)) return DIFF_YEARS(xml1.NGAY_SINH, xml1.NGAY_VAO);
    return null;
};

const coCumTuChiDinhTuoiDuoi6 = (rule = {}, dongThuoc = {}) => {
    const blob = normalizeTextNoAccent(
        `${rule?.TEN_QUY_TAC || ''} ${rule?.TU_KHOA_YEU_CAU || ''} ${rule?.CANH_BAO_CDSS_ALERT || ''} ${dongThuoc?.HOAT_CHAT || ''}`,
    ).toUpperCase();
    return /(DUOI\s*6\s*TUOI|TRE\s*EM\s*DUOI\s*6|<=\s*6\s*TUOI|TU\s*6\s*TUOI\s*TRO\s*XUONG|TUOI\s*<=\s*6)/.test(blob);
};

const coIcdPhuHopThuocDieuKien = (icdChinh = '', icdKem = '', dsIcdRule = []) => {
    if (!Array.isArray(dsIcdRule) || dsIcdRule.length === 0) return false;
    const tapIcdHoSo = new Set([
        UPPER(icdChinh || ''),
        ...String(icdKem || '')
            .split(/[;,\s|]+/)
            .map((x) => String(x || '').trim().toUpperCase())
            .filter(Boolean),
    ]);
    for (const icd of dsIcdRule) {
        if (!icd) continue;
        for (const h of tapIcdHoSo) {
            if (!h) continue;
            if (h === icd || h.startsWith(`${icd}.`) || icd.startsWith(`${h}.`)) return true;
        }
    }
    return false;
};

const coTuKhoaChanDoanPhuHop = (xml1 = {}, rule = {}) => {
    const textRv = normalizeTextNoAccent(String(xml1?.CHAN_DOAN_RV || '')).toUpperCase();
    const tapTuKhoa = [
        ...tachDanhSachTuKhoaTuRule(rule?.CHAN_DOAN || ''),
        ...tachDanhSachTuKhoaTuRule(rule?.TU_KHOA_YEU_CAU || ''),
    ];
    const tapLoc = tapTuKhoa.filter((x) => x.length >= 3);
    if (tapLoc.length === 0) return true;
    return tapLoc.some((kw) => textRv.includes(kw));
};

const giamDinhThuocDieuKienThanhToan = (hoSo, dm) => {
    const ds = [];
    const xml1 = _getXML1(hoSo);
    const xml2 = layDanhSachXml(hoSo, 'XML2');
    const rules = Array.isArray(dm?.DM_THUOC_DIEU_KIEN_TT_ROWS) ? dm.DM_THUOC_DIEU_KIEN_TT_ROWS : [];
    if (!xml1 || !Array.isArray(xml2) || xml2.length === 0 || rules.length === 0) return ds;

    const byMaThuoc = new Map();
    rules.forEach((r) => {
        const ma = UPPER(r?.MA_THUOC_QD7603 || '');
        if (!ma) return;
        if (!byMaThuoc.has(ma)) byMaThuoc.set(ma, []);
        byMaThuoc.get(ma).push(r);
    });

    const maBenhChinh = UPPER(xml1?.MA_BENH_CHINH || '');
    const maBenhKt = String(xml1?.MA_BENH_KT || '');
    const tuoiNam = layTuoiNamHoSo(xml1);

    xml2.forEach((row, idx) => {
        if (laBHYTKhôngThanhToan(row)) return;
        const maThuoc = UPPER(row?.MA_THUOC || '');
        if (!maThuoc) return;
        const danhSachRule = byMaThuoc.get(maThuoc) || [];
        if (danhSachRule.length === 0) return;

        danhSachRule.forEach((rule, ridx) => {
            const dsIcdRule = tachDanhSachMaIcdTuRule(rule?.MA_ICD10 || '');
            const hopIcd = coIcdPhuHopThuocDieuKien(maBenhChinh, maBenhKt, dsIcdRule);
            const hopChanDoan = coTuKhoaChanDoanPhuHop(xml1, rule);
            const canDuoi6 = coCumTuChiDinhTuoiDuoi6(rule, row);
            const hopTuoi = !canDuoi6 || (tuoiNam != null && tuoiNam <= 6);
            const hopLe = hopIcd && hopChanDoan && hopTuoi;
            if (hopLe) return;

            const maLuat = String(rule?.MA_GIAM_DINH || '').trim() || `THUOC_DKTT_${ridx + 1}`;
            const noiDungMacDinh = `[XUẤT TOÁN] Thuốc (${maThuoc}) không đủ điều kiện thanh toán theo danh mục thuốc điều kiện thanh toán (ICD-10/chẩn đoán ra/yêu cầu đi kèm).`;
            const canhBao = String(rule?.CANH_BAO_CDSS_ALERT || '').trim() || noiDungMacDinh;
            ds.push({
                phan_he: 'XML2',
                index: idx,
                truong_loi: 'MA_THUOC',
                canh_bao: canhBao,
                muc_do: 'Critical',
                ma_luat: maLuat,
                ten_quy_tac: String(rule?.TEN_QUY_TAC || 'Thuốc điều kiện thanh toán').trim(),
                dieu_kien: 'BUILT-IN',
                co_so_phap_ly: CO_SO_PHAP_LY_THUOC.DANH_MUC_BHYT,
            });
        });
    });

    return ds;
};

const coDichVuSauNgayRa = (hoSo, xml1) => {
    const ngayRa = normalizeDateKey(xml1?.NGAY_RA, '9');
    if (!ngayRa) return false;
    const checks = ['XML2', 'XML3', 'XML4', 'XML5', 'XML6'].flatMap((xmlKey) =>
        layDanhSachXml(hoSo, xmlKey).map((row) => ({
            ngayTh: normalizeDateKey(row?.NGAY_TH_YL),
            ngayYl: normalizeDateKey(row?.NGAY_YL),
            ngayKq: normalizeDateKey(row?.NGAY_KQ),
        }))
    );
    return checks.some((item) => [item.ngayTh, item.ngayYl, item.ngayKq].some((ngay) => ngay && ngay > ngayRa));
};

const tinhChenhTongChi = (xml1) => {
    const tong =
        TO_NUMBER(xml1?.T_BNTT)
        + TO_NUMBER(xml1?.T_BNCCT)
        + TO_NUMBER(xml1?.T_BHTT)
        + TO_NUMBER(xml1?.T_NGUONKHAC)
        + TO_NUMBER(xml1?.T_NGOAIDS);
    return Math.abs(TO_NUMBER(xml1?.T_TONGCHI_BV) - tong);
};

const laMaIcdHopLe = (maIcd, dm) => {
    const raw = UPPER(maIcd || '');
    if (!raw) return false;
    if (!dm?.MAP_ICD10 || dm.MAP_ICD10.size === 0) {
        return /^[A-TV-Z][0-9]{2}(\.[0-9A-Z]{1,2})?$/.test(raw);
    }
    const noDot = raw.replace(/\./g, '');
    if (dm.MAP_ICD10.has(raw) || dm.MAP_ICD10.has(noDot)) return true;
    for (const key of dm.MAP_ICD10.keys()) {
        if (String(key || '').replace(/\./g, '').toUpperCase() === noDot) return true;
    }
    return false;
};

const ICD_TOKEN_REGEX = /[A-TV-Z]\d{2}(?:\.[0-9A-Z]{1,2})?/g;

const normalizeIcdComparable = (value) => UPPER(value || '')
    .replace(/[^A-Z0-9.]/g, '');

/** Khóa khớp bảng TT 06/2026 (icd10_tt06_bang_ma.jsx): bỏ dấu chấm, giống script build. */
const khoaBangIcd10TT06 = (maIcd) => String(normalizeIcdComparable(maIcd) || '').replace(/\./g, '');

const parseIcdComparable = (value) => {
    const normalized = normalizeIcdComparable(value).replace(/\./g, '');
    const match = normalized.match(/^([A-TV-Z])(\d{2})([0-9A-Z]{0,2})$/);
    if (!match) return null;
    return {
        letter: match[1],
        major: parseInt(match[2], 10),
        suffix: match[3] || '',
        normalized,
    };
};

const buildIcdComparableKey = (parsed) => {
    if (!parsed) return '';
    return `${parsed.letter}${String(parsed.major).padStart(2, '0')}${String(parsed.suffix || '').padEnd(2, '0')}`;
};

const buildIcdCategoryKey = (parsed) => {
    if (!parsed) return '';
    return `${parsed.letter}${String(parsed.major).padStart(2, '0')}`;
};

const parseIcdRulesFromText = (value) => {
    const normalizedText = String(value || '')
        .toUpperCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/Đ/g, 'D');
    const ranges = [];
    const cleanedText = normalizedText.replace(
        /([A-TV-Z]\d{2}(?:\.[0-9A-Z]{1,2})?)\s*(?:DEN|-|–|—)\s*([A-TV-Z]\d{2}(?:\.[0-9A-Z]{1,2})?)/g,
        (_, start, end) => {
            const parsedStart = parseIcdComparable(start);
            const parsedEnd = parseIcdComparable(end);
            if (parsedStart && parsedEnd) ranges.push({ start: parsedStart, end: parsedEnd });
            return ' ';
        }
    );
    const exact = new Set((cleanedText.match(ICD_TOKEN_REGEX) || [])
        .map((item) => normalizeIcdComparable(item).replace(/\./g, ''))
        .filter(Boolean));
    return { exact, ranges };
};

const taoBoQuyTacIcdKeDonTren30Ngay = (rows = []) => {
    const exact = new Set();
    const ranges = [];
    normalizeRuleList(rows).forEach((row) => {
        const source = row?.['Mã bệnh theo ICD 10']
            || row?.['Ma benh theo ICD 10']
            || row?.MA_BENH_THEO_ICD_10
            || row?.MA_BENH_ICD10
            || '';
        const parsed = parseIcdRulesFromText(source);
        parsed.exact.forEach((code) => exact.add(code));
        ranges.push(...parsed.ranges);
    });
    return { exact, ranges };
};

const extractIcdCodesFromClaim = (...values) => {
    const seen = new Set();
    values.forEach((value) => {
        (String(value || '').toUpperCase().match(ICD_TOKEN_REGEX) || []).forEach((code) => {
            const normalized = normalizeIcdComparable(code);
            if (normalized) seen.add(normalized);
        });
    });
    return Array.from(seen);
};

/** Gom token ICD từ XML1 + các XML phụ (XML9–15, kể cả nằm trong _raw) để đối chiếu chỉ định thuốc. */
const layMaIcdTuHoSoMoRongChoThuoc = (hoSo, xml1) => {
    const chunks = [
        xml1?.MA_BENH_CHINH,
        xml1?.MA_BENH_KT,
        xml1?.CHAN_DOAN_RV,
        xml1?.MA_BENH,
    ];
    ['XML9', 'XML10', 'XML11', 'XML12', 'XML13', 'XML14', 'XML15'].forEach((key) => {
        layDanhSachXml(hoSo, key).forEach((row) => {
            if (!row || typeof row !== 'object') return;
            Object.values(row).forEach((v) => {
                if (v !== null && v !== undefined && String(v).trim() !== '') chunks.push(v);
            });
        });
    });
    return extractIcdCodesFromClaim(...chunks);
};

const coIcdChiDinhDiosminHesperidin = (hoSo, xml1) => {
    const codes = layMaIcdTuHoSoMoRongChoThuoc(hoSo, xml1);
    return codes.some((code) => {
        const noDot = String(code || '').replace(/\./g, '').toUpperCase();
        return noDot.startsWith('I83') || noDot.startsWith('I84') || noDot.startsWith('I87');
    });
};

/** Khớp nội dung chẩn đoán mở rộng (XML1 + diễn biến XML5) với từ khóa nhóm Diosmin/Hesperidin trong luật THUOC_131. */
const coVanBanChanDoanHoTroDiosmin = (hoSo, xml1) => {
    const parts = [
        xml1?.CHAN_DOAN_RV,
        ...layDanhSachXml(hoSo, 'XML5').flatMap((r) => [r?.DIEN_BIEN, r?.DIEN_BIEN_LS, r?.GIAI_DOAN_BENH, r?.MO_TA]),
    ].filter((v) => v !== null && v !== undefined && String(v).trim() !== '');
    const blob = normalizeTextNoAccent(parts.join(' ')).toUpperCase();
    return /(GIAN TINH MACH|SUY TINH MACH CHI DUOI|TRI\b|SUY TINH MACH\b|TINH MACH MAN)/.test(blob);
};

const coCoSoLamSangHoacIcdChoDiosminHesperidin = (hoSo, xml1) => (
    coIcdChiDinhDiosminHesperidin(hoSo, xml1) || coVanBanChanDoanHoTroDiosmin(hoSo, xml1)
);

const isIcdInAllowed30DayCatalog = (code, ruleSet) => {
    const parsed = parseIcdComparable(code);
    if (!parsed) return false;
    const noDot = parsed.normalized;
    const categoryKey = buildIcdCategoryKey(parsed);
    if (ruleSet?.exact?.has(noDot) || ruleSet?.exact?.has(categoryKey)) return true;
    const candidateCategoryKey = buildIcdCategoryKey(parsed);
    const candidateFullKey = buildIcdComparableKey(parsed);
    return normalizeRuleList(ruleSet?.ranges).some((range) => {
        const start = range?.start;
        const end = range?.end;
        if (!start || !end) return false;
        const startHasSuffix = LEN(start.suffix) > 0;
        const endHasSuffix = LEN(end.suffix) > 0;
        if (!startHasSuffix && !endHasSuffix) {
            const startKey = buildIcdCategoryKey(start);
            const endKey = buildIcdCategoryKey(end);
            return candidateCategoryKey >= startKey && candidateCategoryKey <= endKey;
        }
        const startKey = buildIcdComparableKey(start);
        const endKey = buildIcdComparableKey(end);
        return candidateFullKey >= startKey && candidateFullKey <= endKey;
    });
};

const isClaimAllowedPrescriptionOver30Days = (xml1, dm) => {
    const ruleSet = dm?.BO_QUY_TAC_ICD10_KE_DON_TREN_30_NGAY;
    if ((!ruleSet?.exact || ruleSet.exact.size === 0) && (!Array.isArray(ruleSet?.ranges) || ruleSet.ranges.length === 0)) {
        return false;
    }
    const icdCodes = extractIcdCodesFromClaim(
        xml1?.MA_BENH_CHINH,
        xml1?.MA_BENH_KT,
        xml1?.MA_BENH,
        xml1?.MA_BENHKEM,
        xml1?.MA_BENHKT,
    );
    return icdCodes.some((code) => isIcdInAllowed30DayCatalog(code, ruleSet));
};

const layRuleSetKeDon30Ngay = (dm) => dm?.BO_QUY_TAC_ICD10_KE_DON_TREN_30_NGAY;

const tatCaMaIcdThuocDanhMucKeDon30Ngay = (codes, ruleSet) => {
    const arr = Array.isArray(codes) ? codes : [];
    if (arr.length === 0) return false;
    return arr.every((code) => isIcdInAllowed30DayCatalog(code, ruleSet));
};

/**
 * Hồ sơ phải kê đơn >30 ngày theo Phụ lục VII TT 26/2025:
 * - Chỉ bệnh chính thuộc danh mục, không có bệnh kèm; hoặc
 * - Bệnh chính và mọi mã bệnh kèm theo đều thuộc danh mục.
 */
const hoSoPhaiKeDonTren30NgayTheoDmTT26 = (xml1, dm) => {
    const ruleSet = layRuleSetKeDon30Ngay(dm);
    if ((!ruleSet?.exact || ruleSet.exact.size === 0) && (!Array.isArray(ruleSet?.ranges) || ruleSet.ranges.length === 0)) {
        return false;
    }
    const maChinh = extractIcdCodesFromClaim(xml1?.MA_BENH_CHINH);
    const maKem = extractIcdCodesFromClaim(xml1?.MA_BENH_KT, xml1?.MA_BENHKEM, xml1?.MA_BENHKT);
    if (!tatCaMaIcdThuocDanhMucKeDon30Ngay(maChinh, ruleSet)) return false;
    if (maKem.length === 0) return true;
    return tatCaMaIcdThuocDanhMucKeDon30Ngay(maKem, ruleSet);
};

const moTaDieuKienKeDon30NgayTT26 = (xml1) => {
    const maChinh = String(xml1?.MA_BENH_CHINH || '').trim() || 'N/A';
    const maKemRaw = String(xml1?.MA_BENH_KT || xml1?.MA_BENHKEM || '').trim();
    const maKem = extractIcdCodesFromClaim(xml1?.MA_BENH_KT, xml1?.MA_BENHKEM, xml1?.MA_BENHKT);
    if (maKem.length === 0) {
        return `bệnh chính [${maChinh}] thuộc danh mục Phụ lục VII TT 26/2025 và không có bệnh kèm theo`;
    }
    return `bệnh chính [${maChinh}] và bệnh kèm theo [${maKemRaw || 'N/A'}] đều thuộc danh mục Phụ lục VII TT 26/2025`;
};

/**
 * Đường dùng tiêm / chích / truyền theo XML2 (MA_DUONG_DUNG PL BYT — nhóm 2.x; bổ sung từ khóa DUONG_DUNG).
 * Dùng để ngoại lệ gợi ý kê đơn >30 ngày theo danh mục ICD (thuốc tiêm thường tách luồng nghiệp vụ).
 */
const laMaDuongDungTiêmHoặcChích = (e) => {
    if (!e || typeof e !== 'object') return false;
    const md = String(e.MA_DUONG_DUNG || '').trim().replace(/\s+/g, '');
    if (md && md.startsWith('2.')) return true;
    const blob = normalizeTextNoAccent(
        `${e.DUONG_DUNG || ''} ${e.TEN_DUONG_DUNG || ''} ${e.LIEU_DUNG || ''}`,
    ).toUpperCase();
    return /TIEM|CHICH|TRUYEN|TINH MACH|DUOI DA|PHA CO|CO TRUNG|DICH TRUYEN|INJECTION|\bIV\b|I\.V/.test(blob);
};

const coBHYTThuocTiêmChíchTrongHoSo = (hoSo) => {
    const xml2 = hoSo.XML2 || hoSo.xml2 || [];
    if (!Array.isArray(xml2)) return false;
    for (let i = 0; i < xml2.length; i += 1) {
        if (laBHYTKhôngThanhToan(xml2[i])) continue;
        const row = enrichXML2Data(xml2[i]);
        if (laMaDuongDungTiêmHoặcChích(row)) return true;
    }
    return false;
};

const layChiTietHuongBHYT = (hoSo) => ['XML2', 'XML3']
    .flatMap((xmlKey) => layDanhSachXml(hoSo, xmlKey))
    .filter((row) => {
        if (laBHYTKhôngThanhToan(row)) return false;
        return TO_NUMBER(row?.THANH_TIEN_BH) > 0 || TO_NUMBER(row?.T_BHTT) > 0 || TO_NUMBER(row?.MUC_HUONG) > 0;
    });

const giamDinhQuyenLoiTheoDoiTuongVaThe = (hoSo, dm) => {
    const ds = [];
    const xml1 = _getXML1(hoSo);
    if (!xml1) return ds;

    const addLỗi = (maLuat, ten, noiDung, mucDo, truong, coSoPhapLy = '') => ds.push({
        phan_he: 'XML1',
        index: -1,
        truong_loi: truong || maLuat,
        canh_bao: noiDung,
        muc_do: mucDo,
        ma_luat: maLuat,
        ten_quy_tac: ten,
        dieu_kien: 'BUILT-IN',
        co_so_phap_ly: coSoPhapLy || layCoSoPhapLyHanhChinh('HC-06'),
    });

    const rule = layQuyTacDoiTuongKcbApDung(xml1, dm);
    if (!rule || rule.variableCase) return ds;

    const chiTietHuong = layChiTietHuongBHYT(hoSo);
    const mucHuongValues = chiTietHuong
        .map((row) => Math.max(0, TO_NUMBER(row?.MUC_HUONG)))
        .filter((value) => value > 0);
    const coPhatSinhThanhToanBHYT = TO_NUMBER(xml1.T_BHTT) > 0 || TO_NUMBER(xml1.T_BNCCT) > 0 || chiTietHuong.length > 0;
    const thongTinThe = layThongTinMucHuongTuThe(xml1);
    const quyTacMaThe = layQuyTacTheoMaTheVaQuyenLoi(xml1, dm);

    if (quyTacMaThe) {
        const xml3 = layDanhSachXml(hoSo, 'XML3');
        const coHuongChiPhiChuyenTuyen = (
            ['2', '3'].includes(String(xml1.MA_LOAI_RV || '').trim())
            || !IS_EMPTY(xml1.GIAY_CHUYEN_TUYEN)
            || coDichVuVanChuyen(xml3)
        );
        if (coHuongChiPhiChuyenTuyen && quyTacMaThe.huongChiPhiChuyenTuyen === 'KHONG') {
            addLỗi(
                'HC-06e',
                'Quyền lợi chi phí chuyển tuyến theo mã thẻ',
                `Mã [${quyTacMaThe.ma}] không thuộc nhóm được hưởng chi phí chuyển tuyến theo danh mục «Mã thẻ và quyền lợi», nhưng hồ sơ có dấu hiệu phát sinh chuyển tuyến/vận chuyển.`,
                'Warning',
                'GIAY_CHUYEN_TUYEN'
            );
        }
    }

    if (rule.zeroCoverage && coPhatSinhThanhToanBHYT) {
        addLỗi(
            'HC-06b',
            'Quyền lợi BHYT theo đối tượng',
            `Mã đối tượng KCB [${rule.code}] tại thời điểm tiếp nhận thuộc diện không được hưởng BHYT, nhưng hồ sơ vẫn phát sinh thanh toán BHYT/cùng chi trả.`,
            'Critical',
            'MA_DOITUONG_KCB',
            rule.legalBasis || layCoSoPhapLyHanhChinh('HC-06')
        );
        return ds;
    }

    if (rule.independentFromCard && mucHuongValues.length > 0) {
        const minMucHuong = Math.min(...mucHuongValues);
        if (minMucHuong < 95) {
            addLỗi(
                'HC-06c',
                'Quyền lợi BHYT theo đối tượng',
                `Mã đối tượng KCB [${rule.code}] thuộc diện hưởng 100% không phụ thuộc mức hưởng trên thẻ BHYT, nhưng hồ sơ có mức hưởng chi tiết thấp nhất là ${minMucHuong}%.`,
                'Warning',
                'MUC_HUONG',
                rule.legalBasis || layCoSoPhapLyHanhChinh('HC-06')
            );
        }
        return ds;
    }

    if (
        rule.factor === 1
        && !rule.independentFromCard
        && thongTinThe.benefitPercent !== null
        && IS_EMPTY(xml1.NGAY_MIEN_CCT)
        && mucHuongValues.length > 0
    ) {
        const expected = thongTinThe.benefitPercent;
        const allHigher = mucHuongValues.every((value) => value >= expected + 5);
        const allLower = mucHuongValues.every((value) => value <= expected - 5);
        if (allHigher || allLower) {
            // Ngoại lệ (QĐ BHXH / CV 38 / CV 302): một lần KCB < 15% LCS theo ngày KCB → 100% phạm vi;
            // MUC_HUONG chi tiết ~100% với thẻ mức 4 (80%) không coi là lệch HC-06d.
            if (!(allHigher && laMotLanKcbDuoi15PhanTramLCS(xml1))) {
                const huongThucTe = Math.round((mucHuongValues.reduce((sum, value) => sum + value, 0) / mucHuongValues.length) * 10) / 10;
                addLỗi(
                    'HC-06d',
                    'Quyền lợi BHYT theo mã thẻ',
                    `Mã đối tượng KCB [${rule.code}] thuộc nhóm hưởng theo phạm vi quyền lợi, mức hưởng; ký tự mức hưởng trên thẻ BHYT [${thongTinThe.benefitCode}] tương ứng ${expected}%, nhưng mức hưởng chi tiết thực tế đang quanh ${huongThucTe}%.`,
                    'Warning',
                    'MUC_HUONG',
                    rule.legalBasis || layCoSoPhapLyHanhChinh('HC-06')
                );
            }
        }
    }

    if (
        rule.factor === 0.5
        && !rule.independentFromCard
        && thongTinThe.benefitPercent !== null
        && mucHuongValues.length > 0
        && coPhatSinhThanhToanBHYT
    ) {
        const expectedPercent = Math.round(thongTinThe.benefitPercent * 0.5 * 10) / 10;
        const allHigher = mucHuongValues.every((value) => value >= expectedPercent + 10);
        if (allHigher) {
            const huongThucTe = Math.round((mucHuongValues.reduce((sum, value) => sum + value, 0) / mucHuongValues.length) * 10) / 10;
            addLỗi(
                'HC-06f',
                'Quyền lợi BHYT 50% (CV 302)',
                `Mã đối tượng KCB [${rule.code}] từ 01/7/2026 được hưởng 50% phạm vi theo mức hưởng thẻ (kỳ vọng ~${expectedPercent}% với thẻ mức ${thongTinThe.benefitCode} = ${thongTinThe.benefitPercent}%), nhưng mức hưởng chi tiết đang quanh ${huongThucTe}%.`,
                'Warning',
                'MUC_HUONG',
                rule.legalBasis || 'Công văn CV 302/CSYT-CĐ; Khoản 4 Điều 22 Luật BHYT; NĐ 188/2025/NĐ-CP',
            );
        }
    }

    return ds;
};

const layDongTheoLỗi = (hoSo, loi) => {
    const phanHe = UPPER(loi?.phan_he || '');
    const idx = Number(loi?.index);
    if (Number.isNaN(idx) || idx < 0) return null;
    if (!['XML2', 'XML3', 'XML4', 'XML5', 'XML6'].includes(phanHe)) return null;
    const ds = layDanhSachXml(hoSo, phanHe);
    if (!Array.isArray(ds) || idx >= ds.length) return null;
    return phanHe === 'XML2' ? enrichXML2Data(ds[idx]) : prepareData(ds[idx]);
};

const laTenDvGoiPhauThuatThuThuat = (tenDv) => {
    const t = UPPER(String(tenDv || ''));
    return (
        t.includes('PHẪU THUẬT') || t.includes('PHAU THUAT')
        || t.includes('THỦ THUẬT') || t.includes('THU THUAT')
    );
};

/**
 * Tìm dòng XML3 gợi ý cho quy tắc Chuyên đề khi điều kiện dùng COUNT_IF(DS_XML3) nhưng engine
 * vẫn neo nhầm XML1 — để UI lưới đánh dấu đúng ô.
 */
const timChiSoDongXml3TheoHeuristicChuyenDe = (loi, xml3) => {
    if (!Array.isArray(xml3) || xml3.length === 0) return null;
    const cb = normalizeTextNoAccent(String(loi?.canh_bao || '')).toUpperCase();
    const dk = normalizeTextNoAccent(String(loi?.dieu_kien || '')).toUpperCase();
    const maLuat = String(loi?.ma_luat || '');

    if (
        cb.includes('PHAU THUAT') || cb.includes('PHẪU THUẬT') || cb.includes('THU THUAT') || cb.includes('THỦ THUẬT')
        || dk.includes('PHAU THUAT') || dk.includes('THU THUAT')
        || /Chuyen_de_145/i.test(maLuat)
    ) {
        const ix = xml3.findIndex((r) => laTenDvGoiPhauThuatThuThuat(r?.TEN_DICH_VU));
        if (ix >= 0) return { index: ix, truong_loi: 'TEN_DICH_VU', ly_do: 'PT_TT' };
    }
    if (cb.includes('SIEU AM') || cb.includes('SIÊU ÂM')) {
        const ix = xml3.findIndex((r) => {
            const t = UPPER(String(r?.TEN_DICH_VU || ''));
            return t.includes('SIÊU ÂM') || t.includes('SIEU AM');
        });
        if (ix >= 0) return { index: ix, truong_loi: 'TEN_DICH_VU', ly_do: 'SIEU_AM' };
    }
    if (cb.includes('GAY ME') || cb.includes('GÂY MÊ')) {
        const ix = xml3.findIndex((r) => {
            const t = UPPER(String(r?.TEN_DICH_VU || ''));
            return t.includes('GÂY MÊ') || t.includes('GAY ME');
        });
        if (ix >= 0) return { index: ix, truong_loi: 'TEN_DICH_VU', ly_do: 'GAY_ME' };
    }
    return null;
};

/**
 * Bổ sung phan_he / index / truong_loi cho cảnh báo chưa neo ô trên lưới XML (đặc biệt Chuyen_de_*).
 * Idempotent: không ghi đè khi đã có index + trường hợp lệ.
 */
export const enrichViTriCanhBaoXml = (hoSo, loi) => {
    if (!loi || !hoSo) return loi;
    const idx0 = Number(loi.index);
    const tr = String(loi.truong_loi || '').trim().toUpperCase();
    const daCoNeo = Number.isFinite(idx0) && idx0 >= 0 && tr && tr !== 'UNKNOWN' && tr !== 'CAU_TRUC';
    if (daCoNeo) return loi;

    const ma = String(loi.ma_luat || '').trim();
    if (!/^Chuyen_de_/i.test(ma)) return loi;

    const xml3 = layDanhSachXml(hoSo, 'XML3');
    const hit = timChiSoDongXml3TheoHeuristicChuyenDe(loi, xml3);
    if (!hit) return loi;

    return {
        ...loi,
        phan_he: 'XML3',
        index: hit.index,
        truong_loi: hit.truong_loi,
        vi_tri_uoc_luong: true,
        vi_tri_uoc_ly_do: hit.ly_do,
    };
};

const boSungChiTietCanhBaoGiaiTrinh = (hoSo, dsLỗi, dm) => (Array.isArray(dsLỗi) ? dsLỗi : []).map((loiRaw) => {
    const loi = enrichViTriCanhBaoXml(hoSo, loiRaw);
    const phanHe = UPPER(loi?.phan_he || '');
    const truong = UPPER(loi?.truong_loi || '');
    const maLuat = UPPER(loi?.ma_luat || '');
    let canhBao = rutGonPhanHoiQuyTac(lamSachChuoiHienThi(loi?.canh_bao || ''));
    const dong = layDongTheoLỗi(hoSo, loi);

    if (dong && phanHe === 'XML2') {
        canhBao = renderCanhBaoTemplate(canhBao, taoPlaceholderCanhBaoThuoc(dong));
        canhBao = dinhKemChiTietCanhBao(canhBao, 'Chi tiết thuốc', [layMoTaThuoc(dong, dm)]);
        if (maLuat === 'THUOC_391') {
            canhBao = dinhKemChiTietCanhBao(canhBao, 'Cách tính', [layChiTietTinhToanThieuThuoc(dong)]);
        }
    }
    if (dong && phanHe === 'XML3') {
        canhBao = dinhKemChiTietCanhBao(canhBao, 'Chi tiết dịch vụ', [layMoTaDvkt(dong, dm)]);
    }
    if ((dong || phanHe === 'XML1') && (truong === 'MA_KHOA' || /^DM-KHOA-/.test(UPPER(loi?.ma_luat || '')))) {
        const thongTinKhoa = layMoTaKhoa(dong || _getXML1(hoSo) || {}, dm);
        if (thongTinKhoa) {
            canhBao = dinhKemChiTietCanhBao(canhBao, 'Khoa liên quan', [thongTinKhoa]);
        }
    }

    const canBoSungNhanSu = (
        (dong && (phanHe === 'XML3' || phanHe === 'XML5'))
        || ['MA_BAC_SI', 'NGUOI_THUC_HIEN', 'MACCHN', 'PHAMVI_CM', 'PHAMVI_CMBS', 'THOIGIAN_DK'].includes(truong)
        || /^DVKT-OP-(03|10)$/.test(UPPER(loi?.ma_luat || ''))
        || /^CLN-PTTT-/.test(UPPER(loi?.ma_luat || ''))
    );

    if (canBoSungNhanSu) {
        const maBacSi = dong?.MA_BAC_SI || dong?.MA_BS || '';
        const nguoiThucHien = dong?.NGUOI_THUC_HIEN || '';
        const nhanSu = layMoTaNhanSu({ maBacSi, nguoiThucHien, dm });
        if (nhanSu) {
            canhBao = dinhKemChiTietCanhBao(canhBao, 'Nhân sự liên quan', [nhanSu]);
        } else if (maBacSi || nguoiThucHien) {
            canhBao = dinhKemChiTietCanhBao(canhBao, 'Nhân sự liên quan', [
                dinhDangMaTen(maBacSi, nguoiThucHien, 'nhân sự'),
            ]);
        }
    }

    return {
        ...loi,
        canh_bao: rutGonPhanHoiQuyTac(canhBao),
    };
});

const locCanhBaoDuongTinhGiaTheoNguCanh = (hoSo, dsLỗi, dm) => {
    if (!Array.isArray(dsLỗi) || dsLỗi.length === 0) return [];

    const xml1 = _getXML1(hoSo);
    const xml2 = layDanhSachXml(hoSo, 'XML2');
    const xml3 = layDanhSachXml(hoSo, 'XML3');
    const xml5 = layDanhSachXml(hoSo, 'XML5');
    const xml7 = layDanhSachXml(hoSo, 'XML7');
    const xml8 = layDanhSachXml(hoSo, 'XML8');
    const maLoaiKcb = String(xml1?.MA_LOAI_KCB || '').trim();
    const laNoiTru = ['3', '03'].includes(maLoaiKcb);
    const maKhoaXml1Tokens = String(xml1?.MA_KHOA || '')
        .split(';')
        .map((value) => String(value || '').trim())
        .filter(Boolean);
    const chanDoanRvNorm = normalizeTextNoAccent(xml1?.CHAN_DOAN_RV || '').toUpperCase();
    const maBenhChinh = String(xml1?.MA_BENH_CHINH || '').trim().toUpperCase();
    const maBenhKt = String(xml1?.MA_BENH_KT || '').trim().toUpperCase();

    const coThuoc = xml2.length > 0;
    const coVatTu = xml3.some((row) => !IS_EMPTY(row?.MA_VAT_TU));
    const coBsChiTiet = xml3.some((row) => !IS_EMPTY(row?.MA_BAC_SI) || !IS_EMPTY(row?.NGUOI_THUC_HIEN))
        || xml5.some((row) => !IS_EMPTY(row?.MA_BAC_SI));
    const coSauNgayRa = coDichVuSauNgayRa(hoSo, xml1);
    const theConHan = compareDateKey(xml1?.NGAY_RA, `${normalizeDateKey(xml1?.GT_THE_DEN).slice(0, 8)}2359`) <= 0;
    const tongChiCanBang = tinhChenhTongChi(xml1) <= 10;
    const coVanChuyen = coDichVuVanChuyen(xml3);
    const tatCaXml2KhoaHopLe = xml2
        .filter((row) => !IS_EMPTY(row?.MA_KHOA))
        .every((row) => maKhoaXml1Tokens.includes(String(row?.MA_KHOA || '').trim()));
    const xml2ThieuTruongBatBuocThucTe = xml2.some((row) => (
        IS_EMPTY(row?.MA_THUOC)
        || IS_EMPTY(row?.TEN_THUOC)
        || IS_EMPTY(row?.MA_NHOM)
        || IS_EMPTY(row?.SO_LUONG)
        || IS_EMPTY(row?.DON_GIA)
        || IS_EMPTY(row?.MA_KHOA)
        || IS_EMPTY(row?.MA_BAC_SI)
        || IS_EMPTY(row?.NGAY_YL)
    ));
    const xml3ThieuTruongBatBuocThucTe = xml3.some((row) => (
        (IS_EMPTY(row?.MA_DICH_VU) && IS_EMPTY(row?.MA_VAT_TU))
        || IS_EMPTY(row?.SO_LUONG)
        || (IS_EMPTY(row?.DON_GIA) && IS_EMPTY(row?.DON_GIA_BV) && IS_EMPTY(row?.DON_GIA_BH))
        || IS_EMPTY(row?.MA_KHOA)
        || IS_EMPTY(row?.MA_BAC_SI)
        || IS_EMPTY(row?.NGAY_YL)
    ));
    const xml5CoMaVtyt = xml5.some((row) => !IS_EMPTY(row?.MA_VTYT));
    const coPhauThuatHoacThuThuat = xml3.some((row) => laDongPtttThucSu(row));
    const coPtttGoi = xml3.some((row) => laDongPtttThucSu(row) && /_GT$/i.test(String(row?.MA_DICH_VU || '').trim()));
    const coHc171 = dsLỗi.some((loi) => UPPER(loi?.ma_luat || '') === 'HC_171');
    const coThaiKyHoacSanKhoa = maBenhChinh.startsWith('O')
        || /(^|;)\s*O\d/i.test(maBenhKt)
        || /THAI|CHUYEN DA|SAN|LAY THAI/.test(chanDoanRvNorm);

    const chiTietMucHuong = [...xml2, ...xml3].filter((row) => !laBHYTKhôngThanhToan(row) && TO_NUMBER(row.THANH_TIEN_BH) > 0);
    const tatCaMucHuong100 = chiTietMucHuong.length > 0 && chiTietMucHuong.every((row) => TO_NUMBER(row.MUC_HUONG) >= 95);
    const bncctKhaiBao = TO_NUMBER(xml1.T_BNCCT);
    const cctKyVong = chiTietMucHuong.reduce((sum, row) => {
        const thanhTienBh = TO_NUMBER(row.THANH_TIEN_BH);
        const mucHuong = Math.min(100, Math.max(0, TO_NUMBER(row.MUC_HUONG)));
        return sum + (thanhTienBh * (100 - mucHuong) / 100);
    }, 0);

    return dsLỗi.filter((loi) => {
        const ma = UPPER(loi?.ma_luat || '');
        const canhBao = String(loi?.canh_bao || '');
        const dieuKien = String(loi?.dieu_kien || '');
        const dong = layDongTheoLỗi(hoSo, loi);

        if (ma === 'DM-THUOC-03') return false;
        if (/^DMBV-/.test(ma)) return false;
        if (ma === 'HC-06' && laDoiTuongKcbHopLeMoRong(xml1.MA_DOITUONG_KCB, dm)) return false;
        /* HC_06 (seed): chi phí < 15% LCS — khám ngoại trú (1/01) thường khác cơ chế kê đơn/tổng chi so với nội trú; tránh dương tính giả */
        if (ma === 'HC_06' && /351\.000|379\.500|15%\s*LCS/i.test(canhBao) && MATCH_ANY_MA_LOAI_KCB(xml1?.MA_LOAI_KCB, '1', '01')) return false;
        if ((ma === 'HC-302A' || ma === 'HC_302A') && MATCH_ANY_MA_LOAI_KCB(xml1?.MA_LOAI_KCB, '1', '01')) return false;
        if (ma === 'XML_19' && coHc171) return false;
        if (ma === 'XML_21' && !coSauNgayRa) return false;
        if (ma === 'XML_47' && (tatCaMucHuong100 || (Math.abs(cctKyVong - bncctKhaiBao) <= 10 && bncctKhaiBao <= 10))) return false;
        if (ma === 'XML_54' && !coVatTu) return false;
        if (ma === 'XML_55' && laNoiTru && tatCaXml2KhoaHopLe) return false;
        if (ma === 'XML_58' && IS_EMPTY(xml1?.MUC_HUONG)) return false;
        if (ma === 'XML_86' && !xml2ThieuTruongBatBuocThucTe) return false;
        if (ma === 'XML_87' && !xml3ThieuTruongBatBuocThucTe) return false;
        if (ma === 'HC_19' && !coVanChuyen) return false;
        if (ma === 'HC_49' && laMaIcdHopLe(xml1.MA_BENH_CHINH, dm)) return false;
        if (ma === 'HC_52' && !coVatTu) return false;
        if (ma === 'HC_62' && coBsChiTiet) return false;
        if (ma === 'HC_97' && (xml7.length === 0 || IS_EMPTY(xml7[0]?.KY_LANH_DAO))) return false;
        if (ma === 'HC_224' && (xml8.length === 0 || !dong || IS_EMPTY(dong?.MA_PT_VIEN) || IS_EMPTY(dong?.MA_PHU_MO))) return false;
        if (ma === 'HC_242' && tongChiCanBang) return false;
        if (ma === 'DM-DVKT-03' && laDongDichVuGiuong(dong)) return false;
        if (ma === 'HD_06' && !IS_EMPTY(xml1.MA_CSKCB) && /94170/.test(`${canhBao} ${dieuKien}`)) return false;
        if (ma === 'HD_09' && IS_EMPTY(xml1.MA_TTDV)) return false;
        if (ma === 'CK_03' && !['1', '01'].includes(maLoaiKcb)) return false;
        if (ma === 'THUOC_400' && !coThuoc) return false;
        if (ma === 'THUOC_85' && coPhauThuatHoacThuThuat) return false;
        if (ma === 'THUOC_342' && coThaiKyHoacSanKhoa) return false;
        if ((ma === 'THUOC_391' || ma === 'THUOC_416' || ma === 'THUOC_417') && coLechDonViYLenhVaCapPhatThuoc(dong)) return false;
        if ((ma === 'THUOC_417' || ma === 'THUOC_416') && dong) {
            const slMoiNgay = Math.max(TO_NUMBER(dong?.CALC_SL_MOI_NGAY), TO_NUMBER(dong?.SL_MOI_NGAY));
            const soNgay = TO_NUMBER(dong?.SO_NGAY);
            if (!(slMoiNgay > 0 && soNgay > 0)) return false;
        }
        if (ma === 'THUOC_417' && laDongThuocToaXuatVienNoiTru(xml1, dong)) return false;
        if (ma === 'THUOC_482' && dong) {
            const maThuoc = String(dong?.MA_THUOC || '').trim();
            const tenT = String(dong?.TEN_THUOC || '');
            const maHc = String(dong?.MA_HOAT_CHAT || '').trim();
            if (maThuoc === '40.540' || maHc === '40.540') return false;
            const dmThuoc = maThuoc && dm?.MAP_THUOC_BV ? dm.MAP_THUOC_BV.get(UPPER(maThuoc)) : null;
            const tenTuDm = dmThuoc ? String(layGiaTriDanhMuc(dmThuoc, ['TEN_THUOC', 'TEN_HOAT_CHAT', 'HOAT_CHAT', 'TEN']) || '') : '';
            const hoatChatDm = dmThuoc ? String(layGiaTriDanhMuc(dmThuoc, ['TEN_HOAT_CHAT', 'HOAT_CHAT']) || '') : '';
            const blob = `${tenT} ${maThuoc} ${maHc} ${tenTuDm} ${hoatChatDm}`;
            if (/clopidogrel|vixcar|plavix|dogrelsavi|dogrel|clogrel|plagerl|ceruvin/i.test(blob)) return false;
        }
        if (ma === 'THUOC_131' && coCoSoLamSangHoacIcdChoDiosminHesperidin(hoSo, xml1)) return false;
        if (ma === 'XML_76') {
            if (laHoSoNoiTruTheoQd824(xml1)) return false;
            const rowsVuot100 = xml2.filter((r) => TO_NUMBER(r?.SO_LUONG) > 100 && !IS_EMPTY(r?.MA_THUOC));
            if (
                rowsVuot100.length > 0
                && rowsVuot100.every((r) => {
                    const dv = UPPER(r?.DON_VI_TINH || '');
                    const sl = TO_NUMBER(r?.SO_LUONG);
                    return /(VIEN|VIÊN)/.test(dv) && sl > 0 && sl <= 400;
                })
            ) return false;
        }
        if (ma === 'XML2-TIME-THYL-BEFORE-YL' && laNoiTru) return false;
        if ((ma === 'CLN-PTTT-02' || ma === 'CLN-PTTT-05') && coPtttGoi) return false;
        if (ma === 'CLN-PTTT-12' && coHc171 && xml5.length === 0) return false;
        if (ma === 'THUOC_417' || ma === 'THUOC_416') {
            if (laVuotNguongDoLamTronThuoc(dong)) return false;
        }
        if (ma === 'GB_36' && !xml5CoMaVtyt) return false;
        if (ma === 'GB_20' && !IS_EMPTY(xml1.GT_THE_DEN) && !IS_EMPTY(xml1.NGAY_RA) && theConHan) return false;
        if (ma === 'DVKT_0261' && coThaiKyHoacSanKhoa) return false;
        if (ma === 'CDHA_101') {
            if (!laDichVuCDHA(dong)) return false;
            if (IS_EMPTY(dong?.MA_MAY)) return false;
        }
        if (ma === 'CDHA_164') {
            const tenDvNorm = normalizeTextNoAccent(dong?.TEN_DICH_VU || '').toUpperCase();
            if (!dong) return false;
            if (!(tenDvNorm.includes('MRI') || tenDvNorm.includes('CONG HUONG TU'))) return false;
        }
        return true;
    });
};

// ============================================================
// [PHẦN 5] LAYER 1: KIỂM TRA HÀNH CHÍNH (XML1) - HC-01..HC-10
// ============================================================
const giamDinhHanhChinh = (hoSo, dm) => {
    const ds = [];
    if (!hoSo) return ds;
    const x = _getXML1(hoSo);
    if (!x) return ds;

    const addLỗi = (maLuat, ten, noi_dung, muc_do, truong, coSoPhapLy = '') => ds.push({
        phan_he: 'XML1', index: -1, truong_loi: truong || maLuat,
        canh_bao: noi_dung, muc_do, ma_luat: maLuat, ten_quy_tac: ten, dieu_kien: 'BUILT-IN',
        co_so_phap_ly: coSoPhapLy || layCoSoPhapLyHanhChinh(maLuat)
    });

    // HC-01: Mã thẻ BHYT
    if (IS_EMPTY(x.MA_THE_BHYT)) {
        addLỗi('HC-01', 'Mã thẻ BHYT', 'Mã thẻ BHYT không được để trống (TT 09/2019/TT-BYT).', 'Critical', 'MA_THE_BHYT');
    } else if (!MA_THE_BHYT_REGEX.test(normalizeMaTheBHYT(x.MA_THE_BHYT))) {
        addLỗi('HC-01b', 'Định dạng thẻ BHYT', `Mã thẻ [${x.MA_THE_BHYT}] không đúng định dạng (2 chữ + 13 số).`, 'Error', 'MA_THE_BHYT');
    } else {
        const thongTinThe = layThongTinMucHuongTuThe(x);
        if (thongTinThe.benefitCode && thongTinThe.benefitPercent === null) {
            addLỗi('HC-01c', 'Mã mức hưởng trên thẻ BHYT', `Ký tự mức hưởng trên thẻ BHYT [${thongTinThe.benefitCode}] chưa nằm trong nhóm mã hưởng chuẩn 1-5.`, 'Warning', 'MA_THE_BHYT');
        }
        const coDanhMucMaThe = Array.isArray(dm?.DM_MA_THE_QUYEN_LOI_ROWS) && dm.DM_MA_THE_QUYEN_LOI_ROWS.length > 0;
        if (coDanhMucMaThe) {
            const quyTacThe = layQuyTacTheoMaTheVaQuyenLoi(x, dm);
            if (!quyTacThe) {
                const prefix = SUBSTR(normalizeMaTheBHYT(x.MA_THE_BHYT), 1, 2);
                addLỗi(
                    'HC-01d',
                    'Danh mục mã thẻ và quyền lợi',
                    `Không tìm thấy cấu hình cho mã thẻ [${prefix}${thongTinThe.benefitCode || '?'}] trong danh mục «Mã thẻ và quyền lợi».`,
                    'Warning',
                    'MA_THE_BHYT'
                );
            } else {
                if (quyTacThe.hieuLucThiHanh === 'KHONG') {
                    addLỗi(
                        'HC-01e',
                        'Danh mục mã thẻ và quyền lợi',
                        `Mã thẻ [${quyTacThe.ma}] đang ở trạng thái không hiệu lực thi hành theo danh mục nội bộ.`,
                        'Error',
                        'MA_THE_BHYT'
                    );
                }
                const mucHuongXml1 = TO_NUMBER(x.MUC_HUONG || x.MUC_HUONG_THE);
                if (quyTacThe.tyLeHuong != null && !IS_EMPTY(x.MUC_HUONG || x.MUC_HUONG_THE)) {
                    if (Math.abs(mucHuongXml1 - quyTacThe.tyLeHuong) >= 5) {
                        addLỗi(
                            'HC-01f',
                            'Đối chiếu mức hưởng theo danh mục mã thẻ',
                            `MUC_HUONG khai báo [${mucHuongXml1}%] lệch cấu hình danh mục [${quyTacThe.tyLeHuong}%] cho mã [${quyTacThe.ma}].`,
                            'Warning',
                            'MUC_HUONG'
                        );
                    }
                }
            }
        }
    }

    // HC-02: Họ tên
    if (IS_EMPTY(x.HO_TEN) || LEN(x.HO_TEN) < 2)
        addLỗi('HC-02', 'Họ tên bệnh nhân', 'Họ tên bệnh nhân trống hoặc không hợp lệ.', 'Critical', 'HO_TEN');

    // HC-03: MA_LK
    if (IS_EMPTY(x.MA_LK))
        addLỗi('HC-03', 'Mã lần khám', 'Mã lần khám (MA_LK) không được để trống.', 'Critical', 'MA_LK');

    // HC-04: Ngày vào/ra
    if (IS_EMPTY(x.NGAY_VAO)) {
        addLỗi('HC-04', 'Ngày vào viện', 'Ngày vào viện không được để trống.', 'Critical', 'NGAY_VAO');
    } else if (!IS_EMPTY(x.NGAY_RA) && DIFF_DAYS(x.NGAY_VAO, x.NGAY_RA) < 0) {
        addLỗi('HC-04b', 'Logic Ngày vào/ra', `Ngày ra [${x.NGAY_RA}] trước Ngày vào [${x.NGAY_VAO}].`, 'Critical', 'NGAY_RA');
    }

    // HC-05: Hiệu lực thẻ
    if (!IS_EMPTY(x.GT_THE_TU) && !IS_EMPTY(x.GT_THE_DEN) && !IS_EMPTY(x.NGAY_VAO)) {
        if (DIFF_DAYS(x.GT_THE_TU, x.NGAY_VAO) < 0)
            addLỗi('HC-05', 'Hiệu lực thẻ', `Ngày vào [${x.NGAY_VAO}] trước ngày hiệu lực thẻ [${x.GT_THE_TU}].`, 'Critical', 'GT_THE_TU');
        if (DIFF_DAYS(x.NGAY_VAO, x.GT_THE_DEN) < 0)
            addLỗi('HC-05b', 'Hiệu lực thẻ', `Ngày vào [${x.NGAY_VAO}] sau ngày hết hạn thẻ [${x.GT_THE_DEN}] (Điều 27 Luật BHYT).`, 'Critical', 'GT_THE_DEN');
    }

    // HC-06: Đối tượng KCB
    if (!IS_EMPTY(x.MA_DOITUONG_KCB) && !laDoiTuongKcbHopLeMoRong(x.MA_DOITUONG_KCB, dm))
        addLỗi('HC-06', 'Đối tượng KCB', `Mã đối tượng KCB [${x.MA_DOITUONG_KCB}] không có trong danh mục PL10 hiện hành.`, 'Warning', 'MA_DOITUONG_KCB');

    // HC-07: Chẩn đoán ICD-10
    if (IS_EMPTY(x.MA_BENH_CHINH)) {
        addLỗi('HC-07', 'Chẩn đoán ICD-10', 'Mã bệnh chính (MA_BENH_CHINH) không được để trống.', 'Critical', 'MA_BENH_CHINH');
    } else if (dm.MAP_ICD10 && dm.MAP_ICD10.size > 0 && !dm.MAP_ICD10.has(UPPER(x.MA_BENH_CHINH))) {
        addLỗi('HC-07b', 'Chẩn đoán ICD-10', `Mã bệnh chính [${x.MA_BENH_CHINH}] không có trong danh mục ICD-10 của BYT.`, 'Error', 'MA_BENH_CHINH');
    }
    const maBenhChinhUpper = UPPER(x.MA_BENH_CHINH || '');
    if (
        maBenhChinhUpper.startsWith('Z')
        && !LA_ICD_Z34_KHAM_THAI_BINH_THUONG(maBenhChinhUpper)
        && CO_TU_KHOA_KHAM_SUC_KHOE_THEO_YEU_CAU(x)
    ) {
        addLỗi(
            'HC-07c',
            'Điều kiện thanh toán BHYT với ICD nhóm Z',
            '⛔ Vi phạm Điều 23 Luật BHYT: Chi phí khám, chữa bệnh của người tham gia BHYT tự đi khám ngoài nơi đăng ký KCB ban đầu không đúng quy định hoặc ngoài phạm vi hưởng (như khám sức khỏe/theo yêu cầu/kiểm tra) không thuộc phạm vi chi trả.',
            'Critical',
            'MA_BENH_CHINH',
            `${VAN_BAN_HANH_CHINH_HIEN_HANH.LUAT_BHYT} ${TT_12_2026_BTC_DIEU10_K1}`
        );
    }

    // HC-08: Số ngày điều trị
    const laNgoaiTru = laDieuTriNgoaiTru(x);
    const soNgay = TO_NUMBER(x.SO_NGAY_DTRI);
    if (!IS_EMPTY(x.SO_NGAY_DTRI)) {
        if (soNgay < 0)
            addLỗi('HC-08', 'Số ngày điều trị', `Số ngày điều trị [${x.SO_NGAY_DTRI}] âm.`, 'Error', 'SO_NGAY_DTRI');
        else if (!(laNgoaiTru && soNgay === 0) && !IS_EMPTY(x.NGAY_VAO) && !IS_EMPTY(x.NGAY_RA)) {
            const tinh = DIFF_DAYS(x.NGAY_VAO, x.NGAY_RA);
            if (Math.abs(soNgay - tinh) > 1)
                addLỗi('HC-08b', 'Số ngày điều trị', `Số ngày khai [${soNgay}] không khớp tính từ ngày vào/ra [${tinh}].`, 'Warning', 'SO_NGAY_DTRI');
        }
    }

    // HC-09: Tổng chi phí
    const tTongBV = TO_NUMBER(x.T_TONGCHI_BV);
    const tTongBH = TO_NUMBER(x.T_TONGCHI_BH);
    if (!IS_EMPTY(x.T_TONGCHI_BH) && tTongBH < 0)
        addLỗi('HC-09b', 'Tong chi BH', 'T_TONGCHI_BH không đủoc am.', 'Error', 'T_TONGCHI_BH');
    if (!IS_EMPTY(x.T_TONGCHI_BV) && !IS_EMPTY(x.T_TONGCHI_BH) && tTongBH > tTongBV * 1.001 && (tTongBH - tTongBV) > 1000)
        addLỗi('HC-09c', 'Tong chi BH/BV', `T_TONGCHI_BH [${tTongBH.toLocaleString()}] lon hon T_TONGCHI_BV [${tTongBV.toLocaleString()}].`, 'Warning', 'T_TONGCHI_BH');
    if (!IS_EMPTY(x.T_TONGCHI_BV) && tTongBV <= 0)
        addLỗi('HC-09', 'Tổng chi phí', 'T_TONGCHI_BV phải lớn hơn 0.', 'Error', 'T_TONGCHI_BV');

    // HC-10: Cân bằng tài chính
    const tBhtt = TO_NUMBER(x.T_BHTT), tBncct = TO_NUMBER(x.T_BNCCT);
    const tongThanhToanBH = tBhtt + tBncct;
    if (!IS_EMPTY(x.T_TONGCHI_BH) && tongThanhToanBH > 0) {
        const chenh = Math.abs(tTongBH - tongThanhToanBH);
        if (chenh > Math.max(tTongBH * 0.001, 1000))
            addLỗi('HC-10', 'Cân bằng tài chính BH', `T_TONGCHI_BH [${tTongBH.toLocaleString()}] không bằng BHTT+BNCCT [${tongThanhToanBH.toLocaleString()}]. Chênh: ${chenh.toLocaleString()}đ.`, 'Warning', 'T_TONGCHI_BH');
    }

    return ds.concat(giamDinhQuyenLoiTheoDoiTuongVaThe(hoSo, dm)).concat(giamDinhCv302Bhyt(hoSo, dm));
};

// ============================================================
// [PHẦN 6] LAYER 2+3: ĐỐI SOÁT DANH MỤC NỘI BỘ BV + BYT
// ============================================================
const giamDinhDanhMucNoiBo = (hoSo, dm) => {
    const ds = [];
    const xml1 = _getXML1(hoSo);
    const xml2 = hoSo.XML2 || hoSo.xml2 || [];
    const xml3 = hoSo.XML3 || hoSo.xml3 || [];
    const xml5 = hoSo.XML5 || hoSo.xml5 || [];
    const xml6 = hoSo.XML6 || hoSo.xml6 || [];

    const addLỗi = (bang, idx, maLuat, ten, canh_bao, muc_do, truong, coSoPhapLy = '') => ds.push({
        phan_he: bang, index: idx, truong_loi: truong,
        canh_bao, muc_do, ma_luat: maLuat, ten_quy_tac: ten, dieu_kien: 'BUILT-IN',
        co_so_phap_ly: coSoPhapLy
    });

    const tachDanhSachMaKhoa = (raw) => String(raw || '')
        .split(';')
        .map((value) => UPPER(value || ''))
        .filter(Boolean);

    const hasDanhMucKhoa = dm?.MAP_KHOA_BV && dm.MAP_KHOA_BV.size > 0;
    const kiemTraKhoaNoiBo = (bang, row, idx, { boQuaKhongBHYT = false } = {}) => {
        if (!row || !hasDanhMucKhoa) return;
        if (boQuaKhongBHYT && laBHYTKhôngThanhToan(row)) return;
        const dsMaKhoa = bang === 'XML1'
            ? tachDanhSachMaKhoa(row?.MA_KHOA)
            : [UPPER(row?.MA_KHOA || '')].filter(Boolean);
        if (dsMaKhoa.length === 0) return;
        const dsMaKhoaKhongHopLe = dsMaKhoa.filter((maKhoa) => !dm.MAP_KHOA_BV.get(maKhoa));
        if (dsMaKhoaKhongHopLe.length > 0) {
            addLỗi(
                bang,
                idx,
                'DM-KHOA-01',
                'Khoa ngoài danh mục nội bộ',
                `XUẤT TOÁN: Mã khoa [${dsMaKhoaKhongHopLe.join(';')}] không có trong danh mục khoa, bàn khám, giường bệnh nội bộ M01 của bệnh viện. Ngoài phạm vi chuyên môn đã đăng ký/phê duyệt tại cơ sở KCB.`,
                'Critical',
                'MA_KHOA',
                CO_SO_PHAP_LY_DVKT.DANH_MUC_NOI_BO
            );
            return;
        }
        const maKhoa = dsMaKhoa[0];
        const dmKhoa = dm.MAP_KHOA_BV.get(maKhoa);
        if (bang === 'XML3' && laDongDichVuGiuong(row) && layTongSoGiuongDanhMuc(dmKhoa) <= 0) {
            addLỗi(
                bang,
                idx,
                'DM-KHOA-02',
                'Giường ngoài danh mục khoa được phê duyệt',
                `Khoa [${maKhoa}] chưa khai số bàn khám/giường được phê duyệt trong danh mục nội bộ M01 nhưng hồ sơ đã phát sinh dịch vụ giường. Cần rà soát phạm vi hoạt động chuyên môn của bệnh viện.`,
                'Error',
                'MA_KHOA',
                CO_SO_PHAP_LY_DVKT.DANH_MUC_NOI_BO
            );
        }
    };

    kiemTraKhoaNoiBo('XML1', xml1, -1);
    xml2.forEach((row, idx) => kiemTraKhoaNoiBo('XML2', row, idx, { boQuaKhongBHYT: true }));
    xml3.forEach((row, idx) => kiemTraKhoaNoiBo('XML3', row, idx, { boQuaKhongBHYT: true }));
    xml5.forEach((row, idx) => kiemTraKhoaNoiBo('XML5', row, idx));
    xml6.forEach((row, idx) => kiemTraKhoaNoiBo('XML6', row, idx));

    // --- XML2: THUỐC ---
    xml2.forEach((row, idx) => {
        if (laBHYTKhôngThanhToan(row)) return;
        const ma = UPPER(row.MA_THUOC || '');
        if (!ma) return;
        const hasBV = dm.MAP_THUOC_BV && dm.MAP_THUOC_BV.size > 0;
        const hasBYT = dm.MAP_BYT_PL5 && dm.MAP_BYT_PL5.size > 0;
        const trongBV = hasBV ? dm.MAP_THUOC_BV.has(ma) : null;
        const trongBYT = hasBYT ? dm.MAP_BYT_PL5.has(ma) : null;

        if (trongBV === false) {
            if (trongBYT === true)
                addLỗi('XML2', idx, 'DM-THUOC-01', 'Thuốc ngoài DM BV',
                    `XUẤT TOÁN: Thuốc [${ma}] có trong danh mục BYT nhưng BV chưa phê duyệt trong danh mục nội bộ được sử dụng/thanh toán BHYT.`,
                    'Critical',
                    'MA_THUOC',
                    CO_SO_PHAP_LY_THUOC.DANH_MUC_BHYT);
            else if (trongBYT === false)
                addLỗi('XML2', idx, 'DM-THUOC-02', 'Thuốc ngoài cả hai DM',
                    `XUẤT TOÁN: Thuốc [${ma}] không có trong danh mục thuốc BHYT áp dụng và cũng không có trong danh mục nội bộ của BV.`,
                    'Critical',
                    'MA_THUOC',
                    CO_SO_PHAP_LY_THUOC.DANH_MUC_BHYT);
            else
                addLỗi('XML2', idx, 'DM-THUOC-03', 'Cần xác minh thuốc',
                    `Thuốc [${ma}] chưa xác minh được trong danh mục nội bộ BV. Đề nghị cập nhật lại dữ liệu danh mục được phê duyệt.`,
                    'Warning',
                    'MA_THUOC',
                    CO_SO_PHAP_LY_THUOC.DANH_MUC_BHYT);
        } else if (trongBV === true) {
            // Kiểm tra giá trúng thầu — đối chiếu XML2.DON_GIA với đúng dòng Mẫu 03 (GIA_BH_TT / DON_GIA_TT), không chỉ theo mã nếu có nhiều bản ghi cùng MA.
            const thuocRowsFull = Array.isArray(dm.DM_THUOC_M03_ROWS) ? dm.DM_THUOC_M03_ROWS : [];
            const rowsCungMa = thuocRowsFull.filter((r) => UPPER(String(r.MA_THUOC || '').trim()) === ma);
            let dmT = null;
            if (rowsCungMa.length === 0) {
                dmT = dm.MAP_THUOC_BV.get(ma);
            } else if (rowsCungMa.length === 1) {
                dmT = rowsCungMa[0];
            } else {
                dmT = chonDongMau03KhopChiTietVsXml2(rowsCungMa, row);
            }
            const giaTT = dmT ? layGiaTrungThauNoiBoTuDmThuocM03(dmT) : 0;
            const giaHS = TO_NUMBER(row.DON_GIA);
            const tenXml = layTenThuocTuDongXml2(row) || '—';
            if (giaTT > 0 && giaHS > giaTT * 1.001) {
                const nhanManhKhop = rowsCungMa.length > 1
                    ? ' Đối chiếu theo tên/ĐVT/hàm lượng cùng mã trên Mẫu 03; tham chiếu GIA_BH_TT / DON_GIA_TT.'
                    : ' Tham chiếu GIA_BH_TT / DON_GIA_TT trên Mẫu 03.';
                addLỗi('XML2', idx, 'DM-THUOC-04', 'Giá thuốc vượt trúng thầu',
                    `Đơn giá XML2 [${ma}] ${tenXml} (DON_GIA) = ${giaHS.toLocaleString()}đ vượt giá trúng thầu BHYT trên danh mục nội bộ Mẫu 03 (${giaTT.toLocaleString()}đ).${nhanManhKhop}`,
                    'Error',
                    'DON_GIA',
                    CO_SO_PHAP_LY_THUOC.NOI_BO_GIA_THAU);
            }
        }
    });

    ds.push(...giamDinhThuocDieuKienThanhToan(hoSo, dm));

    // --- XML2: Tương tác thuốc — cùng đợt điều trị (XML1/MA_LK), bác sĩ kê cả A và B trên XML2 (BHYT);
    //     điều kiện đồng thời: ưu tiên cùng ngày y lệnh (NGAY_YL/NGAY_TH_YL); nếu hai thuốc đều có mốc ngày nhưng khác ngày thì không báo;
    //     nếu thiếu mốc ngày → coi là cùng đợt trong tập dòng XML2 hiện tại.
    if (dm.MAP_TUONG_TAC_CAP && dm.MAP_TUONG_TAC_CAP.size > 0) {
        const mapMaSangNgay = new Map();
        const idxDauTienTheoMa = new Map();
        xml2.forEach((row, idx) => {
            if (laBHYTKhôngThanhToan(row)) return;
            const m = UPPER(row.MA_THUOC);
            if (!m) return;
            if (!mapMaSangNgay.has(m)) {
                mapMaSangNgay.set(m, { ngay: new Set() });
                idxDauTienTheoMa.set(m, idx);
            }
            const d = layNgayYYYYMMDDtuDongXML2Thuoc(row);
            if (d) mapMaSangNgay.get(m).ngay.add(d);
        });
        const dsMa = Array.from(mapMaSangNgay.keys());
        const daBaoCap = new Set();
        const maLk = String(xml1?.MA_LK || hoSo?.ma_lk || '').trim();
        const loaiDt = layMoTaLoaiDieuTriXml1(xml1);
        for (let i = 0; i < dsMa.length; i += 1) {
            for (let j = i + 1; j < dsMa.length; j += 1) {
                const pk = [dsMa[i], dsMa[j]].sort().join('|');
                if (daBaoCap.has(pk)) continue;
                const hit = dm.MAP_TUONG_TAC_CAP.get(pk);
                if (!hit) continue;
                const dg = danhGiaDongThoiThuocABtrenXML2(dsMa[i], dsMa[j], mapMaSangNgay);
                if (!dg.ghiNhan) continue;
                daBaoCap.add(pk);
                const idxRef = idxDauTienTheoMa.has(dsMa[i]) ? idxDauTienTheoMa.get(dsMa[i]) : -1;
                const maLuat = String(hit.MA_TUONG_TAC || 'CLN-TT-001').trim();
                const msgGoc = hit.CANH_BAO_HE_THONG || hit.NOI_DUNG_TUONG_TAC
                    || `Phát hiện phối hợp mã thuốc [${dsMa[i]}] và [${dsMa[j]}] trên XML2.`;
                let phuLucDieuKien = '';
                if (dg.kieu === 'CUNG_NGAY_YL') {
                    const fmt = dg.ngayGoiY && dg.ngayGoiY.length === 8
                        ? `${dg.ngayGoiY.slice(6, 8)}/${dg.ngayGoiY.slice(4, 6)}/${dg.ngayGoiY.slice(0, 4)}`
                        : dg.ngayGoiY;
                    phuLucDieuKien = ` Điều kiện XML2: cùng ngày y lệnh/thực hiện y lệnh (${fmt}).`;
                } else if (dg.kieu === 'CUNG_DOT_XML2') {
                    phuLucDieuKien = ' Điều kiện XML2: cùng đợt điều trị (các dòng thuốc BHYT trong hồ sơ); mốc NGAY_YL/NGAY_TH_YL chưa đủ để khửa theo ngày — kiểm tra theo toàn đợt.';
                }
                const nenTang = maLk
                    ? ` Đợt KCB ${loaiDt}, MA_LK ${maLk} — đối chiếu toàn bộ dòng thuốc XML2 do BHYT thanh toán.`
                    : ` Đợt KCB ${loaiDt} — đối chiếu toàn bộ dòng thuốc XML2 do BHYT thanh toán.`;
                const mucDoTt = chuanHoaMucDoCanhBaoTuongTacThuoc(hit.MUC_DO_CANH_BAO);
                addLỗi(
                    'XML2',
                    idxRef,
                    maLuat,
                    'Tương tác thuốc (XML2 — cùng đợt, đồng thời A và B)',
                    `${msgGoc}${phuLucDieuKien}${nenTang} (Cặp mã: [${dsMa[i]}] + [${dsMa[j]}].)`,
                    mucDoTt,
                    'MA_THUOC',
                    CO_SO_PHAP_LY_KCB.CHUYEN_MON,
                );
            }
        }
    }

    // --- XML3: DVKT ---
    xml3.forEach((row, idx) => {
        if (laBHYTKhôngThanhToan(row)) return;
        if (laDongDichVuGiuong(row)) return;
        const ma = UPPER(row.MA_DICH_VU || '');
        if (!ma) return;
        const hasBV = dm.MAP_DVKT_BV && dm.MAP_DVKT_BV.size > 0;
        const trongBV = hasBV ? dm.MAP_DVKT_BV.has(ma) : null;
        const trongBYT = (dm.MAP_BYT_PL1 && dm.MAP_BYT_PL1.has(ma)) || (dm.MAP_BYT_PL11 && dm.MAP_BYT_PL11.has(ma));

        if (trongBV === false) {
            if (trongBYT)
                addLỗi('XML3', idx, 'DM-DVKT-01', 'DVKT ngoài DM BV',
                    `XUẤT TOÁN: Dịch vụ [${ma}] có trong DM BYT nhưng BV chưa phê duyệt/đủ điều kiện thanh toán tại cơ sở KCB.`, 'Critical', 'MA_DICH_VU',
                    CO_SO_PHAP_LY_DVKT.DANH_MUC_NOI_BO);
            else if (dm.MAP_BYT_PL1 && dm.MAP_BYT_PL1.size > 0)
                addLỗi('XML3', idx, 'DM-DVKT-02', 'DVKT ngoài cả hai DM',
                    `XUẤT TOÁN: Dịch vụ [${ma}] không có trong DM BV lẫn DM BYT. Không được thanh toán BHYT.`, 'Critical', 'MA_DICH_VU',
                    CO_SO_PHAP_LY_DVKT.DANH_MUC_NOI_BO);
            else
                addLỗi('XML3', idx, 'DM-DVKT-03', 'Cần xác minh DVKT',
                    `Dịch vụ [${ma}] chưa xác minh trong DM nội bộ. Đề nghị cập nhật danh mục BV.`, 'Warning', 'MA_DICH_VU',
                    CO_SO_PHAP_LY_DVKT.DANH_MUC_NOI_BO);
        } else if (trongBV === true) {
            const dmDV = dm.MAP_DVKT_BV.get(ma);
            const giaHD = TO_NUMBER(dmDV.DON_GIA_BH || dmDV.DON_GIA_BV || dmDV.DON_GIA || dmDV.GIA || 0);
            const giaHS = TO_NUMBER(row.DON_GIA_BH || row.DON_GIA_BV || row.DON_GIA || 0);
            if (giaHD > 0 && giaHS > giaHD * 1.001)
                addLỗi('XML3', idx, 'DM-DVKT-04', 'Đơn giá DVKT vượt hợp đồng',
                    `Đơn giá DVKT [${ma}] = ${giaHS.toLocaleString()}đ vượt giá HĐ BV ${giaHD.toLocaleString()}đ đã phê duyệt.`, 'Error', 'DON_GIA_BV',
                    CO_SO_PHAP_LY_DVKT.GIA_DVKT);
        }
    });

    return ds;
};

const layGiaTriDanhMuc = (row, danhSachKhoa = []) => {
    if (!row || !Array.isArray(danhSachKhoa) || danhSachKhoa.length === 0) return '';
    for (const key of danhSachKhoa) {
        const val = layGiaTriAnToan(row, key);
        if (val !== undefined && val !== null && String(val).trim() !== '') return val;
    }
    return '';
};

const lamSachChuoiHienThi = (value) => String(value || '').replace(/\s+/g, ' ').trim();

const lamSachChuoiHienThiCoXuongDong = (value) => String(value || '')
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

const taoNhomChiTietDuyNhat = (items = []) => {
    const seen = new Set();
    const out = [];
    (Array.isArray(items) ? items : []).forEach((item) => {
        const text = lamSachChuoiHienThi(item);
        if (!text) return;
        const key = text.toUpperCase();
        if (seen.has(key)) return;
        seen.add(key);
        out.push(text);
    });
    return out;
};

const dinhKemChiTietCanhBao = (message = '', label = 'Chi tiết', details = []) => {
    const text = lamSachChuoiHienThiCoXuongDong(message);
    const chiTiet = taoNhomChiTietDuyNhat(details).join('; ');
    if (!chiTiet) return text;
    const tokenMessage = UPPER(text).replace(/[^A-Z0-9]/g, '');
    const tokenDetail = UPPER(chiTiet).replace(/[^A-Z0-9]/g, '');
    if (tokenMessage && tokenDetail && tokenMessage.includes(tokenDetail)) return text;
    const ketThuc = text.endsWith('.') || text.endsWith('\n') ? text : `${text}.`;
    return `${ketThuc}\n${label}: ${chiTiet}`;
};

const dinhDangMaTen = (ma = '', ten = '', fallback = '') => {
    const code = lamSachChuoiHienThi(ma);
    const name = lamSachChuoiHienThi(ten);
    if (code && name) return `[${code}] ${name}`;
    if (code) return `[${code}]`;
    return name || fallback;
};

const layMoTaThuoc = (row = {}, dm) => {
    const maThuoc = UPPER(row?.MA_THUOC || '');
    const dmThuoc = maThuoc ? dm?.MAP_THUOC_BV?.get(maThuoc) : null;
    const tenThuoc = lamSachChuoiHienThi(
        row?.TEN_THUOC
        || row?.TEN_HOAT_CHAT
        || row?.HOAT_CHAT
        || layGiaTriDanhMuc(dmThuoc, ['TEN_THUOC', 'TEN_HOAT_CHAT', 'HOAT_CHAT', 'TEN'])
    );
    return dinhDangMaTen(maThuoc, tenThuoc, 'thuốc');
};

const dinhDangSoGiaiTrinh = (value) => {
    const num = TO_NUMBER(value);
    if (!Number.isFinite(num)) return '0';
    const rounded = Math.round(num * 100) / 100;
    if (Math.abs(rounded - Math.round(rounded)) < 1e-9) return String(Math.round(rounded));
    return String(rounded).replace(/(\.\d*?[1-9])0+$/, '$1').replace(/\.0+$/, '');
};

const renderCanhBaoTemplate = (message = '', replacements = {}) => Object.entries(replacements).reduce(
    (text, [key, value]) => text.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value ?? '')),
    String(message || ''),
);

const taoPlaceholderCanhBaoThuoc = (row = {}) => {
    const soLuongCap = TO_NUMBER(row?.SO_LUONG);
    const slMoiNgay = Math.max(TO_NUMBER(row?.CALC_SL_MOI_NGAY), TO_NUMBER(row?.SL_MOI_NGAY));
    const soNgay = TO_NUMBER(row?.SO_NGAY);
    const soLuongYLenh = slMoiNgay > 0 && soNgay > 0 ? (slMoiNgay * soNgay) : 0;
    const duQty = Math.max(0, soLuongCap - soLuongYLenh);
    return {
        MA_THUOC: lamSachChuoiHienThi(row?.MA_THUOC || ''),
        TEN_THUOC: lamSachChuoiHienThi(row?.TEN_THUOC || row?.MA_THUOC || 'thuốc'),
        DU_QTY: dinhDangSoGiaiTrinh(duQty),
        SO_LUONG: dinhDangSoGiaiTrinh(soLuongCap),
        SL_MOI_NGAY: dinhDangSoGiaiTrinh(slMoiNgay),
        CALC_SL_MOI_NGAY: dinhDangSoGiaiTrinh(slMoiNgay),
        SO_NGAY: dinhDangSoGiaiTrinh(soNgay),
        UNIT: lamSachChuoiHienThi(row?.DON_VI_TINH || 'đơn vị'),
    };
};

const layChiTietTinhToanThieuThuoc = (row = {}) => {
    const soLuongCap = TO_NUMBER(row?.SO_LUONG);
    const slMoiNgay = Math.max(TO_NUMBER(row?.CALC_SL_MOI_NGAY), TO_NUMBER(row?.SL_MOI_NGAY));
    const soNgay = TO_NUMBER(row?.SO_NGAY);
    if (slMoiNgay <= 0 || soNgay <= 0) return '';

    const soLuongYLenh = slMoiNgay * soNgay;
    if (soLuongCap >= soLuongYLenh) return '';

    const soLuongThieu = soLuongYLenh - soLuongCap;
    const lieuDung = lamSachChuoiHienThi(row?.LIEU_DUNG || '');
    const chiTiet = [
        `Cấp phát ${dinhDangSoGiaiTrinh(soLuongCap)} < y lệnh ${dinhDangSoGiaiTrinh(soLuongYLenh)} = ${dinhDangSoGiaiTrinh(slMoiNgay)} đơn vị/ngày x ${dinhDangSoGiaiTrinh(soNgay)} ngày`,
        `Thiếu ${dinhDangSoGiaiTrinh(soLuongThieu)} đơn vị`,
    ];
    if (lieuDung) chiTiet.push(`Liều dùng: ${lieuDung}`);
    return chiTiet.join('; ');
};

const laVuotNguongDoLamTronThuoc = (row = {}) => {
    const soLuongCap = TO_NUMBER(row?.SO_LUONG);
    const slMoiNgay = Math.max(TO_NUMBER(row?.CALC_SL_MOI_NGAY), TO_NUMBER(row?.SL_MOI_NGAY));
    const soNgay = TO_NUMBER(row?.SO_NGAY);
    if (soLuongCap <= 0 || slMoiNgay <= 0 || soNgay <= 0) return false;

    const soLuongYLenh = slMoiNgay * soNgay;
    if (soLuongCap <= soLuongYLenh) return false;

    const phanLe = Math.abs(soLuongYLenh - Math.trunc(soLuongYLenh));
    if (phanLe <= 1e-6) return false;

    const donViTinh = UPPER(row?.DON_VI_TINH || '');
    const laDonViRoiRac = /(VIEN|VIÊN|GOI|GÓI|ONG|ỐNG|CHAI|LO|LỌ|TUYP|MIENG|MIẾNG|CAI|CÁI)/.test(donViTinh);
    if (!laDonViRoiRac) return false;

    // Don vi roi rac khong the cap phat so le, cho phep lam tron len 1 don vi.
    return Math.abs(soLuongCap - Math.ceil(soLuongYLenh)) <= 1e-6;
};

const layMoTaDvkt = (row = {}, dm) => {
    const maDv = UPPER(row?.MA_DICH_VU || row?.MA_DVKT || '');
    const dmDv = maDv
        ? (dm?.MAP_DVKT_BV?.get(maDv) || dm?.MAP_BYT_PL1?.get(maDv) || dm?.MAP_BYT_PL11?.get(maDv))
        : null;
    const tenDv = lamSachChuoiHienThi(
        row?.TEN_DICH_VU
        || row?.TEN_DVKT
        || row?.TEN_CHI_SO
        || row?.MO_TA
        || layGiaTriDanhMuc(dmDv, ['TEN_DICH_VU', 'TEN_DV', 'TEN_CHI_SO', 'MO_TA', 'TEN'])
    );
    return dinhDangMaTen(maDv, tenDv, 'dịch vụ');
};

const layTongSoGiuongDanhMuc = (row = {}) => (
    ['GIUONG_PD', 'GIUONG_TK', 'GIUONG_HSTC', 'GIUONG_HSCC', 'GIUONG_2015']
        .reduce((sum, key) => sum + Math.max(0, TO_NUMBER(row?.[key])), 0)
);

/** Neo KT221 / SUM_IF tiền giường XML3 — đồng bộ chuỗi Chuyên đề; dùng stringify trong engine rule động (Chuyen_de_166). */
const laDongGiuongXml3Kt221Neo = (item) => {
    if (!item) return false;
    const m = UPPER(String(item.MA_DICH_VU || item.MA_DV || ''));
    const u = UPPER(String(item.TEN_DICH_VU || ''));
    const n = UPPER(String(item.NHOM_DV || ''));
    const nh = String(item.MA_NHOM || '').trim();
    return nh === '14' || nh === '15' || m.startsWith('19')
        || n.includes('GIƯỜNG') || n.includes('GIUONG')
        || u.includes('GIƯỜNG') || u.includes('GIUONG');
};

const layMoTaKhoa = (row = {}, dm) => {
    const maKhoa = UPPER(row?.MA_KHOA || '');
    const dmKhoa = maKhoa ? dm?.MAP_KHOA_BV?.get(maKhoa) : null;
    const tenKhoa = lamSachChuoiHienThi(
        row?.TEN_KHOA
        || dmKhoa?.TEN_KHOA
        || dmKhoa?.TEN
    );
    const banKham = TO_NUMBER(dmKhoa?.BAN_KHAM);
    const tongGiuong = layTongSoGiuongDanhMuc(dmKhoa);
    const maLoaiKcb = lamSachChuoiHienThi(dmKhoa?.MA_LOAI_KCB);
    const ldlk = lamSachChuoiHienThi(dmKhoa?.LDLK);
    const base = dinhDangMaTen(maKhoa, tenKhoa, maKhoa ? `[${maKhoa}]` : 'khoa');
    const extras = [];
    if (banKham > 0) extras.push(`Bàn khám: ${banKham}`);
    if (tongGiuong > 0) extras.push(`Giường đăng ký: ${tongGiuong}`);
    if (maLoaiKcb) extras.push(`Loại KCB: ${maLoaiKcb}`);
    if (ldlk) extras.push(`LDLK: ${ldlk}`);
    return taoNhomChiTietDuyNhat([base, ...extras]).join('; ');
};

const timNhanSuTheoMa = (maNhanSu = '', dm) => {
    const ma = UPPER(maNhanSu || '');
    if (!ma || !dm?.MAP_NHAN_SU) return null;
    return dm.MAP_NHAN_SU.get(ma) || null;
};

const layMoTaNhanSu = ({ maBacSi = '', nguoiThucHien = '', dm } = {}) => {
    const ma = UPPER(maBacSi || '');
    const nhanSu = timNhanSuTheoMa(ma, dm);
    const hoTen = lamSachChuoiHienThi(
        nguoiThucHien
        || nhanSu?.HO_TEN
        || nhanSu?.TEN_BAC_SI
        || nhanSu?.TEN_NHAN_SU
    );
    const macchn = lamSachChuoiHienThi(nhanSu?.MACCHN || nhanSu?.SO_CCHN || nhanSu?.SO_GPHN);
    const phamVi = lamSachChuoiHienThi(nhanSu?.PHAMVI_CM || nhanSu?.PHAMVI_CMBS || nhanSu?.PHAMVI);
    const chucDanh = lamSachChuoiHienThi(
        nhanSu?.CHUCDANH_NN
        || nhanSu?.CHUC_DANH
        || nhanSu?.TEN_CDNN
        || nhanSu?.MA_CDNN
    );
    const base = macchn && hoTen
        ? `${macchn} (${hoTen})`
        : dinhDangMaTen(macchn || ma, hoTen, hoTen || (macchn || ma ? `[${macchn || ma}]` : 'nhân sự'));
    const extras = [];
    if (!macchn && ma) extras.push(`Mã nhân sự: ${ma}`);
    if (chucDanh) extras.push(`Chức danh: ${chucDanh}`);
    if (phamVi) extras.push(`Phạm vi: ${phamVi}`);
    return taoNhomChiTietDuyNhat([base, ...extras]).join('; ');
};

const layTongTienDongThuocChoGiaiTrinh = (row = {}) => {
    const ungVien = [row?.THANH_TIEN_BH, row?.THANH_TIEN, row?.THANH_TIEN_BV, row?.T_BHTT];
    const giaTri = ungVien.find((value) => !IS_EMPTY(value));
    return TO_NUMBER(giaTri);
};

const taoTomTatTopChiPhi = (rows = [], dm, loai = 'THUOC', limit = 3) => {
    const getLabel = loai === 'DVKT' ? layMoTaDvkt : layMoTaThuoc;
    const getAmount = loai === 'DVKT'
        ? (row) => TO_NUMBER(row?.THANH_TIEN_BV || row?.THANH_TIEN || row?.THANH_TIEN_BH)
        : layTongTienDongThuocChoGiaiTrinh;
    return (Array.isArray(rows) ? rows : [])
        .filter((row) => !laBHYTKhôngThanhToan(row))
        .map((row) => ({
            label: getLabel(row, dm),
            amount: getAmount(row),
        }))
        .filter((item) => item.amount > 0 || lamSachChuoiHienThi(item.label))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, limit)
        .map((item) => `${item.label}: ${item.amount.toLocaleString()}đ`)
        .join('; ');
};

const laDongDichVuGiuong = (row = {}) => {
    const maDv = UPPER(row?.MA_DICH_VU || '');
    return maDv.startsWith('19')
        || UPPER(row?.NHOM_DV || '').includes('GIƯỜNG')
        || UPPER(row?.TEN_DICH_VU || '').includes('GIƯỜNG');
};

const taoTomTatDichVuGiuong = (rows = [], dm, limit = 3) => (Array.isArray(rows) ? rows : [])
    .filter((row) => laDongDichVuGiuong(row))
    .map((row) => `${layMoTaDvkt(row, dm)}: ${TO_NUMBER(row?.SO_LUONG).toLocaleString()} ngày`)
    .filter(Boolean)
    .slice(0, limit)
    .join('; ');

const laTrangThaiKhongHoatDongDanhMuc = (raw) => {
    const token = String(raw || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '');
    if (!token) return false;
    return token.includes('NGUNG')
        || token.includes('TAMNGUNG')
        || token.includes('KHONGHIEULUC')
        || token.includes('HETHIEULUC')
        || token.includes('KHOA')
        || token.includes('INACTIVE')
        || token === '0'
        || token === 'OFF'
        || token === 'FALSE';
};

const giamDinhChatLuongDanhMucBenhVien = (hoSo, dm) => {
    const ds = [];
    const xml2 = hoSo.XML2 || hoSo.xml2 || [];
    const xml3 = hoSo.XML3 || hoSo.xml3 || [];
    const seenThuoc = new Set();
    const seenDvkt = new Set();

    const laDongKhongBHYT = (row) => {
        const nguon = UPPER(row?.NGUON_CTRA || row?.NGUON_THANH_TOAN || '');
        if (nguon && nguon !== 'BHYT' && nguon !== '1') return true;
        const mucHuong = TO_NUMBER(row?.MUC_HUONG);
        if (!IS_EMPTY(row?.MUC_HUONG) && mucHuong === 0) return true;
        return false;
    };

    const addLoi = (phanHe, maLuat, maDanhMuc, truong, canhBao, mucDo = 'Warning') => {
        ds.push({
            phan_he: phanHe,
            index: -1,
            truong_loi: truong,
            canh_bao: canhBao,
            muc_do: mucDo,
            ma_luat: maLuat,
            dieu_kien: 'BUILT-IN',
            co_so_phap_ly: CO_SO_PHAP_LY_DVKT.CHAT_LUONG_DANH_MUC_BV,
            ma_danh_muc: maDanhMuc,
        });
    };

    if (!dm?.MAP_DVKT_BV || dm.MAP_DVKT_BV.size === 0) {
        addLoi('XML3', 'DMBV-DVKT-00', 'N/A', 'MAP_DVKT_BV',
            'Danh mục DVKT nội bộ BV chưa được nạp/không có dữ liệu, có thể gây sai sót khi đối soát.', 'Info');
    }

    if (!dm?.MAP_THUOC_BV || dm.MAP_THUOC_BV.size === 0) {
        addLoi('XML2', 'DMBV-THUOC-00', 'N/A', 'MAP_THUOC_BV',
            'Danh mục thuốc nội bộ BV chưa được nạp/không có dữ liệu, có thể gây sai sót khi đối soát.', 'Info');
    }

    xml3.forEach((row) => {
        if (laDongKhongBHYT(row)) return;
        const maDv = UPPER(row?.MA_DICH_VU || '');
        if (!maDv || seenDvkt.has(maDv)) return;
        seenDvkt.add(maDv);

        const dmDv = dm?.MAP_DVKT_BV?.get(maDv);
        if (!dmDv) return;

        const tenDv = layGiaTriDanhMuc(dmDv, ['TEN_DICH_VU', 'TEN_DV', 'TEN']);
        const donGia = TO_NUMBER(layGiaTriDanhMuc(dmDv, ['DON_GIA_BV', 'DON_GIA', 'GIA']));
        const maNhom = layGiaTriDanhMuc(dmDv, ['MA_NHOM', 'MA_NHOM_DV', 'NHOM']);
        const tuNgay = layGiaTriDanhMuc(dmDv, ['TU_NGAY', 'TUNGAY', 'HD_TU', 'NGAY_HL_TU']);
        const trangThai = layGiaTriDanhMuc(dmDv, ['TRANG_THAI', 'TRANGTHAI', 'TINH_TRANG', 'PHE_DUYET', 'DUOC_PHE_DUYET']);

        if (IS_EMPTY(tenDv)) {
            addLoi('XML3', 'DMBV-DVKT-01', maDv, 'TEN_DICH_VU',
                `Danh mục DVKT BV mã [${maDv}] thiếu TEN_DICH_VU, đề xuất bổ sung để đảm bảo đối chiếu giải trình.`);
        }
        if (donGia <= 0) {
            addLoi('XML3', 'DMBV-DVKT-02', maDv, 'DON_GIA_BV',
                `Danh mục DVKT BV mã [${maDv}] chưa có DON_GIA_BV hợp lệ (>0), đề xuất cập nhật giá phê duyệt.`, 'Error');
        }
        if (IS_EMPTY(maNhom)) {
            addLoi('XML3', 'DMBV-DVKT-03', maDv, 'MA_NHOM',
                `Danh mục DVKT BV mã [${maDv}] thiếu MA_NHOM/phân loại dịch vụ, có thể ảnh hưởng tổng hợp chi phí.`);
        }
        if (IS_EMPTY(tuNgay)) {
            addLoi('XML3', 'DMBV-DVKT-04', maDv, 'TU_NGAY',
                `Danh mục DVKT BV mã [${maDv}] thiếu thông tin ngày hiệu lực (TU_NGAY/HD_TU).`);
        }
        if (laTrangThaiKhongHoatDongDanhMuc(trangThai)) {
            addLoi('XML3', 'DMBV-DVKT-05', maDv, 'TRANG_THAI',
                `Danh mục DVKT BV mã [${maDv}] đang ở trạng thái không hoạt động/hiệu lực. Cần rà soát trước khi thanh toán.`);
        }
    });

    xml2.forEach((row) => {
        if (laDongKhongBHYT(row)) return;
        const maThuoc = UPPER(row?.MA_THUOC || '');
        if (!maThuoc || seenThuoc.has(maThuoc)) return;
        seenThuoc.add(maThuoc);

        const dmThuoc = dm?.MAP_THUOC_BV?.get(maThuoc);
        if (!dmThuoc) return;

        const tenThuoc = layGiaTriDanhMuc(dmThuoc, ['TEN_THUOC', 'TEN_HOAT_CHAT', 'HOAT_CHAT', 'TEN']);
        const donGia = layGiaTrungThauNoiBoTuDmThuocM03(dmThuoc);
        const tuNgay = layGiaTriDanhMuc(dmThuoc, ['TU_NGAY', 'TUNGAY', 'HD_TU', 'NGAY_HL_TU']);
        const trangThai = layGiaTriDanhMuc(dmThuoc, ['TRANG_THAI', 'TRANGTHAI', 'TINH_TRANG', 'PHE_DUYET', 'DUOC_PHE_DUYET']);

        if (IS_EMPTY(tenThuoc)) {
            addLoi('XML2', 'DMBV-THUOC-01', maThuoc, 'TEN_THUOC',
                `Danh mục thuốc BV mã [${maThuoc}] thiếu TEN_THUOC/HOAT_CHAT, đề xuất bổ sung trước khi đối soát.`);
        }
        if (donGia <= 0) {
            addLoi('XML2', 'DMBV-THUOC-02', maThuoc, 'GIA_BH_TT',
                `Danh mục thuốc BV mã [${maThuoc}] chưa có giá tham chiếu trúng thầu hợp lệ (>0) trên Mẫu 03 (GIA_BH_TT / DON_GIA_TT / …).`, 'Error');
        }
        if (IS_EMPTY(tuNgay)) {
            addLoi('XML2', 'DMBV-THUOC-03', maThuoc, 'TU_NGAY',
                `Danh mục thuốc BV mã [${maThuoc}] thiếu thông tin ngày hiệu lực (TU_NGAY/HD_TU).`);
        }
        if (laTrangThaiKhongHoatDongDanhMuc(trangThai)) {
            addLoi('XML2', 'DMBV-THUOC-04', maThuoc, 'TRANG_THAI',
                `Danh mục thuốc BV mã [${maThuoc}] đang ở trạng thái không hoạt động/hiệu lực.`);
        }
    });

    return ds;
};

// ============================================================
// [PHẦN 7] LAYER 4: KIỂM TRA LÂM SÀNG CHI TIẾT
// ============================================================

const _getXML1 = (hoSo) => prepareData(Array.isArray(hoSo.XML1 || hoSo.xml1) ? (hoSo.XML1 || hoSo.xml1)[0] : (hoSo.XML1 || hoSo.xml1));
const _laHoSoNgoaiTru = (xml1) => laHoSoNgoaiTruTheoQd824(xml1);
const _laHoSoNoiTru = (xml1) => laHoSoNoiTruTheoQd824(xml1) || laHoSoNoiTruBanNgayTheoQd824(xml1);
const giamDinhThuoc = (hoSo, dm) => {
    const ds = [];
    const xml1 = _getXML1(hoSo);
    const xml2 = hoSo.XML2 || hoSo.xml2 || [];
    const laNgoaiTru = _laHoSoNgoaiTru(xml1);
    const laNoiTru = _laHoSoNoiTru(xml1);
    const duocKeDonQua30Ngay = laNgoaiTru && !laNoiTru && isClaimAllowedPrescriptionOver30Days(xml1, dm);
    const phaiKeDonTren30Ngay = laNgoaiTru && !laNoiTru && hoSoPhaiKeDonTren30NgayTheoDmTT26(xml1, dm);
    const coTiêmChíchBHYT = coBHYTThuocTiêmChíchTrongHoSo(hoSo);
    let daGhiClnThuoc05 = false;
    const maThuocMap = new Map();

    xml2.forEach((row, idx) => {
        if (laBHYTKhôngThanhToan(row)) return;
        const e = enrichXML2Data(row);
        const ma = UPPER(e.MA_THUOC || '');

        // CLN-THUOC-01 chi ap dung cho KCB ngoai tru (khong ap dung noi tru/ban ngay).
        if (ma && laNgoaiTru) {
            if (maThuocMap.has(ma))
                ds.push({ phan_he: 'XML2', index: idx, truong_loi: 'MA_THUOC',
                    canh_bao: `Thuốc [${ma}] trùng lặp (dòng ${maThuocMap.get(ma)+1} và ${idx+1}). Cần đối chiếu để tránh kê trùng đơn ngoại trú.`,
                    muc_do: 'Warning', ma_luat: 'CLN-THUOC-01', ten_quy_tac: 'Trùng thuốc', dieu_kien: 'BUILT-IN',
                    co_so_phap_ly: CO_SO_PHAP_LY_THUOC.KE_DON_NGOAI_TRU });
            else maThuocMap.set(ma, idx);
        }

        if (TO_NUMBER(e.SO_LUONG) <= 0)
            ds.push({ phan_he: 'XML2', index: idx, truong_loi: 'SO_LUONG',
                canh_bao: `Số lượng thuốc [${ma}] = ${e.SO_LUONG} không hợp lệ.`,
                muc_do: 'Error', ma_luat: 'CLN-THUOC-02', ten_quy_tac: 'Số lượng thuốc', dieu_kien: 'BUILT-IN',
                co_so_phap_ly: CO_SO_PHAP_LY_THUOC.KE_DON_NGOAI_TRU });

        if (IS_EMPTY(e.LIEU_DUNG))
            ds.push({ phan_he: 'XML2', index: idx, truong_loi: 'LIEU_DUNG',
                canh_bao: `Thuốc [${ma || 'N/A'}] chưa khai liều dùng/cách dùng rõ ràng trên đơn.`,
                muc_do: 'Warning', ma_luat: 'CLN-THUOC-03', ten_quy_tac: 'Liều dùng thuốc', dieu_kien: 'BUILT-IN',
                co_so_phap_ly: CO_SO_PHAP_LY_THUOC.KE_DON_NGOAI_TRU });

        const soNgaySuDung = Math.max(TO_NUMBER(e.SO_NGAY_DTRI), TO_NUMBER(e.SO_NGAY));
        if (laNgoaiTru && soNgaySuDung > 30 && !duocKeDonQua30Ngay)
            ds.push({ phan_he: 'XML2', index: idx, truong_loi: 'SO_NGAY_DTRI',
                canh_bao: `Thuốc [${ma || 'N/A'}] có số ngày sử dụng ${soNgaySuDung} (>30 ngày) nhưng hồ sơ không thuộc danh mục ICD10 được phép kê ngoại trú quá 30 ngày.`,
                muc_do: 'Warning', ma_luat: 'CLN-THUOC-04', ten_quy_tac: 'Số ngày sử dụng thuốc', dieu_kien: 'BUILT-IN',
                co_so_phap_ly: CO_SO_PHAP_LY_THUOC.SO_NGAY_SU_DUNG });

        if (phaiKeDonTren30Ngay && soNgaySuDung > 0 && soNgaySuDung <= 30)
            ds.push({
                phan_he: 'XML2',
                index: idx,
                truong_loi: 'SO_NGAY',
                canh_bao: `Thuốc [${ma || 'N/A'}] có số ngày sử dụng ${soNgaySuDung} (≤30 ngày) trong khi ${moTaDieuKienKeDon30NgayTT26(xml1)} — cần kê đơn trên 30 ngày (tối đa 90 ngày theo lâm sàng).`,
                muc_do: 'Warning',
                ma_luat: 'CLN-THUOC-06',
                ten_quy_tac: 'Kê đơn ≤30 ngày — bệnh chính (± kèm theo) trong danh mục TT26 >30 ngày',
                dieu_kien: 'BUILT-IN',
                co_so_phap_ly: CO_SO_PHAP_LY_THUOC.SO_NGAY_SU_DUNG,
            });

        if (
            laNgoaiTru
            && !laNoiTru
            && duocKeDonQua30Ngay
            && soNgaySuDung > 30
            && !coTiêmChíchBHYT
            && !daGhiClnThuoc05
        ) {
            daGhiClnThuoc05 = true;
            ds.push({
                phan_he: 'XML2',
                index: idx,
                truong_loi: 'SO_NGAY',
                canh_bao: '💡 Ngoại trú — ICD thuộc danh mục cho phép kê đơn dài hơn 30 ngày: đơn hiện >30 ngày phù hợp khung danh mục nội bộ (ICD-10 kê đơn >30 ngày). Vẫn cần đối chiếu lâm sàng và quy định BV. Gợi ý này không hiển thị khi hồ sơ có thuốc BHYT đường tiêm/chích/truyền (MA_DUONG_DUNG nhóm 2.x hoặc mô tả tương đương trên XML2).',
                muc_do: 'Info',
                ma_luat: 'CLN-THUOC-05',
                ten_quy_tac: 'ICD danh mục >30 ngày — gợi ý kê đơn',
                dieu_kien: 'BUILT-IN',
                co_so_phap_ly: CO_SO_PHAP_LY_THUOC.SO_NGAY_SU_DUNG,
            });
        }

    });
    return ds;
};

const chuanHoaTokenKhongDau = (raw) => String(raw || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');

const laDongPtttThucSu = (row) => {
    const maNhom = String(row?.MA_NHOM || '').trim();
    const maDv = UPPER(row?.MA_DICH_VU || '');
    const maPtttQt = UPPER(row?.MA_PTTT_QT || '');
    const nhomDvToken = chuanHoaTokenKhongDau(row?.NHOM_DV || '');
    const tenDvToken = chuanHoaTokenKhongDau(row?.TEN_DICH_VU || '');
    return maNhom === '4'
        || maNhom === '5'
        || maDv.startsWith('43')
        || maDv.startsWith('44')
        || !!maPtttQt
        || nhomDvToken.includes('PTTT')
        || nhomDvToken.includes('PHAUTHUAT')
        || nhomDvToken.includes('THUTHUAT')
        || tenDvToken.includes('PHAUTHUAT')
        || tenDvToken.includes('THUTHUAT')
        || tenDvToken.includes('TIEUPHAU')
        || tenDvToken.includes('CANTHIEP')
        || tenDvToken.includes('NOISOI');
};

const giamDinhCDHA = (hoSo) => {
    const ds = [];
    const xml3 = hoSo.XML3 || hoSo.xml3 || [];
    const cdhaMap = new Map();

    xml3.forEach((row, idx) => {
        if (laBHYTKhôngThanhToan(row)) return;
        const maDV = UPPER(row.MA_DICH_VU || '');
        const isCDHA = maDV.startsWith('05') || maDV.startsWith('06') || maDV.startsWith('07') || maDV.startsWith('08')
            || UPPER(row.NHOM_DV || '').includes('CDHA') || UPPER(row.NHOM_DV || '').includes('SIÊU ÂM');
        if (!isCDHA) return;

        const ngay = String(row.NGAY_YL || row.NGAY_THUC_HIEN || '').substring(0,8);
        const key = `${maDV}_${ngay}`;
        if (cdhaMap.has(key))
            ds.push({ phan_he: 'XML3', index: idx, truong_loi: 'MA_DICH_VU',
                canh_bao: `Dịch vụ CDHA [${maDV}] thực hiện trùng trong cùng ngày [${ngay}] (TT 39/2024/TT-BYT).`,
                muc_do: 'Warning', ma_luat: 'CLN-CDHA-01', ten_quy_tac: 'Trùng CDHA cùng ngày', dieu_kien: 'BUILT-IN' });
        else cdhaMap.set(key, idx);

        if (TO_NUMBER(row.SO_LUONG) > 1)
            ds.push({ phan_he: 'XML3', index: idx, truong_loi: 'SO_LUONG',
                canh_bao: `CDHA [${maDV}] có số lượng = ${row.SO_LUONG} > 1. Cần xác minh chỉ định y tế.`,
                muc_do: 'Info', ma_luat: 'CLN-CDHA-02', ten_quy_tac: 'Số lượng CDHA', dieu_kien: 'BUILT-IN' });
    });
    return ds;
};

const giamDinhGiuong = (hoSo, dm) => {
    const ds = [];
    const xml1 = _getXML1(hoSo);
    if (!laHoSoNoiTruTheoQd824(xml1)) return ds;
    const xml3 = hoSo.XML3 || hoSo.xml3 || [];
    const soNgayDtri = TO_NUMBER(xml1.SO_NGAY_DTRI);
    if (soNgayDtri <= 0) return ds;

    let tongGiuong = 0;
    xml3.forEach(r => {
        if (laDongDichVuGiuong(r))
            tongGiuong += TO_NUMBER(r.SO_LUONG);
    });

    if (tongGiuong > 0 && Math.abs(tongGiuong - soNgayDtri) > 1)
        ds.push({ phan_he: 'XML1', index: -1, truong_loi: 'SO_NGAY_DTRI',
            canh_bao: dinhKemChiTietCanhBao(
                `Tổng ngày giường XML3 [${tongGiuong}] không khớp SO_NGAY_DTRI XML1 [${soNgayDtri}]. Chênh ${Math.abs(tongGiuong-soNgayDtri)} ngày (QĐ 130 khoản 3.2).`,
                'Dòng giường XML3',
                [taoTomTatDichVuGiuong(xml3, dm)]
            ),
            muc_do: 'Warning', ma_luat: 'CLN-GIUONG-01', ten_quy_tac: 'Số ngày giường', dieu_kien: 'BUILT-IN' });
    return ds;
};

const giamDinhPTTT = (hoSo) => {
    const ds = [];
    const xml1 = _getXML1(hoSo);
    const xml3 = hoSo.XML3 || hoSo.xml3 || [];
    const xml5 = hoSo.XML5 || hoSo.xml5 || [];
    const maPTTT = UPPER(xml1.MA_PTTT_QT || '');
    const maLK = UPPER(xml1.MA_LK || '');
    const normalizeTime12 = (v) => String(v || '').replace(/\D/g, '').padEnd(12, '0');
    const isBefore = (a, b) => normalizeTime12(a) < normalizeTime12(b);
    const hasValue = (v) => !IS_EMPTY(v);
    const dsPTTT = xml3
        .map((row, index) => ({ row, index }))
        .filter(({ row }) => laDongPtttThucSu(row));

    if (!maPTTT && dsPTTT.length > 0) {
        ds.push({ phan_he: 'XML1', index: -1, truong_loi: 'MA_PTTT_QT',
            canh_bao: `XML3 có ${dsPTTT.length} dòng PTTT nhưng XML1 chưa khai MA_PTTT_QT.`,
            muc_do: 'Warning', ma_luat: 'CLN-PTTT-02', ten_quy_tac: 'Khai báo MA_PTTT_QT', dieu_kien: 'BUILT-IN' });
    }

    dsPTTT.forEach(({ row, index }) => {
        const soLuong = TO_NUMBER(row.SO_LUONG);
        const maLkDong = UPPER(row.MA_LK || '');
        const maPTTTDong = UPPER(row.MA_PTTT_QT || '');
        const ngayYLenh = row.NGAY_YL || '';
        const ngayThucHien = row.NGAY_TH_YL || row.NGAY_YL || '';
        const nguoiThucHien = UPPER(row.NGUOI_THUC_HIEN || '');
        const maBacSi = UPPER(row.MA_BAC_SI || '');

        if (hasValue(maLK) && hasValue(maLkDong) && maLkDong !== maLK) {
            ds.push({ phan_he: 'XML3', index, truong_loi: 'MA_LK',
                canh_bao: `Dong PTTT co MA_LK [${maLkDong}] không khớp XML1 [${maLK}].`,
                muc_do: 'Error', ma_luat: 'CLN-PTTT-03', ten_quy_tac: 'Liên kết MA_LK', dieu_kien: 'BUILT-IN' });
        }
        if (soLuong <= 0) {
            ds.push({ phan_he: 'XML3', index, truong_loi: 'SO_LUONG',
                canh_bao: `Số lượng PTTT không hợp lệ (${row.SO_LUONG || 0}).`,
                muc_do: 'Error', ma_luat: 'CLN-PTTT-04', ten_quy_tac: 'Số lượng PTTT', dieu_kien: 'BUILT-IN' });
        }
        if (!hasValue(maPTTTDong) && !hasValue(maPTTT)) {
            ds.push({ phan_he: 'XML3', index, truong_loi: 'MA_PTTT_QT',
                canh_bao: 'Dòng PTTT chưa khai MA_PTTT_QT ở XML3 và XML1.',
                muc_do: 'Warning', ma_luat: 'CLN-PTTT-05', ten_quy_tac: 'Mã PTTT quốc tế', dieu_kien: 'BUILT-IN' });
        }
        if (hasValue(maPTTT) && hasValue(maPTTTDong) && maPTTTDong !== maPTTT) {
            ds.push({ phan_he: 'XML3', index, truong_loi: 'MA_PTTT_QT',
                canh_bao: `MA_PTTT_QT dong XML3 [${maPTTTDong}] không khớp XML1 [${maPTTT}].`,
                muc_do: 'Warning', ma_luat: 'CLN-PTTT-06', ten_quy_tac: 'Đối chiếu MA_PTTT_QT', dieu_kien: 'BUILT-IN' });
        }
        if (!hasValue(ngayThucHien)) {
            ds.push({ phan_he: 'XML3', index, truong_loi: 'NGAY_TH_YL',
                canh_bao: 'Dòng PTTT thiếu thời điểm thực hiện (NGAY_TH_YL).',
                muc_do: 'Warning', ma_luat: 'CLN-PTTT-07', ten_quy_tac: 'Thời điểm thực hiện', dieu_kien: 'BUILT-IN' });
        }
        if (hasValue(ngayYLenh) && hasValue(ngayThucHien) && isBefore(ngayThucHien, ngayYLenh)) {
            ds.push({ phan_he: 'XML3', index, truong_loi: 'NGAY_TH_YL',
                canh_bao: `Thời điểm thực hiện [${ngayThucHien}] sớm hơn ngày y lệnh [${ngayYLenh}].`,
                muc_do: 'Error', ma_luat: 'CLN-PTTT-08', ten_quy_tac: 'Logic thời gian y lệnh', dieu_kien: 'BUILT-IN' });
        }
        if (hasValue(xml1.NGAY_VAO) && hasValue(ngayThucHien) && isBefore(ngayThucHien, xml1.NGAY_VAO)) {
            ds.push({ phan_he: 'XML3', index, truong_loi: 'NGAY_TH_YL',
                canh_bao: `Thời điểm PTTT [${ngayThucHien}] trước ngày vào viện [${xml1.NGAY_VAO}].`,
                muc_do: 'Warning', ma_luat: 'CLN-PTTT-09', ten_quy_tac: 'Khoảng thời gian điều trị', dieu_kien: 'BUILT-IN' });
        }
        if (hasValue(xml1.NGAY_RA) && hasValue(ngayThucHien) && isBefore(xml1.NGAY_RA, ngayThucHien)) {
            ds.push({ phan_he: 'XML3', index, truong_loi: 'NGAY_TH_YL',
                canh_bao: `Thời điểm PTTT [${ngayThucHien}] sau ngày ra viện [${xml1.NGAY_RA}].`,
                muc_do: 'Warning', ma_luat: 'CLN-PTTT-10', ten_quy_tac: 'Khoảng thời gian điều trị', dieu_kien: 'BUILT-IN' });
        }
        if (!hasValue(nguoiThucHien) && !hasValue(maBacSi)) {
            ds.push({ phan_he: 'XML3', index, truong_loi: 'NGUOI_THUC_HIEN',
                canh_bao: 'Dong PTTT thiếu NGUOI_THUC_HIEN va MA_BAC_SI.',
                muc_do: 'Error', ma_luat: 'CLN-PTTT-11', ten_quy_tac: 'Người thực hiện PTTT', dieu_kien: 'BUILT-IN' });
        }
    });

    if (dsPTTT.length > 0) {
        if (xml5.length === 0) {
            ds.push({ phan_he: 'XML5', index: -1, truong_loi: 'PHAU_THUAT',
                canh_bao: 'Có PTTT trong XML3 nhưng chưa có XML5 để đối soát diễn biến/phẫu thuật.',
                muc_do: 'Info', ma_luat: 'CLN-PTTT-12', ten_quy_tac: 'Doi soat XML5', dieu_kien: 'BUILT-IN' });
        } else {
            const coTomTatPTTT = xml5.some((row) => hasValue(row.PHAU_THUAT));
            if (!coTomTatPTTT) {
                ds.push({ phan_he: 'XML5', index: -1, truong_loi: 'PHAU_THUAT',
                    canh_bao: 'XML3 có PTTT nhưng XML5 chưa ghi tóm tắt phẫu thuật/thủ thuật (PHAU_THUAT).',
                    muc_do: 'Warning', ma_luat: 'CLN-PTTT-13', ten_quy_tac: 'Tóm tắt PTTT trên XML5', dieu_kien: 'BUILT-IN' });
            }
        }
    }

    const coRowPTTT = dsPTTT.length > 0;
    if (maPTTT && !coRowPTTT)
        ds.push({ phan_he: 'XML1', index: -1, truong_loi: 'MA_PTTT_QT',
            canh_bao: `MA_PTTT_QT khai báo [${maPTTT}] nhưng không tìm thấy DVKT PTTT tương ứng trong XML3.`,
            muc_do: 'Warning', ma_luat: 'CLN-PTTT-01', ten_quy_tac: 'Đối chiếu PTTT', dieu_kien: 'BUILT-IN' });
    return ds;
};

const giamDinhChuyenTuyen = (hoSo) => {
    const ds = [];
    const xml1 = _getXML1(hoSo);
    const maLoaiRV = String(xml1.MA_LOAI_RV || '').trim();
    if (maLoaiRV === '2' || maLoaiRV === '3') {
        if (IS_EMPTY(xml1.GIAY_CHUYEN_TUYEN))
            ds.push({ phan_he: 'XML1', index: -1, truong_loi: 'GIAY_CHUYEN_TUYEN',
                canh_bao: `Loại ra viện [${maLoaiRV}] (chuyển tuyến) nhưng GIAY_CHUYEN_TUYEN trống (Thông tư 01/2025/TT-BYT).`,
                muc_do: 'Error', ma_luat: 'CLN-CT-01', ten_quy_tac: 'Giấy chuyển tuyến', dieu_kien: 'BUILT-IN' });
        if (IS_EMPTY(xml1.MA_NOI_DI))
            ds.push({ phan_he: 'XML1', index: -1, truong_loi: 'MA_NOI_DI',
                canh_bao: 'Trường hợp chuyển tuyến nhưng MA_NOI_DI trống.',
                muc_do: 'Warning', ma_luat: 'CLN-CT-02', ten_quy_tac: 'Mã nơi chuyển đi', dieu_kien: 'BUILT-IN' });
    }
    return ds;
};

const giamDinhTongChiPhi = (hoSo, dm) => {
    const ds = [];
    const xml1 = _getXML1(hoSo);
    const xml2 = hoSo.XML2 || hoSo.xml2 || [];
    const xml3 = hoSo.XML3 || hoSo.xml3 || [];
    const NGUONG = 1000;
    const layTongTienDongThuoc = (row) => {
        const ungVien = [row?.THANH_TIEN_BH, row?.THANH_TIEN, row?.THANH_TIEN_BV, row?.T_BHTT];
        const giaTri = ungVien.find((value) => !IS_EMPTY(value));
        return TO_NUMBER(giaTri);
    };

    let tongThuoc = 0;
    xml2.forEach(r => { if (!laBHYTKhôngThanhToan(r)) tongThuoc += layTongTienDongThuoc(r); });
    // T_VTYT trong schema QĐ130 của dự án này bao gồm toàn bộ chi phí DVKT (XML3).
    // Không có trường T_DVKT riêng. T_VTYT là trường duy nhất để đối chiếu với XML3.
    let tongDVKT = 0;
    xml3.forEach(r => { if (!laBHYTKhôngThanhToan(r)) tongDVKT += TO_NUMBER(r.THANH_TIEN_BV); });

    const tThuoc = TO_NUMBER(xml1.T_THUOC);
    const tVTYT  = TO_NUMBER(xml1.T_VTYT); // T_VTYT = tổng DVKT theo cấu trúc XML1 dự án này

    if (xml2.length > 0 && tThuoc > 0 && Math.abs(tongThuoc - tThuoc) > NGUONG)
        ds.push({ phan_he: 'XML1', index: -1, truong_loi: 'T_THUOC',
            canh_bao: dinhKemChiTietCanhBao(
                `T_THUOC XML1 [${tThuoc.toLocaleString()}đ] ≠ tổng XML2 [${tongThuoc.toLocaleString()}đ]. Chênh: ${Math.abs(tongThuoc-tThuoc).toLocaleString()}đ.`,
                'Thuốc XML2 nổi bật',
                [taoTomTatTopChiPhi(xml2, dm, 'THUOC')]
            ),
            muc_do: 'Error', ma_luat: 'CLN-CHI-01', ten_quy_tac: 'Đối chiếu tổng tiền thuốc', dieu_kien: 'BUILT-IN' });

    if (xml3.length > 0 && tVTYT > 0 && Math.abs(tongDVKT - tVTYT) > NGUONG)
        ds.push({ phan_he: 'XML1', index: -1, truong_loi: 'T_VTYT',
            canh_bao: dinhKemChiTietCanhBao(
                `T_VTYT XML1 [${tVTYT.toLocaleString()}đ] ≠ tổng DVKT XML3 [${tongDVKT.toLocaleString()}đ]. Chênh: ${Math.abs(tongDVKT-tVTYT).toLocaleString()}đ.`,
                'DVKT XML3 nổi bật',
                [taoTomTatTopChiPhi(xml3, dm, 'DVKT')]
            ),
            muc_do: 'Error', ma_luat: 'CLN-CHI-02', ten_quy_tac: 'Đối chiếu T_VTYT với tổng XML3 (DVKT)', dieu_kien: 'BUILT-IN' });

    return ds;
};

/** Đa tầng / đa biến: liên kết XML1↔XML2 (nhi + cân nặng, parse liều, MA_LK, mốc thời gian y lệnh). */
const giamDinhChatCheoDaBien = (hoSo) => {
    const ds = [];
    const xml1 = _getXML1(hoSo);
    const xml2 = hoSo.XML2 || hoSo.xml2 || [];
    const normalizeTime12 = (v) => String(v || '').replace(/\D/g, '').padEnd(12, '0');

    const tuoiNam = TO_NUMBER(xml1.TUOI_NAM);
    const tuoiNgay = TO_NUMBER(xml1.TUOI_NGAY);
    const hasTuoiNam = !IS_EMPTY(xml1.TUOI_NAM) && Number.isFinite(tuoiNam) && tuoiNam > 0;
    const hasTuoiNgay = !IS_EMPTY(xml1.TUOI_NGAY) && Number.isFinite(tuoiNgay) && tuoiNgay > 0;
    const laTreEm = (hasTuoiNam && tuoiNam < 16) || (!hasTuoiNam && hasTuoiNgay && tuoiNgay < 5840);
    const canNang = TO_NUMBER(xml1.CAN_NANG);
    const coThuocBhyt = xml2.some((r) => !laBHYTKhôngThanhToan(r));
    if (laTreEm && coThuocBhyt && (!Number.isFinite(canNang) || canNang <= 0)) {
        ds.push({
            phan_he: 'XML1',
            index: -1,
            truong_loi: 'CAN_NANG',
            canh_bao: 'Trẻ em (<16 tuổi) có thuốc BHYT nhưng thiếu hoặc không hợp lệ CAN_NANG — kiểm tra mg/kg và quy tắc liều nhi kém tin cậy.',
            muc_do: 'Warning',
            ma_luat: 'CLN-XDC-01',
            ten_quy_tac: 'Nhi — CAN_NANG khi có thuốc BHYT',
            dieu_kien: 'BUILT-IN',
        });
    }

    const maLKXml1 = UPPER(xml1.MA_LK || '');
    xml2.forEach((row, idx) => {
        if (laBHYTKhôngThanhToan(row)) return;
        const e = enrichXML2Data(row);
        const lieuTxt = String(e.LIEU_DUNG || '').trim();
        if (lieuTxt.length >= 4) {
            const slNgay = Math.max(TO_NUMBER(e.CALC_SL_MOI_NGAY), TO_NUMBER(e.SL_MOI_NGAY));
            const soLuong = TO_NUMBER(e.SO_LUONG) || 0;
            if (slNgay === 0 && soLuong > 0) {
                ds.push({
                    phan_he: 'XML2',
                    index: idx,
                    truong_loi: 'LIEU_DUNG',
                    canh_bao: `Không suy ra được liều/ngày từ LIEU_DUNG; rủi ro sai khớp quy tắc liều (MA_THUOC: ${e.MA_THUOC || '-'}).`,
                    muc_do: 'Warning',
                    ma_luat: 'CLN-XDC-02',
                    ten_quy_tac: 'Parse liều từ LIEU_DUNG',
                    dieu_kien: 'BUILT-IN',
                });
            }
        }
        const maLkDong = UPPER(row.MA_LK || '');
        if (!IS_EMPTY(maLKXml1) && !IS_EMPTY(maLkDong) && maLkDong !== maLKXml1) {
            ds.push({
                phan_he: 'XML2',
                index: idx,
                truong_loi: 'MA_LK',
                canh_bao: `Dòng thuốc MA_LK [${maLkDong}] không khớp XML1 [${maLKXml1}].`,
                muc_do: 'Error',
                ma_luat: 'CLN-XDC-03',
                ten_quy_tac: 'Liên kết MA_LK thuốc',
                dieu_kien: 'BUILT-IN',
            });
        }
        const ngYL = e.NGAY_TH_YL || e.NGAY_YL || '';
        if (!IS_EMPTY(xml1.NGAY_VAO) && !IS_EMPTY(xml1.NGAY_RA) && !IS_EMPTY(ngYL)) {
            const tYl = normalizeTime12(ngYL);
            const tVao = normalizeTime12(xml1.NGAY_VAO);
            const tRa = normalizeTime12(xml1.NGAY_RA);
            if (tYl < tVao || tYl > tRa) {
                ds.push({
                    phan_he: 'XML2',
                    index: idx,
                    truong_loi: 'NGAY_YL',
                    canh_bao: `Ngày/giờ y lệnh thuốc [${ngYL}] ngoài khoảng [${xml1.NGAY_VAO}] – [${xml1.NGAY_RA}].`,
                    muc_do: 'Warning',
                    ma_luat: 'CLN-XDC-04',
                    ten_quy_tac: 'Mốc thời gian đơn thuốc trong đợt KCB',
                    dieu_kien: 'BUILT-IN',
                });
            }
        }
    });

    return ds;
};

/** TT 06/2026/BYT — cờ trên danh mục ICD-10 (bệnh chính, mã cụ thể hơn, tử vong, giới tính). */
const giamDinhIcd10TheoTT06 = (hoSo) => {
    const ds = [];
    const bang = BANG_ICD10_TT06;
    if (!bang || typeof bang !== 'object' || Object.keys(bang).length === 0) return ds;

    const xml1 = _getXML1(hoSo);
    const maGt = String(xml1.MA_GIOI_TINH || xml1.GIOI_TINH || '').trim();
    const laNam = maGt === '1';
    const laNu = maGt === '2';
    const phienBan = String(PHIEN_BAN_ICD10_TT06 || '').trim();
    const ghiPhu = phienBan ? ` (${phienBan})` : '';

    const them = (payload) => {
        ds.push({
            phan_he: 'XML1',
            index: -1,
            truong_loi: payload.truong_loi || 'MA_BENH_CHINH',
            canh_bao: payload.canh_bao,
            muc_do: payload.muc_do,
            ma_luat: payload.ma_luat,
            ten_quy_tac: payload.ten_quy_tac,
            dieu_kien: 'BUILT-IN',
        });
    };

    const layDong = (tokenChuan) => {
        const key = khoaBangIcd10TT06(tokenChuan);
        if (!key) return null;
        return bang[key] || null;
    };

    const maChinhList = extractIcdCodesFromClaim(xml1.MA_BENH_CHINH);
    maChinhList.forEach((code) => {
        const row = layDong(code);
        if (!row) return;
        const hien = String(code || '').trim() || code;
        if (row.camBenhChinh) {
            them({
                truong_loi: 'MA_BENH_CHINH',
                canh_bao: `Mã ICD-10 [${hien}] không được dùng làm bệnh chính theo Phụ lục TT 06/2026/BYT${ghiPhu}.`,
                muc_do: 'Error',
                ma_luat: 'ICD-TT06-CAM-CHINH',
                ten_quy_tac: 'ICD-10 — không làm bệnh chính (TT 06)',
            });
        }
        if (row.khongKhuyenKhichBenhChinh) {
            them({
                truong_loi: 'MA_BENH_CHINH',
                canh_bao: `Mã ICD-10 [${hien}] không khuyến khích dùng làm bệnh chính (TT 06/2026/BYT)${ghiPhu}.`,
                muc_do: 'Warning',
                ma_luat: 'ICD-TT06-KK-CHINH',
                ten_quy_tac: 'ICD-10 — không khuyến khích bệnh chính (TT 06)',
            });
        }
        if (row.coMaBonHoacNamKyTuCuTheHon) {
            them({
                truong_loi: 'MA_BENH_CHINH',
                canh_bao: `Mã ICD-10 [${hien}] không dùng khi đã có mã 4–5 ký tự cụ thể hơn (TT 06/2026/BYT)${ghiPhu}.`,
                muc_do: 'Warning',
                ma_luat: 'ICD-TT06-CU-THE-HON',
                ten_quy_tac: 'ICD-10 — ưu tiên mã chi tiết (TT 06)',
            });
        }
        if (row.chiMaHoaNguyenNhanTuVong) {
            them({
                truong_loi: 'MA_BENH_CHINH',
                canh_bao: `Mã ICD-10 [${hien}] chỉ dùng để mã hóa nguyên nhân tử vong / underlying cause (TT 06/2026/BYT)${ghiPhu}.`,
                muc_do: 'Warning',
                ma_luat: 'ICD-TT06-TU-VONG',
                ten_quy_tac: 'ICD-10 — nguyên nhân tử vong (TT 06)',
            });
        }
        if (laNam && row.chuYeuNuGioi) {
            them({
                truong_loi: 'MA_BENH_CHINH',
                canh_bao: `Mã ICD-10 [${hien}] chỉ có hoặc chủ yếu ở nữ giới — không phù hợp giới tính Nam (TT 06/2026/BYT)${ghiPhu}.`,
                muc_do: 'Warning',
                ma_luat: 'ICD-TT06-GIOI-NU',
                ten_quy_tac: 'ICD-10 — mã chủ yếu nữ (TT 06)',
            });
        }
        if (laNu && row.chuYeuNamGioi) {
            them({
                truong_loi: 'MA_BENH_CHINH',
                canh_bao: `Mã ICD-10 [${hien}] chỉ có hoặc chủ yếu ở nam giới — không phù hợp giới tính Nữ (TT 06/2026/BYT)${ghiPhu}.`,
                muc_do: 'Warning',
                ma_luat: 'ICD-TT06-GIOI-NAM',
                ten_quy_tac: 'ICD-10 — mã chủ yếu nam (TT 06)',
            });
        }
    });

    const maKtList = extractIcdCodesFromClaim(xml1.MA_BENH_KT);
    maKtList.forEach((code) => {
        const row = layDong(code);
        if (!row) return;
        const hien = String(code || '').trim() || code;
        if (laNam && row.chuYeuNuGioi) {
            them({
                truong_loi: 'MA_BENH_KT',
                canh_bao: `Mã ICD-10 kèm [${hien}] chỉ có hoặc chủ yếu ở nữ giới — không phù hợp giới tính Nam (TT 06/2026/BYT)${ghiPhu}.`,
                muc_do: 'Warning',
                ma_luat: 'ICD-TT06-GIOI-NU-KT',
                ten_quy_tac: 'ICD-10 kèm — mã chủ yếu nữ (TT 06)',
            });
        }
        if (laNu && row.chuYeuNamGioi) {
            them({
                truong_loi: 'MA_BENH_KT',
                canh_bao: `Mã ICD-10 kèm [${hien}] chỉ có hoặc chủ yếu ở nam giới — không phù hợp giới tính Nữ (TT 06/2026/BYT)${ghiPhu}.`,
                muc_do: 'Warning',
                ma_luat: 'ICD-TT06-GIOI-NAM-KT',
                ten_quy_tac: 'ICD-10 kèm — mã chủ yếu nam (TT 06)',
            });
        }
    });

    return ds;
};

// ============================================================
// [PHẦN 8] LAYER 5: ĐỘNG CƠ KIỂM TRA ĐỘNG (NLP SQL PARSER - V14)
// ============================================================
const TAP_BANG_XML_HOP_LE = new Set(Array.from({ length: 15 }, (_, index) => `XML${index + 1}`));
const DANH_SACH_TAB_IDS_MAC_DINH_RULE_DONG = Object.freeze([
    'LUAT_DU_LIEU', 'LUAT_HANH_CHINH', 'LUAT_CHUYEN_TUYEN', 'LUAT_HOP_DONG',
    'LUAT_CONG_KHAM', 'LUAT_CDHA', 'LUAT_MAU', 'LUAT_THUOC', 'LUAT_GIUONG', 'LUAT_NHAN_SU', 'LUAT_PTTT'
]);
const SYS_KEYWORDS_RULE_DONG = Object.freeze([
    'IS_EMPTY', 'STARTS_WITH', 'SUBSTR', 'TO_NUMBER', 'DIFF_DAYS', 'DIFF_HOURS', 'DIFF_MINUTES', 'DIFF_MONTHS', 'DIFF_YEARS', 'YEAR', 'LEN', 'COUNT_IF', 'COUNT', 'ALL', 'EXISTS', 'COUNT_DISTINCT', 'SUM_IF',
    'KY_VONG_SO_NGAY_DTRI_VBHN17',
    'KY_HIEU_SO_THU_BA_THE_BHYT',
    'KY_HIEU_SO_THU_BA_THE_CHO_TYLE_TT',
    'TY_LE_KCB_BHYT_THEO_SO3',
    'TY_LE_KCB_BHYT_SAU_NGOAI_LE',
    'THE_SO3_KHONG_KHOP_HAI_KY_TU_DAU',
    'VI_PHAM_KHAI_BAO_THE_SO3_LECH_PREFIX',
    'VI_PHAM_TYLE_T_BHTT_TONGCHI_BH',
    'VI_PHAM_TS_TYLE_BHTT_DUOI_95',
    'NGOAI_TRU_HC39_HC40_TRE_SO_SINH',
    'HC_65_CO_MOC_DV_NGOAI_KHOANG_VAO_RA',
    'THUOC_95_VI_PHAM_CHI_DINH',
    'THUOC_311_VI_PHAM_CHI_DINH',
    'THUOC_41_VI_PHAM_CHI_DINH',
    'THUOC_267_VI_PHAM_CHI_DINH',
    'THUOC_451_VI_PHAM_TRAN_BH_TREN_DON_VI',
    'ENGINE_RULE_THUOC_540',
    'THUOC_533_VI_PHAM_WAMLOX',
    'THUOC_398_VI_PHAM_DOMPERIDON',
    'CHUYEN_DE_166_VI_PHAM_TT22_PROXY',
    'XML1', 'XML2', 'XML3', 'XML4', 'XML5', 'XML6', 'XML7', 'XML8', 'XML9', 'XML10', 'XML11', 'XML12', 'XML13', 'XML14', 'XML15',
    'DS_XML1', 'DS_XML2', 'DS_XML3', 'DS_XML4', 'DS_XML5', 'DS_XML6', 'DS_XML7', 'DS_XML8', 'DS_XML9', 'DS_XML10', 'DS_XML11', 'DS_XML12', 'DS_XML13', 'DS_XML14', 'DS_XML15', 'CURRENT', 'NOW', 'TODAY', 'CURRENT_TIMESTAMP',
    'NOT_CONTAINS', 'CONTAINS', 'IN', 'LIKE', 'NULL', 'OR', 'AND', 'Math', 'String', 'includes', 'match', 'true', 'false', 'item', 'RegExp', 'new',
    'MATCH_MA_LOAI_KCB', 'MATCH_ANY_MA_LOAI_KCB',
    'CO_PHAC_DO_CDSS_CHO_ICD', 'CO_KHO_TRI_THUC_PHAC_DO',
    'CO_PHAC_DO_CDSS_CHO_BAT_CU_ICD_TREN_XML1', 'KHONG_CO_PHAC_DO_CDSS_CHO_MA_ICD_GOP_TREN_XML1',
    'CO_ICD_KHOP_MAPPING_THUOC', 'CO_CO_DONG_MAPPING_ICD_THUOC', 'CO_THUOC_TRONG_DM_BV',
    'CO_CO_DONG_MAPPING_ICD_CD_THUOC', 'CO_ICD_VI_PHAM_CHONG_CHI_DINH_THUOC',
]);

const MAX_RULE_DONG_EXPRESSION_LENGTH = 4000;
const RULE_DONG_DANG_BIEU_THUC_KHONG_AN_TOAN = [
    /\b(?:eval|Function|globalThis|window|document|process|require|import|constructor|__proto__|prototype)\b/i,
    /`/,
    /\$\{/
];
const RULE_DONG_DANG_BIEU_THUC_KHONG_HO_TRO = [
    /\bFOR_EACH\s*\(/i,
    /\b(?:COUNT_VISIT|COUNT_REVISIT|COUNT_VISIT_IN_DAY|DUPLICATE)\s*\(/i,
    /\bWITHIN\s+SAME\b/i,
    /\bOVERLAP\b/i,
    /\{[A-Z0-9_]+\}/i,
    /\bXML\d+\[[^\]]+\]/i,
    /\[[0-9]+\.\.[0-9]+\]/,
    /\bSAME_DATE\b/i,
    /\b(?:LAST_VISIT|LAST_XQ|LAST_SA_THAI|XML3_PTTT|XML3_GIUONG)\b/i,
    /\bBETWEEN\b/i,
    /\bEXISTS\s*\([^)]*\bAS\b/i,
    /\b(?:SUM|COUNT|COUNT_DISTINCT)\s*\([^)]*\bWHERE\b/i,
];

const laBieuThucRuleDongAnToan = (jsQuery = '') => {
    const expression = String(jsQuery || '').trim();
    if (!expression) return false;
    if (expression.length > MAX_RULE_DONG_EXPRESSION_LENGTH) return false;
    return !RULE_DONG_DANG_BIEU_THUC_KHONG_AN_TOAN.some((pattern) => pattern.test(expression));
};

const laBieuThucRuleDongDuocHoTro = (conditionStr = '') => {
    const expression = String(conditionStr || '').trim();
    if (!expression) return false;
    return !RULE_DONG_DANG_BIEU_THUC_KHONG_HO_TRO.some((pattern) => pattern.test(expression));
};

const themGiaTriVaoMapDanhSach = (map, key, value) => {
    if (!key) return;
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(value);
};

const taoTapDanhMucTuMang = (danhSach = []) => new Set((Array.isArray(danhSach) ? danhSach : []).map((item) => UPPER(item)).filter(Boolean));

const tachDanhSachMaBenh = (giaTri) => String(giaTri || '')
    .split(/[;,+|\s]+/)
    .map((item) => UPPER(item))
    .filter(Boolean);

const coMaBenhThuocDanhMuc = (giaTri, tapDanhMuc) => {
    if (!(tapDanhMuc instanceof Set) || tapDanhMuc.size === 0) return false;
    return tachDanhSachMaBenh(giaTri).some((maBenh) => tapDanhMuc.has(maBenh));
};

const laMaDvThuocDanhMuc = (giaTri, tapDanhMuc) => {
    if (!(tapDanhMuc instanceof Set) || tapDanhMuc.size === 0) return false;
    return tapDanhMuc.has(UPPER(giaTri));
};

const layMaBacSiLienHoSo = (row = {}, xml1 = {}) => UPPER(
    row?.NGUOI_THUC_HIEN
    || row?.MA_BAC_SI
    || row?.MA_BS
    || xml1?.MA_BAC_SI
    || ''
);

const layMocThoiGianLienHoSo = (row = {}, xml1 = {}) => {
    const moc = row?.NGAY_YL || row?.NGAY_KQ || row?.NGAY_TH_YL || xml1?.NGAY_VAO || '';
    return normalizeDateKey(moc, '0').slice(0, 12);
};

/**
 * NS_10: không áp dụng “BS phân thân” cho dịch vụ nhóm xét nghiệm / nhân viên chuyên môn CLS xét nghiệm.
 * QĐ 130 — MA_NHOM 2: nhóm chi phí xét nghiệm; kèm heuristic tên dịch vụ khi MA_NHOM sai/thiếu.
 */
const laDongXml3LoaiTruNS10ChuyenMonXetNghiem = (row = {}) => {
    const nhomRaw = String(row?.MA_NHOM ?? '').replace(/\s/g, '');
    const nhom = nhomRaw.replace(/^0+/, '') || nhomRaw;
    if (nhom === '2') return true;
    const ten = String(row?.TEN_DICH_VU || row?.TEN_DVKT || '');
    if (!ten) return false;
    if (/xét\s*nghiệm/i.test(ten)) return true;
    const tenU = UPPER(ten);
    return tenU.includes('XÉT NGHIỆM') || tenU.includes('XET NGHIEM');
};

/** Chuẩn hoá mốc datetime XML3 (số) về 12 ký tự đầu — đồng bộ với logic PTTT. */
const chuanHoaMocDatetime12Xml3 = (v) => String(v || '').replace(/\D/g, '').padEnd(12, '0').slice(0, 12);

/** Có đủ độ phân giải phút (YYYYMMDDHHmm) trên NGAY_TH_YL / NGAY_YL để so “cùng thời điểm”. */
const coMocThucHienPhutXml3 = (row) => String(row?.NGAY_TH_YL || row?.NGAY_YL || '').replace(/\D/g, '').length >= 12;

/**
 * Mã hành nghề để đối chiếu: QĐ 3176 — NGUOI_THUC_HIEN (người thực hiện DVKT);
 * nếu trống (thường gặp ở công khám) dùng MA_BAC_SI / MA_BS hoặc XML1 MA_BS_KHAM.
 */
const layMaHanhNgheThucHienXml3 = (row, xml1) => {
    const nguoi = String(row?.NGUOI_THUC_HIEN || '').trim();
    if (nguoi) return UPPER(nguoi);
    return UPPER(String(row?.MA_BAC_SI || row?.MA_BS || xml1?.MA_BS_KHAM || xml1?.MA_BAC_SI || '').trim());
};

const layMocPhutThucHienXml3 = (row) => {
    const raw = String(row?.NGAY_TH_YL || row?.NGAY_YL || '').replace(/\D/g, '');
    return raw.length >= 12 ? raw.slice(0, 12) : '';
};

/** Công khám Khám Tai Mũi Họng (TT12) — đối chiếu CLN-DVKT-03 với nhóm nội soi TMH. */
const MA_DVKT_CONG_KHAM_TMH_1528 = '15.28';
const TAP_MA_DVKT_NOI_SOI_TMH = new Set([
    '03.1003.2048',
    '03.1002.2048',
    '03.1001.2048',
    '20.0013.2048',
]);

const laMaDvCongKhamTmh1528 = (maDv) => UPPER(String(maDv || '').replace(/\s/g, '')) === MA_DVKT_CONG_KHAM_TMH_1528;
const laMaDvNoiSoiTmh = (maDv) => TAP_MA_DVKT_NOI_SOI_TMH.has(UPPER(String(maDv || '').replace(/\s/g, '')));

/**
 * CLN-DVKT-03: công khám 15.28 (Khám Tai Mũi Họng) không được ghi nhận cùng mốc phút thực hiện (NGAY_TH_YL, fallback NGAY_YL ≥12 số)
 * với nội soi họng/mũi/tai hoặc nội soi TMH — cảnh báo trên dòng nội soi.
 *
 * CLN-DVKT-01: cùng mã hành nghề thực hiện, cùng phút NGAY_TH_YL/NGAY_YL (≥12 số), vừa công khám (DM_KHAM) vừa DVKT khác.
 * CLN-DVKT-02: DVKT không thuộc DM_KHAM có cả NGAY_KQ và NGAY_TH_YL trùng nhau (sau chuẩn hoá 12 ký tự).
 */
const giamDinhNguoiThucHienKhamVaDvktXml3 = (hoSo, danhMuc) => {
    const ds = [];
    const xml1 = _getXML1(hoSo);
    const rawXml3 = hoSo.XML3 || hoSo.xml3 || [];
    if (!Array.isArray(rawXml3) || rawXml3.length < 2) return ds;
    const dmKham = taoTapDanhMucTuMang(danhMuc?.DM_KHAM);
    if (!(dmKham instanceof Set) || dmKham.size === 0) return ds;

    const prepared = rawXml3.map((row) => prepareData(row));
    const seenCapKhamDv = new Set();
    const seenKqTrungTh = new Set();

    for (let i = 0; i < prepared.length; i += 1) {
        if (laBHYTKhôngThanhToan(rawXml3[i])) continue;
        const r = prepared[i];
        const maI = UPPER(r.MA_DV || r.MA_DICH_VU || '');
        if (!maI) continue;
        const laKhamI = laMaDvThuocDanhMuc(r.MA_DV || r.MA_DICH_VU, dmKham);

        if (!laKhamI) {
            const nkq = String(r.NGAY_KQ || '').trim();
            const nth = String(r.NGAY_TH_YL || '').trim();
            if (
                nkq
                && nth
                && chuanHoaMocDatetime12Xml3(nkq) === chuanHoaMocDatetime12Xml3(nth)
                && !seenKqTrungTh.has(i)
            ) {
                seenKqTrungTh.add(i);
                ds.push({
                    phan_he: 'XML3',
                    index: i,
                    truong_loi: 'NGAY_KQ',
                    canh_bao: `DVKT [${maI}] (ngoài danh mục công khám DM_KHAM): NGAY_KQ trùng NGAY_TH_YL [${nkq}] — cần phản ánh khác biệt thời điểm có kết quả và thời điểm thực hiện khi đủ dữ liệu (QĐ 3176/XML3).`,
                    muc_do: 'Warning',
                    ma_luat: 'CLN-DVKT-02',
                    ten_quy_tac: 'NGAY_KQ trùng NGAY_TH_YL (DVKT)',
                    dieu_kien: 'BUILT-IN',
                    co_so_phap_ly: CO_SO_PHAP_LY_DVKT.DANH_MUC_NOI_BO,
                });
            }
        }

        if (!coMocThucHienPhutXml3(r)) continue;
        const perfI = layMaHanhNgheThucHienXml3(r, xml1);
        const timeI = layMocPhutThucHienXml3(r);
        if (!perfI || !timeI) continue;

        for (let j = i + 1; j < prepared.length; j += 1) {
            if (laBHYTKhôngThanhToan(rawXml3[j])) continue;
            const r2 = prepared[j];
            const maJ = UPPER(r2.MA_DV || r2.MA_DICH_VU || '');
            if (!maJ) continue;
            if (!coMocThucHienPhutXml3(r2)) continue;
            const perfJ = layMaHanhNgheThucHienXml3(r2, xml1);
            const timeJ = layMocPhutThucHienXml3(r2);
            if (!perfJ || perfJ !== perfI || timeJ !== timeI) continue;
            const laKhamJ = laMaDvThuocDanhMuc(r2.MA_DV || r2.MA_DICH_VU, dmKham);
            if (laKhamI === laKhamJ) continue;
            if (!laKhamI && !laKhamJ) continue;
            const cap = `${i}|${j}`;
            if (seenCapKhamDv.has(cap)) continue;
            seenCapKhamDv.add(cap);
            const idxKham = laKhamI ? i : j;
            const idxDv = laKhamI ? j : i;
            const maKham = UPPER(prepared[idxKham].MA_DV || prepared[idxKham].MA_DICH_VU || '');
            const maDvkt = UPPER(prepared[idxDv].MA_DV || prepared[idxDv].MA_DICH_VU || '');
            ds.push({
                phan_he: 'XML3',
                index: idxDv,
                truong_loi: 'NGUOI_THUC_HIEN',
                canh_bao: `Cùng mã hành nghề thực hiện [${perfI}], cùng phút thực hiện (${timeI}): vừa công khám [${maKham}] (STT ${idxKham + 1}) vừa DVKT khác [${maDvkt}] (STT ${idxDv + 1}). Một người không thể đồng thời khám và thực hiện DVKT khác tại cùng mốc phút — kiểm tra NGUOI_THUC_HIEN / MA_BAC_SI và NGAY_TH_YL trên XML3.`,
                muc_do: 'Warning',
                ma_luat: 'CLN-DVKT-01',
                ten_quy_tac: 'Trùng thời điểm công khám và DVKT (NGUOI_THUC_HIEN)',
                dieu_kien: 'BUILT-IN',
                co_so_phap_ly: CO_SO_PHAP_LY_DVKT.DANH_MUC_NOI_BO,
            });
        }
    }
    return ds;
};

/**
 * CLN-DVKT-03 — TMH: trùng mốc phút thực hiện giữa 15.28 và một trong các mã nội soi TMH (cùng XML3 / lượt khám).
 */
const giamDinhCongKhamTmhVaNoiSoiTrungMocXml3 = (hoSo) => {
    const ds = [];
    const rawXml3 = hoSo.XML3 || hoSo.xml3 || [];
    if (!Array.isArray(rawXml3) || rawXml3.length < 2) return ds;

    const prepared = rawXml3.map((row) => prepareData(row));
    const seenCap = new Set();

    for (let i = 0; i < prepared.length; i += 1) {
        if (laBHYTKhôngThanhToan(rawXml3[i])) continue;
        const r = prepared[i];
        const maI = UPPER(String(r.MA_DV || r.MA_DICH_VU || '').trim());
        if (!maI) continue;
        if (!laMaDvCongKhamTmh1528(maI) && !laMaDvNoiSoiTmh(maI)) continue;
        if (!coMocThucHienPhutXml3(r)) continue;
        const timeI = layMocPhutThucHienXml3(r);
        if (!timeI) continue;

        const laKhamTmhI = laMaDvCongKhamTmh1528(maI);
        const laNoiSoiI = laMaDvNoiSoiTmh(maI);

        for (let j = i + 1; j < prepared.length; j += 1) {
            if (laBHYTKhôngThanhToan(rawXml3[j])) continue;
            const r2 = prepared[j];
            const maJ = UPPER(String(r2.MA_DV || r2.MA_DICH_VU || '').trim());
            if (!maJ) continue;
            if (!laMaDvCongKhamTmh1528(maJ) && !laMaDvNoiSoiTmh(maJ)) continue;
            if (!coMocThucHienPhutXml3(r2)) continue;
            const timeJ = layMocPhutThucHienXml3(r2);
            if (timeJ !== timeI) continue;

            const laKhamTmhJ = laMaDvCongKhamTmh1528(maJ);
            const laNoiSoiJ = laMaDvNoiSoiTmh(maJ);

            let idxKham = -1;
            let idxNoiSoi = -1;
            if (laKhamTmhI && laNoiSoiJ) {
                idxKham = i;
                idxNoiSoi = j;
            } else if (laNoiSoiI && laKhamTmhJ) {
                idxNoiSoi = i;
                idxKham = j;
            } else {
                continue;
            }

            const cap = `${idxKham}|${idxNoiSoi}`;
            if (seenCap.has(cap)) continue;
            seenCap.add(cap);

            const rowNs = prepared[idxNoiSoi];
            const maNs = UPPER(rowNs.MA_DV || rowNs.MA_DICH_VU || '');
            const tenNs = String(rowNs.TEN_DICH_VU || rowNs.TEN_DVKT || '').trim();
            const goiTen = tenNs ? `${maNs} (${tenNs})` : maNs;

            ds.push({
                phan_he: 'XML3',
                index: idxNoiSoi,
                truong_loi: 'NGAY_TH_YL',
                canh_bao: `Nội soi TMH [${goiTen}] trùng mốc phút thực hiện y lệnh (${timeI}, NGAY_TH_YL/NGAY_YL) với công khám Khám Tai Mũi Họng [${MA_DVKT_CONG_KHAM_TMH_1528}] (STT ${idxKham + 1}) — nguyên tắc không thanh toán đồng thời trong cùng lượt khám.`,
                muc_do: 'Warning',
                ma_luat: 'CLN-DVKT-03',
                ten_quy_tac: 'Công khám TMH (15.28) trùng mốc với nội soi',
                dieu_kien: 'BUILT-IN',
                co_so_phap_ly: CO_SO_PHAP_LY_DVKT.DANH_MUC_NOI_BO,
            });
        }
    }
    return ds;
};

const taoBatchContextGiamDinh = (danhSachHoSo = []) => {
    const danhSachDauVao = Array.isArray(danhSachHoSo) ? danhSachHoSo.filter(Boolean) : [];
    const entryByHoSo = new WeakMap();
    const claimsByPatient = new Map();
    const xml3ByDoctorTime = new Map();
    const xml3ByDoctorDay = new Map();

    const entries = danhSachDauVao.map((hoSo, batchIndex) => {
        const xml1Raw = layDanhSachXml(hoSo, 'XML1') || {};
        const xml1 = prepareData(xml1Raw);
        const xml3Raw = layDanhSachXml(hoSo, 'XML3');
        const xml3Prepared = xml3Raw.map((row) => safeProxy(prepareData(row)));
        const maLK = UPPER(xml1?.MA_LK || hoSo?.ma_lk || `BATCH_${batchIndex}`);
        const maBN = UPPER(xml1?.MA_BN || '');
        const maCSKCB = UPPER(xml1?.MA_CSKCB || '');
        const ngayVao = normalizeDateKey(xml1?.NGAY_VAO || '', '0');
        const dayKey = ngayVao.slice(0, 8);
        const monthKey = ngayVao.slice(0, 6);
        const yearKey = ngayVao.slice(0, 4);
        const entry = {
            batchIndex,
            batchKey: `${maLK || 'NO_MA_LK'}|${batchIndex}`,
            hoSo,
            xml1Raw,
            xml1,
            xml3Raw,
            xml3Prepared,
            maLK,
            maBN,
            maCSKCB,
            ngayVao,
            dayKey,
            monthKey,
            yearKey,
        };

        entryByHoSo.set(hoSo, entry);
        if (maBN) themGiaTriVaoMapDanhSach(claimsByPatient, maBN, entry);

        xml3Prepared.forEach((row, rowIndex) => {
            const doctorKey = layMaBacSiLienHoSo(row, xml1);
            const timeKey = layMocThoiGianLienHoSo(row, xml1);
            const rowDayKey = timeKey.slice(0, 8) || dayKey;
            if (!doctorKey || !timeKey) return;
            const payload = { entry, row, rowIndex };
            themGiaTriVaoMapDanhSach(xml3ByDoctorTime, `${doctorKey}|${timeKey}`, payload);
            if (rowDayKey) themGiaTriVaoMapDanhSach(xml3ByDoctorDay, `${doctorKey}|${rowDayKey}`, payload);
        });

        return entry;
    });

    claimsByPatient.forEach((items) => {
        items.sort((a, b) => compareDateKey(a.ngayVao, b.ngayVao) || (a.batchIndex - b.batchIndex));
    });

    return {
        entries,
        entryByHoSo,
        claimsByPatient,
        xml3ByDoctorTime,
        xml3ByDoctorDay,
    };
};

const layEntryBatchHienTai = (batchContext, hoSo) => {
    if (!batchContext?.entryByHoSo || !hoSo || typeof hoSo !== 'object') return null;
    return batchContext.entryByHoSo.get(hoSo) || null;
};

const layLanKhamTruocCungBenhNhan = (batchContext, currentEntry) => {
    if (!batchContext || !currentEntry?.maBN) return null;
    const danhSach = batchContext.claimsByPatient.get(currentEntry.maBN) || [];
    const index = danhSach.findIndex((item) => item.batchKey === currentEntry.batchKey);
    if (index <= 0) return null;
    return danhSach[index - 1] || null;
};

const taoCanhBaoViPhamRuleDong = (ruleMeta, override = {}) => ({
    phan_he: override.phan_he || ruleMeta._targetTable,
    index: typeof override.index === 'number' ? override.index : -1,
    truong_loi: override.truong_loi || ruleMeta._targetField,
    canh_bao: override.canh_bao || ruleMeta._canhBao,
    muc_do: override.muc_do || ruleMeta._mucDo,
    ma_luat: ruleMeta._maLuat,
    ten_quy_tac: ruleMeta._tenQuyTac,
    dieu_kien: ruleMeta._conditionStr,
    co_so_phap_ly: ruleMeta._coSoPhapLy,
});

const taoBoXuLyRuleDongDacBiet = (rule, conditionStr = '') => {
    const maLuat = UPPER(layGiaTriAnToan(rule, 'maluat'));
    if (!maLuat) return null;

    if (maLuat === 'HC_249') {
        return (ruleMeta, contextRuleDong, danhMucHeThong) => {
            const xml1 = contextRuleDong?.baseCtx?.XML1 || {};
            const rows = danhMucHeThong?.DM_ICD10_CAP_CUU_ROWS;
            if (!viPhamQuy_tacCapCuuIcd10(xml1, rows)) return [];
            return [
                taoCanhBaoViPhamRuleDong(ruleMeta, {
                    phan_he: 'XML1',
                    index: -1,
                    truong_loi: 'CHAN_DOAN_VAO',
                }),
            ];
        };
    }

    if (maLuat === 'XML_19') {
        return (ruleMeta, contextRuleDong) => {
            const xml1 = contextRuleDong?.baseCtx?.XML1 || {};
            const dsXml5 = contextRuleDong?.baseCtx?.DS_XML5 || [];
            if (!MATCH_MA_LOAI_KCB(xml1?.MA_LOAI_KCB, '3')) return [];
            if (COUNT(dsXml5) > 0) return [];
            return [taoCanhBaoViPhamRuleDong(ruleMeta, { phan_he: 'XML1', index: -1, truong_loi: 'MA_LOAI_KCB' })];
        };
    }

    if (maLuat === 'XML_105') {
        return (ruleMeta, contextRuleDong) => {
            const xml1 = contextRuleDong?.baseCtx?.XML1 || {};
            const dsXml7 = contextRuleDong?.baseCtx?.DS_XML7 || [];
            const ketQuaDtri = String(xml1?.KET_QUA_DTRI || xml1?.MA_LOAI_RV || '').trim();
            if (!MATCH_MA_LOAI_KCB(xml1?.MA_LOAI_KCB, '3')) return [];
            if (['4', '5'].includes(ketQuaDtri)) return [];
            if (COUNT(dsXml7) > 0) return [];
            return [taoCanhBaoViPhamRuleDong(ruleMeta, { phan_he: 'XML1', index: -1, truong_loi: 'MA_LOAI_KCB' })];
        };
    }

    if (maLuat === 'CK_13') {
        return (ruleMeta, contextRuleDong, danhMucHeThong) => {
            const currentEntry = contextRuleDong?.currentEntry;
            const batchContext = contextRuleDong?.batchContext;
            if (!currentEntry?.maBN || laCapCuuTheoXml1(currentEntry?.xml1)) return [];
            const sameDayVisits = (batchContext?.claimsByPatient?.get(currentEntry.maBN) || []).filter((entry) => entry.dayKey && entry.dayKey === currentEntry.dayKey);
            if (sameDayVisits.length <= 1) return [];
            const dmKham = taoTapDanhMucTuMang(danhMucHeThong?.DM_KHAM);
            const violations = [];
            currentEntry.xml3Prepared.forEach((row, rowIndex) => {
                if (!laMaDvThuocDanhMuc(row?.MA_DV, dmKham)) return;
                if (TO_NUMBER(row?.STT) < 2) return;
                if (TO_NUMBER(row?.THANH_TIEN) <= (TO_NUMBER(row?.DON_GIA) * 0.3)) return;
                violations.push(taoCanhBaoViPhamRuleDong(ruleMeta, { phan_he: 'XML3', index: rowIndex, truong_loi: 'THANH_TIEN' }));
            });
            return violations;
        };
    }

    if (maLuat === 'CK_23') {
        return (ruleMeta, contextRuleDong, danhMucHeThong) => {
            const currentEntry = contextRuleDong?.currentEntry;
            const batchContext = contextRuleDong?.batchContext;
            if (!currentEntry?.maBN || !currentEntry?.yearKey) return [];
            const dmKham = taoTapDanhMucTuMang(danhMucHeThong?.DM_KHAM);
            const tongTien = (batchContext?.claimsByPatient?.get(currentEntry.maBN) || []).reduce((sum, entry) => {
                return sum + entry.xml3Prepared.reduce((rowSum, row) => {
                    const yearKey = layMocThoiGianLienHoSo(row, entry.xml1).slice(0, 4) || entry.yearKey;
                    if (!laMaDvThuocDanhMuc(row?.MA_DV, dmKham) || yearKey !== currentEntry.yearKey) return rowSum;
                    return rowSum + TO_NUMBER(row?.THANH_TIEN);
                }, 0);
            }, 0);
            if (tongTien <= 2000000) return [];
            const firstIndex = currentEntry.xml3Prepared.findIndex((row) => laMaDvThuocDanhMuc(row?.MA_DV, dmKham));
            return [taoCanhBaoViPhamRuleDong(ruleMeta, { phan_he: 'XML3', index: firstIndex, truong_loi: 'THANH_TIEN' })];
        };
    }

    if (maLuat === 'CK_26') {
        return (ruleMeta, contextRuleDong, danhMucHeThong) => {
            const currentEntry = contextRuleDong?.currentEntry;
            const batchContext = contextRuleDong?.batchContext;
            if (!currentEntry?.maBN || !currentEntry?.yearKey) return [];
            const dmBenhManTinh = taoTapDanhMucTuMang(danhMucHeThong?.DM_BENH_MAN_TINH);
            if (!coMaBenhThuocDanhMuc(currentEntry?.xml1?.MA_BENH, dmBenhManTinh)) return [];
            const totalVisits = (batchContext?.claimsByPatient?.get(currentEntry.maBN) || []).filter((entry) => {
                return entry.yearKey === currentEntry.yearKey && coMaBenhThuocDanhMuc(entry?.xml1?.MA_BENH, dmBenhManTinh);
            }).length;
            if (totalVisits <= 12) return [];
            return [taoCanhBaoViPhamRuleDong(ruleMeta, { phan_he: 'XML1', index: -1, truong_loi: 'MA_BENH' })];
        };
    }

    if (maLuat === 'CK_27') {
        return (ruleMeta, contextRuleDong, danhMucHeThong) => {
            const currentEntry = contextRuleDong?.currentEntry;
            const batchContext = contextRuleDong?.batchContext;
            if (!currentEntry?.maBN) return [];
            const dmBenhManTinh = taoTapDanhMucTuMang(danhMucHeThong?.DM_BENH_MAN_TINH);
            if (!coMaBenhThuocDanhMuc(currentEntry?.xml1?.MA_BENH, dmBenhManTinh)) return [];
            const lastVisit = layLanKhamTruocCungBenhNhan(batchContext, currentEntry);
            if (!lastVisit?.xml1?.NGAY_VAO) return [];
            const daysDiff = DIFF_DAYS(SUBSTR(lastVisit.xml1.NGAY_VAO, 1, 8), SUBSTR(currentEntry.xml1.NGAY_VAO, 1, 8));
            if (daysDiff >= 15) return [];
            return [taoCanhBaoViPhamRuleDong(ruleMeta, { phan_he: 'XML1', index: -1, truong_loi: 'NGAY_VAO' })];
        };
    }

    if (maLuat === 'CK_40') {
        return (ruleMeta, contextRuleDong, danhMucHeThong) => {
            const currentEntry = contextRuleDong?.currentEntry;
            const batchContext = contextRuleDong?.batchContext;
            if (!currentEntry?.maBN || !laCapCuuTheoXml1(currentEntry?.xml1)) return [];
            const sameDayVisits = (batchContext?.claimsByPatient?.get(currentEntry.maBN) || []).filter((entry) => entry.dayKey && entry.dayKey === currentEntry.dayKey);
            if (sameDayVisits.length <= 1) return [];
            const dmKham = taoTapDanhMucTuMang(danhMucHeThong?.DM_KHAM);
            const violations = [];
            currentEntry.xml3Prepared.forEach((row, rowIndex) => {
                if (!laMaDvThuocDanhMuc(row?.MA_DV, dmKham)) return;
                if (TO_NUMBER(row?.THANH_TIEN) >= TO_NUMBER(row?.DON_GIA)) return;
                violations.push(taoCanhBaoViPhamRuleDong(ruleMeta, { phan_he: 'XML3', index: rowIndex, truong_loi: 'THANH_TIEN' }));
            });
            return violations;
        };
    }

    if (maLuat === 'CK_51') {
        return (ruleMeta, contextRuleDong, danhMucHeThong) => {
            const currentEntry = contextRuleDong?.currentEntry;
            const batchContext = contextRuleDong?.batchContext;
            if (!currentEntry?.dayKey) return [];
            const dmKham = taoTapDanhMucTuMang(danhMucHeThong?.DM_KHAM);
            const violations = [];
            currentEntry.xml3Prepared.forEach((row, rowIndex) => {
                if (!laMaDvThuocDanhMuc(row?.MA_DV, dmKham)) return;
                const doctorKey = layMaBacSiLienHoSo(row, currentEntry.xml1);
                const rowDayKey = layMocThoiGianLienHoSo(row, currentEntry.xml1).slice(0, 8) || currentEntry.dayKey;
                if (!doctorKey || !rowDayKey) return;
                const distinctFacilities = new Set(
                    (batchContext?.xml3ByDoctorDay?.get(`${doctorKey}|${rowDayKey}`) || [])
                        .filter((item) => laMaDvThuocDanhMuc(item?.row?.MA_DV, dmKham))
                        .map((item) => item?.entry?.maCSKCB)
                        .filter(Boolean)
                );
                if (distinctFacilities.size > 2) {
                    violations.push(taoCanhBaoViPhamRuleDong(ruleMeta, { phan_he: 'XML3', index: rowIndex, truong_loi: 'MA_BAC_SI' }));
                }
            });
            return violations;
        };
    }

    if (maLuat === 'CK_52') {
        return (ruleMeta, contextRuleDong, danhMucHeThong) => {
            const currentEntry = contextRuleDong?.currentEntry;
            const batchContext = contextRuleDong?.batchContext;
            if (!currentEntry) return [];
            const dmKham = taoTapDanhMucTuMang(danhMucHeThong?.DM_KHAM);
            const violations = [];
            currentEntry.xml3Prepared.forEach((row, rowIndex) => {
                if (!laMaDvThuocDanhMuc(row?.MA_DV, dmKham)) return;
                const doctorKey = layMaBacSiLienHoSo(row, currentEntry.xml1);
                const timeKey = layMocThoiGianLienHoSo(row, currentEntry.xml1);
                if (!doctorKey || !timeKey) return;
                const relatedRows = (batchContext?.xml3ByDoctorTime?.get(`${doctorKey}|${timeKey}`) || []).filter((item) => {
                    if (!laMaDvThuocDanhMuc(item?.row?.MA_DV, dmKham)) return false;
                    return item.entry.batchKey !== currentEntry.batchKey || item.rowIndex !== rowIndex;
                });
                if (relatedRows.length > 0) {
                    violations.push(taoCanhBaoViPhamRuleDong(ruleMeta, { phan_he: 'XML3', index: rowIndex, truong_loi: 'NGAY_YL' }));
                }
            });
            return violations;
        };
    }

    if (maLuat === 'NS_01') {
        return (ruleMeta, contextRuleDong) => {
            const currentEntry = contextRuleDong?.currentEntry;
            const batchContext = contextRuleDong?.batchContext;
            if (!currentEntry?.maLK || !currentEntry?.maCSKCB || !currentEntry?.monthKey) return [];
            const duplicates = (batchContext?.entries || []).filter((entry) => {
                return entry.maLK === currentEntry.maLK && entry.maCSKCB === currentEntry.maCSKCB && entry.monthKey === currentEntry.monthKey;
            });
            if (duplicates.length <= 1) return [];
            return [taoCanhBaoViPhamRuleDong(ruleMeta, { phan_he: 'XML1', index: -1, truong_loi: 'MA_LK' })];
        };
    }

    if (maLuat === 'NS_10') {
        return (ruleMeta, contextRuleDong) => {
            const currentEntry = contextRuleDong?.currentEntry;
            const batchContext = contextRuleDong?.batchContext;
            if (!currentEntry) return [];
            const violations = [];
            currentEntry.xml3Prepared.forEach((row, rowIndex) => {
                if (laDongXml3LoaiTruNS10ChuyenMonXetNghiem(row)) return;
                const doctorKey = layMaBacSiLienHoSo(row, currentEntry.xml1);
                const timeKey = layMocThoiGianLienHoSo(row, currentEntry.xml1);
                if (!doctorKey || !timeKey) return;
                const relatedRows = (batchContext?.xml3ByDoctorTime?.get(`${doctorKey}|${timeKey}`) || []).filter((item) => {
                    return item.entry.batchKey !== currentEntry.batchKey
                        && item.entry.maLK
                        && currentEntry.maLK
                        && item.entry.maLK !== currentEntry.maLK;
                });
                if (relatedRows.length > 0) {
                    violations.push(taoCanhBaoViPhamRuleDong(ruleMeta, { phan_he: 'XML3', index: rowIndex, truong_loi: 'NGUOI_THUC_HIEN' }));
                }
            });
            return violations;
        };
    }

    if (maLuat === 'THUOC_419') {
        return (ruleMeta, contextRuleDong, danhMucHeThong) => {
            const xml1 = contextRuleDong?.baseCtx?.XML1 || {};
            const rows = contextRuleDong?.rowsByTable?.XML2 || [];
            const preparedRows = contextRuleDong?.preparedRowsByTable?.XML2 || [];
            const mapThuoc = danhMucHeThong?.MAP_THUOC_BV;
            if (!(mapThuoc instanceof Map)) return [];
            const hangCskcb = TO_NUMBER(String(xml1?.CSKCB_HANG_BV ?? xml1?.HANG_BV_CSKCB ?? '').trim());
            const violations = [];
            rows.forEach((row, index) => {
                if (!row || laBHYTKhôngThanhToan(row)) return;
                const cur = preparedRows[index] || enrichXML2Data(row);
                const maT = UPPER(String(cur?.MA_THUOC || '').trim());
                if (!maT) return;
                const dmRow = mapThuoc.get(maT);
                if (!dmRow) return;
                const minHang = TO_NUMBER(String(dmRow?.HANG_BV_MIN ?? '').trim());
                if (minHang <= 0 || hangCskcb <= 0) return;
                if (minHang < hangCskcb) {
                    violations.push(taoCanhBaoViPhamRuleDong(ruleMeta, { phan_he: 'XML2', index, truong_loi: 'MA_THUOC' }));
                }
            });
            return violations;
        };
    }

    /**
     * THUOC_139: Domperidon — nôn/buồn nôn (R11) và bệnh lý dạ dày–tá tràng (K21, K25–K31…), không chỉ R11+K30.
     */
    if (maLuat === 'THUOC_139') {
        return (ruleMeta, contextRuleDong) => {
            const xml1 = contextRuleDong?.baseCtx?.XML1 || {};
            const rows = contextRuleDong?.rowsByTable?.XML2 || [];
            const preparedRows = contextRuleDong?.preparedRowsByTable?.XML2 || [];
            const violations = [];
            rows.forEach((row, index) => {
                if (!row || laBHYTKhôngThanhToan(row)) return;
                const cur = preparedRows[index] || enrichXML2Data(row);
                if (String(cur?.MA_THUOC || '').trim() !== '40.688') return;
                if (coChiDinhHopLeDomperidon139(xml1)) return;
                violations.push(taoCanhBaoViPhamRuleDong(ruleMeta, { phan_he: 'XML2', index, truong_loi: 'MA_THUOC' }));
            });
            return violations;
        };
    }

    /**
     * THUOC_321: Men tụy (40.740) — chỉ định HC mở rộng (suy tụy, viêm tụy mạn, xơ nang, sau mổ, ỉa mỡ…), không chỉ K86.1+K90.
     */
    if (maLuat === 'THUOC_321') {
        return (ruleMeta, contextRuleDong) => {
            const xml1 = contextRuleDong?.baseCtx?.XML1 || {};
            const rows = contextRuleDong?.rowsByTable?.XML2 || [];
            const preparedRows = contextRuleDong?.preparedRowsByTable?.XML2 || [];
            const violations = [];
            rows.forEach((row, index) => {
                if (!row || laBHYTKhôngThanhToan(row)) return;
                const cur = preparedRows[index] || enrichXML2Data(row);
                if (String(cur?.MA_THUOC || '').trim() !== '40.740') return;
                if (coChiDinhHopLeMenTuyPancreatin321(xml1)) return;
                violations.push(taoCanhBaoViPhamRuleDong(ruleMeta, { phan_he: 'XML2', index, truong_loi: 'MA_THUOC' }));
            });
            return violations;
        };
    }

    /**
     * THUOC_324: Racecadotril — tiêu chảy cấp, trên 3 tháng; trẻ em dưới 18 tuổi cần dấu hiệu bù nước đường uống (ORS) trên đơn/chẩn đoán.
     */
    if (maLuat === 'THUOC_324') {
        return (ruleMeta, contextRuleDong) => {
            const xml1 = contextRuleDong?.baseCtx?.XML1 || {};
            const rows = contextRuleDong?.rowsByTable?.XML2 || [];
            const preparedRows = contextRuleDong?.preparedRowsByTable?.XML2 || [];
            const violations = [];
            rows.forEach((row, index) => {
                if (!row || laBHYTKhôngThanhToan(row)) return;
                const cur = preparedRows[index] || enrichXML2Data(row);
                if (String(cur?.MA_THUOC || '').trim() !== '40.732') return;
                if (coChiDinhHopLeRacecadotril324(xml1, contextRuleDong)) return;
                violations.push(taoCanhBaoViPhamRuleDong(ruleMeta, { phan_he: 'XML2', index, truong_loi: 'MA_THUOC' }));
            });
            return violations;
        };
    }

    /**
     * THUOC_374: Magnesi B6 (40.1055) — thiếu magnesi đơn độc hoặc kết hợp; không chỉ E83.4+R25.2 hẹp.
     */
    if (maLuat === 'THUOC_374') {
        return (ruleMeta, contextRuleDong) => {
            const xml1 = contextRuleDong?.baseCtx?.XML1 || {};
            const rows = contextRuleDong?.rowsByTable?.XML2 || [];
            const preparedRows = contextRuleDong?.preparedRowsByTable?.XML2 || [];
            const violations = [];
            rows.forEach((row, index) => {
                if (!row || laBHYTKhôngThanhToan(row)) return;
                const cur = preparedRows[index] || enrichXML2Data(row);
                if (String(cur?.MA_THUOC || '').trim() !== '40.1055') return;
                if (coChiDinhHopLeMagnesiB6374(xml1)) return;
                violations.push(taoCanhBaoViPhamRuleDong(ruleMeta, { phan_he: 'XML2', index, truong_loi: 'MA_THUOC' }));
            });
            return violations;
        };
    }

    /**
     * THUOC_540: Hydrochlorothiazide (mã/tên/hoạt chất HCT, HCTZ) — chống chỉ định khi ICD chính/kèm thuộc nhóm gút, tăng acid uric,
     * vô niệu, Addison, tăng calci máu, suy gan/thận nặng.
     */
    if (maLuat === 'THUOC_540') {
        return (ruleMeta, contextRuleDong, danhMucHeThong) => {
            const xml1 = contextRuleDong?.baseCtx?.XML1 || {};
            const rows = contextRuleDong?.rowsByTable?.XML2 || [];
            const preparedRows = contextRuleDong?.preparedRowsByTable?.XML2 || [];
            const mapThuoc = danhMucHeThong?.MAP_THUOC_BV;
            const violations = [];
            rows.forEach((row, index) => {
                if (!row || laBHYTKhôngThanhToan(row)) return;
                const cur = preparedRows[index] || enrichXML2Data(row);
                const blob = ghepVanBanNhanDangHctTuXml2(cur, mapThuoc);
                if (!laVanBanCoHydrochlorothiazide(blob)) return;
                if (!coHoSoCoIcdChongChiDinhHydrochlorothiazide(xml1)) return;
                violations.push(taoCanhBaoViPhamRuleDong(ruleMeta, { phan_he: 'XML2', index, truong_loi: 'MA_THUOC' }));
            });
            return violations;
        };
    }

    /**
     * THUOC_233: L-ornithin L-aspartat (40.747) — gan K70–K77; tăng ammoniac / não gan / tiền hôn mê (chữ + G93.4, R79.8…).
     */
    if (maLuat === 'THUOC_233') {
        return (ruleMeta, contextRuleDong) => {
            const xml1 = contextRuleDong?.baseCtx?.XML1 || {};
            const rows = contextRuleDong?.rowsByTable?.XML2 || [];
            const preparedRows = contextRuleDong?.preparedRowsByTable?.XML2 || [];
            const violations = [];
            rows.forEach((row, index) => {
                if (!row || laBHYTKhôngThanhToan(row)) return;
                const cur = preparedRows[index] || enrichXML2Data(row);
                if (String(cur?.MA_THUOC || '').trim() !== '40.747') return;
                if (coChiDinhHopLeLOrnithinAspartat233(xml1)) return;
                violations.push(taoCanhBaoViPhamRuleDong(ruleMeta, { phan_he: 'XML2', index, truong_loi: 'MA_THUOC' }));
            });
            return violations;
        };
    }

    /**
     * THUOC_365: Ursodeoxycholic acid (40.756) — sỏi mật tan; béo phì/giảm cân; PBC/ứ mật; CF 6–18; đường mật (không trùng K83.0 cấp với THUOC_364).
     */
    if (maLuat === 'THUOC_365') {
        return (ruleMeta, contextRuleDong) => {
            const xml1 = contextRuleDong?.baseCtx?.XML1 || {};
            const rows = contextRuleDong?.rowsByTable?.XML2 || [];
            const preparedRows = contextRuleDong?.preparedRowsByTable?.XML2 || [];
            const violations = [];
            rows.forEach((row, index) => {
                if (!row || laBHYTKhôngThanhToan(row)) return;
                const cur = preparedRows[index] || enrichXML2Data(row);
                if (String(cur?.MA_THUOC || '').trim() !== '40.756') return;
                if (coChiDinhHopLeUrsodeoxycholic365(xml1)) return;
                violations.push(taoCanhBaoViPhamRuleDong(ruleMeta, { phan_he: 'XML2', index, truong_loi: 'MA_THUOC' }));
            });
            return violations;
        };
    }

    /**
     * THUOC_63: Bacillus subtilis (40.718) — tiêu chảy, viêm ruột cấp/mạn, rối loạn tiêu hóa, đi ngoài bất thường.
     */
    if (maLuat === 'THUOC_63') {
        return (ruleMeta, contextRuleDong) => {
            const xml1 = contextRuleDong?.baseCtx?.XML1 || {};
            const rows = contextRuleDong?.rowsByTable?.XML2 || [];
            const preparedRows = contextRuleDong?.preparedRowsByTable?.XML2 || [];
            const violations = [];
            rows.forEach((row, index) => {
                if (!row || laBHYTKhôngThanhToan(row)) return;
                const cur = preparedRows[index] || enrichXML2Data(row);
                if (String(cur?.MA_THUOC || '').trim() !== '40.718') return;
                if (coChiDinhHopLeBacillusSubtilis63(xml1)) return;
                violations.push(taoCanhBaoViPhamRuleDong(ruleMeta, { phan_he: 'XML2', index, truong_loi: 'MA_THUOC' }));
            });
            return violations;
        };
    }

    /**
     * THUOC_338: Seretide Accuhaler / Salmeterol+Fluticasone (40.982) — SmPC: hen (ĐDK có hồi phục) từ 4 tuổi;
     * COPD duy trì tắc nghẽn ĐDK, giảm kịch phát (bối cảnh giảm tử vong theo tài liệu đăng ký).
     */
    if (maLuat === 'THUOC_338') {
        return (ruleMeta, contextRuleDong) => {
            const xml1 = contextRuleDong?.baseCtx?.XML1 || {};
            const rows = contextRuleDong?.rowsByTable?.XML2 || [];
            const preparedRows = contextRuleDong?.preparedRowsByTable?.XML2 || [];
            const violations = [];
            rows.forEach((row, index) => {
                if (!row || laBHYTKhôngThanhToan(row)) return;
                const cur = preparedRows[index] || enrichXML2Data(row);
                if (String(cur?.MA_THUOC || '').trim() !== '40.982') return;
                if (coChiDinhHopLeIcsLabaJ45J44(xml1)) return;
                violations.push(taoCanhBaoViPhamRuleDong(ruleMeta, { phan_he: 'XML2', index, truong_loi: 'MA_THUOC' }));
            });
            return violations;
        };
    }

    /**
     * THUOC_76: Symbicort (40.762) — cùng khung chỉ định hen/COPD với Seretide (J45/J44, hen từ 4 tuổi).
     */
    if (maLuat === 'THUOC_76') {
        return (ruleMeta, contextRuleDong) => {
            const xml1 = contextRuleDong?.baseCtx?.XML1 || {};
            const rows = contextRuleDong?.rowsByTable?.XML2 || [];
            const preparedRows = contextRuleDong?.preparedRowsByTable?.XML2 || [];
            const violations = [];
            rows.forEach((row, index) => {
                if (!row || laBHYTKhôngThanhToan(row)) return;
                const cur = preparedRows[index] || enrichXML2Data(row);
                if (String(cur?.MA_THUOC || '').trim() !== '40.762') return;
                if (coChiDinhHopLeIcsLabaJ45J44(xml1)) return;
                violations.push(taoCanhBaoViPhamRuleDong(ruleMeta, { phan_he: 'XML2', index, truong_loi: 'MA_THUOC' }));
            });
            return violations;
        };
    }

    /**
     * THUOC_345: Simethicon — chỉ định theo HC (đầy hơi/thừa hơi, khó tiêu, GERD, phá bọt nội soi/XQ…),
     * không chỉ thu hẹp R14 như trước.
     */
    if (maLuat === 'THUOC_345') {
        return (ruleMeta, contextRuleDong) => {
            const xml1 = contextRuleDong?.baseCtx?.XML1 || {};
            const rows = contextRuleDong?.rowsByTable?.XML2 || [];
            const preparedRows = contextRuleDong?.preparedRowsByTable?.XML2 || [];
            const violations = [];
            rows.forEach((row, index) => {
                if (!row || laBHYTKhôngThanhToan(row)) return;
                const cur = preparedRows[index] || enrichXML2Data(row);
                if (String(cur?.MA_THUOC || '').trim() !== '40.750') return;
                if (coChiDinhHopLeSimethiconTheoHc(xml1, contextRuleDong)) return;
                violations.push(taoCanhBaoViPhamRuleDong(ruleMeta, { phan_he: 'XML2', index, truong_loi: 'MA_THUOC' }));
            });
            return violations;
        };
    }

    /** VBHN 15: GPB/tế bào học chỉ bắt buộc khi thanh toán thuốc LOAI=UNG_THU (DM nội bộ), không áp cho thuốc thường cùng hồ sơ ung thư. */
    if (maLuat === 'THUOC_530') {
        return (ruleMeta, contextRuleDong, danhMucHeThong) => {
            const xml1 = contextRuleDong?.baseCtx?.XML1 || {};
            const maBenhChinh = UPPER(String(xml1?.MA_BENH_CHINH || '').trim());
            if (!STARTS_WITH(maBenhChinh, 'C')) return [];

            const dsXml3 = contextRuleDong?.rowsByTable?.XML3 || [];
            const coGpb = dsXml3.some((r) => {
                const maDv = UPPER(String(r?.MA_DICH_VU ?? r?.MA_DV ?? '').trim());
                return maDv === 'GIAI_PHAU_BENH';
            });
            if (coGpb) return [];

            const mapThuoc = danhMucHeThong?.MAP_THUOC_BV;
            if (!(mapThuoc instanceof Map) || mapThuoc.size === 0) return [];

            const rows = contextRuleDong?.rowsByTable?.XML2 || [];
            const preparedRows = contextRuleDong?.preparedRowsByTable?.XML2 || [];
            const violations = [];
            rows.forEach((row, index) => {
                if (!row || laBHYTKhôngThanhToan(row)) return;
                const cur = preparedRows[index] || enrichXML2Data(row);
                const maT = UPPER(String(cur?.MA_THUOC || '').trim());
                if (!maT) return;
                const dmRow = mapThuoc.get(maT);
                if (!dmRow) return;
                const loaiDm = UPPER(String(dmRow?.LOAI ?? '').trim());
                if (loaiDm !== 'UNG_THU') return;
                violations.push(taoCanhBaoViPhamRuleDong(ruleMeta, { phan_he: 'XML2', index, truong_loi: 'MA_THUOC' }));
            });
            return violations;
        };
    }

    return null;
};

const taiDanhSachTabLuatDong = async () => {
    if (Array.isArray(cache_DanhSachTabLuatDong) && cache_DanhSachTabLuatDong.length > 0) return cache_DanhSachTabLuatDong;
    await donDepDuLieuLegacyLuatHardcoded();
    await Promise.all([
        damBaoSeedLuatDuLieuMuc1(),
        damBaoSeedLuatHanhChinhMuc2(),
        damBaoSeedLuatPtttMuc11(),
        damBaoSeedLuatThuocMuc8(),
    ]);
    const tatCaStorageKeys = await AsyncStorage.getAllKeys().catch(() => []);
    const tabIdsDong = (Array.isArray(tatCaStorageKeys) ? tatCaStorageKeys : [])
        .filter((key) => key.startsWith('CDSS_DATA_') && !key.includes('_CHUNK_') && !key.endsWith('_CHUNKS'))
        .map((key) => key.substring('CDSS_DATA_'.length))
        .filter((tabId) => tabId);
    cache_DanhSachTabLuatDong = Array.from(new Set([...DANH_SACH_TAB_IDS_MAC_DINH_RULE_DONG, ...tabIdsDong]));
    return cache_DanhSachTabLuatDong;
};

const taiRuleDongTheoTabId = async (tabId) => {
    const normalizedTabId = String(tabId || '').trim().toUpperCase();
    const tronNguonRuleKhongTrung = (...sources) => {
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
    const taiTheoDanhSachTabUngVien = async (dsTabId) => {
        for (const id of dsTabId) {
            const rows = normalizeRuleList(await fetchChunkedData(`CDSS_DATA_${id}`));
            if (rows.length > 0) return rows.map(chuanHoaRuleDong);
        }
        return [];
    };

    if (normalizedTabId === 'LUAT_DU_LIEU' || normalizedTabId === 'XML_DATA') {
        const rowsQuanTri = await taiTheoDanhSachTabUngVien(['LUAT_DU_LIEU', 'XML_DATA']);
        if (rowsQuanTri.length > 0) return rowsQuanTri;
        return layDanhSachLuatDuLieuHardcoded().map(chuanHoaRuleDong);
    }
    if (normalizedTabId === 'LUAT_HANH_CHINH' || normalizedTabId === 'XML1') {
        const rowsQuanTri = await taiTheoDanhSachTabUngVien(['LUAT_HANH_CHINH', 'XML1']);
        if (rowsQuanTri.length > 0) return rowsQuanTri;
        return layDanhSachLuatHanhChinhHardcoded().map(chuanHoaRuleDong);
    }
    // LUAT_THUOC: luôn lấy quy tắc cốt lõi từ mã nguồn (bundle). AsyncStorage/localStorage chỉ bổ sung
    // các dòng có MA_LUAT không có trong bản ship (quy tắc tùy biến BV). Tránh phụ thuộc cache cục bộ
    // cho THUOC_* — xóa cache không làm mất bản cập nhật luật đã đóng gói trong app.
    if (normalizedTabId === 'LUAT_THUOC' || normalizedTabId === 'XML2') {
        const rowsQuanTri = await taiTheoDanhSachTabUngVien(['LUAT_THUOC', 'XML2']);
        const bundled = layDanhSachLuatThuocHardcoded()
            .map((row) => chuanHoaRuleDong(row))
            .filter(Boolean);
        const maTrongBundle = new Set(
            bundled.map((r) => String(r?.MA_LUAT || r?.ma_luat || r?._maLuat || '').trim().toUpperCase()).filter(Boolean),
        );
        const chiTuyChinh = rowsQuanTri
            .map((row) => chuanHoaRuleDong(row))
            .filter((r) => {
                if (!r) return false;
                const ma = String(r?.MA_LUAT || r?.ma_luat || r?._maLuat || '').trim().toUpperCase();
                return Boolean(ma) && !maTrongBundle.has(ma);
            });
        return tronNguonRuleKhongTrung(bundled, chiTuyChinh);
    }
    if (normalizedTabId === 'LUAT_CDHA' || normalizedTabId === 'XML3') {
        const rowsQuanTri = await taiTheoDanhSachTabUngVien(['LUAT_CDHA', 'XML3', 'LUAT_GIAM_DINH_CHUYEN_DE', 'GIAM_DINH_CHUYEN_DE']);
        if (rowsQuanTri.length > 0) return rowsQuanTri;
        return tronNguonRuleKhongTrung(
            layDanhSachLuatCdhaHardcoded(),
            layDanhSachLuatGiamDinhChuyenDeHardcoded(),
        ).map(chuanHoaRuleDong);
    }
    if (normalizedTabId === 'LUAT_GIAM_DINH_CHUYEN_DE' || normalizedTabId === 'GIAM_DINH_CHUYEN_DE') {
        const rowsQuanTri = await taiTheoDanhSachTabUngVien(['LUAT_GIAM_DINH_CHUYEN_DE', 'GIAM_DINH_CHUYEN_DE', 'LUAT_CDHA', 'XML3']);
        if (rowsQuanTri.length > 0) return rowsQuanTri;
        return tronNguonRuleKhongTrung(
            layDanhSachLuatCdhaHardcoded(),
            layDanhSachLuatGiamDinhChuyenDeHardcoded(),
        ).map(chuanHoaRuleDong);
    }
    if (normalizedTabId === 'LUAT_CONG_KHAM' || normalizedTabId === 'KHAM_BENH') {
        const rowsQuanTri = await taiTheoDanhSachTabUngVien(['LUAT_CONG_KHAM', 'KHAM_BENH']);
        if (rowsQuanTri.length > 0) return rowsQuanTri;
        return layDanhSachLuatCongKhamHardcoded().map(chuanHoaRuleDong);
    }
    if (normalizedTabId === 'LUAT_NHAN_SU' || normalizedTabId === 'HAU_PHAU') {
        const rowsQuanTri = await taiTheoDanhSachTabUngVien(['LUAT_NHAN_SU', 'HAU_PHAU']);
        if (rowsQuanTri.length > 0) return rowsQuanTri;
        return layDanhSachLuatNhanSuHardcoded().map(chuanHoaRuleDong);
    }
    if (normalizedTabId === 'LUAT_GIUONG' || normalizedTabId === 'NOI_TRU') {
        const rowsQuanTri = await taiTheoDanhSachTabUngVien(['LUAT_GIUONG', 'NOI_TRU']);
        if (rowsQuanTri.length > 0) return rowsQuanTri;
        return layDanhSachLuatGiuongHardcoded().map(chuanHoaRuleDong);
    }
    if (normalizedTabId === 'LUAT_HOP_DONG' || normalizedTabId === 'XUAT_VIEN') {
        const rowsQuanTri = await taiTheoDanhSachTabUngVien(['LUAT_HOP_DONG', 'XUAT_VIEN']);
        if (rowsQuanTri.length > 0) return rowsQuanTri;
        return layDanhSachLuatHopDongHardcoded().map(chuanHoaRuleDong);
    }
    if (normalizedTabId === 'LUAT_PTTT' || normalizedTabId === 'PTTT') {
        const rowsQuanTri = await taiTheoDanhSachTabUngVien(['LUAT_PTTT', 'PTTT']);
        const nguon = rowsQuanTri.length > 0
            ? rowsQuanTri
            : normalizeRuleList(await fetchChunkedData(`CDSS_DATA_${normalizedTabId}`));
        return hopNhatQuyTacTrungTheoDoiTuong(nguon, () => 'LUAT_PTTT').map(chuanHoaRuleDong);
    }
    const rawFallback = normalizeRuleList(await fetchChunkedData(`CDSS_DATA_${tabId}`));
    return hopNhatQuyTacTrungTheoDoiTuong(rawFallback, () => normalizedTabId).map(chuanHoaRuleDong);
};

const inferTargetTableFromCondition = (conditionStr) => {
    const matches = Array.from(String(conditionStr || '').matchAll(/\bXML(1[0-5]|[1-9])\s*\./gi)).map((match) => `XML${match[1]}`);
    if (matches.length === 0) return 'XML1';
    const uuTienBangChiTiet = matches.find((table) => table !== 'XML1');
    return uuTienBangChiTiet || matches[0] || 'XML1';
};

const normalizeTargetTable = (rawTargetTable, conditionStr) => {
    const hasXmlRefInCondition = /\bXML(?:1[0-5]|[1-9])\s*\./i.test(String(conditionStr || ''));
    if (hasXmlRefInCondition) return inferTargetTableFromCondition(conditionStr);

    const raw = String(rawTargetTable || '').trim().toUpperCase();
    const normalized = raw
        .replace(/\s+/g, '')
        .replace(/-/g, '_')
        .replace(/^DS_XML/, 'XML');

    const MAP_PHAN_HE = {
        LUAT_DU_LIEU: '',
        XML_DATA: '',
        LUAT_HANH_CHINH: 'XML1',
        LUAT_CHUYEN_TUYEN: 'XML1',
        LUAT_HOP_DONG: 'XML1',
        LUAT_CONG_KHAM: 'XML3',
        LUAT_CDHA: 'XML3',
        LUAT_MAU: 'XML5',
        LUAT_THUOC: 'XML2',
        LUAT_GIUONG: 'XML3',
        LUAT_NHAN_SU: 'XML3',
        LUAT_PTTT: 'XML3',
        KHAM_BENH: 'XML1',
        NHAP_VIEN: 'XML1',
        NOI_TRU: 'XML3',
        PTTT: 'XML3',
        GAY_ME: 'XML5',
        HAU_PHAU: 'XML5',
        XUAT_VIEN: 'XML1',
        TAI_LIEU: 'XML4',
    };

    const mapped = MAP_PHAN_HE[normalized] ?? normalized;
    if (!mapped || mapped === 'N/A') return inferTargetTableFromCondition(conditionStr);
    if (!TAP_BANG_XML_HOP_LE.has(mapped)) return inferTargetTableFromCondition(conditionStr);
    return mapped;
};

const normalizeSeverity = (rawSeverity) => {
    const s = String(rawSeverity || '').trim().toLowerCase();
    if (!s) return 'Warning';
    if (s.includes('critical') || s.includes('nghiem')) return 'Critical';
    if (s.includes('error') || s.includes('loi')) return 'Error';
    if (s.includes('info') || s.includes('thong')) return 'Info';
    return 'Warning';
};

const laTrangThaiLuatBat = (rawTrangThai) => {
    const s = String(rawTrangThai || '').trim().toLowerCase();
    return s === 'on' || s === '1' || s === 'true' || s === 'active' || s === 'hoạt động' || s === 'hoat dong' || s === 'bật' || s === 'bat';
};

const chuanHoaDieuKienMaLoaiKcbTheoQd824 = (conditionStr = '') => {
    let normalized = String(conditionStr || '');
    normalized = normalized.replace(/([A-Za-z0-9_.]+\.MA_LOAI_KCB)\s+NOT\s+IN\s*\(([^)]*?)\)/gi, ' !MATCH_ANY_MA_LOAI_KCB($1, $2) ');
    normalized = normalized.replace(/([A-Za-z0-9_.]+\.MA_LOAI_KCB)\s+IN\s*\(([^)]*?)\)/gi, ' MATCH_ANY_MA_LOAI_KCB($1, $2) ');
    normalized = normalized.replace(/([A-Za-z0-9_.]+\.MA_LOAI_KCB)\s*(?:<>|!=)\s*(['"][^'"]+['"]|\d+)/gi, ' !MATCH_MA_LOAI_KCB($1, $2) ');
    normalized = normalized.replace(/([A-Za-z0-9_.]+\.MA_LOAI_KCB)\s*(?:==|=)\s*(['"][^'"]+['"]|\d+)/gi, ' MATCH_MA_LOAI_KCB($1, $2) ');
    return normalized;
};

const bienDichDieuKienLuatDong = (conditionStr = '') => {
    const khoaCache = String(conditionStr || '').trim();
    if (!khoaCache) return '';
    const cached = cache_BienDichDieuKienLuat.get(khoaCache);
    if (cached) return cached;
    let jsQuery = conditionStr;
    jsQuery = jsQuery.replace(/[\u200B-\u200D\uFEFF]/g,' ').replace(/\r?\n|\r/g,' ');
    jsQuery = jsQuery.replace(/[\u2018\u2019\u00b4\u0060]/g,"'").replace(/[\u201c\u201d\u2033\u00ab]/g,'"');
    jsQuery = jsQuery.replace(/\s+/g,' ').trim().replace(/\(\?i\)/gi,'');
    jsQuery = jsQuery.replace(/=>/g, '__RULE_ARROW__');
    jsQuery = jsQuery.replace(/COUNT_IF\s*\(\s*([A-Za-z0-9_]+)\s+WHERE\s+/gi,'COUNT_IF($1, ');
    jsQuery = jsQuery.replace(/\bVÀ\b/gi,' AND ').replace(/\bVA\b/gi,' AND ')
        .replace(/\bHOẶC\b/gi,' OR ').replace(/\bHOAC\b/gi,' OR ')
        .replace(/\bKHÔNG\b/gi,' NOT ').replace(/\bKHONG\b/gi,' NOT ');
    jsQuery = jsQuery.replace(/\blớn hơn hoặc bằng\b/gi, '>=').replace(/\blon hon hoac bang\b/gi, '>=')
        .replace(/\bnhỏ hơn hoặc bằng\b/gi, '<=').replace(/\bnho hon hoac bang\b/gi, '<=')
        .replace(/\blớn hơn\b/gi, '>').replace(/\blon hon\b/gi, '>')
        .replace(/\bnhỏ hơn\b/gi, '<').replace(/\bnho hon\b/gi, '<');
    jsQuery = jsQuery.replace(/\bkhông chứa\b/gi,'NOT_CONTAINS').replace(/\bchứa\b/gi,'CONTAINS');
    jsQuery = jsQuery.replace(/\btrùng với\b/gi,'==').replace(/\btrùng\b/gi,'==').replace(/\bbằng\b/gi,'==');
    jsQuery = jsQuery.replace(/\bkhác\b/gi,'!=').replace(/\bkhông tồn tại\b/gi,'IS_EMPTY').replace(/\btồn tại\b/gi,'NOT_EMPTY');
    jsQuery = chuanHoaDieuKienMaLoaiKcbTheoQd824(jsQuery);
    jsQuery = jsQuery.replace(/==/g,'##TEQ##').replace(/!=/g,'##TNEQ##').replace(/>=/g,'##TGTE##').replace(/<=/g,'##TLTE##');
    jsQuery = jsQuery.replace(/=/g,'==');
    jsQuery = jsQuery.replace(/##TEQ##/g,'==').replace(/##TNEQ##/g,'!=').replace(/##TGTE##/g,'>=').replace(/##TLTE##/g,'<=');
    jsQuery = jsQuery.replace(/__RULE_ARROW__/g, '=>');
    jsQuery = jsQuery.replace(/([a-zA-Z0-9_.]+)\s+NOT\s+IN\s*\((.*?)\)/gi,'![$2].includes(String($1))');
    jsQuery = jsQuery.replace(/([a-zA-Z0-9_.]+)\s+IN\s*\((.*?)\)/gi,'[$2].includes(String($1))');
    jsQuery = jsQuery.replace(/([a-zA-Z0-9_.]+)\s+(?:NOT REGEXP|NOT MATCH|NOT_MATCH)\s+['"/](.*?)['"/][a-z]*/gi,'!String($1).match(new RegExp("$2","i"))');
    jsQuery = jsQuery.replace(/([a-zA-Z0-9_.]+)\s+(?:REGEXP|MATCH)\s+['"/](.*?)['"/][a-z]*/gi,'String($1).match(new RegExp("$2","i"))');
    jsQuery = jsQuery.replace(/([a-zA-Z0-9_.]+)\s+(?:NOT CONTAINS|NOT_CONTAINS)\s+(['"].*?['"]|[a-zA-Z0-9_.]+)/gi,'!String($1).includes($2)');
    jsQuery = jsQuery.replace(/([a-zA-Z0-9_.]+)\s+CONTAINS\s+(['"].*?['"]|[a-zA-Z0-9_.]+)/gi,'String($1).includes($2)');
    jsQuery = jsQuery.replace(/([a-zA-Z0-9_.]+)\s+NOT\s+LIKE\s+['"]%?(.*?)%?['"]/gi,'!String($1).includes("$2")');
    jsQuery = jsQuery.replace(/([a-zA-Z0-9_.]+)\s+LIKE\s+['"]%?(.*?)%?['"]/gi,'String($1).includes("$2")');
    jsQuery = jsQuery.replace(/([a-zA-Z0-9_.]+)\s+STARTS_WITH\s+(['"].*?['"]|[a-zA-Z0-9_.]+)/gi,'STARTS_WITH($1,$2)');
    jsQuery = jsQuery.replace(/([a-zA-Z0-9_.]+)\s+IS\s+NOT\s+(NULL|EMPTY)/gi,'!IS_EMPTY($1)');
    jsQuery = jsQuery.replace(/([a-zA-Z0-9_.]+)\s+IS\s+(NULL|EMPTY)/gi,'IS_EMPTY($1)');
    jsQuery = jsQuery.replace(/([a-zA-Z0-9_.]+)\s+!=\s+(NULL|EMPTY|''|"")/gi,'!IS_EMPTY($1)');
    jsQuery = jsQuery.replace(/([a-zA-Z0-9_.]+)\s+==\s+(NULL|EMPTY|''|"")/gi,'IS_EMPTY($1)');
    jsQuery = jsQuery.replace(/([a-zA-Z0-9_.]+)\s+NOT_EMPTY\b/gi,'!IS_EMPTY($1)');
    jsQuery = jsQuery.replace(/([a-zA-Z0-9_.]+)\s+IS_EMPTY\b/gi,'IS_EMPTY($1)');
    jsQuery = jsQuery.replace(/\bOR\b/gi,' || ').replace(/\bAND\b/gi,' && ');
    jsQuery = jsQuery.replace(/DATEDIFF_DAY/gi,'DIFF_DAYS').replace(/DATEDIFF_HOUR/gi,'DIFF_HOURS').replace(/DATEDIFF_MINUTE/gi,'DIFF_MINUTES').replace(/DATEDIFF_MONTH/gi,'DIFF_MONTHS').replace(/DATEDIFF_YEAR/gi,'DIFF_YEARS')
        .replace(/\bCEIL\(/g,'Math.ceil(').replace(/\bFLOOR\(/g,'Math.floor(')
        .replace(/\bABS\(/g,'Math.abs(').replace(/\bROUND\(/g,'Math.round(');
    jsQuery = jsQuery.replace(/\bNOT\b/gi,'!');

    let startIdx = 0;
    while ((startIdx = jsQuery.indexOf('COUNT_IF(', startIdx)) !== -1) {
        let openCount = 0, commaIdx = -1, endIdx = -1;
        for (let i = startIdx + 8; i < jsQuery.length; i++) {
            if (jsQuery[i] === '(') openCount++;
            else if (jsQuery[i] === ')') { openCount--; if (openCount === 0) { endIdx = i; break; } }
            else if (jsQuery[i] === ',' && openCount === 1 && commaIdx === -1) commaIdx = i;
        }
        if (endIdx !== -1 && commaIdx !== -1) {
            let tbl = jsQuery.substring(startIdx + 9, commaIdx).trim();
            let cond = jsQuery.substring(commaIdx + 1, endIdx).trim();
            let tblName = tbl.toUpperCase();
            if (!tblName.startsWith('DS_')) tblName = 'DS_' + tblName;
            const arrowMatch = cond.match(/^\s*([A-Za-z_$][\w$]*)\s*=>\s*(.*)$/s);
            let replacement = '';
            if (arrowMatch) {
                const paramName = arrowMatch[1];
                const safeCond = arrowMatch[2].trim();
                replacement = `COUNT_IF(${tblName}, ${paramName} => { try { return ${safeCond}; } catch(e) { return false; } })`;
            } else {
                let safeCond = cond.replace(/\b([A-Z_][a-zA-Z0-9_]*)\b/g, (m) => {
                    if (SYS_KEYWORDS_RULE_DONG.includes(m) || !isNaN(m) || m.startsWith('DM_') || m.startsWith('PL') || m === m.toLowerCase()) return m;
                    return `item.${m}`;
                });
                replacement = `COUNT_IF(${tblName}, item => { try { return ${safeCond}; } catch(e) { return false; } })`;
            }
            jsQuery = jsQuery.substring(0, startIdx) + replacement + jsQuery.substring(endIdx + 1);
            startIdx += replacement.length;
        } else { startIdx += 9; }
    }
    cache_BienDichDieuKienLuat.set(khoaCache, jsQuery);
    return jsQuery;
};

const taoHamDieuKienLuatDong = (jsQuery = '') => {
    const expression = String(jsQuery || '').trim();
    if (!laBieuThucRuleDongAnToan(expression)) {
        return () => false;
    }

    return new Function(
        'ctx',
        'danhMucHeThong',
        `
            const {
                XML1, XML2, XML3, XML4, XML5, XML6, XML7, XML8, XML9, XML10, XML11, XML12, XML13, XML14, XML15,
                DS_XML1, DS_XML2, DS_XML3, DS_XML4, DS_XML5, DS_XML6, DS_XML7, DS_XML8, DS_XML9, DS_XML10, DS_XML11, DS_XML12, DS_XML13, DS_XML14, DS_XML15,
                CURRENT, NOW, TODAY, CURRENT_TIMESTAMP,
                UPPER, LEN, DIFF_DAYS, DIFF_HOURS, DIFF_MINUTES, DIFF_MONTHS, DIFF_YEARS, YEAR,
                COUNT_IF, COUNT, ALL, EXISTS, COUNT_DISTINCT, SUM_IF,
                IS_EMPTY, STARTS_WITH, SUBSTR, TO_NUMBER, KY_VONG_SO_NGAY_DTRI_VBHN17,
        KY_HIEU_SO_THU_BA_THE_BHYT,
        KY_HIEU_SO_THU_BA_THE_CHO_TYLE_TT,
        TY_LE_KCB_BHYT_THEO_SO3,
        TY_LE_KCB_BHYT_SAU_NGOAI_LE,
        THE_SO3_KHONG_KHOP_HAI_KY_TU_DAU,
        VI_PHAM_KHAI_BAO_THE_SO3_LECH_PREFIX,
        VI_PHAM_TYLE_T_BHTT_TONGCHI_BH,
        VI_PHAM_TS_TYLE_BHTT_DUOI_95,
        NGOAI_TRU_HC39_HC40_TRE_SO_SINH,
        HC_65_CO_MOC_DV_NGOAI_KHOANG_VAO_RA,
        THUOC_95_VI_PHAM_CHI_DINH,
        THUOC_311_VI_PHAM_CHI_DINH,
        THUOC_41_VI_PHAM_CHI_DINH,
        THUOC_267_VI_PHAM_CHI_DINH,
        THUOC_451_VI_PHAM_TRAN_BH_TREN_DON_VI,
        THUOC_533_VI_PHAM_WAMLOX,
        THUOC_398_VI_PHAM_DOMPERIDON
    } = ctx;
            const { DM_ICD10, DM_DVKT, DM_THUOC, DM_VTYT, DM_KHOA, PL1_DVKT, PL2_KHAM, PL3_GIUONG, PL4_GIUONG_BN, PL5_THUOC, PL6_THUOC_YHCT, PL7_BENH_YHCT, PL8_VTYT, PL9_MAU, PL10_DOI_TUONG, PL11_CLS, PL12_NHIEN_LIEU } = danhMucHeThong;
            const normalizeMaIcdPhacDoKey = (v) => String(v || '').replace(/\\./g, '').trim().toUpperCase();
            const ICD_RG_PHAC = /[A-TV-Z]\\d{2}(?:\\.[0-9A-Z]{1,2})?/g;
            const layMaIcdGopChinhVaKemKhongTrung = (x1) => {
                const seen = new Set();
                const out = [];
                const parts = [x1 && x1.MA_BENH_CHINH, x1 && x1.MA_BENH_KT, x1 && x1.MA_BENHKEM];
                parts.forEach((value) => {
                    (String(value || '').toUpperCase().match(ICD_RG_PHAC) || []).forEach((code) => {
                        const n = String(code || '').replace(/[^A-Z0-9.]/g, '').toUpperCase();
                        if (!n) return;
                        const k = n.replace(/\\./g, '');
                        if (k && !seen.has(k)) {
                            seen.add(k);
                            out.push(k);
                        }
                    });
                });
                return out;
            };
            const CO_PHAC_DO_CDSS_CHO_ICD = (ma) => {
                const m = danhMucHeThong && danhMucHeThong.MAP_PHAC_DO_CDSS;
                if (!m || typeof m.has !== 'function') return false;
                const k = normalizeMaIcdPhacDoKey(ma);
                return k ? m.has(k) : false;
            };
            const CO_PHAC_DO_CDSS_CHO_BAT_CU_ICD_TREN_XML1 = (x1) => {
                const m = danhMucHeThong && danhMucHeThong.MAP_PHAC_DO_CDSS;
                if (!m || typeof m.has !== 'function') return false;
                return layMaIcdGopChinhVaKemKhongTrung(x1).some((k) => m.has(k));
            };
            const KHONG_CO_PHAC_DO_CDSS_CHO_MA_ICD_GOP_TREN_XML1 = (x1) => {
                const codes = layMaIcdGopChinhVaKemKhongTrung(x1);
                if (codes.length === 0) return false;
                const m = danhMucHeThong && danhMucHeThong.MAP_PHAC_DO_CDSS;
                if (!m || typeof m.has !== 'function') return false;
                return !codes.some((k) => m.has(k));
            };
            const chuanHoaMaIcdPhacDoCdss = ${chuanHoaMaIcdPhacDoCdss.toString()};
            const CO_CO_DONG_MAPPING_ICD_THUOC = (maThuoc) => {
                const st = danhMucHeThong && danhMucHeThong.SET_MA_THUOC_CO_MAPPING_ICD;
                const mm = String(maThuoc || '').trim();
                return !!(st && typeof st.has === 'function' && mm && st.has(mm));
            };
            const CO_ICD_KHOP_MAPPING_THUOC = (maThuoc) => {
                const rowsAll = danhMucHeThong && danhMucHeThong.DM_MAPPING_ICD_THUOC_ROWS;
                const mThuoc = String(maThuoc || '').trim();
                if (!Array.isArray(rowsAll) || !mThuoc) return true;
                let ngayT = Date.now();
                try {
                    const nx = XML1 && (XML1.NGAY_RA || XML1.NGAY_VAO || '');
                    const ds = String(nx || '').trim();
                    if (ds.length >= 8) {
                        const d = new Date(ds.slice(0, 10));
                        if (Number.isFinite(d.getTime())) ngayT = d.getTime();
                    }
                } catch (_e) {}
                const icdChoPhep = new Set();
                const tachMap = (x) => String(x || '').trim().replace(/\\|/g,';').replace(/,/g,';').split(';').map(z=>String(z||'').trim()).filter(Boolean);
                rowsAll.forEach((row) => {
                    if (String(row.mapping_type || '').toUpperCase() !== 'ICD_DRUG') return;
                    if (row.is_active === false) return;
                    if (row.effective_from && new Date(row.effective_from).getTime() > ngayT) return;
                    if (row.effective_to && new Date(row.effective_to).getTime() < ngayT) return;
                    const md = row.metadata && typeof row.metadata === 'object' ? row.metadata : {};
                    let tgts = [];
                    if (Array.isArray(md.target_codes) && md.target_codes.length) tgts = md.target_codes.map(c=>String(c||'').trim()).filter(Boolean);
                    else tgts = tachMap(row.target_code);
                    if (tgts.indexOf(mThuoc) === -1) return;
                    let srcs = [];
                    if (Array.isArray(md.source_icd_codes) && md.source_icd_codes.length) srcs = md.source_icd_codes.map(c=>String(c||'').trim()).filter(Boolean);
                    else srcs = tachMap(row.source_code);
                    srcs.forEach((icdRaw) => {
                        const x = chuanHoaMaIcdPhacDoCdss(icdRaw);
                        const k = x ? String(x).replace(/\\./g,'').toUpperCase() : '';
                        if (k) icdChoPhep.add(k);
                    });
                });
                if (icdChoPhep.size === 0) return true;
                const hs = layMaIcdGopChinhVaKemKhongTrung(XML1);
                return hs.some((icd) => icdChoPhep.has(icd));
            };
            const normalizeTextNoAccent = ${normalizeTextNoAccent.toString()};
            const tachMapCdContra = (x) => String(x || '').trim().replace(/\\|/g,';').replace(/,/g,';').split(';').map(z=>String(z||'').trim()).filter(Boolean);
            const parseIcdTokensToKeysCdContra = (tokRaw) => {
                const t = String(tokRaw || '').trim().toUpperCase().replace(/\\s+/g, '');
                if (!t) return [];
                if (/^O00-O9A$/i.test(t) || /^O00-O99$/i.test(t)) return ['__O_CHAPTER__'];
                const x = chuanHoaMaIcdPhacDoCdss(tokRaw);
                const k = x ? String(x).replace(/\\./g,'').toUpperCase() : '';
                return k ? [k] : [];
            };
            const themSrcIcdVaoTapCdContra = (tgt, srcBlob) => {
                tachMapCdContra(srcBlob).forEach((tok) => {
                    parseIcdTokensToKeysCdContra(tok).forEach((key) => { if (key) tgt.add(key); });
                });
            };
            const dongThuocKhopDongCdContra = (mThuoc, tenT, hoatT, row, useTenHoat) => {
                const md = row.metadata && typeof row.metadata === 'object' ? row.metadata : {};
                let tgts = [];
                if (Array.isArray(md.target_codes) && md.target_codes.length) tgts = md.target_codes.map(c=>String(c||'').trim()).filter(Boolean);
                else tgts = tachMapCdContra(row.target_code);
                const maHit = !!(mThuoc && tgts.indexOf(mThuoc) !== -1);
                if (maHit) return true;
                if (!useTenHoat || !md.khop_bang_ten_hoat_chat) return false;
                const nTen = normalizeTextNoAccent(tenT || '').toLowerCase().replace(/\\s+/g, ' ').trim();
                const nHoat = normalizeTextNoAccent(hoatT || '').toLowerCase().replace(/\\s+/g, ' ').trim();
                const tens = Array.isArray(md.ten_thuoc_aliases) ? md.ten_thuoc_aliases : [];
                const hoats = Array.isArray(md.hoat_chat_aliases) ? md.hoat_chat_aliases : [];
                const minLen = 3;
                for (let i = 0; i < tens.length; i++) {
                    const s = normalizeTextNoAccent(String(tens[i] || '')).toLowerCase().replace(/\\s+/g, ' ').trim();
                    if (s.length < minLen) continue;
                    if (nTen.includes(s)) return true;
                    if (nTen.length >= minLen && s.includes(nTen)) return true;
                }
                for (let j = 0; j < hoats.length; j++) {
                    const s = normalizeTextNoAccent(String(hoats[j] || '')).toLowerCase().replace(/\\s+/g, ' ').trim();
                    if (s.length < minLen) continue;
                    if (nHoat.includes(s)) return true;
                    if (nHoat.length >= minLen && s.includes(nHoat)) return true;
                }
                return false;
            };
            const bnCoIcdTrungTapCdContra = (icdCam) => {
                const hsCd = layMaIcdGopChinhVaKemKhongTrung(XML1);
                return hsCd.some((icdBnFlat) => {
                    const icdBn = String(icdBnFlat || '').toUpperCase();
                    if (!icdBn) return false;
                    if (icdCam.has('__O_CHAPTER__') && icdBn.startsWith('O')) return true;
                    if (icdCam.has(icdBn)) return true;
                    for (const cam of icdCam) {
                        if (cam === '__O_CHAPTER__') continue;
                        const cs = String(cam || '');
                        if (cs.length >= 3 && icdBn.length >= cs.length && icdBn.startsWith(cs)) return true;
                    }
                    return false;
                });
            };
            const CO_CO_DONG_MAPPING_ICD_CD_THUOC = (maThuoc) => {
                const st = danhMucHeThong && danhMucHeThong.SET_MA_THUOC_CO_MAPPING_ICD_CD;
                const mm = String(maThuoc || '').trim();
                return !!(st && typeof st.has === 'function' && mm && st.has(mm));
            };
            const CO_ICD_VI_PHAM_CHONG_CHI_DINH_THUOC = (maThuoc, tenThuoc, hoatChat) => {
                const rowsAll = danhMucHeThong && danhMucHeThong.DM_MAPPING_ICD_THUOC_CD_ROWS;
                const mThuoc = String(maThuoc || '').trim();
                if (!Array.isArray(rowsAll)) return false;
                const useTenHoat = arguments.length >= 2;
                const tenT = useTenHoat ? tenThuoc : '';
                const hoatT = arguments.length >= 3 ? hoatChat : '';
                if (useTenHoat) {
                    if (!mThuoc && !String(tenT || '').trim() && !String(hoatT || '').trim()) return false;
                } else if (!mThuoc) return false;
                let ngayT = Date.now();
                try {
                    const nx = XML1 && (XML1.NGAY_RA || XML1.NGAY_VAO || '');
                    const ds = String(nx || '').trim();
                    if (ds.length >= 8) {
                        const d = new Date(ds.slice(0, 10));
                        if (Number.isFinite(d.getTime())) ngayT = d.getTime();
                    }
                } catch (_e) {}
                const icdCam = new Set();
                rowsAll.forEach((row) => {
                    const mType = String(row.mapping_type || 'ICD_DRUG_CONTRA').toUpperCase();
                    if (mType !== 'ICD_DRUG_CONTRA') return;
                    if (row.is_active === false) return;
                    if (row.effective_from && new Date(row.effective_from).getTime() > ngayT) return;
                    if (row.effective_to && new Date(row.effective_to).getTime() < ngayT) return;
                    if (!dongThuocKhopDongCdContra(mThuoc, tenT, hoatT, row, useTenHoat)) return;
                    const md = row.metadata && typeof row.metadata === 'object' ? row.metadata : {};
                    let srcs = [];
                    if (Array.isArray(md.source_icd_codes) && md.source_icd_codes.length) srcs = md.source_icd_codes.map(c=>String(c||'').trim()).filter(Boolean);
                    else srcs = tachMapCdContra(row.source_code);
                    srcs.forEach((icdRaw) => { themSrcIcdVaoTapCdContra(icdCam, icdRaw); });
                });
                if (icdCam.size === 0) return false;
                return bnCoIcdTrungTapCdContra(icdCam);
            };
            const CO_THUOC_TRONG_DM_BV = (maThuoc) => {
                const m = danhMucHeThong && danhMucHeThong.MAP_THUOC_BV;
                if (!m || typeof m.has !== 'function') return false;
                const c = String(maThuoc || '').trim().toUpperCase();
                return Boolean(c && m.has(c));
            };
            const CO_KHO_TRI_THUC_PHAC_DO = () => !!(danhMucHeThong && danhMucHeThong.CO_KHO_PHAC_DO_CDSS);
            const normalizeMaLoaiKcb = ${normalizeMaLoaiKcb.toString()};
            const layTapMaLoaiKcbTheoGiaTriRule = ${layTapMaLoaiKcbTheoGiaTriRule.toString()};
            const MATCH_MA_LOAI_KCB = ${MATCH_MA_LOAI_KCB.toString()};
            const MATCH_ANY_MA_LOAI_KCB = ${MATCH_ANY_MA_LOAI_KCB.toString()};
            const layTongSoGiuongDanhMuc_CHUYEN_DE_166 = ${layTongSoGiuongDanhMuc.toString()};
            const laBHYTKhôngThanhToan_CHUYEN_DE_166 = ${laBHYTKhôngThanhToan.toString()};
            const laDongGiuongXml3Kt221_CHUYEN_DE_166 = ${laDongGiuongXml3Kt221Neo.toString()};
            const CHUYEN_DE_166_VI_PHAM_TT22_PROXY = (x1, ds3) => {
                try {
                    const mk = UPPER(String(x1 && x1.MA_KHOA || '').trim());
                    const map = danhMucHeThong && danhMucHeThong.MAP_KHOA_BV;
                    if (!mk || !map || typeof map.get !== 'function') return false;
                    const rowDm = map.get(mk);
                    if (!rowDm) return false;
                    const cap = layTongSoGiuongDanhMuc_CHUYEN_DE_166(rowDm);
                    if (!(cap > 0)) return false;
                    const arr = Array.isArray(ds3) ? ds3 : [];
                    let tongNgayBHYT = 0;
                    const bedRowsBHYT = [];
                    for (let i = 0; i < arr.length; i += 1) {
                        const item = arr[i];
                        if (!laDongGiuongXml3Kt221_CHUYEN_DE_166(item)) continue;
                        if (laBHYTKhôngThanhToan_CHUYEN_DE_166(item)) continue;
                        tongNgayBHYT += Math.max(0, TO_NUMBER(item && item.SO_LUONG));
                        bedRowsBHYT.push(item);
                    }
                    if (tongNgayBHYT <= cap) return false;
                    if (bedRowsBHYT.length === 0) return false;
                    for (let j = 0; j < bedRowsBHYT.length; j += 1) {
                        const r = bedRowsBHYT[j];
                        const rawT = (r.TYLE_TT != null && String(r.TYLE_TT).trim() !== '')
                            ? r.TYLE_TT
                            : ((r.TYLE_TT_BH != null && String(r.TYLE_TT_BH).trim() !== '')
                                ? r.TYLE_TT_BH
                                : ((r.TY_LE_TT != null && String(r.TY_LE_TT).trim() !== '')
                                    ? r.TY_LE_TT
                                    : r.TY_LE_THANH_TOAN));
                        if (rawT != null && String(rawT).trim() !== '') {
                            const t = TO_NUMBER(rawT);
                            if (Number.isFinite(t) && t > 0 && t < 95) return false;
                        }
                        const rawM = r.MUC_HUONG;
                        if (rawM != null && String(rawM).trim() !== '') {
                            const mhu = TO_NUMBER(rawM);
                            if (Number.isFinite(mhu) && mhu > 0 && mhu < 90) return false;
                        }
                    }
                    return true;
                } catch (_e) {
                    return false;
                }
            };
            try { return !!(${expression}); } catch (_e) { return false; }
        `
    );
};

const chuanHoaRuleDong = (rule) => {
    if (!rule || typeof rule !== 'object') return null;
    if (rule._enginePrepared) return rule;
    const conditionStr = String(layGiaTriAnToan(rule, 'dieukien')).trim();
    const targetTable = normalizeTargetTable(layGiaTriAnToan(rule, 'phanhe'), conditionStr);
    const fieldMatch = conditionStr.match(/(?:XML\d+|CURRENT)\.([A-Z0-9_]+)/i);
    const targetField = fieldMatch ? fieldMatch[1] : 'UNKNOWN';
    const specialEvaluator = taoBoXuLyRuleDongDacBiet(rule, conditionStr);
    rule._enginePrepared = true;
    rule._conditionStr = conditionStr;
    rule._maLuat = String(layGiaTriAnToan(rule, 'maluat')).trim() || 'N/A';
    rule._tenQuyTac = String(layGiaTriAnToan(rule, 'tenquytac')).trim() || 'N/A';
    rule._canhBao = String(layGiaTriAnToan(rule, 'canhbao')).trim() || 'Vi phạm quy tắc';
    rule._mucDo = normalizeSeverity(layGiaTriAnToan(rule, 'mucdo') || layGiaTriAnToan(rule, 'cannang'));
    rule._coSoPhapLy = String(
        layGiaTriAnToan(rule, 'co_so_phap_ly')
        || layGiaTriAnToan(rule, 'cosophaply')
        || layGiaTriAnToan(rule, 'phaply')
        || ''
    ).trim();
    rule._targetTable = targetTable;
    rule._targetField = targetField;
    if (!conditionStr) {
        rule._boQuaEngine = true;
        return rule;
    }
    if (typeof specialEvaluator === 'function') {
        rule._specialEvaluator = specialEvaluator;
        rule._boQuaEngine = false;
        rule._compiledPredicate = null;
        return rule;
    }
    if (!laBieuThucRuleDongDuocHoTro(conditionStr)) {
        rule._boQuaEngine = true;
        return rule;
    }
    const jsQuery = bienDichDieuKienLuatDong(conditionStr);
    rule._boQuaEngine = false;
    try {
        rule._compiledPredicate = taoHamDieuKienLuatDong(jsQuery);
    } catch {
        rule._boQuaEngine = true;
        rule._compiledPredicate = null;
    }
    return rule;
};

const taoNguCanhRuleDong = (hoSo, batchContext = null) => {
    const layBangXml = (soBang) => {
        const keyUpper = `XML${soBang}`;
        const raw = layDanhSachXml(hoSo, keyUpper);
        if (soBang === 1) return Array.isArray(raw) ? (raw[0] || {}) : (raw || {});
        if (Array.isArray(raw)) return raw;
        return raw ? [raw] : [];
    };
    const hsXML1 = layBangXml(1);
    const xml1Prepared = safeProxy(prepareData(Array.isArray(hsXML1) ? hsXML1[0] : hsXML1));
    const rowsByTable = { XML1: [Array.isArray(hsXML1) ? hsXML1[0] : hsXML1] };
    const preparedRowsByTable = { XML1: [xml1Prepared] };

    for (let soBang = 2; soBang <= 15; soBang += 1) {
        const tableName = `XML${soBang}`;
        const rows = layBangXml(soBang);
        rowsByTable[tableName] = rows;
        preparedRowsByTable[tableName] = rows.map((row) => safeProxy(soBang === 2 ? enrichXML2Data(row) : prepareData(row)));
    }

    const baseCtx = {
        XML1: xml1Prepared,
        DS_XML1: preparedRowsByTable.XML1,
        NOW: taoGiaTriNow(),
        TODAY: taoGiaTriToday(),
        CURRENT_TIMESTAMP: taoGiaTriNow(),
        UPPER,
        LEN,
        DIFF_DAYS,
        DIFF_HOURS,
        DIFF_MINUTES,
        DIFF_MONTHS,
        DIFF_YEARS,
        YEAR,
        COUNT_IF,
        COUNT,
        ALL,
        EXISTS,
        COUNT_DISTINCT,
        SUM_IF,
        IS_EMPTY,
        STARTS_WITH,
        SUBSTR,
        TO_NUMBER,
        KY_VONG_SO_NGAY_DTRI_VBHN17,
        KY_HIEU_SO_THU_BA_THE_BHYT,
        KY_HIEU_SO_THU_BA_THE_CHO_TYLE_TT,
        TY_LE_KCB_BHYT_THEO_SO3,
        TY_LE_KCB_BHYT_SAU_NGOAI_LE,
        THE_SO3_KHONG_KHOP_HAI_KY_TU_DAU,
        VI_PHAM_KHAI_BAO_THE_SO3_LECH_PREFIX,
        VI_PHAM_TYLE_T_BHTT_TONGCHI_BH,
        VI_PHAM_TS_TYLE_BHTT_DUOI_95,
        NGOAI_TRU_HC39_HC40_TRE_SO_SINH,
        HC_65_CO_MOC_DV_NGOAI_KHOANG_VAO_RA,
        THUOC_95_VI_PHAM_CHI_DINH,
        THUOC_311_VI_PHAM_CHI_DINH,
        THUOC_41_VI_PHAM_CHI_DINH,
        THUOC_267_VI_PHAM_CHI_DINH,
        THUOC_451_VI_PHAM_TRAN_BH_TREN_DON_VI,
        THUOC_533_VI_PHAM_WAMLOX,
        THUOC_398_VI_PHAM_DOMPERIDON,
    };

    for (let soBang = 2; soBang <= 15; soBang += 1) {
        const tableName = `XML${soBang}`;
        baseCtx[tableName] = preparedRowsByTable[tableName];
        baseCtx[`DS_${tableName}`] = preparedRowsByTable[tableName];
    }

    return {
        rowsByTable,
        preparedRowsByTable,
        baseCtx,
        batchContext,
        currentEntry: layEntryBatchHienTai(batchContext, hoSo),
    };
};

/**
 * CK_14: XML3 — cùng MA_DV và SUBSTR(NGAY_YL,1,12) (cùng phút) trên ≥ 2 dòng → chỉ định trùng.
 * Khớp logic COUNT_IF trong luật (DS_XML3 khi biên dịch).
 */
const lapChiTietTrungChiDinhXml3CungMoc = (rowsXml3) => {
    if (!Array.isArray(rowsXml3) || rowsXml3.length < 2) return '';
    const groups = new Map();
    rowsXml3.forEach((row, i) => {
        const ma = String(row?.MA_DV ?? '').trim();
        const ngay = String(row?.NGAY_YL ?? '').trim();
        if (!ma || !ngay) return;
        const moc = ngay.length >= 12 ? ngay.slice(0, 12) : ngay;
        const key = `${ma}\t${moc}`;
        if (!groups.has(key)) groups.set(key, []);
        const sttDong = row?.STT != null && String(row.STT).trim() !== '' ? String(row.STT).trim() : String(i + 1);
        groups.get(key).push(sttDong);
    });
    const parts = [];
    groups.forEach((sttList, key) => {
        if (sttList.length >= 2) {
            const [ma, moc] = key.split('\t');
            parts.push(`MA_DV ${ma} @ ${moc} (STT: ${sttList.join(', ')})`);
        }
    });
    if (parts.length === 0) return '';
    const s = parts.join(' | ');
    return s.length > 2000 ? `${s.slice(0, 2000)}…` : s;
};

const evaluateRule = (rule, contextRuleDong, danhMucHeThong) => {
    const ruleMeta = chuanHoaRuleDong(rule);
    if (!ruleMeta) return [];
    if (laDieuKienChuyenDeXml130Placeholder(ruleMeta._conditionStr)) return [];
    if (typeof ruleMeta._specialEvaluator === 'function') {
        return ruleMeta._specialEvaluator(ruleMeta, contextRuleDong, danhMucHeThong) || [];
    }
    let violations = [];
    if (!ruleMeta || ruleMeta._boQuaEngine || typeof ruleMeta._compiledPredicate !== 'function') return [];
    const targetTable = ruleMeta._targetTable;
    const rows = contextRuleDong?.rowsByTable?.[targetTable] || [];
    const preparedRows = contextRuleDong?.preparedRowsByTable?.[targetTable] || [];
    const maLuatUpper = String(ruleMeta._maLuat || '').trim().toUpperCase();

    rows.forEach((row, index) => {
        if (!row) return;
        const ctx = { ...contextRuleDong.baseCtx };
        const rowObj = preparedRows[index] || safeProxy(targetTable === 'XML2' ? enrichXML2Data(row) : prepareData(row));
        ctx[targetTable] = rowObj;
        ctx['CURRENT'] = rowObj;
        if (targetTable !== 'XML1' && rowObj && typeof rowObj === 'object') {
            Object.assign(ctx, rowObj);
        }
        if (ruleMeta._compiledPredicate(ctx, danhMucHeThong)) {
            let canhBao = ruleMeta._canhBao;
            if (maLuatUpper === 'CK_14') {
                const chiTiet = lapChiTietTrungChiDinhXml3CungMoc(contextRuleDong?.rowsByTable?.XML3);
                if (chiTiet) canhBao = `${canhBao} Chi tiết: ${chiTiet}`;
            }
            violations.push({ phan_he: targetTable, index: targetTable === 'XML1' ? -1 : index,
                truong_loi: ruleMeta._targetField, canh_bao: canhBao, muc_do: ruleMeta._mucDo,
                ma_luat: ruleMeta._maLuat, ten_quy_tac: ruleMeta._tenQuyTac, dieu_kien: ruleMeta._conditionStr,
                co_so_phap_ly: ruleMeta._coSoPhapLy });
        }
    });
    return violations;
};

// ============================================================
// [PHẦN 9] EXPORTS CHÍNH
// ============================================================

/**
 * V3 API — backward compatible (luật động theo tab + DVKT-OP).
 */
export const chayBoMayGiamDinhV3 = async (hoSo, options = {}) => {
    if (!hoSo) return [];
    let danhSachCanhBao = [];
    let danhMucHeThong = null;
    let mapGhiDeNoiDung = null;
    const xml1 = _getXML1(hoSo);
    const laNoiTruDieuTri = laHoSoNoiTruTheoQd824(xml1);
    try {
        danhMucHeThong = await taiDanhMucHeThong();
        const danhSachTabIds = await taiDanhSachTabLuatDong();
        const contextRuleDong = taoNguCanhRuleDong(hoSo, options?.batchContext || null);
        const mapsOnOff = await Promise.all([
          taiMapTrangThaiQuyTacNoiBo(),
          taiMapGhiDeNoiDungQuyTacNoiBo(),
        ]);
        const mapTrangThaiNoiBo = mapsOnOff[0];
        mapGhiDeNoiDung = mapsOnOff[1];

        const tabsCanNap = danhSachTabIds.filter((tabId) => !Array.isArray(cache_LuatGiamDinh[tabId]));
        if (tabsCanNap.length > 0) {
            const luatTheoTab = await Promise.all(
                tabsCanNap.map(async (tabId) => ({
                    tabId,
                    rules: await taiRuleDongTheoTabId(tabId),
                }))
            );
            luatTheoTab.forEach(({ tabId, rules }) => {
                cache_LuatGiamDinh[tabId] = Array.isArray(rules) ? rules : [];
            });
        }
        try {
            const dsLoiDvkt = await chayGiamDinhDvktOp(hoSo);
            if (Array.isArray(dsLoiDvkt) && dsLoiDvkt.length > 0) {
                danhSachCanhBao = danhSachCanhBao.concat(dsLoiDvkt);
            }
        } catch (dvktError) {
            console.error('[CDSS Engine V3] Lỗi DVKT-OP (dvkt_op_giam_dinh):', dvktError);
        }

        for (const tabId of danhSachTabIds) {
            const normalizedTabId = String(tabId || '').trim().toUpperCase();
            if ((normalizedTabId === 'LUAT_GIUONG' || normalizedTabId === 'NOI_TRU') && !laNoiTruDieuTri) {
                continue;
            }
            let rules = Array.isArray(cache_LuatGiamDinh[tabId]) ? cache_LuatGiamDinh[tabId] : [];
            if (rules.length === 0) rules = await taiRuleDongTheoTabId(tabId);
            cache_LuatGiamDinh[tabId] = rules;
            if (rules.length === 0) continue;
            const coDangQuyTac = rules.some((rule) => {
                const dieuKien = String(rule?._conditionStr || layGiaTriAnToan(rule, 'dieukien')).trim();
                const maLuat = String(rule?._maLuat || layGiaTriAnToan(rule, 'maluat')).trim();
                const tenQuyTac = String(rule?._tenQuyTac || layGiaTriAnToan(rule, 'tenquytac')).trim();
                return dieuKien !== '' || maLuat !== '' || tenQuyTac !== '';
            });
            if (!coDangQuyTac) continue;
            rules.forEach(rule => {
                const dieuKien = String(rule?._conditionStr || layGiaTriAnToan(rule, 'dieukien')).trim();
                const maLuat = String(rule?._maLuat || layGiaTriAnToan(rule, 'maluat')).trim();
                const batTheoNoiBo = isQuyTacNoiBoDangBat(maLuat, mapTrangThaiNoiBo, true);
                if (laDieuKienChuyenDeXml130Placeholder(dieuKien)) return;
                if (laTrangThaiLuatBat(layGiaTriAnToan(rule, 'trangthai')) && batTheoNoiBo && dieuKien !== '') {
                    evaluateRule(rule, contextRuleDong, danhMucHeThong).forEach(v => {
                        danhSachCanhBao.push({
                            id: v.ma_luat !== 'N/A' ? v.ma_luat : `R${Math.random().toString(36).slice(2,11)}`,
                            phan_he: v.phan_he, truong_loi: v.truong_loi, canh_bao: v.canh_bao,
                            muc_do: v.muc_do, index: v.index, ma_luat: v.ma_luat,
                            ten_quy_tac: v.ten_quy_tac, dieu_kien: v.dieu_kien,
                            co_so_phap_ly: v.co_so_phap_ly || '',
                            namespace_quy_tac: v.namespace_quy_tac || '',
                            nguon_quy_tac: v.nguon_quy_tac || '',
                            luong_giai_trinh: v.luong_giai_trinh || '',
                            tab_quan_tri_goi_y: v.tab_quan_tri_goi_y || ''
                        });
                    });
                }
            });
        }
    } catch (error) { console.error("[CDSS Engine V3] Lỗi:", error); }
    // V3 duoc goi truc tiep o man hinh tong quan/doc_file_xml, can dong bo hau loc nhu V15
    // de tranh dương tính giả khi chi chay luat dong.
    danhSachCanhBao = locCanhBaoDuongTinhGiaTheoNguCanh(hoSo, danhSachCanhBao, danhMucHeThong || {});
    try {
      const mapDe = mapGhiDeNoiDung || (await taiMapGhiDeNoiDungQuyTacNoiBo());
      danhSachCanhBao = danhSachCanhBao.map((x) => apGhiDeNoiDungLenDoiTuongCanhBao(x, mapDe));
    } catch (_e) { /* ignore */ }
    // Thay the {TEN_THUOC}, {DU_QTY}, ... trong canh bao (giong V15 + xuat Excel DS_Loi).
    return gomTrungLapCanhBaoTheoMaLuatVaNoiDung(
        boSungChiTietCanhBaoGiaiTrinh(hoSo, danhSachCanhBao, danhMucHeThong || {}),
    );
};

/**
 * Làm nóng cache trước batch: danh mục hệ thống (lần đầu đủ chunk), map ON/OFF / ghi đề quy tắc,
 * và nạp trọn luật động theo tab — giảm I/O & parse luật lặp cho từng hồ sơ trong cùng đợt kiểm tra.
 */
export const lamNongCoSoTruocBatchGiamDinh = async () => {
    await Promise.all([
        taiDanhMucHeThong(),
        taiMapTrangThaiQuyTacNoiBo(),
        taiMapGhiDeNoiDungQuyTacNoiBo(),
    ]);
    const danhSachTabIds = await taiDanhSachTabLuatDong();
    const tabsCanNap = danhSachTabIds.filter((tabId) => !Array.isArray(cache_LuatGiamDinh[tabId]));
    if (tabsCanNap.length === 0) return;
    const luatTheoTab = await Promise.all(
        tabsCanNap.map(async (tabId) => ({
            tabId,
            rules: await taiRuleDongTheoTabId(tabId),
        })),
    );
    luatTheoTab.forEach(({ tabId, rules }) => {
        cache_LuatGiamDinh[tabId] = Array.isArray(rules) ? rules : [];
    });
};

/** Alias — đồng bộ với batch V15 */
export const lamNongCoSoTruocBatchGiamDinhV15 = lamNongCoSoTruocBatchGiamDinh;

export const chayBoMayGiamDinhNhieuHoSoV3 = async (danhSachHoSo = [], options = {}) => {
    const danhSachDauVao = Array.isArray(danhSachHoSo) ? danhSachHoSo : [];
    const ketQua = [];
    const onProgress = typeof options?.onProgress === 'function' ? options.onProgress : null;
    const forceReaudit = options?.forceReaudit !== false;
    const batchContext = taoBatchContextGiamDinh(danhSachDauVao);

    const canWarm = danhSachDauVao.some(
        (hoSo) => hoSo && (forceReaudit || !Array.isArray(hoSo?.ket_qua_giam_dinh)),
    );
    if (options?.warmUp !== false && canWarm) {
        try {
            await lamNongCoSoTruocBatchGiamDinh();
        } catch (warmErr) {
            console.warn('[CDSS] lamNongCoSoTruocBatchGiamDinh:', warmErr);
        }
    }

    for (let index = 0; index < danhSachDauVao.length; index += 1) {
        const hoSo = danhSachDauVao[index];
        if (!hoSo) continue;
        const coKetQuaCu = Array.isArray(hoSo?.ket_qua_giam_dinh);
        const ketQuaHoSo = (!forceReaudit && coKetQuaCu)
            ? hoSo.ket_qua_giam_dinh
            : await chayBoMayGiamDinhV3(hoSo, { batchContext });
        ketQua.push({
            ...hoSo,
            ket_qua_giam_dinh: ketQuaHoSo,
        });

        if (onProgress) {
            await onProgress({
                index,
                completed: index + 1,
                total: danhSachDauVao.length,
                hoSo: ketQua[ketQua.length - 1],
            });
        }
    }

    return ketQua;
};

/**
 * V15 API — Kiểm tra toàn diện 5 lớp.
 * @param {object} hoSo - Hồ sơ KCB: { XML1, XML2, XML3, XML4, XML5, XML6 }
 * @returns {Array} Danh sách cảnh báo, sắp xếp Critical→Error→Warning→Info
 */
export const chayGiamDinhToanDienV15 = async (hoSo) => {
    if (!hoSo) return [];
    const danhMuc = await taiDanhMucHeThong();
    let allLỗi = layLỗiCauTrucTienXuLy(hoSo);

    // LAYER 0: False Positive Guard — vẫn giữ lỗi Critical từ kiểm_tra_xml (thiếu trường bắt buộc cổng / MA_TTDV…).
    const xml1Obj = _getXML1(hoSo);
    if (laNguonKhôngPhaBHYT(xml1Obj)) {
        const ORDER_EARLY = { Critical: 0, Error: 1, Warning: 2, Info: 3 };
        const fpGuard = [{
            phan_he: 'XML1',
            index: -1,
            truong_loi: 'T_BHTT',
            canh_bao: 'Hồ sơ này không có thanh toán BHYT - bỏ qua toàn bộ kiểm tra BHYT.',
            muc_do: 'Info',
            ma_luat: 'FPG-00',
            ten_quy_tac: 'False Positive Guard',
            dieu_kien: 'BUILT-IN',
        }];
        const criticalCauTruc = allLỗi.filter((x) => String(x?.muc_do || '').trim() === 'Critical');
        const ketQua = criticalCauTruc.length > 0 ? [...criticalCauTruc, ...fpGuard] : fpGuard;
        ketQua.sort((a, b) => (ORDER_EARLY[a.muc_do] ?? 9) - (ORDER_EARLY[b.muc_do] ?? 9));
        return ketQua;
    }

    // LAYER 1: Hành chính
    allLỗi = allLỗi.concat(giamDinhHanhChinh(hoSo, danhMuc));

    // LAYER 2+3: Danh mục nội bộ BV + BYT
    allLỗi = allLỗi.concat(giamDinhDanhMucNoiBo(hoSo, danhMuc));
    allLỗi = allLỗi.concat(giamDinhChatLuongDanhMucBenhVien(hoSo, danhMuc));

    // LAYER 4: Lâm sàng
    allLỗi = allLỗi.concat(giamDinhThuoc(hoSo, danhMuc));
    allLỗi = allLỗi.concat(giamDinhCDHA(hoSo));
    allLỗi = allLỗi.concat(giamDinhNguoiThucHienKhamVaDvktXml3(hoSo, danhMuc));
    allLỗi = allLỗi.concat(giamDinhCongKhamTmhVaNoiSoiTrungMocXml3(hoSo));
    allLỗi = allLỗi.concat(giamDinhCv4262Bhyt(hoSo, danhMuc));
    allLỗi = allLỗi.concat(giamDinhCv3231Bhyt(hoSo, danhMuc));
    allLỗi = allLỗi.concat(giamDinhBsMotCchnNhieuChuyenKhoaCongKham(hoSo, danhMuc));
    allLỗi = allLỗi.concat(giamDinhGiuong(hoSo, danhMuc));
    allLỗi = allLỗi.concat(giamDinhPTTT(hoSo));
    allLỗi = allLỗi.concat(giamDinhChuyenTuyen(hoSo));
    allLỗi = allLỗi.concat(giamDinhTongChiPhi(hoSo, danhMuc));
    allLỗi = allLỗi.concat(giamDinhChatCheoDaBien(hoSo));
    allLỗi = allLỗi.concat(giamDinhIcd10TheoTT06(hoSo));
    allLỗi = allLỗi.concat(giamDinhIcd10MaKep(hoSo));

    // LAYER 5: Luật động theo tab + DVKT-OP
    allLỗi = allLỗi.concat(await chayBoMayGiamDinhV3(hoSo));

    // LAYER 5b (nâng cấp tách biệt): CDSS — mapping ICD ↔ DM thuốc / DVKT BV (mặc định OFF; không mapping → không cảnh báo).
    try {
        allLỗi = allLỗi.concat(await giamDinhCdssDmMatchingUpgrade(hoSo, danhMuc));
    } catch (_upgradeErr) {
        /* không làm gián đoạn kiểm tra chính */
    }

    // Áp ON/OFF nội bộ cho mọi cảnh báo có ma_luat (gồm luật động + CHUYEN_DE_* / CDHA_* cứng, kể cả dieu_kien không phải BUILT-IN).
    const [mapTrangThaiNoiBo, mapGhiDeNoiDungV15] = await Promise.all([
      taiMapTrangThaiQuyTacNoiBo(),
      taiMapGhiDeNoiDungQuyTacNoiBo(),
    ]);
    allLỗi = locCanhBaoTheoTrangThaiQuyTacNoiBo(allLỗi, mapTrangThaiNoiBo, { chiLocCanhBaoNoiBo: true });
    allLỗi = allLỗi.map((loi) => apGhiDeNoiDungLenDoiTuongCanhBao(loi, mapGhiDeNoiDungV15));

    // Bo sung co so phap ly mac dinh cho cac quy tac chua khai bao can cu.
    allLỗi = boSungCoSoPhapLyMacDinh(allLỗi);
    allLỗi = boSungNamespaceVaGiaiTrinhQuyTac(allLỗi);

    // Hậu lọc: giảm dương tính giả theo ngữ cảnh hồ sơ thực tế.
    allLỗi = locCanhBaoDuongTinhGiaTheoNguCanh(hoSo, allLỗi, danhMuc);

    const ketQuaCoChiTiet = gomTrungLapCanhBaoTheoMaLuatVaNoiDung(
        boSungChiTietCanhBaoGiaiTrinh(hoSo, allLỗi, danhMuc),
    );

    // Sắp xếp theo mức độ
    const ORDER = { Critical: 0, Error: 1, Warning: 2, Info: 3 };
    ketQuaCoChiTiet.sort((a, b) => (ORDER[a.muc_do] ?? 9) - (ORDER[b.muc_do] ?? 9));
    return ketQuaCoChiTiet;
};

/**
 * Kiểm tra hàng loạt — cùng pipeline với `chayGiamDinhToanDienV15` (CLI QA, chi tiết ca bệnh).
 * Khác `chayBoMayGiamDinhNhieuHoSoV3`: gồm đủ L0–L5b (hành chính, danh mục, thuốc/GDH cứng, luật động, v.v.).
 */
export const chayGiamDinhNhieuHoSoV15 = async (danhSachHoSo = [], options = {}) => {
    const danhSachDauVao = Array.isArray(danhSachHoSo) ? danhSachHoSo : [];
    const ketQua = [];
    const onProgress = typeof options?.onProgress === 'function' ? options.onProgress : null;
    const forceReaudit = options?.forceReaudit !== false;

    const canWarm = danhSachDauVao.some(
        (hoSo) => hoSo && (forceReaudit || !Array.isArray(hoSo?.ket_qua_giam_dinh)),
    );
    if (options?.warmUp !== false && canWarm) {
        try {
            await lamNongCoSoTruocBatchGiamDinh();
        } catch (warmErr) {
            console.warn('[CDSS] lamNongCoSoTruocBatchGiamDinh (V15):', warmErr);
        }
    }

    for (let index = 0; index < danhSachDauVao.length; index += 1) {
        const hoSo = danhSachDauVao[index];
        if (!hoSo) continue;
        const coKetQuaCu = Array.isArray(hoSo?.ket_qua_giam_dinh);
        const ketQuaHoSo = (!forceReaudit && coKetQuaCu)
            ? hoSo.ket_qua_giam_dinh
            : await chayGiamDinhToanDienV15(hoSo);
        ketQua.push({
            ...hoSo,
            ket_qua_giam_dinh: ketQuaHoSo,
        });

        if (onProgress) {
            await onProgress({
                index,
                completed: index + 1,
                total: danhSachDauVao.length,
                hoSo: ketQua[ketQua.length - 1],
            });
        }
    }

    return ketQua;
};

// ============================================================
// [PHẦN 10] API TƯƠNG THÍCH CŨ (chayDongCoGiamDinh)
// ============================================================
export const chuanHoaDanhMucSangMap = (rawDanhMucs) => {
    const buildMap = (arr, keyField) => {
        const m = new Map();
        if (Array.isArray(arr)) arr.forEach(i => { if (i[keyField]) m.set(i[keyField].toString().trim(), i); });
        return m;
    };
    return {
        DVKT_BV: buildMap(rawDanhMucs.dvktBenhVien, 'MA_DICH_VU'),
        THUOC_BV: buildMap(rawDanhMucs.thuocBenhVien, 'MA_THUOC'),
        DVKT_BYT: buildMap(rawDanhMucs.dvktBoYTe, 'MA_BO_Y_TE'),
        THUOC_BYT: buildMap(rawDanhMucs.thuocBoYTe, 'MA_HOAT_CHAT'),
    };
};

export const chayDongCoGiamDinh = (hoSoXML, danhMucMap) => {
    const dsLỗi = [];
    const QUY_TAC = [
        { MA_LUAT: 'XML3_DM_BV_01', TEN_QUY_TAC: 'DVKT theo DM BV',
          DIEU_KIEN: (r,dm) => dm.DVKT_BV && !dm.DVKT_BV.has(r.MA_DICH_VU?.trim()),
          CANH_BAO: 'Mã DVKT không tồn tại trong Danh mục được phê duyệt của Bệnh viện.' },
        { MA_LUAT: 'XML3_DM_BYT_02', TEN_QUY_TAC: 'DVKT theo DM BYT',
          DIEU_KIEN: (r,dm) => dm.DVKT_BYT && !dm.DVKT_BYT.has(r.MA_DICH_VU?.trim()),
          CANH_BAO: 'Mã DVKT không khớp với Danh mục dùng chung của Bộ Y tế (TT 23/2024).' },
        { MA_LUAT: 'XML3_GIA_03', TEN_QUY_TAC: 'Đơn giá DVKT',
          DIEU_KIEN: (r,dm) => { if(!dm.DVKT_BV) return false; const d=dm.DVKT_BV.get(r.MA_DICH_VU?.trim()); return d && Number(r.DON_GIA)>Number(d.DON_GIA); },
          CANH_BAO: 'Đơn giá DVKT trong hồ sơ cao hơn giá quy định của Bệnh viện.' },
        { MA_LUAT: 'XML2_DM_BV_01', TEN_QUY_TAC: 'Thuốc theo DM BV',
          DIEU_KIEN: (r,dm) => dm.THUOC_BV && !dm.THUOC_BV.has(r.MA_THUOC?.trim()),
          CANH_BAO: 'Mã thuốc không tồn tại trong danh mục nội bộ BV đã phê duyệt theo 15/VBHN-BYT (2024).' },
        { MA_LUAT: 'XML2_DM_BYT_02', TEN_QUY_TAC: 'Thuốc theo DM BYT',
          DIEU_KIEN: (r,dm) => dm.THUOC_BYT && !dm.THUOC_BYT.has(r.MA_THUOC?.trim()),
          CANH_BAO: 'Mã thuốc không khớp danh mục thuốc BHYT theo 15/VBHN-BYT (2024).' },
        { MA_LUAT: 'XML2_GIA_03', TEN_QUY_TAC: 'Giá trúng thầu Thuốc',
          DIEU_KIEN: (r,dm) => { if(!dm.THUOC_BV) return false; const t=dm.THUOC_BV.get(r.MA_THUOC?.trim()); return t && Number(r.DON_GIA)>Number(t.DON_GIA_THAU); },
          CANH_BAO: 'Đơn giá thuốc thanh toán cao hơn giá trúng thầu.' },
    ];
    ['XML2','XML3'].forEach(bang => {
        const bang_data = hoSoXML[bang];
        if (!Array.isArray(bang_data)) return;
        bang_data.forEach((row, idx) => {
            QUY_TAC.forEach(rule => {
                if (rule.MA_LUAT.startsWith(bang)) {
                    try {
                        if (rule.DIEU_KIEN(row, danhMucMap))
                            dsLỗi.push({ bang, dong: idx+1, ma_luat: rule.MA_LUAT,
                                ten_quy_tac: rule.TEN_QUY_TAC, canh_bao: rule.CANH_BAO,
                                du_lieu_loi: row.MA_DICH_VU || row.MA_THUOC || 'N/A' });
                    } catch(_e) {}
                }
            });
        });
    });
    return dsLỗi;
};
