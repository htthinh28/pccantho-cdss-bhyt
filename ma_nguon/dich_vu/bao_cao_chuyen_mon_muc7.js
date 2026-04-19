/**
 * Bộ báo cáo nhóm Chuyên môn — mục 7 đặc tả CDSS-BHYT-SPEC-BC (BC-CM-01 … BC-CM-05).
 * Nguồn: FACT_* mục 5 + hồ sơ gốc; chỉ số cần CPW / DDI workflow / CLS 24h trả "—" kèm ghi chú.
 */

import { suyRaNamespaceVaNguonQuyTac } from '../tien_ich/dong_co_giam_dinh';

const toNum = (v, fb = 0) => {
  const n = Number(String(v ?? '').replace(/,/g, '').trim());
  return Number.isFinite(n) ? n : fb;
};

const layXml1TuHoSo = (hoSo = {}) =>
  hoSo?.xml1 || hoSo?.XML1 || hoSo?.du_lieu_goc?.xml1 || hoSo?.du_lieu_goc?.XML1 || {};

const digitsYmd = (s) => String(s || '').replace(/\D/g, '').slice(0, 8);

const ngayRaTruocNgayVao = (ngayVao, ngayRa) => {
  const a = digitsYmd(ngayVao);
  const b = digitsYmd(ngayRa);
  if (a.length >= 8 && b.length >= 8) return Number(b.slice(0, 8)) < Number(a.slice(0, 8));
  return false;
};

const laLoiHanhChinhHoSo = (x1) => {
  const maThe = String(x1?.MA_THE || x1?.MA_THE_BHYT || '').trim();
  const cccd = String(x1?.SO_CCCD || x1?.CCCD || '').trim();
  const maBn = String(x1?.MA_BN || '').trim();
  const ns = String(x1?.NGAY_SINH || '').trim();
  return (!maThe || maThe.length < 10) || (!cccd && !maBn) || !ns;
};

/** BC-CM-01 — Phân bố theo khoa (hành chính / logic thời gian = mức hồ sơ; còn lại = số dòng FACT_CANH_BAO). */
export const taoBangBcCm01PhanBoKhoa = (factHoSo = [], factCanhBao = [], danhSachHoSo = []) => {
  const map = new Map();

  const ensure = (maKhoa) => {
    const k = maKhoa || '(không rõ khoa)';
    if (!map.has(k)) {
      map.set(k, {
        ma_khoa: k,
        so_ho_so: 0,
        hanh_chinh_hs: 0,
        logic_thoi_gian_hs: 0,
        du_lieu: 0,
        doi_chieu_chi_phi: 0,
        canh_bao_cdss: 0,
        goi_y: 0,
        chi_dinh_bat_thuong: 0,
      });
    }
    return map.get(k);
  };

  for (const f of factHoSo) {
    const row = ensure(String(f.ma_khoa || '').trim());
    row.so_ho_so += 1;
  }

  for (const hs of Array.isArray(danhSachHoSo) ? danhSachHoSo : []) {
    const x1 = layXml1TuHoSo(hs);
    const mk = String(x1?.MA_KHOA || '').trim() || '(không rõ khoa)';
    const row = ensure(mk);
    if (laLoiHanhChinhHoSo(x1)) row.hanh_chinh_hs += 1;
    if (ngayRaTruocNgayVao(x1?.NGAY_VAO, x1?.NGAY_RA)) row.logic_thoi_gian_hs += 1;
  }

  const nsChiDinhBatThuong = (c) => {
    const n = String(c.namespace_quy_tac || '').toUpperCase();
    return (
      n.includes('DVKT')
      || n.includes('CDHA')
      || n.includes('PTTT')
      || /^CLN-(CDHA|PTTT|GIUONG|CT)-/i.test(String(c.ma_rule || ''))
    );
  };

  for (const c of factCanhBao) {
    const mk = String(c.ma_khoa || '').trim() || '(không rõ khoa)';
    const row = ensure(mk);
    const loai = String(c.loai_loi || '');
    if (loai === 'du_lieu') row.du_lieu += 1;
    else if (loai === 'doi_chieu_chi_phi') row.doi_chieu_chi_phi += 1;
    else if (loai === 'goi_y') row.goi_y += 1;
    else row.canh_bao_cdss += 1;
    if (nsChiDinhBatThuong(c)) row.chi_dinh_bat_thuong += 1;
  }

  return [...map.values()]
    .map((r) => {
      const engineTong =
        r.du_lieu + r.doi_chieu_chi_phi + r.canh_bao_cdss + r.goi_y;
      const tongLoi =
        r.hanh_chinh_hs + r.logic_thoi_gian_hs + engineTong;
      const per100 = r.so_ho_so > 0 ? (tongLoi / r.so_ho_so) * 100 : 0;
      const mkR = r.ma_khoa === '(không rõ khoa)' ? '' : r.ma_khoa;
      const nghiem = factCanhBao.filter((c) => {
        const ck = String(c.ma_khoa || '').trim();
        const cungKhoa = mkR === '' ? !ck : ck === mkR;
        return cungKhoa && String(c.muc_do || '') === 'nghiem_trong';
      }).length;
      const per100Nghiem = r.so_ho_so > 0 ? (nghiem / r.so_ho_so) * 100 : 0;
      return {
        ...r,
        tong_loi_uoc: tongLoi,
        ty_le_loi_tren_100_hs: Number(per100.toFixed(2)),
        ty_le_nghiem_trong_tren_100_hs: Number(per100Nghiem.toFixed(2)),
      };
    })
    .sort((a, b) => b.ty_le_loi_tren_100_hs - a.ty_le_loi_tren_100_hs)
    .slice(0, 25);
};

export const taoBangBcCm01Kpi = (factHoSo = [], factCanhBao = []) => {
  const n = factHoSo.length || 0;
  const nghiem = factCanhBao.filter((c) => String(c.muc_do || '') === 'nghiem_trong').length;
  const per100 = n > 0 ? (factCanhBao.length / n) * 100 : 0;
  const per100N = n > 0 ? (nghiem / n) * 100 : 0;
  return [
    {
      ma_chi_so: 'BC_CM_01_LOI_100',
      ten: 'Tỷ lệ lỗi (dòng cảnh báo + hồ sơ hành chính/logic) / 100 hồ sơ',
      gia_tri: n ? per100.toFixed(2) : '—',
      don_vi: 'lỗi/100HS',
      ghi_chu: 'Proxy BC-CM-01 — chưa heat-map 12 tháng (kho chưa gắn kỳ).',
    },
    {
      ma_chi_so: 'BC_CM_01_NGHIEM_100',
      ten: 'Tỷ lệ lỗi trọng yếu / 100 hồ sơ (JCI QPS proxy)',
      gia_tri: n ? per100N.toFixed(2) : '—',
      don_vi: 'lỗi/100HS',
      ghi_chu: 'COUNT(muc_do=nghiem_trong) / tổng hồ sơ kho.',
    },
    {
      ma_chi_so: 'BC_CM_01_XU_HUONG',
      ten: 'Xu hướng 12 tháng theo khoa',
      gia_tri: '—',
      don_vi: '—',
      ghi_chu: 'Cần filter kỳ + snapshot theo tháng — chưa có trong pipeline cục bộ.',
    },
  ];
};

/** BC-CM-02 — CPW: bảng mẫu theo đặc tả; số liệu từng bước cần engine phác đồ. */
export const taoBangBcCm02PhacDoCpw = () => [
  {
    ma_phac_do: 'CPW_STROKE',
    ten: 'Đột quỵ (cấp cứu / can thiệp / PHCN)',
    ty_le_tuan_thu: '—',
    dtn_dtb_phut_tb: '—',
    ghi_chu: 'Điều kiện tiên quyết: cấu hình phác đồ QuanLyChuyenMon — chưa đối chiếu XML với tiêu chí CPW.',
  },
  {
    ma_phac_do: 'CPW_ACS',
    ten: 'Hội chứng mạch vành cấp (STEMI/NSTEMI)',
    ty_le_tuan_thu: '—',
    dtn_dtb_phut_tb: '—',
    ghi_chu: 'Cần timestamp door + chỉ định CLS theo bundle.',
  },
  {
    ma_phac_do: 'CPW_OHCA',
    ten: 'Ngừng tim ngoài bệnh viện (OHCA) — ROSC bundle',
    ty_le_tuan_thu: '—',
    dtn_dtb_phut_tb: '—',
    ghi_chu: 'Dữ liệu thường không đủ trên XML130 đơn lẻ.',
  },
  {
    ma_phac_do: 'CPW_DM2',
    ten: 'Đái tháo đường type 2 — NT & NT',
    ty_le_tuan_thu: '—',
    dtn_dtb_phut_tb: '—',
    ghi_chu: 'so_tieu_chi_dat / tong_tieu_chi >= ngưỡng (mặc định 80%) — chờ map CPW.',
  },
  {
    ma_phac_do: 'CPW_GDM',
    ten: 'Đái tháo đường thai kỳ (GDM) — insulin',
    ty_le_tuan_thu: '—',
    dtn_dtb_phut_tb: '—',
    ghi_chu: 'Theo đặc tả §7.2.',
  },
  {
    ma_phac_do: 'CPW_HTN',
    ten: 'Tăng huyết áp',
    ty_le_tuan_thu: '—',
    dtn_dtb_phut_tb: '—',
    ghi_chu: 'Theo đặc tả §7.2.',
  },
  {
    ma_phac_do: 'CPW_OBESITY',
    ten: 'Béo phì (rối loạn chuyển hoá)',
    ty_le_tuan_thu: '—',
    dtn_dtb_phut_tb: '—',
    ghi_chu: 'Theo đặc tả §7.2.',
  },
];

const laCanhBaoDdi = (c) => {
  const ns = String(c.namespace_quy_tac || '').toUpperCase();
  const rule = String(c.ma_rule || '').toUpperCase();
  const nguon = String(c.nguon_quy_tac || '').toLowerCase();
  return (
    ns.includes('TUONG_TAC')
    || rule.startsWith('TUONGTAC_')
    || nguon.includes('tuong_tac')
  );
};

const mucDoDdi = (c) => {
  const m = String(c.muc_do || '');
  if (m === 'nghiem_trong') return 'major';
  if (m === 'goi_y') return 'minor';
  return 'moderate';
};

/** BC-CM-03 — DDI từ cảnh báo gắn namespace / mã TUONGTAC_. */
export const taoBangBcCm03TomTatDdi = (factCanhBao = []) => {
  const ddi = factCanhBao.filter(laCanhBaoDdi);
  const dem = (x) => ddi.filter((c) => mucDoDdi(c) === x).length;
  return [
    {
      chi_so: 'DDI_TONG',
      ten: 'Tổng cảnh báo DDI trong kỳ (proxy toàn kho)',
      gia_tri: String(ddi.length),
      ghi_chu: 'Lọc namespace TUONG_TAC_* hoặc MA_LUAT TUONGTAC_.',
    },
    {
      chi_so: 'DDI_MAJOR',
      ten: 'Phân mức — major (nghiêm trọng)',
      gia_tri: String(dem('major')),
      ghi_chu: 'map muc_do=nghiem_trong.',
    },
    {
      chi_so: 'DDI_MODERATE',
      ten: 'Phân mức — moderate',
      gia_tri: String(dem('moderate')),
      ghi_chu: 'map muc_do=canh_bao.',
    },
    {
      chi_so: 'DDI_MINOR',
      ten: 'Phân mức — minor',
      gia_tri: String(dem('minor')),
      ghi_chu: 'map muc_do=goi_y.',
    },
    {
      chi_so: 'DDI_XU_LY',
      ten: 'Tỷ lệ xử lý / thời gian TB sửa đơn',
      gia_tri: '—',
      ghi_chu: 'Cần workflow đã sửa / bỏ qua có lý do / chấp nhận rủi ro trên FACT_CANH_BAO.',
    },
  ];
};

export const taoBangBcCm03TopCapThuoc = (factCanhBao = []) => {
  const m = new Map();
  for (const c of factCanhBao.filter(laCanhBaoDdi)) {
    const key = String(c.ma_rule || '').trim() || '(không mã)';
    m.set(key, (m.get(key) || 0) + 1);
  }
  return [...m.entries()]
    .map(([ma_rule, so_loi]) => ({ ma_rule, so_loi, ghi_chu: 'Proxy cặp thuốc — cần parse MA_THUOC từ nội dung cảnh báo.' }))
    .sort((a, b) => b.so_loi - a.so_loi)
    .slice(0, 10);
};

export const taoBangBcCm03TopKhoaBsDdi = (factCanhBao = []) => {
  const byKhoa = new Map();
  for (const c of factCanhBao.filter(laCanhBaoDdi)) {
    if (mucDoDdi(c) !== 'major') continue;
    const k = String(c.ma_khoa || '').trim() || '(không rõ)';
    byKhoa.set(k, (byKhoa.get(k) || 0) + 1);
  }
  return [...byKhoa.entries()]
    .map(([ma_khoa, so_major]) => ({
      ma_khoa,
      so_major,
      ghi_chu: 'Ẩn danh BS theo đặc tả tầng viện — chỉ hiện mã khoa.',
    }))
    .sort((a, b) => b.so_major - a.so_major)
    .slice(0, 10);
};

const MA_RULE_DOI_CHIEU = new Set(['XML_49', 'XML_53', 'XML_109', 'XML_143']);

const GOI_Y_CM04 = {
  DVKT_NO_CODE: 'Rà soát cấu hình rule tại QuanLyQuyTacOnOff',
  CDHA_HARDCODED: 'Rà soát quy trình chỉ định của khoa CĐHA',
  CDHA_BUILTIN: 'Rà soát quy trình chỉ định của khoa CĐHA',
  PTTT_BUILTIN: 'Phòng mổ rà lại quy trình mã hoá',
  PTTT_SEED: 'Phòng mổ rà lại quy trình mã hoá',
  GIAM_DINH_CHUYEN_DE: 'Chuyển cho Tổ giám định nội bộ để xử lý',
  LUAT_DU_LIEU: 'Chuyển cho BC-DT-03 phân tích chi tiết',
  TUONG_TAC_THUOC: 'Xem BC-CM-03',
  HANH_CHINH_BUILTIN: 'Rà XML1 — luồng hành chính built-in',
  HANH_CHINH_HARDCODED: 'Rà XML1 — luồng hành chính hardcoded',
  THUOC_DANH_MUC_BUILTIN: 'Rà quy tắc thuốc / danh mục',
  THUOC_HARDCODED: 'Rà quy tắc thuốc hardcoded',
  NHAN_SU_HARDCODED: 'Rà quy tắc nhân sự / CCHN',
  PYTHON_SERVICE: 'Rà risk engine / Python',
  QUY_TAC_NOI_BO: 'Rà rule nội bộ / QuanLyQuyTacOnOff',
  XML3_KHAC: 'Phân loại rule XML3',
  ICD10_TT06_BUILTIN: 'Rà mã ICD theo TT 06/2026',
  DVKT_DANH_MUC: 'Rà danh mục DVKT',
  XDC_BUILTIN: 'Rà đối chiếu đa tầng XML',
  CLN_CHI: 'Đối chiếu chi phí / thuốc (xem BC-DT-03)',
};

const chuanNamespaceCm04 = (rawNs, maRule) => {
  const s = String(rawNs || '').trim();
  if (s) return s;
  const meta = suyRaNamespaceVaNguonQuyTac({ ma_luat: maRule });
  return String(meta.namespace_quy_tac || 'QUY_TAC_NOI_BO').trim();
};

/** BC-CM-04 — Gom theo namespace (bổ sung meta khi thiếu). */
export const taoBangBcCm04ViPhamNamespace = (factCanhBao = []) => {
  const buckets = new Map();
  for (const c of factCanhBao) {
    let ns = chuanNamespaceCm04(c.namespace_quy_tac, c.ma_rule);
    const mr = String(c.ma_rule || '').trim();
    if (MA_RULE_DOI_CHIEU.has(mr)) ns = 'LUAT_DU_LIEU';
    if (/^TUONGTAC_/i.test(mr) || String(ns).toUpperCase().includes('TUONG_TAC')) {
      ns = 'TUONG_TAC_THUOC';
    }
    buckets.set(ns, (buckets.get(ns) || 0) + 1);
  }

  const specOrder = [
    'DVKT_NO_CODE',
    'CDHA_HARDCODED',
    'PTTT_BUILTIN',
    'GIAM_DINH_CHUYEN_DE',
    'LUAT_DU_LIEU',
    'TUONG_TAC_THUOC',
  ];

  const rows = [];
  for (const ns of specOrder) {
    const so = buckets.get(ns) || 0;
    rows.push({
      namespace: ns,
      bao_cao_gi:
        ns === 'DVKT_NO_CODE'
          ? 'Rule no-code DVKT bị vi phạm'
          : ns === 'CDHA_HARDCODED'
            ? 'Chỉ định CĐHA bất thường (trùng / chống chỉ định)'
            : ns === 'PTTT_BUILTIN'
              ? 'PTTT — sai mã / nhóm / điều kiện thanh toán'
              : ns === 'GIAM_DINH_CHUYEN_DE'
                ? 'Vi phạm giám định chuyên đề BHYT'
                : ns === 'LUAT_DU_LIEU'
                  ? 'Đối chiếu chi phí (XML_49/53/109/143)'
                  : 'Cảnh báo DDI',
      hanh_dong: GOI_Y_CM04[ns] || 'Rà rule tại QuanLyQuyTacOnOff / đúng tab quản trị.',
      so_vi_pham: so,
    });
  }

  for (const [ns, so] of [...buckets.entries()].sort((a, b) => b[1] - a[1])) {
    if (specOrder.includes(ns)) continue;
    rows.push({
      namespace: ns,
      bao_cao_gi: 'Vi phạm rule theo namespace engine',
      hanh_dong: GOI_Y_CM04[ns] || 'Rà soát cấu hình quy tắc.',
      so_vi_pham: so,
    });
  }
  return rows;
};

const MA_RULE_CLN_CHI = /^CLN-CHI-/i;

/** BC-CM-05 — Chỉ định bất thường & CLQ (phần tính được + placeholder). */
export const taoBangBcCm05ChiSo = (factCanhBao = []) => {
  const clnChi = factCanhBao.filter((c) => MA_RULE_CLN_CHI.test(String(c.ma_rule || ''))).length;
  return [
    {
      chi_so: 'CLS_TRUNG_24H',
      ten: 'Tỷ lệ CLS trùng lặp trong 24h',
      gia_tri: '—',
      ghi_chu: 'Cần nhóm theo MA_BN + loại DVKT + cửa sổ 24h trên XML3.',
    },
    {
      chi_so: 'THUOC_NGOAI_PD',
      ten: 'Tỷ lệ thuốc ngoài phác đồ khoa',
      gia_tri: '—',
      ghi_chu: 'Cần map đơn XML2 với CPW đã cấu hình.',
    },
    {
      chi_so: 'KSN_KINH_NGHIEM_72H',
      ten: 'Kháng sinh kinh nghiệm >72h không vi sinh',
      gia_tri: '—',
      ghi_chu: 'Cần ngày chỉ định + kết quả XN vi sinh.',
    },
    {
      chi_so: 'NGAY_NAM_VUOT_TRAN_DRG',
      ten: 'Ngày nằm vượt trần DRG (proxy ICD)',
      gia_tri: '—',
      ghi_chu: 'Cần bảng DRG theo ICD.',
    },
    {
      chi_so: 'CLN_CHI_01',
      ten: 'Hồ sơ có rule CLN-CHI-* (đối chiếu tổng thuốc)',
      gia_tri: String(clnChi),
      ghi_chu: 'Đếm dòng FACT_CANH_BAO khớp tiền tố CLN-CHI-.',
    },
  ];
};

export const taoBangBcCm05TopIcdChiPhiCao = (factHoSo = []) => {
  const byIcd = new Map();
  for (const f of factHoSo) {
    const icd = String(f.ma_icd_chinh || '').trim();
    if (!icd) continue;
    if (!byIcd.has(icd)) byIcd.set(icd, { tong: 0, n: 0 });
    const o = byIcd.get(icd);
    o.tong += toNum(f.t_thanhtoan, 0);
    o.n += 1;
  }
  const toanVien = factHoSo.map((f) => toNum(f.t_thanhtoan, 0));
  const meanAll =
    toanVien.length > 0 ? toanVien.reduce((a, b) => a + b, 0) / toanVien.length : 0;
  const varAll =
    toanVien.length > 1
      ? toanVien.reduce((s, x) => s + (x - meanAll) ** 2, 0) / (toanVien.length - 1)
      : 0;
  const stdAll = Math.sqrt(varAll);

  return [...byIcd.entries()]
    .filter(([, v]) => v.n >= 1)
    .map(([ma_icd, v]) => {
      const tb = v.tong / v.n;
      const vuot = v.n >= 2 && stdAll > 0 && tb > meanAll + 2 * stdAll;
      return {
        ma_icd,
        so_ho_so: v.n,
        tb_thanhtoan: Math.round(tb),
        chenh_vs_mean_all: Math.round(tb - meanAll),
        ghi_chu: vuot ? 'TB > mean toàn viện + 2σ (proxy §7.5).' : 'Chưa vượt ngưỡng 2σ hoặc mẫu nhỏ.',
      };
    })
    .sort((a, b) => b.tb_thanhtoan - a.tb_thanhtoan)
    .slice(0, 12);
};

export const tongHopBaoCaoChuyenMonMuc7 = ({ moHinhMuc5 = {}, danhSachHoSo = [] }) => {
  const fhs = moHinhMuc5.fact_ho_so || [];
  const fcb = moHinhMuc5.fact_canh_bao || [];

  return {
    phien_ban: 'SPEC-BC-MUC7-V1',
    bc_cm_01_kpi: taoBangBcCm01Kpi(fhs, fcb),
    bc_cm_01_phan_bo_khoa: taoBangBcCm01PhanBoKhoa(fhs, fcb, danhSachHoSo),
    bc_cm_02_cpw: taoBangBcCm02PhacDoCpw(),
    bc_cm_03_tom_tat: taoBangBcCm03TomTatDdi(fcb),
    bc_cm_03_top_rule: taoBangBcCm03TopCapThuoc(fcb),
    bc_cm_03_top_khoa_major: taoBangBcCm03TopKhoaBsDdi(fcb),
    bc_cm_04_namespace: taoBangBcCm04ViPhamNamespace(fcb),
    bc_cm_05_chi_so: taoBangBcCm05ChiSo(fcb),
    bc_cm_05_top_icd: taoBangBcCm05TopIcdChiPhiCao(fhs),
  };
};
