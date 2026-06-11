#!/usr/bin/env node
/**
 * QA: staffById phải index đủ MACCHN + MA_BHXH (XML thường gửi MA_BAC_SI = số CCHN).
 */
import assert from 'node:assert/strict';

const toUpper = (v) => String(v || '').trim().toUpperCase();
const normalizeToken = (v) => toUpper(v).replace(/[^A-Z0-9]+/g, '');
const collectFieldValues = (row, keys = []) => {
  const normCandidates = new Set(keys.map((k) => normalizeToken(k)));
  const out = [];
  const seen = new Set();
  const pushValue = (value) => {
    const text = String(value ?? '').trim();
    if (!text || seen.has(text)) return;
    seen.add(text);
    out.push(text);
  };
  keys.forEach((key) => {
    if (row[key] !== undefined && row[key] !== null && String(row[key]).trim() !== '') pushValue(row[key]);
  });
  Object.entries(row).forEach(([k, v]) => {
    if (!normCandidates.has(normalizeToken(k))) return;
    if (v === undefined || v === null || String(v).trim() === '') return;
    pushValue(v);
  });
  return out;
};

const STAFF_LOOKUP_ID_KEYS = ['MA_BAC_SI', 'MA_BHXH', 'MACCHN', 'SO_CCHN', 'SO_GPHN', 'MA_NV', 'ID', 'SO_CCCD', 'SO_DINH_DANH'];

const buildStaffById = (rows) => {
  const staffById = new Map();
  rows.forEach((row) => {
    const ids = collectFieldValues(row, STAFF_LOOKUP_ID_KEYS).map(toUpper);
    ids.forEach((id) => {
      if (!staffById.has(id)) staffById.set(id, row);
    });
  });
  return staffById;
};

const staffRow = {
  MA_BHXH: '5896014230',
  MACCHN: '000742/ST-CCHN',
  HO_TEN: 'Nguyễn Kỳ Minh',
  PHAMVI_CM: '110',
  ID: 3834101,
  SO_CCCD: '094073002186',
};

const staffById = buildStaffById([staffRow]);
assert.ok(staffById.has('5896014230'), 'expected MA_BHXH index');
assert.ok(staffById.has('000742/ST-CCHN'), 'expected MACCHN index for XML MA_BAC_SI');
assert.ok(staffById.has('3834101'), 'expected ID index');
assert.ok(staffById.has('094073002186'), 'expected SO_CCCD index');

// pickValue cũ chỉ lấy MA_BHXH — mô phỏng lỗi trước sửa
const pickValueFirst = (row, keys) => {
  for (const key of keys) {
    if (row[key] !== undefined && row[key] !== null && String(row[key]).trim() !== '') return row[key];
  }
  return '';
};
const legacyIds = [pickValueFirst(staffRow, STAFF_LOOKUP_ID_KEYS)].map(toUpper).filter(Boolean);
assert.equal(legacyIds.length, 1);
assert.equal(legacyIds[0], '5896014230');
assert.ok(!legacyIds.includes('000742/ST-CCHN'), 'legacy pickValue must not index MACCHN');

console.log('qa_dvkt_staff_lookup: OK');
