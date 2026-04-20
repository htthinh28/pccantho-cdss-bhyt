/**
 * PHÂN HỆ: TRẠM GIÁM ĐỊNH & SỬA LỖI XML (PHƯƠNG CHÂU - JCI)
 * Nâng cấp 5.0: 
 * 1. Đọc hàng loạt file XML cùng lúc và duyệt bằng Tab ngang.
 * 2. Layout chia đôi màn hình: Lưới dữ liệu (trái) - Sổ tay lỗi (phải) giúp xem full nội dung.
 * 3. Tối ưu UI chuẩn Phương Châu: Đưa toàn bộ Tabs và Nút chức năng lên GÓC TRÊN PHẢI, cùng kích thước.
 * 4. Dãn dòng, dãn cột linh hoạt, tự động bao trọn Text không bị che khuất (Auto-Height).
 * 5. FIX LỖI: Sửa lỗi typo (sai chính tả) các trường MA_BENH_CHINH, MA_TINH_CU_TRU theo chuẩn QĐ 130.
 * 6. FIX LỖI TRÀN BỘ NHỚ: Tích hợp thuật toán Auto-Chunking để băm nhỏ dữ liệu khi lưu vào LocalStorage.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useRef, useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CD } from '../tien_ich/chu_de_giao_dien';
import { chayBoMayGiamDinhV3 } from '../tien_ich/dong_co_giam_dinh';
import { layNhieuHoSoTuKho, luuHoSoVaoKho } from '../tien_ich/kho_du_lieu';
import NhapFileXML from '../tien_ich/nhap_file_xml';
import { xuatHoSoThanhXML130 } from '../tien_ich/xml_helper';

const choUICapNhat = () => new Promise((resolve) => setTimeout(resolve, 0));
const layKetQuaGiamDinhCoSan = (hoSo) => Array.isArray(hoSo?.ket_qua_giam_dinh) ? hoSo.ket_qua_giam_dinh : null;

// ============================================================================
// THUẬT TOÁN CHỐNG TRÀN BỘ NHỚ LOCAL STORAGE (CHUNKING)
// ============================================================================
const luuKhoHoSoChongTranBoNho = async (key, dataArray) => {
    try {
        if (!Array.isArray(dataArray)) {
            await AsyncStorage.setItem(key, JSON.stringify(dataArray));
            return;
        }
        // Xóa các khối bộ nhớ cũ
        const oldChunksStr = await AsyncStorage.getItem(`${key}_CHUNKS`);
        if (oldChunksStr) {
            const oldChunks = parseInt(oldChunksStr, 10);
            for (let i = 0; i < oldChunks; i++) {
                await AsyncStorage.removeItem(`${key}_CHUNK_${i}`);
            }
        }
        // Băm nhỏ dữ liệu và lưu từng mảng con
        const CHUNK_SIZE = 1500;
        const totalChunks = Math.ceil(dataArray.length / CHUNK_SIZE);
        await AsyncStorage.setItem(`${key}_CHUNKS`, String(totalChunks));
        
        for (let i = 0; i < totalChunks; i++) {
            const chunk = dataArray.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
            await AsyncStorage.setItem(`${key}_CHUNK_${i}`, JSON.stringify(chunk));
        }
        console.log(`Đã lưu thành công ${dataArray.length} hồ sơ, băm thành ${totalChunks} khối.`);
    } catch (e) { 
        console.error("Lỗi Chunking Set Storage:", e); 
        alert("Lỗi tràn bộ nhớ chưa thể xử lý. Vui lòng thử nạp ít hồ sơ hơn.");
    }
};

// HÀM ĐỌC DỮ LIỆU ĐÃ BĂM TỪ LOCAL STORAGE GHÉP LẠI
const docKhoHoSoChongTranBoNho = async (key) => {
    try {
        const chunksStr = await AsyncStorage.getItem(`${key}_CHUNKS`);
        if (chunksStr) {
            const totalChunks = parseInt(chunksStr, 10);
            let fullData = [];
            for (let i = 0; i < totalChunks; i++) {
                const chunkStr = await AsyncStorage.getItem(`${key}_CHUNK_${i}`);
                if (chunkStr) fullData = fullData.concat(JSON.parse(chunkStr));
            }
            return fullData;
        }
        const raw = await AsyncStorage.getItem(key);
        return raw ? JSON.parse(raw) : null;
    } catch (e) {
        console.error("Lỗi Chunking Get Storage:", e);
        return null;
    }
};
// ============================================================================

// ĐÃ SỬA LỖI CHÍNH TẢ CHO KHỚP 100% VỚI THẺ XML QĐ 130
const CHUAN_COT_XML = {
  'XML1': [
    "MA_LK", "STT", "MA_BN", "HO_TEN", "SO_CCCD", "NGAY_SINH", "GIOI_TINH", "NHOM_MAU", 
    "MA_QUOC_TICH", "MA_DANTOC", "MA_NGHE_NGHIEP", "DIA_CHI", "MA_TINH_CU_TRU", "MA_HUYEN_CU_TRU", 
    "MA_XA_CU_TRU", "DIEN_THOAI", "MA_THE_BHYT", "MA_DKBD", "GT_THE_TU", "GT_THE_DEN", 
    "NGAY_MIEN_CCT", "LY_DO_VV", "LY_DO_VNT", "MA_LY_DO_VNT", "CHAN_DOAN_VAO", "CHAN_DOAN_RV", 
    "MA_BENH_CHINH", "MA_BENH_KT", "MA_BENH_YHCT", "MA_PTTT_QT", "MA_DOITUONG_KCB", "MA_NOI_DI", 
    "MA_NOI_DEN", "MA_TAI_NAN", "NGAY_VAO", "NGAY_VAO_NOI_TRU", "NGAY_RA", "GIAY_CHUYEN_TUYEN", 
    "SO_NGAY_DTRI", "PP_DIEU_TRI", "KET_QUA_DTRI", "MA_LOAI_RV", "GHI_CHU", "NGAY_TTOAN", 
    "T_THUOC", "T_VTYT", "T_TONGCHI_BV", "T_TONGCHI_BH", "T_BNTT", "T_BNCCT", "T_BHTT", 
    "T_NGUONKHAC", "T_BHTT_GDV", "NAM_QT", "THANG_QT", "MA_LOAI_KCB", "MA_KHOA", "MA_CSKCB", 
    "MA_KHUVUC", "CAN_NANG", "CAN_NANG_CON", "NAM_NAM_LIEN_TUC", "NGAY_TAI_KHAM", "MA_HSBA", 
    "MA_TTDV", "DU_PHONG"
  ],
  'XML2': ['MA_LK', 'STT', 'MA_THUOC', 'MA_PP_CHEBIEN', 'MA_CSKCB_THUOC', 'MA_NHOM',
  'TEN_THUOC', 'DON_VI_TINH', 'HAM_LUONG', 'DUONG_DUNG', 'DANG_BAO_CHE',
  'LIEU_DUNG', 'CACH_DUNG', 'SO_DANG_KY', 'TT_THAU', 'PHAM_VI', 'TYLE_TT_BH',
  'SO_LUONG', 'DON_GIA', 'THANH_TIEN_BV', 'THANH_TIEN_BH', 'T_NGUONKHAC_NSNN',
  'T_NGUONKHAC_VTNN', 'T_NGUONKHAC_VTTN', 'T_NGUONKHAC_CL', 'T_NGUONKHAC',
  'MUC_HUONG', 'T_BNTT', 'T_BNCCT', 'T_BHTT', 'MA_KHOA', 'MA_BAC_SI',
  'MA_DICH_VU', 'NGAY_YL', 'NGAY_TH_YL', 'MA_PTTT', 'NGUON_CTRA', 'VET_THUONG_TP',
  'DU_PHONG'],
  'XML3': ['MA_LK', 'STT', 'MA_DICH_VU', 'MA_PTTT_QT', 'MA_VAT_TU', 'MA_NHOM', 
  'GOI_VTYT', 'TEN_VAT_TU', 'TEN_DICH_VU', 'MA_XANG_DAU', 'DON_VI_TINH', 
  'PHAM_VI', 'SO_LUONG', 'DON_GIA_BV', 'DON_GIA_BH', 'TT_THAU', 
  'TYLE_TT_DV', 'TYLE_TT_BH', 'THANH_TIEN_BV', 'THANH_TIEN_BH', 
  'T_TRANTT', 'MUC_HUONG', 'T_NGUONKHAC_NSNN', 'T_NGUONKHAC_VTNN', 
  'T_NGUONKHAC_VTTN', 'T_NGUONKHAC_CL', 'T_NGUONKHAC', 'T_BNTT', 
  'T_BNCCT', 'T_BHTT', 'MA_KHOA', 'MA_GIUONG', 'MA_BAC_SI', 
  'NGUOI_THUC_HIEN', 'MA_BENH', 'MA_BENH_YHCT', 'NGAY_YL', 
  'NGAY_TH_YL', 'NGAY_KQ', 'MA_PTTT', 'VET_THUONG_TP', 'PP_VO_CAM', 
  'VI_TRI_TH_DVKT', 'MA_MAY', 'MA_HIEU_SP', 'TAI_SU_DUNG', 'DU_PHONG'],
  'XML4': ['MA_LK', 'STT', 'MA_DICH_VU', 'MA_CHI_SO', 'TEN_CHI_SO', 'GIA_TRI', 'DON_VI_DO', 'MO_TA', 'KET_LUAN', 'NGAY_KQ', 'MA_BS_DOC_KQ', 'DU_PHONG'],
  'XML5': ['MA_LK', 'STT', 'DIEN_BIEN', 'HOI_CHAN', 'PHAU_THUAT', 'NGAY_YL', 'MA_BAC_SI', 'MA_KHOA', 'DU_PHONG'],
  'XML6': ['MA_LK', 'STT', 'MA_BN', 'HO_TEN', 'SO_CCCD', 'NGAY_SINH', 'GIOI_TINH', 'DIA_CHI', 'MA_THE_BHYT', 'MA_DKBD', 'GT_THE_TU', 'GT_THE_DEN', 'MA_DOITUONG_KCB', 'NGAY_VAO', 'NGAY_RA', 'MA_BENH_CHINH', 'MA_BENH_KT', 'MA_LOAI_KCB', 'MA_KHOA', 'MA_CSKCB', 'MA_QUOC_TICH', 'MA_DANTOC', 'MA_NGHE_NGHIEP', 'THOI_DIEM_XN_HIV', 'KQ_XN_HIV', 'KQ_XNTL_VR', 'NGAY_KQ_XN_TLVR', 'MA_LOAI_BN', 'MA_CD_BD', 'NGAY_CD_BD', 'MA_PHAC_DO_BD', 'MA_BAC_SI', 'MA_TT_LAM_SANG', 'CAN_NANG', 'CHIEU_CAO', 'MA_PHU_PHAC_DO', 'NGAY_BAT_DAU_PHAC_DO', 'NGAY_KET_THUC_PHAC_DO', 'LY_DO_NGUNG_BD', 'MA_LY_DO_NGUNG_BD', 'SO_NGAY_CAP_THUOC', 'NGAY_HEN_TAI_KHAM', 'MA_LOAI_RV', 'NGAY_TTOAN', 'MA_TTDV', 'GHI_CHU', 'DU_PHONG']
};

// ============================================================================
// NHÃN TIẾNG VIỆT CHO TỪNG TRƯỜNG DỮ LIỆU (THEO QĐ 130/QĐ-BYT & QĐ 824)
// ============================================================================
const NHAN_COT_XML = {
  // === CHUNG ===
  'MA_LK': 'Mã lần khám', 'STT': 'Số thứ tự', 'MA_BN': 'Mã bệnh nhân', 'HO_TEN': 'Họ và tên',
  'SO_CCCD': 'Số CCCD/CMND', 'NGAY_SINH': 'Ngày sinh', 'GIOI_TINH': 'Giới tính', 'NHOM_MAU': 'Nhóm máu',
  'MA_QUOC_TICH': 'Quốc tịch', 'MA_DANTOC': 'Dân tộc', 'MA_NGHE_NGHIEP': 'Nghề nghiệp',
  'DIA_CHI': 'Địa chỉ', 'DIEN_THOAI': 'Số điện thoại', 'GHI_CHU': 'Ghi chú',
  'MA_KHOA': 'Mã khoa', 'MA_CSKCB': 'Mã CSKCB', 'MA_BAC_SI': 'Mã bác sĩ',
  'NGAY_YL': 'Ngày y lệnh', 'NGAY_TH_YL': 'Ngày thực hiện YL',
  'MA_PTTT': 'Mã PTTT', 'VET_THUONG_TP': 'Vết thương thể phạm', 'DU_PHONG': 'Dự phòng',
  'T_BNTT': 'BN tự trả', 'T_BNCCT': 'BN cùng chi trả', 'T_BHTT': 'BHYT thanh toán',
  'T_NGUONKHAC': 'Nguồn khác', 'MUC_HUONG': 'Mức hưởng (%)',
  // === XML1 – Hành chính hồ sơ ===
  'MA_TINH_CU_TRU': 'Tỉnh cư trú', 'MA_HUYEN_CU_TRU': 'Huyện cư trú', 'MA_XA_CU_TRU': 'Xã cư trú',
  'MA_THE_BHYT': 'Mã thẻ BHYT', 'MA_DKBD': 'Mã ĐK ban đầu', 'GT_THE_TU': 'HSD thẻ từ ngày',
  'GT_THE_DEN': 'HSD thẻ đến ngày', 'NGAY_MIEN_CCT': 'Ngày miễn CCT',
  'LY_DO_VV': 'Lý do vào viện', 'LY_DO_VNT': 'Lý do vượt tuyến', 'MA_LY_DO_VNT': 'Mã lý do vượt tuyến',
  'CHAN_DOAN_VAO': 'Chẩn đoán vào viện', 'CHAN_DOAN_RV': 'Chẩn đoán ra viện',
  'MA_BENH_CHINH': 'Mã bệnh chính (ICD)', 'MA_BENH_KT': 'Mã bệnh kèm theo',
  'MA_BENH_YHCT': 'Mã bệnh YHCT', 'MA_PTTT_QT': 'Mã PTTT quan trọng nhất',
  'MA_DOITUONG_KCB': 'Đối tượng KCB', 'MA_NOI_DI': 'Cơ sở chuyển đến từ', 'MA_NOI_DEN': 'Chuyển đến cơ sở',
  'MA_TAI_NAN': 'Loại tai nạn', 'NGAY_VAO': 'Ngày vào viện', 'NGAY_VAO_NOI_TRU': 'Ngày nhập nội trú',
  'NGAY_RA': 'Ngày ra viện', 'GIAY_CHUYEN_TUYEN': 'Giấy chuyển tuyến',
  'SO_NGAY_DTRI': 'Số ngày điều trị', 'PP_DIEU_TRI': 'Phương pháp điều trị',
  'KET_QUA_DTRI': 'Kết quả điều trị', 'MA_LOAI_RV': 'Loại ra viện', 'NGAY_TTOAN': 'Ngày thanh toán',
  'T_THUOC': 'Tổng tiền thuốc', 'T_VTYT': 'Tổng tiền VTYT',
  'T_TONGCHI_BV': 'Tổng chi phí (BV)', 'T_TONGCHI_BH': 'Tổng chi phí (BHYT)',
  'T_BHTT_GDV': 'BHYT TT (giới hạn GĐV)', 'NAM_QT': 'Năm quyết toán', 'THANG_QT': 'Tháng quyết toán',
  'MA_LOAI_KCB': 'Loại KCB', 'MA_KHUVUC': 'Khu vực', 'CAN_NANG': 'Cân nặng (kg)',
  'CAN_NANG_CON': 'Cân nặng con (kg)', 'NAM_NAM_LIEN_TUC': '5 năm liên tục',
  'NGAY_TAI_KHAM': 'Ngày tái khám', 'MA_HSBA': 'Số HSBA', 'MA_TTDV': 'Mã TTDV',
  // === XML2 – Thuốc ===
  'MA_THUOC': 'Mã thuốc', 'MA_PP_CHEBIEN': 'PP chế biến', 'MA_CSKCB_THUOC': 'CSKCB cấp thuốc',
  'MA_NHOM': 'Nhóm thuốc/DV', 'TEN_THUOC': 'Tên thuốc', 'DON_VI_TINH': 'Đơn vị tính',
  'HAM_LUONG': 'Hàm lượng/Nồng độ', 'DUONG_DUNG': 'Đường dùng', 'DANG_BAO_CHE': 'Dạng bào chế',
  'LIEU_DUNG': 'Liều dùng', 'CACH_DUNG': 'Cách dùng', 'SO_DANG_KY': 'Số đăng ký lưu hành',
  'TT_THAU': 'Kết quả trúng thầu', 'PHAM_VI': 'Phạm vi TT BHYT', 'TYLE_TT_BH': 'Tỷ lệ TT BHYT (%)',
  'SO_LUONG': 'Số lượng', 'DON_GIA': 'Đơn giá', 'THANH_TIEN_BV': 'Thành tiền (BV)',
  'THANH_TIEN_BH': 'Thành tiền (BHYT TT)',
  'T_NGUONKHAC_NSNN': 'Nguồn khác - NSNN', 'T_NGUONKHAC_VTNN': 'Nguồn khác - VTNN',
  'T_NGUONKHAC_VTTN': 'Nguồn khác - VTTN', 'T_NGUONKHAC_CL': 'Nguồn khác - CL',
  'MA_DICH_VU': 'Mã dịch vụ', 'NGUON_CTRA': 'Nguồn chi trả',
  // === XML3 – VTYT / DVKT ===
  'MA_VAT_TU': 'Mã vật tư y tế', 'GOI_VTYT': 'Gói VTYT', 'TEN_VAT_TU': 'Tên vật tư',
  'TEN_DICH_VU': 'Tên dịch vụ kỹ thuật', 'MA_XANG_DAU': 'Mã nhiên liệu/xăng dầu',
  'DON_GIA_BV': 'Đơn giá (BV)', 'DON_GIA_BH': 'Đơn giá (BHYT)',
  'TYLE_TT_DV': 'Tỷ lệ TT dịch vụ (%)', 'T_TRANTT': 'Tiền trước TT',
  'MA_GIUONG': 'Mã giường bệnh', 'NGUOI_THUC_HIEN': 'Người thực hiện',
  'MA_BENH': 'Mã bệnh (ICD)', 'NGAY_KQ': 'Ngày có kết quả',
  'PP_VO_CAM': 'Phương pháp vô cảm', 'VI_TRI_TH_DVKT': 'Vị trí thực hiện',
  'MA_MAY': 'Mã máy/thiết bị', 'MA_HIEU_SP': 'Mã hiệu sản phẩm', 'TAI_SU_DUNG': 'Tái sử dụng',
  // === XML4 – Kết quả CLS ===
  'MA_CHI_SO': 'Mã chỉ số xét nghiệm', 'TEN_CHI_SO': 'Tên chỉ số', 'GIA_TRI': 'Giá trị kết quả',
  'DON_VI_DO': 'Đơn vị đo', 'MO_TA': 'Mô tả kết quả', 'KET_LUAN': 'Kết luận',
  'MA_BS_DOC_KQ': 'Mã BS đọc kết quả',
  // === XML5 – Diễn biến lâm sàng ===
  'DIEN_BIEN': 'Diễn biến bệnh', 'HOI_CHAN': 'Hội chẩn', 'PHAU_THUAT': 'Phẫu thuật/thủ thuật',
  // === XML6 – HIV/ARV ===
  'THOI_DIEM_XN_HIV': 'Thời điểm XN HIV', 'KQ_XN_HIV': 'Kết quả XN HIV',
  'KQ_XNTL_VR': 'KQ XN tải lượng virus', 'NGAY_KQ_XN_TLVR': 'Ngày KQ XN TLVR',
  'MA_LOAI_BN': 'Loại bệnh nhân', 'MA_CD_BD': 'Mã CĐ bệnh đặc biệt',
  'NGAY_CD_BD': 'Ngày CĐ bệnh đặc biệt', 'MA_PHAC_DO_BD': 'Mã phác đồ điều trị',
  'MA_TT_LAM_SANG': 'Mã tình trạng lâm sàng', 'CHIEU_CAO': 'Chiều cao (cm)',
  'MA_PHU_PHAC_DO': 'Mã phụ phác đồ', 'NGAY_BAT_DAU_PHAC_DO': 'Ngày BĐ phác đồ',
  'NGAY_KET_THUC_PHAC_DO': 'Ngày KT phác đồ', 'LY_DO_NGUNG_BD': 'Lý do ngừng ĐT',
  'MA_LY_DO_NGUNG_BD': 'Mã lý do ngừng ĐT', 'SO_NGAY_CAP_THUOC': 'Số ngày cấp thuốc',
  'NGAY_HEN_TAI_KHAM': 'Ngày hẹn tái khám',
};

// Cấu hình màu và nhãn cho từng mức độ lỗi
const MUC_DO_CONFIG = {
  'Error':   { bg: '#B71C1C', txt: '#FFFFFF', label: '● LỖI' },
  'Warning': { bg: '#E65100', txt: '#FFFFFF', label: '▲ CẢNH BÁO' },
  'Info':    { bg: '#1565C0', txt: '#FFFFFF', label: '◆ CHÚ Ý' },
};

// Tên hiển thị cho từng bảng XML
const TEN_BANG_XML = {
  'XML1': 'XML1 – Hành chính hồ sơ',
  'XML2': 'XML2 – Thuốc & dược phẩm',
  'XML3': 'XML3 – VTYT & dịch vụ kỹ thuật',
  'XML4': 'XML4 – Kết quả cận lâm sàng',
  'XML5': 'XML5 – Diễn biến lâm sàng',
  'XML6': 'XML6 – HIV/ARV đặc biệt',
};

const layXml1 = (hoSo = {}) => hoSo?.xml1 || hoSo?.XML1 || {};
const layMaLK = (hoSo = {}) => layXml1(hoSo)?.MA_LK || hoSo?.ma_lk || hoSo?.MA_LK || '';
const KHOA_SESSION_DOC_XML_MULTIPLE = 'SESSION_DOC_XML_MULTIPLE';

let sessionDocXmlMemoryCache = [];

const laLoiQuotaStorage = (error) => {
  const message = String(error?.message || error || '').toLowerCase();
  return error?.name === 'QuotaExceededError' || message.includes('quotaexceedederror') || message.includes('exceeded the quota');
};

const layWebSessionStorage = () => {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return null;
  try {
    return window.sessionStorage || null;
  } catch {
    return null;
  }
};

const chuanHoaDanhSachSessionKeys = (danhSach = []) => Array.from(new Set(
  (Array.isArray(danhSach) ? danhSach : [])
    .map((item) => String(item || '').trim())
    .filter(Boolean)
));

const docSessionDocXmlNhieu = async () => {
  const webSessionStorage = layWebSessionStorage();
  if (webSessionStorage) {
    try {
      const duLieuWeb = webSessionStorage.getItem(KHOA_SESSION_DOC_XML_MULTIPLE);
      if (duLieuWeb) {
        const danhSachDaLuu = chuanHoaDanhSachSessionKeys(JSON.parse(duLieuWeb));
        sessionDocXmlMemoryCache = danhSachDaLuu;
        return danhSachDaLuu;
      }
    } catch (error) {
      console.warn('[DocXML] Không thể đọc session web tạm thời:', error);
    }
  }

  try {
    const duLieuDaLuu = await AsyncStorage.getItem(KHOA_SESSION_DOC_XML_MULTIPLE);
    if (!duLieuDaLuu) return [...sessionDocXmlMemoryCache];
    const danhSachDaLuu = chuanHoaDanhSachSessionKeys(JSON.parse(duLieuDaLuu));
    sessionDocXmlMemoryCache = danhSachDaLuu;
    return danhSachDaLuu;
  } catch (error) {
    console.warn('[DocXML] Không thể khôi phục session đã lưu:', error);
    return [...sessionDocXmlMemoryCache];
  }
};

const luuSessionDocXmlNhieu = async (danhSach = []) => {
  const sessionKeys = chuanHoaDanhSachSessionKeys(danhSach);
  sessionDocXmlMemoryCache = sessionKeys;

  const webSessionStorage = layWebSessionStorage();
  if (webSessionStorage) {
    try {
      if (sessionKeys.length === 0) {
        webSessionStorage.removeItem(KHOA_SESSION_DOC_XML_MULTIPLE);
      } else {
        webSessionStorage.setItem(KHOA_SESSION_DOC_XML_MULTIPLE, JSON.stringify(sessionKeys));
      }
      return true;
    } catch (error) {
      console.warn('[DocXML] Không thể lưu session web tạm thời:', error);
      return false;
    }
  }

  try {
    if (sessionKeys.length === 0) {
      await AsyncStorage.removeItem(KHOA_SESSION_DOC_XML_MULTIPLE);
    } else {
      await AsyncStorage.setItem(KHOA_SESSION_DOC_XML_MULTIPLE, JSON.stringify(sessionKeys));
    }
    return true;
  } catch (error) {
    if (laLoiQuotaStorage(error)) {
      console.warn('[DocXML] Bỏ qua lưu session vì storage đã đầy quota:', error);
      return false;
    }
    throw error;
  }
};

const ManHinhDocXML = ({ route }) => {
  const navigation = useNavigation();
  
  const [danhSachHoSoMo, setDanhSachHoSoMo] = useState([]); 
  const [hoSoDangXem, setHoSoDangXem] = useState(null); 
  const [ketQuaGiamDinhMap, setKetQuaGiamDinhMap] = useState({}); 
  
  const [tabHienTai, setTabHienTai] = useState('XML1');
  const [danhSachTabDong, setDanhSachTabDong] = useState([]);
  const [locTheoTab, setLocTheoTab] = useState(false);       // true = chỉ lỗi tab hiện tại
  const [soTayMoRong, setSoTayMoRong] = useState({});         // map { 'XML1': true, ... } mở rộng section
  
  const mainScrollRef = useRef(null);
  const debounceTimer = useRef(null);
  const isInitialMount = useRef(true);
  const khoaDieuHuongGanNhat = useRef('');

  useEffect(() => {
    const loadSession = async () => {
      try {
        const parsedSession = await docSessionDocXmlNhieu();
        if (parsedSession.length > 0) {
          const kho = await layNhieuHoSoTuKho(parsedSession);
          
          if (kho && kho.length > 0) {
            let dsKhoiPhuc = [];
            let mapLoi = {};

            parsedSession.forEach(maLK => {
              const hs = kho.find(item => item?.ma_lk === maLK || (item?.du_lieu_goc?.xml1?.MA_LK === maLK));
              const duLieu = hs?.du_lieu_goc || hs || null;
              if (duLieu) {
                dsKhoiPhuc.push(duLieu);
                mapLoi[maLK] = hs?.ket_qua_giam_dinh || duLieu?.ket_qua_giam_dinh || [];
              }
            });

            if (dsKhoiPhuc.length > 0) {
               setDanhSachHoSoMo(dsKhoiPhuc);
               setKetQuaGiamDinhMap(mapLoi);
               chuyenDoiHoSo(dsKhoiPhuc[0], mapLoi);
            }
          }
        }
      } catch (e) {
        console.error("Lỗi khôi phục session:", e);
      } finally {
        isInitialMount.current = false;
      }
    };
    loadSession();
  }, []);

  useEffect(() => {
    if (isInitialMount.current || !hoSoDangXem) return;

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    
    debounceTimer.current = setTimeout(async () => {
      try {
        const maLK = layMaLK(hoSoDangXem);
        
        const loiMoi = await chayBoMayGiamDinhV3(hoSoDangXem);

        setKetQuaGiamDinhMap(prev => ({ ...prev, [maLK]: loiMoi }));

        const hoSoCanLuu = {
          ma_lk: maLK,
          ten_bn: hoSoDangXem.xml1?.HO_TEN || '',
          du_lieu_goc: hoSoDangXem,
          ket_qua_giam_dinh: loiMoi,
        };
        await luuHoSoVaoKho([hoSoCanLuu]);
      } catch (e) {
        console.error("Lỗi Auto-save & Giám định:", e);
      }
    }, 800);
  }, [hoSoDangXem]);

  const chuyenDoiHoSo = (hs, mapLoiHienTai = ketQuaGiamDinhMap) => {
    setHoSoDangXem(hs);
    const cacBang = Object.keys(hs).filter(k => k.toLowerCase().startsWith('xml')).map(k => k.toUpperCase()).sort();
    setDanhSachTabDong(cacBang);
    setTabHienTai(cacBang[0] || 'XML1');
  };

  const handleNhanDuLieu = async (dataList) => {
    if (dataList && dataList.length > 0) {
      let dsMoMoi = [...danhSachHoSoMo];
      let mapLoiMoi = { ...ketQuaGiamDinhMap };
      let hoSoDuocMoDauTien = null;

      for (let index = 0; index < dataList.length; index += 1) {
          const hoSo = dataList[index];
          const maLK = layMaLK(hoSo);
          if (maLK) {
           const loiChiTiet = layKetQuaGiamDinhCoSan(hoSo) || await chayBoMayGiamDinhV3(hoSo);
           const indexHoSoDangMo = dsMoMoi.findIndex((hs) => layMaLK(hs) === maLK);
           const hoSoDaDongBo = { ...hoSo, ket_qua_giam_dinh: loiChiTiet };

           mapLoiMoi[maLK] = loiChiTiet;

           if (indexHoSoDangMo >= 0) {
             dsMoMoi[indexHoSoDangMo] = hoSoDaDongBo;
           } else {
             dsMoMoi.push(hoSoDaDongBo);
           }

           if (!hoSoDuocMoDauTien) hoSoDuocMoDauTien = hoSoDaDongBo;
        }

        if ((index + 1) % 2 === 0) {
          await choUICapNhat();
        }
      }

      setDanhSachHoSoMo(dsMoMoi);
      setKetQuaGiamDinhMap(mapLoiMoi);
      if (hoSoDuocMoDauTien) chuyenDoiHoSo(hoSoDuocMoDauTien, mapLoiMoi);
      
      const sessionKeys = dsMoMoi.map(hs => layMaLK(hs)).filter(Boolean);
            await luuSessionDocXmlNhieu(sessionKeys);
    }
  };

  const handleQuetLai = async () => {
    if (!hoSoDangXem) return;
    const maLK = layMaLK(hoSoDangXem);
    const loi = await chayBoMayGiamDinhV3(hoSoDangXem);
    setKetQuaGiamDinhMap(prev => ({...prev, [maLK]: loi}));
    Alert.alert("Hệ thống CDSS", `Đã cập nhật giám định: ${loi.length} lỗi.`);
  };

  const layTabLoi = (loi) => String(loi?.phan_he || loi?.phan_loai || '').toUpperCase();

  const handleMoSuaHoSoBanSao = (loiChon = null) => {
    if (!layMaLK(hoSoDangXem)) return;
    const loiMacDinh = loiChon || currentLoi.find((item) => layTabLoi(item).startsWith(tabHienTai)) || currentLoi[0] || null;
    navigation.navigate('SuaFileXML', {
      maLK: layMaLK(hoSoDangXem),
      loi: loiMacDinh,
      moCheDoBanSao: true,
      viTriSua: loiMacDinh ? {
        phanHe: loiMacDinh.phan_he || loiMacDinh.phan_loai || tabHienTai,
        truongLoi: loiMacDinh.truong_loi || '',
        index: Number.isFinite(loiMacDinh.index) ? loiMacDinh.index : 0,
      } : null,
    });
  };

  const handleDongHoSo = async (maLKDong) => {
    const dsMoi = danhSachHoSoMo.filter(hs => layMaLK(hs) !== maLKDong);
    setDanhSachHoSoMo(dsMoi);
    
    if (dsMoi.length === 0) {
       setHoSoDangXem(null);
       await luuSessionDocXmlNhieu([]);
    } else if (layMaLK(hoSoDangXem) === maLKDong) {
       chuyenDoiHoSo(dsMoi[0]);
    }

    const sessionKeys = dsMoi.map(hs => layMaLK(hs)).filter(Boolean);
     await luuSessionDocXmlNhieu(sessionKeys);
  };

  const handleXuatXML = () => {
    if (Platform.OS !== 'web') return Alert.alert("Thông báo", "Chức năng xuất file chỉ hỗ trợ trên Web.");
    if (!hoSoDangXem) return;

    const { xmlContent, tenFile } = xuatHoSoThanhXML130(hoSoDangXem, { tenFilePrefix: 'SAU_GIAM_DINH' });
    const blob = new Blob([xmlContent], { type: 'text/xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = tenFile;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleJumpToError = (index, truongLoi) => {
    if (!truongLoi || truongLoi === 'UNKNOWN') {
      Alert.alert("Thông báo", "Đây là lỗi cấu trúc hệ thống.");
      return;
    }
    if (mainScrollRef.current) {
        // Tọa độ nhảy ước tính an toàn khi dùng Auto-Height
        mainScrollRef.current.scrollTo({ y: index * 70, animated: true });
    }
  };

  const dongBoDieuHuongTuDashboard = async (params = {}) => {
    const maLKCanMo = String(params?.maLK || '').trim();
    if (!maLKCanMo) return;

    let dsMoi = [...danhSachHoSoMo];
    let mapLoiMoi = { ...ketQuaGiamDinhMap };
    let hoSoMucTieu = dsMoi.find((hs) => layMaLK(hs) === maLKCanMo) || null;

    if (!hoSoMucTieu) {
      const kho = await layNhieuHoSoTuKho([maLKCanMo]);
      const banGhiKho = Array.isArray(kho) ? kho[0] : null;
      const duLieu = banGhiKho?.du_lieu_goc || banGhiKho || null;
      if (!duLieu) return;

      hoSoMucTieu = {
        ...duLieu,
        ket_qua_giam_dinh: banGhiKho?.ket_qua_giam_dinh || duLieu?.ket_qua_giam_dinh || [],
      };
      dsMoi.push(hoSoMucTieu);
      mapLoiMoi[maLKCanMo] = hoSoMucTieu.ket_qua_giam_dinh || [];
      setDanhSachHoSoMo(dsMoi);
      setKetQuaGiamDinhMap(mapLoiMoi);
      await luuSessionDocXmlNhieu(dsMoi.map((hs) => layMaLK(hs)).filter(Boolean));
    }

    const loiDieuHuong = params?.loi || null;
    const bangCanMo = String(loiDieuHuong?.phan_he || loiDieuHuong?.phan_loai || params?.phanHe || '').toUpperCase().match(/XML\d+/)?.[0] || null;

    chuyenDoiHoSo(hoSoMucTieu, mapLoiMoi);
    if (bangCanMo) {
      setTabHienTai(bangCanMo);
      setSoTayMoRong((prev) => ({ ...prev, [bangCanMo]: true }));
    }
    if (params?.batLocTheoTab) setLocTheoTab(true);

    if (loiDieuHuong?.truong_loi && loiDieuHuong.truong_loi !== 'UNKNOWN') {
      setTimeout(() => {
        handleJumpToError(Number.isFinite(loiDieuHuong?.index) ? loiDieuHuong.index : 0, loiDieuHuong.truong_loi);
      }, 120);
    }
  };

  useEffect(() => {
    const keyDieuHuong = [
      String(route?.params?.maLK || ''),
      String(route?.params?.loi?.ma_luat || ''),
      String(route?.params?.loi?.phan_he || ''),
      String(route?.params?.loi?.truong_loi || ''),
      String(route?.params?.loi?.index ?? ''),
      String(route?.params?.batLocTheoTab ? '1' : '0'),
    ].join('|');

    if (!route?.params?.maLK || khoaDieuHuongGanNhat.current === keyDieuHuong) return;
    khoaDieuHuongGanNhat.current = keyDieuHuong;
    void dongBoDieuHuongTuDashboard(route.params);
  }, [route?.params?.batLocTheoTab, route?.params?.loi, route?.params?.maLK]);

  const handleEditCell = (rowIndex, colName, value) => {
    const key = tabHienTai.toLowerCase();
    let capNhat = { ...hoSoDangXem };
    if (Array.isArray(capNhat[key])) {
      capNhat[key][rowIndex] = { ...capNhat[key][rowIndex], [colName]: value };
    } else {
      capNhat[key] = { ...capNhat[key], [colName]: value };
    }
    
    const maLK = layMaLK(capNhat);
    const dsMoi = danhSachHoSoMo.map(hs => layMaLK(hs) === maLK ? capNhat : hs);
    setDanhSachHoSoMo(dsMoi);
    setHoSoDangXem(capNhat); 
  };

  const renderGrid = () => {
    if (!hoSoDangXem) return null;
    const key = tabHienTai.toLowerCase();
    const duLieu = hoSoDangXem[key];
    if (!duLieu) return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 22, color: CD.text.muted, fontStyle: 'italic' }}>
          📭 Bảng {tabHienTai} không có dữ liệu trong hồ sơ này.
        </Text>
      </View>
    );
    const mangDinhDang = Array.isArray(duLieu) ? duLieu : [duLieu];
    const cotHienThi = CHUAN_COT_XML[tabHienTai] || Object.keys(mangDinhDang[0] || {});
    const maLK = layMaLK(hoSoDangXem);
    const ketQuaLoiHienTai = ketQuaGiamDinhMap[maLK] || [];

    // Tính số hàng có lỗi để hiển thị thống kê mini
    const hangCoLoi = new Set(
      ketQuaLoiHienTai.filter(l => String(l?.phan_he || '').toUpperCase().startsWith(tabHienTai)).map(l => l.index ?? -1)
    );

    return (
      <View style={{ flex: 1 }}>
        {/* Thanh thống kê mini của bảng */}
        <View style={styles.grid_stats_bar}>
          <Text style={styles.grid_stats_txt}>
            📊 {TEN_BANG_XML[tabHienTai] || tabHienTai} &nbsp;|&nbsp;
            <Text style={{ color: '#43A047' }}>{mangDinhDang.length} dòng</Text>
            {hangCoLoi.size > 0 && (
              <Text style={{ color: '#D32F2F' }}> &nbsp;|&nbsp; ⚠ {hangCoLoi.size} dòng có lỗi</Text>
            )}
          </Text>
        </View>

        <ScrollView horizontal style={styles.scroll_ngang} contentContainerStyle={{ minWidth: '100%' }}>
          <View style={{ flex: 1 }}>
            {/* Header hàng với nhãn Tiếng Việt */}
            <View style={styles.header_row}>
              <View style={[styles.cell_h, { width: 55 }]}>
                <Text style={styles.txt_h}>STT</Text>
              </View>
              {cotHienThi.map((col, i) => {
                const nhan = NHAN_COT_XML[col];
                const isLongText = col.includes('TEN') || col.includes('HO_TEN') || col.includes('CHAN_DOAN') || col.includes('DIA_CHI') || col.includes('GHI_CHU') || col.includes('DIEN_BIEN') || col.includes('HOI_CHAN') || col.includes('PHAU_THUAT') || col.includes('MO_TA') || col.includes('KET_LUAN');
                const minW = isLongText ? 280 : 140;
                return (
                  <View key={i} style={[styles.cell_h, { flex: isLongText ? 3 : 1, minWidth: minW }]}>
                    <Text style={styles.txt_h}>{col}</Text>
                    {nhan && <Text style={styles.txt_h_viet}>{nhan}</Text>}
                  </View>
                );
              })}
            </View>

            <ScrollView ref={mainScrollRef} style={{ flex: 1 }}>
              {mangDinhDang.map((row, rIdx) => {
                const laDongThongTinNguoiBenh = tabHienTai === 'XML1';
                const hangCoLoiNay = ketQuaLoiHienTai.some(l =>
                  String(l?.phan_he || '').toUpperCase().startsWith(tabHienTai) &&
                  (l.index === rIdx || tabHienTai === 'XML1')
                );
                return (
                  <View key={rIdx} style={[styles.data_row, laDongThongTinNguoiBenh && styles.data_row_xml1, hangCoLoiNay && styles.row_has_err]}>
                    <View style={[styles.cell_d, laDongThongTinNguoiBenh && styles.cell_d_xml1_stt, { width: 55, backgroundColor: hangCoLoiNay ? '#FFCDD2' : '#FCE4EC', alignItems: 'center' }]}>
                      <Text style={[styles.txt_d, { fontWeight: 'bold' }]}>{rIdx + 1}</Text>
                      {hangCoLoiNay && <Text style={{ fontSize: 14, color: '#B71C1C' }}>⚠</Text>}
                    </View>
                    {cotHienThi.map((col, cIdx) => {
                      const loi = ketQuaLoiHienTai.find(l =>
                        String(l?.phan_he || '').toUpperCase().startsWith(tabHienTai) &&
                        (l.index === rIdx || tabHienTai === 'XML1') &&
                        (l.truong_loi === col || (l.truong_loi && col.includes(l.truong_loi)))
                      );
                      const isLongText = col.includes('TEN') || col.includes('HO_TEN') || col.includes('CHAN_DOAN') || col.includes('DIA_CHI') || col.includes('GHI_CHU') || col.includes('DIEN_BIEN') || col.includes('HOI_CHAN') || col.includes('PHAU_THUAT') || col.includes('MO_TA') || col.includes('KET_LUAN');
                      const minW = isLongText ? 280 : 140;
                      const giaTriRong = String(row[col] ?? '').trim() === '' && col !== 'DU_PHONG';
                      return (
                        <View key={cIdx} style={[
                          styles.cell_d,
                          laDongThongTinNguoiBenh && styles.cell_d_xml1,
                          { flex: isLongText ? 3 : 1, minWidth: minW, padding: 0 },
                          loi && styles.cell_err,
                          !loi && giaTriRong && styles.cell_empty,
                        ]}>
                          <TextInput
                            style={[styles.input_d, laDongThongTinNguoiBenh && styles.input_d_xml1, loi && { color: '#B71C1C', fontWeight: 'bold' }]}
                            value={String(row[col] ?? '')}
                            onChangeText={(val) => handleEditCell(rIdx, col, val)}
                            multiline={true}
                            outlineStyle="none"
                            placeholder={giaTriRong ? '(trống)' : ''}
                            placeholderTextColor={loi ? '#EF9A9A' : '#BDBDBD'}
                          />
                          {loi && (
                            <Text style={styles.cell_err_hint} numberOfLines={1}>
                              ⚠ {loi.canh_bao?.substring(0, 40)}{(loi.canh_bao?.length || 0) > 40 ? '…' : ''}
                            </Text>
                          )}
                        </View>
                      );
                    })}
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </ScrollView>
      </View>
    );
  };

  const currentLK = layMaLK(hoSoDangXem);
  const currentLoi = ketQuaGiamDinhMap[currentLK] || [];
  const loiTabHienTai = currentLoi.filter((l) => layTabLoi(l).startsWith(tabHienTai));
  const loiSuaDuoc = currentLoi.filter(l => l.truong_loi && l.truong_loi !== 'UNKNOWN').length;
  const loiHeThong = currentLoi.length - loiSuaDuoc;

  // ============================================================================
  // SỔ TAY GIÁM ĐỊNH CHI TIẾT – hiển thị toàn bộ lỗi nhóm theo bảng XML
  // ============================================================================
  const renderSoTayGiamDinh = () => {
    const tatCaLoi = locTheoTab ? loiTabHienTai : currentLoi;
    
    // Nhóm lỗi theo bảng XML
    const nhomTheoXml = {};
    tatCaLoi.forEach(loi => {
      const bang = String(loi?.phan_he || 'XML1').toUpperCase().replace(/[^A-Z0-9]/g, '');
      const key = bang.startsWith('XML') ? bang : 'XML1';
      if (!nhomTheoXml[key]) nhomTheoXml[key] = [];
      nhomTheoXml[key].push(loi);
    });
    const cacNhom = Object.keys(nhomTheoXml).sort();

    if (tatCaLoi.length === 0) {
      return (
        <View style={styles.so_tay_empty}>
          <Text style={styles.so_tay_empty_icon}>✅</Text>
          <Text style={styles.so_tay_empty_txt}>
            {locTheoTab ? `Bảng ${tabHienTai} không có lỗi.` : 'Toàn bộ hồ sơ không phát hiện lỗi.'}
          </Text>
        </View>
      );
    }

    return (
      <>
        {/* Tóm tắt mức độ lỗi */}
        <View style={styles.so_tay_summary}>
          {['Error', 'Warning', 'Info'].map(mucDo => {
            const dem = tatCaLoi.filter(l => l.muc_do === mucDo).length;
            if (dem === 0) return null;
            const cfg = MUC_DO_CONFIG[mucDo] || MUC_DO_CONFIG['Info'];
            return (
              <View key={mucDo} style={[styles.so_tay_badge_sum, { backgroundColor: cfg.bg }]}>
                <Text style={styles.so_tay_badge_sum_txt}>{cfg.label}</Text>
                <Text style={styles.so_tay_badge_sum_num}>{dem}</Text>
              </View>
            );
          })}
        </View>

        {/* Từng nhóm XML */}
        {cacNhom.map(bang => {
          const dsLoi = nhomTheoXml[bang];
          const daMoRong = soTayMoRong[bang] !== false; // mặc định mở
          const soLoi = dsLoi.length;
          const soError = dsLoi.filter(l => l.muc_do === 'Error').length;
          const soWarning = dsLoi.filter(l => l.muc_do === 'Warning').length;

          return (
            <View key={bang} style={styles.so_tay_nhom}>
              {/* Section header – bấm để thu/mở */}
              <TouchableOpacity
                style={[styles.so_tay_nhom_header, bang === tabHienTai && styles.so_tay_nhom_header_active]}
                onPress={() => setSoTayMoRong(prev => ({ ...prev, [bang]: !daMoRong }))}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.so_tay_nhom_ten}>{TEN_BANG_XML[bang] || bang}</Text>
                  <Text style={styles.so_tay_nhom_sub}>
                    {soError > 0 && <Text style={{ color: '#FFCDD2' }}>● {soError} lỗi  </Text>}
                    {soWarning > 0 && <Text style={{ color: '#FFE0B2' }}>▲ {soWarning} cảnh báo  </Text>}
                    {soLoi - soError - soWarning > 0 && <Text style={{ color: '#BBDEFB' }}>◆ {soLoi - soError - soWarning} chú ý</Text>}
                  </Text>
                </View>
                <Text style={styles.so_tay_nhom_toggle}>{daMoRong ? '▲' : '▼'}</Text>
              </TouchableOpacity>

              {/* Danh sách lỗi trong nhóm */}
              {daMoRong && dsLoi.map((loi, idx) => {
                const cfg = MUC_DO_CONFIG[loi.muc_do] || MUC_DO_CONFIG['Info'];
                const canFix = loi.truong_loi && loi.truong_loi !== 'UNKNOWN' && loi.truong_loi !== 'CAU_TRUC';
                const nhanTruong = loi.truong_loi ? (NHAN_COT_XML[loi.truong_loi] || loi.truong_loi) : 'Cấu trúc';
                const dongLoi = Number.isFinite(loi.index) ? `Dòng ${loi.index + 1}` : 'Hành chính';

                return (
                  <TouchableOpacity
                    key={idx}
                    style={styles.so_tay_item}
                    onPress={() => {
                      // Chuyển sang tab có lỗi nếu đang ở tab khác
                      if (bang !== tabHienTai) setTabHienTai(bang);
                      handleJumpToError(loi.index || 0, loi.truong_loi);
                    }}
                    onLongPress={() => canFix && handleMoSuaHoSoBanSao(loi)}
                  >
                    {/* Mức độ + Mã luật */}
                    <View style={styles.so_tay_item_top_row}>
                      <View style={[styles.so_tay_muc_do_badge, { backgroundColor: cfg.bg }]}>
                        <Text style={[styles.so_tay_muc_do_txt, { color: cfg.txt }]}>{cfg.label}</Text>
                      </View>
                      {loi.ma_luat && (
                        <View style={styles.so_tay_ma_luat_badge}>
                          <Text style={styles.so_tay_ma_luat_txt}>📌 {loi.ma_luat}</Text>
                        </View>
                      )}
                      <Text style={styles.so_tay_dong}>{dongLoi}</Text>
                    </View>

                    {/* Trường lỗi + nhãn Việt */}
                    <View style={styles.so_tay_truong_row}>
                      <Text style={styles.so_tay_truong_code}>[{loi.truong_loi || 'N/A'}]</Text>
                      {nhanTruong !== loi.truong_loi && (
                        <Text style={styles.so_tay_truong_nhan}> — {nhanTruong}</Text>
                      )}
                    </View>

                    {/* Nội dung cảnh báo */}
                    <Text style={styles.so_tay_canh_bao}>{loi.canh_bao}</Text>

                    {loi.namespace_quy_tac ? (
                      <Text style={styles.so_tay_meta}>🧭 Namespace: {loi.namespace_quy_tac}</Text>
                    ) : null}
                    {loi.nguon_quy_tac ? (
                      <Text style={styles.so_tay_meta}>🧩 Nguồn: {loi.nguon_quy_tac}</Text>
                    ) : null}
                    {loi.luong_giai_trinh ? (
                      <Text style={styles.so_tay_luong}>🪜 Luồng: {loi.luong_giai_trinh}</Text>
                    ) : null}
                    {loi.tab_quan_tri_goi_y ? (
                      <Text style={styles.so_tay_meta}>🗂 Tab gợi ý: {loi.tab_quan_tri_goi_y}</Text>
                    ) : null}

                    {/* Cơ sở pháp lý */}
                    {loi.co_so_phap_ly ? (
                      <Text style={styles.so_tay_cspl}>📖 Căn cứ: {loi.co_so_phap_ly}</Text>
                    ) : null}

                    {/* Gợi ý sửa */}
                    {canFix && (
                      <Text style={styles.so_tay_goi_y}>
                        💡 Giữ lâu để mở bản sao chỉnh sửa
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          );
        })}
      </>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.top_nav}>
        <View style={styles.top_nav_main}>
          <View style={styles.top_nav_left}>
             <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back_btn}>
               <Text style={styles.back_txt}>⬅ TRỞ VỀ</Text>
             </TouchableOpacity>
             <Text style={styles.main_title}>🛠 ĐỌC XML CHI TIẾT</Text>
          </View>

          <View style={styles.top_nav_right}>
             {danhSachHoSoMo.length > 0 && (
               <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thanh_chon_ho_so} contentContainerStyle={{ alignItems: 'center' }}>
                 {danhSachHoSoMo.map((hs, index) => {
                   const maLK = layMaLK(hs);
                   const isFocused = maLK === currentLK;
                   const soLoi = ketQuaGiamDinhMap[maLK]?.length || 0;
                   return (
                     <TouchableOpacity 
                       key={maLK || index} 
                       style={[styles.btn_uniform, styles.tab_ho_so, isFocused && styles.tab_ho_so_on]}
                       onPress={() => chuyenDoiHoSo(hs)}
                     >
                       <Text style={[styles.txt_uniform, {color: '#555'}, isFocused && styles.txt_tab_ho_so_on]}>
                         📄 {maLK} {soLoi > 0 && `(${soLoi})`}
                       </Text>
                       <TouchableOpacity style={styles.btn_tat_tab} onPress={() => handleDongHoSo(maLK)}>
                          <Text style={styles.txt_tat_tab}>✕</Text>
                       </TouchableOpacity>
                     </TouchableOpacity>
                   );
                 })}
               </ScrollView>
             )}

             {hoSoDangXem && (
               <View style={styles.actions_right}>
                 <NhapFileXML onDuLieuSanSang={handleNhanDuLieu} multiple={true} styleButton={[styles.btn_uniform, {backgroundColor: '#8E24AA'}]} textButton="➕ THÊM" />
                 <TouchableOpacity style={[styles.btn_uniform, {backgroundColor: '#0288D1'}]} onPress={() => navigation.navigate('ChiTiet', { maLK: currentLK })}>
                   <Text style={styles.txt_uniform}>🔎 CHI TIẾT</Text>
                 </TouchableOpacity>
                 <TouchableOpacity style={[styles.btn_uniform, { backgroundColor: '#F57C00' }]} onPress={() => handleMoSuaHoSoBanSao()}>
                   <Text style={styles.txt_uniform}>📝 SỬA COPY</Text>
                 </TouchableOpacity>
                 <TouchableOpacity style={[styles.btn_uniform, {backgroundColor: '#43A047'}]} onPress={handleQuetLai}>
                   <Text style={styles.txt_uniform}>🔄 QUÉT LẠI</Text>
                 </TouchableOpacity>
                 <TouchableOpacity style={[styles.btn_uniform, { backgroundColor: '#2E7D32' }]} onPress={handleXuatXML}>
                   <Text style={styles.txt_uniform}>📥 XUẤT SẠCH</Text>
                 </TouchableOpacity>
                 <TouchableOpacity style={[styles.btn_uniform, { backgroundColor: '#757575' }]} onPress={() => handleDongHoSo(currentLK)}>
                   <Text style={styles.txt_uniform}>✕ ĐÓNG</Text>
                 </TouchableOpacity>
               </View>
             )}
          </View>
        </View>

        {hoSoDangXem && (
          <View style={styles.header_error_strip}>
            <View style={[styles.header_error_card, { borderLeftColor: '#D81B60' }]}>
              <Text style={styles.header_error_label}>TỔNG LỖI</Text>
              <Text style={styles.header_error_value}>{currentLoi.length}</Text>
            </View>
            <View style={[styles.header_error_card, { borderLeftColor: '#43A047' }]}>
              <Text style={styles.header_error_label}>SỬA ĐƯỢC</Text>
              <Text style={[styles.header_error_value, { color: '#2E7D32' }]}>{loiSuaDuoc}</Text>
            </View>
            <View style={[styles.header_error_card, { borderLeftColor: '#D32F2F' }]}>
              <Text style={styles.header_error_label}>HỆ THỐNG</Text>
              <Text style={[styles.header_error_value, { color: '#C62828' }]}>{loiHeThong}</Text>
            </View>
          </View>
        )}
      </View>

      {!hoSoDangXem ? (
        <View style={styles.welcome}>
          <NhapFileXML onDuLieuSanSang={handleNhanDuLieu} multiple={true} />
          <Text style={styles.hint}>Nhấn chọn (hoặc bôi đen nhiều) tệp XML. Hệ thống sẽ tự động quét lỗi.</Text>
        </View>
      ) : (
        <View style={styles.workspace}>
          
          <View style={styles.thanh_tong_hop}>
             <View style={styles.thong_tin_bn_khu_vuc}>
               <Text style={styles.p_name}>{layXml1(hoSoDangXem)?.HO_TEN || 'Không rõ bệnh nhân'} - {layMaLK(hoSoDangXem)}</Text>
               <Text style={styles.p_sub}>{layXml1(hoSoDangXem)?.CHAN_DOAN_RV || 'Không có chẩn đoán ra'}</Text>
             </View>
          </View>

          <View style={styles.main_content_layout}>
             <View style={styles.sidebar_tab_trai}>
                <Text style={styles.sidebar_tab_title}>BẢNG XML</Text>
                <ScrollView showsVerticalScrollIndicator={false}>
                  {danhSachTabDong.map(tab => (
                    <TouchableOpacity key={tab} onPress={() => setTabHienTai(tab)} style={[styles.tab_btn, tabHienTai === tab && styles.tab_on]}>
                      <Text style={[styles.tab_txt, tabHienTai === tab && styles.tab_txt_on]}>{tab}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
             </View>

             <View style={styles.grid_container_split}>
                {renderGrid()}
             </View>

             <View style={styles.audit_log_container_split}>
                {/* Header sổ tay */}
                <View style={styles.so_tay_header_row}>
                  <Text style={styles.audit_title}>📒 SỔ TAY GIÁM ĐỊNH</Text>
                  <TouchableOpacity
                    style={[styles.so_tay_toggle_btn, locTheoTab && styles.so_tay_toggle_btn_on]}
                    onPress={() => setLocTheoTab(v => !v)}
                  >
                    <Text style={[styles.so_tay_toggle_txt, locTheoTab && { color: '#FFFFFF' }]}>
                      {locTheoTab ? `🔎 ${tabHienTai}` : '🗂 Toàn hồ sơ'}
                    </Text>
                  </TouchableOpacity>
                </View>
                <ScrollView style={styles.audit_list}>
                  {renderSoTayGiamDinh()}
                </ScrollView>
             </View>
          </View>

        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CD.bg.gradient_mobile,
    ...Platform.select({ web: { backgroundImage: CD.web.gradient_bg } }),
  },

  // --- HEADER / TOP NAV ---
  top_nav: {
    backgroundColor: CD.brand.mauDam,
    paddingHorizontal: 24,
    paddingVertical: 12,
    paddingTop: 35,
    flexDirection: 'column',
    alignItems: 'stretch',
    borderBottomWidth: 1,
    borderBottomColor: CD.border.header,
    ...Platform.select({ web: { backgroundImage: CD.web.gradient_header, backdropFilter: CD.web.blur_header, boxShadow: CD.web.shadow_header } }),
  },
  top_nav_main: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  top_nav_left: { flexDirection: 'row', alignItems: 'center' },
  back_btn: {
    padding: 8,
    backgroundColor: CD.bg.glass_input,
    borderRadius: 10,
    marginRight: 10,
    borderWidth: 1,
    borderColor: CD.border.glass_md,
    ...Platform.select({ web: { cursor: CD.web.cursor_pointer } }),
  },
  back_txt: { color: CD.text.primary, fontWeight: 'bold', fontSize: 21, fontFamily: CD.font.family },
  main_title: { color: CD.text.primary, fontSize: 26, fontWeight: 'bold', fontFamily: CD.font.family },

  top_nav_right: { flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'flex-end', gap: 10 },
  thanh_chon_ho_so: { flexDirection: 'row', maxWidth: '50%' },

  header_error_strip: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  header_error_card: {
    flex: 1,
    minHeight: 70,
    backgroundColor: CD.bg.glass_card,
    borderLeftWidth: 5,
    borderWidth: 1,
    borderColor: CD.border.divider,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Platform.select({ web: { backdropFilter: CD.web.blur_card, boxShadow: CD.web.shadow_card } }),
  },
  header_error_label: { fontSize: 20, color: CD.text.secondary, fontWeight: 'bold' },
  header_error_value: { fontSize: 20, fontWeight: 'bold', color: CD.text.primary },

  // --- BUTTONS ---
  btn_uniform: {
    height: 45,
    paddingHorizontal: 12,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    backgroundColor: CD.brand.mauChinh,
    ...Platform.select({ web: { backgroundImage: CD.web.gradient_primary, boxShadow: CD.web.shadow_btn, cursor: CD.web.cursor_pointer } }),
  },
  txt_uniform: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 21, fontFamily: CD.font.family },

  // --- HỒ SƠ TABS (in header) ---
  tab_ho_so: {
    flexDirection: 'row',
    backgroundColor: CD.bg.glass_card,
    borderWidth: 1,
    borderColor: CD.border.glass,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  tab_ho_so_on: {
    backgroundColor: CD.brand.mauChinh,
    borderColor: CD.brand.mauChinh,
    ...Platform.select({ web: { backgroundImage: CD.web.gradient_primary, boxShadow: CD.web.shadow_btn } }),
  },
  txt_tab_ho_so_on: { color: CD.text.primary },
  btn_tat_tab: { marginLeft: 8, padding: 2 },
  txt_tat_tab: { color: CD.text.muted, fontWeight: 'bold', fontSize: 21 },

  actions_right: { flexDirection: 'row' },

  // --- WELCOME / EMPTY STATE ---
  welcome: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  hint: { fontSize: 22, color: CD.text.muted, fontStyle: 'italic', textAlign: 'center', marginTop: 25 },
  workspace: { flex: 1, padding: 10, paddingBottom: 0 },

  // --- THANH TỔNG HỢP (KPI bar) ---
  thanh_tong_hop: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
    backgroundColor: CD.bg.glass_card,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: CD.border.divider,
    ...Platform.select({ web: { backdropFilter: CD.web.blur_card, boxShadow: CD.web.shadow_card } }),
  },
  thong_tin_bn_khu_vuc: { flex: 1, justifyContent: 'center', paddingLeft: 10 },
  p_name: { fontSize: 20, fontWeight: 'bold', color: CD.text.primary },
  p_sub: { fontSize: 20, color: CD.brand.mauNhat, marginTop: 2 },

  the_tong_hop: {
    flex: 1,
    backgroundColor: CD.bg.glass_card,
    padding: 8,
    borderRadius: 16,
    borderLeftWidth: 5,
    borderWidth: 1,
    borderColor: CD.border.divider,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...Platform.select({ web: { backdropFilter: CD.web.blur_card, boxShadow: CD.web.shadow_card } }),
  },
  nhan_tong_hop: { fontSize: 21, color: CD.text.secondary, fontWeight: 'bold' },
  so_tong_hop: { fontSize: 26, fontWeight: 'bold', color: CD.text.primary },

  // --- XML TABS (XML1–XML6) ---
  tab_box: { flexDirection: 'row', marginBottom: 10 },
  sidebar_tab_trai: {
    flex: 1.3,
    minWidth: 140,
    maxWidth: 200,
    backgroundColor: '#F7FAFC',
    borderWidth: 1,
    borderColor: '#D8E2EE',
    borderRadius: 16,
    padding: 10,
    ...Platform.select({ web: { boxShadow: CD.web.shadow_card } }),
  },
  sidebar_tab_title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: CD.font.family,
  },
  tab_btn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#F7FAFC',
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#D8E2EE',
    ...Platform.select({ web: { cursor: CD.web.cursor_pointer } }),
  },
  tab_on: {
    backgroundColor: '#0D47A1',
    borderColor: '#0D47A1',
    ...Platform.select({ web: { boxShadow: CD.web.shadow_btn } }),
  },
  tab_txt: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  tab_txt_on: { color: '#FFFFFF' },

  // --- MAIN SPLIT LAYOUT ---
  main_content_layout: { flex: 1, flexDirection: 'row', gap: 10, paddingBottom: 10 },

  // Data grid (left panel)
  grid_container_split: {
    flex: 6.2,
    backgroundColor: CD.bg.glass_card,
    borderWidth: 1,
    borderColor: CD.border.glass,
    borderRadius: 20,
    overflow: 'hidden',
    ...Platform.select({ web: { backdropFilter: CD.web.blur_card, WebkitBackdropFilter: CD.web.blur_card, boxShadow: CD.web.shadow_card } }),
  },

  // Audit log (right panel)
  audit_log_container_split: {
    flex: 2.5,
    backgroundColor: CD.bg.glass_card,
    padding: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: CD.border.accent,
    ...Platform.select({ web: { backdropFilter: CD.web.blur_card, WebkitBackdropFilter: CD.web.blur_card, boxShadow: CD.web.shadow_card } }),
  },

  // --- DATA GRID INTERNALS ---
  scroll_ngang: { flex: 1 },
  header_row: { flexDirection: 'row', backgroundColor: CD.bg.table_header },
  cell_h: { padding: 10, borderRightWidth: 1, borderColor: CD.border.divider, justifyContent: 'center' },
  txt_h: { fontSize: 20, fontWeight: '700', color: CD.text.table_header, textAlign: 'center' },
  txt_h_viet: { fontSize: 15, color: CD.brand.mauNhat, textAlign: 'center', marginTop: 2, fontStyle: 'italic' },

  grid_stats_bar: {
    paddingHorizontal: 12, paddingVertical: 8,
    backgroundColor: 'rgba(13,71,161,0.08)',
    borderBottomWidth: 1, borderColor: CD.border.divider,
  },
  grid_stats_txt: { fontSize: 20, color: CD.text.secondary, fontWeight: '600' },

  data_row: { flexDirection: 'row', borderBottomWidth: 1, borderColor: CD.border.divider, minHeight: 58 },
  data_row_xml1: { minHeight: 174 },
  row_has_err: { backgroundColor: 'rgba(244,67,54,0.04)' },
  cell_d: { borderRightWidth: 1, borderColor: CD.border.divider, justifyContent: 'center' },
  cell_d_xml1: { minHeight: 174, justifyContent: 'flex-start' },
  cell_d_xml1_stt: { minHeight: 174, justifyContent: 'flex-start', paddingTop: 12 },
  txt_d: { fontSize: 20, color: CD.text.table_cell, textAlign: 'center' },
  input_d: {
    fontSize: 20,
    color: CD.text.table_cell,
    backgroundColor: CD.bg.glass_input,
    width: '100%',
    minHeight: 58,
    padding: 10,
    textAlignVertical: 'top',
    fontFamily: CD.font.family,
    ...Platform.select({ web: { outlineStyle: 'none' } }),
  },
  input_d_xml1: {
    minHeight: 174,
    paddingTop: 12,
    paddingBottom: 12,
    lineHeight: 28,
  },
  cell_err: { backgroundColor: 'rgba(244,67,54,0.13)', borderColor: '#F44336', borderWidth: 2 },
  cell_empty: { backgroundColor: 'rgba(255,235,59,0.07)' },
  cell_err_hint: {
    fontSize: 14, color: '#B71C1C', paddingHorizontal: 6, paddingBottom: 4,
    backgroundColor: 'rgba(255,205,210,0.5)', fontStyle: 'italic',
  },

  // ============= SỔ TAY GIÁM ĐỊNH (nâng cấp) =============
  so_tay_header_row: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 10, paddingBottom: 8,
    borderBottomWidth: 1, borderBottomColor: CD.border.divider,
  },
  so_tay_toggle_btn: {
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1, borderColor: CD.border.glass,
    backgroundColor: CD.bg.glass_input,
    ...Platform.select({ web: { cursor: CD.web.cursor_pointer } }),
  },
  so_tay_toggle_btn_on: { backgroundColor: CD.brand.mauChinh, borderColor: CD.brand.mauChinh },
  so_tay_toggle_txt: { fontSize: 18, fontWeight: 'bold', color: CD.text.secondary },

  so_tay_summary: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  so_tay_badge_sum: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20,
  },
  so_tay_badge_sum_txt: { fontSize: 17, fontWeight: 'bold', color: '#FFFFFF' },
  so_tay_badge_sum_num: { fontSize: 20, fontWeight: '900', color: '#FFFFFF' },

  so_tay_nhom: {
    marginBottom: 10,
    borderRadius: 12,
    borderWidth: 1, borderColor: CD.border.divider,
    overflow: 'hidden',
    backgroundColor: CD.bg.glass_card,
  },
  so_tay_nhom_header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 10,
    backgroundColor: 'rgba(13,71,161,0.10)',
    ...Platform.select({ web: { cursor: CD.web.cursor_pointer } }),
  },
  so_tay_nhom_header_active: { backgroundColor: 'rgba(13,71,161,0.22)' },
  so_tay_nhom_ten: { fontSize: 20, fontWeight: 'bold', color: CD.text.primary },
  so_tay_nhom_sub: { fontSize: 16, marginTop: 2 },
  so_tay_nhom_toggle: { fontSize: 18, color: CD.text.muted, marginLeft: 8 },

  so_tay_item: {
    padding: 12, borderBottomWidth: 1, borderColor: CD.border.divider,
    backgroundColor: 'rgba(255,255,255,0.03)',
    ...Platform.select({ web: { cursor: CD.web.cursor_pointer } }),
  },
  so_tay_item_top_row: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginBottom: 6 },
  so_tay_muc_do_badge: {
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
  },
  so_tay_muc_do_txt: { fontSize: 16, fontWeight: 'bold' },
  so_tay_ma_luat_badge: {
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
    backgroundColor: 'rgba(13,71,161,0.15)', borderWidth: 1, borderColor: 'rgba(13,71,161,0.3)',
  },
  so_tay_ma_luat_txt: { fontSize: 16, fontWeight: 'bold', color: '#1565C0' },
  so_tay_dong: { fontSize: 16, color: CD.text.muted, fontStyle: 'italic', marginLeft: 4 },

  so_tay_truong_row: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginBottom: 4 },
  so_tay_truong_code: { fontSize: 18, fontWeight: 'bold', color: CD.brand.mauNhat, fontFamily: CD.font.family },
  so_tay_truong_nhan: { fontSize: 18, color: CD.text.secondary },

  so_tay_canh_bao: { fontSize: 19, color: CD.text.primary, lineHeight: 28, marginBottom: 4 },
  so_tay_meta: { fontSize: 15, color: CD.text.link, marginTop: 2 },
  so_tay_luong: { fontSize: 15, color: '#546E7A', marginTop: 2, lineHeight: 22 },
  so_tay_cspl: {
    fontSize: 16, color: '#546E7A', fontStyle: 'italic', marginTop: 4,
    paddingTop: 4, borderTopWidth: 1, borderColor: CD.border.divider,
  },
  so_tay_goi_y: { fontSize: 16, color: '#43A047', marginTop: 4, fontStyle: 'italic' },

  so_tay_empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  so_tay_empty_icon: { fontSize: 48, marginBottom: 12 },
  so_tay_empty_txt: { fontSize: 20, color: '#81C784', fontWeight: 'bold', textAlign: 'center' },

  // titre sổ tay (vẫn dùng)
  audit_title: { fontSize: 20, fontWeight: 'bold', color: CD.brand.mauNhat, flex: 1 },
  audit_list: { flex: 1 },
});

export default ManHinhDocXML;