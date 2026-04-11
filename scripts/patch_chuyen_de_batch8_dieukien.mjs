/**
 * CHUYEN_DE-526 … 603: chủ yếu CHUYEN_DE_XML130_CHO_XU_LY_SAU (API/đa BN/phiếu giả/XML2).
 * Một số mã khớp XML1 + CURRENT + COUNT_IF(DS_XML3/DS_XML5).
 */
import fs from 'fs';

const path = 'ma_nguon/tien_ich/luat_giam_dinh_chuyen_de_hardcoded.jsx';
let s = fs.readFileSync(path, 'utf8');

const DEFER = 'CHUYEN_DE_XML130_CHO_XU_LY_SAU';
const U = (x) => `UPPER(String(${x} || ''))`;

const special = new Map([
  [
    '526',
    `(COUNT_IF(DS_XML3, item => (${U('item.TEN_DICH_VU')}).includes('ICU') || (${U('item.TEN_DICH_VU')}).includes('HSCC') || (${U('item.TEN_DICH_VU')}).includes('HỒI SỨC TÍCH CỰC')) > 0) && (COUNT_IF(DS_XML3, item => (${U('item.TEN_DICH_VU')}).includes('THỞ MÁY') || (${U('item.TEN_DICH_VU')}).includes('THO MAY') || (${U('item.TEN_DICH_VU')}).includes('LỌC MÁU') || (${U('item.TEN_DICH_VU')}).includes('LOC MAU') || (${U('item.TEN_DICH_VU')}).includes('ECMO') || (${U('item.TEN_DICH_VU')}).includes('MONITOR')) == 0)`,
  ],
  [
    '532',
    `(COUNT_IF(DS_XML3, item => (${U('item.TEN_DICH_VU')}).includes('TRUYỀN MÁU') || (${U('item.TEN_DICH_VU')}).includes('HUYẾT TƯƠNG') || (${U('item.TEN_DICH_VU')}).includes('HỒNG CẦU') || (${U('item.TEN_DICH_VU')}).includes('TIẾP MÁU')) > 0) && (COUNT_IF(DS_XML3, item => (${U('item.TEN_DICH_VU')}).includes('HÒA HỢP') || (${U('item.TEN_DICH_VU')}).includes('HOA HỢP') || (${U('item.TEN_DICH_VU')}).includes('CROSSMATCH') || (${U('item.TEN_DICH_VU')}).includes('PHẢN ỨNG')) == 0)`,
  ],
  [
    '533',
    `(UPPER(CURRENT.TEN_DICH_VU) CONTAINS 'KẾT HỢP XƯƠNG' OR UPPER(CURRENT.TEN_DICH_VU) CONTAINS 'KHX' OR UPPER(CURRENT.TEN_DICH_VU) CONTAINS 'CỐ ĐỊNH XƯƠNG') && COUNT_IF(DS_XML5, item => String(item.TEN_VAT_TU || '').toUpperCase().includes('NẸP') OR String(item.TEN_VAT_TU || '').toUpperCase().includes('VÍT') OR String(item.TEN_VAT_TU || '').toUpperCase().includes('ĐINH')) == 0`,
  ],
  [
    '536',
    `(COUNT_IF(DS_XML5, item => String(item.TEN_VAT_TU || '').toUpperCase().includes('STAPLER') OR String(item.TEN_VAT_TU || '').toUpperCase().includes('KHÂU NỐI TIÊU HÓA')) > 0) && (COUNT_IF(DS_XML3, item => (${U('item.TEN_DICH_VU')}).includes('DẠ DÀY') || (${U('item.TEN_DICH_VU')}).includes('DA DAY')) > 0) && (COUNT_IF(DS_XML3, item => (${U('item.TEN_DICH_VU')}).includes('STAPLER') || (${U('item.TEN_DICH_VU')}).includes('CẮT')) > 0)`,
  ],
  [
    '542',
    `((${U('CURRENT.TEN_DICH_VU')}).includes('4D') || (${U('CURRENT.TEN_DICH_VU')}).includes('3D')) && (${U('CURRENT.TEN_DICH_VU')}).includes('THAI') && String(CURRENT.TYLE_TT || '') != '0' && String(CURRENT.TYLE_TT || '') != ''`,
  ],
  [
    '543',
    `(COUNT_IF(DS_XML3, item => (${U('item.TEN_DICH_VU')}).includes('POLYP') && ((${U('item.TEN_DICH_VU')}).includes('DẠ DÀY') || (${U('item.TEN_DICH_VU')}).includes('ĐẠI TRÀNG') || (${U('item.TEN_DICH_VU')}).includes('TIÊU HÓA'))) > 0) && (COUNT_IF(DS_XML3, item => (${U('item.TEN_DICH_VU')}).includes('GIẢI PHẪU BỆNH') || (${U('item.TEN_DICH_VU')}).includes('MÔ BỆNH')) == 0)`,
  ],
  [
    '548',
    `(COUNT_IF(DS_XML3, item => (${U('item.TEN_DICH_VU')}).includes('SOI TƯƠI') && (${U('item.TEN_DICH_VU')}).includes('ÂM ĐẠO')) > 0) && (COUNT_IF(DS_XML3, item => (${U('item.TEN_DICH_VU')}).includes('NHUỘM') && (${U('item.TEN_DICH_VU')}).includes('ÂM ĐẠO')) > 0)`,
  ],
  [
    '551',
    `(COUNT_IF(DS_XML3, item => (${U('item.TEN_DICH_VU')}).includes('MANTOUX') || (${U('item.TEN_DICH_VU')}).includes('TUBERCULIN')) > 0) && !(XML1.MA_BENH_CHINH CONTAINS 'A15' OR XML1.MA_BENH_CHINH CONTAINS 'A16' OR XML1.MA_BENH_CHINH CONTAINS 'R76' OR XML1.MA_BENH_KT CONTAINS 'A15' OR XML1.MA_BENH_KT CONTAINS 'A16' OR XML1.MA_BENH_KT CONTAINS 'R76')`,
  ],
  [
    '556',
    `(COUNT_IF(DS_XML3, item => (${U('item.TEN_DICH_VU')}).includes('PROTEIN') && (${U('item.TEN_DICH_VU')}).includes('NIỆU')) > 0) && (COUNT_IF(DS_XML3, item => (${U('item.TEN_DICH_VU')}).includes('GLUCOSE') && (${U('item.TEN_DICH_VU')}).includes('NIỆU')) > 0)`,
  ],
  [
    '557',
    `(COUNT_IF(DS_XML3, item => (${U('item.TEN_DICH_VU')}).includes('SIÊU ÂM') && ((${U('item.TEN_DICH_VU')}).includes('Ổ BỤNG') || (${U('item.TEN_DICH_VU')}).includes('O BUNG'))) > 0) && (COUNT_IF(DS_XML3, item => (${U('item.TEN_DICH_VU')}).includes('SIÊU ÂM') && (${U('item.TEN_DICH_VU')}).includes('THAI')) > 0)`,
  ],
  [
    '560',
    `(COUNT_IF(DS_XML3, item => (${U('item.TEN_DICH_VU')}).includes('NATRI') && (${U('item.TEN_DICH_VU')}).includes('MÁU')) > 0) && (COUNT_IF(DS_XML3, item => (${U('item.TEN_DICH_VU')}).includes('KALI') && (${U('item.TEN_DICH_VU')}).includes('MÁU')) > 0) && (COUNT_IF(DS_XML3, item => ((${U('item.TEN_DICH_VU')}).includes('CLO') || (${U('item.TEN_DICH_VU')}).includes('CL-')) && (${U('item.TEN_DICH_VU')}).includes('MÁU')) > 0)`,
  ],
  [
    '563',
    `(UPPER(CURRENT.TEN_DICH_VU) CONTAINS 'AMIDAN' OR UPPER(CURRENT.TEN_DICH_VU) CONTAINS 'AMIĐAN') && (TO_NUMBER(XML1.TUOI_NAM) > 30) && !(XML1.MA_BENH_CHINH CONTAINS 'J35' OR XML1.MA_BENH_KT CONTAINS 'J35')`,
  ],
  [
    '564',
    `(TO_NUMBER(XML1.TUOI_NAM) < 5) && (UPPER(CURRENT.TEN_DICH_VU) CONTAINS 'HÔ HẤP' OR UPPER(CURRENT.TEN_DICH_VU) CONTAINS 'HO HAP' OR UPPER(CURRENT.TEN_DICH_VU) CONTAINS 'SPIRO' OR UPPER(CURRENT.TEN_DICH_VU) CONTAINS 'HÔ HẤP KÝ')`,
  ],
  [
    '571',
    `(UPPER(CURRENT.TEN_DICH_VU) CONTAINS 'Ổ BỤNG' OR UPPER(CURRENT.TEN_DICH_VU) CONTAINS 'O BUNG') && !(UPPER(CURRENT.TEN_DICH_VU) CONTAINS 'THAI') && (XML1.MA_BENH_CHINH CONTAINS 'L03' OR XML1.MA_BENH_KT CONTAINS 'L03' OR XML1.MA_BENH_CHINH CONTAINS 'M79' OR XML1.MA_BENH_KT CONTAINS 'M79' OR XML1.MA_BENH_CHINH CONTAINS 'D17' OR XML1.MA_BENH_KT CONTAINS 'D17')`,
  ],
  [
    '572',
    `(COUNT_IF(DS_XML3, item => (${U('item.TEN_DICH_VU')}).includes('THỦY TINH') || (${U('item.TEN_DICH_VU')}).includes('THUY TINH') || (${U('item.TEN_DICH_VU')}).includes('A-B') || (${U('item.TEN_DICH_VU')}).includes('CÔNG SUẤT')) > 0) && (COUNT_IF(DS_XML3, item => (${U('item.TEN_DICH_VU')}).includes('SIÊU ÂM') && ((${U('item.TEN_DICH_VU')}).includes('MẮT') || (${U('item.TEN_DICH_VU')}).includes('MAT'))) > 0)`,
  ],
]);

for (let n = 526; n <= 603; n += 1) {
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
console.log('Đã cập nhật CHUYEN_DE-526 … 603.');
