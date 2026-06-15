import { rutGonPhanHoiQuyTac } from './rut_gon_phan_hoi_quy_tac';

const WINDOWS_1252_FORWARD = new Map([
  ['\u20AC', 0x80], ['\u201A', 0x82], ['\u0192', 0x83], ['\u201E', 0x84],
  ['\u2026', 0x85], ['\u2020', 0x86], ['\u2021', 0x87], ['\u02C6', 0x88],
  ['\u2030', 0x89], ['\u0160', 0x8A], ['\u2039', 0x8B], ['\u0152', 0x8C],
  ['\u017D', 0x8E], ['\u2018', 0x91], ['\u2019', 0x92], ['\u201C', 0x93],
  ['\u201D', 0x94], ['\u2022', 0x95], ['\u2013', 0x96], ['\u2014', 0x97],
  ['\u02DC', 0x98], ['\u2122', 0x99], ['\u0161', 0x9A], ['\u203A', 0x9B],
  ['\u0153', 0x9C], ['\u017E', 0x9E], ['\u0178', 0x9F],
]);

const SUSPICIOUS_REGEX = /(?:\u00C3[\u0080-\u00FF]|\u00C2[\u00A0-\u00FF]|\u00C2[^\w\s]|\u00C4[\u0080-\u00FF]|\u00C5[\u0080-\u00FF]|\u00C6[\u0080-\u00FF]|\u00E1\u00BB|\u00E1\u00BA|\u00E2\u20AC|\u00F0\u0178|\u00EF\u00BF\u00BD|\uFFFD)/u;

const FRAGMENT_FIXES = [
  [/giư\uFFFD[\u0080-\u009F]?ng/g, 'giường'],
  [/Q\uFFFD[\u0080-\u009F]?-BYT/g, 'QĐ-BYT'],
  [/Q\uFFFD[\u0080-\u009F]?-BHXH/g, 'QĐ-BHXH'],
  [/Q\uFFFD[\u0080-\u009F]?/g, 'QĐ'],
  [/N\uFFFD[\u0080-\u009F]?-CP/g, 'NĐ-CP'],
  [/v\uFFFD[\u0080-\u009F]?/g, 'về'],
  [/đi\uFFFD[\u0080-\u009F]?u/g, 'điều'],
];

const CANH_BAO_FIELDS = [
  'phan_he',
  'truong_loi',
  'canh_bao',
  'muc_do',
  'ma_luat',
  'ten_quy_tac',
  'dieu_kien',
  'co_so_phap_ly',
  'namespace_quy_tac',
  'nguon_quy_tac',
  'luong_giai_trinh',
  'tab_quan_tri_goi_y',
  'noi_dung',
  'phan_loai',
];

const BAO_CAO_FIELDS = [
  'MA_LUAT',
  'TEN_QUY_TAC',
  'DIEU_KIEN',
  'CANH_BAO',
  'CO_SO_PHAP_LY',
  'NAMESPACE_QUY_TAC',
  'NGUON_QUY_TAC',
  'LUONG_GIAI_TRINH',
  'TAB_QUAN_TRI_GOI_Y',
  'TRUONG_LOI',
];

const countBadChars = (text) => {
  let total = 0;
  for (const ch of String(text || '')) {
    const code = ch.charCodeAt(0);
    if (code < 32 && ch !== '\n' && ch !== '\r' && ch !== '\t') total += 1;
  }
  return total;
};

const badScore = (text) => {
  const value = String(text || '');
  const suspicious = (value.match(new RegExp(SUSPICIOUS_REGEX.source, 'gu')) || []).length;
  const replacement = (value.match(/\uFFFD/g) || []).length;
  return (suspicious * 10) + (replacement * 25) + (countBadChars(value) * 20);
};

const encodeToWindows1252Bytes = (input) => {
  const bytes = [];
  for (const ch of String(input || '')) {
    const code = ch.codePointAt(0);
    if (code <= 0x7F) {
      bytes.push(code);
      continue;
    }
    if (code >= 0xA0 && code <= 0xFF) {
      bytes.push(code);
      continue;
    }
    const mapped = WINDOWS_1252_FORWARD.get(ch);
    if (mapped !== undefined) {
      bytes.push(mapped);
      continue;
    }
    const utf8 = new TextEncoder().encode(ch);
    for (const b of utf8) bytes.push(b);
  }
  return bytes;
};

const decodeWindows1252Mojibake = (input) => {
  try {
    return new TextDecoder('utf-8').decode(new Uint8Array(encodeToWindows1252Bytes(input)));
  } catch (_error) {
    return String(input || '');
  }
};

const applyFragmentFixes = (input) => {
  let output = String(input || '');
  FRAGMENT_FIXES.forEach(([fromRegex, to]) => {
    output = output.replace(fromRegex, to);
  });
  return output;
};

export const chuanHoaVanBanLoiFont = (input) => {
  if (input === null || input === undefined) return input;
  const original = String(input);
  let current = original;
  let best = current;
  let bestScore = badScore(best);

  for (let i = 0; i < 3; i += 1) {
    if (!SUSPICIOUS_REGEX.test(current)) {
      SUSPICIOUS_REGEX.lastIndex = 0;
      break;
    }
    SUSPICIOUS_REGEX.lastIndex = 0;
    const next = decodeWindows1252Mojibake(current);
    if (!next || next === current) break;
    current = next;
    const score = badScore(current);
    if (score < bestScore) {
      best = current;
      bestScore = score;
    }
  }

  const afterFragments = applyFragmentFixes(best);
  return badScore(afterFragments) <= bestScore ? afterFragments : best;
};

export const chuanHoaCanhBaoGiamDinh = (item) => {
  if (!item || typeof item !== 'object') return item;
  const next = { ...item };
  CANH_BAO_FIELDS.forEach((field) => {
    if (typeof next[field] === 'string') {
      const daChuanFont = chuanHoaVanBanLoiFont(next[field]);
      next[field] = field === 'canh_bao' || field === 'noi_dung'
        ? rutGonPhanHoiQuyTac(daChuanFont)
        : daChuanFont;
    }
  });
  return next;
};

export const chuanHoaDanhSachCanhBaoGiamDinh = (danhSach) =>
  (Array.isArray(danhSach) ? danhSach : []).map(chuanHoaCanhBaoGiamDinh);

export const chuanHoaBaoCaoViPham = (danhSach) =>
  (Array.isArray(danhSach) ? danhSach : []).map((item) => {
    if (!item || typeof item !== 'object') return item;
    const next = { ...item };
    BAO_CAO_FIELDS.forEach((field) => {
      if (typeof next[field] === 'string') {
        const daChuanFont = chuanHoaVanBanLoiFont(next[field]);
        next[field] = field === 'CANH_BAO'
          ? rutGonPhanHoiQuyTac(daChuanFont)
          : daChuanFont;
      }
    });
    return next;
  });

export const chuanHoaHoSoCanhBao = (hoSo, depth = 0) => {
  if (!hoSo || typeof hoSo !== 'object') return hoSo;
  const next = { ...hoSo };

  if (Array.isArray(next.ket_qua_giam_dinh)) {
    next.ket_qua_giam_dinh = chuanHoaDanhSachCanhBaoGiamDinh(next.ket_qua_giam_dinh);
  }
  if (Array.isArray(next.lich_su_audit)) {
    next.lich_su_audit = chuanHoaDanhSachCanhBaoGiamDinh(next.lich_su_audit);
  }
  if (Array.isArray(next.bao_cao_vi_pham_day_du)) {
    next.bao_cao_vi_pham_day_du = chuanHoaBaoCaoViPham(next.bao_cao_vi_pham_day_du);
  }
  if (next.giam_dinh_5_tang && typeof next.giam_dinh_5_tang === 'object') {
    next.giam_dinh_5_tang = {
      ...next.giam_dinh_5_tang,
      loi_he_thong: chuanHoaVanBanLoiFont(next.giam_dinh_5_tang.loi_he_thong || ''),
    };
  }
  if (depth < 1 && next.du_lieu_goc && typeof next.du_lieu_goc === 'object') {
    next.du_lieu_goc = chuanHoaHoSoCanhBao(next.du_lieu_goc, depth + 1);
  }

  return next;
};
