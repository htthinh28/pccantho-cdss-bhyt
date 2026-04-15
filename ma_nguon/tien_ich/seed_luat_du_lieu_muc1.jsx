import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import {
    COT_SEED_LUAT_DU_LIEU_MUC1,
    DU_LIEU_SEED_LUAT_DU_LIEU_MUC1,
    PHIEN_BAN_SEED_LUAT_DU_LIEU_MUC1,
} from './du_lieu_luat_du_lieu_muc1';

const KHOA_MIGRATION_SEED = 'CDSS_RULE_SEED_MIGRATIONS_V1';
const KHOA_PHIEN_BAN_SEED = 'LUAT_DU_LIEU_MUC1';
const KHOA_DU_LIEU = ['CDSS_DATA_LUAT_DU_LIEU', 'CDSS_DATA_XML_DATA'];
const KHOA_COT = ['CDSS_COLS_LUAT_DU_LIEU', 'CDSS_COLS_XML_DATA'];
const MA_LUAT_CAN_CAP_NHAT = new Set([
  'XML_10',
  'XML_26',
  'XML_22',
  'XML_36',
  'XML_37',
  'XML_38',
  'XML_40',
  'XML_49',
  'XML_53',
  'XML_54',
  'XML_59',
  'XML_62',
  'XML_68',
  'XML_73',
  'XML_88',
  'XML_90',
  'XML_91',
  'XML_95',
  'XML_97',
  'XML_98',
  'XML_99',
  'XML_101',
  'XML_18',
  'XML_19',
  'XML_79',
  'XML_87',
  'XML_64',
  'XML_105',
  'XML_115',
  'XML_121',
  'XML_108',
  'XML_109',
  'XML_137',
  'XML_143',
  'CDSS_CM_01',
  'CDSS_CM_02',
]);
const MA_LUAT_CAN_XOA = new Set([
  'XML_05',
  'XML_06',
  'XML_09',
  'XML_11',
  'XML_21',
  'XML_28',
  'XML_30',
  'XML_31',
  'XML_51',
  'XML_52',
  'XML_58',
  'XML_61',
  'XML_63',
  'XML_65',
  'XML_89',
  'XML_94',
  'XML_113',
  'XML_117',
  'XML_118',
  'XML_126',
  'XML_127',
  'XML_133',
  'XML_135',
  'XML_139',
  'XML_140',
  'XML_106',
  'XML_110',
  'XML_111',
  'XML_123',
  'XML_130',
  'XML_143',
]);
const COT_MAC_DINH = ['TRANG_THAI', 'MA_LUAT', 'TEN_QUY_TAC', 'DIEU_KIEN', 'CANH_BAO', 'DIEU_KIEN (Toán tử No-Code)', 'GHI_CHU_SUA', 'NGUON_DU_LIEU'];

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
  ...row,
  id: String(row?.id || `SEED_DULIEU_${index + 1}`),
  TRANG_THAI: chuanHoaTrangThai(row?.TRANG_THAI),
  MA_LUAT: String(row?.MA_LUAT || '').trim(),
  TEN_QUY_TAC: String(row?.TEN_QUY_TAC || '').trim(),
  DIEU_KIEN: String(row?.DIEU_KIEN || '').trim(),
  CANH_BAO: String(row?.CANH_BAO || '').trim(),
  'DIEU_KIEN (Toán tử No-Code)': String(row?.['DIEU_KIEN (Toán tử No-Code)'] || '').trim(),
  GHI_CHU_SUA: String(row?.GHI_CHU_SUA || '').trim(),
  NGUON_DU_LIEU: String(row?.NGUON_DU_LIEU || 'DuLieu_LUAT_DU_LIEU (12).xlsx').trim(),
});

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
      // ignore localStorage write issues
    }
  }
  await AsyncStorage.setItem(key, raw).catch(() => {});
};

const docDuLieuHienTai = async (keys, fallback) => {
  for (const key of keys) {
    const parsed = parseJSONAnToan(await docRaw(key), fallback);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  }
  return fallback;
};

const hopNhatCot = (existingCols = []) => {
  const merged = [...COT_MAC_DINH];
  [...(Array.isArray(existingCols) ? existingCols : []), ...COT_SEED_LUAT_DU_LIEU_MUC1].forEach((col) => {
    const value = String(col || '').trim();
    if (!value || merged.includes(value)) return;
    merged.push(value);
  });
  return merged;
};

const upsertDongLuatTheoMa = (existingRows = [], seedRows = []) => {
  const normalizedExisting = (Array.isArray(existingRows) ? existingRows : []).map(chuanHoaDongLuat);
  const mapSeed = new Map(seedRows.map((row, index) => {
    const normalized = chuanHoaDongLuat(row, index);
    return [normalized.MA_LUAT.toUpperCase(), normalized];
  }));

  let updatedCount = 0;
  const mergedRows = normalizedExisting.map((row) => {
    const ma = String(row?.MA_LUAT || '').trim().toUpperCase();
    if (!mapSeed.has(ma)) return row;
    const seedRow = mapSeed.get(ma);
    updatedCount += 1;
    return {
      ...row,
      ...seedRow,
      TRANG_THAI: row?.TRANG_THAI || seedRow.TRANG_THAI,
    };
  });

  mapSeed.forEach((row, ma) => {
    if (mergedRows.some((existing) => String(existing?.MA_LUAT || '').trim().toUpperCase() === ma)) return;
    mergedRows.push(row);
    updatedCount += 1;
  });

  return { mergedRows, updatedCount };
};

const xoaDongLuatTheoMa = (existingRows = [], maCanXoa = new Set()) => {
  if (!Array.isArray(existingRows) || maCanXoa.size === 0) {
    return { filteredRows: Array.isArray(existingRows) ? existingRows : [], removedCount: 0 };
  }

  let removedCount = 0;
  const filteredRows = existingRows.filter((row) => {
    const ma = String(row?.MA_LUAT || '').trim().toUpperCase();
    const keep = !maCanXoa.has(ma);
    if (!keep) removedCount += 1;
    return keep;
  });

  return { filteredRows, removedCount };
};

export const damBaoSeedLuatDuLieuMuc1 = async () => {
  if (promiseDamBaoSeed) return promiseDamBaoSeed;

  promiseDamBaoSeed = (async () => {
    const seedRows = DU_LIEU_SEED_LUAT_DU_LIEU_MUC1.filter((row) => MA_LUAT_CAN_CAP_NHAT.has(String(row?.MA_LUAT || '').trim().toUpperCase()));
    const [rowsHienTai, colsHienTai, migrationMap] = await Promise.all([
      docDuLieuHienTai(KHOA_DU_LIEU, []),
      docDuLieuHienTai(KHOA_COT, []),
      docRaw(KHOA_MIGRATION_SEED).then((raw) => parseJSONAnToan(raw, {})),
    ]);

    const { filteredRows, removedCount } = xoaDongLuatTheoMa(rowsHienTai, MA_LUAT_CAN_XOA);
    const { mergedRows, updatedCount } = upsertDongLuatTheoMa(filteredRows, seedRows);
    const mergedCols = hopNhatCot(colsHienTai);
    const daApDungDungPhienBan = String(migrationMap?.[KHOA_PHIEN_BAN_SEED] || '') === PHIEN_BAN_SEED_LUAT_DU_LIEU_MUC1;
    const canGhiLai = updatedCount > 0 || removedCount > 0 || !daApDungDungPhienBan || mergedCols.length !== (Array.isArray(colsHienTai) ? colsHienTai.length : 0);

    if (!canGhiLai) {
      return {
        ok: true,
        applied: false,
        updated_count: 0,
        removed_count: 0,
        total_count: mergedRows.length,
        version: PHIEN_BAN_SEED_LUAT_DU_LIEU_MUC1,
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
      [KHOA_PHIEN_BAN_SEED]: PHIEN_BAN_SEED_LUAT_DU_LIEU_MUC1,
      updated_at: new Date().toISOString(),
    };
    await ghiRaw(KHOA_MIGRATION_SEED, JSON.stringify(migrationMoi));

    return {
      ok: true,
      applied: true,
      updated_count: updatedCount,
      removed_count: removedCount,
      total_count: mergedRows.length,
      version: PHIEN_BAN_SEED_LUAT_DU_LIEU_MUC1,
    };
  })();

  try {
    return await promiseDamBaoSeed;
  } finally {
    promiseDamBaoSeed = null;
  }
};