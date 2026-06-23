/**
 * QA: lưu trữ tài khoản + RBAC (IndexedDB migrate, backup JSON).
 * Chạy: node scripts/qa_tai_khoan_rbac.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');

const assert = (cond, msg) => {
  if (!cond) throw new Error(msg);
};

// --- Logic gộp tài khoản (đồng bộ với luu_tru_he_thong.jsx) ---
const gopHaiMangTaiKhoan = (arrA, arrB) => {
  const map = new Map();
  const tsTaiKhoan = (u) => Date.parse(u?.capNhatLuc || u?.taoLuc || '') || 0;
  const them = (u) => {
    if (!u || typeof u !== 'object') return;
    const email = String(u.email || '').trim().toLowerCase();
    if (!email) return;
    const existing = map.get(email);
    if (!existing) {
      map.set(email, u);
      return;
    }
    const merged = tsTaiKhoan(u) >= tsTaiKhoan(existing)
      ? { ...existing, ...u }
      : { ...u, ...existing };
    map.set(email, merged);
  };
  for (const u of [...(Array.isArray(arrA) ? arrA : []), ...(Array.isArray(arrB) ? arrB : [])]) them(u);
  return Array.from(map.values());
};

const merged = gopHaiMangTaiKhoan(
  [{ email: 'a@v.vn', capNhatLuc: '2026-01-01T00:00:00.000Z' }],
  [
    { email: 'a@v.vn', matKhau: 'new', capNhatLuc: '2026-06-08T00:00:00.000Z' },
    { email: 'b@v.vn', hoTen: 'B' },
  ],
);
assert(merged.length === 2, 'merge accounts failed');
assert(merged.find((u) => u.email === 'a@v.vn')?.matKhau === 'new', 'should prefer newer account');

// --- Cấu trúc backup JSON ---
const PHIEU_BAN_TAI_KHOAN_RBAC_VERSION = 1;
const RBAC_KEYS = {
  RESOURCES: 'RBAC_RESOURCES_V1',
  ROLES: 'RBAC_ROLES_V1',
  GROUPS: 'RBAC_GROUPS_V1',
  MATRIX: 'RBAC_ROLE_MATRIX_V1',
  USER_BINDINGS: 'RBAC_USER_BINDINGS_V1',
};

const validateBackupPayload = (payload) => {
  if (!payload || typeof payload !== 'object') return false;
  if (payload.version !== PHIEU_BAN_TAI_KHOAN_RBAC_VERSION) return false;
  if (!Array.isArray(payload.accounts)) return false;
  if (!payload.rbac || typeof payload.rbac !== 'object') return false;
  const { resources, roles, groups, matrix, userBindings } = payload.rbac;
  return [resources, roles, groups, matrix, userBindings].every((x) => x != null);
};

assert(
  validateBackupPayload({
    version: PHIEU_BAN_TAI_KHOAN_RBAC_VERSION,
    exported_at: new Date().toISOString(),
    accounts: [{ email: 'x@v.vn' }],
    rbac: {
      resources: [],
      roles: [],
      groups: [],
      matrix: {},
      userBindings: {},
    },
    rbac_keys: RBAC_KEYS,
  }),
  'valid backup payload rejected',
);
assert(!validateBackupPayload({ version: 99 }), 'invalid version should fail');

// --- Kiểm tra tích hợp mã nguồn ---
const luuTru = read('ma_nguon/tien_ich/luu_tru_he_thong.jsx');
const rbac = read('ma_nguon/tien_ich/rbac_engine.jsx');
const saoLuu = read('ma_nguon/tien_ich/sao_luu_tai_khoan_rbac.jsx');
const phanQuyen = read('ma_nguon/man_hinh/phan_quyen_truy_cap.jsx');
const dangNhap = read('ma_nguon/man_hinh/dang_nhap.jsx');

assert(luuTru.includes('CDSS_HE_THONG_DB'), 'missing IndexedDB name');
assert(luuTru.includes('damBaoMigrateKhoaHeThong'), 'missing migrate helper');
assert(rbac.includes('damBaoMigratePhanQuyen'), 'missing RBAC migrate');
assert(rbac.includes('docChuoiHeThong'), 'RBAC should use luu_tru_he_thong');
assert(saoLuu.includes('taoPhieuBanTaiKhoanRbac'), 'missing backup export');
assert(saoLuu.includes('phucHoiPhieuBanTaiKhoanRbac'), 'missing backup restore');
assert(phanQuyen.includes('damBaoMigratePhanQuyen'), 'phan_quyen should migrate on init');
assert(phanQuyen.includes('xuatPhieuBanTaiKhoanRbacWeb'), 'phan_quyen should export backup');
assert(dangNhap.includes('damBaoMigratePhanQuyen'), 'dang_nhap should migrate before load users');

console.log(JSON.stringify({
  ok: true,
  tests: ['merge_accounts', 'backup_payload', 'source_integration'],
}, null, 2));
