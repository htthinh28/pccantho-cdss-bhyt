/**
 * ============================================================================
 * AUDITING ENGINE V15.0 - BỘ MÁY GIÁM ĐỊNH TOÀN DIỆN BHYT
 * KIẾN TRÚC 5 LỚP: HÀNH CHÍNH → DANH MỤC BV → DANH MỤC BYT → LÂM SÀNG → LUẬT ĐỘNG
 * ============================================================================
 * V15 Enhancements:
 * - [LAYER 0] Bộ lọc Dương tính giả: loại trừ khoản không thuộc BHYT
 * - [LAYER 1] Giám định hành chính XML1: HC-01 đến HC-10
 * - [LAYER 2] Đối soát Danh mục Bệnh viện 2 giai đoạn (BV → BYT)
 * - [LAYER 3] Kiểm tra giá trúng thầu, số lượng hợp lý
 * - [LAYER 4] Giám định lâm sàng: thuốc, CDHA, giường, PTTT, chuyển tuyến, tổng chi
 * - [LAYER 5] Luật động NoCode (SQL NLP parser - giữ nguyên từ V14)
 * - Lọc trùng lặp + sắp xếp theo mức độ cuối pipeline
 * ============================================================================
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================================
// [PHẦN 1] CACHE VÀ HÀM TIỆN ÍCH CƠ BẢN
// ============================================================
let cache_DanhMucHeThong = null;
let cache_LuatGiamDinh = {};

export const xoaCacheBoMayGiamDinh = () => {
    cache_DanhMucHeThong = null;
    cache_LuatGiamDinh = {};
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
const COUNT_IF = (arr, conditionFn) => {
    if (!Array.isArray(arr)) return 0;
    return arr.filter(item => { try { return conditionFn(item); } catch { return false; } }).length;
};

// ============================================================
// [PHẦN 2] CHUẨN HÓA VÀ XỬ LÝ DỮ LIỆU
// ============================================================
const parseLieuDungThuoc = (lieuDungText, soLuongXuat) => {
    let tanSuat = 0, slMoiLan = 0, slMoiNgay = 0, soNgay = 0;
    let text = String(lieuDungText || "").toLowerCase();
    const slTong = TO_NUMBER(soLuongXuat);
    const extractDose = (timeKeyword) => {
        const regex = new RegExp(`${timeKeyword}.*?(\\d+(?:[.,]\\d+)?)`, 'i');
        const m = text.match(regex);
        return m ? parseFloat(m[1].replace(',', '.')) : 0;
    };
    const sang = extractDose('s[aá]ng'), trua = extractDose('tr[uư]a');
    const chieu = extractDose('chi[eề]u'), toi = extractDose('t[oố]i');
    slMoiNgay = sang + trua + chieu + toi;
    if (sang > 0) tanSuat++; if (trua > 0) tanSuat++;
    if (chieu > 0) tanSuat++; if (toi > 0) tanSuat++;
    if (tanSuat > 0) slMoiLan = slMoiNgay / tanSuat;
    if (slMoiNgay === 0) {
        const matchNgayLan = text.match(/ng[aà]y.*?(?:u[oố]ng|d[uù]ng|ti[eê]m|nh[oỏ]).*?(\d+(?:[.,]\d+)?).*?l[aầ]n/i);
        const matchMoiLan = text.match(/m[oỗ]i l[aầ]n.*?(\d+(?:[.,]\d+)?)/i);
        if (matchNgayLan) tanSuat = parseFloat(matchNgayLan[1].replace(',','.'));
        if (matchMoiLan) slMoiLan = parseFloat(matchMoiLan[1].replace(',','.'));
        if (tanSuat > 0 && slMoiLan > 0) {
            slMoiNgay = tanSuat * slMoiLan;
        } else if (text.includes('/ngày') || text.includes('1 ngày')) {
            const matchVienNgay = text.match(/(\d+(?:[.,]\d+)?).*?(?:vi[eê]n|l[oọ]|[oố]ng|g[oó]i|chai|b[oơ]m).*?ng[aà]y/i);
            if (matchVienNgay) { slMoiNgay = parseFloat(matchVienNgay[1].replace(',','.')); tanSuat = 1; slMoiLan = slMoiNgay; }
        }
    }
    if (slMoiNgay > 0) soNgay = slTong / slMoiNgay;
    return { TAN_SUAT: tanSuat, SL_MOI_LAN: slMoiLan, SL_MOI_NGAY: slMoiNgay, CALC_SL_MOI_NGAY: slMoiNgay, SO_NGAY: soNgay };
};

const layGiaTriAnToan = (obj, tuKhoa) => {
    if (!obj) return '';
    const tuKhoaChuan = tuKhoa.toLowerCase().replace(/_/g, '');
    const keyTimThay = Object.keys(obj).find(k => k.toLowerCase().replace(/_/g, '') === tuKhoaChuan);
    return keyTimThay && obj[keyTimThay] ? obj[keyTimThay] : '';
};

const standardizeValue = (val, keyName) => {
    if (val === null || val === undefined) return "";
    let cleaned = String(val).replace(/<!\[CDATA\[(.*?)\]\]>/is, '$1').trim();
    const keyUpper = String(keyName || "").toUpperCase();
    const codePrefixes = ['MA_', 'SO_', 'NGAY_'];
    if (codePrefixes.some(p => keyUpper.startsWith(p)) && !keyUpper.includes('TEN') && !keyUpper.includes('DIA_CHI') && !keyUpper.includes('GHI_CHU')) {
        cleaned = cleaned.replace(/\s+/g, '');
    }
    const numericKeys = ['T_THUOC','T_VTYT','T_DVKT','T_KHAM','T_GIUONG','T_PTTT','T_XN','T_CDHA','T_TONGCHI','T_BHTT','T_BNCCT','T_NGUONKHAC','SO_LUONG','DON_GIA','THANH_TIEN','TYLE_TT','MUC_HUONG','T_TRANTT','SO_NGAY_DTRI'];
    if (numericKeys.includes(keyUpper) && cleaned !== "" && !isNaN(cleaned)) return parseFloat(cleaned);
    return cleaned;
};

const prepareData = (obj) => {
    if (!obj || typeof obj !== 'object') return {};
    let result = {};
    for (let k in obj) result[k] = standardizeValue(obj[k], k);
    return result;
};

const enrichXML2Data = (row) => {
    const base = prepareData(row);
    return { ...base, ...parseLieuDungThuoc(base.LIEU_DUNG, base.SO_LUONG) };
};

const safeProxy = (obj) => new Proxy(obj, { get: (t, p) => p in t ? t[p] : "" });

const fetchChunkedData = async (key) => {
    try {
        const chunksStr = await AsyncStorage.getItem(`${key}_CHUNKS`);
        if (chunksStr) {
            const totalChunks = parseInt(chunksStr, 10);
            let fullData = [];
            for (let i = 0; i < totalChunks; i++) {
                const chunkStr = await AsyncStorage.getItem(`${key}_CHUNK_${i}`);
                if (chunkStr) fullData = fullData.concat(JSON.parse(chunkStr));
            }
            return fullData;
        }
        const raw = await AsyncStorage.getItem(key);
        return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
};

// ============================================================
// [PHẦN 3] TẢI DANH MỤC BV + BYT → MAP O(1)
// ============================================================
const taiDanhMucHeThong = async () => {
    if (cache_DanhMucHeThong) return cache_DanhMucHeThong;
    try {
        const [icd10, dvkt, thuoc, vtyt, khoa] = await Promise.all([
            AsyncStorage.getItem('DANH_MUC_ICD10'),
            AsyncStorage.getItem('DANH_MUC_DVKT_M05'),
            AsyncStorage.getItem('DANH_MUC_THUOC_MAU_M03'),
            AsyncStorage.getItem('DANH_MUC_VAT_TU_M04'),
            AsyncStorage.getItem('DANH_MUC_KHOA_LS_M01')
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

        const dvktArr = dvkt ? JSON.parse(dvkt) : [];
        const thuocArr = thuoc ? JSON.parse(thuoc) : [];
        const vtytArr = vtyt ? JSON.parse(vtyt) : [];
        const icd10Arr = icd10 ? JSON.parse(icd10) : [];
        const khoaArr = khoa ? JSON.parse(khoa) : [];

        cache_DanhMucHeThong = {
            // Arrays for NLP engine (backward compatible)
            DM_ICD10: icd10Arr.map(i => i['MÃ BỆNH'] || i['MA_BENH'] || ''),
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
            PL10_DOI_TUONG: pl10.map(i => i['MÃ ĐỐI TƯỢNG'] || i['MA_DOI_TUONG'] || ''),
            PL11_CLS: pl11.map(i => i['MÃ DỊCH VỤ'] || i['MA_DVKT'] || ''),
            PL12_NHIEN_LIEU: pl12.map(i => i['MÃ NHIÊN LIỆU'] || i['MA_NHIEN_LIEU'] || ''),
            // Maps O(1) BV nội bộ
            MAP_DVKT_BV: buildMap(dvktArr, 'MA_DICH_VU'),
            MAP_THUOC_BV: buildMap(thuocArr, 'MA_THUOC'),
            MAP_VTYT_BV: buildMap(vtytArr, 'MA_VAT_TU'),
            MAP_ICD10: buildMap(icd10Arr, 'MÃ BỆNH'),
            MAP_KHOA_BV: buildMap(khoaArr, 'MA_KHOA'),
            // Maps O(1) BYT
            MAP_BYT_PL1: buildMapMulti(pl1, 'MÃ BỘ Y TẾ', 'MA_DVKT'),
            MAP_BYT_PL5: buildMapMulti(pl5, 'MÃ THUỐC', 'MA_THUOC'),
            MAP_BYT_PL8: buildMapMulti(pl8, 'MÃ VẬT TƯ', 'MA_VTYT'),
            MAP_BYT_PL11: buildMapMulti(pl11, 'MÃ DỊCH VỤ', 'MA_DVKT'),
        };
        return cache_DanhMucHeThong;
    } catch (e) {
        return {
            DM_ICD10:[], DM_DVKT:[], DM_THUOC:[], DM_VTYT:[], DM_KHOA:[],
            PL1_DVKT:[],PL2_KHAM:[],PL3_GIUONG:[],PL4_GIUONG_BN:[],PL5_THUOC:[],
            PL6_THUOC_YHCT:[],PL7_BENH_YHCT:[],PL8_VTYT:[],PL9_MAU:[],
            PL10_DOI_TUONG:[],PL11_CLS:[],PL12_NHIEN_LIEU:[],
            MAP_DVKT_BV: new Map(), MAP_THUOC_BV: new Map(), MAP_VTYT_BV: new Map(),
            MAP_ICD10: new Map(), MAP_KHOA_BV: new Map(),
            MAP_BYT_PL1: new Map(), MAP_BYT_PL5: new Map(), MAP_BYT_PL8: new Map(), MAP_BYT_PL11: new Map()
        };
    }
};


// ============================================================
// [PHẦN 4] LAYER 0: BỘ LỌC DƯƠNG TÍNH GIẢ (FALSE POSITIVE GUARD)
// ============================================================

/** TRUE nếu dòng chi này KHÔNG do BHYT thanh toán → bỏ qua giám định */
const laBHYTKhongThanhToan = (row) => {
    if (!row) return true;
    const nguon = UPPER(row.NGUON_CTRA || row.NGUON_THANH_TOAN || '');
    if (nguon && nguon !== 'BHYT' && nguon !== '1') return true;
    const mucHuong = TO_NUMBER(row.MUC_HUONG);
    if (!IS_EMPTY(row.MUC_HUONG) && mucHuong === 0) return true;
    return false;
};

/** TRUE nếu toàn bộ hồ sơ không có thanh toán BHYT */
const laNguonKhongPhaBHYT = (xml1) => {
    if (!xml1) return false;
    const tBhtt = TO_NUMBER(xml1.T_BHTT);
    const tNguonKhac = TO_NUMBER(xml1.T_NGUONKHAC);
    const tTongChi = TO_NUMBER(xml1.T_TONGCHI_BV);
    const tBncct = TO_NUMBER(xml1.T_BNCCT);
    return tBhtt === 0 && tNguonKhac > 0 && tTongChi > 0 && tBncct === 0;
};

// ============================================================
// [PHẦN 5] LAYER 1: GIÁM ĐỊNH HÀNH CHÍNH (XML1) — HC-01..HC-10
// ============================================================
const giamDinhHanhChinh = (xml1Raw, dm) => {
    const ds = [];
    if (!xml1Raw) return ds;
    const x = prepareData(Array.isArray(xml1Raw) ? xml1Raw[0] : xml1Raw);

    const addLoi = (maLuat, ten, noi_dung, muc_do, truong) => ds.push({
        phan_he: 'XML1', index: -1, truong_loi: truong || maLuat,
        canh_bao: noi_dung, muc_do, ma_luat: maLuat, ten_quy_tac: ten, dieu_kien: 'BUILT-IN'
    });

    // HC-01: Mã thẻ BHYT
    if (IS_EMPTY(x.MA_THE_BHYT)) {
        addLoi('HC-01', 'Mã thẻ BHYT', 'Mã thẻ BHYT không được để trống (TT 09/2019/TT-BYT).', 'Critical', 'MA_THE_BHYT');
    } else if (!/^[A-Z]{2}\d{13}$/.test(String(x.MA_THE_BHYT).replace(/\s/g,'').toUpperCase())) {
        addLoi('HC-01b', 'Định dạng thẻ BHYT', `Mã thẻ [${x.MA_THE_BHYT}] không đúng định dạng (2 chữ + 13 số).`, 'Error', 'MA_THE_BHYT');
    }

    // HC-02: Họ tên
    if (IS_EMPTY(x.HO_TEN) || LEN(x.HO_TEN) < 2)
        addLoi('HC-02', 'Họ tên bệnh nhân', 'Họ tên bệnh nhân trống hoặc không hợp lệ.', 'Critical', 'HO_TEN');

    // HC-03: MA_LK
    if (IS_EMPTY(x.MA_LK))
        addLoi('HC-03', 'Mã lần khám', 'Mã lần khám (MA_LK) không được để trống.', 'Critical', 'MA_LK');

    // HC-04: Ngày vào/ra
    if (IS_EMPTY(x.NGAY_VAO)) {
        addLoi('HC-04', 'Ngày vào viện', 'Ngày vào viện không được để trống.', 'Critical', 'NGAY_VAO');
    } else if (!IS_EMPTY(x.NGAY_RA) && DIFF_DAYS(x.NGAY_VAO, x.NGAY_RA) < 0) {
        addLoi('HC-04b', 'Logic Ngày vào/ra', `Ngày ra [${x.NGAY_RA}] trước Ngày vào [${x.NGAY_VAO}].`, 'Critical', 'NGAY_RA');
    }

    // HC-05: Hiệu lực thẻ
    if (!IS_EMPTY(x.GT_THE_TU) && !IS_EMPTY(x.GT_THE_DEN) && !IS_EMPTY(x.NGAY_VAO)) {
        if (DIFF_DAYS(x.GT_THE_TU, x.NGAY_VAO) < 0)
            addLoi('HC-05', 'Hiệu lực thẻ', `Ngày vào [${x.NGAY_VAO}] trước ngày hiệu lực thẻ [${x.GT_THE_TU}].`, 'Critical', 'GT_THE_TU');
        if (DIFF_DAYS(x.NGAY_VAO, x.GT_THE_DEN) < 0)
            addLoi('HC-05b', 'Hiệu lực thẻ', `Ngày vào [${x.NGAY_VAO}] sau ngày hết hạn thẻ [${x.GT_THE_DEN}] (Điều 27 Luật BHYT).`, 'Critical', 'GT_THE_DEN');
    }

    // HC-06: Đối tượng KCB
    const DOI_TUONG_HOP_LE = ['1','2','3','4','5','6','7','8','9','10','11','12','13','14'];
    if (!IS_EMPTY(x.MA_DOITUONG_KCB) && !DOI_TUONG_HOP_LE.includes(String(x.MA_DOITUONG_KCB).trim()))
        addLoi('HC-06', 'Đối tượng KCB', `Mã đối tượng KCB [${x.MA_DOITUONG_KCB}] không hợp lệ (QĐ 130/QĐ-BYT).`, 'Warning', 'MA_DOITUONG_KCB');

    // HC-07: Chẩn đoán ICD-10
    if (IS_EMPTY(x.MA_BEN_CHINH)) {
        addLoi('HC-07', 'Chẩn đoán ICD-10', 'Mã bệnh chính (MA_BEN_CHINH) không được để trống.', 'Critical', 'MA_BEN_CHINH');
    } else if (dm.MAP_ICD10 && dm.MAP_ICD10.size > 0 && !dm.MAP_ICD10.has(UPPER(x.MA_BEN_CHINH))) {
        addLoi('HC-07b', 'Chẩn đoán ICD-10', `Mã bệnh chính [${x.MA_BEN_CHINH}] không có trong danh mục ICD-10 của BYT.`, 'Error', 'MA_BEN_CHINH');
    }

    // HC-08: Số ngày điều trị
    const soNgay = TO_NUMBER(x.SO_NGAY_DTRI);
    if (!IS_EMPTY(x.SO_NGAY_DTRI)) {
        if (soNgay < 0)
            addLoi('HC-08', 'Số ngày ĐT', `Số ngày điều trị [${x.SO_NGAY_DTRI}] âm.`, 'Error', 'SO_NGAY_DTRI');
        else if (!IS_EMPTY(x.NGAY_VAO) && !IS_EMPTY(x.NGAY_RA)) {
            const tinh = DIFF_DAYS(x.NGAY_VAO, x.NGAY_RA);
            if (Math.abs(soNgay - tinh) > 1)
                addLoi('HC-08b', 'Số ngày ĐT', `Số ngày khai [${soNgay}] không khớp tính từ ngày vào/ra [${tinh}].`, 'Warning', 'SO_NGAY_DTRI');
        }
    }

    // HC-09: Tổng chi phí
    const tTong = TO_NUMBER(x.T_TONGCHI_BV);
    if (!IS_EMPTY(x.T_TONGCHI_BV) && tTong <= 0)
        addLoi('HC-09', 'Tổng chi phí', 'T_TONGCHI_BV phải lớn hơn 0.', 'Error', 'T_TONGCHI_BV');

    // HC-10: Cân bằng tài chính
    const tBhtt = TO_NUMBER(x.T_BHTT), tBncct = TO_NUMBER(x.T_BNCCT), tNK = TO_NUMBER(x.T_NGUONKHAC);
    if (!IS_EMPTY(x.T_TONGCHI_BV) && (tBhtt + tBncct + tNK) > 0) {
        const chenh = Math.abs(tTong - (tBhtt + tBncct + tNK));
        if (chenh > tTong * 0.001 && chenh > 1000)
            addLoi('HC-10', 'Cân bằng tài chính', `T_TONGCHI [${tTong.toLocaleString()}] ≠ BHTT+BNCCT+NK [${(tBhtt+tBncct+tNK).toLocaleString()}]. Chênh: ${chenh.toLocaleString()}đ.`, 'Warning', 'T_TONGCHI_BV');
    }

    return ds;
};

// ============================================================
// [PHẦN 6] LAYER 2+3: ĐỐI SOÁT DANH MỤC NỘI BỘ BV + BYT
// ============================================================
const giamDinhDanhMucNoiBo = (hoSo, dm) => {
    const ds = [];
    const xml2 = hoSo.XML2 || hoSo.xml2 || [];
    const xml3 = hoSo.XML3 || hoSo.xml3 || [];

    const addLoi = (bang, idx, maLuat, ten, canh_bao, muc_do, truong) => ds.push({
        phan_he: bang, index: idx, truong_loi: truong,
        canh_bao, muc_do, ma_luat: maLuat, ten_quy_tac: ten, dieu_kien: 'BUILT-IN'
    });

    // --- XML2: THUỐC ---
    xml2.forEach((row, idx) => {
        if (laBHYTKhongThanhToan(row)) return;
        const ma = UPPER(row.MA_THUOC || '');
        if (!ma) return;
        const hasBV = dm.MAP_THUOC_BV && dm.MAP_THUOC_BV.size > 0;
        const hasBYT = dm.MAP_BYT_PL5 && dm.MAP_BYT_PL5.size > 0;
        const trongBV = hasBV ? dm.MAP_THUOC_BV.has(ma) : null;
        const trongBYT = hasBYT ? dm.MAP_BYT_PL5.has(ma) : null;

        if (trongBV === false) {
            if (trongBYT === true)
                addLoi('XML2', idx, 'DM-THUOC-01', 'Thuốc ngoài DM BV',
                    `⚠️ XUẤT TOÁN: Thuốc [${ma}] có trong DM BYT (QĐ 7603) nhưng BV CHƯA ký hợp đồng/phê duyệt (TT 15/2023/TT-BYT Điều 6).`, 'Critical', 'MA_THUOC');
            else if (trongBYT === false)
                addLoi('XML2', idx, 'DM-THUOC-02', 'Thuốc ngoài cả hai DM',
                    `⚠️ XUẤT TOÁN: Thuốc [${ma}] KHÔNG có trong DM BV lẫn DM BYT (QĐ 7603). Không được thanh toán BHYT.`, 'Critical', 'MA_THUOC');
            else
                addLoi('XML2', idx, 'DM-THUOC-03', 'Cần xác minh thuốc',
                    `Thuốc [${ma}] chưa xác minh được trong DM nội bộ. Đề nghị cập nhật danh mục BV.`, 'Warning', 'MA_THUOC');
        } else if (trongBV === true) {
            // Kiểm tra giá trúng thầu
            const dmT = dm.MAP_THUOC_BV.get(ma);
            const giaTT = TO_NUMBER(dmT.DON_GIA_THAU || dmT.DON_GIA || dmT.GIA || 0);
            const giaHS = TO_NUMBER(row.DON_GIA);
            if (giaTT > 0 && giaHS > giaTT * 1.001)
                addLoi('XML2', idx, 'DM-THUOC-04', 'Giá thuốc vượt trúng thầu',
                    `Đơn giá thuốc [${ma}] = ${giaHS.toLocaleString()}đ vượt giá trúng thầu ${giaTT.toLocaleString()}đ (TT 15/2023 Điều 8).`, 'Error', 'DON_GIA');
        }
    });

    // --- XML3: DVKT ---
    xml3.forEach((row, idx) => {
        if (laBHYTKhongThanhToan(row)) return;
        const ma = UPPER(row.MA_DICH_VU || '');
        if (!ma) return;
        const hasBV = dm.MAP_DVKT_BV && dm.MAP_DVKT_BV.size > 0;
        const trongBV = hasBV ? dm.MAP_DVKT_BV.has(ma) : null;
        const trongBYT = (dm.MAP_BYT_PL1 && dm.MAP_BYT_PL1.has(ma)) || (dm.MAP_BYT_PL11 && dm.MAP_BYT_PL11.has(ma));

        if (trongBV === false) {
            if (trongBYT)
                addLoi('XML3', idx, 'DM-DVKT-01', 'DVKT ngoài DM BV',
                    `⚠️ XUẤT TOÁN: Dịch vụ [${ma}] có trong DM BYT nhưng BV CHƯA phê duyệt/đủ điều kiện (TT 39/2024/TT-BYT Điều 5).`, 'Critical', 'MA_DICH_VU');
            else if (dm.MAP_BYT_PL1 && dm.MAP_BYT_PL1.size > 0)
                addLoi('XML3', idx, 'DM-DVKT-02', 'DVKT ngoài cả hai DM',
                    `⚠️ XUẤT TOÁN: Dịch vụ [${ma}] KHÔNG có trong DM BV lẫn DM BYT (QĐ 7603). Không được thanh toán BHYT.`, 'Critical', 'MA_DICH_VU');
            else
                addLoi('XML3', idx, 'DM-DVKT-03', 'Cần xác minh DVKT',
                    `Dịch vụ [${ma}] chưa xác minh trong DM nội bộ. Đề nghị cập nhật danh mục BV.`, 'Warning', 'MA_DICH_VU');
        } else if (trongBV === true) {
            const dmDV = dm.MAP_DVKT_BV.get(ma);
            const giaHD = TO_NUMBER(dmDV.DON_GIA_BV || dmDV.DON_GIA || dmDV.GIA || 0);
            const giaHS = TO_NUMBER(row.DON_GIA_BV);
            if (giaHD > 0 && giaHS > giaHD * 1.001)
                addLoi('XML3', idx, 'DM-DVKT-04', 'Đơn giá DVKT vượt hợp đồng',
                    `Đơn giá DVKT [${ma}] = ${giaHS.toLocaleString()}đ vượt giá HĐ BV ${giaHD.toLocaleString()}đ (TT 39/2024/TT-BYT).`, 'Error', 'DON_GIA_BV');
        }
    });

    return ds;
};

// ============================================================
// [PHẦN 7] LAYER 4: GIÁM ĐỊNH LÂM SÀNG CHI TIẾT
// ============================================================

const _getXML1 = (hoSo) => prepareData(Array.isArray(hoSo.XML1 || hoSo.xml1) ? (hoSo.XML1 || hoSo.xml1)[0] : (hoSo.XML1 || hoSo.xml1));

const giamDinhThuoc = (hoSo) => {
    const ds = [];
    const xml2 = hoSo.XML2 || hoSo.xml2 || [];
    const soNgayDtri = TO_NUMBER(_getXML1(hoSo).SO_NGAY_DTRI) || 1;
    const maThuocMap = new Map();

    xml2.forEach((row, idx) => {
        if (laBHYTKhongThanhToan(row)) return;
        const e = enrichXML2Data(row);
        const ma = UPPER(e.MA_THUOC || '');

        if (ma) {
            if (maThuocMap.has(ma))
                ds.push({ phan_he: 'XML2', index: idx, truong_loi: 'MA_THUOC',
                    canh_bao: `Thuốc [${ma}] trùng lặp (dòng ${maThuocMap.get(ma)+1} & ${idx+1}). Có thể kê trùng đơn (TT 52/2017/TT-BYT).`,
                    muc_do: 'Warning', ma_luat: 'CLN-THUOC-01', ten_quy_tac: 'Trùng thuốc', dieu_kien: 'BUILT-IN' });
            else maThuocMap.set(ma, idx);
        }

        if (TO_NUMBER(e.SO_LUONG) <= 0)
            ds.push({ phan_he: 'XML2', index: idx, truong_loi: 'SO_LUONG',
                canh_bao: `Số lượng thuốc [${ma}] = ${e.SO_LUONG} không hợp lệ.`,
                muc_do: 'Error', ma_luat: 'CLN-THUOC-02', ten_quy_tac: 'Số lượng thuốc', dieu_kien: 'BUILT-IN' });

        if (e.SL_MOI_NGAY > 0 && e.SO_NGAY > soNgayDtri + 1)
            ds.push({ phan_he: 'XML2', index: idx, truong_loi: 'LIEU_DUNG',
                canh_bao: `Số ngày dùng thuốc [${ma}] ước tính ${Math.round(e.SO_NGAY)} ngày > số ngày ĐT [${soNgayDtri}] (TT 52/2017/TT-BYT Điều 7).`,
                muc_do: 'Warning', ma_luat: 'CLN-THUOC-03', ten_quy_tac: 'Số ngày dùng thuốc', dieu_kien: 'BUILT-IN' });
    });
    return ds;
};

const giamDinhCDHA = (hoSo) => {
    const ds = [];
    const xml3 = hoSo.XML3 || hoSo.xml3 || [];
    const cdhaMap = new Map();

    xml3.forEach((row, idx) => {
        if (laBHYTKhongThanhToan(row)) return;
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

const giamDinhGiuong = (hoSo) => {
    const ds = [];
    const xml3 = hoSo.XML3 || hoSo.xml3 || [];
    const soNgayDtri = TO_NUMBER(_getXML1(hoSo).SO_NGAY_DTRI);
    if (soNgayDtri <= 0) return ds;

    let tongGiuong = 0;
    xml3.forEach(r => {
        const maDV = UPPER(r.MA_DICH_VU || '');
        if (maDV.startsWith('19') || UPPER(r.NHOM_DV||'').includes('GIƯỜNG') || UPPER(r.TEN_DICH_VU||'').includes('GIƯỜNG'))
            tongGiuong += TO_NUMBER(r.SO_LUONG);
    });

    if (tongGiuong > 0 && Math.abs(tongGiuong - soNgayDtri) > 1)
        ds.push({ phan_he: 'XML1', index: -1, truong_loi: 'SO_NGAY_DTRI',
            canh_bao: `Tổng ngày giường XML3 [${tongGiuong}] không khớp SO_NGAY_DTRI XML1 [${soNgayDtri}]. Chênh ${Math.abs(tongGiuong-soNgayDtri)} ngày (QĐ 130 khoản 3.2).`,
            muc_do: 'Warning', ma_luat: 'CLN-GIUONG-01', ten_quy_tac: 'Số ngày giường', dieu_kien: 'BUILT-IN' });
    return ds;
};

const giamDinhPTTT = (hoSo) => {
    const ds = [];
    const xml1 = _getXML1(hoSo);
    const xml3 = hoSo.XML3 || hoSo.xml3 || [];
    const maPTTT = UPPER(xml1.MA_PTTT_QT || '');
    if (!maPTTT) return ds;

    const coRowPTTT = xml3.some(r => {
        const maDV = UPPER(r.MA_DICH_VU || '');
        return maDV.startsWith('43') || maDV.startsWith('44') || UPPER(r.NHOM_DV||'').includes('PTTT');
    });
    if (!coRowPTTT)
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
                canh_bao: `Loại ra viện [${maLoaiRV}] (chuyển tuyến) nhưng GIAY_CHUYEN_TUYEN trống (TT 40/2015/TT-BYT).`,
                muc_do: 'Error', ma_luat: 'CLN-CT-01', ten_quy_tac: 'Giấy chuyển tuyến', dieu_kien: 'BUILT-IN' });
        if (IS_EMPTY(xml1.MA_NOI_DI))
            ds.push({ phan_he: 'XML1', index: -1, truong_loi: 'MA_NOI_DI',
                canh_bao: 'Trường hợp chuyển tuyến nhưng MA_NOI_DI trống.',
                muc_do: 'Warning', ma_luat: 'CLN-CT-02', ten_quy_tac: 'Mã nơi chuyển đến', dieu_kien: 'BUILT-IN' });
    }
    return ds;
};

const giamDinhTongChiPhi = (hoSo) => {
    const ds = [];
    const xml1 = _getXML1(hoSo);
    const xml2 = hoSo.XML2 || hoSo.xml2 || [];
    const xml3 = hoSo.XML3 || hoSo.xml3 || [];
    const NGUONG = 1000;

    let tongThuoc = 0;
    xml2.forEach(r => { if (!laBHYTKhongThanhToan(r)) tongThuoc += TO_NUMBER(r.THANH_TIEN); });
    let tongDVKT = 0;
    xml3.forEach(r => { if (!laBHYTKhongThanhToan(r)) tongDVKT += TO_NUMBER(r.THANH_TIEN_BV); });

    const tThuoc = TO_NUMBER(xml1.T_THUOC);
    const tVTYT = TO_NUMBER(xml1.T_VTYT);

    if (xml2.length > 0 && tThuoc > 0 && Math.abs(tongThuoc - tThuoc) > NGUONG)
        ds.push({ phan_he: 'XML1', index: -1, truong_loi: 'T_THUOC',
            canh_bao: `T_THUOC XML1 [${tThuoc.toLocaleString()}đ] ≠ tổng XML2 [${tongThuoc.toLocaleString()}đ]. Chênh: ${Math.abs(tongThuoc-tThuoc).toLocaleString()}đ.`,
            muc_do: 'Error', ma_luat: 'CLN-CHI-01', ten_quy_tac: 'Đối chiếu tổng tiền thuốc', dieu_kien: 'BUILT-IN' });

    if (xml3.length > 0 && tVTYT > 0 && Math.abs(tongDVKT - tVTYT) > NGUONG)
        ds.push({ phan_he: 'XML1', index: -1, truong_loi: 'T_VTYT',
            canh_bao: `T_VTYT XML1 [${tVTYT.toLocaleString()}đ] ≠ tổng XML3 [${tongDVKT.toLocaleString()}đ]. Chênh: ${Math.abs(tongDVKT-tVTYT).toLocaleString()}đ.`,
            muc_do: 'Error', ma_luat: 'CLN-CHI-02', ten_quy_tac: 'Đối chiếu tổng tiền DVKT', dieu_kien: 'BUILT-IN' });

    return ds;
};

// ============================================================
// [PHẦN 8] LAYER 5: ĐỘNG CƠ GIÁM ĐỊNH ĐỘNG (NLP SQL PARSER — V14)
// ============================================================
const evaluateRule = (rule, hoSo, danhMucHeThong) => {
    let violations = [];
    const conditionStr = String(layGiaTriAnToan(rule, 'dieukien')).trim();
    const maLuat = String(layGiaTriAnToan(rule, 'maluat')).trim() || 'N/A';
    const tenQuyTac = String(layGiaTriAnToan(rule, 'tenquytac')).trim() || 'N/A';
    const canhBao = String(layGiaTriAnToan(rule, 'canhbao')).trim() || 'Vi phạm quy tắc';
    const mucDo = String(layGiaTriAnToan(rule, 'mucdo') || layGiaTriAnToan(rule, 'cannang') || 'Warning').trim();

    let targetTable = String(layGiaTriAnToan(rule, 'phanhe')).trim().toUpperCase();
    if (!conditionStr) return [];
    if (!targetTable || targetTable === 'N/A') {
        if (conditionStr.includes('XML6.')) targetTable = 'XML6';
        else if (conditionStr.includes('XML5.')) targetTable = 'XML5';
        else if (conditionStr.includes('XML4.')) targetTable = 'XML4';
        else if (conditionStr.includes('XML3.')) targetTable = 'XML3';
        else if (conditionStr.includes('XML2.')) targetTable = 'XML2';
        else targetTable = 'XML1';
    }
    const fieldMatch = conditionStr.match(/XML\d+\.([A-Z0-9_]+)/i);
    const targetField = fieldMatch ? fieldMatch[1] : 'UNKNOWN';

    let jsQuery = conditionStr;
    jsQuery = jsQuery.replace(/[\u200B-\u200D\uFEFF]/g,' ').replace(/\r?\n|\r/g,' ');
    jsQuery = jsQuery.replace(/[\u2018\u2019\u00b4\u0060]/g,"'").replace(/[\u201c\u201d\u2033\u00ab]/g,'"');
    jsQuery = jsQuery.replace(/\s+/g,' ').trim().replace(/\(\?i\)/gi,'');
    jsQuery = jsQuery.replace(/COUNT_IF\s*\(\s*([A-Za-z0-9_]+)\s+WHERE\s+/gi,'COUNT_IF($1, ');
    jsQuery = jsQuery.replace(/\bkhông chứa\b/gi,'NOT_CONTAINS').replace(/\bchứa\b/gi,'CONTAINS');
    jsQuery = jsQuery.replace(/\btrùng với\b/gi,'==').replace(/\btrùng\b/gi,'==').replace(/\bbằng\b/gi,'==');
    jsQuery = jsQuery.replace(/\bkhác\b/gi,'!=').replace(/\bkhông tồn tại\b/gi,'IS_EMPTY').replace(/\btồn tại\b/gi,'NOT_EMPTY');
    jsQuery = jsQuery.replace(/==/g,'##TEQ##').replace(/!=/g,'##TNEQ##').replace(/>=/g,'##TGTE##').replace(/<=/g,'##TLTE##');
    jsQuery = jsQuery.replace(/=/g,'==');
    jsQuery = jsQuery.replace(/##TEQ##/g,'==').replace(/##TNEQ##/g,'!=').replace(/##TGTE##/g,'>=').replace(/##TLTE##/g,'<=');
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
    jsQuery = jsQuery.replace(/DATEDIFF_DAY/gi,'DIFF_DAYS').replace(/DATEDIFF_HOUR/gi,'DIFF_HOURS')
        .replace(/\bCEIL\(/g,'Math.ceil(').replace(/\bFLOOR\(/g,'Math.floor(')
        .replace(/\bABS\(/g,'Math.abs(').replace(/\bROUND\(/g,'Math.round(');
    jsQuery = jsQuery.replace(/\bNOT\b/gi,'!');

    const sysKeywords = ['IS_EMPTY','STARTS_WITH','SUBSTR','TO_NUMBER','DIFF_DAYS','DIFF_HOURS','LEN','COUNT_IF',
        'XML1','XML2','XML3','XML4','XML5','XML6','DS_XML1','DS_XML2','DS_XML3','DS_XML4','DS_XML5','DS_XML6',
        'NOT_CONTAINS','CONTAINS','IN','LIKE','NULL','OR','AND','Math','String','includes','match','true','false','item','RegExp','new'];

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
            let safeCond = cond.replace(/\b([A-Z_][a-zA-Z0-9_]*)\b/g, (m) => {
                if (sysKeywords.includes(m) || !isNaN(m) || m.startsWith('DM_') || m.startsWith('PL') || m === m.toLowerCase()) return m;
                return `item.${m}`;
            });
            let replacement = `COUNT_IF(${tblName}, item => { try { return ${safeCond}; } catch(e) { return false; } })`;
            jsQuery = jsQuery.substring(0, startIdx) + replacement + jsQuery.substring(endIdx + 1);
            startIdx += replacement.length;
        } else { startIdx += 9; }
    }

    const execute = (ctx) => {
        try {
            const keys = Object.keys(ctx), values = Object.values(ctx);
            const scriptStr = `
                const { DM_ICD10, DM_DVKT, DM_THUOC, DM_VTYT, DM_KHOA, PL1_DVKT, PL2_KHAM, PL3_GIUONG, PL4_GIUONG_BN, PL5_THUOC, PL6_THUOC_YHCT, PL7_BENH_YHCT, PL8_VTYT, PL9_MAU, PL10_DOI_TUONG, PL11_CLS, PL12_NHIEN_LIEU } = danhMucHeThong;
                try { return !!(${jsQuery}); } catch(e) { return false; }
            `;
            return new Function(...keys, 'danhMucHeThong', scriptStr)(...values, danhMucHeThong);
        } catch (e) { return false; }
    };

    const hsXML1 = hoSo.XML1 || hoSo.xml1 || {};
    const hsXML2 = hoSo.XML2 || hoSo.xml2 || [];
    const hsXML3 = hoSo.XML3 || hoSo.xml3 || [];
    const hsXML4 = hoSo.XML4 || hoSo.xml4 || [];
    const hsXML5 = hoSo.XML5 || hoSo.xml5 || [];
    const hsXML6 = hoSo.XML6 || hoSo.xml6 || [];

    const baseCtx = {
        XML1: safeProxy(prepareData(Array.isArray(hsXML1) ? hsXML1[0] : hsXML1)),
        DS_XML2: hsXML2.map(r => safeProxy(enrichXML2Data(r))),
        DS_XML3: hsXML3.map(r => safeProxy(prepareData(r))),
        DS_XML4: hsXML4.map(r => safeProxy(prepareData(r))),
        DS_XML5: hsXML5.map(r => safeProxy(prepareData(r))),
        DS_XML6: hsXML6.map(r => safeProxy(prepareData(r))),
        UPPER, LEN, DIFF_DAYS, DIFF_HOURS, COUNT_IF, IS_EMPTY, STARTS_WITH, SUBSTR, TO_NUMBER
    };

    let rows = [];
    if (targetTable === 'XML1') rows = [Array.isArray(hsXML1) ? hsXML1[0] : hsXML1];
    else if (targetTable === 'XML2') rows = hsXML2;
    else if (targetTable === 'XML3') rows = hsXML3;
    else if (targetTable === 'XML4') rows = hsXML4;
    else if (targetTable === 'XML5') rows = hsXML5;
    else if (targetTable === 'XML6') rows = hsXML6;

    rows.forEach((row, index) => {
        if (!row) return;
        const ctx = { ...baseCtx };
        ctx[targetTable] = safeProxy(targetTable === 'XML2' ? enrichXML2Data(row) : prepareData(row));
        ctx['CURRENT'] = ctx[targetTable];
        if (execute(ctx)) {
            violations.push({ phan_he: targetTable, index: targetTable === 'XML1' ? -1 : index,
                truong_loi: targetField, canh_bao: canhBao, muc_do: mucDo,
                ma_luat: maLuat, ten_quy_tac: tenQuyTac, dieu_kien: conditionStr });
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
export const chayBoMayGiamDinhV3 = async (hoSo) => {
    if (!hoSo) return [];
    let danhSachCanhBao = [];
    const DANH_SACH_TAB_IDS = [
        'LUAT_DU_LIEU','LUAT_HANH_CHINH','LUAT_CHUYEN_TUYEN','LUAT_HOP_DONG',
        'LUAT_CONG_KHAM','LUAT_CDHA','LUAT_MAU','LUAT_THUOC','LUAT_GIUONG','LUAT_NHAN_SU','LUAT_PTTT'
    ];
    try {
        const danhMucHeThong = await taiDanhMucHeThong();
        for (const tabId of DANH_SACH_TAB_IDS) {
            let rules = cache_LuatGiamDinh[tabId];
            if (!rules) {
                const rawRules = await AsyncStorage.getItem(`CDSS_DATA_${tabId}`);
                rules = rawRules ? JSON.parse(rawRules) : [];
                cache_LuatGiamDinh[tabId] = rules;
            }
            if (rules.length === 0) continue;
            rules.forEach(rule => {
                const trangThai = String(layGiaTriAnToan(rule, 'trangthai')).toUpperCase();
                const dieuKien = String(layGiaTriAnToan(rule, 'dieukien'));
                if ((trangThai === 'ON' || trangThai === 'HOẠT ĐỘNG') && dieuKien.trim() !== "") {
                    evaluateRule(rule, hoSo, danhMucHeThong).forEach(v => {
                        danhSachCanhBao.push({
                            id: v.ma_luat !== 'N/A' ? v.ma_luat : `R${Math.random().toString(36).slice(2,11)}`,
                            phan_he: v.phan_he, truong_loi: v.truong_loi, canh_bao: v.canh_bao,
                            muc_do: v.muc_do, index: v.index, ma_luat: v.ma_luat,
                            ten_quy_tac: v.ten_quy_tac, dieu_kien: v.dieu_kien
                        });
                    });
                }
            });
        }
    } catch (error) { console.error("[CDSS Engine V3] Lỗi:", error); }
    return danhSachCanhBao;
};

/**
 * V15 API — Giám định toàn diện 5 lớp.
 * @param {object} hoSo - Hồ sơ KCB: { XML1, XML2, XML3, XML4, XML5, XML6 }
 * @returns {Array} Danh sách cảnh báo, sắp xếp Critical→Error→Warning→Info
 */
export const chayGiamDinhToanDienV15 = async (hoSo) => {
    if (!hoSo) return [];
    const danhMuc = await taiDanhMucHeThong();
    let allLoi = [];

    // LAYER 0: False Positive Guard
    const xml1Obj = _getXML1(hoSo);
    if (laNguonKhongPhaBHYT(xml1Obj)) {
        return [{ phan_he: 'XML1', index: -1, truong_loi: 'T_BHTT',
            canh_bao: 'Hồ sơ này không có thanh toán BHYT — bỏ qua toàn bộ giám định BHYT.',
            muc_do: 'Info', ma_luat: 'FPG-00', ten_quy_tac: 'False Positive Guard', dieu_kien: 'BUILT-IN' }];
    }

    // LAYER 1: Hành chính
    allLoi = allLoi.concat(giamDinhHanhChinh(hoSo.XML1 || hoSo.xml1, danhMuc));

    // LAYER 2+3: Danh mục nội bộ BV + BYT
    allLoi = allLoi.concat(giamDinhDanhMucNoiBo(hoSo, danhMuc));

    // LAYER 4: Lâm sàng
    allLoi = allLoi.concat(giamDinhThuoc(hoSo));
    allLoi = allLoi.concat(giamDinhCDHA(hoSo));
    allLoi = allLoi.concat(giamDinhGiuong(hoSo));
    allLoi = allLoi.concat(giamDinhPTTT(hoSo));
    allLoi = allLoi.concat(giamDinhChuyenTuyen(hoSo));
    allLoi = allLoi.concat(giamDinhTongChiPhi(hoSo));

    // LAYER 5: Luật động NoCode
    allLoi = allLoi.concat(await chayBoMayGiamDinhV3(hoSo));

    // Lọc trùng
    const seen = new Set();
    const ketQua = allLoi.filter(loi => {
        const key = `${loi.phan_he}|${loi.index}|${loi.truong_loi}|${loi.ma_luat}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });

    // Sắp xếp theo mức độ
    const ORDER = { Critical: 0, Error: 1, Warning: 2, Info: 3 };
    ketQua.sort((a, b) => (ORDER[a.muc_do] ?? 9) - (ORDER[b.muc_do] ?? 9));
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
    const dsLoi = [];
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
          CANH_BAO: 'Mã Thuốc không tồn tại trong Danh mục Bệnh viện.' },
        { MA_LUAT: 'XML2_DM_BYT_02', TEN_QUY_TAC: 'Thuốc theo DM BYT',
          DIEU_KIEN: (r,dm) => dm.THUOC_BYT && !dm.THUOC_BYT.has(r.MA_THUOC?.trim()),
          CANH_BAO: 'Mã Thuốc không khớp với Danh mục dùng chung của Bộ Y tế.' },
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
                            dsLoi.push({ bang, dong: idx+1, ma_luat: rule.MA_LUAT,
                                ten_quy_tac: rule.TEN_QUY_TAC, canh_bao: rule.CANH_BAO,
                                du_lieu_loi: row.MA_DICH_VU || row.MA_THUOC || 'N/A' });
                    } catch(e) {}
                }
            });
        });
    });
    return dsLoi;
};
