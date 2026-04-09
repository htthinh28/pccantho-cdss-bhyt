import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import {
  chuanHoaKhoaMaLuatOnOff,
  khopMaLuatTheoMau,
  normalizeCodeOnOff,
} from './quy_tac_on_off_khop';

export { khopMaLuatTheoMau };

export const KEY_ON_OFF_QUY_TAC_NOI_BO = 'CDSS_ON_OFF_QUY_TAC_NOI_BO_V1';

const normalizeCode = normalizeCodeOnOff;
const normalizeStatus = (value, fallback = 'ON') => {
  const token = normalizeCode(value);
  if (token === 'OFF' || token === '0' || token === 'FALSE') return 'OFF';
  if (token === 'ON' || token === '1' || token === 'TRUE') return 'ON';
  return fallback;
};

const laMoiTruongWeb = () => Platform.OS === 'web' && typeof window !== 'undefined' && !!window.localStorage;
const rutGonKhoangTrang = (value) => String(value || '').replace(/\s+/g, ' ').trim();

const TU_KHOA_XUAT_TOAN = Object.freeze([
  'XUẤT TOÁN',
  'XUAT TOAN',
  'KHÔNG THANH TOÁN',
  'KHONG THANH TOAN',
  'KHÔNG CHI TRẢ',
  'KHONG CHI TRA',
  'KHÔNG ĐỦ ĐIỀU KIỆN THANH TOÁN',
  'KHONG DU DIEU KIEN THANH TOAN',
  'VI PHẠM',
  'VI PHAM',
  'SAI QUY ĐỊNH',
  'SAI QUY DINH',
  'PHÁP LÝ',
  'PHAP LY',
  'VƯỢT PHẠM VI CHUYÊN MÔN',
  'VUOT PHAM VI CHUYEN MON',
  'CẢNH BÁO XUẤT TOÁN',
  'CANH BAO XUAT TOAN',
  'RỦI RO BỊ XUẤT TOÁN',
  'RUI RO BI XUAT TOAN',
]);

const TU_KHOA_CANH_BAO = Object.freeze([
  'CẢNH BÁO',
  'CANH BAO',
  'JCI',
  'GIÁM ĐỊNH',
  'GIAM DINH',
  'QUẢN TRỊ',
  'QUAN TRI',
  'TỐI ƯU',
  'TOI UU',
  'RỦI RO',
  'RUI RO',
  'AUDIT',
  'SAFETY',
]);

const tachTagNgoacVuong = (value = '') => {
  const output = [];
  const regex = /\[([^\]]+)\]/g;
  let match;
  while ((match = regex.exec(String(value || '')))) {
    const tag = rutGonKhoangTrang(match[1]);
    if (tag) output.push(tag.toUpperCase());
  }
  return output;
};

const coTuKhoa = (text, tuKhoa = []) => tuKhoa.some((keyword) => text.includes(keyword));

const layTagNguonCanhBao = (value = '') => {
  const tags = tachTagNgoacVuong(value);
  if (tags.length > 0) return tags[0];

  const text = normalizeCode(value);
  if (text.includes('JCI')) return 'JCI AUDIT';
  if (text.includes('GIÁM ĐỊNH') || text.includes('GIAM DINH')) return 'GIÁM ĐỊNH';
  if (text.includes('QUẢN TRỊ') || text.includes('QUAN TRI')) return 'QUẢN TRỊ';
  if (text.includes('PHÁP LÝ') || text.includes('PHAP LY')) return 'PHÁP LÝ';
  if (text.includes('RỦI RO') || text.includes('RUI RO')) return 'RỦI RO';
  return '';
};

const lamSachNoiDungCanhBao = (value = '') => {
  const goc = rutGonKhoangTrang(value);
  if (!goc) return '';

  let cleaned = goc.replace(/\[[^\]]+\]\s*:?\s*/g, ' ');
  cleaned = cleaned.replace(/^(?:[^A-Za-z0-9\u00C0-\u1EF9\[]+\s*)+/, '');
  cleaned = cleaned.replace(/^(?:CẢNH BÁO XUẤT TOÁN|CANH BAO XUAT TOAN|CẢNH BÁO LỖI|CANH BAO LOI|CẢNH BÁO|CANH BAO|VI PHẠM|VI PHAM|SAI LỆCH|SAI LECH|KHÔNG CHI TRẢ|KHONG CHI TRA|JCI AUDIT|JCI SAFETY|JCI TAT|GIÁM ĐỊNH|GIAM DINH|QUẢN TRỊ|QUAN TRI|PHÁP LÝ|PHAP LY|TỐI ƯU|TOI UU)\s*:?\s*/i, '');
  cleaned = rutGonKhoangTrang(cleaned.replace(/^[:\-]+/, ''));
  return cleaned || goc;
};

const suyRaLoaiQuyTacQuanTri = (item = {}) => {
  const explicitType = normalizeCode(
    item?.NHOM_CANH_BAO
    || item?.nhom_canh_bao
    || item?.LOAI_CANH_BAO
    || item?.loai_canh_bao
    || item?.LOAI_NGHIEP_VU
    || item?.loai_nghiep_vu
    || item?.PHAN_LOAI_QUAN_TRI
    || item?.phan_loai_quan_tri
  );

  if (explicitType.includes('XUAT') || explicitType.includes('THANH_TOAN')) return 'XUAT_TOAN';
  if (explicitType.includes('CANH') || explicitType.includes('RUI_RO') || explicitType.includes('AUDIT')) return 'CANH_BAO';

  const noiDung = normalizeCode([
    item?.TAG_CANH_BAO,
    item?.tag_canh_bao,
    item?.TAG_NGUON_CANH_BAO,
    item?.tag_nguon_canh_bao,
    item?.CANH_BAO,
    item?.canh_bao,
    item?.TEN_QUY_TAC,
    item?.ten_quy_tac,
    item?.MA_LUAT,
    item?.ma_luat,
  ].filter(Boolean).join(' | '));

  if (coTuKhoa(noiDung, TU_KHOA_XUAT_TOAN)) return 'XUAT_TOAN';
  if (coTuKhoa(noiDung, TU_KHOA_CANH_BAO)) return 'CANH_BAO';
  return 'CANH_BAO';
};

export const suyRaThongTinQuanTriQuyTac = (item = {}) => {
  const nhom_canh_bao = suyRaLoaiQuyTacQuanTri(item);
  const tag_nguon_canh_bao = rutGonKhoangTrang(
    item?.TAG_NGUON_CANH_BAO || item?.tag_nguon_canh_bao || layTagNguonCanhBao(item?.CANH_BAO || item?.canh_bao || '')
  );
  const chi_tiet_canh_bao = rutGonKhoangTrang(
    item?.CHI_TIET_CANH_BAO
    || item?.chi_tiet_canh_bao
    || lamSachNoiDungCanhBao(item?.CANH_BAO || item?.canh_bao || '')
    || (nhom_canh_bao === 'XUAT_TOAN'
      ? 'Quy tắc này dùng để nhận diện tình huống có nguy cơ bị từ chối hoặc xuất toán chi phí BHYT.'
      : 'Quy tắc này tạo cảnh báo rà soát trước khi chốt thanh toán hoặc giải trình hồ sơ.')
  );

  return {
    nhom_canh_bao,
    tag_canh_bao: nhom_canh_bao === 'XUAT_TOAN' ? 'QUY TẮC XUẤT TOÁN' : 'QUY TẮC CẢNH BÁO',
    tag_nguon_canh_bao,
    chi_tiet_canh_bao,
  };
};

const DANH_MUC_QUY_TAC_NOI_BO_THEO_NHOM = Object.freeze([
  { tab_id: 'LUAT_DU_LIEU', ma_luat: 'STRUCT-*', ten_quy_tac: 'Cấu trúc XML (tất cả mã STRUCT-*)' },
  { tab_id: 'LUAT_DU_LIEU', ma_luat: 'XML1-*', ten_quy_tac: 'Cấu trúc XML1 (tất cả mã XML1-*)' },
  { tab_id: 'LUAT_DU_LIEU', ma_luat: 'XML2-*', ten_quy_tac: 'Cấu trúc XML2 (tất cả mã XML2-*)' },
  { tab_id: 'LUAT_DU_LIEU', ma_luat: 'XML3-*', ten_quy_tac: 'Cấu trúc XML3 (tất cả mã XML3-*)' },
  { tab_id: 'LUAT_DU_LIEU', ma_luat: 'XML4-*', ten_quy_tac: 'Cấu trúc XML4 (tất cả mã XML4-*)' },
  { tab_id: 'LUAT_DU_LIEU', ma_luat: 'XML5-*', ten_quy_tac: 'Cấu trúc XML5 (tất cả mã XML5-*)' },
  { tab_id: 'LUAT_DU_LIEU', ma_luat: 'XML6-*', ten_quy_tac: 'Cấu trúc XML6 (tất cả mã XML6-*)' },

  { tab_id: 'LUAT_HANH_CHINH', ma_luat: 'HC-*', ten_quy_tac: 'Hành chính XML1 (HC-*)' },
  { tab_id: 'LUAT_HANH_CHINH', ma_luat: 'HC-06*', ten_quy_tac: 'Quyền lợi và mức hưởng BHYT (HC-06*)' },
  { tab_id: 'LUAT_HANH_CHINH', ma_luat: 'FPG-00', ten_quy_tac: 'False Positive Guard' },

  { tab_id: 'LUAT_THUOC', ma_luat: 'DM-THUOC-*', ten_quy_tac: 'Danh mục thuốc nội bộ (DM-THUOC-*)' },
  { tab_id: 'LUAT_THUOC', ma_luat: 'DMBV-THUOC-*', ten_quy_tac: 'Chất lượng danh mục thuốc BV (DMBV-THUOC-*)' },
  { tab_id: 'LUAT_THUOC', ma_luat: 'CLN-THUOC-*', ten_quy_tac: 'Lâm sàng thuốc (CLN-THUOC-*)' },

  { tab_id: 'LUAT_CDHA', ma_luat: 'DM-DVKT-*', ten_quy_tac: 'Danh mục DVKT nội bộ (DM-DVKT-*)' },
  { tab_id: 'LUAT_CDHA', ma_luat: 'DMBV-DVKT-*', ten_quy_tac: 'Chất lượng danh mục DVKT BV (DMBV-DVKT-*)' },
  { tab_id: 'LUAT_CDHA', ma_luat: 'CLN-CDHA-*', ten_quy_tac: 'Lâm sàng CDHA/DVKT (CLN-CDHA-*)' },
  { tab_id: 'LUAT_CDHA', ma_luat: 'DVKT-OP-01', ten_quy_tac: 'No-code DVKT: ICD chỉ định phù hợp' },
  { tab_id: 'LUAT_CDHA', ma_luat: 'DVKT-OP-02', ten_quy_tac: 'No-code DVKT: ICD chống chỉ định' },
  { tab_id: 'LUAT_CDHA', ma_luat: 'DVKT-OP-03', ten_quy_tac: 'No-code DVKT: Phạm vi hành nghề' },
  { tab_id: 'LUAT_CDHA', ma_luat: 'DVKT-OP-04', ten_quy_tac: 'No-code DVKT: Trang thiết bị' },
  { tab_id: 'LUAT_CDHA', ma_luat: 'DVKT-OP-05', ten_quy_tac: 'No-code DVKT: Đơn giá' },
  { tab_id: 'LUAT_CDHA', ma_luat: 'DVKT-OP-06', ten_quy_tac: 'No-code DVKT: Hiệu lực danh mục' },
  { tab_id: 'LUAT_CDHA', ma_luat: 'DVKT-OP-07', ten_quy_tac: 'No-code DVKT: Phân loại PTTT' },
  { tab_id: 'LUAT_CDHA', ma_luat: 'DVKT-OP-08', ten_quy_tac: 'No-code DVKT: Ghi chú đặc thù' },
  { tab_id: 'LUAT_CDHA', ma_luat: 'DVKT-OP-09', ten_quy_tac: 'No-code DVKT: Danh mục nội bộ phê duyệt' },
  { tab_id: 'LUAT_CDHA', ma_luat: 'DVKT-OP-10', ten_quy_tac: 'No-code DVKT: Thời gian hành nghề bác sĩ' },
  { tab_id: 'LUAT_CDHA', ma_luat: 'DVKT-OP-11', ten_quy_tac: 'No-code DVKT: Danh mục 3 tạm thời' },
  { tab_id: 'LUAT_CDHA', ma_luat: 'DVKT-OP-12', ten_quy_tac: 'No-code DVKT: Mapping người hành nghề theo DVKT' },
  { tab_id: 'LUAT_CDHA', ma_luat: 'DVKT-OP-13', ten_quy_tac: 'No-code DVKT: Đối soát tên DVKT theo danh mục' },
  { tab_id: 'LUAT_CDHA', ma_luat: 'DVKT-OP-14', ten_quy_tac: 'No-code DVKT: Danh mục DVKT phải có đơn giá' },
  { tab_id: 'LUAT_CDHA', ma_luat: 'DVKT-OP-15', ten_quy_tac: 'No-code DVKT: Danh mục DVKT phải có quyết định' },
  { tab_id: 'LUAT_CDHA', ma_luat: 'CDHA-*', ten_quy_tac: 'Bảng luật CĐHA/DVKT nạp từ Excel (CDHA-*)' },
  { tab_id: 'LUAT_CDHA', ma_luat: 'CHUYEN_DE*', ten_quy_tac: 'Bảng luật Giám định chuyên đề nạp từ Excel (CHUYEN_DE*)' },

  { tab_id: 'LUAT_CONG_KHAM', ma_luat: 'CK-*', ten_quy_tac: 'Bảng luật Công khám nạp từ Excel (CK-*)' },

  { tab_id: 'LUAT_NHAN_SU', ma_luat: 'NS-*', ten_quy_tac: 'Bảng luật Nhân sự nạp từ Excel (NS-*)' },

  { tab_id: 'LUAT_GIUONG', ma_luat: 'GB-*', ten_quy_tac: 'Bảng luật Giường nạp từ Excel (GB-*)' },
  { tab_id: 'LUAT_HOP_DONG', ma_luat: 'HD-*', ten_quy_tac: 'Bảng luật Hợp đồng nạp từ Excel (HD-*)' },

  { tab_id: 'LUAT_GIUONG', ma_luat: 'DM-KHOA-*', ten_quy_tac: 'Danh mục khoa, bàn khám, giường nội bộ (DM-KHOA-*)' },
  { tab_id: 'LUAT_GIUONG', ma_luat: 'CLN-GIUONG-*', ten_quy_tac: 'Lâm sàng giường bệnh (CLN-GIUONG-*)' },
  { tab_id: 'LUAT_PTTT', ma_luat: 'CLN-PTTT-*', ten_quy_tac: 'Lâm sàng PTTT (CLN-PTTT-*)' },
  { tab_id: 'LUAT_CHUYEN_TUYEN', ma_luat: 'CLN-CT-*', ten_quy_tac: 'Lâm sàng chuyển tuyến (CLN-CT-*)' },
  { tab_id: 'LUAT_HOP_DONG', ma_luat: 'CLN-CHI-*', ten_quy_tac: 'Đối chiếu tổng chi phí (CLN-CHI-*)' },

  // Tổng hoá mã seed/engine — bật/tắt cả lớp. Ưu tiên: mã khớp chính xác trong map > mẫu * dài hơn > mẫu * ngắn (xem layTrangThaiTheoMau).
  { tab_id: 'LUAT_THUOC', ma_luat: 'THUOC*', ten_quy_tac: 'Tất cả mã THUOC_* (luật thuốc seed / NoCode XML2)' },
  { tab_id: 'LUAT_DU_LIEU', ma_luat: 'XML*', ten_quy_tac: 'Tất cả mã XML_* (kiểm tra số học / cấu trúc XML130)' },
  { tab_id: 'LUAT_DU_LIEU', ma_luat: 'STRUCT*', ten_quy_tac: 'Tất cả mã STRUCT-*' },
  { tab_id: 'LUAT_CDHA', ma_luat: 'DVKT*', ten_quy_tac: 'Tất cả mã DVKT_*' },
]);

const DANH_MUC_QUY_TAC_NOI_BO_CHI_TIET = Object.freeze([
  { tab_id: 'LUAT_HANH_CHINH', ma_luat: 'HC-01c', ten_quy_tac: 'Mã mức hưởng trên thẻ BHYT' },
  { tab_id: 'LUAT_HANH_CHINH', ma_luat: 'HC-06b', ten_quy_tac: 'Đối tượng không được hưởng BHYT nhưng vẫn phát sinh thanh toán' },
  { tab_id: 'LUAT_HANH_CHINH', ma_luat: 'HC-06c', ten_quy_tac: 'Đối tượng hưởng 100% không phụ thuộc thẻ' },
  { tab_id: 'LUAT_HANH_CHINH', ma_luat: 'HC-06d', ten_quy_tac: 'Đối chiếu mức hưởng theo mã thẻ BHYT' },
  { tab_id: 'LUAT_THUOC', ma_luat: 'CLN-THUOC-04', ten_quy_tac: 'Kê đơn ngoại trú quá 30 ngày ngoài danh mục cho phép' },
  { tab_id: 'LUAT_GIUONG', ma_luat: 'DM-KHOA-01', ten_quy_tac: 'Mã khoa ngoài danh mục nội bộ M01' },
  { tab_id: 'LUAT_GIUONG', ma_luat: 'DM-KHOA-02', ten_quy_tac: 'Phát sinh dịch vụ giường tại khoa chưa đăng ký giường' },
  { tab_id: 'LUAT_GIUONG', ma_luat: 'CLN-GIUONG-01', ten_quy_tac: 'Đối chiếu số ngày giường với số ngày điều trị' },
  { tab_id: 'LUAT_HOP_DONG', ma_luat: 'CLN-CHI-01', ten_quy_tac: 'Đối chiếu tổng tiền thuốc' },
  { tab_id: 'LUAT_HOP_DONG', ma_luat: 'CLN-CHI-02', ten_quy_tac: 'Đối chiếu T_VTYT với tổng XML3 (DVKT)' },
]);

const taoDanhMucQuyTacNoiBo = () => {
  const daCo = new Set();
  return [...DANH_MUC_QUY_TAC_NOI_BO_THEO_NHOM, ...DANH_MUC_QUY_TAC_NOI_BO_CHI_TIET].filter((item) => {
    const khoa = `${item.tab_id}|${normalizeCode(item.ma_luat)}`;
    if (daCo.has(khoa)) return false;
    daCo.add(khoa);
    return true;
  });
};

export const DANH_MUC_QUY_TAC_NOI_BO = Object.freeze(taoDanhMucQuyTacNoiBo());

// Các rule phụ thuộc mapping/phân loại nghiệp vụ phức tạp có thể tạo dương tính giả cao.
// Mặc định OFF để giảm thời gian xử lý thủ công; người dùng có thể bật lại trong màn hình ON/OFF.
const DANH_SACH_MAU_QUY_TAC_MAC_DINH_OFF = Object.freeze([
  'DVKT-OP-03', // Phạm vi hành nghề (phụ thuộc mapping nhân sự/chuyên khoa)
  'DVKT-OP-04', // Trang thiết bị (phụ thuộc danh mục M06 đầy đủ)
  'DVKT-OP-07', // Phân loại PTTT (phụ thuộc mã phân loại và quy ước viện)
  'DVKT-OP-10', // Thời gian hành nghề bác sĩ (dễ lệch do dữ liệu ca/kíp)
  'DVKT-OP-11', // Danh mục 3 tạm thời (thường chưa ổn định)
  'DVKT-OP-12', // Mapping người hành nghề theo DVKT (phụ thuộc mapping mở rộng)
  // Nhóm mã report thực tế đang nhiễu cao, cần rà soát nghiệp vụ trước khi bật lại.
  'CDHA_08',
  'CDHA_09',
  'CDHA_198',
  'CDHA_202',
  'CDHA_236',
  'THUOC_98',
  'THUOC_400',
  'DVKT_1602',
  'DMBV-DVKT-00',
  'DMBV-THUOC-00',
  // Nhóm hardcoded từ Excel đang trùng nghĩa hoặc dùng pseudo-syntax chưa hỗ trợ ổn định.
  // Tắt mặc định để giảm dương tính giả; vẫn có thể bật lại từ màn hình ON/OFF khi đã rà soát.
  'GB_02',
  'GB_76',
  'CK_23',
  'CK_25',
  'CK_26',
  'CK_27',
  'CK_36',
  'CK_38',
  'CK_46',
  'CK_51',
  'CK_52',
  'NS_01',
  'NS_10',
  'NS_02',
  'NS_03',
  'NS_04',
  'NS_05',
  'NS_06',
  'NS_07',
  'NS_08',
  'NS_09',
  'NS_11',
  'NS_12',
  'NS_13',
  'NS_14',
  'NS_15',
  'HD_01',
  'GB_63',
  'GB_71',
  'GB_28',
  'GB_34',
  'GB_56',
  'GB_67',
  'GB_68',
  // Nhóm chuyên đề cảnh báo mềm/kiểm tra logic: mặc định OFF để giảm dương tính giả.
  'CHUYEN_DE_003', 'CHUYEN_DE_009', 'CHUYEN_DE_010', 'CHUYEN_DE_011', 'CHUYEN_DE_012',
  'CHUYEN_DE_014', 'CHUYEN_DE_019', 'CHUYEN_DE_020', 'CHUYEN_DE_024', 'CHUYEN_DE_027',
  'CHUYEN_DE_031', 'CHUYEN_DE_037', 'CHUYEN_DE_038', 'CHUYEN_DE_039', 'CHUYEN_DE_044',
  'CHUYEN_DE_047', 'CHUYEN_DE_055', 'CHUYEN_DE_058', 'CHUYEN_DE_068', 'CHUYEN_DE_083',
  'CHUYEN_DE_091', 'CHUYEN_DE_095', 'CHUYEN_DE_097', 'CHUYEN_DE_112', 'CHUYEN_DE_121',
  'CHUYEN_DE_124', 'CHUYEN_DE_138', 'CHUYEN_DE_139', 'CHUYEN_DE_151', 'CHUYEN_DE_166',
  'CHUYEN_DE_169', 'CHUYEN_DE_172', 'CHUYEN_DE_175', 'CHUYEN_DE_180', 'CHUYEN_DE_182',
  'CHUYEN_DE_189', 'CHUYEN_DE_191', 'CHUYEN_DE_209', 'CHUYEN_DE_215', 'CHUYEN_DE_223',
  'CHUYEN_DE_244', 'CHUYEN_DE_257', 'CHUYEN_DE_258', 'CHUYEN_DE_289', 'CHUYEN_DE_294',
  'CHUYEN_DE_295', 'CHUYEN_DE_298', 'CHUYEN_DE_299', 'CHUYEN_DE_306', 'CHUYEN_DE_322',
  'CHUYEN_DE_342', 'CHUYEN_DE_357', 'CHUYEN_DE_364', 'CHUYEN_DE_371', 'CHUYEN_DE_374',
  'CHUYEN_DE_381', 'CHUYEN_DE_385', 'CHUYEN_DE_390', 'CHUYEN_DE_408', 'CHUYEN_DE_414',
  'CHUYEN_DE_416', 'CHUYEN_DE_417', 'CHUYEN_DE_434', 'CHUYEN_DE_440', 'CHUYEN_DE_457',
  'CHUYEN_DE_458', 'CHUYEN_DE_472', 'CHUYEN_DE_482', 'CHUYEN_DE_491', 'CHUYEN_DE_495',
  'CHUYEN_DE_496', 'CHUYEN_DE_507', 'CHUYEN_DE_520', 'CHUYEN_DE_522', 'CHUYEN_DE_526',
  'CHUYEN_DE_528', 'CHUYEN_DE_530', 'CHUYEN_DE_534', 'CHUYEN_DE_540', 'CHUYEN_DE_543',
  'CHUYEN_DE_546', 'CHUYEN_DE_551', 'CHUYEN_DE_554', 'CHUYEN_DE_561', 'CHUYEN_DE_563',
  'CHUYEN_DE_566', 'CHUYEN_DE_571', 'CHUYEN_DE_580', 'CHUYEN_DE_582', 'CHUYEN_DE_591',

  // Phụ thuộc bản in / PACS / phiếu công khai tay / bảng kê — không có trong XML130 gửi BHXH; chỉ bật khi BV có map dữ liệu mở rộng.
  'CHUYEN_DE_029',
  'CHUYEN_DE_043',
  'CHUYEN_DE_125',
  'CHUYEN_DE_211',
  'CHUYEN_DE_212',
  'CHUYEN_DE_504',
  'CHUYEN_DE_540',
]);

// Các rule đã xác nhận dương tính giả: khóa OFF cứng để tránh bị bật lại bởi cache cũ.
const DANH_SACH_QUY_TAC_TAT_CUNG = Object.freeze([
  'CDHA_07',
  'CDHA_113',
  'DVKT_1634',
  'XML_140',
]);

const isQuyTacTatCung = (maLuat = '') => {
  const m = chuanHoaKhoaMaLuatOnOff(maLuat);
  if (!m) return false;
  return DANH_SACH_QUY_TAC_TAT_CUNG.some((x) => chuanHoaKhoaMaLuatOnOff(x) === m);
};

const isMauQuyTacMacDinhOff = (maLuat = '') => {
  const ma = chuanHoaKhoaMaLuatOnOff(maLuat);
  if (!ma) return false;
  return DANH_SACH_MAU_QUY_TAC_MAC_DINH_OFF.some((patternRaw) => {
    const pattern = normalizeCode(patternRaw);
    if (!pattern) return false;
    if (pattern.endsWith('*')) return ma.startsWith(chuanHoaKhoaMaLuatOnOff(pattern.slice(0, -1)));
    return ma === chuanHoaKhoaMaLuatOnOff(pattern);
  });
};

const DANH_MUC_MAU_NOI_BO = DANH_MUC_QUY_TAC_NOI_BO.map((item, index) => {
  const thongTinQuanTri = suyRaThongTinQuanTriQuyTac(item);
  return {
    id: `builtin-${index + 1}`,
    MA_LUAT: item.ma_luat,
    TEN_QUY_TAC: item.ten_quy_tac,
    TRANG_THAI: isMauQuyTacMacDinhOff(item.ma_luat) ? 'OFF' : 'ON',
    LOAI_QUY_TAC: 'BUILTIN',
    TAB_ID: item.tab_id,
    NHOM_CANH_BAO: thongTinQuanTri.nhom_canh_bao,
    TAG_CANH_BAO: thongTinQuanTri.tag_canh_bao,
    TAG_NGUON_CANH_BAO: thongTinQuanTri.tag_nguon_canh_bao,
    CHI_TIET_CANH_BAO: thongTinQuanTri.chi_tiet_canh_bao,
  };
});

const parseJsonAnToan = (raw, fallback = {}) => {
  try {
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const toObjectFromItems = (items) => {
  const statusMap = {};
  (Array.isArray(items) ? items : []).forEach((item) => {
    const ma = normalizeCode(item?.MA_LUAT || item?.ma_luat);
    if (!ma) return;
    statusMap[chuanHoaKhoaMaLuatOnOff(ma)] = normalizeStatus(item?.TRANG_THAI || item?.trang_thai, 'ON');
  });
  return statusMap;
};

export const taiMapTrangThaiQuyTacNoiBo = async () => {
  let raw;
  if (laMoiTruongWeb()) raw = window.localStorage.getItem(KEY_ON_OFF_QUY_TAC_NOI_BO);
  else raw = await AsyncStorage.getItem(KEY_ON_OFF_QUY_TAC_NOI_BO);

  const parsed = parseJsonAnToan(raw, {});
  if (Array.isArray(parsed)) return toObjectFromItems(parsed);
  if (Array.isArray(parsed?.items)) return toObjectFromItems(parsed.items);
  if (parsed?.status_map && typeof parsed.status_map === 'object') {
    const normalized = {};
    Object.entries(parsed.status_map).forEach(([key, value]) => {
      const ma = normalizeCode(key);
      if (!ma) return;
      normalized[chuanHoaKhoaMaLuatOnOff(ma)] = normalizeStatus(value, 'ON');
    });
    return normalized;
  }

  if (parsed && typeof parsed === 'object') {
    const normalized = {};
    Object.entries(parsed).forEach(([key, value]) => {
      const ma = normalizeCode(key);
      if (!ma || ma === 'VERSION' || ma === 'UPDATED_AT') return;
      normalized[chuanHoaKhoaMaLuatOnOff(ma)] = normalizeStatus(value, 'ON');
    });
    return normalized;
  }

  return {};
};

export const luuMapTrangThaiQuyTacNoiBo = async (statusMap = {}) => {
  const normalized = {};
  Object.entries(statusMap || {}).forEach(([key, value]) => {
    const ma = normalizeCode(key);
    if (!ma) return;
    normalized[chuanHoaKhoaMaLuatOnOff(ma)] = normalizeStatus(value, 'ON');
  });
  const payload = {
    version: 1,
    updated_at: new Date().toISOString(),
    items: Object.entries(normalized).map(([MA_LUAT, TRANG_THAI]) => ({ MA_LUAT, TRANG_THAI })),
  };
  const raw = JSON.stringify(payload);
  if (laMoiTruongWeb()) window.localStorage.setItem(KEY_ON_OFF_QUY_TAC_NOI_BO, raw);
  else await AsyncStorage.setItem(KEY_ON_OFF_QUY_TAC_NOI_BO, raw);
  return normalized;
};

export const taoDanhSachQuyTacNoiBoTheoTab = (statusMap = {}) => {
  const byTab = {};
  DANH_MUC_MAU_NOI_BO.forEach((rule) => {
    const tabId = rule.TAB_ID;
    const ma = chuanHoaKhoaMaLuatOnOff(rule.MA_LUAT);
    const trangThaiThucTe = isQuyTacTatCung(ma)
      ? 'OFF'
      : normalizeStatus(statusMap[ma], rule.TRANG_THAI);
    if (!byTab[tabId]) byTab[tabId] = [];
    byTab[tabId].push({
      ...rule,
      MA_LUAT: ma,
      TRANG_THAI: trangThaiThucTe,
      _kind: 'BUILTIN',
    });
  });
  return byTab;
};

/** Mẫu có *: prefix càng dài = càng cụ thể (THUOC_4* thắng THUOC*). */
const tinhDoUuTienMauCoSao = (patternRaw) => {
  const p = normalizeCode(patternRaw);
  if (!p.endsWith('*')) return p.length + 100000;
  const prefix = p.slice(0, -1);
  return prefix.length;
};

const layTrangThaiTheoMau = (maLuat, statusMap = {}) => {
  const ma = normalizeCode(maLuat);
  if (!ma) return null;
  const maKey = chuanHoaKhoaMaLuatOnOff(ma);
  const exact = statusMap[maKey];
  if (exact) return normalizeStatus(exact, 'ON');

  let selectedPattern = '';
  let selectedScore = -1;
  let selectedStatus = null;
  Object.entries(statusMap || {}).forEach(([pattern, status]) => {
    const p = normalizeCode(pattern);
    if (!p || !p.endsWith('*')) return;
    if (!khopMaLuatTheoMau(p, ma)) return;
    const score = tinhDoUuTienMauCoSao(p);
    if (score > selectedScore) {
      selectedScore = score;
      selectedPattern = p;
      selectedStatus = normalizeStatus(status, 'ON');
    }
  });
  return selectedStatus;
};

export const isQuyTacNoiBoDangBat = (maLuat, statusMap = {}, fallbackOn = true) => {
  if (isQuyTacTatCung(maLuat)) return false;
  const status = layTrangThaiTheoMau(maLuat, statusMap);
  if (!status) {
    const macDinh = isMauQuyTacMacDinhOff(maLuat) ? 'OFF' : null;
    if (!macDinh) return fallbackOn;
    return macDinh === 'ON';
  }
  return status === 'ON';
};

export const locCanhBaoTheoTrangThaiQuyTacNoiBo = (
  danhSachCanhBao = [],
  statusMap = {},
  { chiLocCanhBaoNoiBo = true } = {}
) => {
  return (Array.isArray(danhSachCanhBao) ? danhSachCanhBao : []).filter((item) => {
    if (!chiLocCanhBaoNoiBo) return true;
    const maLuat = String(item?.ma_luat || item?.rule_code || item?.MA_LUAT || '').trim();
    if (!maLuat) return true;
    // Mọi mã luật (luật động, CHUYEN_DE_*, CDHA_*, THUOC_* seed…) đều áp dụng map ON/OFF + danh sách mặc định OFF.
    return isQuyTacNoiBoDangBat(maLuat, statusMap, true);
  });
};

export const capNhatMapTrangThaiTuRowsNoiBo = (rows = [], currentStatusMap = {}) => {
  const next = {};
  Object.entries(currentStatusMap || {}).forEach(([k, v]) => {
    const nk = chuanHoaKhoaMaLuatOnOff(k);
    if (nk) next[nk] = v;
  });
  (Array.isArray(rows) ? rows : []).forEach((row) => {
    const ma = normalizeCode(row?.MA_LUAT || row?.ma_luat);
    if (!ma) return;
    const k = chuanHoaKhoaMaLuatOnOff(ma);
    next[k] = isQuyTacTatCung(ma)
      ? 'OFF'
      : normalizeStatus(row?.TRANG_THAI || row?.trang_thai, 'ON');
  });
  DANH_SACH_QUY_TAC_TAT_CUNG.forEach((ma) => {
    next[chuanHoaKhoaMaLuatOnOff(ma)] = 'OFF';
  });
  return next;
};
