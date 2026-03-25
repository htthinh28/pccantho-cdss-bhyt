/**
 * MODULE: KHO LƯU TRỮ HỒ SƠ LÂM SÀNG & NHẬT KÝ TRUY VẾT (EMR & AUDIT TRAIL)
 * Chức năng:
 * 1. Truy xuất hồ sơ: Đọc chuẩn xác dữ liệu các ca bệnh đã giám định từ kho lưu trữ.
 * 2. Nhật ký truy vết: Hiển thị chi tiết lịch sử thay đổi hồ sơ (Audit Trail).
 * 3. Giao diện tối ưu: Bảng bung rộng đúng 1 màn hình (không kéo ngang), thu hẹp cột Chẩn đoán.
 * 4. Xuất dữ liệu: Xuất hàng loạt file XML và báo cáo Excel.
 * 5. Tự động ghi nhớ: Sửa lỗi mất dữ liệu khi Refresh, tự động đồng bộ (Auto-Save).
 * Tiêu chuẩn JCI: MCI.3 (Bảo mật & Truy vết) và QPS (Cải thiện chất lượng).
 * Giao diện: Pink Theme Phương Châu, Font Arial > 20px.
 * [CẬP NHẬT LÕI]: Tích hợp cơ chế Index-Detail từ kho_du_lieu.jsx chống tràn RAM.
 */

import React, { useEffect, useState } from 'react'; // BẮT BUỘC CÓ REACT ĐỂ KHÔNG BỊ LỖI WEB
import { Alert, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as XLSX from 'xlsx';

// --- IMPORT CÁC HÀM TỪ KHO DỮ LIỆU ĐỂ THAY THẾ LÕI CŨ ---
import { layTatCaHoSoTuKho, luuHoSoVaoKho, xoaHoSoKhoiKho } from '../tien_ich/kho_du_lieu';
import { CD } from '../tien_ich/chu_de_giao_dien';

// --- HÀM HỖ TRỢ HIỂN THỊ HỘP THOẠI TRÊN CẢ WEB & MOBILE ---
const safeConfirm = (title, message, onConfirm) => {
  if (Platform.OS === 'web') {
    if (window.confirm(`${title}\n${message}`)) onConfirm();
  } else {
    Alert.alert(title, message, [
      { text: "Hủy", style: "cancel" },
      { text: "Đồng ý", style: "destructive", onPress: onConfirm }
    ]);
  }
};

const safeAlert = (title, message) => {
  if (Platform.OS === 'web') window.alert(`${title}\n${message}`);
  else Alert.alert(title, message);
};

const ManHinhKhoLuuTru = ({ navigation }) => {
  const [danhSachKho, setDanhSachKho] = useState([]);
  const [tuKhoa, setTuKhoa] = useState('');
  const [hoSoDangXem, setHoSoDangXem] = useState(null);

  // --- STATE MỚI CHO CRUD VÀ SORT ---
  const [selectedIds, setSelectedIds] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'thoi_gian', direction: 'desc' });
  const [hoSoDangSua, setHoSoDangSua] = useState(null);
  const [maLKGoc, setMaLKGoc] = useState(null);

  useEffect(() => {
    taiDuLieuKho();
  }, []);

  const taiDuLieuKho = async () => {
    try {
      // Dùng hàm lấy dữ liệu siêu tốc thay vì tải nguyên 1 cục mảng từ AsyncStorage
      const data = await layTatCaHoSoTuKho();
      if (data && data.length > 0) {
        setDanhSachKho(data.sort((a, b) => new Date(b.thoi_gian || 0) - new Date(a.thoi_gian || 0)));
      } else {
        setDanhSachKho([]);
      }
    } catch (error) {
      console.error("Lỗi tải kho hồ sơ:", error);
    }
  };

  // --- BỘ BÓC TÁCH DỮ LIỆU XML SIÊU AN TOÀN (CHỐNG UNDEFINED) ---
  const getSafeXML = (hs) => {
    if (!hs) return { x1: {}, x2: [], x3: [], x4: [] };
    let raw = hs.du_lieu_goc || hs;
    if (typeof raw === 'string') {
        try { raw = JSON.parse(raw); } catch(e) { raw = {}; }
    }

    let x1Data = raw.xml1 || raw.XML1 || {};
    let x1 = Array.isArray(x1Data) ? (x1Data[0] || {}) : x1Data;
    let x2 = raw.xml2 || raw.XML2 || [];
    let x3 = raw.xml3 || raw.XML3 || [];
    let x4 = raw.xml4 || raw.XML4 || [];

    return {
      x1,
      x2: Array.isArray(x2) ? x2 : [x2],
      x3: Array.isArray(x3) ? x3 : [x3],
      x4: Array.isArray(x4) ? x4 : [x4]
    };
  };

  // --- CHỨC NĂNG SORT HỒ SƠ ---
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });

    const sortedData = [...danhSachKho].sort((a, b) => {
      const { x1: x1A } = getSafeXML(a);
      const { x1: x1B } = getSafeXML(b);

      let valA, valB;
      if (key === 'ma_lk') { valA = a.ma_lk || x1A.MA_LK; valB = b.ma_lk || x1B.MA_LK; }
      else if (key === 'ten_bn') { valA = a.ten_benh_nhan || a.ten_bn || x1A.HO_TEN; valB = b.ten_benh_nhan || b.ten_bn || x1B.HO_TEN; }
      else if (key === 'CHAN_DOAN_RV') { valA = x1A.CHAN_DOAN_RV || a.ten_benh; valB = x1B.CHAN_DOAN_RV || b.ten_benh; }
      else if (key === 'T_BHTT') { valA = Number(x1A.T_BHTT) || 0; valB = Number(x1B.T_BHTT) || 0; }
      else if (key === 'T_BNTT') { valA = Number(x1A.T_BNTT) || 0; valB = Number(x1B.T_BNTT) || 0; }
      else if (key === 'thoi_gian') {
         return direction === 'asc' ? new Date(a.thoi_gian || 0) - new Date(b.thoi_gian || 0) : new Date(b.thoi_gian || 0) - new Date(a.thoi_gian || 0);
      }

      if (typeof valA === 'number' && typeof valB === 'number') {
         return direction === 'asc' ? valA - valB : valB - valA;
      }

      return direction === 'asc'
        ? String(valA || '').localeCompare(String(valB || ''))
        : String(valB || '').localeCompare(String(valA || ''));
    });

    setDanhSachKho(sortedData);
  };

  // --- CHỨC NĂNG CHỌN & XÓA HÀNG LOẠT ---
  const toggleSelectRow = (maLK) => {
    setSelectedIds(prev => prev.includes(maLK) ? prev.filter(id => id !== maLK) : [...prev, maLK]);
  };

  const handleXoaHangLoat = () => {
    if (selectedIds.length === 0) return;
    safeConfirm("Cảnh báo", `Xóa vĩnh viễn ${selectedIds.length} hồ sơ đã chọn?`, async () => {
      // Loop qua danh sách và xóa từng file theo hàm an toàn
      for (const id of selectedIds) {
          await xoaHoSoKhoiKho(id);
      }
      taiDuLieuKho(); // Tải lại giao diện sau khi xóa xong
      setSelectedIds([]);
      safeAlert("Thành công", "Đã xóa hồ sơ hàng loạt.");
    });
  };

  const handleXoa = (maLK) => {
    safeConfirm("Xác nhận", `Bác sĩ có chắc chắn muốn xóa vĩnh viễn hồ sơ mã: ${maLK}?`, async () => {
      // Gắn hàm xóa an toàn chống tràn RAM
      await xoaHoSoKhoiKho(maLK);
      taiDuLieuKho();
      safeAlert("Thành công", "Đã xóa hồ sơ.");
    });
  };

  // --- CHỨC NĂNG XUẤT HÀNG LOẠT (XML & EXCEL) ---
  const handleExportXML = () => {
    if (selectedIds.length === 0) return;
    if (Platform.OS !== 'web') return safeAlert("Thông báo", "Tính năng xuất file chỉ hỗ trợ trên nền tảng Web.");

    selectedIds.forEach(id => {
      const hs = danhSachKho.find(item => item.ma_lk === id);
      if (!hs) return;
      const dataGoc = hs.du_lieu_goc || {};

      let xmlContent = '<?xml version="1.0" encoding="UTF-8"?>\n<HOSO>\n';
      Object.keys(dataGoc).forEach(key => {
          if (!key.toLowerCase().startsWith('xml')) return;
          const tag = key.toUpperCase();
          const value = dataGoc[key];

          if (Array.isArray(value)) {
              xmlContent += `  <DSACH_${tag}>\n`;
              value.forEach(row => {
                  xmlContent += `    <${tag}>\n`;
                  Object.keys(row).forEach(f => {
                      if (f !== 'id') xmlContent += `      <${f}>${row[f] || ''}</${f}>\n`;
                  });
                  xmlContent += `    </${tag}>\n`;
              });
              xmlContent += `  </DSACH_${tag}>\n`;
          } else {
              xmlContent += `  <${tag}>\n`;
              Object.keys(value).forEach(f => {
                  if (f !== 'id') xmlContent += `    <${f}>${value[f] || ''}</${f}>\n`;
              });
              xmlContent += `  </${tag}>\n`;
          }
      });
      xmlContent += '</HOSO>';

      const blob = new Blob([xmlContent], { type: 'text/xml' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `HOSO_${id}.xml`;
      link.click();
    });
  };

  const handleExportExcel = () => {
    if (selectedIds.length === 0) return;
    if (Platform.OS !== 'web') return safeAlert("Thông báo", "Tính năng xuất file chỉ hỗ trợ trên nền tảng Web.");

    const exportData = danhSachKho
      .filter(hs => selectedIds.includes(hs.ma_lk))
      .map(hs => {
        const { x1 } = getSafeXML(hs);
        return {
          "Mã Lượt Khám": hs.ma_lk || x1.MA_LK,
          "Tên Bệnh Nhân": String(hs.ten_benh_nhan || hs.ten_bn || x1.HO_TEN).toUpperCase(),
          "Chẩn Đoán RV": x1.CHAN_DOAN_RV || '',
          "BHYT Thanh Toán (VNĐ)": Number(x1.T_BHTT || 0),
          "BN Thanh Toán (VNĐ)": Number(x1.T_BNTT || 0),
          "Thời Gian Cập Nhật": hs.thoi_gian,
          "Trạng Thái": hs.ket_qua_giam_dinh?.length > 0 ? `Vi phạm (${hs.ket_qua_giam_dinh.length} lỗi)` : 'Hợp lệ 100%'
        };
      });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Kho_Luu_Tru");
    XLSX.writeFile(wb, `Danh_Sach_Ho_So_${Date.now()}.xlsx`);
  };

  // --- CHỨC NĂNG SỬA & KIỂM TRA TRÙNG (TỰ ĐỘNG GHI NHỚ) ---
  const batDauSua = (hs) => {
    const { x1 } = getSafeXML(hs);
    const hsCopy = JSON.parse(JSON.stringify(hs)); // Deep clone để chống lỗi tham chiếu
    hsCopy.ma_lk = hsCopy.ma_lk || x1.MA_LK;
    hsCopy.ten_bn = hsCopy.ten_benh_nhan || hsCopy.ten_bn || x1.HO_TEN;
    setHoSoDangSua(hsCopy);
    setMaLKGoc(hsCopy.ma_lk);
  };

  useEffect(() => {
    if (!hoSoDangSua) return;

    // Auto-save sau 500ms ngừng gõ
    const timer = setTimeout(async () => {
      try {
        const khoHienTai = await layTatCaHoSoTuKho();

        if (hoSoDangSua.ma_lk !== maLKGoc) {
            const isDuplicate = khoHienTai.some(hs => {
              const { x1 } = getSafeXML(hs);
              return (hs.ma_lk === hoSoDangSua.ma_lk) || (x1.MA_LK === hoSoDangSua.ma_lk);
            });
            if (isDuplicate) return;
        }

        // Tạo dữ liệu mới để cập nhật lên State (chỉ update item đang sửa)
        const newData = khoHienTai.map(hs => {
          const { x1 } = getSafeXML(hs);
          if (hs.ma_lk === maLKGoc || x1.MA_LK === maLKGoc) {
            let updatedHS = { ...hoSoDangSua };
            if (updatedHS.du_lieu_goc && updatedHS.du_lieu_goc.xml1) {
              if (Array.isArray(updatedHS.du_lieu_goc.xml1)) {
                 updatedHS.du_lieu_goc.xml1[0].MA_LK = updatedHS.ma_lk;
                 updatedHS.du_lieu_goc.xml1[0].HO_TEN = updatedHS.ten_bn;
              } else {
                 updatedHS.du_lieu_goc.xml1.MA_LK = updatedHS.ma_lk;
                 updatedHS.du_lieu_goc.xml1.HO_TEN = updatedHS.ten_bn;
              }
            }
            return updatedHS;
          }
          return hs;
        });

        // Tìm hồ sơ vừa update để lưu xuống DB
        const hsMoiNhat = newData.find(hs => hs.ma_lk === hoSoDangSua.ma_lk);

        // Cập nhật Storage an toàn
        if (hoSoDangSua.ma_lk !== maLKGoc) {
            await xoaHoSoKhoiKho(maLKGoc); // Xóa file rác do đổi mã
        }
        await luuHoSoVaoKho([hsMoiNhat]); // Ghi nhớ nội dung mới

        setDanhSachKho(newData);
        setMaLKGoc(hoSoDangSua.ma_lk);
      } catch (e) {
        console.error("Lỗi tự động lưu:", e);
      }
    }, 500);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hoSoDangSua]);

  const renderModalSua = () => {
    if (!hoSoDangSua) return null;
    return (
      <View style={styles.khung_modal}>
        <View style={styles.header_modal}>
          <Text style={styles.tieu_de_modal}>SỬA NHANH HỒ SƠ (TỰ ĐỘNG LƯU)</Text>
          <TouchableOpacity onPress={() => { setHoSoDangSua(null); setMaLKGoc(null); }} style={styles.btn_dong_modal}>
            <Text style={styles.txt_btn_dong}>ĐÓNG</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.noi_dung_modal}>
          <Text style={styles.chu_thuong}>Mã Lượt Khám:</Text>
          <TextInput
            style={styles.input_edit}
            value={hoSoDangSua.ma_lk}
            onChangeText={(txt) => setHoSoDangSua({...hoSoDangSua, ma_lk: txt})}
            outlineStyle="none"
          />
          <Text style={styles.chu_thuong}>Tên Bệnh Nhân:</Text>
          <TextInput
            style={styles.input_edit}
            value={hoSoDangSua.ten_bn}
            onChangeText={(txt) => setHoSoDangSua({...hoSoDangSua, ten_bn: txt, ten_benh_nhan: txt})}
            outlineStyle="none"
          />
          <Text style={{ color: '#81C784', fontStyle: 'italic', marginTop: 5, marginBottom: 15, fontSize: 18, fontFamily: CD.font.family }}>
            * Thông tin đang được tự động ghi nhớ vào kho.
          </Text>
          <TouchableOpacity style={[styles.btn_dong_modal, { backgroundColor: 'rgba(76,175,80,0.3)', borderColor: 'rgba(76,175,80,0.5)', alignItems: 'center' }]} onPress={() => { setHoSoDangSua(null); setMaLKGoc(null); }}>
            <Text style={styles.txt_btn_dong}>✅ ĐÃ LƯU (ĐÓNG)</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  };

  /**
   * PHÂN HỆ: CHI TIẾT HỒ SƠ & TRUY VẾT THAY ĐỔI (JCI AUDIT TRAIL)
   */
  const renderChiTietHoSo = () => {
    if (!hoSoDangXem) return null;

    const { x1, x2: xml2, x3: xml3 } = getSafeXML(hoSoDangXem);
    const maLK = hoSoDangXem.ma_lk || x1.MA_LK;
    const tenBN = hoSoDangXem.ten_benh_nhan || hoSoDangXem.ten_bn || x1.HO_TEN || 'N/A';
    const nhatKyTruyVet = hoSoDangXem.lich_su_audit || hoSoDangXem.nhat_ky || [];

    return (
      <View style={styles.khung_modal}>
        <View style={styles.header_modal}>
          <Text style={styles.tieu_de_modal}>HỒ SƠ: {String(tenBN).toUpperCase()}</Text>
          <TouchableOpacity onPress={() => setHoSoDangXem(null)} style={styles.btn_dong_modal}>
            <Text style={styles.txt_btn_dong}>ĐÓNG [X]</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.noi_dung_modal}>
          <View style={styles.thong_tin_hanh_chinh}>
            <Text style={styles.chu_thuong}><Text style={styles.chu_dam}>Mã Lượt Khám:</Text> {maLK}</Text>
            <Text style={styles.chu_thuong}><Text style={styles.chu_dam}>Thời gian nạp:</Text> {hoSoDangXem.thoi_gian}</Text>
            <Text style={styles.chu_thuong}><Text style={styles.chu_dam}>Chẩn đoán RV:</Text> {x1.CHAN_DOAN_RV || hoSoDangXem.ten_benh || 'N/A'}</Text>
            <Text style={styles.chu_thuong}><Text style={styles.chu_dam}>BHYT Thanh toán:</Text> {Number(x1.T_BHTT || 0).toLocaleString()} VNĐ</Text>
            <Text style={styles.chu_thuong}><Text style={styles.chu_dam}>BN Thanh toán:</Text> {Number(x1.T_BNTT || 0).toLocaleString()} VNĐ</Text>
            <Text style={styles.chu_thuong}><Text style={styles.chu_dam}>Trạng thái:</Text> {hoSoDangXem.ket_qua_giam_dinh?.length > 0 ? `⚠️ Có ${hoSoDangXem.ket_qua_giam_dinh.length} lỗi` : '✅ Hợp lệ 100%'}</Text>
          </View>

          <View style={styles.phan_muc}>
            <Text style={[styles.tieu_de_muc, { color: '#90CAF9', borderColor: 'rgba(144,202,249,0.3)' }]}>📋 NHẬT KÝ TRUY VẾT & THAY ĐỔI (AUDIT TRAIL)</Text>
            {nhatKyTruyVet.length > 0 ? nhatKyTruyVet.map((log, idx) => (
              <View key={idx} style={styles.dong_nhat_ky}>
                <Text style={styles.chu_thuong}>• <Text style={styles.chu_dam}>{log.thoi_gian}:</Text> {log.hanh_dong}</Text>
                <Text style={styles.chu_nho}>- Người thực hiện: {log.nguoi_dung || 'Hệ thống'} | Ghi chú: {log.ghi_chu || 'Không có'}</Text>
              </View>
            )) : (
              <View style={styles.dong_nhat_ky}>
                <Text style={styles.chu_thuong}>• <Text style={styles.chu_dam}>{hoSoDangXem.thoi_gian}:</Text> Nạp hồ sơ gốc và Giám định lần đầu.</Text>
                <Text style={styles.chu_nho}>- Ghi chú: Hồ sơ được khởi tạo tự động từ file XML.</Text>
              </View>
            )}
          </View>

          <View style={styles.phan_muc}>
            <Text style={styles.tieu_de_muc}>💊 CHI TIẾT THUỐC (XML2)</Text>
            {xml2.length > 0 ? xml2.map((thuoc, idx) => (
              <View key={idx} style={styles.dong_chi_tiet}>
                <Text style={styles.chu_thuong}>{idx + 1}. {thuoc.TEN_THUOC}</Text>
                <Text style={styles.chu_nho}>- SL: {thuoc.SO_LUONG} {thuoc.DON_V_TINH} | Đơn giá: {Number(thuoc.DON_GIA).toLocaleString()} VNĐ</Text>
              </View>
            )) : <Text style={styles.chu_nho}>Không có dữ liệu thuốc.</Text>}
          </View>

          <View style={styles.phan_muc}>
            <Text style={styles.tieu_de_muc}>⚙️ DỊCH VỤ KỸ THUẬT & VẬT TƯ (XML3)</Text>
            {xml3.length > 0 ? xml3.map((dv, idx) => (
              <View key={idx} style={styles.dong_chi_tiet}>
                <Text style={styles.chu_thuong}>{idx + 1}. {dv.TEN_DICH_VU || dv.TEN_VAT_TU}</Text>
                <Text style={styles.chu_nho}>- Thành tiền: {Number(dv.THANH_TIEN_BV).toLocaleString()} VNĐ</Text>
              </View>
            )) : <Text style={styles.chu_nho}>Không có dữ liệu dịch vụ.</Text>}
          </View>

          <View style={{ height: 50 }} />
        </ScrollView>
      </View>
    );
  };

  const danhSachLoc = danhSachKho.filter(hs => {
    const searchStr = String(tuKhoa).toLowerCase().trim();
    const { x1 } = getSafeXML(hs);
    const ten = String(hs.ten_benh_nhan || hs.ten_bn || x1.HO_TEN || '').toLowerCase();
    const ma = String(hs.ma_lk || x1.MA_LK || '').toLowerCase();
    return ma.includes(searchStr) || ten.includes(searchStr);
  });

  return (
    <SafeAreaView style={styles.vung_an_toan}>
      <View style={styles.thanh_tieu_de}>
        <TouchableOpacity onPress={() => navigation?.navigate('TongQuan')} style={styles.nut_quay_lai}>
          <Text style={styles.chu_nut_header}>⬅ TỔNG QUAN</Text>
        </TouchableOpacity>
        <Text style={styles.chu_tieu_de}>🗄️ KHO LƯU TRỮ & TRUY VẾT HỒ SƠ</Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {selectedIds.length > 0 && (
            <React.Fragment>
              <TouchableOpacity onPress={handleExportXML} style={[styles.nut_quay_lai, { backgroundColor: 'rgba(25,118,210,0.3)', borderColor: 'rgba(25,118,210,0.5)' }]}>
                <Text style={styles.chu_nut_header}>📤 XML</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleExportExcel} style={[styles.nut_quay_lai, { backgroundColor: 'rgba(56,142,60,0.3)', borderColor: 'rgba(56,142,60,0.5)' }]}>
                <Text style={styles.chu_nut_header}>📊 EXCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleXoaHangLoat} style={[styles.nut_quay_lai, { backgroundColor: 'rgba(198,40,40,0.3)', borderColor: 'rgba(198,40,40,0.5)' }]}>
                <Text style={styles.chu_nut_header}>🗑 XÓA ({selectedIds.length})</Text>
              </TouchableOpacity>
            </React.Fragment>
          )}
        </View>
      </View>

      <View style={styles.khung_chinh}>
        {hoSoDangSua ? renderModalSua() : hoSoDangXem ? renderChiTietHoSo() : (
          <React.Fragment>
            <View style={styles.thanh_cong_cu}>
              <TextInput
                style={styles.o_tim_kiem}
                placeholder="🔍 Tìm Mã Lượt Khám hoặc Tên Bệnh Nhân..."
                placeholderTextColor="rgba(255,255,255,0.4)"
                value={tuKhoa}
                onChangeText={setTuKhoa}
                outlineStyle="none"
              />
              <Text style={styles.thong_ke}>Tổng cộng: {danhSachKho.length} hồ sơ</Text>
            </View>

            {/* BẢNG ĐÃ BỎ SCROLL NGANG (HIỂN THỊ ĐÚNG 1 MÀN HÌNH - KHÔNG KÉO) */}
            <View style={styles.khung_bang_ngang}>
              <View style={styles.dong_tieu_de_bang}>
                <Text style={[styles.o_header, { width: 60 }]}></Text>
                <TouchableOpacity onPress={() => handleSort('ma_lk')}><Text style={[styles.o_header, { width: 140 }]}>MÃ LK {sortConfig.key === 'ma_lk' && (sortConfig.direction === 'asc' ? '🔼' : '🔽')}</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => handleSort('ten_bn')}><Text style={[styles.o_header, { width: 250 }]}>BỆNH NHÂN {sortConfig.key === 'ten_bn' && (sortConfig.direction === 'asc' ? '🔼' : '🔽')}</Text></TouchableOpacity>
                <TouchableOpacity style={{ flex: 1 }} onPress={() => handleSort('CHAN_DOAN_RV')}><Text style={styles.o_header}>CHẨN ĐOÁN RV {sortConfig.key === 'CHAN_DOAN_RV' && (sortConfig.direction === 'asc' ? '🔼' : '🔽')}</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => handleSort('T_BHTT')}><Text style={[styles.o_header, { width: 150 }]}>BHYT CHI {sortConfig.key === 'T_BHTT' && (sortConfig.direction === 'asc' ? '🔼' : '🔽')}</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => handleSort('T_BNTT')}><Text style={[styles.o_header, { width: 150 }]}>BN CHI {sortConfig.key === 'T_BNTT' && (sortConfig.direction === 'asc' ? '🔼' : '🔽')}</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => handleSort('thoi_gian')}><Text style={[styles.o_header, { width: 180 }]}>THỜI GIAN {sortConfig.key === 'thoi_gian' && (sortConfig.direction === 'asc' ? '🔼' : '🔽')}</Text></TouchableOpacity>
                <Text style={[styles.o_header, { width: 220 }]}>TRẠNG THÁI</Text>
                <Text style={[styles.o_header, { width: 280, textAlign: 'center' }]}>THAO TÁC</Text>
              </View>

              <ScrollView style={{ flex: 1 }}>
                {danhSachLoc.map((hs, idx) => {
                  const checkLoi = hs.ket_qua_giam_dinh?.length > 0;
                  const { x1 } = getSafeXML(hs);
                  const maLK = hs.ma_lk || x1.MA_LK || `ERR_${idx}`;
                  const tenBN = hs.ten_benh_nhan || hs.ten_bn || x1.HO_TEN || "Chưa cập nhật";

                  return (
                    <View key={maLK} style={[styles.dong_du_lieu, idx % 2 === 0 ? styles.dong_chan : styles.dong_le, selectedIds.includes(maLK) && { backgroundColor: 'rgba(233,30,99,0.12)' }]}>
                      <TouchableOpacity style={[styles.o_cell, { width: 60, alignItems: 'center' }]} onPress={() => toggleSelectRow(maLK)}>
                        <View style={[styles.checkbox, selectedIds.includes(maLK) && styles.checkbox_active]} />
                      </TouchableOpacity>

                      <Text style={[styles.o_cell, { width: 140, fontWeight: 'bold', color: '#F48FB1' }]} numberOfLines={1}>{maLK}</Text>
                      <Text style={[styles.o_cell, { width: 250, color: '#90CAF9', fontWeight: 'bold' }]} numberOfLines={1}>{String(tenBN).toUpperCase()}</Text>
                      <Text style={[styles.o_cell, { flex: 1 }]} numberOfLines={2}>{x1.CHAN_DOAN_RV || 'N/A'}</Text>
                      <Text style={[styles.o_cell, { width: 150, color: '#81C784', fontWeight: 'bold' }]} numberOfLines={1}>{Number(x1.T_BHTT || 0).toLocaleString()}</Text>
                      <Text style={[styles.o_cell, { width: 150, color: '#FFB74D', fontWeight: 'bold' }]} numberOfLines={1}>{Number(x1.T_BNTT || 0).toLocaleString()}</Text>
                      <Text style={[styles.o_cell, { width: 180 }]} numberOfLines={2}>{hs.thoi_gian}</Text>
                      <Text style={[styles.o_cell, { width: 220, color: checkLoi ? '#FF6B6B' : '#81C784', fontWeight: 'bold' }]} numberOfLines={1}>
                        {checkLoi ? `⚠️ Vi phạm (${hs.ket_qua_giam_dinh.length})` : '✅ Hợp lệ'}
                      </Text>

                      <View style={[styles.o_cell, { width: 280, flexDirection: 'row', justifyContent: 'center', gap: 10 }]}>
                        <TouchableOpacity style={styles.btn_xem} onPress={() => batDauSua(hs)}>
                          <Text style={styles.txt_btn_nho}>Sửa</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.btn_xem} onPress={() => setHoSoDangXem(hs)}>
                          <Text style={styles.txt_btn_nho}>Xem</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.btn_xoa} onPress={() => handleXoa(maLK)}>
                          <Text style={styles.txt_btn_nho}>🗑</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })}

                {danhSachLoc.length === 0 && (
                  <Text style={styles.chu_trong}>Kho dữ liệu trống hoặc không tìm thấy kết quả.</Text>
                )}
              </ScrollView>
            </View>
          </React.Fragment>
        )}
      </View>

      <View style={styles.khu_vuc_trich_dan}>
        <Text style={styles.van_ban_trich_dan}>[1] JCI MCI.3: Toàn bộ hồ sơ bệnh án và nhật ký thay đổi được lưu trữ an toàn, phục vụ đối soát và truy vấn lâm sàng.</Text>
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

  // ── HEADER ──
  thanh_tieu_de: {
    ...Platform.select({ web: { background: CD.web.gradient_header, backdropFilter: CD.web.blur_header, boxShadow: CD.web.shadow_header } }),
    backgroundColor: CD.brand.mauDam,
    borderBottomWidth: 1, borderBottomColor: CD.border.header,
    paddingHorizontal: 24, paddingVertical: 16, paddingTop: 40,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  nut_quay_lai: {
    paddingVertical: 10, paddingHorizontal: 18,
    backgroundColor: CD.bg.glass_input, borderRadius: 12,
    borderWidth: 1, borderColor: CD.border.glass_md,
  },
  chu_nut_header: { color: CD.text.primary, fontWeight: '700', fontSize: 20, fontFamily: CD.font.family },
  chu_tieu_de: { fontSize: 26, color: CD.text.primary, fontWeight: '900', fontFamily: CD.font.family, letterSpacing: 0.3 },

  // ── LAYOUT ──
  khung_chinh: { flex: 1, padding: 20 },
  thanh_cong_cu: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },

  // ── TÌM KIẾM ──
  o_tim_kiem: {
    backgroundColor: CD.bg.glass_input, borderWidth: 1, borderColor: CD.border.input,
    borderRadius: 12, color: CD.text.primary, fontSize: 22, paddingVertical: 14, paddingHorizontal: 16,
    width: 560,
    ...Platform.select({ web: { backdropFilter: CD.web.blur_input, outlineStyle: 'none' } }),
  },
  thong_ke: { fontSize: 20, fontWeight: '700', color: CD.brand.mauNhat, fontFamily: CD.font.family },

  // ── BẢNG DỮ LIỆU ──
  khung_bang_ngang: {
    backgroundColor: CD.bg.glass_card, borderRadius: 16, overflow: 'hidden', flex: 1,
    borderWidth: 1, borderColor: CD.border.glass,
    ...Platform.select({ web: { backdropFilter: CD.web.blur_card, WebkitBackdropFilter: CD.web.blur_card, boxShadow: CD.web.shadow_card } }),
  },
  dong_tieu_de_bang: {
    flexDirection: 'row', paddingVertical: 18,
    backgroundColor: CD.bg.table_header,
    borderBottomWidth: 1, borderColor: CD.border.accent,
  },
  o_header: { fontFamily: CD.font.family, fontSize: 18, fontWeight: '800', color: CD.text.table_header, paddingHorizontal: 12 },
  dong_du_lieu: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 14,
    borderBottomWidth: 1, borderColor: CD.border.divider,
  },
  dong_chan: { backgroundColor: CD.bg.table_row_even },
  dong_le: { backgroundColor: CD.bg.table_row_odd },
  o_cell: { fontFamily: CD.font.family, fontSize: 18, color: CD.text.table_cell, paddingHorizontal: 12 },

  // ── CHECKBOX ──
  checkbox: {
    width: 22, height: 22, borderWidth: 2, borderColor: CD.border.glass_md, borderRadius: 6,
    justifyContent: 'center', alignItems: 'center',
  },
  checkbox_active: { backgroundColor: CD.brand.mauChinh, borderColor: CD.brand.mauChinh },

  // ── EMPTY STATE ──
  chu_trong: {
    textAlign: 'center', fontSize: 22, color: CD.text.muted,
    paddingVertical: 60, fontStyle: 'italic', fontFamily: CD.font.family,
  },

  // ── ACTION BUTTONS ──
  btn_xem: {
    backgroundColor: CD.bg.glass_input, borderWidth: 1, borderColor: CD.border.glass_md,
    borderRadius: 10, paddingVertical: 9, paddingHorizontal: 14,
    ...Platform.select({ web: { cursor: CD.web.cursor_pointer } }),
  },
  btn_xoa: {
    backgroundColor: 'rgba(244,67,54,0.15)', borderWidth: 1, borderColor: 'rgba(244,67,54,0.4)',
    borderRadius: 10, paddingVertical: 9, paddingHorizontal: 14,
    ...Platform.select({ web: { cursor: CD.web.cursor_pointer } }),
  },
  txt_btn_nho: { color: CD.text.primary, fontWeight: '700', fontSize: 17, fontFamily: CD.font.family },
  input_edit: {
    backgroundColor: CD.bg.glass_input, borderWidth: 1, borderColor: CD.border.input,
    borderRadius: 12, color: CD.text.primary, fontSize: 20, paddingVertical: 14, paddingHorizontal: 16,
    marginBottom: 14, fontFamily: CD.font.family,
    ...Platform.select({ web: { backdropFilter: CD.web.blur_input, outlineStyle: 'none' } }),
  },

  // ── MODAL ──
  khung_modal: {
    flex: 1,
    backgroundColor: CD.bg.glass_modal, borderRadius: 20, overflow: 'hidden',
    borderWidth: 1, borderColor: CD.border.glass,
    ...Platform.select({ web: { backdropFilter: CD.web.blur_modal, boxShadow: CD.web.shadow_modal } }),
  },
  header_modal: {
    ...Platform.select({ web: { background: CD.web.gradient_header, backdropFilter: CD.web.blur_header, boxShadow: CD.web.shadow_header } }),
    backgroundColor: CD.brand.mauDam,
    borderBottomWidth: 1, borderBottomColor: CD.border.header,
    paddingHorizontal: 24, paddingVertical: 22,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  tieu_de_modal: { color: CD.text.primary, fontSize: 22, fontWeight: '800', fontFamily: CD.font.family },
  btn_dong_modal: {
    backgroundColor: CD.bg.glass_input, paddingVertical: 8, paddingHorizontal: 18, borderRadius: 10,
    borderWidth: 1, borderColor: CD.border.glass_md,
  },
  txt_btn_dong: { color: CD.text.primary, fontWeight: '700', fontSize: 18, fontFamily: CD.font.family },
  noi_dung_modal: { padding: 28 },
  thong_tin_hanh_chinh: {
    backgroundColor: CD.bg.glass_card, padding: 22, borderRadius: 14, marginBottom: 24,
    borderLeftWidth: 4, borderLeftColor: CD.brand.mauChinh,
    borderWidth: 1, borderColor: CD.border.glass,
    ...Platform.select({ web: { backdropFilter: CD.web.blur_card, WebkitBackdropFilter: CD.web.blur_card, boxShadow: CD.web.shadow_card } }),
  },
  phan_muc: { marginBottom: 28 },
  tieu_de_muc: {
    fontFamily: CD.font.family, fontSize: 22, fontWeight: '800', color: CD.brand.mauNhat,
    paddingBottom: 10, marginBottom: 16,
    borderBottomWidth: 1, borderColor: CD.border.glass,
  },
  dong_chi_tiet: { marginBottom: 12, paddingLeft: 8 },
  dong_nhat_ky: {
    marginBottom: 12, padding: 14,
    backgroundColor: CD.bg.glass_card,
    borderRadius: 10, borderWidth: 1, borderColor: CD.border.glass,
  },
  chu_dam: { fontWeight: '700', color: CD.text.primary },
  chu_thuong: { fontFamily: CD.font.family, fontSize: 20, color: CD.text.table_cell, lineHeight: 30 },
  chu_nho: { fontFamily: CD.font.family, fontSize: 18, color: CD.text.muted, fontStyle: 'italic', marginTop: 4 },

  khu_vuc_trich_dan: {
    padding: 16,
    backgroundColor: CD.bg.glass_card,
    borderTopWidth: 1, borderTopColor: CD.border.divider,
  },
  van_ban_trich_dan: { fontFamily: CD.font.family, fontSize: 16, color: CD.text.muted, fontStyle: 'italic' },
});

export default ManHinhKhoLuuTru;
