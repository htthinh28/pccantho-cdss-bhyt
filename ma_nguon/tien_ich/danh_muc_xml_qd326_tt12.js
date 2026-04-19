/**
 * Trao đổi danh mục nội bộ CSKCB dạng XML — bám cấu trúc hồ sơ/chỉ tiêu theo
 * Thông tư 12/2026/TT-BTC (tài liệu kỹ thuật) và khung cập nhật QĐ 326/QĐ-BHXH (31/03/2026).
 *
 * Đối soát với «file mẫu» Excel (MAU_EXCEL_CHUAN trong `mau_excel_chuan_danh_muc.js`):
 * | Phần tử XML              | Ý nghĩa                          | Khớp mẫu Excel                          |
 * |--------------------------|-----------------------------------|----------------------------------------|
 * | DmNoiBoCSKCB/@maBang     | ID tab (vd. DANH_MUC_THUOC_…)    | Khóa tra cứu tab                       |
 * | TieuDeCot/Cot/@ten       | Tên cột                          | Mỗi chuỗi = một cột trong MAU_EXCEL_*   |
 * | DuLieu/Hang/Truong/@cot  | Tên cột (lặp lại tiêu đề)        | Phải ∈ tập cột mẫu (hoặc cột đã thêm)  |
 * | Truong text              | Giá trị ô                        | Giá trị tương ứng khi nhập lại          |
 *
 * Khi BHXH công bố XSD/đặc tả chi tiết, chỉ cần điều chỉnh `PHIEN_BAN_DINH_DANG_XML` và mapping phần tử.
 */

/** URI định danh phiên bản (không bắt buộc có XSD ngoài). */
export const XML_DM_NOI_BO_NS = 'urn:cdss-bhyt:danh-muc-noi-bo:qd326-tt12-2026';

/** Chuỗi tham chiếu văn bản (hiển thị trong file xuất). */
export const NGUON_VAN_BAN_DM_XML =
  'QĐ 326/QĐ-BHXH (31/03/2026); TT 12/2026/TT-BTC — Tài liệu kỹ thuật định dạng trao đổi dữ liệu';

export const PHIEN_BAN_DINH_DANG_XML = '1.0';

const escapeXmlText = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const unescapeXmlText = (s) =>
  String(s ?? '')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');

/**
 * @param {{ maBang: string, tenBang?: string, columns: string[], rows: Record<string, unknown>[] }} p
 * @returns {string}
 */
export function xuatXmlDanhMucNoiBo(p) {
  const { maBang, tenBang = '', columns, rows } = p;
  const cols = Array.isArray(columns) ? columns : [];
  const ngayXuat = new Date().toISOString();
  const cotXml = cols
    .map((c, i) => `    <Cot thuTu="${i}" ten="${escapeXmlText(c)}"/>`)
    .join('\n');
  const hangXml = (Array.isArray(rows) ? rows : [])
    .map((row) => {
      const truong = cols
        .map((col) => {
          const v = row && row[col] !== undefined && row[col] !== null ? row[col] : '';
          return `      <Truong cot="${escapeXmlText(col)}">${escapeXmlText(v)}</Truong>`;
        })
        .join('\n');
      return `    <Hang>\n${truong}\n    </Hang>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<DmNoiBoCSKCB
  xmlns="${XML_DM_NOI_BO_NS}"
  phienBanDinhDang="${PHIEN_BAN_DINH_DANG_XML}"
  maBang="${escapeXmlText(maBang)}"
  tenBang="${escapeXmlText(tenBang)}"
  nguonVanBan="${escapeXmlText(NGUON_VAN_BAN_DM_XML)}"
  ngayXuat="${escapeXmlText(ngayXuat)}"
>
  <TieuDeCot>
${cotXml}
  </TieuDeCot>
  <DuLieu>
${hangXml}
  </DuLieu>
</DmNoiBoCSKCB>
`;
}

/**
 * @param {string} xmlString
 * @returns {{ columns: string[], rows: Record<string, string>[], meta: Record<string, string>, loi?: string }}
 */
export function nhapXmlDanhMucNoiBo(xmlString) {
  const raw = String(xmlString || '').replace(/^\uFEFF/, '');
  if (!raw.trim()) {
    return { columns: [], rows: [], meta: {}, loi: 'File rỗng.' };
  }

  const meta = {};
  const openTag = raw.match(/<DmNoiBoCSKCB\b([^>]*)>/i);
  if (openTag) {
    const block = openTag[1];
    const grab = (name) => {
      const m = block.match(new RegExp(`${name}="([^"]*)"`, 'i'));
      return m ? unescapeXmlText(m[1]) : '';
    };
    meta.phienBanDinhDang = grab('phienBanDinhDang');
    meta.maBang = grab('maBang');
    meta.tenBang = grab('tenBang');
    meta.nguonVanBan = grab('nguonVanBan');
    meta.ngayXuat = grab('ngayXuat');
  } else {
    return {
      columns: [],
      rows: [],
      meta: {},
      loi: 'Không tìm thấy phần tử gốc DmNoiBoCSKCB (định dạng CDSS QĐ326/TT12).',
    };
  }

  const cotTh = [];
  const reCot = /<Cot\b[^>]*\bten="([^"]*)"[^>]*\/?>/gi;
  let mc;
  while ((mc = reCot.exec(raw)) !== null) {
    cotTh.push(unescapeXmlText(mc[1]));
  }
  const columnsOrdered = [];
  const seenCol = new Set();
  cotTh.forEach((c) => {
    if (!c || seenCol.has(c)) return;
    seenCol.add(c);
    columnsOrdered.push(c);
  });
  const columns = columnsOrdered;

  const rows = [];
  const reHang = /<Hang\b[^>]*>([\s\S]*?)<\/Hang>/gi;
  let mh;
  while ((mh = reHang.exec(raw)) !== null) {
    const inner = mh[1];
    const row = {};
    const reTruong = /<Truong\b[^>]*\bcot="([^"]*)"[^>]*>([\s\S]*?)<\/Truong>/gi;
    let mt;
    while ((mt = reTruong.exec(inner)) !== null) {
      const col = unescapeXmlText(mt[1]);
      row[col] = unescapeXmlText(mt[2]).trim();
    }
    if (Object.keys(row).length > 0) rows.push(row);
  }

  if (columns.length === 0 && rows.length > 0) {
    const union = [];
    const seenU = new Set();
    rows.forEach((r) => {
      Object.keys(r).forEach((k) => {
        if (k && !seenU.has(k)) {
          seenU.add(k);
          union.push(k);
        }
      });
    });
    return { columns: union, rows, meta };
  }

  return { columns, rows, meta };
}

/**
 * Web: tải chuỗi XML xuống máy.
 * @param {string} xml
 * @param {string} fileName
 */
export function taiXuongFileXmlTrenWeb(xml, fileName) {
  if (typeof document === 'undefined' || typeof Blob === 'undefined') return;
  const blob = new Blob([xml], { type: 'application/xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}
