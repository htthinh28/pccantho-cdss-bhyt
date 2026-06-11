/**
 * Bộ lọc danh mục ICD-10 nội bộ theo cờ Thông tư 06/2026/TT-BYT (BANG_ICD10_TT06).
 */
import { BANG_ICD10_TT06, PHIEN_BAN_ICD10_TT06 } from '../thanh_phan/icd10_tt06_bang_ma';

export { PHIEN_BAN_ICD10_TT06 };

export const BO_LOC_ICD10_TT06 = [
  { id: '', label: 'Tất cả', moTa: 'Không lọc theo cờ TT 06' },
  { id: 'ICD-TT06-CAM-CHINH', label: 'CAM-CHINH', moTa: 'Không được dùng làm bệnh chính', mucDo: 'Error' },
  { id: 'ICD-TT06-KK-CHINH', label: 'KK-CHINH', moTa: 'Không khuyến khích làm bệnh chính', mucDo: 'Warning' },
  { id: 'ICD-TT06-CU-THE-HON', label: 'CU-THE-HON', moTa: 'Nên dùng mã 4–5 ký tự chi tiết hơn', mucDo: 'Warning' },
  { id: 'ICD-TT06-TU-VONG', label: 'TU-VONG', moTa: 'Chỉ mã hóa nguyên nhân tử vong', mucDo: 'Warning' },
  { id: 'ICD-TT06-GIOI-*', label: 'GIOI-*', moTa: 'Không phù hợp giới tính (nữ / nam)', mucDo: 'Warning' },
];

const khoaBangIcd10TT06 = (maIcd) => String(maIcd || '')
  .replace(/[\u2020\u2021\u2022†‡]/g, '')
  .trim()
  .toUpperCase()
  .replace(/[^A-Z0-9.]/g, '')
  .replace(/\./g, '');

export const layCoTT06TuMa = (ma) => {
  const key = khoaBangIcd10TT06(ma);
  if (!key || !BANG_ICD10_TT06) return null;
  return BANG_ICD10_TT06[key] || null;
};

export const layMaBenhTuDongIcd10 = (row, columnKeys = []) => {
  if (!row || typeof row !== 'object') return '';
  const uuTien = ['MÃ BỆNH', 'MA_BENH', 'MÃ ICD-10', 'Ma ICD-10', 'MÃ BỆNH KHÔNG DẤU'];
  for (const k of uuTien) {
    const v = String(row[k] ?? '').trim();
    if (v) return v;
  }
  const cot = (Array.isArray(columnKeys) ? columnKeys : []).find((c) => /MÃ.*BỆNH|MA_BENH|ICD/i.test(String(c || '')));
  return cot ? String(row[cot] ?? '').trim() : '';
};

export const maThuocBoLocTT06 = (ma, filterId) => {
  if (!filterId) return true;
  const flags = layCoTT06TuMa(ma);
  if (!flags) return false;
  switch (filterId) {
    case 'ICD-TT06-CAM-CHINH':
      return !!flags.camBenhChinh;
    case 'ICD-TT06-KK-CHINH':
      return !!flags.khongKhuyenKhichBenhChinh;
    case 'ICD-TT06-CU-THE-HON':
      return !!flags.coMaBonHoacNamKyTuCuTheHon;
    case 'ICD-TT06-TU-VONG':
      return !!flags.chiMaHoaNguyenNhanTuVong;
    case 'ICD-TT06-GIOI-*':
      return !!flags.chuYeuNuGioi || !!flags.chuYeuNamGioi;
    default:
      return true;
  }
};

/** @param {Array<{row: object, indexGoc: number}>} hangDaLoc */
export const locDongIcd10TheoTT06 = (hangDaLoc, columnKeys, filterId) => {
  if (!filterId) return hangDaLoc;
  const arr = Array.isArray(hangDaLoc) ? hangDaLoc : [];
  return arr.filter(({ row }) => {
    const ma = layMaBenhTuDongIcd10(row, columnKeys);
    return ma && maThuocBoLocTT06(ma, filterId);
  });
};

export const dinhDangNhanCoTT06 = (ma) => {
  const flags = layCoTT06TuMa(ma);
  if (!flags) return '';
  const out = [];
  if (flags.camBenhChinh) out.push('CAM-CHINH');
  if (flags.khongKhuyenKhichBenhChinh) out.push('KK-CHINH');
  if (flags.coMaBonHoacNamKyTuCuTheHon) out.push('CU-THE-HON');
  if (flags.chiMaHoaNguyenNhanTuVong) out.push('TU-VONG');
  if (flags.chuYeuNuGioi) out.push('GIOI-NU');
  if (flags.chuYeuNamGioi) out.push('GIOI-NAM');
  return out.join(', ');
};

let _demCoTT06Cache = null;
export const demMaCoTT06TheoBoLoc = () => {
  if (_demCoTT06Cache) return _demCoTT06Cache;
  const counts = { '': Object.keys(BANG_ICD10_TT06 || {}).length };
  BO_LOC_ICD10_TT06.forEach((f) => {
    if (f.id) counts[f.id] = 0;
  });
  Object.entries(BANG_ICD10_TT06 || {}).forEach(([ma]) => {
    BO_LOC_ICD10_TT06.forEach((f) => {
      if (f.id && maThuocBoLocTT06(ma, f.id)) counts[f.id] += 1;
    });
  });
  _demCoTT06Cache = counts;
  return counts;
};
