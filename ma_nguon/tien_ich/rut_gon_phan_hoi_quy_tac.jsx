/**
 * Rút gọn nội dung phản hồi quy tắc: bỏ boilerplate trùng lặp, tách ý rõ ràng.
 * Áp dụng khi hiển thị / sau khi engine ghép chi tiết giải trình.
 */

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

/** Chuẩn hóa phần chỉ định sau khi bỏ boilerplate ICD_DRUG. */
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

const tachPhanChiDinh = (s) => {
  const match = s.match(RE_THAM_KHAO_CHI_DINH);
  if (!match || match.index === undefined) return null;
  const truoc = s.slice(0, match.index).trim();
  const sau = s.slice(match.index + match[0].length).trim();
  return { truoc, sau };
};

/**
 * Rút gọn một chuỗi cảnh báo / phản hồi quy tắc.
 * @param {string} input
 * @returns {string}
 */
export const rutGonPhanHoiQuyTac = (input) => {
  let s = rutGonKhoangTrang(input);
  if (!s) return s;

  s = s.replace(RE_HEURISTIC_XML130, '');
  s = s.replace(RE_BOILERPLATE_ICD_DRUG_RA_VAO, 'ICD/XML1 không khớp chỉ định (kể cả ngoại lệ). ');
  s = s.replace(RE_BOILERPLATE_ICD_DRUG_RA, 'ICD/XML1 không khớp chỉ định. ');

  const tach = tachPhanChiDinh(s);
  if (tach) {
    const chiDinh = rutGonPhanChiDinh(tach.sau);
    s = chiDinh ? `${tach.truoc}\nChỉ định: ${chiDinh}` : tach.truoc;
  }

  s = s.replace(RE_THAM_KHAO_LAM_SANG, '\nChỉ định: ');
  s = s.replace(RE_TIEN_TO_CANH_BAO_LAP, '$1 ');
  s = s.replace(RE_GOP_CAU_CHI_TIET, '.\n$1: ');
  s = s.replace(/\s+Can cu:\s*/gi, '\nCăn cứ: ');
  s = s.replace(/\s+Căn cứ:\s*/g, '\nCăn cứ: ');

  return rutGonKhoangTrang(s);
};

/** Chuỗi khóa dedupe — gom khoảng trắng + xuống dòng để so sánh trùng. */
export const chuanHoaKhoaCanhBaoDedupe = (input) => rutGonKhoangTrang(input).replace(/\n/g, ' ');

/**
 * Rút gọn CANH_BAO trong seed / hardcoded (không có chi tiết giải trình động).
 * @param {string} canhBao
 * @returns {string}
 */
export const rutGonCanhBaoSeed = (canhBao) => rutGonPhanHoiQuyTac(canhBao);
