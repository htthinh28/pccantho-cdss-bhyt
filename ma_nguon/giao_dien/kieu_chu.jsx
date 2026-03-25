/**
 * HỆ THỐNG KIỂU CHỮ TOÀN CỤC (TYPOGRAPHY SYSTEM)
 * Dự án: CDSS BHYT - Tập đoàn Y tế Phương Châu
 * Tiêu chuẩn: JCI v8 / HIMSS EMRAM Stage 7
 * Nguyên tắc: Mọi văn bản lâm sàng phải >= 20px để đảm bảo an toàn đọc
 *
 * HƯỚNG DẪN SỬ DỤNG:
 *   import { KIEU_CHU } from '../giao_dien/kieu_chu';
 *   import { stylesTieuDeManHinh, stylesChuNut } from '../giao_dien/kieu_chu';
 *
 *   style={{ fontFamily: KIEU_CHU.font_chinh, fontSize: KIEU_CHU.kich_co.than_chinh }}
 */

// ============================================================
// 1. FONT FAMILY
// ============================================================
export const KIEU_CHU = {
  // Font mặc định toàn app — Arial sẵn có trên mọi nền tảng Web/Mobile
  font_chinh: 'Arial',

  // Font mono cho mã ICD-10, mã BHYT, mã DVKT, mã bệnh viện
  font_ma: 'Courier New',

  // ============================================================
  // 2. CỠ CHỮ (đơn vị px)
  // Quy định nội bộ: KHÔNG được dùng cỡ chữ < 20px cho văn bản lâm sàng
  // Ngoại lệ duy nhất: trích_dan pháp lý cuối trang (18px)
  // ============================================================
  kich_co: {
    tieu_de_man_hinh: 34,  // Tiêu đề màn hình chính (Login, Dashboard header)
    tieu_de_chinh:    30,  // Tiêu đề panel lớn, section heading
    dau_de_2:         26,  // Heading cấp 2, tiêu đề cột phân khu
    dau_de_3:         24,  // Heading cấp 3, tên nhóm dữ liệu
    than_chinh:       22,  // Nội dung văn bản chính — CHUẨN TỐI THIỂU
    chu_nut:          22,  // Chữ trên nút bấm (TouchableOpacity)
    nhan_input:       22,  // Label trường nhập liệu
    o_nhap:           24,  // Chữ bên trong TextInput — to hơn để dễ nhập
    chu_nho:          20,  // Phụ đề, ghi chú, mô tả bổ sung — vẫn >= 20px
    tag_trang_thai:   20,  // Badge: HỢP LỆ / TRÙNG LẶP / LỖI
    ma_icd:           22,  // Mã ICD-10, mã BHYT (dùng font_ma)
    canh_bao:         20,  // Thông báo lỗi giám định, cảnh báo CDSS
    bang_tieu_de:     20,  // Header hàng/cột trong bảng dữ liệu
    bang_noi_dung:    22,  // Nội dung ô bảng (TextInput trong bảng)
    trich_dan:        18,  // Trích dẫn pháp lý cuối trang (ngoại lệ < 20px)
  },

  // ============================================================
  // 3. TRỌNG LƯỢNG CHỮ (font-weight)
  // ============================================================
  trong_luong: {
    dam:    'bold', // Tiêu đề, tên bệnh nhân, mã ICD nổi bật, nút chính
    vua:    '600',  // Label input, tên cột bảng, tiêu đề phụ
    thuong: '400',  // Nội dung văn bản thông thường, ghi chú
  },

  // ============================================================
  // 4. KHOẢNG CÁCH DÒNG (lineHeight — chủ yếu dùng trên Web)
  // ============================================================
  khoang_dong: {
    rong: 38,  // Đoạn văn dài: hướng dẫn điều trị, nội dung phác đồ
    vua:  32,  // Nội dung thông thường trong form, panel
    hep:  26,  // Danh sách gạch đầu dòng, ô bảng ngắn
    sat:  22,  // Nút bấm, tag trạng thái một dòng
  },

  // ============================================================
  // 5. KHOẢNG CÁCH KÝ TỰ (letterSpacing)
  // ============================================================
  gian_chu: {
    tieu_de: 1.0,  // Tiêu đề màn hình — thoáng, dễ đọc từ xa
    nut:     0.8,  // Nút CTA (VD: "XÁC THỰC HỆ THỐNG", "GIÁM ĐỊNH")
    thuong:  0,    // Văn bản thông thường
  },
};

// ============================================================
// 6. HÀM TIỆN ÍCH — Trả về StyleSheet object sẵn dùng
// Mục đích: Tránh lặp code, đảm bảo nhất quán toàn app
// ============================================================

/**
 * Style cho tiêu đề màn hình (header chính, thanh tieu_de)
 * Dùng tại: dang_nhap, tong_quan, man_hinh_kho_luu_tru, v.v.
 */
export const stylesTieuDeManHinh = (mauChu = '#FFFFFF') => ({
  fontFamily:    KIEU_CHU.font_chinh,
  fontSize:      KIEU_CHU.kich_co.tieu_de_man_hinh,
  fontWeight:    KIEU_CHU.trong_luong.dam,
  color:         mauChu,
  letterSpacing: KIEU_CHU.gian_chu.tieu_de,
});

/**
 * Style cho tiêu đề panel / section
 * Dùng tại: các panel trái/phải, tab content header
 */
export const stylesTieuDePanel = (mauChu = '#1976D2') => ({
  fontFamily: KIEU_CHU.font_chinh,
  fontSize:   KIEU_CHU.kich_co.dau_de_2,
  fontWeight: KIEU_CHU.trong_luong.dam,
  color:      mauChu,
});

/**
 * Style cho nội dung văn bản chính (đoạn văn, mô tả)
 * Dùng tại: nội dung phác đồ, hướng dẫn điều trị, kết quả giám định
 */
export const stylesNhanVanBan = (mauChu = '#333333') => ({
  fontFamily:  KIEU_CHU.font_chinh,
  fontSize:    KIEU_CHU.kich_co.than_chinh,
  fontWeight:  KIEU_CHU.trong_luong.thuong,
  color:       mauChu,
  lineHeight:  KIEU_CHU.khoang_dong.vua,
});

/**
 * Style cho chữ trên nút bấm (TouchableOpacity)
 * Dùng tại: mọi nút trong toàn app
 */
export const stylesChuNut = (mauChu = '#FFFFFF') => ({
  fontFamily:    KIEU_CHU.font_chinh,
  fontSize:      KIEU_CHU.kich_co.chu_nut,
  fontWeight:    KIEU_CHU.trong_luong.dam,
  color:         mauChu,
  letterSpacing: KIEU_CHU.gian_chu.nut,
});

/**
 * Style cho mã ICD-10, mã BHYT, mã dịch vụ kỹ thuật
 * Dùng tại: bảng dữ liệu, kết quả giám định, chi tiết hồ sơ
 */
export const stylesMaCode = (mauChu = '#1976D2') => ({
  fontFamily: KIEU_CHU.font_ma,
  fontSize:   KIEU_CHU.kich_co.ma_icd,
  fontWeight: KIEU_CHU.trong_luong.dam,
  color:      mauChu,
});

/**
 * Style cho ô nhập liệu TextInput
 * Dùng tại: mọi TextInput trong app
 */
export const stylesONhapLieu = (mauChu = '#000000') => ({
  fontFamily: KIEU_CHU.font_chinh,
  fontSize:   KIEU_CHU.kich_co.o_nhap,
  fontWeight: KIEU_CHU.trong_luong.thuong,
  color:      mauChu,
});

/**
 * Style cho label/nhãn của trường nhập liệu
 * Dùng tại: trên mỗi TextInput trong form
 */
export const stylesNhanInput = (mauChu = '#333333') => ({
  fontFamily: KIEU_CHU.font_chinh,
  fontSize:   KIEU_CHU.kich_co.nhan_input,
  fontWeight: KIEU_CHU.trong_luong.vua,
  color:      mauChu,
});

/**
 * Style cho trích dẫn pháp lý cuối trang (JCI, TT 23/2024, QĐ 130...)
 * Dùng tại: khu_vuc_trich_dan ở footer mọi màn hình
 */
export const stylesTrichDanPhapLy = (mauChu = '#9E9E9E') => ({
  fontFamily: KIEU_CHU.font_chinh,
  fontSize:   KIEU_CHU.kich_co.trich_dan,
  fontWeight: KIEU_CHU.trong_luong.thuong,
  color:      mauChu,
  fontStyle:  'italic',
});

/**
 * Style cho badge/tag trạng thái
 * Dùng tại: HỢP LỆ, TRÙNG LẶP, LỖI, THAY THẾ trong danh sách XML
 */
export const stylesBadgeTrangThai = (mauChu = '#FFFFFF') => ({
  fontFamily: KIEU_CHU.font_chinh,
  fontSize:   KIEU_CHU.kich_co.tag_trang_thai,
  fontWeight: KIEU_CHU.trong_luong.dam,
  color:      mauChu,
});

export default KIEU_CHU;