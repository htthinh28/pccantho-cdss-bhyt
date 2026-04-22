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

/** Quy tắc đã bỏ hẳn khỏi bundle — luôn gỡ khỏi cache (tránh MA_LUAT không còn trong seed vẫn bị giữ như tùy biến BV). */
const MA_LUAT_DA_LOAI_BO_KHOI_PTTT = new Set(['DVKT_2588']);
const laDongLuatBiLoaiBoKhoiPttt = (row = {}) =>
  MA_LUAT_DA_LOAI_BO_KHOI_PTTT.has(String(row?.MA_LUAT || '').trim().toUpperCase());

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

/** Luôn ưu tiên nội dung bundle cho MA có trong seed; giữ quy tắc BV (MA không có trong seed). Giữ TRANG_THAI OFF nếu người dùng đã tắt. */
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
    let { mergedRows, addedCount } = hopNhatDongLuatUuTienSeed(rowsHienTai, DU_LIEU_SEED_LUAT_PTTT_MUC11);
    const soDongTruocLoc = mergedRows.length;
    mergedRows = mergedRows.filter((r) => !laDongLuatDaGoKhoiSeed(r) && !laDongLuatBiLoaiBoKhoiPttt(r));
    const soDongGoTuCache = soDongTruocLoc - mergedRows.length;
    const rowsHienTaiLoc = (Array.isArray(rowsHienTai) ? rowsHienTai : [])
      .map((row, index) => chuanHoaDongLuat(row, index))
      .filter((r) => !laDongLuatDaGoKhoiSeed(r) && !laDongLuatBiLoaiBoKhoiPttt(r));
    const mergedCols = hopNhatCot(colsHienTai);
    const canGhiLai = !daApDungDungPhienBan
      || mergedCols.length !== (Array.isArray(colsHienTai) ? colsHienTai.length : 0)
      || soDongGoTuCache > 0
      || !dongLuatBangNhau(mergedRows, rowsHienTaiLoc);

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