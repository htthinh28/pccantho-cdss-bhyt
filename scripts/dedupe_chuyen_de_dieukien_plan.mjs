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
  const t1 = s.indexOf('`', dieuLabel);
  const t2 = s.indexOf('`', t1 + 1);
  const dieu = s.slice(t1 + 1, t2).trim();
  const num = parseInt(idm[1].replace('CHUYEN_DE-', ''), 10);
  blocks.push({ id: idm[1], num, dieu, start, end: null });
  i = t2 + 1;
}

const byDieu = new Map();
for (const b of blocks) {
  if (!byDieu.has(b.dieu)) byDieu.set(b.dieu, []);
  byDieu.get(b.dieu).push(b);
}

const toDelete = new Set();
for (const [, group] of byDieu) {
  if (group.length < 2) continue;
  const max = group.reduce((a, b) => (b.num > a.num ? b : a));
  for (const b of group) {
    if (b.id !== max.id) toDelete.add(b.id);
  }
}

console.log('Rules to delete (keep max id per identical DIEU_KIEN):', toDelete.size);
console.log([...toDelete].sort((a, b) => parseInt(a.slice(10), 10) - parseInt(b.slice(10), 10)).join('\n'));
