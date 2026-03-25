/**
 * MODULE: QUẢN LÝ DỮ LIỆU XML1 (TỔNG HỢP HỒ SƠ - 66 TRƯỜNG QĐ 130)
 * Chức năng:
 * 1. CRUD Toàn diện: Thêm, Sửa, Xóa, Xóa hàng loạt.
 * 2. Linh hoạt: Tự động cập nhật cột từ Schema No-code.
 * 3. Giao tiếp dữ liệu: Import/Export Excel chuẩn BHYT.
 * Giao diện: Glassmorphism Dark Theme Phương Châu, Arial > 20px.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as XLSX from 'xlsx';
import { CD } from '../tien_ich/chu_de_giao_dien';

// KẾT NỐI LÕI QUY TẮC CẤU TRÚC (SỬA LỖI ĐƯỜNG DẪN 'TRUC')
import { layDanhSachCot } from '../quy_tac/quyluat_cautrucdulieu/quyluat_cau_truc_du_lieu';

const ManHinhXML1 = ({ navigation }) => {
  const [data, setData] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Tự động lấy 66 trường từ Schema No-code
  const COT_MAC_DINH = layDanhSachCot('XML1');

  useEffect(() => {
    taiDuLieu();
  }, []);

  const taiDuLieu = async () => {
    try {
      const stored = await AsyncStorage.getItem('DATA_XML1_130');
      if (stored) setData(JSON.parse(stored));
    } catch (err) {
      console.error("Lỗi tải dữ liệu XML1:", err);
    }
  };

  const luuDuLieu = async (newData) => {
    try {
      setData(newData);
      await AsyncStorage.setItem('DATA_XML1_130', JSON.stringify(newData));
    } catch (err) {
      Alert.alert("Lỗi", "Không thể lưu dữ liệu.");
    }
  };

  // --- THAO TÁC CRUD ---
  const handleAdd = () => {
    const newEntry = { id: Date.now().toString() };
    COT_MAC_DINH.forEach(col => newEntry[col] = "");
    luuDuLieu([newEntry, ...data]);
  };

  const handleEdit = (id, col, val) => {
    const updated = data.map(item => item.id === id ? { ...item, [col]: val } : item);
    setData(updated); // Cập nhật UI nhanh, lưu sau hoặc lưu debounce
  };

  const handleDelete = (id) => {
    Alert.alert("Xác nhận", "Xóa dòng dữ liệu này?", [
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
    XLSX.utils.book_append_sheet(wb, ws, "XML1_130");
    XLSX.writeFile(wb, `DANH_SACH_XML1_${new Date().getTime()}.xlsx`);
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER GLASSMORPHISM */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.btn_back}>
          <Text style={styles.txt_btn}>⬅</Text>
        </TouchableOpacity>
        <Text style={styles.title}>QUẢN LÝ TỔNG HỢP HỒ SƠ (XML1)</Text>
        <TouchableOpacity onPress={exportExcel} style={styles.btn_export}>
          <Text style={styles.txt_btn}>📥 XUẤT EXCEL</Text>
        </TouchableOpacity>
      </View>

      {/* THANH CÔNG CỤ TÙY BIẾN */}
      <View style={styles.toolbar}>
        <TextInput
          style={styles.search_input}
          placeholder="Tìm theo MA_LK hoặc HO_TEN..."
          placeholderTextColor="rgba(255,255,255,0.4)"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <View style={styles.group_btns}>
          <TouchableOpacity onPress={handleAdd} style={styles.btn_add}><Text style={styles.txt_btn}>+ THÊM MỚI</Text></TouchableOpacity>
          {selectedIds.length > 0 && (
            <TouchableOpacity onPress={handleBulkDelete} style={styles.btn_delete}><Text style={styles.txt_btn}>🗑 XÓA ({selectedIds.length})</Text></TouchableOpacity>
          )}
        </View>
      </View>

      {/* BẢNG DỮ LIỆU 66 CỘT */}
      <ScrollView horizontal style={styles.grid_scroll}>
        <View style={styles.table_container}>
          <View style={styles.row_header}>
            <View style={[styles.cell, styles.cell_header, { width: 60 }]}><Text style={styles.txt_h}>STT</Text></View>
            <View style={[styles.cell, styles.cell_header, { width: 60 }]}><Text style={styles.txt_h}>Chọn</Text></View>
            {COT_MAC_DINH.map((col, i) => (
              <View key={i} style={[styles.cell, styles.cell_header, { width: 220 }]}><Text style={styles.txt_h}>{col}</Text></View>
            ))}
          </View>

          <ScrollView style={{ flex: 1 }}>
            {data.filter(item => (item.MA_LK + item.HO_TEN).toUpperCase().includes(searchQuery.toUpperCase())).map((item, index) => (
              <View key={item.id} style={[styles.row_data, index % 2 === 0 ? styles.row_even : styles.row_odd, selectedIds.includes(item.id) && styles.row_selected]}>
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
                      onBlur={() => luuDuLieu(data)} // Lưu khi rời ô
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
    backgroundColor: CD.bg.gradient_mobile,
    ...Platform.select({ web: { background: CD.web.gradient_bg } }),
  },
  header: {
    backgroundColor: CD.brand.mauDam,
    paddingHorizontal: 24,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: CD.border.header,
    ...Platform.select({
      web: {
        background: CD.web.gradient_header,
        backdropFilter: CD.web.blur_header,
        boxShadow: CD.web.shadow_header,
      },
    }),
  },
  title: { color: CD.text.primary, fontSize: 24, fontWeight: 'bold', fontFamily: CD.font.family },
  btn_back: { padding: 10 },
  btn_export: {
    backgroundColor: CD.brand.mauChinh,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    ...Platform.select({
      web: {
        background: CD.web.gradient_primary,
        boxShadow: CD.web.shadow_btn,
        cursor: CD.web.cursor_pointer,
      },
    }),
  },
  txt_btn: { color: CD.text.primary, fontWeight: 'bold', fontSize: 18, fontFamily: CD.font.family },

  toolbar: {
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: CD.border.divider,
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
    backgroundColor: '#388E3C',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    ...Platform.select({
      web: {
        background: CD.web.gradient_green,
        boxShadow: CD.web.shadow_btn_green,
        cursor: CD.web.cursor_pointer,
      },
    }),
  },
  btn_delete: {
    backgroundColor: CD.bg.glass_input,
    borderWidth: 1,
    borderColor: CD.border.glass_md,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 18,
    ...Platform.select({ web: { cursor: CD.web.cursor_pointer } }),
  },

  grid_scroll: { flex: 1 },
  table_container: {
    borderWidth: 1,
    borderColor: CD.border.divider,
    borderRadius: 16,
    overflow: 'hidden',
    margin: 12,
  },
  row_header: { flexDirection: 'row', backgroundColor: CD.bg.table_header },
  cell: {
    padding: 10,
    borderRightWidth: 1,
    borderColor: CD.border.divider,
    justifyContent: 'center',
  },
  cell_header: {
    borderBottomWidth: 1,
    borderBottomColor: CD.border.glass,
  },
  txt_h: { fontSize: 20, fontWeight: '700', color: CD.text.table_header, textAlign: 'center', fontFamily: CD.font.family },

  row_data: { flexDirection: 'row' },
  row_even: { backgroundColor: CD.bg.table_row_even },
  row_odd: { backgroundColor: CD.bg.table_row_odd },
  row_selected: { backgroundColor: CD.bg.table_row_sel },
  txt_d: { fontSize: 20, textAlign: 'center', fontFamily: CD.font.family, color: CD.text.table_cell },
  input_cell: {
    fontSize: 20,
    color: CD.text.table_cell,
    fontFamily: CD.font.family,
    width: '100%',
    ...Platform.select({ web: { outlineStyle: 'none', backgroundColor: 'transparent' } }),
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: CD.brand.mauNhat,
    borderRadius: 4,
  },
  checkbox_on: { backgroundColor: CD.brand.mauChinh, borderColor: CD.brand.mauChinh },
});

export default ManHinhXML1;
