/**
 * MODULE: KHO LƯU TRỮ HỒ SƠ LÂM SÀNG & NHẬT KÝ TRUY VẾT (EMR & AUDIT TRAIL)
 * Chức năng:
 * 1. Truy xuất hồ sơ: Đọc chuẩn xác dữ liệu các ca bệnh đã kiểm tra từ kho lưu trữ (gồm loại KCB / MA_LOAI_KCB từ XML1).
 * 2. Nhật ký truy vết: Hiển thị chi tiết lịch sử thay đổi hồ sơ (Audit Trail).
 * 3. Giao diện tối ưu: Bảng bung rộng đúng 1 màn hình (không kéo ngang), thu hẹp cột Chẩn đoán.
 * 4. Xuất dữ liệu: Xuất hàng loạt file XML; Excel (đã chọn + báo cáo toàn danh sách đang lọc); In/PDF báo cáo danh sách.
 * 5. Tự động ghi nhớ: Sửa lỗi mất dữ liệu khi Refresh, tự động đồng bộ (Auto-Save).
 * Tiêu chuẩn JCI: MCI.3 (Bảo mật & Truy vết) và QPS (Cải thiện chất lượng).
 * Giao diện: Pink Theme Phương Châu, Font Arial > 20px.
 * [CẬP NHẬT LÕI]: Tích hợp cơ chế Index-Detail từ kho_du_lieu.jsx chống tràn RAM.
 */

import React, { useEffect, useMemo, useState } from 'react'; // BẮT BUỘC CÓ REACT ĐỂ KHÔNG BỊ LỖI WEB
import { Alert, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as FileSystem from 'expo-file-system';

// --- IMPORT CÁC HÀM TỪ KHO DỮ LIỆU ĐỂ THAY THẾ LÕI CŨ ---
import * as DocumentPicker from 'expo-document-picker';
import { xuatExcelBaoCao } from '../dich_vu/bao_cao_xuat_file';
import {
  damBaoLuuTruBenTrenWeb,
  khoiPhucHoSoGiamDinhVaoKho,
  layDanhSachHoSoGiamDinhLuuTru,
  layHoSoGiamDinhLuuTruTheoId,
  layLichSuImportXml,
  layLichSuPhienGiamDinhTheoMaLK,
  layRawXmlImport,
  layTatCaHoSoTuKho,
  layThongTinDungLuongKho,
  luuBanGhiImportXml,
  luuHoSoVaoKho,
  luuThuCongHoSoGiamDinhVaoLichSu,
  xoaHoSoGiamDinhLuuTru,
  xoaHoSoKhoiKho,
  xoaToanBoHoSoGiamDinhLuuTru,
} from '../tien_ich/kho_du_lieu';
import { CD } from '../tien_ich/chu_de_giao_dien';
import { inHoacChiaSePdfTuBang } from '../tien_ich/in_an_chung';
import { xuLyFileXML130Va4210 } from '../tien_ich/xml_helper';

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

const DANH_SACH_XML_HO_SO = ['XML1', 'XML2', 'XML3', 'XML4', 'XML5', 'XML6'];

const TAB_KHO_LAM_VIEC = 'KHO_LAM_VIEC';
const TAB_LICH_SU_GD = 'LICH_SU_GD';

const DANH_SACH_THE_KHO = Object.freeze([
  { id: TAB_KHO_LAM_VIEC, label: 'Kho làm việc', icon: '🗄️', hint: 'Hồ sơ đang kiểm tra — có thể xóa khi làm mới kho' },
  { id: TAB_LICH_SU_GD, label: 'Lịch sử đã giám định', icon: '🕘', hint: 'Lưu bền trên ổ đĩa — không mất khi làm mới kho' },
]);

const TEN_HIEN_THI_XML = {
  XML1: 'Thông tin hành chính',
  XML2: 'Thuốc điều trị',
  XML3: 'DVKT và vật tư',
  XML4: 'Cận lâm sàng',
  XML5: 'Diễn biến điều trị',
  XML6: 'Thanh toán tổng hợp',
};

/** Chuẩn hóa MA_LOAI_KCB (XML1) — 1/01 → 01 */
const chuanHoaMaLoaiKcb = (val) => {
  const raw = String(val ?? '').trim();
  if (!raw) return '';
  const digits = raw.replace(/\D/g, '');
  return digits ? digits.padStart(2, '0') : raw;
};

/** Tên gợi nhớ theo mã phổ biến (QĐ 130 / TT 37) */
const TEN_GOI_LOAI_KCB = {
  '01': 'Khám bệnh',
  '02': 'Ngoại trú',
  '03': 'Nội trú',
  '04': 'Nội trú ban ngày',
  '05': 'Ngoại trú từ nội trú',
  '06': 'Tái khám',
  '07': 'Cấp cứu',
  '08': 'Khác (ngoại trú…)',
  '09': 'Nội trú (09)',
};

const layChuoiHienThiLoaiKhamChuaBenh = (x1 = {}) => {
  const rawMa = x1?.MA_LOAI_KCB ?? x1?.ma_loai_kcb ?? '';
  const maChuan = chuanHoaMaLoaiKcb(rawMa);
  const ten = maChuan ? TEN_GOI_LOAI_KCB[maChuan] : '';
  if (!String(rawMa || '').trim() && !maChuan) return '—';
  const maHien = maChuan || String(rawMa || '').trim();
  return ten ? `${maHien} — ${ten}` : maHien;
};

/** Cột dùng chung cho Excel báo cáo & in PDF danh sách kho */
const COT_BAO_CAO_KHO = [
  { key: 'stt', label: 'STT' },
  { key: 'ma_lk', label: 'Mã LK' },
  { key: 'ten_bn', label: 'Bệnh nhân' },
  { key: 'loai_kcb', label: 'Loại khám chữa bệnh (MA_LOAI_KCB)' },
  { key: 'chan_doan_rv', label: 'Chẩn đoán RV' },
  { key: 't_bhtt', label: 'BHYT thanh toán (VNĐ)' },
  { key: 't_bntt', label: 'BN thanh toán (VNĐ)' },
  { key: 'thoi_gian', label: 'Thời gian cập nhật' },
  { key: 'trang_thai', label: 'Trạng thái' },
  { key: 'so_loi', label: 'Số lỗi kiểm tra' },
];

const layDuLieuGocHoSo = (hs) => {
  if (!hs) return {};
  let raw = hs.du_lieu_goc || hs;
  if (typeof raw === 'string') {
    try {
      raw = JSON.parse(raw);
    } catch (error) {
      raw = {};
    }
  }
  return raw && typeof raw === 'object' ? raw : {};
};

const chuanHoaDanhSachBanGhi = (duLieu) => {
  if (Array.isArray(duLieu)) return duLieu.filter((item) => item && typeof item === 'object' && Object.keys(item).length > 0);
  if (duLieu && typeof duLieu === 'object' && Object.keys(duLieu).length > 0) return [duLieu];
  return [];
};

const dinhDangGiaTriChiTiet = (giaTri) => {
  if (giaTri === null || giaTri === undefined || giaTri === '') return '---';
  if (typeof giaTri === 'object') {
    try {
      return JSON.stringify(giaTri, null, 2);
    } catch (error) {
      return String(giaTri);
    }
  }
  return String(giaTri);
};

const chuanHoaChuoiTimKiem = (giaTri) => String(giaTri || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .trim();

const chuanHoaTenTruongLoi = (giaTri) => String(giaTri || '')
  .toUpperCase()
  .replace(/[^A-Z0-9]/g, '');

const layXmlKeyTuLoi = (loi = {}) => {
  const match = String(loi?.phan_he || loi?.phan_loai || '').toUpperCase().match(/XML\d/);
  return match ? match[0] : 'XML1';
};

const taoChiMucLoiTheoXml = (danhSachLoi = []) => {
  return (Array.isArray(danhSachLoi) ? danhSachLoi : []).reduce((acc, loi) => {
    const xmlKey = layXmlKeyTuLoi(loi);
    if (!acc[xmlKey]) acc[xmlKey] = [];
    acc[xmlKey].push(loi);
    return acc;
  }, {});
};

const locTheoTuKhoaChiTiet = (tuKhoa, ...danhSachGiaTri) => {
  const key = chuanHoaChuoiTimKiem(tuKhoa);
  if (!key) return true;
  return chuanHoaChuoiTimKiem(danhSachGiaTri.join(' ')).includes(key);
};

const laTruongBiLoi = (danhSachLoiXml = [], tenTruong = '', dongIndex = null) => {
  const tenTruongChuan = chuanHoaTenTruongLoi(tenTruong);
  if (!tenTruongChuan) return false;

  return (Array.isArray(danhSachLoiXml) ? danhSachLoiXml : []).some((loi) => {
    const truongLoiChuan = chuanHoaTenTruongLoi(loi?.truong_loi || '');
    if (!truongLoiChuan || truongLoiChuan === 'UNKNOWN') return false;
    const coKhopDong = dongIndex === null || !Number.isFinite(loi?.index) || Number(loi.index) === Number(dongIndex);
    return coKhopDong && truongLoiChuan === tenTruongChuan;
  });
};

const laDongBiLoi = (danhSachLoiXml = [], dongIndex = null) => {
  if (!Number.isFinite(dongIndex)) return false;
  return (Array.isArray(danhSachLoiXml) ? danhSachLoiXml : []).some((loi) => Number.isFinite(loi?.index) && Number(loi.index) === Number(dongIndex));
};

const layDuLieuXmlChiTiet = (hs) => {
  const raw = layDuLieuGocHoSo(hs);
  const x1Data = raw.xml1 || raw.XML1 || {};
  return {
    raw,
    x1: Array.isArray(x1Data) ? (x1Data[0] || {}) : x1Data,
    x2: chuanHoaDanhSachBanGhi(raw.xml2 || raw.XML2 || []),
    x3: chuanHoaDanhSachBanGhi(raw.xml3 || raw.XML3 || []),
    x4: chuanHoaDanhSachBanGhi(raw.xml4 || raw.XML4 || []),
    x5: chuanHoaDanhSachBanGhi(raw.xml5 || raw.XML5 || []),
    x6: chuanHoaDanhSachBanGhi(raw.xml6 || raw.XML6 || []),
  };
};

const ManHinhKhoLuuTru = ({ navigation }) => {
  const [danhSachKho, setDanhSachKho] = useState([]);
  const [tuKhoa, setTuKhoa] = useState('');
  const [hoSoDangXem, setHoSoDangXem] = useState(null);
  const [tuKhoaChiTietXml, setTuKhoaChiTietXml] = useState('');

  // --- STATE MỚI CHO CRUD VÀ SORT ---
  const [selectedIds, setSelectedIds] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'thoi_gian', direction: 'desc' });
  const [hoSoDangSua, setHoSoDangSua] = useState(null);
  const [maLKGoc, setMaLKGoc] = useState(null);
  const [lichSuImportChiTiet, setLichSuImportChiTiet] = useState([]);
  const [lichSuPhienChiTiet, setLichSuPhienChiTiet] = useState([]);
  const [tabHienTai, setTabHienTai] = useState(TAB_KHO_LAM_VIEC);
  const [danhSachLichSuGd, setDanhSachLichSuGd] = useState([]);
  const [tuKhoaLichSuGd, setTuKhoaLichSuGd] = useState('');
  const [banGhiLichSuDangXem, setBanGhiLichSuDangXem] = useState(null);
  const [thongTinDungLuong, setThongTinDungLuong] = useState(null);

  useEffect(() => {
    taiDuLieuKho();
    void (async () => {
      await damBaoLuuTruBenTrenWeb();
      const dl = await layThongTinDungLuongKho();
      setThongTinDungLuong(dl);
    })();
  }, []);

  const taiDanhSachLichSuGd = async () => {
    try {
      const ds = await layDanhSachHoSoGiamDinhLuuTru();
      setDanhSachLichSuGd(Array.isArray(ds) ? ds : []);
    } catch (e) {
      console.warn('[KhoLuuTru] Không tải được lịch sử giám định:', e);
      setDanhSachLichSuGd([]);
    }
  };

  useEffect(() => {
    if (tabHienTai === TAB_LICH_SU_GD) {
      void taiDanhSachLichSuGd();
    }
  }, [tabHienTai]);

  const handleNhapXmlGoi130VaoKho = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: ['application/xml', 'text/xml', '*/*'],
        copyToCacheDirectory: true,
      });
      if (res.canceled) return;
      const asset = res.assets?.[0];
      const uri = asset?.uri;
      if (!uri) {
        safeAlert('Lỗi', 'Không đọc được đường dẫn file.');
        return;
      }
      let raw = '';
      if (Platform.OS === 'web') {
        const r = await fetch(uri);
        raw = await r.text();
      } else {
        raw = await FileSystem.readAsStringAsync(uri);
      }
      const ds = xuLyFileXML130Va4210(raw);
      if (!Array.isArray(ds) || ds.length === 0) {
        safeAlert('Lỗi', 'Không trích được hồ sơ. Cần file XML đúng định dạng gói 130 (QĐ 3176).');
        return;
      }
      const tenFile = String(asset?.name || 'import.xml');
      const dsChuan = ds.map((hs) => {
        const x1 = hs?.xml1 || hs?.XML1 || {};
        const maLK = String(hs?.ma_lk || x1.MA_LK || x1.ma_lk || '').trim();
        return { ...hs, ma_lk: maLK || hs.ma_lk };
      }).filter((hs) => Boolean(hs.ma_lk));
      const maLKChinh = dsChuan[0]?.ma_lk;
      let recImport = null;
      if (maLKChinh) {
        recImport = await luuBanGhiImportXml({
          ma_lk: maLKChinh,
          ten_file: tenFile,
          raw_xml: raw,
          nguon: 'kho_import_130',
        });
      }
      const thoiGian = new Date().toLocaleString('vi-VN');
      await luuHoSoVaoKho(dsChuan.map((hs) => ({
        ...hs,
        ten_file_goc: tenFile,
        xml_import_id: recImport?.id || '',
        thoi_gian: thoiGian,
      })));
      await taiDuLieuKho();
      safeAlert('Thành công', `Đã nhập ${ds.length} hồ sơ vào kho.`);
    } catch (e) {
      safeAlert('Lỗi', e?.message || 'Không nhập được XML.');
    }
  };

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
    if (!hs) return { raw: {}, x1: {}, x2: [], x3: [], x4: [], x5: [], x6: [] };
    return layDuLieuXmlChiTiet(hs);
  };

  useEffect(() => {
    if (!hoSoDangXem) {
      setLichSuImportChiTiet([]);
      setLichSuPhienChiTiet([]);
      return;
    }
    const { x1 } = getSafeXML(hoSoDangXem);
    const maLK = String(hoSoDangXem.ma_lk || x1.MA_LK || '').trim();
    if (!maLK) return;

    let cancelled = false;
    (async () => {
      try {
        const [imp, phien] = await Promise.all([
          layLichSuImportXml({ ma_lk: maLK, gioiHan: 24 }),
          layLichSuPhienGiamDinhTheoMaLK(maLK),
        ]);
        if (!cancelled) {
          setLichSuImportChiTiet(Array.isArray(imp) ? imp : []);
          setLichSuPhienChiTiet(Array.isArray(phien?.cac_phien) ? phien.cac_phien : []);
        }
      } catch (e) {
        console.warn('[KhoLuuTru] Không tải được lịch sử import/phiên kiểm tra:', e);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [hoSoDangXem]);

  const chuyenDanhSachHoSoThanhHangBaoCao = (arr) =>
    (Array.isArray(arr) ? arr : []).map((hs, index) => {
      const { x1 } = getSafeXML(hs);
      const nLoi = Array.isArray(hs.ket_qua_giam_dinh) ? hs.ket_qua_giam_dinh.length : 0;
      return {
        stt: index + 1,
        ma_lk: String(hs.ma_lk || x1.MA_LK || ''),
        ten_bn: String(hs.ten_benh_nhan || hs.ten_bn || x1.HO_TEN || '').toUpperCase(),
        loai_kcb: layChuoiHienThiLoaiKhamChuaBenh(x1),
        chan_doan_rv: String(x1.CHAN_DOAN_RV || hs.ten_benh || ''),
        t_bhtt: Number(x1.T_BHTT || 0),
        t_bntt: Number(x1.T_BNTT || 0),
        thoi_gian: String(hs.thoi_gian || ''),
        trang_thai: nLoi > 0 ? `Vi phạm (${nLoi} lỗi)` : 'Hợp lệ 100%',
        so_loi: nLoi,
      };
    });

  const danhSachLoc = useMemo(() => {
    const searchStr = String(tuKhoa).toLowerCase().trim();
    return danhSachKho.filter((hs) => {
      const { x1 } = getSafeXML(hs);
      const ten = String(hs.ten_benh_nhan || hs.ten_bn || x1.HO_TEN || '').toLowerCase();
      const ma = String(hs.ma_lk || x1.MA_LK || '').toLowerCase();
      const loai = layChuoiHienThiLoaiKhamChuaBenh(x1).toLowerCase();
      const maLoaiRaw = String(x1.MA_LOAI_KCB || x1.ma_loai_kcb || '').toLowerCase();
      return ma.includes(searchStr) || ten.includes(searchStr) || loai.includes(searchStr) || maLoaiRaw.includes(searchStr);
    });
  }, [danhSachKho, tuKhoa]);

  const danhSachLichSuGdLoc = useMemo(() => {
    const searchStr = String(tuKhoaLichSuGd).toLowerCase().trim();
    return (Array.isArray(danhSachLichSuGd) ? danhSachLichSuGd : []).filter((rec) => {
      if (!searchStr) return true;
      const ma = String(rec.ma_lk || '').toLowerCase();
      const ten = String(rec.ten_bn || '').toLowerCase();
      const file = String(rec.ten_file_goc || '').toLowerCase();
      const cd = String(rec.chan_doan_rv || '').toLowerCase();
      return ma.includes(searchStr) || ten.includes(searchStr) || file.includes(searchStr) || cd.includes(searchStr);
    });
  }, [danhSachLichSuGd, tuKhoaLichSuGd]);

  const handleLuuTatCaHoSoGdVaoLichSu = () => {
    const coGd = danhSachKho.filter((hs) => Array.isArray(hs.ket_qua_giam_dinh));
    if (coGd.length === 0) {
      safeAlert('Thông báo', 'Kho làm việc không có hồ sơ đã chạy giám định (chưa có ket_qua_giam_dinh).');
      return;
    }
    safeConfirm(
      'Lưu vào lịch sử',
      `Ghi ${coGd.length} hồ sơ đã giám định vào kho lịch sử bền?\n(Dữ liệu không bị xóa khi làm mới kho trên Dashboard.)`,
      async () => {
        const dem = await luuThuCongHoSoGiamDinhVaoLichSu(coGd);
        await taiDanhSachLichSuGd();
        safeAlert('Thành công', `Đã lưu ${dem} hồ sơ vào lịch sử giám định.`);
        setTabHienTai(TAB_LICH_SU_GD);
      },
    );
  };

  const handleKhoiPhucTuLichSu = (id) => {
    safeConfirm('Khôi phục', 'Đưa bản lưu này vào kho làm việc? (Hồ sơ trùng MA_LK sẽ được ghi đè.)', async () => {
      const ketQua = await khoiPhucHoSoGiamDinhVaoKho(id);
      if (!ketQua?.ok) {
        safeAlert('Lỗi', ketQua?.loi || 'Không khôi phục được.');
        return;
      }
      await taiDuLieuKho();
      safeAlert('Thành công', `Đã khôi phục hồ sơ ${ketQua.ma_lk || ''} vào kho làm việc.`);
      setTabHienTai(TAB_KHO_LAM_VIEC);
    });
  };

  const handleXoaBanGhiLichSu = (id, maLK) => {
    safeConfirm('Xóa bản lưu', `Xóa vĩnh viễn bản lưu giám định MA_LK ${maLK} khỏi lịch sử?`, async () => {
      await xoaHoSoGiamDinhLuuTru(id);
      setBanGhiLichSuDangXem(null);
      await taiDanhSachLichSuGd();
      safeAlert('Thành công', 'Đã xóa bản lưu.');
    });
  };

  const handleXoaToanBoLichSuGd = () => {
    if (danhSachLichSuGd.length === 0) return;
    safeConfirm(
      'Xóa toàn bộ lịch sử',
      `Xóa vĩnh viễn ${danhSachLichSuGd.length} bản lưu giám định?\n(Không ảnh hưởng kho làm việc hiện tại.)`,
      async () => {
        await xoaToanBoHoSoGiamDinhLuuTru();
        setBanGhiLichSuDangXem(null);
        await taiDanhSachLichSuGd();
        safeAlert('Thành công', 'Đã xóa toàn bộ lịch sử giám định.');
      },
    );
  };

  const handleXemChiTietLichSuGd = async (meta) => {
    const full = await layHoSoGiamDinhLuuTruTheoId(meta?.id);
    setBanGhiLichSuDangXem(full || meta);
  };

  const handleMoSuaTheoXml = (maLK, xmlKey, dongIndex = 0, truongLoi = '') => {
    setHoSoDangXem(null);
    setTuKhoaChiTietXml('');
    navigation.navigate('SuaFileXML', {
      maLK,
      loi: {
        phan_he: xmlKey,
        truong_loi: truongLoi || 'UNKNOWN',
        index: Number.isFinite(dongIndex) ? dongIndex : 0,
        canh_bao: `Mở nhanh ${xmlKey}`,
      },
      viTriSua: {
        phanHe: xmlKey,
        truongLoi: truongLoi || '',
        index: Number.isFinite(dongIndex) ? dongIndex : 0,
      },
    });
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
      else if (key === 'ma_loai_kcb') { valA = chuanHoaMaLoaiKcb(x1A.MA_LOAI_KCB || x1A.ma_loai_kcb); valB = chuanHoaMaLoaiKcb(x1B.MA_LOAI_KCB || x1B.ma_loai_kcb); }
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

  const handleExportExcel = async () => {
    if (selectedIds.length === 0) return;
    const chon = danhSachKho.filter((hs) => {
      const { x1 } = getSafeXML(hs);
      const id = hs.ma_lk || x1.MA_LK;
      return id && selectedIds.includes(id);
    });
    const rows = chuyenDanhSachHoSoThanhHangBaoCao(chon);
    if (rows.length === 0) {
      safeAlert('Thông báo', 'Không có dòng đã chọn để xuất.');
      return;
    }
    await xuatExcelBaoCao(
      [{ sheetName: 'Ho_so_da_chon', columns: COT_BAO_CAO_KHO, rows }],
      `Kho_luu_tru_chon_${rows.length}`,
    );
  };

  /** Xuất Excel báo cáo: toàn bộ danh sách đang hiển thị (sau ô tìm kiếm), không cần tick chọn */
  const handleXuatExcelBaoCao = async () => {
    const rows = chuyenDanhSachHoSoThanhHangBaoCao(danhSachLoc);
    if (rows.length === 0) {
      safeAlert('Thông báo', 'Không có hồ sơ để xuất (kho trống hoặc không khớp bộ lọc).');
      return;
    }
    await xuatExcelBaoCao(
      [{ sheetName: 'Bao_cao_kho', columns: COT_BAO_CAO_KHO, rows }],
      'Bao_cao_kho_luu_tru',
    );
  };

  /** In / PDF danh sách kho (cùng dữ liệu với báo cáo Excel) */
  const handleInDanhSachKho = async () => {
    const rows = chuyenDanhSachHoSoThanhHangBaoCao(danhSachLoc);
    if (rows.length === 0) {
      safeAlert('Thông báo', 'Không có hồ sơ để in.');
      return;
    }
    const exportNote = tuKhoa.trim()
      ? `Sau lọc: "${tuKhoa.trim()}". ${rows.length} hồ sơ.`
      : `${rows.length} hồ sơ (theo danh sách hiện tại).`;
    await inHoacChiaSePdfTuBang(
      [{ sheetName: 'Kho_ho_so', columns: COT_BAO_CAO_KHO, rows, exportNote }],
      'Kho lưu trữ — Báo cáo danh sách hồ sơ',
    );
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
  const taiXuatXmlGoc = async (meta = {}) => {
    if (Platform.OS !== 'web') {
      safeAlert('Thông báo', 'Tải file XML gốc chỉ hỗ trợ trên Web.');
      return;
    }
    const raw = await layRawXmlImport({ id: meta.id, ma_lk: meta.ma_lk });
    if (!raw) {
      safeAlert('Thông báo', 'Không còn bản XML gốc trong kho (có thể chỉ lưu metadata từ phiên cũ).');
      return;
    }
    const blob = new Blob([raw], { type: 'text/xml;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = String(meta.ten_file || meta.tenFile || `XML_${meta.ma_lk || 'goc'}.xml`);
    link.click();
  };

  const renderChiTietHoSo = () => {
    if (!hoSoDangXem) return null;

    const { x1, x2: xml2, x3: xml3, x4: xml4, x5: xml5, x6: xml6 } = getSafeXML(hoSoDangXem);
    const maLK = hoSoDangXem.ma_lk || x1.MA_LK;
    const tenBN = hoSoDangXem.ten_benh_nhan || hoSoDangXem.ten_bn || x1.HO_TEN || 'N/A';
    const nhatKyTruyVet = hoSoDangXem.lich_su_audit || hoSoDangXem.nhat_ky || [];
    const danhSachLoi = Array.isArray(hoSoDangXem.ket_qua_giam_dinh) ? hoSoDangXem.ket_qua_giam_dinh : [];
    const chiMucLoiTheoXml = taoChiMucLoiTheoXml(danhSachLoi);
    const tuKhoaChiTietDaNhap = String(tuKhoaChiTietXml || '').trim();
    const thongTinXml = [
      { key: 'XML1', duLieu: x1, danhSach: [], loai: 'single' },
      { key: 'XML2', duLieu: null, danhSach: xml2, loai: 'list' },
      { key: 'XML3', duLieu: null, danhSach: xml3, loai: 'list' },
      { key: 'XML4', duLieu: null, danhSach: xml4, loai: 'list' },
      { key: 'XML5', duLieu: null, danhSach: xml5, loai: 'list' },
      { key: 'XML6', duLieu: null, danhSach: xml6, loai: 'list' },
    ];

    return (
      <View style={styles.khung_modal}>
        <View style={styles.header_modal}>
          <Text style={styles.tieu_de_modal}>HỒ SƠ: {String(tenBN).toUpperCase()}</Text>
          <TouchableOpacity onPress={() => { setHoSoDangXem(null); setTuKhoaChiTietXml(''); }} style={styles.btn_dong_modal}>
            <Text style={styles.txt_btn_dong}>ĐÓNG [X]</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.noi_dung_modal}>
          <View style={styles.thong_tin_hanh_chinh}>
            <Text style={styles.chu_thuong}><Text style={styles.chu_dam}>Mã Lượt Khám:</Text> {maLK}</Text>
            <Text style={styles.chu_thuong}><Text style={styles.chu_dam}>Thời gian nạp:</Text> {hoSoDangXem.thoi_gian}</Text>
            <Text style={styles.chu_thuong}><Text style={styles.chu_dam}>Loại khám chữa bệnh:</Text> {layChuoiHienThiLoaiKhamChuaBenh(x1)}</Text>
            <Text style={styles.chu_thuong}><Text style={styles.chu_dam}>Chẩn đoán RV:</Text> {x1.CHAN_DOAN_RV || hoSoDangXem.ten_benh || 'N/A'}</Text>
            <Text style={styles.chu_thuong}><Text style={styles.chu_dam}>BHYT Thanh toán:</Text> {Number(x1.T_BHTT || 0).toLocaleString()} VNĐ</Text>
            <Text style={styles.chu_thuong}><Text style={styles.chu_dam}>BN Thanh toán:</Text> {Number(x1.T_BNTT || 0).toLocaleString()} VNĐ</Text>
            <Text style={styles.chu_thuong}><Text style={styles.chu_dam}>Trạng thái:</Text> {hoSoDangXem.ket_qua_giam_dinh?.length > 0 ? `⚠️ Có ${hoSoDangXem.ket_qua_giam_dinh.length} lỗi` : '✅ Hợp lệ 100%'}</Text>
            {hoSoDangXem.ten_file_goc ? (
              <Text style={styles.chu_thuong}><Text style={styles.chu_dam}>File XML gốc:</Text> {hoSoDangXem.ten_file_goc}</Text>
            ) : null}
          </View>

          <View style={styles.phan_muc}>
            <Text style={[styles.tieu_de_muc, { color: '#CE93D8', borderColor: 'rgba(206,147,216,0.35)' }]}>📥 LỊCH SỬ FILE XML ĐÃ IMPORT (KHO CHÍNH THỨC)</Text>
            {lichSuImportChiTiet.length > 0 ? lichSuImportChiTiet.map((imp) => (
              <View key={imp.id || `${imp.ma_lk}_${imp.ghi_luc_iso}`} style={styles.dong_nhat_ky}>
                <Text style={styles.chu_thuong}>
                  • <Text style={styles.chu_dam}>{imp.ngay_giam_dinh || imp.ghi_luc_iso}:</Text> {imp.ten_file || imp.tenFile || '—'}
                </Text>
                <Text style={styles.chu_nho}>
                  Nguồn: {imp.nguon || 'nhap_xml'}
                  {imp.co_raw_xml ? ` | ${Math.round((imp.kich_thuoc_bytes || 0) / 1024)} KB` : ' | (chỉ metadata)'}
                </Text>
                {imp.co_raw_xml ? (
                  <TouchableOpacity style={styles.btn_sua_loi_truc_tiep} onPress={() => void taiXuatXmlGoc(imp)}>
                    <Text style={styles.txt_btn_lien_ket_xml}>Tải XML gốc</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            )) : (
              <Text style={styles.chu_nho}>Chưa có bản ghi import XML trong kho chính thức cho MA_LK này.</Text>
            )}
          </View>

          <View style={styles.phan_muc}>
            <Text style={[styles.tieu_de_muc, { color: '#80CBC4', borderColor: 'rgba(128,203,196,0.35)' }]}>🕘 LỊCH SỬ PHIÊN KIỂM TRA ĐÃ LƯU</Text>
            {lichSuPhienChiTiet.length > 0 ? lichSuPhienChiTiet.map((phien) => {
              const tt = phien.tom_tat || {};
              const dem = tt.dem_muc_do || {};
              return (
                <View key={phien.id_phien} style={styles.dong_nhat_ky}>
                  <Text style={styles.chu_thuong}>
                    • <Text style={styles.chu_dam}>{phien.ghi_luc_iso}:</Text> {tt.so_dong_canh_bao || 0} cảnh báo
                    {` · E:${dem.Error || 0} W:${dem.Warning || 0} I:${dem.Info || 0}`}
                  </Text>
                  <Text style={styles.chu_nho}>
                    {phien.ten_file_goc ? `File: ${phien.ten_file_goc} · ` : ''}
                    {tt.so_ma_luat_khac_biet || 0} mã luật
                    {phien.so_dong_bi_cat > 0 ? ` · snapshot cắt ${phien.so_dong_bi_cat} dòng` : ''}
                  </Text>
                </View>
              );
            }) : (
              <Text style={styles.chu_nho}>Chưa có phiên kiểm tra nào được ghi sau khi lưu kho.</Text>
            )}
          </View>

          <View style={styles.phan_muc}>
            <Text style={[styles.tieu_de_muc, { color: '#B3E5FC', borderColor: 'rgba(179,229,252,0.35)' }]}>🔎 TÌM NHANH TRONG HỒ SƠ XML</Text>
            <TextInput
              style={styles.o_tim_chi_tiet_xml}
              placeholder="Tìm theo tên trường, giá trị, mã XML..."
              placeholderTextColor="rgba(255,255,255,0.42)"
              value={tuKhoaChiTietXml}
              onChangeText={setTuKhoaChiTietXml}
              outlineStyle="none"
            />
            <Text style={styles.txt_goi_y_tim_xml}>Ví dụ: `MA_THE_BHYT`, `K59.0`, `XML3`, `NGAY_RA`, `T_BHTT`.</Text>
          </View>

          <View style={styles.phan_muc}>
            <Text style={[styles.tieu_de_muc, { color: '#A5D6FF', borderColor: 'rgba(165,214,255,0.35)' }]}>🧭 LIÊN KẾT SỬA NHANH THEO XML</Text>
            <View style={styles.chi_tiet_toolbar}>
              {DANH_SACH_XML_HO_SO.map((xmlKey) => (
                <TouchableOpacity key={xmlKey} style={styles.btn_lien_ket_xml} onPress={() => handleMoSuaTheoXml(maLK, xmlKey)}>
                  <Text style={styles.txt_btn_lien_ket_xml}>{xmlKey}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.phan_muc}>
            <Text style={[styles.tieu_de_muc, { color: '#FFE082', borderColor: 'rgba(255,224,130,0.35)' }]}>⚠️ KẾT QUẢ KIỂM TRA HIỆN TẠI</Text>
            {danhSachLoi.length > 0 ? danhSachLoi.map((loi, idx) => {
              const phanHe = String(loi?.phan_he || 'XML1').toUpperCase().match(/XML\d/);
              const xmlKey = phanHe ? phanHe[0] : 'XML1';
              return (
                <View key={`loi_${idx}`} style={styles.the_loi_hien_tai}>
                  <Text style={styles.chu_thuong}><Text style={styles.chu_dam}>[{xmlKey}]</Text> {loi?.canh_bao || loi?.noi_dung || 'Cảnh báo chưa có mô tả'}</Text>
                  <Text style={styles.chu_nho}>Trường lỗi: {loi?.truong_loi || 'UNKNOWN'}{Number.isFinite(loi?.index) ? ` | Dòng: ${Number(loi.index) + 1}` : ''}</Text>
                  <TouchableOpacity
                    style={styles.btn_sua_loi_truc_tiep}
                    onPress={() => handleMoSuaTheoXml(maLK, xmlKey, Number.isFinite(loi?.index) ? Number(loi.index) : 0, loi?.truong_loi || '')}
                  >
                    <Text style={styles.txt_btn_lien_ket_xml}>Mở sửa lỗi này</Text>
                  </TouchableOpacity>
                </View>
              );
            }) : <Text style={styles.chu_nho}>Chưa ghi nhận lỗi kiểm tra trên hồ sơ này.</Text>}
          </View>

          {thongTinXml.map((xmlItem) => {
            const { key, duLieu, danhSach, loai } = xmlItem;
            const danhSachLoiXml = chiMucLoiTheoXml[key] || [];
            const soDong = loai === 'single' ? Object.keys(duLieu || {}).length : danhSach.length;
            const danhSachTruongXml1 = Object.entries(duLieu || {}).filter(([tenTruong, giaTri]) => (
              locTheoTuKhoaChiTiet(tuKhoaChiTietDaNhap, key, TEN_HIEN_THI_XML[key], tenTruong, dinhDangGiaTriChiTiet(giaTri))
            ));

            const danhSachDongDaLoc = (Array.isArray(danhSach) ? danhSach : []).map((dong, idx) => {
              const truongDaLoc = Object.entries(dong || {})
                .filter(([tenTruong]) => tenTruong !== 'id')
                .filter(([tenTruong, giaTri]) => locTheoTuKhoaChiTiet(tuKhoaChiTietDaNhap, key, TEN_HIEN_THI_XML[key], tenTruong, dinhDangGiaTriChiTiet(giaTri), `Dòng ${idx + 1}`));
              return {
                dong,
                idx,
                truongDaLoc,
              };
            }).filter((item) => !tuKhoaChiTietDaNhap || item.truongDaLoc.length > 0);

            const coKetQuaHienThi = loai === 'single' ? danhSachTruongXml1.length > 0 : danhSachDongDaLoc.length > 0;
            return (
              <View key={key} style={styles.phan_muc}>
                <View style={styles.xml_header_row}>
                  <View>
                    <Text style={styles.tieu_de_muc}>{`${key} · ${TEN_HIEN_THI_XML[key] || key}`}</Text>
                    <Text style={styles.xml_meta_text}>{loai === 'single' ? `${soDong} trường dữ liệu` : `${soDong} dòng dữ liệu`}{danhSachLoiXml.length > 0 ? ` • ${danhSachLoiXml.length} lỗi liên quan` : ''}</Text>
                  </View>
                  <TouchableOpacity style={styles.btn_lien_ket_xml} onPress={() => handleMoSuaTheoXml(maLK, key)}>
                    <Text style={styles.txt_btn_lien_ket_xml}>Mở cửa sổ sửa {key}</Text>
                  </TouchableOpacity>
                </View>

                {loai === 'single' ? (
                  Object.keys(duLieu || {}).length > 0 ? (
                    <View style={styles.khoi_xml_chi_tiet}>
                      <View style={styles.luoi_truong_xml}>
                        {danhSachTruongXml1.map(([tenTruong, giaTri]) => {
                          const biLoi = laTruongBiLoi(danhSachLoiXml, tenTruong);
                          return (
                          <View key={`${key}_${tenTruong}`} style={[styles.o_truong_xml, biLoi && styles.o_truong_xml_loi]}>
                            <Text style={[styles.nhan_truong_xml, biLoi && styles.nhan_truong_xml_loi]}>{tenTruong}</Text>
                            <Text style={[styles.gia_tri_truong_xml, biLoi && styles.gia_tri_truong_xml_loi]}>{dinhDangGiaTriChiTiet(giaTri)}</Text>
                          </View>
                        );})}
                      </View>
                    </View>
                  ) : (
                    <Text style={styles.chu_nho}>Không có dữ liệu trong {key}.</Text>
                  )
                ) : (
                  danhSach.length > 0 ? (
                    coKetQuaHienThi ? danhSachDongDaLoc.map(({ dong, idx, truongDaLoc }) => {
                      const dongCoLoi = laDongBiLoi(danhSachLoiXml, idx);
                      return (
                      <View key={`${key}_${idx}`} style={[styles.khoi_xml_dong, dongCoLoi && styles.khoi_xml_dong_loi]}>
                        <View style={styles.khoi_xml_dong_header}>
                          <Text style={styles.khoi_xml_dong_title}>{`${key} · Dòng ${idx + 1}`}</Text>
                          <TouchableOpacity style={styles.btn_sua_dong_xml} onPress={() => handleMoSuaTheoXml(maLK, key, idx)}>
                            <Text style={styles.txt_btn_sua_dong_xml}>Sửa dòng này</Text>
                          </TouchableOpacity>
                        </View>
                        <View style={styles.luoi_truong_xml}>
                          {truongDaLoc.map(([tenTruong, giaTri]) => {
                            const biLoi = laTruongBiLoi(danhSachLoiXml, tenTruong, idx);
                            return (
                            <View key={`${key}_${idx}_${tenTruong}`} style={[styles.o_truong_xml, biLoi && styles.o_truong_xml_loi]}>
                              <Text style={[styles.nhan_truong_xml, biLoi && styles.nhan_truong_xml_loi]}>{tenTruong}</Text>
                              <Text style={[styles.gia_tri_truong_xml, biLoi && styles.gia_tri_truong_xml_loi]}>{dinhDangGiaTriChiTiet(giaTri)}</Text>
                            </View>
                          );})}
                        </View>
                      </View>
                    );}) : <Text style={styles.chu_nho}>Không có trường nào khớp với từ khóa tìm kiếm trong {key}.</Text>
                  ) : (
                    <Text style={styles.chu_nho}>Không có dữ liệu trong {key}.</Text>
                  )
                )}
              </View>
            );
          })}

          <View style={styles.phan_muc}>
            <Text style={[styles.tieu_de_muc, { color: '#90CAF9', borderColor: 'rgba(144,202,249,0.3)' }]}>📋 NHẬT KÝ TRUY VẾT & THAY ĐỔI (AUDIT TRAIL)</Text>
            {nhatKyTruyVet.length > 0 ? nhatKyTruyVet.map((log, idx) => (
              <View key={idx} style={styles.dong_nhat_ky}>
                <Text style={styles.chu_thuong}>• <Text style={styles.chu_dam}>{log.thoi_gian}:</Text> {log.hanh_dong}</Text>
                <Text style={styles.chu_nho}>- Người thực hiện: {log.nguoi_dung || 'Hệ thống'} | Ghi chú: {log.ghi_chu || 'Không có'}</Text>
              </View>
            )) : (
              <View style={styles.dong_nhat_ky}>
                <Text style={styles.chu_thuong}>• <Text style={styles.chu_dam}>{hoSoDangXem.thoi_gian}:</Text> Nạp hồ sơ gốc và Kiểm tra lần đầu.</Text>
                <Text style={styles.chu_nho}>- Ghi chú: Hồ sơ được khởi tạo tự động từ file XML.</Text>
              </View>
            )}
          </View>

          <View style={{ height: 50 }} />
        </ScrollView>
      </View>
    );
  };

  const renderModalChiTietLichSuGd = () => {
    if (!banGhiLichSuDangXem) return null;
    const rec = banGhiLichSuDangXem;
    const snap = rec.ho_so_snapshot || {};
    const dsLoi = Array.isArray(snap.ket_qua_giam_dinh) ? snap.ket_qua_giam_dinh : [];
    const tt = rec.tom_tat || {};
    const dem = tt.dem_muc_do || {};

    return (
      <View style={styles.khung_modal}>
        <View style={styles.header_modal}>
          <Text style={styles.tieu_de_modal}>LỊCH SỬ GIÁM ĐỊNH: {String(rec.ten_bn || rec.ma_lk || '').toUpperCase()}</Text>
          <TouchableOpacity onPress={() => setBanGhiLichSuDangXem(null)} style={styles.btn_dong_modal}>
            <Text style={styles.txt_btn_dong}>ĐÓNG [X]</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.noi_dung_modal}>
          <View style={styles.thong_tin_hanh_chinh}>
            <Text style={styles.chu_thuong}><Text style={styles.chu_dam}>Mã LK:</Text> {rec.ma_lk}</Text>
            <Text style={styles.chu_thuong}><Text style={styles.chu_dam}>Lưu lúc:</Text> {rec.thoi_gian || rec.ghi_luc_iso}</Text>
            <Text style={styles.chu_thuong}><Text style={styles.chu_dam}>Loại KCB:</Text> {rec.ma_loai_kcb || '—'}</Text>
            <Text style={styles.chu_thuong}><Text style={styles.chu_dam}>Chẩn đoán RV:</Text> {rec.chan_doan_rv || '—'}</Text>
            <Text style={styles.chu_thuong}><Text style={styles.chu_dam}>Số lỗi:</Text> {rec.so_loi || 0} (E:{dem.Error || 0} W:{dem.Warning || 0} I:{dem.Info || 0})</Text>
            {rec.ten_file_goc ? (
              <Text style={styles.chu_thuong}><Text style={styles.chu_dam}>File gốc:</Text> {rec.ten_file_goc}</Text>
            ) : null}
          </View>

          <View style={styles.phan_muc}>
            <Text style={[styles.tieu_de_muc, { color: '#80CBC4', borderColor: 'rgba(128,203,196,0.35)' }]}>📋 CẢNH BÁO ĐÃ LƯU (TỐI ĐA HIỂN THỊ 80 DÒNG)</Text>
            {dsLoi.length > 0 ? dsLoi.slice(0, 80).map((loi, idx) => (
              <View key={`${loi.ma_luat || idx}_${idx}`} style={styles.dong_nhat_ky}>
                <Text style={styles.chu_thuong}>
                  • <Text style={styles.chu_dam}>{loi.ma_luat || '—'}:</Text> {String(loi.canh_bao || loi.message || '').slice(0, 280)}
                </Text>
                <Text style={styles.chu_nho}>
                  {loi.phan_he || '—'} · {loi.truong_loi || '—'} · {loi.muc_do || '—'}
                </Text>
              </View>
            )) : (
              <Text style={styles.chu_nho}>Không có cảnh báo trong bản lưu.</Text>
            )}
            {dsLoi.length > 80 ? (
              <Text style={styles.chu_nho}>… và {dsLoi.length - 80} dòng khác (mở khôi phục vào kho để xem đủ).</Text>
            ) : null}
          </View>

          <View style={{ flexDirection: 'row', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
            <TouchableOpacity
              style={[styles.btn_xem, { paddingHorizontal: 16, paddingVertical: 10 }]}
              onPress={() => handleKhoiPhucTuLichSu(rec.id)}
            >
              <Text style={styles.txt_btn_nho}>↩ Khôi phục vào kho</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn_xoa, { paddingHorizontal: 16, paddingVertical: 10 }]}
              onPress={() => handleXoaBanGhiLichSu(rec.id, rec.ma_lk)}
            >
              <Text style={styles.txt_btn_nho}>🗑 Xóa bản lưu</Text>
            </TouchableOpacity>
          </View>
          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    );
  };

  const renderThanhDungLuongKho = () => {
    if (!thongTinDungLuong?.ho_tro) return null;
    const pct = Number(thongTinDungLuong.phan_tram_da_dung) || 0;
    const mauThanh = pct >= 90 ? '#EF5350' : pct >= 75 ? '#FFB74D' : '#80CBC4';
    return (
      <View style={styles.khung_dung_luong}>
        <Text style={styles.chu_dung_luong_tieu_de}>💾 Dung lượng lưu trữ trình duyệt (IndexedDB)</Text>
        <View style={styles.thanh_tien_trinh_dung_luong}>
          <View style={[styles.thanh_tien_trinh_dung_luong_fill, { width: `${Math.min(100, pct)}%`, backgroundColor: mauThanh }]} />
        </View>
        <Text style={styles.chu_dung_luong_chi_tiet}>
          Đã dùng {thongTinDungLuong.usage_hien_thi} / {thongTinDungLuong.quota_hien_thi}
          {' · '}Còn {thongTinDungLuong.con_lai_hien_thi}
          {' · '}{pct}%
          {thongTinDungLuong.luu_ben ? ' · ✅ Lưu bền (persist)' : ' · ⚠️ Chưa xin lưu bền — có thể bị dọn cache'}
          {thongTinDungLuong.nen_gzip_ho_tro ? ' · Nén gzip lịch sử GD' : ''}
        </Text>
        <Text style={styles.chu_dung_luong_phu}>
          Không giới hạn số bản trong app; khi đầy trình duyệt sẽ báo QuotaExceeded — nên sao lưu Excel/XML định kỳ.
        </Text>
      </View>
    );
  };

  const renderTabLichSuGiamDinh = () => (
    <React.Fragment>
      <View style={styles.khung_canh_bao_lich_su}>
        <Text style={styles.chu_canh_bao_lich_su}>
          Lịch sử giám định lưu gọn (XML1 + kết quả lỗi; XML chi tiết tham chiếu kho xml_import) — không bị xóa khi làm mới kho Dashboard.
          Không giới hạn số bản trong ứng dụng.
        </Text>
      </View>
      {renderThanhDungLuongKho()}
      <View style={styles.thanh_cong_cu}>
        <TextInput
          style={styles.o_tim_kiem}
          placeholder="🔍 Mã LK, tên BN, file XML, chẩn đoán…"
          placeholderTextColor="rgba(255,255,255,0.4)"
          value={tuKhoaLichSuGd}
          onChangeText={setTuKhoaLichSuGd}
          outlineStyle="none"
        />
        <TouchableOpacity
          onPress={handleLuuTatCaHoSoGdVaoLichSu}
          style={[styles.nut_quay_lai, { backgroundColor: 'rgba(56,142,60,0.35)', borderColor: 'rgba(129,199,132,0.55)' }]}
        >
          <Text style={styles.chu_nut_header}>💾 Lưu kho hiện tại</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => void taiDanhSachLichSuGd()}
          style={[styles.nut_quay_lai, { backgroundColor: 'rgba(25,118,210,0.35)', borderColor: 'rgba(100,181,246,0.55)' }]}
        >
          <Text style={styles.chu_nut_header}>🔄 Tải lại</Text>
        </TouchableOpacity>
        {danhSachLichSuGd.length > 0 ? (
          <TouchableOpacity
            onPress={handleXoaToanBoLichSuGd}
            style={[styles.nut_quay_lai, { backgroundColor: 'rgba(198,40,40,0.3)', borderColor: 'rgba(239,83,80,0.5)' }]}
          >
            <Text style={styles.chu_nut_header}>🗑 Xóa toàn bộ LS</Text>
          </TouchableOpacity>
        ) : null}
        <Text style={styles.thong_ke}>
          Lịch sử: {danhSachLichSuGd.length} bản lưu
          {danhSachLichSuGdLoc.length !== danhSachLichSuGd.length ? ` · Hiển thị: ${danhSachLichSuGdLoc.length}` : ''}
        </Text>
      </View>

      <View style={styles.khung_bang_ngang}>
        <View style={styles.dong_tieu_de_bang}>
          <Text style={[styles.o_header, { width: 140 }]}>MÃ LK</Text>
          <Text style={[styles.o_header, { width: 200 }]}>BỆNH NHÂN</Text>
          <Text style={[styles.o_header, { width: 90 }]}>LOẠI KCB</Text>
          <Text style={[styles.o_header, { flex: 1 }]}>CHẨN ĐOÁN RV</Text>
          <Text style={[styles.o_header, { width: 90 }]}>SỐ LỖI</Text>
          <Text style={[styles.o_header, { width: 180 }]}>THỜI ĐIỂM LƯU</Text>
          <Text style={[styles.o_header, { width: 220, textAlign: 'center' }]}>THAO TÁC</Text>
        </View>
        <ScrollView style={{ flex: 1 }}>
          {danhSachLichSuGdLoc.map((rec, idx) => (
            <View key={rec.id || `${rec.ma_lk}_${idx}`} style={[styles.dong_du_lieu, idx % 2 === 0 ? styles.dong_chan : styles.dong_le]}>
              <Text style={[styles.o_cell, { width: 140, fontWeight: 'bold', color: '#F48FB1' }]} numberOfLines={1}>{rec.ma_lk}</Text>
              <Text style={[styles.o_cell, { width: 200, color: '#90CAF9' }]} numberOfLines={1}>{String(rec.ten_bn || '—').toUpperCase()}</Text>
              <Text style={[styles.o_cell, { width: 90 }]} numberOfLines={1}>{rec.ma_loai_kcb || '—'}</Text>
              <Text style={[styles.o_cell, { flex: 1 }]} numberOfLines={2}>{rec.chan_doan_rv || '—'}</Text>
              <Text style={[styles.o_cell, { width: 90, color: rec.so_loi > 0 ? '#FF6B6B' : '#81C784', fontWeight: 'bold' }]}>{rec.so_loi || 0}</Text>
              <Text style={[styles.o_cell, { width: 180 }]} numberOfLines={2}>{rec.thoi_gian || rec.ghi_luc_iso}</Text>
              <View style={[styles.o_cell, { width: 220, flexDirection: 'row', justifyContent: 'center', gap: 8 }]}>
                <TouchableOpacity style={styles.btn_xem} onPress={() => void handleXemChiTietLichSuGd(rec)}>
                  <Text style={styles.txt_btn_nho}>Xem</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.btn_xem} onPress={() => handleKhoiPhucTuLichSu(rec.id)}>
                  <Text style={styles.txt_btn_nho}>↩ Kho</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.btn_xoa} onPress={() => handleXoaBanGhiLichSu(rec.id, rec.ma_lk)}>
                  <Text style={styles.txt_btn_nho}>🗑</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
          {danhSachLichSuGdLoc.length === 0 && (
            <Text style={styles.chu_trong}>
              Chưa có bản lưu giám định. Lưu hồ sơ sau khi chạy kiểm tra (Dashboard) hoặc bấm «Lưu kho hiện tại».
            </Text>
          )}
        </ScrollView>
      </View>
    </React.Fragment>
  );

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
              <TouchableOpacity onPress={() => void handleExportExcel()} style={[styles.nut_quay_lai, { backgroundColor: 'rgba(56,142,60,0.3)', borderColor: 'rgba(56,142,60,0.5)' }]}>
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
        <View style={styles.thanh_the_kho}>
          {DANH_SACH_THE_KHO.map((tab) => {
            const active = tabHienTai === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[styles.the_kho, active && styles.the_kho_active]}
                onPress={() => {
                  setTabHienTai(tab.id);
                  setHoSoDangXem(null);
                  setHoSoDangSua(null);
                  setBanGhiLichSuDangXem(null);
                }}
              >
                <Text style={[styles.chu_the_kho, active && styles.chu_the_kho_active]}>
                  {tab.icon} {tab.label}
                </Text>
                <Text style={styles.chu_the_kho_phu}>{tab.hint}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {renderThanhDungLuongKho()}

        {banGhiLichSuDangXem ? renderModalChiTietLichSuGd()
          : hoSoDangSua ? renderModalSua()
          : hoSoDangXem ? renderChiTietHoSo()
          : tabHienTai === TAB_LICH_SU_GD ? renderTabLichSuGiamDinh()
          : (
          <React.Fragment>
            <View style={styles.thanh_cong_cu}>
              <TextInput
                style={styles.o_tim_kiem}
                placeholder="🔍 Mã LK, tên BN, MA_LOAI_KCB hoặc loại KCB…"
                placeholderTextColor="rgba(255,255,255,0.4)"
                value={tuKhoa}
                onChangeText={setTuKhoa}
                outlineStyle="none"
              />
              <TouchableOpacity onPress={handleNhapXmlGoi130VaoKho} style={[styles.nut_quay_lai, { backgroundColor: 'rgba(106,27,154,0.35)', borderColor: 'rgba(186,104,200,0.5)' }]}>
                <Text style={styles.chu_nut_header}>📥 Import XML 130</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleLuuTatCaHoSoGdVaoLichSu}
                style={[styles.nut_quay_lai, { backgroundColor: 'rgba(0,105,92,0.35)', borderColor: 'rgba(128,203,196,0.55)' }]}
              >
                <Text style={styles.chu_nut_header}>🕘 Lưu LS giám định</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => void handleXuatExcelBaoCao()} style={[styles.nut_quay_lai, { backgroundColor: 'rgba(56,142,60,0.35)', borderColor: 'rgba(129,199,132,0.55)' }]}>
                <Text style={styles.chu_nut_header}>📊 Excel báo cáo</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => void handleInDanhSachKho()} style={[styles.nut_quay_lai, { backgroundColor: 'rgba(25,118,210,0.35)', borderColor: 'rgba(100,181,246,0.55)' }]}>
                <Text style={styles.chu_nut_header}>🖨 In / PDF</Text>
              </TouchableOpacity>
              <Text style={styles.thong_ke}>
                Tổng: {danhSachKho.length} hồ sơ
                {danhSachLoc.length !== danhSachKho.length ? ` · Hiển thị: ${danhSachLoc.length}` : ''}
              </Text>
            </View>

            {/* BẢNG ĐÃ BỎ SCROLL NGANG (HIỂN THỊ ĐÚNG 1 MÀN HÌNH - KHÔNG KÉO) */}
            <View style={styles.khung_bang_ngang}>
              <View style={styles.dong_tieu_de_bang}>
                <Text style={[styles.o_header, { width: 60 }]}></Text>
                <TouchableOpacity onPress={() => handleSort('ma_lk')}><Text style={[styles.o_header, { width: 140 }]}>MÃ LK {sortConfig.key === 'ma_lk' && (sortConfig.direction === 'asc' ? '🔼' : '🔽')}</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => handleSort('ten_bn')}><Text style={[styles.o_header, { width: 220 }]}>BỆNH NHÂN {sortConfig.key === 'ten_bn' && (sortConfig.direction === 'asc' ? '🔼' : '🔽')}</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => handleSort('ma_loai_kcb')}><Text style={[styles.o_header, { width: 200 }]}>LOẠI KCB {sortConfig.key === 'ma_loai_kcb' && (sortConfig.direction === 'asc' ? '🔼' : '🔽')}</Text></TouchableOpacity>
                <TouchableOpacity style={{ flex: 1 }} onPress={() => handleSort('CHAN_DOAN_RV')}><Text style={styles.o_header}>CHẨN ĐOÁN RV {sortConfig.key === 'CHAN_DOAN_RV' && (sortConfig.direction === 'asc' ? '🔼' : '🔽')}</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => handleSort('T_BHTT')}><Text style={[styles.o_header, { width: 150 }]}>BHYT CHI {sortConfig.key === 'T_BHTT' && (sortConfig.direction === 'asc' ? '🔼' : '🔽')}</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => handleSort('T_BNTT')}><Text style={[styles.o_header, { width: 150 }]}>BN CHI {sortConfig.key === 'T_BNTT' && (sortConfig.direction === 'asc' ? '🔼' : '🔽')}</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => handleSort('thoi_gian')}><Text style={[styles.o_header, { width: 180 }]}>THỜI GIAN {sortConfig.key === 'thoi_gian' && (sortConfig.direction === 'asc' ? '🔼' : '🔽')}</Text></TouchableOpacity>
                <Text style={[styles.o_header, { width: 220 }]}>TRẠNG THÁI</Text>
                <Text style={[styles.o_header, { width: 280, textAlign: 'center' }]}>THAO TÁC</Text>
              </View>

              <ScrollView style={{ flex: 1 }}>
                {danhSachLoc.map((hs, idx) => {
                  const checkLỗi = hs.ket_qua_giam_dinh?.length > 0;
                  const { x1 } = getSafeXML(hs);
                  const maLK = hs.ma_lk || x1.MA_LK || `ERR_${idx}`;
                  const tenBN = hs.ten_benh_nhan || hs.ten_bn || x1.HO_TEN || "Chưa cập nhật";
                  const loaiKcb = layChuoiHienThiLoaiKhamChuaBenh(x1);

                  return (
                    <View key={maLK} style={[styles.dong_du_lieu, idx % 2 === 0 ? styles.dong_chan : styles.dong_le, selectedIds.includes(maLK) && { backgroundColor: 'rgba(233,30,99,0.12)' }]}>
                      <TouchableOpacity style={[styles.o_cell, { width: 60, alignItems: 'center' }]} onPress={() => toggleSelectRow(maLK)}>
                        <View style={[styles.checkbox, selectedIds.includes(maLK) && styles.checkbox_active]} />
                      </TouchableOpacity>

                      <Text style={[styles.o_cell, { width: 140, fontWeight: 'bold', color: '#F48FB1' }]} numberOfLines={1}>{maLK}</Text>
                      <Text style={[styles.o_cell, { width: 220, color: '#90CAF9', fontWeight: 'bold' }]} numberOfLines={1}>{String(tenBN).toUpperCase()}</Text>
                      <Text style={[styles.o_cell, { width: 200, color: '#CE93D8', fontWeight: '600' }]} numberOfLines={2}>{loaiKcb}</Text>
                      <Text style={[styles.o_cell, { flex: 1 }]} numberOfLines={2}>{x1.CHAN_DOAN_RV || 'N/A'}</Text>
                      <Text style={[styles.o_cell, { width: 150, color: '#81C784', fontWeight: 'bold' }]} numberOfLines={1}>{Number(x1.T_BHTT || 0).toLocaleString()}</Text>
                      <Text style={[styles.o_cell, { width: 150, color: '#FFB74D', fontWeight: 'bold' }]} numberOfLines={1}>{Number(x1.T_BNTT || 0).toLocaleString()}</Text>
                      <Text style={[styles.o_cell, { width: 180 }]} numberOfLines={2}>{hs.thoi_gian}</Text>
                      <Text style={[styles.o_cell, { width: 220, color: checkLỗi ? '#FF6B6B' : '#81C784', fontWeight: 'bold' }]} numberOfLines={1}>
                        {checkLỗi ? `⚠️ Vi phạm (${hs.ket_qua_giam_dinh.length})` : '✅ Hợp lệ'}
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
    ...Platform.select({ web: { backgroundImage: CD.web.gradient_bg } }),
  },

  // ── HEADER ──
  thanh_tieu_de: {
    ...Platform.select({ web: { backgroundImage: CD.web.gradient_header, backdropFilter: CD.web.blur_header, boxShadow: CD.web.shadow_header } }),
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
  thanh_cong_cu: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 },

  // ── TÌM KIẾM ──
  o_tim_kiem: {
    backgroundColor: CD.bg.glass_input, borderWidth: 1, borderColor: CD.border.input,
    borderRadius: 12, color: CD.text.primary, fontSize: 22, paddingVertical: 14, paddingHorizontal: 16,
    width: 560,
    ...Platform.select({ web: { backdropFilter: CD.web.blur_input, outlineStyle: 'none' } }),
  },
  thong_ke: { fontSize: 20, fontWeight: '700', color: CD.brand.mauNhat, fontFamily: CD.font.family },

  thanh_the_kho: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  the_kho: {
    flex: 1,
    minWidth: 260,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: CD.border.glass_md,
    backgroundColor: CD.bg.glass_input,
  },
  the_kho_active: {
    borderColor: 'rgba(233,30,99,0.65)',
    backgroundColor: 'rgba(233,30,99,0.14)',
  },
  chu_the_kho: {
    fontFamily: CD.font.family,
    fontSize: 22,
    fontWeight: '800',
    color: CD.text.secondary,
  },
  chu_the_kho_active: {
    color: CD.text.primary,
  },
  chu_the_kho_phu: {
    fontFamily: CD.font.family,
    fontSize: 16,
    color: CD.text.muted,
    marginTop: 4,
    lineHeight: 22,
  },
  khung_canh_bao_lich_su: {
    marginBottom: 14,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(128,203,196,0.35)',
    backgroundColor: 'rgba(0,105,92,0.12)',
  },
  chu_canh_bao_lich_su: {
    fontFamily: CD.font.family,
    fontSize: 18,
    color: '#B2DFDB',
    lineHeight: 28,
  },
  khung_dung_luong: {
    marginBottom: 14,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(144,202,249,0.35)',
    backgroundColor: 'rgba(25,118,210,0.1)',
  },
  chu_dung_luong_tieu_de: {
    fontFamily: CD.font.family,
    fontSize: 18,
    fontWeight: '800',
    color: '#90CAF9',
    marginBottom: 8,
  },
  thanh_tien_trinh_dung_luong: {
    height: 10,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
    marginBottom: 8,
  },
  thanh_tien_trinh_dung_luong_fill: {
    height: '100%',
    borderRadius: 6,
  },
  chu_dung_luong_chi_tiet: {
    fontFamily: CD.font.family,
    fontSize: 17,
    color: CD.text.primary,
    lineHeight: 26,
  },
  chu_dung_luong_phu: {
    fontFamily: CD.font.family,
    fontSize: 15,
    color: CD.text.muted,
    marginTop: 6,
    lineHeight: 22,
  },

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
    ...Platform.select({ web: { backgroundImage: CD.web.gradient_header, backdropFilter: CD.web.blur_header, boxShadow: CD.web.shadow_header } }),
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
  o_tim_chi_tiet_xml: {
    backgroundColor: CD.bg.glass_input,
    borderWidth: 1,
    borderColor: 'rgba(179,229,252,0.28)',
    borderRadius: 12,
    color: CD.text.primary,
    fontSize: 18,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontFamily: CD.font.family,
    ...Platform.select({ web: { backdropFilter: CD.web.blur_input, outlineStyle: 'none' } }),
  },
  txt_goi_y_tim_xml: {
    fontFamily: CD.font.family,
    fontSize: 15,
    color: CD.text.muted,
    marginTop: 8,
    fontStyle: 'italic',
  },
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
  chi_tiet_toolbar: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  btn_lien_ket_xml: {
    backgroundColor: 'rgba(2,136,209,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(2,136,209,0.38)',
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 14,
    ...Platform.select({ web: { cursor: CD.web.cursor_pointer } }),
  },
  txt_btn_lien_ket_xml: {
    color: '#A5D6FF',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: CD.font.family,
  },
  the_loi_hien_tai: {
    backgroundColor: 'rgba(255,193,7,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,193,7,0.24)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  btn_sua_loi_truc_tiep: {
    alignSelf: 'flex-start',
    marginTop: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    ...Platform.select({ web: { cursor: CD.web.cursor_pointer } }),
  },
  xml_header_row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  xml_meta_text: {
    fontFamily: CD.font.family,
    fontSize: 16,
    color: CD.text.muted,
    marginTop: -6,
  },
  khoi_xml_chi_tiet: {
    backgroundColor: CD.bg.glass_card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: CD.border.glass,
    padding: 14,
    ...Platform.select({ web: { backdropFilter: CD.web.blur_card, WebkitBackdropFilter: CD.web.blur_card, boxShadow: CD.web.shadow_card } }),
  },
  khoi_xml_dong: {
    backgroundColor: CD.bg.glass_card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: CD.border.glass,
    padding: 14,
    marginBottom: 14,
    ...Platform.select({ web: { backdropFilter: CD.web.blur_card, WebkitBackdropFilter: CD.web.blur_card, boxShadow: CD.web.shadow_card } }),
  },
  khoi_xml_dong_header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  khoi_xml_dong_title: {
    fontFamily: CD.font.family,
    fontSize: 18,
    fontWeight: '800',
    color: CD.text.primary,
  },
  btn_sua_dong_xml: {
    backgroundColor: 'rgba(233,30,99,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(233,30,99,0.28)',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    ...Platform.select({ web: { cursor: CD.web.cursor_pointer } }),
  },
  txt_btn_sua_dong_xml: {
    color: '#F8BBD0',
    fontFamily: CD.font.family,
    fontSize: 15,
    fontWeight: '700',
  },
  luoi_truong_xml: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  o_truong_xml: {
    flexGrow: 1,
    flexBasis: Platform.OS === 'web' ? 320 : '100%',
    maxWidth: Platform.OS === 'web' ? '49%' : '100%',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: 12,
  },
  o_truong_xml_loi: {
    backgroundColor: 'rgba(255,107,107,0.10)',
    borderColor: 'rgba(255,107,107,0.42)',
  },
  nhan_truong_xml: {
    fontFamily: CD.font.family,
    fontSize: 15,
    fontWeight: '800',
    color: '#90CAF9',
    marginBottom: 6,
  },
  nhan_truong_xml_loi: {
    color: '#FFCDD2',
  },
  gia_tri_truong_xml: {
    fontFamily: CD.font.family,
    fontSize: 17,
    color: CD.text.table_cell,
    lineHeight: 24,
  },
  gia_tri_truong_xml_loi: {
    color: '#FFF5F5',
  },
  khoi_xml_dong_loi: {
    borderColor: 'rgba(255,107,107,0.36)',
    backgroundColor: 'rgba(255,107,107,0.06)',
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
