/**
 * Màn Báo cáo — mặc định: Dashboard Daily Huddle (KPI BHYT, pink theme).
 * Báo cáo tab/bảng/xuất Excel giữ nguyên trong `baocao_va_thongke_legacy.jsx`, mở qua modal (cùng route, RBAC không đổi).
 */
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { BhytDailyHuddle } from '../../src/components/dashboard/BhytDailyHuddle';
import { layTatCaHoSoTuKho } from '../tien_ich/kho_du_lieu';
import { layXml1HoSo } from '../tien_ich/thong_ke_loi_dung_chung';
import BaoCaoVaThongKeLegacy from './baocao_va_thongke_legacy';

const QUICK_RANGE = [
  { id: '7D', label: '7 ngày' },
  { id: '30D', label: '30 ngày' },
  { id: '90D', label: '90 ngày' },
  { id: 'THANG_NAY', label: 'Tháng này' },
  { id: 'ALL', label: 'Toàn bộ' },
];

const BG = '#FFF0F5';
const PRIMARY = '#D81B60';

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

const dinhDangNgay = (d) => {
  if (!(d instanceof Date) || Number.isNaN(d.getTime())) return 'N/A';
  return d.toLocaleDateString('vi-VN');
};

/** Giống `layBangHoSo` trong kho_du_lieu — lấy mảng XML2/XML3 từ hồ sơ */
const layBangTuHoSo = (hoSo, ten) => {
  const lower = ten.toLowerCase();
  const raw = hoSo?.[lower] ?? hoSo?.[ten];
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === 'object') return [raw];
  return [];
};

function phangXmlTuDanhSachHoSo(danhSachHoSo) {
  const xml1Data = [];
  const xml2Data = [];
  const xml3Data = [];
  const arr = Array.isArray(danhSachHoSo) ? danhSachHoSo : [];
  for (let i = 0; i < arr.length; i += 1) {
    const hoSo = arr[i];
    const x1 = layXml1HoSo(hoSo);
    if (x1 && typeof x1 === 'object' && Object.keys(x1).length > 0) {
      xml1Data.push(x1);
    }
    layBangTuHoSo(hoSo, 'XML2').forEach((r) => xml2Data.push(r));
    layBangTuHoSo(hoSo, 'XML3').forEach((r) => xml3Data.push(r));
  }
  return { xml1Data, xml2Data, xml3Data };
}

export default function BaoCaoVaThongKe({ navigation }) {
  const [dangTai, setDangTai] = useState(true);
  const [duLieuGoc, setDuLieuGoc] = useState([]);
  const [quickRange, setQuickRange] = useState('30D');
  const [tuNgayText, setTuNgayText] = useState('');
  const [denNgayText, setDenNgayText] = useState('');
  const [moBaoCaoDayDu, setMoBaoCaoDayDu] = useState(false);

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

  const { xml1Data, xml2Data, xml3Data } = useMemo(
    () => phangXmlTuDanhSachHoSo(duLieuTrongKy),
    [duLieuTrongKy],
  );

  const xml1DataToanKho = useMemo(
    () => phangXmlTuDanhSachHoSo(duLieuGoc).xml1Data,
    [duLieuGoc],
  );

  useEffect(() => {
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
  }, []);

  if (dangTai) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={PRIMARY} />
        <Text style={styles.loadingText}>Đang tải dữ liệu từ kho...</Text>
      </View>
    );
  }

  const { tu, den } = khoangThoiGian;
  const labelKy =
    quickRange === 'ALL'
      ? 'Toàn bộ kho'
      : tu && den
        ? `${dinhDangNgay(tu)} — ${dinhDangNgay(den)}`
        : 'Chưa chọn kỳ hợp lệ';

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>📊 Báo cáo BHYT</Text>
        <Text style={styles.heroSub}>
          Giám sát nhanh (Daily Huddle). Báo cáo chi tiết & Excel giữ nguyên — nút bên dưới.
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.filterCard}>
          <Text style={styles.filterTitle}>Bộ lọc thời gian (áp dụng KPI dưới đây)</Text>
          <View style={styles.chipRow}>
            {QUICK_RANGE.map((q) => (
              <TouchableOpacity
                key={q.id}
                style={[styles.chip, quickRange === q.id && styles.chipActive]}
                onPress={() => setQuickRange(q.id)}
              >
                <Text style={[styles.chipText, quickRange === q.id && styles.chipTextActive]}>
                  {q.label}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.chip, quickRange === 'CUSTOM' && styles.chipActive]}
              onPress={() => setQuickRange('CUSTOM')}
            >
              <Text style={[styles.chipText, quickRange === 'CUSTOM' && styles.chipTextActive]}>
                Tùy chỉnh
              </Text>
            </TouchableOpacity>
          </View>
          {quickRange === 'CUSTOM' ? (
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="Từ ngày (YYYY-MM-DD)"
                placeholderTextColor="#9ca3af"
                value={tuNgayText}
                onChangeText={setTuNgayText}
                autoCapitalize="none"
              />
              <TextInput
                style={styles.input}
                placeholder="Đến ngày (YYYY-MM-DD)"
                placeholderTextColor="#9ca3af"
                value={denNgayText}
                onChangeText={setDenNgayText}
                autoCapitalize="none"
              />
            </View>
          ) : null}
          <Text style={styles.kyLabel}>Kỳ đang xem: {labelKy}</Text>
          {khoangThoiGian?.loiNhap ? (
            <Text style={styles.warnText}>Khoảng ngày không hợp lệ (từ phải ≤ đến).</Text>
          ) : null}
        </View>

        <TouchableOpacity
          style={styles.btnLegacy}
          onPress={() => setMoBaoCaoDayDu(true)}
          accessibilityRole="button"
        >
          <Text style={styles.btnLegacyText}>Mở báo cáo đầy đủ & xuất Excel (giao diện cũ)</Text>
        </TouchableOpacity>

        <BhytDailyHuddle
          xml1Data={xml1Data}
          xml2Data={xml2Data}
          xml3Data={xml3Data}
          xml1DataDayDuChoTaiNhap={xml1DataToanKho}
          embedded
        />
      </ScrollView>

      <Modal
        visible={moBaoCaoDayDu}
        animationType="slide"
        onRequestClose={() => setMoBaoCaoDayDu(false)}
      >
        <View style={styles.modalWrap}>
          <View style={styles.modalBar}>
            <TouchableOpacity
              style={styles.btnDong}
              onPress={() => setMoBaoCaoDayDu(false)}
              accessibilityRole="button"
            >
              <Text style={styles.btnDongText}>← Đóng (về Dashboard)</Text>
            </TouchableOpacity>
          </View>
          <BaoCaoVaThongKeLegacy navigation={navigation} duLieuKhoBanDau={duLieuGoc} />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BG,
  },
  loadingText: {
    marginTop: 12,
    fontFamily: 'Arial',
    fontSize: 14,
    color: PRIMARY,
  },
  hero: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  heroTitle: {
    fontFamily: 'Arial',
    fontSize: 22,
    fontWeight: '700',
    color: PRIMARY,
  },
  heroSub: {
    fontFamily: 'Arial',
    fontSize: 14,
    marginTop: 6,
    color: PRIMARY,
    opacity: 0.9,
  },
  scrollContent: {
    paddingHorizontal: 12,
    paddingBottom: 24,
  },
  filterCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(216, 27, 96, 0.15)',
  },
  filterTitle: {
    fontFamily: 'Arial',
    fontSize: 15,
    fontWeight: '600',
    color: PRIMARY,
    marginBottom: 10,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FCE4EC',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  chipActive: {
    backgroundColor: PRIMARY,
    borderColor: PRIMARY,
  },
  chipText: {
    fontFamily: 'Arial',
    fontSize: 14,
    color: PRIMARY,
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(216, 27, 96, 0.25)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    fontFamily: 'Arial',
    fontSize: 14,
    color: PRIMARY,
    backgroundColor: '#FFFFFF',
  },
  kyLabel: {
    fontFamily: 'Arial',
    fontSize: 14,
    marginTop: 12,
    color: PRIMARY,
  },
  warnText: {
    fontFamily: 'Arial',
    fontSize: 13,
    color: '#C62828',
    marginTop: 8,
  },
  btnLegacy: {
    backgroundColor: PRIMARY,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 12,
    alignItems: 'center',
  },
  btnLegacyText: {
    fontFamily: 'Arial',
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalWrap: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalBar: {
    paddingTop: 8,
    paddingHorizontal: 8,
    paddingBottom: 4,
    backgroundColor: '#FFF0F5',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(216, 27, 96, 0.2)',
  },
  btnDong: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  btnDongText: {
    fontFamily: 'Arial',
    fontSize: 15,
    fontWeight: '600',
    color: PRIMARY,
  },
});
