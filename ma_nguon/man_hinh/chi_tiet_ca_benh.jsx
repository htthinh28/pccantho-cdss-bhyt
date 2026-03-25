/**
 * PHÂN HỆ: CHI TIẾT HỒ SƠ BỆNH ÁN & CẢNH BÁO CDSS (EMR VIEWER)
 * Chức năng:
 * 1. Truy xuất dữ liệu từ Kho lưu trữ dựa trên MA_LK.
 * 2. Hiển thị toàn diện từ XML1 đến XML6.
 * 3. Tổng hợp các vi phạm giám định để bác sĩ đối soát.
 * Giao diện: Glassmorphism Dark Theme Phương Châu, Arial > 20px.
 */

import { useEffect, useState } from 'react';

import { ActivityIndicator, Alert, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CD } from '../tien_ich/chu_de_giao_dien';

import { layHoSoTheoMaLK } from '../kho_luu_tru/tien_ich_kho';

import { chayBoMayGiamDinhV3 } from '../tien_ich/dong_co_giam_dinh';




const ManHinhChiTiet = ({ route, navigation }) => {

  const { maLK, chi_tiet_loi, benh_nhan_duoc_chon } = route.params || {};

  const [hoSo, setHoSo] = useState(null);

  const [dangTai, setDangTai] = useState(true);



  // --- 1. LẤY DỮ LIỆU TỪ KHO LƯU TRỮ ---

  useEffect(() => {

    const taiDuLieu = async () => {

      if (maLK) {

        const data = await layHoSoTheoMaLK(maLK, 'Bác sĩ Giám định');

        setHoSo(data);

      }

      setDangTai(false);

    };

    taiDuLieu();

  }, [maLK]);



  // --- 2. HÀM VẼ TỪNG DÒNG THÔNG TIN (DẠNG NHÃN - GIÁ TRỊ) ---

  const renderDongInfo = (label, value) => (

    <View style={styles.dong_info}>

      <Text style={styles.txt_label}>{label}:</Text>

      <Text style={styles.txt_value}>{value || '---'}</Text>

    </View>

  );



  if (dangTai) {

    return (

      <View style={styles.khung_loading}>

        <ActivityIndicator size="large" color="#E91E63" />

        <Text style={styles.txt_loading}>Đang truy lục hồ sơ bệnh án...</Text>

      </View>

    );

  }



  if (!hoSo) {

    return (

      <SafeAreaView style={styles.container}>

        <View style={styles.khung_error}>

          <Text style={styles.txt_error}>⚠️ Không tìm thấy hồ sơ chi tiết cho Mã LK: {maLK}</Text>

          <TouchableOpacity style={styles.btn_back_pink} onPress={() => navigation.goBack()}>

            <Text style={styles.txt_btn_back}>⬅ QUAY LẠI</Text>

          </TouchableOpacity>

        </View>

      </SafeAreaView>

    );

  }



  // Bóc tách dữ liệu gốc từ kho

  const dataGoc = hoSo.du_lieu_goc || {};

  const xml1 = dataGoc.xml1 || {};

  const xml2 = dataGoc.xml2 || [];

  const xml3 = dataGoc.xml3 || [];

  const xml4 = dataGoc.xml4 || [];

  const xml5 = dataGoc.xml5 || [];

  const xml6 = dataGoc.xml6 || [];



  // HÀM XỬ LÝ SỰ KIỆN GIÁM ĐỊNH TOÀN BỘ HỒ SƠ

  const handleChayGiamDinh = async () => {

    console.log('--- [BẮT ĐẦU GIÁM ĐỊNH TOÀN BỘ HỒ SƠ V3] ---');

    if (!dataGoc) {

      Alert.alert('Lỗi', 'Không có dữ liệu gốc (dieu_lieu_goc) để giám định.');

      return;

    }



    // Gọi đúng động cơ giám định V3

    const allViolations = await chayBoMayGiamDinhV3(dataGoc);



    console.log(`Kết quả: Tìm thấy ${allViolations.length} vi phạm.`);

    console.log('Chi tiết:', JSON.stringify(allViolations, null, 2));



    const message = allViolations.length > 0

      ? allViolations.map(v => `- [${v.phan_he || 'N/A'}] ${v.canh_bao}`).join('\n')

      : '✅ Không tìm thấy vi phạm nào theo bộ luật đã lưu trong máy.';



    Alert.alert('Kết Quả Giám Định Toàn Bộ', message);

    console.log('--- [KẾT THÚC GIÁM ĐỊNH] ---');

  };



  // Lấy danh sách lỗi chi tiết từ điều hướng truyền sang, hoặc từ lịch sử hồ sơ

  const danhSachLoi = chi_tiet_loi || benh_nhan_duoc_chon?.chi_tiet_loi || hoSo.ket_qua_giam_dinh || hoSo.lich_su_audit || [];



  return (

    <SafeAreaView style={styles.container}>

      {/* THANH ĐIỀU HƯỚNG TRÊN CÙNG */}

      <View style={styles.header}>

        <TouchableOpacity style={styles.btn_back_icon} onPress={() => navigation.goBack()}>

          <Text style={styles.txt_back_icon}>⬅</Text>

        </TouchableOpacity>

        <Text style={styles.tieu_de_header}>CHI TIẾT HỒ SƠ: {xml1.MA_LK}</Text>

        <TouchableOpacity style={styles.btn_header_action} onPress={handleChayGiamDinh}>

          <Text style={styles.txt_btn_header_action}>Chạy GĐ</Text>

        </TouchableOpacity>

      </View>



      <ScrollView style={styles.body}>

        {/* KHỐI 1: THÔNG TIN HÀNH CHÍNH (XML1 - 66 TRƯỜNG TIÊU BIỂU) */}

        <View style={styles.section}>

          <Text style={styles.tieu_de_section}>📋 THÔNG TIN HÀNH CHÍNH (XML1)</Text>

          <View style={styles.card}>

            {renderDongInfo('Họ và tên', xml1.HO_TEN)}

            {renderDongInfo('Mã bệnh nhân', xml1.MA_BN)}

            {renderDongInfo('Ngày sinh', xml1.NGAY_SINH)}

            {renderDongInfo('Giới tính', xml1.GIOI_TINH === '1' ? 'Nam' : 'Nữ')}

            {renderDongInfo('Mã thẻ BHYT', xml1.MA_THE_BHYT || xml1.MA_THE)}

            {renderDongInfo('Địa chỉ', xml1.DIA_CHI)}

            {renderDongInfo('Chẩn đoán vào', xml1.CHAN_DOAN_VAO)}

            {renderDongInfo('Chẩn đoán ra', xml1.CHAN_DOAN_RV)}

            {renderDongInfo('Mã bệnh chính', xml1.MA_BENH_CHINH)}

            {renderDongInfo('Ngày vào', xml1.NGAY_VAO)}

            {renderDongInfo('Ngày ra', xml1.NGAY_RA)}

            {renderDongInfo('Tổng chi phí', Number(xml1.T_TONGCHI_BV || 0).toLocaleString() + ' VNĐ')}

          </View>

        </View>



        {/* KHỐI 2: KẾT QUẢ GIÁM ĐỊNH CDSS */}

        <View style={styles.section}>

          <Text style={styles.tieu_de_section}>⚠️ CẢNH BÁO VI PHẠM (GIÁM ĐỊNH CHI TIẾT)</Text>

          <View style={styles.card_error_container}>

            {danhSachLoi && danhSachLoi.length > 0 ? (

              danhSachLoi.map((loi, index) => {

                const isFixable = loi.truong_loi && loi.truong_loi !== 'UNKNOWN';

                return (

                  <View key={index} style={styles.card_error_item}>

                    <View style={styles.loi_header}>

                      <View style={[styles.badge, { backgroundColor: isFixable ? '#43A047' : '#D32F2F' }]}>

                        <Text style={styles.txt_badge}>{isFixable ? 'SỬA ĐƯỢC' : 'HỆ THỐNG'}</Text>

                      </View>

                      <Text style={styles.txt_phan_he}>Phân hệ: {loi.phan_he || 'Chung'}</Text>

                    </View>

                    <Text style={styles.txt_log}>• {loi.canh_bao || loi.noi_dung || `Vi phạm tại trường: ${loi.truong_loi}`}</Text>

                    <TouchableOpacity style={styles.btn_truy_van} onPress={() => navigation.navigate('SuaFileXML', { maLK: xml1.MA_LK, loi: loi })}>

                                          <Text style={styles.txt_truy_van}>🔍 Truy vấn & Đề nghị sửa lỗi</Text>

                                        </TouchableOpacity>

                  </View>

                );

              })

            ) : (

              <View style={styles.card_error_sach}>

                <Text style={styles.txt_no_error}>✅ Hồ sơ chưa ghi nhận vi phạm nghiêm trọng.</Text>

              </View>

            )}

          </View>

        </View>



        {/* CÁC KHỐI DỮ LIỆU KHÁC... */}

        <View style={styles.section}>

          <Text style={styles.tieu_de_section}>💊 DANH MỤC THUỐC (XML2)</Text>

          {xml2.length > 0 ? xml2.map((t, i) => <View key={i} style={styles.item_list}><Text style={styles.txt_item_name}>{`${i + 1}. ${t.TEN_THUOC}`}</Text><Text style={styles.txt_item_sub}>{`SL: ${t.SO_LUONG} | Đơn giá: ${Number(t.DON_GIA || 0).toLocaleString()}`}</Text></View>) : <Text style={styles.txt_empty}>Không có dữ liệu.</Text>}

        </View>

        <View style={styles.section}>

          <Text style={styles.tieu_de_section}>💉 DỊCH VỤ & VẬT TƯ (XML3)</Text>

          {xml3.length > 0 ? xml3.map((d, i) => <View key={i} style={styles.item_list}><Text style={styles.txt_item_name}>{`${i + 1}. ${d.TEN_DICH_VU}`}</Text><Text style={styles.txt_item_sub}>{`SL: ${d.SO_LUONG} | Thành tiền: ${Number(d.THANH_TIEN_BV || 0).toLocaleString()}`}</Text></View>) : <Text style={styles.txt_empty}>Không có dữ liệu.</Text>}

        </View>



        <View style={{ height: 100 }} />

      </ScrollView>

    </SafeAreaView>

  );

};



const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: CD.bg.gradient_mobile,
    ...Platform.select({ web: { background: CD.web.gradient_bg } })
  },

  header: {
    backgroundColor: CD.brand.mauDam,
    borderBottomWidth: 1,
    borderBottomColor: CD.border.header,
    paddingHorizontal: 24,
    paddingVertical: 16,
    paddingTop: 45,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Platform.select({
      web: {
        background: CD.web.gradient_header,
        backdropFilter: CD.web.blur_header,
        boxShadow: CD.web.shadow_header
      }
    })
  },

  btn_back_icon: { padding: 10 },

  txt_back_icon: { color: CD.text.primary, fontSize: 30, fontWeight: 'bold' },

  tieu_de_header: { color: CD.text.primary, fontSize: 24, fontWeight: 'bold', fontFamily: CD.font.family },

  btn_header_action: {
    backgroundColor: CD.bg.glass_input,
    borderWidth: 1,
    borderColor: CD.border.glass_md,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 14
  },

  txt_btn_header_action: { color: CD.text.primary, fontSize: 18, fontWeight: 'bold' },



  body: { flex: 1, padding: 15 },

  section: { marginBottom: 25 },

  tieu_de_section: {
    fontSize: 22,
    fontWeight: 'bold',
    color: CD.brand.mauNhat,
    marginBottom: 12,
    fontFamily: CD.font.family,
    borderLeftWidth: 6,
    borderColor: CD.brand.mauChinh2,
    paddingLeft: 10
  },



  card: {
    backgroundColor: CD.bg.glass_card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: CD.border.glass,
    padding: 20,
    ...Platform.select({
      web: {
        backdropFilter: CD.web.blur_card,
        WebkitBackdropFilter: CD.web.blur_card,
        boxShadow: CD.web.shadow_card
      }
    })
  },

  dong_info: {
    flexDirection: 'row',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: CD.border.divider,
    paddingBottom: 8
  },

  txt_label: { fontSize: 20, color: CD.text.secondary, width: 200, fontFamily: CD.font.family, fontWeight: 'bold' },

  txt_value: { fontSize: 20, color: CD.text.table_cell, flex: 1, fontFamily: CD.font.family },



  card_error_container: { gap: 15 },

  card_error_sach: {
    backgroundColor: CD.bg.glass_card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: CD.border.glass,
    padding: 20,
    ...Platform.select({
      web: {
        backdropFilter: CD.web.blur_card,
        WebkitBackdropFilter: CD.web.blur_card,
        boxShadow: CD.web.shadow_card
      }
    })
  },

  card_error_item: {
    backgroundColor: CD.bg.glass_card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: CD.border.glass,
    padding: 20,
    ...Platform.select({
      web: {
        backdropFilter: CD.web.blur_card,
        WebkitBackdropFilter: CD.web.blur_card,
        boxShadow: CD.web.shadow_card
      }
    })
  },

  loi_header: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },

  badge: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6, marginRight: 12 },

  txt_badge: { color: CD.text.primary, fontSize: 18, fontWeight: 'bold', fontFamily: CD.font.family },

  txt_phan_he: { fontSize: 20, fontWeight: 'bold', color: CD.brand.mauNhat, fontFamily: CD.font.family },

  txt_log: { fontSize: 22, color: CD.text.table_cell, marginBottom: 15, fontFamily: CD.font.family, lineHeight: 32 },

  txt_no_error: { fontSize: 22, color: CD.text.primary, fontWeight: 'bold', fontFamily: CD.font.family },



  btn_truy_van: { alignSelf: 'flex-start', paddingVertical: 5 },

  txt_truy_van: { fontSize: 20, color: CD.brand.mauNhat, fontWeight: 'bold', fontFamily: CD.font.family, textDecorationLine: 'underline' },



  item_list: {
    backgroundColor: CD.bg.glass_card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: CD.brand.mauChinh2,
    padding: 15,
    marginBottom: 10,
    borderLeftWidth: 4,
    ...Platform.select({
      web: {
        backdropFilter: CD.web.blur_card,
        WebkitBackdropFilter: CD.web.blur_card,
        boxShadow: CD.web.shadow_card
      }
    })
  },

  txt_item_name: { fontSize: 21, fontWeight: 'bold', color: CD.text.primary, fontFamily: CD.font.family },

  txt_item_sub: { fontSize: 19, color: CD.text.secondary, marginTop: 5, fontFamily: CD.font.family },



  khung_loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: CD.bg.gradient_mobile,
    ...Platform.select({ web: { background: CD.web.gradient_bg } })
  },

  txt_loading: { marginTop: 15, fontSize: 22, color: CD.brand.mauNhat, fontWeight: 'bold' },



  khung_error: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },

  txt_error: { fontSize: 22, color: CD.brand.mauNhat, textAlign: 'center', marginBottom: 30, fontWeight: 'bold' },

  btn_back_pink: {
    backgroundColor: CD.brand.mauChinh,
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 14,
    ...Platform.select({
      web: {
        background: CD.web.gradient_primary,
        boxShadow: CD.web.shadow_btn,
        cursor: CD.web.cursor_pointer
      }
    })
  },

  txt_btn_back: { color: CD.text.primary, fontSize: 20, fontWeight: 'bold' },

  txt_empty: { fontSize: 18, color: CD.text.muted, fontStyle: 'italic', marginLeft: 15 }

});



export default ManHinhChiTiet;
