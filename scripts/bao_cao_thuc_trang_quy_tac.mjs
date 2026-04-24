/**
 * Tổng hợp báo cáo thực trạng quy tắc (số lượng, ON/OFF, placeholder, nhóm rủi ro dương/âm giả).
 * Chạy: node scripts/bao_cao_thuc_trang_quy_tac.mjs
 * Đầu ra: tai_lieu/Bao_cao_thuc_trang_quy_tac_he_thong.txt
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const TIEN_ICH = path.join(ROOT, 'ma_nguon', 'tien_ich');
const OUT = path.join(ROOT, 'tai_lieu', 'Bao_cao_thuc_trang_quy_tac_he_thong.txt');
const REG_PLACEHOLDER = path.join(ROOT, 'scripts', 'chuyen_de_placeholder_registry.json');

const normalizeCodeOnOff = (value) => String(value || '').trim().toUpperCase();
const chuanHoaKhoaMaLuatOnOff = (s) => normalizeCodeOnOff(s).replace(/_/g, '-');

function extractFreezeStringArray(qText, constName) {
  const re = new RegExp(`const ${constName} = Object\\.freeze\\(\\[([\\s\\S]*?)\\]\\);`, 'm');
  const m = qText.match(re);
  if (!m) return [];
  return [...m[1].matchAll(/'([^']+)'/g)].map((x) => x[1]);
}

/** Mỗi phần tử: mã + ghi chú cùng dòng (// ...) trong quy_tac_on_off_noi_bo.jsx nếu có. */
function extractFreezeStringArrayWithLineComments(qText, constName) {
  const re = new RegExp(`const ${constName} = Object\\.freeze\\(\\[([\\s\\S]*?)\\]\\);`, 'm');
  const m = qText.match(re);
  if (!m) return [];
  const out = [];
  for (const rawLine of m[1].split(/\r?\n/)) {
    let comment = '';
    let work = rawLine;
    const slash = work.indexOf('//');
    if (slash !== -1) {
      comment = work.slice(slash + 2).trim();
      work = work.slice(0, slash);
    }
    for (const mm of work.matchAll(/'([^']+)'/g)) {
      out.push({ code: mm[1], ghi_chu_dong: comment });
    }
  }
  return out;
}

function isMauQuyTacMacDinhOff(maLuat, patterns) {
  const ma = chuanHoaKhoaMaLuatOnOff(maLuat);
  if (!ma) return false;
  return patterns.some((patternRaw) => {
    const pattern = normalizeCodeOnOff(patternRaw);
    if (!pattern) return false;
    if (pattern.endsWith('*')) return ma.startsWith(chuanHoaKhoaMaLuatOnOff(pattern.slice(0, -1)));
    return ma === chuanHoaKhoaMaLuatOnOff(pattern);
  });
}

function isTatCungOff(maLuat, tatCung) {
  const m = chuanHoaKhoaMaLuatOnOff(maLuat);
  if (!m) return false;
  return tatCung.some((x) => chuanHoaKhoaMaLuatOnOff(x) === m);
}

/** Dòng một rule trong CACHE (có MA_LUAT + TRANG_THAI cùng dòng). */
function parseHardcodedLine(line, nguon) {
  if (!line.includes('MA_LUAT:') || !line.includes('TRANG_THAI:')) return null;
  const idM = line.match(/id:\s*'([^']+)'/);
  const maM = line.match(/MA_LUAT:\s*'([^']+)'/);
  const tenM = line.match(/TEN_QUY_TAC:\s*`([^`]*)`/);
  const ttM = line.match(/TRANG_THAI:\s*'([^']+)'/);
  if (!maM || !ttM) return null;
  const trangThai = normalizeCodeOnOff(ttM[1]) === 'OFF' ? 'OFF' : 'ON';
  return {
    nguon,
    id: idM?.[1] ?? '',
    ma_luat: maM[1],
    ten: (tenM?.[1] ?? '').replace(/\s+/g, ' ').trim() || '(không tên)',
    trang_thai_nguon: trangThai,
  };
}

function walkJsx(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walkJsx(p, acc);
    else if (name.endsWith('.jsx')) acc.push(p);
  }
  return acc;
}

/** Cân bằng { } có bỏ qua { } nằm trong chuỗi JSON "..." */
function sliceBalancedJsonObject(text, openBraceIdx) {
  let depth = 0;
  let inString = false;
  let escape = false;
  for (let i = openBraceIdx; i < text.length; i++) {
    const c = text[i];
    if (inString) {
      if (escape) {
        escape = false;
      } else if (c === '\\') {
        escape = true;
      } else if (c === '"') {
        inString = false;
      }
      continue;
    }
    if (c === '"') {
      inString = true;
      continue;
    }
    if (c === '{') depth++;
    if (c === '}') {
      depth--;
      if (depth === 0) return text.slice(openBraceIdx, i + 1);
    }
  }
  return null;
}

/** Trích các object JSON trong mảng export const NAME = [ ... ]; */
function extractSeedObjects(filePath, exportName) {
  const text = fs.readFileSync(filePath, 'utf8');
  const startMarker = `export const ${exportName} = [`;
  const start = text.indexOf(startMarker);
  if (start === -1) return [];
  let i = start + startMarker.length;
  const out = [];
  while (i < text.length) {
    const ch = text[i];
    if (ch === ']' || ch === ';') break;
    if (ch === ',' || /\s/.test(ch)) {
      i++;
      continue;
    }
    if (ch !== '{') {
      i++;
      continue;
    }
    const block = sliceBalancedJsonObject(text, i);
    if (!block) break;
    const maM = block.match(/"MA_LUAT"\s*:\s*"([^"]+)"/);
    const ttM = block.match(/"TRANG_THAI"\s*:\s*"(ON|OFF)"/);
    const idM = block.match(/"id"\s*:\s*"([^"]+)"/);
    const tenM = block.match(/"TEN_QUY_TAC"\s*:\s*"([^"]*)"/);
    let canhBao = '';
    try {
      const o = JSON.parse(block);
      canhBao = String(o.CANH_BAO || o.canh_bao || '').replace(/\s+/g, ' ').trim();
    } catch {
      const cbM = block.match(/"CANH_BAO"\s*:\s*"((?:[^"\\]|\\.)*)"/);
      if (cbM) {
        try {
          canhBao = JSON.parse(`"${cbM[1].replace(/\\"/g, '"')}"`);
        } catch {
          canhBao = cbM[1].replace(/\s+/g, ' ').trim();
        }
      }
    }
    if (maM) {
      out.push({
        nguon: path.relative(ROOT, filePath).replace(/\\/g, '/'),
        id: idM?.[1] ?? '',
        ma_luat: maM[1],
        ten: (tenM?.[1] ?? '').replace(/\s+/g, ' ').trim() || '(không tên)',
        canh_bao: canhBao,
        trang_thai_nguon: ttM && ttM[1] === 'OFF' ? 'OFF' : 'ON',
      });
    }
    // Luôn tiến ít nhất 1 ký tự — tránh lặp vô hạn nếu block rỗng (lỗi không mong đợi).
    i += Math.max(1, block.length);
    if (out.length > 200000) throw new Error(`extractSeedObjects: quá nhiều mục trong ${filePath}`);
  }
  return out;
}

/** Trích TEN_QUY_TAC (backtick) và CANH_BAO sau mỗi MA_LUAT — hỗ trợ DIEU_KIEN nhiều dòng. */
function enrichLookupFromHardcodedJsx(text, nguon, map) {
  const re = /MA_LUAT:\s*'([^']+)'/g;
  let m;
  while ((m = re.exec(text))) {
    const ma = m[1];
    const from = m.index;
    const chunk = text.slice(from, from + 180000);
    const tenM = chunk.match(/TEN_QUY_TAC:\s*`([^`]*)`/);
    const cbM = chunk.match(/CANH_BAO:\s*`([\s\S]*?)`\s*,\s*TRANG_THAI\s*:/);
    const k = chuanHoaKhoaMaLuatOnOff(ma);
    if (!k) continue;
    const ten = (tenM?.[1] ?? '').replace(/\s+/g, ' ').trim();
    const canh_bao = (cbM?.[1] ?? '').replace(/\s+/g, ' ').trim();
    const prev = map.get(k) || {};
    if (!canh_bao && !ten) continue;
    map.set(k, {
      ma_luat: ma,
      ten: ten || prev.ten || '',
      canh_bao: canh_bao || prev.canh_bao || '',
      nguon: canh_bao || ten ? nguon : prev.nguon || nguon,
    });
  }
}

function buildRuleMetaMap(seedAll, dvktRows, jsxFilesHardcoded) {
  const map = new Map();
  const put = (ma, rec) => {
    const k = chuanHoaKhoaMaLuatOnOff(ma);
    if (!k) return;
    const prev = map.get(k) || {};
    map.set(k, {
      ma_luat: ma,
      ten: rec.ten || prev.ten || '',
      canh_bao: rec.canh_bao || prev.canh_bao || '',
      nguon: rec.nguon || prev.nguon || '',
    });
  };
  for (const r of seedAll) put(r.ma_luat, r);
  for (const r of dvktRows) put(r.ma_luat, r);
  for (const file of [...jsxFilesHardcoded].sort()) {
    const rel = path.relative(ROOT, file).replace(/\\/g, '/');
    const text = fs.readFileSync(file, 'utf8');
    enrichLookupFromHardcodedJsx(text, rel, map);
  }
  return map;
}

function lookupRuleMeta(map, code) {
  const k = chuanHoaKhoaMaLuatOnOff(code);
  if (map.has(k)) return map.get(k);
  return null;
}

function formatPhan2ChiTiet(map, entries, tieuDePhan) {
  const lines = [];
  lines.push(tieuDePhan);
  lines.push('');
  let idx = 0;
  for (const { code, ghi_chu_dong } of entries) {
    idx += 1;
    const meta = lookupRuleMeta(map, code);
    lines.push(`--- [${idx}] Mã: ${code} ---`);
    if (ghi_chu_dong) {
      lines.push(`Ghi chú chính sách (trong quy_tac_on_off_noi_bo.jsx): ${ghi_chu_dong}`);
    }
    if (meta?.ten) {
      lines.push(`Tên quy tắc: ${meta.ten}`);
    } else {
      lines.push('Tên quy tắc: (không tìm thấy trong seed/hardcoded đã quét — có thể là mẫu BUILTIN hoặc mã chỉ dùng trong map ON/OFF)');
    }
    if (meta?.canh_bao) {
      lines.push(`Cảnh báo (CANH_BAO / ALERT_MESSAGE): ${meta.canh_bao}`);
    } else {
      lines.push('Cảnh báo: (chưa có trong dữ liệu luật đã nạp — kiểm tra màn Quản lý ON/OFF hoặc nguồn Excel)');
    }
    if (meta?.nguon) {
      lines.push(`Nguồn nội dung: ${meta.nguon}`);
    }
    lines.push('');
  }
  return lines;
}

function parseDvktOpRules() {
  const p = path.join(TIEN_ICH, 'dvkt_op_giam_dinh.jsx');
  const text = fs.readFileSync(p, 'utf8');
  const out = [];
  const re =
    /\{\s*RULE_CODE:\s*'([^']+)'\s*,\s*RULE_NAME:\s*'((?:[^'\\]|\\.)*)'\s*,\s*OPERATOR:\s*'[^']*'\s*,\s*STATUS:\s*'(ON|OFF)'\s*,\s*SEVERITY:\s*'[^']*'\s*,\s*ALERT_MESSAGE:\s*'((?:[^'\\]|\\.)*)'/g;
  let m;
  while ((m = re.exec(text))) {
    const alert = m[4].replace(/\\'/g, "'").replace(/\s+/g, ' ').trim();
    out.push({
      nguon: 'ma_nguon/tien_ich/dvkt_op_giam_dinh.jsx',
      id: m[1],
      ma_luat: m[1],
      ten: m[2].replace(/\\'/g, "'").replace(/\s+/g, ' ').trim(),
      canh_bao: alert,
      trang_thai_nguon: m[3],
    });
  }
  return out;
}

const NHOM_FILE = {
  'luat_cdha_hardcoded.jsx': { tab: 'LUAT_CDHA', ten: 'DVKT/CĐHA (bảng Excel CDHA_*)' },
  'luat_cong_kham_hardcoded.jsx': { tab: 'LUAT_CONG_KHAM', ten: 'Công khám (CK_*)' },
  'luat_giuong_hardcoded.jsx': { tab: 'LUAT_GIUONG', ten: 'Giường (GB_*)' },
  'luat_hop_dong_hardcoded.jsx': { tab: 'LUAT_HOP_DONG', ten: 'Hợp đồng (HD_*)' },
  'luat_nhan_su_hardcoded.jsx': { tab: 'LUAT_NHAN_SU', ten: 'Nhân sự (NS_*)' },
  'luat_giam_dinh_chuyen_de_hardcoded.jsx': { tab: 'LUAT_CDHA', ten: 'Giám định chuyên đề (Chuyen_de_* / CHUYEN_DE_*)' },
};

const NHOM_SEED = {
  du_lieu_luat_du_lieu_muc1: { tab: 'LUAT_DU_LIEU', export: 'DU_LIEU_SEED_LUAT_DU_LIEU_MUC1', ten: 'Cấu trúc / luật dữ liệu (XML_*, STRUCT_*)' },
  du_lieu_luat_hanh_chinh_muc2: { tab: 'LUAT_HANH_CHINH', export: 'DU_LIEU_SEED_LUAT_HANH_CHINH_MUC2', ten: 'Hành chính (HC-*)' },
  du_lieu_luat_thuoc_muc8: { tab: 'LUAT_THUOC', export: 'DU_LIEU_SEED_LUAT_THUOC_MUC8', ten: 'Thuốc seed (THUOC_*)' },
  du_lieu_luat_pttt_muc11: { tab: 'LUAT_PTTT', export: 'DU_LIEU_SEED_LUAT_PTTT_MUC11', ten: 'PTTT seed (CLN-PTTT / liên quan)' },
};

function main() {
  const qPath = path.join(TIEN_ICH, 'quy_tac_on_off_noi_bo.jsx');
  const qText = fs.readFileSync(qPath, 'utf8');
  const mauMacDinhOffEntries = extractFreezeStringArrayWithLineComments(qText, 'DANH_SACH_MAU_QUY_TAC_MAC_DINH_OFF');
  const mauMacDinhOff = mauMacDinhOffEntries.map((e) => e.code);
  const tatCungEntries = extractFreezeStringArrayWithLineComments(qText, 'DANH_SACH_QUY_TAC_TAT_CUNG');
  const tatCungOff = tatCungEntries.map((e) => e.code);

  const lines = [];
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
  lines.push('══════════════════════════════════════════════════════════════════════════════');
  lines.push('BÁO CÁO THỰC TRẠNG HỆ THỐNG QUY TẮC CDSS BHYT (TỔNG HỢP TỪ MÃ NGUỒN)');
  lines.push(`Sinh tự động: ${now}`);
  lines.push(`Repo: ${ROOT}`);
  lines.push('');
  lines.push('--- ĐỊNH NGHĨA DÙNG TRONG BÁO CÁO ---');
  lines.push('- "Trạng thái trong mã": TRANG_THAI ghi trong file .jsx (ON/OFF).');
  lines.push('- "Hiệu lực mặc định (khi chưa ghi đè ON/OFF người dùng)": ON nếu trong mã là ON, KHÔNG thuộc danh sách mặc định OFF, KHÔNG thuộc danh sách tắt cứng.');
  lines.push('- "Mặc định OFF (rủi ro dương giả / nhiễu)": mã nằm trong DANH_SACH_MAU_QUY_TAC_MAC_DINH_OFF — ứng dụng coi OFF cho đến khi người dùng bật trong màn hình Quản lý ON/OFF.');
  lines.push('- "Tắt cứng": mã trong DANH_SACH_QUY_TAC_TAT_CUNG — luôn OFF (không cho bật lại qua UI).');
  lines.push('- "Placeholder chuyên đề": DIEU_KIEN placeholder XML130 — đồng bộ registry scripts/chuyen_de_placeholder_registry.json (đếm chính thức ở Phần A).');
  lines.push('- "Rủi ro âm giả": quy tắc phụ thuộc heuristic/tên DVKT/dữ liệu thiếu trong XML130; không có danh sách mã tự động — mô tả định tính ở Phần E.');
  lines.push('');

  const hardcodedAll = [];
  const jsxFilesHardcoded = walkJsx(TIEN_ICH).filter((f) => {
    const b = path.basename(f);
    return Object.keys(NHOM_FILE).includes(b);
  });
  for (const file of jsxFilesHardcoded.sort()) {
    const base = path.basename(file);
    const meta = NHOM_FILE[base];
    const rel = path.relative(ROOT, file).replace(/\\/g, '/');
    const text = fs.readFileSync(file, 'utf8');
    for (const line of text.split(/\r?\n/)) {
      const r = parseHardcodedLine(line, rel);
      if (r) {
        hardcodedAll.push({ ...r, tab_id: meta.tab, nhom_ten: meta.ten });
      }
    }
  }

  const seedAll = [];
  for (const [fname, meta] of Object.entries(NHOM_SEED)) {
    const fp = path.join(TIEN_ICH, `${fname}.jsx`);
    if (!fs.existsSync(fp)) continue;
    const rows = extractSeedObjects(fp, meta.export);
    for (const r of rows) {
      seedAll.push({ ...r, tab_id: meta.tab, nhom_ten: meta.ten });
    }
  }

  const dvktRows = parseDvktOpRules();
  for (const r of dvktRows) {
    hardcodedAll.push({
      ...r,
      tab_id: 'LUAT_CDHA',
      nhom_ten: 'DVKT-OP (toán tử trong mã — DVKT-OP-*)',
    });
  }

  const ruleMetaMap = buildRuleMetaMap(seedAll, dvktRows, jsxFilesHardcoded);

  const tatCa = [...hardcodedAll, ...seedAll];

  const demTheoTab = {};
  for (const r of tatCa) {
    const t = r.tab_id || 'KHAC';
    demTheoTab[t] = (demTheoTab[t] || 0) + 1;
  }

  let demOnNguon = 0;
  let demOffNguon = 0;
  let demHieuLucMacDinh = 0;
  let demOnNguonNhungKhongHieuLuc = 0;

  const chiTietTheoNhom = {};

  function bucket(r) {
    const key = `${r.tab_id} — ${r.nhom_ten}`;
    if (!chiTietTheoNhom[key]) chiTietTheoNhom[key] = [];
    chiTietTheoNhom[key].push(r);
  }

  for (const r of tatCa) {
    if (r.trang_thai_nguon === 'ON') demOnNguon++;
    else demOffNguon++;

    const ma = r.ma_luat;
    const tat = isTatCungOff(ma, tatCungOff);
    const mauOff = isMauQuyTacMacDinhOff(ma, mauMacDinhOff);
    const hieuLuc =
      r.trang_thai_nguon === 'ON' && !tat && !mauOff;

    if (hieuLuc) demHieuLucMacDinh++;
    if (r.trang_thai_nguon === 'ON' && !hieuLuc) demOnNguonNhungKhongHieuLuc++;

    bucket({ ...r, _tat_cung: tat, _mau_off: mauOff, _hieu_luc_md: hieuLuc });
  }

  const reg = JSON.parse(fs.readFileSync(REG_PLACEHOLDER, 'utf8'));
  const placeholderCount = reg.placeholder_count ?? (reg.rule_ids?.length ?? 0);

  lines.push('══════════════════════════════════════════════════════════════════════════════');
  lines.push('PHẦN 1 — TỔNG QUAN SỐ LIỆU');
  lines.push('══════════════════════════════════════════════════════════════════════════════');
  lines.push(`Tổng số quy tắc đếm được (mỗi mã một dòng trong bảng chi tiết): ${tatCa.length}`);
  lines.push(`  - Trong đó ghi TRANG_THAI=ON trong mã nguồn: ${demOnNguon}`);
  lines.push(`  - Trong đó ghi TRANG_THAI=OFF trong mã nguồn: ${demOffNguon}`);
  lines.push('');
  lines.push(`Hiệu lực mặc định (ON trong mã, không mặc định OFF, không tắt cứng): ${demHieuLucMacDinh}`);
  lines.push(`Trạng thái ON trong mã nhưng không hiệu lực mặc định (mặc định OFF hoặc tắt cứng): ${demOnNguonNhungKhongHieuLuc}`);
  lines.push('');
  lines.push(`Số quy tắc chuyên đề placeholder (registry): ${placeholderCount}`);
  lines.push(`Số mã trong DANH_SACH_MAU_QUY_TAC_MAC_DINH_OFF: ${mauMacDinhOff.length}`);
  lines.push(`Số mã trong DANH_SACH_QUY_TAC_TAT_CUNG: ${tatCungOff.length}`);
  lines.push('');

  lines.push('--- Phân bổ theo tab (TAB_ID) ---');
  const tabs = Object.keys(demTheoTab).sort();
  for (const t of tabs) {
    lines.push(`  ${t}: ${demTheoTab[t]} quy tắc`);
  }
  lines.push('');

  lines.push('══════════════════════════════════════════════════════════════════════════════');
  lines.push('PHẦN 2 — NHÓM DỄ DƯƠNG GIẢ (CHÍNH SÁCH MẶC ĐỊNH OFF / GHI CHÚ TRONG MÃ)');
  lines.push('══════════════════════════════════════════════════════════════════════════════');
  lines.push(
    'Mỗi mục gồm: mã trong danh sách, ghi chú chính sách cùng dòng (//) trong ma_nguon/tien_ich/quy_tac_on_off_noi_bo.jsx (nếu có),'
  );
  lines.push('tên quy tắc và nội dung cảnh báo lấy từ TEN_QUY_TAC / CANH_BAO (hoặc ALERT_MESSAGE với DVKT-OP-*).');
  lines.push('');
  lines.push(
    ...formatPhan2ChiTiet(
      ruleMetaMap,
      mauMacDinhOffEntries,
      '2A — Mặc định OFF (DANH_SACH_MAU_QUY_TAC_MAC_DINH_OFF): có thể bật lại trong màn hình Quản lý ON/OFF.'
    )
  );
  lines.push('──────────────────────────────────────────────────────────────────────────────');
  lines.push(
    ...formatPhan2ChiTiet(
      ruleMetaMap,
      tatCungEntries,
      '2B — Tắt cứng (DANH_SACH_QUY_TAC_TAT_CUNG): không cho bật lại qua UI.'
    )
  );

  lines.push('══════════════════════════════════════════════════════════════════════════════');
  lines.push('PHẦN 3 — NHÓM RỦI RO ÂM GIẢ (ĐỊNH TÍNH)');
  lines.push('══════════════════════════════════════════════════════════════════════════════');
  lines.push('- Giám định chuyên đề: nhiều DIEU_KIEN dùng heuristic tên DVKT/thuốc trên XML3/XML2; thiếu trường hoặc tên không chuẩn → dễ bỏ sót (âm giả). Xem phần đầu file ma_nguon/tien_ich/luat_giam_dinh_chuyen_de_hardcoded.jsx.');
  lines.push('- Quy tắc phụ thuộc hợp đồng BHXH, đăng ký SYT, đa cơ sở, giấy tờ ngoài XML130: thường ở trạng thái placeholder hoặc cần map mở rộng — âm giả khi chỉ nhìn XML.');
  lines.push('- DVKT-OP: kiểm tra phạm vi hành nghề, thiết bị, mapping nhân sự — thiếu danh mục nền tại BV → âm giả.');
  lines.push('');

  lines.push('══════════════════════════════════════════════════════════════════════════════');
  lines.push('PHẦN 4 — PLACEHOLDER CHUYÊN ĐỀ (REGISTRY)');
  lines.push('══════════════════════════════════════════════════════════════════════════════');
  lines.push(JSON.stringify(reg, null, 2));
  lines.push('');

  lines.push('══════════════════════════════════════════════════════════════════════════════');
  lines.push('PHẦN 5 — CHI TIẾT THEO NHÓM (TỪNG MÃ)');
  lines.push('══════════════════════════════════════════════════════════════════════════════');

  const keys = Object.keys(chiTietTheoNhom).sort((a, b) => a.localeCompare(b, 'vi'));
  for (const key of keys) {
    const rows = chiTietTheoNhom[key].sort((a, b) =>
      String(a.ma_luat).localeCompare(String(b.ma_luat), 'vi', { numeric: true })
    );
    lines.push('');
    lines.push(`--- ${key} (${rows.length} quy tắc) ---`);
    for (const r of rows) {
      const flags = [];
      if (r._mau_off) flags.push('mặc định OFF');
      if (r._tat_cung) flags.push('tắt cứng');
      if (r._hieu_luc_md) flags.push('hiệu lực MD');
      const flagStr = flags.length ? ` [${flags.join('; ')}]` : '';
      lines.push(`  ${r.ma_luat} | nguồn: ${r.nguon} | mã: ${r.trang_thai_nguon}${flagStr}`);
      lines.push(`    ${r.ten}`);
    }
  }

  lines.push('');
  lines.push('══════════════════════════════════════════════════════════════════════════════');
  lines.push('HẾT BÁO CÁO');
  lines.push('══════════════════════════════════════════════════════════════════════════════');

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, lines.join('\n'), 'utf8');
  console.log(`Đã ghi ${path.relative(ROOT, OUT)} (${lines.length} dòng).`);
}

main();
