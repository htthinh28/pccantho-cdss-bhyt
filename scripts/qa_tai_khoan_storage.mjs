/**
 * Kiểm tra logic gộp danh sách tài khoản (IndexedDB + legacy) và hàng đợi ghi.
 * Chạy: node scripts/qa_tai_khoan_storage.mjs
 */

const gopHaiMangTaiKhoan = (arrA, arrB) => {
  const map = new Map();
  const tsTaiKhoan = (u) => Date.parse(u?.capNhatLuc || u?.taoLuc || '') || 0;
  const them = (u) => {
    if (!u || typeof u !== 'object') return;
    const email = String(u.email || '').trim().toLowerCase();
    if (!email) return;
    const existing = map.get(email);
    if (!existing) {
      map.set(email, u);
      return;
    }
    const merged = tsTaiKhoan(u) >= tsTaiKhoan(existing)
      ? { ...existing, ...u }
      : { ...u, ...existing };
    map.set(email, merged);
  };
  for (const u of [...(Array.isArray(arrA) ? arrA : []), ...(Array.isArray(arrB) ? arrB : [])]) them(u);
  return Array.from(map.values());
};

let chain = Promise.resolve();
const voiKhoa = (fn) => {
  const job = chain.then(fn, fn);
  chain = job.catch(() => {});
  return job;
};

const assert = (cond, msg) => {
  if (!cond) throw new Error(msg);
};

// Gộp IDB cũ + legacy mới → giữ user mới
const idb = [{ email: 'admin@test.vn', hoTen: 'Admin', capNhatLuc: '2026-01-01T00:00:00.000Z' }];
const legacy = [
  { email: 'admin@test.vn', hoTen: 'Admin', capNhatLuc: '2026-01-01T00:00:00.000Z' },
  { email: 'user@test.vn', hoTen: 'User Moi', capNhatLuc: '2026-06-08T10:00:00.000Z' },
];
const merged = gopHaiMangTaiKhoan(idb, legacy);
assert(merged.length === 2, `expected 2 users, got ${merged.length}`);
assert(merged.some((u) => u.email === 'user@test.vn'), 'missing new user from legacy');

// Ưu tiên capNhatLuc mới hơn
const a = [{ email: 'x@v.vn', matKhau: 'old', capNhatLuc: '2026-01-01T00:00:00.000Z' }];
const b = [{ email: 'x@v.vn', matKhau: 'new', capNhatLuc: '2026-06-08T00:00:00.000Z' }];
const pick = gopHaiMangTaiKhoan(a, b);
assert(pick[0].matKhau === 'new', 'should prefer newer capNhatLuc');

// Hàng đợi ghi tuần tự
let store = [];
const doc = async () => [...store];
const append = async (user) => {
  const hienTai = await doc();
  store = [...hienTai, user];
  return store;
};

await Promise.all([
  voiKhoa(async () => { await append({ email: 'a@v.vn' }); }),
  voiKhoa(async () => { await append({ email: 'b@v.vn' }); }),
  voiKhoa(async () => { await append({ email: 'c@v.vn' }); }),
]);
assert(store.length === 3, `write queue should keep all users, got ${store.length}`);

console.log(JSON.stringify({ ok: true, tests: 3 }, null, 2));
