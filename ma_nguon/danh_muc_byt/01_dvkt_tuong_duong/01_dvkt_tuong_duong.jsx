/**
 * ============================================================
 * FILE: danh_muc_byt/01_dvkt_tuong_duong/01_dvkt_tuong_duong.jsx
 * MỤC ĐÍCH: Quản lý Phụ lục 1 (Mã DVKT tương đương) - QĐ 7603/QĐ-BYT
 * CHỨC NĂNG MỚI: Thêm trường dữ liệu động (Dynamic Columns), Tự động lưu (Auto-save)
 * ============================================================
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as XLSX from 'xlsx';

const STORAGE_KEY = '@DM_BYT_PL01_V2';

const PhuLuc01DVKT = () => {
  // --- STATE QUẢN LÝ ---
  const [data, setData] = useState([]);
  const [customFields, setCustomFields] = useState([]); // Lưu danh sách các cột thêm mới
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  
  // State phục vụ thao tác UI
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
      console.error('Lỗi tải dữ liệu:', error);
    }
  };

  // Hàm cốt lõi: Ghi nhận thay đổi và tự động lưu ngay lập tức
  const autoSaveToStorage = async (newData, newFields) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ data: newData, fields: newFields }));
    } catch (error) {
      console.error('Lỗi tự động lưu:', error);
    }
  };

  const updateDataAndSave = (newData) => {
    setData(newData);
    autoSaveToStorage(newData, customFields);
  };

  // --- 2. CHỨC NĂNG THÊM/XÓA TRƯỜNG DỮ LIỆU ĐỘNG ---
  const handleAddCustomField = () => {
    const fieldName = newFieldName.trim().toUpperCase().replace(/\s+/g, '_');
    if (!fieldName) return Alert.alert("Lỗi", "Vui lòng nhập tên trường (Ví dụ: MA_HIS)");
    if (customFields.includes(fieldName)) return Alert.alert("Lỗi", "Trường dữ liệu này đã tồn tại!");

    const updatedFields = [...customFields, fieldName];
    // Tự động khởi tạo trường này với giá trị rỗng cho toàn bộ data hiện có
    const updatedData = data.map(item => ({ ...item, [fieldName]: '' }));
    
    setCustomFields(updatedFields);
    setData(updatedData);
    autoSaveToStorage(updatedData, updatedFields); // Lưu tự động
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

  // --- 3. CHỨC NĂNG CRUD CƠ BẢN ---
  const handleDelete = (id) => {
    Alert.alert("Xác nhận", "Xóa mã DVKT này?", [
      { text: "Hủy", style: "cancel" },
      { text: "Xóa", style: 'destructive', onPress: () => updateDataAndSave(data.filter(item => item.id !== id)) }
    ]);
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

  // Bắt đầu sửa inline
  const startEdit = (item) => {
    setEditingId(item.id);
    setEditForm({ ...item });
  };

  // Lưu tự động sau khi sửa xong
  const saveEdit = () => {
    const updatedData = data.map(item => item.id === editingId ? editForm : item);
    updateDataAndSave(updatedData);
    setEditingId(null);
    setEditForm({});
  };

  // --- 4. EXCEL IMPORT/EXPORT ---
  const handleDownloadTemplate = () => {
    Alert.alert(
      "File Mẫu", 
      "File Excel cần có các cột: 'Mã tương đương', 'Tên DVKT', 'Giá BHYT'. Bạn có thể tự thêm cột bằng nút [+ Thêm Cột] trước khi Import."
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
        id: item['Mã tương đương'] || Date.now().toString() + idx,
        ma_tuong_duong: item['Mã tương đương'] || '',
        ten_dvkt: item['Tên DVKT'] || item[' Tên theo Danh mục kỹ thuật tại Thông tư 43,50,21'] || '',
        gia_bhyt: item['Giá BHYT'] || item['Giá TT39'] || '',
        // Kế thừa các trường custom nếu file excel có cột trùng tên
        ...customFields.reduce((acc, field) => ({ ...acc, [field]: item[field] || '' }), {})
      }))].filter(item => item.ma_tuong_duong !== '');
      
      // Lọc trùng theo mã tương đương
      const uniqueData = Array.from(new Map(mergedData.map(item => [item.ma_tuong_duong, item])).values());
      updateDataAndSave(uniqueData);
      Alert.alert("Thành công", `Đã import và lưu tự động ${uniqueData.length} dòng.`);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể đọc file Excel. Định dạng không hợp lệ.");
    }
  };

  const handleExportExcel = () => {
    try {
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "PL01_DVKT_TuongDuong");
      Alert.alert("Thành công", "Đã xuất dữ liệu ra file Excel.");
    } catch (error) {
      Alert.alert("Lỗi", "Không thể xuất file.");
    }
  };

  // --- RENDER GIAO DIỆN ---
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
            <TextInput style={[styles.cell, styles.inputEdit, { flex: 1.5 }]} value={editForm.ma_tuong_duong} onChangeText={(t) => setEditForm({...editForm, ma_tuong_duong: t})} />
            <TextInput style={[styles.cell, styles.inputEdit, { flex: 3 }]} value={editForm.ten_dvkt} onChangeText={(t) => setEditForm({...editForm, ten_dvkt: t})} />
            <TextInput style={[styles.cell, styles.inputEdit, { flex: 1 }]} value={editForm.gia_bhyt?.toString()} onChangeText={(t) => setEditForm({...editForm, gia_bhyt: t})} />
            {customFields.map(field => (
              <TextInput 
                key={field} 
                style={[styles.cell, styles.inputEdit, { flex: 1 }]} 
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
            <Text style={[styles.cell, { flex: 1.5, color: '#1976D2', fontWeight: 'bold' }]}>{item.ma_tuong_duong}</Text>
            <Text style={[styles.cell, { flex: 3 }]}>{item.ten_dvkt}</Text>
            <Text style={[styles.cell, { flex: 1, color: '#D32F2F', fontWeight: 'bold' }]}>{item.gia_bhyt}</Text>
            {customFields.map(field => (
              <Text key={field} style={[styles.cell, { flex: 1 }]}>{item[field]}</Text>
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
      <Text style={styles.title}>PHỤ LỤC 1 - MÃ DVKT TƯƠNG ĐƯƠNG (QĐ 7603)</Text>
      
      {/* Thanh công cụ mở rộng */}
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
        
        {/* Khu vực thêm trường động */}
        <View style={styles.addFieldZone}>
          <TextInput 
            style={styles.inputField} 
            placeholder="Tên cột mới (VD: MA_HIS)..." 
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
        placeholder="Tra cứu mã tương đương, tên dịch vụ..." 
        value={searchQuery} 
        onChangeText={setSearchQuery} 
      />

      <ScrollView horizontal>
        <View style={{ minWidth: '100%' }}>
          {/* Header Bảng */}
          <View style={styles.headerRow}>
            <Text style={styles.cellChk}></Text>
            <Text style={[styles.headerCell, { flex: 1.5 }]}>MÃ TƯƠNG ĐƯƠNG</Text>
            <Text style={[styles.headerCell, { flex: 3 }]}>TÊN DỊCH VỤ KỸ THUẬT</Text>
            <Text style={[styles.headerCell, { flex: 1 }]}>GIÁ BHYT (VNĐ)</Text>
            {customFields.map(field => (
              <TouchableOpacity key={field} style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }} onLongPress={() => handleDeleteCustomField(field)}>
                <Text style={[styles.headerCell, { color: '#E65100' }]}>{field} ✎</Text>
              </TouchableOpacity>
            ))}
            <Text style={styles.actions}></Text>
          </View>

          {/* Dữ liệu */}
          <FlatList
            data={data.filter(item => JSON.stringify(item).toLowerCase().includes(searchQuery.toLowerCase()))}
            keyExtractor={item => item.id.toString()}
            renderItem={renderItem}
            initialNumToRender={20}
            maxToRenderPerBatch={20}
            windowSize={5}
            ListEmptyComponent={
              <Text style={styles.empty}>Chưa có dữ liệu. Vui lòng Import file Excel Phụ lục 1.</Text>
            }
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF', padding: 10 },
  title: { fontSize: 16, fontWeight: 'bold', color: '#1E88E5', marginBottom: 10, textTransform: 'uppercase' },
  toolbar: { flexDirection: 'row', gap: 10, marginBottom: 10, flexWrap: 'wrap', alignItems: 'center' },
  btnPrimary: { backgroundColor: '#4CAF50', padding: 10, borderRadius: 5 },
  btnInfo: { backgroundColor: '#0288D1', padding: 10, borderRadius: 5 },
  btnDel: { backgroundColor: '#F44336', padding: 10, borderRadius: 5 },
  btnEdit: { backgroundColor: '#FF9800', padding: 6, borderRadius: 4, marginRight: 5 },
  btnSave: { backgroundColor: '#2196F3', padding: 6, borderRadius: 4 },
  txtBtn: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
  addFieldZone: { flexDirection: 'row', marginLeft: 'auto', gap: 5 },
  inputField: { borderWidth: 1, borderColor: '#CCC', borderRadius: 5, paddingHorizontal: 10, minWidth: 150, height: 36 },
  btnAddField: { backgroundColor: '#8E24AA', justifyContent: 'center', paddingHorizontal: 10, borderRadius: 5 },
  search: { borderWidth: 1, borderColor: '#E0E0E0', padding: 10, borderRadius: 5, marginBottom: 10, backgroundColor: '#F9F9F9' },
  headerRow: { flexDirection: 'row', backgroundColor: '#ECEFF1', padding: 10, borderBottomWidth: 2, borderColor: '#CFD8DC' },
  headerCell: { fontWeight: 'bold', fontSize: 12, paddingHorizontal: 5 },
  row: { flexDirection: 'row', padding: 10, borderBottomWidth: 1, borderBottomColor: '#EEE', alignItems: 'center' },
  cell: { fontSize: 13, paddingHorizontal: 5 },
  cellChk: { width: 30, alignItems: 'center' },
  inputEdit: { borderWidth: 1, borderColor: '#2196F3', borderRadius: 4, backgroundColor: '#E3F2FD', padding: 4, marginHorizontal: 2, fontSize: 12 },
  actions: { flexDirection: 'row', width: 90, justifyContent: 'flex-end' },
  empty: { textAlign: 'center', marginTop: 30, color: '#888', fontStyle: 'italic' }
});

export default PhuLuc01DVKT;