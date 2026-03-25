import { ScrollView, StyleSheet, Text, View } from 'react-native';

const InQuyTrinh = ({ maDV, danhSachData }) => {
  // Lấy dữ liệu của dòng tương ứng
  const quyTrinh = danhSachData.find(item => item['MÃ DỊCH VỤ KT'] === maDV) || {};

  return (
    <ScrollView style={styles.vung_an_toan}>
      <View style={styles.trang_in}>
        
        <View style={styles.phan_dau_trang}>
          <Text style={styles.ten_benh_vien}>TẬP ĐOÀN Y TẾ PHƯƠNG CHÂU</Text>
          <Text style={styles.tieu_de_tai_lieu}>QUY TRÌNH KỸ THUẬT LÂM SÀNG</Text>
          <Text style={styles.ma_icd_header}>Tên kỹ thuật: {quyTrinh['TÊN QUY TRÌNH KỸ THUẬT']}</Text>
          <Text style={styles.chu_thuong}>(Mã DVKT: {quyTrinh['MÃ DỊCH VỤ KT']})</Text>
          <View style={styles.duong_ke_ngang} />
        </View>

        <View style={styles.phan_muc}>
          <Text style={styles.tieu_de_muc}>1. ĐẠI CƯƠNG</Text>
          <Text style={styles.chu_thuong}>{quyTrinh['1. ĐẠI CƯƠNG']}</Text>
        </View>

        <View style={styles.phan_muc}>
          <Text style={styles.tieu_de_muc}>2. CHỈ ĐỊNH & CHỐNG CHỈ ĐỊNH</Text>
          <Text style={styles.chu_thuong}>- <Text style={styles.chu_dam}>Chỉ định:</Text> {quyTrinh['2. CHỈ ĐỊNH']}</Text>
          <Text style={styles.chu_thuong}>- <Text style={styles.chu_dam}>Chống chỉ định:</Text> {quyTrinh['3. CHỐNG CHỈ ĐỊNH']}</Text>
          <Text style={styles.chu_thuong}>- <Text style={styles.chu_dam}>Thận trọng:</Text> {quyTrinh['4. THẬN TRỌNG']}</Text>
        </View>

        <View style={styles.phan_muc}>
          <Text style={styles.tieu_de_muc}>5. CHUẨN BỊ NGUỒN LỰC & VẬT TƯ</Text>
          <View style={styles.noi_dung_muc}>
            <Text style={styles.chu_thuong}><Text style={styles.chu_dam}>5.1. Nhân lực:</Text> {quyTrinh['5.1. NHÂN LỰC']}</Text>
            <Text style={styles.chu_thuong}><Text style={styles.chu_dam}>5.2. Thuốc:</Text> {quyTrinh['5.2. THUỐC (Tên, Nồng độ, Số lượng)']}</Text>
            <Text style={styles.chu_thuong}><Text style={styles.chu_dam}>5.3. Vật tư:</Text> {quyTrinh['5.3. VẬT TƯ (Tên, Số lượng)']}</Text>
            <Text style={styles.chu_thuong}><Text style={styles.chu_dam}>5.4. Trang thiết bị:</Text> {quyTrinh['5.4. TRANG THIẾT BỊ']}</Text>
            <Text style={styles.chu_thuong}><Text style={styles.chu_dam}>5.5. Người bệnh & Hồ sơ:</Text> {quyTrinh['5.5. NGƯỜI BỆNH & HỒ SƠ']}</Text>
            <Text style={styles.chu_thuong}><Text style={styles.chu_dam}>5.7. Thời gian thực hiện:</Text> {quyTrinh['5.7. THỜI GIAN THỰC HIỆN (GIỜ)']} giờ.</Text>
          </View>
        </View>

        <View style={styles.phan_muc}>
          <Text style={styles.tieu_de_muc}>6. TIẾN HÀNH QUY TRÌNH KỸ THUẬT</Text>
          <Text style={styles.chu_thuong}>{quyTrinh['6. TIẾN HÀNH QTKT (Các bước)']}</Text>
        </View>

        <View style={styles.phan_muc}>
          <Text style={styles.tieu_de_muc}>7. THEO DÕI VÀ XỬ TRÍ TAI BIẾN</Text>
          <Text style={styles.chu_thuong}>{quyTrinh['7. THEO DÕI VÀ XỬ TRÍ TAI BIẾN']}</Text>
        </View>

        <View style={styles.phan_muc}>
          <Text style={styles.tieu_de_muc}>TÀI LIỆU THAM KHẢO</Text>
          <Text style={styles.chu_thuong}>{quyTrinh['TÀI LIỆU THAM KHẢO']}</Text>
        </View>

        <View style={styles.phan_cuoi_trang}>
          <Text style={styles.chu_ky_ten}>BAN GIÁM ĐỐC PHÊ DUYỆT</Text>
          <Text style={styles.chu_ky_ngay}>(Ký và ghi rõ họ tên)</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  vung_an_toan: { flex: 1, backgroundColor: '#EFEFEF', padding: 20 },
  trang_in: { backgroundColor: '#FFFFFF', padding: 50, marginHorizontal: 'auto', maxWidth: 1000, width: '100%', elevation: 5 },
  phan_dau_trang: { alignItems: 'center', marginBottom: 40 },
  ten_benh_vien: { fontFamily: 'Arial', fontSize: 24, fontWeight: 'bold', color: '#555' },
  tieu_de_tai_lieu: { fontFamily: 'Arial', fontSize: 32, fontWeight: 'bold', color: '#D81B60', marginVertical: 15 },
  ma_icd_header: { fontFamily: 'Arial', fontSize: 24, fontWeight: 'bold', color: '#333' },
  duong_ke_ngang: { height: 3, backgroundColor: '#D81B60', width: '100%', marginTop: 20 },
  phan_muc: { marginBottom: 35 },
  tieu_de_muc: { fontFamily: 'Arial', fontSize: 26, fontWeight: 'bold', color: '#D81B60', borderBottomWidth: 1.5, borderBottomColor: '#F8BBD0', paddingBottom: 8, marginBottom: 15 },
  noi_dung_muc: { paddingLeft: 10 },
  chu_dam: { fontFamily: 'Arial', fontSize: 22, fontWeight: 'bold', color: '#000' },
  chu_thuong: { fontFamily: 'Arial', fontSize: 22, color: '#333', lineHeight: 36, marginBottom: 12, textAlign: 'justify' },
  phan_cuoi_trang: { marginTop: 60, alignItems: 'flex-end', paddingRight: 50 },
  chu_ky_ten: { fontFamily: 'Arial', fontSize: 22, fontWeight: 'bold', color: '#333' },
  chu_ky_ngay: { fontFamily: 'Arial', fontSize: 20, color: '#888', fontStyle: 'italic', marginTop: 5 }
});

export default InQuyTrinh;