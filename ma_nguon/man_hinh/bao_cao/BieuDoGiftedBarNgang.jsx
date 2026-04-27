/**
 * Biểu đồ cột ngang (MVP) — react-native-gifted-charts: tooltip/chạm, WCAG-friendly.
 * Dùng nhánh Chuyên môn / Quản trị khi cần tương tác tốt hơn thanh Animated tự vẽ.
 */
import { useMemo } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';

const laySo = (row, keySo) => {
  const raw = row?.[keySo];
  const n = Number(String(raw ?? '').replace(/,/g, '').trim());
  return Number.isFinite(n) ? n : 0;
};

export default function BieuDoGiftedBarNgang({
  title,
  subtitle,
  rows = [],
  keyNhan = 'label',
  keySo = 'value',
  maxItems = 10,
  bangMau,
  onChonDong,
  keyDongChon = 'label',
  maDongChon = '',
}) {
  const slice = useMemo(
    () => (Array.isArray(rows) ? rows : []).slice(0, maxItems),
    [rows, maxItems],
  );
  const palette = useMemo(() => {
    const p = Array.isArray(bangMau) ? bangMau.filter((c) => typeof c === 'string' && c.trim()) : [];
    return p.length ? p : ['#E83E8C', '#FF6B6B', '#4ECDC4', '#45B7D1'];
  }, [bangMau]);

  const maxVal = useMemo(() => Math.max(...slice.map((r) => laySo(r, keySo)), 1), [slice, keySo]);

  const data = useMemo(
    () =>
      slice.map((row, i) => {
        const lab = String(row[keyNhan] ?? '').trim() || '—';
        return {
          value: laySo(row, keySo),
          label: lab.length > 18 ? `${lab.slice(0, 16)}…` : lab,
          frontColor: palette[i % palette.length],
          barBorderRadius: 6,
        };
      }),
    [slice, keyNhan, keySo, palette],
  );

  const focusedBarIndex = useMemo(() => {
    if (!onChonDong || maDongChon == null || maDongChon === '') return undefined;
    const i = slice.findIndex((r) => String(r[keyDongChon] ?? '').trim() === String(maDongChon).trim());
    return i >= 0 ? i : undefined;
  }, [slice, keyDongChon, maDongChon, onChonDong]);

  const { width: sw } = Dimensions.get('window');
  const chartW = Math.min(380, Math.max(240, sw - 56));
  const chartH = Math.min(520, 72 + slice.length * 34);

  if (!slice.length) {
    return (
      <View style={styles.wrap}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.sub}>{subtitle}</Text> : null}
        <Text style={styles.empty}>Chưa có dữ liệu để vẽ biểu đồ.</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.glow} />
      <View style={styles.inner}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.sub}>{subtitle}</Text> : null}
        <BarChart
          horizontal
          data={data}
          maxValue={maxVal}
          noOfSections={4}
          barWidth={16}
          spacing={22}
          initialSpacing={6}
          endSpacing={12}
          width={chartW}
          height={chartH}
          hideRules={false}
          rulesColor="rgba(148,163,184,0.35)"
          rulesType="solid"
          xAxisThickness={0}
          yAxisThickness={0}
          yAxisTextStyle={styles.axisTxt}
          xAxisLabelTextStyle={styles.axisTxt}
          disableScroll={slice.length <= 6}
          focusBarOnPress={!!onChonDong}
          focusedBarIndex={focusedBarIndex}
          onPress={
            onChonDong
              ? (_item, index) => {
                  const row = slice[index];
                  if (row) onChonDong(row);
                }
              : undefined
          }
          isAnimated
          animationDuration={600}
          activeOpacity={0.75}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 14,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.98)',
    borderWidth: 1,
    borderColor: 'rgba(244,114,182,0.35)',
  },
  glow: {
    height: 3,
    width: '100%',
    backgroundColor: '#f472b6',
    opacity: 0.95,
  },
  inner: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  title: {
    fontFamily: 'Arial',
    fontSize: 15,
    fontWeight: '800',
    color: '#831843',
    marginBottom: 4,
  },
  sub: {
    fontFamily: 'Arial',
    fontSize: 12,
    color: '#9d174d',
    marginBottom: 8,
    lineHeight: 18,
  },
  empty: {
    fontFamily: 'Arial',
    fontSize: 12,
    color: '#fda4af',
    fontStyle: 'italic',
  },
  axisTxt: {
    fontSize: 10,
    color: '#64748b',
    fontFamily: 'Arial',
  },
});
