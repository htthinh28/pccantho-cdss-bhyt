import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import {
  chuanHoaKhoaMaLuatOnOff,
  khopMaLuatTheoMau,
  normalizeCodeOnOff,
} from './quy_tac_on_off_khop';
import DATA_QUY_TAC_GIU_OFF_MO_RONG from './data_quy_tac_giu_off_mo_rong.json';

export { khopMaLuatTheoMau, chuanHoaKhoaMaLuatOnOff };

export const KEY_ON_OFF_QUY_TAC_NOI_BO = 'CDSS_ON_OFF_QUY_TAC_NOI_BO_V1';
/** Ghi đè nội dung hiển thị (tên, cảnh báo, nhóm…) cho quy tắc mẫu MA NGUON — không sửa mã trong repo */
export const KEY_GHI_DE_NOI_DUNG_QUY_TAC_NOI_BO = 'CDSS_GHI_DE_NOI_DUNG_QUY_TAC_NOI_BO_V1';
/** Mã luật đã ẩn khỏi màn hình quản trị (vẫn tồn tại trong engine theo ON/OFF) */
export const KEY_AN_KHOI_QUAN_LY_QUY_TAC_NOI_BO = 'CDSS_AN_KHOI_QUAN_LY_QUY_TAC_NOI_BO_V1';

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
  'KIỂM TRA',
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
  if (text.includes('KIỂM TRA') || text.includes('GIAM DINH')) return 'KIỂM TRA';
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
  cleaned = cleaned.replace(/^(?:CẢNH BÁO XUẤT TOÁN|CANH BAO XUAT TOAN|CẢNH BÁO LỖI|CANH BAO LOI|CẢNH BÁO|CANH BAO|VI PHẠM|VI PHAM|SAI LỆCH|SAI LECH|KHÔNG CHI TRẢ|KHONG CHI TRA|JCI AUDIT|JCI SAFETY|JCI TAT|KIỂM TRA|GIAM DINH|QUẢN TRỊ|QUAN TRI|PHÁP LÝ|PHAP LY|TỐI ƯU|TOI UU)\s*:?\s*/i, '');
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
  { tab_id: 'LUAT_THUOC', ma_luat: 'THUOC_DKTT_*', ten_quy_tac: 'Thuốc có điều kiện thanh toán theo danh mục nội bộ (THUOC_DKTT_*)' },

  { tab_id: 'LUAT_CDHA', ma_luat: 'DM-DVKT-*', ten_quy_tac: 'Danh mục DVKT nội bộ (DM-DVKT-*)' },
  { tab_id: 'LUAT_CDHA', ma_luat: 'DMBV-DVKT-*', ten_quy_tac: 'Chất lượng danh mục DVKT BV (DMBV-DVKT-*)' },
  { tab_id: 'LUAT_CDHA', ma_luat: 'CLN-CDHA-*', ten_quy_tac: 'Lâm sàng CDHA/DVKT (CLN-CDHA-*)' },
  { tab_id: 'LUAT_CDHA', ma_luat: 'CLN-DVKT-*', ten_quy_tac: 'Lâm sàng XML3: thời điểm khám vs DVKT (CLN-DVKT-*)' },
  { tab_id: 'LUAT_CDHA', ma_luat: 'CV4262-*', ten_quy_tac: 'Thanh toán BHYT theo Công văn 4262/BHXH-CSYT (CV4262-*)' },
  { tab_id: 'LUAT_CDHA', ma_luat: 'CV3231-*', ten_quy_tac: 'Phạm vi hành nghề & thanh toán theo Công văn 3231/BYT-KCB (CV3231-*)' },
  { tab_id: 'LUAT_CDHA', ma_luat: 'DVKT-OP-01', ten_quy_tac: 'No-code DVKT: ICD chỉ định phù hợp' },
  { tab_id: 'LUAT_CDHA', ma_luat: 'DVKT-OP-02', ten_quy_tac: 'No-code DVKT: ICD chống chỉ định' },
  { tab_id: 'LUAT_CDHA', ma_luat: 'DVKT-OP-03', ten_quy_tac: 'No-code DVKT: Phạm vi hành nghề (NGUOI_THUC_HIEN; giường bệnh miễn)' },
  { tab_id: 'LUAT_CDHA', ma_luat: 'DVKT-OP-04', ten_quy_tac: 'No-code DVKT: Trang thiết bị' },
  { tab_id: 'LUAT_CDHA', ma_luat: 'DVKT-OP-05', ten_quy_tac: 'No-code DVKT: Đơn giá' },
  { tab_id: 'LUAT_CDHA', ma_luat: 'DVKT-OP-06', ten_quy_tac: 'No-code DVKT: Hiệu lực danh mục' },
  { tab_id: 'LUAT_CDHA', ma_luat: 'DVKT-OP-07', ten_quy_tac: 'No-code DVKT: Phân loại PTTT' },
  { tab_id: 'LUAT_CDHA', ma_luat: 'DVKT-OP-08', ten_quy_tac: 'No-code DVKT: Ghi chú đặc thù' },
  { tab_id: 'LUAT_CDHA', ma_luat: 'DVKT-OP-09', ten_quy_tac: 'No-code DVKT: Khám & giường bệnh (nội bộ) phê duyệt' },
  { tab_id: 'LUAT_CDHA', ma_luat: 'DVKT-OP-16', ten_quy_tac: 'No-code DVKT: Cảnh báo mã giường dạng cũ Kxx.xxxx (tùy chọn)' },
  { tab_id: 'LUAT_CDHA', ma_luat: 'DVKT-OP-10', ten_quy_tac: 'No-code DVKT: Thời gian hành nghề bác sĩ' },
  { tab_id: 'LUAT_CDHA', ma_luat: 'DVKT-OP-11', ten_quy_tac: 'No-code DVKT: Danh mục 3 tạm thời' },
  { tab_id: 'LUAT_CDHA', ma_luat: 'DVKT-OP-13', ten_quy_tac: 'No-code DVKT: Đối soát tên DVKT theo danh mục' },
  { tab_id: 'LUAT_CDHA', ma_luat: 'DVKT-OP-14', ten_quy_tac: 'No-code DVKT: Danh mục DVKT phải có đơn giá' },
  { tab_id: 'LUAT_CDHA', ma_luat: 'DVKT-OP-15', ten_quy_tac: 'No-code DVKT: Danh mục DVKT phải có quyết định' },
  { tab_id: 'LUAT_CDHA', ma_luat: 'CDHA-*', ten_quy_tac: 'Bảng luật CĐHA/DVKT nạp từ Excel (CDHA-*)' },
  { tab_id: 'LUAT_CDHA', ma_luat: 'CHUYEN_DE*', ten_quy_tac: 'Bảng luật Kiểm tra chuyên đề nạp từ Excel (CHUYEN_DE*)' },

  { tab_id: 'LUAT_CONG_KHAM', ma_luat: 'CK-*', ten_quy_tac: 'Bảng luật Công khám nạp từ Excel (CK-*)' },
  { tab_id: 'LUAT_CONG_KHAM', ma_luat: 'CK_59', ten_quy_tac: 'BS một CCHN — nhiều loại công khám / chuyên khoa (CK_59)' },

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
  { tab_id: 'LUAT_DU_LIEU', ma_luat: 'ICD-KEP-*', ten_quy_tac: 'ICD-10 mã kép †/* (phân loại kép)' },
  { tab_id: 'LUAT_CDHA', ma_luat: 'DVKT*', ten_quy_tac: 'Tất cả mã DVKT_*' },
]);

const DANH_MUC_QUY_TAC_NOI_BO_CHI_TIET = Object.freeze([
  { tab_id: 'LUAT_HANH_CHINH', ma_luat: 'HC-01c', ten_quy_tac: 'Mã mức hưởng trên thẻ BHYT' },
  { tab_id: 'LUAT_HANH_CHINH', ma_luat: 'HC-06b', ten_quy_tac: 'Đối tượng không được hưởng BHYT nhưng vẫn phát sinh thanh toán' },
  { tab_id: 'LUAT_HANH_CHINH', ma_luat: 'HC-06c', ten_quy_tac: 'Đối tượng hưởng 100% không phụ thuộc thẻ' },
  { tab_id: 'LUAT_HANH_CHINH', ma_luat: 'HC-06d', ten_quy_tac: 'Đối chiếu mức hưởng theo mã thẻ BHYT' },
  { tab_id: 'LUAT_THUOC', ma_luat: 'CLN-THUOC-04', ten_quy_tac: 'Kê đơn ngoại trú quá 30 ngày ngoài danh mục cho phép' },
  { tab_id: 'LUAT_THUOC', ma_luat: 'CLN-THUOC-05', ten_quy_tac: 'Gợi ý ICD danh mục cho phép kê đơn >30 ngày (ngoại trú)' },
  { tab_id: 'LUAT_THUOC', ma_luat: 'CLN-THUOC-06', ten_quy_tac: 'Kê đơn ≤30 ngày khi bệnh chính (± kèm theo) thuộc danh mục TT26 >30 ngày' },
  { tab_id: 'LUAT_THUOC', ma_luat: 'THUOC_DKTT_01', ten_quy_tac: 'Thuốc [27.67] Lysin + vitamin + khoáng chất — điều kiện ICD/chẩn đoán/tuổi' },
  {
    tab_id: 'LUAT_THUOC',
    ma_luat: 'THUOC_ICD_CONTRA_MAPPING',
    ten_quy_tac: 'ICD-10 chống chỉ định thuốc (mapping ICD_DRUG_CONTRA / XUẤT TOÁN XML2)',
  },
  { tab_id: 'LUAT_GIUONG', ma_luat: 'DM-KHOA-01', ten_quy_tac: 'Mã khoa ngoài danh mục nội bộ M01' },
  { tab_id: 'LUAT_GIUONG', ma_luat: 'DM-KHOA-02', ten_quy_tac: 'Phát sinh dịch vụ giường tại khoa chưa đăng ký giường' },
  { tab_id: 'LUAT_GIUONG', ma_luat: 'CLN-GIUONG-01', ten_quy_tac: 'Đối chiếu số ngày giường với số ngày điều trị' },
  { tab_id: 'LUAT_HOP_DONG', ma_luat: 'CLN-CHI-01', ten_quy_tac: 'Đối chiếu tổng tiền thuốc' },
  { tab_id: 'LUAT_HOP_DONG', ma_luat: 'CLN-CHI-02', ten_quy_tac: 'Đối chiếu T_VTYT với tổng XML3 (DVKT)' },
  { tab_id: 'LUAT_CDHA', ma_luat: 'CV4262-01', ten_quy_tac: 'CV4262 §1.1: DVKT chỉ định sẵn — không công khám' },
  { tab_id: 'LUAT_CDHA', ma_luat: 'CV4262-02', ten_quy_tac: 'CV4262 §1.2: Một chuyên khoa — một công khám/lượt' },
  { tab_id: 'LUAT_CDHA', ma_luat: 'CV4262-21', ten_quy_tac: 'CV4262 §2.1: CT ngực+bụng có cản quang (1 ống)' },
  { tab_id: 'LUAT_CDHA', ma_luat: 'CV4262-23', ten_quy_tac: 'CV4262 §2.3: Bóp bóng Ambu — hồi sức sơ sinh' },
  { tab_id: 'LUAT_CDHA', ma_luat: 'CV4262-25', ten_quy_tac: 'CV4262 §2.5: Nội soi TMH gói vs đơn lẻ' },
  { tab_id: 'LUAT_CDHA', ma_luat: 'CV4262-PL01-05', ten_quy_tac: 'CV4262 PL01: Quy trình PT/NS — không Hút đờm' },
  { tab_id: 'LUAT_CDHA', ma_luat: 'CV3231-02', ten_quy_tac: 'CV3231 §2: Điều dưỡng hạng IV — không TT DVKT điều trị/PHCN' },
  { tab_id: 'LUAT_CDHA', ma_luat: 'CV3231-13', ten_quy_tac: 'CV3231 §1.3: BS YHCT/RHM được khám bệnh' },
  { tab_id: 'LUAT_CDHA', ma_luat: 'CV3231-18', ten_quy_tac: 'CV3231 §1.8: Ghi đủ mã NVYT trong ekip' },
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

/**
 * Mặc định ON cho hầu hết quy tắc. Giữ OFF chỉ khi:
 * — CDHA: quy tắc liên quan MRI / DSA (quét từ luat_cdha_hardcoded.jsx);
 * — CHUYEN_DE: quy tắc MRI/DSA trong tên-điều kiện; hoặc DIEU_KIEN placeholder (không đủ dữ liệu XML130);
 * — DANH_SACH_QUY_TAC_TAT_CUNG (khóa OFF cứng).
 * Danh sách mã giữ OFF nằm trong `data_quy_tac_giu_off_mo_rong.json` (cập nhật khi rà soát MRI/DSA/placeholder trong luật).
 */
// Các rule đã xác nhận dương tính giả: khóa OFF cứng để tránh bị bật lại bởi cache cũ.
const DANH_SACH_QUY_TAC_TAT_CUNG = Object.freeze([
  'CDHA_07',
  'CDHA_113',
  'DVKT_1634',
  'XML_140',
  // Cấu trúc QĐ3176 — tắt cứng (dương tính giả 100% hồ sơ; engine đã gỡ bắt/namespace; giữ mã để cache & Firebase đồng bộ).
  'XML1-REQ-MA_TTDV',
  'XML1-UNKNOWN-xsi',
  'XML3-REQ-MA_PTTT_QT',
  'THUOC_448',
  'THUOC_404',
  'TUONGTAC_017',
  'TUONGTAC_344',
  'DVKT-OP-07',
]);

const taoSetMaGiuMacDinhOffTheoChinhSach = () => {
  const s = new Set();
  const add = (code) => {
    const k = chuanHoaKhoaMaLuatOnOff(code);
    if (k) s.add(k);
  };
  const addMany = (arr) => {
    (Array.isArray(arr) ? arr : []).forEach(add);
  };
  addMany(DATA_QUY_TAC_GIU_OFF_MO_RONG.cdha_mri);
  addMany(DATA_QUY_TAC_GIU_OFF_MO_RONG.cdha_dsa);
  addMany(DATA_QUY_TAC_GIU_OFF_MO_RONG.chuyen_de_mri);
  addMany(DATA_QUY_TAC_GIU_OFF_MO_RONG.chuyen_de_dsa);
  addMany(DATA_QUY_TAC_GIU_OFF_MO_RONG.chuyen_de_placeholder);
  addMany(DATA_QUY_TAC_GIU_OFF_MO_RONG.cau_truc_xml_fp || []);
  DANH_SACH_QUY_TAC_TAT_CUNG.forEach(add);
  return s;
};

/** Mã luật mặc định OFF theo chính sách (MRI/DSA/placeholder/tất cung). Các mã khác mặc định ON. */
const MA_GIU_MAC_DINH_OFF_THEO_CHINH_SACH = taoSetMaGiuMacDinhOffTheoChinhSach();

const isQuyTacTatCung = (maLuat = '') => {
  const m = chuanHoaKhoaMaLuatOnOff(maLuat);
  if (!m) return false;
  return DANH_SACH_QUY_TAC_TAT_CUNG.some((x) => chuanHoaKhoaMaLuatOnOff(x) === m);
};

const isMauQuyTacMacDinhOff = (maLuat = '') => {
  const ma = chuanHoaKhoaMaLuatOnOff(maLuat);
  if (!ma) return false;
  return MA_GIU_MAC_DINH_OFF_THEO_CHINH_SACH.has(ma);
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

/**
 * Ghi đè nội dung hiển thị cho quy tắc mẫu (BUILTIN): { [maNorm]: { TEN_QUY_TAC?, CANH_BAO?, NHOM_CANH_BAO?, CHI_TIET_CANH_BAO?, DIEU_KIEN?, TAG_CANH_BAO?, TAG_NGUON_CANH_BAO? } }
 */
export const taiMapGhiDeNoiDungQuyTacNoiBo = async () => {
  let raw;
  if (laMoiTruongWeb()) raw = window.localStorage.getItem(KEY_GHI_DE_NOI_DUNG_QUY_TAC_NOI_BO);
  else raw = await AsyncStorage.getItem(KEY_GHI_DE_NOI_DUNG_QUY_TAC_NOI_BO);
  const parsed = parseJsonAnToan(raw, {});
  if (parsed?.overrides && typeof parsed.overrides === 'object' && !Array.isArray(parsed.overrides)) {
    const o = {};
    Object.entries(parsed.overrides).forEach(([k, v]) => {
      const nk = chuanHoaKhoaMaLuatOnOff(k);
      if (nk && v && typeof v === 'object') o[nk] = v;
    });
    return o;
  }
  if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
    const o = {};
    Object.entries(parsed).forEach(([k, v]) => {
      if (k === 'version' || k === 'updated_at' || k === 'VERSION' || k === 'UPDATED_AT') return;
      const nk = chuanHoaKhoaMaLuatOnOff(k);
      if (nk && v && typeof v === 'object') o[nk] = v;
    });
    return o;
  }
  return {};
};

export const luuMapGhiDeNoiDungQuyTacNoiBo = async (overrides = {}) => {
  const payload = {
    version: 1,
    updated_at: new Date().toISOString(),
    overrides: { ...(overrides || {}) },
  };
  const raw = JSON.stringify(payload);
  if (laMoiTruongWeb()) window.localStorage.setItem(KEY_GHI_DE_NOI_DUNG_QUY_TAC_NOI_BO, raw);
  else await AsyncStorage.setItem(KEY_GHI_DE_NOI_DUNG_QUY_TAC_NOI_BO, raw);
  return payload.overrides;
};

/** Trả về Set mã luật (chuẩn hóa) đã ẩn khỏi UI quản trị */
export const taiTapMaLuatAnKhoiQuanLyNoiBo = async () => {
  let raw;
  if (laMoiTruongWeb()) raw = window.localStorage.getItem(KEY_AN_KHOI_QUAN_LY_QUY_TAC_NOI_BO);
  else raw = await AsyncStorage.getItem(KEY_AN_KHOI_QUAN_LY_QUY_TAC_NOI_BO);
  const parsed = parseJsonAnToan(raw, {});
  const items = Array.isArray(parsed?.items) ? parsed.items : (Array.isArray(parsed) ? parsed : []);
  return new Set(
    items
      .map((x) => chuanHoaKhoaMaLuatOnOff(typeof x === 'string' ? x : (x?.MA_LUAT || x?.ma_luat || '')))
      .filter(Boolean),
  );
};

export const luuTapMaLuatAnKhoiQuanLyNoiBo = async (tap) => {
  const arr = tap instanceof Set ? Array.from(tap) : (Array.isArray(tap) ? tap : []);
  const items = arr.map((x) => chuanHoaKhoaMaLuatOnOff(x)).filter(Boolean);
  const payload = { version: 1, updated_at: new Date().toISOString(), items };
  const raw = JSON.stringify(payload);
  if (laMoiTruongWeb()) window.localStorage.setItem(KEY_AN_KHOI_QUAN_LY_QUY_TAC_NOI_BO, raw);
  else await AsyncStorage.setItem(KEY_AN_KHOI_QUAN_LY_QUY_TAC_NOI_BO, raw);
  return new Set(items);
};

/** Mẫu có *: prefix càng dài = càng cụ thể (THUOC_4* thắng THUOC*). */
const tinhDoUuTienMauCoSao = (patternRaw) => {
  const p = normalizeCode(patternRaw);
  if (!p.endsWith('*')) return p.length + 100000;
  const prefix = p.slice(0, -1);
  return prefix.length;
};

/**
 * Lấy object ghi đè nội dung cho MA_LUAT: khớp chính xác, sau đó mẫu * (ưu tiên prefix dài).
 * Dùng chung màn ON/OFF và áp vào kết quả kiểm tra.
 */
export const layGhiDeNoiDungTheoMaLuat = (maLuatRaw, mapGhiDe = {}) => {
  const ma = chuanHoaKhoaMaLuatOnOff(maLuatRaw);
  if (!ma || !mapGhiDe || typeof mapGhiDe !== 'object') return null;
  const exact = mapGhiDe[ma];
  if (exact && typeof exact === 'object') return exact;

  let selected = null;
  let selectedScore = -1;
  Object.entries(mapGhiDe).forEach(([pattern, payload]) => {
    const p = normalizeCode(pattern);
    if (!p || !p.endsWith('*') || !payload || typeof payload !== 'object') return;
    if (!khopMaLuatTheoMau(p, maLuatRaw)) return;
    const score = tinhDoUuTienMauCoSao(p);
    if (score > selectedScore) {
      selectedScore = score;
      selected = payload;
    }
  });
  return selected;
};

/** Áp ghi đè đã lưu lên một dòng quy tắc (mẫu hoặc hardcoded nội bộ) */
export const apGhiDeChoDongNoiBo = (row, mapGhiDe = {}) => {
  const o = layGhiDeNoiDungTheoMaLuat(row?.MA_LUAT || row?.ma_luat || '', mapGhiDe);
  if (!o) return row;
  return { ...(row || {}), ...o };
};

/**
 * Áp ghi đè nội dung (tên/cảnh báo/điều kiện hiển thị/ghi chú) lên một phần tử cảnh báo từ engine.
 * Không đổi logic trong mã nguồn — chỉ đổi text hiển thị khi đã lưu trong CDSS_GHI_DE_NOI_DUNG_*.
 */
export const apGhiDeNoiDungLenDoiTuongCanhBao = (loi, mapGhiDe = {}) => {
  if (!loi) return loi;
  const maRaw = String(loi?.ma_luat || loi?.MA_LUAT || '').trim();
  const o = layGhiDeNoiDungTheoMaLuat(maRaw, mapGhiDe);
  if (!o || typeof o !== 'object') return loi;
  const out = { ...loi };
  const t = String(o.TEN_QUY_TAC ?? '').trim();
  const c = String(o.CANH_BAO ?? '').trim();
  const d = String(o.DIEU_KIEN ?? '').trim();
  const ct = String(o.CHI_TIET_CANH_BAO ?? '').trim();
  const nhom = String(o.NHOM_CANH_BAO ?? '').trim();
  if (t) out.ten_quy_tac = t;
  if (c) out.canh_bao = c;
  if (d) out.dieu_kien = d;
  if (ct) out.chi_tiet_canh_bao = ct;
  if (nhom) out.nhom_canh_bao = nhom;
  const tag = String(o.TAG_CANH_BAO ?? '').trim();
  const tagNguon = String(o.TAG_NGUON_CANH_BAO ?? '').trim();
  if (tag) out.tag_canh_bao = tag;
  if (tagNguon) out.tag_nguon_canh_bao = tagNguon;
  return out;
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
