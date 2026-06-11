#!/usr/bin/env node
/**
 * QA: CLN-THUOC-06 — bệnh chính + bệnh kèm đều trong DM TT26 → SO_NGAY phải > 30.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const seedSrc = readFileSync(join(root, 'ma_nguon/thanh_phan/icd10_ke_don_tren_30_ngay.jsx'), 'utf8');
const seedMatch = seedSrc.match(/export const DANH_MUC_ICD10_KE_DON_TREN_30_NGAY = (\[[\s\S]*?\n\]);/);
const rows = Function(`"use strict"; return (${seedMatch[1]});`)();

const ICD_TOKEN_REGEX = /[A-TV-Z]\d{2}(?:\.[0-9A-Z]{1,2})?/g;
const normalizeIcdComparable = (v) => String(v || '').toUpperCase().replace(/[^A-Z0-9.]/g, '');
const parseIcdComparable = (value) => {
  const normalized = normalizeIcdComparable(value).replace(/\./g, '');
  const match = normalized.match(/^([A-TV-Z])(\d{2})([0-9A-Z]{0,2})$/);
  if (!match) return null;
  return { letter: match[1], major: parseInt(match[2], 10), suffix: match[3] || '', normalized };
};
const buildIcdComparableKey = (p) => `${p.letter}${String(p.major).padStart(2, '0')}${String(p.suffix || '').padEnd(2, '0')}`;
const buildIcdCategoryKey = (p) => `${p.letter}${String(p.major).padStart(2, '0')}`;
const parseIcdRulesFromText = (value) => {
  const normalizedText = String(value || '').toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/Đ/g, 'D');
  const ranges = [];
  const cleanedText = normalizedText.replace(
    /([A-TV-Z]\d{2}(?:\.[0-9A-Z]{1,2})?)\s*(?:DEN|-|–|—)\s*([A-TV-Z]\d{2}(?:\.[0-9A-Z]{1,2})?)/g,
    (_, start, end) => {
      const ps = parseIcdComparable(start);
      const pe = parseIcdComparable(end);
      if (ps && pe) ranges.push({ start: ps, end: pe });
      return ' ';
    },
  );
  const exact = new Set((cleanedText.match(ICD_TOKEN_REGEX) || []).map((x) => normalizeIcdComparable(x).replace(/\./g, '')).filter(Boolean));
  return { exact, ranges };
};
const buildRuleSet = (catalogRows) => {
  const exact = new Set();
  const ranges = [];
  catalogRows.forEach((row) => {
    const parsed = parseIcdRulesFromText(row['Mã bệnh theo ICD 10'] || '');
    parsed.exact.forEach((c) => exact.add(c));
    ranges.push(...parsed.ranges);
  });
  return { exact, ranges };
};
const isInCatalog = (code, ruleSet) => {
  const parsed = parseIcdComparable(code);
  if (!parsed) return false;
  const noDot = parsed.normalized;
  const catKey = buildIcdCategoryKey(parsed);
  if (ruleSet.exact.has(noDot) || ruleSet.exact.has(catKey)) return true;
  const fullKey = buildIcdComparableKey(parsed);
  return ruleSet.ranges.some((range) => {
    const { start, end } = range;
    if (!start || !end) return false;
    const sh = String(start.suffix || '').length > 0;
    const eh = String(end.suffix || '').length > 0;
    if (!sh && !eh) {
      const sk = buildIcdCategoryKey(start);
      const ek = buildIcdCategoryKey(end);
      return catKey >= sk && catKey <= ek;
    }
    return fullKey >= buildIcdComparableKey(start) && fullKey <= buildIcdComparableKey(end);
  });
};
const extractCodes = (...values) => {
  const seen = new Set();
  values.forEach((value) => {
    (String(value || '').toUpperCase().match(ICD_TOKEN_REGEX) || []).forEach((code) => {
      const n = normalizeIcdComparable(code).replace(/\./g, '');
      if (n) seen.add(n);
    });
  });
  return [...seen];
};
const allInCatalog = (codes, ruleSet) => codes.length > 0 && codes.every((c) => isInCatalog(c, ruleSet));
const phaiKeDonTren30 = (xml1, ruleSet) => {
  const maChinh = extractCodes(xml1.MA_BENH_CHINH);
  const maKem = extractCodes(xml1.MA_BENH_KT, xml1.MA_BENHKEM);
  if (!allInCatalog(maChinh, ruleSet)) return false;
  if (maKem.length === 0) return true;
  return allInCatalog(maKem, ruleSet);
};
const canhBaoCln06 = (xml1, soNgay, ruleSet) => phaiKeDonTren30(xml1, ruleSet) && soNgay > 0 && soNgay <= 30;

const ruleSet = buildRuleSet(rows);
assert.ok(isInCatalog('I10', ruleSet));
assert.ok(isInCatalog('E11', ruleSet));
assert.ok(!isInCatalog('J06', ruleSet));

assert.equal(canhBaoCln06({ MA_BENH_CHINH: 'I10', MA_BENH_KT: 'E11' }, 30, ruleSet), true);
assert.equal(canhBaoCln06({ MA_BENH_CHINH: 'I10', MA_BENH_KT: 'E11' }, 31, ruleSet), false);
assert.equal(canhBaoCln06({ MA_BENH_CHINH: 'I10', MA_BENH_KT: '' }, 14, ruleSet), true);
assert.equal(canhBaoCln06({ MA_BENH_CHINH: 'I10', MA_BENH_KT: '' }, 31, ruleSet), false);
assert.equal(canhBaoCln06({ MA_BENH_CHINH: 'I10', MA_BENH_KT: 'J06' }, 14, ruleSet), false);
assert.equal(canhBaoCln06({ MA_BENH_CHINH: 'J06', MA_BENH_KT: 'I10' }, 14, ruleSet), false);

console.log('qa_cln_thuoc_06_ke_don_30: OK');
