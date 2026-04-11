/**
 * CHUYEN_DE-301 … 375: CHUYEN_DE_XML130_CHO_XU_LY_SAU + COUNT_IF/CURRENT/XML1 khi đủ dữ liệu.
 * Bỏ qua CHUYEN_DE-304 (đã COUNT_IF từ lô trước).
 */
import fs from 'fs';

const path = 'ma_nguon/tien_ich/luat_giam_dinh_chuyen_de_hardcoded.jsx';
let s = fs.readFileSync(path, 'utf8');

const DEFER = 'CHUYEN_DE_XML130_CHO_XU_LY_SAU';
const U = (x) => `UPPER(String(${x} || ''))`;

const special = new Map([
  [
    '303',
    `(UPPER(CURRENT.TEN_DICH_VU) CONTAINS 'PRO' OR UPPER(CURRENT.TEN_DICH_VU) CONTAINS 'BNP' OR UPPER(CURRENT.TEN_DICH_VU) CONTAINS 'NT-PRO') && !(XML1.MA_BENH_CHINH CONTAINS 'I50' OR XML1.MA_BENH_KT CONTAINS 'I50' OR XML1.MA_BENH_CHINH CONTAINS 'I11' OR XML1.MA_BENH_KT CONTAINS 'I11' OR XML1.MA_BENH_CHINH CONTAINS 'I42' OR XML1.MA_BENH_KT CONTAINS 'I42' OR XML1.MA_BENH_CHINH CONTAINS 'I43' OR XML1.MA_BENH_KT CONTAINS 'I43')`,
  ],
  [
    '305',
    `(UPPER(CURRENT.TEN_DICH_VU) CONTAINS 'CA 15' OR UPPER(CURRENT.TEN_DICH_VU) CONTAINS 'CA15' OR UPPER(CURRENT.TEN_DICH_VU) CONTAINS 'CA-15' OR (UPPER(CURRENT.TEN_DICH_VU) CONTAINS 'CA' && UPPER(CURRENT.TEN_DICH_VU) CONTAINS '15-3')) && !(XML1.MA_BENH_CHINH CONTAINS 'C50' OR XML1.MA_BENH_KT CONTAINS 'C50')`,
  ],
  [
    '327',
    `(COUNT_IF(DS_XML3, item => ${U('item.TEN_DICH_VU')}.includes('LACTAT') OR ${U('item.TEN_DICH_VU')}.includes('LACTATE')) > 0) && (COUNT_IF(DS_XML3, item => (${U('item.TEN_DICH_VU')}.includes('KHÍ MÁU') OR ${U('item.TEN_DICH_VU')}.includes('KHI MAU')) && (${U('item.TEN_DICH_VU')}.includes('ĐỘNG MẠCH') OR ${U('item.TEN_DICH_VU')}.includes('MẠCH MÁU'))) > 0)`,
  ],
  [
    '328',
    `(COUNT_IF(DS_XML3, item => ${U('item.TEN_DICH_VU')}.includes('NỘI SOI') && (${U('item.TEN_DICH_VU')}.includes('ĐẠI TRỰC') OR ${U('item.TEN_DICH_VU')}.includes('ĐẠI TRÀNG') OR ${U('item.TEN_DICH_VU')}.includes('TRỰC TRÀNG') OR ${U('item.TEN_DICH_VU')}.includes('COLON'))) > 0) && (COUNT_IF(DS_XML3, item => ${U('item.TEN_DICH_VU')}.includes('GÂY MÊ') && ${U('item.TEN_DICH_VU')}.includes('KHÁC')) > 0)`,
  ],
  [
    '329',
    `(COUNT_IF(DS_XML3, item => ${U('item.TEN_DICH_VU')}.includes('PAS') && !(${U('item.TEN_DICH_VU')}.includes('PASI'))) > 0) && (COUNT_IF(DS_XML3, item => ${U('item.TEN_DICH_VU')}.includes('MÔ BỆNH') OR ${U('item.TEN_DICH_VU')}.includes('GIẢI PHẪU BỆNH')) > 0)`,
  ],
  [
    '332',
    `(COUNT_IF(DS_XML3, item => ${U('item.TEN_DICH_VU')}.includes('HỒI PHỤC') && ${U('item.TEN_DICH_VU')}.includes('PHẾ QUẢN')) > 0) && (COUNT_IF(DS_XML3, item => ${U('item.TEN_DICH_VU')}.includes('CHỨC NĂNG') && ${U('item.TEN_DICH_VU')}.includes('HÔ HẤP')) > 0)`,
  ],
  [
    '333',
    `(UPPER(CURRENT.TEN_DICH_VU) CONTAINS 'CETIRIZIN') && TO_NUMBER(XML1.TUOI_NAM) < 6`,
  ],
  [
    '336',
    `(UPPER(CURRENT.TEN_DICH_VU) CONTAINS 'MASSOFT') && TO_NUMBER(XML1.TUOI_NAM) < 2`,
  ],
  [
    '337',
    `(UPPER(CURRENT.TEN_DICH_VU) CONTAINS 'EPERISON' OR UPPER(CURRENT.TEN_DICH_VU) CONTAINS 'RYZONAL') && TO_NUMBER(XML1.TUOI_NAM) < 18`,
  ],
  [
    '357',
    `(COUNT_IF(DS_XML3, item => ${U('item.TEN_DICH_VU')}.includes('ĐIỆN TIM') OR ${U('item.TEN_DICH_VU')}.includes('ĐTĐ') OR ${U('item.TEN_DICH_VU')}.includes('ECG')) > 0) && (COUNT_IF(DS_XML3, item => ${U('item.TEN_DICH_VU')}.includes('DOPPLER') && ${U('item.TEN_DICH_VU')}.includes('TIM')) > 0)`,
  ],
  [
    '363',
    `(COUNT_IF(DS_XML3, item => ${U('item.TEN_DICH_VU')}.includes('SIÊU ÂM') && (${U('item.TEN_DICH_VU')}.includes('MẮT') OR ${U('item.TEN_DICH_VU')}.includes('NHÃN') OR ${U('item.TEN_DICH_VU')}.includes('NHÃN KHOA'))) > 0) && (COUNT_IF(DS_XML3, item => ${U('item.TEN_DICH_VU')}.includes('CÔNG SUẤT') && ${U('item.TEN_DICH_VU')}.includes('THỦY TINH')) > 0)`,
  ],
]);

for (let n = 301; n <= 375; n += 1) {
  if (n === 304) continue;
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
console.log('Đã cập nhật CHUYEN_DE-301 … 375 (trừ 304).');
