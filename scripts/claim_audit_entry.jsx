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
import {
  COT_SEED_LUAT_DU_LIEU_MUC1,
  DU_LIEU_SEED_LUAT_DU_LIEU_MUC1,
} from '../ma_nguon/tien_ich/du_lieu_luat_du_lieu_muc1.jsx';
import { capNhatDanhMuc } from '../ma_nguon/tien_ich/kho_du_lieu.jsx';
import { damBaoSeedLuatPtttMuc11 } from '../ma_nguon/tien_ich/seed_luat_pttt_muc11.jsx';
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
    dirPath: '',
    outPath: '',
    focusCodes: [],
    tuongTacOnly: false,
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = String(args[index] || '').trim();
    if (!arg) continue;
    if (arg.startsWith('--dir=')) {
      options.dirPath = arg.slice('--dir='.length).trim();
      continue;
    }
    if (arg.startsWith('--out=')) {
      options.outPath = arg.slice('--out='.length).trim();
      continue;
    }
    if (arg.startsWith('--focus=')) {
      options.focusCodes = arg.slice('--focus='.length).split(',').map((item) => item.trim().toUpperCase()).filter(Boolean);
      continue;
    }
    if (arg === '--tuong-tac-only') {
      options.tuongTacOnly = true;
      continue;
    }
    if (!arg.startsWith('--')) {
      if (!options.claimPath && !options.dirPath) {
        options.claimPath = arg;
      } else if (!options.outPath) {
        options.outPath = arg;
      }
    }
  }

  return options;
};

/** Chỉ một cấp — tránh quét đệ quy chậm trên Google Drive */
const listXmlFilesOneLevel = (dirAbs) => {
  if (!fs.existsSync(dirAbs) || !fs.statSync(dirAbs).isDirectory()) return [];
  return fs
    .readdirSync(dirAbs, { withFileTypes: true })
    .filter((d) => d.isFile() && String(d.name).toLowerCase().endsWith('.xml'))
    .map((d) => path.join(dirAbs, d.name))
    .sort((a, b) => path.basename(a).localeCompare(path.basename(b)));
};

const laMaLuatTuongTacThuoc = (maLuat) => {
  const m = String(maLuat || '').trim().toUpperCase();
  return m.startsWith('TUONGTAC_') || m === 'CLN-TT-001';
};

const locCanhBaoTuongTac = (warnings) => (Array.isArray(warnings) ? warnings : []).filter((w) => laMaLuatTuongTacThuoc(w?.ma_luat));

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
  await damBaoSeedLuatPtttMuc11();
  await capNhatDanhMuc('CDSS_COLS_LUAT_DU_LIEU', COT_SEED_LUAT_DU_LIEU_MUC1);
  await capNhatDanhMuc('CDSS_DATA_LUAT_DU_LIEU', DU_LIEU_SEED_LUAT_DU_LIEU_MUC1);
  const phacDoSeedPath = path.join(process.cwd(), 'ma_nguon/chuyen_mon/phac_do_benh_vien/du_lieu_phac_do_cdss_guidelines.seed.json');
  if (fs.existsSync(phacDoSeedPath)) {
    const phacDoSeed = JSON.parse(fs.readFileSync(phacDoSeedPath, 'utf8'));
    if (Array.isArray(phacDoSeed.data)) await capNhatDanhMuc('CDSS_DATA_PHAC_DO_V3', phacDoSeed.data);
    if (Array.isArray(phacDoSeed.columns)) await capNhatDanhMuc('CDSS_COLS_PHAC_DO_V3', phacDoSeed.columns);
  }
  const cdssDmUpgradePath = path.join(process.cwd(), 'ma_nguon/chuyen_mon/phac_do_benh_vien/cdss_icd_dm_goi_y_upgrade.seed.json');
  if (fs.existsSync(cdssDmUpgradePath)) {
    const cdssDm = JSON.parse(fs.readFileSync(cdssDmUpgradePath, 'utf8'));
    if (Array.isArray(cdssDm.data)) await capNhatDanhMuc('CDSS_DATA_ICD_DM_GOI_Y_V1', cdssDm.data);
    if (Array.isArray(cdssDm.columns)) await capNhatDanhMuc('CDSS_COLS_ICD_DM_GOI_Y_V1', cdssDm.columns);
  }
};

const main = async () => {
  const options = parseArgs(process.argv);
  if (!options.claimPath && !options.dirPath) {
    console.error('Usage:');
    console.error('  node scripts/run_claim_audit.js <claim_xml130_path> [--out=output.json] [--focus=XML_55,...] [--tuong-tac-only]');
    console.error('  node scripts/run_claim_audit.js --dir=tai_nguyen/xml [--out=audit_folder.json] [--tuong-tac-only]');
    console.error('  (--dir chỉ đọc *.xml một cấp trong thư mục; không quét đệ quy)');
    process.exit(1);
  }
  if (options.claimPath && options.dirPath) {
    console.error('Chỉ chọn một: file XML đơn hoặc --dir=...');
    process.exit(1);
  }

  if (options.dirPath) {
    await runAuditThuMuc(options);
    return;
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
  let warnings = await chayGiamDinhToanDienV15(hoSo);
  warnings.sort((a, b) => {
    const orderDiff = (ORDER[a?.muc_do] ?? 9) - (ORDER[b?.muc_do] ?? 9);
    if (orderDiff !== 0) return orderDiff;
    return String(a?.ma_luat || '').localeCompare(String(b?.ma_luat || ''));
  });
  if (options.tuongTacOnly) {
    warnings = locCanhBaoTuongTac(warnings);
  }

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
      tuong_tac_only: options.tuongTacOnly,
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

const runAuditThuMuc = async (options) => {
  const dirAbs = path.resolve(process.cwd(), options.dirPath);
  if (!fs.existsSync(dirAbs) || !fs.statSync(dirAbs).isDirectory()) {
    console.error(`Thu muc khong ton tai hoac khong phai thu muc: ${dirAbs}`);
    process.exit(2);
  }

  const xmlPaths = listXmlFilesOneLevel(dirAbs);
  if (xmlPaths.length === 0) {
    console.error(`Khong co file .xml (mot cap) trong: ${dirAbs}`);
    process.exit(2);
  }

  await seedDanhMuc();
  xoaCacheBoMayGiamDinh();

  const files = [];
  const aggregateTuongTac = {};

  for (let i = 0; i < xmlPaths.length; i += 1) {
    const claimPath = xmlPaths[i];
    let hoSo;
    try {
      hoSo = parseClaimXml130(claimPath);
    } catch (e) {
      files.push({
        claim_path: claimPath,
        parse_ok: false,
        error: String(e && e.message ? e.message : e),
        total_warnings: 0,
        tuong_tac_warnings: [],
      });
      continue;
    }

    const xml1 = Array.isArray(hoSo.XML1) && hoSo.XML1.length > 0 ? hoSo.XML1[0] : {};
    const maLK = String(xml1?.MA_LK || path.basename(claimPath, '.xml'));

    let warnings = await chayGiamDinhToanDienV15(hoSo);
    warnings.sort((a, b) => {
      const orderDiff = (ORDER[a?.muc_do] ?? 9) - (ORDER[b?.muc_do] ?? 9);
      if (orderDiff !== 0) return orderDiff;
      return String(a?.ma_luat || '').localeCompare(String(b?.ma_luat || ''));
    });

    const tuongTacWarnings = locCanhBaoTuongTac(warnings);
    const rsTT = buildRuleSummary(tuongTacWarnings);
    Object.keys(rsTT).forEach((k) => {
      aggregateTuongTac[k] = (aggregateTuongTac[k] || 0) + rsTT[k];
    });

    const outWarnings = options.tuongTacOnly ? tuongTacWarnings : warnings;
    files.push({
      claim_path: claimPath,
      ma_lk: maLK,
      parse_ok: true,
      total_warnings: warnings.length,
      tuong_tac_count: tuongTacWarnings.length,
      warnings: outWarnings,
      rule_summary: buildRuleSummary(outWarnings),
    });
  }

  const outputPath = path.resolve(
    process.cwd(),
    options.outPath || path.join('test_xml', `audit_tuong_tac_dir_${toTimestamp()}.json`)
  );

  const result = {
    meta: {
      mode: 'directory',
      generated_at: new Date().toISOString(),
      dir: dirAbs,
      xml_file_count: xmlPaths.length,
      tuong_tac_only: options.tuongTacOnly,
      files_with_tuong_tac: files.filter((f) => f.parse_ok && (f.tuong_tac_count || 0) > 0).length,
      aggregate_tuong_tac_rule_summary: Object.fromEntries(
        Object.entries(aggregateTuongTac).sort((a, b) => a[0].localeCompare(b[0]))
      ),
      focus_summary: {},
    },
    files,
  };

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf8');

  console.log(`Thu muc: ${dirAbs}`);
  console.log(`So file XML (mot cap): ${xmlPaths.length}`);
  console.log(`Ho so co canh bao tuong tac thuoc: ${result.meta.files_with_tuong_tac}`);
  console.log(`Tong hop ma luat (tuong tac): ${JSON.stringify(result.meta.aggregate_tuong_tac_rule_summary)}`);
  console.log(`Output: ${outputPath}`);
};

main().catch((error) => {
  console.error('[qa:claim-audit] FAILED');
  console.error(error && error.stack ? error.stack : error);
  process.exit(3);
});
