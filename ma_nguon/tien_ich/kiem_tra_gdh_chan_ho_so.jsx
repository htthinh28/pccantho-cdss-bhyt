/**
 * Kiểm tra logic chặn hồ sơ bám quy định Cổng GDH / BHXH (Danh mục mã lỗi trả CTN — tài liệu
 * «GDH_Danh sách các mã lỗi Chặn hồ sơ sai logic»).
 *
 * Phạm vi: chỉ các quy tắc suy ra trực tiếp từ XML1–XML3 đã parse (không có DM CSKCB/BHXH/HĐ).
 * Mã hiển thị: GDH_{4210|9324}_{số_mã_trong_tài_liệu} để đối chiếu với cổng.
 *
 * Đã bao phủ (XML): 1,3–5,11,14–27,31,34,35–38,39–48,51,52,56,102–103 và nhánh 9324/4210 (mã 3 vs 47).
 * Chưa thể chặn khớp cổng chỉ từ XML: 8–10,12,49–50,53–55,58,60–61,101,104–106 (cần DM + DB/hợp đồng).
 * Rút gọn so với văn bản đầy đủ: 48,52 (trái tuyến/gói/TYT), 101 (tuyến BV), 102 (chi tiết gói).
 */

const CO_SO_PHAP_LY =
  'Cổng giám định BHYT — kiểm tra chặn hồ sơ sai logic (đối chiếu GDH / Mức lỗi CTN)';
const TEN_QUY_TAC = 'Chặn GDH — sai logic XML';

const laRong = (val) => val === undefined || val === null || String(val).trim() === '';

const toNum = (val) => {
  if (laRong(val)) return NaN;
  const raw = String(val).trim().replace(',', '.');
  const n = Number(raw);
  return Number.isFinite(n) ? n : NaN;
};

const parseNgayDigits = (val, minLen) => {
  const digits = String(val || '').replace(/\D/g, '');
  if (digits.length < minLen) return null;
  const nam = Number(digits.slice(0, 4));
  const thang = Number(digits.slice(4, 6)) - 1;
  const ngay = Number(digits.slice(6, 8));
  const gio = Number(digits.slice(8, 10) || '0');
  const phut = Number(digits.slice(10, 12) || '0');
  const d = new Date(nam, thang, ngay, gio, phut, 0, 0);
  if (Number.isNaN(d.getTime())) return null;
  if (
    d.getFullYear() !== nam ||
    d.getMonth() !== thang ||
    d.getDate() !== ngay ||
    d.getHours() !== gio ||
    d.getMinutes() !== phut
  ) {
    return null;
  }
  return d;
};

const laNgay8HopLe = (val) => /^\d{8}$/.test(String(val || '').trim()) && parseNgayDigits(val, 8);
const laNgay12HopLe = (val) => /^\d{12}$/.test(String(val || '').trim()) && parseNgayDigits(val, 12);

/** GDH 15 / QĐ 3176 — XML1.NGAY_SINH: 8 số YYYYMMDD hoặc 12 số YYYYMMDDHHmm; HHmm mặc định 0000; MM+DD có thể 0000 khi không có ngày/tháng. */
const laHopLeNgaySinhXml1Gdh15 = (val) => {
  const digits = String(val ?? '').replace(/\D/g, '');
  if (digits.length === 8) return laNgay8HopLe(digits);
  if (digits.length !== 12) return false;
  const y = parseInt(digits.slice(0, 4), 10);
  const mo = parseInt(digits.slice(4, 6), 10);
  const d = parseInt(digits.slice(6, 8), 10);
  const h = parseInt(digits.slice(8, 10), 10);
  const mi = parseInt(digits.slice(10, 12), 10);
  if (!Number.isFinite(y) || y < 1890 || y > 2120) return false;
  if (h > 23 || mi > 59) return false;
  if (mo === 0 && d === 0) return true;
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return false;
  const dt = new Date(y, mo - 1, d);
  return dt.getFullYear() === y && dt.getMonth() === mo - 1 && dt.getDate() === d;
};

const layDongXML1 = (hoSo) => {
  const raw = hoSo?.xml1 ?? hoSo?.XML1;
  if (Array.isArray(raw)) return raw[0] || null;
  return raw && typeof raw === 'object' ? raw : null;
};

const layDs = (hoSo, ten) => {
  const raw = hoSo?.[ten.toLowerCase()] ?? hoSo?.[ten];
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === 'object') return [raw];
  return [];
};

const fmtDong = (phanHe, index, msg) =>
  `${phanHe}${typeof index === 'number' && index >= 0 ? `: Dong ${index + 1}` : ''}: ${msg}`;

const push = (ds, { maGdh, phienBan, phanHe, index, truong, mucDo, noiDung }) => {
  const maLuat = `GDH_${phienBan}_${maGdh}`;
  const text = fmtDong(phanHe, index, `⛔ [GDH ${phienBan}/${maGdh}] ${noiDung}`);
  ds.push({
    phan_he: phanHe,
    index: typeof index === 'number' ? index : -1,
    truong_loi: truong || 'GDH',
    canh_bao: text,
    muc_do: mucDo || 'Critical',
    ma_luat: maLuat,
    ten_quy_tac: TEN_QUY_TAC,
    dieu_kien: 'STATIC_GDH',
    co_so_phap_ly: CO_SO_PHAP_LY,
    ma_loi_chan_gdh: maGdh,
    phien_ban_hs: phienBan,
  });
};

const almostEq = (a, b, tol = 2) => Math.abs(Number(a) - Number(b)) <= tol;

const toNum0 = (val) => {
  const n = toNum(val);
  return Number.isNaN(n) ? 0 : n;
};

/** Chuẩn hóa MA_NHOM / MA_LOAI_KCB về chuỗi số (bỏ số 0 đầu không cần thiết). */
const chuanHoaSoMa = (raw) => {
  const s = String(raw ?? '').trim();
  if (!s) return '';
  const n = parseInt(s.replace(/^0+/, '') || '0', 10);
  return Number.isFinite(n) ? String(n) : s;
};

const hopLeXml2MaNhom = new Set(['4', '5', '6', '7']);
const hopLeXml3MaNhom = new Set([
  '1',
  '2',
  '3',
  '8',
  '9',
  '10',
  '11',
  '12',
  '13',
  '14',
  '15',
]);
const hopLePhamVi = new Set(['1', '2']);

const layThanhTienBvDong = (row) => {
  const a = toNum(row.THANH_TIEN_BV);
  if (!Number.isNaN(a)) return a;
  const b = toNum(row.THANH_TIEN);
  return Number.isNaN(b) ? NaN : b;
};

const layTyLeTtPhanTram = (row) => {
  const t = toNum(row.TYLE_TT_DV ?? row.TYLE_TT ?? row.TYLE_TT_BH ?? 100);
  return Number.isNaN(t) ? 100 : t;
};

/** Có dữ liệu tiền BHYT (9324) trên XML1 hoặc chi tiết — dùng cho mã 3,4,5. */
const coLuong9324Bh = (xml1, xml2, xml3) =>
  !laRong(xml1.T_TONGCHI_BH) ||
  xml2.some((r) => !laRong(r.THANH_TIEN_BH)) ||
  xml3.some((r) => !laRong(r.THANH_TIEN_BH));

const STENT_MA = 'N06.02.020';

/**
 * @param {object} hoSo — đã parse giống luồng kiem_tra_xml
 * @returns {object[]} mảng lỗi cùng dạng chi_tiet_loi
 */
export const kiemTraGdhChanHoSoChiTiet = (hoSo) => {
  const out = [];
  const xml1 = layDongXML1(hoSo);
  if (!xml1 || typeof xml1 !== 'object') return out;

  const maThe = String(xml1.MA_THE_BHYT || xml1.MA_THE || '').trim().toUpperCase();
  const phienBan =
    maThe.startsWith('HN') || /^[A-Z]{2}\d/.test(maThe)
      ? '4210'
      : '9324';

  const xml2 = layDs(hoSo, 'XML2');
  const xml3 = layDs(hoSo, 'XML3');
  const dung9324Bh = coLuong9324Bh(xml1, xml2, xml3);

  const mucHuongXml1 = toNum(xml1.MUC_HUONG ?? xml1.MUC_HUONG_THE);

  // --- Mã 1: Lý do vào viện (1–4); =3 nhưng ĐKBD = CSKCB (khai sai tuyến) ---
  const maLydoVv = String(
    xml1.MA_LYDO_VVIEN ?? xml1.MA_LY_DO_VV ?? xml1.MA_LY_DO_VNT ?? '',
  ).trim();
  if (!laRong(maLydoVv)) {
    const ld = Number(maLydoVv);
    if (!Number.isInteger(ld) || ld < 1 || ld > 4) {
      push(out, {
        maGdh: 1,
        phienBan,
        phanHe: 'XML1',
        index: -1,
        truong: 'MA_LYDO_VVIEN',
        mucDo: 'Critical',
        noiDung: 'Mã lý do vào viện phải là 1, 2, 3 hoặc 4 (GDH 1).',
      });
    } else {
      const mDkbd = String(xml1.MA_DKBD ?? '').trim();
      const mCskcb = String(xml1.MA_CSKCB ?? '').trim();
      if (ld === 3 && mDkbd && mCskcb && mDkbd === mCskcb) {
        push(out, {
          maGdh: 1,
          phienBan,
          phanHe: 'XML1',
          index: -1,
          truong: 'MA_LYDO_VVIEN',
          mucDo: 'Critical',
          noiDung:
            'Lý do vào viện = 3 (trái tuyến) nhưng MA_DKBD trùng MA_CSKCB — GDH 1.',
        });
      }
    }
  }

  // --- Mã 17 (4210): Mã thẻ 15 ký tự ---
  if (maThe && maThe.length !== 15) {
    push(out, {
      maGdh: 17,
      phienBan,
      phanHe: 'XML1',
      index: -1,
      truong: 'MA_THE_BHYT',
      mucDo: 'Critical',
      noiDung: 'Mã thẻ BHYT phải đủ 15 ký tự (mã lỗi cổng 17).',
    });
  }

  // --- Mã 15: NGAY_SINH — 8 số YYYYMMDD hoặc 12 số YYYYMMDDHHmm (đặc tả thẻ BHYT) ---
  if (!laRong(xml1.NGAY_SINH)) {
    if (!laHopLeNgaySinhXml1Gdh15(xml1.NGAY_SINH)) {
      push(out, {
        maGdh: 15,
        phienBan,
        phanHe: 'XML1',
        index: -1,
        truong: 'NGAY_SINH',
        mucDo: 'Critical',
        noiDung:
          'NGAY_SINH không đúng đặc tả (GDH 15): ghi 12 ký tự số YYYYMMDDHHmm (năm+tháng+ngày+giờ+phút) hoặc 8 ký tự YYYYMMDD; không có giờ/phút → HHmm=0000; không có ngày/tháng → MM và DD = 00; khi đủ ngày/tháng phải là ngày lịch hợp lệ. Trẻ ≤28 ngày tuổi nên ghi đủ ngày/giờ khi có; trẻ bỏ rơi không xác định được thì ghi theo thời điểm tiếp nhận.',
      });
    }
  }

  // --- Mã 16: Giới tính 1–3 ---
  const gt = String(xml1.GIOI_TINH ?? '').trim();
  if (!laRong(gt) && !new Set(['1', '2', '3']).has(gt)) {
    push(out, {
      maGdh: 16,
      phienBan,
      phanHe: 'XML1',
      index: -1,
      truong: 'GIOI_TINH',
      mucDo: 'Critical',
      noiDung: 'Giới tính đề nghị phải là 1, 2 hoặc 3 (GDH 16).',
    });
  }

  // --- Mã 23 / 24: Ngày vào / ra ---
  ['NGAY_VAO', 'NGAY_RA'].forEach((field, i) => {
    const ma = i === 0 ? 23 : 24;
    if (!laRong(xml1[field]) && !laNgay12HopLe(xml1[field])) {
      push(out, {
        maGdh: ma,
        phienBan,
        phanHe: 'XML1',
        index: -1,
        truong: field,
        mucDo: 'Critical',
        noiDung: `${field} phải đủ 12 chữ số YYYYMMDDHHMM và là thời điểm hợp lệ (GDH ${ma}).`,
      });
    }
  });

  // --- Mã 27: Ngày thanh toán ---
  if (!laRong(xml1.NGAY_TTOAN) && !laNgay12HopLe(xml1.NGAY_TTOAN)) {
    push(out, {
      maGdh: 27,
      phienBan,
      phanHe: 'XML1',
      index: -1,
      truong: 'NGAY_TTOAN',
      mucDo: 'Critical',
      noiDung:
        'Ngày thanh toán phải đủ 12 chữ số và hợp lệ (GDH 27).',
    });
  }

  // --- Mã 25 / 26 ---
  const kq = String(xml1.KET_QUA_DTRI ?? '').trim();
  if (!laRong(kq)) {
    const n = Number(kq);
    if (!Number.isInteger(n) || n < 1 || n > 5) {
      push(out, {
        maGdh: 25,
        phienBan,
        phanHe: 'XML1',
        index: -1,
        truong: 'KET_QUA_DTRI',
        mucDo: 'Critical',
        noiDung: 'Kết quả điều trị phải thuộc 1–5 (GDH 25).',
      });
    }
  }
  const loaiRv = String(xml1.MA_LOAI_RV ?? '').trim();
  if (!laRong(loaiRv)) {
    const n = Number(loaiRv);
    if (!Number.isInteger(n) || n < 1 || n > 4) {
      push(out, {
        maGdh: 26,
        phienBan,
        phanHe: 'XML1',
        index: -1,
        truong: 'MA_LOAI_RV',
        mucDo: 'Critical',
        noiDung: 'Tình trạng ra viện phải thuộc 1–4 (GDH 26).',
      });
    }
  }

  // --- Mã 35 / 36: Năm / tháng quyết toán ---
  const namQt = toNum(xml1.NAM_QT);
  if (!Number.isNaN(namQt)) {
    const y = new Date().getFullYear();
    if (namQt > y) {
      push(out, {
        maGdh: 35,
        phienBan,
        phanHe: 'XML1',
        index: -1,
        truong: 'NAM_QT',
        mucDo: 'Critical',
        noiDung: `Năm quyết toán (${namQt}) không được lớn hơn năm hiện tại (${y}) (GDH 35).`,
      });
    }
  }
  const thangQt = toNum(xml1.THANG_QT);
  if (!Number.isNaN(thangQt) && (thangQt < 1 || thangQt > 12)) {
    push(out, {
      maGdh: 36,
      phienBan,
      phanHe: 'XML1',
      index: -1,
      truong: 'THANG_QT',
      mucDo: 'Critical',
      noiDung: 'Tháng quyết toán phải từ 1 đến 12 (GDH 36).',
    });
  }

  // --- Mã 37: MA_LOAI_KCB (1–3 cổ điển; thêm 4–5 theo nghiệp vụ QĐ mới / mã 104–106) ---
  if (!laRong(xml1.MA_LOAI_KCB)) {
    const mlk = chuanHoaSoMa(xml1.MA_LOAI_KCB);
    const n = parseInt(mlk, 10);
    if (!Number.isFinite(n) || n < 1 || n > 5) {
      push(out, {
        maGdh: 37,
        phienBan,
        phanHe: 'XML1',
        index: -1,
        truong: 'MA_LOAI_KCB',
        mucDo: 'Critical',
        noiDung:
          'Mã loại KCB phải từ 1 đến 5 (1–3 theo GDH 37 gốc; 4–5 bổ sung nghiệp vụ mới) (GDH 37).',
      });
    }
  }

  // --- Mã 38: MA_KHUVUC ---
  const kh = String(xml1.MA_KHUVUC ?? '').trim().toUpperCase();
  if (!laRong(kh) && !new Set(['K1', 'K2', 'K3']).has(kh)) {
    push(out, {
      maGdh: 38,
      phienBan,
      phanHe: 'XML1',
      index: -1,
      truong: 'MA_KHUVUC',
      mucDo: 'Critical',
      noiDung: 'Mã khu vực phải là K1, K2 hoặc K3 (GDH 38).',
    });
  }

  // --- Mã 22: Mã tai nạn 0–8 ---
  const tn = String(xml1.MA_TAI_NAN ?? '').trim();
  if (!laRong(tn)) {
    const n = Number(tn);
    if (!Number.isInteger(n) || n < 0 || n > 8) {
      push(out, {
        maGdh: 22,
        phienBan,
        phanHe: 'XML1',
        index: -1,
        truong: 'MA_TAI_NAN',
        mucDo: 'Critical',
        noiDung: 'Mã tai nạn phải từ 0 đến 8 (GDH 22).',
      });
    }
  }

  // --- Mã 103 (nghiệp vụ mới): Năm ra viện khác năm hiện tại ---
  const ngayRaRaw = xml1.NGAY_RA;
  if (!laRong(ngayRaRaw)) {
    const digits = String(ngayRaRaw).replace(/\D/g, '');
    const yRa = digits.length >= 4 ? parseInt(digits.slice(0, 4), 10) : NaN;
    const yNow = new Date().getFullYear();
    if (Number.isFinite(yRa) && yRa !== yNow) {
      push(out, {
        maGdh: 103,
        phienBan,
        phanHe: 'XML1',
        index: -1,
        truong: 'NGAY_RA',
        mucDo: 'Critical',
        noiDung: `Đề nghị thanh toán khác năm tài chính hiện tại (năm ra ${yRa}, hiện ${yNow}) — GDH 103.`,
      });
    }
  }

  // --- Mã 11: Chi phí đề nghị BHYT / mức hưởng ---
  const tbhtt = toNum(xml1.T_BHTT);
  const muc = toNum(xml1.MUC_HUONG ?? xml1.MUC_HUONG_THE);
  if (
    (laRong(xml1.T_BHTT) || Math.abs(tbhtt) < 1e-9) &&
    layDs(hoSo, 'XML3').length + layDs(hoSo, 'XML2').length > 0
  ) {
    push(out, {
      maGdh: 11,
      phienBan,
      phanHe: 'XML1',
      index: -1,
      truong: 'T_BHTT',
      mucDo: 'Critical',
      noiDung:
        'Hồ sơ có chi tiết nhưng tiền đề nghị BHYT (T_BHTT) trống hoặc = 0 (GDH 11).',
    });
  }
  if (
    !laRong(xml1.MUC_HUONG ?? xml1.MUC_HUONG_THE) &&
    !Number.isNaN(muc) &&
    muc <= 0
  ) {
    push(out, {
      maGdh: 11,
      phienBan,
      phanHe: 'XML1',
      index: -1,
      truong: 'MUC_HUONG',
      mucDo: 'Critical',
      noiDung: 'Mức hưởng đề nghị không hợp lệ hoặc = 0 (GDH 11).',
    });
  }

  // --- Mã 20 (4210): Đồng bộ số phần mã thẻ khác / ĐKBD / GT --- 
  const splitOk = (s) =>
    String(s ?? '')
      .split(';')
      .map((x) => x.trim())
      .filter(Boolean);
  const km = splitOk(xml1.MA_THE_KHAC);
  const kd = splitOk(xml1.MA_DKBD_KHAC);
  const gtTu = splitOk(xml1.GT_THE_TU_KHAC);
  const gtDen = splitOk(xml1.GT_THE_DEN_KHAC);
  const groups = [km.length, kd.length, gtTu.length, gtDen.length].filter((n) => n > 0);
  const maxG = groups.length ? Math.max(...groups) : 0;
  if (maxG > 0) {
    const lens = [km.length, kd.length, gtTu.length, gtDen.length];
    const anyEmpty =
      lens.some((n) => n === 0) && lens.some((n) => n > 0);
    if (anyEmpty) {
      push(out, {
        maGdh: 20,
        phienBan,
        phanHe: 'XML1',
        index: -1,
        truong: 'MA_THE_KHAC',
        mucDo: 'Critical',
        noiDung:
          'Một trong các trường MA_THE_KHAC / MA_DKBD_KHAC / GT_THE_TU_KHAC / GT_THE_DEN_KHAC rỗng trong khi trường khác có giá trị (GDH 20).',
      });
    } else if (km.length && new Set([km.length, kd.length, gtTu.length, gtDen.length]).size > 1) {
      push(out, {
        maGdh: 20,
        phienBan,
        phanHe: 'XML1',
        index: -1,
        truong: 'MA_THE_KHAC',
        mucDo: 'Critical',
        noiDung:
          'Số phần tử sau khi tách bằng «;» không khớp giữa mã thẻ khác, ĐKBD khác, giá trị thẻ từ/đến (GDH 20).',
      });
    }
  }

  // --- Mã 17 (tt): MA_THE_KHAC — phân tách «;» và đủ 15 ký tự từng phần ---
  const rawTheKhac = String(xml1.MA_THE_KHAC ?? '').trim();
  if (rawTheKhac && !rawTheKhac.includes(';') && rawTheKhac.replace(/\s/g, '').length > 15) {
    push(out, {
      maGdh: 17,
      phienBan,
      phanHe: 'XML1',
      index: -1,
      truong: 'MA_THE_KHAC',
      mucDo: 'Critical',
      noiDung:
        'Nhiều mã thẻ khác phải cách nhau bằng dấu «;» (GDH 17).',
    });
  }
  splitOk(xml1.MA_THE_KHAC).forEach((token, ti) => {
    if (token.length !== 15) {
      push(out, {
        maGdh: 17,
        phienBan,
        phanHe: 'XML1',
        index: -1,
        truong: 'MA_THE_KHAC',
        mucDo: 'Critical',
        noiDung: `Phần mã thẻ khác thứ ${ti + 1} không đủ 15 ký tự (GDH 17).`,
      });
    }
  });

  // --- Mã 18 / 19: GT_THE_TU_KHAC / GT_THE_DEN_KHAC — «;» và từng ngày 8 số hợp lệ ---
  const checkGtKhac = (rawField, maErr, tenTruong) => {
    const raw = String(rawField ?? '').trim();
    if (!raw) return;
    if (!raw.includes(';') && raw.replace(/\D/g, '').length > 8) {
      push(out, {
        maGdh: maErr,
        phienBan,
        phanHe: 'XML1',
        index: -1,
        truong: tenTruong,
        mucDo: 'Critical',
        noiDung:
          maErr === 18
            ? 'Nhiều giá trị GT_THE_TU_KHAC phải cách nhau bằng «;» (GDH 18).'
            : 'Nhiều giá trị GT_THE_DEN_KHAC phải cách nhau bằng «;» (GDH 19).',
      });
    }
    raw.split(';').forEach((piece, ti) => {
      const p = piece.trim();
      if (!p) return;
      if (!/^\d{8}$/.test(p) || !laNgay8HopLe(p)) {
        push(out, {
          maGdh: maErr,
          phienBan,
          phanHe: 'XML1',
          index: -1,
          truong: tenTruong,
          mucDo: 'Critical',
          noiDung: `Giá trị thẻ (${tenTruong}) phần ${ti + 1} không đủ 8 số hoặc không phải ngày lịch (GDH ${maErr}).`,
        });
      }
    });
  };
  checkGtKhac(xml1.GT_THE_TU_KHAC, 18, 'GT_THE_TU_KHAC');
  checkGtKhac(xml1.GT_THE_DEN_KHAC, 19, 'GT_THE_DEN_KHAC');

  // --- Mã 21: Ngày miễn cùng chi trả (NGAY_MIEN_CCT) ---
  if (!laRong(xml1.NGAY_MIEN_CCT) && !laNgay8HopLe(xml1.NGAY_MIEN_CCT)) {
    push(out, {
      maGdh: 21,
      phienBan,
      phanHe: 'XML1',
      index: -1,
      truong: 'NGAY_MIEN_CCT',
      mucDo: 'Critical',
      noiDung: 'Ngày miễn cùng chi trả phải đủ 8 chữ số và hợp lệ (GDH 21).',
    });
  }

  // --- Mã 14: Stent N06.02.020 — SL > 1 (trừ thẻ CC/TE/QN/CA/CY; trước 01/01/2017) ---
  const ngayRaDigits = String(xml1.NGAY_RA ?? '').replace(/\D/g, '');
  const yRaStent =
    ngayRaDigits.length >= 4 ? parseInt(ngayRaDigits.slice(0, 4), 10) : NaN;
  const truoc2017 = Number.isFinite(yRaStent) && yRaStent < 2017;
  const theMienStent = /^(CC|TE|QN|CA|CY)/.test(maThe);
  if (!truoc2017 && !theMienStent) {
    xml3.forEach((row, idx) => {
      const maVt = String(row.MA_DICH_VU ?? row.MA_VAT_TU ?? row.MA_DV ?? '').trim();
      const slSt = toNum(row.SO_LUONG);
      if (maVt.includes(STENT_MA) && !Number.isNaN(slSt) && slSt > 1) {
        push(out, {
          maGdh: 14,
          phienBan,
          phanHe: 'XML3',
          index: idx,
          truong: 'MA_DICH_VU',
          mucDo: 'Critical',
          noiDung: `VTYT Stent (${STENT_MA}) không được SL > 1 (GDH 14, TT04/2017).`,
        });
      }
    });
  }

  // --- Tổng tiền & chi tiết (9324 mã 3, 4; 4210 mã 34, 47) ---
  let sumThanhBh2 = 0;
  if (dung9324Bh) {
    xml2.forEach((row, idx) => {
      const sl = toNum(row.SO_LUONG);
      const dg = toNum(row.DON_GIA ?? row.DON_GIA_BH);
      const ty = layTyLeTtPhanTram(row);
      const ttBh = toNum(row.THANH_TIEN_BH);
      if (Number.isNaN(ttBh) || [sl, dg].some((x) => Number.isNaN(x)) || ttBh < 0) return;
      const kyVong = sl * dg * (ty / 100);
      if (Math.abs(ttBh - kyVong) > 2) {
        push(out, {
          maGdh: 3,
          phienBan: '9324',
          phanHe: 'XML2',
          index: idx,
          truong: 'THANH_TIEN_BH',
          mucDo: 'Critical',
          noiDung: `THANH_TIEN_BH không khớp SL×Đơn giá×TYLE/100 (sai > 2đ) — GDH 9324 mã 3.`,
        });
      }
      sumThanhBh2 += ttBh;
    });
  }

  let sumThanhBh3 = 0;
  if (dung9324Bh) {
    xml3.forEach((row, idx) => {
      const sl = toNum(row.SO_LUONG);
      const dg = toNum(row.DON_GIA_BH ?? row.DON_GIA_BV ?? row.DON_GIA);
      const ty = layTyLeTtPhanTram(row);
      const ttBh = toNum(row.THANH_TIEN_BH);
      if (Number.isNaN(ttBh) || [sl, dg].some((x) => Number.isNaN(x)) || ttBh < 0) return;
      const kyVong = sl * dg * (ty / 100);
      if (Math.abs(ttBh - kyVong) > 2) {
        push(out, {
          maGdh: 3,
          phienBan: '9324',
          phanHe: 'XML3',
          index: idx,
          truong: 'THANH_TIEN_BH',
          mucDo: 'Critical',
          noiDung: `THANH_TIEN_BH không khớp SL×Đơn giá×TYLE/100 (sai > 2đ) — GDH 9324 mã 3.`,
        });
      }
      sumThanhBh3 += ttBh;
    });
  }

  // --- Mã 47 (4210): XML2 THANH_TIEN (BV) = SL × Đơn giá ---
  if (phienBan === '4210') {
    xml2.forEach((row, idx) => {
      const sl = toNum(row.SO_LUONG);
      const dg = toNum(row.DON_GIA ?? row.DON_GIA_BV ?? row.DON_GIA_BH);
      const ttBv = layThanhTienBvDong(row);
      if ([sl, dg, ttBv].some((x) => Number.isNaN(x)) || ttBv < 0) return;
      const ky = sl * dg;
      if (Math.abs(ttBv - ky) > 2) {
        push(out, {
          maGdh: 47,
          phienBan,
          phanHe: 'XML2',
          index: idx,
          truong: 'THANH_TIEN_BV',
          mucDo: 'Critical',
          noiDung: `THANH_TIEN (BV) không khớp SL × đơn giá (GDH 47).`,
        });
      }
    });
  }

  // --- Mã 39–42, 48 (rút gọn), 51 (XML2); 43–46, 52 (rút gọn), 56 (XML3) ---
  xml2.forEach((row, idx) => {
    const mn = chuanHoaSoMa(row.MA_NHOM);
    if (!laRong(row.MA_NHOM) && !hopLeXml2MaNhom.has(mn)) {
      push(out, {
        maGdh: 39,
        phienBan,
        phanHe: 'XML2',
        index: idx,
        truong: 'MA_NHOM',
        mucDo: 'Critical',
        noiDung: `MA_NHOM phải thuộc nhóm thuốc (4, 5, 6, 7) — GDH 39.`,
      });
    }
    const pv2 = String(row.PHAM_VI ?? '').trim();
    if (!laRong(row.PHAM_VI) && !hopLePhamVi.has(pv2)) {
      push(out, {
        maGdh: 40,
        phienBan,
        phanHe: 'XML2',
        index: idx,
        truong: 'PHAM_VI',
        mucDo: 'Critical',
        noiDung: `Phạm vi XML2 phải là 1 hoặc 2 — GDH 40.`,
      });
    }
    const ttBv41 = layThanhTienBvDong(row);
    const sumCp =
      toNum0(row.T_BNTT) +
      toNum0(row.T_BNCCT) +
      toNum0(row.T_BHTT) +
      toNum0(row.T_NGUONKHAC);
    if (
      !Number.isNaN(ttBv41) &&
      ttBv41 >= 0 &&
      !almostEq(ttBv41, sumCp, 2)
    ) {
      push(out, {
        maGdh: 41,
        phienBan,
        phanHe: 'XML2',
        index: idx,
        truong: 'THANH_TIEN_BV',
        mucDo: 'Critical',
        noiDung: `THANH_TIEN không khớp T_BNTT+T_BNCCT+T_BHTT+T_NGUONKHAC — GDH 41.`,
      });
    }
    const aids2 = toNum(row.T_NGOAIDS);
    const tbhtt2 = toNum(row.T_BHTT);
    if (
      !Number.isNaN(aids2) &&
      Math.abs(aids2) > 1e-9 &&
      !almostEq(aids2, tbhtt2, 2)
    ) {
      push(out, {
        maGdh: 42,
        phienBan,
        phanHe: 'XML2',
        index: idx,
        truong: 'T_NGOAIDS',
        mucDo: 'Critical',
        noiDung: `T_NGOAIDS khác 0 nhưng không khớp T_BHTT dòng — GDH 42.`,
      });
    }
    const nk2 = toNum(row.T_NGUONKHAC);
    if (!Number.isNaN(ttBv41) && ttBv41 >= 0 && !Number.isNaN(nk2)) {
      if (nk2 < -1e-9 || nk2 > ttBv41 + 1e-9) {
        push(out, {
          maGdh: 51,
          phienBan,
          phanHe: 'XML2',
          index: idx,
          truong: 'T_NGUONKHAC',
          mucDo: 'Critical',
          noiDung: `T_NGUONKHAC không nằm trong [0, THANH_TIEN] — GDH 51.`,
        });
      }
    }
    const thanhBhRow = toNum(row.THANH_TIEN_BH);
    const mucRow2 = toNum(row.MUC_HUONG);
    const mucAp2 =
      !Number.isNaN(mucRow2) && mucRow2 > 0 ? mucRow2 : mucHuongXml1;
    const ty2 = layTyLeTtPhanTram(row);
    if (
      !Number.isNaN(thanhBhRow) &&
      !Number.isNaN(mucAp2) &&
      mucAp2 > 0 &&
      !Number.isNaN(tbhtt2)
    ) {
      const ky48 = thanhBhRow * (ty2 / 100) * (mucAp2 / 100);
      if (!almostEq(tbhtt2, ky48, 2)) {
        push(out, {
          maGdh: 48,
          phienBan,
          phanHe: 'XML2',
          index: idx,
          truong: 'T_BHTT',
          mucDo: 'Critical',
          noiDung: `T_BHTT dòng không khớp THANH_TIEN_BH×TYLE/100×MUC_HUONG/100 — GDH 48 (rút gọn đúng tuyến).`,
        });
      }
    }
  });

  xml3.forEach((row, idx) => {
    const mn3 = chuanHoaSoMa(row.MA_NHOM);
    if (!laRong(row.MA_NHOM) && !hopLeXml3MaNhom.has(mn3)) {
      push(out, {
        maGdh: 43,
        phienBan,
        phanHe: 'XML3',
        index: idx,
        truong: 'MA_NHOM',
        mucDo: 'Critical',
        noiDung: `MA_NHOM XML3 không hợp lệ — GDH 43.`,
      });
    }
    const pv3 = String(row.PHAM_VI ?? '').trim();
    if (!laRong(row.PHAM_VI) && !hopLePhamVi.has(pv3)) {
      push(out, {
        maGdh: 44,
        phienBan,
        phanHe: 'XML3',
        index: idx,
        truong: 'PHAM_VI',
        mucDo: 'Critical',
        noiDung: `Phạm vi XML3 phải là 1 hoặc 2 — GDH 44.`,
      });
    }
    const ttBv45 = layThanhTienBvDong(row);
    const sumCp3 =
      toNum0(row.T_BNTT) +
      toNum0(row.T_BNCCT) +
      toNum0(row.T_BHTT) +
      toNum0(row.T_NGUONKHAC);
    if (
      !Number.isNaN(ttBv45) &&
      ttBv45 >= 0 &&
      !almostEq(ttBv45, sumCp3, 2)
    ) {
      push(out, {
        maGdh: 45,
        phienBan,
        phanHe: 'XML3',
        index: idx,
        truong: 'THANH_TIEN_BV',
        mucDo: 'Critical',
        noiDung: `THANH_TIEN không khớp tổng các thành phần chi trả dòng — GDH 45.`,
      });
    }
    const aids3 = toNum(row.T_NGOAIDS);
    const tbhtt3r = toNum(row.T_BHTT);
    if (
      !Number.isNaN(aids3) &&
      Math.abs(aids3) > 1e-9 &&
      !almostEq(aids3, tbhtt3r, 2)
    ) {
      push(out, {
        maGdh: 46,
        phienBan,
        phanHe: 'XML3',
        index: idx,
        truong: 'T_NGOAIDS',
        mucDo: 'Critical',
        noiDung: `T_NGOAIDS khác 0 nhưng không khớp T_BHTT dòng — GDH 46.`,
      });
    }
    const nk3 = toNum(row.T_NGUONKHAC);
    if (!Number.isNaN(ttBv45) && ttBv45 >= 0 && !Number.isNaN(nk3)) {
      if (nk3 < -1e-9 || nk3 > ttBv45 + 1e-9) {
        push(out, {
          maGdh: 56,
          phienBan,
          phanHe: 'XML3',
          index: idx,
          truong: 'T_NGUONKHAC',
          mucDo: 'Critical',
          noiDung: `T_NGUONKHAC không nằm trong [0, THANH_TIEN] — GDH 56.`,
        });
      }
    }
    const sl52 = toNum(row.SO_LUONG);
    const dg52Bv = toNum(row.DON_GIA_BV ?? row.DON_GIA ?? row.DON_GIA_BH);
    const ty52 = layTyLeTtPhanTram(row);
    const goiVt = String(row.GOI_VTYT ?? '').trim();
    if (laRong(goiVt) && !Number.isNaN(sl52) && !Number.isNaN(dg52Bv) && !Number.isNaN(ttBv45)) {
      const nhom52 = chuanHoaSoMa(row.MA_NHOM);
      const dacBiet52 =
        nhom52 === '13' ||
        nhom52 === '15' ||
        (nhom52 === '8' && (ty52 === 50 || ty52 === 80));
      const ky52 = dacBiet52 ? sl52 * dg52Bv * (ty52 / 100) : sl52 * dg52Bv;
      if (Math.abs(ttBv45 - ky52) > 2) {
        push(out, {
          maGdh: 52,
          phienBan,
          phanHe: 'XML3',
          index: idx,
          truong: 'THANH_TIEN_BV',
          mucDo: 'Critical',
          noiDung: `THANH_TIEN (BV) không khớp công thức SL×ĐG (×TYLE khi nhóm 13/15 hoặc nhóm 8 & TYLE 50/80) — GDH 52 (rút gọn, trừ VTYT gói).`,
        });
      }
    }
  });

  // --- Mã 102: VTYT gói (10/11) phải có DVKT cùng MA_DICH_VU ở dòng không gói (từ 01/08/2021) ---
  const d102 = String(xml1.NGAY_VAO ?? '').replace(/\D/g, '');
  const dt102 =
    d102.length >= 8
      ? new Date(
          parseInt(d102.slice(0, 4), 10),
          parseInt(d102.slice(4, 6), 10) - 1,
          parseInt(d102.slice(6, 8), 10),
        )
      : null;
  const sau20210801 = dt102 && !Number.isNaN(dt102.getTime()) && dt102 >= new Date(2021, 7, 1);
  if (sau20210801) {
    xml3.forEach((row, idx) => {
      const nhm = chuanHoaSoMa(row.MA_NHOM);
      if (nhm !== '10' && nhm !== '11') return;
      const mdv = String(row.MA_DICH_VU ?? '').trim();
      if (!mdv) return;
      const coDvkt =
        xml3.findIndex(
          (x, j) =>
            j !== idx &&
            chuanHoaSoMa(x.MA_NHOM) !== '10' &&
            chuanHoaSoMa(x.MA_NHOM) !== '11' &&
            String(x.MA_DICH_VU ?? '').trim() === mdv,
        ) >= 0;
      if (!coDvkt) {
        push(out, {
          maGdh: 102,
          phienBan,
          phanHe: 'XML3',
          index: idx,
          truong: 'MA_DICH_VU',
          mucDo: 'Critical',
          noiDung: `VTYT nhóm 10/11 (${mdv}) không có DVKT cùng mã trên dòng không gói — GDH 102.`,
        });
      }
    });
  }

  const tongBhHeader = toNum(xml1.T_TONGCHI_BH);
  if (
    dung9324Bh &&
    xml2.length + xml3.length > 0 &&
    !Number.isNaN(tongBhHeader) &&
    !almostEq(tongBhHeader, sumThanhBh2 + sumThanhBh3, 2)
  ) {
    push(out, {
      maGdh: 4,
      phienBan: '9324',
      phanHe: 'XML1',
      index: -1,
      truong: 'T_TONGCHI_BH',
      mucDo: 'Critical',
      noiDung: `T_TONGCHI_BH (${tongBhHeader}) khác tổng THANH_TIEN chi tiết XML2+XML3 (${sumThanhBh2 + sumThanhBh3}) — GDH 9324 mã 4.`,
    });
  }

  const tBv = toNum(xml1.T_TONGCHI_BV);
  const sumBv =
    xml2.reduce((s, r) => s + (toNum(r.THANH_TIEN_BV) || 0), 0) +
    xml3.reduce((s, r) => s + (toNum(r.THANH_TIEN_BV) || 0), 0);
  if (
    xml2.length + xml3.length > 0 &&
    !Number.isNaN(tBv) &&
    !almostEq(tBv, sumBv, 2)
  ) {
    push(out, {
      maGdh: 4,
      phienBan: '9324',
      phanHe: 'XML1',
      index: -1,
      truong: 'T_TONGCHI_BV',
      mucDo: 'Warning',
      noiDung: `T_TONGCHI_BV không khớp tổng thành tiền BV chi tiết (lệch >2đ) — kiểm tra theo GDH mã 4 (thành tiền BV).`,
    });
  }

  const bntt = toNum(xml1.T_BNTT);
  const bhtt = toNum(xml1.T_BHTT);
  const bncct = toNum(xml1.T_BNCCT);
  const ngkh = toNum(xml1.T_NGUONKHAC);
  const tongBvFull = bntt + bhtt + bncct + ngkh;
  if (
    !Number.isNaN(tBv) &&
    !almostEq(tBv, tongBvFull, 2) &&
    xml2.length + xml3.length > 0
  ) {
    push(out, {
      maGdh: 34,
      phienBan,
      phanHe: 'XML1',
      index: -1,
      truong: 'T_TONGCHI_BV',
      mucDo: 'Critical',
      noiDung:
        'T_TONGCHI_BV không khớp T_BNTT + T_BNCCT + T_BHTT + T_NGUONKHAC (GDH 34 theo văn bản cổng).',
    });
  }

  // GDH 9324 mã 5 — T_TONGCHI_BH khớp T_BNCCT + T_BHTT + T_NGUONKHAC
  if (
    dung9324Bh &&
    !Number.isNaN(tongBhHeader) &&
    !Number.isNaN(bncct) &&
    !Number.isNaN(bhtt) &&
    !Number.isNaN(ngkh) &&
    !almostEq(tongBhHeader, bncct + bhtt + ngkh, 2)
  ) {
    push(out, {
      maGdh: 5,
      phienBan: '9324',
      phanHe: 'XML1',
      index: -1,
      truong: 'T_TONGCHI_BH',
      mucDo: 'Critical',
      noiDung:
        'T_TONGCHI_BH không khớp T_BNCCT + T_BHTT + T_NGUONKHAC (±1–2đ) — GDH 9324 mã 5.',
    });
  }

  let sumTbhtt2 = 0;
  xml2.forEach((r) => {
    const v = toNum(r.T_BHTT);
    if (!Number.isNaN(v)) sumTbhtt2 += v;
  });
  let sumTbhtt3 = 0;
  xml3.forEach((r) => {
    const v = toNum(r.T_BHTT);
    if (!Number.isNaN(v)) sumTbhtt3 += v;
  });
  if (
    xml2.length + xml3.length > 0 &&
    !Number.isNaN(bhtt) &&
    !almostEq(bhtt, sumTbhtt2 + sumTbhtt3, 2)
  ) {
    push(out, {
      maGdh: 31,
      phienBan,
      phanHe: 'XML1',
      index: -1,
      truong: 'T_BHTT',
      mucDo: 'Critical',
      noiDung:
        'T_BHTT XML1 khác tổng T_BHTT các dòng XML2 + XML3 (GDH 4210 mã 31).',
    });
  }

  return out;
};
