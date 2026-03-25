/**
 * ============================================================
 * FILE: danh_muc_byt/06_thuoc_vi_thuoc_yhct/06_thuoc_vi_thuoc_yhct.jsx
 * MỤC ĐÍCH: Quản lý Phụ lục 6 (Thuốc và Vị thuốc YHCT) - QĐ 7603/QĐ-BYT
 * TÍNH NĂNG: Full CRUD, Dynamic Columns (No-code), Auto-save, Excel In/Out
 * ============================================================
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as XLSX from 'xlsx';

const STORAGE_KEY = '@DM_BYT_PL06_V1';

const PhuLuc06ThuocYHCT = () => {
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
      console.error('Lỗi tải dữ liệu PL6:', error);
    }
  };

  const autoSaveToStorage = async (newData, newFields) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ data: newData, fields: newFields }));
    } catch (error) {
      console.error('Lỗi Auto-save PL6:', error);
    }
  };

  const updateDataAndSave = (newData) => {
    setData(newData);
    autoSaveToStorage(newData, customFields);
  };

  // --- 2. THÊM TRƯỜNG DỮ LIỆU ĐỘNG (DYNAMIC COLUMNS) ---
  const handleAddCustomField = () => {
    const fieldName = newFieldName.trim().toUpperCase().replace(/\s+/g, '_');
    if (!fieldName) return Alert.alert("Lỗi", "Nhập tên cột (VD: MA_HIS, NGUON_GOC)");
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
    Alert.alert(
      "File Mẫu", 
      "File Excel cần các cột: SO_DANG_KY (hoặc Mã vị thuốc), TEN_THUOC, MA_HOAT_CHAT, MA_DUONG_DUNG. Bạn có thể tự thêm cột (VD: NGUON_GOC cho vị thuốc) bằng nút [+ Thêm Cột] trước khi Import."
    );
  };

  const handleImportExcel = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: '*/*' });
      if (result.canceled) return;
      const fileString = await FileSystem.readAsStringAsync(result.assets[0].uri, { encoding: FileSystem.EncodingType.Base64 });
      const workbook = XLSX.read(fileString, { type: 'base64' });
      const parsedData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
      
      const mergedData = [...data, ...parsedData.map((item, idx) => ({
        id: item['SO_DANG_KY'] || item['Mã'] || item['Mã vị thuốc'] || Date.now().toString() + idx,
        so_dang_ky: item['SO_DANG_KY'] || item['Mã'] || item['Mã vị thuốc'] || '',
        ten_thuoc: item['TEN_THUOC'] || item['Tên vị thuốc'] || '',
        ma_hoat_chat: item['MA_HOAT_CHAT\n(Theo CV 908/BYT-BH)'] || item['MA_HOAT_CHAT'] || '',
        ma_duong_dung: item['MA_DUONG_DUNG'] || '',
        // Tự động map dữ liệu vào các cột Custom (ví dụ: NGUON_GOC từ file Vị thuốc)
        ...customFields.reduce((acc, field) => ({ 
          ...acc, 
          [field]: item[field] || (item['Nguồn gốc'] && field === 'NGUON_GOC' ? item['Nguồn gốc'] : '') 
        }), {})
      }))].filter(item => item.so_dang_ky !== '' || item.ten_thuoc !== ''); // Bỏ qua dòng trống
      
      // Lọc trùng theo Số đăng ký / Mã vị thuốc
      const uniqueData = Array.from(new Map(mergedData.map(item => [item.so_dang_ky, item])).values());
      updateDataAndSave(uniqueData);
      Alert.alert("Thành công", `Đã import ${uniqueData.length} dòng và lưu tự động.`);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể đọc file Excel. Định dạng không hợp lệ.");
    }
  };

  const handleExportExcel = () => {
    try {
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "06_thuoc_vi_thuoc_yhct");
      Alert.alert("Thành công", "Đã xuất dữ liệu ra file Excel.");
    } catch (error) {
      Alert.alert("Lỗi", "Không thể xuất file.");
    }
  };

  // --- RENDER TABLE ROW ---
  const renderItem = ({ item }) => {
    const isEditing = editingId === item.id;
    return (
      <View style={styles.row}>
        <TouchableOpacity onPress={() => setSelectedIds(prev => prev.includes(item.id) ? prev.filter(i => i !== item.id) : [...prev, item.id])} style={styles.cellChk}>
          <Text style={{fontWeight: 'bold'}}>{selectedIds.includes(item.id) ? '☑' : '☐'}</Text>
        </TouchableOpacity>
        
        {isEditing ? (
          <React.Fragment>
            <TextInput style={[styles.cellEdit, { flex: 2 }]} value={editForm.so_dang_ky} onChangeText={(t) => setEditForm({...editForm, so_dang_ky: t})} />
            <TextInput style={[styles.cellEdit, { flex: 3 }]} value={editForm.ten_thuoc} onChangeText={(t) => setEditForm({...editForm, ten_thuoc: t})} multiline />
            <TextInput style={[styles.cellEdit, { flex: 1.5 }]} value={editForm.ma_hoat_chat} onChangeText={(t) => setEditForm({...editForm, ma_hoat_chat: t})} />
            <TextInput style={[styles.cellEdit, { flex: 1 }]} value={editForm.ma_duong_dung} onChangeText={(t) => setEditForm({...editForm, ma_duong_dung: t})} />
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
            <Text style={[styles.cell, { flex: 2, color: '#1565C0', fontWeight: 'bold' }]}>{item.so_dang_ky}</Text>
            <Text style={[styles.cell, { flex: 3, fontWeight: '500' }]}>{item.ten_thuoc}</Text>
            <Text style={[styles.cell, { flex: 1.5, color: '#D84315' }]}>{item.ma_hoat_chat}</Text>
            <Text style={[styles.cell, { flex: 1, color: '#2E7D32', fontWeight: 'bold', textAlign: 'center' }]}>{item.ma_duong_dung}</Text>
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
      <Text style={styles.title}>PHỤ LỤC 6 - CHẾ PHẨM & VỊ THUỐC YHCT (QĐ 7603)</Text>
      
      {/* TOOLBAR */}
      <View style={styles.toolbar}>
        <TouchableOpacity style={styles.btnPrimary} onPress={handleImportExcel}><Text style={styles.txtBtn}>📥 Import</Text></TouchableOpacity>
        <TouchableOpacity style={styles.btnPrimary} onPress={handleExportExcel}><Text style={styles.txtBtn}>📤 Export</Text></TouchableOpacity>
        <TouchableOpacity style={styles.btnInfo} onPress={handleDownloadTemplate}><Text style={styles.txtBtn}>📄 Mẫu</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.btnDel, { opacity: selectedIds.length ? 1 : 0.5 }]} onPress={handleBulkDelete}>
          <Text style={styles.txtBtn}>🗑 Xóa ({selectedIds.length})</Text>
        </TouchableOpacity>
        
        <View style={styles.addFieldZone}>
          <TextInput style={styles.inputField} placeholder="VD: NGUON_GOC..." value={newFieldName} onChangeText={setNewFieldName} />
          <TouchableOpacity style={styles.btnAddField} onPress={handleAddCustomField}><Text style={styles.txtBtn}>+ Thêm Cột</Text></TouchableOpacity>
        </View>
      </View>

      <TextInput style={styles.search} placeholder="Tra cứu số đăng ký/mã vị thuốc, tên thuốc..." value={searchQuery} onChangeText={setSearchQuery} />

      {/* TABLE */}
      <ScrollView horizontal>
        <View style={{ minWidth: '100%' }}>
          <View style={styles.headerRow}>
            <Text style={styles.cellChk}></Text>
            <Text style={[styles.headerCell, { flex: 2 }]}>SỐ ĐK/MÃ VỊ</Text>
            <Text style={[styles.headerCell, { flex: 3 }]}>TÊN THUỐC/VỊ THUỐC</Text>
            <Text style={[styles.headerCell, { flex: 1.5 }]}>MÃ HOẠT CHẤT</Text>
            <Text style={[styles.headerCell, { flex: 1, textAlign: 'center' }]}>MÃ ĐƯỜNG</Text>
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
            ListEmptyComponent={<Text style={styles.empty}>Chưa có dữ liệu. Vui lòng tạo cột và Import file Excel.</Text>}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF', padding: 10 },
  title: { fontSize: 16, fontWeight: 'bold', color: '#00695C', marginBottom: 10, textTransform: 'uppercase' },
  toolbar: { flexDirection: 'row', gap: 8, marginBottom: 10, flexWrap: 'wrap', alignItems: 'center' },
  btnPrimary: { backgroundColor: '#4CAF50', padding: 8, borderRadius: 4 },
  btnInfo: { backgroundColor: '#0288D1', padding: 8, borderRadius: 4 },
  btnDel: { backgroundColor: '#D32F2F', padding: 8, borderRadius: 4 },
  btnEdit: { backgroundColor: '#F57C00', padding: 6, borderRadius: 4, marginRight: 5 },
  btnSave: { backgroundColor: '#1976D2', padding: 6, borderRadius: 4 },
  txtBtn: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
  addFieldZone: { flexDirection: 'row', marginLeft: 'auto', gap: 5 },
  inputField: { borderWidth: 1, borderColor: '#B0BEC5', borderRadius: 4, paddingHorizontal: 8, height: 32, minWidth: 140 },
  btnAddField: { backgroundColor: '#00897B', justifyContent: 'center', paddingHorizontal: 10, borderRadius: 4 },
  search: { borderWidth: 1, borderColor: '#E0E0E0', padding: 8, borderRadius: 4, marginBottom: 10, backgroundColor: '#E0F2F1' },
  headerRow: { flexDirection: 'row', backgroundColor: '#B2DFDB', padding: 10, borderBottomWidth: 2, borderColor: '#00796B' },
  headerCell: { fontWeight: 'bold', fontSize: 11, paddingHorizontal: 4, color: '#004D40' },
  row: { flexDirection: 'row', padding: 10, borderBottomWidth: 1, borderBottomColor: '#EEEEEE', alignItems: 'center' },
  cell: { fontSize: 12, paddingHorizontal: 4 },
  cellEdit: { borderWidth: 1, borderColor: '#00897B', borderRadius: 4, backgroundColor: '#E0F2F1', padding: 4, marginHorizontal: 2, fontSize: 12 },
  cellChk: { width: 30, alignItems: 'center' },
  actions: { flexDirection: 'row', width: 90, justifyContent: 'flex-end' },
  empty: { textAlign: 'center', marginTop: 30, color: '#78909C', fontStyle: 'italic' }
});

export default PhuLuc06ThuocYHCT;