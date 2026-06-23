#!/usr/bin/env node
/**
 * Thay toàn bộ phụ lục nội bộ PC Cần Thơ từ 6 file Excel BHYT/PC CT.
 *
 *   node scripts/build_phuluc_pc_can_tho.mjs
 *   node scripts/build_phuluc_pc_can_tho.mjs --dir="C:/path/to/PC CT"
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import XLSX from 'xlsx';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const DEFAULT_PC_CT_DIR = 'C:/Users/admin/Documents/Google Drive/BHYT/PC CT';
const MA_CSKCB = 92114;

const FILES = {
  dvkt: 'FileDichVuBV (1).xlsx',
  thuoc: 'FileDanhMucThuoc.xlsx',
  vtyt: 'FileVatTuYTe.xlsx',
  nhanSu: 'FileNhanVienYTe.xlsx',
  thietBi: 'FileTrangThietBi.xlsx',
  khoa: 'FileKhoaPhongGiuong.xlsx',
};

const OUT = {
  dvkt: path.join(ROOT, 'ma_nguon/thanh_phan/dich_vu_ky_thuat.jsx'),
  thuoc: path.join(ROOT, 'ma_nguon/thanh_phan/thuoc_mau_cp.jsx'),
  vtyt: path.join(ROOT, 'ma_nguon/thanh_phan/vat_tu_y_te.jsx'),
  nhanSu: path.join(ROOT, 'ma_nguon/thanh_phan/nhan_su.jsx'),
  thietBi: path.join(ROOT, 'ma_nguon/thanh_phan/trang_thiet_bi.jsx'),
  khoa: path.join(ROOT, 'ma_nguon/thanh_phan/dm_khoals_m01dm.jsx'),
  mapping: path.join(ROOT, 'ma_nguon/thanh_phan/mapping_nguoi_hanh_nghe.jsx'),
  phamvi: path.join(ROOT, 'ma_nguon/tien_ich/dvkt_phamvi_mapping_seed.jsx'),
};

const DVKT_OUTPUT_COLUMNS = [
  'STT', 'MA_DICH_VU', 'TEN_DICH_VU', 'TEN_DVKT_GIA', 'DON_GIA', 'QUY_TRINH', 'CS_THUCHIEN',
  'TINHTRANG_DV', 'MA_GIA', 'TEN_GIA', 'GIA_TT_BHYT', 'MA_PTTT', 'TU_NGAY', 'DEN_NGAY',
  'MA_CSKCB', 'PHAN_LOAI_PTTT', 'MA_NHOM', 'GHICHU', 'QUYET_DINH',
];

const NHOM_DVKT_LABELS = {
  '01': 'Hồi sức cấp cứu',
  '02': 'Nội soi chẩn đoán & can thiệp',
  '03': 'Phẫu thuật đa chuyên khoa',
  '04': 'Ngoại lao',
  '05': 'Da liễu',
  '07': 'Nội tiết - ĐTĐ',
  '09': 'Hồi sức tích cực',
  '10': 'Ngoại khoa',
  '11': 'Bỏng',
  '12': 'Ung bướu',
  '13': 'Phụ sản',
  '14': 'Mắt',
  '15': 'Tai mũi họng',
  '16': 'Răng hàm mặt',
  '17': 'Chẩn đoán hình ảnh',
  '18': 'Chẩn đoán hình ảnh',
  '20': 'Nội soi chẩn đoán',
  '21': 'Thăm dò chức năng',
  '22': 'Huyết học - Truyền máu',
  '23': 'Hóa sinh',
  '24': 'Vi sinh',
  '25': 'Giải phẫu bệnh',
  '26': 'Khác',
  '27': 'Phẫu thuật nội soi',
  '28': 'Tạo hình / Vi phẫu',
  K03: 'Nội khoa',
  K18: 'Ngoại khoa',
  K19: 'Chẩn đoán hình ảnh',
  K27: 'Phụ sản',
  K30: 'Mắt',
};

const PREFIX_CROSS_KHOA = {
  '02': ['K03'],
  '03': ['K18'],
  '10': ['K19'],
  '13': ['K27'],
  '14': ['K30'],
  '15': ['K28'],
  '16': ['K41'],
};

const TECH_PREFIXES = new Set(['07', '09', '11', '12', '13', '17', '18', '20', '21', '22', '23', '24', '25', '26', '27', '28']);

const parseCli = () => {
  const out = { dir: DEFAULT_PC_CT_DIR };
  process.argv.slice(2).forEach((arg) => {
    if (arg.startsWith('--dir=')) out.dir = arg.slice('--dir='.length);
  });
  return out;
};

const today = () => new Date().toISOString().slice(0, 10);

const escapeVal = (v) => {
  if (v === null || v === undefined || v === '') return '""';
  if (typeof v === 'number') return String(v);
  if (typeof v === 'boolean') return String(v);
  return JSON.stringify(String(v));
};

const rowToJsObject = (row, columns, indent = '  ') => {
  const keys = columns || Object.keys(row);
  const lines = keys.map((k) => `${indent}  ${JSON.stringify(k)}: ${escapeVal(row[k])}`);
  return `\n${indent}{\n${lines.join(',\n')}\n${indent}}`;
};

const readExcelRows = (filePath) => {
  const wb = XLSX.readFile(filePath);
  const sheetName = wb.SheetNames[0];
  return XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { defval: '' });
};

const excelDateToYmd = (v) => {
  if (v === null || v === undefined || v === '') return '';
  if (typeof v === 'string') {
    const raw = v.trim();
    if (!raw) return '';
    if (/^\d{8}$/.test(raw)) return raw;
    if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.replace(/-/g, '').slice(0, 8);
    return raw;
  }
  const n = Number(v);
  if (!Number.isFinite(n) || n < 2000) return String(v ?? '');
  const epoch = Date.UTC(1899, 11, 30);
  const d = new Date(epoch + n * 86400000);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}${m}${day}`;
};

const normalizeDvktCode = (value) => {
  if (value === null || value === undefined) return '';
  const raw = String(value).trim().replace(/\s+/g, '');
  if (!raw) return '';
  if (/^K\d+/i.test(raw)) return raw.toUpperCase();
  const normalizedSeparators = /^[0-9.,]+$/.test(raw) ? raw.replace(/,/g, '.') : raw;
  if (/^\d+(\.\d+)+$/.test(normalizedSeparators)) {
    const parts = normalizedSeparators.split('.');
    parts[0] = parts[0].padStart(2, '0');
    return parts.join('.');
  }
  return normalizedSeparators;
};

const toNumOrText = (v) => {
  if (v === null || v === undefined) return '';
  if (typeof v === 'number') return Number.isFinite(v) ? v : '';
  const raw = String(v).trim();
  if (!raw) return '';
  if (/^-?\d+(\.\d+)?$/.test(raw)) {
    const n = Number(raw);
    return Number.isFinite(n) ? n : raw;
  }
  return raw;
};

const dvktPrefix = (ma) => {
  const s = String(ma || '').trim();
  const km = s.match(/^(K\d+)/i);
  if (km) return km[1].toUpperCase();
  const dot = s.indexOf('.');
  if (dot > 0) return s.slice(0, dot).padStart(2, '0');
  return s.padStart(2, '0');
};

const parseScopeList = (s) => String(s || '')
  .split(/[,;|.]/)
  .map((x) => x.trim())
  .filter((x) => /^\d+$/.test(x));

const extractStaffPrefixTokens = (maKhoa) => {
  const tokens = String(maKhoa || '').split(/[;,]/).map((t) => t.trim()).filter(Boolean);
  const prefixes = new Set();
  tokens.forEach((t) => {
    const km = t.match(/^(K\d+)/i);
    if (km) prefixes.add(km[1].toUpperCase());
    const m = t.match(/^(\d{2})(?:\.(\d{2}))?/);
    if (m) prefixes.add(m[1]);
  });
  return prefixes;
};

const writeSeedFile = ({
  outFile,
  versionConst,
  colsConst,
  dataConst,
  version,
  columns,
  rows,
  headerLines,
}) => {
  const colsLiteral = columns.map((c) => `  ${JSON.stringify(c)}`).join(',\n');
  const rowsLiteral = rows
    .map((row, idx) => `${rowToJsObject(row, columns, '  ')}${idx < rows.length - 1 ? ',' : ''}`)
    .join('');

  const fileContent = [
    '/**',
    ...headerLines.map((line) => ` * ${line}`),
    ` * Cap nhat: ${today()}`,
    ' */',
    '',
    `export const ${versionConst} = '${version}';`,
    '',
    `export const ${colsConst} = [`,
    colsLiteral,
    '];',
    '',
    `export const ${dataConst} = [`,
    rowsLiteral,
    '];',
    '',
  ].join('\n');

  fs.writeFileSync(outFile, fileContent, 'utf8');
};

const mapCongKhamToDvkt = (row, stt) => {
  const donGia = toNumOrText(row.DON_GIA);
  const phanLoai = toNumOrText(row.PHAN_LOAI_PTTT);
  const csParts = [row.CSKCB_CGKT, row.CSKCB_CLS].map((v) => String(v || '').trim()).filter(Boolean);
  const csText = csParts.join('; ');
  const out = {};
  DVKT_OUTPUT_COLUMNS.forEach((col) => { out[col] = ''; });
  Object.assign(out, {
    STT: stt,
    MA_DICH_VU: normalizeDvktCode(row.MA_TUONG_DUONG || row.MA_DICH_VU),
    TEN_DICH_VU: toNumOrText(row.TEN_DVKT_PHEDUYET || row.TEN_DICH_VU),
    TEN_DVKT_GIA: toNumOrText(row.TEN_DVKT_GIA || row.TEN_DVKT_PHEDUYET),
    DON_GIA: donGia,
    QUY_TRINH: csText,
    CS_THUCHIEN: csText,
    TINHTRANG_DV: toNumOrText(row.TINHTRANG_DV) || '1',
    MA_GIA: toNumOrText(row.ID || row.MA_GIA),
    TEN_GIA: toNumOrText(row.TEN_GIA),
    GIA_TT_BHYT: toNumOrText(row.GIA_TT_BHYT) || donGia,
    MA_PTTT: toNumOrText(row.MA_PTTT),
    TU_NGAY: toNumOrText(row.TUNGAY || row.TU_NGAY),
    DEN_NGAY: toNumOrText(row.DENNGAY || row.DEN_NGAY),
    MA_CSKCB: toNumOrText(row.MA_CSKCB) || MA_CSKCB,
    PHAN_LOAI_PTTT: phanLoai,
    MA_NHOM: toNumOrText(row.MA_NHOM) || (phanLoai ? `PTTT-${phanLoai}` : 'DVKT'),
    GHICHU: toNumOrText(row.GHICHU),
    QUYET_DINH: toNumOrText(row.QUYET_DINH),
  });
  return out;
};

const buildDvkt = (rows, sourcePath) => {
  const merged = rows
    .map((row, idx) => mapCongKhamToDvkt(row, idx + 1))
    .filter((row) => row.MA_DICH_VU);
  merged.sort((a, b) => String(a.MA_DICH_VU).localeCompare(String(b.MA_DICH_VU)));
  merged.forEach((row, idx) => { row.STT = idx + 1; });

  const version = `${today()}-pc-can-tho-dvkt-${merged.length}`;
  writeSeedFile({
    outFile: OUT.dvkt,
    versionConst: 'PHIEN_BAN_DANH_MUC_DVKT_M05',
    colsConst: 'COT_DANH_MUC_DVKT_M05',
    dataConst: 'DANH_MUC_DVKT_M05',
    version,
    columns: DVKT_OUTPUT_COLUMNS,
    rows: merged,
    headerLines: [
      'Seed danh muc dich vu ky thuat noi bo (Mau 05 — DANH_MUC_DVKT_M05).',
      `Nguon: ${sourcePath.replace(/\\/g, '\\\\')}`,
      `MA_CSKCB mac dinh: ${MA_CSKCB}`,
    ],
  });
  return merged;
};

const normalizeThuocRow = (row, stt) => ({
  ...row,
  STT: stt,
  DON_GIA_TT: row.DON_GIA_TT ?? row.DON_GIA ?? '',
  GIA_BH_TT: row.GIA_BH_TT ?? row.DON_GIA_BH ?? row.DON_GIA ?? '',
  DEN_NGAY: row.DEN_NGAY || row.DENNGAY || '',
  MA_CSKCB: row.MA_CSKCB || MA_CSKCB,
});

const buildThuoc = (rows, sourcePath) => {
  const normalized = rows.map((row, idx) => normalizeThuocRow(row, idx + 1));
  const columns = [...new Set(normalized.flatMap((r) => Object.keys(r)))];
  const version = `${today()}-pc-can-tho-m03-${normalized.length}`;
  writeSeedFile({
    outFile: OUT.thuoc,
    versionConst: 'PHIEN_BAN_DANH_MUC_THUOC_MAU_M03',
    colsConst: 'COT_DANH_MUC_THUOC_MAU_M03',
    dataConst: 'DANH_MUC_THUOC_MAU_M03',
    version,
    columns,
    rows: normalized,
    headerLines: [
      'Seed danh muc thuoc noi bo (Mau 03).',
      `Nguon: ${sourcePath.replace(/\\/g, '\\\\')}`,
    ],
  });
  return normalized;
};

const buildVtyt = (rows, sourcePath) => {
  const normalized = rows.map((row, idx) => ({
    STT: idx + 1,
    MA_VAT_TU: row.MA_VAT_TU,
    NHOM_VAT_TU: row.NHOM_VAT_TU,
    TEN_VAT_TU: row.TEN_VAT_TU,
    MA_HIEU: row.MA_HIEU,
    SO_LUU_HANH: row.SO_LUU_HANH || '',
    TINHNANG_KT: row.TINHNANG_KT || '',
    QUY_CACH: row.QUY_CACH,
    DON_VI_TINH: row.DON_VI_TINH,
    DON_GIA: row.DON_GIA,
    DON_GIA_BH: row.DON_GIA_BH,
    TYLE_TT_BH: row.TYLE_TT_BH || 100,
    NHA_SX: row.NHA_SX || row.HANG_SX || '',
    NUOC_SX: row.NUOC_SX,
    NHA_THAU: row.NHA_THAU,
    QD_THAU: row.QD_THAU || row.TT_THAU || '',
    TU_NGAY_HD: row.TU_NGAY_HD || row.TU_NGAY || '',
    DEN_NGAY_HD: row.DEN_NGAY_HD || row.DENNGAY || '',
    LOAI_THAU: row.LOAI_THAU,
    HT_THAU: row.HT_THAU || '',
    TT_THAU: row.TT_THAU || '',
    MA_CSKCB_THAU: row.MA_CSKCB_THAU || '',
    MA_CSKCB_CHUYEN: row.MA_CSKCB_CHUYEN || '',
    TU_NGAY: row.TU_NGAY || '',
    DEN_NGAY: row.DEN_NGAY || row.DENNGAY || '',
    MA_CSKCB: row.MA_CSKCB || MA_CSKCB,
    ID: row.ID,
  }));

  const columns = Object.keys(normalized[0] || {});
  const version = `${today()}-pc-can-tho-m04-${normalized.length}`;
  writeSeedFile({
    outFile: OUT.vtyt,
    versionConst: 'PHIEN_BAN_DANH_MUC_VAT_TU_M04',
    colsConst: 'COT_DANH_MUC_VAT_TU_M04',
    dataConst: 'DANH_MUC_VAT_TU_M04',
    version,
    columns,
    rows: normalized,
    headerLines: [
      'Seed danh muc vat tu y te noi bo (Mau 04).',
      `Nguon: ${sourcePath.replace(/\\/g, '\\\\')}`,
    ],
  });
  return normalized;
};

const buildNhanSu = (rows, sourcePath) => {
  const normalized = rows.map((row, idx) => ({
    ...row,
    STT: row.STT || idx + 1,
    NGAYCAP_CCHN: excelDateToYmd(row.NGAYCAP_CCHN),
    TU_NGAY: excelDateToYmd(row.TU_NGAY),
    DEN_NGAY: excelDateToYmd(row.DEN_NGAY),
    NOICAP_CCHN: row.NOICAP_CCHN || 'Sở Y tế Cần Thơ',
  }));
  const columns = [...new Set(normalized.flatMap((r) => Object.keys(r)))];
  const version = `${today()}-pc-can-tho-nvyt-${normalized.length}`;
  writeSeedFile({
    outFile: OUT.nhanSu,
    versionConst: 'PHIEN_BAN_DANH_MUC_NHAN_SU',
    colsConst: 'COT_DANH_MUC_NHAN_SU',
    dataConst: 'DANH_MUC_NHAN_SU',
    version,
    columns,
    rows: normalized,
    headerLines: [
      'Seed danh muc nhan su noi bo (Mau 02).',
      `Nguon: ${sourcePath.replace(/\\/g, '\\\\')}`,
    ],
  });
  return normalized;
};

const buildThietBi = (rows, sourcePath) => {
  const columns = [
    'STT', 'TEN_TB', 'KY_HIEU', 'CONGTY_SX', 'NUOC_SX', 'NAM_SX', 'NAM_SD',
    'MA_MAY', 'SO_LUU_HANH', 'HD_TU', 'HD_DEN', 'TU_NGAY', 'DEN_NGAY', 'MA_CSKCB', 'ID',
  ];
  const normalized = rows.map((row, idx) => ({
    STT: idx + 1,
    TEN_TB: row.TEN_TB,
    KY_HIEU: row.KY_HIEU,
    CONGTY_SX: row.CONGTY_SX,
    NUOC_SX: row.NUOC_SX,
    NAM_SX: row.NAM_SX,
    NAM_SD: row.NAM_SD,
    MA_MAY: row.MA_MAY,
    SO_LUU_HANH: row.SO_LUU_HANH,
    HD_TU: excelDateToYmd(row.HD_TU),
    HD_DEN: excelDateToYmd(row.HD_DEN),
    TU_NGAY: excelDateToYmd(row.TU_NGAY),
    DEN_NGAY: excelDateToYmd(row.DEN_NGAY),
    MA_CSKCB: row.MA_CSKCB || MA_CSKCB,
    ID: row.ID,
  }));
  const version = `${today()}-pc-can-tho-m06-${normalized.length}`;
  writeSeedFile({
    outFile: OUT.thietBi,
    versionConst: 'PHIEN_BAN_DANH_MUC_TRANG_THIET_BI_M06',
    colsConst: 'COT_DANH_MUC_TRANG_THIET_BI_M06',
    dataConst: 'DANH_MUC_TRANG_THIET_BI_M06',
    version,
    columns,
    rows: normalized,
    headerLines: [
      'Seed danh muc trang thiet bi noi bo (Mau 06).',
      `Nguon: ${sourcePath.replace(/\\/g, '\\\\')}`,
    ],
  });
  return normalized;
};

const buildKhoa = (rows, sourcePath) => {
  const columns = [
    'STT', 'MA_KHOA', 'TEN_KHOA', 'BAN_KHAM', 'GIUONG_PD', 'GIUONG_TK', 'GIUONG_HSTC', 'GIUONG_HSCC',
    'TU_NGAY', 'DEN_NGAY', 'MA_CSKCB', 'ID', 'MA_LOAI_KCB', 'LDLK', 'LIEN_KHOA', 'GIUONG_2015',
  ];
  const normalized = rows.map((row, idx) => ({
    STT: idx + 1,
    MA_KHOA: row.MA_KHOA,
    TEN_KHOA: row.TEN_KHOA,
    BAN_KHAM: row.BAN_KHAM,
    GIUONG_PD: row.GIUONG_PD,
    GIUONG_TK: row.GIUONG_TK,
    GIUONG_HSTC: row.GIUONG_HSTC,
    GIUONG_HSCC: row.GIUONG_HSCC,
    TU_NGAY: excelDateToYmd(row.TU_NGAY),
    DEN_NGAY: excelDateToYmd(row.DEN_NGAY),
    MA_CSKCB: row.MA_CSKCB || MA_CSKCB,
    ID: row.ID,
    MA_LOAI_KCB: row.MA_LOAI_KCB,
    LDLK: row.LDLK,
    LIEN_KHOA: row.LIEN_KHOA,
    GIUONG_2015: row.GIUONG_2015 || '',
  }));
  const version = `${today()}-pc-can-tho-m01-${normalized.length}`;
  writeSeedFile({
    outFile: OUT.khoa,
    versionConst: 'PHIEN_BAN_DANH_MUC_KHOA_LS_M01',
    colsConst: 'COT_DANH_MUC_KHOA_LS_M01',
    dataConst: 'DANH_MUC_KHOA_LS_M01',
    version,
    columns,
    rows: normalized,
    headerLines: [
      'Seed danh muc khoa lam sang, ban kham va giuong noi bo (Mau 01).',
      `Nguon: ${sourcePath.replace(/\\/g, '\\\\')}`,
    ],
  });
  return normalized;
};

const staffMatchesDepartment = (staff, dvktMa, prefix) => {
  const ma = String(dvktMa).trim();
  const parts = String(staff.MA_KHOA || '').split(/[;,]/).map((t) => t.trim()).filter(Boolean);
  if (parts.some((p) => p.toUpperCase() === ma.toUpperCase())) return true;
  const tokens = extractStaffPrefixTokens(staff.MA_KHOA);
  if (tokens.has(prefix)) return true;
  const cross = PREFIX_CROSS_KHOA[prefix] || [];
  if (cross.some((k) => tokens.has(k))) return true;
  return false;
};

const buildPrefixScopeIndex = (staffRows, dvktRows) => {
  const prefixScopes = new Map();
  const addScope = (prefix, scope, chucDanh) => {
    if (!scope) return;
    if (!prefixScopes.has(prefix)) prefixScopes.set(prefix, new Map());
    const sm = prefixScopes.get(prefix);
    if (!sm.has(scope)) sm.set(scope, new Set());
    if (chucDanh) sm.get(scope).add(String(chucDanh));
  };

  staffRows.forEach((staff) => {
    const scopes = [...parseScopeList(staff.PHAMVI_CM), ...parseScopeList(staff.PHAMVI_CMBS)];
    const chucDanh = String(staff.CHUCDANH_NN || '').trim();
    extractStaffPrefixTokens(staff.MA_KHOA).forEach((pfx) => {
      scopes.forEach((sc) => addScope(pfx, sc, chucDanh));
    });
  });

  const allPrefixes = new Set(dvktRows.map((r) => dvktPrefix(r.MA_DICH_VU)));
  const doctors = staffRows.filter((s) => String(s.CHUCDANH_NN) === '1');
  const techStaff = staffRows.filter((s) => parseScopeList(s.PHAMVI_CM).some((sc) => sc.startsWith('5')));

  allPrefixes.forEach((prefix) => {
    const sm = prefixScopes.get(prefix);
    if (sm && sm.size > 0) return;
    const pool = TECH_PREFIXES.has(prefix) ? [...doctors, ...techStaff] : doctors;
    pool.forEach((staff) => {
      [...parseScopeList(staff.PHAMVI_CM), ...parseScopeList(staff.PHAMVI_CMBS)].forEach((sc) => {
        addScope(prefix, sc, staff.CHUCDANH_NN || '1');
      });
    });
  });

  return prefixScopes;
};

const buildPhamviMapping = (prefixScopes, sourceNote) => {
  const rows = [];
  prefixScopes.forEach((scopeMap, prefix) => {
    const nhom = NHOM_DVKT_LABELS[prefix] || `Nhóm DVKT ${prefix}`;
    scopeMap.forEach((titles, scope) => {
      titles.forEach((chucDanh) => {
        rows.push({
          PREFIX_DVKT: prefix,
          PHAMVI_CM_OK: scope,
          CHUCDANH_NN_OK: chucDanh,
          NHOM_DVKT: nhom,
        });
      });
    });
  });
  rows.sort((a, b) => String(a.PREFIX_DVKT).localeCompare(String(b.PREFIX_DVKT))
    || String(a.PHAMVI_CM_OK).localeCompare(String(b.PHAMVI_CM_OK)));

  const columns = ['PREFIX_DVKT', 'PHAMVI_CM_OK', 'CHUCDANH_NN_OK', 'NHOM_DVKT'];
  const version = `${today()}-pc-can-tho-phamvi-${rows.length}`;
  writeSeedFile({
    outFile: OUT.phamvi,
    versionConst: 'PHIEN_BAN_DVKT_PHAMVI_MAPPING',
    colsConst: 'COT_DVKT_PHAMVI_MAPPING',
    dataConst: 'DU_LIEU_DVKT_PHAMVI_MAPPING',
    version,
    columns,
    rows,
    headerLines: [
      'Seed mapping pham vi hanh nghe DVKT — sinh tu danh muc nhan su + DVKT PC Can Tho.',
      sourceNote,
    ],
  });
  return rows;
};

const buildStaffMapping = (dvktRows, staffRows, prefixScopes, sourceNote) => {
  const columns = [
    'STT', 'MA_TUONG_DUONG', 'TEN_DVKT', 'MA_CHUYEN_KHOA', 'PHAMVI_CM_CAN',
    'SO_NV_DU_DIEU_KIEN', 'DANH_SACH_NGUOI_THUC_HIEN', 'DANH_SACH_MACCHN',
    'DANH_SACH_MA_BHXH', 'TRANG_THAI',
  ];

  const rows = dvktRows.map((dvkt, idx) => {
    const ma = dvkt.MA_DICH_VU;
    const prefix = dvktPrefix(ma);
    const scopeMap = prefixScopes.get(prefix) || new Map();
    const phamviCan = [...scopeMap.keys()].sort((a, b) => Number(a) - Number(b));

    const eligible = staffRows.filter((staff) => {
      if (!staffMatchesDepartment(staff, ma, prefix)) return false;
      const scopes = new Set([...parseScopeList(staff.PHAMVI_CM), ...parseScopeList(staff.PHAMVI_CMBS)]);
      if (phamviCan.length === 0) return true;
      if (scopes.size === 0) return String(staff.CHUCDANH_NN) !== '1';
      return phamviCan.some((sc) => scopes.has(sc));
    });

    const names = eligible.map((s) => String(s.HO_TEN || '').trim()).filter(Boolean);
    const macchn = eligible.map((s) => String(s.MACCHN || '').trim()).filter(Boolean);
    const maBhxh = eligible.map((s) => String(s.MA_BHXH || '').trim()).filter(Boolean);

    return {
      STT: String(idx + 1),
      MA_TUONG_DUONG: ma,
      TEN_DVKT: String(dvkt.TEN_DICH_VU || ''),
      MA_CHUYEN_KHOA: prefix,
      PHAMVI_CM_CAN: phamviCan.join(','),
      SO_NV_DU_DIEU_KIEN: String(eligible.length),
      DANH_SACH_NGUOI_THUC_HIEN: names.join('; '),
      DANH_SACH_MACCHN: macchn.join('; '),
      DANH_SACH_MA_BHXH: maBhxh.join('; '),
      TRANG_THAI: eligible.length > 0 ? 'CO_NGUOI_TH' : 'KHONG_NV',
    };
  });

  const version = `${today()}-pc-can-tho-mapping-${rows.length}`;
  writeSeedFile({
    outFile: OUT.mapping,
    versionConst: 'PHIEN_BAN_DANH_MUC_MAPPING_NGUOI_HANH_NGHE',
    colsConst: 'COT_DANH_MUC_MAPPING_NGUOI_HANH_NGHE',
    dataConst: 'DANH_MUC_MAPPING_NGUOI_HANH_NGHE',
    version,
    columns,
    rows,
    headerLines: [
      'Seed mapping DVKT voi nguoi hanh nghe — sinh tu danh muc nhan su + DVKT PC Can Tho.',
      sourceNote,
    ],
  });
  return rows;
};

const main = () => {
  const { dir } = parseCli();
  const resolvePath = (name) => path.join(dir, name);

  Object.entries(FILES).forEach(([key, file]) => {
    const full = resolvePath(file);
    if (!fs.existsSync(full)) throw new Error(`Thieu file nguon: ${full} (${key})`);
  });

  console.log('=== build_phuluc_pc_can_tho.mjs ===');
  console.log(`Thu muc nguon: ${dir}`);

  const dvktRaw = readExcelRows(resolvePath(FILES.dvkt));
  const thuocRaw = readExcelRows(resolvePath(FILES.thuoc));
  const vtytRaw = readExcelRows(resolvePath(FILES.vtyt));
  const nhanSuRaw = readExcelRows(resolvePath(FILES.nhanSu));
  const thietBiRaw = readExcelRows(resolvePath(FILES.thietBi));
  const khoaRaw = readExcelRows(resolvePath(FILES.khoa));

  const dvktRows = buildDvkt(dvktRaw, resolvePath(FILES.dvkt));
  const thuocRows = buildThuoc(thuocRaw, resolvePath(FILES.thuoc));
  const vtytRows = buildVtyt(vtytRaw, resolvePath(FILES.vtyt));
  const nhanSuRows = buildNhanSu(nhanSuRaw, resolvePath(FILES.nhanSu));
  const thietBiRows = buildThietBi(thietBiRaw, resolvePath(FILES.thietBi));
  const khoaRows = buildKhoa(khoaRaw, resolvePath(FILES.khoa));

  const prefixScopes = buildPrefixScopeIndex(nhanSuRows, dvktRows);
  const phamviRows = buildPhamviMapping(prefixScopes, `Nguon nhan su: ${resolvePath(FILES.nhanSu).replace(/\\/g, '\\\\')}`);
  const mappingRows = buildStaffMapping(
    dvktRows,
    nhanSuRows,
    prefixScopes,
    `Nguon DVKT: ${resolvePath(FILES.dvkt).replace(/\\/g, '\\\\')}`,
  );

  const manifest = {
    updated_at: new Date().toISOString(),
    source_dir: dir,
    ma_cskcb: MA_CSKCB,
    counts: {
      dvkt: dvktRows.length,
      thuoc: thuocRows.length,
      vtyt: vtytRows.length,
      nhan_su: nhanSuRows.length,
      thiet_bi: thietBiRows.length,
      khoa: khoaRows.length,
      phamvi_mapping: phamviRows.length,
      staff_mapping: mappingRows.length,
      mapping_co_nguoi_th: mappingRows.filter((r) => r.TRANG_THAI === 'CO_NGUOI_TH').length,
      mapping_khong_nv: mappingRows.filter((r) => r.TRANG_THAI === 'KHONG_NV').length,
    },
    outputs: OUT,
  };

  const manifestPath = path.join(ROOT, 'scripts/phuluc_pc_can_tho_manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');

  console.log('\nKet qua:');
  Object.entries(manifest.counts).forEach(([k, v]) => console.log(`  ${k}: ${v}`));
  console.log(`\nManifest: ${manifestPath}`);
  console.log('Xong.');
};

main();
