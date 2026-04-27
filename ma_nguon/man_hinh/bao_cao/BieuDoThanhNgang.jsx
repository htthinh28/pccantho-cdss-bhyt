/**
 * Biểu đồ thanh ngang đơn giản (không thư viện ngoài) — báo cáo Chuyên môn / Quản trị.
 * Chuẩn hoá độ dài thanh theo max trong tập; animation stagger nhẹ khi dữ liệu đổi.
 */
import { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const MAU_MAC_DINH = ['#2563eb', '#7c3aed', '#db2777', '#ea580c', '#059669', '#0891b2', '#4f46e5', '#9333ea', '#0d9488', '#b45309'];

const laySo = (row, keySo) => {
  const raw = row?.[keySo];
  const n = Number(String(raw ?? '').replace(/,/g, '').trim());
  return Number.isFinite(n) ? n : 0;
};

export default function BieuDoThanhNgang({
  title,
  subtitle,
  rows = [],
  keyNhan = 'label',
  keySo = 'value',
  maxItems = 10,
  donVi = '',
  /** @type {string[]|null|undefined} palette từ bao_cao_viz_meta (SPEC-VIZ-1) */
  bangMau,
  /** Chạm dòng → drill-down (SPEC progressive disclosure) */
  onChonDong,
  /** Trường dùng so khớp khi tô sáng (vd ma_khoa, nhom_ma) */
  keyDongChon = 'label',
  /** Giá trị đang chọn (toggle cùng keyDongChon) */
  maDongChon = '',
}) {
  const slice = useMemo(
    () => (Array.isArray(rows) ? rows : []).slice(0, maxItems),
    [rows, maxItems],
  );
  const maxVal = useMemo(() => Math.max(...slice.map((r) => laySo(r, keySo)), 1), [slice, keySo]);
  const palette = useMemo(() => {
    const p = Array.isArray(bangMau) ? bangMau.filter((c) => typeof c === 'string' && c.trim()) : [];
    return p.length ? p : MAU_MAC_DINH;
  }, [bangMau]);

  const progresses = useRef([]);

  const n = slice.length;
  while (progresses.current.length < n) {
    progresses.current.push(new Animated.Value(0));
  }
  if (progresses.current.length > n) {
    progresses.current.length = n;
  }

  useEffect(() => {
    for (let i = 0; i < n; i += 1) {
      progresses.current[i]?.setValue(0);
    }
    const seq = [];
    for (let i = 0; i < n; i += 1) {
      const p = progresses.current[i];
      if (!p) continue;
      const so = laySo(slice[i], keySo);
      const pct = maxVal > 0 ? (so / maxVal) * 100 : 0;
      const target = Math.min(100, Math.max(0, pct));
      seq.push(
        Animated.timing(p, {
          toValue: target,
          duration: 520,
          delay: i * 60,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
      );
    }
    Animated.parallel(seq).start();
    return () => {
      seq.forEach((a) => a.stop && a.stop());
    };
  }, [slice, keySo, maxVal, n]);

  return (
    <View style={styles.wrap}>
      <View style={styles.accent} />
      <View style={styles.inner}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.sub}>{subtitle}</Text> : null}
        {slice.length === 0 ? (
          <Text style={styles.empty}>Chưa có dữ liệu để vẽ biểu đồ.</Text>
        ) : (
          slice.map((row, i) => {
            const label = String(row[keyNhan] ?? '').trim() || '—';
            const so = laySo(row, keySo);
            const p = progresses.current[i];
            const w = p
              ? p.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                  extrapolate: 'clamp',
                })
              : '0%';
            const mau = palette[i % palette.length];
            const keyVal = String(row[keyDongChon] ?? '').trim();
            const selected =
              onChonDong && maDongChon != null && maDongChon !== '' && keyVal === String(maDongChon).trim();
            const inner = (
              <>
                <Text style={styles.lab} numberOfLines={2}>
                  {label}
                </Text>
                <View style={styles.track}>
                  {p ? <Animated.View style={[styles.fill, { width: w, backgroundColor: mau }]} /> : null}
                </View>
                <Text style={styles.val}>
                  {so.toLocaleString('vi-VN')}
                  {donVi ? `\u00a0${donVi}` : ''}
                </Text>
              </>
            );
            return onChonDong ? (
              <TouchableOpacity
                key={`${String(label).slice(0, 40)}-${i}`}
                style={[styles.row, selected && styles.rowChon]}
                onPress={() => onChonDong(row)}
                activeOpacity={0.75}
                accessibilityRole="button"
                accessibilityLabel={`Lọc theo ${label}`}
              >
                {inner}
              </TouchableOpacity>
            ) : (
              <View key={`${String(label).slice(0, 40)}-${i}`} style={styles.row}>
                {inner}
              </View>
            );
          })
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.35)',
    ...Platform.select({
      web: { boxShadow: '0 6px 24px rgba(15,23,42,0.07)' },
      default: {
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.07,
        shadowRadius: 12,
        elevation: 2,
      },
    }),
  },
  accent: {
    height: 3,
    width: '100%',
    backgroundColor: '#6366f1',
  },
  inner: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  title: {
    fontFamily: 'Arial',
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 4,
  },
  sub: {
    fontFamily: 'Arial',
    fontSize: 12,
    color: '#64748b',
    marginBottom: 12,
    lineHeight: 18,
  },
  empty: {
    fontFamily: 'Arial',
    fontSize: 12,
    color: '#94a3b8',
    fontStyle: 'italic',
  },
  row: {
    marginBottom: 10,
  },
  rowChon: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    marginHorizontal: -6,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#db2777',
    backgroundColor: 'rgba(253,242,248,0.85)',
  },
  lab: {
    fontFamily: 'Arial',
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 4,
  },
  track: {
    height: 12,
    borderRadius: 8,
    backgroundColor: '#e2e8f0',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 8,
  },
  val: {
    fontFamily: 'Arial',
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 4,
    textAlign: 'right',
  },
});
