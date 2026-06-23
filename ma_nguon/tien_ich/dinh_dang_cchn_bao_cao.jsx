/**
 * Định dạng mã chứng chỉ hành nghề (CCHN/GPHN) trong báo cáo: `mã (Họ và tên)` khi tra được từ DM nhân sự.
 */
import { COT_DANH_MUC_NHAN_SU, DANH_MUC_NHAN_SU } from '../thanh_phan/nhan_su';
import { taiBoDuLieuDanhMuc } from './luu_tru_danh_muc';

const KHOA_DINH_DANH_NS = ['MACCHN', 'MA_BHXH', 'MA_BAC_SI', 'MA_NV', 'ID', 'SO_CCCD', 'SO_DINH_DANH'];

/**
 * @param {object[]} rows — dòng DANH_MUC_NHAN_SU
 * @returns {Map<string, string>} key: mã (uppercase) → họ tên
 */
export const taoMapHoTenTheoMaNhanSu = (rows = []) => {
  const map = new Map();
  for (const row of rows) {
    const hoTen = String(row?.HO_TEN ?? row?.TEN_BAC_SI ?? '').trim();
    if (!hoTen) continue;
    for (const k of KHOA_DINH_DANH_NS) {
      const v = String(row?.[k] ?? '').trim();
      if (v) map.set(v.toUpperCase(), hoTen);
    }
  }
  return map;
};

export const tachMaVaPhanTrongNgoac = (raw) => {
  const s = String(raw ?? '').trim();
  const m = s.match(/^(.*?)\s*\(([^)]*)\)\s*$/);
  if (m) return { maGoc: m[1].trim(), trongNgoac: m[2].trim() };
  return { maGoc: s, trongNgoac: '' };
};

/** Heuristic: chuỗi giống số chứng chỉ (thường có `/` và hậu tố GPHN/CCHN hoặc mẫu số/chữ). */
export const laChuoiGiongMaChungChiHanhNghe = (s) => {
  const t = String(s ?? '').trim();
  if (!t || t === 'N/A' || t === 'KHONG_RO') return false;
  if (!t.includes('/')) return false;
  if (/\b(CCHN|GPHN)\b/i.test(t)) return true;
  return /^[0-9A-Za-z._-]+\/[0-9A-Za-z_.\-]+$/.test(t);
};

/**
 * @param {string} raw — mã hoặc đã có dạng `mã (tên)`
 * @param {Map<string, string>|null|undefined} mapHoTen — từ `taoMapHoTenTheoMaNhanSu`
 */
export const boSungHoTenChoMaBacSiBaoCao = (raw, mapHoTen) => {
  if (raw == null) return '';
  const s0 = String(raw).trim();
  if (!s0 || s0 === 'N/A' || s0 === 'KHONG_RO') return s0;

  const { maGoc } = tachMaVaPhanTrongNgoac(s0);
  const hoTen = mapHoTen?.get(maGoc.toUpperCase());
  if (hoTen) return `${maGoc} (${hoTen})`;
  if (laChuoiGiongMaChungChiHanhNghe(maGoc)) return maGoc;
  return s0;
};

/** Tách chuỗi nhiều BS (phân cách `;`). */
export const tachCacTokenBacSiTrongChuoi = (raw) => String(raw ?? '')
  .split(';')
  .map((s) => s.trim())
  .filter(Boolean);

/**
 * Một BS: `Họ và tên (Số chứng chỉ hành nghề)` — chuẩn báo cáo lỗi XML1/XML2/XML3.
 * Hỗ trợ chuỗi cũ dạng `CCHN (Họ tên)` và đã đúng `Họ tên (CCHN)`.
 */
export const dinhDangMotBacSiHoTenKemCchnBaoCao = (token, mapHoTen) => {
  if (token == null) return '';
  const s0 = String(token).trim();
  if (!s0 || s0 === 'N/A' || s0 === 'KHONG_RO') return '';

  const { maGoc, trongNgoac } = tachMaVaPhanTrongNgoac(s0);
  if (trongNgoac && laChuoiGiongMaChungChiHanhNghe(trongNgoac) && !laChuoiGiongMaChungChiHanhNghe(maGoc)) {
    return s0;
  }
  if (trongNgoac && laChuoiGiongMaChungChiHanhNghe(maGoc)) {
    return `${trongNgoac} (${maGoc})`;
  }

  const cchn = laChuoiGiongMaChungChiHanhNghe(maGoc) ? maGoc : maGoc;
  const hoTen = mapHoTen?.get(cchn.toUpperCase()) || mapHoTen?.get(maGoc.toUpperCase());
  if (hoTen) return `${hoTen} (${cchn})`;
  if (laChuoiGiongMaChungChiHanhNghe(cchn)) return cchn;
  return s0;
};

/** Nhiều BS: `Họ tên (CCHN); Họ tên (CCHN); …` */
export const dinhDangChuoiBacSiHoTenKemCchnBaoCao = (raw, mapHoTen) => {
  if (raw == null) return '';
  const s0 = String(raw).trim();
  if (!s0 || s0 === 'N/A' || s0 === 'KHONG_RO') return '';
  return tachCacTokenBacSiTrongChuoi(s0)
    .map((t) => dinhDangMotBacSiHoTenKemCchnBaoCao(t, mapHoTen))
    .filter(Boolean)
    .join('; ');
};

export const taiMapHoTenNhanSuBaoCao = async () => {
  const { data } = await taiBoDuLieuDanhMuc({
    dataKey: 'DANH_MUC_NHAN_SU',
    columnsKey: 'COLS_DANH_MUC_NHAN_SU',
    fallbackColumns: COT_DANH_MUC_NHAN_SU,
  });
  return taoMapHoTenTheoMaNhanSu(data);
};

/** Map họ tên nhân sự cho xuất báo cáo — ưu tiên DM đã lưu, fallback bundle seed. */
export const layMapHoTenNhanSuChoXuatBaoCao = async () => {
  try {
    const map = await taiMapHoTenNhanSuBaoCao();
    if (map && map.size > 0) return map;
  } catch {
    /* fallback seed */
  }
  return taoMapHoTenTheoMaNhanSu(DANH_MUC_NHAN_SU);
};

const KHOA_ANH_XA_BS_SANG_CCHN = ['MA_BHXH', 'MA_BAC_SI', 'MA_NV', 'ID', 'SO_CCCD', 'SO_DINH_DANH'];

/**
 * Map mã định danh nhân sự (XML / nội bộ) → số chứng chỉ hành nghề (MACCHN trên DM).
 * Dùng báo cáo gom theo CCHN; khớp phụ thuộc cách BV mã hoá MA_BS vs MA_BHXH.
 */
export const taoMapMaNhanSuSangMacchn = (rows = []) => {
  const m = new Map();
  for (const row of Array.isArray(rows) ? rows : []) {
    const cchn = String(row?.MACCHN ?? '').trim();
    if (!cchn) continue;
    for (const k of KHOA_ANH_XA_BS_SANG_CCHN) {
      const v = String(row?.[k] ?? '').trim();
      if (v) m.set(v.toUpperCase(), cchn);
    }
  }
  return m;
};
