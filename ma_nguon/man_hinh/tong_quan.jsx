/**
 * PHÂN HỆ: DASHBOARD TỔNG QUAN & QUẢN TRỊ GIÁM ĐỊNH (MASTER CONTROL)
 * Nâng cấp (Bản 8.9 - Chống Crash QuotaExceededError): 
 * 1. FIX BIG DATA: Đã kết nối thành công với Module KHO_LUU_TRU để dùng chung Chunking.
 * 2. GIẢI QUYẾT: Dùng chung luồng lưu trữ chuẩn từ tien_ich_kho.
 * 3. UI HEADER: Chữ to gấp 3 lần, canh giữa toàn màn hình, logo kề bên.
 * 4. LOGIC: Tích hợp công cụ xuất thẳng XML ra Excel.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { BoChonChuDe, CD } from '../tien_ich/chu_de_giao_dien';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as XLSX from 'xlsx';

// [CẬP NHẬT LÕI]: Thống nhất dùng kho_du_lieu để đồng bộ với man_hinh_kho_luu_tru
import { layTatCaHoSoTuKho, luuHoSoVaoKho, xoaToanBoKho } from '../tien_ich/kho_du_lieu';
import { chayBoMayGiamDinhV3 } from '../tien_ich/dong_co_giam_dinh';
import NhapFileXML from '../tien_ich/nhap_file_xml';

const LOGO_PC = 'https://i.ibb.co/nNr9SQYr/logo-pc.png';

// =======================================================
// HÀM TIỆN ÍCH LÕI 
// =======================================================
const layGiaTriAnToan = (obj, tuKhoa) => {
    if (!obj) return 'N/A';
    const tuKhoaChuan = tuKhoa.toLowerCase().replace(/_/g, '');
    const keyTimThay = Object.keys(obj).find(k => k.toLowerCase().replace(/_/g, '') === tuKhoaChuan);
    return keyTimThay && obj[keyTimThay] ? obj[keyTimThay] : 'N/A';
};

const decodeBase64UTF8 = (base64Str) => {
    try {
        const binaryString = window.atob(base64Str);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
        return new TextDecoder('utf-8').decode(bytes);
    } catch (e) {
        try { return decodeURIComponent(escape(window.atob(base64Str))); } 
        catch (err) { return window.atob(base64Str); }
    }
};

const parseXMLToJSON = (xmlString) => {
    const result = {}; 
    const regexHoSo = /<LOAIHOSO>(.*?)<\/LOAIHOSO>[\s\S]*?<NOIDUNGFILE>(.*?)<\/NOIDUNGFILE>/gi;
    let matchHoSo;
    let coDuLieuBaoLanh = false;

    while ((matchHoSo = regexHoSo.exec(xmlString)) !== null) {
        coDuLieuBaoLanh = true;
        const loaiXML = matchHoSo[1].trim().toUpperCase(); 
        const base64Data = matchHoSo[2].trim();
        const innerXML = decodeBase64UTF8(base64Data);
        
        const cleanXML = innerXML.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1');
        const leafRegex = /<([A-Z0-9_]+)>([^<]*)<\/\1>/g;

        if (!result[loaiXML]) result[loaiXML] = [];

        if (loaiXML === 'XML1') {
            const record = {};
            let matchField;
            while ((matchField = leafRegex.exec(cleanXML)) !== null) record[matchField[1]] = matchField[2].trim();
            if (Object.keys(record).length > 0) result.XML1.push(record);
        } else {
            const blockRegex = /<(CHI_TIET[A-Z0-9_]*|CHITIET[A-Z0-9_]*)>([\s\S]*?)<\/\1>/gi;
            let matchBlock;
            while ((matchBlock = blockRegex.exec(cleanXML)) !== null) {
                const blockContent = matchBlock[2]; 
                const record = {};
                let matchField;
                while ((matchField = leafRegex.exec(blockContent)) !== null) record[matchField[1]] = matchField[2].trim();
                if (Object.keys(record).length > 0) result[loaiXML].push(record);
            }
        }
    }
    if (!coDuLieuBaoLanh) throw new Error("Không tìm thấy định dạng chuẩn QĐ130.");
    return result;
};


const ManHinhTongQuan = ({ navigation }) => {
  const [dangTai, setDangTai] = useState(false);
  const [thongKe, setThongKe] = useState({ tong: 0, sach: 0, loi: 0, giamDinhLai: 0, danhMuc: [] });
  const [rawDanhSach, setRawDanhSach] = useState([]); 
  
  const [menuHienThi, setMenuHienThi] = useState([]);
  const [vaiTroHienTai, setVaiTroHienTai] = useState('Đang tải...');
  const [tenTaiKhoan, setTenTaiKhoan] = useState('');

  const [xungDotDuLieu, setXungDotDuLieu] = useState(null);

  const tatCaModules = [
    { id: 'MOD_CONG_HIS', route: 'CongHIS', ten: '🔌 KẾT NỐI HIS' },
    { id: 'MOD_KHO_LUU_TRU', route: 'KhoLuuTru', ten: '🗄️ KHO LƯU TRỮ' },
    { id: 'MOD_XML_GIAM_DINH', route: 'DocXML', ten: '🗂️ ĐỌC XML' },
    { id: 'MOD_CHUYEN_MON', route: 'QuanLyChuyenMon', ten: '🧠 CHUYÊN MÔN' },
    { id: 'MOD_DANH_MUC', route: 'QuanLyDanhMuc', ten: '📋 DM NỘI BỘ' },
    { id: 'MOD_DANH_MUC_BYT', route: 'DanhMucBYTMain', ten: '🏥 DM BỘ Y TẾ' },
    { id: 'MOD_QUAN_LY_LUAT', route: 'QuanLyLuat', ten: '⚙️ LUẬT BHYT' },
    { id: 'MOD_ACL', route: 'PhanQuyenTruyCap', ten: '🔐 PHÂN QUYỀN', adminOnly: true }
  ];

  const fetchThongTinHeThong = async () => {
    try {
      // [CẬP NHẬT LÕI]: Dùng hàm chuẩn để tải từ Kho hệ thống
      const danhSach = await layTatCaHoSoTuKho();
      if (danhSach && danhSach.length > 0) {
        setRawDanhSach(danhSach);
        tinhToanDashboard(danhSach);
      }

      const role = await AsyncStorage.getItem('USER_ROLE');
      const account = await AsyncStorage.getItem('USER_ACCOUNT');
      const realRole = role || 'USER'; 
      const realAccount = account || 'Chưa xác định';
      
      setVaiTroHienTai(realRole); 
      setTenTaiKhoan(realAccount);

      const aclConfigRaw = await AsyncStorage.getItem(`ACL_USER_${realAccount}`);
      let config = [];
      if (aclConfigRaw) config = JSON.parse(aclConfigRaw);

      const menuLoc = tatCaModules.filter(item => {
        if (realRole === 'ADMIN') return true; 
        if (item.adminOnly) return false;      
        const ruleMatch = config.find(c => c.id === item.id);
        if (ruleMatch) return ruleMatch.quyen === true; 
        return false; 
      });

      setMenuHienThi(menuLoc);
    } catch (e) {
      console.error("Lỗi tải phân quyền:", e);
    }
  };

  useEffect(() => {
    fetchThongTinHeThong();
    const unsubscribe = navigation.addListener('focus', () => fetchThongTinHeThong());
    return unsubscribe;
  }, [navigation]);

  const tinhToanDashboard = (danhSachHoSo) => {
    let tongSo = danhSachHoSo.length;
    let soLoi = 0;
    let tongGiamDinhLai = 0;
    let dictLoi = {};

    danhSachHoSo.forEach(hoSo => {
      tongGiamDinhLai += hoSo.giam_dinh_lai || 0;

      const dsLoi = hoSo.ket_qua_giam_dinh || [];
      if (dsLoi.length > 0) {
        soLoi++;
        dsLoi.forEach(l => {
          const maLuat = layGiaTriAnToan(l, 'maluat');
          const tenQuyTac = layGiaTriAnToan(l, 'tenquytac');
          const canhBao = layGiaTriAnToan(l, 'canhbao');
          const key = (maLuat !== 'N/A') ? maLuat : canhBao;

          if (!dictLoi[key]) {
              dictLoi[key] = { ma_luat: maLuat, ten_quy_tac: tenQuyTac, dieu_kien: layGiaTriAnToan(l, 'dieukien'), canh_bao: canhBao, sl: 0 };
          }
          dictLoi[key].sl += 1;
        });
      }
    });

    const mangLoi = Object.values(dictLoi).sort((a,b) => b.sl - a.sl);
    setThongKe({ tong: tongSo, sach: tongSo - soLoi, loi: soLoi, giamDinhLai: tongGiamDinhLai, danhMuc: mangLoi });
  };

  const nhanDienHoSoTuFile = async (danhSachHoSoTuFile) => {
    // [CẬP NHẬT LÕI]: Quét các mã đã có trên KHO LƯU TRỮ
    const khoHienTai = await layTatCaHoSoTuKho();
    const dsMaLKSanCo = new Set(khoHienTai.map(hs => hs.ma_lk));

    const hoSoMoi = [];
    const hoSoTrung = [];

    danhSachHoSoTuFile.forEach(hs => {
        const ma = hs.xml1?.MA_LK;
        if (dsMaLKSanCo.has(ma)) hoSoTrung.push(hs);
        else hoSoMoi.push(hs);
    });

    if (hoSoTrung.length > 0) {
        setXungDotDuLieu({ hoSoMoi, hoSoTrung, khoHienTai });
    } else {
        tienHanhGiamDinh(hoSoMoi, khoHienTai);
    }
  };

  const tienHanhGiamDinh = async (danhSachTienHanh, khoGoc) => {
    setDangTai(true);
    setXungDotDuLieu(null);
    
    try {
      const danhSachLuuKho = [];

      for (const hoSo of danhSachTienHanh) {
        const ketQua = await chayBoMayGiamDinhV3(hoSo);
        
        // Gắn kết quả giám định vào hồ sơ để truyền qua Kho Lưu Trữ
        hoSo.ket_qua_giam_dinh = ketQua;
        danhSachLuuKho.push(hoSo);
      }

      // [CẬP NHẬT LÕI MẠNH MẼ NHẤT]: Gửi thẳng danh sách đã giám định vào hàm luuHoSoVaoKho chuẩn
      const ketQuaLuu = await luuHoSoVaoKho(danhSachLuuKho);
      if (ketQuaLuu) {
        fetchThongTinHeThong();
      } else {
        alert("Lỗi lưu trữ: Không thể lưu hồ sơ vào kho. Vui lòng thử lại.");
      }

    } catch (err) {
      alert("Lỗi xử lý giám định.");
      console.error(err);
    } finally {
      setDangTai(false);
    }
  };

  const handleGhiDeHangLoat = () => {
    const tatCaHoSo = [...xungDotDuLieu.hoSoMoi, ...xungDotDuLieu.hoSoTrung];
    tienHanhGiamDinh(tatCaHoSo, xungDotDuLieu.khoHienTai);
  };

  const handleTuChoiHangLoat = () => {
    if (xungDotDuLieu.hoSoMoi.length > 0) {
        tienHanhGiamDinh(xungDotDuLieu.hoSoMoi, xungDotDuLieu.khoHienTai);
    } else {
        setXungDotDuLieu(null);
    }
  };

  const handleXoaHangLoat = async () => {
    setDangTai(true);
    // Tính năng này hơi mạo hiểm, để an toàn nên nạp lại ca mới
    if (xungDotDuLieu.hoSoMoi.length > 0) {
        tienHanhGiamDinh(xungDotDuLieu.hoSoMoi, xungDotDuLieu.khoHienTai);
    } else {
        setXungDotDuLieu(null);
        setDangTai(false);
    }
  };

  const handleResetKho = async () => {
    if (confirm("Làm mới màn hình Giám định? (Dữ liệu trong Kho lưu trữ vĩnh viễn sẽ bị XÓA SẠCH).")) {
      await xoaToanBoKho(); // Gọi lệnh diệt tận gốc từ module Kho
      setThongKe({ tong: 0, sach: 0, loi: 0, giamDinhLai: 0, danhMuc: [] });
      setRawDanhSach([]);
    }
  };

  // =======================================================
  // TIỆN ÍCH: CHUYỂN XML SANG EXCEL
  // =======================================================
  const handleConvertXmlToExcel = () => {
    if (Platform.OS !== 'web') {
        alert("Tính năng này chỉ hỗ trợ trên trình duyệt Web.");
        return;
    }
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xml';
    
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setDangTai(true);

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const xmlContent = event.target.result;
                const parsedData = parseXMLToJSON(xmlContent);

                const wb = XLSX.utils.book_new();
                let hasData = false;

                Object.keys(parsedData).forEach(sheetName => {
                    if (parsedData[sheetName] && parsedData[sheetName].length > 0) {
                        const ws = XLSX.utils.json_to_sheet(parsedData[sheetName]);
                        XLSX.utils.book_append_sheet(wb, ws, sheetName.toLowerCase());
                        hasData = true;
                    }
                });

                if (!hasData) {
                    alert("File XML hợp lệ nhưng không chứa dữ liệu chi tiết.");
                    setDangTai(false);
                    return;
                }

                const exportFileName = `Data_BHYT_${file.name.replace('.xml', '')}.xlsx`;
                XLSX.writeFile(wb, exportFileName);
                alert('✅ Xuất file Excel thành công!');
            } catch (error) {
                console.error("Lỗi xử lý file XML:", error);
                alert(`Có lỗi xảy ra: ${error.message}`);
            } finally {
                setDangTai(false);
            }
        };
        
        reader.onerror = () => {
            alert("Không thể đọc file XML. Vui lòng thử lại.");
            setDangTai(false);
        };

        reader.readAsText(file);
    };

    input.click();
  };

  const handleExportLoiExcel = () => {
    if (Platform.OS !== 'web') return;
    if (rawDanhSach.length === 0) return;
    const excelData = [];
    rawDanhSach.forEach(hs => {
      const dsLoi = hs.ket_qua_giam_dinh || [];
      dsLoi.forEach(loi => {
        excelData.push({
          "Mã LK": hs.ma_lk, "Tên Bệnh Nhân": hs.ten_bn || hs.ten_benh_nhan || hs.xml1?.HO_TEN,
          "Mã Luật": layGiaTriAnToan(loi, 'maluat'),
          "Quy Tắc": layGiaTriAnToan(loi, 'tenquytac'),
          "Cảnh Báo": layGiaTriAnToan(loi, 'canhbao')
        });
      });
    });
    if (excelData.length === 0) return;
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "DS_Loi");
    XLSX.writeFile(wb, `Bao_Cao_Vi_Pham_${Date.now()}.xlsx`);
  };

  const xuLyDangXuat = async () => {
    await AsyncStorage.removeItem('USER_ROLE');
    await AsyncStorage.removeItem('USER_ACCOUNT');
    navigation.replace('DangNhap');
  };

  // ===========================================================
  // RENDER MODULE CARDS (lưới điều hướng)
  // ===========================================================
  const MODULE_ICONS = {
    MOD_CONG_HIS: { icon: '🔌', mau: '#1565C0', mauNhat: '#E3F2FD' },
    MOD_KHO_LUU_TRU: { icon: '🗄️', mau: '#6A1B9A', mauNhat: '#F3E5F5' },
    MOD_XML_GIAM_DINH: { icon: '🗂️', mau: '#00695C', mauNhat: '#E0F2F1' },
    MOD_CHUYEN_MON: { icon: '🧠', mau: '#E65100', mauNhat: '#FFF3E0' },
    MOD_DANH_MUC: { icon: '📋', mau: '#558B2F', mauNhat: '#F1F8E9' },
    MOD_DANH_MUC_BYT: { icon: '🏥', mau: '#0277BD', mauNhat: '#E1F5FE' },
    MOD_QUAN_LY_LUAT: { icon: '⚙️', mau: '#AD1457', mauNhat: '#FCE4EC' },
    MOD_ACL: { icon: '🔐', mau: '#4E342E', mauNhat: '#EFEBE9' },
  };

  const phanTramLoi = thongKe.tong > 0 ? Math.round((thongKe.loi / thongKe.tong) * 100) : 0;

  return (
    <SafeAreaView style={styles.vung_an_toan}>

      {/* ── 1. HEADER GRADIENT ── */}
      <View style={styles.header}>
        <View style={styles.header_left}>
          <Image source={{ uri: LOGO_PC }} style={styles.logo} resizeMode="contain" />
          <View>
            <Text style={styles.header_ten_bv}>BỆNH VIỆN QUỐC TẾ PHƯƠNG CHÂU</Text>
            <Text style={styles.header_sub}>Hệ thống hỗ trợ kiểm tra hồ sơ BHYT · QĐ 130</Text>
          </View>
        </View>
        <View style={styles.header_right}>
          <View style={styles.user_badge}>
            <Text style={styles.user_badge_icon}>👤</Text>
            <View>
              <Text style={styles.user_badge_name}>{tenTaiKhoan || 'Chưa đăng nhập'}</Text>
              <Text style={[styles.user_badge_role, vaiTroHienTai === 'ADMIN' && { color: '#FFD54F' }]}>
                {vaiTroHienTai}
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.btn_logout} onPress={xuLyDangXuat}>
            <Text style={styles.btn_logout_txt}>⏻ Đăng xuất</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>

        {/* ── 2. KPI CARDS ── */}
        <View style={styles.kpi_row}>
          {[
            { label: 'Tổng hồ sơ', value: thongKe.tong, icon: '📁', mau: '#1565C0', mauNhat: '#E3F2FD', mauIcon: '#1976D2' },
            { label: 'Hợp lệ', value: thongKe.sach, icon: '✅', mau: '#2E7D32', mauNhat: '#E8F5E9', mauIcon: '#388E3C' },
            { label: 'Có lỗi', value: thongKe.loi, icon: '⚠️', mau: '#C62828', mauNhat: '#FFEBEE', mauIcon: '#D32F2F' },
            { label: 'Tỉ lệ lỗi', value: `${phanTramLoi}%`, icon: '📊', mau: '#E65100', mauNhat: '#FFF3E0', mauIcon: '#F57C00' },
          ].map((kpi, i) => (
            <View key={i} style={[styles.kpi_card, { borderTopColor: kpi.mau }]}>
              <View style={[styles.kpi_icon_wrap, { backgroundColor: kpi.mauNhat }]}>
                <Text style={styles.kpi_icon}>{kpi.icon}</Text>
              </View>
              <Text style={[styles.kpi_value, { color: kpi.mau }]}>{kpi.value}</Text>
              <Text style={styles.kpi_label}>{kpi.label}</Text>
            </View>
          ))}
        </View>

        {/* ── 3. LƯỚI ĐIỀU HƯỚNG MODULE ── */}
        <View style={styles.section_block}>
          <Text style={styles.section_title}>📌 Phân hệ chức năng</Text>
          <View style={styles.module_grid}>
            {menuHienThi.map((item) => {
              const cfg = MODULE_ICONS[item.id] || { icon: '📦', mau: '#607D8B', mauNhat: '#ECEFF1' };
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.module_card, { borderLeftColor: cfg.mau }]}
                  onPress={() => navigation.navigate(item.route)}
                >
                  <View style={[styles.module_icon_wrap, { backgroundColor: cfg.mauNhat }]}>
                    <Text style={styles.module_icon}>{cfg.icon}</Text>
                  </View>
                  <Text style={[styles.module_name, { color: cfg.mau }]}>{item.ten}</Text>
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity
              style={[styles.module_card, { borderLeftColor: '#546E7A' }]}
              onPress={handleResetKho}
            >
              <View style={[styles.module_icon_wrap, { backgroundColor: '#ECEFF1' }]}>
                <Text style={styles.module_icon}>🔄</Text>
              </View>
              <Text style={[styles.module_name, { color: '#546E7A' }]}>Làm mới kho</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── 4. KHU VỰC IMPORT & XUNG ĐỘT ── */}
        <View style={styles.section_block}>
          <Text style={styles.section_title}>📥 Nạp hồ sơ XML</Text>
          {xungDotDuLieu ? (
            <View style={styles.conflict_card}>
              <View style={styles.conflict_header}>
                <Text style={styles.conflict_title}>
                  ⚠️ {xungDotDuLieu.hoSoTrung.length} hồ sơ trùng đã được giám định trước
                </Text>
              </View>
              <View style={styles.conflict_btns}>
                <TouchableOpacity style={[styles.conflict_btn, { backgroundColor: '#0288D1' }]} onPress={handleGhiDeHangLoat}>
                  <Text style={styles.conflict_btn_txt}>Ghi đè ({xungDotDuLieu.hoSoTrung.length})</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.conflict_btn, { backgroundColor: '#F57C00' }]} onPress={handleTuChoiHangLoat}>
                  <Text style={styles.conflict_btn_txt}>Bỏ qua trùng</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.conflict_btn, { backgroundColor: '#D32F2F' }]} onPress={handleXoaHangLoat}>
                  <Text style={styles.conflict_btn_txt}>Xóa ca trùng</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.import_zone}>
              {dangTai ? (
                <View style={styles.loading_wrap}>
                  <ActivityIndicator size="large" color="#D81B60" />
                  <Text style={styles.loading_txt}>Đang giám định hồ sơ...</Text>
                </View>
              ) : (
                <View style={styles.import_inner}>
                  <NhapFileXML onDuLieuSanSang={nhanDienHoSoTuFile} />
                </View>
              )}
            </View>
          )}
        </View>

        {/* ── 5. BẢNG VI PHẠM QPS ── */}
        <View style={[styles.section_block, { marginBottom: 30 }]}>
          <View style={styles.workspace_header}>
            <Text style={styles.section_title}>📉 Danh mục vi phạm phát hiện (QPS)</Text>
            <View style={styles.export_btns}>
              <TouchableOpacity style={[styles.btn_export, { backgroundColor: '#0277BD' }]} onPress={handleConvertXmlToExcel}>
                <Text style={styles.btn_export_txt}>🔄 XML → Excel</Text>
              </TouchableOpacity>
              {thongKe.danhMuc.length > 0 && (
                <TouchableOpacity style={[styles.btn_export, { backgroundColor: '#2E7D32' }]} onPress={handleExportLoiExcel}>
                  <Text style={styles.btn_export_txt}>📥 Xuất báo cáo</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View style={styles.table_card}>
            {/* Header bảng */}
            <View style={styles.table_head_row}>
              <Text style={[styles.th, { flex: 1 }]}>QUY TẮC & MÔ TẢ</Text>
              <Text style={[styles.th, { width: 110, textAlign: 'center' }]}>SỐ CA</Text>
            </View>
            {/* Rows */}
            {thongKe.danhMuc.length > 0 ? thongKe.danhMuc.map((item, idx) => (
              <View key={idx} style={[styles.table_row, idx % 2 === 1 && styles.table_row_alt]}>
                <View style={{ flex: 1, paddingRight: 12 }}>
                  <View style={styles.rule_tag_row}>
                    <View style={styles.rule_code_chip}>
                      <Text style={styles.rule_code_txt}>{item.ma_luat || 'N/A'}</Text>
                    </View>
                    <Text style={styles.rule_name} numberOfLines={1}>{item.ten_quy_tac}</Text>
                  </View>
                  <Text style={styles.rule_desc} numberOfLines={2}>{item.canh_bao}</Text>
                </View>
                <View style={{ width: 110, alignItems: 'center' }}>
                  <View style={[styles.count_badge, item.sl >= 10 && styles.count_badge_hot]}>
                    <Text style={styles.count_txt}>{item.sl}</Text>
                    <Text style={styles.count_sub}>ca</Text>
                  </View>
                </View>
              </View>
            )) : (
              <View style={styles.empty_state}>
                <Text style={styles.empty_icon}>📂</Text>
                <Text style={styles.empty_title}>Chưa có dữ liệu vi phạm</Text>
                <Text style={styles.empty_sub}>Nạp hồ sơ XML để hệ thống tiến hành kiểm tra</Text>
              </View>
            )}
          </View>
        </View>

        {/* ── 6. CHỦ ĐỀ GIAO DIỆN ── */}
        <BoChonChuDe style={{ margin: 16, marginBottom: 32 }} />

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  vung_an_toan: {
    flex: 1,
    ...Platform.select({ web: { background: CD.web.gradient_bg } }),
    backgroundColor: CD.bg.gradient_mobile,
  },

  // ── HEADER ──
  header: {
    ...Platform.select({
      web: {
        background: CD.web.gradient_header,
        backdropFilter: CD.web.blur_header,
        WebkitBackdropFilter: CD.web.blur_header,
        boxShadow: CD.web.shadow_header,
      },
    }),
    backgroundColor: CD.brand.mauDam,
    borderBottomWidth: 1, borderBottomColor: CD.border.header,
    paddingHorizontal: 24, paddingVertical: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  header_left: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  logo: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#FFF', borderWidth: 2, borderColor: 'rgba(255,255,255,0.5)' },
  header_ten_bv: { fontSize: 26, fontWeight: '900', color: '#FFF', fontFamily: CD.font.family, letterSpacing: 0.5 },
  header_sub: { fontSize: 16, color: 'rgba(255,255,255,0.75)', fontFamily: CD.font.family, marginTop: 2 },
  header_right: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  user_badge: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingVertical: 8, paddingHorizontal: 14, borderRadius: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
  },
  user_badge_icon: { fontSize: 22 },
  user_badge_name: { fontSize: 17, fontWeight: '700', color: '#FFF', fontFamily: CD.font.family },
  user_badge_role: { fontSize: 14, color: 'rgba(255,255,255,0.7)', fontFamily: CD.font.family },
  btn_logout: {
    paddingVertical: 8, paddingHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 10,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
    ...Platform.select({ web: { backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', cursor: 'pointer' } }),
  },
  btn_logout_txt: { fontSize: 16, color: '#FFF', fontWeight: '600', fontFamily: CD.font.family },

  // ── KPI CARDS ──
  kpi_row: {
    flexDirection: 'row', gap: 16,
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8,
  },
  kpi_card: {
    flex: 1,
    backgroundColor: CD.bg.glass_card,
    borderRadius: 20,
    padding: 20, alignItems: 'center',
    borderTopWidth: 4,
    borderWidth: 1, borderColor: CD.border.glass,
    ...Platform.select({ web: { backdropFilter: CD.web.blur_card, WebkitBackdropFilter: CD.web.blur_card, boxShadow: CD.web.shadow_card } }),
  },
  kpi_icon_wrap: { width: 52, height: 52, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  kpi_icon: { fontSize: 26 },
  kpi_value: { fontSize: 32, fontWeight: '900', fontFamily: CD.font.family },
  kpi_label: { fontSize: 16, color: CD.text.secondary, marginTop: 4, fontFamily: CD.font.family, textAlign: 'center' },

  // ── SECTIONS ──
  section_block: { marginHorizontal: 20, marginTop: 20 },
  section_title: { fontSize: 20, fontWeight: '800', color: CD.text.primary, fontFamily: CD.font.family, marginBottom: 14 },

  // ── MODULE GRID ──
  module_grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  module_card: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: CD.bg.glass_card,
    borderRadius: 14,
    paddingVertical: 14, paddingHorizontal: 18,
    borderLeftWidth: 4,
    borderWidth: 1, borderColor: CD.border.glass,
    minWidth: 200, flex: 1,
    ...Platform.select({ web: { backdropFilter: CD.web.blur_card, WebkitBackdropFilter: CD.web.blur_card, boxShadow: CD.web.shadow_card, cursor: 'pointer' } }),
  },
  module_icon_wrap: { width: 42, height: 42, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  module_icon: { fontSize: 22 },
  module_name: { fontSize: 18, fontWeight: '700', fontFamily: CD.font.family, flex: 1, color: CD.text.secondary },

  // ── IMPORT ZONE ──
  import_zone: {
    backgroundColor: CD.bg.glass_card,
    borderRadius: 20,
    padding: 24, alignItems: 'center',
    borderWidth: 1, borderColor: CD.border.glass,
    ...Platform.select({ web: { backdropFilter: CD.web.blur_card, WebkitBackdropFilter: CD.web.blur_card, boxShadow: CD.web.shadow_card } }),
  },
  import_inner: { width: '50%', alignSelf: 'center' },
  loading_wrap: { alignItems: 'center', gap: 12 },
  loading_txt: { fontSize: 20, color: CD.brand.mauChinh, fontWeight: '600', fontFamily: CD.font.family },

  // ── CONFLICT CARD ──
  conflict_card: {
    backgroundColor: CD.severity.error.bg,
    borderRadius: 20, overflow: 'hidden',
    borderWidth: 1, borderColor: CD.severity.error.border,
    ...Platform.select({ web: { backdropFilter: CD.web.blur_card, WebkitBackdropFilter: CD.web.blur_card } }),
  },
  conflict_header: { backgroundColor: CD.severity.error.bg, padding: 14, borderBottomWidth: 1, borderBottomColor: CD.severity.error.border },
  conflict_title: { fontSize: 18, fontWeight: '700', color: CD.severity.error.text, fontFamily: CD.font.family },
  conflict_btns: { flexDirection: 'row', gap: 10, padding: 14, flexWrap: 'wrap' },
  conflict_btn: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10 },
  conflict_btn_txt: { color: '#FFF', fontWeight: '700', fontSize: 17, fontFamily: CD.font.family },

  // ── WORKSPACE & EXPORT ──
  workspace_header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  export_btns: { flexDirection: 'row', gap: 10 },
  btn_export: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10 },
  btn_export_txt: { color: '#FFF', fontWeight: '700', fontSize: 16, fontFamily: CD.font.family },

  // ── BẢNG VI PHẠM ──
  table_card: {
    backgroundColor: CD.bg.glass_card,
    borderRadius: 20, overflow: 'hidden',
    borderWidth: 1, borderColor: CD.border.glass,
    ...Platform.select({ web: { backdropFilter: CD.web.blur_card, WebkitBackdropFilter: CD.web.blur_card, boxShadow: CD.web.shadow_card } }),
  },
  table_head_row: {
    flexDirection: 'row', paddingVertical: 16, paddingHorizontal: 20,
    backgroundColor: CD.bg.table_header, borderBottomWidth: 1, borderBottomColor: CD.border.glass,
  },
  th: { fontSize: 20, fontWeight: '700', color: '#FFFFFF', fontFamily: CD.font.family },
  table_row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: CD.border.divider },
  table_row_alt: { backgroundColor: CD.bg.table_row_even },
  rule_tag_row: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
  rule_code_chip: {
    backgroundColor: CD.severity.info.bg,
    borderWidth: 1, borderColor: CD.severity.info.border,
    borderRadius: 8, paddingVertical: 3, paddingHorizontal: 10,
  },
  rule_code_txt: { fontSize: 14, fontWeight: '800', color: CD.text.link, fontFamily: CD.font.family },
  rule_name: { fontSize: 17, fontWeight: '700', color: CD.text.table_cell, fontFamily: CD.font.family, flex: 1 },
  rule_desc: { fontSize: 15, color: CD.text.secondary, fontFamily: CD.font.family, lineHeight: 22 },
  count_badge: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: CD.severity.critical.bg, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: CD.severity.critical.border,
  },
  count_badge_hot: { backgroundColor: 'rgba(211,47,47,0.4)', borderColor: 'rgba(244,67,54,0.7)' },
  count_txt: { fontSize: 22, fontWeight: '900', color: CD.severity.critical.text, fontFamily: CD.font.family, lineHeight: 24 },
  count_sub: { fontSize: 12, color: CD.severity.critical.text, fontFamily: CD.font.family },

  empty_state: {
    padding: 50, alignItems: 'center',
    backgroundColor: CD.bg.glass_card,
    borderRadius: 16, margin: 16,
    borderWidth: 1, borderColor: CD.border.glass,
  },
  empty_icon: { fontSize: 56, marginBottom: 16 },
  empty_title: { fontSize: 22, fontWeight: '700', color: CD.text.secondary, fontFamily: CD.font.family, marginBottom: 8 },
  empty_sub: { fontSize: 18, color: CD.text.muted, fontFamily: CD.font.family, textAlign: 'center' },
});

export default ManHinhTongQuan;