/**
 * Hợp nhất quy tắc trùng lặp trên cùng một đối tượng nghiệp vụ (cùng XML2/XML3 mục tiêu
 * + cùng tiền tố loại trong tên, ví dụ PTTT: "Chỉ định -", "Chống chỉ định -", …).
 * Giữ một bản ghi có điều kiện/cảnh báo chi tiết hơn (COUNT(XML…), không placeholder).
 */

const layDoiTuongTuDieuKien = (dieuKien) => {
  const s = String(dieuKien || '');
  let m = s.match(/XML3\.MA_DICH_VU\s*==\s*'([^']+)'/i);
  if (m) return `DV3|${m[1].trim()}`;
  m = s.match(/XML3\.MA_DICH_VU\s*==\s*"([^"]+)"/i);
  if (m) return `DV3|${m[1].trim()}`;
  m = s.match(/\bMA_DICH_VU\s*==\s*'([^']+)'/i);
  if (m) return `DV|${m[1].trim()}`;
  m = s.match(/XML2\.MA_THUOC\s*==\s*'([^']+)'/i);
  if (m) return `TH2|${m[1].trim()}`;
  m = s.match(/\bMA_THUOC\s*==\s*'([^']+)'/i);
  if (m) return `TH|${m[1].trim()}`;
  return '';
};

/** Hash ổn định cho điều kiện — cùng loại + cùng đối tượng chỉ gộp khi biểu thức giống hệt. */
const hashDieuKien = (dieuKien) => {
  const s = String(dieuKien || '').replace(/\s+/g, ' ').trim();
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h) ^ s.charCodeAt(i);
  return `h${(h >>> 0).toString(16)}`;
};

/** Tiền tố loại quy tắc (PTTT mẫu: "Chỉ định - …"); không có thì __GEN__. */
export const layTienToLoaiTenQuyTac = (ten) => {
  const t = String(ten || '').trim();
  const i = t.indexOf(' - ');
  if (i > 0) return t.slice(0, i).trim().toUpperCase();
  return '__GEN__';
};

const diemUuTienDong = (row) => {
  const dk = String(row.DIEU_KIEN ?? row.dieu_kien ?? row.nguyen_tac_lam_viec ?? '').trim();
  const cb = String(row.CANH_BAO ?? row.canh_bao ?? '').trim();
  const gc = String(row.GHI_CHU ?? row.ghi_chu ?? '').trim();
  const gr = String(row.ghi_chu_rui_ro ?? '').trim();
  let diem = dk.length + cb.length * 2 + gc.length * 2 + gr.length;
  if (/\bCOUNT\s*\(\s*XML/i.test(dk)) diem += 120;
  if (/\bCOUNT\s*\(\s*XML5/i.test(dk)) diem += 40;
  if (/COUNT_IF\s*\(/i.test(dk)) diem -= 40;
  if (/PLACEHOLDER|placeholder XML130|XML130:\s*engine bỏ qua/i.test(`${dk} ${gc} ${gr}`)) diem -= 200;
  if (/✅|Đã chuẩn hóa|chuan hoa/i.test(gc)) diem += 15;
  return diem;
};

/**
 * @param {string} nhomId — phan_nhom_id (Thư viện) hoặc tabId (ON/OFF)
 * @param {object} row — bản ghi quy tắc (snake hoặc HOA)
 */
export const taoKhoaTrungLapQuyTac = (nhomId, row) => {
  const nhom = String(nhomId || row.phan_nhom_id || row.PHAN_HE || '').trim();
  const dk = String(row.DIEU_KIEN ?? row.dieu_kien ?? row.nguyen_tac_lam_viec ?? '');
  const ten = String(row.TEN_QUY_TAC ?? row.ten_quy_tac ?? '');
  const maLuat = String(row.MA_LUAT ?? row.ma_luat ?? '').trim().toUpperCase();
  const obj = layDoiTuongTuDieuKien(dk);
  const loai = layTienToLoaiTenQuyTac(ten);
  if (obj && loai !== '__GEN__') return `SEM|${nhom}|${loai}|${obj}|${hashDieuKien(dk)}`;
  return `DEF|${nhom}|${maLuat || '__NOMA__'}`;
};

/**
 * Hợp nhất: mỗi khóa SEM|* hoặc DEF|* giữ một dòng có điểm cao nhất.
 * @template T
 * @param {T[]} rows
 * @param {(r: T) => string} layNhom
 * @returns {T[]}
 */
export const hopNhatQuyTacTrungTheoDoiTuong = (rows, layNhom) => {
  const list = Array.isArray(rows) ? rows : [];
  const best = new Map();
  for (const raw of list) {
    const nhom = layNhom(raw);
    const key = taoKhoaTrungLapQuyTac(nhom, raw);
    const d = diemUuTienDong(raw);
    const prev = best.get(key);
    if (!prev || d > prev.d || (d === prev.d && String(raw.MA_LUAT ?? raw.ma_luat ?? '').localeCompare(String(prev.raw.MA_LUAT ?? prev.raw.ma_luat ?? ''), 'vi', { sensitivity: 'base' }) > 0)) {
      best.set(key, { d, raw });
    }
  }
  return [...best.values()].map((x) => x.raw);
};
