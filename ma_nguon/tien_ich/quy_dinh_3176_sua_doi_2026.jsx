/**
 * QĐ sửa đổi, bổ sung QĐ 3176/QĐ-BYT (ký 29/06/2026; CSKCB áp dụng từ 01/07/2026).
 * Nguyên tắc: bổ sung quy tắc mới theo mốc ngày KCB; giữ nguyên giới hạn cũ cho hồ sơ trước mốc.
 */

import { mocNgayYmdTuXml1 } from './muc_luong_co_so_bhyt';

/** Ngày CSKCH/BHXH thực hiện theo Điều 2 QĐ sửa đổi 3176 (01/07/2026). */
export const MOC_AP_DUNG_SUA_DOI_3176_YMD = '20260701';

/** Ký hiệu văn bản — số QĐ chính thức trên bản ký có thể bổ sung sau. */
export const CO_SO_PHAP_LY_SUA_DOI_3176_2026 =
  'QĐ sửa đổi, bổ sung QĐ 3176/QĐ-BYT (29/06/2026); áp dụng từ 01/07/2026';

export const MUC_HUONG_MAX_LENGTH_CU = 3;
export const MUC_HUONG_MAX_LENGTH_MOI = 4;

/** Mẫu SO_DANG_KY thuốc hiếm: UBND.YYYY.X.S (UBND cấp tỉnh cấp phép nhập khẩu). */
export const SO_DANG_KY_UBND_PATTERN = /^UBND\.\d{4}\.\d+\.\d+$/i;

export const SO_DANG_KY_UBND_MO_TA =
  'Thuốc hiếm được UBND cấp tỉnh cấp phép đơn hàng nhập khẩu: mã hóa UBND.YYYY.X.S (YYYY=năm cấp phép, X=số văn bản cấp phép nhập khẩu, S=thứ tự thuốc trong văn bản).';

export const laApDungSuaDoi3176_2026 = (ngayYmd = '') => {
  const key = String(ngayYmd || '').replace(/\D/g, '').slice(0, 8);
  return !!(key && key >= MOC_AP_DUNG_SUA_DOI_3176_YMD);
};

export const laApDungSuaDoi3176ChoXml1 = (xml1 = {}) =>
  laApDungSuaDoi3176_2026(mocNgayYmdTuXml1(xml1));

/** Độ dài tối đa MUC_HUONG theo mốc ngày — trước 01/7/2026 giữ 3 ký tự. */
export const layMaxLengthMucHuong = (ngayYmd = '') =>
  laApDungSuaDoi3176_2026(ngayYmd) ? MUC_HUONG_MAX_LENGTH_MOI : MUC_HUONG_MAX_LENGTH_CU;

export const layMaxLengthMucHuongChoXml1 = (xml1 = {}) =>
  layMaxLengthMucHuong(mocNgayYmdTuXml1(xml1));

/**
 * Gộp quy tắc kiểm tra cột với phiên bản theo ngày (không đổi tên trường / cột chuẩn).
 * @param {object} quyTacGoc — QUY_TAC_KIEM_TRA_XML2 hoặc XML3
 * @param {string} ngayYmd — YYYYMMDD
 */
export const apDungQuyTacKiemTraTheoNgay = (quyTacGoc = {}, ngayYmd = '') => {
  const apDungMoi = laApDungSuaDoi3176_2026(ngayYmd);
  const out = { ...quyTacGoc };

  if (out.MUC_HUONG) {
    out.MUC_HUONG = {
      ...out.MUC_HUONG,
      maxLength: apDungMoi ? MUC_HUONG_MAX_LENGTH_MOI : MUC_HUONG_MAX_LENGTH_CU,
      maxLengthCu: MUC_HUONG_MAX_LENGTH_CU,
      maxLengthMoi: MUC_HUONG_MAX_LENGTH_MOI,
    };
  }

  if (out.SO_DANG_KY && apDungMoi) {
    out.SO_DANG_KY = {
      ...out.SO_DANG_KY,
      ghi_chu_ubnd: SO_DANG_KY_UBND_MO_TA,
      patternUbnd: SO_DANG_KY_UBND_PATTERN,
    };
  }

  return out;
};

export const laSoDangKyUbndHopLe = (val) => {
  const s = String(val ?? '').trim();
  if (!s) return true;
  if (!/^UBND/i.test(s)) return true;
  return SO_DANG_KY_UBND_PATTERN.test(s);
};
