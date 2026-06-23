/**
 * Giám định hệ thống mã kép ICD-10: mã dấu găm (†) và mã dấu sao (*).
 * Quy định mã hóa bệnh tật ICD-10 — phân loại kép.
 */
import {
    CAP_GAM_SANG_SAO_ICD10,
    CAP_SAO_SANG_GAM_ICD10,
    PHIEN_BAN_ICD10_MA_KEP,
    TAP_MA_GAM_ICD10,
    TAP_MA_SAO_DON_ICD10,
    TAP_MA_SAO_ICD10,
} from '../thanh_phan/icd10_ma_kep_bang';

const ICD_RAW_TOKEN = /[A-TV-Z]\d{2}(?:\.[0-9A-Z]{1,2})?(?:[†*])?/gi;

const normKey = (value) => String(value || '')
    .replace(/[\u2020\u2021\u2022†‡*]/g, '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9.]/g, '')
    .replace(/\./g, '');

const hienThiMa = (token) => String(token?.raw || token?.key || '').trim();

const phanLoaiToken = (raw) => {
    const text = String(raw || '').trim();
    const key = normKey(text);
    if (!key) return null;
    const laSao = text.includes('*') || TAP_MA_SAO_DON_ICD10.has(key);
    const laGam = (text.includes('†') || TAP_MA_GAM_ICD10.has(key)) && !laSao;
    return {
        raw: text,
        key,
        laGam,
        laSao,
    };
};

/** Tách token ICD giữ thứ tự và dấu †/*. */
export const tachTokenIcdCoThuTu = (value) => {
    const raw = String(value || '');
    const out = [];
    let rx;
    const re = new RegExp(ICD_RAW_TOKEN.source, 'gi');
    while ((rx = re.exec(raw)) !== null) {
        const token = phanLoaiToken(rx[0]);
        if (token) out.push(token);
    }
    if (out.length > 0) return out;

    return raw.split(/[;|,]+/)
        .map((part) => phanLoaiToken(part.trim()))
        .filter(Boolean);
};

const ghepTatCaMaTrenHoSo = (xml1) => {
    const chinh = tachTokenIcdCoThuTu(xml1?.MA_BENH_CHINH || xml1?.MA_BENH || '');
    const kem = tachTokenIcdCoThuTu(xml1?.MA_BENH_KT || xml1?.MA_BENHKEM || xml1?.MA_BENHKT || '');
    const yhct = tachTokenIcdCoThuTu(xml1?.MA_BENH_YHCT || '');
    return { chinh, kem, yhct };
};

const coCapKhop = (gamKey, saoKey) => {
    const stars = CAP_GAM_SANG_SAO_ICD10[gamKey];
    if (Array.isArray(stars) && stars.length > 0) return stars.includes(saoKey);
    const daggers = CAP_SAO_SANG_GAM_ICD10[saoKey];
    if (Array.isArray(daggers) && daggers.length > 0) return daggers.includes(gamKey);
    return true;
};

const timTokenLoi = (payload) => ({
    phan_he: 'XML1',
    index: -1,
    truong_loi: payload.truong_loi || 'MA_BENH_CHINH',
    canh_bao: payload.canh_bao,
    muc_do: payload.muc_do || 'Error',
    ma_luat: payload.ma_luat,
    ten_quy_tac: payload.ten_quy_tac,
    dieu_kien: 'BUILT-IN',
});

/**
 * @returns {Array} danh sách cảnh báo vi phạm mã kép ICD-10
 */
export const giamDinhIcd10MaKep = (hoSo) => {
    const xml1 = hoSo?.xml1 || hoSo?.XML1 || hoSo;
    if (!xml1 || typeof xml1 !== 'object') return [];

    const ds = [];
    const phienBan = String(PHIEN_BAN_ICD10_MA_KEP || '').trim();
    const ghiPhu = phienBan ? ` (${phienBan})` : '';
    const { chinh, kem, yhct } = ghepTatCaMaTrenHoSo(xml1);

    const gamChinh = chinh.filter((t) => t.laGam);
    const saoChinh = chinh.filter((t) => t.laSao);
    const saoKem = kem.filter((t) => t.laSao);
    const gamKem = kem.filter((t) => t.laGam);
    const saoYhct = yhct.filter((t) => t.laSao);
    const gamYhct = yhct.filter((t) => t.laGam);

    // Mã * tuyệt đối không làm bệnh chính, không ghi đứng một mình.
    saoChinh.forEach((token) => {
        ds.push(timTokenLoi({
            truong_loi: 'MA_BENH_CHINH',
            ma_luat: 'ICD-KEP-SAO-CHINH',
            ten_quy_tac: 'ICD-10 mã kép — mã dấu sao (*) không được làm bệnh chính',
            canh_bao: `Mã ICD-10 dấu sao [${hienThiMa(token)}] không được dùng làm bệnh chính (MA_BENH_CHINH). Theo quy định mã kép ICD-10, mã * chỉ ghi ở bệnh kèm theo${ghiPhu}.`,
        }));
    });

    const coGamHoSo = [...gamChinh, ...gamKem, ...gamYhct];
    const coSaoHoSo = [...saoChinh, ...saoKem, ...saoYhct];

    // Mã * không được ghi đứng một mình (thiếu mã † tương ứng).
    if (coSaoHoSo.length > 0 && coGamHoSo.length === 0) {
        const dsSao = [...new Set(coSaoHoSo.map(hienThiMa))].join(', ');
        ds.push(timTokenLoi({
            truong_loi: 'MA_BENH_KT',
            ma_luat: 'ICD-KEP-SAO-DON',
            ten_quy_tac: 'ICD-10 mã kép — mã dấu sao (*) phải đi kèm mã dấu găm (†)',
            canh_bao: `Mã ICD-10 dấu sao [${dsSao}] không được ghi đứng một mình — bắt buộc có mã dấu găm (†) tương ứng trên hồ sơ${ghiPhu}.`,
        }));
    }

    // Mã † trên bệnh chính phải có mã * kèm theo.
    gamChinh.forEach((gam) => {
        if (saoKem.length === 0 && saoYhct.length === 0) {
            ds.push(timTokenLoi({
                truong_loi: 'MA_BENH_CHINH',
                ma_luat: 'ICD-KEP-GAM-THIEU-SAO',
                ten_quy_tac: 'ICD-10 mã kép — mã dấu găm (†) thiếu mã dấu sao (*)',
                canh_bao: `Mã ICD-10 dấu găm [${hienThiMa(gam)}] ở bệnh chính bắt buộc phải có mã dấu sao (*) tương ứng trong MA_BENH_KT (hoặc MA_BENH_YHCT)${ghiPhu}.`,
            }));
            return;
        }
        const stars = CAP_GAM_SANG_SAO_ICD10[gam.key];
        if (!Array.isArray(stars) || stars.length === 0) return;
        const coSaoPhuHop = saoKem.some((s) => stars.includes(s.key))
            || saoYhct.some((s) => stars.includes(s.key));
        if (!coSaoPhuHop) {
            const goiY = stars.join(', ');
            ds.push(timTokenLoi({
                truong_loi: 'MA_BENH_KT',
                ma_luat: 'ICD-KEP-GAM-SAO-LECH',
                ten_quy_tac: 'ICD-10 mã kép — cặp †/* không khớp danh mục',
                canh_bao: `Mã dấu găm [${hienThiMa(gam)}] cần mã dấu sao tương ứng (vd. ${goiY}) trong bệnh kèm theo${ghiPhu}.`,
            }));
        }
    });

    // Mã * trên bệnh kèm phải có mã † chính tương ứng.
    saoKem.forEach((sao) => {
        if (gamChinh.length === 0) return;
        const daggers = CAP_SAO_SANG_GAM_ICD10[sao.key];
        if (!Array.isArray(daggers) || daggers.length === 0) return;
        const coGamPhuHop = gamChinh.some((g) => daggers.includes(g.key) && coCapKhop(g.key, sao.key));
        if (!coGamPhuHop) {
            const goiY = daggers.join(', ');
            ds.push(timTokenLoi({
                truong_loi: 'MA_BENH_KT',
                ma_luat: 'ICD-KEP-SAO-GAM-LECH',
                ten_quy_tac: 'ICD-10 mã kép — mã dấu sao (*) không khớp mã dấu găm (†) chính',
                canh_bao: `Mã dấu sao [${hienThiMa(sao)}] cần mã dấu găm tương ứng (vd. ${goiY}) ở MA_BENH_CHINH${ghiPhu}.`,
            }));
        }
    });

    // Mã * phải đứng đầu dãy MA_BENH_KT khi có trong dãy kèm theo.
    if (saoKem.length > 0 && kem.length > 0) {
        const tokenDau = kem[0];
        if (!tokenDau.laSao) {
            const dsSao = saoKem.map(hienThiMa).join(', ');
            ds.push(timTokenLoi({
                truong_loi: 'MA_BENH_KT',
                ma_luat: 'ICD-KEP-SAO-VI-TRI',
                ten_quy_tac: 'ICD-10 mã kép — mã dấu sao (*) phải đứng đầu MA_BENH_KT',
                muc_do: 'Error',
                canh_bao: `Khi MA_BENH_KT có mã dấu sao [${dsSao}], mã * bắt buộc phải đứng vị trí đầu tiên trong dãy bệnh kèm theo${ghiPhu}.`,
            }));
        }
    }

    // YHCT: mã † đứng trước, mã * đứng sau (vị trí 1 và 2) khi cùng có trên dãy.
    if (gamYhct.length > 0 && saoYhct.length > 0 && yhct.length >= 2) {
        const viTriGam = yhct.findIndex((t) => t.laGam);
        const viTriSao = yhct.findIndex((t) => t.laSao);
        if (viTriGam >= 0 && viTriSao >= 0 && (viTriGam > viTriSao || viTriGam > 0 || viTriSao !== viTriGam + 1)) {
            ds.push(timTokenLoi({
                truong_loi: 'MA_BENH_YHCT',
                ma_luat: 'ICD-KEP-YHCT-THU-TU',
                ten_quy_tac: 'ICD-10 mã kép — thứ tự †/* trên MA_BENH_YHCT',
                muc_do: 'Warning',
                canh_bao: `Hồ sơ Y học cổ truyền: mã dấu găm (†) phải đứng vị trí đầu, mã dấu sao (*) đứng vị trí thứ hai trong MA_BENH_YHCT${ghiPhu}.`,
            }));
        }
    }

    return ds;
};
