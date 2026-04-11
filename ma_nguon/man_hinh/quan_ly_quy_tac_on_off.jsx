import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as XLSX from 'xlsx';
import { CD } from '../tien_ich/chu_de_giao_dien';
import { useScaleGiaoDien } from '../tien_ich/diem_anh_man_hinh';
import { quayLaiAnToan } from '../tien_ich/dieu_huong_an_toan';
import { xoaCacheBoMayGiamDinh } from '../tien_ich/dong_co_giam_dinh';
import { layDanhSachLuatCdhaHardcoded } from '../tien_ich/luat_cdha_hardcoded';
import { layDanhSachLuatCongKhamHardcoded } from '../tien_ich/luat_cong_kham_hardcoded';
import { layDanhSachLuatDuLieuHardcoded } from '../tien_ich/luat_du_lieu_hardcoded';
import { layDanhSachLuatGiamDinhChuyenDeHardcoded } from '../tien_ich/luat_giam_dinh_chuyen_de_hardcoded';
import { layDanhSachLuatGiuongHardcoded } from '../tien_ich/luat_giuong_hardcoded';
import { layDanhSachLuatHanhChinhHardcoded } from '../tien_ich/luat_hanh_chinh_hardcoded';
import { layDanhSachLuatHopDongHardcoded } from '../tien_ich/luat_hop_dong_hardcoded';
import { layDanhSachLuatNhanSuHardcoded } from '../tien_ich/luat_nhan_su_hardcoded';
import { layDanhSachLuatThuocHardcoded } from '../tien_ich/luat_thuoc_hardcoded';
import {
    apGhiDeChoDongNoiBo,
    capNhatMapTrangThaiTuRowsNoiBo,
    chuanHoaKhoaMaLuatOnOff,
    isQuyTacNoiBoDangBat,
    luuMapGhiDeNoiDungQuyTacNoiBo,
    luuMapTrangThaiQuyTacNoiBo,
    luuTapMaLuatAnKhoiQuanLyNoiBo,
    suyRaThongTinQuanTriQuyTac,
    taiMapGhiDeNoiDungQuyTacNoiBo,
    taiMapTrangThaiQuyTacNoiBo,
    taiTapMaLuatAnKhoiQuanLyNoiBo,
    taoDanhSachQuyTacNoiBoTheoTab,
} from '../tien_ich/quy_tac_on_off_noi_bo';
import { xoaCacheRuleEngineDvkt } from '../tien_ich/rule_engine_dvkt_no_code';
import { damBaoSeedLuatPtttMuc11 } from '../tien_ich/seed_luat_pttt_muc11';

const DANH_SACH_TAB_MAC_DINH = [
  { id: 'LUAT_DU_LIEU', ten: 'Cấu trúc XML' },
  { id: 'LUAT_HANH_CHINH', ten: 'Hành chính' },
  { id: 'LUAT_CHUYEN_TUYEN', ten: 'Chuyển tuyến' },
  { id: 'LUAT_HOP_DONG', ten: 'Hợp đồng' },
  { id: 'LUAT_CONG_KHAM', ten: 'Công khám' },
  { id: 'LUAT_CDHA', ten: 'DVKT/CĐHA' },
  { id: 'LUAT_MAU', ten: 'Máu' },
  { id: 'LUAT_THUOC', ten: 'Thuốc' },
  { id: 'LUAT_GIUONG', ten: 'Giường bệnh' },
  { id: 'LUAT_NHAN_SU', ten: 'Nhân sự' },
  { id: 'LUAT_PTTT', ten: 'Phẫu thuật/Thủ thuật' },
];

const ALIAS_TAB_ID = {
  LUAT_DU_LIEU: 'XML_DATA',
  XML_DATA: 'LUAT_DU_LIEU',
  LUAT_HANH_CHINH: 'XML1',
  XML1: 'LUAT_HANH_CHINH',
  LUAT_CONG_KHAM: 'KHAM_BENH',
  KHAM_BENH: 'LUAT_CONG_KHAM',
  LUAT_CDHA: 'XML3',
  XML3: 'LUAT_CDHA',
  LUAT_THUOC: 'XML2',
  XML2: 'LUAT_THUOC',
  LUAT_CHUYEN_TUYEN: 'NHAP_VIEN',
  NHAP_VIEN: 'LUAT_CHUYEN_TUYEN',
  LUAT_GIUONG: 'NOI_TRU',
  NOI_TRU: 'LUAT_GIUONG',
  LUAT_PTTT: 'PTTT',
  PTTT: 'LUAT_PTTT',
  LUAT_MAU: 'GAY_ME',
  GAY_ME: 'LUAT_MAU',
  LUAT_NHAN_SU: 'HAU_PHAU',
  HAU_PHAU: 'LUAT_NHAN_SU',
  LUAT_HOP_DONG: 'XUAT_VIEN',
  XUAT_VIEN: 'LUAT_HOP_DONG',
};

const NHOM_HIEN_THI = {
  LUAT_DU_LIEU: 'Cấu trúc',
  LUAT_HANH_CHINH: 'Hành chính',
  LUAT_CHUYEN_TUYEN: 'Chuyển tuyến',
  LUAT_HOP_DONG: 'Hợp đồng',
  LUAT_CONG_KHAM: 'Công khám',
  LUAT_CDHA: 'DVKT',
  LUAT_MAU: 'Máu',
  LUAT_THUOC: 'Thuốc',
  LUAT_GIUONG: 'Giường bệnh',
  LUAT_NHAN_SU: 'Nhân viên',
  LUAT_PTTT: 'PTTT',
};

const parseJSONAnToan = (raw, fallback) => {
  try {
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const chuanHoaTabId = (tabId) => String(tabId || '').toUpperCase().replace(/[^A-Z0-9]/g, '');

const layTabIdTuStorageKey = (key) => {
  if (key.includes('_CHUNK_') || key.endsWith('_CHUNKS')) return '';
  if (key.startsWith('CDSS_DATA_')) return key.substring('CDSS_DATA_'.length);
  return '';
};

const timTabUngVien = (tabId, tapTabTrongStorage) => {
  const ungVien = new Set();
  const aliasId = ALIAS_TAB_ID[tabId];
  const normTab = chuanHoaTabId(tabId);
  const normAlias = chuanHoaTabId(aliasId);

  ungVien.add(tabId);
  if (aliasId) ungVien.add(aliasId);

  (tapTabTrongStorage || []).forEach((id) => {
    const normId = chuanHoaTabId(id);
    if (normId && (normId === normTab || (normAlias && normId === normAlias))) {
      ungVien.add(id);
    }
  });

  return Array.from(ungVien);
};

const chuanHoaDuLieuLuat = (raw) => {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === 'object' && Array.isArray(raw.data)) return raw.data;
  return [];
};

const laBat = (v) => String(v || 'ON').toUpperCase() === 'ON';
const laRuleNoiBo = (row) => String(row?._kind || row?.LOAI_QUY_TAC || '').toUpperCase() === 'BUILTIN';
const boMetaTam = (row) => {
  const clone = { ...(row || {}) };
  delete clone._kind;
  return clone;
};

const layTenQuyTac = (row) => String(row?.TEN_QUY_TAC || row?.ten_quy_tac || row?.TEN || row?.MA_LUAT || 'Quy tắc không tên');
const layMaLuat = (row) => String(row?.MA_LUAT || row?.ma_luat || '').trim();
const taoKhoaDong = (row, index) => `${layMaLuat(row) || 'RULE'}__${String(row?.id || index)}`;
const chuanHoaTuKhoa = (value) => String(value || '').trim().toUpperCase();
const taoDuLieuFormRong = () => ({
  MA_LUAT: '',
  TEN_QUY_TAC: '',
  DIEU_KIEN: '',
  CANH_BAO: '',
  NHOM_CANH_BAO: 'CANH_BAO',
  CHI_TIET_CANH_BAO: '',
  TRANG_THAI: 'ON',
});
const COT_FILE_RULE = ['STT', 'MA_LUAT', 'TEN_QUY_TAC', 'DIEU_KIEN', 'CANH_BAO', 'NHOM_CANH_BAO', 'CHI_TIET_CANH_BAO', 'TRANG_THAI'];
const BO_LOC_LOAI_QUY_TAC = [
  { id: 'TAT_CA', ten: 'Tất cả' },
  { id: 'XUAT_TOAN', ten: 'Xuất toán' },
  { id: 'CANH_BAO', ten: 'Cảnh báo' },
];

const CUM_HIEN_THI_LOAI_QUY_TAC = [
  { id: 'XUAT_TOAN', ten: 'Quy tắc xuất toán' },
  { id: 'CANH_BAO', ten: 'Quy tắc cảnh báo' },
];

const lamGiauMetaQuanTriQuyTac = (row = {}) => {
  const thongTinQuanTri = suyRaThongTinQuanTriQuyTac(row);
  const nhomCanhBao = String(row?.NHOM_CANH_BAO || row?.nhom_canh_bao || thongTinQuanTri.nhom_canh_bao || 'CANH_BAO').toUpperCase() === 'XUAT_TOAN'
    ? 'XUAT_TOAN'
    : 'CANH_BAO';

  return {
    ...(row || {}),
    NHOM_CANH_BAO: nhomCanhBao,
    TAG_CANH_BAO: String(row?.TAG_CANH_BAO || row?.tag_canh_bao || thongTinQuanTri.tag_canh_bao || '').trim(),
    TAG_NGUON_CANH_BAO: String(row?.TAG_NGUON_CANH_BAO || row?.tag_nguon_canh_bao || thongTinQuanTri.tag_nguon_canh_bao || '').trim(),
    CHI_TIET_CANH_BAO: String(row?.CHI_TIET_CANH_BAO || row?.chi_tiet_canh_bao || thongTinQuanTri.chi_tiet_canh_bao || '').trim(),
  };
};

const layNhomCanhBao = (row) => String(row?.NHOM_CANH_BAO || row?.nhom_canh_bao || 'CANH_BAO').toUpperCase() === 'XUAT_TOAN'
  ? 'XUAT_TOAN'
  : 'CANH_BAO';
const layTagCanhBao = (row) => String(row?.TAG_CANH_BAO || row?.tag_canh_bao || '').trim();
const layTagNguonCanhBao = (row) => String(row?.TAG_NGUON_CANH_BAO || row?.tag_nguon_canh_bao || '').trim();
const layChiTietCanhBao = (row) => String(row?.CHI_TIET_CANH_BAO || row?.chi_tiet_canh_bao || '').trim();

const taoDongNoiBoTuNguon = (row, index, prefixId, maMacDinh, mapTrangThaiNoiBo) => {
  const maLuat = layMaLuat(row) || `${maMacDinh}_${index + 1}`;
  const macDinhBat = row?.TRANG_THAI !== 'OFF';
  return lamGiauMetaQuanTriQuyTac({
    ...(row || {}),
    id: row?.id || `${prefixId}-${index + 1}`,
    MA_LUAT: maLuat,
    TEN_QUY_TAC: layTenQuyTac(row),
    DIEU_KIEN: String(row?.DIEU_KIEN || row?.dieu_kien || ''),
    CANH_BAO: String(row?.CANH_BAO || row?.canh_bao || ''),
    TRANG_THAI: isQuyTacNoiBoDangBat(maLuat, mapTrangThaiNoiBo, macDinhBat) ? 'ON' : 'OFF',
    LOAI_QUY_TAC: 'BUILTIN',
    _kind: 'BUILTIN',
  });
};

const taoDongDuLieuTuImport = (row, index) => {
  const maLuat = String(row?.MA_LUAT || row?.ma_luat || '').trim();
  if (!maLuat) return null;
  const tenQuyTac = String(row?.TEN_QUY_TAC || row?.ten_quy_tac || '').trim() || maLuat;
  const dieuKien = String(row?.DIEU_KIEN || row?.dieu_kien || '').trim();
  const canhBao = String(row?.CANH_BAO || row?.canh_bao || '').trim();
  const trangThai = String(row?.TRANG_THAI || row?.trang_thai || 'ON').toUpperCase() === 'OFF' ? 'OFF' : 'ON';
  return lamGiauMetaQuanTriQuyTac({
    id: `imp_${Date.now()}_${index}_${Math.random().toString(36).slice(2, 8)}`,
    MA_LUAT: maLuat,
    TEN_QUY_TAC: tenQuyTac,
    DIEU_KIEN: dieuKien,
    CANH_BAO: canhBao,
    NHOM_CANH_BAO: String(row?.NHOM_CANH_BAO || row?.nhom_canh_bao || row?.LOAI_CANH_BAO || row?.loai_canh_bao || '').trim(),
    CHI_TIET_CANH_BAO: String(row?.CHI_TIET_CANH_BAO || row?.chi_tiet_canh_bao || '').trim(),
    TRANG_THAI: trangThai,
    _kind: 'DATASET',
  });
};

const tronRuleKhongTrung = (...sources) => {
  const seen = new Set();
  const out = [];
  sources.flat().forEach((row) => {
    const ma = String(row?.MA_LUAT || row?.ma_luat || '').trim().toUpperCase();
    const ten = String(row?.TEN_QUY_TAC || row?.ten_quy_tac || '').trim().toUpperCase();
    const dk = String(row?.DIEU_KIEN || row?.dieu_kien || '').trim().toUpperCase();
    const cb = String(row?.CANH_BAO || row?.canh_bao || '').trim().toUpperCase();
    const signature = `${ma}||${ten}||${dk}||${cb}`;
    if (!ma && !ten && !dk && !cb) return;
    if (seen.has(signature)) return;
    seen.add(signature);
    out.push(row);
  });
  return out;
};

const QuanLyQuyTacOnOff = ({ navigation, route }) => {
  const [dangTai, setDangTai] = useState(true);
  const [dangLuu, setDangLuu] = useState(false);
  const [duLieuTheoTab, setDuLieuTheoTab] = useState({});
  const [tuKhoaTimKiem, setTuKhoaTimKiem] = useState('');
  const [boLocLoaiQuyTac, setBoLocLoaiQuyTac] = useState('TAT_CA');
  const [tabQuanLyNoiDung, setTabQuanLyNoiDung] = useState(DANH_SACH_TAB_MAC_DINH[0].id);
  const [formRule, setFormRule] = useState(taoDuLieuFormRong());
  const [dangSuaRule, setDangSuaRule] = useState(null);
  const [chonXoaLoat, setChonXoaLoat] = useState({});
  const [maLuatCanHighlight, setMaLuatCanHighlight] = useState('');
  const [tapMaLuatAnKhoiQuanLy, setTapMaLuatAnKhoiQuanLy] = useState(() => new Set());
  const khoaDieuHuongGanNhat = useRef('');
  const { width: windowW } = useWindowDimensions();
  const { font: fontScale } = useScaleGiaoDien();
  const hepWeb = Platform.OS === 'web' && windowW < 960;

  const docTatCaDuLieu = async () => {
    setDangTai(true);
    try {
      await Promise.all([
        damBaoSeedLuatPtttMuc11(),
      ]);
      let allKeys = [];
      if (Platform.OS === 'web') {
        allKeys = Object.keys(window.localStorage || {});
      } else {
        allKeys = await AsyncStorage.getAllKeys();
      }

      const tabIdsTrongStorage = Array.from(new Set(allKeys.map(layTabIdTuStorageKey).filter(Boolean)));
      const ketQua = {};
      const mapTrangThaiNoiBo = await taiMapTrangThaiQuyTacNoiBo();
      const mapGhiDeNoiBo = await taiMapGhiDeNoiDungQuyTacNoiBo();
      const tapAnKhoiQuanLy = await taiTapMaLuatAnKhoiQuanLyNoiBo();
      setTapMaLuatAnKhoiQuanLy(tapAnKhoiQuanLy);
      const duLieuNoiBoTheoTab = taoDanhSachQuyTacNoiBoTheoTab(mapTrangThaiNoiBo);

      for (const tab of DANH_SACH_TAB_MAC_DINH) {
        const dsUngVien = timTabUngVien(tab.id, tabIdsTrongStorage);
        let dataLoaded = [];

        if (true) {
          for (const tabIdUngVien of dsUngVien) {
            let raw;
            if (Platform.OS === 'web') {
              raw = parseJSONAnToan(window.localStorage.getItem(`CDSS_DATA_${tabIdUngVien}`), []);
            } else {
              raw = parseJSONAnToan(await AsyncStorage.getItem(`CDSS_DATA_${tabIdUngVien}`), []);
            }
            const data = chuanHoaDuLieuLuat(raw);
            if (Array.isArray(data) && data.length > 0) {
              dataLoaded = data;
              break;
            }
          }
        }

        const dataRows = (Array.isArray(dataLoaded) ? dataLoaded : []).map((row) => lamGiauMetaQuanTriQuyTac({
          ...row,
          TRANG_THAI: row?.TRANG_THAI === 'OFF' ? 'OFF' : 'ON',
          _kind: 'DATASET',
        }));
        const builtInRows = (duLieuNoiBoTheoTab[tab.id] || []).map((row) => lamGiauMetaQuanTriQuyTac(
          { ...apGhiDeChoDongNoiBo(row, mapGhiDeNoiBo), _kind: 'BUILTIN' },
        ));

        if (tab.id === 'LUAT_DU_LIEU') {
          const dsHardcoded = layDanhSachLuatDuLieuHardcoded().map((row, index) => lamGiauMetaQuanTriQuyTac(
            apGhiDeChoDongNoiBo(taoDongNoiBoTuNguon(row, index, 'hardcoded-dulieu', 'DULIEU_HARDCODED', mapTrangThaiNoiBo), mapGhiDeNoiBo),
          ));
          ketQua[tab.id] = tronRuleKhongTrung(dataRows, builtInRows, dsHardcoded);
        } else

        if (tab.id === 'LUAT_HANH_CHINH') {
          const dsHardcoded = layDanhSachLuatHanhChinhHardcoded().map((row, index) => lamGiauMetaQuanTriQuyTac(
            apGhiDeChoDongNoiBo(taoDongNoiBoTuNguon(row, index, 'hardcoded-hanhchinh', 'HANHCHINH_HARDCODED', mapTrangThaiNoiBo), mapGhiDeNoiBo),
          ));
          ketQua[tab.id] = tronRuleKhongTrung(dataRows, builtInRows, dsHardcoded);
        } else

        if (tab.id === 'LUAT_THUOC') {
          const dsHardcoded = layDanhSachLuatThuocHardcoded().map((row, index) => lamGiauMetaQuanTriQuyTac(
            apGhiDeChoDongNoiBo(taoDongNoiBoTuNguon(row, index, 'hardcoded-thuoc', 'THUOC_HARDCODED', mapTrangThaiNoiBo), mapGhiDeNoiBo),
          ));
          ketQua[tab.id] = tronRuleKhongTrung(dataRows, builtInRows, dsHardcoded);
        } else

        if (tab.id === 'LUAT_CDHA') {
          const dsHardcoded = tronRuleKhongTrung(
            layDanhSachLuatCdhaHardcoded(),
            layDanhSachLuatGiamDinhChuyenDeHardcoded(),
          ).map((row, index) => lamGiauMetaQuanTriQuyTac(
            apGhiDeChoDongNoiBo(taoDongNoiBoTuNguon(row, index, 'hardcoded-cdha', 'CDHA_HARDCODED', mapTrangThaiNoiBo), mapGhiDeNoiBo),
          ));
          ketQua[tab.id] = tronRuleKhongTrung(dataRows, builtInRows, dsHardcoded);
        } else

        if (tab.id === 'LUAT_CONG_KHAM') {
          const dsHardcoded = layDanhSachLuatCongKhamHardcoded().map((row, index) => lamGiauMetaQuanTriQuyTac(
            apGhiDeChoDongNoiBo(taoDongNoiBoTuNguon(row, index, 'hardcoded-congkham', 'CK_HARDCODED', mapTrangThaiNoiBo), mapGhiDeNoiBo),
          ));
          ketQua[tab.id] = tronRuleKhongTrung(dataRows, builtInRows, dsHardcoded);
        } else

        if (tab.id === 'LUAT_NHAN_SU') {
          const dsHardcoded = layDanhSachLuatNhanSuHardcoded().map((row, index) => lamGiauMetaQuanTriQuyTac(
            apGhiDeChoDongNoiBo(taoDongNoiBoTuNguon(row, index, 'hardcoded-nhansu', 'NS_HARDCODED', mapTrangThaiNoiBo), mapGhiDeNoiBo),
          ));
          ketQua[tab.id] = tronRuleKhongTrung(dataRows, builtInRows, dsHardcoded);
        } else

        if (tab.id === 'LUAT_GIUONG') {
          const dsHardcoded = layDanhSachLuatGiuongHardcoded().map((row, index) => lamGiauMetaQuanTriQuyTac(
            apGhiDeChoDongNoiBo(taoDongNoiBoTuNguon(row, index, 'hardcoded-giuong', 'GB_HARDCODED', mapTrangThaiNoiBo), mapGhiDeNoiBo),
          ));
          ketQua[tab.id] = tronRuleKhongTrung(dataRows, builtInRows, dsHardcoded);
        } else

        if (tab.id === 'LUAT_HOP_DONG') {
          const dsHardcoded = layDanhSachLuatHopDongHardcoded().map((row, index) => lamGiauMetaQuanTriQuyTac(
            apGhiDeChoDongNoiBo(taoDongNoiBoTuNguon(row, index, 'hardcoded-hopdong', 'HD_HARDCODED', mapTrangThaiNoiBo), mapGhiDeNoiBo),
          ));
          ketQua[tab.id] = tronRuleKhongTrung(dataRows, builtInRows, dsHardcoded);
        } else {
          ketQua[tab.id] = tronRuleKhongTrung(dataRows, builtInRows);
        }
      }

      setDuLieuTheoTab(ketQua);
    } catch (e) {
      Alert.alert('Lỗi', `Không thể tải danh sách quy tắc: ${e.message || e}`);
    } finally {
      setDangTai(false);
    }
  };

  useEffect(() => {
    void docTatCaDuLieu();
  }, []);

  useEffect(() => {
    if (!DANH_SACH_TAB_MAC_DINH.some((tab) => tab.id === tabQuanLyNoiDung)) {
      setTabQuanLyNoiDung(DANH_SACH_TAB_MAC_DINH[0].id);
    }
  }, [tabQuanLyNoiDung]);

  useEffect(() => {
    const params = route?.params || {};
    const khoaDieuHuong = [
      String(params.initialTabId || ''),
      String(params.initialKeyword || ''),
      String(params.highlightedMaLuat || ''),
      String(params.boLocLoaiQuyTac || ''),
    ].join('|');
    if (!khoaDieuHuong || khoaDieuHuong === '|||' || khoaDieuHuongGanNhat.current === khoaDieuHuong) return;

    khoaDieuHuongGanNhat.current = khoaDieuHuong;

    const tabHopLe = DANH_SACH_TAB_MAC_DINH.find((tab) => tab.id === params.initialTabId);
    if (tabHopLe) setTabQuanLyNoiDung(tabHopLe.id);

    const tuKhoa = String(params.initialKeyword || params.highlightedMaLuat || '').trim();
    if (tuKhoa) setTuKhoaTimKiem(tuKhoa);

    const boLocHopLe = BO_LOC_LOAI_QUY_TAC.find((item) => item.id === params.boLocLoaiQuyTac);
    if (boLocHopLe) setBoLocLoaiQuyTac(boLocHopLe.id);

    setMaLuatCanHighlight(String(params.highlightedMaLuat || '').trim());
  }, [route?.params]);

  const danhSachNhom = useMemo(() => {
    const tuKhoa = chuanHoaTuKhoa(tuKhoaTimKiem);
    return DANH_SACH_TAB_MAC_DINH.map((tab) => {
      const rowsGoc = duLieuTheoTab[tab.id] || [];
      const rowsCoIndex = rowsGoc
        .map((row, index) => ({ row, index, key: taoKhoaDong(row, index) }))
        .filter(({ row }) => {
          if (!laRuleNoiBo(row)) return true;
          const ma = chuanHoaKhoaMaLuatOnOff(layMaLuat(row));
          return !tapMaLuatAnKhoiQuanLy.has(ma);
        });
      const rowsSauLoc = rowsCoIndex.filter(({ row }) => {
        if (boLocLoaiQuyTac !== 'TAT_CA' && layNhomCanhBao(row) !== boLocLoaiQuyTac) return false;
        if (!tuKhoa) return true;
        const noiDung = [
          layMaLuat(row),
          layTenQuyTac(row),
          String(row?.DIEU_KIEN || row?.dieu_kien || ''),
          String(row?.CANH_BAO || row?.canh_bao || ''),
          layChiTietCanhBao(row),
          String(row?.NHOM_CANH_BAO || row?.nhom_canh_bao || ''),
          layTagNguonCanhBao(row),
        ].join(' | ').toUpperCase();
        return noiDung.includes(tuKhoa);
      }).sort((a, b) => {
        const diffLoai = (layNhomCanhBao(a.row) === 'XUAT_TOAN' ? 0 : 1) - (layNhomCanhBao(b.row) === 'XUAT_TOAN' ? 0 : 1);
        if (diffLoai !== 0) return diffLoai;
        return layMaLuat(a.row).localeCompare(layMaLuat(b.row), 'vi');
      });
      const cumLoai = CUM_HIEN_THI_LOAI_QUY_TAC.map((item) => ({
        ...item,
        rules: rowsSauLoc.filter(({ row }) => layNhomCanhBao(row) === item.id),
      })).filter((item) => item.rules.length > 0 || boLocLoaiQuyTac === 'TAT_CA');
      return {
        tabId: tab.id,
        tenNhom: NHOM_HIEN_THI[tab.id] || tab.ten,
        rules: rowsSauLoc,
        cumLoai,
        tong: rowsGoc.length,
        tongHienThi: rowsSauLoc.length,
        dangBat: rowsSauLoc.filter(({ row }) => laBat(row.TRANG_THAI)).length,
        tongXuatToan: rowsSauLoc.filter(({ row }) => layNhomCanhBao(row) === 'XUAT_TOAN').length,
        tongCanhBao: rowsSauLoc.filter(({ row }) => layNhomCanhBao(row) === 'CANH_BAO').length,
      };
    }).filter((g) => g.tong > 0 && g.tongHienThi > 0);
  }, [boLocLoaiQuyTac, duLieuTheoTab, tuKhoaTimKiem, tapMaLuatAnKhoiQuanLy]);

  const tongTatCa = useMemo(() => {
    const tong = danhSachNhom.reduce((s, g) => s + g.tongHienThi, 0);
    const dangBat = danhSachNhom.reduce((s, g) => s + g.dangBat, 0);
    return { tong, dangBat };
  }, [danhSachNhom]);

  const danhSachMaLuatDaAn = useMemo(
    () => Array.from(tapMaLuatAnKhoiQuanLy).sort((a, b) => a.localeCompare(b, 'vi')),
    [tapMaLuatAnKhoiQuanLy],
  );

  const hienLaiQuyTacAn = async (maLuat) => {
    const ma = chuanHoaKhoaMaLuatOnOff(maLuat);
    try {
      setDangLuu(true);
      const tap = new Set(tapMaLuatAnKhoiQuanLy);
      tap.delete(ma);
      await luuTapMaLuatAnKhoiQuanLyNoiBo(tap);
      setTapMaLuatAnKhoiQuanLy(tap);
      await docTatCaDuLieu();
    } catch (e) {
      Alert.alert('Lỗi', e.message || String(e));
    } finally {
      setDangLuu(false);
    }
  };

  const thongKeLoaiQuyTac = useMemo(() => {
    const tatCaRows = Object.values(duLieuTheoTab).flat();
    return {
      XUAT_TOAN: tatCaRows.filter((row) => layNhomCanhBao(row) === 'XUAT_TOAN').length,
      CANH_BAO: tatCaRows.filter((row) => layNhomCanhBao(row) === 'CANH_BAO').length,
    };
  }, [duLieuTheoTab]);

  const duLieuTabQuanLy = useMemo(() => duLieuTheoTab[tabQuanLyNoiDung] || [], [duLieuTheoTab, tabQuanLyNoiDung]);
  const dsDongDuLieuTabQuanLy = useMemo(() => {
    return duLieuTabQuanLy
      .map((row, index) => ({ row, index, key: taoKhoaDong(row, index) }))
      .filter(({ row }) => !laRuleNoiBo(row));
  }, [duLieuTabQuanLy]);

  const boChonXoaLoat = (tabId) => {
    setChonXoaLoat((prev) => {
      const next = { ...(prev || {}) };
      delete next[tabId];
      return next;
    });
  };

  const batTatChonDong = (tabId, key, checked) => {
    setChonXoaLoat((prev) => {
      const setCu = new Set(prev?.[tabId] || []);
      if (checked) setCu.add(key);
      else setCu.delete(key);
      return { ...(prev || {}), [tabId]: Array.from(setCu) };
    });
  };

  const boFormRule = () => {
    setFormRule(taoDuLieuFormRong());
    setDangSuaRule(null);
  };

  const ghiTab = async (tabId, duLieuMoi) => {
    if (Platform.OS === 'web') {
      window.localStorage.setItem(`CDSS_DATA_${tabId}`, JSON.stringify(duLieuMoi));
      const alias = ALIAS_TAB_ID[tabId];
      if (alias) window.localStorage.setItem(`CDSS_DATA_${alias}`, JSON.stringify(duLieuMoi));
    } else {
      await AsyncStorage.setItem(`CDSS_DATA_${tabId}`, JSON.stringify(duLieuMoi));
      const alias = ALIAS_TAB_ID[tabId];
      if (alias) await AsyncStorage.setItem(`CDSS_DATA_${alias}`, JSON.stringify(duLieuMoi));
    }
  };

  const lamMoiCacheEngine = () => {
    try { xoaCacheBoMayGiamDinh(); } catch {}
    try { xoaCacheRuleEngineDvkt(); } catch {}
  };

  const capNhatTab = async (tabId, updater) => {
    const hienTai = duLieuTheoTab[tabId] || [];
    const duLieuMoi = updater(hienTai);
    const mapMoi = { ...duLieuTheoTab, [tabId]: duLieuMoi };
    setDuLieuTheoTab(mapMoi);

    try {
      setDangLuu(true);
      const dataRows = duLieuMoi.filter((row) => !laRuleNoiBo(row)).map(boMetaTam);
      const noiBoRows = duLieuMoi.filter((row) => laRuleNoiBo(row));
      const coDataTruocDo = hienTai.some((row) => !laRuleNoiBo(row));

      if (coDataTruocDo || dataRows.length > 0) {
        await ghiTab(tabId, dataRows);
      }

      if (noiBoRows.length > 0 || hienTai.some((row) => laRuleNoiBo(row))) {
        const mapHienTaiNoiBo = await taiMapTrangThaiQuyTacNoiBo();
        const mapMoiNoiBo = capNhatMapTrangThaiTuRowsNoiBo(noiBoRows, mapHienTaiNoiBo);
        await luuMapTrangThaiQuyTacNoiBo(mapMoiNoiBo);
      }

      lamMoiCacheEngine();
    } catch (e) {
      setDuLieuTheoTab(duLieuTheoTab);
      Alert.alert('Lỗi', `Không thể lưu trạng thái quy tắc: ${e.message || e}`);
    } finally {
      setDangLuu(false);
    }
  };

  const moSuaRule = (tabId, index) => {
    const row = (duLieuTheoTab[tabId] || [])[index];
    if (!row) return;
    setTabQuanLyNoiDung(tabId);
    setDangSuaRule({ tabId, index, laNoiBo: laRuleNoiBo(row) });
    const thongTinQuanTri = lamGiauMetaQuanTriQuyTac(row);
    setFormRule({
      MA_LUAT: layMaLuat(row),
      TEN_QUY_TAC: layTenQuyTac(row),
      DIEU_KIEN: String(row?.DIEU_KIEN || row?.dieu_kien || ''),
      CANH_BAO: String(row?.CANH_BAO || row?.canh_bao || ''),
      NHOM_CANH_BAO: layNhomCanhBao(thongTinQuanTri),
      CHI_TIET_CANH_BAO: layChiTietCanhBao(thongTinQuanTri),
      TRANG_THAI: laBat(row?.TRANG_THAI) ? 'ON' : 'OFF',
    });
  };

  const luuNoiDungRule = async () => {
    const tabId = dangSuaRule?.tabId || tabQuanLyNoiDung;
    const maLuat = layMaLuat(formRule);
    if (!tabId || !maLuat) {
      Alert.alert('Thiếu dữ liệu', 'Cần nhập ít nhất mã luật trước khi lưu.');
      return;
    }

    if (dangSuaRule?.laNoiBo && Number.isInteger(dangSuaRule?.index)) {
      try {
        setDangLuu(true);
        const maK = chuanHoaKhoaMaLuatOnOff(maLuat);
        const cur = await taiMapGhiDeNoiDungQuyTacNoiBo();
        const nhom = String(formRule?.NHOM_CANH_BAO || '').toUpperCase() === 'XUAT_TOAN' ? 'XUAT_TOAN' : 'CANH_BAO';
        cur[maK] = {
          TEN_QUY_TAC: String(formRule?.TEN_QUY_TAC || '').trim(),
          CANH_BAO: String(formRule?.CANH_BAO || '').trim(),
          NHOM_CANH_BAO: nhom,
          CHI_TIET_CANH_BAO: String(formRule?.CHI_TIET_CANH_BAO || '').trim(),
          DIEU_KIEN: String(formRule?.DIEU_KIEN || '').trim(),
        };
        await luuMapGhiDeNoiDungQuyTacNoiBo(cur);
        lamMoiCacheEngine();
        boFormRule();
        await docTatCaDuLieu();
      } catch (e) {
        Alert.alert('Lỗi', `Không thể lưu ghi đè quy tắc mẫu: ${e.message || e}`);
      } finally {
        setDangLuu(false);
      }
      return;
    }

    const thongTinQuanTri = lamGiauMetaQuanTriQuyTac({
      MA_LUAT: maLuat,
      TEN_QUY_TAC: String(formRule?.TEN_QUY_TAC || '').trim() || maLuat,
      DIEU_KIEN: String(formRule?.DIEU_KIEN || '').trim(),
      CANH_BAO: String(formRule?.CANH_BAO || '').trim(),
      NHOM_CANH_BAO: String(formRule?.NHOM_CANH_BAO || '').trim(),
      CHI_TIET_CANH_BAO: String(formRule?.CHI_TIET_CANH_BAO || '').trim(),
    });
    const dongMoi = {
      id: dangSuaRule ? ((duLieuTheoTab[tabId] || [])[dangSuaRule.index]?.id || `${Date.now()}`) : `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      MA_LUAT: maLuat,
      TEN_QUY_TAC: String(formRule?.TEN_QUY_TAC || '').trim() || maLuat,
      DIEU_KIEN: String(formRule?.DIEU_KIEN || '').trim(),
      CANH_BAO: String(formRule?.CANH_BAO || '').trim(),
      NHOM_CANH_BAO: layNhomCanhBao(thongTinQuanTri),
      TAG_CANH_BAO: layTagCanhBao(thongTinQuanTri),
      TAG_NGUON_CANH_BAO: layTagNguonCanhBao(thongTinQuanTri),
      CHI_TIET_CANH_BAO: layChiTietCanhBao(thongTinQuanTri),
      TRANG_THAI: String(formRule?.TRANG_THAI || 'ON').toUpperCase() === 'OFF' ? 'OFF' : 'ON',
      _kind: 'DATASET',
    };

    if (dangSuaRule?.tabId === tabId && Number.isInteger(dangSuaRule?.index)) {
      await capNhatTab(tabId, (rows) => rows.map((r, i) => (i === dangSuaRule.index && !laRuleNoiBo(r) ? { ...r, ...dongMoi } : r)));
    } else {
      await capNhatTab(tabId, (rows) => [{ ...dongMoi }, ...(rows || [])]);
    }

    boFormRule();
    boChonXoaLoat(tabId);
  };

  const xoaMotRule = async (tabId, index) => {
    const row = (duLieuTheoTab[tabId] || [])[index];
    if (!row) return;
    if (laRuleNoiBo(row)) {
      const ma = chuanHoaKhoaMaLuatOnOff(layMaLuat(row));
      Alert.alert(
        'Ẩn quy tắc mẫu',
        `Ẩn "${layMaLuat(row) || layTenQuyTac(row)}" khỏi danh sách quản trị? Trạng thái ON/OFF vẫn lưu; có thể hiện lại ở mục "Quy tắc mẫu đã ẩn" bên dưới.`,
        [
          { text: 'Hủy', style: 'cancel' },
          {
            text: 'Ẩn',
            style: 'destructive',
            onPress: async () => {
              try {
                setDangLuu(true);
                const tap = new Set(tapMaLuatAnKhoiQuanLy);
                tap.add(ma);
                await luuTapMaLuatAnKhoiQuanLyNoiBo(tap);
                setTapMaLuatAnKhoiQuanLy(tap);
                boChonXoaLoat(tabId);
                await docTatCaDuLieu();
              } catch (e) {
                Alert.alert('Lỗi', e.message || String(e));
              } finally {
                setDangLuu(false);
              }
            },
          },
        ],
      );
      return;
    }
    Alert.alert('Xác nhận xóa', `Xóa quy tắc ${layMaLuat(row) || layTenQuyTac(row)}?`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          await capNhatTab(tabId, (rows) => (rows || []).filter((_, i) => i !== index));
          boChonXoaLoat(tabId);
        },
      },
    ]);
  };

  const xoaLoatTab = async (tabId) => {
    const dsChon = new Set(chonXoaLoat?.[tabId] || []);
    if (dsChon.size === 0) {
      Alert.alert('Thông báo', 'Bạn chưa chọn dòng nào để xóa loạt.');
      return;
    }
    Alert.alert('Xóa loạt', `Xóa ${dsChon.size} quy tắc đã chọn?`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa loạt',
        style: 'destructive',
        onPress: async () => {
          await capNhatTab(tabId, (rows) => (rows || []).filter((row, index) => {
            if (laRuleNoiBo(row)) return true;
            return !dsChon.has(taoKhoaDong(row, index));
          }));
          boChonXoaLoat(tabId);
        },
      },
    ]);
  };

  const doiTrangThaiRule = async (tabId, index) => {
    await capNhatTab(tabId, (rows) => rows.map((r, i) => {
      if (i !== index) return r;
      return { ...r, TRANG_THAI: laBat(r.TRANG_THAI) ? 'OFF' : 'ON' };
    }));
  };

  const batTatTatCaTrongNhom = async (tabId, bat) => {
    await capNhatTab(tabId, (rows) => rows.map((r) => ({ ...r, TRANG_THAI: bat ? 'ON' : 'OFF' })));
  };

  const batTatToanBo = async (bat) => {
    const banSao = { ...duLieuTheoTab };
    Object.keys(banSao).forEach((tabId) => {
      banSao[tabId] = (banSao[tabId] || []).map((r) => ({ ...r, TRANG_THAI: bat ? 'ON' : 'OFF' }));
    });
    setDuLieuTheoTab(banSao);

    try {
      setDangLuu(true);
      const allBuiltInRows = [];
      for (const tabId of Object.keys(banSao)) {
        const rows = banSao[tabId] || [];
        const rowsTruocDo = duLieuTheoTab[tabId] || [];
        const dataRows = rows.filter((row) => !laRuleNoiBo(row)).map(boMetaTam);
        const coDataTruocDo = rowsTruocDo.some((row) => !laRuleNoiBo(row));

        if (coDataTruocDo || dataRows.length > 0) {
          await ghiTab(tabId, dataRows);
        }

        rows.filter((row) => laRuleNoiBo(row)).forEach((row) => allBuiltInRows.push(row));
      }

      if (allBuiltInRows.length > 0) {
        const mapHienTaiNoiBo = await taiMapTrangThaiQuyTacNoiBo();
        const mapMoiNoiBo = capNhatMapTrangThaiTuRowsNoiBo(allBuiltInRows, mapHienTaiNoiBo);
        await luuMapTrangThaiQuyTacNoiBo(mapMoiNoiBo);
      }

      lamMoiCacheEngine();
    } catch (e) {
      Alert.alert('Lỗi', `Không thể cập nhật hàng loạt: ${e.message || e}`);
      await docTatCaDuLieu();
    } finally {
      setDangLuu(false);
    }
  };

  const xuLyImportRows = async (rowsInput) => {
    const rowsChuan = (Array.isArray(rowsInput) ? rowsInput : [])
      .map((r, index) => taoDongDuLieuTuImport(r, index))
      .filter(Boolean);

    if (rowsChuan.length === 0) {
      Alert.alert('Import thất bại', 'Không tìm thấy dòng hợp lệ. Cần cột MA_LUAT trong file import.');
      return;
    }

    await capNhatTab(tabQuanLyNoiDung, (rows) => {
      const rowsNoiBo = (rows || []).filter((r) => laRuleNoiBo(r));
      return [...rowsNoiBo, ...rowsChuan];
    });
    boFormRule();
    boChonXoaLoat(tabQuanLyNoiDung);
    Alert.alert('Import thành công', `Đã nạp ${rowsChuan.length} quy tắc vào nhóm ${NHOM_HIEN_THI[tabQuanLyNoiDung] || tabQuanLyNoiDung}.`);
  };

  const taiFileMau = () => {
    if (Platform.OS !== 'web') {
      Alert.alert('Thông báo', 'Tải file mẫu hiện hỗ trợ trên Web.');
      return;
    }
    try {
      const rowMau = {
        STT: 1,
        MA_LUAT: 'LUAT_MAU_001',
        TEN_QUY_TAC: 'Tên quy tắc mẫu',
        DIEU_KIEN: 'Điều kiện mẫu',
        CANH_BAO: 'Nội dung cảnh báo mẫu',
        NHOM_CANH_BAO: 'CANH_BAO',
        CHI_TIET_CANH_BAO: 'Mô tả rõ hồ sơ cần kiểm soát hoặc nguy cơ bị xuất toán.',
        TRANG_THAI: 'ON',
      };
      const ws = XLSX.utils.json_to_sheet([rowMau], { header: COT_FILE_RULE });
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'TEMPLATE_RULE');
      XLSX.writeFile(wb, `Mau_Import_QuyTac_${tabQuanLyNoiDung}.xlsx`);
    } catch (e) {
      Alert.alert('Lỗi', `Không thể tạo file mẫu: ${e.message || e}`);
    }
  };

  const exportDuLieuTab = () => {
    const rows = dsDongDuLieuTabQuanLy.map(({ row }) => row);
    if (rows.length === 0) {
      Alert.alert('Thông báo', 'Không có dữ liệu người dùng để export ở tab hiện tại.');
      return;
    }
    if (Platform.OS !== 'web') {
      Alert.alert('Thông báo', 'Export hiện hỗ trợ trên Web.');
      return;
    }
    try {
      const dataExport = rows.map((row, index) => ({
        STT: index + 1,
        MA_LUAT: layMaLuat(row),
        TEN_QUY_TAC: layTenQuyTac(row),
        DIEU_KIEN: String(row?.DIEU_KIEN || row?.dieu_kien || ''),
        CANH_BAO: String(row?.CANH_BAO || row?.canh_bao || ''),
        NHOM_CANH_BAO: layNhomCanhBao(row),
        CHI_TIET_CANH_BAO: layChiTietCanhBao(row),
        TRANG_THAI: laBat(row?.TRANG_THAI) ? 'ON' : 'OFF',
      }));
      const ws = XLSX.utils.json_to_sheet(dataExport, { header: COT_FILE_RULE });
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, (tabQuanLyNoiDung || 'RULES').slice(0, 31));
      XLSX.writeFile(wb, `QuyTac_${tabQuanLyNoiDung}.xlsx`);
    } catch (e) {
      Alert.alert('Lỗi', `Không thể export dữ liệu: ${e.message || e}`);
    }
  };

  const importDuLieuTab = async () => {
    try {
      if (Platform.OS === 'web') {
        const input = globalThis.document?.createElement?.('input');
        if (!input) {
          Alert.alert('Lỗi', 'Trình duyệt không hỗ trợ thao tác chọn file.');
          return;
        }
        input.type = 'file';
        input.accept = '.xlsx,.xls,.json,application/json';
        input.onchange = async (event) => {
          try {
            const file = event?.target?.files?.[0];
            if (!file) return;
            const tenFile = String(file.name || '').toLowerCase();

            if (tenFile.endsWith('.json')) {
              const text = await file.text();
              const json = parseJSONAnToan(text, []);
              const rows = Array.isArray(json) ? json : (Array.isArray(json?.data) ? json.data : []);
              await xuLyImportRows(rows);
              return;
            }

            const buffer = await file.arrayBuffer();
            const wb = XLSX.read(buffer, { type: 'array' });
            const ws = wb.Sheets[wb.SheetNames[0]];
            const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });
            await xuLyImportRows(rows);
          } catch (e) {
            Alert.alert('Lỗi', `Không thể import file: ${e.message || e}`);
          }
        };
        input.click();
        return;
      }

      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.ms-excel',
          'application/json',
        ],
        copyToCacheDirectory: true,
        multiple: false,
      });
      if (result.canceled || !result.assets?.[0]) return;
      const asset = result.assets[0];
      const tenFile = String(asset.name || '').toLowerCase();

      if (tenFile.endsWith('.json')) {
        const text = await FileSystem.readAsStringAsync(asset.uri);
        const json = parseJSONAnToan(text, []);
        const rows = Array.isArray(json) ? json : (Array.isArray(json?.data) ? json.data : []);
        await xuLyImportRows(rows);
        return;
      }

      const b64 = await FileSystem.readAsStringAsync(asset.uri, { encoding: FileSystem.EncodingType.Base64 });
      const wb = XLSX.read(b64, { type: 'base64' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });
      await xuLyImportRows(rows);
    } catch (e) {
      Alert.alert('Lỗi', `Không thể import dữ liệu: ${e.message || e}`);
    }
  };

  if (dangTai) {
    return (
      <SafeAreaView style={styles.vung_an_toan}>
        <View style={styles.trung_tam}>
          <ActivityIndicator size="large" color="#D81B60" />
          <Text style={styles.txt_tai}>Đang tải danh sách quy tắc...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.vung_an_toan}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.btn_back} onPress={() => quayLaiAnToan(navigation, 'TongQuan')}>
          <Text style={styles.txt_back}>‹ Quay lại</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.tieu_de}>QUẢN LÝ QUY TẮC ON/OFF</Text>
          <Text style={styles.mo_ta}>Bật/tắt nhanh quy tắc theo nhóm, áp dụng ngay cho engine kiểm tra.</Text>
        </View>
      </View>

      <View style={[styles.bo_cuc_chinh, hepWeb && styles.bo_cuc_chinh_doc]}>
        <ScrollView style={[styles.sidebar_trai, hepWeb && styles.sidebar_trai_full]} contentContainerStyle={styles.sidebar_trai_content}>
          <View style={styles.khung_tong_quan}>
            <Text style={styles.txt_thong_ke}>Đang bật: {tongTatCa.dangBat}/{tongTatCa.tong} quy tắc</Text>
            <TextInput
              value={tuKhoaTimKiem}
              onChangeText={setTuKhoaTimKiem}
              placeholder="Tìm nhanh: mã luật, tên, điều kiện, cảnh báo"
              placeholderTextColor={CD.text.muted}
              style={styles.input_tim_kiem}
            />
            <View style={styles.khung_bo_loc_loai}>
              {BO_LOC_LOAI_QUY_TAC.map((item) => {
                const active = boLocLoaiQuyTac === item.id;
                const soLuong = item.id === 'XUAT_TOAN'
                  ? thongKeLoaiQuyTac.XUAT_TOAN
                  : item.id === 'CANH_BAO'
                    ? thongKeLoaiQuyTac.CANH_BAO
                    : tongTatCa.tong;
                return (
                  <TouchableOpacity
                    key={`bo-loc-${item.id}`}
                    style={[
                      styles.chip_bo_loc,
                      active && styles.chip_bo_loc_active,
                      item.id === 'XUAT_TOAN' && styles.chip_bo_loc_xuat_toan,
                      item.id === 'CANH_BAO' && styles.chip_bo_loc_canh_bao,
                    ]}
                    onPress={() => setBoLocLoaiQuyTac(item.id)}
                  >
                    <Text style={[styles.chip_bo_loc_txt, active && styles.chip_bo_loc_txt_active]}>{item.ten} ({soLuong})</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <View style={styles.hang_nut_tong}>
              <TouchableOpacity style={[styles.btn_hanh_dong, styles.btn_bat]} onPress={() => batTatToanBo(true)}>
                <Text style={styles.txt_btn}>BẬT TẤT CẢ</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn_hanh_dong, styles.btn_tat]} onPress={() => batTatToanBo(false)}>
                <Text style={styles.txt_btn}>TẮT TẤT CẢ</Text>
              </TouchableOpacity>
            </View>

            {danhSachMaLuatDaAn.length > 0 && (
              <View style={styles.khung_da_an}>
                <Text style={styles.tieu_de_da_an}>Quy tắc mẫu đã ẩn ({danhSachMaLuatDaAn.length})</Text>
                <Text style={styles.mo_ta_da_an}>Chỉ áp dụng cho dòng có nhãn MA NGUON. Hiện lại để sửa hoặc bật/tắt.</Text>
                <ScrollView style={styles.scroll_da_an} nestedScrollEnabled>
                  {danhSachMaLuatDaAn.map((ma) => (
                    <View key={`an-${ma}`} style={styles.hang_ma_da_an}>
                      <Text style={styles.txt_ma_da_an} numberOfLines={1}>{ma}</Text>
                      <TouchableOpacity style={styles.btn_hien_lai} onPress={() => hienLaiQuyTacAn(ma)}>
                        <Text style={styles.txt_hien_lai}>Hiện lại</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          <View style={styles.khung_quan_ly_noi_dung}>
            <Text style={styles.tieu_de_noi_dung}>SỬA NỘI DUNG QUY TẮC — mã nguồn và kho nhập tay</Text>
            <ScrollView
              horizontal
              nestedScrollEnabled
              keyboardShouldPersistTaps="handled"
              showsHorizontalScrollIndicator={Platform.OS === 'web'}
              style={styles.hang_tab_scroll}
              contentContainerStyle={styles.hang_tab_quan_ly}
            >
              {DANH_SACH_TAB_MAC_DINH.map((tab) => {
                const active = tabQuanLyNoiDung === tab.id;
                const fs = fontScale(14);
                return (
                  <TouchableOpacity
                    key={`tab-quan-ly-${tab.id}`}
                    style={[styles.chip_tab, active && styles.chip_tab_active]}
                    onPress={() => setTabQuanLyNoiDung(tab.id)}
                  >
                    <Text style={[styles.chip_tab_txt, { fontSize: fs }, active && styles.chip_tab_txt_active]}>{NHOM_HIEN_THI[tab.id] || tab.ten}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View style={styles.form_rule}>
              <View style={styles.hang_nut_file}>
                <TouchableOpacity style={[styles.btn_hanh_dong, styles.btn_file]} onPress={importDuLieuTab}>
                  <Text style={styles.txt_btn}>IMPORT</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.btn_hanh_dong, styles.btn_file]} onPress={exportDuLieuTab}>
                  <Text style={styles.txt_btn}>EXPORT</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.btn_hanh_dong, styles.btn_file_mau]} onPress={taiFileMau}>
                  <Text style={styles.txt_btn}>TẢI FILE MẪU</Text>
                </TouchableOpacity>
              </View>
              <TextInput
                value={formRule.MA_LUAT}
                onChangeText={(v) => setFormRule((s) => ({ ...s, MA_LUAT: v }))}
                placeholder="Mã luật"
                placeholderTextColor={CD.text.muted}
                style={styles.input_rule}
                editable={!dangSuaRule?.laNoiBo}
              />
              <TextInput value={formRule.TEN_QUY_TAC} onChangeText={(v) => setFormRule((s) => ({ ...s, TEN_QUY_TAC: v }))} placeholder="Tên quy tắc" placeholderTextColor={CD.text.muted} style={styles.input_rule} />
              <TextInput value={formRule.DIEU_KIEN} onChangeText={(v) => setFormRule((s) => ({ ...s, DIEU_KIEN: v }))} placeholder="Điều kiện" placeholderTextColor={CD.text.muted} style={[styles.input_rule, styles.input_text_area]} multiline />
              <TextInput value={formRule.CANH_BAO} onChangeText={(v) => setFormRule((s) => ({ ...s, CANH_BAO: v }))} placeholder="Cảnh báo" placeholderTextColor={CD.text.muted} style={[styles.input_rule, styles.input_text_area]} multiline />
              <Text style={styles.txt_label_form}>Phân loại quy tắc</Text>
              <View style={styles.hang_chip_loai_form}>
                {BO_LOC_LOAI_QUY_TAC.filter((item) => item.id !== 'TAT_CA').map((item) => {
                  const active = formRule.NHOM_CANH_BAO === item.id;
                  return (
                    <TouchableOpacity
                      key={`form-loai-${item.id}`}
                      style={[
                        styles.chip_loai_form,
                        active && styles.chip_loai_form_active,
                        item.id === 'XUAT_TOAN' ? styles.chip_loai_form_xuat_toan : styles.chip_loai_form_canh_bao,
                      ]}
                      onPress={() => setFormRule((s) => ({ ...s, NHOM_CANH_BAO: item.id }))}
                    >
                      <Text style={[styles.chip_loai_form_txt, active && styles.chip_loai_form_txt_active]}>{item.ten}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <TextInput value={formRule.CHI_TIET_CANH_BAO} onChangeText={(v) => setFormRule((s) => ({ ...s, CHI_TIET_CANH_BAO: v }))} placeholder="Chi tiết nội dung cảnh báo / hướng kiểm soát" placeholderTextColor={CD.text.muted} style={[styles.input_rule, styles.input_text_area]} multiline />
              <View style={styles.hang_nut_noi_dung}>
                <TouchableOpacity style={[styles.btn_hanh_dong, styles.btn_bat]} onPress={luuNoiDungRule}>
                  <Text style={styles.txt_btn}>{dangSuaRule ? 'LƯU SỬA' : 'THÊM MỚI'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.btn_hanh_dong, styles.btn_tat]} onPress={boFormRule}>
                  <Text style={styles.txt_btn}>LÀM MỚI FORM</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.btn_hanh_dong, styles.btn_xoa_loat]} onPress={() => xoaLoatTab(tabQuanLyNoiDung)}>
                  <Text style={styles.txt_btn}>XÓA LOẠT ĐÃ CHỌN</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.txt_luu_y}>
                {dangSuaRule?.laNoiBo
                  ? 'Quy tắc gắn MA NGUỒN (luật cứng/seed/mẫu): sửa tên, điều kiện hiển thị, nội dung cảnh báo và chi tiết/ghi chú — lưu vào thiết bị và áp dụng khi giám định (không cần sửa file mã). Mã luật khóa để tránh lệch khóa. Nút Ẩn chỉ ẩn khỏi danh sách quản trị; ON/OFF vẫn lưu.'
                  : 'Quy tắc nhập tay (kho CDSS_DATA): sửa toàn bộ trường gồm mã luật, điều kiện và cảnh báo — lưu trực tiếp vào kho. Quy tắc MA NGUỒN dùng Sửa ở trên để ghi đè hiển thị khi trùng mã.'}
              </Text>
            </View>
          </View>
        </ScrollView>

        <View style={[styles.khu_vuc_phai, hepWeb && styles.khu_vuc_phai_full]}>
          <ScrollView style={styles.rules_scroll} contentContainerStyle={styles.noi_dung}>
        {danhSachNhom.map((nhom) => (
          <View key={nhom.tabId} style={styles.card_nhom}>
            <View style={styles.card_header}>
              <View style={{ flex: 1 }}>
                <Text style={styles.ten_nhom}>{nhom.tenNhom}</Text>
                <Text style={styles.tong_ket_loai_nhom}>Xuất toán: {nhom.tongXuatToan} | Cảnh báo: {nhom.tongCanhBao}</Text>
              </View>
              <Text style={styles.dem_nhom}>{nhom.dangBat}/{nhom.tongHienThi} (lọc) | tổng {nhom.tong}</Text>
            </View>

            <View style={styles.hang_nut_nhom}>
              <TouchableOpacity style={[styles.btn_nhom, styles.btn_nhom_bat]} onPress={() => batTatTatCaTrongNhom(nhom.tabId, true)}>
                <Text style={styles.txt_btn_nhom}>Bật nhóm</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn_nhom, styles.btn_nhom_tat]} onPress={() => batTatTatCaTrongNhom(nhom.tabId, false)}>
                <Text style={styles.txt_btn_nhom}>Tắt nhóm</Text>
              </TouchableOpacity>
            </View>

            {nhom.cumLoai.map((cum) => (
              <View key={`${nhom.tabId}-${cum.id}`} style={styles.card_loai_quy_tac}>
                <View style={styles.card_loai_header}>
                  <Text style={[styles.card_loai_tieu_de, cum.id === 'XUAT_TOAN' ? styles.card_loai_tieu_de_xuat_toan : styles.card_loai_tieu_de_canh_bao]}>{cum.ten}</Text>
                  <Text style={styles.card_loai_dem}>{cum.rules.filter(({ row }) => laBat(row.TRANG_THAI)).length}/{cum.rules.length}</Text>
                </View>

                {cum.rules.length === 0 ? (
                  <Text style={styles.txt_loai_trong}>Không có quy tắc phù hợp trong nhóm này.</Text>
                ) : cum.rules.map(({ row: rule, index: idx, key }) => {
                  const on = laBat(rule.TRANG_THAI);
                  const laNoiBo = laRuleNoiBo(rule);
                  const daChon = new Set(chonXoaLoat?.[nhom.tabId] || []).has(key);
                  const duocHighlight = chuanHoaTuKhoa(maLuatCanHighlight) !== '' && chuanHoaTuKhoa(layMaLuat(rule)) === chuanHoaTuKhoa(maLuatCanHighlight);
                  const nhomCanhBao = layNhomCanhBao(rule);
                  const tagCanhBao = layTagCanhBao(rule) || (nhomCanhBao === 'XUAT_TOAN' ? 'QUY TẮC XUẤT TOÁN' : 'QUY TẮC CẢNH BÁO');
                  const tagNguonCanhBao = layTagNguonCanhBao(rule);
                  const chiTietCanhBao = layChiTietCanhBao(rule);
                  return (
                    <View
                      key={`${nhom.tabId}-${key}`}
                      style={[styles.dong_rule, duocHighlight && styles.dong_rule_highlight]}
                    >
                      {!laNoiBo && (
                        <TouchableOpacity style={[styles.checkbox_xoa, daChon && styles.checkbox_xoa_on]} onPress={() => batTatChonDong(nhom.tabId, key, !daChon)}>
                          {daChon ? <Text style={styles.checkmark}>✓</Text> : null}
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity
                        activeOpacity={0.65}
                        style={styles.dong_rule_vung_bat_tat}
                        onPress={() => doiTrangThaiRule(nhom.tabId, idx)}
                      >
                        <View style={[styles.checkbox, on && styles.checkbox_on]} pointerEvents="none">
                          {on ? <Text style={styles.checkmark}>✓</Text> : null}
                        </View>
                        <View style={styles.dong_rule_text_khoi} pointerEvents="none">
                          <Text style={[styles.ten_rule, on ? styles.ten_rule_on : styles.ten_rule_off]} numberOfLines={2}>
                            {layTenQuyTac(rule)}
                          </Text>
                          {!!layMaLuat(rule) && <Text style={styles.ma_luat}>{layMaLuat(rule)}</Text>}
                          <View style={styles.hang_tag_rule}>
                            {laNoiBo && <Text style={styles.tag_noi_bo}>MA NGUON</Text>}
                            <Text style={[styles.tag_loai_quy_tac, nhomCanhBao === 'XUAT_TOAN' ? styles.tag_xuat_toan : styles.tag_canh_bao]}>{tagCanhBao}</Text>
                            {!!tagNguonCanhBao && <Text style={styles.tag_nguon_canh_bao}>{tagNguonCanhBao}</Text>}
                          </View>
                          {!!chiTietCanhBao && <Text style={styles.chi_tiet_canh_bao} numberOfLines={3}>{chiTietCanhBao}</Text>}
                          {!!String(rule?.DIEU_KIEN || rule?.dieu_kien || '').trim() && (
                            <Text style={styles.dieu_kien_rule} numberOfLines={2}>Điều kiện: {String(rule?.DIEU_KIEN || rule?.dieu_kien || '').trim()}</Text>
                          )}
                        </View>
                      </TouchableOpacity>
                      <View style={styles.cot_thao_tac}>
                        <TouchableOpacity
                          style={styles.btn_thao_tac}
                          onPress={() => moSuaRule(nhom.tabId, idx)}
                          hitSlop={{ top: 10, bottom: 10, left: 6, right: 6 }}
                        >
                          <Text style={styles.txt_btn_thao_tac}>Sửa</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.btn_thao_tac, styles.btn_thao_tac_xoa]}
                          onPress={() => xoaMotRule(nhom.tabId, idx)}
                          hitSlop={{ top: 10, bottom: 10, left: 6, right: 6 }}
                        >
                          <Text style={styles.txt_btn_thao_tac}>{laNoiBo ? 'Ẩn' : 'Xóa'}</Text>
                        </TouchableOpacity>
                      </View>
                      <TouchableOpacity
                        activeOpacity={0.65}
                        onPress={() => doiTrangThaiRule(nhom.tabId, idx)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Text style={[styles.badge, on ? styles.badge_on : styles.badge_off]}>{on ? 'ON' : 'OFF'}</Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            ))}
          </View>
        ))}

        {danhSachNhom.length === 0 && (
          <View style={styles.trong_box}>
            <Text style={styles.txt_trong}>Chưa tìm thấy dữ liệu quy tắc để quản lý ON/OFF.</Text>
            <Text style={styles.txt_trong_sub}>Bạn hãy nhập/tạo dữ liệu ở màn hình Quản lý Luật trước.</Text>
          </View>
        )}
          </ScrollView>
        </View>
      </View>

      {dangLuu && (
        <View style={styles.overlay_luu}>
          <ActivityIndicator size="small" color="#fff" />
          <Text style={styles.txt_overlay}>Đang lưu thay đổi...</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  vung_an_toan: {
    flex: 1,
    backgroundColor: CD.bg.gradient_mobile,
    ...Platform.select({ web: { backgroundImage: CD.web.gradient_bg } }),
  },
  trung_tam: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  txt_tai: { color: CD.text.secondary, fontSize: 18, fontFamily: CD.font.family },
  header: {
    backgroundColor: CD.brand.mauDam,
    borderBottomWidth: 1,
    borderBottomColor: CD.border.header,
    paddingHorizontal: 18,
    paddingVertical: 14,
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
    ...Platform.select({ web: { backgroundImage: CD.web.gradient_header, backdropFilter: CD.web.blur_header } }),
  },
  btn_back: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: CD.bg.glass_input,
    borderWidth: 1,
    borderColor: CD.border.glass_md,
    borderRadius: 12,
  },
  txt_back: { color: CD.text.primary, fontWeight: '700', fontSize: 16, fontFamily: CD.font.family },
  tieu_de: { color: CD.text.primary, fontWeight: '900', fontSize: 24, fontFamily: CD.font.family },
  mo_ta: { color: CD.text.secondary, fontSize: 15, marginTop: 3, fontFamily: CD.font.family },
  bo_cuc_chinh: {
    flex: 1,
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    gap: 12,
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  bo_cuc_chinh_doc: {
    flexDirection: 'column',
  },
  sidebar_trai: {
    ...(Platform.OS === 'web' ? { flex: 1, minWidth: 340, maxWidth: 560 } : { width: '100%' }),
  },
  sidebar_trai_full: {
    minWidth: 0,
    maxWidth: '100%',
    width: '100%',
    alignSelf: 'stretch',
  },
  sidebar_trai_content: {
    paddingBottom: 16,
  },
  khu_vuc_phai: {
    flex: Platform.OS === 'web' ? 2 : 1,
    minWidth: 0,
  },
  khu_vuc_phai_full: {
    width: '100%',
    flex: 1,
    minHeight: 280,
  },
  rules_scroll: {
    flex: 1,
  },
  khung_tong_quan: {
    marginTop: 12,
    marginBottom: 12,
    padding: 14,
    backgroundColor: CD.bg.glass_card,
    borderWidth: 1,
    borderColor: CD.border.glass,
    borderRadius: 14,
  },
  khung_da_an: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: CD.border.glass_md,
  },
  tieu_de_da_an: { color: CD.text.primary, fontWeight: '800', fontSize: 13, fontFamily: CD.font.family },
  mo_ta_da_an: { color: CD.text.muted, fontSize: 11, marginTop: 4, marginBottom: 8, fontFamily: CD.font.family },
  scroll_da_an: { maxHeight: 160 },
  hang_ma_da_an: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  txt_ma_da_an: { flex: 1, color: CD.text.secondary, fontSize: 12, fontFamily: CD.font.family },
  btn_hien_lai: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: 'rgba(79,195,247,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(79,195,247,0.45)',
  },
  txt_hien_lai: { color: '#4FC3F7', fontSize: 11, fontWeight: '700', fontFamily: CD.font.family },
  input_tim_kiem: {
    marginBottom: 10,
    backgroundColor: CD.bg.glass_input,
    borderWidth: 1,
    borderColor: CD.border.glass_md,
    borderRadius: 10,
    color: CD.text.primary,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: CD.font.family,
    fontSize: 14,
  },
  khung_bo_loc_loai: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  chip_bo_loc: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: CD.border.glass_md,
    backgroundColor: CD.bg.glass_input,
  },
  chip_bo_loc_active: { backgroundColor: 'rgba(255,255,255,0.14)' },
  chip_bo_loc_xuat_toan: { borderColor: 'rgba(255,138,101,0.45)' },
  chip_bo_loc_canh_bao: { borderColor: 'rgba(79,195,247,0.45)' },
  chip_bo_loc_txt: { color: CD.text.secondary, fontSize: 12, fontWeight: '700', fontFamily: CD.font.family },
  chip_bo_loc_txt_active: { color: CD.text.primary },
  khung_quan_ly_noi_dung: {
    marginHorizontal: 0,
    marginBottom: 12,
    padding: 12,
    backgroundColor: CD.bg.glass_card,
    borderWidth: 1,
    borderColor: CD.border.glass,
    borderRadius: 14,
  },
  tieu_de_noi_dung: {
    color: CD.text.primary,
    fontWeight: '800',
    fontSize: 15,
    marginBottom: 10,
    fontFamily: CD.font.family,
  },
  hang_tab_scroll: {
    maxWidth: '100%',
    ...(Platform.OS === 'web' ? { overflowX: 'auto' } : {}),
  },
  hang_tab_quan_ly: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'nowrap',
    gap: 8,
    paddingBottom: 10,
    paddingRight: 4,
  },
  chip_tab: {
    flexShrink: 0,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: CD.border.glass_md,
    backgroundColor: CD.bg.glass_input,
  },
  chip_tab_active: { backgroundColor: 'rgba(25,118,210,0.24)', borderColor: 'rgba(66,165,245,0.5)' },
  chip_tab_txt: { color: CD.text.secondary, fontSize: 14, fontWeight: '700', fontFamily: CD.font.family },
  chip_tab_txt_active: { color: CD.text.primary },
  form_rule: { gap: 8 },
  hang_nut_file: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 2 },
  input_rule: {
    backgroundColor: CD.bg.glass_input,
    borderWidth: 1,
    borderColor: CD.border.glass_md,
    borderRadius: 10,
    color: CD.text.primary,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: CD.font.family,
    fontSize: 14,
  },
  input_text_area: { minHeight: 64, textAlignVertical: 'top' },
  txt_label_form: { color: CD.text.secondary, fontSize: 12, fontWeight: '700', fontFamily: CD.font.family, marginTop: 2 },
  hang_chip_loai_form: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip_loai_form: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    backgroundColor: CD.bg.glass_input,
  },
  chip_loai_form_active: { backgroundColor: 'rgba(255,255,255,0.14)' },
  chip_loai_form_xuat_toan: { borderColor: 'rgba(255,138,101,0.45)' },
  chip_loai_form_canh_bao: { borderColor: 'rgba(79,195,247,0.45)' },
  chip_loai_form_txt: { color: CD.text.secondary, fontSize: 12, fontWeight: '700', fontFamily: CD.font.family },
  chip_loai_form_txt_active: { color: CD.text.primary },
  hang_nut_noi_dung: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  btn_xoa_loat: { backgroundColor: '#B71C1C' },
  btn_file: { backgroundColor: '#1565C0' },
  btn_file_mau: { backgroundColor: '#6A1B9A' },
  txt_luu_y: { color: CD.text.muted, fontSize: 12, fontFamily: CD.font.family },
  txt_thong_ke: { color: CD.text.primary, fontWeight: '700', fontSize: 17, fontFamily: CD.font.family, marginBottom: 10 },
  hang_nut_tong: { flexDirection: 'row', gap: 10 },
  btn_hanh_dong: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  btn_bat: { backgroundColor: '#2E7D32' },
  btn_tat: { backgroundColor: '#6D4C41' },
  txt_btn: { color: '#fff', fontWeight: '800', fontSize: 14, fontFamily: CD.font.family },
  noi_dung: {
    paddingHorizontal: 0,
    paddingTop: 12,
    paddingBottom: 24,
    gap: 12,
  },
  card_nhom: {
    width: '100%',
    backgroundColor: CD.bg.glass_card,
    borderWidth: 1,
    borderColor: CD.border.glass,
    borderRadius: 14,
    padding: 12,
  },
  card_header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  ten_nhom: { color: CD.text.primary, fontSize: 20, fontWeight: '800', fontFamily: CD.font.family },
  tong_ket_loai_nhom: { color: CD.text.muted, fontSize: 12, marginTop: 3, fontFamily: CD.font.family },
  dem_nhom: {
    color: CD.text.primary,
    backgroundColor: CD.bg.glass_input,
    borderWidth: 1,
    borderColor: CD.border.glass_md,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    fontSize: 14,
    fontWeight: '700',
    fontFamily: CD.font.family,
  },
  hang_nut_nhom: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  btn_nhom: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8 },
  btn_nhom_bat: { backgroundColor: 'rgba(76,175,80,0.25)' },
  btn_nhom_tat: { backgroundColor: 'rgba(255,255,255,0.08)' },
  txt_btn_nhom: { color: CD.text.primary, fontWeight: '700', fontSize: 13, fontFamily: CD.font.family },
  card_loai_quy_tac: {
    marginTop: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.03)',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  card_loai_header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  card_loai_tieu_de: {
    fontSize: 13,
    fontWeight: '800',
    fontFamily: CD.font.family,
  },
  card_loai_tieu_de_xuat_toan: { color: '#FFCCBC' },
  card_loai_tieu_de_canh_bao: { color: '#B3E5FC' },
  card_loai_dem: {
    color: CD.text.muted,
    fontSize: 11,
    fontWeight: '700',
    fontFamily: CD.font.family,
  },
  txt_loai_trong: {
    color: CD.text.muted,
    fontSize: 12,
    fontFamily: CD.font.family,
    paddingVertical: 6,
  },
  dong_rule: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: CD.border.divider,
  },
  dong_rule_highlight: {
    backgroundColor: 'rgba(56, 189, 248, 0.10)',
    borderLeftWidth: 4,
    borderLeftColor: '#38BDF8',
    paddingLeft: 8,
    borderRadius: 10,
  },
  /** Tách khỏi cột Sửa/Ẩn — tránh TouchableOpacity lồng nhau (web không gọi onPress nút con). */
  dong_rule_vung_bat_tat: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dong_rule_text_khoi: {
    flex: 1,
    minWidth: 0,
  },
  checkbox_xoa: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  checkbox_xoa_on: { backgroundColor: '#B71C1C', borderColor: '#EF5350' },
  cot_thao_tac: {
    flexDirection: 'row',
    gap: 6,
    marginRight: 4,
    zIndex: 2,
  },
  btn_thao_tac: {
    paddingHorizontal: 7,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  btn_thao_tac_xoa: { backgroundColor: 'rgba(183,28,28,0.25)', borderColor: 'rgba(239,83,80,0.4)' },
  txt_btn_thao_tac: { color: CD.text.primary, fontSize: 12, fontWeight: '700', fontFamily: CD.font.family },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: CD.border.glass_md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  checkbox_on: { backgroundColor: '#1976D2', borderColor: '#42A5F5' },
  checkmark: { color: '#fff', fontWeight: '900', fontSize: 14 },
  ten_rule: { fontSize: 15, fontFamily: CD.font.family },
  ten_rule_on: { color: '#A5D6A7' },
  ten_rule_off: { color: CD.text.muted },
  ma_luat: { marginTop: 2, color: CD.text.muted, fontSize: 12, fontFamily: CD.font.family },
  hang_tag_rule: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 5 },
  tag_noi_bo: {
    alignSelf: 'flex-start',
    color: '#9AD9FF',
    backgroundColor: 'rgba(25,118,210,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(66,165,245,0.35)',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
    fontSize: 10,
    fontWeight: '800',
    fontFamily: CD.font.family,
  },
  tag_loai_quy_tac: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
    fontSize: 10,
    fontWeight: '800',
    fontFamily: CD.font.family,
  },
  tag_xuat_toan: {
    color: '#FFCCBC',
    backgroundColor: 'rgba(255,87,34,0.18)',
    borderColor: 'rgba(255,138,101,0.45)',
  },
  tag_canh_bao: {
    color: '#B3E5FC',
    backgroundColor: 'rgba(2,136,209,0.16)',
    borderColor: 'rgba(79,195,247,0.4)',
  },
  tag_nguon_canh_bao: {
    alignSelf: 'flex-start',
    color: '#FFE082',
    backgroundColor: 'rgba(255,193,7,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,224,130,0.32)',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
    fontSize: 10,
    fontWeight: '700',
    fontFamily: CD.font.family,
  },
  chi_tiet_canh_bao: {
    marginTop: 6,
    color: CD.text.secondary,
    fontSize: 12,
    lineHeight: 18,
    fontFamily: CD.font.family,
  },
  dieu_kien_rule: {
    marginTop: 4,
    color: CD.text.muted,
    fontSize: 11,
    lineHeight: 16,
    fontFamily: CD.font.family,
  },
  badge: {
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    overflow: 'hidden',
    fontSize: 12,
    fontWeight: '800',
    fontFamily: CD.font.family,
  },
  badge_on: { color: '#A5D6A7', backgroundColor: 'rgba(76,175,80,0.18)' },
  badge_off: { color: '#B0BEC5', backgroundColor: 'rgba(255,255,255,0.06)' },
  trong_box: {
    width: '100%',
    marginTop: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: CD.border.glass,
    backgroundColor: CD.bg.glass_card,
    padding: 20,
    alignItems: 'center',
  },
  txt_trong: { color: CD.text.primary, fontWeight: '700', fontSize: 17, fontFamily: CD.font.family, textAlign: 'center' },
  txt_trong_sub: { color: CD.text.muted, fontSize: 14, marginTop: 6, fontFamily: CD.font.family, textAlign: 'center' },
  overlay_luu: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0,0,0,0.72)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  txt_overlay: { color: '#fff', fontSize: 13, fontWeight: '700', fontFamily: CD.font.family },
});

export default QuanLyQuyTacOnOff;
