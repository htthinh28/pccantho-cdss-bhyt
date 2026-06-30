/**
 * TRẠM 1: TRUNG TÂM ĐIỀU PHỐI QUY LUẬT CẤU TRÚC (MASTER SCHEMA ENGINE)
 * Chức năng: Định nghĩa các trường chuẩn QĐ 130/QĐ-BYT và tùy biến người dùng.
 * PHONG CÁCH: Pink Theme Phương Châu, Arial > 20px.
 */

import { DANH_SACH_COT_XML1, QUY_TAC_KIEM_TRA_XML1 } from './xml1';
import { DANH_SACH_COT_XML2, QUY_TAC_KIEM_TRA_XML2 } from './xml2';
import { DANH_SACH_COT_XML3, QUY_TAC_KIEM_TRA_XML3 } from './xml3';
import { DANH_SACH_COT_XML4, QUY_TAC_KIEM_TRA_XML4 } from './xml4';
import { DANH_SACH_COT_XML5, QUY_TAC_KIEM_TRA_XML5 } from './xml5';
import { DANH_SACH_COT_XML6, QUY_TAC_KIEM_TRA_XML6 } from './xml6';
import { apDungQuyTacKiemTraTheoNgay } from '../../tien_ich/quy_dinh_3176_sua_doi_2026';
import { mocNgayYmdTuXml1 } from '../../tien_ich/muc_luong_co_so_bhyt';

/**
 * CẤU TRÚC TỔNG HỢP: Dùng bởi bo_kiem_tra_xml.jsx để validate toàn diện.
 * Mỗi bảng chứa: cot (danh sách cột chuẩn) và quy_tac (bộ ràng buộc validation).
 */
export const CAU_TRUC_DU_LIEU = {
  XML1: { cot: DANH_SACH_COT_XML1, quy_tac: QUY_TAC_KIEM_TRA_XML1 },
  XML2: { cot: DANH_SACH_COT_XML2, quy_tac: QUY_TAC_KIEM_TRA_XML2 },
  XML3: { cot: DANH_SACH_COT_XML3, quy_tac: QUY_TAC_KIEM_TRA_XML3 },
  XML4: { cot: DANH_SACH_COT_XML4, quy_tac: QUY_TAC_KIEM_TRA_XML4 },
  XML5: { cot: DANH_SACH_COT_XML5, quy_tac: QUY_TAC_KIEM_TRA_XML5 },
  XML6: { cot: DANH_SACH_COT_XML6, quy_tac: QUY_TAC_KIEM_TRA_XML6 },
};

/**
 * Quy tắc kiểm tra theo mốc ngày KCB (QĐ sửa đổi 3176/2026 — không đổi danh mục cột).
 * @param {string} tenBang — XML1…XML6
 * @param {string} [ngayYmd] — YYYYMMDD; mặc định giữ giới hạn cũ nếu thiếu
 */
export const layQuyTacKiemTraTheoNgay = (tenBang, ngayYmd = '') => {
  const key = String(tenBang || '').toUpperCase();
  const quyTacGoc = CAU_TRUC_DU_LIEU[key]?.quy_tac || {};
  return apDungQuyTacKiemTraTheoNgay(quyTacGoc, ngayYmd);
};

/** Quy tắc kiểm tra theo XML1 (NGAY_VAO / NGAY_RA / NGAY_TTOAN). */
export const layQuyTacKiemTraChoXml1 = (tenBang, xml1 = {}) =>
  layQuyTacKiemTraTheoNgay(tenBang, mocNgayYmdTuXml1(xml1));

// 1. DANH MỤC CẤU TRÚC CÁC BẢNG (Dễ dàng thêm trường mà không cần sửa logic hàm)
const CAU_TRUC_HE_THONG = {
  // XML1: Tổng hợp chi phí khám bệnh, chữa bệnh bảo hiểm y tế
  'XML1': [
    "MA_LK", "STT", "MA_BN", "HO_TEN", "SO_CCCD", "NGAY_SINH", "GIOI_TINH", "NHOM_MAU", 
    "MA_QUOCTICH", "MA_DANTOC", "MA_NGHE_NGHIEP", "DIA_CHI", "MATINH_CU_TRU", "MAHUYEN_CU_TRU", 
    "MAXA_CU_TRU", "DIEN_THOAI", "MA_THE_BHYT", "MA_DKBD", "GT_THE_TU", "GT_THE_DEN", 
    "NGAY_MIEN_CCT", "LY_DO_VV", "LY_DO_VNT", "MA_LY_DO_VNT", "CHAN_DOAN_VAO", "CHAN_DOAN_RV", 
    "MA_BEN_CHINH", "MA_BENH_KT", "MA_BENH_YHCT", "MA_PTTT_QT", "MA_DOITUONG_KCB", "MA_NOI_DI", 
    "MA_NOI_DEN", "MA_TAI_NAN", "NGAY_VAO", "NGAY_VAO_NOI_TRU", "NGAY_RA", "GIAY_CHUYEN_TUYEN", 
    "SO_NGAY_DTRI", "PP_DIEU_TRI", "KET_QUA_DTRI", "MA_LOAI_RV", "GHI_CHU", "NGAY_TTOAN", 
    "T_THUOC", "T_VTYT", "T_TONGCHI_BV", "T_TONGCHI_BH", "T_BNTT", "T_BNCCT", "T_BHTT", 
    "T_NGUONKHAC", "T_BHTT_GDV", "NAM_QT", "THANG_QT", "MA_LOAI_KCB", "MA_KHOA", "MA_CSKCB", 
    "MA_KHUVUC", "CAN_NANG", "CAN_NANG_CON", "NAM_NAM_LIEN_TUC", "NGAY_TAI_KHAM", "MA_HSBA", 
    "MA_TTDV", "DU_PHONG"
  ],

  // XML2: Chi tiết thuốc
  'XML2': ["MA_LK", "STT", "MA_THUOC", "TEN_THUOC", "DON_GIA", "SO_LUONG", "THANH_TIEN"],

  // XML3: Chi tiết dịch vụ kỹ thuật và vật tư y tế
  'XML3': ["MA_LK", "STT", "MA_DICH_VU", "TEN_DICH_VU", "DON_GIA_BV", "SO_LUONG", "THANH_TIEN_BV"],

  // XML4: Chi tiết kết quả cận lâm sàng
  'XML4': ["MA_LK", "STT", "MA_DICH_VU", "MA_CHI_SO", "TEN_CHI_SO", "GIA_TRI", "KET_LUAN"],

  // XML6: CHI TIẾT THEO DÕI LÂM SÀNG (Đã bổ sung cho bác sĩ)
  'XML6': [
    "MA_LK", "STT", "DIEN_BIEN", "HOI_CHAN", "PHAU_THUAT", "NGAY_YL", 
    "MA_BS", "TEN_BS", "MA_KHOA", "TEN_KHOA", "MA_BENH", "TEN_BENH"
  ],

  // TÙY BIẾN: Bác sĩ có thể thêm các bảng XML7, XML8... tại đây
};

/**
 * Hàm lấy danh sách cột phục vụ hiển thị.
 * Ưu tiên dùng CAU_TRUC_DU_LIEU (từ các file xml1-xml6) để đảm bảo nhất quán.
 * @param {string} tenBang - Tên bảng (XML1, XML2, XML6...)
 * @returns {Array} Danh sách các trường
 */
export const layDanhSachCot = (tenBang) => {
  if (!tenBang) return [];
  const key = tenBang.toUpperCase();
  // Ưu tiên CAU_TRUC_DU_LIEU (đầy đủ nhất theo QĐ 3176)
  if (CAU_TRUC_DU_LIEU[key]) return CAU_TRUC_DU_LIEU[key].cot;
  return CAU_TRUC_HE_THONG[key] || [];
};

/**
 * Hàm kiểm tra cấu trúc dữ liệu và logic theo QĐ 130
 */
export const KIEM_TRA_CAU_TRUC_DU_LIEU = (hoSo) => {
  let danhSachLỗi = [];
  
  if (!hoSo || !hoSo.xml1) {
    danhSachLỗi.push({ 
        phan_loai: 'CẤU TRÚC', 
        muc_do: 'Error', 
        noi_dung: 'Hồ sơ rỗng hoặc thiếu bảng XML1 (Bảng tổng hợp).' 
    });
    return danhSachLỗi;
  }

  // Quét các cột bắt buộc của XML1 theo chuẩn JCI & QĐ 130
  const cotBatBuoc = ["MA_LK", "HO_TEN", "MA_THE_BHYT", "NGAY_VAO"];
  
  cotBatBuoc.forEach(col => {
    if (!hoSo.xml1[col] || hoSo.xml1[col].toString().trim() === "") {
      danhSachLỗi.push({
        phan_loai: 'DỮ LIỆU (XML1)',
        muc_do: 'Critical',
        noi_dung: `Trường [${col}] không được để trống theo quy định.`
      });
    }
  });

  return danhSachLỗi;
};