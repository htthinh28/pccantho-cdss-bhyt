/**
 * CẤU TRÚC DỮ LIỆU XML2: CHI TIẾT THUỐC ĐIỀU TRỊ
 * Căn cứ pháp lý: QĐ 3176/QĐ-BYT (2024), sửa đổi QĐ 4750/QĐ-BYT và QĐ 130/QĐ-BYT
 * Chức năng: Quản lý danh mục và chi phí thuốc BHYT
 * Tiêu chuẩn JCI: Chương MMU (Quản lý và Sử dụng thuốc)
 */

// DANH SÁCH 39 CỘT CHUẨN XML2 (ĐÃ ĐỒNG BỘ CHÍNH XÁC YÊU CẦU 100%)
export const DANH_SACH_COT_XML2 = [
  'MA_LK', 'STT', 'MA_THUOC', 'MA_PP_CHEBIEN', 'MA_CSKCB_THUOC', 'MA_NHOM',
  'TEN_THUOC', 'DON_VI_TINH', 'HAM_LUONG', 'DUONG_DUNG', 'DANG_BAO_CHE',
  'LIEU_DUNG', 'CACH_DUNG', 'SO_DANG_KY', 'TT_THAU', 'PHAM_VI', 'TYLE_TT_BH',
  'SO_LUONG', 'DON_GIA', 'THANH_TIEN_BV', 'THANH_TIEN_BH', 'T_NGUONKHAC_NSNN',
  'T_NGUONKHAC_VTNN', 'T_NGUONKHAC_VTTN', 'T_NGUONKHAC_CL', 'T_NGUONKHAC',
  'MUC_HUONG', 'T_BNTT', 'T_BNCCT', 'T_BHTT', 'MA_KHOA', 'MA_BAC_SI',
  'MA_DICH_VU', 'NGAY_YL', 'NGAY_TH_YL', 'MA_PTTT', 'NGUON_CTRA', 'VET_THUONG_TP',
  'DU_PHONG'
];

// BỘ QUY TẮC KIỂM DUYỆT (VALIDATION RULES) LÕI CHO XML2 ĐƯỢC CHUẨN HÓA 100% THEO PDF BẢNG 2
export const QUY_TAC_KIEM_TRA_XML2 = {
  MA_LK: { required: true, maxLength: 100, type: 'string', mo_ta: 'Là mã đợt điều trị duy nhất (PRIMARY KEY)' },
  STT: { required: true, maxLength: 10, type: 'number', mo_ta: 'Số thứ tự tăng từ 1 đến hết' },
  MA_THUOC: { required: true, maxLength: 255, type: 'string', mo_ta: 'Mã hoạt chất theo danh mục dùng chung' },
  MA_PP_CHEBIEN: { required: false, maxLength: 255, type: 'string', mo_ta: 'Mã phương pháp chế biến vị thuốc cổ truyền' },
  MA_CSKCB_THUOC: { required: false, maxLength: 10, type: 'string', mo_ta: 'Mã CSKCB nơi chuyển thuốc/Hội chẩn' },
  MA_NHOM: { required: true, maxLength: 2, type: 'number', mo_ta: 'Mã nhóm theo chi phí' },
  TEN_THUOC: { required: true, maxLength: 1024, type: 'string', mo_ta: 'Tên thuốc theo quyết định trúng thầu/cấp số đăng ký' },
  DON_VI_TINH: { required: true, maxLength: 50, type: 'string', mo_ta: 'Đơn vị tính nhỏ nhất' },
  HAM_LUONG: { required: false, maxLength: 1024, type: 'string', mo_ta: 'Hàm lượng của thuốc' },
  DUONG_DUNG: { required: false, maxLength: 4, type: 'string', mo_ta: 'Mã đường dùng' },
  DANG_BAO_CHE: { required: false, maxLength: 1024, type: 'string', mo_ta: 'Dạng bào chế của thuốc' },
  LIEU_DUNG: { required: false, maxLength: 1024, type: 'string', mo_ta: 'Liều dùng thuốc cho người bệnh' },
  CACH_DUNG: { required: false, maxLength: 1024, type: 'string', mo_ta: 'Lời dặn của thầy thuốc' },
  SO_DANG_KY: { required: false, maxLength: 255, type: 'string', mo_ta: 'Số đăng ký lưu hành của thuốc' },
  TT_THAU: { required: false, maxLength: 50, type: 'string', mo_ta: 'Thông tin thầu của thuốc' },
  PHAM_VI: { required: true, maxLength: 1, type: 'number', mo_ta: 'Mã xác định phạm vi hưởng BHYT' },
  TYLE_TT_BH: { required: true, maxLength: 3, type: 'number', mo_ta: 'Tỷ lệ thanh toán BHYT (%)' },
  SO_LUONG: { required: true, maxLength: 10, type: 'number', mo_ta: 'Số lượng thuốc thực tế sử dụng' },
  DON_GIA: { required: true, maxLength: 15, type: 'number', mo_ta: 'Đơn giá của thuốc' },
  THANH_TIEN_BV: { required: true, maxLength: 15, type: 'number', mo_ta: 'Số tiền thanh toán theo giá bệnh viện' },
  THANH_TIEN_BH: { required: true, maxLength: 15, type: 'number', mo_ta: 'Số tiền do quỹ BHYT thanh toán' },
  T_NGUONKHAC_NSNN: { required: false, maxLength: 15, type: 'number', mo_ta: 'Số tiền thuốc được NSNN hỗ trợ' },
  T_NGUONKHAC_VTNN: { required: false, maxLength: 15, type: 'number', mo_ta: 'Số tiền thuốc được viện trợ ngoài nước hỗ trợ' },
  T_NGUONKHAC_VTTN: { required: false, maxLength: 15, type: 'number', mo_ta: 'Số tiền thuốc được viện trợ trong nước hỗ trợ' },
  T_NGUONKHAC_CL: { required: false, maxLength: 15, type: 'number', mo_ta: 'Số tiền thuốc được các nguồn khác còn lại hỗ trợ' },
  T_NGUONKHAC: { required: false, maxLength: 15, type: 'number', mo_ta: 'Tổng số tiền các nguồn khác chi trả' },
  MUC_HUONG: { required: true, maxLength: 3, type: 'number', mo_ta: 'Mức hưởng BHYT tương ứng' },
  T_BNTT: { required: true, maxLength: 15, type: 'number', mo_ta: 'Số tiền người bệnh tự trả' },
  T_BNCCT: { required: true, maxLength: 15, type: 'number', mo_ta: 'Số tiền người bệnh cùng chi trả' },
  T_BHTT: { required: true, maxLength: 15, type: 'number', mo_ta: 'Số tiền đề nghị BHXH thanh toán' },
  MA_KHOA: { required: true, maxLength: 50, type: 'string', mo_ta: 'Mã khoa chỉ định' },
  MA_BAC_SI: { required: true, maxLength: 255, type: 'string', mo_ta: 'Mã bác sỹ khám, chỉ định thuốc' },
  MA_DICH_VU: { required: false, maxLength: 255, type: 'string', mo_ta: 'Mã dịch vụ kỹ thuật kèm theo chỉ định thuốc' },
  NGAY_YL: { required: true, maxLength: 12, type: 'string', mo_ta: 'Thời điểm ra y lệnh (YYYYMMDDHHMI)' },
  NGAY_TH_YL: { required: false, maxLength: 12, type: 'string', mo_ta: 'Thời điểm thực hiện y lệnh' },
  MA_PTTT: { required: false, maxLength: 1, type: 'number', mo_ta: 'Mã phương thức thanh toán đối với thuốc' },
  NGUON_CTRA: { required: false, maxLength: 1, type: 'number', mo_ta: 'Mã xác định nguồn thuốc chi trả' },
  VET_THUONG_TP: { required: false, maxLength: 1, type: 'number', mo_ta: 'Mã của vết thương tái phát' },
  DU_PHONG: { required: false, type: 'string', mo_ta: 'Trường dữ liệu dự phòng' }
};

/**
 * TÀI LIỆU THAM KHẢO
 * [1] Bộ Y tế (2024), Quyết định số 3176/QĐ-BYT về chuẩn định dạng dữ liệu đầu ra XML2.
 * [2] Joint Commission International (JCI), Chương MMU - Đảm bảo y lệnh kê đơn đầy đủ thông tin định danh và thời gian.
 */