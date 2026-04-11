import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import XLSX from 'xlsx';
import { layTatCaHoSoTuKho } from '../tien_ich/kho_du_lieu';
import {
  layDanhSachLoiHoSo,
  layMaLKHoSo,
  layXml1HoSo,
  locDanhSachLoiChiTiet,
  phangHoaDanhSachLoiChiTiet,
  tongHopQuyTacTuDanhSachChiTiet,
} from '../tien_ich/thong_ke_loi_dung_chung';

const TAB_LIST = [
  { id: 'TONG_QUAN', label: 'Tổng quan' },
  { id: 'THEO_KHOA', label: 'Theo khoa' },
  { id: 'THEO_BAC_SI', label: 'Theo bác sĩ' },
  { id: 'THEO_QUY_TAC', label: 'Theo quy tắc' },
  { id: 'CHI_TIET_LOI', label: 'Chi tiết lỗi' },
  { id: 'XU_HUONG', label: 'Xu hướng' },
];

const QUICK_RANGE = [
  { id: '7D', label: '7 ngày' },
  { id: '30D', label: '30 ngày' },
  { id: '90D', label: '90 ngày' },
  { id: 'THANG_NAY', label: 'Tháng này' },
  { id: 'ALL', label: 'Toàn bộ' },
];

const DINH_DANG_TIEN = new Intl.NumberFormat('vi-VN');

const toNumber = (v) => {
  const n = Number(v || 0);
  return Number.isFinite(n) ? n : 0;
};

/** Chuẩn hóa MA_LOAI_KCB (khớp logic QĐ 130 / dong_co_giam_dinh) */
const normalizeMaLoaiKcb = (val) => {
  const raw = String(val ?? '').trim();
  if (!raw) return '';
  const digits = raw.replace(/\D/g, '');
  return digits ? digits.padStart(2, '0') : raw;
};

/** Khám & ngoại trú (lượt khám / ngoại trú theo danh mục nội bộ engine) */
const MA_LOAI_KCB_NGOAI_TRU = new Set(['01', '02', '05', '06', '07', '08']);
/** Nội trú; 04 = điều trị ban ngày — tính như đợt điều trị nội trú */
const MA_LOAI_KCB_NOI_TRU_DOT = new Set(['03', '04', '09']);

const layTongChiBvXml1 = (xml1) => {
  const t = toNumber(xml1?.T_TONGCHI_BV ?? xml1?.T_TONGCHI);
  return t > 0 ? t : 0;
};

/**
 * KPI quản trị chi phí & sử dụng quỹ (Utilization) — theo XML1 đã nạp.
 */
const tinhKpiQuanTriChiPhiVaSuDungQuy = (hoSoTrongKy) => {
  let tongNgoaiTru = 0;
  let demNgoaiTru = 0;
  let tongNoiTru = 0;
  let demNoiTru = 0;

  const thanhPhan = {
    T_KHAM: 0,
    T_XN: 0,
    T_CDHA: 0,
    T_THUOC: 0,
    T_VTYT: 0,
    T_DVKT: 0,
    T_PTTT: 0,
    T_GIUONG: 0,
  };

  let tongNgayDieuTriNoiTru = 0;
  let demNoiTruCoNgay = 0;
  let tongChiTrenNgay = 0;

  (Array.isArray(hoSoTrongKy) ? hoSoTrongKy : []).forEach((hoSo) => {
    const xml1 = layXml1HoSo(hoSo);
    const ma = normalizeMaLoaiKcb(xml1?.MA_LOAI_KCB);
    const tong = layTongChiBvXml1(xml1);

    Object.keys(thanhPhan).forEach((k) => {
      thanhPhan[k] += toNumber(xml1?.[k]);
    });

    if (MA_LOAI_KCB_NGOAI_TRU.has(ma)) {
      tongNgoaiTru += tong;
      demNgoaiTru += 1;
    }
    if (MA_LOAI_KCB_NOI_TRU_DOT.has(ma)) {
      tongNoiTru += tong;
      demNoiTru += 1;
      const ngay = toNumber(xml1?.SO_NGAY_DTRI);
      if (ngay > 0) {
        demNoiTruCoNgay += 1;
        tongNgayDieuTriNoiTru += ngay;
        tongChiTrenNgay += tong / ngay;
      }
    }
  });

  const tongThanhPhan = Object.values(thanhPhan).reduce((a, b) => a + b, 0);
  const tongMauSo = hoSoTrongKy?.length ? hoSoTrongKy.reduce((s, hoSo) => s + layTongChiBvXml1(layXml1HoSo(hoSo)), 0) : 0;

  const pct = (phan) => (tongMauSo > 0 ? Math.round((phan / tongMauSo) * 10000) / 100 : 0);
  const pctThanhPhan = tongThanhPhan > 0
    ? Object.fromEntries(Object.entries(thanhPhan).map(([k, v]) => [k, Math.round((v / tongThanhPhan) * 10000) / 100]))
    : Object.fromEntries(Object.keys(thanhPhan).map((k) => [k, 0]));

  return {
    chiPhiBQLuotKhamNgoaiTru: demNgoaiTru ? Math.round(tongNgoaiTru / demNgoaiTru) : 0,
    soLuotNgoaiTru: demNgoaiTru,
    chiPhiBQDotDieuTriNoiTru: demNoiTru ? Math.round(tongNoiTru / demNoiTru) : 0,
    soDotNoiTru: demNoiTru,
    coCauChiPhiThanhPhanTrenTongChi: {
      cong_kham: pct(thanhPhan.T_KHAM),
      xet_nghiem: pct(thanhPhan.T_XN),
      cdha: pct(thanhPhan.T_CDHA),
      thuoc: pct(thanhPhan.T_THUOC),
      vtyt: pct(thanhPhan.T_VTYT),
      dvkt_khac: pct(thanhPhan.T_DVKT),
      phau_thuat_thu_thuat: pct(thanhPhan.T_PTTT),
      giuong: pct(thanhPhan.T_GIUONG),
      tong_chi_xml1_ky: tongMauSo,
    },
    coCauChiPhiThanhPhanTrongTongThanhPhan: {
      cong_kham: pctThanhPhan.T_KHAM,
      xet_nghiem: pctThanhPhan.T_XN,
      cdha: pctThanhPhan.T_CDHA,
      thuoc: pctThanhPhan.T_THUOC,
      vtyt: pctThanhPhan.T_VTYT,
      dvkt_khac: pctThanhPhan.T_DVKT,
      phau_thuat_thu_thuat: pctThanhPhan.T_PTTT,
      giuong: pctThanhPhan.T_GIUONG,
    },
    cuongDoDichVu: {
      /** Chi phí bình quân / ngày điều trị (nội trú, có SO_NGAY_DTRI > 0) */
      chiPhiTrenNgayDieuTriNoiTru: demNoiTruCoNgay ? Math.round(tongChiTrenNgay / demNoiTruCoNgay) : 0,
      tongNgayDieuTriNoiTru: Math.round(tongNgayDieuTriNoiTru),
      soHoSoNoiTruCoNgay: demNoiTruCoNgay,
    },
  };
};

const parseNgay = (raw) => {
  if (!raw) return null;
  if (raw instanceof Date) return Number.isNaN(raw.getTime()) ? null : raw;

  const chuoi = String(raw).trim();
  if (!chuoi) return null;

  if (/^\d{8}$/.test(chuoi)) {
    const y = Number(chuoi.slice(0, 4));
    const m = Number(chuoi.slice(4, 6)) - 1;
    const d = Number(chuoi.slice(6, 8));
    const parsed = new Date(y, m, d);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  if (/^\d{14}$/.test(chuoi)) {
    const y = Number(chuoi.slice(0, 4));
    const m = Number(chuoi.slice(4, 6)) - 1;
    const d = Number(chuoi.slice(6, 8));
    const hh = Number(chuoi.slice(8, 10));
    const mm = Number(chuoi.slice(10, 12));
    const ss = Number(chuoi.slice(12, 14));
    const parsed = new Date(y, m, d, hh, mm, ss);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  const parsed = new Date(chuoi);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const dinhDangNgay = (d) => {
  if (!(d instanceof Date) || Number.isNaN(d.getTime())) return 'N/A';
  return d.toLocaleDateString('vi-VN');
};

const dinhDangTien = (v) => `${DINH_DANG_TIEN.format(toNumber(v))} VND`;

/** Nội trú theo mẫu KPI vận hành: MA_LOAI_KCB = 3 (QĐ 130 → 03, 09) */
const laNoiTruTheoChiSoVanHanh = (xml1) => {
  const m = normalizeMaLoaiKcb(xml1?.MA_LOAI_KCB);
  return m === '03' || m === '09';
};

/** Chuyển tuyến: XML1.MA_LOAI_RV = 2 (QĐ 130); hỗ trợ tên cột legacy nếu có */
const laChuyenTuyenXml1 = (xml1) => {
  const raw = xml1?.MA_LOAI_RV ?? xml1?.TINH_TRANG_RV;
  const digits = String(raw ?? '').replace(/\D/g, '');
  return digits === '2';
};

const layBaKyTuDauMaBenh = (xml1) => {
  const s = String(xml1?.MA_BENH_CHINH ?? xml1?.MA_BENH ?? '')
    .replace(/\./g, '')
    .toUpperCase()
    .trim();
  return s.slice(0, 3);
};

/** Khoảng cách ngày (lượt sau NGAY_VAO − lượt trước NGAY_RA), chỉ phần ngày */
const chenhNgayNgayRaToiNgayVao = (ngayRaTruoc, ngayVaoSau) => {
  const dR = parseNgay(ngayRaTruoc);
  const dV = parseNgay(ngayVaoSau);
  if (!dR || !dV) return null;
  const t0 = Date.UTC(dR.getFullYear(), dR.getMonth(), dR.getDate());
  const t1 = Date.UTC(dV.getFullYear(), dV.getMonth(), dV.getDate());
  return Math.floor((t1 - t0) / 86400000);
};

const ngayTrongKhoangBaoCao = (d, khoangThoiGian) => {
  if (!(d instanceof Date) || Number.isNaN(d.getTime())) return false;
  const tu = khoangThoiGian?.tu;
  const den = khoangThoiGian?.den;
  if (!tu || !den) return true;
  return d >= tu && d <= den;
};

/**
 * KPI hiệu suất vận hành lâm sàng — theo `chi so van hanh.xlsx` (ALOS, tái nhập 30 ngày, chuyển tuyến).
 * Tái nhập: dùng toàn kho để có chuỗi theo MA_BN; lượt tái nhập tính khi NGAY_VAO lượt sau thuộc kỳ báo cáo.
 */
const tinhKpiVanHanhLamSang = (hoSoTrongKy, toanBoHoSo, khoangThoiGian) => {
  let tongNgayDtri = 0;
  let demNoiTruTrongKy = 0;
  let demNoiTruCoSoNgay = 0;

  hoSoTrongKy.forEach((hoSo) => {
    const x1 = layXml1HoSo(hoSo);
    if (!laNoiTruTheoChiSoVanHanh(x1)) return;
    demNoiTruTrongKy += 1;
    const nd = toNumber(x1?.SO_NGAY_DTRI);
    tongNgayDtri += nd;
    if (nd > 0) demNoiTruCoSoNgay += 1;
  });

  const alosNgay = demNoiTruTrongKy > 0 ? tongNgayDtri / demNoiTruTrongKy : 0;

  let soChuyenTuyen = 0;
  const tongHoSoKy = hoSoTrongKy.length;
  hoSoTrongKy.forEach((hoSo) => {
    if (laChuyenTuyenXml1(layXml1HoSo(hoSo))) soChuyenTuyen += 1;
  });
  const tyLeChuyenTuyenPhanTram = tongHoSoKy > 0 ? Math.round((soChuyenTuyen / tongHoSoKy) * 10000) / 100 : 0;

  const gopTheoMaBn = new Map();
  (Array.isArray(toanBoHoSo) ? toanBoHoSo : []).forEach((hoSo) => {
    const x1 = layXml1HoSo(hoSo);
    const mabn = String(x1?.MA_BN || '').trim();
    if (!mabn) return;
    const nv = parseNgay(x1?.NGAY_VAO);
    if (!gopTheoMaBn.has(mabn)) gopTheoMaBn.set(mabn, []);
    gopTheoMaBn.get(mabn).push({ x1, nv });
  });

  let soLanTaiNhapGhiNhan = 0;
  gopTheoMaBn.forEach((mang) => {
    mang.sort((a, b) => {
      const ta = a.nv?.getTime() ?? 0;
      const tb = b.nv?.getTime() ?? 0;
      if (ta !== tb) return ta - tb;
      return String(a.x1?.MA_LK || '').localeCompare(String(b.x1?.MA_LK || ''));
    });
    for (let i = 1; i < mang.length; i += 1) {
      const truoc = mang[i - 1];
      const sau = mang[i];
      if (!laNoiTruTheoChiSoVanHanh(truoc.x1) || !laNoiTruTheoChiSoVanHanh(sau.x1)) continue;
      const chenh = chenhNgayNgayRaToiNgayVao(truoc.x1?.NGAY_RA, sau.x1?.NGAY_VAO);
      if (chenh === null || chenh < 0 || chenh > 30) continue;
      const p1 = layBaKyTuDauMaBenh(truoc.x1);
      const p2 = layBaKyTuDauMaBenh(sau.x1);
      if (p1.length < 3 || p2.length < 3 || p1 !== p2) continue;
      if (!ngayTrongKhoangBaoCao(sau.nv, khoangThoiGian)) continue;
      soLanTaiNhapGhiNhan += 1;
    }
  });

  const tyLeTaiNhap30PhanTram = demNoiTruTrongKy > 0
    ? Math.round((soLanTaiNhapGhiNhan / demNoiTruTrongKy) * 10000) / 100
    : 0;

  return {
    alosNgay: Math.round(alosNgay * 100) / 100,
    tongNgayDieuTriNoiTruKy: Math.round(tongNgayDtri),
    soDotNoiTruTrongKy: demNoiTruTrongKy,
    soDotNoiTruCoSoNgayDtri: demNoiTruCoSoNgay,
    tyLeChuyenTuyenPhanTram,
    soHoSoChuyenTuyen: soChuyenTuyen,
    tongHoSoTrongKy: tongHoSoKy,
    soLanTaiNhap30TrongKy: soLanTaiNhapGhiNhan,
    tyLeTaiNhap30PhanTram,
  };
};

const layKhoangNhanh = (id) => {
  const now = new Date();
  const den = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  if (id === 'ALL') return { tu: null, den: null };
  if (id === 'THANG_NAY') {
    return {
      tu: new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0),
      den,
    };
  }

  const soNgay = id === '7D' ? 7 : id === '30D' ? 30 : 90;
  const tu = new Date(den);
  tu.setDate(den.getDate() - (soNgay - 1));
  tu.setHours(0, 0, 0, 0);
  return { tu, den };
};

const tongHopDuLieu = (hoSoTrongKy, toanBoHoSo, khoangThoiGian, kieuXuHuong, danhSachChiTietTrongKy = []) => {
  const tongHoSoTrongKy = hoSoTrongKy.length;
  const tongHoSoKho = toanBoHoSo.length;

  const khoaMap = new Map();
  const bacSiMap = new Map();
  const mapChiTietTheoMaLK = new Map();
  (Array.isArray(danhSachChiTietTrongKy) ? danhSachChiTietTrongKy : []).forEach((chiTiet) => {
    const maLK = String(chiTiet?.ma_lk || '').trim();
    if (!mapChiTietTheoMaLK.has(maLK)) mapChiTietTheoMaLK.set(maLK, []);
    mapChiTietTheoMaLK.get(maLK).push(chiTiet);
  });

  let tongLoi = 0;
  let tongHoSoCoLoi = 0;
  let tongChiPhiUocTinh = 0;

  hoSoTrongKy.forEach((hoSo) => {
    const xml1 = layXml1HoSo(hoSo);
    const maKhoa = String(xml1?.MA_KHOA || 'KHONG_RO');
    const maBacSi = String(xml1?.MA_BS_KHAM || 'KHONG_RO');
    const dsLoi = mapChiTietTheoMaLK.get(layMaLKHoSo(hoSo)) || [];
    const coLoi = dsLoi.length > 0;

    if (!khoaMap.has(maKhoa)) {
      khoaMap.set(maKhoa, { maKhoa, tongHoSo: 0, hoSoLoi: 0, tongLoi: 0, chiPhi: 0 });
    }
    if (!bacSiMap.has(maBacSi)) {
      bacSiMap.set(maBacSi, { maBacSi, tongHoSo: 0, hoSoLoi: 0, tongLoi: 0, chiPhi: 0 });
    }

    const objKhoa = khoaMap.get(maKhoa);
    const objBacSi = bacSiMap.get(maBacSi);
    objKhoa.tongHoSo += 1;
    objBacSi.tongHoSo += 1;

    if (coLoi) {
      tongHoSoCoLoi += 1;
      objKhoa.hoSoLoi += 1;
      objBacSi.hoSoLoi += 1;
    }

    dsLoi.forEach((loi) => {
      const chiphi = toNumber(loi?.chi_phi_uoc_tinh || 0);
      tongLoi += 1;
      tongChiPhiUocTinh += chiphi;

      objKhoa.tongLoi += 1;
      objKhoa.chiPhi += chiphi;
      objBacSi.tongLoi += 1;
      objBacSi.chiPhi += chiphi;
    });
  });

  const tyLeLoiHoSo = tongHoSoTrongKy === 0 ? 0 : Math.round((tongHoSoCoLoi / tongHoSoTrongKy) * 10000) / 100;
  const tyLeQuaTai = tongHoSoKho === 0 ? 0 : Math.round((tongHoSoTrongKy / tongHoSoKho) * 10000) / 100;

  const theoKhoa = Array.from(khoaMap.values())
    .map((x) => ({
      ...x,
      tyLeLoi: x.tongHoSo === 0 ? 0 : Math.round((x.hoSoLoi / x.tongHoSo) * 10000) / 100,
    }))
    .sort((a, b) => b.tongLoi - a.tongLoi);

  const theoBacSi = Array.from(bacSiMap.values())
    .map((x) => ({
      ...x,
      tyLeLoi: x.tongHoSo === 0 ? 0 : Math.round((x.hoSoLoi / x.tongHoSo) * 10000) / 100,
    }))
    .sort((a, b) => b.tongLoi - a.tongLoi);

  const theoQuyTac = tongHopQuyTacTuDanhSachChiTiet(danhSachChiTietTrongKy).map((item) => ({
    rule: item.ma_luat || 'N/A',
    ten: item.canh_bao || item.ten_quy_tac || 'Không có mô tả',
    type: item.loai_hien_thi,
    tongLoi: item.sl,
    chiPhi: item.chi_phi || 0,
    soHoSoAnhHuong: item.so_ho_so,
  }));

  const duLieuXuHuong = taoDuLieuXuHuong(hoSoTrongKy, kieuXuHuong);

  return {
    input: {
      tongHoSoKho,
      tongHoSoTrongKy,
      soKhoa: theoKhoa.length,
      soBacSi: theoBacSi.length,
      tuNgay: khoangThoiGian?.tu || null,
      denNgay: khoangThoiGian?.den || null,
      tyLeQuaTai,
    },
    output: {
      tongHoSoCoLoi,
      tongLoi,
      tyLeLoiHoSo,
      tongChiPhiUocTinh,
      soQuyTacViPham: theoQuyTac.length,
    },
    theoKhoa,
    theoBacSi,
    theoQuyTac,
    chiTietLoi: danhSachChiTietTrongKy,
    duLieuXuHuong,
  };
};

const taoDuLieuXuHuong = (hoSoTrongKy, kieu) => {
  const bucketMap = new Map();

  hoSoTrongKy.forEach((hoSo) => {
    const d = parseNgay(layXml1HoSo(hoSo)?.NGAY_VAO);
    if (!d) return;

    let key = '';
    if (kieu === 'NGAY') {
      key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    } else if (kieu === 'QUY') {
      const q = Math.floor(d.getMonth() / 3) + 1;
      key = `Q${q}/${d.getFullYear()}`;
    } else {
      key = `${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    }

    if (!bucketMap.has(key)) {
      bucketMap.set(key, { ky: key, tongHoSo: 0, hoSoCoLoi: 0, tongLoi: 0 });
    }
    const b = bucketMap.get(key);
    const dsLoi = layDanhSachLoiHoSo(hoSo);

    b.tongHoSo += 1;
    b.tongLoi += dsLoi.length;
    if (dsLoi.length > 0) b.hoSoCoLoi += 1;
  });

  return Array.from(bucketMap.values())
    .map((x) => ({
      ...x,
      tyLeLoi: x.tongHoSo === 0 ? 0 : Math.round((x.hoSoCoLoi / x.tongHoSo) * 10000) / 100,
    }))
    .sort((a, b) => a.ky.localeCompare(b.ky));
};

/**
 * Báo cáo đầy đủ (tab, bảng, xuất Excel) — giữ nguyên logic cũ.
 * @param {object[]} [duLieuKhoBanDau] — nếu truyền (từ màn Daily Huddle), bỏ qua tải lại từ kho.
 */
export default function BaoCaoVaThongKeLegacy({ navigation, duLieuKhoBanDau }) {
  const [dangTai, setDangTai] = useState(false);
  const [tab, setTab] = useState('TONG_QUAN');
  const [quickRange, setQuickRange] = useState('30D');
  const [tuNgayText, setTuNgayText] = useState('');
  const [denNgayText, setDenNgayText] = useState('');
  const [kieuXuHuong, setKieuXuHuong] = useState('THANG');
  const [nhomLoiLoc, setNhomLoiLoc] = useState('');
  const [tuKhoaChiTiet, setTuKhoaChiTiet] = useState('');
  const [loaiChiTietLoc, setLoaiChiTietLoc] = useState('TAT_CA');

  const [duLieuGoc, setDuLieuGoc] = useState(() =>
    Array.isArray(duLieuKhoBanDau) ? duLieuKhoBanDau : [],
  );

  const khoangThoiGian = useMemo(() => {
    if (quickRange !== 'CUSTOM') return layKhoangNhanh(quickRange);

    const tu = parseNgay(tuNgayText);
    const den = parseNgay(denNgayText);
    if (!tu || !den) return { tu: null, den: null, loiNhap: true };

    const start = new Date(tu);
    start.setHours(0, 0, 0, 0);
    const end = new Date(den);
    end.setHours(23, 59, 59, 999);

    return { tu: start, den: end, loiNhap: start > end };
  }, [quickRange, tuNgayText, denNgayText]);

  const duLieuTrongKy = useMemo(() => {
    if (!Array.isArray(duLieuGoc) || duLieuGoc.length === 0) return [];
    const { tu, den } = khoangThoiGian;

    if (!tu || !den) {
      if (quickRange === 'ALL') return duLieuGoc;
      return [];
    }

    return duLieuGoc.filter((hoSo) => {
      const d = parseNgay(layXml1HoSo(hoSo)?.NGAY_VAO);
      if (!d) return false;
      return d >= tu && d <= den;
    });
  }, [duLieuGoc, khoangThoiGian, quickRange]);

  const danhSachLoiChiTietRaw = useMemo(() => phangHoaDanhSachLoiChiTiet(duLieuTrongKy), [duLieuTrongKy]);

  const danhSachNhomLoi = useMemo(() => {
    const setNhom = new Set();
    danhSachLoiChiTietRaw.forEach((loi) => {
      const type = String(loi?.nhom_loi_code || 'KHAC');
      if (type) setNhom.add(type);
    });
    return Array.from(setNhom).sort();
  }, [danhSachLoiChiTietRaw]);

  const danhSachLoiChiTietTheoNhom = useMemo(() => locDanhSachLoiChiTiet(danhSachLoiChiTietRaw, {
    nhomLoiCode: nhomLoiLoc,
    loaiHienThi: 'TAT_CA',
  }), [danhSachLoiChiTietRaw, nhomLoiLoc]);

  const danhSachLoiChiTietTrongKy = useMemo(() => locDanhSachLoiChiTiet(danhSachLoiChiTietTheoNhom, {
    nhomLoiCode: nhomLoiLoc,
    tuKhoa: tuKhoaChiTiet,
    loaiHienThi: loaiChiTietLoc,
  }), [danhSachLoiChiTietTheoNhom, loaiChiTietLoc, nhomLoiLoc, tuKhoaChiTiet]);

  const tongHop = useMemo(
    () => tongHopDuLieu(duLieuTrongKy, duLieuGoc, khoangThoiGian, kieuXuHuong, danhSachLoiChiTietTheoNhom),
    [danhSachLoiChiTietTheoNhom, duLieuTrongKy, duLieuGoc, khoangThoiGian, kieuXuHuong]
  );

  const kpiQuanTri = useMemo(() => tinhKpiQuanTriChiPhiVaSuDungQuy(duLieuTrongKy), [duLieuTrongKy]);

  const kpiVanHanh = useMemo(
    () => tinhKpiVanHanhLamSang(duLieuTrongKy, duLieuGoc, khoangThoiGian),
    [duLieuTrongKy, duLieuGoc, khoangThoiGian]
  );

  useEffect(() => {
    if (Array.isArray(duLieuKhoBanDau)) {
      setDuLieuGoc(duLieuKhoBanDau);
      return;
    }
    const taiDuLieu = async () => {
      try {
        setDangTai(true);
        const ds = await layTatCaHoSoTuKho();
        setDuLieuGoc(Array.isArray(ds) ? ds : []);
      } catch (_e) {
        Alert.alert('Lỗi', 'Không tải dữ liệu báo cáo được.');
      } finally {
        setDangTai(false);
      }
    };

    taiDuLieu();
  }, [duLieuKhoBanDau]);

  const moChiTietXmlTheoLoi = (loiPhatSinh) => {
    if (!loiPhatSinh?.ma_lk) return;
    navigation.navigate('DocXML', {
      maLK: loiPhatSinh.ma_lk,
      loi: loiPhatSinh,
      batLocTheoTab: true,
      nguonDieuHuong: 'bao_cao_chi_tiet_loi',
    });
  };

  const moSuaXmlTheoLoi = (loiPhatSinh) => {
    if (!loiPhatSinh?.ma_lk) return;
    navigation.navigate('SuaFileXML', {
      maLK: loiPhatSinh.ma_lk,
      loi: loiPhatSinh,
      moCheDoBanSao: true,
      viTriSua: {
        phanHe: loiPhatSinh.phan_he || 'XML1',
        truongLoi: loiPhatSinh.truong_loi || '',
        index: Number.isFinite(Number(loiPhatSinh.index)) ? Number(loiPhatSinh.index) : 0,
      },
    });
  };

  const xuatExcel = async () => {
    try {
      const sheetTongQuan = [
        {
          tong_ho_so_kho: tongHop.input.tongHoSoKho,
          tong_ho_so_trong_ky: tongHop.input.tongHoSoTrongKy,
          so_khoa: tongHop.input.soKhoa,
          so_bac_si: tongHop.input.soBacSi,
          ho_so_co_loi: tongHop.output.tongHoSoCoLoi,
          tong_loi: tongHop.output.tongLoi,
          ty_le_loi_phan_tram: tongHop.output.tyLeLoiHoSo,
          tong_chi_phi_uoc_tinh: tongHop.output.tongChiPhiUocTinh,
          so_quy_tac_vi_pham: tongHop.output.soQuyTacViPham,
          tu_ngay: dinhDangNgay(tongHop.input.tuNgay),
          den_ngay: dinhDangNgay(tongHop.input.denNgay),
        },
      ];

      const sheetKpiQuanTri = [
        {
          chi_phi_bq_luot_kham_ngoai_tru: kpiQuanTri.chiPhiBQLuotKhamNgoaiTru,
          so_luot_ngoai_tru: kpiQuanTri.soLuotNgoaiTru,
          chi_phi_bq_dot_dieu_tri_noi_tru: kpiQuanTri.chiPhiBQDotDieuTriNoiTru,
          so_dot_noi_tru: kpiQuanTri.soDotNoiTru,
          pct_cong_kham_tren_tong_chi: kpiQuanTri.coCauChiPhiThanhPhanTrenTongChi.cong_kham,
          pct_xet_nghiem_tren_tong_chi: kpiQuanTri.coCauChiPhiThanhPhanTrenTongChi.xet_nghiem,
          pct_cdha_tren_tong_chi: kpiQuanTri.coCauChiPhiThanhPhanTrenTongChi.cdha,
          pct_thuoc_tren_tong_chi: kpiQuanTri.coCauChiPhiThanhPhanTrenTongChi.thuoc,
          pct_vtyt_tren_tong_chi: kpiQuanTri.coCauChiPhiThanhPhanTrenTongChi.vtyt,
          pct_dvkt_khac_tren_tong_chi: kpiQuanTri.coCauChiPhiThanhPhanTrenTongChi.dvkt_khac,
          pct_pttt_tren_tong_chi: kpiQuanTri.coCauChiPhiThanhPhanTrenTongChi.phau_thuat_thu_thuat,
          pct_giuong_tren_tong_chi: kpiQuanTri.coCauChiPhiThanhPhanTrenTongChi.giuong,
          tong_chi_xml1_ky: kpiQuanTri.coCauChiPhiThanhPhanTrenTongChi.tong_chi_xml1_ky,
          cuong_do_cp_tren_ngay_dieu_tri_noi_tru: kpiQuanTri.cuongDoDichVu.chiPhiTrenNgayDieuTriNoiTru,
          tong_ngay_dieu_tri_noi_tru: kpiQuanTri.cuongDoDichVu.tongNgayDieuTriNoiTru,
          so_hs_noi_tru_co_ngay: kpiQuanTri.cuongDoDichVu.soHoSoNoiTruCoNgay,
        },
      ];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(sheetTongQuan), 'TongQuan');
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(sheetKpiQuanTri), 'KPI_QuanTriChiPhi');
      const sheetKpiVanHanh = [
        {
          alos_ngay_tb: kpiVanHanh.alosNgay,
          tong_ngay_dtri_noi_tru_ky: kpiVanHanh.tongNgayDieuTriNoiTruKy,
          so_dot_noi_tru_ky: kpiVanHanh.soDotNoiTruTrongKy,
          so_dot_noi_tru_co_so_ngay: kpiVanHanh.soDotNoiTruCoSoNgayDtri,
          ty_le_chuyen_tuyen_phan_tram: kpiVanHanh.tyLeChuyenTuyenPhanTram,
          so_hs_chuyen_tuyen: kpiVanHanh.soHoSoChuyenTuyen,
          tong_hs_trong_ky: kpiVanHanh.tongHoSoTrongKy,
          so_lan_tai_nhap_30_ghi_nhan: kpiVanHanh.soLanTaiNhap30TrongKy,
          ty_le_tai_nhap_30_phan_tram: kpiVanHanh.tyLeTaiNhap30PhanTram,
        },
      ];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(sheetKpiVanHanh), 'KPI_VanHanhLamSang');
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(tongHop.theoKhoa), 'TheoKhoa');
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(tongHop.theoBacSi), 'TheoBacSi');
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(tongHop.theoQuyTac), 'TheoQuyTac');
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(danhSachLoiChiTietTrongKy), 'ChiTietLoi');
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(tongHop.duLieuXuHuong), 'XuHuong');

      const fileName = `BaoCao_ThongKe_${Date.now()}.xlsx`;

      if (Platform.OS === 'web') {
        const wbout = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
        const blob = new Blob([wbout], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        Alert.alert('Thành công', 'Đã tải file báo cáo.');
      } else {
        const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
        const full = `${FileSystem.documentDirectory}${fileName}`;
        await FileSystem.writeAsStringAsync(full, wbout, { encoding: FileSystem.EncodingType.Base64 });

        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(full);
        }
        Alert.alert('Thành công', 'Đã xuất file báo cáo.');
      }
    } catch (e) {
      Alert.alert('Lỗi', `Không xuất được báo cáo: ${e?.message || 'N/A'}`);
    }
  };

  const renderBang = (columns, rows, keyPrefix) => (
    <View style={styles.tableWrap}>
      <View style={styles.tableHeader}>
        {columns.map((col) => (
          <Text key={`${keyPrefix}_h_${col.key}`} style={[styles.th, { flex: col.flex || 1 }]}>
            {col.label}
          </Text>
        ))}
      </View>
      {rows.length === 0 ? (
        <Text style={styles.emptyText}>Không có dữ liệu trong bộ lọc đã chọn.</Text>
      ) : (
        rows.map((row, idx) => (
          <View key={`${keyPrefix}_r_${row?.maKhoa || row?.maBacSi || row?.rule || row?.ky || idx}`} style={[styles.tableRow, idx % 2 === 1 && styles.tableRowAlt]}>
            {columns.map((col) => (
              col.renderAsNode ? (
                <View key={`${keyPrefix}_c_${col.key}_${idx}`} style={[styles.td_node_wrap, { flex: col.flex || 1 }]}>
                  {col.render(row)}
                </View>
              ) : (
                <Text key={`${keyPrefix}_c_${col.key}_${idx}`} style={[styles.td, { flex: col.flex || 1 }]}>
                  {col.render ? col.render(row) : String(row[col.key] ?? '')}
                </Text>
              )
            ))}
          </View>
        ))
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Báo Cáo & Thống Kê Chất Lượng BHYT</Text>
        <Text style={styles.heroSub}>
          Chuẩn hóa thống kê đầu vào - đầu ra, theo dõi theo thời gian và xuất báo cáo quản trị.
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.filterCard}>
          <Text style={styles.filterTitle}>Bộ lọc thời gian báo cáo</Text>
          <View style={styles.chipRow}>
            {QUICK_RANGE.map((q) => (
              <TouchableOpacity
                key={q.id}
                style={[styles.chip, quickRange === q.id && styles.chipActive]}
                onPress={() => setQuickRange(q.id)}
              >
                <Text style={[styles.chipText, quickRange === q.id && styles.chipTextActive]}>{q.label}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.chip, quickRange === 'CUSTOM' && styles.chipActive]}
              onPress={() => setQuickRange('CUSTOM')}
            >
              <Text style={[styles.chipText, quickRange === 'CUSTOM' && styles.chipTextActive]}>Tùy chỉnh</Text>
            </TouchableOpacity>
          </View>

          {quickRange === 'CUSTOM' && (
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="Từ ngày (YYYY-MM-DD)"
                value={tuNgayText}
                onChangeText={setTuNgayText}
                autoCapitalize="none"
              />
              <TextInput
                style={styles.input}
                placeholder="Đến ngày (YYYY-MM-DD)"
                value={denNgayText}
                onChangeText={setDenNgayText}
                autoCapitalize="none"
              />
            </View>
          )}

          <Text style={styles.rangeLabel}>
            Kỳ báo cáo: {dinhDangNgay(tongHop.input.tuNgay)} - {dinhDangNgay(tongHop.input.denNgay)}
          </Text>
          {khoangThoiGian?.loiNhap && <Text style={styles.warnText}>Khoảng ngày không hợp lệ (từ ngày phải {'<='} đến ngày).</Text>}

          <Text style={styles.filterTitleSmall}>Lọc theo nhóm lỗi đã code (type)</Text>
          <View style={styles.chipRow}>
            <TouchableOpacity
              style={[styles.chipSmall, !nhomLoiLoc && styles.chipActive]}
              onPress={() => setNhomLoiLoc('')}
            >
              <Text style={[styles.chipText, !nhomLoiLoc && styles.chipTextActive]}>Tất cả</Text>
            </TouchableOpacity>
            {danhSachNhomLoi.map((nhom) => (
              <TouchableOpacity
                key={nhom}
                style={[styles.chipSmall, nhomLoiLoc === nhom && styles.chipActive]}
                onPress={() => setNhomLoiLoc(nhom)}
              >
                <Text style={[styles.chipText, nhomLoiLoc === nhom && styles.chipTextActive]}>{nhom}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.filterTitleSmall}>Tra cứu lỗi chi tiết đồng bộ với dashboard</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Tìm mã hồ sơ, bệnh nhân, mã luật, nội dung lỗi"
              value={tuKhoaChiTiet}
              onChangeText={setTuKhoaChiTiet}
            />
          </View>
          <View style={styles.chipRow}>
            {[
              { id: 'TAT_CA', label: 'Tất cả' },
              { id: 'XUAT_TOAN', label: 'Xuất toán' },
              { id: 'CANH_BAO', label: 'Cảnh báo' },
              { id: 'NHAC_NHO', label: 'Nhắc nhở' },
            ].map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.chipSmall, loaiChiTietLoc === item.id && styles.chipActive]}
                onPress={() => setLoaiChiTietLoc(item.id)}
              >
                <Text style={[styles.chipText, loaiChiTietLoc === item.id && styles.chipTextActive]}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.rangeLabel}>Khớp {danhSachLoiChiTietTrongKy.length}/{danhSachLoiChiTietRaw.length} lỗi chi tiết trong kỳ</Text>
        </View>

        <View style={styles.kpiGrid}>
          <KpiCard title="Đầu vào: Hồ sơ trong kho" value={tongHop.input.tongHoSoKho} tone="blue" />
          <KpiCard title="Đầu vào: Hồ sơ trong kỳ" value={tongHop.input.tongHoSoTrongKy} tone="violet" />
          <KpiCard title="Đầu ra: Hồ sơ có lỗi" value={tongHop.output.tongHoSoCoLoi} tone="orange" />
          <KpiCard title="Đầu ra: Tổng lỗi" value={tongHop.output.tongLoi} tone="red" />
          <KpiCard title="Tỷ lệ lỗi hồ sơ" value={`${tongHop.output.tyLeLoiHoSo}%`} tone="teal" />
          <KpiCard title="Chi phí ước tính" value={dinhDangTien(tongHop.output.tongChiPhiUocTinh)} tone="green" />
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Nhóm KPI Quản trị chi phí và sử dụng quỹ (Utilization)</Text>
          <Text style={styles.sectionDesc}>
            Tính trên hồ sơ trong kỳ từ XML1 (T_TONGCHI_BV, các T_* thành phần, MA_LOAI_KCB, SO_NGAY_DTRI). Phân loại KCB khớp engine giám định (ngoại trú: 01,02,05–08; đợt nội trú: 03,04,09).
          </Text>
          <View style={styles.kpiGrid}>
            <KpiCard
              title="Chi phí BQ lượt khám ngoại trú"
              value={kpiQuanTri.soLuotNgoaiTru ? dinhDangTien(kpiQuanTri.chiPhiBQLuotKhamNgoaiTru) : '—'}
              tone="violet"
              subtitle={`${kpiQuanTri.soLuotNgoaiTru} lượt`}
            />
            <KpiCard
              title="Chi phí BQ đợt điều trị nội trú"
              value={kpiQuanTri.soDotNoiTru ? dinhDangTien(kpiQuanTri.chiPhiBQDotDieuTriNoiTru) : '—'}
              tone="blue"
              subtitle={`${kpiQuanTri.soDotNoiTru} đợt`}
            />
            <KpiCard
              title="Cường độ dịch vụ (CP/ngày ĐT nội trú)"
              value={kpiQuanTri.cuongDoDichVu.soHoSoNoiTruCoNgay ? dinhDangTien(kpiQuanTri.cuongDoDichVu.chiPhiTrenNgayDieuTriNoiTru) : '—'}
              tone="teal"
              subtitle={
                kpiQuanTri.cuongDoDichVu.soHoSoNoiTruCoNgay
                  ? `${kpiQuanTri.cuongDoDichVu.tongNgayDieuTriNoiTru} ngày ĐT (HS có ngày)`
                  : 'Cần SO_NGAY_DTRI > 0'
              }
            />
            <KpiCard
              title="Tổng chi XML1 trong kỳ"
              value={dinhDangTien(kpiQuanTri.coCauChiPhiThanhPhanTrenTongChi.tong_chi_xml1_ky)}
              tone="green"
              subtitle="Cơ sở % thành phần"
            />
          </View>
          <Text style={styles.subSectionTitle}>Cơ cấu chi phí thành phần (% trên tổng chi XML1 kỳ)</Text>
          <View style={styles.summaryList}>
            <Text style={styles.summaryItem}>
              - Công khám: {kpiQuanTri.coCauChiPhiThanhPhanTrenTongChi.cong_kham}% · Xét nghiệm: {kpiQuanTri.coCauChiPhiThanhPhanTrenTongChi.xet_nghiem}% · CDHA: {kpiQuanTri.coCauChiPhiThanhPhanTrenTongChi.cdha}%
            </Text>
            <Text style={styles.summaryItem}>
              - Thuốc: {kpiQuanTri.coCauChiPhiThanhPhanTrenTongChi.thuoc}% · VTYT: {kpiQuanTri.coCauChiPhiThanhPhanTrenTongChi.vtyt}% · DVKT (khác): {kpiQuanTri.coCauChiPhiThanhPhanTrenTongChi.dvkt_khac}%
            </Text>
            <Text style={styles.summaryItem}>
              - PTTT: {kpiQuanTri.coCauChiPhiThanhPhanTrenTongChi.phau_thuat_thu_thuat}% · Giường: {kpiQuanTri.coCauChiPhiThanhPhanTrenTongChi.giuong}%
            </Text>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Nhóm KPI Hiệu suất vận hành lâm sàng (Clinical Operational)</Text>
          <Text style={styles.sectionDesc}>
            Theo mẫu chỉ số vận hành (ALOS: SUM(SO_NGAY_DTRI)/COUNT đợt nội trú MA_LOAI_KCB 03/09; tái nhập 30 ngày: cặp nội trú liên tiếp cùng MA_BN, khoảng NGAY_VAO sau − NGAY_RA trước ≤ 30 ngày và 3 ký tự đầu MA_BENH_CHINH trùng; chuyển tuyến: MA_LOAI_RV = 2). Tái nhập dùng toàn kho để ghép chuỗi theo bệnh nhân; chỉ ghi nhận lượt tái nhập khi NGAY_VAO thuộc kỳ báo cáo.
          </Text>
          <View style={styles.kpiGrid}>
            <KpiCard
              title="ALOS (ngày ĐT nội trú)"
              value={kpiVanHanh.soDotNoiTruTrongKy ? String(kpiVanHanh.alosNgay) : '—'}
              tone="blue"
              subtitle={
                kpiVanHanh.soDotNoiTruTrongKy
                  ? `${kpiVanHanh.tongNgayDieuTriNoiTruKy} ngày / ${kpiVanHanh.soDotNoiTruTrongKy} đợt`
                  : 'Không có đợt nội trú (03/09) trong kỳ'
              }
            />
            <KpiCard
              title="Tỷ lệ tái nhập 30 ngày"
              value={kpiVanHanh.soDotNoiTruTrongKy ? `${kpiVanHanh.tyLeTaiNhap30PhanTram}%` : '—'}
              tone="orange"
              subtitle={
                kpiVanHanh.soDotNoiTruTrongKy
                  ? `${kpiVanHanh.soLanTaiNhap30TrongKy} lượt / ${kpiVanHanh.soDotNoiTruTrongKy} đợt nội trú kỳ`
                  : 'Mẫu số: đợt nội trú trong kỳ'
              }
            />
            <KpiCard
              title="Tỷ lệ chuyển tuyến"
              value={kpiVanHanh.tongHoSoTrongKy ? `${kpiVanHanh.tyLeChuyenTuyenPhanTram}%` : '—'}
              tone="teal"
              subtitle={
                kpiVanHanh.tongHoSoTrongKy
                  ? `${kpiVanHanh.soHoSoChuyenTuyen} / ${kpiVanHanh.tongHoSoTrongKy} hồ sơ (MA_LOAI_RV = 2)`
                  : 'Không có hồ sơ trong kỳ'
              }
            />
            <KpiCard
              title="Đợt nội trú trong kỳ"
              value={String(kpiVanHanh.soDotNoiTruTrongKy)}
              tone="violet"
              subtitle={`Có SO_NGAY_DTRI > 0: ${kpiVanHanh.soDotNoiTruCoSoNgayDtri}`}
            />
          </View>
        </View>

        <View style={styles.tabRow}>
          {TAB_LIST.map((item) => (
            <TouchableOpacity key={item.id} style={[styles.tab, tab === item.id && styles.tabActive]} onPress={() => setTab(item.id)}>
              <Text style={[styles.tabText, tab === item.id && styles.tabTextActive]}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {dangTai ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color="#0f766e" />
            <Text style={styles.loadingText}>Đang tải dữ liệu báo cáo...</Text>
          </View>
        ) : (
          <>
            {tab === 'TONG_QUAN' && (
              <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Đối soát đầu vào - đầu ra</Text>
                <Text style={styles.sectionDesc}>Độ phủ dữ liệu trong kỳ: {tongHop.input.tyLeQuaTai}% trên tổng kho lưu trữ.</Text>
                <View style={styles.summaryList}>
                  <Text style={styles.summaryItem}>- Số khoa có phát sinh hồ sơ: {tongHop.input.soKhoa}</Text>
                  <Text style={styles.summaryItem}>- Số bác sĩ có phát sinh hồ sơ: {tongHop.input.soBacSi}</Text>
                  <Text style={styles.summaryItem}>- Số quy tắc vi phạm: {tongHop.output.soQuyTacViPham}</Text>
                </View>
              </View>
            )}

            {tab === 'THEO_KHOA' && renderBang(
              [
                { key: 'maKhoa', label: 'Khoa', flex: 1.2 },
                { key: 'tongHoSo', label: 'Tổng hồ sơ' },
                { key: 'hoSoLoi', label: 'Hồ sơ lỗi' },
                { key: 'tongLoi', label: 'Tổng lỗi' },
                { key: 'tyLeLoi', label: 'Tỷ lệ lỗi', render: (r) => `${r.tyLeLoi}%` },
                { key: 'chiPhi', label: 'Chi phí U/T', flex: 1.2, render: (r) => dinhDangTien(r.chiPhi) },
              ],
              tongHop.theoKhoa,
              'khoa'
            )}

            {tab === 'THEO_BAC_SI' && renderBang(
              [
                { key: 'maBacSi', label: 'Bác sĩ', flex: 1.2 },
                { key: 'tongHoSo', label: 'Tổng hồ sơ' },
                { key: 'hoSoLoi', label: 'Hồ sơ lỗi' },
                { key: 'tongLoi', label: 'Tổng lỗi' },
                { key: 'tyLeLoi', label: 'Tỷ lệ lỗi', render: (r) => `${r.tyLeLoi}%` },
                { key: 'chiPhi', label: 'Chi phí U/T', flex: 1.2, render: (r) => dinhDangTien(r.chiPhi) },
              ],
              tongHop.theoBacSi,
              'bacsi'
            )}

            {tab === 'THEO_QUY_TAC' && renderBang(
              [
                { key: 'rule', label: 'Mã quy tắc', flex: 1 },
                { key: 'ten', label: 'Mô tả cảnh báo', flex: 1.6 },
                { key: 'type', label: 'Nhóm' },
                { key: 'tongLoi', label: 'Số lần VP' },
                { key: 'soHoSoAnhHuong', label: 'Số hồ sơ' },
                { key: 'chiPhi', label: 'Chi phí U/T', flex: 1.2, render: (r) => dinhDangTien(r.chiPhi) },
              ],
              tongHop.theoQuyTac,
              'quytac'
            )}

            {tab === 'CHI_TIET_LOI' && renderBang(
              [
                { key: 'ma_lk', label: 'Mã hồ sơ', flex: 0.9 },
                { key: 'ten_bn', label: 'Bệnh nhân', flex: 1.1 },
                { key: 'ma_luat', label: 'Mã luật', flex: 0.9 },
                { key: 'nhan_loai_hien_thi', label: 'Nhóm', flex: 0.8 },
                { key: 'vi_tri_xml', label: 'Vị trí XML', flex: 1.1 },
                { key: 'canh_bao', label: 'Chi tiết lỗi', flex: 2.2 },
                {
                  key: 'hanh_dong',
                  label: 'Thao tác',
                  flex: 1.4,
                  renderAsNode: true,
                  render: (row) => (
                    <View style={styles.actionCellWrap}>
                      <TouchableOpacity style={[styles.actionBtn, styles.actionBtnXml]} onPress={() => moChiTietXmlTheoLoi(row)}>
                        <Text style={styles.actionBtnText}>Mở XML</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.actionBtn, styles.actionBtnEdit]} onPress={() => moSuaXmlTheoLoi(row)}>
                        <Text style={styles.actionBtnText}>Sửa XML</Text>
                      </TouchableOpacity>
                    </View>
                  ),
                },
              ],
              danhSachLoiChiTietTrongKy,
              'chitietloi'
            )}

            {tab === 'XU_HUONG' && (
              <View style={styles.sectionCard}>
                <View style={styles.trendHeader}>
                  <Text style={styles.sectionTitle}>Xu hướng chất lượng theo thời gian</Text>
                  <View style={styles.chipRow}>
                    {[
                      { id: 'NGAY', label: 'Ngày' },
                      { id: 'THANG', label: 'Tháng' },
                      { id: 'QUY', label: 'Quý' },
                    ].map((opt) => (
                      <TouchableOpacity
                        key={opt.id}
                        style={[styles.chipSmall, kieuXuHuong === opt.id && styles.chipActive]}
                        onPress={() => setKieuXuHuong(opt.id)}
                      >
                        <Text style={[styles.chipText, kieuXuHuong === opt.id && styles.chipTextActive]}>{opt.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                <View style={styles.chartWrap}>
                  {tongHop.duLieuXuHuong.length === 0 ? (
                    <Text style={styles.emptyText}>Không có dữ liệu để vẽ biểu đồ xu hướng.</Text>
                  ) : (
                    tongHop.duLieuXuHuong.map((item) => {
                      const maxTyLe = Math.max(...tongHop.duLieuXuHuong.map((x) => x.tyLeLoi), 1);
                      const widthPercent = Math.max(4, Math.round((item.tyLeLoi / maxTyLe) * 100));
                      return (
                        <View key={`bar_${item.ky}`} style={styles.chartRow}>
                          <Text style={styles.chartLabel}>{item.ky}</Text>
                          <View style={styles.chartBarBg}>
                            <View style={[styles.chartBar, { width: `${widthPercent}%` }]} />
                          </View>
                          <Text style={styles.chartValue}>{item.tyLeLoi}%</Text>
                        </View>
                      );
                    })
                  )}
                </View>

                {renderBang(
                  [
                    { key: 'ky', label: 'Kỳ báo cáo', flex: 1.3 },
                    { key: 'tongHoSo', label: 'Tổng hồ sơ' },
                    { key: 'hoSoCoLoi', label: 'Hồ sơ lỗi' },
                    { key: 'tongLoi', label: 'Tổng lỗi' },
                    { key: 'tyLeLoi', label: 'Tỷ lệ lỗi', render: (r) => `${r.tyLeLoi}%` },
                  ],
                  tongHop.duLieuXuHuong,
                  'trend'
                )}
              </View>
            )}
          </>
        )}

        <TouchableOpacity style={styles.exportBtn} onPress={xuatExcel}>
          <Text style={styles.exportText}>Xuất báo cáo tổng hợp (Excel)</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function KpiCard({ title, value, tone, subtitle }) {
  return (
    <View style={[styles.kpiCard, styles[`kpi_${tone}`]]}>
      <Text style={styles.kpiTitle}>{title}</Text>
      <Text style={styles.kpiValue}>{value}</Text>
      {subtitle ? <Text style={styles.kpiSubtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6fb' },
  hero: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 14,
    backgroundColor: '#0f172a',
  },
  heroTitle: { color: '#f8fafc', fontSize: 22, fontWeight: '800' },
  heroSub: { color: '#cbd5e1', marginTop: 6, lineHeight: 20 },
  content: { padding: 16, paddingBottom: 26 },

  filterCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#dbe1ea',
  },
  filterTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a', marginBottom: 10 },
  filterTitleSmall: { fontSize: 14, fontWeight: '700', color: '#0f172a', marginTop: 12, marginBottom: 8 },
  rangeLabel: { fontSize: 13, color: '#334155', marginTop: 10 },
  warnText: { marginTop: 6, color: '#b91c1c', fontWeight: '600' },

  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#eff3f9',
  },
  chipSmall: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    backgroundColor: '#eff3f9',
  },
  chipActive: { backgroundColor: '#0f766e' },
  chipText: { color: '#475569', fontWeight: '600', fontSize: 12 },
  chipTextActive: { color: '#f8fafc' },

  inputRow: { flexDirection: 'row', gap: 10, marginTop: 10 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },

  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 },
  kpiCard: {
    width: '48%',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    minHeight: 84,
    justifyContent: 'space-between',
  },
  kpiTitle: { color: '#334155', fontSize: 12, fontWeight: '600' },
  kpiValue: { color: '#0f172a', fontSize: 18, fontWeight: '800' },
  kpi_blue: { backgroundColor: '#e0f2fe' },
  kpi_violet: { backgroundColor: '#ede9fe' },
  kpi_orange: { backgroundColor: '#ffedd5' },
  kpi_red: { backgroundColor: '#fee2e2' },
  kpi_teal: { backgroundColor: '#ccfbf1' },
  kpi_green: { backgroundColor: '#dcfce7' },

  tabRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  tab: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 10,
  },
  tabActive: { backgroundColor: '#1d4ed8' },
  tabText: { color: '#334155', fontWeight: '700', fontSize: 12 },
  tabTextActive: { color: '#ffffff' },

  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#dbe1ea',
    marginBottom: 12,
  },
  sectionTitle: { color: '#0f172a', fontWeight: '800', fontSize: 16 },
  sectionDesc: { color: '#334155', marginTop: 8 },
  subSectionTitle: { color: '#0f172a', fontWeight: '700', fontSize: 14, marginTop: 14 },
  summaryList: { marginTop: 10, gap: 4 },
  summaryItem: { color: '#334155' },
  kpiSubtitle: { color: '#475569', fontSize: 11, marginTop: 6, fontWeight: '600' },

  tableWrap: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#dbe1ea',
    marginBottom: 12,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#0f172a',
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  th: { color: '#f8fafc', fontWeight: '700', fontSize: 12, paddingHorizontal: 4 },
  tableRow: { flexDirection: 'row', paddingVertical: 10, paddingHorizontal: 8 },
  tableRowAlt: { backgroundColor: '#f8fafc' },
  td: { color: '#1e293b', fontSize: 12, paddingHorizontal: 4 },
  td_node_wrap: { paddingHorizontal: 4, justifyContent: 'center' },
  actionCellWrap: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', alignItems: 'center' },
  actionBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    ...Platform.select({ web: { cursor: 'pointer' } }),
  },
  actionBtnXml: { backgroundColor: '#DBEAFE', borderColor: '#93C5FD' },
  actionBtnEdit: { backgroundColor: '#FCE7F3', borderColor: '#F9A8D4' },
  actionBtnText: { color: '#0F172A', fontWeight: '700', fontSize: 11 },

  trendHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 8 },
  chartWrap: {
    marginTop: 6,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: 10,
    gap: 8,
  },
  chartRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  chartLabel: { width: 86, color: '#334155', fontSize: 12 },
  chartBarBg: { flex: 1, height: 12, backgroundColor: '#e2e8f0', borderRadius: 999, overflow: 'hidden' },
  chartBar: { height: '100%', backgroundColor: '#1d4ed8', borderRadius: 999 },
  chartValue: { width: 52, textAlign: 'right', color: '#0f172a', fontWeight: '700', fontSize: 12 },

  loadingWrap: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#dbe1ea',
    paddingVertical: 30,
    alignItems: 'center',
    gap: 10,
  },
  loadingText: { color: '#334155' },
  emptyText: { color: '#64748b', fontStyle: 'italic', padding: 12 },

  exportBtn: {
    marginTop: 6,
    backgroundColor: '#0f766e',
    borderRadius: 12,
    alignItems: 'center',
    paddingVertical: 14,
  },
  exportText: { color: '#f8fafc', fontWeight: '800', letterSpacing: 0.3 },
});
