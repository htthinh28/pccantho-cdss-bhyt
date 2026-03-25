/**
 * ============================================================
 * FILE: danh_muc_byt/13_duong_dung/13_duong_dung.jsx
 * MỤC ĐÍCH: Quản lý Danh mục Mã Đường Dùng (Phụ lục 13)
 * CẬP NHẬT: Cho phép tùy biến kích thước cột/dòng bằng cách kéo, xóa hàng loạt.
 * ============================================================
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as XLSX from 'xlsx';

const STORAGE_KEY = '@DM_BYT_PL13_V2';

const PhuLuc13DuongDung = () => {
  const [data, setData] = useState([]);
  const [customFields, setCustomFields] = useState([]); 
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const [newFieldName, setNewFieldName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  // State quản lý độ rộng cột để đồng bộ giữa Header và Body
  const [colWidths, setColWidths] = useState({
    chk: 50,
    stt: 60,
    ma: 150,
    ten: 400
  });

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
      console.error('Lỗi tải dữ liệu PL13:', error);
    } finally {
      setIsLoaded(true);
    }
  };

  const updateDataAndSave = async (newData, newFields = customFields) => {
    setData(newData);
    setCustomFields(newFields);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ data: newData, fields: newFields }));
    } catch (error) {
      console.error('Lỗi lưu dữ liệu:', error);
    }
  };

  // --- XỬ LÝ CHỌN & XÓA HÀNG LOẠT ---
  const toggleSelectAll = () => {
    if (selectedIds.length === data.length && data.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(data.map(item => item.id));
    }
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    const alertTitle = "Xác nhận xóa hàng loạt";
    const alertMsg = `Bạn có chắc chắn muốn xóa vĩnh viễn ${selectedIds.length} bản ghi đã chọn?`;

    const executeDelete = () => {
      const newData = data.filter(item => !selectedIds.includes(item.id));
      updateDataAndSave(newData);
      setSelectedIds([]);
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`${alertTitle}\n${alertMsg}`)) executeDelete();
    } else {
      Alert.alert(alertTitle, alertMsg, [
        { text: "Hủy", style: "cancel" },
        { text: "Xóa", style: "destructive", onPress: executeDelete }
      ]);
    }
  };

  // --- THÊM CỘT ĐỘNG ---
  const handleAddCustomField = () => {
    const fieldName = newFieldName.trim().toUpperCase().replace(/\s+/g, '_');
    if (!fieldName) return;
    if (customFields.includes(fieldName)) return Alert.alert("Lỗi", "Cột đã tồn tại");

    const updatedFields = [...customFields, fieldName];
    const updatedData = data.map(item => ({ ...item, [fieldName]: item[fieldName] || '' }));
    updateDataAndSave(updatedData, updatedFields);
    setNewFieldName('');
  };

  // --- CRUD ---
  const startEdit = (item) => {
    setEditingId(item.id);
    setEditForm({ ...item });
  };

  const saveEdit = () => {
    const updatedData = data.map(item => item.id === editingId ? editForm : item);
    updateDataAndSave(updatedData);
    setEditingId(null);
  };

  // --- EXCEL ---
  const handleImportExcel = async () => {
    if (Platform.OS !== 'web') return Alert.alert("Thông báo", "Vui lòng sử dụng bản Web để Import Excel");
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx, .xls';
    input.onchange = (e) => {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (evt) => {
        const wb = XLSX.read(evt.target.result, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const imported = XLSX.utils.sheet_to_json(ws);
        const formatted = imported.map((item, idx) => ({
          id: item.MA_DUONG_DUNG || Date.now().toString() + idx,
          stt: item.STT || idx + 1,
          ma_duong_dung: item.MA_DUONG_DUNG || '',
          duong_dung_dang_dung: item.DUONG_DUNG_DANG_DUNG || '',
          ...customFields.reduce((acc, f) => ({ ...acc, [f]: item[f] || '' }), {})
        }));
        updateDataAndSave([...formatted, ...data]);
      };
      reader.readAsBinaryString(file);
    };
    input.click();
  };

  const renderHeaderCell = (key, label, widthKey) => (
    <View 
      style={[
        styles.headerCell, 
        { width: colWidths[widthKey] },
        Platform.OS === 'web' && { resize: 'horizontal', overflow: 'hidden' }
      ]}
      onLayout={(e) => {
        const newWidth = e.nativeEvent.layout.width;
        if (Math.abs(colWidths[widthKey] - newWidth) > 2) {
          setColWidths(prev => ({ ...prev, [widthKey]: newWidth }));
        }
      }}
    >
      <Text style={styles.headerText}>{label}</Text>
    </View>
  );

  const renderItem = ({ item, index }) => {
    const isEditing = editingId === item.id;
    const isSelected = selectedIds.includes(item.id);

    return (
      <View style={[styles.row, isSelected && styles.rowSelected]}>
        {/* Checkbox */}
        <TouchableOpacity 
          style={[styles.cell, { width: colWidths.chk, alignItems: 'center' }]} 
          onPress={() => setSelectedIds(prev => isSelected ? prev.filter(id => id !== item.id) : [...prev, item.id])}
        >
          <Text style={{fontSize: 18}}>{isSelected ? '☑' : '☐'}</Text>
        </TouchableOpacity>

        {/* STT */}
        <View style={[styles.cell, { width: colWidths.stt, alignItems: 'center' }]}>
          <Text>{item.stt || index + 1}</Text>
        </View>

        {/* Mã Đường Dùng */}
        <View style={[styles.cell, { width: colWidths.ma }]}>
          <TextInput 
            style={[styles.input, isEditing && styles.inputEditing]}
            value={isEditing ? editForm.ma_duong_dung : item.ma_duong_dung}
            onChangeText={(t) => setEditForm({...editForm, ma_duong_dung: t})}
            editable={isEditing}
          />
        </View>

        {/* Tên Đường Dùng (Cho phép Resize Vertical) */}
        <View style={[styles.cell, { width: colWidths.ten }]}>
          <TextInput 
            style={[
              styles.input, 
              isEditing && styles.inputEditing,
              Platform.OS === 'web' && { resize: 'vertical', overflow: 'auto' }
            ]}
            value={isEditing ? editForm.duong_dung_dang_dung : item.duong_dung_dang_dung}
            onChangeText={(t) => setEditForm({...editForm, duong_dung_dang_dung: t})}
            multiline={true}
            editable={isEditing}
          />
        </View>

        {/* Cột Tùy Biến */}
        {customFields.map(f => (
          <View key={f} style={[styles.cell, { width: 150 }]}>
            <TextInput 
              style={[styles.input, isEditing && styles.inputEditing]}
              value={isEditing ? editForm[f] : item[f]}
              onChangeText={(t) => setEditForm({...editForm, [f]: t})}
              editable={isEditing}
            />
          </View>
        ))}

        {/* Thao tác */}
        <View style={[styles.cell, { width: 150, flexDirection: 'row', gap: 5 }]}>
          {isEditing ? (
            <TouchableOpacity style={styles.btnSave} onPress={saveEdit}>
              <Text style={styles.btnText}>Lưu</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.btnEdit} onPress={() => startEdit(item)}>
              <Text style={styles.btnText}>Sửa</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.btnDelete} onPress={() => updateDataAndSave(data.filter(i => i.id !== item.id))}>
            <Text style={styles.btnText}>Xóa</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerBar}>
        <Image source={{ uri: LOGO_PC }} style={styles.logo} />
        <Text style={styles.title}>PHỤ LỤC 13: DANH MỤC ĐƯỜNG DÙNG THUỐC</Text>
      </View>

      <View style={styles.toolbar}>
        <View style={styles.toolGroup}>
          <TouchableOpacity style={styles.btnAction} onPress={handleImportExcel}>
            <Text style={styles.btnText}>📥 IMPORT EXCEL</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btnAction, {backgroundColor: '#1976D2'}]} onPress={toggleSelectAll}>
            <Text style={styles.btnText}>全 CHỌN TẤT CẢ</Text>
          </TouchableOpacity>
          {selectedIds.length > 0 && (
            <TouchableOpacity style={[styles.btnAction, {backgroundColor: '#D32F2F'}]} onPress={handleBulkDelete}>
              <Text style={styles.btnText}>🗑 XÓA ĐÃ CHỌN ({selectedIds.length})</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.toolGroup}>
          <TextInput 
            style={styles.addFieldInput} 
            placeholder="Tên cột mới..." 
            value={newFieldName} 
            onChangeText={setNewFieldName}
          />
          <TouchableOpacity style={styles.btnSmall} onPress={handleAddCustomField}>
            <Text style={styles.btnText}>+ THÊM CỘT</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TextInput 
        style={styles.searchBar} 
        placeholder="🔍 Tìm kiếm nhanh theo mã hoặc tên đường dùng..." 
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <View style={styles.tableContainer}>
        <ScrollView horizontal>
          <View>
            {/* Header */}
            <View style={styles.headerRow}>
              {renderHeaderCell('chk', selectedIds.length === data.length ? '☑' : '☐', 'chk')}
              {renderHeaderCell('stt', 'STT', 'stt')}
              {renderHeaderCell('ma', 'MÃ ĐƯỜNG DÙNG', 'ma')}
              {renderHeaderCell('ten', 'ĐƯỜNG DÙNG, DẠNG DÙNG', 'ten')}
              {customFields.map(f => (
                <View key={f} style={[styles.headerCell, { width: 150 }]}>
                  <Text style={styles.headerText}>{f}</Text>
                </View>
              ))}
              <View style={[styles.headerCell, { width: 150 }]}>
                <Text style={styles.headerText}>THAO TÁC</Text>
              </View>
            </View>

            {/* Body */}
            {!isLoaded ? (
              <ActivityIndicator size="large" style={{marginTop: 50}} />
            ) : (
              <FlatList
                data={data.filter(i => JSON.stringify(i).toLowerCase().includes(searchQuery.toLowerCase()))}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={{ paddingBottom: 100 }}
              />
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  headerBar: { flexDirection: 'row', alignItems: 'center', padding: 15, backgroundColor: '#0D47A1' },
  logo: { width: 50, height: 50, borderRadius: 25, marginRight: 15, backgroundColor: '#FFF' },
  title: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  
  toolbar: { flexDirection: 'row', justifyContent: 'space-between', padding: 10, borderBottomWidth: 1, borderColor: '#EEE' },
  toolGroup: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  btnAction: { backgroundColor: '#4CAF50', padding: 10, borderRadius: 5 },
  btnSmall: { backgroundColor: '#E91E63', padding: 10, borderRadius: 5 },
  btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 13 },
  addFieldInput: { borderWidth: 1, borderColor: '#DDD', padding: 8, borderRadius: 5, width: 150 },
  
  searchBar: { margin: 10, padding: 12, backgroundColor: '#F5F5F5', borderRadius: 8, fontSize: 16 },
  
  tableContainer: { flex: 1 },
  headerRow: { flexDirection: 'row', backgroundColor: '#E3F2FD', borderBottomWidth: 2, borderColor: '#1976D2' },
  headerCell: { padding: 12, borderRightWidth: 1, borderColor: '#90CAF9', justifyContent: 'center', minHeight: 50 },
  headerText: { fontWeight: 'bold', color: '#0D47A1', textAlign: 'center' },
  
  row: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#EEE', alignItems: 'stretch' },
  rowSelected: { backgroundColor: '#F1F8E9' },
  cell: { borderRightWidth: 1, borderColor: '#EEE', padding: 5, justifyContent: 'center' },
  
  input: { padding: 8, fontSize: 15, color: '#333', textAlignVertical: 'top' },
  inputEditing: { backgroundColor: '#FFF9C4', borderRadius: 4 },
  
  btnEdit: { backgroundColor: '#FFA000', padding: 5, borderRadius: 3, flex: 1, alignItems: 'center' },
  btnSave: { backgroundColor: '#1976D2', padding: 5, borderRadius: 3, flex: 1, alignItems: 'center' },
  btnDelete: { backgroundColor: '#D32F2F', padding: 5, borderRadius: 3, flex: 1, alignItems: 'center' }
});

export default PhuLuc13DuongDung;