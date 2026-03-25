/**
 * ============================================================
 * FILE: ma_nguon/tien_ich/kiem_tra_xml.jsx
 * CHỨC NĂNG: Kiểm tra cấu trúc tĩnh (Static Validation).
 * CĂN CỨ: Quyết định 130/QĐ-BYT (Phiên bản mới nhất).
 * ============================================================
 */

export const kiemTraDinhDangXML = (hoSo) => {
  let loiCauTruc = [];

  if (!hoSo) {
    return { hop_le: false, danh_sach_loi: ["Hồ sơ bị hỏng hoặc không thể đọc dữ liệu."] };
  }

  // Ánh xạ linh hoạt nhưng ưu tiên chuẩn 130
  const xml1 = hoSo.xml1 || hoSo.XML1;
  const xml2 = hoSo.xml2 || hoSo.XML2 || [];
  const xml3 = hoSo.xml3 || hoSo.XML3 || [];
  const xml4 = hoSo.xml4 || hoSo.XML4 || [];
  const xml5 = hoSo.xml5 || hoSo.XML5 || [];

  // --- 1. KIỂM TRA BẢNG XML1 (Hành chính 130) ---
  if (!xml1) {
    return { hop_le: false, danh_sach_loi: ["Lỗi cấu trúc tệp: Không tìm thấy bảng XML1 (Tổng hợp hồ sơ)."] }; 
  }

  // Check Mã Liên Kết
  const maLK = xml1.MA_LK;
  if (!maLK) loiCauTruc.push("XML1: Thiếu trường MA_LK (Mã liên kết bắt buộc).");

  // Check Mã Thẻ BHYT (Ép chuẩn QĐ130)
  const maThe = xml1.MA_THE_BHYT || xml1.MA_THE;
  if (!maThe) loiCauTruc.push("XML1: Thiếu trường Mã thẻ BHYT (MA_THE_BHYT).");

  // Check Mã hành chính (Bắt buộc theo 130)
  if (!xml1.MATINH_CU_TRU && !xml1.MA_DKBD) {
    loiCauTruc.push("XML1: Thiếu thông tin MATINH_CU_TRU hoặc MA_DKBD.");
  }

  // --- 2. KIỂM TRA BẢNG XML2 (Chi tiết Thuốc 130) ---
  if (Array.isArray(xml2) && xml2.length > 0) {
    xml2.forEach((thuoc, index) => {
      if (!thuoc.MA_THUOC) {
        loiCauTruc.push(`XML2: Dòng thuốc thứ ${index + 1} thiếu MA_THUOC.`);
      }
    });
  }

  // --- 3. KIỂM TRA BẢNG XML4 (Dịch vụ kỹ thuật 130) ---
  if (Array.isArray(xml4) && xml4.length > 0) {
    xml4.forEach((dv, index) => {
      if (!dv.MA_DICH_VU) loiCauTruc.push(`XML4: Dòng ${index + 1} thiếu MA_DICH_VU.`);
      // Kiểm tra thiết bị với các dịch vụ chẩn đoán hình ảnh
      if (!dv.MA_MAY && dv.TEN_DICH_VU && (dv.TEN_DICH_VU.includes('Siêu âm') || dv.TEN_DICH_VU.includes('X-quang') || dv.TEN_DICH_VU.includes('CT') || dv.TEN_DICH_VU.includes('MRI'))) {
        loiCauTruc.push(`XML4: Dòng ${index + 1} (${dv.TEN_DICH_VU}) thiếu MA_MAY (Bắt buộc để giám định theo TT 39/2024).`);
      }
    });
  }

  // --- 4. KIỂM TRA BẢNG XML5 (Vật tư y tế 130) ---
  if (Array.isArray(xml5) && xml5.length > 0) {
    xml5.forEach((vtyt, index) => {
      if (!vtyt.MA_VAT_TU) loiCauTruc.push(`XML5: Dòng ${index + 1} thiếu MA_VAT_TU.`);
      if (vtyt.SO_LUONG <= 0) loiCauTruc.push(`XML5: Dòng ${index + 1} (${vtyt.TEN_VAT_TU}) số lượng phải lớn hơn 0.`);
    });
  }

  return { hop_le: loiCauTruc.length === 0, danh_sach_loi: loiCauTruc };
};