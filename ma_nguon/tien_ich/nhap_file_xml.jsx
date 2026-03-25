/**
 * ============================================================
 * FILE: tien_ich/nhap_file_xml.jsx (PHIÊN BẢN ĐỒNG BỘ 130)
 * MỤC ĐÍCH: Nhập XML, quét lỗi tĩnh (kiem_tra_xml) & quét lỗi động (dong_co_giam_dinh).
 * CẬP NHẬT: Tối ưu hóa luồng đọc File (Giải quyết triệt để lỗi Chunk File/Tràn RAM).
 * FIX CÚ PHÁP: Cân bằng thẻ JSX, xử lý Unterminated string literal.
 * CHUYỂN GIAO: Chuyển quyền lưu kho cho tong_quan.jsx để tránh xung đột.
 * ============================================================
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { xuLyFileXML130 } from '../dich_vu/his_api';
import { chayBoMayGiamDinhV3 } from './dong_co_giam_dinh';
import { kiemTraDinhDangXML } from './kiem_tra_xml';

const TRANG_THAI_FILE = {
  HOP_LE: 'HOP_LE',
  TRUNG_LAP: 'TRUNG_LAP',
  THAY_THE: 'THAY_THE',
  TU_CHOI: 'TU_CHOI',
  LOI: 'LOI',
  CANH_BAO: 'CANH_BAO', 
};

const NhapFileXML = ({ onDuLieuSanSang }) => {
  const [dangXuLy, setDangXuLy] = useState(false);
  const [dangGuiDuLieu, setDangGuiDuLieu] = useState(false);
  const [thongBaoTienDo, setThongBaoTienDo] = useState('');
  const [danhSachFile, setDanhSachFile] = useState([]);
  const [lichSuGiamDinh, setLichSuGiamDinh] = useState([]);
  
  const [hienThiModal, setHienThiModal] = useState(false);
  const [fileChiTiet, setFileChiTiet] = useState(null);

  useEffect(() => {
    const taiLichSu = async () => {
      try {
        const stored = await AsyncStorage.getItem('CDSS_LICH_SU_XML');
        if (stored) setLichSuGiamDinh(JSON.parse(stored));
      } catch (err) { console.error('[NhapFileXML] Lỗi tải lịch sử:', err); }
    };
    taiLichSu();
  }, []);

  const processSingleFile = (file) => {
    return new Promise((resolve) => {
      if (file.size > 10 * 1024 * 1024) {
        resolve({ id: Math.random().toString(36), tenFile: file.name, ma_lk: 'LOI_DUNG_LUONG', trangThai: TRANG_THAI_FILE.LOI, lyDoLoi: 'File vượt quá 10MB, nguy cơ tràn bộ nhớ.' });
        return;
      }

      const reader = new FileReader();
      
      reader.onerror = () => {
        resolve({ id: Math.random().toString(36), tenFile: file.name, ma_lk: 'LOI', trangThai: TRANG_THAI_FILE.LOI, lyDoLoi: 'File bị hỏng hoặc lỗi phân mảnh (Chunk Error).' });
      };

      reader.onload = async (e) => {
        try {
          const rawXML = e.target.result;
          const ketQuaHoSo = xuLyFileXML130(rawXML);
          
          const arr = Array.isArray(ketQuaHoSo) ? ketQuaHoSo : [ketQuaHoSo];
          const hsDauTien = arr[0] || {};
          const xml1 = hsDauTien.xml1 || hsDauTien.XML1 || {};
          
          const maLK = xml1.MA_LK || 'KHONG_XAC_DINH';
          const maBN = xml1.MA_BN || 'KHONG_XAC_DINH';
          const hoSoCu = lichSuGiamDinh.find((hs) => hs.ma_lk === maLK);

          let trangThai = hoSoCu ? TRANG_THAI_FILE.TRUNG_LAP : TRANG_THAI_FILE.HOP_LE;
          let dsLoi = [];
          let lyDoLoi = '';
          let chiTietLoiCDSS = []; 

          if (maLK === 'KHONG_XAC_DINH') {
            trangThai = TRANG_THAI_FILE.LOI;
            lyDoLoi = 'Không tìm thấy thẻ <MA_LK> (Mã liên kết).';
          } else if (arr.length > 0) {
            const ketQuaValidate = kiemTraDinhDangXML(hsDauTien);
            const rawChiTietLoi = await chayBoMayGiamDinhV3(hsDauTien);
            
            // Bổ sung MA_BN vào dữ liệu lỗi để kết xuất báo cáo
            chiTietLoiCDSS = rawChiTietLoi.map(loi => ({
              ...loi,
              ma_bn: maBN
            }));

            if (!ketQuaValidate.hop_le || chiTietLoiCDSS.length > 0) {
              if (trangThai === TRANG_THAI_FILE.HOP_LE) trangThai = TRANG_THAI_FILE.CANH_BAO;
              dsLoi = [
                ...ketQuaValidate.danh_sach_loi,
                // Hiển thị thêm MA_BN và DIEU_KIEN trên chuỗi cảnh báo UI
                ...chiTietLoiCDSS.map(l => `[${l.truong_loi || l.phan_he}] ${l.canh_bao} (Mã BN: ${l.ma_bn} - ĐK: ${l.dieu_kien || 'N/A'})`)
              ];
            }
          }

          resolve({
            id: Math.random().toString(36),
            tenFile: file.name,
            kichThuoc: (file.size / 1024).toFixed(1) + ' KB',
            ma_lk: maLK,
            duLieu: arr.map(hs => ({ ...hs, _ten_file: file.name, _ds_loi: dsLoi })), 
            ngayGiamDinhCu: hoSoCu?.ngay_giam_dinh || null,
            trangThai, 
            lyDoLoi, 
            dsLoi,
            chiTietLoi: chiTietLoiCDSS, 
            tomTatData: { 
              hoTen: xml1.HO_TEN || 'N/A',
              maBN: maBN,
              tienTrinh: xml1.NGAY_VAO && xml1.NGAY_RA ? `${xml1.NGAY_VAO} -> ${xml1.NGAY_RA}` : 'N/A',
              xml2: hsDauTien.xml2?.length || hsDauTien.XML2?.length || 0,
              xml3: hsDauTien.xml3?.length || hsDauTien.XML3?.length || 0,
              xml4: hsDauTien.xml4?.length || hsDauTien.XML4?.length || 0,
              xml5: hsDauTien.xml5?.length || hsDauTien.XML5?.length || 0,
            }
          });
        } catch (err) {
          resolve({ id: Math.random().toString(36), tenFile: file.name, ma_lk: 'LOI', trangThai: TRANG_THAI_FILE.LOI, lyDoLoi: `Lỗi parser: ${err.message}` });
        }
      };
      reader.readAsText(file, 'UTF-8');
    });
  };

  const xuLyChonFileWeb = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setDangXuLy(true);
    setThongBaoTienDo('Đang bóc tách & quét luật QĐ130...');

    try {
      const mangFileHopLe = Array.from(files).filter(f => f.name.toLowerCase().endsWith('.xml'));
      
      const CHUNK_SIZE = 3; 
      let ketQuaTong = [];

      for (let i = 0; i < mangFileHopLe.length; i += CHUNK_SIZE) {
        setThongBaoTienDo(`Đang giám định: ${Math.min(i + CHUNK_SIZE, mangFileHopLe.length)} / ${mangFileHopLe.length}...`);
        
        const chunk = mangFileHopLe.slice(i, i + CHUNK_SIZE);
        const chunkResults = await Promise.all(chunk.map(file => processSingleFile(file)));
        
        ketQuaTong = [...ketQuaTong, ...chunkResults];
        
        await new Promise(resolve => setTimeout(resolve, 150)); 
      }
      setDanhSachFile(ketQuaTong);
    } finally {
      setDangXuLy(false);
      setThongBaoTienDo('');
      if (event.target) event.target.value = null; 
    }
  };

  const bamChonFile = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xml';
    input.multiple = true;
    input.onchange = (e) => xuLyChonFileWeb(e);
    input.click();
  };

  const capNhatTrangThai = (id, trangThaiMoi) => {
    setDanhSachFile(prev => prev.map((f) => (f.id === id ? { ...f, trangThai: trangThaiMoi } : f)));
  };

  const loaiBoFile = (id) => {
    setDanhSachFile(prev => prev.filter(f => f.id !== id));
  };

  const moChiTietFile = (file) => {
    setFileChiTiet(file);
    setHienThiModal(true);
  };

  const xuLyGuiDuLieu = async () => {
    const dsDuocDuyet = danhSachFile.filter(f => 
      [TRANG_THAI_FILE.HOP_LE, TRANG_THAI_FILE.THAY_THE, TRANG_THAI_FILE.CANH_BAO].includes(f.trangThai)
    );

    if (dsDuocDuyet.length === 0) {
      const coTrungLap = danhSachFile.some(f => f.trangThai === TRANG_THAI_FILE.TRUNG_LAP);
      if (coTrungLap) {
        return Alert.alert('Hồ sơ trùng lặp', 'Hồ sơ này đã được giám định trước đây. Bấm nút "Ghi đè" bên cạnh hồ sơ để cập nhật lại.');
      }
      return Alert.alert('Thông báo', 'Không có hồ sơ hợp lệ để chuyển đến bàn làm việc.');
    }

    setDangGuiDuLieu(true);
    try {
      const thoiGian = new Date().toLocaleString('vi-VN');
      let lichSuMoi = [...lichSuGiamDinh];
      dsDuocDuyet.forEach(f => {
        lichSuMoi = lichSuMoi.filter(hs => hs.ma_lk !== f.ma_lk);
        lichSuMoi.push({ ma_lk: f.ma_lk, tenFile: f.tenFile, ngay_giam_dinh: thoiGian });
      });
      await AsyncStorage.setItem('CDSS_LICH_SU_XML', JSON.stringify(lichSuMoi));

      const tatCaDuLieu = dsDuocDuyet.flatMap(f => {
        return f.duLieu.map(hoSo => ({
          ...hoSo,
          ma_lk: hoSo.xml1?.MA_LK,
          ket_qua_giam_dinh: f.chiTietLoi || [] 
        }));
      });
      
      // TRUYỀN DỮ LIỆU ĐÃ DUYỆT LÊN TỔNG QUAN, KHÔNG TỰ LƯU KHO
      if (onDuLieuSanSang) {
          onDuLieuSanSang(tatCaDuLieu); 
      }

      setDanhSachFile([]); 
    } catch (err) {
      Alert.alert('Lỗi xử lý', err.message);
    } finally {
      setDangGuiDuLieu(false);
    }
  };

  return (
    <View style={{ flex: 1, width: '100%' }}>
      {danhSachFile.length > 0 ? (
        <View style={styles.khung_danh_sach}>
          <View style={styles.thanh_tieu_de_ds}>
            <View>
              <Text style={styles.chu_tieu_de_ds}>📋 KẾT QUẢ GIÁM ĐỊNH XML ({danhSachFile.length} FILE)</Text>
              <Text style={styles.tom_tat}>Đối soát cấu trúc QĐ 130 & Quy tắc y khoa.</Text>
            </View>
            <TouchableOpacity style={styles.nut_huy} onPress={() => setDanhSachFile([])}>
              <Text style={styles.chu_nut_huy}>🔄 Làm mới</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.nut_giam_dinh_all} onPress={xuLyGuiDuLieu} disabled={dangGuiDuLieu}>
            <Text style={styles.chu_nut_all}>{dangGuiDuLieu ? 'Đang chuyển dữ liệu...' : '🚀 CHUYỂN DỮ LIỆU ĐỂ SỬA LỖI'}</Text>
          </TouchableOpacity>

          <ScrollView style={styles.vung_cuon_ds}>
            {danhSachFile.map((file, index) => (
              <View 
                key={file.id} 
                style={[
                  styles.dong_file, 
                  file.trangThai === TRANG_THAI_FILE.TRUNG_LAP && {backgroundColor: '#FFF8E1'}, 
                  file.trangThai === TRANG_THAI_FILE.LOI && {backgroundColor: '#FFEBEE'} 
                ]}
              >
                <View style={styles.thong_tin_file}>
                  <Text style={styles.stt_file}>{index + 1}.</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.ten_file}>{file.tenFile}</Text>
                    <Text style={styles.ma_lk_file}>Mã LK: {file.ma_lk} | {file.kichThuoc}</Text>
                    
                    {file.dsLoi && file.dsLoi.length > 0 && (
                      <View style={styles.khung_loi_chi_tiet}>
                        {file.dsLoi.slice(0, 3).map((loi, i) => (
                          <Text key={i} style={styles.chu_loi_nho}>- {loi}</Text>
                        ))}
                        {file.dsLoi.length > 3 && (
                          <Text style={styles.chu_loi_nho}>... và {file.dsLoi.length - 3} lỗi khác</Text>
                        )}
                      </View>
                    )}
                    
                    {file.trangThai === TRANG_THAI_FILE.TRUNG_LAP && (
                      <Text style={styles.chu_canh_bao}>⚠ Hồ sơ này đã được duyệt trước đây.</Text>
                    )}
                  </View>
                </View>

                <View style={styles.cot_phai}>
                  <Text style={[
                    styles.txt_tag, 
                    file.trangThai === TRANG_THAI_FILE.HOP_LE ? {color: '#4CAF50'} :
                    file.trangThai === TRANG_THAI_FILE.CANH_BAO ? {color: '#FF9800'} : {color: '#F44336'}
                  ]}>
                    {file.trangThai === TRANG_THAI_FILE.CANH_BAO ? 'CÓ LỖI' : file.trangThai}
                  </Text>
                  
                  <TouchableOpacity style={styles.btn_chi_tiet} onPress={() => moChiTietFile(file)}>
                    <Text style={styles.txt_btn_chi_tiet}>🔍 Xem nhanh</Text>
                  </TouchableOpacity>

                  {file.trangThai === TRANG_THAI_FILE.TRUNG_LAP && (
                    <TouchableOpacity style={styles.btn_thay_the} onPress={() => capNhatTrangThai(file.id, TRANG_THAI_FILE.THAY_THE)}>
                        <Text style={styles.txt_btn_nho}>Ghi đè</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity style={styles.btn_xoa} onPress={() => loaiBoFile(file.id)}>
                    <Text style={styles.txt_btn_xoa}>✖ Bỏ qua</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      ) : (
        <View style={styles.khung_chua_rong}>
          {Platform.OS === 'web' && (
             <input 
                type="file" 
                accept=".xml" 
                multiple={true}
                onChange={xuLyChonFileWeb} 
                style={{ display: 'none' }} 
                id="import-xml-dashboard" 
             />
          )}

          {dangXuLy && (
             <View style={styles.floating_progress}>
                <ActivityIndicator color="#1976D2" size="large" />
                <Text style={styles.chu_tien_do_khong_lo}>{thongBaoTienDo}</Text>
             </View>
          )}

          <TouchableOpacity 
             style={styles.nut_import_mini} 
             onPress={() => Platform.OS === 'web' ? document.getElementById('import-xml-dashboard').click() : bamChonFile()} 
             disabled={dangXuLy}
          >
            <Text style={styles.chu_nut_mini}>📂 CHỌN HỒ SƠ XML ĐỂ GIÁM ĐỊNH</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* MODAL: XEM CHI TIẾT FILE */}
      {fileChiTiet && (
        <Modal 
          visible={hienThiModal} 
          animationType="slide" 
          transparent={true} 
          onRequestClose={() => setHienThiModal(false)}
        >
          <View style={styles.modal_overlay}>
            <View style={styles.modal_container}>
              <View style={styles.modal_header}>
                <Text style={styles.modal_title}>Chi tiết hồ sơ: {fileChiTiet.tenFile}</Text>
                <TouchableOpacity onPress={() => setHienThiModal(false)} style={styles.modal_btn_close}>
                  <Text style={styles.modal_txt_close}>Đóng</Text>
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.modal_body}>
                <View style={styles.modal_section}>
                  <Text style={styles.modal_section_title}>1. Thông tin Hành chính (XML1)</Text>
                  <Text style={styles.modal_text}>- Bệnh nhân: <Text style={{fontWeight:'bold'}}>{fileChiTiet.tomTatData?.hoTen}</Text></Text>
                  <Text style={styles.modal_text}>- Mã BN: {fileChiTiet.tomTatData?.maBN}</Text>
                  <Text style={styles.modal_text}>- Mã liên kết: {fileChiTiet.ma_lk}</Text>
                  <Text style={styles.modal_text}>- Thời gian ĐT: {fileChiTiet.tomTatData?.tienTrinh}</Text>
                </View>

                <View style={styles.modal_section}>
                  <Text style={styles.modal_section_title}>2. Tóm tắt Dữ liệu Lâm sàng</Text>
                  <Text style={styles.modal_text}>- XML2 (Thuốc): {fileChiTiet.tomTatData?.xml2} mã</Text>
                  <Text style={styles.modal_text}>- XML3 (Cận lâm sàng): {fileChiTiet.tomTatData?.xml3} mã</Text>
                  <Text style={styles.modal_text}>- XML4 (Dịch vụ kỹ thuật): {fileChiTiet.tomTatData?.xml4} mã</Text>
                  <Text style={styles.modal_text}>- XML5 (Vật tư y tế): {fileChiTiet.tomTatData?.xml5} mã</Text>
                </View>

                <View style={[styles.modal_section, {borderBottomWidth: 0}]}>
                  <Text style={[styles.modal_section_title, {color: '#D81B60'}]}>
                    3. Danh sách Cảnh báo & Lỗi ({fileChiTiet.dsLoi?.length || 0})
                  </Text>
                  {fileChiTiet.dsLoi && fileChiTiet.dsLoi.length > 0 ? (
                    fileChiTiet.dsLoi.map((loi, i) => (
                      <View key={i} style={styles.modal_error_item}>
                        <Text style={styles.modal_error_text}>{i + 1}. {loi}</Text>
                      </View>
                    ))
                  ) : (
                    <Text style={{color: '#4CAF50', fontWeight: 'bold', fontSize: 16}}>
                      Hồ sơ hợp lệ, không có lỗi cấu trúc hoặc vượt định mức.
                    </Text>
                  )}
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  khung_chua_rong: { flex: 1, position: 'relative', justifyContent: 'center' },
  floating_progress: { position: 'absolute', top: -80, right: 20, backgroundColor: '#E3F2FD', padding: 20, borderRadius: 10, flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderColor: '#1976D2', elevation: 5, zIndex: 999 },
  chu_tien_do_khong_lo: { fontSize: 26, color: '#1976D2', fontWeight: 'bold', marginLeft: 15, fontFamily: 'Arial' },
  nut_import_mini: { backgroundColor: '#1976D2', paddingVertical: 18, paddingHorizontal: 25, borderRadius: 50, alignSelf: 'center', elevation: 4, borderWidth: 2, borderColor: '#0D47A1', width: '33%', alignItems: 'center' },
  chu_nut_mini: { color: '#FFF', fontWeight: 'bold', fontSize: 18, fontFamily: 'Arial', textAlign: 'center' },
  khung_danh_sach: { width: '95%', alignSelf: 'center', backgroundColor: '#FFF', borderRadius: 15, padding: 25, elevation: 5, marginTop: 20 },
  thanh_tieu_de_ds: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 2, borderColor: '#FCE4EC', paddingBottom: 15, marginBottom: 20 },
  chu_tieu_de_ds: { fontSize: 24, fontWeight: 'bold', color: '#D81B60', fontFamily: 'Arial' },
  tom_tat: { fontSize: 18, color: '#666', marginTop: 5 },
  nut_huy: { backgroundColor: '#F5F5F5', padding: 12, borderRadius: 8 },
  chu_nut_huy: { fontSize: 16, color: '#333', fontWeight: 'bold' },
  nut_giam_dinh_all: { backgroundColor: '#4CAF50', padding: 20, borderRadius: 12, alignItems: 'center', marginBottom: 20, elevation: 3 },
  chu_nut_all: { fontSize: 22, color: '#FFF', fontWeight: 'bold', letterSpacing: 1 },
  vung_cuon_ds: { maxHeight: 500 },
  dong_file: { flexDirection: 'row', padding: 20, borderBottomWidth: 1, borderColor: '#EEE', alignItems: 'center' },
  thong_tin_file: { flex: 1, flexDirection: 'row', gap: 15 },
  stt_file: { fontSize: 22, fontWeight: 'bold', color: '#1976D2', minWidth: 40 },
  ten_file: { fontSize: 20, color: '#333', fontWeight: 'bold' },
  ma_lk_file: { fontSize: 16, color: '#888', marginTop: 4 },
  khung_loi_chi_tiet: { marginTop: 10, backgroundColor: '#FFF3E0', padding: 10, borderRadius: 8 },
  chu_loi_nho: { fontSize: 16, color: '#E65100', fontFamily: 'Arial', marginBottom: 2 },
  chu_canh_bao: { color: '#FF9800', fontSize: 16, fontWeight: 'bold', marginTop: 5 },
  cot_phai: { alignItems: 'flex-end', minWidth: 120, justifyContent: 'center' },
  txt_tag: { fontSize: 18, fontWeight: 'bold' },
  btn_chi_tiet: { backgroundColor: '#E3F2FD', padding: 8, borderRadius: 6, marginTop: 10, minWidth: 100, alignItems: 'center', borderWidth: 1, borderColor: '#90CAF9' },
  txt_btn_chi_tiet: { color: '#1976D2', fontWeight: 'bold' },
  btn_thay_the: { backgroundColor: '#1976D2', padding: 8, borderRadius: 6, marginTop: 10, minWidth: 100, alignItems: 'center' },
  btn_xoa: { backgroundColor: '#FAFAFA', padding: 8, borderRadius: 6, marginTop: 10, minWidth: 100, alignItems: 'center', borderWidth: 1, borderColor: '#DDD' },
  txt_btn_nho: { color: '#FFF', fontWeight: 'bold' },
  txt_btn_xoa: { color: '#555', fontWeight: 'bold' },
  modal_overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modal_container: { width: '80%', maxWidth: 800, backgroundColor: '#FFF', borderRadius: 12, elevation: 10, overflow: 'hidden', maxHeight: '90%' },
  modal_header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FCE4EC', padding: 20, borderBottomWidth: 1, borderColor: '#F8BBD0' },
  modal_title: { fontSize: 22, fontWeight: 'bold', color: '#D81B60' },
  modal_btn_close: { backgroundColor: '#FFF', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 6, borderWidth: 1, borderColor: '#D81B60' },
  modal_txt_close: { fontSize: 16, fontWeight: 'bold', color: '#D81B60' },
  modal_body: { padding: 20 },
  modal_section: { marginBottom: 20, paddingBottom: 15, borderBottomWidth: 1, borderColor: '#EEE' },
  modal_section_title: { fontSize: 18, fontWeight: 'bold', color: '#1976D2', marginBottom: 10 },
  modal_text: { fontSize: 16, color: '#333', marginBottom: 6, fontFamily: 'Arial' },
  modal_error_item: { backgroundColor: '#FFEBEE', padding: 10, borderRadius: 6, marginBottom: 8, borderLeftWidth: 4, borderColor: '#D32F2F' },
  modal_error_text: { fontSize: 15, color: '#C62828' }
});

export default NhapFileXML;