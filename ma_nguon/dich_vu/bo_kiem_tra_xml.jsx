/**
 * BỘ GIÁM ĐỊNH LÕI: RÀ SOÁT DỮ LIỆU XML CHUẨN QĐ 3176/QĐ-BYT
 * Tiêu chuẩn JCI: MCI.3 (Toàn vẹn dữ liệu) & QPS (Cải thiện chất lượng)
 */

import { CAU_TRUC_DU_LIEU } from '../quy_tac/quyluat_cautrucdulieu/quyluat_cau_truc_du_lieu';

export const kiemTraToanDienHoSo = (hoSo) => {
  let danhSachLoi = [];

  // --- LỚP 1: KIỂM TRA ĐỊNH DẠNG CHUẨN ---
  const regexNgay12 = /^\d{12}$/; // YYYYMMDDHHMI
  const regexNgay8 = /^\d{8}$/;   // YYYYMMDD

  // --- LỚP 2: KIỂM TRA CẤU TRÚC VÀ GIÁ TRỊ TỪNG BẢNG ---
  const quetTungBang = (tenXML, duLieu) => {
    if (!duLieu) return;
    const quyTac = CAU_TRUC_DU_LIEU[tenXML].quy_tac;
    const cotChuan = CAU_TRUC_DU_LIEU[tenXML].cot;
    const mangDuLieu = Array.isArray(duLieu) ? duLieu : [duLieu];

    mangDuLieu.forEach((row, index) => {
      // 1. Kiểm tra thừa/thiếu cột so với QĐ 3176
      const cotThucTe = Object.keys(row).filter(k => k !== 'id');
      const thieuCot = cotChuan.filter(c => !cotThucTe.includes(c));
      if (thieuCot.length > 0) {
        danhSachLoi.push({ 
          phan_loai: tenXML, 
          muc_do: 'Critical', 
          noi_dung: `Dòng ${index + 1}: Thiếu cột chuẩn: ${thieuCot.join(', ')}` 
        });
      }

      // 2. Kiểm tra chi tiết theo quy tắc định nghĩa tại file xml1.jsx -> xml6.jsx
      Object.keys(quyTac).forEach(field => {
        const val = row[field];
        const rule = quyTac[field];

        // Kiểm tra bắt buộc
        if (rule.required && (val === undefined || val === null || val === '')) {
          danhSachLoi.push({ phan_loai: tenXML, muc_do: 'Error', noi_dung: `Dòng ${index + 1}: Trường ${field} không được để trống.` });
        }

        // Kiểm tra độ dài
        if (rule.maxLength && String(val).length > rule.maxLength) {
          danhSachLoi.push({ phan_loai: tenXML, muc_do: 'Warning', noi_dung: `Dòng ${index + 1}: ${field} vượt quá ${rule.maxLength} ký tự.` });
        }

        // Kiểm tra định dạng ngày y lệnh (Đặc biệt quan trọng)
        if ((field === 'NGAY_YL' || field === 'NGAY_VAO' || field === 'NGAY_RA') && val) {
          if (!regexNgay12.test(val)) {
            danhSachLoi.push({ phan_loai: tenXML, muc_do: 'Critical', noi_dung: `Dòng ${index + 1}: ${field} sai định dạng 12 số.` });
          }
        }
      });
    });
  };

  // --- LỚP 3: KIỂM TRA LOGIC LIÊN KẾT (CROSS-CHECK) ---
  const kiemTraLogicLienKet = () => {
    if (!hoSo.xml1) return;
    const maLK_Goc = hoSo.xml1.MA_LK;
    const ngayVao = hoSo.xml1.NGAY_VAO;
    const ngayRa = hoSo.xml1.NGAY_RA;

    // 1. Kiểm tra ngày ra < ngày vào
    if (ngayVao && ngayRa && ngayRa < ngayVao) {
      danhSachLoi.push({ phan_loai: 'LOGIC', muc_do: 'Critical', noi_dung: 'Ngày ra viện không được nhỏ hơn ngày vào viện.' });
    }

    // 2. Kiểm tra sự thống nhất MA_LK giữa XML1 và các bảng chi tiết
    ['xml2', 'xml3', 'xml4', 'xml5', 'xml6'].forEach(key => {
      if (hoSo[key]) {
        const ds = Array.isArray(hoSo[key]) ? hoSo[key] : [hoSo[key]];
        ds.forEach((item, idx) => {
          if (item.MA_LK !== maLK_Goc) {
            danhSachLoi.push({ 
              phan_loai: key.toUpperCase(), 
              muc_do: 'Critical', 
              noi_dung: `Dòng ${idx + 1}: Lỗi liên thông dữ liệu (MA_LK không khớp XML1).` 
            });
          }
        });
      }
    });
  };

  // THỰC THI KIỂM TRA
  quetTungBang('XML1', hoSo.xml1);
  quetTungBang('XML2', hoSo.xml2);
  quetTungBang('XML3', hoSo.xml3);
  quetTungBang('XML4', hoSo.xml4);
  quetTungBang('XML5', hoSo.xml5);
  quetTungBang('XML6', hoSo.xml6);
  kiemTraLogicLienKet();

  return danhSachLoi;
};