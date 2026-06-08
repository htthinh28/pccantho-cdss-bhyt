/**
 * ============================================================
 * MODULE: HỆ THỐNG DANH MỤC DÙNG CHUNG BỘ Y TẾ (QĐ 7603)
 * Tái cấu trúc: Advanced Dynamic Catalog Engine (Bản 9.5 - Full Resizable)
 * 1. Resizable Toàn diện: Kéo giãn cột (kể cả STT, Xóa, Trạng thái) và kéo giãn dòng.
 * 2. Tích hợp Component Bảng Động: Quản lý tập trung 13 Phụ lục (kể cả PL13).
 * 3. Chức năng Xóa hàng loạt: Bổ sung Checkbox "Chọn tất cả" trên Header.
 * 4. Chức năng: Import Excel, Tải mẫu, Export, Chunking Storage, Auto-save.
 * ============================================================
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Image, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import * as XLSX from 'xlsx';
import { BREAKPOINTS } from '../tien_ich/diem_anh_man_hinh';
import { xoaCacheBoMayGiamDinh } from '../tien_ich/dong_co_giam_dinh';
import { quayLaiAnToan } from '../tien_ich/dieu_huong_an_toan';
import {
    flushFirebaseDanhMucQueue,
    luuBoDuLieuDanhMuc,
    taiBoDuLieuDanhMuc,
} from '../tien_ich/luu_tru_danh_muc';

const LOGO_PC = 'https://i.ibb.co/nNr9SQYr/logo-pc.png';

// ============================================================
// HỆ THỐNG LƯU TRỮ BIG DATA CHỐNG TRÀN BỘ NHỚ WEB (CHUNKING)
// ============================================================
const ACTIVE_TAB_STORAGE_KEY = 'BYT_7603_ACTIVE_TAB';
const SO_DONG_MOI_TRANG_BYT = 160;

const MODULES_CONFIG = [
  { id: 'PL1_DVKT', title: 'PL1: DVKT Tương Đương', desc: 'Mã giá, TT23, TT39', cols: ['MÃ CỘNG GỘP', 'MÃ BỘ Y TẾ', 'TÊN DỊCH VỤ', 'MÃ BẢO HIỂM', 'TÊN BẢO HIỂM', 'GIÁ TIỀN', 'GHI CHÚ'] },
  { id: 'PL2_KHAM', title: 'PL2: Mã Khám Bệnh', desc: 'Theo hạng BV', cols: ['MÃ KHÁM', 'TÊN KHÁM', 'HẠNG BV', 'ĐƠN GIÁ', 'GHI CHÚ'] },
  { id: 'PL3_GIUONG', title: 'PL3: Tiền Giường', desc: 'Giường nội trú', cols: ['MÃ GIƯỜNG', 'LOẠI GIƯỜNG', 'TÊN KHOA', 'HẠNG BV', 'ĐƠN GIÁ'] },
  { id: 'PL4_GIUONG_BN', title: 'PL4: Giường Ban Ngày', desc: 'Hóa trị, Xạ trị', cols: ['MÃ GIƯỜNG', 'TÊN DỊCH VỤ', 'KHOA ĐIỀU TRỊ', 'HẠNG BV', 'ĐƠN GIÁ'] },
  { id: 'PL5_THUOC', title: 'PL5: Thuốc Tân Dược', desc: 'Hoạt chất, Đường dùng', cols: ['SO_DANG_KY', 'TEN_THUOC', 'MA_HOAT_CHAT', 'HOAT_CHAT', 'HOAT_CHAT_SDK', 'MA_DUONG_DUNG', 'DUONG_DUNG', 'HAM_LUONG', 'DONG_GOI', 'HANG_SX', 'NUOC_SX'] },
  { id: 'PL6_THUOC_YHCT', title: 'PL6: Thuốc YHCT', desc: 'Chế phẩm, Vị thuốc', cols: ['MÃ YHCT', 'TÊN VỊ THUỐC', 'ĐƠN VỊ TÍNH', 'NGUỒN GỐC', 'GHI CHÚ'] },
  { id: 'PL7_BENH_YHCT', title: 'PL7: Mã Bệnh YHCT', desc: 'Mã chương U', cols: ['MÃ BỆNH', 'TÊN BỆNH', 'CHƯƠNG BỆNH', 'MÔ TẢ'] },
  { id: 'PL8_VTYT', title: 'PL8: Vật Tư Y Tế', desc: 'Mã VTYT, Hãng SX', cols: ['MÃ VẬT TƯ', 'TÊN VẬT TƯ', 'QUY CÁCH', 'HÃNG SX', 'NƯỚC SX', 'ĐƠN GIÁ', 'GIA_BH_TT'] },
  { id: 'PL9_MAU', title: 'PL9: Máu & Chế Phẩm', desc: 'Thể tích, Mã máu', cols: ['MÃ MÁU', 'TÊN CHẾ PHẨM', 'THỂ TÍCH', 'ĐƠN GIÁ', 'GHI CHÚ'] },
  { id: 'PL10_DOI_TUONG', title: 'PL10: Đối Tượng KCB', desc: 'Mức hưởng', cols: ['MÃ ĐỐI TƯỢNG', 'TÊN ĐỐI TƯỢNG', 'MỨC HƯỞNG (%)', 'GHI CHÚ', 'Quy định'] },
  { id: 'PL11_CLS', title: 'PL11: CLS, CĐHA', desc: 'Chỉ số bình thường', cols: ['MÃ DỊCH VỤ', 'TÊN XÉT NGHIỆM', 'CHỈ SỐ BÌNH THƯỜNG', 'ĐƠN VỊ ĐO'] },
  { id: 'PL12_NHIEN_LIEU', title: 'PL12: Mã Nhiên Liệu', desc: 'Xăng dầu, Xe điện', cols: ['MÃ NHIÊN LIỆU', 'LOẠI', 'ĐƠN VỊ TÍNH', 'GHI CHÚ'] },
  { id: 'PL13_DUONG_DUNG', title: 'PL13: Đường Dùng', desc: 'Mã, Đường dùng', cols: ['MA_DUONG_DUNG', 'DUONG_DUNG_DANG_DUNG'] }
];

/** ≥ breakpoint này: sidebar trái; nhỏ hơn: thanh phụ lục ngang (cuộn) để không chèn bảng. */
const RONG_SIDEBAR_BYT = BREAKPOINTS.md;

const DanhMucBYTMain = ({ navigation }) => {
  const { width: beRongCuaSo } = useWindowDimensions();
  const dungSidebarTrai = beRongCuaSo >= RONG_SIDEBAR_BYT;

  const [activeTab, setActiveTab] = useState(MODULES_CONFIG[0].id);
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const isReadyToSave = useRef(false);
  const dirtyRef = useRef(false);
  const dataRef = useRef([]);
  const columnsRef = useRef([]);
  const activeTabRef = useRef(MODULES_CONFIG[0].id);

  useEffect(() => { dataRef.current = data; }, [data]);
  useEffect(() => { columnsRef.current = columns; }, [columns]);
  useEffect(() => { activeTabRef.current = activeTab; }, [activeTab]);
  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(data.length / SO_DONG_MOI_TRANG_BYT));
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [data.length, currentPage]);
  useEffect(() => { setCurrentPage(1); }, [activeTab]);

  const layKhoaDuLieu = (tabId) => `BYT_7603_${tabId}`;
  const layKhoaCot = (tabId) => `BYT_7603_COLS_${tabId}`;
  const danhDauDaSua = () => { dirtyRef.current = true; };
  const luuNgayDanhMuc = async ({ localOnly = false, source = 'byt_manual_save' } = {}) => {
    if (!isReadyToSave.current || !dirtyRef.current) return false;
    const currentTab = activeTabRef.current;
    await luuBoDuLieuDanhMuc({
      dataKey: layKhoaDuLieu(currentTab),
      columnsKey: layKhoaCot(currentTab),
      data: dataRef.current,
      columns: columnsRef.current,
      source,
      syncRemote: !localOnly,
    });
    try { xoaCacheBoMayGiamDinh(); } catch {}
    dirtyRef.current = false;
    return true;
  };

  const chuyenTab = async (tabId) => {
    await luuNgayDanhMuc({ source: 'byt_switch_tab' }).catch(() => {});
    setActiveTab(tabId);
    await AsyncStorage.setItem(ACTIVE_TAB_STORAGE_KEY, tabId);
  };

  // STATE QUẢN LÝ KÍCH THƯỚC (RESIZE) & XÓA HÀNG LOẠT
  const [selectedIndexes, setSelectedIndexes] = useState([]);
  const [colWidths, setColWidths] = useState({});
  const [rowHeights, setRowHeights] = useState({});
  const [containerWidth, setContainerWidth] = useState(0);

  // 1. TẢI DỮ LIỆU CỦA TAB HIỆN TẠI
  useEffect(() => {
    const fetchTabDuLieu = async () => {
      setIsLoaded(false);
      isReadyToSave.current = false;
      dirtyRef.current = false;
      setSelectedIndexes([]);
      setColWidths({});
      setRowHeights({});

      try {
        const { data: finalData, columns: finalColumns, seededFromCode, hydratedFromFirebase } = await taiBoDuLieuDanhMuc({
          dataKey: layKhoaDuLieu(activeTab),
          columnsKey: layKhoaCot(activeTab),
          fallbackColumns: (MODULES_CONFIG.find(m => m.id === activeTab)?.cols || []).filter(c => c !== 'STT'),
        });

        dataRef.current = finalData;
        columnsRef.current = finalColumns;
        setData(finalData);
        setColumns(finalColumns);
        if (seededFromCode || hydratedFromFirebase) {
          try { xoaCacheBoMayGiamDinh(); } catch {}
        }
      } catch (e) {
        console.warn('Lỗi đọc Kho dữ liệu BYT: ', e);
      } finally {
        setIsLoaded(true);
        setTimeout(() => { isReadyToSave.current = true; }, 300);
      }
    };
    fetchTabDuLieu();
  }, [activeTab]);

  // 2. LƯU TỰ ĐỘNG KHI CÓ SỰ THAY ĐỔI
  useEffect(() => {
    if (!isReadyToSave.current || !dirtyRef.current) return;
    const saveTimer = setTimeout(() => {
      luuNgayDanhMuc({ source: 'byt_autosave' }).catch((e) => {
        console.error('Lỗi Auto-Save BYT:', e);
      });
    }, 700);
    return () => clearTimeout(saveTimer);
  }, [data, columns, activeTab]);

  useEffect(() => {
    const khoiPhucTab = async () => {
      try {
        const savedTab = await AsyncStorage.getItem(ACTIVE_TAB_STORAGE_KEY);
        if (savedTab) setActiveTab(savedTab);
      } catch {}
    };
    khoiPhucTab();
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'web') return undefined;

    const flushLocal = () => {
      luuNgayDanhMuc({ localOnly: true, source: 'byt_pagehide' }).catch(() => {});
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

  // ============================================================
  // HÀM TIỆN ÍCH EXCEL
  // ============================================================
  const handleTaiFileMau = () => {
    if (Platform.OS !== 'web') return alert("Chỉ hỗ trợ trên Web.");
    const colsForTemplate = ['STT', ...columns];
    const emptyRow = colsForTemplate.reduce((acc, curr) => ({ ...acc, [curr]: "" }), {});
    try {
      const worksheet = XLSX.utils.json_to_sheet([emptyRow], { header: colsForTemplate });
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Template_BYT");
      XLSX.writeFile(workbook, `FileMau_BYT_${activeTab}.xlsx`);
    } catch (e) { alert("Lỗi tải mẫu: " + e.message); }
  };

  const handleExportXLSX = () => {
    if (data.length === 0) return alert("Không có dữ liệu để xuất!");
    if (Platform.OS === 'web') {
      try {
        const exportData = data.map((item, idx) => ({ STT: idx + 1, ...item }));
        const colsExport = ['STT', ...columns];

        const worksheet = XLSX.utils.json_to_sheet(exportData, { header: colsExport });
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, activeTab.substring(0, 31)); 
        XLSX.writeFile(workbook, `Danh_Muc_BYT_${activeTab}.xlsx`);
      } catch (e) { alert("Có lỗi xảy ra: " + e.message); }
    }
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
        const importedData = XLSX.utils.sheet_to_json(ws, { defval: "" });
        
        if (importedData.length > 0) {
          const rawCols = Object.keys(importedData[0]).filter(c => c !== 'STT');
          const mergedCols = [...new Set([...columns, ...rawCols])];
          
          const formattedData = importedData.map(item => {
              const cleanItem = { ...item, TRANG_THAI_SU_DUNG: 'ON' };
              delete cleanItem['STT'];
              return cleanItem;
          });

          const newData = [...formattedData, ...data];
          
          setColumns(mergedCols);
          setData(newData);
          dataRef.current = newData;
          columnsRef.current = mergedCols;
          dirtyRef.current = false;
          setCurrentPage(1);

          await luuBoDuLieuDanhMuc({
            dataKey: layKhoaDuLieu(activeTab),
            columnsKey: layKhoaCot(activeTab),
            data: newData,
            columns: mergedCols,
            source: 'byt_import_excel',
            syncRemote: true,
          });
          try { xoaCacheBoMayGiamDinh(); } catch {}
          flushFirebaseDanhMucQueue().catch(() => {});

          alert(`✅ Đã Import thành công ${importedData.length} dòng dữ liệu vào ${activeTab}!`);
        }
      } catch (err) {
        alert("❌ Lỗi đọc file Excel: " + err.message);
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = null; 
  };

  // ============================================================
  // CÁC HÀM CRUD & CHỌN HÀNG LOẠT
  // ============================================================
  const handleCellChange = (text, rowIndex, colName) => {
    const newData = [...data];
    newData[rowIndex][colName] = text;
    danhDauDaSua();
    dataRef.current = newData;
    setData(newData);
  };

  const handleAddRow = () => {
    const newRow = { TRANG_THAI_SU_DUNG: 'ON' };
    columns.forEach(col => newRow[col] = "");
    const nextData = [newRow, ...data];
    danhDauDaSua();
    dataRef.current = nextData;
    setData(nextData);
    setCurrentPage(1);
  };

  const handleDeleteRow = (index) => {
    if (Platform.OS === 'web' && !window.confirm("Bác sĩ có chắc chắn muốn xóa dòng này?")) return;
    const newData = [...data];
    newData.splice(index, 1);
    danhDauDaSua();
    dataRef.current = newData;
    setData(newData);
    setSelectedIndexes((prev) => prev.filter((i) => i !== index).map((i) => (i > index ? i - 1 : i)));
  };

  const toggleTrangThai = (index) => {
    const newData = [...data];
    const currentState = newData[index].TRANG_THAI_SU_DUNG;
    newData[index].TRANG_THAI_SU_DUNG = currentState === 'OFF' ? 'ON' : 'OFF';
    danhDauDaSua();
    dataRef.current = newData;
    setData(newData);
  };

  const toggleSelectRow = (index) => {
    if (selectedIndexes.includes(index)) {
      setSelectedIndexes(selectedIndexes.filter(i => i !== index));
    } else {
      setSelectedIndexes([...selectedIndexes, index]);
    }
  };

  const handleSelectAll = () => {
    if (selectedIndexes.length === data.length && data.length > 0) {
      setSelectedIndexes([]);
    } else {
      setSelectedIndexes(data.map((_, idx) => idx));
    }
  };

  const handleDeleteBulk = () => {
    if (Platform.OS === 'web' && !window.confirm(`Xóa vĩnh viễn ${selectedIndexes.length} dòng dữ liệu đã chọn?`)) return;
    const newData = data.filter((_, idx) => !selectedIndexes.includes(idx));
    danhDauDaSua();
    dataRef.current = newData;
    setData(newData);
    setSelectedIndexes([]); 
  };

  // ============================================================
  // ENGINE TÍNH TOÁN KÍCH THƯỚC ĐỘNG (Dùng cho lần load đầu)
  // ============================================================
  const getColumnStyle = (colName) => {
    const upperCol = String(colName).toUpperCase();
    const isSuperWide = upperCol.includes('ĐIỀU KIỆN') || upperCol.includes('DIEU_KIEN') || upperCol.includes('CẢNH BÁO') || upperCol.includes('CANH_BAO') || upperCol.includes('MÔ TẢ') || upperCol.includes('QUY TẮC') || upperCol.includes('QUY_TAC');
    const isWide = upperCol.includes('TEN') || upperCol.includes('TÊN') || upperCol.includes('NAME') || upperCol.includes('GHI_CHU') || upperCol.includes('GHI CHÚ') || upperCol.includes('CHỈ SỐ') || upperCol.includes('DUONG_DUNG_DANG_DUNG') || upperCol.includes('HOAT_CHAT');
    const isCode = upperCol.includes('MA_') || upperCol.includes('MÃ');

    if (isSuperWide) return { flex: 4, minWidth: 480 };
    if (isWide) return { flex: 2.5, minWidth: 300 };
    if (isCode) return { flex: 1.5, minWidth: 160 };
    return { flex: 1.2, minWidth: 150 };                
  };

  // HÀM RENDER HEADER CELL CÓ KHẢ NĂNG KÉO GIÃN (RESIZE)
  // Cột tiện ích (_CHK, _STT, _STATUS, _ACTION) KHÔNG áp resize để tránh bị thu hẹp nhầm
  const renderHeaderCell = (key, label, defaultStyle, content = null) => {
    const isUtilityCol = key.startsWith('_');
    return (
      <View
        style={[
          styles.o_tieu_de,
          defaultStyle,
          // Chỉ cho phép override width nếu là cột nội dung (không phải cột cố định)
          !isUtilityCol && colWidths[key] ? { width: colWidths[key], flex: 0 } : {},
          // Chỉ bật Resize cho cột nội dung, KHÔNG cho cột STT/STATUS/XÓA
          !isUtilityCol && Platform.OS === 'web' && { resize: 'horizontal', overflow: 'hidden' }
        ]}
        onLayout={(e) => {
          const newWidth = e.nativeEvent.layout.width;
          if (!isUtilityCol && (!colWidths[key] || Math.abs(colWidths[key] - newWidth) > 5)) {
            setColWidths(prev => ({ ...prev, [key]: newWidth }));
          }
        }}
      >
        {content ? content : <Text style={styles.chu_o_tieu_de} numberOfLines={1}>{label}</Text>}
      </View>
    );
  };

  const totalPages = Math.max(1, Math.ceil(data.length / SO_DONG_MOI_TRANG_BYT));
  const currentPageSafe = Math.min(currentPage, totalPages);
  const pageStartIndex = (currentPageSafe - 1) * SO_DONG_MOI_TRANG_BYT;
  const pageEndIndex = Math.min(data.length, pageStartIndex + SO_DONG_MOI_TRANG_BYT);
  const visibleRows = data.slice(pageStartIndex, pageEndIndex);

  const renderNoiDungBang = () => (
      <View style={styles.khung_chuc_nang}>
        <View style={styles.thanh_cong_cu}>
          <Text style={styles.tieu_de_bang}>DANH MỤC: {activeTab} ({data.length} dòng)</Text>
          <View style={styles.khoi_hanh_dong}>
            {selectedIndexes.length > 0 && (
                <TouchableOpacity style={[styles.nut_xanh_la, {backgroundColor: '#D32F2F'}]} onPress={handleDeleteBulk}>
                    <Text style={styles.chu_nut}>🗑 XÓA ĐÃ CHỌN ({selectedIndexes.length})</Text>
                </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.nut_xanh_la} onPress={handleTaiFileMau}>
              <Text style={styles.chu_nut}>⬇ TẢI FILE MẪU</Text>
            </TouchableOpacity>
            
            {Platform.OS === 'web' && (
              <React.Fragment>
                <input type="file" accept=".xlsx, .xls, .csv" onChange={handleImportExcel} style={{ display: 'none' }} id="import-excel-byt" />
                <TouchableOpacity style={styles.nut_cam} onPress={() => document.getElementById('import-excel-byt').click()}>
                  <Text style={styles.chu_nut}>📤 IMPORT EXCEL</Text>
                </TouchableOpacity>
              </React.Fragment>
            )}

            <TouchableOpacity style={styles.nut_xanh_duong} onPress={handleExportXLSX}>
              <Text style={styles.chu_nut}>📥 EXPORT BẢNG</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.nut_hong} onPress={handleAddRow}>
              <Text style={styles.chu_nut}>+ THÊM DÒNG</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* DATA TABLE */}
        <View style={styles.khung_bang_master} onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}>
          {!isLoaded ? (
             <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#0D47A1" />
                <Text style={{ marginTop: 10, fontSize: 18, color: '#555' }}>Đang tải cấu trúc danh mục...</Text>
             </View>
          ) : (
            <View style={{ flex: 1 }}>
              <View style={styles.khung_phan_trang}>
                <Text style={styles.chu_phan_trang}>
                  {data.length > 0
                    ? `Hiển thị ${pageStartIndex + 1}-${pageEndIndex}/${data.length} dòng | Trang ${currentPageSafe}/${totalPages}`
                    : 'Danh mục đang trống'}
                </Text>
                {totalPages > 1 && (
                  <View style={styles.nhom_phan_trang}>
                    <TouchableOpacity
                      style={[styles.nut_phan_trang, currentPageSafe <= 1 && styles.nut_phan_trang_tat]}
                      onPress={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPageSafe <= 1}
                    >
                      <Text style={styles.chu_nut_phan_trang}>TRUOC</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.nut_phan_trang, currentPageSafe >= totalPages && styles.nut_phan_trang_tat]}
                      onPress={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={currentPageSafe >= totalPages}
                    >
                      <Text style={styles.chu_nut_phan_trang}>SAU</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
              <ScrollView horizontal style={styles.scroll_ngang}>
              <View style={[styles.bang_chinh, { minWidth: containerWidth > 0 ? containerWidth : '100%' }]}>
                
                {/* HEADER BẢNG VỚI NÚT CHỌN TẤT CẢ VÀ RESIZE ALL COLS */}
                <View style={styles.dong_tieu_de}>
                  {renderHeaderCell('_CHK', '', { width: 55, flex: 0, alignItems: 'center' }, (
                     <TouchableOpacity onPress={handleSelectAll}>
                        <Text style={{fontWeight: 'bold', fontSize: 18, color: '#0D47A1'}}>
                            {selectedIndexes.length > 0 && selectedIndexes.length === data.length ? '☑' : '☐'}
                        </Text>
                     </TouchableOpacity>
                  ))}
                  
                  {renderHeaderCell('_STT', 'STT', { width: 90, flex: 0 })}
                  {renderHeaderCell('_STATUS', 'TRẠNG THÁI', { width: 200, flex: 0 })}
                  
                  {columns.map((col) => renderHeaderCell(col, col, getColumnStyle(col)))}
                  
                  {renderHeaderCell('_ACTION', 'XÓA', { width: 100, flex: 0 })}
                </View>

                {/* BODY BẢNG */}
                <ScrollView showsVerticalScrollIndicator={true} style={styles.scroll_doc}>
                  {visibleRows.map((row, rowIndex) => {
                      const globalIndex = pageStartIndex + rowIndex;
                      const isOff = row.TRANG_THAI_SU_DUNG === 'OFF';
                      const isSelected = selectedIndexes.includes(globalIndex);
                      return (
                        <View 
                          key={globalIndex} 
                          style={[
                            styles.dong_du_lieu, 
                            isOff && {opacity: 0.5}, 
                            isSelected && {backgroundColor: '#E3F2FD'},
                            // Áp dụng chiều cao nếu người dùng kéo giãn Row
                            rowHeights[globalIndex] ? { height: rowHeights[globalIndex] } : {},
                            // Bật CSS Resize Vertical cho Row
                            Platform.OS === 'web' && { resize: 'vertical', overflow: 'hidden' }
                          ]}
                          onLayout={(e) => {
                              const newHeight = e.nativeEvent.layout.height;
                              if (!rowHeights[globalIndex] || Math.abs(rowHeights[globalIndex] - newHeight) > 5) {
                                  setRowHeights(prev => ({ ...prev, [globalIndex]: newHeight }));
                              }
                          }}
                        >
                            
                            <View style={[styles.o_du_lieu_stt, { width: colWidths['_CHK'] || 55, flex: 0 }]}>
                              <TouchableOpacity onPress={() => toggleSelectRow(globalIndex)}>
                                  <View style={[styles.checkbox, isSelected && styles.checkbox_active]}></View>
                              </TouchableOpacity>
                            </View>

                            <View style={[styles.o_du_lieu_stt, { width: 90, flex: 0 }]}>
                                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#0D47A1' }}>{globalIndex + 1}</Text>
                            </View>

                            <View style={[styles.o_du_lieu_stt, { width: 200, flex: 0 }]}>
                                <TouchableOpacity style={[styles.btn_toggle, isOff && styles.btn_toggle_off]} onPress={() => toggleTrangThai(globalIndex)}>
                                    <Text style={{color: '#FFF', fontWeight: 'bold', fontSize: 13}}>{isOff ? 'KHÓA' : 'ĐANG BẬT'}</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Các ô dữ liệu động tự căn theo Width của Header */}
                            {columns.map((col, colIndex) => (
                                <View 
                                    key={colIndex} 
                                    style={[
                                      styles.o_wrapper, 
                                      getColumnStyle(col), 
                                      colWidths[col] ? { width: colWidths[col], flex: 0 } : {}
                                    ]}
                                >
                                  <TextInput
                                      style={styles.o_du_lieu}
                                      value={String(row[col] || '')}
                                      onChangeText={(text) => handleCellChange(text, globalIndex, col)}
                                      multiline={true}
                                      outlineStyle="none"
                                  />
                                </View>
                            ))}
                            
                            <View style={[styles.o_thao_tac, { width: 100, flex: 0 }]}>
                                <TouchableOpacity onPress={() => handleDeleteRow(globalIndex)} style={styles.nut_xoa}>
                                    <Text style={styles.chu_nut_xoa}>✕</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                      );
                  })}
                  {data.length === 0 && (
                    <Text style={styles.txt_trong}>
                      Danh mục {activeTab} đang trống. Bác sĩ có thể bấm TẢI FILE MẪU rồi IMPORT EXCEL để nạp dữ liệu.
                    </Text>
                  )}
                  <View style={{ height: 100 }} />
                </ScrollView>

              </View>
            </ScrollView>
            </View>
          )}
        </View>

      </View>
  );

  const khoiChonPhuLuc = dungSidebarTrai ? (
    <View style={styles.sidebar_wrap} accessibilityRole="navigation">
      <View style={styles.sidebar_head}>
        <Text style={styles.sidebar_head_tieu_de}>QĐ 7603 — Phụ lục</Text>
        <Text style={styles.sidebar_head_phu}>Danh mục Bộ Y tế theo từng phụ lục</Text>
      </View>
      <ScrollView
        style={styles.sidebar_scroll}
        contentContainerStyle={styles.sidebar_scroll_inner}
        showsVerticalScrollIndicator
        keyboardShouldPersistTaps="handled"
      >
        {MODULES_CONFIG.map((module) => {
          const on = activeTab === module.id;
          return (
            <TouchableOpacity
              key={module.id}
              style={[styles.sidebar_item, on && styles.sidebar_item_active]}
              onPress={() => chuyenTab(module.id)}
              activeOpacity={0.75}
            >
              <Text style={[styles.sidebar_item_title, on && styles.sidebar_item_title_on]} numberOfLines={2}>
                {module.title}
              </Text>
              <Text style={[styles.sidebar_item_desc, on && styles.sidebar_item_desc_on]} numberOfLines={2}>
                {module.desc}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  ) : (
    <View style={styles.nav_bar}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.nav_scroll}>
        {MODULES_CONFIG.map((module) => (
          <TouchableOpacity
            key={module.id}
            style={[styles.tabItem, activeTab === module.id && styles.tabItemActive]}
            onPress={() => chuyenTab(module.id)}
          >
            <Text style={[styles.tabTitle, activeTab === module.id && styles.tabTitleActive]}>{module.title}</Text>
            <Text style={[styles.tabDesc, activeTab === module.id && styles.tabDescActive]}>{module.desc}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* BRAND HEADER */}
      <View style={styles.top_brand_bar}>
        <TouchableOpacity
          accessibilityLabel="Về trang chủ, bảng điều khiển"
          onPress={() => quayLaiAnToan(navigation, 'TongQuan')}
          style={styles.nut_back_home}
        >
          <Text style={styles.chu_nut_back_home}>⬅ Trang chủ</Text>
        </TouchableOpacity>
        <View style={styles.top_brand_trung_tam}>
          <Image source={{ uri: LOGO_PC }} style={styles.logo_header} resizeMode="contain" />
          <View style={{ alignItems: 'center' }}>
            <Text style={styles.top_brand_text_main}>BỆNH VIỆN QUỐC TẾ PHƯƠNG CHÂU SÓC TRĂNG</Text>
            <Text style={styles.top_brand_text_sub}>HỆ THỐNG DANH MỤC DÙNG CHUNG BỘ Y TẾ (QĐ 7603)</Text>
          </View>
        </View>
        <View style={styles.top_brand_spacer} />
      </View>

      {dungSidebarTrai ? (
        <View style={styles.main_split}>
          {khoiChonPhuLuc}
          <View style={styles.khung_chuc_nang_pane}>{renderNoiDungBang()}</View>
        </View>
      ) : (
        <View style={styles.main_col_narrow}>
          {khoiChonPhuLuc}
          <View style={styles.khung_chuc_nang_pane}>{renderNoiDungBang()}</View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4F8' },
  main_split: {
    flex: 1,
    flexDirection: 'row',
    minHeight: 0,
  },
  main_col_narrow: {
    flex: 1,
    minHeight: 0,
  },
  khung_chuc_nang_pane: {
    flex: 1,
    minWidth: 0,
    minHeight: 0,
  },
  sidebar_wrap: {
    width: 276,
    flexShrink: 0,
    backgroundColor: '#FFFFFF',
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
    ...Platform.select({
      web: {
        minHeight: '100%',
        boxShadow: '2px 0 10px rgba(15,23,42,0.07)',
      },
      default: { elevation: 2 },
    }),
  },
  sidebar_head: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E8EEF3',
  },
  sidebar_head_tieu_de: { fontSize: 12, fontWeight: '800', color: '#0D47A1', letterSpacing: 0.3, fontFamily: 'Arial' },
  sidebar_head_phu: { fontSize: 10, color: '#64748B', marginTop: 4, fontFamily: 'Arial' },
  sidebar_scroll: { flexGrow: 1, flexShrink: 1 },
  sidebar_scroll_inner: { paddingBottom: 20, paddingTop: 4 },
  sidebar_item: { paddingVertical: 11, paddingHorizontal: 12, borderLeftWidth: 4, borderLeftColor: 'transparent' },
  sidebar_item_active: { backgroundColor: '#E3F2FD', borderLeftColor: '#0D47A1' },
  sidebar_item_title: { fontSize: 13, fontWeight: '700', color: '#37474F', fontFamily: 'Arial' },
  sidebar_item_title_on: { color: '#0D47A1' },
  sidebar_item_desc: { fontSize: 10, color: '#90A4AE', marginTop: 3, lineHeight: 14, fontFamily: 'Arial' },
  sidebar_item_desc_on: { color: '#1565C0' },
  top_brand_bar: {
    backgroundColor: '#0D47A1',
    paddingVertical: 15,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 4,
  },
  nut_back_home: {
    minWidth: 132,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.14)',
    ...Platform.select({ web: { cursor: 'pointer' } }),
  },
  chu_nut_back_home: { color: '#E3F2FD', fontSize: 14, fontWeight: '800', fontFamily: 'Arial' },
  top_brand_trung_tam: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', minWidth: 0 },
  top_brand_spacer: { minWidth: 132 },
  logo_header: { width: 90, height: 90, borderRadius: 45, marginRight: 20, backgroundColor: '#FFF' },
  top_brand_text_main: { color: '#FFF', fontSize: 32, fontWeight: 'bold', fontFamily: 'Arial', letterSpacing: 0.5, textAlign: 'center' },
  top_brand_text_sub: { color: '#BBDEFB', fontSize: 20, fontFamily: 'Arial', marginTop: 4, fontStyle: 'italic', textAlign: 'center' },

  nav_bar: { backgroundColor: '#FFF', paddingVertical: 5, borderBottomWidth: 2, borderBottomColor: '#FFC107', elevation: 2 },
  nav_scroll: { paddingHorizontal: 15 },
  tabItem: { paddingVertical: 10, paddingHorizontal: 20, borderBottomWidth: 4, borderBottomColor: 'transparent', minWidth: 160, alignItems: 'center' },
  tabItemActive: { borderBottomColor: '#0D47A1', backgroundColor: '#E3F2FD' },
  tabTitle: { fontSize: 16, fontWeight: 'bold', color: '#546E7A' },
  tabTitleActive: { color: '#0D47A1' },
  tabDesc: { fontSize: 12, color: '#90A4AE', marginTop: 2 },
  tabDescActive: { color: '#1565C0' },
  
  khung_chuc_nang: { padding: 20, flex: 1 },
  thanh_cong_cu: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15, flexWrap: 'wrap', alignItems: 'center' },
  tieu_de_bang: { fontSize: 20, fontWeight: 'bold', color: '#0D47A1', fontFamily: 'Arial' },
  khoi_hanh_dong: { flexDirection: 'row', gap: 10 },
  
  nut_xanh_la: { backgroundColor: '#4CAF50', paddingVertical: 10, paddingHorizontal: 15, borderRadius: 6, justifyContent: 'center', elevation: 2 }, 
  nut_xanh_duong: { backgroundColor: '#1976D2', paddingVertical: 10, paddingHorizontal: 15, borderRadius: 6, justifyContent: 'center', elevation: 2 }, 
  nut_cam: { backgroundColor: '#FF9800', paddingVertical: 10, paddingHorizontal: 15, borderRadius: 6, justifyContent: 'center', elevation: 2 },
  nut_hong: { backgroundColor: '#E91E63', paddingVertical: 10, paddingHorizontal: 15, borderRadius: 6, justifyContent: 'center', elevation: 2 },
  chu_nut: { color: '#FFF', fontWeight: 'bold', fontSize: 14, fontFamily: 'Arial' },
  
  khung_bang_master: { flex: 1, backgroundColor: '#FFF', borderRadius: 8, borderWidth: 1, borderColor: '#B0BEC5', overflow: 'hidden', ...Platform.select({ web: { boxShadow: '0px 4px 12px rgba(0,0,0,0.08)' }, default: { elevation: 3 } }) },
  khung_phan_trang: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 12,
    gap: 12,
  },
  chu_phan_trang: { color: '#455A64', fontSize: 15, fontWeight: '700', fontFamily: 'Arial' },
  nhom_phan_trang: { flexDirection: 'row', gap: 8 },
  nut_phan_trang: {
    backgroundColor: '#0D47A1',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  nut_phan_trang_tat: { opacity: 0.45 },
  chu_nut_phan_trang: { color: '#FFF', fontSize: 13, fontWeight: '800', fontFamily: 'Arial' },
  scroll_ngang: { flex: 1 },
  bang_chinh: { flex: 1 },

  // Header Cột 
  dong_tieu_de: { flexDirection: 'row', backgroundColor: '#BBDEFB', borderBottomWidth: 2, borderColor: '#1976D2' },
  o_tieu_de: { paddingVertical: 18, paddingHorizontal: 14, borderRightWidth: 1, borderColor: '#90CAF9', justifyContent: 'center' },
  chu_o_tieu_de: { fontWeight: 'bold', fontSize: 16, color: '#000000', fontFamily: 'Arial', textAlign: 'center' },
  
  scroll_doc: { flex: 1 },
  
  // Dòng dữ liệu
  dong_du_lieu: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#EEEEEE', minHeight: 70, alignItems: 'stretch' },
  o_du_lieu_stt: { borderRightWidth: 1, borderColor: '#EEEEEE', backgroundColor: '#E3F2FD', alignItems: 'center', justifyContent: 'center' },
  
  // Wrapper bọc ô TextInput để truyền Width
  o_wrapper: { borderRightWidth: 1, borderColor: '#EEEEEE', justifyContent: 'flex-start' },
  // Khung nhập liệu điền đầy Wrapper
  o_du_lieu: { flex: 1, paddingVertical: 12, paddingHorizontal: 12, fontSize: 16, color: '#333333', fontFamily: 'Arial', textAlignVertical: 'top' },
  
  checkbox: { width: 22, height: 22, borderWidth: 2, borderColor: '#0D47A1', borderRadius: 4 },
  checkbox_active: { backgroundColor: '#0D47A1' },
  
  btn_toggle: { backgroundColor: '#4CAF50', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 20, elevation: 1 },
  btn_toggle_off: { backgroundColor: '#757575' },

  o_thao_tac: { padding: 8, justifyContent: 'center', alignItems: 'center', borderRightWidth: 1, borderColor: '#EEEEEE' },
  nut_xoa: { backgroundColor: '#F44336', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 4 },
  chu_nut_xoa: { color: '#FFF', fontWeight: 'bold', fontSize: 14, fontFamily: 'Arial' },
  txt_trong: { padding: 40, fontSize: 18, fontStyle: 'italic', color: '#999', textAlign: 'center', fontFamily: 'Arial' }
});

export default DanhMucBYTMain;
