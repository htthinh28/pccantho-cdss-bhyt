/**
 * Chuẩn hóa khóa drill khoa — đồng bộ ma trận "(trống)", Top khoa "(Chưa ghi khoa)", fact XML.
 */

const boDau = (s) => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

const MA_KHOA_RONG_BO_DAU = new Set([
  '',
  '(trong)',
  '(trống)',
  '(chua ghi khoa)',
  '(chưa ghi khoa)',
  'khong ro',
  'khong_ro',
]);

export const chuanHoaMaKhoaBaoCao = (raw) => {
  const t = String(raw ?? '').trim();
  if (!t) return '';
  const u = boDau(t);
  if (MA_KHOA_RONG_BO_DAU.has(u)) return '';
  return t;
};

export const khoaDrillKhop = (a, b) => chuanHoaMaKhoaBaoCao(a) === chuanHoaMaKhoaBaoCao(b);
