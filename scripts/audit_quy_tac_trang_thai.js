#!/usr/bin/env node
/**
 * Audit TRANG_THAI (ON/OFF) của toàn bộ quy tắc trong mã nguồn engine.
 * - Gồm bảng seed JSON (du_lieu_luat_*_muc*.jsx) và bảng luật inline (luat_*_hardcoded.jsx).
 * Lưu ý: Trạng thái ghi đè từ màn Quản lý ON/OFF (AsyncStorage) không có trong repo — chỉ audit seed mã nguồn.
 */

const fs = require('fs');
const path = require('path');

const TIEN_ICH = path.join(__dirname, '../ma_nguon/tien_ich');

const INLINE_RULE_FILES = [
  'luat_cdha_hardcoded.jsx',
  'luat_cong_kham_hardcoded.jsx',
  'luat_nhan_su_hardcoded.jsx',
  'luat_giuong_hardcoded.jsx',
  'luat_hop_dong_hardcoded.jsx',
  'luat_giam_dinh_chuyen_de_hardcoded.jsx',
];

/** Dữ liệu quy tắc nằm trong file seed JSON-style, được import bởi luat_*_hardcoded.jsx */
const SEED_DATA_FILES = [
  'du_lieu_luat_du_lieu_muc1.jsx',
  'du_lieu_luat_hanh_chinh_muc2.jsx',
  'du_lieu_luat_thuoc_muc8.jsx',
  'du_lieu_luat_pttt_muc11.jsx',
];

const normalizeText = (value) => String(value || '').trim();

const extractRulesFromInlineFile = (filePath, relName) => {
  const content = fs.readFileSync(filePath, 'utf8');
  const rules = [];
  const maRe = /MA_LUAT:\s*'([^']+)'/g;
  let m;
  while ((m = maRe.exec(content)) !== null) {
    const maLuat = m[1];
    const blockStart = content.lastIndexOf('{', m.index);
    if (blockStart < 0) continue;
    const head = content.slice(blockStart, blockStart + 120000);
    const ttM = head.match(/TRANG_THAI:\s*'(ON|OFF)'/);
    const tenM = head.match(/TEN_QUY_TAC:\s*`([\s\S]*?)`\s*,/);
    rules.push({
      file: relName,
      MA_LUAT: maLuat,
      TEN_QUY_TAC: tenM ? tenM[1].replace(/\s+/g, ' ').trim().slice(0, 120) : '',
      TRANG_THAI: ttM ? ttM[1] : 'UNKNOWN',
    });
  }
  return rules;
};

const extractRulesFromSeedJsonFile = (filePath, relName) => {
  const content = fs.readFileSync(filePath, 'utf8');
  const rules = [];
  const maRe = /"MA_LUAT":\s*"([^"]+)"/g;
  let m;
  while ((m = maRe.exec(content)) !== null) {
    const maLuat = m[1];
    const blockStart = content.lastIndexOf('{', m.index);
    if (blockStart < 0) continue;
    const slice = content.slice(blockStart, blockStart + 24000);
    const ttM = slice.match(/"TRANG_THAI":\s*"(ON|OFF)"/);
    const tenM = slice.match(/"TEN_QUY_TAC":\s*"([^"]*)"/);
    rules.push({
      file: relName,
      MA_LUAT: maLuat,
      TEN_QUY_TAC: tenM ? tenM[1].replace(/\s+/g, ' ').trim().slice(0, 120) : '',
      TRANG_THAI: ttM ? ttM[1] : 'UNKNOWN',
    });
  }
  return rules;
};

const main = () => {
  let all = [];

  for (const f of INLINE_RULE_FILES) {
    const fp = path.join(TIEN_ICH, f);
    if (!fs.existsSync(fp)) continue;
    all = all.concat(extractRulesFromInlineFile(fp, f));
  }

  for (const f of SEED_DATA_FILES) {
    const fp = path.join(TIEN_ICH, f);
    if (!fs.existsSync(fp)) continue;
    all = all.concat(extractRulesFromSeedJsonFile(fp, f));
  }

  const byMa = new Map();
  const dupes = [];
  for (const r of all) {
    const k = normalizeText(r.MA_LUAT).toUpperCase();
    if (byMa.has(k)) dupes.push([byMa.get(k), r]);
    else byMa.set(k, r);
  }

  const active = all.filter((r) => r.TRANG_THAI === 'ON');
  const inactive = all.filter((r) => r.TRANG_THAI === 'OFF');
  const unknown = all.filter((r) => r.TRANG_THAI === 'UNKNOWN');

  console.log('=== AUDIT TRẠNG THÁI QUY TẮC (mã nguồn / TRANG_THAI) ===\n');
  console.log(`Tổng bản ghi quét được: ${all.length}`);
  console.log(`  — Có hiệu lực (ON):  ${active.length}`);
  console.log(`  — Không hiệu lực (OFF): ${inactive.length}`);
  if (unknown.length) console.log(`  — Không đọc được trạng thái (UNKNOWN): ${unknown.length}`);
  if (dupes.length) console.log(`  — Cảnh báo: trùng MA_LUAT khi gộp nhiều file: ${dupes.length} cặp`);

  console.log('\n--- Danh sách MA_LUAT không hiệu lực (OFF) ---\n');
  inactive
    .sort((a, b) => a.MA_LUAT.localeCompare(b.MA_LUAT, 'vi'))
    .forEach((r) => {
      console.log(`  [OFF] ${r.MA_LUAT}  (${r.file})`);
      if (r.TEN_QUY_TAC) console.log(`        ${r.TEN_QUY_TAC}`);
    });

  if (unknown.length) {
    console.log('\n--- Cần rà soát thủ công (UNKNOWN) ---\n');
    unknown.forEach((r) => console.log(`  ${r.MA_LUAT}  (${r.file})`));
  }

  const outPath = path.join(__dirname, '../test_xml/rule_trang_thai_audit.json');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(
    outPath,
    JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        tong_so: all.length,
        on: active.length,
        off: inactive.length,
        unknown: unknown.length,
        danh_sach_off: inactive.map((r) => ({
          ma_luat: r.MA_LUAT,
          file: r.file,
          ten_quy_tac: r.TEN_QUY_TAC,
        })),
        danh_sach_on_count_by_file: [...new Set(all.map((r) => r.file))].reduce((acc, file) => {
          acc[file] = all.filter((x) => x.file === file && x.TRANG_THAI === 'ON').length;
          return acc;
        }, {}),
      },
      null,
      2,
    ),
    'utf8',
  );
  console.log(`\nĐã ghi JSON: ${outPath}`);
};

main();
