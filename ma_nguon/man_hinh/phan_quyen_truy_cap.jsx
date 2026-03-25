/**
 * PHÂN HỆ: QUẢN LÝ TÀI KHOẢN & PHÂN QUYỀN ĐÍCH DANH (USER-LEVEL ACCESS CONTROL)
 * VỊ TRÍ: man_hinh/phan_quyen_truy_cap.jsx
 * Nâng cấp:
 * 1. Admin trực tiếp khởi tạo tài khoản, cấp mật khẩu cho User (Không cho User tự đăng ký).
 * 2. Lưu trữ danh bạ người dùng vào `DANH_SACH_TAI_KHOAN`.
 * 3. Phân quyền truy cập các Module theo từng Email định danh (`ACL_USER_[Email]`).
 * 4. JCI Standard SQE.1: Quản lý đặc quyền truy cập hệ thống thông tin lâm sàng an toàn.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CD } from '../tien_ich/chu_de_giao_dien';

const ManHinhPhanQuyen = ({ navigation }) => {
  // --- STATE DỮ LIỆU ---
  const [danhSachUser, setDanhSachUser] = useState([]);
  const [userDangChon, setUserDangChon] = useState(null);
  const [configQuyen, setConfigQuyen] = useState([]);

  // --- STATE TẠO USER MỚI ---
  const [hienThiModal, setHienThiModal] = useState(false);
  const [emailMoi, setEmailMoi] = useState('');
  const [tenMoi, setTenMoi] = useState('');
  const [matKhauMoi, setMatKhauMoi] = useState('');

  // Danh mục Module chuẩn của hệ thống (Đồng bộ ID với Tổng Quan)
  const DANH_MUC_MODULE_GOC = [
    { id: 'MOD_CONG_HIS', ten: '🔌 KẾT NỐI HIS' },
    { id: 'MOD_KHO_LUU_TRU', ten: '🗄️ KHO LƯU TRỮ' },
    { id: 'MOD_XML_GIAM_DINH', ten: '🗂️ ĐỌC XML' },
    { id: 'MOD_CHUYEN_MON', ten: '🧠 CHUYÊN MÔN' },
    { id: 'MOD_DANH_MUC', ten: '📋 DANH MỤC' },
    { id: 'MOD_QUAN_LY_LUAT', ten: '⚙️ LUẬT BHYT' },
  ];

  useEffect(() => {
    khoiTaoDuLieu();
  }, []);

  const khoiTaoDuLieu = async () => {
    try {
      // 1. Kiểm tra quyền Admin
      const role = await AsyncStorage.getItem('USER_ROLE');
      if (role !== 'ADMIN') {
        Alert.alert("Từ chối", "Chỉ Admin mới có quyền quản lý danh sách này.");
        navigation.goBack();
        return;
      }

      // 2. Lấy danh sách User đã được Admin tạo
      const rawUsers = await AsyncStorage.getItem('DANH_SACH_TAI_KHOAN');
      const users = rawUsers ? JSON.parse(rawUsers) : [];
      setDanhSachUser(users);
    } catch (e) {
      console.error("Lỗi khởi tạo", e);
    }
  };

  // =========================================
  // XỬ LÝ TẠO TÀI KHOẢN MỚI BỞI ADMIN
  // =========================================
  const xuLyTaoTaiKhoan = async () => {
    const email = emailMoi.trim().toLowerCase();
    const ten = tenMoi.trim();
    const mk = matKhauMoi.trim();

    if (!email || !ten || !mk) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ Email/Mã BS, Tên hiển thị và Mật khẩu!");
      return;
    }

    if (mk.length < 6) {
      Alert.alert("Lỗi bảo mật", "Mật khẩu khởi tạo phải từ 6 ký tự trở lên!");
      return;
    }

    // Kiểm tra trùng lặp tài khoản
    const daTonTai = danhSachUser.find(u => u.email === email);
    if (daTonTai) {
      Alert.alert("Lỗi", "Tài khoản (Email/Mã BS) này đã tồn tại trong hệ thống!");
      return;
    }

    try {
      const newUser = { email: email, ten: ten, matKhau: mk };
      const updatedList = [...danhSachUser, newUser];

      await AsyncStorage.setItem('DANH_SACH_TAI_KHOAN', JSON.stringify(updatedList));

      setDanhSachUser(updatedList);
      setHienThiModal(false);
      setEmailMoi('');
      setTenMoi('');
      setMatKhauMoi('');

      Alert.alert("Thành công", `Đã khởi tạo tài khoản cho: ${ten}.\nBác sĩ có thể tiến hành gạt cấu hình phân quyền ngay bây giờ.`);
    } catch (e) {
      Alert.alert("Lỗi", "Không thể lưu tài khoản mới.");
    }
  };

  // =========================================
  // XỬ LÝ PHÂN QUYỀN ĐÍCH DANH
  // =========================================
  const chonUser = async (user) => {
    setUserDangChon(user);
    try {
      // Lấy quyền riêng biệt của User này: key = ACL_USER_[email]
      const rawPrivileges = await AsyncStorage.getItem(`ACL_USER_${user.email}`);
      if (rawPrivileges) {
        // Đã từng cấp quyền -> Trộn với danh sách gốc để không mất module mới
        const parsedPrivileges = JSON.parse(rawPrivileges);
        const mergedList = DANH_MUC_MODULE_GOC.map(defaultMod => {
            const savedMod = parsedPrivileges.find(c => c.id === defaultMod.id);
            return savedMod ? savedMod : { ...defaultMod, quyen: false };
        });
        setConfigQuyen(mergedList);
      } else {
        // Nếu chưa có, mặc định tắt hết để Admin cấp dần (JCI Security)
        const macDinh = DANH_MUC_MODULE_GOC.map(m => ({ ...m, quyen: false }));
        setConfigQuyen(macDinh);
      }
    } catch (e) {
      console.log("Lỗi tải quyền User");
    }
  };

  const thayDoiQuyenModule = (id) => {
    const updated = configQuyen.map(item => {
      if (item.id === id) return { ...item, quyen: !item.quyen };
      return item;
    });
    setConfigQuyen(updated);
  };

  const luuPhanQuyenChoUser = async () => {
    if (!userDangChon) return;
    try {
      await AsyncStorage.setItem(`ACL_USER_${userDangChon.email}`, JSON.stringify(configQuyen));
      Alert.alert("Thành công", `Đã lưu chính sách truy cập cho tài khoản:\n${userDangChon.email}`);
      setUserDangChon(null); // Quay lại danh sách
    } catch (e) {
      Alert.alert("Lỗi", "Không thể lưu quyền.");
    }
  };

  const xoaTaiKhoan = (email) => {
    Alert.alert("Cảnh báo", `Bạn có chắc chắn muốn xóa tài khoản ${email} khỏi hệ thống không?`, [
      { text: "Hủy", style: "cancel" },
      { text: "Xóa", style: 'destructive', onPress: async () => {
          const newList = danhSachUser.filter(u => u.email !== email);
          await AsyncStorage.setItem('DANH_SACH_TAI_KHOAN', JSON.stringify(newList));
          await AsyncStorage.removeItem(`ACL_USER_${email}`); // Xóa luôn lịch sử quyền
          setDanhSachUser(newList);
      }}
    ]);
  };

  // --- GIAO DIỆN DANH SÁCH USER ---
  const renderUserItem = ({ item }) => (
    <View style={styles.the_user}>
      <TouchableOpacity style={styles.the_user_chinh} onPress={() => chonUser(item)}>
        <View style={styles.avatar}><Text style={styles.txt_avatar}>{item.email[0].toUpperCase()}</Text></View>
        <View style={{ flex: 1 }}>
          <Text style={styles.ten_user}>{item.ten}</Text>
          <Text style={styles.email_user}>{item.email}</Text>
        </View>
        <Text style={styles.mui_ten}>Phân quyền ›</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.nut_xoa} onPress={() => xoaTaiKhoan(item.email)}>
        <Text style={styles.icon_xoa}>🗑️</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.vung_an_toan}>
      <View style={styles.khung_chinh}>

        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.tieu_de}>QUẢN TRỊ TÀI KHOẢN</Text>
          <Text style={styles.phu_de}>
            {userDangChon ? `Đang cấp quyền cho: ${userDangChon.ten}` : "Khởi tạo và cấp quyền nhân sự (JCI SQE.1)"}
          </Text>
        </View>

        {!userDangChon ? (
          // MÀN HÌNH 1: DANH SÁCH USER VÀ NÚT TẠO MỚI
          <View style={{ flex: 1 }}>
            <TouchableOpacity style={styles.nut_tao_moi} onPress={() => setHienThiModal(true)}>
              <Text style={styles.chu_nut_tao_moi}>+ THÊM NHÂN VIÊN MỚI</Text>
            </TouchableOpacity>

            <FlatList
              data={danhSachUser}
              keyExtractor={(item) => item.email}
              renderItem={renderUserItem}
              contentContainerStyle={{ paddingBottom: 100 }}
              ListEmptyComponent={<Text style={styles.txt_empty}>Chưa có tài khoản User nào được tạo.</Text>}
            />
          </View>
        ) : (
          // MÀN HÌNH 2: BẢNG CẤP QUYỀN MODULE CHO USER ĐÃ CHỌN
          <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
            {configQuyen.map((item) => (
              <View key={item.id} style={styles.dong_quyen}>
                <Text style={styles.ten_module}>{item.ten}</Text>
                <Switch
                  trackColor={{ false: 'rgba(255,255,255,0.2)', true: '#E91E63' }}
                  thumbColor={item.quyen ? "#FFFFFF" : "#F4F3F4"}
                  onValueChange={() => thayDoiQuyenModule(item.id)}
                  value={item.quyen}
                />
              </View>
            ))}

            <View style={styles.nhom_nut}>
              <TouchableOpacity style={styles.nut_luu} onPress={luuPhanQuyenChoUser}>
                <Text style={styles.chu_nut}>LƯU CHÍNH SÁCH QUYỀN</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.nut_huy_quyen} onPress={() => setUserDangChon(null)}>
                <Text style={styles.chu_nut_huy}>QUAY LẠI DANH SÁCH</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}

        {/* Nút thoát về Dashboard chung */}
        <TouchableOpacity style={styles.nut_back_chinh} onPress={() => navigation.goBack()}>
            <Text style={styles.txt_back}>‹ Thoát Về Tổng Quan</Text>
        </TouchableOpacity>

      </View>

      {/* =========================================
          MODAL TẠO TÀI KHOẢN MỚI
      ========================================= */}
      <Modal visible={hienThiModal} transparent={true} animationType="slide">
        <View style={styles.nen_modal}>
          <View style={styles.khung_modal}>
            <Text style={styles.tieu_de_modal}>TẠO TÀI KHOẢN NỘI BỘ</Text>

            <Text style={styles.nhan_modal}>Mã BS / Email đăng nhập</Text>
            <TextInput
              style={styles.o_nhap_modal}
              placeholder="VD: user@phuongchau.com"
              placeholderTextColor="rgba(255,255,255,0.4)"
              value={emailMoi}
              onChangeText={setEmailMoi}
              autoCapitalize="none"
              outlineStyle="none"
            />

            <Text style={styles.nhan_modal}>Tên hiển thị (Tên BS/NV)</Text>
            <TextInput
              style={styles.o_nhap_modal}
              placeholder="VD: Bs. Nguyễn Văn A"
              placeholderTextColor="rgba(255,255,255,0.4)"
              value={tenMoi}
              onChangeText={setTenMoi}
              outlineStyle="none"
            />

            <Text style={styles.nhan_modal}>Cấp mật khẩu ban đầu</Text>
            <TextInput
              style={styles.o_nhap_modal}
              placeholder="Nhập tối thiểu 6 ký tự"
              placeholderTextColor="rgba(255,255,255,0.4)"
              secureTextEntry={true}
              value={matKhauMoi}
              onChangeText={setMatKhauMoi}
              outlineStyle="none"
            />

            <View style={styles.hang_nut_modal}>
              <TouchableOpacity style={styles.nut_huy} onPress={() => setHienThiModal(false)}>
                <Text style={styles.chu_nut_modal}>HỦY</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.nut_xac_nhan} onPress={xuLyTaoTaiKhoan}>
                <Text style={styles.chu_nut_modal}>TẠO MỚI</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  vung_an_toan: {
    flex: 1,
    backgroundColor: CD.bg.gradient_mobile,
    ...Platform.select({ web: { background: CD.web.gradient_bg } }),
  },
  khung_chinh: { flex: 1, padding: 25 },

  header: {
    backgroundColor: CD.brand.mauDam,
    borderBottomWidth: 1,
    borderBottomColor: CD.border.header,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 20,
    marginBottom: 20,
    ...Platform.select({
      web: {
        background: CD.web.gradient_header,
        backdropFilter: CD.web.blur_header,
        boxShadow: CD.web.shadow_header,
      },
    }),
  },
  tieu_de: { fontSize: 28, fontWeight: '900', color: CD.text.primary, fontFamily: CD.font.family },
  phu_de: { fontSize: 18, color: CD.text.secondary, marginTop: 5 },

  nut_tao_moi: {
    backgroundColor: CD.brand.mauChinh,
    padding: 18,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 20,
    ...Platform.select({
      web: {
        background: CD.web.gradient_primary,
        boxShadow: CD.web.shadow_btn,
        cursor: CD.web.cursor_pointer,
      },
    }),
  },
  chu_nut_tao_moi: { color: CD.text.primary, fontSize: 18, fontWeight: 'bold' },

  the_user: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CD.bg.glass_card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: CD.border.glass,
    marginBottom: 12,
    overflow: 'hidden',
    ...Platform.select({
      web: {
        backdropFilter: CD.web.blur_card,
        WebkitBackdropFilter: CD.web.blur_card,
        boxShadow: CD.web.shadow_card,
      },
    }),
  },
  the_user_chinh: { flex: 1, flexDirection: 'row', alignItems: 'center', padding: 15 },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: CD.brand.mauChinh2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  txt_avatar: { color: CD.text.primary, fontWeight: 'bold', fontSize: 20 },
  ten_user: { fontSize: 18, fontWeight: 'bold', color: CD.text.primary, fontFamily: CD.font.family },
  email_user: { fontSize: 15, color: CD.text.muted, marginTop: 3 },
  mui_ten: { color: CD.brand.mauNhat, fontWeight: 'bold', fontSize: 16 },
  nut_xoa: {
    padding: 20,
    backgroundColor: 'rgba(244,67,54,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderLeftWidth: 1,
    borderLeftColor: CD.border.divider,
  },
  icon_xoa: { fontSize: 20 },
  txt_empty: { textAlign: 'center', fontSize: 18, color: CD.text.muted, marginTop: 40, fontStyle: 'italic' },

  dong_quyen: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: CD.bg.glass_card,
    borderWidth: 1,
    borderColor: CD.border.glass,
    padding: 20,
    borderRadius: 20,
    marginBottom: 10,
    ...Platform.select({
      web: {
        backdropFilter: CD.web.blur_card,
        WebkitBackdropFilter: CD.web.blur_card,
        boxShadow: CD.web.shadow_card,
      },
    }),
  },
  ten_module: { fontSize: 18, fontWeight: 'bold', color: CD.text.primary },
  nhom_nut: { marginTop: 20, gap: 15 },
  nut_luu: {
    backgroundColor: CD.brand.mauChinh,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 14,
    alignItems: 'center',
    ...Platform.select({
      web: {
        background: CD.web.gradient_primary,
        boxShadow: CD.web.shadow_btn,
        cursor: CD.web.cursor_pointer,
      },
    }),
  },
  chu_nut: { color: CD.text.primary, fontWeight: 'bold', fontSize: 18 },
  nut_huy_quyen: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    backgroundColor: CD.bg.glass_input,
    borderWidth: 1,
    borderColor: CD.border.glass_md,
    borderRadius: 14,
  },
  chu_nut_huy: { color: CD.text.secondary, fontWeight: 'bold', fontSize: 18 },

  nut_back_chinh: { marginTop: 'auto', paddingTop: 20, alignItems: 'center' },
  txt_back: { color: CD.brand.mauNhat, fontSize: 18, fontWeight: 'bold', textDecorationLine: 'underline' },

  nen_modal: { flex: 1, backgroundColor: CD.bg.glass_overlay, justifyContent: 'center', alignItems: 'center', padding: 20 },
  khung_modal: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: CD.bg.glass_modal,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: CD.border.glass,
    padding: 25,
    ...Platform.select({
      web: {
        backdropFilter: CD.web.blur_modal,
        boxShadow: CD.web.shadow_modal,
      },
    }),
  },
  tieu_de_modal: { fontSize: 24, fontWeight: 'bold', color: CD.brand.mauNhat, textAlign: 'center', marginBottom: 20, fontFamily: CD.font.family },
  nhan_modal: { fontSize: 18, fontWeight: 'bold', color: CD.text.secondary, marginBottom: 8, fontFamily: CD.font.family },
  o_nhap_modal: {
    backgroundColor: CD.bg.glass_input,
    borderWidth: 1,
    borderColor: CD.border.input,
    borderRadius: 12,
    color: CD.text.primary,
    fontSize: 22,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 20,
    fontFamily: CD.font.family,
    ...Platform.select({ web: { backdropFilter: CD.web.blur_input, outlineStyle: 'none' } }),
  },
  hang_nut_modal: { flexDirection: 'row', justifyContent: 'flex-end', gap: 15, marginTop: 10 },
  nut_huy: {
    backgroundColor: CD.bg.glass_input,
    borderWidth: 1,
    borderColor: CD.border.glass_md,
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 14,
  },
  nut_xac_nhan: {
    backgroundColor: CD.brand.mauChinh,
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 14,
    ...Platform.select({
      web: {
        background: CD.web.gradient_primary,
        boxShadow: CD.web.shadow_btn,
        cursor: CD.web.cursor_pointer,
      },
    }),
  },
  chu_nut_modal: { color: CD.text.primary, fontWeight: 'bold', fontSize: 18, fontFamily: CD.font.family },
});

export default ManHinhPhanQuyen;
