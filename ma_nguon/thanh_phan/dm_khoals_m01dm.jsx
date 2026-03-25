/**
 * DANH MỤC BỘ PHẬN CHUYÊN MÔN KHÁM BỆNH, CHỮA BỆNH BẢO HIỂM Y TẾ
 * Cấu trúc chuẩn theo: Mẫu số 01/DM 
 */

export const DANH_MUC_KHOA_LS_M01 = [
  {
    STT: 1, // Định dạng: Số. Số thứ tự
    
    MA_KHOA: "K01", // Định dạng: Chuỗi. Mã khám bệnh, mã khoa theo danh mục dùng chung do Bộ Y tế ban hành. Bàn khám ngoại trú ghi mã khám bệnh. Khoa lâm sàng/cận lâm sàng ghi mã khoa...
    
    TEN_KHOA: "Khoa Khám bệnh", // Định dạng: Chuỗi. Tên chuyên khoa tương ứng hoặc Tên khoa theo quyết định được cấp có thẩm quyền phê duyệt.
    
    BAN_KHAM: 15, // Định dạng: Số. Số lượng bàn khám từng chuyên khoa hoặc khoa lâm sàng.
    
    GIUONG_PD: 0, // Định dạng: Số. Số giường bệnh nội trú tại từng bộ phận chuyên môn được cấp thẩm quyền phê duyệt tại thời điểm cấp phép...
    
    GIUONG_TK: 0, // Định dạng: Số. Tổng số giường bệnh thực tế tại từng khoa.
    
    GIUONG_HSTC: 0, // Định dạng: Số. Số giường hồi sức tích cực đủ điều kiện theo quy định của Bộ Y tế.
    
    GIUONG_HSCC: 0, // Định dạng: Số. Số giường hồi sức cấp cứu đủ điều kiện theo quy định của Bộ Y tế.
    
    TU_NGAY: "20260401", // Định dạng: Chuỗi (8 ký tự YYYYMMDD). Ngày hợp đồng có hiệu lực hoặc thời điểm áp dụng khi điều chỉnh.
    
    DEN_NGAY: "", // Định dạng: Chuỗi (8 ký tự YYYYMMDD). Chỉ ghi khi cập nhật, điều chỉnh bàn khám, giường bệnh hoặc khoa dừng hoạt động.
    
    MA_CSKCB: "80001" // Định dạng: Chuỗi. Mã cơ sở khám bệnh, chữa bệnh.
  },
  {
    STT: 2,
    MA_KHOA: "K03",
    TEN_KHOA: "Khoa Nội tổng hợp",
    BAN_KHAM: 2,
    GIUONG_PD: 50,
    GIUONG_TK: 55,
    GIUONG_HSTC: 5,
    GIUONG_HSCC: 2,
    TU_NGAY: "20260401",
    DEN_NGAY: "",
    MA_CSKCB: "80001"
  }
];