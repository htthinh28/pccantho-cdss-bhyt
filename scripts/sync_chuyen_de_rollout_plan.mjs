/**
 * Sinh scripts/chuyen_de_rollout_plan.json — phân nhóm triển khai placeholder CHUYEN_DE → thực chiến:
 *   1) Ưu tiên theo tần suất / rủi ro thanh toán (heuristic từ khóa TEN_QUY_TAC + CANH_BAO)
 *   2) Gợi ý phạm vi XML đã có (tìm DS_XML*, XML1… trong cùng dòng quy tắc)
 *   3) Cặp trùng / gần trùng tiêu đề (Jaccard token giữa các luật EXIT_AUDIT_BACKLOG + so với luật đã có DIEU_KIEN XML130)
 *   4) Luật seed OFF trong hardcoded + mã trong data_quy_tac_giu_off_mo_rong (chuyen_de_placeholder)
 *
 * Chạy: node scripts/sync_chuyen_de_rollout_plan.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { scanChuyenDeRulesFromFile } from './lib/chuyen_de_scan_utils.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'ma_nguon', 'tien_ich', 'luat_giam_dinh_chuyen_de_hardcoded.jsx');
const DATA_OFF = path.join(ROOT, 'ma_nguon', 'tien_ich', 'data_quy_tac_giu_off_mo_rong.json');
const OUT = path.join(ROOT, 'scripts', 'chuyen_de_rollout_plan.json');

function tokenizeVi(s) {
  if (!s) return [];
  const t = String(s)
    .toLowerCase()
    .replace(/[`'".,;:!?()\[\]{}]/g, ' ')
    .split(/\s+/)
    .filter((x) => x.length > 1);
  return t;
}

function jaccard(a, b) {
  const A = new Set(a);
  const B = new Set(b);
  let inter = 0;
  for (const x of A) if (B.has(x)) inter += 1;
  const union = A.size + B.size - inter;
  return union === 0 ? 0 : inter / union;
}

/** Rủi ro thanh toán — heuristic; điều chỉnh từ khóa khi rà soát nghiệp vụ. */
function paymentRiskTier(text) {
  const u = String(text || '');
  if (
    /xuất toán|thanh toán sai|trùng chi phí|trùng đơn|trái tuyến|phê duyệt giá|gian lận|hai thẻ|hai mã thẻ/i.test(
      u,
    )
  ) {
    return { tier: 'high', score: 3 };
  }
  if (
    /thanh toán|thuốc|DVKT|phẫu thuật|nội trú|cấp cứu|chỉ định|xét nghiệm|siêu âm|chụp CT|MRI|điện tim/i.test(
      u,
    )
  ) {
    return { tier: 'medium', score: 2 };
  }
  return { tier: 'low', score: 1 };
}

function xmlTouchpointsFromLine(line) {
  const hints = new Set();
  if (/XML1\.|XML1\s|[\s(,]XML1\b/.test(line)) hints.add('XML1');
  if (/DS_XML2|\bXML2\b|CURRENT\.TEN_THUOC|DS_XML2/i.test(line)) hints.add('DS_XML2');
  if (/DS_XML3|\bXML3\b|CURRENT\.TEN_DICH_VU|COUNT_IF\s*\(\s*DS_XML3/i.test(line)) hints.add('DS_XML3');
  if (/DS_XML4|\bXML4\b/i.test(line)) hints.add('DS_XML4');
  if (/DS_XML5|\bXML5\b/i.test(line)) hints.add('DS_XML5');
  return [...hints];
}

function loadDefaultOffMaLuatSet() {
  const j = JSON.parse(fs.readFileSync(DATA_OFF, 'utf8'));
  const arr = Array.isArray(j.chuyen_de_placeholder) ? j.chuyen_de_placeholder : [];
  return new Set(arr.map((x) => String(x).trim()).filter(Boolean));
}

const lines = fs.readFileSync(SRC, 'utf8').split(/\r?\n/);
const lineById = new Map();
for (const line of lines) {
  const idM = line.match(/id:\s*'(CHUYEN_DE-\d+)'/);
  if (idM) lineById.set(idM[1], line);
}

const rules = scanChuyenDeRulesFromFile(SRC, fs);
const defaultOffMa = loadDefaultOffMaLuatSet();

const exitBacklog = rules.filter((r) => r.placeholderKind === 'EXIT_AUDIT_BACKLOG');
const xml130Ready = rules.filter((r) => !r.placeholder);

/** Nhóm 3: trùng / gần trùng trong backlog */
const dupPairs = [];
for (let i = 0; i < exitBacklog.length; i++) {
  for (let j = i + 1; j < exitBacklog.length; j++) {
    const a = exitBacklog[i];
    const b = exitBacklog[j];
    const ja = jaccard(tokenizeVi(a.tenQuyTac), tokenizeVi(b.tenQuyTac));
    if (ja >= 0.42) {
      dupPairs.push({
        a: a.id,
        b: b.id,
        similarity: Math.round(ja * 1000) / 1000,
        note: 'Jaccard token trên TEN_QUY_TAC',
      });
    }
  }
}
dupPairs.sort((x, y) => y.similarity - x.similarity);

/** Backlog vs luật đã có điều kiện XML130 (trùng tiêu đề nhẹ) */
const overlapXml130 = [];
for (const ph of exitBacklog) {
  const ta = tokenizeVi(ph.tenQuyTac);
  for (const active of xml130Ready) {
    const tb = tokenizeVi(active.tenQuyTac);
    const ja = jaccard(ta, tb);
    if (ja >= 0.38) {
      overlapXml130.push({
        backlog_id: ph.id,
        xml130_ready_id: active.id,
        similarity: Math.round(ja * 1000) / 1000,
      });
    }
  }
}
overlapXml130.sort((x, y) => y.similarity - x.similarity);

const paymentHigh = [];
const paymentMed = [];
const paymentLow = [];

const details = exitBacklog.map((r) => {
  const line = lineById.get(r.id) || '';
  const canhM = line.match(/CANH_BAO:\s*`([^`]*)`/);
  const canh = canhM ? canhM[1] : '';
  const blob = `${r.tenQuyTac || ''} ${canh}`;
  const pr = paymentRiskTier(blob);
  if (pr.tier === 'high') paymentHigh.push(r.id);
  else if (pr.tier === 'medium') paymentMed.push(r.id);
  else paymentLow.push(r.id);

  const xmlHints = xmlTouchpointsFromLine(line);
  const paperLikely =
    /phiếu|chữ ký|giấy phép|hồ sơ giấy|ngoài XML|đối chiếu giấy|BV làm thủ tục|Sở Y tế|HĐND/i.test(
      blob,
    ) && xmlHints.length === 0;

  return {
    id: r.id,
    maLuat: r.maLuat,
    tenQuyTac: r.tenQuyTac,
    payment_risk_tier: pr.tier,
    payment_risk_score: pr.score,
    xml_touchpoint_hints: xmlHints,
    likely_paper_or_extra_xml_only: paperLikely,
    seed_trang_thai_off: r.trangThai === 'OFF',
    default_off_policy_chuyen_de_placeholder: r.maLuat ? defaultOffMa.has(r.maLuat) : false,
  };
});

details.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));

const seedOffExit = exitBacklog.filter((r) => r.trangThai === 'OFF').map((r) => r.id);
const policyOffExit = exitBacklog
  .filter((r) => r.maLuat && defaultOffMa.has(r.maLuat))
  .map((r) => r.id);

function sortIds(a, b) {
  return (
    parseInt(a.replace('CHUYEN_DE-', ''), 10) - parseInt(b.replace('CHUYEN_DE-', ''), 10)
  );
}

[paymentHigh, paymentMed, paymentLow].forEach((arr) => arr.sort(sortIds));

const payload = {
  version: new Date().toISOString().slice(0, 10),
  generated_note:
    'Tự động sinh — phục vụ lộ trình triển khai; điều chỉnh từ khóa rủi ro / XML trong script nếu cần.',
  source_file: path.relative(ROOT, SRC),
  data_off_reference: path.relative(ROOT, DATA_OFF),
  totals: {
    exit_audit_backlog_rules: exitBacklog.length,
    payment_risk_high: paymentHigh.length,
    payment_risk_medium: paymentMed.length,
    payment_risk_low: paymentLow.length,
    duplicate_title_pairs: dupPairs.length,
    backlog_vs_xml130_similar: overlapXml130.length,
    seed_off_among_exit_backlog: seedOffExit.length,
    default_off_policy_among_exit_backlog: policyOffExit.length,
  },
  groups: {
    '1_payment_risk': {
      description:
        'Ưu tiên triển khai heuristic XML130: high → medium → low (heuristic từ khóa, cần rà soát tay).',
      high: paymentHigh,
      medium: paymentMed,
      low: paymentLow,
    },
    '2_xml_data_hints': {
      description:
        'Gợi ý phạm vi XML trên cùng dòng mã nguồn (placeholder vẫn có CANH_BAO gợi DS_XML*). Mục unknown = không tìm thấy token XML trong dòng.',
      by_touchpoint: (() => {
        const by = { XML1: [], DS_XML2: [], DS_XML3: [], DS_XML4: [], DS_XML5: [], none_in_line: [] };
        for (const d of details) {
          if (d.xml_touchpoint_hints.length === 0) {
            by.none_in_line.push(d.id);
          } else {
            for (const h of d.xml_touchpoint_hints) {
              if (by[h]) by[h].push(d.id);
            }
          }
        }
        for (const k of Object.keys(by)) {
          by[k] = [...new Set(by[k])].sort(sortIds);
        }
        return by;
      })(),
      likely_paper_or_extra_xml_heavy: details
        .filter((d) => d.likely_paper_or_extra_xml_only)
        .map((d) => d.id)
        .sort(sortIds),
    },
    '3_overlap': {
      description:
        'Trùng tiêu đề trong backlog; và tương đồng với luật đã có DIEU_KIEN XML130 — xem xét gộp / tránh double alert.',
      duplicate_pairs_in_backlog: dupPairs.slice(0, 80),
      duplicate_pairs_in_backlog_truncated: dupPairs.length > 80,
      backlog_similar_to_xml130_ready: overlapXml130.slice(0, 80),
      backlog_similar_truncated: overlapXml130.length > 80,
    },
    '4_off_states': {
      description:
        'Seed TRANG_THAI OFF trong hardcoded; và mặc định OFF chính sách (data_quy_tac_giu_off_mo_rong — cần bật ON tại BV khi đủ heuristic).',
      seed_off_rule_ids: [...seedOffExit].sort(sortIds),
      default_off_policy_rule_ids: [...policyOffExit].sort(sortIds),
      note_intersection:
        'Giao của hai danh sách = luật vừa OFF trong mã vừa nằm trong danh sách chính sách.',
      intersection_seed_off_and_policy: [...seedOffExit].filter((id) => policyOffExit.includes(id)).sort(sortIds),
    },
  },
  exit_audit_backlog_detail: details,
};

fs.writeFileSync(OUT, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
console.log(`Đã ghi ${path.relative(ROOT, OUT)}`);
console.log(
  `  backlog EXIT_AUDIT: ${payload.totals.exit_audit_backlog_rules} | trùng cặp tiêu đề: ${payload.totals.duplicate_title_pairs} | gần luật XML130: ${payload.totals.backlog_vs_xml130_similar}`,
);
