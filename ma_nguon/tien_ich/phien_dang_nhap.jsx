import {
  docChuoiHeThong,
  ghiChuoiHeThong,
  KHOA_PHIEN_EMAIL,
  KHOA_PHIEN_ROLE,
  xoaChuoiHeThong,
} from './luu_tru_he_thong';

const docGiaTriPhien = (key) => docChuoiHeThong(key);

const ghiGiaTriPhien = async (key, value) => {
  await ghiChuoiHeThong(key, String(value ?? ''));
};

const xoaGiaTriPhien = (key) => xoaChuoiHeThong(key);

export const docPhienDangNhap = async () => {
  const [email, role] = await Promise.all([
    docGiaTriPhien(KHOA_PHIEN_EMAIL),
    docGiaTriPhien(KHOA_PHIEN_ROLE),
  ]);

  return {
    email: String(email || '').trim().toLowerCase(),
    role: String(role || '').trim().toUpperCase(),
  };
};

export const coPhienDangNhapHopLe = async () => {
  const session = await docPhienDangNhap();
  return Boolean(session.email && session.role);
};

export const luuPhienDangNhap = async (email, role) => {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const normalizedRole = String(role || 'USER').trim().toUpperCase() || 'USER';
  await Promise.all([
    ghiGiaTriPhien(KHOA_PHIEN_EMAIL, normalizedEmail),
    ghiGiaTriPhien(KHOA_PHIEN_ROLE, normalizedRole),
  ]);
  return { email: normalizedEmail, role: normalizedRole };
};

export const xoaPhienDangNhap = async () => {
  await Promise.all([
    xoaGiaTriPhien(KHOA_PHIEN_EMAIL),
    xoaGiaTriPhien(KHOA_PHIEN_ROLE),
  ]);
};
