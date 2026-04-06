#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { Buffer } = require('buffer');
const { DOMParser } = require('@xmldom/xmldom');

const ROOT = path.resolve(__dirname, '..');
const DEFAULT_SCAN_DIR = path.join(ROOT, 'tai_nguyen');
const OUTPUT_PATH = path.join(ROOT, 'test_xml', 'antibiotic_case_scan.json');

const ANTIBIOTIC_PATTERNS = [
  /amoxic/i,
  /clav/i,
  /cefa/i,
  /cefot/i,
  /ceftri/i,
  /cefuro/i,
  /cefix/i,
  /cephal/i,
  /biofazolin/i,
  /metronid/i,
  /tinid/i,
  /azith/i,
  /clarith/i,
  /levoflox/i,
  /ciproflox/i,
  /moxiflox/i,
  /vancom/i,
  /meropen/i,
  /imipen/i,
  /ertapen/i,
  /linezolid/i,
  /colistin/i,
  /gentam/i,
  /amikacin/i,
  /tobramy/i,
  /piperacillin/i,
  /tazobactam/i,
  /ampicillin/i,
  /sulbactam/i,
  /ornidazol/i,
  /nitroimidazol/i,
];

const XML_ROW_TAGS = {
  XML1: 'TONG_HOP',
  XML2: 'CHI_TIET_THUOC',
  XML3: 'CHI_TIET_DVKT',
  XML4: 'CHI_TIET_CLS',
  XML5: 'CHI_TIET_DIEN_BIEN_BENH',
};

const parser = new DOMParser();

const normalize = (value) => String(value || '').replace(/\s+/g, ' ').trim();

const parseXml = (raw) => {
  const input = String(raw || '').trim();
  if (!input) return null;
  try {
    return parser.parseFromString(input, 'text/xml');
  } catch {
    return null;
  }
};

const hasParserError = (doc) => {
  if (!doc || !doc.getElementsByTagName) return true;
  const byTag = doc.getElementsByTagName('parsererror');
  if (byTag && byTag.length > 0) return true;
  const rootName = String(doc?.documentElement?.nodeName || '').toLowerCase();
  return rootName.includes('parsererror');
};

const parseRows = (xmlRaw, rowTag) => {
  const doc = parseXml(xmlRaw);
  if (hasParserError(doc)) return [];
  const rows = [];
  const items = doc.getElementsByTagName(rowTag);
  for (let index = 0; index < items.length; index += 1) {
    const item = items[index];
    const row = {};
    const children = item.childNodes || [];
    for (let childIndex = 0; childIndex < children.length; childIndex += 1) {
      const child = children[childIndex];
      if (child.nodeType !== 1) continue;
      const key = normalize(child.nodeName).replace(/^\uFEFF/, '');
      if (!key) continue;
      row[key] = normalize(child.textContent);
    }
    rows.push(row);
  }
  return rows;
};

const decodeInnerXml = (outerDoc, loai) => {
  if (!outerDoc || !outerDoc.getElementsByTagName) return '';
  const fileHosoNodes = outerDoc.getElementsByTagName('FILEHOSO');
  for (let index = 0; index < fileHosoNodes.length; index += 1) {
    const node = fileHosoNodes[index];
    const loaiNode = node.getElementsByTagName('LOAIHOSO')[0];
    const dataNode = node.getElementsByTagName('NOIDUNGFILE')[0];
    const currentLoai = loaiNode ? normalize(loaiNode.textContent).toUpperCase() : '';
    if (currentLoai !== loai) continue;
    const raw = dataNode ? normalize(dataNode.textContent) : '';
    if (!raw) return '';
    try {
      return Buffer.from(raw, 'base64').toString('utf8');
    } catch {
      return raw;
    }
  }
  return '';
};

const extractXmlSource = (outerDoc, outerRaw, loai) => {
  const decoded = decodeInnerXml(outerDoc, loai);
  if (decoded) return decoded;
  const directDoc = parseXml(outerRaw);
  if (hasParserError(directDoc)) return '';
  const rootName = normalize(directDoc.documentElement?.nodeName).toUpperCase();
  if (rootName === XML_ROW_TAGS[loai]) {
    return outerRaw;
  }
  return '';
};

const isAntibiotic = (row) => {
  const haystack = [row.MA_THUOC, row.TEN_THUOC, row.HAM_LUONG, row.LIEU_DUNG, row.CACH_DUNG]
    .map(normalize)
    .join(' ');
  return ANTIBIOTIC_PATTERNS.some((pattern) => pattern.test(haystack));
};

const inferRoute = (row) => {
  const source = [row.DUONG_DUNG, row.LIEU_DUNG, row.CACH_DUNG, row.DON_VI_TINH, row.TEN_THUOC]
    .map(normalize)
    .join(' ')
    .toLowerCase();
  if (/(tiêm|tĩnh mạch|truyền|tm\b|tb\b|bắp|dưới da|tiem|truyen)/i.test(source)) return 'tiem_or_truyen';
  if (/(uống|uong|viên|goi|gói|sau ăn|trước ăn|nuốt)/i.test(source)) return 'uong';
  if (/(đặt|dat|âm đạo|hậu môn)/i.test(source)) return 'khac';
  return 'khong_ro';
};

const inferUseType = ({ xml1, xml3Rows, xml5Rows, row }) => {
  const diagnosis = [xml1.MA_BENH_CHINH, xml1.MA_BENH_KT, xml1.CHAN_DOAN_VAO, xml1.CHAN_DOAN_RV]
    .map(normalize)
    .join(' ')
    .toLowerCase();
  const procedures = xml3Rows
    .map((item) => [item.MA_DICH_VU, item.TEN_DICH_VU, item.MA_PTTT_QT].map(normalize).join(' '))
    .join(' ')
    .toLowerCase();
  const progress = xml5Rows
    .map((item) => [item.DIEN_BIEN_LS, item.HOI_CHAN, item.PHAU_THUAT].map(normalize).join(' '))
    .join(' ')
    .toLowerCase();
  const drugNarrative = [row.LIEU_DUNG, row.CACH_DUNG, row.TEN_THUOC].map(normalize).join(' ').toLowerCase();

  const prophylaxisSignals = [
    xml1.MA_PTTT_QT,
    /(mổ|phẫu thuật|thủ thuật|đẻ|sanh|vết mổ cũ|hậu phẫu|dự phòng|phòng ngừa)/i.test(diagnosis),
    /(mổ|phẫu thuật|đẻ|sanh|thủ thuật)/i.test(procedures),
    /(mổ|hậu phẫu|dự phòng)/i.test(progress),
    /dự phòng|phòng ngừa/i.test(drugNarrative),
  ];
  if (prophylaxisSignals.some(Boolean)) return 'co_the_du_phong';

  if (/(viêm|nhiễm|áp xe|mụn mủ|phế quản|phổi|nhiễm khuẩn|abces|áp-xe|lao|amidan|viêm họng|nhiem trung)/i.test(diagnosis)) {
    return 'co_the_dieu_tri';
  }

  return 'chua_phan_loai';
};

const buildCaseSummary = ({ filePath, xml1, xml3Rows, xml5Rows, row }) => ({
  filePath: path.relative(ROOT, filePath).replace(/\\/g, '/'),
  maLk: xml1.MA_LK || '',
  maBenhChinh: xml1.MA_BENH_CHINH || '',
  maBenhKemTheo: xml1.MA_BENH_KT || '',
  chanDoanVao: xml1.CHAN_DOAN_VAO || '',
  chanDoanRa: xml1.CHAN_DOAN_RV || '',
  maPtttQt: xml1.MA_PTTT_QT || '',
  maLoaiKcb: xml1.MA_LOAI_KCB || '',
  maThuoc: row.MA_THUOC || '',
  tenThuoc: row.TEN_THUOC || '',
  hamLuong: row.HAM_LUONG || '',
  donViTinh: row.DON_VI_TINH || '',
  soLuong: row.SO_LUONG || '',
  lieuDung: row.LIEU_DUNG || '',
  cachDung: row.CACH_DUNG || '',
  ngayYLenh: row.NGAY_YL || '',
  route: inferRoute(row),
  useType: inferUseType({ xml1, xml3Rows, xml5Rows, row }),
  procedureHints: xml3Rows.slice(0, 5).map((item) => normalize(item.TEN_DICH_VU)).filter(Boolean),
});

const walkXmlFiles = (dirPath) => {
  const files = [];
  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    const absolutePath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkXmlFiles(absolutePath));
      continue;
    }
    if (/\.xml$/i.test(entry.name)) {
      files.push(absolutePath);
    }
  }
  return files;
};

const main = () => {
  const targetDir = process.argv[2] ? path.resolve(process.argv[2]) : DEFAULT_SCAN_DIR;
  if (!fs.existsSync(targetDir)) {
    throw new Error(`Khong tim thay thu muc quet: ${targetDir}`);
  }

  const xmlFiles = walkXmlFiles(targetDir);
  const cases = [];

  for (const filePath of xmlFiles) {
    let outerRaw = '';
    try {
      outerRaw = fs.readFileSync(filePath, 'utf8');
    } catch {
      continue;
    }

    const outerDoc = parseXml(outerRaw);
    const xml1Raw = extractXmlSource(outerDoc, outerRaw, 'XML1');
    const xml2Raw = extractXmlSource(outerDoc, outerRaw, 'XML2');
    const xml3Raw = extractXmlSource(outerDoc, outerRaw, 'XML3');
    const xml5Raw = extractXmlSource(outerDoc, outerRaw, 'XML5');
    if (!xml2Raw) continue;

    const xml1Rows = parseRows(xml1Raw, XML_ROW_TAGS.XML1);
    const xml2Rows = parseRows(xml2Raw, XML_ROW_TAGS.XML2);
    const xml3Rows = parseRows(xml3Raw, XML_ROW_TAGS.XML3);
    const xml5Rows = parseRows(xml5Raw, XML_ROW_TAGS.XML5);
    const xml1 = xml1Rows[0] || {};

    for (const row of xml2Rows) {
      if (!isAntibiotic(row)) continue;
      cases.push(buildCaseSummary({ filePath, xml1, xml3Rows, xml5Rows, row }));
    }
  }

  const grouped = {
    tiem_or_truyen: [],
    uong: [],
    khong_ro: [],
    khac: [],
  };
  for (const item of cases) {
    grouped[item.route] = grouped[item.route] || [];
    grouped[item.route].push(item);
  }

  const payload = {
    generatedAt: new Date().toISOString(),
    scannedDir: path.relative(ROOT, targetDir).replace(/\\/g, '/'),
    totalCases: cases.length,
    grouped,
    cases,
  };

  fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');

  const preview = cases
    .slice(0, 40)
    .map((item) => [
      `FILE=${item.filePath}`,
      `MA_LK=${item.maLk}`,
      `THUOC=${item.tenThuoc}`,
      `ROUTE=${item.route}`,
      `USE=${item.useType}`,
      `CD=${item.chanDoanRa || item.chanDoanVao}`,
      `LIEU=${item.lieuDung || item.cachDung}`,
      '---',
    ].join('\n'))
    .join('\n');

  console.log(`Da quet ${xmlFiles.length} file XML.`);
  console.log(`Tim thay ${cases.length} dong thuoc nghi la khang sinh.`);
  console.log(`Da ghi ket qua vao ${path.relative(ROOT, OUTPUT_PATH).replace(/\\/g, '/')}`);
  console.log(preview);
};

try {
  main();
} catch (error) {
  console.error('[scan-antibiotic-cases] FAILED');
  console.error(error && error.message ? error.message : error);
  process.exit(1);
}