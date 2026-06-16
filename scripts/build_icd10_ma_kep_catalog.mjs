/**
 * Sinh ma_nguon/thanh_phan/icd10_ma_kep_bang.jsx từ DANH_MUC_ICD10 (dm_icd10_seed.jsx).
 * Mã † (dấu găm) và * (dấu sao) — hệ thống phân loại kép ICD-10.
 *
 * Chạy: npm run catalog:icd10-ma-kep
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const SEED_FILE = path.join(REPO_ROOT, 'ma_nguon', 'thanh_phan', 'dm_icd10_seed.jsx');
const OUT_FILE = path.join(REPO_ROOT, 'ma_nguon', 'thanh_phan', 'icd10_ma_kep_bang.jsx');

const normKey = (value) => String(value || '')
    .replace(/[\u2020\u2021\u2022†‡*]/g, '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9.]/g, '')
    .replace(/\./g, '');

const rxParenStar = /\(([A-TV-Z]\d{2}(?:\.[0-9A-Z]+)?)\*\)/gi;

const src = fs.readFileSync(SEED_FILE, 'utf8');
const match = src.match(/export const DANH_MUC_ICD10 = (\[[\s\S]*\]);/);
if (!match) {
    console.error('Không đọc được DANH_MUC_ICD10 từ', SEED_FILE);
    process.exit(1);
}

// eslint-disable-next-line no-eval
const DANH_MUC_ICD10 = eval(match[1]);

const maGam = new Set();
const maSao = new Set();
const maThuong = new Set();
const capGamSao = {};
const capSaoGam = {};

for (const row of DANH_MUC_ICD10) {
    const maGoc = String(row['MÃ BỆNH'] || '').trim();
    if (!maGoc) continue;
    const key = normKey(maGoc);
    if (!key) continue;

    if (maGoc.includes('†')) {
        maGam.add(key);
        const text = `${row['DISEASE NAME'] || ''} ${row['TÊN BỆNH'] || ''}`;
        const stars = [...text.matchAll(rxParenStar)]
            .map((m) => normKey(m[1]))
            .filter(Boolean);
        if (stars.length > 0) {
            capGamSao[key] = [...new Set(stars)];
            stars.forEach((starKey) => {
                if (!capSaoGam[starKey]) capSaoGam[starKey] = [];
                if (!capSaoGam[starKey].includes(key)) capSaoGam[starKey].push(key);
            });
        }
    } else if (maGoc.includes('*')) {
        maSao.add(key);
    } else {
        maThuong.add(key);
    }
}

const chiSao = [...maSao].filter((k) => !maThuong.has(k));

const header = `/**
 * Bảng mã kép ICD-10 († dấu găm / * dấu sao) — tự sinh, không sửa tay.
 * Nguồn: dm_icd10_seed.jsx (DANH_MUC_ICD10)
 * Chạy lại: npm run catalog:icd10-ma-kep
 */
export const PHIEN_BAN_ICD10_MA_KEP = ${JSON.stringify(`2026-06-16-icd10-ma-kep-${maGam.size}g-${maSao.size}s`)};

/** Khóa mã dấu găm (†) — bỏ dấu chấm (vd. A065 từ A06.5†). */
export const TAP_MA_GAM_ICD10 = new Set(${JSON.stringify([...maGam].sort())});

/** Khóa mã dấu sao (*) trong danh mục. */
export const TAP_MA_SAO_ICD10 = new Set(${JSON.stringify([...maSao].sort())});

/** Mã chỉ có bản * (không có bản thường cùng khóa) — ưu tiên coi là mã sao khi gặp trên hồ sơ. */
export const TAP_MA_SAO_DON_ICD10 = new Set(${JSON.stringify(chiSao.sort())});

/** Cặp † → [*] đã liệt kê trong tên bệnh danh mục (vd. A065 → J998). */
export const CAP_GAM_SANG_SAO_ICD10 = ${JSON.stringify(capGamSao, null, 0)};

/** Cặp * → [†] ngược (vd. J998 → [A065, …]). */
export const CAP_SAO_SANG_GAM_ICD10 = ${JSON.stringify(capSaoGam, null, 0)};
`;

fs.writeFileSync(OUT_FILE, `${header}\n`, 'utf8');
console.log('Đã ghi', OUT_FILE);
console.log('†', maGam.size, '*', maSao.size, 'cặp có tên', Object.keys(capGamSao).length, 'chỉ-*', chiSao.length);
