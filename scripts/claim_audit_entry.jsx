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
    filesFrom: '',
    filesCsv: '',
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = String(args[index] || '').trim();
    if (!arg) continue;
    if (arg.startsWith('--files-from=')) {
      options.filesFrom = arg.slice('--files-from='.length).trim();
      continue;
    }
    if (arg.startsWith('--files=')) {
      options.filesCsv = arg.slice('--files='.length);
      continue;
    }
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

/** Đọc manifest (mỗi dòng một đường dẫn tương đối cwd) hoặc --files= a,b,c */
const buildExplicitPathsFromOptions = (options) => {
  const relPaths = [];
  if (options.filesFrom) {
    const mf = path.resolve(process.cwd(), options.filesFrom);
    if (!fs.existsSync(mf) || !fs.statSync(mf).isFile()) {
      return { paths: [], error: `Khong doc duoc manifest: ${mf}` };
    }
    fs.readFileSync(mf, 'utf8')
      .split(/\r?\n/)
      .forEach((line) => {
        const t = line.trim();
        if (t && !t.startsWith('#')) relPaths.push(t);
      });
  } else if (options.filesCsv) {
    options.filesCsv.split(',').forEach((s) => {
      const t = String(s || '').trim();
      if (t) relPaths.push(t);
    });
  }
  return { paths: relPaths, error: '' };
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

/** Gộp nhiều object đếm { key: n } — dùng tổng hợp theo tầng trên cả thư mục XML. */
const mergeCountMaps = (maps) => {
  const out = {};
  (Array.isArray(maps) ? maps : []).forEach((m) => {
    if (!m || typeof m !== 'object') return;
    Object.keys(m).forEach((k) => {
      out[k] = (out[k] || 0) + (Number(m[k]) || 0);
    });
  });
  return Object.fromEntries(Object.entries(out).sort((a, b) => a[0].localeCompare(b[0])));
};

/** Tóm tắt theo tầng pipeline V15 (đồng bộ comment trong chayGiamDinhToanDienV15). */
const buildLayersSummary = (warnings) => ({
  V15_pipeline:
    'L0 FalsePositiveGuard | L1 Hành chính | L2-3 Danh mục BV+BYT | L4 Lâm sàng | L5 No-code | L5b CDSS ICD↔DM',
  by_severity: buildSeveritySummary(warnings),
  by_tang_V15: buildFieldSummary(warnings, 'tang_V15'),
  by_phan_he: buildFieldSummary(warnings, 'phan_he'),
  by_namespace_quy_tac: buildFieldSummary(warnings, 'namespace_quy_tac'),
  by_nguon_quy_tac: buildFieldSummary(warnings, 'nguon_quy_tac'),
  by_dieu_kien: buildFieldSummary(warnings, 'dieu_kien'),
  rule_summary: buildRuleSummary(warnings),
});

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
  const explicitRel = buildExplicitPathsFromOptions(options);
  if (explicitRel.error) {
    console.error(explicitRel.error);
    process.exit(2);
  }

  if (!options.claimPath && !options.dirPath && explicitRel.paths.length === 0) {
    console.error('Usage:');
    console.error('  node scripts/run_claim_audit.js <claim_xml130_path> [--out=output.json] [--focus=XML_55,...] [--tuong-tac-only]');
    console.error('  node scripts/run_claim_audit.js --dir=tai_nguyen/xml [--out=audit_folder.json] [--tuong-tac-only]');
    console.error('  node scripts/run_claim_audit.js --files-from=scripts/manifests/ten.txt [--out=...]  (mỗi dòng: đường dẫn .xml từ cwd)');
    console.error('  node scripts/run_claim_audit.js --files=a.xml,b.xml [--out=...]');
    console.error('  (--dir chỉ đọc *.xml một cấp trong thư mục; không quét đệ quy)');
    process.exit(1);
  }
  if (options.claimPath && options.dirPath) {
    console.error('Chỉ chọn một: file XML đơn hoặc --dir=...');
    process.exit(1);
  }
  if (explicitRel.paths.length > 0 && (options.claimPath || options.dirPath)) {
    console.error('Không kết hợp --files-from / --files= với file đơn hoặc --dir=');
    process.exit(1);
  }

  if (explicitRel.paths.length > 0) {
    await runAuditThuMuc({ ...options, explicitPaths: explicitRel.paths });
    return;
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
      by_tang_V15: buildFieldSummary(warnings, 'tang_V15'),
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
  console.log(`Theo tang_V15: ${JSON.stringify(result.meta.by_tang_V15)}`);
  console.log(`Theo namespace: ${JSON.stringify(result.meta.by_namespace)}`);
  console.log(`Theo nguon: ${JSON.stringify(result.meta.by_source)}`);
  if (options.focusCodes.length > 0) {
    console.log(`Focus: ${JSON.stringify(result.meta.focus_summary)}`);
  }
  console.log(`Output: ${outputPath}`);
};

const runAuditThuMuc = async (options) => {
  let xmlPaths = [];
  const missingExplicit = [];
  let dirAbs = null;
  let mode = 'directory';

  if (Array.isArray(options.explicitPaths) && options.explicitPaths.length > 0) {
    mode = 'explicit_paths';
    for (const raw of options.explicitPaths) {
      const p = path.resolve(process.cwd(), raw);
      if (!fs.existsSync(p) || !fs.statSync(p).isFile() || !String(p).toLowerCase().endsWith('.xml')) {
        missingExplicit.push(raw);
        continue;
      }
      xmlPaths.push(p);
    }
    xmlPaths.sort((a, b) => path.basename(a).localeCompare(path.basename(b), 'vi', { numeric: true, sensitivity: 'base' }));
  } else {
    dirAbs = path.resolve(process.cwd(), options.dirPath);
    if (!fs.existsSync(dirAbs) || !fs.statSync(dirAbs).isDirectory()) {
      console.error(`Thu muc khong ton tai hoac khong phai thu muc: ${dirAbs}`);
      process.exit(2);
    }
    xmlPaths = listXmlFilesOneLevel(dirAbs);
  }

  if (xmlPaths.length === 0) {
    console.error(
      mode === 'explicit_paths'
        ? 'Khong co file .xml hop le trong danh sach (kiem tra duong dan / phan mo rong .xml).'
        : `Khong co file .xml (mot cap) trong: ${dirAbs}`,
    );
    if (missingExplicit.length) {
      console.error(`Loi duong dan (${missingExplicit.length}): ${missingExplicit.join('; ')}`);
    }
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
    const layersFull = buildLayersSummary(warnings);
    files.push({
      claim_path: claimPath,
      ma_lk: maLK,
      parse_ok: true,
      total_warnings: warnings.length,
      tuong_tac_count: tuongTacWarnings.length,
      warnings: outWarnings,
      rule_summary: buildRuleSummary(outWarnings),
      /** Luôn tính trên toàn bộ cảnh báo (trước --tuong-tac-only) để đối chiếu từng tầng. */
      layers_summary_full: layersFull,
    });
  }

  const parsedFiles = files.filter((f) => f.parse_ok);
  const aggregateLayers = {
    by_severity: mergeCountMaps(parsedFiles.map((f) => f.layers_summary_full?.by_severity)),
    by_tang_V15: mergeCountMaps(parsedFiles.map((f) => f.layers_summary_full?.by_tang_V15)),
    by_phan_he: mergeCountMaps(parsedFiles.map((f) => f.layers_summary_full?.by_phan_he)),
    by_namespace_quy_tac: mergeCountMaps(parsedFiles.map((f) => f.layers_summary_full?.by_namespace_quy_tac)),
    by_nguon_quy_tac: mergeCountMaps(parsedFiles.map((f) => f.layers_summary_full?.by_nguon_quy_tac)),
    by_dieu_kien: mergeCountMaps(parsedFiles.map((f) => f.layers_summary_full?.by_dieu_kien)),
    rule_summary: mergeCountMaps(parsedFiles.map((f) => f.layers_summary_full?.rule_summary)),
  };

  const outputPath = path.resolve(
    process.cwd(),
    options.outPath || path.join('test_xml', `audit_tuong_tac_dir_${toTimestamp()}.json`)
  );

  const result = {
    meta: {
      mode,
      generated_at: new Date().toISOString(),
      ...(dirAbs
        ? {
            dir: dirAbs,
            dir_abs_windows: dirAbs.replace(/\//g, '\\'),
          }
        : {}),
      xml_file_count: xmlPaths.length,
      explicit_paths_skipped: missingExplicit.length ? missingExplicit : undefined,
      tuong_tac_only: options.tuongTacOnly,
      files_with_tuong_tac: files.filter((f) => f.parse_ok && (f.tuong_tac_count || 0) > 0).length,
      aggregate_tuong_tac_rule_summary: Object.fromEntries(
        Object.entries(aggregateTuongTac).sort((a, b) => a[0].localeCompare(b[0]))
      ),
      /** Tổng hợp cảnh báo theo tầng (V15) trên toàn bộ file XML trong thư mục — dùng kiểm tra quy tắc hoạt động. */
      aggregate_layers_full: aggregateLayers,
      focus_summary: {},
    },
    files,
  };

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf8');

  if (mode === 'directory') {
    console.log(`Thu muc: ${dirAbs}`);
  } else {
    console.log(`Che do: danh sach file (${xmlPaths.length} tep hop le)`);
    if (missingExplicit.length) {
      console.log(`Bo qua (${missingExplicit.length}) khong ton tai hoac khong phai .xml: ${missingExplicit.join('; ')}`);
    }
  }
  console.log(`So file XML: ${xmlPaths.length}`);
  console.log(`Ho so co canh bao tuong tac thuoc: ${result.meta.files_with_tuong_tac}`);
  console.log(`Tong hop ma luat (tuong tac): ${JSON.stringify(result.meta.aggregate_tuong_tac_rule_summary)}`);
  console.log(`Output: ${outputPath}`);
};

main().catch((error) => {
  console.error('[qa:claim-audit] FAILED');
  console.error(error && error.stack ? error.stack : error);
  process.exit(3);
});
