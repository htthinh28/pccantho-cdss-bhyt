/**
 * Giám định thanh toán theo Công văn 4262/BHXH-CSYT (28/10/2016).
 * Bổ sung kiểm tra built-in: công khám/DVKT/giường, loại trừ đồng thời PL01, CT cản quang, Ambu, TMH.
 */

import {
    CV4262_CT_CAP_CQ,
    CV4262_DVKT_CHI_DINH_SAN,
    CV4262_MA,
    CV4262_PHU_LUC_01_LOAI_TRU,
} from './du_lieu_cv4262_phu_luc_01';

const CO_SO_PHAP_LY_CV4262 = 'Công văn 4262/BHXH-CSYT (BHXH VN, 28/10/2016) — thanh toán chi phí KCB BHYT';

const UPPER = (v) => String(v ?? '').trim().toUpperCase();
const normMa = (v) => UPPER(v).replace(/\s/g, '');

const TO_NUMBER = (v) => {
    if (v === null || v === undefined || v === '') return 0;
    const n = Number(String(v).replace(/,/g, '').trim());
    return Number.isFinite(n) ? n : 0;
};

const laDongBhThanhToan = (row) => {
    const tien = TO_NUMBER(row?.THANH_TIEN_BH ?? row?.T_BHTT ?? row?.THANH_TIEN ?? row?.T_BHTT_BV);
    if (tien <= 0) return false;
    const tyLe = TO_NUMBER(row?.TY_LE_TT_BH ?? row?.TY_LE_TT ?? 100);
    return tyLe > 0;
};

const layMaDv = (row) => normMa(row?.MA_DICH_VU || row?.MA_DV || '');
const layTenDv = (row) => UPPER(row?.TEN_DICH_VU || row?.TEN_DVKT || row?.TEN_DVKT_GIA || '');

const khopMa = (ma, tap) => tap instanceof Set ? tap.has(ma) : (Array.isArray(tap) ? tap.includes(ma) : false);
const khopPattern = (ten, patterns = []) => patterns.some((re) => re.test(ten));

const dongKhopQuyTac = (row, maTap, patternTap) => {
    const ma = layMaDv(row);
    const ten = layTenDv(row);
    if (ma && khopMa(ma, maTap)) return true;
    return khopPattern(ten, patternTap);
};

const taoTapDanhMucTuMang = (arr) => {
    const s = new Set();
    if (!Array.isArray(arr)) return s;
    arr.forEach((item) => {
        const ma = normMa(item?.MA_DICH_VU || item?.MA || item?.ma || item);
        if (ma) s.add(ma);
    });
    return s;
};

const demThuocCanQuangXml2 = (xml2 = []) => {
    let n = 0;
    (Array.isArray(xml2) ? xml2 : []).forEach((row) => {
        if (!laDongBhThanhToan(row)) return;
        const ten = UPPER(row?.TEN_THUOC || row?.TEN_HOAT_CHAT || '');
        if (/CẢN\s*QUANG|CONTRAST|IỐT/i.test(ten)) n += 1;
    });
    return n;
};

const tinhTuoiNgay = (xml1) => {
    const tuoi = TO_NUMBER(xml1?.TUOI);
    if (tuoi > 0 && tuoi < 120) return tuoi * 365;
    const ngaySinh = String(xml1?.NGAY_SINH || '').replace(/\D/g, '').slice(0, 8);
    const ngayVao = String(xml1?.NGAY_VAO || '').replace(/\D/g, '').slice(0, 8);
    if (ngaySinh.length === 8 && ngayVao.length === 8) {
        const d = Number(ngayVao) - Number(ngaySinh);
        return d > 0 ? d : 0;
    }
    return tuoi;
};

export const giamDinhCv4262Bhyt = (hoSo, dm = {}) => {
    const ds = [];
    const xml1 = hoSo?.XML1 || hoSo?.xml1 || null;
    const rawXml3 = Array.isArray(hoSo?.XML3) ? hoSo.XML3 : (Array.isArray(hoSo?.xml3) ? hoSo.xml3 : []);
    const rawXml2 = Array.isArray(hoSo?.XML2) ? hoSo.XML2 : (Array.isArray(hoSo?.xml2) ? hoSo.xml2 : []);
    if (!xml1 || rawXml3.length === 0) return ds;

    const dmKham = taoTapDanhMucTuMang(dm?.DM_KHAM);
    const dongBh = rawXml3
        .map((row, index) => ({ row, index }))
        .filter(({ row }) => laDongBhThanhToan(row));

    const addLoi = (payload) => ds.push({
        phan_he: payload.phan_he || 'XML3',
        index: payload.index ?? -1,
        truong_loi: payload.truong_loi || 'MA_DICH_VU',
        canh_bao: payload.canh_bao,
        muc_do: payload.muc_do || 'Warning',
        ma_luat: payload.ma_luat,
        ten_quy_tac: payload.ten_quy_tac,
        dieu_kien: 'BUILT-IN',
        co_so_phap_ly: CO_SO_PHAP_LY_CV4262,
    });

    // §1.1 — DVKT chỉ định sẵn/chu kỳ: không thanh toán thêm công khám
    const coDvktChiDinhSan = dongBh.some(({ row }) => {
        const ma = layMaDv(row);
        const ten = layTenDv(row);
        return khopMa(ma, CV4262_DVKT_CHI_DINH_SAN.ma)
            || khopPattern(ten, CV4262_DVKT_CHI_DINH_SAN.pattern_ten);
    });
    if (coDvktChiDinhSan) {
        dongBh.forEach(({ row, index }) => {
            const ma = layMaDv(row);
            const ten = layTenDv(row);
            const laCongKham = dmKham.size > 0
                ? dmKham.has(ma)
                : /CÔNG\s+KHÁM|KHÁM\s+BỆNH|^KHÁM\s/i.test(ten);
            if (!laCongKham) return;
            addLoi({
                index,
                ma_luat: 'CV4262-01',
                ten_quy_tac: 'DVKT chỉ định sẵn — không công khám (§1.1)',
                canh_bao: `⛔ [CV4262 §1.1]: BN đến thực hiện DVKT đã chỉ định/chu kỳ (chạy thận, PHCN, châm cứu…). Chỉ thanh toán DVKT, không thanh toán tiền khám [${ma}].`,
                muc_do: 'Critical',
            });
        });
    }

    // §1.2 — Nhiều công khám cùng chuyên khoa (heuristic: cùng MA_KHOA) trong một lượt
    const congKhamTheoKhoa = new Map();
    dongBh.forEach(({ row, index }) => {
        const ma = layMaDv(row);
        const ten = layTenDv(row);
        const laCongKham = dmKham.size > 0
            ? dmKham.has(ma)
            : /CÔNG\s+KHÁM|KHÁM\s+BỆNH|^KHÁM\s/i.test(ten);
        if (!laCongKham) return;
        const khoa = UPPER(row?.MA_KHOA || xml1?.MA_KHOA || 'CHUNG');
        if (!congKhamTheoKhoa.has(khoa)) congKhamTheoKhoa.set(khoa, []);
        congKhamTheoKhoa.get(khoa).push({ ma, index, ten });
    });
    for (const [khoa, items] of congKhamTheoKhoa.entries()) {
        if (items.length < 2) continue;
        const maKhacNhau = new Set(items.map((x) => x.ma));
        if (maKhacNhau.size < 2) continue;
        items.slice(1).forEach((item) => {
            addLoi({
                index: item.index,
                ma_luat: 'CV4262-02',
                ten_quy_tac: 'Một chuyên khoa — một công khám/lượt (§1.2)',
                canh_bao: `⛔ [CV4262 §1.2]: BN khám nhiều phòng/bàn cùng chuyên khoa (MA_KHOA=${khoa}) trong một lượt — chỉ thanh toán 01 lần công khám. Rà soát dòng [${item.ma}].`,
                muc_do: 'Warning',
            });
        });
    }

    // §2.1 — CT ngực + bụng có cản quang: kiểm tra tổ hợp có/không cản quang
    const coCtNgucCq = dongBh.some(({ row }) => khopMa(layMaDv(row), new Set(CV4262_CT_CAP_CQ.nguc_cq)));
    const coCtBungCq = dongBh.some(({ row }) => khopMa(layMaDv(row), new Set(CV4262_CT_CAP_CQ.bung_cq)));
    if (coCtNgucCq && coCtBungCq) {
        const coKcq = dongBh.some(({ row }) => {
            const ma = layMaDv(row);
            return khopMa(ma, new Set([...CV4262_CT_CAP_CQ.nguc_kcq, ...CV4262_CT_CAP_CQ.bung_kcq]));
        });
        const soOngCq = demThuocCanQuangXml2(rawXml2);
        if (!coKcq && soOngCq <= 1) {
            dongBh.forEach(({ row, index }) => {
                const ma = layMaDv(row);
                if (!khopMa(ma, new Set([...CV4262_CT_CAP_CQ.nguc_cq, ...CV4262_CT_CAP_CQ.bung_cq]))) return;
                addLoi({
                    index,
                    ma_luat: 'CV4262-21',
                    ten_quy_tac: 'CT 2 vị trí + 1 ống cản quang (§2.1)',
                    canh_bao: `⚠️ [CV4262 §2.1]: Chụp CT ngực + bụng có cản quang cùng lúc với 01 ống thuốc — thanh toán 01 lần có CQ + 01 lần không CQ. Thiếu dòng CT không cản quang hoặc chưa phản ánh đúng tổ hợp [${ma}].`,
                });
            });
        }
        if (soOngCq >= 2 && !coKcq) {
            addLoi({
                index: -1,
                ma_luat: 'CV4262-21b',
                ten_quy_tac: 'CT 2 vị trí + 2 ống cản quang (§2.1)',
                canh_bao: `⚠️ [CV4262 §2.1]: Phát hiện ≥2 thuốc cản quang (XML2) khi chụp CT ngực + bụng — thanh toán 02 lần theo mức giá có cản quang; rà soát không lẫn mã không cản quang.`,
                truong_loi: 'T_BHTT',
            });
        }
    }

    // §2.3 — Bóp bóng Ambu: chỉ hồi sức sơ sinh sau đẻ
    dongBh.forEach(({ row, index }) => {
        const ma = layMaDv(row);
        if (!khopMa(ma, CV4262_MA.AMBU_CHUNG)) return;
        const tuoiNgay = tinhTuoiNgay(xml1);
        const laSoSinh = tuoiNgay > 0 && tuoiNgay <= 28;
        const coAmbuSs = dongBh.some(({ row: r2 }) => khopMa(layMaDv(r2), CV4262_MA.AMBU_SO_SINH));
        if (!laSoSinh && !coAmbuSs) {
            addLoi({
                index,
                ma_luat: 'CV4262-23',
                ten_quy_tac: 'Bóp bóng Ambu — chỉ hồi sức sơ sinh (§2.3)',
                canh_bao: `⛔ [CV4262 §2.3]: DVKT Bóp bóng Ambu [${ma}] chỉ thanh toán trong hồi sức sơ sinh sau đẻ. BN không thuộc nhóm sơ sinh (≤28 ngày) — kiểm tra mã [13.0200.0071] hoặc quy trình HSCC.`,
                muc_do: 'Critical',
            });
        }
    });

    // §2.5 — Nội soi TMH: thanh toán gói 3 bộ phận; không gộp mã đơn lẻ
    const coNsTmhDayDu = dongBh.some(({ row }) => khopMa(layMaDv(row), new Set([...CV4262_MA.NS_TMH_DAY_DU])));
    const dsNsDon = dongBh.filter(({ row }) => khopMa(layMaDv(row), new Set([...CV4262_MA.NS_TMH_DON])));
    if (coNsTmhDayDu && dsNsDon.length > 0) {
        dsNsDon.forEach(({ row, index }) => {
            addLoi({
                index,
                ma_luat: 'CV4262-25',
                ten_quy_tac: 'Nội soi TMH — không trùng mã đơn + gói (§2.5)',
                canh_bao: `⛔ [CV4262 §2.5]: Đã có Nội soi Tai Mũi Họng (cả 3 bộ phận) — không thanh toán thêm mã nội soi đơn lẻ [${layMaDv(row)}].`,
                muc_do: 'Critical',
            });
        });
    } else if (dsNsDon.length >= 2) {
        dsNsDon.slice(1).forEach(({ row, index }) => {
            addLoi({
                index,
                ma_luat: 'CV4262-25b',
                ten_quy_tac: 'Nội soi TMH đơn lẻ — không gộp nhiều mã (§2.5)',
                canh_bao: `⚠️ [CV4262 §2.5]: Nhiều mã nội soi Tai/Mũi/Họng đơn lẻ [${layMaDv(row)}] — chỉ thanh toán gói TMH đủ 3 bộ phận hoặc mức giá phê duyệt trước 01/01/2015 cho từng bộ phận.`,
            });
        });
    }

    // §2.4 — Phụ lục 01: không thanh toán đồng thời
    const seenPl01 = new Set();
    CV4262_PHU_LUC_01_LOAI_TRU.forEach((quyTac) => {
        const cha = dongBh.filter(({ row }) => dongKhopQuyTac(row, quyTac.ma_cha, quyTac.pattern_cha));
        const loai = dongBh.filter(({ row }) => dongKhopQuyTac(row, quyTac.ma_loai_tru, quyTac.pattern_loai_tru));
        if (cha.length === 0 || loai.length === 0) return;
        loai.forEach(({ row, index }) => {
            const key = `${quyTac.id}|${index}`;
            if (seenPl01.has(key)) return;
            seenPl01.add(key);
            const maCha = cha.map((c) => layMaDv(c.row)).filter(Boolean).join(', ');
            addLoi({
                index,
                ma_luat: `CV4262-${quyTac.id}`,
                ten_quy_tac: `PL01 không TT đồng thời (${quyTac.id})`,
                canh_bao: `⛔ [CV4262 ${quyTac.dieu}]: ${quyTac.mo_ta}. Đã có DVKT [${maCha || 'theo tên'}] — không thanh toán đồng thời [${layMaDv(row)}].`,
                muc_do: 'Critical',
            });
        });
    });

    return ds;
};
