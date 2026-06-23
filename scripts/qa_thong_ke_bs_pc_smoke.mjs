#!/usr/bin/env node
/** Smoke: MA_BAC_SI từ dòng công khám XML3 (ICD-TT06) và PC=MA_BN cho lỗi XML2 — mirror logic thong_ke_loi_dung_chung. */
import assert from 'node:assert/strict';

const chuanHoaTokenThongKeLoi = (s) => String(s || '').trim().toUpperCase();

const laDongXml3LaGiuongHeuristic = (row = {}) => {
  const ma = String(row.MA_DICH_VU || '').trim().toUpperCase();
  const nhom = chuanHoaTokenThongKeLoi(row.NHOM_DV || '');
  const ten = chuanHoaTokenThongKeLoi(row.TEN_DICH_VU || '');
  return ma.startsWith('19') || nhom.includes('GIUONG') || ten.includes('GIUONG');
};

const laDongXml3LaCongKhamHeuristic = (row = {}) => {
  if (laDongXml3LaGiuongHeuristic(row)) return false;
  const nhom = chuanHoaTokenThongKeLoi(row.NHOM_DV || '');
  const ten = chuanHoaTokenThongKeLoi(row.TEN_DICH_VU || '');
  return nhom.includes('KHAM') || ten.includes('KHAM');
};

const layChuoiKhacRongTuDong = (dong = {}, tenTruongs = []) => {
  for (const k of tenTruongs) {
    const v = dong[k];
    if (v !== undefined && v !== null && String(v).trim() !== '') return String(v).trim();
  }
  return '';
};

const layXml1HoSo = (hoSo = {}) => hoSo?.xml1 || hoSo?.XML1 || {};

const layMaBenhNhanTuHoSo = (hoSo = {}) => String(layXml1HoSo(hoSo)?.MA_BN || hoSo?.ma_bn || '').trim();

const layMangXmlTheoPhanHe = (hoSo = {}, phanHe = '') => {
  const p = String(phanHe || '').trim().toUpperCase();
  const pLower = p.toLowerCase();
  const raw = hoSo?.[p] ?? hoSo?.[pLower] ?? null;
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === 'object') return [raw];
  return null;
};

const layMaBacSiTuDongCongKhamXml3 = (hoSo = {}) => {
  const xml3 = layMangXmlTheoPhanHe(hoSo, 'XML3') || [];
  for (const row of xml3) {
    if (!row || typeof row !== 'object') continue;
    const nhom = String(row.MA_NHOM || '').replace(/^0+/, '') || String(row.MA_NHOM || '');
    const laCongKham = laDongXml3LaCongKhamHeuristic(row) || (nhom === '1' && !laDongXml3LaGiuongHeuristic(row));
    if (!laCongKham) continue;
    const maBs = layChuoiKhacRongTuDong(row, ['MA_BAC_SI', 'MA_BS', 'NGUOI_THUC_HIEN']);
    if (maBs) return maBs;
  }
  return '';
};

const layNgayYLenhNgayKqVaBacSiTuLoiHoSo = (loi = {}, hoSo = {}) => {
  const phanHe = String(loi.phan_he || '').trim().toUpperCase();
  const out = { bacSiChiDinh: '', bacSiThucHien: '' };
  if (phanHe === 'XML1') {
    const x1 = layXml1HoSo(hoSo);
    out.bacSiChiDinh = layMaBacSiTuDongCongKhamXml3(hoSo)
      || layChuoiKhacRongTuDong(x1, ['MA_BS_KHAM', 'MA_BAC_SI']);
    return out;
  }
  const idx = Number(loi.index);
  const mang = layMangXmlTheoPhanHe(hoSo, phanHe) || [];
  const row = Number.isFinite(idx) && idx >= 0 ? mang[idx] : null;
  if (!row) return out;
  if (phanHe === 'XML2') {
    out.bacSiChiDinh = layChuoiKhacRongTuDong(row, ['MA_BAC_SI', 'MA_BS']);
  }
  return out;
};

const chuanHoaMaBsChoXuatBaoCao = (val = '') => {
  const s = String(val || '').trim();
  return s === 'KHONG_RO' ? '' : s;
};

const taoMetaXuatBacSiTuChiTietLoi = (detail = {}, loi = {}, hoSo = {}) => {
  const bsTheoDong = layNgayYLenhNgayKqVaBacSiTuLoiHoSo(loi, hoSo);
  const phanHe = String(loi?.phan_he || '').trim().toUpperCase();
  const maBn = String(detail.ma_bn || layMaBenhNhanTuHoSo(hoSo) || '').trim();
  const pc = String(detail.pc || (phanHe === 'XML2' ? maBn : '') || '').trim();
  return {
    _XUAT_MA_BS_CHI_DINH: chuanHoaMaBsChoXuatBaoCao(bsTheoDong.bacSiChiDinh),
    _XUAT_MA_BN: maBn,
    _XUAT_PC: pc,
  };
};

const hoSo = {
  xml1: {
    MA_BN: 'BN-PC-12345',
    MA_TTDV: '99999/TTDV-GD',
  },
  xml3: [
    { MA_DICH_VU: '13.1896', TEN_DICH_VU: 'Công khám ngoại trú', MA_NHOM: '1', MA_BAC_SI: '01234/GP-BS' },
    { MA_DICH_VU: '18.0001', TEN_DICH_VU: 'Chụp X-quang', MA_NHOM: '3', MA_BAC_SI: '05678/GP-BS' },
  ],
};

const loiIcd = { phan_he: 'XML1', index: -1, ma_luat: 'ICD-TT06-CAM-CHINH' };
const loiThuoc = { phan_he: 'XML2', index: 0, ma_luat: 'THUOC_01' };

assert.equal(layMaBacSiTuDongCongKhamXml3(hoSo), '01234/GP-BS');

const bsIcd = layNgayYLenhNgayKqVaBacSiTuLoiHoSo(loiIcd, hoSo);
assert.equal(bsIcd.bacSiChiDinh, '01234/GP-BS');
assert.notEqual(bsIcd.bacSiChiDinh, '99999/TTDV-GD');

const maBn = layMaBenhNhanTuHoSo(hoSo);
const phanHe = 'XML2';
const pc = phanHe === 'XML2' && maBn ? maBn : '';
assert.equal(pc, 'BN-PC-12345');

const meta = taoMetaXuatBacSiTuChiTietLoi({ ma_bn: maBn, pc }, loiThuoc, hoSo);
assert.equal(meta._XUAT_PC, 'BN-PC-12345');
assert.equal(meta._XUAT_MA_BN, 'BN-PC-12345');

console.log('qa_thong_ke_bs_pc_smoke: OK');
