/**
 * ============================================================
 * FILE: dieu_huong/tuyen_duong.jsx (PHIÊN BẢN 4.0 - CHUẨN JCI)
 * CHỨC NĂNG: Quản lý toàn bộ lộ trình di chuyển trong ứng dụng CDSS.
 * CẬP NHẬT: Tích hợp Hệ thống Danh mục dùng chung Bộ Y tế (QĐ 7603 & QĐ 3276)
 * ============================================================
 */

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ChuDeProvider } from '../tien_ich/chu_de_giao_dien';

// 1. NHÓM MÀN HÌNH HỆ THỐNG & TỔNG QUAN
import ManHinhDangNhap from '../man_hinh/dang_nhap';
import ManHinhKhoLuuTru from '../man_hinh/man_hinh_kho_luu_tru';
import ManHinhPhanQuyen from '../man_hinh/phan_quyen_truy_cap';
import ManHinhTongQuan from '../man_hinh/tong_quan';

// 2. NHÓM MÀN HÌNH GIÁM ĐỊNH & CHI TIẾT HỒ SƠ
import ManHinhChiTiet from '../man_hinh/chi_tiet_ca_benh';
import ManHinhDocXML from '../man_hinh/doc_file_xml';
import SuaFileXML from '../man_hinh/sua_file_xml';

// 3. NHÓM MÀN HÌNH QUẢN TRỊ DANH MỤC & QUY TẮC
import DanhMucBYTMain from '../danh_muc_byt/danh_muc_7603_main'; // KẾT NỐI MODULE 12 PHỤ LỤC BYT
import ManHinhQuanLyDanhMuc from '../man_hinh/quan_ly_danh_muc';
import ManHinhQuanLyLuat from '../man_hinh/quan_ly_luat';

// 4. NHÓM MÀN HÌNH XML CHI TIẾT (QĐ 130)
import ManHinhXML1 from '../man_hinh/quan_ly_xml1_130';
import ManHinhXML2 from '../man_hinh/quan_ly_xml2_thuoc';
import ManHinhXML3 from '../man_hinh/quan_ly_xml3';
import ManHinhXML4 from '../man_hinh/quan_ly_xml4';
import ManHinhXML5 from '../man_hinh/quan_ly_xml5';
import ManHinhXML6 from '../man_hinh/quan_ly_xml6';

// 5. NHÓM CHUYÊN MÔN (PHÁC ĐỒ - QUY TRÌNH)
import QuanLyChuyenMon from '../man_hinh/quan_ly_chuyen_mon';

const Stack = createNativeStackNavigator();

// Cấu hình Deep Linking để ứng dụng chạy mượt trên Web và Mobile
const cauHinhLienKet = {
  prefixes: ['http://localhost', 'phuongchau://'],
  config: {
    screens: {
      DangNhap: 'login',
      TongQuan: 'dashboard',
      DocXML: 'auditing',
      ChiTiet: 'case-detail/:maLK',
      KhoLuuTru: 'archive',
      QuanLyLuat: 'rules',
      QuanLyDanhMuc: 'master-data',
      DanhMucBYTMain: 'danh-muc-byt', // Path cho Danh mục Bộ Y tế
      PhanQuyenTruyCap: 'permissions',
      QuanLyChuyenMon: 'clinical-guidelines',
    },
  },
};

const DieuHuongChinh = () => {
  return (
    <ChuDeProvider>
    <NavigationContainer linking={cauHinhLienKet}>
      <Stack.Navigator 
        initialRouteName="DangNhap" 
        screenOptions={{ 
          headerShown: false, // Sử dụng Header tùy biến của Phương Châu
          animation: 'slide_from_right', 
          gestureEnabled: true 
        }}
      >
        {/* --- PHÂN HỆ TRUY CẬP & HỆ THỐNG --- */}
        <Stack.Screen name="DangNhap" component={ManHinhDangNhap} />
        <Stack.Screen name="TongQuan" component={ManHinhTongQuan} />
        <Stack.Screen name="PhanQuyenTruyCap" component={ManHinhPhanQuyen} />
        
        {/* --- PHÂN HỆ GIÁM ĐỊNH LÂM SÀNG --- */}
        <Stack.Screen name="DocXML" component={ManHinhDocXML} />
        <Stack.Screen name="ChiTiet" component={ManHinhChiTiet} />
        <Stack.Screen name="SuaFileXML" component={SuaFileXML} />
        <Stack.Screen name="KhoLuuTru" component={ManHinhKhoLuuTru} />
        
        {/* --- PHÂN HỆ QUẢN TRỊ DỮ LIỆU & DANH MỤC --- */}
        <Stack.Screen name="QuanLyLuat" component={ManHinhQuanLyLuat} />
        <Stack.Screen name="QuanLyDanhMuc" component={ManHinhQuanLyDanhMuc} />
        <Stack.Screen name="DanhMucBYTMain" component={DanhMucBYTMain} /> 
        <Stack.Screen name="QuanLyChuyenMon" component={QuanLyChuyenMon} />

        {/* --- PHÂN HỆ XML CHI TIẾT (CHUẨN QĐ 130/BYT) --- */}
        <Stack.Screen name="XML1" component={ManHinhXML1} />
        <Stack.Screen name="XML2" component={ManHinhXML2} />
        <Stack.Screen name="XML3" component={ManHinhXML3} />
        <Stack.Screen name="XML4" component={ManHinhXML4} />
        <Stack.Screen name="XML5" component={ManHinhXML5} />
        <Stack.Screen name="XML6" component={ManHinhXML6} />

      </Stack.Navigator>
    </NavigationContainer>
    </ChuDeProvider>
  );
};

export default DieuHuongChinh;