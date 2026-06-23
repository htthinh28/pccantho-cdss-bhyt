/**
 * Vùng cuộn dọc kèm thanh cuộn phải (kéo thumb) — đồng bộ với bánh xe chuột / cuộn touch.
 * Dùng cho dashboard và các màn nội dung dài trên web.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useChuDe } from '../tien_ich/chu_de_giao_dien';

const CHIEU_CAO_THUMB_TOI_THIEU = 40;
const CHIEU_RONG_TRACK = 10;

const tinhThumb = ({ contentHeight, layoutHeight, offsetY }) => {
  if (layoutHeight <= 0 || contentHeight <= layoutHeight + 1) {
    return { canScroll: false, thumbHeight: 0, thumbTop: 0, maxScroll: 0 };
  }
  const maxScroll = contentHeight - layoutHeight;
  const thumbHeight = Math.max(
    CHIEU_CAO_THUMB_TOI_THIEU,
    (layoutHeight / contentHeight) * layoutHeight,
  );
  const maxThumbTop = Math.max(layoutHeight - thumbHeight, 0);
  const thumbTop = maxScroll > 0 ? (offsetY / maxScroll) * maxThumbTop : 0;
  return { canScroll: true, thumbHeight, thumbTop, maxScroll, maxThumbTop };
};

export default function KhuVucCuonCoThanhCuon({
  style,
  contentContainerStyle,
  children,
  scrollEventThrottle = 16,
  onScroll: onScrollProp,
  onContentSizeChange: onContentSizeChangeProp,
  onLayout: onLayoutProp,
  hienThanhCuon = true,
  ...scrollProps
}) {
  const CD = useChuDe();
  const scrollRef = useRef(null);
  const trackRef = useRef(null);
  const dangKeoRef = useRef(false);
  const keoRef = useRef({ pointerId: null, startClientY: 0, startOffsetY: 0 });

  const [metrics, setMetrics] = useState({
    contentHeight: 0,
    layoutHeight: 0,
    offsetY: 0,
  });

  const { canScroll, thumbHeight, thumbTop, maxScroll, maxThumbTop } = tinhThumb(metrics);
  const mauThumb = CD.brand?.mauChinh || '#D81B60';

  const capNhatMetrics = useCallback((patch) => {
    setMetrics((prev) => ({ ...prev, ...patch }));
  }, []);

  const cuonDenViTri = useCallback((offsetY) => {
    setMetrics((prev) => {
      const max = Math.max(0, prev.contentHeight - prev.layoutHeight);
      const clamped = Math.max(0, Math.min(offsetY, max));
      scrollRef.current?.scrollTo?.({ y: clamped, animated: false });
      return { ...prev, offsetY: clamped };
    });
  }, []);

  const handleScroll = useCallback((e) => {
    if (dangKeoRef.current) return;
    const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
    capNhatMetrics({
      offsetY: contentOffset.y,
      contentHeight: contentSize.height,
      layoutHeight: layoutMeasurement.height,
    });
    onScrollProp?.(e);
  }, [capNhatMetrics, onScrollProp]);

  const handleContentSizeChange = useCallback((w, h) => {
    capNhatMetrics({ contentHeight: h });
    onContentSizeChangeProp?.(w, h);
  }, [capNhatMetrics, onContentSizeChangeProp]);

  const handleLayout = useCallback((e) => {
    const { height } = e.nativeEvent.layout;
    capNhatMetrics({ layoutHeight: height });
    onLayoutProp?.(e);
  }, [capNhatMetrics, onLayoutProp]);

  const batDauKeoThumb = useCallback((e) => {
    if (Platform.OS !== 'web' || !canScroll) return;
    e?.preventDefault?.();
    e?.stopPropagation?.();
    dangKeoRef.current = true;
    setMetrics((prev) => {
      keoRef.current = {
        pointerId: e.nativeEvent?.pointerId ?? null,
        startClientY: e.nativeEvent?.clientY ?? 0,
        startOffsetY: prev.offsetY,
      };
      return prev;
    });
    try {
      e.currentTarget?.setPointerCapture?.(e.nativeEvent?.pointerId);
    } catch {
      /* ignore */
    }
  }, [canScroll]);

  const xuLyDiChuyenKeo = useCallback((clientY) => {
    if (!dangKeoRef.current || !canScroll || maxThumbTop <= 0) return;
    const deltaY = clientY - keoRef.current.startClientY;
    const scrollDelta = (deltaY / maxThumbTop) * maxScroll;
    cuonDenViTri(keoRef.current.startOffsetY + scrollDelta);
  }, [canScroll, cuonDenViTri, maxScroll, maxThumbTop]);

  const ketThucKeo = useCallback(() => {
    dangKeoRef.current = false;
    keoRef.current.pointerId = null;
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'web') return undefined;

    const onPointerMove = (e) => {
      if (!dangKeoRef.current) return;
      if (keoRef.current.pointerId != null && e.pointerId !== keoRef.current.pointerId) return;
      xuLyDiChuyenKeo(e.clientY);
    };
    const onPointerUp = (e) => {
      if (!dangKeoRef.current) return;
      if (keoRef.current.pointerId != null && e.pointerId !== keoRef.current.pointerId) return;
      ketThucKeo();
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
    };
  }, [ketThucKeo, xuLyDiChuyenKeo]);

  const nhayDenViTriTrack = useCallback((e) => {
    if (Platform.OS !== 'web' || !canScroll || dangKeoRef.current) return;
    if (e?.target !== e?.currentTarget && e?.target?.dataset?.cdssScrollThumb === '1') return;
    const trackEl = trackRef.current;
    if (!trackEl?.getBoundingClientRect) return;
    const rect = trackEl.getBoundingClientRect();
    const clickY = (e.nativeEvent?.clientY ?? e.clientY ?? 0) - rect.top;
    const targetTop = Math.max(0, Math.min(clickY - thumbHeight / 2, maxThumbTop));
    const offsetY = maxThumbTop > 0 ? (targetTop / maxThumbTop) * maxScroll : 0;
    cuonDenViTri(offsetY);
  }, [canScroll, cuonDenViTri, maxScroll, maxThumbTop, thumbHeight]);

  const hienTrack = hienThanhCuon && canScroll;

  return (
    <View style={[styles.wrap, style]}>
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={contentContainerStyle}
        showsVerticalScrollIndicator={Platform.OS !== 'web'}
        scrollEventThrottle={scrollEventThrottle}
        onScroll={handleScroll}
        onContentSizeChange={handleContentSizeChange}
        onLayout={handleLayout}
        {...scrollProps}
      >
        {children}
      </ScrollView>

      {hienTrack ? (
        <View style={styles.track_col}>
          <View
            ref={trackRef}
            style={styles.track}
            {...Platform.select({
              web: { onClick: nhayDenViTriTrack },
              default: {},
            })}
          >
            <View
              {...Platform.select({
                web: { dataSet: { cdssScrollThumb: '1' } },
                default: {},
              })}
              style={[
                styles.thumb,
                {
                  height: thumbHeight,
                  top: thumbTop,
                  backgroundColor: mauThumb,
                },
              ]}
              onStartShouldSetResponder={() => true}
              onResponderGrant={batDauKeoThumb}
              {...Platform.select({
                web: {
                  onPointerDown: batDauKeoThumb,
                  onPointerMove: (e) => {
                    if (dangKeoRef.current) xuLyDiChuyenKeo(e.nativeEvent?.clientY ?? 0);
                  },
                  onPointerUp: ketThucKeo,
                  onPointerCancel: ketThucKeo,
                },
                default: {},
              })}
            />
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    flexDirection: 'row',
    minHeight: 0,
    minWidth: 0,
  },
  scroll: {
    flex: 1,
    minWidth: 0,
  },
  track_col: {
    width: CHIEU_RONG_TRACK + 8,
    paddingLeft: 4,
    paddingVertical: 4,
    alignSelf: 'stretch',
  },
  track: {
    flex: 1,
    width: CHIEU_RONG_TRACK,
    borderRadius: CHIEU_RONG_TRACK / 2,
    backgroundColor: 'rgba(148, 163, 184, 0.28)',
    position: 'relative',
    ...Platform.select({
      web: { cursor: 'pointer', touchAction: 'none' },
      default: {},
    }),
  },
  thumb: {
    position: 'absolute',
    left: 1,
    right: 1,
    borderRadius: (CHIEU_RONG_TRACK - 2) / 2,
    opacity: 0.82,
    ...Platform.select({
      web: {
        cursor: 'grab',
        touchAction: 'none',
        transition: 'background-color 0.15s ease',
      },
      default: {},
    }),
  },
});
