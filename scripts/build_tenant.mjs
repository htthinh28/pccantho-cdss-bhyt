#!/usr/bin/env node
/**
 * Build web artifact cho một tenant (Mô hình A).
 * Usage: node scripts/build_tenant.mjs phuongchau_soc_trang
 *        npm run build:tenant -- phuongchau_can_tho
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const LEGACY_ORG_MAP = { phuongchau: 'phuongchau_soc_trang' };

const chuanHoaOrgId = (raw) => {
  const token = String(raw || '').trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
  return LEGACY_ORG_MAP[token] || token;
};

const orgArg = process.argv[2] || process.env.EXPO_PUBLIC_ORG_ID || 'phuongchau_soc_trang';
const orgId = chuanHoaOrgId(orgArg);

const profilePath = path.join(root, 'config', 'tenants', orgId, 'profile.json');
if (!fs.existsSync(profilePath)) {
  console.error(`❌ Không tìm thấy profile: ${profilePath}`);
  process.exit(1);
}

const profile = JSON.parse(fs.readFileSync(profilePath, 'utf8'));
console.log(`\n🏥 Build tenant: ${profile.tenDayDu || profile.tenHienThi || orgId}`);
console.log(`   org_id=${orgId}  MA_CSKCB=${profile.maCskcb || profile.thongTinCoSo?.MA_CSKCB || '?'}\n`);

const env = {
  ...process.env,
  EXPO_PUBLIC_ORG_ID: orgId,
  EXPO_PUBLIC_FIREBASE_ORG_ID: profile.firebaseOrgId || orgId,
};

const run = (cmd, args) => {
  const r = spawnSync(cmd, args, { cwd: root, env, stdio: 'inherit', shell: process.platform === 'win32' });
  if (r.status !== 0) process.exit(r.status ?? 1);
};

run('npm', ['run', 'tai_lieu:prepare']);
run('npx', ['expo', 'export', '--platform', 'web']);

const distSrc = path.join(root, 'dist');
const distDest = path.join(root, `dist-${orgId}`);
if (fs.existsSync(distDest)) fs.rmSync(distDest, { recursive: true, force: true });
fs.renameSync(distSrc, distDest);

const meta = {
  orgId,
  builtAt: new Date().toISOString(),
  appName: profile.appName,
  maCskcb: profile.maCskcb,
};
fs.writeFileSync(path.join(distDest, 'tenant-build-meta.json'), `${JSON.stringify(meta, null, 2)}\n`);

console.log(`\n✅ Artifact: dist-${orgId}/`);
console.log(`   Deploy Vercel project: ${profile.deploy?.vercelProject || '(tạo project riêng)'}\n`);
