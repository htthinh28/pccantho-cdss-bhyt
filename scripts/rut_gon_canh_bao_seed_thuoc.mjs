#!/usr/bin/env node
/**
 * Rút gọn CANH_BAO trong du_lieu_luat_thuoc_muc8.jsx và bump PHIEN_BAN_SEED.
 */
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(import.meta.dirname, '..');
const FILE = path.join(ROOT, 'ma_nguon/tien_ich/du_lieu_luat_thuoc_muc8.jsx');
const PHIEN_BAN_MOI = '2026-06-15_canh_bao_gon';

const rutGonKhoangTrang = (value) => String(value || '')
  .replace(/\r\n/g, '\n')
  .replace(/[ \t\f\v]+/g, ' ')
  .replace(/\n{3,}/g, '\n\n')
  .trim();

const RE_HEURISTIC_XML130 = /\s*\(Heuristic XML130:[\s\S]*?\)\s*\.?/gi;
const RE_BOILERPLATE_ICD_DRUG_RA = /Thuốc trong danh mục BV;\s*BV đã khai báo thẻ ICD_DRUG nhưng ICD\/XML1 không khớp chỉ định trong mapping;\s*đồng thời CHẨN ĐOÁN RA không chứa từ khóa ngoại lệ đã cấu hình trong quy tắc\.\s*/gi;
const RE_BOILERPLATE_ICD_DRUG_RA_VAO = /Thuốc trong danh mục BV;\s*BV đã khai báo thẻ ICD_DRUG nhưng ICD\/XML1 không khớp chỉ định trong mapping;\s*đồng thời CHẨN ĐOÁN RA và CHẨN ĐOÁN VÀO đều không chứa từ khóa ngoại lệ đã cấu hình trong quy tắc\.\s*/gi;
const RE_THAM_KHAO_CHI_DINH = /Tham khảo chỉ định(?:\s*\(đối chiếu TT\/BYT\))?:\s*/i;
const RE_THAM_KHAO_LAM_SANG = /Tham khảo chỉ định lâm sàng:\s*/gi;
const RE_TIEN_TO_CANH_BAO_LAP = /(🚨|⚠️|⛔|🔴)\s*(?:Cảnh báo xuất toán|Cảnh báo lỗi|VI PHẠM):\s*/gi;

const rutGonPhanChiDinh = (phan) => {
  let s = rutGonKhoangTrang(phan);
  if (!s) return '';
  s = s.replace(/^Thuốc\s+/i, '');
  s = s
    .replace(/\s+chỉ được thanh toán cho chẩn đoán\s+/i, ' — ')
    .replace(/\s+chỉ thanh toán cho chẩn đoán\s+/i, ' — ')
    .replace(/\s+chỉ được thanh toán cho\s+/i, ' — ')
    .replace(/\s+chỉ thanh toán cho\s+/i, ' — ')
    .replace(/\s+là thuốc\s+/i, ' — ');
  return rutGonKhoangTrang(s);
};

const rutGonCanhBao = (input) => {
  let s = rutGonKhoangTrang(input);
  if (!s) return s;
  s = s.replace(RE_HEURISTIC_XML130, '');
  s = s.replace(RE_BOILERPLATE_ICD_DRUG_RA_VAO, 'ICD/XML1 không khớp chỉ định (kể cả ngoại lệ). ');
  s = s.replace(RE_BOILERPLATE_ICD_DRUG_RA, 'ICD/XML1 không khớp chỉ định. ');
  const match = s.match(RE_THAM_KHAO_CHI_DINH);
  if (match && match.index !== undefined) {
    const truoc = s.slice(0, match.index).trim();
    const sau = s.slice(match.index + match[0].length).trim();
    const chiDinh = rutGonPhanChiDinh(sau);
    s = chiDinh ? `${truoc} Chỉ định: ${chiDinh}` : truoc;
  }
  s = s.replace(RE_THAM_KHAO_LAM_SANG, 'Chỉ định: ');
  s = s.replace(RE_TIEN_TO_CANH_BAO_LAP, '$1 ');
  return rutGonKhoangTrang(s);
};

const escapeJsonString = (s) => s
  .replace(/\\/g, '\\\\')
  .replace(/"/g, '\\"')
  .replace(/\n/g, '\\n');

let src = fs.readFileSync(FILE, 'utf8');
let count = 0;

src = src.replace(/"CANH_BAO": "((?:[^"\\]|\\.)*)"/g, (full, inner) => {
  const raw = inner
    .replace(/\\n/g, '\n')
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, '\\');
  const next = rutGonCanhBao(raw);
  if (next === raw) return full;
  count += 1;
  return `"CANH_BAO": "${escapeJsonString(next)}"`;
});

src = src.replace(
  /export const PHIEN_BAN_SEED_LUAT_THUOC_MUC8 = '[^']*';/,
  `export const PHIEN_BAN_SEED_LUAT_THUOC_MUC8 = '${PHIEN_BAN_MOI}';`,
);

fs.writeFileSync(FILE, src, 'utf8');
console.log(`Updated ${count} CANH_BAO entries; PHIEN_BAN=${PHIEN_BAN_MOI}`);
