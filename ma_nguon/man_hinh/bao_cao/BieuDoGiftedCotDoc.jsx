/**
 * Cột dọc (tháng / nhóm ngắn) — react-native-gifted-charts; cuộn ngang khi nhiều điểm.
 */
import { useMemo } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';

const laySo = (row, keySo) => {
  const raw = row?.[keySo];
  const n = Number(String(raw ?? '').replace(/,/g, '').trim());
  return Number.isFinite(n) ? n : 0;
};

export default function BieuDoGiftedCotDoc({
  title,
  subtitle,
  rows = [],
  keyNhan = 'label',
  keySo = 'value',
  maxItems = 24,
  bangMau,
  accentGlow = '#0ea5e9',
}) {
  const slice = useMemo(
    () => (Array.isArray(rows) ? rows : []).slice(-maxItems),
    [rows, maxItems],
  );
  const palette = useMemo(() => {
    const p = Array.isArray(bangMau) ? bangMau.filter((c) => typeof c === 'string' && c.trim()) : [];
    return p.length ? p : ['#0ea5e9', '#6366f1', '#8b5cf6', '#14b8a6'];
  }, [bangMau]);

  const maxVal = useMemo(() => Math.max(...slice.map((r) => laySo(r, keySo)), 1), [slice, keySo]);

  const data = useMemo(
    () =>
      slice.map((row, i) => {
        const lab = String(row[keyNhan] ?? '').trim() || '—';
        return {
          value: laySo(row, keySo),
          label: lab.length > 8 ? `${lab.slice(0, 7)}…` : lab,
          frontColor: palette[i % palette.length],
          barBorderRadius: 5,
        };
      }),
    [slice, keyNhan, keySo, palette],
  );

  const { width: sw } = Dimensions.get('window');
  const chartW = Math.max(280, Math.min(560, slice.length * 36 + 80, sw - 24));
  const chartH = 200;

  if (!slice.length) {
    return (
      <View style={styles.wrap}>
        <View style={[styles.glow, { backgroundColor: accentGlow }]} />
        <View style={styles.inner}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.sub}>{subtitle}</Text> : null}
          <Text style={styles.empty}>Chưa có dữ liệu chuỗi thời gian.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <View style={[styles.glow, { backgroundColor: accentGlow }]} />
      <View style={styles.inner}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.sub}>{subtitle}</Text> : null}
        <ScrollView horizontal showsHorizontalScrollIndicator nestedScrollEnabled>
          <BarChart
            horizontal={false}
            data={data}
            maxValue={maxVal}
            noOfSections={4}
            barWidth={22}
            spacing={12}
            initialSpacing={10}
            endSpacing={16}
            width={chartW}
            height={chartH}
            hideRules={false}
            rulesColor="rgba(148,163,184,0.35)"
            xAxisThickness={1}
            yAxisThickness={0}
            yAxisTextStyle={styles.axisTxt}
            xAxisLabelTextStyle={styles.axisTxt}
            disableScroll
            isAnimated
            animationDuration={500}
          />
        </ScrollView>
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
    borderColor: 'rgba(14,165,233,0.28)',
  },
  glow: { height: 3, width: '100%', opacity: 0.95 },
  inner: { paddingHorizontal: 10, paddingVertical: 10 },
  title: {
    fontFamily: 'Arial',
    fontSize: 15,
    fontWeight: '800',
    color: '#0c4a6e',
    marginBottom: 4,
  },
  sub: {
    fontFamily: 'Arial',
    fontSize: 12,
    color: '#0369a1',
    marginBottom: 8,
    lineHeight: 18,
  },
  empty: { fontFamily: 'Arial', fontSize: 12, color: '#7dd3fc', fontStyle: 'italic' },
  axisTxt: { fontSize: 9, color: '#64748b', fontFamily: 'Arial' },
});
