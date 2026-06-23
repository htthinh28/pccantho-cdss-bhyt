/**
 * PHÂN HỆ: ĐĂNG NHẬP (PHƯƠNG CHÂU - JCI)
 * Phiên bản UI: 2.0 - Modern Split Layout
 * JCI Standard SQE.1: Kiểm soát truy cập nghiêm ngặt.
 */

import { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { BREAKPOINTS, useLayoutMode } from '../tien_ich/diem_anh_man_hinh';
import { SafeAreaView } from 'react-native-safe-area-context';
import ChanTrangUngDung from '../thanh_phan/chan_trang_ung_dung';
import { CD } from '../tien_ich/chu_de_giao_dien';
import { capNhatTaiKhoanTheoEmail, docDanhSachTaiKhoan, ghiNhatKyHeThong, luuDanhSachTaiKhoan } from '../tien_ich/nhat_ky_he_thong';
import { luuPhienDangNhap } from '../tien_ich/phien_dang_nhap';
import { damBaoMigratePhanQuyen, layVaiTroPhienHieuLuc, taiRBAC } from '../tien_ich/rbac_engine';

const ADMIN_EMAIL = 'htthinh28@gmail.com';
const ADMIN_LEGACY_PASSWORD = 'Tramanh@2010##';

const ManHinhDangNhap = ({ navigation }) => {
  const [taiKhoan, setTaiKhoan] = useState('');
  const [matKhau, setMatKhau] = useState('');
  const [dangXuLy, setDangXuLy] = useState(false);
  const [hienMatKhau, setHienMatKhau] = useState(false);
  const [thongBaoDangNhap, setThongBaoDangNhap] = useState('');
  const [loaiThongBao, setLoaiThongBao] = useState('info');

  const capNhatThongBao = (noiDung, loai = 'info') => {
    setThongBaoDangNhap(String(noiDung || ''));
    setLoaiThongBao(loai);
  };

  const dieuHuongSauDangNhap = () => {
    if (navigation?.reset) {
      navigation.reset({ index: 0, routes: [{ name: 'TongQuan' }] });
      return;
    }
    if (navigation?.replace) {
      navigation.replace('TongQuan');
      return;
    }
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.location.assign('/dashboard');
    }
  };

  const xuLyDangNhap = async () => {
    capNhatThongBao('');
    const tk = taiKhoan.trim();
    const mk = matKhau.trim();
    if (!tk || !mk) {
      capNhatThongBao('Vui lòng nhập đầy đủ tài khoản và mật khẩu.', 'error');
      Alert.alert("Thiếu thông tin", "Vui lòng nhập đầy đủ Tài khoản và Mật khẩu.");
      return;
    }
    setDangXuLy(true);
    const tkChuan = tk.toLowerCase();
    let quyen = 'USER';
    let batBuocDoiMatKhau = false;

    try {
      const dangNhapKhanCapAdmin = async (lyDo) => {
        try {
          await luuPhienDangNhap(tkChuan, 'ADMIN');
          await ghiNhatKyHeThong({
            hanhDong: 'DANG_NHAP_THANH_CONG',
            doiTuong: 'HE_THONG',
            chiTiet: `Xác thực thành công (admin emergency path${lyDo ? `: ${lyDo}` : ''})`,
            taiKhoan: tkChuan,
            vaiTro: 'ADMIN',
          });
        } catch {
          // Không chặn đăng nhập nếu ghi log thất bại.
        }
        capNhatThongBao('Đăng nhập thành công, đang chuyển vào hệ thống...', 'success');
        dieuHuongSauDangNhap();
        setDangXuLy(false);
      };

      let dsUsers;
      try {
        await damBaoMigratePhanQuyen();
        dsUsers = await docDanhSachTaiKhoan();
      } catch (storageError) {
        if (tkChuan === ADMIN_EMAIL && mk === ADMIN_LEGACY_PASSWORD) {
          await dangNhapKhanCapAdmin('storage-unavailable');
          return;
        }
        throw storageError;
      }

      // Đảm bảo luôn có tài khoản quản trị mặc định để tránh lockout khi dữ liệu cục bộ bị mất.
      if (!dsUsers.some((u) => u.email === ADMIN_EMAIL)) {
        dsUsers = await luuDanhSachTaiKhoan([
          ...dsUsers,
          {
            email: ADMIN_EMAIL,
            ten: 'ADMIN HTTHINH',
            hoTen: 'ADMIN HTTHINH',
            khoa: 'Phòng Công nghệ thông tin',
            phong: 'Khối điều hành',
            chucDanh: 'Quản trị hệ thống',
            soDienThoai: '',
            matKhau: ADMIN_LEGACY_PASSWORD,
            vaiTro: 'ADMIN',
            trangThai: 'HOAT_DONG',
            buocDoiMatKhau: false,
          },
        ], 'SYSTEM');
      }

      const userHopLe = dsUsers.find((u) => u.email === tkChuan);
      if (!userHopLe) {
        capNhatThongBao('Tài khoản không tồn tại. Vui lòng liên hệ Admin để được cấp quyền.', 'error');
        await ghiNhatKyHeThong({
          hanhDong: 'DANG_NHAP_THAT_BAI',
          doiTuong: 'HE_THONG',
          chiTiet: 'Tài khoản không tồn tại',
          taiKhoan: tkChuan,
          vaiTro: 'USER',
        });
        Alert.alert('Từ chối truy cập', 'Tài khoản không tồn tại. Liên hệ Admin để được cấp quyền.');
        setDangXuLy(false);
        return;
      }

      if (userHopLe.trangThai === 'KHOA') {
        capNhatThongBao('Tài khoản đang bị khóa. Vui lòng liên hệ Admin.', 'error');
        await ghiNhatKyHeThong({
          hanhDong: 'DANG_NHAP_THAT_BAI',
          doiTuong: 'HE_THONG',
          chiTiet: 'Tài khoản đang bị khóa',
          taiKhoan: tkChuan,
          vaiTro: userHopLe.vaiTro || 'USER',
        });
        Alert.alert('Từ chối truy cập', 'Tài khoản đang bị khóa. Vui lòng liên hệ Admin.');
        setDangXuLy(false);
        return;
      }

      const matKhauDung = userHopLe.matKhau === mk || (tkChuan === ADMIN_EMAIL && mk === ADMIN_LEGACY_PASSWORD);
      if (!matKhauDung) {
        capNhatThongBao(
          tkChuan === ADMIN_EMAIL ? 'Mật khẩu quản trị viên không chính xác.' : 'Mật khẩu không chính xác.',
          'error'
        );
        await ghiNhatKyHeThong({
          hanhDong: 'DANG_NHAP_THAT_BAI',
          doiTuong: 'HE_THONG',
          chiTiet: tkChuan === ADMIN_EMAIL ? 'Sai mat khau ADMIN' : 'Sai mat khau',
          taiKhoan: tkChuan,
          vaiTro: userHopLe.vaiTro || 'USER',
        });
        Alert.alert('Từ chối truy cập', tkChuan === ADMIN_EMAIL ? 'Mật khẩu Quản trị viên không chính xác!' : 'Mật khẩu không chính xác!');
        setDangXuLy(false);
        return;
      }

      const cfgRbac = await taiRBAC();
      quyen = layVaiTroPhienHieuLuc({
        cfg: cfgRbac,
        email: tkChuan,
        fallbackRole: userHopLe.vaiTro || (tkChuan === ADMIN_EMAIL ? 'ADMIN' : 'USER'),
      });
      batBuocDoiMatKhau = Boolean(userHopLe.buocDoiMatKhau);
    } catch (_e) {
      capNhatThongBao('Không thể kết nối cơ sở dữ liệu. Vui lòng thử lại.', 'error');
      Alert.alert('Lỗi hệ thống', 'Không thể kết nối cơ sở dữ liệu.');
      setDangXuLy(false);
      return;
    }
    try {
      await luuPhienDangNhap(tkChuan, quyen);
      if (!batBuocDoiMatKhau && quyen !== 'ADMIN') {
        await capNhatTaiKhoanTheoEmail(tkChuan, { lanDangNhapCuoi: new Date().toISOString() }, 'HE_THONG');
      }
      await ghiNhatKyHeThong({
        hanhDong: 'DANG_NHAP_THANH_CONG',
        doiTuong: 'HE_THONG',
        chiTiet: batBuocDoiMatKhau ? 'Xác thực thành công — bắt buộc đổi mật khẩu' : 'Xác thực thành công',
        taiKhoan: tkChuan,
        vaiTro: quyen,
      });
      if (batBuocDoiMatKhau) {
        capNhatThongBao('Đăng nhập thành công. Vui lòng đặt mật khẩu mới để tiếp tục.', 'warning');
        if (navigation?.reset) {
          navigation.reset({ index: 0, routes: [{ name: 'DoiMatKhau', params: { batBuoc: true } }] });
        } else if (navigation?.replace) {
          navigation.replace('DoiMatKhau', { batBuoc: true });
        } else if (Platform.OS === 'web' && typeof window !== 'undefined') {
          window.location.assign('/account/password');
        }
        setDangXuLy(false);
        return;
      }
      capNhatThongBao('Đăng nhập thành công, đang chuyển vào hệ thống...', 'success');
      dieuHuongSauDangNhap();
    } catch (_e) {
      capNhatThongBao('Không thể khởi tạo phiên làm việc. Vui lòng thử lại.', 'error');
      Alert.alert("Lỗi bộ nhớ", "Không thể khởi tạo phiên làm việc.");
    }
    setDangXuLy(false);
  };

  const { width: beRong } = useLayoutMode();
  const dungBoCucHaiCot = beRong >= BREAKPOINTS.sm;
  const rongFormPanel = dungBoCucHaiCot ? Math.min(520, Math.max(400, Math.round(beRong * 0.42))) : '100%';

  return (
    <SafeAreaView style={styles.container}>
      <View style={dungBoCucHaiCot ? styles.layout_web : styles.layout_mobile}>

        {/* ===== PANEL TRÁI: BRANDING (tablet trở lên) ===== */}
        {dungBoCucHaiCot && (
          <View style={styles.brand_panel}>
            {/* Vòng trang trí nền */}
            <View style={styles.deco_circle_1} />
            <View style={styles.deco_circle_2} />
            <View style={styles.deco_circle_3} />

            <View style={styles.brand_content}>
              {/* Logo / Icon */}
              <View style={styles.brand_icon_ring}>
                <Text style={styles.brand_icon_txt}>🏥</Text>
              </View>

              <Text style={styles.brand_name}>PHƯƠNG CHÂU</Text>
              <Text style={styles.brand_subtitle}>BỆNH VIỆN QUỐC TẾ PHƯƠNG CHÂU CẦN THƠ</Text>

              <View style={styles.brand_divider} />

              <Text style={styles.brand_tagline}>Hệ Thống Hỗ Trợ Ra Quyết Định Lâm Sàng</Text>
              <Text style={styles.brand_version}>CDSS · BHYT · QĐ 130 · JCI</Text>

              {/* Stat chips */}
              <View style={styles.stat_row}>
                <View style={styles.stat_chip}>
                  <Text style={styles.stat_num}>6</Text>
                  <Text style={styles.stat_lbl}>Phân hệ XML</Text>
                </View>
                <View style={styles.stat_chip}>
                  <Text style={styles.stat_num}>130+</Text>
                  <Text style={styles.stat_lbl}>Quy tắc kiểm tra</Text>
                </View>
                <View style={styles.stat_chip}>
                  <Text style={styles.stat_num}>JCI</Text>
                  <Text style={styles.stat_lbl}>Tiêu chuẩn</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* ===== PANEL PHẢI: FORM ĐĂNG NHẬP ===== */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={[styles.form_panel, { width: rongFormPanel }]}
        >
          <ScrollView contentContainerStyle={styles.form_scroll} showsVerticalScrollIndicator={false}>
            <View style={styles.form_card}>

              {/* Header form (mobile) */}
              {!dungBoCucHaiCot && (
                <View style={styles.mobile_brand}>
                  <View style={styles.brand_icon_ring_sm}>
                    <Text style={{ fontSize: 32 }}>🏥</Text>
                  </View>
                  <Text style={styles.mobile_brand_name}>CDSS PHƯƠNG CHÂU</Text>
                  <Text style={styles.mobile_brand_sub}>Hệ Thống BHYT & Lâm Sàng</Text>
                </View>
              )}

              <Text style={styles.form_title}>{dungBoCucHaiCot ? 'Đăng nhập hệ thống' : 'Xác thực tài khoản'}</Text>
              <Text style={styles.form_sub}>Nhập thông tin xác thực để tiếp tục</Text>

              {/* Input: Tài khoản */}
              <View style={styles.input_group}>
                <Text style={styles.input_label}>Mã Bác sĩ / Email</Text>
                <View style={styles.input_wrapper}>
                  <Text style={styles.input_icon}>👤</Text>
                  <TextInput
                    style={styles.input_field}
                    placeholder="Nhập email hoặc mã HIS..."
                    placeholderTextColor="#BDBDBD"
                    value={taiKhoan}
                    onChangeText={setTaiKhoan}
                    autoCapitalize="none"
                    outlineStyle="none"
                  />
                </View>
              </View>

              {/* Input: Mật khẩu */}
              <View style={styles.input_group}>
                <Text style={styles.input_label}>Mật khẩu</Text>
                <View style={styles.input_wrapper}>
                  <Text style={styles.input_icon}>🔒</Text>
                  <TextInput
                    style={[styles.input_field, { flex: 1 }]}
                    placeholder="Nhập mật khẩu..."
                    placeholderTextColor="#BDBDBD"
                    secureTextEntry={!hienMatKhau}
                    value={matKhau}
                    onChangeText={setMatKhau}
                    outlineStyle="none"
                  />
                  <TouchableOpacity onPress={() => setHienMatKhau(p => !p)} style={styles.eye_btn}>
                    <Text style={styles.eye_icon}>{hienMatKhau ? '🙈' : '👁️'}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Nút đăng nhập */}
              <TouchableOpacity
                style={[styles.login_btn, dangXuLy && styles.login_btn_loading]}
                onPress={xuLyDangNhap}
                disabled={dangXuLy}
              >
                <Text style={styles.login_btn_txt}>
                  {dangXuLy ? '⏳  ĐANG XÁC THỰC...' : '🔑  ĐĂNG NHẬP'}
                </Text>
              </TouchableOpacity>

              {!!thongBaoDangNhap && (
                <Text style={[
                  styles.login_feedback,
                  loaiThongBao === 'error' && styles.login_feedback_error,
                  loaiThongBao === 'success' && styles.login_feedback_success,
                  loaiThongBao === 'warning' && styles.login_feedback_warning,
                ]}>
                  {thongBaoDangNhap}
                </Text>
              )}

              {/* Thông tin liên hệ */}
              <View style={styles.contact_box}>
                <Text style={styles.contact_txt}>🛡️ Hệ thống đóng · Cần tài khoản?</Text>
                <Text style={styles.contact_email}>Liên hệ Admin: htthinh28@gmail.com</Text>
              </View>

            </View>

            {/* Footer */}
            <ChanTrangUngDung style={{ marginTop: 24 }}>
              <Text style={[styles.footer_txt, { marginBottom: 10 }]}>
                JCI Standard SQE.1 · Bảo mật dữ liệu lâm sàng · 2026
              </Text>
            </ChanTrangUngDung>
          </ScrollView>
        </KeyboardAvoidingView>

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    ...Platform.select({ web: { backgroundImage: CD.web.gradient_bg } }),
    backgroundColor: CD.bg.gradient_mobile,
  },

  layout_web: { flex: 1, flexDirection: 'row' },
  layout_mobile: { flex: 1 },

  // ---- BRAND PANEL (trái - web) ----
  brand_panel: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 50,
    position: 'relative',
    overflow: 'hidden',
  },
  deco_circle_1: {
    position: 'absolute', width: 400, height: 400, borderRadius: 200,
    backgroundColor: 'rgba(255,255,255,0.04)', top: -100, left: -100,
  },
  deco_circle_2: {
    position: 'absolute', width: 300, height: 300, borderRadius: 150,
    backgroundColor: 'rgba(255,255,255,0.06)', bottom: -50, right: -50,
  },
  deco_circle_3: {
    position: 'absolute', width: 200, height: 200, borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.03)', top: '40%', left: '60%',
  },
  brand_content: { alignItems: 'center', zIndex: 1 },
  brand_icon_ring: {
    width: 110, height: 110, borderRadius: 55,
    backgroundColor: CD.bg.glass_input,
    borderWidth: 2, borderColor: CD.border.glass_md,
    justifyContent: 'center', alignItems: 'center', marginBottom: 28,
    ...Platform.select({ web: { boxShadow: CD.web.shadow_card, backdropFilter: CD.web.blur_card, WebkitBackdropFilter: CD.web.blur_card } }),
  },
  brand_icon_txt: { fontSize: 52 },
  brand_name: {
    fontSize: 40, fontWeight: '900', color: CD.text.primary,
    letterSpacing: 0.6, fontFamily: CD.font.family, textAlign: 'center',
  },
  brand_subtitle: {
    fontSize: 18, color: CD.text.secondary,
    letterSpacing: 0.2, marginTop: 8, textAlign: 'center', fontFamily: CD.font.family,
  },
  brand_divider: {
    width: 60, height: 3, backgroundColor: 'rgba(255,255,255,0.4)',
    borderRadius: 2, marginVertical: 28,
  },
  brand_tagline: {
    fontSize: 22, color: CD.text.table_cell, textAlign: 'center',
    fontFamily: CD.font.family, lineHeight: 32, fontWeight: '600',
  },
  brand_version: {
    fontSize: 16, color: CD.text.muted, marginTop: 10,
    letterSpacing: 0.2, fontFamily: CD.font.family,
  },
  stat_row: { flexDirection: 'row', gap: 16, marginTop: 40 },
  stat_chip: {
    alignItems: 'center', paddingVertical: 14, paddingHorizontal: 20,
    backgroundColor: CD.bg.glass_card,
    borderRadius: 16, borderWidth: 1, borderColor: CD.border.glass,
    minWidth: 90,
    ...Platform.select({ web: { backdropFilter: CD.web.blur_card, WebkitBackdropFilter: CD.web.blur_card, boxShadow: CD.web.shadow_card } }),
  },
  stat_num: { fontSize: 26, fontWeight: '900', color: CD.text.primary, fontFamily: CD.font.family },
  stat_lbl: { fontSize: 13, color: CD.text.secondary, marginTop: 4, textAlign: 'center' },

  // ---- FORM PANEL (phải) ----
  form_panel: {
    backgroundColor: CD.bg.glass_card,
    justifyContent: 'center',
    ...Platform.select({ web: { backdropFilter: CD.web.blur_header, WebkitBackdropFilter: CD.web.blur_header } }),
  },
  form_scroll: { flexGrow: 1, justifyContent: 'center', padding: 40 },
  form_card: {
    backgroundColor: CD.bg.glass_card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: CD.border.glass,
    padding: 40,
    ...Platform.select({ web: { backdropFilter: CD.web.blur_card, WebkitBackdropFilter: CD.web.blur_card, boxShadow: CD.web.shadow_card } }),
  },

  mobile_brand: { alignItems: 'center', marginBottom: 30 },
  brand_icon_ring_sm: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(194,24,91,0.25)',
    borderWidth: 1, borderColor: CD.border.glass_md,
    justifyContent: 'center', alignItems: 'center', marginBottom: 12,
  },
  mobile_brand_name: { fontSize: 28, fontWeight: '900', color: CD.brand.mauNhat, fontFamily: CD.font.family },
  mobile_brand_sub: { fontSize: 18, color: CD.text.secondary, marginTop: 4, fontFamily: CD.font.family },

  form_title: { fontSize: 30, fontWeight: '800', color: CD.text.primary, fontFamily: CD.font.family, marginBottom: 8 },
  form_sub: { fontSize: 18, color: CD.text.muted, fontFamily: CD.font.family, marginBottom: 36 },

  input_group: { marginBottom: 24 },
  input_label: { fontSize: 18, fontWeight: '700', color: CD.text.secondary, fontFamily: CD.font.family, marginBottom: 10 },
  input_wrapper: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: CD.border.input, borderRadius: 12,
    backgroundColor: CD.bg.glass_input, paddingHorizontal: 16,
    ...Platform.select({ web: { backdropFilter: CD.web.blur_input, WebkitBackdropFilter: CD.web.blur_input, transition: 'border-color 0.2s' } }),
  },
  input_icon: { fontSize: 20, marginRight: 12 },
  input_field: {
    flex: 1, fontSize: 22, paddingVertical: 14, paddingHorizontal: 0,
    color: CD.text.primary, fontFamily: CD.font.family,
    backgroundColor: 'transparent',
    ...Platform.select({ web: { outlineStyle: 'none' } }),
  },
  eye_btn: { padding: 8 },
  eye_icon: { fontSize: 20 },

  login_btn: {
    borderRadius: 14, paddingVertical: 20, paddingHorizontal: 24, alignItems: 'center',
    marginTop: 8, marginBottom: 24,
    ...Platform.select({
      web: {
        backgroundImage: CD.web.gradient_primary,
        boxShadow: CD.web.shadow_btn,
        cursor: CD.web.cursor_pointer,
      },
      android: { elevation: 6 },
      ios: { shadowColor: CD.brand.mauChinh, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12 },
    }),
    backgroundColor: CD.brand.mauChinh,
  },
  login_btn_loading: { opacity: 0.7 },
  login_btn_txt: { fontSize: 22, fontWeight: '800', color: CD.text.primary, letterSpacing: 0.2, fontFamily: CD.font.family },
  login_feedback: {
    marginTop: 10,
    fontSize: 15,
    fontWeight: '700',
    color: CD.text.secondary,
    textAlign: 'center',
    fontFamily: CD.font.family,
  },
  login_feedback_error: { color: '#fecaca' },
  login_feedback_success: { color: '#bbf7d0' },
  login_feedback_warning: { color: '#fde68a' },

  contact_box: {
    borderTopWidth: 1, borderTopColor: CD.border.divider,
    paddingTop: 20, alignItems: 'center',
  },
  contact_txt: { fontSize: 16, color: CD.text.muted, fontFamily: CD.font.family },
  contact_email: { fontSize: 16, color: CD.brand.mauNhat, fontWeight: '600', marginTop: 4, fontFamily: CD.font.family },

  footer_txt: {
    fontSize: 14, color: CD.text.muted,
    textAlign: 'center', marginTop: 24, fontFamily: CD.font.family,
  },
});

export default ManHinhDangNhap;
