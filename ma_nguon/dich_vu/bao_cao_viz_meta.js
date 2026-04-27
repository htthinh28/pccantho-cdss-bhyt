/**
 * Metadata hiển thị / biểu đồ — SPEC-VIZ-2.0.3 (thế hệ 2026: drill_registry, dataset_meta_viz, theme_config).
 * Tách logic UI khỏi dữ liệu thô; không đổi grain fact/báo cáo. Reader SPEC-VIZ-1 vẫn đọc được widgets/theme/drill.
 */

export const PHEN_BAN_VIZ = 'SPEC-VIZ-2.0.3';

/** Giữ định danh phiên bản trước cho tài liệu / audit so sánh */
export const PHEN_BAN_VIZ_LEGACY = 'SPEC-VIZ-1';

/** Pink theme Phương Châu + đối lập bổ trợ (WCAG-friendly pairs) */
const PALETTE_PHUONG_CHAU = ['#E83E8C', '#FF6B6B', '#4ECDC4', '#45B7D1', '#9B59B6', '#F06292', '#26A69A', '#42A5F5'];

const widgetBase = () => ({
  tuong_tac: {
    bat_tooltip: true,
    bat_chon_dong: true,
    hanh_dong_chon: 'loc_bang_duoi',
    bo_loc_ap_dung: {},
  },
  toa_do_dong: true,
  diem_bieu_do: [],
  nguong_canh_bao: [],
});

const wdg = (w) => ({ ...widgetBase(), ...w });

/**
 * Đăng ký drill-down khai báo (Hub hiện map state cục bộ; đây là blueprint cho UI/BI đồng bộ).
 * @returns {Array<{ id: string, cap: number, nguon: string, dich: string[], khoa_goi_y: string[], trang_thai: string, mo_ta: string }>}
 */
export const taoDrillRegistry = () => [
  {
    id: 'CM00_HEATMAP_TO_BAR_MATRIX_HS',
    cap: 1,
    nguon: 'bc_cm_00_khoa_nhom_loi',
    dich: ['bc_cm_00_nhom_vi_pham', 'bc_cm_00_top_khoa', 'bc_cm_00_khoa_nhom_loi', 'fact_ho_so'],
    khoa_goi_y: ['ma_khoa', 'ma_nhom'],
    trang_thai: 'dang_hoat_dong',
    mo_ta: 'Heatmap khoa×nhóm → drillCm00 → thanh + ma trận + FlatList MA_LK mở giám định.',
  },
  {
    id: 'DT01_TOP_RULE_TO_FACT_CANH',
    cap: 2,
    nguon: 'bc_dt_01_top_rule',
    dich: ['fact_canh_bao', 'ChiTietLoi'],
    khoa_goi_y: ['ma_rule'],
    trang_thai: 'ke_hoach_meta',
    mo_ta: 'Top rule theo Σ rủi ro → lọc fact_canh_bao theo ma_rule (client / màn giám định).',
  },
  {
    id: 'QT04_TOP_RULE_TO_FACT',
    cap: 2,
    nguon: 'bc_qt_04_top10_rule',
    dich: ['fact_canh_bao'],
    khoa_goi_y: ['ma_rule'],
    trang_thai: 'ke_hoach_meta',
    mo_ta: 'Quản trị top rule → cùng grain fact_canh_bao (đồng bộ ngữ nghĩa M6/M8).',
  },
];

/**
 * Meta trực quan cấp dataset (song song dữ liệu nghiệp vụ — không thay thế cột bảng).
 */
export const taoDatasetMetaViz = (muc8) => {
  const coDt01 = Array.isArray(muc8?.bc_dt_01_top_rule) && muc8.bc_dt_01_top_rule.length > 0;
  if (!coDt01) return {};
  return {
    bc_dt_01_top_rule: {
      id_widget_goi_y: 'dt01_top_rule_rr',
      loai_bieu_do: 'bar_horizontal',
      tieu_de: 'Top 20 quy tắc — tổn thất tài chính (Pareto)',
      mo_ta: 'Sắp xếp theo tong_chi_phi (chua_xu_ly); trục nhãn ưu tiên ten_quy_tac, fallback ma_rule.',
      cau_hinh_truc: {
        truc_so: { truong: 'tong_chi_phi', kieu: 'currency', don_vi: 'VND', nhan: 'Σ rủi ro' },
        truc_nhan: { truong: 'ten_quy_tac', fallback: 'ma_rule', kieu: 'category', nhan: 'Quy tắc' },
      },
      nguong_canh_bao: [
        {
          truong: 'tong_chi_phi',
          toan_tu: '>=',
          gia_tri: 1e7,
          nhan: 'Ngưỡng rủi ro gợi ý BV (điều chỉnh theo quy mô)',
        },
      ],
      tuong_tac: {
        hanh_dong_chon_goi_y: 'loc_fact_canh_theo_ma_rule',
        khoa_loc_nguon: 'ma_rule',
      },
    },
  };
};

const seriesFrom = (slice, key = 'ten_series') =>
  slice.map((ma_mau, i) => ({
    ten_series: `${key}_${i}`,
    ma_mau,
    do_day_net: 12,
    bo_loc_series: {},
  }));

/**
 * @param {object} payload
 * @param {object} [payload.mo_hinh_muc5]
 * @param {object} [payload.muc6]
 * @param {object} [payload.muc7]
 * @param {object} [payload.muc8]
 * @param {number|null} [payload.soHoSo]
 */
export const taoHienThiBaoCao = ({ mo_hinh_muc5, muc6, muc7, muc8, soHoSo } = {}) => {
  const thoi_diem_du_lieu = new Date().toISOString();
  const palette = [...PALETTE_PHUONG_CHAU];
  const theme = {
    palette,
    mau_canh_bao: '#D32F2F',
    mau_binh_thuong: '#388E3C',
    mau_nen_luoi: '#fff5f8',
    font_chu_danh_muc: 14,
    /** WCAG: tối thiểu 12pt cho thân bảng / trục */
    font_toi_thieu_pt: 12,
    /** Gợi ý CSS soft-glow (web / in) */
    gradient_soft_glow: 'linear-gradient(135deg, rgba(248,250,252,0.95), rgba(253,242,248,0.98))',
  };

  const widgets = [];

  if (muc7) {
    widgets.push(
      wdg({
        id_widget: 'cm00_bar_nhom',
        id_du_lieu: 'bc_cm_00_nhom_vi_pham',
        tieu_de: 'Top nhóm lỗi nghiệp vụ',
        mo_ta_ngan: 'Số dòng lỗi theo nhóm vi phạm (BC-CM-00)',
        loai_bieu_do: 'bar_horizontal',
        truc: {
          loai: 'category',
          truc_x: 'so_loi',
          truc_y: 'label',
          nhan_truc_x: 'Số dòng',
          nhan_truc_y: 'Nhóm',
          thu_tu_danh_muc: 'desc',
        },
        mau_series: seriesFrom(palette.slice(0, 6)),
        nguong_canh_bao: [
          { truong: 'so_ho_so', toan_tu: '>', gia_tri: 50, mau_khi_vuot: '#AD1457', nhan: 'Nhiều hồ sơ ảnh hưởng' },
        ],
      }),
    );
    widgets.push(
      wdg({
        id_widget: 'cm00_bar_khoa',
        id_du_lieu: 'bc_cm_00_top_khoa',
        tieu_de: 'Top khoa phát sinh cảnh báo',
        mo_ta_ngan: 'Số dòng lỗi theo MA_KHOA (BC-CM-00)',
        loai_bieu_do: 'bar_horizontal',
        truc: {
          loai: 'category',
          truc_x: 'so_loi',
          truc_y: 'label',
          nhan_truc_x: 'Số dòng',
          nhan_truc_y: 'Khoa',
          thu_tu_danh_muc: 'desc',
        },
        mau_series: seriesFrom(palette.slice(2, 8)),
      }),
    );
    widgets.push(
      wdg({
        id_widget: 'cm00_heatmap_khoa_nhom',
        id_du_lieu: 'bc_cm_00_khoa_nhom_loi',
        tieu_de: 'Heatmap khoa × nhóm lỗi',
        mo_ta_ngan: 'Mật độ dòng lỗi (proxy trực quan; trục theo đặc tả 4.2)',
        loai_bieu_do: 'heatmap',
        truc: {
          loai: 'category',
          truc_x: 'ma_nhom',
          truc_y: 'ma_khoa',
          nhan_truc_x: 'Nhóm nghiệp vụ',
          nhan_truc_y: 'Khoa',
          thu_tu_danh_muc: 'desc',
        },
        mau_series: seriesFrom([palette[0], palette[2], palette[1]], 'heat'),
      }),
    );
    widgets.push(
      wdg({
        id_widget: 'cm01_kpi_card_loi',
        id_du_lieu: 'bc_cm_01_kpi',
        tieu_de: 'KPI — Tỷ lệ lỗi / 100 HS',
        mo_ta_ngan: 'Three-second rule: nổi bật khi vượt ngưỡng (UI đọc bc_cm_01_kpi)',
        loai_bieu_do: 'kpi_card',
        truc: {
          loai: 'category',
          truc_x: 'ma_chi_so',
          truc_y: 'gia_tri',
          nhan_truc_x: 'Chỉ số',
          nhan_truc_y: 'Giá trị',
          thu_tu_danh_muc: 'giu_nguyen',
        },
        nguong_canh_bao: [
          {
            truong: 'gia_tri',
            toan_tu: '>',
            gia_tri: 30,
            mau_khi_vuot: theme.mau_canh_bao,
            nhan: 'Tỷ lệ lỗi cao — ưu tiên rà soát',
          },
        ],
        tuong_tac: { bat_tooltip: true, bat_chon_dong: false, hanh_dong_chon: 'mo_chi_tiet_hs', bo_loc_ap_dung: {} },
      }),
    );
  }

  if (muc6) {
    widgets.push(
      wdg({
        id_widget: 'qt04_bar_rule',
        id_du_lieu: 'bc_qt_04_top10_rule',
        tieu_de: 'Top rule (Quản trị)',
        mo_ta_ngan: 'BC-QT-04 — drill KPI_TOP_RULE_FACT_CANH',
        loai_bieu_do: 'bar_vertical',
        truc: {
          loai: 'category',
          truc_x: 'ma_rule',
          truc_y: 'so_loi',
          nhan_truc_x: 'Rule',
          nhan_truc_y: 'Số lỗi',
          thu_tu_danh_muc: 'desc',
        },
        mau_series: seriesFrom([palette[0]], 'rule'),
        nguong_canh_bao: [
          { truong: 'so_loi', toan_tu: '>=', gia_tri: 100, mau_khi_vuot: '#C62828', nhan: 'Rule nóng' },
        ],
      }),
    );
    widgets.push(
      wdg({
        id_widget: 'qt04_bar_khoa',
        id_du_lieu: 'bc_qt_04_top10_khoa',
        tieu_de: 'Top khoa (QT-04)',
        mo_ta_ngan: 'Số lỗi theo khoa — đồng bộ drill M7',
        loai_bieu_do: 'bar_horizontal',
        truc: { loai: 'category', truc_x: 'so_loi', truc_y: 'ma_khoa', thu_tu_danh_muc: 'desc' },
        mau_series: seriesFrom([palette[2], palette[3], palette[4]], 'khoa_qt'),
      }),
    );
  }

  if (muc8) {
    widgets.push(
      wdg({
        id_widget: 'dt01_bar_khoa_rr',
        id_du_lieu: 'bc_dt_01_top_khoa',
        tieu_de: 'Top khoa — chi phí rủi ro',
        mo_ta_ngan: 'BC-DT-01 — cột ngang MVP',
        loai_bieu_do: 'bar_horizontal',
        truc: { loai: 'category', truc_x: 'tong_chi_phi_rui_ro', truc_y: 'ma_khoa', thu_tu_danh_muc: 'desc' },
        mau_series: seriesFrom(['#0ea5e9', '#6366f1', '#14b8a6'], 'dt_khoa'),
      }),
    );
    widgets.push(
      wdg({
        id_widget: 'dt01_top_rule_rr',
        id_du_lieu: 'bc_dt_01_top_rule',
        tieu_de: 'Top rule — Σ rủi ro (có tên quy tắc)',
        mo_ta_ngan: 'BC-DT-01 — Pareto tài chính; nhãn ten_quy_tac khi có (SPEC-VIZ-2.0.3).',
        loai_bieu_do: 'bar_horizontal',
        truc: {
          loai: 'category',
          truc_x: 'tong_chi_phi',
          truc_y: 'ten_quy_tac',
          nhan_truc_x: 'Σ rủi ro (VND)',
          nhan_truc_y: 'Quy tắc',
          thu_tu_danh_muc: 'desc',
        },
        mau_series: seriesFrom(['#b45309', '#c2410c', '#be123c', '#9f1239'], 'dt_rule'),
        tuong_tac: {
          bat_tooltip: true,
          bat_chon_dong: true,
          hanh_dong_chon: 'loc_bang_duoi',
          bo_loc_ap_dung: { khoa: 'ma_rule' },
        },
      }),
    );
    widgets.push(
      wdg({
        id_widget: 'dt01_bar_phan_loai',
        id_du_lieu: 'bc_dt_01_phan_loai',
        tieu_de: 'Phân bố rủi ro theo loại',
        mo_ta_ngan: 'BC-DT-01 — proxy pie → bar',
        loai_bieu_do: 'bar_horizontal',
        truc: { loai: 'category', truc_x: 'tong_chi_phi', truc_y: 'ten_loai', thu_tu_danh_muc: 'desc' },
        mau_series: seriesFrom(['#0f766e', '#0d9488', '#14b8a6'], 'dt_loai'),
      }),
    );
    widgets.push(
      wdg({
        id_widget: 'dt05_line_thang',
        id_du_lieu: 'bc_dt_05_thang',
        tieu_de: 'Chuỗi chỉ tiêu theo tháng',
        mo_ta_ngan: 'BC-DT-05 — line/area (Victory Native khi tích hợp)',
        loai_bieu_do: 'line',
        truc: {
          loai: 'time',
          truc_x: 'ky',
          truc_y: 'gia_tri',
          nhan_truc_x: 'Kỳ',
          nhan_truc_y: 'Giá trị',
          thu_tu_danh_muc: 'giu_nguyen',
        },
        mau_series: seriesFrom(['#45B7D1'], 'thang'),
      }),
    );
  }

  const fcb = mo_hinh_muc5?.fact_canh_bao;
  const soFactCanh = Array.isArray(fcb) ? fcb.length : null;

  const theme_config = {
    ...theme,
    chuan_tiep_can_goi_y: 'WCAG_2.2_AA',
    thiet_ke_ket_qua: true,
    progressive_disclosure: ['kpi_tom_tat', 'phan_tich_bieu_do', 'bang_va_hs'],
  };

  return {
    phien_ban: PHEN_BAN_VIZ,
    tuong_thich_v1: true,
    thoi_diem_du_lieu,
    chu_ky_lam_moi_goi_y_ms: 300000,
    /** Gợi ý điều hành JCI / QPS (hiển thị tóm tắt trên hub) */
    goi_y_quan_tri_jci: [
      'Ưu tiên KPI rủi ro trong 3 giây đầu; drill khoa ↔ nhóm đồng bộ heatmap và ma trận.',
      'Đối chiếu chênh T_THANHTOAN (M6/M8) trước khi khóa kỳ thanh toán BHYT.',
    ],
    /** Hook tích hợp AI (đặt tả 2026): client gợi ý biểu đồ theo xu hướng — triển khai dịch vụ sau. */
    goi_y_ai_bieu_do: [
      'Khi có API phân tích chuỗi thời gian: ưu tiên line + band dự báo trên BC-DT-05.',
      'Victory Native + Skia: dùng cho heatmap mật độ cao và chartPress trên dev build.',
    ],
    theme,
    theme_config,
    drill: {
      kich_hoat: true,
      luoc_do: 'KPI_TOP_RULE_FACT_CANH',
      khoa_loc_mac_dinh: {},
    },
    drill_registry: taoDrillRegistry(),
    dataset_meta_viz: taoDatasetMetaViz(muc8),
    widgets,
    tom_tat_tai_nguyen: {
      so_ho_so: soHoSo ?? null,
      so_fact_canh: soFactCanh,
      phien_ban_muc6: muc6?.phien_ban ?? null,
      phien_ban_muc7: muc7?.phien_ban ?? null,
      phien_ban_muc8: muc8?.phien_ban ?? null,
    },
  };
};

export const layBangMauTheoWidget = (hienThi, idWidget) => {
  const w = hienThi?.widgets?.find((x) => x.id_widget === idWidget);
  const fromSeries = w?.mau_series?.map((s) => s.ma_mau).filter(Boolean);
  if (fromSeries?.length) return fromSeries;
  if (hienThi?.theme?.palette?.length) return hienThi.theme.palette;
  return null;
};

/** Màu nền ô heatmap theo giá trị / max (0–1) */
/** Meta trực quan theo id dataset (vd bc_dt_01_top_rule) — null nếu không khai báo. */
export const layMetaVizDataset = (hienThi, idDataset) => hienThi?.dataset_meta_viz?.[idDataset] ?? null;

export const layMauHeatmap = (hienThi, tyLe) => {
  const palette0 = Array.isArray(hienThi?.theme?.palette) ? hienThi.theme.palette[0] : null;
  const a = Math.min(1, Math.max(0, Number(tyLe) || 0));
  /** MVP: gradient theo theme.palette[0] khi là #RRGGBB; ngược lại tone mặc định Phương Châu. */
  if (palette0 && /^#[0-9A-Fa-f]{6}$/.test(palette0)) {
    const r = parseInt(palette0.slice(1, 3), 16);
    const g = parseInt(palette0.slice(3, 5), 16);
    const b = parseInt(palette0.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${0.12 + a * 0.55})`;
  }
  return `rgba(232, 62, 140, ${0.12 + a * 0.55})`;
};
