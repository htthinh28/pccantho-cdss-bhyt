/**
 * KPI BHYT — tính toán thuần (ES6+), O(N) trên mảng XML1/2 đã parse từ QĐ 130/QĐ-BYT.
 * Tách biệt hoàn toàn khỏi UI; chỉ dùng trường chuẩn trong schema XML1/XML2 của dự án.
 */

/** Định dạng tiền tệ — bắt buộc dùng cho mọi hiển thị giá trị tiền */
export const dinhDangTienVN = (value) =>
  new Intl.NumberFormat('vi-VN').format(toNumber(value));

/** Định dạng phần trăm (0–100), không ký hiệu % (component tự thêm) */
export const dinhDangPhanTramVN = (value, soChuSo = 2) =>
  new Intl.NumberFormat('vi-VN', {
    minimumFractionDigits: soChuSo,
    maximumFractionDigits: soChuSo,
  }).format(toNumber(value));

export function toNumber(v) {
  const n = Number(v ?? 0);
  return Number.isFinite(n) ? n : 0;
}

/** Chuẩn hóa MA_LOAI_KCB: '1' / '01' → '01' (khớp QĐ 130 & engine giám định) */
export function normalizeMaLoaiKcb(val) {
  const raw = String(val ?? '').trim();
  if (!raw) return '';
  const digits = raw.replace(/\D/g, '');
  return digits ? digits.padStart(2, '0') : raw;
}

/** Tổng chi BV: ưu tiên T_TONGCHI_BV, fallback T_TONGCHI (file mẫu cũ) */
export function layTongChiBv(xml1) {
  const t = toNumber(xml1?.T_TONGCHI_BV ?? xml1?.T_TONGCHI);
  return t > 0 ? t : 0;
}

/**
 * Bình quân chi phí ngoại trú — MA_LOAI_KCB = 1 hoặc 2 (trong file: '01', '02').
 * Chỉ tính các lượt có T_TONGCHI_BV/T_TONGCHI > 0.
 */
export function calculateAvgOutpatientCost(xml1Data) {
  const arr = Array.isArray(xml1Data) ? xml1Data : [];
  let tong = 0;
  let dem = 0;
  for (let i = 0; i < arr.length; i += 1) {
    const x = arr[i];
    const ma = normalizeMaLoaiKcb(x?.MA_LOAI_KCB);
    if (ma !== '01' && ma !== '02') continue;
    const chi = layTongChiBv(x);
    if (chi <= 0) continue;
    tong += chi;
    dem += 1;
  }
  return dem > 0 ? Math.round(tong / dem) : 0;
}

/**
 * Cơ cấu % chi phí trên tổng chi (aggregate toàn bộ bản ghi XML1 trong mảng):
 * - Thuốc: T_THUOC
 * - Cận lâm sàng: T_XN + T_CDHA (xét nghiệm + chẩn đoán hình ảnh)
 * - VTYT / DVKT tổng hợp trên XML1: T_VTYT (theo cấu trúc QĐ 130 trong dự án — khớp XML3)
 * Mẫu số: tổng layTongChiBv của tất cả bản ghi (cùng kỳ dữ liệu đầu vào).
 */
export function calculateCostBreakdown(xml1Data) {
  const arr = Array.isArray(xml1Data) ? xml1Data : [];
  let tongChi = 0;
  let tThuoc = 0;
  let tCanLamSang = 0;
  let tVtyt = 0;

  for (let i = 0; i < arr.length; i += 1) {
    const x = arr[i];
    tongChi += layTongChiBv(x);
    tThuoc += toNumber(x?.T_THUOC);
    tCanLamSang += toNumber(x?.T_XN) + toNumber(x?.T_CDHA);
    tVtyt += toNumber(x?.T_VTYT);
  }

  const pct = (phan) => (tongChi > 0 ? (phan / tongChi) * 100 : 0);
  return {
    tongChiPhi: tongChi,
    phanTramThuoc: Math.round(pct(tThuoc) * 100) / 100,
    phanTramCanLamSang: Math.round(pct(tCanLamSang) * 100) / 100,
    phanTramVTYT: Math.round(pct(tVtyt) * 100) / 100,
    thanhTienThuoc: tThuoc,
    thanhTienCanLamSang: tCanLamSang,
    thanhTienVTYT: tVtyt,
  };
}

/** Nội trú đúng yêu cầu đề bài: MA_LOAI_KCB = 3 → '03' */
function laNoiTruMa03(xml1) {
  return normalizeMaLoaiKcb(xml1?.MA_LOAI_KCB) === '03';
}

/**
 * ALOS — thời gian nằm viện trung bình (ngày) cho nội trú MA_LOAI_KCB = 3.
 * Dùng SO_NGAY_DTRI trên XML1 (số ngày điều trị theo QĐ 130).
 */
export function calculateALOS(xml1Data) {
  const arr = Array.isArray(xml1Data) ? xml1Data : [];
  let tongNgay = 0;
  let dem = 0;
  for (let i = 0; i < arr.length; i += 1) {
    const x = arr[i];
    if (!laNoiTruMa03(x)) continue;
    dem += 1;
    tongNgay += toNumber(x?.SO_NGAY_DTRI);
  }
  if (dem === 0) return 0;
  return Math.round((tongNgay / dem) * 100) / 100;
}

function parseNgay(raw) {
  if (!raw) return null;
  if (raw instanceof Date) return Number.isNaN(raw.getTime()) ? null : raw;
  const chuoi = String(raw).trim();
  if (!chuoi) return null;
  if (/^\d{8}$/.test(chuoi)) {
    const y = Number(chuoi.slice(0, 4));
    const m = Number(chuoi.slice(4, 6)) - 1;
    const d = Number(chuoi.slice(6, 8));
    const parsed = new Date(y, m, d);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  if (/^\d{14}$/.test(chuoi)) {
    const y = Number(chuoi.slice(0, 4));
    const m = Number(chuoi.slice(4, 6)) - 1;
    const d = Number(chuoi.slice(6, 8));
    const hh = Number(chuoi.slice(8, 10));
    const mm = Number(chuoi.slice(10, 12));
    const ss = Number(chuoi.slice(12, 14));
    const parsed = new Date(y, m, d, hh, mm, ss);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  const parsed = new Date(chuoi);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/** 3 ký tự đầu mã ICD-10 (sau bỏ dấu chấm): nhóm bệnh thống nhất cho tái nhập viện cùng nhóm chẩn đoán */
function layBaKyTuDauIcd(xml1) {
  const s = String(xml1?.MA_BENH_CHINH ?? xml1?.MA_BENH ?? '')
    .replace(/\./g, '')
    .toUpperCase()
    .trim();
  return s.slice(0, 3);
}

function chenhNgayTuNgayRaDenNgayVao(ngayRaTruoc, ngayVaoSau) {
  const dR = parseNgay(ngayRaTruoc);
  const dV = parseNgay(ngayVaoSau);
  if (!dR || !dV) return null;
  const t0 = Date.UTC(dR.getFullYear(), dR.getMonth(), dR.getDate());
  const t1 = Date.UTC(dV.getFullYear(), dV.getMonth(), dV.getDate());
  return Math.floor((t1 - t0) / 86400000);
}

/**
 * Tỷ lệ tái nhập viện trong 30 ngày, cùng MA_BN, cùng nhóm ICD-10 (3 ký tự đầu).
 * Chỉ xét cặp lượt nội trú liên tiếp (MA_LOAI_KCB = 3): đợt trước & đợt sau đều nội trú.
 * Mẫu số: số đợt nội trú trong dữ liệu; tử số: số lần tái nhập đủ điều kiện (mỗi cặp đếm 1).
 */
export function calculateReadmissionRate30Days(xml1Data) {
  const arr = Array.isArray(xml1Data) ? xml1Data : [];
  const gopTheoMaBn = new Map();

  for (let i = 0; i < arr.length; i += 1) {
    const x1 = arr[i];
    const mabn = String(x1?.MA_BN || '').trim();
    if (!mabn) continue;
    const nv = parseNgay(x1?.NGAY_VAO);
    if (!gopTheoMaBn.has(mabn)) gopTheoMaBn.set(mabn, []);
    gopTheoMaBn.get(mabn).push({ x1, nv });
  }

  let soLanTaiNhap = 0;
  let soDotNoiTru = 0;

  gopTheoMaBn.forEach((mang) => {
    mang.sort((a, b) => {
      const ta = a.nv?.getTime() ?? 0;
      const tb = b.nv?.getTime() ?? 0;
      if (ta !== tb) return ta - tb;
      return String(a.x1?.MA_LK || '').localeCompare(String(b.x1?.MA_LK || ''));
    });
    for (let i = 0; i < mang.length; i += 1) {
      if (laNoiTruMa03(mang[i].x1)) soDotNoiTru += 1;
    }
    for (let i = 1; i < mang.length; i += 1) {
      const truoc = mang[i - 1];
      const sau = mang[i];
      if (!laNoiTruMa03(truoc.x1) || !laNoiTruMa03(sau.x1)) continue;
      const chenh = chenhNgayTuNgayRaDenNgayVao(truoc.x1?.NGAY_RA, sau.x1?.NGAY_VAO);
      if (chenh === null || chenh < 0 || chenh > 30) continue;
      const p1 = layBaKyTuDauIcd(truoc.x1);
      const p2 = layBaKyTuDauIcd(sau.x1);
      if (p1.length < 3 || p2.length < 3 || p1 !== p2) continue;
      soLanTaiNhap += 1;
    }
  });

  const tyLePhanTram =
    soDotNoiTru > 0 ? Math.round((soLanTaiNhap / soDotNoiTru) * 10000) / 100 : 0;

  return {
    soDotNoiTru,
    soLanTaiNhap30Ngay: soLanTaiNhap,
    tyLeTaiNhapPhanTram: tyLePhanTram,
  };
}

/**
 * Đa thuốc (polypharmacy): đếm số thuốc khác nhau theo MA_THUOC trên từng MA_LK (XML2).
 * Trả về số thuốc bình quân / lượt (trên các MA_LK có ít nhất 1 dòng thuốc) và MA_LK > 7 loại.
 */
export function checkPolypharmacy(xml2Data) {
  const arr = Array.isArray(xml2Data) ? xml2Data : [];
  /** @type {Map<string, Set<string>>} */
  const maThuocTheoMaLk = new Map();

  for (let i = 0; i < arr.length; i += 1) {
    const row = arr[i];
    const maLk = String(row?.MA_LK ?? '').trim();
    const maThuoc = String(row?.MA_THUOC ?? '').trim();
    if (!maLk || !maThuoc) continue;
    if (!maThuocTheoMaLk.has(maLk)) maThuocTheoMaLk.set(maLk, new Set());
    maThuocTheoMaLk.get(maLk).add(maThuoc);
  }

  let tongSoThuoc = 0;
  let soLuot = maThuocTheoMaLk.size;
  /** @type {string[]} */
  const maLkQua7 = [];

  maThuocTheoMaLk.forEach((set, maLk) => {
    const n = set.size;
    tongSoThuoc += n;
    if (n > 7) maLkQua7.push(maLk);
  });

  maLkQua7.sort();

  return {
    soThuocBinhQuanMoiLuot: soLuot > 0 ? Math.round((tongSoThuoc / soLuot) * 100) / 100 : 0,
    soLuotCoThuoc: soLuot,
    maLkPolypharmacyTren7: maLkQua7,
    chiTietSoThuocTheoMaLk: Object.fromEntries(
      [...maThuocTheoMaLk.entries()].map(([k, v]) => [k, v.size]),
    ),
  };
}
