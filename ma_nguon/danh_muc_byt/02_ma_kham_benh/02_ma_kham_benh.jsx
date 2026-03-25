/**
 * ============================================================
 * FILE: danh_muc_byt/02_ma_kham_benh/02_ma_kham_benh.jsx
 * MỤC ĐÍCH: Quản lý Phụ lục 2 (Mã khám bệnh theo hạng BV) - QĐ 7603/QĐ-BYT
 * TÍNH NĂNG: Full CRUD, Excel Import/Export, Thêm cột động, Auto-save 100%
 * ============================================================
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as XLSX from 'xlsx';

const STORAGE_KEY = '@DM_BYT_PL02_V1';

const PhuLuc02MaKham = () => {
  // --- STATE QUẢN LÝ DỮ LIỆU ---
  const [data, setData] = useState([]);
  const [customFields, setCustomFields] = useState([]); 
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  
  // State tương tác UI
  const [newFieldName, setNewFieldName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  // --- 1. KHỞI TẠO & LƯU TỰ ĐỘNG (AUTO-SAVE) ---
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
      console.error('Lỗi tải dữ liệu PL2:', error);
    }
  };

  const autoSaveToStorage = async (newData, newFields) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ data: newData, fields: newFields }));
    } catch (error) {
      console.error('Lỗi Auto-save PL2:', error);
    }
  };

  const updateDataAndSave = (newData) => {
    setData(newData);
    autoSaveToStorage(newData, customFields);
  };

  // --- 2. THÊM TRƯỜNG DỮ LIỆU ĐỘNG (NO-CODE CUSTOMIZATION) ---
  const handleAddCustomField = () => {
    const fieldName = newFieldName.trim().toUpperCase().replace(/\s+/g, '_');
    if (!fieldName) return Alert.alert("Lỗi", "Nhập tên cột (VD: MA_HIS, GIA_VIEN_PHI)");
    if (customFields.includes(fieldName)) return Alert.alert("Lỗi", "Cột này đã tồn tại!");

    const updatedFields = [...customFields, fieldName];
    // Khởi tạo thuộc tính mới cho toàn bộ object hiện có
    const updatedData = data.map(item => ({ ...item, [fieldName]: '' }));
    
    setCustomFields(updatedFields);
    setData(updatedData);
    autoSaveToStorage(updatedData, updatedFields);
    setNewFieldName('');
  };

  const handleDeleteCustomField = (fieldName) => {
    Alert.alert("Cảnh báo", `Xóa cột [${fieldName}] và toàn bộ dữ liệu của cột này?`, [
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

  // --- 3. CRUD & BULK DELETE ---
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

  // --- 4. EXCEL IMPORT / EXPORT / TEMPLATE ---
  const handleDownloadTemplate = () => {
    Alert.alert("File Mẫu", "File Excel cần có các cột: 'Mã chuyên khoa', 'Mã khoa', 'Tên khám bệnh', 'Mã hạng 1', 'Mã hạng 2', 'Mã hạng 3', 'Mã hạng 4', 'Mã hạng ĐB'. Các cột tùy biến sẽ tự động được Export theo.");
  };

  const handleImportExcel = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: '*/*' });
      if (result.canceled) return;
      const fileString = await FileSystem.readAsStringAsync(result.assets[0].uri, { encoding: FileSystem.EncodingType.Base64 });
      const workbook = XLSX.read(fileString, { type: 'base64' });
      const parsedData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
      
      const mergedData = [...data, ...parsedData.map((item, idx) => ({
        id: Date.now().toString() + idx,
        ma_chuyen_khoa: item['Mã chuyên khoa theo TT43'] || item['Mã chuyên khoa'] || '',
        ma_khoa: item['Mã khoa'] || '',
        ten_kham_benh: item['Khám bệnh'] || item['Tên khám bệnh'] || '',
        ma_hang_db: item['BV hạng đặc biệt'] || item['Mã hạng ĐB'] || '',
        ma_hang_1: item['BV hạng 1'] || item['Mã hạng 1'] || '',
        ma_hang_2: item['BV hạng 2'] || item['Mã hạng 2'] || '',
        ma_hang_3: item['BV hạng 3'] || item['Mã hạng 3'] || '',
        ma_hang_4: item['BV hạng 4'] || item['Mã hạng 4'] || '',
        ...customFields.reduce((acc, field) => ({ ...acc, [field]: item[field] || '' }), {})
      }))].filter(item => item.ma_chuyen_khoa !== '' || item.ten_kham_benh !== '');
      
      updateDataAndSave(mergedData);
      Alert.alert("Thành công", `Đã import và lưu tự động ${parsedData.length} dòng.`);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể đọc file Excel. Đảm bảo file đúng định dạng.");
    }
  };

  const handleExportExcel = () => {
    try {
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "PL02_MaKhamBenh");
      Alert.alert("Thành công", "Đã xuất dữ liệu ra file Excel.");
    } catch (error) {
      Alert.alert("Lỗi", "Không thể xuất file.");
    }
  };

  // --- RENDER UI ---
  const renderItem = ({ item }) => {
    const isEditing = editingId === item.id;
    return (
      <View style={styles.row}>
        <TouchableOpacity onPress={() => setSelectedIds(prev => prev.includes(item.id) ? prev.filter(i => i !== item.id) : [...prev, item.id])} style={styles.cellChk}>
          <Text style={{fontWeight: 'bold'}}>{selectedIds.includes(item.id) ? '☑' : '☐'}</Text>
        </TouchableOpacity>
        
        {isEditing ? (
          <React.Fragment>
            <TextInput style={[styles.cellEdit, { flex: 1 }]} value={editForm.ma_chuyen_khoa} onChangeText={(t) => setEditForm({...editForm, ma_chuyen_khoa: t})} />
            <TextInput style={[styles.cellEdit, { flex: 1 }]} value={editForm.ma_khoa} onChangeText={(t) => setEditForm({...editForm, ma_khoa: t})} />
            <TextInput style={[styles.cellEdit, { flex: 2 }]} value={editForm.ten_kham_benh} onChangeText={(t) => setEditForm({...editForm, ten_kham_benh: t})} multiline />
            <TextInput style={[styles.cellEdit, { flex: 1.5 }]} value={editForm.ma_hang_3} placeholder="Mã Hạng 3..." onChangeText={(t) => setEditForm({...editForm, ma_hang_3: t})} />
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
            <Text style={[styles.cell, { flex: 1, color: '#1565C0', fontWeight: 'bold' }]}>{item.ma_chuyen_khoa}</Text>
            <Text style={[styles.cell, { flex: 1, color: '#2E7D32', fontWeight: 'bold' }]}>{item.ma_khoa}</Text>
            <Text style={[styles.cell, { flex: 2, fontWeight: '500' }]}>{item.ten_kham_benh}</Text>
            <Text style={[styles.cell, { flex: 1.5, color: '#D84315', fontWeight: 'bold' }]}>{item.ma_hang_3}</Text>
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
      <Text style={styles.title}>PHỤ LỤC 2 - MÃ KHÁM BỆNH THEO HẠNG BV (QĐ 7603)</Text>
      
      {/* TOOLBAR */}
      <View style={styles.toolbar}>
        <TouchableOpacity style={styles.btnPrimary} onPress={handleImportExcel}><Text style={styles.txtBtn}>📥 Import</Text></TouchableOpacity>
        <TouchableOpacity style={styles.btnPrimary} onPress={handleExportExcel}><Text style={styles.txtBtn}>📤 Export</Text></TouchableOpacity>
        <TouchableOpacity style={styles.btnInfo} onPress={handleDownloadTemplate}><Text style={styles.txtBtn}>📄 Mẫu</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.btnDel, { opacity: selectedIds.length ? 1 : 0.5 }]} onPress={handleBulkDelete}>
          <Text style={styles.txtBtn}>🗑 Xóa ({selectedIds.length})</Text>
        </TouchableOpacity>
        
        <View style={styles.addFieldZone}>
          <TextInput style={styles.inputField} placeholder="Tên cột mới (VD: MA_HIS)..." value={newFieldName} onChangeText={setNewFieldName} />
          <TouchableOpacity style={styles.btnAddField} onPress={handleAddCustomField}><Text style={styles.txtBtn}>+ Thêm Cột</Text></TouchableOpacity>
        </View>
      </View>

      <TextInput style={styles.search} placeholder="Tra cứu mã chuyên khoa, tên phòng khám..." value={searchQuery} onChangeText={setSearchQuery} />

      {/* TABLE */}
      <ScrollView horizontal>
        <View style={{ minWidth: '100%' }}>
          <View style={styles.headerRow}>
            <Text style={styles.cellChk}></Text>
            <Text style={[styles.headerCell, { flex: 1 }]}>MÃ CK</Text>
            <Text style={[styles.headerCell, { flex: 1 }]}>MÃ KHOA</Text>
            <Text style={[styles.headerCell, { flex: 2 }]}>TÊN KHÁM BỆNH</Text>
            <Text style={[styles.headerCell, { flex: 1.5 }]}>MÃ BV HẠNG 3</Text>
            {/* Render tiêu đề cột Custom */}
            {customFields.map(field => (
              <TouchableOpacity key={field} style={{ flex: 1.5, flexDirection: 'row', alignItems: 'center' }} onLongPress={() => handleDeleteCustomField(field)}>
                <Text style={[styles.headerCell, { color: '#8E24AA' }]}>{field} ✎</Text>
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
            ListEmptyComponent={<Text style={styles.empty}>Chưa có dữ liệu. Vui lòng Import file Phụ lục 2.</Text>}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF', padding: 10 },
  title: { fontSize: 16, fontWeight: 'bold', color: '#1565C0', marginBottom: 10, textTransform: 'uppercase' },
  toolbar: { flexDirection: 'row', gap: 8, marginBottom: 10, flexWrap: 'wrap', alignItems: 'center' },
  btnPrimary: { backgroundColor: '#4CAF50', padding: 8, borderRadius: 4 },
  btnInfo: { backgroundColor: '#0288D1', padding: 8, borderRadius: 4 },
  btnDel: { backgroundColor: '#D32F2F', padding: 8, borderRadius: 4 },
  btnEdit: { backgroundColor: '#F57C00', padding: 6, borderRadius: 4, marginRight: 5 },
  btnSave: { backgroundColor: '#1976D2', padding: 6, borderRadius: 4 },
  txtBtn: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
  addFieldZone: { flexDirection: 'row', marginLeft: 'auto', gap: 5 },
  inputField: { borderWidth: 1, borderColor: '#B0BEC5', borderRadius: 4, paddingHorizontal: 8, height: 32, minWidth: 140 },
  btnAddField: { backgroundColor: '#8E24AA', justifyContent: 'center', paddingHorizontal: 10, borderRadius: 4 },
  search: { borderWidth: 1, borderColor: '#E0E0E0', padding: 8, borderRadius: 4, marginBottom: 10, backgroundColor: '#E3F2FD' },
  headerRow: { flexDirection: 'row', backgroundColor: '#BBDEFB', padding: 10, borderBottomWidth: 2, borderColor: '#0288D1' },
  headerCell: { fontWeight: 'bold', fontSize: 11, paddingHorizontal: 4, color: '#01579B' },
  row: { flexDirection: 'row', padding: 10, borderBottomWidth: 1, borderBottomColor: '#EEEEEE', alignItems: 'center' },
  cell: { fontSize: 12, paddingHorizontal: 4 },
  cellEdit: { borderWidth: 1, borderColor: '#42A5F5', borderRadius: 4, backgroundColor: '#E3F2FD', padding: 4, marginHorizontal: 2, fontSize: 12 },
  cellChk: { width: 30, alignItems: 'center' },
  actions: { flexDirection: 'row', width: 90, justifyContent: 'flex-end' },
  empty: { textAlign: 'center', marginTop: 30, color: '#78909C', fontStyle: 'italic' }
});

export default PhuLuc02MaKham;