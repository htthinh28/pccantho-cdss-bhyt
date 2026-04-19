#!/usr/bin/env node
/**
 * QA đơn vị: conflict policy, migrate legacy mapping, chuẩn hoá mã DVKT (subset).
 */
import assert from 'node:assert/strict';
import {
  danhGiaConflictPolicyTaiXuong,
  gopBanGhiMappingTuLegacyVaShard,
  normalizeDvktCodeForQA,
} from '../ma_nguon/tien_ich/config_dataset_versioning.pure.js';

const st = danhGiaConflictPolicyTaiXuong({
  local_payload_hash: 'aaa',
  synced_payload_hash: 'aaa',
  remote_payload_hash: 'aaa',
  remote_exists: true,
});
assert.equal(st.severity, 'ok');
assert.equal(st.local_dirty, false);

const dirty = danhGiaConflictPolicyTaiXuong({
  local_payload_hash: 'bbb',
  synced_payload_hash: 'aaa',
  remote_payload_hash: 'ccc',
  remote_exists: true,
});
assert.equal(dirty.severity, 'conflict');
assert.equal(dirty.local_dirty, true);

const unSynced = danhGiaConflictPolicyTaiXuong({
  local_payload_hash: 'bbb',
  synced_payload_hash: 'aaa',
  remote_payload_hash: 'bbb',
  remote_exists: true,
});
assert.equal(unSynced.severity, 'local_unsynced');

const merged = gopBanGhiMappingTuLegacyVaShard(
  [{ id: '1', mapping_type: 'X' }],
  [{ id: '1', mapping_type: 'Y' }, { id: '2' }],
);
assert.equal(merged.length, 2);
assert.equal(merged.find((r) => r.id === '1').mapping_type, 'X');

const merged2 = gopBanGhiMappingTuLegacyVaShard([], [{ id: 'a', x: 1 }]);
assert.equal(merged2.length, 1);

assert.equal(normalizeDvktCodeForQA('  abc-01 '), 'ABC-01');

console.log('qa_config_versioning_unit: OK');
