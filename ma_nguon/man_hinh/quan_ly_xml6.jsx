/**
 * MODULE: QUẢN LÝ DỮ LIỆU XML6 (CHI TIẾT THANH TOÁN - QĐ 130)
 * Chức năng: 
 * 1. CRUD Toàn diện: Quản lý chi phí tiền giường, tiền thuốc, VTYT và tổng hợp thanh toán.
 * 2. Tùy biến No-code: Cấu trúc cột tự động đồng bộ từ Master Schema (66 trường mở rộng).
 * 3. Nghiệp vụ: Hỗ trợ đối soát tổng chi phí và xuất tệp báo cáo Excel.
 * Giao diện: Pink Theme Phương Châu, Arial > 20px.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as XLSX from 'xlsx';
import { CD } from '../tien_ich/chu_de_giao_dien';

// KẾT NỐI LÕI QUY TẮC CẤU TRÚC (ĐÃ FIX LỖI ĐƯỜNG DẪN 'TRUC')
import { layDanhSachCot } from '../quy_tac/quyluat_cautrucdulieu/quyluat_cau_truc_du_lieu';

const ManHinhXML6 = ({ navigation }) => {
  const [data, setData] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Tự động lấy cấu trúc cột XML6 từ Schema trung tâm
  const COT_MAC_DINH = layDanhSachCot('XML6');

  useEffect(() => {
    taiDuLieu();
  }, []);

  const taiDuLieu = async () => {
    try {
      const stored = await AsyncStorage.getItem('DATA_XML6_THANH_TOAN');
      if (stored) setData(JSON.parse(stored));
    } catch (err) {
      console.error("Lỗi tải dữ liệu XML6:", err);
    }
  };

  const luuDuLieu = async (newData) => {
    try {
      setData(newData);
      await AsyncStorage.setItem('DATA_XML6_THANH_TOAN', JSON.stringify(newData));
    } catch (err) {
      Alert.alert("Lỗi", "Không thể lưu dữ liệu thanh toán.");
    }
  };

  // --- THAO TÁC CRUD ---
  const handleAdd = () => {
    const newEntry = { id: Date.now().toString() };
    COT_MAC_DINH.forEach(col => newEntry[col] = "");
    newEntry['STT'] = data.length + 1;
    luuDuLieu([newEntry, ...data]);
  };

  const handleEdit = (id, col, val) => {
    const updated = data.map(item => item.id === id ? { ...item, [col]: val } : item);
    setData(updated);
  };

  const handleDelete = (id) => {
    Alert.alert("Xác nhận", "Xóa dòng thanh toán này?", [
      { text: "Hủy" },
      { text: "Xóa", onPress: () => luuDuLieu(data.filter(item => item.id !== id)) }
    ]);
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    Alert.alert("Cảnh báo", `Xóa ${selectedIds.length} dòng đã chọn?`, [
      { text: "Hủy" },
      { text: "Xóa", onPress: () => {
        const newData = data.filter(item => !selectedIds.includes(item.id));
        luuDuLieu(newData);
        setSelectedIds([]);
      }}
    ]);
  };

  // --- IMPORT/EXPORT EXCEL ---
  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "XML6_THANH_TOAN");
    XLSX.writeFile(wb, `THANH_TOAN_XML6_${new Date().getTime()}.xlsx`);
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER PINK THEME PHƯƠNG CHÂU */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.btn_back}>
          <Text style={styles.txt_btn}>⬅</Text>
        </TouchableOpacity>
        <Text style={styles.title}>QUẢN LÝ THANH TOÁN (XML6)</Text>
        <TouchableOpacity onPress={exportExcel} style={styles.btn_export}>
          <Text style={styles.txt_btn}>📥 XUẤT EXCEL</Text>
        </TouchableOpacity>
      </View>

      {/* THANH CÔNG CỤ TÙY BIẾN NGƯỜI DÙNG */}
      <View style={styles.toolbar}>
        <TextInput 
          style={styles.search_input} 
          placeholder="Tìm theo Mã LK hoặc số chứng từ..." 
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <View style={styles.group_btns}>
          <TouchableOpacity onPress={handleAdd} style={styles.btn_add}><Text style={styles.txt_btn}>+ THÊM DÒNG</Text></TouchableOpacity>
          {selectedIds.length > 0 && (
            <TouchableOpacity onPress={handleBulkDelete} style={styles.btn_delete}><Text style={styles.txt_btn}>🗑 XÓA ({selectedIds.length})</Text></TouchableOpacity>
          )}
        </View>
      </View>

      {/* BẢNG DỮ LIỆU GRID - PHONG CÁCH PHƯƠNG CHÂU */}
      <ScrollView horizontal style={styles.grid_scroll}>
        <View>
          <View style={styles.row_header}>
            <View style={[styles.cell, styles.cell_header, { width: 60 }]}><Text style={styles.txt_h}>STT</Text></View>
            <View style={[styles.cell, styles.cell_header, { width: 60 }]}><Text style={styles.txt_h}>Chọn</Text></View>
            {COT_MAC_DINH.map((col, i) => (
              <View key={i} style={[styles.cell, styles.cell_header, { width: 220 }]}><Text style={styles.txt_h}>{col}</Text></View>
            ))}
          </View>

          <ScrollView style={{ flex: 1 }}>
            {data.filter(item => (item.MA_LK || "").toUpperCase().includes(searchQuery.toUpperCase())).map((item, index) => (
              <View key={item.id} style={[styles.row_data, selectedIds.includes(item.id) && {backgroundColor: 'rgba(194,24,91,0.2)'}]}>
                <View style={[styles.cell, { width: 60 }]}><Text style={styles.txt_d}>{index + 1}</Text></View>
                <TouchableOpacity onPress={() => toggleSelect(item.id)} style={[styles.cell, { width: 60, alignItems: 'center' }]}>
                  <View style={[styles.checkbox, selectedIds.includes(item.id) && styles.checkbox_on]} />
                </TouchableOpacity>
                {COT_MAC_DINH.map((col, i) => (
                  <View key={i} style={[styles.cell, { width: 220 }]}>
                    <TextInput 
                      style={styles.input_cell}
                      value={String(item[col] || "")}
                      onChangeText={(val) => handleEdit(item.id, col, val)}
                      onBlur={() => luuDuLieu(data)}
                    />
                  </View>
                ))}
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    ...Platform.select({ web: { background: CD.web.gradient_bg } }),
    backgroundColor: CD.bg.gradient_mobile,
  },
  header: {
    ...Platform.select({ web: { background: CD.web.gradient_header, backdropFilter: CD.web.blur_header, boxShadow: CD.web.shadow_header } }),
    backgroundColor: CD.brand.mauDam,
    borderBottomWidth: 1,
    borderBottomColor: CD.border.header,
    paddingHorizontal: 24,
    paddingVertical: 16,
    paddingTop: 45,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: { color: CD.text.primary, fontSize: 24, fontWeight: 'bold', fontFamily: CD.font.family },
  btn_back: { padding: 10 },
  btn_export: {
    ...Platform.select({ web: { background: CD.web.gradient_primary, boxShadow: CD.web.shadow_btn, cursor: CD.web.cursor_pointer } }),
    backgroundColor: CD.brand.mauChinh,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  txt_btn: { color: CD.text.primary, fontWeight: 'bold', fontSize: 18, fontFamily: CD.font.family },

  toolbar: {
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: CD.border.divider,
    backgroundColor: CD.bg.table_row_odd,
  },
  search_input: {
    flex: 1,
    backgroundColor: CD.bg.glass_input,
    borderWidth: 1,
    borderColor: CD.border.input,
    borderRadius: 12,
    color: CD.text.primary,
    fontSize: 22,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginRight: 15,
    fontFamily: CD.font.family,
    ...Platform.select({ web: { outlineStyle: 'none' } }),
  },
  group_btns: { flexDirection: 'row', gap: 10 },
  btn_add: {
    ...Platform.select({ web: { background: CD.web.gradient_green, boxShadow: CD.web.shadow_btn_green, cursor: CD.web.cursor_pointer } }),
    backgroundColor: '#388E3C',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  btn_delete: {
    backgroundColor: 'rgba(244,67,54,0.85)',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    ...Platform.select({ web: { cursor: CD.web.cursor_pointer } }),
  },

  grid_scroll: { flex: 1 },
  row_header: { flexDirection: 'row', backgroundColor: CD.bg.table_header },
  cell: { padding: 10, borderRightWidth: 1, borderColor: CD.border.divider, justifyContent: 'center' },
  cell_header: {
    backgroundColor: CD.bg.table_header,
    borderBottomWidth: 2,
    borderColor: CD.border.accent,
  },
  txt_h: { fontSize: 20, fontWeight: '700', color: CD.text.table_header, textAlign: 'center', fontFamily: CD.font.family },

  row_data: { flexDirection: 'row', borderBottomWidth: 1, borderColor: CD.border.divider },
  txt_d: { fontSize: 22, textAlign: 'center', fontFamily: CD.font.family, color: CD.text.table_cell },
  input_cell: { fontSize: 22, color: CD.text.table_cell, fontFamily: CD.font.family, width: '100%', ...Platform.select({ web: { outlineStyle: 'none' } }) },
  checkbox: { width: 30, height: 30, borderWidth: 2, borderColor: CD.brand.mauNhat, borderRadius: 4 },
  checkbox_on: { backgroundColor: CD.brand.mauChinh },
});

export default ManHinhXML6;