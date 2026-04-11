import { Platform, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import KhungTroLyTriThucChat from '../thanh_phan/khung_tro_ly_tri_thuc_chat';
import { CD } from '../tien_ich/chu_de_giao_dien';

/** Màn hình đầy đủ — cùng logic với cửa sổ chat trên Tổng quan. */
const ManHinhTroLyTriThucChat = ({ navigation }) => (
  <SafeAreaView style={styles.container}>
    <KhungTroLyTriThucChat cheDoHienThi="man_hinh" navigation={navigation} />
  </SafeAreaView>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CD.bg.gradient_mobile,
    ...Platform.select({ web: { backgroundImage: CD.web.gradient_bg } }),
  },
});

export default ManHinhTroLyTriThucChat;
