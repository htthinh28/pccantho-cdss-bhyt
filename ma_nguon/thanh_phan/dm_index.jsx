/**
 * FILE ĐIỀU HƯỚNG CHUNG - DANH MỤC PHÁP LÝ BHYT (MASTER DATA INDEX)
 * Quản lý tập trung các danh mục theo chuẩn Thông tư 12/2026/TT-BTC
 * (Trao đổi bảng nội bộ: màn Quản lý danh mục có thêm nhập/xuất XML QĐ326/TT12 — `tien_ich/danh_muc_xml_qd326_tt12.js`.)
 * Đảm bảo liên thông dữ liệu cho Động cơ Kiểm tra CDSS
 */

// 1. Nhập (Import) các danh mục từ các file thành phần hiện có trong hệ thống
import { DANH_MUC_DVKT_M05 } from './dich_vu_ky_thuat';
import { DANH_MUC_KHOA_LS_M01 } from './dm_khoals_m01dm';
import { DANH_MUC_NHAN_SU } from './nhan_su';
import { THONG_TIN_CO_SO } from './thong_tin_co_so';
import { DANH_MUC_THUOC_MAU_M03 } from './thuoc_mau_cp';
import { DANH_MUC_TRANG_THIET_BI_M06 } from './trang_thiet_bi';
import { DANH_MUC_VAT_TU_M04 } from './vat_tu_y_te';

// (Ghi chú: File danh_muc_phap_ly.jsx cũ không được import vào đây để hệ thống chạy nhẹ hơn và tránh xung đột dữ liệu)

// 2. Xuất (Export) để màn hình Quản lý Danh mục và Động cơ Kiểm tra sử dụng
export {
    DANH_MUC_DVKT_M05 as DANH_MUC_CHAN_DOAN_HINH_ANH, DANH_MUC_DVKT_M05 as DANH_MUC_DVKT, DANH_MUC_DVKT_M05, DANH_MUC_KHOA_LS_M01 as DANH_MUC_GIUONG_BENH,
    // --- ALIAS (BÍ DANH) BẢO TOÀN TÍNH TƯƠNG THÍCH NGƯỢC ---
    // Cung cấp các biến tên cũ để các file Quy tắc (luat_cdha, luat_pttt...) không bị lỗi "Module not found"
    DANH_MUC_KHOA_LS_M01 as DANH_MUC_HA_TANG, DANH_MUC_DVKT_M05 as DANH_MUC_KHAM_CHUYEN_KHOA, DANH_MUC_KHOA_LS_M01,
    DANH_MUC_NHAN_SU,
    DANH_MUC_THUOC_MAU_M03, DANH_MUC_TRANG_THIET_BI_M06 as DANH_MUC_TRANG_THIET_BI, DANH_MUC_TRANG_THIET_BI_M06, DANH_MUC_VAT_TU_M04, DANH_MUC_VAT_TU_M04 as DANH_MUC_VAT_TU_Y_TE, DANH_MUC_DVKT_M05 as DANH_MUC_XET_NGHIEM,
    // --- CÁC DANH MỤC CHUẨN MỚI TỪ MẪU 01 ĐẾN 06 ---
    THONG_TIN_CO_SO
};

