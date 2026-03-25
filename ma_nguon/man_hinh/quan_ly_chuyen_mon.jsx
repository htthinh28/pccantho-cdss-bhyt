import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CD } from '../tien_ich/chu_de_giao_dien';

// IMPORT TRỰC TIẾP CẢ 3 PHÂN HỆ TỪ THƯ MỤC CHUYÊN MÔN
import HuongDanBoYTe from '../chuyen_mon/huong_dan_byt/huong_dan_byt';
import PhacDoBenhVien from '../chuyen_mon/phac_do_benh_vien/phac_do_benhvien';
import QuyTrinhMauBYT from '../chuyen_mon/quytrinhkt_byt/quytrinh_mau_byt';

// Định nghĩa 3 phân hệ chuyên môn
const PHAN_HE_CHUYEN_MON = [
  { id: 'PHAC_DO_BV', ten: '🏥 PHÁC ĐỒ PHƯƠNG CHÂU' },
  { id: 'HUONG_DAN_BYT', ten: '📖 HƯỚNG DẪN BỘ Y TẾ' },
  { id: 'QUY_TRINH_KT', ten: '⚙️ QUY TRÌNH KỸ THUẬT' }
];

const QuanLyChuyenMon = ({ navigation }) => {
  const [tabHienTai, setTabHienTai] = useState(PHAN_HE_CHUYEN_MON[0].id);

  // Khôi phục Tab khi F5
  useEffect(() => {
    const khoiTao = async () => {
      try {
        const tabLuu = await AsyncStorage.getItem('TAB_CHUYEN_MON_DANG_MO');
        if (tabLuu) setTabHienTai(tabLuu);
      } catch (error) {
        console.error("Lỗi phục hồi Tab:", error);
      }
    };
    khoiTao();
  }, []);

  // Đổi Tab và lưu trạng thái
  const handleChuyenTab = async (id) => {
    setTabHienTai(id);
    await AsyncStorage.setItem('TAB_CHUYEN_MON_DANG_MO', id);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* THANH TIÊU ĐỀ */}
      <View style={styles.header}>
        {/* Đã sửa lệnh goBack() thành navigate trực tiếp về TongQuan */}
        <TouchableOpacity onPress={() => navigation.navigate('TongQuan')} style={styles.nut_quay_lai}>
          <Text style={styles.txt_back}>⬅ QUAY LẠI TỔNG QUAN</Text>
        </TouchableOpacity>
        <Text style={styles.txt_title}>🧠 EBM: QUẢN LÝ TRI THỨC LÂM SÀNG</Text>
        <View style={{width: 200}} />
      </View>

      {/* THANH TAB BAR */}
      <View style={styles.tab_bar}>
        {PHAN_HE_CHUYEN_MON.map(tab => (
          <TouchableOpacity
            key={tab.id}
            onPress={() => handleChuyenTab(tab.id)}
            style={[styles.tab_item, tabHienTai === tab.id && styles.tab_active]}
          >
            <Text style={[styles.txt_tab, tabHienTai === tab.id && styles.txt_tab_active]}>
              {tab.ten}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* KHU VỰC HIỂN THỊ NỘI DUNG CHUYÊN SÂU */}
      <View style={styles.body}>
        {tabHienTai === 'PHAC_DO_BV' && <PhacDoBenhVien />}
        {tabHienTai === 'HUONG_DAN_BYT' && <HuongDanBoYTe />}
        {tabHienTai === 'QUY_TRINH_KT' && <QuyTrinhMauBYT />}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CD.bg.gradient_mobile,
    ...Platform.select({ web: { background: CD.web.gradient_bg } }),
  },

  header: {
    backgroundColor: CD.brand.mauDam,
    borderBottomWidth: 1,
    borderBottomColor: CD.border.header,
    paddingHorizontal: 24,
    paddingVertical: 16,
    paddingTop: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...Platform.select({
      web: {
        background: CD.web.gradient_header,
        backdropFilter: CD.web.blur_header,
        boxShadow: CD.web.shadow_header,
      },
    }),
  },

  nut_quay_lai: {
    padding: 10,
    backgroundColor: CD.bg.glass_input,
    borderWidth: 1,
    borderColor: CD.border.glass_md,
    borderRadius: 14,
  },
  txt_back: { color: CD.text.primary, fontWeight: 'bold', fontSize: 20, fontFamily: CD.font.family },
  txt_title: { color: CD.text.primary, fontSize: 26, fontWeight: 'bold', fontFamily: CD.font.family },

  tab_bar: {
    flexDirection: 'row',
    backgroundColor: CD.bg.table_row_even,
    borderBottomWidth: 1,
    borderBottomColor: CD.border.divider,
    paddingHorizontal: 20,
    paddingTop: 15,
    gap: 10,
  },

  tab_item: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 10,
    borderRadius: 10,
    backgroundColor: CD.bg.glass_card,
    borderWidth: 1,
    borderColor: CD.border.glass,
  },

  tab_active: {
    backgroundColor: CD.brand.mauChinh,
    borderColor: 'transparent',
    ...Platform.select({
      web: {
        background: CD.web.gradient_primary,
        boxShadow: CD.web.shadow_btn,
      },
    }),
  },

  txt_tab: { fontWeight: 'bold', color: CD.text.secondary, fontSize: 20, fontFamily: CD.font.family },
  txt_tab_active: { color: CD.text.primary, fontSize: 20, fontFamily: CD.font.family, fontWeight: 'bold' },

  body: { flex: 1 },
});

export default QuanLyChuyenMon;
