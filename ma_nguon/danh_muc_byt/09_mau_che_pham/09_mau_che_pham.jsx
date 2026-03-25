/**
 * ============================================================
 * FILE: danh_muc_byt/09_mau_che_pham/09_mau_che_pham.jsx
 * MỤC ĐÍCH: Quản lý Phụ lục 9 (Mã máu và chế phẩm máu) - QĐ 7603/QĐ-BYT
 * TÍNH NĂNG: Full CRUD, Dynamic Columns (No-code), Auto-save, Excel In/Out
 * ============================================================
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as XLSX from 'xlsx';

const STORAGE_KEY = '@DM_BYT_PL09_V1';

const PhuLuc09Mau = () => {
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
      console.error('Lỗi tải dữ liệu PL9:', error);
    }
  };

  const autoSaveToStorage = async (newData, newFields) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ data: newData, fields: newFields }));
    } catch (error) {
      console.error('Lỗi Auto-save PL9:', error);
    }
  };

  const updateDataAndSave = (newData) => {
    setData(newData);
    autoSaveToStorage(newData, customFields);
  };

  // --- 2. THÊM TRƯỜNG DỮ LIỆU ĐỘNG (DYNAMIC COLUMNS) ---
  const handleAddCustomField = () => {
    const fieldName = newFieldName.trim().toUpperCase().replace(/\s+/g, '_');
    if (!fieldName) return Alert.alert("Lỗi", "Nhập tên cột (VD: MA_HIS, GIA_BHYT)");
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
      "Sử dụng file 'Phu luc 09.xls - DM ma mau va CP mau.csv'. \nCác cột hệ thống tự nhận diện: Mã, Đơn vị máu và chế phẩm, Thể tích thực. Bạn có thể thêm cột GIA_BHYT trên app rồi Import kèm."
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
        id: item['Mã '] || item['Mã'] || item['MA_MAU'] || Date.now().toString() + idx,
        ma_mau: item['Mã '] || item['Mã'] || item['MA_MAU'] || '',
        ten_mau: item['Đơn vị máu và chế phẩm'] || item['TEN_MAU'] || '',
        the_tich: item['Thể tích thực (ml) (+10%)'] || item['THE_TICH'] || '',
        // Tự động map dữ liệu vào các cột Custom
        ...customFields.reduce((acc, field) => ({ ...acc, [field]: item[field] || '' }), {})
      }))].filter(item => item.ma_mau !== ''); // Bỏ dòng trống
      
      // Lọc trùng theo Mã máu
      const uniqueData = Array.from(new Map(mergedData.map(item => [item.ma_mau, item])).values());
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
      XLSX.utils.book_append_sheet(wb, ws, "PL09_MauVaChePham");
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
            <TextInput style={[styles.cellEdit, { flex: 1.5 }]} value={editForm.ma_mau?.toString()} onChangeText={(t) => setEditForm({...editForm, ma_mau: t})} />
            <TextInput style={[styles.cellEdit, { flex: 4 }]} value={editForm.ten_mau} onChangeText={(t) => setEditForm({...editForm, ten_mau: t})} multiline />
            <TextInput style={[styles.cellEdit, { flex: 1.5 }]} value={editForm.the_tich?.toString()} onChangeText={(t) => setEditForm({...editForm, the_tich: t})} keyboardType="numeric" />
            {customFields.map(field => (
              <TextInput key={field} style={[styles.cellEdit, { flex: 1.5 }]} value={editForm[field]?.toString()} onChangeText={(t) => setEditForm({...editForm, [field]: t})} />
            ))}
            <View style={styles.actions}>
              <TouchableOpacity style={styles.btnSave} onPress={saveEdit}>
                <Text style={styles.txtBtn}>Lưu</Text>
              </TouchableOpacity>
            </View>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <Text style={[styles.cell, { flex: 1.5, color: '#C62828', fontWeight: 'bold' }]}>{item.ma_mau}</Text>
            <Text style={[styles.cell, { flex: 4, fontWeight: '500' }]}>{item.ten_mau}</Text>
            <Text style={[styles.cell, { flex: 1.5, color: '#1565C0', fontWeight: 'bold', textAlign: 'center' }]}>{item.the_tich}</Text>
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
      <Text style={styles.title}>PHỤ LỤC 9 - MÃ MÁU VÀ CHẾ PHẨM MÁU (QĐ 7603)</Text>
      
      {/* TOOLBAR */}
      <View style={styles.toolbar}>
        <TouchableOpacity style={styles.btnPrimary} onPress={handleImportExcel}><Text style={styles.txtBtn}>📥 Import</Text></TouchableOpacity>
        <TouchableOpacity style={styles.btnPrimary} onPress={handleExportExcel}><Text style={styles.txtBtn}>📤 Export</Text></TouchableOpacity>
        <TouchableOpacity style={styles.btnInfo} onPress={handleDownloadTemplate}><Text style={styles.txtBtn}>📄 Mẫu</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.btnDel, { opacity: selectedIds.length ? 1 : 0.5 }]} onPress={handleBulkDelete}>
          <Text style={styles.txtBtn}>🗑 Xóa ({selectedIds.length})</Text>
        </TouchableOpacity>
        
        <View style={styles.addFieldZone}>
          <TextInput style={styles.inputField} placeholder="VD: GIA_BHYT..." value={newFieldName} onChangeText={setNewFieldName} />
          <TouchableOpacity style={styles.btnAddField} onPress={handleAddCustomField}><Text style={styles.txtBtn}>+ Thêm Cột</Text></TouchableOpacity>
        </View>
      </View>

      <TextInput style={styles.search} placeholder="Tra cứu mã máu, tên máu/chế phẩm..." value={searchQuery} onChangeText={setSearchQuery} />

      {/* TABLE */}
      <ScrollView horizontal>
        <View style={{ minWidth: '100%' }}>
          <View style={styles.headerRow}>
            <Text style={styles.cellChk}></Text>
            <Text style={[styles.headerCell, { flex: 1.5 }]}>MÃ MÁU</Text>
            <Text style={[styles.headerCell, { flex: 4 }]}>ĐƠN VỊ MÁU VÀ CHẾ PHẨM</Text>
            <Text style={[styles.headerCell, { flex: 1.5, textAlign: 'center' }]}>THỂ TÍCH (ML)</Text>
            {/* Cột Custom */}
            {customFields.map(field => (
              <TouchableOpacity key={field} style={{ flex: 1.5, flexDirection: 'row', alignItems: 'center' }} onLongPress={() => handleDeleteCustomField(field)}>
                <Text style={[styles.headerCell, { color: '#E65100' }]}>{field} ✎</Text>
              </TouchableOpacity>
            ))}
            <Text style={styles.actions}></Text>
          </View>

          <FlatList
            data={data.filter(item => JSON.stringify(item).toLowerCase().includes(searchQuery.toLowerCase()))}
            keyExtractor={item => item.id.toString()}
            renderItem={renderItem}
            ListEmptyComponent={<Text style={styles.empty}>Chưa có dữ liệu. Vui lòng Import file Excel Phụ lục 9.</Text>}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF', padding: 10 },
  title: { fontSize: 16, fontWeight: 'bold', color: '#C62828', marginBottom: 10, textTransform: 'uppercase' },
  toolbar: { flexDirection: 'row', gap: 8, marginBottom: 10, flexWrap: 'wrap', alignItems: 'center' },
  btnPrimary: { backgroundColor: '#4CAF50', padding: 8, borderRadius: 4 },
  btnInfo: { backgroundColor: '#0288D1', padding: 8, borderRadius: 4 },
  btnDel: { backgroundColor: '#D32F2F', padding: 8, borderRadius: 4 },
  btnEdit: { backgroundColor: '#F57C00', padding: 6, borderRadius: 4, marginRight: 5 },
  btnSave: { backgroundColor: '#1976D2', padding: 6, borderRadius: 4 },
  txtBtn: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
  addFieldZone: { flexDirection: 'row', marginLeft: 'auto', gap: 5 },
  inputField: { borderWidth: 1, borderColor: '#B0BEC5', borderRadius: 4, paddingHorizontal: 8, height: 32, minWidth: 140 },
  btnAddField: { backgroundColor: '#E65100', justifyContent: 'center', paddingHorizontal: 10, borderRadius: 4 },
  search: { borderWidth: 1, borderColor: '#E0E0E0', padding: 8, borderRadius: 4, marginBottom: 10, backgroundColor: '#FFEBEE' },
  headerRow: { flexDirection: 'row', backgroundColor: '#FFCDD2', padding: 10, borderBottomWidth: 2, borderColor: '#D32F2F' },
  headerCell: { fontWeight: 'bold', fontSize: 12, paddingHorizontal: 4, color: '#B71C1C' },
  row: { flexDirection: 'row', padding: 10, borderBottomWidth: 1, borderBottomColor: '#EEEEEE', alignItems: 'center' },
  cell: { fontSize: 13, paddingHorizontal: 4 },
  cellEdit: { borderWidth: 1, borderColor: '#D32F2F', borderRadius: 4, backgroundColor: '#FFEBEE', padding: 4, marginHorizontal: 2, fontSize: 12 },
  cellChk: { width: 30, alignItems: 'center' },
  actions: { flexDirection: 'row', width: 90, justifyContent: 'flex-end' },
  empty: { textAlign: 'center', marginTop: 30, color: '#78909C', fontStyle: 'italic' }
});

export default PhuLuc09Mau;