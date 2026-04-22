import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import {
    COT_SEED_LUAT_THUOC_MUC8,
    DU_LIEU_SEED_LUAT_THUOC_MUC8,
    PHIEN_BAN_SEED_LUAT_THUOC_MUC8,
} from './du_lieu_luat_thuoc_muc8';

const KHOA_MIGRATION_SEED = 'CDSS_RULE_SEED_MIGRATIONS_V1';
const KHOA_PHIEN_BAN_SEED = 'LUAT_THUOC_MUC8';
const KHOA_DU_LIEU = ['CDSS_DATA_LUAT_THUOC', 'CDSS_DATA_XML2'];
const KHOA_COT = ['CDSS_COLS_LUAT_THUOC', 'CDSS_COLS_XML2'];
const COT_MAC_DINH = ['TRANG_THAI', 'MA_LUAT', 'TEN_QUY_TAC', 'DIEU_KIEN', 'CANH_BAO', 'GHI_CHU', 'NGUON_DU_LIEU'];

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
  id: String(row?.id || `SEED_THUOC_${index + 1}`),
  TRANG_THAI: chuanHoaTrangThai(row?.TRANG_THAI),
  MA_LUAT: String(row?.MA_LUAT || '').trim(),
  TEN_QUY_TAC: String(row?.TEN_QUY_TAC || '').trim(),
  DIEU_KIEN: String(row?.DIEU_KIEN || '').trim(),
  CANH_BAO: String(row?.CANH_BAO || '').trim(),
  GHI_CHU: String(row?.GHI_CHU || '').trim(),
  NGUON_DU_LIEU: String(row?.NGUON_DU_LIEU || 'DuLieu_LUAT_THUOC (9).xlsx').trim(),
});

const hopNhatCot = (existingCols = []) => {
  const merged = [...COT_MAC_DINH];
  [...(Array.isArray(existingCols) ? existingCols : []), ...COT_SEED_LUAT_THUOC_MUC8].forEach((col) => {
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
    GHI_CHU: n.GHI_CHU,
    NGUON_DU_LIEU: n.NGUON_DU_LIEU,
  };
};

const dongLuatBangNhau = (a, b) => {
  const khoaOnDinh = (x) =>
    `${String(x.MA_LUAT || '')}\0${String(x.TEN_QUY_TAC || '')}\0${String(x.DIEU_KIEN || '')}\0${String(x.CANH_BAO || '')}\0${String(x.GHI_CHU || '')}`;
  const listA = (Array.isArray(a) ? a : []).map((row, i) => tomTatNoiDungDongLuat(row, i));
  const listB = (Array.isArray(b) ? b : []).map((row, i) => tomTatNoiDungDongLuat(row, i));
  listA.sort((x, y) => khoaOnDinh(x).localeCompare(khoaOnDinh(y)));
  listB.sort((x, y) => khoaOnDinh(x).localeCompare(khoaOnDinh(y)));
  return JSON.stringify(listA) === JSON.stringify(listB);
};

/** Ưu tiên nội dung bundle cho MA có trong seed; giữ quy tắc BV. Giữ TRANG_THAI OFF nếu người dùng đã tắt. */
const hopNhatDongLuat = (existingRows = [], seedRows = []) => {
  const seedNorm = (Array.isArray(seedRows) ? seedRows : []).map((row, index) => chuanHoaDongLuat(row, index));
  const seedByMa = new Map();
  seedNorm.forEach((n) => {
    const ma = String(n.MA_LUAT || '').trim().toUpperCase();
    if (ma) seedByMa.set(ma, n);
  });

  const existingNorm = (Array.isArray(existingRows) ? existingRows : []).map((row, index) => chuanHoaDongLuat(row, index));
  const existingFirstByMa = new Map();
  existingNorm.forEach((n) => {
    const ma = String(n.MA_LUAT || '').trim().toUpperCase();
    if (ma && !existingFirstByMa.has(ma)) existingFirstByMa.set(ma, n);
  });

  const merged = [];
  const seedMaEmitted = new Set();

  existingNorm.forEach((row) => {
    const ma = String(row.MA_LUAT || '').trim().toUpperCase();
    if (ma && seedByMa.has(ma)) {
      if (!seedMaEmitted.has(ma)) {
        const seedRow = seedByMa.get(ma);
        const prev = existingFirstByMa.get(ma);
        const out =
          prev && chuanHoaTrangThai(prev.TRANG_THAI) === 'OFF' ? { ...seedRow, TRANG_THAI: 'OFF' } : seedRow;
        merged.push(out);
        seedMaEmitted.add(ma);
      }
      return;
    }
    merged.push(row);
  });

  seedNorm.forEach((n) => {
    const ma = String(n.MA_LUAT || '').trim().toUpperCase();
    if (ma && !seedMaEmitted.has(ma)) {
      merged.push(n);
      seedMaEmitted.add(ma);
    }
  });

  return { mergedRows: merged, addedCount: seedNorm.length };
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

export const damBaoSeedLuatThuocMuc8 = async () => {
  if (promiseDamBaoSeed) return promiseDamBaoSeed;

  promiseDamBaoSeed = (async () => {
    const [rowsHienTai, colsHienTai, migrationMap] = await Promise.all([
      docDuLieuHienTai(KHOA_DU_LIEU),
      docDuLieuHienTai(KHOA_COT),
      docRaw(KHOA_MIGRATION_SEED).then((raw) => parseJSONAnToan(raw, {})),
    ]);

    const { mergedRows, addedCount } = hopNhatDongLuat(rowsHienTai, DU_LIEU_SEED_LUAT_THUOC_MUC8);
    const mergedCols = hopNhatCot(colsHienTai);
    const daApDungDungPhienBan = String(migrationMap?.[KHOA_PHIEN_BAN_SEED] || '') === PHIEN_BAN_SEED_LUAT_THUOC_MUC8;
    const canGhiLai = !daApDungDungPhienBan
      || mergedCols.length !== (Array.isArray(colsHienTai) ? colsHienTai.length : 0)
      || !dongLuatBangNhau(mergedRows, rowsHienTai);

    if (!canGhiLai) {
      return {
        ok: true,
        applied: false,
        added_count: 0,
        total_count: mergedRows.length,
        version: PHIEN_BAN_SEED_LUAT_THUOC_MUC8,
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
      [KHOA_PHIEN_BAN_SEED]: PHIEN_BAN_SEED_LUAT_THUOC_MUC8,
      updated_at: new Date().toISOString(),
    };
    await ghiRaw(KHOA_MIGRATION_SEED, JSON.stringify(migrationMoi));

    return {
      ok: true,
      applied: true,
      added_count: addedCount,
      total_count: mergedRows.length,
      version: PHIEN_BAN_SEED_LUAT_THUOC_MUC8,
    };
  })();

  try {
    return await promiseDamBaoSeed;
  } finally {
    promiseDamBaoSeed = null;
  }
};