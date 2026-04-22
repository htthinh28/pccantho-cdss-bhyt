import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CD } from '../tien_ich/chu_de_giao_dien';
import { quayLaiAnToan } from '../tien_ich/dieu_huong_an_toan';
import { layTatCaHoSoTuKho } from '../tien_ich/kho_du_lieu';
import {
  CHE_DO_GIAM_DINH,
  TRANG_THAI_PYTHON,
  TRANG_THAI_SMOKE_TEST,
  chaySmokeTestPythonService,
  docCheDoGiamDinh,
  ketNoiPythonServiceLucKhoiDong,
  layNhanTrangThaiPython,
  luuCheDoGiamDinh,
  taiDanhMucRuntimeChoPython,
  thongKeHybridDashboard,
} from '../tien_ich/hybrid_python_helper';
import {
    donDepChunkMoCoiDvktFirebase,
    kiemTraChunkMoCoiDvktFirebase,
    kiemTraDanhMucQuyTacFirebase,
    kiemTraKetNoiFirebaseThucTe,
    layTrangThaiFirebase,
} from '../tien_ich/firebase_cloud_bhyt';
import { docPhienDangNhap } from '../tien_ich/phien_dang_nhap';
import {
  chayDoiSoatNhanhChoWizard,
  dongBoFullHelper,
  taiRuleEngineVeMayHelper,
} from '../tien_ich/config_sync_domain_service';
import { lietKeCanhBaoTruocKhiTaiRuleEngine } from '../tien_ich/rule_engine_dvkt_no_code';
import {
    phucHoiDuLieuHeThongTuJsonText,
    taoBanSaoDuLieuHeThong,
    xuatDuLieuHeThongRaFileJsonWeb,
} from '../tien_ich/sao_luu_du_lieu_he_thong';

const MO_TA_CHUC_NANG = [
  'Tiếp nhận hồ sơ XML BHYT, bóc tách dữ liệu XML1-XML6 và chuẩn hóa dữ liệu đầu vào.',
  'Kiểm tra hồ sơ theo mô hình 5 tầng: hành chính, liên kết dữ liệu, danh mục, lâm sàng và luật cấu hình.',
  'Quản lý danh mục nội bộ, danh mục Bộ Y tế, bộ luật kiểm tra và trạng thái ON/OFF của quy tắc.',
  'Cho phép sửa hồ sơ, kiểm tra lại bắt buộc trước khi lưu kho hoặc xuất báo cáo.',
  'Lưu trữ hồ sơ cục bộ trên web/mobile, đồng bộ dữ liệu danh mục lên Firebase khi cần.',
  'Theo dõi nhật ký thao tác, phân quyền truy cập, thống kê chất lượng và xuất dữ liệu phục vụ đối soát.',
];

const CHECKLIST_KHOI_DONG = [
  'Đăng nhập bằng tài khoản đã được cấp quyền; chỉ ADMIN mới thao tác các nút đồng bộ, phục hồi và phân quyền.',
  'Kiểm tra bộ danh mục và luật đã được nạp đầy đủ trước khi nhập hồ sơ XML mới.',
  'Nếu làm việc trên web, ưu tiên Chrome/Edge bản mới để đảm bảo IndexedDB và tải file hoạt động ổn định.',
  'Trước các thao tác rủi ro như phục hồi JSON, dọn chunk mồ côi hoặc đồng bộ cloud, luôn xuất backup JSON ra máy.',
  'Không thực hiện đồng thời nhập hồ sơ, đồng bộ Firebase và phục hồi JSON trên cùng một phiên làm việc.',
];

const KIEM_TRA_5_TANG = [
  {
    tieuDe: 'Tầng 1 - Kiểm tra hành chính và định danh hồ sơ',
    moTa: 'Xác thực MA_LK, MA_BN, mã thẻ BHYT, ngày vào/ra, giấy tờ định danh và các trường bắt buộc ở XML1.',
  },
  {
    tieuDe: 'Tầng 2 - Kiểm tra liên kết XML1-XML6',
    moTa: 'Đối chiếu MA_LK, STT, quan hệ cha-con giữa các XML và phát hiện thiếu/mất liên kết dữ liệu.',
  },
  {
    tieuDe: 'Tầng 3 - Kiểm tra danh mục, phạm vi và điều kiện thanh toán',
    moTa: 'Rà soát mã DVKT, thuốc, vật tư, giá, quyết định phê duyệt, phạm vi hành nghề và điều kiện hưởng BHYT.',
  },
  {
    tieuDe: 'Tầng 4 - Kiểm tra lâm sàng, thời điểm và chi phí',
    moTa: 'Đánh giá tính hợp lý giữa chẩn đoán, chỉ định, diễn biến, thời điểm thực hiện và chi phí thanh toán.',
  },
  {
    tieuDe: 'Tầng 5 - Kiểm tra động theo luật cấu hình',
    moTa: 'Thực thi luật hardcoded, luật NO-CODE DVKT và các quy tắc đang bật trong màn hình Quản lý Luật / Quản lý quy tắc ON/OFF.',
  },
];

const QUY_TRINH_VAN_HANH = [
  {
    tieuDe: 'Bước 1: Kiểm tra sẵn sàng hệ thống',
    moTa: 'Đăng nhập, xác nhận phân quyền, kiểm tra helper nếu cần và đảm bảo danh mục/quy tắc đang ở trạng thái sẵn sàng.',
  },
  {
    tieuDe: 'Bước 2: Nạp hồ sơ XML',
    moTa: 'Nạp hồ sơ XML để hệ thống bóc tách XML1-XML6, chuẩn hóa văn bản và kiểm tra cấu trúc đầu vào.',
  },
  {
    tieuDe: 'Bước 3: Chạy kiểm tra 5 tầng',
    moTa: 'Chạy kiểm tra hồ sơ để sinh cảnh báo, phân nhóm lỗi, mức độ ảnh hưởng và kết quả giám định.',
  },
  {
    tieuDe: 'Bước 4: Phân tích lỗi và chỉnh sửa',
    moTa: 'Mở Chi tiết ca bệnh hoặc Sửa file XML để rà soát lỗi, chỉnh sửa dữ liệu và kiểm tra lại bắt buộc.',
  },
  {
    tieuDe: 'Bước 5: Lưu kho và hoàn tất hồ sơ',
    moTa: 'Lưu hồ sơ đã đạt yêu cầu vào kho lưu trữ; hồ sơ lỗi vẫn được giữ để theo dõi lịch sử xử lý.',
  },
  {
    tieuDe: 'Bước 6: Theo dõi thống kê và đối soát',
    moTa: 'Sử dụng màn hình Báo cáo & Thống kê để theo dõi tỷ lệ lỗi theo khoa, bác sĩ, quy tắc và xu hướng theo thời gian.',
  },
  {
    tieuDe: 'Bước 7: Sao lưu và đồng bộ khi cần',
    moTa: 'Cuối ca hoặc trước khi bảo trì, xuất backup JSON; chỉ đồng bộ Firebase khi có thay đổi danh mục/quy tắc cần chia sẻ.',
  },
];

const HUONG_DAN_NUT_HELPER = [
  {
    tieuDe: 'Kiểm tra kết nối Firebase',
    moTa: 'Dùng đầu ca hoặc trước khi đồng bộ để xác nhận cấu hình, quyền đọc/ghi và trạng thái project Firebase.',
  },
  {
    tieuDe: 'Kiểm tra dataset danh mục/quy tắc',
    moTa: 'Đối chiếu các dataset bắt buộc như luật, danh mục DVKT, trang thiết bị, nhân sự và mapping người hành nghề.',
  },
  {
    tieuDe: 'Đồng bộ tất cả danh mục + quy tắc lên Firebase',
    moTa: 'Đẩy phiên bản hiện tại từ máy đang dùng lên cloud. Chỉ chạy khi đã kiểm tra dữ liệu cục bộ là đúng và đầy đủ.',
  },
  {
    tieuDe: 'Tải dữ liệu từ Firebase về máy',
    moTa: 'Kéo bộ danh mục/quy tắc đã chuẩn hóa từ cloud về thiết bị cục bộ sau khi triển khai hoặc đổi máy làm việc.',
  },
  {
    tieuDe: 'Kiểm tra chunk mồ côi',
    moTa: 'Kiểm tra các mảnh dữ liệu cloud không còn gắn với dataset cha, thường dùng sau nhiều đợt đồng bộ hoặc ngắt mạng.',
  },
  {
    tieuDe: 'Dọn chunk mồ côi',
    moTa: 'Xóa các chunk rác khỏi Firebase sau khi đã kiểm tra preview. Không chạy khi người dùng khác đang đồng bộ dữ liệu.',
  },
  {
    tieuDe: 'Xuất backup JSON ra máy',
    moTa: 'Sao lưu toàn bộ khóa cấu hình và dữ liệu hệ thống ra file JSON để lưu trữ ngoài trình duyệt.',
  },
  {
    tieuDe: 'Nhập file JSON để phục hồi',
    moTa: 'Phục hồi cấu hình và dữ liệu từ bản sao lưu. Sau khi hoàn tất cần tải lại trang để đồng bộ trạng thái giao diện.',
  },
];

const TINH_HUONG_THUONG_GAP = [
  {
    loi: 'Cột [parsererror] không nằm trong danh mục chỉ tiêu quy định',
    xuLy: 'XML đầu vào sai cú pháp. Cần sửa XML gốc rồi nạp lại.',
  },
  {
    loi: 'Thiếu trường bắt buộc',
    xuLy: 'Bổ sung các trường bắt buộc như MA_LK, MA_BN, NGAY_VAO theo đúng đặc tả.',
  },
  {
    loi: 'Không khớp MA_LK giữa các XML',
    xuLy: 'Đồng bộ MA_LK cho toàn bộ XML1-XML6 để đảm bảo liên kết hồ sơ.',
  },
  {
    loi: 'Firebase báo chưa sẵn sàng hoặc không có quyền',
    xuLy: 'Kiểm tra cấu hình trong app.json, custom claims Firebase và chỉ thực hiện đồng bộ bằng tài khoản đúng vai trò.',
  },
  {
    loi: 'Mất dữ liệu trình duyệt sau khi clear cache',
    xuLy: 'Phục hồi từ file backup JSON đã xuất trước đó hoặc tải lại dataset từ Firebase nếu đã có đồng bộ cloud.',
  },
];

const NGUYEN_TAC_AN_TOAN = [
  'Không sửa trực tiếp dữ liệu gốc trên nhiều máy cùng lúc nếu chưa có quy trình chốt phiên bản danh mục.',
  'Mọi thay đổi tài khoản, phân quyền, luật và danh mục quan trọng phải được thực hiện bằng tài khoản có thẩm quyền.',
  'Luôn xuất backup JSON trước khi phục hồi, dọn dữ liệu hoặc thực hiện đồng bộ toàn phần lên Firebase.',
  'Sau khi phục hồi dữ liệu từ JSON hoặc tải dữ liệu cloud về máy, tải lại trang để đảm bảo trạng thái bộ nhớ được làm mới.',
  'Theo dõi Nhật ký thao tác để truy nguyên thay đổi khi có sai khác dữ liệu hoặc quyền truy cập.',
];

const DATASET_BAT_BUOC_KIEM_TRA = [
  'CDSS_DATA_LUAT_DU_LIEU',
  'CDSS_DATA_LUAT_THUOC',
  'CDSS_DATA_LUAT_PTTT',
  'CDSS_DATA_LUAT_CDHA',
  'DANH_MUC_DVKT_M05',
  'DANH_MUC_TRANG_THIET_BI_M06',
  'DANH_MUC_NHAN_SU',
  'DANH_MUC_MAPPING_NGUOI_HANH_NGHE',
];

const TOM_TAT_HYBRID_MAC_DINH = {
  soHoSoPython: 0,
  soHoSoCoveragePartial: 0,
  soCanhBaoPython: 0,
  soCanhBaoJs: 0,
  danhSachRulePython: [],
  danhSachThongKeRuleJsNgoaiCoveragePython: [],
};

const ManHinhHelperHeThong = ({ navigation }) => {
  const [dangDongBo, setDangDongBo] = useState(false);
  const [dangTaiCloud, setDangTaiCloud] = useState(false);
  const [dangKiemTraCloud, setDangKiemTraCloud] = useState(false);
  const [dangKiemTraDanhMucCloud, setDangKiemTraDanhMucCloud] = useState(false);
  const [dangKiemTraChunkMoCoiCloud, setDangKiemTraChunkMoCoiCloud] = useState(false);
  const [dangDonDepChunkMoCoiCloud, setDangDonDepChunkMoCoiCloud] = useState(false);
  const [dangXuatBackupFile, setDangXuatBackupFile] = useState(false);
  const [dangNhapBackupFile, setDangNhapBackupFile] = useState(false);
  const [thongBaoCloud, setThongBaoCloud] = useState('');
  const [trangThaiFirebase, setTrangThaiFirebase] = useState(() => layTrangThaiFirebase());
  const [cheDoGiamDinh, setCheDoGiamDinh] = useState(CHE_DO_GIAM_DINH.LOCAL);
  const [trangThaiPythonService, setTrangThaiPythonService] = useState(TRANG_THAI_PYTHON.DANG_KIEM_TRA);
  const [chiTietPythonService, setChiTietPythonService] = useState('Đang kiểm tra Python service...');
  const [pythonServiceBaseUrl, setPythonServiceBaseUrl] = useState('');
  const [dangSmokeTestPython, setDangSmokeTestPython] = useState(false);
  const [trangThaiSmokeTestPython, setTrangThaiSmokeTestPython] = useState(TRANG_THAI_SMOKE_TEST.CHUA_CHAY);
  const [ketQuaSmokeTestPython, setKetQuaSmokeTestPython] = useState('Chưa chạy smoke test.');
  const [hybridSummary, setHybridSummary] = useState(TOM_TAT_HYBRID_MAC_DINH);
  const [soLuongDmKhamRuntime, setSoLuongDmKhamRuntime] = useState(0);
  const [soLuongDmCongKhamNoiBoRuntime, setSoLuongDmCongKhamNoiBoRuntime] = useState(0);
  const [soLuongMaKhoaKhamRuntime, setSoLuongMaKhoaKhamRuntime] = useState(0);
  const [vaiTroPhien, setVaiTroPhien] = useState('');
  const [wizardBuoc, setWizardBuoc] = useState(1);
  const [ketQuaDoiSoatWizard, setKetQuaDoiSoatWizard] = useState(null);
  const [dangDoiSoatWizard, setDangDoiSoatWizard] = useState(false);

  const taiPhienVaVaiTro = async () => {
    const s = await docPhienDangNhap();
    setVaiTroPhien(String(s.role || '').trim().toUpperCase());
  };

  const chiDocCauHinh = ['REVIEWER', 'USER'].includes(vaiTroPhien);
  const duocDongBoLenCloud = vaiTroPhien === 'ADMIN';
  const duocTaiVeCloud = ['ADMIN', 'AUDITOR', 'OPERATOR'].includes(vaiTroPhien);

  const nhanTrangThaiSmoke =
    trangThaiSmokeTestPython === TRANG_THAI_SMOKE_TEST.THANH_CONG
      ? 'PASS'
      : trangThaiSmokeTestPython === TRANG_THAI_SMOKE_TEST.THAT_BAI
        ? 'FAIL'
        : trangThaiSmokeTestPython === TRANG_THAI_SMOKE_TEST.DANG_CHAY
          ? 'RUNNING'
          : 'IDLE';

  const taiTomTatHybrid = async () => {
    const danhSachHoSo = await layTatCaHoSoTuKho().catch(() => []);
    setHybridSummary(thongKeHybridDashboard(danhSachHoSo));
  };

  const taiRuntimeHybrid = async () => {
    const runtime = await taiDanhMucRuntimeChoPython();
    setSoLuongDmKhamRuntime(runtime.soLuongDmKhamRuntime || 0);
    setSoLuongDmCongKhamNoiBoRuntime(runtime.soLuongDmCongKhamNoiBoRuntime || 0);
    setSoLuongMaKhoaKhamRuntime(runtime.soLuongMaKhoaKhamRuntime || 0);
    return runtime;
  };

  const capNhatTrangThaiPythonHelper = async () => {
    setTrangThaiPythonService(TRANG_THAI_PYTHON.DANG_KIEM_TRA);
    setChiTietPythonService('Đang kết nối Python (có thử lại tự động)...');
    const ketQua = await ketNoiPythonServiceLucKhoiDong();
    setTrangThaiPythonService(ketQua.trangThai);
    const goiYThu = ketQua.soLanThu > 1 ? ` · đã thử ${ketQua.soLanThu} lần` : '';
    setChiTietPythonService(`${ketQua.chiTiet || ''}${goiYThu}`);
    setPythonServiceBaseUrl(ketQua.baseUrl || '');
    return ketQua;
  };

  const taiTongHopHelperHybrid = async () => {
    const [cheDo] = await Promise.all([
      docCheDoGiamDinh(),
      taiTomTatHybrid(),
      taiRuntimeHybrid(),
      capNhatTrangThaiPythonHelper(),
    ]);
    setCheDoGiamDinh(cheDo);
  };

  const xuLyChuyenCheDoGiamDinh = async (cheDo) => {
    const cheDoMoi = await luuCheDoGiamDinh(cheDo);
    setCheDoGiamDinh(cheDoMoi);
    setThongBaoCloud(`Đã chuyển engine giám định mặc định sang ${cheDoMoi === CHE_DO_GIAM_DINH.PYTHON ? 'Python service' : 'JS nội bộ'}.`);
  };

  const xuLySmokeTestPythonHelper = async () => {
    setDangSmokeTestPython(true);
    setTrangThaiSmokeTestPython(TRANG_THAI_SMOKE_TEST.DANG_CHAY);
    setKetQuaSmokeTestPython('Đang chạy smoke test...');
    try {
      const ketQua = await chaySmokeTestPythonService();
      setTrangThaiSmokeTestPython(TRANG_THAI_SMOKE_TEST.THANH_CONG);
      setKetQuaSmokeTestPython(ketQua.thongBao);
      setSoLuongDmKhamRuntime(ketQua.runtime.soLuongDmKhamRuntime || 0);
      setSoLuongDmCongKhamNoiBoRuntime(ketQua.runtime.soLuongDmCongKhamNoiBoRuntime || 0);
      setSoLuongMaKhoaKhamRuntime(ketQua.runtime.soLuongMaKhoaKhamRuntime || 0);
      await capNhatTrangThaiPythonHelper();
      Alert.alert('Smoke test Python', ketQua.thongBao);
    } catch (error) {
      const thongBaoLoi = error?.message || 'Smoke test Python service thất bại.';
      setTrangThaiSmokeTestPython(TRANG_THAI_SMOKE_TEST.THAT_BAI);
      setKetQuaSmokeTestPython(thongBaoLoi);
      Alert.alert('Smoke test Python', thongBaoLoi);
    } finally {
      setDangSmokeTestPython(false);
    }
  };

  const capNhatTrangThaiFirebase = async (checkWrite = false, updateNotice = false) => {
    setDangKiemTraCloud(true);
    try {
      const ketQua = await kiemTraKetNoiFirebaseThucTe({ checkWrite });
      setTrangThaiFirebase(ketQua);

      if (updateNotice) {
        if (ketQua?.ok) {
          setThongBaoCloud(checkWrite ? 'Firebase sẵn sàng (đọc/ghi).' : 'Firebase sẵn sàng (đọc).');
        } else {
          setThongBaoCloud(ketQua?.reason || 'Kiểm tra Firebase thất bại.');
        }
      }
      return ketQua;
    } finally {
      setDangKiemTraCloud(false);
    }
  };

  useEffect(() => {
    capNhatTrangThaiFirebase(false, false).catch(() => {});
    taiTongHopHelperHybrid().catch(() => {});
    taiPhienVaVaiTro().catch(() => {});
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      taiTongHopHelperHybrid().catch(() => {});
      taiPhienVaVaiTro().catch(() => {});
    });
    return unsubscribe;
  }, [navigation]);

  const xuLyDongBoCloud = async () => {
    if (
      chiDocCauHinh
      || !duocDongBoLenCloud
      || dangDongBo
      || dangTaiCloud
      || dangKiemTraCloud
      || dangKiemTraDanhMucCloud
      || dangKiemTraChunkMoCoiCloud
      || dangDonDepChunkMoCoiCloud
    ) return;
    setDangDongBo(true);
    try {
      const check = await capNhatTrangThaiFirebase(true, false);
      if (!check?.ok) {
        const lyDo = check?.reason || 'Firebase chưa sẵn sàng để đồng bộ.';
        setThongBaoCloud(lyDo);
        Alert.alert('Đồng bộ Firebase', lyDo);
        return;
      }

      const session = await docPhienDangNhap();
      const uploader = session.email || '';
      const ketQua = await dongBoFullHelper({
        uploader: uploader || '',
        source: 'helper_full_sync',
        su_dung_khoa: true,
        actor_email: uploader || '',
        ghi_audit: true,
      });

      if (!ketQua?.ok) {
        const lyDo = ketQua?.reason || ketQua?.code || 'Đồng bộ thất bại.';
        setThongBaoCloud(lyDo);
        Alert.alert('Đồng bộ Firebase', lyDo);
        return;
      }

      const failedDetails = (ketQua.details || []).filter((d) => !d.ok);
      const skippedDetails = (ketQua.details || []).filter((d) => d.ok && d.skipped);
      const uploadedDetails = (ketQua.details || []).filter((d) => d.ok && !d.skipped);
      let msg = `Đã xử lý ${ketQua.processed_count || (uploadedDetails.length + skippedDetails.length)}/${ketQua.total_count || 0} bảng.`;
      if (uploadedDetails.length > 0) msg += `\nMới tải lên: ${uploadedDetails.length} bảng.`;
      if (skippedDetails.length > 0) msg += `\nBỏ qua (không đổi): ${skippedDetails.length} bảng.`;
      if (failedDetails.length > 0) msg += `\nLỗi: ${failedDetails.length} bảng (${failedDetails.map((d) => d.dataset_key).join(', ')}).`;
      if (uploadedDetails.length === 0 && skippedDetails.length > 0 && failedDetails.length === 0) {
        msg += '\nDữ liệu đã có sẵn trên Firebase, không có thay đổi mới để ghi.';
      }
      await capNhatTrangThaiFirebase(false, false);
      setThongBaoCloud(msg);
      Alert.alert('Đồng bộ Firebase', msg);
    } catch (error) {
      const lyDo = error?.message || 'Không thể đồng bộ Firebase.';
      setThongBaoCloud(lyDo);
      Alert.alert('Đồng bộ Firebase', lyDo);
    } finally {
      setDangDongBo(false);
    }
  };

  const thucHienTaiDuLieuRuleEngine = async () => {
    const session = await docPhienDangNhap();
    return taiRuleEngineVeMayHelper({
      actor_email: session.email || '',
      source: 'helper_pull_rule_engine',
      ghi_audit: true,
    });
  };

  const xuLyTaiCloudVeMay = async () => {
    if (
      chiDocCauHinh
      || !duocTaiVeCloud
      || dangDongBo
      || dangTaiCloud
      || dangKiemTraCloud
      || dangKiemTraDanhMucCloud
      || dangKiemTraChunkMoCoiCloud
      || dangDonDepChunkMoCoiCloud
    ) return;

    const checkFirst = await capNhatTrangThaiFirebase(false, false);
    if (!checkFirst?.ok) {
      const lyDo = checkFirst?.reason || 'Firebase chưa sẵn sàng để tải dữ liệu.';
      setThongBaoCloud(lyDo);
      Alert.alert('Tải dữ liệu từ Firebase', lyDo);
      return;
    }

    const pre = await lietKeCanhBaoTruocKhiTaiRuleEngine();
    const runPull = async () => {
      setDangTaiCloud(true);
      try {
        const check = await capNhatTrangThaiFirebase(false, false);
        if (!check?.ok) {
          const lyDo = check?.reason || 'Firebase chưa sẵn sàng để tải dữ liệu.';
          setThongBaoCloud(lyDo);
          Alert.alert('Tải dữ liệu từ Firebase', lyDo);
          return;
        }

        const ketQua = await thucHienTaiDuLieuRuleEngine();
        if (!ketQua?.ok) {
          const lyDo = ketQua?.reason || 'Không tìm thấy dữ liệu cloud để tải.';
          setThongBaoCloud(lyDo);
          Alert.alert('Tải dữ liệu từ Firebase', lyDo);
          return;
        }

        const msg = `Đã tải ${ketQua.downloaded_count || 0}/${ketQua.total_count || 0} bảng từ Firebase.`;
        await capNhatTrangThaiFirebase(false, false);
        setThongBaoCloud(msg);
        Alert.alert('Tải dữ liệu từ Firebase', msg);
      } catch (error) {
        const lyDo = error?.message || 'Không thể tải dữ liệu từ Firebase.';
        setThongBaoCloud(lyDo);
        Alert.alert('Tải dữ liệu từ Firebase', lyDo);
      } finally {
        setDangTaiCloud(false);
      }
    };

    if (pre.warning_count > 0) {
      const tomTat = pre.warnings
        .slice(0, 8)
        .map((w) => `• ${w.dataset_key}: cục bộ chưa khớp cloud / chưa đẩy (${w.policy?.severity || ''})`)
        .join('\n');
      Alert.alert(
        'Kiểm tra trước khi tải',
        `Một số bảng DVKT có cục bộ chưa đồng bộ hoặc khác hash so với lần đẩy gần nhất — tải cloud sẽ ghi đè dữ liệu máy.\n\n${tomTat}\n\nVẫn tiếp tục tải?`,
        [
          { text: 'Hủy', style: 'cancel' },
          { text: 'Tiếp tục tải', style: 'destructive', onPress: () => { runPull().catch(() => {}); } },
        ],
      );
      return;
    }

    await runPull();
  };

  const xuLyDoiSoatWizardTap = async () => {
    if (
      dangDoiSoatWizard
      || dangDongBo
      || dangTaiCloud
      || dangKiemTraCloud
      || dangKiemTraDanhMucCloud
      || dangKiemTraChunkMoCoiCloud
      || dangDonDepChunkMoCoiCloud
    ) return;
    setDangDoiSoatWizard(true);
    try {
      const check = await capNhatTrangThaiFirebase(false, false);
      if (!check?.ok) {
        Alert.alert('Đối soát', check?.reason || 'Firebase chưa sẵn sàng.');
        return;
      }
      const kq = await chayDoiSoatNhanhChoWizard();
      setKetQuaDoiSoatWizard(kq);
      setWizardBuoc(3);
      const msg = `Đối soát nhanh: ${kq.differs_count || 0} dataset khác metadata · ${kq.conflict_risk_count || 0} có rủi ro chồng sửa cục bộ/cloud khi tải.`;
      setThongBaoCloud(msg);
      Alert.alert('Đối soát nhanh', msg);
    } catch (e) {
      Alert.alert('Đối soát', e?.message || 'Lỗi đối soát.');
    } finally {
      setDangDoiSoatWizard(false);
    }
  };

  const xuLyTaoSnapshotTenWizard = async () => {
    if (chiDocCauHinh) {
      Alert.alert('Snapshot', 'Vai trò chỉ đọc không tạo snapshot ghi nội bộ.');
      return;
    }
    try {
      let ten = '';
      if (Platform.OS === 'web' && typeof window !== 'undefined' && typeof window.prompt === 'function') {
        ten = window.prompt('Tên phiên bản (tuỳ chọn, hiển thị trong danh sách snapshot):', '') || '';
      }
      const ketQua = await taoBanSaoDuLieuHeThong({
        reason: 'WIZARD_NAMED_SNAPSHOT',
        ten_hien_thi: ten,
      });
      if (!ketQua?.ok) {
        Alert.alert('Snapshot', ketQua?.message || 'Không tạo được snapshot.');
        return;
      }
      Alert.alert(
        'Snapshot nội bộ',
        `Đã lưu ${ketQua.snapshot_id || ''} (${ketQua.entry_count || 0} mục).`,
      );
    } catch (error) {
      Alert.alert('Snapshot', error?.message || 'Lỗi snapshot.');
    }
  };

  const xuLyKiemTraDanhMucCloud = async () => {
    if (dangDongBo || dangTaiCloud || dangKiemTraCloud || dangKiemTraDanhMucCloud || dangKiemTraChunkMoCoiCloud || dangDonDepChunkMoCoiCloud) return;
    setDangKiemTraDanhMucCloud(true);
    try {
      const check = await capNhatTrangThaiFirebase(false, false);
      if (!check?.ok) {
        const lyDo = check?.reason || 'Firebase chưa sẵn sàng để kiểm tra dataset.';
        setThongBaoCloud(lyDo);
        Alert.alert('Kiểm tra dataset Firebase', lyDo);
        return;
      }

      const ketQua = await kiemTraDanhMucQuyTacFirebase({ requiredDatasetKeys: DATASET_BAT_BUOC_KIEM_TRA });
      if (!ketQua?.ok) {
        const missing = Array.isArray(ketQua?.missing_keys) ? ketQua.missing_keys : [];
        const lyDo = missing.length > 0
          ? `Thiếu ${missing.length}/${ketQua.checked_count || DATASET_BAT_BUOC_KIEM_TRA.length} dataset: ${missing.join(', ')}`
          : (ketQua?.reason || 'Kiểm tra dataset Firebase thất bại.');
        setThongBaoCloud(lyDo);
        Alert.alert('Kiểm tra dataset Firebase', lyDo);
        return;
      }

      const msg = `Đủ dataset bắt buộc: ${ketQua.present_count || 0}/${ketQua.checked_count || DATASET_BAT_BUOC_KIEM_TRA.length}.`;
      setThongBaoCloud(msg);
      Alert.alert('Kiểm tra dataset Firebase', msg);
    } catch (error) {
      const lyDo = error?.message || 'Không thể kiểm tra dataset Firebase.';
      setThongBaoCloud(lyDo);
      Alert.alert('Kiểm tra dataset Firebase', lyDo);
    } finally {
      setDangKiemTraDanhMucCloud(false);
    }
  };

  const xuLyKiemTraChunkMoCoiCloud = async () => {
    if (dangDongBo || dangTaiCloud || dangKiemTraCloud || dangKiemTraDanhMucCloud || dangKiemTraChunkMoCoiCloud || dangDonDepChunkMoCoiCloud) return;
    setDangKiemTraChunkMoCoiCloud(true);
    try {
      const ketQua = await kiemTraChunkMoCoiDvktFirebase({ maxDetailItems: 120 });
      if (!ketQua?.ok) {
        const lyDo = ketQua?.reason || 'Không thể kiểm tra chunk mồ côi.';
        setThongBaoCloud(lyDo);
        Alert.alert('Kiểm tra chunk mồ côi', lyDo);
        return;
      }

      const topParents = (ketQua.by_parent || []).slice(0, 5).map((x) => `${x.parent_id}(${x.chunk_count})`).join(', ');
      const msg = ketQua.orphan_count > 0
        ? `Phát hiện ${ketQua.orphan_count} chunk mồ côi / ${ketQua.total_chunk_count} chunk. Nhóm lớn: ${topParents || 'n/a'}`
        : `Không có chunk mồ côi. Tổng chunk: ${ketQua.total_chunk_count}.`;
      setThongBaoCloud(msg);
      Alert.alert('Kiểm tra chunk mồ côi', msg);
    } catch (error) {
      const lyDo = error?.message || 'Không thể kiểm tra chunk mồ côi.';
      setThongBaoCloud(lyDo);
      Alert.alert('Kiểm tra chunk mồ côi', lyDo);
    } finally {
      setDangKiemTraChunkMoCoiCloud(false);
    }
  };

  const xuLyDonDepChunkMoCoiCloud = async () => {
    if (chiDocCauHinh || !duocDongBoLenCloud) {
      Alert.alert('Dọn chunk', 'Chỉ ADMIN được thực hiện thao tác ghi lên Firebase.');
      return;
    }
    if (dangDongBo || dangTaiCloud || dangKiemTraCloud || dangKiemTraDanhMucCloud || dangKiemTraChunkMoCoiCloud || dangDonDepChunkMoCoiCloud) return;
    setDangDonDepChunkMoCoiCloud(true);
    try {
      const preview = await donDepChunkMoCoiDvktFirebase({ dryRun: true, maxDetailItems: 120 });
      if (!preview?.ok) {
        const lyDo = preview?.reason || 'Không thể kiểm tra trước khi dọn.';
        setThongBaoCloud(lyDo);
        Alert.alert('Dọn chunk mồ côi', lyDo);
        return;
      }

      if ((preview.orphan_count || 0) <= 0) {
        const msg = 'Không có chunk mồ côi để dọn.';
        setThongBaoCloud(msg);
        Alert.alert('Dọn chunk mồ côi', msg);
        return;
      }

      Alert.alert(
        'Xác nhận dọn chunk mồ côi',
        `Sẽ xóa ${preview.orphan_count} chunk mồ côi. Thao tác này không ảnh hưởng dataset hợp lệ.`,
        [
          {
            text: 'Hủy',
            style: 'cancel',
            onPress: () => {
              setDangDonDepChunkMoCoiCloud(false);
            },
          },
          {
            text: 'Xóa',
            style: 'destructive',
            onPress: async () => {
              setDangDonDepChunkMoCoiCloud(true);
              try {
                const done = await donDepChunkMoCoiDvktFirebase({ dryRun: false, maxDelete: 50000, maxDetailItems: 120 });
                if (!done?.ok) {
                  const lyDo = done?.reason || 'Dọn chunk mồ côi thất bại.';
                  setThongBaoCloud(lyDo);
                  Alert.alert('Dọn chunk mồ côi', lyDo);
                  return;
                }
                const msg = `Đã xóa ${done.deleted_count || 0} chunk mồ côi. Còn lại: ${done.remaining_orphan_count || 0}.`;
                setThongBaoCloud(msg);
                Alert.alert('Dọn chunk mồ côi', msg);
              } catch (error) {
                const lyDo = error?.message || 'Dọn chunk mồ côi thất bại.';
                setThongBaoCloud(lyDo);
                Alert.alert('Dọn chunk mồ côi', lyDo);
              } finally {
                setDangDonDepChunkMoCoiCloud(false);
              }
            },
          },
        ]
      );
      return;
    } catch (error) {
      const lyDo = error?.message || 'Dọn chunk mồ côi thất bại.';
      setThongBaoCloud(lyDo);
      Alert.alert('Dọn chunk mồ côi', lyDo);
    } finally {
      setDangDonDepChunkMoCoiCloud(false);
    }
  };

  const xuLyXuatBackupFile = async () => {
    if (dangDongBo || dangTaiCloud || dangKiemTraCloud || dangKiemTraDanhMucCloud || dangKiemTraChunkMoCoiCloud || dangDonDepChunkMoCoiCloud || dangXuatBackupFile || dangNhapBackupFile) return;
    if (Platform.OS !== 'web') {
      Alert.alert('Sao lưu JSON', 'Chức năng này hiện hỗ trợ trên web.');
      return;
    }
    setDangXuatBackupFile(true);
    try {
      const ketQua = await xuatDuLieuHeThongRaFileJsonWeb({ reason: 'HELPER_MANUAL_EXPORT_JSON' });
      if (!ketQua?.ok) {
        const lyDo = ketQua?.message || 'Không thể xuất file backup JSON.';
        setThongBaoCloud(lyDo);
        Alert.alert('Sao lưu JSON', lyDo);
        return;
      }
      const msg = `Đã xuất ${ketQua.async_count || 0} khóa Async + ${ketQua.local_count || 0} khóa Local ra file ${ketQua.file_name}.`;
      setThongBaoCloud(msg);
      Alert.alert('Sao lưu JSON', msg);
    } catch (error) {
      const lyDo = error?.message || 'Không thể xuất file backup JSON.';
      setThongBaoCloud(lyDo);
      Alert.alert('Sao lưu JSON', lyDo);
    } finally {
      setDangXuatBackupFile(false);
    }
  };

  const xuLyNhapBackupFile = async (event) => {
    const file = event?.target?.files?.[0];
    if (!file) return;
    event.target.value = null;

    if (chiDocCauHinh) {
      Alert.alert('Phục hồi JSON', 'Vai trò chỉ đọc không nhập phục hồi cấu hình.');
      return;
    }

    if (dangDongBo || dangTaiCloud || dangKiemTraCloud || dangKiemTraDanhMucCloud || dangKiemTraChunkMoCoiCloud || dangDonDepChunkMoCoiCloud || dangXuatBackupFile || dangNhapBackupFile) {
      return;
    }

    setDangNhapBackupFile(true);
    try {
      const text = await file.text();
      const ketQua = await phucHoiDuLieuHeThongTuJsonText(text, { xoaKhoaMoiKhongCoTrongBanSao: true });
      if (!ketQua?.ok) {
        const lyDo = ketQua?.message || 'Không thể phục hồi từ file JSON.';
        setThongBaoCloud(lyDo);
        Alert.alert('Phục hồi JSON', lyDo);
        return;
      }

      const msg = `Đã phục hồi ${ketQua.restored_async || 0} khóa Async + ${ketQua.restored_local || 0} khóa Local. Vui lòng tải lại trang (F5).`;
      setThongBaoCloud(msg);
      Alert.alert('Phục hồi JSON', msg);
    } catch (error) {
      const lyDo = error?.message || 'Không thể phục hồi từ file JSON.';
      setThongBaoCloud(lyDo);
      Alert.alert('Phục hồi JSON', lyDo);
    } finally {
      setDangNhapBackupFile(false);
    }
  };

  const cloudBtnsBusy =
    dangDongBo
    || dangTaiCloud
    || dangKiemTraCloud
    || dangKiemTraDanhMucCloud
    || dangKiemTraChunkMoCoiCloud
    || dangDonDepChunkMoCoiCloud;
  const khoaDongBoLen = cloudBtnsBusy || chiDocCauHinh || !duocDongBoLenCloud;
  const khoaTaiVe = cloudBtnsBusy || chiDocCauHinh || !duocTaiVeCloud;

  return (
    <SafeAreaView style={styles.vung_an_toan}>
      <View style={styles.header}>
        <Text style={styles.tieu_de}>HELPER VẬN HÀNH HỆ THỐNG CDSS BHYT</Text>
        <Text style={styles.mo_ta_header}>
          Tài liệu vận hành nhanh cho người dùng nghiệp vụ và quản trị viên, bám theo quy trình kiểm tra hồ sơ 5 tầng và các tiện ích an toàn dữ liệu.
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.noi_dung} showsVerticalScrollIndicator={false}>
        <View style={styles.khoi}>
          <Text style={styles.tieu_de_khoi}>Mô tả chức năng hệ thống</Text>
          {MO_TA_CHUC_NANG.map((item, index) => (
            <View key={`chucnang-${index}`} style={styles.dong_liet_ke}>
              <Text style={styles.so_thu_tu}>{index + 1}.</Text>
              <Text style={styles.noi_dung_liet_ke}>{item}</Text>
            </View>
          ))}
        </View>

        <View style={styles.khoi}>
          <Text style={styles.tieu_de_khoi}>Checklist trước khi vận hành</Text>
          {CHECKLIST_KHOI_DONG.map((item, index) => (
            <View key={`checklist-${index}`} style={styles.dong_liet_ke}>
              <Text style={styles.so_thu_tu}>{index + 1}.</Text>
              <Text style={styles.noi_dung_liet_ke}>{item}</Text>
            </View>
          ))}
        </View>

        <View style={styles.khoi}>
          <Text style={styles.tieu_de_khoi}>Trình tự kiểm tra hồ sơ 5 tầng</Text>
          {KIEM_TRA_5_TANG.map((item, index) => (
            <View key={`tang-${index}`} style={styles.the_buoc}>
              <Text style={styles.tieu_de_buoc}>{item.tieuDe}</Text>
              <Text style={styles.mo_ta_buoc}>{item.moTa}</Text>
            </View>
          ))}
        </View>

        <View style={styles.khoi}>
          <Text style={styles.tieu_de_khoi}>Quy trình vận hành đề xuất</Text>
          {QUY_TRINH_VAN_HANH.map((item, index) => (
            <View key={`quytrinh-${index}`} style={styles.the_buoc}>
              <Text style={styles.tieu_de_buoc}>{item.tieuDe}</Text>
              <Text style={styles.mo_ta_buoc}>{item.moTa}</Text>
            </View>
          ))}
        </View>

        <View style={styles.khoi}>
          <Text style={styles.tieu_de_khoi}>Khi nào dùng từng nút trong Helper</Text>
          {HUONG_DAN_NUT_HELPER.map((item, index) => (
            <View key={`helper-button-${index}`} style={styles.the_buoc}>
              <Text style={styles.tieu_de_buoc}>{item.tieuDe}</Text>
              <Text style={styles.mo_ta_buoc}>{item.moTa}</Text>
            </View>
          ))}
        </View>

        <View style={styles.khoi}>
          <Text style={styles.tieu_de_khoi}>Hybrid / Python service</Text>
          <Text style={styles.hybrid_intro_text}>
            Trên Dashboard, giám định luôn chạy hybrid: engine JS (V15) bắt buộc, cộng lớp Python khi cấu hình bật và service sẵn sàng, rồi hợp nhất — không còn chế độ chỉ Python hoặc chỉ JS. Hai chip: &quot;JS nội bộ&quot; = lớp Python là tuỳ chọn; &quot;Python service&quot; = ưu tiên Python, lỗi mạng vẫn lưu bằng JS.
          </Text>

          <View style={styles.hybrid_mode_row}>
            <TouchableOpacity
              style={[styles.hybrid_mode_chip, cheDoGiamDinh === CHE_DO_GIAM_DINH.LOCAL && styles.hybrid_mode_chip_active]}
              onPress={() => xuLyChuyenCheDoGiamDinh(CHE_DO_GIAM_DINH.LOCAL)}
            >
              <Text style={[styles.hybrid_mode_chip_txt, cheDoGiamDinh === CHE_DO_GIAM_DINH.LOCAL && styles.hybrid_mode_chip_txt_active]}>JS nội bộ</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.hybrid_mode_chip, cheDoGiamDinh === CHE_DO_GIAM_DINH.PYTHON && styles.hybrid_mode_chip_active]}
              onPress={() => xuLyChuyenCheDoGiamDinh(CHE_DO_GIAM_DINH.PYTHON)}
            >
              <Text style={[styles.hybrid_mode_chip_txt, cheDoGiamDinh === CHE_DO_GIAM_DINH.PYTHON && styles.hybrid_mode_chip_txt_active]}>Python service</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.hybrid_status_card}>
            <View style={styles.hybrid_status_top_row}>
              <View style={[styles.hybrid_status_dot, trangThaiPythonService === TRANG_THAI_PYTHON.SAN_SANG && styles.hybrid_status_dot_online, trangThaiPythonService === TRANG_THAI_PYTHON.DANG_KIEM_TRA && styles.hybrid_status_dot_checking]} />
              <Text style={styles.hybrid_status_title}>{layNhanTrangThaiPython(trangThaiPythonService)}</Text>
              <View style={[styles.hybrid_smoke_badge, trangThaiSmokeTestPython === TRANG_THAI_SMOKE_TEST.THANH_CONG && styles.hybrid_smoke_badge_pass, trangThaiSmokeTestPython === TRANG_THAI_SMOKE_TEST.THAT_BAI && styles.hybrid_smoke_badge_fail, trangThaiSmokeTestPython === TRANG_THAI_SMOKE_TEST.DANG_CHAY && styles.hybrid_smoke_badge_running]}>
                <Text style={styles.hybrid_smoke_badge_txt}>{nhanTrangThaiSmoke}</Text>
              </View>
            </View>
            <Text style={styles.hybrid_status_meta} numberOfLines={1}>Base URL: {pythonServiceBaseUrl || 'Chưa xác định'}</Text>
            <Text style={styles.hybrid_status_meta} numberOfLines={1}>PL2 {soLuongDmKhamRuntime} · M05 {soLuongDmCongKhamNoiBoRuntime} · M01 {soLuongMaKhoaKhamRuntime}</Text>
            <Text style={styles.hybrid_status_detail} numberOfLines={2}>{chiTietPythonService}</Text>
            <Text style={styles.hybrid_status_detail} numberOfLines={2}>{ketQuaSmokeTestPython}</Text>
          </View>

          <View style={styles.hybrid_action_row}>
            <TouchableOpacity style={[styles.nut_cloud, styles.hybrid_btn_check]} onPress={() => capNhatTrangThaiPythonHelper()}>
              <Text style={styles.hybrid_btn_text}>Kiểm tra service</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.nut_cloud, styles.hybrid_btn_smoke, dangSmokeTestPython && styles.nut_cloud_khoa]} onPress={xuLySmokeTestPythonHelper} disabled={dangSmokeTestPython}>
              {dangSmokeTestPython ? <ActivityIndicator color="#fff" /> : <Text style={styles.hybrid_btn_text}>Smoke test</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={[styles.nut_cloud, styles.hybrid_btn_refresh]} onPress={() => taiTongHopHelperHybrid()}>
              <Text style={styles.hybrid_btn_text}>Làm mới</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.hybrid_kpi_row}>
            <View style={styles.hybrid_kpi_card}>
              <Text style={styles.hybrid_kpi_label}>Hồ sơ Python</Text>
              <Text style={styles.hybrid_kpi_value}>{hybridSummary.soHoSoPython}</Text>
            </View>
            <View style={styles.hybrid_kpi_card}>
              <Text style={styles.hybrid_kpi_label}>CB Python</Text>
              <Text style={styles.hybrid_kpi_value}>{hybridSummary.soCanhBaoPython}</Text>
            </View>
            <View style={styles.hybrid_kpi_card}>
              <Text style={styles.hybrid_kpi_label}>JS bù coverage</Text>
              <Text style={styles.hybrid_kpi_value}>{hybridSummary.soCanhBaoJs}</Text>
            </View>
            <View style={styles.hybrid_kpi_card}>
              <Text style={styles.hybrid_kpi_label}>Partial</Text>
              <Text style={styles.hybrid_kpi_value}>{hybridSummary.soHoSoCoveragePartial}</Text>
            </View>
          </View>

          <Text style={styles.hybrid_summary_line} numberOfLines={2}>
            Coverage {hybridSummary.danhSachRulePython.length} rule · Gap: {hybridSummary.danhSachThongKeRuleJsNgoaiCoveragePython.length > 0 ? hybridSummary.danhSachThongKeRuleJsNgoaiCoveragePython.slice(0, 4).map((item) => `${item.ma_luat} ${item.sl}`).join(' · ') : 'Không có'}
          </Text>
        </View>

        <View style={styles.khoi}>
          <Text style={styles.tieu_de_khoi}>Wizard vận hành đồng bộ (3 bước)</Text>
          <Text style={styles.wizard_hint}>
            Local = dữ liệu trên máy (IndexedDB/AsyncStorage). Cloud = bản org trên Firestore. Đối soát chỉ đọc metadata/hash — không ghi đè.
          </Text>
          <View style={styles.wizard_step_block}>
            <Text style={[styles.wizard_step_title, wizardBuoc >= 1 && styles.wizard_step_title_on]}>Bước 1 — Backup</Text>
            <Text style={styles.wizard_step_body}>Xuất JSON ra file hoặc tạo snapshot đặt tên trong máy (AsyncStorage).</Text>
            <View style={styles.wizard_btn_row}>
              <TouchableOpacity
                style={[styles.nut_cloud, styles.wizard_btn, (cloudBtnsBusy || dangXuatBackupFile || dangNhapBackupFile) && styles.nut_cloud_khoa]}
                onPress={xuLyXuatBackupFile}
                disabled={cloudBtnsBusy || dangXuatBackupFile || dangNhapBackupFile}
              >
                <Text style={styles.txt_nut_cloud}>Xuất backup JSON</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.nut_cloud, styles.wizard_btn, chiDocCauHinh && styles.nut_cloud_khoa]}
                onPress={xuLyTaoSnapshotTenWizard}
                disabled={chiDocCauHinh}
              >
                <Text style={styles.txt_nut_cloud}>Snapshot đặt tên</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.wizard_link} onPress={() => setWizardBuoc(2)}>
              <Text style={styles.wizard_link_txt}>Tiếp bước 2 →</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.wizard_step_block}>
            <Text style={[styles.wizard_step_title, wizardBuoc >= 2 && styles.wizard_step_title_on]}>Bước 2 — Đối soát Firebase ↔ máy</Text>
            <Text style={styles.wizard_step_body}>So khóa hash/số dòng cho danh mục DVKT + shard mapping.</Text>
            <TouchableOpacity
              style={[styles.nut_cloud, styles.nut_cloud_dataset, (cloudBtnsBusy || dangDoiSoatWizard) && styles.nut_cloud_khoa]}
              onPress={xuLyDoiSoatWizardTap}
              disabled={cloudBtnsBusy || dangDoiSoatWizard}
            >
              {dangDoiSoatWizard ? <ActivityIndicator color="#fff" /> : <Text style={styles.txt_nut_cloud}>Chạy đối soát nhanh</Text>}
            </TouchableOpacity>
            {ketQuaDoiSoatWizard?.ok ? (
              <Text style={styles.wizard_ket_qua}>
                Khác metadata: {ketQuaDoiSoatWizard.differs_count || 0} · Rủi ro conflict khi tải: {ketQuaDoiSoatWizard.conflict_risk_count || 0}
              </Text>
            ) : null}
          </View>

          <View style={styles.wizard_step_block}>
            <Text style={[styles.wizard_step_title, wizardBuoc >= 3 && styles.wizard_step_title_on]}>Bước 3 — Đẩy / tải</Text>
            <Text style={styles.wizard_step_body}>
              Dùng hai nút trong khối «Đồng bộ Firebase» bên dưới. Trước khi tải, hệ thống sẽ cảnh báo nếu cục bộ chưa đồng bộ với cloud.
            </Text>
          </View>
        </View>

        <View style={styles.khoi}>
          <Text style={styles.tieu_de_khoi}>Lỗi thường gặp và cách xử lý</Text>
          {TINH_HUONG_THUONG_GAP.map((item, index) => (
            <View key={`loi-${index}`} style={styles.the_loi}>
              <Text style={styles.loi_tieu_de}>Lỗi: {item.loi}</Text>
              <Text style={styles.loi_xu_ly}>Xử lý: {item.xuLy}</Text>
            </View>
          ))}
        </View>

        <View style={styles.khoi}>
          <Text style={styles.tieu_de_khoi}>Đồng bộ dữ liệu Firebase (chạy thật)</Text>
          <Text style={styles.sync_tooltip}>
            Local giữ bản làm việc; cloud là bản chia sẻ theo org. Hash (content_hash) đối chiếu nhanh; schema_version ghi nhận kiểu payload.
          </Text>
          {!!vaiTroPhien && (
            <Text style={styles.role_banner}>
              Vai trò phiên: {vaiTroPhien}
              {' · '}
              Đẩy org: {duocDongBoLenCloud ? 'cho phép (ADMIN)' : 'không'}
              {' · '}
              Tải về: {duocTaiVeCloud ? 'cho phép' : 'không'}
              {chiDocCauHinh ? ' · Chế độ chỉ đọc cấu hình.' : ''}
            </Text>
          )}
          <Text style={styles.noi_dung_doan}>
            Trạng thái Firebase:{' '}
            {trangThaiFirebase?.ok
              ? `Sẵn sàng (project: ${trangThaiFirebase.project_id}, org: ${trangThaiFirebase.org_id}, uid: ${trangThaiFirebase.uid || 'n/a'})`
              : `Chưa sẵn sàng - ${trangThaiFirebase?.reason || 'thiếu cấu hình'}`}
          </Text>

          {!!thongBaoCloud && <Text style={styles.thong_bao_cloud}>{thongBaoCloud}</Text>}

          <View style={styles.hang_nut_cloud}>
            <TouchableOpacity
              style={[styles.nut_cloud, khoaDongBoLen && styles.nut_cloud_khoa]}
              onPress={xuLyDongBoCloud}
              disabled={khoaDongBoLen}
            >
              {dangDongBo ? <ActivityIndicator color="#fff" /> : <Text style={styles.txt_nut_cloud}>Đồng bộ tất cả danh mục + quy tắc lên Firebase</Text>}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.nut_cloud, styles.nut_cloud_phu, khoaTaiVe && styles.nut_cloud_khoa]}
              onPress={xuLyTaiCloudVeMay}
              disabled={khoaTaiVe}
            >
              {dangTaiCloud ? <ActivityIndicator color="#fff" /> : <Text style={styles.txt_nut_cloud}>Tải dữ liệu từ Firebase về máy</Text>}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.nut_cloud, styles.nut_cloud_kiem_tra, (dangDongBo || dangTaiCloud || dangKiemTraCloud || dangKiemTraDanhMucCloud || dangKiemTraChunkMoCoiCloud || dangDonDepChunkMoCoiCloud) && styles.nut_cloud_khoa]}
              onPress={() => capNhatTrangThaiFirebase(true, true)}
              disabled={dangDongBo || dangTaiCloud || dangKiemTraCloud || dangKiemTraDanhMucCloud || dangKiemTraChunkMoCoiCloud || dangDonDepChunkMoCoiCloud}
            >
              {dangKiemTraCloud ? <ActivityIndicator color="#fff" /> : <Text style={styles.txt_nut_cloud}>Kiểm tra kết nối Firebase</Text>}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.nut_cloud, styles.nut_cloud_dataset, (dangDongBo || dangTaiCloud || dangKiemTraCloud || dangKiemTraDanhMucCloud || dangKiemTraChunkMoCoiCloud || dangDonDepChunkMoCoiCloud) && styles.nut_cloud_khoa]}
              onPress={xuLyKiemTraDanhMucCloud}
              disabled={dangDongBo || dangTaiCloud || dangKiemTraCloud || dangKiemTraDanhMucCloud || dangKiemTraChunkMoCoiCloud || dangDonDepChunkMoCoiCloud}
            >
              {dangKiemTraDanhMucCloud ? <ActivityIndicator color="#fff" /> : <Text style={styles.txt_nut_cloud}>Kiểm tra dataset danh mục/quy tắc</Text>}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.nut_cloud, styles.nut_cloud_chunk_check, (dangDongBo || dangTaiCloud || dangKiemTraCloud || dangKiemTraDanhMucCloud || dangKiemTraChunkMoCoiCloud || dangDonDepChunkMoCoiCloud) && styles.nut_cloud_khoa]}
              onPress={xuLyKiemTraChunkMoCoiCloud}
              disabled={dangDongBo || dangTaiCloud || dangKiemTraCloud || dangKiemTraDanhMucCloud || dangKiemTraChunkMoCoiCloud || dangDonDepChunkMoCoiCloud}
            >
              {dangKiemTraChunkMoCoiCloud ? <ActivityIndicator color="#fff" /> : <Text style={styles.txt_nut_cloud}>Kiểm tra chunk mồ côi</Text>}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.nut_cloud, styles.nut_cloud_chunk_cleanup, (dangDongBo || dangTaiCloud || dangKiemTraCloud || dangKiemTraDanhMucCloud || dangKiemTraChunkMoCoiCloud || dangDonDepChunkMoCoiCloud || chiDocCauHinh || !duocDongBoLenCloud) && styles.nut_cloud_khoa]}
              onPress={xuLyDonDepChunkMoCoiCloud}
              disabled={dangDongBo || dangTaiCloud || dangKiemTraCloud || dangKiemTraDanhMucCloud || dangKiemTraChunkMoCoiCloud || dangDonDepChunkMoCoiCloud || chiDocCauHinh || !duocDongBoLenCloud}
            >
              {dangDonDepChunkMoCoiCloud ? <ActivityIndicator color="#fff" /> : <Text style={styles.txt_nut_cloud}>Dọn chunk mồ côi</Text>}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.khoi}>
          <Text style={styles.tieu_de_khoi}>Sao lưu ngoài Browser (khuyến nghị)</Text>
          <Text style={styles.noi_dung_doan}>
            Dùng file JSON để lưu dữ liệu ra ngoài trình duyệt. Khi lỡ clear browser, chỉ cần nhập lại file JSON để phục hồi nhanh.
          </Text>
          <View style={styles.hang_nut_cloud}>
            <TouchableOpacity
              style={[styles.nut_cloud, styles.nut_cloud_backup, (dangDongBo || dangTaiCloud || dangKiemTraCloud || dangKiemTraDanhMucCloud || dangKiemTraChunkMoCoiCloud || dangDonDepChunkMoCoiCloud || dangXuatBackupFile || dangNhapBackupFile) && styles.nut_cloud_khoa]}
              onPress={xuLyXuatBackupFile}
              disabled={dangDongBo || dangTaiCloud || dangKiemTraCloud || dangKiemTraDanhMucCloud || dangKiemTraChunkMoCoiCloud || dangDonDepChunkMoCoiCloud || dangXuatBackupFile || dangNhapBackupFile}
            >
              {dangXuatBackupFile ? <ActivityIndicator color="#fff" /> : <Text style={styles.txt_nut_cloud}>Xuất backup JSON ra máy</Text>}
            </TouchableOpacity>

            {Platform.OS === 'web' && (
              <>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={xuLyNhapBackupFile}
                  style={{ display: 'none' }}
                  id="import-backup-json"
                />
                <TouchableOpacity
                  style={[styles.nut_cloud, styles.nut_cloud_restore, (dangDongBo || dangTaiCloud || dangKiemTraCloud || dangKiemTraDanhMucCloud || dangKiemTraChunkMoCoiCloud || dangDonDepChunkMoCoiCloud || dangXuatBackupFile || dangNhapBackupFile || chiDocCauHinh) && styles.nut_cloud_khoa]}
                  onPress={() => {
                    const input = document.getElementById('import-backup-json');
                    if (input) input.click();
                  }}
                  disabled={dangDongBo || dangTaiCloud || dangKiemTraCloud || dangKiemTraDanhMucCloud || dangKiemTraChunkMoCoiCloud || dangDonDepChunkMoCoiCloud || dangXuatBackupFile || dangNhapBackupFile || chiDocCauHinh}
                >
                  {dangNhapBackupFile ? <ActivityIndicator color="#fff" /> : <Text style={styles.txt_nut_cloud}>Nhập file JSON để phục hồi</Text>}
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        <View style={styles.khoi}>
          <Text style={styles.tieu_de_khoi}>Lưu ý phân quyền và an toàn dữ liệu</Text>
          {NGUYEN_TAC_AN_TOAN.map((item, index) => (
            <View key={`antoan-${index}`} style={styles.dong_liet_ke}>
              <Text style={styles.so_thu_tu}>{index + 1}.</Text>
              <Text style={styles.noi_dung_liet_ke}>{item}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.nut_quay_lai} onPress={() => quayLaiAnToan(navigation, 'TongQuan')}>
          <Text style={styles.txt_nut_quay_lai}>{'<'} Quay lại Tổng quan</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  vung_an_toan: {
    flex: 1,
    backgroundColor: CD.bg.gradient_mobile,
    ...Platform.select({ web: { backgroundImage: CD.web.gradient_bg } }),
  },
  header: {
    backgroundColor: CD.brand.mauDam,
    borderBottomWidth: 1,
    borderBottomColor: CD.border.header,
    paddingHorizontal: 24,
    paddingVertical: 18,
    ...Platform.select({
      web: {
        backgroundImage: CD.web.gradient_header,
        backdropFilter: CD.web.blur_header,
        boxShadow: CD.web.shadow_header,
      },
    }),
  },
  tieu_de: { fontSize: 24, fontWeight: '900', color: CD.text.primary, fontFamily: CD.font.family },
  mo_ta_header: { fontSize: 16, color: CD.text.secondary, marginTop: 8, fontFamily: CD.font.family, lineHeight: 24 },
  noi_dung: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 24, gap: 14 },
  khoi: {
    backgroundColor: CD.bg.glass_card,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: CD.border.glass,
    ...Platform.select({
      web: {
        backdropFilter: CD.web.blur_card,
        WebkitBackdropFilter: CD.web.blur_card,
        boxShadow: CD.web.shadow_card,
      },
    }),
  },
  tieu_de_khoi: { fontSize: 20, fontWeight: '800', color: CD.text.primary, marginBottom: 12, fontFamily: CD.font.family },
  wizard_hint: { fontSize: 14, color: CD.text.secondary, marginBottom: 14, lineHeight: 21, fontFamily: CD.font.family },
  wizard_step_block: { marginBottom: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: CD.border.glass_md },
  wizard_step_title: { fontSize: 16, fontWeight: '700', color: CD.text.secondary, fontFamily: CD.font.family },
  wizard_step_title_on: { color: CD.text.link },
  wizard_step_body: { fontSize: 14, color: CD.text.table_cell, marginTop: 4, marginBottom: 10, lineHeight: 21, fontFamily: CD.font.family },
  wizard_btn_row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  wizard_btn: { flex: 1, minWidth: 140 },
  wizard_link: { marginTop: 8, alignSelf: 'flex-start', paddingVertical: 4 },
  wizard_link_txt: { fontSize: 15, color: CD.text.link, fontFamily: CD.font.family },
  wizard_ket_qua: { marginTop: 8, fontSize: 14, color: CD.text.secondary, fontFamily: CD.font.family },
  sync_tooltip: { fontSize: 14, color: CD.text.secondary, marginBottom: 10, lineHeight: 21, fontFamily: CD.font.family },
  role_banner: { fontSize: 14, color: CD.text.link, marginBottom: 10, fontFamily: CD.font.family },
  dong_liet_ke: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  so_thu_tu: { width: 24, fontSize: 16, fontWeight: '700', color: CD.text.link, fontFamily: CD.font.family },
  noi_dung_liet_ke: { flex: 1, fontSize: 16, color: CD.text.table_cell, lineHeight: 24, fontFamily: CD.font.family },
  the_buoc: {
    backgroundColor: CD.bg.glass_input,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: CD.border.glass_md,
    padding: 12,
    marginBottom: 10,
  },
  tieu_de_buoc: { fontSize: 17, fontWeight: '800', color: CD.text.primary, marginBottom: 4, fontFamily: CD.font.family },
  mo_ta_buoc: { fontSize: 15, color: CD.text.secondary, lineHeight: 23, fontFamily: CD.font.family },
  the_loi: {
    backgroundColor: CD.severity.error.bg,
    borderColor: CD.severity.error.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  loi_tieu_de: { fontSize: 16, fontWeight: '800', color: CD.severity.error.text, marginBottom: 4, fontFamily: CD.font.family },
  loi_xu_ly: { fontSize: 15, color: CD.text.table_cell, lineHeight: 22, fontFamily: CD.font.family },
  noi_dung_doan: { fontSize: 16, color: CD.text.table_cell, lineHeight: 24, fontFamily: CD.font.family },
  thong_bao_cloud: { marginTop: 8, fontSize: 15, color: CD.text.link, fontFamily: CD.font.family },
  hang_nut_cloud: { marginTop: 12, gap: 10 },
  nut_cloud: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#1976D2',
    ...Platform.select({ web: { cursor: CD.web.cursor_pointer } }),
  },
  nut_cloud_phu: {
    backgroundColor: '#455A64',
  },
  nut_cloud_kiem_tra: {
    backgroundColor: '#2E7D32',
  },
  nut_cloud_dataset: {
    backgroundColor: '#7B1FA2',
  },
  nut_cloud_chunk_check: {
    backgroundColor: '#6D4C41',
  },
  nut_cloud_chunk_cleanup: {
    backgroundColor: '#C62828',
  },
  nut_cloud_backup: {
    backgroundColor: '#6A1B9A',
  },
  nut_cloud_restore: {
    backgroundColor: '#00838F',
  },
  nut_cloud_khoa: {
    opacity: 0.65,
  },
  txt_nut_cloud: { color: '#fff', fontSize: 16, fontWeight: '700', fontFamily: CD.font.family },
  hybrid_intro_text: { fontSize: 14, color: CD.text.secondary, lineHeight: 20, fontFamily: CD.font.family, marginTop: -2, marginBottom: 10 },
  hybrid_mode_row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 2, marginBottom: 10 },
  hybrid_mode_chip: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#F8FAFC',
    ...Platform.select({ web: { cursor: CD.web.cursor_pointer } }),
  },
  hybrid_mode_chip_active: { backgroundColor: '#0F766E', borderColor: '#0F766E' },
  hybrid_mode_chip_txt: { fontSize: 13, fontWeight: '700', color: '#334155', fontFamily: CD.font.family },
  hybrid_mode_chip_txt_active: { color: '#FFFFFF' },
  hybrid_status_card: {
    backgroundColor: CD.bg.glass_input,
    borderWidth: 1,
    borderColor: CD.border.glass_md,
    borderRadius: 14,
    padding: 12,
  },
  hybrid_status_top_row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  hybrid_status_dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#EF4444' },
  hybrid_status_dot_online: { backgroundColor: '#22C55E' },
  hybrid_status_dot_checking: { backgroundColor: '#F59E0B' },
  hybrid_status_title: { flex: 1, fontSize: 15, fontWeight: '800', color: CD.text.primary, fontFamily: CD.font.family },
  hybrid_status_meta: { fontSize: 13, color: CD.text.secondary, lineHeight: 18, fontFamily: CD.font.family, marginBottom: 3 },
  hybrid_status_detail: { fontSize: 13, color: CD.text.table_cell, lineHeight: 18, fontFamily: CD.font.family, marginTop: 2 },
  hybrid_smoke_badge: { paddingVertical: 3, paddingHorizontal: 8, borderRadius: 999, backgroundColor: '#94A3B8' },
  hybrid_smoke_badge_pass: { backgroundColor: '#16A34A' },
  hybrid_smoke_badge_fail: { backgroundColor: '#DC2626' },
  hybrid_smoke_badge_running: { backgroundColor: '#D97706' },
  hybrid_smoke_badge_txt: { fontSize: 10, fontWeight: '800', color: '#FFFFFF', fontFamily: CD.font.family },
  hybrid_action_row: { marginTop: 10, gap: 8, flexDirection: Platform.OS === 'web' ? 'row' : 'column', flexWrap: 'wrap' },
  hybrid_btn_check: { backgroundColor: '#2563EB' },
  hybrid_btn_smoke: { backgroundColor: '#0F766E' },
  hybrid_btn_refresh: { backgroundColor: '#6D28D9' },
  hybrid_btn_text: { color: '#fff', fontSize: 14, fontWeight: '700', fontFamily: CD.font.family },
  hybrid_kpi_row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  hybrid_kpi_card: {
    flexGrow: 1,
    flexBasis: Platform.OS === 'web' ? '24%' : '48%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: CD.border.glass,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  hybrid_kpi_label: { fontSize: 12, color: CD.text.secondary, fontFamily: CD.font.family, marginBottom: 2 },
  hybrid_kpi_value: { fontSize: 18, fontWeight: '900', color: '#0F766E', fontFamily: CD.font.family, lineHeight: 20 },
  hybrid_summary_line: { marginTop: 10, fontSize: 13, color: CD.text.table_cell, lineHeight: 18, fontFamily: CD.font.family },
  footer: { paddingHorizontal: 20, paddingBottom: 16 },
  nut_quay_lai: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: CD.border.glass_md,
    backgroundColor: CD.bg.glass_input,
    ...Platform.select({ web: { cursor: CD.web.cursor_pointer } }),
  },
  txt_nut_quay_lai: { fontSize: 17, fontWeight: '700', color: CD.text.secondary, fontFamily: CD.font.family },
});

export default ManHinhHelperHeThong;
