/**
 * ============================================================
 * FILE: tien_ich/nhap_file_xml.jsx (PHIÊN BẢN ĐỒNG BỘ 130)
 * MỤC ĐÍCH: Nhập XML, quét lỗi tĩnh (kiem_tra_xml) & quét lỗi động (dong_co_giam_dinh).
 * CẬP NHẬT: Tối ưu hóa luồng đọc File (Giải quyết triệt để lỗi Chunk File/Tràn RAM).
 * FIX CÚ PHÁP: Cân bằng thẻ JSX, xử lý Unterminated string literal.
 * CHUYỂN GIAO: Chuyển quyền lưu kho cho tong_quan.jsx để tránh xung đột.
 * ============================================================
 */

import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { xuLyFileXML130Va4210 } from '../dich_vu/his_api';
import { chayBoMayGiamDinhV3 } from './dong_co_giam_dinh';
import {
  damBaoMigrateLichSuXmlSangKhoChinhThuc,
  layDanhSachMaLKTuKho,
  layLichSuImportXml,
  luuBanGhiImportXml,
} from './kho_du_lieu';
import { kiemTraDinhDangXML } from './kiem_tra_xml';

const TRANG_THAI_FILE = {
  HOP_LE: 'HOP_LE',
  TRUNG_LAP: 'TRUNG_LAP',
  THAY_THE: 'THAY_THE',
  TU_CHOI: 'TU_CHOI',
  LOI: 'LOI',
  CANH_BAO: 'CANH_BAO', 
};

const chuanHoaMaLK = (giaTri) => String(giaTri || '').trim().toUpperCase();

const laHoSoCoTheChuyenTiep = (file) => {
  if (!file) return false;
  if (typeof file.coTheChuyenTiep === 'boolean') return file.coTheChuyenTiep;
  if ([TRANG_THAI_FILE.HOP_LE, TRANG_THAI_FILE.THAY_THE, TRANG_THAI_FILE.CANH_BAO].includes(file.trangThai)) {
    return true;
  }
  return Array.isArray(file.duLieu) && file.duLieu.length > 0;
};

const laHoSoTrungLap = (file) => Boolean(file?.coTrungLap || [TRANG_THAI_FILE.TRUNG_LAP, TRANG_THAI_FILE.THAY_THE].includes(file?.trangThai));

const layNhanTrangThaiHienThi = (file) => {
  if (file?.trangThai === TRANG_THAI_FILE.THAY_THE) return 'SẼ GHI ĐÈ';
  if (laHoSoTrungLap(file)) return 'TRÙNG LẶP';
  if (laHoSoCoTheChuyenTiep(file) && (file?.coCanhBao || (file?.dsLoi?.length || 0) > 0)) return 'CÓ LỖI';
  if (laHoSoCoTheChuyenTiep(file)) return 'SẴN SÀNG';
  return 'LỖI';
};

const layMauTrangThai = (file) => {
  if (file?.trangThai === TRANG_THAI_FILE.THAY_THE) return { color: '#1565C0' };
  if (laHoSoTrungLap(file)) return { color: '#F57C00' };
  if (laHoSoCoTheChuyenTiep(file) && (file?.coCanhBao || (file?.dsLoi?.length || 0) > 0)) return { color: '#FF9800' };
  if (laHoSoCoTheChuyenTiep(file)) return { color: '#4CAF50' };
  return { color: '#F44336' };
};

const layMaLKTuHoSo = (hoSo = {}, maLKMacDinh = '') => {
  return chuanHoaMaLK(
    hoSo?.ma_lk
    || hoSo?.xml1?.MA_LK
    || hoSo?.XML1?.MA_LK
    || maLKMacDinh
  );
};

const hienThongBao = (tieuDe, noiDung) => {
  if (Platform.OS === 'web' && typeof window !== 'undefined' && typeof window.alert === 'function') {
    window.alert(`${tieuDe}\n\n${noiDung}`);
    return;
  }
  Alert.alert(tieuDe, noiDung);
};

const DEFAULT_TEXT_BUTTON = '📂 CHỌN HỒ SƠ XML ĐỂ KIỂM TRA';

const taoKhoaGopFile = (file = {}) => {
  const maLK = chuanHoaMaLK(file?.ma_lk);
  if (maLK) return `MA_LK:${maLK}`;
  const tenFile = String(file?.tenFile || '').trim().toLowerCase();
  if (tenFile) return `FILE:${tenFile}`;
  return `ID:${String(file?.id || '')}`;
};

const dongBoDanhSachFile = (danhSach = []) => {
  const mapTrungLap = new Map();
  danhSach.forEach((file) => {
    const maLK = chuanHoaMaLK(file?.ma_lk);
    if (!maLK) return;
    mapTrungLap.set(maLK, (mapTrungLap.get(maLK) || 0) + 1);
  });

  return danhSach.map((file) => {
    const maLK = chuanHoaMaLK(file?.ma_lk);
    const trungLapNoiBo = Boolean(maLK && (mapTrungLap.get(maLK) || 0) > 1);
    const coTrungLap = Boolean(file?.coTrungLap || trungLapNoiBo);
    let trangThai = file?.trangThai;

    if (coTrungLap && trangThai === TRANG_THAI_FILE.HOP_LE) {
      trangThai = TRANG_THAI_FILE.TRUNG_LAP;
    }

    return {
      ...file,
      coTrungLap,
      trangThai,
    };
  });
};

const hopNhatDanhSachFile = (danhSachCu = [], danhSachMoi = [], { multiple = true } = {}) => {
  const nguon = multiple ? [...danhSachCu, ...danhSachMoi] : [...danhSachMoi];
  const mapFile = new Map();
  nguon.forEach((file) => {
    mapFile.set(taoKhoaGopFile(file), file);
  });
  return dongBoDanhSachFile(Array.from(mapFile.values()));
};

/**
 * Nạp ngữ cảnh trùng MA_LK (lịch sử + kho) — dùng cho kiểm tra tự động theo thư mục.
 */
export const taiNguonPhuThuocNhapXml = async () => {
  try {
    await damBaoMigrateLichSuXmlSangKhoChinhThuc();
    const lichSuGiamDinh = await layLichSuImportXml({ gioiHan: 400 });
    const dsMaLKTrongKho = await layDanhSachMaLKTuKho();
    const danhSachMaLKDaCo = Array.from(
      new Set(
        [
          ...lichSuGiamDinh.map((hs) => chuanHoaMaLK(hs?.ma_lk)),
          ...(Array.isArray(dsMaLKTrongKho) ? dsMaLKTrongKho : []).map((maLK) => chuanHoaMaLK(maLK)),
        ].filter(Boolean),
      ),
    );
    return { lichSuGiamDinh, danhSachMaLKDaCo };
  } catch (err) {
    console.warn('[NhapFileXML] taiNguonPhuThuocNhapXml:', err);
    return { lichSuGiamDinh: [], danhSachMaLKDaCo: [] };
  }
};

/**
 * Đọc một File (web), parse QĐ130, chạy kiểm tra tĩnh + engine kiểm tra JS (cùng logic màn nhập file).
 */
export const xuLyMotFileXmlChoBanGiamDinh = (file, { lichSuGiamDinh = [], danhSachMaLKDaCo = [] } = {}) => {
  return new Promise((resolve) => {
    if (file.size > 10 * 1024 * 1024) {
      resolve({
        id: Math.random().toString(36),
        tenFile: file.name,
        ma_lk: 'LOI_DUNG_LUONG',
        trangThai: TRANG_THAI_FILE.LOI,
        lyDoLoi: 'File vượt quá 10MB, nguy cơ tràn bộ nhớ.',
        coTrungLap: false,
        coCanhBao: false,
        coTheChuyenTiep: false,
      });
      return;
    }

    const reader = new FileReader();

    reader.onerror = () => {
      resolve({
        id: Math.random().toString(36),
        tenFile: file.name,
        ma_lk: 'LOI',
        trangThai: TRANG_THAI_FILE.LOI,
        lyDoLoi: 'File bị hỏng hoặc lỗi phân mảnh (Chunk Error).',
        coTrungLap: false,
        coCanhBao: false,
        coTheChuyenTiep: false,
      });
    };

    reader.onload = async (e) => {
      try {
        const rawXML = e.target.result;
        const ketQuaHoSo = xuLyFileXML130Va4210(rawXML);

        const arr = Array.isArray(ketQuaHoSo) ? ketQuaHoSo : [ketQuaHoSo];
        const hsDauTien = arr[0] || {};
        const xml1 = hsDauTien.xml1 || hsDauTien.XML1 || {};

        const maLKGoc = String(xml1.MA_LK || '').trim();
        const maLK = maLKGoc || 'KHONG_XAC_DINH';
        const maLKChuan = chuanHoaMaLK(maLKGoc);
        const maBN = xml1.MA_BN || 'KHONG_XAC_DINH';
        const hoSoCu = lichSuGiamDinh.find((hs) => chuanHoaMaLK(hs?.ma_lk) === maLKChuan);
        const coTrungLap = Boolean(maLKChuan && danhSachMaLKDaCo.includes(maLKChuan));

        let trangThai = coTrungLap ? TRANG_THAI_FILE.TRUNG_LAP : TRANG_THAI_FILE.HOP_LE;
        let dsLoi = [];
        let lyDoLoi = '';
        let chiTietLoiCDSS = [];
        let coCanhBao = false;
        let coTheChuyenTiep = false;

        let xmlImportId = null;
        if (maLK !== 'KHONG_XAC_DINH' && maLKChuan) {
          try {
            const recImport = await luuBanGhiImportXml({
              ma_lk: maLKChuan,
              ten_file: file.name,
              raw_xml: rawXML,
              nguon: 'quyet_scan',
            });
            xmlImportId = recImport?.id || null;
          } catch (storageError) {
            console.warn('[NhapFileXML] Không lưu được XML gốc vào kho chính thức:', storageError?.message || storageError);
          }
        }

        if (maLK === 'KHONG_XAC_DINH') {
          trangThai = TRANG_THAI_FILE.LOI;
          lyDoLoi = 'Không tìm thấy thẻ <MA_LK> (Mã liên kết).';
        } else if (arr.length > 0) {
          coTheChuyenTiep = true;
          const ketQuaValidate = kiemTraDinhDangXML(hsDauTien);
          const rawChiTietLoi = await chayBoMayGiamDinhV3(hsDauTien);

          chiTietLoiCDSS = rawChiTietLoi.map((loi) => ({
            ...loi,
            ma_bn: maBN,
          }));

          if (!ketQuaValidate.hop_le || chiTietLoiCDSS.length > 0) {
            coCanhBao = true;
            if (!coTrungLap && trangThai === TRANG_THAI_FILE.HOP_LE) trangThai = TRANG_THAI_FILE.CANH_BAO;
            dsLoi = [
              ...ketQuaValidate.danh_sach_loi,
              ...chiTietLoiCDSS.map(
                (l) =>
                  `[${l.truong_loi || l.phan_he}] ${l.canh_bao} (Mã BN: ${l.ma_bn} - ĐK: ${l.dieu_kien || 'N/A'})`,
              ),
            ];
          }
        }

        resolve({
          id: Math.random().toString(36),
          tenFile: file.name,
          kichThuoc: (file.size / 1024).toFixed(1) + ' KB',
          ma_lk: maLK,
          xmlImportId,
          duLieu: arr.map((hs) => ({
            ...hs,
            _ten_file: file.name,
            _ds_loi: dsLoi,
            ten_file_goc: file.name,
            xml_import_id: xmlImportId,
          })),
          ngayGiamDinhCu: hoSoCu?.ngay_giam_dinh || null,
          trangThai,
          coTrungLap,
          coCanhBao,
          coTheChuyenTiep,
          lyDoLoi,
          dsLoi,
          chiTietLoi: chiTietLoiCDSS,
          tomTatData: {
            hoTen: xml1.HO_TEN || 'N/A',
            maBN,
            tienTrinh: xml1.NGAY_VAO && xml1.NGAY_RA ? `${xml1.NGAY_VAO} -> ${xml1.NGAY_RA}` : 'N/A',
            xml2: hsDauTien.xml2?.length || hsDauTien.XML2?.length || 0,
            xml3: hsDauTien.xml3?.length || hsDauTien.XML3?.length || 0,
            xml4: hsDauTien.xml4?.length || hsDauTien.XML4?.length || 0,
            xml5: hsDauTien.xml5?.length || hsDauTien.XML5?.length || 0,
          },
        });
      } catch (err) {
        resolve({
          id: Math.random().toString(36),
          tenFile: file.name,
          ma_lk: 'LOI',
          trangThai: TRANG_THAI_FILE.LOI,
          lyDoLoi: `Lỗi parser: ${err.message}`,
          coTrungLap: false,
          coCanhBao: false,
          coTheChuyenTiep: false,
        });
      }
    };
    reader.readAsText(file, 'UTF-8');
  });
};

/** Chuyển một bản ghi kết quả quét file sang mảng hồ sơ gửi kho (giống nút "Chuyển dữ liệu"). */
export const chuyenKetQuaFileSangMangHoSoKho = (f) => {
  if (!laHoSoCoTheChuyenTiep(f)) return [];
  return (Array.isArray(f.duLieu) ? f.duLieu : [])
    .map((hoSo) => {
      const maLKHoSo = layMaLKTuHoSo(hoSo, f.ma_lk);
      return {
        ...hoSo,
        ma_lk: maLKHoSo,
        ten_file_goc: hoSo.ten_file_goc || f.tenFile || hoSo._ten_file || '',
        xml_import_id: hoSo.xml_import_id || f.xmlImportId || '',
        thoi_gian: new Date().toLocaleString('vi-VN'),
        _tu_dong_ghi_de: laHoSoTrungLap(f),
        _trang_thai_nhap: f.trangThai,
        _co_canh_bao_nhap: Boolean(f.coCanhBao),
        ket_qua_giam_dinh: f.chiTietLoi || [],
      };
    })
    .filter((hoSo) => Boolean(hoSo.ma_lk));
};

const NhapFileXML = ({ onDuLieuSanSang, multiple = true, styleButton, textButton = DEFAULT_TEXT_BUTTON }) => {
  const [dangXuLy, setDangXuLy] = useState(false);
  const [dangGuiDuLieu, setDangGuiDuLieu] = useState(false);
  const [thongBaoTienDo, setThongBaoTienDo] = useState('');
  const [danhSachFile, setDanhSachFile] = useState([]);
  const [lichSuGiamDinh, setLichSuGiamDinh] = useState([]);
  const [danhSachMaLKDaCo, setDanhSachMaLKDaCo] = useState([]);
  const [hienThiBangNhap, setHienThiBangNhap] = useState(false);
  const [inputId] = useState(() => `import-xml-${Math.random().toString(36).slice(2, 11)}`);
  
  const [hienThiModal, setHienThiModal] = useState(false);
  const [fileChiTiet, setFileChiTiet] = useState(null);
  const laCheDoNutNho = Boolean(styleButton || textButton !== DEFAULT_TEXT_BUTTON);

  useEffect(() => {
    const taiLichSu = async () => {
      try {
        await damBaoMigrateLichSuXmlSangKhoChinhThuc();
        const lichSuDaLuu = await layLichSuImportXml({ gioiHan: 400 });
        setLichSuGiamDinh(lichSuDaLuu);

        const dsMaLKTrongKho = await layDanhSachMaLKTuKho();
        const tapMaLKDaCo = new Set([
          ...lichSuDaLuu.map((hs) => chuanHoaMaLK(hs?.ma_lk)),
          ...((Array.isArray(dsMaLKTrongKho) ? dsMaLKTrongKho : []).map((maLK) => chuanHoaMaLK(maLK))),
        ].filter(Boolean));
        setDanhSachMaLKDaCo(Array.from(tapMaLKDaCo));
      } catch (err) { console.error('[NhapFileXML] Lỗi tải lịch sử:', err); }
    };
    taiLichSu();
  }, []);

  const processSingleFile = (file) =>
    xuLyMotFileXmlChoBanGiamDinh(file, { lichSuGiamDinh, danhSachMaLKDaCo });

  const xuLyChonFileWeb = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setDangXuLy(true);
    setThongBaoTienDo('Đang bóc tách & quét luật QĐ130...');

    try {
      const mangFileHopLe = Array.from(files).filter(f => f.name.toLowerCase().endsWith('.xml'));
      
      const CHUNK_SIZE = 3; 
      let ketQuaTong = [];

      for (let i = 0; i < mangFileHopLe.length; i += CHUNK_SIZE) {
        setThongBaoTienDo(`Đang kiểm tra: ${Math.min(i + CHUNK_SIZE, mangFileHopLe.length)} / ${mangFileHopLe.length}...`);
        
        const chunk = mangFileHopLe.slice(i, i + CHUNK_SIZE);
        const chunkResults = await Promise.all(chunk.map(file => processSingleFile(file)));
        
        ketQuaTong = [...ketQuaTong, ...chunkResults];
        
        await new Promise(resolve => setTimeout(resolve, 150)); 
      }
      setDanhSachFile((prev) => hopNhatDanhSachFile(prev, ketQuaTong, { multiple }));
      if (laCheDoNutNho) setHienThiBangNhap(true);
    } finally {
      setDangXuLy(false);
      setThongBaoTienDo('');
      if (event.target) event.target.value = null; 
    }
  };

  const bamChonFile = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xml';
    input.multiple = multiple;
    input.onchange = (e) => xuLyChonFileWeb(e);
    input.click();
  };

  const moTrinhChonFile = () => {
    if (Platform.OS === 'web') {
      const input = document.getElementById(inputId);
      if (input) {
        input.click();
        return;
      }
    }
    bamChonFile();
  };

  const lamMoiDanhSach = () => {
    setDanhSachFile([]);
    if (laCheDoNutNho) setHienThiBangNhap(false);
  };

  const capNhatTrangThai = (id, trangThaiMoi) => {
    setDanhSachFile(prev => prev.map((f) => (f.id === id ? { ...f, trangThai: trangThaiMoi } : f)));
  };

  const loaiBoFile = (id) => {
    setDanhSachFile(prev => prev.filter(f => f.id !== id));
  };

  const moChiTietFile = (file) => {
    setFileChiTiet(file);
    setHienThiModal(true);
  };

  const xuLyGuiDuLieu = async () => {
    const dsDuocDuyet = danhSachFile.filter((f) => laHoSoCoTheChuyenTiep(f));
    const dsKhongChuyenDuoc = danhSachFile.filter((f) => !laHoSoCoTheChuyenTiep(f));

    if (dsDuocDuyet.length === 0) {
      return hienThongBao('Thông báo', 'Không có hồ sơ hợp lệ để chuyển đến bàn làm việc.');
    }

    setDangGuiDuLieu(true);
    try {
      const thoiGian = new Date().toLocaleString('vi-VN');
      for (const f of dsDuocDuyet) {
        const maLKChuan = chuanHoaMaLK(f.ma_lk);
        if (!maLKChuan || f.xmlImportId) continue;
        try {
          await luuBanGhiImportXml({
            ma_lk: maLKChuan,
            ten_file: f.tenFile,
            raw_xml: '',
            nguon: 'chuyen_du_lieu',
            ngay_giam_dinh: thoiGian,
          });
        } catch (storageError) {
          console.warn('[NhapFileXML] Không ghi metadata import khi chuyển dữ liệu:', storageError);
        }
      }
      const lichSuDaLuu = await layLichSuImportXml({ gioiHan: 400 });
      setLichSuGiamDinh(lichSuDaLuu);
      setDanhSachMaLKDaCo((prev) => Array.from(new Set([
        ...prev,
        ...dsDuocDuyet.map((f) => chuanHoaMaLK(f.ma_lk)),
      ].filter(Boolean))));

      const tatCaDuLieu = dsDuocDuyet.flatMap((f) => chuyenKetQuaFileSangMangHoSoKho(f));

      if (tatCaDuLieu.length === 0) {
        throw new Error('Không suy ra được MA_LK hợp lệ để chuyển sang bàn kiểm tra.');
      }
      
      // TRUYỀN DỮ LIỆU ĐÃ DUYỆT LÊN TỔNG QUAN, KHÔNG TỰ LƯU KHO
      if (onDuLieuSanSang) {
          await onDuLieuSanSang(tatCaDuLieu);
      }

      if (dsKhongChuyenDuoc.length > 0) {
        hienThongBao(
          'Một số file không chuyển được',
          `${dsKhongChuyenDuoc.length} file không có dữ liệu XML hợp lệ nên chưa thể đưa sang bàn kiểm tra.`
        );
      }

      setDanhSachFile([]); 
      if (laCheDoNutNho) setHienThiBangNhap(false);
    } catch (err) {
      console.error('[NhapFileXML] Lỗi chuyển dữ liệu:', err);
      hienThongBao('Lỗi xử lý', err?.message || 'Không xác định được lỗi khi chuyển dữ liệu.');
    } finally {
      setDangGuiDuLieu(false);
    }
  };

  const noiDungNhapLieu = (
    <View style={{ flex: 1, width: '100%' }}>
      {danhSachFile.length > 0 ? (
        <View style={styles.khung_danh_sach}>
          <View style={styles.thanh_tieu_de_ds}>
            <View>
              <Text style={styles.chu_tieu_de_ds}>📋 KẾT QUẢ KIỂM TRA XML ({danhSachFile.length} FILE)</Text>
              <Text style={styles.tom_tat}>Đối soát cấu trúc QĐ 130 & Quy tắc y khoa.</Text>
            </View>
            <View style={styles.nhom_nut_tieu_de_ds}>
              <TouchableOpacity style={styles.nut_them_file} onPress={moTrinhChonFile} disabled={dangXuLy}>
                <Text style={styles.chu_nut_them_file}>{multiple ? '➕ Thêm file' : '🔄 Chọn lại file'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.nut_huy} onPress={lamMoiDanhSach}>
                <Text style={styles.chu_nut_huy}>🔄 Làm mới</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.nut_giam_dinh_all} onPress={xuLyGuiDuLieu} disabled={dangGuiDuLieu}>
            <Text style={styles.chu_nut_all}>{dangGuiDuLieu ? 'Đang chuyển dữ liệu...' : '🚀 CHUYỂN DỮ LIỆU ĐỂ SỬA LỖI'}</Text>
          </TouchableOpacity>

          <ScrollView style={styles.vung_cuon_ds}>
            {danhSachFile.map((file, index) => (
              <View 
                key={file.id} 
                style={[
                  styles.dong_file, 
                  laHoSoTrungLap(file) && {backgroundColor: '#FFF8E1'}, 
                  !laHoSoCoTheChuyenTiep(file) && {backgroundColor: '#FFEBEE'} 
                ]}
              >
                <View style={styles.thong_tin_file}>
                  <Text style={styles.stt_file}>{index + 1}.</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.ten_file}>{file.tenFile}</Text>
                    <Text style={styles.ma_lk_file}>Mã LK: {file.ma_lk} | {file.kichThuoc}</Text>
                    
                    {file.dsLoi && file.dsLoi.length > 0 && (
                      <View style={styles.khung_loi_chi_tiet}>
                        {file.dsLoi.slice(0, 3).map((loi, i) => (
                          <Text key={i} style={styles.chu_loi_nho}>- {loi}</Text>
                        ))}
                        {file.dsLoi.length > 3 && (
                          <Text style={styles.chu_loi_nho}>... và {file.dsLoi.length - 3} lỗi khác</Text>
                        )}
                      </View>
                    )}
                    
                    {laHoSoTrungLap(file) && (
                      <Text style={styles.chu_canh_bao}>⚠ Hồ sơ đã có trước đó, hệ thống sẽ kiểm tra lại và ghi đè khi chuyển tiếp.</Text>
                    )}

                    {laHoSoCoTheChuyenTiep(file) && (file.coCanhBao || (file.dsLoi?.length || 0) > 0) && (
                      <Text style={[styles.chu_canh_bao, { color: '#E65100' }]}>⚠ Hồ sơ có lỗi/cảnh báo nhưng vẫn được chuyển sang bàn kiểm tra để sửa và kiểm tra lại.</Text>
                    )}

                    {!laHoSoCoTheChuyenTiep(file) && file.lyDoLoi ? (
                      <Text style={[styles.chu_canh_bao, { color: '#C62828' }]}>{file.lyDoLoi}</Text>
                    ) : null}
                  </View>
                </View>

                <View style={styles.cot_phai}>
                  <Text style={[
                    styles.txt_tag,
                    layMauTrangThai(file)
                  ]}>
                    {layNhanTrangThaiHienThi(file)}
                  </Text>
                  
                  <TouchableOpacity style={styles.btn_chi_tiet} onPress={() => moChiTietFile(file)}>
                    <Text style={styles.txt_btn_chi_tiet}>🔍 Xem nhanh</Text>
                  </TouchableOpacity>

                  {laHoSoTrungLap(file) && file.trangThai !== TRANG_THAI_FILE.THAY_THE && (
                    <TouchableOpacity style={styles.btn_thay_the} onPress={() => capNhatTrangThai(file.id, TRANG_THAI_FILE.THAY_THE)}>
                        <Text style={styles.txt_btn_nho}>Đánh dấu ghi đè</Text>
                    </TouchableOpacity>
                  )}

                  {file.trangThai === TRANG_THAI_FILE.THAY_THE && (
                    <View style={[styles.btn_thay_the, { backgroundColor: '#1565C0' }]}>
                      <Text style={styles.txt_btn_nho}>Sẽ ghi đè khi chuyển</Text>
                    </View>
                  )}

                  <TouchableOpacity style={styles.btn_xoa} onPress={() => loaiBoFile(file.id)}>
                    <Text style={styles.txt_btn_xoa}>✖ Bỏ qua</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      ) : (
        <View style={styles.khung_chua_rong}>
          {Platform.OS === 'web' && (
             <input 
                type="file" 
                accept=".xml" 
             multiple={multiple}
                onChange={xuLyChonFileWeb} 
                style={{ display: 'none' }} 
             id={inputId} 
             />
          )}

          {dangXuLy && (
             <View style={styles.floating_progress}>
                <ActivityIndicator color="#1976D2" size="large" />
                <Text style={styles.chu_tien_do_khong_lo}>{thongBaoTienDo}</Text>
             </View>
          )}

          <TouchableOpacity 
             style={laCheDoNutNho ? styleButton : styles.nut_import_mini} 
             onPress={moTrinhChonFile} 
             disabled={dangXuLy}
          >
            <Text style={styles.chu_nut_mini}>{textButton}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* MODAL: XEM CHI TIẾT FILE */}
      {fileChiTiet && (
        <Modal 
          visible={hienThiModal} 
          animationType="slide" 
          transparent={true} 
          onRequestClose={() => setHienThiModal(false)}
        >
          <View style={styles.modal_overlay}>
            <View style={styles.modal_container}>
              <View style={styles.modal_header}>
                <Text style={styles.modal_title}>Chi tiết hồ sơ: {fileChiTiet.tenFile}</Text>
                <TouchableOpacity onPress={() => setHienThiModal(false)} style={styles.modal_btn_close}>
                  <Text style={styles.modal_txt_close}>Đóng</Text>
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.modal_body}>
                <View style={styles.modal_section}>
                  <Text style={styles.modal_section_title}>1. Thông tin Hành chính (XML1)</Text>
                  <Text style={styles.modal_text}>- Bệnh nhân: <Text style={{fontWeight:'bold'}}>{fileChiTiet.tomTatData?.hoTen}</Text></Text>
                  <Text style={styles.modal_text}>- Mã BN: {fileChiTiet.tomTatData?.maBN}</Text>
                  <Text style={styles.modal_text}>- Mã liên kết: {fileChiTiet.ma_lk}</Text>
                  <Text style={styles.modal_text}>- Thời gian ĐT: {fileChiTiet.tomTatData?.tienTrinh}</Text>
                </View>

                <View style={styles.modal_section}>
                  <Text style={styles.modal_section_title}>2. Tóm tắt Dữ liệu Lâm sàng</Text>
                  <Text style={styles.modal_text}>- XML2 (Thuốc): {fileChiTiet.tomTatData?.xml2} mã</Text>
                  <Text style={styles.modal_text}>- XML3 (Cận lâm sàng): {fileChiTiet.tomTatData?.xml3} mã</Text>
                  <Text style={styles.modal_text}>- XML4 (Dịch vụ kỹ thuật): {fileChiTiet.tomTatData?.xml4} mã</Text>
                  <Text style={styles.modal_text}>- XML5 (Vật tư y tế): {fileChiTiet.tomTatData?.xml5} mã</Text>
                </View>

                <View style={[styles.modal_section, {borderBottomWidth: 0}]}>
                  <Text style={[styles.modal_section_title, {color: '#D81B60'}]}>
                    3. Danh sách Cảnh báo & Lỗi ({fileChiTiet.dsLoi?.length || 0})
                  </Text>
                  {fileChiTiet.dsLoi && fileChiTiet.dsLoi.length > 0 ? (
                    fileChiTiet.dsLoi.map((loi, i) => (
                      <View key={i} style={styles.modal_error_item}>
                        <Text style={styles.modal_error_text}>{i + 1}. {loi}</Text>
                      </View>
                    ))
                  ) : (
                    <Text style={{color: '#4CAF50', fontWeight: 'bold', fontSize: 16}}>
                      Hồ sơ hợp lệ, không có lỗi cấu trúc hoặc vượt định mức.
                    </Text>
                  )}
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );

  if (!laCheDoNutNho) return noiDungNhapLieu;

  return (
    <View style={{ width: '100%' }}>
      {Platform.OS === 'web' && (
        <input
          type="file"
          accept=".xml"
          multiple={multiple}
          onChange={xuLyChonFileWeb}
          style={{ display: 'none' }}
          id={inputId}
        />
      )}

      <TouchableOpacity
        style={styleButton || styles.nut_import_mini}
        onPress={() => {
          if (danhSachFile.length > 0) {
            setHienThiBangNhap(true);
            return;
          }
          moTrinhChonFile();
        }}
        disabled={dangXuLy}
      >
        <Text style={styles.chu_nut_mini}>{textButton}</Text>
      </TouchableOpacity>

      <Modal
        visible={hienThiBangNhap || dangXuLy}
        animationType="fade"
        transparent={true}
        onRequestClose={() => {
          if (!dangXuLy) setHienThiBangNhap(false);
        }}
      >
        <View style={styles.modal_nhap_overlay}>
          <View style={styles.modal_nhap_container}>
            <View style={styles.modal_header}>
              <Text style={styles.modal_title}>Nhập nhiều hồ sơ XML</Text>
              <TouchableOpacity
                onPress={() => {
                  if (!dangXuLy) setHienThiBangNhap(false);
                }}
                style={styles.modal_btn_close}
                disabled={dangXuLy}
              >
                <Text style={styles.modal_txt_close}>Đóng</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: '80%' }} contentContainerStyle={{ paddingBottom: 12 }}>
              {noiDungNhapLieu}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  khung_chua_rong: { flex: 1, position: 'relative', justifyContent: 'center' },
  floating_progress: { position: 'absolute', top: -80, right: 20, backgroundColor: '#E3F2FD', padding: 20, borderRadius: 10, flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderColor: '#1976D2', elevation: 5, zIndex: 999 },
  chu_tien_do_khong_lo: { fontSize: 26, color: '#1976D2', fontWeight: 'bold', marginLeft: 15, fontFamily: 'Arial' },
  nut_import_mini: { backgroundColor: '#1976D2', paddingVertical: 18, paddingHorizontal: 25, borderRadius: 50, alignSelf: 'center', elevation: 4, borderWidth: 2, borderColor: '#0D47A1', width: '33%', alignItems: 'center' },
  chu_nut_mini: { color: '#FFF', fontWeight: 'bold', fontSize: 18, fontFamily: 'Arial', textAlign: 'center' },
  khung_danh_sach: { width: '95%', alignSelf: 'center', backgroundColor: '#FFF', borderRadius: 15, padding: 25, elevation: 5, marginTop: 20 },
  thanh_tieu_de_ds: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 2, borderColor: '#FCE4EC', paddingBottom: 15, marginBottom: 20 },
  nhom_nut_tieu_de_ds: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  chu_tieu_de_ds: { fontSize: 24, fontWeight: 'bold', color: '#D81B60', fontFamily: 'Arial' },
  tom_tat: { fontSize: 18, color: '#666', marginTop: 5 },
  nut_them_file: { backgroundColor: '#E3F2FD', paddingVertical: 12, paddingHorizontal: 14, borderRadius: 8, borderWidth: 1, borderColor: '#90CAF9' },
  chu_nut_them_file: { fontSize: 16, color: '#1565C0', fontWeight: 'bold' },
  nut_huy: { backgroundColor: '#F5F5F5', padding: 12, borderRadius: 8 },
  chu_nut_huy: { fontSize: 16, color: '#333', fontWeight: 'bold' },
  nut_giam_dinh_all: { backgroundColor: '#4CAF50', padding: 20, borderRadius: 12, alignItems: 'center', marginBottom: 20, elevation: 3 },
  chu_nut_all: { fontSize: 22, color: '#FFF', fontWeight: 'bold', letterSpacing: 1 },
  vung_cuon_ds: { maxHeight: 500 },
  dong_file: { flexDirection: 'row', padding: 20, borderBottomWidth: 1, borderColor: '#EEE', alignItems: 'center' },
  thong_tin_file: { flex: 1, flexDirection: 'row', gap: 15 },
  stt_file: { fontSize: 22, fontWeight: 'bold', color: '#1976D2', minWidth: 40 },
  ten_file: { fontSize: 20, color: '#333', fontWeight: 'bold' },
  ma_lk_file: { fontSize: 16, color: '#888', marginTop: 4 },
  khung_loi_chi_tiet: { marginTop: 10, backgroundColor: '#FFF3E0', padding: 10, borderRadius: 8 },
  chu_loi_nho: { fontSize: 16, color: '#E65100', fontFamily: 'Arial', marginBottom: 2 },
  chu_canh_bao: { color: '#FF9800', fontSize: 16, fontWeight: 'bold', marginTop: 5 },
  cot_phai: { alignItems: 'flex-end', minWidth: 120, justifyContent: 'center' },
  txt_tag: { fontSize: 18, fontWeight: 'bold' },
  btn_chi_tiet: { backgroundColor: '#E3F2FD', padding: 8, borderRadius: 6, marginTop: 10, minWidth: 100, alignItems: 'center', borderWidth: 1, borderColor: '#90CAF9' },
  txt_btn_chi_tiet: { color: '#1976D2', fontWeight: 'bold' },
  btn_thay_the: { backgroundColor: '#1976D2', padding: 8, borderRadius: 6, marginTop: 10, minWidth: 100, alignItems: 'center' },
  btn_xoa: { backgroundColor: '#FAFAFA', padding: 8, borderRadius: 6, marginTop: 10, minWidth: 100, alignItems: 'center', borderWidth: 1, borderColor: '#DDD' },
  txt_btn_nho: { color: '#FFF', fontWeight: 'bold' },
  txt_btn_xoa: { color: '#555', fontWeight: 'bold' },
  modal_nhap_overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modal_nhap_container: { width: '92%', maxWidth: 1180, maxHeight: '92%', backgroundColor: '#FFF', borderRadius: 16, overflow: 'hidden' },
  modal_overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modal_container: { width: '80%', maxWidth: 800, backgroundColor: '#FFF', borderRadius: 12, elevation: 10, overflow: 'hidden', maxHeight: '90%' },
  modal_header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FCE4EC', padding: 20, borderBottomWidth: 1, borderColor: '#F8BBD0' },
  modal_title: { fontSize: 22, fontWeight: 'bold', color: '#D81B60' },
  modal_btn_close: { backgroundColor: '#FFF', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 6, borderWidth: 1, borderColor: '#D81B60' },
  modal_txt_close: { fontSize: 16, fontWeight: 'bold', color: '#D81B60' },
  modal_body: { padding: 20 },
  modal_section: { marginBottom: 20, paddingBottom: 15, borderBottomWidth: 1, borderColor: '#EEE' },
  modal_section_title: { fontSize: 18, fontWeight: 'bold', color: '#1976D2', marginBottom: 10 },
  modal_text: { fontSize: 16, color: '#333', marginBottom: 6, fontFamily: 'Arial' },
  modal_error_item: { backgroundColor: '#FFEBEE', padding: 10, borderRadius: 6, marginBottom: 8, borderLeftWidth: 4, borderColor: '#D32F2F' },
  modal_error_text: { fontSize: 15, color: '#C62828' }
});

export default NhapFileXML;