/**
 * Hub báo cáo — ba nhánh theo CDSS-BHYT-SPEC-BC: Quản trị / Chuyên môn / Doanh thu BHYT.
 */
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { docHubPrefs, luuHubPrefs, MAC_DINH_HUB_PREFS } from '../../dich_vu/bao_cao_hub_prefs';
import { chuanHoaMaKhoaBaoCao, khoaDrillKhop } from '../../dich_vu/bao_cao_drill_chuan';
import { layCacBangDeXuat } from '../../dich_vu/bao_cao_export_manifest';
import { taiNguonVaMoHinhMuc5 } from '../../dich_vu/bao_cao_service';
import { layBangMauTheoWidget } from '../../dich_vu/bao_cao_viz_meta';
import {
  inHoacChiaSePdfBaoCao,
  xuatExcelBaoCao,
  xuatJsonSnapshotBaoCao,
  xuatZipCsvBaoCao,
} from '../../dich_vu/bao_cao_xuat_file';
import BangMoHinhMuc5 from './BangMoHinhMuc5';
import BieuDoGiftedBarNgang from './BieuDoGiftedBarNgang';
import BieuDoGiftedCotDoc from './BieuDoGiftedCotDoc';
import HeatmapCm00 from './HeatmapCm00';
import { useLayoutMode } from '../../tien_ich/diem_anh_man_hinh';

const NHANH = [
  {
    id: 'QUAN_TRI',
    label: 'Quản trị',
    icon: 'briefcase-account-outline',
    hint: 'KPI vận hành, fact/dimension, BC-QT theo đặc tả.',
  },
  {
    id: 'CHUYEN_MON',
    label: 'Chuyên môn',
    icon: 'stethoscope',
    hint: 'Chất lượng lâm sàng, ICD/DVKT, cảnh báo CDSS.',
  },
  {
    id: 'DOANH_THU_BHYT',
    label: 'Doanh thu BHYT',
    icon: 'chart-line-stacked',
    hint: 'Rủi ro xuất toán, đối chiếu XML, cơ cấu chi phí.',
  },
];

const BG = '#f1f5f9';
const ACCENT = '#2563eb';
const ACCENT_SOFT = '#dbeafe';
const SURFACE = '#ffffff';
const INK = '#0f172a';
const PRIMARY = ACCENT;

/** Sidebar — tách lớp khỏi nội dung; trung tính + accent (tránh “khối xanh đặc” lỗi thời). */
const SIDEBAR_BG = '#eef2f6';
const SIDEBAR_EDGE = 'rgba(15, 23, 42, 0.07)';
const SIDEBAR_ITEM_BG = 'rgba(255, 255, 255, 0.92)';
const SIDEBAR_ITEM_BORDER = 'rgba(15, 23, 42, 0.07)';
const SIDEBAR_ITEM_ACTIVE_BG = 'rgba(37, 99, 235, 0.1)';
const SIDEBAR_ITEM_ACTIVE_BORDER = 'rgba(37, 99, 235, 0.28)';
const SIDEBAR_TEXT = '#334155';
const SIDEBAR_MUTED = '#64748b';
const SIDEBAR_ACTIVE = '#1d4ed8';

const COT_FACT_HO_SO = [
  { key: 'ma_lk', label: 'ma_lk', width: 120 },
  { key: 'ma_bn', label: 'ma_bn', width: 90 },
  { key: 'ma_cskcb', label: 'ma_cskcb', width: 90 },
  { key: 'ma_khoa', label: 'ma_khoa', width: 72 },
  { key: 'ma_bac_si', label: 'ma_bac_si', width: 80 },
  { key: 'loai_kcb', label: 'loai_kcb', width: 64 },
  { key: 'ma_icd_chinh', label: 'ma_icd_chinh', width: 88 },
  { key: 'ngay_vao', label: 'ngay_vao', width: 100 },
  { key: 'ngay_ra', label: 'ngay_ra', width: 100 },
  { key: 'so_ngay_dtri', label: 'so_ngay_dtri', width: 72 },
  { key: 't_thanhtoan', label: 't_thanhtoan', width: 96 },
  { key: 't_bhtt', label: 't_bhtt', width: 88 },
  { key: 't_thuoc', label: 't_thuoc', width: 80 },
  { key: 't_vtyt', label: 't_vtyt', width: 72 },
  { key: 'co_canh_bao', label: 'co_canh_bao', width: 88 },
  { key: 'tong_chi_phi_rui_ro', label: 'tong_chi_phi_rui_ro', width: 110 },
];

const COT_FACT_DONG = [
  { key: 'id_dong', label: 'id_dong', width: 200 },
  { key: 'ma_lk', label: 'ma_lk', width: 120 },
  { key: 'loai_dong', label: 'loai_dong', width: 72 },
  { key: 'ma_dich_vu', label: 'ma_dich_vu', width: 110 },
  { key: 'ten_dich_vu', label: 'ten_dich_vu', width: 180 },
  { key: 'so_luong', label: 'so_luong', width: 64 },
  { key: 'thanh_tien', label: 'thanh_tien', width: 88 },
  { key: 't_bhtt_dong', label: 't_bhtt_dong', width: 88 },
];

const COT_FACT_CANH = [
  { key: 'id_canh_bao', label: 'id_canh_bao', width: 220 },
  { key: 'ma_lk', label: 'ma_lk', width: 120 },
  { key: 'ma_rule', label: 'ma_rule', width: 96 },
  { key: 'ten_quy_tac', label: 'ten_quy_tac', width: 180 },
  { key: 'namespace_quy_tac', label: 'namespace_quy_tac', width: 130 },
  { key: 'muc_do', label: 'muc_do', width: 100 },
  { key: 'loai_loi', label: 'loai_loi', width: 120 },
  { key: 'chi_phi_anh_huong', label: 'chi_phi_anh_huong', width: 110 },
  { key: 'tab_quan_tri_goi_y', label: 'tab_quan_tri_goi_y', width: 130 },
];

const COT_DIM_KHOA = [
  { key: 'ma_khoa', label: 'ma_khoa', width: 88 },
  { key: 'ten_khoa', label: 'ten_khoa', width: 120 },
  { key: 'khoi_chuc_nang', label: 'khoi_chuc_nang', width: 100 },
  { key: 'active', label: 'active', width: 56 },
];

const COT_DIM_BS = [
  { key: 'ma_bac_si', label: 'ma_bac_si', width: 88 },
  { key: 'ho_ten', label: 'ho_ten', width: 120 },
  { key: 'ma_khoa', label: 'ma_khoa', width: 72 },
  { key: 'active', label: 'active', width: 56 },
];

const COT_DAC_TA_STORE = [
  { key: 'truong', label: 'Trường / nhóm', width: 200 },
  { key: 'kieu', label: 'Kiểu mô tả', width: 320 },
];

const COT_BC_QT_01_KPI = [
  { key: 'ma_chi_so', label: 'Mã chỉ số', width: 120 },
  { key: 'ten', label: 'Tên', width: 220 },
  { key: 'gia_tri', label: 'Giá trị', width: 100 },
  { key: 'don_vi', label: 'Đơn vị', width: 64 },
  { key: 'ghi_chu', label: 'Ghi chú', width: 260 },
];

const COT_BC_QT_01_TOP_KHOA = [
  { key: 'ma_khoa', label: 'ma_khoa', width: 100 },
  { key: 'so_ho_so', label: 'so_ho_so', width: 72 },
  { key: 'so_loi', label: 'so_loi', width: 64 },
  { key: 'ty_le_loi_tren_hs', label: 'ty_le_loi/HS', width: 100 },
];

const COT_BC_QT_02 = [
  { key: 'chi_so', label: 'Mã', width: 120 },
  { key: 'ten', label: 'Chỉ số', width: 240 },
  { key: 'gia_tri', label: 'Giá trị', width: 100 },
  { key: 'ghi_chu', label: 'Ghi chú', width: 280 },
];

const COT_BC_QT_03 = [
  { key: 'chi_so', label: 'Mã', width: 120 },
  { key: 'ten', label: 'Chỉ số', width: 220 },
  { key: 'gia_tri', label: 'Giá trị', width: 100 },
  { key: 'ghi_chu', label: 'Ghi chú', width: 300 },
];

const COT_BC_QT_04_TYLE = [
  { key: 'chi_so', label: 'Mã', width: 100 },
  { key: 'ten', label: 'Chỉ số', width: 260 },
  { key: 'gia_tri', label: 'Giá trị', width: 100 },
  { key: 'ghi_chu', label: 'Ghi chú', width: 280 },
];

const COT_TOP_RULE = [
  { key: 'ma_rule', label: 'ma_rule', width: 120 },
  { key: 'ten_quy_tac', label: 'Tên quy tắc', width: 220 },
  { key: 'so_loi', label: 'so_loi', width: 72 },
];

const COT_MODAL_FACT_RULE = [
  { key: 'ma_lk', label: 'MA_LK', width: 120 },
  { key: 'ma_rule', label: 'Rule', width: 88 },
  { key: 'ten_quy_tac', label: 'Tên QT', width: 160 },
  { key: 'chi_phi_anh_huong', label: 'CP ảnh hưởng', width: 96 },
  { key: 'loai_loi', label: 'Loại', width: 100 },
];

const TRONG_SO_MODAL_FACT = COT_MODAL_FACT_RULE.map((c) => Math.max(44, Number(c.width) || 72));

const COT_TOP_KHOA_CM = [
  { key: 'ma_khoa', label: 'ma_khoa', width: 100 },
  { key: 'so_ho_so', label: 'so_ho_so', width: 72 },
  { key: 'so_loi', label: 'so_loi', width: 64 },
];

const COT_DOI_CHIEU_CP = [
  { key: 'ma_lk', label: 'ma_lk', width: 120 },
  { key: 'ma_rule', label: 'ma_rule', width: 88 },
  { key: 'muc_do', label: 'muc_do', width: 100 },
  { key: 'chi_phi_anh_huong', label: 'chi_phi_anh_huong', width: 120 },
];

const COT_CHENH_CHI = [
  { key: 'ma_lk', label: 'ma_lk', width: 120 },
  { key: 'tong_xml1_thanhtoan', label: 'T_XML1', width: 100 },
  { key: 'tong_dong_chi_tiet', label: 'SUM dòng', width: 100 },
  { key: 'chenh_lech', label: 'Chênh', width: 88 },
];

const COT_BC_CM_00_NHOM = [
  { key: 'nhom_ma', label: 'Mã nhóm', width: 100 },
  { key: 'nhom_ten', label: 'Nhóm lỗi (nghiệp vụ)', width: 200 },
  { key: 'so_loi', label: 'Số dòng lỗi', width: 96 },
  { key: 'so_ho_so', label: 'Số hồ sơ', width: 88 },
  { key: 'ty_le_pt', label: '%/tổng lỗi', width: 96 },
  { key: 'tong_cp_uoc', label: 'Σ CP ước (VND)', width: 120 },
];

const COT_BC_CM_00_KHOA_NHOM = [
  { key: 'ma_khoa', label: 'Mã khoa', width: 88 },
  { key: 'nhom_nghiep_vu', label: 'Nhóm nghiệp vụ', width: 180 },
  { key: 'ma_nhom', label: 'Mã nhóm', width: 88 },
  { key: 'so_loi', label: 'Số dòng', width: 80 },
  { key: 'so_ho_so', label: 'Số HS', width: 72 },
  { key: 'tong_cp_uoc', label: 'Σ CP ước', width: 100 },
];

const COT_BC_CM_00_NVYT = [
  { key: 'ma_nhan_vien', label: 'Mã NV/Bác sĩ (XML1)', width: 140 },
  { key: 'so_loi', label: 'Số dòng lỗi', width: 88 },
  { key: 'so_ho_so', label: 'Số HS', width: 72 },
  { key: 'nhom_pho_bien_ten', label: 'Nhóm lỗi phổ biến', width: 200 },
  { key: 'nhom_pho_bien_ma', label: 'Mã nhóm PB', width: 96 },
  { key: 'tong_cp_uoc', label: 'Σ CP ước', width: 100 },
];

const COT_BC_CM_00_CCHN_CM = [
  { key: 'ma_cchn', label: 'MACCHN (DM)', width: 140 },
  { key: 'ma_bs_tham_chieu', label: 'Mã BS (dòng/XML1)', width: 120 },
  { key: 'dinh_danh', label: 'Khóa gom', width: 160 },
  { key: 'so_loi', label: 'Số dòng lỗi', width: 88 },
  { key: 'so_ho_so', label: 'Số HS', width: 72 },
  { key: 'nhom_pho_bien_ten', label: 'Nhóm lỗi PB', width: 160 },
  { key: 'tong_cp_uoc', label: 'Σ CP ước', width: 100 },
  { key: 'ghi_chu', label: 'Ghi chú', width: 220 },
];

const COT_BC_CM_00_THUOC = [
  { key: 'ma_thuoc', label: 'Mã thuốc', width: 120 },
  { key: 'ten_thuoc', label: 'Tên thuốc', width: 200 },
  { key: 'so_loi', label: 'Số dòng lỗi', width: 88 },
  { key: 'so_ho_so', label: 'Số HS', width: 72 },
  { key: 'tong_cp_uoc', label: 'Σ CP ước', width: 100 },
];

const COT_BC_CM_00_BS_CM = [
  { key: 'ma_bac_si', label: 'Mã BS (dòng lỗi)', width: 140 },
  { key: 'so_loi', label: 'Số dòng lỗi', width: 88 },
  { key: 'so_ho_so', label: 'Số HS', width: 72 },
  { key: 'nhom_pho_bien_ten', label: 'Nhóm lỗi PB', width: 180 },
  { key: 'tong_cp_uoc', label: 'Σ CP ước', width: 100 },
  { key: 'ghi_chu', label: 'Ghi chú', width: 200 },
];

const COT_BC_CM_01_KPI = [
  { key: 'ma_chi_so', label: 'Mã', width: 120 },
  { key: 'ten', label: 'Chỉ số', width: 260 },
  { key: 'gia_tri', label: 'Giá trị', width: 100 },
  { key: 'don_vi', label: 'ĐV', width: 72 },
  { key: 'ghi_chu', label: 'Ghi chú', width: 220 },
];

const COT_BC_CM_01_KHOA = [
  { key: 'ma_khoa', label: 'ma_khoa', width: 100 },
  { key: 'so_ho_so', label: 'so_hs', width: 56 },
  { key: 'hanh_chinh_hs', label: 'HC_hs', width: 64 },
  { key: 'logic_thoi_gian_hs', label: 'time_hs', width: 72 },
  { key: 'du_lieu', label: 'du_lieu', width: 60 },
  { key: 'doi_chieu_chi_phi', label: 'doi_chieu', width: 72 },
  { key: 'canh_bao_cdss', label: 'cdss', width: 52 },
  { key: 'goi_y', label: 'goi_y', width: 52 },
  { key: 'chi_dinh_bat_thuong', label: 'cls_cd', width: 68 },
  { key: 'ty_le_loi_tren_100_hs', label: 'loi/100HS', width: 88 },
  { key: 'ty_le_nghiem_trong_tren_100_hs', label: 'HT/100HS', width: 88 },
];

const COT_BC_CM_02 = [
  { key: 'ma_phac_do', label: 'Mã', width: 120 },
  { key: 'ten', label: 'Phác đồ / CPW', width: 280 },
  { key: 'ty_le_tuan_thu', label: '% tuân thủ', width: 88 },
  { key: 'dtn_dtb_phut_tb', label: 'DTN/DTB TB', width: 100 },
  { key: 'ghi_chu', label: 'Ghi chú', width: 200 },
];

const COT_BC_CM_03_TOM = [
  { key: 'chi_so', label: 'Mã', width: 100 },
  { key: 'ten', label: 'Chỉ số', width: 260 },
  { key: 'gia_tri', label: 'Giá trị', width: 90 },
  { key: 'ghi_chu', label: 'Ghi chú', width: 240 },
];

const COT_BC_CM_03_TOP_RULE = [
  { key: 'ma_rule', label: 'ma_rule', width: 120 },
  { key: 'so_loi', label: 'so_loi', width: 64 },
  { key: 'ghi_chu', label: 'Ghi chú', width: 280 },
];

const COT_BC_CM_03_KHOA_MAJOR = [
  { key: 'ma_khoa', label: 'ma_khoa', width: 100 },
  { key: 'so_major', label: 'DDI major', width: 88 },
  { key: 'ghi_chu', label: 'Ghi chú', width: 280 },
];

const COT_BC_CM_04 = [
  { key: 'namespace', label: 'Namespace', width: 150 },
  { key: 'bao_cao_gi', label: 'Nội dung', width: 220 },
  { key: 'hanh_dong', label: 'Hành động gợi ý', width: 260 },
  { key: 'so_vi_pham', label: 'Số VP', width: 64 },
];

const COT_BC_CM_05_CS = [
  { key: 'chi_so', label: 'Mã', width: 120 },
  { key: 'ten', label: 'Chỉ số', width: 240 },
  { key: 'gia_tri', label: 'Giá trị', width: 90 },
  { key: 'ghi_chu', label: 'Ghi chú', width: 260 },
];

const COT_BC_CM_05_ICD = [
  { key: 'ma_icd', label: 'ma_icd', width: 88 },
  { key: 'so_ho_so', label: 'so_hs', width: 56 },
  { key: 'tb_thanhtoan', label: 'TB TT', width: 88 },
  { key: 'chenh_vs_mean_all', label: 'vs mean', width: 72 },
  { key: 'ghi_chu', label: 'Ghi chú', width: 220 },
];

const COT_BC_DT_01_KPI = [
  { key: 'ma_chi_so', label: 'Mã', width: 120 },
  { key: 'ten', label: 'Chỉ số', width: 260 },
  { key: 'gia_tri', label: 'Giá trị', width: 110 },
  { key: 'don_vi', label: 'ĐV', width: 56 },
  { key: 'ghi_chu', label: 'Ghi chú', width: 220 },
];

const COT_BC_DT_01_LOAI = [
  { key: 'loai', label: 'Mã loại', width: 120 },
  { key: 'ten_loai', label: 'Diễn giải', width: 200 },
  { key: 'so_luong', label: 'Số lượng', width: 80 },
  { key: 'tong_chi_phi', label: 'Σ rủi ro (VND)', width: 110 },
];

const COT_BC_DT_01_KHOA_RR = [
  { key: 'ma_khoa', label: 'ma_khoa', width: 100 },
  { key: 'so_canh_bao', label: 'Số CB', width: 64 },
  { key: 'tong_chi_phi_rui_ro', label: 'Σ rủi ro', width: 100 },
];

const COT_BC_DT_01_RULE_RR = [
  { key: 'ma_rule', label: 'ma_rule', width: 110 },
  { key: 'ten_quy_tac', label: 'Tên quy tắc', width: 240 },
  { key: 'so_loi', label: 'so_loi', width: 64 },
  { key: 'tong_chi_phi', label: 'Σ rủi ro', width: 100 },
];

const COT_BC_DT_02_UU_TIEN = [
  { key: 'ma_lk', label: 'ma_lk', width: 110 },
  { key: 'ma_khoa', label: 'ma_khoa', width: 72 },
  { key: 'ma_bac_si', label: 'ma_bs', width: 72 },
  { key: 'chan_doan_chinh', label: 'ICD chính', width: 80 },
  { key: 't_thanhtoan', label: 'T_TT', width: 88 },
  { key: 'chi_phi_rui_ro', label: 'rủi ro', width: 80 },
  { key: 'so_canh_bao_nghiem_trong', label: 'nghiêm', width: 56 },
  { key: 'diem_uu_tien', label: 'điểm', width: 72 },
  { key: 'trang_thai', label: 'TT HS', width: 88 },
  { key: 'ghi_chu', label: 'Ghi chú', width: 160 },
];

const COT_BC_DT_03_PIVOT = [
  { key: 'ma_khoa', label: 'ma_khoa', width: 88 },
  { key: 'ma_rule', label: 'ma_rule', width: 88 },
  { key: 'so_vi_pham', label: 'Số VP', width: 64 },
  { key: 'tong_chi_phi_anh_huong', label: 'Σ CP ảnh hưởng', width: 110 },
  { key: 'tb_chi_phi', label: 'TB/VP', width: 80 },
];

const COT_BC_DT_03_CT = [
  { key: 'ma_lk', label: 'ma_lk', width: 110 },
  { key: 'ma_rule', label: 'ma_rule', width: 88 },
  { key: 'ma_khoa', label: 'ma_khoa', width: 72 },
  { key: 'muc_do', label: 'muc_do', width: 88 },
  { key: 'chi_phi_anh_huong', label: 'CP ảnh hưởng', width: 100 },
];

const COT_BC_DT_04 = [
  { key: 'nhom', label: 'Nhóm', width: 120 },
  { key: 'tong_tien', label: 'Tổng tiền', width: 100 },
  { key: 'ty_trong', label: 'Tỷ trọng', width: 88 },
  { key: 'ghi_chu', label: 'Ghi chú', width: 260 },
];

const COT_BC_DT_05_THANG = [
  { key: 'ky_thang', label: 'Tháng', width: 88 },
  { key: 'so_ho_so', label: 'so_hs', width: 56 },
  { key: 'tong_t_bhtt', label: 'Σ T_BHTT', width: 100 },
  { key: 'tb_bhtt', label: 'TB/HS', width: 80 },
];

const COT_BC_DT_05_DB = [
  { key: 'chi_so', label: 'Mã', width: 100 },
  { key: 'ten', label: 'Chỉ số', width: 260 },
  { key: 'gia_tri', label: 'Giá trị', width: 90 },
  { key: 'ghi_chu', label: 'Ghi chú', width: 260 },
];

const COT_BC_DT_06_CS = [
  { key: 'chi_so', label: 'Mã', width: 120 },
  { key: 'ten', label: 'Chỉ số', width: 260 },
  { key: 'gia_tri', label: 'Giá trị', width: 100 },
  { key: 'ghi_chu', label: 'Ghi chú', width: 240 },
];

const COT_BC_DT_06_KCB = [
  { key: 'loai_kcb', label: 'loai_kcb', width: 88 },
  { key: 'so_ho_so', label: 'so_hs', width: 64 },
  { key: 'tong_t_bhtt', label: 'Σ T_BHTT', width: 100 },
];

const COT_DRILL_HS = [
  { key: 'ma_lk', label: 'MA_LK', width: 140 },
  { key: 'ma_bn', label: 'MA_BN', width: 100 },
  { key: 'ma_khoa', label: 'Khoa', width: 80 },
];

const TRONG_SO_COT_DRILL_HS = COT_DRILL_HS.map((c) => Math.max(48, Number(c.width) || 72));

/** Lineage KPI — đặt tả kiểm soát ảo giác / minh bạch nguồn (tóm tắt cho người dùng cuối). */
const KPI_LINEAGE = {
  ho_so: {
    title: 'Hồ sơ kho',
    lines: [
      'Nguồn: so_ho_so_sau_gom sau bước ghepHoSoKhongTrungMaLK (giữ bản MA_LK mới nhất theo thời điểm cập nhật).',
      'Không tự sinh thêm hồ sơ — chỉ đếm từ kho IndexedDB đã tải.',
    ],
  },
  canh_bao: {
    title: 'Cảnh báo (fact)',
    lines: [
      'Nguồn: số phần tử mảng mo_hinh_muc5.fact_canh_bao (grain: một dòng = một cảnh báo đã chuẩn hoá từ ChiTietLoi).',
      'Khác với “số dòng lỗi” trong BC-CM-00 (có thể gom theo nhóm vi phạm).',
    ],
  },
  bhtt: {
    title: 'Σ T_BHTT',
    lines: [
      'Nguồn: SUM(fact_ho_so.t_bhtt) trên toàn kho sau gom MA_LK.',
      'Trường từ XML1 (T_BHTT) — dùng đối chiếu tỷ lệ rủi ro trong BC-DT-01 KPI, không phải số đã quyết toán thực tế nếu chưa có luồng nộp BHYT.',
    ],
  },
  cp_uoc: {
    title: 'Σ CP ước (lỗi → hồ sơ)',
    lines: [
      'Nguồn: SUM(fact_ho_so.tong_chi_phi_rui_ro) trên snapshot hiện tại.',
      'Mỗi tong_chi_phi_rui_ro = SUM(chi_phi_uoc_tinh) theo MA_LK trên ChiTietLoi đã phẳng (phangHoaDanhSachLoiChiTiet trong tongHopMoHinhMuc5).',
      'chi_phi_uoc_tinh là heuristic nội bộ (xếp hạng / ưu tiên rà soát) — không phải quyết toán BHYT, không thay cho chi_phi_anh_huong trong DT-01 top rule.',
    ],
  },
};

export default function BaoCaoHub() {
  const navigation = useNavigation();
  const { dungBoCucDoc } = useLayoutMode();
  const [nhanh, setNhanh] = useState('QUAN_TRI');
  const [quanTriThe, setQuanTriThe] = useState('M5');
  const [tai, setTai] = useState({
    dangTai: true,
    loi: null,
    soHoSo: null,
    moHinh: null,
    muc6: null,
    muc7: null,
    muc8: null,
    hienThi: null,
    tuCache: false,
    thoiDiemTao: null,
    maDacTaDuLieuV2: null,
    dacTaDynamic: null,
  });
  const [xuatDang, setXuatDang] = useState(false);
  const [drillCm00, setDrillCm00] = useState({ ma_khoa: null, ma_nhom: null });
  /** Drill theo ma_rule (QT-04 / DT-01) → lọc FACT_CANH_BAO — SPEC-VIZ DT01_TOP_RULE_TO_FACT_CANH */
  const [ruleInsight, setRuleInsight] = useState(null);
  const [hubPrefs, setHubPrefs] = useState(MAC_DINH_HUB_PREFS);
  const [prefsModal, setPrefsModal] = useState(false);
  const [lineageKey, setLineageKey] = useState(null);
  const debTabRef = useRef(null);
  const TAB_DEB_MS = 120;

  const chaySauDebounceTab = useCallback((fn) => {
    if (debTabRef.current) clearTimeout(debTabRef.current);
    debTabRef.current = setTimeout(() => {
      fn();
      debTabRef.current = null;
    }, TAB_DEB_MS);
  }, []);

  useEffect(
    () => () => {
      if (debTabRef.current) clearTimeout(debTabRef.current);
    },
    [],
  );

  const nap = useCallback(async (options = {}) => {
    const { boQuaCache = false } = options;
    setTai((s) => ({ ...s, dangTai: true, loi: null }));
    try {
      const kq = await taiNguonVaMoHinhMuc5({ boQuaCache });
      setTai({
        dangTai: false,
        loi: null,
        soHoSo: kq.so_ho_so_sau_gom,
        moHinh: kq.mo_hinh_muc5,
        muc6: kq.bao_cao_quan_tri_muc6,
        muc7: kq.bao_cao_chuyen_mon_muc7,
        muc8: kq.bao_cao_doanh_thu_muc8,
        hienThi: kq.hien_thi_bao_cao || null,
        tuCache: !!kq._tu_cache,
        thoiDiemTao: kq.thoi_diem_tao || null,
        maDacTaDuLieuV2: kq.ma_dac_ta_du_lieu_v2 || null,
        dacTaDynamic: kq.dac_ta_dynamic_template || null,
      });
    } catch (e) {
      setTai({
        dangTai: false,
        loi: e?.message || String(e),
        soHoSo: null,
        moHinh: null,
        muc6: null,
        muc7: null,
        muc8: null,
        hienThi: null,
        tuCache: false,
        thoiDiemTao: null,
        maDacTaDuLieuV2: null,
        dacTaDynamic: null,
      });
    }
  }, []);

  useEffect(() => {
    nap({});
  }, [nap]);

  useEffect(() => {
    let huy = false;
    docHubPrefs().then((p) => {
      if (!huy) setHubPrefs(p);
    });
    return () => {
      huy = true;
    };
  }, []);

  const pollMs = tai.hienThi?.chu_ky_lam_moi_goi_y_ms ?? 0;
  useEffect(() => {
    if (tai.dangTai || tai.loi || !pollMs || pollMs <= 0) return undefined;
    const id = setInterval(() => {
      nap({ boQuaCache: false });
    }, pollMs);
    return () => clearInterval(id);
  }, [tai.dangTai, tai.loi, pollMs, nap]);

  useEffect(() => {
    if (nhanh !== 'CHUYEN_MON') setDrillCm00({ ma_khoa: null, ma_nhom: null });
  }, [nhanh]);

  useEffect(() => {
    setRuleInsight((ri) => {
      if (!ri) return ri;
      if (nhanh !== 'QUAN_TRI' && nhanh !== 'DOANH_THU_BHYT') return null;
      if (nhanh === 'QUAN_TRI' && quanTriThe !== 'M6' && ri.source === 'QT04') return null;
      if (nhanh !== 'DOANH_THU_BHYT' && ri.source === 'DT01') return null;
      return ri;
    });
  }, [nhanh, quanTriThe]);

  const thongKe = useMemo(() => {
    const fcb = tai.moHinh?.fact_canh_bao;
    const fhs = tai.moHinh?.fact_ho_so;
    const tongBhtt = Array.isArray(fhs)
      ? fhs.reduce((s, r) => {
          const raw = String(r?.t_bhtt ?? '').replace(/,/g, '').trim();
          const n = Number(raw);
          return s + (Number.isFinite(n) ? n : 0);
        }, 0)
      : null;
    const tongRuiRoUoc = Array.isArray(fhs)
      ? Math.round(
          fhs.reduce((s, r) => {
            const raw = String(r?.tong_chi_phi_rui_ro ?? '').replace(/,/g, '').trim();
            const n = Number(raw);
            return s + (Number.isFinite(n) ? n : 0);
          }, 0),
        )
      : null;
    return {
      soCanh: Array.isArray(fcb) ? fcb.length : null,
      tongBhtt,
      tongRuiRoUoc,
    };
  }, [tai.moHinh]);

  const kpiTyLeLoi100 = useMemo(() => {
    const raw = tai.muc7?.bc_cm_01_kpi?.[0]?.gia_tri;
    const n = Number(String(raw ?? '').replace(',', '.'));
    return Number.isFinite(n) ? n : null;
  }, [tai.muc7]);

  const kpiNghiem100 = useMemo(() => {
    const raw = tai.muc7?.bc_cm_01_kpi?.[1]?.gia_tri;
    const n = Number(String(raw ?? '').replace(',', '.'));
    return Number.isFinite(n) ? n : null;
  }, [tai.muc7]);

  const dongKhoaNhomFiltered = useMemo(() => {
    const rows = tai.muc7?.bc_cm_00_khoa_nhom_loi || [];
    let out = [...rows];
    if (drillCm00.ma_khoa != null) {
      out = out.filter((r) => khoaDrillKhop(r.ma_khoa, drillCm00.ma_khoa));
    }
    if (drillCm00.ma_nhom != null) {
      out = out.filter((r) => String(r.ma_nhom || '').trim() === String(drillCm00.ma_nhom).trim());
    }
    return out;
  }, [tai.muc7, drillCm00]);

  const hoSoDrillTheoKhoa = useMemo(() => {
    const fhs = tai.moHinh?.fact_ho_so || [];
    if (drillCm00.ma_khoa == null) return [];
    return fhs.filter((r) => khoaDrillKhop(r.ma_khoa, drillCm00.ma_khoa)).slice(0, 45);
  }, [tai.moHinh, drillCm00.ma_khoa]);

  const factCanhTheoRuleInsight = useMemo(() => {
    const fcb = tai.moHinh?.fact_canh_bao;
    const mr = String(ruleInsight?.ma_rule || '').trim();
    if (!mr || !Array.isArray(fcb)) return [];
    return fcb.filter((c) => String(c.ma_rule || '').trim() === mr).slice(0, 200);
  }, [tai.moHinh, ruleInsight]);

  /** Pareto 80/20 trên 7 nhóm XML1 (đặc tả §8.4 / v2.0) */
  const paretoDt04Model = useMemo(() => {
    const raw = tai.muc8?.bc_dt_04_co_cau || [];
    const rows = raw.filter(
      (r) => r.nhom && String(r.nhom).indexOf('Benchmark') < 0 && String(r.nhom).indexOf('BHYT thanh toán') < 0,
    );
    const sorted = [...rows].sort((a, b) => (Number(b.tong_tien) || 0) - (Number(a.tong_tien) || 0));
    const tot = sorted.reduce((s, r) => s + (Number(r.tong_tien) || 0), 0) || 1;
    let cum = 0;
    const list = sorted.map((r) => {
      const v = Number(r.tong_tien) || 0;
      cum += v;
      return { ...r, _cum_pct: (cum / tot) * 100 };
    });
    const maxTien = list.length ? Math.max(...list.map((r) => Number(r.tong_tien) || 0), 1) : 1;
    return { list, maxTien };
  }, [tai.muc8]);

  const onChonRuleQt04 = useCallback((row) => {
    const mr = String(row?.ma_rule ?? '').trim();
    if (!mr) return;
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync().catch(() => {});
    }
    setRuleInsight((prev) =>
      prev?.source === 'QT04' && prev?.ma_rule === mr ? null : { source: 'QT04', ma_rule: mr },
    );
  }, []);

  const onChonRuleDt01 = useCallback((row) => {
    const mr = String(row?.ma_rule ?? '').trim();
    if (!mr) return;
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync().catch(() => {});
    }
    setRuleInsight((prev) =>
      prev?.source === 'DT01' && prev?.ma_rule === mr ? null : { source: 'DT01', ma_rule: mr },
    );
  }, []);

  const moHoSoGiamDinh = useCallback(
    (maLK) => {
      const k = String(maLK || '').trim();
      if (!k) return;
      try {
        navigation.navigate('SuaFileXML', { maLK: k });
      } catch {
        /* ignore */
      }
    },
    [navigation],
  );

  const onChonBarKhoaCm00 = useCallback((row) => {
    const mk = String(row?.ma_khoa ?? '').trim();
    if (!mk) return;
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync().catch(() => {});
    }
    setDrillCm00((d) => ({
      ...d,
      ma_khoa: d.ma_khoa != null && khoaDrillKhop(d.ma_khoa, mk) ? null : mk,
    }));
  }, []);

  const onChonBarNhomCm00 = useCallback((row) => {
    const id = String(row?.nhom_ma ?? '').trim();
    if (!id) return;
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync().catch(() => {});
    }
    setDrillCm00((d) => ({
      ...d,
      ma_nhom: d.ma_nhom != null && String(d.ma_nhom) === id ? null : id,
    }));
  }, []);

  const onChonHeatmapCm00 = useCallback((cell) => {
    const mk = String(cell?.ma_khoa ?? '').trim();
    const mn = String(cell?.ma_nhom ?? '').trim();
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync().catch(() => {});
    }
    setDrillCm00((d) => {
      const sameK = d.ma_khoa != null && khoaDrillKhop(d.ma_khoa, mk);
      const sameN = d.ma_nhom != null && String(d.ma_nhom) === mn;
      if (sameK && sameN) return { ma_khoa: null, ma_nhom: null };
      return { ma_khoa: mk, ma_nhom: mn || null };
    });
  }, []);

  const bangMauCm00Nhom = useMemo(
    () => layBangMauTheoWidget(tai.hienThi, 'cm00_bar_nhom'),
    [tai.hienThi],
  );
  const bangMauCm00Khoa = useMemo(
    () => layBangMauTheoWidget(tai.hienThi, 'cm00_bar_khoa'),
    [tai.hienThi],
  );
  const bangMauQt04Rule = useMemo(
    () => layBangMauTheoWidget(tai.hienThi, 'qt04_bar_rule'),
    [tai.hienThi],
  );
  const bangMauQt04Khoa = useMemo(
    () => layBangMauTheoWidget(tai.hienThi, 'qt04_bar_khoa'),
    [tai.hienThi],
  );
  const bangMauDtKhoaRr = useMemo(
    () => layBangMauTheoWidget(tai.hienThi, 'dt01_bar_khoa_rr'),
    [tai.hienThi],
  );
  const bangMauDtRuleRr = useMemo(
    () => layBangMauTheoWidget(tai.hienThi, 'dt01_top_rule_rr'),
    [tai.hienThi],
  );
  const bangMauDtPhanLoai = useMemo(
    () => layBangMauTheoWidget(tai.hienThi, 'dt01_bar_phan_loai'),
    [tai.hienThi],
  );
  const bangMauDtThang = useMemo(
    () => layBangMauTheoWidget(tai.hienThi, 'dt05_line_thang'),
    [tai.hienThi],
  );

  const rowsM6Qt04RuleChart = useMemo(
    () =>
      (tai.muc6?.bc_qt_04_top10_rule || []).map((r) => {
        const ten = String(r.ten_quy_tac || '').trim();
        const code = String(r.ma_rule || '—');
        const base = ten && ten !== 'Không có tên quy tắc' ? ten : code;
        const label = base.length > 16 ? `${base.slice(0, 14)}…` : base;
        return {
          ...r,
          label,
          value: Number(r.so_loi) || 0,
        };
      }),
    [tai.muc6],
  );
  const rowsM6Qt04KhoaChart = useMemo(
    () =>
      (tai.muc6?.bc_qt_04_top10_khoa || []).map((r) => ({
        ...r,
        label: String(r.ma_khoa || '—'),
        value: Number(r.so_loi) || 0,
      })),
    [tai.muc6],
  );

  const rowsM8Dt01LoaiChart = useMemo(
    () =>
      (tai.muc8?.bc_dt_01_phan_loai || []).map((r) => ({
        ...r,
        label: String(r.ten_loai || r.loai || '—').slice(0, 20),
        value: Number(r.tong_chi_phi) || 0,
      })),
    [tai.muc8],
  );
  const rowsM8Dt01KhoaRrChart = useMemo(
    () =>
      (tai.muc8?.bc_dt_01_top_khoa || []).map((r) => ({
        ...r,
        label: String(r.ma_khoa || '—'),
        value: Number(r.tong_chi_phi_rui_ro) || 0,
      })),
    [tai.muc8],
  );
  const rowsM8Dt01RuleRrChart = useMemo(
    () =>
      (tai.muc8?.bc_dt_01_top_rule || []).map((r) => {
        const ten = String(r.ten_quy_tac || '').trim();
        const code = String(r.ma_rule || '—');
        const base =
          ten && ten !== 'Không có tên quy tắc' ? ten : code;
        const label = base.length > 14 ? `${base.slice(0, 12)}…` : base;
        return {
          ...r,
          label,
          value: Number(r.tong_chi_phi) || 0,
        };
      }),
    [tai.muc8],
  );
  const rowsM8Dt05ThangChart = useMemo(
    () =>
      (tai.muc8?.bc_dt_05_thang || []).map((r) => ({
        ...r,
        label: String(r.ky_thang || '—'),
        value: Number(r.tong_t_bhtt) || 0,
      })),
    [tai.muc8],
  );

  /** Drill khoa → gom lại nhóm từ ma trận khoa×nhóm (đồng bộ biểu đồ). */
  const rowsBarNhomDongBo = useMemo(() => {
    const base = tai.muc7?.bc_cm_00_nhom_vi_pham || [];
    const matrix = tai.muc7?.bc_cm_00_khoa_nhom_loi || [];
    if (drillCm00.ma_khoa == null) return base;
    const agg = new Map();
    for (const r of matrix) {
      if (!khoaDrillKhop(r.ma_khoa, drillCm00.ma_khoa)) continue;
      const id = String(r.ma_nhom || '').trim() || 'KHAC';
      const lab = String(r.nhom_nghiep_vu || id).trim() || id;
      if (!agg.has(id)) {
        agg.set(id, { nhom_ma: id, nhom_ten: lab, so_loi: 0 });
      }
      const o = agg.get(id);
      o.so_loi += Number(r.so_loi) || 0;
    }
    return [...agg.values()]
      .map((x) => ({
        nhom_ma: x.nhom_ma,
        nhom_ten: x.nhom_ten,
        so_loi: x.so_loi,
        label: `${x.nhom_ten} (${x.nhom_ma})`,
        value: x.so_loi,
      }))
      .sort((a, b) => b.so_loi - a.so_loi);
  }, [tai.muc7, drillCm00.ma_khoa]);

  /** Drill nhóm → gom lại khoa từ ma trận (đồng bộ biểu đồ Top khoa). */
  const rowsBarKhoaDongBo = useMemo(() => {
    const base = tai.muc7?.bc_cm_00_top_khoa || [];
    const matrix = tai.muc7?.bc_cm_00_khoa_nhom_loi || [];
    if (drillCm00.ma_nhom == null) return base;
    const mn = String(drillCm00.ma_nhom).trim();
    if (!mn) return base;
    const agg = new Map();
    for (const r of matrix) {
      if (String(r.ma_nhom || '').trim() !== mn) continue;
      const mkRaw = String(r.ma_khoa || '').trim();
      const key = mkRaw || '(trống)';
      if (!agg.has(key)) {
        agg.set(key, { ma_khoa: key, so_loi: 0, so_ho_so: 0 });
      }
      const o = agg.get(key);
      o.so_loi += Number(r.so_loi) || 0;
    }
    return [...agg.values()]
      .map((x) => ({
        ma_khoa: x.ma_khoa,
        so_loi: x.so_loi,
        so_ho_so: x.so_ho_so,
        label: x.ma_khoa,
        value: x.so_loi,
      }))
      .sort((a, b) => b.so_loi - a.so_loi);
  }, [tai.muc7, drillCm00.ma_nhom]);

  const coDuLieuXuat = useMemo(() => {
    if (tai.dangTai || tai.loi) return false;
    if (nhanh === 'QUAN_TRI' && quanTriThe === 'M5') return !!tai.moHinh;
    if (nhanh === 'QUAN_TRI' && quanTriThe === 'M6') return !!tai.muc6;
    if (nhanh === 'CHUYEN_MON') return !!tai.muc7;
    if (nhanh === 'DOANH_THU_BHYT') return !!tai.muc8;
    return false;
  }, [tai.dangTai, tai.loi, tai.moHinh, tai.muc6, tai.muc7, tai.muc8, nhanh, quanTriThe]);

  const dinhDangTien = (n) =>
    n == null || !Number.isFinite(n)
      ? '—'
      : `${new Intl.NumberFormat('vi-VN').format(Math.round(n))}\u00a0₫`;

  const onXuatExcel = useCallback(async () => {
    if (!coDuLieuXuat || xuatDang) return;
    setXuatDang(true);
    try {
      const { sheets, tieuDe } = layCacBangDeXuat({ nhanh, quanTriThe, tai });
      const base = tieuDe
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\w\s-]+/g, '')
        .replace(/\s+/g, '_')
        .slice(0, 48);
      await xuatExcelBaoCao(sheets, base || 'BaoCao_CDSS_BHYT');
      if (Platform.OS !== 'web') {
        try {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch {
          /* ignore */
        }
      }
    } finally {
      setXuatDang(false);
    }
  }, [coDuLieuXuat, xuatDang, nhanh, quanTriThe, tai]);

  const onXuatZipCsv = useCallback(async () => {
    if (!coDuLieuXuat || xuatDang) return;
    setXuatDang(true);
    try {
      const { sheets, tieuDe } = layCacBangDeXuat({ nhanh, quanTriThe, tai });
      const base = tieuDe
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\w\s-]+/g, '')
        .replace(/\s+/g, '_')
        .slice(0, 40);
      await xuatZipCsvBaoCao(sheets, base || 'BaoCao_CDSS_CSV');
      if (Platform.OS !== 'web') {
        try {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch {
          /* ignore */
        }
      }
    } finally {
      setXuatDang(false);
    }
  }, [coDuLieuXuat, xuatDang, nhanh, quanTriThe, tai]);

  const onInBaoCao = useCallback(async () => {
    if (!coDuLieuXuat || xuatDang) return;
    setXuatDang(true);
    try {
      const { sheets, tieuDe } = layCacBangDeXuat({ nhanh, quanTriThe, tai });
      await inHoacChiaSePdfBaoCao(sheets, tieuDe);
      if (Platform.OS !== 'web') {
        try {
          await Haptics.selectionAsync();
        } catch {
          /* ignore */
        }
      }
    } finally {
      setXuatDang(false);
    }
  }, [coDuLieuXuat, xuatDang, nhanh, quanTriThe, tai]);

  const onXuatJsonSnapshot = useCallback(async () => {
    if (!coDuLieuXuat || xuatDang) return;
    setXuatDang(true);
    try {
      await xuatJsonSnapshotBaoCao({ nhanh, quanTriThe, tai: { ...tai, hubPrefsSnapshot: hubPrefs } });
      if (Platform.OS !== 'web') {
        try {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch {
          /* ignore */
        }
      }
    } finally {
      setXuatDang(false);
    }
  }, [coDuLieuXuat, xuatDang, nhanh, quanTriThe, tai, hubPrefs]);

  const meta = NHANH.find((x) => x.id === nhanh) || NHANH[0];

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <View style={styles.heroAccent} />
        <View style={styles.heroTitleRow}>
          <View style={styles.heroTitleWrap}>
            <Text style={styles.heroTitleCenter} accessibilityRole="header">
              TRUNG TÂM BÁO CÁO
            </Text>
          </View>
          {!tai.dangTai && !tai.loi ? (
            <TouchableOpacity
              style={styles.heroGear}
              onPress={() => setPrefsModal(true)}
              accessibilityRole="button"
              accessibilityLabel="Tùy chọn hiển thị Hub"
            >
              <MaterialCommunityIcons name="cog-outline" size={22} color="#e2e8f0" />
            </TouchableOpacity>
          ) : null}
        </View>

        {!tai.dangTai && !tai.loi ? (
          <View style={styles.statRow}>
            <TouchableOpacity
              style={[styles.statCard, styles.statCardPress]}
              onPress={() => setLineageKey('ho_so')}
              accessibilityRole="button"
              accessibilityLabel="Hồ sơ kho — xem nguồn dữ liệu"
            >
              <MaterialCommunityIcons name="information-outline" size={14} color="#94a3b8" style={styles.statInfoIcon} />
              <Text style={styles.statLabel}>Hồ sơ kho</Text>
              <Text style={styles.statValue}>{tai.soHoSo ?? 0}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.statCard, styles.statCardPress]}
              onPress={() => setLineageKey('canh_bao')}
              accessibilityRole="button"
              accessibilityLabel="Cảnh báo fact — xem nguồn dữ liệu"
            >
              <MaterialCommunityIcons name="information-outline" size={14} color="#94a3b8" style={styles.statInfoIcon} />
              <Text style={styles.statLabel}>Cảnh báo (fact)</Text>
              <Text style={styles.statValue}>{thongKe.soCanh ?? '—'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.statCard, styles.statCardPress]}
              onPress={() => setLineageKey('bhtt')}
              accessibilityRole="button"
              accessibilityLabel="Tổng T BHTT — xem nguồn dữ liệu"
            >
              <MaterialCommunityIcons name="information-outline" size={14} color="#94a3b8" style={styles.statInfoIcon} />
              <Text style={styles.statLabel}>Σ T_BHTT</Text>
              <Text style={styles.statValueSmall}>{dinhDangTien(thongKe.tongBhtt)}</Text>
            </TouchableOpacity>
            {hubPrefs.hien_kpi_tong_cp_uoc ? (
              <TouchableOpacity
                style={[styles.statCard, styles.statCardPress]}
                onPress={() => setLineageKey('cp_uoc')}
                accessibilityRole="button"
                accessibilityHint="Heuristic nội bộ, không phải quyết toán BHYT"
                accessibilityLabel="Sigma chi phí ước theo lỗi tới hồ sơ — xem nguồn dữ liệu"
              >
                <MaterialCommunityIcons name="information-outline" size={14} color="#94a3b8" style={styles.statInfoIcon} />
                <Text style={styles.statLabel}>Σ CP ước (lỗi→HS)</Text>
                <Text style={styles.statValueSmall}>
                  {thongKe.tongRuiRoUoc != null ? dinhDangTien(thongKe.tongRuiRoUoc) : '—'}
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ) : null}

        {!tai.dangTai &&
        !tai.loi &&
        hubPrefs.hien_chip_jci &&
        Array.isArray(tai.hienThi?.goi_y_quan_tri_jci) &&
        tai.hienThi.goi_y_quan_tri_jci.length ? (
          <View style={styles.chipRow} accessibilityLabel="Gợi ý quản trị theo đặc tả">
            {tai.hienThi.goi_y_quan_tri_jci.map((txt, i) => (
              <View key={i} style={styles.chip}>
                <MaterialCommunityIcons name="lightbulb-on-outline" size={14} color="#b45309" />
                <Text style={styles.chipTxt} numberOfLines={3}>
                  {txt}
                </Text>
              </View>
            ))}
          </View>
        ) : null}

        {!tai.dangTai && !tai.loi && tai.moHinh ? (
          <View style={styles.toolRow}>
            <TouchableOpacity
              style={[styles.toolBtn, styles.toolBtnRefresh]}
              onPress={() => {
                setDrillCm00({ ma_khoa: null, ma_nhom: null });
                setRuleInsight(null);
                nap({ boQuaCache: true });
              }}
              disabled={tai.dangTai || xuatDang}
              accessibilityRole="button"
              accessibilityLabel="Làm mới cứng — bỏ cache và đọc lại kho"
            >
              <MaterialCommunityIcons name="refresh" size={22} color={ACCENT} />
              <Text style={[styles.toolBtnText, styles.toolBtnTextDark]}>Làm mới</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toolBtn, styles.toolBtnExcel]}
              onPress={onXuatExcel}
              disabled={!coDuLieuXuat || xuatDang}
              accessibilityRole="button"
              accessibilityLabel="Xuất file Excel"
            >
              {xuatDang ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <MaterialCommunityIcons name="microsoft-excel" size={22} color="#fff" />
              )}
              <Text style={styles.toolBtnText}>Xuất Excel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toolBtn, styles.toolBtnPrint]}
              onPress={onInBaoCao}
              disabled={!coDuLieuXuat || xuatDang}
              accessibilityRole="button"
              accessibilityLabel="In hoặc tạo PDF"
            >
              <MaterialCommunityIcons name="printer-outline" size={22} color={ACCENT} />
              <Text style={[styles.toolBtnText, styles.toolBtnTextDark]}>In / PDF</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toolBtn, styles.toolBtnZip]}
              onPress={onXuatZipCsv}
              disabled={!coDuLieuXuat || xuatDang}
              accessibilityRole="button"
              accessibilityLabel="Xuất ZIP nhiều file CSV UTF-8"
            >
              <MaterialCommunityIcons name="folder-zip-outline" size={22} color="#be185d" />
              <Text style={[styles.toolBtnText, styles.toolBtnZipText]}>ZIP / CSV</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toolBtn, styles.toolBtnJson]}
              onPress={onXuatJsonSnapshot}
              disabled={!coDuLieuXuat || xuatDang}
              accessibilityRole="button"
              accessibilityLabel="Xuất snapshot JSON meta cho BI"
            >
              <MaterialCommunityIcons name="code-json" size={22} color="#0f766e" />
              <Text style={[styles.toolBtnText, styles.toolBtnJsonText]}>JSON</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {tai.dangTai ? (
          <View style={styles.rowTai}>
            <ActivityIndicator color={PRIMARY} />
            <Text style={styles.metaLine}>Đang đọc kho hồ sơ…</Text>
          </View>
        ) : tai.loi ? (
          <Text style={styles.loi}>Không đọc được kho: {tai.loi}</Text>
        ) : (
          <Text style={styles.metaLine} numberOfLines={4}>
            Gom MA_LK
            {tai.maDacTaDuLieuV2 ? ` · ${tai.maDacTaDuLieuV2}` : ''}
            {tai.hienThi?.phien_ban ? ` · ${tai.hienThi.phien_ban}` : ''}
            {tai.hienThi?.thoi_diem_du_lieu
              ? ` · DL ${new Date(tai.hienThi.thoi_diem_du_lieu).toLocaleString('vi-VN')}`
              : ''}
            {tai.thoiDiemTao ? ` · tạo ${new Date(tai.thoiDiemTao).toLocaleTimeString('vi-VN')}` : ''}
            {tai.tuCache ? ' · cache' : ''}
            {pollMs > 0 ? ` · làm mới ~${Math.round(pollMs / 60000)}p` : ''}
          </Text>
        )}
      </View>

      <View style={[styles.bodyRow, dungBoCucDoc && styles.bodyRowDoc]}>
        <ScrollView
          style={[styles.sidebarScroll, dungBoCucDoc && styles.sidebarScrollDoc]}
          contentContainerStyle={styles.sidebarInner}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.sidebarHeading}>Điều hướng</Text>
          {NHANH.map((t) => {
            const active = t.id === nhanh;
            return (
              <TouchableOpacity
                key={t.id}
                style={[styles.sidebarItem, active && styles.sidebarItemActive]}
                onPress={() => {
                  chaySauDebounceTab(() => {
                    setNhanh(t.id);
                    if (t.id !== 'QUAN_TRI') setQuanTriThe('M5');
                  });
                }}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
              >
                <MaterialCommunityIcons
                  name={t.icon}
                  size={20}
                  color={active ? SIDEBAR_ACTIVE : SIDEBAR_MUTED}
                  style={styles.sidebarItemIcon}
                />
                <Text style={[styles.sidebarItemLabel, active && styles.sidebarItemLabelActive]} numberOfLines={3}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            );
          })}
          {nhanh === 'QUAN_TRI' ? (
            <>
              <View style={styles.sidebarDivider} />
              <Text style={styles.sidebarHeading}>Quản trị</Text>
              <TouchableOpacity
                style={[styles.sidebarSubItem, quanTriThe === 'M5' && styles.sidebarSubItemActive]}
                onPress={() => chaySauDebounceTab(() => setQuanTriThe('M5'))}
                accessibilityRole="button"
                accessibilityState={{ selected: quanTriThe === 'M5' }}
              >
                <MaterialCommunityIcons
                  name="database-outline"
                  size={18}
                  color={quanTriThe === 'M5' ? SIDEBAR_ACTIVE : SIDEBAR_MUTED}
                />
                <Text
                  style={[styles.sidebarSubLabel, quanTriThe === 'M5' && styles.sidebarSubLabelActive]}
                  numberOfLines={3}
                >
                  Mục 5 — Fact / Dim
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.sidebarSubItem, quanTriThe === 'M6' && styles.sidebarSubItemActive]}
                onPress={() => chaySauDebounceTab(() => setQuanTriThe('M6'))}
                accessibilityRole="button"
                accessibilityState={{ selected: quanTriThe === 'M6' }}
              >
                <MaterialCommunityIcons
                  name="view-dashboard-variant"
                  size={18}
                  color={quanTriThe === 'M6' ? SIDEBAR_ACTIVE : SIDEBAR_MUTED}
                />
                <Text
                  style={[styles.sidebarSubLabel, quanTriThe === 'M6' && styles.sidebarSubLabelActive]}
                  numberOfLines={3}
                >
                  Mục 6 — BC-QT
                </Text>
              </TouchableOpacity>
            </>
          ) : null}
        </ScrollView>

        <ScrollView
          style={styles.mainScroll}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
        <Text style={styles.sectionTitle}>{meta.label}</Text>
        <Text style={styles.sectionHint}>{meta.hint}</Text>

        {nhanh === 'QUAN_TRI' && quanTriThe === 'M5' ? (
          <Text style={styles.blockIntro}>
            Mục 5 — Mô hình dữ liệu phục vụ báo cáo: fact–dimension (star schema logic), view ảo từ store hồ sơ và kết
            quả rule engine (§5.2–5.4).
          </Text>
        ) : null}

        {nhanh === 'QUAN_TRI' && quanTriThe === 'M6' ? (
          <Text style={styles.blockIntro}>
            Mục 6 — Bộ báo cáo cho nhóm Quản trị: BC-QT-01 điều hành tổng quan, BC-QT-02 năng suất, BC-QT-03 tuân thủ
            và audit, BC-QT-04 chất lượng dữ liệu. Số liệu tính từ fact mục 5 và hồ sơ XML; phần cần log phiên /
            Firebase hiển thị “—” kèm ghi chú.
          </Text>
        ) : null}

        {!tai.dangTai && !tai.loi && tai.moHinh && nhanh === 'QUAN_TRI' && quanTriThe === 'M5' ? (
          <>
            <Text style={styles.mucPhu}>5.1 — Nguyên tắc fact / dimension</Text>
            <Text style={styles.doanVan}>
              Dữ liệu được tổng hợp một lần khi mở màn hình; không ghi đè kho XML gốc. Dimension DIM_ICD, DIM_DVKT,
              DIM_THUOC, DIM_RULE: bổ sung khi tích hợp danh mục BYT đầy đủ vào pipeline báo cáo.
            </Text>

            <BangMoHinhMuc5
              title="5.2.1 — FACT_HO_SO (một dòng = một hồ sơ BHYT)"
              subtitle="Nguồn: XML1 + meta kho; tổng chi phí rủi ro từ cảnh báo đã chuẩn hóa."
              columns={COT_FACT_HO_SO}
              rows={tai.moHinh.fact_ho_so}
              maxRows={40}
            />
            <BangMoHinhMuc5
              title="5.2.2 — FACT_DONG_CHI_PHI (XML2 / XML3 / XML4)"
              subtitle="Một dòng = một line-item; id_dong = MA_LK + loại + STT."
              columns={COT_FACT_DONG}
              rows={tai.moHinh.fact_dong_chi_phi}
              maxRows={50}
            />
            <BangMoHinhMuc5
              title="5.2.3 — FACT_CANH_BAO (một dòng = một vi phạm rule)"
              subtitle="Nguồn: phangHoaDanhSachLoiChiTiet — khớp metadata namespace / tab quản trị."
              columns={COT_FACT_CANH}
              rows={tai.moHinh.fact_canh_bao}
              maxRows={45}
            />
            <Text style={styles.mucPhu}>5.2.4 — FACT_PHIEN_LAM_VIEC</Text>
            <Text style={styles.doanVan}>
              {tai.moHinh.fact_phien_lam_viec?.length
                ? `Đang có ${tai.moHinh.fact_phien_lam_viec.length} bản ghi phiên.`
                : 'Chưa có dữ liệu phiên làm việc trong kho hiện tại — cần store audit / log xuất báo cáo theo §5.2.4.'}
            </Text>

            <Text style={styles.mucPhu}>5.3 — Dimension (khoa / bác sĩ từ FACT_HO_SO)</Text>
            <BangMoHinhMuc5
              title="DIM_KHOA (rút gọn từ MA_KHOA trên hồ sơ)"
              columns={COT_DIM_KHOA}
              rows={tai.moHinh.dim_khoa}
              maxRows={80}
            />
            <BangMoHinhMuc5
              title="DIM_BAC_SI (rút gọn từ MA_BS trên XML1)"
              columns={COT_DIM_BS}
              rows={tai.moHinh.dim_bac_si}
              maxRows={80}
            />
            <Text style={styles.doanVan}>
              DIM_NGUOI_DUNG, DIM_RULE, DIM_ICD, DIM_DVKT, DIM_THUOC, DIM_THOI_GIAN: theo đặc tả §5.3 — chưa đổ đầy
              trong bản này; dùng chung nguồn RBAC / danh mục BYT khi triển khai bước sau.
            </Text>

            <Text style={styles.mucPhu}>5.4 — Đặc tả store IndexedDB (tham chiếu)</Text>
            <Text style={styles.doanVan}>
              Hai store cache_bao_cao và snapshot_bao_cao dự kiến trong CDSS_HO_SO_DB; chưa bật migration phiên bản DB
              trong bản build này — chỉ hiển thị schema tham chiếu.
            </Text>
            <BangMoHinhMuc5
              title="cache_bao_cao — trường chính"
              columns={COT_DAC_TA_STORE}
              rows={Object.entries(tai.moHinh.dac_ta_store_5_4.cache_bao_cao || {}).map(([truong, kieu]) => ({
                truong,
                kieu: String(kieu),
              }))}
              maxRows={30}
            />
            <BangMoHinhMuc5
              title="snapshot_bao_cao — trường chính"
              columns={COT_DAC_TA_STORE}
              rows={Object.entries(tai.moHinh.dac_ta_store_5_4.snapshot_bao_cao || {}).map(([truong, kieu]) => ({
                truong,
                kieu: String(kieu),
              }))}
              maxRows={30}
            />
          </>
        ) : null}

        {!tai.dangTai && !tai.loi && tai.muc6 && nhanh === 'QUAN_TRI' && quanTriThe === 'M6' ? (
          <>
            <Text style={styles.mucPhu}>6.1 — BC-QT-01: Dashboard điều hành tổng quan</Text>
            <Text style={styles.doanVan}>Route đặc tả: /reports/quan-tri — KPI tiles và Top 5 khoa (bảng dưới).</Text>
            <BangMoHinhMuc5
              title="BC-QT-01 — Chỉ số tổng hợp (KPI)"
              subtitle="Từ FACT_HO_SO / FACT_CANH_BAO; chu kỳ “kỳ hiện tại” = toàn kho đang có."
              columns={COT_BC_QT_01_KPI}
              rows={tai.muc6.bc_qt_01_kpi}
              maxRows={20}
            />
            <BangMoHinhMuc5
              title="BC-QT-01 — Top 5 khoa tỷ lệ lỗi / hồ sơ"
              columns={COT_BC_QT_01_TOP_KHOA}
              rows={tai.muc6.bc_qt_01_top5_khoa_loi}
              maxRows={10}
            />

            <Text style={styles.mucPhu}>6.2 — BC-QT-02: Năng suất và khối lượng</Text>
            <Text style={styles.doanVan}>Route: /reports/quan-tri/nang-suat — chỉ số tính được từ meta kho.</Text>
            <BangMoHinhMuc5
              title="BC-QT-02 — Bảng chỉ số"
              columns={COT_BC_QT_02}
              rows={tai.muc6.bc_qt_02_nang_suat}
              maxRows={15}
            />

            <Text style={styles.mucPhu}>6.3 — BC-QT-03: Tuân thủ hệ thống và audit</Text>
            <Text style={styles.doanVan}>Route: /reports/quan-tri/tuan-thu — cảnh báo bypass &gt; 15% theo đặc tả.</Text>
            <BangMoHinhMuc5
              title="BC-QT-03 — Bảng chỉ số"
              columns={COT_BC_QT_03}
              rows={tai.muc6.bc_qt_03_tuan_thu}
              maxRows={15}
            />

            <Text style={styles.mucPhu}>6.4 — BC-QT-04: Chất lượng dữ liệu toàn viện</Text>
            <Text style={styles.doanVan}>Route: /reports/quan-tri/chat-luong-du-lieu — Top rule, Top khoa, đối chiếu chi phí.</Text>
            <BangMoHinhMuc5
              title="BC-QT-04 — Tỷ lệ chất lượng (proxy)"
              columns={COT_BC_QT_04_TYLE}
              rows={tai.muc6.bc_qt_04_ty_le}
              maxRows={10}
            />
            <View style={styles.chartRow}>
              <View style={styles.chartHalf}>
                <BieuDoGiftedBarNgang
                  title="QT-04 — Top rule (số lỗi)"
                  subtitle="Chạm cột → xem FACT_CANH_BAO theo ma_rule (drill_registry QT04)."
                  rows={rowsM6Qt04RuleChart}
                  keyNhan="label"
                  keySo="value"
                  maxItems={8}
                  bangMau={bangMauQt04Rule}
                  onChonDong={onChonRuleQt04}
                  keyDongChon="ma_rule"
                  maDongChon={ruleInsight?.source === 'QT04' ? ruleInsight.ma_rule : ''}
                />
              </View>
              <View style={styles.chartHalf}>
                <BieuDoGiftedBarNgang
                  title="QT-04 — Top khoa (số lỗi)"
                  subtitle="Đồng bộ logic drill với nhánh Chuyên môn."
                  rows={rowsM6Qt04KhoaChart}
                  keyNhan="label"
                  keySo="value"
                  maxItems={8}
                  bangMau={bangMauQt04Khoa}
                />
              </View>
            </View>
            <BangMoHinhMuc5
              title="BC-QT-04 — Top 10 mã rule vi phạm"
              columns={COT_TOP_RULE}
              rows={tai.muc6.bc_qt_04_top10_rule}
              maxRows={12}
            />
            <BangMoHinhMuc5
              title="BC-QT-04 — Top 10 khoa cần cải thiện (theo số lỗi)"
              columns={COT_TOP_KHOA_CM}
              rows={tai.muc6.bc_qt_04_top10_khoa}
              maxRows={12}
            />
            <BangMoHinhMuc5
              title="BC-QT-04 — Cảnh báo đối chiếu chi phí (XML_49/53/109/143)"
              columns={COT_DOI_CHIEU_CP}
              rows={tai.muc6.bc_qt_04_doi_chieu_chi_phi}
              maxRows={40}
            />
            <BangMoHinhMuc5
              title="BC-QT-04 — Chênh T_THANHTOAN XML1 vs tổng dòng chi tiết (proxy)"
              columns={COT_CHENH_CHI}
              rows={tai.muc6.bc_qt_04_chenh_tong_chi}
              maxRows={35}
            />
          </>
        ) : null}

        {!tai.dangTai && !tai.loi && tai.muc7 && nhanh === 'CHUYEN_MON' ? (
          <>
            <Text style={styles.blockIntro}>
              Mục 7 — Bộ báo cáo Chuyên môn (BC-CM-01…05): lỗi theo khoa, CPW, DDI, namespace rule, chỉ định bất
              thường. Số liệu tính từ fact mục 5 và hồ sơ XML; phần cần phác đồ / workflow DDI / DRG hiển thị “—”
              kèm ghi chú theo đặc tả.
            </Text>

            <Text style={styles.mucPhu}>7.0 — Phân tích theo nhóm lỗi nghiệp vụ, khoa & nhân viên y tế</Text>
            <Text style={styles.doanVan}>
              Gom từ danh sách lỗi đã phẳng hoá (cùng nguồn dashboard Tổng quan): nhóm vi phạm Hành chính / DVKT /
              Thuốc / …, ma trận khoa × nhóm, và mã BS điều trị trên XML1. Biểu đồ chuẩn hoá theo giá trị lớn nhất trong
              từng khung để so sánh nhanh; bảng dùng cỡ chữ tối thiểu 12pt. Chạm một dòng trên biểu đồ để lọc ma trận
              (drill-down); chạm MA_LK dưới đây để mở kiểm tra.
            </Text>
            {kpiTyLeLoi100 != null || kpiNghiem100 != null ? (
              <View style={styles.kpiHeroRow}>
                <View
                  style={[
                    styles.kpiCard,
                    kpiTyLeLoi100 != null && kpiTyLeLoi100 > 30 && styles.kpiCardCanhBao,
                  ]}
                >
                  <Text style={styles.kpiCardLabel}>Tỷ lệ lỗi / 100 HS (BC-CM-01)</Text>
                  <Text
                    style={[
                      styles.kpiCardValue,
                      kpiTyLeLoi100 != null && kpiTyLeLoi100 > 30 && styles.kpiCardValueCanhBao,
                    ]}
                  >
                    {kpiTyLeLoi100 != null ? `${kpiTyLeLoi100.toFixed(1)}` : '—'}
                  </Text>
                  <Text style={styles.kpiCardUnit}>lỗi/100HS · Three-second rule (&gt;30 đỏ)</Text>
                </View>
                <View style={styles.kpiCard}>
                  <Text style={styles.kpiCardLabel}>Lỗi trọng yếu / 100 HS</Text>
                  <Text style={styles.kpiCardValue}>{kpiNghiem100 != null ? `${kpiNghiem100.toFixed(1)}` : '—'}</Text>
                  <Text style={styles.kpiCardUnit}>JCI QPS proxy</Text>
                </View>
              </View>
            ) : null}
            <HeatmapCm00
              title="7.0 — Heatmap khoa × nhóm (mật độ dòng lỗi)"
              subtitle="SPEC-VIZ-2.0.3 · theme + drill_registry; ô đậm = nhiều lỗi hơn trong khung hiển thị."
              rows={tai.muc7.bc_cm_00_khoa_nhom_loi || []}
              hienThi={tai.hienThi}
              maxHang={10}
              maxCot={10}
              maKhoaHighlight={drillCm00.ma_khoa}
              maNhomHighlight={drillCm00.ma_nhom}
              onChonO={onChonHeatmapCm00}
            />
            <View style={styles.chartRow}>
              <View style={styles.chartHalf}>
                <BieuDoGiftedBarNgang
                  title="Top nhóm lỗi nghiệp vụ"
                  subtitle={
                    drillCm00.ma_khoa != null
                      ? `Đã lọc theo khoa ${drillCm00.ma_khoa || '(trống)'} — gom từ ma trận khoa×nhóm.`
                      : 'Theo số dòng cảnh báo (react-native-gifted-charts).'
                  }
                  rows={rowsBarNhomDongBo}
                  keyNhan="label"
                  keySo="so_loi"
                  maxItems={8}
                  bangMau={bangMauCm00Nhom}
                  onChonDong={onChonBarNhomCm00}
                  keyDongChon="nhom_ma"
                  maDongChon={drillCm00.ma_nhom ?? ''}
                />
              </View>
              <View style={styles.chartHalf}>
                <BieuDoGiftedBarNgang
                  title="Top khoa phát sinh cảnh báo"
                  subtitle={
                    drillCm00.ma_nhom != null
                      ? `Đã lọc theo nhóm ${drillCm00.ma_nhom} — gom từ ma trận khoa×nhóm.`
                      : 'Theo MA_KHOA trên hồ sơ.'
                  }
                  rows={rowsBarKhoaDongBo}
                  keyNhan="label"
                  keySo="so_loi"
                  maxItems={8}
                  bangMau={bangMauCm00Khoa}
                  onChonDong={onChonBarKhoaCm00}
                  keyDongChon="ma_khoa"
                  maDongChon={drillCm00.ma_khoa ?? ''}
                />
              </View>
            </View>
            {drillCm00.ma_khoa != null || drillCm00.ma_nhom != null ? (
              <View style={styles.drillBanner}>
                <Text style={styles.drillBannerTxt}>
                  Lọc drill:
                  {drillCm00.ma_khoa != null
                    ? ` Khoa ${
                        chuanHoaMaKhoaBaoCao(drillCm00.ma_khoa) === '' ? '(trống / chưa ghi)' : drillCm00.ma_khoa
                      }`
                    : ''}
                  {drillCm00.ma_khoa != null && drillCm00.ma_nhom != null ? ' · ' : ''}
                  {drillCm00.ma_nhom != null ? `Nhóm ${drillCm00.ma_nhom}` : ''}
                </Text>
                <TouchableOpacity onPress={() => setDrillCm00({ ma_khoa: null, ma_nhom: null })} accessibilityRole="button">
                  <Text style={styles.drillClear}>Xoá lọc</Text>
                </TouchableOpacity>
              </View>
            ) : null}
            {drillCm00.ma_khoa != null && hoSoDrillTheoKhoa.length > 0 ? (
              <View style={styles.drillHsWrap}>
                <Text style={styles.drillHsTitle}>Hồ sơ tại khoa đã chọn — chạm MA_LK để mở kiểm tra</Text>
                <View style={styles.drillHsTable}>
                  <View style={[styles.drillHsHead, styles.drillHsRowFull]}>
                    {COT_DRILL_HS.map((c, ci) => (
                      <View
                        key={c.key}
                        style={[styles.drillHsCell, { flex: TRONG_SO_COT_DRILL_HS[ci], minWidth: 48 }]}
                      >
                        <Text style={styles.drillHsHeadTxt}>{c.label}</Text>
                      </View>
                    ))}
                  </View>
                  <FlatList
                    data={hoSoDrillTheoKhoa}
                    keyExtractor={(item, index) => `${item.ma_lk}-${index}`}
                    nestedScrollEnabled
                    scrollEnabled={hoSoDrillTheoKhoa.length > 5}
                    style={styles.drillHsFlash}
                    renderItem={({ item: r, index: ri }) => (
                      <TouchableOpacity
                        style={[styles.drillHsRow, styles.drillHsRowFull, ri % 2 === 1 && styles.drillHsRowAlt]}
                        onPress={() => moHoSoGiamDinh(r.ma_lk)}
                        accessibilityRole="button"
                        accessibilityLabel={`Mở hồ sơ ${r.ma_lk}`}
                      >
                        {COT_DRILL_HS.map((c, ci) => (
                          <View
                            key={c.key}
                            style={[styles.drillHsCell, { flex: TRONG_SO_COT_DRILL_HS[ci], minWidth: 48 }]}
                          >
                            <Text style={styles.drillHsTxt} numberOfLines={2}>
                              {String(r[c.key] ?? '')}
                            </Text>
                          </View>
                        ))}
                      </TouchableOpacity>
                    )}
                  />
                </View>
              </View>
            ) : null}
            <BangMoHinhMuc5
              title="7.0.1 — Bảng nhóm vi phạm nghiệp vụ (tổng hợp)"
              subtitle="Số hồ sơ = đếm MA_LK khác nhau có ≥1 lỗi thuộc nhóm; % = phần trăm trên tổng dòng lỗi toàn kho."
              columns={COT_BC_CM_00_NHOM}
              rows={tai.muc7.bc_cm_00_nhom_vi_pham || []}
              maxRows={35}
              stableKeyPrefix="BC_CM_00_NHOM"
            />
            <BangMoHinhMuc5
              title="7.0.2 — Ma trận khoa × nhóm lỗi nghiệp vụ (theo drill nếu có)"
              subtitle="Mỗi dòng là cặp (khoa, nhóm); hỗ trợ rà soát khoa trọng điểm theo từng loại rủi ro."
              columns={COT_BC_CM_00_KHOA_NHOM}
              rows={dongKhoaNhomFiltered}
              maxRows={45}
              stableKeyPrefix="BC_CM_00_KHOA_NHOM"
            />
            <BangMoHinhMuc5
              title="7.0.3 — Theo nhân viên y tế (mã BS điều trị / XML1)"
              subtitle="Nhóm phổ biến = nhóm nghiệp vụ có nhiều dòng lỗi nhất gắn với cùng mã BS trong kỳ."
              columns={COT_BC_CM_00_NVYT}
              rows={tai.muc7.bc_cm_00_nhan_vien_y_te || []}
              maxRows={40}
              stableKeyPrefix="BC_CM_00_NV"
            />
            <BangMoHinhMuc5
              title="7.0.4 — Theo chứng chỉ hành nghề (CCHN), chỉ lỗi chuyên môn"
              subtitle="Loại trừ nhóm «Hành chính». Gom theo MACCHN khi mã BS trên dòng/XML1 khớp DM nhân sự; nếu không khớp thì gom theo mã BS."
              columns={COT_BC_CM_00_CCHN_CM}
              rows={tai.muc7?.bc_cm_00_theo_cchn_chuyen_mon || []}
              maxRows={45}
              stableKeyPrefix="BC_CM_00_CCHN"
            />
            <BangMoHinhMuc5
              title="7.0.5 — Sai sót thuốc (nhóm THUOC / XML2)"
              subtitle="Gom theo mã thuốc trích từ dòng XML gắn lỗi; gồm mọi mức cảnh báo trên bảng thuốc."
              columns={COT_BC_CM_00_THUOC}
              rows={tai.muc7?.bc_cm_00_sai_sot_thuoc || []}
              maxRows={55}
              stableKeyPrefix="BC_CM_00_THUOC"
            />
            <BangMoHinhMuc5
              title="7.0.6 — Sai sót theo bác sĩ (chỉ chuyên môn)"
              subtitle="Gom theo mã BS trên dòng lỗi (y lệnh / chỉ định); không gồm nhóm Hành chính."
              columns={COT_BC_CM_00_BS_CM}
              rows={tai.muc7?.bc_cm_00_bac_si_chuyen_mon || []}
              maxRows={55}
              stableKeyPrefix="BC_CM_00_BS_CM"
            />

            <Text style={styles.mucPhu}>7.1 — BC-CM-01: Lỗi chuyên môn theo khoa</Text>
            <Text style={styles.doanVan}>Route đặc tả: /reports/chuyen-mon/loi-theo-khoa</Text>
            <BangMoHinhMuc5
              title="BC-CM-01 — KPI (proxy toàn kho)"
              columns={COT_BC_CM_01_KPI}
              rows={tai.muc7.bc_cm_01_kpi}
              maxRows={12}
            />
            <BangMoHinhMuc5
              title="BC-CM-01 — Phân bố theo khoa (hành chính & logic thời gian = hồ sơ; CDSS = dòng cảnh báo)"
              columns={COT_BC_CM_01_KHOA}
              rows={tai.muc7.bc_cm_01_phan_bo_khoa}
              maxRows={28}
            />

            <Text style={styles.mucPhu}>7.2 — BC-CM-02: Tuân thủ phác đồ (CPW)</Text>
            <Text style={styles.doanVan}>Route: /reports/chuyen-mon/tuan-thu-phac-do — cần cấu hình phác đồ QuanLyChuyenMon.</Text>
            <BangMoHinhMuc5
              title="BC-CM-02 — Danh mục phác đồ theo dõi (mẫu đặc tả §7.2)"
              columns={COT_BC_CM_02}
              rows={tai.muc7.bc_cm_02_cpw}
              maxRows={12}
            />

            <Text style={styles.mucPhu}>7.3 — BC-CM-03: Tương tác thuốc (DDI)</Text>
            <Text style={styles.doanVan}>Route: /reports/chuyen-mon/tuong-tac-thuoc — namespace TUONG_TAC_THUOC / mã TUONGTAC_*.</Text>
            <BangMoHinhMuc5
              title="BC-CM-03 — Tóm tắt DDI"
              columns={COT_BC_CM_03_TOM}
              rows={tai.muc7.bc_cm_03_tom_tat}
              maxRows={12}
            />
            <BangMoHinhMuc5
              title="BC-CM-03 — Top mã rule DDI"
              columns={COT_BC_CM_03_TOP_RULE}
              rows={tai.muc7.bc_cm_03_top_rule}
              maxRows={12}
            />
            <BangMoHinhMuc5
              title="BC-CM-03 — Top khoa (DDI major)"
              columns={COT_BC_CM_03_KHOA_MAJOR}
              rows={tai.muc7.bc_cm_03_top_khoa_major}
              maxRows={12}
            />

            <Text style={styles.mucPhu}>7.4 — BC-CM-04: Vi phạm theo namespace</Text>
            <Text style={styles.doanVan}>Route: /reports/chuyen-mon/vi-pham-rule</Text>
            <BangMoHinhMuc5
              title="BC-CM-04 — Namespace & hành động gợi ý"
              columns={COT_BC_CM_04}
              rows={tai.muc7.bc_cm_04_namespace}
              maxRows={30}
            />

            <Text style={styles.mucPhu}>7.5 — BC-CM-05: Chỉ định bất thường & chất lượng lâm sàng</Text>
            <Text style={styles.doanVan}>Route: /reports/chuyen-mon/chi-dinh-bat-thuong</Text>
            <BangMoHinhMuc5
              title="BC-CM-05 — Chỉ số"
              columns={COT_BC_CM_05_CS}
              rows={tai.muc7.bc_cm_05_chi_so}
              maxRows={12}
            />
            <BangMoHinhMuc5
              title="BC-CM-05 — Top ICD theo chi phí TB (proxy §7.5)"
              columns={COT_BC_CM_05_ICD}
              rows={tai.muc7.bc_cm_05_top_icd}
              maxRows={14}
            />
          </>
        ) : null}

        {!tai.dangTai && !tai.loi && tai.muc8 && nhanh === 'DOANH_THU_BHYT' ? (
          <>
            <Text style={styles.blockIntro}>
              Mục 8 — Bộ báo cáo Quản lý doanh thu BHYT (BC-DT-01…06): rủi ro xuất toán, ưu tiên rà soát, đối chiếu
              XML, cơ cấu chi phí, xu hướng doanh thu, hoàn thiện hồ sơ. Số liệu từ fact mục 5; xu hướng 12 tuần,
              quỹ BHYT giao, funnel nộp — hiển thị “—” khi thiếu snapshot / meta ngoài XML theo đặc tả.
            </Text>

            <Text style={styles.mucPhu}>8.1 — BC-DT-01: Chi phí rủi ro xuất toán</Text>
            <Text style={styles.doanVan}>Route: /reports/doanh-thu/chi-phi-rui-ro</Text>
            <BangMoHinhMuc5
              title="BC-DT-01 — KPI rủi ro (kỳ hiện tại = toàn kho)"
              columns={COT_BC_DT_01_KPI}
              rows={tai.muc8.bc_dt_01_kpi}
              maxRows={12}
            />
            <BangMoHinhMuc5
              title="BC-DT-01 — Phân bố rủi ro theo loại (proxy pie)"
              columns={COT_BC_DT_01_LOAI}
              rows={tai.muc8.bc_dt_01_phan_loai}
              maxRows={16}
            />
            <BangMoHinhMuc5
              title="BC-DT-01 — Top 10 khoa theo chi phí rủi ro chưa xử lý"
              columns={COT_BC_DT_01_KHOA_RR}
              rows={tai.muc8.bc_dt_01_top_khoa}
              maxRows={12}
            />
            <BangMoHinhMuc5
              title="BC-DT-01 — Top 20 rule gây tổn thất"
              columns={COT_BC_DT_01_RULE_RR}
              rows={tai.muc8.bc_dt_01_top_rule}
              maxRows={22}
            />
            <View style={styles.chartRow}>
              <View style={styles.chartHalf}>
                <BieuDoGiftedBarNgang
                  title="DT-01 — Phân bố rủi ro (Σ chi phí)"
                  subtitle="Theo loại lỗi / proxy hồ sơ — widget dt01_bar_phan_loai."
                  rows={rowsM8Dt01LoaiChart}
                  keyNhan="label"
                  keySo="value"
                  maxItems={7}
                  bangMau={bangMauDtPhanLoai}
                />
              </View>
              <View style={styles.chartHalf}>
                <BieuDoGiftedBarNgang
                  title="DT-01 — Top khoa (chi phí rủi ro)"
                  subtitle="Chưa xử lý — VND trên trục."
                  rows={rowsM8Dt01KhoaRrChart}
                  keyNhan="label"
                  keySo="value"
                  maxItems={8}
                  bangMau={bangMauDtKhoaRr}
                />
              </View>
            </View>
            <BieuDoGiftedBarNgang
              title="DT-01 — Top rule theo tổn thất tiền"
              subtitle="Ưu tiên xử lý rule có Σ chi_phí_anh_huong cao; chạm cột → drill FACT_CANH (SPEC-VIZ DT01)."
              rows={rowsM8Dt01RuleRrChart}
              keyNhan="label"
              keySo="value"
              maxItems={10}
              bangMau={bangMauDtRuleRr}
              onChonDong={onChonRuleDt01}
              keyDongChon="ma_rule"
              maDongChon={ruleInsight?.source === 'DT01' ? ruleInsight.ma_rule : ''}
            />
            <BieuDoGiftedCotDoc
              title="DT-05 — T_BHTT theo tháng (proxy NGAY_RA)"
              subtitle="Cột dọc cuộn ngang khi nhiều kỳ; line/Skia ở bản dev."
              rows={rowsM8Dt05ThangChart}
              keyNhan="label"
              keySo="value"
              maxItems={24}
              bangMau={bangMauDtThang}
            />

            <Text style={styles.mucPhu}>8.2 — BC-DT-02: Hồ sơ ưu tiên rà soát</Text>
            <Text style={styles.doanVan}>Route: /reports/doanh-thu/ho-so-uu-tien — Top 100 theo điểm §8.2 (chuẩn hoá proxy).</Text>
            <BangMoHinhMuc5
              title="BC-DT-02 — Top 100 hồ sơ (điểm ưu tiên giảm dần)"
              columns={COT_BC_DT_02_UU_TIEN}
              rows={tai.muc8.bc_dt_02_top100}
              maxRows={55}
            />

            <Text style={styles.mucPhu}>8.3 — BC-DT-03: Đối chiếu số liệu XML</Text>
            <Text style={styles.doanVan}>Route: /reports/doanh-thu/doi-chieu-xml — LUAT_DU_LIEU (XML_49/53/109/143).</Text>
            <BangMoHinhMuc5
              title="BC-DT-03 — Pivot khoa × rule (ô chênh proxy)"
              columns={COT_BC_DT_03_PIVOT}
              rows={tai.muc8.bc_dt_03_pivot}
              maxRows={50}
            />
            <BangMoHinhMuc5
              title="BC-DT-03 — Chi tiết vi phạm đối chiếu"
              columns={COT_BC_DT_03_CT}
              rows={tai.muc8.bc_dt_03_chi_tiet}
              maxRows={45}
            />
            <BangMoHinhMuc5
              title="BC-DT-03 — Chênh T_THANHTOAN XML1 vs Σ dòng (tham chiếu BC-QT-04)"
              columns={COT_CHENH_CHI}
              rows={tai.muc8.bc_dt_03_chenh_tong}
              maxRows={35}
            />

            <Text style={styles.mucPhu}>8.4 — BC-DT-04: Phân tích cơ cấu chi phí BHYT</Text>
            <Text style={styles.doanVan}>Route: /reports/doanh-thu/co-cau-chi-phi — 7 nhóm từ XML1.</Text>
            <BangMoHinhMuc5
              title="BC-DT-04 — Cơ cấu chi phí (T_THUOC…T_GIUONG + T_BHTT)"
              columns={COT_BC_DT_04}
              rows={tai.muc8.bc_dt_04_co_cau}
              maxRows={12}
            />
            {paretoDt04Model.list.length ? (
              <View style={styles.paretoCard}>
                <Text style={styles.paretoTitle}>Pareto cơ cấu — tích luỹ % (mục 8.4 Dynamic BI)</Text>
                <Text style={styles.paretoSub}>
                  Xác định nhóm chiếm ~80% quy mô chi phí XML1 trong khoảng phân tích hiện tại.
                </Text>
                {paretoDt04Model.list.map((r) => (
                  <View key={r.nhom} style={styles.paretoRow}>
                    <Text style={styles.paretoLab} numberOfLines={1}>
                      {r.nhom}
                    </Text>
                    <View style={styles.paretoTrack}>
                      <View
                        style={[
                          styles.paretoFill,
                          {
                            width: `${Math.min(100, ((Number(r.tong_tien) || 0) / paretoDt04Model.maxTien) * 100)}%`,
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.paretoPct}>{r._cum_pct != null ? `${r._cum_pct.toFixed(0)}%` : ''}</Text>
                  </View>
                ))}
              </View>
            ) : null}

            <Text style={styles.mucPhu}>8.5 — BC-DT-05: Xu hướng doanh thu & dự báo</Text>
            <Text style={styles.doanVan}>Route: /reports/doanh-thu/xu-huong</Text>
            <BangMoHinhMuc5
              title="BC-DT-05 — Doanh thu BHYT (T_BHTT) theo tháng (proxy NGAY_RA)"
              columns={COT_BC_DT_05_THANG}
              rows={tai.muc8.bc_dt_05_thang}
              maxRows={26}
            />
            <BangMoHinhMuc5
              title="BC-DT-05 — Dự báo / quỹ (placeholder đặc tả)"
              columns={COT_BC_DT_05_DB}
              rows={tai.muc8.bc_dt_05_du_bao}
              maxRows={8}
            />

            <Text style={styles.mucPhu}>8.6 — BC-DT-06: Hoàn thiện hồ sơ trước nộp BHYT</Text>
            <Text style={styles.doanVan}>Route: /reports/doanh-thu/hoan-thien-ho-so</Text>
            <BangMoHinhMuc5
              title="BC-DT-06 — Chỉ số funnel & trạng thái (proxy)"
              columns={COT_BC_DT_06_CS}
              rows={tai.muc8.bc_dt_06_chi_so}
              maxRows={12}
            />
            <BangMoHinhMuc5
              title="BC-DT-06 — Tiến độ theo loại KCB (T_BHTT)"
              columns={COT_BC_DT_06_KCB}
              rows={tai.muc8.bc_dt_06_loai_kcb}
              maxRows={10}
            />
          </>
        ) : null}

        {!tai.dangTai && tai.loi ? (
          <Text style={styles.placeholder}>Không thể tải dữ liệu báo cáo: {tai.loi}</Text>
        ) : null}
        </ScrollView>
      </View>

      <Modal
        visible={!!ruleInsight}
        transparent
        animationType="fade"
        onRequestClose={() => setRuleInsight(null)}
        accessibilityViewIsModal
      >
        <Pressable style={styles.modalOverlay} onPress={() => setRuleInsight(null)}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle} numberOfLines={2}>
                FACT_CANH_BAO — {ruleInsight?.source === 'DT01' ? 'DT-01' : 'QT-04'} · {ruleInsight?.ma_rule}
              </Text>
              <TouchableOpacity onPress={() => setRuleInsight(null)} accessibilityRole="button" accessibilityLabel="Đóng">
                <MaterialCommunityIcons name="close" size={26} color={INK} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalHint}>
              Ước tính nội bộ — không phải quyết toán BHYT. Chạm MA_LK để mở kiểm tra (tối đa 200 dòng).
            </Text>
            <FlatList
              data={factCanhTheoRuleInsight}
              keyExtractor={(item, idx) => `${item.id_canh_bao || item.ma_lk || 'x'}_${idx}`}
              style={styles.modalList}
              nestedScrollEnabled
              ListEmptyComponent={<Text style={styles.modalEmpty}>Không có dòng fact cho mã rule này.</Text>}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.modalRow, styles.modalRowFull]}
                  onPress={() => moHoSoGiamDinh(item.ma_lk)}
                  accessibilityRole="button"
                >
                  {COT_MODAL_FACT_RULE.map((c, ci) => (
                    <View
                      key={c.key}
                      style={{ flex: TRONG_SO_MODAL_FACT[ci], minWidth: 44, flexShrink: 1, paddingHorizontal: 4 }}
                    >
                      <Text style={styles.modalCell} numberOfLines={2}>
                        {String(item[c.key] ?? '—')}
                      </Text>
                    </View>
                  ))}
                </TouchableOpacity>
              )}
            />
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        visible={!!lineageKey}
        transparent
        animationType="fade"
        onRequestClose={() => setLineageKey(null)}
        accessibilityViewIsModal
      >
        <Pressable style={styles.modalOverlay} onPress={() => setLineageKey(null)}>
          <Pressable style={[styles.modalCard, styles.lineageCard]} onPress={() => {}}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle} numberOfLines={2}>
                {lineageKey && KPI_LINEAGE[lineageKey] ? KPI_LINEAGE[lineageKey].title : 'Lineage'}
              </Text>
              <TouchableOpacity onPress={() => setLineageKey(null)} accessibilityRole="button" accessibilityLabel="Đóng">
                <MaterialCommunityIcons name="close" size={26} color={INK} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalHint}>Minh bạch nguồn — theo pipeline M5 / đặc tả kiểm soát ảo giác.</Text>
            <ScrollView style={styles.lineageScroll} contentContainerStyle={styles.lineageInner}>
              {(lineageKey && KPI_LINEAGE[lineageKey] ? KPI_LINEAGE[lineageKey].lines : []).map((line, i) => (
                <Text key={i} style={styles.lineageLine}>
                  • {line}
                </Text>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        visible={prefsModal}
        transparent
        animationType="fade"
        onRequestClose={() => setPrefsModal(false)}
        accessibilityViewIsModal
      >
        <Pressable style={styles.modalOverlay} onPress={() => setPrefsModal(false)}>
          <Pressable style={[styles.modalCard, styles.prefsCard]} onPress={() => {}}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Tùy chọn hiển thị Hub</Text>
              <TouchableOpacity onPress={() => setPrefsModal(false)} accessibilityRole="button" accessibilityLabel="Đóng">
                <MaterialCommunityIcons name="close" size={26} color={INK} />
              </TouchableOpacity>
            </View>
            <View style={styles.prefRow}>
              <Text style={styles.prefRowLabel}>Gợi ý JCI / quản trị (chip cam)</Text>
              <Switch
                value={!!hubPrefs.hien_chip_jci}
                onValueChange={async (v) => {
                  const n = await luuHubPrefs({ hien_chip_jci: v });
                  setHubPrefs(n);
                }}
                trackColor={{ false: '#cbd5e1', true: '#93c5fd' }}
                thumbColor={hubPrefs.hien_chip_jci ? '#2563eb' : '#f4f4f5'}
              />
            </View>
            <View style={styles.prefRow}>
              <Text style={styles.prefRowLabel}>KPI Σ CP ước (lỗi→HS)</Text>
              <Switch
                value={!!hubPrefs.hien_kpi_tong_cp_uoc}
                onValueChange={async (v) => {
                  const n = await luuHubPrefs({ hien_kpi_tong_cp_uoc: v });
                  setHubPrefs(n);
                }}
                trackColor={{ false: '#cbd5e1', true: '#93c5fd' }}
                thumbColor={hubPrefs.hien_kpi_tong_cp_uoc ? '#2563eb' : '#f4f4f5'}
              />
            </View>
            <Text style={styles.prefFoot}>Lưu trên thiết bị (AsyncStorage). Snapshot JSON có thể ghi kèm trạng thái tùy chọn.</Text>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  hero: {
    paddingHorizontal: 14,
    paddingTop: 6,
    paddingBottom: 6,
    backgroundColor: INK,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    ...Platform.select({
      web: { boxShadow: '0 12px 40px rgba(15,23,42,0.25)' },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 8,
      },
    }),
  },
  heroAccent: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 3,
    backgroundColor: '#38bdf8',
  },
  heroTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingVertical: 2,
  },
  heroTitleWrap: {
    flex: 1,
    minWidth: 0,
  },
  heroGear: {
    padding: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(30,41,59,0.5)',
  },
  heroTitleCenter: {
    fontFamily: 'Arial',
    fontSize: 17,
    fontWeight: '800',
    color: '#f8fafc',
    textAlign: 'center',
    letterSpacing: 0.8,
    paddingVertical: 2,
  },
  statRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(30,41,59,0.65)',
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.25)',
  },
  statCardPress: {
    position: 'relative',
  },
  statInfoIcon: {
    position: 'absolute',
    top: 4,
    right: 4,
    zIndex: 1,
    opacity: 0.85,
  },
  lineageCard: {
    maxHeight: '70%',
  },
  lineageScroll: {
    maxHeight: 360,
  },
  lineageInner: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  lineageLine: {
    fontFamily: 'Arial',
    fontSize: 13,
    lineHeight: 20,
    color: '#334155',
    marginBottom: 10,
  },
  prefsCard: {
    maxWidth: 420,
    width: '100%',
    alignSelf: 'center',
  },
  prefRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#f1f5f9',
  },
  prefRowLabel: {
    flex: 1,
    fontFamily: 'Arial',
    fontSize: 14,
    color: INK,
    paddingRight: 12,
  },
  prefFoot: {
    fontFamily: 'Arial',
    fontSize: 11,
    color: '#64748b',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 4,
  },
  statLabel: {
    fontFamily: 'Arial',
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    fontFamily: 'Arial',
    fontSize: 17,
    fontWeight: '800',
    color: '#f1f5f9',
    marginTop: 2,
  },
  statValueSmall: {
    fontFamily: 'Arial',
    fontSize: 12,
    fontWeight: '700',
    color: '#e2e8f0',
    marginTop: 2,
  },
  toolRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  toolBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    minHeight: 44,
  },
  toolBtnExcel: {
    backgroundColor: '#059669',
  },
  toolBtnPrint: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  toolBtnRefresh: {
    flex: 0.85,
    backgroundColor: '#eef2ff',
    borderWidth: 1,
    borderColor: '#c7d2fe',
  },
  toolBtnZip: {
    flex: 0.9,
    backgroundColor: '#fdf2f8',
    borderWidth: 1,
    borderColor: '#f9a8d4',
  },
  toolBtnZipText: {
    color: '#be185d',
  },
  toolBtnJson: {
    flex: 0.75,
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#99f6e4',
  },
  toolBtnJsonText: {
    color: '#0f766e',
  },
  toolBtnText: {
    fontFamily: 'Arial',
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  toolBtnTextDark: {
    color: ACCENT,
  },
  rowTai: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
    justifyContent: 'center',
  },
  metaLine: {
    fontFamily: 'Arial',
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 2,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  loi: {
    fontFamily: 'Arial',
    fontSize: 12,
    color: '#fca5a5',
    marginTop: 4,
    textAlign: 'center',
  },
  bodyRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'stretch',
    minHeight: 0,
    backgroundColor: BG,
  },
  bodyRowDoc: {
    flexDirection: 'column',
  },
  sidebarScroll: {
    width: 188,
    maxWidth: 200,
    flexGrow: 0,
    flexShrink: 0,
    backgroundColor: SIDEBAR_BG,
    borderRightWidth: 1,
    borderRightColor: SIDEBAR_EDGE,
    ...Platform.select({
      web: {
        boxShadow: 'inset -1px 0 0 rgba(15,23,42,0.04), 4px 0 24px rgba(15,23,42,0.04)',
      },
      default: {
        elevation: 1,
        shadowColor: '#0f172a',
        shadowOffset: { width: 1, height: 0 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
      },
    }),
  },
  sidebarScrollDoc: {
    width: '100%',
    maxWidth: '100%',
    maxHeight: 200,
    flexGrow: 0,
    borderRightWidth: 0,
    borderBottomWidth: 1,
    borderBottomColor: SIDEBAR_EDGE,
  },
  sidebarInner: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    paddingBottom: 24,
  },
  sidebarHeading: {
    fontFamily: 'Arial',
    fontSize: 10,
    fontWeight: '800',
    color: SIDEBAR_MUTED,
    textTransform: 'uppercase',
    letterSpacing: 0.85,
    marginBottom: 8,
    marginTop: 4,
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: SIDEBAR_ITEM_BG,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: SIDEBAR_ITEM_BORDER,
  },
  sidebarItemActive: {
    backgroundColor: SIDEBAR_ITEM_ACTIVE_BG,
    borderColor: SIDEBAR_ITEM_ACTIVE_BORDER,
  },
  sidebarItemIcon: {
    marginTop: 1,
  },
  sidebarItemLabel: {
    flex: 1,
    fontFamily: 'Arial',
    fontSize: 12,
    fontWeight: '700',
    color: SIDEBAR_TEXT,
  },
  sidebarItemLabelActive: {
    color: SIDEBAR_ACTIVE,
  },
  sidebarDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: SIDEBAR_EDGE,
    marginVertical: 12,
  },
  sidebarSubItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 9,
    paddingHorizontal: 8,
    borderRadius: 10,
    backgroundColor: SIDEBAR_ITEM_BG,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: SIDEBAR_ITEM_BORDER,
  },
  sidebarSubItemActive: {
    backgroundColor: SIDEBAR_ITEM_ACTIVE_BG,
    borderColor: SIDEBAR_ITEM_ACTIVE_BORDER,
  },
  sidebarSubLabel: {
    flex: 1,
    fontFamily: 'Arial',
    fontSize: 11,
    fontWeight: '700',
    color: SIDEBAR_TEXT,
  },
  sidebarSubLabelActive: {
    color: SIDEBAR_ACTIVE,
  },
  mainScroll: {
    flex: 1,
    minWidth: 0,
    minHeight: 0,
  },
  scroll: {
    width: '100%',
    maxWidth: '100%',
    alignSelf: 'stretch',
    paddingHorizontal: 10,
    paddingBottom: 32,
    paddingTop: 2,
  },
  sectionTitle: {
    fontFamily: 'Arial',
    fontSize: 18,
    fontWeight: '800',
    color: INK,
    letterSpacing: -0.3,
    marginBottom: 2,
  },
  sectionHint: {
    fontFamily: 'Arial',
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
    lineHeight: 17,
    marginBottom: 4,
  },
  placeholder: {
    fontFamily: 'Arial',
    fontSize: 14,
    color: '#64748b',
    marginTop: 16,
    lineHeight: 22,
  },
  blockIntro: {
    fontFamily: 'Arial',
    fontSize: 13,
    color: '#475569',
    marginTop: 6,
    marginBottom: 8,
    lineHeight: 22,
    backgroundColor: SURFACE,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  mucPhu: {
    fontFamily: 'Arial',
    fontSize: 14,
    fontWeight: '800',
    color: ACCENT,
    marginTop: 20,
    marginBottom: 6,
  },
  doanVan: {
    fontFamily: 'Arial',
    fontSize: 13,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 4,
  },
  chartRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8,
  },
  chartHalf: {
    flex: 1,
    minWidth: 280,
    maxWidth: '100%',
  },
  kpiHeroRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 14,
  },
  kpiCard: {
    flex: 1,
    minWidth: 160,
    backgroundColor: '#fffbeb',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  kpiCardCanhBao: {
    backgroundColor: '#fff1f2',
    borderColor: '#fda4af',
  },
  kpiCardLabel: {
    fontFamily: 'Arial',
    fontSize: 12,
    fontWeight: '700',
    color: '#9f1239',
  },
  kpiCardValue: {
    fontFamily: 'Arial',
    fontSize: 22,
    fontWeight: '900',
    color: '#0f172a',
    marginTop: 6,
  },
  kpiCardValueCanhBao: {
    color: '#b91c1c',
    fontSize: 24,
  },
  kpiCardUnit: {
    fontFamily: 'Arial',
    fontSize: 11,
    color: '#64748b',
    marginTop: 4,
  },
  drillBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fdf2f8',
    borderWidth: 1,
    borderColor: '#f9a8d4',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  drillBannerTxt: {
    fontFamily: 'Arial',
    fontSize: 13,
    fontWeight: '700',
    color: '#831843',
    flex: 1,
  },
  drillClear: {
    fontFamily: 'Arial',
    fontSize: 13,
    fontWeight: '800',
    color: '#db2777',
  },
  drillHsWrap: {
    marginBottom: 14,
    width: '100%',
    maxWidth: '100%',
    alignSelf: 'stretch',
    backgroundColor: SURFACE,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 10,
  },
  drillHsTable: {
    width: '100%',
    alignSelf: 'stretch',
  },
  drillHsTitle: {
    fontFamily: 'Arial',
    fontSize: 13,
    fontWeight: '800',
    color: ACCENT,
    marginBottom: 8,
  },
  drillHsFlash: {
    maxHeight: 320,
  },
  drillHsHead: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderColor: '#e83e8c',
    paddingBottom: 6,
    marginBottom: 4,
  },
  drillHsRowFull: {
    width: '100%',
    alignSelf: 'stretch',
  },
  drillHsRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    minHeight: 44,
    borderBottomWidth: 1,
    borderColor: '#f1f5f9',
  },
  drillHsRowAlt: {
    backgroundColor: '#fdf2f8',
  },
  drillHsCell: {
    paddingHorizontal: 6,
    justifyContent: 'center',
    flexShrink: 1,
  },
  drillHsHeadTxt: {
    fontFamily: 'Arial',
    fontSize: 11,
    fontWeight: '800',
    color: '#9d174d',
  },
  drillHsTxt: {
    fontFamily: 'Arial',
    fontSize: 12,
    color: INK,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
    paddingHorizontal: 2,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    maxWidth: '100%',
    backgroundColor: 'rgba(254,243,199,0.95)',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.35)',
  },
  chipTxt: {
    flex: 1,
    fontFamily: 'Arial',
    fontSize: 11,
    color: '#78350f',
    lineHeight: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.55)',
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: {
    backgroundColor: SURFACE,
    borderRadius: 18,
    maxHeight: '82%',
    paddingBottom: 12,
    ...Platform.select({
      web: { maxWidth: 560, width: '100%', alignSelf: 'center' },
      default: {},
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderColor: '#e2e8f0',
  },
  modalTitle: {
    flex: 1,
    fontFamily: 'Arial',
    fontSize: 15,
    fontWeight: '800',
    color: INK,
    marginRight: 8,
  },
  modalHint: {
    fontFamily: 'Arial',
    fontSize: 11,
    color: '#64748b',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  modalList: {
    maxHeight: 400,
    width: '100%',
    paddingHorizontal: 8,
  },
  modalRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    minHeight: 44,
    borderBottomWidth: 1,
    borderColor: '#f1f5f9',
  },
  modalRowFull: {
    width: '100%',
    alignSelf: 'stretch',
  },
  modalCell: {
    fontFamily: 'Arial',
    fontSize: 11,
    color: INK,
  },
  modalEmpty: {
    fontFamily: 'Arial',
    fontSize: 13,
    color: '#94a3b8',
    padding: 24,
    textAlign: 'center',
  },
  paretoCard: {
    backgroundColor: SURFACE,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 12,
    marginBottom: 14,
  },
  paretoTitle: {
    fontFamily: 'Arial',
    fontSize: 14,
    fontWeight: '800',
    color: INK,
  },
  paretoSub: {
    fontFamily: 'Arial',
    fontSize: 11,
    color: '#64748b',
    marginTop: 4,
    marginBottom: 10,
  },
  paretoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  paretoLab: {
    width: 100,
    fontFamily: 'Arial',
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  paretoTrack: {
    flex: 1,
    height: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  paretoFill: {
    height: 8,
    backgroundColor: '#0ea5e9',
    borderRadius: 4,
  },
  paretoPct: {
    width: 44,
    textAlign: 'right',
    fontFamily: 'Arial',
    fontSize: 11,
    fontWeight: '800',
    color: '#0369a1',
  },
});
