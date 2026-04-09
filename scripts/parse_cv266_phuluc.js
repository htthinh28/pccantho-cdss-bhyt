/**
 * Trích cấu trúc từ PL1_plain.txt / PL2_plain.txt (UTF-8) sinh ra cv266_pl_index.json.
 * Chạy: node scripts/parse_cv266_phuluc.js
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', 'tai_lieu', '_extract_cv266');

function parse(text, nguon) {
  const lines = text.split(/\r?\n/).map((l) => l.trim());
  const codeRe = /^(KT\d[\w_]*|TH\d+)$/;
  const reasonRe = /^[ST]\.\d{3}\.\d{3}$/;
  const rows = [];

  for (let i = 0; i < lines.length; i++) {
    if (!codeRe.test(lines[i])) continue;
    const maChuyenDe = lines[i];
    let j = i + 1;
    while (j < lines.length && !lines[j]) j++;
    if (j >= lines.length || !reasonRe.test(lines[j])) continue;
    const maLyDo = lines[j];
    j++;
    while (j < lines.length && !lines[j]) j++;
    const noiDung = [];
    while (j < lines.length) {
      const L = lines[j];
      if (codeRe.test(L)) break;
      if (L === 'TT') break;
      if (/^\d+\.\d+$/.test(L)) break;
      if (
        L
        && L !== 'Mã chuyên'
        && L !== 'đề'
        && L !== 'Mã lý do từ'
        && L !== 'Mã lý do'
        && L !== 'từ chối'
        && L !== 'chối'
        && L !== 'Nội dung'
        && L !== 'Căn cứ pháp lý'
        && L !== 'Căn cứ pháp lý chi tiết'
      ) {
        noiDung.push(L);
      }
      j++;
    }
    const nd = noiDung.join(' ').replace(/\s+/g, ' ').trim().slice(0, 800);
    if (nd.length > 5) rows.push({ maChuyenDe, maLyDo, noiDung: nd, nguon });
  }
  return rows;
}

function main() {
  const pl1 = fs.readFileSync(path.join(root, 'PL1_plain.txt'), 'utf8');
  const pl2 = fs.readFileSync(path.join(root, 'PL2_plain.txt'), 'utf8');
  const r1 = parse(pl1, 'PL1');
  const r2 = parse(pl2, 'PL2');
  const map = new Map();
  for (const r of r1) map.set(`${r.maChuyenDe}|${r.maLyDo}|${r.noiDung.slice(0, 120)}`, r);
  for (const r of r2) {
    const k = `${r.maChuyenDe}|${r.maLyDo}|${r.noiDung.slice(0, 120)}`;
    if (!map.has(k)) map.set(k, r);
  }
  const items = [...map.values()].sort(
    (a, b) => a.maChuyenDe.localeCompare(b.maChuyenDe) || a.maLyDo.localeCompare(b.maLyDo),
  );
  const out = {
    generated: new Date().toISOString(),
    nguonGoc:
      'Phụ lục Công văn 266 (chuyên đề) — Trung tâm Kiểm soát thanh toán BHXH BHYT điện tử; trích từ PL1_CD_chuyentinh.docx, PL2_CD chuyentinh.docx',
    soMuc: items.length,
    items,
  };
  fs.writeFileSync(path.join(root, 'cv266_pl_index.json'), JSON.stringify(out, null, 2), 'utf8');
  console.log('PL1:', r1.length, 'PL2:', r2.length, 'unique:', items.length);
}

main();
