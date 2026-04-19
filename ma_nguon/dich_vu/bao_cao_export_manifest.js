/**
 * Thu thập các bảng báo cáo theo nhánh đang xem — dùng xuất Excel / in (đủ dòng, không giới hạn UI).
 */

const MAX_FACT_DONG_XUAT = 20000;

const cot = (pairs) => pairs.map(([key, label]) => ({ key, label }));

const COT_FACT_HO_SO = cot([
  ['ma_lk', 'ma_lk'],
  ['ma_bn', 'ma_bn'],
  ['ma_cskcb', 'ma_cskcb'],
  ['ma_khoa', 'ma_khoa'],
  ['ma_bac_si', 'ma_bac_si'],
  ['loai_kcb', 'loai_kcb'],
  ['ma_icd_chinh', 'ma_icd_chinh'],
  ['ngay_vao', 'ngay_vao'],
  ['ngay_ra', 'ngay_ra'],
  ['so_ngay_dtri', 'so_ngay_dtri'],
  ['t_thanhtoan', 't_thanhtoan'],
  ['t_bhtt', 't_bhtt'],
  ['t_thuoc', 't_thuoc'],
  ['t_vtyt', 't_vtyt'],
  ['co_canh_bao', 'co_canh_bao'],
  ['tong_chi_phi_rui_ro', 'tong_chi_phi_rui_ro'],
]);

const COT_FACT_DONG = cot([
  ['id_dong', 'id_dong'],
  ['ma_lk', 'ma_lk'],
  ['loai_dong', 'loai_dong'],
  ['ma_dich_vu', 'ma_dich_vu'],
  ['ten_dich_vu', 'ten_dich_vu'],
  ['so_luong', 'so_luong'],
  ['thanh_tien', 'thanh_tien'],
  ['t_bhtt_dong', 't_bhtt_dong'],
]);

const COT_FACT_CANH = cot([
  ['id_canh_bao', 'id_canh_bao'],
  ['ma_lk', 'ma_lk'],
  ['ma_rule', 'ma_rule'],
  ['namespace_quy_tac', 'namespace_quy_tac'],
  ['muc_do', 'muc_do'],
  ['loai_loi', 'loai_loi'],
  ['chi_phi_anh_huong', 'chi_phi_anh_huong'],
  ['tab_quan_tri_goi_y', 'tab_quan_tri_goi_y'],
]);

const COT_DIM_KHOA = cot([
  ['ma_khoa', 'ma_khoa'],
  ['ten_khoa', 'ten_khoa'],
  ['khoi_chuc_nang', 'khoi_chuc_nang'],
  ['active', 'active'],
]);

const COT_DIM_BS = cot([
  ['ma_bac_si', 'ma_bac_si'],
  ['ho_ten', 'ho_ten'],
  ['ma_khoa', 'ma_khoa'],
  ['active', 'active'],
]);

const COT_DAC_TA = cot([
  ['truong', 'truong'],
  ['kieu', 'kieu'],
]);

const sliceRows = (rows, max) => {
  const arr = Array.isArray(rows) ? rows : [];
  if (max == null || arr.length <= max) return { rows: arr, truncated: false, total: arr.length };
  return { rows: arr.slice(0, max), truncated: true, total: arr.length };
};

const addSheet = (sheets, sheetName, columns, rows, maxRows) => {
  const { rows: r, truncated, total } = sliceRows(rows, maxRows);
  let name = String(sheetName || 'Sheet').slice(0, 31);
  if (truncated) {
    const suf = `_${r.length}of${total}`;
    name = `${String(sheetName).slice(0, Math.max(1, 31 - suf.length))}${suf}`.slice(0, 31);
  }
  sheets.push({
    sheetName: name,
    columns,
    rows: r,
    exportNote: truncated ? `Giới hạn xuất: ${r.length}/${total} dòng` : '',
  });
};

/**
 * @returns {{ sheets: Array<{ sheetName: string, columns: {key:string,label:string}[], rows: object[], exportNote?: string }>, tieuDe: string }}
 */
export const layCacBangDeXuat = ({ nhanh, quanTriThe, tai }) => {
  const sheets = [];
  const mh = tai?.moHinh;
  const m6 = tai?.muc6;
  const m7 = tai?.muc7;
  const m8 = tai?.muc8;

  const tieuDe =
    nhanh === 'QUAN_TRI'
      ? quanTriThe === 'M5'
        ? 'Báo cáo Quản trị — Mục 5 (Fact/Dimension)'
        : 'Báo cáo Quản trị — Mục 6 (BC-QT-01…04)'
      : nhanh === 'CHUYEN_MON'
        ? 'Báo cáo Chuyên môn — Mục 7 (BC-CM-01…05)'
        : 'Báo cáo Doanh thu BHYT — Mục 8 (BC-DT-01…06)';

  if (nhanh === 'QUAN_TRI' && quanTriThe === 'M5' && mh) {
    addSheet(sheets, 'FACT_HO_SO', COT_FACT_HO_SO, mh.fact_ho_so, null);
    addSheet(sheets, 'FACT_DONG_CP', COT_FACT_DONG, mh.fact_dong_chi_phi, MAX_FACT_DONG_XUAT);
    addSheet(sheets, 'FACT_CANH_BAO', COT_FACT_CANH, mh.fact_canh_bao, null);
    addSheet(sheets, 'DIM_KHOA', COT_DIM_KHOA, mh.dim_khoa, null);
    addSheet(sheets, 'DIM_BAC_SI', COT_DIM_BS, mh.dim_bac_si, null);
    const cache = mh.dac_ta_store_5_4?.cache_bao_cao || {};
    const snap = mh.dac_ta_store_5_4?.snapshot_bao_cao || {};
    addSheet(
      sheets,
      'cache_bao_cao',
      COT_DAC_TA,
      Object.entries(cache).map(([truong, kieu]) => ({ truong, kieu: String(kieu) })),
      null,
    );
    addSheet(
      sheets,
      'snapshot_bao_cao',
      COT_DAC_TA,
      Object.entries(snap).map(([truong, kieu]) => ({ truong, kieu: String(kieu) })),
      null,
    );
  }

  if (nhanh === 'QUAN_TRI' && quanTriThe === 'M6' && m6) {
    const pairs = [
      ['BC_QT01_KPI', m6.bc_qt_01_kpi],
      ['BC_QT01_TOP5_KHOA', m6.bc_qt_01_top5_khoa_loi],
      ['BC_QT02_NS', m6.bc_qt_02_nang_suat],
      ['BC_QT03_TT', m6.bc_qt_03_tuan_thu],
      ['BC_QT04_TYLE', m6.bc_qt_04_ty_le],
      ['BC_QT04_TOP_RULE', m6.bc_qt_04_top10_rule],
      ['BC_QT04_TOP_KHOA', m6.bc_qt_04_top10_khoa],
      ['BC_QT04_DOI_CHIEU', m6.bc_qt_04_doi_chieu_chi_phi],
      ['BC_QT04_CHENH_TONG', m6.bc_qt_04_chenh_tong_chi],
    ];
    for (const [sn, rows] of pairs) {
      if (!rows?.length) {
        addSheet(sheets, sn, [{ key: '_', label: '(trong)' }], [{ _: '' }], null);
        continue;
      }
      const keys = Object.keys(rows[0]);
      const columns = keys.map((k) => ({ key: k, label: k }));
      addSheet(sheets, sn, columns, rows, null);
    }
  }

  if (nhanh === 'CHUYEN_MON' && m7) {
    const pairs = [
      ['BC_CM01_KPI', m7.bc_cm_01_kpi],
      ['BC_CM01_KHOA', m7.bc_cm_01_phan_bo_khoa],
      ['BC_CM02_CPW', m7.bc_cm_02_cpw],
      ['BC_CM03_TOM', m7.bc_cm_03_tom_tat],
      ['BC_CM03_TOP_RULE', m7.bc_cm_03_top_rule],
      ['BC_CM03_KHOA', m7.bc_cm_03_top_khoa_major],
      ['BC_CM04_NS', m7.bc_cm_04_namespace],
      ['BC_CM05_CS', m7.bc_cm_05_chi_so],
      ['BC_CM05_ICD', m7.bc_cm_05_top_icd],
    ];
    for (const [sn, rows] of pairs) {
      if (!rows?.length) {
        addSheet(sheets, sn, [{ key: '_', label: '(trong)' }], [{ _: '' }], null);
        continue;
      }
      const keys = Object.keys(rows[0]);
      const columns = keys.map((k) => ({ key: k, label: k }));
      addSheet(sheets, sn, columns, rows, null);
    }
  }

  if (nhanh === 'DOANH_THU_BHYT' && m8) {
    const pairs = [
      ['BC_DT01_KPI', m8.bc_dt_01_kpi],
      ['BC_DT01_LOAI', m8.bc_dt_01_phan_loai],
      ['BC_DT01_KHOA', m8.bc_dt_01_top_khoa],
      ['BC_DT01_RULE', m8.bc_dt_01_top_rule],
      ['BC_DT02_TOP100', m8.bc_dt_02_top100],
      ['BC_DT03_PIVOT', m8.bc_dt_03_pivot],
      ['BC_DT03_CT', m8.bc_dt_03_chi_tiet],
      ['BC_DT03_CHENH', m8.bc_dt_03_chenh_tong],
      ['BC_DT04_CO_CAU', m8.bc_dt_04_co_cau],
      ['BC_DT05_THANG', m8.bc_dt_05_thang],
      ['BC_DT05_DB', m8.bc_dt_05_du_bao],
      ['BC_DT06_CS', m8.bc_dt_06_chi_so],
      ['BC_DT06_KCB', m8.bc_dt_06_loai_kcb],
    ];
    for (const [sn, rows] of pairs) {
      if (!rows?.length) {
        addSheet(sheets, sn, [{ key: '_', label: '(trong)' }], [{ _: '' }], null);
        continue;
      }
      const keys = Object.keys(rows[0]);
      const columns = keys.map((k) => ({ key: k, label: k }));
      addSheet(sheets, sn, columns, rows, null);
    }
  }

  const metaRows = [
    { truong: 'tieu_de', gia_tri: tieuDe },
    { truong: 'nhanh', gia_tri: String(nhanh || '') },
    { truong: 'quan_tri_the', gia_tri: String(quanTriThe || '') },
    { truong: 'so_ho_so', gia_tri: String(tai?.soHoSo ?? '') },
    { truong: 'thoi_diem_xuat', gia_tri: new Date().toISOString() },
  ];
  addSheet(
    sheets,
    '_META',
    cot([
      ['truong', 'truong'],
      ['gia_tri', 'gia_tri'],
    ]),
    metaRows,
    null,
  );

  return { sheets, tieuDe };
};
