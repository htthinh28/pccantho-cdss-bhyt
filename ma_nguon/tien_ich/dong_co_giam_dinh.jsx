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
 * - [LAYER 5] Luật động NoCode (SQL NLP parser - giữ nguyên từ V14)
 * - Lọc trùng lặp + sắp xếp theo mức độ cuối pipeline
 * ============================================================================
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { CHUOI_DAY_DU_TT12_2026_D10_VA_D13 as TT_12_2026_BTC_DIEU10_K1 } from './co_so_phap_ly_tt12_2026';
import { docDanhMucTuKho } from './kho_du_lieu';
import { kiemTraDinhDangXML } from './kiem_tra_xml';
import { layDanhSachLuatCdhaHardcoded } from './luat_cdha_hardcoded';
import { layDanhSachLuatCongKhamHardcoded } from './luat_cong_kham_hardcoded';
import { layDanhSachLuatDuLieuHardcoded } from './luat_du_lieu_hardcoded';
import { layDanhSachLuatGiamDinhChuyenDeHardcoded } from './luat_giam_dinh_chuyen_de_hardcoded';
import { layDanhSachLuatGiuongHardcoded } from './luat_giuong_hardcoded';
import { layDanhSachLuatHanhChinhHardcoded } from './luat_hanh_chinh_hardcoded';
import { layDanhSachLuatHopDongHardcoded } from './luat_hop_dong_hardcoded';
import { layDanhSachLuatNhanSuHardcoded } from './luat_nhan_su_hardcoded';
import { layDanhSachLuatThuocHardcoded } from './luat_thuoc_hardcoded';
import { isQuyTacNoiBoDangBat, locCanhBaoTheoTrangThaiQuyTacNoiBo, taiMapTrangThaiQuyTacNoiBo } from './quy_tac_on_off_noi_bo';
import { chayGiamDinhDvktNoCode } from './rule_engine_dvkt_no_code';
import { damBaoSeedLuatDuLieuMuc1 } from './seed_luat_du_lieu_muc1';
import { damBaoSeedLuatHanhChinhMuc2 } from './seed_luat_hanh_chinh_muc2';
import { damBaoSeedLuatPtttMuc11 } from './seed_luat_pttt_muc11';
import { damBaoSeedLuatThuocMuc8 } from './seed_luat_thuoc_muc8';

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

const VAN_BAN_HANH_CHINH_HIEN_HANH = Object.freeze({
    ND_188: 'Nghị định 188/2025/NĐ-CP: quy định về thanh toán chi phí KCB BHYT, thủ tục thanh toán và xử lý vi phạm hành chính.',
    TT_01: 'Thông tư 01/2025/TT-BYT: quy định đăng ký KCB ban đầu, thẻ KCB BHYT điện tử và hồ sơ chuyển cơ sở KCB BHYT.',
    QD_3618_BHXH: 'Quyết định 3618/QĐ-BHXH: quy trình kiểm tra BHYT và bộ danh mục, chỉ tiêu dữ liệu phục vụ kiểm tra điện tử.',
    QD_130: 'Quyết định 130/QĐ-BYT: quy định cấu trúc và danh mục chỉ tiêu dữ liệu XML KCB BHYT.',
    QD_3176: 'Quyết định 3176/QĐ-BYT: quy trình tiếp nhận và kiểm tra dữ liệu XML liên thông BHYT.',
    LUAT_BHYT: 'Luật BHYT (đã sửa đổi, bổ sung): điều kiện hưởng và nguyên tắc thanh toán BHYT.',
    LUAT_KCB:
        'Luật Khám bệnh, chữa bệnh (15/2023/QH15; VBHN 26/VBHN-VPQH 2026 — hợp nhất): quyền/nghĩa vụ người bệnh; tổ chức KCB; người hành nghề; hồ sơ bệnh án; chất lượng và an toàn KCB — căn cứ chuyên môn khi giám định chủ động / độ hợp lý dịch vụ (kết hợp TT 12/2026 Điều 10 khoản 1 điểm e, g, i).',
    ND_96_KCB:
        'Nghị định 96/2023/NĐ-CP: hướng dẫn Luật Khám bệnh, chữa bệnh (điều kiện hoạt động CSKCB, phạm vi hành nghề, phân tuyến kỹ thuật, quản lý chất lượng).',
    TT_32_KCB:
        'Thông tư 32/2023/TT-BYT: hướng dẫn Luật Khám bệnh, chữa bệnh (quy trình KCB, bệnh án, biểu mẫu hồ sơ — đối chiếu QĐ 130/QĐ-BYT và giám định chủ động).',
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
    'CLN-GIUONG-': CO_SO_PHAP_LY_DVKT.DANH_MUC_NOI_BO,
    'CLN-PTTT-': CO_SO_PHAP_LY_DVKT.DANH_MUC_NOI_BO,
    'CLN-CT-': `${VAN_BAN_HANH_CHINH_HIEN_HANH.TT_01} ${VAN_BAN_HANH_CHINH_HIEN_HANH.ND_188} ${TT_12_2026_BTC_DIEU10_K1}`,
    'CLN-CHI-': `${VAN_BAN_HANH_CHINH_HIEN_HANH.QD_130} ${VAN_BAN_HANH_CHINH_HIEN_HANH.ND_188} ${TT_12_2026_BTC_DIEU10_K1}`,
    'CLN-KCB-': CO_SO_PHAP_LY_KCB.CHUYEN_MON,
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

const suyRaNamespaceVaNguonQuyTac = (loi = {}) => {
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

    if (/^DVKT-OP-/.test(maLuat)) {
        ganMeta('DVKT_NO_CODE', 'rule_engine_dvkt_no_code', 'XML3 -> DVKT no-code -> operator', 'LUAT_CDHA');
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
    } else if (/^CLN-CDHA-/.test(maLuat)) {
        ganMeta('CDHA_BUILTIN', 'dong_co_giam_dinh', 'XML3 -> built-in CDHA', 'LUAT_CDHA');
    } else if (/^(DMBV-DVKT-|DM-DVKT-)/.test(maLuat)) {
        ganMeta('DVKT_DANH_MUC', 'dong_co_giam_dinh', 'XML3 -> kiểm tra danh mục DVKT', 'LUAT_CDHA');
    } else if (/^CHUYEN_DE[_-]/.test(maLuat)) {
        ganMeta('GIAM_DINH_CHUYEN_DE', 'luat_giam_dinh_chuyen_de_hardcoded', 'XML3 -> hardcoded giám định chuyên đề', 'LUAT_GIAM_DINH_CHUYEN_DE');
    } else if (/^CDHA_/.test(maLuat)) {
        ganMeta('CDHA_HARDCODED', 'luat_cdha_hardcoded', 'XML3 -> hardcoded CDHA', 'LUAT_CDHA');
    } else if (/^DVKT_/.test(maLuat)) {
        ganMeta('PTTT_SEED', 'seed_luat_pttt_muc11', 'XML3 -> seed PTTT', 'LUAT_PTTT');
    }

    if (!namespaceQuyTac && phanHe === 'XML3') {
        ganMeta('XML3_KHAC', 'dong_co_giam_dinh', 'XML3 -> rule chưa phân loại chi tiết');
    }

    return {
        namespace_quy_tac: namespaceQuyTac,
        nguon_quy_tac: nguonQuyTac,
        luong_giai_trinh: luongGiaiTrinh,
        tab_quan_tri_goi_y: tabQuanTriGoiY,
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
    };
});

// ============================================================
// [PHẦN 2] CHUẨN HÓA VÀ XỬ LÝ DỮ LIỆU
// ============================================================
const parseLieuDungThuoc = (lieuDungText, soLuongXuat) => {
    let tanSuat = 0, slMoiLan = 0, slMoiNgay = 0, soNgay = 0;
    let donViLieuDung = '', donViTongNgay = '';
    const rawText = String(lieuDungText || '').toLowerCase();
    const text = rawText.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\u0111/g, 'd');
    const slTong = TO_NUMBER(soLuongXuat);
    const parseSo = (raw) => parseFloat(String(raw || '0').replace(',', '.'));
    const extractByPattern = (regex) => {
        const match = text.match(regex);
        return match ? parseSo(match[1]) : 0;
    };
    const extractDose = (timeKeyword) => {
        const regex = new RegExp(`${timeKeyword}.*?(\d+(?:[.,]\d+)?)`, 'i');
        const match = text.match(regex);
        return match ? parseSo(match[1]) : 0;
    };
    const sang = extractDose('sang');
    const trua = extractDose('trua');
    const chieu = extractDose('chieu');
    const toi = extractDose('toi');
    slMoiNgay = sang + trua + chieu + toi;
    if (sang > 0) tanSuat++;
    if (trua > 0) tanSuat++;
    if (chieu > 0) tanSuat++;
    if (toi > 0) tanSuat++;
    if (tanSuat > 0) slMoiLan = slMoiNgay / tanSuat;
    if (slMoiNgay === 0) {
        const matchTongNgay = text.match(/\*\s*(\d+(?:[.,]\d+)?)\s*ngay\b/i);
        const matchMoiLanVaLanNgay = text.match(/(\d+(?:[.,]\d+)?)\s*(vien|lo|ong|goi|chai|bom|ml|mg|g|mcg|iu|ui)\s*\/\s*lan.*?(\d+(?:[.,]\d+)?)\s*lan\s*\/\s*ngay/i);
        const matchTongNgayTrongNgoac = text.match(/\[\s*(\d+(?:[.,]\d+)?)\s*(vien|lo|ong|goi|chai|bom|ml|mg|g|mcg|iu|ui)\s*\/\s*ngay\s*\]/i);
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
        if (tanSuat > 0 && slMoiLan > 0) {
            slMoiNgay = tanSuat * slMoiLan;
        } else if (/\/ngay\b|\b1\s+ng(?:a|à)y\b/i.test(text)) {
            const matchVienNgay = text.match(/(\d+(?:[.,]\d+)?).*?(vien|lo|ong|goi|chai|bom|ml|mg|g|mcg|iu|ui).*?ngay/i);
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

const standardizeValue = (val, keyName) => {
    if (val === null || val === undefined) return "";
    let cleaned = String(val).replace(/<!\[CDATA\[(.*?)\]\]>/is, '$1').trim();
    const keyUpper = String(keyName || "").toUpperCase();
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
    return result;
};

const enrichXML2Data = (row) => {
    const base = prepareData(row);
    return { ...base, ...parseLieuDungThuoc(base.LIEU_DUNG, base.SO_LUONG) };
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

const taoKhoaLocTrungCanhBao = (loi = {}) => {
    const phanHe = String(loi?.phan_he || '').toUpperCase();
    const truong = String(loi?.truong_loi || '').toUpperCase();
    const canhBao = String(loi?.canh_bao || '').replace(/\s+/g, ' ').trim();
    const index = Number.isFinite(loi?.index) ? loi.index : -1;
    const laParserError =
        truong.toLowerCase() === 'parsererror' ||
        canhBao.toLowerCase().includes('[parsererror]');
    const indexKey = laParserError ? 'GLOBAL' : index;
    return `${phanHe}|${indexKey}|${truong}|${canhBao}`;
};

// ============================================================
// [PHẦN 3] TẢI DANH MỤC BV + BYT → MAP O(1)
// ============================================================
const taiDanhMucHeThong = async () => {
    if (cache_DanhMucHeThong) return cache_DanhMucHeThong;
    try {
        const [icd10Arr, dvktArr, thuocArr, vtytArr, khoaArrRaw, icdKeDonTren30NgayArr, nhanSuArr] = await Promise.all([
            fetchChunkedData('DANH_MUC_ICD10'),
            fetchChunkedData('DANH_MUC_DVKT_M05'),
            fetchChunkedData('DANH_MUC_THUOC_MAU_M03'),
            fetchChunkedData('DANH_MUC_VAT_TU_M04'),
            fetchChunkedData('DANH_MUC_KHOA_LS_M01'),
            fetchChunkedData('DANH_MUC_ICD10_KE_DON_TREN_30_NGAY'),
            fetchChunkedData('DANH_MUC_NHAN_SU')
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

        cache_DanhMucHeThong = {
            // Arrays for NLP engine (backward compatible)
            DM_ICD10: icd10Arr.map(i => i['MÃ BỆNH'] || i['MA_BENH'] || ''),
            DM_ICD10_KE_DON_TREN_30_NGAY: icdKeDonTren30NgayArr.map((i) => i['Mã bệnh theo ICD 10'] || i['Ma benh theo ICD 10'] || i['MA_BENH_THEO_ICD_10'] || ''),
            DM_BENH_MAN_TINH: icdKeDonTren30NgayArr.map((i) => i['Mã bệnh theo ICD 10'] || i['Ma benh theo ICD 10'] || i['MA_BENH_THEO_ICD_10'] || ''),
            DM_DVKT: dvktArr.map(i => i['MA_DICH_VU'] || ''),
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
            MAP_VTYT_BV: buildMap(vtytArr, 'MA_VAT_TU'),
            MAP_ICD10: buildMap(icd10Arr, 'MÃ BỆNH'),
            BO_QUY_TAC_ICD10_KE_DON_TREN_30_NGAY: taoBoQuyTacIcdKeDonTren30Ngay(icdKeDonTren30NgayArr),
            BO_QUY_TAC_DOI_TUONG_KCB: boQuyTacDoiTuongKcb,
            MAP_KHOA_BV: buildMap(khoaArr, 'MA_KHOA'),
            MAP_NHAN_SU: buildAliasMap(nhanSuArr, 'MA_BHXH', 'MA_BAC_SI', 'MACCHN', 'MA_NV', 'ID', 'SO_CCCD', 'SO_DINH_DANH'),
            // Maps O(1) BYT
            MAP_BYT_PL1: buildMapMulti(pl1, 'MÃ BỘ Y TẾ', 'MA_DVKT'),
            MAP_BYT_PL5: buildMapMulti(pl5, 'MÃ THUỐC', 'MA_THUOC'),
            MAP_BYT_PL8: buildMapMulti(pl8, 'MÃ VẬT TƯ', 'MA_VTYT'),
            MAP_BYT_PL11: buildMapMulti(pl11, 'MÃ DỊCH VỤ', 'MA_DVKT'),
        };
        return cache_DanhMucHeThong;
    } catch (_e) {
        return {
            DM_ICD10:[], DM_ICD10_KE_DON_TREN_30_NGAY:[], DM_BENH_MAN_TINH:[], DM_DVKT:[], DM_THUOC:[], DM_VTYT:[], DM_KHOA:[],
            PL1_DVKT:[],PL2_KHAM:[],PL3_GIUONG:[],PL4_GIUONG_BN:[],PL5_THUOC:[],
            PL6_THUOC_YHCT:[],PL7_BENH_YHCT:[],PL8_VTYT:[],PL9_MAU:[],
            PL10_DOI_TUONG:[],PL11_CLS:[],PL12_NHIEN_LIEU:[],
            MAP_DVKT_BV: new Map(), MAP_THUOC_BV: new Map(), MAP_VTYT_BV: new Map(),
            MAP_ICD10: new Map(), BO_QUY_TAC_ICD10_KE_DON_TREN_30_NGAY: { exact: new Set(), ranges: [] }, BO_QUY_TAC_DOI_TUONG_KCB: { validCodes: new Set(), byCode: new Map() }, MAP_KHOA_BV: new Map(), MAP_NHAN_SU: new Map(),
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

const MA_THE_BHYT_REGEX = /^[A-Z]{2}\d{13}$/;
const CARD_BENEFIT_CODE_MAP = Object.freeze({ '1': 100, '2': 100, '3': 95, '4': 80 });

const normalizeTextNoAccent = (value) => String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/Đ/g, 'D')
    .replace(/đ/g, 'd');

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

const layThongTinMucHuongTuThe = (maTheBHYT) => {
    const normalized = normalizeMaTheBHYT(maTheBHYT);
    const validFormat = MA_THE_BHYT_REGEX.test(normalized);
    const code = validFormat ? normalized.substring(2, 3) : '';
    return {
        normalized,
        validFormat,
        benefitCode: code,
        benefitPercent: Object.prototype.hasOwnProperty.call(CARD_BENEFIT_CODE_MAP, code)
            ? CARD_BENEFIT_CODE_MAP[code]
            : null,
    };
};

const laDieuTriNgoaiTru = (xml1 = {}) => {
    return laHoSoNgoaiTruTheoQd824(xml1);
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
    const tong = TO_NUMBER(xml1?.T_BNTT) + TO_NUMBER(xml1?.T_BNCCT) + TO_NUMBER(xml1?.T_BHTT) + TO_NUMBER(xml1?.T_NGUONKHAC);
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

/** TT 26/2025 INN: tên dòng kê đã là hoạt chất trong DM nội bộ thì không ép có dấu ngoặc. */
const coTenThuocTrungHoatChatDanhMuc = (dong, dm) => {
    if (!dong || !dm?.MAP_THUOC_BV) return false;
    const ma = UPPER(dong?.MA_THUOC || '');
    if (!ma) return false;
    const dmRow = dm.MAP_THUOC_BV.get(ma);
    if (!dmRow || typeof dmRow !== 'object') return false;
    const hoatChat = lamSachChuoiHienThi(
        layGiaTriDanhMuc(dmRow, ['TEN_HOAT_CHAT', 'HOAT_CHAT', 'TEN_INN', 'INN', 'TEN_GENERIC'])
    );
    const tenDong = lamSachChuoiHienThi(dong?.TEN_THUOC || '');
    if (!hoatChat || !tenDong) return false;
    const a = normalizeTextNoAccent(hoatChat).replace(/\s+/g, ' ').trim().toUpperCase();
    const b = normalizeTextNoAccent(tenDong).replace(/\s+/g, ' ').trim().toUpperCase();
    if (!a || !b) return false;
    if (a === b) return true;
    if (b.startsWith(`${a} `) || b.startsWith(`${a}-`)) return true;
    return false;
};

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
    const icdCodes = extractIcdCodesFromClaim(xml1?.MA_BENH_CHINH, xml1?.MA_BENH_KT);
    return icdCodes.some((code) => isIcdInAllowed30DayCatalog(code, ruleSet));
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
    const thongTinThe = layThongTinMucHuongTuThe(xml1.MA_THE_BHYT);

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

const boSungChiTietCanhBaoGiaiTrinh = (hoSo, dsLỗi, dm) => (Array.isArray(dsLỗi) ? dsLỗi : []).map((loi) => {
    const phanHe = UPPER(loi?.phan_he || '');
    const truong = UPPER(loi?.truong_loi || '');
    const maLuat = UPPER(loi?.ma_luat || '');
    let canhBao = lamSachChuoiHienThi(loi?.canh_bao || '');
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
        canh_bao: canhBao,
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
    const namVienNgan = DIFF_HOURS(xml1?.NGAY_VAO, xml1?.NGAY_RA) > 0 && DIFF_HOURS(xml1?.NGAY_VAO, xml1?.NGAY_RA) < 24;
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
        if (ma === 'HC_130' && TO_NUMBER(xml1.SO_NGAY_DTRI) === 0 && namVienNgan) return false;
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
        if (ma === 'THUOC_131' && coCoSoLamSangHoacIcdChoDiosminHesperidin(hoSo, xml1)) return false;
        if (ma === 'THUOC_436' && laHoSoNoiTruTheoQd824(xml1)) return false;
        if (ma === 'THUOC_436' && dong && coTenThuocTrungHoatChatDanhMuc(dong, dm)) return false;
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
        if (ma === 'DVKT-OP-09' && dong && String(dong?.MA_NHOM || '').trim() === '15' && !IS_EMPTY(dong?.MA_GIUONG) && /^K\d+\./.test(String(dong?.MA_DICH_VU || '').trim())) return false;
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
        const thongTinThe = layThongTinMucHuongTuThe(x.MA_THE_BHYT);
        if (thongTinThe.benefitCode && thongTinThe.benefitPercent === null) {
            addLỗi('HC-01c', 'Mã mức hưởng trên thẻ BHYT', `Ký tự mức hưởng trên thẻ BHYT [${thongTinThe.benefitCode}] chưa nằm trong nhóm mã hưởng chuẩn 1-5.`, 'Warning', 'MA_THE_BHYT');
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

    return ds.concat(giamDinhQuyenLoiTheoDoiTuongVaThe(hoSo, dm));
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
            // Kiểm tra giá trúng thầu
            const dmT = dm.MAP_THUOC_BV.get(ma);
            const giaTT = TO_NUMBER(dmT.DON_GIA_THAU || dmT.DON_GIA || dmT.GIA || 0);
            const giaHS = TO_NUMBER(row.DON_GIA);
            if (giaTT > 0 && giaHS > giaTT * 1.001)
                addLỗi('XML2', idx, 'DM-THUOC-04', 'Giá thuốc vượt trúng thầu',
                    `Đơn giá thuốc [${ma}] = ${giaHS.toLocaleString()}đ vượt giá trúng thầu nội bộ ${giaTT.toLocaleString()}đ đã phê duyệt tại cơ sở KCB.`,
                    'Error',
                    'DON_GIA',
                    CO_SO_PHAP_LY_THUOC.NOI_BO_GIA_THAU);
        }
    });

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
    const text = lamSachChuoiHienThi(message);
    const chiTiet = taoNhomChiTietDuyNhat(details).join('; ');
    if (!chiTiet) return text;
    const tokenMessage = UPPER(text).replace(/[^A-Z0-9]/g, '');
    const tokenDetail = UPPER(chiTiet).replace(/[^A-Z0-9]/g, '');
    if (tokenMessage && tokenDetail && tokenMessage.includes(tokenDetail)) return text;
    const ketThuc = text.endsWith('.') ? text : `${text}.`;
    return `${ketThuc} ${label}: ${chiTiet}.`;
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
        const donGia = TO_NUMBER(layGiaTriDanhMuc(dmThuoc, ['DON_GIA_THAU', 'DON_GIA', 'GIA']));
        const tuNgay = layGiaTriDanhMuc(dmThuoc, ['TU_NGAY', 'TUNGAY', 'HD_TU', 'NGAY_HL_TU']);
        const trangThai = layGiaTriDanhMuc(dmThuoc, ['TRANG_THAI', 'TRANGTHAI', 'TINH_TRANG', 'PHE_DUYET', 'DUOC_PHE_DUYET']);

        if (IS_EMPTY(tenThuoc)) {
            addLoi('XML2', 'DMBV-THUOC-01', maThuoc, 'TEN_THUOC',
                `Danh mục thuốc BV mã [${maThuoc}] thiếu TEN_THUOC/HOAT_CHAT, đề xuất bổ sung trước khi đối soát.`);
        }
        if (donGia <= 0) {
            addLoi('XML2', 'DMBV-THUOC-02', maThuoc, 'DON_GIA_THAU',
                `Danh mục thuốc BV mã [${maThuoc}] chưa có DON_GIA_THAU/DON_GIA hợp lệ (>0).`, 'Error');
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
    'XML1', 'XML2', 'XML3', 'XML4', 'XML5', 'XML6', 'XML7', 'XML8', 'XML9', 'XML10', 'XML11', 'XML12', 'XML13', 'XML14', 'XML15',
    'DS_XML1', 'DS_XML2', 'DS_XML3', 'DS_XML4', 'DS_XML5', 'DS_XML6', 'DS_XML7', 'DS_XML8', 'DS_XML9', 'DS_XML10', 'DS_XML11', 'DS_XML12', 'DS_XML13', 'DS_XML14', 'DS_XML15', 'CURRENT', 'NOW', 'TODAY', 'CURRENT_TIMESTAMP',
    'NOT_CONTAINS', 'CONTAINS', 'IN', 'LIKE', 'NULL', 'OR', 'AND', 'Math', 'String', 'includes', 'match', 'true', 'false', 'item', 'RegExp', 'new',
    'MATCH_MA_LOAI_KCB', 'MATCH_ANY_MA_LOAI_KCB'
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
            if (!currentEntry?.maBN || UPPER(currentEntry?.xml1?.MA_LY_DO_VV) === '1') return [];
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
            if (!currentEntry?.maBN || UPPER(currentEntry?.xml1?.MA_LY_DO_VV) !== '1') return [];
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
    if (normalizedTabId === 'LUAT_THUOC' || normalizedTabId === 'XML2') {
        const rowsQuanTri = await taiTheoDanhSachTabUngVien(['LUAT_THUOC', 'XML2']);
        if (rowsQuanTri.length > 0) return rowsQuanTri;
        return layDanhSachLuatThuocHardcoded().map(chuanHoaRuleDong);
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
    return normalizeRuleList(await fetchChunkedData(`CDSS_DATA_${tabId}`)).map(chuanHoaRuleDong);
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
                IS_EMPTY, STARTS_WITH, SUBSTR, TO_NUMBER
            } = ctx;
            const { DM_ICD10, DM_DVKT, DM_THUOC, DM_VTYT, DM_KHOA, PL1_DVKT, PL2_KHAM, PL3_GIUONG, PL4_GIUONG_BN, PL5_THUOC, PL6_THUOC_YHCT, PL7_BENH_YHCT, PL8_VTYT, PL9_MAU, PL10_DOI_TUONG, PL11_CLS, PL12_NHIEN_LIEU } = danhMucHeThong;
            const normalizeMaLoaiKcb = ${normalizeMaLoaiKcb.toString()};
            const layTapMaLoaiKcbTheoGiaTriRule = ${layTapMaLoaiKcbTheoGiaTriRule.toString()};
            const MATCH_MA_LOAI_KCB = ${MATCH_MA_LOAI_KCB.toString()};
            const MATCH_ANY_MA_LOAI_KCB = ${MATCH_ANY_MA_LOAI_KCB.toString()};
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

const evaluateRule = (rule, contextRuleDong, danhMucHeThong) => {
    const ruleMeta = chuanHoaRuleDong(rule);
    if (!ruleMeta) return [];
    if (typeof ruleMeta._specialEvaluator === 'function') {
        return ruleMeta._specialEvaluator(ruleMeta, contextRuleDong, danhMucHeThong) || [];
    }
    let violations = [];
    if (!ruleMeta || ruleMeta._boQuaEngine || typeof ruleMeta._compiledPredicate !== 'function') return [];
    const targetTable = ruleMeta._targetTable;
    const rows = contextRuleDong?.rowsByTable?.[targetTable] || [];
    const preparedRows = contextRuleDong?.preparedRowsByTable?.[targetTable] || [];

    rows.forEach((row, index) => {
        if (!row) return;
        const ctx = { ...contextRuleDong.baseCtx };
        ctx[targetTable] = preparedRows[index] || safeProxy(targetTable === 'XML2' ? enrichXML2Data(row) : prepareData(row));
        ctx['CURRENT'] = ctx[targetTable];
        if (ruleMeta._compiledPredicate(ctx, danhMucHeThong)) {
            violations.push({ phan_he: targetTable, index: targetTable === 'XML1' ? -1 : index,
                truong_loi: ruleMeta._targetField, canh_bao: ruleMeta._canhBao, muc_do: ruleMeta._mucDo,
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
 * V3 API — backward compatible (chỉ chạy luật động NoCode).
 */
export const chayBoMayGiamDinhV3 = async (hoSo, options = {}) => {
    if (!hoSo) return [];
    let danhSachCanhBao = [];
    let danhMucHeThong = null;
    const xml1 = _getXML1(hoSo);
    const laNoiTruDieuTri = laHoSoNoiTruTheoQd824(xml1);
    try {
        danhMucHeThong = await taiDanhMucHeThong();
        const danhSachTabIds = await taiDanhSachTabLuatDong();
        const contextRuleDong = taoNguCanhRuleDong(hoSo, options?.batchContext || null);
        const mapTrangThaiNoiBo = await taiMapTrangThaiQuyTacNoiBo();

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
            const dsLoiDvkt = await chayGiamDinhDvktNoCode(hoSo);
            if (Array.isArray(dsLoiDvkt) && dsLoiDvkt.length > 0) {
                danhSachCanhBao = danhSachCanhBao.concat(dsLoiDvkt);
            }
        } catch (dvktError) {
            console.error('[CDSS Engine V3] Lỗi bộ máy DVKT no-code:', dvktError);
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
    // Thay the {TEN_THUOC}, {DU_QTY}, ... trong canh bao (giong V15 + xuat Excel DS_Loi).
    return boSungChiTietCanhBaoGiaiTrinh(hoSo, danhSachCanhBao, danhMucHeThong || {});
};

export const chayBoMayGiamDinhNhieuHoSoV3 = async (danhSachHoSo = [], options = {}) => {
    const danhSachDauVao = Array.isArray(danhSachHoSo) ? danhSachHoSo : [];
    const ketQua = [];
    const onProgress = typeof options?.onProgress === 'function' ? options.onProgress : null;
    const forceReaudit = options?.forceReaudit !== false;
    const batchContext = taoBatchContextGiamDinh(danhSachDauVao);

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

    // LAYER 0: False Positive Guard
    const xml1Obj = _getXML1(hoSo);
    if (laNguonKhôngPhaBHYT(xml1Obj)) {
        return [{ phan_he: 'XML1', index: -1, truong_loi: 'T_BHTT',
            canh_bao: 'Hồ sơ này không có thanh toán BHYT - bỏ qua toàn bộ kiểm tra BHYT.',
            muc_do: 'Info', ma_luat: 'FPG-00', ten_quy_tac: 'False Positive Guard', dieu_kien: 'BUILT-IN' }];
    }

    // LAYER 1: Hành chính
    allLỗi = allLỗi.concat(giamDinhHanhChinh(hoSo, danhMuc));

    // LAYER 2+3: Danh mục nội bộ BV + BYT
    allLỗi = allLỗi.concat(giamDinhDanhMucNoiBo(hoSo, danhMuc));
    allLỗi = allLỗi.concat(giamDinhChatLuongDanhMucBenhVien(hoSo, danhMuc));

    // LAYER 4: Lâm sàng
    allLỗi = allLỗi.concat(giamDinhThuoc(hoSo, danhMuc));
    allLỗi = allLỗi.concat(giamDinhCDHA(hoSo));
    allLỗi = allLỗi.concat(giamDinhGiuong(hoSo, danhMuc));
    allLỗi = allLỗi.concat(giamDinhPTTT(hoSo));
    allLỗi = allLỗi.concat(giamDinhChuyenTuyen(hoSo));
    allLỗi = allLỗi.concat(giamDinhTongChiPhi(hoSo, danhMuc));

    // LAYER 5: Luật động NoCode
    allLỗi = allLỗi.concat(await chayBoMayGiamDinhV3(hoSo));

    // Áp ON/OFF nội bộ cho mọi cảnh báo có ma_luat (gồm luật động + CHUYEN_DE_* / CDHA_* cứng, kể cả dieu_kien không phải BUILT-IN).
    const mapTrangThaiNoiBo = await taiMapTrangThaiQuyTacNoiBo();
    allLỗi = locCanhBaoTheoTrangThaiQuyTacNoiBo(allLỗi, mapTrangThaiNoiBo, { chiLocCanhBaoNoiBo: true });

    // Bo sung co so phap ly mac dinh cho cac quy tac chua khai bao can cu.
    allLỗi = boSungCoSoPhapLyMacDinh(allLỗi);
    allLỗi = boSungNamespaceVaGiaiTrinhQuyTac(allLỗi);

    // Hậu lọc: giảm dương tính giả theo ngữ cảnh hồ sơ thực tế.
    allLỗi = locCanhBaoDuongTinhGiaTheoNguCanh(hoSo, allLỗi, danhMuc);

    // Lọc trùng
    const seen = new Set();
    const ketQua = allLỗi.filter(loi => {
        const key = taoKhoaLocTrungCanhBao(loi);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });

    const ketQuaCoChiTiet = boSungChiTietCanhBaoGiaiTrinh(hoSo, ketQua, danhMuc);

    // Sắp xếp theo mức độ
    const ORDER = { Critical: 0, Error: 1, Warning: 2, Info: 3 };
    ketQuaCoChiTiet.sort((a, b) => (ORDER[a.muc_do] ?? 9) - (ORDER[b.muc_do] ?? 9));
    return ketQuaCoChiTiet;
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
