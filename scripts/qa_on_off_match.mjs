/**
 * QA: khớp mẫu ON/OFF (_ vs -) — dùng chung logic với quy_tac_on_off_khop.js
 * Chạy: node scripts/qa_on_off_match.mjs
 */
import {
  chuanHoaKhoaMaLuatOnOff,
  khopMaLuatTheoMau,
} from '../ma_nguon/tien_ich/quy_tac_on_off_khop.js';

function assert(name, cond) {
  if (!cond) {
    console.error(`[FAIL] ${name}`);
    process.exitCode = 1;
  } else {
    console.log(`[OK]   ${name}`);
  }
}

assert('chuanHoa HC_06B', chuanHoaKhoaMaLuatOnOff('HC_06B') === 'HC-06B');
assert('chuanHoa HC-* giữ *', chuanHoaKhoaMaLuatOnOff('HC-*') === 'HC-*');

assert('HC-* khớp HC_130', khopMaLuatTheoMau('HC-*', 'HC_130'));
assert('HC-* khớp HC-130', khopMaLuatTheoMau('HC-*', 'HC-130'));
assert('HC-06* khớp HC_06D', khopMaLuatTheoMau('HC-06*', 'HC_06D'));
assert('CDHA-* khớp CDHA_164', khopMaLuatTheoMau('CDHA-*', 'CDHA_164'));
assert('CHUYEN_DE* khớp CHUYEN_DE_003', khopMaLuatTheoMau('CHUYEN_DE*', 'CHUYEN_DE_003'));

assert('HC-06b khớp HC_06B (exact)', khopMaLuatTheoMau('HC-06b', 'HC_06B'));
assert('HC_06b không khớp HC-07', !khopMaLuatTheoMau('HC-06b', 'HC_07'));

console.log('');
if (process.exitCode === 1) {
  console.error('Kết luận: có assertion thất bại.');
  process.exit(1);
}
console.log('Kết luận: khớp mẫu ON/OFF (_/-) ổn định.');
