/**
 * MODULE: QUẢN LÝ DANH MỤC TỔNG THỂ (MASTER DATA TABS)
 * Nâng cấp (Bản 2.0 - Fullscreen & Chunking Storage):
 * 1. FIX LỖI MẤT DỮ LIỆU: Vượt rào giới hạn 5MB của Web Browser bằng thuật toán Chunking (Băm nhỏ mảng).
 * 2. FIX AUTO-SAVE: Bổ sung cờ isReadyToSave để tránh ghi đè mảng rỗng khi F5.
 * 3. UI FULLSCREEN: Xóa bỏ giới hạn chiều cao, dãn cột (450px) và dãn dòng (padding 18px).
 * Giao diện: Pink Theme Phương Châu, Arial > 20px
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useRef, useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as XLSX from 'xlsx';
import { CD } from '../tien_ich/chu_de_giao_dien';

import KhoDuLieu from '../tien_ich/kho_du_lieu';

// ============================================================================
// HỆ THỐNG LƯU TRỮ CHỐNG TRÀN BỘ NHỚ WEB (CHUNKING STORAGE)
// ============================================================================
const CHUNK_SIZE = 1500; // Cắt nhỏ mảng ra mỗi cục 1500 dòng để không bị lỗi 5MB limit

const safeSetStorage = async (key, dataArray) => {
  try {
    if (!Array.isArray(dataArray)) {
      await AsyncStorage.setItem(key, JSON.stringify(dataArray));
      return;
    }
    // Xóa các chunk cũ đi để tránh rác
    const oldChunksStr = await AsyncStorage.getItem(`${key}_CHUNKS`);
    if (oldChunksStr) {
      const oldChunks = parseInt(oldChunksStr, 10);
      for (let i = 0; i < oldChunks; i++) await AsyncStorage.removeItem(`${key}_CHUNK_${i}`);
    }
    
    // Băm nhỏ và lưu
    const totalChunks = Math.ceil(dataArray.length / CHUNK_SIZE);
    await AsyncStorage.setItem(`${key}_CHUNKS`, String(totalChunks));
    
    for (let i = 0; i < totalChunks; i++) {
      const chunk = dataArray.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
      await AsyncStorage.setItem(`${key}_CHUNK_${i}`, JSON.stringify(chunk));
    }
  } catch (e) {
    console.error("Lỗi Chunking Set Storage:", e);
  }
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
    // Fallback cho dữ liệu cũ chưa dùng Chunking
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error("Lỗi Chunking Get Storage:", e);
    return null;
  }
};

// ============================================================================
// DANH SÁCH TAB & TEMPLATES
// ============================================================================
const DANH_SACH_TAB = [
  { id: 'DANH_MUC_ICD10', ten: 'Danh mục ICD-10' }, 
  { id: 'THONG_TIN_CO_SO', ten: 'Thông tin Cơ sở' },
  { id: 'DANH_MUC_KHOA_LS_M01', ten: 'Mẫu 01 (Khoa/Giường)' },
  { id: 'DANH_MUC_NHAN_SU', ten: 'Mẫu 02 (Nhân sự)' },
  { id: 'DANH_MUC_THUOC_MAU_M03', ten: 'Mẫu 03 (Thuốc/Máu)' },
  { id: 'DANH_MUC_VAT_TU_M04', ten: 'Mẫu 04 (Vật tư)' },
  { id: 'DANH_MUC_DVKT_M05', ten: 'Mẫu 05 (DVKT)' },
  { id: 'DANH_MUC_TRANG_THIET_BI_M06', ten: 'Mẫu 06 (Thiết bị)' },
  { id: 'DANH_MUC_HA_TANG', ten: 'Hạ tầng (JCI)' },
];

const MAU_EXCEL_CHUAN = {
  DANH_MUC_ICD10: ['MÃ BỆNH', 'MÃ BỆNH KHÔNG DẤU', 'DISEASE NAME', 'TÊN BỆNH'],
  THONG_TIN_CO_SO: ['MA_CSKCB', 'TEN_CSKCB', 'DIA_CHI', 'TUYEN', 'HANG'],
  DANH_MUC_KHOA_LS_M01: ['STT', 'MA_KHOA', 'TEN_KHOA', 'BAN_KHAM', 'GIUONG_PD', 'GIUONG_TK', 'GIUONG_HSTC', 'GIUONG_HSCC', 'TU_NGAY', 'DEN_NGAY', 'MA_CSKCB'],
  DANH_MUC_NHAN_SU: ['STT', 'MA_KHOA', 'TEN_KHOA', 'MA_BHXH', 'HO_TEN', 'GIOI_TINH', 'CHUC_DANH', 'MA_CDNN', 'TEN_CDNN', 'VI_TRI', 'MACCHN', 'NGAYCAP_CCHN', 'NOICAP_CCHN', 'PHAMVI_CM', 'PHAMVI_CMBS', 'DVKT_KHAC', 'VB_PHANCONG', 'THOIGIAN_DK', 'THOIGIAN_NGAY', 'THOIGIAN_TUAN', 'CSKCB_KHAC', 'QD_CGKT', 'TU_NGAY', 'DEN_NGAY', 'MA_CSKCB'],
  DANH_MUC_THUOC_MAU_M03: ['STT', 'MA_THUOC', 'TEN_HOAT_CHAT', 'TEN_THUOC', 'DON_VI_TINH', 'HAM_LUONG', 'DUONG_DUNG', 'MA_DUONG_DUNG', 'DANG_BAO_CHE', 'SO_DANG_KY', 'QUY_CACH', 'DON_GIA', 'DON_GIA_TT', 'GIA_BH_TT', 'TT_THAU', 'TYLE_TT_BH', 'LOAI_THUOC', 'LOAI_THAU', 'NHA_SX', 'NUOC_SX', 'NHA_THAU', 'KIEU_THAU', 'GIA_KHOA_KHO', 'GIA_BB_CD', 'PP_CHEBIEN', 'VITRI_YHCT', 'MA_CSKCB_THUOC', 'TU_NGAY', 'DEN_NGAY', 'MA_CSKCB'],
  DANH_MUC_VAT_TU_M04: ['STT', 'MA_VAT_TU', 'NHOM_VAT_TU', 'TEN_VAT_TU', 'MA_HIEU', 'SO_LUU_HANH', 'TINHNANG_KT', 'QUY_CACH', 'DON_VI_TINH', 'DON_GIA', 'GIA_BH_TT', 'TT_THAU', 'TYLE_TT_BH', 'LOAI_THAU', 'NHA_SX', 'NUOC_SX', 'NHA_THAU', 'NHA_PP', 'TU_NGAY', 'DEN_NGAY', 'MA_CSKCB'],
  DANH_MUC_DVKT_M05: ['STT', 'MA_DICH_VU', 'TEN_DICH_VU', 'TEN_DVKT_GIA', 'DON_GIA', 'QUY_TRINH', 'CS_THUCHIEN', 'TINHTRANG_DV', 'MA_GIA', 'TEN_GIA', 'GIA_TT_BHYT', 'MA_PTTT', 'TU_NGAY', 'DEN_NGAY', 'MA_CSKCB'],
  DANH_MUC_TRANG_THIET_BI_M06: ['STT', 'TEN_TB', 'KY_HIEU', 'CONGTY_SX', 'NUOC_SX', 'NAM_SX', 'NAM_SD', 'MA_MAY', 'SO_LUU_HANH', 'HD_TU', 'HD_DEN', 'TU_NGAY', 'DEN_NGAY', 'MA_CSKCB'],
  DANH_MUC_HA_TANG: ['MA_TIEU_CHI', 'TEN_TIEU_CHI', 'TRANG_THAI', 'GHI_CHU']
};

const ManHinhQuanLyDanhMuc = ({ navigation }) => {
  const [danhMucHienTai, setDanhMucHienTai] = useState(DANH_SACH_TAB[0].id); 
  const [columns, setColumns] = useState([]);
  const [data, setData] = useState([]);
  const [newColumnName, setNewColumnName] = useState('');

  // KHÓA AN TOÀN AUTO-SAVE: Chỉ bật khi dữ liệu từ DB đã được đẩy lên UI hoàn tất
  const isReadyToSave = useRef(false);

  // 1. PHỤC HỒI TAB ĐANG LÀM VIỆC KHI REFRESH
  useEffect(() => {
    const khoiTao = async () => {
      try {
        const tabLuuTru = await AsyncStorage.getItem('TAB_DANG_MO');
        if (tabLuuTru) setDanhMucHienTai(tabLuuTru);
      } catch (error) { console.error(error); }
    };
    khoiTao();
  }, []);

  // 2. NẠP DỮ LIỆU TỪ KHO VẬT LÝ
  useEffect(() => {
    const napDuLieu = async () => {
      isReadyToSave.current = false; // Khóa Auto-save
      try {
        const parsedData = await safeGetStorage(danhMucHienTai);
        const rawCols = await AsyncStorage.getItem(`COLS_${danhMucHienTai}`);
        
        let finalData = parsedData;
        if (!finalData && KhoDuLieu && KhoDuLieu.dongBoTuBoNho) {
          await KhoDuLieu.dongBoTuBoNho();
          finalData = KhoDuLieu.layDanhMuc(danhMucHienTai);
        }

        finalData = finalData || [];
        setData(finalData);

        if (rawCols) {
          setColumns(JSON.parse(rawCols));
        } else if (finalData.length > 0) {
          setColumns(Object.keys(finalData[0]));
        } else {
          setColumns(MAU_EXCEL_CHUAN[danhMucHienTai] || []);
        }
      } catch (e) {
        console.warn("Lỗi đọc Kho dữ liệu: ", e);
      } finally {
        setTimeout(() => { isReadyToSave.current = true; }, 500); // Mở khóa sau khi UI render xong
      }
    };

    napDuLieu();
  }, [danhMucHienTai]);

  // 3. AUTO-SAVE (SỬ DỤNG CHUNKING STORAGE)
  useEffect(() => {
    if (!isReadyToSave.current) return;

    const saveTimer = setTimeout(async () => {
      try {
        await safeSetStorage(danhMucHienTai, data);
        await AsyncStorage.setItem(`COLS_${danhMucHienTai}`, JSON.stringify(columns));
        
        if (KhoDuLieu && KhoDuLieu.capNhatDanhMuc) {
          await KhoDuLieu.capNhatDanhMuc(danhMucHienTai, data);
        }
      } catch (e) {
        console.error("Lỗi Auto-Save danh mục:", e);
      }
    }, 1000);

    return () => clearTimeout(saveTimer);
  }, [data, columns, danhMucHienTai]);

  const chuyenTab = async (id) => {
    setDanhMucHienTai(id);
    await AsyncStorage.setItem('TAB_DANG_MO', id);
  };

  const handleAddColumn = () => {
    if (!newColumnName) return alert("Vui lòng nhập tên trường thông tin mới!");
    const columnName = newColumnName.trim().toUpperCase().replace(/ /g, '_');
    if (columns.includes(columnName)) return alert("Trường thông tin này đã tồn tại!");
    setColumns([...columns, columnName]);
    setNewColumnName('');
  };

  const handleAddRow = () => {
    if (columns.length === 0) return alert("Vui lòng thêm ít nhất một cột trước!");
    const newRow = {};
    columns.forEach(col => newRow[col] = "");
    setData([newRow, ...data]); 
  };

  const handleDeleteRow = (index) => {
    if (Platform.OS === 'web' && !window.confirm("Bác sĩ có chắc chắn muốn xóa dòng này?")) return;
    const newData = [...data];
    newData.splice(index, 1);
    setData(newData);
  };

  const handleCellChange = (text, rowIndex, colName) => {
    const newData = [...data];
    newData[rowIndex][colName] = text;
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

  // 4. XỬ LÝ IMPORT EXCEL (KÈM LƯU VẬT LÝ BẰNG CHUNKING)
  const handleImportExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const importedData = XLSX.utils.sheet_to_json(ws, { defval: "" });
      
      if (importedData.length > 0) {
        const mergedCols = [...new Set([...columns, ...Object.keys(importedData[0])])];
        const newData = [...importedData, ...data];
        
        setColumns(mergedCols);
        setData(newData);

        try {
          await safeSetStorage(danhMucHienTai, newData);
          await AsyncStorage.setItem(`COLS_${danhMucHienTai}`, JSON.stringify(mergedCols));
          if (KhoDuLieu && KhoDuLieu.capNhatDanhMuc) {
            await KhoDuLieu.capNhatDanhMuc(danhMucHienTai, newData);
          }
          alert(`✅ Đã Import thành công ${importedData.length} dòng dữ liệu. Hệ thống đã băm nhỏ và lưu vĩnh viễn!`);
        } catch (err) {
          alert("❌ Lỗi lưu khi import: " + err.message);
        }
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = null; 
  };

  return (
    <SafeAreaView style={styles.vung_an_toan}>
      <View style={styles.thanh_tieu_de}>
        <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.nut_quay_lai}>
          <Text style={styles.chu_nut_header}>⬅ TRỞ VỀ TỔNG QUAN</Text>
        </TouchableOpacity>
        <Text style={styles.chu_tieu_de}>🗄️ QUẢN LÝ DANH MỤC (MASTER DATA)</Text>
        <View style={{ width: 180 }} />
      </View>

      <View style={styles.khung_chuc_nang}>
        
        {/* THANH TAB ĐIỀU HƯỚNG */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.khung_tab}>
          {DANH_SACH_TAB.map(tab => (
            <TouchableOpacity 
              key={tab.id} 
              onPress={() => chuyenTab(tab.id)} 
              style={[
                styles.nut_tab, 
                danhMucHienTai === tab.id && styles.nut_tab_active,
                tab.id === 'DANH_MUC_ICD10' && styles.nut_tab_dac_biet
              ]}
            >
              <Text style={[
                styles.chu_tab, 
                danhMucHienTai === tab.id && styles.chu_tab_active,
                tab.id === 'DANH_MUC_ICD10' && styles.chu_tab_dac_biet
              ]}>
                {tab.ten}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.thanh_cong_cu}>
          <View style={styles.khoi_them_cot}>
            <TextInput style={styles.o_nhap_cot} placeholder="Tên cột (VD: MA_KHOA)" value={newColumnName} onChangeText={setNewColumnName} outlineStyle="none" />
            <TouchableOpacity style={styles.nut_xanh} onPress={handleAddColumn}>
              <Text style={styles.chu_nut}>+ THÊM CỘT</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.khoi_hanh_dong}>
            <TouchableOpacity style={styles.nut_xanh_la} onPress={handleTaiFileMau}>
              <Text style={styles.chu_nut}>⬇ TẢI FILE MẪU</Text>
            </TouchableOpacity>
            
            {Platform.OS === 'web' && (
              <React.Fragment>
                <input type="file" accept=".xlsx, .xls, .csv" onChange={handleImportExcel} style={{ display: 'none' }} id="import-excel-danhmuc" />
                <TouchableOpacity style={styles.nut_cam} onPress={() => document.getElementById('import-excel-danhmuc').click()}>
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

            <TouchableOpacity style={styles.nut_do} onPress={() => alert(`Đang hiển thị ${data.length} dòng. Hệ thống tự động ghi nhớ mọi thay đổi!`)}>
              <Text style={styles.chu_nut}>💾 ĐÃ TỰ LƯU</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* BẢNG DỮ LIỆU ĐỘNG FULLSCREEN */}
        <View style={styles.khung_bang_master}>
          <ScrollView horizontal style={styles.scroll_ngang}>
            <View style={styles.bang_chinh}>
              <View style={styles.dong_tieu_de}>
                <View style={[styles.o_tieu_de, { width: 90 }]}><Text style={styles.chu_o_tieu_de}>STT</Text></View>
                {columns.map((col, index) => {
                  const rongCot = (col.includes('TEN') || col.includes('NAME') || col.includes('GHI_CHU')) ? 480 : 220;
                  return (
                    <View key={index} style={[styles.o_tieu_de, { width: rongCot }]}>
                      <Text style={styles.chu_o_tieu_de}>{col}</Text>
                    </View>
                  );
                })}
                <View style={[styles.o_tieu_de, { width: 160 }]}><Text style={styles.chu_o_tieu_de}>THAO TÁC</Text></View>
              </View>

              <ScrollView showsVerticalScrollIndicator={true} style={styles.scroll_doc}>
                {data.map((row, rowIndex) => (
                  <View key={rowIndex} style={[styles.dong_du_lieu, { backgroundColor: rowIndex % 2 === 0 ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.01)' }]}>
                    <View style={[styles.o_du_lieu_stt, { width: 90 }]}>
                      <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#F48FB1' }}>{rowIndex + 1}</Text>
                    </View>
                    {columns.map((col, colIndex) => {
                      const rongCot = (col.includes('TEN') || col.includes('NAME') || col.includes('GHI_CHU')) ? 480 : 220;
                      return (
                        <TextInput
                          key={colIndex}
                          style={[styles.o_du_lieu, { width: rongCot }]}
                          value={String(row[col] || '')}
                          onChangeText={(text) => handleCellChange(text, rowIndex, col)}
                          multiline
                          outlineStyle="none"
                        />
                      );
                    })}
                    <View style={[styles.o_thao_tac, { width: 160 }]}>
                      <TouchableOpacity onPress={() => handleDeleteRow(rowIndex)} style={styles.nut_xoa}>
                        <Text style={styles.chu_nut_xoa}>Xóa</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
                {data.length === 0 && (
                  <Text style={styles.txt_trong}>
                    Danh mục đang trống. Bác sĩ có thể Bấm "TẢI FILE MẪU" rồi "IMPORT EXCEL" để nạp dữ liệu.
                  </Text>
                )}
                <View style={{ height: 100 }} />
              </ScrollView>
            </View>
          </ScrollView>
        </View>

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  vung_an_toan: {
    flex: 1,
    backgroundColor: CD.bg.gradient_mobile,
    ...Platform.select({ web: { background: CD.web.gradient_bg } }),
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
    ...Platform.select({ web: { background: CD.web.gradient_header, backdropFilter: CD.web.blur_header, boxShadow: CD.web.shadow_header } }),
  },
  nut_quay_lai: {
    padding: 12,
    backgroundColor: CD.bg.glass_input,
    borderWidth: 1,
    borderColor: CD.border.glass_md,
    borderRadius: 14,
  },
  chu_nut_header: { color: CD.text.primary, fontWeight: 'bold', fontSize: 20, fontFamily: CD.font.family },
  chu_tieu_de: { fontSize: 26, color: CD.text.primary, fontWeight: 'bold', fontFamily: CD.font.family },

  khung_chuc_nang: { padding: 25, flex: 1 },

  // TABS STYLE
  khung_tab: { flexDirection: 'row', marginBottom: 25, maxHeight: 65 },
  nut_tab: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: CD.bg.glass_card,
    marginRight: 15,
    borderRadius: 10,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: CD.border.glass,
  },
  nut_tab_active: {
    backgroundColor: CD.brand.mauChinh,
    borderWidth: 0,
    ...Platform.select({ web: { background: CD.web.gradient_primary, boxShadow: CD.web.shadow_btn } }),
  },
  // Tab ICD-10 đặc biệt: dùng glass border accent xanh lam
  nut_tab_dac_biet: {
    borderWidth: 2,
    borderColor: 'rgba(100,181,246,0.5)',
    backgroundColor: 'rgba(25,118,210,0.15)',
  },
  chu_tab: { fontSize: 20, color: CD.text.secondary, fontWeight: 'bold', fontFamily: CD.font.family },
  chu_tab_active: { color: CD.text.primary },
  chu_tab_dac_biet: { color: CD.text.link },

  thanh_cong_cu: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25, flexWrap: 'wrap', alignItems: 'center' },
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
    width: 280,
    marginRight: 15,
    fontFamily: CD.font.family,
    ...Platform.select({ web: { backdropFilter: CD.web.blur_input, outlineStyle: 'none' } }),
  },
  khoi_hanh_dong: { flexDirection: 'row', gap: 15 },

  // "+ THÊM CỘT" → primary button
  nut_xanh: {
    backgroundColor: CD.brand.mauChinh,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({ web: { background: CD.web.gradient_primary, boxShadow: CD.web.shadow_btn, cursor: CD.web.cursor_pointer } }),
  },
  // TẢI FILE MẪU → green button
  nut_xanh_la: {
    backgroundColor: '#388E3C',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    justifyContent: 'center',
    ...Platform.select({ web: { background: CD.web.gradient_green, boxShadow: CD.web.shadow_btn_green, cursor: CD.web.cursor_pointer } }),
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
    ...Platform.select({ web: { background: CD.web.gradient_green, boxShadow: CD.web.shadow_btn_green, cursor: CD.web.cursor_pointer } }),
  },
  // + THÊM DÒNG → primary button
  nut_hong: {
    backgroundColor: CD.brand.mauChinh,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({ web: { background: CD.web.gradient_primary, boxShadow: CD.web.shadow_btn, cursor: CD.web.cursor_pointer } }),
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
  scroll_ngang: { flex: 1 },
  bang_chinh: { flex: 1 },

  dong_tieu_de: { flexDirection: 'row', backgroundColor: '#BBDEFB', borderBottomWidth: 2, borderColor: '#1976D2' },
  o_tieu_de: { padding: 18, borderRightWidth: 1, borderColor: CD.border.divider, justifyContent: 'center' },
  chu_o_tieu_de: { fontWeight: '700', fontSize: 20, color: '#000000', fontFamily: CD.font.family, textAlign: 'center' },

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
    fontSize: 20,
    color: CD.text.table_cell,
    fontFamily: CD.font.family,
    lineHeight: 28,
    backgroundColor: CD.bg.glass_input,
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
  txt_trong: { padding: 40, fontSize: 22, fontStyle: 'italic', color: CD.text.muted, textAlign: 'center', fontFamily: CD.font.family }
});

export default ManHinhQuanLyDanhMuc;