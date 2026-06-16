/**
 * Thanh điều khiển ẩn/hiện và ghim cho thẻ panel (Tổng quan và tái sử dụng).
 */
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { CD } from '../tien_ich/chu_de_giao_dien';

const ThanhDieuKhienPanel = ({
  tieuDe,
  phuDe = '',
  an = false,
  ghim = false,
  onToggleAn,
  onToggleGhim,
  compact = false,
}) => (
  <View style={[styles.wrap, compact && styles.wrap_compact]}>
    <View style={styles.text_block}>
      {tieuDe ? (
        <Text style={[styles.tieu_de, compact && styles.tieu_de_compact]} numberOfLines={1}>
          {tieuDe}
        </Text>
      ) : null}
      {phuDe && !compact ? (
        <Text style={styles.phu_de} numberOfLines={1}>{phuDe}</Text>
      ) : null}
    </View>
    <View style={styles.actions}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={ghim ? 'Bỏ ghim thẻ' : 'Ghim thẻ'}
        onPress={onToggleGhim}
        style={({ pressed, hovered }) => [
          styles.btn,
          ghim && styles.btn_active,
          Platform.OS === 'web' && hovered && styles.btn_hover,
          pressed && styles.btn_pressed,
        ]}
      >
        <Text style={[styles.btn_icon, ghim && styles.btn_icon_active]}>{ghim ? '📌' : '📍'}</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={an ? 'Hiện thẻ' : 'Ẩn thẻ'}
        onPress={onToggleAn}
        style={({ pressed, hovered }) => [
          styles.btn,
          Platform.OS === 'web' && hovered && styles.btn_hover,
          pressed && styles.btn_pressed,
        ]}
      >
        <Text style={styles.btn_icon}>{an ? '👁' : '🙈'}</Text>
      </Pressable>
    </View>
  </View>
);

export const stylePanelGhim = (ghim) => (ghim && Platform.OS === 'web'
  ? { position: 'sticky', top: 8, zIndex: 30, alignSelf: 'flex-start' }
  : null);

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    flex: 1,
  },
  wrap_compact: {
    minHeight: 36,
  },
  text_block: {
    flex: 1,
    minWidth: 0,
  },
  tieu_de: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    fontFamily: CD.font.family,
  },
  tieu_de_compact: {
    fontSize: 13,
    color: '#0F172A',
    textTransform: 'none',
    letterSpacing: 0,
  },
  phu_de: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
    fontFamily: CD.font.family,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 0,
  },
  btn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btn_active: {
    borderColor: '#FBCFE8',
    backgroundColor: '#FDF2F8',
  },
  btn_hover: {
    borderColor: '#CBD5E1',
    backgroundColor: '#F8FAFC',
  },
  btn_pressed: {
    opacity: 0.75,
  },
  btn_icon: {
    fontSize: 15,
    lineHeight: 18,
  },
  btn_icon_active: {
    fontSize: 14,
  },
});

export default ThanhDieuKhienPanel;
