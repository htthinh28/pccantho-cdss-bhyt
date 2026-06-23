/**
 * TỆP LÕI: HỆ QUẢN TRỊ QUY TẮC KIỂM TRA BHYT (CDSS) — BẢNG ĐỘNG
 * Chức năng: Quản lý 11 tệp luật BHYT dưới dạng bảng dữ liệu động (cột/tùy biến).
 * Đột phá UX: Bảng tự động giãn Full màn hình, hỗ trợ SẮP XẾP (SORT) linh hoạt.
 * Tính năng MỚI: 
 * 1. Auto-Save - Hệ thống tự động ghi nhớ sau mỗi lần nhập (Không sợ F5).
 * 2. Nút ON/OFF: Bật/tắt nhanh trạng thái thực thi của từng quy tắc.
 * 3. Select All: Chọn hàng loạt quy tắc để thao tác nhanh.
 * 4. UI/UX: Các cột dữ liệu dài tự động giãn chiều cao (Auto-height) để đọc full text.
 * 5. Điều hướng tệp luật: sidebar trái (thay cho hàng thẻ ngang).
 * 5. ANTI-DUPLICATE: Kiểm soát chặt chẽ trùng lặp trường DIEU_KIEN khi Nhập tay & Import Excel.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useRef, useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { rongSidebarCap, useLayoutMode } from '../tien_ich/diem_anh_man_hinh';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as XLSX from 'xlsx';
import { CD } from '../tien_ich/chu_de_giao_dien';
import { quayLaiAnToan } from '../tien_ich/dieu_huong_an_toan';
import { dieuHuongMoTabMoi } from '../tien_ich/dieu_huong_mo_tab_moi';
import { xoaCacheBoMayGiamDinh } from '../tien_ich/dong_co_giam_dinh';
import { phucHoiBanSaoGanNhat, taoBanSaoDuLieuHeThong } from '../tien_ich/sao_luu_du_lieu_he_thong';
import { damBaoSeedLuatPtttMuc11 } from '../tien_ich/seed_luat_pttt_muc11';

// 1. DANH SÁCH TAB MẶC ĐỊNH + CƠ CHẾ NHẬN DIỆN TAB ĐỘNG TỪ STORAGE
const DANH_SACH_TAB_MAC_DINH = [
  { id: 'LUAT_DU_LIEU', ten: '1. Cấu trúc XML', file: 'quyluat_cau_truc_du_lieu.jsx' },
  { id: 'LUAT_HANH_CHINH', ten: '2. Hành chính', file: 'luat_hanh_chinh.jsx' },
  { id: 'LUAT_CHUYEN_TUYEN', ten: '3. Chuyển tuyến', file: 'luat_chuyen_tuyen.jsx' },
  { id: 'LUAT_HOP_DONG', ten: '4. Hợp đồng', file: 'hopdong.jsx' },
  { id: 'LUAT_CONG_KHAM', ten: '5. Công khám', file: 'luat_cong_kham.jsx' },
  { id: 'LUAT_CDHA', ten: '6. CĐHA', file: 'luat_cdha.jsx' },
  { id: 'LUAT_MAU', ten: '7. Máu', file: 'luat_mau.jsx' },
  { id: 'LUAT_THUOC', ten: '8. Thuốc', file: 'luat_thuoc.jsx' },
  { id: 'LUAT_GIUONG', ten: '9. Giường bệnh', file: 'luat_giuong_benh.jsx' },
  { id: 'LUAT_NHAN_SU', ten: '10. Nhân sự', file: 'luat_nhan_su.jsx' },
  { id: 'LUAT_PTTT', ten: '11. Phẫu/Thủ thuật', file: 'luat_pttt.jsx' }
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

const TEN_TAB_THEO_ID = {
  LUAT_DU_LIEU: '1. Cấu trúc XML',
  LUAT_HANH_CHINH: '2. Hành chính',
  LUAT_CHUYEN_TUYEN: '3. Chuyển tuyến',
  LUAT_HOP_DONG: '4. Hợp đồng',
  LUAT_CONG_KHAM: '5. Công khám',
  LUAT_CDHA: '6. CĐHA',
  LUAT_MAU: '7. Máu',
  LUAT_THUOC: '8. Thuốc',
  LUAT_GIUONG: '9. Giường bệnh',
  LUAT_NHAN_SU: '10. Nhân sự',
  LUAT_PTTT: '11. Phẫu/Thủ thuật',
  XML_DATA: '1. Dữ liệu (XML)',
  XML1: '2. Hành chính',
  KHAM_BENH: '3. Khám bệnh',
  XML3: '4. CĐ Dịch vụ',
  XML2: '5. CĐ Thuốc',
  NHAP_VIEN: '6. CĐ Nhập viện',
  NOI_TRU: '7. CĐ Nội trú',
  PTTT: '8. CĐ Phẫu/Thủ thuật',
  GAY_ME: '9. Gây mê',
  HAU_PHAU: '10. ĐT Hậu phẫu',
  XUAT_VIEN: '11. Xuất viện',
  TAI_LIEU: '12. Tài liệu/Khác',
};

const taoThongTinTab = (tabId) => {
  const tabMacDinh = DANH_SACH_TAB_MAC_DINH.find((t) => t.id === tabId);
  if (tabMacDinh) return tabMacDinh;
  return { id: tabId, ten: TEN_TAB_THEO_ID[tabId] || `Khác: ${tabId}`, file: `${tabId}.jsx` };
};

const parseJSONAnToan = (raw, fallback) => {
  try { return raw ? JSON.parse(raw) : fallback; } catch { return fallback; }
};

const chuanHoaTabId = (tabId) => String(tabId || '').toUpperCase().replace(/[^A-Z0-9]/g, '');

const layTabIdTuStorageKey = (key) => {
  if (key.includes('_CHUNK_') || key.endsWith('_CHUNKS')) return '';
  if (key.startsWith('CDSS_DATA_')) return key.substring('CDSS_DATA_'.length);
  if (key.startsWith('CDSS_COLS_')) return key.substring('CDSS_COLS_'.length);
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

const chuanHoaCotLuat = (raw) => {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === 'object' && Array.isArray(raw.fields)) return raw.fields;
  if (raw && typeof raw === 'object' && Array.isArray(raw.columns)) return raw.columns;
  return null;
};

const ManHinhQuanLyLuat = ({ navigation }) => {
  const { dungBoCucDoc, width: winW } = useLayoutMode();
  const rongSidebar = Math.min(268, rongSidebarCap(winW));

  const [danhSachTab, setDanhSachTab] = useState(DANH_SACH_TAB_MAC_DINH);
  const [tabHienTai, setTabHienTai] = useState(DANH_SACH_TAB_MAC_DINH[0].id);
  const [columns, setColumns] = useState([]);
  const [data, setData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [newColumnName, setNewColumnName] = useState('');
  const [daKhoiTaoSeedPttt, setDaKhoiTaoSeedPttt] = useState(false);
  
  const [sortConfig, setSortConfig] = useState({ column: null, direction: 'asc' });
  const isInitialMount = useRef(true);
  const coDuLieuQuyTac = (arr) => Array.isArray(arr) && arr.length > 0;
  const layDoRongCot = (col) => {
    if (col === 'TRANG_THAI') return 170;
    if (col === 'MA_LUAT') return 180;
    if (col === 'TEN_QUY_TAC') return 340;
    if (col === 'DIEU_KIEN' || col === 'CANH_BAO') return 620;
    return 260;
  };

  const ghiAliasAnToanWeb = (aliasId, duLieu, cot) => {
    if (!aliasId) return;
    const duLieuMoiCoGiaTri = coDuLieuQuyTac(duLieu);
    if (!duLieuMoiCoGiaTri) {
      const duLieuAliasCu = chuanHoaDuLieuLuat(parseJSONAnToan(window.localStorage.getItem(`CDSS_DATA_${aliasId}`), []));
      if (coDuLieuQuyTac(duLieuAliasCu)) return;
    }
    window.localStorage.setItem(`CDSS_DATA_${aliasId}`, JSON.stringify(duLieu));
    window.localStorage.setItem(`CDSS_COLS_${aliasId}`, JSON.stringify(cot));
  };

  const ghiAliasAnToanAsync = async (aliasId, duLieu, cot) => {
    if (!aliasId) return;
    const duLieuMoiCoGiaTri = coDuLieuQuyTac(duLieu);
    if (!duLieuMoiCoGiaTri) {
      const duLieuAliasCu = chuanHoaDuLieuLuat(parseJSONAnToan(await AsyncStorage.getItem(`CDSS_DATA_${aliasId}`), []));
      if (coDuLieuQuyTac(duLieuAliasCu)) return;
    }
    await AsyncStorage.setItem(`CDSS_DATA_${aliasId}`, JSON.stringify(duLieu));
    await AsyncStorage.setItem(`CDSS_COLS_${aliasId}`, JSON.stringify(cot));
  };

  useEffect(() => {
    let daHuy = false;
    const tabMacDinhIds = DANH_SACH_TAB_MAC_DINH.map((t) => t.id);
    const sapXepTabIds = (ids) => {
      const idsNgoaiMacDinh = ids
        .filter((id) => !tabMacDinhIds.includes(id))
        .sort((a, b) => String(a).localeCompare(String(b), 'vi', { sensitivity: 'base' }));
      return [...tabMacDinhIds, ...idsNgoaiMacDinh];
    };
    const capNhatDanhSachTab = (keys) => {
      const idsDong = keys.map(layTabIdTuStorageKey).filter(Boolean);
      const idsGop = Array.from(new Set([...tabMacDinhIds, ...idsDong]));
      const danhSach = sapXepTabIds(idsGop).map((id) => taoThongTinTab(id));
      if (!daHuy) setDanhSachTab(danhSach);
    };

    if (Platform.OS === 'web') {
      try {
        const keys = Object.keys(window.localStorage || {});
        capNhatDanhSachTab(keys);
      } catch {
        if (!daHuy) setDanhSachTab(DANH_SACH_TAB_MAC_DINH);
      }
    } else {
      AsyncStorage.getAllKeys()
        .then((keys) => capNhatDanhSachTab(keys))
        .catch(() => { if (!daHuy) setDanhSachTab(DANH_SACH_TAB_MAC_DINH); });
    }

    return () => { daHuy = true; };
  }, []);

  useEffect(() => {
    if (!danhSachTab.some((tab) => tab.id === tabHienTai) && danhSachTab.length > 0) {
      setTabHienTai(danhSachTab[0].id);
    }
  }, [danhSachTab, tabHienTai]);

  // --- TẢI DỮ LIỆU TỪ LOCAL STORAGE ---
  // Trên web: đọc SYNCHRONOUS từ window.localStorage (không async/await).
  // Trên mobile: đọc async qua AsyncStorage.
  useEffect(() => {
    let daHuy = false;
    const khoiTaoSeed = async () => {
      try {
        await Promise.all([
          damBaoSeedLuatPtttMuc11(),
        ]);
      } catch (e) {
        console.warn('[LUAT_SEED] Không thể nạp seed mục 11:', e);
      } finally {
        if (!daHuy) setDaKhoiTaoSeedPttt(true);
      }
    };
    khoiTaoSeed();
    return () => { daHuy = true; };
  }, []);

  useEffect(() => {
    if (!daKhoiTaoSeedPttt) return;
    isInitialMount.current = true;

    const COT_MAC_DINH = ['TRANG_THAI', 'MA_LUAT', 'TEN_QUY_TAC', 'DIEU_KIEN', 'CANH_BAO'];
    const chuanHoaData = (arr) => arr.map(row => ({
      ...row,
      TRANG_THAI: (row.TRANG_THAI === undefined || row.TRANG_THAI === '') ? 'ON' : row.TRANG_THAI,
    }));

    if (Platform.OS === 'web') {
      try {
        const allKeys = Object.keys(window.localStorage || {});
        const tabIdsTrongStorage = Array.from(new Set(allKeys.map(layTabIdTuStorageKey).filter(Boolean)));
        const dsUngVien = timTabUngVien(tabHienTai, tabIdsTrongStorage);

        let loadedCols = null;
        let loadedData = [];
        let tabNguon = '';

        for (const tabIdUngVien of dsUngVien) {
          const colsRaw = parseJSONAnToan(window.localStorage.getItem(`CDSS_COLS_${tabIdUngVien}`), null);
          const dataRaw = parseJSONAnToan(window.localStorage.getItem(`CDSS_DATA_${tabIdUngVien}`), []);
          const colsTam = chuanHoaCotLuat(colsRaw);
          const dataTam = chuanHoaDuLieuLuat(dataRaw);
          if ((Array.isArray(dataTam) && dataTam.length > 0) || (Array.isArray(colsTam) && colsTam.length > 0)) {
            loadedCols = colsTam;
            loadedData = dataTam;
            tabNguon = tabIdUngVien;
            break;
          }
        }

        if (tabNguon && tabNguon !== tabHienTai) {
          try {
            const dataHienTai = chuanHoaDuLieuLuat(parseJSONAnToan(window.localStorage.getItem(`CDSS_DATA_${tabHienTai}`), []));
            const colsHienTai = chuanHoaCotLuat(parseJSONAnToan(window.localStorage.getItem(`CDSS_COLS_${tabHienTai}`), null));
            if (dataHienTai.length === 0 && loadedData.length > 0) {
              window.localStorage.setItem(`CDSS_DATA_${tabHienTai}`, JSON.stringify(loadedData));
            }
            if ((!Array.isArray(colsHienTai) || colsHienTai.length === 0) && Array.isArray(loadedCols) && loadedCols.length > 0) {
              window.localStorage.setItem(`CDSS_COLS_${tabHienTai}`, JSON.stringify(loadedCols));
            }
          } catch {}
        }

        let colsCuoi = Array.isArray(loadedCols) && loadedCols.length > 0 ? loadedCols : COT_MAC_DINH;
        if (!colsCuoi.includes('TRANG_THAI')) colsCuoi = ['TRANG_THAI', ...colsCuoi];
        setColumns(colsCuoi);
        setData(chuanHoaData(Array.isArray(loadedData) ? loadedData : []));
        setSelectedRows([]);
        setSortConfig({ column: null, direction: 'asc' });
      } catch (e) {
        console.error('[taiDuLieu] Lỗi đọc localStorage:', e);
      }
      setTimeout(() => { isInitialMount.current = false; }, 50);
    } else {
      const taiAsync = async () => {
        try {
          const allKeys = await AsyncStorage.getAllKeys();
          const tabIdsTrongStorage = Array.from(new Set(allKeys.map(layTabIdTuStorageKey).filter(Boolean)));
          const dsUngVien = timTabUngVien(tabHienTai, tabIdsTrongStorage);

          let loadedCols = null;
          let loadedData = [];
          let tabNguon = '';

          for (const tabIdUngVien of dsUngVien) {
            const colsRaw = parseJSONAnToan(await AsyncStorage.getItem(`CDSS_COLS_${tabIdUngVien}`), null);
            const dataRaw = parseJSONAnToan(await AsyncStorage.getItem(`CDSS_DATA_${tabIdUngVien}`), []);
            const colsTam = chuanHoaCotLuat(colsRaw);
            const dataTam = chuanHoaDuLieuLuat(dataRaw);
            if ((Array.isArray(dataTam) && dataTam.length > 0) || (Array.isArray(colsTam) && colsTam.length > 0)) {
              loadedCols = colsTam;
              loadedData = dataTam;
              tabNguon = tabIdUngVien;
              break;
            }
          }

          if (tabNguon && tabNguon !== tabHienTai) {
            const dataHienTai = chuanHoaDuLieuLuat(parseJSONAnToan(await AsyncStorage.getItem(`CDSS_DATA_${tabHienTai}`), []));
            const colsHienTai = chuanHoaCotLuat(parseJSONAnToan(await AsyncStorage.getItem(`CDSS_COLS_${tabHienTai}`), null));
            if (dataHienTai.length === 0 && loadedData.length > 0) {
              await AsyncStorage.setItem(`CDSS_DATA_${tabHienTai}`, JSON.stringify(loadedData));
            }
            if ((!Array.isArray(colsHienTai) || colsHienTai.length === 0) && Array.isArray(loadedCols) && loadedCols.length > 0) {
              await AsyncStorage.setItem(`CDSS_COLS_${tabHienTai}`, JSON.stringify(loadedCols));
            }
          }

          let colsCuoi = Array.isArray(loadedCols) && loadedCols.length > 0 ? loadedCols : COT_MAC_DINH;
          if (!colsCuoi.includes('TRANG_THAI')) colsCuoi = ['TRANG_THAI', ...colsCuoi];
          setColumns(colsCuoi);
          setData(chuanHoaData(Array.isArray(loadedData) ? loadedData : []));
          setSelectedRows([]);
          setSortConfig({ column: null, direction: 'asc' });
        } catch (e) {
          console.error('[taiDuLieu] Lỗi đọc AsyncStorage:', e);
        } finally {
          setTimeout(() => { isInitialMount.current = false; }, 100);
        }
      };
      taiAsync();
    }
  }, [tabHienTai, daKhoiTaoSeedPttt]);

  // --- AUTO-SAVE (chỉ dùng trên mobile; web lưu synchronous trong từng hàm) ---
  useEffect(() => {
    if (Platform.OS === 'web') return;
    if (isInitialMount.current) return;

    const timer = setTimeout(async () => {
      try {
        const aliasId = ALIAS_TAB_ID[tabHienTai];
        await AsyncStorage.setItem(`CDSS_DATA_${tabHienTai}`, JSON.stringify(data));
        await AsyncStorage.setItem(`CDSS_COLS_${tabHienTai}`, JSON.stringify(columns));
        if (aliasId) {
          await ghiAliasAnToanAsync(aliasId, data, columns);
        }
        try { xoaCacheBoMayGiamDinh(); } catch {}
      } catch (e) {
        console.error('Lỗi Auto-Save:', e);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [data, columns, tabHienTai]);

  // Ghi dữ liệu vào storage. Trên web dùng localStorage synchronous để đảm bảo dữ liệu
  // được ghi TRƯỚC KHI setData() (tránh stale closure khi F5 ngay sau khi gọi hàm này).
  const luuHeThong = async (newData, newCols) => {
    const aliasId = ALIAS_TAB_ID[tabHienTai];
    if (Platform.OS === 'web') {
      try {
        window.localStorage.setItem(`CDSS_DATA_${tabHienTai}`, JSON.stringify(newData));
        window.localStorage.setItem(`CDSS_COLS_${tabHienTai}`, JSON.stringify(newCols));
        if (aliasId) {
          ghiAliasAnToanWeb(aliasId, newData, newCols);
        }
      } catch (e) {
        console.error('[luuHeThong] LỖI GHI localStorage:', e);
        // Báo lỗi rõ ràng cho người dùng, KHÔNG cập nhật state (UI phải khớp với storage)
        window.alert(
          e.name === 'QuotaExceededError'
            ? '⚠️ Bộ nhớ trình duyệt đã đầy!\nVui lòng vào "Kho lưu trữ" xóa bớt hồ sơ cũ rồi thử lại.\nDữ liệu CHƯA được lưu.'
            : `⚠️ Không thể lưu dữ liệu luật!\nLỗi: ${e.message}\nDữ liệu CHƯA được lưu.`
        );
        return false; // Lưu thất bại
      }
    } else {
      try {
        await AsyncStorage.setItem(`CDSS_DATA_${tabHienTai}`, JSON.stringify(newData));
        await AsyncStorage.setItem(`CDSS_COLS_${tabHienTai}`, JSON.stringify(newCols));
        if (aliasId) {
          await ghiAliasAnToanAsync(aliasId, newData, newCols);
        }
      } catch (e) {
        console.error('[luuHeThong] Lỗi ghi AsyncStorage:', e);
        return false;
      }
    }
    setData(newData);
    setColumns(newCols);
    try { xoaCacheBoMayGiamDinh(); } catch {}
    return true;
  };

  // --- TÍNH TOÁN CÁC ĐIỀU KIỆN BỊ TRÙNG LẶP ĐỂ HIỂN THỊ CẢNH BÁO ---
  const taoKhoaQuyTac = (row = {}) => {
    const maLuat = String(row?.MA_LUAT || '').trim().toUpperCase();
    if (maLuat) return `MA:${maLuat}`;

    const dieuKien = String(row?.DIEU_KIEN || '').replace(/\r?\n|\r/g, ' ').replace(/\s+/g, ' ').trim();
    const canhBao = String(row?.CANH_BAO || '').replace(/\r?\n|\r/g, ' ').replace(/\s+/g, ' ').trim();
    const tenQuyTac = String(row?.TEN_QUY_TAC || '').replace(/\r?\n|\r/g, ' ').replace(/\s+/g, ' ').trim();
    return `SIG:${dieuKien}|${canhBao}|${tenQuyTac}`;
  };

  const countDuplicateRules = () => {
    const counts = {};
    data.forEach(row => {
      const khoa = taoKhoaQuyTac(row);
      if (!khoa) return;
      counts[khoa] = (counts[khoa] || 0) + 1;
    });
    return counts;
  };
  const quyTacCounts = countDuplicateRules();

  // Kiểm tra trùng lặp theo mã luật hoặc chữ ký quy tắc khi người dùng gõ xong
  const kiemTraTrungLapBlur = (rowId) => {
    const dongHienTai = data.find((row) => row.id === rowId);
    if (!dongHienTai) return;
    const khoa = taoKhoaQuyTac(dongHienTai);
    if (!khoa) return;
    const isDuplicate = (quyTacCounts[khoa] || 0) > 1;
    
    if (isDuplicate) {
      const moTa = dongHienTai.MA_LUAT
        ? `Mã luật \"${dongHienTai.MA_LUAT}\" đã tồn tại trong tệp luật hiện tại.`
        : 'Quy tắc này đang trùng chữ ký nhận diện với một quy tắc đã có trong tệp luật hiện tại.';
      if (Platform.OS === 'web') {
        window.alert(`⚠️ PHÁT HIỆN TRÙNG LẶP!\n\n${moTa}\n\nVui lòng kiểm tra lại trước khi lưu.`);
      } else {
        Alert.alert('⚠️ TRÙNG LẶP QUY TẮC', moTa);
      }
    }
  };

  // --- HÀM SẮP XẾP DỮ LIỆU (SORT) ---
  const handleSort = (columnName) => {
    let direction = 'asc';
    if (sortConfig.column === columnName && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ column: columnName, direction });

    const sortedData = [...data].sort((a, b) => {
      let valA = a[columnName] || '';
      let valB = b[columnName] || '';

      if (!isNaN(valA) && !isNaN(valB) && valA !== '' && valB !== '') {
        return direction === 'asc' ? valA - valB : valB - valA;
      }

      return direction === 'asc' 
        ? String(valA).localeCompare(String(valB), 'vi', { sensitivity: 'base' })
        : String(valB).localeCompare(String(valA), 'vi', { sensitivity: 'base' });
    });

    if (Platform.OS === 'web') {
      try {
        const aliasId = ALIAS_TAB_ID[tabHienTai];
        window.localStorage.setItem(`CDSS_DATA_${tabHienTai}`, JSON.stringify(sortedData));
        if (aliasId) ghiAliasAnToanWeb(aliasId, sortedData, columns);
      } catch (e) { /* quota */ }
    }
    setData(sortedData);
  };

  // --- CÁC HÀM TÙY BIẾN CỘT VÀ DÒNG ---
  const handleAddColumn = () => {
    if (!newColumnName) return alert("Vui lòng nhập tên trường (cột) mới!");
    const colName = newColumnName.trim().toUpperCase().replace(/ /g, '_');
    if (columns.includes(colName)) return alert("Trường này đã tồn tại trong luật!");
    
    luuHeThong(data, [...columns, colName]);
    setNewColumnName('');
  };

  const handleAddRow = () => {
    if (columns.length === 0) return alert("Vui lòng thêm ít nhất 1 cột trước!");
    const newRow = { id: `RULE_${Date.now()}` };
    columns.forEach(col => newRow[col] = (col === 'TRANG_THAI' ? 'ON' : ""));
    luuHeThong([newRow, ...data], columns);
  };

  const handleCellChange = (text, rowId, colName) => {
    const newData = data.map(row => row.id === rowId ? { ...row, [colName]: text } : row);
    if (Platform.OS === 'web') {
      try {
        const aliasId = ALIAS_TAB_ID[tabHienTai];
        window.localStorage.setItem(`CDSS_DATA_${tabHienTai}`, JSON.stringify(newData));
        if (aliasId) ghiAliasAnToanWeb(aliasId, newData, columns);
        try { xoaCacheBoMayGiamDinh(); } catch {}
      } catch (e) { /* bỏ qua lỗi quota */ }
    }
    setData(newData);
  };

  // --- CHỨC NĂNG ON/OFF VÀ SELECT ALL ---
  const toggleTrangThai = (rowId) => {
    const newData = data.map(row => {
      if (row.id === rowId) {
        return { ...row, TRANG_THAI: row.TRANG_THAI === 'ON' ? 'OFF' : 'ON' };
      }
      return row;
    });
    luuHeThong(newData, columns);
  };

  const toggleSelectRow = (id) => {
    setSelectedRows(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]);
  };

  const handleSelectAll = () => {
    if (selectedRows.length === data.length && data.length > 0) {
      setSelectedRows([]); 
    } else {
      setSelectedRows(data.map(row => row.id)); 
    }
  };

  const handleXoaHangLoat = () => {
    if (selectedRows.length === 0) return alert("Vui lòng chọn ít nhất 1 dòng để xóa!");

    const xoaDuLieuDaChon = () => {
      const newData = data.filter(row => !selectedRows.includes(row.id));
      luuHeThong(newData, columns);
      setSelectedRows([]);
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`Chắc chắn xóa ${selectedRows.length} quy tắc đã chọn?`)) {
        xoaDuLieuDaChon();
      }
      return;
    }

    Alert.alert(
      'Xác nhận xóa',
      `Chắc chắn xóa ${selectedRows.length} quy tắc đã chọn?`,
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Xóa', style: 'destructive', onPress: xoaDuLieuDaChon },
      ]
    );
  };

  // --- SIÊU CÔNG CỤ EXCEL VÀ IMPORT LỌC TRÙNG ---
  const taiFileMau = () => {
    if (Platform.OS === 'web') {
      const ws = XLSX.utils.aoa_to_sheet([columns]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Mau_Nhap_Luat");
      XLSX.writeFile(wb, `Template_${tabHienTai}.xlsx`);
    } else {
        Alert.alert("Thông báo", "Chức năng tải file chỉ hỗ trợ trên Web.");
    }
  };

  const xuLyExport = () => {
    if (data.length === 0) return alert("Không có dữ liệu luật để xuất!");
    if (Platform.OS === 'web') {
      const exportData = data.map(row => {
        const rowData = {};
        columns.forEach(col => rowData[col] = row[col] || '');
        return rowData;
      });
      const ws = XLSX.utils.json_to_sheet(exportData, { header: columns });
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Danh_Sach_Luat");
      XLSX.writeFile(wb, `DuLieu_${tabHienTai}.xlsx`);
    }
  };

  const handleTaoSaoLuuLuat = async () => {
    try {
      const kq = await taoBanSaoDuLieuHeThong({
        reason: `MANUAL_RULE_BACKUP_${tabHienTai}`,
      });
      alert(`✅ Đã tạo bản sao lưu: ${kq.snapshot_id}\nSố khóa lưu: ${kq.entry_count}`);
    } catch (e) {
      alert(`❌ Không thể sao lưu dữ liệu luật: ${e.message || e}`);
    }
  };

  const handlePhucHoiBanGanNhat = async () => {
    try {
      const kq = await phucHoiBanSaoGanNhat();
      if (!kq.ok) {
        alert(`⚠️ ${kq.message || 'Chưa có bản sao lưu để phục hồi.'}`);
        return;
      }
      alert(`✅ Đã phục hồi từ bản sao gần nhất (${kq.snapshot_id}).`);
      navigation.replace('QuanLyLuat');
    } catch (e) {
      alert(`❌ Không thể phục hồi bản sao lưu: ${e.message || e}`);
    }
  };

  const xuLyImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const importedData = XLSX.utils.sheet_to_json(ws, { defval: "" });

      try {
        await taoBanSaoDuLieuHeThong({
          reason: `AUTO_BEFORE_RULE_IMPORT_${tabHienTai}`,
        });
      } catch (errBackup) {
        console.warn("Không tạo được auto-backup trước import luật:", errBackup);
      }

      if (importedData.length > 0) {
        const excelCols = Object.keys(importedData[0]);

        // CƠ CHẾ LỌC TRÙNG LẶP KHI IMPORT
        const existingRuleKeys = new Set(data.map((r) => taoKhoaQuyTac(r)).filter(Boolean));
        const uniqueImported = [];
        let duplicateCount = 0;

        importedData.forEach(row => {
          const normalizedRow = {
            ...row,
            id: `RULE_IMP_${Date.now()}_${Math.random()}`,
            TRANG_THAI: (row.TRANG_THAI === undefined || row.TRANG_THAI === '') ? 'ON' : row.TRANG_THAI,
          };
          const ruleKey = taoKhoaQuyTac(normalizedRow);
          if (ruleKey && existingRuleKeys.has(ruleKey)) {
            duplicateCount++;
          } else {
            if (ruleKey) existingRuleKeys.add(ruleKey);
            uniqueImported.push(normalizedRow);
          }
        });

        const mergedCols = [...new Set([...columns, ...excelCols])];
        if (!mergedCols.includes('TRANG_THAI')) mergedCols.unshift('TRANG_THAI');

        const luuThanhCong = await luuHeThong([...uniqueImported, ...data], mergedCols);

        if (luuThanhCong) {
          if (duplicateCount > 0) {
            alert(`✅ Đã Import và LƯU thành công ${uniqueImported.length} quy tắc!\n⚠️ Đã TỰ ĐỘNG BỎ QUA ${duplicateCount} quy tắc bị trùng trường DIEU_KIEN.`);
          } else {
            alert(`✅ Đã Import và LƯU thành công ${uniqueImported.length} quy tắc mới!`);
          }
        }
        // Nếu luuThanhCong === false: luuHeThong đã tự alert lỗi rồi, không cần làm gì thêm.
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = null; 
  };

  return (
    <SafeAreaView style={styles.vung_an_toan}>
      {/* HEADER */}
      <View style={styles.thanh_tieu_de}>
        <TouchableOpacity onPress={() => quayLaiAnToan(navigation, 'TongQuan')} style={styles.nut_quay_lai}>
          <Text style={styles.chu_nut_header}>⬅ TRỞ VỀ</Text>
        </TouchableOpacity>
        <View style={styles.khoi_tieu_de_giua}>
          <Text style={styles.chu_tieu_de}>⚙️ QUY TẮC KIỂM TRA BHYT (CDSS)</Text>
          <Text style={styles.chu_tieu_de_phu}>
            Cấu hình bảng động — đầu vào XML: QĐ 130/3176 (ưu tiên); bổ sung chuẩn hóa QĐ 4210 + CV 7464/BYT-BH khi nhập file.
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => dieuHuongMoTabMoi(navigation, 'QuanLyQuyTacOnOff')}
          style={styles.nut_quy_tac_on_off}
        >
          <Text style={styles.chu_nut_quy_tac_on_off}>🎚 QUY TẮC ON/OFF</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.khung_chuc_nang}>
        <View style={[styles.khung_chinh_luat, dungBoCucDoc && styles.khung_chinh_luat_doc]}>
          <View style={[styles.sidebar_luat, dungBoCucDoc ? styles.sidebar_luat_doc : { width: rongSidebar }]}>
            <Text style={styles.chu_sidebar_tieu_de_luat}>Chọn tệp luật</Text>
            <ScrollView
              style={styles.sidebar_scroll_luat}
              contentContainerStyle={styles.sidebar_scroll_content_luat}
              showsVerticalScrollIndicator
              keyboardShouldPersistTaps="handled"
            >
              {danhSachTab.map((tab) => {
                const dangChon = tabHienTai === tab.id;
                return (
                  <TouchableOpacity
                    key={tab.id}
                    onPress={() => setTabHienTai(tab.id)}
                    style={[styles.muc_sidebar_luat, dangChon && styles.muc_sidebar_luat_active]}
                    activeOpacity={0.85}
                  >
                    <Text
                      style={[styles.chu_muc_sidebar_luat, dangChon && styles.chu_muc_sidebar_luat_active]}
                      numberOfLines={5}
                    >
                      {tab.ten}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <View style={styles.khoi_noi_dung_phai_luat}>
        <View style={styles.thanh_cong_cu}>
          <View style={styles.khoi_them_cot}>
            <TextInput 
              style={styles.o_nhap_cot} 
              placeholder="Tên trường kiểm soát (VD: MA_ICD_LOAI_TRU)" 
              value={newColumnName} 
              onChangeText={setNewColumnName} 
              outlineStyle="none"
            />
            <TouchableOpacity style={styles.nut_xanh} onPress={handleAddColumn}>
              <Text style={styles.chu_nut}>+ THÊM TRƯỜNG</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.khoi_hanh_dong}>
            <TouchableOpacity style={styles.btn_outline} onPress={taiFileMau}>
              <Text style={styles.chu_btn_outline}>⬇ TẢI MẪU CHUẨN EXCEL</Text>
            </TouchableOpacity>
            
            {Platform.OS === 'web' && (
              <>
                <input type="file" accept=".xlsx, .xls" onChange={xuLyImport} style={{ display: 'none' }} id="import-luat" />
                <TouchableOpacity style={styles.nut_cam} onPress={() => document.getElementById('import-luat').click()}>
                  <Text style={styles.chu_nut}>📤 IMPORT EXCEL</Text>
                </TouchableOpacity>
              </>
            )}
            <TouchableOpacity style={styles.nut_xanh_duong} onPress={xuLyExport}>
              <Text style={styles.chu_nut}>📥 EXPORT BẢNG</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.btn_outline} onPress={handleTaoSaoLuuLuat}>
              <Text style={styles.chu_btn_outline}>💾 SAO LƯU DỮ LIỆU</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.nut_phuc_hoi} onPress={handlePhucHoiBanGanNhat}>
              <Text style={styles.chu_nut}>↩ PHỤC HỒI GẦN NHẤT</Text>
            </TouchableOpacity>
             
            <TouchableOpacity style={styles.nut_do} onPress={() => { alert("Dữ liệu đã được hệ thống tự động lưu!"); }}>
              <Text style={styles.chu_nut}>💾 ĐÃ TỰ ĐỘNG LƯU</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.thanh_tieu_de_bang}>
          <Text style={styles.tieu_de_bang}>
            📋 ĐANG QUẢN TRỊ TỆP: <Text style={{color: '#F48FB1'}}>{danhSachTab.find(t => t.id === tabHienTai)?.file}</Text> ({data.length} Quy tắc)
          </Text>
          <View style={{flexDirection: 'row', gap: 15}}>
            {selectedRows.length > 0 && (
              <TouchableOpacity style={styles.nut_xoa_nhom} onPress={handleXoaHangLoat}>
                <Text style={styles.chu_nut_xoa}>🗑 XÓA {selectedRows.length} DÒNG</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.nut_hong} onPress={handleAddRow}>
              <Text style={styles.chu_nut}>➕ THÊM QUY TẮC (DÒNG)</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* --- KHU VỰC BẢNG LÕI (CẢI TIẾN AUTO HEIGHT & FLEX WIDTH) --- */}
        <View style={styles.khung_bang_wrapper}>
          <ScrollView horizontal style={styles.scroll_ngang} contentContainerStyle={{ minWidth: '100%' }}>
            <View style={{ flex: 1 }}>
              <View style={styles.dong_tieu_de}>
                <TouchableOpacity style={[styles.o_tieu_de, { width: 90, alignItems: 'center', flexShrink: 0 }]} onPress={handleSelectAll}>
                  <View style={[styles.checkbox, selectedRows.length === data.length && data.length > 0 && styles.checkbox_active]}>
                    {selectedRows.length === data.length && data.length > 0 && <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 16 }}>✓ All</Text>}
                  </View>
                </TouchableOpacity>

                {columns.map((col, index) => {
                  const rongCot = layDoRongCot(col);

                  return (
                    <TouchableOpacity 
                      key={index} 
                      style={[styles.o_tieu_de, { width: rongCot, flexShrink: 0 }]}
                      onPress={() => handleSort(col)}
                    >
                      <Text style={styles.chu_o_tieu_de}>
                        {col} {sortConfig.column === col ? (sortConfig.direction === 'asc' ? '🔼' : '🔽') : '↕️'}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <ScrollView style={{ flex: 1 }}>
                {data.map((row, rowIndex) => (
                  <View key={row.id} style={[
                    styles.dong_du_lieu,
                    { backgroundColor: rowIndex % 2 === 0 ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.01)' },
                    selectedRows.includes(row.id) && { backgroundColor: 'rgba(194,24,91,0.2)' },
                    row.TRANG_THAI === 'OFF' && { opacity: 0.65 }
                  ]}>
                    <TouchableOpacity style={[styles.o_du_lieu, { width: 90, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }]} onPress={() => toggleSelectRow(row.id)}>
                      <View style={[styles.checkbox, selectedRows.includes(row.id) && styles.checkbox_active]}>
                        {selectedRows.includes(row.id) && <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 20 }}>✓</Text>}
                      </View>
                    </TouchableOpacity>

                    {columns.map((col, colIndex) => {
                      if (col === 'TRANG_THAI') {
                        const isOn = row[col] === 'ON';
                        return (
                          <View key={colIndex} style={[styles.o_du_lieu, { width: layDoRongCot(col), flexShrink: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'transparent' }]}>
                             <TouchableOpacity
                               style={[styles.btn_toggle, isOn
                                 ? { backgroundColor: 'rgba(76,175,80,0.2)', borderWidth: 1, borderColor: 'rgba(76,175,80,0.5)' }
                                 : { backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' }
                               ]}
                               onPress={() => toggleTrangThai(row.id)}
                             >
                                <Text style={[styles.txt_toggle, { color: isOn ? '#A5D6A7' : 'rgba(255,255,255,0.4)' }]}>{isOn ? '🟢 BẬT' : '⚫ TẮT'}</Text>
                             </TouchableOpacity>
                          </View>
                        );
                      }

                      const rongCot = layDoRongCot(col);

                      // Xác định ô này có bị trùng lặp DIEU_KIEN không
                      const isDuplicateCell = col === 'DIEU_KIEN' && (quyTacCounts[taoKhoaQuyTac(row)] || 0) > 1;

                      return (
                        <View key={colIndex} style={[styles.o_du_lieu, {
                            width: rongCot,
                            flexShrink: 0,
                            backgroundColor: isDuplicateCell ? 'rgba(194,24,91,0.25)' : 'transparent',
                            position: 'relative'
                          }]}>
                          <TextInput
                            style={[
                              styles.input_auto_height,
                              isDuplicateCell && { color: '#F48FB1', fontWeight: 'bold' }
                            ]}
                            value={String(row[col] || '')}
                            onChangeText={(text) => handleCellChange(text, row.id, col)}
                            onBlur={() => {
                              if (col === 'DIEU_KIEN' || col === 'MA_LUAT') kiemTraTrungLapBlur(row.id);
                            }}
                            multiline={true}
                            outlineStyle="none"
                          />
                          {isDuplicateCell && (
                            <Text style={styles.txt_canh_bao_trung}>⚠️ Trùng lặp</Text>
                          )}
                        </View>
                      );
                    })}
                  </View>
                ))}
                {data.length === 0 && (
                  <Text style={styles.txt_trong}>Tệp luật này hiện đang trống. Bác sĩ có thể Import Excel hoặc thêm dòng mới.</Text>
                )}
              </ScrollView>
            </View>
          </ScrollView>
        </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ManHinhQuanLyLuat;

const styles = StyleSheet.create({
  vung_an_toan: {
    flex: 1,
    backgroundColor: CD.bg.gradient_mobile,
    ...Platform.select({ web: { backgroundImage: CD.web.gradient_bg } }),
  },
  thanh_tieu_de: {
    backgroundColor: CD.brand.mauDam,
    paddingHorizontal: 24,
    paddingVertical: 16,
    paddingTop: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: CD.border.header,
    ...Platform.select({ web: { backgroundImage: CD.web.gradient_header, backdropFilter: CD.web.blur_header, boxShadow: CD.web.shadow_header } }),
  },
  nut_quay_lai: {
    padding: 12,
    backgroundColor: CD.bg.glass_input,
    borderWidth: 1,
    borderColor: CD.border.glass_md,
    borderRadius: 14,
  },
  nut_quy_tac_on_off: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: CD.brand.mauChinh,
    borderWidth: 1,
    borderColor: CD.border.glass_md,
    borderRadius: 14,
    ...Platform.select({ web: { backgroundImage: CD.web.gradient_primary, boxShadow: CD.web.shadow_btn, cursor: CD.web.cursor_pointer } }),
  },
  chu_nut_header: { color: CD.text.primary, fontWeight: 'bold', fontSize: 20, fontFamily: CD.font.family },
  chu_nut_quy_tac_on_off: { color: CD.text.primary, fontWeight: '700', fontSize: 16, fontFamily: CD.font.family },
  khoi_tieu_de_giua: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 },
  chu_tieu_de: { fontSize: 26, color: CD.text.primary, fontWeight: 'bold', fontFamily: CD.font.family, textAlign: 'center' },
  chu_tieu_de_phu: {
    fontSize: 13,
    color: CD.text.primary,
    opacity: 0.92,
    marginTop: 6,
    textAlign: 'center',
    fontFamily: CD.font.family,
    maxWidth: 720,
    alignSelf: 'center',
  },
  khung_chuc_nang: { flex: 1, minHeight: 0, minWidth: 0 },
  khung_chinh_luat: {
    flex: 1,
    flexDirection: 'row',
    minHeight: 0,
    minWidth: 0,
  },
  khung_chinh_luat_doc: {
    flexDirection: 'column',
  },
  sidebar_luat: {
    alignSelf: 'stretch',
    flexDirection: 'column',
    paddingTop: 12,
    paddingHorizontal: 10,
    paddingBottom: 8,
    borderRightWidth: 1,
    borderRightColor: CD.border.glass_md,
    backgroundColor: 'rgba(0,0,0,0.22)',
    ...Platform.select({ web: { boxSizing: 'border-box' } }),
  },
  sidebar_luat_doc: {
    width: '100%',
    maxHeight: 260,
    borderRightWidth: 0,
    borderBottomWidth: 1,
    borderBottomColor: CD.border.glass_md,
  },
  chu_sidebar_tieu_de_luat: {
    fontSize: 13,
    fontWeight: '800',
    color: CD.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    paddingHorizontal: 8,
    paddingBottom: 10,
    fontFamily: CD.font.family,
  },
  sidebar_scroll_luat: { flex: 1 },
  sidebar_scroll_content_luat: { paddingBottom: 20 },
  muc_sidebar_luat: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: CD.border.glass,
    backgroundColor: CD.bg.glass_card,
    marginBottom: 6,
  },
  muc_sidebar_luat_active: {
    backgroundColor: CD.brand.mauChinh,
    borderColor: '#AD1457',
    ...Platform.select({ web: { boxShadow: '0 2px 12px rgba(216,27,96,0.45)' } }),
  },
  chu_muc_sidebar_luat: {
    fontSize: 15,
    lineHeight: 21,
    color: CD.text.secondary,
    fontWeight: '700',
    fontFamily: CD.font.family,
  },
  chu_muc_sidebar_luat_active: {
    color: '#FFFFFF',
  },
  khoi_noi_dung_phai_luat: {
    flex: 1,
    minWidth: 0,
    minHeight: 0,
    flexDirection: 'column',
    padding: 15,
    paddingTop: 16,
    ...Platform.select({
      web: { paddingLeft: 18, paddingRight: 20 },
    }),
  },
  thanh_cong_cu: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' },
  khoi_them_cot: { flexDirection: 'row', alignItems: 'center' },
  o_nhap_cot: {
    backgroundColor: CD.bg.glass_input,
    borderWidth: 1,
    borderColor: CD.border.input,
    borderRadius: 12,
    color: CD.text.primary,
    fontSize: 22,
    paddingVertical: 14,
    paddingHorizontal: 16,
    width: 350,
    marginRight: 15,
    fontFamily: CD.font.family,
    ...Platform.select({ web: { backdropFilter: CD.web.blur_input, outlineStyle: 'none' } }),
  },
  khoi_hanh_dong: { flexDirection: 'row', gap: 15, alignItems: 'center' },
  // "+ THÊM TRƯỜNG" → Primary button (blue tone → using primary pink per design)
  nut_xanh: {
    backgroundColor: CD.brand.mauChinh,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({ web: { backgroundImage: CD.web.gradient_primary, boxShadow: CD.web.shadow_btn, cursor: CD.web.cursor_pointer } }),
  },
  // EXPORT → secondary glass button
  nut_xanh_duong: {
    backgroundColor: CD.bg.glass_input,
    borderWidth: 1,
    borderColor: CD.border.glass_md,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  nut_phuc_hoi: {
    backgroundColor: '#F9A825',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    justifyContent: 'center',
    ...Platform.select({ web: { boxShadow: CD.web.shadow_btn, cursor: CD.web.cursor_pointer } }),
  },
  // IMPORT EXCEL → green button
  nut_cam: {
    backgroundColor: '#388E3C',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    justifyContent: 'center',
    ...Platform.select({ web: { backgroundImage: CD.web.gradient_green, boxShadow: CD.web.shadow_btn_green, cursor: CD.web.cursor_pointer } }),
  },
  // THÊM QUY TẮC → primary button
  nut_hong: {
    backgroundColor: CD.brand.mauChinh,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({ web: { backgroundImage: CD.web.gradient_primary, boxShadow: CD.web.shadow_btn, cursor: CD.web.cursor_pointer } }),
  },
  // TỰ ĐỘNG LƯU → green button
  nut_do: {
    backgroundColor: '#388E3C',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    justifyContent: 'center',
    ...Platform.select({ web: { backgroundImage: CD.web.gradient_green, boxShadow: CD.web.shadow_btn_green, cursor: CD.web.cursor_pointer } }),
  },
  // TẢI MẪU CHUẨN EXCEL → secondary glass button
  btn_outline: {
    backgroundColor: CD.bg.glass_input,
    borderWidth: 1,
    borderColor: CD.border.glass_md,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  chu_btn_outline: { color: CD.text.primary, fontSize: 20, fontWeight: 'bold', fontFamily: CD.font.family },
  chu_nut: { color: CD.text.primary, fontWeight: 'bold', fontSize: 20, fontFamily: CD.font.family },
  thanh_tieu_de_bang: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  tieu_de_bang: { fontSize: 24, fontWeight: 'bold', color: CD.text.primary, fontFamily: CD.font.family },
  // XÓA DÒNG → secondary glass button
  nut_xoa_nhom: {
    backgroundColor: CD.bg.glass_input,
    borderWidth: 1,
    borderColor: CD.border.glass_md,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  chu_nut_xoa: { color: CD.text.primary, fontWeight: 'bold', fontSize: 20, fontFamily: CD.font.family },
  khung_bang_wrapper: {
    flex: 1,
    backgroundColor: CD.bg.glass_card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: CD.border.glass,
    overflow: 'hidden',
    ...Platform.select({ web: { backdropFilter: CD.web.blur_card, WebkitBackdropFilter: CD.web.blur_card, boxShadow: CD.web.shadow_card } }),
  },
  scroll_ngang: { flex: 1 },
  dong_tieu_de: { flexDirection: 'row', backgroundColor: CD.bg.table_header, borderBottomWidth: 2, borderColor: CD.border.accent },
  o_tieu_de: { padding: 18, borderRightWidth: 1, borderColor: CD.border.divider, justifyContent: 'center' },
  chu_o_tieu_de: { fontWeight: '700', fontSize: 20, color: CD.text.table_header, fontFamily: CD.font.family, textAlign: 'center' },

  dong_du_lieu: { flexDirection: 'row', borderBottomWidth: 1, borderColor: CD.border.divider },
  o_du_lieu: { borderRightWidth: 1, borderColor: CD.border.divider, padding: 0, justifyContent: 'center' },

  input_auto_height: {
    padding: 12,
    fontSize: 19,
    color: CD.text.primary,
    fontFamily: CD.font.family,
    minHeight: 76,
    lineHeight: 26,
    height: '100%',
    textAlignVertical: 'top',
    backgroundColor: CD.bg.glass_input,
    borderWidth: 1,
    borderColor: CD.border.input,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },

  checkbox: { width: 35, height: 35, borderWidth: 2, borderColor: CD.border.glass_md, borderRadius: 6, justifyContent: 'center', alignItems: 'center', backgroundColor: CD.bg.glass_input },
  checkbox_active: { backgroundColor: CD.brand.mauChinh, borderColor: CD.brand.mauChinh2 },

  btn_toggle: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 25, elevation: 2 },
  txt_toggle: { color: CD.text.primary, fontWeight: 'bold', fontSize: 18, fontFamily: CD.font.family },

  txt_trong: { padding: 50, fontSize: 24, fontStyle: 'italic', color: CD.text.muted, textAlign: 'center', fontFamily: CD.font.family },

  // Style cảnh báo khi bị trùng
  txt_canh_bao_trung: { color: CD.brand.mauNhat, fontSize: 13, fontWeight: 'bold', position: 'absolute', bottom: 4, right: 10, backgroundColor: CD.bg.table_header, paddingHorizontal: 5, borderRadius: 4 }
});
