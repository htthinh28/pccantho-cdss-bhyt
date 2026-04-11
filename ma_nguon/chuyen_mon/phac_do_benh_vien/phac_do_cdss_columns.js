/**
 * Phác đồ CDSS Phương Châu — khớp file mẫu CDSS_Guidelines (sheet PhacDo, cột tiếng Anh).
 * Hiển thị trong UI = tiếng Việt; import Excel có thể dùng khóa EN hoặc VN.
 */
export const ANH_XA_COT_EXCEL_SANG_VI = Object.freeze({
  icd10: 'MÃ ICD-10',
  diseaseName: 'TÊN BỆNH (CHẨN ĐOÁN)',
  diseaseSeverity: 'MỨC ĐỘ / THỂ BỆNH',
  treatmentGoals: 'MỤC TIÊU ĐIỀU TRỊ',
  prognosis: 'TIÊN LƯỢNG',
  specificTreatment: 'ĐIỀU TRỊ ĐẶC HIỆU',
  symptomaticTreatment: 'ĐIỀU TRỊ TRIỆU CHỨNG',
  interventionTreatment: 'CAN THIỆP / THỦ THUẬT-PT',
  lifestyleChanges: 'LỐI SỐNG / HOẠT ĐỘNG',
  nutrition: 'DINH DƯỠNG',
  primaryPrevention: 'DỰ PHÒNG SƠ CẤP',
  complicationPrevention: 'DỰ PHÒNG BIẾN CHỨNG',
  sequelaePrevention: 'DỰ PHÒNG DI CHỨNG',
  followUpTime: 'THỜI GIAN TÁI KHÁM / THEO DÕI',
  clinicalMonitoring: 'THEO DÕI LÂM SÀNG',
  subclinicalMonitoring: 'THEO DÕI CẬN LÂM SÀNG',
  specialNotes: 'GHI CHÚ ĐẶC BIỆT',
});

export const COT_MAC_DINH_PHAC_DO_CDSS = Object.freeze(Object.values(ANH_XA_COT_EXCEL_SANG_VI));

/** Chuẩn hóa mã ICD — khớp engine giám định (`dong_co_giam_dinh`). */
export function chuanHoaMaIcdPhacDoCdss(raw) {
  return String(raw ?? '')
    .replace(/\./g, '')
    .trim()
    .toUpperCase();
}

function diemDoDayDong(row) {
  if (!row || typeof row !== 'object') return 0;
  let n = 0;
  Object.keys(row).forEach((k) => {
    if (k === 'id') return;
    n += String(row[k] ?? '').length;
  });
  return n;
}

/**
 * Gộp nhiều dòng trùng MÃ ICD-10 — giữ bản có nội dung dài hơn (ưu tiên văn bản đầy đủ).
 */
export function loaiTrungMaIcdUuTienNoiDung(rows) {
  const m = new Map();
  (Array.isArray(rows) ? rows : []).forEach((r) => {
    const k = chuanHoaMaIcdPhacDoCdss(r?.['MÃ ICD-10']);
    if (!k) return;
    const cur = m.get(k);
    if (!cur || diemDoDayDong(r) > diemDoDayDong(cur)) m.set(k, r);
  });
  return Array.from(m.values());
}

function chuanHoaTenBenhSoSanh(raw) {
  return String(raw ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

/**
 * Gộp bảng import vào dữ liệu đang có.
 * - `uuTienFileMoi` (mặc định true): dòng trong file import thắng cùng mã ICD; ICD chỉ có ở bảng cũ được giữ.
 * - `loaiTenBenhTrung`: bỏ dòng sau nếu trùng tên bệnh (chuẩn hóa) với dòng đã giữ — tránh “bệnh giống nhau” lặp lại.
 */
export function gopPhacDoImportVoiDuLieuHienTai(existingRows, incomingRows, opts = {}) {
  const { uuTienFileMoi = true, loaiTenBenhTrung = false } = opts;
  const cotIcd = 'MÃ ICD-10';
  const cotTen = 'TÊN BỆNH (CHẨN ĐOÁN)';
  const incoming = Array.isArray(incomingRows) ? incomingRows : [];
  const existing = Array.isArray(existingRows) ? existingRows : [];
  const byKey = new Map();

  if (uuTienFileMoi) {
    incoming.forEach((r) => {
      const k = chuanHoaMaIcdPhacDoCdss(r?.[cotIcd]);
      if (!k) return;
      const prev = byKey.get(k);
      byKey.set(k, prev ? { ...prev, ...r, id: r.id || prev.id } : { ...r });
    });
    existing.forEach((r) => {
      const k = chuanHoaMaIcdPhacDoCdss(r?.[cotIcd]);
      if (!k || byKey.has(k)) return;
      byKey.set(k, { ...r });
    });
  } else {
    existing.forEach((r) => {
      const k = chuanHoaMaIcdPhacDoCdss(r?.[cotIcd]);
      if (!k || byKey.has(k)) return;
      byKey.set(k, { ...r });
    });
    incoming.forEach((r) => {
      const k = chuanHoaMaIcdPhacDoCdss(r?.[cotIcd]);
      if (!k) return;
      const prev = byKey.get(k);
      byKey.set(k, prev ? { ...prev, ...r, id: r.id || prev.id } : { ...r });
    });
  }

  let out = Array.from(byKey.values());
  if (loaiTenBenhTrung) {
    const seen = new Set();
    out = out.filter((r) => {
      const t = chuanHoaTenBenhSoSanh(r[cotTen]);
      if (!t) return true;
      if (seen.has(t)) return false;
      seen.add(t);
      return true;
    });
  }
  return out;
}

/** Dòng mẫu trong file Excel (placeholder tiếng Anh — không phải mã ICD thật). */
export function laDongMauTemplatePhacDo(row) {
  const icd = String(row?.['MÃ ICD-10'] ?? '').trim().toLowerCase();
  const ten = String(row?.['TÊN BỆNH (CHẨN ĐOÁN)'] ?? '').trim().toLowerCase();
  if (icd === 'icd10' && (ten === 'diseasename' || ten === '')) return true;
  if (ten === 'diseasename') return true;
  return false;
}

/** Chuẩn hóa một dòng import: map khóa EN → VN, giữ id. */
export function chuanHoaDongImportPhacDo(row) {
  const out = { ...row };
  const hasEn = Object.keys(ANH_XA_COT_EXCEL_SANG_VI).some((k) => Object.prototype.hasOwnProperty.call(row, k));
  if (hasEn) {
    Object.entries(ANH_XA_COT_EXCEL_SANG_VI).forEach(([en, vn]) => {
      if (row[en] !== undefined && row[en] !== null) out[vn] = String(row[en]);
      delete out[en];
    });
  }
  return out;
}
