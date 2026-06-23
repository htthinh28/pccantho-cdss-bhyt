import { Platform } from 'react-native';
import { tenantGetItem, tenantRemoveItem, tenantSetItem } from './tenant_storage';

const SESSION_ACCOUNT_KEY = 'USER_ACCOUNT';
const SESSION_ROLE_KEY = 'USER_ROLE';

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
    docGiaTriPhien(SESSION_ACCOUNT_KEY),
    docGiaTriPhien(SESSION_ROLE_KEY),
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
    ghiGiaTriPhien(SESSION_ACCOUNT_KEY, normalizedEmail),
    ghiGiaTriPhien(SESSION_ROLE_KEY, normalizedRole),
  ]);
  return { email: normalizedEmail, role: normalizedRole };
};

export const xoaPhienDangNhap = async () => {
  await Promise.all([
    xoaGiaTriPhien(SESSION_ACCOUNT_KEY),
    xoaGiaTriPhien(SESSION_ROLE_KEY),
  ]);
};