/**
 * Quét mã nguồn CHUYEN_DE: placeholder vs XML130, TRANG_THAI, trùng danh sách mặc định OFF nội bộ.
 * Ghi scripts/chuyen_de_eligible_scan.json — inventory cho bước ký duyệt thực chiến.
 *
 * Chạy: node scripts/sync_chuyen_de_eligible_scan.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  scanChuyenDeRulesFromFile,
  chuyenDeIdToNormalizedMa,
} from './lib/chuyen_de_scan_utils.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'ma_nguon', 'tien_ich', 'luat_giam_dinh_chuyen_de_hardcoded.jsx');
const ON_OFF = path.join(ROOT, 'ma_nguon', 'tien_ich', 'quy_tac_on_off_noi_bo.jsx');
const OUT = path.join(ROOT, 'scripts', 'chuyen_de_eligible_scan.json');

function loadDefaultOffChuyenDeNormalized() {
  const text = fs.readFileSync(ON_OFF, 'utf8');
  const set = new Set();
  const re = /'CHUYEN_DE_(\d+)'/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    set.add(`CHUYEN_DE_${m[1]}`);
  }
  return set;
}

const rules = scanChuyenDeRulesFromFile(SRC, fs);
const defaultOff = loadDefaultOffChuyenDeNormalized();

const placeholderIds = rules.filter((r) => r.placeholder).map((r) => r.id);
const xml130Ready = rules.filter((r) => !r.placeholder);
const xml130ReadyIds = xml130Ready.map((r) => r.id).sort(chuyenDeSort);

const seedOnNonPlaceholder = xml130Ready.filter((r) => r.trangThai === 'ON');
const seedOffNonPlaceholder = xml130Ready.filter((r) => r.trangThai === 'OFF');

const xml130OnIds = seedOnNonPlaceholder.map((r) => r.id).sort(chuyenDeSort);

const inDefaultOffButSeedOn = seedOnNonPlaceholder.filter((r) =>
  defaultOff.has(chuyenDeIdToNormalizedMa(r.id)),
);

function chuyenDeSort(a, b) {
  const na = parseInt(String(a).replace('CHUYEN_DE-', ''), 10);
  const nb = parseInt(String(b).replace('CHUYEN_DE-', ''), 10);
  return na - nb;
}

const payload = {
  version: new Date().toISOString().slice(0, 10),
  source_file: 'ma_nguon/tien_ich/luat_giam_dinh_chuyen_de_hardcoded.jsx',
  on_off_reference: 'ma_nguon/tien_ich/quy_tac_on_off_noi_bo.jsx (DANH_SACH_MAU_QUY_TAC_MAC_DINH_OFF)',
  totals: {
    rules: rules.length,
    placeholder_count: placeholderIds.length,
    xml130_condition_count: xml130Ready.length,
    seed_on_among_xml130: seedOnNonPlaceholder.length,
    seed_off_among_xml130: seedOffNonPlaceholder.length,
  },
  policy_note:
    'xml130_condition = DIEU_KIEN không phải placeholder (EXIT_AUDIT_BACKLOG hoặc CHO_XU_LY_SAU). Engine bỏ qua CHO_XU_LY_SAU qua laDieuKienChuyenDeXml130Placeholder; EXIT_AUDIT_BACKLOG luôn false cho đến khi thay DIEU_KIEN. Quy tắc mặc định OFF (data_quy_tac_giu_off_mo_rong) vẫn cần bật trong Quản lý ON/OFF để chạy thật.',
  lists: {
    placeholder_rule_ids: placeholderIds.sort(chuyenDeSort),
    xml130_ready_rule_ids: xml130ReadyIds,
    xml130_seed_on_rule_ids: xml130OnIds,
    xml130_seed_on_but_default_off_noi_bo: inDefaultOffButSeedOn
      .map((r) => ({
        id: r.id,
        ma_normalized: chuyenDeIdToNormalizedMa(r.id),
      }))
      .sort((a, b) => chuyenDeSort(a.id, b.id)),
  },
};

fs.writeFileSync(OUT, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
console.log(`Đã ghi ${path.relative(ROOT, OUT)}`);
console.log(
  `  placeholder: ${payload.totals.placeholder_count} | XML130 (không placeholder): ${payload.totals.xml130_condition_count} | seed ON trong số đó: ${payload.totals.seed_on_among_xml130}`,
);
console.log(
  `  Cảnh báo: ${inDefaultOffButSeedOn.length} quy tắc XML130+seed ON nằm trong danh sách mặc định OFF nội bộ (cần bật ON có chủ đích ở BV).`,
);
