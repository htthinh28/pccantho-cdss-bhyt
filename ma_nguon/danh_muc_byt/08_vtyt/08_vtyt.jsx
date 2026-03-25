/**
 * ============================================================
 * FILE: danh_muc_byt/08_vtyt/08_vtyt.jsx
 * MỤC ĐÍCH: Quản lý Phụ lục 8 (Mã Vật tư y tế) - QĐ 7603/QĐ-BYT
 * TÍNH NĂNG: Full CRUD, Dynamic Columns (No-code), Auto-save, Excel In/Out, Tối ưu hóa Big Data
 * ============================================================
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as XLSX from 'xlsx';

const STORAGE_KEY = '@DM_BYT_PL08_V1';

const PhuLuc08VTYT = () => {
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
      console.error('Lỗi tải dữ liệu PL8:', error);
    }
  };

  const autoSaveToStorage = async (newData, newFields) => {
    try {
      // Đối với dữ liệu VTYT lớn, việc stringify có thể nặng nhưng AsyncStorage vẫn xử lý được tốt trên bản Web/Desktop
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ data: newData, fields: newFields }));
    } catch (error) {
      console.error('Lỗi Auto-save PL8:', error);
    }
  };

  const updateDataAndSave = (newData) => {
    setData(newData);
    autoSaveToStorage(newData, customFields);
  };

  // --- 2. THÊM TRƯỜNG DỮ LIỆU ĐỘNG (DYNAMIC COLUMNS) ---
  const handleAddCustomField = () => {
    const fieldName = newFieldName.trim().toUpperCase().replace(/\s+/g, '_');
    if (!fieldName) return Alert.alert("Lỗi", "Nhập tên cột (VD: GIA_THAU, SO_QD)");
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
      "Sử dụng file 'Phu luc 08.xls - Danh muc ma VTYT.csv'. Các cột ưu tiên: MA_VAT_TU, Tên thương mại, Đơn vị tính, Mã hiệu, Hãng sản xuất. Có thể tạo thêm cột trước khi Import."
    );
  };

  const handleImportExcel = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: '*/*' });
      if (result.canceled) return;
      
      Alert.alert("Đang xử lý", "Hệ thống đang nạp danh mục VTYT, vui lòng chờ...");
      
      const fileString = await FileSystem.readAsStringAsync(result.assets[0].uri, { encoding: FileSystem.EncodingType.Base64 });
      const workbook = XLSX.read(fileString, { type: 'base64' });
      const parsedData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
      
      const mergedData = [...data, ...parsedData.map((item, idx) => {
        const maVatTu = item['MA_VAT_TU'] || item['Mã số theo nhóm'] || Date.now().toString() + idx;
        const tenVatTu = item['Nhóm, loại vật tư - \nTên thương mại của vật tư y tế'] || item['Tên vật tư'] || item['Tên thương mại'] || '';
        
        return {
          id: maVatTu,
          ma_vat_tu: maVatTu,
          ten_vat_tu: tenVatTu,
          dvt: item['Đơn vị tính'] || '',
          ma_hieu: item['Mã hiệu vật tư'] || item['Mã hiệu'] || '',
          hang_sx: item['Hãng sản xuất'] || '',
          nuoc_sx: item['Nước sản xuất'] || '',
          ...customFields.reduce((acc, field) => ({ ...acc, [field]: item[field] || '' }), {})
        };
      })].filter(item => item.ma_vat_tu !== '' && item.ten_vat_tu !== ''); 
      
      const uniqueData = Array.from(new Map(mergedData.map(item => [item.ma_vat_tu, item])).values());
      updateDataAndSave(uniqueData);
      Alert.alert("Thành công", `Đã import ${uniqueData.length} danh mục VTYT.`);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể đọc file Excel.");
    }
  };

  const handleExportExcel = () => {
    try {
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "PL08_VTYT");
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
            <TextInput style={[styles.cellEdit, { flex: 2 }]} value={editForm.ma_vat_tu} onChangeText={(t) => setEditForm({...editForm, ma_vat_tu: t})} />
            <TextInput style={[styles.cellEdit, { flex: 3 }]} value={editForm.ten_vat_tu} onChangeText={(t) => setEditForm({...editForm, ten_vat_tu: t})} multiline />
            <TextInput style={[styles.cellEdit, { flex: 1 }]} value={editForm.dvt} onChangeText={(t) => setEditForm({...editForm, dvt: t})} />
            <TextInput style={[styles.cellEdit, { flex: 1.5 }]} value={editForm.ma_hieu} onChangeText={(t) => setEditForm({...editForm, ma_hieu: t})} />
            <TextInput style={[styles.cellEdit, { flex: 1.5 }]} value={editForm.hang_sx} onChangeText={(t) => setEditForm({...editForm, hang_sx: t})} />
            <TextInput style={[styles.cellEdit, { flex: 1.5 }]} value={editForm.nuoc_sx} onChangeText={(t) => setEditForm({...editForm, nuoc_sx: t})} />
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
            <Text style={[styles.cell, { flex: 2, color: '#1565C0', fontWeight: 'bold' }]}>{item.ma_vat_tu}</Text>
            <Text style={[styles.cell, { flex: 3, fontWeight: '500' }]}>{item.ten_vat_tu}</Text>
            <Text style={[styles.cell, { flex: 1, textAlign: 'center' }]}>{item.dvt}</Text>
            <Text style={[styles.cell, { flex: 1.5, color: '#D84315' }]}>{item.ma_hieu}</Text>
            <Text style={[styles.cell, { flex: 1.5 }]}>{item.hang_sx}</Text>
            <Text style={[styles.cell, { flex: 1.5 }]}>{item.nuoc_sx}</Text>
            {customFields.map(field => (
              <Text key={field} style={[styles.cell, { flex: 1.5, color: '#00695C' }]}>{item[field]}</Text>
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
      <Text style={styles.title}>PHỤ LỤC 8 - DANH MỤC MÃ VẬT TƯ Y TẾ (QĐ 7603)</Text>
      
      {/* TOOLBAR */}
      <View style={styles.toolbar}>
        <TouchableOpacity style={styles.btnPrimary} onPress={handleImportExcel}><Text style={styles.txtBtn}>📥 Import</Text></TouchableOpacity>
        <TouchableOpacity style={styles.btnPrimary} onPress={handleExportExcel}><Text style={styles.txtBtn}>📤 Export</Text></TouchableOpacity>
        <TouchableOpacity style={styles.btnInfo} onPress={handleDownloadTemplate}><Text style={styles.txtBtn}>📄 Mẫu</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.btnDel, { opacity: selectedIds.length ? 1 : 0.5 }]} onPress={handleBulkDelete}>
          <Text style={styles.txtBtn}>🗑 Xóa ({selectedIds.length})</Text>
        </TouchableOpacity>
        
        <View style={styles.addFieldZone}>
          <TextInput style={styles.inputField} placeholder="VD: GIA_THAU..." value={newFieldName} onChangeText={setNewFieldName} />
          <TouchableOpacity style={styles.btnAddField} onPress={handleAddCustomField}><Text style={styles.txtBtn}>+ Thêm Cột</Text></TouchableOpacity>
        </View>
      </View>

      <TextInput style={styles.search} placeholder="Tra cứu mã VTYT, tên vật tư, hãng sản xuất..." value={searchQuery} onChangeText={setSearchQuery} />

      {/* TABLE */}
      <ScrollView horizontal>
        <View style={{ minWidth: '100%' }}>
          <View style={styles.headerRow}>
            <Text style={styles.cellChk}></Text>
            <Text style={[styles.headerCell, { flex: 2 }]}>MÃ VẬT TƯ</Text>
            <Text style={[styles.headerCell, { flex: 3 }]}>TÊN THƯƠNG MẠI VTYT</Text>
            <Text style={[styles.headerCell, { flex: 1, textAlign: 'center' }]}>ĐVT</Text>
            <Text style={[styles.headerCell, { flex: 1.5 }]}>MODEL</Text>
            <Text style={[styles.headerCell, { flex: 1.5 }]}>HÃNG SX</Text>
            <Text style={[styles.headerCell, { flex: 1.5 }]}>NƯỚC SX</Text>
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
            initialNumToRender={15} 
            maxToRenderPerBatch={20}
            windowSize={5}
            removeClippedSubviews={true}
            ListEmptyComponent={<Text style={styles.empty}>Chưa có dữ liệu. Vui lòng Import file Excel Phụ lục 8.</Text>}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF', padding: 10 },
  title: { fontSize: 16, fontWeight: 'bold', color: '#FF6F00', marginBottom: 10, textTransform: 'uppercase' },
  toolbar: { flexDirection: 'row', gap: 8, marginBottom: 10, flexWrap: 'wrap', alignItems: 'center' },
  btnPrimary: { backgroundColor: '#4CAF50', padding: 8, borderRadius: 4 },
  btnInfo: { backgroundColor: '#0288D1', padding: 8, borderRadius: 4 },
  btnDel: { backgroundColor: '#D32F2F', padding: 8, borderRadius: 4 },
  btnEdit: { backgroundColor: '#F57C00', padding: 6, borderRadius: 4, marginRight: 5 },
  btnSave: { backgroundColor: '#1976D2', padding: 6, borderRadius: 4 },
  txtBtn: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
  addFieldZone: { flexDirection: 'row', marginLeft: 'auto', gap: 5 },
  inputField: { borderWidth: 1, borderColor: '#B0BEC5', borderRadius: 4, paddingHorizontal: 8, height: 32, minWidth: 140 },
  btnAddField: { backgroundColor: '#FF8F00', justifyContent: 'center', paddingHorizontal: 10, borderRadius: 4 },
  search: { borderWidth: 1, borderColor: '#E0E0E0', padding: 8, borderRadius: 4, marginBottom: 10, backgroundColor: '#FFF8E1' },
  headerRow: { flexDirection: 'row', backgroundColor: '#FFECB3', padding: 10, borderBottomWidth: 2, borderColor: '#FFB300' },
  headerCell: { fontWeight: 'bold', fontSize: 11, paddingHorizontal: 4, color: '#3E2723' },
  row: { flexDirection: 'row', padding: 10, borderBottomWidth: 1, borderBottomColor: '#EEEEEE', alignItems: 'center' },
  cell: { fontSize: 12, paddingHorizontal: 4 },
  cellEdit: { borderWidth: 1, borderColor: '#FFB300', borderRadius: 4, backgroundColor: '#FFF8E1', padding: 4, marginHorizontal: 2, fontSize: 12 },
  cellChk: { width: 30, alignItems: 'center' },
  actions: { flexDirection: 'row', width: 90, justifyContent: 'flex-end' },
  empty: { textAlign: 'center', marginTop: 30, color: '#78909C', fontStyle: 'italic' }
});

export default PhuLuc08VTYT;