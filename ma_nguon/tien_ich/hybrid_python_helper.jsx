import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { AppState, Platform } from 'react-native';
import {
  auditClaimsBangPythonService,
  healthCheckPythonService,
  pythonServiceConfig,
} from '../dich_vu/python_service_api';
import { docMangDanhMucTuStorage } from './luu_tru_danh_muc';

const KHOA_CHE_DO_GIAM_DINH = 'CDSS_AUDIT_ENGINE_MODE';

export const CHE_DO_GIAM_DINH = {
  LOCAL: 'local_js',
  PYTHON: 'python_service',
};

export const TRANG_THAI_PYTHON = {
  DANG_KIEM_TRA: 'checking',
  SAN_SANG: 'online',
  KHONG_KHA_DUNG: 'offline',
};

export const TRANG_THAI_SMOKE_TEST = {
  CHUA_CHAY: 'idle',
  DANG_CHAY: 'running',
  THANH_CONG: 'pass',
  THAT_BAI: 'fail',
};

const laMoiTruongWeb = () => Platform.OS === 'web' && typeof window !== 'undefined' && !!window.localStorage;

const docGiaTriCauHinh = async (key) => {
  if (laMoiTruongWeb()) {
    try {
      const localValue = window.localStorage.getItem(key);
      if (localValue) return String(localValue || '');
    } catch {
      // ignore localStorage read errors
    }
  }

  const asyncValue = await AsyncStorage.getItem(key).catch(() => '');
  return String(asyncValue || '');
};

const ghiGiaTriCauHinh = async (key, value) => {
  const normalizedValue = String(value || '');
  const tasks = [AsyncStorage.setItem(key, normalizedValue).catch(() => {})];

  if (laMoiTruongWeb()) {
    tasks.push((async () => {
      try {
        window.localStorage.setItem(key, normalizedValue);
      } catch {
        // ignore localStorage write errors
      }
    })());
  }

  await Promise.all(tasks);
};

export const docCheDoGiamDinh = async () => {
  const raw = await docGiaTriCauHinh(KHOA_CHE_DO_GIAM_DINH);
  return raw === CHE_DO_GIAM_DINH.PYTHON ? CHE_DO_GIAM_DINH.PYTHON : CHE_DO_GIAM_DINH.LOCAL;
};

export const luuCheDoGiamDinh = async (cheDo) => {
  const normalizedMode = cheDo === CHE_DO_GIAM_DINH.PYTHON ? CHE_DO_GIAM_DINH.PYTHON : CHE_DO_GIAM_DINH.LOCAL;
  await ghiGiaTriCauHinh(KHOA_CHE_DO_GIAM_DINH, normalizedMode);
  return normalizedMode;
};

export const layNhanTrangThaiPython = (trangThai) => {
  if (trangThai === TRANG_THAI_PYTHON.SAN_SANG) return 'Python service sẵn sàng';
  if (trangThai === TRANG_THAI_PYTHON.DANG_KIEM_TRA) return 'Đang kiểm tra Python service...';
  return 'Python service chưa kết nối';
};

const layGiaTriAnToan = (obj, tuKhoa) => {
  if (!obj) return 'N/A';
  const tuKhoaChuan = String(tuKhoa || '').toLowerCase().replace(/_/g, '');
  const keyTimThay = Object.keys(obj).find((key) => key.toLowerCase().replace(/_/g, '') === tuKhoaChuan);
  return keyTimThay && obj[keyTimThay] ? obj[keyTimThay] : 'N/A';
};

const chuanHoaMaLoaiKcb = (value) => {
  const raw = String(value ?? '').trim();
  if (!raw) return '';
  const digits = raw.replace(/\D/g, '');
  return digits ? digits.padStart(2, '0') : raw;
};

const chuanHoaKhongDau = (value) => String(value || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toUpperCase()
  .trim();

const trichXuatDmKhamRuntime = (rows = []) => Array.from(new Set(
  (Array.isArray(rows) ? rows : [])
    .map((item) => String(item?.['MÃ KHÁM'] || item?.MA_KHAM || item?.MA_DV || '').trim())
    .filter(Boolean)
));

const trichXuatDmCongKhamNoiBoRuntime = (rows = []) => Array.from(new Set(
  (Array.isArray(rows) ? rows : [])
    .filter((item) => {
      const maDv = String(item?.MA_DICH_VU || item?.MA_DV || '').trim();
      const tenDv = chuanHoaKhongDau(item?.TEN_DICH_VU || item?.TEN_DVKT_GIA || '');
      return Boolean(maDv) && tenDv.includes('KHAM');
    })
    .map((item) => String(item?.MA_DICH_VU || item?.MA_DV || '').trim())
    .filter(Boolean)
));

const trichXuatMaKhoaKhamRuntime = (rows = []) => Array.from(new Set(
  (Array.isArray(rows) ? rows : [])
    .filter((item) => chuanHoaMaLoaiKcb(item?.MA_LOAI_KCB) === '01')
    .filter((item) => chuanHoaKhongDau(item?.TEN_KHOA || '').includes('KHAM'))
    .map((item) => String(item?.MA_KHOA || '').trim())
    .filter(Boolean)
));

export const taiDanhMucRuntimeChoPython = async () => {
  try {
    const [rowsPl2Kham, rowsDvktM05, rowsKhoaM01] = await Promise.all([
      docMangDanhMucTuStorage('BYT_7603_PL2_KHAM'),
      docMangDanhMucTuStorage('DANH_MUC_DVKT_M05'),
      docMangDanhMucTuStorage('DANH_MUC_KHOA_LS_M01'),
    ]);

    const dmKhamByt = trichXuatDmKhamRuntime(rowsPl2Kham);
    const dmCongKhamNoiBo = trichXuatDmCongKhamNoiBoRuntime(rowsDvktM05);
    const maKhoaKham = trichXuatMaKhoaKhamRuntime(rowsKhoaM01);

    return {
      dmKhamTongHop: Array.from(new Set([...dmKhamByt, ...dmCongKhamNoiBo])),
      maKhoaKham,
      soLuongDmKhamRuntime: dmKhamByt.length,
      soLuongDmCongKhamNoiBoRuntime: dmCongKhamNoiBo.length,
      soLuongMaKhoaKhamRuntime: maKhoaKham.length,
    };
  } catch {
    return {
      dmKhamTongHop: [],
      maKhoaKham: [],
      soLuongDmKhamRuntime: 0,
      soLuongDmCongKhamNoiBoRuntime: 0,
      soLuongMaKhoaKhamRuntime: 0,
    };
  }
};

/** Kết quả kiểm tra / warm-up gần nhất (để UI đọc nhanh). */
let trangThaiPythonGanNhat = null;

export const layTrangThaiPythonGanNhat = () => trangThaiPythonGanNhat;

const layExtraPythonService = () => (
  Constants.expoConfig?.extra
  || Constants.manifest2?.extra
  || Constants.manifest?.extra
  || {}
);

/** `expo.extra.pythonService.enabled !== false` — mặc định bật. */
export const laPythonServiceBatTrongCauHinh = () => layExtraPythonService()?.pythonService?.enabled !== false;

let thoiDiemKetNoiPythonGanNhat = 0;

const coTheThuKetNoiPythonLaiNgay = (debounceMs = 5000) => {
  const now = Date.now();
  if (now - thoiDiemKetNoiPythonGanNhat < debounceMs) return false;
  thoiDiemKetNoiPythonGanNhat = now;
  return true;
};

const hoan = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Gọi một lần sau khi ứng dụng khởi động (toàn cục). Không phụ thuộc internet:
 * Python thường là localhost/LAN — vẫn kiểm tra được khi "offline" với mạng ngoài.
 * Tôn trọng `expo.extra.pythonService.enabled === false`.
 */
export const kichHoatKetNoiPythonSauKhoiDongUngDung = async (options = {}) => {
  if (!laPythonServiceBatTrongCauHinh()) {
    return {
      ok: false,
      skipped: true,
      trangThai: TRANG_THAI_PYTHON.KHONG_KHA_DUNG,
      chiTiet: 'Python service đã tắt trong cấu hình (expo.extra.pythonService.enabled = false).',
      baseUrl: pythonServiceConfig().baseUrl || '',
      soLanThu: 0,
    };
  }
  thoiDiemKetNoiPythonGanNhat = Date.now();
  return ketNoiPythonServiceLucKhoiDong({
    ...options,
  });
};

/**
 * Đăng ký làm mới kết nối khi:
 * - App chuyển lại foreground (offline/online đều thử — LAN/local vẫn chạy).
 * - Web: sự kiện `window.online` (mạng ngoài trở lại — hữu ích khi baseUrl là IP LAN).
 * Trả về hàm hủy đăng ký.
 */
export const dangKyTuDongKetNoiLaiPythonKhiMangHoacPhien = () => {
  if (!laPythonServiceBatTrongCauHinh()) {
    return () => {};
  }

  const thuLai = async () => {
    if (!coTheThuKetNoiPythonLaiNgay(6000)) return;
    await ketNoiPythonServiceLucKhoiDong(
      Platform.OS === 'web'
        ? { maxAttempts: 1, delaysMs: [0] }
        : { maxAttempts: 3, delaysMs: [0, 500, 1600] },
    ).catch(() => {});
  };

  const sub = AppState.addEventListener('change', (next) => {
    if (next === 'active') thuLai();
  });

  const unsubs = [() => sub.remove()];

  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const onOnline = () => thuLai();
    window.addEventListener('online', onOnline);
    unsubs.push(() => window.removeEventListener('online', onOnline));
  }

  return () => {
    unsubs.forEach((u) => {
      try {
        u();
      } catch {
        /* ignore */
      }
    });
  };
};

/** Gộp các lần gọi song song tới cùng một chuỗi /health (giảm spam console web khi nhiều màn hình warm-up). */
let ketNoiPythonDangChay = null;

/**
 * Thử kết nối Python nhiều lần (lần 1 ngay; các lần sau chờ thêm để service cold-start / mạng ổn định).
 * Không phụ thuộc navigator.onLine — máy offline vẫn có thể tới 127.0.0.1 / 10.0.2.2.
 * Trên web mặc định ít lần thử hơn (mỗi lần thất bại browser hay log ERR_CONNECTION_REFUSED).
 */
export const ketNoiPythonServiceLucKhoiDong = async (options = {}) => {
  if (ketNoiPythonDangChay) {
    return ketNoiPythonDangChay;
  }
  ketNoiPythonDangChay = (async () => {
    try {
      const cfg = pythonServiceConfig();
      const laWeb = Platform.OS === 'web';
      const maxAttempts = Number(options.maxAttempts) > 0
        ? Number(options.maxAttempts)
        : (laWeb ? 2 : 4);
      const delaysMs = Array.isArray(options.delaysMs)
        ? options.delaysMs
        : (laWeb ? [0, 900] : [0, 400, 1200, 2800]);
      const healthTimeoutMs = Number.isFinite(options.healthTimeoutMs) && options.healthTimeoutMs > 0
        ? options.healthTimeoutMs
        : cfg.healthTimeoutMs;

      let last = null;
      for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
        if (attempt > 0) {
          await hoan(delaysMs[attempt] ?? 1500 * attempt);
        }
        last = await kiemTraPythonServiceSanSang({ healthTimeoutMs });
        if (last.ok) {
          trangThaiPythonGanNhat = { ...last, soLanThu: attempt + 1 };
          return { ...last, soLanThu: attempt + 1 };
        }
      }
      trangThaiPythonGanNhat = { ...last, soLanThu: maxAttempts };
      return { ...last, soLanThu: maxAttempts };
    } finally {
      ketNoiPythonDangChay = null;
    }
  })();

  return ketNoiPythonDangChay;
};

export const kiemTraPythonServiceSanSang = async (options = {}) => {
  try {
    const healthTimeoutMs = Number.isFinite(options.healthTimeoutMs) && options.healthTimeoutMs > 0
      ? options.healthTimeoutMs
      : pythonServiceConfig().healthTimeoutMs;
    const response = await healthCheckPythonService({ timeoutMs: healthTimeoutMs });
    const ketQua = {
      ok: true,
      trangThai: TRANG_THAI_PYTHON.SAN_SANG,
      chiTiet: `Kết nối thành công${response?.timestamp ? ` · ${response.timestamp}` : ''}`,
      baseUrl: pythonServiceConfig().baseUrl || '',
      response,
    };
    trangThaiPythonGanNhat = ketQua;
    return ketQua;
  } catch (error) {
    const ketQua = {
      ok: false,
      trangThai: TRANG_THAI_PYTHON.KHONG_KHA_DUNG,
      chiTiet: error?.message || 'Không thể kết nối Python service.',
      baseUrl: pythonServiceConfig().baseUrl || '',
      response: null,
    };
    trangThaiPythonGanNhat = ketQua;
    return ketQua;
  }
};

export const thongKeHybridDashboard = (danhSachHoSo = []) => {
  const summary = {
    soHoSoPython: 0,
    soHoSoCoveragePartial: 0,
    soCanhBaoPython: 0,
    soCanhBaoJs: 0,
    soHoSoDungDmKhamRuntime: 0,
    soHoSoDungDmKhamHeuristic: 0,
    tapRulePython: new Set(),
    thongKeRulePython: {},
    thongKeRuleJs: {},
    thoiDiemMoiNhat: '',
  };

  (Array.isArray(danhSachHoSo) ? danhSachHoSo : []).forEach((hoSo) => {
    const auditMeta = hoSo?.python_service_audit || null;
    const pythonMeta = hoSo?.python_service_meta || null;
    const coPython = Boolean(auditMeta || pythonMeta);
    if (coPython) summary.soHoSoPython += 1;
    if ((auditMeta?.coverage?.mode || pythonMeta?.coverage) === 'partial') {
      summary.soHoSoCoveragePartial += 1;
    }

    const supportedRules = auditMeta?.supported_rules || pythonMeta?.supported_rules || [];
    supportedRules.forEach((maLuat) => summary.tapRulePython.add(maLuat));

    const dmKhamSource = auditMeta?.coverage?.dm_kham_source || '';
    if (dmKhamSource === 'request_options') summary.soHoSoDungDmKhamRuntime += 1;
    if (dmKhamSource === 'python_fallback_heuristic') summary.soHoSoDungDmKhamHeuristic += 1;

    const timestamp = auditMeta?.timestamp || pythonMeta?.timestamp || '';
    if (timestamp && (!summary.thoiDiemMoiNhat || timestamp > summary.thoiDiemMoiNhat)) {
      summary.thoiDiemMoiNhat = timestamp;
    }

    const dsLoi = Array.isArray(hoSo?.ket_qua_giam_dinh) ? hoSo.ket_qua_giam_dinh : [];
    dsLoi.forEach((loi) => {
      if (String(loi?.nguon_giam_dinh || '').trim().toUpperCase() === 'PYTHON_SERVICE') {
        summary.soCanhBaoPython += 1;
        const maLuat = String(layGiaTriAnToan(loi, 'ma_luat') || 'N/A');
        if (!summary.thongKeRulePython[maLuat]) {
          summary.thongKeRulePython[maLuat] = {
            ma_luat: maLuat,
            ten_quy_tac: String(layGiaTriAnToan(loi, 'ten_quy_tac') || 'N/A'),
            sl: 0,
          };
        }
        summary.thongKeRulePython[maLuat].sl += 1;
      } else {
        summary.soCanhBaoJs += 1;
        const maLuat = String(layGiaTriAnToan(loi, 'ma_luat') || 'N/A');
        if (!summary.thongKeRuleJs[maLuat]) {
          summary.thongKeRuleJs[maLuat] = {
            ma_luat: maLuat,
            ten_quy_tac: String(layGiaTriAnToan(loi, 'ten_quy_tac') || 'N/A'),
            sl: 0,
          };
        }
        summary.thongKeRuleJs[maLuat].sl += 1;
      }
    });
  });

  return {
    ...summary,
    danhSachRulePython: Array.from(summary.tapRulePython).sort(),
    danhSachThongKeRulePython: Object.values(summary.thongKeRulePython).sort((a, b) => b.sl - a.sl),
    danhSachThongKeRuleJs: Object.values(summary.thongKeRuleJs).sort((a, b) => b.sl - a.sl),
    danhSachThongKeRuleJsNgoaiCoveragePython: Object.values(summary.thongKeRuleJs)
      .filter((item) => !summary.tapRulePython.has(item.ma_luat))
      .sort((a, b) => b.sl - a.sl),
  };
};

export const chaySmokeTestPythonService = async () => {
  const ketQuaKiemTra = await ketNoiPythonServiceLucKhoiDong();
  if (!ketQuaKiemTra.ok) {
    throw new Error(
      `Không thể kết nối Python (${ketQuaKiemTra.baseUrl || 'N/A'}) sau ${ketQuaKiemTra.soLanThu || '?'} lần thử: ${ketQuaKiemTra.chiTiet || ''}`,
    );
  }

  const runtime = await taiDanhMucRuntimeChoPython();
  const maDvSmoke = runtime.dmKhamTongHop[0] || '01.0001.0001';
  const maKhoaKhamMacDinh = runtime.maKhoaKham[0] || 'K01';
  const danhSachSmokeTest = [
    {
      ma_lk: 'SMOKE_IP_001',
      ky_vong: ['CK_55', 'CK_57'],
      xml1: {
        MA_LK: 'SMOKE_IP_001',
        MA_BN: 'BN_SMOKE_IP_001',
        MA_CSKCB: '92001',
        NGAY_VAO: '202604051000',
        NGAY_RA: '202604051130',
        MA_LOAI_KCB: '03',
        MA_KHOA_VAO: maKhoaKhamMacDinh === 'K19' ? 'K03' : 'K19',
        MA_LY_DO_VV: '2',
      },
      xml3: [{
        MA_DV: maDvSmoke,
        TEN_DICH_VU: 'Khám bệnh smoke test nội trú',
        DON_GIA: 50000,
        THANH_TIEN: 50000,
        STT: 1,
        NGAY_YL: '202604051030',
        MA_KHOA: 'K19',
      }],
    },
    {
      ma_lk: 'SMOKE_OP_001',
      ky_vong: ['CK_42'],
      xml1: {
        MA_LK: 'SMOKE_OP_001',
        MA_BN: 'BN_SMOKE_OP_001',
        MA_CSKCB: '92001',
        NGAY_VAO: '202604050800',
        NGAY_RA: '202604070900',
        MA_LOAI_KCB: '01',
        MA_KHOA_VAO: maKhoaKhamMacDinh,
        MA_LY_DO_VV: '2',
      },
      xml3: [{
        MA_DV: maDvSmoke,
        TEN_DICH_VU: 'Khám bệnh smoke test ngoại trú',
        DON_GIA: 50000,
        THANH_TIEN: 50000,
        STT: 1,
        NGAY_YL: '202604050830',
        MA_KHOA: maKhoaKhamMacDinh,
      }],
    },
    {
      ma_lk: 'SMOKE_DAY_001',
      ky_vong: ['CK_09'],
      xml1: {
        MA_LK: 'SMOKE_DAY_001',
        MA_BN: 'BN_SMOKE_DAY_001',
        MA_CSKCB: '92001',
        NGAY_VAO: '202604051000',
        NGAY_RA: '202604051600',
        MA_LOAI_KCB: '04',
        MA_KHOA_VAO: maKhoaKhamMacDinh,
        MA_LY_DO_VV: '2',
      },
      xml3: [{
        MA_DV: maDvSmoke,
        TEN_DICH_VU: 'Khám bệnh smoke test nội trú ban ngày 1',
        DON_GIA: 50000,
        THANH_TIEN: 50000,
        STT: 1,
        NGAY_YL: '202604051030',
        MA_KHOA: maKhoaKhamMacDinh,
      }, {
        MA_DV: maDvSmoke,
        TEN_DICH_VU: 'Khám bệnh smoke test nội trú ban ngày 2',
        DON_GIA: 50000,
        THANH_TIEN: 15000,
        STT: 2,
        NGAY_YL: '202604051130',
        MA_KHOA: maKhoaKhamMacDinh,
      }],
    },
  ];

  const ketQuaPython = await auditClaimsBangPythonService({
    claims: danhSachSmokeTest,
    options: {
      source: 'helper_smoke_test',
      mode: 'batch_audit',
      expect_compatible_claim_results: true,
      dm_kham: runtime.dmKhamTongHop.length > 0 ? runtime.dmKhamTongHop : [maDvSmoke],
      ma_khoa_kham: runtime.maKhoaKham.length > 0 ? runtime.maKhoaKham : [maKhoaKhamMacDinh],
    },
  });

  const ketQuaTheoHoSo = new Map(
    (Array.isArray(ketQuaPython?.claims) ? ketQuaPython.claims : []).map((item) => [String(item?.ma_lk || item?.xml1?.MA_LK || ''), item])
  );
  const thongTinCase = danhSachSmokeTest.map((item) => {
    const hoSo = ketQuaTheoHoSo.get(item.ma_lk);
    const dsRule = Array.from(new Set(
      (Array.isArray(hoSo?.ket_qua_giam_dinh) ? hoSo.ket_qua_giam_dinh : []).map((canhBao) => canhBao?.ma_luat).filter(Boolean)
    ));
    const thieuRule = item.ky_vong.filter((rule) => !dsRule.includes(rule));
    return {
      ma_lk: item.ma_lk,
      dsRule,
      thieuRule,
    };
  });

  const caseThatBai = thongTinCase.filter((item) => item.thieuRule.length > 0);
  if (caseThatBai.length > 0) {
    throw new Error(`Smoke test thiếu rule kỳ vọng: ${caseThatBai.map((item) => `${item.ma_lk} -> ${item.thieuRule.join(', ')}`).join(' | ')}`);
  }

  return {
    thongBao: `Smoke test PASS · ${thongTinCase.length}/${thongTinCase.length} ca · ${thongTinCase.map((item) => `${item.ma_lk}: ${item.dsRule.join(', ')}`).join(' | ')}`,
    runtime,
    thongTinCase,
    ketQuaPython,
  };
};