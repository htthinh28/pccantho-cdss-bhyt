/**
 * Giám định công khám: một bác sỹ / một CCHN thực hiện nhiều loại công khám (chuyên khoa) trong cùng lượt.
 * Mã quy tắc: CK_59 (built-in LAYER 4).
 */

import { laDongCongKhamXml3 } from './du_lieu_cv3231_phamvi';

export const CO_SO_PHAP_LY_CK59 =
  'VBHN 17/2018/NĐ-CP Điều 3 khoản 1 điểm b; TT 32/2023/TT-BYT phạm vi hành nghề; QĐ 130/QĐ-BHXH — thanh toán công khám đúng phạm vi CCHN';

const UPPER = (v) => String(v ?? '').trim().toUpperCase();
const normMa = (v) => UPPER(v).replace(/\s/g, '');

const TO_NUMBER = (v) => {
  if (v === null || v === undefined || v === '') return 0;
  const n = Number(String(v).replace(/,/g, '').trim());
  return Number.isFinite(n) ? n : 0;
};

const laDongBhThanhToan = (row) => {
  const tien = TO_NUMBER(row?.THANH_TIEN_BH ?? row?.T_BHTT ?? row?.THANH_TIEN ?? row?.THANH_TIEN_BV);
  if (tien <= 0) return false;
  const tyLe = TO_NUMBER(row?.TY_LE_TT_BH ?? row?.TY_LE_TT ?? 100);
  return tyLe > 0;
};

const taoTapDanhMucTuMang = (arr) => {
  const s = new Set();
  if (!Array.isArray(arr)) return s;
  arr.forEach((item) => {
    const ma = normMa(item?.MA_DICH_VU || item?.MA || item?.ma || item);
    if (ma) s.add(ma);
  });
  return s;
};

const layMaHanhNgheThucHien = (row, xml1) => {
  const nguoi = String(row?.NGUOI_THUC_HIEN || '').split(';')[0].trim();
  if (nguoi) return UPPER(nguoi);
  return UPPER(String(row?.MA_BAC_SI || row?.MA_BS || xml1?.MA_BS_KHAM || xml1?.MA_BAC_SI || '').trim());
};

const laChuoiGiongCchn = (s) => {
  const t = String(s ?? '').trim();
  if (!t || !t.includes('/')) return false;
  return /\b(CCHN|GPHN|CCHND)\b/i.test(t) || /^[0-9A-Za-z._-]+\/[0-9A-Za-z_.\-]+$/.test(t);
};

/** Chuẩn hoá khóa CCHN để gom theo một chứng chỉ hành nghề. */
export const resolveCchnKeyCongKham = (perfId, mapNhanSu) => {
  const id = UPPER(perfId);
  if (!id) return '';
  const row = mapNhanSu?.get?.(id);
  const cchn = UPPER(row?.MACCHN || row?.SO_CCHN || row?.SO_GPHN || '');
  if (cchn) return cchn;
  if (laChuoiGiongCchn(id)) return id;
  return id;
};

/** Nhóm chuyên khoa công khám theo tiền tố XX.YY của MA_DICH_VU (TT 12/2018). */
export const layNhomChuyenKhoaCongKham = (maDv) => {
  const ma = normMa(maDv);
  if (!ma) return '';
  const m = ma.match(/^(\d{2}\.\d{2})/);
  return m ? m[1] : ma;
};

/**
 * CK_59: Cùng một CCHN, nhiều loại công khám / chuyên khoa trong một hồ sơ (lượt khám).
 * @param {object} hoSo
 * @param {object} dm — danhMucHeThong (DM_KHAM, MAP_NHAN_SU, …)
 */
export const giamDinhBsMotCchnNhieuChuyenKhoaCongKham = (hoSo, dm = {}) => {
  const ds = [];
  const xml1 = hoSo?.XML1 || hoSo?.xml1 || null;
  const rawXml3 = Array.isArray(hoSo?.XML3) ? hoSo.XML3 : (Array.isArray(hoSo?.xml3) ? hoSo.xml3 : []);
  if (!rawXml3.length) return ds;

  const dmKham = taoTapDanhMucTuMang(dm?.DM_KHAM);
  const mapNhanSu = dm?.MAP_NHAN_SU instanceof Map ? dm.MAP_NHAN_SU : new Map();

  const dongCongKham = [];
  rawXml3.forEach((row, index) => {
    if (!laDongBhThanhToan(row)) return;
    const line = {
      maTuongDuong: row.MA_DICH_VU || row.MA_DV,
      tenDvkt: row.TEN_DICH_VU || row.TEN_DVKT,
      maNhom: row.MA_NHOM,
    };
    const ma = normMa(line.maTuongDuong);
    const laKham = laDongCongKhamXml3(line, dmKham)
      || (dmKham.size > 0 && dmKham.has(ma))
      || /CONG\s*KHAM|KHAM\s*BENH|^KHAM\s/i.test(UPPER(line.tenDvkt));
    if (!laKham || !ma) return;

    const perfId = layMaHanhNgheThucHien(row, xml1);
    if (!perfId) return;

    dongCongKham.push({
      index,
      ma,
      ten: String(line.tenDvkt || '').trim(),
      chuyenKhoa: layNhomChuyenKhoaCongKham(ma),
      cchnKey: resolveCchnKeyCongKham(perfId, mapNhanSu),
      perfId,
    });
  });

  if (dongCongKham.length < 2) return ds;

  const theoCchn = new Map();
  dongCongKham.forEach((item) => {
    if (!theoCchn.has(item.cchnKey)) theoCchn.set(item.cchnKey, []);
    theoCchn.get(item.cchnKey).push(item);
  });

  const addLoi = (payload) => ds.push({
    phan_he: payload.phan_he || 'XML3',
    index: payload.index ?? -1,
    truong_loi: payload.truong_loi || 'MA_BAC_SI',
    canh_bao: payload.canh_bao,
    muc_do: payload.muc_do || 'Warning',
    ma_luat: 'CK_59',
    ten_quy_tac: payload.ten_quy_tac || 'BS một CCHN — nhiều loại công khám (CK_59)',
    dieu_kien: 'BUILT-IN',
    co_so_phap_ly: CO_SO_PHAP_LY_CK59,
  });

  for (const [cchnKey, items] of theoCchn.entries()) {
    const maSet = new Set(items.map((x) => x.ma));
    const ckSet = new Set(items.map((x) => x.chuyenKhoa).filter(Boolean));
    if (maSet.size < 2 || ckSet.size < 2) continue;

    const dsMa = [...maSet].join(', ');
    const dsCk = [...ckSet].join(', ');
    const hoTen = mapNhanSu.get(items[0].perfId)?.HO_TEN || items[0].perfId;
    const cchnHienThi = laChuoiGiongCchn(cchnKey) ? cchnKey : (mapNhanSu.get(items[0].perfId)?.MACCHN || cchnKey);

    items.slice(1).forEach((item) => {
      addLoi({
        index: item.index,
        truong_loi: 'MA_DICH_VU',
        muc_do: 'Warning',
        canh_bao: `⛔ [XUẤT TOÁN] [CK_59]: Bác sỹ ${hoTen} (CCHN ${cchnHienThi}) thực hiện nhiều loại công khám / chuyên khoa trong cùng lượt khám (${dsCk}: mã ${dsMa}). Một CCHN chỉ được thanh toán khám đúng phạm vi chuyên môn — rà soát dòng [${item.ma}]${item.ten ? ` (${item.ten})` : ''}.`,
      });
    });
  }

  return ds;
};
