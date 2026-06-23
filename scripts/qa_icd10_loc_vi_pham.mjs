#!/usr/bin/env node
/** Smoke test logic lọc ICD-10 vi phạm (inline mirror). */
import assert from 'node:assert/strict';

const laLoiLienQuanIcd10 = (loi = {}) => {
  const ma = String(loi.ma_luat || '').trim().toUpperCase();
  if (/^ICD-TT06-/.test(ma) || /^ICD-KEP-/.test(ma)) return true;
  if (String(loi.dieu_kien || '').includes('CO_ICD')) return true;
  return false;
};

const loiKhopBoLocIcd10ViPham = (loi, filterId) => {
  const id = String(filterId || '').trim();
  if (!id) return true;
  const ma = String(loi.ma_luat || '').trim().toUpperCase();
  if (id === 'ICD-ALL') return laLoiLienQuanIcd10(loi);
  if (id === 'ICD-TT06') return /^ICD-TT06-/.test(ma);
  if (id === 'ICD-KEP') return /^ICD-KEP-/.test(ma);
  if (id === 'ICD-TT06-GIOI-*') return /^ICD-TT06-GIOI-(NU|NAM)/.test(ma);
  if (id.startsWith('ICD-TT06-')) return ma === id;
  return ma === id;
};

assert.equal(loiKhopBoLocIcd10ViPham({ ma_luat: 'ICD-TT06-CAM-CHINH' }, 'ICD-TT06'), true);
assert.equal(loiKhopBoLocIcd10ViPham({ ma_luat: 'ICD-TT06-GIOI-NU' }, 'ICD-TT06-GIOI-*'), true);
assert.equal(loiKhopBoLocIcd10ViPham({ ma_luat: 'ICD-KEP-SAO-DON' }, 'ICD-KEP'), true);
assert.equal(loiKhopBoLocIcd10ViPham({ ma_luat: 'HC-01' }, 'ICD-ALL'), false);

console.log('qa_icd10_loc_vi_pham: OK');
