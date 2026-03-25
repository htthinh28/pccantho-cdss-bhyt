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
import { ActivityIndicator, Image, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as XLSX from 'xlsx';

const LOGO_PC = 'https://i.ibb.co/nNr9SQYr/logo-pc.png';

// ============================================================
// HỆ THỐNG LƯU TRỮ BIG DATA CHỐNG TRÀN BỘ NHỚ WEB (CHUNKING)
// ============================================================
const CHUNK_SIZE = 1500; 
const safeSetStorage = async (key, dataArray) => {
  try {
    if (!Array.isArray(dataArray)) {
      await AsyncStorage.setItem(key, JSON.stringify(dataArray));
      return;
    }
    const oldChunksStr = await AsyncStorage.getItem(`${key}_CHUNKS`);
    if (oldChunksStr) {
      const oldChunks = parseInt(oldChunksStr, 10);
      for (let i = 0; i < oldChunks; i++) await AsyncStorage.removeItem(`${key}_CHUNK_${i}`);
    }
    const totalChunks = Math.ceil(dataArray.length / CHUNK_SIZE);
    await AsyncStorage.setItem(`${key}_CHUNKS`, String(totalChunks));
    for (let i = 0; i < totalChunks; i++) {
      const chunk = dataArray.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
      await AsyncStorage.setItem(`${key}_CHUNK_${i}`, JSON.stringify(chunk));
    }
  } catch (e) { console.error("Lỗi Chunking Set Storage:", e); }
};

const safeGetStorage = async (key) => {
  try {
    const chunksStr = await AsyncStorage.getItem(`${key}_CHUNKS`);
    if (chunksStr) {
      const totalChunks = parseInt(chunksStr, 10);
      let fullData = [];
      for (let i = 0; i < totalChunks; i++) {
        const chunkStr = await AsyncStorage.getItem(`${key}_CHUNK_${i}`);
        if (chunkStr) fullData = fullData.concat(JSON.parse(chunkStr));
      }
      return fullData;
    }
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (e) { return null; }
};

// ============================================================
// CẤU HÌNH 13 MODULE PHỤ LỤC & CỘT MẪU
// ============================================================
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
  { id: 'PL10_DOI_TUONG', title: 'PL10: Đối Tượng KCB', desc: 'Mức hưởng', cols: ['MÃ ĐỐI TƯỢNG', 'TÊN ĐỐI TƯỢNG', 'MỨC HƯỞNG (%)', 'GHI CHÚ'] },
  { id: 'PL11_CLS', title: 'PL11: CLS, CĐHA', desc: 'Chỉ số bình thường', cols: ['MÃ DỊCH VỤ', 'TÊN XÉT NGHIỆM', 'CHỈ SỐ BÌNH THƯỜNG', 'ĐƠN VỊ ĐO'] },
  { id: 'PL12_NHIEN_LIEU', title: 'PL12: Mã Nhiên Liệu', desc: 'Xăng dầu, Xe điện', cols: ['MÃ NHIÊN LIỆU', 'LOẠI', 'ĐƠN VỊ TÍNH', 'GHI CHÚ'] },
  { id: 'PL13_DUONG_DUNG', title: 'PL13: Đường Dùng', desc: 'Mã, Đường dùng', cols: ['MA_DUONG_DUNG', 'DUONG_DUNG_DANG_DUNG'] }
];

const DanhMucBYTMain = () => {
  const [activeTab, setActiveTab] = useState(MODULES_CONFIG[0].id);
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const isReadyToSave = useRef(false);

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
      setSelectedIndexes([]); 
      setColWidths({}); 
      setRowHeights({});
      
      try {
        const parsedData = await safeGetStorage(`BYT_7603_${activeTab}`);
        const rawCols = await AsyncStorage.getItem(`BYT_7603_COLS_${activeTab}`);
        
        let finalData = parsedData || [];
        setData(finalData);

        if (rawCols) {
          setColumns(JSON.parse(rawCols));
        } else if (finalData.length > 0) {
          setColumns(Object.keys(finalData[0]).filter(k => k !== 'TRANG_THAI_SU_DUNG' && k !== 'STT')); 
        } else {
          const defaultCols = MODULES_CONFIG.find(m => m.id === activeTab)?.cols || [];
          setColumns(defaultCols.filter(c => c !== 'STT')); 
        }
      } catch (e) {
        console.warn("Lỗi đọc Kho dữ liệu BYT: ", e);
      } finally {
        setIsLoaded(true);
        setTimeout(() => { isReadyToSave.current = true; }, 500);
      }
    };
    fetchTabDuLieu();
  }, [activeTab]);

  // 2. LƯU TỰ ĐỘNG KHI CÓ SỰ THAY ĐỔI
  useEffect(() => {
    if (!isReadyToSave.current) return;
    const saveTimer = setTimeout(async () => {
      try {
        await safeSetStorage(`BYT_7603_${activeTab}`, data);
        await AsyncStorage.setItem(`BYT_7603_COLS_${activeTab}`, JSON.stringify(columns));
      } catch (e) { console.error("Lỗi Auto-Save BYT:", e); }
    }, 1000);
    return () => clearTimeout(saveTimer);
  }, [data, columns, activeTab]);

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

          await safeSetStorage(`BYT_7603_${activeTab}`, newData);
          await AsyncStorage.setItem(`BYT_7603_COLS_${activeTab}`, JSON.stringify(mergedCols));
          
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
    setData(newData);
  };

  const handleAddRow = () => {
    const newRow = { TRANG_THAI_SU_DUNG: 'ON' };
    columns.forEach(col => newRow[col] = "");
    setData([newRow, ...data]); 
  };

  const handleDeleteRow = (index) => {
    if (Platform.OS === 'web' && !window.confirm("Bác sĩ có chắc chắn muốn xóa dòng này?")) return;
    const newData = [...data];
    newData.splice(index, 1);
    setData(newData);
    setSelectedIndexes(selectedIndexes.filter(i => i !== index));
  };

  const toggleTrangThai = (index) => {
    const newData = [...data];
    const currentState = newData[index].TRANG_THAI_SU_DUNG;
    newData[index].TRANG_THAI_SU_DUNG = currentState === 'OFF' ? 'ON' : 'OFF';
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

  return (
    <SafeAreaView style={styles.container}>
      
      {/* BRAND HEADER */}
      <View style={styles.top_brand_bar}>
        <Image source={{ uri: LOGO_PC }} style={styles.logo_header} resizeMode="contain" />
        <View style={{ alignItems: 'center' }}>
          <Text style={styles.top_brand_text_main}>BỆNH VIỆN QUỐC TẾ PHƯƠNG CHÂU SÓC TRĂNG</Text>
          <Text style={styles.top_brand_text_sub}>HỆ THỐNG DANH MỤC DÙNG CHUNG BỘ Y TẾ (QĐ 7603)</Text>
        </View>
      </View>

      {/* NAV BAR */}
      <View style={styles.nav_bar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.nav_scroll}>
          {MODULES_CONFIG.map((module) => (
            <TouchableOpacity
              key={module.id}
              style={[styles.tabItem, activeTab === module.id && styles.tabItemActive]}
              onPress={() => setActiveTab(module.id)}
            >
              <Text style={[styles.tabTitle, activeTab === module.id && styles.tabTitleActive]}>{module.title}</Text>
              <Text style={[styles.tabDesc, activeTab === module.id && styles.tabDescActive]}>{module.desc}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* TOOLBAR */}
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
                  {data.map((row, rowIndex) => {
                      const isOff = row.TRANG_THAI_SU_DUNG === 'OFF';
                      const isSelected = selectedIndexes.includes(rowIndex);
                      return (
                        <View 
                          key={rowIndex} 
                          style={[
                            styles.dong_du_lieu, 
                            isOff && {opacity: 0.5}, 
                            isSelected && {backgroundColor: '#E3F2FD'},
                            // Áp dụng chiều cao nếu người dùng kéo giãn Row
                            rowHeights[rowIndex] ? { height: rowHeights[rowIndex] } : {},
                            // Bật CSS Resize Vertical cho Row
                            Platform.OS === 'web' && { resize: 'vertical', overflow: 'hidden' }
                          ]}
                          onLayout={(e) => {
                              const newHeight = e.nativeEvent.layout.height;
                              if (!rowHeights[rowIndex] || Math.abs(rowHeights[rowIndex] - newHeight) > 5) {
                                  setRowHeights(prev => ({ ...prev, [rowIndex]: newHeight }));
                              }
                          }}
                        >
                            
                            <View style={[styles.o_du_lieu_stt, { width: colWidths['_CHK'] || 55, flex: 0 }]}>
                              <TouchableOpacity onPress={() => toggleSelectRow(rowIndex)}>
                                  <View style={[styles.checkbox, isSelected && styles.checkbox_active]}></View>
                              </TouchableOpacity>
                            </View>

                            <View style={[styles.o_du_lieu_stt, { width: 90, flex: 0 }]}>
                                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#0D47A1' }}>{rowIndex + 1}</Text>
                            </View>

                            <View style={[styles.o_du_lieu_stt, { width: 200, flex: 0 }]}>
                                <TouchableOpacity style={[styles.btn_toggle, isOff && styles.btn_toggle_off]} onPress={() => toggleTrangThai(rowIndex)}>
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
                                      onChangeText={(text) => handleCellChange(text, rowIndex, col)}
                                      multiline={true}
                                      outlineStyle="none"
                                  />
                                </View>
                            ))}
                            
                            <View style={[styles.o_thao_tac, { width: 100, flex: 0 }]}>
                                <TouchableOpacity onPress={() => handleDeleteRow(rowIndex)} style={styles.nut_xoa}>
                                    <Text style={styles.chu_nut_xoa}>✕</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                      );
                  })}
                  {data.length === 0 && (
                    <Text style={styles.txt_trong}>
                      Danh mục {activeTab} đang trống. Bác sĩ có thể bấm "TẢI FILE MẪU" rồi "IMPORT EXCEL" để nạp dữ liệu.
                    </Text>
                  )}
                  <View style={{ height: 100 }} />
                </ScrollView>

              </View>
            </ScrollView>
          )}
        </View>

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4F8' },
  top_brand_bar: { backgroundColor: '#0D47A1', paddingVertical: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', elevation: 4 },
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