/**
 * Xóa các dòng quy tắc CHUYEN_DE có DIEU_KIEN giống hệt bản id cao hơn (đã tính bởi dedupe_chuyen_de_dieukien_plan.mjs).
 * Chạy: node scripts/dedupe_chuyen_de_apply.mjs
 */
import fs from 'fs';

const SRC = new URL('../ma_nguon/tien_ich/luat_giam_dinh_chuyen_de_hardcoded.jsx', import.meta.url);
const s0 = fs.readFileSync(SRC, 'utf8');

const toDelete = new Set([
  'CHUYEN_DE-004',
  'CHUYEN_DE-006',
  'CHUYEN_DE-007',
  'CHUYEN_DE-008',
  'CHUYEN_DE-009',
  'CHUYEN_DE-010',
  'CHUYEN_DE-013',
  'CHUYEN_DE-017',
  'CHUYEN_DE-018',
  'CHUYEN_DE-019',
  'CHUYEN_DE-021',
  'CHUYEN_DE-027',
  'CHUYEN_DE-028',
  'CHUYEN_DE-029',
  'CHUYEN_DE-030',
  'CHUYEN_DE-032',
  'CHUYEN_DE-033',
  'CHUYEN_DE-036',
  'CHUYEN_DE-037',
  'CHUYEN_DE-043',
  'CHUYEN_DE-044',
  'CHUYEN_DE-045',
  'CHUYEN_DE-046',
  'CHUYEN_DE-048',
  'CHUYEN_DE-049',
  'CHUYEN_DE-050',
  'CHUYEN_DE-051',
  'CHUYEN_DE-057',
  'CHUYEN_DE-058',
  'CHUYEN_DE-061',
  'CHUYEN_DE-065',
  'CHUYEN_DE-067',
  'CHUYEN_DE-068',
  'CHUYEN_DE-072',
  'CHUYEN_DE-073',
  'CHUYEN_DE-080',
  'CHUYEN_DE-085',
  'CHUYEN_DE-089',
  'CHUYEN_DE-091',
  'CHUYEN_DE-092',
  'CHUYEN_DE-095',
  'CHUYEN_DE-096',
  'CHUYEN_DE-097',
  'CHUYEN_DE-098',
  'CHUYEN_DE-119',
  'CHUYEN_DE-124',
  'CHUYEN_DE-131',
  'CHUYEN_DE-140',
  'CHUYEN_DE-160',
  'CHUYEN_DE-181',
  'CHUYEN_DE-184',
  'CHUYEN_DE-199',
  'CHUYEN_DE-206',
  'CHUYEN_DE-227',
  'CHUYEN_DE-248',
  'CHUYEN_DE-249',
  'CHUYEN_DE-271',
  'CHUYEN_DE-277',
  'CHUYEN_DE-296',
  'CHUYEN_DE-303',
  'CHUYEN_DE-330',
  'CHUYEN_DE-359',
  'CHUYEN_DE-363',
  'CHUYEN_DE-364',
  'CHUYEN_DE-381',
  'CHUYEN_DE-390',
  'CHUYEN_DE-451',
  'CHUYEN_DE-462',
  // Trùng logic với quy tắc khác (không cùng chuỗi DIEU_KIEN)
  'CHUYEN_DE-644',
  'CHUYEN_DE-108',
]);

let s = s0;
for (const id of toDelete) {
  const esc = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`\\r?\\n  \\{ id: '${esc}',[^\\r\\n]+\\r?\\n`, 'g');
  const before = s;
  s = s.replace(re, '\n');
  if (s === before) {
    console.error('Không tìm thấy dòng để xóa:', id);
    process.exit(1);
  }
}

const kept = (s.match(/\{ id: 'CHUYEN_DE-\d+'/g) || []).length;
const ver = `2026-04-19-chuyen-de-dedupe-${kept}-xml130`;
s = s.replace(
  /export const CHUYEN_DE_XML130_CONVERSION_VERSION = '[^']*';/,
  `export const CHUYEN_DE_XML130_CONVERSION_VERSION = '${ver}';`,
);

fs.writeFileSync(SRC, s, 'utf8');
console.log('Đã ghi', SRC.pathname || SRC);
console.log('Số quy tắc còn lại (ước lượng):', kept);
console.log('CHUYEN_DE_XML130_CONVERSION_VERSION =', ver);
