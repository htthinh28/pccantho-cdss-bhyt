/**
 * Danh mục công khám (DM_KHAM) — chỉ mã trong catalog BV, không heuristic DVKT.
 * Nguồn: seed `du_lieu_dm_cong_kham_seed.jsx` + storage `DANH_MUC_CONG_KHAM_BV`.
 */
import { DM_CONG_KHAM_SEED } from './du_lieu_dm_cong_kham_seed';

const normMa = (v) => String(v ?? '').trim().toUpperCase().replace(/\s/g, '');

export const trichMaTuHangDmCongKham = (row) => {
  if (!row || typeof row !== 'object') return normMa(row);
  return normMa(
    row.MA_DICH_VU
    || row['MÃ DỊCH VỤ']
    || row['MA DICH VU']
    || row.MA_DV
    || row['MÃ KHÁM']
    || row.MA_KHAM
    || row.MA
    || row.ma,
  );
};

/** Gộp nhiều nguồn → mảng hàng DM_KHAM (dedupe theo MA_DICH_VU). */
export const taoDmKhamRowsTuNguon = (...sources) => {
  const seen = new Set();
  const out = [];
  sources.flat().forEach((row) => {
    const ma = trichMaTuHangDmCongKham(row);
    if (!ma || seen.has(ma)) return;
    seen.add(ma);
    out.push({
      MA_DICH_VU: ma,
      TEN_DICH_VU: typeof row === 'object' && row
        ? String(row.TEN_DICH_VU || row['TÊN DỊCH VỤ'] || row.TEN_DVKT_GIA || '').trim()
        : '',
    });
  });
  return out;
};

export const taoTapMaCongKham = (dmRows = []) => {
  const s = new Set();
  (Array.isArray(dmRows) ? dmRows : []).forEach((row) => {
    const ma = trichMaTuHangDmCongKham(row);
    if (ma) s.add(ma);
  });
  return s;
};

/** DM_KHAM runtime: seed repo + danh mục import trên máy (nếu có). */
export const buildDmKhamHeThong = (congKhamBvRows = []) => (
  taoDmKhamRowsTuNguon(DM_CONG_KHAM_SEED, congKhamBvRows)
);

/** Tiền tố nhóm chuyên khoa XX.YY trong MA_DICH_VU (vd. 02.03.0135 → 02.03). */
export const layTienToNhomCongKham = (maDv) => {
  const ma = normMa(maDv);
  if (!ma) return '';
  const m = ma.match(/^(\d{2}\.\d{2})/);
  return m ? m[1] : '';
};

/**
 * CK_59: chỉ dòng có MA_DICH_VU thuộc DM_KHAM.
 * Khớp trùng mã hoặc tiền tố nhóm (catalog XX.YY ↔ XML3 XX.YY.ZZZZ).
 */
export const laMaThuocDmCongKhamCk59 = (maDv, dmKhamSet) => {
  if (!(dmKhamSet instanceof Set) || dmKhamSet.size === 0) return false;
  const ma = normMa(maDv);
  if (!ma) return false;
  if (dmKhamSet.has(ma)) return true;
  const prefix = layTienToNhomCongKham(ma);
  return prefix ? dmKhamSet.has(prefix) : false;
};
