import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as XLSX from 'xlsx';

import InPhacDo from './in_phac_do';
import InfographicPhacDo from './infographic';

// DANH SÁCH 18 CỘT TIÊU CHUẨN (JCI & TT 23/2024/TT-BYT)
const COT_MAC_DINH = [
  'MÃ ICD-10',
  'TÊN BỆNH',
  'LÂM SÀNG',
  'CẬN LÂM SÀNG (TT 23/2024)',
  'TIÊU CHUẨN CHẨN ĐOÁN CHÍNH XÁC',
  'CHẨN ĐOÁN PHÂN BIỆT',
  'NHÓM THUỐC',
  'HOẠT CHẤT THUỐC',
  'LIỀU DÙNG TỐI THIỂU',
  'LIỀU DÙNG TỐI ĐA',
  'ĐIỀU TRỊ CAN THIỆP (TT 23/2024)',
  'MÃ DỊCH VỤ CAN THIỆP (TT 23/2024)',
  'CẬN LÂM SÀNG THEO DÕI (TT 23/2024)',
  'THỜI GIAN KIỂM LẠI (NGÀY)',
  'ĐIỀU TRỊ KHÁC (TT 23/2024)',
  'DỰ PHÒNG',
  'TIÊN LƯỢNG',
  'TÀI LIỆU THAM KHẢO'
];

const DULIEU_MAU = [{
  id: '1',
  'MÃ ICD-10': 'J18, J15',
  'TÊN BỆNH': 'Viêm phổi, Viêm phổi do vi khuẩn',
  'LÂM SÀNG': 'Hội chứng nhiễm trùng (Sốt cao, vẻ mặt nhiễm trùng), Hội chứng đông đặc phổi kinh điển (Rung thanh tăng, gõ đục, rì rào phế nang giảm, rale nổ).',
  'CẬN LÂM SÀNG (TT 23/2024)': 'Tổng phân tích tế bào máu ngoại vi (bằng máy đếm laser), Định lượng CRP, Chụp Xquang ngực thẳng',
  'TIÊU CHUẨN CHẨN ĐOÁN CHÍNH XÁC': 'X-quang có tổn thương thâm nhiễm mới + Ít nhất 2 triệu chứng lâm sàng.',
  'CHẨN ĐOÁN PHÂN BIỆT': 'Nhồi máu phổi, Lao phổi, Viêm phế quản cấp.',
  'NHÓM THUỐC': 'Kháng sinh nhóm Beta-lactam, Nhóm Macrolid',
  'HOẠT CHẤT THUỐC': 'Amoxicillin + Acid Clavulanic, Clarithromycin',
  'LIỀU DÙNG TỐI THIỂU': '2g/ngày, 500mg/ngày',
  'LIỀU DÙNG TỐI ĐA': '4g/ngày, 1000mg/ngày',
  'ĐIỀU TRỊ CAN THIỆP (TT 23/2024)': 'Thở ô xy qua gọng kính',
  'MÃ DỊCH VỤ CAN THIỆP (TT 23/2024)': '01.0001.0001',
  'CẬN LÂM SÀNG THEO DÕI (TT 23/2024)': 'Định lượng CRP',
  'THỜI GIAN KIỂM LẠI (NGÀY)': '2',
  'ĐIỀU TRỊ KHÁC (TT 23/2024)': 'Vỗ rung lồng ngực',
  'DỰ PHÒNG': 'Tiêm vaccine phế cầu, Vaccine cúm.',
  'TIÊN LƯỢNG': 'Tốt nếu can thiệp sớm; Nặng nếu có biến chứng suy hô hấp.',
  'TÀI LIỆU THAM KHẢO': '[1] UpToDate 2026. [2] BMJ Best Practice 2025.'
}];

const PhacDoBenhVien = () => {
  const [columns, setColumns] = useState(COT_MAC_DINH);
  const [data, setData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [newColName, setNewColName] = useState('');
  const [sortAsc, setSortAsc] = useState(true);
  
  // Trạng thái điều hướng xem/in
  const [viewMode, setViewMode] = useState('table'); 
  const [currentICD, setCurrentICD] = useState('');

  useEffect(() => {
    const taiDuLieu = async () => {
      try {
        const storedCols = await AsyncStorage.getItem('CDSS_COLS_PHAC_DO_V2');
        const storedData = await AsyncStorage.getItem('CDSS_DATA_PHAC_DO_V2');
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
    await AsyncStorage.setItem('CDSS_DATA_PHAC_DO_V2', JSON.stringify(newData));
    await AsyncStorage.setItem('CDSS_COLS_PHAC_DO_V2', JSON.stringify(newCols));
  };

  const handleAddRow = () => {
    const newRow = { id: Date.now().toString() };
    columns.forEach(col => newRow[col] = '');
    luuHeThong([newRow, ...data]);
  };

  const handleAddColumn = () => {
    if (!newColName) return;
    const colUpper = newColName.trim().toUpperCase();
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
      const valA = (a['MÃ ICD-10'] || '').toUpperCase();
      const valB = (b['MÃ ICD-10'] || '').toUpperCase();
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
      XLSX.utils.book_append_sheet(wb, ws, "CDSS_PhacDo");
      XLSX.writeFile(wb, "PhacDo_CDSS_PhuongChau.xlsx");
    }
  };

  const handleDownloadTemplate = () => {
    if (Platform.OS === 'web') {
      const ws = XLSX.utils.json_to_sheet([], { header: columns });
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Template");
      XLSX.writeFile(wb, "FileMau_PhacDo_CDSS.xlsx");
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
        alert("Đã Import thành công hệ thống Phác đồ CDSS!");
      }
    };
    reader.readAsBinaryString(file);
  };

  const renderTable = () => (
    <>
      <View style={styles.thanh_cong_cu_top}>
        <Text style={styles.tieu_de_chinh}>CDSS: CƠ SỞ DỮ LIỆU PHÁC ĐỒ PHƯƠNG CHÂU</Text>
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
          <TextInput style={styles.o_nhap_cot} placeholder="Tên trường dữ liệu mới..." value={newColName} onChangeText={setNewColName} />
          <TouchableOpacity style={styles.btn_blue} onPress={handleAddColumn}>
            <Text style={styles.txt_btn_small}>+ THÊM TRƯỜNG</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.group_buttons}>
          <TouchableOpacity style={styles.btn_outline} onPress={handleDownloadTemplate}>
            <Text style={styles.txt_btn_outline}>📄 TẢI FILE MẪU</Text>
          </TouchableOpacity>
          {Platform.OS === 'web' && (
            <>
              <input type="file" accept=".xlsx, .xls" onChange={handleImport} style={{ display: 'none' }} id="import-excel" />
              <TouchableOpacity style={styles.btn_orange} onPress={() => document.getElementById('import-excel').click()}>
                <Text style={styles.txt_btn}>📤 IMPORT</Text>
              </TouchableOpacity>
            </>
          )}
          <TouchableOpacity style={styles.btn_green} onPress={handleExport}>
            <Text style={styles.txt_btn}>📥 EXPORT</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView horizontal style={styles.khung_bang}>
        <View>
          <View style={styles.dong_tieu_de}>
            <View style={[styles.o_tieu_de, { width: 80 }]}><Text style={styles.chu_o_tieu_de}>CHỌN</Text></View>
            <View style={[styles.o_tieu_de, { width: 180 }]}><Text style={styles.chu_o_tieu_de}>THAO TÁC</Text></View>
            {columns.map((col, index) => (
              <TouchableOpacity key={index} style={[styles.o_tieu_de, { width: 350 }]} onPress={col === 'MÃ ICD-10' ? handleSortABC : null}>
                <Text style={styles.chu_o_tieu_de}>{col} {col === 'MÃ ICD-10' ? (sortAsc ? ' 🔽' : ' 🔼') : ''}</Text>
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
                
                <View style={[styles.o_du_lieu, { width: 180, flexDirection: 'row', gap: 10, justifyContent: 'center', alignItems: 'center' }]}>
                  <TouchableOpacity style={styles.btn_icon_blue} onPress={() => { setCurrentICD(row['MÃ ICD-10']); setViewMode('info'); }}>
                    <Text style={styles.txt_btn_small}>📊 Xem</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.btn_icon_green} onPress={() => { setCurrentICD(row['MÃ ICD-10']); setViewMode('print'); }}>
                    <Text style={styles.txt_btn_small}>🖨️ In</Text>
                  </TouchableOpacity>
                </View>

                {columns.map((col, colIndex) => (
                  <TextInput key={colIndex} style={[styles.o_du_lieu, { width: 350 }, col === 'MÃ ICD-10' && { fontWeight: 'bold', color: '#D81B60' }]}
                    multiline value={String(row[col] || '')} onChangeText={(val) => handleCellChange(row.id, col, val)} />
                ))}
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      <View style={styles.khu_vuc_trich_dan}>
        <Text style={styles.van_ban_trich_dan}>[1] Tiêu chuẩn đánh giá chất lượng bệnh viện JCI (Chương COP - Chăm sóc người bệnh).</Text>
        <Text style={styles.van_ban_trich_dan}>[2] Thông tư 23/2024/TT-BYT: Danh mục dịch vụ kỹ thuật khám bệnh, chữa bệnh.</Text>
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
          <Text style={styles.txt_icd_dang_xem}>Hồ sơ Phác đồ CDSS mã ICD-10: {currentICD}</Text>
        </View>
      )}

      {viewMode === 'table' ? renderTable() : 
       viewMode === 'info' ? <InfographicPhacDo maICD={currentICD} /> : 
       <InPhacDo maICD={currentICD} />}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  vung_an_toan: { flex: 1, backgroundColor: '#F9F9F9' },
  thanh_cong_cu_top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#FF66A3' },
  tieu_de_chinh: { fontSize: 26, color: '#FFF', fontWeight: 'bold', fontFamily: 'Arial' },
  thanh_cong_cu_excel: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, backgroundColor: '#FFF', borderBottomWidth: 2, borderColor: '#FCE4EC' },
  khoi_them_cot: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  o_nhap_cot: { borderWidth: 2, borderColor: '#FFB3D1', borderRadius: 8, padding: 12, fontSize: 20, fontFamily: 'Arial', width: 280 },
  group_buttons: { flexDirection: 'row', gap: 10 },
  btn_pink: { backgroundColor: '#D81B60', padding: 15, borderRadius: 8 },
  btn_red: { backgroundColor: '#D32F2F', padding: 15, borderRadius: 8 },
  btn_blue: { backgroundColor: '#1976D2', padding: 15, borderRadius: 8 },
  btn_green: { backgroundColor: '#388E3C', padding: 15, borderRadius: 8 },
  btn_orange: { backgroundColor: '#F57C00', padding: 15, borderRadius: 8 },
  btn_icon_blue: { backgroundColor: '#1976D2', paddingVertical: 12, paddingHorizontal: 15, borderRadius: 6 },
  btn_icon_green: { backgroundColor: '#388E3C', paddingVertical: 12, paddingHorizontal: 15, borderRadius: 6 },
  btn_outline: { backgroundColor: '#FFF', padding: 15, borderRadius: 8, borderWidth: 2, borderColor: '#D81B60' },
  txt_btn: { color: '#FFF', fontSize: 20, fontWeight: 'bold', fontFamily: 'Arial' },
  txt_btn_small: { color: '#FFF', fontSize: 18, fontWeight: 'bold', fontFamily: 'Arial' },
  txt_btn_outline: { color: '#D81B60', fontSize: 20, fontWeight: 'bold', fontFamily: 'Arial' },
  
  khung_bang: { margin: 20, backgroundColor: '#FFF', borderRadius: 10, elevation: 4 },
  dong_tieu_de: { flexDirection: 'row', backgroundColor: '#FCE4EC', borderBottomWidth: 3, borderColor: '#D81B60' },
  o_tieu_de: { padding: 20, borderRightWidth: 1, borderColor: '#F8BBD0', justifyContent: 'center', alignItems: 'center' },
  chu_o_tieu_de: { fontSize: 20, fontWeight: 'bold', color: '#C2185B', fontFamily: 'Arial', textAlign: 'center' },
  dong_du_lieu: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#EEE' },
  o_du_lieu: { padding: 20, borderRightWidth: 1, borderColor: '#EEE', fontSize: 22, fontFamily: 'Arial', color: '#333', backgroundColor: '#FFF' },
  checkbox: { width: 35, height: 35, borderWidth: 3, borderColor: '#CCC', borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
  checkbox_active: { backgroundColor: '#D32F2F', borderColor: '#D32F2F' },
  
  thanh_dieu_huong_noi_bo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#FFF', borderBottomWidth: 2, borderColor: '#FCE4EC' },
  txt_icd_dang_xem: { fontSize: 24, fontWeight: 'bold', color: '#333', fontFamily: 'Arial' },
  khu_vuc_trich_dan: { padding: 20, backgroundColor: '#FFF', borderTopWidth: 2, borderColor: '#EEE' },
  van_ban_trich_dan: { fontSize: 20, color: '#666', fontStyle: 'italic', fontFamily: 'Arial', marginBottom: 8 }
});

export default PhacDoBenhVien;