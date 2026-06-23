#!/usr/bin/env node
/**
 * QA ngưỡng LCS CV 302 (01/7/2026) — logic mirror muc_luong_co_so_bhyt.jsx
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const LCS_CU = 2340000;
const LCS_MOI = 2530000;
const MOC = '20260701';

const layLcs = (ngay) => (String(ngay).slice(0, 8) >= MOC ? LCS_MOI : LCS_CU);
const nguong15 = (ngay) => Math.round(0.15 * layLcs(ngay));
const nguong6 = (ngay) => 6 * layLcs(ngay);
const nguong45 = (ngay) => 45 * layLcs(ngay);

const laDuoi15 = (ngay, tt) => tt > 0 && tt < nguong15(ngay);

const tinhCctConLai = (luyKe, namYmd) => {
    const nam = String(namYmd).slice(0, 4);
    if (nam === '2026') {
        const luyKeQuyDoi = (luyKe / LCS_CU) * LCS_MOI;
        return Math.max(0, 6 * LCS_MOI - luyKeQuyDoi);
    }
    return Math.max(0, nguong6(namYmd) - luyKe);
};

const assertEq = (label, actual, expected) => {
    if (actual !== expected) {
        console.error(`FAIL ${label}: got ${actual}, want ${expected}`);
        process.exitCode = 1;
        return false;
    }
    console.log(`OK ${label}`);
    return true;
};

assertEq('LCS trước 01/7/2026', layLcs('20260630'), LCS_CU);
assertEq('LCS từ 01/7/2026', layLcs(MOC), LCS_MOI);
assertEq('15% LCS mới', nguong15(MOC), 379500);
assertEq('15% LCS cũ', nguong15('20260101'), 351000);
assertEq('6× LCS mới', nguong6(MOC), 15180000);
assertEq('45× LCS mới', nguong45(MOC), 113850000);
assertEq('miễn CCT < 379.500', laDuoi15('20260715', 300000), true);
assertEq('không miễn CCT >= 379.500', laDuoi15('20260715', 400000), false);

const nguongConLai = Math.round(tinhCctConLai(3510000, '20260701'));
assertEq('CCT còn lại sau quy đổi LCS (mẫu 1,5×LCS cũ)', nguongConLai, 11385000);

/** Mirror giamDinhCv302Bhyt — không import .jsx trong Node thuần. */
const giamDinhCv302Mirror = (hoSo, dm = {}) => {
    const xml1 = hoSo?.XML1;
    if (!xml1) return [];
    const ngay = String(xml1.NGAY_VAO || '').slice(0, 8);
    if (!ngay || ngay < MOC) return [];
    const ds = [];
    const tt = Number(xml1.T_TONGCHI_BH) || 0;
    const bncct = Number(xml1.T_BNCCT) || 0;
    const maLoai = String(xml1.MA_LOAI_KCB || '').trim();
    if (laDuoi15(ngay, tt) && bncct > 0 && maLoai !== '1' && maLoai !== '01') {
        ds.push('HC-302a');
    }
    const luyKe = Number(xml1.T_BNCCT_LUY_KE) || 0;
    if (
        String(xml1.MA_DK_BD || '').trim() === '1'
        && luyKe > nguong6(ngay)
        && bncct > 0
        && !xml1.NGAY_MIEN_CCT
    ) {
        ds.push('HC-302b');
    }
    const xml3 = hoSo.XML3 || [];
    const tran45 = nguong45(ngay);
    const theoMa = new Map();
    xml3.forEach((r) => {
        const ma = String(r.MA_DICH_VU || '').trim();
        const tien = Number(r.THANH_TIEN_BH) || 0;
        if (ma && tien > 0) theoMa.set(ma, (theoMa.get(ma) || 0) + tien);
    });
    for (const tong of theoMa.values()) {
        if (tong > tran45 * 1.001) {
            ds.push('HC-302d');
            break;
        }
    }
    const cskcb = dm.CSKCB || {};
    if (
        String(cskcb.HOP_DONG_BHYT || '').toUpperCase() === 'KHONG'
        && String(cskcb.CAP_CHUYEN_MON || '').toUpperCase() === 'BAN_DAU'
        && maLoai === '1'
        && (Number(xml1.T_BHTT) || 0) > nguong15(ngay) * 1.05
    ) {
        ds.push('HC-302e');
    }
    return ds;
};

const assertIncludes = (label, arr, code) => {
    const ok = arr.includes(code);
    if (!ok) {
        console.error(`FAIL ${label}: expected ${code} in [${arr.join(', ')}]`);
        process.exitCode = 1;
    } else {
        console.log(`OK ${label}`);
    }
};

const assertEmpty = (label, arr) => {
    if (arr.length !== 0) {
        console.error(`FAIL ${label}: expected [], got [${arr.join(', ')}]`);
        process.exitCode = 1;
    } else {
        console.log(`OK ${label}`);
    }
};

assertIncludes(
    'built-in HC-302a khi BNCCT > 0 và chi phí < 15% LCS',
    giamDinhCv302Mirror({
        XML1: { NGAY_VAO: '202607101200', T_TONGCHI_BH: 200000, T_BNCCT: 50000, MA_LOAI_KCB: '3' },
    }),
    'HC-302a',
);
assertIncludes(
    'built-in HC-302b khi lũy kế > 6×LCS',
    giamDinhCv302Mirror({
        XML1: {
            NGAY_VAO: '202607101200',
            MA_DK_BD: '1',
            T_BNCCT_LUY_KE: 16000000,
            T_BNCCT: 100000,
            T_TONGCHI_BH: 500000,
            T_BHTT: 400000,
        },
    }),
    'HC-302b',
);
assertEmpty(
    'built-in bỏ qua hồ sơ trước 01/7/2026',
    giamDinhCv302Mirror({
        XML1: { NGAY_VAO: '202606301200', T_TONGCHI_BH: 200000, T_BNCCT: 50000, MA_LOAI_KCB: '3' },
    }),
);
assertIncludes(
    'built-in HC-302d khi TBYT vượt 45×LCS',
    giamDinhCv302Mirror({
        XML1: { NGAY_VAO: '202607101200', T_TONGCHI_BH: 120000000 },
        XML3: [{ MA_DICH_VU: 'VT.001', THANH_TIEN_BH: 120000000 }],
    }),
    'HC-302d',
);

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const hcSeed = fs.readFileSync(path.join(root, 'ma_nguon/tien_ich/du_lieu_luat_hanh_chinh_muc2.jsx'), 'utf8');
const pl10 = fs.readFileSync(path.join(root, 'ma_nguon/danh_muc_byt/10_ma_doi_tuong_kham/du_lieu_pl10_doi_tuong.jsx'), 'utf8');

if (!hcSeed.includes("PHIEN_BAN_SEED_LUAT_HANH_CHINH_MUC2 = '2026-06-11_cv302_lcs_2530000'")) {
    console.error('FAIL seed HC phiên bản CV302');
    process.exitCode = 1;
} else {
    console.log('OK seed HC phiên bản CV302');
}
if (!hcSeed.includes('"MA_LUAT": "HC_302"')) {
    console.error('FAIL seed thiếu HC_302');
    process.exitCode = 1;
} else {
    console.log('OK seed có HC_302');
}
if (pl10.includes('"MÃ ĐỐI TƯỢNG": "",\n    "TÊN ĐỐI TƯỢNG": "",\n    "MỨC HƯỞNG (%)": 0.5')) {
    console.error('FAIL PL10 còn dòng orphan 1.13');
    process.exitCode = 1;
} else {
    console.log('OK PL10 không còn orphan 1.13');
}

if (process.exitCode) {
    console.error('QA CV302 LCS: FAILED');
    process.exit(1);
}
console.log('QA CV302 LCS: all passed');
