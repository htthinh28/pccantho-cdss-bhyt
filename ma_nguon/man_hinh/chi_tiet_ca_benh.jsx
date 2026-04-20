/**
 * PHÂN HỆ: CHI TIẾT HỒ SƠ BỆNH ÁN & CẢNH BÁO CDSS
 * Chức năng:
 * 1. Truy xuất hồ sơ theo MA_LK từ kho lưu trữ hiện hành.
 * 2. Hiển thị chi tiết XML1 đến XML6 và giải thích rõ bảng nào không có trong file gốc.
 * 3. Tổng hợp cảnh báo để đối soát nhanh.
 */

import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CD } from '../tien_ich/chu_de_giao_dien';
import { chuanHoaDanhSachCanhBaoGiamDinh, chuanHoaHoSoCanhBao } from '../tien_ich/chuan_hoa_van_ban';
import { chayGiamDinhToanDienV15 } from '../tien_ich/dong_co_giam_dinh';
import { quayLaiAnToan } from '../tien_ich/dieu_huong_an_toan';
import { layNhieuHoSoTuKho } from '../tien_ich/kho_du_lieu';
import {
  dongGoiPhanHoiXacNhanCanhBao,
  goiYTomTatTuKetQuaGiamDinh,
  LOAI_GHI_TRI_THUC,
  themTriThucTuCa,
} from '../tien_ich/tri_thuc_tu_giam_dinh';

const layThongDiepTrangThaiXml = (meta, tenXml, coDuLieu) => {
  if (coDuLieu) return '';
  const upper = String(tenXml || '').toUpperCase();
  if ((meta?.missingXmlTypes || []).includes(upper)) return `Không có ${upper} trong file gốc.`;
  if ((meta?.emptyXmlTypes || []).includes(upper)) return `${upper} có trong file gốc nhưng không đọc được dữ liệu chi tiết.`;
  return `Không có dữ liệu ${upper}.`;
};

const renderDongInfo = (styles, label, value) => (
  <View style={styles.dong_info}>
    <Text style={styles.txt_label}>{label}:</Text>
    <Text style={styles.txt_value}>{value || '---'}</Text>
  </View>
);

const renderDanhSach = (styles, danhSach, renderItem, emptyMessage) => {
  if (!Array.isArray(danhSach) || danhSach.length === 0) {
    return <Text style={styles.txt_empty}>{emptyMessage}</Text>;
  }
  return danhSach.map(renderItem);
};

const locDongHopLe = (danhSach) =>
  (Array.isArray(danhSach) ? danhSach : []).filter(
    (item) => item && typeof item === 'object' && !item.parsererror && Object.keys(item).length > 0
  );

const ManHinhChiTiet = ({ route, navigation }) => {
  const { maLK, chi_tiet_loi, benh_nhan_duoc_chon } = route.params || {};

  const [hoSo, setHoSo] = useState(null);
  const [dangTai, setDangTai] = useState(true);
  const [danhSachLoiTam, setDanhSachLoiTam] = useState([]);
  const [noiDungBaiHoc, setNoiDungBaiHoc] = useState('');
  /** Phản hồi đúng/sai theo từng dòng cảnh báo (tri thức học tập). */
  const [phanHoiCanhBao, setPhanHoiCanhBao] = useState({});
  /** Khi không có cảnh báo: xác nhận kết quả “sạch” của engine. */
  const [xacNhanHoSoKhongLoi, setXacNhanHoSoKhongLoi] = useState(false);

  useEffect(() => {
    setPhanHoiCanhBao({});
    setXacNhanHoSoKhongLoi(false);
  }, [maLK]);

  useEffect(() => {
    const taiDuLieu = async () => {
      try {
        if (!maLK) return;
        const [data] = await layNhieuHoSoTuKho([maLK]);
        setHoSo(chuanHoaHoSoCanhBao(data || null));
      } finally {
        setDangTai(false);
      }
    };

    taiDuLieu();
  }, [maLK]);

  const dataGoc = hoSo?.du_lieu_goc || hoSo || {};
  const metaXml = dataGoc?._meta || {};
  const xml1 = dataGoc?.xml1 || dataGoc?.XML1 || {};
  const xml2 = locDongHopLe(dataGoc?.xml2 || dataGoc?.XML2 || []);
  const xml3 = locDongHopLe(dataGoc?.xml3 || dataGoc?.XML3 || []);
  const xml4 = locDongHopLe(dataGoc?.xml4 || dataGoc?.XML4 || []);
  const xml5 = locDongHopLe(dataGoc?.xml5 || dataGoc?.XML5 || []);
  const xml6 = locDongHopLe(dataGoc?.xml6 || dataGoc?.XML6 || []);
  const maLkHienThi = xml1?.MA_LK || dataGoc?.ma_lk || maLK || 'N/A';

  const danhSachLoi = useMemo(() => {
    if (danhSachLoiTam.length > 0) return chuanHoaDanhSachCanhBaoGiamDinh(danhSachLoiTam);
    return chuanHoaDanhSachCanhBaoGiamDinh(
      chi_tiet_loi || benh_nhan_duoc_chon?.chi_tiet_loi || hoSo?.ket_qua_giam_dinh || hoSo?.lich_su_audit || []
    );
  }, [benh_nhan_duoc_chon, chi_tiet_loi, danhSachLoiTam, hoSo]);

  const goiYHeThong = useMemo(
    () =>
      goiYTomTatTuKetQuaGiamDinh({
        ma_lk: maLkHienThi,
        ma_bn: String(xml1?.MA_BN || '').trim(),
        ho_ten: String(xml1?.HO_TEN || '').trim(),
        danhSachLoi,
      }),
    [danhSachLoi, maLkHienThi, xml1?.HO_TEN, xml1?.MA_BN],
  );

  const luuTriThucTuCa = async () => {
    const bai = String(noiDungBaiHoc || '').trim();
    if (bai.length < 8) {
      Alert.alert('Thiếu nội dung', 'Nhập bài học / kết luận (ít nhất vài chữ) trước khi lưu.');
      return;
    }
    const maLuat = [
      ...new Set(
        danhSachLoi.map((l) => String(l?.ma_luat || '').trim()).filter(Boolean),
      ),
    ].join(', ');
    const snap = JSON.stringify(
      danhSachLoi.slice(0, 12).map((l) => ({
        phan_he: l?.phan_he,
        ma_luat: l?.ma_luat,
        canh_bao: String(l?.canh_bao || '').slice(0, 400),
      })),
    );
    const tom = bai.split('\n')[0].slice(0, 200);
    await themTriThucTuCa({
      ma_lk: maLkHienThi,
      ma_bn: String(xml1?.MA_BN || '').trim(),
      ho_ten: String(xml1?.HO_TEN || '').trim(),
      tom_tat: tom || `Ca ${maLkHienThi}`,
      bai_hoc: bai,
      ma_luat_goi_y: maLuat,
      snapshot_loi: snap,
    });
    Alert.alert('Đã lưu', 'Bài học đã ghi vào kho tri thức. Xem tại Tổng quan → Tri thức từ giám định.');
  };

  const datKetLuanCanhBao = (index, ket_luan) => {
    setPhanHoiCanhBao((prev) => ({
      ...prev,
      [index]: { ket_luan, ghi_chu: String(prev[index]?.ghi_chu || '') },
    }));
  };

  const datGhiChuSai = (index, ghi_chu) => {
    setPhanHoiCanhBao((prev) => ({
      ...prev,
      [index]: {
        ket_luan: prev[index]?.ket_luan || 'SAI',
        ghi_chu,
      },
    }));
  };

  const luuPhanHoiXacNhanVaoTriThuc = async () => {
    if (danhSachLoi.length === 0) {
      if (!xacNhanHoSoKhongLoi) {
        Alert.alert('Thiếu xác nhận', 'Đánh dấu xác nhận “không có cảnh báo” là đúng trước khi lưu tri thức.');
        return;
      }
      const goi = dongGoiPhanHoiXacNhanCanhBao({
        ma_lk: maLkHienThi,
        danhSachLoi: [],
        phanHoiTheoChiSo: {},
        xacNhanHoSoSach: 'DUNG',
      });
      await themTriThucTuCa({
        ma_lk: maLkHienThi,
        ma_bn: String(xml1?.MA_BN || '').trim(),
        ho_ten: String(xml1?.HO_TEN || '').trim(),
        tom_tat: goi.tom_tat,
        bai_hoc: goi.bai_hoc,
        ma_luat_goi_y: '',
        snapshot_loi: '[]',
        phan_hoi_canh_bao_json: goi.phan_hoi_canh_bao_json,
        loai_ghi: LOAI_GHI_TRI_THUC.XAC_NHAN_CANH_BAO,
      });
      Alert.alert(
        'Đã lưu',
        'Xác nhận đã ghi vào thẻ tri thức (hồ sơ không cảnh báo). Mở Tri thức từ giám định để xem hoặc xuất Markdown.',
      );
      return;
    }

    for (let i = 0; i < danhSachLoi.length; i += 1) {
      const ph = phanHoiCanhBao[i];
      if (ph?.ket_luan !== 'DUNG' && ph?.ket_luan !== 'SAI') {
        Alert.alert(
          'Chưa đủ xác nhận',
          `Vui lòng chọn Đúng hoặc Sai cho tất cả cảnh báo (${danhSachLoi.length} mục).`,
        );
        return;
      }
    }

    const goi = dongGoiPhanHoiXacNhanCanhBao({
      ma_lk: maLkHienThi,
      danhSachLoi,
      phanHoiTheoChiSo: phanHoiCanhBao,
      xacNhanHoSoSach: null,
    });
    const maLuat = [
      ...new Set(danhSachLoi.map((l) => String(l?.ma_luat || '').trim()).filter(Boolean)),
    ].join(', ');
    const snap = JSON.stringify(
      danhSachLoi.slice(0, 12).map((l) => ({
        phan_he: l?.phan_he,
        ma_luat: l?.ma_luat,
        canh_bao: String(l?.canh_bao || '').slice(0, 400),
      })),
    );
    await themTriThucTuCa({
      ma_lk: maLkHienThi,
      ma_bn: String(xml1?.MA_BN || '').trim(),
      ho_ten: String(xml1?.HO_TEN || '').trim(),
      tom_tat: goi.tom_tat,
      bai_hoc: goi.bai_hoc,
      ma_luat_goi_y: maLuat,
      snapshot_loi: snap,
      phan_hoi_canh_bao_json: goi.phan_hoi_canh_bao_json,
      loai_ghi: LOAI_GHI_TRI_THUC.XAC_NHAN_CANH_BAO,
    });
    Alert.alert(
      'Đã lưu',
      'Phản hồi đúng/sai đã ghi vào thẻ tri thức. Dữ liệu có cấu trúc (JSON) phục vụ huấn luyện/cải thiện độ chính xác — xem tại Tri thức từ giám định.',
    );
  };

  const handleChayGiamDinh = async () => {
    if (!dataGoc || Object.keys(dataGoc).length === 0) {
      Alert.alert('Lỗi', 'Không có dữ liệu gốc để kiểm tra.');
      return;
    }

    const ketQua = await chayGiamDinhToanDienV15(dataGoc);
    const dsLoi = Array.isArray(ketQua) ? ketQua : [];
    setDanhSachLoiTam(chuanHoaDanhSachCanhBaoGiamDinh(dsLoi));

    const message = dsLoi.length > 0
      ? dsLoi.slice(0, 12).map((v) => `- [${v.phan_he || 'Tổng quát'}] ${v.canh_bao}`).join('\n')
      : 'Hồ sơ không có vi phạm theo bộ kiểm tra hiện hành.';

    Alert.alert('Kết quả giám định', message);
  };

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
          <Text style={styles.txt_error}>Không tìm thấy hồ sơ chi tiết cho MA_LK: {maLK}</Text>
          <TouchableOpacity style={styles.btn_back_pink} onPress={() => quayLaiAnToan(navigation, 'TongQuan')}>
            <Text style={styles.txt_btn_back}>QUAY LẠI</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.btn_back_icon} onPress={() => quayLaiAnToan(navigation, 'TongQuan')}>
          <Text style={styles.txt_back_icon}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.tieu_de_header}>CHI TIẾT HỒ SƠ: {maLkHienThi}</Text>
        <TouchableOpacity style={styles.btn_header_action} onPress={handleChayGiamDinh}>
          <Text style={styles.txt_btn_header_action}>Chạy GD</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.body}>
        <View style={styles.section}>
          <Text style={styles.tieu_de_section}>THÔNG TIN HÀNH CHÍNH (XML1)</Text>
          <View style={styles.card}>
            {Object.keys(xml1 || {}).length > 0 ? (
              <>
                {renderDongInfo(styles, 'Họ và tên', xml1.HO_TEN)}
                {renderDongInfo(styles, 'Mã bệnh nhân', xml1.MA_BN)}
                {renderDongInfo(styles, 'Ngày sinh', xml1.NGAY_SINH)}
                {renderDongInfo(styles, 'Giới tính', xml1.GIOI_TINH === '1' ? 'Nam' : xml1.GIOI_TINH === '2' ? 'Nữ' : xml1.GIOI_TINH)}
                {renderDongInfo(styles, 'Mã thẻ BHYT', xml1.MA_THE_BHYT || xml1.MA_THE)}
                {renderDongInfo(styles, 'Địa chỉ', xml1.DIA_CHI)}
                {renderDongInfo(styles, 'Chẩn đoán vào', xml1.CHAN_DOAN_VAO)}
                {renderDongInfo(styles, 'Chẩn đoán ra', xml1.CHAN_DOAN_RV)}
                {renderDongInfo(styles, 'Mã bệnh chính', xml1.MA_BENH_CHINH)}
                {renderDongInfo(styles, 'Ngày vào', xml1.NGAY_VAO)}
                {renderDongInfo(styles, 'Ngày ra', xml1.NGAY_RA)}
                {renderDongInfo(styles, 'Tổng chi phí', `${Number(xml1.T_TONGCHI_BV || 0).toLocaleString()} VND`)}
              </>
            ) : (
              <Text style={styles.txt_empty}>{layThongDiepTrangThaiXml(metaXml, 'XML1', false)}</Text>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.tieu_de_section}>CẢNH BÁO VI PHẠM</Text>
          <View style={styles.card_error_container}>
            {Array.isArray(danhSachLoi) && danhSachLoi.length > 0 ? (
              danhSachLoi.map((loi, index) => {
                const isFixable = loi.truong_loi && loi.truong_loi !== 'UNKNOWN';
                const coSoPhapLy = String(loi.co_so_phap_ly || '').trim();
                const ph = phanHoiCanhBao[index];
                const kl = ph?.ket_luan;

                return (
                  <View key={`${loi.phan_he || 'LOG'}_${index}`} style={styles.card_error_item}>
                    <View style={styles.loi_header}>
                      <View style={[styles.badge, { backgroundColor: isFixable ? '#43A047' : '#D32F2F' }]}>
                        <Text style={styles.txt_badge}>{isFixable ? 'SỬA ĐƯỢC' : 'HỆ THỐNG'}</Text>
                      </View>
                      <Text style={styles.txt_phan_he}>Phân hệ: {loi.phan_he || 'Tổng quát'}</Text>
                    </View>
                    <Text style={styles.txt_ma_luat_nho}>
                      {loi.ma_luat ? `Mã luật/quy tắc: ${loi.ma_luat}` : ''}
                    </Text>
                    <Text style={styles.txt_log}>- {loi.canh_bao || loi.noi_dung || `Vi phạm tại trường: ${loi.truong_loi}`}</Text>
                    {!!coSoPhapLy && <Text style={styles.txt_log_phap_ly}>Cơ sở pháp lý: {coSoPhapLy}</Text>}
                    <Text style={styles.xac_nhan_label}>Xác nhận kết quả giám định (tri thức học tập)</Text>
                    <View style={styles.xac_nhan_row}>
                      <TouchableOpacity
                        style={[styles.xac_nhan_btn, kl === 'DUNG' && styles.xac_nhan_btn_active_dung]}
                        onPress={() => datKetLuanCanhBao(index, 'DUNG')}
                      >
                        <Text style={[styles.xac_nhan_btn_txt, kl === 'DUNG' && styles.xac_nhan_btn_txt_on]}>Đúng</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.xac_nhan_btn, kl === 'SAI' && styles.xac_nhan_btn_active_sai]}
                        onPress={() => datKetLuanCanhBao(index, 'SAI')}
                      >
                        <Text style={[styles.xac_nhan_btn_txt, kl === 'SAI' && styles.xac_nhan_btn_txt_on]}>Sai</Text>
                      </TouchableOpacity>
                    </View>
                    {kl === 'SAI' ? (
                      <TextInput
                        style={styles.xac_nhan_ghi_chu}
                        placeholder="Vì sao sai / bối cảnh (khuyến nghị để AI học đúng hơn)"
                        placeholderTextColor={CD.text.muted}
                        value={ph?.ghi_chu || ''}
                        onChangeText={(t) => datGhiChuSai(index, t)}
                        multiline
                        textAlignVertical="top"
                      />
                    ) : null}
                    <TouchableOpacity style={styles.btn_truy_van} onPress={() => dieuHuongMoTabMoi(navigation, 'SuaFileXML', { maLK: maLkHienThi, loi })}>
                      <Text style={styles.txt_truy_van}>Truy vấn và đề nghị sửa lỗi</Text>
                    </TouchableOpacity>
                  </View>
                );
              })
            ) : (
              <View style={styles.card_error_sach}>
                <Text style={styles.txt_no_error}>Hồ sơ chưa ghi nhận vi phạm nghiêm trọng.</Text>
                <Text style={styles.xac_nhan_hint_sach}>
                  Nếu đồng ý với kết luận “không có cảnh báo” của hệ thống, đánh dấu bên dưới rồi lưu vào tri thức để tích lũy mẫu đúng.
                </Text>
                <TouchableOpacity
                  style={[styles.xac_nhan_hs_sach_btn, xacNhanHoSoKhongLoi && styles.xac_nhan_hs_sach_btn_on]}
                  onPress={() => setXacNhanHoSoKhongLoi((v) => !v)}
                >
                  <Text style={styles.xac_nhan_hs_sach_txt}>
                    {xacNhanHoSoKhongLoi ? '✓ Đã xác nhận: không cảnh báo là đúng' : 'Xác nhận: không có cảnh báo là đúng'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
            <TouchableOpacity style={styles.btn_luu_phan_hoi} onPress={luuPhanHoiXacNhanVaoTriThuc}>
              <Text style={styles.btn_luu_phan_hoi_txt}>Lưu xác nhận đúng/sai vào thẻ tri thức</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.tieu_de_section}>TRI THỨC & HỌC TỪ CA (HỖ TRỢ SOẠN THẢO)</Text>
          <View style={styles.card}>
            <Text style={styles.tri_thuc_hint}>
              Phần cảnh báo phía trên cho phép đánh giá Đúng/Sai từng mục — lưu thành thẻ tri thức có JSON phục vụ học tập và
              nâng cao độ chính xác. Bên dưới: gợi ý nháp từ cảnh báo — chỉnh sửa rồi lưu bài học tự do. Tri thức lưu cục bộ;
              xuất Markdown vào <Text style={styles.tri_thuc_mono}>tai_lieu/</Text> khi cần.
            </Text>
            <Text style={styles.tri_thuc_label}>Gợi ý từ dữ liệu ca (có thể chèn vào ô dưới)</Text>
            <ScrollView style={styles.goi_y_box} nestedScrollEnabled>
              <Text style={styles.goi_y_txt} selectable>
                {goiYHeThong}
              </Text>
            </ScrollView>
            <TouchableOpacity style={styles.btn_chen_goi_y} onPress={() => setNoiDungBaiHoc(goiYHeThong)}>
              <Text style={styles.btn_chen_goi_y_txt}>Chèn gợi ý vào ô bài học</Text>
            </TouchableOpacity>
            <Text style={styles.tri_thuc_label}>Bài học / kết luận giám định (bắt buộc khi lưu)</Text>
            <TextInput
              style={styles.tri_thuc_input}
              multiline
              placeholder="Ghi nhận điểm chính: tình huống, kết luận, việc cần tránh lặp lại…"
              placeholderTextColor={CD.text.muted}
              value={noiDungBaiHoc}
              onChangeText={setNoiDungBaiHoc}
              textAlignVertical="top"
            />
            <View style={styles.tri_thuc_actions}>
              <TouchableOpacity style={styles.btn_luu_tri_thuc} onPress={luuTriThucTuCa}>
                <Text style={styles.btn_luu_tri_thuc_txt}>Lưu vào kho tri thức</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.btn_mo_kho}
                onPress={() => navigation.navigate('TriThucTuGiamDinh')}
              >
                <Text style={styles.btn_mo_kho_txt}>Mở kho tri thức →</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.tieu_de_section}>DANH MỤC THUỐC (XML2)</Text>
          {renderDanhSach(
            styles,
            xml2,
            (t, i) => (
              <View key={`xml2_${i}`} style={styles.item_list}>
                <Text style={styles.txt_item_name}>{`${i + 1}. ${t.TEN_THUOC || t.MA_THUOC || 'Thuốc'}`}</Text>
                <Text style={styles.txt_item_sub}>{`SL: ${t.SO_LUONG || '0'} | Đơn giá: ${Number(t.DON_GIA || 0).toLocaleString()}`}</Text>
              </View>
            ),
            layThongDiepTrangThaiXml(metaXml, 'XML2', xml2.length > 0)
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.tieu_de_section}>DỊCH VỤ & VẬT TƯ (XML3)</Text>
          {renderDanhSach(
            styles,
            xml3,
            (d, i) => (
              <View key={`xml3_${i}`} style={styles.item_list}>
                <Text style={styles.txt_item_name}>{`${i + 1}. ${d.TEN_DICH_VU || d.TEN_VAT_TU || d.MA_DICH_VU || 'DVKT/VTYT'}`}</Text>
                <Text style={styles.txt_item_sub}>{`SL: ${d.SO_LUONG || '0'} | Thành tiền: ${Number(d.THANH_TIEN_BV || 0).toLocaleString()}`}</Text>
              </View>
            ),
            layThongDiepTrangThaiXml(metaXml, 'XML3', xml3.length > 0)
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.tieu_de_section}>CẬN LÂM SÀNG (XML4)</Text>
          {renderDanhSach(
            styles,
            xml4,
            (d, i) => (
              <View key={`xml4_${i}`} style={styles.item_list}>
                <Text style={styles.txt_item_name}>{`${i + 1}. ${d.TEN_CHI_SO || d.MA_CHI_SO || d.MA_DICH_VU || 'CLS'}`}</Text>
                <Text style={styles.txt_item_sub}>{`Giá trị: ${d.GIA_TRI || '---'} | Kết luận: ${d.KET_LUAN || d.MO_TA || '---'}`}</Text>
              </View>
            ),
            layThongDiepTrangThaiXml(metaXml, 'XML4', xml4.length > 0)
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.tieu_de_section}>DIỄN BIẾN ĐIỀU TRỊ (XML5)</Text>
          {renderDanhSach(
            styles,
            xml5,
            (d, i) => (
              <View key={`xml5_${i}`} style={styles.item_list}>
                <Text style={styles.txt_item_name}>{`${i + 1}. ${d.DIEN_BIEN || d.DIEN_BIEN_LS || 'Diễn biến'}`}</Text>
                <Text style={styles.txt_item_sub}>{`Thời điểm: ${d.NGAY_YL || d.THOI_DIEM_DBLS || '---'} | Người thực hiện: ${d.MA_BAC_SI || d.NGUOI_THUC_HIEN || '---'}`}</Text>
              </View>
            ),
            layThongDiepTrangThaiXml(metaXml, 'XML5', xml5.length > 0)
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.tieu_de_section}>THANH TOÁN TỔNG HỢP (XML6)</Text>
          {renderDanhSach(
            styles,
            xml6,
            (d, i) => (
              <View key={`xml6_${i}`} style={styles.item_list}>
                <Text style={styles.txt_item_name}>{`${i + 1}. ${d.HO_TEN || d.MA_BN || 'Thanh toán'}`}</Text>
                <Text style={styles.txt_item_sub}>{`Ngày vào: ${d.NGAY_VAO || '---'} | Ngày ra: ${d.NGAY_RA || '---'}`}</Text>
              </View>
            ),
            layThongDiepTrangThaiXml(metaXml, 'XML6', xml6.length > 0)
          )}
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
    ...Platform.select({ web: { backgroundImage: CD.web.gradient_bg } }),
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
        backgroundImage: CD.web.gradient_header,
        backdropFilter: CD.web.blur_header,
        boxShadow: CD.web.shadow_header,
      },
    }),
  },
  btn_back_icon: { padding: 10 },
  txt_back_icon: { color: CD.text.primary, fontSize: 30, fontWeight: 'bold' },
  tieu_de_header: { color: CD.text.primary, fontSize: 24, fontWeight: 'bold', fontFamily: CD.font.family, flex: 1, textAlign: 'center' },
  btn_header_action: {
    backgroundColor: CD.bg.glass_input,
    borderWidth: 1,
    borderColor: CD.border.glass_md,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 14,
  },
  txt_btn_header_action: { color: CD.text.primary, fontSize: 18, fontWeight: 'bold', fontFamily: CD.font.family },
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
    paddingLeft: 10,
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
        boxShadow: CD.web.shadow_card,
      },
    }),
  },
  dong_info: {
    flexDirection: 'row',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: CD.border.divider,
    paddingBottom: 8,
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
        boxShadow: CD.web.shadow_card,
      },
    }),
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
        boxShadow: CD.web.shadow_card,
      },
    }),
  },
  loi_header: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  badge: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6, marginRight: 12 },
  txt_badge: { color: CD.text.primary, fontSize: 18, fontWeight: 'bold', fontFamily: CD.font.family },
  txt_phan_he: { fontSize: 20, fontWeight: 'bold', color: CD.brand.mauNhat, fontFamily: CD.font.family },
  txt_log: { fontSize: 20, color: CD.text.table_cell, marginBottom: 10, fontFamily: CD.font.family, lineHeight: 30 },
  txt_log_phap_ly: { fontSize: 17, color: CD.text.muted, marginBottom: 12, fontFamily: CD.font.family, lineHeight: 24, fontStyle: 'italic' },
  txt_no_error: { fontSize: 20, color: CD.text.primary, fontWeight: 'bold', fontFamily: CD.font.family },
  btn_truy_van: { alignSelf: 'flex-start', paddingVertical: 5 },
  txt_truy_van: { fontSize: 20, color: CD.brand.mauNhat, fontWeight: 'bold', fontFamily: CD.font.family, textDecorationLine: 'underline' },
  txt_ma_luat_nho: { fontSize: 16, color: CD.text.muted, marginBottom: 6, fontFamily: CD.font.mono },
  xac_nhan_label: {
    fontSize: 15,
    fontWeight: '700',
    color: CD.brand.mauNhat,
    marginTop: 10,
    marginBottom: 8,
    fontFamily: CD.font.family,
  },
  xac_nhan_row: { flexDirection: 'row', gap: 10, flexWrap: 'wrap', marginBottom: 8 },
  xac_nhan_btn: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: CD.border.glass_md,
    backgroundColor: CD.bg.glass_input,
  },
  xac_nhan_btn_active_dung: { backgroundColor: 'rgba(46,125,50,0.25)', borderColor: '#2E7D32' },
  xac_nhan_btn_active_sai: { backgroundColor: 'rgba(198,40,40,0.2)', borderColor: '#C62828' },
  xac_nhan_btn_txt: { fontSize: 16, fontWeight: '700', color: CD.text.secondary, fontFamily: CD.font.family },
  xac_nhan_btn_txt_on: { color: CD.text.primary },
  xac_nhan_ghi_chu: {
    minHeight: 72,
    borderWidth: 1,
    borderColor: CD.border.glass_md,
    borderRadius: 10,
    padding: 10,
    fontSize: 15,
    color: CD.text.table_cell,
    backgroundColor: CD.bg.glass_input,
    marginBottom: 10,
    fontFamily: CD.font.family,
  },
  xac_nhan_hint_sach: { fontSize: 15, color: CD.text.secondary, lineHeight: 22, marginTop: 10, fontFamily: CD.font.family },
  xac_nhan_hs_sach_btn: {
    marginTop: 12,
    alignSelf: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: CD.border.glass_md,
    backgroundColor: CD.bg.glass_input,
  },
  xac_nhan_hs_sach_btn_on: { backgroundColor: 'rgba(46,125,50,0.2)', borderColor: '#2E7D32' },
  xac_nhan_hs_sach_txt: { fontSize: 15, fontWeight: '700', color: CD.text.table_cell, fontFamily: CD.font.family },
  btn_luu_phan_hoi: {
    marginTop: 12,
    alignSelf: 'stretch',
    backgroundColor: '#1565C0',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  btn_luu_phan_hoi_txt: { color: '#FFF', fontWeight: '800', fontSize: 15, fontFamily: CD.font.family },
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
        boxShadow: CD.web.shadow_card,
      },
    }),
  },
  txt_item_name: { fontSize: 20, fontWeight: 'bold', color: CD.text.primary, fontFamily: CD.font.family, marginBottom: 6 },
  txt_item_sub: { fontSize: 18, color: CD.text.secondary, fontFamily: CD.font.family, lineHeight: 26 },
  txt_empty: { fontSize: 18, color: CD.text.muted, fontStyle: 'italic', marginLeft: 15, fontFamily: CD.font.family, lineHeight: 28 },
  khung_loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: CD.bg.gradient_mobile, gap: 12 },
  txt_loading: { fontSize: 20, color: CD.text.primary, fontFamily: CD.font.family },
  khung_error: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, gap: 18 },
  txt_error: { fontSize: 22, color: CD.text.primary, textAlign: 'center', fontFamily: CD.font.family, lineHeight: 32 },
  btn_back_pink: {
    backgroundColor: CD.brand.mauChinh,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  txt_btn_back: { color: CD.text.primary, fontSize: 18, fontWeight: 'bold', fontFamily: CD.font.family },
  tri_thuc_hint: {
    fontSize: 14,
    color: CD.text.secondary,
    lineHeight: 22,
    marginBottom: 12,
    fontFamily: CD.font.family,
  },
  tri_thuc_mono: { fontFamily: CD.font.mono, fontSize: 13, color: CD.text.accent },
  tri_thuc_label: {
    fontSize: 15,
    fontWeight: '700',
    color: CD.brand.mauNhat,
    marginBottom: 8,
    fontFamily: CD.font.family,
  },
  goi_y_box: { maxHeight: 160, marginBottom: 10 },
  goi_y_txt: { fontSize: 14, color: CD.text.table_cell, lineHeight: 22, fontFamily: CD.font.family },
  btn_chen_goi_y: { alignSelf: 'flex-start', marginBottom: 14 },
  btn_chen_goi_y_txt: { fontSize: 15, color: CD.brand.mauNhat, fontWeight: '700', textDecorationLine: 'underline', fontFamily: CD.font.family },
  tri_thuc_input: {
    minHeight: 120,
    borderWidth: 1,
    borderColor: CD.border.glass_md,
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: CD.text.table_cell,
    backgroundColor: CD.bg.glass_input,
    marginBottom: 12,
    fontFamily: CD.font.family,
  },
  tri_thuc_actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, alignItems: 'center' },
  btn_luu_tri_thuc: {
    backgroundColor: CD.brand.mauChinh,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  btn_luu_tri_thuc_txt: { color: CD.text.primary, fontWeight: '800', fontSize: 15, fontFamily: CD.font.family },
  btn_mo_kho: { paddingVertical: 10, paddingHorizontal: 8 },
  btn_mo_kho_txt: { color: CD.brand.mauNhat, fontWeight: '700', fontSize: 15, fontFamily: CD.font.family },
});

export default ManHinhChiTiet;
