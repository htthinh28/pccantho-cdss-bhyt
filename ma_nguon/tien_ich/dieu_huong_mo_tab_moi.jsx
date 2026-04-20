import { Platform } from 'react-native';
import { getPathFromState } from '@react-navigation/native';
import { CAU_HINH_LIEN_KET } from '../dieu_huong/cau_hinh_lien_ket';

/**
 * Web: mở màn đích trong tab/cửa sổ trình duyệt mới, giữ nguyên tab hiện tại.
 * Native: `navigation.navigate` như cũ (không có khái niệm tab).
 */
export const dieuHuongMoTabMoi = (navigation, tenManHinh, thamSo) => {
  if (!navigation?.navigate) return;
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    navigation.navigate(tenManHinh, thamSo);
    return;
  }
  try {
    const route = {
      key: `${String(tenManHinh)}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
      name: tenManHinh,
      ...(thamSo !== undefined && thamSo !== null ? { params: thamSo } : {}),
    };
    const state = { routes: [route], index: 0 };
    const path = getPathFromState(state, CAU_HINH_LIEN_KET.config);
    const pathNorm = path.startsWith('/') ? path : `/${path}`;
    const href = `${window.location.origin}${pathNorm}`;
    window.open(href, '_blank', 'noopener,noreferrer');
  } catch (e) {
    console.warn('[DieuHuongMoTabMoi]', e?.message || e);
    navigation.navigate(tenManHinh, thamSo);
  }
};
