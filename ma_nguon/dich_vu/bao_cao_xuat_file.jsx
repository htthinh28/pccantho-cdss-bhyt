/**
 * Xuất Excel (đa sheet) và in / PDF từ dữ liệu bảng báo cáo.
 */

import {
  cacheDirectory,
  EncodingType,
  writeAsStringAsync,
} from 'expo-file-system/legacy';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Alert, Platform } from 'react-native';
import JSZip from 'jszip';
import * as XLSX from 'xlsx';

const chuanTenSheet = (raw) => {
  let s = String(raw || 'Sheet')
    .replace(/[:\\/?*[\]]/g, '_')
    .replace(/\s+/g, '_')
    .trim();
  if (!s) s = 'Sheet';
  return s.slice(0, 31);
};

const giaTriO = (v) => {
  if (v === null || v === undefined) return '';
  if (typeof v === 'boolean') return v ? 'co' : 'khong';
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
};

const csvEscapeCell = (v) => {
  const s = giaTriO(v);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
};

const hangSangDoiTuong = (columns, row) => {
  const o = {};
  columns.forEach((c) => {
    o[c.label] = giaTriO(row[c.key]);
  });
  return o;
};

const taoWorkbookTuSheets = (sheets) => {
  const wb = XLSX.utils.book_new();
  const used = new Set();

  for (const sh of sheets || []) {
    const cols = sh.columns || [];
    const rows = Array.isArray(sh.rows) ? sh.rows : [];
    const data = rows.length ? rows.map((r) => hangSangDoiTuong(cols, r)) : [{}];
    const header = cols.map((c) => c.label);
    if (!rows.length && cols.length) {
      cols.forEach((c) => {
        data[0][c.label] = '';
      });
    }
    let base = chuanTenSheet(sh.sheetName);
    let name = base;
    let i = 1;
    while (used.has(name)) {
      const suf = `_${i}`;
      name = `${base.slice(0, Math.max(1, 31 - suf.length))}${suf}`;
      i += 1;
    }
    used.add(name);
    const ws = XLSX.utils.json_to_sheet(data, { header });
    XLSX.utils.book_append_sheet(wb, ws, name);
  }
  return wb;
};

const thongBao = (tieuDe, noiDung) => {
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.alert) {
    window.alert(`${tieuDe}\n${noiDung}`);
    return;
  }
  Alert.alert(tieuDe, noiDung);
};

/**
 * @param {Array<{ sheetName: string, columns: {key:string,label:string}[], rows: object[] }>} sheets
 * @param {string} fileBase
 */
export const xuatExcelBaoCao = async (sheets, fileBase = 'BaoCao_CDSS_BHYT') => {
  if (!sheets?.length) {
    thongBao('Xuất Excel', 'Không có dữ liệu để xuất.');
    return;
  }
  const wb = taoWorkbookTuSheets(sheets);
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '').replace('T', '_');
  const fname = `${fileBase}_${stamp}.xlsx`;

  try {
    if (Platform.OS === 'web') {
      XLSX.writeFile(wb, fname);
      thongBao('Xuất Excel', `Đã tải xuống: ${fname}`);
      return;
    }
    const b64 = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
    const baseDir = cacheDirectory || '';
    const uri = `${baseDir}${fname}`;
    await writeAsStringAsync(uri, b64, {
      encoding: EncodingType.Base64,
    });
    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(uri, {
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        dialogTitle: fname,
      });
    } else {
      thongBao('Xuất Excel', `Đã ghi file: ${uri}`);
    }
  } catch (e) {
    thongBao('Lỗi xuất Excel', e?.message || String(e));
  }
};

/**
 * Xuất ZIP chứa nhiều CSV UTF-8 BOM — phục vụ BI (đặc tả 5.3).
 * @param {Array<{ sheetName: string, columns: {key:string,label:string}[], rows: object[] }>} sheets
 * @param {string} fileBase
 */
export const xuatZipCsvBaoCao = async (sheets, fileBase = 'BaoCao_CDSS_CSV') => {
  if (!sheets?.length) {
    thongBao('Xuất ZIP CSV', 'Không có dữ liệu để xuất.');
    return;
  }
  const zip = new JSZip();
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '').replace('T', '_');
  const fname = `${fileBase}_${stamp}.zip`;

  for (const sh of sheets || []) {
    const cols = sh.columns || [];
    const rows = Array.isArray(sh.rows) ? sh.rows : [];
    const header = cols.map((c) => csvEscapeCell(c.label)).join(',');
    const lines = [header];
    for (const row of rows) {
      lines.push(cols.map((c) => csvEscapeCell(row[c.key])).join(','));
    }
    const baseName = chuanTenSheet(sh.sheetName).replace(/\.+$/g, '') || 'Sheet';
    const body = `\uFEFF${lines.join('\r\n')}`;
    zip.file(`${baseName}.csv`, body);
  }

  try {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.Blob) {
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = fname;
      window.document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      thongBao('Xuất ZIP CSV', `Đã tải xuống: ${fname}`);
      return;
    }
    const b64 = await zip.generateAsync({ type: 'base64' });
    const baseDir = cacheDirectory || '';
    const uri = `${baseDir}${fname}`;
    await writeAsStringAsync(uri, b64, {
      encoding: EncodingType.Base64,
    });
    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(uri, {
        mimeType: 'application/zip',
        dialogTitle: fname,
      });
    } else {
      thongBao('Xuất ZIP CSV', `Đã ghi file: ${uri}`);
    }
  } catch (e) {
    thongBao('Lỗi xuất ZIP CSV', e?.message || String(e));
  }
};

/**
 * Snapshot JSON nhẹ (BI / audit) — không nhúng toàn bộ fact, kèm SPEC-VIZ và phiên bản M6–M8.
 * @param {{ nhanh: string, quanTriThe?: string, tai: object }} payload
 */
export const xuatJsonSnapshotBaoCao = async ({ nhanh, quanTriThe = '', tai = {} } = {}) => {
  const mh = tai?.moHinh;
  const doc = {
    phien_ban_snapshot: 'CDSS-BHYT-SNAPSHOT-3',
    thoi_diem_xuat: new Date().toISOString(),
    nhanh: String(nhanh || ''),
    quan_tri_the: String(quanTriThe || ''),
    so_ho_so: tai?.soHoSo ?? null,
    hien_thi_bao_cao: tai?.hienThi
      ? {
          phien_ban: tai.hienThi.phien_ban,
          tuong_thich_v1: tai.hienThi.tuong_thich_v1 ?? null,
          thoi_diem_du_lieu: tai.hienThi.thoi_diem_du_lieu,
          chu_ky_lam_moi_goi_y_ms: tai.hienThi.chu_ky_lam_moi_goi_y_ms,
          so_widget: (tai.hienThi.widgets || []).length,
          so_drill_registry: Array.isArray(tai.hienThi.drill_registry) ? tai.hienThi.drill_registry.length : 0,
          dataset_meta_viz_ids: tai.hienThi.dataset_meta_viz ? Object.keys(tai.hienThi.dataset_meta_viz) : [],
          theme_config_chuan: tai.hienThi.theme_config?.chuan_tiep_can_goi_y ?? null,
          goi_y_ai_bieu_do: tai.hienThi.goi_y_ai_bieu_do ?? null,
        }
      : null,
    tom_tat_mo_hinh_muc5: mh
      ? {
          so_fact_ho_so: (mh.fact_ho_so || []).length,
          so_fact_dong: (mh.fact_dong_chi_phi || []).length,
          so_fact_canh: (mh.fact_canh_bao || []).length,
        }
      : null,
    tom_tat_muc6: tai?.muc6
      ? {
          phien_ban: tai.muc6.phien_ban,
          so_dong_qt04_rule: (tai.muc6.bc_qt_04_top10_rule || []).length,
          so_dong_qt04_khoa: (tai.muc6.bc_qt_04_top10_khoa || []).length,
        }
      : null,
    tom_tat_muc7: tai?.muc7
      ? {
          phien_ban: tai.muc7.phien_ban,
          so_dong_bc_cm_00_nhom: (tai.muc7.bc_cm_00_nhom_vi_pham || []).length,
          so_dong_bc_cm_00_khoa_nhom: (tai.muc7.bc_cm_00_khoa_nhom_loi || []).length,
        }
      : null,
    tom_tat_muc8: tai?.muc8
      ? {
          phien_ban: tai.muc8.phien_ban,
          so_dong_dt02: (tai.muc8.bc_dt_02_top100 || []).length,
          so_thang_dt05: (tai.muc8.bc_dt_05_thang || []).length,
        }
      : null,
    ghi_chu:
      'Snapshot-3: meta SPEC-VIZ-2.0.3 (drill_registry, dataset_meta_viz_ids). Excel/ZIP/CSV cho fact (MAX_FACT_DONG_XUAT). Victory Skia: dev build.',
  };
  const json = `${JSON.stringify(doc, null, 2)}\n`;
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '').replace('T', '_');
  const fname = `BaoCao_CDSS_snapshot_${stamp}.json`;

  try {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.Blob) {
      const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = fname;
      window.document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      thongBao('Snapshot JSON', `Đã tải xuống: ${fname}`);
      return;
    }
    const baseDir = cacheDirectory || '';
    const uri = `${baseDir}${fname}`;
    await writeAsStringAsync(uri, json, { encoding: EncodingType.UTF8 });
    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(uri, {
        mimeType: 'application/json',
        dialogTitle: fname,
      });
    } else {
      thongBao('Snapshot JSON', `Đã ghi: ${uri}`);
    }
  } catch (e) {
    thongBao('Lỗi snapshot JSON', e?.message || String(e));
  }
};

const escapeHtml = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const taoHtmlBaoCao = (sheets, tieuDe, tuyChon = {}) => {
  const thoiDiemIso = tuyChon.thoiDiemXuatIso || new Date().toISOString();
  const css = `
    * { box-sizing: border-box; }
    body { font-family: 'Segoe UI', Roboto, Arial, sans-serif; color: #0f172a; padding: 16px; background: #f8fafc; }
    h1 { font-size: 18px; margin: 0 0 8px; color: #0f172a; }
    .meta { font-size: 12px; color: #64748b; margin-bottom: 8px; }
    .meta-xuat { font-size: 11px; color: #475569; font-weight: 600; margin-bottom: 20px; padding: 8px 10px; background: #f1f5f9; border-radius: 8px; border: 1px solid #e2e8f0; }
    h2 { font-size: 14px; margin: 20px 0 8px; color: #1d4ed8; border-bottom: 2px solid #e2e8f0; padding-bottom: 4px; }
    table { border-collapse: collapse; width: 100%; font-size: 10px; margin-bottom: 12px; background: #fff; }
    thead { display: table-header-group; }
    th, td { border: 1px solid #cbd5e1; padding: 6px 8px; text-align: left; vertical-align: top; }
    th { background: #1e40af; color: #fff; font-weight: 600; }
    tr:nth-child(even) td { background: #f1f5f9; }
    tr { page-break-inside: avoid; }
    @media print {
      body { background: #fff; }
      h2 { break-after: avoid; }
      table { break-inside: auto; }
      thead { display: table-header-group; }
    }
  `;
  let body = `<h1>${escapeHtml(tieuDe)}</h1><div class="meta">CDSS BHYT — ${escapeHtml(new Date().toLocaleString('vi-VN'))}</div>`;
  body += `<div class="meta-xuat">Thời điểm xuất báo cáo (ISO 8601): ${escapeHtml(thoiDiemIso)} — hồ sơ lưu trữ / in chuẩn y khoa.</div>`;
  for (const sh of sheets || []) {
    const cols = sh.columns || [];
    const rows = Array.isArray(sh.rows) ? sh.rows : [];
    body += `<h2>${escapeHtml(sh.sheetName)}</h2>`;
    if (sh.exportNote) body += `<p class="meta">${escapeHtml(sh.exportNote)}</p>`;
    body += '<table><thead><tr>';
    cols.forEach((c) => {
      body += `<th>${escapeHtml(c.label)}</th>`;
    });
    body += '</tr></thead><tbody>';
    for (const row of rows) {
      body += '<tr>';
      cols.forEach((c) => {
        body += `<td>${escapeHtml(giaTriO(row[c.key]))}</td>`;
      });
      body += '</tr>';
    }
    body += '</tbody></table>';
  }
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>${escapeHtml(tieuDe)}</title><style>${css}</style></head><body>${body}</body></html>`;
};

/**
 * Web: hop in trinh duyet. Native: tao PDF va chia se (in qua he thong).
 */
export const inHoacChiaSePdfBaoCao = async (sheets, tieuDe = 'Bao cao CDSS BHYT') => {
  if (!sheets?.length) {
    thongBao('In / PDF', 'Không có dữ liệu.');
    return;
  }
  const thoiDiemXuatIso = new Date().toISOString();
  const html = taoHtmlBaoCao(sheets, tieuDe, { thoiDiemXuatIso });
  try {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const w = window.open('', '_blank');
      if (w) {
        w.document.open();
        w.document.write(html);
        w.document.close();
        w.focus();
        setTimeout(() => {
          try {
            w.print();
          } catch (_) {
            /* ignore */
          }
        }, 300);
      } else {
        thongBao('In', 'Trình duyệt chặn cửa sổ popup — hãy cho phép popup.');
      }
      return;
    }
    const { uri } = await Print.printToFileAsync({ html });
    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        UTI: 'com.adobe.pdf',
        dialogTitle: `${tieuDe.replace(/\s+/g, '_')}.pdf`,
      });
    } else {
      thongBao('PDF', uri);
    }
  } catch (e) {
    thongBao('Lỗi in / PDF', e?.message || String(e));
  }
};
