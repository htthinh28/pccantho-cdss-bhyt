import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useMemo, useState } from 'react';
import { Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import TimKiemPhanTrangBang from '../../thanh_phan/tim_kiem_phan_trang_bang';
import { locDongTheoTuKhoa, SO_DONG_TRANG_MAC_DINH, tinhChiSoPhanTrang } from '../../tien_ich/bo_loc_bang_du_lieu';
import * as XLSX from 'xlsx';

import InPhacDo from './in_phac_do';
import {
  chuanHoaDongImportPhacDo,
  COT_MAC_DINH_PHAC_DO_CDSS,
  gopPhacDoImportVoiDuLieuHienTai,
  laDongMauTemplatePhacDo,
  loaiTrungMaIcdUuTienNoiDung,
} from './phac_do_cdss_columns';
import InfographicPhacDo from './infographic';

import seedGuidelines from './du_lieu_phac_do_cdss_guidelines.seed.json';

const KEY_COLS = 'CDSS_COLS_PHAC_DO_V3';
const KEY_DATA = 'CDSS_DATA_PHAC_DO_V3';

const COT_MAC_DINH = COT_MAC_DINH_PHAC_DO_CDSS;

const gopCotTuDong = (dong) => {
  const keys = Object.keys(dong || {}).filter((k) => k !== 'id');
  const thuTu = [...COT_MAC_DINH];
  keys.forEach((k) => {
    if (!thuTu.includes(k)) thuTu.push(k);
  });
  return thuTu;
};

const PhacDoBenhVien = () => {
  const [columns, setColumns] = useState(COT_MAC_DINH);
  const [data, setData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [newColName, setNewColName] = useState('');
  const [sortAsc, setSortAsc] = useState(true);
  /** Chiều cao vùng bảng (flex 3/4) — cần cho ScrollView ngang + cuộn dọc bên trong */
  const [chieuCaoVungBang, setChieuCaoVungBang] = useState(0);
  
  // Trạng thái điều hướng xem/in
  const [viewMode, setViewMode] = useState('table'); 
  const [currentICD, setCurrentICD] = useState('');
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

  const noiDungDongHienTai = useMemo(() => {
    const key = 'MÃ ICD-10';
    return data.find((row) => String(row[key] || '').trim() === String(currentICD || '').trim()) || null;
  }, [data, currentICD]);

  useEffect(() => {
    const taiDuLieu = async () => {
      try {
        const storedCols = await AsyncStorage.getItem(KEY_COLS);
        const storedData = await AsyncStorage.getItem(KEY_DATA);
        const seedCols = Array.isArray(seedGuidelines.columns) ? seedGuidelines.columns : COT_MAC_DINH;
        const seedData = Array.isArray(seedGuidelines.data) ? seedGuidelines.data : [];
        if (storedData) {
          if (storedCols) setColumns(JSON.parse(storedCols));
          setData(JSON.parse(storedData));
        } else {
          setColumns(seedCols);
          setData(seedData.length ? seedData : []);
        }
      } catch (e) { console.error(e); }
    };
    taiDuLieu();
  }, []);

  const luuHeThong = async (newData, newCols = columns) => {
    setData(newData);
    setColumns(newCols);
    await AsyncStorage.setItem(KEY_DATA, JSON.stringify(newData));
    await AsyncStorage.setItem(KEY_COLS, JSON.stringify(newCols));
  };

  const handleAddRow = () => {
    const newRow = { id: Date.now().toString() };
    columns.forEach(col => newRow[col] = '');
    luuHeThong([newRow, ...data]);
  };

  const handleAddColumn = () => {
    if (!newColName) return;
    const colName = newColName.trim();
    if (columns.some((c) => c.toLowerCase() === colName.toLowerCase())) return alert('Cột đã tồn tại!');
    luuHeThong(data, [...columns, colName]);
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
      XLSX.utils.book_append_sheet(wb, ws, 'PhacDo');
      XLSX.writeFile(wb, 'PhacDo_CDSS_PhuongChau.xlsx');
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
      const wsname = wb.SheetNames.includes('Template') ? 'Template' : wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const importedData = XLSX.utils.sheet_to_json(ws, { defval: '' });

      if (importedData.length > 0) {
        const formattedData = importedData
          .map((row, i) => {
            const clean = chuanHoaDongImportPhacDo(row);
            return { ...clean, id: clean.id || `imp-${Date.now()}-${i}` };
          })
          .filter((r) => !laDongMauTemplatePhacDo(r));
        const importKhongTrungIcd = loaiTrungMaIcdUuTienNoiDung(formattedData);
        const mergedRows = gopPhacDoImportVoiDuLieuHienTai(data, importKhongTrungIcd, {
          uuTienFileMoi: true,
          loaiTenBenhTrung: false,
        });
        const mergedCols = gopCotTuDong(mergedRows[0] || formattedData[0]);
        luuHeThong(mergedRows, mergedCols);
        alert(
          'Đã import và gộp phác đồ CDSS: ưu tiên nội dung file mới cho trùng mã ICD; giữ các mã chỉ có trong bảng cũ; trùng mã ICD trong cùng file giữ bản chi tiết nhất.',
        );
      }
      e.target.value = '';
    };
    reader.readAsBinaryString(file);
  };

  const renderTable = () => (
    <View style={styles.layout_chia_man_hinh}>
      <View style={styles.phan_cong_cu_va_ghi_chu}>
        <ScrollView
          nestedScrollEnabled
          keyboardShouldPersistTaps="handled"
          style={styles.cuon_phan_tren}
          contentContainerStyle={styles.cuon_phan_tren_content}
        >
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

          <View style={styles.khu_vuc_trich_dan}>
            <Text style={styles.van_ban_trich_dan}>Cấu trúc cột khớp bảng CDSS Guidelines (ICD-10, mục tiêu điều trị, điều trị đặc hiệu/triệu chứng, can thiệp, dự phòng, theo dõi…).</Text>
            <Text style={styles.van_ban_trich_dan}>Import .xlsx (sheet Template nếu có): gộp với dữ liệu hiện tại — cùng mã ICD lấy theo file mới; không nhân đôi bệnh đã có mã.</Text>
          </View>
        </ScrollView>
      </View>

      <View
        style={styles.phan_bang_du_lieu}
        onLayout={(e) => setChieuCaoVungBang(e.nativeEvent.layout.height)}
      >
        <View style={styles.khung_tim_bang}>
          <TimKiemPhanTrangBang
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
              <View style={[styles.o_tieu_de, { width: 180 }]}><Text style={styles.chu_o_tieu_de}>THAO TÁC</Text></View>
              {columns.map((col, index) => (
                <TouchableOpacity key={index} style={[styles.o_tieu_de, { width: 350 }]} onPress={col === 'MÃ ICD-10' ? handleSortABC : null}>
                  <Text style={styles.chu_o_tieu_de}>{col} {col === 'MÃ ICD-10' ? (sortAsc ? ' 🔽' : ' 🔼') : ''}</Text>
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
          <Text style={styles.txt_icd_dang_xem}>Hồ sơ Phác đồ CDSS mã ICD-10: {currentICD}</Text>
        </View>
      )}

      {viewMode === 'table' ? renderTable() :
        viewMode === 'info' ? (
          <InfographicPhacDo maICD={currentICD} noiDungPhacDo={noiDungDongHienTai} />
        ) : (
          <InPhacDo maICD={currentICD} noiDungPhacDo={noiDungDongHienTai} />
        )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  vung_an_toan: { flex: 1, backgroundColor: '#F9F9F9', minHeight: 0 },
  layout_chia_man_hinh: { flex: 1, flexDirection: 'column', minHeight: 0 },
  /** Tỷ lệ 1 : 3 với vùng bảng (công cụ + ghi chú ~25%, bảng ~75%) */
  phan_cong_cu_va_ghi_chu: { flex: 1, flexBasis: 0, minHeight: 0 },
  cuon_phan_tren: { flex: 1 },
  cuon_phan_tren_content: { flexGrow: 1, paddingBottom: 8 },
  phan_bang_du_lieu: { flex: 3, flexBasis: 0, minHeight: 0, marginHorizontal: 20, marginBottom: 12 },
  khung_tim_bang: { paddingHorizontal: 4, marginBottom: 4 },
  khung_bang_content: { flexGrow: 1 },
  khoi_cot_bang: { flexDirection: 'column', alignSelf: 'flex-start' },
  cuon_bang_doc: { flex: 1 },
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
  
  khung_bang: { flex: 1, backgroundColor: '#FFF', borderRadius: 10, elevation: 4 },
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