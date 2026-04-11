/**
 * Quét thư mục tai_lieu/ — gom các file huấn luyện AI (ca mẫu, bảng neo, phiên…)
 * → JSON chỉ mục phục vụ RAG / đóng gói thực chiến.
 *
 * Chạy: node scripts/build_huan_luyen_index.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const TAI_LIEU = path.join(root, 'tai_lieu');
const OUT = path.join(TAI_LIEU, '_index_kho_huan_luyen_AI.json');

const PREFIXES = [
  { key: 'ca_mau', pattern: /^Ca_huan_luyen/i },
  { key: 'bang_neo', pattern: /^Bang_neo/i },
  { key: 'huan_luyen_phien', pattern: /^Huan_luyen_phien/i },
  { key: 'sprint_huan_luyen', pattern: /^Sprint_\d+p_huan_luyen/i },
  { key: 'the_tri_thuc', pattern: /^The_tri_thuc/i },
  { key: 'chuan_hoa_kien_thuc', pattern: /^Chuan_hoa_kien_thuc/i },
  { key: 'quy_tac_kiem_soat', pattern: /^Quy_tac_kiem_soat/i },
  { key: 'lo_trinh', pattern: /^Lo_trinh_huan_luyen/i },
  { key: 'ky_nang_cot_loi', pattern: /^Ky_nang_cot_loi/i },
  { key: 'bai_tap', pattern: /^Bai_tap_phat_trien/i },
  { key: 'checklist_tt12', pattern: /^Checklist_TT12/i },
  { key: 'huong_dan_huan_luyen', pattern: /^Huong_dan_huan_luyen/i },
];

function walkMd(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const name of fs.readdirSync(dir)) {
    if (!name.endsWith('.md')) continue;
    const full = path.join(dir, name);
    const st = fs.statSync(full);
    if (!st.isFile()) continue;
    let category = 'khac';
    for (const { key, pattern } of PREFIXES) {
      if (pattern.test(name)) {
        category = key;
        break;
      }
    }
    out.push({
      file: name,
      relPath: `tai_lieu/${name}`.replace(/\\/g, '/'),
      category,
      bytes: st.size,
      mtime: st.mtime.toISOString(),
    });
  }
  return out.sort((a, b) => a.file.localeCompare(b.file, 'vi'));
}

const items = walkMd(TAI_LIEU);
const byCat = {};
items.forEach((it) => {
  byCat[it.category] = (byCat[it.category] || 0) + 1;
});

const payload = {
  generatedAt: new Date().toISOString(),
  description:
    'Chỉ mục mọi file .md trong tai_lieu/; gán category theo tiền tố tên file (Ca_huan_luyen → ca_mau, The_tri_thuc → the_tri_thuc, …); không khớp → khac. Dùng cùng Goi_du_lieu_huan_luyen_AI_thuc_chien.md.',
  tong_so_file: items.length,
  so_luong_theo_nhom: byCat,
  items,
};

fs.writeFileSync(OUT, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
console.log(`[build_huan_luyen_index] Đã ghi ${OUT} (${items.length} file).`);
