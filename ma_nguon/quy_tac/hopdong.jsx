/**
 * QUY TẮC KIỂM TRA HỢP ĐỒNG BHYT (CƠ CHẾ NO-CODE)
 * Căn cứ: Hợp đồng KBCB BHYT ký hàng năm giữa CSYT và Cơ quan BHXH
 */

import KhoDuLieu from '../tien_ich/kho_du_lieu';

const chuanHoaMaLoaiKcb = (value) => {
  const raw = String(value ?? '').trim();
  if (!raw) return '';
  const digits = raw.replace(/\D/g, '');
  return digits ? digits.padStart(2, '0') : raw;
};

export const kiemTraHopDong = (xml1, xml3) => {
  let danhSachLỗi = [];

  // 1. Tự động lấy tham số Hợp đồng từ Bộ não lưu trữ (Local Storage)
  const dataCS = KhoDuLieu.layDanhMuc('THONG_TIN_CO_SO');
  const hopDong = Array.isArray(dataCS) ? dataCS[0] : dataCS;

  // Nếu chưa có dữ liệu mồi, tạm bỏ qua
  if (!hopDong || !xml1) return danhSachLỗi;

  // Giả định các tham số này có thể được KHTH cấu hình trên giao diện Web:
  // (Mặc định lấy theo Hợp đồng Phương Châu Cần Thơ 2026)
  const DIEU_TRI_BAN_NGAY_HOP_LE = hopDong.DIEU_TRI_BAN_NGAY === "Có" || false; 
  const KHAM_NGOAI_GIO_HOP_LE = hopDong.KHAM_NGOAI_GIO === "Có" || false;
  const maLoaiKcb = chuanHoaMaLoaiKcb(xml1.MA_LOAI_KCB);

  // =======================================================
  // LUẬT 1: KIỂM TRA PHẠM VI CUNG ỨNG (Mục 2.1 Hợp đồng)
  // Theo QĐ 824/QĐ-BYT: 04 = Điều trị nội trú ban ngày.
  // =======================================================
  if (maLoaiKcb === "04" && !DIEU_TRI_BAN_NGAY_HOP_LE) {
    danhSachLỗi.push({
      phan_loai: "HỢP ĐỒNG",
      ma_loi: "HD_01",
      canh_bao: `Hồ sơ có loại KCB là Điều trị nội trú ban ngày (Mã 04) nhưng Hợp đồng hiện tại không đăng ký phạm vi này.`
    });
  }

  // =======================================================
  // LUẬT 2: KIỂM TRA KHÁM NGOÀI GIỜ HÀNH CHÍNH (Mục 2.2 Hợp đồng)
  // Quét thời gian ra y lệnh (NGAY_YL) trong XML3
  // Bỏ qua nếu là hồ sơ Cấp cứu (MA_LYDO_VVIEN = 2)
  // =======================================================
  if (xml1.MA_LYDO_VVIEN !== "2" && !KHAM_NGOAI_GIO_HOP_LE && xml3 && xml3.length > 0) {
    xml3.forEach(dv => {
      // Định dạng NGAY_YL là YYYYMMDDHHMM (VD: 20260308 17 30)
      if (dv.NGAY_YL && dv.NGAY_YL.length >= 12) {
        const gioChiDinh = parseInt(dv.NGAY_YL.substring(8, 12)); // Lấy 4 số cuối: HHMM
        
        // Căn cứ theo hợp đồng Phương Châu: Hành chính là 07:00-11:30 và 13:00-16:30
        const laNghiTrua = gioChiDinh > 1130 && gioChiDinh < 1300;
        const laSauGioLam = gioChiDinh > 1630;
        const laTruocGioLam = gioChiDinh < 700;

        if (laNghiTrua || laSauGioLam || laTruocGioLam) {
          danhSachLỗi.push({
            phan_loai: "HỢP ĐỒNG",
            ma_loi: "HD_02",
            canh_bao: `Dịch vụ [${dv.TEN_DICH_VU}] được chỉ định lúc ${dv.NGAY_YL.substring(8, 10)}h${dv.NGAY_YL.substring(10, 12)} là ngoài giờ hành chính đã ký kết.`
          });
        }
      }
    });
  }

  return danhSachLỗi;
};