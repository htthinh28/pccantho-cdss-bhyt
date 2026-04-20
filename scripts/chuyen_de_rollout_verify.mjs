/**
 * Kiểm tra sau khi đưa quy tắc CHUYEN_DE từ placeholder → DIEU_KIEN XML130 (từng lô / từng PR).
 *
 * Quy trình tay trước khi chạy script này:
 * 1. Sửa DIEU_KIEN trong ma_nguon/tien_ich/luat_giam_dinh_chuyen_de_hardcoded.jsx (bỏ EXIT_AUDIT_BACKLOG / CHO_XU_LY_SAU).
 * 2. npm run chuyen-de:prepare-build (đã gắn vào desktop:export / prestart / qa:audit-all)
 * 3. (Khuyến nghị) kiểm thử vàng trên XML mẫu; thêm id vào scripts/chuyen_de_thuc_chien_manifest.json
 * 4. npm run chuyen-de:rollout-verify
 *
 * Tùy chọn audit đầy đủ trạng thái (in dài): npm run qa:rule-trang-thai
 *
 * Chạy: node scripts/chuyen_de_rollout_verify.mjs
 */
import { spawnSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const isWin = process.platform === 'win32';
const npm = isWin ? 'npm.cmd' : 'npm';

const STEPS = [
  'chuyen-de:prepare-build',
  'qa:chuyen-de-thuc-chien',
  'lint',
  'qa:audit-fixtures',
  'qa:on-off-match',
  'qa:rule-schema',
  'qa:claim-audit-smoke',
  'tai_lieu:index-huan-luyen',
  'tai_lieu:danh-muc-off',
];

function run(name) {
  console.log(`\n>>> npm run ${name}\n`);
  const r = spawnSync(npm, ['run', name], {
    cwd: ROOT,
    stdio: 'inherit',
    env: process.env,
    shell: isWin,
  });
  const code = r.status ?? 1;
  if (code !== 0) {
    console.error(`\n[FAIL] Bước "${name}" thoát mã ${code}.`);
    process.exit(code);
  }
}

console.log('[chuyen-de:rollout-verify] Chuỗi kiểm tra sau chuyển placeholder → XML130 (hoặc định kỳ).');
STEPS.forEach(run);
console.log('\n[OK] Hoàn tất rollout-verify (lint + audit lõi + chỉ mục huấn luyện AI + danh mục OFF/Placeholder).');
console.log('    (Tùy chọn: npm run qa:rule-trang-thai — audit trạng thái đầy đủ, console dài.)');
