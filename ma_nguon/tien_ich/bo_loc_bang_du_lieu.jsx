/**
 * Lọc dòng bảng (object) theo từ khóa — không phân biệt dấu, không phân biệt hoa thường.
 * Dùng chung: Quản lý danh mục, Phác đồ, Hướng dẫn BYT, Quy trình KT, Tương tác thuốc, …
 */

/** Chuỗi so khớp: bỏ dấu, gộp khoảng trắng, chữ thường */
export function boDauTiengViet(s) {
  return String(s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/** Ghép mọi giá trị ô (theo danh sách cột hoặc mọi key) thành một chuỗi tìm */
export function ghepGiaTriTimKiem(row, columnKeys) {
  if (!row || typeof row !== 'object') return '';
  const keys =
    Array.isArray(columnKeys) && columnKeys.length > 0
      ? columnKeys
      : Object.keys(row).filter((k) => k !== 'id');
  const parts = [];
  keys.forEach((k) => {
    const v = row[k];
    if (v != null && v !== '') parts.push(String(v));
  });
  return boDauTiengViet(parts.join(' \u2003 '));
}

/**
 * @returns {Array<{ row: object, indexGoc: number }>}
 */
export function locDongTheoTuKhoa(rows, columnKeys, tuKhoa) {
  const arr = Array.isArray(rows) ? rows : [];
  const q = boDauTiengViet(String(tuKhoa || '').trim());
  if (!q) return arr.map((row, indexGoc) => ({ row, indexGoc }));
  return arr
    .map((row, indexGoc) => ({ row, indexGoc }))
    .filter(({ row }) => ghepGiaTriTimKiem(row, columnKeys).includes(q));
}

/** Kích thước một “trang” khi đã biết số dòng sau lọc */
export function kichThuocTrangHienThi(soDongMotTrang, soDongSauLoc) {
  const n = soDongSauLoc || 0;
  if (soDongMotTrang < 0) return Math.max(1, n || 1);
  return Math.max(1, soDongMotTrang);
}

export function tinhChiSoPhanTrang(soDongSauLoc, soDongMotTrang, trangHienTai) {
  const kt = kichThuocTrangHienThi(soDongMotTrang, soDongSauLoc);
  const tongSoTrang = Math.max(1, Math.ceil(soDongSauLoc / kt));
  const trangDangXem = Math.min(Math.max(1, trangHienTai), tongSoTrang);
  const chiSoBatDau = (trangDangXem - 1) * kt;
  const chiSoKetThuc = Math.min(soDongSauLoc, chiSoBatDau + kt);
  return { tongSoTrang, trangDangXem, chiSoBatDau, chiSoKetThuc, kichThuocTrang: kt };
}

/** Đồng bộ với Quản lý danh mục — có thể rút gọn chỉ 160 + Tất cả ở UI khác */
export const TUY_CHON_SO_DONG_BANG = [
  { label: '160', value: 160 },
  { label: '320', value: 320 },
  { label: '500', value: 500 },
  { label: '1000', value: 1000 },
  { label: 'Tất cả', value: -1 },
];

export const SO_DONG_TRANG_MAC_DINH = 160;
