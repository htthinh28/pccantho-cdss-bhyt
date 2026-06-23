#!/usr/bin/env node
/**
 * QA: kiểm tra prefix storage tenant — logic mirror tenant_context (không import .jsx).
 */
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const ORG_PREFIX = 'CDSS_ORG_';
const LEGACY_ORG_MAP = { phuongchau: 'phuongchau_soc_trang' };

const chuanHoaOrgId = (raw) => {
  const token = String(raw || '').trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
  return LEGACY_ORG_MAP[token] || token;
};

const prefixStorageKey = (orgId, baseKey) => {
  const key = String(baseKey || '').trim();
  if (!key) return key;
  const expected = `${ORG_PREFIX}${orgId}_`;
  if (key.startsWith(expected)) return key;
  return `${expected}${key}`;
};

const resolveIdbName = (orgId, base) => `${base}__${orgId}`;

// --- In-memory isolation simulation ---
const stores = new Map();

const memSet = (orgId, baseKey, value) => {
  const k = prefixStorageKey(orgId, baseKey);
  stores.set(k, value);
};

const memGet = (orgId, baseKey) => {
  const k = prefixStorageKey(orgId, baseKey);
  return stores.get(k);
};

const testPrefixIsolation = () => {
  stores.clear();
  memSet('phuongchau_soc_trang', 'CDSS_DATA_LUAT_THUOC', 'DATA_A');
  memSet('phuongchau_can_tho', 'CDSS_DATA_LUAT_THUOC', 'DATA_B');
  memSet('phuongchau_sa_dec', 'DANH_SACH_TAI_KHOAN', '[]');

  assert.strictEqual(memGet('phuongchau_soc_trang', 'CDSS_DATA_LUAT_THUOC'), 'DATA_A');
  assert.strictEqual(memGet('phuongchau_can_tho', 'CDSS_DATA_LUAT_THUOC'), 'DATA_B');
  assert.strictEqual(memGet('phuongchau_soc_trang', 'CDSS_DATA_LUAT_THUOC'), memGet('phuongchau_soc_trang', 'CDSS_DATA_LUAT_THUOC'));
  assert.notStrictEqual(
    memGet('phuongchau_soc_trang', 'CDSS_DATA_LUAT_THUOC'),
    memGet('phuongchau_can_tho', 'CDSS_DATA_LUAT_THUOC'),
  );
  assert.strictEqual(memGet('phuongchau_can_tho', 'DANH_SACH_TAI_KHOAN'), undefined);
};

const testIdbNames = () => {
  const a = resolveIdbName('phuongchau_soc_trang', 'CDSS_HO_SO_DB');
  const b = resolveIdbName('phuongchau_can_tho', 'CDSS_HO_SO_DB');
  const c = resolveIdbName('phuongchau_sa_dec', 'CDSS_HO_SO_DB');
  assert.notStrictEqual(a, b);
  assert.notStrictEqual(b, c);
  assert.strictEqual(a, 'CDSS_HO_SO_DB__phuongchau_soc_trang');
};

const testRegistry = () => {
  const registryPath = path.join(root, 'config', 'tenants', 'registry.json');
  const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
  const ids = registry.tenants.map((t) => t.orgId);
  assert.deepStrictEqual(ids.sort(), [
    'phuongchau_can_tho',
    'phuongchau_sa_dec',
    'phuongchau_soc_trang',
  ].sort());
  for (const id of ids) {
    const p = path.join(root, 'config', 'tenants', id, 'profile.json');
    assert.ok(fs.existsSync(p), `missing profile ${id}`);
  }
};

const testSourceIntegration = () => {
  const files = [
    'ma_nguon/tien_ich/tenant_context.jsx',
    'ma_nguon/tien_ich/tenant_storage.jsx',
    'ma_nguon/tien_ich/tenant_migration.jsx',
    'app.config.js',
  ];
  for (const f of files) {
    assert.ok(fs.existsSync(path.join(root, f)), `missing ${f}`);
  }
  const kho = fs.readFileSync(path.join(root, 'ma_nguon/tien_ich/kho_du_lieu.jsx'), 'utf8');
  assert.ok(kho.includes('resolveIdbName'), 'kho_du_lieu must use resolveIdbName');
  assert.ok(kho.includes('tenantGetItem'), 'kho_du_lieu must use tenant storage');
};

const testLegacyAlias = () => {
  assert.strictEqual(chuanHoaOrgId('phuongchau'), 'phuongchau_soc_trang');
  assert.strictEqual(chuanHoaOrgId('phuongchau_can_tho'), 'phuongchau_can_tho');
};

console.log('qa_tenant_isolation: prefix isolation...');
testPrefixIsolation();
console.log('qa_tenant_isolation: idb names...');
testIdbNames();
console.log('qa_tenant_isolation: registry 3 BV...');
testRegistry();
console.log('qa_tenant_isolation: source integration...');
testSourceIntegration();
console.log('qa_tenant_isolation: legacy alias...');
testLegacyAlias();
console.log('\n✅ qa_tenant_isolation: PASS (3 BV Model A)\n');
