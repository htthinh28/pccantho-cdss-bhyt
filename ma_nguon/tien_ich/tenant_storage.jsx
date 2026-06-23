/**
 * Lớp lưu trữ có prefix tenant — bọc AsyncStorage + localStorage (web).
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import {
  isGlobalStorageKey,
  laMoiTruongWeb,
  prefixStorageKey,
  resolveOrgId,
  unprefixStorageKey,
} from './tenant_context';

const laWebCoLocalStorage = () => Platform.OS === 'web' && typeof window !== 'undefined' && !!window.localStorage;

const toStorageKey = (baseKey) => prefixStorageKey(baseKey);

export const tenantGetItem = async (baseKey) => {
  const key = toStorageKey(baseKey);
  if (laWebCoLocalStorage()) {
    try {
      const localValue = window.localStorage.getItem(key);
      if (localValue !== null && localValue !== undefined) return localValue;
    } catch {
      /* fallback */
    }
  }
  return AsyncStorage.getItem(key);
};

export const tenantSetItem = async (baseKey, value) => {
  const key = toStorageKey(baseKey);
  const normalized = String(value ?? '');
  const tasks = [
    AsyncStorage.setItem(key, normalized).catch(() => {}),
  ];
  if (laWebCoLocalStorage()) {
    tasks.push((async () => {
      try {
        window.localStorage.setItem(key, normalized);
      } catch {
        /* ignore */
      }
    })());
  }
  await Promise.all(tasks);
};

export const tenantRemoveItem = async (baseKey) => {
  const key = toStorageKey(baseKey);
  const tasks = [AsyncStorage.removeItem(key).catch(() => {})];
  if (laWebCoLocalStorage()) {
    tasks.push((async () => {
      try {
        window.localStorage.removeItem(key);
      } catch {
        /* ignore */
      }
    })());
  }
  await Promise.all(tasks);
};

export const tenantMultiGet = async (baseKeys = []) => {
  const keys = baseKeys.map((k) => toStorageKey(k));
  const pairs = await AsyncStorage.multiGet(keys).catch(() => []);
  const map = new Map(pairs);
  if (laWebCoLocalStorage()) {
    keys.forEach((key) => {
      if (map.get(key) != null) return;
      try {
        const v = window.localStorage.getItem(key);
        if (v != null) map.set(key, v);
      } catch {
        /* ignore */
      }
    });
  }
  return baseKeys.map((base, i) => [base, map.get(keys[i]) ?? null]);
};

export const tenantGetAllKeys = async () => {
  const orgPrefix = `CDSS_ORG_${resolveOrgId()}_`;
  const keys = await AsyncStorage.getAllKeys().catch(() => []);
  const out = new Set();
  keys.forEach((k) => {
    if (k.startsWith(orgPrefix)) out.add(unprefixStorageKey(k));
  });
  if (laWebCoLocalStorage()) {
    try {
      for (let i = 0; i < window.localStorage.length; i += 1) {
        const k = window.localStorage.key(i);
        if (k && k.startsWith(orgPrefix)) out.add(unprefixStorageKey(k));
      }
    } catch {
      /* ignore */
    }
  }
  return Array.from(out);
};

/** Đọc chunked data theo base key (không prefix chunk suffix). */
export const tenantFetchChunkedData = async (baseKey, { parseJson = true } = {}) => {
  const chunksStr = await tenantGetItem(`${baseKey}_CHUNKS`);
  if (chunksStr) {
    const total = parseInt(chunksStr, 10) || 0;
    let full = [];
    const chunkBases = Array.from({ length: total }, (_, i) => `${baseKey}_CHUNK_${i}`);
    const pairs = await tenantMultiGet(chunkBases);
    pairs.forEach(([, raw]) => {
      if (!raw) return;
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) full = full.concat(parsed);
      } catch {
        /* skip */
      }
    });
    return full;
  }
  const raw = await tenantGetItem(baseKey);
  if (!raw) return parseJson ? [] : null;
  if (!parseJson) return raw;
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    if (parsed && Array.isArray(parsed.data)) return parsed.data;
    if (parsed && Array.isArray(parsed.rules)) return parsed.rules;
    return [];
  } catch {
    return [];
  }
};

export const tenantWriteChunkedData = async (baseKey, rows = []) => {
  const payload = JSON.stringify(Array.isArray(rows) ? rows : []);
  const CHUNK = 320000;
  if (payload.length <= CHUNK) {
    await tenantSetItem(baseKey, payload);
    await tenantRemoveItem(`${baseKey}_CHUNKS`);
    return;
  }
  const total = Math.ceil(payload.length / CHUNK);
  await tenantSetItem(`${baseKey}_CHUNKS`, String(total));
  for (let i = 0; i < total; i += 1) {
    await tenantSetItem(`${baseKey}_CHUNK_${i}`, payload.slice(i * CHUNK, (i + 1) * CHUNK));
  }
};

/** docRaw / ghiRaw tương thích seed_luat_*.jsx */
export const tenantDocRaw = tenantGetItem;
export const tenantGhiRaw = tenantSetItem;

export const tenantMultiSet = async (pairs = []) => {
  await Promise.all(pairs.map(([baseKey, value]) => tenantSetItem(baseKey, value)));
};

export const tenantMultiRemove = async (baseKeys = []) => {
  await Promise.all(baseKeys.map((k) => tenantRemoveItem(k)));
};

export default {
  tenantGetItem,
  tenantSetItem,
  tenantRemoveItem,
  tenantMultiGet,
  tenantGetAllKeys,
  tenantFetchChunkedData,
  tenantWriteChunkedData,
  tenantDocRaw,
  tenantGhiRaw,
  tenantMultiSet,
  tenantMultiRemove,
};
