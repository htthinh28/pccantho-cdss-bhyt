#!/usr/bin/env node
/**
 * Smoke test cho bundle PTTT (mục 11): đếm quy tắc, phiên bản seed, trùng MA_LUAT.
 * Chạy: node scripts/qa_pttt_seed_smoke.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SEED_FILE = path.join(ROOT, 'ma_nguon', 'tien_ich', 'du_lieu_luat_pttt_muc11.jsx');

const main = () => {
  if (!fs.existsSync(SEED_FILE)) {
    console.error(`[FAIL] Thiếu file: ${SEED_FILE}`);
    process.exit(1);
  }
  const raw = fs.readFileSync(SEED_FILE, 'utf8');
  const verM = raw.match(/export const PHIEN_BAN_SEED_LUAT_PTTT_MUC11 = "([^"]+)"/);
  const version = verM ? verM[1] : '';

  const maList = [];
  const re = /"MA_LUAT":\s*"([^"]+)"/g;
  let m;
  while ((m = re.exec(raw)) !== null) {
    maList.push(m[1]);
  }

  const counts = new Map();
  maList.forEach((ma) => {
    const k = String(ma || '').trim().toUpperCase();
    counts.set(k, (counts.get(k) || 0) + 1);
  });
  const dupes = [...counts.entries()].filter(([, n]) => n > 1);

  const onOff = { ON: 0, OFF: 0, OTHER: 0 };
  const ttRe = /"TRANG_THAI":\s*"(ON|OFF)"/g;
  while ((m = ttRe.exec(raw)) !== null) {
    const t = m[1];
    if (t === 'ON') onOff.ON += 1;
    else if (t === 'OFF') onOff.OFF += 1;
    else onOff.OTHER += 1;
  }

  console.log('QA PTTT seed (du_lieu_luat_pttt_muc11.jsx)\n');
  console.log(`  PHIEN_BAN_SEED_LUAT_PTTT_MUC11: ${version || '(không đọc được)'}`);
  console.log(`  Số bản ghi (đếm MA_LUAT): ${maList.length}`);
  console.log(`  TRANG_THAI — ON: ${onOff.ON}, OFF: ${onOff.OFF}${onOff.OTHER ? `, khác: ${onOff.OTHER}` : ''}`);

  if (maList.length < 500) {
    console.error(`[FAIL] Quá ít quy tắc (${maList.length}), kỳ vọng bundle PTTT đầy đủ.`);
    process.exit(1);
  }
  if (dupes.length > 0) {
    console.error(`[FAIL] Trùng MA_LUAT (${dupes.length} mã):`, dupes.slice(0, 20).map(([k, n]) => `${k}×${n}`).join(', '));
    process.exit(1);
  }
  if (!version || !/^\d{4}-\d{2}-\d{2}_muc11_pttt_/.test(version)) {
    console.error('[FAIL] Chuỗi phiên bản seed không đúng định dạng mong đợi.');
    process.exit(1);
  }

  console.log('\n[Kết luận] PASS — seed PTTT hợp lệ.');
};

main();
