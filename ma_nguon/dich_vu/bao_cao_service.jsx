/**
 * Dịch vụ báo cáo CDSS-BHYT — lớp tổng hợp đọc từ kho (không ghi metadata vào kho).
 * Đặc tả: CDSS-BHYT-SPEC-BC (ba nhánh: Quản trị / Chuyên môn / Doanh thu BHYT).
 */

import { layTatCaHoSoTuKho } from '../tien_ich/kho_du_lieu';
import { tongHopMoHinhMuc5 } from './bao_cao_mo_hinh_muc5';
import { tongHopBaoCaoQuanTriMuc6 } from './bao_cao_quan_tri_muc6';
import { tongHopBaoCaoChuyenMonMuc7 } from './bao_cao_chuyen_mon_muc7';
import { tongHopBaoCaoDoanhThuMuc8 } from './bao_cao_doanh_thu_muc8';
import { taoHienThiBaoCao } from './bao_cao_viz_meta';

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

/** Fingerprint nguồn: số hồ sơ + độ dài danh sách + mốc thời gian cập nhật mới nhất (cache an toàn). */
const tinhFingerprintNguon = (nguon) => {
  const arr = nguon.danh_sach_ho_so || [];
  let maxTs = 0;
  for (const hs of arr) {
    const raw = hs?.thoi_diem_nhap_kho || hs?.thoi_diem_cap_nhat_so_lieu_tho;
    const t = raw ? Date.parse(String(raw)) : NaN;
    if (Number.isFinite(t) && t > maxTs) maxTs = t;
  }
  return `${nguon.so_ho_so_sau_gom}|${arr.length}|${maxTs}`;
};

let _baoCaoCache = { fingerprint: '', payload: null };

const tongHopPayloadTuNguon = (nguon) => {
  const mo_hinh_muc5 = tongHopMoHinhMuc5(nguon.danh_sach_ho_so);
  const muc6 = tongHopBaoCaoQuanTriMuc6({
    moHinhMuc5: mo_hinh_muc5,
    danhSachHoSo: nguon.danh_sach_ho_so,
  });
  const muc7 = tongHopBaoCaoChuyenMonMuc7({
    moHinhMuc5: mo_hinh_muc5,
    danhSachHoSo: nguon.danh_sach_ho_so,
  });
  const muc8 = tongHopBaoCaoDoanhThuMuc8({
    moHinhMuc5: mo_hinh_muc5,
    danhSachHoSo: nguon.danh_sach_ho_so,
  });
  const hien_thi_bao_cao = taoHienThiBaoCao({
    mo_hinh_muc5,
    muc6,
    muc7,
    muc8,
    soHoSo: nguon.so_ho_so_sau_gom,
  });
  return {
    ...nguon,
    mo_hinh_muc5,
    bao_cao_quan_tri_muc6: muc6,
    bao_cao_chuyen_mon_muc7: muc7,
    bao_cao_doanh_thu_muc8: muc8,
    hien_thi_bao_cao,
  };
};

/**
 * Tải kho + tổng hợp mô hình mục 5 và báo cáo M6–M8.
 * @param {{ boQuaCache?: boolean }} [options] boQuaCache=true: bỏ qua bộ nhớ đệm (Làm mới cứng).
 */
export const taiNguonVaMoHinhMuc5 = async ({ boQuaCache = false } = {}) => {
  const nguon = await taiDuLieuNguonBaoCao();
  const fp = tinhFingerprintNguon(nguon);
  if (!boQuaCache && _baoCaoCache.fingerprint === fp && _baoCaoCache.payload) {
    return { ..._baoCaoCache.payload, _tu_cache: true, _fingerprint: fp };
  }
  const payload = tongHopPayloadTuNguon(nguon);
  _baoCaoCache = { fingerprint: fp, payload };
  return { ...payload, _tu_cache: false, _fingerprint: fp };
};
