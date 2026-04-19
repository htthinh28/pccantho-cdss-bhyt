/**
 * Bộ báo cáo nhóm Quản trị — mục 6 đặc tả CDSS-BHYT-SPEC-BC (BC-QT-01 … BC-QT-04).
 * Tính từ view mục 5 (fact) + hồ sơ gốc; chỉ số cần log phiên / rule dataset trả về null hoặc ghi chú.
 */

const toNum = (v, fb = 0) => {
  const n = Number(String(v ?? '').replace(/,/g, '').trim());
  return Number.isFinite(n) ? n : fb;
};

const parseTs = (v) => {
  const s = String(v || '').trim();
  if (!s) return NaN;
  const t = Date.parse(s);
  if (Number.isFinite(t)) return t;
  const n = Number(s);
  if (Number.isFinite(n) && n > 1e11) return n;
  return NaN;
};

const digitsYmd = (s) => String(s || '').replace(/\D/g, '').slice(0, 8);

/** Ngày ra trước ngày vào (logic thời gian) — so 8 số đầu. */
const ngayRaTruocNgayVao = (ngayVao, ngayRa) => {
  const a = digitsYmd(ngayVao);
  const b = digitsYmd(ngayRa);
  if (a.length >= 8 && b.length >= 8) return Number(b.slice(0, 8)) < Number(a.slice(0, 8));
  return false;
};

const layXml1TuHoSo = (hoSo = {}) =>
  hoSo?.xml1 || hoSo?.XML1 || hoSo?.du_lieu_goc?.xml1 || hoSo?.du_lieu_goc?.XML1 || {};

const layMaLKHoSo = (hoSo = {}) =>
  String(hoSo?.ma_lk || layXml1TuHoSo(hoSo)?.MA_LK || '').trim();

/** BC-QT-01 — KPI dashboard (một bảng tổng hợp). */
export const taoBangBcQt01Kpi = (factHoSo = [], factCanhBao = []) => {
  const tong = factHoSo.length;
  const datYeuCauLanDau = factHoSo.filter(
    (f) => String(f.trang_thai_ho_so || '').toUpperCase() === 'DAT_YEU_CAU' && toNum(f.so_lan_sua, 0) === 0,
  ).length;
  const fpy = tong > 0 ? datYeuCauLanDau / tong : 0;
  const tapMaLkLoi = new Set(factCanhBao.map((c) => String(c.ma_lk || '').trim()).filter(Boolean));
  const soLoi = factCanhBao.length;
  const soMaLkCoLoi = tapMaLkLoi.size;
  const loiTrungBinhTrenHsCoLoi = soMaLkCoLoi > 0 ? soLoi / soMaLkCoLoi : 0;
  const tongRuiRoChuaXu = factCanhBao
    .filter((c) => String(c.trang_thai_xu_ly || '') === 'chua_xu_ly')
    .reduce((s, c) => s + toNum(c.chi_phi_anh_huong, 0), 0);
  const doanhThuBhytKy = factHoSo.reduce((s, f) => s + toNum(f.t_bhtt, 0), 0);

  return [
    {
      ma_chi_so: 'BC_QT_01_HS_KY',
      ten: 'Tổng hồ sơ trong kho (proxy kỳ)',
      gia_tri: String(tong),
      don_vi: 'hồ sơ',
      ghi_chu: 'COUNT(FACT_HO_SO) — toàn kho hiện tại; lọc kỳ theo thoi_diem_nhap khi có filter.',
    },
    {
      ma_chi_so: 'BC_QT_01_FPY',
      ten: 'Tỷ lệ FPY (đạt yêu cầu lần đầu, proxy)',
      gia_tri: tong ? `${(fpy * 100).toFixed(1)}%` : '—',
      don_vi: '%',
      ghi_chu: "DAT_YEU_CAU & so_lan_sua=0 / tổng; trạng thái mặc định 'DA_KIEM' nếu chưa có workflow.",
    },
    {
      ma_chi_so: 'BC_QT_01_LOI_TB',
      ten: 'Số lỗi trung bình / hồ sơ có lỗi',
      gia_tri: soMaLkCoLoi ? loiTrungBinhTrenHsCoLoi.toFixed(2) : '0',
      don_vi: 'lỗi/HS',
      ghi_chu: 'COUNT(FACT_CANH_BAO) / COUNT(DISTINCT ma_lk) có cảnh báo.',
    },
    {
      ma_chi_so: 'BC_QT_01_RUI_RO',
      ten: 'Tổng chi phí rủi ro chưa xử lý',
      gia_tri: String(Math.round(tongRuiRoChuaXu)),
      don_vi: 'VND',
      ghi_chu: "SUM(chi_phi_anh_huong) WHERE trang_thai_xu_ly='chua_xu_ly'.",
    },
    {
      ma_chi_so: 'BC_QT_01_DOANH_THU',
      ten: 'Doanh thu BHYT (SUM T_BHTT XML1)',
      gia_tri: String(Math.round(doanhThuBhytKy)),
      don_vi: 'VND',
      ghi_chu: 'SUM(FACT_HO_SO.t_bhtt).',
    },
    {
      ma_chi_so: 'BC_QT_01_CLOUD',
      ten: 'Tỷ lệ đồng bộ cloud',
      gia_tri: '—',
      don_vi: '%',
      ghi_chu: 'Cần meta Firebase / dataset — chưa nối vào pipeline báo cáo.',
    },
  ];
};

/** BC-QT-01 — Top 5 khoa tỷ lệ lỗi / hồ sơ (proxy kỳ). */
export const taoBangBcQt01Top5Khoa = (factHoSo = [], factCanhBao = []) => {
  const loiTheoKhoa = new Map();
  for (const c of factCanhBao) {
    const k = String(c.ma_khoa || '').trim() || '(không rõ khoa)';
    loiTheoKhoa.set(k, (loiTheoKhoa.get(k) || 0) + 1);
  }
  const hsTheoKhoa = new Map();
  for (const f of factHoSo) {
    const k = String(f.ma_khoa || '').trim() || '(không rõ khoa)';
    hsTheoKhoa.set(k, (hsTheoKhoa.get(k) || 0) + 1);
  }
  const rows = [];
  for (const [ma_khoa, so_loi] of loiTheoKhoa.entries()) {
    const so_ho_so = hsTheoKhoa.get(ma_khoa) || 0;
    const ty_le = so_ho_so > 0 ? so_loi / so_ho_so : so_loi;
    rows.push({ ma_khoa, so_ho_so, so_loi, ty_le_loi_tren_hs: Number(ty_le.toFixed(4)) });
  }
  return rows.sort((a, b) => b.ty_le_loi_tren_hs - a.ty_le_loi_tren_hs).slice(0, 5);
};

/** BC-QT-02 — Năng suất (phần tính được từ kho). */
export const taoBangBcQt02NangSuat = (factHoSo = []) => {
  const n = factHoSo.length;
  const hsSuaLai = factHoSo.filter((f) => toNum(f.so_lan_sua, 0) > 0).length;
  const tyLeSua = n > 0 ? hsSuaLai / n : 0;
  const phutList = [];
  for (const f of factHoSo) {
    const t0 = parseTs(f.thoi_diem_nhap);
    const t1 = parseTs(f.thoi_diem_kiem_cuoi);
    if (Number.isFinite(t0) && Number.isFinite(t1) && t1 >= t0) phutList.push((t1 - t0) / 60000);
  }
  const tgTbPhut = phutList.length
    ? (phutList.reduce((a, b) => a + b, 0) / phutList.length).toFixed(0)
    : null;

  return [
    {
      chi_so: 'HS_DA_KIEM',
      ten: 'Số hồ sơ trong kho',
      gia_tri: String(n),
      ghi_chu: 'Proxy “đã kiểm” theo dữ liệu kho.',
    },
    {
      chi_so: 'TY_LE_SUA_LAI',
      ten: 'Tỷ lệ hồ sơ có sửa sau kiểm (so_lan_sua > 0)',
      gia_tri: n ? `${(tyLeSua * 100).toFixed(1)}%` : '—',
      ghi_chu: 'BC-QT-02 — khối lượng sửa.',
    },
    {
      chi_so: 'TG_XU_LY_TB',
      ten: 'Thời gian xử lý TB (phút)',
      gia_tri: tgTbPhut != null ? String(tgTbPhut) : '—',
      ghi_chu: 'AVG(thoi_diem_kiem_cuoi - thoi_diem_nhap) khi hai mốc parse được.',
    },
    {
      chi_so: 'CA_TRUC',
      ten: 'Phân bổ ca trực',
      gia_tri: '—',
      ghi_chu: 'Cần timestamp theo ca — chưa có trong kho.',
    },
    {
      chi_so: 'NGUNG_HD',
      ten: 'Tỷ lệ ngưng hoạt động >60 phút',
      gia_tri: '—',
      ghi_chu: 'Cần FACT_PHIEN_LAM_VIEC / log xử lý theo giờ hành chính.',
    },
  ];
};

/** BC-QT-03 — Tuân thủ & audit (phần có dữ liệu nội bộ). */
export const taoBangBcQt03TuanThu = (factCanhBao = []) => {
  const tong = factCanhBao.length;
  const bypass = factCanhBao.filter((c) =>
    ['bo_qua_co_ly_do', 'chap_nhan_rui_ro'].includes(String(c.trang_thai_xu_ly || '')),
  ).length;
  const tyLeBypass = tong > 0 ? ((bypass / tong) * 100).toFixed(1) : '0';

  return [
    {
      chi_so: 'RULE_ON',
      ten: 'Độ phủ rule ON / tổng rule',
      gia_tri: '—',
      ghi_chu: 'Cần dataset rule engine (seed + runtime) — không đọc từ kho hồ sơ.',
    },
    {
      chi_so: 'PAGE_VIEW',
      ten: 'Phân phối pageview theo route',
      gia_tri: '—',
      ghi_chu: 'Cần FACT_PHIEN_LAM_VIEC.',
    },
    {
      chi_so: 'TY_LE_BYPASS',
      ten: 'Tỷ lệ bypass rule (proxy)',
      gia_tri: `${tyLeBypass}%`,
      ghi_chu: 'bo_qua_co_ly_do | chap_nhan_rui_ro / tổng cảnh báo (hiện mặc định chua_xu_ly → 0%).',
    },
    {
      chi_so: 'XUAT_NHAY_CAM',
      ten: 'Số lần xuất báo cáo nhạy cảm',
      gia_tri: '—',
      ghi_chu: 'Cần log xuất file theo §6.3.',
    },
    {
      chi_so: 'LOGIN_FAIL',
      ten: 'Đăng nhập thất bại',
      gia_tri: '—',
      ghi_chu: 'Cần log phiên đăng nhập.',
    },
  ];
};

const MA_RULE_DOI_CHIEU = new Set(['XML_49', 'XML_53', 'XML_109', 'XML_143']);

/** BC-QT-04 — Chất lượng dữ liệu. */
export const taoBangBcQt04Top10Rule = (factCanhBao = []) => {
  const m = new Map();
  for (const c of factCanhBao) {
    const r = String(c.ma_rule || '').trim() || '(không mã)';
    m.set(r, (m.get(r) || 0) + 1);
  }
  return [...m.entries()]
    .map(([ma_rule, so_loi]) => ({ ma_rule, so_loi }))
    .sort((a, b) => b.so_loi - a.so_loi)
    .slice(0, 10);
};

export const taoBangBcQt04Top10KhoaCanCaiThien = (factHoSo = [], factCanhBao = []) => {
  const loi = new Map();
  for (const c of factCanhBao) {
    const k = String(c.ma_khoa || '').trim() || '(không rõ)';
    loi.set(k, (loi.get(k) || 0) + 1);
  }
  const hs = new Map();
  for (const f of factHoSo) {
    const k = String(f.ma_khoa || '').trim() || '(không rõ)';
    hs.set(k, (hs.get(k) || 0) + 1);
  }
  return [...loi.entries()]
    .map(([ma_khoa, so_loi]) => ({
      ma_khoa,
      so_ho_so: hs.get(ma_khoa) || 0,
      so_loi,
      diem_uu_tien: so_loi * (1 + 1 / Math.max(1, hs.get(ma_khoa) || 1)),
    }))
    .sort((a, b) => b.diem_uu_tien - a.diem_uu_tien)
    .slice(0, 10)
    .map(({ ma_khoa, so_ho_so, so_loi }) => ({ ma_khoa, so_ho_so, so_loi }));
};

export const taoBangBcQt04LoiDoiChieuChiPhi = (factCanhBao = []) =>
  factCanhBao
    .filter((c) => MA_RULE_DOI_CHIEU.has(String(c.ma_rule || '').trim()))
    .slice(0, 40)
    .map((c) => ({
      ma_lk: c.ma_lk,
      ma_rule: c.ma_rule,
      muc_do: c.muc_do,
      chi_phi_anh_huong: c.chi_phi_anh_huong,
    }));

export const taoBangBcQt04ChenhLechTongChi = (factHoSo = [], factDongChiPhi = []) => {
  const sumDong = new Map();
  for (const d of factDongChiPhi) {
    const lk = String(d.ma_lk || '').trim();
    if (!lk) continue;
    const tien = toNum(d.thanh_tien_bh, 0) || toNum(d.thanh_tien, 0);
    sumDong.set(lk, (sumDong.get(lk) || 0) + tien);
  }
  return factHoSo.map((f) => {
    const lk = String(f.ma_lk || '').trim();
    const tongDong = sumDong.get(lk) || 0;
    const t1 = toNum(f.t_thanhtoan, 0);
    const chenh = Math.round(t1 - tongDong);
    return {
      ma_lk: lk,
      tong_xml1_thanhtoan: t1,
      tong_dong_chi_tiet: Math.round(tongDong),
      chenh_lech: chenh,
    };
  });
};

export const demHoSoLoiHanhChinh = (danhSachHoSo = []) => {
  let n = 0;
  for (const hs of Array.isArray(danhSachHoSo) ? danhSachHoSo : []) {
    const x1 = layXml1TuHoSo(hs);
    const maThe = String(x1?.MA_THE || x1?.MA_THE_BHYT || '').trim();
    const cccd = String(x1?.SO_CCCD || x1?.CCCD || '').trim();
    const maBn = String(x1?.MA_BN || '').trim();
    const ns = String(x1?.NGAY_SINH || '').trim();
    const loiThe =
      (!maThe || maThe.length < 10)
      || (!cccd && !maBn)
      || !ns;
    if (loiThe) n += 1;
  }
  return n;
};

export const demHoSoLoiLogicThoiGian = (danhSachHoSo = []) => {
  let n = 0;
  for (const hs of Array.isArray(danhSachHoSo) ? danhSachHoSo : []) {
    const x1 = layXml1TuHoSo(hs);
    if (ngayRaTruocNgayVao(x1?.NGAY_VAO, x1?.NGAY_RA)) n += 1;
  }
  return n;
};

export const taoBangBcQt04TyLeChatLuong = (factHoSo = [], factCanhBao = [], danhSachHoSo = []) => {
  const tong = factHoSo.length || 1;
  const hc = demHoSoLoiHanhChinh(danhSachHoSo);
  const lt = demHoSoLoiLogicThoiGian(danhSachHoSo);
  const doiChieu = factCanhBao.filter((c) => MA_RULE_DOI_CHIEU.has(String(c.ma_rule || '').trim())).length;
  return [
    {
      chi_so: 'TY_LE_HC',
      ten: 'Tỷ lệ hồ sơ thiếu thẻ/CCCD/NS (proxy hành chính)',
      gia_tri: `${((hc / tong) * 100).toFixed(1)}%`,
      ghi_chu: 'Quy ước nội bộ — không thay thế checklist BYT đầy đủ.',
    },
    {
      chi_so: 'TY_LE_TIME',
      ten: 'Tỷ lệ lỗi logic thời gian (ra < vào)',
      gia_tri: `${((lt / tong) * 100).toFixed(1)}%`,
      ghi_chu: 'So sánh NGAY_RA vs NGAY_VAO (8 số đầu).',
    },
    {
      chi_so: 'TY_LE_DOI_CHIEU',
      ten: 'Số cảnh báo đối chiếu chi phí (XML_49/53/109/143)',
      gia_tri: String(doiChieu),
      ghi_chu: 'Đếm dòng FACT_CANH_BAO khớp mã.',
    },
  ];
};

export const tongHopBaoCaoQuanTriMuc6 = ({ moHinhMuc5 = {}, danhSachHoSo = [] }) => {
  const fhs = moHinhMuc5.fact_ho_so || [];
  const fcb = moHinhMuc5.fact_canh_bao || [];
  const fcp = moHinhMuc5.fact_dong_chi_phi || [];

  return {
    phien_ban: 'SPEC-BC-MUC6-V1',
    bc_qt_01_kpi: taoBangBcQt01Kpi(fhs, fcb),
    bc_qt_01_top5_khoa_loi: taoBangBcQt01Top5Khoa(fhs, fcb),
    bc_qt_02_nang_suat: taoBangBcQt02NangSuat(fhs),
    bc_qt_03_tuan_thu: taoBangBcQt03TuanThu(fcb),
    bc_qt_04_ty_le: taoBangBcQt04TyLeChatLuong(fhs, fcb, danhSachHoSo),
    bc_qt_04_top10_rule: taoBangBcQt04Top10Rule(fcb),
    bc_qt_04_top10_khoa: taoBangBcQt04Top10KhoaCanCaiThien(fhs, fcb),
    bc_qt_04_doi_chieu_chi_phi: taoBangBcQt04LoiDoiChieuChiPhi(fcb),
    bc_qt_04_chenh_tong_chi: taoBangBcQt04ChenhLechTongChi(fhs, fcp).slice(0, 35),
  };
};
