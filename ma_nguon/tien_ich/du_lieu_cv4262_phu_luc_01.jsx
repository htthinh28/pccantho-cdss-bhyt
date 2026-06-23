/**
 * Phụ lục 01 — Công văn 4262/BHXH-CSYT (28/10/2016):
 * DVKT không thanh toán đồng thời khi đã có DVKT cha trong quy trình / cơ cấu giá.
 */

export const PHIEN_BAN_CV4262_PHU_LUC_01 = '2026-06-12-pl01-seed-v1';

/** Mã DVKT đã map được từ danh mục TT12/TT37 hiện hành. */
export const CV4262_MA = Object.freeze({
    HUT_DOM: new Set([
        '01.0054.0114', '01.0055.0114', '02.0150.0114',
        '03.0091.0300', '03.0092.0299',
    ]),
    SA_O_BUNG: new Set(['02.0314.0001', '18.0015.0001', '01.0239.0001']),
    SA_TIET_NIEU: new Set(['18.0016.0001']),
    DO_CHUC_NANG_HO_HAP: new Set(['02.0024.1791']),
    THAN_NT_CAP_CUU: new Set(['03.0180.0150']),
    CT_NGUC_CQ: new Set(['18.0192.0041']),
    CT_BUNG_CQ: new Set(['18.0156.0041']),
    CT_NGUC_KCQ: new Set(['18.0157.0040']),
    CT_BUNG_KCQ: new Set(['18.0155.0040']),
    AMBU_CHUNG: new Set(['01.0065.0071']),
    AMBU_SO_SINH: new Set(['13.0200.0071']),
    NS_TMH_DAY_DU: new Set(['03.2205.0911', '20.0013.2048']),
    NS_TMH_DON: new Set(['03.1001.2048', '03.1002.2048', '03.1003.2048']),
    CHOC_DO_MP: new Set(['03.2332.0078', '02.0008.0078', '03.2333.0078']),
});

/**
 * Quy tắc loại trừ: khi có ít nhất một mã/pattern CHA được BHYT thanh toán,
 * các mã/pattern LOAI_TRU không được thanh toán đồng thời (cùng hồ sơ XML3).
 */
export const CV4262_PHU_LUC_01_LOAI_TRU = Object.freeze([
    {
        id: 'PL01-02',
        dieu: '2.4 / PL01 mục 2',
        mo_ta: 'Siêu âm ổ bụng — không đồng thời SA hệ tiết niệu / SA TC phần phụ',
        ma_cha: [...CV4262_MA.SA_O_BUNG],
        pattern_cha: [/SIÊU ÂM\s+Ổ BỤNG/i],
        ma_loai_tru: [...CV4262_MA.SA_TIET_NIEU],
        pattern_loai_tru: [
            /SIÊU ÂM\s+HỆ\s+TIẾT\s+NIỆU/i,
            /SIÊU ÂM\s+TỬ\s+CUNG/i,
            /SIÊU ÂM\s+PHẦN\s+PHỤ/i,
        ],
    },
    {
        id: 'PL01-04',
        dieu: '2.4 / PL01 mục 4',
        mo_ta: 'SA Doppler mạch ổ bụng — không đồng thời SA ổ bụng',
        ma_cha: [],
        pattern_cha: [/SIÊU ÂM\s+DOPPLER.*Ổ\s+BỤNG/i, /DOPPLER.*MẠCH.*Ổ\s+BỤNG/i],
        ma_loai_tru: [...CV4262_MA.SA_O_BUNG],
        pattern_loai_tru: [/SIÊU ÂM\s+Ổ\s+BỤNG/i],
    },
    {
        id: 'PL01-05',
        dieu: '2.4 / PL01 mục 5',
        mo_ta: 'Đặt/Mở KQ, CC ngừng TH, nội soi, phẫu thuật — không đồng thời Hút đờm',
        ma_cha: [],
        pattern_cha: [
            /ĐẶT\s+NỘI\s+KHÍ\s+QUẢN/i,
            /MỞ\s+KHÍ\s+QUẢN/i,
            /NGỪNG\s+TUẦN\s+HOÀN/i,
            /NỘI\s+SOI\s+TAI\s+MŨI\s+HỌNG/i,
            /NỘI\s+SOI\s+PHẾ\s+QUẢN/i,
            /NỘI\s+SOI\s+THỰC\s+QUẢN/i,
            /NỘI\s+SOI\s+DẠ\s+DÀY/i,
            /PHẪU\s+THUẬT/i,
        ],
        ma_loai_tru: [...CV4262_MA.HUT_DOM],
        pattern_loai_tru: [/HÚT\s+ĐỜM/i],
    },
    {
        id: 'PL01-06',
        dieu: '2.4 / PL01 mục 6',
        mo_ta: 'Thận nhân tạo cấp cứu — không đồng thời đặt catheter TM trung tâm',
        ma_cha: [...CV4262_MA.THAN_NT_CAP_CUU],
        pattern_cha: [/THẬN\s+NHÂN\s+TẠO\s+CẤP\s+CỨU/i, /CHẠY\s+THẬN.*CẤP\s+CỨU/i],
        ma_loai_tru: [],
        pattern_loai_tru: [
            /CATHETER\s+TĨNH\s+MẠCH\s+TRUNG\s+TÂM/i,
            /ỐNG\s+THÔNG\s+TĨNH\s+MẠCH.*2\s+NÒNG/i,
            /CATHETER.*NHIỀU\s+NÒNG/i,
        ],
    },
    {
        id: 'PL01-07',
        dieu: '2.4 / PL01 mục 7',
        mo_ta: 'Test hồi phục phế quản — không đồng thời Đo chức năng hô hấp',
        ma_cha: [],
        pattern_cha: [/TEST\s+HỒI\s+PHỤC\s+PHẾ\s+QUẢN/i],
        ma_loai_tru: [...CV4262_MA.DO_CHUC_NANG_HO_HAP],
        pattern_loai_tru: [/ĐO\s+CHỨC\s+NĂNG\s+HÔ\s+HẤP/i],
    },
    {
        id: 'PL01-08',
        dieu: '2.4 / PL01 mục 8',
        mo_ta: 'Bơm streptokinase khoang màng phổi — không đồng thời chọc dò/tháo dịch màng phổi',
        ma_cha: [],
        pattern_cha: [/BƠM\s+STREPTOKINASE.*MÀNG\s+PHỔI/i, /STREPTOKINASE.*KHOANG\s+MÀNG\s+PHỔI/i],
        ma_loai_tru: [...CV4262_MA.CHOC_DO_MP],
        pattern_loai_tru: [/CHỌC\s+DÒ\s+MÀNG\s+PHỔI/i, /CHỌC\s+THÁO\s+DỊCH\s+MÀNG\s+PHỔI/i],
    },
]);

/** DVKT chỉ định sẵn / chu kỳ — §1.1: chỉ thanh toán DVKT, không công khám. */
export const CV4262_DVKT_CHI_DINH_SAN = Object.freeze({
    ma: new Set([
        '03.0180.0150', // chạy thận cấp cứu — ví dụ; chu kỳ thường có mã riêng theo BV
    ]),
    pattern_ten: [
        /CHẠY\s+THẬN\s+NHÂN\s+TẠO/i,
        /LỌC\s+MÁU\s+CHU\s+KỲ/i,
        /PHỤC\s+HỒI\s+CHỨC\s+NĂNG/i,
        /CHÂM\s+CỨU/i,
        /ĐIỀU\s+TRỊ\s+CHÂM\s+CỨU/i,
    ],
});

/** Cặp CT ngực + bụng có cản quang — §2.1 (mã TT12 tham chiếu). */
export const CV4262_CT_CAP_CQ = Object.freeze({
    nguc_cq: [...CV4262_MA.CT_NGUC_CQ],
    bung_cq: [...CV4262_MA.CT_BUNG_CQ],
    nguc_kcq: [...CV4262_MA.CT_NGUC_KCQ],
    bung_kcq: [...CV4262_MA.CT_BUNG_KCQ],
});
