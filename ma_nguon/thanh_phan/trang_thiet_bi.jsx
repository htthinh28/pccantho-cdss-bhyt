/**
 * DANH MỤC THIẾT BỊ Y TẾ ĐỂ THỰC HIỆN DỊCH VỤ KỸ THUẬT ÁP DỤNG TRONG THANH TOÁN BHYT
 * Cấu trúc chuẩn: Đầy đủ 14 trường dữ liệu theo Mẫu số 06/DM (Thông tư 12/2026/TT-BTC)
 */

export const DANH_MUC_TRANG_THIET_BI_M06 = [
  {
    STT: 1, // Định dạng: Số. Số thứ tự
    
    TEN_TB: "Máy chụp X-quang kỹ thuật số", // Định dạng: Chuỗi. Tên thiết bị y tế
    
    KY_HIEU: "DR-2000", // Định dạng: Chuỗi. Model của thiết bị y tế
    
    CONGTY_SX: "Medical Systems Co.", // Định dạng: Chuỗi. Tên công ty sản xuất
    
    NUOC_SX: "Nhật Bản", // Định dạng: Chuỗi. Tên nước sản xuất
    
    NAM_SX: 2022, // Định dạng: Số (4 ký tự). Năm sản xuất
    
    NAM_SD: 2023, // Định dạng: Số (4 ký tự). Năm bắt đầu đưa vào sử dụng
    
    MA_MAY: "80001.01", // Định dạng: Số/Chuỗi. Mã máy thực hiện dịch vụ cận lâm sàng, phẫu thuật, thủ thuật (theo hướng dẫn QĐ 3176/QĐ-BYT)
    
    SO_LUU_HANH: "12345/BYT-TB", // Định dạng: Chuỗi. Số lưu hành của thiết bị y tế theo Nghị định số 07/2025/NĐ-CP
    
    HD_TU: "", // Định dạng: Chuỗi (YYYYMMDD). Chỉ ghi đối với thiết bị y tế có hợp đồng thuê, mua trả chậm, trả dần hoặc mượn. Thời điểm có hiệu lực trên hợp đồng
    
    HD_DEN: "", // Định dạng: Chuỗi (YYYYMMDD). Chỉ ghi đối với thiết bị y tế có hợp đồng thuê, mua trả chậm, trả dần hoặc mượn. Thời điểm hết hiệu lực trên hợp đồng
    
    TU_NGAY: "20260401", // Định dạng: Chuỗi (YYYYMMDD). Ngày hợp đồng có hiệu lực hoặc thời điểm đề nghị áp dụng
    
    DEN_NGAY: "20270401", // Định dạng: Chuỗi (YYYYMMDD). Thời điểm cuối cùng thiết bị y tế đủ điều kiện sử dụng (đối với thiết bị phải kiểm định/bức xạ/X-quang)
    
    MA_CSKCB: "80001" // Định dạng: Chuỗi. Mã cơ sở khám bệnh, chữa bệnh
  },
  {
    STT: 2,
    TEN_TB: "Hệ thống chụp cắt lớp vi tính (CT Scanner 128 lát cắt)",
    KY_HIEU: "Optima CT660",
    CONGTY_SX: "GE Healthcare",
    NUOC_SX: "Mỹ",
    NAM_SX: 2024,
    NAM_SD: 2024,
    MA_MAY: "80001.02",
    SO_LUU_HANH: "67890/BYT-TB",
    HD_TU: "20240101", 
    HD_DEN: "20291231",
    TU_NGAY: "20260401",
    DEN_NGAY: "20270401",
    MA_CSKCB: "80001"
  }
];