#!/usr/bin/env node
/**
 * QA: DVKT-OP-03 — MA_BAC_SI không bắt phạm vi; NGUOI_THUC_HIEN bắt buộc; DVKT giường miễn.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = readFileSync(join(root, 'ma_nguon/tien_ich/dvkt_op_giam_dinh.jsx'), 'utf8');

assert.match(src, /laDichVuGiuongMienPhamViHanhNghe/);
assert.match(src, /nguoiThucHienCandidates\.length === 0\) return pass\(\)/);
assert.match(src, /NGUOI_THUC_HIEN không đúng phạm vi chuyên môn/);
assert.doesNotMatch(src, /Thiếu MA_BAC_SI để đối chiếu phạm vi hành nghề/);

const removeAccents = (v) => String(v || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/Đ/g, 'D')
  .replace(/đ/g, 'd');
const normalizeText = (v) => removeAccents(v).toUpperCase().replace(/\s+/g, ' ').trim();
const parseList = (raw) => String(raw || '').split(/[,;|]/).map((s) => s.trim()).filter(Boolean);
const toUpper = (v) => String(v || '').trim().toUpperCase();
const isEmpty = (v) => v === null || v === undefined || String(v).trim() === '';

const laDichVuGiuongMienPhamViHanhNghe = (line) => {
  const tenNorm = normalizeText(line.tenDvkt || '');
  if (tenNorm.includes('GIUONG')) return true;
  const mn = String(line.maNhom || '').trim().replace(/^0+(?=\d)/, '');
  if (mn === '15') return true;
  return false;
};

const canKiemTraPhamVi = (line) => {
  if (laDichVuGiuongMienPhamViHanhNghe(line)) return false;
  const nguoiThucHienCandidates = parseList(line.nguoiThucHien).map((id) => toUpper(id)).filter(Boolean);
  return nguoiThucHienCandidates.length > 0;
};

assert.equal(laDichVuGiuongMienPhamViHanhNghe({ tenDvkt: 'Giường bệnh nội trú' }), true);
assert.equal(laDichVuGiuongMienPhamViHanhNghe({ maNhom: '15', tenDvkt: 'Dịch vụ khác' }), true);
assert.equal(laDichVuGiuongMienPhamViHanhNghe({ tenDvkt: 'Chụp X-quang' }), false);

assert.equal(canKiemTraPhamVi({ maBacSi: '000742/ST-CCHN', nguoiThucHien: '' }), false);
assert.equal(canKiemTraPhamVi({ maBacSi: '000742/ST-CCHN', nguoiThucHien: '000742/ST-CCHN' }), true);
assert.equal(canKiemTraPhamVi({ tenDvkt: 'Giường hồi sức', nguoiThucHien: '001/XX-CCHN' }), false);

assert.equal(isEmpty(''), true);
assert.equal(isEmpty('x'), false);

console.log('qa_dvkt_phamvi_nguoi_thuc_hien: OK');
