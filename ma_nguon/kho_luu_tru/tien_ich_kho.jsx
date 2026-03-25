/**
 * ============================================================
 * FILE: kho_luu_tru/tien_ich_kho.jsx (PHIÊN BẢN 3.9 - CHUNKING SAFE PARSER)
 * MỤC ĐÍCH: Tiện ích CRUD & Audit Trail cho Kho EMR.
 * SỬA LỖI: Tích hợp "Deep Clean Chunking" chống tràn bộ nhớ.
 * FIX TƯƠNG THÍCH: Trích xuất an toàn Array XML1, bảo tồn kết quả giám định,
 * và giữ lại dữ liệu gốc để UI hiển thị.
 * ============================================================
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const KHO_KEY = 'CDSS_KHO_LUU_TRU_HOSO';
const BHYT_KHO_VERSION = '3.8';
const CHUNK_SIZE = 50; // Băm nhỏ 50 hồ sơ / 1 khối chống tràn RAM

const sinhId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
};

const trichNamSinh = (ngaySinhStr) => {
  if (!ngaySinhStr) return '';
  const match = String(ngaySinhStr).match(/(\d{4})/);
  return match ? match[1] : '';
};

// ============================================================
// 🛡️ BỘ LƯU CHỐNG TRÀN BỘ NHỚ (DEEP CLEAN CHUNKING)
// ============================================================
const luuKhoAnToan = async (dataArray) => {
  try {
    if (!Array.isArray(dataArray)) {
      await AsyncStorage.setItem(KHO_KEY, JSON.stringify(dataArray));
      return;
    }

    // 1. Dọn dẹp rác ngầm trước khi ghi
    try {
        const allKeys = await AsyncStorage.getAllKeys();
        const keysToDelete = allKeys.filter(k => k === KHO_KEY || k.startsWith(`${KHO_KEY}_CHUNK`));
        if (keysToDelete.length > 0) {
            await AsyncStorage.multiRemove(keysToDelete);
        }
    } catch (cleanErr) {
        await AsyncStorage.removeItem(KHO_KEY);
        await AsyncStorage.removeItem(`${KHO_KEY}_CHUNKS`);
    }

    // 2. Chia nhỏ và lưu khối
    const totalChunks = Math.ceil(dataArray.length / CHUNK_SIZE);
    await AsyncStorage.setItem(`${KHO_KEY}_CHUNKS`, String(totalChunks));

    for (let i = 0; i < totalChunks; i++) {
      const chunk = dataArray.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
      await AsyncStorage.setItem(`${KHO_KEY}_CHUNK_${i}`, JSON.stringify(chunk));
    }
  } catch (e) {
    console.error("❌ [CDSS Storage] Lỗi lưu trữ:", e);
    throw e; // Ném lỗi lên để luuHoSoVaoKho xử lý và báo cáo đúng
  }
};

// ============================================================
// 🛡️ BỘ ĐỌC AN TOÀN (ANTI-CRASH & ĐỌC ĐƯỢC DATA CŨ)
// ============================================================
const docKhoAnToan = async () => {
  try {
    // 1. Ưu tiên đọc dữ liệu đã băm (Chunking)
    const chunksStr = await AsyncStorage.getItem(`${KHO_KEY}_CHUNKS`);
    if (chunksStr) {
      const totalChunks = parseInt(chunksStr, 10);
      let fullData = [];
      for (let i = 0; i < totalChunks; i++) {
        const chunkStr = await AsyncStorage.getItem(`${KHO_KEY}_CHUNK_${i}`);
        if (chunkStr) fullData = fullData.concat(JSON.parse(chunkStr));
      }
      return fullData;
    }

    // 2. Fallback: Nếu không có chunk, đọc theo kiểu cũ (Bảo toàn dữ liệu hiện có)
    const data = await AsyncStorage.getItem(KHO_KEY);
    
    if (!data || data === "[object Object]") {
      if (data === "[object Object]") {
        console.warn("⚠️ [CDSS] Phát hiện rác bộ nhớ, đang tiến hành dọn dẹp...");
        await AsyncStorage.removeItem(KHO_KEY); 
      }
      return [];
    }
    
    return JSON.parse(data);
  } catch (error) {
    console.warn("⚠️ [CDSS] Kho dữ liệu bị hỏng định dạng, tự động làm sạch.", error);
    await AsyncStorage.removeItem(KHO_KEY);
    return [];
  }
};

// ============================================================
// 1. LƯU HOẶC CẬP NHẬT HỒ SƠ (GHI NHẬN SỐ LẦN SỬA)
// ============================================================
export const luuHoSoVaoKho = async (danhSachHoSoMoi, nguoiDung = 'Hệ thống CDSS') => {
  try {
    if (!Array.isArray(danhSachHoSoMoi) || danhSachHoSoMoi.length === 0) {
      return { thanh_cong: false, so_luong_da_luu: 0, loi: 'Danh sách hồ sơ rỗng.' };
    }

    let khoCapNhat = await docKhoAnToan();
    let soLuongLuu = 0;
    const thoiGianNow = new Date().toLocaleString('vi-VN');

    danhSachHoSoMoi.forEach((item) => {
      // [FIX LỖI K_XD]: Trích xuất an toàn tránh trường hợp Parser trả về Array
      let xml1Data = item.xml1 || item.XML1 || {};
      let xml1 = Array.isArray(xml1Data) ? (xml1Data[0] || {}) : xml1Data;

      let xml6Data = item.xml6 || item.XML6 || {};
      let xml6 = Array.isArray(xml6Data) ? (xml6Data[0] || {}) : xml6Data;

      const src = xml1.MA_LK ? xml1 : item; 

      const maLK = src.MA_LK || src.MA_SO_HOSO || (src.MA_THE_BHYT ? `${src.MA_THE_BHYT}_${src.NGAY_VAO}` : null) || 'K_XD';
      
      if (maLK === 'K_XD') {
        console.warn("⚠️ Bỏ qua hồ sơ do không xác định được MÃ LK", src);
        return; 
      }

      const tongChiPhi = parseFloat(xml6.TONG_CHI_PHI || src.T_TONGCHI || src.T_TONGCHI_BV || 0);

      const indexCu = khoCapNhat.findIndex((hs) => hs.ma_lk === maLK);
      let hanhDong = 'TẠO MỚI';
      let lichSuTruyCap = [];
      let usersTruyCap = new Set([nguoiDung]);
      let luotXem = 0, luotSua = 0, luotXoa = 0;
      let idGoc = sinhId();

      if (indexCu !== -1) {
        const hsCu = khoCapNhat[indexCu];
        hanhDong = 'SỬA';
        idGoc = hsCu.id;
        luotXem = hsCu.luot_xem || 0;
        luotSua = (hsCu.luot_sua || 0) + 1;
        luotXoa = hsCu.luot_xoa || 0;
        lichSuTruyCap = hsCu.lich_su_truy_cap || [];
        if (hsCu.users_truy_cap) hsCu.users_truy_cap.forEach(u => usersTruyCap.add(u));
        khoCapNhat.splice(indexCu, 1);
      }

      lichSuTruyCap.push({ thoi_gian: thoiGianNow, hanh_dong: hanhDong, nguoi_dung: nguoiDung });

      khoCapNhat.push({
        id: idGoc, ma_lk: maLK, phien_ban_schema: BHYT_KHO_VERSION, trang_thai: 'HOAT_DONG',
        ten_bn: src.HO_TEN || src.TEN_BN || src.HO_TEN_BN || '',
        nam_sinh: trichNamSinh(src.NGAY_SINH),
        phai: (src.GIOI_TINH !== undefined && src.GIOI_TINH !== '') ? String(src.GIOI_TINH) : (src.PHAI || ''),
        ma_the_bhyt: src.MA_THE || src.MA_THE_BHYT || '',
        icd_chinh: src.MA_BENH_CHINH || src.MA_BENH || '',
        ten_benh: src.TEN_BENH || '', chan_doan_rv: src.CHAN_DOAN_RV || '',
        ma_khoa: src.MA_KHOA_DIEU_TRI || src.MA_KHOA || '', ma_bac_si: src.MA_BAC_SI || '',
        ngay_vao: src.NGAY_VAO || '', ngay_ra: src.NGAY_RA || '',
        so_ngay: src.SO_NGAY_DIEU_TRI || src.SO_NGAY_DTRI || 0,
        tong_chi_phi: tongChiPhi, bhyt_thanh_toan: parseFloat(xml6.BHYT_THANH_TOAN || src.T_BHTT || 0),
        bn_tu_tra: parseFloat(xml6.BENH_NHAN_TU_TRA || src.T_BNCCT || 0),
        
        luot_xem: luotXem, luot_sua: luotSua, luot_xoa: luotXoa,
        users_truy_cap: Array.from(usersTruyCap), lich_su_truy_cap: lichSuTruyCap,
        thoi_gian_luu_cuoi: thoiGianNow, ten_file_goc: item._ten_file || '',
        
        // [FIX LỖI MẤT LỖI]: Bốc kết quả giám định
        ket_qua_giam_dinh: item.ket_qua_giam_dinh || item.chiTietLoi || [],
        du_lieu_goc: item, 
      });

      soLuongLuu++;
    });

    if (soLuongLuu === 0) {
      return { thanh_cong: false, so_luong_da_luu: 0, loi: 'Không tìm thấy Mã LK hợp lệ trong hồ sơ. Kiểm tra lại cấu trúc XML (thẻ <MA_LK>).' };
    }

    await luuKhoAnToan(khoCapNhat);
    return { thanh_cong: true, so_luong_da_luu: soLuongLuu, loi: null };

  } catch (error) {
    return { thanh_cong: false, so_luong_da_luu: 0, loi: error.message };
  }
};


// ============================================================
// 2. LẤY TOÀN BỘ DANH SÁCH (Lọc bỏ dữ liệu gốc để tránh Lag RAM)
// ============================================================
export const layDanhSachTuKho = async () => {
  try {
    let allHoSo = await docKhoAnToan();
    // [FIX LỖI TRẮNG BẢNG]: Giữ nguyên cấu trúc object, không chặt du_lieu_goc
    return allHoSo.filter(hs => hs.trang_thai !== 'DA_XOA');
  } catch (error) { return []; }
};


// ============================================================
// 3. ĐỌC CHI TIẾT HỒ SƠ (Trả về Data gốc + Ghi log XEM)
// ============================================================
export const layHoSoTheoMaLK = async (maLK, nguoiDung = 'Bác sĩ Phương Châu') => {
  try {
    let allHoSo = await docKhoAnToan();
    const index = allHoSo.findIndex((hs) => hs.ma_lk === maLK);
    
    if (index !== -1) {
      allHoSo[index].luot_xem = (allHoSo[index].luot_xem || 0) + 1;
      
      const users = new Set(allHoSo[index].users_truy_cap || []);
      users.add(nguoiDung);
      allHoSo[index].users_truy_cap = Array.from(users);

      allHoSo[index].lich_su_truy_cap = allHoSo[index].lich_su_truy_cap || [];
      allHoSo[index].lich_su_truy_cap.push({ thoi_gian: new Date().toLocaleString('vi-VN'), hanh_dong: 'XEM', nguoi_dung: nguoiDung });

      await luuKhoAnToan(allHoSo); 
      
      return allHoSo[index];
    }
    return null;
  } catch (error) { return null; }
};


// ============================================================
// 4. TRUY VẤN THỐNG KÊ TRUY CẬP (Dành cho Quản lý)
// ============================================================
export const truyVanThongKeTruyCap = async (maLK) => {
  try {
    let allHoSo = await docKhoAnToan();
    const hs = allHoSo.find((h) => h.ma_lk === maLK);
    if (!hs) return null;

    return {
      ma_lk: hs.ma_lk, tong_luot_xem: hs.luot_xem || 0,
      tong_luot_sua: hs.luot_sua || 0, tong_luot_xoa: hs.luot_xoa || 0,
      danh_sach_nguoi_dung: hs.users_truy_cap || [], nhat_ky_chi_tiet: hs.lich_su_truy_cap || []
    };
  } catch (error) { return null; }
};


// ============================================================
// 5. XÓA MỀM (SOFT DELETE)
// ============================================================
export const xoaHoSoKhoiKho = async (maLK, nguoiDung = 'Quản trị viên') => {
  try {
    let allHoSo = await docKhoAnToan();
    const index = allHoSo.findIndex((hs) => hs.ma_lk === maLK);
    
    if (index !== -1) {
      allHoSo[index].trang_thai = 'DA_XOA';
      allHoSo[index].luot_xoa = (allHoSo[index].luot_xoa || 0) + 1;
      const users = new Set(allHoSo[index].users_truy_cap || []);
      users.add(nguoiDung);
      allHoSo[index].users_truy_cap = Array.from(users);

      allHoSo[index].lich_su_truy_cap.push({ thoi_gian: new Date().toLocaleString('vi-VN'), hanh_dong: 'XÓA', nguoi_dung: nguoiDung });
      await luuKhoAnToan(allHoSo); 
    }
    return true; // Sửa lại thành trả về boolean thay vì mảng để tong_quan xử lý đúng
  } catch (error) { return false; }
};


// ============================================================
// CÁC HÀM TIỆN ÍCH KHÁC
// ============================================================
export const timKiemHoSo = async (tuKhoa) => {
  try {
    const danhSach = await layDanhSachTuKho();
    if (!tuKhoa || !tuKhoa.trim()) return danhSach;

    const kw = tuKhoa.trim().toLowerCase();
    return danhSach.filter((hs) =>
      (hs.ma_lk || '').toLowerCase().includes(kw) || (hs.ten_bn || '').toLowerCase().includes(kw) ||
      (hs.icd_chinh || '').toLowerCase().includes(kw) || (hs.ten_benh || '').toLowerCase().includes(kw) ||
      (hs.ma_the_bhyt || '').toLowerCase().includes(kw)
    );
  } catch (error) { return []; }
};

export const demHoSoTrongKho = async () => {
  try {
    let allHoSo = await docKhoAnToan();
    return allHoSo.filter(hs => hs.trang_thai !== 'DA_XOA').length;
  } catch { return 0; }
};

export const xoaToanBoKho = async () => {
  try {
    try {
        const allKeys = await AsyncStorage.getAllKeys();
        const keysToDelete = allKeys.filter(k => k === KHO_KEY || k.startsWith(`${KHO_KEY}_CHUNK`));
        if (keysToDelete.length > 0) {
            await AsyncStorage.multiRemove(keysToDelete);
        }
    } catch (err) {
        await AsyncStorage.removeItem(KHO_KEY);
        await AsyncStorage.removeItem(`${KHO_KEY}_CHUNKS`);
    }
    return true;
  } catch (error) { return false; }
};

export const xuatKhoRaXLSX = async () => {
  if (typeof window === 'undefined') return;
  try {
    const XLSX = require('xlsx');
    const danhSach = await layDanhSachTuKho();
    if (danhSach.length === 0) return alert('Kho chưa có hồ sơ nào để xuất.');

    const exportData = danhSach.map((hs) => ({
      'Mã LK': hs.ma_lk, 'Họ tên BN': hs.ten_bn, 'Năm sinh': hs.nam_sinh,
      'Giới tính': hs.phai === '1' ? 'Nam' : hs.phai === '2' ? 'Nữ' : '', 'Mã thẻ BHYT': hs.ma_the_bhyt,
      'ICD-10 chính': hs.icd_chinh, 'Tên bệnh': hs.ten_benh, 'Ngày vào': hs.ngay_vao, 'Ngày ra': hs.ngay_ra,
      'Tổng chi phí': hs.tong_chi_phi, 'Lượt Xem': hs.luot_xem || 0, 'Lượt Sửa': hs.luot_sua || 0,
      'User truy cập': (hs.users_truy_cap || []).join(', '), 'Cập nhật cuối': hs.thoi_gian_luu_cuoi,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Kho_Ho_So_EMR');
    XLSX.writeFile(wb, `KhoHoSo_CDSS_${new Date().toLocaleDateString('vi-VN').replace(/\//g, '-')}.xlsx`);
  } catch (error) { alert('Lỗi xuất file: ' + error.message); }
};