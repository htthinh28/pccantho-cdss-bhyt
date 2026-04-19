/**
 * Đồng bộ catalog_mapping (shard CATALOG_MAP_V1__*) ↔ Firestore dvkt_datasets.
 */

import {
  hydrateDvktTableFromFirebase,
  layMetaDatasetCucBo,
  layMetaDatasetFirebase,
  syncDvktTablesToFirebase,
} from './firebase_cloud_bhyt';
import { KHOA_LUU_LEGACY, layKhoaLuuTheoLoaiMapping } from './catalog_mapping_luu_tru';
import { MAPPING_TYPE_CONFIG } from './catalog_mapping_types';
import { docMangDanhMucTuStorage, ghiMangDanhMucVaoStorage, xoaCacheLuuTruDanhMuc } from './luu_tru_danh_muc';

const normalizeArray = (value) => (Array.isArray(value) ? value : []);

export const layTatCaKhoaShardCatalogMapping = () => {
  const keys = MAPPING_TYPE_CONFIG.map(({ mapping_type }) => layKhoaLuuTheoLoaiMapping(mapping_type));
  keys.push(layKhoaLuuTheoLoaiMapping('_UNKNOWN_'));
  return keys;
};

export const layKhoaBackupCatalogMapping = () => [...layTatCaKhoaShardCatalogMapping(), KHOA_LUU_LEGACY];

export const dongBoTatCaCatalogMappingLenFirebase = async ({
  uploader = '',
  onlyChanged = true,
} = {}) => {
  const keys = layTatCaKhoaShardCatalogMapping();
  const datasetMap = {};
  for (const k of keys) {
    datasetMap[k] = normalizeArray(await docMangDanhMucTuStorage(k));
  }
  return syncDvktTablesToFirebase({
    datasetMap,
    uploader,
    source: 'catalog_mapping_manual',
    onlyChanged,
  });
};

export const taiTatCaCatalogMappingTuFirebase = async () => {
  const keys = layTatCaKhoaShardCatalogMapping();
  let downloaded = 0;
  const missingRemote = [];

  for (const k of keys) {
    const res = await hydrateDvktTableFromFirebase({ datasetKey: k, persistLocal: false });
    if (!res?.ok) {
      missingRemote.push({ key: k, reason: String(res?.reason || '') });
      continue;
    }
    await ghiMangDanhMucVaoStorage(k, normalizeArray(res.data), { syncedWithFirebase: true });
    downloaded += 1;
  }

  await ghiMangDanhMucVaoStorage(KHOA_LUU_LEGACY, [], { syncedWithFirebase: true });
  xoaCacheLuuTruDanhMuc();

  return {
    ok: true,
    shard_count: keys.length,
    downloaded,
    missing_remote: missingRemote,
  };
};

const tongHopMeta = (meta, rows) => {
  const data = normalizeArray(rows);
  return {
    ok: meta?.ok !== false,
    exists: meta?.exists === true,
    payload_hash: String(meta?.payload_hash || ''),
    row_count: Number(meta?.row_count ?? data.length ?? 0),
    updated_at_ms: Number(meta?.updated_at_ms || meta?.updated_at || 0),
    reason: String(meta?.reason || ''),
  };
};

const phanTichDoiSoat = ({ localRows, localMeta, remoteMeta }) => {
  const localData = normalizeArray(localRows);
  const lm = tongHopMeta(localMeta, localData);
  const rm = tongHopMeta(remoteMeta, []);
  const remoteHash = rm.payload_hash;
  const localHash = lm.payload_hash;
  const differs =
    rm.exists
    && (Number(rm.row_count || 0) !== Number(lm.row_count || 0)
      || (!!remoteHash && !!localHash && remoteHash !== localHash));
  return { differs, local: lm, remote: rm };
};

export const doiSoatCatalogMappingVoiFirebase = async () => {
  const keys = layTatCaKhoaShardCatalogMapping();
  const details = await Promise.all(
    keys.map(async (storageKey) => {
      const [localRows, localMetaRaw, remoteMetaRaw] = await Promise.all([
        docMangDanhMucTuStorage(storageKey),
        layMetaDatasetCucBo(storageKey),
        layMetaDatasetFirebase({ datasetKey: storageKey }),
      ]);
      const status = phanTichDoiSoat({
        localRows,
        localMeta: localMetaRaw,
        remoteMeta: remoteMetaRaw,
      });
      return { storage_key: storageKey, ...status };
    }),
  );

  const differs = details.filter((d) => d.differs);
  return {
    ok: true,
    details,
    differs_count: differs.length,
    differs_keys: differs.map((d) => d.storage_key),
  };
};
