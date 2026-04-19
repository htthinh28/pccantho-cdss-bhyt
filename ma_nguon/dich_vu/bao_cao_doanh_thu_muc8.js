/**
 * Bộ báo cáo Doanh thu BHYT — mục 8 đặc tả CDSS-BHYT-SPEC-BC (BC-DT-01 … BC-DT-06).
 * Nguồn: FACT_HO_SO / FACT_CANH_BAO / FACT_DONG_CHI_PHI + meta hồ sơ; thiếu log nộp BHYT / quỹ giao → "—".
 */

import { demHoSoLoiHanhChinh, demHoSoLoiLogicThoiGian, taoBangBcQt04ChenhLechTongChi } from './bao_cao_quan_tri_muc6';

const toNum = (v, fb = 0) => {
  const n = Number(String(v ?? '').replace(/,/g, '').trim());
  return Number.isFinite(n) ? n : fb;
};

const MA_RULE_DOI_CHIEU = new Set(['XML_49', 'XML_53', 'XML_109', 'XML_143']);

const parseTs = (v) => {
  const s = String(v || '').trim();
  if (!s) return NaN;
  const t = Date.parse(s);
  if (Number.isFinite(t)) return t;
  const n = Number(s);
  if (Number.isFinite(n) && n > 1e11) return n;
  return NaN;
};

const layXml1 = (hoSo = {}) =>
  hoSo?.xml1 || hoSo?.XML1 || hoSo?.du_lieu_goc?.xml1 || hoSo?.du_lieu_goc?.XML1 || {};

const layMaLKHoSo = (hoSo = {}) =>
  String(hoSo?.ma_lk || layXml1(hoSo)?.MA_LK || hoSo?.du_lieu_goc?.ma_lk || '').trim();

/** BC-DT-01 — KPI + phân bố rủi ro theo loại (proxy pie). */
export const taoBangBcDt01Kpi = (factHoSo = [], factCanhBao = []) => {
  const chuaXu = factCanhBao.filter((c) => String(c.trang_thai_xu_ly || '') === 'chua_xu_ly');
  const tongRuiRo = chuaXu.reduce((s, c) => s + toNum(c.chi_phi_anh_huong, 0), 0);
  const tongBhtt = factHoSo.reduce((s, f) => s + toNum(f.t_bhtt, 0), 0);
  const tyLe = tongBhtt > 0 ? (tongRuiRo / tongBhtt) * 100 : 0;

  return [
    {
      ma_chi_so: 'BC_DT_01_RUI_RO',
      ten: 'Tổng chi phí rủi ro chưa xử lý',
      gia_tri: String(Math.round(tongRuiRo)),
      don_vi: 'VND',
      ghi_chu: 'SUM(FACT_CANH_BAO.chi_phi_anh_huong) WHERE trang_thai_xu_ly=chua_xu_ly.',
    },
    {
      ma_chi_so: 'BC_DT_01_TY_LE',
      ten: 'Tỷ lệ chi phí rủi ro / tổng đề nghị thanh toán BHYT (T_BHTT)',
      gia_tri: tongBhtt ? `${tyLe.toFixed(2)}%` : '—',
      don_vi: '%',
      ghi_chu: 'Cao >5% cần ưu tiên xử lý theo đặc tả §8.1.',
    },
    {
      ma_chi_so: 'BC_DT_01_XU_HUONG',
      ten: 'Xu hướng rủi ro 12 tuần',
      gia_tri: '—',
      don_vi: '—',
      ghi_chu: 'Cần chuỗi theo tuần + snapshot — chưa có trong kho cục bộ.',
    },
  ];
};

const mapLoaiDt01 = (loai) => {
  const l = String(loai || '');
  if (l === 'du_lieu') return 'du_lieu';
  if (l === 'doi_chieu_chi_phi') return 'doi_chieu_chi_phi';
  if (l === 'goi_y') return 'goi_y';
  if (l === 'canh_bao') return 'chi_dinh_bat_thuong';
  return 'khac';
};

export const taoBangBcDt01PhanBoLoai = (factCanhBao = [], danhSachHoSo = []) => {
  const buckets = new Map();
  const bump = (key, label, so, tien) => {
    if (!buckets.has(key)) buckets.set(key, { loai: key, ten_loai: label, so_luong: 0, tong_chi_phi: 0 });
    const r = buckets.get(key);
    r.so_luong += so;
    r.tong_chi_phi += tien;
  };

  for (const c of factCanhBao) {
    const k = mapLoaiDt01(c.loai_loi);
    const labels = {
      du_lieu: 'Dữ liệu / cấu trúc',
      doi_chieu_chi_phi: 'Đối chiếu chi phí',
      goi_y: 'Gợi ý / nhắc nhở',
      chi_dinh_bat_thuong: 'Cảnh báo CDSS (proxy chỉ định)',
      khac: 'Khác',
    };
    bump(k, labels[k] || k, 1, toNum(c.chi_phi_anh_huong, 0));
  }

  const nHs = Array.isArray(danhSachHoSo) ? danhSachHoSo.length : 0;
  const hc = nHs ? demHoSoLoiHanhChinh(danhSachHoSo) : 0;
  const lt = nHs ? demHoSoLoiLogicThoiGian(danhSachHoSo) : 0;
  bump('hanh_chinh', 'Hành chính (proxy hồ sơ)', hc, 0);
  bump('logic_thoi_gian', 'Logic thời gian (proxy hồ sơ)', lt, 0);

  return [...buckets.values()].sort((a, b) => b.tong_chi_phi - a.tong_chi_phi || b.so_luong - a.so_luong);
};

export const taoBangBcDt01TopKhoaRuiRo = (factCanhBao = []) => {
  const m = new Map();
  for (const c of factCanhBao) {
    if (String(c.trang_thai_xu_ly || '') !== 'chua_xu_ly') continue;
    const k = String(c.ma_khoa || '').trim() || '(không rõ)';
    if (!m.has(k)) m.set(k, { ma_khoa: k, so_canh_bao: 0, tong_chi_phi_rui_ro: 0 });
    const r = m.get(k);
    r.so_canh_bao += 1;
    r.tong_chi_phi_rui_ro += toNum(c.chi_phi_anh_huong, 0);
  }
  return [...m.values()]
    .sort((a, b) => b.tong_chi_phi_rui_ro - a.tong_chi_phi_rui_ro)
    .slice(0, 10)
    .map((x) => ({
      ...x,
      tong_chi_phi_rui_ro: Math.round(x.tong_chi_phi_rui_ro),
    }));
};

export const taoBangBcDt01Top20Rule = (factCanhBao = []) => {
  const agg = new Map();
  for (const c of factCanhBao) {
    if (String(c.trang_thai_xu_ly || '') !== 'chua_xu_ly') continue;
    const rule = String(c.ma_rule || '').trim() || '(không mã)';
    if (!agg.has(rule)) agg.set(rule, { ma_rule: rule, so_loi: 0, tong_chi_phi: 0 });
    const r = agg.get(rule);
    r.so_loi += 1;
    r.tong_chi_phi += toNum(c.chi_phi_anh_huong, 0);
  }
  return [...agg.values()]
    .sort((a, b) => b.tong_chi_phi - a.tong_chi_phi)
    .slice(0, 20)
    .map((x) => ({ ...x, tong_chi_phi: Math.round(x.tong_chi_phi) }));
};

/** BC-DT-02 — Điểm ưu tiên rà soát (proxy chuẩn hoá nội bộ). */
export const taoBangBcDt02HoSoUuTien = (factHoSo = [], factCanhBao = [], danhSachHoSo = []) => {
  const maLkToHoSo = new Map(
    (Array.isArray(danhSachHoSo) ? danhSachHoSo : []).map((hs) => [layMaLKHoSo(hs), hs]),
  );

  const ruiRoTheoLk = new Map();
  const nghiemTheoLk = new Map();
  for (const c of factCanhBao) {
    const lk = String(c.ma_lk || '').trim();
    if (!lk) continue;
    ruiRoTheoLk.set(lk, (ruiRoTheoLk.get(lk) || 0) + toNum(c.chi_phi_anh_huong, 0));
    if (String(c.muc_do || '') === 'nghiem_trong') {
      nghiemTheoLk.set(lk, (nghiemTheoLk.get(lk) || 0) + 1);
    }
  }

  const maxRuiRo = Math.max(1, ...[...ruiRoTheoLk.values()]);
  const ttList = factHoSo.map((f) => toNum(f.t_thanhtoan, 0)).filter((x) => x > 0).sort((a, b) => a - b);
  const p90 = ttList.length ? ttList[Math.floor(ttList.length * 0.9)] || ttList[ttList.length - 1] : 0;
  const now = Date.now();

  const rows = [];
  for (const f of factHoSo) {
    const lk = String(f.ma_lk || '').trim();
    if (!lk) continue;
    const ruiRo = ruiRoTheoLk.get(lk) || 0;
    const nghiem = nghiemTheoLk.get(lk) || 0;
    const hs = maLkToHoSo.get(lk) || {};
    const tNhap = parseTs(hs?.thoi_diem_nhap_kho || hs?.thoi_diem_cap_nhat_so_lieu_tho || f.thoi_diem_nhap);
    const tuoiNgay = Number.isFinite(tNhap) ? Math.max(0, (now - tNhap) / 86400000) : 0;
    const chuanRuiRo = Math.min(1, ruiRo / maxRuiRo);
    const chuanNghiem = Math.min(1, nghiem / 10);
    const chuanTuoi = Math.min(1, tuoiNgay / 30);
    const lon = toNum(f.t_thanhtoan, 0) >= p90 && p90 > 0 ? 1 : 0;
    const diem =
      0.5 * chuanRuiRo + 0.2 * chuanNghiem + 0.15 * chuanTuoi + 0.1 * 0 + 0.05 * lon;

    rows.push({
      ma_lk: lk,
      ma_khoa: String(f.ma_khoa || '').trim(),
      ma_bac_si: String(f.ma_bac_si || '').trim(),
      chan_doan_chinh: String(f.ma_icd_chinh || '').trim(),
      t_thanhtoan: Math.round(toNum(f.t_thanhtoan, 0)),
      chi_phi_rui_ro: Math.round(ruiRo),
      so_canh_bao_nghiem_trong: nghiem,
      diem_uu_tien: Number(diem.toFixed(4)),
      trang_thai: String(f.trang_thai_ho_so || ''),
      ghi_chu: 'da_bi_tra_lai=0 (chưa có meta); chuẩn hoá proxy §8.2.',
    });
  }

  return rows.sort((a, b) => b.diem_uu_tien - a.diem_uu_tien).slice(0, 100);
};

/** BC-DT-03 — Pivot khoa × rule đối chiếu XML (mã QĐ 130). */
export const taoBangBcDt03PivotKhoaRule = (factCanhBao = []) => {
  const key = (k, r) => `${k}||${r}`;
  const m = new Map();
  for (const c of factCanhBao) {
    const mr = String(c.ma_rule || '').trim();
    if (!MA_RULE_DOI_CHIEU.has(mr)) continue;
    const khoa = String(c.ma_khoa || '').trim() || '(không rõ)';
    const k = key(khoa, mr);
    if (!m.has(k)) {
      m.set(k, {
        ma_khoa: khoa,
        ma_rule: mr,
        so_vi_pham: 0,
        tong_chi_phi_anh_huong: 0,
        tb_chi_phi: 0,
      });
    }
    const r = m.get(k);
    r.so_vi_pham += 1;
    r.tong_chi_phi_anh_huong += toNum(c.chi_phi_anh_huong, 0);
  }
  return [...m.values()]
    .map((x) => ({
      ...x,
      tong_chi_phi_anh_huong: Math.round(x.tong_chi_phi_anh_huong),
      tb_chi_phi:
        x.so_vi_pham > 0 ? Math.round(x.tong_chi_phi_anh_huong / x.so_vi_pham) : 0,
    }))
    .sort((a, b) => b.so_vi_pham - a.so_vi_pham)
    .slice(0, 80);
};

export const taoBangBcDt03ChiTietHoSo = (factCanhBao = []) =>
  factCanhBao
    .filter((c) => MA_RULE_DOI_CHIEU.has(String(c.ma_rule || '').trim()))
    .slice(0, 45)
    .map((c) => ({
      ma_lk: c.ma_lk,
      ma_rule: c.ma_rule,
      ma_khoa: String(c.ma_khoa || '').trim(),
      muc_do: c.muc_do,
      chi_phi_anh_huong: Math.round(toNum(c.chi_phi_anh_huong, 0)),
    }));

/** BC-DT-04 — Cơ cấu 7 nhóm chi phí (từ FACT_HO_SO XML1). */
export const taoBangBcDt04CoCauChiPhi = (factHoSo = []) => {
  const sums = {
    thuoc: 0,
    vtyt: 0,
    xn: 0,
    cdha: 0,
    pttt: 0,
    dvkt: 0,
    giuong: 0,
    bhtt: 0,
  };
  for (const f of factHoSo) {
    sums.thuoc += toNum(f.t_thuoc, 0);
    sums.vtyt += toNum(f.t_vtyt, 0);
    sums.xn += toNum(f.t_xn, 0);
    sums.cdha += toNum(f.t_cdha, 0);
    sums.pttt += toNum(f.t_pttt, 0);
    sums.dvkt += toNum(f.t_dvkt, 0);
    sums.giuong += toNum(f.t_giuong, 0);
    sums.bhtt += toNum(f.t_bhtt, 0);
  }
  const tongNhom =
    sums.thuoc + sums.vtyt + sums.xn + sums.cdha + sums.pttt + sums.dvkt + sums.giuong;
  const mau = tongNhom > 0 ? tongNhom : sums.bhtt || 1;
  const pct = (x) => `${((x / mau) * 100).toFixed(1)}%`;

  return [
    { nhom: 'Thuốc', tong_tien: Math.round(sums.thuoc), ty_trong: pct(sums.thuoc), ghi_chu: 'T_THUOC XML1.' },
    { nhom: 'VTYT', tong_tien: Math.round(sums.vtyt), ty_trong: pct(sums.vtyt), ghi_chu: 'T_VTYT XML1.' },
    { nhom: 'Xét nghiệm', tong_tien: Math.round(sums.xn), ty_trong: pct(sums.xn), ghi_chu: 'T_XN XML1.' },
    { nhom: 'CĐHA', tong_tien: Math.round(sums.cdha), ty_trong: pct(sums.cdha), ghi_chu: 'T_CDHA XML1.' },
    { nhom: 'PTTT', tong_tien: Math.round(sums.pttt), ty_trong: pct(sums.pttt), ghi_chu: 'T_PTTT XML1.' },
    { nhom: 'DVKT', tong_tien: Math.round(sums.dvkt), ty_trong: pct(sums.dvkt), ghi_chu: 'T_DVKT XML1.' },
    { nhom: 'Giường', tong_tien: Math.round(sums.giuong), ty_trong: pct(sums.giuong), ghi_chu: 'T_GIUONG XML1.' },
    {
      nhom: 'Tổng BHYT thanh toán (đối chiếu)',
      tong_tien: Math.round(sums.bhtt),
      ty_trong: sums.bhtt ? '100% ref' : '—',
      ghi_chu: 'SUM(T_BHTT); tỷ trọng nhóm tính trên tổng 7 nhóm XML1 khi >0.',
    },
    {
      nhom: 'Benchmark 12 tháng / BV cùng hạng',
      tong_tien: 0,
      ty_trong: '—',
      ghi_chu: 'Cần snapshot đa kỳ + API benchmark — §8.4.',
    },
  ];
};

const thangTuNgay = (s) => {
  const d = String(s || '').replace(/\D/g, '').slice(0, 8);
  if (d.length >= 6) return `${d.slice(0, 4)}-${d.slice(4, 6)}`;
  return '';
};

/** BC-DT-05 — Doanh thu BHYT theo tháng (proxy từ NGAY_RA XML1). */
export const taoBangBcDt05TheoThang = (factHoSo = []) => {
  const m = new Map();
  for (const f of factHoSo) {
    const th = thangTuNgay(f.ngay_ra) || thangTuNgay(f.ngay_vao) || '(không ngày)';
    if (!m.has(th)) m.set(th, { ky_thang: th, so_ho_so: 0, tong_t_bhtt: 0 });
    const r = m.get(th);
    r.so_ho_so += 1;
    r.tong_t_bhtt += toNum(f.t_bhtt, 0);
  }
  return [...m.values()]
    .map((x) => ({
      ...x,
      tong_t_bhtt: Math.round(x.tong_t_bhtt),
      tb_bhtt: x.so_ho_so ? Math.round(x.tong_t_bhtt / x.so_ho_so) : 0,
    }))
    .sort((a, b) => String(a.ky_thang).localeCompare(String(b.ky_thang)))
    .slice(-24);
};

export const taoBangBcDt05DuBao = () => [
  {
    chi_so: 'MA_6T',
    ten: 'Moving average 6 tháng → dự báo 3 tháng',
    gia_tri: '—',
    ghi_chu: 'Delegate Python service / đủ chuỗi tháng theo §8.5.',
  },
  {
    chi_so: 'QUY_BHYT',
    ten: 'So sánh với quỹ KCB BHYT được giao',
    gia_tri: '—',
    ghi_chu: 'Cần tham số hợp đồng / kế hoạch — ngoài kho XML.',
  },
];

const coCanhNghiemChuaXu = (factCanhBao, maLk) =>
  factCanhBao.some(
    (c) =>
      String(c.ma_lk || '').trim() === maLk
      && String(c.muc_do || '') === 'nghiem_trong'
      && String(c.trang_thai_xu_ly || '') === 'chua_xu_ly',
  );

const coCanhBaoChuaXu = (factCanhBao, maLk) =>
  factCanhBao.some(
    (c) =>
      String(c.ma_lk || '').trim() === maLk
      && ['nghiem_trong', 'canh_bao'].includes(String(c.muc_do || ''))
      && String(c.trang_thai_xu_ly || '') === 'chua_xu_ly',
  );

/** BC-DT-06 — Hoàn thiện trước nộp BHYT (proxy trạng thái kho). */
export const taoBangBcDt06ChiSo = (factHoSo = [], factCanhBao = [], danhSachHoSo = []) => {
  let sanSang = 0;
  let canSua = 0;
  let quaHanProxy = 0;
  const now = Date.now();

  for (const f of factHoSo) {
    const lk = String(f.ma_lk || '').trim();
    if (!lk) continue;
    const nghiem = coCanhNghiemChuaXu(factCanhBao, lk);
    const batKy = coCanhBaoChuaXu(factCanhBao, lk);
    const dat = String(f.trang_thai_ho_so || '').toUpperCase() === 'DAT_YEU_CAU';
    if (dat && !nghiem) sanSang += 1;
    if (batKy) canSua += 1;

    const hs = (Array.isArray(danhSachHoSo) ? danhSachHoSo : []).find((h) => layMaLKHoSo(h) === lk);
    const tNhap = parseTs(hs?.thoi_diem_nhap_kho || hs?.thoi_diem_cap_nhat_so_lieu_tho || f.thoi_diem_nhap);
    const daNop = String(hs?.trang_thai_nop_bhyt || hs?.da_nop_bhyt || '').toUpperCase();
    const daNopOk = daNop === 'DA_NOP_BHYT' || daNop === '1' || daNop === 'TRUE';
    if (Number.isFinite(tNhap) && (now - tNhap) / 86400000 > 7 && !daNopOk) quaHanProxy += 1;
  }

  const tongBhtt = factHoSo.reduce((s, f) => s + toNum(f.t_bhtt, 0), 0);
  const tongRuiRo = factCanhBao
    .filter((c) => String(c.trang_thai_xu_ly || '') === 'chua_xu_ly')
    .reduce((s, c) => s + toNum(c.chi_phi_anh_huong, 0), 0);
  const duBaoTyLe =
    tongBhtt > 0 ? (1 - Math.min(1, tongRuiRo / tongBhtt)) : null;

  return [
    {
      chi_so: 'DT06_SAN_SANG',
      ten: 'Hồ sơ sẵn sàng nộp (DAT_YEU_CAU & không nghiêm trọng chưa xử lý)',
      gia_tri: String(sanSang),
      ghi_chu: 'Proxy §8.6 — workflow thực tế có thể khác.',
    },
    {
      chi_so: 'DT06_CAN_SUA',
      ten: 'Hồ sơ cần sửa (có cảnh báo nghiêm trọng/cảnh báo chưa xử lý)',
      gia_tri: String(canSua),
      ghi_chu: 'Đếm hồ sơ có ít nhất một FACT_CANH_BAO mức nghiêm trọng hoặc cảnh báo, chua_xu_ly.',
    },
    {
      chi_so: 'DT06_QUA_HAN',
      ten: 'Hồ sơ nhập >7 ngày chưa nộp (proxy thiếu trạng thái nộp)',
      gia_tri: String(quaHanProxy),
      ghi_chu: 'Cần trường DA_NOP_BHYT / trang_thai_nop_bhyt đầy đủ trên kho.',
    },
    {
      chi_so: 'DT06_DU_BAO_TT',
      ten: 'Dự báo tỷ lệ được thanh toán (1 − rủi ro/BHYT)',
      gia_tri: duBaoTyLe != null ? `${(duBaoTyLe * 100).toFixed(1)}%` : '—',
      ghi_chu: 'Proxy thô — không thay thế mô hình tài chính BV.',
    },
    {
      chi_so: 'DT06_FUNNEL',
      ten: 'Funnel Đã nhập → Kiểm tra → Đạt YC → Đã nộp → Đã TT',
      gia_tri: '—',
      ghi_chu: 'Cần snapshot trạng thái nộp & thanh toán BHXH.',
    },
  ];
};

export const taoBangBcDt06TheoLoaiKcb = (factHoSo = []) => {
  const m = new Map();
  for (const f of factHoSo) {
    const lk = String(f.loai_kcb || '').trim() || '(không rõ)';
    if (!m.has(lk)) m.set(lk, { loai_kcb: lk, so_ho_so: 0, tong_t_bhtt: 0 });
    const r = m.get(lk);
    r.so_ho_so += 1;
    r.tong_t_bhtt += toNum(f.t_bhtt, 0);
  }
  return [...m.values()].map((x) => ({
    ...x,
    tong_t_bhtt: Math.round(x.tong_t_bhtt),
  }));
};

export const tongHopBaoCaoDoanhThuMuc8 = ({ moHinhMuc5 = {}, danhSachHoSo = [] }) => {
  const fhs = moHinhMuc5.fact_ho_so || [];
  const fcb = moHinhMuc5.fact_canh_bao || [];
  const fcp = moHinhMuc5.fact_dong_chi_phi || [];

  return {
    phien_ban: 'SPEC-BC-MUC8-V1',
    bc_dt_01_kpi: taoBangBcDt01Kpi(fhs, fcb),
    bc_dt_01_phan_loai: taoBangBcDt01PhanBoLoai(fcb, danhSachHoSo),
    bc_dt_01_top_khoa: taoBangBcDt01TopKhoaRuiRo(fcb),
    bc_dt_01_top_rule: taoBangBcDt01Top20Rule(fcb),
    bc_dt_02_top100: taoBangBcDt02HoSoUuTien(fhs, fcb, danhSachHoSo),
    bc_dt_03_pivot: taoBangBcDt03PivotKhoaRule(fcb),
    bc_dt_03_chi_tiet: taoBangBcDt03ChiTietHoSo(fcb),
    bc_dt_04_co_cau: taoBangBcDt04CoCauChiPhi(fhs),
    bc_dt_05_thang: taoBangBcDt05TheoThang(fhs),
    bc_dt_05_du_bao: taoBangBcDt05DuBao(),
    bc_dt_06_chi_so: taoBangBcDt06ChiSo(fhs, fcb, danhSachHoSo),
    bc_dt_06_loai_kcb: taoBangBcDt06TheoLoaiKcb(fhs),
    bc_dt_03_chenh_tong: taoBangBcQt04ChenhLechTongChi(fhs, fcp).slice(0, 35),
  };
};
