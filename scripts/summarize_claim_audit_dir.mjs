/**
 * Tóm tắt kết quả `run_claim_audit.js --dir=...` (JSON lớn) thành:
 *   - JSON gọn: theo hồ sơ + rule phủ bao nhiêu % file (gợi ý rà dương tính giả)
 *   - CSV mở bằng Excel (UTF-8 BOM, cột `;`)
 *
 * Chạy:
 *   node scripts/summarize_claim_audit_dir.mjs
 *   node scripts/summarize_claim_audit_dir.mjs --in=test_xml/audit_tai_nguyen_ip_layers.json --out-prefix=test_xml/audit_ip_triage
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

const DEFAULT_IN = path.join(ROOT, 'test_xml', 'audit_tai_nguyen_ip_layers.json');
const DEFAULT_PREFIX = path.join(ROOT, 'test_xml', 'audit_ip_triage');

const parseArgs = (argv) => {
  let inputPath = '';
  let outPrefix = '';
  for (const arg of argv) {
    if (arg.startsWith('--in=')) inputPath = arg.slice('--in='.length).trim();
    if (arg.startsWith('--out-prefix=')) outPrefix = arg.slice('--out-prefix='.length).trim();
  }
  return {
    inputPath: inputPath ? path.resolve(ROOT, inputPath) : DEFAULT_IN,
    outPrefix: outPrefix ? path.resolve(ROOT, outPrefix) : DEFAULT_PREFIX,
  };
};

const basename = (p) => {
  const s = String(p || '').replace(/[/\\]+/g, '/');
  const i = s.lastIndexOf('/');
  return i === -1 ? s : s.slice(i + 1);
};

const csvEscape = (v) => {
  const s = String(v ?? '');
  if (/[;"\r\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
};

const topEntries = (obj, n) => Object.entries(obj || {})
  .sort((a, b) => b[1] - a[1])
  .slice(0, n);

const main = () => {
  const { inputPath, outPrefix } = parseArgs(process.argv.slice(2));
  if (!fs.existsSync(inputPath)) {
    console.error(`Khong tim thay file: ${inputPath}`);
    console.error('Usage: node scripts/summarize_claim_audit_dir.mjs [--in=...] [--out-prefix=...]');
    process.exit(2);
  }

  const raw = fs.readFileSync(inputPath, 'utf8');
  const data = JSON.parse(raw);
  const files = Array.isArray(data.files) ? data.files : [];
  const okFiles = files.filter((f) => f.parse_ok);
  const nFiles = okFiles.length;

  const ruleFileCount = {};
  const rows = [];

  for (const f of okFiles) {
    const warnings = Array.isArray(f.warnings) ? f.warnings : [];
    const bySev = {};
    let dvktOp = 0;
    for (const w of warnings) {
      const md = String(w?.muc_do || 'Unknown').trim() || 'Unknown';
      bySev[md] = (bySev[md] || 0) + 1;
      const ns = String(w?.namespace_quy_tac || '').trim();
      const ma = String(w?.ma_luat || '').trim();
      if (ns === 'DVKT_OP' || /^DVKT-OP-/i.test(ma)) dvktOp += 1;
    }

    const rs = f.rule_summary && typeof f.rule_summary === 'object' ? f.rule_summary : {};
    for (const k of Object.keys(rs)) {
      ruleFileCount[k] = (ruleFileCount[k] || 0) + 1;
    }

    const tang = f.layers_summary_full?.by_tang_V15 || {};
    const total = Number(f.total_warnings) || warnings.length;
    const ratioDvkt = total > 0 ? Math.round((1000 * dvktOp) / total) / 10 : 0;

    rows.push({
      ma_lk: String(f.ma_lk || ''),
      file: basename(f.claim_path),
      total_warnings: total,
      dvkt_op_warnings: dvktOp,
      pct_dvkt_op: ratioDvkt,
      by_severity: bySev,
      by_tang_V15: { ...tang },
      top_rules: Object.fromEntries(topEntries(rs, 12)),
    });
  }

  rows.sort((a, b) => b.total_warnings - a.total_warnings);

  const rulePrevalence = Object.entries(ruleFileCount)
    .map(([ma_luat, fileHits]) => ({
      ma_luat,
      files_hit: fileHits,
      pct_files: nFiles ? Math.round((1000 * fileHits) / nFiles) / 10 : 0,
    }))
    .sort((a, b) => b.files_hit - a.files_hit);

  const highDvktRatio = [...rows]
    .filter((r) => r.total_warnings >= 8)
    .sort((a, b) => b.pct_dvkt_op - a.pct_dvkt_op)
    .slice(0, 30);

  const summaryJson = {
    generated_at: new Date().toISOString(),
    source_audit: path.relative(ROOT, inputPath).replace(/\\/g, '/'),
    meta_in: data.meta || {},
    file_count_ok: nFiles,
    aggregate_layers_full: data.meta?.aggregate_layers_full || null,
    rule_prevalence_top40: rulePrevalence.slice(0, 40),
    false_positive_triage_hints: {
      note:
        'pct_files = so ho so co >=1 canh bao ma luat do. pct_dvkt_op = ty trong canh bao tu DVKT_OP / DVKT-OP-* tren tong canh bao ho so (cao => uu tien doi chieu mapping nhan su / thoi diem hanh nghe).',
      top_30_ho_so_theo_ty_le_DVKT_OP: highDvktRatio,
    },
    per_hoso: rows,
  };

  const jsonPath = `${outPrefix}_summary.json`;
  fs.mkdirSync(path.dirname(jsonPath), { recursive: true });
  fs.writeFileSync(jsonPath, JSON.stringify(summaryJson, null, 2), 'utf8');

  const headers = [
    'ma_lk',
    'file',
    'total',
    'dvkt_op_n',
    'pct_dvkt_op',
    'Critical',
    'Error',
    'Warning',
    'Info',
    'L0',
    'L1',
    'L23',
    'L4',
    'L5',
    'top_rules_compact',
  ];
  const lines = [headers.join(';')];
  for (const r of rows) {
    const tr = topEntries(r.top_rules, 8)
      .map(([k, v]) => `${k}:${v}`)
      .join('|');
    lines.push(
      [
        csvEscape(r.ma_lk),
        csvEscape(r.file),
        r.total_warnings,
        r.dvkt_op_warnings,
        r.pct_dvkt_op,
        r.by_severity.Critical || 0,
        r.by_severity.Error || 0,
        r.by_severity.Warning || 0,
        r.by_severity.Info || 0,
        r.by_tang_V15.L0 || 0,
        r.by_tang_V15.L1 || 0,
        r.by_tang_V15.L23 || 0,
        r.by_tang_V15.L4 || 0,
        r.by_tang_V15.L5 || 0,
        csvEscape(tr),
      ].join(';'),
    );
  }
  const csvPath = `${outPrefix}_per_hoso.csv`;
  const bom = '\uFEFF';
  fs.writeFileSync(csvPath, bom + lines.join('\r\n'), 'utf8');

  console.log(`Da doc: ${inputPath}`);
  console.log(`Ho so parse_ok: ${nFiles}`);
  console.log(`Ghi JSON: ${jsonPath}`);
  console.log(`Ghi CSV:  ${csvPath}`);
  console.log(`Top 5 ma luat phu nhieu ho so nhat:`);
  rulePrevalence.slice(0, 5).forEach((x, i) => {
    console.log(`  ${i + 1}. ${x.ma_luat}  ${x.files_hit}/${nFiles} ho so (${x.pct_files}%)`);
  });
};

main();
