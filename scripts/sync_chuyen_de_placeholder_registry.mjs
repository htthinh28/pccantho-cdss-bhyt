/**
 * Quét ma_nguon/tien_ich/luat_giam_dinh_chuyen_de_hardcoded.jsx,
 * liệt kê quy tắc có DIEU_KIEN placeholder:
 *   — CHUYEN_DE_XML130_PLACEHOLDER_EXIT_AUDIT_BACKLOG (backlog kiểm toán / chưa có heuristic XML130)
 *   — CHUYEN_DE_XML130_CHO_XU_LY_SAU (engine bỏ qua qua laDieuKienChuyenDeXml130Placeholder)
 *
 * Chạy sau mỗi lần sửa luật CHUYEN_DE:
 *   node scripts/sync_chuyen_de_placeholder_registry.mjs
 *
 * Lưu ý: quét theo dòng — mỗi dòng có `id: 'CHUYEN_DE-…'` và DIEU_KIEN trên cùng dòng.
 */
import fs from 'fs';

const src = 'ma_nguon/tien_ich/luat_giam_dinh_chuyen_de_hardcoded.jsx';
const out = 'scripts/chuyen_de_placeholder_registry.json';

const lines = fs.readFileSync(src, 'utf8').split(/\r?\n/);
const exitIds = [];
const choIds = [];
let currentId = null;

for (const line of lines) {
  const idM = line.match(/id:\s*'(CHUYEN_DE-\d+)'/);
  if (idM) {
    currentId = idM[1];
  }
  if (!currentId) continue;
  if (/DIEU_KIEN:\s*CHUYEN_DE_XML130_PLACEHOLDER_EXIT_AUDIT_BACKLOG\s*,/.test(line)) {
    exitIds.push(currentId);
  }
  if (/DIEU_KIEN:\s*CHUYEN_DE_XML130_CHO_XU_LY_SAU\s*,/.test(line)) {
    choIds.push(currentId);
  }
}

const sortIds = (a, b) =>
  parseInt(a.replace('CHUYEN_DE-', ''), 10) - parseInt(b.replace('CHUYEN_DE-', ''), 10);

exitIds.sort(sortIds);
choIds.sort(sortIds);

const allUnique = [...new Set([...exitIds, ...choIds])].sort(sortIds);

const payload = {
  version: '2026-04-19',
  generated_note:
    'Tự động sinh — không sửa tay danh sách ids. EXIT_AUDIT_BACKLOG = điều kiện cố ý không khớp XML130 cho đến khi có heuristic; CHO_XU_LY_SAU = không phát khi có MA_LK.',
  source_file: src,
  placeholder_count: allUnique.length,
  exit_audit_backlog_count: exitIds.length,
  cho_xu_ly_sau_count: choIds.length,
  rule_ids_exit_audit_backlog: exitIds,
  rule_ids_cho_xu_ly_sau: choIds,
  rule_ids_all_placeholder: allUnique,
};

fs.writeFileSync(out, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
console.log(
  `Đã ghi ${out}: placeholder tổng ${allUnique.length} (EXIT_AUDIT_BACKLOG ${exitIds.length}, CHO_XU_LY_SAU ${choIds.length}).`,
);
