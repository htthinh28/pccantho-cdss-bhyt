/**
 * MODULE: QUẢN LÝ DANH MỤC TỔNG THỂ (MASTER DATA — sidebar trái)
 * Nhập/xuất XML theo khung QĐ 326/QĐ-BHXH (31/03/2026) + TT 12/2026/TT-BTC (định dạng nội bộ CDSS, bổ sung cho Excel).
 * Nâng cấp (Bản 2.0 - Fullscreen & Chunking Storage):
 * 1. FIX LỖI MẤT DỮ LIỆU: Vượt rào giới hạn 5MB của Web Browser bằng thuật toán Chunking (Băm nhỏ mảng).
 * 2. FIX AUTO-SAVE: Bổ sung cờ isReadyToSave để tránh ghi đè mảng rỗng khi F5.
 * 3. UI FULLSCREEN: Xóa bỏ giới hạn chiều cao, dãn cột (450px) và dãn dòng (padding 18px).
 * Giao diện: Pink Theme Phương Châu, Arial > 20px
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { rongSidebarCap, useLayoutMode } from '../tien_ich/diem_anh_man_hinh';
import * as XLSX from 'xlsx';
import { CD } from '../tien_ich/chu_de_giao_dien';
import { quayLaiAnToan } from '../tien_ich/dieu_huong_an_toan';
import { dieuHuongMoTabMoi } from '../tien_ich/dieu_huong_mo_tab_moi';
import { xoaCacheBoMayGiamDinh } from '../tien_ich/dong_co_giam_dinh';
import {
    doiSoatBoDuLieuDanhMucVoiFirebase,
    flushFirebaseDanhMucQueue,
    luuBoDuLieuDanhMuc,
    taiBoDuLieuDanhMuc,
} from '../tien_ich/luu_tru_danh_muc';
import { phucHoiBanSaoGanNhat, taoBanSaoDuLieuHeThong } from '../tien_ich/sao_luu_du_lieu_he_thong';
import {
  demThongKeImportVsHienCo,
  gopImportVoiBangHienCo,
  gopTrungTrongBangGiuDongDau,
  layCotKhoaChoTab,
  timNhomTrungTrongBang,
} from '../tien_ich/danh_muc_trung_lap';
import { locDongTheoTuKhoa, tinhChiSoPhanTrang } from '../tien_ich/bo_loc_bang_du_lieu';
import { chuanTenSheetInAn, inHoacChiaSePdfTuBang } from '../tien_ich/in_an_chung';
import TimKiemPhanTrangBang from '../thanh_phan/tim_kiem_phan_trang_bang';
import {
  nhapXmlDanhMucNoiBo,
  taiXuongFileXmlTrenWeb,
  xuatXmlDanhMucNoiBo,
} from '../tien_ich/danh_muc_xml_qd326_tt12';
import { MAU_EXCEL_CHUAN } from '../tien_ich/mau_excel_chuan_danh_muc';

// ============================================================================
// HỆ THỐNG LƯU TRỮ CHỐNG TRÀN BỘ NHỚ WEB (CHUNKING STORAGE)
// ============================================================================
// ============================================================================
// DANH SÁCH TAB & TEMPLATES
// ============================================================================
const DANH_SACH_TAB = [
  { id: 'DANH_MUC_ICD10', ten: 'Danh mục ICD-10' }, 
  { id: 'DANH_MUC_ICD10_CAP_CUU', ten: 'ICD10 cấp cứu' },
  { id: 'DANH_MUC_ICD10_KE_DON_TREN_30_NGAY', ten: 'ICD10 kê >30 ngày' },
  { id: 'THONG_TIN_CO_SO', ten: 'Thông tin Cơ sở' },
  { id: 'DANH_MUC_KHOA_LS_M01', ten: 'Mẫu 01 (Khoa/Giường)' },
  { id: 'DANH_MUC_NHAN_SU', ten: 'Mẫu 02 (Nhân sự)' },
  { id: 'DANH_MUC_MAPPING_NGUOI_HANH_NGHE', ten: 'Mapping người hành nghề' },
  { id: 'DVKT_PHAMVI_MAPPING', ten: 'Mapping phạm vi – chức danh DVKT' },
  { id: 'DVKT_EQUIP_DVKT_MAP', ten: 'Mapping máy thiết bị ↔ prefix DVKT' },
  { id: 'DANH_MUC_THUOC_MAU_M03', ten: 'Mẫu 03 (Thuốc/Máu)' },
  { id: 'DANH_MUC_THUOC_DIEU_KIEN_TT', ten: 'Thuốc điều kiện thanh toán' },
  { id: 'DANH_MUC_MA_THE_QUYEN_LOI', ten: 'Mã thẻ và quyền lợi' },
  { id: 'DANH_MUC_VAT_TU_M04', ten: 'Mẫu 04 (Vật tư)' },
  { id: 'DANH_MUC_DVKT_M05', ten: 'Mẫu 05 (DVKT)' },
  { id: 'DANH_MUC_GIUONG_BAN_KHAM_BV', ten: 'Giường & khám (mã BV mới)' },
  { id: 'DANH_MUC_TRANG_THIET_BI_M06', ten: 'Mẫu 06 (Thiết bị)' },
  { id: 'DANH_MUC_HA_TANG', ten: 'Hạ tầng (JCI)' },
];

const IDS_TAB_ICD_DAC_BIET = ['DANH_MUC_ICD10', 'DANH_MUC_ICD10_CAP_CUU', 'DANH_MUC_ICD10_KE_DON_TREN_30_NGAY'];

/** Mặc định mỗi trang (tránh render cùng lúc quá nhiều ô TextInput). Có thể đổi trên UI. */
const SO_DONG_MOI_TRANG_MAC_DINH = 160;
/** Các mức số dòng/trang; -1 = hiển thị toàn bộ dữ liệu hiện có trong một trang (có thể nặng máy với danh mục lớn). */
const TUY_CHON_SO_DONG_MOT_TRANG = [
  { label: '160', value: 160 },
  { label: '320', value: 320 },
  { label: '500', value: 500 },
  { label: '1000', value: 1000 },
  { label: 'Tất cả', value: -1 },
];
const DANH_SACH_TAB_DONG_BO = DANH_SACH_TAB.map((tab) => ({
  id: tab.id,
  ten: tab.ten,
  dataKey: tab.id,
  columnsKey: `COLS_${tab.id}`,
}));

const ManHinhQuanLyDanhMuc = ({ navigation, route }) => {
  const { dungBoCucDoc, width: winW } = useLayoutMode();
  const rongSidebar = rongSidebarCap(winW);
  const [danhMucHienTai, setDanhMucHienTai] = useState(DANH_SACH_TAB[0].id); 
  const [columns, setColumns] = useState([]);
  const [data, setData] = useState([]);
  const [newColumnName, setNewColumnName] = useState('');
  const [trangHienTai, setTrangHienTai] = useState(1);
  const [soDongMotTrang, setSoDongMotTrang] = useState(SO_DONG_MOI_TRANG_MAC_DINH);
  /** Import Excel: có dòng trùng khóa — chọn ghi đè / bỏ qua */
  const [modalImportTrung, setModalImportTrung] = useState(null);
  const [tuKhoaTim, setTuKhoaTim] = useState('');
  /** Dòng cần xóa hàng loạt — theo `indexGoc` trong mảng `data` (ổn định dù tìm/ phân trang). */
  const [dauChonDong, setDauChonDong] = useState(() => new Set());

  const layDoRongCot = (tenCot) => {
    const cot = String(tenCot || '').toUpperCase();
    if (/(TEN|NAME|GHI_CHU|DIA_CHI|MO_TA|NOI_DUNG|QUY_TRINH|PHAMVI)/.test(cot)) return 560;
    if (/^MA_/.test(cot)) return 280;
    if (/(NGAY|SO_|DON_GIA|TYLE|SLUONG|THANH_TIEN|MUC_HUONG)/.test(cot)) return 260;
    return 320;
  };

  // KHÓA AN TOÀN AUTO-SAVE: Chỉ bật khi dữ liệu từ DB đã được đẩy lên UI hoàn tất
  const isReadyToSave = useRef(false);
  const dirtyRef = useRef(false);
  const dataRef = useRef([]);
  const columnsRef = useRef([]);
  const danhMucRef = useRef(DANH_SACH_TAB[0].id);

  useEffect(() => { dataRef.current = data; }, [data]);
  useEffect(() => { columnsRef.current = columns; }, [columns]);
  useEffect(() => { danhMucRef.current = danhMucHienTai; }, [danhMucHienTai]);
  const hangLocChiSo = useMemo(
    () => locDongTheoTuKhoa(data, columns, tuKhoaTim),
    [data, columns, tuKhoaTim],
  );
  const nSauLoc = hangLocChiSo.length;

  const { tongSoTrang, trangDangXem, chiSoBatDau, chiSoKetThuc } = useMemo(
    () => tinhChiSoPhanTrang(nSauLoc, soDongMotTrang, trangHienTai),
    [nSauLoc, soDongMotTrang, trangHienTai],
  );

  useEffect(() => {
    if (trangHienTai > tongSoTrang) setTrangHienTai(tongSoTrang);
  }, [tongSoTrang, trangHienTai]);

  useEffect(() => {
    setTrangHienTai(1);
    setTuKhoaTim('');
    setDauChonDong(new Set());
  }, [danhMucHienTai]);

  useEffect(() => {
    setTrangHienTai(1);
  }, [tuKhoaTim, soDongMotTrang]);

  const layKhoaCotDanhMuc = (key) => `COLS_${key}`;
  const dinhDangThoiGianMeta = (value) => {
    const ts = Number(value || 0);
    if (!ts) return 'chưa rõ';
    try {
      return new Date(ts).toLocaleString('vi-VN');
    } catch {
      return 'chưa rõ';
    }
  };
  const dinhDangKhoiMeta = (label, block) => {
    const local = block?.local || {};
    const remote = block?.remote || {};
    const status = block?.status || {};
    const trangThai = !remote.ok
      ? `Firebase chưa sẵn sàng (${remote.reason || 'không đọc được metadata'})`
      : !remote.exists
        ? 'Firebase chưa có dữ liệu'
        : block?.differs
          ? 'Khác dữ liệu với local'
          : 'Đang khớp với local';
    const lines = [
      `${label}: ${trangThai}`,
      `- Local: ${Number(local.row_count || 0)} dòng | cập nhật ${dinhDangThoiGianMeta(local.updated_at_ms)}`,
      `- Firebase: ${remote.exists ? `${Number(remote.row_count || 0)} dòng | cập nhật ${dinhDangThoiGianMeta(remote.updated_at_ms)}` : 'chưa có dataset'}`,
    ];
    if (status.has_unsynced_local_changes) {
      lines.push('- Lưu ý: local đang có thay đổi chưa đồng bộ, không nên ghi đè tự động.');
    } else if (status.can_auto_hydrate) {
      lines.push('- Gợi ý: có thể tải an toàn từ Firebase vì remote mới hơn và local đang sạch.');
    }
    return lines.join('\n');
  };
  const tomTatDongBo = (items) => {
    const tong = items.length;
    const lech = items.filter((item) => item.data.differs || item.columns.differs).length;
    const coTheTai = items.filter((item) => item.data.status?.can_auto_hydrate || item.columns.status?.can_auto_hydrate).length;
    const coLocalChuaDongBo = items.filter((item) => item.data.status?.has_unsynced_local_changes || item.columns.status?.has_unsynced_local_changes).length;
    return { tong, lech, coTheTai, coLocalChuaDongBo };
  };
  const danhDauDaSua = () => { dirtyRef.current = true; };
  const luuNgayDanhMuc = async ({ localOnly = false, source = 'catalog_manual_save' } = {}) => {
    if (!isReadyToSave.current || !dirtyRef.current) return false;
    const currentKey = danhMucRef.current;
    await luuBoDuLieuDanhMuc({
      dataKey: currentKey,
      columnsKey: layKhoaCotDanhMuc(currentKey),
      data: dataRef.current,
      columns: columnsRef.current,
      source,
      syncRemote: !localOnly,
    });
    try { xoaCacheBoMayGiamDinh(); } catch {}
    dirtyRef.current = false;
    return true;
  };

  // 1. PHỤC HỒI TAB ĐANG LÀM VIỆC KHI REFRESH
  useEffect(() => {
    const khoiTao = async () => {
      try {
        const tabParam = route?.params?.moTab;
        if (tabParam && DANH_SACH_TAB.some((t) => t.id === tabParam)) {
          setDanhMucHienTai(tabParam);
          await AsyncStorage.setItem('TAB_DANG_MO', tabParam);
          return;
        }
        const tabLuuTru = await AsyncStorage.getItem('TAB_DANG_MO');
        if (tabLuuTru && DANH_SACH_TAB.some((t) => t.id === tabLuuTru)) {
          setDanhMucHienTai(tabLuuTru);
        } else if (tabLuuTru) {
          await AsyncStorage.setItem('TAB_DANG_MO', DANH_SACH_TAB[0].id);
        }
      } catch (error) { console.error(error); }
    };
    khoiTao();
  }, [route?.params?.moTab]);

  // 2. N?P D? LI?U T? KHO V?T L?
  useEffect(() => {
    const napDuLieu = async () => {
      isReadyToSave.current = false;
      dirtyRef.current = false;
      try {
        const { data: finalData, columns: finalColumns, seededFromCode, hydratedFromFirebase } = await taiBoDuLieuDanhMuc({
          dataKey: danhMucHienTai,
          columnsKey: layKhoaCotDanhMuc(danhMucHienTai),
          fallbackColumns: MAU_EXCEL_CHUAN[danhMucHienTai] || [],
        });

        dataRef.current = finalData;
        columnsRef.current = finalColumns;
        setData(finalData);
        setColumns(finalColumns);
        if (seededFromCode || hydratedFromFirebase) {
          try { xoaCacheBoMayGiamDinh(); } catch {}
        }
      } catch (e) {
        console.warn('Lỗi đọc Kho dữ liệu: ', e);
      } finally {
        setTimeout(() => { isReadyToSave.current = true; }, 300);
      }
    };

    napDuLieu();
  }, [danhMucHienTai]);

  // 3. AUTO-SAVE
  useEffect(() => {
    if (!isReadyToSave.current || !dirtyRef.current) return;

    const saveTimer = setTimeout(() => {
      luuNgayDanhMuc({ source: 'catalog_autosave' }).catch((e) => {
        console.error('Lỗi Auto-Save danh mục:', e);
      });
    }, 700);

    return () => clearTimeout(saveTimer);
  }, [data, columns, danhMucHienTai]);

  useEffect(() => {
    if (Platform.OS !== 'web') return undefined;

    const flushLocal = () => {
      luuNgayDanhMuc({ localOnly: true, source: 'catalog_pagehide' }).catch(() => {});
    };
    const handleVisibility = () => {
      if (globalThis.document?.visibilityState === 'hidden') flushLocal();
    };

    globalThis.addEventListener?.('pagehide', flushLocal);
    globalThis.addEventListener?.('beforeunload', flushLocal);
    globalThis.document?.addEventListener?.('visibilitychange', handleVisibility);

    return () => {
      flushLocal();
      globalThis.removeEventListener?.('pagehide', flushLocal);
      globalThis.removeEventListener?.('beforeunload', flushLocal);
      globalThis.document?.removeEventListener?.('visibilitychange', handleVisibility);
    };
  }, []);

  const chuyenTab = async (id) => {
    await luuNgayDanhMuc({ source: 'catalog_switch_tab' }).catch(() => {});
    setDanhMucHienTai(id);
    await AsyncStorage.setItem('TAB_DANG_MO', id);
  };

  const handleAddColumn = () => {
    if (!newColumnName) return alert("Vui lòng nhập tên trường thông tin mới!");
    const columnName = newColumnName.trim().toUpperCase().replace(/ /g, '_');
    if (columns.includes(columnName)) return alert("Trường thông tin này đã tồn tại!");
    const nextColumns = [...columns, columnName];
    danhDauDaSua();
    columnsRef.current = nextColumns;
    setColumns(nextColumns);
    setNewColumnName('');
  };

  const handleAddRow = () => {
    if (columns.length === 0) return alert("Vui lòng thêm ít nhất một cột trước!");
    const newRow = {};
    columns.forEach(col => newRow[col] = "");
    const nextData = [newRow, ...data];
    danhDauDaSua();
    dataRef.current = nextData;
    setData(nextData);
    setTrangHienTai(1);
  };

  const handleDeleteRow = (index) => {
    if (Platform.OS === 'web' && !window.confirm("Bác sĩ có chắc chắn muốn xóa dòng này?")) return;
    const newData = [...data];
    newData.splice(index, 1);
    danhDauDaSua();
    dataRef.current = newData;
    setData(newData);
    setDauChonDong((prev) => {
      const s = new Set();
      prev.forEach((j) => {
        if (j < index) s.add(j);
        else if (j > index) s.add(j - 1);
      });
      return s;
    });
  };

  const hoiXoaNhieuDong = (n) => {
    const msg = `Bác sĩ có chắc chắn muốn xóa ${n} dòng đã chọn? Hành động không thể hoàn tác.`;
    if (Platform.OS === 'web') {
      return Promise.resolve(window.confirm(msg));
    }
    return new Promise((resolve) => {
      Alert.alert('Xóa hàng loạt', msg, [
        { text: 'Hủy', style: 'cancel', onPress: () => resolve(false) },
        { text: 'Xóa', style: 'destructive', onPress: () => resolve(true) },
      ]);
    });
  };

  const handleToggleChonDong = (indexGoc) => {
    setDauChonDong((prev) => {
      const s = new Set(prev);
      if (s.has(indexGoc)) s.delete(indexGoc);
      else s.add(indexGoc);
      return s;
    });
  };

  const handleBoChonTatCa = () => setDauChonDong(new Set());

  const handleXoaDaChon = async () => {
    const tap = new Set(dauChonDong);
    if (tap.size === 0) {
      const msg = 'Chưa chọn dòng nào. Dùng cột [Chọn] từng dòng, hoặc bấm ô ở tiêu đề để chọn/bỏ cả trang hiện tại.';
      if (Platform.OS === 'web') window.alert(msg);
      else Alert.alert('Chưa chọn dòng', msg);
      return;
    }
    if (!(await hoiXoaNhieuDong(tap.size))) return;
    const newData = data.filter((_, i) => !tap.has(i));
    danhDauDaSua();
    dataRef.current = newData;
    setData(newData);
    setDauChonDong(new Set());
    try {
      xoaCacheBoMayGiamDinh();
    } catch {
      // ignore
    }
  };

  const handleCellChange = (text, rowIndex, colName) => {
    const newData = [...data];
    newData[rowIndex][colName] = text;
    danhDauDaSua();
    dataRef.current = newData;
    setData(newData);
  };

  const handleExportXLSX = () => {
    if (data.length === 0) return alert("Không có dữ liệu để xuất!");
    if (Platform.OS === 'web') {
      try {
        const worksheet = XLSX.utils.json_to_sheet(data, { header: columns });
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, danhMucHienTai.substring(0, 31)); 
        XLSX.writeFile(workbook, `Du_Lieu_${danhMucHienTai}.xlsx`);
      } catch (error) {
        alert("Có lỗi xảy ra: " + error.message);
      }
    }
  };

  const layTenBangHienTai = () => DANH_SACH_TAB.find((t) => t.id === danhMucHienTai)?.ten || danhMucHienTai;

  const handleInPdfBang = async () => {
    if (columns.length === 0) return alert('Chưa có cột để in.');
    /** `locDongTheoTuKhoa` trả về `{ row, indexGoc }[]` — in cần mảng object dòng thuần */
    const rows = hangLocChiSo.map(({ row }) => row);
    if (rows.length === 0) return alert('Không có dữ liệu (sau lọc/tìm) để in.');
    const cols = columns.map((c) => ({ key: c, label: c }));
    const exportNote = tuKhoaTim.trim()
      ? `Chỉ các dòng khớp từ khóa tìm: "${tuKhoaTim.trim()}".`
      : undefined;
    const tieuDe = `Danh mục nội bộ — ${layTenBangHienTai()}`;
    await inHoacChiaSePdfTuBang(
      [{ sheetName: chuanTenSheetInAn(danhMucHienTai), columns: cols, rows, exportNote }],
      tieuDe,
    );
  };

  /** Xuất XML theo đặt tả nội bộ QĐ 326 / TT 12-2026 (không thay thế Excel). */
  const handleExportXmlQd326 = () => {
    if (columns.length === 0) return alert('Chưa có cột để xuất.');
    if (Platform.OS !== 'web') {
      alert('Xuất XML (QĐ326/TT12) hiện chỉ hỗ trợ trên web.');
      return;
    }
    try {
      const xml = xuatXmlDanhMucNoiBo({
        maBang: danhMucHienTai,
        tenBang: layTenBangHienTai(),
        columns,
        rows: data,
      });
      taiXuongFileXmlTrenWeb(xml, `Du_Lieu_${danhMucHienTai}_QD326_TT12.xml`);
    } catch (error) {
      alert(`Lỗi xuất XML: ${error.message || error}`);
    }
  };

  const handleTaiFileMauXml = () => {
    if (Platform.OS !== 'web') {
      alert('Tải file mẫu XML chỉ hỗ trợ trên web.');
      return;
    }
    const cotMau = columns.length > 0 ? columns : (MAU_EXCEL_CHUAN[danhMucHienTai] || ['MA_DU_LIEU', 'TEN_DU_LIEU', 'GHI_CHU']);
    const hangRong = cotMau.reduce((acc, c) => ({ ...acc, [c]: '' }), {});
    try {
      const xml = xuatXmlDanhMucNoiBo({
        maBang: danhMucHienTai,
        tenBang: layTenBangHienTai(),
        columns: cotMau,
        rows: [hangRong],
      });
      taiXuongFileXmlTrenWeb(xml, `FileMau_${danhMucHienTai}_QD326_TT12.xml`);
    } catch (error) {
      alert(`Lỗi tạo mẫu XML: ${error.message || error}`);
    }
  };

  const xuLySauKhiNhapBang = async (importedData, mergedCols, source = 'catalog_import_excel') => {
    if (importedData.length === 0) {
      alert('Không có dòng dữ liệu.');
      return;
    }
    if (Platform.OS !== 'web') {
      try {
        await taoBanSaoDuLieuHeThong({
          reason: `AUTO_BEFORE_IMPORT_${danhMucHienTai}`,
          includeKeys: ['TAB_DANG_MO'],
        });
      } catch (errBackup) {
        console.warn('Không tạo được auto-backup trước import:', errBackup);
      }
    }
    const cotKhoa = layCotKhoaChoTab(
      danhMucHienTai,
      MAU_EXCEL_CHUAN[danhMucHienTai],
      mergedCols,
    );
    const thongKe = demThongKeImportVsHienCo(
      dataRef.current,
      importedData,
      mergedCols,
      cotKhoa,
    );
    if (thongKe.soTrung > 0) {
      setModalImportTrung({
        mergedCols,
        importedRaw: importedData,
        thongKe,
        cotKhoa,
      });
      return;
    }
    const newData = gopImportVoiBangHienCo(
      dataRef.current,
      importedData,
      mergedCols,
      cotKhoa,
      'skip',
    );
    await thucHienLuuSauImport(mergedCols, newData, importedData.length, source);
  };

  const handleImportXmlQd326 = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const text = String(evt.target.result || '');
        const { columns: xmlCols, rows: xmlRows, meta, loi } = nhapXmlDanhMucNoiBo(text);
        if (loi) {
          alert(`❌ ${loi}`);
          return;
        }
        if (!xmlRows.length) {
          alert('File XML không có dòng <Hang> dữ liệu.');
          return;
        }
        if (
          Platform.OS === 'web'
          && meta.maBang
          && meta.maBang !== danhMucHienTai
          && !window.confirm(
            `File khai báo maBang="${meta.maBang}" khác tab đang mở "${danhMucHienTai}". Vẫn nhập dữ liệu vào tab hiện tại?`,
          )
        ) {
          return;
        }
        const keysFromRows = new Set();
        xmlRows.forEach((r) => Object.keys(r).forEach((k) => keysFromRows.add(k)));
        const mergedCols = [
          ...new Set([...columnsRef.current, ...xmlCols, ...keysFromRows]),
        ];
        await xuLySauKhiNhapBang(xmlRows, mergedCols, 'catalog_import_xml');
      } catch (err) {
        alert(`❌ Lỗi import XML: ${err.message || err}`);
      }
    };
    reader.readAsText(file, 'UTF-8');
    e.target.value = null;
  };

  const handleTaiFileMau = () => {
    if (Platform.OS !== 'web') {
      alert("Tính năng tải file mẫu chỉ hỗ trợ trên nền tảng Web.");
      return;
    }
    const cotMau = MAU_EXCEL_CHUAN[danhMucHienTai] || ['MA_DU_LIEU', 'TEN_DU_LIEU', 'GHI_CHU'];
    const dataMau = cotMau.reduce((acc, curr) => ({ ...acc, [curr]: "" }), {});

    try {
      const worksheet = XLSX.utils.json_to_sheet([dataMau], { header: cotMau });
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
      XLSX.writeFile(workbook, `FileMau_${danhMucHienTai}.xlsx`);
    } catch (error) {
      alert("Lỗi tạo file mẫu: " + error.message);
    }
  };

  const taiLaiDuLieuHienTai = async () => {
    try {
      const { data: finalData, columns: finalColumns } = await taiBoDuLieuDanhMuc({
        dataKey: danhMucHienTai,
        columnsKey: layKhoaCotDanhMuc(danhMucHienTai),
        fallbackColumns: MAU_EXCEL_CHUAN[danhMucHienTai] || [],
      });
      dirtyRef.current = false;
      dataRef.current = finalData;
      columnsRef.current = finalColumns;
      setData(finalData);
      setColumns(finalColumns);
    } catch (e) {
      alert(`❌ Lỗi tải lại dữ liệu: ${e.message || e}`);
    }
  };

  const handleDoiSoatFirebase = async () => {
    try {
      const kq = await doiSoatBoDuLieuDanhMucVoiFirebase({
        dataKey: danhMucHienTai,
        columnsKey: layKhoaCotDanhMuc(danhMucHienTai),
      });
      alert([
        `ĐỐI SOÁT FIREBASE - ${danhMucHienTai}`,
        '',
        dinhDangKhoiMeta('Dữ liệu chính', kq.data),
        '',
        dinhDangKhoiMeta('Cấu trúc cột', kq.columns),
      ].join('\n'));
    } catch (e) {
      alert(`❌ Không thể đối soát Firebase: ${e.message || e}`);
    }
  };

  const handleDoiSoatTatCaFirebase = async () => {
    try {
      const ketQua = [];
      for (const tab of DANH_SACH_TAB_DONG_BO) {
        const item = await doiSoatBoDuLieuDanhMucVoiFirebase({
          dataKey: tab.dataKey,
          columnsKey: tab.columnsKey,
        });
        ketQua.push({ ...tab, ...item });
      }

      const tongHop = tomTatDongBo(ketQua);
      const chiTiet = ketQua
        .filter((item) => item.data.differs || item.columns.differs || item.data.status?.has_unsynced_local_changes || item.columns.status?.has_unsynced_local_changes)
        .map((item) => {
          const nhan = [];
          if (item.data.differs || item.columns.differs) nhan.push('lệch Firebase');
          if (item.data.status?.has_unsynced_local_changes || item.columns.status?.has_unsynced_local_changes) nhan.push('local chưa đồng bộ');
          if (item.data.status?.can_auto_hydrate || item.columns.status?.can_auto_hydrate) nhan.push('có thể tải an toàn');
          return `- ${item.ten}: ${nhan.join(', ') || 'đang khớp'}`;
        });

      alert([
        'ĐỐI SOÁT TOÀN BỘ DANH MỤC VỚI FIREBASE',
        '',
        `Tổng tab: ${tongHop.tong}`,
        `Số tab lệch dữ liệu: ${tongHop.lech}`,
        `Số tab có thể tải an toàn: ${tongHop.coTheTai}`,
        `Số tab có thay đổi local chưa đồng bộ: ${tongHop.coLocalChuaDongBo}`,
        '',
        chiTiet.length > 0 ? chiTiet.join('\n') : 'Tất cả tab đang khớp hoặc Firebase chưa có dữ liệu.',
      ].join('\n'));
    } catch (e) {
      alert(`❌ Không thể đối soát toàn bộ danh mục: ${e.message || e}`);
    }
  };

  const handleTaiTuFirebase = async () => {
    if (Platform.OS === 'web' && !window.confirm(`Tải lại ${danhMucHienTai} từ Firebase sẽ ghi đè dữ liệu local hiện tại của tab này. Tiếp tục?`)) {
      return;
    }

    if (Platform.OS !== 'web') {
      try {
        await taoBanSaoDuLieuHeThong({
          reason: `AUTO_BEFORE_FIREBASE_PULL_${danhMucHienTai}`,
          includeKeys: ['TAB_DANG_MO'],
        });
      } catch (backupError) {
        console.warn('Không tạo được auto-backup trước khi tải từ Firebase:', backupError);
      }
    }

    try {
      isReadyToSave.current = false;
      const { data: finalData, columns: finalColumns, hydratedFromFirebase } = await taiBoDuLieuDanhMuc({
        dataKey: danhMucHienTai,
        columnsKey: layKhoaCotDanhMuc(danhMucHienTai),
        fallbackColumns: MAU_EXCEL_CHUAN[danhMucHienTai] || [],
        forceDownloadFromFirebase: true,
      });

      dirtyRef.current = false;
      dataRef.current = finalData;
      columnsRef.current = finalColumns;
      setData(finalData);
      setColumns(finalColumns);
      try { xoaCacheBoMayGiamDinh(); } catch {}

      if (hydratedFromFirebase) {
        alert(`✅ Đã tải ${finalData.length} dòng và ${finalColumns.length} cột từ Firebase cho ${danhMucHienTai}.`);
      } else {
        alert(`⚠️ Firebase chưa có dữ liệu phù hợp để tải cho ${danhMucHienTai} hoặc kết nối chưa sẵn sàng.`);
      }
    } catch (e) {
      alert(`❌ Không thể tải dữ liệu từ Firebase: ${e.message || e}`);
    } finally {
      setTimeout(() => { isReadyToSave.current = true; }, 300);
    }
  };

  const handleTaiTatCaTuFirebase = async () => {
    if (
      Platform.OS === 'web'
      && !window.confirm('Tải toàn bộ danh mục từ Firebase sẽ ghi đè dữ liệu local của các tab có dữ liệu trên Firebase. Tiếp tục?')
    ) {
      return;
    }

    if (Platform.OS !== 'web') {
      try {
        await taoBanSaoDuLieuHeThong({
          reason: 'AUTO_BEFORE_FIREBASE_PULL_ALL_CATALOGS',
          includeKeys: ['TAB_DANG_MO'],
        });
      } catch (backupError) {
        console.warn('Không tạo được auto-backup trước khi tải toàn bộ từ Firebase:', backupError);
      }
    }

    try {
      isReadyToSave.current = false;
      const ketQua = [];
      for (const tab of DANH_SACH_TAB_DONG_BO) {
        const result = await taiBoDuLieuDanhMuc({
          dataKey: tab.dataKey,
          columnsKey: tab.columnsKey,
          fallbackColumns: MAU_EXCEL_CHUAN[tab.id] || [],
          forceDownloadFromFirebase: true,
        });
        ketQua.push({
          ...tab,
          hydratedFromFirebase: !!result.hydratedFromFirebase,
          rowCount: Array.isArray(result.data) ? result.data.length : 0,
          columnCount: Array.isArray(result.columns) ? result.columns.length : 0,
        });
      }

      const { data: finalData, columns: finalColumns } = await taiBoDuLieuDanhMuc({
        dataKey: danhMucHienTai,
        columnsKey: layKhoaCotDanhMuc(danhMucHienTai),
        fallbackColumns: MAU_EXCEL_CHUAN[danhMucHienTai] || [],
      });
      dirtyRef.current = false;
      dataRef.current = finalData;
      columnsRef.current = finalColumns;
      setData(finalData);
      setColumns(finalColumns);
      try { xoaCacheBoMayGiamDinh(); } catch {}

      const daTai = ketQua.filter((item) => item.hydratedFromFirebase);
      const chuaCo = ketQua.filter((item) => !item.hydratedFromFirebase);
      alert([
        '✅ ĐÃ TẢI TOÀN BỘ DANH MỤC TỪ FIREBASE',
        '',
        `Tab tải thành công: ${daTai.length}/${ketQua.length}`,
        daTai.length > 0 ? daTai.map((item) => `- ${item.ten}: ${item.rowCount} dòng, ${item.columnCount} cột`).join('\n') : '- Không có tab nào tải được từ Firebase.',
        '',
        chuaCo.length > 0 ? `Tab chưa có dữ liệu Firebase hoặc không tải được: ${chuaCo.map((item) => item.ten).join(', ')}` : 'Tất cả tab đều đã nạp từ Firebase.',
      ].join('\n'));
    } catch (e) {
      alert(`❌ Không thể tải toàn bộ danh mục từ Firebase: ${e.message || e}`);
    } finally {
      setTimeout(() => { isReadyToSave.current = true; }, 300);
    }
  };

  const handleTaoSaoLuuThuCong = async () => {
    try {
      const kq = await taoBanSaoDuLieuHeThong({
        reason: `MANUAL_BACKUP_${danhMucHienTai}`,
        includeKeys: ['TAB_DANG_MO'],
      });
      alert(`✅ Đã tạo bản sao lưu: ${kq.snapshot_id}\nSố khóa lưu: ${kq.entry_count}`);
    } catch (e) {
      alert(`❌ Không thể sao lưu dữ liệu: ${e.message || e}`);
    }
  };

  const handlePhucHoiBanGanNhat = async () => {
    try {
      const kq = await phucHoiBanSaoGanNhat();
      if (!kq.ok) {
        alert(`⚠️ ${kq.message || 'Chưa có bản sao lưu để phục hồi.'}`);
        return;
      }
      await taiLaiDuLieuHienTai();
      alert(`✅ Đã phục hồi từ bản sao gần nhất (${kq.snapshot_id}).`);
    } catch (e) {
      alert(`❌ Không thể phục hồi bản sao lưu: ${e.message || e}`);
    }
  };

  const thucHienLuuSauImport = async (mergedCols, newData, soDongTuFile, source = 'catalog_import_excel') => {
    setColumns(mergedCols);
    setData(newData);
    dataRef.current = newData;
    columnsRef.current = mergedCols;
    dirtyRef.current = false;
    setTrangHienTai(1);
    try {
      await luuBoDuLieuDanhMuc({
        dataKey: danhMucHienTai,
        columnsKey: layKhoaCotDanhMuc(danhMucHienTai),
        data: newData,
        columns: mergedCols,
        source,
        syncRemote: true,
      });
      try {
        xoaCacheBoMayGiamDinh();
      } catch {}
      flushFirebaseDanhMucQueue().catch(() => {});
      const nguonNhap = source === 'catalog_import_xml' ? 'XML (QĐ326/TT12)' : 'file Excel/CSV';
      alert(
        `✅ Đã nhập ${soDongTuFile} dòng từ ${nguonNhap}. Hệ thống đã lưu bền vững và xếp hàng đồng bộ Firebase.`,
      );
    } catch (err) {
      alert(`❌ Lỗi lưu khi import: ${err.message}`);
    }
  };

  const handleChotImportTrung = async (mode) => {
    if (!modalImportTrung) return;
    const { mergedCols, importedRaw } = modalImportTrung;
    const cotKhoa = layCotKhoaChoTab(
      danhMucHienTai,
      MAU_EXCEL_CHUAN[danhMucHienTai],
      mergedCols,
    );
    setModalImportTrung(null);
    try {
      const newData = gopImportVoiBangHienCo(
        dataRef.current,
        importedRaw,
        mergedCols,
        cotKhoa,
        mode,
      );
      await thucHienLuuSauImport(mergedCols, newData, importedRaw.length);
    } catch (err) {
      alert(`❌ Lỗi khi áp dụng import: ${err.message || err}`);
    }
  };

  const handleKiemTraTrungTrongBang = () => {
    const tatCaCot =
      columnsRef.current.length > 0
        ? columnsRef.current
        : MAU_EXCEL_CHUAN[danhMucHienTai] || [];
    const cotKhoa = layCotKhoaChoTab(
      danhMucHienTai,
      MAU_EXCEL_CHUAN[danhMucHienTai],
      columnsRef.current,
    );
    if (!cotKhoa.length) {
      alert('Chưa xác định được khóa so trùng. Hãy có ít nhất một cột trong bảng hoặc nạp file mẫu.');
      return;
    }
    const nhom = timNhomTrungTrongBang(dataRef.current, cotKhoa);
    const tenKhoa = cotKhoa.join(' + ');
    if (nhom.length === 0) {
      const msg = `Không phát hiện trùng khóa (${tenKhoa}) trong bảng hiện tại.`;
      if (Platform.OS === 'web') alert(`✅ ${msg}`);
      else Alert.alert('Kiểm tra trùng', msg);
      return;
    }
    const soDongThua = nhom.reduce((a, g) => a + g.indices.length - 1, 0);
    const mau = nhom
      .slice(0, 6)
      .map((g) => `${g.k} → dòng ${g.indices.map((i) => i + 1).join(', ')}`)
      .join('\n');
    const msg = `${nhom.length} khóa trùng; ${soDongThua} dòng có thể gỡ (giữ đại diện).\nKhóa: ${tenKhoa}\n\n${mau}${nhom.length > 6 ? '\n…' : ''}`;

    const hamHopNhat = () => {
      const newData = gopTrungTrongBangGiuDongDau(dataRef.current, tatCaCot, cotKhoa);
      danhDauDaSua();
      dataRef.current = newData;
      setData(newData);
      setTrangHienTai(1);
      luuNgayDanhMuc({ source: 'catalog_dedupe_merge' }).catch(() => {});
      const done = `Đã hợp nhất: còn ${newData.length} dòng.`;
      if (Platform.OS === 'web') alert(`✅ ${done}`);
      else Alert.alert('Hoàn tất', done);
    };

    if (Platform.OS === 'web') {
      if (
        window.confirm(
          `${msg}\n\nHợp nhất: giữ dòng đầu tiên theo mỗi khóa và xóa các dòng sau?`,
        )
      ) {
        hamHopNhat();
      }
    } else {
      Alert.alert('Phát hiện trùng khóa', msg, [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Hợp nhất (giữ đầu)', onPress: hamHopNhat },
      ]);
    }
  };

  // 4. XỬ LÝ IMPORT EXCEL (chunking + phát hiện trùng khóa)
  const chuanHoaImportMaTheQuyenLoi = (wb) => {
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '', raw: false });
    if (!Array.isArray(rows) || rows.length < 3) return [];
    const body = rows.slice(2);
    const chuanNgay = (v) => {
      const s = String(v || '').trim();
      if (!s) return '';
      const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
      if (m) return `${m[3]}${m[2].padStart(2, '0')}${m[1].padStart(2, '0')}`;
      return s.replace(/\D/g, '').slice(0, 8);
    };
    const chuanCoKhong = (v) => {
      const s = String(v || '').trim().toUpperCase();
      if (['CÓ', 'CO', 'YES', 'Y', 'TRUE', '1'].includes(s)) return 'CO';
      if (['KHÔNG', 'KHONG', 'NO', 'N', 'FALSE', '0'].includes(s)) return 'KHONG';
      return s;
    };
    return body
      .map((r, idx) => {
        const ma = String(r?.[1] || '').trim().toUpperCase();
        if (!ma || ma === 'MÃ') return null;
        return {
          STT: Number(r?.[0]) || idx + 1,
          MA: ma,
          MA_NHOM_THE: ma.slice(0, 2),
          MA_QUYEN_LOI: String(r?.[4] || ma.slice(2, 3) || '').trim(),
          TEN: String(r?.[2] || '').trim(),
          NHOM_DOI_TUONG_BHYT: String(r?.[3] || '').trim(),
          TY_LE_HUONG_BHYT: String(r?.[5] || '').trim(),
          MIEU_TA: String(r?.[6] || '').trim(),
          TU_NGAY: chuanNgay(r?.[7]),
          DEN_NGAY: chuanNgay(r?.[8]),
          DOI_TUONG_HUONG_CHI_PHI_CHUYEN_TUYEN: chuanCoKhong(r?.[9]),
          HIEU_LUC_THI_HANH: chuanCoKhong(r?.[10]),
        };
      })
      .filter(Boolean);
  };

  const chuanHoaImportThuocDieuKienThanhToan = (wb) => {
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(ws, { defval: '', raw: false });
    const chuanMaLuat = (v) => String(v || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/Đ/g, 'D')
      .replace(/đ/g, 'd')
      .toUpperCase()
      .replace(/[^A-Z0-9_]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_+|_+$/g, '');
    return (Array.isArray(rows) ? rows : []).map((r) => ({
      MA_GIAM_DINH: chuanMaLuat(r['Mã kiểm tra'] || r['Ma giam dinh'] || ''),
      TEN_QUY_TAC: String(r['Tên quy tắc'] || r['Ten quy tac'] || '').trim(),
      MA_THUOC_QD7603: String(r['Mã thuốc (QĐ 7603)'] || r['Ma thuoc (QD 7603)'] || r['Mã thuốc'] || '').trim(),
      HOAT_CHAT: String(r['Hoạt chất'] || r['Hoat chat'] || '').trim(),
      DUONG_DUNG: String(r['Đường dùng'] || r['Duong dung'] || '').trim(),
      MA_ICD10: String(r['Mã ICD-10'] || r['Ma ICD-10'] || '').trim(),
      CHAN_DOAN: String(r['Chẩn đoán'] || r['Chan doan'] || '').trim(),
      TU_KHOA_YEU_CAU: String(r['Từ khóa/Yêu cầu'] || r['Tu khoa/Yeu cau'] || '').trim(),
      CANH_BAO_CDSS_ALERT: String(r['Cảnh báo (CDSS Alert)'] || r['Canh bao (CDSS Alert)'] || '').trim(),
    })).filter((x) => x.MA_THUOC_QD7603);
  };

  const handleImportExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const importedDataRaw = danhMucHienTai === 'DANH_MUC_MA_THE_QUYEN_LOI'
          ? chuanHoaImportMaTheQuyenLoi(wb)
          : danhMucHienTai === 'DANH_MUC_THUOC_DIEU_KIEN_TT'
            ? chuanHoaImportThuocDieuKienThanhToan(wb)
            : XLSX.utils.sheet_to_json(ws, { defval: '', raw: false });
        const importedData = importedDataRaw.map((row) => {
          if (!row || typeof row !== 'object') return row;
          const next = { ...row };
          Object.keys(next).forEach((k) => {
            const ku = String(k).trim().toUpperCase().replace(/\s+/g, '_');
            if (ku === 'SO_CCCD' || ku === 'SO_DINH_DANH' || ku === 'CCCD') {
              const raw = next[k];
              const ch = String(raw ?? '').trim().replace(/\s+/g, '');
              next[k] = ch;
            }
          });
          return next;
        });
        const mergedCols = [...new Set([...columnsRef.current, ...Object.keys(importedData[0] || {})])];
        await xuLySauKhiNhapBang(importedData, mergedCols);
      } catch (err) {
        alert(`❌ Lỗi import: ${err.message || err}`);
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = null;
  };

  const duLieuTrang = hangLocChiSo.slice(chiSoBatDau, chiSoKetThuc);
  const soDongDangChon = dauChonDong.size;
  const soChonTrenTrangHien = duLieuTrang.filter(({ indexGoc }) => dauChonDong.has(indexGoc)).length;
  const trangHienDangChonDayDu = duLieuTrang.length > 0 && soChonTrenTrangHien === duLieuTrang.length;

  const handleToggleChonCaTrangHien = () => {
    const trenTrang = duLieuTrang.map(({ indexGoc }) => indexGoc);
    if (trenTrang.length === 0) return;
    setDauChonDong((prev) => {
      const s = new Set(prev);
      const tatCaDaChon = trenTrang.every((i) => s.has(i));
      if (tatCaDaChon) trenTrang.forEach((i) => s.delete(i));
      else trenTrang.forEach((i) => s.add(i));
      return s;
    });
  };

  const danhSachNutCongCu = [
    { key: 'tai-mau', icon: '⬇', label: 'Mẫu', onPress: handleTaiFileMau, style: 'xanhLa' },
    ...(Platform.OS === 'web'
      ? [{ key: 'import-excel', icon: '📤', label: 'Import', onPress: () => document.getElementById('import-excel-danhmuc')?.click(), style: 'cam' }]
      : []),
    { key: 'kiem-tra-trung', icon: '🔎', label: 'Trùng', onPress: handleKiemTraTrungTrongBang, style: 'xanhLa' },
    { key: 'export-excel', icon: '📥', label: 'Export', onPress: handleExportXLSX, style: 'xanhDuong' },
    { key: 'in-pdf', icon: '🖨', label: 'PDF', onPress: () => void handleInPdfBang(), style: 'xanhDuong' },
    ...(Platform.OS === 'web'
      ? [
          { key: 'nhap-xml', icon: '📤', label: 'XML', onPress: () => document.getElementById('import-xml-danhmuc-qd326')?.click(), style: 'xanhDuong' },
          { key: 'xuat-xml', icon: '📥', label: 'Xuất XML', onPress: handleExportXmlQd326, style: 'xanhDuong' },
          { key: 'mau-xml', icon: '🧩', label: 'Mẫu XML', onPress: handleTaiFileMauXml, style: 'xanhLa' },
        ]
      : []),
    { key: 'doi-soat', icon: '☁', label: 'Đối soát', onPress: handleDoiSoatFirebase, style: 'xanhDuong' },
    { key: 'doi-soat-all', icon: '☁', label: 'Đối soát tất cả', onPress: handleDoiSoatTatCaFirebase, style: 'xanhDuong' },
    { key: 'tai-tu-firebase', icon: '☁', label: 'Tải FB', onPress: handleTaiTuFirebase, style: 'cam' },
    { key: 'tai-tat-ca-firebase', icon: '☁', label: 'Tải tất cả', onPress: handleTaiTatCaTuFirebase, style: 'cam' },
    { key: 'sao-luu', icon: '💾', label: 'Sao lưu', onPress: handleTaoSaoLuuThuCong, style: 'xanhDuong' },
    { key: 'phuc-hoi', icon: '↩', label: 'Phục hồi', onPress: handlePhucHoiBanGanNhat, style: 'phucHoi' },
    { key: 'them-dong', icon: '＋', label: 'Dòng', onPress: handleAddRow, style: 'xanh' },
    { key: 'bo-chon', icon: '◻', label: `Bỏ (${soDongDangChon})`, onPress: handleBoChonTatCa, style: 'xoaNhat', disabled: soDongDangChon === 0 },
    { key: 'xoa-da-chon', icon: '🗑', label: `Xóa (${soDongDangChon})`, onPress: () => { void handleXoaDaChon(); }, style: 'xoaDo', disabled: soDongDangChon === 0 },
    { key: 'da-tu-luu', icon: '✅', label: 'Đã lưu', onPress: () => alert(`Đang hiển thị ${data.length} dòng. Hệ thống tự động ghi nhớ mọi thay đổi!`), style: 'xanhDuong' },
  ];

  return (
    <SafeAreaView style={styles.vung_an_toan}>
      <View style={styles.thanh_tieu_de}>
        <TouchableOpacity onPress={() => quayLaiAnToan(navigation, 'TongQuan')} style={styles.nut_quay_lai}>
          <Text style={styles.chu_nut_header}>⬅ TRỞ VỀ TỔNG QUAN</Text>
        </TouchableOpacity>
        <Text style={styles.chu_tieu_de}>🗄️ QUẢN LÝ DANH MỤC (MASTER DATA)</Text>
        <TouchableOpacity onPress={() => dieuHuongMoTabMoi(navigation, 'MappingNghiepVu')} style={styles.nut_hub_mapping}>
          <Text style={styles.chu_nut_header}>🔗 MAPPING</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.khung_chinh_dm, dungBoCucDoc && styles.khung_chinh_dm_doc]}>
        <View style={[styles.sidebar, dungBoCucDoc ? styles.sidebar_doc : { width: rongSidebar }]}>
          <Text style={styles.chu_sidebar_tieu_de}>Chọn danh mục</Text>
          <ScrollView
            style={styles.sidebar_scroll}
            contentContainerStyle={styles.sidebar_scroll_content}
            showsVerticalScrollIndicator
            keyboardShouldPersistTaps="handled"
          >
            {DANH_SACH_TAB.map((tab) => {
              const laDacBiet = IDS_TAB_ICD_DAC_BIET.includes(tab.id);
              const dangChon = danhMucHienTai === tab.id;
              return (
                <TouchableOpacity
                  key={tab.id}
                  onPress={() => chuyenTab(tab.id)}
                  style={[
                    styles.muc_sidebar,
                    dangChon && styles.muc_sidebar_active,
                    laDacBiet && !dangChon && styles.muc_sidebar_dac_biet,
                    laDacBiet && dangChon && styles.muc_sidebar_active_dac_biet,
                  ]}
                  activeOpacity={0.85}
                >
                  <Text
                    style={[
                      styles.chu_muc_sidebar,
                      dangChon && styles.chu_muc_sidebar_active,
                      laDacBiet && !dangChon && styles.chu_muc_sidebar_dac_biet,
                    ]}
                    numberOfLines={4}
                  >
                    {tab.ten}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.khoi_noi_dung_phai}>
        <View style={styles.thanh_cong_cu_mot_hang}>
          {Platform.OS === 'web' && (
            <React.Fragment>
              <input type="file" accept=".xlsx, .xls, .csv" onChange={handleImportExcel} style={{ display: 'none' }} id="import-excel-danhmuc" />
              <input
                type="file"
                accept=".xml,application/xml,text/xml"
                onChange={handleImportXmlQd326}
                style={{ display: 'none' }}
                id="import-xml-danhmuc-qd326"
              />
            </React.Fragment>
          )}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hang_cu_cong_cu}>
            <TextInput
              style={styles.o_nhap_cot_mini}
              placeholder="Tên cột..."
              value={newColumnName}
              onChangeText={setNewColumnName}
              outlineStyle="none"
            />
            <TouchableOpacity style={[styles.nut_mini, styles.nut_mini_xanh]} onPress={handleAddColumn}>
              <Text style={styles.chu_nut_mini}>＋ Cột</Text>
            </TouchableOpacity>
            {danhSachNutCongCu.map((nut) => (
              <TouchableOpacity
                key={nut.key}
                style={[
                  styles.nut_mini,
                  nut.style === 'xanhLa' && styles.nut_mini_xanh_la,
                  nut.style === 'cam' && styles.nut_mini_cam,
                  nut.style === 'xanhDuong' && styles.nut_mini_xanh_duong,
                  nut.style === 'xanh' && styles.nut_mini_xanh,
                  nut.style === 'phucHoi' && styles.nut_mini_phuc_hoi,
                  nut.style === 'xoaDo' && styles.nut_mini_xoa_do,
                  nut.style === 'xoaNhat' && styles.nut_mini_xoa_nhat,
                  nut.disabled && styles.nut_mini_tat,
                ]}
                onPress={nut.onPress}
                disabled={!!nut.disabled}
                activeOpacity={0.85}
              >
                <Text style={[styles.chu_nut_mini, nut.style === 'xoaDo' && styles.chu_nut_mini_trang]}>
                  {nut.icon} {nut.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* BẢNG DỮ LIỆU ĐỘNG FULLSCREEN */}
        <View style={styles.khung_bang_master}>
          <TimKiemPhanTrangBang
            tuKhoa={tuKhoaTim}
            onTuKhoa={setTuKhoaTim}
            tongDongGoc={data.length}
            tongDongSauLoc={nSauLoc}
            soDongMotTrang={soDongMotTrang}
            onSoDongMotTrang={setSoDongMotTrang}
            trangHienTai={trangDangXem}
            onTrangHienTai={setTrangHienTai}
            tongSoTrang={tongSoTrang}
            chiSoBatDau={chiSoBatDau}
            chiSoKetThuc={chiSoKetThuc}
          />
          {danhMucHienTai === 'DANH_MUC_TUONG_TAC_THUOC' &&
          soDongMotTrang > 0 &&
          data.length > soDongMotTrang ? (
            <Text style={styles.chu_goi_y_tuong_tac}>
              Danh mục có {data.length} dòng — chọn &quot;Tất cả&quot; ở trên để xem và sửa toàn bộ cặp tương tác đã nhập.
            </Text>
          ) : null}
          <ScrollView horizontal style={styles.scroll_ngang}>
            <View style={styles.bang_chinh}>
              <View style={styles.dong_tieu_de}>
                <View style={[styles.o_tieu_de, { width: 64 }]}>
                  <TouchableOpacity
                    onPress={handleToggleChonCaTrangHien}
                    style={styles.o_chon_dong_header}
                    disabled={duLieuTrang.length === 0}
                  >
                    <View style={[styles.hop_chon, trangHienDangChonDayDu && styles.hop_chon_dang_chon]}>
                      {trangHienDangChonDayDu ? <Text style={styles.hop_chon_dau}>✓</Text> : soChonTrenTrangHien > 0 ? <Text style={styles.hop_chon_dau}>−</Text> : null}
                    </View>
                    <Text style={styles.chu_o_tieu_de_nho}>Chọn</Text>
                  </TouchableOpacity>
                </View>
                <View style={[styles.o_tieu_de, { width: 90 }]}><Text style={styles.chu_o_tieu_de}>STT</Text></View>
                {columns.map((col, index) => {
                  const rongCot = layDoRongCot(col);
                  return (
                    <View key={index} style={[styles.o_tieu_de, { width: rongCot }]}>
                      <Text style={styles.chu_o_tieu_de}>{col}</Text>
                    </View>
                  );
                })}
                <View style={[styles.o_tieu_de, { width: 160 }]}><Text style={styles.chu_o_tieu_de}>THAO TÁC</Text></View>
              </View>

              <ScrollView showsVerticalScrollIndicator={true} style={styles.scroll_doc}>
                {duLieuTrang.map(({ row, indexGoc }, rowIndex) => {
                  const globalIndex = indexGoc;
                  const sttHienThi = chiSoBatDau + rowIndex + 1;
                  const dangChonDongNay = dauChonDong.has(indexGoc);
                  return (
                  <View key={`${indexGoc}-${rowIndex}`} style={[styles.dong_du_lieu, { backgroundColor: rowIndex % 2 === 0 ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.01)' }]}>
                    <View style={[styles.o_du_lieu_stt, { width: 64 }]}>
                      <TouchableOpacity
                        onPress={() => handleToggleChonDong(indexGoc)}
                        style={styles.hop_chon_tap}
                        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                      >
                        <View style={[styles.hop_chon, dangChonDongNay && styles.hop_chon_dang_chon]}>
                          {dangChonDongNay ? <Text style={styles.hop_chon_dau}>✓</Text> : null}
                        </View>
                      </TouchableOpacity>
                    </View>
                    <View style={[styles.o_du_lieu_stt, { width: 90 }]}>
                      <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#F48FB1' }}>{sttHienThi}</Text>
                    </View>
                    {columns.map((col, colIndex) => {
                      const rongCot = layDoRongCot(col);
                      return (
                        <TextInput
                          key={colIndex}
                          style={[styles.o_du_lieu, { width: rongCot }]}
                          value={String(row[col] || '')}
                          onChangeText={(text) => handleCellChange(text, globalIndex, col)}
                          multiline
                          textAlignVertical="top"
                          outlineStyle="none"
                        />
                      );
                    })}
                    <View style={[styles.o_thao_tac, { width: 160 }]}>
                      <TouchableOpacity onPress={() => handleDeleteRow(globalIndex)} style={styles.nut_xoa}>
                        <Text style={styles.chu_nut_xoa}>Xóa</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )})}
                {data.length === 0 && (
                  <Text style={styles.txt_trong}>
                    Danh mục đang trống. Bác sĩ có thể bấm nút TẢI FILE MẪU rồi IMPORT EXCEL để nạp dữ liệu.
                  </Text>
                )}
                <View style={{ height: 100 }} />
              </ScrollView>
            </View>
          </ScrollView>
        </View>

        </View>
      </View>

      <Modal
        visible={!!modalImportTrung}
        transparent
        animationType="fade"
        onRequestClose={() => setModalImportTrung(null)}
      >
        <View style={styles.modal_nen}>
          <View style={styles.modal_hop}>
            <Text style={styles.modal_tieu_de}>Trùng khóa khi import Excel</Text>
            {modalImportTrung ? (
              <>
                <Text style={styles.modal_text}>Khóa so khớp: {modalImportTrung.cotKhoa.join(' + ')}</Text>
                <Text style={styles.modal_text}>
                  Dòng trong file: {modalImportTrung.importedRaw.length}; sau gộp trùng trong file:{' '}
                  {modalImportTrung.thongKe.tongSauDedupe}; trùng với dữ liệu đang có:{' '}
                  {modalImportTrung.thongKe.soTrung}; dòng mới (khóa lạ): {modalImportTrung.thongKe.soMoi}
                  {modalImportTrung.thongKe.soKhongKhoa > 0
                    ? `; dòng thiếu khóa (không so trùng): ${modalImportTrung.thongKe.soKhongKhoa}`
                    : ''}
                </Text>
                <Text style={styles.modal_text_nho}>
                  Ghi đè: cập nhật dòng cũ theo nội dung file. Bỏ qua trùng: giữ dòng cũ, chỉ thêm dòng có khóa mới.
                </Text>
                <View style={styles.modal_hang_nut}>
                  <TouchableOpacity style={styles.nut_phuc_hoi} onPress={() => setModalImportTrung(null)}>
                    <Text style={styles.chu_nut}>Hủy</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.nut_xanh_duong} onPress={() => handleChotImportTrung('skip')}>
                    <Text style={styles.chu_nut}>Bỏ qua trùng</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.nut_cam} onPress={() => handleChotImportTrung('overwrite')}>
                    <Text style={styles.chu_nut}>Ghi đè</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : null}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

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
  nut_hub_mapping: {
    padding: 12,
    backgroundColor: 'rgba(200, 230, 201, 0.35)',
    borderWidth: 1,
    borderColor: '#558B2F',
    borderRadius: 14,
    minWidth: 140,
    alignItems: 'center',
  },
  chu_nut_header: { color: CD.text.primary, fontWeight: 'bold', fontSize: 20, fontFamily: CD.font.family },
  chu_tieu_de: { fontSize: 26, color: CD.text.primary, fontWeight: 'bold', fontFamily: CD.font.family },

  khung_chinh_dm: {
    flex: 1,
    flexDirection: 'row',
    minHeight: 0,
    minWidth: 0,
  },
  khung_chinh_dm_doc: {
    flexDirection: 'column',
  },
  sidebar: {
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
  sidebar_doc: {
    width: '100%',
    maxHeight: 260,
    borderRightWidth: 0,
    borderBottomWidth: 1,
    borderBottomColor: CD.border.glass_md,
  },
  chu_sidebar_tieu_de: {
    fontSize: 14,
    fontWeight: '800',
    color: CD.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    paddingHorizontal: 8,
    paddingBottom: 10,
    fontFamily: CD.font.family,
  },
  sidebar_scroll: { flex: 1 },
  sidebar_scroll_content: { paddingBottom: 20 },
  muc_sidebar: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: CD.border.glass,
    backgroundColor: CD.bg.glass_card,
    marginBottom: 6,
  },
  muc_sidebar_active: {
    backgroundColor: '#D81B60',
    borderColor: '#AD1457',
    ...Platform.select({ web: { boxShadow: '0 2px 12px rgba(216,27,96,0.45)' } }),
  },
  muc_sidebar_dac_biet: {
    borderWidth: 2,
    borderColor: 'rgba(100,181,246,0.55)',
    backgroundColor: 'rgba(25,118,210,0.18)',
  },
  muc_sidebar_active_dac_biet: {
    borderColor: '#F48FB1',
    backgroundColor: '#C2185B',
  },
  chu_muc_sidebar: {
    fontSize: 16,
    lineHeight: 22,
    color: CD.text.secondary,
    fontWeight: '700',
    fontFamily: CD.font.family,
  },
  chu_muc_sidebar_active: {
    color: '#FFFFFF',
  },
  chu_muc_sidebar_dac_biet: {
    color: CD.text.link,
  },
  khoi_noi_dung_phai: {
    flex: 1,
    minWidth: 0,
    minHeight: 0,
    flexDirection: 'column',
    padding: 16,
    paddingTop: 20,
    ...Platform.select({
      web: { paddingLeft: 20, paddingRight: 24 },
    }),
  },

  thanh_cong_cu_mot_hang: {
    marginBottom: 12,
    width: '100%',
    minWidth: 0,
  },
  hang_cu_cong_cu: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingBottom: 2,
    paddingRight: 8,
  },
  o_nhap_cot_mini: {
    width: 180,
    height: 40,
    backgroundColor: CD.bg.glass_input,
    borderWidth: 1,
    borderColor: CD.border.input,
    borderRadius: 10,
    color: CD.text.primary,
    fontSize: 13,
    paddingHorizontal: 10,
    fontFamily: CD.font.family,
    ...Platform.select({ web: { outlineStyle: 'none' } }),
  },
  nut_mini: {
    height: 40,
    borderRadius: 10,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: CD.border.glass_md,
    backgroundColor: CD.bg.glass_input,
    ...Platform.select({ web: { cursor: 'pointer' } }),
  },
  nut_mini_xanh: {
    backgroundColor: CD.brand.mauChinh,
    borderColor: CD.brand.mauDam,
  },
  nut_mini_xanh_la: {
    backgroundColor: '#388E3C',
    borderColor: '#2E7D32',
  },
  nut_mini_cam: {
    backgroundColor: '#2E7D32',
    borderColor: '#1B5E20',
  },
  nut_mini_xanh_duong: {
    backgroundColor: CD.bg.glass_input,
    borderColor: CD.border.glass_md,
  },
  nut_mini_phuc_hoi: {
    backgroundColor: '#F9A825',
    borderColor: '#F57F17',
  },
  nut_mini_xoa_do: {
    backgroundColor: '#C62828',
    borderColor: '#B71C1C',
  },
  nut_mini_xoa_nhat: {
    backgroundColor: CD.bg.glass_input,
    borderColor: CD.border.glass_md,
  },
  nut_mini_tat: { opacity: 0.45 },
  chu_nut_mini: {
    color: CD.text.primary,
    fontWeight: '700',
    fontSize: 12,
    fontFamily: CD.font.family,
  },
  chu_nut_mini_trang: { color: '#fff' },
  khoi_them_cot: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
    minWidth: 0,
  },
  o_nhap_cot: {
    backgroundColor: CD.bg.glass_input,
    borderWidth: 1,
    borderColor: CD.border.input,
    borderRadius: 12,
    color: CD.text.primary,
    fontSize: 22,
    paddingVertical: 14,
    paddingHorizontal: 16,
    width: 280,
    marginRight: 15,
    fontFamily: CD.font.family,
    ...Platform.select({ web: { backdropFilter: CD.web.blur_input, outlineStyle: 'none' } }),
  },
  khoi_hanh_dong: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    alignContent: 'flex-start',
    gap: 10,
    width: '100%',
    minWidth: 0,
  },

  // "+ THÊM CỘT" → primary button
  nut_xanh: {
    backgroundColor: CD.brand.mauChinh,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({ web: { backgroundImage: CD.web.gradient_primary, boxShadow: CD.web.shadow_btn, cursor: CD.web.cursor_pointer } }),
  },
  // TẢI FILE MẪU → green button
  nut_xanh_la: {
    backgroundColor: '#388E3C',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    justifyContent: 'center',
    ...Platform.select({ web: { backgroundImage: CD.web.gradient_green, boxShadow: CD.web.shadow_btn_green, cursor: CD.web.cursor_pointer } }),
  },
  // EXPORT BẢNG → secondary glass
  nut_xanh_duong: {
    backgroundColor: CD.bg.glass_input,
    borderWidth: 1,
    borderColor: CD.border.glass_md,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    justifyContent: 'center',
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
  // + THÊM DÒNG → primary button
  nut_hong: {
    backgroundColor: CD.brand.mauChinh,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({ web: { backgroundImage: CD.web.gradient_primary, boxShadow: CD.web.shadow_btn, cursor: CD.web.cursor_pointer } }),
  },
  // ĐÃ TỰ LƯU → secondary glass
  nut_do: {
    backgroundColor: CD.bg.glass_input,
    borderWidth: 1,
    borderColor: CD.border.glass_md,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  chu_nut: { color: CD.text.primary, fontWeight: 'bold', fontSize: 18, fontFamily: CD.font.family },
  nut_xoa_hang_loat: {
    backgroundColor: CD.bg.glass_input,
    borderWidth: 1,
    borderColor: CD.border.glass_md,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 18,
    justifyContent: 'center',
    ...Platform.select({ web: { cursor: 'pointer' } }),
  },
  nut_xoa_hang_loat_do: {
    backgroundColor: '#C62828',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 18,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#B71C1C',
    ...Platform.select({ web: { boxShadow: '0 2px 8px rgba(198,40,40,0.35)', cursor: 'pointer' } }),
  },
  nut_xoa_hang_loat_tat: { opacity: 0.45 },
  chu_nut_xoa_loat: { color: CD.text.primary, fontWeight: '700', fontSize: 16, fontFamily: CD.font.family },
  chu_nut_xoa_loat_bold: { color: '#FFFFFF', fontWeight: '800', fontSize: 16, fontFamily: CD.font.family },

  // KHU VỰC BẢNG FULLSCREEN FLEX 1
  khung_bang_master: {
    flex: 1,
    backgroundColor: CD.bg.glass_card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: CD.border.glass,
    overflow: 'hidden',
    ...Platform.select({ web: { backdropFilter: CD.web.blur_card, WebkitBackdropFilter: CD.web.blur_card, boxShadow: CD.web.shadow_card } }),
  },
  khung_phan_trang: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 12,
    gap: 12,
  },
  chu_phan_trang: {
    color: CD.text.secondary,
    fontSize: 16,
    fontWeight: '700',
    fontFamily: CD.font.family,
  },
  chu_goi_y_tuong_tac: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    color: CD.brand.mauDam,
    fontFamily: CD.font.family,
    lineHeight: 20,
  },
  nhom_phan_trang: {
    flexDirection: 'row',
    gap: 8,
  },
  nut_phan_trang: {
    backgroundColor: CD.brand.mauPhu,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: CD.border.glass_md,
  },
  nut_phan_trang_tat: {
    opacity: 0.45,
  },
  chu_nut_phan_trang: {
    color: CD.text.primary,
    fontSize: 14,
    fontWeight: '800',
    fontFamily: CD.font.family,
  },
  hang_chon_so_dong: {
    marginTop: 8,
    maxHeight: 44,
    flexGrow: 0,
  },
  nhan_chon_so_dong: {
    color: CD.text.secondary,
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
    alignSelf: 'center',
    fontFamily: CD.font.family,
  },
  nut_chon_so_dong: {
    marginRight: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: CD.border.glass_md,
    backgroundColor: CD.bg.glass_input,
    alignSelf: 'center',
    ...Platform.select({ web: { cursor: CD.web.cursor_pointer } }),
  },
  nut_chon_so_dong_active: {
    backgroundColor: CD.brand.mauPhu,
    borderColor: CD.brand.mauChinh,
  },
  chu_chon_so_dong: {
    color: CD.text.secondary,
    fontSize: 13,
    fontWeight: '700',
    fontFamily: CD.font.family,
  },
  chu_chon_so_dong_active: {
    color: CD.text.primary,
  },
  scroll_ngang: { flex: 1 },
  bang_chinh: { flex: 1, minWidth: '100%' },

  dong_tieu_de: { flexDirection: 'row', backgroundColor: '#BBDEFB', borderBottomWidth: 2, borderColor: '#1976D2' },
  o_tieu_de: { padding: 18, borderRightWidth: 1, borderColor: CD.border.divider, justifyContent: 'center' },
  chu_o_tieu_de: { fontWeight: '700', fontSize: 19, color: '#000000', fontFamily: CD.font.family, textAlign: 'center', lineHeight: 24 },
  chu_o_tieu_de_nho: { fontWeight: '700', fontSize: 13, color: '#000000', fontFamily: CD.font.family, textAlign: 'center', marginTop: 4 },

  o_chon_dong_header: { alignItems: 'center', justifyContent: 'center', ...Platform.select({ web: { cursor: CD.web.cursor_pointer } }) },
  hop_chon_tap: { alignItems: 'center', justifyContent: 'center' },
  hop_chon: {
    width: 28,
    height: 28,
    borderWidth: 2,
    borderColor: CD.border.glass_md,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: CD.bg.glass_input,
  },
  hop_chon_dang_chon: {
    backgroundColor: CD.brand.mauChinh,
    borderColor: CD.brand.mauChinh2,
  },
  hop_chon_dau: { color: '#FFFFFF', fontWeight: '900', fontSize: 16, lineHeight: 18, fontFamily: CD.font.family },

  scroll_doc: { flex: 1 },
  dong_du_lieu: { flexDirection: 'row', borderBottomWidth: 1, borderColor: CD.border.divider, minHeight: 65 },
  o_du_lieu_stt: {
    padding: 18,
    borderRightWidth: 1,
    borderColor: CD.border.divider,
    backgroundColor: CD.bg.table_header,
    alignItems: 'center',
    justifyContent: 'center',
  },
  o_du_lieu: {
    padding: 18,
    borderRightWidth: 1,
    borderColor: CD.border.divider,
    minHeight: 78,
    fontSize: 18,
    color: CD.text.table_cell,
    fontFamily: CD.font.family,
    lineHeight: 26,
    backgroundColor: CD.bg.glass_input,
  },
  // PHUC HOI BAN SAO → amber button
  nut_phuc_hoi: {
    backgroundColor: '#F9A825',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    justifyContent: 'center',
    ...Platform.select({ web: { boxShadow: CD.web.shadow_btn, cursor: CD.web.cursor_pointer } }),
  },
  o_thao_tac: { padding: 10, justifyContent: 'center', alignItems: 'center', borderRightWidth: 1, borderColor: CD.border.divider },
  nut_xoa: {
    backgroundColor: CD.bg.glass_input,
    borderWidth: 1,
    borderColor: CD.border.glass_md,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 25,
  },
  chu_nut_xoa: { color: CD.text.primary, fontWeight: 'bold', fontSize: 18, fontFamily: CD.font.family },
  txt_trong: { padding: 40, fontSize: 22, fontStyle: 'italic', color: CD.text.muted, textAlign: 'center', fontFamily: CD.font.family },

  modal_nen: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modal_hop: {
    maxWidth: 560,
    width: '100%',
    borderRadius: 16,
    padding: 20,
    backgroundColor: CD.bg.glass_card,
    borderWidth: 1,
    borderColor: CD.border.glass_md,
    ...Platform.select({ web: { boxShadow: '0 8px 32px rgba(0,0,0,0.35)' } }),
  },
  modal_tieu_de: {
    fontSize: 22,
    fontWeight: '800',
    color: CD.text.primary,
    marginBottom: 12,
    fontFamily: CD.font.family,
  },
  modal_text: {
    fontSize: 17,
    color: CD.text.secondary,
    marginBottom: 10,
    lineHeight: 26,
    fontFamily: CD.font.family,
  },
  modal_text_nho: {
    fontSize: 15,
    color: CD.text.muted,
    marginBottom: 18,
    lineHeight: 22,
    fontFamily: CD.font.family,
  },
  modal_hang_nut: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'flex-end',
  },
});

export default ManHinhQuanLyDanhMuc;
