/**
 * PHÂN HỆ: DASHBOARD TỔNG QUAN & QUẢN TRỊ KIỂM TRA (MASTER CONTROL)
 * Nâng cấp (Bản 8.9 - Chống Crash QuotaExceededError): 
 * 1. FIX BIG DATA: Đã kết nối thành công với Module KHO_LUU_TRU để dùng chung Chunking.
 * 2. GIẢI QUYẾT: Dùng chung luồng lưu trữ chuẩn từ tien_ich_kho.
 * 3. UI HEADER: Chữ to gấp 3 lần, canh giữa toàn màn hình, logo kề bên.
 * 4. LOGIC: Tích hợp công cụ xuất thẳng XML ra Excel.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Easing,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as XLSX from 'xlsx';
import ChanTrangUngDung from '../thanh_phan/chan_trang_ung_dung';
import KhuVucCuonCoThanhCuon from '../thanh_phan/khu_vuc_cuon_co_thanh_cuon';
import KhungTroLyTriThucChat from '../thanh_phan/khung_tro_ly_tri_thuc_chat';
import ThanhDieuKhienPanel, { stylePanelGhim } from '../thanh_phan/thanh_dieu_khien_panel';
import { BoChonChuDe, CD } from '../tien_ich/chu_de_giao_dien';
import {
  CHE_DO_GIAM_DINH,
  docCheDoGiamDinh,
  ketNoiPythonServiceLucKhoiDong,
  laPythonServiceBatTrongCauHinh,
  layTrangThaiPythonGanNhat,
} from '../tien_ich/hybrid_python_helper';
import {
  chayGiamDinhNhieuHoSoHybridDongBo,
  chuanHoaMaLkChoHybrid,
} from '../tien_ich/giam_dinh_hybrid_dong_bo';
import { docPhienDangNhap, xoaPhienDangNhap } from '../tien_ich/phien_dang_nhap';
import { dieuHuongMoTabMoi } from '../tien_ich/dieu_huong_mo_tab_moi';
import { DANH_MUC_QUY_TAC_NOI_BO, khopMaLuatTheoMau, suyRaThongTinQuanTriQuyTac } from '../tien_ich/quy_tac_on_off_noi_bo';
import { locModuleTheoRBAC, taiRBAC } from '../tien_ich/rbac_engine';
import {
  DANH_SACH_NHOM_CAP_LOAI_KCB_LOC,
  DANH_SACH_NHOM_VI_PHAM_LOC,
  layDongXmlLienQuanLoi,
  layNhomCapLoaiKcb802,
  NHOM_VI_PHAM_TAT_CA,
  locDanhSachLoiChiTiet,
  phangHoaDanhSachLoiChiTiet,
  taoMetaXuatBacSiTuChiTietLoi,
  tongHopQuyTacTuDanhSachChiTiet,
} from '../tien_ich/thong_ke_loi_dung_chung';
import {
  BO_LOC_ICD10_VI_PHAM,
  BO_LOC_ICD10_VI_PHAM_TAT_CA,
  demLoiTheoBoLocIcd10,
  loiKhopBoLocIcd10ViPham,
  PHIEN_BAN_ICD10_TT06,
} from '../tien_ich/icd10_loc_vi_pham';
import { layMapHoTenNhanSuChoXuatBaoCao } from '../tien_ich/dinh_dang_cchn_bao_cao';

// [CẬP NHẬT LÕI]: Thống nhất dùng kho_du_lieu để đồng bộ với man_hinh_kho_luu_tru
import { gomTrungLapCanhBaoTheoMaLuatVaNoiDung, xoaCacheBoMayGiamDinh } from '../tien_ich/dong_co_giam_dinh';
import {
  layDanhSachMaLKTuKho,
  layTatCaHoSoTuKho,
  luuHoSoVaoKho,
  phanTichKhoangCachDieuTri,
  xoaToanBoKho,
} from '../tien_ich/kho_du_lieu';
import { chuanHoaGiaTriTheoTruong, xuatHoSoThanhXML130 } from '../tien_ich/xml_helper';
import NhapFileXML, {
  chuyenKetQuaFileSangMangHoSoKho,
  taiNguonPhuThuocNhapXml,
  xuLyMotFileXmlChoBanGiamDinh,
} from '../tien_ich/nhap_file_xml';
import { BREAKPOINTS, useLayoutMode } from '../tien_ich/diem_anh_man_hinh';
import {
  luuTuyChonPanelTongQuan,
  PANEL_TONG_QUAN,
  taiTuyChonPanelTongQuan,
  trangThaiPanelMacDinh,
} from '../tien_ich/tong_quan_panel_prefs';

const LOGO_PC = 'https://i.ibb.co/nNr9SQYr/logo-pc.png';

const chuanHoaTenSheetXlsx = (name) => {
  const s = String(name || 'Sheet')
    .replace(/[\\/*?:\[\]]/g, '_')
    .replace(/\s+/g, '_')
    .trim() || 'Sheet';
  return s.length > 31 ? s.slice(0, 31) : s;
};

const ghepGiaTriOExcelTuTruongDong = (v) => {
  if (v === null || v === undefined) return '';
  if (typeof v === 'object') {
    try {
      return JSON.stringify(v);
    } catch {
      return String(v);
    }
  }
  return v;
};

const phangDongXmlChoOExcel = (row) => {
  if (!row || typeof row !== 'object' || Array.isArray(row)) return {};
  const o = {};
  Object.keys(row).forEach((k) => {
    o[k] = ghepGiaTriOExcelTuTruongDong(row[k]);
  });
  return o;
};

const taoCacDongXuatXmlGocSangNhomTheoPhanHe = (danhSachChiTietLoc, timHoSo, mapHoTen = null) => {
  const theoPhanHe = new Map();
  (Array.isArray(danhSachChiTietLoc) ? danhSachChiTietLoc : []).forEach((detail, stt) => {
    const loi = detail.doi_tuong_goc || {};
    const hs = (typeof timHoSo === 'function' ? timHoSo(detail.ma_lk) : null) || {
      ma_lk: detail.ma_lk,
      ten_bn: detail.ten_bn,
      xml1: detail.ma_loai_kcb ? { MA_LOAI_KCB: detail.ma_loai_kcb, MA_KHOA: detail.ma_khoa } : {},
    };
    const { row, phanHeBang } = layDongXmlLienQuanLoi(loi, hs);
    const phan = String(phanHeBang || 'CHUA_XAC_DINH').toUpperCase() || 'CHUA_XAC_DINH';
    if (!theoPhanHe.has(phan)) theoPhanHe.set(phan, []);
    const nhom = theoPhanHe.get(phan);
    const canhBao = String(loi.canh_bao || loi.CANH_BAO || loi.message || '').trim();
    const maLuat = String(loi.ma_luat || loi.MA_LUAT || '').trim();
    const metaDau = {
      _XUAT_STT: stt + 1,
      _XUAT_MA_LK: String(detail.ma_lk || '').trim(),
      _XUAT_MA_LUAT: maLuat,
      _XUAT_CANH_BAO: canhBao,
      _XUAT_BANG_XML: phan,
      _XUAT_INDEX_DONG: loi.index,
      _XUAT_TRUONG_LOI: String(loi.truong_loi || '').trim(),
      ...taoMetaXuatBacSiTuChiTietLoi(detail, loi, hs, mapHoTen),
    };
    if (row && typeof row === 'object' && !Array.isArray(row) && Object.keys(row).length > 0) {
      nhom.push({ ...metaDau, ...phangDongXmlChoOExcel(row) });
    } else {
      nhom.push({
        ...metaDau,
        _XUAT_GHI_CHU: 'Không trích được dòng dữ liệu gốc trong bảng XML tương ứng (index / hồ sơ trên kho).',
      });
    }
  });
  return theoPhanHe;
};

const sapXepKhoaCotCacDongXuat = (rows) => {
  const s = new Set();
  (Array.isArray(rows) ? rows : []).forEach((r) => {
    if (r && typeof r === 'object' && !Array.isArray(r)) {
      Object.keys(r).forEach((k) => s.add(k));
    }
  });
  const all = Array.from(s);
  const p = (k) => (k.startsWith('_XUAT_') ? 0 : 1);
  return all.sort((a, b) => {
    if (p(a) !== p(b)) return p(a) - p(b);
    return a.localeCompare(b, 'vi');
  });
};

const taoWorksheetXlsxTuCacDongDongGoc = (rows) => {
  if (!rows || !rows.length) {
    return { ws: XLSX.utils.aoa_to_sheet([['(không có dòng)']]), keys: [] };
  }
  const keys = sapXepKhoaCotCacDongXuat(rows);
  const aoa = [keys, ...rows.map((r) => keys.map((k) => ghepGiaTriOExcelTuTruongDong(r?.[k])))];
  return { ws: XLSX.utils.aoa_to_sheet(aoa), keys };
};

const genTenSheetXlsxDuyNhat = (tienTo, daDung) => {
  let name = chuanHoaTenSheetXlsx(tienTo);
  const base = name;
  let w = 1;
  while (daDung.has(name)) {
    const suf = `(${w++})`;
    const cand = base + suf;
    name = cand.length > 31 ? base.slice(0, Math.max(1, 31 - suf.length)) + suf : cand;
  }
  daDung.add(name);
  return name;
};

const THU_TU_UU_TIEN_CANH_BAO = Object.freeze({
  XUAT_TOAN: 0,
  CAU_TRUC_XML: 1,
  CANH_BAO: 2,
  NHAC_NHO: 3,
});

const NHAN_UU_TIEN_CANH_BAO = Object.freeze({
  XUAT_TOAN: 'Xuất toán',
  CAU_TRUC_XML: 'Vi phạm cấu trúc XML',
  CANH_BAO: 'Cảnh báo',
  NHAC_NHO: 'Nhắc nhở',
});

const MAP_TAB_QUAN_TRI_THEO_XML = Object.freeze({
  XML1: 'LUAT_HANH_CHINH',
  XML2: 'LUAT_THUOC',
  XML3: 'LUAT_CDHA',
  XML4: 'LUAT_CDHA',
  XML5: 'LUAT_PTTT',
  XML6: 'LUAT_HOP_DONG',
});

const chuanHoaToken = (value) => String(value || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toUpperCase()
  .trim();

const escapeXmlBaoCaoViPham = (value) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

const layBangXmlTuCanhBao = (canhBao = {}) => {
  const match = String(canhBao?.phan_he || canhBao?.phan_loai || '').toUpperCase().match(/XML\d+/);
  return match ? match[0] : 'XML1';
};

const coMaLuatHopLe = (value) => {
  const ma = String(value || '').trim();
  return ma && ma !== 'N/A';
};

const laLoiCauTrucDuLieuXmlDashboard = (canhBao = {}) => {
  const dk = chuanHoaToken(canhBao?.dieu_kien);
  const maRaw = String(canhBao?.ma_luat || canhBao?.MA_LUAT || '').trim();
  const ma = chuanHoaToken(maRaw);
  const ten = chuanHoaToken([canhBao?.ten_quy_tac, canhBao?.TEN_QUY_TAC].filter(Boolean).join(' '));
  if (maRaw && /^STRUCT/i.test(maRaw)) return true;
  if (dk === 'STATIC' && ten.includes('CAU TRUC XML')) return true;
  if (dk === 'STATIC' && /^XML[0-9]+-/.test(ma)) return true;
  return false;
};

const suyRaLoaiCanhBaoDashboard = (canhBao = {}) => {
  const thongTinQuanTri = suyRaThongTinQuanTriQuyTac(canhBao);
  const noiDung = chuanHoaToken([
    canhBao?.canh_bao,
    canhBao?.CANH_BAO,
    canhBao?.ten_quy_tac,
    canhBao?.TEN_QUY_TAC,
    canhBao?.muc_do,
    thongTinQuanTri.nhom_canh_bao,
    thongTinQuanTri.chi_tiet_canh_bao,
  ].filter(Boolean).join(' | '));

  if (laLoiCauTrucDuLieuXmlDashboard(canhBao)) {
    return {
      id: 'CAU_TRUC_XML',
      label: NHAN_UU_TIEN_CANH_BAO.CAU_TRUC_XML,
      priority: THU_TU_UU_TIEN_CANH_BAO.CAU_TRUC_XML,
    };
  }

  if (thongTinQuanTri.nhom_canh_bao === 'XUAT_TOAN' || noiDung.includes('XUAT TOAN') || noiDung.includes('VI PHAM') || noiDung.includes('KHONG THANH TOAN')) {
    return { id: 'XUAT_TOAN', label: NHAN_UU_TIEN_CANH_BAO.XUAT_TOAN, priority: THU_TU_UU_TIEN_CANH_BAO.XUAT_TOAN };
  }
  if (noiDung.includes('NHAC NHO') || noiDung.includes('GOI Y') || noiDung.includes('THONG TIN') || chuanHoaToken(canhBao?.muc_do) === 'INFO') {
    return { id: 'NHAC_NHO', label: NHAN_UU_TIEN_CANH_BAO.NHAC_NHO, priority: THU_TU_UU_TIEN_CANH_BAO.NHAC_NHO };
  }
  return { id: 'CANH_BAO', label: NHAN_UU_TIEN_CANH_BAO.CANH_BAO, priority: THU_TU_UU_TIEN_CANH_BAO.CANH_BAO };
};

const suyRaTabQuanTriQuyTac = (canhBao = {}) => {
  const tabGoiY = String(canhBao?.tab_quan_tri_goi_y || '').trim().toUpperCase();
  if (tabGoiY) return tabGoiY;

  const maLuat = String(canhBao?.ma_luat || canhBao?.MA_LUAT || '').trim();
  if (maLuat) {
    const match = DANH_MUC_QUY_TAC_NOI_BO.find((item) => khopMaLuatTheoMau(item.ma_luat, maLuat));
    if (match?.tab_id) return match.tab_id;
  }

  return MAP_TAB_QUAN_TRI_THEO_XML[layBangXmlTuCanhBao(canhBao)] || 'LUAT_HANH_CHINH';
};

const taoMoTaViTriXml = ({ phanHe, truongLoi, index }) => {
  const bang = String(phanHe || '').toUpperCase() || 'XML1';
  const truong = String(truongLoi || '').trim();
  const dong = Number.isFinite(Number(index)) && Number(index) >= 0 ? `Dòng ${Number(index) + 1}` : 'Hồ sơ tổng quát';
  return [bang, dong, truong].filter(Boolean).join(' • ');
};

const taoKhoaChiTietPhatSinh = (item = {}) => [
  String(item.khoa || ''),
  String(item.ma_lk || ''),
  String(item.ma_luat || ''),
  String(item.phan_he || ''),
  String(item.truong_loi || ''),
  String(item.index ?? -1),
  String(item.canh_bao || ''),
  String(item.stt ?? item.lan_phat_sinh ?? 0),
].join('|');

const decodeBase64UTF8 = (base64Str) => {
  try {
    const binaryString = window.atob(base64Str);
    const bytes = new Uint8Array(binaryString.length);
    for (let index = 0; index < binaryString.length; index += 1) {
      bytes[index] = binaryString.charCodeAt(index);
    }
    return new TextDecoder('utf-8').decode(bytes);
  } catch (error) {
    try {
      return decodeURIComponent(escape(window.atob(base64Str)));
    } catch {
      return window.atob(base64Str);
    }
  }
};

const parseXMLToJSON = (xmlString) => {
  const result = {};
  const regexHoSo = /<LOAIHOSO>(.*?)<\/LOAIHOSO>[\s\S]*?<NOIDUNGFILE>(.*?)<\/NOIDUNGFILE>/gi;
  let matchHoSo;
  let coDuLieuBaoLanh = false;

  while ((matchHoSo = regexHoSo.exec(xmlString)) !== null) {
    coDuLieuBaoLanh = true;
    const loaiXML = matchHoSo[1].trim().toUpperCase();
    const base64Data = matchHoSo[2].trim();
    const innerXML = decodeBase64UTF8(base64Data);
    const cleanXML = innerXML.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1');
    const leafRegex = /<([A-Z0-9_]+)>([^<]*)<\/\1>/g;

    if (!result[loaiXML]) result[loaiXML] = [];

    if (loaiXML === 'XML1') {
      const record = {};
      let matchField;
      while ((matchField = leafRegex.exec(cleanXML)) !== null) {
        record[matchField[1]] = chuanHoaGiaTriTheoTruong(matchField[1], matchField[2]);
      }
      if (Object.keys(record).length > 0) result.XML1.push(record);
    } else {
      const blockRegex = /<(CHI_TIET[A-Z0-9_]*|CHITIET[A-Z0-9_]*)>([\s\S]*?)<\/\1>/gi;
      let matchBlock;
      while ((matchBlock = blockRegex.exec(cleanXML)) !== null) {
        const blockContent = matchBlock[2];
        const record = {};
        let matchField;
        while ((matchField = leafRegex.exec(blockContent)) !== null) {
          record[matchField[1]] = chuanHoaGiaTriTheoTruong(matchField[1], matchField[2]);
        }
        if (Object.keys(record).length > 0) result[loaiXML].push(record);
      }
    }
  }

  if (!coDuLieuBaoLanh) throw new Error('Không tìm thấy định dạng chuẩn QĐ130.');
  return result;
};

const chuanHoaMaLK = chuanHoaMaLkChoHybrid;

const choUICapNhat = () => new Promise((resolve) => setTimeout(resolve, 0));

const layKetQuaGiamDinhCoSan = (hoSo = {}) => {
  return Array.isArray(hoSo?.ket_qua_giam_dinh) ? hoSo.ket_qua_giam_dinh : null;
};

const ManHinhTongQuan = ({ navigation }) => {
  const { dungSidebarTrai, width: beRongCuaSo } = useLayoutMode();
  const rongSidebarDash = beRongCuaSo >= BREAKPOINTS.xl ? 300 : 260;
  const [dangTai, setDangTai] = useState(false);
  const [thongBaoDangTai, setThongBaoDangTai] = useState('Đang kiểm tra hồ sơ...');
  const [thongKe, setThongKe] = useState({ tong: 0, sach: 0, loi: 0, giamDinhLai: 0, danhMuc: [] });
  const [rawDanhSach, setRawDanhSach] = useState([]); 
  const [khoaQuyTacDangChon, setKhoaQuyTacDangChon] = useState('');
  const [boLocLoaiUuTien, setBoLocLoaiUuTien] = useState('TAT_CA');
  const [boLocNhomViPham, setBoLocNhomViPham] = useState(NHOM_VI_PHAM_TAT_CA);
  const [boLocNhomCapLoaiKcb, setBoLocNhomCapLoaiKcb] = useState(NHOM_VI_PHAM_TAT_CA);
  const [boLocMaKhoa, setBoLocMaKhoa] = useState(NHOM_VI_PHAM_TAT_CA);
  const [boLocIcd10, setBoLocIcd10] = useState(BO_LOC_ICD10_VI_PHAM_TAT_CA);
  const [tuKhoaLocQuyTac, setTuKhoaLocQuyTac] = useState('');
  const [tuKhoaLocHoSo, setTuKhoaLocHoSo] = useState('');
  const [tuKhoaTraCuuChiTiet, setTuKhoaTraCuuChiTiet] = useState('');
  const [loaiTraCuuChiTiet, setLoaiTraCuuChiTiet] = useState('TAT_CA');
  /** Cửa sổ chi tiết ca lỗi theo quy tắc (chuột phải / nhấn giữ dòng bảng) — không thay luồng chạm thường */
  const [modalChiTietHoSoLoiVisible, setModalChiTietHoSoLoiVisible] = useState(false);
  const [quyTacChoModalChiTiet, setQuyTacChoModalChiTiet] = useState(null);
  const [tuKhoaLocChiTietModal, setTuKhoaLocChiTietModal] = useState('');

  const [menuHienThi, setMenuHienThi] = useState([]);
  const [vaiTroHienTai, setVaiTroHienTai] = useState('Đang tải...');
  const [tenTaiKhoan, setTenTaiKhoan] = useState('');
  const [cheDoGiamDinh, setCheDoGiamDinh] = useState(CHE_DO_GIAM_DINH.LOCAL);
  /** Warm-up Python khi mở dashboard: thử lại tự động, không phụ thuộc online/offline toàn cục (localhost vẫn thử). */
  const [trangThaiPythonKhoiDong, setTrangThaiPythonKhoiDong] = useState({
    daKiemTra: false,
    ok: false,
    chiTiet: '',
    baseUrl: '',
    lanThu: 0,
  });
  /** Chỉ Web: nhật ký từng file/hồ sơ khi kiểm tra tự động cả thư mục (mỗi hồ sơ xong engine + lưu kho thì ghi một dòng; không dùng alert). */
  const [logGiamDinhTuDongThuMuc, setLogGiamDinhTuDongThuMuc] = useState([]);
  /** Thu gọn thẻ nạp XML: mô tả dài + kiểm tra cả thư mục (chủ yếu web) */
  const [importCardMoChiTietKt, setImportCardMoChiTietKt] = useState(false);
  const [importCardMoNangCao, setImportCardMoNangCao] = useState(false);
  const [popupTriThucVisible, setPopupTriThucVisible] = useState(false);
  /** Ẩn/hiện + ghim thẻ Điều hướng và bộ lọc QPS (lưu AsyncStorage) */
  const [panelUi, setPanelUi] = useState(trangThaiPanelMacDinh);
  const panelUiRef = useRef(panelUi);
  /** menu: chọn Trợ lý / Tri thức GD · chat: cửa sổ chat RAG */
  const [triThucModalPhan, setTriThucModalPhan] = useState('menu');
  const animTriThucBackdrop = useRef(new Animated.Value(0)).current;
  const animTriThucPanel = useRef(new Animated.Value(0)).current;

  const IDS_TRI_THUC_POPUP = ['MOD_TRO_LY_TRI_THUC', 'MOD_TRI_THUC_GD'];

  const tatCaModules = [
    { id: 'MOD_HELPER', route: 'Helper', ten: '🧰 HELPER + FIREBASE' },
    { id: 'MOD_KHO_LUU_TRU', route: 'KhoLuuTru', ten: '🗄️ KHO LƯU TRỮ' },
    { id: 'MOD_XML_GIAM_DINH', route: 'DocXML', ten: '🗂️ ĐỌC XML CHI TIẾT' },
    { id: 'MOD_CONG_HIS', route: 'CongHIS', ten: '🔌 CỔNG HIS' },
    { id: 'MOD_CHUYEN_MON', route: 'QuanLyChuyenMon', ten: '🧠 CHUYÊN MÔN' },
    { id: 'MOD_THU_VIEN', route: 'ThuVien', ten: '📚 THƯ VIỆN' },
    { id: 'MOD_TRO_LY_TRI_THUC', route: 'TroLyTriThuc', ten: '🤖 TRỢ LÝ TRI THỨC (RAG)' },
    { id: 'MOD_TRI_THUC_GD', route: 'TriThucTuGiamDinh', ten: '🧠 TRI THỨC TỪ KIỂM TRA' },
    { id: 'MOD_DANH_MUC', route: 'QuanLyDanhMuc', ten: '📋 DM NỘI BỘ' },
    { id: 'MOD_MAPPING_DM', route: 'MappingNghiepVu', ten: '🔗 MAPPING DM' },
    { id: 'MOD_DANH_MUC_BYT', route: 'DanhMucBYTMain', ten: '🏥 DM BỘ Y TẾ' },
    { id: 'MOD_QUAN_LY_LUAT', route: 'QuanLyLuat', ten: '⚙️ QUẢN LÝ LUẬT' },
    { id: 'MOD_QUY_TAC_ON_OFF', route: 'QuanLyQuyTacOnOff', ten: '🎚 QUY TẮC ON/OFF' },
    { id: 'MOD_BAO_CAO_THONG_KE', route: 'BaoCaoVaThongKe', ten: '📊 BÁO CÁO' },
    { id: 'MOD_ACL', route: 'PhanQuyenTruyCap', ten: '🔐 PHÂN QUYỀN', adminOnly: true }
  ];

  const fetchThongTinHeThong = async () => {
    try {
      // [CẬP NHẬT LÕI]: Dùng hàm chuẩn để tải từ Kho hệ thống
      const danhSach = await layTatCaHoSoTuKho();
      if (danhSach && danhSach.length > 0) {
        setRawDanhSach(danhSach);
        tinhToanDashboard(danhSach);
      }

      const session = await docPhienDangNhap();
      const realRole = session.role || 'USER'; 
      const realAccount = session.email || 'Chưa xác định';
      
      setVaiTroHienTai(realRole); 
      setTenTaiKhoan(realAccount);
      setCheDoGiamDinh(await docCheDoGiamDinh());

      const cfgRbac = await taiRBAC();
      const menuLoc = locModuleTheoRBAC({
        cfg: cfgRbac,
        email: realAccount,
        fallbackRole: realRole,
        modules: tatCaModules,
      });

      setMenuHienThi(menuLoc);
    } catch (e) {
      console.error("Lỗi tải phân quyền:", e);
    }
  };

  const capNhatPanelUi = (panelId, patch) => {
    setPanelUi((prev) => {
      const next = {
        ...prev,
        [panelId]: { ...prev[panelId], ...patch },
      };
      panelUiRef.current = next;
      void luuTuyChonPanelTongQuan(next);
      return next;
    });
  };

  const chuyenTrangThaiAnPanel = (panelId) => {
    capNhatPanelUi(panelId, { an: !panelUiRef.current[panelId]?.an });
  };

  const chuyenTrangThaiGhimPanel = (panelId) => {
    capNhatPanelUi(panelId, { ghim: !panelUiRef.current[panelId]?.ghim });
  };

  useEffect(() => {
    let huy = false;
    (async () => {
      const prefs = await taiTuyChonPanelTongQuan();
      if (huy) return;
      panelUiRef.current = prefs;
      setPanelUi(prefs);
    })();
    return () => { huy = true; };
  }, []);

  useEffect(() => {
    fetchThongTinHeThong();
    const unsubscribe = navigation.addListener('focus', () => fetchThongTinHeThong());
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    let huy = false;
    (async () => {
      const snap = layTrangThaiPythonGanNhat();
      if (snap != null) {
        if (huy) return;
        setTrangThaiPythonKhoiDong({
          daKiemTra: true,
          ok: !!snap.ok,
          chiTiet: snap.chiTiet || '',
          baseUrl: snap.baseUrl || '',
          lanThu: snap.soLanThu ?? 0,
        });
        return;
      }
      const kq = await ketNoiPythonServiceLucKhoiDong();
      if (huy) return;
      setTrangThaiPythonKhoiDong({
        daKiemTra: true,
        ok: kq.ok,
        chiTiet: kq.chiTiet || '',
        baseUrl: kq.baseUrl || '',
        lanThu: kq.soLanThu || 0,
      });
    })();
    return () => { huy = true; };
  }, []);

  const locDanhMucQuyTac = (danhMuc = []) => {
    const tuKhoaQuyTacChuan = chuanHoaToken(tuKhoaLocQuyTac);
    const tuKhoaHoSoChuan = chuanHoaToken(tuKhoaLocHoSo);

    return danhMuc.filter((item) => {
      if (boLocLoaiUuTien !== 'TAT_CA' && item.loai_hien_thi !== boLocLoaiUuTien) return false;

      if (boLocNhomViPham !== NHOM_VI_PHAM_TAT_CA) {
        const khopNhom = (item.chi_tiet_phat_sinh || []).some((ct) => ct.nhom_vi_pham === boLocNhomViPham);
        if (!khopNhom) return false;
      }

      if (boLocNhomCapLoaiKcb !== NHOM_VI_PHAM_TAT_CA) {
        const khopLoai = (item.chi_tiet_phat_sinh || []).some(
          (ct) => (ct.nhom_cap_loai_kcb || layNhomCapLoaiKcb802(ct.ma_loai_kcb_chuan)) === boLocNhomCapLoaiKcb,
        );
        if (!khopLoai) return false;
      }

      if (boLocMaKhoa !== NHOM_VI_PHAM_TAT_CA) {
        const khopKhoa = (item.chi_tiet_phat_sinh || []).some(
          (ct) => (ct.ma_khoa_chuan || 'KHONG_RO') === boLocMaKhoa,
        );
        if (!khopKhoa) return false;
      }

      if (boLocIcd10) {
        const khopIcd = (item.chi_tiet_phat_sinh || []).some((ct) => loiKhopBoLocIcd10ViPham(ct, boLocIcd10));
        if (!khopIcd) return false;
      }

      const chuoiQuyTac = chuanHoaToken([
        item.ma_luat,
        item.ten_quy_tac,
        item.canh_bao,
      ].filter(Boolean).join(' | '));
      if (tuKhoaQuyTacChuan && !chuoiQuyTac.includes(tuKhoaQuyTacChuan)) return false;

      if (tuKhoaHoSoChuan) {
        const khopHoSo = (item.chi_tiet_phat_sinh || []).some((chiTiet) => {
          const chuoiHoSo = chuanHoaToken([
            chiTiet?.ma_lk,
            chiTiet?.ten_bn,
          ].filter(Boolean).join(' | '));
          return chuoiHoSo.includes(tuKhoaHoSoChuan);
        });
        if (!khopHoSo) return false;
      }

      return true;
    });
  };

  const danhMucDaLoc = locDanhMucQuyTac(thongKe.danhMuc);
  const coBoLocDangBat = boLocLoaiUuTien !== 'TAT_CA' || boLocNhomViPham !== NHOM_VI_PHAM_TAT_CA || boLocNhomCapLoaiKcb !== NHOM_VI_PHAM_TAT_CA || boLocMaKhoa !== NHOM_VI_PHAM_TAT_CA || boLocIcd10 !== BO_LOC_ICD10_VI_PHAM_TAT_CA || tuKhoaLocQuyTac.trim() !== '' || tuKhoaLocHoSo.trim() !== '';
  const danhSachLoiChiTietDashboard = useMemo(() => phangHoaDanhSachLoiChiTiet(rawDanhSach), [rawDanhSach]);

  /** Từng dòng lỗi (chi tiết) sau bộ lọc QPS — dùng chung xuất Excel / XML, khớp ưu tiên, nhóm NV, loại KCB, khoa, 2 ô từ khóa. */
  const danhSachLoiChiTietSauLocXuat = useMemo(() => {
    const flat = phangHoaDanhSachLoiChiTiet(rawDanhSach);
    const locBase = locDanhSachLoiChiTiet(flat, {
      loaiHienThi: boLocLoaiUuTien,
      nhomViPham: boLocNhomViPham,
      nhomCapLoaiKcb802: boLocNhomCapLoaiKcb,
      maKhoa: boLocMaKhoa,
      boLocIcd10,
      tuKhoa: '',
    });
    const q1 = chuanHoaToken(tuKhoaLocQuyTac);
    const q2 = chuanHoaToken(tuKhoaLocHoSo);
    return locBase.filter((row) => {
      if (q1) {
        const chuoiQuyTac = chuanHoaToken([row.ma_luat, row.ten_quy_tac, row.canh_bao].filter(Boolean).join(' | '));
        if (!chuoiQuyTac.includes(q1)) return false;
      }
      if (q2) {
        const chuoiHoSo = chuanHoaToken([row.ma_lk, row.ten_bn].filter(Boolean).join(' | '));
        if (!chuoiHoSo.includes(q2)) return false;
      }
      return true;
    });
  }, [rawDanhSach, boLocLoaiUuTien, boLocNhomViPham, boLocNhomCapLoaiKcb, boLocMaKhoa, boLocIcd10, tuKhoaLocQuyTac, tuKhoaLocHoSo]);

  const demIcd10TheoBoLoc = useMemo(
    () => demLoiTheoBoLocIcd10(danhSachLoiChiTietDashboard),
    [danhSachLoiChiTietDashboard],
  );

  const thaKhoaTuDuLieu = useMemo(() => {
    const map = new Map();
    danhSachLoiChiTietDashboard.forEach((r) => {
      const id = r.ma_khoa_chuan || 'KHONG_RO';
      const label = id === 'KHONG_RO' ? 'Chưa ghi MA_KHOA' : `Khoa ${id}`;
      if (!map.has(id)) map.set(id, label);
    });
    return [...map.entries()]
      .map(([id, label]) => ({ id, label }))
      .sort((a, b) => String(a.id).localeCompare(String(b.id), 'vi'));
  }, [danhSachLoiChiTietDashboard]);

  const ketQuaTraCuuChiTiet = useMemo(() => locDanhSachLoiChiTiet(danhSachLoiChiTietDashboard, {
    tuKhoa: tuKhoaTraCuuChiTiet,
    loaiHienThi: loaiTraCuuChiTiet,
    nhomViPham: boLocNhomViPham,
    nhomCapLoaiKcb802: boLocNhomCapLoaiKcb,
    maKhoa: boLocMaKhoa,
    boLocIcd10,
  }), [danhSachLoiChiTietDashboard, loaiTraCuuChiTiet, tuKhoaTraCuuChiTiet, boLocNhomViPham, boLocNhomCapLoaiKcb, boLocMaKhoa, boLocIcd10]);
  const ketQuaTraCuuChiTietHienThi = ketQuaTraCuuChiTiet.slice(0, 60);

  useEffect(() => {
    if (danhMucDaLoc.length === 0) {
      if (khoaQuyTacDangChon) setKhoaQuyTacDangChon('');
      return;
    }
    const daTonTai = danhMucDaLoc.some((item) => item.khoa === khoaQuyTacDangChon);
    if (!daTonTai) {
      setKhoaQuyTacDangChon(danhMucDaLoc[0].khoa);
    }
  }, [boLocLoaiUuTien, boLocNhomViPham, boLocNhomCapLoaiKcb, boLocMaKhoa, boLocIcd10, danhMucDaLoc, khoaQuyTacDangChon, tuKhoaLocHoSo, tuKhoaLocQuyTac]);

  const tinhToanDashboard = (danhSachHoSo) => {
    const tongSo = danhSachHoSo.length;
    const tongGiamDinhLai = danhSachHoSo.reduce((tong, hoSo) => tong + (hoSo.giam_dinh_lai || 0), 0);
    const danhSachChiTiet = phangHoaDanhSachLoiChiTiet(danhSachHoSo);
    const mangLoi = tongHopQuyTacTuDanhSachChiTiet(danhSachChiTiet);
    const tapHoSoLoi = new Set(danhSachChiTiet.map((item) => item.ma_lk || item.khoa).filter(Boolean));
    const soHoSoLoi = tapHoSoLoi.size;
    setThongKe({ tong: tongSo, sach: tongSo - soHoSoLoi, loi: soHoSoLoi, giamDinhLai: tongGiamDinhLai, danhMuc: mangLoi });
  };

  const quyTacDangChon = danhMucDaLoc.find((item) => item.khoa === khoaQuyTacDangChon) || danhMucDaLoc[0] || null;

  const chiTietPhatSinhDaLocBoLoc = useMemo(() => {
    const raw = quyTacDangChon?.chi_tiet_phat_sinh || [];
    return raw.filter((c) => {
      if (boLocNhomViPham !== NHOM_VI_PHAM_TAT_CA && c.nhom_vi_pham !== boLocNhomViPham) return false;
      if (boLocNhomCapLoaiKcb !== NHOM_VI_PHAM_TAT_CA && (c.nhom_cap_loai_kcb || layNhomCapLoaiKcb802(c.ma_loai_kcb_chuan)) !== boLocNhomCapLoaiKcb) return false;
      if (boLocMaKhoa !== NHOM_VI_PHAM_TAT_CA && (c.ma_khoa_chuan || 'KHONG_RO') !== boLocMaKhoa) return false;
      if (boLocIcd10 && !loiKhopBoLocIcd10ViPham(c, boLocIcd10)) return false;
      return true;
    });
  }, [quyTacDangChon, boLocNhomViPham, boLocNhomCapLoaiKcb, boLocMaKhoa, boLocIcd10]);

  const chiTietModalDaLoc = useMemo(() => {
    const rawAll = quyTacChoModalChiTiet?.chi_tiet_phat_sinh || [];
    const raw = rawAll.filter((c) => {
      if (boLocNhomViPham !== NHOM_VI_PHAM_TAT_CA && c.nhom_vi_pham !== boLocNhomViPham) return false;
      if (boLocNhomCapLoaiKcb !== NHOM_VI_PHAM_TAT_CA && (c.nhom_cap_loai_kcb || layNhomCapLoaiKcb802(c.ma_loai_kcb_chuan)) !== boLocNhomCapLoaiKcb) return false;
      if (boLocMaKhoa !== NHOM_VI_PHAM_TAT_CA && (c.ma_khoa_chuan || 'KHONG_RO') !== boLocMaKhoa) return false;
      if (boLocIcd10 && !loiKhopBoLocIcd10ViPham(c, boLocIcd10)) return false;
      return true;
    });
    const q = chuanHoaToken(tuKhoaLocChiTietModal).trim();
    if (!q) return raw;
    return raw.filter((c) => {
      const s = chuanHoaToken([
        c?.ma_lk,
        c?.ten_bn,
        c?.canh_bao,
        c?.vi_tri_xml,
        c?.ma_luat,
        c?.nhan_nhom_vi_pham,
        c?.ten_loai_kcb_802,
        c?.nhan_nhom_cap_loai_kcb,
        c?.ma_khoa_chuan,
      ].filter(Boolean).join(' | '));
      return s.includes(q);
    });
  }, [quyTacChoModalChiTiet, tuKhoaLocChiTietModal, boLocNhomViPham, boLocNhomCapLoaiKcb, boLocMaKhoa, boLocIcd10]);

  const tongCaModalSauLocBoLoc = useMemo(() => {
    const rawAll = quyTacChoModalChiTiet?.chi_tiet_phat_sinh || [];
    return rawAll.filter((c) => {
      if (boLocNhomViPham !== NHOM_VI_PHAM_TAT_CA && c.nhom_vi_pham !== boLocNhomViPham) return false;
      if (boLocNhomCapLoaiKcb !== NHOM_VI_PHAM_TAT_CA && (c.nhom_cap_loai_kcb || layNhomCapLoaiKcb802(c.ma_loai_kcb_chuan)) !== boLocNhomCapLoaiKcb) return false;
      if (boLocMaKhoa !== NHOM_VI_PHAM_TAT_CA && (c.ma_khoa_chuan || 'KHONG_RO') !== boLocMaKhoa) return false;
      if (boLocIcd10 && !loiKhopBoLocIcd10ViPham(c, boLocIcd10)) return false;
      return true;
    }).length;
  }, [quyTacChoModalChiTiet, boLocNhomViPham, boLocNhomCapLoaiKcb, boLocMaKhoa, boLocIcd10]);

  const timHoSoTrongKhoTheoMaLK = (maLK) => {
    const m = chuanHoaMaLK(maLK);
    if (!m) return null;
    return rawDanhSach.find((h) => chuanHoaMaLK(h?.ma_lk || h?.xml1?.MA_LK || h?.XML1?.MA_LK) === m) || null;
  };

  const moModalChiTietHoSoLoiTheoQuyTac = (item) => {
    if (!item) return;
    setTuKhoaLocChiTietModal('');
    setKhoaQuyTacDangChon(item.khoa);
    setQuyTacChoModalChiTiet(item);
    setModalChiTietHoSoLoiVisible(true);
  };

  const dongModalChiTietHoSoLoi = () => {
    setModalChiTietHoSoLoiVisible(false);
  };

  const xuatXmlChuanHisChoHoSo = (chiTiet) => {
    const hs = timHoSoTrongKhoTheoMaLK(chiTiet?.ma_lk);
    if (!hs) {
      alert('Chưa tìm thấy hồ sơ trong kho để xuất XML. Hãy kiểm tra lại hoặc mở hồ sơ từ Kho lưu trữ.');
      return;
    }
    if (Platform.OS !== 'web' || typeof document === 'undefined') {
      alert('Tải file XML chuẩn QĐ 130 hiện hỗ trợ trên web. Trên thiết bị cảm ứng, dùng «Sửa và lưu XML» để lưu rồi chia sẻ.');
      return;
    }
    try {
      const { xmlContent, tenFile } = xuatHoSoThanhXML130(hs, { tenFilePrefix: 'HOSO_QD130' });
      const blob = new Blob([xmlContent], { type: 'text/xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = tenFile || `HOSO_QD130_${chuanHoaMaLK(chiTiet?.ma_lk)}.xml`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      alert(`Không xuất được XML: ${e?.message || e}`);
    }
  };

  const moChiTietXmlTheoLoi = (loiPhatSinh) => {
    if (!loiPhatSinh?.ma_lk) return;
    navigation.navigate('DocXML', {
      maLK: loiPhatSinh.ma_lk,
      loi: loiPhatSinh,
      batLocTheoTab: true,
      nguonDieuHuong: 'dashboard_quy_tac',
    });
  };

  const moSuaXmlTheoLoi = (loiPhatSinh) => {
    if (!loiPhatSinh?.ma_lk) return;
    navigation.navigate('SuaFileXML', {
      maLK: loiPhatSinh.ma_lk,
      loi: loiPhatSinh,
      moCheDoBanSao: true,
      viTriSua: {
        phanHe: loiPhatSinh.phan_he || layBangXmlTuCanhBao(loiPhatSinh),
        truongLoi: loiPhatSinh.truong_loi || '',
        index: Number.isFinite(loiPhatSinh.index) ? loiPhatSinh.index : 0,
      },
    });
  };

  const moQuanTriQuyTacTheoLoi = (loiPhatSinh) => {
    const maLuat = coMaLuatHopLe(loiPhatSinh?.ma_luat) ? loiPhatSinh.ma_luat : '';
    navigation.navigate('QuanLyQuyTacOnOff', {
      initialTabId: suyRaTabQuanTriQuyTac(loiPhatSinh),
      initialKeyword: maLuat || String(loiPhatSinh?.ten_quy_tac || '').trim(),
      highlightedMaLuat: maLuat,
      boLocLoaiQuyTac: loiPhatSinh?.loai_hien_thi === 'XUAT_TOAN' ? 'XUAT_TOAN' : 'TAT_CA',
    });
  };

  const nhanDienHoSoTuFile = async (danhSachHoSoTuFile, tuyChon = {}) => {
    const dsMaLKSanCo = new Set((await layDanhSachMaLKTuKho()).map(chuanHoaMaLK).filter(Boolean));
    const danhSachHopLe = [];
    let soHoSoGhiDe = 0;

    danhSachHoSoTuFile.forEach((hs) => {
      const maLK = chuanHoaMaLK(hs?.ma_lk || hs?.xml1?.MA_LK || hs?.XML1?.MA_LK);
      if (!maLK) return;
      if (dsMaLKSanCo.has(maLK)) soHoSoGhiDe += 1;
      danhSachHopLe.push({ ...hs, ma_lk: maLK });
    });

    if (danhSachHopLe.length === 0) {
      if (!tuyChon.boQuaThongBaoCuoi) {
        alert('Không có hồ sơ hợp lệ để kiểm tra.');
      }
      return false;
    }

    return tienHanhGiamDinh(danhSachHopLe, { soHoSoGhiDe, boQuaThongBaoCuoi: tuyChon.boQuaThongBaoCuoi });
  };

  /**
   * Web: chọn cả thư mục → xử lý tuần tự từng file .xml → mỗi hồ sơ: kiểm tra + lưu kho (một lần engine/hồ sơ)
   * giống nút "Chuyển dữ liệu"; không alert từng bước, nhật ký ghi ngay sau từng hồ sơ. Luồng "Chọn XML" đơn lẻ không đổi.
   */
  const chayGiamDinhTuDongTrenThuMuc = () => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.webkitdirectory = true;
    input.onchange = async (ev) => {
      const fileList = ev.target?.files;
      if (!fileList?.length) return;
      const dsFile = Array.from(fileList).filter((f) => f.name.toLowerCase().endsWith('.xml'));
      dsFile.sort((a, b) => a.name.localeCompare(b.name, 'vi'));
      if (dsFile.length === 0) {
        setLogGiamDinhTuDongThuMuc((prev) => [...prev, `${new Date().toLocaleTimeString('vi-VN')}: Không có file .xml trong thư mục đã chọn.`]);
        if (ev.target) ev.target.value = '';
        return;
      }

      setLogGiamDinhTuDongThuMuc([`${new Date().toLocaleTimeString('vi-VN')}: Bắt đầu ${dsFile.length} file XML (thư mục) — kiểm tra lần lượt từng hồ sơ (xong hồ sơ nào báo hồ sơ đó).`]);

      let { lichSuGiamDinh, danhSachMaLKDaCo } = await taiNguonPhuThuocNhapXml();
      const tong = dsFile.length;
      let soThanhCong = 0;
      let soLoi = 0;

      for (let i = 0; i < dsFile.length; i += 1) {
        const file = dsFile[i];
        const ketQua = await xuLyMotFileXmlChoBanGiamDinh(file, { lichSuGiamDinh, danhSachMaLKDaCo });
        const hoSoGui = chuyenKetQuaFileSangMangHoSoKho(ketQua);
        const soLoiSoBo = Array.isArray(ketQua.chiTietLoi) ? ketQua.chiTietLoi.length : 0;

        if (hoSoGui.length === 0) {
          soLoi += 1;
          const ly = ketQua.lyDoLoi || 'Không chuyển được sang kho.';
          setLogGiamDinhTuDongThuMuc((prev) => [
            ...prev,
            `✖ [${i + 1}/${tong}] ${file.name} — ${ly}`,
          ]);
          continue;
        }

        const maStr = String(hoSoGui[0]?.ma_lk || ketQua.ma_lk || '—');
        const maNorm = String(maStr || '').trim().toUpperCase();
        if (maNorm && !danhSachMaLKDaCo.includes(maNorm)) {
          danhSachMaLKDaCo = [...danhSachMaLKDaCo, maNorm];
        }

        const engineNhan = cheDoGiamDinh === CHE_DO_GIAM_DINH.PYTHON ? 'Python' : 'JS';
        const daLuu = await nhanDienHoSoTuFile(hoSoGui, { boQuaThongBaoCuoi: true });
        if (daLuu) {
          soThanhCong += 1;
          setLogGiamDinhTuDongThuMuc((prev) => [
            ...prev,
            `✓ [${i + 1}/${tong}] ${file.name} → MA_LK ${maStr} · ${soLoiSoBo} cảnh báo (quét sơ bộ) · đã kiểm tra & lưu kho (${engineNhan}).`,
          ]);
        } else {
          soLoi += 1;
          setLogGiamDinhTuDongThuMuc((prev) => [
            ...prev,
            `✖ [${i + 1}/${tong}] ${file.name} → MA_LK ${maStr} · lỗi kiểm tra hoặc không lưu được kho (${engineNhan}).`,
          ]);
        }

        const refreshed = await taiNguonPhuThuocNhapXml();
        lichSuGiamDinh = refreshed.lichSuGiamDinh;
        danhSachMaLKDaCo = refreshed.danhSachMaLKDaCo;
      }

      setLogGiamDinhTuDongThuMuc((prev) => [
        ...prev,
        `— Hoàn tất: ${soThanhCong} hồ sơ đã kiểm tra & lưu kho, ${soLoi} file/hồ sơ lỗi / ${tong} file XML.`,
      ]);
      if (ev.target) ev.target.value = '';
    };
    input.click();
  };

  /** Cập nhật dashboard sau lưu kho — merge theo MA_LK, tránh đọc lại toàn bộ kho + RBAC (nhanh hơn cho 1 hồ sơ / lô nhỏ). */
  const capNhatBangSauLuuKho = (danhSachLuuKho) => {
    if (!Array.isArray(danhSachLuuKho) || danhSachLuuKho.length === 0) return;
    setRawDanhSach((prev) => {
      const map = new Map();
      (prev || []).forEach((h) => {
        const k = chuanHoaMaLK(h?.ma_lk || h?.xml1?.MA_LK || h?.XML1?.MA_LK);
        if (k) map.set(k, h);
      });
      danhSachLuuKho.forEach((h) => {
        const k = chuanHoaMaLK(h?.ma_lk || h?.xml1?.MA_LK || h?.XML1?.MA_LK);
        if (k) map.set(k, h);
      });
      const next = [...map.values()];
      tinhToanDashboard(next);
      return next;
    });
  };

  const tienHanhGiamDinh = async (danhSachTienHanh, thongTinThem = {}) => {
    setDangTai(true);
    const n = (danhSachTienHanh || []).length;
    setThongBaoDangTai(n > 1 ? `Đang chuẩn bị kiểm tra ${n} hồ sơ...` : 'Đang kiểm tra hồ sơ...');
    await choUICapNhat();

    let giamDinhLuuThanhCong = false;
    try {
      if (thongTinThem?.lamMoiCacheLuat) {
        try {
          xoaCacheBoMayGiamDinh();
        } catch (_e) {
          /* best-effort */
        }
      }

      const danhSachDaCoKetQua = danhSachTienHanh.map((hoSo) => {
        const ketQuaCoSan = layKetQuaGiamDinhCoSan(hoSo);
        return ketQuaCoSan ? { ...hoSo, ket_qua_giam_dinh: ketQuaCoSan } : hoSo;
      });

      const ketQuaHybrid = await chayGiamDinhNhieuHoSoHybridDongBo(danhSachDaCoKetQua, {
        cheDoGiamDinh,
        setThongBaoDangTai,
        choUICapNhat,
        pythonSource: 'dashboard_tong_quan',
        onProgress: async ({ completed, total }) => {
          setThongBaoDangTai(total > 1 ? `Kiểm tra: ${completed}/${total}…` : 'Đang chạy engine…');
          const xong = completed === total;
          const nhe = total > 6 ? completed % 3 === 0 : completed % 2 === 0;
          if (xong || nhe) await choUICapNhat();
        },
      });
      const danhSachLuuKho = ketQuaHybrid.danhSachLuuKho;
      const daFallbackTuPythonSangJs = ketQuaHybrid.daFallbackTuPythonSangJs;
      const daHopNhatPythonVaJs = ketQuaHybrid.daHopNhatPythonVaJs;

      // [CẬP NHẬT LÕI MẠNH MẼ NHẤT]: Gửi thẳng danh sách đã kiểm tra vào hàm luuHoSoVaoKho chuẩn
      const ketQuaLuu = await luuHoSoVaoKho(danhSachLuuKho);
      if (ketQuaLuu) {
        giamDinhLuuThanhCong = true;
        const soHoSoGhiDe = Number(thongTinThem?.soHoSoGhiDe) || 0;
        capNhatBangSauLuuKho(danhSachLuuKho);
        let msg = daFallbackTuPythonSangJs
          ? `Đã kiểm tra ${danhSachLuuKho.length} hồ sơ: lớp Python không sẵn sàng hoặc lỗi (chế độ yêu cầu Python) — lưu kết quả engine JS (V15) cho đợt này.`
          : daHopNhatPythonVaJs
            ? `Đã kiểm tra ${danhSachLuuKho.length} hồ sơ theo hybrid: hợp nhất cảnh báo Python service + engine JS (V15).`
            : soHoSoGhiDe > 0
              ? `Đã kiểm tra lại ${danhSachLuuKho.length} hồ sơ (JS V15). Trong đó ${soHoSoGhiDe} hồ sơ trùng MA_LK đã được ghi đè.`
              : `Đã kiểm tra và lưu ${danhSachLuuKho.length} hồ sơ (engine JS V15).${!laPythonServiceBatTrongCauHinh() ? ' Bật pythonService + service chạy để có hybrid với Python.' : ''}`;

        const goiYlichSu = [];
        for (const hs of danhSachLuuKho) {
          try {
            const fx = await phanTichKhoangCachDieuTri(hs);
            if (!fx.co_lan_truoc_so_sanh) continue;
            const t = fx.trung_ma_thuoc?.length || 0;
            const d = fx.trung_ma_dvkt?.length || 0;
            const ngay = fx.so_ngay_tu_ngay_ra_lan_truoc;
            if (t + d > 0 || (Number.isFinite(ngay) && ngay <= 30)) {
              const ma = hs.ma_lk || hs.xml1?.MA_LK || hs.XML1?.MA_LK || '?';
              goiYlichSu.push(`MA_LK ${ma}: ~${ngay} ngày sau ngày ra lần trước; trùng mã thuốc/DVKT: ${t}/${d}.`);
            }
          } catch (_e) {
            /* bỏ qua */
          }
          if (goiYlichSu.length >= 5) break;
        }
        if (goiYlichSu.length > 0) {
          msg += `\n\nSo với lịch sử điều trị đã lưu trên máy (cùng MA_BN):\n${goiYlichSu.join('\n')}`;
        }
        if (!thongTinThem?.boQuaThongBaoCuoi) {
          alert(msg);
        }
      } else {
        if (!thongTinThem?.boQuaThongBaoCuoi) {
          alert("Lỗi lưu trữ: Không thể lưu hồ sơ vào kho. Vui lòng thử lại.");
        }
      }

    } catch (err) {
      giamDinhLuuThanhCong = false;
      if (!thongTinThem?.boQuaThongBaoCuoi) {
        const msg = err && typeof err.message === 'string' && err.message.trim() ? err.message.trim() : '';
        alert(msg ? `Lỗi xử lý kiểm tra: ${msg}` : 'Lỗi xử lý kiểm tra.');
      }
      console.error(err);
    } finally {
      setDangTai(false);
      setThongBaoDangTai('Đang kiểm tra hồ sơ...');
    }
    return giamDinhLuuThanhCong;
  };

  const handleResetKho = async () => {
    if (confirm(
      'Xóa KHO LÀM VIỆC (danh sách hồ sơ đang kiểm tra trên màn hình)? '
      + 'Dữ liệu lưu trên trình duyệt/máy (IndexedDB hoặc bộ nhớ app) sẽ mất cho kho đó. '
      + 'Lịch sử điều trị theo bệnh nhân (để so sánh lần khám) vẫn được giữ trên máy trừ khi bạn xóa riêng trong Helper.',
    )) {
      await xoaToanBoKho(); // Chỉ xóa store hồ sơ làm việc, không xóa lịch sử BN
      setThongKe({ tong: 0, sach: 0, loi: 0, giamDinhLai: 0, danhMuc: [] });
      setRawDanhSach([]);
    }
  };

  // =======================================================
  // TIỆN ÍCH: CHUYỂN XML SANG EXCEL
  // =======================================================
  const handleConvertXmlToExcel = () => {
    if (Platform.OS !== 'web') {
        alert("Tính năng này chỉ hỗ trợ trên trình duyệt Web.");
        return;
    }
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xml';
    
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setDangTai(true);

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const xmlContent = event.target.result;
                const parsedData = parseXMLToJSON(xmlContent);

                const wb = XLSX.utils.book_new();
                let hasData = false;

                Object.keys(parsedData).forEach(sheetName => {
                    if (parsedData[sheetName] && parsedData[sheetName].length > 0) {
                        const ws = XLSX.utils.json_to_sheet(parsedData[sheetName]);
                        XLSX.utils.book_append_sheet(wb, ws, sheetName.toLowerCase());
                        hasData = true;
                    }
                });

                if (!hasData) {
                    alert("File XML hợp lệ nhưng không chứa dữ liệu chi tiết.");
                    setDangTai(false);
                    return;
                }

                const exportFileName = `Data_BHYT_${file.name.replace('.xml', '')}.xlsx`;
                XLSX.writeFile(wb, exportFileName);
                alert('✅ Xuất file Excel thành công!');
            } catch (error) {
                console.error("Lỗi xử lý file XML:", error);
                alert(`Có lỗi xảy ra: ${error.message}`);
            } finally {
                setDangTai(false);
            }
        };
        
        reader.onerror = () => {
            alert("Không thể đọc file XML. Vui lòng thử lại.");
            setDangTai(false);
        };

        reader.readAsText(file);
    };

    input.click();
  };

  const handleExportLoiExcel = async () => {
    if (Platform.OS !== 'web') return;
    if (rawDanhSach.length === 0) {
      alert('Chưa có hồ sơ kiểm tra.');
      return;
    }
    if (danhSachLoiChiTietSauLocXuat.length === 0) {
      alert('Không có dòng lỗi nào khớp bộ lọc hiện tại (ưu tiên, nhóm nghiệp vụ, loại KCB, khoa, từ khóa). Điều chỉnh lọc hoặc bấm «Xóa lọc» rồi thử lại.');
      return;
    }

    const mapHoTen = await layMapHoTenNhanSuChoXuatBaoCao();
    const theoPhanHe = taoCacDongXuatXmlGocSangNhomTheoPhanHe(danhSachLoiChiTietSauLocXuat, timHoSoTrongKhoTheoMaLK, mapHoTen);
    const wb = XLSX.utils.book_new();
    const daDung = new Set();
    theoPhanHe.forEach((rows, phan) => {
      if (!rows || !rows.length) return;
      const { ws, keys } = taoWorksheetXlsxTuCacDongDongGoc(rows);
      const name = genTenSheetXlsxDuyNhat(phan, daDung);
      const nRow = rows.length + 1;
      const nCol = Math.max(1, keys.length);
      const end = `${XLSX.utils.encode_col(nCol - 1)}${nRow}`;
      ws['!autofilter'] = { ref: `A1:${end}` };
      XLSX.utils.book_append_sheet(wb, ws, name);
    });
    if (wb.SheetNames.length === 0) {
      alert('Không tạo được sheet Excel (không có dòng dữ liệu).');
      return;
    }
    XLSX.writeFile(wb, `Bao_Cao_dong_goc_xml_theo_loi_loc_${Date.now()}.xlsx`);
  };

  const handleExportBaoCaoViPhamXml = async () => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') {
      alert('Xuất XML báo cáo vi phạm hiện hỗ trợ trên trình duyệt (web).');
      return;
    }
    if (rawDanhSach.length === 0) {
      alert('Chưa có hồ sơ kiểm tra.');
      return;
    }
    if (danhSachLoiChiTietSauLocXuat.length === 0) {
      alert('Không có dòng lỗi nào khớp bộ lọc hiện tại. Điều chỉnh lọc hoặc bấm «Xóa lọc» rồi thử lại.');
      return;
    }

    const mapHoTen = await layMapHoTenNhanSuChoXuatBaoCao();
    const theoPhanHe = taoCacDongXuatXmlGocSangNhomTheoPhanHe(danhSachLoiChiTietSauLocXuat, timHoSoTrongKhoTheoMaLK, mapHoTen);
    const phanDongKhoi = [];
    let sttG = 0;
    theoPhanHe.forEach((rows, phan) => {
      (rows || []).forEach((r) => {
        sttG += 1;
        const keysDong = sapXepKhoaCotCacDongXuat([r]);
        const cots = keysDong.map(
          (k) => `    <Cot an="${escapeXmlBaoCaoViPham(k)}">${escapeXmlBaoCaoViPham(ghepGiaTriOExcelTuTruongDong(r?.[k]))}</Cot>`,
        );
        phanDongKhoi.push(
          `  <Dong stt="${sttG}" bang_xml="${escapeXmlBaoCaoViPham(phan)}">\n${cots.join('\n')}\n  </Dong>`,
        );
      });
    });

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<BaoCaoViPhamQPS xmlns="urn:cdss-bhyt:bao-cao-vi-pham" phien_ban="1.0" tao_luc="${escapeXmlBaoCaoViPham(new Date().toISOString())}" so_dong="${sttG}">
  <GhiChu>Chỉ các dòng dữ liệu gốc XML tương ứng từng cảnh báo (bảng XML2, XML3, …) sau lọc; cột _XUAT_* là phần cảnh báo/lỗi tham chiếu (BS: Họ tên (Số CCHN) từ DM nhân sự; _XUAT_PC/_XUAT_MA_BN = MA_BN XML1 cho lỗi thuốc XML2).</GhiChu>
${phanDongKhoi.join('\n')}
</BaoCaoViPhamQPS>
`;

    try {
      const blob = new Blob([xml], { type: 'application/xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Bao_Cao_dong_goc_xml_theo_loi_loc_${Date.now()}.xml`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      alert(`Không xuất được XML: ${e?.message || e}`);
    }
  };

  const xuLyDangXuat = async () => {
    await xoaPhienDangNhap();
    navigation.replace('DangNhap');
  };

  // ===========================================================
  // RENDER MODULE CARDS (lưới điều hướng)
  // ===========================================================
  const MODULE_ICONS = {
    MOD_HELPER: { icon: '🧰', mau: '#1565C0', mauNhat: '#E3F2FD' },
    MOD_KHO_LUU_TRU: { icon: '🗄️', mau: '#6A1B9A', mauNhat: '#F3E5F5' },
    MOD_XML_GIAM_DINH: { icon: '🗂️', mau: '#00695C', mauNhat: '#E0F2F1' },
    MOD_CONG_HIS: { icon: '🔌', mau: '#006064', mauNhat: '#E0F7FA' },
    MOD_CHUYEN_MON: { icon: '🧠', mau: '#E65100', mauNhat: '#FFF3E0' },
    MOD_THU_VIEN: { icon: '📚', mau: '#5D4037', mauNhat: '#EFEBE9' },
    MOD_TRO_LY_TRI_THUC: { icon: '🤖', mau: '#00695C', mauNhat: '#E0F2F1' },
    MOD_TRI_THUC_GD: { icon: '🧩', mau: '#4527A0', mauNhat: '#EDE7F6' },
    MOD_DANH_MUC: { icon: '📋', mau: '#558B2F', mauNhat: '#F1F8E9' },
    MOD_MAPPING_DM: { icon: '🔗', mau: '#558B2F', mauNhat: '#E8F5E9' },
    MOD_DANH_MUC_BYT: { icon: '🏥', mau: '#0277BD', mauNhat: '#E1F5FE' },
    MOD_QUAN_LY_LUAT: { icon: '⚙️', mau: '#8E24AA', mauNhat: '#F3E5F5' },
    MOD_QUY_TAC_ON_OFF: { icon: '🎚️', mau: '#AD1457', mauNhat: '#FCE4EC' },
    MOD_BAO_CAO_THONG_KE: { icon: '📊', mau: '#00838F', mauNhat: '#E0F7FA' },
    MOD_ACL: { icon: '🔐', mau: '#4E342E', mauNhat: '#EFEBE9' },
  };

  const menuTriThucPopup = IDS_TRI_THUC_POPUP.map((id) => menuHienThi.find((m) => m.id === id)).filter(Boolean);
  const menuSidebar = menuHienThi.filter((m) => !IDS_TRI_THUC_POPUP.includes(m.id));

  const moPopupTriThuc = () => {
    if (menuTriThucPopup.length === 0) return;
    const coTroLy = menuTriThucPopup.some((m) => m.id === 'MOD_TRO_LY_TRI_THUC');
    const coGd = menuTriThucPopup.some((m) => m.id === 'MOD_TRI_THUC_GD');
    setTriThucModalPhan(coTroLy && !coGd ? 'chat' : 'menu');
    animTriThucBackdrop.setValue(0);
    animTriThucPanel.setValue(0);
    setPopupTriThucVisible(true);
    requestAnimationFrame(() => {
      Animated.parallel([
        Animated.timing(animTriThucBackdrop, {
          toValue: 1,
          duration: 240,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(animTriThucPanel, {
          toValue: 1,
          friction: 8,
          tension: 68,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const dongPopupTriThuc = (sauKhiDong) => {
    Animated.parallel([
      Animated.timing(animTriThucBackdrop, {
        toValue: 0,
        duration: 200,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(animTriThucPanel, {
        toValue: 0,
        duration: 200,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        setPopupTriThucVisible(false);
        setTriThucModalPhan('menu');
        sauKhiDong?.();
      }
    });
  };

  const diChuyenTriThuc = (route) => {
    dongPopupTriThuc(() => navigation.navigate(route));
  };

  const phanTramLoi = thongKe.tong > 0 ? Math.round((thongKe.loi / thongKe.tong) * 100) : 0;
  const danhSachKpi = [
    { label: 'Tổng hồ sơ', value: thongKe.tong, icon: '📁', mau: '#1565C0', mauNhat: '#E3F2FD' },
    { label: 'Hợp lệ', value: thongKe.sach, icon: '✅', mau: '#2E7D32', mauNhat: '#E8F5E9' },
    { label: 'Có lỗi', value: thongKe.loi, icon: '⚠️', mau: '#C62828', mauNhat: '#FFEBEE' },
    { label: 'Tỉ lệ lỗi', value: `${phanTramLoi}%`, icon: '📊', mau: '#E65100', mauNhat: '#FFF3E0' },
  ];

  return (
    <SafeAreaView style={styles.vung_an_toan}>

      {/* ── 1. HEADER GRADIENT ── */}
      <View style={styles.header}>
        <View style={styles.header_main_row}>
          <View style={styles.header_left}>
            <Image source={{ uri: LOGO_PC }} style={styles.logo} resizeMode="contain" />
            <View>
              <Text style={styles.header_ten_bv}>BỆNH VIỆN QUỐC TẾ PHƯƠNG CHÂU</Text>
              <Text style={styles.header_sub}>Hệ thống hỗ trợ kiểm tra hồ sơ BHYT · QĐ 130</Text>
            </View>
          </View>
          <View style={styles.header_right}>
            <View style={styles.header_account_row}>
              <View style={styles.user_badge}>
                <Text style={styles.user_badge_icon}>👤</Text>
                <View>
                  <Text style={styles.user_badge_name}>{tenTaiKhoan || 'Chưa đăng nhập'}</Text>
                  <Text style={[styles.user_badge_role, vaiTroHienTai === 'ADMIN' && { color: '#FFD54F' }]}>
                    {vaiTroHienTai}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.btn_doi_mk}
                onPress={() => navigation.navigate('DoiMatKhau', { batBuoc: false })}
              >
                <Text style={styles.btn_doi_mk_txt}>🔑 Đổi mật khẩu</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btn_logout} onPress={xuLyDangXuat}>
                <Text style={styles.btn_logout_txt}>⏻ Đăng xuất</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.kpi_row}>
              {danhSachKpi.map((kpi, i) => (
                <View key={i} style={[styles.kpi_card, { borderTopColor: kpi.mau }]}>
                  <View style={[styles.kpi_icon_wrap, { backgroundColor: kpi.mauNhat }]}>
                    <Text style={styles.kpi_icon}>{kpi.icon}</Text>
                  </View>
                  <View style={styles.kpi_text_block}>
                    <Text style={[styles.kpi_value, { color: kpi.mau }]}>{kpi.value}</Text>
                    <Text style={styles.kpi_label}>{kpi.label}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>

      <View style={[styles.dashboard_layout, dungSidebarTrai ? styles.dashboard_layout_row : styles.dashboard_layout_col]}>
        <View style={[
          styles.sidebar_dashboard,
          dungSidebarTrai
            ? { width: rongSidebarDash }
            : styles.sidebar_dashboard_compact,
          panelUi[PANEL_TONG_QUAN.DIEU_HUONG].an && styles.panel_card_collapsed,
          panelUi[PANEL_TONG_QUAN.DIEU_HUONG].an && !dungSidebarTrai && { maxHeight: undefined },
          stylePanelGhim(panelUi[PANEL_TONG_QUAN.DIEU_HUONG].ghim),
        ]}>
          <View style={styles.sidebar_header}>
            <View style={[styles.sidebar_header_accent, { backgroundColor: CD.brand.mauChinh }]} />
            <View style={styles.sidebar_header_inner}>
              <ThanhDieuKhienPanel
                tieuDe="Điều hướng"
                phuDe="Module nghiệp vụ"
                an={panelUi[PANEL_TONG_QUAN.DIEU_HUONG].an}
                ghim={panelUi[PANEL_TONG_QUAN.DIEU_HUONG].ghim}
                onToggleAn={() => chuyenTrangThaiAnPanel(PANEL_TONG_QUAN.DIEU_HUONG)}
                onToggleGhim={() => chuyenTrangThaiGhimPanel(PANEL_TONG_QUAN.DIEU_HUONG)}
              />
            </View>
          </View>
          {panelUi[PANEL_TONG_QUAN.DIEU_HUONG].an ? (
            <View style={styles.panel_collapsed_body}>
              <Text style={styles.panel_collapsed_hint}>Thẻ điều hướng đang ẩn — bấm 👁 để mở lại.</Text>
            </View>
          ) : (
            <>
          {Platform.OS === 'web' ? (
            <View style={styles.sidebar_hint_pill}>
              <Text style={styles.sidebar_hint_bullet}>●</Text>
              <Text style={styles.sidebar_hint_web}>
                Chuột phải thẻ → tab mới · Click trái → tab hiện tại
              </Text>
            </View>
          ) : null}
          <KhuVucCuonCoThanhCuon style={styles.sidebar_scroll}>
            <View style={styles.module_grid_sidebar}>
              {menuSidebar.map((item) => {
                const cfg = MODULE_ICONS[item.id] || { icon: '📦', mau: '#607D8B', mauNhat: '#ECEFF1' };
                return (
                  <View
                    key={item.id}
                    {...Platform.select({
                      web: {
                        onContextMenu: (e) => {
                          e?.preventDefault?.();
                          e?.stopPropagation?.();
                          dieuHuongMoTabMoi(navigation, item.route);
                        },
                      },
                      default: {},
                    })}
                  >
                    <Pressable
                      accessibilityRole="button"
                      style={({ pressed, hovered }) => [
                        styles.module_card_sidebar_item,
                        { borderLeftColor: cfg.mau },
                        Platform.OS === 'web' && hovered && styles.module_card_sidebar_item_hover,
                        pressed && styles.module_card_sidebar_item_pressed,
                      ]}
                      onPress={() => navigation.navigate(item.route)}
                    >
                      <View style={[styles.module_icon_wrap_sidebar, { backgroundColor: cfg.mauNhat }]}>
                        <Text style={styles.module_icon_sidebar}>{cfg.icon}</Text>
                      </View>
                      <View style={styles.module_text_block}>
                        <Text style={styles.module_name_sidebar} numberOfLines={2}>
                          {item.ten}
                        </Text>
                      </View>
                      <Text style={[styles.module_chevron, { color: cfg.mau }]}>›</Text>
                    </Pressable>
                  </View>
                );
              })}
              <View style={styles.sidebar_section_gap}>
                <View style={styles.sidebar_divider}>
                  <View style={styles.sidebar_divider_line} />
                  <Text style={styles.sidebar_divider_label}>Tiện ích</Text>
                  <View style={styles.sidebar_divider_line} />
                </View>
                <Pressable
                  accessibilityRole="button"
                  style={({ pressed, hovered }) => [
                    styles.module_card_sidebar_secondary,
                    Platform.OS === 'web' && hovered && styles.module_card_sidebar_secondary_hover,
                    pressed && styles.module_card_sidebar_item_pressed,
                  ]}
                  onPress={handleResetKho}
                >
                  <View style={[styles.module_icon_wrap_sidebar, styles.module_icon_wrap_secondary]}>
                    <Text style={styles.module_icon_sidebar}>🔄</Text>
                  </View>
                  <View style={styles.module_text_block}>
                    <Text style={styles.module_name_sidebar_secondary}>Làm mới kho</Text>
                    <Text style={styles.module_hint_secondary}>Đồng bộ lại dữ liệu cục bộ</Text>
                  </View>
                </Pressable>
              </View>
            </View>
          </KhuVucCuonCoThanhCuon>
            </>
          )}
        </View>

        <KhuVucCuonCoThanhCuon style={styles.dashboard_main}>

        {/* ── 4. KHU VỰC VẬN HÀNH THỐNG NHẤT (thẻ nạp gọn) ── */}
        <View style={[styles.section_block, styles.section_block_import_tight]}>
          <View style={styles.import_section_head_row}>
            <View style={{ flex: 1, minWidth: 120 }}>
              <Text style={styles.import_section_title}>Luồng kiểm tra tổng quát</Text>
              <Text style={styles.import_section_sub} numberOfLines={1}>
                Nạp hồ sơ ở đây; cấu hình Python/Hybrid ở Helper.
              </Text>
            </View>
            <Pressable
              onPress={() => setImportCardMoChiTietKt((v) => !v)}
              style={({ pressed, hovered }) => [
                styles.import_toggle_chip,
                Platform.OS === 'web' && hovered && styles.import_toggle_chip_hover,
                pressed && { opacity: 0.75 },
              ]}
            >
              <Text style={styles.import_toggle_chip_txt}>
                {importCardMoChiTietKt ? '▼ Ẩn mô tả' : 'ⓘ Mô tả kỹ thuật'}
              </Text>
            </Pressable>
          </View>
          <View style={styles.import_zone}>
            {dangTai ? (
              <View style={styles.loading_wrap}>
                <ActivityIndicator size="large" color="#D81B60" />
                <Text style={styles.loading_txt}>{thongBaoDangTai}</Text>
              </View>
            ) : (
              <View style={styles.import_inner}>
                <View style={styles.import_card_compact}>
                  <View style={styles.import_hero_row}>
                    <View style={styles.import_hero_lead}>
                      <Text style={styles.audit_engine_title_compact}>Nạp hồ sơ XML</Text>
                      <Text style={styles.import_tagline} numberOfLines={1}>
                        Lô hồ sơ · V15 · Hybrid qua Helper
                      </Text>
                      <View style={styles.python_badge_line}>
                        <View
                          style={[
                            styles.python_badge_dot,
                            !trangThaiPythonKhoiDong.daKiemTra && styles.python_badge_dot_checking,
                            trangThaiPythonKhoiDong.daKiemTra && trangThaiPythonKhoiDong.ok && styles.python_badge_dot_ok,
                            trangThaiPythonKhoiDong.daKiemTra && !trangThaiPythonKhoiDong.ok && styles.python_badge_dot_err,
                          ]}
                        />
                        <Text
                          style={styles.python_badge_txt}
                          numberOfLines={importCardMoChiTietKt ? 4 : 1}
                        >
                          {trangThaiPythonKhoiDong.daKiemTra
                            ? (trangThaiPythonKhoiDong.ok
                              ? `Python: kết nối OK${trangThaiPythonKhoiDong.baseUrl ? ` · ${trangThaiPythonKhoiDong.baseUrl}` : ''}`
                              : `Python: chưa kết nối — ${trangThaiPythonKhoiDong.chiTiet || 'kiểm tra VPN/cổng'}${trangThaiPythonKhoiDong.baseUrl ? ` · ${trangThaiPythonKhoiDong.baseUrl}` : ''}`)
                            : 'Python: đang kiểm tra…'}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.import_hero_actions}>
                      <NhapFileXML
                        onDuLieuSanSang={nhanDienHoSoTuFile}
                        styleButton={styles.import_pick_btn_sm}
                        textButton="Chọn XML"
                      />
                      <TouchableOpacity style={styles.helper_redirect_btn_tight} onPress={() => navigation.navigate('Helper')}>
                        <Text style={styles.helper_redirect_txt_tight}>Helper</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  {importCardMoChiTietKt ? (
                    <View style={styles.import_kt_block}>
                      <Text style={styles.import_kt_paragraph}>
                        Kiểm tra nhiều hồ sơ một lần. JS dùng pipeline V15; Python tùy cấu hình Helper — fallback vẫn V15.
                      </Text>
                      <View style={styles.import_chips_tight_row}>
                        <View style={styles.import_chip_tight}>
                          <Text style={styles.import_chip_tight_txt}>Batch</Text>
                        </View>
                        <View style={styles.import_chip_tight}>
                          <Text style={styles.import_chip_tight_txt}>Fallback = V15</Text>
                        </View>
                        <View style={styles.import_chip_tight}>
                          <Text style={styles.import_chip_tight_txt}>Hybrid → Helper</Text>
                        </View>
                      </View>
                    </View>
                  ) : null}

                  {Platform.OS === 'web' ? (
                    <View style={styles.import_nangcao_block}>
                      <Pressable
                        onPress={() => setImportCardMoNangCao((v) => !v)}
                        style={({ pressed, hovered }) => [
                          styles.import_nangcao_head,
                          Platform.OS === 'web' && hovered && styles.import_nangcao_head_hover,
                          pressed && { opacity: 0.8 },
                        ]}
                      >
                        <Text style={styles.import_nangcao_head_txt}>
                          {importCardMoNangCao ? '▼' : '▶'} Thư mục — chạy tự động
                        </Text>
                        {logGiamDinhTuDongThuMuc.length > 0 ? (
                          <View style={styles.import_log_badge}>
                            <Text style={styles.import_log_badge_txt}>{logGiamDinhTuDongThuMuc.length}</Text>
                          </View>
                        ) : null}
                      </Pressable>
                      {importCardMoNangCao ? (
                        <View style={styles.import_nangcao_body}>
                          <Text style={styles.import_nangcao_one_line} numberOfLines={3}>
                            Chọn thư mục chứa .xml, xử lý lần lượt; nhật ký hiển thị tại đây (Python nếu bật, JS V15 nếu fallback).
                          </Text>
                          <TouchableOpacity
                            style={[styles.import_folder_btn, dangTai && styles.import_folder_btn_disabled]}
                            onPress={chayGiamDinhTuDongTrenThuMuc}
                            disabled={dangTai}
                          >
                            <Text style={styles.import_folder_btn_txt}>Chọn thư mục</Text>
                          </TouchableOpacity>
                          {logGiamDinhTuDongThuMuc.length > 0 ? (
                            <View style={styles.import_auto_folder_log}>
                              <View style={styles.import_auto_folder_log_header}>
                                <Text style={styles.import_auto_folder_log_title}>Nhật ký</Text>
                                <TouchableOpacity onPress={() => setLogGiamDinhTuDongThuMuc([])}>
                                  <Text style={styles.import_auto_folder_clear}>Xóa</Text>
                                </TouchableOpacity>
                              </View>
                              <ScrollView style={styles.import_auto_folder_scroll_compact} nestedScrollEnabled>
                                {logGiamDinhTuDongThuMuc.map((line, idx) => (
                                  <Text key={`log-${idx}`} style={styles.import_auto_folder_line}>
                                    {line}
                                  </Text>
                                ))}
                              </ScrollView>
                            </View>
                          ) : null}
                        </View>
                      ) : null}
                    </View>
                  ) : null}
                </View>
              </View>
            )}
          </View>
        </View>

        {/* ── 5. BẢNG VI PHẠM QPS ── */}
        <View style={[styles.section_block, { marginBottom: 30 }]}>
          <View style={styles.workspace_header}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text style={styles.section_title}>📉 Danh mục vi phạm phát hiện (QPS)</Text>
              <Text style={styles.section_note}>Thứ tự ưu tiên đã chuẩn hóa theo vận hành thực tế: Xuất toán trước, cảnh báo sau, nhắc nhở cuối. Chạm từng quy tắc để mở danh sách XML phát sinh và xử lý trực tiếp.</Text>
            </View>
            <View style={styles.export_btns}>
              <TouchableOpacity style={[styles.btn_export, { backgroundColor: '#0277BD' }]} onPress={handleConvertXmlToExcel}>
                <Text style={styles.btn_export_txt}>🔄 XML → Excel</Text>
              </TouchableOpacity>
              {thongKe.danhMuc.length > 0 && (
                <>
                  <TouchableOpacity style={[styles.btn_export, { backgroundColor: '#2E7D32' }]} onPress={() => { void handleExportLoiExcel(); }}>
                    <Text style={styles.btn_export_txt}>📥 Excel (dòng XML gốc)</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.btn_export, { backgroundColor: '#00695C' }]} onPress={() => { void handleExportBaoCaoViPhamXml(); }}>
                    <Text style={styles.btn_export_txt}>📄 XML (dòng XML gốc)</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>

          <View style={[
            styles.rule_filter_panel,
            panelUi[PANEL_TONG_QUAN.LOC_QPS].an && styles.panel_card_collapsed,
            stylePanelGhim(panelUi[PANEL_TONG_QUAN.LOC_QPS].ghim),
          ]}>
            <View style={styles.rule_filter_panel_head}>
              <ThanhDieuKhienPanel
                tieuDe="Bộ lọc vi phạm"
                phuDe="Ưu tiên · nhóm NV · loại KCB · khoa · ICD-10"
                an={panelUi[PANEL_TONG_QUAN.LOC_QPS].an}
                ghim={panelUi[PANEL_TONG_QUAN.LOC_QPS].ghim}
                onToggleAn={() => chuyenTrangThaiAnPanel(PANEL_TONG_QUAN.LOC_QPS)}
                onToggleGhim={() => chuyenTrangThaiGhimPanel(PANEL_TONG_QUAN.LOC_QPS)}
              />
            </View>
            {panelUi[PANEL_TONG_QUAN.LOC_QPS].an ? (
              <Text style={styles.panel_collapsed_hint_dark}>
                Bộ lọc đang ẩn — bấm 👁 trên thanh tiêu đề để hiện lại.
              </Text>
            ) : (
            <>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled
              style={styles.rule_filter_scroll}
              contentContainerStyle={styles.rule_filter_scroll_content}
            >
              <View style={styles.rule_filter_group}>
                <Text style={styles.rule_filter_group_label} numberOfLines={1}>Ưu tiên</Text>
                <View style={styles.rule_filter_chips_wrap}>
                  {[
                    { id: 'TAT_CA', label: 'Tất cả' },
                    { id: 'XUAT_TOAN', label: 'Xuất toán' },
                    { id: 'CAU_TRUC_XML', label: 'Vi phạm cấu trúc XML' },
                    { id: 'CANH_BAO', label: 'Cảnh báo' },
                    { id: 'NHAC_NHO', label: 'Nhắc nhở' },
                  ].map((boLoc) => (
                    <TouchableOpacity
                      key={boLoc.id}
                      style={[
                        styles.rule_filter_chip,
                        boLocLoaiUuTien === boLoc.id && styles.rule_filter_chip_active,
                      ]}
                      onPress={() => setBoLocLoaiUuTien(boLoc.id)}
                    >
                      <Text style={[
                        styles.rule_filter_chip_txt,
                        boLocLoaiUuTien === boLoc.id && styles.rule_filter_chip_txt_active,
                      ]} numberOfLines={2}>
                        {boLoc.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <View style={styles.rule_filter_group_sep} />
              <View style={styles.rule_filter_group}>
                <Text style={styles.rule_filter_group_label} numberOfLines={2}>Nhóm nghiệp vụ (XML & lỗi)</Text>
                <View style={styles.rule_filter_chips_wrap}>
                  {DANH_SACH_NHOM_VI_PHAM_LOC.map((nhom) => (
                    <TouchableOpacity
                      key={`nhom_${nhom.id}`}
                      style={[
                        styles.rule_filter_chip,
                        styles.rule_filter_chip_nhom,
                        boLocNhomViPham === nhom.id && styles.rule_filter_chip_active,
                      ]}
                      onPress={() => setBoLocNhomViPham(nhom.id)}
                    >
                      <Text style={[
                        styles.rule_filter_chip_txt,
                        boLocNhomViPham === nhom.id && styles.rule_filter_chip_txt_active,
                      ]} numberOfLines={2}>
                        {nhom.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <View style={styles.rule_filter_group_sep} />
              <View style={[styles.rule_filter_group, styles.rule_filter_group_wide]}>
                <Text style={styles.rule_filter_group_label} numberOfLines={2}>Loại KCB (QĐ 824 / MA_LOAI_KCB)</Text>
                <View style={styles.rule_filter_chips_wrap}>
                  {DANH_SACH_NHOM_CAP_LOAI_KCB_LOC.map((opt) => (
                    <TouchableOpacity
                      key={`caplk_${opt.id}`}
                      style={[
                        styles.rule_filter_chip,
                        styles.rule_filter_chip_nhom,
                        boLocNhomCapLoaiKcb === opt.id && styles.rule_filter_chip_active,
                      ]}
                      onPress={() => setBoLocNhomCapLoaiKcb(opt.id)}
                    >
                      <Text style={[
                        styles.rule_filter_chip_txt,
                        boLocNhomCapLoaiKcb === opt.id && styles.rule_filter_chip_txt_active,
                      ]} numberOfLines={3}>
                        {opt.label}{opt.phu ? `\n(${opt.phu})` : ''}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <View style={styles.rule_filter_group_sep} />
              <View style={[styles.rule_filter_group, styles.rule_filter_group_khoa]}>
                <Text style={styles.rule_filter_group_label} numberOfLines={1}>Khoa (MA_KHOA)</Text>
                <View style={styles.rule_filter_chips_wrap}>
                  <TouchableOpacity
                    style={[
                      styles.rule_filter_chip,
                      styles.rule_filter_chip_nhom,
                      boLocMaKhoa === NHOM_VI_PHAM_TAT_CA && styles.rule_filter_chip_active,
                    ]}
                    onPress={() => setBoLocMaKhoa(NHOM_VI_PHAM_TAT_CA)}
                  >
                    <Text style={[
                      styles.rule_filter_chip_txt,
                      boLocMaKhoa === NHOM_VI_PHAM_TAT_CA && styles.rule_filter_chip_txt_active,
                    ]} numberOfLines={2}>Tất cả khoa</Text>
                  </TouchableOpacity>
                  {thaKhoaTuDuLieu.map((opt) => (
                    <TouchableOpacity
                      key={`khoa_${opt.id}`}
                      style={[
                        styles.rule_filter_chip,
                        styles.rule_filter_chip_nhom,
                        boLocMaKhoa === opt.id && styles.rule_filter_chip_active,
                      ]}
                      onPress={() => setBoLocMaKhoa(opt.id)}
                    >
                      <Text style={[
                        styles.rule_filter_chip_txt,
                        boLocMaKhoa === opt.id && styles.rule_filter_chip_txt_active,
                      ]} numberOfLines={2}>{opt.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <View style={styles.rule_filter_group_sep} />
              <View style={[styles.rule_filter_group, styles.rule_filter_group_icd]}>
                <Text style={styles.rule_filter_group_label} numberOfLines={2}>
                  ICD-10 (TT 06 & lỗi liên quan)
                </Text>
                <Text style={styles.rule_filter_section_hint} numberOfLines={1}>
                  {PHIEN_BAN_ICD10_TT06}
                </Text>
                <View style={styles.rule_filter_chips_wrap}>
                  {BO_LOC_ICD10_VI_PHAM.map((opt) => {
                    const active = boLocIcd10 === opt.id;
                    const dem = demIcd10TheoBoLoc[opt.id];
                    return (
                      <TouchableOpacity
                        key={`icd10_${opt.id || 'tat-ca'}`}
                        style={[
                          styles.rule_filter_chip,
                          styles.rule_filter_chip_icd,
                          active && styles.rule_filter_chip_active,
                          opt.nhom === 'TT06' && styles.rule_filter_chip_icd_tt06,
                        ]}
                        onPress={() => setBoLocIcd10(opt.id)}
                      >
                        <Text style={[
                          styles.rule_filter_chip_txt,
                          active && styles.rule_filter_chip_txt_active,
                        ]} numberOfLines={2}>
                          {opt.label}
                          {dem != null ? ` (${dem})` : ''}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </ScrollView>
            <View style={styles.rule_filter_input_row}>
              <TextInput
                style={styles.rule_filter_input}
                value={tuKhoaLocQuyTac}
                onChangeText={setTuKhoaLocQuyTac}
                placeholder="Lọc theo mã luật / tên quy tắc"
                placeholderTextColor={CD.text.placeholder}
              />
              <TextInput
                style={styles.rule_filter_input}
                value={tuKhoaLocHoSo}
                onChangeText={setTuKhoaLocHoSo}
                placeholder="Lọc theo mã hồ sơ / bệnh nhân"
                placeholderTextColor={CD.text.placeholder}
              />
              {coBoLocDangBat ? (
                <TouchableOpacity
                  style={styles.rule_filter_clear_btn}
                  onPress={() => {
                    setBoLocLoaiUuTien('TAT_CA');
                    setBoLocNhomViPham(NHOM_VI_PHAM_TAT_CA);
                    setBoLocNhomCapLoaiKcb(NHOM_VI_PHAM_TAT_CA);
                    setBoLocMaKhoa(NHOM_VI_PHAM_TAT_CA);
                    setBoLocIcd10(BO_LOC_ICD10_VI_PHAM_TAT_CA);
                    setTuKhoaLocQuyTac('');
                    setTuKhoaLocHoSo('');
                  }}
                >
                  <Text style={styles.rule_filter_clear_txt}>Xóa lọc</Text>
                </TouchableOpacity>
              ) : null}
            </View>
            <Text style={styles.rule_filter_status}>
              Hiển thị {danhMucDaLoc.length}/{thongKe.danhMuc.length} quy tắc · {danhSachLoiChiTietSauLocXuat.length} dòng lỗi khớp lọc (Excel/XML)
            </Text>
            </>
            )}
          </View>

          <View style={styles.table_card}>
            {/* Header bảng */}
            <View style={styles.table_head_row}>
              <Text style={[styles.th, { flex: 1 }]}>QUY TẮC & MÔ TẢ</Text>
              <Text style={[styles.th, { width: 110, textAlign: 'center' }]}>SỐ CA</Text>
            </View>
            {/* Rows */}
            {danhMucDaLoc.length > 0 ? danhMucDaLoc.map((item, idx) => (
              <View
                key={item.khoa || idx}
                {...Platform.select({
                  web: {
                    onContextMenu: (e) => {
                      e?.preventDefault?.();
                      e?.stopPropagation?.();
                      moModalChiTietHoSoLoiTheoQuyTac(item);
                    },
                  },
                  default: {},
                })}
              >
                <TouchableOpacity
                  style={[
                    styles.table_row,
                    idx % 2 === 1 && styles.table_row_alt,
                    quyTacDangChon?.khoa === item.khoa && styles.table_row_active,
                  ]}
                  onPress={() => setKhoaQuyTacDangChon(item.khoa)}
                  onLongPress={() => moModalChiTietHoSoLoiTheoQuyTac(item)}
                  delayLongPress={480}
                >
                  <View style={{ flex: 1, paddingRight: 12 }}>
                    <View style={styles.rule_tag_row}>
                      <View style={styles.rule_code_chip}>
                        <Text style={styles.rule_code_txt}>{item.ma_luat || 'N/A'}</Text>
                      </View>
                      <Text style={styles.rule_name} numberOfLines={1}>{item.ten_quy_tac}</Text>
                    </View>
                    <View style={styles.rule_meta_chip_row}>
                      <View style={[
                        styles.rule_priority_chip,
                        item.loai_hien_thi === 'XUAT_TOAN' && styles.rule_priority_chip_xuat_toan,
                        item.loai_hien_thi === 'CAU_TRUC_XML' && styles.rule_priority_chip_cau_truc_xml,
                        item.loai_hien_thi === 'CANH_BAO' && styles.rule_priority_chip_canh_bao,
                        item.loai_hien_thi === 'NHAC_NHO' && styles.rule_priority_chip_nhac_nho,
                      ]}>
                        <Text style={styles.rule_priority_chip_txt}>{item.nhan_loai_hien_thi}</Text>
                      </View>
                      <Text style={styles.rule_occurrence_meta}>Hồ sơ ảnh hưởng: {item.so_ho_so}</Text>
                    </View>
                    <Text style={styles.rule_desc} numberOfLines={2}>{item.canh_bao}</Text>
                    {item.namespace_quy_tac && item.namespace_quy_tac !== 'N/A' ? (
                      <Text style={styles.rule_meta} numberOfLines={1}>Namespace: {item.namespace_quy_tac}</Text>
                    ) : null}
                    {item.nguon_quy_tac && item.nguon_quy_tac !== 'N/A' ? (
                      <Text style={styles.rule_meta_subtle} numberOfLines={1}>Nguồn: {item.nguon_quy_tac}</Text>
                    ) : null}
                    {item.luong_giai_trinh && item.luong_giai_trinh !== 'N/A' ? (
                      <Text style={styles.rule_flow} numberOfLines={2}>Luồng: {item.luong_giai_trinh}</Text>
                    ) : null}
                    <Text style={styles.rule_hint_action}>
                      Chạm để mở danh sách XML phát sinh và đi tới rule ON/OFF (mở «Sửa và lưu XML» chỉ để chỉnh tay sau khi bạn chọn).
                      {Platform.OS === 'web' ? ' · Chuột phải: truy vấn chi tiết ca.' : ' · Nhấn giữ: xem chi tiết ca.'}
                    </Text>
                  </View>
                  <View style={{ width: 110, alignItems: 'center' }}>
                    <View style={[styles.count_badge, item.sl >= 10 && styles.count_badge_hot]}>
                      <Text style={styles.count_txt}>{item.sl}</Text>
                      <Text style={styles.count_sub}>ca</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            )) : (
              <View style={styles.empty_state}>
                <Text style={styles.empty_icon}>📂</Text>
                <Text style={styles.empty_title}>{thongKe.danhMuc.length > 0 ? 'Không có quy tắc khớp bộ lọc' : 'Chưa có dữ liệu vi phạm'}</Text>
                <Text style={styles.empty_sub}>{thongKe.danhMuc.length > 0 ? 'Điều chỉnh bộ lọc để xem lại toàn bộ danh sách cảnh báo.' : 'Nạp hồ sơ XML để hệ thống tiến hành kiểm tra'}</Text>
              </View>
            )}
          </View>

          {quyTacDangChon ? (
            <View style={styles.rule_detail_panel}>
              <View style={styles.rule_detail_header}>
                <View style={{ flex: 1, paddingRight: 12 }}>
                  <Text style={styles.rule_detail_title}>{quyTacDangChon.ten_quy_tac || quyTacDangChon.ma_luat || 'Quy tắc đang chọn'}</Text>
                  <Text style={styles.rule_detail_subtitle}>{quyTacDangChon.ma_luat || 'N/A'} • {quyTacDangChon.nhan_loai_hien_thi} • {quyTacDangChon.sl} phát sinh / {quyTacDangChon.so_ho_so} hồ sơ</Text>
                </View>
                <TouchableOpacity
                  style={[styles.btn_export, styles.btn_rule_manage]}
                  onPress={() => moQuanTriQuyTacTheoLoi(quyTacDangChon.chi_tiet_phat_sinh[0] || quyTacDangChon)}
                >
                  <Text style={styles.btn_export_txt}>🎚 Mở Rule ON/OFF</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.rule_detail_note}>Mỗi dòng bên dưới liên kết trực tiếp đến XML phát sinh lỗi. Bạn có thể mở XML để rà soát, chuyển thẳng sang màn sửa để lưu bản XML hoàn chỉnh, hoặc mở đúng tab quản trị rule.</Text>
              {chiTietPhatSinhDaLocBoLoc.length === 0 ? (
                <View style={styles.rule_nhom_empty}>
                  <Text style={styles.rule_nhom_empty_txt}>Không có ca nào khớp nhóm đang chọn trong quy tắc này. Đặt «Tất cả» ở lọc nhóm nghiệp vụ hoặc chọn quy tắc khác.</Text>
                </View>
              ) : chiTietPhatSinhDaLocBoLoc.map((chiTiet, idx) => (
                <View key={taoKhoaChiTietPhatSinh(chiTiet) || idx} style={styles.rule_instance_card}>
                  <View style={styles.rule_instance_header}>
                    <View style={{ flex: 1, paddingRight: 12 }}>
                      <Text style={styles.rule_instance_title}>{chiTiet.ma_lk || 'N/A'} • {chiTiet.ten_bn || 'Không rõ bệnh nhân'}</Text>
                      <Text style={styles.rule_instance_location}>
                        {chiTiet.vi_tri_xml}{chiTiet.nhan_nhom_vi_pham ? ` • ${chiTiet.nhan_nhom_vi_pham}` : ''}
                      </Text>
                    </View>
                    <Text style={styles.rule_instance_tab}>{chiTiet.tab_quan_tri_goi_y || 'LUAT_HANH_CHINH'}</Text>
                  </View>
                  <Text style={styles.rule_instance_desc}>{chiTiet.canh_bao}</Text>
                  <View style={styles.rule_instance_actions}>
                    <TouchableOpacity style={[styles.rule_action_btn, styles.rule_action_btn_xml]} onPress={() => moChiTietXmlTheoLoi(chiTiet)}>
                      <Text style={styles.rule_action_btn_txt}>🗂 Mở XML lỗi</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.rule_action_btn, styles.rule_action_btn_edit]} onPress={() => moSuaXmlTheoLoi(chiTiet)}>
                      <Text style={styles.rule_action_btn_txt}>📝 Sửa và lưu XML</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.rule_action_btn, styles.rule_action_btn_rule]} onPress={() => moQuanTriQuyTacTheoLoi(chiTiet)}>
                      <Text style={styles.rule_action_btn_txt}>🎚 Đúng vị trí rule</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          ) : null}

          <View style={styles.rule_detail_panel}>
            <View style={styles.rule_detail_header}>
              <View style={{ flex: 1, paddingRight: 12 }}>
                <Text style={styles.rule_detail_title}>Tra cứu lỗi chi tiết toàn dashboard</Text>
                <Text style={styles.rule_detail_subtitle}>Truy vấn trực tiếp trên cùng nguồn dữ liệu lỗi đang dùng cho bảng quy tắc và báo cáo chi tiết, giúp số liệu và nội dung luôn khớp nhau.</Text>
              </View>
            </View>
            <View style={styles.rule_filter_chip_row}>
              {[
                { id: 'TAT_CA', label: 'Tất cả' },
                { id: 'XUAT_TOAN', label: 'Xuất toán' },
                { id: 'CAU_TRUC_XML', label: 'Vi phạm cấu trúc XML' },
                { id: 'CANH_BAO', label: 'Cảnh báo' },
                { id: 'NHAC_NHO', label: 'Nhắc nhở' },
              ].map((boLoc) => (
                <TouchableOpacity
                  key={`detail_${boLoc.id}`}
                  style={[
                    styles.rule_filter_chip,
                    loaiTraCuuChiTiet === boLoc.id && styles.rule_filter_chip_active,
                  ]}
                  onPress={() => setLoaiTraCuuChiTiet(boLoc.id)}
                >
                  <Text style={[
                    styles.rule_filter_chip_txt,
                    loaiTraCuuChiTiet === boLoc.id && styles.rule_filter_chip_txt_active,
                  ]}>{boLoc.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.rule_filter_input_row}>
              <TextInput
                style={styles.rule_filter_input}
                value={tuKhoaTraCuuChiTiet}
                onChangeText={setTuKhoaTraCuuChiTiet}
                placeholder="Tra cứu theo mã hồ sơ, bệnh nhân, mã luật, nội dung lỗi"
                placeholderTextColor={CD.text.placeholder}
              />
            </View>
            <Text style={styles.rule_filter_section_hint}>Áp dụng cùng bộ lọc nhóm nghiệp vụ, MA_LOAI_KCB và MA_KHOA như ô Lọc phía trên.</Text>
            <Text style={styles.rule_filter_status}>Khớp {ketQuaTraCuuChiTiet.length}/{danhSachLoiChiTietDashboard.length} lỗi chi tiết{ketQuaTraCuuChiTiet.length > ketQuaTraCuuChiTietHienThi.length ? ` • đang hiển thị ${ketQuaTraCuuChiTietHienThi.length} dòng đầu` : ''}</Text>

            {ketQuaTraCuuChiTietHienThi.length === 0 ? (
              <View style={styles.empty_state}>
                <Text style={styles.empty_icon}>🔎</Text>
                <Text style={styles.empty_title}>Không có lỗi khớp truy vấn</Text>
                <Text style={styles.empty_sub}>Thử đổi từ khóa hoặc loại ưu tiên để rà lại danh sách lỗi chi tiết.</Text>
              </View>
            ) : (
              ketQuaTraCuuChiTietHienThi.map((chiTiet, idx) => (
                <View key={chiTiet.khoa || idx} style={styles.rule_instance_card}>
                  <View style={styles.rule_instance_header}>
                    <View style={{ flex: 1, paddingRight: 12 }}>
                      <Text style={styles.rule_instance_title}>{chiTiet.ma_lk || 'N/A'} • {chiTiet.ten_bn || 'Không rõ bệnh nhân'}</Text>
                      <Text style={styles.rule_instance_location}>
                        {chiTiet.ma_luat || 'N/A'} • {chiTiet.vi_tri_xml}{chiTiet.nhan_nhom_vi_pham ? ` • ${chiTiet.nhan_nhom_vi_pham}` : ''}
                      </Text>
                    </View>
                    <Text style={styles.rule_instance_tab}>{chiTiet.tab_quan_tri_goi_y || 'LUAT_HANH_CHINH'}</Text>
                  </View>
                  <Text style={styles.rule_instance_desc}>{chiTiet.canh_bao}</Text>
                  <View style={styles.rule_instance_actions}>
                    <TouchableOpacity style={[styles.rule_action_btn, styles.rule_action_btn_xml]} onPress={() => moChiTietXmlTheoLoi(chiTiet)}>
                      <Text style={styles.rule_action_btn_txt}>🗂 Mở XML lỗi</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.rule_action_btn, styles.rule_action_btn_edit]} onPress={() => moSuaXmlTheoLoi(chiTiet)}>
                      <Text style={styles.rule_action_btn_txt}>📝 Sửa và lưu XML</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.rule_action_btn, styles.rule_action_btn_rule]} onPress={() => moQuanTriQuyTacTheoLoi(chiTiet)}>
                      <Text style={styles.rule_action_btn_txt}>🎚 Đúng vị trí rule</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        </View>

          {/* ── 6. CHỦ ĐỀ GIAO DIỆN ── */}
          <BoChonChuDe style={{ margin: 16, marginBottom: 16 }} />

          <ChanTrangUngDung style={{ marginBottom: 28 }} />

        </KhuVucCuonCoThanhCuon>
      </View>

      {menuTriThucPopup.length > 0 ? (
        <TouchableOpacity
          style={styles.tri_thuc_fab}
          onPress={moPopupTriThuc}
          activeOpacity={0.85}
          accessibilityLabel="Mở tri thức CDSS"
        >
          <Text style={styles.tri_thuc_fab_icon}>🤖</Text>
        </TouchableOpacity>
      ) : null}

      <Modal
        visible={popupTriThucVisible}
        transparent
        animationType="none"
        onRequestClose={dongPopupTriThuc}
      >
        <View style={styles.tri_thuc_modal_root}>
          <Pressable style={styles.tri_thuc_modal_hit} onPress={dongPopupTriThuc}>
            <Animated.View
              style={[
                styles.tri_thuc_modal_backdrop,
                {
                  opacity: animTriThucBackdrop.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 0.52],
                  }),
                },
              ]}
            />
          </Pressable>
          <Animated.View
            style={[
              styles.tri_thuc_modal_sheet,
              triThucModalPhan === 'chat' && styles.tri_thuc_modal_sheet_chat,
              {
                opacity: animTriThucPanel,
                transform: [
                  {
                    translateY: animTriThucPanel.interpolate({
                      inputRange: [0, 1],
                      outputRange: [36, 0],
                    }),
                  },
                  {
                    scale: animTriThucPanel.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.94, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            {triThucModalPhan === 'chat' ? (
              <KhungTroLyTriThucChat
                cheDoHienThi="cua_so"
                navigation={navigation}
                onQuayLaiMenu={() => setTriThucModalPhan('menu')}
                onDong={() => dongPopupTriThuc()}
              />
            ) : (
              <>
                <View style={styles.tri_thuc_modal_grab} />
                <View style={styles.tri_thuc_modal_header}>
                  <Text style={styles.tri_thuc_modal_title}>Tri thức CDSS</Text>
                  <TouchableOpacity onPress={() => dongPopupTriThuc()} style={styles.tri_thuc_modal_close}>
                    <Text style={styles.tri_thuc_modal_close_txt}>✕</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.tri_thuc_modal_sub}>
                  Trích từ Thư viện, Chuyên môn, Danh mục nội bộ, Quy tắc luật — nội bộ, không tra web.
                </Text>
                {menuTriThucPopup.map((item) => {
                  const cfg = MODULE_ICONS[item.id] || { icon: '📦', mau: '#607D8B', mauNhat: '#ECEFF1' };
                  const label =
                    item.id === 'MOD_TRO_LY_TRI_THUC'
                      ? 'Trợ lý tri thức (RAG)'
                      : item.id === 'MOD_TRI_THUC_GD'
                        ? 'Tri thức từ kiểm tra'
                        : item.ten;
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[styles.tri_thuc_modal_row, { borderLeftColor: cfg.mau }]}
                      onPress={() => {
                        if (item.id === 'MOD_TRO_LY_TRI_THUC') {
                          setTriThucModalPhan('chat');
                        } else {
                          diChuyenTriThuc(item.route);
                        }
                      }}
                      activeOpacity={0.82}
                    >
                      <View style={[styles.tri_thuc_modal_row_icon, { backgroundColor: cfg.mauNhat }]}>
                        <Text style={styles.tri_thuc_modal_row_emoji}>{cfg.icon}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.tri_thuc_modal_row_title}>{label}</Text>
                        <Text style={styles.tri_thuc_modal_row_hint} numberOfLines={3}>
                          {item.id === 'MOD_TRO_LY_TRI_THUC'
                            ? 'Chat RAG: Thư viện, chuyên môn, danh mục nội bộ, quy tắc luật + tri thức đã lưu'
                            : 'Bài học và xác nhận đúng/sai cảnh báo từ ca kiểm tra (màn riêng)'}
                        </Text>
                      </View>
                      <Text style={styles.tri_thuc_modal_row_chev}>→</Text>
                    </TouchableOpacity>
                  );
                })}
              </>
            )}
          </Animated.View>
        </View>
      </Modal>

      <Modal
        visible={modalChiTietHoSoLoiVisible && !!quyTacChoModalChiTiet}
        transparent
        animationType="fade"
        onRequestClose={dongModalChiTietHoSoLoi}
      >
        <View style={styles.chiTietLoiModal_root} pointerEvents="box-none">
          <Pressable style={styles.chiTietLoiModal_backdropHit} onPress={dongModalChiTietHoSoLoi}>
            <View style={styles.chiTietLoiModal_backdrop} />
          </Pressable>
          <View style={styles.chiTietLoiModal_sheet}>
            <View style={styles.chiTietLoiModal_header}>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={styles.chiTietLoiModal_title}>Chi tiết hồ sơ lỗi</Text>
                <Text style={styles.chiTietLoiModal_sub} numberOfLines={2}>
                  {quyTacChoModalChiTiet?.ma_luat || 'N/A'} · {quyTacChoModalChiTiet?.ten_quy_tac || ''}
                </Text>
              </View>
              <TouchableOpacity onPress={dongModalChiTietHoSoLoi} style={styles.chiTietLoiModal_close} accessibilityLabel="Đóng cửa sổ chi tiết">
                <Text style={styles.chiTietLoiModal_closeTxt}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.chiTietLoiModal_hint}>
              Truy vấn từng ca (cùng nguồn với bảng quy tắc). Hệ thống không sửa XML cho đến khi bạn chỉnh và lưu trên màn biên tập. Web: chuột phải vào dòng quy tắc; cảm ứng: nhấn giữ dòng.
            </Text>
            <TextInput
              style={styles.chiTietLoiModal_search}
              value={tuKhoaLocChiTietModal}
              onChangeText={setTuKhoaLocChiTietModal}
              placeholder="Lọc MA_LK, BN, nội dung vi phạm, vị trí XML…"
              placeholderTextColor={CD.text.placeholder}
              {...Platform.select({ web: { outlineStyle: 'none' } })}
            />
            <Text style={styles.chiTietLoiModal_count}>
              Hiển thị {chiTietModalDaLoc.length} / {tongCaModalSauLocBoLoc} ca
              {(quyTacChoModalChiTiet?.chi_tiet_phat_sinh || []).length !== tongCaModalSauLocBoLoc
                ? ` (toàn quy tắc: ${(quyTacChoModalChiTiet?.chi_tiet_phat_sinh || []).length} ca)`
                : ''}
            </Text>
            <ScrollView style={styles.chiTietLoiModal_scroll} keyboardShouldPersistTaps="handled">
              {chiTietModalDaLoc.length === 0 ? (
                <Text style={styles.chiTietLoiModal_empty}>Không có ca khớp bộ lọc.</Text>
              ) : (
                chiTietModalDaLoc.map((chiTiet, idx) => (
                  <View key={taoKhoaChiTietPhatSinh(chiTiet) || idx} style={[styles.rule_instance_card, styles.chiTietLoiModal_cardLift]}>
                    <View style={styles.rule_instance_header}>
                      <View style={{ flex: 1, paddingRight: 12 }}>
                        <Text style={styles.rule_instance_title}>{chiTiet.ma_lk || 'N/A'} • {chiTiet.ten_bn || 'Không rõ bệnh nhân'}</Text>
                        <Text style={styles.rule_instance_location}>{chiTiet.vi_tri_xml}</Text>
                      </View>
                      <Text style={styles.rule_instance_tab}>{chiTiet.tab_quan_tri_goi_y || 'LUAT_HANH_CHINH'}</Text>
                    </View>
                    <Text style={styles.rule_instance_desc}>{chiTiet.canh_bao}</Text>
                    <View style={styles.rule_instance_actions}>
                      <TouchableOpacity
                        style={[styles.rule_action_btn, styles.rule_action_btn_xml]}
                        onPress={() => {
                          dongModalChiTietHoSoLoi();
                          moChiTietXmlTheoLoi(chiTiet);
                        }}
                      >
                        <Text style={styles.rule_action_btn_txt}>🗂 Mở XML lỗi</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.rule_action_btn, styles.rule_action_btn_edit]}
                        onPress={() => {
                          dongModalChiTietHoSoLoi();
                          moSuaXmlTheoLoi(chiTiet);
                        }}
                      >
                        <Text style={styles.rule_action_btn_txt}>📝 Sửa và lưu XML</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.rule_action_btn, styles.rule_action_btn_export_xml]}
                        onPress={() => xuatXmlChuanHisChoHoSo(chiTiet)}
                      >
                        <Text style={styles.rule_action_btn_txt}>📥 Xuất XML QĐ130 (HIS)</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.rule_action_btn, styles.rule_action_btn_rule]}
                        onPress={() => {
                          dongModalChiTietHoSoLoi();
                          moQuanTriQuyTacTheoLoi(chiTiet);
                        }}
                      >
                        <Text style={styles.rule_action_btn_txt}>🎚 Đúng vị trí rule</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>
            <View style={styles.chiTietLoiModal_footerRow}>
              <TouchableOpacity
                style={styles.chiTietLoiModal_footerBtn}
                onPress={() => {
                  const qt = quyTacChoModalChiTiet;
                  dongModalChiTietHoSoLoi();
                  moQuanTriQuyTacTheoLoi(qt?.chi_tiet_phat_sinh?.[0] || qt);
                }}
              >
                <Text style={styles.chiTietLoiModal_footerBtnTxt}>🎚 Mở Rule ON/OFF (quy tắc này)</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  vung_an_toan: {
    flex: 1,
    position: 'relative',
    ...Platform.select({ web: { backgroundImage: CD.web.gradient_bg } }),
    backgroundColor: CD.bg.gradient_mobile,
  },

  // ── HEADER ──
  header: {
    ...Platform.select({
      web: {
        backgroundImage: CD.web.gradient_header,
        backdropFilter: CD.web.blur_header,
        WebkitBackdropFilter: CD.web.blur_header,
        boxShadow: CD.web.shadow_header,
      },
    }),
    backgroundColor: CD.brand.mauDam,
    borderBottomWidth: 1, borderBottomColor: CD.border.header,
    paddingHorizontal: 24, paddingVertical: 16,
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 12,
  },
  header_main_row: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    alignItems: Platform.OS === 'web' ? 'center' : 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    width: '100%',
  },
  header_left: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  logo: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#FFF', borderWidth: 2, borderColor: 'rgba(255,255,255,0.5)' },
  header_ten_bv: { fontSize: 26, fontWeight: '900', color: '#FFF', fontFamily: CD.font.family, letterSpacing: 0.5 },
  header_sub: { fontSize: 16, color: 'rgba(255,255,255,0.75)', fontFamily: CD.font.family, marginTop: 2 },
  header_right: {
    alignItems: Platform.OS === 'web' ? 'flex-end' : 'flex-start',
    gap: 8,
    maxWidth: Platform.OS === 'web' ? '58%' : '100%',
    width: Platform.OS === 'web' ? undefined : '100%',
  },
  header_account_row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
    justifyContent: Platform.OS === 'web' ? 'flex-end' : 'flex-start',
    width: '100%',
  },
  user_badge: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingVertical: 8, paddingHorizontal: 14, borderRadius: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
  },
  user_badge_icon: { fontSize: 22 },
  user_badge_name: { fontSize: 17, fontWeight: '700', color: '#FFF', fontFamily: CD.font.family },
  user_badge_role: { fontSize: 14, color: 'rgba(255,255,255,0.7)', fontFamily: CD.font.family },
  btn_doi_mk: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    marginRight: 8,
    ...Platform.select({ web: { cursor: 'pointer' } }),
  },
  btn_doi_mk_txt: { fontSize: 15, color: '#FFF', fontWeight: '600', fontFamily: CD.font.family },
  btn_logout: {
    paddingVertical: 8, paddingHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 10,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
    ...Platform.select({ web: { backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', cursor: 'pointer' } }),
  },
  btn_logout_txt: { fontSize: 16, color: '#FFF', fontWeight: '600', fontFamily: CD.font.family },

  // ── DASHBOARD LAYOUT ──
  dashboard_layout: {
    flex: 1,
    gap: 12,
    padding: 12,
  },
  dashboard_layout_row: {
    flexDirection: 'row',
  },
  dashboard_layout_col: {
    flexDirection: 'column',
  },
  sidebar_dashboard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    padding: 0,
    overflow: 'hidden',
    ...Platform.select({
      web: {
        boxShadow:
          '0 4px 6px -1px rgba(15, 23, 42, 0.05), 0 12px 28px -6px rgba(15, 23, 42, 0.08)',
      },
      default: {
        shadowColor: '#0F172A',
        shadowOpacity: 0.07,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 5 },
        elevation: 3,
      },
    }),
  },
  sidebar_dashboard_compact: {
    width: '100%',
    maxHeight: 360,
  },
  sidebar_header: {
    flexDirection: 'row',
    alignItems: 'stretch',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 14,
    backgroundColor: '#FAFBFC',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#EEF2F7',
  },
  sidebar_header_accent: {
    width: 4,
    borderRadius: 3,
    marginRight: 12,
    minHeight: 44,
  },
  sidebar_header_inner: {
    flex: 1,
    justifyContent: 'center',
  },
  sidebar_title: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
    fontFamily: CD.font.family,
  },
  sidebar_subtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    fontFamily: CD.font.family,
  },
  panel_card_collapsed: {
    maxHeight: undefined,
  },
  panel_collapsed_body: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 14,
  },
  panel_collapsed_hint: {
    fontSize: 12,
    color: '#94A3B8',
    fontFamily: CD.font.family,
    lineHeight: 18,
  },
  panel_collapsed_hint_dark: {
    fontSize: 12,
    color: CD.text.muted,
    fontFamily: CD.font.family,
    lineHeight: 18,
    opacity: 0.9,
  },
  rule_filter_panel_head: {
    marginBottom: 2,
  },
  sidebar_hint_pill: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginHorizontal: 12,
    marginTop: 10,
    marginBottom: 2,
    paddingVertical: 9,
    paddingHorizontal: 11,
    backgroundColor: '#F8FAFC',
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#EDF2F7',
  },
  sidebar_hint_bullet: {
    fontSize: 8,
    color: CD.brand.mauChinh,
    marginTop: 5,
    opacity: 0.85,
  },
  sidebar_hint_web: {
    flex: 1,
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
    fontFamily: CD.font.family,
  },
  sidebar_scroll: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 16,
  },
  dashboard_main: { flex: 1 },

  // ── KPI CARDS ──
  kpi_row: {
    flexDirection: 'row', gap: 8,
    flexWrap: Platform.OS === 'web' ? 'nowrap' : 'wrap',
    paddingHorizontal: 0, paddingTop: 0, paddingBottom: 0,
    width: '100%',
    justifyContent: Platform.OS === 'web' ? 'flex-end' : 'space-between',
  },
  kpi_card: {
    ...(Platform.OS === 'web' ? { flex: 1, minWidth: 104, maxWidth: 126 } : { flexGrow: 1, flexBasis: '47%' }),
    backgroundColor: 'rgba(15, 23, 42, 0.42)',
    borderRadius: 14,
    paddingVertical: 6,
    paddingHorizontal: 7,
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 3,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    ...Platform.select({ web: { backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', boxShadow: '0 8px 18px rgba(15,23,42,0.16)' } }),
  },
  kpi_icon_wrap: { width: 24, height: 24, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 7 },
  kpi_icon: { fontSize: 13 },
  kpi_text_block: { flex: 1, alignItems: 'flex-start' },
  kpi_value: { fontSize: 15, fontWeight: '900', fontFamily: CD.font.family, lineHeight: 16 },
  kpi_label: { fontSize: 9, color: 'rgba(255,255,255,0.72)', marginTop: 1, fontFamily: CD.font.family, textAlign: 'left' },

  tri_thuc_fab: {
    position: 'absolute',
    right: 18,
    bottom: 20,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: CD.brand.mauChinh,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    elevation: 14,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.35)',
    ...Platform.select({
      web: {
        boxShadow: '0 10px 28px rgba(194, 24, 91, 0.45)',
        cursor: 'pointer',
      },
    }),
  },
  tri_thuc_fab_icon: { fontSize: 28 },

  tri_thuc_modal_root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  tri_thuc_modal_hit: {
    ...StyleSheet.absoluteFillObject,
  },
  tri_thuc_modal_backdrop: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  tri_thuc_modal_sheet: {
    marginHorizontal: 12,
    marginBottom: Platform.OS === 'ios' ? 28 : 16,
    paddingBottom: 18,
    paddingHorizontal: 16,
    paddingTop: 8,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    maxHeight: '78%',
    ...Platform.select({
      web: {
        maxWidth: 440,
        alignSelf: 'center',
        width: '100%',
        boxShadow: '0 -12px 40px rgba(15, 23, 42, 0.18)',
      },
    }),
  },
  tri_thuc_modal_sheet_chat: {
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: Platform.OS === 'ios' ? 22 : 12,
    overflow: 'hidden',
    ...Platform.select({
      web: {
        maxWidth: 480,
        width: '96%',
        minHeight: 440,
        maxHeight: '88vh',
        boxShadow: '0 -16px 48px rgba(15, 23, 42, 0.22)',
      },
      default: {
        height: Math.min(Dimensions.get('window').height * 0.82, 600),
        maxHeight: Math.min(Dimensions.get('window').height * 0.9, 640),
      },
    }),
  },
  tri_thuc_modal_grab: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    marginBottom: 12,
  },
  tri_thuc_modal_header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  tri_thuc_modal_title: {
    fontSize: 19,
    fontWeight: '900',
    color: '#0f172a',
    fontFamily: CD.font.family,
  },
  tri_thuc_modal_close: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  tri_thuc_modal_close_txt: { fontSize: 16, color: '#64748B', fontWeight: '700' },
  tri_thuc_modal_sub: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 14,
    lineHeight: 20,
    fontFamily: CD.font.family,
    maxWidth: '100%',
  },
  tri_thuc_modal_row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderLeftWidth: 4,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  tri_thuc_modal_row_icon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tri_thuc_modal_row_emoji: { fontSize: 22 },
  tri_thuc_modal_row_title: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
    fontFamily: CD.font.family,
  },
  tri_thuc_modal_row_hint: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    fontFamily: CD.font.family,
    lineHeight: 17,
    flexShrink: 1,
  },
  tri_thuc_modal_row_chev: { fontSize: 18, color: '#94A3B8', fontWeight: '700' },

  // ── SECTIONS ──
  section_block: { marginHorizontal: 8, marginTop: 14 },
  section_block_compact_center: { alignItems: 'center', marginTop: 10 },
  section_block_import_tight: { marginTop: 8, marginBottom: 4, maxWidth: Platform.OS === 'web' ? 680 : '100%', alignSelf: 'center', width: '100%' },
  import_section_head_row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  import_section_title: {
    fontSize: 17,
    fontWeight: '800',
    color: '#F8FAFC',
    fontFamily: CD.font.family,
    letterSpacing: -0.2,
  },
  import_section_sub: {
    fontSize: 11,
    color: '#94A3B8',
    fontFamily: CD.font.family,
    marginTop: 2,
  },
  import_toggle_chip: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(15,23,42,0.45)',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.35)',
    flexShrink: 0,
    ...Platform.select({ web: { cursor: 'pointer' } }),
  },
  import_toggle_chip_hover: {
    backgroundColor: 'rgba(30,41,59,0.55)',
    borderColor: 'rgba(148,163,184,0.5)',
  },
  import_toggle_chip_txt: {
    fontSize: 11,
    fontWeight: '700',
    color: '#E2E8F0',
    fontFamily: CD.font.family,
  },
  import_card_compact: {
    width: '100%',
    backgroundColor: 'rgba(248,250,252,0.72)',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(226,232,240,0.85)',
    ...Platform.select({
      web: {
        boxShadow: '0 8px 20px rgba(15,23,42,0.06), inset 0 1px 0 rgba(255,255,255,0.65)',
      },
      default: {
        shadowColor: '#0F172A',
        shadowOpacity: 0.06,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 2,
      },
    }),
  },
  import_hero_row: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    alignItems: Platform.OS === 'web' ? 'flex-start' : 'stretch',
    justifyContent: 'space-between',
    gap: 12,
  },
  import_hero_lead: { flex: 1, minWidth: 0 },
  import_hero_actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
    flexWrap: 'wrap',
    justifyContent: Platform.OS === 'web' ? 'flex-end' : 'center',
    alignSelf: Platform.OS === 'web' ? 'auto' : 'stretch',
  },
  audit_engine_title_compact: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: CD.font.family,
    letterSpacing: -0.2,
  },
  import_tagline: {
    fontSize: 11,
    color: '#64748B',
    fontFamily: CD.font.family,
    marginTop: 2,
  },
  python_badge_line: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8, minWidth: 0 },
  python_badge_dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#94A3B8' },
  python_badge_dot_checking: { backgroundColor: '#F59E0B' },
  python_badge_dot_ok: { backgroundColor: '#22C55E' },
  python_badge_dot_err: { backgroundColor: '#EF4444' },
  python_badge_txt: {
    flex: 1,
    fontSize: 10,
    lineHeight: 14,
    color: '#475569',
    fontFamily: CD.font.family,
  },
  import_pick_btn_sm: {
    alignSelf: 'center',
    backgroundColor: '#2563EB',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#1D4ED8',
    minWidth: 108,
    alignItems: 'center',
    ...Platform.select({
      web: { boxShadow: '0 4px 12px rgba(37,99,235,0.22)', cursor: 'pointer' },
      default: {
        shadowColor: '#2563EB',
        shadowOpacity: 0.2,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
        elevation: 3,
      },
    }),
  },
  helper_redirect_btn_tight: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({ web: { cursor: 'pointer' } }),
  },
  helper_redirect_txt_tight: {
    fontSize: 12,
    fontWeight: '800',
    color: '#334155',
    fontFamily: CD.font.family,
  },
  import_kt_block: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(148,163,184,0.35)',
  },
  import_kt_paragraph: {
    fontSize: 11,
    lineHeight: 16,
    color: '#475569',
    fontFamily: CD.font.family,
    marginBottom: 8,
  },
  import_chips_tight_row: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  import_chip_tight: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 999,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  import_chip_tight_txt: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
    fontFamily: CD.font.family,
  },
  import_nangcao_block: { marginTop: 8, borderTopWidth: 1, borderTopColor: 'rgba(148,163,184,0.25)', paddingTop: 6 },
  import_nangcao_head: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
    gap: 8,
    ...Platform.select({ web: { cursor: 'pointer' } }),
  },
  import_nangcao_head_hover: { opacity: 0.92 },
  import_nangcao_head_txt: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F766E',
    fontFamily: CD.font.family,
    flex: 1,
  },
  import_log_badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 6,
    backgroundColor: '#0D9488',
    alignItems: 'center',
    justifyContent: 'center',
  },
  import_log_badge_txt: { fontSize: 10, fontWeight: '900', color: '#F0FDFA', fontFamily: CD.font.family },
  import_nangcao_body: { paddingTop: 6, gap: 8 },
  import_nangcao_one_line: {
    fontSize: 10,
    lineHeight: 15,
    color: '#64748B',
    fontFamily: CD.font.family,
  },
  import_folder_btn: {
    alignSelf: 'flex-start',
    backgroundColor: '#0D9488',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#0F766E',
    ...Platform.select({ web: { cursor: 'pointer' } }),
  },
  import_folder_btn_disabled: { opacity: 0.55 },
  import_folder_btn_txt: {
    fontSize: 12,
    fontWeight: '800',
    color: '#F0FDFA',
    fontFamily: CD.font.family,
  },
  import_auto_folder_scroll_compact: { maxHeight: 120, paddingHorizontal: 8, paddingVertical: 6 },
  section_title: { fontSize: 20, fontWeight: '800', color: CD.text.primary, fontFamily: CD.font.family, marginBottom: 14 },
  section_title_center: { textAlign: 'center', marginBottom: 8 },
  section_note: {
    fontSize: 12,
    lineHeight: 16,
    color: '#64748B',
    fontFamily: CD.font.family,
    marginTop: -6,
    marginBottom: 10,
  },
  section_note_center: {
    textAlign: 'center',
    maxWidth: 620,
    marginTop: 0,
    marginBottom: 8,
  },

  // ── SIDEBAR ĐIỀU HƯỚNG (dashboard) ──
  module_grid_sidebar: {
    gap: 8,
    flexDirection: 'column',
    width: '100%',
  },
  module_card_sidebar_item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EDF2F7',
    borderLeftWidth: 3,
    minWidth: '100%',
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transitionProperty: 'box-shadow, border-color, transform',
        transitionDuration: '0.14s',
      },
    }),
  },
  module_card_sidebar_item_hover: Platform.select({
    web: {
      borderColor: '#CBD5E1',
      boxShadow: '0 6px 16px rgba(15, 23, 42, 0.07)',
      transform: [{ translateY: -1 }],
    },
    default: {},
  }),
  module_card_sidebar_item_pressed: { opacity: 0.93 },
  module_icon_wrap_sidebar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      web: { boxShadow: '0 1px 2px rgba(15, 23, 42, 0.06)' },
    }),
  },
  module_icon_sidebar: { fontSize: 22 },
  module_text_block: { flex: 1, minWidth: 0 },
  module_name_sidebar: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    fontFamily: CD.font.family,
    lineHeight: 20,
  },
  module_chevron: {
    fontSize: 22,
    fontWeight: '300',
    opacity: 0.75,
    marginLeft: 2,
    ...Platform.select({ web: { userSelect: 'none' } }),
  },
  sidebar_section_gap: { marginTop: 4 },
  sidebar_divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
    marginTop: 8,
  },
  sidebar_divider_line: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: '#E2E8F0' },
  sidebar_divider_label: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1.4,
    fontFamily: CD.font.family,
  },
  module_card_sidebar_secondary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minWidth: '100%',
    ...Platform.select({
      web: {
        cursor: 'pointer',
        borderStyle: 'dashed',
      },
      default: {},
    }),
  },
  module_card_sidebar_secondary_hover: Platform.select({
    web: {
      backgroundColor: '#F1F5F9',
      borderColor: '#CBD5E1',
    },
    default: {},
  }),
  module_icon_wrap_secondary: {
    backgroundColor: '#EEF2FF',
  },
  module_name_sidebar_secondary: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
    fontFamily: CD.font.family,
  },
  module_hint_secondary: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 3,
    fontFamily: CD.font.family,
  },

  // ── IMPORT ZONE (khung ngoài gọn, không lớp glow) ──
  import_zone: {
    backgroundColor: 'rgba(214,235,255,0.10)',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 680 : '100%',
    alignSelf: 'center',
    position: 'relative',
    overflow: 'hidden',
    ...Platform.select({
      web: {
        backdropFilter: 'blur(12px) saturate(140%)',
        WebkitBackdropFilter: 'blur(12px) saturate(140%)',
        boxShadow: '0 12px 28px rgba(15,23,42,0.08), inset 0 1px 0 rgba(255,255,255,0.22)',
      },
      default: {
        shadowColor: '#0F172A',
        shadowOpacity: 0.08,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 3,
      },
    }),
  },
  import_zone_glow_primary: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 999,
    top: -120,
    right: -50,
    backgroundColor: 'rgba(125,211,252,0.22)',
    ...Platform.select({ web: { filter: 'blur(8px)' } }),
  },
  import_zone_glow_secondary: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 999,
    bottom: -90,
    left: -40,
    backgroundColor: 'rgba(191,219,254,0.18)',
    ...Platform.select({ web: { filter: 'blur(10px)' } }),
  },
  import_zone_sheen: {
    position: 'absolute',
    top: 10,
    left: 18,
    right: 18,
    height: 46,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.16)',
    transform: [{ rotate: '-2deg' }],
  },
  import_inner: { width: '100%', position: 'relative', zIndex: 1 },
  import_content_single: {
    width: '100%',
    alignItems: 'center',
  },
  import_content_grid: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    gap: 10,
    alignItems: 'stretch',
  },
  import_upload_card_single: {
    backgroundColor: 'rgba(245,251,255,0.34)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.48)',
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 14,
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 540 : '100%',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    ...Platform.select({
      web: {
        backdropFilter: 'blur(16px) saturate(150%)',
        WebkitBackdropFilter: 'blur(16px) saturate(150%)',
        boxShadow: '0 18px 34px rgba(15,23,42,0.11), 0 6px 18px rgba(14,165,233,0.08), inset 0 1px 0 rgba(255,255,255,0.40)',
      },
      default: {
        shadowColor: '#1E293B',
        shadowOpacity: 0.12,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 8 },
        elevation: 5,
      },
    }),
  },
  import_upload_column: {
    flexGrow: 1,
    flexBasis: Platform.OS === 'web' ? '28%' : '100%',
  },
  import_status_column: {
    flexGrow: 1,
    flexBasis: Platform.OS === 'web' ? '34%' : '100%',
  },
  import_summary_column: {
    flexGrow: 1,
    flexBasis: Platform.OS === 'web' ? '34%' : '100%',
  },
  import_upload_card: {
    backgroundColor: 'rgba(244,250,255,0.32)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.42)',
    borderRadius: 18,
    padding: 14,
    ...Platform.select({
      web: {
        backdropFilter: 'blur(14px) saturate(145%)',
        WebkitBackdropFilter: 'blur(14px) saturate(145%)',
        boxShadow: '0 14px 28px rgba(15,23,42,0.08), inset 0 1px 0 rgba(255,255,255,0.30)',
      },
    }),
  },
  compact_equal_card: {
    minHeight: Platform.OS === 'web' ? 148 : undefined,
    height: Platform.OS === 'web' ? 148 : undefined,
    justifyContent: 'flex-start',
  },
  import_upload_subtitle: {
    fontSize: 12,
    lineHeight: 15,
    color: '#46607E',
    fontFamily: CD.font.family,
    marginTop: 2,
    marginBottom: 8,
  },
  import_upload_subtitle_center: {
    textAlign: 'center',
    maxWidth: 460,
  },
  python_warmup_hint: {
    fontSize: 11,
    lineHeight: 14,
    color: '#5C6B7A',
    fontFamily: CD.font.family,
    textAlign: 'center',
    maxWidth: 520,
    alignSelf: 'center',
    marginBottom: 6,
  },
  import_upload_highlights_compact: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
    justifyContent: 'center',
  },
  import_upload_highlight_chip: {
    paddingVertical: 5,
    paddingHorizontal: 9,
    backgroundColor: 'rgba(236,253,255,0.56)',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(125,211,252,0.58)',
    ...Platform.select({
      web: {
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.28)',
      },
    }),
  },
  import_upload_highlight_key: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0D5D86',
    fontFamily: CD.font.family,
  },
  import_pick_btn_compact: {
    alignSelf: 'center',
    backgroundColor: '#2B82E8',
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#1B5EB4',
    minWidth: 122,
    alignItems: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0 16px 30px rgba(37,99,235,0.34), inset 0 1px 0 rgba(255,255,255,0.30), inset 0 -2px 0 rgba(15,23,42,0.10)',
      },
      default: {
        shadowColor: '#2563EB',
        shadowOpacity: 0.32,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 8 },
        elevation: 6,
      },
    }),
  },
  import_action_row: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
  },
  import_auto_folder_wrap: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(148,163,184,0.35)',
    width: '100%',
  },
  import_auto_folder_title: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: CD.font.family,
    marginBottom: 6,
  },
  import_auto_folder_note: {
    fontSize: 11,
    lineHeight: 17,
    color: '#475569',
    fontFamily: CD.font.family,
    marginBottom: 10,
  },
  import_auto_folder_btn: {
    alignSelf: 'center',
    backgroundColor: '#0D9488',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#0F766E',
    ...Platform.select({ web: { cursor: 'pointer' } }),
  },
  import_auto_folder_btn_disabled: { opacity: 0.55 },
  import_auto_folder_btn_txt: {
    fontSize: 12,
    fontWeight: '800',
    color: '#F0FDFA',
    fontFamily: CD.font.family,
  },
  import_auto_folder_log: {
    marginTop: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#F8FAFC',
    overflow: 'hidden',
  },
  import_auto_folder_log_header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#EEF2FF',
    borderBottomWidth: 1,
    borderBottomColor: '#C7D2FE',
  },
  import_auto_folder_log_title: {
    fontSize: 11,
    fontWeight: '800',
    color: '#3730A3',
    fontFamily: CD.font.family,
  },
  import_auto_folder_clear: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4F46E5',
    fontFamily: CD.font.family,
    ...Platform.select({ web: { cursor: 'pointer' } }),
  },
  import_auto_folder_scroll: { maxHeight: 220, paddingHorizontal: 10, paddingVertical: 8 },
  import_auto_folder_line: {
    fontSize: 11,
    lineHeight: 17,
    color: '#1E293B',
    fontFamily: CD.font.mono,
    marginBottom: 6,
  },
  helper_redirect_btn: {
    alignSelf: 'center',
    backgroundColor: 'rgba(232,244,255,0.38)',
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(147,197,253,0.46)',
    ...Platform.select({
      web: {
        cursor: 'pointer',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        boxShadow: '0 12px 24px rgba(14,165,233,0.10), inset 0 1px 0 rgba(255,255,255,0.28)',
      },
    }),
  },
  helper_redirect_txt: {
    fontSize: 10,
    fontWeight: '800',
    color: '#245D96',
    fontFamily: CD.font.family,
  },
  loading_wrap: { alignItems: 'center', gap: 12 },
  loading_txt: { fontSize: 20, color: CD.brand.mauChinh, fontWeight: '600', fontFamily: CD.font.family },
  audit_engine_panel: {
    width: '100%',
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#FBFDFF',
    borderWidth: 1,
    borderColor: '#D9E4F1',
  },
  audit_engine_header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  python_action_group: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  audit_engine_title: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: CD.font.family,
  },
  python_refresh_btn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    ...Platform.select({ web: { cursor: 'pointer' } }),
  },
  python_refresh_txt: {
    fontSize: 11,
    fontWeight: '700',
    color: '#3730A3',
    fontFamily: CD.font.family,
  },
  python_action_btn_busy: {
    opacity: 0.65,
  },
  audit_engine_switch_row: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  audit_engine_chip: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    ...Platform.select({ web: { cursor: 'pointer' } }),
  },
  audit_engine_chip_active: {
    backgroundColor: '#0F766E',
    borderColor: '#0F766E',
  },
  audit_engine_chip_txt: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
    fontFamily: CD.font.family,
  },
  audit_engine_chip_txt_active: {
    color: '#FFFFFF',
  },
  python_status_card: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  python_status_row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  python_status_dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EF4444',
  },
  python_status_dot_online: {
    backgroundColor: '#22C55E',
  },
  python_status_dot_checking: {
    backgroundColor: '#F59E0B',
  },
  python_status_title: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: CD.font.family,
    flex: 1,
  },
  python_status_meta: {
    fontSize: 11,
    color: '#475569',
    fontFamily: CD.font.family,
    marginBottom: 4,
  },
  python_smoke_badge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 999,
    backgroundColor: '#CBD5E1',
  },
  python_smoke_badge_pass: {
    backgroundColor: '#16A34A',
  },
  python_smoke_badge_fail: {
    backgroundColor: '#DC2626',
  },
  python_smoke_badge_running: {
    backgroundColor: '#D97706',
  },
  python_smoke_badge_txt: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    fontFamily: CD.font.family,
    letterSpacing: 0.4,
  },
  python_status_sub: {
    fontSize: 11,
    color: '#334155',
    lineHeight: 16,
    fontFamily: CD.font.family,
  },
  python_status_smoke: {
    fontSize: 11,
    color: '#1D4ED8',
    lineHeight: 16,
    fontFamily: CD.font.family,
    marginTop: 4,
  },
  python_status_hint: {
    fontSize: 11,
    color: '#0F766E',
    lineHeight: 16,
    fontFamily: CD.font.family,
    marginTop: 4,
  },
  unified_ops_card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  unified_ops_header: {
    marginBottom: 4,
  },
  unified_ops_title: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: CD.font.family,
    marginBottom: 0,
  },
  unified_ops_compact_line: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F766E',
    lineHeight: 18,
    fontFamily: CD.font.family,
    marginTop: 2,
  },
  unified_ops_meta: {
    fontSize: 11,
    color: '#334155',
    lineHeight: 16,
    fontFamily: CD.font.family,
    marginTop: 4,
  },
  // ── CONFLICT CARD ──
  conflict_card: {
    backgroundColor: CD.severity.error.bg,
    borderRadius: 20, overflow: 'hidden',
    borderWidth: 1, borderColor: CD.severity.error.border,
    ...Platform.select({ web: { backdropFilter: CD.web.blur_card, WebkitBackdropFilter: CD.web.blur_card } }),
  },
  conflict_header: { backgroundColor: CD.severity.error.bg, padding: 14, borderBottomWidth: 1, borderBottomColor: CD.severity.error.border },
  conflict_title: { fontSize: 18, fontWeight: '700', color: CD.severity.error.text, fontFamily: CD.font.family },
  conflict_btns: { flexDirection: 'row', gap: 10, padding: 14, flexWrap: 'wrap' },
  conflict_btn: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10 },
  conflict_btn_txt: { color: '#FFF', fontWeight: '700', fontSize: 17, fontFamily: CD.font.family },

  // ── WORKSPACE & EXPORT ──
  workspace_header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 },
  export_btns: { flexDirection: 'row', gap: 10, flexWrap: 'wrap', justifyContent: 'flex-end' },
  btn_export: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10 },
  btn_export_txt: { color: '#FFF', fontWeight: '700', fontSize: 16, fontFamily: CD.font.family },

  rule_filter_panel: {
    marginBottom: 12,
    padding: 14,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    borderTopColor: 'rgba(255,255,255,0.22)',
    borderLeftColor: 'rgba(255,255,255,0.18)',
    gap: 10,
    ...Platform.select({
      web: {
        backdropFilter: CD.web.blur_card,
        WebkitBackdropFilter: CD.web.blur_card,
        boxShadow: '0 18px 38px rgba(2,6,23,0.20), inset 0 1px 0 rgba(255,255,255,0.16)',
      },
      default: {
        shadowColor: '#020617',
        shadowOpacity: 0.18,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 10 },
        elevation: 8,
      },
    }),
  },
  rule_filter_scroll: {
    flexGrow: 0,
  },
  rule_filter_scroll_content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingBottom: 4,
    paddingRight: 4,
  },
  rule_filter_group: {
    maxWidth: 280,
  },
  rule_filter_group_wide: {
    maxWidth: 360,
  },
  rule_filter_group_khoa: {
    maxWidth: 420,
  },
  rule_filter_group_label: {
    fontSize: 10,
    fontWeight: '800',
    color: CD.text.muted,
    textTransform: 'uppercase',
    marginBottom: 6,
    letterSpacing: 0.35,
    fontFamily: CD.font.family,
  },
  rule_filter_chips_wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    maxWidth: '100%',
  },
  rule_filter_group_sep: {
    width: 1,
    minHeight: 88,
    marginHorizontal: 10,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignSelf: 'stretch',
  },
  rule_filter_chip_row: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  rule_filter_chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    backgroundColor: 'rgba(255,255,255,0.08)',
    ...Platform.select({
      web: { cursor: 'pointer', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12)' },
      default: {
        shadowColor: '#020617',
        shadowOpacity: 0.08,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
      },
    }),
  },
  rule_filter_chip_active: {
    backgroundColor: '#0F766E',
    borderColor: 'rgba(153,246,228,0.55)',
  },
  rule_filter_chip_txt: {
    fontSize: 12,
    fontWeight: '800',
    color: CD.text.primary,
    fontFamily: CD.font.family,
  },
  rule_filter_chip_txt_active: {
    color: '#FFFFFF',
  },
  rule_filter_subtitle: {
    fontSize: 12,
    fontWeight: '700',
    color: CD.text.muted,
    marginTop: 2,
    marginBottom: -2,
    fontFamily: CD.font.family,
  },
  rule_filter_chip_nhom: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  rule_filter_group_icd: {
    minWidth: 280,
    maxWidth: 520,
  },
  rule_filter_chip_icd: {
    paddingVertical: 5,
    paddingHorizontal: 9,
    borderColor: 'rgba(129,199,132,0.35)',
  },
  rule_filter_chip_icd_tt06: {
    borderColor: 'rgba(100,181,246,0.4)',
  },
  rule_filter_section_hint: {
    fontSize: 11,
    color: CD.text.muted,
    fontStyle: 'italic',
    marginBottom: 6,
    fontFamily: CD.font.family,
  },
  rule_nhom_empty: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  rule_nhom_empty_txt: {
    fontSize: 13,
    color: CD.text.muted,
    lineHeight: 20,
    fontFamily: CD.font.family,
  },
  rule_filter_input_row: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    gap: 8,
    alignItems: Platform.OS === 'web' ? 'center' : 'stretch',
  },
  rule_filter_input: {
    flex: 1,
    minHeight: 44,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    borderRadius: 12,
    paddingHorizontal: 14,
    color: CD.text.primary,
    fontSize: 14,
    fontFamily: CD.font.family,
    ...Platform.select({
      web: {
        outlineStyle: 'none',
        backdropFilter: CD.web.blur_input,
        WebkitBackdropFilter: CD.web.blur_input,
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.10)',
      },
      default: {
        shadowColor: '#020617',
        shadowOpacity: 0.08,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
      },
    }),
  },
  rule_filter_clear_btn: {
    minHeight: 44,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(96,165,250,0.35)',
    backgroundColor: 'rgba(59,130,246,0.14)',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      web: { cursor: 'pointer', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.10)' },
      default: {
        shadowColor: '#0F172A',
        shadowOpacity: 0.08,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
      },
    }),
  },
  rule_filter_clear_txt: {
    fontSize: 13,
    fontWeight: '800',
    color: '#BFDBFE',
    fontFamily: CD.font.family,
  },
  rule_filter_status: {
    fontSize: 12,
    color: CD.text.secondary,
    fontFamily: CD.font.family,
  },

  // ── BẢNG VI PHẠM ──
  table_card: {
    backgroundColor: CD.bg.glass_card,
    borderRadius: 20, overflow: 'hidden',
    borderWidth: 1, borderColor: CD.border.glass,
    ...Platform.select({ web: { backdropFilter: CD.web.blur_card, WebkitBackdropFilter: CD.web.blur_card, boxShadow: CD.web.shadow_card } }),
  },
  table_head_row: {
    flexDirection: 'row', paddingVertical: 16, paddingHorizontal: 20,
    backgroundColor: CD.bg.table_header, borderBottomWidth: 1, borderBottomColor: CD.border.glass,
  },
  th: { fontSize: 20, fontWeight: '700', color: '#FFFFFF', fontFamily: CD.font.family },
  table_row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: CD.border.divider },
  table_row_alt: { backgroundColor: CD.bg.table_row_even },
  table_row_active: {
    backgroundColor: 'rgba(14, 116, 144, 0.10)',
    borderLeftWidth: 4,
    borderLeftColor: '#0EA5E9',
  },
  rule_tag_row: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
  rule_meta_chip_row: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 },
  rule_code_chip: {
    backgroundColor: CD.severity.info.bg,
    borderWidth: 1, borderColor: CD.severity.info.border,
    borderRadius: 8, paddingVertical: 3, paddingHorizontal: 10,
  },
  rule_code_txt: { fontSize: 14, fontWeight: '800', color: CD.text.link, fontFamily: CD.font.family },
  rule_priority_chip: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
  },
  rule_priority_chip_xuat_toan: {
    backgroundColor: 'rgba(127, 29, 29, 0.12)',
    borderColor: 'rgba(185, 28, 28, 0.35)',
  },
  rule_priority_chip_canh_bao: {
    backgroundColor: 'rgba(154, 52, 18, 0.10)',
    borderColor: 'rgba(234, 88, 12, 0.28)',
  },
  rule_priority_chip_cau_truc_xml: {
    backgroundColor: 'rgba(67, 56, 202, 0.12)',
    borderColor: 'rgba(99, 102, 241, 0.35)',
  },
  rule_priority_chip_nhac_nho: {
    backgroundColor: 'rgba(15, 118, 110, 0.10)',
    borderColor: 'rgba(13, 148, 136, 0.28)',
  },
  rule_priority_chip_txt: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: CD.font.family,
  },
  rule_occurrence_meta: {
    fontSize: 12,
    color: '#475569',
    fontFamily: CD.font.family,
  },
  rule_name: { fontSize: 17, fontWeight: '700', color: CD.text.table_cell, fontFamily: CD.font.family, flex: 1 },
  rule_desc: { fontSize: 15, color: CD.text.secondary, fontFamily: CD.font.family, lineHeight: 22 },
  rule_meta: { fontSize: 13, color: CD.text.link, fontFamily: CD.font.family, marginTop: 4 },
  rule_meta_subtle: { fontSize: 12, color: CD.text.muted, fontFamily: CD.font.family, marginTop: 2 },
  rule_flow: { fontSize: 13, color: '#546E7A', fontFamily: CD.font.family, lineHeight: 19, marginTop: 2 },
  rule_hint_action: {
    fontSize: 12,
    color: '#0369A1',
    fontFamily: CD.font.family,
    marginTop: 6,
  },
  count_badge: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: CD.severity.critical.bg, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: CD.severity.critical.border,
  },
  count_badge_hot: { backgroundColor: 'rgba(211,47,47,0.4)', borderColor: 'rgba(244,67,54,0.7)' },
  count_txt: { fontSize: 22, fontWeight: '900', color: CD.severity.critical.text, fontFamily: CD.font.family, lineHeight: 24 },
  count_sub: { fontSize: 12, color: CD.severity.critical.text, fontFamily: CD.font.family },

  rule_detail_panel: {
    marginTop: 14,
    backgroundColor: CD.bg.glass_card,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: CD.border.glass,
    ...Platform.select({ web: { backdropFilter: CD.web.blur_card, WebkitBackdropFilter: CD.web.blur_card, boxShadow: CD.web.shadow_card } }),
  },
  rule_detail_header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 8,
  },
  rule_detail_title: {
    fontSize: 18,
    fontWeight: '800',
    color: CD.text.primary,
    fontFamily: CD.font.family,
  },
  rule_detail_subtitle: {
    fontSize: 13,
    color: CD.text.secondary,
    fontFamily: CD.font.family,
    marginTop: 4,
  },
  rule_detail_note: {
    fontSize: 13,
    lineHeight: 20,
    color: CD.text.secondary,
    fontFamily: CD.font.family,
    marginBottom: 12,
  },
  btn_rule_manage: {
    backgroundColor: '#7C3AED',
  },
  rule_instance_card: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    borderTopColor: 'rgba(255,255,255,0.20)',
    borderLeftColor: 'rgba(255,255,255,0.16)',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
    ...Platform.select({
      web: {
        backdropFilter: 'blur(16px) saturate(140%)',
        WebkitBackdropFilter: 'blur(16px) saturate(140%)',
        boxShadow: '0 14px 28px rgba(2,6,23,0.18), inset 0 1px 0 rgba(255,255,255,0.14)',
      },
      default: {
        shadowColor: '#020617',
        shadowOpacity: 0.16,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 8 },
        elevation: 6,
      },
    }),
  },
  rule_instance_header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 8,
  },
  rule_instance_title: {
    fontSize: 16,
    fontWeight: '800',
    color: CD.text.primary,
    fontFamily: CD.font.family,
  },
  rule_instance_location: {
    fontSize: 12,
    color: '#7DD3FC',
    fontFamily: CD.font.family,
    marginTop: 3,
  },
  rule_instance_tab: {
    fontSize: 11,
    fontWeight: '800',
    color: CD.text.primary,
    backgroundColor: 'rgba(148,163,184,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 10,
    overflow: 'hidden',
    fontFamily: CD.font.family,
  },
  rule_instance_desc: {
    fontSize: 14,
    lineHeight: 21,
    color: CD.text.secondary,
    fontFamily: CD.font.family,
    marginBottom: 10,
  },
  rule_instance_actions: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  rule_action_btn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    ...Platform.select({ web: { cursor: 'pointer' } }),
  },
  rule_action_btn_xml: {
    backgroundColor: 'rgba(14,165,233,0.14)',
    borderColor: 'rgba(125,211,252,0.35)',
  },
  rule_action_btn_edit: {
    backgroundColor: 'rgba(236,72,153,0.14)',
    borderColor: 'rgba(244,114,182,0.35)',
  },
  rule_action_btn_rule: {
    backgroundColor: 'rgba(124,58,237,0.16)',
    borderColor: 'rgba(196,181,253,0.38)',
  },
  rule_action_btn_export_xml: {
    backgroundColor: 'rgba(16,185,129,0.14)',
    borderColor: 'rgba(52,211,153,0.38)',
  },
  rule_action_btn_txt: {
    fontSize: 13,
    fontWeight: '800',
    color: CD.text.primary,
    fontFamily: CD.font.family,
  },

  empty_state: {
    padding: 50, alignItems: 'center',
    backgroundColor: CD.bg.glass_card,
    borderRadius: 16, margin: 16,
    borderWidth: 1, borderColor: CD.border.glass,
  },
  empty_icon: { fontSize: 56, marginBottom: 16 },
  empty_title: { fontSize: 22, fontWeight: '700', color: CD.text.secondary, fontFamily: CD.font.family, marginBottom: 8 },
  empty_sub: { fontSize: 18, color: CD.text.muted, fontFamily: CD.font.family, textAlign: 'center' },

  chiTietLoiModal_root: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 24,
  },
  chiTietLoiModal_backdropHit: {
    ...StyleSheet.absoluteFillObject,
  },
  chiTietLoiModal_backdrop: {
    flex: 1,
    backgroundColor: 'rgba(2,6,23,0.58)',
  },
  chiTietLoiModal_sheet: {
    width: '100%',
    maxWidth: 900,
    maxHeight: Dimensions.get('window').height * 0.88,
    backgroundColor: CD.bg.glass_card,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: CD.border.glass,
    zIndex: 2,
    elevation: 12,
    ...Platform.select({ web: { boxShadow: '0 24px 48px rgba(2,6,23,0.35)' } }),
  },
  chiTietLoiModal_header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 8,
  },
  chiTietLoiModal_title: {
    fontSize: 18,
    fontWeight: '800',
    color: CD.text.primary,
    fontFamily: CD.font.family,
  },
  chiTietLoiModal_sub: {
    fontSize: 13,
    color: CD.text.secondary,
    fontFamily: CD.font.family,
    marginTop: 4,
  },
  chiTietLoiModal_close: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(148,163,184,0.2)',
  },
  chiTietLoiModal_closeTxt: { fontSize: 18, color: CD.text.primary, fontWeight: '700' },
  chiTietLoiModal_hint: {
    fontSize: 12,
    lineHeight: 18,
    color: CD.text.muted,
    fontFamily: CD.font.family,
    marginBottom: 10,
  },
  chiTietLoiModal_search: {
    borderWidth: 1,
    borderColor: CD.border.input,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'web' ? 10 : 8,
    fontSize: 15,
    color: CD.text.primary,
    fontFamily: CD.font.family,
    backgroundColor: CD.bg.glass_input,
    marginBottom: 6,
  },
  chiTietLoiModal_count: {
    fontSize: 12,
    color: CD.text.secondary,
    fontFamily: CD.font.family,
    marginBottom: 8,
  },
  chiTietLoiModal_scroll: {
    flexGrow: 0,
    maxHeight: Dimensions.get('window').height * 0.48,
    marginBottom: 10,
  },
  chiTietLoiModal_cardLift: {
    marginBottom: 12,
  },
  chiTietLoiModal_empty: {
    padding: 20,
    textAlign: 'center',
    color: CD.text.muted,
    fontFamily: CD.font.family,
  },
  chiTietLoiModal_footerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: CD.border.glass,
    paddingTop: 12,
  },
  chiTietLoiModal_footerBtn: {
    backgroundColor: '#7C3AED',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  chiTietLoiModal_footerBtnTxt: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
    fontFamily: CD.font.family,
  },
});

export default ManHinhTongQuan;