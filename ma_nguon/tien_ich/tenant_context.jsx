/**
 * Ngữ cảnh tenant (Mô hình A): mỗi build gắn một org_id cố định.
 * Đọc từ EXPO_PUBLIC_ORG_ID → app.config extra → mặc định phuongchau_soc_trang.
 */
import { Platform } from 'react-native';

const ORG_PREFIX = 'CDSS_ORG_';
const DEFAULT_ORG_ID = 'phuongchau_soc_trang';

/** Alias org cũ → org chuẩn (migration / Firebase legacy). */
const LEGACY_ORG_MAP = Object.freeze({
  phuongchau: 'phuongchau_soc_trang',
});

/** Key UI thiết bị — không prefix theo BV. */
const GLOBAL_STORAGE_KEYS = new Set([
  'CDSS_CHU_DE_HIEN_TAI',
  'CDSS_CHE_DO_SANG_TOI',
  'CDSS_NAV_STATE_V1',
  'TAB_DANG_MO',
  'TAB_CHUYEN_MON_DANG_MO',
  'BYT_7603_ACTIVE_TAB',
]);

let _cachedOrgId = null;
let _cachedProfile = null;

const getEnv = (key) => {
  try {
    if (typeof process !== 'undefined' && process.env?.[key]) {
      return String(process.env[key]).trim();
    }
  } catch {
    /* ignore */
  }
  return '';
};

const getExpoExtra = () => {
  try {
    // eslint-disable-next-line global-require
    const Constants = require('expo-constants').default;
    return Constants?.expoConfig?.extra || Constants?.manifest?.extra || {};
  } catch {
    return {};
  }
};

const chuanHoaOrgId = (raw) => {
  const token = String(raw || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
  if (!token) return '';
  return LEGACY_ORG_MAP[token] || token;
};

/**
 * org_id của build hiện tại (cố định theo Mô hình A).
 */
export const resolveOrgId = () => {
  if (_cachedOrgId) return _cachedOrgId;

  const fromEnv = chuanHoaOrgId(
    getEnv('EXPO_PUBLIC_ORG_ID')
    || getEnv('EXPO_PUBLIC_FIREBASE_ORG_ID'),
  );
  if (fromEnv) {
    _cachedOrgId = fromEnv;
    return _cachedOrgId;
  }

  const extra = getExpoExtra();
  const fromExtra = chuanHoaOrgId(extra?.orgId || extra?.firebase?.orgId);
  if (fromExtra) {
    _cachedOrgId = fromExtra;
    return _cachedOrgId;
  }

  _cachedOrgId = DEFAULT_ORG_ID;
  return _cachedOrgId;
};

export const resolveFirebaseOrgId = () => {
  const profile = layTenantProfile();
  return String(profile?.firebaseOrgId || profile?.orgId || resolveOrgId()).trim();
};

export const layTenantProfile = () => {
  if (_cachedProfile) return _cachedProfile;
  const extra = getExpoExtra();
  _cachedProfile = extra?.tenant || null;
  return _cachedProfile;
};

export const layThongTinCoSoTenant = () => {
  const profile = layTenantProfile();
  if (profile?.thongTinCoSo && typeof profile.thongTinCoSo === 'object') {
    return profile.thongTinCoSo;
  }
  return null;
};

export const isGlobalStorageKey = (baseKey = '') => {
  const key = String(baseKey || '').trim();
  if (!key) return true;
  if (GLOBAL_STORAGE_KEYS.has(key)) return true;
  if (key.startsWith(`${ORG_PREFIX}`)) return true;
  return false;
};

/**
 * Prefix key AsyncStorage/localStorage: CDSS_ORG_{orgId}_{baseKey}
 */
export const prefixStorageKey = (baseKey = '') => {
  const key = String(baseKey || '').trim();
  if (!key || isGlobalStorageKey(key)) return key;
  const orgId = resolveOrgId();
  const expected = `${ORG_PREFIX}${orgId}_`;
  if (key.startsWith(expected)) return key;
  return `${expected}${key}`;
};

export const unprefixStorageKey = (prefixedKey = '') => {
  const key = String(prefixedKey || '').trim();
  const orgId = resolveOrgId();
  const prefix = `${ORG_PREFIX}${orgId}_`;
  if (key.startsWith(prefix)) return key.slice(prefix.length);
  return key;
};

export const resolveIdbName = (baseName = '') => {
  const base = String(baseName || '').trim();
  const orgId = resolveOrgId();
  return `${base}__${orgId}`;
};

export const tenantMigrationFlagKey = () => `${ORG_PREFIX}${resolveOrgId()}_MIGRATION_V1_DONE`;

export const TENANT_KEY_PREFIXES = Object.freeze([
  'CDSS_DATA_',
  'CDSS_COLS_',
  'COLS_',
  'DANH_MUC_',
  'BYT_7603_',
  'DVKT_',
  'DATA_XML',
  'KHO_XML_',
  'SESSION_DOC_XML_',
  'CDSS_ON_OFF_',
  'CDSS_GHI_DE_',
  'CDSS_AN_KHOI_',
  'CDSS_BACKUP_',
  'CDSS_RULE_SEED_',
  'CDSS_CLEANUP_',
  'CDSS_KHO_',
  'CDSS_HS_',
  'CDSS_LSBN_',
  'CDSS_LSGDMLK_',
  'CDSS_LICH_SU_',
  'CDSS_TRI_THUC_',
  'CDSS_AUDIT_',
  'CDSS_DATA_ICD_',
  'CDSS_THU_VIEN_',
  'CATALOG_',
  'FIREBASE_DVKT_',
  'RBAC_',
  'ACL_USER_',
  'USER_ACCOUNT',
  'USER_ROLE',
  'DANH_SACH_TAI_KHOAN',
  'HE_THONG_NHAT_KY_HOAT_DONG',
  'THONG_TIN_CO_SO',
  '@DM_BYT_',
]);

export const matchesTenantKeyPrefix = (key = '') => {
  const k = String(key || '');
  return TENANT_KEY_PREFIXES.some((p) => k === p || k.startsWith(p));
};

export const laMoiTruongWeb = () => Platform.OS === 'web' || (typeof window !== 'undefined' && !!window?.localStorage);

/** Reset cache (chỉ dùng trong test). */
export const _resetTenantContextCache = () => {
  _cachedOrgId = null;
  _cachedProfile = null;
};

export default {
  resolveOrgId,
  resolveFirebaseOrgId,
  layTenantProfile,
  layThongTinCoSoTenant,
  prefixStorageKey,
  unprefixStorageKey,
  resolveIdbName,
  isGlobalStorageKey,
  tenantMigrationFlagKey,
  matchesTenantKeyPrefix,
  TENANT_KEY_PREFIXES,
};
