/**
 * Đối soát XML danh mục (QĐ326/TT12) với từng tập cột file mẫu Excel (MAU_EXCEL_CHUAN):
 * xuất → nhập round-trip, kiểm tra từng tên cột và giá trị ô.
 *
 * Chạy: node ./scripts/qa_danh_muc_xml_vs_mau.mjs
 * Hoặc: npm run qa:danh-muc-xml-mau
 */
import { MAU_EXCEL_CHUAN, MA_BANG_CO_MAU_EXCEL } from '../ma_nguon/tien_ich/mau_excel_chuan_danh_muc.js';
import {
  nhapXmlDanhMucNoiBo,
  xuatXmlDanhMucNoiBo,
  PHIEN_BAN_DINH_DANG_XML,
} from '../ma_nguon/tien_ich/danh_muc_xml_qd326_tt12.js';

const cotGiongNhauTheoThuTu = (a, b) =>
  Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((v, i) => v === b[i]);

function main() {
  let err = 0;
  for (const maBang of MA_BANG_CO_MAU_EXCEL) {
    const columns = MAU_EXCEL_CHUAN[maBang];
    const row = {};
    columns.forEach((c) => {
      row[c] = `v_${c}_x`;
    });
    const xml = xuatXmlDanhMucNoiBo({ maBang, tenBang: maBang, columns, rows: [row] });
    const out = nhapXmlDanhMucNoiBo(xml);
    if (out.loi) {
      console.error(`[${maBang}]`, out.loi);
      err += 1;
      continue;
    }
    if (!cotGiongNhauTheoThuTu(out.columns, columns)) {
      console.error(
        `[${maBang}] Thứ tự / tập cột sau round-trip không khớp mẫu.`,
        '\n  Mẫu:',
        columns,
        '\n  Nhận:',
        out.columns,
      );
      err += 1;
    }
    if (!out.rows[0]) {
      console.error(`[${maBang}] Không có dòng Hang.`);
      err += 1;
      continue;
    }
    for (const c of columns) {
      const got = out.rows[0][c];
      const want = `v_${c}_x`;
      if (String(got) !== want) {
        console.error(`[${maBang}] Cột "${c}": mong "${want}", nhận "${got}"`);
        err += 1;
      }
    }
    const extra = Object.keys(out.rows[0]).filter((k) => !columns.includes(k));
    if (extra.length) {
      console.error(`[${maBang}] Cột thừa trong Hang (không có trong mẫu):`, extra);
      err += 1;
    }
    if (out.meta.maBang !== maBang) {
      console.error(`[${maBang}] @maBang meta: mong "${maBang}", nhận "${out.meta.maBang}"`);
      err += 1;
    }
    if (out.meta.phienBanDinhDang !== PHIEN_BAN_DINH_DANG_XML) {
      console.error(
        `[${maBang}] @phienBanDinhDang: mong "${PHIEN_BAN_DINH_DANG_XML}", nhận "${out.meta.phienBanDinhDang}"`,
      );
      err += 1;
    }
  }
  if (err > 0) {
    console.error(`[qa:danh-muc-xml-mau] FAIL — ${err} lỗi đối soát.`);
    process.exit(1);
  }
  console.log(
    `[qa:danh-muc-xml-mau] OK — ${MA_BANG_CO_MAU_EXCEL.length} bảng; round-trip XML khớp từng trường MAU_EXCEL_CHUAN.`,
  );
}

main();
