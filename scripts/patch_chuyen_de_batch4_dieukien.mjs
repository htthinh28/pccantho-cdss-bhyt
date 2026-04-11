/**
 * CHUYEN_DE-226 … 300: CHUYEN_DE_XML130_CHO_XU_LY_SAU + một số COUNT_IF DS_XML3.
 */
import fs from 'fs';

const path = 'ma_nguon/tien_ich/luat_giam_dinh_chuyen_de_hardcoded.jsx';
let s = fs.readFileSync(path, 'utf8');

const DEFER = 'CHUYEN_DE_XML130_CHO_XU_LY_SAU';

const U = (x) => `UPPER(String(${x} || ''))`;

const special = new Map([
  [
    '228',
    `(COUNT_IF(DS_XML3, item => ${U('item.TEN_DICH_VU')}.includes('CALCI') && (${U('item.TEN_DICH_VU')}.includes('TOÀN PHẦN') OR ${U('item.TEN_DICH_VU')}.includes('TOAN PHAN'))) > 0) && (COUNT_IF(DS_XML3, item => ${U('item.TEN_DICH_VU')}.includes('CALCI') && (${U('item.TEN_DICH_VU')}.includes('ION') OR ${U('item.TEN_DICH_VU')}.includes('ION HÓA'))) > 0)`,
  ],
  [
    '242',
    `(COUNT_IF(DS_XML3, item => ${U('item.TEN_DICH_VU')}.includes('DOPPLER') && (${U('item.TEN_DICH_VU')}.includes('THẬN') OR ${U('item.TEN_DICH_VU')}.includes('THAN'))) > 0) && (COUNT_IF(DS_XML3, item => ${U('item.TEN_DICH_VU')}.includes('SIÊU ÂM') && (${U('item.TEN_DICH_VU')}.includes('Ổ BỤNG') OR ${U('item.TEN_DICH_VU')}.includes('O BUNG') OR ${U('item.TEN_DICH_VU')}.includes('BỤNG TỔNG'))) > 0)`,
  ],
  [
    '243',
    `(COUNT_IF(DS_XML3, item => ${U('item.TEN_DICH_VU')}.includes('BLONDEAU')) > 0) && (COUNT_IF(DS_XML3, item => ${U('item.TEN_DICH_VU')}.includes('HIRTZ')) > 0)`,
  ],
  [
    '304',
    `(COUNT_IF(DS_XML3, item => (${U('item.TEN_DICH_VU')}.includes('ĐẶT') && ${U('item.TEN_DICH_VU')}.includes('NỘI KHÍ')) OR (${U('item.TEN_DICH_VU')}.includes('MỞ') && ${U('item.TEN_DICH_VU')}.includes('KHÍ QUẢN'))) > 0) && (COUNT_IF(DS_XML3, item => ${U('item.TEN_DICH_VU')}.includes('HÚT') && ${U('item.TEN_DICH_VU')}.includes('ĐỜM')) > 0)`,
  ],
]);

for (let n = 226; n <= 300; n += 1) {
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
console.log('Đã cập nhật CHUYEN_DE-226 … 300');
