/**
 * Tổng hợp quy tắc phân tầng kiểm tra cho màn Thư viện — đồng bộ với màn Quản lý ON/OFF:
 * — Cùng pipeline `tinhDuLieuTheoTabTuNguonGiongOnOff` (tronRuleKhongTrung + hopNhat theo tab,
 *   CDHA + chuyên đề + DVKT-OP + seed PTTT mục 11 + danh mục nội bộ).
 * — `layTatCaBanGhiQuyTacPhanLap(opts)`: sync, mặc định không đọc CDSS_DATA (chỉ bundle + map nếu truyền).
 * — `taiTatCaBanGhiQuyTacPhanLapDongBoKho()`: async — đọc CDSS_DATA_* + seed PTTT như màn ON/OFF → số liệu khớp.
 */
import { DANH_SACH_TAB_MAC_DINH } from './cau_hinh_tab_quy_tac_on_off';
import { tinhDuLieuTheoTabTuNguonGiongOnOff } from './gop_quy_tac_theo_tab_on_off.jsx';
import { taiVaHopNhatDuLieuTheoTabGiongManOnOff } from './tai_va_gop_quy_tac_theo_tab';
import {
  laDieuKienChuyenDeXml130Placeholder,
} from './luat_giam_dinh_chuyen_de_hardcoded';

export const LOAI_NGUON = Object.freeze({
  LUAT_CUNG: 'LUAT_CUNG',
  /** Dòng từ CDSS_DATA_* (đồng bộ màn ON/OFF). */
  DATASET: 'DATASET',
});

/** Thứ tự hiển thị nhóm; key = mã nội bộ PHAN_HE / engine */
export const NHOM_GIAM_DINH_META = Object.freeze([
  { id: 'LUAT_DU_LIEU', ten: 'Cấu trúc & dữ liệu XML (QĐ 3176)', thu_tu: 1 },
  { id: 'LUAT_HANH_CHINH', ten: 'Hành chính & thẻ BHYT (XML1)', thu_tu: 2 },
  { id: 'LUAT_CONG_KHAM', ten: 'Công khám & phí khám', thu_tu: 3 },
  { id: 'LUAT_THUOC', ten: 'Thuốc (XML2)', thu_tu: 4 },
  { id: 'LUAT_CDHA', ten: 'DVKT / CĐHA (XML3) — CDHA_* & DVKT-OP-* (bundle)', thu_tu: 5 },
  { id: 'LUAT_NHAN_SU', ten: 'Nhân sự hành nghề (XML3)', thu_tu: 6 },
  { id: 'LUAT_GIUONG', ten: 'Giường & nội trú (XML1–3)', thu_tu: 7 },
  { id: 'LUAT_PTTT', ten: 'PTTT & chuyên khoa', thu_tu: 8 },
  { id: 'LUAT_CHUYEN_TUYEN', ten: 'Nhập viện & chuyển tuyến', thu_tu: 9 },
  { id: 'LUAT_HOP_DONG', ten: 'Hợp đồng BHYT & tổng chi hồ sơ', thu_tu: 10 },
  { id: 'LUAT_MAU', ten: 'Máu & hóa dịch (XML nếu áp dụng)', thu_tu: 11 },
  { id: 'LUAT_GIAM_DINH_CHUYEN_DE', ten: 'Kiểm tra chuyên đề (CV 266, PL…)', thu_tu: 12 },
]);

const mapNhomTen = () => {
  const m = new Map();
  NHOM_GIAM_DINH_META.forEach((x) => m.set(x.id, x.ten));
  return m;
};
const MA_NHOM_SANG_TEN = mapNhomTen();

const ghiNhomTuPhanHe = (phanHe) => {
  const k = String(phanHe || '').trim() || 'LUAT_DU_LIEU';
  return MA_NHOM_SANG_TEN.get(k) || k;
};

const tinhTangPhanLapGon = (row) => {
  const ma = String(row.MA_LUAT || row.ma_luat || '').trim().toUpperCase();
  const ph = String(row.PHAN_HE || row.phan_he || '').trim().toUpperCase();
  if (/^FPG-/.test(ma) || /^STRUCT/.test(ma) || /^XML\d+-(REQ|MISSING)/.test(ma)) return 'L0';
  if (/^HC-|^HC_/.test(ma)) return 'L1';
  if (/^DVKT-OP-/.test(ma)) return 'L5';
  if (/^ICD-TT06-/.test(ma)) return 'L23';
  if (/^ICD-KEP-/.test(ma)) return 'L23';
  if (
    /^CLN-/.test(ma)
    || /^THUOC_/.test(ma)
    || /^CDHA_/.test(ma)
    || /^CHUYEN_DE/i.test(ma)
    || /^NS_/.test(ma)
    || /^GB_/.test(ma)
    || /^CK_/.test(ma)
    || /^HD_/.test(ma)
    || /^DVKT_/.test(ma)
    || /^DM-THUOC-|^DMBV-THUOC-|^DM-DVKT-|^DMBV-DVKT-|^DM-KHOA-/i.test(ma)
  ) {
    return 'L4';
  }
  if (ph === 'LUAT_HANH_CHINH' || (ph === 'LUAT_DU_LIEU' && /^XML[^_]/i.test(ma))) return 'L1';
  if (ph === 'LUAT_DU_LIEU' || /^(STRUCT|XML)/i.test(ma)) return 'L0';
  if (ph === 'LUAT_GIAM_DINH_CHUYEN_DE' || /Chuyen_de/i.test(ma)) return 'L4';
  return 'L23';
};

const ghepGhiChuRuiRo = (row, loaiNguon) => {
  const a = String(row.GHI_CHU_SUA || row.ghi_chu_sua || '').trim();
  const b = String(row.GHI_CHU || row.ghi_chu || '').trim();
  const c = String(row.NGUON_DU_LIEU || row.nguon_du_lieu || '').trim();
  const parts = [];
  if (a) parts.push(a);
  if (b) parts.push(b);
  if (c) parts.push(`Nguồn dữ liệu: ${c}`);
  const dk = row.DIEU_KIEN || row.dieu_kien;
  if (loaiNguon === LOAI_NGUON.LUAT_CUNG && typeof laDieuKienChuyenDeXml130Placeholder === 'function' && laDieuKienChuyenDeXml130Placeholder(dk)) {
    parts.push(
      'Điều kiện còn placeholder XML130: engine bỏ qua, không phát cảnh báo trên hồ sơ. Khi thay bằng biểu thức thật, cần rà từng mã (dương/âm giả).',
    );
  }
  if (loaiNguon === LOAI_NGUON.LUAT_CUNG) {
    const maDvktOp = String(row.MA_LUAT || row.ma_luat || '').trim().toUpperCase();
    if (/^DVKT-OP-/.test(maDvktOp)) {
      parts.push(
        'Kết quả phụ thuộc cấu hình: danh mục DVKT M05, thiết bị, phạm vi hành nghề, phê duyệt nội bộ tại cơ sở — khác cấu hình thì cảnh báo có thể thay đổi. Đổi ON/OFF tại màn quản lý quy tắc nội bộ (DVKT-OP-*) tương ứng.',
      );
    }
  }
  if (parts.length) return parts.join('\n\n');
  return 'Chưa có ghi chú bổ sung trong bundle. Cần đối chiếu hồ sơ thực tế và tài liệu quy phạm trước khi chốt thanh toán; có thể âm/dương giả nếu thiếu trường XML, sai mã, hoặc dữ liệu ngoài hồ sơ.';
};

const toRecordLuatCung = (row, nhomIdMacDinh) => {
  const ph = String(row.PHAN_HE || row.phan_he || nhomIdMacDinh || '').trim() || nhomIdMacDinh;
  const ma = String(row.MA_LUAT || row.ma_luat || '').trim();
  const kind = String(row._kind || row.LOAI_QUY_TAC || '').toUpperCase();
  const loaiNguon = kind === 'DATASET' ? LOAI_NGUON.DATASET : LOAI_NGUON.LUAT_CUNG;
  return {
    id: `${loaiNguon === LOAI_NGUON.DATASET ? 'DATA' : 'CUNG'}|${ph}|${ma || String(row.id || '').trim() || '?'}`,
    loai_nguon: loaiNguon,
    phan_nhom_id: ph,
    ten_nhom_hien_thi: ghiNhomTuPhanHe(ph),
    ma_luat: ma,
    ten_quy_tac: String(row.TEN_QUY_TAC || row.ten_quy_tac || ma).trim(),
    canh_bao: String(row.CANH_BAO || row.canh_bao || '').trim(),
    nguyen_tac_lam_viec: String(
      row.DIEU_KIEN || row.dieu_kien || row.DIEU_KIEN_TEXT || row.dieu_kien_text || '',
    ).trim() || '— (Không mô tả biểu thức; xử lý trong engine tương ứng.)',
    trang_thai: String(row.TRANG_THAI || row.trang_thai || 'ON').toUpperCase() === 'OFF' ? 'OFF' : 'ON',
    phan_tang: tinhTangPhanLapGon({ ...row, PHAN_HE: ph, MA_LUAT: ma }),
    ghi_chu_rui_ro: ghepGhiChuRuiRo(row, loaiNguon === LOAI_NGUON.DATASET ? null : LOAI_NGUON.LUAT_CUNG),
  };
};



const duLieuTheoTabSangBanGhiThuVien = (duLieuTheoTab) => {

  const out = [];

  for (const tab of DANH_SACH_TAB_MAC_DINH) {

    const rows = duLieuTheoTab[tab.id] || [];

    rows.forEach((row) => {

      const ph = String(row.PHAN_HE || row.phan_he || tab.id).trim() || tab.id;

      out.push(toRecordLuatCung({ ...row, PHAN_HE: ph }, ph));

    });

  }

  return out;

};



/**

 * @param {object} [opts]

 * @param {Record<string, object[]>} [opts.dataTheoTab] — CDSS_DATA đã tách theo tab (raw row), optional

 * @param {Record<string, string>} [opts.mapTrangThaiQuyTacNoiBo]

 * @param {Record<string, object>} [opts.mapGhiDeNoiDungQuyTacNoiBo]

 */

export const layTatCaBanGhiQuyTacPhanLap = (opts = {}) => {

  const {

    dataTheoTab = {},

    mapTrangThaiQuyTacNoiBo = {},

    mapGhiDeNoiDungQuyTacNoiBo = {},

  } = opts;

  const theoTab = tinhDuLieuTheoTabTuNguonGiongOnOff({

    dataTheoTab,

    mapTrangThaiNoiBo: mapTrangThaiQuyTacNoiBo,

    mapGhiDeNoiBo: mapGhiDeNoiDungQuyTacNoiBo,

  });

  return sapXepNhomRoiMa(duLieuTheoTabSangBanGhiThuVien(theoTab));

};



/** Giống dữ liệu đã gộp trên màn ON/OFF (gồm import CDSS_DATA). */

export const taiTatCaBanGhiQuyTacPhanLapDongBoKho = async () => {

  const { duLieuTheoTab } = await taiVaHopNhatDuLieuTheoTabGiongManOnOff();

  return sapXepNhomRoiMa(duLieuTheoTabSangBanGhiThuVien(duLieuTheoTab));

};



const chuanHoa = (s) =>

  String(s || '')

    .normalize('NFD')

    .replace(/[\u0300-\u036f]/g, '')

    .replace(/đ/g, 'd')

    .replace(/Đ/g, 'D')

    .toLowerCase()

    .trim();



export const locBanGhiQuyTac = (tatCa, { tuKhoa, loaiNguonLoc, nhomIdLoc }) => {

  let rows = Array.isArray(tatCa) ? tatCa : [];

  if (loaiNguonLoc === LOAI_NGUON.LUAT_CUNG) rows = rows.filter((r) => r.loai_nguon === LOAI_NGUON.LUAT_CUNG);
  if (loaiNguonLoc === LOAI_NGUON.DATASET) rows = rows.filter((r) => r.loai_nguon === LOAI_NGUON.DATASET);

  if (nhomIdLoc) rows = rows.filter((r) => r.phan_nhom_id === nhomIdLoc);

  const q = chuanHoa(tuKhoa);

  if (q) {

    rows = rows.filter((r) => {

      const s = chuanHoa(

        [r.ma_luat, r.ten_quy_tac, r.canh_bao, r.nguyen_tac_lam_viec, r.ghi_chu_rui_ro, r.phan_tang].join(' '),

      );

      return s.includes(q) || q.split(/\s+/).filter(Boolean).every((t) => s.includes(t));

    });

  }

  return rows;

};



export const sapXepNhomRoiMa = (rows) => {

  const thuTu = new Map(NHOM_GIAM_DINH_META.map((x) => [x.id, x.thu_tu]));

  return [...rows].sort((a, b) => {

    const oa = thuTu.get(a.phan_nhom_id) ?? 99;

    const ob = thuTu.get(b.phan_nhom_id) ?? 99;

    if (oa !== ob) return oa - ob;

    return String(a.ma_luat || '').localeCompare(String(b.ma_luat || ''), 'vi', { sensitivity: 'base' });

  });

};



export { chuanHoa as chuanHoaTuKhoaTim };

