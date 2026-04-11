/**
 * Gộp file Excel phác đồ CDSS với seed JSON: ưu tiên nội dung Excel cho trùng mã ICD;
 * khử trùng mã ICD trong seed (giữ dòng chi tiết nhất).
 *
 * Usage:
 *   node scripts/rebuild_phac_do_cdss_seed.mjs "C:/path/FileMau_PhacDo_CDSS.xlsx"
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import XLSX from 'xlsx';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const mod = await import(pathToFileURL(path.join(root, 'ma_nguon/chuyen_mon/phac_do_benh_vien/phac_do_cdss_columns.js')).href);
const {
  loaiTrungMaIcdUuTienNoiDung,
  gopPhacDoImportVoiDuLieuHienTai,
  COT_MAC_DINH_PHAC_DO_CDSS,
  laDongMauTemplatePhacDo,
} = mod;

const excelPath = process.argv[2];
if (!excelPath || !fs.existsSync(excelPath)) {
  console.error('Cần đường dẫn file .xlsx tồn tại.');
  process.exit(1);
}

const seedPath = path.join(root, 'ma_nguon/chuyen_mon/phac_do_benh_vien/du_lieu_phac_do_cdss_guidelines.seed.json');
const seed = JSON.parse(fs.readFileSync(seedPath, 'utf8'));

const wb = XLSX.readFile(excelPath);
const sheetName = wb.SheetNames.includes('Template') ? 'Template' : wb.SheetNames[0];
const rawRows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { defval: '' });

const { chuanHoaDongImportPhacDo } = mod;

const excelRows = rawRows
  .map((row, i) => {
    const clean = chuanHoaDongImportPhacDo(row);
    return { ...clean, id: clean.id || `pd-import-${i + 1}` };
  })
  .filter((r) => !laDongMauTemplatePhacDo(r));
const excelDedup = loaiTrungMaIcdUuTienNoiDung(excelRows);

const seedDedup = loaiTrungMaIcdUuTienNoiDung(Array.isArray(seed.data) ? seed.data : []).filter(
  (r) => !laDongMauTemplatePhacDo(r),
);

const merged = gopPhacDoImportVoiDuLieuHienTai(seedDedup, excelDedup, {
  uuTienFileMoi: true,
  loaiTenBenhTrung: false,
});

const columns = Array.isArray(seed.columns) && seed.columns.length ? seed.columns : [...COT_MAC_DINH_PHAC_DO_CDSS];

const baseName = path.basename(excelPath);
const out = {
  version: new Date().toISOString().slice(0, 10),
  source: baseName,
  columns,
  data: merged,
};

fs.writeFileSync(seedPath, JSON.stringify(out), 'utf8');
console.log('Đã ghi', seedPath, '| dòng:', merged.length, '| file:', baseName);
