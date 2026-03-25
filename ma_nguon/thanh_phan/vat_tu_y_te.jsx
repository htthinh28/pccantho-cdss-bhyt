/**
 * DANH MỤC THIẾT BỊ Y TẾ (VẬT TƯ Y TẾ) ÁP DỤNG TRONG THANH TOÁN BẢO HIỂM Y TẾ
 * Cấu trúc chuẩn theo: Mẫu số 04/DM ban hành kèm theo Thông tư 12/2026/TT-BTC
 */

export const DANH_MUC_VAT_TU_M04 = [
  {
    STT: 1, // Định dạng: Số. Số thứ tự
    
    MA_VAT_TU: "VTYT.001", // Định dạng: Chuỗi. Mã theo danh mục dùng chung do Bộ Y tế ban hành (TT 04/2017/TT-BYT, 24/2025/TT-BYT)
    
    NHOM_VAT_TU: "Vật tư y tế tiêu hao", // Định dạng: Chuỗi. Tên nhóm thiết bị y tế
    
    TEN_VAT_TU: "Gạc phẫu thuật 10x10 tiệt trùng", // Định dạng: Chuỗi. Tên thương mại ghi theo quyết định trúng thầu
    
    MA_HIEU: "GAC-1010", // Định dạng: Chuỗi. Mã hiệu ghi theo hướng dẫn tại Quyết định 3176/QĐ-BYT
    
    SO_LUU_HANH: "12345/BYT-TB", // Định dạng: Chuỗi. Số lưu hành của thiết bị y tế theo Nghị định 07/2025/NĐ-CP
    
    TINHNANG_KT: "Vải cotton y tế, tiệt trùng bằng khí EO", // Định dạng: Chuỗi. Cấu hình, tính năng kỹ thuật cơ bản
    
    QUY_CACH: "Gói 10 miếng", // Định dạng: Chuỗi. Quy cách đóng gói
    
    DON_VI_TINH: "Gói", // Định dạng: Chuỗi. Đơn vị tính
    
    DON_GIA: 15000, // Định dạng: Số. Đơn giá trúng thầu hoặc mua sắm
    
    DON_GIA_BH: 15000, // Định dạng: Số. Đơn giá làm cơ sở thanh toán BHYT
    
    TYLE_TT_BH: 100, // Định dạng: Số. Tỷ lệ thanh toán BHYT (%)
    
    NHA_SX: "Medical Co.", // Định dạng: Chuỗi. Tên hãng / Nhà sản xuất
    
    NUOC_SX: "Việt Nam", // Định dạng: Chuỗi. Nước sản xuất
    
    NHA_THAU: "Công ty Cổ phần Thiết bị Y tế", // Định dạng: Chuỗi. Tên nhà thầu cung cấp
    
    QD_THAU: "123/QD-BV", // Định dạng: Chuỗi. Số quyết định trúng thầu/mua sắm
    
    TU_NGAY_HD: "20250101", // Định dạng: Chuỗi (YYYYMMDD). Thời điểm hiệu lực hợp đồng cung ứng
    
    DEN_NGAY_HD: "20261231", // Định dạng: Chuỗi (YYYYMMDD). Thời điểm hết hiệu lực hợp đồng
    
    LOAI_THAU: 2, // Định dạng: Số. 1: Tập trung; 2: Cơ sở KBCB tự tổ chức đấu thầu...
    
    HT_THAU: 1, // Định dạng: Số. Hình thức đấu thầu
    
    TT_THAU: "123.2024/QD-BV", // Định dạng: Chuỗi. Thông tin gói thầu
    
    MA_CSKCB_THAU: "", // Định dạng: Chuỗi. Mã cơ sở KBCB đấu thầu hộ (nếu có)
    
    MA_CSKCB_CHUYEN: "", // Định dạng: Chuỗi. Nhận thiết bị y tế điều chuyển từ CSKCB khác ghi C.XXXXX
    
    TU_NGAY: "20260401", // Định dạng: Chuỗi (YYYYMMDD). Ghi ngày hợp đồng có hiệu lực hoặc thời điểm đề nghị áp dụng
    
    DEN_NGAY: "", // Định dạng: Chuỗi (YYYYMMDD). Ghi thời điểm ngừng áp dụng thiết bị y tế này
    
    MA_CSKCB: "80001" // Định dạng: Chuỗi. Mã cơ sở KBCB
  }
];