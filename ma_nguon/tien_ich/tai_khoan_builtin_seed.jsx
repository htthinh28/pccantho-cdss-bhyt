/**
 * Tài khoản nội bộ gắn tenant — merge vào DANH_SACH_TAI_KHOAN khi đăng nhập (IndexedDB web).
 */
import { taoBanGhiTaiKhoanMoi } from './dich_vu_tai_khoan_cdss';
import { luuDanhSachTaiKhoan } from './nhat_ky_he_thong';
import { resolveOrgId } from './tenant_context';

const TAI_KHOAN_BUILTIN_THEO_ORG = {
  phuongchau_can_tho: [
    {
      email: 'trinhm@phuongchau.com',
      hoTen: 'Trinh M',
      khoa: 'Phòng Công nghệ thông tin',
      phong: 'Khối điều hành',
      chucDanh: 'Quản trị hệ thống',
      matKhau: 'pcct@123',
      vaiTro: 'ADMIN',
      trangThai: 'HOAT_DONG',
      buocDoiMatKhau: false,
    },
  ],
};

const PATCH_FIELDS = ['matKhau', 'hoTen', 'khoa', 'phong', 'chucDanh', 'vaiTro', 'trangThai', 'buocDoiMatKhau'];

export const damBaoTaiKhoanBuiltinSeed = async (dsHienTai = []) => {
  const orgId = resolveOrgId();
  const seeds = TAI_KHOAN_BUILTIN_THEO_ORG[orgId] || [];
  if (!seeds.length) return dsHienTai;

  const next = Array.isArray(dsHienTai) ? [...dsHienTai] : [];
  let changed = false;

  seeds.forEach((seed) => {
    const banGhi = taoBanGhiTaiKhoanMoi(seed);
    const em = banGhi.email;
    if (!em) return;

    const idx = next.findIndex((u) => String(u?.email || '').trim().toLowerCase() === em);
    if (idx < 0) {
      next.push(banGhi);
      changed = true;
      return;
    }

    const cur = next[idx];
    const needsUpdate = PATCH_FIELDS.some((k) => String(cur?.[k] ?? '') !== String(banGhi?.[k] ?? ''));
    if (needsUpdate) {
      next[idx] = { ...cur, ...banGhi };
      changed = true;
    }
  });

  if (!changed) return dsHienTai;
  return luuDanhSachTaiKhoan(next, 'SYSTEM');
};
