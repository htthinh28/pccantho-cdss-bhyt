import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import {
    COT_SEED_LUAT_PTTT_MUC11,
    DU_LIEU_SEED_LUAT_PTTT_MUC11,
    PHIEN_BAN_SEED_LUAT_PTTT_MUC11,
} from './du_lieu_luat_pttt_muc11';

const KHOA_MIGRATION_SEED = 'CDSS_RULE_SEED_MIGRATIONS_V1';
const KHOA_PHIEN_BAN_SEED = 'LUAT_PTTT_MUC11';
const KHOA_DU_LIEU = ['CDSS_DATA_LUAT_PTTT', 'CDSS_DATA_PTTT'];
const KHOA_COT = ['CDSS_COLS_LUAT_PTTT', 'CDSS_COLS_PTTT'];
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
const chuanHoaText = (value) => String(value || '').replace(/\r?\n|\r/g, ' ').replace(/\s+/g, ' ').trim();

const chuanHoaDongLuat = (row, index = 0) => ({
  id: String(row?.id || `SEED_PTTT_${index + 1}`),
  TRANG_THAI: chuanHoaTrangThai(row?.TRANG_THAI),
  MA_LUAT: String(row?.MA_LUAT || '').trim(),
  TEN_QUY_TAC: String(row?.TEN_QUY_TAC || '').trim(),
  DIEU_KIEN: String(row?.DIEU_KIEN || '').trim(),
  CANH_BAO: String(row?.CANH_BAO || '').trim(),
  GHI_CHU: String(row?.GHI_CHU || '').trim(),
  NGUON_DU_LIEU: String(row?.NGUON_DU_LIEU || 'Template_LUAT_PTTT_MUC11').trim(),
});

const taoKhoaDongLuat = (row = {}) => {
  const maLuat = String(row?.MA_LUAT || '').trim().toUpperCase();
  if (maLuat) return `MA:${maLuat}`;

  const dieuKien = chuanHoaText(row?.DIEU_KIEN);
  const canhBao = chuanHoaText(row?.CANH_BAO);
  const tenQuyTac = chuanHoaText(row?.TEN_QUY_TAC);
  return `SIG:${dieuKien}|${canhBao}|${tenQuyTac}`;
};

const hopNhatCot = (existingCols = []) => {
  const merged = [...COT_MAC_DINH];
  [...(Array.isArray(existingCols) ? existingCols : []), ...COT_SEED_LUAT_PTTT_MUC11].forEach((col) => {
    const value = String(col || '').trim();
    if (!value || merged.includes(value)) return;
    merged.push(value);
  });
  return merged;
};

/** Gỡ quy tắc đã xóa khỏi seed: Thực hiện + COUNT_IF(DS_XML5 (đối chiếu XML5 theo từ khóa không tin cậy). */
const laDongLuatDaGoKhoiSeed = (row = {}) => {
  const ten = String(row?.TEN_QUY_TAC || '');
  const dk = String(row?.DIEU_KIEN || '');
  return ten.startsWith('Thực hiện -') && dk.includes('COUNT_IF(DS_XML5');
};

/**
 * Hợp nhất seed với dữ liệu đã lưu cục bộ.
 * @param {{ thayTheToanBoSeed?: boolean }} options — khi true: toàn bộ dòng trùng MA_LUAT với seed được thay bằng bản bundle;
 *   chỉ giữ thêm các dòng cục bộ có MA_LUAT không có trong seed (tùy biến BV).
 */
const hopNhatDongLuat = (existingRows = [], seedRows = [], options = {}) => {
  const thayTheToanBoSeed = options?.thayTheToanBoSeed === true;
  const seedNormalized = (Array.isArray(seedRows) ? seedRows : []).map((row, index) => chuanHoaDongLuat(row, index));
  const maTrongSeed = new Set(
    seedNormalized.map((r) => String(r?.MA_LUAT || '').trim().toUpperCase()).filter(Boolean),
  );

  if (thayTheToanBoSeed) {
    const customLocal = (Array.isArray(existingRows) ? existingRows : [])
      .map((row, index) => chuanHoaDongLuat(row, index))
      .filter((r) => {
        const ma = String(r?.MA_LUAT || '').trim().toUpperCase();
        return Boolean(ma) && !maTrongSeed.has(ma);
      });
    const seen = new Set();
    const merged = [];
    seedNormalized.forEach((row) => {
      const key = taoKhoaDongLuat(row);
      if (seen.has(key)) return;
      seen.add(key);
      merged.push(row);
    });
    customLocal.forEach((row) => {
      const key = taoKhoaDongLuat(row);
      if (seen.has(key)) return;
      seen.add(key);
      merged.push(row);
    });
    return { mergedRows: merged, addedCount: seedNormalized.length };
  }

  const merged = [];
  const seen = new Set();

  (Array.isArray(existingRows) ? existingRows : []).forEach((row, index) => {
    const normalized = chuanHoaDongLuat(row, index);
    const key = taoKhoaDongLuat(normalized);
    if (seen.has(key)) return;
    seen.add(key);
    merged.push(normalized);
  });

  let addedCount = 0;
  seedNormalized.forEach((row, index) => {
    const normalized = row;
    const key = taoKhoaDongLuat(normalized);
    if (seen.has(key)) return;
    seen.add(key);
    merged.push(normalized);
    addedCount += 1;
  });

  return { mergedRows: merged, addedCount };
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

export const damBaoSeedLuatPtttMuc11 = async () => {
  if (promiseDamBaoSeed) return promiseDamBaoSeed;

  promiseDamBaoSeed = (async () => {
    const [rowsHienTai, colsHienTai, migrationMap] = await Promise.all([
      docDuLieuHienTai(KHOA_DU_LIEU),
      docDuLieuHienTai(KHOA_COT),
      docRaw(KHOA_MIGRATION_SEED).then((raw) => parseJSONAnToan(raw, {})),
    ]);

    const daApDungDungPhienBan = String(migrationMap?.[KHOA_PHIEN_BAN_SEED] || '') === PHIEN_BAN_SEED_LUAT_PTTT_MUC11;
    let { mergedRows, addedCount } = hopNhatDongLuat(rowsHienTai, DU_LIEU_SEED_LUAT_PTTT_MUC11, {
      thayTheToanBoSeed: !daApDungDungPhienBan,
    });
    const soDongTruocLoc = mergedRows.length;
    mergedRows = mergedRows.filter((r) => !laDongLuatDaGoKhoiSeed(r));
    const soDongGoTuCache = soDongTruocLoc - mergedRows.length;
    const mergedCols = hopNhatCot(colsHienTai);
    const canGhiLai = addedCount > 0
      || soDongGoTuCache > 0
      || !daApDungDungPhienBan
      || mergedCols.length !== (Array.isArray(colsHienTai) ? colsHienTai.length : 0);

    if (!canGhiLai) {
      return {
        ok: true,
        applied: false,
        added_count: 0,
        total_count: mergedRows.length,
        version: PHIEN_BAN_SEED_LUAT_PTTT_MUC11,
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
      [KHOA_PHIEN_BAN_SEED]: PHIEN_BAN_SEED_LUAT_PTTT_MUC11,
      updated_at: new Date().toISOString(),
    };
    await ghiRaw(KHOA_MIGRATION_SEED, JSON.stringify(migrationMoi));

    return {
      ok: true,
      applied: true,
      added_count: addedCount,
      total_count: mergedRows.length,
      version: PHIEN_BAN_SEED_LUAT_PTTT_MUC11,
    };
  })();

  try {
    return await promiseDamBaoSeed;
  } finally {
    promiseDamBaoSeed = null;
  }
};