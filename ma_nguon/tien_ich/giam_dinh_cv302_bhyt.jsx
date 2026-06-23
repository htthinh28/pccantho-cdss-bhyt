/**
 * Giám định built-in theo Công văn CV 302/CSYT-CĐ (hiệu lực 01/7/2026).
 * Bổ sung seed HC_06 / HC_09 / XML_47–48 / XML_57 với ngưỡng LCS theo ngày KCB.
 */

import {
    MOC_LCS_BHYT_MOI_YMD,
    dinhDangTienVnd,
    laMotLanKcbDuoi15PhanTramLcs,
    mocNgayYmdTuXml1,
    ngưỡng15PhanTramLcsXml1,
    ngưỡng45LanLcsXml1,
    ngưỡng6LanLcsXml1,
    tinhNguongCctConLaiSauDoiLcs,
} from './muc_luong_co_so_bhyt';

const TO_NUMBER = (v) => {
    if (v === null || v === undefined || v === '') return 0;
    const n = Number(String(v).replace(/,/g, '').trim());
    return Number.isFinite(n) ? n : 0;
};

const IS_EMPTY = (v) => v === null || v === undefined || String(v).trim() === '';

const MATCH_MA_LOAI_KCB = (val, ...codes) => {
    const s = String(val ?? '').trim();
    return codes.some((c) => s === String(c));
};

const laDieuTriNgoaiTru = (xml1) => MATCH_MA_LOAI_KCB(xml1?.MA_LOAI_KCB, '1', '01', '7', '09');

const CO_SO_PHAP_LY_CV302 = 'Công văn CV 302/CSYT-CĐ (BHXH VN) + NĐ 161/2026/NĐ-CP; hiệu lực 01/7/2026';

export const giamDinhCv302Bhyt = (hoSo, dm) => {
    const ds = [];
    const xml1 = hoSo?.XML1 || hoSo?.xml1 || null;
    if (!xml1 || typeof xml1 !== 'object') return ds;

    const ngayKey = mocNgayYmdTuXml1(xml1);
    if (!ngayKey || ngayKey < MOC_LCS_BHYT_MOI_YMD) return ds;

    const addLỗi = (maLuat, ten, noiDung, mucDo, truong) => ds.push({
        phan_he: 'XML1',
        index: -1,
        truong_loi: truong || maLuat,
        canh_bao: noiDung,
        muc_do: mucDo,
        ma_luat: maLuat,
        ten_quy_tac: ten,
        dieu_kien: 'BUILT-IN',
        co_so_phap_ly: CO_SO_PHAP_LY_CV302,
    });

    const tTongChiBh = TO_NUMBER(xml1.T_TONGCHI_BH);
    const tBncct = TO_NUMBER(xml1.T_BNCCT);
    const nguong15 = ngưỡng15PhanTramLcsXml1(xml1);

    // Miễn CCT một lần KCB < 15% LCS (CV 302 §2.1)
    if (
        laMotLanKcbDuoi15PhanTramLcs(xml1, tTongChiBh)
        && tBncct > 0
        && !MATCH_MA_LOAI_KCB(xml1.MA_LOAI_KCB, '1', '01')
    ) {
        addLỗi(
            'HC-302a',
            'Miễn cùng chi trả (15% LCS — CV 302)',
            `⛔ [THU SAI]: Chi phí đợt điều trị dưới ${dinhDangTienVnd(nguong15)} (15% LCS 2.530.000đ), BN phải được hưởng 100%. Cơ sở không được thu tiền cùng chi trả.`,
            'Critical',
            'T_BNCCT',
        );
    }

    // Miễn CCT 5 năm liên tục — lũy kế > 6×LCS (CV 302 §2.2)
    const maDkBd = String(xml1.MA_DK_BD || '').trim();
    const luyKe = TO_NUMBER(xml1.T_BNCCT_LUY_KE);
    const nguong6 = ngưỡng6LanLcsXml1(xml1);
    if (
        maDkBd === '1'
        && luyKe > nguong6
        && (TO_NUMBER(xml1.T_BHTT) < tTongChiBh || tBncct > 0)
        && IS_EMPTY(xml1.NGAY_MIEN_CCT)
    ) {
        addLỗi(
            'HC-302b',
            'Miễn cùng chi trả (5 năm liên tục — CV 302)',
            `⛔ [QUYỀN LỢI 5 NĂM]: BN đã đủ điều kiện miễn cùng chi trả (lũy kế > ${dinhDangTienVnd(nguong6)} = 6×LCS). Cơ sở thu tiền cùng chi trả là sai quy định.`,
            'Critical',
            'T_BNCCT_LUY_KE',
        );
    }

    // Gợi ý ngưỡng CCT còn lại khi đổi LCS giữa năm 2026 (CV 302 §2.5)
    if (ngayKey.startsWith('2026') && luyKe > 0 && maDkBd === '1') {
        const nguongConLai = tinhNguongCctConLaiSauDoiLcs(luyKe, ngayKey);
        if (tBncct > 0 && luyKe < nguong6 && tBncct > nguongConLai + 1000) {
            addLỗi(
                'HC-302c',
                'Ngưỡng cùng chi trả còn lại sau đổi LCS (CV 302)',
                `⚠️ [KIỂM TRA]: Theo công thức CV 302 (đổi LCS 01/7/2026), phần cùng chi trả còn lại trong năm khoảng ${dinhDangTienVnd(nguongConLai)}; lũy kế hiện ${dinhDangTienVnd(luyKe)} — rà soát T_BNCCT / NGAY_MIEN_CCT.`,
                'Warning',
                'T_BNCCT_LUY_KE',
            );
        }
    }

    // Trần TBYT 45×LCS / lần sử dụng DVKT (CV 302 §2.3; TT 24/2025/TT-BYT)
    const xml3 = Array.isArray(hoSo?.XML3) ? hoSo.XML3 : (Array.isArray(hoSo?.xml3) ? hoSo.xml3 : []);
    const tranTbyt = ngưỡng45LanLcsXml1(xml1);
    const theoMaDv = new Map();
    xml3.forEach((row) => {
        const maDv = String(row?.MA_DICH_VU || row?.MA_VAT_TU || '').trim();
        if (!maDv) return;
        const tienBh = TO_NUMBER(row?.THANH_TIEN_BH ?? row?.T_BHTT ?? row?.THANH_TIEN);
        if (tienBh <= 0) return;
        const key = maDv;
        theoMaDv.set(key, (theoMaDv.get(key) || 0) + tienBh);
    });
    for (const [maDv, tong] of theoMaDv.entries()) {
        if (tong > tranTbyt * 1.001) {
            addLỗi(
                'HC-302d',
                'Trần thiết bị y tế (45×LCS — CV 302)',
                `⛔ [TRẦN TBYT]: Tổng chi BHYT cho DVKT/VT [${maDv}] (${dinhDangTienVnd(tong)}) vượt trần ${dinhDangTienVnd(tranTbyt)} (45×LCS 2.530.000đ) cho một lần sử dụng.`,
                'Warning',
                'THANH_TIEN_BH',
            );
            break;
        }
    }

    // Thanh toán trực tiếp tại BHXH — gợi ý trần 0,15 / 0,5 LCS (CV 302 §2.6; Điều 57 NĐ 188)
    const cskcb = dm?.CSKCB || dm?.cskcb || {};
    const capCm = String(cskcb.CAP_CHUYEN_MON || cskcb.cap_chuyen_mon || '').toUpperCase();
    const hinhThuc = String(cskcb.HINH_THUC_TC || cskcb.hinh_thuc_tc || '').toUpperCase();
    const khongHopDong = String(cskcb.HOP_DONG_BHYT || cskcb.hop_dong_bhyt || xml1.HOP_DONG_BHYT || '').toUpperCase() === 'KHONG';
    const laCapCuu = String(xml1.MA_LYDO_VVIEN || xml1.MA_LY_DO_VVIEN || '').trim() === '2';
    const ngoaiTru = laDieuTriNgoaiTru(xml1);

    if (khongHopDong && !laCapCuu && (capCm === 'BAN_DAU' || hinhThuc.includes('PK') || hinhThuc.includes('TYT'))) {
        const tranNgoai = ngưỡng15PhanTramLcsXml1(xml1);
        const tranNoi = Math.round(0.5 * (tranNgoai / 0.15));
        const tongBhHuong = TO_NUMBER(xml1.T_BHTT);
        if (ngoaiTru && tongBhHuong > tranNgoai * 1.05) {
            addLỗi(
                'HC-302e',
                'Trần thanh toán trực tiếp BHXH (ngoại trú)',
                `⚠️ [Điều 57 NĐ 188]: KCB ngoại trú không hợp đồng tại CSYT cấp cơ bản — thanh toán trực tiếp BHXH tối đa ${dinhDangTienVnd(tranNgoai)} (0,15×LCS). T_BHTT hiện ${dinhDangTienVnd(tongBhHuong)}.`,
                'Warning',
                'T_BHTT',
            );
        } else if (!ngoaiTru && tongBhHuong > tranNoi * 1.05) {
            addLỗi(
                'HC-302e',
                'Trần thanh toán trực tiếp BHXH (nội trú)',
                `⚠️ [Điều 57 NĐ 188]: KCB nội trú không hợp đồng tại CSYT cấp cơ bản — thanh toán trực tiếp BHXH tối đa ${dinhDangTienVnd(tranNoi)} (0,5×LCS). T_BHTT hiện ${dinhDangTienVnd(tongBhHuong)}.`,
                'Warning',
                'T_BHTT',
            );
        }
    }

    return ds;
};
