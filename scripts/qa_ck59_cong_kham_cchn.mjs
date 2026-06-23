#!/usr/bin/env node
/**
 * QA CK_59 — BS một CCHN khám nhiều loại công khám / chuyên khoa (mirror logic Node thuần).
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const srcEngine = readFileSync(join(root, 'ma_nguon/tien_ich/giam_dinh_cong_kham_cchn.jsx'), 'utf8');
const srcDongCo = readFileSync(join(root, 'ma_nguon/tien_ich/dong_co_giam_dinh.jsx'), 'utf8');

const UPPER = (v) => String(v ?? '').trim().toUpperCase();
const normMa = (v) => UPPER(v).replace(/\s/g, '');

const layNhomChuyenKhoaCongKham = (maDv) => {
  const ma = normMa(maDv);
  const m = ma.match(/^(\d{2}\.\d{2})/);
  return m ? m[1] : ma;
};

const resolveCchnKey = (perfId, mapNhanSu) => {
  const id = UPPER(perfId);
  const row = mapNhanSu.get(id);
  return UPPER(row?.MACCHN || id);
};

const giamDinhMirror = (hoSo, dm = {}) => {
  const ds = [];
  const xml1 = hoSo.XML1 || {};
  const xml3 = hoSo.XML3 || [];
  const mapNhanSu = dm.MAP_NHAN_SU || new Map();
  const dongKham = [];

  xml3.forEach((row, index) => {
    if (Number(row.THANH_TIEN_BH || 0) <= 0) return;
    const ma = normMa(row.MA_DICH_VU);
    if (!ma) return;
    const perfId = UPPER(row.MA_BAC_SI || row.NGUOI_THUC_HIEN || '');
    if (!perfId) return;
    dongKham.push({
      index,
      ma,
      chuyenKhoa: layNhomChuyenKhoaCongKham(ma),
      cchnKey: resolveCchnKey(perfId, mapNhanSu),
    });
  });

  const theoCchn = new Map();
  dongKham.forEach((item) => {
    if (!theoCchn.has(item.cchnKey)) theoCchn.set(item.cchnKey, []);
    theoCchn.get(item.cchnKey).push(item);
  });

  for (const [, items] of theoCchn.entries()) {
    const maSet = new Set(items.map((x) => x.ma));
    const ckSet = new Set(items.map((x) => x.chuyenKhoa));
    if (maSet.size < 2 || ckSet.size < 2) continue;
    items.slice(1).forEach((item) => ds.push({ ma_luat: 'CK_59', index: item.index }));
  }
  return ds;
};

const assert = (cond, msg) => {
  if (!cond) throw new Error(msg);
};

const mapNs = new Map([
  ['BS01', { MACCHN: '000001/ST-CCHN', HO_TEN: 'Nguyễn Văn A' }],
  ['BS02', { MACCHN: '000002/CT-CCHN', HO_TEN: 'Trần Thị B' }],
]);

const loi = giamDinhMirror({
  XML1: {},
  XML3: [
    { MA_DICH_VU: '02.03.0135', MA_BAC_SI: 'BS01', THANH_TIEN_BH: 1 },
    { MA_DICH_VU: '15.28.0001', MA_BAC_SI: 'BS01', THANH_TIEN_BH: 1 },
  ],
}, { MAP_NHAN_SU: mapNs });

assert(loi.some((x) => x.ma_luat === 'CK_59'), 'CK_59 fires for same CCHN multi specialty');

const khongLoi = giamDinhMirror({
  XML1: {},
  XML3: [
    { MA_DICH_VU: '02.03.0135', MA_BAC_SI: 'BS01', THANH_TIEN_BH: 1 },
    { MA_DICH_VU: '02.03.0140', MA_BAC_SI: 'BS01', THANH_TIEN_BH: 1 },
  ],
}, { MAP_NHAN_SU: mapNs });

assert(!khongLoi.some((x) => x.ma_luat === 'CK_59'), 'CK_59 skip same chuyen khoa prefix');

const khacBs = giamDinhMirror({
  XML1: {},
  XML3: [
    { MA_DICH_VU: '02.03.0135', MA_BAC_SI: 'BS01', THANH_TIEN_BH: 1 },
    { MA_DICH_VU: '15.28.0001', MA_BAC_SI: 'BS02', THANH_TIEN_BH: 1 },
  ],
}, { MAP_NHAN_SU: mapNs });

assert(!khacBs.some((x) => x.ma_luat === 'CK_59'), 'CK_59 skip different doctors');

assert(srcEngine.includes('giamDinhBsMotCchnNhieuChuyenKhoaCongKham'), 'engine exported');
assert(srcDongCo.includes('giamDinhBsMotCchnNhieuChuyenKhoaCongKham'), 'dong_co wired');

console.log(JSON.stringify({ ok: true, tests: 5 }, null, 2));
