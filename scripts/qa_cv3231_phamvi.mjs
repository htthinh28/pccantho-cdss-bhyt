#!/usr/bin/env node
/**
 * QA Công văn 3231/BYT-KCB — mirror logic (Node thuần, không import .jsx).
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const srcDuLieu = readFileSync(join(root, 'ma_nguon/tien_ich/du_lieu_cv3231_phamvi.jsx'), 'utf8');
const srcEngine = readFileSync(join(root, 'ma_nguon/tien_ich/giam_dinh_cv3231_bhyt.jsx'), 'utf8');
const srcDvkt = readFileSync(join(root, 'ma_nguon/tien_ich/dvkt_op_giam_dinh.jsx'), 'utf8');
const srcDongCo = readFileSync(join(root, 'ma_nguon/tien_ich/dong_co_giam_dinh.jsx'), 'utf8');

const assert = (cond, msg) => {
  if (!cond) throw new Error(msg);
};

const removeAccents = (v) => String(v || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/Đ/g, 'D')
  .replace(/đ/g, 'd');
const normText = (v) => removeAccents(v).toUpperCase().replace(/\s+/g, ' ').trim();

const moRongPhamVi = (staff) => {
  const scopes = new Set(String(staff.PHAMVI_CM || '').split(/[,;|]/).map((x) => x.trim()).filter((x) => /^\d+$/.test(x)));
  const text = normText(staff.PHAMVI_CMBS || '');
  if (/DA KHOA|DAKHOA/i.test(text)) scopes.add('101');
  return scopes;
};

const laDieuDuongHang4 = (staff) => {
  if (String(staff.CHUCDANH_NN) !== '3') return false;
  return String(staff.PHAMVI_CM) === '304' || /HANG\s*IV/i.test(normText(staff.PHAMVI_CMBS || ''));
};

const giamDinhMirror = (hoSo, dm) => {
  const ds = [];
  const xml3 = hoSo.XML3 || [];
  xml3.forEach((row, index) => {
    const tien = Number(row.THANH_TIEN_BH || 0);
    if (tien <= 0) return;
    const ten = normText(row.TEN_DICH_VU);
    const laPhcn = /PHUC HOI CHUC NANG|PHCN/i.test(ten) || /^05\.000[78]\./.test(String(row.MA_DICH_VU || ''));
    if (!laPhcn) return;
    const id = String(row.NGUOI_THUC_HIEN || '').split(';')[0].trim();
    const ns = dm.MAP_NHAN_SU?.get(id);
    if (ns && laDieuDuongHang4(ns)) ds.push({ ma_luat: 'CV3231-02', index });
  });
  return ds;
};

// Logic mirrors
assert(moRongPhamVi({ PHAMVI_CM: '102', PHAMVI_CMBS: 'đa khoa' }).has('101'), 'đa khoa → 101');
assert(laDieuDuongHang4({ CHUCDANH_NN: '3', PHAMVI_CM: '304' }), 'DD hạng IV');

const loi = giamDinhMirror({
  XML3: [{
    MA_DICH_VU: '05.0008.0001',
    TEN_DICH_VU: 'Phục hồi chức năng',
    THANH_TIEN_BH: 1,
    NGUOI_THUC_HIEN: 'X',
  }],
}, { MAP_NHAN_SU: new Map([['X', { CHUCDANH_NN: '3', PHAMVI_CM: '304' }]]) });
assert(loi.some((x) => x.ma_luat === 'CV3231-02'), 'engine mirror CV3231-02');

// Source integration
assert(srcDuLieu.includes('moRongPhamViNhanSuCv3231'), 'helpers exported');
assert(srcEngine.includes('giamDinhCv3231Bhyt'), 'engine exported');
assert(srcDvkt.includes('du_lieu_cv3231_phamvi'), 'dvkt_op integrated');
assert(srcDvkt.includes('laDongCongKhamXml3'), 'khám BS pass');
assert(srcDongCo.includes('giamDinhCv3231Bhyt'), 'dong_co integrated');

console.log(JSON.stringify({ ok: true, tests: 6 }, null, 2));
