import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import {
    COT_SEED_LUAT_HANH_CHINH_MUC2,
    DU_LIEU_SEED_LUAT_HANH_CHINH_MUC2,
    PHIEN_BAN_SEED_LUAT_HANH_CHINH_MUC2,
} from './du_lieu_luat_hanh_chinh_muc2';

const KHOA_MIGRATION_SEED = 'CDSS_RULE_SEED_MIGRATIONS_V1';
const KHOA_PHIEN_BAN_SEED = 'LUAT_HANH_CHINH_MUC2';
const KHOA_DU_LIEU = ['CDSS_DATA_LUAT_HANH_CHINH', 'CDSS_DATA_XML1'];
const KHOA_COT = ['CDSS_COLS_LUAT_HANH_CHINH', 'CDSS_COLS_XML1'];
const COT_MAC_DINH = ['TRANG_THAI', 'MA_LUAT', 'TEN_QUY_TAC', 'DIEU_KIEN', 'CANH_BAO', 'NGUON_DU_LIEU'];

let promiseDamBaoSeed = null;

const laMoiTruongWeb = () => Platform.OS === 'web' && typeof window !== 'undefined' && !!window.localStorage;

const parseJSONAnToan = (raw, fallback) => {
  try {
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const chuanHoaTrangThai = (value) => String(value || 'ON').trim().toUpperCase() === 'OFF' ? 'OFF' : 'ON';

const chuanHoaDongLuat = (row, index = 0) => ({
  id: String(row?.id || `SEED_HANHCHINH_${index + 1}`),
  TRANG_THAI: chuanHoaTrangThai(row?.TRANG_THAI),
  MA_LUAT: String(row?.MA_LUAT || '').trim(),
  TEN_QUY_TAC: String(row?.TEN_QUY_TAC || '').trim(),
  DIEU_KIEN: String(row?.DIEU_KIEN || '').trim(),
  CANH_BAO: String(row?.CANH_BAO || '').trim(),
  NGUON_DU_LIEU: String(row?.NGUON_DU_LIEU || 'DuLieu_LUAT_HANH_CHINH (7).xlsx').trim(),
});

const hopNhatCot = (existingCols = []) => {
  const merged = [...COT_MAC_DINH];
  [...(Array.isArray(existingCols) ? existingCols : []), ...COT_SEED_LUAT_HANH_CHINH_MUC2].forEach((col) => {
    const value = String(col || '').trim();
    if (!value || merged.includes(value)) return;
    merged.push(value);
  });
  return merged;
};

const tomTatNoiDungDongLuat = (row, index = 0) => {
  const n = chuanHoaDongLuat(row, index);
  return {
    MA_LUAT: n.MA_LUAT,
    TRANG_THAI: n.TRANG_THAI,
    TEN_QUY_TAC: n.TEN_QUY_TAC,
    DIEU_KIEN: n.DIEU_KIEN,
    CANH_BAO: n.CANH_BAO,
    NGUON_DU_LIEU: n.NGUON_DU_LIEU,
  };
};

const dongLuatBangNhau = (a, b) => {
  const khoaOnDinh = (x) => `${String(x.MA_LUAT || '')}\0${String(x.TEN_QUY_TAC || '')}\0${String(x.DIEU_KIEN || '')}\0${String(x.CANH_BAO || '')}`;
  const listA = (Array.isArray(a) ? a : []).map((row, i) => tomTatNoiDungDongLuat(row, i));
  const listB = (Array.isArray(b) ? b : []).map((row, i) => tomTatNoiDungDongLuat(row, i));
  listA.sort((x, y) => khoaOnDinh(x).localeCompare(khoaOnDinh(y)));
  listB.sort((x, y) => khoaOnDinh(x).localeCompare(khoaOnDinh(y)));
  return JSON.stringify(listA) === JSON.stringify(listB);
};

/** Ưu tiên nội dung bundle cho mọi MA có trong seed; giữ quy tắc BV (MA không có trong seed). Giữ TRANG_THAI OFF nếu người dùng đã tắt quy tắc seed. */
const hopNhatDongLuatUuTienSeed = (existingRows = [], seedRows = []) => {
  const existingByMa = new Map();
  (Array.isArray(existingRows) ? existingRows : []).forEach((row, index) => {
    const n = chuanHoaDongLuat(row, index);
    const ma = String(n?.MA_LUAT || '').trim().toUpperCase();
    if (ma) existingByMa.set(ma, n);
  });

  const seedNormalized = (Array.isArray(seedRows) ? seedRows : []).map((row, index) => {
    const s = chuanHoaDongLuat(row, index);
    const ma = String(s?.MA_LUAT || '').trim().toUpperCase();
    const prev = ma ? existingByMa.get(ma) : null;
    if (prev && chuanHoaTrangThai(prev.TRANG_THAI) === 'OFF') {
      return { ...s, TRANG_THAI: 'OFF' };
    }
    return s;
  });
  const maTrongSeed = new Set(
    seedNormalized.map((r) => String(r?.MA_LUAT || '').trim().toUpperCase()).filter(Boolean),
  );
  const customLocal = (Array.isArray(existingRows) ? existingRows : [])
    .map((row, index) => chuanHoaDongLuat(row, index))
    .filter((r) => {
      const ma = String(r?.MA_LUAT || '').trim().toUpperCase();
      return Boolean(ma) && !maTrongSeed.has(ma);
    });
  return { mergedRows: [...seedNormalized, ...customLocal], addedCount: seedNormalized.length };
};

const docRaw = async (key) => {
  if (laMoiTruongWeb()) {
    const rawWeb = window.localStorage.getItem(key);
    if (rawWeb !== null && rawWeb !== undefined) return rawWeb;
  }
  return AsyncStorage.getItem(key);
};

const ghiRaw = async (key, raw) => {
  if (laMoiTruongWeb()) {
    try {
      window.localStorage.setItem(key, raw);
    } catch {
      // ignore localStorage quota/write issues here; AsyncStorage remains the fallback.
    }
  }
  await AsyncStorage.setItem(key, raw).catch(() => {});
};

const docDuLieuHienTai = async (keys) => {
  for (const key of keys) {
    const parsed = parseJSONAnToan(await docRaw(key), []);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  }
  return [];
};

export const damBaoSeedLuatHanhChinhMuc2 = async () => {
  if (promiseDamBaoSeed) return promiseDamBaoSeed;

  promiseDamBaoSeed = (async () => {
    const [rowsHienTai, colsHienTai, migrationMap] = await Promise.all([
      docDuLieuHienTai(KHOA_DU_LIEU),
      docDuLieuHienTai(KHOA_COT),
      docRaw(KHOA_MIGRATION_SEED).then((raw) => parseJSONAnToan(raw, {})),
    ]);

    const daApDungDungPhienBan = String(migrationMap?.[KHOA_PHIEN_BAN_SEED] || '') === PHIEN_BAN_SEED_LUAT_HANH_CHINH_MUC2;
    const { mergedRows, addedCount } = hopNhatDongLuatUuTienSeed(rowsHienTai, DU_LIEU_SEED_LUAT_HANH_CHINH_MUC2);
    const mergedCols = hopNhatCot(colsHienTai);
    const canGhiLai = !daApDungDungPhienBan
      || mergedCols.length !== (Array.isArray(colsHienTai) ? colsHienTai.length : 0)
      || !dongLuatBangNhau(mergedRows, rowsHienTai);

    if (!canGhiLai) {
      return {
        ok: true,
        applied: false,
        added_count: 0,
        total_count: mergedRows.length,
        version: PHIEN_BAN_SEED_LUAT_HANH_CHINH_MUC2,
      };
    }

    const rawRows = JSON.stringify(mergedRows);
    const rawCols = JSON.stringify(mergedCols);
    await Promise.all([
      ...KHOA_DU_LIEU.map((key) => ghiRaw(key, rawRows)),
      ...KHOA_COT.map((key) => ghiRaw(key, rawCols)),
    ]);

    const migrationMoi = {
      ...(migrationMap && typeof migrationMap === 'object' ? migrationMap : {}),
      [KHOA_PHIEN_BAN_SEED]: PHIEN_BAN_SEED_LUAT_HANH_CHINH_MUC2,
      updated_at: new Date().toISOString(),
    };
    await ghiRaw(KHOA_MIGRATION_SEED, JSON.stringify(migrationMoi));

    return {
      ok: true,
      applied: true,
      added_count: addedCount,
      total_count: mergedRows.length,
      version: PHIEN_BAN_SEED_LUAT_HANH_CHINH_MUC2,
    };
  })();

  try {
    return await promiseDamBaoSeed;
  } finally {
    promiseDamBaoSeed = null;
  }
};