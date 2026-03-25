/**
 * TỆP LÕI: HỆ QUẢN TRỊ QUY TẮC BHYT ĐỘNG (NO-CODE RULE ENGINE CMS)
 * Chức năng: Quản trị 12 trạm luật Phương Châu dưới dạng bảng dữ liệu động.
 * Đột phá 5.0: Tích hợp công tắc BẬT/TẮT (ON/OFF) trạng thái luật và Chọn hàng loạt (Select All).
 * Giao diện: Pink Theme Phương Châu, Arial > 20px
 * Tiêu chuẩn JCI: MOI.3 & COP
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Alert, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as XLSX from 'xlsx';

// 1. DANH SÁCH 12 TAB CHUẨN ĐÃ ĐỒNG BỘ THEO THỰC TẾ GIAO DIỆN
export const DANH_SACH_TAB_CHUAN = [
  { id: 'XML_DATA',  ten: '1. Dữ liệu (XML)', file: 'quyluat_cau_truc_du_lieu.jsx' },
  { id: 'XML1',      ten: '2. Hành chính', file: 'luat_hanh_chinh.jsx' },
  { id: 'KHAM_BENH', ten: '3. Khám bệnh', file: 'luat_cong_kham.jsx' },
  { id: 'XML3',      ten: '4. CĐ Dịch vụ', file: 'luat_cdha.jsx' },
  { id: 'XML2',      ten: '5. CĐ Thuốc', file: 'luat_thuoc.jsx' },
  { id: 'NHAP_VIEN', ten: '6. CĐ Nhập viện', file: 'luat_chuyen_tuyen.jsx' },
  { id: 'NOI_TRU',   ten: '7. CĐ Nội trú', file: 'luat_giuong_benh.jsx' },
  { id: 'PTTT',      ten: '8. CĐ Phẫu/Thủ thuật', file: 'luat_pttt.jsx' },
  { id: 'GAY_ME',    ten: '9. Gây mê', file: 'luat_mau.jsx' },
  { id: 'HAU_PHAU',  ten: '10. ĐT Hậu phẫu', file: 'luat_nhan_su.jsx' },
  { id: 'XUAT_VIEN', ten: '11. Xuất viện', file: 'luat_hop_dong.jsx' },
  { id: 'TAI_LIEU',  ten: '12. Tài liệu/Khác', file: 'xml4.jsx' }
];

const BoLuatBHYT = ({ navigation }) => {
  const [tabHienTai, setTabHienTai] = useState(DANH_SACH_TAB_CHUAN[0].id);
  const [columns, setColumns] = useState([]);
  const [data, setData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [newColumnName, setNewColumnName] = useState('');

  // 2. TẢI DỮ LIỆU TỰ ĐỘNG KHI CHUYỂN TAB
  useEffect(() => {
    const taiDuLieu = async () => {
      try {
        const colsLuuTru = await AsyncStorage.getItem(`CDSS_COLS_${tabHienTai}`);
        const dataLuuTru = await AsyncStorage.getItem(`CDSS_DATA_${tabHienTai}`);
        
        // Mặc định khởi tạo các cột quan trọng, BỔ SUNG CỘT TRẠNG THÁI (TRANG_THAI)
        const defaultCols = ['TRANG_THAI', 'MA_LUAT', 'TEN_QUY_TAC', 'DIEU_KIEN', 'CANH_BAO'];
        
        let loadedCols = colsLuuTru ? JSON.parse(colsLuuTru) : defaultCols;
        
        // Auto migrate: Tự động thêm cột TRANG_THAI nếu dữ liệu cũ chưa có
        if (!loadedCols.includes('TRANG_THAI')) {
           loadedCols = ['TRANG_THAI', ...loadedCols];
        }
        
        setColumns(loadedCols);
        
        let loadedData = dataLuuTru ? JSON.parse(dataLuuTru) : [];
        // Auto set mặc định TRẠNG THÁI = ON cho các luật cũ
        loadedData = loadedData.map(row => ({
          ...row, 
          TRANG_THAI: (row.TRANG_THAI === undefined || row.TRANG_THAI === "") ? "ON" : row.TRANG_THAI
        }));
        
        setData(loadedData);
        setSelectedRows([]); 
      } catch (error) {
        console.error("Lỗi tải dữ liệu luật:", error);
      }
    };
    taiDuLieu();
  }, [tabHienTai]);

  const luuHeThong = async (newData, newCols) => {
    setData(newData);
    setColumns(newCols);
    await AsyncStorage.setItem(`CDSS_DATA_${tabHienTai}`, JSON.stringify(newData));
    await AsyncStorage.setItem(`CDSS_COLS_${tabHienTai}`, JSON.stringify(newCols));
    if (Platform.OS !== 'web') Alert.alert("Thành công", "Đã lưu bộ luật vào hệ thống.");
  };

  // 3. CÁC HÀM XỬ LÝ NO-CODE (CRUD)
  const handleAddColumn = () => {
    if (!newColumnName) return alert("Vui lòng nhập tên trường mới!");
    const colName = newColumnName.trim().toUpperCase().replace(/ /g, '_');
    if (columns.includes(colName)) return alert("Trường này đã tồn tại!");
    luuHeThong(data, [...columns, colName]);
    setNewColumnName('');
  };

  const handleAddRow = () => {
    const newRow = { id: `RULE_${Date.now()}` };
    columns.forEach(col => newRow[col] = (col === 'TRANG_THAI' ? 'ON' : ""));
    setData([newRow, ...data]);
  };

  const handleCellChange = (text, rowId, colName) => {
    const newData = data.map(row => row.id === rowId ? { ...row, [colName]: text } : row);
    setData(newData);
  };

  // CHỨC NĂNG ON/OFF NHANH BẰNG NÚT BẤM (TOGGLE)
  const toggleTrangThai = (rowId) => {
    const newData = data.map(row => {
      if (row.id === rowId) {
        return { ...row, TRANG_THAI: row.TRANG_THAI === 'ON' ? 'OFF' : 'ON' };
      }
      return row;
    });
    setData(newData);
  };

  const toggleSelectRow = (id) => {
    setSelectedRows(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]);
  };

  // CHỨC NĂNG CHỌN HÀNG LOẠT (SELECT ALL)
  const handleSelectAll = () => {
    if (selectedRows.length === data.length) {
      setSelectedRows([]); // Nếu đã chọn hết thì bỏ chọn hết
    } else {
      setSelectedRows(data.map(row => row.id)); // Chọn tất cả ID
    }
  };

  const handleXoaHangLoat = () => {
    if (selectedRows.length === 0) return alert("Vui lòng chọn dòng cần xóa!");
    if (confirm(`Xác nhận xóa ${selectedRows.length} quy tắc?`)) {
      const newData = data.filter(row => !selectedRows.includes(row.id));
      luuHeThong(newData, columns);
      setSelectedRows([]);
    }
  };

  // 4. SIÊU CÔNG CỤ EXCEL
  const xuLyExport = () => {
    if (data.length === 0) return alert("Không có dữ liệu để xuất!");
    const ws = XLSX.utils.json_to_sheet(data.map(({id, ...rest}) => rest), { header: columns });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Rules");
    XLSX.writeFile(wb, `CDSS_rules_${tabHienTai}.xlsx`);
  };

  const xuLyImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const importedData = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: "" });
      
      if (importedData.length > 0) {
        const excelCols = Object.keys(importedData[0]);
        const formattedData = importedData.map(row => ({
          ...row, 
          id: `IMP_${Math.random()}`,
          TRANG_THAI: (row.TRANG_THAI === undefined || row.TRANG_THAI === "") ? "ON" : row.TRANG_THAI
        }));
        
        const mergedCols = [...new Set([...columns, ...excelCols])];
        if (!mergedCols.includes('TRANG_THAI')) mergedCols.unshift('TRANG_THAI');
        
        luuHeThong([...formattedData, ...data], mergedCols);
        alert(`✅ Đã Import thành công ${formattedData.length} quy tắc!`);
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = null; // Reset input file
  };

  return (
    <SafeAreaView style={styles.vung_an_toan}>
      <View style={styles.thanh_tieu_de}>
        <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.nut_quay_lai}>
          <Text style={styles.chu_nut_header}>⬅ TRỞ VỀ</Text>
        </TouchableOpacity>
        <Text style={styles.chu_tieu_de}>⚙️ QUẢN TRỊ QUY TẮC BHYT ĐỘNG (12 TRẠM LÂM SÀNG)</Text>
        <View style={{ width: 120 }} />
      </View>

      <View style={styles.khung_chuc_nang}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.khung_tab}>
          {DANH_SACH_TAB_CHUAN.map(tab => (
            <TouchableOpacity 
              key={tab.id} 
              onPress={() => setTabHienTai(tab.id)} 
              style={[styles.nut_tab, tabHienTai === tab.id && styles.nut_tab_active]}
            >
              <Text style={[styles.chu_tab, tabHienTai === tab.id && styles.chu_tab_active]}>{tab.ten}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.thanh_cong_cu}>
          <View style={styles.khoi_them_cot}>
            <TextInput 
              style={styles.o_nhap_cot} 
              placeholder="Thêm trường (VD: PRIORITY, MA_XN)" 
              value={newColumnName} 
              onChangeText={setNewColumnName}
              outlineStyle="none" 
            />
            <TouchableOpacity style={styles.nut_xanh} onPress={handleAddColumn}>
              <Text style={styles.chu_nut}>+ THÊM CỘT</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.khoi_hanh_dong}>
            {Platform.OS === 'web' && (
              <>
                <input type="file" id="imp-ex" accept=".xlsx, .xls, .csv" hidden onChange={xuLyImport} />
                <TouchableOpacity style={styles.nut_cam} onPress={() => document.getElementById('imp-ex').click()}>
                  <Text style={styles.chu_nut}>📤 IMPORT EXCEL</Text>
                </TouchableOpacity>
              </>
            )}
            <TouchableOpacity style={styles.nut_xanh_duong} onPress={xuLyExport}>
              <Text style={styles.chu_nut}>📥 EXPORT BẢNG</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.nut_do} onPress={() => luuHeThong(data, columns)}>
              <Text style={styles.chu_nut}>💾 LƯU HỆ THỐNG</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.thanh_tieu_de_bang}>
          <Text style={styles.tieu_de_bang}>📋 TỆP LUẬT: {DANH_SACH_TAB_CHUAN.find(t => t.id === tabHienTai)?.ten}</Text>
          <View style={{flexDirection: 'row', gap: 15}}>
            {selectedRows.length > 0 && (
              <TouchableOpacity style={styles.nut_xoa_nhom} onPress={handleXoaHangLoat}>
                <Text style={styles.chu_nut_xoa}>🗑 XÓA {selectedRows.length} DÒNG</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.nut_hong} onPress={handleAddRow}>
              <Text style={styles.chu_nut}>➕ THÊM QUY TẮC</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView horizontal style={styles.khung_bang}>
          <View>
            <View style={styles.dong_tieu_de}>
              {/* TÍCH HỢP NÚT CHỌN HÀNG LOẠT */}
              <TouchableOpacity style={[styles.o_tieu_de, { width: 80, alignItems: 'center' }]} onPress={handleSelectAll}>
                <View style={[styles.checkbox, selectedRows.length === data.length && data.length > 0 && styles.checkbox_active]}>
                   {selectedRows.length === data.length && data.length > 0 && <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 16 }}>✓ All</Text>}
                </View>
              </TouchableOpacity>

              {columns.map((col, index) => (
                <View key={index} style={[styles.o_tieu_de, { width: col === 'TRANG_THAI' ? 150 : 300 }]}>
                  <Text style={styles.chu_o_tieu_de}>{col}</Text>
                </View>
              ))}
            </View>

            <ScrollView style={{ maxHeight: 550 }}>
              {data.map((row) => (
                <View key={row.id} style={[styles.dong_du_lieu, selectedRows.includes(row.id) && { backgroundColor: '#FFEBEE' }, row.TRANG_THAI === 'OFF' && { opacity: 0.6 }]}>
                  <TouchableOpacity style={[styles.o_du_lieu, { width: 80, alignItems: 'center', justifyContent: 'center' }]} onPress={() => toggleSelectRow(row.id)}>
                    <View style={[styles.checkbox, selectedRows.includes(row.id) && styles.checkbox_active]}>
                      {selectedRows.includes(row.id) && <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 20 }}>✓</Text>}
                    </View>
                  </TouchableOpacity>

                  {columns.map((col, colIndex) => {
                    // Nếu là cột TRANG_THAI, hiển thị dạng nút bấm ON/OFF
                    if (col === 'TRANG_THAI') {
                      const isOn = row[col] === 'ON';
                      return (
                        <View key={colIndex} style={[styles.o_du_lieu_nhap, { width: 150, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAFAFA' }]}>
                           <TouchableOpacity 
                             style={[styles.btn_toggle, { backgroundColor: isOn ? '#4CAF50' : '#9E9E9E' }]}
                             onPress={() => toggleTrangThai(row.id)}
                           >
                              <Text style={styles.txt_toggle}>{isOn ? '🟢 ON' : '⚫ OFF'}</Text>
                           </TouchableOpacity>
                        </View>
                      );
                    }

                    // Các cột khác hiển thị ô nhập liệu bình thường
                    return (
                      <TextInput
                        key={colIndex}
                        style={[styles.o_du_lieu_nhap, { width: 300, backgroundColor: row.TRANG_THAI === 'OFF' ? '#F5F5F5' : '#FAFAFA' }]}
                        value={String(row[col] || '')}
                        onChangeText={(text) => handleCellChange(text, row.id, col)}
                        multiline
                        outlineStyle="none"
                      />
                    );
                  })}
                </View>
              ))}
              {data.length === 0 && (
                <Text style={styles.txt_trong}>Chưa có quy tắc nào. Vui lòng thêm quy tắc mới hoặc Import từ Excel.</Text>
              )}
            </ScrollView>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default BoLuatBHYT;

// ================= CSS (PHƯƠNG CHÂU PINK THEME) =================
const styles = StyleSheet.create({
  vung_an_toan: { flex: 1, backgroundColor: '#F4F6F8' },
  thanh_tieu_de: { backgroundColor: '#FF66A3', padding: 20, paddingTop: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  nut_quay_lai: { padding: 12, backgroundColor: '#D81B60', borderRadius: 8 },
  chu_nut_header: { color: '#FFF', fontWeight: 'bold', fontSize: 20, fontFamily: 'Arial' },
  chu_tieu_de: { fontSize: 24, color: '#FFF', fontWeight: 'bold', fontFamily: 'Arial' },
  khung_chuc_nang: { padding: 20, flex: 1 },
  khung_tab: { flexDirection: 'row', marginBottom: 20, maxHeight: 60 },
  nut_tab: { paddingHorizontal: 20, paddingVertical: 12, backgroundColor: '#E0E0E0', marginRight: 10, borderRadius: 25 },
  nut_tab_active: { backgroundColor: '#D81B60' },
  chu_tab: { fontSize: 18, color: '#555', fontWeight: 'bold', fontFamily: 'Arial' },
  chu_tab_active: { color: '#FFF' },
  thanh_cong_cu: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, alignItems: 'center' },
  khoi_them_cot: { flexDirection: 'row', alignItems: 'center' },
  o_nhap_cot: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#CCC', padding: 12, borderRadius: 8, fontSize: 18, width: 300, marginRight: 10 },
  khoi_hanh_dong: { flexDirection: 'row', gap: 10 },
  nut_xanh: { backgroundColor: '#2196F3', padding: 14, borderRadius: 8 },
  nut_xanh_duong: { backgroundColor: '#1976D2', padding: 14, borderRadius: 8 },
  nut_cam: { backgroundColor: '#FF9800', padding: 14, borderRadius: 8 },
  nut_hong: { backgroundColor: '#E91E63', padding: 14, borderRadius: 8 },
  nut_do: { backgroundColor: '#4CAF50', padding: 14, borderRadius: 8 },
  thanh_tieu_de_bang: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  tieu_de_bang: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  nut_xoa_nhom: { backgroundColor: '#F44336', padding: 14, borderRadius: 8 },
  chu_nut_xoa: { color: '#FFF', fontWeight: 'bold', fontSize: 18 },
  khung_bang: { 
    backgroundColor: '#FFF', 
    borderRadius: 10, 
    borderWidth: 1, 
    borderColor: '#E0E0E0',
    ...Platform.select({ web: { boxShadow: '0px 4px 12px rgba(0,0,0,0.1)' } }) 
  },
  dong_tieu_de: { flexDirection: 'row', backgroundColor: '#FCE4EC', borderBottomWidth: 2, borderColor: '#D81B60' },
  o_tieu_de: { padding: 15, borderRightWidth: 1, borderColor: '#FFB3D1', justifyContent: 'center' },
  chu_o_tieu_de: { fontWeight: 'bold', fontSize: 18, color: '#880E4F', textAlign: 'center' },
  dong_du_lieu: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#EEE' },
  o_du_lieu: { padding: 12, borderRightWidth: 1, borderColor: '#EEE' },
  o_du_lieu_nhap: { padding: 12, borderRightWidth: 1, borderColor: '#EEE', fontSize: 20, color: '#333', backgroundColor: '#FAFAFA' },
  
  checkbox: { width: 35, height: 35, borderWidth: 2, borderColor: '#B0BEC5', borderRadius: 4, justifyContent: 'center', alignItems: 'center' },
  checkbox_active: { backgroundColor: '#D32F2F', borderColor: '#D32F2F' },
  
  // KIỂU DÁNG NÚT ON/OFF
  btn_toggle: { paddingVertical: 8, paddingHorizontal: 15, borderRadius: 20, elevation: 2 },
  txt_toggle: { color: '#FFF', fontWeight: 'bold', fontSize: 18, fontFamily: 'Arial' },

  chu_nut: { color: '#FFF', fontWeight: 'bold', fontSize: 18 },
  txt_trong: { padding: 20, fontSize: 18, fontStyle: 'italic', color: '#999', textAlign: 'center' }
});