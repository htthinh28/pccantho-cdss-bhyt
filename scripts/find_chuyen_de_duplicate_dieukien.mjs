import fs from 'fs';

const path = new URL('../ma_nguon/tien_ich/luat_giam_dinh_chuyen_de_hardcoded.jsx', import.meta.url);
const s = fs.readFileSync(path, 'utf8');
const blocks = [];
let i = 0;
while (true) {
  const rest = s.slice(i);
  const idm = rest.match(/\{\s*id:\s*'(CHUYEN_DE-\d+)'/);
  if (!idm) break;
  const start = i + idm.index;
  const dieuLabel = s.indexOf('DIEU_KIEN:', start);
  if (dieuLabel === -1) break;
  const t1 = s.indexOf('`', dieuLabel);
  const t2 = s.indexOf('`', t1 + 1);
  if (t1 === -1 || t2 === -1) break;
  const dieu = s.slice(t1 + 1, t2);
  blocks.push({ id: idm[1], dieu: dieu.trim() });
  i = t2 + 1;
}

const byDieu = new Map();
for (const b of blocks) {
  if (!byDieu.has(b.dieu)) byDieu.set(b.dieu, []);
  byDieu.get(b.dieu).push(b.id);
}
const exactDups = [...byDieu.entries()].filter(([, ids]) => ids.length > 1);
console.log('Total rules parsed:', blocks.length);
console.log('Exact DIEU_KIEN duplicates:', exactDups.length);
for (const [, ids] of exactDups) {
  console.log(' ', ids.join(' <==> '));
}
