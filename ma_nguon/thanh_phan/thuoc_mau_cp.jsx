/**
 * DANH MỤC THUỐC, MÁU, CHẾ PHẨM MÁU ÁP DỤNG TRONG THANH TOÁN BHYT
 * Cấu trúc chuẩn theo: Mẫu số 03/DM ban hành kèm theo Thông tư 12/2026/TT-BTC
 */

export const DANH_MUC_THUOC_MAU_M03 = [
  // ----------------------------------------------------
  // VÍ DỤ 1: THUỐC TÂN DƯỢC (Kháng sinh)
  // ----------------------------------------------------
  {
    STT: 1, //
    MA_THUOC: "J01DC02", // Mã thuốc theo hướng dẫn tại QĐ 3176/QĐ-BYT
    TEN_HOAT_CHAT: "Cefuroxim", // Tên hoạt chất/thành phần
    TEN_THUOC: "Zinnat 500mg", //
    DON_VI_TINH: "Viên", //
    HAM_LUONG: "500mg", //
    DUONG_DUNG: "Uống", //
    MA_DUONG_DUNG: "1.01", // Mã đường dùng theo danh mục dùng chung
    DANG_BAO_CHE: "Viên nén bao phim", //
    SO_DANG_KY: "VN-12345-19", //
    SO_LUONG: 10000, // Số lượng trúng thầu
    DON_GIA: 15000, //
    DON_GIA_BH: 15000, // Đơn giá thanh toán BHYT
    QUY_CACH: "Hộp 1 vỉ x 10 viên", //
    NHA_SX: "Glaxo Operations UK Limited", //
    NUOC_SX: "Anh", //
    NHA_THAU: "Công ty Cổ phần Dược phẩm", //
    TT_THAU: "123.2024/QD-BVT", //
    TU_NGAY_HD: "20250101", // Thời điểm hiệu lực hợp đồng cung ứng
    DEN_NGAY_HD: "20261231", //
    MA_CSKCB: "80001", //
    LOAI_THUOC: 1, // 1: Tân dược; 2: Chế phẩm; 3: Vị thuốc; 4: Phóng xạ; 9: Máu; 10: CP Máu
    LOAI_THAU: 1, // 1: Tập trung; 2: Riêng tại CS KBCB...
    HT_THAU: 1, // Hình thức đấu thầu (1: Rộng rãi)
    MA_DVKT: "", // Chỉ dùng cho thuốc phóng xạ
    TCCL: "", // Tiêu chuẩn chất lượng
    BO_PHAN_VT: "", // Chỉ dùng cho dược liệu
    TEN_KHOA_HOC: "", //
    NGUON_GOC: "", //
    PP_CHEBIEN: "", //
    MA_DL_NHAP: "", //
    MA_DL_CB: "", //
    TLHH_CB: "", // Tỷ lệ hao hụt chế biến
    TLHH_BQ: "", // Tỷ lệ hao hụt bảo quản
    MA_CSKCB_THUOC: "", // Nơi chuyển thuốc đến (nếu có)
    TU_NGAY: "20260401", //
    DEN_NGAY: "" //
  },

  // ----------------------------------------------------
  // VÍ DỤ 2: CHẾ PHẨM MÁU
  // ----------------------------------------------------
  {
    STT: 2,
    MA_THUOC: "M01.01",
    TEN_HOAT_CHAT: "", // Máu, chế phẩm máu không ghi chỉ tiêu này
    TEN_THUOC: "Khối hồng cầu 250ml",
    DON_VI_TINH: "Đơn vị",
    HAM_LUONG: "250ml", // Thể tích thực của máu/chế phẩm máu
    DUONG_DUNG: "Truyền tĩnh mạch",
    MA_DUONG_DUNG: "1.04",
    DANG_BAO_CHE: "", // Máu, chế phẩm máu không ghi chỉ tiêu này
    SO_DANG_KY: "",
    SO_LUONG: 500,
    DON_GIA: 415000,
    DON_GIA_BH: 415000,
    QUY_CACH: "Túi 250ml",
    NHA_SX: "Viện Huyết học Truyền máu TW",
    NUOC_SX: "Việt Nam",
    NHA_THAU: "Viện Huyết học Truyền máu TW",
    TT_THAU: "Mua sắm trực tiếp",
    TU_NGAY_HD: "20250101",
    DEN_NGAY_HD: "20261231",
    MA_CSKCB: "80001",
    LOAI_THUOC: 10, // 10: Chế phẩm máu
    LOAI_THAU: 4, 
    HT_THAU: 5,
    MA_DVKT: "",
    TCCL: "",
    BO_PHAN_VT: "",
    TEN_KHOA_HOC: "",
    NGUON_GOC: "",
    PP_CHEBIEN: "",
    MA_DL_NHAP: "",
    MA_DL_CB: "",
    TLHH_CB: "",
    TLHH_BQ: "",
    MA_CSKCB_THUOC: "",
    TU_NGAY: "20260401",
    DEN_NGAY: ""
  }
];