/**
 * Lưu tùy chọn ẩn/hiện và ghim cho các thẻ panel trên màn Tổng quan.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

export const KEY_TONG_QUAN_PANEL_UI = 'CDSS_TONG_QUAN_PANEL_UI_V1';

export const PANEL_TONG_QUAN = Object.freeze({
  DIEU_HUONG: 'dieuHuong',
  LOC_QPS: 'locQps',
});

const MAC_DINH = Object.freeze({
  [PANEL_TONG_QUAN.DIEU_HUONG]: { an: false, ghim: false },
  [PANEL_TONG_QUAN.LOC_QPS]: { an: false, ghim: false },
});

const chuanHoaTrangThai = (raw) => ({
  an: Boolean(raw?.an),
  ghim: Boolean(raw?.ghim),
});

export const trangThaiPanelMacDinh = () => ({
  [PANEL_TONG_QUAN.DIEU_HUONG]: { ...MAC_DINH[PANEL_TONG_QUAN.DIEU_HUONG] },
  [PANEL_TONG_QUAN.LOC_QPS]: { ...MAC_DINH[PANEL_TONG_QUAN.LOC_QPS] },
});

export const taiTuyChonPanelTongQuan = async () => {
  try {
    const raw = await AsyncStorage.getItem(KEY_TONG_QUAN_PANEL_UI);
    if (!raw) return trangThaiPanelMacDinh();
    const parsed = JSON.parse(raw);
    return {
      [PANEL_TONG_QUAN.DIEU_HUONG]: chuanHoaTrangThai(parsed?.[PANEL_TONG_QUAN.DIEU_HUONG] ?? MAC_DINH[PANEL_TONG_QUAN.DIEU_HUONG]),
      [PANEL_TONG_QUAN.LOC_QPS]: chuanHoaTrangThai(parsed?.[PANEL_TONG_QUAN.LOC_QPS] ?? MAC_DINH[PANEL_TONG_QUAN.LOC_QPS]),
    };
  } catch {
    return trangThaiPanelMacDinh();
  }
};

export const luuTuyChonPanelTongQuan = async (state) => {
  try {
    await AsyncStorage.setItem(KEY_TONG_QUAN_PANEL_UI, JSON.stringify(state));
  } catch {
    /* bỏ qua quota / private mode */
  }
};
