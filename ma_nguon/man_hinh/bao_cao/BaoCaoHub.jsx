/**
 * Hub báo cáo — ba nhánh theo CDSS-BHYT-SPEC-BC: Quản trị / Chuyên môn / Doanh thu BHYT.
 */
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { taiDuLieuNguonBaoCao } from '../../dich_vu/bao_cao_service';

const NHANH = [
  { id: 'QUAN_TRI', label: 'Quản trị', hint: 'KPI vận hành, tải hệ thống, SLA (theo đặc tả).' },
  { id: 'CHUYEN_MON', label: 'Chuyên môn', hint: 'Chất lượng lâm sàng, ICD/DVKT, cảnh báo CDSS.' },
  { id: 'DOANH_THU_BHYT', label: 'Doanh thu BHYT', hint: 'Thanh toán BHYT, chi phí, quyết toán (theo đặc tả).' },
];

const BG = '#F5F7FA';
const PRIMARY = '#1565C0';

export default function BaoCaoHub() {
  const [nhanh, setNhanh] = useState('QUAN_TRI');
  const [tai, setTai] = useState({ dangTai: true, loi: null, soHoSo: null });

  const nap = useCallback(async () => {
    setTai((s) => ({ ...s, dangTai: true, loi: null }));
    try {
      const kq = await taiDuLieuNguonBaoCao();
      setTai({ dangTai: false, loi: null, soHoSo: kq.so_ho_so_sau_gom });
    } catch (e) {
      setTai({
        dangTai: false,
        loi: e?.message || String(e),
        soHoSo: null,
      });
    }
  }, []);

  useEffect(() => {
    nap();
  }, [nap]);

  const meta = NHANH.find((x) => x.id === nhanh) || NHANH[0];

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Báo cáo</Text>
        <Text style={styles.heroSub}>
          Module mới theo đặc tả CDSS-BHYT-SPEC-BC — ba nhánh báo cáo; nội dung chi tiết sẽ bổ sung theo từng
          mục trong tài liệu.
        </Text>
        {tai.dangTai ? (
          <View style={styles.rowTai}>
            <ActivityIndicator color={PRIMARY} />
            <Text style={styles.metaLine}>Đang đọc kho hồ sơ…</Text>
          </View>
        ) : tai.loi ? (
          <Text style={styles.loi}>Không đọc được kho: {tai.loi}</Text>
        ) : (
          <Text style={styles.metaLine}>
            Kho hiện có {tai.soHoSo ?? 0} hồ sơ (đã gom trùng MA_LK).
          </Text>
        )}
      </View>

      <View style={styles.tabRow}>
        {NHANH.map((t) => {
          const active = t.id === nhanh;
          return (
            <TouchableOpacity
              key={t.id}
              style={[styles.tab, active && styles.tabActive]}
              onPress={() => setNhanh(t.id)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
            >
              <Text style={[styles.tabText, active && styles.tabTextActive]} numberOfLines={2}>
                {t.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.sectionTitle}>{meta.label}</Text>
        <Text style={styles.sectionHint}>{meta.hint}</Text>
        <Text style={styles.placeholder}>
          Khung màn hình đã sẵn sàng. Bước tiếp theo: triển khai bộ chỉ số, bộ lọc kỳ và xuất theo từng phần
          trong đặc tả kỹ thuật (route con có thể mở rộng dưới /reports/…).
        </Text>
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
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E0E0E0',
  },
  heroTitle: {
    fontFamily: 'Arial',
    fontSize: 22,
    fontWeight: '700',
    color: '#1a237e',
  },
  heroSub: {
    fontFamily: 'Arial',
    fontSize: 14,
    marginTop: 8,
    color: '#37474F',
    lineHeight: 20,
  },
  rowTai: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 12,
  },
  metaLine: {
    fontFamily: 'Arial',
    fontSize: 13,
    color: PRIMARY,
    marginTop: 10,
  },
  loi: {
    fontFamily: 'Arial',
    fontSize: 13,
    color: '#C62828',
    marginTop: 10,
  },
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 10,
    gap: 8,
    backgroundColor: '#FFFFFF',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 10,
    backgroundColor: '#ECEFF1',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  tabActive: {
    backgroundColor: PRIMARY,
  },
  tabText: {
    fontFamily: 'Arial',
    fontSize: 12,
    fontWeight: '600',
    color: '#455A64',
    textAlign: 'center',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  scroll: {
    padding: 16,
    paddingBottom: 32,
  },
  sectionTitle: {
    fontFamily: 'Arial',
    fontSize: 18,
    fontWeight: '700',
    color: '#263238',
  },
  sectionHint: {
    fontFamily: 'Arial',
    fontSize: 14,
    color: '#546E7A',
    marginTop: 6,
    lineHeight: 20,
  },
  placeholder: {
    fontFamily: 'Arial',
    fontSize: 14,
    color: '#607D8B',
    marginTop: 16,
    lineHeight: 22,
  },
});
