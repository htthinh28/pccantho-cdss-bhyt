/**
 * Quét ma_nguon/tien_ich/luat_giam_dinh_chuyen_de_hardcoded.jsx,
 * liệt kê mọi quy tắc có DIEU_KIEN: CHUYEN_DE_XML130_CHO_XU_LY_SAU (placeholder).
 *
 * Chạy sau mỗi lần sửa luật CHUYEN_DE:
 *   node scripts/sync_chuyen_de_placeholder_registry.mjs
 *
 * Lưu ý: không dùng regex một khối id→DIEU_KIEN (dễ “ăn” DIEU_KIEN của dòng khác);
 * quét theo dòng: mỗi dòng có `id: 'CHUYEN_DE-…'` cập nhật id hiện tại, rồi nhận
 * `DIEU_KIEN: CHUYEN_DE_XML130_CHO_XU_LY_SAU` trên cùng dòng (định dạng file hiện tại).
 */
import fs from 'fs';

const src = 'ma_nguon/tien_ich/luat_giam_dinh_chuyen_de_hardcoded.jsx';
const out = 'scripts/chuyen_de_placeholder_registry.json';

const lines = fs.readFileSync(src, 'utf8').split(/\r?\n/);
const ids = [];
let currentId = null;

for (const line of lines) {
  const idM = line.match(/id:\s*'(CHUYEN_DE-\d+)'/);
  if (idM) {
    currentId = idM[1];
  }
  if (currentId && /DIEU_KIEN:\s*CHUYEN_DE_XML130_CHO_XU_LY_SAU\s*,/.test(line)) {
    ids.push(currentId);
  }
}

ids.sort((a, b) => {
  const na = parseInt(a.replace('CHUYEN_DE-', ''), 10);
  const nb = parseInt(b.replace('CHUYEN_DE-', ''), 10);
  return na - nb;
});

const payload = {
  version: '2026-04-11',
  generated_note:
    'Tự động sinh — không sửa tay danh sách ids. Chính sách: mỗi id dưới đây cần lộ trình dữ liệu XML130/XML2/handler; không coi là đã thực chiến chỉ vì TRANG_THAI=ON.',
  source_file: src,
  placeholder_count: ids.length,
  rule_ids: ids,
};

fs.writeFileSync(out, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
console.log(`Đã ghi ${out}: ${ids.length} quy tắc placeholder.`);
