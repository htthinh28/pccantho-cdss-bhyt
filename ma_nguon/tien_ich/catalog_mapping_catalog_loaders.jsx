/**
 * Nạp dòng danh mục để autocomplete / hiển thị tên theo mã (catalog_ref trong đặc tả).
 * Cache theo catalog + TTL + gộp request đồng thời — giảm lag khi mở mapping / popup nhiều lần.
 */

import { CATALOG_REF, layCauHinhLoaiMapping } from './catalog_mapping_types';
import { taiBoDuLieuDanhMuc } from './luu_tru_danh_muc';

const CACHE_TTL_MS = 5 * 60 * 1000;
/** @type {Map<string, { data: unknown[], ts: number }>} */
const bangCache = new Map();
/** @type {Map<string, Promise<unknown[]>>} */
const bangInflight = new Map();

export const invalidateBangCatalogMappingCache = () => {
  bangCache.clear();
  bangInflight.clear();
};

const layGiaTri = (row, keys) => {
  for (const k of keys) {
    const v = row?.[k];
    if (v !== undefined && v !== null && String(v).trim() !== '') return String(v).trim();
  }
  return '';
};

const chuanHoaMa = (s) => String(s || '').trim();

const taiBangTheoCatalogRefNoCache = async (catalogRef) => {
  const meta = CATALOG_REF[catalogRef];
  if (!meta) return [];

  if (catalogRef === 'surgery_types') {
    const { data: dvktRows } = await taiBoDuLieuDanhMuc({
      dataKey: 'DANH_MUC_DVKT_M05',
      columnsKey: 'COLS_DANH_MUC_DVKT_M05',
      fallbackColumns: [],
    });
    const set = new Set(['Đặc biệt', 'I', 'II', 'III', 'IV', 'TT', 'TT/PT']);
    (Array.isArray(dvktRows) ? dvktRows : []).forEach((row) => {
      const pl = chuanHoaMa(layGiaTri(row, ['PHAN_LOAI_PTTT', 'MA_PTTT']));
      if (pl) set.add(pl);
    });
    return Array.from(set)
      .sort()
      .map((code) => ({ code, name: code, raw: { PHAN_LOAI_PTTT: code } }));
  }

  const { data } = await taiBoDuLieuDanhMuc({
    dataKey: meta.storageKey,
    columnsKey: `COLS_${meta.storageKey}`,
    fallbackColumns: [],
  });

  return (Array.isArray(data) ? data : []).map((row, index) => {
    const code = chuanHoaMa(layGiaTri(row, meta.codeFields));
    const name = layGiaTri(row, meta.nameFields) || code || `Dòng ${index + 1}`;
    const item = { code, name, raw: row };
    if (catalogRef === 'employees') {
      item.chucDanh = layGiaTri(row, ['CHUCDANH_NN', 'CHUC_DANH', 'MA_CDNN']);
      item.chungChi = layGiaTri(row, ['MACCHN', 'SO_CCHN', 'SO_CHUNG_CHI']);
    }
    if (catalogRef === 'dvkt_items') {
      item.maTuongDuong = layGiaTri(row, ['MA_TUONG_DUONG', 'MA_TUONG_DUONG_GIA']);
    }
    if (catalogRef === 'drug_items') {
      item.tenHoatChat = layGiaTri(row, ['TEN_HOAT_CHAT']);
    }
    if (catalogRef === 'vtyt_items') {
      item.nhomVtyt = layGiaTri(row, ['NHOM_VAT_TU']);
    }
    return item;
  }).filter((x) => x.code);
};

export const taiBangTheoCatalogRef = async (catalogRef) => {
  const key = String(catalogRef || '');
  const hit = bangCache.get(key);
  if (hit && Date.now() - hit.ts < CACHE_TTL_MS) {
    return hit.data;
  }
  const pending = bangInflight.get(key);
  if (pending) return pending;

  const p = (async () => {
    try {
      const data = await taiBangTheoCatalogRefNoCache(catalogRef);
      bangCache.set(key, { data, ts: Date.now() });
      return data;
    } finally {
      bangInflight.delete(key);
    }
  })();

  bangInflight.set(key, p);
  return p;
};

export const taiTatCaBangChoMapping = async () => {
  const keys = [
    'employees',
    'dvkt_items',
    'icd10',
    'drug_items',
    'vtyt_items',
    'surgery_types',
    'bed_types',
    'equipments',
  ];
  const out = {};
  await Promise.all(
    keys.map(async (k) => {
      out[k] = await taiBangTheoCatalogRef(k);
    }),
  );
  return out;
};

/** Chỉ nạp hai danh mục nguồn/đích của một loại mapping — dùng khi mở popup để luôn đồng bộ DM nội bộ. */
export const taiBangChoLoaiMapping = async (mappingType) => {
  const cfg = layCauHinhLoaiMapping(mappingType);
  if (!cfg) return {};
  const [src, tgt] = await Promise.all([
    taiBangTheoCatalogRef(cfg.source_catalog),
    taiBangTheoCatalogRef(cfg.target_catalog),
  ]);
  return {
    [cfg.source_catalog]: src,
    [cfg.target_catalog]: tgt,
  };
};

export const timTenTheoMa = (danhSach, ma) => {
  const m = chuanHoaMa(ma);
  if (!m) return '';
  const hit = danhSach.find((x) => chuanHoaMa(x.code) === m);
  return hit?.name || '';
};

/** Nhiều mã (mảng, hoặc chuỗi nối bởi |) — dùng hiển thị mapping STAFF_DVKT đa DVKT */
export const timTenNhieuMa = (danhSach, maHoacMang) => {
  if (Array.isArray(maHoacMang) && maHoacMang.length) {
    return maHoacMang
      .map((c) => timTenTheoMa(danhSach, c))
      .filter(Boolean)
      .join('; ');
  }
  const s = String(maHoacMang || '').trim();
  if (!s) return '';
  if (s.includes('|')) {
    return s
      .split('|')
      .map((c) => c.trim())
      .filter(Boolean)
      .map((c) => timTenTheoMa(danhSach, c))
      .filter(Boolean)
      .join('; ');
  }
  return timTenTheoMa(danhSach, s);
};
