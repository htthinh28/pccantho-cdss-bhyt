/**
 * Chuỗi nhiều mã trên một bản ghi catalog_mapping (ICD-10, DVKT, …).
 * Chuẩn lưu / hiển thị: "I11.0; I11.9; I13.0".
 * Đọc legacy: "|" (dễ nhầm chữ I), "," (Excel), hoặc ";".
 */

const sapXepMa = (parts) =>
  [...new Set(parts)].sort((a, b) =>
    a.localeCompare(b, 'vi', { numeric: true, sensitivity: 'base' }),
  );

/** Tách chuỗi đa mã (|;|, hoặc ;) thành mảng mã đã trim. */
export function tachChuoiNhieuMa(s) {
  const raw = String(s || '').trim();
  if (!raw) return [];
  return raw
    .replace(/\|/g, ';')
    .replace(/,/g, ';')
    .split(';')
    .map((x) => x.trim())
    .filter(Boolean);
}

/** Nối mảng mã thành chuỗi chuẩn (sắp xếp ổn định, phân cách "; "). */
export function noiChuoiNhieuMa(parts) {
  const arr = Array.isArray(parts) ? parts : [];
  return sapXepMa(arr.map((c) => String(c || '').trim()).filter(Boolean)).join('; ');
}

/** Chuẩn hóa một chuỗi đa mã để so trùng (ví dụ "A|B" và "B; A"). */
export function chuanHoaChuoiMaChoSoSanh(s) {
  const parts = tachChuoiNhieuMa(s);
  if (parts.length === 0) return '';
  return sapXepMa(parts).join('; ');
}
