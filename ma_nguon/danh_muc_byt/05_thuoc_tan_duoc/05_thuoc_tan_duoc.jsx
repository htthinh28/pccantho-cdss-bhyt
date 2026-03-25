/**
 * ============================================================
 * FILE: danh_muc_byt/05_thuoc_tan_duoc/05_thuoc_tan_duoc.jsx
 * MỤC ĐÍCH: Quản lý Phụ lục 5 (Danh mục mã thuốc tân dược) - QĐ 7603/QĐ-BYT
 * TÍNH NĂNG: Full CRUD, Dynamic Columns (No-code), Auto-save, Excel In/Out
 * CẬP NHẬT: Chuẩn hóa 12 trường dữ liệu bắt buộc theo cấu trúc của Bộ Y tế.
 * ============================================================
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as XLSX from 'xlsx';

const STORAGE_KEY = '@DM_BYT_PL05_V2'; // Cập nhật key để tránh xung đột với data cũ

const PhuLuc05Thuoc = () => {
  // --- STATE QUẢN LÝ DỮ LIỆU ---
  const [data, setData] = useState([]);
  const [customFields, setCustomFields] = useState([]); 
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  
  const [newFieldName, setNewFieldName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  // --- 1. KHỞI TẠO & AUTO-SAVE ---
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setData(parsed.data || []);
        setCustomFields(parsed.fields || []);
      }
    } catch (error) {
      console.error('Lỗi tải dữ liệu PL5:', error);
    }
  };

  const autoSaveToStorage = async (newData, newFields) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ data: newData, fields: newFields }));
    } catch (error) {
      console.error('Lỗi Auto-save PL5:', error);
    }
  };

  const updateDataAndSave = (newData) => {
    setData(newData);
    autoSaveToStorage(newData, customFields);
  };

  // --- 2. THÊM TRƯỜNG DỮ LIỆU ĐỘNG (DYNAMIC COLUMNS) ---
  const handleAddCustomField = () => {
    const fieldName = newFieldName.trim().toUpperCase().replace(/\s+/g, '_');
    if (!fieldName) return Alert.alert("Lỗi", "Nhập tên cột (VD: MA_HIS, GIA_THAU)");
    if (customFields.includes(fieldName)) return Alert.alert("Lỗi", "Trường dữ liệu này đã tồn tại!");

    const updatedFields = [...customFields, fieldName];
    const updatedData = data.map(item => ({ ...item, [fieldName]: '' }));
    
    setCustomFields(updatedFields);
    setData(updatedData);
    autoSaveToStorage(updatedData, updatedFields);
    setNewFieldName('');
  };

  const handleDeleteCustomField = (fieldName) => {
    Alert.alert("Cảnh báo", `Xóa cột [${fieldName}] và toàn bộ dữ liệu cột này?`, [
      { text: "Hủy", style: "cancel" },
      { 
        text: "Xóa", style: 'destructive', 
        onPress: () => {
          const updatedFields = customFields.filter(f => f !== fieldName);
          const updatedData = data.map(item => {
            const newItem = { ...item };
            delete newItem[fieldName];
            return newItem;
          });
          setCustomFields(updatedFields);
          updateDataAndSave(updatedData);
        }
      }
    ]);
  };

  // --- 3. CRUD ---
  const handleDelete = (id) => {
    updateDataAndSave(data.filter(item => item.id !== id));
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    Alert.alert("Xóa hàng loạt", `Xóa ${selectedIds.length} bản ghi?`, [
      { text: "Hủy", style: "cancel" },
      { 
        text: "Xóa", style: 'destructive', 
        onPress: () => {
          updateDataAndSave(data.filter(item => !selectedIds.includes(item.id)));
          setSelectedIds([]);
        }
      }
    ]);
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditForm({ ...item });
  };

  const saveEdit = () => {
    const updatedData = data.map(item => item.id === editingId ? editForm : item);
    updateDataAndSave(updatedData);
    setEditingId(null);
    setEditForm({});
  };

  // --- 4. EXCEL IMPORT / EXPORT ---
  const handleDownloadTemplate = () => {
    Alert.alert("File Mẫu", "Dùng file Excel với các cột: STT, SO_DANG_KY, TEN_THUOC, MA_HOAT_CHAT, HOAT_CHAT, HOAT_CHAT\\n(Theo Số đăng ký), MA_DUONG_DUNG, DUONG_DUNG, HAM_LUONG, DONG_GOI, HANG_SX, NUOC_SX");
  };

  const handleImportExcel = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: '*/*' });
      if (result.canceled) return;
      const fileString = await FileSystem.readAsStringAsync(result.assets[0].uri, { encoding: FileSystem.EncodingType.Base64 });
      const workbook = XLSX.read(fileString, { type: 'base64' });
      const parsedData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
      
      const mergedData = [...data, ...parsedData.map((item, idx) => ({
        id: item['SO_DANG_KY'] || item['SO_DANG_KY\n(ma_thuoc)'] || Date.now().toString() + idx,
        stt: item['STT'] || (idx + 1),
        so_dang_ky: item['SO_DANG_KY'] || item['SO_DANG_KY\n(ma_thuoc)'] || '',
        ten_thuoc: item['TEN_THUOC'] || '',
        ma_hoat_chat: item['MA_HOAT_CHAT'] || item['MA_HOAT_CHAT\n(Theo Thông tư số 30/2018/TTBYT)'] || '',
        hoat_chat: item['HOAT_CHAT'] || '',
        hoat_chat_sdk: item['HOAT_CHAT\n(Theo Số đăng ký)'] || item['HOAT_CHAT (Theo Số đăng ký)'] || '',
        ma_duong_dung: item['MA_DUONG_DUNG'] || '',
        duong_dung: item['DUONG_DUNG'] || '',
        ham_luong: item['HAM_LUONG'] || '',
        dong_goi: item['DONG_GOI'] || '',
        hang_sx: item['HANG_SX'] || '',
        nuoc_sx: item['NUOC_SX'] || '',
        // Tự động map dữ liệu vào các cột Custom
        ...customFields.reduce((acc, field) => ({ ...acc, [field]: item[field] || '' }), {})
      }))].filter(item => item.so_dang_ky !== ''); // Loại bỏ các dòng trống không có mã
      
      // Lọc trùng theo Số đăng ký
      const uniqueData = Array.from(new Map(mergedData.map(item => [item.so_dang_ky, item])).values());
      updateDataAndSave(uniqueData);
      Alert.alert("Thành công", `Đã import ${uniqueData.length} dòng và lưu tự động.`);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể đọc file Excel. Định dạng không hợp lệ.");
    }
  };

  const handleExportExcel = () => {
    try {
      // Ánh xạ lại đúng cấu trúc cột Excel chuẩn
      const exportData = data.map((item, idx) => {
        const row = {
          'STT': item.stt || idx + 1,
          'SO_DANG_KY': item.so_dang_ky,
          'TEN_THUOC': item.ten_thuoc,
          'MA_HOAT_CHAT': item.ma_hoat_chat,
          'HOAT_CHAT': item.hoat_chat,
          'HOAT_CHAT\n(Theo Số đăng ký)': item.hoat_chat_sdk,
          'MA_DUONG_DUNG': item.ma_duong_dung,
          'DUONG_DUNG': item.duong_dung,
          'HAM_LUONG': item.ham_luong,
          'DONG_GOI': item.dong_goi,
          'HANG_SX': item.hang_sx,
          'NUOC_SX': item.nuoc_sx
        };
        customFields.forEach(f => { row[f] = item[f]; });
        return row;
      });

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "05_thuoc_tan_duoc");
      Alert.alert("Thành công", "Đã xuất dữ liệu ra file Excel.");
    } catch (error) {
      Alert.alert("Lỗi", "Không thể xuất file.");
    }
  };

  // --- RENDER TABLE ROW ---
  const renderItem = ({ item, index }) => {
    const isEditing = editingId === item.id;
    return (
      <View style={styles.row}>
        <TouchableOpacity onPress={() => setSelectedIds(prev => prev.includes(item.id) ? prev.filter(i => i !== item.id) : [...prev, item.id])} style={styles.cellChk}>
          <Text style={{fontWeight: 'bold'}}>{selectedIds.includes(item.id) ? '☑' : '☐'}</Text>
        </TouchableOpacity>
        
        <Text style={[styles.cell, { flex: 0.5, textAlign: 'center' }]}>{item.stt || index + 1}</Text>

        {isEditing ? (
          <React.Fragment>
            <TextInput style={[styles.cellEdit, { flex: 1.5 }]} value={editForm.so_dang_ky} onChangeText={(t) => setEditForm({...editForm, so_dang_ky: t})} />
            <TextInput style={[styles.cellEdit, { flex: 2 }]} value={editForm.ten_thuoc} onChangeText={(t) => setEditForm({...editForm, ten_thuoc: t})} multiline />
            <TextInput style={[styles.cellEdit, { flex: 1.2 }]} value={editForm.ma_hoat_chat} onChangeText={(t) => setEditForm({...editForm, ma_hoat_chat: t})} />
            <TextInput style={[styles.cellEdit, { flex: 2 }]} value={editForm.hoat_chat} onChangeText={(t) => setEditForm({...editForm, hoat_chat: t})} multiline />
            <TextInput style={[styles.cellEdit, { flex: 2 }]} value={editForm.hoat_chat_sdk} onChangeText={(t) => setEditForm({...editForm, hoat_chat_sdk: t})} multiline />
            <TextInput style={[styles.cellEdit, { flex: 1 }]} value={editForm.ma_duong_dung} onChangeText={(t) => setEditForm({...editForm, ma_duong_dung: t})} />
            <TextInput style={[styles.cellEdit, { flex: 1.5 }]} value={editForm.duong_dung} onChangeText={(t) => setEditForm({...editForm, duong_dung: t})} />
            <TextInput style={[styles.cellEdit, { flex: 1.2 }]} value={editForm.ham_luong} onChangeText={(t) => setEditForm({...editForm, ham_luong: t})} />
            <TextInput style={[styles.cellEdit, { flex: 1.2 }]} value={editForm.dong_goi} onChangeText={(t) => setEditForm({...editForm, dong_goi: t})} />
            <TextInput style={[styles.cellEdit, { flex: 1.5 }]} value={editForm.hang_sx} onChangeText={(t) => setEditForm({...editForm, hang_sx: t})} />
            <TextInput style={[styles.cellEdit, { flex: 1.2 }]} value={editForm.nuoc_sx} onChangeText={(t) => setEditForm({...editForm, nuoc_sx: t})} />
            
            {customFields.map(field => (
              <TextInput 
                key={field} 
                style={[styles.cellEdit, { flex: 1.5 }]} 
                value={editForm[field]?.toString()} 
                onChangeText={(t) => setEditForm({...editForm, [field]: t})} 
              />
            ))}
            <View style={styles.actions}>
              <TouchableOpacity style={styles.btnSave} onPress={saveEdit}>
                <Text style={styles.txtBtn}>Lưu</Text>
              </TouchableOpacity>
            </View>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <Text style={[styles.cell, { flex: 1.5, color: '#1565C0', fontWeight: 'bold' }]}>{item.so_dang_ky}</Text>
            <Text style={[styles.cell, { flex: 2, fontWeight: '500' }]}>{item.ten_thuoc}</Text>
            <Text style={[styles.cell, { flex: 1.2, color: '#D84315' }]}>{item.ma_hoat_chat}</Text>
            <Text style={[styles.cell, { flex: 2 }]}>{item.hoat_chat}</Text>
            <Text style={[styles.cell, { flex: 2, fontStyle: 'italic', color: '#555' }]}>{item.hoat_chat_sdk}</Text>
            <Text style={[styles.cell, { flex: 1, color: '#2E7D32', fontWeight: 'bold', textAlign: 'center' }]}>{item.ma_duong_dung}</Text>
            <Text style={[styles.cell, { flex: 1.5 }]}>{item.duong_dung}</Text>
            <Text style={[styles.cell, { flex: 1.2 }]}>{item.ham_luong}</Text>
            <Text style={[styles.cell, { flex: 1.2 }]}>{item.dong_goi}</Text>
            <Text style={[styles.cell, { flex: 1.5 }]}>{item.hang_sx}</Text>
            <Text style={[styles.cell, { flex: 1.2 }]}>{item.nuoc_sx}</Text>

            {customFields.map(field => (
              <Text key={field} style={[styles.cell, { flex: 1.5 }]}>{item[field]}</Text>
            ))}
            <View style={styles.actions}>
              <TouchableOpacity style={styles.btnEdit} onPress={() => startEdit(item)}>
                <Text style={styles.txtBtn}>Sửa</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnDel} onPress={() => handleDelete(item.id)}>
                <Text style={styles.txtBtn}>Xóa</Text>
              </TouchableOpacity>
            </View>
          </React.Fragment>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>PHỤ LỤC 5 - DANH MỤC THUỐC TÂN DƯỢC (QĐ 7603)</Text>
      
      {/* TOOLBAR */}
      <View style={styles.toolbar}>
        <TouchableOpacity style={styles.btnPrimary} onPress={handleImportExcel}><Text style={styles.txtBtn}>📥 Import</Text></TouchableOpacity>
        <TouchableOpacity style={styles.btnPrimary} onPress={handleExportExcel}><Text style={styles.txtBtn}>📤 Export</Text></TouchableOpacity>
        <TouchableOpacity style={styles.btnInfo} onPress={handleDownloadTemplate}><Text style={styles.txtBtn}>📄 Mẫu</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.btnDel, { opacity: selectedIds.length ? 1 : 0.5 }]} onPress={handleBulkDelete}>
          <Text style={styles.txtBtn}>🗑 Xóa ({selectedIds.length})</Text>
        </TouchableOpacity>
        
        <View style={styles.addFieldZone}>
          <TextInput style={styles.inputField} placeholder="VD: MA_HIS, QUY_CACH..." value={newFieldName} onChangeText={setNewFieldName} />
          <TouchableOpacity style={styles.btnAddField} onPress={handleAddCustomField}><Text style={styles.txtBtn}>+ Thêm Cột</Text></TouchableOpacity>
        </View>
      </View>

      <TextInput style={styles.search} placeholder="Tra cứu số đăng ký, tên thuốc, mã hoạt chất..." value={searchQuery} onChangeText={setSearchQuery} />

      {/* TABLE */}
      <ScrollView horizontal>
        {/* Nới rộng minWidth ra 1800 để chứa đủ 12 trường dữ liệu mà không bị bóp méo */}
        <View style={{ minWidth: 1800 }}> 
          <View style={styles.headerRow}>
            <Text style={styles.cellChk}></Text>
            <Text style={[styles.headerCell, { flex: 0.5, textAlign: 'center' }]}>STT</Text>
            <Text style={[styles.headerCell, { flex: 1.5 }]}>SỐ ĐĂNG KÝ (MÃ)</Text>
            <Text style={[styles.headerCell, { flex: 2 }]}>TÊN THUỐC</Text>
            <Text style={[styles.headerCell, { flex: 1.2 }]}>MÃ HOẠT CHẤT</Text>
            <Text style={[styles.headerCell, { flex: 2 }]}>HOẠT CHẤT</Text>
            <Text style={[styles.headerCell, { flex: 2 }]}>H.CHẤT (Theo SĐK)</Text>
            <Text style={[styles.headerCell, { flex: 1, textAlign: 'center' }]}>MÃ ĐƯỜNG</Text>
            <Text style={[styles.headerCell, { flex: 1.5 }]}>ĐƯỜNG DÙNG</Text>
            <Text style={[styles.headerCell, { flex: 1.2 }]}>HÀM LƯỢNG</Text>
            <Text style={[styles.headerCell, { flex: 1.2 }]}>ĐÓNG GÓI</Text>
            <Text style={[styles.headerCell, { flex: 1.5 }]}>HÃNG SX</Text>
            <Text style={[styles.headerCell, { flex: 1.2 }]}>NƯỚC SX</Text>
            
            {/* Cột Custom */}
            {customFields.map(field => (
              <TouchableOpacity key={field} style={{ flex: 1.5, flexDirection: 'row', alignItems: 'center' }} onLongPress={() => handleDeleteCustomField(field)}>
                <Text style={[styles.headerCell, { color: '#C62828' }]}>{field} ✎</Text>
              </TouchableOpacity>
            ))}
            <Text style={styles.actions}></Text>
          </View>

          <FlatList
            data={data.filter(item => JSON.stringify(item).toLowerCase().includes(searchQuery.toLowerCase()))}
            keyExtractor={item => item.id.toString()}
            renderItem={renderItem}
            initialNumToRender={20}
            maxToRenderPerBatch={20}
            windowSize={5}
            ListEmptyComponent={<Text style={styles.empty}>Chưa có dữ liệu. Vui lòng import file Excel Danh mục thuốc.</Text>}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF', padding: 10 },
  title: { fontSize: 16, fontWeight: 'bold', color: '#0277BD', marginBottom: 10, textTransform: 'uppercase' },
  toolbar: { flexDirection: 'row', gap: 8, marginBottom: 10, flexWrap: 'wrap', alignItems: 'center' },
  btnPrimary: { backgroundColor: '#4CAF50', padding: 8, borderRadius: 4 },
  btnInfo: { backgroundColor: '#0288D1', padding: 8, borderRadius: 4 },
  btnDel: { backgroundColor: '#D32F2F', padding: 8, borderRadius: 4 },
  btnEdit: { backgroundColor: '#F57C00', padding: 6, borderRadius: 4, marginRight: 5 },
  btnSave: { backgroundColor: '#1976D2', padding: 6, borderRadius: 4 },
  txtBtn: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
  addFieldZone: { flexDirection: 'row', marginLeft: 'auto', gap: 5 },
  inputField: { borderWidth: 1, borderColor: '#B0BEC5', borderRadius: 4, paddingHorizontal: 8, height: 32, minWidth: 140 },
  btnAddField: { backgroundColor: '#C62828', justifyContent: 'center', paddingHorizontal: 10, borderRadius: 4 },
  search: { borderWidth: 1, borderColor: '#E0E0E0', padding: 8, borderRadius: 4, marginBottom: 10, backgroundColor: '#E1F5FE' },
  headerRow: { flexDirection: 'row', backgroundColor: '#B3E5FC', padding: 10, borderBottomWidth: 2, borderColor: '#0288D1' },
  headerCell: { fontWeight: 'bold', fontSize: 11, paddingHorizontal: 4, color: '#01579B' },
  row: { flexDirection: 'row', padding: 10, borderBottomWidth: 1, borderBottomColor: '#EEEEEE', alignItems: 'center' },
  cell: { fontSize: 12, paddingHorizontal: 4 },
  cellEdit: { borderWidth: 1, borderColor: '#0288D1', borderRadius: 4, backgroundColor: '#E1F5FE', padding: 4, marginHorizontal: 2, fontSize: 12 },
  cellChk: { width: 30, alignItems: 'center' },
  actions: { flexDirection: 'row', width: 90, justifyContent: 'flex-end' },
  empty: { textAlign: 'center', marginTop: 30, color: '#78909C', fontStyle: 'italic' }
});

export default PhuLuc05Thuoc;