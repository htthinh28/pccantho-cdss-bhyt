/**
 * Mô hình dữ liệu mục 5 — CDSS-BHYT-SPEC-BC (Star Schema: fact ở giữa, dimension tra cứu).
 * Nền tảng cho báo cáo JCI/QPS (đồng bộ M6–M8); không ghi IndexedDB — chỉ tính từ kho đã tải.
 */

import { phangHoaDanhSachLoiChiTiet } from '../tien_ich/thong_ke_loi_dung_chung';

const toNum = (v, fb = 0) => {
  const n = Number(String(v ?? '').replace(/,/g, '').trim());
  return Number.isFinite(n) ? n : fb;
};

const layXml1 = (hoSo = {}) =>
  hoSo?.xml1 || hoSo?.XML1 || hoSo?.du_lieu_goc?.xml1 || hoSo?.du_lieu_goc?.XML1 || {};

const layMaLK = (hoSo = {}) =>
  String(hoSo?.ma_lk || layXml1(hoSo)?.MA_LK || hoSo?.du_lieu_goc?.ma_lk || '').trim();

const layMangDong = (hoSo, ten) => {
  const raw = hoSo?.[ten.toLowerCase()] ?? hoSo?.[ten];
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === 'object') return [raw];
  return [];
};

const chuanLoaiKcb = (xml1) => {
  const v = String(xml1?.MA_LOAI_KCB ?? xml1?.ma_loai_kcb ?? '').trim();
  if (v === '1' || v === '01') return '1';
  if (v === '2' || v === '02') return '2';
  if (v === '3' || v === '03') return '3';
  return v || '';
};

const mapLoaiLoiTuCanhBao = (c) => {
  const loai = String(c?.loai_hien_thi || '').toUpperCase();
  if (loai === 'XUAT_TOAN') return 'doi_chieu_chi_phi';
  if (loai === 'CAU_TRUC_XML') return 'du_lieu';
  if (loai === 'NHAC_NHO') return 'goi_y';
  return 'canh_bao';
};

const mapMucDo = (c) => {
  const lv = String(c?.level_goc || c?.muc_do || '').toLowerCase();
  if (lv.includes('error') || lv.includes('critical')) return 'nghiem_trong';
  if (lv.includes('info')) return 'goi_y';
  return 'canh_bao';
};

/**
 * FACT_HO_SO — một dòng / một MA_LK (theo đặc tả §5.2.1).
 */
export const taoFactHoSo = (danhSachHoSo = []) => {
  const arr = Array.isArray(danhSachHoSo) ? danhSachHoSo : [];
  const chiTietLoi = phangHoaDanhSachLoiChiTiet(arr);
  const ruiRoTheoLK = new Map();
  for (const c of chiTietLoi) {
    const lk = String(c?.ma_lk || '').trim();
    if (!lk) continue;
    ruiRoTheoLK.set(lk, (ruiRoTheoLK.get(lk) || 0) + toNum(c?.chi_phi_uoc_tinh, 0));
  }

  return arr.map((hoSo) => {
    const x1 = layXml1(hoSo);
    const ma_lk = layMaLK(hoSo) || String(x1?.MA_LK || '').trim();
    const ketQua = Array.isArray(hoSo?.ket_qua_giam_dinh) ? hoSo.ket_qua_giam_dinh : [];
    const tongRuiRo = ruiRoTheoLK.get(ma_lk) || 0;

    return {
      ma_lk,
      ma_bn: String(x1?.MA_BN || hoSo?.ma_bn || '').trim(),
      ma_cskcb: String(x1?.MA_CSKCB || '').trim(),
      ma_khoa: String(x1?.MA_KHOA || '').trim(),
      ma_bac_si: String(x1?.MA_BS_KHAM || x1?.MA_BS_CHINH || '').trim(),
      loai_kcb: chuanLoaiKcb(x1),
      ma_icd_chinh: String(x1?.MA_BENH || x1?.MA_BENH_CHINH || '').trim(),
      ma_icd_phu: [],
      ngay_vao: String(x1?.NGAY_VAO || '').trim(),
      ngay_ra: String(x1?.NGAY_RA || '').trim(),
      so_ngay_dtri: toNum(x1?.SO_NGAY_DTRI, 0),
      t_thanhtoan: toNum(x1?.T_THANHTOAN ?? x1?.T_TONGCHI_BH, 0),
      t_bhtt: toNum(x1?.T_BHTT, 0),
      t_bncct: toNum(x1?.T_BNCCT, 0),
      t_bntt: toNum(x1?.T_BNTT, 0),
      t_thuoc: toNum(x1?.T_THUOC, 0),
      t_vtyt: toNum(x1?.T_VTYT, 0),
      t_xn: toNum(x1?.T_XN, 0),
      t_cdha: toNum(x1?.T_CDHA, 0),
      t_pttt: toNum(x1?.T_PTTT, 0),
      t_dvkt: toNum(x1?.T_DVKT, 0),
      t_giuong: toNum(x1?.T_GIUONG, 0),
      trang_thai_ho_so: hoSo?.trang_thai_ho_so || 'DA_KIEM',
      thoi_diem_nhap: hoSo?.thoi_diem_nhap_kho || '',
      thoi_diem_kiem_cuoi: hoSo?.thoi_diem_cap_nhat_so_lieu_tho || '',
      so_lan_sua: toNum(hoSo?.giam_dinh_lai, 0),
      co_canh_bao: ketQua.length > 0,
      tong_chi_phi_rui_ro: tongRuiRo,
    };
  });
};

const themDongChiPhi = (rows, hoSo, loai, bang, maLK) => {
  const ds = layMangDong(hoSo, bang);
  ds.forEach((row, idx) => {
    const stt = row?.STT ?? row?.stt ?? idx + 1;
    const id_dong = `${maLK}_${loai}_${stt}`;
    rows.push({
      id_dong,
      ma_lk: maLK,
      loai_dong: loai,
      ma_dich_vu: String(row?.MA_THUOC || row?.MA_DICH_VU || row?.MA_VAT_TU || '').trim(),
      ten_dich_vu: String(row?.TEN_THUOC || row?.TEN_DICH_VU || row?.TEN_VAT_TU || '').trim(),
      ma_nhom: String(row?.MA_NHOM || '').trim(),
      ma_khoa_chi_dinh: String(row?.MA_KHOA || '').trim(),
      ma_bs_chi_dinh: String(row?.MA_BS_CHINH || row?.MA_BS_KHAM || '').trim(),
      ngay_yl: String(row?.NGAY_YL || '').trim(),
      ngay_kq: String(row?.NGAY_KQ || '').trim(),
      so_luong: toNum(row?.SO_LUONG, 0),
      don_gia: toNum(row?.DON_GIA || row?.DON_GIA_BV || row?.DON_GIA_BH, 0),
      thanh_tien: toNum(row?.THANH_TIEN || row?.THANH_TIEN_BV, 0),
      thanh_tien_bv: toNum(row?.THANH_TIEN_BV, 0),
      thanh_tien_bh: toNum(row?.THANH_TIEN_BH, 0),
      t_bhtt_dong: toNum(row?.T_BHTT, 0),
      ty_le_tt: toNum(row?.TYLE_TT ?? row?.TYLE_TT_BH, 0),
    });
  });
};

/**
 * FACT_DONG_CHI_PHI — dòng XML2 / XML3 / XML4 (§5.2.2).
 */
export const taoFactDongChiPhi = (danhSachHoSo = []) => {
  const rows = [];
  for (const hoSo of Array.isArray(danhSachHoSo) ? danhSachHoSo : []) {
    const maLK = layMaLK(hoSo);
    if (!maLK) continue;
    themDongChiPhi(rows, hoSo, 'XML2', 'XML2', maLK);
    themDongChiPhi(rows, hoSo, 'XML3', 'XML3', maLK);
    themDongChiPhi(rows, hoSo, 'XML4', 'XML4', maLK);
  }
  return rows;
};

/**
 * FACT_CANH_BAO — một dòng / một cảnh báo đã chuẩn hóa (§5.2.3).
 */
export const taoFactCanhBao = (danhSachHoSo = []) => {
  const chiTiet = phangHoaDanhSachLoiChiTiet(Array.isArray(danhSachHoSo) ? danhSachHoSo : []);
  return chiTiet.map((c) => ({
    id_canh_bao: String(c?.khoa || `${c.ma_lk}_${c.ma_luat}_${c.index}`),
    ma_lk: String(c?.ma_lk || '').trim(),
    ma_rule: String(c?.ma_luat || '').trim(),
    ten_quy_tac: String(c?.ten_quy_tac || '').trim(),
    namespace_quy_tac: String(c?.namespace_quy_tac || '').trim(),
    nguon_quy_tac: String(c?.nguon_quy_tac || '').trim(),
    muc_do: mapMucDo(c),
    loai_loi: mapLoaiLoiTuCanhBao(c),
    ma_khoa: String(c?.ma_khoa || '').trim(),
    ma_bac_si: String(c?.ma_bac_si || '').trim(),
    chi_phi_anh_huong: toNum(c?.chi_phi_uoc_tinh, 0),
    luong_giai_trinh: String(c?.luong_giai_trinh || '').trim(),
    tab_quan_tri_goi_y: String(c?.tab_quan_tri_goi_y || '').trim(),
    thoi_diem_phat_sinh: '',
    trang_thai_xu_ly: 'chua_xu_ly',
    ly_do_bo_qua: '',
  }));
};

export const taoDimKhoaVaBacSi = (factHoSo = []) => {
  const khoa = new Map();
  const bacSi = new Map();
  for (const r of factHoSo) {
    if (r.ma_khoa) {
      khoa.set(r.ma_khoa, {
        ma_khoa: r.ma_khoa,
        ten_khoa: r.ma_khoa,
        khoi_chuc_nang: '',
        active: true,
      });
    }
    if (r.ma_bac_si) {
      bacSi.set(r.ma_bac_si, {
        ma_bac_si: r.ma_bac_si,
        ho_ten: r.ma_bac_si,
        ma_khoa: r.ma_khoa || '',
        chuyen_khoa: '',
        ccchn: '',
        active: true,
      });
    }
  }
  return {
    dim_khoa: [...khoa.values()].sort((a, b) => a.ma_khoa.localeCompare(b.ma_khoa, 'vi')),
    dim_bac_si: [...bacSi.values()].sort((a, b) => a.ma_bac_si.localeCompare(b.ma_bac_si, 'vi')),
  };
};

/** Đặc tả store §5.4 (hiển thị tham chiếu — chưa bật migration IndexedDB). */
export const dacTaStoreMuc54 = () => ({
  cache_bao_cao: {
    cache_key: 'string (keyPath)',
    ma_bao_cao: 'string',
    bo_loc: 'object',
    phien_ban_chi_so: 'string',
    du_lieu: 'object',
    thoi_diem_tao: 'number',
    thoi_diem_het_han: 'number',
    so_ho_so_nguon: 'number',
  },
  snapshot_bao_cao: {
    id_snapshot: 'string (uuid, keyPath)',
    ma_bao_cao: 'string',
    ky_bao_cao: "string // '2026-Q1', '2026-03', '2026-14W'",
    bo_loc: 'object',
    phien_ban_chi_so: 'string',
    du_lieu: 'object',
    chu_ky: '{ email, ho_ten, vai_tro, thoi_diem }',
    hash_du_lieu: 'string',
    trang_thai: "'nhap' | 'da_chot' | 'huy'",
  },
});

/**
 * Tổng hợp toàn bộ view mục 5 cho UI / export.
 */
export const tongHopMoHinhMuc5 = (danhSachHoSo = []) => {
  const fact_ho_so = taoFactHoSo(danhSachHoSo);
  const { dim_khoa, dim_bac_si } = taoDimKhoaVaBacSi(fact_ho_so);
  return {
    phien_ban_mo_hinh: 'SPEC-BC-MUC5-V1',
    fact_ho_so,
    fact_dong_chi_phi: taoFactDongChiPhi(danhSachHoSo),
    fact_canh_bao: taoFactCanhBao(danhSachHoSo),
    fact_phien_lam_viec: [],
    dim_khoa,
    dim_bac_si,
    dim_nguoi_dung: [],
    dim_rule: [],
    dim_icd: [],
    dim_dvkt: [],
    dim_thuoc: [],
    dim_thoi_gian: [],
    dac_ta_store_5_4: dacTaStoreMuc54(),
  };
};
