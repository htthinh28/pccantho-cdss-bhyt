#!/usr/bin/env node
/**
 * QA: bộ lọc danh mục ICD10 kê đơn >30 ngày — Phụ lục VII TT 26/2025 (252 bệnh).
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const seedPath = join(root, 'ma_nguon/thanh_phan/icd10_ke_don_tren_30_ngay.jsx');
const seedSrc = readFileSync(seedPath, 'utf8');
const seedMatch = seedSrc.match(/export const DANH_MUC_ICD10_KE_DON_TREN_30_NGAY = (\[[\s\S]*?\n\]);/);
assert.ok(seedMatch, 'parse seed DANH_MUC_ICD10_KE_DON_TREN_30_NGAY');
const rows = Function(`"use strict"; return (${seedMatch[1]});`)();

const layMaTT = (row) => String(row['Mã TT'] || '').trim();
const layMaIcd = (row) => String(row['Mã bệnh theo ICD 10'] || '').trim();
const nhom = (row) => Number(layMaTT(row).split('.')[0]) || 0;
const laMaKhoang = (ma) => /đến|den|trừ|tru|\(|\)|[,;]|–|—|-\s*[A-Z0-9]/i.test(ma)
  || ((ma.toUpperCase().match(/[A-Z]\d{2}(?:\.\d{1,4})?/g) || []).length > 1);

assert.equal(rows.length, 252, 'expected 252 diseases per TT26 PL VII');

const counts = { all: rows.length, khoang: 0, don: 0 };
const byCk = {};
rows.forEach((row) => {
  const ck = nhom(row);
  byCk[ck] = (byCk[ck] || 0) + 1;
  const ma = layMaIcd(row);
  if (laMaKhoang(ma)) counts.khoang += 1;
  else counts.don += 1;
});

assert.equal(counts.khoang + counts.don, 252);
assert.equal(Object.keys(byCk).length, 16, 'expected 16 specialty chapters');
assert.equal(byCk[1], 2);
assert.equal(byCk[5], 30);
assert.ok(counts.khoang >= 10, 'range/complex ICD rows expected');

console.log('qa_icd10_tt26_ke_don_loc: OK', { total: 252, chapters: 16, maKhoang: counts.khoang, maDon: counts.don });
