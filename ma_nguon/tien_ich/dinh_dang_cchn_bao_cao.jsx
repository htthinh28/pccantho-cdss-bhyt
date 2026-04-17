/**
 * Định dạng mã chứng chỉ hành nghề (CCHN/GPHN) trong báo cáo: `mã (Họ và tên)` khi tra được từ DM nhân sự.
 */
import { COT_DANH_MUC_NHAN_SU } from '../thanh_phan/nhan_su';
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

export const taiMapHoTenNhanSuBaoCao = async () => {
  const { data } = await taiBoDuLieuDanhMuc({
    dataKey: 'DANH_MUC_NHAN_SU',
    columnsKey: 'COLS_DANH_MUC_NHAN_SU',
    fallbackColumns: COT_DANH_MUC_NHAN_SU,
  });
  return taoMapHoTenTheoMaNhanSu(data);
};
