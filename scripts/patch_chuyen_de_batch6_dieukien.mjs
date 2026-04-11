/**
 * CHUYEN_DE-376 … 450: CHUYEN_DE_XML130_CHO_XU_LY_SAU + COUNT_IF/CURRENT/XML1 khi khớp từ khóa.
 */
import fs from 'fs';

const path = 'ma_nguon/tien_ich/luat_giam_dinh_chuyen_de_hardcoded.jsx';
let s = fs.readFileSync(path, 'utf8');

const DEFER = 'CHUYEN_DE_XML130_CHO_XU_LY_SAU';
const U = (x) => `UPPER(String(${x} || ''))`;

const PRO_BNP_KHONG_ICD_SUY_TIM = `(UPPER(CURRENT.TEN_DICH_VU) CONTAINS 'PRO' OR UPPER(CURRENT.TEN_DICH_VU) CONTAINS 'BNP' OR UPPER(CURRENT.TEN_DICH_VU) CONTAINS 'NT-PRO') && !(XML1.MA_BENH_CHINH CONTAINS 'I50' OR XML1.MA_BENH_KT CONTAINS 'I50' OR XML1.MA_BENH_CHINH CONTAINS 'I11' OR XML1.MA_BENH_KT CONTAINS 'I11' OR XML1.MA_BENH_CHINH CONTAINS 'I42' OR XML1.MA_BENH_KT CONTAINS 'I42' OR XML1.MA_BENH_CHINH CONTAINS 'I43' OR XML1.MA_BENH_KT CONTAINS 'I43')`;

const SA_MAT_DO_CS = `(COUNT_IF(DS_XML3, item => ${U('item.TEN_DICH_VU')}.includes('SIÊU ÂM') && (${U('item.TEN_DICH_VU')}.includes('MẮT') OR ${U('item.TEN_DICH_VU')}.includes('NHÃN') OR ${U('item.TEN_DICH_VU')}.includes('NHÃN KHOA'))) > 0) && (COUNT_IF(DS_XML3, item => ${U('item.TEN_DICH_VU')}.includes('CÔNG SUẤT') && ${U('item.TEN_DICH_VU')}.includes('THỦY TINH')) > 0)`;

const SA_GIAP_HACH_CO = `(COUNT_IF(DS_XML3, item => ${U('item.TEN_DICH_VU')}.includes('TUYẾN GIÁP') OR ${U('item.TEN_DICH_VU')}.includes('GIÁP')) > 0) && (COUNT_IF(DS_XML3, item => (${U('item.TEN_DICH_VU')}.includes('HẠCH') && ${U('item.TEN_DICH_VU')}.includes('CỔ')) OR ${U('item.TEN_DICH_VU')}.includes('NƯỚC BỌT') OR (${U('item.TEN_DICH_VU')}.includes('SIÊU ÂM') && ${U('item.TEN_DICH_VU')}.includes('HẠCH')))) > 0)`;

const special = new Map([
  [
    '380',
    `(COUNT_IF(DS_XML3, item => ${U('item.TEN_DICH_VU')}.includes('DOPPLER') && (${U('item.TEN_DICH_VU')}.includes('Ổ BỤNG') OR ${U('item.TEN_DICH_VU')}.includes('O BUNG') OR ${U('item.TEN_DICH_VU')}.includes('BỤNG TỔNG') OR ${U('item.TEN_DICH_VU')}.includes('MẠCH MÁU'))) > 0) && (COUNT_IF(DS_XML3, item => ${U('item.TEN_DICH_VU')}.includes('SIÊU ÂM') && (${U('item.TEN_DICH_VU')}.includes('Ổ BỤNG') OR ${U('item.TEN_DICH_VU')}.includes('O BUNG'))) > 0)`,
  ],
  ['382', PRO_BNP_KHONG_ICD_SUY_TIM],
  [
    '383',
    `(COUNT_IF(DS_XML3, item => ${U('item.TEN_DICH_VU')}.includes('PHÂN') && (${U('item.TEN_DICH_VU')}.includes('HỒNG CẦU') OR ${U('item.TEN_DICH_VU')}.includes('BẠCH CẦU'))) > 0) && (COUNT_IF(DS_XML3, item => ${U('item.TEN_DICH_VU')}.includes('SOI') && ${U('item.TEN_DICH_VU')}.includes('PHÂN') && (${U('item.TEN_DICH_VU')}.includes('KST') OR ${U('item.TEN_DICH_VU')}.includes('KÝ SINH') OR ${U('item.TEN_DICH_VU')}.includes('ẤU TRÙNG'))) > 0)`,
  ],
  ['391', SA_MAT_DO_CS],
  [
    '406',
    `(COUNT_IF(DS_XML3, item => ${U('item.TEN_DICH_VU')}.includes('LACTAT') OR ${U('item.TEN_DICH_VU')}.includes('LACTATE')) > 0) && (COUNT_IF(DS_XML3, item => ${U('item.TEN_DICH_VU')}.includes('KHÍ MÁU') OR ${U('item.TEN_DICH_VU')}.includes('KHI MAU')) > 0)`,
  ],
  ['407', SA_GIAP_HACH_CO],
  [
    '386',
    `(UPPER(CURRENT.TEN_DICH_VU) CONTAINS 'NHỔ' && UPPER(CURRENT.TEN_DICH_VU) CONTAINS 'RĂNG') && (XML1.MA_BENH_CHINH CONTAINS 'K05' OR XML1.MA_BENH_KT CONTAINS 'K05')`,
  ],
  [
    '418',
    `(UPPER(CURRENT.TEN_DICH_VU) CONTAINS 'LASER' && UPPER(CURRENT.TEN_DICH_VU) CONTAINS 'MẮT') && TO_NUMBER(XML1.TUOI_NAM) < 18 && (XML1.MA_BENH_CHINH CONTAINS 'H52' OR XML1.MA_BENH_KT CONTAINS 'H52')`,
  ],
  [
    '424',
    `(XML1.MA_BENH_CHINH CONTAINS 'P59' OR XML1.MA_BENH_KT CONTAINS 'P59') && COUNT_IF(DS_XML3, item => ${U('item.TEN_DICH_VU')}.includes('BILIRUBIN')) == 0`,
  ],
  [
    '447',
    `(COUNT_IF(DS_XML3, item => (${U('item.TEN_DICH_VU')}.includes('X-QUANG') OR ${U('item.TEN_DICH_VU')}.includes('X QUANG') OR ${U('item.TEN_DICH_VU')}.includes('CHỤP X')) && ${U('item.TEN_DICH_VU')}.includes('NGỰC') && (${U('item.TEN_DICH_VU')}.includes('THẲNG') OR ${U('item.TEN_DICH_VU')}.includes('PA'))) > 0) && (COUNT_IF(DS_XML3, item => (${U('item.TEN_DICH_VU')}.includes('X-QUANG') OR ${U('item.TEN_DICH_VU')}.includes('X QUANG') OR ${U('item.TEN_DICH_VU')}.includes('CHỤP X')) && ${U('item.TEN_DICH_VU')}.includes('NGỰC') && ${U('item.TEN_DICH_VU')}.includes('NGHIÊNG')) > 0)`,
  ],
]);

for (let n = 376; n <= 450; n += 1) {
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
console.log('Đã cập nhật CHUYEN_DE-376 … 450.');
