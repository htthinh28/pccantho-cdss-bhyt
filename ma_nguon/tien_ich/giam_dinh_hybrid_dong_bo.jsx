/**
 * Trung tâm hybrid bắt buộc: engine JS (V15) luôn chạy; lớp Python (FastAPI) hợp nhất khi cấu hình + kết nối OK.
 * Dùng chung: Dashboard, chi tiết ca bệnh, QA/CLI (kèm stub expo-constants khi bundle Node).
 */
import { auditClaimsBangPythonService } from '../dich_vu/python_service_api';
import {
  CHE_DO_GIAM_DINH,
  docCheDoGiamDinh,
  ketNoiPythonServiceLucKhoiDong,
  laPythonServiceBatTrongCauHinh,
  taiDanhMucRuntimeChoPython,
} from './hybrid_python_helper';
import {
  chayGiamDinhNhieuHoSoV15,
  gomTrungLapCanhBaoTheoMaLuatVaNoiDung,
} from './dong_co_giam_dinh';

export const chuanHoaMaLkChoHybrid = (giaTri) => String(giaTri || '').trim();

const laCanhBaoPythonService = (canhBao = {}) => String(canhBao?.nguon_giam_dinh || '').trim().toUpperCase() === 'PYTHON_SERVICE';

const taoKhoaCanhBao = (canhBao = {}) => [
  String(canhBao?.ma_luat || ''),
  String(canhBao?.phan_he || ''),
  String(canhBao?.truong_loi || ''),
  String(canhBao?.index ?? -1),
  String(canhBao?.canh_bao || ''),
].join('|');

export const hopNhatKetQuaGiamDinh = (danhSachJs = [], danhSachPython = []) => {
  const mapCanhBao = new Map();
  [...(Array.isArray(danhSachJs) ? danhSachJs : []), ...(Array.isArray(danhSachPython) ? danhSachPython : [])].forEach((item) => {
    mapCanhBao.set(taoKhoaCanhBao(item), item);
  });
  return gomTrungLapCanhBaoTheoMaLuatVaNoiDung(Array.from(mapCanhBao.values()));
};

const taoMetaAuditPython = (hoSoPython = {}, ketQuaPython = {}) => {
  const metaCoSan = hoSoPython?.python_service_meta || {};
  const coverage = ketQuaPython?.coverage || {};
  const dsCanhBao = Array.isArray(hoSoPython?.ket_qua_giam_dinh) ? hoSoPython.ket_qua_giam_dinh : [];

  return {
    engine: ketQuaPython?.engine || metaCoSan?.engine || 'python-fastapi',
    timestamp: ketQuaPython?.timestamp || metaCoSan?.timestamp || new Date().toISOString(),
    coverage,
    supported_rules: coverage?.supported_rules || metaCoSan?.supported_rules || [],
    dm_kham_runtime_count: coverage?.dm_kham_runtime_count ?? metaCoSan?.dm_kham_runtime_count ?? 0,
    ma_khoa_kham_count: coverage?.ma_khoa_kham_count ?? metaCoSan?.ma_khoa_kham_count ?? 0,
    python_warning_count: dsCanhBao.filter(laCanhBaoPythonService).length,
  };
};

export const ganMetaPythonServiceVaoHoSo = (danhSachHoSo = [], ketQuaPython = {}) => {
  return (Array.isArray(danhSachHoSo) ? danhSachHoSo : []).map((hoSo) => ({
    ...hoSo,
    python_service_audit: taoMetaAuditPython(hoSo, ketQuaPython),
    python_service_meta: {
      ...(hoSo?.python_service_meta || {}),
      ...(ketQuaPython?.coverage || {}),
      engine: ketQuaPython?.engine || hoSo?.python_service_meta?.engine || 'python-fastapi',
      timestamp: ketQuaPython?.timestamp || hoSo?.python_service_meta?.timestamp || new Date().toISOString(),
      supported_rules: ketQuaPython?.coverage?.supported_rules || hoSo?.python_service_meta?.supported_rules || [],
      python_warning_count: Array.isArray(hoSo?.ket_qua_giam_dinh)
        ? hoSo.ket_qua_giam_dinh.filter(laCanhBaoPythonService).length
        : 0,
    },
  }));
};

export const layDanhSachKetQuaTuPythonService = (ketQuaPython, danhSachMacDinh = []) => {
  const claims = Array.isArray(ketQuaPython?.claims) ? ketQuaPython.claims : [];
  if (claims.length === 0) return null;

  const chuanHoaMa = chuanHoaMaLkChoHybrid;
  const mapTheoMaLK = new Map(
    claims.map((item) => [chuanHoaMa(item?.ma_lk || item?.xml1?.MA_LK || item?.XML1?.MA_LK), item])
  );
  const tapDaGhep = new Set();
  let soHoSoKhop = 0;

  const danhSachDaGhep = (Array.isArray(danhSachMacDinh) ? danhSachMacDinh : []).map((hoSo) => {
    const maLK = chuanHoaMa(hoSo?.ma_lk || hoSo?.xml1?.MA_LK || hoSo?.XML1?.MA_LK);
    const hoSoPython = mapTheoMaLK.get(maLK);
    if (!hoSoPython) return hoSo;

    soHoSoKhop += 1;
    tapDaGhep.add(maLK);
    return {
      ...hoSo,
      ...hoSoPython,
      ma_lk: maLK || hoSoPython?.ma_lk || hoSo?.ma_lk,
      ket_qua_giam_dinh: Array.isArray(hoSoPython?.ket_qua_giam_dinh)
        ? hoSoPython.ket_qua_giam_dinh
        : (Array.isArray(hoSo?.ket_qua_giam_dinh) ? hoSo.ket_qua_giam_dinh : []),
    };
  });

  const danhSachBoSung = claims.filter((item) => !tapDaGhep.has(chuanHoaMa(item?.ma_lk || item?.xml1?.MA_LK || item?.XML1?.MA_LK)));
  const ketQua = [...danhSachDaGhep, ...danhSachBoSung];
  return soHoSoKhop > 0 || danhSachBoSung.length > 0 ? ketQua : null;
};

export const hopNhatDanhSachHoSoTuJsVaPython = (danhSachJs = [], danhSachPython = []) => {
  const chuanHoaMa = chuanHoaMaLkChoHybrid;
  const mapPython = new Map(
    (Array.isArray(danhSachPython) ? danhSachPython : []).map((item) => [chuanHoaMa(item?.ma_lk || item?.xml1?.MA_LK || item?.XML1?.MA_LK), item])
  );
  const tapDaGhep = new Set();

  const danhSachHopNhat = (Array.isArray(danhSachJs) ? danhSachJs : []).map((hoSoJs) => {
    const maLK = chuanHoaMa(hoSoJs?.ma_lk || hoSoJs?.xml1?.MA_LK || hoSoJs?.XML1?.MA_LK);
    const hoSoPython = mapPython.get(maLK);
    if (!hoSoPython) return hoSoJs;

    tapDaGhep.add(maLK);
    return {
      ...hoSoJs,
      ...hoSoPython,
      ma_lk: maLK || hoSoJs?.ma_lk || hoSoPython?.ma_lk,
      ket_qua_giam_dinh: hopNhatKetQuaGiamDinh(hoSoJs?.ket_qua_giam_dinh, hoSoPython?.ket_qua_giam_dinh),
      python_service_audit: hoSoPython?.python_service_audit || hoSoJs?.python_service_audit,
      python_service_meta: hoSoPython?.python_service_meta || hoSoJs?.python_service_meta,
    };
  });

  const danhSachConLai = (Array.isArray(danhSachPython) ? danhSachPython : []).filter((hoSoPython) => {
    const maLK = chuanHoaMa(hoSoPython?.ma_lk || hoSoPython?.xml1?.MA_LK || hoSoPython?.XML1?.MA_LK);
    return !tapDaGhep.has(maLK);
  });

  return [...danhSachHopNhat, ...danhSachConLai];
};

const macDinhChoUICapNhat = async () => {};

/**
 * @param {object[]} danhSachDaCoKetQua
 * @param {object} [options]
 * @param {string} [options.cheDoGiamDinh] — `CHE_DO_GIAM_DINH.*` hoặc để trống để `docCheDoGiamDinh()`
 * @param {(s: string) => void} [options.setThongBaoDangTai]
 * @param {() => Promise<void>} [options.choUICapNhat]
 * @param {Function} [options.tuyChonChayGiamDinhNhieuHoSoV15] — inject khi test
 */
export const chayGiamDinhNhieuHoSoHybridDongBo = async (danhSachDaCoKetQua = [], options = {}) => {
  const setThongBaoDangTai = typeof options.setThongBaoDangTai === 'function' ? options.setThongBaoDangTai : () => {};
  const choUICapNhat = typeof options.choUICapNhat === 'function' ? options.choUICapNhat : macDinhChoUICapNhat;
  const cheDoGiamDinh = options.cheDoGiamDinh != null
    ? options.cheDoGiamDinh
    : (await docCheDoGiamDinh().catch(() => CHE_DO_GIAM_DINH.LOCAL));
  const chayNhieuHoSoV15 = options.tuyChonChayGiamDinhNhieuHoSoV15 || chayGiamDinhNhieuHoSoV15;

  let daFallbackTuPythonSangJs = false;
  let daHopNhatPythonVaJs = false;
  let lopPythonDeHopNhat = null;

  if (laPythonServiceBatTrongCauHinh()) {
    if (cheDoGiamDinh === CHE_DO_GIAM_DINH.PYTHON) {
      setThongBaoDangTai('Đang kết nối Python service (lớp hybrid)...');
      await choUICapNhat();
    } else {
      setThongBaoDangTai('Đang thử lớp Python khi cấu hình bật (hybrid cùng JS)...');
      await choUICapNhat();
    }

    const ketQuaKiemTraPython = await ketNoiPythonServiceLucKhoiDong();
    if (!ketQuaKiemTraPython.ok) {
      if (cheDoGiamDinh === CHE_DO_GIAM_DINH.PYTHON) {
        daFallbackTuPythonSangJs = true;
        setThongBaoDangTai(
          `Python chưa sẵn sàng (đã thử ${ketQuaKiemTraPython.soLanThu || '?'} lần) — chỉ chạy engine JS cho đợt này.`,
        );
        await choUICapNhat();
      }
    } else {
      try {
        const { dmKhamTongHop, maKhoaKham } = await taiDanhMucRuntimeChoPython();

        setThongBaoDangTai('Đang gửi batch tới Python service (trước bước hợp nhất JS)...');
        await choUICapNhat();
        const ketQuaPython = await auditClaimsBangPythonService({
          claims: danhSachDaCoKetQua,
          options: {
            source: options.pythonSource || 'giam_dinh_hybrid_dong_bo',
            mode: 'batch_audit',
            expect_compatible_claim_results: true,
            dm_kham: dmKhamTongHop,
            ma_khoa_kham: maKhoaKham,
            ...(options.pythonBatchOptions && typeof options.pythonBatchOptions === 'object' ? options.pythonBatchOptions : {}),
          },
        });
        const danhSachTuPython = layDanhSachKetQuaTuPythonService(ketQuaPython, danhSachDaCoKetQua);
        lopPythonDeHopNhat = danhSachTuPython
          ? ganMetaPythonServiceVaoHoSo(danhSachTuPython, ketQuaPython)
          : ganMetaPythonServiceVaoHoSo(danhSachDaCoKetQua, ketQuaPython);
      } catch (pythonError) {
        if (cheDoGiamDinh === CHE_DO_GIAM_DINH.PYTHON) {
          daFallbackTuPythonSangJs = true;
          console.warn('[giam_dinh_hybrid_dong_bo] Python lỗi, hybrid chỉ còn lớp JS:', pythonError);
          setThongBaoDangTai('Python service lỗi — chỉ chạy engine JS cho đợt này.');
          await choUICapNhat();
        } else {
          console.warn('[giam_dinh_hybrid_dong_bo] Python lỗi (bỏ qua lớp Python, vẫn chạy JS):', pythonError);
        }
        lopPythonDeHopNhat = null;
      }
    }
  }

  setThongBaoDangTai('Đang chạy engine giám định JS (V15) — bắt buộc trong hybrid...');
  await choUICapNhat();
  const danhSachGiamDinhJs = await chayNhieuHoSoV15(danhSachDaCoKetQua, {
    onProgress: options.onProgress,
    warmUp: options.warmUp,
    forceReaudit: options.forceReaudit,
  });

  let danhSachLuuKho;
  if (lopPythonDeHopNhat) {
    setThongBaoDangTai('Đang hợp nhất cảnh báo Python + JS (hybrid)...');
    await choUICapNhat();
    danhSachLuuKho = hopNhatDanhSachHoSoTuJsVaPython(danhSachGiamDinhJs, lopPythonDeHopNhat);
    daHopNhatPythonVaJs = true;
  } else {
    danhSachLuuKho = danhSachGiamDinhJs;
  }

  return {
    danhSachLuuKho,
    daFallbackTuPythonSangJs,
    daHopNhatPythonVaJs,
  };
};

/**
 * Một hồ sơ: cùng pipeline hybrid; trả về cảnh báo đã hợp nhất (mảng) để tương thích `chayGiamDinhToanDienV15`.
 */
export const chayGiamDinhToanDienV15HybridDongBo = async (hoSo, options = {}) => {
  if (!hoSo) return [];
  const { danhSachLuuKho } = await chayGiamDinhNhieuHoSoHybridDongBo([hoSo], {
    ...options,
    onProgress: undefined,
  });
  const ra = Array.isArray(danhSachLuuKho) && danhSachLuuKho[0] ? danhSachLuuKho[0] : { ...hoSo, ket_qua_giam_dinh: [] };
  return Array.isArray(ra.ket_qua_giam_dinh) ? ra.ket_qua_giam_dinh : [];
};

/**
 * Tương đương chạy V15 thuần rồi hợp nhất Python nếu có; dùng khi cần cả object hồ sơ (meta Python).
 */
export const chayGiamDinhHoSoDonLeLayDoiTuongDayDu = async (hoSo, options = {}) => {
  if (!hoSo) return null;
  const { danhSachLuuKho, daFallbackTuPythonSangJs, daHopNhatPythonVaJs } = await chayGiamDinhNhieuHoSoHybridDongBo(
    [hoSo],
    { ...options, onProgress: undefined },
  );
  const ra = Array.isArray(danhSachLuuKho) && danhSachLuuKho[0] ? danhSachLuuKho[0] : { ...hoSo };
  return { hoSo: ra, daFallbackTuPythonSangJs, daHopNhatPythonVaJs };
};
