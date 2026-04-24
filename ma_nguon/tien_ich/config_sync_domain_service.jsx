/**
 * Domain service (mỏng): đồng bộ cấu hình/danh mục — một đầu vào ổn định cho màn hình Helper.
 * Không thay thế luồng nghiệp vụ chi tiết; chỉ bọc khóa phiên, audit và đối soát gói khoá.
 */

import { layTatCaKhoaShardCatalogMapping } from './catalog_mapping_firebase';
import {
  doiSoatDanhSachDatasetVoiFirebase,
  giangPhienDongBoCauHinh,
  ghiNhatKyAuditConfigSync,
  thuPhienDongBoCauHinh,
} from './firebase_cloud_bhyt';
import {
  dongBoTatCaDanhMucVaQuyTacLenFirebase,
  layKhoaDatasetRuleEngineDongBo,
  taiDuLieuRuleEngineTuFirebase,
} from './dvkt_op_giam_dinh';

export const layKhoaDoiSoatWizardMacDinh = () => {
  const ruleKeys = layKhoaDatasetRuleEngineDongBo();
  let catalogKeys = [];
  try {
    catalogKeys = layTatCaKhoaShardCatalogMapping();
  } catch {
    catalogKeys = [];
  }
  return Array.from(new Set([...(Array.isArray(ruleKeys) ? ruleKeys : []), ...catalogKeys]));
};

export const chayDoiSoatNhanhChoWizard = async () => {
  const keys = layKhoaDoiSoatWizardMacDinh();
  return doiSoatDanhSachDatasetVoiFirebase({ datasetKeys: keys });
};

/**
 * Đồng bộ đầy đủ như Helper — thêm khóa phiên + nhật ký audit (không đổi logic build datasetMap).
 */
export const dongBoFullHelper = async ({
  uploader = '',
  source = 'helper_full_sync',
  onlyChanged = true,
  su_dung_khoa = true,
  actor_email = '',
  ttl_ms_khoa = 15 * 60 * 1000,
  ghi_audit = true,
} = {}) => {
  if (su_dung_khoa) {
    const lock = await thuPhienDongBoCauHinh({
      ttlMs: ttl_ms_khoa,
      actor_email: actor_email || uploader,
    });
    if (!lock.ok) return { ...lock, stage: 'config_sync_lock' };
  }
  try {
    const ketQua = await dongBoTatCaDanhMucVaQuyTacLenFirebase({
      uploader,
      source,
      onlyChanged,
    });
    if (ghi_audit && ketQua?.ok) {
      await ghiNhatKyAuditConfigSync({
        action: 'push_full_catalog_rules',
        actor_email: String(actor_email || uploader || ''),
        source: String(source || ''),
        dataset_summary: Array.isArray(ketQua.details)
          ? ketQua.details.map((d) => ({
              dataset_key: d.dataset_key,
              ok: d.ok,
              skipped: !!d.skipped,
              row_count: d.row_count,
              payload_hash: d.payload_hash || '',
            }))
          : [],
        payload: {
          uploaded_count: ketQua.uploaded_count,
          skipped_count: ketQua.skipped_count,
          processed_count: ketQua.processed_count,
          total_count: ketQua.total_count,
          mode: ketQua.mode || 'full_catalog_rules_sync',
        },
      }).catch(() => {});
    }
    return ketQua;
  } finally {
    if (su_dung_khoa) {
      await giangPhienDongBoCauHinh().catch(() => {});
    }
  }
};

export const taiDvktOpVeMayHelper = async ({
  actor_email = '',
  source = 'helper_pull_dvkt_op',
  ghi_audit = true,
} = {}) =>
  taiDuLieuRuleEngineTuFirebase({
    actor_email,
    source,
    ghi_audit,
  });

export { doiSoatDanhSachDatasetVoiFirebase, layKhoaDatasetRuleEngineDongBo };
