/**
 * Heatmap proxy khoa × nhóm từ bc_cm_00_khoa_nhom_loi (SPEC 4.2).
 * Ô chạm được — đồng bộ drill với biểu đồ / ma trận (progressive disclosure).
 * Toàn màn hình: Modal fullScreen + lưới mở rộng (maxHang/maxCot lớn hơn).
 */
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMemo, useCallback, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { layMauHeatmap } from '../../dich_vu/bao_cao_viz_meta';
import { khoaDrillKhop } from '../../dich_vu/bao_cao_drill_chuan';

const toNum = (v) => {
  const n = Number(String(v ?? '').replace(/,/g, '').trim());
  return Number.isFinite(n) ? n : 0;
};

/** @returns {{ hangLabels: string[], cotLabels: string[], oVuong: Map<string, number>, maxSo: number }} */
const tinhLuoiHeatmapCm00 = (rows, maxHang, maxCot) => {
  const arr = Array.isArray(rows) ? rows : [];
  const byKhoa = new Map();
  const byNhom = new Map();
  for (const r of arr) {
    const mk = String(r.ma_khoa || '(trống)').trim() || '(trống)';
    const mn = String(r.ma_nhom || '').trim() || '—';
    const sl = toNum(r.so_loi);
    byKhoa.set(mk, (byKhoa.get(mk) || 0) + sl);
    byNhom.set(mn, (byNhom.get(mn) || 0) + sl);
  }
  const hangLabels = [...byKhoa.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxHang)
    .map(([k]) => k);
  const cotLabels = [...byNhom.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxCot)
    .map(([k]) => k);
  const map = new Map();
  let maxSo = 1;
  for (const r of arr) {
    const mk = String(r.ma_khoa || '(trống)').trim() || '(trống)';
    const mn = String(r.ma_nhom || '').trim() || '—';
    if (!hangLabels.includes(mk) || !cotLabels.includes(mn)) continue;
    const sl = toNum(r.so_loi);
    const key = `${mk}\t${mn}`;
    map.set(key, (map.get(key) || 0) + sl);
    if (map.get(key) > maxSo) maxSo = map.get(key);
  }
  return { hangLabels, cotLabels, oVuong: map, maxSo: maxSo || 1 };
};

function LuoiHeatmap({
  hangLabels,
  cotLabels,
  oVuong,
  maxSo,
  labelW,
  headH,
  cellW,
  cellH,
  fsHead,
  fsRow,
  fsCell,
  styleO,
  onChonO,
}) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator nestedScrollEnabled>
      <View>
        <View style={[styles.rowHead, { minHeight: headH }]}>
          <View style={[styles.corner, { width: labelW, height: headH }]} />
          {cotLabels.map((cn) => (
            <View key={String(cn)} style={[styles.cellHead, { width: cellW, height: headH }]}>
              <Text style={[styles.cellHeadTxt, { fontSize: fsHead }]} numberOfLines={3}>
                {cn}
              </Text>
            </View>
          ))}
        </View>
        {hangLabels.map((mk) => (
          <View key={String(mk)} style={styles.row}>
            <View style={[styles.rowLabel, { width: labelW }]}>
              <Text style={[styles.rowLabelTxt, { fontSize: fsRow }]} numberOfLines={3}>
                {mk}
              </Text>
            </View>
            {cotLabels.map((cn) => {
              const v = oVuong.get(`${mk}\t${cn}`) || 0;
              const tyLe = maxSo > 0 ? v / maxSo : 0;
              const cellBody = (
                <View style={[styles.cell, { width: cellW, height: cellH }, styleO(mk, cn, tyLe)]}>
                  <Text style={[styles.cellVal, { fontSize: fsCell }]}>{v > 0 ? v : ''}</Text>
                </View>
              );
              if (!onChonO) {
                return <View key={`${mk}-${cn}`}>{cellBody}</View>;
              }
              return (
                <Pressable
                  key={`${mk}-${cn}`}
                  accessibilityRole="button"
                  accessibilityLabel={`Khoa ${mk}, nhóm ${cn}, ${v} lỗi`}
                  onPress={() => onChonO({ ma_khoa: mk, ma_nhom: cn })}
                  style={({ pressed }) => [{ opacity: pressed ? 0.88 : 1 }]}
                >
                  {cellBody}
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const DIM_INLINE = {
  labelW: 88,
  headH: 40,
  cellW: 52,
  cellH: 36,
  fsHead: 9,
  fsRow: 10,
  fsCell: 11,
};

export default function HeatmapCm00({
  title,
  subtitle,
  rows = [],
  hienThi,
  maxHang = 8,
  maxCot = 8,
  /** Giới hạn khoa/nhóm khi mở toàn màn hình (mặc định rộng hơn khung nhúng). */
  maxHangToanManh = 18,
  maxCotToanManh = 18,
  maKhoaHighlight = '',
  maNhomHighlight = '',
  onChonO,
}) {
  const [moToanManh, setMoToanManh] = useState(false);
  const win = useWindowDimensions();

  const luoiNhinThuong = useMemo(() => tinhLuoiHeatmapCm00(rows, maxHang, maxCot), [rows, maxHang, maxCot]);
  const luoiToanManh = useMemo(
    () => tinhLuoiHeatmapCm00(rows, maxHangToanManh, maxCotToanManh),
    [rows, maxHangToanManh, maxCotToanManh],
  );

  const nhomKhop = useCallback(
    (a, b) => String(a ?? '').trim() === String(b ?? '').trim(),
    [],
  );

  const styleO = useCallback(
    (mk, mn, tyLe) => {
      const bg = layMauHeatmap(hienThi, tyLe);
      const rowH = maKhoaHighlight != null && khoaDrillKhop(mk, maKhoaHighlight);
      const colH = maNhomHighlight != null && maNhomHighlight !== '' && nhomKhop(mn, maNhomHighlight);
      const goc = rowH && colH ? 3 : rowH || colH ? 2 : 1;
      return {
        backgroundColor: bg,
        borderWidth: goc,
        borderColor: rowH && colH ? '#0f172a' : rowH || colH ? '#2563eb' : 'rgba(255,255,255,0.4)',
      };
    },
    [hienThi, maKhoaHighlight, maNhomHighlight, nhomKhop],
  );

  const dimsFs = useMemo(() => {
    const nh = luoiToanManh.hangLabels.length || 1;
    const nc = luoiToanManh.cotLabels.length || 1;
    const pad = 20;
    const usableW = Math.max(280, win.width - pad * 2);
    const labelW = Math.min(160, Math.max(96, Math.round(usableW * 0.24)));
    const cellW = Math.max(44, Math.min(76, Math.floor((usableW - labelW - 8) / Math.max(nc, 1))));
    const reservedY = 120;
    const usableH = Math.max(200, win.height - reservedY);
    const cellH = Math.max(40, Math.min(58, Math.floor((usableH - DIM_INLINE.headH - 8) / Math.max(nh, 1))));
    return {
      labelW,
      headH: 44,
      cellW,
      cellH,
      fsHead: 10,
      fsRow: 11,
      fsCell: 13,
    };
  }, [win.width, win.height, luoiToanManh.hangLabels.length, luoiToanManh.cotLabels.length]);

  const { hangLabels, cotLabels, oVuong, maxSo } = luoiNhinThuong;

  if (!hangLabels.length || !cotLabels.length) {
    return (
      <View style={styles.wrap}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.sub}>{subtitle}</Text> : null}
        <Text style={styles.empty}>Chưa đủ cặp khoa × nhóm để vẽ heatmap.</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.headRow}>
        <View style={styles.headTextCol}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.sub}>{subtitle}</Text> : null}
        </View>
        <TouchableOpacity
          style={styles.btnFs}
          onPress={() => setMoToanManh(true)}
          accessibilityRole="button"
          accessibilityLabel="Mở heatmap toàn màn hình"
        >
          <MaterialCommunityIcons name="fullscreen" size={22} color="#831843" />
          <Text style={styles.btnFsTxt}>Toàn màn hình</Text>
        </TouchableOpacity>
      </View>
      {onChonO ? (
        <Text style={styles.hintCham}>Chạm ô để đồng bộ lọc khoa + nhóm với biểu đồ bên dưới.</Text>
      ) : null}
      <LuoiHeatmap
        hangLabels={hangLabels}
        cotLabels={cotLabels}
        oVuong={oVuong}
        maxSo={maxSo}
        styleO={styleO}
        onChonO={onChonO}
        {...DIM_INLINE}
      />

      <Modal
        visible={moToanManh}
        animationType="fade"
        presentationStyle="fullScreen"
        statusBarTranslucent
        onRequestClose={() => setMoToanManh(false)}
      >
        <SafeAreaView style={styles.modalSafe} edges={['top', 'left', 'right', 'bottom']}>
          <View style={styles.modalTopBar}>
            <View style={styles.modalTitleCol}>
              <Text style={styles.modalTitle}>{title}</Text>
              {subtitle ? <Text style={styles.modalSub}>{subtitle}</Text> : null}
            </View>
            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setMoToanManh(false)}
              accessibilityRole="button"
              accessibilityLabel="Đóng toàn màn hình"
            >
              <MaterialCommunityIcons name="close" size={28} color="#fff" />
              <Text style={styles.modalCloseTxt}>Đóng</Text>
            </TouchableOpacity>
          </View>
          {onChonO ? (
            <Text style={styles.modalHint}>Chạm ô để drill — cùng logic với khung nhúng.</Text>
          ) : null}
          <ScrollView
            style={styles.modalScrollV}
            contentContainerStyle={styles.modalScrollInner}
            nestedScrollEnabled
            showsVerticalScrollIndicator
          >
            <LuoiHeatmap
              hangLabels={luoiToanManh.hangLabels}
              cotLabels={luoiToanManh.cotLabels}
              oVuong={luoiToanManh.oVuong}
              maxSo={luoiToanManh.maxSo}
              styleO={styleO}
              onChonO={
                onChonO
                  ? (cell) => {
                      onChonO(cell);
                      setMoToanManh(false);
                    }
                  : undefined
              }
              {...dimsFs}
            />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 16,
    borderRadius: 16,
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderWidth: 1,
    borderColor: 'rgba(236,72,153,0.25)',
  },
  headRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 4,
  },
  headTextCol: { flex: 1, minWidth: 0 },
  btnFs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(253,242,248,0.95)',
    borderWidth: 1,
    borderColor: 'rgba(190,24,93,0.35)',
  },
  btnFsTxt: {
    fontFamily: 'Arial',
    fontSize: 12,
    fontWeight: '700',
    color: '#831843',
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
    marginBottom: 0,
  },
  hintCham: {
    fontFamily: 'Arial',
    fontSize: 11,
    color: '#64748b',
    marginBottom: 8,
  },
  empty: { fontFamily: 'Arial', fontSize: 12, color: '#fda4af', fontStyle: 'italic' },
  rowHead: { flexDirection: 'row' },
  corner: { height: 40 },
  cellHead: {
    padding: 2,
    justifyContent: 'flex-end',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#fce7f3',
  },
  cellHeadTxt: { fontWeight: '700', color: '#9d174d', textAlign: 'center' },
  row: { flexDirection: 'row', alignItems: 'stretch' },
  rowLabel: {
    paddingVertical: 6,
    paddingRight: 4,
    justifyContent: 'center',
    borderRightWidth: 1,
    borderColor: '#fce7f3',
  },
  rowLabelTxt: { fontWeight: '600', color: '#500724' },
  cell: {
    margin: 1,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cellVal: { fontWeight: '800', color: '#1f2937' },
  modalSafe: {
    flex: 1,
    backgroundColor: '#fdf2f8',
  },
  modalTopBar: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#831843',
    gap: 8,
  },
  modalTitleCol: { flex: 1, minWidth: 0 },
  modalTitle: {
    fontFamily: 'Arial',
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
  },
  modalSub: {
    fontFamily: 'Arial',
    fontSize: 12,
    color: 'rgba(255,255,255,0.88)',
    marginTop: 4,
  },
  modalClose: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  modalCloseTxt: {
    fontFamily: 'Arial',
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
  modalHint: {
    fontFamily: 'Arial',
    fontSize: 12,
    color: '#64748b',
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  modalScrollV: { flex: 1 },
  modalScrollInner: { padding: 12, paddingBottom: 24 },
});
