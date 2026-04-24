/**
 * Trợ lý tri thức nội bộ: tìm kiếm + trích đoạn từ thư viện tai_lieu (manifest)
 * và bản ghi tri thức tích lũy — không gọi API / LLM bên ngoài.
 */
import { taoUrlMoTaiLieu } from './tai_lieu_url';

/** Sau chuẩn hóa bỏ dấu (token chỉ còn a-z) */
const TU_DUNG_BO_QUA = new Set([
  'va', 'cua', 'cho', 'la', 'co', 'khong', 'vi', 'theo', 'mot', 'cac', 'da', 'de', 'bi', 'hay', 'hoac',
  'tai', 'voi', 'nay', 'duoc', 'trong', 'khi', 'ma', 'neu', 'thi', 'cung', 'den', 'tu', 've',
]);

export const tachMaQuyTacTuCau = (text) => {
  const raw = String(text || '');
  const out = new Set();
  const re = /\b([A-Z]{2,}_[0-9]+|[A-Z]+-[A-Z]{2,}-[0-9]+|THUOC_\d+|DVKT[_-]?\d+|CK_\d+|HC[_-]?\d+|NS_\d+|PY_BATCH_\d+)\b/gi;
  let m;
  while ((m = re.exec(raw)) !== null) {
    const s = String(m[1] || m[0] || '').trim();
    if (s.length >= 4) out.add(s.toUpperCase());
  }
  return [...out];
};

export const chuanHoaToken = (text) => {
  const s = String(text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ');
  return s.split(/\s+/).filter((t) => t.length > 1 && !TU_DUNG_BO_QUA.has(t));
};

export const htmlSangVanBan = (html) => {
  let s = String(html || '');
  s = s.replace(/<script[\s\S]*?<\/script>/gi, ' ');
  s = s.replace(/<style[\s\S]*?<\/style>/gi, ' ');
  s = s.replace(/<br\s*\/?>/gi, '\n');
  s = s.replace(/<\/(p|div|h[1-6]|li|tr)>/gi, '\n');
  s = s.replace(/<[^>]+>/g, ' ');
  s = s.replace(/&nbsp;/gi, ' ');
  s = s.replace(/&amp;/g, '&');
  s = s.replace(/&lt;/g, '<');
  s = s.replace(/&gt;/g, '>');
  s = s.replace(/&quot;/g, '"');
  s = s.replace(/\s+\n/g, '\n');
  s = s.replace(/\n{3,}/g, '\n\n');
  return s.replace(/[ \t]{2,}/g, ' ').trim();
};

const tachChunk = (text, maxLen = 900) => {
  const t = String(text || '').trim();
  if (!t) return [];
  const paras = t.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const chunks = [];
  for (const p of paras) {
    if (p.length <= maxLen) {
      chunks.push(p);
      continue;
    }
    for (let i = 0; i < p.length; i += maxLen - 120) {
      chunks.push(p.slice(i, i + maxLen));
    }
  }
  return chunks.slice(0, 80);
};

const diemChunk = (chunk, tokens, maQuyTac) => {
  const c = String(chunk || '').toLowerCase();
  let score = 0;
  for (const tok of tokens) {
    if (!tok || tok.length < 2) continue;
    const n = c.split(tok).length - 1;
    if (n > 0) score += Math.log1p(n) * (tok.length > 4 ? 1.4 : 1);
  }
  for (const ma of maQuyTac) {
    const u = ma.toLowerCase();
    if (c.includes(u)) score += 18;
  }
  return score;
};

const chuanHoaSoSanh = (s) =>
  String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ');

/** Ưu tiên tài liệu phác đồ / chuyên môn / ICD trong thư viện (đường dẫn + tiêu đề). */
const diemUuTienPhacDoChuyenMon = (title, relPath) => {
  const raw = `${String(relPath || '')} ${String(title || '')}`;
  const h = raw.toLowerCase();
  const a = chuanHoaSoSanh(raw);
  let score = 0;
  if (h.includes('phac_do') || h.includes('phác đồ') || a.includes('phac do')) score += 14;
  if (h.includes('chuyen_mon') || h.includes('chuyên môn') || a.includes('chuyen mon')) score += 12;
  if (h.includes('icd') || h.includes('ICD')) score += 8;
  if (h.includes('cdss') && (h.includes('phac') || h.includes('phác'))) score += 6;
  if (h.includes('ebm') || h.includes('phac_do_cdss')) score += 5;
  return score;
};

const coTuKhoaLienQuanChuyenMon = (tokens) => {
  const k = new Set(['phac', 'do', 'chuyen', 'mon', 'icd', 'chan', 'dieu', 'tri', 'lam', 'sang', 'benh', 'mau', 'toa', 'thuoc', 'cdss', 'ebm']);
  return (tokens || []).some((t) => t && t.length >= 3 && k.has(t));
};

const chuanHoaCauTimThe = (s) =>
  String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/**
 * Thẻ nghiệp vụ khớp câu hỏi (từ khóa + mã quy tắc) — dùng cộng điểm ưu tiên tài liệu có `tags` trong manifest.
 * @param {string} cauHoi
 * @param {string[]} tokens — từ chuanHoaToken
 * @param {string[]} maQuyTac
 * @returns {Set<string>}
 */
export const thuThapTagTuCauHoi = (cauHoi, tokens, maQuyTac) => {
  const active = new Set();
  const hay = chuanHoaCauTimThe(cauHoi);
  const compact = hay.replace(/\s/g, '');

  const needleToTag = [
    ['thuoc', 'thuoc'],
    ['hoat chat', 'thuoc'],
    ['khang sinh', 'thuoc'],
    ['xml 2', 'thuoc'],
    ['xml2', 'thuoc'],
    ['tuong tac', 'tuong_tac_thuoc'],
    ['dvkt', 'dvkt'],
    ['cdha', 'dvkt'],
    ['cls', 'dvkt'],
    ['vtyt', 'vtyt'],
    ['pttt', 'pttt'],
    ['phau thuat', 'pttt'],
    ['the bhyt', 'hanh_chinh'],
    ['hanh chinh', 'hanh_chinh'],
    ['xml 1', 'hanh_chinh'],
    ['icd', 'icd_chuyen_mon'],
    ['phac do', 'icd_chuyen_mon'],
    ['chuyen mon', 'icd_chuyen_mon'],
    ['cv266', 'cv266'],
    ['nghi dinh', 'phap_ly'],
    ['the tri thuc', 'the_tri_thuc'],
    ['tro ly tri thuc', 'ai_huan_luyen'],
    ['thu vien', 'ai_huan_luyen'],
    ['chuyen de', 'xml_chuyen_de'],
    ['xml130', 'xml_chuyen_de'],
    ['4210', 'cau_truc_xml'],
    ['7464', 'cau_truc_xml'],
    ['cau truc xml', 'cau_truc_xml'],
    ['qd 4210', 'cau_truc_xml'],
  ];
  for (const [needle, tag] of needleToTag) {
    const n = needle.replace(/\s+/g, '');
    if (hay.includes(needle) || (n.length >= 4 && compact.includes(n))) active.add(tag);
  }

  const tokenMap = {
    thuoc: 'thuoc',
    dvkt: 'dvkt',
    vtyt: 'vtyt',
    pttt: 'pttt',
    icd: 'icd_chuyen_mon',
  };
  for (const t of tokens || []) {
    if (tokenMap[t]) active.add(tokenMap[t]);
  }

  for (const m of maQuyTac || []) {
    const u = String(m).toUpperCase();
    if (u.startsWith('THUOC') || u.startsWith('DM-THUOC') || u.startsWith('TUONGTAC')) active.add('thuoc');
    if (u.startsWith('DVKT') || u.startsWith('CDHA')) active.add('dvkt');
    if (u.includes('VTYT')) active.add('vtyt');
    if (u.startsWith('CK_') || u.startsWith('HC_') || u.startsWith('NS_')) active.add('hanh_chinh');
  }

  return active;
};

const diemTheTrenTaiLieu = (itemTags, activeTags) => {
  if (!activeTags?.size || !Array.isArray(itemTags) || !itemTags.length) return 0;
  let c = 0;
  for (const t of itemTags) {
    if (activeTags.has(t)) c += 1;
  }
  return c * 15;
};

const diemTieuDe = (title, relPath, tokens, maQuyTac) => {
  const haystack = chuanHoaSoSanh(`${String(title || '')} ${String(relPath || '')}`);
  let score = diemUuTienPhacDoChuyenMon(title, relPath);
  for (const tok of tokens) {
    if (tok && haystack.includes(tok)) score += 2.5;
  }
  for (const ma of maQuyTac) {
    const ml = ma.toLowerCase();
    if (haystack.includes(ml) || String(relPath || '').toLowerCase().includes(ml)) score += 25;
  }
  return score;
};

const diemTriThucBanGhi = (rec, tokens, maQuyTac) => {
  const blob = [
    rec.tom_tat,
    rec.bai_hoc,
    rec.ma_luat_goi_y,
    rec.ma_lk,
    rec.snapshot_loi,
  ]
    .filter(Boolean)
    .join('\n')
    .toLowerCase();
  let score = 0;
  for (const tok of tokens) {
    if (blob.includes(tok)) score += 1.2;
  }
  for (const ma of maQuyTac) {
    if (blob.includes(ma.toLowerCase())) score += 15;
  }
  return score;
};

/**
 * @param {object} params
 * @param {string} params.cauHoi
 * @param {Array} params.manifestItems — từ tai_lieu_manifest.json
 * @param {string} [params.generatedAt]
 * @param {Array} [params.triThucGiamDinh] — từ layDanhSachTriThucTuGiamDinh
 * @param {number} [params.gioiHanTaiFile] — số file HTML tối đa fetch
 */
export const traLoiTroLyTriThuc = async ({
  cauHoi,
  manifestItems = [],
  generatedAt = '',
  triThucGiamDinh = [],
  gioiHanTaiFile = 10,
}) => {
  const hoi = String(cauHoi || '').trim();
  const tokens = chuanHoaToken(hoi);
  const maQuyTac = tachMaQuyTacTuCau(hoi);
  const gioiHan = coTuKhoaLienQuanChuyenMon(tokens) ? Math.max(gioiHanTaiFile, 14) : gioiHanTaiFile;

  if (!hoi) {
    return {
      ok: false,
      loi: 'Vui lòng nhập câu hỏi hoặc mã quy tắc (ví dụ THUOC_417, CK_41).',
      markdown: '',
      nguon: [],
    };
  }

  const items = Array.isArray(manifestItems) ? manifestItems : [];
  const activeTags = thuThapTagTuCauHoi(hoi, tokens, maQuyTac);
  const scored = items
    .map((it) => ({
      it,
      score:
        diemTieuDe(it.title, it.relPath, tokens, maQuyTac) +
        diemTheTrenTaiLieu(it.tags, activeTags),
    }))
    .sort((a, b) => b.score - a.score);

  const chon = [];
  const seen = new Set();
  const pushItem = (row) => {
    const id = row?.it?.id || row?.it?.relPath;
    if (!id || seen.has(id)) return;
    seen.add(id);
    chon.push(row);
  };

  for (const row of scored) {
    if (row.score > 0 || maQuyTac.length) pushItem(row);
    if (chon.length >= gioiHan + 5) break;
  }
  for (const row of scored) {
    pushItem(row);
    if (chon.length >= gioiHan) break;
  }

  const trichTuTaiLieu = [];
  const nguon = [];

  for (const { it, score: titleScore } of chon.slice(0, gioiHan)) {
    const url = taoUrlMoTaiLieu(it.relPath);
    if (!url) continue;
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const html = await res.text();
      const plain = htmlSangVanBan(html);
      const chunks = tachChunk(plain);
      const ranked = chunks
        .map((ch, idx) => ({
          ch,
          idx,
          score: diemChunk(ch, tokens, maQuyTac) + (titleScore > 0 ? 0.5 : 0),
        }))
        .filter((x) => x.score > 0 || maQuyTac.length > 0)
        .sort((a, b) => b.score - a.score);

      const top = (ranked.length ? ranked : [{ ch: chunks[0] || plain.slice(0, 1200), score: 0 }]).slice(0, 2);

      for (const row of top) {
        if (!row.ch || row.ch.length < 20) continue;
        trichTuTaiLieu.push({
          loai: 'tai_lieu',
          tieuDe: it.title,
          duongDan: it.relPath,
          diem: row.score + titleScore * 0.1,
          doan: row.ch.length > 1600 ? `${row.ch.slice(0, 1600)}…` : row.ch,
        });
        nguon.push({ loai: 'Thư viện', tieuDe: it.title, file: it.relPath });
      }
    } catch {
      /* bỏ qua file lỗi mạng */
    }
  }

  trichTuTaiLieu.sort((a, b) => b.diem - a.diem);

  const triThucScored = (Array.isArray(triThucGiamDinh) ? triThucGiamDinh : [])
    .map((rec) => ({
      rec,
      score: diemTriThucBanGhi(rec, tokens, maQuyTac),
    }))
    .filter((x) => x.score > 0 || (maQuyTac.length && String(x.rec?.ma_luat_goi_y || '').length))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  const trichTriThuc = [];
  for (const { rec, score } of triThucScored) {
    const body = String(rec.bai_hoc || rec.tom_tat || '').trim();
    if (body.length < 15) continue;
    const snippet = body.length > 1400 ? `${body.slice(0, 1400)}…` : body;
    trichTriThuc.push({
      loai: 'tri_thuc_ca',
      tieuDe: rec.tom_tat || rec.ma_lk || 'Bản ghi',
      ma_lk: rec.ma_lk,
      ngay: rec.ngay_tao,
      diem: score,
      doan: snippet,
    });
    nguon.push({
      loai: 'Tri thức từ giám định (máy)',
      tieuDe: rec.tom_tat || rec.ma_lk || '—',
      file: rec.ma_lk ? `MA_LK ${rec.ma_lk}` : 'local',
    });
  }

  const doanDau = trichTuTaiLieu[0] || trichTriThuc[0];
  const tomTatYeuTo = doanDau
    ? String(doanDau.doan).replace(/\s+/g, ' ').trim().slice(0, 320)
    : '';

  const lines = [];
  lines.push('### Phân tích nhanh (từ dữ liệu có trong ứng dụng)');
  lines.push('');
  if (maQuyTac.length) {
    lines.push(`**Mã quy tắc / từ khóa kỹ thuật nhận diện:** ${maQuyTac.join(', ')}`);
    lines.push('');
  }
  if (tomTatYeuTo) {
    lines.push('**Đoạn liên quan nhất (trích):**');
    lines.push(`> ${tomTatYeuTo}${tomTatYeuTo.length >= 320 ? '…' : ''}`);
    lines.push('');
  } else {
    lines.push(
      '**Không tìm thấy đoạn khớp mạnh** trong các tài liệu đã đóng gói. Hãy thử thêm từ khóa tiếng Việt (ví dụ “công khám”, “thanh toán thuốc”), hoặc mã lỗi đúng như trên báo cáo giám định.',
    );
    lines.push('');
  }

  lines.push('#### Vì sao cần tra cứu (logic nghiệp vụ)');
  lines.push(
    '- Hệ thống CDSS so khớp dữ liệu XML với **bộ luật/quy tắc** và **tài liệu tri thức** đã cấu hình trong repo.',
  );
  lines.push(
    '- Trợ lý này **chỉ trích dẫn** văn bản đã có trong thư viện `tai_lieu/` (gồm thẻ phác đồ/chuyên môn/CDSS khi đã chuẩn bị), sau `npm run tai_lieu:prepare`, và các bản ghi “Tri thức từ giám định” bạn đã lưu — **không** lấy ý kiến từ Internet.',
  );
  if (generatedAt) {
    lines.push(`- **Nhãn thời điểm thư viện:** ${generatedAt} (cập nhật khi build/chuẩn bị tài liệu).`);
  }
  lines.push('');

  if (trichTuTaiLieu.length) {
    lines.push('#### Trích từ thư viện nội bộ');
    lines.push('');
    trichTuTaiLieu.slice(0, 6).forEach((x, i) => {
      lines.push(`${i + 1}. **${x.tieuDe}** (\`${x.duongDan}\`)`);
      lines.push('');
      lines.push(x.doan);
      lines.push('');
    });
  }

  if (trichTriThuc.length) {
    lines.push('#### Tri thức tích lũy từ giám định (trên máy)');
    lines.push('');
    trichTriThuc.forEach((x, i) => {
      lines.push(`${i + 1}. **${x.tieuDe}**${x.ma_lk ? ` · MA_LK \`${x.ma_lk}\`` : ''}${x.ngay ? ` · ${String(x.ngay).slice(0, 10)}` : ''}`);
      lines.push('');
      lines.push(x.doan);
      lines.push('');
    });
  }

  lines.push('---');
  lines.push('*Đây là trợ lý tra cứu & trích dẫn nội bộ; không thay cho văn bản pháp lý hoặc quyết định thanh toán của cơ quan BHXH.*');

  return {
    ok: true,
    markdown: lines.join('\n'),
    nguon: nguon.slice(0, 24),
    meta: {
      soTaiLieuDaQuet: Math.min(chon.length, gioiHan),
      soTriThuc: trichTriThuc.length,
      maQuyTac,
    },
  };
};
