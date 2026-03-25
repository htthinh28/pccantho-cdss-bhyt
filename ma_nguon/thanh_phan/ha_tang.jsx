/**
 * DANH MỤC HẠ TẦNG VÀ HỆ THỐNG PHỤ TRỢ (FACILITY & INFRASTRUCTURE)
 * Phục vụ báo cáo năng lực KBCB BHYT và Quản trị rủi ro cơ sở vật chất (JCI FMS)
 * Dữ liệu: Bệnh viện Quốc tế Phương Châu Sóc Trăng
 */

export const DANH_MUC_HA_TANG = {
  // ==========================================
  // 1. QUY MÔ DIỆN TÍCH TỔNG THỂ
  // ==========================================
  DIEN_TICH_TONG_THE: {
    TONG_DIEN_TICH_SAN: 7442.40, // Đơn vị: m2
    DIEN_TICH_TRUNG_BINH_GIUONG: 126.48 // Đơn vị: m2/giường
  },

  // ==========================================
  // 2. PHÂN BỔ DIỆN TÍCH THEO PHÂN KHU CHỨC NĂNG (TẦNG)
  // ==========================================
  PHAN_KHU_CHUC_NANG: {
    TANG_G: [
      { TEN_KHU: "Khu tiếp nhận", DIEN_TICH: 373.3 },
      { TEN_KHU: "Khu cấp cứu lưu bệnh", DIEN_TICH: 252.2 },
      { TEN_KHU: "Các phòng khám", DIEN_TICH: 438.8 },
      { TEN_KHU: "Khu chẩn đoán hình ảnh", DIEN_TICH: 239.9 }
    ],
    TANG_1: [
      { TEN_KHU: "Khu vực khám ngoại khoa", DIEN_TICH: 419.0 },
      { TEN_KHU: "Khu vực khám nội khoa", DIEN_TICH: 243.0 },
      { TEN_KHU: "Khu khám nhi", DIEN_TICH: 196.0 },
      { TEN_KHU: "Khu vực tiêm ngừa", DIEN_TICH: 264.0 }
    ],
    TANG_2: [
      { TEN_KHU: "Khoa gây mê hồi sức", DIEN_TICH: 454.8 },
      { TEN_KHU: "Khu phòng sanh", DIEN_TICH: 318.5 },
      { TEN_KHU: "Khu sơ sinh", DIEN_TICH: 145.6 }
    ],
    TANG_3: [
      { TEN_KHU: "Khu điều trị nội trú", DIEN_TICH: 669.3 },
      { TEN_KHU: "Khu vực hành chánh khoa", DIEN_TICH: 206.9 }
    ],
    TANG_4_5: [
      { TEN_KHU: "Khu điều trị nội trú", DIEN_TICH: 714.9 },
      { TEN_KHU: "Khu vực hành chánh khoa", DIEN_TICH: 206.9 }
    ],
    TANG_6: [
      { TEN_KHU: "Khu điều trị nội trú", DIEN_TICH: 271.0 },
      { TEN_KHU: "Khoa kiểm soát nhiễm khuẩn", DIEN_TICH: 330.4 },
      { TEN_KHU: "Khoa xét nghiệm", DIEN_TICH: 200.0 }
    ],
    TANG_7: [
      { TEN_KHU: "Hội trường", DIEN_TICH: 399.0 },
      { TEN_KHU: "Kho lưu trữ", DIEN_TICH: 142.0 }
    ]
  },

  // ==========================================
  // 3. ĐIỀU KIỆN VỆ SINH MÔI TRƯỜNG & AN TOÀN
  // ==========================================
  VE_SINH_MOI_TRUONG: {
    XU_LY_NUOC_THAI: {
      CONG_SUAT_THIET_KE: 120, // m3/ngày đêm
      LUONG_XA_THAI_HIENTAI: 30, // m3/ngày đêm
      CONG_NGHE: "Vi sinh hiếu khí và hóa học",
      TINH_TRANG_PHAP_LY: "Đã được Sở TN-MT nghiệm thu, xả ra hệ thống thành phố"
    },
    QUAN_LY_RAC_THAI: {
      RAC_Y_TE: { KHOI_LUONG_THANG: 665, DON_VI: "kg", DOI_TAC_XU_LY: "Công ty TNHH SX-TM-DV Môi trường Việt Xanh" },
      RAC_SINH_HOAT: { KHOI_LUONG_THANG: 23, DON_VI: "m3", DOI_TAC_XU_LY: "Công ty Cổ phần công trình đô thị Sóc Trăng" },
      RAC_TAI_CHE: { KHOI_LUONG_THANG: 502, DON_VI: "kg", DOI_TAC_XU_LY: "Công ty TNHH Đầu tư Dịch vụ Thương mại Mai Nguyên" }
    },
    AN_TOAN_BUC_XA: "Đạt chứng nhận An toàn bức xạ"
  },

  // ==========================================
  // 4. HỆ THỐNG PHỤ TRỢ (CƠ ĐIỆN, KHÍ Y TẾ, CNTT)
  // ==========================================
  HE_THONG_PHU_TRO: {
    PHONG_CHAY_CHUA_CHAY: {
      BON_NUOC: { TRU_LUONG: 530, DON_VI: "m3" },
      MAY_BOM: "01 máy điện, 01 máy diezel, 01 máy bù áp",
      TRAM_VOI: 44,
      CAM_BIEN_NHIET: { SO_LUONG: 1016, NHIET_DO_KICH_HOAT: 68, DON_VI: "Độ C" },
      TINH_NANG: "Hệ thống chữa cháy tự động toàn bộ các tầng"
    },
    KHI_Y_TE: {
      OXY_TRUNG_TAM: { LUU_LUONG: ">= 495 lít/phút", CHUYEN_MON: "Dàn 2x10 bình (6m3/bình)" },
      HUT_TRUNG_TAM: { LUU_LUONG: ">= 1500 lít/phút" },
      NEN_TRUNG_TAM: { LUU_LUONG: "640 lít/phút", AP_SUAT: "4 bar" },
      KHI_CO2: "08 bình",
      QUAN_LY_AN_TOAN: "Ống đồng y tế dán nhãn, hộp van cách ly từng khu, hệ thống báo động 4 đường khí, ống đặt trong hộp SP chống cháy."
    },
    DIEN_NANG: {
      TRAM_BIEN_AP: { CONG_SUAT: 630, DON_VI: "KVA", NGUON: "22KV - Điện lực Cần Thơ" },
      MAY_PHAT_DU_PHONG: { CONG_SUAT: 500, DON_VI: "KVA", TINH_NANG: "Tủ chuyển đổi tự động (ATS)" }
    },
    CONG_NGHE_THONG_TIN: [
      "Hệ thống điện thoại liên lạc nội bộ và tổng đài toàn quốc",
      "Mạng LAN/Internet phủ toàn bệnh viện",
      "Hệ thống CNTT quản lý Bệnh viện (HIS)",
      "Hệ thống quản lý xét nghiệm (LIS), lưu trữ hình ảnh (PACS)",
      "Hệ thống vận chuyển mẫu bệnh phẩm, máu tự động (Pneumatic tube)",
      "Hệ thống loa phát thanh nội bộ",
      "Trang web bệnh viện"
    ]
  }
};