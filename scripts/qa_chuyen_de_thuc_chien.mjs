/**
 * QA quy trình thực chiến CHUYEN_DE (từng bước):
 *
 * Bước 1 — DIEU_KIEN không phải placeholder (không phải EXIT_AUDIT_BACKLOG / CHO_XU_LY_SAU).
 * Bước 2 — TRANG_THAI seed = ON trong luat_giam_dinh_chuyen_de_hardcoded.jsx (hoặc chủ động OFF có lý do).
 * Bước 3 — Rà soát quy_tac_on_off_noi_bo: nếu mã nằm DANH_SACH_MAU_QUY_TAC_MAC_DINH_OFF, chỉ thực chiến khi BV bật ON có kiểm soát.
 * Bước 4 — Kiểm thử vàng trên XML thật / ca mẫu; ghi golden_test_refs trong manifest (khuyến nghị).
 * Bước 5 — Thêm id vào scripts/chuyen_de_thuc_chien_manifest.json → chạy lại QA này.
 *
 * Inventory kỹ thuật: node scripts/sync_chuyen_de_eligible_scan.mjs
 * Placeholder registry: npm run qa:chuyen-de-placeholder
 *
 * Chạy: node scripts/qa_chuyen_de_thuc_chien.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  scanChuyenDeRulesFromFile,
  chuyenDeIdToNormalizedMa,
} from './lib/chuyen_de_scan_utils.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'ma_nguon', 'tien_ich', 'luat_giam_dinh_chuyen_de_hardcoded.jsx');
const ON_OFF = path.join(ROOT, 'ma_nguon', 'tien_ich', 'quy_tac_on_off_noi_bo.jsx');
const MANIFEST = path.join(ROOT, 'scripts', 'chuyen_de_thuc_chien_manifest.json');

function loadDefaultOffChuyenDeNormalized() {
  const text = fs.readFileSync(ON_OFF, 'utf8');
  const set = new Set();
  const re = /'CHUYEN_DE_(\d+)'/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    set.add(`CHUYEN_DE_${m[1]}`);
  }
  return set;
}

function fail(msg) {
  console.error(`[FAIL] ${msg}`);
  process.exit(1);
}

const rules = scanChuyenDeRulesFromFile(SRC, fs);
const byId = new Map(rules.map((r) => [r.id, r]));
const defaultOff = loadDefaultOffChuyenDeNormalized();

const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
const approved = Array.isArray(manifest.approved_rule_ids) ? manifest.approved_rule_ids : [];

const dup = approved.filter((id, i) => approved.indexOf(id) !== i);
if (dup.length) fail(`Trùng id trong approved_rule_ids: ${[...new Set(dup)].join(', ')}`);

function sortIds(a, b) {
  return parseInt(a.replace('CHUYEN_DE-', ''), 10) - parseInt(b.replace('CHUYEN_DE-', ''), 10);
}

const sortedApproved = [...approved].sort(sortIds);
if (JSON.stringify(approved) !== JSON.stringify(sortedApproved)) {
  fail(
    `approved_rule_ids phải sắp xếp tăng dần theo số (vd. CHUYEN_DE-001 trước CHUYEN_DE-012). Gợi ý: sắp xếp lại cho khớp: ${sortedApproved.join(', ')}`,
  );
}

for (const id of approved) {
  const r = byId.get(id);
  if (!r) fail(`approved_rule_ids: không tìm thấy ${id} trong ${path.relative(ROOT, SRC)}`);
  if (r.placeholder) {
    fail(
      `${id} vẫn là placeholder (EXIT_AUDIT_BACKLOG hoặc CHO_XU_LY_SAU) — không được khai báo thực chiến. Viết DIEU_KIEN XML130 trước.`,
    );
  }
  if (r.trangThai === 'OFF') {
    fail(
      `${id} có TRANG_THAI seed OFF — bỏ khỏi manifest hoặc đổi seed ON sau khi có lý do nghiệp vụ.`,
    );
  }
  if (r.trangThai !== 'ON') fail(`${id}: thiếu TRANG_THAI ON/OFF trên dòng quy tắc.`);
  const maN = chuyenDeIdToNormalizedMa(id);
  if (defaultOff.has(maN)) {
    console.warn(
      `[WARN] ${id} (${maN}) nằm trong DANH_SACH_MAU_QUY_TAC_MAC_DINH_OFF — khi triển khai BV phải bật ON trong Quản lý ON/OFF; mặc định app coi OFF để giảm dương giả.`,
    );
  }
}

const xml130On = rules.filter((r) => !r.placeholder && r.trangThai === 'ON');
const notInApproved = xml130On.map((r) => r.id).filter((id) => !approved.includes(id));

console.log('[OK] Quy trình thực chiến CHUYEN_DE');
console.log('');
console.log('Các bước (tham chiếu):');
console.log('  1. DIEU_KIEN không placeholder   2. Seed ON   3. Rà soát default OFF nội bộ');
console.log('  4. Kiểm thử vàng + golden_test_refs   5. Ghi id vào chuyen_de_thuc_chien_manifest.json');
console.log('');
console.log(
  `Tổng quan kỹ thuật: ${rules.length} quy tắc | XML130 + seed ON: ${xml130On.length} | đã ký duyệt manifest: ${approved.length}`,
);
if (approved.length === 0) {
  console.log('');
  console.log(
    '(Chưa có id trong approved_rule_ids — QA pass; thêm id sau khi hoàn checklist từng quy tắc.)',
  );
}
if (notInApproved.length && approved.length > 0) {
  console.log('');
  console.log(
    `[INFO] Còn ${notInApproved.length} quy tắc XML130+ON chưa nằm trong manifest (có thể pilot/chưa ký duyệt).`,
  );
}
console.log('');
console.log('Inventory: node scripts/sync_chuyen_de_eligible_scan.mjs');
process.exit(0);
