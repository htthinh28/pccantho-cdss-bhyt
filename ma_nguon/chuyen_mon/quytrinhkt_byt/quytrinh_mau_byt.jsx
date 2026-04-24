import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useMemo, useState } from 'react';
import { Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as XLSX from 'xlsx';

import TimKiemPhanTrangBang from '../../thanh_phan/tim_kiem_phan_trang_bang';
import { locDongTheoTuKhoa, SO_DONG_TRANG_MAC_DINH, tinhChiSoPhanTrang } from '../../tien_ich/bo_loc_bang_du_lieu';
import InQuyTrinh from './in_quytrinh';

// DANH SÁCH CỘT CHUẨN THEO CẤU TRÚC QUY TRÌNH KỸ THUẬT BỘ Y TẾ
const COT_MAC_DINH = [
  'MÃ DỊCH VỤ KT',
  'TÊN QUY TRÌNH KỸ THUẬT',
  'MÃ ICD-10 LIÊN QUAN',
  '1. ĐẠI CƯƠNG',
  '2. CHỈ ĐỊNH',
  '3. CHỐNG CHỈ ĐỊNH',
  '4. THẬN TRỌNG',
  '5.1. NHÂN LỰC',
  '5.2. THUỐC (Tên, Nồng độ, Số lượng)',
  '5.3. VẬT TƯ (Tên, Số lượng)',
  '5.4. TRANG THIẾT BỊ',
  '5.5. NGƯỜI BỆNH & HỒ SƠ',
  '5.7. THỜI GIAN THỰC HIỆN (GIỜ)',
  '6. TIẾN HÀNH QTKT (Các bước)',
  '7. THEO DÕI VÀ XỬ TRÍ TAI BIẾN',
  'TÀI LIỆU THAM KHẢO'
];

const DULIEU_MAU = [{
  id: '1',
  'MÃ DỊCH VỤ KT': '01.0001.0001',
  'TÊN QUY TRÌNH KỸ THUẬT': 'Thở ô xy qua gọng kính',
  'M অ্যাক ICD-10 LIÊN QUAN': 'J18.9, J15',
  '1. ĐẠI CƯƠNG': 'Là kỹ thuật cung cấp khí thở có nồng độ ô xy cao hơn nồng độ ô xy trong khí trời (21%).',
  '2. CHỈ ĐỊNH': 'Giảm ô xy máu động mạch (PaO2 < 60 mmHg, SpO2 < 90%).',
  '3. CHỐNG CHỈ ĐỊNH': 'Không có chống chỉ định tuyệt đối.',
  '4. THẬN TRỌNG': 'Bệnh nhân COPD (nguy cơ ức chế trung tâm hô hấp).',
  '5.1. NHÂN LỰC': '01 Điều dưỡng hoặc Y sĩ.',
  '5.2. THUỐC (Tên, Nồng độ, Số lượng)': 'Nước cất vô khuẩn.',
  '5.3. VẬT TƯ (Tên, Số lượng)': 'Gọng kính ô xy (01 cái), Dây dẫn (01 sợi).',
  '5.4. TRANG THIẾT BỊ': 'Hệ thống ô xy trung tâm, Bình làm ẩm.',
  '5.5. NGƯỜI BỆNH & HỒ SƠ': 'Giải thích cho người bệnh. Kiểm tra y lệnh.',
  '5.7. THỜI GIAN THỰC HIỆN (GIỜ)': '0.5',
  '6. TIẾN HÀNH QTKT (Các bước)': 'Bước 1: Rửa tay. Bước 2: Gắn bình làm ẩm. Bước 3: Đeo gọng kính cho BN. Bước 4: Điều chỉnh lưu lượng 1-6 lít/phút.',
  '7. THEO DÕI VÀ XỬ TRÍ TAI BIẾN': 'Khô niêm mạc (tăng cường làm ẩm), Giảm thông khí (chỉnh liều ô xy).',
  'TÀI LIỆU THAM KHẢO': '[1] Hướng dẫn quy trình kỹ thuật Hồi sức cấp cứu (Bộ Y tế).'
}];

const QuyTrinhMauBYT = () => {
  const [columns, setColumns] = useState(COT_MAC_DINH);
  const [data, setData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [newColName, setNewColName] = useState('');
  const [sortAsc, setSortAsc] = useState(true);
  const [chieuCaoVungBang, setChieuCaoVungBang] = useState(0);
  const [viewMode, setViewMode] = useState('table'); 
  const [currentMaDV, setCurrentMaDV] = useState('');
  const [tuKhoaTim, setTuKhoaTim] = useState('');
  const [soDongMotTrang, setSoDongMotTrang] = useState(SO_DONG_TRANG_MAC_DINH);
  const [trangHienTai, setTrangHienTai] = useState(1);

  const hangLocChiSo = useMemo(
    () => locDongTheoTuKhoa(data, columns, tuKhoaTim),
    [data, columns, tuKhoaTim],
  );
  const nSauLoc = hangLocChiSo.length;
  const { tongSoTrang, trangDangXem, chiSoBatDau, chiSoKetThuc } = useMemo(
    () => tinhChiSoPhanTrang(nSauLoc, soDongMotTrang, trangHienTai),
    [nSauLoc, soDongMotTrang, trangHienTai],
  );
  const duLieuTrang = useMemo(
    () => hangLocChiSo.slice(chiSoBatDau, chiSoKetThuc),
    [hangLocChiSo, chiSoBatDau, chiSoKetThuc],
  );

  useEffect(() => {
    if (trangHienTai > tongSoTrang) setTrangHienTai(tongSoTrang);
  }, [tongSoTrang, trangHienTai]);

  useEffect(() => {
    setTrangHienTai(1);
  }, [tuKhoaTim, soDongMotTrang]);

  useEffect(() => {
    const taiDuLieu = async () => {
      try {
        const storedCols = await AsyncStorage.getItem('CDSS_COLS_QTKT');
        const storedData = await AsyncStorage.getItem('CDSS_DATA_QTKT');
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
    await AsyncStorage.setItem('CDSS_DATA_QTKT', JSON.stringify(newData));
    await AsyncStorage.setItem('CDSS_COLS_QTKT', JSON.stringify(newCols));
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
      const valA = (a['MÃ DỊCH VỤ KT'] || '').toUpperCase();
      const valB = (b['MÃ DỊCH VỤ KT'] || '').toUpperCase();
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
      XLSX.utils.book_append_sheet(wb, ws, "QuyTrinhKT");
      XLSX.writeFile(wb, "QuyTrinhKyThuat_BYT.xlsx");
    }
  };

  const handleDownloadTemplate = () => {
    if (Platform.OS === 'web') {
      const ws = XLSX.utils.json_to_sheet([], { header: columns });
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Template");
      XLSX.writeFile(wb, "FileMau_QuyTrinhKT.xlsx");
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
        alert("Đã Import thành công hệ thống Quy trình Kỹ thuật!");
      }
    };
    reader.readAsBinaryString(file);
  };

  const renderTable = () => (
    <View style={styles.layout_chia_man_hinh}>
      <View style={styles.thanh_cong_cu_mot_hang}>
        <ScrollView
          horizontal
          nestedScrollEnabled
          keyboardShouldPersistTaps="handled"
          showsHorizontalScrollIndicator={false}
          style={styles.cuon_thanh_cong_cu}
          contentContainerStyle={styles.cuon_thanh_cong_cu_content}
        >
          <View style={styles.khoi_tim_tu_khoa}>
            <Text style={styles.icon_tim}>🔎</Text>
            <TextInput
              style={styles.o_tim_tu_khoa}
              value={tuKhoaTim}
              onChangeText={setTuKhoaTim}
              placeholder="Tìm theo từ khóa (mã DV KT, tên QTKT, cột…)"
              placeholderTextColor="#888"
              autoCorrect={false}
              autoCapitalize="none"
              {...Platform.select({ web: { outlineStyle: 'none' } })}
            />
            {tuKhoaTim ? (
              <TouchableOpacity onPress={() => setTuKhoaTim('')} style={styles.nut_xoa_tim} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Text style={styles.chu_xoa_tim}>✕</Text>
              </TouchableOpacity>
            ) : null}
          </View>
          <TouchableOpacity style={styles.btn_gon_pink} onPress={handleAddRow}>
            <Text style={styles.txt_btn_gon}>➕ THÊM DÒNG</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btn_gon_red} onPress={handleDeleteBulk}>
            <Text style={styles.txt_btn_gon}>🗑 XÓA ({selectedRows.length})</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.o_nhap_ten_cot_gon}
            placeholder="Tên trường mới…"
            value={newColName}
            onChangeText={setNewColName}
            placeholderTextColor="#888"
            {...Platform.select({ web: { outlineStyle: 'none' } })}
          />
          <TouchableOpacity style={styles.btn_gon_blue} onPress={handleAddColumn}>
            <Text style={styles.txt_btn_gon}>+ TRƯỜNG</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btn_gon_outline} onPress={handleDownloadTemplate}>
            <Text style={styles.txt_btn_gon_outline}>📄 MẪU</Text>
          </TouchableOpacity>
          {Platform.OS === 'web' && (
            <>
              <input type="file" accept=".xlsx, .xls" onChange={handleImport} style={{ display: 'none' }} id="import-excel-qt" />
              <TouchableOpacity style={styles.btn_gon_orange} onPress={() => document.getElementById('import-excel-qt').click()}>
                <Text style={styles.txt_btn_gon}>📤 IMPORT</Text>
              </TouchableOpacity>
            </>
          )}
          <TouchableOpacity style={styles.btn_gon_green} onPress={handleExport}>
            <Text style={styles.txt_btn_gon}>📥 EXPORT</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <View style={styles.phan_bang_du_lieu} onLayout={(e) => setChieuCaoVungBang(e.nativeEvent.layout.height)}>
        <View style={styles.khung_tim_bang}>
          <TimKiemPhanTrangBang
            anThanhTim
            tuKhoa={tuKhoaTim}
            onTuKhoa={setTuKhoaTim}
            tongDongGoc={data.length}
            tongDongSauLoc={nSauLoc}
            soDongMotTrang={soDongMotTrang}
            onSoDongMotTrang={setSoDongMotTrang}
            trangHienTai={trangDangXem}
            onTrangHienTai={setTrangHienTai}
            tongSoTrang={tongSoTrang}
            chiSoBatDau={chiSoBatDau}
            chiSoKetThuc={chiSoKetThuc}
          />
        </View>
        <ScrollView horizontal nestedScrollEnabled style={styles.khung_bang} contentContainerStyle={styles.khung_bang_content}>
          <View style={[styles.khoi_cot_bang, chieuCaoVungBang > 0 && { height: chieuCaoVungBang }]}>
            <View style={styles.dong_tieu_de}>
              <View style={[styles.o_tieu_de, { width: 80 }]}><Text style={styles.chu_o_tieu_de}>CHỌN</Text></View>
              <View style={[styles.o_tieu_de, { width: 120 }]}><Text style={styles.chu_o_tieu_de}>THAO TÁC</Text></View>
              {columns.map((col, index) => (
                <TouchableOpacity key={index} style={[styles.o_tieu_de, { width: 350 }]} onPress={col === 'MÃ DỊCH VỤ KT' ? handleSortABC : null}>
                  <Text style={styles.chu_o_tieu_de}>{col} {col === 'MÃ DỊCH VỤ KT' ? (sortAsc ? ' 🔽' : ' 🔼') : ''}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <ScrollView nestedScrollEnabled style={styles.cuon_bang_doc} keyboardShouldPersistTaps="handled">
              {duLieuTrang.map(({ row }) => (
                <View key={row.id} style={styles.dong_du_lieu}>
                  <View style={[styles.o_du_lieu, { width: 80, justifyContent: 'center', alignItems: 'center' }]}>
                    <TouchableOpacity style={[styles.checkbox, selectedRows.includes(row.id) && styles.checkbox_active]} onPress={() => toggleSelectRow(row.id)}>
                      {selectedRows.includes(row.id) && <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 22 }}>✓</Text>}
                    </TouchableOpacity>
                  </View>

                  <View style={[styles.o_du_lieu, { width: 120, justifyContent: 'center', alignItems: 'center' }]}>
                    <TouchableOpacity style={styles.btn_icon_green} onPress={() => { setCurrentMaDV(row['MÃ DỊCH VỤ KT']); setViewMode('print'); }}>
                      <Text style={styles.txt_btn_small}>🖨️ Bản In</Text>
                    </TouchableOpacity>
                  </View>

                  {columns.map((col, colIndex) => (
                    <TextInput key={colIndex} style={[styles.o_du_lieu, { width: 350 }, col === 'MÃ DỊCH VỤ KT' && { fontWeight: 'bold', color: '#D81B60' }]}
                      multiline value={String(row[col] || '')} onChangeText={(val) => handleCellChange(row.id, col, val)} />
                  ))}
                </View>
              ))}
            </ScrollView>
          </View>
        </ScrollView>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.vung_an_toan}>
      {viewMode !== 'table' && (
        <View style={styles.thanh_dieu_huong_noi_bo}>
          <TouchableOpacity style={styles.btn_outline} onPress={() => setViewMode('table')}>
            <Text style={styles.txt_btn_outline}>⬅ QUAY LẠI BẢNG DỮ LIỆU</Text>
          </TouchableOpacity>
          <Text style={styles.txt_icd_dang_xem}>Bản in Quy trình kỹ thuật mã: {currentMaDV}</Text>
        </View>
      )}
      {viewMode === 'table' ? renderTable() : <InQuyTrinh maDV={currentMaDV} danhSachData={data} />}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  vung_an_toan: { flex: 1, backgroundColor: '#F9F9F9', minHeight: 0 },
  layout_chia_man_hinh: { flex: 1, flexDirection: 'column', minHeight: 0 },
  thanh_cong_cu_mot_hang: {
    flexShrink: 0,
    backgroundColor: '#FFF',
    borderBottomWidth: 2,
    borderBottomColor: '#FCE4EC',
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  cuon_thanh_cong_cu: { flexGrow: 0 },
  cuon_thanh_cong_cu_content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingRight: 8,
    paddingVertical: 2,
  },
  khoi_tim_tu_khoa: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 200,
    maxWidth: 320,
    height: 36,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#FFB3D1',
    borderRadius: 8,
    backgroundColor: '#FFF8FC',
  },
  icon_tim: { fontSize: 14, marginRight: 4 },
  o_tim_tu_khoa: {
    flex: 1,
    minWidth: 120,
    fontSize: 14,
    fontFamily: 'Arial',
    color: '#333',
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  nut_xoa_tim: { padding: 4 },
  chu_xoa_tim: { fontSize: 16, color: '#999', fontWeight: 'bold' },
  btn_gon_pink: { backgroundColor: '#D81B60', paddingVertical: 8, paddingHorizontal: 10, borderRadius: 8, justifyContent: 'center' },
  btn_gon_red: { backgroundColor: '#D32F2F', paddingVertical: 8, paddingHorizontal: 10, borderRadius: 8, justifyContent: 'center' },
  btn_gon_blue: { backgroundColor: '#1976D2', paddingVertical: 8, paddingHorizontal: 10, borderRadius: 8, justifyContent: 'center' },
  btn_gon_green: { backgroundColor: '#388E3C', paddingVertical: 8, paddingHorizontal: 10, borderRadius: 8, justifyContent: 'center' },
  btn_gon_orange: { backgroundColor: '#F57C00', paddingVertical: 8, paddingHorizontal: 10, borderRadius: 8, justifyContent: 'center' },
  btn_gon_outline: {
    backgroundColor: '#FFF',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D81B60',
    justifyContent: 'center',
  },
  txt_btn_gon: { color: '#FFF', fontSize: 13, fontWeight: 'bold', fontFamily: 'Arial' },
  txt_btn_gon_outline: { color: '#D81B60', fontSize: 13, fontWeight: 'bold', fontFamily: 'Arial' },
  o_nhap_ten_cot_gon: {
    width: 140,
    height: 36,
    borderWidth: 1,
    borderColor: '#FFB3D1',
    borderRadius: 8,
    paddingHorizontal: 8,
    fontSize: 13,
    fontFamily: 'Arial',
    color: '#333',
    backgroundColor: '#FFF',
  },
  phan_bang_du_lieu: { flex: 1, minHeight: 0, marginHorizontal: 10, marginBottom: 8, marginTop: 0 },
  khung_tim_bang: { paddingHorizontal: 2, marginBottom: 2 },
  khung_bang_content: { flexGrow: 1 },
  khoi_cot_bang: { flexDirection: 'column', alignSelf: 'flex-start' },
  cuon_bang_doc: { flex: 1 },
  btn_icon_green: { backgroundColor: '#388E3C', paddingVertical: 12, paddingHorizontal: 15, borderRadius: 6 },
  btn_outline: { backgroundColor: '#FFF', padding: 15, borderRadius: 8, borderWidth: 2, borderColor: '#D81B60' },
  txt_btn_small: { color: '#FFF', fontSize: 18, fontWeight: 'bold', fontFamily: 'Arial' },
  txt_btn_outline: { color: '#D81B60', fontSize: 20, fontWeight: 'bold', fontFamily: 'Arial' },
  khung_bang: { flex: 1, minHeight: 0, backgroundColor: '#FFF', borderRadius: 10, elevation: 4 },
  dong_tieu_de: { flexDirection: 'row', backgroundColor: '#FCE4EC', borderBottomWidth: 3, borderColor: '#D81B60' },
  o_tieu_de: { padding: 20, borderRightWidth: 1, borderColor: '#F8BBD0', justifyContent: 'center', alignItems: 'center' },
  chu_o_tieu_de: { fontSize: 20, fontWeight: 'bold', color: '#C2185B', fontFamily: 'Arial', textAlign: 'center' },
  dong_du_lieu: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#EEE' },
  o_du_lieu: { padding: 20, borderRightWidth: 1, borderColor: '#EEE', fontSize: 22, fontFamily: 'Arial', color: '#333', backgroundColor: '#FFF' },
  checkbox: { width: 35, height: 35, borderWidth: 3, borderColor: '#CCC', borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
  checkbox_active: { backgroundColor: '#D32F2F', borderColor: '#D32F2F' },
  thanh_dieu_huong_noi_bo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#FFF', borderBottomWidth: 2, borderColor: '#FCE4EC' },
  txt_icd_dang_xem: { fontSize: 24, fontWeight: 'bold', color: '#333', fontFamily: 'Arial' },
});

export default QuyTrinhMauBYT;