/**
 * ============================================================
 * FILE: danh_muc_byt/07_ma_benh_yhct/07_ma_benh_yhct.jsx
 * MỤC ĐÍCH: Quản lý Phụ lục 7 (Mã bệnh YHCT) - QĐ 7603/QĐ-BYT
 * TÍNH NĂNG: Full CRUD, Dynamic Columns (No-code), Auto-save, Excel In/Out
 * ============================================================
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as XLSX from 'xlsx';

const STORAGE_KEY = '@DM_BYT_PL07_V1';

const PhuLuc07MaBenhYHCT = () => {
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
      console.error('Lỗi tải dữ liệu PL7:', error);
    }
  };

  const autoSaveToStorage = async (newData, newFields) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ data: newData, fields: newFields }));
    } catch (error) {
      console.error('Lỗi Auto-save PL7:', error);
    }
  };

  const updateDataAndSave = (newData) => {
    setData(newData);
    autoSaveToStorage(newData, customFields);
  };

  // --- 2. THÊM TRƯỜNG DỮ LIỆU ĐỘNG (DYNAMIC COLUMNS) ---
  const handleAddCustomField = () => {
    const fieldName = newFieldName.trim().toUpperCase().replace(/\s+/g, '_');
    if (!fieldName) return Alert.alert("Lỗi", "Nhập tên cột (VD: MA_HIS, GHI_CHU)");
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
      "File Excel cần các cột: MA_BENH, CHỨNG/BỆNH THEO Y HỌC CỔ TRUYỀN, ICD10, TÊN BỆNH THEO Y HỌC HIỆN ĐẠI. \nBạn có thể tự thêm cột bằng nút [+ Thêm Cột] trước khi Import."
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
        id: item['MA_BENH'] || Date.now().toString() + idx,
        ma_benh: item['MA_BENH'] || '',
        ten_benh_yhct: item['CHỨNG/BỆNH THEO Y HỌC CỔ TRUYỀN'] || item['TÊN BỆNH YHCT'] || '',
        icd10: item['ICD10'] || item['ICD 10'] || '',
        ten_benh_yhhd: item['TÊN BỆNH THEO Y HỌC HIỆN ĐẠI'] || item['TÊN BỆNH YHHĐ'] || '',
        // Tự động map dữ liệu vào các cột Custom
        ...customFields.reduce((acc, field) => ({ ...acc, [field]: item[field] || '' }), {})
      }))].filter(item => item.ma_benh !== ''); 
      
      // Lọc trùng theo Mã Bệnh YHCT
      const uniqueData = Array.from(new Map(mergedData.map(item => [item.ma_benh, item])).values());
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
      XLSX.utils.book_append_sheet(wb, ws, "07_ma_benh_yhct");
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
        <TouchableOpacity 
          onPress={() => setSelectedIds(prev => prev.includes(item.id) ? prev.filter(i => i !== item.id) : [...prev, item.id])} 
          style={styles.cellChk}
        >
          <Text style={{fontWeight: 'bold'}}>{selectedIds.includes(item.id) ? '☑' : '☐'}</Text>
        </TouchableOpacity>
        
        {isEditing ? (
          <React.Fragment>
            <TextInput style={[styles.cellEdit, { flex: 1.5 }]} value={editForm.ma_benh} onChangeText={(t) => setEditForm({...editForm, ma_benh: t})} />
            <TextInput style={[styles.cellEdit, { flex: 3 }]} value={editForm.ten_benh_yhct} onChangeText={(t) => setEditForm({...editForm, ten_benh_yhct: t})} multiline />
            <TextInput style={[styles.cellEdit, { flex: 1.5 }]} value={editForm.icd10} onChangeText={(t) => setEditForm({...editForm, icd10: t})} />
            <TextInput style={[styles.cellEdit, { flex: 3 }]} value={editForm.ten_benh_yhhd} onChangeText={(t) => setEditForm({...editForm, ten_benh_yhhd: t})} multiline />
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
            <Text style={[styles.cell, { flex: 1.5, color: '#D84315', fontWeight: 'bold' }]}>{item.ma_benh}</Text>
            <Text style={[styles.cell, { flex: 3, fontWeight: '500' }]}>{item.ten_benh_yhct}</Text>
            <Text style={[styles.cell, { flex: 1.5, color: '#1565C0', fontWeight: 'bold' }]}>{item.icd10}</Text>
            <Text style={[styles.cell, { flex: 3 }]}>{item.ten_benh_yhhd}</Text>
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
      <Text style={styles.title}>PHỤ LỤC 7 - DANH MỤC MÃ BỆNH YHCT (QĐ 7603)</Text>
      
      {/* TOOLBAR */}
      <View style={styles.toolbar}>
        <TouchableOpacity style={styles.btnPrimary} onPress={handleImportExcel}>
          <Text style={styles.txtBtn}>📥 Import</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnPrimary} onPress={handleExportExcel}>
          <Text style={styles.txtBtn}>📤 Export</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnInfo} onPress={handleDownloadTemplate}>
          <Text style={styles.txtBtn}>📄 Mẫu</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btnDel, { opacity: selectedIds.length ? 1 : 0.5 }]} onPress={handleBulkDelete}>
          <Text style={styles.txtBtn}>🗑 Xóa ({selectedIds.length})</Text>
        </TouchableOpacity>
        
        <View style={styles.addFieldZone}>
          <TextInput 
            style={styles.inputField} 
            placeholder="VD: MA_HIS..." 
            value={newFieldName} 
            onChangeText={setNewFieldName} 
          />
          <TouchableOpacity style={styles.btnAddField} onPress={handleAddCustomField}>
            <Text style={styles.txtBtn}>+ Thêm Cột</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TextInput 
        style={styles.search} 
        placeholder="Tra cứu mã bệnh YHCT, ICD-10, tên bệnh..." 
        value={searchQuery} 
        onChangeText={setSearchQuery} 
      />

      {/* TABLE */}
      <ScrollView horizontal>
        <View style={{ minWidth: '100%' }}>
          <View style={styles.headerRow}>
            <Text style={styles.cellChk}></Text>
            <Text style={[styles.headerCell, { flex: 1.5 }]}>MÃ BỆNH YHCT</Text>
            <Text style={[styles.headerCell, { flex: 3 }]}>TÊN BỆNH YHCT</Text>
            <Text style={[styles.headerCell, { flex: 1.5 }]}>MÃ ICD-10</Text>
            <Text style={[styles.headerCell, { flex: 3 }]}>TÊN BỆNH YHHĐ</Text>
            {/* Cột Custom */}
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
            ListEmptyComponent={
              <Text style={styles.empty}>Chưa có dữ liệu. Vui lòng tạo cột và Import file Excel Phụ lục 7.</Text>
            }
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF', padding: 10 },
  title: { fontSize: 16, fontWeight: 'bold', color: '#3E2723', marginBottom: 10, textTransform: 'uppercase' },
  toolbar: { flexDirection: 'row', gap: 8, marginBottom: 10, flexWrap: 'wrap', alignItems: 'center' },
  btnPrimary: { backgroundColor: '#4CAF50', padding: 8, borderRadius: 4 },
  btnInfo: { backgroundColor: '#0288D1', padding: 8, borderRadius: 4 },
  btnDel: { backgroundColor: '#D32F2F', padding: 8, borderRadius: 4 },
  btnEdit: { backgroundColor: '#F57C00', padding: 6, borderRadius: 4, marginRight: 5 },
  btnSave: { backgroundColor: '#1976D2', padding: 6, borderRadius: 4 },
  txtBtn: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
  addFieldZone: { flexDirection: 'row', marginLeft: 'auto', gap: 5 },
  inputField: { borderWidth: 1, borderColor: '#B0BEC5', borderRadius: 4, paddingHorizontal: 8, height: 32, minWidth: 140 },
  btnAddField: { backgroundColor: '#6A1B9A', justifyContent: 'center', paddingHorizontal: 10, borderRadius: 4 },
  search: { borderWidth: 1, borderColor: '#E0E0E0', padding: 8, borderRadius: 4, marginBottom: 10, backgroundColor: '#EFEBE9' },
  headerRow: { flexDirection: 'row', backgroundColor: '#D7CCC8', padding: 10, borderBottomWidth: 2, borderColor: '#795548' },
  headerCell: { fontWeight: 'bold', fontSize: 12, paddingHorizontal: 4, color: '#3E2723' },
  row: { flexDirection: 'row', padding: 10, borderBottomWidth: 1, borderBottomColor: '#EEEEEE', alignItems: 'center' },
  cell: { fontSize: 12, paddingHorizontal: 4 },
  cellEdit: { borderWidth: 1, borderColor: '#8D6E63', borderRadius: 4, backgroundColor: '#EFEBE9', padding: 4, marginHorizontal: 2, fontSize: 12 },
  cellChk: { width: 30, alignItems: 'center' },
  actions: { flexDirection: 'row', width: 90, justifyContent: 'flex-end' },
  empty: { textAlign: 'center', marginTop: 30, color: '#78909C', fontStyle: 'italic' }
});

export default PhuLuc07MaBenhYHCT;