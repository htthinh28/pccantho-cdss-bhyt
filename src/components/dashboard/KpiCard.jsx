import { StyleSheet, Text, View } from 'react-native';

/**
 * Thẻ KPI tái sử dụng — Pink Theme Phương Châu, font Arial (web/iOS; Android fallback sans-serif nếu không có Arial).
 * @param {object} props
 * @param {string} props.title
 * @param {string} props.value — đã định dạng sẵn (tiền / % / số)
 * @param {string} [props.icon] — ký tự / emoji hiển thị bên trái
 * @param {'up'|'down'|'flat'} [props.trend]
 * @param {boolean} [props.isAlert] — vượt ngưỡng an toàn → màu cảnh báo
 */
export function KpiCard({ title, value, icon, trend = 'flat', isAlert = false }) {
  const trendLabel =
    trend === 'up' ? '↑' : trend === 'down' ? '↓' : '—';

  return (
    <View
      style={[styles.card, isAlert && styles.cardAlertBorder]}
      accessibilityRole="summary"
    >
      <View style={styles.rowTop}>
        {icon ? (
          <Text style={[styles.icon, isAlert && styles.textAlert]}>{icon}</Text>
        ) : null}
        <Text
          style={[styles.title, isAlert && styles.textAlert]}
          numberOfLines={2}
        >
          {title}
        </Text>
      </View>
      <Text style={[styles.value, isAlert && styles.valueAlert]}>{value}</Text>
      <Text style={[styles.trend, trend !== 'flat' && styles.trendActive]}>
        Xu hướng: {trendLabel}
      </Text>
    </View>
  );
}

const PRIMARY = '#D81B60';
const ACCENT = '#F48FB1';
const CARD = '#FFFFFF';
const ALERT = '#C62828';

const styles = StyleSheet.create({
  card: {
    backgroundColor: CARD,
    borderRadius: 12,
    padding: 16,
    minHeight: 120,
    borderWidth: 1,
    borderColor: 'rgba(216, 27, 96, 0.15)',
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  cardAlertBorder: {
    borderColor: ALERT,
    borderWidth: 1.5,
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  icon: {
    fontFamily: 'Arial',
    fontSize: 22,
    marginRight: 8,
    color: PRIMARY,
  },
  title: {
    fontFamily: 'Arial',
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
    color: PRIMARY,
    fontWeight: '600',
  },
  value: {
    fontFamily: 'Arial',
    fontSize: 22,
    lineHeight: 28,
    color: PRIMARY,
    fontWeight: '700',
  },
  valueAlert: {
    color: ALERT,
  },
  textAlert: {
    color: ALERT,
  },
  trend: {
    fontFamily: 'Arial',
    fontSize: 14,
    marginTop: 8,
    color: PRIMARY,
    opacity: 0.75,
  },
  trendActive: {
    opacity: 1,
    color: ACCENT,
  },
});

export const DASHBOARD_THEME = {
  background: '#FFF0F5',
  primary: PRIMARY,
  accent: ACCENT,
  card: CARD,
};
