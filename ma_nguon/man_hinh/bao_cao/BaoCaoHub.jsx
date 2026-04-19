/**
 * Hub báo cáo — ba nhánh theo CDSS-BHYT-SPEC-BC: Quản trị / Chuyên môn / Doanh thu BHYT.
 */
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { layCacBangDeXuat } from '../../dich_vu/bao_cao_export_manifest';
import { taiNguonVaMoHinhMuc5 } from '../../dich_vu/bao_cao_service';
import { inHoacChiaSePdfBaoCao, xuatExcelBaoCao } from '../../dich_vu/bao_cao_xuat_file';
import BangMoHinhMuc5 from './BangMoHinhMuc5';

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
  { key: 'so_loi', label: 'so_loi', width: 72 },
];

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

export default function BaoCaoHub() {
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
  });
  const [xuatDang, setXuatDang] = useState(false);

  const nap = useCallback(async () => {
    setTai((s) => ({ ...s, dangTai: true, loi: null }));
    try {
      const kq = await taiNguonVaMoHinhMuc5();
      setTai({
        dangTai: false,
        loi: null,
        soHoSo: kq.so_ho_so_sau_gom,
        moHinh: kq.mo_hinh_muc5,
        muc6: kq.bao_cao_quan_tri_muc6,
        muc7: kq.bao_cao_chuyen_mon_muc7,
        muc8: kq.bao_cao_doanh_thu_muc8,
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
      });
    }
  }, []);

  useEffect(() => {
    nap();
  }, [nap]);

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
    return {
      soCanh: Array.isArray(fcb) ? fcb.length : null,
      tongBhtt,
    };
  }, [tai.moHinh]);

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

  const meta = NHANH.find((x) => x.id === nhanh) || NHANH[0];

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <View style={styles.heroAccent} />
        <View style={styles.heroRow}>
          <View style={styles.heroTextCol}>
            <Text style={styles.heroEyebrow}>CDSS BHYT · SPEC-BC</Text>
            <Text style={styles.heroTitle}>Trung tâm báo cáo</Text>
            <Text style={styles.heroSub}>
              Ba nhánh: Quản trị (mục 5–6), Chuyên môn (mục 7), Doanh thu BHYT (mục 8). Xuất Excel đa sheet hoặc
              in / PDF ngay trên màn hình đang xem.
            </Text>
          </View>
          <View style={styles.heroIconWrap}>
            <MaterialCommunityIcons name="monitor-dashboard" size={36} color="#93c5fd" />
          </View>
        </View>

        {!tai.dangTai && !tai.loi ? (
          <View style={styles.statRow}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Hồ sơ kho</Text>
              <Text style={styles.statValue}>{tai.soHoSo ?? 0}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Cảnh báo (fact)</Text>
              <Text style={styles.statValue}>{thongKe.soCanh ?? '—'}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Σ T_BHTT (ước)</Text>
              <Text style={styles.statValueSmall}>{dinhDangTien(thongKe.tongBhtt)}</Text>
            </View>
          </View>
        ) : null}

        {coDuLieuXuat ? (
          <View style={styles.toolRow}>
            <TouchableOpacity
              style={[styles.toolBtn, styles.toolBtnExcel]}
              onPress={onXuatExcel}
              disabled={xuatDang}
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
              disabled={xuatDang}
              accessibilityRole="button"
              accessibilityLabel="In hoặc tạo PDF"
            >
              <MaterialCommunityIcons name="printer-outline" size={22} color={ACCENT} />
              <Text style={[styles.toolBtnText, styles.toolBtnTextDark]}>In / PDF</Text>
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
          <Text style={styles.metaLine}>Đã gom trùng MA_LK — dữ liệu sẵn sàng cho bảng và xuất file.</Text>
        )}
      </View>

      <View style={styles.tabStrip}>
        {NHANH.map((t) => {
          const active = t.id === nhanh;
          return (
            <TouchableOpacity
              key={t.id}
              style={[styles.tab, active && styles.tabActive]}
              onPress={() => {
                setNhanh(t.id);
                if (t.id !== 'QUAN_TRI') setQuanTriThe('M5');
              }}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
            >
              <MaterialCommunityIcons
                name={t.icon}
                size={22}
                color={active ? '#fff' : '#64748b'}
                style={styles.tabIcon}
              />
              <Text style={[styles.tabText, active && styles.tabTextActive]} numberOfLines={2}>
                {t.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {nhanh === 'QUAN_TRI' ? (
        <View style={styles.subTabRow}>
          <TouchableOpacity
            style={[styles.subTab, quanTriThe === 'M5' && styles.subTabActive]}
            onPress={() => setQuanTriThe('M5')}
          >
            <MaterialCommunityIcons
              name="database-outline"
              size={18}
              color={quanTriThe === 'M5' ? '#fff' : ACCENT}
              style={styles.subTabIcon}
            />
            <Text style={[styles.subTabText, quanTriThe === 'M5' && styles.subTabTextActive]} numberOfLines={2}>
              Mục 5 — Fact / Dimension
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.subTab, quanTriThe === 'M6' && styles.subTabActive]}
            onPress={() => setQuanTriThe('M6')}
          >
            <MaterialCommunityIcons
              name="view-dashboard-variant"
              size={18}
              color={quanTriThe === 'M6' ? '#fff' : ACCENT}
              style={styles.subTabIcon}
            />
            <Text style={[styles.subTabText, quanTriThe === 'M6' && styles.subTabTextActive]} numberOfLines={2}>
              Mục 6 — BC-QT-01…04
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  hero: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 16,
    backgroundColor: INK,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
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
  heroRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  heroTextCol: {
    flex: 1,
  },
  heroEyebrow: {
    fontFamily: 'Arial',
    fontSize: 11,
    fontWeight: '700',
    color: '#94a3b8',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontFamily: 'Arial',
    fontSize: 26,
    fontWeight: '800',
    color: '#f8fafc',
    marginTop: 4,
    letterSpacing: -0.5,
  },
  heroSub: {
    fontFamily: 'Arial',
    fontSize: 13,
    marginTop: 8,
    color: '#cbd5e1',
    lineHeight: 20,
  },
  heroIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(37,99,235,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(147,197,253,0.4)',
  },
  statRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(30,41,59,0.65)',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.25)',
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
    fontSize: 20,
    fontWeight: '800',
    color: '#f1f5f9',
    marginTop: 4,
  },
  statValueSmall: {
    fontFamily: 'Arial',
    fontSize: 13,
    fontWeight: '700',
    color: '#e2e8f0',
    marginTop: 4,
  },
  toolRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  toolBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    minHeight: 48,
  },
  toolBtnExcel: {
    backgroundColor: '#059669',
  },
  toolBtnPrint: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
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
    gap: 10,
    marginTop: 14,
  },
  metaLine: {
    fontFamily: 'Arial',
    fontSize: 13,
    color: '#cbd5e1',
    marginTop: 12,
  },
  loi: {
    fontFamily: 'Arial',
    fontSize: 13,
    color: '#fca5a5',
    marginTop: 12,
  },
  tabStrip: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 10,
    backgroundColor: SURFACE,
    marginHorizontal: 12,
    marginTop: -10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    ...Platform.select({
      web: { boxShadow: '0 4px 20px rgba(15,23,42,0.06)' },
      default: {
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
        elevation: 2,
      },
    }),
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 12,
    backgroundColor: ACCENT_SOFT,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 72,
  },
  tabActive: {
    backgroundColor: ACCENT,
  },
  tabIcon: {
    marginBottom: 4,
  },
  tabText: {
    fontFamily: 'Arial',
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    textAlign: 'center',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  subTabRow: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
    backgroundColor: SURFACE,
    marginHorizontal: 12,
    marginTop: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  subTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    minHeight: 46,
  },
  subTabActive: {
    backgroundColor: ACCENT,
    borderColor: ACCENT,
  },
  subTabIcon: {
    marginRight: 2,
  },
  subTabText: {
    fontFamily: 'Arial',
    fontSize: 11,
    fontWeight: '700',
    color: ACCENT,
    textAlign: 'center',
    flexShrink: 1,
  },
  subTabTextActive: {
    color: '#FFFFFF',
  },
  scroll: {
    padding: 16,
    paddingBottom: 40,
    paddingTop: 20,
  },
  sectionTitle: {
    fontFamily: 'Arial',
    fontSize: 20,
    fontWeight: '800',
    color: INK,
    letterSpacing: -0.3,
  },
  sectionHint: {
    fontFamily: 'Arial',
    fontSize: 14,
    color: '#64748b',
    marginTop: 8,
    lineHeight: 21,
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
    fontSize: 14,
    color: '#475569',
    marginTop: 14,
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
});
