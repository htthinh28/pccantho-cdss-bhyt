#!/usr/bin/env node
/**
 * QA: tra cứu nhân sự DVKT-OP — MA_BAC_SI / NGUOI_THUC_HIEN đối chiếu MACCHN danh mục.
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

const buildStaffIndexes = (rows) => {
  const staffById = new Map();
  const staffByMacchn = new Map();
  rows.forEach((row) => {
    const macchn = toUpper(row.MACCHN || row.SO_CCHN || row.SO_GPHN || '');
    const entry = { raw: row, macchn, scopes: new Set(String(row.PHAMVI_CM || '').split(/[,;|]/).map(normalizeToken).filter(Boolean)) };
    collectFieldValues(row, STAFF_LOOKUP_ID_KEYS).map(toUpper).forEach((id) => {
      if (!staffById.has(id)) staffById.set(id, entry);
    });
    if (macchn && !staffByMacchn.has(macchn)) staffByMacchn.set(macchn, entry);
  });
  return { staffById, staffByMacchn };
};

const findStaffByActorCode = (config, actorCode) => {
  const id = toUpper(actorCode);
  if (!id || !config) return null;
  const byMacchn = config.staffByMacchn?.get(id);
  if (byMacchn) return byMacchn;
  return config.staffById?.get(id) || null;
};

const staffRow = {
  MA_BHXH: '5896014230',
  MACCHN: '000742/ST-CCHN',
  HO_TEN: 'Nguyễn Kỳ Minh',
  PHAMVI_CM: '110',
  ID: 3834101,
  SO_CCCD: '094073002186',
};

const config = buildStaffIndexes([staffRow]);
assert.ok(config.staffById.has('5896014230'), 'expected MA_BHXH index');
assert.ok(config.staffById.has('000742/ST-CCHN'), 'expected MACCHN index for XML MA_BAC_SI');
assert.ok(config.staffByMacchn.has('000742/ST-CCHN'), 'expected staffByMacchn');

// XML gửi MA_BAC_SI = số CCHN → tìm thấy qua MACCHN
const staffFromXml = findStaffByActorCode(config, '000742/ST-CCHN');
assert.ok(staffFromXml, 'MA_BAC_SI=000742/ST-CCHN must resolve via MACCHN');
assert.ok(staffFromXml.scopes.has('110'), 'PHAMVI_CM 110 available for phạm vi check');

// Mã không tồn tại trong danh mục
assert.equal(findStaffByActorCode(config, '999999/XX-CCHN'), null);

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
