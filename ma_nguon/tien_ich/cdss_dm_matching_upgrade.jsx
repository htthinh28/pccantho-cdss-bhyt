/**
 * NÂNG CẤP TÁCH BIỆT — CDSS: khớp ICD (mapping nội bộ) với danh mục thuốc / DVKT BV.
 * - Không sửa luồng rule cũ; chỉ được gọi từ chayGiamDinhToanDienV15 sau Layer 5.
 * - Mặc định không phát cảnh báo nếu: không có dòng mapping, hoặc quy tắc OFF (ON/OFF nội bộ).
 * - Mã luật: CDSS_DM_UPGRADE_01 (thiếu thuốc gợi ý), CDSS_DM_UPGRADE_02 (thiếu DVKT gợi ý) — mặc định OFF trong quy_tac_on_off_noi_bo.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { chuanHoaMaIcdPhacDoCdss } from '../chuyen_mon/phac_do_benh_vien/phac_do_cdss_columns';
import seedDefault from '../chuyen_mon/phac_do_benh_vien/cdss_icd_dm_goi_y_upgrade.seed.json';

const KEY_DATA = 'CDSS_DATA_ICD_DM_GOI_Y_V1';

const ICD_RG_PHAC = /[A-TV-Z]\d{2}(?:\.[0-9A-Z]{1,2})?/g;

/** Gom ICD chính/kèm — cùng logic khái niệm với engine phác đồ CDSS. */
const layMaIcdGopChinhVaKemKhongTrung = (x1) => {
  if (!x1 || typeof x1 !== 'object') return [];
  const seen = new Set();
  const out = [];
  const parts = [x1.MA_BENH_CHINH, x1.MA_BENH_KT, x1.MA_BENHKEM];
  parts.forEach((value) => {
    (String(value || '').toUpperCase().match(ICD_RG_PHAC) || []).forEach((code) => {
      const n = String(code || '').replace(/[^A-Z0-9.]/g, '').toUpperCase();
      if (!n) return;
      const k = n.replace(/\./g, '');
      if (k && !seen.has(k)) {
        seen.add(k);
        out.push(k);
      }
    });
  });
  return out;
};

const tachChuoiMa = (raw) =>
  String(raw || '')
    .split(/[;,]/)
    .map((s) => s.trim())
    .filter(Boolean);

const docDuLieuMapping = async () => {
  try {
    const chunksStr = await AsyncStorage.getItem(`${KEY_DATA}_CHUNKS`);
    if (chunksStr) {
      const totalChunks = parseInt(chunksStr, 10);
      if (totalChunks > 0) {
        const keys = Array.from({ length: totalChunks }, (_, i) => `${KEY_DATA}_CHUNK_${i}`);
        const pairs = await AsyncStorage.multiGet(keys);
        let full = [];
        pairs.forEach(([, chunkStr]) => {
          if (chunkStr) {
            try {
              full = full.concat(JSON.parse(chunkStr));
            } catch {
              /* ignore */
            }
          }
        });
        if (Array.isArray(full) && full.length > 0) return full;
      }
    }
    const raw = await AsyncStorage.getItem(KEY_DATA);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
      if (parsed && Array.isArray(parsed.data)) return parsed.data;
    }
  } catch {
    /* ignore */
  }
  const fallback = seedDefault && Array.isArray(seedDefault.data) ? seedDefault.data : [];
  return fallback;
};

const gopMappingTheoIcd = (rows) => {
  const byIcd = new Map();
  (Array.isArray(rows) ? rows : []).forEach((row) => {
    const icd = chuanHoaMaIcdPhacDoCdss(row?.MA_ICD ?? row?.['MA_ICD']);
    if (!icd) return;
    const thuoc = tachChuoiMa(row?.MA_THUOC_GOI_Y ?? row?.['MA_THUOC_GOI_Y']);
    const dvkt = tachChuoiMa(row?.MA_DVKT_GOI_Y ?? row?.['MA_DVKT_GOI_Y']);
    if (!byIcd.has(icd)) byIcd.set(icd, { thuoc: new Set(), dvkt: new Set(), ghiChu: [] });
    const agg = byIcd.get(icd);
    thuoc.forEach((m) => agg.thuoc.add(m));
    dvkt.forEach((m) => agg.dvkt.add(m));
    const gc = String(row?.GHI_CHU || row?.['GHI_CHU'] || '').trim();
    if (gc) agg.ghiChu.push(gc);
  });
  return byIcd;
};

/**
 * @param {object} hoSo — XML1..6
 * @param {object} danhMucHeThong — từ taiDanhMucHeThong (có MAP_THUOC_BV, MAP_DVKT_BV)
 * @returns {Array} cảnh báo bổ sung (có ma_luat CDSS_DM_UPGRADE_*)
 */
export const giamDinhCdssDmMatchingUpgrade = async (hoSo, danhMucHeThong) => {
  try {
    const rows = await docDuLieuMapping();
    if (!Array.isArray(rows) || rows.length === 0) return [];

    const mapThuocBv = danhMucHeThong?.MAP_THUOC_BV;
    const mapDvktBv = danhMucHeThong?.MAP_DVKT_BV;
    if (!(mapThuocBv instanceof Map)) return [];
    if (!(mapDvktBv instanceof Map)) return [];

    const xml1 = Array.isArray(hoSo?.XML1) && hoSo.XML1.length > 0 ? hoSo.XML1[0] : hoSo?.XML1;
    if (!xml1 || typeof xml1 !== 'object') return [];

    const icdTrenHoSo = layMaIcdGopChinhVaKemKhongTrung(xml1);
    if (icdTrenHoSo.length === 0) return [];

    const byIcd = gopMappingTheoIcd(rows);
    const xml2 = Array.isArray(hoSo?.XML2) ? hoSo.XML2 : [];
    const xml3 = Array.isArray(hoSo?.XML3) ? hoSo.XML3 : [];

    const maThuocHoSo = new Set(
      xml2.map((r) => String(r?.MA_THUOC || '').trim()).filter(Boolean),
    );
    const maDvktHoSo = new Set(
      xml3.map((r) => String(r?.MA_DICH_VU || '').trim()).filter(Boolean),
    );

    const ketQua = [];

    for (const icd of icdTrenHoSo) {
      const agg = byIcd.get(icd);
      if (!agg) continue;

      const thuocGoiY = [...agg.thuoc].filter((m) => mapThuocBv && mapThuocBv.has(m));
      if (agg.thuoc.size > 0 && thuocGoiY.length === 0) continue;

      if (thuocGoiY.length > 0) {
        const coItNhatMot = thuocGoiY.some((m) => maThuocHoSo.has(m));
        if (!coItNhatMot) {
          ketQua.push({
            phan_he: 'XML2',
            index: -1,
            truong_loi: 'MA_THUOC',
            ma_luat: 'CDSS_DM_UPGRADE_01',
            ten_quy_tac: 'CDSS — Thiếu mã thuốc gợi ý theo mapping ICD ↔ DM thuốc BV',
            canh_bao: `ℹ️ [CDSS nâng cấp — DM thuốc]: ICD ${icd} có gợi ý mã thuốc (${thuocGoiY.slice(0, 8).join(', ')}${thuocGoiY.length > 8 ? '…' : ''}) nhưng không thấy mã tương ứng trên XML2 — đối chiếu phác đồ / chỉ định.`,
            muc_do: 'Info',
            dieu_kien: 'CDSS_DM_UPGRADE_V1',
            namespace_quy_tac: 'CDSS_DM_UPGRADE',
            nguon_quy_tac: 'cdss_dm_matching_upgrade',
          });
        }
      }

      const dvktGoiY = [...agg.dvkt].filter((m) => mapDvktBv && mapDvktBv.has(m));
      if (agg.dvkt.size > 0 && dvktGoiY.length === 0) continue;

      if (dvktGoiY.length > 0) {
        const coItNhatMotDv = dvktGoiY.some((m) => maDvktHoSo.has(m));
        if (!coItNhatMotDv) {
          ketQua.push({
            phan_he: 'XML3',
            index: -1,
            truong_loi: 'MA_DICH_VU',
            ma_luat: 'CDSS_DM_UPGRADE_02',
            ten_quy_tac: 'CDSS — Thiếu mã DVKT gợi ý theo mapping ICD ↔ DM DVKT BV',
            canh_bao: `ℹ️ [CDSS nâng cấp — DM DVKT]: ICD ${icd} có gợi ý mã DVKT (${dvktGoiY.slice(0, 8).join(', ')}${dvktGoiY.length > 8 ? '…' : ''}) nhưng không thấy mã tương ứng trên XML3 — đối chiếu phác đồ / chỉ định.`,
            muc_do: 'Info',
            dieu_kien: 'CDSS_DM_UPGRADE_V1',
            namespace_quy_tac: 'CDSS_DM_UPGRADE',
            nguon_quy_tac: 'cdss_dm_matching_upgrade',
          });
        }
      }
    }

    return ketQua;
  } catch (_e) {
    return [];
  }
};
