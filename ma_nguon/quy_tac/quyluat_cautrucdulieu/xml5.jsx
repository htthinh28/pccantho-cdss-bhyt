/**
 * CẤU TRÚC DỮ LIỆU XML5: CHỈ TIÊU CHI TIẾT DIỄN BIẾN LÂM SÀNG
 * Căn cứ pháp lý: QĐ 3176/QĐ-BYT (2024), sửa đổi QĐ 4750/QĐ-BYT và QĐ 130/QĐ-BYT
 * Tiêu chuẩn JCI: Chương MOI (Management of Information) - Tính liên tục của bệnh án.
 */

export const DANH_SACH_COT_XML5 = [
  'MA_LK',       // 1. Mã lượt khám (Primary Key liên kết)
  'STT',         // 2. Số thứ tự diễn biến
  'DIEN_BIEN',   // 3. Nội dung diễn biến lâm sàng
  'HOI_CHAN',    // 4. Nội dung hội chẩn (nếu có)
  'PHAU_THUAT',  // 5. Tóm tắt phẫu thuật/thủ thuật (nếu có)
  'NGAY_YL',     // 6. Ngày giờ bác sĩ ghi nhận diễn biến (YYYYMMDDHHMI)
  'MA_BAC_SI',   // 7. Mã bác sĩ ghi diễn biến (Mã CCHN)
  'MA_KHOA',     // 8. Mã khoa phòng tại thời điểm diễn biến
  'DU_PHONG'     // 9. Trường dự phòng
];

// BỘ QUY TẮC KIỂM DUYỆT (VALIDATION RULES) CHO XML5
export const QUY_TAC_KIEM_TRA_XML5 = {
  MA_LK: { 
    required: true, 
    maxLength: 100, 
    type: 'string', 
    mo_ta: 'Mã lượt khám để liên kết với XML1' 
  },
  STT: { 
    required: true, 
    type: 'number', 
    mo_ta: 'Số thứ tự các lần ghi diễn biến' 
  },
  DIEN_BIEN: { 
    required: true, 
    type: 'string', 
    mo_ta: 'Nội dung tình trạng bệnh nhân, triệu chứng mới' 
  },
  NGAY_YL: { 
    required: true, 
    maxLength: 12, 
    type: 'string', 
    mo_ta: 'Thời điểm ghi diễn biến phải đúng định dạng YYYYMMDDHHMI' 
  },
  MA_BAC_SI: { 
    required: true, 
    type: 'string', 
    mo_ta: 'Mã chứng chỉ hành nghề của bác sĩ phụ trách' 
  },
  MA_KHOA: { 
    required: true, 
    type: 'string', 
    mo_ta: 'Khoa phòng đang điều trị bệnh nhân' 
  },
  // Quy tắc CDSS: Cảnh báo nếu DIEN_BIEN trống hoặc không khớp thời gian y lệnh tại XML2/XML3.
};

/**
 * TÀI LIỆU THAM KHẢO
 * [1] Bộ Y tế (2024), Quyết định số 3176/QĐ-BYT về chuẩn định dạng dữ liệu đầu ra phục vụ quản lý và thanh toán BHYT.
 * [2] Joint Commission International (JCI), Tiêu chuẩn MOI.2 về việc ghi chép diễn biến bệnh kịp thời và chính xác.
 */