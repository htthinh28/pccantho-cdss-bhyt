/**
 * PHÂN HỆ: DASHBOARD TỔNG QUAN & QUẢN TRỊ GIÁM ĐỊNH (MASTER CONTROL)
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
import { auditClaimsBangPythonService } from '../dich_vu/python_service_api';
import ChanTrangUngDung from '../thanh_phan/chan_trang_ung_dung';
import KhungTroLyTriThucChat from '../thanh_phan/khung_tro_ly_tri_thuc_chat';
import { BoChonChuDe, CD } from '../tien_ich/chu_de_giao_dien';
import {
  CHE_DO_GIAM_DINH,
  docCheDoGiamDinh,
  ketNoiPythonServiceLucKhoiDong,
  taiDanhMucRuntimeChoPython,
} from '../tien_ich/hybrid_python_helper';
import { docPhienDangNhap, xoaPhienDangNhap } from '../tien_ich/phien_dang_nhap';
import { DANH_MUC_QUY_TAC_NOI_BO, khopMaLuatTheoMau, suyRaThongTinQuanTriQuyTac } from '../tien_ich/quy_tac_on_off_noi_bo';
import { locModuleTheoRBAC, taiRBAC } from '../tien_ich/rbac_engine';
import {
  boSungHoTenChoMaBacSiBaoCao,
  taiMapHoTenNhanSuBaoCao,
} from '../tien_ich/dinh_dang_cchn_bao_cao';
import {
  locDanhSachLoiChiTiet,
  phangHoaDanhSachLoiChiTiet,
  layNgayYLenhNgayKqVaBacSiTuLoiHoSo,
  taoDeXuatKhacPhucTuLoi,
  taoMoTaBanChatViPhamTuLoi,
  taoViTriXmlBaoCaoDayDuTuLoi,
  tongHopQuyTacTuDanhSachChiTiet,
} from '../tien_ich/thong_ke_loi_dung_chung';

// [CẬP NHẬT LÕI]: Thống nhất dùng kho_du_lieu để đồng bộ với man_hinh_kho_luu_tru
import { chayBoMayGiamDinhNhieuHoSoV3, gomTrungLapCanhBaoTheoMaLuatVaNoiDung, suyRaNamespaceVaNguonQuyTac } from '../tien_ich/dong_co_giam_dinh';
import {
  layDanhSachMaLKTuKho,
  layTatCaHoSoTuKho,
  luuHoSoVaoKho,
  phanTichKhoangCachDieuTri,
  xoaToanBoKho,
} from '../tien_ich/kho_du_lieu';
import { xuatHoSoThanhXML130 } from '../tien_ich/xml_helper';
import NhapFileXML, {
  chuyenKetQuaFileSangMangHoSoKho,
  taiNguonPhuThuocNhapXml,
  xuLyMotFileXmlChoBanGiamDinh,
} from '../tien_ich/nhap_file_xml';

const LOGO_PC = 'https://i.ibb.co/nNr9SQYr/logo-pc.png';
const TEN_SHEET_BAO_CAO_VI_PHAM = 'DS_Loi';
const MAU_COT_BAO_CAO_VI_PHAM = [
  'Mã LK',
  'Tên bệnh nhân',
  'Mã thẻ BHYT',
  'Thời gian vào - ra',
  'Mã bệnh nhân',
  'Mã luật',
  'Tên quy tắc',
  'Namespace quy tắc',
  'Nguồn quy tắc',
  'Ngày y lệnh (XML)',
  'Ngày kết quả (XML)',
  'Bác sĩ chỉ định (mã)',
  'Bác sĩ thực hiện (mã)',
  'Vị trí trong XML (sai ở đâu)',
  'Mô tả vi phạm (sai cái gì)',
  'Đề xuất khắc phục',
  'Cảnh báo',
  'Luồng giải trình',
  'Cơ sở pháp lý',
  'Đối chiếu chi tiết cảnh báo',
];
const DO_RONG_COT_BAO_CAO_VI_PHAM = [
  { wch: 16 },
  { wch: 28 },
  { wch: 20 },
  { wch: 28 },
  { wch: 18 },
  { wch: 14 },
  { wch: 36 },
  { wch: 24 },
  { wch: 24 },
  { wch: 22 },
  { wch: 22 },
  { wch: 28 },
  { wch: 28 },
  { wch: 88 },
  { wch: 48 },
  { wch: 52 },
  { wch: 48 },
  { wch: 42 },
  { wch: 42 },
  { wch: 72 },
];

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

const layGiaTriAnToan = (obj, tuKhoa) => {
  if (!obj) return 'N/A';
  const tuKhoaChuan = String(tuKhoa || '').toLowerCase().replace(/_/g, '');
  const keyTimThay = Object.keys(obj).find((key) => key.toLowerCase().replace(/_/g, '') === tuKhoaChuan);
  return keyTimThay && obj[keyTimThay] ? obj[keyTimThay] : 'N/A';
};

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
        record[matchField[1]] = matchField[2].trim();
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
          record[matchField[1]] = matchField[2].trim();
        }
        if (Object.keys(record).length > 0) result[loaiXML].push(record);
      }
    }
  }

  if (!coDuLieuBaoLanh) throw new Error('Không tìm thấy định dạng chuẩn QĐ130.');
  return result;
};

const chuanHoaMaLK = (giaTri) => String(giaTri || '').trim();

const choUICapNhat = () => new Promise((resolve) => setTimeout(resolve, 0));

const laCanhBaoPythonService = (canhBao = {}) => String(canhBao?.nguon_giam_dinh || '').trim().toUpperCase() === 'PYTHON_SERVICE';

const taoKhoaCanhBao = (canhBao = {}) => [
  String(canhBao?.ma_luat || ''),
  String(canhBao?.phan_he || ''),
  String(canhBao?.truong_loi || ''),
  String(canhBao?.index ?? -1),
  String(canhBao?.canh_bao || ''),
].join('|');

const hopNhatKetQuaGiamDinh = (danhSachJs = [], danhSachPython = []) => {
  const mapCanhBao = new Map();
  [...(Array.isArray(danhSachJs) ? danhSachJs : []), ...(Array.isArray(danhSachPython) ? danhSachPython : [])].forEach((item) => {
    mapCanhBao.set(taoKhoaCanhBao(item), item);
  });
  return gomTrungLapCanhBaoTheoMaLuatVaNoiDung(Array.from(mapCanhBao.values()));
};

const layKetQuaGiamDinhCoSan = (hoSo = {}) => {
  return Array.isArray(hoSo?.ket_qua_giam_dinh) ? hoSo.ket_qua_giam_dinh : null;
};

const taoMetaAuditPython = (hoSoPython = {}, ketQuaPython = {}) => {
  const metaCoSan = hoSoPython?.python_service_meta || {};
  const coverage = ketQuaPython?.coverage || {};
  const dsCanhBao = Array.isArray(hoSoPython?.ket_qua_giam_dinh) ? hoSoPython.ket_qua_giam_dinh : [];

  return {
    engine: ketQuaPython?.engine || metaCoSan?.engine || 'python-fastapi',
    timestamp: ketQuaPython?.timestamp || metaCoSan?.timestamp || new Date().toISOString(),
    coverage,
    supported_rules: coverage?.supported_rules || metaCoSan?.supported_rules || [],
    dm_kham_runtime_count: coverage?.dm_kham_runtime_count ?? metaCoSan?.dm_kham_runtime_count ?? 0,
    ma_khoa_kham_count: coverage?.ma_khoa_kham_count ?? metaCoSan?.ma_khoa_kham_count ?? 0,
    python_warning_count: dsCanhBao.filter(laCanhBaoPythonService).length,
  };
};

const ganMetaPythonServiceVaoHoSo = (danhSachHoSo = [], ketQuaPython = {}) => {
  return (Array.isArray(danhSachHoSo) ? danhSachHoSo : []).map((hoSo) => ({
    ...hoSo,
    python_service_audit: taoMetaAuditPython(hoSo, ketQuaPython),
    python_service_meta: {
      ...(hoSo?.python_service_meta || {}),
      ...(ketQuaPython?.coverage || {}),
      engine: ketQuaPython?.engine || hoSo?.python_service_meta?.engine || 'python-fastapi',
      timestamp: ketQuaPython?.timestamp || hoSo?.python_service_meta?.timestamp || new Date().toISOString(),
      supported_rules: ketQuaPython?.coverage?.supported_rules || hoSo?.python_service_meta?.supported_rules || [],
      python_warning_count: Array.isArray(hoSo?.ket_qua_giam_dinh)
        ? hoSo.ket_qua_giam_dinh.filter(laCanhBaoPythonService).length
        : 0,
    },
  }));
};

const layDanhSachKetQuaTuPythonService = (ketQuaPython, danhSachMacDinh = []) => {
  const claims = Array.isArray(ketQuaPython?.claims) ? ketQuaPython.claims : [];
  if (claims.length === 0) return null;

  const mapTheoMaLK = new Map(
    claims.map((item) => [chuanHoaMaLK(item?.ma_lk || item?.xml1?.MA_LK || item?.XML1?.MA_LK), item])
  );
  const tapDaGhep = new Set();
  let soHoSoKhop = 0;

  const danhSachDaGhep = (Array.isArray(danhSachMacDinh) ? danhSachMacDinh : []).map((hoSo) => {
    const maLK = chuanHoaMaLK(hoSo?.ma_lk || hoSo?.xml1?.MA_LK || hoSo?.XML1?.MA_LK);
    const hoSoPython = mapTheoMaLK.get(maLK);
    if (!hoSoPython) return hoSo;

    soHoSoKhop += 1;
    tapDaGhep.add(maLK);
    return {
      ...hoSo,
      ...hoSoPython,
      ma_lk: maLK || hoSoPython?.ma_lk || hoSo?.ma_lk,
      ket_qua_giam_dinh: Array.isArray(hoSoPython?.ket_qua_giam_dinh)
        ? hoSoPython.ket_qua_giam_dinh
        : (Array.isArray(hoSo?.ket_qua_giam_dinh) ? hoSo.ket_qua_giam_dinh : []),
    };
  });

  const danhSachBoSung = claims.filter((item) => !tapDaGhep.has(chuanHoaMaLK(item?.ma_lk || item?.xml1?.MA_LK || item?.XML1?.MA_LK)));
  const ketQua = [...danhSachDaGhep, ...danhSachBoSung];
  return soHoSoKhop > 0 || danhSachBoSung.length > 0 ? ketQua : null;
};

const nenHopNhatThemJsSauPython = (ketQuaPython = {}) => {
  const coverage = ketQuaPython?.coverage || {};
  return coverage?.mode === 'partial' || coverage?.fallback_recommended === true || coverage?.compatible_claim_results !== true;
};

const hopNhatDanhSachHoSoTuJsVaPython = (danhSachJs = [], danhSachPython = []) => {
  const mapPython = new Map(
    (Array.isArray(danhSachPython) ? danhSachPython : []).map((item) => [chuanHoaMaLK(item?.ma_lk || item?.xml1?.MA_LK || item?.XML1?.MA_LK), item])
  );
  const tapDaGhep = new Set();

  const danhSachHopNhat = (Array.isArray(danhSachJs) ? danhSachJs : []).map((hoSoJs) => {
    const maLK = chuanHoaMaLK(hoSoJs?.ma_lk || hoSoJs?.xml1?.MA_LK || hoSoJs?.XML1?.MA_LK);
    const hoSoPython = mapPython.get(maLK);
    if (!hoSoPython) return hoSoJs;

    tapDaGhep.add(maLK);
    return {
      ...hoSoJs,
      ...hoSoPython,
      ma_lk: maLK || hoSoJs?.ma_lk || hoSoPython?.ma_lk,
      ket_qua_giam_dinh: hopNhatKetQuaGiamDinh(hoSoJs?.ket_qua_giam_dinh, hoSoPython?.ket_qua_giam_dinh),
      python_service_audit: hoSoPython?.python_service_audit || hoSoJs?.python_service_audit,
      python_service_meta: hoSoPython?.python_service_meta || hoSoJs?.python_service_meta,
    };
  });

  const danhSachConLai = (Array.isArray(danhSachPython) ? danhSachPython : []).filter((hoSoPython) => {
    const maLK = chuanHoaMaLK(hoSoPython?.ma_lk || hoSoPython?.xml1?.MA_LK || hoSoPython?.XML1?.MA_LK);
    return !tapDaGhep.has(maLK);
  });

  return [...danhSachHopNhat, ...danhSachConLai];
};


const ManHinhTongQuan = ({ navigation }) => {
  const [dangTai, setDangTai] = useState(false);
  const [thongBaoDangTai, setThongBaoDangTai] = useState('Đang giám định hồ sơ...');
  const [thongKe, setThongKe] = useState({ tong: 0, sach: 0, loi: 0, giamDinhLai: 0, danhMuc: [] });
  const [rawDanhSach, setRawDanhSach] = useState([]); 
  const [khoaQuyTacDangChon, setKhoaQuyTacDangChon] = useState('');
  const [boLocLoaiUuTien, setBoLocLoaiUuTien] = useState('TAT_CA');
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
  /** Chỉ Web: nhật ký từng file khi chạy giám định tự động cả thư mục (không dùng alert). */
  const [logGiamDinhTuDongThuMuc, setLogGiamDinhTuDongThuMuc] = useState([]);
  const [popupTriThucVisible, setPopupTriThucVisible] = useState(false);
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
    { id: 'MOD_TRI_THUC_GD', route: 'TriThucTuGiamDinh', ten: '🧠 TRI THỨC TỪ GIÁM ĐỊNH' },
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

  useEffect(() => {
    fetchThongTinHeThong();
    const unsubscribe = navigation.addListener('focus', () => fetchThongTinHeThong());
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    let huy = false;
    (async () => {
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
  const coBoLocDangBat = boLocLoaiUuTien !== 'TAT_CA' || tuKhoaLocQuyTac.trim() !== '' || tuKhoaLocHoSo.trim() !== '';
  const danhSachLoiChiTietDashboard = useMemo(() => phangHoaDanhSachLoiChiTiet(rawDanhSach), [rawDanhSach]);
  const ketQuaTraCuuChiTiet = useMemo(() => locDanhSachLoiChiTiet(danhSachLoiChiTietDashboard, {
    tuKhoa: tuKhoaTraCuuChiTiet,
    loaiHienThi: loaiTraCuuChiTiet,
  }), [danhSachLoiChiTietDashboard, loaiTraCuuChiTiet, tuKhoaTraCuuChiTiet]);
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
  }, [boLocLoaiUuTien, danhMucDaLoc, khoaQuyTacDangChon, tuKhoaLocHoSo, tuKhoaLocQuyTac]);

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

  const chiTietModalDaLoc = useMemo(() => {
    const raw = quyTacChoModalChiTiet?.chi_tiet_phat_sinh || [];
    const q = chuanHoaToken(tuKhoaLocChiTietModal).trim();
    if (!q) return raw;
    return raw.filter((c) => {
      const s = chuanHoaToken([
        c?.ma_lk,
        c?.ten_bn,
        c?.canh_bao,
        c?.vi_tri_xml,
        c?.ma_luat,
      ].filter(Boolean).join(' | '));
      return s.includes(q);
    });
  }, [quyTacChoModalChiTiet, tuKhoaLocChiTietModal]);

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
      alert('Chưa tìm thấy hồ sơ trong kho để xuất XML. Hãy giám định lại hoặc mở hồ sơ từ Kho lưu trữ.');
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
        alert('Không có hồ sơ hợp lệ để giám định.');
      }
      return;
    }

    await tienHanhGiamDinh(danhSachHopLe, { soHoSoGhiDe, boQuaThongBaoCuoi: tuyChon.boQuaThongBaoCuoi });
  };

  /**
   * Web: chọn cả thư mục → xử lý tuần tự từng file .xml → giám định + lưu kho giống nút "Chuyển dữ liệu",
   * không hiện alert từng bước; kết quả ghi vào log trên màn hình. Luồng "Chọn XML" thông thường không đổi.
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

      setLogGiamDinhTuDongThuMuc([`${new Date().toLocaleTimeString('vi-VN')}: Bắt đầu ${dsFile.length} file XML (thư mục).`]);

      let { lichSuGiamDinh, danhSachMaLKDaCo } = await taiNguonPhuThuocNhapXml();
      const tong = dsFile.length;
      let soLuuDuoc = 0;
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
        await nhanDienHoSoTuFile(hoSoGui, { boQuaThongBaoCuoi: true });
        soLuuDuoc += 1;
        const maNorm = String(maStr || '').trim().toUpperCase();
        if (maNorm && !danhSachMaLKDaCo.includes(maNorm)) {
          danhSachMaLKDaCo = [...danhSachMaLKDaCo, maNorm];
        }

        const engineNhan = cheDoGiamDinh === CHE_DO_GIAM_DINH.PYTHON ? 'Python' : 'JS';
        setLogGiamDinhTuDongThuMuc((prev) => [
          ...prev,
          `✓ [${i + 1}/${tong}] ${file.name} → MA_LK ${maStr} · ${soLoiSoBo} cảnh báo (quét sơ bộ) · đã lưu kho (${engineNhan})`,
        ]);
      }

      setLogGiamDinhTuDongThuMuc((prev) => [
        ...prev,
        `— Hoàn tất: ${soLuuDuoc} hồ sơ đã lưu, ${soLoi} file bỏ qua/lỗi / ${tong} file XML.`,
      ]);
      if (ev.target) ev.target.value = '';
    };
    input.click();
  };

  const tienHanhGiamDinh = async (danhSachTienHanh, thongTinThem = {}) => {
    setDangTai(true);
    setThongBaoDangTai('Đang chuẩn bị giám định nhiều hồ sơ...');
    await choUICapNhat();
    
    try {
      const danhSachDaCoKetQua = danhSachTienHanh.map((hoSo) => {
        const ketQuaCoSan = layKetQuaGiamDinhCoSan(hoSo);
        return ketQuaCoSan ? { ...hoSo, ket_qua_giam_dinh: ketQuaCoSan } : hoSo;
      });

      let danhSachLuuKho = null;
      let daFallbackTuPythonSangJs = false;
      let daHopNhatPythonVaJs = false;
      let daDungPythonService = false;

      if (cheDoGiamDinh === CHE_DO_GIAM_DINH.PYTHON) {
        daDungPythonService = true;
        setThongBaoDangTai('Đang kết nối Python service...');
        await choUICapNhat();

        const ketQuaKiemTraPython = await ketNoiPythonServiceLucKhoiDong();
        if (!ketQuaKiemTraPython.ok) {
          daFallbackTuPythonSangJs = true;
          setThongBaoDangTai(
            `Python chưa sẵn sàng (đã thử ${ketQuaKiemTraPython.soLanThu || '?'} lần), đang fallback JS...`,
          );
          await choUICapNhat();
          danhSachLuuKho = await chayBoMayGiamDinhNhieuHoSoV3(danhSachDaCoKetQua, {
            onProgress: async ({ completed, total }) => {
              setThongBaoDangTai(`Fallback JS: đang giám định hồ sơ ${completed}/${total}...`);
              if (completed % 2 === 0 || completed === total) {
                await choUICapNhat();
              }
            },
          });
        } else {
          try {
            const { dmKhamTongHop, maKhoaKham } = await taiDanhMucRuntimeChoPython();

            setThongBaoDangTai('Đang gửi batch hồ sơ sang Python service...');
            await choUICapNhat();
            const ketQuaPython = await auditClaimsBangPythonService({
              claims: danhSachDaCoKetQua,
              options: {
                source: 'dashboard_tong_quan',
                mode: 'batch_audit',
                expect_compatible_claim_results: true,
                dm_kham: dmKhamTongHop,
                ma_khoa_kham: maKhoaKham,
              },
            });
            const danhSachTuPython = layDanhSachKetQuaTuPythonService(ketQuaPython, danhSachDaCoKetQua);

            if (danhSachTuPython) {
              const danhSachPythonDaGanMeta = ganMetaPythonServiceVaoHoSo(danhSachTuPython, ketQuaPython);
              if (nenHopNhatThemJsSauPython(ketQuaPython)) {
                daHopNhatPythonVaJs = true;
                setThongBaoDangTai('Python service đã trả kết quả batch, đang hợp nhất thêm engine JS để giữ đủ chức năng...');
                await choUICapNhat();
                const danhSachJs = await chayBoMayGiamDinhNhieuHoSoV3(danhSachDaCoKetQua, {
                  onProgress: async ({ completed, total }) => {
                    setThongBaoDangTai(`Hợp nhất JS: đang giám định hồ sơ ${completed}/${total}...`);
                    if (completed % 2 === 0 || completed === total) {
                      await choUICapNhat();
                    }
                  },
                });
                danhSachLuuKho = hopNhatDanhSachHoSoTuJsVaPython(danhSachJs, danhSachPythonDaGanMeta);
              } else {
                danhSachLuuKho = danhSachPythonDaGanMeta;
              }
            } else {
              daFallbackTuPythonSangJs = true;
              setThongBaoDangTai('Python service chưa trả kết quả chi tiết, đang fallback sang engine JS...');
              await choUICapNhat();
              const danhSachDaGanMeta = ganMetaPythonServiceVaoHoSo(danhSachDaCoKetQua, ketQuaPython);
              danhSachLuuKho = await chayBoMayGiamDinhNhieuHoSoV3(danhSachDaGanMeta, {
                onProgress: async ({ completed, total }) => {
                  setThongBaoDangTai(`Fallback JS: đang giám định hồ sơ ${completed}/${total}...`);
                  if (completed % 2 === 0 || completed === total) {
                    await choUICapNhat();
                  }
                },
              });
            }
          } catch (pythonError) {
            daFallbackTuPythonSangJs = true;
            console.warn('[TongQuan] Python service lỗi, chuyển fallback sang JS:', pythonError);
            setThongBaoDangTai('Python service lỗi, đang fallback sang engine JS...');
            await choUICapNhat();
            danhSachLuuKho = await chayBoMayGiamDinhNhieuHoSoV3(danhSachDaCoKetQua, {
              onProgress: async ({ completed, total }) => {
                setThongBaoDangTai(`Fallback JS: đang giám định hồ sơ ${completed}/${total}...`);
                if (completed % 2 === 0 || completed === total) {
                  await choUICapNhat();
                }
              },
            });
          }
        }
      } else {
        danhSachLuuKho = await chayBoMayGiamDinhNhieuHoSoV3(danhSachDaCoKetQua, {
          onProgress: async ({ completed, total }) => {
            setThongBaoDangTai(`Đang giám định hồ sơ ${completed}/${total}...`);
            if (completed % 2 === 0 || completed === total) {
              await choUICapNhat();
            }
          },
        });
      }

      // [CẬP NHẬT LÕI MẠNH MẼ NHẤT]: Gửi thẳng danh sách đã giám định vào hàm luuHoSoVaoKho chuẩn
      const ketQuaLuu = await luuHoSoVaoKho(danhSachLuuKho);
      if (ketQuaLuu) {
        const soHoSoGhiDe = Number(thongTinThem?.soHoSoGhiDe) || 0;
        fetchThongTinHeThong();
        let msg = daFallbackTuPythonSangJs
          ? `Đã gửi ${danhSachLuuKho.length} hồ sơ qua Python service và tự fallback sang engine JS để giữ kết quả giám định chi tiết.`
          : daHopNhatPythonVaJs
            ? `Đã giám định ${danhSachLuuKho.length} hồ sơ bằng Python service và hợp nhất thêm engine JS để giữ đủ chức năng hệ thống hiện có.`
            : daDungPythonService
              ? `Đã giám định và lưu ${danhSachLuuKho.length} hồ sơ bằng Python service thành công.`
              : soHoSoGhiDe > 0
                ? `Đã giám định lại ${danhSachLuuKho.length} hồ sơ. Trong đó ${soHoSoGhiDe} hồ sơ trùng MA_LK đã được ghi đè.`
                : `Đã giám định và lưu ${danhSachLuuKho.length} hồ sơ thành công.`;

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
      if (!thongTinThem?.boQuaThongBaoCuoi) {
        const msg = err && typeof err.message === 'string' && err.message.trim() ? err.message.trim() : '';
        alert(msg ? `Lỗi xử lý giám định: ${msg}` : 'Lỗi xử lý giám định.');
      }
      console.error(err);
    } finally {
      setDangTai(false);
      setThongBaoDangTai('Đang giám định hồ sơ...');
    }
  };

  const handleResetKho = async () => {
    if (confirm(
      'Xóa KHO LÀM VIỆC (danh sách hồ sơ đang giám định trên màn hình)? '
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
    if (rawDanhSach.length === 0) return;

    let mapHoTenNs;
    try {
      mapHoTenNs = await taiMapHoTenNhanSuBaoCao();
    } catch (_e) {
      mapHoTenNs = new Map();
    }

    const excelData = [];
    rawDanhSach.forEach(hs => {
      const dsLoi = hs.ket_qua_giam_dinh || [];
      dsLoi.forEach(loi => {
        const canhBao = String(layGiaTriAnToan(loi, 'canhbao') || 'N/A');
        const noiDungLoi = String(layGiaTriAnToan(loi, 'noi_dung') || layGiaTriAnToan(loi, 'mota') || 'N/A');
        const metaQuyTac = suyRaNamespaceVaNguonQuyTac(loi);
        const nsRaw = layGiaTriAnToan(loi, 'namespacequytac');
        const nguonRaw = layGiaTriAnToan(loi, 'nguonquytac');
        const namespaceQuyTac = String(
          (nsRaw !== 'N/A' && String(nsRaw).trim() !== '' ? nsRaw : metaQuyTac.namespace_quy_tac) || ''
        ).trim() || 'QUY_TAC_NOI_BO';
        const nguonQuyTac = String(
          (nguonRaw !== 'N/A' && String(nguonRaw).trim() !== '' ? nguonRaw : metaQuyTac.nguon_quy_tac) || ''
        ).trim() || 'dong_co_giam_dinh';
        const luongGiaiTrinh = String(layGiaTriAnToan(loi, 'luonggiaitrinh') || 'N/A');
        const coSoPhapLy = String(layGiaTriAnToan(loi, 'cosophaply') || 'N/A');
        const viTriTrongXml = taoViTriXmlBaoCaoDayDuTuLoi(loi, hs);
        const lamSangXml = layNgayYLenhNgayKqVaBacSiTuLoiHoSo(loi, hs);
        const bsChiDinh = boSungHoTenChoMaBacSiBaoCao(lamSangXml.bacSiChiDinh || 'N/A', mapHoTenNs);
        const bsThucHien = boSungHoTenChoMaBacSiBaoCao(lamSangXml.bacSiThucHien || 'N/A', mapHoTenNs);
        const moTaViPham = taoMoTaBanChatViPhamTuLoi(loi);
        const deXuatKhacPhuc = taoDeXuatKhacPhucTuLoi(loi);
        const doiChieuChiTietCanhBao = [
          noiDungLoi !== 'N/A' ? `Lỗi chi tiết: ${noiDungLoi}` : '',
          canhBao !== 'N/A' ? `Cảnh báo: ${canhBao}` : '',
        ].filter(Boolean).join(' || ') || 'N/A';
        const maThe = String(hs?.xml1?.MA_THE_BHYT || hs?.xml1?.SO_THE_BHYT || hs?.ma_the_bhyt || '');
        const tuNgay = String(hs?.xml1?.NGAY_VAO || hs?.xml1?.TU_NGAY || '');
        const denNgay = String(hs?.xml1?.NGAY_RA || hs?.xml1?.DEN_NGAY || '');
        const thoiGianTuDen = (tuNgay || denNgay) ? `${tuNgay} - ${denNgay}` : 'N/A';
        const maBenhNhan = String(hs?.xml1?.MA_BN || hs?.xml1?.MA_BENH_NHAN || hs?.ma_bn || hs?.ma_benh_nhan || '');

        excelData.push([
          String(hs.ma_lk || ''),
          String(hs.ten_bn || hs.ten_benh_nhan || hs.xml1?.HO_TEN || ''),
          maThe || 'N/A',
          thoiGianTuDen,
          maBenhNhan || 'N/A',
          String(layGiaTriAnToan(loi, 'maluat') || 'N/A'),
          String(layGiaTriAnToan(loi, 'tenquytac') || 'N/A'),
          namespaceQuyTac,
          nguonQuyTac,
          lamSangXml.ngayYLenh || 'N/A',
          lamSangXml.ngayKetQua || 'N/A',
          bsChiDinh,
          bsThucHien,
          viTriTrongXml,
          moTaViPham,
          deXuatKhacPhuc,
          canhBao,
          luongGiaiTrinh,
          coSoPhapLy,
          doiChieuChiTietCanhBao,
        ]);
      });
    });

    if (excelData.length === 0) {
      alert('Không có dữ liệu vi phạm để xuất.');
      return;
    }

    const ws = XLSX.utils.aoa_to_sheet([MAU_COT_BAO_CAO_VI_PHAM, ...excelData]);
    ws['!cols'] = DO_RONG_COT_BAO_CAO_VI_PHAM;

    const soDong = excelData.length + 1;
    ws['!autofilter'] = { ref: `A1:T${soDong}` };

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, TEN_SHEET_BAO_CAO_VI_PHAM);
    XLSX.writeFile(wb, `Bao_Cao_Vi_Pham_${Date.now()}.xlsx`);
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

      <View style={styles.dashboard_layout}>
        <View style={styles.sidebar_dashboard}>
          <Text style={styles.sidebar_title}>ĐIỀU HƯỚNG</Text>
          <ScrollView style={styles.sidebar_scroll} showsVerticalScrollIndicator={false}>
            <View style={styles.module_grid}>
              {menuSidebar.map((item) => {
                const cfg = MODULE_ICONS[item.id] || { icon: '📦', mau: '#607D8B', mauNhat: '#ECEFF1' };
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.module_card, styles.module_card_sidebar, { borderLeftColor: cfg.mau }]}
                    onPress={() => navigation.navigate(item.route)}
                  >
                    <View style={[styles.module_icon_wrap, { backgroundColor: cfg.mauNhat }]}>
                      <Text style={styles.module_icon}>{cfg.icon}</Text>
                    </View>
                    <Text style={styles.module_name}>{item.ten}</Text>
                  </TouchableOpacity>
                );
              })}
              <TouchableOpacity
                style={[styles.module_card, styles.module_card_sidebar, { borderLeftColor: '#546E7A' }]}
                onPress={handleResetKho}
              >
                <View style={[styles.module_icon_wrap, { backgroundColor: '#ECEFF1' }]}>
                  <Text style={styles.module_icon}>🔄</Text>
                </View>
                <Text style={styles.module_name}>Làm mới kho</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>

        <ScrollView style={styles.dashboard_main} showsVerticalScrollIndicator={false}>

        {/* ── 4. KHU VỰC VẬN HÀNH THỐNG NHẤT ── */}
        <View style={[styles.section_block, styles.section_block_compact_center]}>
          <Text style={[styles.section_title, styles.section_title_center]}>Luồng giám định tổng quát</Text>
          <Text style={[styles.section_note, styles.section_note_center]}>Dashboard chỉ giữ luồng nạp hồ sơ, phần helper nằm riêng để tránh chiếm chỗ.</Text>
          <View style={styles.import_zone}>
            <View style={styles.import_zone_glow_primary} />
            <View style={styles.import_zone_glow_secondary} />
            <View style={styles.import_zone_sheen} />
            {dangTai ? (
              <View style={styles.loading_wrap}>
                <ActivityIndicator size="large" color="#D81B60" />
                <Text style={styles.loading_txt}>{thongBaoDangTai}</Text>
              </View>
            ) : (
              <View style={styles.import_inner}>
                <View style={styles.import_content_single}>
                  <View style={styles.import_upload_card_single}>
                    <Text style={styles.audit_engine_title}>Nạp hồ sơ XML</Text>
                    <Text style={[styles.import_upload_subtitle, styles.import_upload_subtitle_center]}>
                      Giám định nhiều hồ sơ trong cùng một luồng. Chế độ hiện hành: {cheDoGiamDinh === CHE_DO_GIAM_DINH.PYTHON ? 'Python service' : 'JS nội bộ'}.
                    </Text>
                    <Text style={styles.python_warmup_hint}>
                      {trangThaiPythonKhoiDong.daKiemTra
                        ? (trangThaiPythonKhoiDong.ok
                          ? `🐍 Python warm-up: OK · ${trangThaiPythonKhoiDong.baseUrl || '—'}${trangThaiPythonKhoiDong.lanThu > 1 ? ` · thử ${trangThaiPythonKhoiDong.lanThu} lần` : ''}`
                          : `🐍 Python warm-up: chưa kết nối · ${trangThaiPythonKhoiDong.chiTiet || '—'} · ${trangThaiPythonKhoiDong.baseUrl || '—'}${trangThaiPythonKhoiDong.lanThu ? ` · đã thử ${trangThaiPythonKhoiDong.lanThu} lần` : ''}`)
                        : '🐍 Python warm-up: đang kiểm tra kết nối (tự thử lại)...'}
                    </Text>
                    <View style={styles.import_upload_highlights_compact}>
                      <View style={styles.import_upload_highlight_chip}>
                        <Text style={styles.import_upload_highlight_key}>Batch nhiều hồ sơ</Text>
                      </View>
                      <View style={styles.import_upload_highlight_chip}>
                        <Text style={styles.import_upload_highlight_key}>JS fallback an toàn</Text>
                      </View>
                      <View style={styles.import_upload_highlight_chip}>
                        <Text style={styles.import_upload_highlight_key}>Hybrid nằm trong Helper</Text>
                      </View>
                    </View>
                    <View style={styles.import_action_row}>
                      <NhapFileXML
                        onDuLieuSanSang={nhanDienHoSoTuFile}
                        styleButton={styles.import_pick_btn_compact}
                        textButton="📂 Chọn XML"
                      />
                      <TouchableOpacity style={styles.helper_redirect_btn} onPress={() => navigation.navigate('Helper')}>
                        <Text style={styles.helper_redirect_txt}>🧰 Mở Helper Hybrid</Text>
                      </TouchableOpacity>
                    </View>

                    {Platform.OS === 'web' ? (
                      <View style={styles.import_auto_folder_wrap}>
                        <Text style={styles.import_auto_folder_title}>Nâng cao — giám định tự động cả thư mục</Text>
                        <Text style={styles.import_auto_folder_note}>
                          Chọn một thư mục chứa file .xml: ứng dụng xử lý lần lượt từng file, dùng cùng engine với luồng
                          nạp thông thường (Python service nếu bật, không thì JS), lưu kho và hiển thị nhật ký ngay trên
                          màn hình — không dùng hộp thoại xác nhận từng file.
                        </Text>
                        <TouchableOpacity
                          style={[styles.import_auto_folder_btn, dangTai && styles.import_auto_folder_btn_disabled]}
                          onPress={chayGiamDinhTuDongTrenThuMuc}
                          disabled={dangTai}
                        >
                          <Text style={styles.import_auto_folder_btn_txt}>📁 Chọn thư mục XML — chạy tự động</Text>
                        </TouchableOpacity>
                        {logGiamDinhTuDongThuMuc.length > 0 ? (
                          <View style={styles.import_auto_folder_log}>
                            <View style={styles.import_auto_folder_log_header}>
                              <Text style={styles.import_auto_folder_log_title}>Nhật ký</Text>
                              <TouchableOpacity onPress={() => setLogGiamDinhTuDongThuMuc([])}>
                                <Text style={styles.import_auto_folder_clear}>Xóa log</Text>
                              </TouchableOpacity>
                            </View>
                            <ScrollView style={styles.import_auto_folder_scroll} nestedScrollEnabled>
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
                <TouchableOpacity style={[styles.btn_export, { backgroundColor: '#2E7D32' }]} onPress={handleExportLoiExcel}>
                  <Text style={styles.btn_export_txt}>📥 Xuất báo cáo</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View style={styles.rule_filter_panel}>
            <View style={styles.rule_filter_chip_row}>
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
                  ]}>
                    {boLoc.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
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
                    setTuKhoaLocQuyTac('');
                    setTuKhoaLocHoSo('');
                  }}
                >
                  <Text style={styles.rule_filter_clear_txt}>Xóa lọc</Text>
                </TouchableOpacity>
              ) : null}
            </View>
            <Text style={styles.rule_filter_status}>Hiển thị {danhMucDaLoc.length}/{thongKe.danhMuc.length} quy tắc</Text>
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
                      Chạm để mở danh sách XML phát sinh, sửa lỗi và đi tới rule ON/OFF.
                      {Platform.OS === 'web' ? ' · Chuột phải: xem cửa sổ chi tiết ca lỗi.' : ' · Nhấn giữ: xem cửa sổ chi tiết ca lỗi.'}
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
              {quyTacDangChon.chi_tiet_phat_sinh.map((chiTiet, idx) => (
                <View key={taoKhoaChiTietPhatSinh(chiTiet) || idx} style={styles.rule_instance_card}>
                  <View style={styles.rule_instance_header}>
                    <View style={{ flex: 1, paddingRight: 12 }}>
                      <Text style={styles.rule_instance_title}>{chiTiet.ma_lk || 'N/A'} • {chiTiet.ten_bn || 'Không rõ bệnh nhân'}</Text>
                      <Text style={styles.rule_instance_location}>{chiTiet.vi_tri_xml}</Text>
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
                      <Text style={styles.rule_instance_location}>{chiTiet.ma_luat || 'N/A'} • {chiTiet.vi_tri_xml}</Text>
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

        </ScrollView>
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
                <Text style={styles.tri_thuc_modal_sub}>Chọn chức năng — trích dẫn nội bộ, không tra web.</Text>
                {menuTriThucPopup.map((item) => {
                  const cfg = MODULE_ICONS[item.id] || { icon: '📦', mau: '#607D8B', mauNhat: '#ECEFF1' };
                  const label =
                    item.id === 'MOD_TRO_LY_TRI_THUC'
                      ? 'Trợ lý tri thức (RAG)'
                      : item.id === 'MOD_TRI_THUC_GD'
                        ? 'Tri thức từ giám định'
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
                        <Text style={styles.tri_thuc_modal_row_hint} numberOfLines={2}>
                          {item.id === 'MOD_TRO_LY_TRI_THUC'
                            ? 'Cửa sổ chat — thư viện, phác đồ chuyên môn, tri thức đã lưu'
                            : 'Bài học và xác nhận cảnh báo từ ca giám định (màn hình riêng)'}
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
              Truy vấn và xử lý từng ca (cùng nguồn dữ liệu với bảng quy tắc). Web: chuột phải vào dòng quy tắc; cảm ứng: nhấn giữ dòng.
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
              Hiển thị {chiTietModalDaLoc.length} / {(quyTacChoModalChiTiet?.chi_tiet_phat_sinh || []).length} ca
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
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    gap: 12,
    padding: 12,
  },
  sidebar_dashboard: {
    ...(Platform.OS === 'web' ? { width: 320 } : { width: '100%', maxHeight: 280 }),
    backgroundColor: '#F7FAFC',
    borderWidth: 1,
    borderColor: '#D8E2EE',
    borderRadius: 16,
    padding: 12,
    ...Platform.select({ web: { boxShadow: CD.web.shadow_card } }),
  },
  sidebar_title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 10,
    fontFamily: CD.font.family,
  },
  sidebar_scroll: { flex: 1 },
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
  },
  tri_thuc_modal_row_chev: { fontSize: 18, color: '#94A3B8', fontWeight: '700' },

  // ── SECTIONS ──
  section_block: { marginHorizontal: 8, marginTop: 14 },
  section_block_compact_center: { alignItems: 'center', marginTop: 10 },
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

  // ── MODULE GRID ──
  module_grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  module_card: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: CD.bg.glass_card,
    borderRadius: 14,
    paddingVertical: 14, paddingHorizontal: 18,
    borderLeftWidth: 4,
    borderWidth: 1, borderColor: CD.border.glass,
    minWidth: 200, flex: 1,
    ...Platform.select({ web: { backdropFilter: CD.web.blur_card, WebkitBackdropFilter: CD.web.blur_card, boxShadow: CD.web.shadow_card, cursor: 'pointer' } }),
  },
  module_card_sidebar: {
    minWidth: '100%',
    flex: 0,
    backgroundColor: '#FFFFFF',
  },
  module_icon_wrap: { width: 42, height: 42, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  module_icon: { fontSize: 22 },
  module_name: { fontSize: 17, fontWeight: '700', fontFamily: CD.font.family, flex: 1, color: '#111827' },

  // ── IMPORT ZONE ──
  import_zone: {
    backgroundColor: 'rgba(214,235,255,0.16)',
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.30)',
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 640 : '100%',
    alignSelf: 'center',
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOpacity: 0.14,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 10 },
    elevation: 7,
    ...Platform.select({
      web: {
        backdropFilter: 'blur(20px) saturate(150%)',
        WebkitBackdropFilter: 'blur(20px) saturate(150%)',
        boxShadow: '0 28px 54px rgba(15,23,42,0.15), 0 10px 22px rgba(56,189,248,0.12), inset 0 1px 0 rgba(255,255,255,0.34)',
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
    shadowColor: '#1E293B',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
    ...Platform.select({
      web: {
        backdropFilter: 'blur(16px) saturate(150%)',
        WebkitBackdropFilter: 'blur(16px) saturate(150%)',
        boxShadow: '0 18px 34px rgba(15,23,42,0.11), 0 6px 18px rgba(14,165,233,0.08), inset 0 1px 0 rgba(255,255,255,0.40)',
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
    shadowColor: '#2563EB',
    shadowOpacity: 0.32,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
    ...Platform.select({
      web: {
        boxShadow: '0 16px 30px rgba(37,99,235,0.34), inset 0 1px 0 rgba(255,255,255,0.30), inset 0 -2px 0 rgba(15,23,42,0.10)',
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
  workspace_header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  export_btns: { flexDirection: 'row', gap: 10 },
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
    shadowColor: '#020617',
    shadowOpacity: 0.18,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
    ...Platform.select({
      web: {
        backdropFilter: CD.web.blur_card,
        WebkitBackdropFilter: CD.web.blur_card,
        boxShadow: '0 18px 38px rgba(2,6,23,0.20), inset 0 1px 0 rgba(255,255,255,0.16)',
      },
    }),
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
    shadowColor: '#020617',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    ...Platform.select({ web: { cursor: 'pointer', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12)' } }),
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
    shadowColor: '#020617',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    ...Platform.select({
      web: {
        outlineStyle: 'none',
        backdropFilter: CD.web.blur_input,
        WebkitBackdropFilter: CD.web.blur_input,
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.10)',
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
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    ...Platform.select({ web: { cursor: 'pointer', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.10)' } }),
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
    shadowColor: '#020617',
    shadowOpacity: 0.16,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
    ...Platform.select({
      web: {
        backdropFilter: 'blur(16px) saturate(140%)',
        WebkitBackdropFilter: 'blur(16px) saturate(140%)',
        boxShadow: '0 14px 28px rgba(2,6,23,0.18), inset 0 1px 0 rgba(255,255,255,0.14)',
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