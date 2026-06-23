import { Platform } from 'react-native';
import { KHOA_PHIEN_EMAIL, KHOA_PHIEN_ROLE } from './luu_tru_he_thong';
import { tenantGetItem, tenantRemoveItem, tenantSetItem } from './tenant_storage';

const laMoiTruongWeb = () => Platform.OS === 'web' && typeof window !== 'undefined' && !!window.localStorage;

const docGiaTriPhien = async (key) => {
  if (laMoiTruongWeb()) {
    try {
      const localValue = window.localStorage.getItem(key);
      if (localValue) return localValue;
    } catch {
      // ignore localStorage read error and fallback to AsyncStorage
    }
  }

  const asyncValue = await tenantGetItem(key).catch(() => '');
  return String(asyncValue || '');
};

const ghiGiaTriPhien = async (key, value) => {
  const normalizedValue = String(value || '');
  const tasks = [tenantSetItem(key, normalizedValue).catch(() => {})];

  if (laMoiTruongWeb()) {
    tasks.push((async () => {
      try {
        window.localStorage.setItem(key, normalizedValue);
      } catch {
        // ignore localStorage write error
      }
    })());
  }

  await Promise.all(tasks);
};

const xoaGiaTriPhien = async (key) => {
  const tasks = [tenantRemoveItem(key).catch(() => {})];

  if (laMoiTruongWeb()) {
    tasks.push((async () => {
      try {
        window.localStorage.removeItem(key);
      } catch {
        // ignore localStorage remove error
      }
    })());
  }

  await Promise.all(tasks);
};

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
