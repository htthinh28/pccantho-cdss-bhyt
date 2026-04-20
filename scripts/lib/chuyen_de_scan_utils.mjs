/**
 * Quét tĩnh ma_nguon/tien_ich/luat_giam_dinh_chuyen_de_hardcoded.jsx (mỗi quy tắc một dòng).
 * @returns {{ id: string, maLuat: string | null, tenQuyTac: string | null, placeholder: boolean, placeholderKind: 'EXIT_AUDIT_BACKLOG'|'CHO_XU_LY_SAU'|null, trangThai: 'ON'|'OFF'|null }[]}
 */
export function scanChuyenDeRulesFromFile(srcPath, fs) {
  const lines = fs.readFileSync(srcPath, 'utf8').split(/\r?\n/);
  const out = [];
  for (const line of lines) {
    const idM = line.match(/id:\s*'(CHUYEN_DE-\d+)'/);
    if (!idM) continue;
    const id = idM[1];
    let placeholderKind = null;
    if (/DIEU_KIEN:\s*CHUYEN_DE_XML130_PLACEHOLDER_EXIT_AUDIT_BACKLOG\s*,/.test(line)) {
      placeholderKind = 'EXIT_AUDIT_BACKLOG';
    } else if (/DIEU_KIEN:\s*CHUYEN_DE_XML130_CHO_XU_LY_SAU\s*,/.test(line)) {
      placeholderKind = 'CHO_XU_LY_SAU';
    }
    const tm = line.match(/TRANG_THAI:\s*'(ON|OFF)'/);
    const maM = line.match(/MA_LUAT:\s*'(Chuyen_de_\d+)'/);
    const tenM = line.match(/TEN_QUY_TAC:\s*`([^`]*)`/);
    out.push({
      id,
      maLuat: maM ? maM[1] : null,
      tenQuyTac: tenM ? tenM[1] : null,
      placeholder: placeholderKind !== null,
      placeholderKind,
      trangThai: tm ? tm[1] : null,
    });
  }
  return out;
}

/** CHUYEN_DE-001 → CHUYEN_DE_001 (chuẩn hóa so khớp quy_tac_on_off_noi_bo). */
export function chuyenDeIdToNormalizedMa(id) {
  const n = id.replace(/^CHUYEN_DE-/, '');
  return `CHUYEN_DE_${n.padStart(3, '0')}`;
}
