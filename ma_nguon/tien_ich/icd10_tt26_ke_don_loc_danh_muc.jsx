/**
 * Bộ lọc tab DANH_MUC_ICD10_KE_DON_TREN_30_NGAY — Phụ lục VII Thông tư 26/2025/TT-BYT (252 bệnh).
 */
import {
  DANH_MUC_ICD10_KE_DON_TREN_30_NGAY,
  PHIEN_BAN_DANH_MUC_ICD10_KE_DON_TREN_30_NGAY,
} from '../thanh_phan/icd10_ke_don_tren_30_ngay';

export { PHIEN_BAN_DANH_MUC_ICD10_KE_DON_TREN_30_NGAY as PHIEN_BAN_ICD10_KE_DON_TT26 };

/** Nhóm chuyên khoa theo cột Mã TT (Phụ lục VII TT 26/2025). */
export const NHOM_CHUYEN_KHOA_TT26 = {
  1: 'Bệnh nhiễm trùng và ký sinh trùng',
  2: 'Bướu tân sinh (Neoplasm)',
  3: 'Bệnh của máu, cơ quan tạo máu và các rối loạn liên quan đến cơ chế miễn dịch',
  4: 'Bệnh nội tiết, dinh dưỡng và chuyển hóa',
  5: 'Bệnh tâm thần',
  6: 'Bệnh hệ thần kinh',
  7: 'Bệnh mắt và phần phụ',
  8: 'Bệnh tuần hoàn',
  9: 'Bệnh hô hấp',
  10: 'Bệnh tiêu hóa',
  11: 'Bệnh da và mô dưới da',
  12: 'Bệnh cơ xương khớp và mô liên kết',
  13: 'Bệnh hệ tiết niệu',
  14: 'Bệnh sinh sản',
  15: 'Chấn thương, ngộ độc và một số hậu quả của nguyên nhân bên ngoài',
  16: 'Yếu tố ảnh hưởng đến tình trạng sức khỏe và tiếp xúc dịch vụ y tế',
};

const buildBoLocChuyenKhoa = () => Object.entries(NHOM_CHUYEN_KHOA_TT26).map(([so, ten]) => {
  const n = Number(so);
  const label = `CK-${String(n).padStart(2, '0')}`;
  return {
    id: `CK:${n}`,
    label,
    moTa: ten,
  };
});

export const BO_LOC_ICD10_KE_DON_TT26 = [
  { id: '', label: 'Tất cả', moTa: '252 bệnh/nhóm bệnh Phụ lục VII TT 26/2025' },
  ...buildBoLocChuyenKhoa(),
  { id: 'MA-KHOANG', label: 'Mã khoảng', moTa: 'ICD ghi khoảng, nhiều mã hoặc ngoại lệ (đến, trừ, dấu phẩy)' },
  { id: 'MA-DON', label: 'Mã đơn', moTa: 'Một mã ICD-10 đơn (vd. B18.1, C50)' },
];

const layGiaTriCot = (row, keys = []) => {
  if (!row || typeof row !== 'object') return '';
  for (const k of keys) {
    const v = String(row[k] ?? '').trim();
    if (v) return v;
  }
  return '';
};

export const layMaTTTuDong = (row) => layGiaTriCot(row, ['Mã TT', 'MA_TT', 'Ma TT']);

export const layMaIcdTuDongKeDon30 = (row) => layGiaTriCot(row, [
  'Mã bệnh theo ICD 10',
  'Ma benh theo ICD 10',
  'MA_BENH_THEO_ICD_10',
  'MA_BENH_ICD10',
]);

export const layNhomChuyenKhoaTuDong = (row) => {
  const maTT = layMaTTTuDong(row);
  const prefix = String(maTT || '').trim().split('.')[0];
  const n = Number(prefix);
  return Number.isFinite(n) && n > 0 ? n : 0;
};

const laMaIcdKhoangHoacPhucTap = (maIcd) => {
  const text = String(maIcd || '').trim();
  if (!text) return false;
  if (/đến|den|trừ|tru|\(|\)|[,;]|–|—|-\s*[A-Z0-9]/i.test(text)) return true;
  const tokens = text.toUpperCase().match(/[A-Z]\d{2}(?:\.\d{1,4})?/g) || [];
  return tokens.length > 1;
};

export const dongThuocBoLocKeDonTT26 = (row, filterId) => {
  if (!filterId) return true;
  const maIcd = layMaIcdTuDongKeDon30(row);
  if (filterId === 'MA-KHOANG') return laMaIcdKhoangHoacPhucTap(maIcd);
  if (filterId === 'MA-DON') return !!maIcd && !laMaIcdKhoangHoacPhucTap(maIcd);
  if (filterId.startsWith('CK:')) {
    const nhom = Number(filterId.slice(3));
    return layNhomChuyenKhoaTuDong(row) === nhom;
  }
  return true;
};

/** @param {Array<{row: object, indexGoc: number}>} hangDaLoc */
export const locDongKeDonTren30TheoTT26 = (hangDaLoc, filterId) => {
  if (!filterId) return hangDaLoc;
  const arr = Array.isArray(hangDaLoc) ? hangDaLoc : [];
  return arr.filter(({ row }) => dongThuocBoLocKeDonTT26(row, filterId));
};

const demTuDanhSach = (rows) => {
  const arr = Array.isArray(rows) ? rows : [];
  const counts = { '': arr.length };
  BO_LOC_ICD10_KE_DON_TT26.forEach((f) => {
    if (f.id) counts[f.id] = 0;
  });
  arr.forEach((row) => {
    BO_LOC_ICD10_KE_DON_TT26.forEach((f) => {
      if (f.id && dongThuocBoLocKeDonTT26(row, f.id)) counts[f.id] += 1;
    });
  });
  return counts;
};

let _demSeedCache = null;
export const demMaKeDonTren30TheoBoLoc = (rows) => {
  const source = Array.isArray(rows) && rows.length > 0 ? rows : DANH_MUC_ICD10_KE_DON_TREN_30_NGAY;
  if (!rows && _demSeedCache) return _demSeedCache;
  const counts = demTuDanhSach(source);
  if (!rows) _demSeedCache = counts;
  return counts;
};
