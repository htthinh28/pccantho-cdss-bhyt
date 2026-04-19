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

const escapeHtml = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const taoHtmlBaoCao = (sheets, tieuDe) => {
  const css = `
    * { box-sizing: border-box; }
    body { font-family: 'Segoe UI', Roboto, Arial, sans-serif; color: #0f172a; padding: 16px; background: #f8fafc; }
    h1 { font-size: 18px; margin: 0 0 8px; color: #0f172a; }
    .meta { font-size: 12px; color: #64748b; margin-bottom: 20px; }
    h2 { font-size: 14px; margin: 20px 0 8px; color: #1d4ed8; border-bottom: 2px solid #e2e8f0; padding-bottom: 4px; }
    table { border-collapse: collapse; width: 100%; font-size: 10px; margin-bottom: 12px; background: #fff; }
    th, td { border: 1px solid #cbd5e1; padding: 6px 8px; text-align: left; vertical-align: top; }
    th { background: #1e40af; color: #fff; font-weight: 600; }
    tr:nth-child(even) td { background: #f1f5f9; }
    @media print { body { background: #fff; } h2 { break-after: avoid; } table { break-inside: avoid; } }
  `;
  let body = `<h1>${escapeHtml(tieuDe)}</h1><div class="meta">CDSS BHYT — ${escapeHtml(new Date().toLocaleString('vi-VN'))}</div>`;
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
  const html = taoHtmlBaoCao(sheets, tieuDe);
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
