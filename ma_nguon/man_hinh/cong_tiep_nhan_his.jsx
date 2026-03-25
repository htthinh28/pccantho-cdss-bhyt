/**
 * CỔNG TIẾP NHẬN DỮ LIỆU HIS - CDSS API GATEWAY
 * Chuẩn tích hợp: RESTful API (JSON/XML Base64) - Quyết định 130/QĐ-BYT
 * Tiêu chuẩn bảo mật: JCI MCI.3 (An toàn thông tin y tế)
 */

import { useEffect, useState } from 'react';
import { Platform, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CD } from '../tien_ich/chu_de_giao_dien';

const CongTiepNhanHIS = ({ navigation }) => {
  const [isListening, setIsListening] = useState(false);
  const [logs, setLogs] = useState([]);

  // Mô phỏng luồng dữ liệu thời gian thực từ HIS đổ về
  useEffect(() => {
    let interval;
    if (isListening) {
      interval = setInterval(() => {
        const mockMaLK = "LK" + Math.floor(100000 + Math.random() * 900000);
        const mockTrangThai = Math.random() > 0.3 ? 'HỢP LỆ' : 'CẢNH BÁO';
        const newLog = {
          id: Date.now().toString(),
          thoi_gian: new Date().toLocaleTimeString(),
          ma_lk: mockMaLK,
          khoa_phong: ['Khoa Khám Bệnh', 'Khoa Nội', 'Khoa Sản', 'Khoa Nhi'][Math.floor(Math.random() * 4)],
          dung_luong: (Math.random() * 50 + 10).toFixed(2) + ' KB',
          trang_thai: mockTrangThai
        };
        setLogs(prev => [newLog, ...prev].slice(0, 50)); // Lưu tối đa 50 log gần nhất
      }, 3500); // Cứ 3.5 giây có 1 hồ sơ đẩy sang
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isListening]);

  return (
    <SafeAreaView style={styles.vung_an_toan}>
      <View style={styles.thanh_tieu_de}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.nut_quay_lai}>
          <Text style={styles.chu_nut}>⬅ QUAY LẠI TỔNG QUAN</Text>
        </TouchableOpacity>
        <Text style={styles.chu_tieu_de}>🔌 HIS API GATEWAY (CỔNG LIÊN THÔNG)</Text>
        <View style={{ width: 220 }} />
      </View>

      <View style={styles.khung_chuc_nang}>
        
        {/* PANEL TRÁI: CẤU HÌNH API KẾT NỐI CHO ĐỐI TÁC HIS */}
        <View style={styles.panel_trai}>
          <Text style={styles.tieu_de_panel}>⚙️ THÔNG SỐ TÍCH HỢP HỆ THỐNG</Text>
          <Text style={styles.mo_ta_panel}>Cung cấp các thông số dưới đây cho nhà cung cấp phần mềm HIS (VNPT, Viettel, FPT...) để thiết lập Webhook đẩy dữ liệu XML QĐ 130 tự động sang CDSS.</Text>

          <View style={styles.the_cau_hinh}>
            <Text style={styles.nhan_cau_hinh}>Method & Endpoint URL:</Text>
            <View style={styles.o_code}>
              <Text style={styles.chu_code}><Text style={{ color: '#D81B60', fontWeight: 'bold' }}>POST</Text> http://10.10.1.250:8081/api/v1/nhan-xml-130</Text>
            </View>
          </View>

          <View style={styles.the_cau_hinh}>
            <Text style={styles.nhan_cau_hinh}>Headers (Bảo mật Token):</Text>
            <View style={styles.o_code}>
              <Text style={styles.chu_code}>Content-Type: application/json</Text>
              <Text style={styles.chu_code}>Authorization: Bearer <Text style={{ color: '#388E3C' }}>PC_CDSS_2026_x8F9a2...</Text></Text>
            </View>
          </View>

          <View style={styles.the_cau_hinh}>
            <Text style={styles.nhan_cau_hinh}>Payload Format (JSON chứa Base64):</Text>
            <View style={styles.o_code_block}>
              <Text style={styles.chu_code}>{'{'}</Text>
              <Text style={styles.chu_code}>  "ma_lk": "2305010001",</Text>
              <Text style={styles.chu_code}>  "xml1_base64": "PD94bWwgdmVyc2...",</Text>
              <Text style={styles.chu_code}>  "xml2_base64": "PD94bWwgdmVyc2...",</Text>
              <Text style={styles.chu_code}>  "xml3_base64": "PD94bWwgdmVyc2..."</Text>
              <Text style={styles.chu_code}>{'}'}</Text>
            </View>
          </View>

          <View style={styles.khung_trang_thai}>
            <Text style={styles.chu_trang_thai_to}>TRẠNG THÁI CỔNG LẮNG NGHE:</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
              <Switch 
                trackColor={{ false: "#767577", true: "#FFB3D1" }}
                thumbColor={isListening ? "#D81B60" : "#f4f3f4"}
                onValueChange={() => setIsListening(!isListening)}
                value={isListening}
                style={{ transform: [{ scaleX: 1.5 }, { scaleY: 1.5 }] }}
              />
              <Text style={[styles.chu_trang_thai_to, isListening ? { color: '#388E3C' } : { color: '#D32F2F' }]}>
                {isListening ? '🟢 ĐANG MỞ (ONLINE)' : '🔴 ĐÃ ĐÓNG (OFFLINE)'}
              </Text>
            </View>
          </View>
        </View>

        {/* PANEL PHẢI: LOG GIÁM ĐỊNH REAL-TIME */}
        <View style={styles.panel_phai}>
          <Text style={styles.tieu_de_panel}>📡 LOG NHẬN DỮ LIỆU THỜI GIAN THỰC</Text>
          <View style={styles.dong_tieu_de_bang}>
            <Text style={[styles.cot_bang, { width: 120 }]}>THỜI GIAN</Text>
            <Text style={[styles.cot_bang, { width: 150 }]}>MÃ LƯỢT KHÁM</Text>
            <Text style={[styles.cot_bang, { width: 200 }]}>KHOA PHÒNG</Text>
            <Text style={[styles.cot_bang, { width: 150 }]}>DUNG LƯỢNG</Text>
            <Text style={[styles.cot_bang, { flex: 1 }]}>KẾT QUẢ GIÁM ĐỊNH</Text>
          </View>

          <ScrollView style={styles.khung_danh_sach_log}>
            {logs.length === 0 ? (
              <Text style={styles.chu_trong}>Cổng đang chờ dữ liệu từ phần mềm HIS...</Text>
            ) : (
              logs.map((log) => (
                <View key={log.id} style={styles.dong_du_lieu_bang}>
                  <Text style={[styles.chu_du_lieu, { width: 120, color: '#666' }]}>{log.thoi_gian}</Text>
                  <Text style={[styles.chu_du_lieu, { width: 150, fontWeight: 'bold' }]}>{log.ma_lk}</Text>
                  <Text style={[styles.chu_du_lieu, { width: 200 }]}>{log.khoa_phong}</Text>
                  <Text style={[styles.chu_du_lieu, { width: 150, color: '#888' }]}>{log.dung_luong}</Text>
                  <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={[styles.tag_trang_thai, log.trang_thai === 'HỢP LỆ' ? styles.tag_xanh : styles.tag_do]}>
                      {log.trang_thai}
                    </Text>
                    {log.trang_thai === 'CẢNH BÁO' && (
                      <TouchableOpacity style={styles.btn_xem_loi}>
                        <Text style={styles.txt_xem_loi}>Chi tiết</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        </View>

      </View>
    </SafeAreaView>
  );
};

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
    borderRadius: 14,
    borderWidth: 1,
    borderColor: CD.border.glass_md,
    ...Platform.select({ web: { cursor: CD.web.cursor_pointer } }),
  },
  chu_nut: { color: CD.text.primary, fontWeight: 'bold', fontSize: 20, fontFamily: CD.font.family },
  chu_tieu_de: { fontSize: 26, color: CD.text.primary, fontWeight: 'bold', fontFamily: CD.font.family },

  khung_chuc_nang: { flex: 1, flexDirection: 'row', padding: 20, gap: 20 },

  panel_trai: {
    flex: 4,
    backgroundColor: CD.bg.glass_card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: CD.border.glass,
    padding: 25,
    ...Platform.select({ web: { backdropFilter: CD.web.blur_card, WebkitBackdropFilter: CD.web.blur_card, boxShadow: CD.web.shadow_card } }),
  },
  tieu_de_panel: { fontSize: 24, fontWeight: 'bold', color: CD.brand.mauNhat, fontFamily: CD.font.family, marginBottom: 10 },
  mo_ta_panel: { fontSize: 20, color: CD.text.secondary, fontFamily: CD.font.family, lineHeight: 30, marginBottom: 25 },

  the_cau_hinh: { marginBottom: 20 },
  nhan_cau_hinh: { fontSize: 22, fontWeight: 'bold', color: CD.text.primary, fontFamily: CD.font.family, marginBottom: 10 },
  o_code: {
    backgroundColor: CD.bg.glass_input,
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: CD.border.input,
  },
  o_code_block: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: CD.border.divider,
  },
  chu_code: { fontSize: 20, fontFamily: 'monospace', color: CD.text.table_cell },

  khung_trang_thai: {
    marginTop: 30,
    padding: 25,
    backgroundColor: CD.bg.glass_card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: CD.border.glass,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...Platform.select({ web: { backdropFilter: CD.web.blur_card, boxShadow: CD.web.shadow_card } }),
  },
  chu_trang_thai_to: { fontSize: 24, fontWeight: 'bold', fontFamily: CD.font.family, color: CD.brand.mauNhat },

  panel_phai: {
    flex: 6,
    backgroundColor: CD.bg.glass_card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: CD.border.glass,
    padding: 25,
    ...Platform.select({ web: { backdropFilter: CD.web.blur_card, WebkitBackdropFilter: CD.web.blur_card, boxShadow: CD.web.shadow_card } }),
  },
  dong_tieu_de_bang: {
    flexDirection: 'row',
    backgroundColor: CD.bg.table_header,
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  cot_bang: { fontSize: 20, fontWeight: '700', color: CD.text.table_header, fontFamily: CD.font.family },
  khung_danh_sach_log: { flex: 1 },
  dong_du_lieu_bang: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderColor: CD.border.divider,
  },
  chu_du_lieu: { fontSize: 20, color: CD.text.table_cell, fontFamily: CD.font.family },
  chu_trong: { fontSize: 22, color: CD.text.muted, fontStyle: 'italic', textAlign: 'center', marginTop: 50, fontFamily: CD.font.family },

  tag_trang_thai: { paddingVertical: 6, paddingHorizontal: 15, borderRadius: 20, fontSize: 18, fontWeight: 'bold', fontFamily: CD.font.family, color: CD.text.primary },
  tag_xanh: { backgroundColor: 'rgba(76,175,80,0.8)' },
  tag_do: { backgroundColor: 'rgba(244,67,54,0.8)' },
  btn_xem_loi: {
    marginLeft: 15,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: CD.bg.glass_input,
    borderWidth: 1,
    borderColor: CD.border.error,
    borderRadius: 6,
    ...Platform.select({ web: { cursor: CD.web.cursor_pointer } }),
  },
  txt_xem_loi: { color: CD.brand.mauNhat, fontWeight: 'bold', fontSize: 18, fontFamily: CD.font.family },
});

export default CongTiepNhanHIS;