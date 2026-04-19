/**
 * In / PDF từ bảng HTML dùng chung (danh mục, mapping, thư viện, quy tắc…).
 * Web: mở cửa sổ và gọi print. Native: expo-print → PDF + chia sẻ (in qua hệ thống).
 */

import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Alert, Platform } from 'react-native';

const thongBao = (title, msg) => {
  if (typeof Alert?.alert === 'function') Alert.alert(title, String(msg));
  else console.warn(title, msg);
};

/** Tên sheet / tiêu đề phụ (giới hạn an toàn cho Excel; dùng chung cho PDF). */
export const chuanTenSheetInAn = (raw) => {
  let s = String(raw || 'Sheet')
    .replace(/[:\\/?*[\]]/g, '_')
    .replace(/\s+/g, '_')
    .trim();
  if (!s) s = 'Sheet';
  return s.slice(0, 31);
};

const escapeHtml = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const giaTriO = (v) => {
  if (v === null || v === undefined) return '';
  if (typeof v === 'boolean') return v ? 'Có' : 'Không';
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
};

const taoHtmlTuBang = (sheets, tieuDe) => {
  const css = `
    * { box-sizing: border-box; }
    body { font-family: 'Segoe UI', Roboto, Arial, sans-serif; color: #0f172a; padding: 16px; background: #f8fafc; }
    h1 { font-size: 18px; margin: 0 0 8px; color: #0f172a; }
    .meta { font-size: 12px; color: #64748b; margin-bottom: 20px; }
    h2 { font-size: 14px; margin: 20px 0 8px; color: #1d4ed8; border-bottom: 2px solid #e2e8f0; padding-bottom: 4px; }
    table { border-collapse: collapse; width: 100%; font-size: 10px; margin-bottom: 12px; background: #fff; }
    th, td { border: 1px solid #cbd5e1; padding: 6px 8px; text-align: left; vertical-align: top; word-break: break-word; }
    th { background: #1e40af; color: #fff; font-weight: 600; }
    tr:nth-child(even) td { background: #f1f5f9; }
    @media print { body { background: #fff; } h2 { break-after: avoid; } table { break-inside: auto; } tr { break-inside: avoid; } }
  `;
  let body = `<h1>${escapeHtml(tieuDe)}</h1><div class="meta">CDSS BHYT — ${escapeHtml(new Date().toLocaleString('vi-VN'))}</div>`;
  for (const sh of sheets || []) {
    const cols = sh.columns || [];
    const rows = Array.isArray(sh.rows) ? sh.rows : [];
    body += `<h2>${escapeHtml(sh.sheetName || 'Bảng')}</h2>`;
    if (sh.exportNote) body += `<p class="meta">${escapeHtml(sh.exportNote)}</p>`;
    body += '<table><thead><tr>';
    cols.forEach((c) => {
      body += `<th>${escapeHtml(c.label ?? c.key)}</th>`;
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
 * @param {{ sheetName?: string, columns: { key: string, label?: string }[], rows: Record<string, unknown>[], exportNote?: string }[]} sheets
 * @param {string} [tieuDe]
 * @param {{ maxRowsPerSheet?: number }} [tuyChon] — cắt bớt dòng mỗi sheet để tránh HTML quá nặng
 */
export const inHoacChiaSePdfTuBang = async (sheets, tieuDe = 'Danh sách CDSS BHYT', tuyChon = {}) => {
  const maxRowsPerSheet = tuyChon.maxRowsPerSheet ?? 5000;
  if (!sheets?.length) {
    thongBao('In / PDF', 'Không có dữ liệu.');
    return;
  }
  const sheetsLimited = sheets.map((sh) => {
    const rows = Array.isArray(sh.rows) ? sh.rows : [];
    const sliced = rows.slice(0, maxRowsPerSheet);
    const ghiChuCat =
      rows.length > sliced.length
        ? `Chỉ in tối đa ${maxRowsPerSheet} dòng (${sliced.length}/${rows.length} dòng trong bảng này).`
        : '';
    return {
      ...sh,
      rows: sliced,
      exportNote: [sh.exportNote, ghiChuCat].filter(Boolean).join(' ') || undefined,
    };
  });

  const html = taoHtmlTuBang(sheetsLimited, tieuDe);
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
        dialogTitle: `${String(tieuDe).replace(/\s+/g, '_')}.pdf`,
      });
    } else {
      thongBao('PDF', uri);
    }
  } catch (e) {
    thongBao('Lỗi in / PDF', e?.message || String(e));
  }
};
