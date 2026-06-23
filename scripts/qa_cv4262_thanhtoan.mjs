#!/usr/bin/env node
/**
 * QA Công văn 4262/BHXH-CSYT — mirror logic giam_dinh_cv4262_bhyt (Node thuần).
 */
const CV4262_MA = {
    HUT_DOM: new Set(['01.0054.0114', '01.0055.0114', '02.0150.0114', '03.0091.0300', '03.0092.0299']),
    CT_NGUC_CQ: new Set(['18.0192.0041']),
    CT_BUNG_CQ: new Set(['18.0156.0041']),
    CT_NGUC_KCQ: new Set(['18.0157.0040']),
    CT_BUNG_KCQ: new Set(['18.0155.0040']),
    AMBU_CHUNG: new Set(['01.0065.0071']),
};
const PL01_05_PATTERN_CHA = [/PHẪU\s+THUẬT/i, /NỘI\s+SOI/i, /ĐẶT\s+NỘI\s+KHÍ\s+QUẢN/i];

const UPPER = (v) => String(v ?? '').trim().toUpperCase();
const normMa = (v) => UPPER(v).replace(/\s/g, '');
const TO_NUMBER = (v) => {
    const n = Number(String(v ?? '').replace(/,/g, '').trim());
    return Number.isFinite(n) ? n : 0;
};

const laDongBh = (row) => TO_NUMBER(row?.THANH_TIEN_BH ?? row?.T_BHTT) > 0;

const giamDinhMirror = (hoSo, dm = {}) => {
    const ds = [];
    const xml1 = hoSo?.XML1;
    const xml3 = hoSo?.XML3 || [];
    const xml2 = hoSo?.XML2 || [];
    const dmKham = new Set((dm.DM_KHAM || []).map((x) => normMa(x.MA_DICH_VU || x.MA || x)));
    const dongBh = xml3.map((row, index) => ({ row, index })).filter(({ row }) => laDongBh(row));

    const coChiDinhSan = dongBh.some(({ row }) => {
        const ten = UPPER(row.TEN_DICH_VU);
        return /CHẠY\s+THẬN|PHỤC\s+HỒI\s+CHỨC\s+NĂNG|CHÂM\s+CỨU/i.test(ten);
    });
    if (coChiDinhSan) {
        dongBh.forEach(({ row, index }) => {
            const ma = normMa(row.MA_DICH_VU);
            const ten = UPPER(row.TEN_DICH_VU);
            const laKham = dmKham.size ? dmKham.has(ma) : /KHÁM/i.test(ten);
            if (laKham) ds.push({ ma_luat: 'CV4262-01', index });
        });
    }

    const coCtNguc = dongBh.some(({ row }) => CV4262_MA.CT_NGUC_CQ.has(normMa(row.MA_DICH_VU)));
    const coCtBung = dongBh.some(({ row }) => CV4262_MA.CT_BUNG_CQ.has(normMa(row.MA_DICH_VU)));
    const coKcq = dongBh.some(({ row }) => {
        const ma = normMa(row.MA_DICH_VU);
        return CV4262_MA.CT_NGUC_KCQ.has(ma) || CV4262_MA.CT_BUNG_KCQ.has(ma);
    });
    const soCq = xml2.filter((r) => /CẢN\s*QUANG/i.test(UPPER(r.TEN_THUOC))).length;
    if (coCtNguc && coCtBung && !coKcq && soCq <= 1) ds.push({ ma_luat: 'CV4262-21' });

    dongBh.forEach(({ row, index }) => {
        if (CV4262_MA.AMBU_CHUNG.has(normMa(row.MA_DICH_VU)) && (Number(xml1?.TUOI) || 99) > 0) {
            ds.push({ ma_luat: 'CV4262-23', index });
        }
    });

    const coPt = dongBh.some(({ row }) => PL01_05_PATTERN_CHA.some((re) => re.test(UPPER(row.TEN_DICH_VU))));
    const coHut = dongBh.some(({ row }) => CV4262_MA.HUT_DOM.has(normMa(row.MA_DICH_VU)));
    if (coPt && coHut) ds.push({ ma_luat: 'CV4262-PL01-05' });

    return ds;
};

const assertIncludes = (label, arr, code) => {
    const ok = arr.some((x) => x.ma_luat === code);
    if (!ok) {
        console.error(`FAIL ${label}: expected ${code}`);
        process.exitCode = 1;
    } else {
        console.log(`OK ${label}`);
    }
};

const assertEmpty = (label, arr, code) => {
    const ok = !arr.some((x) => x.ma_luat === code);
    if (!ok) {
        console.error(`FAIL ${label}: unexpected ${code}`);
        process.exitCode = 1;
    } else {
        console.log(`OK ${label}`);
    }
};

const dm = {
    DM_KHAM: [{ MA_DICH_VU: '13.01' }],
};

assertIncludes(
    'CV4262-01 khi chạy thận + công khám',
    giamDinhMirror({
        XML1: { TUOI: 45 },
        XML3: [
            { MA_DICH_VU: '03.0180.0150', TEN_DICH_VU: 'Chạy thận nhân tạo chu kỳ', THANH_TIEN_BH: 500000 },
            { MA_DICH_VU: '13.01', TEN_DICH_VU: 'Công khám', THANH_TIEN_BH: 50000 },
        ],
    }, dm),
    'CV4262-01',
);

assertIncludes(
    'CV4262-21 CT ngực+bụng CQ thiếu KCQ',
    giamDinhMirror({
        XML1: {},
        XML2: [{ TEN_THUOC: 'Thuốc cản quang' }],
        XML3: [
            { MA_DICH_VU: '18.0192.0041', TEN_DICH_VU: 'CT ngực có CQ', THANH_TIEN_BH: 800000 },
            { MA_DICH_VU: '18.0156.0041', TEN_DICH_VU: 'CT bụng có CQ', THANH_TIEN_BH: 800000 },
        ],
    }),
    'CV4262-21',
);

assertIncludes(
    'CV4262-PL01-05 PT + hút đờm',
    giamDinhMirror({
        XML1: {},
        XML3: [
            { MA_DICH_VU: '10.0001.0001', TEN_DICH_VU: 'Phẫu thuật nội soi', THANH_TIEN_BH: 2000000 },
            { MA_DICH_VU: '01.0054.0114', TEN_DICH_VU: 'Hút đờm', THANH_TIEN_BH: 100000 },
        ],
    }),
    'CV4262-PL01-05',
);

assertEmpty(
    'Không cảnh báo CT khi đã có mã không CQ',
    giamDinhMirror({
        XML1: {},
        XML2: [{ TEN_THUOC: 'Thuốc cản quang' }],
        XML3: [
            { MA_DICH_VU: '18.0192.0041', THANH_TIEN_BH: 800000 },
            { MA_DICH_VU: '18.0156.0041', THANH_TIEN_BH: 800000 },
            { MA_DICH_VU: '18.0157.0040', THANH_TIEN_BH: 600000 },
            { MA_DICH_VU: '18.0155.0040', THANH_TIEN_BH: 600000 },
        ],
    }),
    'CV4262-21',
);

console.log('CV4262_PL01 rules mirrored: PL01-05 (PT/NS + Hút đờm)');
if (!process.exitCode) console.log('qa:cv4262-thanhtoan — tất cả kiểm tra OK');
