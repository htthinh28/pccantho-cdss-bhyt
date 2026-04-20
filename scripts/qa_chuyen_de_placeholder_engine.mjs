/**
 * QA: đồng bộ placeholder CHUYEN_DE (registry vs mã nguồn) + nhắc chính sách thực tiễn.
 * Chạy: node scripts/qa_chuyen_de_placeholder_engine.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'ma_nguon', 'tien_ich', 'luat_giam_dinh_chuyen_de_hardcoded.jsx');
const REG = path.join(ROOT, 'scripts', 'chuyen_de_placeholder_registry.json');

/** Cùng logic scripts/sync_chuyen_de_placeholder_registry.mjs */
function demPlaceholderTrongFile() {
  const lines = fs.readFileSync(SRC, 'utf8').split(/\r?\n/);
  const set = new Set();
  let currentId = null;
  for (const line of lines) {
    const idM = line.match(/id:\s*'(CHUYEN_DE-\d+)'/);
    if (idM) currentId = idM[1];
    if (!currentId) continue;
    if (
      /DIEU_KIEN:\s*CHUYEN_DE_XML130_PLACEHOLDER_EXIT_AUDIT_BACKLOG\s*,/.test(line) ||
      /DIEU_KIEN:\s*CHUYEN_DE_XML130_CHO_XU_LY_SAU\s*,/.test(line)
    ) {
      set.add(currentId);
    }
  }
  return set.size;
}

function fail(msg) {
  console.error(`[FAIL] ${msg}`);
  process.exit(1);
}

const reg = JSON.parse(fs.readFileSync(REG, 'utf8'));
const countScan = demPlaceholderTrongFile();

if (countScan !== reg.placeholder_count) {
  fail(
    `Số quy tắc placeholder quét được (${countScan}) ≠ registry (${reg.placeholder_count}). Chạy: node scripts/sync_chuyen_de_placeholder_registry.mjs`,
  );
}

const text = fs.readFileSync(SRC, 'utf8');
const mExport = text.match(/export const CHUYEN_DE_XML130_CHO_XU_LY_SAU = '([^']+)';/);
if (!mExport) fail('Không tìm thấy export CHUYEN_DE_XML130_CHO_XU_LY_SAU trong luat_giam_dinh_chuyen_de_hardcoded.jsx');

console.log(`[OK] Placeholder registry khớp mã nguồn: ${reg.placeholder_count} quy tắc.`);
if (reg.exit_audit_backlog_count != null) {
  console.log(
    `     (EXIT_AUDIT_BACKLOG: ${reg.exit_audit_backlog_count} | CHO_XU_LY_SAU: ${reg.cho_xu_ly_sau_count ?? '—'})`,
  );
}
console.log(
  `[OK] Hằng CHO_XU_LY_SAU đã export — engine bỏ qua qua laDieuKienChuyenDeXml130Placeholder (không phát cảnh báo).`,
);
console.log('');
console.log('Chính sách: không có hệ tự động nào đạt 100% không dương giả và không âm giả trên mọi hồ sơ.');
console.log(
  'Placeholder EXIT_AUDIT_BACKLOG = điều kiện luôn sai tạm thời; CHO_XU_LY_SAU = không khớp khi có MA_LK.',
);
console.log('Chuyển XML130 thật: npm run chuyen-de:sync-rollout-plan → rà nhóm triển khai; kiểm thử vàng + ON/OFF.');
process.exit(0);
