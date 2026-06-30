/**
 * CẤU TRÚC DỮ LIỆU XML3: CHỈ TIÊU CHI TIẾT DỊCH VỤ KỸ THUẬT VÀ VẬT TƯ Y TẾ
 * Căn cứ pháp lý: QĐ 3176/QĐ-BYT (2024), sửa đổi QĐ 4750/QĐ-BYT và QĐ 130/QĐ-BYT;
 * bổ sung QĐ sửa đổi 3176 (29/06/2026, áp dụng 01/07/2026): MUC_HUONG ≤4 ký tự.
 * Tiêu chuẩn JCI: Chương COP (Chăm sóc người bệnh) & ASC (Gây mê và Phẫu thuật)
 */

/** Độ dài tối đa MUC_HUONG — trước 01/7/2026: 3; từ 01/7/2026: 4 (QĐ sửa đổi 3176). */
export const MUC_HUONG_XML3_MAX_LENGTH_CU = 3;
export const MUC_HUONG_XML3_MAX_LENGTH_MOI = 4;

export const DANH_SACH_COT_XML3 = [
  'MA_LK', 'STT', 'MA_DICH_VU', 'MA_PTTT_QT', 'MA_VAT_TU', 'MA_NHOM', 
  'GOI_VTYT', 'TEN_VAT_TU', 'TEN_DICH_VU', 'MA_XANG_DAU', 'DON_VI_TINH', 
  'PHAM_VI', 'SO_LUONG', 'DON_GIA_BV', 'DON_GIA_BH', 'TT_THAU', 
  'TYLE_TT_DV', 'TYLE_TT_BH', 'THANH_TIEN_BV', 'THANH_TIEN_BH', 
  'T_TRANTT', 'MUC_HUONG', 'T_NGUONKHAC_NSNN', 'T_NGUONKHAC_VTNN', 
  'T_NGUONKHAC_VTTN', 'T_NGUONKHAC_CL', 'T_NGUONKHAC', 'T_BNTT', 
  'T_BNCCT', 'T_BHTT', 'MA_KHOA', 'MA_GIUONG', 'MA_BAC_SI', 
  'NGUOI_THUC_HIEN', 'MA_BENH', 'MA_BENH_YHCT', 'NGAY_YL', 
  'NGAY_TH_YL', 'NGAY_KQ', 'MA_PTTT', 'VET_THUONG_TP', 'PP_VO_CAM', 
  'VI_TRI_TH_DVKT', 'MA_MAY', 'MA_HIEU_SP', 'TAI_SU_DUNG', 'DU_PHONG'
];

// BỘ QUY TẮC KIỂM DUYỆT (VALIDATION RULES) DÀNH CHO XML3 ĐÃ ĐƯỢC CHUẨN HÓA 100% THEO PDF BẢNG 3
export const QUY_TAC_KIEM_TRA_XML3 = {
  MA_LK: { required: true, maxLength: 100, type: 'string', mo_ta: 'Là mã đợt điều trị duy nhất (PRIMARY KEY)' },
  STT: { required: true, maxLength: 10, type: 'number', mo_ta: 'Số thứ tự tăng từ 1 đến hết' },
  MA_DICH_VU: { required: false, maxLength: 50, type: 'string', mo_ta: 'Mã dịch vụ kỹ thuật hoặc mã tiền khám, tiền giường' },
  MA_PTTT_QT: { required: false, maxLength: 255, type: 'string', mo_ta: 'Mã phẫu thuật, thủ thuật quốc tế ICD-9 CM' },
  MA_VAT_TU: { required: false, maxLength: 255, type: 'string', mo_ta: 'Mã nhóm VTYT quy định tại TT 04/2017/TT-BYT' },
  MA_NHOM: { required: true, maxLength: 2, type: 'number', mo_ta: 'Mã nhóm theo chi phí' },
  GOI_VTYT: { required: false, maxLength: 3, type: 'string', mo_ta: 'Mã gói VTYT trong một lần sử dụng DVKT' },
  TEN_VAT_TU: { required: false, maxLength: 1024, type: 'string', mo_ta: 'Tên nhóm VTYT theo quy định tại TT 04/2017/TT-BYT' },
  TEN_DICH_VU: { required: false, maxLength: 1024, type: 'string', mo_ta: 'Tên dịch vụ kỹ thuật hoặc tên dịch vụ khám bệnh' },
  MA_XANG_DAU: { required: false, maxLength: 20, type: 'string', mo_ta: 'Mã loại xăng, dầu để tính chi phí vận chuyển' },
  DON_VI_TINH: { required: false, maxLength: 50, type: 'string', mo_ta: 'Đơn vị tính của VTYT hoặc DVKT' },
  PHAM_VI: { required: true, maxLength: 1, type: 'number', mo_ta: 'Mã xác định phạm vi hưởng BHYT' },
  SO_LUONG: { required: true, maxLength: 10, type: 'number', mo_ta: 'Số lượng ngày giường bệnh, công khám, DVKT hoặc VTYT' },
  DON_GIA_BV: { required: true, maxLength: 15, type: 'number', mo_ta: 'Đơn giá bệnh viện' },
  DON_GIA_BH: { required: true, maxLength: 15, type: 'number', mo_ta: 'Đơn giá do quỹ BHYT thanh toán' },
  TT_THAU: { required: false, maxLength: 255, type: 'string', mo_ta: 'Thông tin thầu của VTYT' },
  TYLE_TT_DV: { required: true, maxLength: 3, type: 'number', mo_ta: 'Tỷ lệ thanh toán đối với một số DVKT đặc biệt' },
  TYLE_TT_BH: { required: true, maxLength: 3, type: 'number', mo_ta: 'Tỷ lệ thanh toán BHYT đối với DVKT hoặc VTYT (%)' },
  THANH_TIEN_BV: { required: true, maxLength: 15, type: 'number', mo_ta: 'Số tiền thanh toán theo giá của bệnh viện' },
  THANH_TIEN_BH: { required: true, maxLength: 15, type: 'number', mo_ta: 'Mức giá do quỹ BHYT thanh toán' },
  T_TRANTT: { required: false, maxLength: 15, type: 'number', mo_ta: 'Mức thanh toán BHYT của VTYT (mức trần)' },
  MUC_HUONG: {
    required: true,
    maxLength: MUC_HUONG_XML3_MAX_LENGTH_CU,
    maxLengthMoi: MUC_HUONG_XML3_MAX_LENGTH_MOI,
    type: 'number',
    mo_ta: 'Mức hưởng BHYT tương ứng (≤3 ký tự trước 01/7/2026; ≤4 ký tự từ 01/7/2026)',
  },
  T_NGUONKHAC_NSNN: { required: false, maxLength: 15, type: 'number', mo_ta: 'Số tiền DVKT/VTYT được NSNN hỗ trợ' },
  T_NGUONKHAC_VTNN: { required: false, maxLength: 15, type: 'number', mo_ta: 'Số tiền được viện trợ ngoài nước hỗ trợ' },
  T_NGUONKHAC_VTTN: { required: false, maxLength: 15, type: 'number', mo_ta: 'Số tiền được viện trợ trong nước hỗ trợ' },
  T_NGUONKHAC_CL: { required: false, maxLength: 15, type: 'number', mo_ta: 'Số tiền được các nguồn khác còn lại hỗ trợ' },
  T_NGUONKHAC: { required: false, maxLength: 15, type: 'number', mo_ta: 'Số tiền do nguồn khác chi trả' },
  T_BNTT: { required: true, maxLength: 15, type: 'number', mo_ta: 'Số tiền người bệnh tự trả ngoài phạm vi' },
  T_BNCCT: { required: true, maxLength: 15, type: 'number', mo_ta: 'Số tiền người bệnh cùng chi trả' },
  T_BHTT: { required: true, maxLength: 15, type: 'number', mo_ta: 'Số tiền đề nghị BHXH thanh toán' },
  MA_KHOA: { required: true, maxLength: 50, type: 'string', mo_ta: 'Mã khoa nơi người bệnh được cung cấp DVKT, VTYT' },
  MA_GIUONG: { required: false, maxLength: 50, type: 'string', mo_ta: 'Mã giường tại khoa điều trị' },
  MA_BAC_SI: { required: true, maxLength: 255, type: 'string', mo_ta: 'Mã người hành nghề thực hiện khám, chỉ định (GPHN)' },
  NGUOI_THUC_HIEN: { required: false, maxLength: 255, type: 'string', mo_ta: 'Mã người hành nghề thực hiện dịch vụ kỹ thuật (GPHN)' },
  MA_BENH: { required: false, maxLength: 100, type: 'string', mo_ta: 'Mã ICD10 của bệnh hoặc triệu chứng cần chỉ định DVKT' },
  MA_BENH_YHCT: { required: false, maxLength: 150, type: 'string', mo_ta: 'Mã bệnh YHCT' },
  NGAY_YL: { required: true, maxLength: 12, type: 'string', mo_ta: 'Thời điểm ra y lệnh (YYYYMMDDHHMM)' },
  NGAY_TH_YL: { required: false, maxLength: 12, type: 'string', mo_ta: 'Thời điểm thực hiện y lệnh (YYYYMMDDHHMM)' },
  NGAY_KQ: { required: false, maxLength: 12, type: 'string', mo_ta: 'Thời điểm có kết quả hoặc kết thúc sử dụng giường bệnh' },
  MA_PTTT: { required: false, maxLength: 1, type: 'number', mo_ta: 'Mã phương thức thanh toán' },
  VET_THUONG_TP: { required: false, maxLength: 1, type: 'number', mo_ta: 'Mã của vết thương tái phát' },
  PP_VO_CAM: { required: false, maxLength: 1, type: 'number', mo_ta: 'Mã phương pháp vô cảm' },
  VI_TRI_TH_DVKT: { required: false, maxLength: 3, type: 'number', mo_ta: 'Mã vị trí thực hiện phẫu thuật hoặc thủ thuật' },
  MA_MAY: { required: false, maxLength: 1024, type: 'string', mo_ta: 'Mã các máy thực hiện DVKT/CLS' },
  MA_HIEU_SP: { required: false, maxLength: 255, type: 'string', mo_ta: 'Mã hiệu sản phẩm của VTYT' },
  TAI_SU_DUNG: { required: false, maxLength: 1, type: 'number', mo_ta: 'Mã đánh dấu đối với VTYT tái sử dụng' },
  DU_PHONG: { required: false, type: 'string', mo_ta: 'Trường dữ liệu dự phòng' }
};

/**
 * TÀI LIỆU THAM KHẢO
 * [1] Bộ Y tế (2024), Quyết định 3176/QĐ-BYT về chuẩn định dạng dữ liệu đầu ra phục vụ quản lý, kiểm tra, thanh toán BHYT.
 * [2] Joint Commission International (JCI), Chương COP & ASC - Đối chiếu thực hiện Y lệnh Lâm sàng.
 */