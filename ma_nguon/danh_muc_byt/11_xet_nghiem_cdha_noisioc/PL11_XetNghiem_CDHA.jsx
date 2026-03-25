/**
 * ============================================================
 * FILE: danh_muc_byt/11_xet_nghiem_cdha_noisioc/PL11_XetNghiem_CDHA.jsx
 * MỤC ĐÍCH: Quản lý Phụ lục 11 (Mã Xét nghiệm, CĐHA, Nội soi) - QĐ 7603
 * TÍNH NĂNG: Full CRUD, Dynamic Columns (No-code), Auto-save, Excel In/Out
 * ============================================================
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as XLSX from 'xlsx';

const STORAGE_KEY = '@DM_BYT_PL11_V1';

const PhuLuc11CLS = () => {
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
      console.error('Lỗi tải dữ liệu PL11:', error);
    }
  };

  const autoSaveToStorage = async (newData, newFields) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ data: newData, fields: newFields }));
    } catch (error) {
      console.error('Lỗi Auto-save PL11:', error);
    }
  };

  const updateDataAndSave = (newData) => {
    setData(newData);
    autoSaveToStorage(newData, customFields);
  };

  // --- 2. THÊM TRƯỜNG DỮ LIỆU ĐỘNG (DYNAMIC COLUMNS) ---
  const handleAddCustomField = () => {
    const fieldName = newFieldName.trim().toUpperCase().replace(/\s+/g, '_');
    if (!fieldName) return Alert.alert("Lỗi", "Nhập tên cột (VD: MA_HIS, CSBT_MIN, CSBT_MAX)");
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
      "File Excel cần có các cột: MA_SO, TEN_XET_NGHIEM, GHI_CHU. \nKhuyên dùng: Bấm [+ Thêm Cột] tạo thêm cột CSBT_MIN và CSBT_MAX trên app trước rồi Import Excel."
    );
  };

  const handleImportExcel = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: '*/*' });
      if (result.canceled) return;
      const fileString = await FileSystem.readAsStringAsync(result.assets[0].uri, { encoding: FileSystem.EncodingType.Base64 });
      const workbook = XLSX.read(fileString, { type: 'base64' });
      const parsedData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
      
      const mergedData = [...data, ...parsedData.map((item, idx) => {
        const maSo = item['MA_SO'] || item['Mã số'] || item['Mã'] || Date.now().toString() + idx;
        const tenXN = item['TEN_XET_NGHIEM'] || item['Tên xét nghiệm'] || item['Nội dung'] || '';
        
        return {
          id: maSo,
          ma_so: maSo,
          ten_xet_nghiem: tenXN,
          ghi_chu: item['GHI_CHU'] || item['Ghi chú'] || '',
          ...customFields.reduce((acc, field) => ({ ...acc, [field]: item[field] || '' }), {})
        };
      })].filter(item => item.ma_so !== '' && item.ten_xet_nghiem !== ''); 
      
      const uniqueData = Array.from(new Map(mergedData.map(item => [item.ma_so, item])).values());
      updateDataAndSave(uniqueData);
      Alert.alert("Thành công", `Đã import ${uniqueData.length} dòng.`);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể đọc file Excel.");
    }
  };

  const handleExportExcel = () => {
    try {
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "PL11_XetNghiem_CDHA");
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
            <TextInput style={[styles.cellEdit, { flex: 1.5 }]} value={editForm.ma_so} onChangeText={(t) => setEditForm({...editForm, ma_so: t})} />
            <TextInput style={[styles.cellEdit, { flex: 4 }]} value={editForm.ten_xet_nghiem} onChangeText={(t) => setEditForm({...editForm, ten_xet_nghiem: t})} multiline />
            <TextInput style={[styles.cellEdit, { flex: 3 }]} value={editForm.ghi_chu} onChangeText={(t) => setEditForm({...editForm, ghi_chu: t})} multiline />
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
            <Text style={[styles.cell, { flex: 1.5, color: '#1565C0', fontWeight: 'bold' }]}>{item.ma_so}</Text>
            <Text style={[styles.cell, { flex: 4, fontWeight: '500' }]}>{item.ten_xet_nghiem}</Text>
            <Text style={[styles.cell, { flex: 3, color: '#E65100', fontStyle: 'italic' }]}>{item.ghi_chu}</Text>
            {customFields.map(field => (
              <Text key={field} style={[styles.cell, { flex: 1.5, color: '#2E7D32' }]}>{item[field]}</Text>
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
      <Text style={styles.title}>PHỤ LỤC 11 - XÉT NGHIỆM, CĐHA, NỘI SOI (QĐ 7603)</Text>
      
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
            placeholder="VD: CSBT_MIN..." 
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
        placeholder="Tra cứu mã số, tên xét nghiệm..." 
        value={searchQuery} 
        onChangeText={setSearchQuery} 
      />

      {/* TABLE */}
      <ScrollView horizontal>
        <View style={{ minWidth: '100%' }}>
          <View style={styles.headerRow}>
            <Text style={styles.cellChk}></Text>
            <Text style={[styles.headerCell, { flex: 1.5 }]}>MÃ SỐ</Text>
            <Text style={[styles.headerCell, { flex: 4 }]}>TÊN XÉT NGHIỆM / CĐHA</Text>
            <Text style={[styles.headerCell, { flex: 3 }]}>GHI CHÚ / CSBT</Text>
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
            initialNumToRender={15}
            maxToRenderPerBatch={20}
            windowSize={5}
            removeClippedSubviews={true}
            ListEmptyComponent={
              <Text style={styles.empty}>Chưa có dữ liệu. Vui lòng tạo cột và Import file Excel Phụ lục 11.</Text>
            }
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF', padding: 10 },
  title: { fontSize: 16, fontWeight: 'bold', color: '#01579B', marginBottom: 10, textTransform: 'uppercase' },
  toolbar: { flexDirection: 'row', gap: 8, marginBottom: 10, flexWrap: 'wrap', alignItems: 'center' },
  btnPrimary: { backgroundColor: '#4CAF50', padding: 8, borderRadius: 4 },
  btnInfo: { backgroundColor: '#0288D1', padding: 8, borderRadius: 4 },
  btnDel: { backgroundColor: '#D32F2F', padding: 8, borderRadius: 4 },
  btnEdit: { backgroundColor: '#F57C00', padding: 6, borderRadius: 4, marginRight: 5 },
  btnSave: { backgroundColor: '#1976D2', padding: 6, borderRadius: 4 },
  txtBtn: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
  addFieldZone: { flexDirection: 'row', marginLeft: 'auto', gap: 5 },
  inputField: { borderWidth: 1, borderColor: '#B0BEC5', borderRadius: 4, paddingHorizontal: 8, height: 32, minWidth: 140 },
  btnAddField: { backgroundColor: '#0277BD', justifyContent: 'center', paddingHorizontal: 10, borderRadius: 4 },
  search: { borderWidth: 1, borderColor: '#E0E0E0', padding: 8, borderRadius: 4, marginBottom: 10, backgroundColor: '#E1F5FE' },
  headerRow: { flexDirection: 'row', backgroundColor: '#B3E5FC', padding: 10, borderBottomWidth: 2, borderColor: '#0288D1' },
  headerCell: { fontWeight: 'bold', fontSize: 12, paddingHorizontal: 4, color: '#01579B' },
  row: { flexDirection: 'row', padding: 10, borderBottomWidth: 1, borderBottomColor: '#EEEEEE', alignItems: 'center' },
  cell: { fontSize: 13, paddingHorizontal: 4 },
  cellEdit: { borderWidth: 1, borderColor: '#0288D1', borderRadius: 4, backgroundColor: '#E1F5FE', padding: 4, marginHorizontal: 2, fontSize: 12 },
  cellChk: { width: 30, alignItems: 'center' },
  actions: { flexDirection: 'row', width: 90, justifyContent: 'flex-end' },
  empty: { textAlign: 'center', marginTop: 30, color: '#78909C', fontStyle: 'italic' }
});

export default PhuLuc11CLS;