#!/usr/bin/env node
/** Smoke test rutGonPhanHoiQuyTac (inline — tránh import .jsx trực tiếp từ Node). */

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
const RE_GOP_CAU_CHI_TIET = /\.\s+(Chi tiết(?:\s+\w+)?|Cách tính|Khoa liên quan|Nhân sự liên quan|Căn cứ|Can cu):\s*/gi;

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

const rutGonPhanHoiQuyTac = (input) => {
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
    s = chiDinh ? `${truoc}\nChỉ định: ${chiDinh}` : truoc;
  }
  s = s.replace(RE_THAM_KHAO_LAM_SANG, '\nChỉ định: ');
  s = s.replace(RE_TIEN_TO_CANH_BAO_LAP, '$1 ');
  s = s.replace(RE_GOP_CAU_CHI_TIET, '.\n$1: ');
  s = s.replace(/\s+Can cu:\s*/gi, '\nCăn cứ: ');
  s = s.replace(/\s+Căn cứ:\s*/g, '\nCăn cứ: ');
  return rutGonKhoangTrang(s);
};

const mau = [
  {
    in: '⛔ [XUẤT TOÁN]: [Acetyl leucin] — Thuốc trong danh mục BV; BV đã khai báo thẻ ICD_DRUG nhưng ICD/XML1 không khớp chỉ định trong mapping; đồng thời CHẨN ĐOÁN RA không chứa từ khóa ngoại lệ đã cấu hình trong quy tắc. Tham khảo chỉ định (đối chiếu TT/BYT): Thuốc Gikanin chỉ được thanh toán cho chẩn đoán Chóng mặt (H81, R42).',
    mustInclude: ['XUẤT TOÁN', 'Acetyl leucin', 'Chỉ định', 'Chóng mặt'],
    mustExclude: ['ICD_DRUG', 'Tham khảo chỉ định', 'ngoại lệ đã cấu hình'],
  },
  {
    in: '🚨 Cảnh báo xuất toán: PT Bơm xi măng không đúng QTCM. (Heuristic XML130: có dòng tên DVKT gợi bơm/đổ xi măng cột sống trong DS_XML3 — đối chiếu QTCM.)',
    mustInclude: ['🚨', 'QTCM'],
    mustExclude: ['Heuristic XML130', 'Cảnh báo xuất toán'],
  },
];

let failed = 0;
for (const [i, t] of mau.entries()) {
  const out = rutGonPhanHoiQuyTac(t.in);
  const okInc = t.mustInclude.every((x) => out.includes(x));
  const okExc = t.mustExclude.every((x) => !out.includes(x));
  if (!okInc || !okExc) {
    failed += 1;
    console.error(`FAIL #${i + 1}\nIN:  ${t.in}\nOUT: ${out}\n`);
  } else {
    console.log(`OK #${i + 1}: ${out.replace(/\n/g, ' | ')}`);
  }
}
process.exit(failed ? 1 : 0);
