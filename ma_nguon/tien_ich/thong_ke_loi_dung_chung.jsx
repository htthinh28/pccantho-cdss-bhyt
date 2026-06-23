import { chuanHoaCanhBaoGiamDinh } from './chuan_hoa_van_ban';
import { dinhDangChuoiBacSiHoTenKemCchnBaoCao } from './dinh_dang_cchn_bao_cao';
import { suyRaNamespaceVaNguonQuyTac } from './dong_co_giam_dinh';
import { loiKhopBoLocIcd10ViPham } from './icd10_loc_vi_pham';
import { DANH_MUC_QUY_TAC_NOI_BO, khopMaLuatTheoMau, suyRaThongTinQuanTriQuyTac } from './quy_tac_on_off_noi_bo';

export const THU_TU_UU_TIEN_CANH_BAO = Object.freeze({
  XUAT_TOAN: 0,
  CAU_TRUC_XML: 1,
  CANH_BAO: 2,
  NHAC_NHO: 3,
});

export const NHAN_UU_TIEN_CANH_BAO = Object.freeze({
  XUAT_TOAN: 'Xuất toán',
  CAU_TRUC_XML: 'Vi phạm cấu trúc XML',
  CANH_BAO: 'Cảnh báo',
  NHAC_NHO: 'Nhắc nhở',
});

export const MAP_TAB_QUAN_TRI_THEO_XML = Object.freeze({
  XML1: 'LUAT_HANH_CHINH',
  XML2: 'LUAT_THUOC',
  XML3: 'LUAT_CDHA',
  XML4: 'LUAT_CDHA',
  XML5: 'LUAT_PTTT',
  XML6: 'LUAT_HOP_DONG',
});

/** Nhóm nghiệp vụ (dashboard) — lọc vi phạm theo loại chi phí / phân hệ XML. Khác `loai_hien_thi` (xuất toán, cảnh báo…). */
export const NHOM_VI_PHAM_IDS = Object.freeze({
  HANH_CHINH: 'HANH_CHINH',
  DVKT: 'DVKT',
  CONG_KHAM: 'CONG_KHAM',
  GIUONG_BENH: 'GIUONG_BENH',
  THUOC: 'THUOC',
  VTYT: 'VTYT',
  NHAN_SU: 'NHAN_SU',
  CHUYEN_VIEN: 'CHUYEN_VIEN',
});

export const NHOM_VI_PHAM_TAT_CA = 'TAT_CA';

export const DANH_SACH_NHOM_VI_PHAM_LOC = Object.freeze([
  { id: NHOM_VI_PHAM_TAT_CA, label: 'Tất cả' },
  { id: NHOM_VI_PHAM_IDS.HANH_CHINH, label: 'Hành chính' },
  { id: NHOM_VI_PHAM_IDS.DVKT, label: 'Dịch vụ kỹ thuật' },
  { id: NHOM_VI_PHAM_IDS.CONG_KHAM, label: 'Công khám' },
  { id: NHOM_VI_PHAM_IDS.GIUONG_BENH, label: 'Giường bệnh' },
  { id: NHOM_VI_PHAM_IDS.THUOC, label: 'Thuốc' },
  { id: NHOM_VI_PHAM_IDS.VTYT, label: 'Vật tư y tế' },
  { id: NHOM_VI_PHAM_IDS.NHAN_SU, label: 'Nhân sự' },
  { id: NHOM_VI_PHAM_IDS.CHUYEN_VIEN, label: 'Chuyển viện' },
]);

/** Chuẩn MA_LOAI_KCB (XML1) — 1/01 → 01; đồng bộ engine / Kho lưu trữ. */
export const chuanHoaMaLoaiKcbThongKe = (val) => {
  const raw = String(val ?? '').trim();
  if (!raw) return '';
  const digits = raw.replace(/\D/g, '');
  return digits ? digits.padStart(2, '0') : raw;
};

/**
 * Tên gợi nhớ theo mã DM loại KCB (tham chiếu phân loại BHXH — QĐ 130 / TT 37, bảng mã 802).
 */
export const TEN_GOI_LOAI_KCB_802 = Object.freeze({
  '01': 'Khám bệnh',
  '02': 'Ngoại trú',
  '03': 'Nội trú',
  '04': 'Nội trú ban ngày',
  '05': 'Ngoại trú từ nội trú',
  '06': 'Tái khám',
  '07': 'Cấp cứu',
  '08': 'Khác (ngoại trú…)',
  '09': 'Nội trú (09)',
});

/** Gom mã MA_LOAI_KCB theo nhóm điều trị (tham chiếu QĐ 824 / DM loại KCB — khớp tập mã trong engine). */
export const NHOM_CAP_LOAI_KCB_802 = Object.freeze({
  TAT_CA: NHOM_VI_PHAM_TAT_CA,
  NGOAI_TRU: 'NGOAI_TRU',
  NOI_TRU: 'NOI_TRU',
  NOI_TRU_BAN_NGAY: 'NOI_TRU_BAN_NGAY',
  KHAC: 'KHAC',
  CHUA_GHI: 'CHUA_GHI',
});

const TAP_MA_LOAI_KCB_NGOAI_TRU_QD824 = new Set(['01', '02', '05', '06', '07', '08']);
const TAP_MA_LOAI_KCB_NOI_TRU_QD824 = new Set(['03', '09']);
const TAP_MA_LOAI_KCB_NTBN_QD824 = new Set(['04']);

export const layNhomCapLoaiKcb802 = (maChuanHoacRaw = '') => {
  const raw = String(maChuanHoacRaw || '').trim();
  if (!raw || raw === 'KHONG_RO') return NHOM_CAP_LOAI_KCB_802.CHUA_GHI;
  const norm = chuanHoaMaLoaiKcbThongKe(raw) || raw;
  if (TAP_MA_LOAI_KCB_NGOAI_TRU_QD824.has(norm)) return NHOM_CAP_LOAI_KCB_802.NGOAI_TRU;
  if (TAP_MA_LOAI_KCB_NOI_TRU_QD824.has(norm)) return NHOM_CAP_LOAI_KCB_802.NOI_TRU;
  if (TAP_MA_LOAI_KCB_NTBN_QD824.has(norm)) return NHOM_CAP_LOAI_KCB_802.NOI_TRU_BAN_NGAY;
  return NHOM_CAP_LOAI_KCB_802.KHAC;
};

const NHAN_NHOM_CAP_LOAI_KCB_802 = Object.freeze({
  [NHOM_CAP_LOAI_KCB_802.NGOAI_TRU]: 'Ngoại trú',
  [NHOM_CAP_LOAI_KCB_802.NOI_TRU]: 'Nội trú',
  [NHOM_CAP_LOAI_KCB_802.NOI_TRU_BAN_NGAY]: 'Nội trú ban ngày',
  [NHOM_CAP_LOAI_KCB_802.KHAC]: 'Loại KCB khác',
  [NHOM_CAP_LOAI_KCB_802.CHUA_GHI]: 'Chưa ghi loại KCB',
});

/** Thẻ lọc dashboard — nhãn «Ngoại trú» / «Nội trú», không tách từng mã. */
export const DANH_SACH_NHOM_CAP_LOAI_KCB_LOC = Object.freeze([
  { id: NHOM_CAP_LOAI_KCB_802.TAT_CA, label: 'Tất cả' },
  { id: NHOM_CAP_LOAI_KCB_802.NGOAI_TRU, label: 'Ngoại trú', phu: '01,02,05–08' },
  { id: NHOM_CAP_LOAI_KCB_802.NOI_TRU, label: 'Nội trú', phu: '03,09' },
  { id: NHOM_CAP_LOAI_KCB_802.NOI_TRU_BAN_NGAY, label: 'Nội trú ban ngày', phu: '04' },
  { id: NHOM_CAP_LOAI_KCB_802.KHAC, label: 'Mã khác', phu: 'ngoài DM nhóm trên' },
  { id: NHOM_CAP_LOAI_KCB_802.CHUA_GHI, label: 'Chưa ghi mã', phu: 'XML1 thiếu' },
]);

const toNumberSafe = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const chuanHoaTokenThongKeLoi = (value) => String(value || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toUpperCase()
  .trim();

const layGiaTriTheoKhoaKhongPhanBiet = (obj, tenTruong, fallback = '') => {
  if (!obj || typeof obj !== 'object') return fallback;
  const tenChuan = String(tenTruong || '').toLowerCase().replace(/_/g, '');
  const keyTimThay = Object.keys(obj).find((key) => String(key || '').toLowerCase().replace(/_/g, '') === tenChuan);
  const giaTri = keyTimThay ? obj[keyTimThay] : undefined;
  return giaTri === undefined || giaTri === null || giaTri === '' ? fallback : giaTri;
};

export const layXml1HoSo = (hoSo = {}) => hoSo?.xml1 || hoSo?.XML1 || hoSo?.du_lieu_goc?.xml1 || hoSo?.du_lieu_goc?.XML1 || {};

export const layMaLKHoSo = (hoSo = {}) => String(
  hoSo?.ma_lk
  || layXml1HoSo(hoSo)?.MA_LK
  || hoSo?.du_lieu_goc?.ma_lk
  || ''
).trim();

export const layTenBenhNhanHoSo = (hoSo = {}) => String(
  hoSo?.ten_bn
  || hoSo?.ten_benh_nhan
  || layXml1HoSo(hoSo)?.HO_TEN
  || 'Không rõ bệnh nhân'
).trim();

export const layDanhSachLoiHoSo = (hoSo = {}) => {
  if (Array.isArray(hoSo?.ket_qua_giam_dinh)) return hoSo.ket_qua_giam_dinh.map(chuanHoaCanhBaoGiamDinh);
  if (Array.isArray(hoSo?.giam_dinh_5_tang?.ket_qua_giam_dinh)) return hoSo.giam_dinh_5_tang.ket_qua_giam_dinh.map(chuanHoaCanhBaoGiamDinh);
  return [];
};

export const layBangXmlTuCanhBao = (canhBao = {}) => {
  const match = String(canhBao?.phan_he || canhBao?.phanHe || canhBao?.phan_loai || '').toUpperCase().match(/XML\d+/);
  return match ? match[0] : 'XML1';
};

export const coMaLuatHopLe = (value) => {
  const ma = String(value || '').trim();
  return ma !== '' && ma.toUpperCase() !== 'N/A' && ma.toUpperCase() !== 'KHONG_RO';
};

/** Lỗi kiểm tra cấu trúc / định dạng dữ liệu XML (QĐ 3176, tiền xử lý STRUCT, v.v.) — tách khỏi cảnh báo nghiệp vụ CDSS. */
export const laLoiCauTrucDuLieuXml = (canhBao = {}) => {
  const dk = chuanHoaTokenThongKeLoi(canhBao?.dieu_kien);
  const maRaw = String(canhBao?.ma_luat || canhBao?.MA_LUAT || '').trim();
  const ma = chuanHoaTokenThongKeLoi(maRaw);
  const ten = chuanHoaTokenThongKeLoi([
    canhBao?.ten_quy_tac,
    canhBao?.TEN_QUY_TAC,
  ].filter(Boolean).join(' '));

  if (maRaw && /^STRUCT/i.test(maRaw)) return true;
  if (dk === 'STATIC' && ten.includes('CAU TRUC XML')) return true;
  if (dk === 'STATIC' && /^XML[0-9]+-/.test(ma)) return true;

  return false;
};

export const suyRaLoaiCanhBaoThongKe = (canhBao = {}) => {
  const thongTinQuanTri = suyRaThongTinQuanTriQuyTac(canhBao);
  const noiDung = chuanHoaTokenThongKeLoi([
    canhBao?.canh_bao,
    canhBao?.CANH_BAO,
    canhBao?.message,
    canhBao?.ten_quy_tac,
    canhBao?.TEN_QUY_TAC,
    canhBao?.muc_do,
    canhBao?.level,
    thongTinQuanTri.nhom_canh_bao,
    thongTinQuanTri.chi_tiet_canh_bao,
  ].filter(Boolean).join(' | '));

  if (laLoiCauTrucDuLieuXml(canhBao)) {
    return {
      id: 'CAU_TRUC_XML',
      label: NHAN_UU_TIEN_CANH_BAO.CAU_TRUC_XML,
      priority: THU_TU_UU_TIEN_CANH_BAO.CAU_TRUC_XML,
    };
  }

  if (thongTinQuanTri.nhom_canh_bao === 'XUAT_TOAN' || noiDung.includes('XUAT TOAN') || noiDung.includes('KHONG THANH TOAN') || noiDung.includes('VI PHAM')) {
    return { id: 'XUAT_TOAN', label: NHAN_UU_TIEN_CANH_BAO.XUAT_TOAN, priority: THU_TU_UU_TIEN_CANH_BAO.XUAT_TOAN };
  }
  if (noiDung.includes('NHAC NHO') || noiDung.includes('GOI Y') || noiDung.includes('THONG TIN') || chuanHoaTokenThongKeLoi(canhBao?.muc_do || canhBao?.level) === 'INFO') {
    return { id: 'NHAC_NHO', label: NHAN_UU_TIEN_CANH_BAO.NHAC_NHO, priority: THU_TU_UU_TIEN_CANH_BAO.NHAC_NHO };
  }
  return { id: 'CANH_BAO', label: NHAN_UU_TIEN_CANH_BAO.CANH_BAO, priority: THU_TU_UU_TIEN_CANH_BAO.CANH_BAO };
};

export const suyRaTabQuanTriQuyTacTuLoi = (canhBao = {}) => {
  const tabGoiY = String(canhBao?.tab_quan_tri_goi_y || canhBao?.tabQuanTriGoiY || '').trim().toUpperCase();
  if (tabGoiY) return tabGoiY;

  const maLuat = String(canhBao?.ma_luat || canhBao?.MA_LUAT || canhBao?.rule_id || '').trim();
  if (maLuat) {
    const match = DANH_MUC_QUY_TAC_NOI_BO.find((item) => khopMaLuatTheoMau(item.ma_luat, maLuat));
    if (match?.tab_id) return match.tab_id;
  }

  return MAP_TAB_QUAN_TRI_THEO_XML[layBangXmlTuCanhBao(canhBao)] || 'LUAT_HANH_CHINH';
};

export const taoMoTaViTriXmlThongKe = ({ phanHe, truongLoi, index }) => {
  const bang = String(phanHe || '').toUpperCase() || 'XML1';
  const truong = String(truongLoi || '').trim();
  const dong = Number.isFinite(Number(index)) && Number(index) >= 0 ? `Dòng ${Number(index) + 1}` : 'Hồ sơ tổng quát';
  return [bang, dong, truong].filter(Boolean).join(' • ');
};

/** Lấy mảng dòng XML2–6 từ hồ sơ (XML1 thường là object — không dùng mảng). */
export const layMangXmlTheoPhanHe = (hoSo = {}, phanHe = '') => {
  const p = String(phanHe || '').trim().toUpperCase();
  if (!p || !p.startsWith('XML')) return null;
  const pLower = p.toLowerCase();
  const raw =
    hoSo?.[p]
    ?? hoSo?.[pLower]
    ?? hoSo?.du_lieu_goc?.[p]
    ?? hoSo?.du_lieu_goc?.[pLower]
    ?? hoSo?.data?.[p]
    ?? hoSo?.data?.[pLower]
    ?? null;
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === 'object') return [raw];
  return null;
};

const chuanHoaTenTruongSoSanh = (s) => String(s || '').toUpperCase().replace(/_/g, '');

/** Giới hạn độ dài để ô Excel và UI vẫn dùng được; nội dung dài vẫn được trích tối đa có thể. */
const GIOI_HAN_KY_TU_MOT_TRUONG_XML = 1200;
const GIOI_HAN_KY_TU_FULLTEXT_TOI_DA = 12000;

/**
 * Fulltext một dòng XML: liệt kê trường=giá trị (bỏ trống). Trường trùng `truongUuTien` (truong_loi) được đánh dấu ★ và xếp trước.
 */
export const taoChuoiFulltextDongXml = (row = {}, truongUuTien = '') => {
  if (!row || typeof row !== 'object' || Array.isArray(row)) return '';
  const uuNorm = chuanHoaTenTruongSoSanh(truongUuTien);
  const keys = Object.keys(row).filter((k) => {
    const k0 = String(k);
    return k0 !== 'id' && !k0.startsWith('_');
  });

  const fmtVal = (v) => {
    if (v === null || v === undefined) return '';
    if (typeof v === 'object') {
      try {
        const j = JSON.stringify(v);
        return j.length > GIOI_HAN_KY_TU_MOT_TRUONG_XML ? `${j.slice(0, GIOI_HAN_KY_TU_MOT_TRUONG_XML)}…` : j;
      } catch {
        return '';
      }
    }
    const s = String(v)
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/\n/g, ' ↵ ')
      .replace(/\s+/g, ' ')
      .trim();
    if (!s) return '';
    return s.length > GIOI_HAN_KY_TU_MOT_TRUONG_XML ? `${s.slice(0, GIOI_HAN_KY_TU_MOT_TRUONG_XML)}…` : s;
  };

  keys.sort((a, b) => {
    const na = chuanHoaTenTruongSoSanh(a);
    const nb = chuanHoaTenTruongSoSanh(b);
    const pa = uuNorm && na === uuNorm ? 0 : 1;
    const pb = uuNorm && nb === uuNorm ? 0 : 1;
    if (pa !== pb) return pa - pb;
    return String(a).localeCompare(String(b), 'vi');
  });

  const parts = [];
  keys.forEach((k) => {
    const val = fmtVal(row[k]);
    if (!val) return;
    const isUu = uuNorm && chuanHoaTenTruongSoSanh(k) === uuNorm;
    const label = isUu ? `★${k}` : k;
    parts.push(`${label}=${val}`);
  });

  let out = parts.join(' | ');
  if (out.length > GIOI_HAN_KY_TU_FULLTEXT_TOI_DA) {
    out = `${out.slice(0, GIOI_HAN_KY_TU_FULLTEXT_TOI_DA)}… [rút gọn: còn nhiều ký tự — mở XML gốc để xem đủ]`;
  }
  return out;
};

/**
 * Trích dòng XML gắn với lỗi — cùng điều kiện với khối fulltext trong `taoViTriXmlBaoCaoDayDuTuLoi`.
 * @returns {{ row: object|null, phanHeBang: string }}
 */
export const layDongXmlLienQuanLoi = (loi = {}, hoSo = {}) => {
  const phanHe = String(
    layGiaTriTheoKhoaKhongPhanBiet(loi, 'phan_he', '')
    || layBangXmlTuCanhBao(loi),
  ).trim().toUpperCase();
  const idxRaw = layGiaTriTheoKhoaKhongPhanBiet(loi, 'index', '');
  const idx = idxRaw === '' || idxRaw === null || idxRaw === undefined ? NaN : Number(idxRaw);
  const mang = layMangXmlTheoPhanHe(hoSo, phanHe);

  if (mang && Number.isFinite(idx) && idx >= 0 && idx < mang.length) {
    return { row: mang[idx] || {}, phanHeBang: phanHe };
  }
  if (phanHe === 'XML1' || (!phanHe && !Number.isFinite(idx))) {
    const x1 = layXml1HoSo(hoSo);
    if (x1 && typeof x1 === 'object' && !Array.isArray(x1) && Object.keys(x1).length) {
      return { row: x1, phanHeBang: phanHe || 'XML1' };
    }
  }
  if (phanHe && phanHe.startsWith('XML') && (!mang || mang.length === 0)) {
    const thuLai = layMangXmlTheoPhanHe(hoSo, phanHe);
    if (thuLai?.length === 1 && Number.isFinite(idx) && (idx < 0 || idx === 0)) {
      return { row: thuLai[0] || {}, phanHeBang: phanHe };
    }
  }
  return { row: null, phanHeBang: phanHe };
};

const NHAN_THEO_ID_NHOM_VI_PHAM = Object.freeze({
  [NHOM_VI_PHAM_IDS.HANH_CHINH]: 'Hành chính',
  [NHOM_VI_PHAM_IDS.DVKT]: 'Dịch vụ kỹ thuật',
  [NHOM_VI_PHAM_IDS.CONG_KHAM]: 'Công khám',
  [NHOM_VI_PHAM_IDS.GIUONG_BENH]: 'Giường bệnh',
  [NHOM_VI_PHAM_IDS.THUOC]: 'Thuốc',
  [NHOM_VI_PHAM_IDS.VTYT]: 'Vật tư y tế',
  [NHOM_VI_PHAM_IDS.NHAN_SU]: 'Nhân sự',
  [NHOM_VI_PHAM_IDS.CHUYEN_VIEN]: 'Chuyển viện',
});

/** XML1 — trường liên quan giấy chuyển / nơi đến đi */
const RX_TRUONG_XML1_CHUYEN_VIEN = /GIAY_CHUYEN|CHUYEN_TUYEN|CHUYEN_VIEN|LY_DO_CT|MA_NOI_DI|MA_NOI_DEN|^NOI_DI|^NOI_DEN|TUYEN|HUONG_TRI/i;

const mapNhomTuTabQuanTri = (tabRaw = '') => {
  const tab = String(tabRaw || '').trim().toUpperCase();
  if (!tab) return null;
  if (tab === 'LUAT_THUOC') return NHOM_VI_PHAM_IDS.THUOC;
  if (tab === 'LUAT_CONG_KHAM') return NHOM_VI_PHAM_IDS.CONG_KHAM;
  if (tab === 'LUAT_GIUONG') return NHOM_VI_PHAM_IDS.GIUONG_BENH;
  if (tab === 'LUAT_NHAN_SU' || tab === 'HAU_PHAU') return NHOM_VI_PHAM_IDS.NHAN_SU;
  if (tab === 'LUAT_CDHA' || tab === 'LUAT_PTTT' || tab === 'LUAT_MAU') return NHOM_VI_PHAM_IDS.DVKT;
  if (tab === 'LUAT_HOP_DONG' || tab === 'LUAT_HANH_CHINH') return NHOM_VI_PHAM_IDS.HANH_CHINH;
  return null;
};

const laDongXml3LaGiuongHeuristic = (row = {}) => {
  if (!row || typeof row !== 'object') return false;
  const ma = String(row.MA_DICH_VU || '').trim().toUpperCase();
  const nhom = chuanHoaTokenThongKeLoi(row.NHOM_DV || '');
  const ten = chuanHoaTokenThongKeLoi(row.TEN_DICH_VU || '');
  return ma.startsWith('19') || nhom.includes('GIUONG') || ten.includes('GIUONG');
};

const laDongXml3LaCongKhamHeuristic = (row = {}) => {
  if (!row || typeof row !== 'object') return false;
  if (laDongXml3LaGiuongHeuristic(row)) return false;
  const nhom = chuanHoaTokenThongKeLoi(row.NHOM_DV || '');
  const ten = chuanHoaTokenThongKeLoi(row.TEN_DICH_VU || '');
  return nhom.includes('KHAM') || ten.includes('KHAM');
};

/**
 * Gắn cảnh báo với nhóm nghiệp vụ (để lọc QPS): ưu tiên bảng XML & tab quản trị, sau đó heuristics dòng XML3.
 */
export const suyRaNhomViPhamTuChiTiet = (hoSo = {}, opts = {}) => {
  const mk = (id) => ({
    id,
    label: NHAN_THEO_ID_NHOM_VI_PHAM[id] || 'Khác',
  });

  const phanHe = String(opts.phan_he || '').trim().toUpperCase();
  const truong = String(opts.truong_loi || '').trim();
  const tab = String(opts.tab_quan_tri_goi_y || '').trim().toUpperCase();
  const idx = opts.index;

  const tabMap = mapNhomTuTabQuanTri(tab);

  if (phanHe === 'XML2') return mk(NHOM_VI_PHAM_IDS.THUOC);
  if (phanHe === 'XML4') return mk(NHOM_VI_PHAM_IDS.VTYT);
  if (phanHe === 'XML5') return mk(NHOM_VI_PHAM_IDS.DVKT);
  if (phanHe === 'XML6') return mk(NHOM_VI_PHAM_IDS.DVKT);

  if (phanHe === 'XML1') {
    if (RX_TRUONG_XML1_CHUYEN_VIEN.test(truong)) return mk(NHOM_VI_PHAM_IDS.CHUYEN_VIEN);
    return mk(NHOM_VI_PHAM_IDS.HANH_CHINH);
  }

  if (phanHe === 'XML3') {
    if (tab === 'LUAT_CONG_KHAM') return mk(NHOM_VI_PHAM_IDS.CONG_KHAM);
    if (tab === 'LUAT_GIUONG') return mk(NHOM_VI_PHAM_IDS.GIUONG_BENH);
    if (tab === 'LUAT_NHAN_SU' || tab === 'HAU_PHAU') return mk(NHOM_VI_PHAM_IDS.NHAN_SU);
    if (tab === 'LUAT_THUOC') return mk(NHOM_VI_PHAM_IDS.THUOC);

    const loiTam = { phan_he: phanHe, truong_loi: truong, index: idx };
    const { row } = layDongXmlLienQuanLoi(loiTam, hoSo);
    if (row && typeof row === 'object') {
      if (laDongXml3LaGiuongHeuristic(row)) return mk(NHOM_VI_PHAM_IDS.GIUONG_BENH);
      if (laDongXml3LaCongKhamHeuristic(row)) return mk(NHOM_VI_PHAM_IDS.CONG_KHAM);
    }
    if (tabMap === NHOM_VI_PHAM_IDS.DVKT || tabMap === NHOM_VI_PHAM_IDS.CONG_KHAM
      || tabMap === NHOM_VI_PHAM_IDS.GIUONG_BENH || tabMap === NHOM_VI_PHAM_IDS.NHAN_SU
      || tabMap === NHOM_VI_PHAM_IDS.THUOC) {
      return mk(tabMap);
    }
    return mk(NHOM_VI_PHAM_IDS.DVKT);
  }

  if (tabMap) return mk(tabMap);
  return mk(NHOM_VI_PHAM_IDS.HANH_CHINH);
};

const layChuoiKhacRongTuDong = (dong = {}, tenTruongs = []) => {
  for (let i = 0; i < tenTruongs.length; i += 1) {
    const k = tenTruongs[i];
    const v = dong[k];
    if (v !== undefined && v !== null && String(v).trim() !== '') return String(v).trim();
  }
  return '';
};

/** MA_BN (mã bệnh nhân / PC) trên XML1 — dùng cho lỗi thuốc XML2 và tra cứu dược lâm sàng. */
export const layMaBenhNhanTuHoSo = (hoSo = {}) => String(
  layXml1HoSo(hoSo)?.MA_BN
  || hoSo?.ma_bn
  || ''
).trim();

/**
 * MA_BAC_SI (CCHN) từ dòng tiền công khám XML3 — không lấy MA_TTDV (thủ trưởng đơn vị) trên XML1.
 * Ưu tiên dòng khớp DM_KHAM (nếu có trên hồ sơ), sau đó heuristic công khám / MA_NHOM khám (1).
 */
export const layMaBacSiTuDongCongKhamXml3 = (hoSo = {}) => {
  const xml3 = layMangXmlTheoPhanHe(hoSo, 'XML3') || [];
  const dmKhamRaw = hoSo?.dm_kham || hoSo?.DM_KHAM || hoSo?.metadata?.DM_KHAM;
  const dmKham = new Set(
    (Array.isArray(dmKhamRaw) ? dmKhamRaw : [])
      .map((x) => String(x || '').trim().toUpperCase())
      .filter(Boolean),
  );

  for (let i = 0; i < xml3.length; i += 1) {
    const row = xml3[i];
    if (!row || typeof row !== 'object') continue;
    const maDv = String(row.MA_DICH_VU || row.MA_DV || '').trim().toUpperCase();
    const nhom = String(row.MA_NHOM || '').replace(/^0+/, '') || String(row.MA_NHOM || '');
    const laCongKham = (dmKham.size > 0 && maDv && dmKham.has(maDv))
      || laDongXml3LaCongKhamHeuristic(row)
      || (nhom === '1' && !laDongXml3LaGiuongHeuristic(row));
    if (!laCongKham) continue;
    const maBs = layChuoiKhacRongTuDong(row, ['MA_BAC_SI', 'MA_BS', 'NGUOI_THUC_HIEN']);
    if (maBs) return maBs;
  }
  return '';
};

/**
 * Ngày y lệnh, ngày kết quả, BS chỉ định, BS thực hiện — theo chuẩn trường QĐ 3176 từng bảng XML.
 * Dùng cho xuất Excel báo cáo vi phạm (tổng quan).
 */
export const layNgayYLenhNgayKqVaBacSiTuLoiHoSo = (loi = {}, hoSo = {}) => {
  const { row, phanHeBang } = layDongXmlLienQuanLoi(loi, hoSo);
  const out = {
    ngayYLenh: '',
    ngayKetQua: '',
    bacSiChiDinh: '',
    bacSiThucHien: '',
  };
  const p = String(phanHeBang || '').trim().toUpperCase() || 'XML';

  if (p === 'XML1') {
    const x1 = (row && typeof row === 'object') ? row : layXml1HoSo(hoSo);
    out.ngayYLenh = layChuoiKhacRongTuDong(x1, ['NGAY_VAO', 'NGAY_VAO_NOI_TRU']);
    out.ngayKetQua = layChuoiKhacRongTuDong(x1, ['NGAY_RA', 'NGAY_TTOAN']);
    out.bacSiChiDinh = layMaBacSiTuDongCongKhamXml3(hoSo)
      || layChuoiKhacRongTuDong(x1, ['MA_BS_KHAM', 'MA_BAC_SI']);
    out.bacSiThucHien = layChuoiKhacRongTuDong(x1, ['MA_BS_DIEU_TRI', 'MA_BAC_SI_DIEU_TRI']);
    return out;
  }

  if (!row || typeof row !== 'object') return out;

  if (p === 'XML2') {
    out.ngayYLenh = layChuoiKhacRongTuDong(row, ['NGAY_YL', 'NGAY_TH_YL']);
    out.ngayKetQua = layChuoiKhacRongTuDong(row, ['NGAY_KQ']);
    out.bacSiChiDinh = layChuoiKhacRongTuDong(row, ['MA_BAC_SI', 'MA_BS']);
  } else if (p === 'XML3') {
    out.ngayYLenh = layChuoiKhacRongTuDong(row, ['NGAY_YL', 'NGAY_TH_YL']);
    out.ngayKetQua = layChuoiKhacRongTuDong(row, ['NGAY_KQ']);
    out.bacSiChiDinh = layChuoiKhacRongTuDong(row, ['MA_BAC_SI', 'MA_BS']);
    out.bacSiThucHien = layChuoiKhacRongTuDong(row, ['NGUOI_THUC_HIEN', 'MA_BS_TH']);
  } else if (p === 'XML4') {
    out.ngayKetQua = layChuoiKhacRongTuDong(row, ['NGAY_KQ']);
    out.ngayYLenh = layChuoiKhacRongTuDong(row, ['NGAY_YL']);
    out.bacSiThucHien = layChuoiKhacRongTuDong(row, ['MA_BS_DOC_KQ', 'MA_BAC_SI', 'MA_BS']);
  } else if (p === 'XML5') {
    out.ngayYLenh = layChuoiKhacRongTuDong(row, ['NGAY_YL']);
    out.ngayKetQua = layChuoiKhacRongTuDong(row, ['NGAY_KQ']);
    out.bacSiChiDinh = layChuoiKhacRongTuDong(row, ['MA_BAC_SI', 'MA_BS']);
  } else if (p === 'XML6') {
    out.ngayYLenh = layChuoiKhacRongTuDong(row, ['NGAY_CD_BD', 'NGAY_VAO']);
    out.ngayKetQua = layChuoiKhacRongTuDong(row, ['NGAY_KQ_XN_TLVR', 'THOI_DIEM_XN_HIV']);
    out.bacSiChiDinh = layChuoiKhacRongTuDong(row, ['MA_BAC_SI', 'MA_BS']);
  } else {
    out.ngayYLenh = layChuoiKhacRongTuDong(row, ['NGAY_YL', 'NGAY_TH_YL']);
    out.ngayKetQua = layChuoiKhacRongTuDong(row, ['NGAY_KQ']);
    out.bacSiChiDinh = layChuoiKhacRongTuDong(row, ['MA_BAC_SI', 'MA_BS']);
    out.bacSiThucHien = layChuoiKhacRongTuDong(row, ['NGUOI_THUC_HIEN']);
  }

  return out;
};

const chuanHoaMaBsChoXuatBaoCao = (val = '') => {
  const s = String(val || '').trim();
  return s === 'KHONG_RO' ? '' : s;
};

/**
 * Cột _XUAT_MA_BS_* / _XUAT_PC cho xuất Excel/XML báo cáo lỗi trên dashboard.
 * BS: `Họ và tên (Số CCHN)` — tra DM nhân sự; nhiều BS cách nhau `;`.
 * @param {Map<string, string>|null|undefined} [mapHoTen] — từ `layMapHoTenNhanSuChoXuatBaoCao`
 */
export const taoMetaXuatBacSiTuChiTietLoi = (detail = {}, loi = {}, hoSo = {}, mapHoTen = null) => {
  const bsTheoDong = layNgayYLenhNgayKqVaBacSiTuLoiHoSo(loi, hoSo);
  const phanHe = String(loi?.phan_he || layBangXmlTuCanhBao(loi) || '').trim().toUpperCase();
  const maBn = String(detail.ma_bn || layMaBenhNhanTuHoSo(hoSo) || '').trim();
  const pc = String(detail.pc || (phanHe === 'XML2' ? maBn : '') || '').trim();
  const dinhDangBsXuat = (val) => {
    const s = chuanHoaMaBsChoXuatBaoCao(val);
    if (!s) return '';
    return mapHoTen && mapHoTen.size > 0
      ? dinhDangChuoiBacSiHoTenKemCchnBaoCao(s, mapHoTen)
      : s;
  };
  return {
    _XUAT_MA_BS_KHAM: dinhDangBsXuat(detail.ma_bac_si),
    _XUAT_MA_BS_DONG_LOI: dinhDangBsXuat(detail.ma_bac_si_dong),
    _XUAT_MA_BS_CHI_DINH: dinhDangBsXuat(bsTheoDong.bacSiChiDinh),
    _XUAT_MA_BS_THUC_HIEN: dinhDangBsXuat(bsTheoDong.bacSiThucHien),
    _XUAT_MA_BN: maBn,
    _XUAT_PC: pc,
  };
};

/**
 * Vị trí cụ thể trong XML: bảng, thứ tự dòng, trường kiểm tra, gợi ý đối tượng dòng (DV/thuốc) nếu truy được từ hồ sơ.
 */
export const taoViTriXmlBaoCaoDayDuTuLoi = (loi = {}, hoSo = {}) => {
  const phanHe = String(
    layGiaTriTheoKhoaKhongPhanBiet(loi, 'phan_he', '')
    || layBangXmlTuCanhBao(loi),
  ).trim().toUpperCase();
  const idxRaw = layGiaTriTheoKhoaKhongPhanBiet(loi, 'index', '');
  const idx = idxRaw === '' || idxRaw === null || idxRaw === undefined ? NaN : Number(idxRaw);
  const truong = String(layGiaTriTheoKhoaKhongPhanBiet(loi, 'truong_loi', '')).trim();
  const chunks = [];
  if (phanHe) chunks.push(`Bảng dữ liệu: ${phanHe}`);
  if (Number.isFinite(idx) && idx >= 0) {
    chunks.push(`Dòng thứ ${idx + 1} trong bảng (index ${idx})`);
  } else if (Number.isFinite(idx) && idx < 0) {
    chunks.push('Phạm vi: toàn hồ sơ / header (không gắn một dòng chi tiết)');
  }
  if (truong) chunks.push(`Trường chênh lệch hoặc bị kiểm tra: ${truong}`);

  const mang = layMangXmlTheoPhanHe(hoSo, phanHe);
  if (mang && Number.isFinite(idx) && idx >= 0 && idx < mang.length) {
    const row = mang[idx] || {};
    const maDv = String(row.MA_DICH_VU || row.MA_DV || '').trim();
    const tenDv = String(row.TEN_DICH_VU || '').trim();
    const maThuoc = String(row.MA_THUOC || '').trim();
    const tenThuoc = String(row.TEN_THUOC || '').trim();
    const ngayYl = String(row.NGAY_YL || row.NGAY_TH_YL || '').trim();
    if (maThuoc || tenThuoc) {
      chunks.push(`Đối tượng dòng: thuốc «${tenThuoc || maThuoc || '—'}» (mã ${maThuoc || '—'})`);
    } else if (maDv || tenDv) {
      chunks.push(`Đối tượng dòng: DVKT «${tenDv || maDv || '—'}» (mã ${maDv || '—'})`);
    }
    if (ngayYl) chunks.push(`Ngày y lệnh / thực hiện: ${ngayYl}`);
  }

  if (phanHe === 'XML1' && (!mang || !Number.isFinite(idx) || idx < 0)) {
    const x1 = layXml1HoSo(hoSo);
    const maKhoa = String(x1?.MA_KHOA || '').trim();
    const maBs = layMaBacSiTuDongCongKhamXml3(hoSo) || String(x1?.MA_BS_KHAM || '').trim();
    if (maKhoa || maBs) {
      chunks.push(`Tham chiếu XML1: khoa ${maKhoa || '—'}, BS khám (MA_BAC_SI công khám XML3) ${maBs || '—'}`);
    }
  }

  const { row: rowFulltext, phanHeBang: phanHeTuDong } = layDongXmlLienQuanLoi(loi, hoSo);
  const fulltextDong = rowFulltext && typeof rowFulltext === 'object'
    ? taoChuoiFulltextDongXml(rowFulltext, truong)
    : '';
  const phanHeFulltext = phanHe || phanHeTuDong || '';

  const phanMoTa = chunks.filter(Boolean).join(' | ');
  const phanFulltext = fulltextDong
    ? `Fulltext nội dung trên XML (${phanHeFulltext || 'bảng liên quan'}): ${fulltextDong}`
    : '';

  if (phanMoTa && phanFulltext) return `${phanMoTa} || ${phanFulltext}`;
  if (phanFulltext) return phanFulltext;
  return phanMoTa
    || 'Vị trí: xem cột «Cảnh báo» — engine không ghi nhận thêm bảng/dòng trong metadata.';
};

/** Mô tả bản chất vi phạm: mức độ + nội dung sai (ưu tiên noi_dung chi tiết nếu có). */
export const taoMoTaBanChatViPhamTuLoi = (loi = {}) => {
  const muc = String(layGiaTriTheoKhoaKhongPhanBiet(loi, 'muc_do', '') || layGiaTriTheoKhoaKhongPhanBiet(loi, 'level', '')).trim();
  const noi = String(layGiaTriTheoKhoaKhongPhanBiet(loi, 'noi_dung', '')).trim();
  const cb = String(layGiaTriTheoKhoaKhongPhanBiet(loi, 'canh_bao', '') || layGiaTriTheoKhoaKhongPhanBiet(loi, 'message', '')).trim();
  const ma = String(layGiaTriTheoKhoaKhongPhanBiet(loi, 'ma_luat', '')).trim();
  const head = muc ? `[${muc}] ` : '';
  if (noi && noi !== 'N/A') return `${head}${noi}`;
  if (cb) return `${head}${cb}`;
  if (ma) return `${head}Phát hiện theo mã quy tắc ${ma}.`;
  return `${head}Vi phạm / cảnh báo theo kết quả kiểm tra (không có mã tách).`;
};

/** Gợi ý khắc phục: luồng giải trình, chi tiết quản trị, hoặc hướng dẫn chỉnh XML/HIS. */
export const taoDeXuatKhacPhucTuLoi = (loi = {}) => {
  const luong = String(layGiaTriTheoKhoaKhongPhanBiet(loi, 'luong_giai_trinh', '')).trim();
  if (luong && luong !== 'N/A') return `Theo luồng giải trình hệ thống: ${luong}`;
  const ct = String(layGiaTriTheoKhoaKhongPhanBiet(loi, 'chi_tiet_canh_bao', '')).trim();
  if (ct) return `Hướng xử lý / giải trình gợi ý: ${ct}`;
  const truong = String(layGiaTriTheoKhoaKhongPhanBiet(loi, 'truong_loi', '')).trim();
  const phanHe = String(layGiaTriTheoKhoaKhongPhanBiet(loi, 'phan_he', '')).trim();
  const ma = String(layGiaTriTheoKhoaKhongPhanBiet(loi, 'ma_luat', '')).trim();
  if (phanHe && truong) {
    return [
      `1) Mở ${phanHe} đúng dòng đã chỉ ra trong «Vị trí trong XML».`,
      `2) Chỉnh giá trị trường «${truong}» cho khớp danh mục BHYT / nội bộ BV hoặc điều chỉnh chỉ định trên HIS.`,
      `3) Xuất lại XML và gửi BHXH sau khi đã nhất quán hồ sơ.`,
      ma ? `4) Tra cứu mã ${ma} trong mục Quy tắc ON/OFF nếu cần tạm tắt quy tắc sau thống nhất nghiệp vụ.` : '',
    ].filter(Boolean).join(' ');
  }
  return 'Đối chiếu cảnh báo với hồ sơ lâm sàng và danh mục được phê duyệt; chỉnh trên HIS rồi tái xuất XML; bổ sung giải trình theo quy định nếu nghiệp vụ hợp lệ nhưng dữ liệu chưa khớp.';
};

export const taoKhoaNoiDungChiTietLoi = (item = {}) => [
  String(item.ma_lk || ''),
  String(item.ma_luat || ''),
  String(item.phan_he || ''),
  String(item.truong_loi || ''),
  String(item.index ?? -1),
  String(item.canh_bao || ''),
].join('|');

export const taoKhoaChiTietLoi = (item = {}) => [
  taoKhoaNoiDungChiTietLoi(item),
  String(item.stt ?? item.lan_phat_sinh ?? item.thu_tu_phat_sinh ?? 0),
].join('|');

export const tinhChiPhiUocTinhTheoLoi = (loi = {}) => {
  const muc = chuanHoaTokenThongKeLoi(loi?.level || loi?.muc_do || loi?.loai_hien_thi);
  if (muc === 'CRITICAL' || muc === 'ERROR' || muc === 'XUAT_TOAN') return 10000000;
  if (muc === 'CAU_TRUC_XML') return 8000000;
  if (muc === 'WARNING' || muc === 'CANH_BAO') return 2000000;
  return 500000;
};

export const taoBanGhiLoiChiTiet = (hoSo = {}, loi = {}, stt = 0) => {
  const daChuan = chuanHoaCanhBaoGiamDinh(loi) || {};
  const maLuat = String(
    layGiaTriTheoKhoaKhongPhanBiet(daChuan, 'ma_luat', '')
    || layGiaTriTheoKhoaKhongPhanBiet(daChuan, 'rule_id', '')
  ).trim();
  const tenQuyTac = String(
    layGiaTriTheoKhoaKhongPhanBiet(daChuan, 'ten_quy_tac', '')
    || layGiaTriTheoKhoaKhongPhanBiet(daChuan, 'message', '')
    || 'Không có tên quy tắc'
  ).trim();
  const canhBao = String(
    layGiaTriTheoKhoaKhongPhanBiet(daChuan, 'canh_bao', '')
    || layGiaTriTheoKhoaKhongPhanBiet(daChuan, 'message', '')
    || layGiaTriTheoKhoaKhongPhanBiet(daChuan, 'noi_dung', '')
    || 'Không có mô tả'
  ).trim();
  const phanHe = String(layGiaTriTheoKhoaKhongPhanBiet(daChuan, 'phan_he', '') || layBangXmlTuCanhBao(daChuan)).trim();
  const truongLoi = String(layGiaTriTheoKhoaKhongPhanBiet(daChuan, 'truong_loi', '')).trim();
  const index = toNumberSafe(layGiaTriTheoKhoaKhongPhanBiet(daChuan, 'index', -1), -1);
  const metaQuyTac = suyRaNamespaceVaNguonQuyTac({
    ...daChuan,
    ma_luat: maLuat || layGiaTriTheoKhoaKhongPhanBiet(daChuan, 'ma_luat', ''),
    phan_he: phanHe,
  });
  const namespaceTuLoi = String(layGiaTriTheoKhoaKhongPhanBiet(daChuan, 'namespace_quy_tac', '')).trim();
  const nguonTuLoi = String(layGiaTriTheoKhoaKhongPhanBiet(daChuan, 'nguon_quy_tac', '')).trim();
  const luongTuLoi = String(layGiaTriTheoKhoaKhongPhanBiet(daChuan, 'luong_giai_trinh', '')).trim();
  const thongTinLoai = suyRaLoaiCanhBaoThongKe({
    ...daChuan,
    ma_luat: maLuat,
    ten_quy_tac: tenQuyTac,
    canh_bao: canhBao,
  });
  const nhomLoiCode = String(layGiaTriTheoKhoaKhongPhanBiet(daChuan, 'type', '') || thongTinLoai.id || 'KHAC').trim();
  const xml1 = layXml1HoSo(hoSo);
  const maLoaiRaw = String(xml1?.MA_LOAI_KCB ?? xml1?.ma_loai_kcb ?? '').trim();
  const maLoaiChuan = chuanHoaMaLoaiKcbThongKe(maLoaiRaw);
  const tenLoai802 = maLoaiChuan ? (TEN_GOI_LOAI_KCB_802[maLoaiChuan] || '') : '';
  const maKhoaRaw = String(xml1?.MA_KHOA ?? '').trim();
  const maKhoaChuan = maKhoaRaw ? maKhoaRaw.toUpperCase() : 'KHONG_RO';
  const nhomCapLoaiKcb = layNhomCapLoaiKcb802(maLoaiChuan || '');
  const nhanNhomCapLoaiKcb = NHAN_NHOM_CAP_LOAI_KCB_802[nhomCapLoaiKcb] || '';
  const tabQuanTri = suyRaTabQuanTriQuyTacTuLoi({ ...daChuan, ma_luat: maLuat, phan_he: phanHe });
  const nhomViPhamMeta = suyRaNhomViPhamTuChiTiet(hoSo, {
    ma_luat: maLuat,
    phan_he: phanHe,
    truong_loi: truongLoi,
    index,
    tab_quan_tri_goi_y: tabQuanTri,
  });
  const bsTheoDong = layNgayYLenhNgayKqVaBacSiTuLoiHoSo(daChuan, hoSo);
  const maBsDongRaw = String(bsTheoDong.bacSiChiDinh || bsTheoDong.bacSiThucHien || '').trim();
  const maBsKhamCongKham = layMaBacSiTuDongCongKhamXml3(hoSo);
  const maBsKhamXml1 = String(xml1?.MA_BS_KHAM || '').trim();
  const ma_bac_si_ho_so = maBsKhamXml1 || maBsKhamCongKham || 'KHONG_RO';
  const ma_bac_si_dong = maBsDongRaw || maBsKhamCongKham || maBsKhamXml1 || 'KHONG_RO';
  const ma_bn = layMaBenhNhanTuHoSo(hoSo) || 'KHONG_RO';
  const pc = phanHe === 'XML2' && ma_bn !== 'KHONG_RO' ? ma_bn : '';
  const { row: rowDongXml } = layDongXmlLienQuanLoi(daChuan, hoSo);
  const ma_thuoc_dong = rowDongXml && typeof rowDongXml === 'object'
    ? String(rowDongXml.MA_THUOC || '').trim()
    : '';
  const ten_thuoc_dong = rowDongXml && typeof rowDongXml === 'object'
    ? String(rowDongXml.TEN_THUOC || '').trim()
    : '';
  const khoaNoiDung = taoKhoaNoiDungChiTietLoi({
    ma_lk: layMaLKHoSo(hoSo),
    ma_luat: maLuat,
    phan_he: phanHe,
    truong_loi: truongLoi,
    index,
    canh_bao: canhBao,
  });

  return {
    stt,
    khoa_noi_dung: khoaNoiDung,
    khoa: taoKhoaChiTietLoi({ ma_lk: layMaLKHoSo(hoSo), ma_luat: maLuat, phan_he: phanHe, truong_loi: truongLoi, index, canh_bao: canhBao, stt }),
    ma_lk: layMaLKHoSo(hoSo),
    ten_bn: layTenBenhNhanHoSo(hoSo),
    ma_loai_kcb: maLoaiRaw || 'KHONG_RO',
    ma_loai_kcb_chuan: maLoaiChuan || 'KHONG_RO',
    ten_loai_kcb_802: tenLoai802,
    nhom_cap_loai_kcb: nhomCapLoaiKcb,
    nhan_nhom_cap_loai_kcb: nhanNhomCapLoaiKcb,
    ma_khoa: maKhoaRaw || 'KHONG_RO',
    ma_khoa_chuan: maKhoaChuan,
    ma_bn,
    pc,
    ma_bac_si: ma_bac_si_ho_so,
    ma_bac_si_dong,
    ma_thuoc_dong,
    ten_thuoc_dong,
    ma_luat: coMaLuatHopLe(maLuat) ? maLuat : '',
    ten_quy_tac: tenQuyTac,
    canh_bao: canhBao,
    phan_he: phanHe,
    truong_loi: truongLoi,
    index,
    namespace_quy_tac: namespaceTuLoi || metaQuyTac.namespace_quy_tac || '',
    nguon_quy_tac: nguonTuLoi || metaQuyTac.nguon_quy_tac || '',
    luong_giai_trinh: luongTuLoi || metaQuyTac.luong_giai_trinh || '',
    co_so_phap_ly: String(layGiaTriTheoKhoaKhongPhanBiet(daChuan, 'co_so_phap_ly', '')).trim(),
    dieu_kien: String(layGiaTriTheoKhoaKhongPhanBiet(daChuan, 'dieu_kien', '')).trim(),
    tab_quan_tri_goi_y: tabQuanTri,
    nhom_vi_pham: nhomViPhamMeta.id,
    nhan_nhom_vi_pham: nhomViPhamMeta.label,
    loai_hien_thi: thongTinLoai.id,
    nhan_loai_hien_thi: thongTinLoai.label,
    muc_uu_tien: thongTinLoai.priority,
    nhom_loi_code: nhomLoiCode,
    level_goc: String(layGiaTriTheoKhoaKhongPhanBiet(daChuan, 'level', '') || layGiaTriTheoKhoaKhongPhanBiet(daChuan, 'muc_do', '')).trim(),
    vi_tri_xml: taoMoTaViTriXmlThongKe({ phanHe, truongLoi, index }),
    chi_phi_uoc_tinh: tinhChiPhiUocTinhTheoLoi({ ...daChuan, loai_hien_thi: thongTinLoai.id }),
    doi_tuong_goc: daChuan,
    de_hien_thi: (() => {
      const prio = Number(thongTinLoai.priority);
      const lvRaw = String(
        layGiaTriTheoKhoaKhongPhanBiet(daChuan, 'level', '')
          || layGiaTriTheoKhoaKhongPhanBiet(daChuan, 'muc_do', ''),
      ).toUpperCase();
      let cap_do_uu_tien_hien_thi = 0;
      if (Number.isFinite(prio) && prio <= 2) cap_do_uu_tien_hien_thi = 1;
      if (Number.isFinite(prio) && prio <= 1) cap_do_uu_tien_hien_thi = 2;
      if (
        lvRaw.includes('ERROR')
        || lvRaw.includes('CRITICAL')
        || String(thongTinLoai.id || '').toUpperCase() === 'XUAT_TOAN'
      ) {
        cap_do_uu_tien_hien_thi = 3;
      }
      let icon_goi_y = 'information-outline';
      if (cap_do_uu_tien_hien_thi >= 3) icon_goi_y = 'alert-circle-outline';
      else if (cap_do_uu_tien_hien_thi >= 2) icon_goi_y = 'alert-outline';
      return {
        cap_do_uu_tien_hien_thi,
        icon_goi_y,
        nhom_mau_sac: cap_do_uu_tien_hien_thi >= 3 ? 'canh_bao' : 'binh_thuong',
      };
    })(),
  };
};

export const phangHoaDanhSachLoiChiTiet = (danhSachHoSo = []) => {
  const ketQua = [];

  (Array.isArray(danhSachHoSo) ? danhSachHoSo : []).forEach((hoSo) => {
    layDanhSachLoiHoSo(hoSo).forEach((loi, idx) => {
      ketQua.push(taoBanGhiLoiChiTiet(hoSo, loi, idx + 1));
    });
  });

  return ketQua.sort((a, b) => {
    if (a.muc_uu_tien !== b.muc_uu_tien) return a.muc_uu_tien - b.muc_uu_tien;
    const maLKDiff = String(a.ma_lk || '').localeCompare(String(b.ma_lk || ''), 'vi');
    if (maLKDiff !== 0) return maLKDiff;
    const maLuatDiff = String(a.ma_luat || a.ten_quy_tac || '').localeCompare(String(b.ma_luat || b.ten_quy_tac || ''), 'vi');
    if (maLuatDiff !== 0) return maLuatDiff;
    return (Number(a.index) || -1) - (Number(b.index) || -1);
  });
};

export const tongHopQuyTacTuDanhSachChiTiet = (danhSachChiTiet = []) => {
  const dictLoi = {};

  (Array.isArray(danhSachChiTiet) ? danhSachChiTiet : []).forEach((chiTiet) => {
    const key = chiTiet.ma_luat || chiTiet.canh_bao || chiTiet.khoa;
    if (!dictLoi[key]) {
      dictLoi[key] = {
        khoa: key,
        ma_luat: chiTiet.ma_luat || 'N/A',
        ten_quy_tac: chiTiet.ten_quy_tac,
        dieu_kien: chiTiet.dieu_kien || 'N/A',
        canh_bao: chiTiet.canh_bao,
        namespace_quy_tac: chiTiet.namespace_quy_tac || '(chưa xác định)',
        nguon_quy_tac: chiTiet.nguon_quy_tac || '(chưa xác định)',
        luong_giai_trinh: chiTiet.luong_giai_trinh || 'N/A',
        co_so_phap_ly: chiTiet.co_so_phap_ly || 'N/A',
        loai_hien_thi: chiTiet.loai_hien_thi,
        nhan_loai_hien_thi: chiTiet.nhan_loai_hien_thi,
        muc_uu_tien: chiTiet.muc_uu_tien,
        so_ho_so: 0,
        sl: 0,
        chi_phi: 0,
        chi_tiet_phat_sinh: [],
        _tapMaLK: new Set(),
      };
    }

    const item = dictLoi[key];
    if (chiTiet.muc_uu_tien < item.muc_uu_tien) {
      item.loai_hien_thi = chiTiet.loai_hien_thi;
      item.nhan_loai_hien_thi = chiTiet.nhan_loai_hien_thi;
      item.muc_uu_tien = chiTiet.muc_uu_tien;
    }
    if (chiTiet.ma_lk && !item._tapMaLK.has(chiTiet.ma_lk)) {
      item._tapMaLK.add(chiTiet.ma_lk);
      item.so_ho_so += 1;
    }
    item.chi_tiet_phat_sinh.push(chiTiet);
    item.sl += 1;
    item.chi_phi += toNumberSafe(chiTiet.chi_phi_uoc_tinh, 0);
  });

  return Object.values(dictLoi)
    .map((item) => {
      const sapXepChiTiet = [...item.chi_tiet_phat_sinh].sort((a, b) => {
        const maLKDiff = String(a.ma_lk || '').localeCompare(String(b.ma_lk || ''), 'vi');
        if (maLKDiff !== 0) return maLKDiff;
        return (Number(a.index) || -1) - (Number(b.index) || -1);
      });
      return {
        ...item,
        chi_tiet_phat_sinh: sapXepChiTiet,
        soHoSoAnhHuong: item.so_ho_so,
        tongLoi: item.sl,
        rule: item.ma_luat || 'N/A',
        ten: item.ten_quy_tac || item.canh_bao,
        type: item.loai_hien_thi,
      };
    })
    .sort((a, b) => {
      if (a.muc_uu_tien !== b.muc_uu_tien) return a.muc_uu_tien - b.muc_uu_tien;
      if (b.sl !== a.sl) return b.sl - a.sl;
      return String(a.ma_luat || a.ten_quy_tac || '').localeCompare(String(b.ma_luat || b.ten_quy_tac || ''), 'vi');
    })
    .map((item) => {
      const clone = { ...item };
      delete clone._tapMaLK;
      return clone;
    });
};

export const locDanhSachLoiChiTiet = (danhSachChiTiet = [], boLoc = {}) => {
  const tuKhoa = chuanHoaTokenThongKeLoi(boLoc?.tuKhoa || '');
  const loaiHienThi = String(boLoc?.loaiHienThi || 'TAT_CA').trim();
  const nhomLoiCode = String(boLoc?.nhomLoiCode || '').trim();
  const nhomViPhamLoc = String(boLoc?.nhomViPham || NHOM_VI_PHAM_TAT_CA).trim();
  const nhomCapLoaiKcbLoc = String(boLoc?.nhomCapLoaiKcb802 ?? NHOM_VI_PHAM_TAT_CA).trim();
  const maKhoaLoc = String(boLoc?.maKhoa ?? NHOM_VI_PHAM_TAT_CA).trim();
  const boLocIcd10 = String(boLoc?.boLocIcd10 ?? '').trim();

  return (Array.isArray(danhSachChiTiet) ? danhSachChiTiet : []).filter((item) => {
    if (loaiHienThi !== 'TAT_CA' && item.loai_hien_thi !== loaiHienThi) return false;
    if (nhomLoiCode && item.nhom_loi_code !== nhomLoiCode) return false;
    if (nhomViPhamLoc !== NHOM_VI_PHAM_TAT_CA && item.nhom_vi_pham !== nhomViPhamLoc) return false;
    if (nhomCapLoaiKcbLoc !== NHOM_VI_PHAM_TAT_CA) {
      const bucket = item.nhom_cap_loai_kcb || layNhomCapLoaiKcb802(item.ma_loai_kcb_chuan);
      if (bucket !== nhomCapLoaiKcbLoc) return false;
    }
    if (maKhoaLoc !== NHOM_VI_PHAM_TAT_CA) {
      const mk = item.ma_khoa_chuan || 'KHONG_RO';
      if (mk !== maKhoaLoc) return false;
    }
    if (boLocIcd10 && !loiKhopBoLocIcd10ViPham(item, boLocIcd10)) return false;
    if (!tuKhoa) return true;

    const noiDungTim = chuanHoaTokenThongKeLoi([
      item.ma_lk,
      item.ten_bn,
      item.ma_bn,
      item.pc,
      item.ma_luat,
      item.ten_quy_tac,
      item.canh_bao,
      item.phan_he,
      item.truong_loi,
      item.nhom_loi_code,
      item.nhom_vi_pham,
      item.nhan_nhom_vi_pham,
      item.ma_loai_kcb_chuan,
      item.ma_loai_kcb,
      item.ten_loai_kcb_802,
      item.nhom_cap_loai_kcb,
      item.nhan_nhom_cap_loai_kcb,
      item.ma_khoa,
      item.ma_khoa_chuan,
      item.ma_bac_si,
      item.ma_bac_si_dong,
    ].filter(Boolean).join(' | '));
    return noiDungTim.includes(tuKhoa);
  });
};