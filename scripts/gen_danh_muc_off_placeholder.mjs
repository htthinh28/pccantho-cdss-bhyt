/**
 * Sinh file text: danh mục quy tắc TRANG_THAI=OFF (trong mã nguồn) + CHUYEN_DE placeholder (registry).
 * Chạy: node scripts/gen_danh_muc_off_placeholder.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const TIEN_ICH = path.join(ROOT, 'ma_nguon', 'tien_ich');
const OUT = path.join(ROOT, 'tai_lieu', 'Danh_muc_quy_tac_OFF_va_Placeholder.txt');
const REG = path.join(ROOT, 'scripts', 'chuyen_de_placeholder_registry.json');

function walkJsx(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walkJsx(p, acc);
    else if (name.endsWith('.jsx')) acc.push(p);
  }
  return acc;
}

/** Dòng kiểu hardcoded: { id: 'X', MA_LUAT: 'Y', TEN_QUY_TAC: `Z`, ... TRANG_THAI: 'OFF' */
function parseHardcodedLine(line, sourceFile) {
  if (!line.includes("TRANG_THAI: 'OFF'")) return null;
  const idM = line.match(/id:\s*'([^']+)'/);
  const maM = line.match(/MA_LUAT:\s*'([^']+)'/);
  const tenM = line.match(/TEN_QUY_TAC:\s*`([^`]*)`/);
  return {
    nguon: path.relative(ROOT, sourceFile).replace(/\\/g, '/'),
    id: idM?.[1] ?? '(không parse id)',
    ma_luat: maM?.[1] ?? '(không parse MA_LUAT)',
    ten: (tenM?.[1] ?? '').replace(/\s+/g, ' ').trim() || '(không parse tên)',
  };
}

/** Khối seed JSON: "TRANG_THAI": "OFF" */
function extractSeedOffBlocks(content, sourceFile) {
  const out = [];
  const rel = path.relative(ROOT, sourceFile).replace(/\\/g, '/');
  let i = 0;
  while (i < content.length) {
    const offIdx = content.indexOf('"TRANG_THAI": "OFF"', i);
    if (offIdx === -1) break;
    let start = content.lastIndexOf('{', offIdx);
    if (start === -1) {
      i = offIdx + 1;
      continue;
    }
    let depth = 0;
    let end = start;
    for (let j = start; j < content.length; j++) {
      const c = content[j];
      if (c === '{') depth++;
      else if (c === '}') {
        depth--;
        if (depth === 0) {
          end = j + 1;
          break;
        }
      }
    }
    const block = content.slice(start, end);
    const idM = block.match(/"id"\s*:\s*"([^"]+)"/);
    const maM = block.match(/"MA_LUAT"\s*:\s*"([^"]+)"/);
    const tenM = block.match(/"TEN_QUY_TAC"\s*:\s*"([^"]*)"/);
    if (maM) {
      out.push({
        nguon: rel,
        id: idM?.[1] ?? '',
        ma_luat: maM[1],
        ten: (tenM?.[1] ?? '').replace(/\s+/g, ' ').trim() || '(không tên)',
      });
    }
    i = end;
  }
  return out;
}

function main() {
  const lines = [];
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
  lines.push('DANH MỤC QUY TẮC TRẠNG THÁI OFF VÀ CHUYÊN ĐỀ PLACEHOLDER');
  lines.push(`Sinh tự động: ${now} (UTC có thể lệch múi giờ máy)`);
  lines.push(`Repo: ${ROOT}`);
  lines.push('');
  lines.push('=== PHẦN A — CHUYÊN ĐỀ (CHUYEN_DE) ĐIỀU KIỆN PLACEHOLDER (EXIT_AUDIT_BACKLOG / CHO_XU_LY_SAU) ===');
  lines.push('Nguồn: scripts/chuyen_de_placeholder_registry.json (đồng bộ sau mỗi lần sửa luật CHUYEN_DE).');
  lines.push('Ý nghĩa: backlog hoặc CHO_XU_LY — chưa triển khai DIEU_KIEN XML130 đủ để phát cảnh báo thực chiến.');
  lines.push('');

  const reg = JSON.parse(fs.readFileSync(REG, 'utf8'));
  const ids = reg.rule_ids_all_placeholder || reg.rule_ids || [];
  lines.push(`Số quy tắc placeholder (tổng): ${reg.placeholder_count}`);
  if (reg.exit_audit_backlog_count != null) {
    lines.push(`  — EXIT_AUDIT_BACKLOG: ${reg.exit_audit_backlog_count}`);
  }
  if (reg.cho_xu_ly_sau_count != null) {
    lines.push(`  — CHO_XU_LY_SAU: ${reg.cho_xu_ly_sau_count}`);
  }
  lines.push('');
  for (const rid of ids) {
    lines.push(`  ${rid}`);
  }
  lines.push('');

  lines.push('=== PHẦN B — QUY TẮC TRANG_THAI: OFF TRONG MÃ NGUỒN (hardcoded .jsx, một dòng / rule) ===');
  const jsxFiles = walkJsx(TIEN_ICH).sort();
  const hardcoded = [];
  for (const file of jsxFiles) {
    const text = fs.readFileSync(file, 'utf8');
    const rel = path.relative(ROOT, file).replace(/\\/g, '/');
    for (const line of text.split(/\r?\n/)) {
      const r = parseHardcodedLine(line, file);
      if (r) hardcoded.push(r);
    }
  }
  hardcoded.sort((a, b) => a.ma_luat.localeCompare(b.ma_luat, 'vi'));
  lines.push(`Tổng: ${hardcoded.length} dòng rule`);
  lines.push('');
  for (const r of hardcoded) {
    lines.push(`[${r.ma_luat}] ${r.id}`);
    lines.push(`  Tên: ${r.ten}`);
    lines.push(`  File: ${r.nguon}`);
    lines.push('');
  }

  lines.push('=== PHẦN C — QUY TẮC "TRANG_THAI": "OFF" TRONG SEED (JSON trong .jsx) ===');
  const seedFiles = jsxFiles.filter((f) => fs.readFileSync(f, 'utf8').includes('"TRANG_THAI": "OFF"'));
  const seedOff = [];
  for (const file of seedFiles) {
    const text = fs.readFileSync(file, 'utf8');
    seedOff.push(...extractSeedOffBlocks(text, file));
  }
  seedOff.sort((a, b) => a.ma_luat.localeCompare(b.ma_luat, 'vi'));
  lines.push(`Tổng: ${seedOff.length} rule (có thể trùng MA_LUAT nếu nhiều file; thường không)`);
  lines.push('');
  for (const r of seedOff) {
    lines.push(`[${r.ma_luat}] ${r.id || '(no id)'}`);
    lines.push(`  Tên: ${r.ten}`);
    lines.push(`  File: ${r.nguon}`);
    lines.push('');
  }

  const qOnOff = path.join(TIEN_ICH, 'quy_tac_on_off_noi_bo.jsx');
  const qText = fs.readFileSync(qOnOff, 'utf8');
  function extractFreezeArray(constName) {
    const re = new RegExp(
      `const ${constName} = Object\\.freeze\\(\\[([\\s\\S]*?)\\]\\);`,
      'm'
    );
    const m = qText.match(re);
    if (!m) return [];
    return [...m[1].matchAll(/'([^']+)'/g)].map((x) => x[1]);
  }
  const mauMacDinhOff = extractFreezeArray('DANH_SACH_MAU_QUY_TAC_MAC_DINH_OFF');
  const tatCungOff = extractFreezeArray('DANH_SACH_QUY_TAC_TAT_CUNG');

  lines.push('=== PHẦN D — MẶC ĐỊNH OFF (ỨNG DỤNG ÁP KHI CHƯA CÓ CẤU HÌNH ON/OFF) ===');
  lines.push(`Nguồn: ma_nguon/tien_ich/quy_tac_on_off_noi_bo.jsx — DANH_SACH_MAU_QUY_TAC_MAC_DINH_OFF (${mauMacDinhOff.length} mã/pattern).`);
  lines.push('');
  for (const x of mauMacDinhOff) {
    lines.push(`  ${x}`);
  }
  lines.push('');
  lines.push('=== PHẦN E — TẮT CỨNG (KHÔNG CHO BẬT LẠI QUA UI) ===');
  lines.push(`Nguồn: cùng file — DANH_SACH_QUY_TAC_TAT_CUNG (${tatCungOff.length} mã).`);
  lines.push('');
  for (const x of tatCungOff) {
    lines.push(`  ${x}`);
  }
  lines.push('');

  lines.push('=== GHI CHÚ ===');
  lines.push('- Phần B: chỉ rule ghi một dòng trong file (id, MA_LUAT, TEN_QUY_TAC, TRANG_THAI cùng dòng).');
  lines.push('- Phần C: object JSON nhiều dòng trong file seed.');
  lines.push('');

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, lines.join('\n'), 'utf8');
  console.log(`Đã ghi ${path.relative(ROOT, OUT)} (${lines.length} dòng).`);
}

main();
