/**
 * ============================================================
 * FILE: chuyen_mon/huong_dan_byt/huong_dan_byt.jsx
 * MỤC ĐÍCH: Quản lý Danh mục Hướng dẫn Chẩn đoán & Điều trị (Bộ Y tế)
 * PHIÊN BẢN: Đã bọc thép (Khử lỗi Theme undefined & Web Shadow)
 * ============================================================
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as XLSX from 'xlsx';

import TaiLieuGoc from './tailieu_goc';

const COT_MAC_DINH = [
  'Mã ICD10',
  'Tên bệnh',
  'Lâm sàng',
  'Cận lâm sàng (TT 23/2024)',
  'Tiêu chuẩn chẩn đoán chính xác',
  'Chẩn đoán phân biệt',
  'Điều trị bằng thuốc (Nhóm, Hoạt chất, Liều Min, Liều Max)',
  'Điều trị can thiệp (TT 23/2024)',
  'Mã dịch vụ can thiệp',
  'Cận lâm sàng theo dõi (TT 23/2024)',
  'Kiểm lại (Ngày)',
  'Điều trị khác',
  'Dự phòng',
  'Tiên lượng'
];

const DULIEU_MAU = [{
  id: '1',
  'Mã ICD10': 'B16',
  'Tên bệnh': 'Viêm gan vi rút B cấp',
  'Lâm sàng': 'Chán ăn, mệt mỏi, vàng da, tiểu ít sậm màu, đau tức vùng gan, nôn, buồn nôn, phân bạc màu. Thể tối cấp có suy gan và não gan.',
  'Cận lâm sàng (TT 23/2024)': '1. Định lượng AST, ALT. 2. Định lượng Bilirubin. 3. Xét nghiệm HBsAg, anti-HBc IgM.',
  'Tiêu chuẩn chẩn đoán chính xác': '1. Tiền sử tiếp xúc nguồn lây 4 tuần - 6 tháng. 2. AST, ALT tăng cao > 5 lần. 3. HBsAg (+) hoặc (-) và anti-HBc IgM (+).',
  'Chẩn đoán phân biệt': 'Viêm gan do vi rút khác (A, E, C), nhiễm độc, tự miễn, do rượu. Vàng da do Leptospira, sốt rét, tắc mật cơ học.',
  'Điều trị bằng thuốc (Nhóm, Hoạt chất, Liều Min, Liều Max)': 'Thuốc kháng vi rút: (Cân nhắc trong thể tối cấp) Tenofovir hoặc Entecavir. Liều: Tenofovir 300mg/ngày; Entecavir 0.5mg/ngày.',
  'Điều trị can thiệp (TT 23/2024)': 'Nuôi dưỡng qua đường tĩnh mạch (nếu cần).',
  'Mã dịch vụ can thiệp': 'Đang cập nhật',
  'Cận lâm sàng theo dõi (TT 23/2024)': 'AST, ALT, Bilirubin, thời gian đông máu, tiểu cầu.',
  'Kiểm lại (Ngày)': '30',
  'Điều trị khác': 'Nghỉ ngơi tuyệt đối, hạn chế chất béo, kiêng rượu bia, thuốc bổ trợ gan.',
  'Dự phòng': 'Tiêm vắc xin sau sinh vòng 24h. An toàn tình dục, không dùng chung kim tiêm.',
  'Tiên lượng': '> 90% khỏi hoàn toàn; gần 10% chuyển mạn tính.'
}];

const HuongDanBoYTe = () => {
  const [columns, setColumns] = useState(COT_MAC_DINH);
  const [data, setData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [newColName, setNewColName] = useState('');
  const [sortAsc, setSortAsc] = useState(true);
  
  const [viewMode, setViewMode] = useState('table'); 
  const [currentICD, setCurrentICD] = useState('');

  useEffect(() => {
    const taiDuLieu = async () => {
      try {
        const storedCols = await AsyncStorage.getItem('CDSS_COLS_HDBYT');
        const storedData = await AsyncStorage.getItem('CDSS_DATA_HDBYT');
        if (storedCols) setColumns(JSON.parse(storedCols));
        if (storedData) setData(JSON.parse(storedData));
        else setData(DULIEU_MAU);
      } catch (e) { console.error(e); }
    };
    taiDuLieu();
  }, []);

  const luuHeThong = async (newData, newCols = columns) => {
    setData(newData);
    setColumns(newCols);
    await AsyncStorage.setItem('CDSS_DATA_HDBYT', JSON.stringify(newData));
    await AsyncStorage.setItem('CDSS_COLS_HDBYT', JSON.stringify(newCols));
  };

  const handleAddRow = () => {
    const newRow = { id: Date.now().toString() };
    columns.forEach(col => newRow[col] = '');
    luuHeThong([newRow, ...data]);
  };

  const handleAddColumn = () => {
    if (!newColName) return;
    const colUpper = newColName.trim();
    if (columns.includes(colUpper)) return alert("Cột đã tồn tại!");
    luuHeThong(data, [...columns, colUpper]);
    setNewColName('');
  };

  const handleCellChange = (id, col, val) => {
    const newData = data.map(row => row.id === id ? { ...row, [col]: val } : row);
    luuHeThong(newData);
  };

  const toggleSelectRow = (id) => setSelectedRows(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]);

  const handleDeleteBulk = () => {
    if (selectedRows.length === 0) return alert("Chưa chọn dòng nào!");
    const newData = data.filter(row => !selectedRows.includes(row.id));
    setSelectedRows([]);
    luuHeThong(newData);
  };

  const handleSortABC = () => {
    const sorted = [...data].sort((a, b) => {
      const valA = (a['Mã ICD10'] || '').toUpperCase();
      const valB = (b['Mã ICD10'] || '').toUpperCase();
      return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });
    setSortAsc(!sortAsc);
    luuHeThong(sorted);
  };

  const handleExport = () => {
    if (Platform.OS === 'web') {
      const exportData = data.map(row => {
        let exportRow = {};
        columns.forEach(col => exportRow[col] = row[col] || '');
        return exportRow;
      });
      const ws = XLSX.utils.json_to_sheet(exportData, { header: columns });
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "HD_BYT");
      XLSX.writeFile(wb, "HuongDan_BoYTe_CDSS.xlsx");
    }
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const importedData = XLSX.utils.sheet_to_json(ws, { defval: "" });
      
      if (importedData.length > 0) {
        const importedCols = Object.keys(importedData[0]).filter(k => k !== 'id');
        const formattedData = importedData.map(row => ({ ...row, id: Date.now().toString() + Math.random() }));
        luuHeThong(formattedData, importedCols.length > 0 ? importedCols : columns);
        alert("Đã Import thành công hệ thống Hướng dẫn Bộ Y tế!");
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = null; // Fix memory leak
  };

  const renderTable = () => (
    <>
      <View style={styles.thanh_cong_cu_top}>
        <Text style={styles.tieu_de_chinh}>CDSS: HƯỚNG DẪN CHẨN ĐOÁN & ĐIỀU TRỊ BỘ Y TẾ</Text>
        <View style={styles.group_buttons}>
          <TouchableOpacity style={styles.btn_pink} onPress={handleAddRow}>
            <Text style={styles.txt_btn}>➕ THÊM DÒNG MỚI</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btn_red} onPress={handleDeleteBulk}>
            <Text style={styles.txt_btn}>🗑 XÓA ĐÃ CHỌN ({selectedRows.length})</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.thanh_cong_cu_excel}>
        <View style={styles.khoi_them_cot}>
          <TextInput style={styles.o_nhap_cot} placeholder="Tên trường dữ liệu mới..." value={newColName} onChangeText={setNewColName} outlineStyle="none" />
          <TouchableOpacity style={styles.btn_blue} onPress={handleAddColumn}>
            <Text style={styles.txt_btn_small}>+ THÊM TRƯỜNG</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.group_buttons}>
          {Platform.OS === 'web' && (
            <>
              <input type="file" accept=".xlsx, .csv" onChange={handleImport} style={{ display: 'none' }} id="import-excel-byt" />
              <TouchableOpacity style={styles.btn_orange} onPress={() => document.getElementById('import-excel-byt').click()}>
                <Text style={styles.txt_btn}>📥 IMPORT DATA (CSV/XLSX)</Text>
              </TouchableOpacity>
            </>
          )}
          <TouchableOpacity style={styles.btn_green} onPress={handleExport}>
            <Text style={styles.txt_btn}>📤 EXPORT</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView horizontal style={styles.khung_bang}>
        <View>
          <View style={styles.dong_tieu_de}>
            <View style={[styles.o_tieu_de, { width: 80 }]}><Text style={styles.chu_o_tieu_de}>CHỌN</Text></View>
            <View style={[styles.o_tieu_de, { width: 150 }]}><Text style={styles.chu_o_tieu_de}>TÀI LIỆU GỐC</Text></View>
            {columns.map((col, index) => (
              <TouchableOpacity key={index} style={[styles.o_tieu_de, { width: 350 }]} onPress={col === 'Mã ICD10' ? handleSortABC : null}>
                <Text style={styles.chu_o_tieu_de}>{col} {col === 'Mã ICD10' ? (sortAsc ? ' 🔽' : ' 🔼') : ''}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <ScrollView style={{ maxHeight: 600 }}>
            {data.map((row) => (
              <View key={row.id} style={styles.dong_du_lieu}>
                <View style={[styles.o_du_lieu, { width: 80, justifyContent: 'center', alignItems: 'center' }]}>
                  <TouchableOpacity style={[styles.checkbox, selectedRows.includes(row.id) && styles.checkbox_active]} onPress={() => toggleSelectRow(row.id)}>
                    {selectedRows.includes(row.id) && <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 22 }}>✓</Text>}
                  </TouchableOpacity>
                </View>
                
                <View style={[styles.o_du_lieu, { width: 150, justifyContent: 'center', alignItems: 'center' }]}>
                  <TouchableOpacity style={styles.btn_icon_blue} onPress={() => { setCurrentICD(row['Mã ICD10']); setViewMode('doc'); }}>
                    <Text style={styles.txt_btn_small}>📖 Xem QĐ</Text>
                  </TouchableOpacity>
                </View>

                {columns.map((col, colIndex) => (
                  <TextInput key={colIndex} style={[styles.o_du_lieu, { width: 350 }, col === 'Mã ICD10' && { fontWeight: 'bold', color: '#1976D2' }]}
                    multiline value={String(row[col] || '')} onChangeText={(val) => handleCellChange(row.id, col, val)} outlineStyle="none" />
                ))}
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      <View style={styles.khu_vuc_trich_dan}>
        <Text style={styles.van_ban_trich_dan}>Nguồn dữ liệu: Dữ liệu được Import từ các Quyết định Hướng dẫn Chẩn đoán và Điều trị của Bộ Y tế hiện hành.</Text>
      </View>
    </>
  );

  return (
    <SafeAreaView style={styles.vung_an_toan}>
      {viewMode !== 'table' && (
        <View style={styles.thanh_dieu_huong_noi_bo}>
          <TouchableOpacity style={styles.btn_outline} onPress={() => setViewMode('table')}>
            <Text style={styles.txt_btn_outline}>⬅ QUAY LẠI BẢNG DỮ LIỆU</Text>
          </TouchableOpacity>
          <Text style={styles.txt_icd_dang_xem}>Văn bản pháp lý Hướng dẫn BYT mã ICD-10: {currentICD}</Text>
        </View>
      )}

      {viewMode === 'table' ? renderTable() : <TaiLieuGoc maICD={currentICD} danhSachData={data} />}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  vung_an_toan: { flex: 1, backgroundColor: '#F0F4F8' },
  thanh_cong_cu_top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#1976D2' },
  tieu_de_chinh: { fontSize: 26, color: '#FFF', fontWeight: 'bold', fontFamily: 'Arial' },
  thanh_cong_cu_excel: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, backgroundColor: '#FFF', borderBottomWidth: 2, borderColor: '#BBDEFB' },
  khoi_them_cot: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  o_nhap_cot: { borderWidth: 2, borderColor: '#90CAF9', borderRadius: 8, padding: 12, fontSize: 20, fontFamily: 'Arial', width: 280, backgroundColor: '#FFF', outlineStyle: 'none' },
  group_buttons: { flexDirection: 'row', gap: 10 },
  btn_pink: { backgroundColor: '#D81B60', padding: 15, borderRadius: 8 },
  btn_red: { backgroundColor: '#D32F2F', padding: 15, borderRadius: 8 },
  btn_blue: { backgroundColor: '#1976D2', padding: 15, borderRadius: 8 },
  btn_green: { backgroundColor: '#388E3C', padding: 15, borderRadius: 8 },
  btn_orange: { backgroundColor: '#F57C00', padding: 15, borderRadius: 8 },
  btn_icon_blue: { backgroundColor: '#1976D2', paddingVertical: 12, paddingHorizontal: 15, borderRadius: 6 },
  btn_outline: { backgroundColor: '#FFF', padding: 15, borderRadius: 8, borderWidth: 2, borderColor: '#1976D2' },
  txt_btn: { color: '#FFF', fontSize: 20, fontWeight: 'bold', fontFamily: 'Arial' },
  txt_btn_small: { color: '#FFF', fontSize: 18, fontWeight: 'bold', fontFamily: 'Arial' },
  txt_btn_outline: { color: '#1976D2', fontSize: 20, fontWeight: 'bold', fontFamily: 'Arial' },
  
  khung_bang: { 
    margin: 20, backgroundColor: '#FFF', borderRadius: 10,
    ...Platform.select({ web: { boxShadow: '0px 4px 10px rgba(0,0,0,0.1)' }, android: { elevation: 4 } }) 
  },
  dong_tieu_de: { flexDirection: 'row', backgroundColor: '#E3F2FD', borderBottomWidth: 3, borderColor: '#1976D2' },
  o_tieu_de: { padding: 20, borderRightWidth: 1, borderColor: '#BBDEFB', justifyContent: 'center', alignItems: 'center' },
  chu_o_tieu_de: { fontSize: 20, fontWeight: 'bold', color: '#0D47A1', fontFamily: 'Arial', textAlign: 'center' },
  dong_du_lieu: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#EEE' },
  o_du_lieu: { padding: 20, borderRightWidth: 1, borderColor: '#EEE', fontSize: 22, fontFamily: 'Arial', color: '#333', backgroundColor: '#FFF', outlineStyle: 'none' },
  checkbox: { width: 35, height: 35, borderWidth: 3, borderColor: '#CCC', borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
  checkbox_active: { backgroundColor: '#D32F2F', borderColor: '#D32F2F' },
  
  thanh_dieu_huong_noi_bo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#FFF', borderBottomWidth: 2, borderColor: '#BBDEFB' },
  txt_icd_dang_xem: { fontSize: 24, fontWeight: 'bold', color: '#333', fontFamily: 'Arial' },
  khu_vuc_trich_dan: { padding: 20, backgroundColor: '#FFF', borderTopWidth: 2, borderColor: '#EEE' },
  van_ban_trich_dan: { fontSize: 20, color: '#666', fontStyle: 'italic', fontFamily: 'Arial', marginBottom: 8 }
});

export default HuongDanBoYTe;