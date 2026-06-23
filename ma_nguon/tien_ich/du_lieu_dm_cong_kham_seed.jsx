/**
 * Seed danh mục công khám BV (DM_KHAM) — chỉ mã công khám, không DVKT khác.
 * Mã nhóm XX.YY (TT 12/2018): mọi MA_DICH_VU cùng tiền tố đều thuộc DM_KHAM.
 * Bổ sung từ Excel: npm run catalog:dm-cong-kham -- "path/to/Danh muc dich vu kham.xls"
 */
export const PHIEN_BAN_DM_CONG_KHAM = '2026-05-26-8nhom';

export const COT_DM_CONG_KHAM = [
  'STT',
  'MA_DICH_VU',
  'TEN_DICH_VU',
];

/** Nhóm công khám áp dụng CK_59 — nguồn danh mục BV đính kèm. */
export const DM_CONG_KHAM_SEED = [
  { STT: 1, MA_DICH_VU: '02.03', TEN_DICH_VU: 'Khám Nội tổng hợp' },
  { STT: 2, MA_DICH_VU: '02.13', TEN_DICH_VU: 'Khám Da liễu' },
  { STT: 3, MA_DICH_VU: '03.18', TEN_DICH_VU: 'Khám Nhi' },
  { STT: 4, MA_DICH_VU: '10.19', TEN_DICH_VU: 'Khám Ngoại tổng hợp' },
  { STT: 5, MA_DICH_VU: '13.27', TEN_DICH_VU: 'Khám Phụ sản' },
  { STT: 6, MA_DICH_VU: '14.30', TEN_DICH_VU: 'Khám Mắt' },
  { STT: 7, MA_DICH_VU: '15.28', TEN_DICH_VU: 'Khám Tai mũi họng' },
  { STT: 8, MA_DICH_VU: '16.29', TEN_DICH_VU: 'Khám Răng hàm mặt' },
];
