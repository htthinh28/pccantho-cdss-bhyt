/**
 * Mức lương cơ sở BHYT theo thời điểm KCB.
 * CV 302/CSYT-CĐ + NĐ 161/2026/NĐ-CP: LCS 2.530.000đ từ 01/7/2026 (trước đó 2.340.000đ).
 */

export const LCS_BHYT_CU_DONG = 2340000;
export const LCS_BHYT_MOI_DONG = 2530000;
export const MOC_LCS_BHYT_MOI_YMD = '20260701';

/** YYYYMMDD từ NGAY_VAO / NGAY_RA / NGAY_TTOAN. */
export const mocNgayYmdTuXml1 = (xml1 = {}) => {
    const s = String(xml1?.NGAY_VAO || xml1?.NGAY_RA || xml1?.NGAY_TTOAN || '').replace(/\D/g, '');
    return s.length >= 8 ? s.slice(0, 8) : '';
};

export const layLcsDongChoNgay = (ngayYmd = '') => {
    const key = String(ngayYmd || '').replace(/\D/g, '').slice(0, 8);
    if (key && key >= MOC_LCS_BHYT_MOI_YMD) return LCS_BHYT_MOI_DONG;
    return LCS_BHYT_CU_DONG;
};

export const layLcsDongChoXml1 = (xml1 = {}) => layLcsDongChoNgay(mocNgayYmdTuXml1(xml1));

export const ngưỡng15PhanTramLcs = (ngayYmd = '') => Math.round(0.15 * layLcsDongChoNgay(ngayYmd));

export const ngưỡng15PhanTramLcsXml1 = (xml1 = {}) => ngưỡng15PhanTramLcs(mocNgayYmdTuXml1(xml1));

export const ngưỡng6LanLcs = (ngayYmd = '') => 6 * layLcsDongChoNgay(ngayYmd);

export const ngưỡng6LanLcsXml1 = (xml1 = {}) => ngưỡng6LanLcs(mocNgayYmdTuXml1(xml1));

export const ngưỡng45LanLcs = (ngayYmd = '') => 45 * layLcsDongChoNgay(ngayYmd);

export const ngưỡng45LanLcsXml1 = (xml1 = {}) => ngưỡng45LanLcs(mocNgayYmdTuXml1(xml1));

export const dinhDangTienVnd = (so) => {
    const n = Number(so);
    if (!Number.isFinite(n)) return '0';
    return `${Math.round(n).toLocaleString('vi-VN')}đ`;
};

/** true = một lần KCB có T_TONGCHI_BH > 0 và dưới 15% LCS tại thời điểm đi KCB. */
export const laMotLanKcbDuoi15PhanTramLcs = (xml1 = {}, tongChiBh = null) => {
    const tt = tongChiBh != null ? Number(tongChiBh) : Number(xml1?.T_TONGCHI_BH);
    if (!Number.isFinite(tt) || tt <= 0) return false;
    return tt < ngưỡng15PhanTramLcsXml1(xml1);
};

/**
 * Ngưỡng còn lại phải cùng chi trả trong năm (CV 302 mục 2.5 — Điểm c Khoản 2 Điều 18 NĐ 188).
 * (6 - lũy_kế_đã_CCT) × LCS_mới, trong đó lũy_kế quy đổi theo LCS cũ cho phần 01/01–30/6/2026.
 */
export const tinhNguongCctConLaiSauDoiLcs = (tBncctLuyKe = 0, namYmd = '') => {
    const luyKe = Number(tBncctLuyKe);
    if (!Number.isFinite(luyKe) || luyKe < 0) return ngưỡng6LanLcs(namYmd);
    const nam = String(namYmd || '').slice(0, 4);
    if (nam && Number(nam) === 2026) {
        const luyKeQuyDoi = (luyKe / LCS_BHYT_CU_DONG) * LCS_BHYT_MOI_DONG;
        return Math.max(0, (6 * LCS_BHYT_MOI_DONG) - luyKeQuyDoi);
    }
    return Math.max(0, ngưỡng6LanLcs(namYmd) - luyKe);
};
