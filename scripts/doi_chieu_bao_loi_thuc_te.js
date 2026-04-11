#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const { Buffer } = require('buffer');
const { DOMParser } = require('@xmldom/xmldom');

const [claimPathArg, reportPathArg] = process.argv.slice(2);

if (!claimPathArg || !reportPathArg) {
  console.error('Usage: node scripts/doi_chieu_bao_loi_thuc_te.js <claim_xml130_path> <bao_cao_xlsx_path>');
  process.exit(1);
}

const claimPath = path.resolve(claimPathArg);
const reportPath = path.resolve(reportPathArg);

if (!fs.existsSync(claimPath)) {
  console.error(`Claim file not found: ${claimPath}`);
  process.exit(2);
}
if (!fs.existsSync(reportPath)) {
  console.error(`Report file not found: ${reportPath}`);
  process.exit(3);
}

const parseXml = (raw) => new DOMParser().parseFromString(String(raw || ''), 'text/xml');
const text = (node, tag) => {
  const n = node.getElementsByTagName(tag)[0];
  return n && n.textContent ? String(n.textContent).trim() : '';
};

const parseRows = (xmlRaw, rowTag) => {
  if (!xmlRaw || !String(xmlRaw).trim() || !rowTag) return [];
  const doc = parseXml(xmlRaw);
  if (!doc || typeof doc.getElementsByTagName !== 'function') return [];
  const list = doc.getElementsByTagName(rowTag);
  const out = [];
  for (let i = 0; i < list.length; i += 1) {
    const row = {};
    const children = list[i].childNodes || [];
    for (let j = 0; j < children.length; j += 1) {
      const c = children[j];
      if (c.nodeType !== 1) continue;
      const key = String(c.nodeName || '').trim();
      if (!key) continue;
      row[key] = String(c.textContent || '').trim();
    }
    out.push(row);
  }
  return out;
};

const toDate = (yyyymmddhhmm) => {
  const s = String(yyyymmddhhmm || '');
  if (!/^\d{12}$/.test(s)) return null;
  const y = Number(s.slice(0, 4));
  const m = Number(s.slice(4, 6)) - 1;
  const d = Number(s.slice(6, 8));
  const h = Number(s.slice(8, 10));
  const mm = Number(s.slice(10, 12));
  return new Date(y, m, d, h, mm, 0, 0);
};

const minutesDiff = (from, to) => {
  const a = toDate(from);
  const b = toDate(to);
  if (!a || !b) return null;
  return Math.round((b.getTime() - a.getTime()) / 60000);
};

const TAG_BY_XML = {
  XML1: 'TONG_HOP',
  XML2: 'CHI_TIET_THUOC',
  XML3: 'CHI_TIET_DVKT',
  XML4: 'CHI_TIET_CLS',
};

const outerRaw = fs.readFileSync(claimPath, 'utf8');
const outerDoc = parseXml(outerRaw);
const fileHoso = outerDoc.getElementsByTagName('FILEHOSO');

const decodedByLoai = {};
for (let i = 0; i < fileHoso.length; i += 1) {
  const loai = text(fileHoso[i], 'LOAIHOSO').toUpperCase();
  const b64 = text(fileHoso[i], 'NOIDUNGFILE');
  if (!loai || !b64) continue;
  decodedByLoai[loai] = Buffer.from(b64, 'base64').toString('utf8');
}

const xml1Rows = parseRows(decodedByLoai.XML1 || '', TAG_BY_XML.XML1);
const xml2Rows = parseRows(decodedByLoai.XML2 || '', TAG_BY_XML.XML2);
const xml3Rows = parseRows(decodedByLoai.XML3 || '', TAG_BY_XML.XML3);
const xml4Rows = parseRows(decodedByLoai.XML4 || '', TAG_BY_XML.XML4);
const hasXml5 = Boolean(decodedByLoai.XML5 && String(decodedByLoai.XML5).trim());
const hasXml7 = Boolean(decodedByLoai.XML7 && String(decodedByLoai.XML7).trim());
const hasXml8 = Boolean(decodedByLoai.XML8 && String(decodedByLoai.XML8).trim());

const xml1 = xml1Rows[0] || {};
const maLK = String(xml1.MA_LK || '');
const thoiGianNamVien = minutesDiff(xml1.NGAY_VAO, xml1.NGAY_RA);
const maThe = String(xml1.MA_THE_BHYT || '');
const mucThe = maThe.slice(2, 3);
const maBenhAll = `${xml1.MA_BENH_CHINH || ''};${xml1.MA_BENH_KT || ''}`.toUpperCase();
const giayChuyenTuyen = String(xml1.GIAY_CHUYEN_TUYEN || '').trim();
const maNoiDi = String(xml1.MA_NOI_DI || '').trim();
const maNoiDen = String(xml1.MA_NOI_DEN || '').trim();
const tongTienThuoc = Number(String(xml1.T_THUOC || '0').replace(',', '.')) || 0;
const maLoaiKcb = String(xml1.MA_LOAI_KCB || '').trim();
const maLoaiRv = String(xml1.MA_LOAI_RV || '').trim();
const laNoiTruHoacBanNgay = ['03', '09', '3', '9'].includes(maLoaiKcb);
const laSanKhoa = /(^|;)O[A-Z0-9.]*/.test(maBenhAll);

const reportWb = XLSX.readFile(reportPath);
const sheetName = reportWb.SheetNames[0];
const reportRows = XLSX.utils.sheet_to_json(reportWb.Sheets[sheetName], { defval: '' });
const reportByMaLK = reportRows.filter((r) => String(r['Mã LK'] || '').trim() === maLK);
const getRuleCode = (row) => String(row['Mã luật'] || row['Mã Luật'] || row['MA_LUAT'] || '').trim();
const getRuleName = (row) => String(row['Tên quy tắc'] || row['Quy Tắc'] || row['TEN_QUY_TAC'] || '').trim();

const hasI83orI80orE115 = /(^|;)I83(\.|;|$)|(^|;)I80(\.|;|$)|E11\.5/.test(maBenhAll);
const hasMRI = xml3Rows.some((r) => /MRI/i.test(String(r.TEN_DICH_VU || '')) || /MRI/i.test(String(r.MA_DICH_VU || '')));
const hasSABung = xml3Rows.some((r) => /Sieu\s*am\s*bung|siêu\s*âm\s*bụng/i.test(String(r.TEN_DICH_VU || '')));
const hasAnySieuAm = xml3Rows.some((r) => /sieu\s*am|siêu\s*âm/i.test(String(r.TEN_DICH_VU || '')));
const hasGiuong = xml3Rows.some((r) => /giuong|giường/i.test(String(r.TEN_DICH_VU || '')) || /GIUONG|^03\.|^04\./i.test(String(r.MA_DICH_VU || '')));
const hasGiuongNhomNoiTru = xml3Rows.some((r) => ['14', '15'].includes(String(r.MA_NHOM || '').trim()));
const xml4MissingBsDoc = xml4Rows.some((r) => String(r.MA_BS_DOC_KQ || '').trim() === '');
const xml1MissingBsDieuTri = String(xml1.MA_BAC_SI || '').trim() === '';
const laQuocTichVietNam = ['000', '704', 'VN', 'VNM'].includes(String(xml1.MA_QUOCTICH || '').trim().toUpperCase());
const hasInvalidCdhaMachineCode = xml3Rows.some((r) => {
  const tenDv = String(r.TEN_DICH_VU || '').trim();
  const maMay = String(r.MA_MAY || '').trim();
  if (!maMay) return false;
  const laCdha = /x-quang|x quang|ct|mri|siêu âm|sieu am/i.test(tenDv);
  if (!laCdha) return false;
  return /\s/.test(maMay) || maMay === '12345' || /^[A-Z ]+$/.test(maMay);
});
const hasAnyZeroDonGia = [...xml2Rows, ...xml3Rows].some((r) => {
  const v = Number(String(r.DON_GIA || r.DON_GIA_BH || r.DON_GIA_BV || 'NaN').replace(',', '.'));
  return Number.isFinite(v) && v === 0;
});
const uniqXml2Key = new Set(xml2Rows.map((r) => `${r.MA_LK || ''}#${r.STT || ''}`)).size === xml2Rows.length;
const uniqXml3Key = new Set(xml3Rows.map((r) => `${r.MA_LK || ''}#${r.STT || ''}`)).size === xml3Rows.length;
const hasXml3IdXml2 = xml3Rows.some((r) => String(r.ID_XML2 || '').trim() !== '');
const hasXml3SttNhom = xml3Rows.some((r) => String(r.STT_NHOM || '').trim() !== '');
const xml4MissingReferenceRange = xml4Rows.some((r) => String(r.GIA_TRI || '').trim() !== '' && String(r.CHI_SO_XN_BT || '').trim() === '');

const evaluate = (maLuat) => {
  const ma = String(maLuat || '').toUpperCase();

  if (ma === 'GB_75') {
    if (thoiGianNamVien != null && thoiGianNamVien < 240) return { verdict: 'HOP_LY', reason: `Nam vien ${thoiGianNamVien} phut (<240)` };
    return { verdict: 'NGHI_DUONG_TINH_GIA', reason: 'Khong thay du dieu kien <4h' };
  }
  if (ma === 'CLN-CT-01') {
    if (['2', '3'].includes(maLoaiRv) && !giayChuyenTuyen) return { verdict: 'HOP_LY', reason: `MA_LOAI_RV=${maLoaiRv} nhung GIAY_CHUYEN_TUYEN dang rong` };
    return { verdict: 'NGHI_DUONG_TINH_GIA', reason: 'Khong thoa dieu kien chuyen tuyen thieu giay chuyen tuyen' };
  }
  if (ma === 'CLN-CT-02') {
    if (['2', '3'].includes(maLoaiRv) && !maNoiDi) return { verdict: 'HOP_LY', reason: `MA_LOAI_RV=${maLoaiRv} nhung MA_NOI_DI dang rong` };
    return { verdict: 'NGHI_DUONG_TINH_GIA', reason: 'Khong thoa dieu kien chuyen tuyen thieu MA_NOI_DI' };
  }
  if (ma === 'HC_62') {
    if (xml1MissingBsDieuTri) return { verdict: 'HOP_LY', reason: 'XML1.MA_BAC_SI dang rong' };
    return { verdict: 'NGHI_DUONG_TINH_GIA', reason: 'XML1.MA_BAC_SI khong rong' };
  }
  if (ma === 'CK_42') {
    if (thoiGianNamVien != null && thoiGianNamVien <= 1440) return { verdict: 'NGHI_DUONG_TINH_GIA', reason: `Tong thoi gian ${thoiGianNamVien} phut (<=1440)` };
    return { verdict: 'CAN_XAC_MINH_THEM', reason: 'Can doi soat quy tac tinh theo nhom dich vu luu' };
  }
  if (ma === 'GB_26') {
    if (!hasGiuong) return { verdict: 'NGHI_DUONG_TINH_GIA', reason: 'XML3 khong thay dich vu giuong' };
    return { verdict: 'CAN_XAC_MINH_THEM', reason: 'Co dich vu giuong, can doi chieu chi tiet quy tac' };
  }
  if (ma === 'XML_81') {
    if (!['1', '2', '5'].includes(mucThe)) return { verdict: 'NGHI_DUONG_TINH_GIA', reason: `Ma the BHYT nhom ${mucThe || 'khong ro'} (khong phai 1/2/5)` };
    return { verdict: 'CAN_XAC_MINH_THEM', reason: 'Dung nhom 1/2/5, can doi chieu tinh tien cung chi tra' };
  }
  if (ma === 'XML_26') {
    if (!hasAnyZeroDonGia) return { verdict: 'NGHI_DUONG_TINH_GIA', reason: 'Khong tim thay don gia = 0 tren XML2/XML3' };
    return { verdict: 'HOP_LY', reason: 'Co dong don gia = 0' };
  }
  if (ma === 'XML_117') {
    if (uniqXml2Key) return { verdict: 'NGHI_DUONG_TINH_GIA', reason: 'Khong trung khoa MA_LK+STT tren XML2' };
    return { verdict: 'HOP_LY', reason: 'Phat hien trung khoa MA_LK+STT tren XML2' };
  }
  if (ma === 'XML_118') {
    if (uniqXml3Key) return { verdict: 'NGHI_DUONG_TINH_GIA', reason: 'Khong trung khoa MA_LK+STT tren XML3' };
    return { verdict: 'HOP_LY', reason: 'Phat hien trung khoa MA_LK+STT tren XML3' };
  }
  if (ma === 'CDHA_204') {
    if (!hasMRI) return { verdict: 'NGHI_DUONG_TINH_GIA', reason: 'Khong co dich vu MRI trong XML3' };
    return { verdict: 'CAN_XAC_MINH_THEM', reason: 'Co MRI, can doi chieu moc thoi gian thuc hien' };
  }
  if (ma === 'CDHA_284') {
    if (!hasSABung) return { verdict: 'NGHI_DUONG_TINH_GIA', reason: 'Khong co dich vu sieu am bung trong XML3' };
    return { verdict: 'CAN_XAC_MINH_THEM', reason: 'Co SA bung, can doi chieu thong tin nhin an' };
  }
  if (ma === 'DVKT_1604' || ma === 'DVKT_1636') {
    if (xml4MissingBsDoc) return { verdict: 'HOP_LY', reason: 'XML4 co dong MA_BS_DOC_KQ rong' };
    return { verdict: 'NGHI_DUONG_TINH_GIA', reason: 'XML4 da co MA_BS_DOC_KQ day du' };
  }
  if (ma === 'DVKT_1634') {
    if (hasI83orI80orE115) return { verdict: 'NGHI_DUONG_TINH_GIA', reason: 'Ho so da co ma benh phu hop (I80/I83/E11.5)' };
    return { verdict: 'HOP_LY', reason: 'Khong tim thay ma benh can thiet theo rule' };
  }
  if (ma === 'HC_68') {
    if (tongTienThuoc > 0 && xml2Rows.length === 0) return { verdict: 'HOP_LY', reason: 'XML1 co tien thuoc nhung ho so thieu XML2' };
    return { verdict: 'NGHI_DUONG_TINH_GIA', reason: 'Khong co tien thuoc hoac XML2 da ton tai' };
  }
  if (ma === 'XML_129') {
    if (tongTienThuoc > 0 && xml2Rows.length === 0) return { verdict: 'HOP_LY', reason: 'XML1 co tien thuoc nhung XML2 khong co ban ghi' };
    return { verdict: 'NGHI_DUONG_TINH_GIA', reason: 'Ho so khong phat sinh tien thuoc nen khong bat buoc co XML2' };
  }
  if (ma === 'XML_133') {
    if (!hasXml3IdXml2) return { verdict: 'NGHI_DUONG_TINH_GIA', reason: 'XML3 khong su dung truong ID_XML2 de lien ket' };
    if (xml2Rows.length === 0) return { verdict: 'CAN_XAC_MINH_THEM', reason: 'Co ID_XML2 nhung ho so thieu XML2 de doi chieu' };
    return { verdict: 'CAN_XAC_MINH_THEM', reason: 'Can doi chieu tung ID_XML2 voi XML2' };
  }
  if (ma === 'XML_134') {
    if (tongTienThuoc > 0 && xml2Rows.length === 0) return { verdict: 'HOP_LY', reason: 'Ho so co XML3 va co tien thuoc nhung thieu XML2' };
    return { verdict: 'NGHI_DUONG_TINH_GIA', reason: 'Chi co XML3 khong dong nghia bat buoc phai co XML2' };
  }
  if (ma === 'XML_135') {
    if (!hasXml3SttNhom) return { verdict: 'NGHI_DUONG_TINH_GIA', reason: 'XML3 khong su dung truong STT_NHOM de doi chieu XML2' };
    if (xml2Rows.length === 0) return { verdict: 'CAN_XAC_MINH_THEM', reason: 'Co STT_NHOM nhung ho so thieu XML2 de doi chieu' };
    return { verdict: 'CAN_XAC_MINH_THEM', reason: 'Can doi chieu STT_NHOM giua XML3 va XML2' };
  }
  if (ma === 'XML_139') {
    if (!hasXml3SttNhom && !hasXml3IdXml2) return { verdict: 'NGHI_DUONG_TINH_GIA', reason: 'XML3 doc lap, khong co dau hieu tham chieu XML2' };
    if (xml2Rows.length === 0) return { verdict: 'CAN_XAC_MINH_THEM', reason: 'Ho so thieu XML2 nen chua ket luan duoc lien ket ID' };
    return { verdict: 'CAN_XAC_MINH_THEM', reason: 'Can kiem tra tung dong XML3 co thieu ID lien ket XML2 hay khong' };
  }
  if (ma === 'HD_10') {
    if (xml4MissingReferenceRange) return { verdict: 'HOP_LY', reason: 'XML4 co chi so xet nghiem co gia tri nhung thieu dai chi so binh thuong' };
    return { verdict: 'NGHI_DUONG_TINH_GIA', reason: 'Khong thay dong XML4 co ket qua xet nghiem thieu CHI_SO_XN_BT' };
  }
  if (ma === 'XML_19') {
    if (!laNoiTruHoacBanNgay) return { verdict: 'NGHI_DUONG_TINH_GIA', reason: 'Khong phai ho so noi tru/noi tru ban ngay' };
    if (hasXml5) return { verdict: 'NGHI_DUONG_TINH_GIA', reason: 'Ho so da co XML5' };
    return { verdict: 'HOP_LY', reason: 'Ho so noi tru khong co XML5' };
  }
  if (ma === 'XML_105') {
    if (!laNoiTruHoacBanNgay) return { verdict: 'NGHI_DUONG_TINH_GIA', reason: 'Khong phai ho so noi tru/noi tru ban ngay' };
    if (hasXml7) return { verdict: 'NGHI_DUONG_TINH_GIA', reason: 'Ho so da co XML7' };
    return { verdict: 'HOP_LY', reason: 'Ho so noi tru khong co XML7' };
  }
  if (ma === 'XML_115') {
    if (!xml4Rows.length) return { verdict: 'NGHI_DUONG_TINH_GIA', reason: 'Ho so khong co XML4 de phat sinh ngay tra ket qua' };
    return { verdict: 'CAN_XAC_MINH_THEM', reason: 'Can doi chieu tung dong XML4 voi truong ngay tra ket qua thuc te' };
  }
  if (ma === 'XML_121') {
    if (!xml2Rows.length) return { verdict: 'NGHI_DUONG_TINH_GIA', reason: 'Ho so khong co XML2 nen khong the trung lap thuoc' };
    return { verdict: 'CAN_XAC_MINH_THEM', reason: 'Can doi chieu trung lap thuoc theo ngay, ma va ham luong' };
  }
  if (ma === 'HC_171') {
    if (!laNoiTruHoacBanNgay) return { verdict: 'NGHI_DUONG_TINH_GIA', reason: 'Khong phai ho so noi tru/noi tru ban ngay' };
    if (hasXml5) return { verdict: 'NGHI_DUONG_TINH_GIA', reason: 'Ho so da co XML5' };
    return { verdict: 'HOP_LY', reason: 'Ho so noi tru khong co XML5' };
  }
  if (ma === 'HC_181') {
    if (maLoaiRv === '2' && maNoiDen.length !== 5) return { verdict: 'HOP_LY', reason: `MA_LOAI_RV=2 nhung MA_NOI_DEN='${maNoiDen || '(rong)'}' khong du 5 ky tu` };
    return { verdict: 'NGHI_DUONG_TINH_GIA', reason: 'Khong thoa dieu kien ma noi den sai dinh dang' };
  }
  if (ma === 'HC_212') {
    if (!laNoiTruHoacBanNgay) return { verdict: 'NGHI_DUONG_TINH_GIA', reason: 'Khong phai ho so noi tru/noi tru ban ngay' };
    if (hasGiuong || hasGiuongNhomNoiTru) return { verdict: 'NGHI_DUONG_TINH_GIA', reason: 'XML3 da co dich vu giuong nhom 14/15' };
    return { verdict: 'HOP_LY', reason: 'Khong co dich vu giuong noi tru trong XML3' };
  }
  if (ma === 'HC_238') {
    if (laQuocTichVietNam) return { verdict: 'NGHI_DUONG_TINH_GIA', reason: 'MA_QUOCTICH cho thay benh nhan trong nuoc' };
    return { verdict: 'CAN_XAC_MINH_THEM', reason: 'Can doi chieu gia cong kham rieng cho doi tuong quoc te' };
  }
  if (ma === 'CDHA_213') {
    if (!hasAnySieuAm) return { verdict: 'NGHI_DUONG_TINH_GIA', reason: 'Khong co dich vu sieu am trong XML3' };
    if (!String(xml1.NGAY_PTTT || '').trim()) return { verdict: 'NGHI_DUONG_TINH_GIA', reason: 'Khong co moc thoi gian phau thuat de doi chieu' };
    return { verdict: 'CAN_XAC_MINH_THEM', reason: 'Co sieu am sau mo, can doi chieu tung moc thoi gian' };
  }
  if (ma === 'CDHA_101') {
    if (hasInvalidCdhaMachineCode) return { verdict: 'HOP_LY', reason: 'MA_MAY dang la mo ta may/ma gia dinh, khong phai ma thiet bi hop le' };
    return { verdict: 'CAN_XAC_MINH_THEM', reason: 'Can doi chieu ma may thuc te voi danh muc trang thiet bi' };
  }
  if (ma === 'DVKT_0141') {
    if (laNoiTruHoacBanNgay || laSanKhoa) return { verdict: 'NGHI_DUONG_TINH_GIA', reason: 'Creatinin la can lam sang pho bien trong ho so noi tru/san khoa' };
    return { verdict: 'CAN_XAC_MINH_THEM', reason: 'Can doi chieu chan doan chi tiet va boi canh nhap vien' };
  }
  if (ma === 'DVKT_2333') {
    if (laNoiTruHoacBanNgay || laSanKhoa) return { verdict: 'NGHI_DUONG_TINH_GIA', reason: 'Tong phan tich te bao mau la can lam sang pho bien trong noi tru/san khoa' };
    return { verdict: 'CAN_XAC_MINH_THEM', reason: 'Can doi chieu boi canh lam sang va chi dinh nhap vien' };
  }
  return { verdict: 'CAN_XAC_MINH_THEM', reason: 'Can du lieu ngoai ho so hoac chi tiet engine de ket luan' };
};

const danhGiaRows = reportByMaLK.map((r) => {
  const ma = getRuleCode(r);
  const ev = evaluate(ma);
  return {
    MA_LK: maLK,
    MA_LUAT: ma,
    QUY_TAC: getRuleName(r),
    KET_QUA_DOI_CHIEU: ev.verdict,
    LY_DO: ev.reason,
  };
});

const summary = danhGiaRows.reduce((acc, r) => {
  acc[r.KET_QUA_DOI_CHIEU] = (acc[r.KET_QUA_DOI_CHIEU] || 0) + 1;
  return acc;
}, {});

const outDir = path.resolve(process.cwd(), 'test_xml');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const baseName = `doi_chieu_${maLK || 'unknown'}_${Date.now()}`;
const outJson = path.join(outDir, `${baseName}.json`);
const outXlsx = path.join(outDir, `${baseName}.xlsx`);

fs.writeFileSync(outJson, JSON.stringify({
  meta: {
    claimPath,
    reportPath,
    maLK,
    durationMinutes: thoiGianNamVien,
    reportRowCount: reportByMaLK.length,
    summary,
  },
  evidence: {
    xml1MissingBsDieuTri,
    xml4MissingBsDoc,
    hasAnyZeroDonGia,
    uniqXml2Key,
    uniqXml3Key,
    hasMRI,
    hasSABung,
    hasGiuong,
    maBenhAll,
    mucThe,
    maLoaiRv,
    giayChuyenTuyen,
    maNoiDi,
    maNoiDen,
    hasInvalidCdhaMachineCode,
  },
  rows: danhGiaRows,
}, null, 2));

const wbOut = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wbOut, XLSX.utils.json_to_sheet(danhGiaRows), 'DOI_CHIEU');
XLSX.utils.book_append_sheet(wbOut, XLSX.utils.json_to_sheet([{
  MA_LK: maLK,
  SO_DONG_BAO_LOI: reportByMaLK.length,
  HOP_LY: summary.HOP_LY || 0,
  NGHI_DUONG_TINH_GIA: summary.NGHI_DUONG_TINH_GIA || 0,
  CAN_XAC_MINH_THEM: summary.CAN_XAC_MINH_THEM || 0,
  THOI_GIAN_NAM_VIEN_PHUT: thoiGianNamVien,
}]), 'TONG_HOP');
XLSX.writeFile(wbOut, outXlsx);

console.log(`MA_LK=${maLK}`);
console.log(`REPORT_ROWS=${reportByMaLK.length}`);
console.log(`SUMMARY=${JSON.stringify(summary)}`);
console.log(`OUT_JSON=${outJson}`);
console.log(`OUT_XLSX=${outXlsx}`);
