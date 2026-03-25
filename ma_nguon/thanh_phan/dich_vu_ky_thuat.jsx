/**
 * DANH MỤC DỊCH VỤ KHÁM BỆNH, CHỮA BỆNH ÁP DỤNG TRONG THANH TOÁN BẢO HIỂM Y TẾ
 * Cấu trúc chuẩn: Đầy đủ 26 trường dữ liệu theo Mẫu số 05/DM (Thông tư 12/2026/TT-BTC)
 */

export const DANH_MUC_DVKT_M05 = [
  {
    // --- NHÓM THÔNG TIN CƠ BẢN ---
    STT: 1, // 1. Số thứ tự (Số)
    MA_DICH_VU: "PT.001", // 2. Mã dịch vụ KBCB theo QĐ 3176/QĐ-BYT (Chuỗi)
    TEN_DICH_VU: "Phẫu thuật nội soi lấy sỏi thận", // 3. Tên DVKT được cấp thẩm quyền phê duyệt (Chuỗi)
    TEN_DVKT_GIA: "Phẫu thuật nội soi lấy sỏi thận [gây mê]", // 4. Tên dịch vụ phê duyệt giá, có ghi chú vô cảm (Chuỗi)
    DON_GIA: 5600000, // 5. Đơn giá DVKT thanh toán BHYT chưa bao gồm thuốc PX/CĐD (Số)
    QUY_TRINH: "20240505_QD10", // 6. Ngày, số quyết định ban hành Quy trình chuyên môn (Chuỗi)
    QD_DVKT: "20240101_QD01", // 7. Ngày, số quyết định phê duyệt DMKT của cơ sở (Chuỗi)
    
    // --- NHÓM THÔNG TIN MỞ RỘNG & PHÂN LOẠI ---
    MA_GIA: "GIA_PT01", // 8. Mã giá phân loại dịch vụ (Chuỗi)
    TYLE_TT_BH: 100, // 9. Tỷ lệ thanh toán BHYT (Số)
    TT_THAU: "", // 10. Thông tin thầu đối với dịch vụ thuê ngoài (Chuỗi)
    NHA_SX_MAY: "Olympus", // 11. Tên hãng sản xuất máy/thiết bị thực hiện DVKT (Chuỗi)
    NUOC_SX_MAY: "Nhật Bản", // 12. Nước sản xuất máy (Chuỗi)
    MA_MAY: "NS_01", // 13. Mã máy/thiết bị thực hiện dịch vụ (Chuỗi)
    
    // --- NHÓM THÔNG TIN THUỐC PHÓNG XẠ & CHẤT ĐÁNH DẤU ---
    DON_GIA_THUOC: 0, // 14. Đơn giá thuốc phóng xạ / chất đánh dấu (Số)
    MA_THUOC_PX: "", // 15. Mã thuốc phóng xạ (Chuỗi)
    LIEU_BQ_PX: 0, // 16. Liều bình quân thuốc phóng xạ (Số)
    TLTHUCTE_BQ_PX: 0, // 17. Tỷ lệ thực tế bình quân thuốc phóng xạ (Số)
    MA_CDD: "", // 18. Mã chất đánh dấu (Chuỗi)
    DM_THUCTE_CDD: 0, // 19. Định mức thực tế chất đánh dấu (Số)
    THANH_TIEN_THUOC: 0, // 20. Thành tiền chi phí thuốc phóng xạ / chất đánh dấu (Số)
    
    // --- NHÓM THÔNG TIN VẬT TƯ ĐẶC THÙ ĐI KÈM ---
    DON_GIA_VTYT: 0, // 21. Đơn giá VTYT chưa bao gồm trong giá DVKT (Số)
    THANH_TIEN_VTYT: 0, // 22. Thành tiền chi phí VTYT đặc thù (Số)
    
    // --- NHÓM TỔNG HỢP THANH TOÁN & QUẢN LÝ ---
    GIA_THANH_TOAN: 5600000, // 23. Giá thanh toán BHYT cuối cùng (DON_GIA + THANH_TIEN_THUOC) (Số)
    TU_NGAY: "20260401", // 24. Ngày hợp đồng có hiệu lực hoặc thời điểm áp dụng (Chuỗi - YYYYMMDD)
    DEN_NGAY: "", // 25. Thời điểm ngừng áp dụng (Chuỗi - YYYYMMDD)
    MA_CSKCB: "80001" // 26. Mã cơ sở khám bệnh, chữa bệnh (Chuỗi)
  },
  
  // VÍ DỤ 2: DỊCH VỤ CÓ THUỐC PHÓNG XẠ (PET/CT)
  {
    STT: 2,
    MA_DICH_VU: "HA.02",
    TEN_DICH_VU: "Chụp PET/CT toàn thân",
    TEN_DVKT_GIA: "Chụp PET/CT toàn thân",
    DON_GIA: 19500000,
    QUY_TRINH: "20240101_HA02",
    QD_DVKT: "20240101_QD01",
    MA_GIA: "GIA_HA02",
    TYLE_TT_BH: 100,
    TT_THAU: "123/QD-BV",
    NHA_SX_MAY: "GE Healthcare",
    NUOC_SX_MAY: "Mỹ",
    MA_MAY: "PET_01",
    DON_GIA_THUOC: 150000,
    MA_THUOC_PX: "PX_F18",
    LIEU_BQ_PX: 10,
    TLTHUCTE_BQ_PX: 1,
    MA_CDD: "",
    DM_THUCTE_CDD: 0,
    THANH_TIEN_THUOC: 1500000,
    DON_GIA_VTYT: 0,
    THANH_TIEN_VTYT: 0,
    GIA_THANH_TOAN: 21000000, // 19,500,000 + 1,500,000
    TU_NGAY: "20260401",
    DEN_NGAY: "",
    MA_CSKCB: "80001"
  }
];