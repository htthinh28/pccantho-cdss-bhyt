/**
 * Dịch vụ báo cáo CDSS-BHYT — lớp tổng hợp đọc từ kho (không ghi metadata vào kho).
 * Đặc tả: CDSS-BHYT-SPEC-BC (ba nhánh: Quản trị / Chuyên môn / Doanh thu BHYT).
 */

import { layTatCaHoSoTuKho } from '../tien_ich/kho_du_lieu';

export const MA_DAC_TA_BAO_CAO = 'CDSS-BHYT-SPEC-BC-V1.0';

const layXml1Local = (hoSo = {}) =>
  hoSo?.xml1 || hoSo?.XML1 || hoSo?.du_lieu_goc?.xml1 || hoSo?.du_lieu_goc?.XML1 || {};

const layMaLKLocal = (hoSo = {}) =>
  String(
    hoSo?.ma_lk || layXml1Local(hoSo)?.MA_LK || hoSo?.du_lieu_goc?.ma_lk || '',
  ).trim();

/**
 * Gom danh sách hồ sơ theo MA_LK — giữ bản mới nhất theo thời điểm nhập/cập nhật.
 */
export const ghepHoSoKhongTrungMaLK = (danhSachHoSo = []) => {
  const arr = Array.isArray(danhSachHoSo) ? danhSachHoSo : [];
  const map = new Map();

  const layTs = (hs) => {
    const raw = hs?.thoi_diem_nhap_kho || hs?.thoi_diem_cap_nhat_so_lieu_tho;
    const t = raw ? Date.parse(String(raw)) : NaN;
    return Number.isFinite(t) ? t : 0;
  };

  for (const hs of arr) {
    const k = layMaLKLocal(hs);
    if (!k) continue;
    const prev = map.get(k);
    if (!prev) {
      map.set(k, hs);
      continue;
    }
    if (layTs(hs) >= layTs(prev)) map.set(k, { ...prev, ...hs });
  }

  return Array.from(map.values());
};

/**
 * Tải toàn bộ hồ sơ từ kho và gom trùng MA_LK — đầu vào cho pipeline báo cáo mới.
 */
export const taiDuLieuNguonBaoCao = async () => {
  const raw = await layTatCaHoSoTuKho();
  const hoSo = ghepHoSoKhongTrungMaLK(raw);
  return {
    ma_dac_ta: MA_DAC_TA_BAO_CAO,
    so_ho_so_sau_gom: hoSo.length,
    danh_sach_ho_so: hoSo,
  };
};
