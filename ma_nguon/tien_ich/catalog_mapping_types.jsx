/**
 * Đặc tả: DacTaKyThuat_MappingDanhMuc v1.0 — mapping_type_config + tham chiếu danh mục nội bộ (AsyncStorage).
 * Tên catalog theo spec (employees, dvkt_items, …); storageKey là khóa tab trong Quản lý danh mục.
 */

export const CATALOG_REF = {
  employees: { storageKey: 'DANH_MUC_NHAN_SU', codeFields: ['MA_BHXH', 'MACCHN'], nameFields: ['HO_TEN'] },
  dvkt_items: { storageKey: 'DANH_MUC_DVKT_M05', codeFields: ['MA_DICH_VU', 'MA_TUONG_DUONG'], nameFields: ['TEN_DICH_VU', 'TEN_DVKT_GIA'] },
  /** ICD-10 đầy đủ — cột theo mẫu FileMau DANH_MUC_ICD10 */
  icd10: {
    storageKey: 'DANH_MUC_ICD10',
    codeFields: ['MÃ BỆNH', 'MÃ BỆNH KHÔNG DẤU'],
    nameFields: ['TÊN BỆNH', 'DISEASE NAME'],
  },
  /** Thuốc — Mẫu 03 */
  drug_items: {
    storageKey: 'DANH_MUC_THUOC_MAU_M03',
    codeFields: ['MA_THUOC'],
    nameFields: ['TEN_THUOC', 'TEN_HOAT_CHAT'],
  },
  /** Vật tư y tế — Mẫu 04 */
  vtyt_items: {
    storageKey: 'DANH_MUC_VAT_TU_M04',
    codeFields: ['MA_VAT_TU', 'MA_VTYT'],
    nameFields: ['TEN_VAT_TU', 'NHOM_VAT_TU'],
  },
  /** Tập mã PHAN_LOAI_PTTT suy ra từ DVKT M05 — không còn mapping DVKT→PTTT riêng */
  surgery_types: { storageKey: null, codeFields: ['PHAN_LOAI_PTTT'], nameFields: [] },
  bed_types: { storageKey: 'DANH_MUC_GIUONG_BAN_KHAM_BV', codeFields: ['MA_TUONG_DUONG'], nameFields: ['TEN_DVKT_PHEDUYET', 'TEN_DVKT_GIA'] },
  equipments: { storageKey: 'DANH_MUC_TRANG_THIET_BI_M06', codeFields: ['MA_MAY'], nameFields: ['TEN_TB', 'KY_HIEU'] },
};

/** Theo mục 2.4 đặc tả */
export const MAPPING_TYPE_CONFIG = [
  {
    mapping_type: 'STAFF_DVKT',
    display_name: 'Nhân viên → DVKT',
    source_catalog: 'employees',
    target_catalog: 'dvkt_items',
    cardinality: 'M:N',
    allow_overlap: true,
    require_approval: true,
    is_active: true,
  },
  {
    mapping_type: 'SURGERY_BED',
    display_name: 'Phân loại PT → Giường bệnh',
    source_catalog: 'surgery_types',
    target_catalog: 'bed_types',
    cardinality: 'M:N',
    allow_overlap: true,
    require_approval: true,
    is_active: true,
  },
  {
    mapping_type: 'STAFF_EQUIPMENT',
    display_name: 'Nhân viên → Máy / thiết bị',
    source_catalog: 'employees',
    target_catalog: 'equipments',
    cardinality: 'M:N',
    allow_overlap: true,
    require_approval: false,
    is_active: true,
  },
  {
    mapping_type: 'DVKT_EQUIPMENT',
    display_name: 'DVKT → Máy / thiết bị',
    source_catalog: 'dvkt_items',
    target_catalog: 'equipments',
    cardinality: 'M:N',
    allow_overlap: true,
    require_approval: false,
    is_active: true,
  },
  {
    mapping_type: 'ICD_DRUG',
    display_name: 'ICD-10 → Danh mục thuốc (M03)',
    source_catalog: 'icd10',
    target_catalog: 'drug_items',
    cardinality: 'M:N',
    allow_overlap: true,
    require_approval: true,
    is_active: true,
  },
  {
    mapping_type: 'ICD_DVKT',
    display_name: 'ICD-10 → DVKT (M05)',
    source_catalog: 'icd10',
    target_catalog: 'dvkt_items',
    cardinality: 'M:N',
    allow_overlap: true,
    require_approval: true,
    is_active: true,
  },
  {
    mapping_type: 'DVKT_DRUG',
    display_name: 'DVKT (M05) → Thuốc (M03)',
    source_catalog: 'dvkt_items',
    target_catalog: 'drug_items',
    cardinality: 'M:N',
    allow_overlap: true,
    require_approval: false,
    is_active: true,
  },
  {
    mapping_type: 'DVKT_VTYT',
    display_name: 'DVKT (M05) → VTYT (M04)',
    source_catalog: 'dvkt_items',
    target_catalog: 'vtyt_items',
    cardinality: 'M:N',
    allow_overlap: true,
    require_approval: false,
    is_active: true,
  },
  {
    mapping_type: 'ICD_VTYT',
    display_name: 'ICD-10 → VTYT (M04)',
    source_catalog: 'icd10',
    target_catalog: 'vtyt_items',
    cardinality: 'M:N',
    allow_overlap: true,
    require_approval: true,
    is_active: true,
  },
];

/** Một bản ghi có thể gắn nhiều mã đích (lưu target_code dạng "A; B; C" + metadata.target_codes). */
export const MAPPING_LOAI_NHIEU_MA_DICH = [
  'ICD_DRUG',
  'ICD_DVKT',
  'DVKT_DRUG',
  'DVKT_VTYT',
  'ICD_VTYT',
  /** Nhân viên → nhiều máy / thiết bị; DVKT → nhiều máy (M:N qua nhiều mã đích trên một dòng). */
  'STAFF_EQUIPMENT',
  'DVKT_EQUIPMENT',
];

export const laMappingNhieuMaDich = (mappingType) =>
  MAPPING_LOAI_NHIEU_MA_DICH.includes(String(mappingType || '').trim());

/** Nhiều mã nguồn trên một bản ghi: ICD dùng metadata.source_icd_codes; nhân viên/DVKT↔máy dùng metadata.source_codes. */
export const MAPPING_LOAI_NHIEU_MA_NGUON_ICD = ['ICD_DRUG', 'ICD_DVKT', 'ICD_VTYT'];

export const MAPPING_LOAI_NHIEU_MA_NGUON = [
  ...MAPPING_LOAI_NHIEU_MA_NGUON_ICD,
  'STAFF_EQUIPMENT',
  'DVKT_EQUIPMENT',
];

export const laMappingNhieuMaNguon = (mappingType) =>
  MAPPING_LOAI_NHIEU_MA_NGUON.includes(String(mappingType || '').trim());

export const laMappingNhieuMaNguonIcd = (mappingType) =>
  MAPPING_LOAI_NHIEU_MA_NGUON_ICD.includes(String(mappingType || '').trim());

export const layCauHinhLoaiMapping = (mappingType) =>
  MAPPING_TYPE_CONFIG.find((x) => x.mapping_type === mappingType) || null;

export const LAY_MAPPING_TYPE_OPTIONS = [{ value: '', label: 'Tất cả loại' }].concat(
  MAPPING_TYPE_CONFIG.map((c) => ({ value: c.mapping_type, label: `${c.mapping_type} — ${c.display_name}` })),
);
