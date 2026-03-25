/**
 * ĐỘNG CƠ QUY TẮC: LUẬT GIÁM ĐỊNH THUỐC & VẬT TƯ Y TẾ (VTYT)
 * Thực thi đối chiếu nghiệp vụ trên bảng XML2.
 * Các quy tắc này giúp đảm bảo việc kê đơn thuốc và VTYT tuân thủ các quy định của BHYT,
 * tối ưu hóa chi phí và đảm bảo an toàn cho người bệnh.
 *
 * Tiêu chuẩn JCI: MMU.4, MMU.5
 * Quyết định 3455/QĐ-BYT về Danh mục thuốc BHYT
 */
import { Alert } from 'react-native';

// Giả lập danh mục thuốc được BHYT chi trả để kiểm tra
const DANH_MUC_THUOC_BHYT = new Set([
  'THUOC001',
  'THUOC002',
  'THUOC003',
  'VTYT001', // VTYT này chỉ dùng nội trú
]);

export const KIEM_TRA_LUAT_THUOC = (xml2Data, xml1Data) => {
  let danhSachLoi = [];
  if (!xml2Data || !Array.isArray(xml2Data)) return danhSachLoi;

  const laNoiTru = xml1Data?.MA_LOAI_KCB?.toString() === '1';

  // Duyệt qua từng dòng thuốc/vật tư trong hồ sơ
  xml2Data.forEach((thuoc, index) => {
    if (!thuoc) return;

    // ----- BẮT ĐẦU CÁC QUY TẮC -----

    // 1. KIỂM TRA THUỐC/VTYT NGOÀI DANH MỤC BHYT
    if (!DANH_MUC_THUOC_BHYT.has(thuoc.MA_THUOC)) {
      danhSachLoi.push({
        id: `thuoc_${index}_danh_muc`,
        phan_loai: 'DANH MỤC',
        muc_do: 'Critical',
        truong_loi: 'MA_THUOC',
        ma_loi: thuoc.MA_THUOC,
        canh_bao: `⛔ Thuốc/VTYT [${thuoc.TEN_THUOC}] không có trong danh mục BHYT.`
      });
    }

    // 2. KIỂM TRA SỐ LƯỢNG KÊ ĐƠN BẤT THƯỜNG
    const soLuong = parseFloat(thuoc.SO_LUONG);
    if (soLuong > 50) { // Giả sử ngưỡng là 50
      danhSachLoi.push({
        id: `thuoc_${index}_so_luong`,
        phan_loai: 'Dược lâm sàng',
        muc_do: 'Warning',
        truong_loi: 'SO_LUONG',
        ma_loi: thuoc.MA_THUOC,
        canh_bao: `⚠️ Số lượng kê đơn [${soLuong}] cho [${thuoc.TEN_THUOC}] cao bất thường, cần xem xét lại.`
      });
    }

    // 3. KIỂM TRA THUỐC BHYT KHÔNG THANH TOÁN (TỶ LỆ = 0)
    const tyLeTT = parseFloat(thuoc.TYLE_TT);
    if (tyLeTT === 0 && parseFloat(thuoc.THANH_TIEN) > 0) {
      danhSachLoi.push({
        id: `thuoc_${index}_tyle_tt`,
        phan_loai: 'THANH TOÁN BHYT',
        muc_do: 'Warning',
        truong_loi: 'TYLE_TT',
        ma_loi: thuoc.MA_THUOC,
        canh_bao: `⚠️ Thuốc [${thuoc.TEN_THUOC}] có tỷ lệ BHYT thanh toán là 0%, nhưng đang được tính vào chi phí.`
      });
    }

    // 4. KIỂM TRA LIỀU DÙNG/CÁCH DÙNG
    if (!thuoc.LIEU_DUNG || thuoc.LIEU_DUNG.trim() === '') {
      danhSachLoi.push({
        id: `thuoc_${index}_lieu_dung`,
        phan_loai: 'Dược lâm sàng',
        muc_do: 'Info',
        truong_loi: 'LIEU_DUNG',
        ma_loi: thuoc.MA_THUOC,
        canh_bao: `ℹ️ Thuốc [${thuoc.TEN_THUOC}] chưa có liều dùng hoặc cách dùng.`
      });
    }

    // 5. KIỂM TRA VTYT CHỈ DÙNG CHO NỘI TRÚ NHƯNG KÊ NGOẠI TRÚ
    if (thuoc.MA_THUOC === 'VTYT001' && !laNoiTru) {
        danhSachLoi.push({
            id: `thuoc_${index}_vtyt_noi_tru`,
            phan_loai: 'CHỈ ĐỊNH',
            muc_do: 'Critical',
            truong_loi: 'MA_LOAI_KCB',
            ma_loi: thuoc.MA_THUOC,
            canh_bao: `⛔ Vật tư y tế [${thuoc.TEN_THUOC}] chỉ được sử dụng cho bệnh nhân nội trú.`
        });
    }

    // ----- THÊM CÁC QUY TẮC KHÁC TẠI ĐÂY -----


  });

  return danhSachLoi;
};

// Hàm ví dụ để hiển thị cảnh báo (có thể tích hợp vào UI của bạn)
export const HienThiCanhBaoThuoc = (danhSachLoi) => {
    if (danhSachLoi && danhSachLoi.length > 0) {
        const message = danhSachLoi.map(loi => `- ${loi.canh_bao}`).join('\n');
        Alert.alert('Cảnh Báo Từ Hệ Thống Giám Định Thuốc', message);
    } else {
        Alert.alert('Thông Báo', 'Không tìm thấy vấn đề nào về thuốc.');
    }
};
