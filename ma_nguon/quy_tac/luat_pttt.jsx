/**
 * ĐỘNG CƠ QUY TẮC: LUẬT PHẪU THUẬT, THỦ THUẬT (PTTT)
 * Thực thi kiểm tra dữ liệu XML3 (Nhóm 4, 5, 6)
 * Tiêu chuẩn JCI: ASC (Chăm sóc Gây mê và Phẫu thuật)
 */

export const KIEM_TRA_LUAT_PTTT = (dsDVKT, xml1) => {
  let danhSachLoi = [];
  if (!dsDVKT) return danhSachLoi;

  dsDVKT.forEach((dv, index) => {
    // Chỉ xét các dịch vụ thuộc nhóm Phẫu thuật (4) và Thủ thuật (5)
    if (dv.MA_NHOM === '4' || dv.MA_NHOM === '5') {
      
      // 1. Bắt buộc có mã Phẫu thuật viên / Người thực hiện
      if (!dv.NGUOI_THUC_HIEN) {
        danhSachLoi.push({ 
          phan_loai: 'PTTT', 
          muc_do: 'Critical', 
          canh_bao: `Dịch vụ ${dv.TEN_DICH_VU} thiếu Mã CCHN của người thực hiện trực tiếp.` 
        });
      }

      // 2. Logic thời gian: Ngày thực hiện không được trước ngày vào viện
      if (dv.NGAY_KQ && xml1.NGAY_VAO) {
        if (dv.NGAY_KQ < xml1.NGAY_VAO) {
          danhSachLoi.push({ 
            phan_loai: 'PTTT', 
            muc_do: 'Error', 
            canh_bao: `Thời gian thực hiện PTTT (${dv.NGAY_KQ}) vô lý vì trước ngày vào viện.` 
          });
        }
      }
    }
  });

  return danhSachLoi;
};