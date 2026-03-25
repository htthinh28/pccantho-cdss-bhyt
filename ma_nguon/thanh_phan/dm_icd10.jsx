/**
 * MODULE: QUẢN LÝ DANH MỤC MÃ BỆNH ICD-10 (CHUẨN BỘ Y TẾ)
 * Chức năng: CRUD, Import/Export Excel, Tải File Mẫu, Bulk Delete
 * Căn cứ: QĐ 3176/QĐ-BYT (Danh mục dùng chung)
 * Giao diện: Pink Theme Phương Châu, Arial > 20px
 * Nâng cấp (Bản 1.5): Sửa lỗi lưu Import, hiển thị Fullscreen, dãn dòng cột rộng rãi.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { Alert, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as XLSX from 'xlsx';

const DanhMucICD10 = ({ navigation }) => {
  const [danhSachICD, setDanhSachICD] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  
  // State quản lý Form nhập liệu
  const [editingId, setEditingId] = useState(null);
  const [maBenh, setMaBenh] = useState('');
  const [maBenhKhongDau, setMaBenhKhongDau] = useState('');
  const [diseaseName, setDiseaseName] = useState('');
  const [tenBenh, setTenBenh] = useState('');

  // Tải dữ liệu khi mở màn hình
  useEffect(() => {
    const taiDuLieu = async () => {
      try {
        const raw = await AsyncStorage.getItem('DANH_MUC_ICD10');
        if (raw) setDanhSachICD(JSON.parse(raw));
      } catch (e) {
        console.error('Lỗi tải ICD10:', e);
      }
    };
    taiDuLieu();
  }, []);

  const luuDuLieuVaoKho = async (dataMoi) => {
    try {
      await AsyncStorage.setItem('DANH_MUC_ICD10', JSON.stringify(dataMoi));
      setDanhSachICD(dataMoi); // Cập nhật State để UI render lại lập tức
    } catch (e) {
      console.error('Lỗi lưu ICD10:', e);
    }
  };

  // --- CRUD FUNCTIONS ---
  const handleLuuThemMoi = () => {
    if (!maBenh || !tenBenh) return Alert.alert("Thông báo", "Vui lòng nhập tối thiểu Mã bệnh và Tên bệnh!");
    
    if (editingId) {
      const dataCapNhat = danhSachICD.map(item => 
        item.id === editingId 
          ? { ...item, 'MÃ BỆNH': maBenh, 'MÃ BỆNH KHÔNG DẤU': maBenhKhongDau, 'DISEASE NAME': diseaseName, 'TÊN BỆNH': tenBenh }
          : item
      );
      luuDuLieuVaoKho(dataCapNhat);
      setEditingId(null);
    } else {
      const objMoi = {
        id: `ICD_${Date.now()}`,
        'MÃ BỆNH': maBenh.toUpperCase(),
        'MÃ BỆNH KHÔNG DẤU': maBenhKhongDau.toUpperCase(),
        'DISEASE NAME': diseaseName,
        'TÊN BỆNH': tenBenh
      };
      luuDuLieuVaoKho([objMoi, ...danhSachICD]);
    }
    
    setMaBenh(''); setMaBenhKhongDau(''); setDiseaseName(''); setTenBenh('');
  };

  const handleSua = (item) => {
    setEditingId(item.id);
    setMaBenh(item['MÃ BỆNH'] || '');
    setMaBenhKhongDau(item['MÃ BỆNH KHÔNG DẤU'] || '');
    setDiseaseName(item['DISEASE NAME'] || '');
    setTenBenh(item['TÊN BỆNH'] || '');
  };

  const handleXoa = (id) => {
    if (Platform.OS === 'web') {
      if (window.confirm("Bác sĩ có chắc chắn muốn xóa mã bệnh này khỏi hệ thống?")) {
        luuDuLieuVaoKho(danhSachICD.filter(item => item.id !== id));
      }
    } else {
      Alert.alert("Xác nhận", "Bác sĩ có chắc chắn muốn xóa mã bệnh này khỏi hệ thống?", [
        { text: "Hủy" }, 
        { text: "Xóa", onPress: () => luuDuLieuVaoKho(danhSachICD.filter(item => item.id !== id)) }
      ]);
    }
  };

  const handleXoaHangLoat = () => {
    if (selectedRows.length === 0) return Alert.alert("Thông báo", "Chưa chọn dòng nào!");
    if (Platform.OS === 'web') {
      if (window.confirm(`Xóa vĩnh viễn ${selectedRows.length} mã bệnh đã chọn?`)) {
        luuDuLieuVaoKho(danhSachICD.filter(item => !selectedRows.includes(item.id)));
        setSelectedRows([]);
      }
    }
  };

  const toggleSelect = (id) => {
    setSelectedRows(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]);
  };

  // --- EXCEL FUNCTIONS ---
  const handleTaiFileMau = () => {
    if (Platform.OS !== 'web') return Alert.alert("Thông báo", "Chỉ hỗ trợ trên Web.");
    try {
      const templateCols = ['MÃ BỆNH', 'MÃ BỆNH KHÔNG DẤU', 'DISEASE NAME', 'TÊN BỆNH'];
      const emptyRow = templateCols.reduce((acc, curr) => ({ ...acc, [curr]: "" }), {});
      
      const worksheet = XLSX.utils.json_to_sheet([emptyRow], { header: templateCols });
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Template_ICD10");
      XLSX.writeFile(workbook, `FileMau_DanhMuc_ICD10.xlsx`);
    } catch (e) {
      alert("Lỗi tải mẫu: " + e.message);
    }
  };

  const handleExportXLSX = () => {
    if (danhSachICD.length === 0) return Alert.alert("Thông báo", "Không có dữ liệu để xuất!");
    if (Platform.OS === 'web') {
      const exportData = danhSachICD.map(item => {
        const { id, ...rest } = item;
        return rest;
      });
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "ICD_10");
      XLSX.writeFile(workbook, `Danh_Muc_ICD10.xlsx`);
    }
  };

  const handleImportExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const importedData = XLSX.utils.sheet_to_json(ws, { defval: "" });
        
        if (importedData.length > 0) {
          const formattedData = importedData.map(row => ({
            ...row,
            id: `ICD_IMP_${Date.now()}_${Math.random()}` // ID độc nhất
          }));
          
          // Nối dữ liệu mới vào dữ liệu cũ, lọc bỏ trùng lắp theo MÃ BỆNH (nếu cần)
          const newData = [...formattedData, ...danhSachICD];
          
          // LƯU TRỰC TIẾP VÀO KHO
          await luuDuLieuVaoKho(newData);
          alert(`✅ Import thành công ${formattedData.length} mã bệnh và đã lưu vào hệ thống!`);
        }
      } catch (err) {
        alert("Lỗi khi đọc file Excel: " + err.message);
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = null; // Reset ô input file
  };

  return (
    <SafeAreaView style={styles.vung_an_toan}>
      {/* 1. THANH TIÊU ĐỀ */}
      <View style={styles.thanh_tieu_de}>
        <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.nut_quay_lai}>
          <Text style={styles.chu_nut_header}>⬅ TRỞ VỀ QUẢN LÝ DANH MỤC</Text>
        </TouchableOpacity>
        <Text style={styles.chu_tieu_de}>🗂️ CẤU HÌNH DANH MỤC ICD-10</Text>
        <View style={{ width: 220 }} />
      </View>

      <View style={styles.khung_chuc_nang}>
        
        {/* 2. FORM NHẬP LIỆU NHANH */}
        <View style={styles.form_nhap_lieu}>
          <Text style={styles.tieu_de_form}>{editingId ? '✏️ CHỈNH SỬA MÃ BỆNH' : '➕ THÊM MỚI MÃ BỆNH (THỦ CÔNG)'}</Text>
          <View style={styles.row_inputs}>
            <TextInput style={styles.input_box} placeholder="MÃ BỆNH (VD: A00)" value={maBenh} onChangeText={setMaBenh} />
            <TextInput style={styles.input_box} placeholder="MÃ BỆNH KHÔNG DẤU (VD: A000)" value={maBenhKhongDau} onChangeText={setMaBenhKhongDau} />
          </View>
          <View style={styles.row_inputs}>
            <TextInput style={styles.input_box} placeholder="DISEASE NAME (Tiếng Anh)" value={diseaseName} onChangeText={setDiseaseName} />
            <TextInput style={styles.input_box} placeholder="TÊN BỆNH (Tiếng Việt)" value={tenBenh} onChangeText={setTenBenh} />
          </View>
          <View style={styles.row_btns}>
            <TouchableOpacity style={styles.btn_luu_lon} onPress={handleLuuThemMoi}>
              <Text style={styles.chu_btn_lon}>{editingId ? '💾 CẬP NHẬT' : '💾 LƯU THÊM MỚI'}</Text>
            </TouchableOpacity>
            {editingId && (
              <TouchableOpacity style={[styles.btn_luu_lon, { backgroundColor: '#757575' }]} onPress={() => { setEditingId(null); setMaBenh(''); setMaBenhKhongDau(''); setDiseaseName(''); setTenBenh(''); }}>
                <Text style={styles.chu_btn_lon}>✕ HỦY SỬA</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* 3. KHU VỰC BẢNG DỮ LIỆU (FULLSCREEN FLEX 1) */}
        <View style={styles.khung_bang_master}>
            
            {/* TOOLBAR NẰM NGAY TRÊN BẢNG */}
            <View style={styles.thanh_tieu_de_bang}>
              <Text style={styles.tieu_de_bang}>📋 KHO DỮ LIỆU ICD-10 ({danhSachICD.length} MÃ)</Text>
              <View style={{ flexDirection: 'row', gap: 15 }}>
                {selectedRows.length > 0 && (
                  <TouchableOpacity style={[styles.btn_hanh_dong, { backgroundColor: '#D32F2F' }]} onPress={handleXoaHangLoat}>
                    <Text style={styles.chu_btn_nho}>🗑 XÓA ({selectedRows.length})</Text>
                  </TouchableOpacity>
                )}
                
                <TouchableOpacity style={[styles.btn_hanh_dong, { backgroundColor: '#4CAF50' }]} onPress={handleTaiFileMau}>
                  <Text style={styles.chu_btn_nho}>⬇ TẢI FILE MẪU</Text>
                </TouchableOpacity>

                {Platform.OS === 'web' && (
                  <React.Fragment>
                    <input type="file" accept=".xlsx, .xls, .csv" onChange={handleImportExcel} style={{ display: 'none' }} id="import-icd" />
                    <TouchableOpacity style={[styles.btn_hanh_dong, { backgroundColor: '#FF9800' }]} onPress={() => document.getElementById('import-icd').click()}>
                      <Text style={styles.chu_btn_nho}>📤 IMPORT EXCEL</Text>
                    </TouchableOpacity>
                  </React.Fragment>
                )}
                <TouchableOpacity style={[styles.btn_hanh_dong, { backgroundColor: '#1976D2' }]} onPress={handleExportXLSX}>
                  <Text style={styles.chu_btn_nho}>📥 EXPORT EXCEL</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* BẢNG DỮ LIỆU CHÍNH */}
            <ScrollView horizontal style={styles.scroll_ngang}>
              <View style={styles.bang_chinh}>
                {/* HEADER BẢNG (Dãn cột rộng) */}
                <View style={styles.dong_header}>
                  <View style={[styles.o_header, { width: 80 }]}></View>
                  <View style={[styles.o_header, { width: 150 }]}><Text style={styles.chu_header}>MÃ BỆNH</Text></View>
                  <View style={[styles.o_header, { width: 180 }]}><Text style={styles.chu_header}>MÃ KHÔNG DẤU</Text></View>
                  <View style={[styles.o_header, { width: 450 }]}><Text style={styles.chu_header}>TÊN BỆNH (VIỆT)</Text></View>
                  <View style={[styles.o_header, { width: 400 }]}><Text style={styles.chu_header}>DISEASE NAME (ANH)</Text></View>
                  <View style={[styles.o_header, { width: 180 }]}><Text style={styles.chu_header}>THAO TÁC</Text></View>
                </View>
                
                {/* BODY BẢNG */}
                <ScrollView showsVerticalScrollIndicator={true} style={styles.scroll_doc}>
                  {danhSachICD.map((item) => (
                    <View key={item.id} style={[styles.dong_du_lieu, selectedRows.includes(item.id) && { backgroundColor: '#FFF0F5' }]}>
                      
                      <TouchableOpacity style={[styles.o_cell, { width: 80, alignItems: 'center' }]} onPress={() => toggleSelect(item.id)}>
                        <View style={[styles.checkbox, selectedRows.includes(item.id) && styles.checkbox_active]}>
                          {selectedRows.includes(item.id) && <Text style={{ color: '#FFF', fontWeight: 'bold' }}>✓</Text>}
                        </View>
                      </TouchableOpacity>
                      
                      <View style={[styles.o_cell, { width: 150 }]}><Text style={[styles.chu_cell, { fontWeight: 'bold', color: '#D81B60' }]}>{item['MÃ BỆNH']}</Text></View>
                      <View style={[styles.o_cell, { width: 180 }]}><Text style={styles.chu_cell}>{item['MÃ BỆNH KHÔNG DẤU']}</Text></View>
                      <View style={[styles.o_cell, { width: 450 }]}><Text style={styles.chu_cell}>{item['TÊN BỆNH']}</Text></View>
                      <View style={[styles.o_cell, { width: 400 }]}><Text style={styles.chu_cell}>{item['DISEASE NAME']}</Text></View>
                      
                      <View style={[styles.o_cell, { width: 180, flexDirection: 'row', gap: 15, justifyContent: 'center' }]}>
                        <TouchableOpacity style={styles.btn_action_mini} onPress={() => handleSua(item)}>
                            <Text style={styles.txt_action_mini}>SỬA</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.btn_action_mini, {backgroundColor: '#D32F2F'}]} onPress={() => handleXoa(item.id)}>
                            <Text style={styles.txt_action_mini}>XÓA</Text>
                        </TouchableOpacity>
                      </View>

                    </View>
                  ))}

                  {/* NẾU RỖNG */}
                  {danhSachICD.length === 0 && (
                    <Text style={{ padding: 60, textAlign: 'center', fontSize: 22, color: '#999', fontStyle: 'italic', fontFamily: 'Arial' }}>
                      Kho danh mục ICD-10 đang trống. Bác sĩ hãy tải file mẫu và Import dữ liệu vào hệ thống.
                    </Text>
                  )}
                </ScrollView>
              </View>
            </ScrollView>
        </View>

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  vung_an_toan: { flex: 1, backgroundColor: '#F0F4F8' },
  
  // HEADER 
  thanh_tieu_de: { backgroundColor: '#FF66A3', padding: 25, paddingTop: 45, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', elevation: 4 },
  nut_quay_lai: { padding: 15, backgroundColor: '#D81B60', borderRadius: 8 },
  chu_nut_header: { color: '#FFF', fontWeight: 'bold', fontSize: 20, fontFamily: 'Arial' },
  chu_tieu_de: { fontSize: 28, color: '#FFF', fontWeight: 'bold', fontFamily: 'Arial', letterSpacing: 1 },
  
  khung_chuc_nang: { padding: 25, flex: 1 },

  // FORM NHẬP
  form_nhap_lieu: { backgroundColor: '#FFF', padding: 25, borderRadius: 12, elevation: 3, marginBottom: 25, borderWidth: 1, borderColor: '#FFCDD2' },
  tieu_de_form: { fontSize: 24, fontWeight: 'bold', color: '#D81B60', marginBottom: 20, fontFamily: 'Arial' },
  row_inputs: { flexDirection: 'row', gap: 20, marginBottom: 15 },
  input_box: { flex: 1, borderWidth: 2, borderColor: '#E0E0E0', padding: 18, borderRadius: 8, fontSize: 20, fontFamily: 'Arial', backgroundColor: '#FAFAFA' },
  row_btns: { flexDirection: 'row', gap: 15, marginTop: 10 },
  btn_luu_lon: { backgroundColor: '#D81B60', paddingVertical: 18, paddingHorizontal: 35, borderRadius: 8, alignItems: 'center', justifyContent: 'center', elevation: 2 },
  chu_btn_lon: { color: '#FFF', fontSize: 20, fontWeight: 'bold', fontFamily: 'Arial' },
  
  // TOOLBAR BẢNG
  thanh_tieu_de_bang: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#EEE' },
  tieu_de_bang: { fontSize: 24, fontWeight: 'bold', color: '#880E4F', fontFamily: 'Arial' },
  btn_hanh_dong: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8, justifyContent: 'center', elevation: 2 },
  chu_btn_nho: { color: '#FFF', fontSize: 18, fontWeight: 'bold', fontFamily: 'Arial' },

  // KHU VỰC BẢNG (FLEX: 1 ĐỂ MỞ RỘNG TOÀN MÀN HÌNH CÒN LẠI)
  khung_bang_master: { flex: 1, backgroundColor: '#FFF', borderRadius: 10, elevation: 4, overflow: 'hidden', borderWidth: 2, borderColor: '#FFB3D1' },
  scroll_ngang: { flex: 1 },
  bang_chinh: { flex: 1 },
  
  // STYLE CÁC DÒNG CỘT
  dong_header: { flexDirection: 'row', backgroundColor: '#FCE4EC', borderBottomWidth: 3, borderColor: '#D81B60' },
  o_header: { paddingVertical: 18, paddingHorizontal: 15, borderRightWidth: 1, borderColor: '#FFCDD2', justifyContent: 'center', alignItems: 'center' },
  chu_header: { fontSize: 20, fontWeight: 'bold', color: '#880E4F', fontFamily: 'Arial', textAlign: 'center' },
  
  scroll_doc: { flex: 1 },
  dong_du_lieu: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#EEEEEE' },
  o_cell: { paddingVertical: 18, paddingHorizontal: 15, borderRightWidth: 1, borderColor: '#EEEEEE', justifyContent: 'center' },
  chu_cell: { fontSize: 20, color: '#333', fontFamily: 'Arial', lineHeight: 28 }, // Dãn dòng Text
  
  checkbox: { width: 30, height: 30, borderWidth: 2, borderColor: '#B0BEC5', borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
  checkbox_active: { backgroundColor: '#D32F2F', borderColor: '#D32F2F' },

  btn_action_mini: { backgroundColor: '#1976D2', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 6 },
  txt_action_mini: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});

export default DanhMucICD10;