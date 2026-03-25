/**
 * CẤU TRÚC DỮ LIỆU XML4: CHỈ TIÊU CHI TIẾT KẾT QUẢ CẬN LÂM SÀNG
 * Căn cứ pháp lý: QĐ 3176/QĐ-BYT (2024), sửa đổi QĐ 4750/QĐ-BYT và QĐ 130/QĐ-BYT
 * Tiêu chuẩn JCI: Chương AOP (Đánh giá người bệnh) & QPS (Cải thiện chất lượng)
 */

// DANH SÁCH 12 CỘT CHUẨN XML4 THEO QUYẾT ĐỊNH CỦA BỘ Y TẾ
export const DANH_SACH_COT_XML4 = [
  'MA_LK', 
  'STT', 
  'MA_DICH_VU', 
  'MA_CHI_SO', 
  'TEN_CHI_SO', 
  'GIA_TRI', 
  'DON_VI_DO', 
  'MO_TA', 
  'KET_LUAN', 
  'NGAY_KQ', 
  'MA_BS_DOC_KQ', 
  'DU_PHONG'
];

// BỘ QUY TẮC KIỂM DUYỆT (VALIDATION RULES) DÀNH CHO XML4 ĐÃ ĐƯỢC CHUẨN HÓA 100% THEO PDF BẢNG 4
export const QUY_TAC_KIEM_TRA_XML4 = {
  MA_LK: { 
    required: true, 
    maxLength: 100, 
    type: 'string', 
    mo_ta: 'Là mã đợt điều trị duy nhất (PRIMARY KEY liên kết XML1)' 
  },
  STT: { 
    required: true, 
    maxLength: 10,
    type: 'number', 
    mo_ta: 'Số thứ tự tăng từ 1 đến hết trong một lần gửi dữ liệu' 
  },
  MA_DICH_VU: { 
    required: true, 
    maxLength: 50,
    type: 'string', 
    mo_ta: 'Ghi mã dịch vụ kỹ thuật cận lâm sàng theo danh mục dùng chung' 
  },
  MA_CHI_SO: { 
    required: false, 
    maxLength: 255,
    type: 'string', 
    mo_ta: 'Mã chỉ số xét nghiệm, chẩn đoán hình ảnh, thăm dò chức năng theo Phụ lục 11. Chưa có mã thì tạm mã hóa bằng tên' 
  },
  TEN_CHI_SO: { 
    required: false, 
    maxLength: 255, 
    type: 'string', 
    mo_ta: 'Tên chỉ số xét nghiệm, chẩn đoán hình ảnh, thăm dò chức năng (Chỉ ghi các chỉ số có đơn vị đo lường)' 
  },
  GIA_TRI: { 
    required: false, 
    maxLength: 255,
    type: 'string', 
    mo_ta: 'Giá trị chỉ số (kết quả xét nghiệm, thăm dò chức năng)' 
  },
  DON_VI_DO: { 
    required: false, 
    maxLength: 50,
    type: 'string', 
    mo_ta: 'Đơn vị đo của chỉ số xét nghiệm, thăm dò chức năng theo Phụ lục 11' 
  },
  MO_TA: { 
    required: false, 
    type: 'string', 
    mo_ta: 'Mô tả kết quả cận lâm sàng (chẩn đoán hình ảnh, thăm dò chức năng, giải phẫu bệnh) của người đọc kết quả' 
  },
  KET_LUAN: { 
    required: false, 
    type: 'string', 
    mo_ta: 'Các kết luận của người đọc kết quả. Trường hợp xét nghiệm có kết quả xác định ở trường GIA_TRI thì để trống' 
  },
  NGAY_KQ: { 
    required: false, 
    maxLength: 12, 
    type: 'string', 
    mo_ta: 'Thời điểm có kết quả cận lâm sàng (YYYYMMDDHHMM)' 
  },
  MA_BS_DOC_KQ: { 
    required: false, 
    maxLength: 255,
    type: 'string', 
    mo_ta: 'Mã của người có thẩm quyền đọc hoặc duyệt kết quả đọc (mã hóa theo số GPHN)' 
  },
  DU_PHONG: { 
    required: false, 
    type: 'string', 
    mo_ta: 'Trường dữ liệu dự phòng khi cần thiết' 
  }
};

/**
 * TÀI LIỆU THAM KHẢO
 * [1] Bộ Y tế (2024), Quyết định 3176/QĐ-BYT về chuẩn định dạng dữ liệu đầu ra phục vụ quản lý, giám định, thanh toán BHYT.
 * [2] Joint Commission International (JCI), Chương AOP - Đánh giá kết quả cận lâm sàng chính xác, kịp thời.
 */