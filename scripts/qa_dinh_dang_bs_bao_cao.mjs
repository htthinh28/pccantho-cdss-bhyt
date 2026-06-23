#!/usr/bin/env node
/** Smoke: định dạng BS báo cáo `Họ tên (Số CCHN)` — mirror dinh_dang_cchn_bao_cao.jsx */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.join(import.meta.dirname, '..');
const nhanSuRaw = fs.readFileSync(path.join(ROOT, 'ma_nguon/thanh_phan/nhan_su.jsx'), 'utf8');
const hoTen003942 = nhanSuRaw.match(/"HO_TEN":\s*"([^"]+)"[\s\S]{0,400}?"MACCHN":\s*"003942\/CT-CCHN"/);
const hoTen007014 = nhanSuRaw.match(/"HO_TEN":\s*"([^"]+)"[\s\S]{0,400}?"MACCHN":\s*"007014\/CT-CCHN"/);
assert.ok(hoTen003942, 'seed 003942');
assert.ok(hoTen007014, 'seed 007014');

const map = new Map([
  ['003942/CT-CCHN', hoTen003942[1]],
  ['007014/CT-CCHN', hoTen007014[1]],
]);

const laChuoiGiongMaChungChiHanhNghe = (s) => {
  const t = String(s ?? '').trim();
  if (!t || !t.includes('/')) return false;
  if (/\b(CCHN|GPHN)\b/i.test(t)) return true;
  return /^[0-9A-Za-z._-]+\/[0-9A-Za-z_.\-]+$/.test(t);
};

const tachMaVaPhanTrongNgoac = (raw) => {
  const s = String(raw ?? '').trim();
  const m = s.match(/^(.*?)\s*\(([^)]*)\)\s*$/);
  if (m) return { maGoc: m[1].trim(), trongNgoac: m[2].trim() };
  return { maGoc: s, trongNgoac: '' };
};

const dinhDangMot = (token, mapHoTen) => {
  const s0 = String(token).trim();
  const { maGoc, trongNgoac } = tachMaVaPhanTrongNgoac(s0);
  if (trongNgoac && laChuoiGiongMaChungChiHanhNghe(trongNgoac) && !laChuoiGiongMaChungChiHanhNghe(maGoc)) return s0;
  if (trongNgoac && laChuoiGiongMaChungChiHanhNghe(maGoc)) return `${trongNgoac} (${maGoc})`;
  const cchn = maGoc;
  const hoTen = mapHoTen.get(cchn.toUpperCase());
  if (hoTen) return `${hoTen} (${cchn})`;
  return cchn;
};

const dinhDangChuoi = (raw, mapHoTen) => String(raw).split(';').map((t) => dinhDangMot(t.trim(), mapHoTen)).filter(Boolean).join('; ');

const mot = dinhDangMot('003942/CT-CCHN', map);
assert.equal(mot, `${hoTen003942[1]} (003942/CT-CCHN)`);

const nhieu = dinhDangChuoi('003942/CT-CCHN;007014/CT-CCHN', map);
assert.ok(nhieu.includes(`${hoTen003942[1]} (003942/CT-CCHN)`));
assert.ok(nhieu.includes(`${hoTen007014[1]} (007014/CT-CCHN)`));

const cu = dinhDangMot('003942/CT-CCHN (Trần Văn Giang)', map);
assert.equal(cu, `${hoTen003942[1]} (003942/CT-CCHN)`);

console.log('qa_dinh_dang_bs_bao_cao: OK');
