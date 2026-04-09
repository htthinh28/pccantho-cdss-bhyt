/**
 * Khớp mã luật với mẫu ON/OFF (gạch ngang / gạch dưới tương đương).
 * File thuần JS, không phụ thuộc RN — dùng chung app và script QA Node.
 */

export const normalizeCodeOnOff = (value) => String(value || '').trim().toUpperCase();

/** Chuẩn hóa khóa map & so khớp: HC_06B ≡ HC-06B */
export const chuanHoaKhoaMaLuatOnOff = (s) => normalizeCodeOnOff(s).replace(/_/g, '-');

const laPatternOnOff = (pattern) => pattern.endsWith('*');

export const khopMaLuatTheoMau = (pattern, maLuat) => {
  const p = normalizeCodeOnOff(pattern);
  const m = normalizeCodeOnOff(maLuat);
  if (!p || !m) return false;
  if (laPatternOnOff(p)) {
    const prefix = p.slice(0, -1);
    const mNorm = chuanHoaKhoaMaLuatOnOff(m);
    const prefixNorm = chuanHoaKhoaMaLuatOnOff(prefix);
    return mNorm.startsWith(prefixNorm);
  }
  return chuanHoaKhoaMaLuatOnOff(p) === chuanHoaKhoaMaLuatOnOff(m);
};
