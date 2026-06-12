/**
 * Giám định phạm vi hành nghề & thanh toán theo Công văn 3231/BYT-KCB (27/05/2025).
 */

import {
  CO_SO_PHAP_LY_CV3231,
  laBacSiHoacYSy,
  laBacSiYhctHoacRhm,
  laDieuDuongHang4,
  laDongCongKhamXml3,
  laDvktDieuTriPhcnCv3231,
} from './du_lieu_cv3231_phamvi';

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

const timNhanSuTheoMa = (maNhanSu, dm) => {
  const ma = UPPER(maNhanSu || '');
  if (!ma || !dm?.MAP_NHAN_SU) return null;
  return dm.MAP_NHAN_SU.get(ma) || null;
};

const parseList = (raw) => String(raw || '').split(/[,;|]/).map((s) => s.trim()).filter(Boolean);

const staffTuDm = (dmRow) => {
  if (!dmRow) return null;
  return {
    chucDanhNorm: String(dmRow.CHUCDANH_NN || dmRow.MA_CDNN || '').trim(),
    scopes: new Set(String(dmRow.PHAMVI_CM || '').split(/[,;|]/).map((x) => x.trim()).filter((x) => /^\d+$/.test(x))),
    raw: dmRow,
  };
};

export const giamDinhCv3231Bhyt = (hoSo, dm = {}) => {
  const ds = [];
  const rawXml3 = Array.isArray(hoSo?.XML3) ? hoSo.XML3 : (Array.isArray(hoSo?.xml3) ? hoSo.xml3 : []);
  if (!rawXml3.length) return ds;

  const dmKham = taoTapDanhMucTuMang(dm?.DM_KHAM);

  const addLoi = (payload) => ds.push({
    phan_he: payload.phan_he || 'XML3',
    index: payload.index ?? -1,
    truong_loi: payload.truong_loi || 'NGUOI_THUC_HIEN',
    canh_bao: payload.canh_bao,
    muc_do: payload.muc_do || 'Warning',
    ma_luat: payload.ma_luat,
    ten_quy_tac: payload.ten_quy_tac,
    dieu_kien: 'BUILT-IN',
    co_so_phap_ly: CO_SO_PHAP_LY_CV3231,
  });

  rawXml3.forEach((row, index) => {
    if (!laDongBhThanhToan(row)) return;

    const line = {
      maTuongDuong: row.MA_DICH_VU || row.MA_DV,
      tenDvkt: row.TEN_DICH_VU || row.TEN_DVKT,
      maNhom: row.MA_NHOM,
      prefix: String(row.MA_DICH_VU || '').trim().slice(0, 2),
    };
    const ma = normMa(line.maTuongDuong);
    const nguoiThucHien = parseList(row.NGUOI_THUC_HIEN).map((x) => UPPER(x));
    const maBacSi = UPPER(row.MA_BAC_SI || '');

    // §1.3 — BS YHCT/RHM được khám bệnh & BHYT thanh toán tiền khám
    if (laDongCongKhamXml3(line, dmKham)) {
      const idKham = nguoiThucHien[0] || maBacSi;
      const ns = staffTuDm(timNhanSuTheoMa(idKham, dm));
      if (ns && laBacSiYhctHoacRhm(ns) && laBacSiHoacYSy(ns)) {
        addLoi({
          index,
          ma_luat: 'CV3231-13',
          ten_quy_tac: 'BS YHCT/RHM được khám bệnh (§1.3)',
          muc_do: 'Info',
          canh_bao: `ℹ️ [CV3231 §1.3]: Công khám [${ma}] do BS YHCT/RHM thực hiện — được phép khám và thanh toán BHYT dù Phụ lục VI/VIII không liệt kê riêng dịch vụ "Khám bệnh".`,
        });
      }
    }

    // §2 — Điều dưỡng hạng IV: không thanh toán DVKT điều trị/PHCN do ĐD hạng IV thực hiện
    if (laDvktDieuTriPhcnCv3231(line)) {
      for (const id of nguoiThucHien.length ? nguoiThucHien : [maBacSi].filter(Boolean)) {
        const ns = staffTuDm(timNhanSuTheoMa(id, dm));
        if (!ns || !laDieuDuongHang4(ns)) continue;
        addLoi({
          index,
          truong_loi: 'NGUOI_THUC_HIEN',
          ma_luat: 'CV3231-02',
          ten_quy_tac: 'Điều dưỡng hạng IV — không TT DVKT điều trị/PHCN (§2)',
          muc_do: 'Critical',
          canh_bao: `⛔ [CV3231 §2]: DVKT [${ma}] do điều dưỡng hạng IV (${id}) thực hiện — không có căn cứ thanh toán BHYT (thay thế CV 129/BYT-KCB mục 4.2).`,
        });
        break;
      }
    }

    // §1.8 — Gợi ý ghi đủ mã NVYT trong ekip (PT/NS/CLS phức tạp)
    const ten = UPPER(line.tenDvkt);
    const laKyThuatEkip = /PHAU THUAT|NOI SOI|THU THUAT|CHAN DOAN HINH ANH|CHUP|SIEM|NOI SOI/i.test(ten)
      || /^0[23]\./.test(ma) || /^1[58]\./.test(ma) || /^20\./.test(ma);
    if (laKyThuatEkip && nguoiThucHien.length === 1 && !nguoiThucHien[0].includes(';')) {
      addLoi({
        index,
        ma_luat: 'CV3231-18',
        ten_quy_tac: 'Ghi đủ mã NVYT trong ekip (§1.8)',
        muc_do: 'Info',
        truong_loi: 'NGUOI_THUC_HIEN',
        canh_bao: `ℹ️ [CV3231 §1.8]: DVKT [${ma}] có thể do nhiều NVYT cùng thực hiện — nên ghi đủ mã NGUOI_THUC_HIEN, cách nhau bằng dấu ";".`,
      });
    }
  });

  return ds;
};
