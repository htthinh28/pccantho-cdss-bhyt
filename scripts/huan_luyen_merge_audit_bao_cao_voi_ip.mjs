/**
 * Nối báo cáo vi phạm (export Excel DS_Loi) với hồ sơ GIAMDINHHS trong tai_nguyen/<sub>/
 * và kho phác đồ CDSS — phục vụ huấn luyện AI (không ghi PII: không tên BN, không số thẻ).
 *
 * Usage:
 *   node scripts/huan_luyen_merge_audit_bao_cao_voi_ip.mjs "C:/path/Bao_Cao_Vi_Pham_xxx.xlsx" ip
 *
 * Output: tai_lieu/_huan_luyen_merge_audit_neo_ip.json (nên gitignore nếu chứa MA_LK nội bộ)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import XLSX from 'xlsx';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

function walkXml(dir, base = '') {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = base ? `${base}/${name.name}` : name.name;
    const full = path.join(dir, name.name);
    if (name.isDirectory()) {
      out.push(...walkXml(full, rel));
    } else if (name.isFile() && name.name.toLowerCase().endsWith('.xml')) {
      out.push({ full, rel: rel.replace(/\\/g, '/') });
    }
  }
  return out;
}

function trichTuGiamDinhHs(raw) {
  let ma_lk = '';
  const mCskcb = raw.match(/<MACSKCB>([^<]*)<\/MACSKCB>/i);
  const ma_cskcb = mCskcb ? mCskcb[1].trim() : '';
  const mBlock = raw.match(/<LOAIHOSO>XML1<\/LOAIHOSO>\s*<NOIDUNGFILE>([^<]+)<\/NOIDUNGFILE>/i);
  if (!mBlock) {
    return { ma_lk: '', ma_cskcb, ma_loai_kcb: '', ma_benh_chinh: '', loi: 'khong_tim_thay_XML1' };
  }
  let inner = '';
  try {
    inner = Buffer.from(mBlock[1].trim(), 'base64').toString('utf8');
  } catch {
    return { ma_lk: '', ma_cskcb, ma_loai_kcb: '', ma_benh_chinh: '', loi: 'base64_loi' };
  }
  const mLk = inner.match(/<MA_LK>([^<]*)<\/MA_LK>/i);
  if (mLk) ma_lk = mLk[1].trim();
  const mLkcb = inner.match(/<MA_LOAI_KCB>([^<]*)<\/MA_LOAI_KCB>/i);
  const mBenh = inner.match(/<MA_BENH_CHINH>([^<]*)<\/MA_BENH_CHINH>/i);
  return {
    ma_lk,
    ma_cskcb,
    ma_loai_kcb: mLkcb ? mLkcb[1].trim() : '',
    ma_benh_chinh: mBenh ? mBenh[1].trim() : '',
    loi: ma_lk ? '' : 'khong_doc_duoc_MA_LK',
  };
}

const xlsxPath = process.argv[2];
const sub = String(process.argv[3] || 'ip')
  .trim()
  .replace(/\\/g, '/')
  .replace(/^\/+|\/+$/g, '');
if (!xlsxPath || !fs.existsSync(xlsxPath)) {
  console.error('Thiếu file .xlsx hoặc không tồn tại.');
  process.exit(1);
}

const xmlDir = path.join(root, 'tai_nguyen', ...sub.split('/'));
if (!fs.existsSync(xmlDir)) {
  console.error('Không có thư mục:', xmlDir);
  process.exit(1);
}

const mod = await import(
  pathToFileURL(path.join(root, 'ma_nguon/chuyen_mon/phac_do_benh_vien/phac_do_cdss_columns.js')).href,
);
const { chuanHoaMaIcdPhacDoCdss } = mod;

const seedPath = path.join(root, 'ma_nguon/chuyen_mon/phac_do_benh_vien/du_lieu_phac_do_cdss_guidelines.seed.json');
const seed = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
const phacDoIcd = new Set(
  (Array.isArray(seed.data) ? seed.data : [])
    .map((r) => chuanHoaMaIcdPhacDoCdss(r?.['MÃ ICD-10']))
    .filter(Boolean),
);

const wb = XLSX.readFile(xlsxPath);
const sheet = wb.SheetNames.includes('DS_Loi') ? 'DS_Loi' : wb.SheetNames[0];
const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheet], { defval: '' });

const maLkKey = 'Mã LK';
const maLuatKey = 'Mã luật';

const byRule = new Map();
const byLk = new Map();

rows.forEach((row) => {
  const lk = String(row[maLkKey] ?? '').trim();
  const rule = String(row[maLuatKey] ?? '').trim();
  if (!lk) return;
  byRule.set(rule, (byRule.get(rule) || 0) + 1);
  if (!byLk.has(lk)) byLk.set(lk, []);
  byLk.get(lk).push({
    ma_luat: rule,
    ten_quy_tac: String(row['Tên quy tắc'] ?? '').trim(),
    canh_bao_rut_gon: String(String(row['Cảnh báo'] ?? '').trim()).slice(0, 500),
  });
});

const totalRows = rows.length;
const uniqueLk = byLk.size;

const lkFromXml = new Map();
for (const { full, rel } of walkXml(xmlDir)) {
  let raw = '';
  try {
    raw = fs.readFileSync(full, 'utf8');
  } catch {
    continue;
  }
  const t = trichTuGiamDinhHs(raw);
  if (!t.ma_lk) continue;
  const relPath = `tai_nguyen/${sub}/${rel}`;
  lkFromXml.set(String(t.ma_lk).trim(), {
    relPath,
    ma_loai_kcb: t.ma_loai_kcb || undefined,
    ma_benh_chinh: t.ma_benh_chinh || undefined,
    ma_benh_chinh_chuan_hoa: t.ma_benh_chinh ? chuanHoaMaIcdPhacDoCdss(t.ma_benh_chinh) : '',
  });
}

const tyLeHangLoat = (n) => (totalRows > 0 ? n / totalRows : 0);

const hangLoat = [...byRule.entries()]
  .filter(([rule, n]) => rule && (n >= 80 || tyLeHangLoat(n) >= 0.03))
  .sort((a, b) => b[1] - a[1])
  .map(([ma_luat, so_lan]) => ({
    ma_luat,
    so_lan,
    ty_le_trong_bao_cao: Number(tyLeHangLoat(so_lan).toFixed(4)),
    goi_y:
      'Quy tắc xuất hiện với tần suất cao — trước khi ghi nhận là “lỗi hệ thống” hoặc huấn luyện hàng loạt: rà soát chuyên môn (dương tính giả), điều kiện rule, và mẫu XML; chỉ đưa vào cơ sở huấn luyện sau khi có mẫu xác nhận Đúng/Sai trên từng ca.',
  }));

const theoMaLk = [];
for (const [ma_lk, list] of byLk.entries()) {
  const xml = lkFromXml.get(ma_lk);
  const icdHoa = xml?.ma_benh_chinh_chuan_hoa || '';
  const rules = [...new Set(list.map((x) => x.ma_luat).filter(Boolean))];
  theoMaLk.push({
    ma_lk,
    so_dong_canh_bao: list.length,
    ma_luat_khac_nhau: rules.length,
    ma_luat_list: rules,
    co_file_trong_tai_nguyen: Boolean(xml),
    relPath: xml?.relPath,
    ma_loai_kcb: xml?.ma_loai_kcb,
    ma_benh_chinh_xml1: xml?.ma_benh_chinh,
    co_phac_do_cdss_cho_icd_chinh: icdHoa ? phacDoIcd.has(icdHoa) : false,
  });
}
theoMaLk.sort((a, b) => b.so_dong_canh_bao - a.so_dong_canh_bao);

const coXml = theoMaLk.filter((x) => x.co_file_trong_tai_nguyen).length;

const out = {
  generatedAt: new Date().toISOString(),
  nguon_bao_cao: path.basename(xlsxPath),
  nguon_xml_thu_muc: `tai_nguyen/${sub}`,
  phien_ban_phac_do_seed: seed.version || '',
  thong_ke: {
    tong_dong_trong_bao_cao: totalRows,
    so_ma_lk: uniqueLk,
    so_ma_lk_co_xml_trong_thu_muc: coXml,
    so_ma_lk_chua_co_xml: uniqueLk - coXml,
    so_ma_icd_trong_phac_do_cdss: phacDoIcd.size,
  },
  canh_bao_hang_loat_de_ra_soat: hangLoat,
  chi_tiet_theo_ma_lk: theoMaLk,
};

const outPath = path.join(root, 'tai_lieu', '_huan_luyen_merge_audit_neo_ip.json');
fs.writeFileSync(outPath, `${JSON.stringify(out, null, 2)}\n`, 'utf8');
console.log(`[huan_luyen_merge] Đã ghi ${outPath}`);
console.log(
  `[huan_luyen_merge] dong=${totalRows} ma_lk=${uniqueLk} co_xml=${coXml}/${uniqueLk} hang_loat_rule=${hangLoat.length}`,
);
