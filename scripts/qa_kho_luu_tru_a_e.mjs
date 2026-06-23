#!/usr/bin/env node
/** QA: Kho lưu trữ A (không cap + persist/quota) + E (lưu gọn + gzip). */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const khoSrc = readFileSync(join(root, 'ma_nguon/tien_ich/kho_du_lieu.jsx'), 'utf8');
const khoUiSrc = readFileSync(join(root, 'ma_nguon/man_hinh/man_hinh_kho_luu_tru.jsx'), 'utf8');

assert.doesNotMatch(khoSrc, /MAX_HO_SO_GD_LUU_TRU\s*=/);
assert.doesNotMatch(khoSrc, /MAX_XML_IMPORT_RECORDS\s*=/);
assert.match(khoSrc, /export const damBaoLuuTruBenTrenWeb/);
assert.match(khoSrc, /export const layThongTinDungLuongKho/);
assert.match(khoSrc, /PHIEN_BAN_HO_SO_GD_GON/);
assert.match(khoSrc, /ket_qua_giam_dinh_gzip/);
assert.match(khoSrc, /nenJsonGzipBase64/);
assert.match(khoSrc, /xuLyFileXML130Va4210/);
assert.match(khoUiSrc, /layThongTinDungLuongKho/);
assert.match(khoUiSrc, /damBaoLuuTruBenTrenWeb/);
assert.match(khoUiSrc, /thanh_tien_trinh_dung_luong/);

const catGiam = khoSrc.match(/const catGiamLichSuImportXml[\s\S]*?^};/m)?.[0] || '';
assert.doesNotMatch(catGiam, /slice\(0,\s*MAX_/);

console.log('qa_kho_luu_tru_a_e: OK');
