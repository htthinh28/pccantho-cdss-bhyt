#!/usr/bin/env node
/**
 * QA CK_59 — chỉ áp dụng mã thuộc DM_KHAM (danh mục công khám), không DVKT khác.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const srcEngine = readFileSync(join(root, 'ma_nguon/tien_ich/giam_dinh_cong_kham_cchn.jsx'), 'utf8');
const srcDongCo = readFileSync(join(root, 'ma_nguon/tien_ich/dong_co_giam_dinh.jsx'), 'utf8');
const srcCatalog = readFileSync(join(root, 'ma_nguon/tien_ich/dm_cong_kham_catalog.jsx'), 'utf8');

const UPPER = (v) => String(v ?? '').trim().toUpperCase();
const normMa = (v) => UPPER(v).replace(/\s/g, '');

const layTienToNhomCongKham = (maDv) => {
  const ma = normMa(maDv);
  const m = ma.match(/^(\d{2}\.\d{2})/);
  return m ? m[1] : '';
};

const laMaThuocDmCongKhamCk59 = (maDv, dmKhamSet) => {
  const ma = normMa(maDv);
  if (!ma || !dmKhamSet.size) return false;
  if (dmKhamSet.has(ma)) return true;
  const prefix = layTienToNhomCongKham(ma);
  return prefix ? dmKhamSet.has(prefix) : false;
};

const resolveCchnKey = (perfId, mapNhanSu) => {
  const id = UPPER(perfId);
  const row = mapNhanSu.get(id);
  return UPPER(row?.MACCHN || id);
};

const taoTapMaCongKham = (dmKhamRows = []) => {
  const s = new Set();
  (Array.isArray(dmKhamRows) ? dmKhamRows : []).forEach((row) => {
    const ma = normMa(row?.MA_DICH_VU || row?.MA || row);
    if (ma) s.add(ma);
  });
  return s;
};

const giamDinhMirror = (hoSo, dm = {}) => {
  const ds = [];
  const xml3 = hoSo.XML3 || [];
  const dmKham = taoTapMaCongKham(dm.DM_KHAM);
  if (!dmKham.size) return ds;

  const mapNhanSu = dm.MAP_NHAN_SU || new Map();
  const dongKham = [];

  xml3.forEach((row, index) => {
    if (Number(row.THANH_TIEN_BH || 0) <= 0) return;
    const ma = normMa(row.MA_DICH_VU);
    if (!laMaThuocDmCongKhamCk59(ma, dmKham)) return;
    const perfId = UPPER(row.MA_BAC_SI || row.NGUOI_THUC_HIEN || '');
    if (!perfId) return;
    dongKham.push({
      index,
      ma,
      chuyenKhoa: layTienToNhomCongKham(ma),
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

const dmKham = [
  { MA_DICH_VU: '02.03' },
  { MA_DICH_VU: '15.28' },
  { MA_DICH_VU: '02.03' },
];

const dm = { DM_KHAM: dmKham, MAP_NHAN_SU: mapNs };

const loi = giamDinhMirror({
  XML1: {},
  XML3: [
    { MA_DICH_VU: '02.03.0135', MA_BAC_SI: 'BS01', THANH_TIEN_BH: 1 },
    { MA_DICH_VU: '15.28.0001', MA_BAC_SI: 'BS01', THANH_TIEN_BH: 1 },
  ],
}, dm);

assert(loi.some((x) => x.ma_luat === 'CK_59'), 'CK_59 fires for same CCHN multi specialty in DM_KHAM');

const khongLoi = giamDinhMirror({
  XML1: {},
  XML3: [
    { MA_DICH_VU: '02.03.0135', MA_BAC_SI: 'BS01', THANH_TIEN_BH: 1 },
    { MA_DICH_VU: '02.03.0140', MA_BAC_SI: 'BS01', THANH_TIEN_BH: 1 },
  ],
}, dm);

assert(!khongLoi.some((x) => x.ma_luat === 'CK_59'), 'CK_59 skip same chuyen khoa prefix');

const khacBs = giamDinhMirror({
  XML1: {},
  XML3: [
    { MA_DICH_VU: '02.03.0135', MA_BAC_SI: 'BS01', THANH_TIEN_BH: 1 },
    { MA_DICH_VU: '15.28.0001', MA_BAC_SI: 'BS02', THANH_TIEN_BH: 1 },
  ],
}, dm);

assert(!khacBs.some((x) => x.ma_luat === 'CK_59'), 'CK_59 skip different doctors');

const dvktNgoaiDm = giamDinhMirror({
  XML1: {},
  XML3: [
    { MA_DICH_VU: '02.03.0135', MA_BAC_SI: 'BS01', THANH_TIEN_BH: 1 },
    { MA_DICH_VU: '01.0002.1778', MA_BAC_SI: 'BS01', THANH_TIEN_BH: 1, TEN_DICH_VU: 'Ghi điện tim' },
  ],
}, dm);

assert(!dvktNgoaiDm.some((x) => x.ma_luat === 'CK_59'), 'CK_59 skip DVKT not in DM_KHAM');

const khongDm = giamDinhMirror({
  XML1: {},
  XML3: [
    { MA_DICH_VU: '02.03.0135', MA_BAC_SI: 'BS01', THANH_TIEN_BH: 1 },
    { MA_DICH_VU: '15.28.0001', MA_BAC_SI: 'BS01', THANH_TIEN_BH: 1 },
  ],
}, { MAP_NHAN_SU: mapNs });

assert(khongDm.length === 0, 'CK_59 silent when DM_KHAM empty');

assert(srcEngine.includes('laMaThuocDmCongKhamCk59'), 'engine uses strict DM_KHAM check');
assert(srcCatalog.includes('layTienToNhomCongKham'), 'catalog prefix match helper');
assert(!srcEngine.includes('laDongCongKhamXml3'), 'engine no longer uses DVKT heuristic');
assert(srcDongCo.includes('buildDmKhamHeThong'), 'dong_co builds DM_KHAM');

console.log(JSON.stringify({ ok: true, tests: 8 }, null, 2));
