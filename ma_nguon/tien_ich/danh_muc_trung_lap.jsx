/**
 * Phát hiện trùng khóa nghiệp vụ trên module Quản lý danh mục (mọi tab).
 * Dùng khi import Excel: ghi đè hoặc bỏ qua dòng trùng khóa với dữ liệu hiện có.
 */

/** Khóa ổn định theo từng tab (cột hoặc bộ cột). Tên cột trùng MAU_EXCEL_CHUAN / file BYT. */
export const KHOA_TRUNG_MAC_DINH = {
  DANH_MUC_ICD10: ['MÃ BỆNH'],
  DANH_MUC_ICD10_CAP_CUU: ['ICD_Chinh'],
  DANH_MUC_ICD10_KE_DON_TREN_30_NGAY: ['Mã bệnh theo ICD 10'],
  THONG_TIN_CO_SO: ['MA_CSKCB'],
  DANH_MUC_KHOA_LS_M01: ['MA_KHOA', 'MA_CSKCB'],
  DANH_MUC_NHAN_SU: ['MA_BHXH', 'MA_KHOA'],
  DANH_MUC_MAPPING_NGUOI_HANH_NGHE: ['MA_TUONG_DUONG'],
  DVKT_PHAMVI_MAPPING: ['PREFIX_DVKT'],
  DVKT_EQUIP_DVKT_MAP: ['PREFIX_DVKT', 'MA_MAY_PREFIX'],
  DANH_MUC_THUOC_MAU_M03: ['MA_THUOC'],
  DANH_MUC_TUONG_TAC_THUOC: ['MA_TUONG_TAC'],
  DANH_MUC_VAT_TU_M04: ['MA_VAT_TU'],
  DANH_MUC_DVKT_M05: ['MA_DICH_VU'],
  DANH_MUC_GIUONG_BAN_KHAM_BV: ['MA_TUONG_DUONG'],
  DANH_MUC_TRANG_THIET_BI_M06: ['MA_MAY', 'MA_CSKCB'],
  DANH_MUC_HA_TANG: ['MA_TIEU_CHI'],
};

export function chuanHoaPhanKhoa(v) {
  return String(v ?? '')
    .trim()
    .toUpperCase();
}

export function layGiaTriCot(row, tenCot) {
  if (!row || typeof row !== 'object') return '';
  if (Object.prototype.hasOwnProperty.call(row, tenCot)) return row[tenCot];
  const t = String(tenCot || '');
  const key = Object.keys(row).find((x) => x === t || x.toLowerCase() === t.toLowerCase());
  return key != null ? row[key] : '';
}

/** Ghép giá trị các cột thành khóa; null nếu thiếu bất kỳ phần nào (composite). */
export function taoKhoaTuDong(row, cotKeys) {
  const keys = Array.isArray(cotKeys) ? cotKeys : [cotKeys];
  if (keys.length === 0) return null;
  const parts = keys.map((c) => chuanHoaPhanKhoa(layGiaTriCot(row, c)));
  if (parts.some((p) => !p)) return null;
  return parts.join('\u241E');
}

export function hoanChinhDong(raw, tatCaCot) {
  const o = {};
  (tatCaCot || []).forEach((c) => {
    o[c] = layGiaTriCot(raw, c);
  });
  return o;
}

/** Bỏ trùng trong file import: cùng khóa → giữ dòng sau cùng trong file; dòng không khóa giữ nguyên thứ tự. */
export function dedupeImportedTheoKhoa(imported, tatCaCot, cotKeys) {
  const lastWin = new Map();
  const noKey = [];
  for (const raw of imported) {
    const row = hoanChinhDong(raw, tatCaCot);
    const k = taoKhoaTuDong(row, cotKeys);
    if (k == null) noKey.push(row);
    else lastWin.set(k, row);
  }
  const ordered = [];
  const added = new Set();
  for (const raw of imported) {
    const row = hoanChinhDong(raw, tatCaCot);
    const k = taoKhoaTuDong(row, cotKeys);
    if (k == null) continue;
    if (!added.has(k)) {
      added.add(k);
      ordered.push(lastWin.get(k));
    }
  }
  return [...noKey, ...ordered];
}

export function mapChiSoDongDauTheoKhoa(rows, cotKeys) {
  const m = new Map();
  (rows || []).forEach((row, i) => {
    const k = taoKhoaTuDong(row, cotKeys);
    if (k != null && !m.has(k)) m.set(k, i);
  });
  return m;
}

/**
 * @returns {{ soTrung: number, soMoi: number, soKhongKhoa: number, tongSauDedupe: number }}
 */
export function demThongKeImportVsHienCo(existRows, importedRaw, tatCaCot, cotKeys) {
  const deduped = dedupeImportedTheoKhoa(importedRaw, tatCaCot, cotKeys);
  const idxMap = mapChiSoDongDauTheoKhoa(existRows, cotKeys);
  let soTrung = 0;
  let soMoi = 0;
  let soKhongKhoa = 0;
  for (const raw of importedRaw) {
    const row = hoanChinhDong(raw, tatCaCot);
    const k = taoKhoaTuDong(row, cotKeys);
    if (k == null) soKhongKhoa += 1;
  }
  for (const row of deduped) {
    const k = taoKhoaTuDong(row, cotKeys);
    if (k == null) continue;
    if (idxMap.has(k)) soTrung += 1;
    else soMoi += 1;
  }
  return {
    soTrung,
    soMoi,
    soKhongKhoa,
    tongSauDedupe: deduped.length,
  };
}

/**
 * @param {'overwrite'|'skip'} mode — overwrite: cập nhật dòng cũ theo file; skip: giữ dòng cũ, không thêm bản trùng
 */
export function gopImportVoiBangHienCo(existRows, importedRaw, tatCaCot, cotKeys, mode) {
  const deduped = dedupeImportedTheoKhoa(importedRaw, tatCaCot, cotKeys);
  const existCopy = (existRows || []).map((r) => hoanChinhDong(r, tatCaCot));
  const keyToIndex = mapChiSoDongDauTheoKhoa(existCopy, cotKeys);

  const toPrepend = [];

  for (const row of deduped) {
    const k = taoKhoaTuDong(row, cotKeys);
    if (k == null) {
      toPrepend.push(row);
      continue;
    }
    if (keyToIndex.has(k)) {
      const idx = keyToIndex.get(k);
      if (mode === 'overwrite') {
        existCopy[idx] = { ...existCopy[idx], ...row };
      }
    } else {
      toPrepend.push(row);
      keyToIndex.set(k, -1);
    }
  }

  return [...toPrepend, ...existCopy];
}

/** Trùng khóa trong cùng bảng (nhiều dòng cùng khóa). */
export function timNhomTrungTrongBang(rows, cotKeys) {
  const byKey = new Map();
  const nhom = [];
  (rows || []).forEach((row, i) => {
    const k = taoKhoaTuDong(row, cotKeys);
    if (k == null) return;
    if (!byKey.has(k)) byKey.set(k, []);
    byKey.get(k).push(i);
  });
  byKey.forEach((indices, k) => {
    if (indices.length > 1) nhom.push({ k, indices: [...indices].sort((a, b) => a - b) });
  });
  return nhom;
}

/** Giữ dòng đầu tiên theo khóa, bỏ các dòng sau cùng khóa. */
export function gopTrungTrongBangGiuDongDau(rows, tatCaCot, cotKeys) {
  const seen = new Set();
  const out = [];
  for (const row of rows || []) {
    const full = hoanChinhDong(row, tatCaCot);
    const k = taoKhoaTuDong(full, cotKeys);
    if (k == null) {
      out.push(full);
      continue;
    }
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(full);
  }
  return out;
}

export function layCotKhoaChoTab(tabId, cotMauExcel, cotDangCo) {
  const cfg = KHOA_TRUNG_MAC_DINH[tabId];
  if (cfg && cfg.length) return cfg;
  const fallback = (cotMauExcel && cotMauExcel[0]) || (cotDangCo && cotDangCo[0]);
  return fallback ? [fallback] : [];
}
