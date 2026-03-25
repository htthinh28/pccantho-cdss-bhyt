/**
 * CẤU TRÚC DỮ LIỆU XML6: CHỈ TIÊU DANH MỤC HỒ SƠ BỆNH ÁN KHÁC
 * Căn cứ pháp lý: QĐ 3176/QĐ-BYT (2024), sửa đổi QĐ 4750/QĐ-BYT và QĐ 130/QĐ-BYT
 * Chức năng: Quản lý dữ liệu chuyên biệt (HIV/AIDS, Lao, các chương trình mục tiêu...)
 * Tiêu chuẩn JCI: Chương MCI (Management of Information) - Toàn vẹn dữ liệu lâm sàng.
 */

export const DANH_SACH_COT_XML6 = [
  'MA_LK', 'STT', 'MA_BN', 'HO_TEN', 'SO_CCCD', 'NGAY_SINH', 'GIOI_TINH', 'DIA_CHI',
  'MA_THE_BHYT', 'MA_DKBD', 'GT_THE_TU', 'GT_THE_DEN', 'MA_DOITUONG_KCB', 'NGAY_VAO',
  'NGAY_RA', 'MA_BENH_CHINH', 'MA_BENH_KT', 'MA_LOAI_KCB', 'MA_KHOA', 'MA_CSKCB',
  'MA_QUOCTICH', 'MA_DANTOC', 'MA_NGHE_NGHIEP', 'THOI_DIEM_XN_HIV', 'KQ_XN_HIV',
  'KQ_XNTL_VR', 'NGAY_KQ_XN_TLVR', 'MA_LOAI_BN', 'MA_CD_BD', 'NGAY_CD_BD',
  'MA_PHAC_DO_BD', 'MA_BAC_SI', 'MA_TT_LAM_SANG', 'CAN_NANG', 'CHIEU_CAO',
  'MA_PHU_PHAC_DO', 'NGAY_BAT_DAU_PHAC_DO', 'NGAY_KET_THUC_PHAC_DO', 'LY_DO_NGUNG_BD',
  'MA_LY_DO_NGUNG_BD', 'SO_NGAY_CAP_THUOC', 'NGAY_HEN_TAI_KHAM', 'MA_LOAI_RV',
  'NGAY_TTOAN', 'MA_TTDV', 'GHI_CHU', 'DU_PHONG'
];

// BỘ QUY TẮC KIỂM DUYỆT (VALIDATION RULES) CHO XML6
export const QUY_TAC_KIEM_TRA_XML6 = {
  MA_LK: { required: true, maxLength: 100, type: 'string', mo_ta: 'Mã lượt khám để liên kết XML1' },
  STT: { required: true, type: 'number', mo_ta: 'Số thứ tự dòng dữ liệu' },
  MA_BN: { required: true, type: 'string', mo_ta: 'Mã người bệnh tại cơ sở KCB' },
  KQ_XN_HIV: { required: false, type: 'string', mo_ta: 'Kết quả xét nghiệm HIV' },
  KQ_XNTL_VR: { required: false, type: 'string', mo_ta: 'Kết quả xét nghiệm tải lượng virus (HIV/Viêm gan)' },
  MA_PHAC_DO_BD: { required: false, type: 'string', mo_ta: 'Mã phác đồ điều trị' },
  NGAY_HEN_TAI_KHAM: { required: false, maxLength: 8, type: 'string', mo_ta: 'Ngày hẹn tái khám (YYYYMMDD)' },
  MA_BAC_SI: { required: true, type: 'string', mo_ta: 'Mã chứng chỉ hành nghề bác sĩ phụ trách' },
  // Quy tắc CDSS: Tự động cảnh báo nếu thiếu các chỉ số chuyên biệt cho bệnh nhân thuộc diện quản lý đặc biệt.
};

/**
 * TÀI LIỆU THAM KHẢO
 * [1] Bộ Y tế (2024), Quyết định số 3176/QĐ-BYT về chuẩn định dạng dữ liệu đầu ra phục vụ quản lý và thanh toán BHYT.
 * [2] Joint Commission International (JCI), Chương MCI - Đảm bảo dữ liệu báo cáo chuyên biệt chính xác.
 */