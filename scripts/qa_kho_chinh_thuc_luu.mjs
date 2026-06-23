#!/usr/bin/env node
/**
 * QA: Kho chính thức XML import + lịch sử phiên giám định (không dùng CDSS_LICH_SU_XML tạm).
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const khoSrc = readFileSync(join(root, 'ma_nguon/tien_ich/kho_du_lieu.jsx'), 'utf8');
const nhapSrc = readFileSync(join(root, 'ma_nguon/tien_ich/nhap_file_xml.jsx'), 'utf8');
const khoUiSrc = readFileSync(join(root, 'ma_nguon/man_hinh/man_hinh_kho_luu_tru.jsx'), 'utf8');

assert.match(khoSrc, /IDB_STORE_XML_IMPORT\s*=\s*'xml_import'/);
assert.match(khoSrc, /IDB_STORE_HO_SO_GD_LUU_TRU\s*=\s*'ho_so_gd_luu_tru'/);
assert.match(khoSrc, /IDB_VERSION\s*=\s*6/);
assert.match(khoSrc, /export const luuBanGhiImportXml/);
assert.match(khoSrc, /export const layLichSuImportXml/);
assert.match(khoSrc, /export const layRawXmlImport/);
assert.match(khoSrc, /export const layDanhSachHoSoGiamDinhLuuTru/);
assert.match(khoSrc, /export const khoiPhucHoSoGiamDinhVaoKho/);
assert.match(khoSrc, /ho_so_snapshot/);
assert.match(khoSrc, /ket_qua_snapshot/);
assert.match(khoSrc, /export const damBaoLuuTruBenTrenWeb/);
assert.match(khoSrc, /PHIEN_BAN_HO_SO_GD_GON/);
assert.doesNotMatch(khoSrc, /MAX_HO_SO_GD_LUU_TRU\s*=/);
assert.doesNotMatch(nhapSrc, /CDSS_LICH_SU_XML/);
assert.match(nhapSrc, /luuBanGhiImportXml/);
assert.match(nhapSrc, /layLichSuImportXml/);
assert.match(nhapSrc, /raw_xml:\s*rawXML/);
assert.match(khoUiSrc, /layLichSuImportXml/);
assert.match(khoUiSrc, /layLichSuPhienGiamDinhTheoMaLK/);
assert.match(khoUiSrc, /layDanhSachHoSoGiamDinhLuuTru/);
assert.match(khoUiSrc, /Lịch sử đã giám định/);
assert.match(khoUiSrc, /LỊCH SỬ FILE XML ĐÃ IMPORT/);

const rutGonDongKetQuaPhien = (row = {}) => ({
  ma_luat: String(row.ma_luat || row.MA_LUAT || '').trim(),
  muc_do: String(row.muc_do || row.MUC_DO || '').trim(),
  truong_loi: String(row.truong_loi || row.TRUONG_LOI || '').trim(),
  phan_he: String(row.phan_he || row.PHAN_HE || '').trim(),
  canh_bao: String(row.canh_bao || row.CANH_BAO || row.message || '').slice(0, 360),
  index: Number.isFinite(row.index) ? row.index : undefined,
});

const tomTatPhienGiamDinh = (ketQuaGiamDinh) => {
  const ds = Array.isArray(ketQuaGiamDinh) ? ketQuaGiamDinh : [];
  const demMucDo = { Error: 0, Warning: 0, Info: 0, Khac: 0 };
  const maLuatSet = new Set();
  for (const row of ds) {
    const m = String(row.ma_luat || '').trim();
    if (m) maLuatSet.add(m);
    const md = String(row.muc_do || '').trim();
    if (md === 'Error') demMucDo.Error += 1;
    else if (md === 'Warning') demMucDo.Warning += 1;
    else if (md === 'Info') demMucDo.Info += 1;
    else demMucDo.Khac += 1;
  }
  return {
    so_dong_canh_bao: ds.length,
    so_ma_luat_khac_biet: maLuatSet.size,
    dem_muc_do: demMucDo,
    ma_luat_lap: [...maLuatSet].sort(),
  };
};

const kq = [
  { ma_luat: 'CLN-THUOC-06', muc_do: 'Warning', truong_loi: 'SO_NGAY', phan_he: 'XML2', canh_bao: 'Test', index: 0 },
  { ma_luat: 'DVKT-OP-01', muc_do: 'Error', truong_loi: 'MA_BAC_SI', phan_he: 'XML3' },
];
const snapshot = kq.map(rutGonDongKetQuaPhien);
const tt = tomTatPhienGiamDinh(kq);
assert.equal(snapshot.length, 2);
assert.equal(tt.so_dong_canh_bao, 2);
assert.equal(tt.dem_muc_do.Warning, 1);
assert.equal(tt.dem_muc_do.Error, 1);

const chuyenHoSo = (f) => (Array.isArray(f.duLieu) ? f.duLieu : []).map((hoSo) => ({
  ...hoSo,
  ma_lk: String(hoSo?.ma_lk || 'LK001').toUpperCase(),
  ten_file_goc: hoSo.ten_file_goc || f.tenFile || '',
  xml_import_id: hoSo.xml_import_id || f.xmlImportId || '',
  thoi_gian: '01/01/2026 10:00:00',
  ket_qua_giam_dinh: f.chiTietLoi || [],
}));
const hoSoGui = chuyenHoSo({
  tenFile: 'hs.xml',
  xmlImportId: 'xmlimp_test',
  duLieu: [{ ma_lk: 'lk001', xml1: { MA_LK: 'LK001' } }],
  chiTietLoi: [{ ma_luat: 'X', muc_do: 'Info' }],
});
assert.equal(hoSoGui[0].xml_import_id, 'xmlimp_test');
assert.equal(hoSoGui[0].ten_file_goc, 'hs.xml');
assert.ok(hoSoGui[0].thoi_gian);

console.log('qa_kho_chinh_thuc_luu: OK');
