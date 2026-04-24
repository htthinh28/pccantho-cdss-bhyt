/**
 * Đồng bộ thư mục tai_lieu/ → public/tai_lieu/ (phục vụ web/Electron) và sinh manifest.
 * - File .html: copy giữ nguyên đường dẫn tương đối.
 * - File .md: chuyển sang .html (render Markdown) cùng cấu trúc thư mục.
 * - File .docx: copy sang public/tai_lieu (mở tải xuống / ứng dụng mặc định).
 * - File .txt: copy giữ nguyên (danh mục sinh tự động, v.v.).
 *
 * Chạy: npm run tai_lieu:prepare
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { marked } from 'marked';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const SRC = path.join(root, 'tai_lieu');
const OUT = path.join(root, 'public', 'tai_lieu');
const MANIFEST = path.join(root, 'ma_nguon', 'tien_ich', 'tai_lieu_manifest.json');
const TAG_CATALOG = path.join(root, 'ma_nguon', 'tien_ich', 'tai_lieu_tag_catalog.json');

const shouldSkip = (name) => name === '.git' || name === 'node_modules';

function loadTagCatalog() {
  try {
    return JSON.parse(fs.readFileSync(TAG_CATALOG, 'utf8'));
  } catch {
    return { catalog: [], explicitByRelPath: {} };
  }
}

/** Chuẩn hóa nhẹ để khớp mẫu (bỏ dấu, đ→d). */
function chuanHoaBlob(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

/**
 * Gán thẻ nghiệp vụ cho từng mục manifest (thư viện + trợ lý AI ưu tiên tài liệu).
 * @param {string} relPath — đường dẫn trong public/tai_lieu (vd .html)
 * @param {string} title
 * @param {Set<string>} validIds
 */
function inferTagsForItem(relPath, title, validIds) {
  const ok = (id) => !validIds.size || validIds.has(id);
  const add = (set, id) => {
    if (id && ok(id)) set.add(id);
  };
  const r = String(relPath || '').replace(/\\/g, '/');
  const base = path.basename(r);
  const bl = base.toLowerCase();
  const blob = chuanHoaBlob(`${bl} ${title || ''}`);
  const tags = new Set();

  if (/^the_tri_thuc_/i.test(base)) {
    add(tags, 'the_tri_thuc');
    add(tags, 'ai_huan_luyen');
  }
  if (/^mau_the_tri_thuc/i.test(base)) {
    add(tags, 'the_tri_thuc');
    add(tags, 'ai_huan_luyen');
  }
  if (/^ca_huan_luyen_/i.test(base)) {
    add(tags, 'ca_mau');
    add(tags, 'ai_huan_luyen');
  }
  if (/^bang_neo_/i.test(base)) {
    add(tags, 'bang_neo');
    add(tags, 'ai_huan_luyen');
  }
  if (/huong_dan|huan_luyen_phien|lo_trinh.*ai|goi_du_lieu.*ai|quy_trinh_prompt|bai_tap.*ai/i.test(bl)) {
    add(tags, 'ai_huan_luyen');
  }
  if (/chuan_hoa.*_ai_/i.test(bl) || /chuan_hoa.*ai.*giam_dinh/i.test(bl)) add(tags, 'ai_huan_luyen');

  if (/tuong_tac.*thuoc|tuong_tac_thuoc/i.test(bl)) {
    add(tags, 'tuong_tac_thuoc');
    add(tags, 'thuoc');
  }
  if (/thuoc|xml2|muc8|chi_muc.*thuoc|giam_dinh_thuoc|dm.*thuoc|dot[1-5].*thuoc|nhom_thuoc/i.test(blob)) {
    add(tags, 'thuoc');
  }
  if (/dvkt|cdha_|vbhn|danh_muc_[12]_dvkt|kiem_soat_loi_dvkt|giam_dinh_dvkt/i.test(blob)) add(tags, 'dvkt');
  if (/vtyt/i.test(blob)) add(tags, 'vtyt');
  if (/pttt|phau_thuat|nhom_pttt|giam_dinh_pttt/i.test(blob)) add(tags, 'pttt');
  if (/hanh_chinh|xml1|the_bhyt|quyen_loi|kiem_soat_loi_the|cong_kham|mau_hanh_chinh/i.test(blob)) {
    add(tags, 'hanh_chinh');
  }
  if (/icd|chuyen_mon|phac_do_cdss|^the_tri_thuc_phac_do|ebm|i10|nhom_chuyen_mon/i.test(blob)) {
    add(tags, 'icd_chuyen_mon');
  }
  if (/cv266/i.test(blob)) add(tags, 'cv266');
  if (/mau_luat|nghi_dinh|hop_dong.*kcb|188_2025|vbhn.*byt|phap_ly_quan_ly|quy_dinh_clvt/i.test(blob)) {
    add(tags, 'phap_ly');
  }
  if (/xml130|chuyen_de_xml|chuyen_de/i.test(blob)) add(tags, 'xml_chuyen_de');
  if (
    /4210|7464|qd_4210|qd4210|cau_truc_xml|phan_loi.*cau_truc|tai_nguyen.*xml|huong_dan_tai_nguyen_xml/i.test(blob)
  ) {
    add(tags, 'cau_truc_xml');
  }
  if (/ban_ghi.*kiem|rasoat.*quy_tac|audit|on_off|thuc_trang_quy_tac|kiem_thu/i.test(blob)) {
    add(tags, 'kiem_thu_quy_tac');
  }

  return [...tags];
}

function gopTheChoManifestItems(items, tagData) {
  const catalog = Array.isArray(tagData.catalog) ? tagData.catalog : [];
  const validIds = new Set(catalog.map((c) => c.id).filter(Boolean));
  const explicit = tagData.explicitByRelPath && typeof tagData.explicitByRelPath === 'object'
    ? tagData.explicitByRelPath
    : {};

  for (const it of items) {
    const inferred = inferTagsForItem(it.relPath, it.title, validIds);
    const extra = Array.isArray(explicit[it.relPath])
      ? explicit[it.relPath].filter((id) => !validIds.size || validIds.has(id))
      : [];
    const merged = [...new Set([...inferred, ...extra])];
    if (merged.length) it.tags = merged;
  }
}

function walk(dir, baseRel = '') {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const ent of entries) {
    if (shouldSkip(ent.name)) continue;
    const rel = baseRel ? `${baseRel}/${ent.name}` : ent.name;
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      out.push(...walk(full, rel));
    } else if (ent.isFile()) {
      out.push({ full, rel: rel.replace(/\\/g, '/') });
    }
  }
  return out;
}

function layTieuDeTuFileMdSongSong(docxRel) {
  const mdRel = docxRel.replace(/\.docx$/i, '.md');
  const mdFull = path.join(SRC, mdRel);
  if (!fs.existsSync(mdFull)) return '';
  try {
    const md = fs.readFileSync(mdFull, 'utf8');
    const m = md.match(/^#\s+(.+)$/m);
    return m ? `${m[1].trim()} (Word)` : '';
  } catch {
    return '';
  }
}

function escapeHtml(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function wrapHtmlPage({ title, bodyHtml, sourceRel }) {
  const t = escapeHtml(title);
  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${t}</title>
  <style>
    :root { color-scheme: light dark; }
    body { font-family: system-ui, "Segoe UI", Roboto, Arial, sans-serif; line-height: 1.55; margin: 0; padding: 24px; background: #f6f7f9; color: #1a1a2e; }
    main { max-width: 900px; margin: 0 auto; background: #fff; padding: 28px 32px; border-radius: 12px; box-shadow: 0 2px 12px rgba(0,0,0,.08); }
    h1, h2, h3 { line-height: 1.25; }
    code, pre { font-family: ui-monospace, Consolas, monospace; font-size: 0.92em; }
    pre { overflow: auto; padding: 12px; background: #f0f1f3; border-radius: 8px; }
    blockquote { border-left: 4px solid #c2185b; margin: 0; padding-left: 16px; color: #444; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    .meta { font-size: 12px; color: #666; margin-bottom: 20px; }
    a { color: #1565c0; }
  </style>
</head>
<body>
  <main>
    <div class="meta">Nguồn: <code>${escapeHtml(sourceRel)}</code> · Thư viện CDSS BHYT</div>
    ${bodyHtml}
  </main>
</body>
</html>
`;
}

function main() {
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(OUT, { recursive: true });

  const items = [];
  const files = walk(SRC);

  if (!fs.existsSync(SRC)) {
    console.warn('[prepare_tai_lieu] Không có thư mục tai_lieu/. Tạo manifest rỗng.');
    fs.writeFileSync(
      MANIFEST,
      `${JSON.stringify({ generatedAt: new Date().toISOString(), items: [] }, null, 2)}\n`,
      'utf8',
    );
    return;
  }

  for (const { full, rel } of files) {
    const lower = rel.toLowerCase();
    if (lower.endsWith('.html')) {
      const dest = path.join(OUT, rel);
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.copyFileSync(full, dest);
      const base = path.basename(rel, '.html');
      items.push({
        id: `html:${rel}`,
        relPath: rel.replace(/\\/g, '/'),
        title: base.replace(/_/g, ' '),
        nguon: 'html',
      });
      continue;
    }
    if (lower.endsWith('.md')) {
      const md = fs.readFileSync(full, 'utf8');
      const htmlBody = marked.parse(md, { async: false });
      const titleMatch = md.match(/^#\s+(.+)$/m);
      const title = titleMatch ? titleMatch[1].trim() : path.basename(rel, '.md').replace(/_/g, ' ');
      const outRel = `${rel.slice(0, -3)}.html`;
      const dest = path.join(OUT, outRel);
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      const page = wrapHtmlPage({ title, bodyHtml: htmlBody, sourceRel: rel });
      fs.writeFileSync(dest, page, 'utf8');
      items.push({
        id: `md:${rel}`,
        relPath: outRel.replace(/\\/g, '/'),
        title,
        nguon: 'markdown',
      });
      continue;
    }
    if (lower.endsWith('.docx')) {
      const dest = path.join(OUT, rel);
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.copyFileSync(full, dest);
      const base = path.basename(rel, '.docx');
      const titleTuMd = layTieuDeTuFileMdSongSong(rel);
      items.push({
        id: `docx:${rel}`,
        relPath: rel.replace(/\\/g, '/'),
        title: titleTuMd || base.replace(/_/g, ' '),
        nguon: 'docx',
      });
      continue;
    }
    if (lower.endsWith('.txt')) {
      const dest = path.join(OUT, rel);
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.copyFileSync(full, dest);
      const base = path.basename(rel, '.txt');
      items.push({
        id: `txt:${rel}`,
        relPath: rel.replace(/\\/g, '/'),
        title: base.replace(/_/g, ' '),
        nguon: 'text',
      });
    }
  }

  items.sort((a, b) => a.relPath.localeCompare(b.relPath, 'vi'));

  const tagData = loadTagCatalog();
  gopTheChoManifestItems(items, tagData);

  fs.writeFileSync(
    MANIFEST,
    `${JSON.stringify({ generatedAt: new Date().toISOString(), items }, null, 2)}\n`,
    'utf8',
  );

  console.log(`[prepare_tai_lieu] Đã xử lý ${items.length} tài liệu → public/tai_lieu/ và ${path.relative(root, MANIFEST)}`);
}

main();
