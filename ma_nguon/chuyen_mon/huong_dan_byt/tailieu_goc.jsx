/**
 * ============================================================
 * FILE: chuyen_mon/huong_dan_byt/tailieu_goc.jsx
 * MỤC ĐÍCH: Thư viện tài liệu gốc đính kèm theo mã ICD-10
 * TIÊU CHUẨN: JCI Standard MCI.3 - Quản lý tài liệu lâm sàng
 * BẢN FIX: Khử lỗi undefined Theme (dam/trang) và shadow trên Web
 * ============================================================
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// ============================================================
// HẰNG SỐ
// ============================================================
const DU_LIEU_MAC_DINH = (maICD) => [
  {
    id: '1',
    ten: `Quyết định 3310/QĐ-BYT — Hướng dẫn chẩn đoán & điều trị ${maICD}`,
    loai: 'link',
    url: 'https://thuvienphapluat.vn/van-ban/the-thao-y-te/quyet-dinh-3310-qd-byt-2022',
  },
  {
    id: '2',
    ten: 'Thông tư 23/2024/TT-BYT — Danh mục dịch vụ kỹ thuật',
    loai: 'link',
    url: 'https://thuvienphapluat.vn/van-ban/the-thao-y-te/thong-tu-23-2024-tt-byt',
  },
  {
    id: '3',
    ten: 'Phác đồ mẫu Bộ Y tế (chưa đính kèm PDF)',
    loai: 'pdf',
    url: '',
  },
];

// Kiểm tra URL hợp lệ
const laURLHopLe = (url) => {
  try {
    const u = new URL(url);
    return u.protocol === 'http:' || u.protocol === 'https:' || u.protocol === 'blob:';
  } catch {
    return false;
  }
};

// ============================================================
// COMPONENT CHÍNH
// ============================================================
/**
 * @param {'doc_lap' | 'nhung'} [props.variant] — `nhung`: bố cục gọn, không padding ngoài (dùng trong panel phải Hướng dẫn BYT).
 */
const TaiLieuGoc = ({ maICD, danhSachData, variant = 'doc_lap' }) => {
  const laNhung = variant === 'nhung';
  const duLieu = (danhSachData || []).find(item => item['Mã ICD10'] === maICD) || {};

  const [danhSachTaiLieu, setDanhSachTaiLieu] = useState([]);
  const [taiLieuDangXem, setTaiLieuDangXem] = useState(null);
  const [dangTai, setDangTai] = useState(true);

  const [tenLinkMoi, setTenLinkMoi] = useState('');
  const [linkMoi, setLinkMoi] = useState('');

  // 1. TẢI THƯ VIỆN từ AsyncStorage theo mã ICD
  useEffect(() => {
    if (!maICD) return;
    setDangTai(true);
    setTaiLieuDangXem(null); 

    const taiThuVien = async () => {
      try {
        const stored = await AsyncStorage.getItem(`CDSS_THU_VIEN_${maICD}`);
        setDanhSachTaiLieu(stored ? JSON.parse(stored) : DU_LIEU_MAC_DINH(maICD));
      } catch (err) {
        console.error('[TaiLieuGoc] Lỗi tải thư viện:', err);
        setDanhSachTaiLieu(DU_LIEU_MAC_DINH(maICD));
      } finally {
        setDangTai(false);
      }
    };

    taiThuVien();
  }, [maICD]);

  // 2. LƯU cập nhật vào AsyncStorage
  const luuThuVien = async (dsMoi) => {
    setDanhSachTaiLieu(dsMoi);
    try {
      await AsyncStorage.setItem(`CDSS_THU_VIEN_${maICD}`, JSON.stringify(dsMoi));
    } catch (err) {
      console.error('[TaiLieuGoc] Lỗi lưu thư viện:', err);
    }
  };

  // 3. THÊM LINK WEB
  const handleThemLink = () => {
    const ten = tenLinkMoi.trim();
    const url = linkMoi.trim();

    if (!ten) return Alert.alert('Thiếu thông tin', 'Vui lòng nhập tên tài liệu.');
    if (!url) return Alert.alert('Thiếu thông tin', 'Vui lòng nhập đường dẫn URL.');
    if (!laURLHopLe(url)) return Alert.alert('URL không hợp lệ', 'URL phải bắt đầu bằng https://');

    const moi = { id: Date.now().toString(), ten, loai: 'link', url };
    luuThuVien([moi, ...danhSachTaiLieu]);
    setTenLinkMoi('');
    setLinkMoi('');
  };

  // 4. UPLOAD PDF 
  const handleUploadPDF = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      Alert.alert('Sai định dạng', 'Chỉ chấp nhận file PDF.');
      return;
    }
    const fileURL = URL.createObjectURL(file);
    const moi = { id: Date.now().toString(), ten: file.name, loai: 'pdf', url: fileURL };
    luuThuVien([moi, ...danhSachTaiLieu]);
    e.target.value = null; 
  };

  // 5. XÓA TÀI LIỆU 
  const handleXoa = (item) => {
    if (confirm(`Xóa tài liệu "${item.ten}" khỏi thư viện?`)) {
        if (item.url && item.url.startsWith('blob:')) {
            try { URL.revokeObjectURL(item.url); } catch {}
        }
        const dsMoi = danhSachTaiLieu.filter(tl => tl.id !== item.id);
        luuThuVien(dsMoi);
        if (taiLieuDangXem?.id === item.id) setTaiLieuDangXem(null);
    }
  };

  // 6. MỞ TÀI LIỆU NGOÀI (new tab)
  const handleMoNgoai = (url) => {
    if (!url) return Alert.alert('Chưa có file', 'Tài liệu này chưa được đính kèm URL.');
    if (Platform.OS === 'web') {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      Alert.alert('Thông báo', 'Chức năng mở tab ngoài chỉ hỗ trợ trên Web.');
    }
  };

  // BADGE loại tài liệu
  const renderBadgeLoai = (loai) => {
    const mau = loai === 'pdf' ? '#D81B60' : '#1976D2';
    return (
      <View style={[styles.badge_loai, { backgroundColor: mau }]}>
        <Text style={styles.txt_badge}>{loai === 'pdf' ? 'PDF' : 'WEB'}</Text>
      </View>
    );
  };

  // GUARD: Không có mã ICD
  if (!maICD) {
    return (
      <SafeAreaView style={styles.vung_an_toan}>
        <View style={styles.man_hinh_cho}>
          <Text style={styles.icon_cho}>⚠️</Text>
          <Text style={styles.txt_cho}>Không có mã ICD-10 được truyền vào.</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ----------------------------------------------------------
  // RENDER CHÍNH
  // ----------------------------------------------------------
  return (
    <SafeAreaView style={[styles.vung_an_toan, laNhung && styles.vung_an_toan_nhung]}>
      <View style={[styles.khung_giao_dien, laNhung && styles.khung_giao_dien_nhung]}>

        {/* PANEL TRÁI: DANH SÁCH THƯ VIỆN */}
        <View style={[styles.panel_trai, laNhung && styles.panel_trai_nhung]}>
          <Text style={styles.tieu_de_panel}>📋 THƯ VIỆN TÀI LIỆU (Mã: {maICD})</Text>
          <Text style={styles.ten_benh_phu}>{duLieu['Tên bệnh'] || 'Chưa cập nhật tên bệnh'}</Text>
          <Text style={styles.dem_tai_lieu}>{danhSachTaiLieu.length} tài liệu đính kèm</Text>

          {/* Form thêm Link */}
          <View style={styles.khung_them_moi}>
            <Text style={styles.nhan_input}>🔗 Đính kèm Link Web:</Text>
            <TextInput
              style={styles.o_nhap}
              placeholder="Tên tài liệu (VD: QĐ 3310/QĐ-BYT)..."
              value={tenLinkMoi}
              onChangeText={setTenLinkMoi}
              placeholderTextColor="#999"
              outlineStyle="none"
            />
            <TextInput
              style={styles.o_nhap}
              placeholder="https://thuvienphapluat.vn/..."
              value={linkMoi}
              onChangeText={setLinkMoi}
              autoCapitalize="none"
              keyboardType="url"
              placeholderTextColor="#999"
              outlineStyle="none"
            />
            <TouchableOpacity style={styles.btn_them} onPress={handleThemLink}>
              <Text style={styles.txt_btn}>+ THÊM LINK</Text>
            </TouchableOpacity>

            <View style={styles.duong_ke} />

            {/* Upload PDF (chỉ Web) */}
            <Text style={styles.nhan_input}>📄 Đính kèm File PDF (QĐ, TT):</Text>
            {Platform.OS === 'web' ? (
              <>
                <input
                  type="file"
                  accept="application/pdf"
                  id={`upload-pdf-${maICD}`}
                  style={{ display: 'none' }}
                  onChange={handleUploadPDF}
                />
                <TouchableOpacity
                  style={styles.btn_upload}
                  onPress={() => document.getElementById(`upload-pdf-${maICD}`).click()}
                >
                  <Text style={styles.txt_btn}>📤 TẢI LÊN FILE PDF</Text>
                </TouchableOpacity>
              </>
            ) : (
              <Text style={styles.txt_chi_web}>(Chức năng upload chỉ hỗ trợ trên Web)</Text>
            )}
          </View>

          {/* Danh sách tài liệu */}
          {dangTai ? (
            <ActivityIndicator color="#1976D2" size="large" style={{ marginTop: 30 }} />
          ) : (
            <ScrollView style={styles.danh_sach_tai_lieu}>
              {danhSachTaiLieu.length === 0 ? (
                <Text style={styles.txt_trong_ds}>Chưa có tài liệu nào. Hãy thêm Link hoặc PDF.</Text>
              ) : (
                danhSachTaiLieu.map((tl) => {
                  const dangChon = taiLieuDangXem?.id === tl.id;
                  return (
                    <TouchableOpacity
                      key={tl.id}
                      style={[styles.the_tai_lieu, dangChon && styles.the_tai_lieu_active]}
                      onPress={() => setTaiLieuDangXem(tl)}
                    >
                      {renderBadgeLoai(tl.loai)}
                      <Text style={[styles.ten_tai_lieu, dangChon && styles.ten_tai_lieu_active]} numberOfLines={2}>
                        {tl.ten}
                      </Text>
                      <TouchableOpacity onPress={() => handleXoa(tl)} style={styles.btn_xoa} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                        <Text style={styles.txt_xoa}>✕</Text>
                      </TouchableOpacity>
                    </TouchableOpacity>
                  );
                })
              )}
            </ScrollView>
          )}
        </View>

        {/* PANEL PHẢI: TRÌNH XEM TÀI LIỆU (VIEWER) */}
        <View style={[styles.panel_phai, laNhung && styles.panel_phai_nhung]}>
          {taiLieuDangXem ? (
            <View style={styles.khung_viewer}>
              <View style={styles.header_viewer}>
                <Text style={styles.tieu_de_viewer} numberOfLines={1}>📖 {taiLieuDangXem.ten}</Text>
                <TouchableOpacity onPress={() => handleMoNgoai(taiLieuDangXem.url)} style={styles.btn_mo_rong}>
                  <Text style={styles.txt_btn_mo_rong}>Mở tab mới ↗</Text>
                </TouchableOpacity>
              </View>

              {Platform.OS === 'web' && taiLieuDangXem.url ? (
                <iframe
                  src={taiLieuDangXem.url}
                  style={{ width: '100%', height: '100%', border: 'none', backgroundColor: '#FFF' }}
                  title={taiLieuDangXem.ten}
                />
              ) : (
                <View style={styles.bao_loi_viewer}>
                  {taiLieuDangXem.url ? (
                    <>
                      <Text style={styles.txt_bao_loi}>Trình xem inline không hỗ trợ trên thiết bị này.</Text>
                      <TouchableOpacity style={styles.btn_mo_ngoai_fallback} onPress={() => handleMoNgoai(taiLieuDangXem.url)}>
                        <Text style={styles.txt_mo_ngoai_fallback}>Mở bằng trình duyệt ngoài ↗</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <Text style={styles.txt_bao_loi}>Tài liệu này chưa được đính kèm URL. Hãy upload PDF hoặc cập nhật link.</Text>
                  )}
                </View>
              )}
            </View>
          ) : (
            <View style={styles.man_hinh_cho}>
              <Text style={styles.icon_cho}>📚</Text>
              <Text style={styles.txt_cho}>Chọn một tài liệu từ danh sách bên trái để xem nội dung.</Text>
            </View>
          )}
        </View>

      </View>
    </SafeAreaView>
  );
};

// ============================================================
// STYLES (ĐÃ KHỬ LỖI THEME VÀ SHADOW)
// ============================================================
const styles = StyleSheet.create({
  vung_an_toan: { flex: 1, backgroundColor: '#EFEFEF', padding: 20 },
  vung_an_toan_nhung: { padding: 0, backgroundColor: 'transparent' },
  khung_giao_dien: { flex: 1, flexDirection: 'row', gap: 20 },
  khung_giao_dien_nhung: { gap: 12 },

  panel_trai: {
    width: 460,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    ...Platform.select({ web: { boxShadow: '0px 4px 10px rgba(0,0,0,0.1)' }, android: { elevation: 4 } }),
  },
  panel_trai_nhung: {
    width: undefined,
    flex: 0.38,
    minWidth: 220,
    maxWidth: 340,
    padding: 12,
  },
  tieu_de_panel: { fontFamily: 'Arial', fontSize: 24, fontWeight: 'bold', color: '#1976D2', marginBottom: 4 },
  ten_benh_phu: { fontFamily: 'Arial', fontSize: 20, color: '#666', fontStyle: 'italic', marginBottom: 4 },
  dem_tai_lieu: { fontFamily: 'Arial', fontSize: 18, color: '#D81B60', fontWeight: 'bold', marginBottom: 16 },

  khung_them_moi: { backgroundColor: '#FAFAFA', padding: 15, borderRadius: 10, marginBottom: 16, borderWidth: 1, borderColor: '#EEE' },
  nhan_input: { fontFamily: 'Arial', fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  o_nhap: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#CCC', borderRadius: 8, padding: 12, fontSize: 18, fontFamily: 'Arial', color: '#333', marginBottom: 10 },
  btn_them: { backgroundColor: '#1976D2', padding: 12, borderRadius: 8, alignItems: 'center' },
  btn_upload: { backgroundColor: '#D81B60', padding: 12, borderRadius: 8, alignItems: 'center' },
  txt_btn: { fontFamily: 'Arial', fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' },
  duong_ke: { height: 1, backgroundColor: '#EEE', marginVertical: 14 },
  txt_chi_web: { fontFamily: 'Arial', fontSize: 18, color: '#999', fontStyle: 'italic' },

  danh_sach_tai_lieu: { flex: 1 },
  txt_trong_ds: { fontFamily: 'Arial', fontSize: 20, color: '#999', textAlign: 'center', marginTop: 30, fontStyle: 'italic' },
  the_tai_lieu: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E3F2FD', padding: 14, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: '#BBDEFB', gap: 10 },
  the_tai_lieu_active: { backgroundColor: '#1976D2', borderColor: '#1976D2' },
  badge_loai: { paddingVertical: 3, paddingHorizontal: 8, borderRadius: 6, minWidth: 40, alignItems: 'center' },
  txt_badge: { fontFamily: 'Arial', fontSize: 14, fontWeight: 'bold', color: '#FFFFFF' },
  ten_tai_lieu: { flex: 1, fontFamily: 'Arial', fontSize: 20, fontWeight: 'bold', color: '#0D47A1' },
  ten_tai_lieu_active: { color: '#FFFFFF' },
  btn_xoa: { backgroundColor: '#FFCDD2', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6 },
  txt_xoa: { color: '#D32F2F', fontWeight: 'bold', fontSize: 18 },

  panel_phai: {
    flex: 1, backgroundColor: '#FFFFFF', borderRadius: 12, overflow: 'hidden',
    ...Platform.select({ web: { boxShadow: '0px 4px 10px rgba(0,0,0,0.1)' }, android: { elevation: 4 } }),
  },
  panel_phai_nhung: { minWidth: 0 },
  khung_viewer: { flex: 1, backgroundColor: '#525659' },
  header_viewer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#333333', padding: 15 },
  tieu_de_viewer: { flex: 1, fontFamily: 'Arial', fontSize: 20, fontWeight: 'bold', color: '#FFFFFF', marginRight: 10 },
  btn_mo_rong: { backgroundColor: '#555555', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 6 },
  txt_btn_mo_rong: { fontFamily: 'Arial', fontSize: 18, color: '#FFFFFF' },
  
  bao_loi_viewer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30, gap: 20 },
  txt_bao_loi: { fontFamily: 'Arial', fontSize: 22, color: '#FFFFFF', textAlign: 'center', lineHeight: 32 },
  btn_mo_ngoai_fallback: { backgroundColor: '#1976D2', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 10 },
  txt_mo_ngoai_fallback: { fontFamily: 'Arial', fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' },

  man_hinh_cho: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAFAFA', padding: 40 },
  icon_cho: { fontSize: 72, marginBottom: 20 },
  txt_cho: { fontFamily: 'Arial', fontSize: 24, color: '#666', textAlign: 'center', lineHeight: 36 },
});

export default TaiLieuGoc;