/**
 * HỆ THỐNG MÀU SẮC TOÀN CỤC (COLOR SYSTEM)
 * Dự án: CDSS BHYT - Tập đoàn Y tế Phương Châu
 * Tiêu chuẩn: JCI v8 - Nhận diện thương hiệu Y tế Phương Châu
 *
 * TRIẾT LÝ MÀU SẮC:
 *   - Hồng (#FF66A3 / #D81B60): Nhận diện thương hiệu, CTA chính
 *   - Xanh dương (#1976D2):     Thông tin, liên kết, dữ liệu trung lập
 *   - Xanh lá (#388E3C):        Xác nhận, hợp lệ, thành công
 *   - Đỏ (#D32F2F):             Lỗi nghiêm trọng, buộc phải sửa
 *   - Cam (#F57C00):            Cảnh báo, cần kiểm tra lại
 *   - Xám trung tính:           Nền, border, text phụ
 *
 * HƯỚNG DẪN SỬ DỤNG:
 *   import { MAU_SAC } from '../giao_dien/mau_sac';
 *   import { layMauMucDo, layMauNen } from '../giao_dien/mau_sac';
 *
 *   style={{ backgroundColor: MAU_SAC.thuong_hieu.chinh }}
 */

// ============================================================
// 1. BỘ MÀU THƯƠNG HIỆU PHƯƠNG CHÂU
// ============================================================
export const MAU_SAC = {

  // --- THƯƠNG HIỆU (Brand Colors) ---
  thuong_hieu: {
    chinh:        '#FF66A3',  // Hồng chủ đạo — header, tab active
    dam:          '#D81B60',  // Hồng đậm — nút thêm mới, action chính
    rat_dam:      '#C2185B',  // Hồng rất đậm — hover state, icon nhấn
    nhat:         '#FCE4EC',  // Hồng rất nhạt — nền section, table row
    vien:         '#F8BBD0',  // Hồng nhạt — border bảng, divider
    vien_du:      '#FFB3D1',  // Hồng trung — border input, card
    nen_trang:    '#FFF5F8',  // Trắng hồng — nền màn hình SafeAreaView
    nen_nhat:     '#FFF0F5',  // Hồng siêu nhạt — nền card, panel
  },

  // --- TRẠNG THÁI LÂM SÀNG (Clinical Status Colors) ---
  // Dùng cho cảnh báo giám định BHYT, kết quả CDSS
  trang_thai: {
    hop_le:       '#388E3C',  // Xanh lá — HỢP LỆ, đã xác nhận
    canh_bao:     '#F57C00',  // Cam — CẢNH BÁO, cần kiểm tra
    loi_nghiem:   '#D32F2F',  // Đỏ đậm — LỖI NGHIÊM TRỌNG, buộc sửa
    loi_nhe:      '#E65100',  // Cam đậm — LỖI cấu trúc/logic
    trung_lap:    '#E65100',  // Cam đậm — TRÙNG LẶP hồ sơ
    dang_xu_ly:   '#1976D2',  // Xanh dương — đang xử lý, loading
    thu_hoi:      '#757575',  // Xám — TỪ CHỐI / bỏ qua
  },

  // --- MÀU THÔNG TIN (Informational) ---
  thong_tin: {
    chinh:        '#1976D2',  // Xanh dương — tiêu đề panel, liên kết, mã ICD
    nhat:         '#E3F2FD',  // Xanh dương rất nhạt — nền thông tin
    vua:          '#BBDEFB',  // Xanh dương nhạt — border thông tin
    dam:          '#0D47A1',  // Xanh dương đậm — text trên nền sáng
    tuyen_duong:  '#1565C0',  // Xanh navy — header trang Hướng dẫn BYT
  },

  // --- MÀU THÀNH CÔNG (Success) ---
  thanh_cong: {
    chinh:        '#388E3C',  // Xanh lá chính — nút xác nhận, badge HỢP LỆ
    nhat:         '#E8F5E9',  // Xanh lá siêu nhạt — nền thành công
    vua:          '#C8E6C9',  // Xanh lá nhạt — border thành công
    dam:          '#1B5E20',  // Xanh lá đậm — text trên nền sáng
  },

  // --- MÀU CẢNH BÁO (Warning) ---
  canh_bao: {
    chinh:        '#F57C00',  // Cam chính — icon cảnh báo, badge
    nhat:         '#FFF8E1',  // Vàng rất nhạt — nền hàng cảnh báo
    vua:          '#FFE082',  // Vàng nhạt — border cảnh báo
    dam:          '#E65100',  // Cam đậm — text cảnh báo nghiêm
    nen_row:      '#FFF9C4',  // Vàng cực nhạt — highlight row trùng lặp XML
  },

  // --- MÀU LỖI / NGUY HIỂM (Error / Danger) ---
  loi: {
    chinh:        '#D32F2F',  // Đỏ chính — nút xóa, badge lỗi
    nhat:         '#FFEBEE',  // Đỏ rất nhạt — nền thông báo lỗi
    vua:          '#FFCDD2',  // Đỏ nhạt — border lỗi, highlight cột bất thường
    dam:          '#B71C1C',  // Đỏ đậm — text lỗi critical trên nền sáng
    critical:     '#D32F2F',  // Đỏ đậm — mức độ Critical (buộc sửa)
    error:        '#E65100',  // Cam đậm — mức độ Error (cấu trúc/logic)
    warning:      '#F57F17',  // Vàng đậm — mức độ Warning (rủi ro)
  },

  // --- MÀU TRUNG TÍNH (Neutral / Gray Scale) ---
  trung_tinh: {
    nen_trang:    '#FFFFFF',  // Trắng tinh — nền card, panel, modal
    nen_man_hinh: '#F0F4F8',  // Xám xanh nhạt — nền SafeAreaView
    nen_xam:      '#F5F5F5',  // Xám nhạt — nền section thứ cấp
    nen_border:   '#EFEFEF',  // Xám rất nhạt — nền bảng striped
    border_nhat:  '#EEEEEE',  // Xám nhạt — border mỏng, divider
    border_vua:   '#E0E0E0',  // Xám vừa — border input, card
    border_dam:   '#BDBDBD',  // Xám — border active, phân cách rõ
    chu_dam:      '#1A1A1A',  // Gần đen — text tiêu đề quan trọng
    chu_chinh:    '#333333',  // Đen mềm — text nội dung chính
    chu_phu:      '#555555',  // Xám đậm — text mô tả, placeholder
    chu_ghi_chu:  '#757575',  // Xám — ghi chú, text disabled
    chu_mo:       '#9E9E9E',  // Xám nhạt — placeholder, hint text
    chu_trang:    '#FFFFFF',  // Trắng — text trên nền đậm (nút, header)
  },

  // --- MÀU CHỦ ĐẠO (shorthand — tương thích ngược với code cũ) ---
  chu_dao:          '#FF66A3',  // = thuong_hieu.chinh
  chu_dao_dam:      '#D81B60',  // = thuong_hieu.dam

  // --- MÀU NỀN MÀN HÌNH ---
  nen_man_hinh:     '#F0F4F8',  // SafeAreaView background
  nen_card:         '#FFFFFF',  // Card, panel background

  // --- MÀU AVATAR / KHOA LÂM SÀNG (dùng trong biểu đồ, tag khoa) ---
  khoa: {
    noi:          '#1976D2',  // Nội khoa — xanh dương
    ngoai:        '#388E3C',  // Ngoại khoa — xanh lá
    san:          '#D81B60',  // Sản — hồng
    nhi:          '#F57C00',  // Nhi — cam
    mat:          '#00838F',  // Mắt — teal
    tai_mui_hong: '#5C6BC0',  // TMH — tím chàm
    rang:         '#8D6E63',  // Răng — nâu
    phuc_hoi:     '#26A69A',  // Phục hồi chức năng — teal nhạt
    cap_cuu:      '#D32F2F',  // Cấp cứu — đỏ
    icu:          '#B71C1C',  // ICU — đỏ đậm
  },
};

// ============================================================
// 2. HÀM TIỆN ÍCH MÀU SẮC
// ============================================================

/**
 * Trả về màu chữ + màu nền tương ứng theo mức độ cảnh báo CDSS
 * @param {string} muc_do — 'Critical' | 'Error' | 'Warning' | 'Info'
 * @returns {{ mau_nen: string, mau_chu: string, mau_vien: string }}
 */
export const layMauMucDo = (muc_do) => {
  switch (muc_do) {
    case 'Critical':
      return {
        mau_nen:  MAU_SAC.loi.nhat,
        mau_chu:  MAU_SAC.loi.dam,
        mau_vien: MAU_SAC.loi.vua,
        mau_icon: MAU_SAC.loi.critical,
      };
    case 'Error':
      return {
        mau_nen:  '#FBE9E7',
        mau_chu:  '#BF360C',
        mau_vien: '#FFCCBC',
        mau_icon: MAU_SAC.loi.error,
      };
    case 'Warning':
      return {
        mau_nen:  MAU_SAC.canh_bao.nhat,
        mau_chu:  '#E65100',
        mau_vien: MAU_SAC.canh_bao.vua,
        mau_icon: MAU_SAC.canh_bao.chinh,
      };
    case 'Info':
    default:
      return {
        mau_nen:  MAU_SAC.thong_tin.nhat,
        mau_chu:  MAU_SAC.thong_tin.dam,
        mau_vien: MAU_SAC.thong_tin.vua,
        mau_icon: MAU_SAC.thong_tin.chinh,
      };
  }
};

/**
 * Trả về màu nền + màu border cho hàng bảng theo trạng thái hồ sơ XML
 * @param {string} trang_thai — 'HOP_LE' | 'TRUNG_LAP' | 'THAY_THE' | 'TU_CHOI' | 'LOI'
 * @returns {{ mau_nen: string, mau_vien: string }}
 */
export const layMauHangBang = (trang_thai) => {
  switch (trang_thai) {
    case 'HOP_LE':
    case 'THAY_THE':
      return { mau_nen: '#F9FBF9', mau_vien: MAU_SAC.thanh_cong.vua };
    case 'TRUNG_LAP':
      return { mau_nen: MAU_SAC.canh_bao.nen_row, mau_vien: MAU_SAC.canh_bao.vua };
    case 'TU_CHOI':
      return { mau_nen: MAU_SAC.trung_tinh.nen_xam, mau_vien: MAU_SAC.trung_tinh.border_nhat };
    case 'LOI':
      return { mau_nen: MAU_SAC.loi.nhat, mau_vien: MAU_SAC.loi.vua };
    default:
      return { mau_nen: MAU_SAC.trung_tinh.nen_trang, mau_vien: MAU_SAC.trung_tinh.border_nhat };
  }
};

/**
 * Trả về màu badge trạng thái
 * @param {string} trang_thai — 'HOP_LE' | 'TRUNG_LAP' | 'LOI' | 'TU_CHOI'
 * @returns {{ mau_nen: string, mau_chu: string }}
 */
export const layMauBadge = (trang_thai) => {
  switch (trang_thai) {
    case 'HOP_LE':
    case 'THAY_THE':
      return { mau_nen: MAU_SAC.thanh_cong.chinh, mau_chu: '#FFFFFF' };
    case 'TRUNG_LAP':
      return { mau_nen: MAU_SAC.canh_bao.chinh, mau_chu: '#FFFFFF' };
    case 'LOI':
      return { mau_nen: MAU_SAC.loi.chinh, mau_chu: '#FFFFFF' };
    case 'TU_CHOI':
      return { mau_nen: MAU_SAC.trung_tinh.chu_ghi_chu, mau_chu: '#FFFFFF' };
    default:
      return { mau_nen: MAU_SAC.thong_tin.chinh, mau_chu: '#FFFFFF' };
  }
};

/**
 * Màu nền header theo từng module (nhất quán toàn app)
 * @param {string} module — 'huong_dan_byt' | 'phac_do' | 'quy_trinh' | 'giam_dinh' | 'kho'
 * @returns {string} mã màu hex
 */
export const layMauHeaderModule = (module) => {
  const MAP = {
    huong_dan_byt: MAU_SAC.thong_tin.tuyen_duong,  // Xanh đậm
    phac_do:       MAU_SAC.thuong_hieu.dam,          // Hồng đậm
    quy_trinh:     MAU_SAC.thuong_hieu.chinh,        // Hồng chính
    giam_dinh:     MAU_SAC.thuong_hieu.chinh,        // Hồng chính
    kho:           MAU_SAC.thuong_hieu.chinh,        // Hồng chính
    danh_muc:      '#5C6BC0',                         // Tím chàm
    bo_luat:       '#455A64',                         // Xám xanh đậm
  };
  return MAP[module] || MAU_SAC.thuong_hieu.chinh;
};

export default MAU_SAC;