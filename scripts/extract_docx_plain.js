/**
 * Trích văn bản thuần từ word/document.xml trong .docx (ZIP).
 * Dùng: node scripts/extract_docx_plain.js <đường_dẫn.docx> [file_out.txt]
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

function decodeXmlEntities(s) {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCharCode(parseInt(h, 16)));
}

function stripOOXMLNoise(s) {
  let t = s.replace(/<w:tab[^/]*\/>/gi, ' ');
  t = t.replace(/<[^>]+>/g, '');
  return t.replace(/\s+/g, ' ').trim();
}

function extractFromDocumentXml(xml) {
  const parts = xml.split(/<\/w:p>/);
  const lines = [];
  const re = /<w:t[^>]*>([\s\S]*?)<\/w:t>/g;
  for (const chunk of parts) {
    const texts = [];
    let m;
    re.lastIndex = 0;
    while ((m = re.exec(chunk)) !== null) texts.push(decodeXmlEntities(m[1]));
    let line = texts.join('');
    if (line.includes('<')) line = stripOOXMLNoise(line);
    line = line.replace(/\s+/g, ' ').trim();
    if (line) lines.push(line);
  }
  return lines.join('\n');
}

function main() {
  const docx = process.argv[2];
  let out = process.argv[3];
  if (!docx || !fs.existsSync(docx)) {
    console.error('Usage: node scripts/extract_docx_plain.js <file.docx> [out.txt]');
    process.exit(1);
  }
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'docx-'));
  const udir = path.join(tmp, 'u');
  fs.mkdirSync(udir, { recursive: true });
  const zipCopy = path.join(tmp, 'f.zip');
  fs.copyFileSync(docx, zipCopy);
  const esc = (s) => s.replace(/'/g, "''");
  try {
    execSync(
      `powershell -NoProfile -Command "Expand-Archive -LiteralPath '${esc(zipCopy)}' -DestinationPath '${esc(udir)}' -Force"`,
      { stdio: 'pipe' },
    );
  } catch (e) {
    console.error('Expand-Archive failed:', e.message);
    process.exit(1);
  }
  const docXml = path.join(udir, 'word', 'document.xml');
  if (!fs.existsSync(docXml)) {
    console.error('Missing word/document.xml after unzip');
    process.exit(1);
  }
  const xml = fs.readFileSync(docXml, 'utf8');
  const plain = extractFromDocumentXml(xml);
  if (!out) {
    const base = path.basename(docx, path.extname(docx));
    out = path.join(path.dirname(docx), `${base}_plain.txt`);
  }
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, plain, 'utf8');
  console.log(out, plain.length, 'chars', plain.split('\n').length, 'lines');
  fs.rmSync(tmp, { recursive: true, force: true });
}

main();
