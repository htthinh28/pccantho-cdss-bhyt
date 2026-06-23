#!/usr/bin/env node
/**
 * Sinh ma_nguon/tien_ich/du_lieu_dm_cong_kham_seed.jsx từ Excel danh mục công khám BV.
 *
 * Chạy:
 *   npm run catalog:dm-cong-kham -- "C:/Users/admin/Downloads/Danh muc dich vu kham (1).xls"
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import XLSX from 'xlsx';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const OUT_FILE = path.join(REPO_ROOT, 'ma_nguon', 'tien_ich', 'du_lieu_dm_cong_kham_seed.jsx');

const argPath = process.argv.slice(2).find((a) => !a.startsWith('-'));
if (!argPath) {
  console.error('Thiếu đường dẫn Excel. Ví dụ:\n  npm run catalog:dm-cong-kham -- "Danh muc dich vu kham.xls"');
  process.exit(1);
}

const abs = path.resolve(argPath);
if (!fs.existsSync(abs)) {
  console.error('Không tìm thấy file:', abs);
  process.exit(1);
}

const normKey = (k) => String(k || '').trim().toLowerCase()
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .replace(/\s+/g, '_');

const pick = (row, ...candidates) => {
  const map = new Map();
  Object.keys(row || {}).forEach((k) => map.set(normKey(k), row[k]));
  for (const c of candidates) {
    const v = map.get(normKey(c));
    if (v !== undefined && v !== null && String(v).trim() !== '') return String(v).trim();
  }
  return '';
};

const wb = XLSX.readFile(abs);
const sheet = wb.Sheets[wb.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

const seen = new Set();
const out = [];
rows.forEach((row, i) => {
  const ma = pick(row, 'MA_DICH_VU', 'MÃ DỊCH VỤ', 'MA DV', 'MÃ DV', 'MA_KHAM', 'MÃ KHÁM', 'MA');
  if (!ma) return;
  const key = ma.toUpperCase().replace(/\s/g, '');
  if (seen.has(key)) return;
  seen.add(key);
  out.push({
    STT: out.length + 1,
    MA_DICH_VU: ma,
    TEN_DICH_VU: pick(row, 'TEN_DICH_VU', 'TÊN DỊCH VỤ', 'TEN DVKT', 'TÊN DVKT', 'TEN'),
  });
});

if (!out.length) {
  console.error('Không trích được mã nào. Cột mẫu:', Object.keys(rows[0] || {}));
  process.exit(1);
}

const ver = `2026-06-23-${out.length}ma`;
const body = `/**
 * Seed danh mục công khám BV (DM_KHAM) — chỉ mã công khám, không DVKT khác.
 * Nguồn: ${path.basename(abs)}
 * Sinh: npm run catalog:dm-cong-kham
 */
export const PHIEN_BAN_DM_CONG_KHAM = ${JSON.stringify(ver)};

export const COT_DM_CONG_KHAM = ${JSON.stringify(['STT', 'MA_DICH_VU', 'TEN_DICH_VU'], null, 2)};

export const DM_CONG_KHAM_SEED = ${JSON.stringify(out, null, 2)};
`;

fs.writeFileSync(OUT_FILE, body, 'utf8');
console.log(`Đã ghi ${out.length} mã công khám → ${path.relative(REPO_ROOT, OUT_FILE)}`);
