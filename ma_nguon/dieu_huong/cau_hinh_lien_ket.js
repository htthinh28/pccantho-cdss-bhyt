/**
 * Cấu hình deep linking — dùng chung NavigationContainer và mở tab mới trên web.
 * Giữ khớp với Stack.Screen trong tuyen_duong.jsx.
 */
export const CAU_HINH_LIEN_KET = {
  prefixes: ['http://localhost', 'https://cdssbhyt.vercel.app', 'phuongchau://'],
  config: {
    screens: {
      DangNhap: 'login',
      DoiMatKhau: 'account/password',
      TongQuan: 'dashboard',
      Helper: 'helper',
      DocXML: 'auditing',
      ChiTiet: 'case-detail/:maLK',
      KhoLuuTru: 'archive',
      QuanLyLuat: 'rules',
      QuanLyQuyTacOnOff: 'rules/on-off',
      QuanLyDanhMuc: 'master-data',
      MappingNghiepVu: 'mapping-nghiep-vu',
      DanhMucBYTMain: 'danh-muc-byt',
      PhanQuyenTruyCap: 'permissions',
      QuanLyChuyenMon: 'clinical-guidelines',
      ThuVien: 'thu-vien',
      TriThucTuGiamDinh: 'tri-thuc-giam-dinh',
      TroLyTriThuc: 'tro-ly-tri-thuc',
      CongHIS: 'his-gateway',
      BaoCaoVaThongKe: 'reports',
      SuaFileXML: 'auditing/edit/:maLK',
      XML1: 'xml/xml1',
      XML2: 'xml/xml2',
      XML3: 'xml/xml3',
      XML4: 'xml/xml4',
      XML5: 'xml/xml5',
      XML6: 'xml/xml6',
    },
  },
};
