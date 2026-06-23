#!/usr/bin/env node
/** Smoke test meta cột BS xuất Excel báo cáo lỗi dashboard. */
import assert from 'node:assert/strict';

const chuanHoaMaBsChoXuatBaoCao = (val = '') => {
  const s = String(val || '').trim();
  return s === 'KHONG_RO' ? '' : s;
};

const layChuoiKhacRongTuDong = (row, keys) => {
  for (const k of keys) {
    const v = String(row?.[k] ?? '').trim();
    if (v) return v;
  }
  return '';
};

const layNgayYLenhNgayKqVaBacSiTuLoiHoSo = (loi = {}, hoSo = {}) => {
  const phanHe = String(loi.phan_he || '').trim().toUpperCase();
  const out = { bacSiChiDinh: '', bacSiThucHien: '' };
  if (phanHe === 'XML1') {
    const x1 = hoSo?.xml1 || {};
    const xml3 = hoSo?.xml3 || [];
    for (const row of xml3) {
      const ten = String(row?.TEN_DICH_VU || '').toUpperCase();
      if (ten.includes('KHAM') || String(row?.MA_NHOM) === '1') {
        out.bacSiChiDinh = String(row?.MA_BAC_SI || '').trim();
        if (out.bacSiChiDinh) break;
      }
    }
    if (!out.bacSiChiDinh) {
      out.bacSiChiDinh = layChuoiKhacRongTuDong(x1, ['MA_BS_KHAM', 'MA_BAC_SI']);
    }
    return out;
  }
  const idx = Number(loi.index);
  const mang = hoSo?.[phanHe.toLowerCase()] || hoSo?.[phanHe] || [];
  const row = Number.isFinite(idx) && idx >= 0 ? mang[idx] : null;
  if (!row) return out;
  if (phanHe === 'XML3') {
    out.bacSiChiDinh = layChuoiKhacRongTuDong(row, ['MA_BAC_SI', 'MA_BS']);
    out.bacSiThucHien = layChuoiKhacRongTuDong(row, ['NGUOI_THUC_HIEN', 'MA_BS_TH']);
  }
  return out;
};

const taoMetaXuatBacSiTuChiTietLoi = (detail = {}, loi = {}, hoSo = {}) => {
  const bsTheoDong = layNgayYLenhNgayKqVaBacSiTuLoiHoSo(loi, hoSo);
  const phanHe = String(loi?.phan_he || '').trim().toUpperCase();
  const maBn = String(detail.ma_bn || hoSo?.xml1?.MA_BN || '').trim();
  const pc = String(detail.pc || (phanHe === 'XML2' ? maBn : '') || '').trim();
  return {
    _XUAT_MA_BS_KHAM: chuanHoaMaBsChoXuatBaoCao(detail.ma_bac_si),
    _XUAT_MA_BS_DONG_LOI: chuanHoaMaBsChoXuatBaoCao(detail.ma_bac_si_dong),
    _XUAT_MA_BS_CHI_DINH: chuanHoaMaBsChoXuatBaoCao(bsTheoDong.bacSiChiDinh),
    _XUAT_MA_BS_THUC_HIEN: chuanHoaMaBsChoXuatBaoCao(bsTheoDong.bacSiThucHien),
    _XUAT_MA_BN: maBn,
    _XUAT_PC: pc,
  };
};

const hoSo = {
  xml3: [{ MA_BAC_SI: 'BS001', NGUOI_THUC_HIEN: 'BS002' }],
};

const meta = taoMetaXuatBacSiTuChiTietLoi(
  { ma_bac_si: 'BS_KHAM', ma_bac_si_dong: 'BS001' },
  { phan_he: 'XML3', index: 0 },
  hoSo,
);

assert.equal(meta._XUAT_MA_BS_KHAM, 'BS_KHAM');
assert.equal(meta._XUAT_MA_BS_DONG_LOI, 'BS001');
assert.equal(meta._XUAT_MA_BS_CHI_DINH, 'BS001');
assert.equal(meta._XUAT_MA_BS_THUC_HIEN, 'BS002');

const metaTrong = taoMetaXuatBacSiTuChiTietLoi(
  { ma_bac_si: 'KHONG_RO', ma_bac_si_dong: 'KHONG_RO' },
  { phan_he: 'XML1', index: -1 },
  {},
);
assert.equal(metaTrong._XUAT_MA_BS_KHAM, '');
assert.equal(metaTrong._XUAT_MA_BS_DONG_LOI, '');
assert.equal(metaTrong._XUAT_PC, '');

const metaThuoc = taoMetaXuatBacSiTuChiTietLoi(
  { ma_bn: 'BN99', pc: 'BN99', ma_bac_si_dong: 'BS01' },
  { phan_he: 'XML2', index: 0 },
  { xml1: { MA_BN: 'BN99' } },
);
assert.equal(metaThuoc._XUAT_PC, 'BN99');
assert.equal(metaThuoc._XUAT_MA_BN, 'BN99');

console.log('qa_excel_bac_si_loi: OK');
