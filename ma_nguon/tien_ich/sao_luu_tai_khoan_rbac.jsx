/**
 * Sao lưu / phục hồi tài khoản + RBAC — dùng khi đổi máy, build mới hoặc đổi origin.
 */
import { Platform } from 'react-native';
import { docDanhSachTaiKhoan, ghiNhatKyHeThong, luuDanhSachTaiKhoan } from './nhat_ky_he_thong';
import { damBaoMigratePhanQuyen, luuRBAC, RBAC_KEYS, taiRBAC } from './rbac_engine';
import { docChuoiHeThong, ghiChuoiHeThong, laMoiTruongWeb } from './luu_tru_he_thong';

export const PHIEU_BAN_TAI_KHOAN_RBAC_VERSION = 1;

const nowIso = () => new Date().toISOString();

const docLegacyAclSnapshot = async () => {
  const snapshot = {};
  if (!laMoiTruongWeb()) return snapshot;
  try {
    const keys = Object.keys(window.localStorage).filter((k) => k.startsWith('ACL_USER_'));
    for (const key of keys) {
      const val = await docChuoiHeThong(key);
      if (val != null) snapshot[key] = val;
    }
  } catch {
    /* */
  }
  return snapshot;
};

export const taoPhieuBanTaiKhoanRbac = async () => {
  await damBaoMigratePhanQuyen();
  const [accounts, rbac, legacyAcl] = await Promise.all([
    docDanhSachTaiKhoan(),
    taiRBAC(),
    docLegacyAclSnapshot(),
  ]);
  return {
    version: PHIEU_BAN_TAI_KHOAN_RBAC_VERSION,
    exported_at: nowIso(),
    accounts,
    rbac: {
      resources: rbac.resources,
      roles: rbac.roles,
      groups: rbac.groups,
      matrix: rbac.matrix,
      userBindings: rbac.userBindings,
    },
    legacy_acl: legacyAcl,
    rbac_keys: RBAC_KEYS,
  };
};

export const xuatPhieuBanTaiKhoanRbacWeb = async ({ reason = 'MANUAL_EXPORT' } = {}) => {
  if (!laMoiTruongWeb()) {
    return { ok: false, message: 'Export JSON chỉ hỗ trợ trên web.' };
  }
  const payload = await taoPhieuBanTaiKhoanRbac();
  payload.reason = reason;
  const fileName = `CDSS_TAI_KHOAN_RBAC_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
  const href = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = href;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(href);
  return { ok: true, fileName, account_count: payload.accounts?.length || 0 };
};

export const phucHoiPhieuBanTaiKhoanRbac = async (payload, { nguoiThucHien = 'ADMIN', ghiDe = true } = {}) => {
  if (!payload || typeof payload !== 'object') {
    return { ok: false, message: 'File sao lưu không hợp lệ.' };
  }
  const accounts = Array.isArray(payload.accounts) ? payload.accounts : [];
  const rbacCfg = payload.rbac;
  if (!accounts.length && !rbacCfg) {
    return { ok: false, message: 'Gói sao lưu trống — không có tài khoản hoặc RBAC.' };
  }

  let dsLuu = accounts;
  if (!ghiDe && accounts.length) {
    const hienTai = await docDanhSachTaiKhoan();
    const emails = new Set(hienTai.map((u) => u.email));
    const trung = accounts.filter((u) => emails.has(String(u.email || '').toLowerCase()));
    if (trung.length) {
      return {
        ok: false,
        message: `Có ${trung.length} email đã tồn tại. Bật ghi đè hoặc xóa trùng trước khi phục hồi.`,
      };
    }
    dsLuu = [...hienTai, ...accounts];
  }

  if (dsLuu.length) {
    await luuDanhSachTaiKhoan(dsLuu, nguoiThucHien);
  }

  if (rbacCfg && typeof rbacCfg === 'object') {
    await luuRBAC({
      resources: rbacCfg.resources,
      roles: rbacCfg.roles,
      groups: rbacCfg.groups,
      matrix: rbacCfg.matrix,
      userBindings: rbacCfg.userBindings,
    });
  }

  const legacyAcl = payload.legacy_acl && typeof payload.legacy_acl === 'object' ? payload.legacy_acl : {};
  await Promise.all(
    Object.entries(legacyAcl).map(([key, val]) => ghiChuoiHeThong(key, val)),
  );

  await ghiNhatKyHeThong({
    hanhDong: 'PHUC_HOI_TAI_KHOAN_RBAC',
    doiTuong: 'HE_THONG',
    chiTiet: `Phục hồi ${dsLuu.length} tài khoản + RBAC từ backup ${payload.exported_at || 'N/A'}`,
    taiKhoan: nguoiThucHien,
    vaiTro: 'ADMIN',
  });

  return {
    ok: true,
    account_count: dsLuu.length,
    message: `Đã phục hồi ${dsLuu.length} tài khoản và cấu hình phân quyền.`,
  };
};

/** Đọc file JSON (web: từ input file). */
export const docPhieuBanTuFileWeb = (file) => new Promise((resolve, reject) => {
  if (Platform.OS !== 'web' || !file) {
    reject(new Error('Chỉ hỗ trợ đọc file trên web.'));
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    try {
      resolve(JSON.parse(String(reader.result || '{}')));
    } catch (e) {
      reject(new Error('File JSON không hợp lệ.'));
    }
  };
  reader.onerror = () => reject(new Error('Không đọc được file.'));
  reader.readAsText(file);
});
