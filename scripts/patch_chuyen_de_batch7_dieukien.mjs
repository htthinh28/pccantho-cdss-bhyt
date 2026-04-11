/**
 * CHUYEN_DE-451 … 525: chủ yếu CHUYEN_DE_XML130_CHO_XU_LY_SAU (thuốc/XML2/API giả).
 * Một số mã khớp XML1 + CURRENT + COUNT_IF(DS_XML3).
 */
import fs from 'fs';

const path = 'ma_nguon/tien_ich/luat_giam_dinh_chuyen_de_hardcoded.jsx';
let s = fs.readFileSync(path, 'utf8');

const DEFER = 'CHUYEN_DE_XML130_CHO_XU_LY_SAU';
const U = (x) => `UPPER(String(${x} || ''))`;

const special = new Map([
  [
    '468',
    `(UPPER(CURRENT.TEN_DICH_VU) CONTAINS 'PROETZ' OR (UPPER(CURRENT.TEN_DICH_VU) CONTAINS 'HÚT' && UPPER(CURRENT.TEN_DICH_VU) CONTAINS 'MŨI')) && !(XML1.MA_BENH_CHINH CONTAINS 'J32' OR XML1.MA_BENH_KT CONTAINS 'J32' OR XML1.MA_BENH_CHINH CONTAINS 'J01' OR XML1.MA_BENH_KT CONTAINS 'J01' OR XML1.MA_BENH_CHINH CONTAINS 'J02' OR XML1.MA_BENH_KT CONTAINS 'J02')`,
  ],
  [
    '473',
    `(COUNT_IF(DS_XML3, item => ${U('item.TEN_DICH_VU')}.includes('KHÁM')) > 0) && (COUNT_IF(DS_XML3, item => ${U('item.TEN_DICH_VU')}.includes('NỘI SOI') && ${U('item.TEN_DICH_VU')}.includes('DỊ VẬT')) > 0)`,
  ],
  [
    '490',
    `(TO_NUMBER(XML1.TUOI_NAM) >= 16) && (COUNT_IF(DS_XML3, item => ${U('item.TEN_DICH_VU')}.includes('XOA BÓP') && (${U('item.TEN_DICH_VU')}.includes('BẠI NÃO') OR ${U('item.TEN_DICH_VU')}.includes('TRẺ'))) > 0)`,
  ],
  [
    '492',
    `(COUNT_IF(DS_XML3, item => (${U('item.TEN_DICH_VU')}.includes('XOA BÓP') OR ${U('item.TEN_DICH_VU')}.includes('XOA BOP')) && ${U('item.TEN_DICH_VU')}.includes('VII')) > 0) && (COUNT_IF(DS_XML3, item => ${U('item.TEN_DICH_VU')}.includes('ĐIỆN CHÂM') && ${U('item.TEN_DICH_VU')}.includes('MẶT')) > 0)`,
  ],
  [
    '500',
    `(String(XML1.MA_GIOI_TINH) == '1') && (UPPER(CURRENT.TEN_DICH_VU) CONTAINS 'PHỤ KHOA' OR UPPER(CURRENT.TEN_DICH_VU) CONTAINS 'TỬ CUNG' OR UPPER(CURRENT.TEN_DICH_VU) CONTAINS 'BUỒNG TRỨNG')`,
  ],
  [
    '501',
    `(String(XML1.MA_GIOI_TINH) == '2') && (UPPER(CURRENT.TEN_DICH_VU) CONTAINS 'PSA')`,
  ],
  [
    '502',
    `(String(XML1.MA_GIOI_TINH) == '1') && (UPPER(CURRENT.TEN_DICH_VU) CONTAINS 'HCG' OR UPPER(CURRENT.TEN_DICH_VU) CONTAINS 'BETA-HCG' OR UPPER(CURRENT.TEN_DICH_VU) CONTAINS 'BETA HCG') && !(XML1.MA_BENH_CHINH CONTAINS 'C62' OR XML1.MA_BENH_KT CONTAINS 'C62')`,
  ],
  [
    '508',
    `(COUNT_IF(DS_XML3, item => ${U('item.TEN_DICH_VU')}.includes('NỘI SOI') && ${U('item.TEN_DICH_VU')}.includes('DẠ DÀY') && (${U('item.TEN_DICH_VU')}.includes('HP') OR ${U('item.TEN_DICH_VU')}.includes('HELICOBACTER'))) > 0) && (COUNT_IF(DS_XML3, item => ${U('item.TEN_DICH_VU')}.includes('HƠI THỞ') && (${U('item.TEN_DICH_VU')}.includes('HP') OR ${U('item.TEN_DICH_VU')}.includes('UREASE'))) > 0)`,
  ],
  [
    '509',
    `(TO_NUMBER(XML1.TUOI_NAM) > 16) && (COUNT_IF(DS_XML3, item => (${U('item.TEN_DICH_VU')}.includes('GIƯỜNG') OR ${U('item.TEN_DICH_VU')}.includes('GIUONG')) && ${U('item.TEN_DICH_VU')}.includes('NHI')) > 0)`,
  ],
  [
    '525',
    `(COUNT_IF(DS_XML3, item => (${U('item.TEN_DICH_VU')}.includes('X-QUANG') OR ${U('item.TEN_DICH_VU')}.includes('CHỤP X')) && (${U('item.TEN_DICH_VU')}.includes('SỌ') OR ${U('item.TEN_DICH_VU')}.includes('MẶT')) && (${U('item.TEN_DICH_VU')}.includes('THẲNG') OR ${U('item.TEN_DICH_VU')}.includes('NGHIÊNG'))) > 0) && (COUNT_IF(DS_XML3, item => ${U('item.TEN_DICH_VU')}.includes('XƯƠNG CHŨM')) > 0)`,
  ],
]);

for (let n = 451; n <= 525; n += 1) {
  const id = String(n).padStart(3, '0');
  const key = `Chuyen_de_${id}`;
  const dieuKien = special.has(id) ? `\`${special.get(id)}\`` : DEFER;
  const re = new RegExp(
    `(\\{ id: 'CHUYEN_DE-${id}', MA_LUAT: '${key}', TEN_QUY_TAC: [\`][^]*?[\`], )DIEU_KIEN: [\`][^]*?[\`](, CANH_BAO:)`,
    '',
  );
  if (!s.match(re)) {
    console.error('Không khớp rule', id);
    process.exit(1);
  }
  s = s.replace(re, `$1DIEU_KIEN: ${dieuKien}$2`);
}

fs.writeFileSync(path, s, 'utf8');
console.log('Đã cập nhật CHUYEN_DE-451 … 525.');
