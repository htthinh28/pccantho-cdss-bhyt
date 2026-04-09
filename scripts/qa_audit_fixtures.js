/**
 * Kiểm tra 10 file audit chuẩn trong test_xml/ (tồn tại, MA_LK khớp, in snapshot).
 * Chạy: node scripts/qa_audit_fixtures.js
 * Hoặc: npm run qa:audit-fixtures
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', 'test_xml');

const FIXTURES = [
  { stt: 1, ma_lk: '403521', file: 'audit_403521_20260405_225230.json' },
  { stt: 2, ma_lk: '000339', file: 'audit_000339_20260405_232511.json' },
  { stt: 3, ma_lk: '403538', file: 'audit_403538_20260405_145119.json' },
  { stt: 4, ma_lk: '000589', file: 'audit_000589_20260405_232716.json' },
  { stt: 5, ma_lk: 'OP26000908', file: 'audit_OP26000908_20260405_232932.json' },
  { stt: 6, ma_lk: '403244', file: 'audit_403244_20260405_224614.json' },
  { stt: 7, ma_lk: '000308', file: 'audit_000308_20260405_083942.json' },
  { stt: 8, ma_lk: '000375', file: 'audit_000375_20260405_065828.json' },
  { stt: 9, ma_lk: '000376', file: 'audit_000376_20260404_174042.json' },
  { stt: 10, ma_lk: '000502', file: 'audit_000502_20260404_192348.json' },
];

function main() {
  let ok = true;
  console.log('QA audit fixtures (test_xml/)\n');
  for (const row of FIXTURES) {
    const full = path.join(ROOT, row.file);
    if (!fs.existsSync(full)) {
      console.error(`[FAIL] STT ${row.stt} thiếu file: ${row.file}`);
      ok = false;
      continue;
    }
    let data;
    try {
      data = JSON.parse(fs.readFileSync(full, 'utf8'));
    } catch (e) {
      console.error(`[FAIL] STT ${row.stt} JSON lỗi: ${row.file}`, e.message);
      ok = false;
      continue;
    }
    const meta = data.meta || {};
    const ma = String(meta.ma_lk || '');
    const tw = meta.total_warnings;
    const codes = Array.isArray(data.unique_rule_codes) ? data.unique_rule_codes.length : 0;
    if (ma !== row.ma_lk) {
      console.error(`[FAIL] STT ${row.stt} MA_LK JSON="${ma}" kỳ vọng="${row.ma_lk}" (${row.file})`);
      ok = false;
      continue;
    }
    console.log(
      `STT ${String(row.stt).padStart(2)}  MA_LK=${ma.padEnd(12)}  warnings=${String(tw).padStart(3)}  distinct_codes=${codes}  ${row.file}`,
    );
  }
  console.log('');
  if (!ok) {
    console.error('Kết luận: có lỗi fixture.');
    process.exit(1);
  }
  console.log('Kết luận: đủ 10 file, MA_LK khớp.');
}

main();
