/**
 * CẤU TRÚC DỮ LIỆU XML1: CHỈ TIÊU TỔNG HỢP KHÁM BỆNH, CHỮA BỆNH
 * Căn cứ: QĐ 3176/QĐ-BYT (2024), sửa đổi QĐ 4750/QĐ-BYT và QĐ 130/QĐ-BYT; đọc bổ sung QĐ 4210 + CV 7464/BYT-BH được chuẩn hóa về cùng trường xml1.
 */

export const DANH_SACH_COT_XML1 = [
  'MA_LK', 'STT', 'MA_BN', 'HO_TEN', 'SO_CCCD', 'NGAY_SINH', 'GIOI_TINH', 'NHOM_MAU',
  'MA_QUOCTICH', 'MA_DANTOC', 'MA_NGHE_NGHIEP', 'DIA_CHI', 'MATINH_CU_TRU', 'MAHUYEN_CU_TRU',
  'MAXA_CU_TRU', 'DIEN_THOAI', 'MA_THE_BHYT', 'MA_DKBD', 'GT_THE_TU', 'GT_THE_DEN',
  'NGAY_MIEN_CCT', 'LY_DO_VV', 'LY_DO_VNT', 'MA_LY_DO_VNT', 'CHAN_DOAN_VAO', 'CHAN_DOAN_RV',
  'MA_BENH_CHINH', 'MA_BENH_KT', 'MA_BENH_YHCT', 'MA_PTTT_QT', 'MA_DOITUONG_KCB', 'MA_NOI_DI',
  'MA_NOI_DEN', 'MA_TAI_NAN', 'NGAY_VAO', 'NGAY_VAO_NOI_TRU', 'NGAY_RA', 'GIAY_CHUYEN_TUYEN',
  'SO_NGAY_DTRI', 'PP_DIEU_TRI', 'KET_QUA_DTRI', 'MA_LOAI_RV', 'GHI_CHU', 'NGAY_TTOAN',
  'T_THUOC', 'T_VTYT', 'T_TONGCHI_BV', 'T_TONGCHI_BH', 'T_BNTT', 'T_BNCCT', 'T_BHTT',
  'T_NGUONKHAC', 'T_BHTT_GDV', 'NAM_QT', 'THANG_QT', 'MA_LOAI_KCB', 'MA_KHOA', 'MA_CSKCB',
  'MA_KHUVUC', 'CAN_NANG', 'CAN_NANG_CON', 'NAM_NAM_LIEN_TUC', 'NGAY_TAI_KHAM', 'MA_HSBA',
  'MA_TTDV', 'DU_PHONG'
];

// (Dự phòng mở rộng) Bộ quy tắc bắt lỗi trống, sai định dạng theo chuẩn kiểm tra
export const QUY_TAC_KIEM_TRA_XML1 = {
  MA_LK: { required: true, maxLength: 100, type: 'string' },
  HO_TEN: { required: true, maxLength: 255, type: 'string' },
  MA_THE_BHYT: { required: true, maxLength: 15, type: 'string' },
  MA_BENH_CHINH: { required: true, type: 'string' },
  // Bác sĩ có thể định nghĩa thêm các ràng buộc tại đây trong tương lai...
};