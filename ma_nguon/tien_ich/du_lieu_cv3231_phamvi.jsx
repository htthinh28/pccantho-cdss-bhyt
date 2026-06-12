/**
 * Dữ liệu & helper Công văn 3231/BYT-KCB (27/05/2025) — phạm vi hành nghề & thanh toán BHYT.
 * Nguồn: Bộ Y tế trả lời vướng mắc BHXH (thay thế mục 4.2 CV 129/BYT-KCB).
 */

export const CO_SO_PHAP_LY_CV3231 =
  'Công văn 3231/BYT-KCB (Bộ Y tế, 27/05/2025) — phạm vi hành nghề & thanh toán KCB BHYT';

/** Mã phạm vi chuyên môn (workbook NVYT / TT32). */
export const CV3231_PHAMVI = {
  Y_KHOA: '101',
  RHM: '116',
  /** Một số mã YHCT trên danh mục nội bộ (bổ sung theo text GPHN khi thiếu mã). */
  YHCT_CODES: ['117', '119', '129'],
};

/** Chức danh nghề nghiệp (CHUCDANH_NN). */
export const CV3231_CHUCDANH = {
  BAC_SI: '1',
  Y_SY: '2',
  DIEU_DUONG: '3',
  HO_SINH: '4',
  KY_THUAT_Y: '5',
};

const removeAccents = (v) => String(v || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/Đ/g, 'D')
  .replace(/đ/g, 'd');

const normText = (v) => removeAccents(v).toUpperCase().replace(/\s+/g, ' ').trim();

const parseScopeTokens = (raw) => {
  const tokens = new Set();
  String(raw || '').split(/[,;|]/).forEach((part) => {
    const t = String(part || '').trim();
    if (/^\d{2,3}$/.test(t)) tokens.add(t);
  });
  return tokens;
};

export const layPhamViSoTuNhanSu = (staff) => {
  const raw = staff?.raw || staff || {};
  const scopes = new Set();
  parseScopeTokens(raw.PHAMVI_CM).forEach((x) => scopes.add(x));
  parseScopeTokens(raw.PHAMVI).forEach((x) => scopes.add(x));
  if (staff?.scopes && typeof staff.scopes.forEach === 'function') {
    staff.scopes.forEach((x) => {
      if (/^\d{2,3}$/.test(String(x || ''))) scopes.add(String(x));
    });
  }
  return scopes;
};

export const layChuoiPhamViText = (staff) => {
  const raw = staff?.raw || staff || {};
  return normText([
    raw.PHAMVI_CM,
    raw.PHAMVI_CMBS,
    raw.PHAMVI,
    raw.VI_TRI,
    raw.GHI_CHU,
  ].filter(Boolean).join(' '));
};

export const laBacSiHoacYSy = (staff) => {
  const cd = String(staff?.chucDanhNorm || staff?.raw?.CHUCDANH_NN || '').trim();
  return cd === CV3231_CHUCDANH.BAC_SI || cd === CV3231_CHUCDANH.Y_SY;
};

export const laBacSiYhctHoacRhm = (staff) => {
  const scopes = layPhamViSoTuNhanSu(staff);
  if (scopes.has(CV3231_PHAMVI.RHM)) return true;
  if (CV3231_PHAMVI.YHCT_CODES.some((c) => scopes.has(c))) return true;
  const text = layChuoiPhamViText(staff);
  return /YHCT|Y HOC CO TRUYEN|DONG Y|Y HOC CO TRADITION/i.test(text)
    || /RHM|RANG HAM MAT|NHA KHOA/i.test(text);
};

export const laDieuDuongHang4 = (staff) => {
  const cd = String(staff?.chucDanhNorm || staff?.raw?.CHUCDANH_NN || '').trim();
  if (cd !== CV3231_CHUCDANH.DIEU_DUONG) return false;
  const scopes = layPhamViSoTuNhanSu(staff);
  if (scopes.has('304')) return true;
  const text = layChuoiPhamViText(staff);
  return /HANG\s*IV|HANG\s*4|CAP\s*4|DI?EU DUONG HANG IV/i.test(text);
};

/** BS đa khoa tương đương phạm vi Y khoa (§1.5). */
export const moRongPhamViNhanSuCv3231 = (staff) => {
  const expanded = layPhamViSoTuNhanSu(staff);
  const text = layChuoiPhamViText(staff);
  if (/DA KHOA|DAKHOA|KHAM BENH.*DA KHOA/i.test(text)) {
    expanded.add(CV3231_PHAMVI.Y_KHOA);
  }
  if (laBacSiYhctHoacRhm(staff)) {
    expanded.add(CV3231_PHAMVI.Y_KHOA);
  }
  return expanded;
};

/** NTCK cho phép kỹ thuật ngoài phạm vi GPHN khi có văn bản (§1.1, §1.8). */
export const coVanBanChoPhepDvkt = (staff, maDvkt) => {
  const raw = staff?.raw || staff || {};
  const vb = String(raw.VB_PHANCONG || raw.QD_CGKT || '').trim();
  const dvktKhac = String(raw.DVKT_KHAC || '').trim();
  if (!vb && !dvktKhac) return false;
  const ma = normText(maDvkt).replace(/\s/g, '');
  if (!ma) return Boolean(vb);
  const tokens = dvktKhac.split(/[,;|]/).map((x) => normText(x).replace(/\s/g, '')).filter(Boolean);
  if (!tokens.length) return Boolean(vb);
  return tokens.some((tok) => ma.startsWith(tok) || tok.startsWith(ma.slice(0, Math.min(tok.length, 4))));
};

const OP09_XML3_MA_NHOM_KHAM = '1';
const OP09_XML3_MA_NHOM_GIUONG = '15';

export const laDongCongKhamXml3 = (line, dmKhamSet) => {
  if (!line) return false;
  const mn = String(line.maNhom || line.MA_NHOM || '').trim().replace(/^0+(?=\d)/, '');
  if (mn === OP09_XML3_MA_NHOM_KHAM) return true;
  const ma = normText(line.maTuongDuong || line.MA_DICH_VU || line.MA_DV || '').replace(/\s/g, '');
  if (dmKhamSet && dmKhamSet.size > 0 && ma && dmKhamSet.has(ma)) return true;
  const ten = normText(line.tenDvkt || line.TEN_DICH_VU || line.TEN_DVKT || '');
  return /CONG KHAM|KHAM BENH|^KHAM\s/i.test(ten);
};

export const laDongGiuongMienPhamVi = (line) => {
  const ten = normText(line?.tenDvkt || line?.TEN_DICH_VU || '');
  if (ten.includes('GIUONG')) return true;
  const mn = String(line?.maNhom || line?.MA_NHOM || '').trim().replace(/^0+(?=\d)/, '');
  if (mn === OP09_XML3_MA_NHOM_GIUONG) return true;
  const prefix = String(line?.prefix || line?.maChuyenKhoa || '').trim().toUpperCase();
  if (prefix === '0K') return true;
  return false;
};

/** DVKT điều trị / PHCN — điều dưỡng hạng IV không được thực hiện (§2, thay CV129). */
export const laDvktDieuTriPhcnCv3231 = (line) => {
  if (laDongGiuongMienPhamVi(line)) return false;
  const ten = normText(line?.tenDvkt || line?.TEN_DICH_VU || line?.TEN_DVKT || '');
  if (/PHUC HOI CHUC NANG|PHCN|VAT LY TRI LIEU|THUY CHAT TRI LIEU|KEO GIAN|DIEN XUNG|LASER TRI LIEU/i.test(ten)) {
    return true;
  }
  const ma = String(line?.maTuongDuong || line?.MA_DICH_VU || '').trim();
  return /^05\.000[78]\./.test(ma) || /^05\.001/.test(ma);
};

export const hasIntersectionScope = (staffScopes, allowedScopes) => {
  if (!allowedScopes || allowedScopes.size === 0) return true;
  if (!staffScopes || staffScopes.size === 0) return false;
  for (const s of staffScopes) {
    if (allowedScopes.has(s)) return true;
  }
  return false;
};
