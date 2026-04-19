/** Logic thuần (Metro + Node) — đồng bộ với config_dataset_versioning.jsx */

export const DVKT_DATASET_SCHEMA_VERSION = 1;

export const danhGiaConflictPolicyTaiXuong = ({
  local_payload_hash = '',
  synced_payload_hash = '',
  remote_payload_hash = '',
  remote_exists = false,
} = {}) => {
  const lh = String(local_payload_hash || '');
  const sh = String(synced_payload_hash || '');
  const rh = String(remote_payload_hash || '');
  const local_dirty = Boolean(lh && sh && lh !== sh);
  const remote_mismatch_hash =
    Boolean(remote_exists && rh && lh && rh !== lh)
    || Boolean(remote_exists && rh && sh && rh !== sh && !local_dirty);
  let severity = 'ok';
  if (local_dirty && remote_exists && rh && lh !== rh) severity = 'conflict';
  else if (local_dirty) severity = 'local_unsynced';
  else if (remote_exists && rh && sh && rh !== sh && !local_dirty) severity = 'remote_newer_than_last_push';
  return {
    local_dirty,
    remote_mismatch_hash,
    severity,
    remote_exists,
    local_payload_hash: lh,
    synced_payload_hash: sh,
    remote_payload_hash: rh,
  };
};

/** BR-style: gộp legacy CATALOG_MAPPING_V1 vào shard (ưu tiên shard theo id). */
export const gopBanGhiMappingTuLegacyVaShard = (tuShard, legacyRows) => {
  const norm = (a) => (Array.isArray(a) ? a : []);
  const theoId = new Map();
  for (const r of norm(tuShard)) {
    if (r?.id) theoId.set(r.id, r);
  }
  const gop = [...norm(tuShard)];
  for (const r of norm(legacyRows)) {
    if (r?.id && theoId.has(r.id)) continue;
    gop.push(r);
    if (r?.id) theoId.set(r.id, r);
  }
  return gop;
};

/** Chuẩn hoá mã DVKT trong rule engine (subset cho QA). */
export const normalizeDvktCodeForQA = (value) => {
  const raw = String(value ?? '').trim();
  if (!raw) return '';
  return raw.replace(/\s+/g, '').toUpperCase();
};
