import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';

/** Chiều rộng tham chiếu (iPhone 12/13) để scale font/spacing vừa mắt trên tablet & điện thoại */
const BASE_WIDTH_REF = 390;

/**
 * Breakpoint thống nhất — smartphone / tablet / laptop / PC.
 * Gộp các ngưỡng đang dùng rải rác (420, 768, 860, 960, 1024).
 */
export const BREAKPOINTS = {
  xs: 420,
  sm: 768,
  md: 860,
  lg: 960,
  xl: 1024,
  xxl: 1280,
};

/**
 * Co giãn nhẹ theo độ phân giải — clamp để tránh chữ quá to/nhỏ.
 * Dùng cho chip/tab cần đọc lâu trên màn nhỏ.
 */
export function useScaleGiaoDien() {
  const { width, height } = useWindowDimensions();
  return useMemo(() => {
    const raw = width / BASE_WIDTH_REF;
    const scale = Math.min(Math.max(raw, 0.88), 1.14);
    const font = (px) => Math.max(11, Math.round(px * scale));
    const space = (px) => Math.max(4, Math.round(px * scale));
    return { width, height, scale, font, space };
  }, [width, height]);
}

/**
 * Phân loại thiết bị theo chiều rộng cửa sổ (không phụ thuộc Platform.OS).
 * - phone: smartphone (< 768)
 * - tablet: tablet portrait / phablet (768–1023)
 * - laptop: laptop nhỏ (1024–1279)
 * - desktop: PC / màn rộng (≥ 1280)
 */
export function useLayoutMode() {
  const { width, height } = useWindowDimensions();
  return useMemo(() => {
    const mode = width >= BREAKPOINTS.xxl
      ? 'desktop'
      : width >= BREAKPOINTS.xl
        ? 'laptop'
        : width >= BREAKPOINTS.sm
          ? 'tablet'
          : 'phone';

    return {
      width,
      height,
      mode,
      isPhone: width < BREAKPOINTS.sm,
      isTablet: width >= BREAKPOINTS.sm && width < BREAKPOINTS.xl,
      isLaptop: width >= BREAKPOINTS.xl && width < BREAKPOINTS.xxl,
      isDesktop: width >= BREAKPOINTS.xxl,
      /** Sidebar trái cố định (≥ 860px) */
      dungSidebarTrai: width >= BREAKPOINTS.md,
      /** Xếp dọc sidebar + nội dung (< 960px) */
      dungBoCucDoc: width < BREAKPOINTS.lg,
      /** Hai cột nội dung (≥ 860px) */
      dungHaiCot: width >= BREAKPOINTS.md,
      /** Giới hạn chiều rộng nội dung trên PC */
      maxContentWidth: width >= BREAKPOINTS.xxl
        ? 1440
        : width >= BREAKPOINTS.xl
          ? 1200
          : undefined,
    };
  }, [width, height]);
}

/** Sidebar tỷ lệ % chiều rộng (mapping, EBM, …). */
export function rongSidebarTheoMan(width, { min = 148, max = 292, ratio = 0.22 } = {}) {
  const w = width || 800;
  return Math.min(max, Math.max(min, Math.round(w * ratio)));
}

/** Sidebar 3 bậc cho quản lý danh mục / luật. */
export function rongSidebarCap(width) {
  if (width < BREAKPOINTS.xs) return 196;
  if (width < BREAKPOINTS.sm) return 232;
  return 292;
}
