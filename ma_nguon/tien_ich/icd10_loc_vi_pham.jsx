/**
 * Bộ lọc vi phạm QPS theo mã ICD-10 — TT 06/2026, mã kép (†/*) và các lỗi ICD liên quan.
 */
import { BO_LOC_ICD10_TT06, PHIEN_BAN_ICD10_TT06 } from './icd10_tt06_loc_danh_muc';

export { PHIEN_BAN_ICD10_TT06 };

export const BO_LOC_ICD10_VI_PHAM_TAT_CA = '';

const TT06_CHIP = BO_LOC_ICD10_TT06.filter((f) => f.id).map((f) => ({
  id: f.id,
  label: f.id.replace('ICD-TT06-', ''),
  moTa: f.moTa,
  nhom: 'TT06',
}));

export const BO_LOC_ICD10_VI_PHAM = Object.freeze([
  { id: BO_LOC_ICD10_VI_PHAM_TAT_CA, label: 'Tất cả', moTa: 'Không lọc theo ICD-10' },
  { id: 'ICD-ALL', label: 'Mọi lỗi ICD', moTa: 'TT06, mã kép, hành chính, thuốc, DVKT…' },
  { id: 'ICD-TT06', label: 'TT06 (tất cả)', moTa: 'Thông tư 06/2026 — mọi cờ mã hóa', nhom: 'TT06' },
  ...TT06_CHIP,
  { id: 'ICD-KEP', label: 'Mã kép †/*', moTa: 'Tất cả quy tắc ICD-KEP', nhom: 'KEP' },
  { id: 'ICD-HC-DL', label: 'Hành chính & XML', moTa: 'HC-07, thiếu/trống ICD (XML_14–35)', nhom: 'KHAC' },
  { id: 'ICD-THUOC', label: 'Thuốc', moTa: 'Mapping chỉ định/chống CĐ, kê >30 ngày', nhom: 'KHAC' },
  { id: 'ICD-DVKT', label: 'DVKT', moTa: 'DVKT-OP chỉ định / chống chỉ định ICD', nhom: 'KHAC' },
  { id: 'ICD-CAP-CUU', label: 'Cấp cứu', moTa: 'HC_249 — ICD cấp cứu', nhom: 'KHAC' },
  { id: 'ICD-CDSS', label: 'CDSS', moTa: 'Phác đồ chuyên môn theo ICD', nhom: 'KHAC' },
]);

const chuanHoaMaLuat = (loi) => String(loi?.ma_luat || loi?.MA_LUAT || '').trim().toUpperCase();

/** Lỗi giám định có liên quan ICD-10 (dùng cho thống kê / nhóm «Mọi lỗi ICD»). */
export const laLoiLienQuanIcd10 = (loi = {}) => {
  const ma = chuanHoaMaLuat(loi);
  if (!ma) {
    const truong = String(loi?.truong_loi || '').toUpperCase();
    if (/MA_BENH/.test(truong)) return true;
  }
  if (/^ICD-TT06-/.test(ma)) return true;
  if (/^ICD-KEP-/.test(ma)) return true;
  if (/^(HC-07|HC_249)$/.test(ma)) return true;
  if (/^XML_(14|15|34|35)$/.test(ma)) return true;
  if (/^CLN-THUOC-0[56]$/.test(ma)) return true;
  if (/^THUOC_ICD/.test(ma)) return true;
  if (/^THUOC_(95|311|41|267)$/.test(ma)) return true;
  if (/^DVKT-OP-0[12]$/.test(ma)) return true;
  if (/^CDSS_CM_/.test(ma)) return true;

  const truong = String(loi?.truong_loi || '').toUpperCase();
  if (/MA_BENH/.test(truong)) return true;

  const dk = String(loi?.dieu_kien || '').toUpperCase();
  if (dk.includes('CO_ICD') || dk.includes('ICD10') || dk.includes('ICD_')) return true;

  const blob = String([
    loi?.ten_quy_tac,
    loi?.TEN_QUY_TAC,
    loi?.canh_bao,
    loi?.CANH_BAO,
  ].filter(Boolean).join(' ')).toUpperCase();
  if (/\bICD[- ]?10\b/.test(blob) || blob.includes('MA_BENH_CHINH') || blob.includes('MA_BENH_KT')) return true;

  return false;
};

/** @returns {boolean} lỗi / ma_luat có khớp chip lọc ICD-10 */
export const loiKhopBoLocIcd10ViPham = (loi, filterId) => {
  const id = String(filterId || '').trim();
  if (!id) return true;

  const ma = chuanHoaMaLuat(loi);

  if (id === 'ICD-ALL') return laLoiLienQuanIcd10(loi);
  if (id === 'ICD-TT06') return /^ICD-TT06-/.test(ma);
  if (id === 'ICD-KEP') return /^ICD-KEP-/.test(ma);
  if (id === 'ICD-HC-DL') return /^(HC-07|XML_14|XML_15|XML_34|XML_35)$/.test(ma);
  if (id === 'ICD-THUOC') {
    if (/^(THUOC_ICD|CLN-THUOC-0[56]|THUOC_(95|311|41|267))$/.test(ma)) return true;
    const dk = String(loi?.dieu_kien || '').toUpperCase();
    return dk.includes('CO_ICD');
  }
  if (id === 'ICD-DVKT') return /^DVKT-OP-0[12]$/.test(ma);
  if (id === 'ICD-CAP-CUU') return ma === 'HC_249';
  if (id === 'ICD-CDSS') return /^CDSS_CM_/.test(ma);

  if (id === 'ICD-TT06-GIOI-*') return /^ICD-TT06-GIOI-(NU|NAM)/.test(ma);

  if (id.startsWith('ICD-TT06-')) return ma === id;
  if (id.startsWith('ICD-KEP-')) return ma === id;

  return ma === id;
};

/** Đếm số dòng lỗi (chi tiết) theo từng chip — hiển thị trên Tổng quan. */
export const demLoiTheoBoLocIcd10 = (danhSachChiTiet = []) => {
  const arr = Array.isArray(danhSachChiTiet) ? danhSachChiTiet : [];
  const counts = { '': arr.length, 'ICD-ALL': 0 };
  BO_LOC_ICD10_VI_PHAM.forEach((f) => {
    if (f.id && f.id !== 'ICD-ALL') counts[f.id] = 0;
  });
  arr.forEach((loi) => {
    if (laLoiLienQuanIcd10(loi)) counts['ICD-ALL'] += 1;
    BO_LOC_ICD10_VI_PHAM.forEach((f) => {
      if (f.id && loiKhopBoLocIcd10ViPham(loi, f.id)) counts[f.id] += 1;
    });
  });
  return counts;
};
