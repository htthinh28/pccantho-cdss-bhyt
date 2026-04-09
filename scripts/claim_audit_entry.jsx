import { DOMParser } from '@xmldom/xmldom';
import { Buffer } from 'buffer';
import fs from 'fs';
import path from 'path';
import { COT_BYT_PL10_DOI_TUONG, DU_LIEU_BYT_PL10_DOI_TUONG } from '../ma_nguon/danh_muc_byt/10_ma_doi_tuong_kham/du_lieu_pl10_doi_tuong.jsx';
import { COT_DANH_MUC_DVKT_M05, DANH_MUC_DVKT_M05 } from '../ma_nguon/thanh_phan/dich_vu_ky_thuat.jsx';
import { COT_DANH_MUC_ICD10, DANH_MUC_ICD10 } from '../ma_nguon/thanh_phan/dm_icd10_seed.jsx';
import { COT_DANH_MUC_KHOA_LS_M01, DANH_MUC_KHOA_LS_M01 } from '../ma_nguon/thanh_phan/dm_khoals_m01dm.jsx';
import { COT_DANH_MUC_ICD10_KE_DON_TREN_30_NGAY, DANH_MUC_ICD10_KE_DON_TREN_30_NGAY } from '../ma_nguon/thanh_phan/icd10_ke_don_tren_30_ngay.jsx';
import { COT_DANH_MUC_MAPPING_NGUOI_HANH_NGHE, DANH_MUC_MAPPING_NGUOI_HANH_NGHE } from '../ma_nguon/thanh_phan/mapping_nguoi_hanh_nghe.jsx';
import { COT_DANH_MUC_NHAN_SU, DANH_MUC_NHAN_SU } from '../ma_nguon/thanh_phan/nhan_su.jsx';
import { COT_DANH_MUC_THUOC_MAU_M03, DANH_MUC_THUOC_MAU_M03 } from '../ma_nguon/thanh_phan/thuoc_mau_cp.jsx';
import { COT_DANH_MUC_TRANG_THIET_BI_M06, DANH_MUC_TRANG_THIET_BI_M06 } from '../ma_nguon/thanh_phan/trang_thiet_bi.jsx';
import { chayGiamDinhToanDienV15, xoaCacheBoMayGiamDinh } from '../ma_nguon/tien_ich/dong_co_giam_dinh.jsx';
import { capNhatDanhMuc } from '../ma_nguon/tien_ich/kho_du_lieu.jsx';
import { damBaoSeedLuatThuocMuc8 } from '../ma_nguon/tien_ich/seed_luat_thuoc_muc8.jsx';
import { xuLyFileXML130 } from '../ma_nguon/tien_ich/xml_helper.jsx';

const SEED_DATASETS = [
  { dataKey: 'DANH_MUC_ICD10', columnsKey: 'COLS_DANH_MUC_ICD10', rows: DANH_MUC_ICD10, columns: COT_DANH_MUC_ICD10 },
  { dataKey: 'DANH_MUC_DVKT_M05', columnsKey: 'COLS_DANH_MUC_DVKT_M05', rows: DANH_MUC_DVKT_M05, columns: COT_DANH_MUC_DVKT_M05 },
  { dataKey: 'DANH_MUC_THUOC_MAU_M03', columnsKey: 'COLS_DANH_MUC_THUOC_MAU_M03', rows: DANH_MUC_THUOC_MAU_M03, columns: COT_DANH_MUC_THUOC_MAU_M03 },
  { dataKey: 'DANH_MUC_KHOA_LS_M01', columnsKey: 'COLS_DANH_MUC_KHOA_LS_M01', rows: DANH_MUC_KHOA_LS_M01, columns: COT_DANH_MUC_KHOA_LS_M01 },
  { dataKey: 'DANH_MUC_ICD10_KE_DON_TREN_30_NGAY', columnsKey: 'COLS_DANH_MUC_ICD10_KE_DON_TREN_30_NGAY', rows: DANH_MUC_ICD10_KE_DON_TREN_30_NGAY, columns: COT_DANH_MUC_ICD10_KE_DON_TREN_30_NGAY },
  { dataKey: 'DANH_MUC_NHAN_SU', columnsKey: 'COLS_DANH_MUC_NHAN_SU', rows: DANH_MUC_NHAN_SU, columns: COT_DANH_MUC_NHAN_SU },
  { dataKey: 'DANH_MUC_MAPPING_NGUOI_HANH_NGHE', columnsKey: 'COLS_DANH_MUC_MAPPING_NGUOI_HANH_NGHE', rows: DANH_MUC_MAPPING_NGUOI_HANH_NGHE, columns: COT_DANH_MUC_MAPPING_NGUOI_HANH_NGHE },
  { dataKey: 'DANH_MUC_TRANG_THIET_BI_M06', columnsKey: 'COLS_DANH_MUC_TRANG_THIET_BI_M06', rows: DANH_MUC_TRANG_THIET_BI_M06, columns: COT_DANH_MUC_TRANG_THIET_BI_M06 },
  { dataKey: 'BYT_7603_PL10_DOI_TUONG', columnsKey: 'BYT_7603_COLS_PL10_DOI_TUONG', rows: DU_LIEU_BYT_PL10_DOI_TUONG, columns: COT_BYT_PL10_DOI_TUONG },
];

const ORDER = { Critical: 0, Error: 1, Warning: 2, Info: 3 };

const parseArgs = (argv) => {
  const args = argv.slice(2);
  const options = {
    claimPath: '',
    outPath: '',
    focusCodes: [],
  };

  if (args.length > 0) {
    options.claimPath = String(args[0] || '').trim();
  }

  for (let index = 1; index < args.length; index += 1) {
    const arg = String(args[index] || '').trim();
    if (!arg) continue;
    if (arg.startsWith('--out=')) {
      options.outPath = arg.slice('--out='.length).trim();
      continue;
    }
    if (arg.startsWith('--focus=')) {
      options.focusCodes = arg.slice('--focus='.length).split(',').map((item) => item.trim().toUpperCase()).filter(Boolean);
      continue;
    }
    if (!options.outPath && !arg.startsWith('--')) {
      options.outPath = arg;
    }
  }

  return options;
};

const parseClaimXml130 = (claimPath) => {
  const raw = fs.readFileSync(claimPath, 'utf8');
  const danhSachHoSo = xuLyFileXML130(raw);
  if (!Array.isArray(danhSachHoSo) || danhSachHoSo.length === 0) {
    return {
      XML1: [],
      XML2: [],
      XML3: [],
      XML4: [],
      XML5: [],
      XML6: [],
    };
  }
  const hoSo = danhSachHoSo[0] || {};
  return {
    XML1: hoSo.xml1 ? [hoSo.xml1] : [],
    XML2: Array.isArray(hoSo.xml2) ? hoSo.xml2 : [],
    XML3: Array.isArray(hoSo.xml3) ? hoSo.xml3 : [],
    XML4: Array.isArray(hoSo.xml4) ? hoSo.xml4 : [],
    XML5: Array.isArray(hoSo.xml5) ? hoSo.xml5 : [],
    XML6: Array.isArray(hoSo.xml6) ? hoSo.xml6 : [],
    XML7: Array.isArray(hoSo?._raw?.XML7) ? hoSo._raw.XML7 : [],
    XML8: Array.isArray(hoSo?._raw?.XML8) ? hoSo._raw.XML8 : [],
    _raw: hoSo?._raw || {},
  };
};

const buildSeveritySummary = (warnings) => warnings.reduce((acc, item) => {
  const key = String(item?.muc_do || 'Unknown');
  acc[key] = (acc[key] || 0) + 1;
  return acc;
}, {});

const buildFieldSummary = (warnings, fieldName, fallback = 'N/A') => {
  const summary = {};
  warnings.forEach((item) => {
    const key = String(item?.[fieldName] || fallback).trim() || fallback;
    summary[key] = (summary[key] || 0) + 1;
  });
  return Object.fromEntries(Object.entries(summary).sort((a, b) => a[0].localeCompare(b[0])));
};

const buildRuleSummary = (warnings) => {
  const summary = {};
  warnings.forEach((item) => {
    const key = String(item?.ma_luat || 'N/A').trim() || 'N/A';
    summary[key] = (summary[key] || 0) + 1;
  });
  return Object.fromEntries(Object.entries(summary).sort((a, b) => a[0].localeCompare(b[0])));
};

const pickFocusSummary = (warnings, focusCodes) => {
  if (!Array.isArray(focusCodes) || focusCodes.length === 0) return {};
  const set = new Set(focusCodes.map((item) => String(item || '').trim().toUpperCase()).filter(Boolean));
  const result = {};
  set.forEach((code) => {
    result[code] = warnings.filter((item) => String(item?.ma_luat || '').trim().toUpperCase() === code).length;
  });
  return result;
};

const toTimestamp = () => {
  const now = new Date();
  const pad = (value) => String(value).padStart(2, '0');
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
};

const seedDanhMuc = async () => {
  await Promise.all(SEED_DATASETS.flatMap((dataset) => {
    const tasks = [capNhatDanhMuc(dataset.dataKey, dataset.rows)];
    if (Array.isArray(dataset.columns) && dataset.columns.length > 0) {
      tasks.push(capNhatDanhMuc(dataset.columnsKey, dataset.columns));
    }
    return tasks;
  }));
  await damBaoSeedLuatThuocMuc8();
};

const main = async () => {
  const options = parseArgs(process.argv);
  if (!options.claimPath) {
    console.error('Usage: node scripts/run_claim_audit.js <claim_xml130_path> [--out=output.json] [--focus=XML_55,XML_58,...]');
    process.exit(1);
  }

  const claimPath = path.resolve(process.cwd(), options.claimPath);
  if (!fs.existsSync(claimPath)) {
    console.error(`Claim file not found: ${claimPath}`);
    process.exit(2);
  }

  await seedDanhMuc();
  xoaCacheBoMayGiamDinh();

  const hoSo = parseClaimXml130(claimPath);
  const xml1 = Array.isArray(hoSo.XML1) && hoSo.XML1.length > 0 ? hoSo.XML1[0] : {};
  const warnings = await chayGiamDinhToanDienV15(hoSo);
  warnings.sort((a, b) => {
    const orderDiff = (ORDER[a?.muc_do] ?? 9) - (ORDER[b?.muc_do] ?? 9);
    if (orderDiff !== 0) return orderDiff;
    return String(a?.ma_luat || '').localeCompare(String(b?.ma_luat || ''));
  });

  const maLK = String(xml1?.MA_LK || 'unknown');
  const outputPath = path.resolve(
    process.cwd(),
    options.outPath || path.join('test_xml', `audit_${maLK}_${toTimestamp()}.json`)
  );
  const result = {
    meta: {
      generated_at: new Date().toISOString(),
      claim_path: claimPath,
      ma_lk: maLK,
      total_warnings: warnings.length,
      by_severity: buildSeveritySummary(warnings),
      by_namespace: buildFieldSummary(warnings, 'namespace_quy_tac'),
      by_source: buildFieldSummary(warnings, 'nguon_quy_tac'),
      focus_summary: pickFocusSummary(warnings, options.focusCodes),
    },
    unique_rule_codes: Object.keys(buildRuleSummary(warnings)),
    rule_summary: buildRuleSummary(warnings),
    warnings,
  };

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf8');

  console.log(`MA_LK: ${maLK}`);
  console.log(`Tong canh bao: ${warnings.length}`);
  console.log(`Theo muc do: ${JSON.stringify(result.meta.by_severity)}`);
  console.log(`Theo namespace: ${JSON.stringify(result.meta.by_namespace)}`);
  console.log(`Theo nguon: ${JSON.stringify(result.meta.by_source)}`);
  if (options.focusCodes.length > 0) {
    console.log(`Focus: ${JSON.stringify(result.meta.focus_summary)}`);
  }
  console.log(`Output: ${outputPath}`);
};

main().catch((error) => {
  console.error('[qa:claim-audit] FAILED');
  console.error(error && error.stack ? error.stack : error);
  process.exit(3);
});
