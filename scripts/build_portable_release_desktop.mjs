/**
 * Đóng gói portable Windows (.exe) và ghi artifact vào thư mục cố định:
 *   <gốc repo>/release-desktop/
 * (Ví dụ: C:\Users\admin\Documents\Google Drive\ung_dung_cdss_bhyt\release-desktop)
 *
 * Dùng biến CDSS_RELEASE_OUT để stage_desktop_pack.mjs không ghi vào %TEMP%.
 *
 * Chạy: npm run desktop:build:win-portable:release-desktop
 */
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const releaseDesktop = path.resolve(path.join(root, 'release-desktop'));

fs.mkdirSync(releaseDesktop, { recursive: true });

console.log(`[build_portable_release_desktop] CDSS_RELEASE_OUT=${releaseDesktop}\n`);

const env = { ...process.env, CDSS_RELEASE_OUT: releaseDesktop };

execSync('npm run desktop:build:win-portable', {
  cwd: root,
  stdio: 'inherit',
  env,
});

console.log(`\n[build_portable_release_desktop] Xong. Kiểm tra file .exe trong:\n  ${releaseDesktop}\n`);
