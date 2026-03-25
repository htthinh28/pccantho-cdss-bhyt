/**
 * ĐỘNG CƠ QUY TẮC: LUẬT HÀNH CHÍNH, SƠ SINH & TỪ CHỐI KSK
 * Thực thi đối chiếu nghiệp vụ trên bảng XML1
 * Tiêu chuẩn JCI: MOI.7 & ACC.1
 */

export const KIEM_TRA_LUAT_HANH_CHINH = (xml1) => {
  let danhSachLoi = [];
  if (!xml1) return danhSachLoi;

  // HÀM TRỢ GIÚP CHUYỂN IN HOA ĐỂ KIỂM TRA TỪ KHÓA
  const toUpper = (val) => String(val || "").toUpperCase();

  // 1. CHẶN HỒ SƠ KHÁM SỨC KHỎE (ĐIỀU 23 LUẬT BHYT)
  const tuKhoaKSK = /(KHÁM SỨC KHỎE|KHAM SUC KHOE|KSK|KIỂM TRA SỨC KHỎE|KIEM TRA|YÊU CẦU|YEU CAU)/;
  if (tuKhoaKSK.test(toUpper(xml1.LY_DO_VV)) || tuKhoaKSK.test(toUpper(xml1.CHAN_DOAN_VAO))) {
    danhSachLoi.push({
      phan_loai: 'NGHIỆP VỤ BHYT',
      muc_do: 'Critical',
      truong_loi: 'LY_DO_VV',
      canh_bao: '⛔ Vi phạm Điều 23 Luật BHYT: Hồ sơ thuộc diện khám sức khỏe hoặc khám theo yêu cầu, không thuộc phạm vi quỹ BHYT chi trả.'
    });
  }

  // 2. LOGIC SƠ SINH VÀ MÃ MẸ (KHẮC PHỤC LỖI UNDEFINED)
  // Chỉ kiểm tra khi có mã mẹ truyền vào (Tránh bắt nhầm người lớn)
  if (xml1.MA_LK_ME && xml1.MA_LK_ME.trim() !== "") {
    if (xml1.MA_LK === xml1.MA_LK_ME) {
      danhSachLoi.push({
        phan_loai: 'HÀNH CHÍNH',
        muc_do: 'Critical',
        truong_loi: 'MA_LK',
        canh_bao: '⛔ Lỗi hệ thống: Bé sơ sinh phải có mã lượt khám (MA_LK) riêng biệt với mẹ để định danh hồ sơ EMR.'
      });
    }
  }

  // 3. KIỂM TRA THẺ BHYT HẾT HẠN
  if (xml1.GT_THE_DEN && xml1.NGAY_VAO) {
    const ngayHetHan = parseInt(xml1.GT_THE_DEN.substring(0, 8));
    const ngayVaoVien = parseInt(xml1.NGAY_VAO.substring(0, 8));
    if (ngayVaoVien > ngayHetHan) {
      danhSachLoi.push({ 
        phan_loai: 'HÀNH CHÍNH', 
        muc_do: 'Critical', 
        truong_loi: 'MA_THE_BHYT',
        canh_bao: `Thẻ BHYT đã hết hạn (Hạn: ${xml1.GT_THE_DEN}) trước thời điểm vào viện.` 
      });
    }
  }

  // 4. KIỂM TRA GIỚI TÍNH (CHUẨN 130)
  if (xml1.GIOI_TINH && !['1', '2'].includes(String(xml1.GIOI_TINH))) {
    danhSachLoi.push({
      phan_loai: 'DỮ LIỆU',
      muc_do: 'Warning',
      truong_loi: 'GIOI_TINH',
      canh_bao: '⚠️ Giới tính không đúng chuẩn QĐ 130 (1: Nam, 2: Nữ).'
    });
  }

  return danhSachLoi;
};