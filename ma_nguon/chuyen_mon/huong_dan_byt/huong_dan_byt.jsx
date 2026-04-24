/**
 * Hướng dẫn chẩn đoán & điều trị (Bộ Y tế) — CDSS
 * Bảng chỉnh sửa, tìm kiếm, phân trang, Import/Export.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useMemo, useState } from 'react';
import { Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as XLSX from 'xlsx';

import { CD } from '../../tien_ich/chu_de_giao_dien';
import TimKiemPhanTrangBang from '../../thanh_phan/tim_kiem_phan_trang_bang';
import { locDongTheoTuKhoa, SO_DONG_TRANG_MAC_DINH, tinhChiSoPhanTrang } from '../../tien_ich/bo_loc_bang_du_lieu';
import InHuongDanByt, { inHoacChiaSeHuongDanBytMotDong } from './in_huong_dan_byt';

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
  'Tiên lượng',
];

const DULIEU_MAU = [
  {
    id: '1',
    'Mã ICD10': 'B16',
    'Tên bệnh': 'Viêm gan vi rút B cấp',
    'Lâm sàng':
      'Chán ăn, mệt mỏi, vàng da, tiểu ít sậm màu, đau tức vùng gan, nôn, buồn nôn, phân bạc màu. Thể tối cấp có suy gan và não gan.',
    'Cận lâm sàng (TT 23/2024)':
      '1. Định lượng AST, ALT. 2. Định lượng Bilirubin. 3. Xét nghiệm HBsAg, anti-HBc IgM.',
    'Tiêu chuẩn chẩn đoán chính xác':
      '1. Tiền sử tiếp xúc nguồn lây 4 tuần - 6 tháng. 2. AST, ALT tăng cao > 5 lần. 3. HBsAg (+) hoặc (-) và anti-HBc IgM (+).',
    'Chẩn đoán phân biệt': 'Viêm gan do vi rút khác (A, E, C), nhiễm độc, tự miễn, do rượu. Vàng da do Leptospira, sốt rét, tắc mật cơ học.',
    'Điều trị bằng thuốc (Nhóm, Hoạt chất, Liều Min, Liều Max)':
      'Thuốc kháng vi rút: (Cân nhắc trong thể tối cấp) Tenofovir hoặc Entecavir. Liều: Tenofovir 300mg/ngày; Entecavir 0.5mg/ngày.',
    'Điều trị can thiệp (TT 23/2024)': 'Nuôi dưỡng qua đường tĩnh mạch (nếu cần).',
    'Mã dịch vụ can thiệp': 'Đang cập nhật',
    'Cận lâm sàng theo dõi (TT 23/2024)': 'AST, ALT, Bilirubin, thời gian đông máu, tiểu cầu.',
    'Kiểm lại (Ngày)': '30',
    'Điều trị khác': 'Nghỉ ngơi tuyệt đối, hạn chế chất béo, kiêng rượu bia, thuốc bổ trợ gan.',
    'Dự phòng': 'Tiêm vắc xin sau sinh vòng 24h. An toàn tình dục, không dùng chung kim tiêm.',
    'Tiên lượng': '> 90% khỏi hoàn toàn; gần 10% chuyển mạn tính.',
  },
];

/** Độ rộng ô dữ liệu (cuộn ngang); chọn mức để xem đủ nội dung dài. */
const MOC_RONG_COT = [300, 400, 520, 640];
const RONG_COT_THAO_TAC = 168;

const HuongDanBoYTe = () => {
  const [columns, setColumns] = useState(COT_MAC_DINH);
  const [data, setData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [newColName, setNewColName] = useState('');
  const [sortAsc, setSortAsc] = useState(true);
  /** Chiều cao vùng bảng quản trị — cho ScrollView dọc trong khung ngang */
  const [chieuCaoVungBang, setChieuCaoVungBang] = useState(0);
  const [chiSoRongCot, setChiSoRongCot] = useState(1);
  const [viewMode, setViewMode] = useState('table');
  const [idDongXemIn, setIdDongXemIn] = useState(null);

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

  const rongCotDuLieu = MOC_RONG_COT[chiSoRongCot] ?? 400;
  const dongXemIn = useMemo(() => data.find((r) => r.id === idDongXemIn) || null, [data, idDongXemIn]);

  useEffect(() => {
    if (trangHienTai > tongSoTrang) setTrangHienTai(tongSoTrang);
  }, [tongSoTrang, trangHienTai]);

  useEffect(() => {
    setTrangHienTai(1);
  }, [tuKhoaTim, soDongMotTrang]);

  useEffect(() => {
    const taiDuLieu = async () => {
      try {
        const storedCols = await AsyncStorage.getItem('CDSS_COLS_HDBYT');
        const storedData = await AsyncStorage.getItem('CDSS_DATA_HDBYT');
        if (storedCols) setColumns(JSON.parse(storedCols));
        if (storedData) {
          setData(JSON.parse(storedData));
        } else {
          setData(DULIEU_MAU);
        }
      } catch (e) {
        console.error(e);
      }
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
    columns.forEach((col) => {
      newRow[col] = '';
    });
    luuHeThong([newRow, ...data]);
  };

  const handleAddColumn = () => {
    if (!newColName) return;
    const colUpper = newColName.trim();
    if (columns.includes(colUpper)) return alert('Cột đã tồn tại!');
    luuHeThong(data, [...columns, colUpper]);
    setNewColName('');
  };

  const handleCellChange = (id, col, val) => {
    const newData = data.map((row) => (row.id === id ? { ...row, [col]: val } : row));
    luuHeThong(newData);
  };

  const toggleSelectRow = (id) =>
    setSelectedRows((prev) => (prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]));

  const handleDeleteBulk = () => {
    if (selectedRows.length === 0) return alert('Chưa chọn dòng nào!');
    const newData = data.filter((row) => !selectedRows.includes(row.id));
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
      const exportData = data.map((row) => {
        const exportRow = {};
        columns.forEach((col) => {
          exportRow[col] = row[col] || '';
        });
        return exportRow;
      });
      const ws = XLSX.utils.json_to_sheet(exportData, { header: columns });
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'HD_BYT');
      XLSX.writeFile(wb, 'HuongDan_BoYTe_CDSS.xlsx');
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
      const importedData = XLSX.utils.sheet_to_json(ws, { defval: '' });

      if (importedData.length > 0) {
        const importedCols = Object.keys(importedData[0]).filter((k) => k !== 'id');
        const formattedData = importedData.map((row) => ({
          ...row,
          id: `${Date.now()}-${Math.random()}`,
        }));
        luuHeThong(formattedData, importedCols.length > 0 ? importedCols : columns);
        alert('Đã Import thành công hệ thống Hướng dẫn Bộ Y tế!');
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = null;
  };

  const renderBangQuanTri = () => (
    <View style={styles.layout_bang_quan_tri}>
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
              placeholder="Tìm theo từ khóa (ICD-10, tên bệnh, cột…)"
              placeholderTextColor={CD.text.muted}
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
            placeholderTextColor={CD.text.muted}
            {...Platform.select({ web: { outlineStyle: 'none' } })}
          />
          <TouchableOpacity style={styles.btn_gon_blue} onPress={handleAddColumn}>
            <Text style={styles.txt_btn_gon}>+ TRƯỜNG</Text>
          </TouchableOpacity>
          {Platform.OS === 'web' && (
            <>
              <input type="file" accept=".xlsx, .csv" onChange={handleImport} style={{ display: 'none' }} id="import-excel-byt" />
              <TouchableOpacity style={styles.btn_gon_orange} onPress={() => document.getElementById('import-excel-byt').click()}>
                <Text style={styles.txt_btn_gon}>📥 IMPORT</Text>
              </TouchableOpacity>
            </>
          )}
          <TouchableOpacity style={styles.btn_gon_green} onPress={handleExport}>
            <Text style={styles.txt_btn_gon}>📤 EXPORT</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.btn_gon_outline}
            onPress={() => setChiSoRongCot((i) => Math.max(0, i - 1))}
            disabled={chiSoRongCot <= 0}
          >
            <Text style={[styles.txt_btn_gon_outline, chiSoRongCot <= 0 && styles.txt_mo]}>◀ Cột</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.btn_gon_outline}
            onPress={() => setChiSoRongCot((i) => Math.min(MOC_RONG_COT.length - 1, i + 1))}
            disabled={chiSoRongCot >= MOC_RONG_COT.length - 1}
          >
            <Text style={[styles.txt_btn_gon_outline, chiSoRongCot >= MOC_RONG_COT.length - 1 && styles.txt_mo]}>Cột ▶</Text>
          </TouchableOpacity>
          <Text style={styles.nhan_rong_cot}>{rongCotDuLieu}px</Text>
        </ScrollView>
      </View>

      <View style={styles.phan_bang_quan_tri} onLayout={(e) => setChieuCaoVungBang(e.nativeEvent.layout.height)}>
        <View style={styles.khung_tim_bang_compact}>
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

        <ScrollView
          horizontal
          nestedScrollEnabled
          style={styles.khung_bang_quan_tri}
          contentContainerStyle={styles.khung_bang_quan_tri_content}
        >
          <View style={[styles.khoi_cot_bang_qt, chieuCaoVungBang > 0 && { height: chieuCaoVungBang }]}>
            <View style={styles.dong_tieu_de}>
              <View style={[styles.o_tieu_de, { width: 80 }]}>
                <Text style={styles.chu_o_tieu_de}>CHỌN</Text>
              </View>
              <View style={[styles.o_tieu_de, { width: RONG_COT_THAO_TAC }]}>
                <Text style={styles.chu_o_tieu_de}>THAO TÁC</Text>
              </View>
              {columns.map((col, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.o_tieu_de, { width: rongCotDuLieu }]}
                  onPress={col === 'Mã ICD10' ? handleSortABC : undefined}
                >
                  <Text style={styles.chu_o_tieu_de}>
                    {col} {col === 'Mã ICD10' ? (sortAsc ? ' 🔽' : ' 🔼') : ''}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <ScrollView nestedScrollEnabled style={styles.cuon_bang_doc_qt} keyboardShouldPersistTaps="handled">
              {duLieuTrang.map(({ row }) => (
                <View key={row.id} style={styles.dong_du_lieu}>
                  <View style={[styles.o_du_lieu, { width: 80, justifyContent: 'center', alignItems: 'center' }]}>
                    <TouchableOpacity
                      style={[styles.checkbox, selectedRows.includes(row.id) && styles.checkbox_active]}
                      onPress={() => toggleSelectRow(row.id)}
                    >
                      {selectedRows.includes(row.id) ? (
                        <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 22 }}>✓</Text>
                      ) : null}
                    </TouchableOpacity>
                  </View>

                  <View style={[styles.o_du_lieu, { width: RONG_COT_THAO_TAC, justifyContent: 'center', alignItems: 'center', gap: 6 }]}>
                    <TouchableOpacity style={styles.btn_icon_xem} onPress={() => { setIdDongXemIn(row.id); setViewMode('xem'); }}>
                      <Text style={styles.txt_btn_icon}>📋 Xem</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.btn_icon_in} onPress={() => { setIdDongXemIn(row.id); setViewMode('in'); }}>
                      <Text style={styles.txt_btn_icon}>🖨️ In</Text>
                    </TouchableOpacity>
                  </View>

                  {columns.map((col, colIndex) => (
                    <TextInput
                      key={colIndex}
                      style={[styles.o_du_lieu, { width: rongCotDuLieu }, col === 'Mã ICD10' && styles.o_ma_icd]}
                      multiline
                      scrollEnabled={false}
                      textAlignVertical="top"
                      value={String(row[col] || '')}
                      onChangeText={(val) => handleCellChange(row.id, col, val)}
                      outlineStyle="none"
                    />
                  ))}
                </View>
              ))}
            </ScrollView>
          </View>
        </ScrollView>
      </View>
    </View>
  );

  const veBang = () => {
    setViewMode('table');
    setIdDongXemIn(null);
  };

  return (
    <View style={styles.vung_goc}>
      {viewMode !== 'table' && dongXemIn ? (
        <SafeAreaView style={styles.vung_quan_tri_fill}>
          <View style={styles.thanh_xem_in}>
            <TouchableOpacity style={styles.btn_gon_outline} onPress={veBang} activeOpacity={0.85}>
              <Text style={styles.txt_btn_gon_outline}>⬅ Về bảng</Text>
            </TouchableOpacity>
            <Text style={styles.tieu_de_xem_in} numberOfLines={1}>
              Hướng dẫn BYT — {dongXemIn['Mã ICD10'] || '—'} · {dongXemIn['Tên bệnh'] || ''}
            </Text>
            {viewMode === 'in' ? (
              <TouchableOpacity
                style={styles.btn_gon_green}
                onPress={() => inHoacChiaSeHuongDanBytMotDong({ columns, noiDungDong: dongXemIn })}
                activeOpacity={0.85}
              >
                <Text style={styles.txt_btn_gon}>🖨️ In / PDF</Text>
              </TouchableOpacity>
            ) : null}
          </View>
          {viewMode === 'xem' ? (
            <ScrollView style={styles.cuon_xem} contentContainerStyle={styles.cuon_xem_pad} showsVerticalScrollIndicator>
              {columns.map((col) => (
                <View key={col} style={styles.khoi_xem_section}>
                  <Text style={styles.khoi_xem_tieu_de}>{col}</Text>
                  <Text style={styles.khoi_xem_body} selectable>
                    {String(dongXemIn[col] || '—')}
                  </Text>
                </View>
              ))}
            </ScrollView>
          ) : (
            <InHuongDanByt maICD={dongXemIn['Mã ICD10'] || ''} columns={columns} noiDungDong={dongXemIn} />
          )}
        </SafeAreaView>
      ) : (
        <View style={styles.vung_quan_tri_fill}>{renderBangQuanTri()}</View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  vung_goc: { flex: 1, backgroundColor: CD.bg.gradient_mobile, minHeight: 0 },
  vung_quan_tri_fill: { flex: 1, minHeight: 0 },
  layout_bang_quan_tri: { flex: 1, flexDirection: 'column', minHeight: 0 },
  thanh_cong_cu_mot_hang: {
    flexShrink: 0,
    backgroundColor: CD.bg.glass_card,
    borderBottomWidth: 1,
    borderBottomColor: CD.border.divider,
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
    borderColor: CD.border.glass_md,
    borderRadius: 8,
    backgroundColor: CD.bg.glass_input,
  },
  icon_tim: { fontSize: 14, marginRight: 4 },
  o_tim_tu_khoa: {
    flex: 1,
    minWidth: 120,
    fontSize: 14,
    fontFamily: CD.font.family,
    color: CD.text.primary,
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  nut_xoa_tim: { padding: 4 },
  chu_xoa_tim: { fontSize: 16, color: CD.text.muted, fontWeight: 'bold' },
  btn_gon_pink: { backgroundColor: '#D81B60', paddingVertical: 8, paddingHorizontal: 10, borderRadius: 8, justifyContent: 'center' },
  btn_gon_red: { backgroundColor: '#D32F2F', paddingVertical: 8, paddingHorizontal: 10, borderRadius: 8, justifyContent: 'center' },
  btn_gon_blue: { backgroundColor: CD.brand.mauDam, paddingVertical: 8, paddingHorizontal: 10, borderRadius: 8, justifyContent: 'center' },
  btn_gon_green: { backgroundColor: '#388E3C', paddingVertical: 8, paddingHorizontal: 10, borderRadius: 8, justifyContent: 'center' },
  btn_gon_orange: { backgroundColor: '#F57C00', paddingVertical: 8, paddingHorizontal: 10, borderRadius: 8, justifyContent: 'center' },
  txt_btn_gon: { color: '#FFF', fontSize: 13, fontWeight: '800', fontFamily: CD.font.family },
  btn_gon_outline: {
    backgroundColor: CD.bg.glass_card,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: CD.border.accent,
    justifyContent: 'center',
  },
  txt_btn_gon_outline: { color: CD.brand.mauDam, fontSize: 13, fontWeight: '800', fontFamily: CD.font.family },
  txt_mo: { opacity: 0.45 },
  nhan_rong_cot: { fontSize: 12, fontWeight: '700', color: CD.text.muted, fontFamily: CD.font.family, minWidth: 40 },
  o_nhap_ten_cot_gon: {
    width: 140,
    height: 36,
    borderWidth: 1,
    borderColor: CD.border.glass_md,
    borderRadius: 8,
    paddingHorizontal: 8,
    fontSize: 13,
    fontFamily: CD.font.family,
    color: CD.text.primary,
    backgroundColor: CD.bg.glass_input,
  },
  phan_bang_quan_tri: { flex: 1, minHeight: 0, marginHorizontal: 8, marginBottom: 8, marginTop: 0 },
  khung_tim_bang_compact: { paddingHorizontal: 2, marginBottom: 2 },
  khung_bang_quan_tri: {
    flex: 1,
    minHeight: 0,
    backgroundColor: CD.bg.glass_card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: CD.border.glass,
    ...Platform.select({ web: { boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }, default: { elevation: 2 } }),
  },
  khung_bang_quan_tri_content: { flexGrow: 1 },
  khoi_cot_bang_qt: { flexDirection: 'column', alignSelf: 'flex-start' },
  cuon_bang_doc_qt: { flex: 1 },
  dong_tieu_de: { flexDirection: 'row', backgroundColor: CD.brand.mauNhat, borderBottomWidth: 2, borderColor: CD.border.accent },
  o_tieu_de: { padding: 14, borderRightWidth: 1, borderColor: CD.border.divider, justifyContent: 'center', alignItems: 'center' },
  chu_o_tieu_de: { fontSize: 14, fontWeight: '800', color: CD.brand.mauDam, fontFamily: CD.font.family, textAlign: 'center' },
  dong_du_lieu: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderBottomWidth: 1,
    borderColor: CD.border.divider,
  },
  o_du_lieu: {
    padding: 12,
    borderRightWidth: 1,
    borderColor: CD.border.divider,
    fontSize: 15,
    fontFamily: CD.font.family,
    color: CD.text.primary,
    backgroundColor: CD.bg.glass_card,
    outlineStyle: 'none',
  },
  btn_icon_xem: { backgroundColor: CD.brand.mauDam, paddingVertical: 8, paddingHorizontal: 10, borderRadius: 8 },
  btn_icon_in: { backgroundColor: '#388E3C', paddingVertical: 8, paddingHorizontal: 10, borderRadius: 8 },
  txt_btn_icon: { color: '#FFF', fontSize: 12, fontWeight: '800', fontFamily: CD.font.family },
  thanh_xem_in: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: CD.border.divider,
    backgroundColor: CD.bg.glass_card,
  },
  tieu_de_xem_in: { flex: 1, fontSize: 14, fontWeight: '800', color: CD.text.primary, fontFamily: CD.font.family },
  cuon_xem: { flex: 1, minHeight: 0 },
  cuon_xem_pad: { padding: 14, paddingBottom: 28 },
  khoi_xem_section: {
    marginBottom: 14,
    padding: 12,
    borderRadius: 10,
    backgroundColor: CD.bg.glass_input,
    borderWidth: 1,
    borderColor: CD.border.glass_md,
  },
  khoi_xem_tieu_de: { fontSize: 13, fontWeight: '800', color: CD.brand.mauDam, marginBottom: 6, fontFamily: CD.font.family },
  khoi_xem_body: { fontSize: 14, color: CD.text.primary, lineHeight: 22, fontFamily: CD.font.family },
  o_ma_icd: { fontWeight: '800', color: CD.brand.mauDam },
  checkbox: {
    width: 32,
    height: 32,
    borderWidth: 2,
    borderColor: CD.border.glass_md,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkbox_active: { backgroundColor: '#D32F2F', borderColor: '#D32F2F' },
});

export default HuongDanBoYTe;
