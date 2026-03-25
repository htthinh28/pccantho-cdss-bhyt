/**
 * TỆP LÕI: HỆ QUẢN TRỊ QUY TẮC BHYT ĐỘNG (NO-CODE RULE ENGINE CMS)
 * Chức năng: Quản lý 11 tệp luật BHYT dưới dạng Bảng dữ liệu động.
 * Đột phá UX: Bảng tự động giãn Full màn hình, hỗ trợ SẮP XẾP (SORT) linh hoạt.
 * Tính năng MỚI: 
 * 1. Auto-Save - Hệ thống tự động ghi nhớ sau mỗi lần nhập (Không sợ F5).
 * 2. Nút ON/OFF: Bật/tắt nhanh trạng thái thực thi của từng quy tắc.
 * 3. Select All: Chọn hàng loạt quy tắc để thao tác nhanh.
 * 4. UI/UX: Các cột dữ liệu dài tự động giãn chiều cao (Auto-height) để đọc full text.
 * 5. ANTI-DUPLICATE: Kiểm soát chặt chẽ trùng lặp trường DIEU_KIEN khi Nhập tay & Import Excel.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useRef, useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as XLSX from 'xlsx';
import { CD } from '../tien_ich/chu_de_giao_dien';

// 1. DANH SÁCH 11 TAB TƯƠNG ỨNG GIAO DIỆN
const DANH_SACH_TAB = [
  { id: 'LUAT_DU_LIEU', ten: '1. Cấu trúc XML', file: 'quyluat_cau_truc_du_lieu.jsx' },
  { id: 'LUAT_HANH_CHINH', ten: '2. Hành chính', file: 'luat_hanh_chinh.jsx' },
  { id: 'LUAT_CHUYEN_TUYEN', ten: '3. Chuyển tuyến', file: 'luat_chuyen_tuyen.jsx' },
  { id: 'LUAT_HOP_DONG', ten: '4. Hợp đồng', file: 'hopdong.jsx' },
  { id: 'LUAT_CONG_KHAM', ten: '5. Công khám', file: 'luat_cong_kham.jsx' },
  { id: 'LUAT_CDHA', ten: '6. CĐHA', file: 'luat_cdha.jsx' },
  { id: 'LUAT_MAU', ten: '7. Máu', file: 'luat_mau.jsx' },
  { id: 'LUAT_THUOC', ten: '8. Thuốc', file: 'luat_thuoc.jsx' },
  { id: 'LUAT_GIUONG', ten: '9. Giường bệnh', file: 'luat_giuong_benh.jsx' },
  { id: 'LUAT_NHAN_SU', ten: '10. Nhân sự', file: 'luat_nhan_su.jsx' },
  { id: 'LUAT_PTTT', ten: '11. Phẫu/Thủ thuật', file: 'luat_pttt.jsx' }
];

const ManHinhQuanLyLuat = ({ navigation }) => {
  const [tabHienTai, setTabHienTai] = useState(DANH_SACH_TAB[0].id);
  const [columns, setColumns] = useState([]);
  const [data, setData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [newColumnName, setNewColumnName] = useState('');
  
  const [sortConfig, setSortConfig] = useState({ column: null, direction: 'asc' });
  const isInitialMount = useRef(true);

  // --- TẢI DỮ LIỆU VÀ CẤU TRÚC CỘT TỪ LOCAL STORAGE ---
  useEffect(() => {
    const taiDuLieu = async () => {
      isInitialMount.current = true; 
      try {
        const colsLuuTru = await AsyncStorage.getItem(`CDSS_COLS_${tabHienTai}`);
        const dataLuuTru = await AsyncStorage.getItem(`CDSS_DATA_${tabHienTai}`);
        
        let loadedCols = colsLuuTru ? JSON.parse(colsLuuTru) : ['TRANG_THAI', 'MA_LUAT', 'TEN_QUY_TAC', 'DIEU_KIEN', 'CANH_BAO'];
        
        if (!loadedCols.includes('TRANG_THAI')) {
           loadedCols = ['TRANG_THAI', ...loadedCols];
        }
        setColumns(loadedCols);

        let loadedData = dataLuuTru ? JSON.parse(dataLuuTru) : [];
        loadedData = loadedData.map(row => ({
          ...row,
          TRANG_THAI: (row.TRANG_THAI === undefined || row.TRANG_THAI === "") ? "ON" : row.TRANG_THAI
        }));

        setData(loadedData);
        setSelectedRows([]); 
        setSortConfig({ column: null, direction: 'asc' }); 
      } catch (error) {
        console.error("Lỗi tải dữ liệu luật:", error);
      } finally {
        setTimeout(() => { isInitialMount.current = false; }, 100);
      }
    };
    taiDuLieu();
  }, [tabHienTai]);

  // --- CƠ CHẾ AUTO-SAVE (LƯU NGẦM TỰ ĐỘNG) ---
  useEffect(() => {
    if (isInitialMount.current) return; 

    const timer = setTimeout(async () => {
      try {
        await AsyncStorage.setItem(`CDSS_DATA_${tabHienTai}`, JSON.stringify(data));
        await AsyncStorage.setItem(`CDSS_COLS_${tabHienTai}`, JSON.stringify(columns));
        console.log(`[Auto-Save] Đã tự động lưu ${data.length} luật của tab ${tabHienTai}`);
      } catch (e) {
        console.error("Lỗi Auto-Save:", e);
      }
    }, 600); 

    return () => clearTimeout(timer);
  }, [data, columns, tabHienTai]);

  const luuHeThong = async (newData, newCols) => {
    setData(newData);
    setColumns(newCols);
  };

  // --- TÍNH TOÁN CÁC ĐIỀU KIỆN BỊ TRÙNG LẶP ĐỂ HIỂN THỊ CẢNH BÁO ---
  const countDuplicateConditions = () => {
    const counts = {};
    data.forEach(row => {
      const dk = (row.DIEU_KIEN || '').trim();
      if (dk) {
        counts[dk] = (counts[dk] || 0) + 1;
      }
    });
    return counts;
  };
  const dieuKienCounts = countDuplicateConditions();

  // Kiểm tra trùng lặp khi người dùng gõ xong (onBlur)
  const kiemTraTrungLapBlur = (text, rowId) => {
    if (!text || text.trim() === '') return;
    const isDuplicate = data.some(row => row.id !== rowId && (row.DIEU_KIEN || '').trim() === text.trim());
    
    if (isDuplicate) {
      if (Platform.OS === 'web') {
        window.alert(`⚠️ PHÁT HIỆN TRÙNG LẶP!\n\nĐiều kiện:\n"${text}"\n\nQuy tắc này đã tồn tại trong tệp luật hiện tại. Vui lòng chỉnh sửa để tránh bị lỗi khi giám định.`);
      } else {
        Alert.alert("⚠️ TRÙNG LẶP QUY TẮC", "Điều kiện này đã tồn tại trong hệ thống. Vui lòng kiểm tra lại!");
      }
    }
  };

  // --- HÀM SẮP XẾP DỮ LIỆU (SORT) ---
  const handleSort = (columnName) => {
    let direction = 'asc';
    if (sortConfig.column === columnName && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ column: columnName, direction });

    const sortedData = [...data].sort((a, b) => {
      let valA = a[columnName] || '';
      let valB = b[columnName] || '';

      if (!isNaN(valA) && !isNaN(valB) && valA !== '' && valB !== '') {
        return direction === 'asc' ? valA - valB : valB - valA;
      }

      return direction === 'asc' 
        ? String(valA).localeCompare(String(valB), 'vi', { sensitivity: 'base' })
        : String(valB).localeCompare(String(valA), 'vi', { sensitivity: 'base' });
    });

    setData(sortedData);
  };

  // --- CÁC HÀM NO-CODE (TÙY BIẾN CỘT VÀ DÒNG) ---
  const handleAddColumn = () => {
    if (!newColumnName) return alert("Vui lòng nhập tên trường (cột) mới!");
    const colName = newColumnName.trim().toUpperCase().replace(/ /g, '_');
    if (columns.includes(colName)) return alert("Trường này đã tồn tại trong luật!");
    
    luuHeThong(data, [...columns, colName]);
    setNewColumnName('');
  };

  const handleAddRow = () => {
    if (columns.length === 0) return alert("Vui lòng thêm ít nhất 1 cột trước!");
    const newRow = { id: `RULE_${Date.now()}` };
    columns.forEach(col => newRow[col] = (col === 'TRANG_THAI' ? 'ON' : ""));
    luuHeThong([newRow, ...data], columns);
  };

  const handleCellChange = (text, rowId, colName) => {
    const newData = data.map(row => row.id === rowId ? { ...row, [colName]: text } : row);
    setData(newData); 
  };

  // --- CHỨC NĂNG ON/OFF VÀ SELECT ALL ---
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

  const handleSelectAll = () => {
    if (selectedRows.length === data.length && data.length > 0) {
      setSelectedRows([]); 
    } else {
      setSelectedRows(data.map(row => row.id)); 
    }
  };

  const handleXoaHangLoat = () => {
    if (selectedRows.length === 0) return alert("Vui lòng chọn ít nhất 1 dòng để xóa!");
    if (window.confirm(`Chắc chắn xóa ${selectedRows.length} quy tắc đã chọn?`)) {
      const newData = data.filter(row => !selectedRows.includes(row.id));
      luuHeThong(newData, columns);
      setSelectedRows([]);
    }
  };

  // --- SIÊU CÔNG CỤ EXCEL VÀ IMPORT LỌC TRÙNG ---
  const taiFileMau = () => {
    if (Platform.OS === 'web') {
      const ws = XLSX.utils.aoa_to_sheet([columns]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Mau_Nhap_Luat");
      XLSX.writeFile(wb, `Template_${tabHienTai}.xlsx`);
    } else {
        Alert.alert("Thông báo", "Chức năng tải file chỉ hỗ trợ trên Web.");
    }
  };

  const xuLyExport = () => {
    if (data.length === 0) return alert("Không có dữ liệu luật để xuất!");
    if (Platform.OS === 'web') {
      const exportData = data.map(row => {
        const rowData = {};
        columns.forEach(col => rowData[col] = row[col] || '');
        return rowData;
      });
      const ws = XLSX.utils.json_to_sheet(exportData, { header: columns });
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Danh_Sach_Luat");
      XLSX.writeFile(wb, `DuLieu_${tabHienTai}.xlsx`);
    }
  };

  const xuLyImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const importedData = XLSX.utils.sheet_to_json(ws, { defval: "" });
      
      if (importedData.length > 0) {
        const excelCols = Object.keys(importedData[0]);
        
        // CƠ CHẾ LỌC TRÙNG LẶP KHI IMPORT
        const existingConditions = new Set(data.map(r => (r.DIEU_KIEN || "").trim()).filter(Boolean));
        const uniqueImported = [];
        let duplicateCount = 0;

        importedData.forEach(row => {
          const dk = (row.DIEU_KIEN || "").trim();
          if (dk && existingConditions.has(dk)) {
            duplicateCount++; // Bỏ qua dòng này nếu DIEU_KIEN đã tồn tại
          } else {
            if (dk) existingConditions.add(dk);
            uniqueImported.push({
              ...row,
              id: `RULE_IMP_${Date.now()}_${Math.random()}`,
              TRANG_THAI: (row.TRANG_THAI === undefined || row.TRANG_THAI === "") ? "ON" : row.TRANG_THAI
            });
          }
        });
        
        const mergedCols = [...new Set([...columns, ...excelCols])];
        if (!mergedCols.includes('TRANG_THAI')) mergedCols.unshift('TRANG_THAI');

        luuHeThong([...uniqueImported, ...data], mergedCols);
        
        if (duplicateCount > 0) {
            alert(`✅ Đã Import thành công ${uniqueImported.length} quy tắc!\n⚠️ Đã TỰ ĐỘNG BỎ QUA ${duplicateCount} quy tắc bị trùng trường DIEU_KIEN.`);
        } else {
            alert(`✅ Đã Import thành công ${uniqueImported.length} quy tắc mới!`);
        }
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = null; 
  };

  return (
    <SafeAreaView style={styles.vung_an_toan}>
      {/* HEADER */}
      <View style={styles.thanh_tieu_de}>
        <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.nut_quay_lai}>
          <Text style={styles.chu_nut_header}>⬅ TRỞ VỀ</Text>
        </TouchableOpacity>
        <Text style={styles.chu_tieu_de}>⚙️ HỆ QUẢN TRỊ QUY TẮC BHYT ĐỘNG (NO-CODE)</Text>
        <View style={{ width: 120 }} />
      </View>

      <View style={styles.khung_chuc_nang}>
        {/* THANH TAB 11 TỆP LUẬT */}
        <View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.khung_tab}>
            {DANH_SACH_TAB.map(tab => (
              <TouchableOpacity 
                key={tab.id} 
                onPress={() => setTabHienTai(tab.id)} 
                style={[styles.nut_tab, tabHienTai === tab.id && styles.nut_tab_active]}
              >
                <Text style={[styles.chu_tab, tabHienTai === tab.id && styles.chu_tab_active]}>{tab.ten}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.thanh_cong_cu}>
          <View style={styles.khoi_them_cot}>
            <TextInput 
              style={styles.o_nhap_cot} 
              placeholder="Tên trường kiểm soát (VD: MA_ICD_LOAI_TRU)" 
              value={newColumnName} 
              onChangeText={setNewColumnName} 
              outlineStyle="none"
            />
            <TouchableOpacity style={styles.nut_xanh} onPress={handleAddColumn}>
              <Text style={styles.chu_nut}>+ THÊM TRƯỜNG</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.khoi_hanh_dong}>
            <TouchableOpacity style={styles.btn_outline} onPress={taiFileMau}>
              <Text style={styles.chu_btn_outline}>⬇ TẢI MẪU CHUẨN EXCEL</Text>
            </TouchableOpacity>
            
            {Platform.OS === 'web' && (
              <>
                <input type="file" accept=".xlsx, .xls" onChange={xuLyImport} style={{ display: 'none' }} id="import-luat" />
                <TouchableOpacity style={styles.nut_cam} onPress={() => document.getElementById('import-luat').click()}>
                  <Text style={styles.chu_nut}>📤 IMPORT EXCEL</Text>
                </TouchableOpacity>
              </>
            )}
            <TouchableOpacity style={styles.nut_xanh_duong} onPress={xuLyExport}>
              <Text style={styles.chu_nut}>📥 EXPORT BẢNG</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.nut_do} onPress={() => { alert("Dữ liệu đã được hệ thống tự động lưu!"); }}>
              <Text style={styles.chu_nut}>💾 ĐÃ TỰ ĐỘNG LƯU</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.thanh_tieu_de_bang}>
          <Text style={styles.tieu_de_bang}>
            📋 ĐANG QUẢN TRỊ TỆP: <Text style={{color: '#F48FB1'}}>{DANH_SACH_TAB.find(t => t.id === tabHienTai)?.file}</Text> ({data.length} Quy tắc)
          </Text>
          <View style={{flexDirection: 'row', gap: 15}}>
            {selectedRows.length > 0 && (
              <TouchableOpacity style={styles.nut_xoa_nhom} onPress={handleXoaHangLoat}>
                <Text style={styles.chu_nut_xoa}>🗑 XÓA {selectedRows.length} DÒNG</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.nut_hong} onPress={handleAddRow}>
              <Text style={styles.chu_nut}>➕ THÊM QUY TẮC (DÒNG)</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* --- KHU VỰC BẢNG LÕI (CẢI TIẾN AUTO HEIGHT & FLEX WIDTH) --- */}
        <View style={styles.khung_bang_wrapper}>
          <ScrollView horizontal style={styles.scroll_ngang} contentContainerStyle={{ minWidth: '100%' }}>
            <View style={{ flex: 1 }}>
              <View style={styles.dong_tieu_de}>
                <TouchableOpacity style={[styles.o_tieu_de, { width: 90, alignItems: 'center', flexShrink: 0 }]} onPress={handleSelectAll}>
                  <View style={[styles.checkbox, selectedRows.length === data.length && data.length > 0 && styles.checkbox_active]}>
                    {selectedRows.length === data.length && data.length > 0 && <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 16 }}>✓ All</Text>}
                  </View>
                </TouchableOpacity>

                {columns.map((col, index) => {
                  let flexScale = 1;
                  let minWidth = 150;
                  
                  if (col === 'TRANG_THAI') { flexScale = 0; minWidth = 160; }
                  else if (col === 'MA_LUAT') { flexScale = 1; minWidth = 150; }
                  else if (col === 'TEN_QUY_TAC') { flexScale = 2; minWidth = 250; }
                  else if (col === 'DIEU_KIEN') { flexScale = 3; minWidth = 400; }
                  else if (col === 'CANH_BAO') { flexScale = 3; minWidth = 400; }

                  return (
                    <TouchableOpacity 
                      key={index} 
                      style={[styles.o_tieu_de, { flex: flexScale, minWidth: minWidth }]}
                      onPress={() => handleSort(col)}
                    >
                      <Text style={styles.chu_o_tieu_de}>
                        {col} {sortConfig.column === col ? (sortConfig.direction === 'asc' ? '🔼' : '🔽') : '↕️'}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <ScrollView style={{ flex: 1 }}>
                {data.map((row, rowIndex) => (
                  <View key={row.id} style={[
                    styles.dong_du_lieu,
                    { backgroundColor: rowIndex % 2 === 0 ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.01)' },
                    selectedRows.includes(row.id) && { backgroundColor: 'rgba(194,24,91,0.2)' },
                    row.TRANG_THAI === 'OFF' && { opacity: 0.65 }
                  ]}>
                    <TouchableOpacity style={[styles.o_du_lieu, { width: 90, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }]} onPress={() => toggleSelectRow(row.id)}>
                      <View style={[styles.checkbox, selectedRows.includes(row.id) && styles.checkbox_active]}>
                        {selectedRows.includes(row.id) && <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 20 }}>✓</Text>}
                      </View>
                    </TouchableOpacity>

                    {columns.map((col, colIndex) => {
                      if (col === 'TRANG_THAI') {
                        const isOn = row[col] === 'ON';
                        return (
                          <View key={colIndex} style={[styles.o_du_lieu, { width: 160, flexShrink: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'transparent' }]}>
                             <TouchableOpacity
                               style={[styles.btn_toggle, isOn
                                 ? { backgroundColor: 'rgba(76,175,80,0.2)', borderWidth: 1, borderColor: 'rgba(76,175,80,0.5)' }
                                 : { backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' }
                               ]}
                               onPress={() => toggleTrangThai(row.id)}
                             >
                                <Text style={[styles.txt_toggle, { color: isOn ? '#A5D6A7' : 'rgba(255,255,255,0.4)' }]}>{isOn ? '🟢 BẬT' : '⚫ TẮT'}</Text>
                             </TouchableOpacity>
                          </View>
                        );
                      }

                      let flexScale = 1;
                      let minWidth = 150;
                      if (col === 'MA_LUAT') { flexScale = 1; minWidth = 150; }
                      else if (col === 'TEN_QUY_TAC') { flexScale = 2; minWidth = 250; }
                      else if (col === 'DIEU_KIEN') { flexScale = 3; minWidth = 400; }
                      else if (col === 'CANH_BAO') { flexScale = 3; minWidth = 400; }

                      // Xác định ô này có bị trùng lặp DIEU_KIEN không
                      const isDuplicateCell = col === 'DIEU_KIEN' && row[col] && dieuKienCounts[row[col].trim()] > 1;

                      return (
                        <View key={colIndex} style={[styles.o_du_lieu, {
                            flex: flexScale,
                            minWidth: minWidth,
                            backgroundColor: isDuplicateCell ? 'rgba(194,24,91,0.25)' : 'transparent',
                            position: 'relative'
                          }]}>
                          <TextInput
                            style={[
                              styles.input_auto_height,
                              isDuplicateCell && { color: '#F48FB1', fontWeight: 'bold' }
                            ]}
                            value={String(row[col] || '')}
                            onChangeText={(text) => handleCellChange(text, row.id, col)}
                            onBlur={() => {
                              if (col === 'DIEU_KIEN') kiemTraTrungLapBlur(row[col], row.id);
                            }}
                            multiline={true}
                            outlineStyle="none"
                          />
                          {isDuplicateCell && (
                            <Text style={styles.txt_canh_bao_trung}>⚠️ Trùng lặp</Text>
                          )}
                        </View>
                      );
                    })}
                  </View>
                ))}
                {data.length === 0 && (
                  <Text style={styles.txt_trong}>Tệp luật này hiện đang trống. Bác sĩ có thể Import Excel hoặc thêm dòng mới.</Text>
                )}
              </ScrollView>
            </View>
          </ScrollView>
        </View>
        
      </View>
    </SafeAreaView>
  );
};

export default ManHinhQuanLyLuat;

const styles = StyleSheet.create({
  vung_an_toan: {
    flex: 1,
    backgroundColor: CD.bg.gradient_mobile,
    ...Platform.select({ web: { background: CD.web.gradient_bg } }),
  },
  thanh_tieu_de: {
    backgroundColor: CD.brand.mauDam,
    paddingHorizontal: 24,
    paddingVertical: 16,
    paddingTop: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: CD.border.header,
    ...Platform.select({ web: { background: CD.web.gradient_header, backdropFilter: CD.web.blur_header, boxShadow: CD.web.shadow_header } }),
  },
  nut_quay_lai: {
    padding: 12,
    backgroundColor: CD.bg.glass_input,
    borderWidth: 1,
    borderColor: CD.border.glass_md,
    borderRadius: 14,
  },
  chu_nut_header: { color: CD.text.primary, fontWeight: 'bold', fontSize: 20, fontFamily: CD.font.family },
  chu_tieu_de: { fontSize: 26, color: CD.text.primary, fontWeight: 'bold', fontFamily: CD.font.family },
  khung_chuc_nang: { padding: 15, flex: 1 },
  khung_tab: { flexDirection: 'row', marginBottom: 20 },
  nut_tab: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: CD.bg.glass_card,
    marginRight: 10,
    borderRadius: 10,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: CD.border.glass,
  },
  nut_tab_active: {
    backgroundColor: CD.brand.mauChinh,
    borderWidth: 0,
    ...Platform.select({ web: { background: CD.web.gradient_primary, boxShadow: CD.web.shadow_btn } }),
  },
  chu_tab: { fontSize: 20, color: CD.text.secondary, fontWeight: 'bold', fontFamily: CD.font.family },
  chu_tab_active: { color: CD.text.primary },
  thanh_cong_cu: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' },
  khoi_them_cot: { flexDirection: 'row', alignItems: 'center' },
  o_nhap_cot: {
    backgroundColor: CD.bg.glass_input,
    borderWidth: 1,
    borderColor: CD.border.input,
    borderRadius: 12,
    color: CD.text.primary,
    fontSize: 22,
    paddingVertical: 14,
    paddingHorizontal: 16,
    width: 350,
    marginRight: 15,
    fontFamily: CD.font.family,
    ...Platform.select({ web: { backdropFilter: CD.web.blur_input, outlineStyle: 'none' } }),
  },
  khoi_hanh_dong: { flexDirection: 'row', gap: 15, alignItems: 'center' },
  // "+ THÊM TRƯỜNG" → Primary button (blue tone → using primary pink per design)
  nut_xanh: {
    backgroundColor: CD.brand.mauChinh,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({ web: { background: CD.web.gradient_primary, boxShadow: CD.web.shadow_btn, cursor: CD.web.cursor_pointer } }),
  },
  // EXPORT → secondary glass button
  nut_xanh_duong: {
    backgroundColor: CD.bg.glass_input,
    borderWidth: 1,
    borderColor: CD.border.glass_md,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  // IMPORT EXCEL → green button
  nut_cam: {
    backgroundColor: '#388E3C',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    justifyContent: 'center',
    ...Platform.select({ web: { background: CD.web.gradient_green, boxShadow: CD.web.shadow_btn_green, cursor: CD.web.cursor_pointer } }),
  },
  // THÊM QUY TẮC → primary button
  nut_hong: {
    backgroundColor: CD.brand.mauChinh,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({ web: { background: CD.web.gradient_primary, boxShadow: CD.web.shadow_btn, cursor: CD.web.cursor_pointer } }),
  },
  // TỰ ĐỘNG LƯU → green button
  nut_do: {
    backgroundColor: '#388E3C',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    justifyContent: 'center',
    ...Platform.select({ web: { background: CD.web.gradient_green, boxShadow: CD.web.shadow_btn_green, cursor: CD.web.cursor_pointer } }),
  },
  // TẢI MẪU CHUẨN EXCEL → secondary glass button
  btn_outline: {
    backgroundColor: CD.bg.glass_input,
    borderWidth: 1,
    borderColor: CD.border.glass_md,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  chu_btn_outline: { color: CD.text.primary, fontSize: 20, fontWeight: 'bold', fontFamily: CD.font.family },
  chu_nut: { color: CD.text.primary, fontWeight: 'bold', fontSize: 20, fontFamily: CD.font.family },
  thanh_tieu_de_bang: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  tieu_de_bang: { fontSize: 24, fontWeight: 'bold', color: CD.text.primary, fontFamily: CD.font.family },
  // XÓA DÒNG → secondary glass button
  nut_xoa_nhom: {
    backgroundColor: CD.bg.glass_input,
    borderWidth: 1,
    borderColor: CD.border.glass_md,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  chu_nut_xoa: { color: CD.text.primary, fontWeight: 'bold', fontSize: 20, fontFamily: CD.font.family },
  khung_bang_wrapper: {
    flex: 1,
    backgroundColor: CD.bg.glass_card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: CD.border.glass,
    overflow: 'hidden',
    ...Platform.select({ web: { backdropFilter: CD.web.blur_card, WebkitBackdropFilter: CD.web.blur_card, boxShadow: CD.web.shadow_card } }),
  },
  scroll_ngang: { flex: 1 },
  dong_tieu_de: { flexDirection: 'row', backgroundColor: CD.bg.table_header, borderBottomWidth: 2, borderColor: CD.border.accent },
  o_tieu_de: { padding: 18, borderRightWidth: 1, borderColor: CD.border.divider, justifyContent: 'center' },
  chu_o_tieu_de: { fontWeight: '700', fontSize: 20, color: CD.text.table_header, fontFamily: CD.font.family, textAlign: 'center' },

  dong_du_lieu: { flexDirection: 'row', borderBottomWidth: 1, borderColor: CD.border.divider },
  o_du_lieu: { borderRightWidth: 1, borderColor: CD.border.divider, padding: 0, justifyContent: 'center' },

  input_auto_height: {
    padding: 15,
    fontSize: 22,
    color: CD.text.primary,
    fontFamily: CD.font.family,
    minHeight: 60,
    height: '100%',
    textAlignVertical: 'top',
    backgroundColor: CD.bg.glass_input,
    borderWidth: 1,
    borderColor: CD.border.input,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },

  checkbox: { width: 35, height: 35, borderWidth: 2, borderColor: CD.border.glass_md, borderRadius: 6, justifyContent: 'center', alignItems: 'center', backgroundColor: CD.bg.glass_input },
  checkbox_active: { backgroundColor: CD.brand.mauChinh, borderColor: CD.brand.mauChinh2 },

  btn_toggle: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 25, elevation: 2 },
  txt_toggle: { color: CD.text.primary, fontWeight: 'bold', fontSize: 18, fontFamily: CD.font.family },

  txt_trong: { padding: 50, fontSize: 24, fontStyle: 'italic', color: CD.text.muted, textAlign: 'center', fontFamily: CD.font.family },

  // Style cảnh báo khi bị trùng
  txt_canh_bao_trung: { color: CD.brand.mauNhat, fontSize: 13, fontWeight: 'bold', position: 'absolute', bottom: 4, right: 10, backgroundColor: CD.bg.table_header, paddingHorizontal: 5, borderRadius: 4 }
});