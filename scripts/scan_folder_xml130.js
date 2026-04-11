#!/usr/bin/env node
/**
 * Quét nhanh cả thư mục XML130 (GIAMDINHHS + base64): số dòng, lỗi parse, XML4 rỗng.
 * Usage: node scripts/scan_folder_xml130.js "tai_nguyen/Da kiem tra"
 */
const fs = require('fs');
const path = require('path');
const { Buffer } = require('buffer');
const { DOMParser } = require('@xmldom/xmldom');

const dirArg = process.argv[2];
if (!dirArg) {
  console.error('Usage: node scripts/scan_folder_xml130.js <folder>');
  process.exit(1);
}

const TAG_BY_XML = {
  XML1: 'TONG_HOP',
  XML2: 'CHI_TIET_THUOC',
  XML3: 'CHI_TIET_DVKT',
  XML4: 'CHI_TIET_CLS',
  XML5: 'CHI_TIET_DIEN_BIEN_BENH',
  XML6: 'CHI_TIET_THANH_TOAN',
};

const text = (node, tag) => {
  const found = node.getElementsByTagName(tag)[0];
  return found && found.textContent ? String(found.textContent).trim() : '';
};

const parseXml = (xmlRaw) => new DOMParser().parseFromString(String(xmlRaw || ''), 'text/xml');

const hasParserError = (doc) => {
  const byTag = doc.getElementsByTagName('parsererror');
  if (byTag && byTag.length > 0) return true;
  const rootName = String(doc?.documentElement?.nodeName || '').toLowerCase();
  return rootName.includes('parsererror');
};

const parseRows = (xmlRaw, rowTag) => {
  const doc = parseXml(xmlRaw);
  if (hasParserError(doc)) return { parserError: true, rows: [] };
  const rows = [];
  const items = doc.getElementsByTagName(rowTag);
  for (let i = 0; i < items.length; i++) {
    const row = {};
    const nodes = items[i].childNodes || [];
    for (let j = 0; j < nodes.length; j++) {
      const child = nodes[j];
      if (child.nodeType !== 1) continue;
      const key = String(child.nodeName || '').replace(/^\uFEFF/, '').trim();
      if (!key) continue;
      row[key] = String(child.textContent || '').replace(/\u0000/g, '').trim();
    }
    rows.push(row);
  }
  return { parserError: false, rows };
};

const folder = path.resolve(dirArg);
const files = fs.readdirSync(folder).filter((f) => f.toLowerCase().endsWith('.xml'));

const totals = {
  files: 0,
  outerParserError: 0,
  innerParserErrorFiles: 0,
  xmlRowsSum: { XML1: 0, XML2: 0, XML3: 0, XML4: 0, XML5: 0, XML6: 0 },
  xml4ResultEmptyOld: 0,
  xml4ResultEmptyNew: 0,
  filesWithXml4: 0,
};

const perFile = [];

for (const name of files) {
  const filePath = path.join(folder, name);
  const raw = fs.readFileSync(filePath, 'utf8');
  const outer = parseXml(raw);
  totals.files += 1;
  if (hasParserError(outer)) {
    totals.outerParserError += 1;
    perFile.push({ file: name, err: 'outer_parsererror' });
    continue;
  }

  const listFileHoso = outer.getElementsByTagName('FILEHOSO');
  let innerErr = false;
  let fileHasXml4 = false;
  const local = { XML4: 0, xml4EmptyOld: 0, xml4EmptyNew: 0 };

  for (let i = 0; i < listFileHoso.length; i++) {
    const loai = text(listFileHoso[i], 'LOAIHOSO').toUpperCase();
    const rowTag = TAG_BY_XML[loai];
    if (!rowTag) continue;

    const encoded = text(listFileHoso[i], 'NOIDUNGFILE');
    if (!encoded) continue;

    let decoded = '';
    try {
      decoded = Buffer.from(encoded, 'base64').toString('utf8');
    } catch {
      innerErr = true;
      continue;
    }

    const { parserError, rows } = parseRows(decoded, rowTag);
    if (parserError) {
      innerErr = true;
      continue;
    }

    totals.xmlRowsSum[loai] = (totals.xmlRowsSum[loai] || 0) + rows.length;

    if (loai === 'XML4') {
      fileHasXml4 = true;
      local.XML4 += rows.length;
      for (const row of rows) {
        const oldEmpty = !row.GIA_TRI && !row.KET_LUAN && !row.MO_TA;
        const hasClsMeta = !!(row.TEN_CHI_SO || row.MA_CHI_SO || row.DON_VI_DO);
        const newEmpty = oldEmpty && !hasClsMeta;
        if (oldEmpty) {
          totals.xml4ResultEmptyOld += 1;
          local.xml4EmptyOld += 1;
        }
        if (newEmpty) {
          totals.xml4ResultEmptyNew += 1;
          local.xml4EmptyNew += 1;
        }
      }
    }
  }

  if (innerErr) totals.innerParserErrorFiles += 1;
  if (fileHasXml4) totals.filesWithXml4 += 1;
  perFile.push({
    file: name,
    innerErr,
    rows: { ...local },
  });
}

console.log(JSON.stringify({ folder, totals, sampleFiles: perFile.slice(0, 5) }, null, 2));
console.error(`OK: ${totals.files} file(s), outerErr=${totals.outerParserError}, innerErrFiles=${totals.innerParserErrorFiles}`);
