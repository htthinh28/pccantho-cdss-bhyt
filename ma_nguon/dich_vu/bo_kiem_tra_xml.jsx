/**
 * BỘ KIỂM TRA LÕI: RÀ SOÁT DỮ LIỆU XML CHUẨN QĐ 3176/QĐ-BYT
 * Tiêu chuẩn JCI: MCI.3 (Toàn vẹn dữ liệu) & QPS (Cải thiện chất lượng)
 */

import { CAU_TRUC_DU_LIEU, layQuyTacKiemTraChoXml1 } from '../quy_tac/quyluat_cautrucdulieu/quyluat_cau_truc_du_lieu';
import { laApDungSuaDoi3176ChoXml1, laSoDangKyUbndHopLe } from '../tien_ich/quy_dinh_3176_sua_doi_2026';

export const kiemTraToanDienHoSo = (hoSo) => {
  let danhSachLỗi = [];

  // --- LỚP 1: KIỂM TRA ĐỊNH DẠNG CHUẨN ---
  const regexNgay12 = /^\d{12}$/; // YYYYMMDDHHMM
  const regexNgay8 = /^\d{8}$/;   // YYYYMMDD

  const soNgayTrongThang = (y, m) => new Date(y, m, 0).getDate();
  const tinhTuoiTheoNam = (ngaySinh, ngayMoc) => {
    let tuoi = ngayMoc.y - ngaySinh.y;
    const chuaDenNgaySinh =
      ngayMoc.m < ngaySinh.m || (ngayMoc.m === ngaySinh.m && ngayMoc.d < ngaySinh.d);
    if (chuaDenNgaySinh) tuoi -= 1;
    return tuoi;
  };
  const dinhDangHuman = (parts, coGioPhut = true) =>
    coGioPhut
      ? `${String(parts.d).padStart(2, '0')}/${String(parts.m).padStart(2, '0')}/${parts.y} ${String(parts.hh).padStart(2, '0')}:${String(parts.mm).padStart(2, '0')}`
      : `${String(parts.d).padStart(2, '0')}/${String(parts.m).padStart(2, '0')}/${parts.y}`;

  const tachVaKiemTraNgay12 = (raw) => {
    const value = String(raw ?? '').trim();
    if (!regexNgay12.test(value)) return { ok: false, loi: 'không đủ 12 ký tự số theo chuẩn yyyymmddHHMM' };
    const y = Number(value.slice(0, 4));
    const m = Number(value.slice(4, 6));
    const d = Number(value.slice(6, 8));
    const hh = Number(value.slice(8, 10));
    const mm = Number(value.slice(10, 12));
    if (m < 1 || m > 12) return { ok: false, loi: 'tháng không hợp lệ (01-12)' };
    if (d < 1 || d > soNgayTrongThang(y, m)) return { ok: false, loi: 'ngày không hợp lệ theo tháng/năm' };
    if (hh < 0 || hh > 23) return { ok: false, loi: 'giờ không hợp lệ (00-23)' };
    if (mm < 0 || mm > 59) return { ok: false, loi: 'phút không hợp lệ (00-59)' };
    const ts = new Date(y, m - 1, d, hh, mm, 0, 0).getTime();
    return { ok: true, parts: { y, m, d, hh, mm }, ts };
  };

  const tachVaKiemTraNgay8 = (raw) => {
    const value = String(raw ?? '').trim();
    if (!regexNgay8.test(value)) return { ok: false, loi: 'không đủ 8 ký tự số theo chuẩn yyyymmdd' };
    const y = Number(value.slice(0, 4));
    const m = Number(value.slice(4, 6));
    const d = Number(value.slice(6, 8));
    if (m < 1 || m > 12) return { ok: false, loi: 'tháng không hợp lệ (01-12)' };
    if (d < 1 || d > soNgayTrongThang(y, m)) return { ok: false, loi: 'ngày không hợp lệ theo tháng/năm' };
    const ts = new Date(y, m - 1, d, 0, 0, 0, 0).getTime();
    return { ok: true, parts: { y, m, d }, ts };
  };
  const tinhPhutChenhlech = (fromTs, toTs) => Math.floor((toTs - fromTs) / 60000);
  const laDichVuKhamHoacGiuong = (row = {}) => {
    const maNhom = String(row.MA_NHOM ?? '').trim();
    const tenDv = String(row.TEN_DICH_VU ?? '').toUpperCase();
    const coMaGiuong = String(row.MA_GIUONG ?? '').trim() !== '';
    // Theo nhóm chi phí BHYT thường gặp: 1=khám bệnh, 2=ngày giường
    return maNhom === '1' || maNhom === '2' || coMaGiuong || /KHÁM|KHAM|GIƯỜNG|GIUONG/.test(tenDv);
  };
  const laDichVuKham = (row = {}) => {
    const maNhom = String(row.MA_NHOM ?? '').trim();
    const tenDv = String(row.TEN_DICH_VU ?? '').toUpperCase();
    const maDv = String(row.MA_DICH_VU ?? '').trim();
    return maNhom === '1' || /^01/.test(maDv) || /KHÁM|KHAM/.test(tenDv);
  };
  const laDichVuGiuong = (row = {}) => {
    const maNhom = String(row.MA_NHOM ?? '').trim();
    const tenDv = String(row.TEN_DICH_VU ?? '').toUpperCase();
    const coMaGiuong = String(row.MA_GIUONG ?? '').trim() !== '';
    return maNhom === '2' || coMaGiuong || /GIƯỜNG|GIUONG/.test(tenDv);
  };
  const laNgoaiTru = (xml1 = {}) => {
    const ma = String(xml1?.MA_LOAI_KCB ?? '').trim();
    return ma === '1' || ma === '01';
  };
  const laNoiTru = (xml1 = {}) => {
    const ma = String(xml1?.MA_LOAI_KCB ?? '').trim();
    return ['3', '03', '4', '04', '9', '09'].includes(ma);
  };
  const laKhamNgoaiTruXml2 = (row = {}, xml1 = {}) => {
    return laNgoaiTru(xml1) && laDichVuKham(row);
  };

  // --- LỚP 2: KIỂM TRA CẤU TRÚC VÀ GIÁ TRỊ TỪNG BẢNG ---
  const quetTungBang = (tenXML, duLieu, xml1 = null) => {
    if (!duLieu) return;
    const quyTac = xml1 ? layQuyTacKiemTraChoXml1(tenXML, xml1) : CAU_TRUC_DU_LIEU[tenXML].quy_tac;
    const cotChuan = CAU_TRUC_DU_LIEU[tenXML].cot;
    const mangDuLieu = Array.isArray(duLieu) ? duLieu : [duLieu];
    const apDungSuaDoi3176 = xml1 ? laApDungSuaDoi3176ChoXml1(xml1) : false;

    mangDuLieu.forEach((row, index) => {
      // 1. Kiểm tra thừa/thiếu cột so với QĐ 3176
      const cotThucTe = Object.keys(row).filter(k => k !== 'id');
      const thiếuCot = cotChuan.filter(c => !cotThucTe.includes(c));
      if (thiếuCot.length > 0) {
        danhSachLỗi.push({ 
          phan_loai: tenXML, 
          muc_do: 'Critical', 
          noi_dung: `Dòng ${index + 1}: Thiếu cột chuẩn: ${thiếuCot.join(', ')}` 
        });
      }

      // 2. Kiểm tra chi tiết theo quy tắc định nghĩa tại file xml1.jsx -> xml6.jsx
      Object.keys(quyTac).forEach(field => {
        const val = row[field];
        const rule = quyTac[field];

        // Kiểm tra bắt buộc
        if (rule.required && (val === undefined || val === null || val === '')) {
          danhSachLỗi.push({ phan_loai: tenXML, muc_do: 'Error', noi_dung: `Dòng ${index + 1}: Trường ${field} không được để trống.` });
        }

        // Kiểm tra độ dài
        if (rule.maxLength && String(val).length > rule.maxLength) {
          danhSachLỗi.push({ phan_loai: tenXML, muc_do: 'Warning', noi_dung: `Dòng ${index + 1}: ${field} vượt quá ${rule.maxLength} ký tự.` });
        }

        if (
          tenXML === 'XML2' &&
          field === 'SO_DANG_KY' &&
          apDungSuaDoi3176 &&
          val &&
          !laSoDangKyUbndHopLe(val)
        ) {
          danhSachLỗi.push({
            phan_loai: tenXML,
            muc_do: 'Warning',
            noi_dung: `Dòng ${index + 1}: SO_DANG_KY bắt đầu bằng UBND phải theo mã UBND.YYYY.X.S (QĐ sửa đổi 3176, từ 01/7/2026).`,
          });
        }

        // Chuẩn hóa kiểm tra thời gian theo thành phần: năm-tháng-ngày-giờ-phút
        const laTruongNgay = String(field || '').startsWith('NGAY');
        if (laTruongNgay && val) {
          // Theo yêu cầu nghiệp vụ: NGAY_SINH dùng chuẩn 12 ký tự yyyymmddHHMM.
          if (field === 'NGAY_SINH') {
            const kqSinh = tachVaKiemTraNgay12(val);
            if (!kqSinh.ok) {
              danhSachLỗi.push({
                phan_loai: tenXML,
                muc_do: 'Critical',
                noi_dung: `Dòng ${index + 1}: ${field} sai định dạng yyyymmddHHMM (${kqSinh.loi}).`,
              });
            }
          } else if (rule.maxLength === 12) {
            const kq12 = tachVaKiemTraNgay12(val);
            if (!kq12.ok) {
              danhSachLỗi.push({
                phan_loai: tenXML,
                muc_do: 'Critical',
                noi_dung: `Dòng ${index + 1}: ${field} sai định dạng yyyymmddHHMM (${kq12.loi}).`,
              });
            }
          } else if (rule.maxLength === 8) {
            const kq8 = tachVaKiemTraNgay8(val);
            if (!kq8.ok) {
              danhSachLỗi.push({
                phan_loai: tenXML,
                muc_do: 'Critical',
                noi_dung: `Dòng ${index + 1}: ${field} sai định dạng yyyymmdd (${kq8.loi}).`,
              });
            }
          }
        }
      });
    });
  };

  // --- LỚP 3: KIỂM TRA LOGIC LIÊN KẾT (CROSS-CHECK) ---
  const kiemTraLogicLienKet = () => {
    if (!hoSo.xml1) return;
    const maLK_Goc = hoSo.xml1.MA_LK;
    const ngayVao = hoSo.xml1.NGAY_VAO;
    const ngayRa = hoSo.xml1.NGAY_RA;

    // 1. Kiểm tra thứ tự thời gian vào/ra theo chuẩn yyyymmddHHMM
    const vaoKq = ngayVao ? tachVaKiemTraNgay12(ngayVao) : null;
    const raKq = ngayRa ? tachVaKiemTraNgay12(ngayRa) : null;
    if (vaoKq?.ok && raKq?.ok && raKq.ts < vaoKq.ts) {
      danhSachLỗi.push({
        phan_loai: 'LOGIC',
        muc_do: 'Critical',
        noi_dung: `Ngày ra viện (${dinhDangHuman(raKq.parts)}) không được nhỏ hơn ngày vào viện (${dinhDangHuman(vaoKq.parts)}).`,
      });
    }

    // RULE TG_01: Chênh lệch NGAY_VAO -> NGAY_RA dưới 10 phút
    if (vaoKq?.ok && raKq?.ok && raKq.ts >= vaoKq.ts) {
      const phutRaVao = tinhPhutChenhlech(vaoKq.ts, raKq.ts);
      if (phutRaVao < 10) {
        danhSachLỗi.push({
          phan_loai: 'THOI_GIAN',
          muc_do: 'Warning',
          noi_dung: `RULE TG_01: Chênh lệch NGAY_VAO - NGAY_RA chỉ ${phutRaVao} phút (<10 phút).`,
        });
      }
    }

    // 1b. Kiểm tra tuổi tác từ NGAY_SINH và NGAY_VAO để làm nền cho rule giám định theo tuổi
    const sinhRaw = hoSo.xml1.NGAY_SINH;
    const sinhKq = sinhRaw ? tachVaKiemTraNgay12(sinhRaw) : null;
    if (sinhKq?.ok && vaoKq?.ok) {
      const tuoiNam = tinhTuoiTheoNam(sinhKq.parts, vaoKq.parts);
      if (tuoiNam < 0) {
        danhSachLỗi.push({
          phan_loai: 'LOGIC',
          muc_do: 'Critical',
          noi_dung: `Ngày sinh (${dinhDangHuman(sinhKq.parts)}) lớn hơn ngày vào viện (${dinhDangHuman(vaoKq.parts)}).`,
        });
      } else if (tuoiNam > 130) {
        danhSachLỗi.push({
          phan_loai: 'LOGIC',
          muc_do: 'Warning',
          noi_dung: `Tuổi tính theo thời điểm vào viện là ${tuoiNam}, vượt ngưỡng kiểm tra thường quy (>130).`,
        });
      }

      const tuoiNamHoSo = Number(hoSo.xml1.TUOI_NAM);
      if (Number.isFinite(tuoiNamHoSo) && Math.abs(tuoiNamHoSo - tuoiNam) > 1) {
        danhSachLỗi.push({
          phan_loai: 'LOGIC',
          muc_do: 'Warning',
          noi_dung: `TUOI_NAM (${tuoiNamHoSo}) lệch so với tuổi tính từ NGAY_SINH/NGAY_VAO (${tuoiNam}).`,
        });
      }
    }

    // RULE TG_02 + TG_03 trên bảng dịch vụ (XML2/XML3)
    const quetBangYLenh = (tenBang, dsRaw) => {
      const ds = Array.isArray(dsRaw) ? dsRaw : dsRaw ? [dsRaw] : [];
      ds.forEach((row, idx) => {
        const yl = row?.NGAY_YL ? tachVaKiemTraNgay12(row.NGAY_YL) : null;
        const th = row?.NGAY_TH_YL ? tachVaKiemTraNgay12(row.NGAY_TH_YL) : null;
        const kq = row?.NGAY_KQ ? tachVaKiemTraNgay12(row.NGAY_KQ) : null;

        // RULE TG_02: chênh lệch NGAY_YL -> NGAY_TH_YL < 5 phút
        const duocMienTg02 =
          (tenBang === 'XML2' && laKhamNgoaiTruXml2(row, hoSo.xml1))
          || (tenBang === 'XML3' && laNgoaiTru(hoSo.xml1) && laDichVuKham(row))
          || (tenBang === 'XML3' && laNoiTru(hoSo.xml1) && laDichVuGiuong(row));
        if (!duocMienTg02 && yl?.ok && th?.ok && th.ts >= yl.ts) {
          const phutYlTh = tinhPhutChenhlech(yl.ts, th.ts);
          if (phutYlTh > 0 && phutYlTh < 5) {
            danhSachLỗi.push({
              phan_loai: 'THOI_GIAN',
              muc_do: 'Warning',
              noi_dung: `RULE TG_02 (${tenBang} dòng ${idx + 1}): Chênh lệch NGAY_YL - NGAY_TH_YL là ${phutYlTh} phút (1-4 phút).`,
            });
          }
        }

        // RULE TG_03: chênh lệch NGAY_TH_YL -> NGAY_KQ < 5 phút (trừ khám/giường)
        if (tenBang === 'XML3' && !laDichVuKhamHoacGiuong(row) && th?.ok && kq?.ok && kq.ts >= th.ts) {
          const phutThKq = tinhPhutChenhlech(th.ts, kq.ts);
          if (phutThKq < 5) {
            danhSachLỗi.push({
              phan_loai: 'THOI_GIAN',
              muc_do: 'Warning',
              noi_dung: `RULE TG_03 (XML3 dòng ${idx + 1}): Chênh lệch NGAY_TH_YL - NGAY_KQ là ${phutThKq} phút (<5 phút), không thuộc nhóm khám/giường.`,
            });
          }
        }
      });
    };
    quetBangYLenh('XML2', hoSo.xml2);
    quetBangYLenh('XML3', hoSo.xml3);

    // 2. Kiểm tra sự thống nhất MA_LK giữa XML1 và các bảng chi tiết
    ['xml2', 'xml3', 'xml4', 'xml5', 'xml6'].forEach(key => {
      if (hoSo[key]) {
        const ds = Array.isArray(hoSo[key]) ? hoSo[key] : [hoSo[key]];
        ds.forEach((item, idx) => {
          if (item.MA_LK !== maLK_Goc) {
            danhSachLỗi.push({ 
              phan_loai: key.toUpperCase(), 
              muc_do: 'Critical', 
              noi_dung: `Dòng ${idx + 1}: Lỗi liên thông dữ liệu (MA_LK không khớp XML1).` 
            });
          }
        });
      }
    });
  };

  // THỰC THI KIỂM TRA
  const xml1 = hoSo.xml1 || hoSo.XML1 || null;
  quetTungBang('XML1', hoSo.xml1, xml1);
  quetTungBang('XML2', hoSo.xml2, xml1);
  quetTungBang('XML3', hoSo.xml3, xml1);
  quetTungBang('XML4', hoSo.xml4, xml1);
  quetTungBang('XML5', hoSo.xml5, xml1);
  quetTungBang('XML6', hoSo.xml6);
  kiemTraLogicLienKet();

  return danhSachLỗi;
};