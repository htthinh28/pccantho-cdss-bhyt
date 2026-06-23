import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { rongSidebarTheoMan, useLayoutMode } from '../tien_ich/diem_anh_man_hinh';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EbmPhuSidebarContext } from '../chuyen_mon/ebm_phu_sidebar_context';
import { CD } from '../tien_ich/chu_de_giao_dien';

// IMPORT TRỰC TIẾP CẢ 3 PHÂN HỆ TỪ THƯ MỤC CHUYÊN MÔN
import HuongDanBoYTe from '../chuyen_mon/huong_dan_byt/huong_dan_byt';
import PhacDoBenhVien from '../chuyen_mon/phac_do_benh_vien/phac_do_benhvien';
import QuyTrinhMauBYT from '../chuyen_mon/quytrinhkt_byt/quytrinh_mau_byt';
import TuongTacThuocChuyenMon from '../chuyen_mon/tuong_tac_thuoc/tuong_tac_thuoc';
import PhamViHanhNgheEbm from '../chuyen_mon/pham_vi_hanh_nghe/pham_vi_hanh_nghe_ebm';
import SoTayHanhNghe from '../chuyen_mon/so_tay_hanh_nghe/so_tay_hanh_nghe';

// Định nghĩa phân hệ chuyên môn
const PHAN_HE_CHUYEN_MON = [
  { id: 'PHAC_DO_BV', ten: '🏥 PHÁC ĐỒ PHƯƠNG CHÂU' },
  { id: 'HUONG_DAN_BYT', ten: '📖 HƯỚNG DẪN BỘ Y TẾ' },
  { id: 'QUY_TRINH_KT', ten: '⚙️ QUY TRÌNH KỸ THUẬT' },
  { id: 'TUONG_TAC_THUOC', ten: '💊 TƯƠNG TÁC THUỐC' },
  { id: 'PHAM_VI_HANH_NGHE', ten: '📜 PHẠM VI HÀNH NGHỀ' },
  { id: 'SO_TAY_HANH_NGHE', ten: '📘 SỔ TAY HÀNH NGHỀ' },
];

const QuanLyChuyenMon = ({ navigation }) => {
  const { dungBoCucDoc, width: winW } = useLayoutMode();
  const rongSidebar = rongSidebarTheoMan(winW, { min: 220, max: 320, ratio: 0.28 });
  const [tabHienTai, setTabHienTai] = useState(PHAN_HE_CHUYEN_MON[0].id);
  const [noiDungPhuSidebar, setNoiDungPhuSidebar] = useState(null);
  const datNoiDungPhu = useCallback((node) => setNoiDungPhuSidebar(node), []);

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

  useEffect(() => {
    if (tabHienTai !== 'PHAC_DO_BV') setNoiDungPhuSidebar(null);
  }, [tabHienTai]);

  return (
    <SafeAreaView style={styles.container}>
      <EbmPhuSidebarContext.Provider value={{ datNoiDungPhu }}>
        <View style={[styles.khung_chinh, dungBoCucDoc && styles.khung_chinh_doc]}>
          <ScrollView
            style={[
              styles.sidebar,
              dungBoCucDoc ? styles.sidebar_doc : { width: rongSidebar, maxWidth: rongSidebar },
            ]}
            contentContainerStyle={styles.sidebar_content}
            showsVerticalScrollIndicator
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
          >
            <Text style={styles.sidebar_tieu_de} numberOfLines={2}>
              EBM — Phân hệ
            </Text>
            {PHAN_HE_CHUYEN_MON.map((tab) => (
              <TouchableOpacity
                key={tab.id}
                onPress={() => handleChuyenTab(tab.id)}
                style={[styles.sidebar_tab, tabHienTai === tab.id && styles.tab_active]}
                activeOpacity={0.85}
              >
                <Text
                  style={[styles.txt_tab_sidebar, tabHienTai === tab.id && styles.txt_tab_active]}
                  numberOfLines={3}
                >
                  {tab.ten}
                </Text>
              </TouchableOpacity>
            ))}
            {noiDungPhuSidebar ? <View style={styles.sidebar_phu}>{noiDungPhuSidebar}</View> : null}
          </ScrollView>

          <View style={styles.khoi_phai}>
            <View style={styles.header}>
              <View style={styles.header_row_top}>
                <TouchableOpacity onPress={() => navigation.navigate('TongQuan')} style={styles.nut_quay_lai}>
                  <Text style={styles.txt_back}>⬅ QUAY LẠI TỔNG QUAN</Text>
                </TouchableOpacity>
                <Text style={styles.txt_title} numberOfLines={2}>
                  🧠 EBM: QUẢN LÝ TRI THỨC LÂM SÀNG
                </Text>
              </View>
            </View>

            <View style={styles.body}>
              {tabHienTai === 'PHAC_DO_BV' && <PhacDoBenhVien />}
              {tabHienTai === 'HUONG_DAN_BYT' && <HuongDanBoYTe />}
              {tabHienTai === 'QUY_TRINH_KT' && <QuyTrinhMauBYT />}
              {tabHienTai === 'TUONG_TAC_THUOC' && <TuongTacThuocChuyenMon />}
              {tabHienTai === 'PHAM_VI_HANH_NGHE' && <PhamViHanhNgheEbm navigation={navigation} />}
              {tabHienTai === 'SO_TAY_HANH_NGHE' && <SoTayHanhNghe />}
            </View>
          </View>
        </View>
      </EbmPhuSidebarContext.Provider>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CD.bg.gradient_mobile,
    ...Platform.select({ web: { backgroundImage: CD.web.gradient_bg } }),
  },

  khung_chinh: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'stretch',
    minHeight: 0,
    minWidth: 0,
  },
  khung_chinh_doc: {
    flexDirection: 'column',
  },

  sidebar: {
    flexGrow: 0,
    flexShrink: 0,
    backgroundColor: 'rgba(0,0,0,0.22)',
    borderRightWidth: 1,
    borderRightColor: CD.border.header,
    ...Platform.select({ web: { boxSizing: 'border-box' } }),
  },
  sidebar_doc: {
    width: '100%',
    maxWidth: '100%',
    maxHeight: 220,
    borderRightWidth: 0,
    borderBottomWidth: 1,
    borderBottomColor: CD.border.header,
  },

  sidebar_content: {
    paddingHorizontal: 10,
    paddingTop: 12,
    paddingBottom: 20,
    gap: 8,
  },

  sidebar_tieu_de: {
    fontSize: 11,
    fontWeight: '800',
    color: CD.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 6,
    paddingHorizontal: 4,
    fontFamily: CD.font.family,
  },

  sidebar_tab: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: CD.bg.glass_card,
    borderWidth: 1,
    borderColor: CD.border.glass,
    ...Platform.select({ web: { cursor: 'pointer' } }),
  },

  khoi_phai: {
    flex: 1,
    minWidth: 0,
    minHeight: 0,
  },

  header: {
    backgroundColor: CD.brand.mauDam,
    borderBottomWidth: 1,
    borderBottomColor: CD.border.header,
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: Platform.OS === 'web' ? 16 : 12,
    ...Platform.select({
      web: {
        backgroundImage: CD.web.gradient_header,
        backdropFilter: CD.web.blur_header,
        boxShadow: CD.web.shadow_header,
      },
    }),
  },

  header_row_top: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  nut_quay_lai: {
    padding: 10,
    backgroundColor: CD.bg.glass_input,
    borderWidth: 1,
    borderColor: CD.border.glass_md,
    borderRadius: 14,
  },
  txt_back: { color: CD.text.primary, fontWeight: 'bold', fontSize: 20, fontFamily: CD.font.family },
  txt_title: {
    color: CD.text.primary,
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: CD.font.family,
    flex: 1,
    textAlign: 'center',
    flexShrink: 1,
  },

  tab_active: {
    backgroundColor: CD.brand.mauChinh,
    borderColor: 'transparent',
    ...Platform.select({
      web: {
        backgroundImage: CD.web.gradient_primary,
        boxShadow: CD.web.shadow_btn,
      },
    }),
  },

  txt_tab_sidebar: {
    fontWeight: '700',
    color: CD.text.secondary,
    fontSize: 13,
    lineHeight: 18,
    fontFamily: CD.font.family,
    textTransform: 'uppercase',
  },
  txt_tab_active: { color: CD.text.primary, fontFamily: CD.font.family, fontWeight: '800' },

  sidebar_phu: {
    marginTop: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: CD.border.glass_md,
    width: '100%',
  },

  body: { flex: 1, minHeight: 0 },
});

export default QuanLyChuyenMon;
