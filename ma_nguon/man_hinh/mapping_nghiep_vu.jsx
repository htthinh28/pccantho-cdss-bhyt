/**
 * Module Mapping Danh mục — theo Đặc tả kỹ thuật v1.0:
 * bảng catalog_mapping (client), mapping_type_config, lọc + danh sách + thêm/sửa + xuất/nhập Excel.
 */

import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as XLSX from 'xlsx';
import ModalCatalogMapping from '../thanh_phan/modal_catalog_mapping';
import OChonNgayISO from '../thanh_phan/o_chon_ngay_iso';
import { noiChuoiNhieuMa, tachChuoiNhieuMa } from '../tien_ich/catalog_mapping_chuoi_ma';
import { dieuHuongMoTabMoi } from '../tien_ich/dieu_huong_mo_tab_moi';
import {
    invalidateBangCatalogMappingCache,
    taiBangChoLoaiMapping,
    taiTatCaBangChoMapping,
    timTenNhieuMa,
    timTenTheoMa,
} from '../tien_ich/catalog_mapping_catalog_loaders';
import {
  doiSoatCatalogMappingVoiFirebase,
  dongBoTatCaCatalogMappingLenFirebase,
  layKhoaBackupCatalogMapping,
  taiTatCaCatalogMappingTuFirebase,
} from '../tien_ich/catalog_mapping_firebase';
import { workbookToJsonRows, sheetJsonToMappingRows } from '../tien_ich/catalog_mapping_excel_import';
import {
  luuTatCaBanGhiMapping,
  mappingCoHieuLucTaiNgay,
  taiTatCaBanGhiMapping,
  validateMappingMoi,
} from '../tien_ich/catalog_mapping_luu_tru';
import {
    LAY_MAPPING_TYPE_OPTIONS,
    MAPPING_TYPE_CONFIG,
    laMappingNhieuMaDich,
    laMappingNhieuMaNguon,
    laMappingNhieuMaNguonIcd,
    layCauHinhLoaiMapping,
} from '../tien_ich/catalog_mapping_types';
import { CD } from '../tien_ich/chu_de_giao_dien';
import { rongSidebarTheoMan, useLayoutMode } from '../tien_ich/diem_anh_man_hinh';
import { quayLaiAnToan } from '../tien_ich/dieu_huong_an_toan';
import { kiemTraKetNoiFirebaseThucTe } from '../tien_ich/firebase_cloud_bhyt';
import { taoBanSaoDuLieuHeThong } from '../tien_ich/sao_luu_du_lieu_he_thong';
import { inHoacChiaSePdfTuBang } from '../tien_ich/in_an_chung';

const BO_LOC_TRANG_THAI = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'active', label: 'Đang hoạt động' },
  { value: 'inactive', label: 'Đã vô hiệu' },
];

const ID_INPUT_IMPORT_MAPPING = 'import-excel-catalog-mapping-input';

const MappingNghiepVu = ({ navigation }) => {
  const { dungBoCucDoc, width: winW } = useLayoutMode();
  const [hang, setHang] = useState([]);
  const [bangTheoRef, setBangTheoRef] = useState({});
  const [taiXong, setTaiXong] = useState(false);
  const [locLoai, setLocLoai] = useState('');
  const [locTrangThai, setLocTrangThai] = useState('active');
  const [locNgay, setLocNgay] = useState('');
  const [tuKhoa, setTuKhoa] = useState('');
  /** null = đóng; string = loại mapping — mỗi thẻ một popup với DM nạp riêng */
  const [modalLoai, setModalLoai] = useState(null);
  const [bangModalTheoLoai, setBangModalTheoLoai] = useState({});
  const [dangTaiModal, setDangTaiModal] = useState(false);
  const [banGhiSua, setBanGhiSua] = useState(null);
  const [dangDongBoFirebase, setDangDongBoFirebase] = useState(false);
  const [dangTaiFirebase, setDangTaiFirebase] = useState(false);
  const [dangNhapExcel, setDangNhapExcel] = useState(false);

  const coDuBangTrongStateChoLoai = (br, loai) => {
    const cfg = layCauHinhLoaiMapping(loai);
    if (!cfg) return false;
    return Array.isArray(br[cfg.source_catalog]) && Array.isArray(br[cfg.target_catalog]);
  };

  const nap = useCallback(async () => {
    setTaiXong(false);
    invalidateBangCatalogMappingCache();
    try {
      const [rows, bang] = await Promise.all([taiTatCaBanGhiMapping(), taiTatCaBangChoMapping()]);
      setHang(rows);
      setBangTheoRef(bang);
    } catch (e) {
      console.warn(e);
    } finally {
      setTaiXong(true);
    }
  }, []);

  useEffect(() => {
    nap();
  }, [nap]);

  const ngayLoc = useMemo(() => {
    if (!locNgay || !String(locNgay).trim()) return new Date();
    const d = new Date(locNgay);
    return Number.isNaN(d.getTime()) ? new Date() : d;
  }, [locNgay]);

  /** STAFF_DVKT: một danh sách mã DVKT (legacy chỉ định đã gộp). */
  const layMaDvktStaff = (r) => {
    if (r.mapping_type !== 'STAFF_DVKT') return [];
    const md = r.metadata && typeof r.metadata === 'object' ? r.metadata : {};
    const norm = (a) => (Array.isArray(a) ? a.map((x) => String(x || '').trim()).filter(Boolean) : []);
    const chi = norm(md.target_codes_chi_dinh);
    const thuc = norm(md.target_codes_thuc_hien);
    if (chi.length || thuc.length) return [...new Set([...chi, ...thuc])];
    if (Array.isArray(md.target_codes) && md.target_codes.length) return [...new Set(norm(md.target_codes))];
    const tc = String(r.target_code || '').trim();
    if (!tc) return [];
    return [...new Set(tachChuoiNhieuMa(tc))];
  };

  /** ICD↔thuốc/DVKT/VTYT…: danh sách mã đích (một dòng có thể nhiều mã). */
  const layMaDichMultiNghiepVu = (r) => {
    if (!laMappingNhieuMaDich(r.mapping_type)) return [];
    const md = r.metadata && typeof r.metadata === 'object' ? r.metadata : {};
    if (Array.isArray(md.target_codes) && md.target_codes.length) {
      return md.target_codes.map((c) => String(c || '').trim()).filter(Boolean);
    }
    const tc = String(r.target_code || '').trim();
    if (!tc) return [];
    return tachChuoiNhieuMa(tc);
  };

  /** ICD: metadata.source_icd_codes; STAFF_EQUIPMENT / DVKT_EQUIPMENT: metadata.source_codes. */
  const layMaNguonMulti = (r) => {
    if (!laMappingNhieuMaNguon(r.mapping_type)) return [];
    const md = r.metadata && typeof r.metadata === 'object' ? r.metadata : {};
    const mt = r.mapping_type;
    if (laMappingNhieuMaNguonIcd(mt)) {
      if (Array.isArray(md.source_icd_codes) && md.source_icd_codes.length) {
        return md.source_icd_codes.map((c) => String(c || '').trim()).filter(Boolean);
      }
    } else if (['STAFF_EQUIPMENT', 'DVKT_EQUIPMENT'].includes(mt)) {
      if (Array.isArray(md.source_codes) && md.source_codes.length) {
        return md.source_codes.map((c) => String(c || '').trim()).filter(Boolean);
      }
    }
    const sc = String(r.source_code || '').trim();
    if (!sc) return [];
    return tachChuoiNhieuMa(sc);
  };

  /** Mã nguồn hiển thị / xuất: chuẩn hóa nhiều ICD (v.v.) thành "A; B; C". */
  const maNguonHienThi = (r) => {
    if (laMappingNhieuMaNguon(r.mapping_type)) {
      const arr = layMaNguonMulti(r);
      if (arr.length) return noiChuoiNhieuMa(arr);
    }
    return String(r.source_code || '').trim();
  };

  const bangMergedChoModal = useMemo(
    () => ({ ...bangTheoRef, ...bangModalTheoLoai }),
    [bangTheoRef, bangModalTheoLoai],
  );

  /** Sidebar trái (list menu lọc + thêm); rộng hơn một chút để đọc nhãn loại. */
  const rongSidebarMapping = useMemo(() => {
    if (dungBoCucDoc) return undefined;
    return rongSidebarTheoMan(winW, { min: 148, max: 268, ratio: 0.22 });
  }, [dungBoCucDoc, winW]);

  const demSoDongTheoLoai = useMemo(() => {
    const m = {};
    for (const { mapping_type } of MAPPING_TYPE_CONFIG) {
      m[mapping_type] = 0;
    }
    for (const r of hang) {
      const t = String(r?.mapping_type || '').trim();
      if (m[t] === undefined) continue;
      m[t] += 1;
    }
    return m;
  }, [hang]);

  const demChoMucLoc = (value) => {
    if (!value) return hang.length;
    return demSoDongTheoLoai[value] ?? 0;
  };

  const hangLoc = useMemo(() => {
    const tk = String(tuKhoa || '').trim().toLowerCase();
    return hang.filter((r) => {
      if (locLoai && r.mapping_type !== locLoai) return false;
      if (locTrangThai === 'active' && r.is_active === false) return false;
      if (locTrangThai === 'inactive' && r.is_active !== false) return false;
      if (locTrangThai === 'active' && r.is_active && locNgay && String(locNgay).trim()) {
        if (!mappingCoHieuLucTaiNgay(r, ngayLoc)) return false;
      }
      if (!tk) return true;
      const extraParts = [];
      if (r.mapping_type === 'STAFF_DVKT') extraParts.push(...layMaDvktStaff(r));
      else {
        if (laMappingNhieuMaDich(r.mapping_type)) extraParts.push(...layMaDichMultiNghiepVu(r));
        if (laMappingNhieuMaNguon(r.mapping_type)) extraParts.push(...layMaNguonMulti(r));
      }
      const extra = extraParts.join(' ');
      const s = `${r.source_code} ${r.target_code} ${r.mapping_type} ${extra}`.toLowerCase();
      return s.includes(tk);
    });
  }, [hang, locLoai, locTrangThai, locNgay, ngayLoc, tuKhoa]);

  const tenNguon = (r) => {
    const c = layCauHinhLoaiMapping(r.mapping_type);
    if (!c) return '';
    const ds = bangTheoRef[c.source_catalog] || [];
    if (laMappingNhieuMaNguon(r.mapping_type)) return timTenNhieuMa(ds, layMaNguonMulti(r));
    return timTenTheoMa(ds, r.source_code);
  };
  const tenDich = (r) => {
    const c = layCauHinhLoaiMapping(r.mapping_type);
    if (!c) return '';
    const ds = bangTheoRef[c.target_catalog] || [];
    if (r.mapping_type === 'STAFF_DVKT') {
      return timTenNhieuMa(ds, layMaDvktStaff(r));
    }
    if (laMappingNhieuMaDich(r.mapping_type)) {
      return timTenNhieuMa(ds, layMaDichMultiNghiepVu(r));
    }
    return timTenTheoMa(ds, r.target_code);
  };
  const maDichThucHien = (r) => {
    if (r.mapping_type === 'STAFF_DVKT') return noiChuoiNhieuMa(layMaDvktStaff(r));
    if (laMappingNhieuMaDich(r.mapping_type)) return noiChuoiNhieuMa(layMaDichMultiNghiepVu(r));
    return r.target_code || '';
  };
  const tenDichThucHien = (r) => {
    const c = layCauHinhLoaiMapping(r.mapping_type);
    if (!c) return '';
    const ds = bangTheoRef[c.target_catalog] || [];
    if (r.mapping_type === 'STAFF_DVKT') return timTenNhieuMa(ds, layMaDvktStaff(r));
    if (laMappingNhieuMaDich(r.mapping_type)) return timTenNhieuMa(ds, layMaDichMultiNghiepVu(r));
    return timTenTheoMa(ds, r.target_code);
  };

  const gopLuu = async (rowMoi) => {
    const idx = hang.findIndex((r) => r.id === rowMoi.id);
    let merged;
    if (idx >= 0) {
      merged = [...hang];
      merged[idx] = rowMoi;
    } else {
      merged = [rowMoi, ...hang];
    }

    const v = validateMappingMoi({ rows: merged, rowMoi, boQuaId: rowMoi.id, bangTheoRef: bangMergedChoModal });
    if (!v.ok) {
      Alert.alert('Không lưu được', v.message || 'Lỗi validation');
      return;
    }

    await luuTatCaBanGhiMapping(merged);
    setHang(merged);
    setModalLoai(null);
    setBangModalTheoLoai({});
    setBanGhiSua(null);
  };

  const moThemMapping = async (loai) => {
    if (coDuBangTrongStateChoLoai(bangTheoRef, loai)) {
      setBangModalTheoLoai({});
      setBanGhiSua(null);
      setModalLoai(loai);
      return;
    }
    setDangTaiModal(true);
    try {
      const partial = await taiBangChoLoaiMapping(loai);
      setBangModalTheoLoai(partial);
      setBanGhiSua(null);
      setModalLoai(loai);
    } catch (e) {
      console.warn(e);
      Alert.alert('Lỗi', 'Không tải được danh mục cho loại mapping này.');
    } finally {
      setDangTaiModal(false);
    }
  };

  const moSuaMapping = async (r) => {
    const loai = r.mapping_type;
    if (!layCauHinhLoaiMapping(loai)) {
      Alert.alert(
        'Không sửa được',
        'Loại mapping không còn trong cấu hình (ví dụ đã bỏ loại cũ). Hãy xóa bản ghi hoặc xuất Excel để lưu trữ.',
      );
      return;
    }
    if (coDuBangTrongStateChoLoai(bangTheoRef, loai)) {
      setBangModalTheoLoai({});
      setBanGhiSua(r);
      setModalLoai(loai);
      return;
    }
    setDangTaiModal(true);
    try {
      const partial = await taiBangChoLoaiMapping(loai);
      setBangModalTheoLoai(partial);
      setBanGhiSua(r);
      setModalLoai(loai);
    } catch (e) {
      console.warn(e);
      Alert.alert('Lỗi', 'Không tải được danh mục để sửa.');
    } finally {
      setDangTaiModal(false);
    }
  };

  const dongModalMapping = () => {
    setModalLoai(null);
    setBangModalTheoLoai({});
    setBanGhiSua(null);
  };

  const xoaVinhVien = (row) => {
    const chay = () => {
      const next = hang.filter((r) => r.id !== row.id);
      luuTatCaBanGhiMapping(next).then(() => {
        setHang(next);
        if (banGhiSua?.id === row.id) {
          dongModalMapping();
        }
      });
    };
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.confirm) {
      if (window.confirm('Xóa vĩnh viễn bản ghi mapping này? Không hoàn tác.')) chay();
    } else {
      Alert.alert('Xác nhận', 'Xóa vĩnh viễn bản ghi mapping này? Không hoàn tác.', [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Xóa', style: 'destructive', onPress: chay },
      ]);
    }
  };

  const voHieuHoa = (row) => {
    const xacNhan = () => {
      const ts = new Date().toISOString();
      const next = hang.map((r) => (r.id === row.id ? { ...r, is_active: false, updated_at: ts } : r));
      luuTatCaBanGhiMapping(next).then(() => {
        setHang(next);
      });
    };
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.confirm) {
      if (window.confirm('Vô hiệu hóa mapping này? (soft-delete)')) xacNhan();
    } else {
      Alert.alert('Xác nhận', 'Vô hiệu hóa mapping này?', [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Đồng ý', onPress: xacNhan },
      ]);
    }
  };

  const duyet = (row) => {
    const next = hang.map((r) =>
      r.id === row.id ? { ...r, approval_status: 'APPROVED', updated_at: new Date().toISOString() } : r,
    );
    luuTatCaBanGhiMapping(next).then(() => setHang(next));
  };

  /** Độ rộng tối thiểu bảng theo vùng phải (sau sidebar). */
  const rongBangToiThieu = Math.max(960, (winW || 800) - (rongSidebarMapping ?? 0) - (dungBoCucDoc ? 24 : 52));

  const xuLyNhapMappingTuJson = useCallback(
    async (jsonRows) => {
      const { rows: parsed, errors: parseErrs } = sheetJsonToMappingRows(jsonRows);
      const valErrs = [];
      const okRows = [];
      for (const row of parsed) {
        const combined = [...hang, ...okRows, row];
        const v = validateMappingMoi({ rows: combined, rowMoi: row, boQuaId: row.id, bangTheoRef });
        if (!v.ok) {
          valErrs.push(`[${row.mapping_type}] ${v.message || 'Lỗi validation'}`);
        } else {
          okRows.push(row);
        }
      }
      if (okRows.length === 0) {
        const parts = [
          ...parseErrs.map((e) => `Dòng ${e.line}: ${e.message}`),
          ...valErrs,
        ].slice(0, 14);
        Alert.alert('Import Excel', `Không có dòng hợp lệ.\n\n${parts.join('\n')}`);
        return;
      }
      try {
        await taoBanSaoDuLieuHeThong({
          reason: 'AUTO_BEFORE_IMPORT_CATALOG_MAPPING_EXCEL',
          includeKeys: layKhoaBackupCatalogMapping(),
        });
      } catch (be) {
        console.warn('Backup trước import mapping:', be);
      }
      const next = [...hang, ...okRows];
      await luuTatCaBanGhiMapping(next);
      invalidateBangCatalogMappingCache();
      setHang(next);
      const tail = [
        ...parseErrs.map((e) => `Dòng ${e.line}: ${e.message}`),
        ...valErrs,
      ].slice(0, 10);
      const msg =
        `Đã thêm ${okRows.length} bản ghi.` +
        (parseErrs.length || valErrs.length
          ? ` Bỏ qua ${parseErrs.length} lỗi đọc dòng + ${valErrs.length} lỗi kiểm tra danh mục/trùng.`
          : '');
      Alert.alert('Import Excel', tail.length ? `${msg}\n\n${tail.join('\n')}` : msg);
    },
    [hang, bangTheoRef],
  );

  const handleImportExcelWeb = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        setDangNhapExcel(true);
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const json = workbookToJsonRows(wb);
        await xuLyNhapMappingTuJson(json);
      } catch (err) {
        Alert.alert('Import Excel', err?.message || String(err));
      } finally {
        setDangNhapExcel(false);
        e.target.value = '';
      }
    };
    reader.readAsBinaryString(file);
  };

  const moChonFileImportExcel = () => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.getElementById(ID_INPUT_IMPORT_MAPPING)?.click?.();
      return;
    }
    void (async () => {
      try {
        setDangNhapExcel(true);
        const result = await DocumentPicker.getDocumentAsync({
          type: [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel',
          ],
          copyToCacheDirectory: true,
          multiple: false,
        });
        if (result.canceled || !result.assets?.[0]) return;
        const asset = result.assets[0];
        const b64 = await FileSystem.readAsStringAsync(asset.uri, { encoding: 'base64' });
        const wb = XLSX.read(b64, { type: 'base64' });
        const json = workbookToJsonRows(wb);
        await xuLyNhapMappingTuJson(json);
      } catch (err) {
        Alert.alert('Import Excel', err?.message || String(err));
      } finally {
        setDangNhapExcel(false);
      }
    })();
  };

  const xuatExcel = () => {
    if (hangLoc.length === 0) {
      Alert.alert('Thông báo', 'Không có dòng để xuất.');
      return;
    }
    const sheet = hangLoc.map((r, i) => ({
      STT: i + 1,
      Loai: r.mapping_type,
      Ma_nguon: maNguonHienThi(r),
      Ten_nguon: tenNguon(r),
      Ma_thuc_hien: maDichThucHien(r),
      Ten_thuc_hien: tenDichThucHien(r),
      Hieu_luc_tu: r.effective_from || '',
      Hieu_luc_den: r.effective_to || '',
      Trang_thai: r.is_active !== false ? 'ACTIVE' : 'INACTIVE',
      Duyet: r.approval_status || '',
      Uu_tien: r.priority ?? 0,
    }));
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(sheet);
    XLSX.utils.book_append_sheet(wb, ws, 'mapping');
    if (Platform.OS === 'web' && typeof XLSX.writeFile === 'function') {
      XLSX.writeFile(wb, `Catalog_mapping_${Date.now()}.xlsx`);
    }
  };

  const inPdfDanhSachMapping = async () => {
    if (hangLoc.length === 0) {
      Alert.alert('Thông báo', 'Không có dòng để in.');
      return;
    }
    const rows = hangLoc.map((r, i) => ({
      STT: i + 1,
      Loai: r.mapping_type,
      Ma_nguon: maNguonHienThi(r),
      Ten_nguon: tenNguon(r),
      Ma_thuc_hien: maDichThucHien(r),
      Ten_thuc_hien: tenDichThucHien(r),
      Hieu_luc_tu: r.effective_from || '',
      Hieu_luc_den: r.effective_to || '',
      Trang_thai: r.is_active !== false ? 'ACTIVE' : 'INACTIVE',
      Duyet: r.approval_status || '',
      Uu_tien: r.priority ?? 0,
    }));
    const columns = [
      { key: 'STT', label: 'STT' },
      { key: 'Loai', label: 'Loại' },
      { key: 'Ma_nguon', label: 'Mã nguồn' },
      { key: 'Ten_nguon', label: 'Tên nguồn' },
      { key: 'Ma_thuc_hien', label: 'Mã TH' },
      { key: 'Ten_thuc_hien', label: 'Tên TH' },
      { key: 'Hieu_luc_tu', label: 'Hiệu lực từ' },
      { key: 'Hieu_luc_den', label: 'Hiệu lực đến' },
      { key: 'Trang_thai', label: 'Trạng thái' },
      { key: 'Duyet', label: 'Duyệt' },
      { key: 'Uu_tien', label: 'Ưu tiên' },
    ];
    await inHoacChiaSePdfTuBang([{ sheetName: 'Mapping', columns, rows }], 'Mapping danh mục (đang lọc)');
  };

  const handleDoiSoatFirebaseMapping = async () => {
    try {
      const check = await kiemTraKetNoiFirebaseThucTe(false);
      if (!check?.ok) {
        Alert.alert('Firebase', check?.reason || 'Chưa kết nối được Firestore.');
        return;
      }
      const kq = await doiSoatCatalogMappingVoiFirebase();
      const lines = kq.details.map((d) => {
        const cloud = d.remote?.exists ? `${d.remote.row_count} dòng` : 'chưa có';
        return `${d.storage_key}: cục bộ ${d.local.row_count} | cloud ${cloud}${d.differs ? ' · lệch' : ''}`;
      });
      const head = `${kq.differs_count}/${kq.details.length} shard lệch hoặc khác hash.`;
      const body = lines.slice(0, 16).join('\n');
      const tail = lines.length > 16 ? `\n… +${lines.length - 16} shard` : '';
      Alert.alert('Đối soát mapping — Firebase', `${head}\n\n${body}${tail}`);
    } catch (e) {
      Alert.alert('Firebase', e?.message || String(e));
    }
  };

  const handleDongBoMappingLenFirebase = async () => {
    if (dangDongBoFirebase || dangTaiFirebase) return;
    setDangDongBoFirebase(true);
    try {
      const check = await kiemTraKetNoiFirebaseThucTe(true);
      if (!check?.ok) {
        Alert.alert('Firebase', check?.reason || 'Chưa ghi được Firestore.');
        return;
      }
      const kq = await dongBoTatCaCatalogMappingLenFirebase({ uploader: '', onlyChanged: true });
      const msg = kq?.ok
        ? `Đã xử lý ${kq.processed_count}/${kq.total_count} shard (upload mới: ${kq.uploaded_count}, giữ hash: ${kq.skipped_count}).`
        : (kq?.reason || 'Đồng bộ thất bại.');
      Alert.alert('Đồng bộ mapping lên Firebase', msg);
    } catch (e) {
      Alert.alert('Firebase', e?.message || String(e));
    } finally {
      setDangDongBoFirebase(false);
    }
  };

  const chayTaiMappingTuFirebase = async () => {
    if (dangDongBoFirebase || dangTaiFirebase) return;
    setDangTaiFirebase(true);
    try {
      const check = await kiemTraKetNoiFirebaseThucTe(false);
      if (!check?.ok) {
        Alert.alert('Firebase', check?.reason || 'Chưa đọc được Firestore.');
        return;
      }
      try {
        await taoBanSaoDuLieuHeThong({
          reason: 'AUTO_BEFORE_FIREBASE_PULL_CATALOG_MAPPING',
          includeKeys: layKhoaBackupCatalogMapping(),
        });
      } catch (be) {
        console.warn('Auto-backup trước khi tải mapping:', be);
      }
      const kq = await taiTatCaCatalogMappingTuFirebase();
      invalidateBangCatalogMappingCache();
      await nap();
      const miss = (kq.missing_remote || []).length;
      Alert.alert(
        'Tải mapping từ Firebase',
        `Đã ghi ${kq.downloaded}/${kq.shard_count} shard.${miss ? ` ${miss} shard chưa có trên cloud.` : ''}`,
      );
    } catch (e) {
      Alert.alert('Firebase', e?.message || String(e));
    } finally {
      setDangTaiFirebase(false);
    }
  };

  const handleTaiMappingTuFirebase = () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.confirm) {
      if (
        window.confirm(
          'Tải mapping từ Firebase ghi đè shard cục bộ (CATALOG_MAP_V1__*). Tiếp tục?',
        )
      ) {
        void chayTaiMappingTuFirebase();
      }
      return;
    }
    Alert.alert('Xác nhận', 'Tải mapping từ Firebase sẽ ghi đè shard cục bộ.', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Tiếp tục', onPress: () => { void chayTaiMappingTuFirebase(); } },
    ]);
  };

  return (
    <SafeAreaView style={styles.vung_an_toan}>
      <View style={styles.thanh_tieu_de}>
        <TouchableOpacity onPress={() => quayLaiAnToan(navigation, 'TongQuan')} style={styles.nut_quay_lai}>
          <Text style={styles.chu_nut_header}>⬅ TỔNG QUAN</Text>
        </TouchableOpacity>
        <Text style={styles.chu_tieu_de} numberOfLines={1}>MAPPING DANH MỤC</Text>
        <TouchableOpacity onPress={() => dieuHuongMoTabMoi(navigation, 'QuanLyDanhMuc')} style={styles.nut_phu}>
          <Text style={styles.chu_nut_header}>📋 DM GỐC</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.khung_chinh_mapping, dungBoCucDoc && styles.khung_chinh_mapping_doc]}>
        <View style={[styles.sidebar_trai, dungBoCucDoc ? styles.sidebar_trai_doc : { width: rongSidebarMapping }]}>
          <ScrollView
            style={styles.sidebar_scroll}
            contentContainerStyle={styles.sidebar_scroll_content}
            showsVerticalScrollIndicator
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.chu_sidebar_tieu_de}>Thêm mapping</Text>
            {MAPPING_TYPE_CONFIG.map((c) => {
              const n = demSoDongTheoLoai[c.mapping_type] ?? 0;
              return (
                <TouchableOpacity
                  key={c.mapping_type}
                  style={[styles.muc_loai_mapping, dangTaiModal && styles.nut_loai_mapping_tac]}
                  onPress={() => moThemMapping(c.mapping_type)}
                  disabled={dangTaiModal}
                  activeOpacity={0.88}
                >
                  <View style={styles.hang_ma_va_dem}>
                    <Text style={styles.chu_ma_loai_mapping} numberOfLines={1}>
                      + {c.mapping_type}
                    </Text>
                    <Text style={styles.chu_dem_loai}>{n}</Text>
                  </View>
                  <Text style={styles.chu_ten_loai_mapping} numberOfLines={2}>
                    {c.display_name}
                  </Text>
                </TouchableOpacity>
              );
            })}

            <View style={styles.gach_sidebar} />
            <Text style={[styles.chu_sidebar_tieu_de, styles.chu_sidebar_section]}>Lọc bảng</Text>
            {LAY_MAPPING_TYPE_OPTIONS.map((opt) => {
              const dem = demChoMucLoc(opt.value);
              const chon = locLoai === opt.value;
              return (
                <TouchableOpacity
                  key={opt.value || 'all'}
                  style={[styles.muc_list_loc, chon && styles.muc_list_loc_chon]}
                  onPress={() => setLocLoai(opt.value)}
                  activeOpacity={0.88}
                >
                  <View style={styles.hang_ma_va_dem}>
                    <Text
                      style={[styles.chu_list_loc, chon && styles.chu_list_loc_chon]}
                      numberOfLines={4}
                    >
                      {opt.label}
                    </Text>
                    <Text style={[styles.chu_dem_loai, chon && styles.chu_dem_loai_chon]}>{dem}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}

            <View style={styles.gach_sidebar} />
            <Text style={[styles.chu_sidebar_tieu_de, styles.chu_sidebar_section]}>Trạng thái</Text>
            {BO_LOC_TRANG_THAI.map((opt) => {
              const chon = locTrangThai === opt.value;
              return (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.muc_list_loc, chon && styles.muc_list_loc_chon]}
                  onPress={() => setLocTrangThai(opt.value)}
                  activeOpacity={0.88}
                >
                  <Text style={[styles.chu_list_loc, chon && styles.chu_list_loc_chon]} numberOfLines={2}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={styles.sidebar_footer}>
            <Text style={styles.chu_sidebar_tieu_de}>Firebase</Text>
            <TouchableOpacity
              style={[styles.nut_cloud_sidebar, (dangDongBoFirebase || dangTaiFirebase) && styles.nut_tac]}
              onPress={handleDoiSoatFirebaseMapping}
              disabled={dangDongBoFirebase || dangTaiFirebase}
            >
              <Text style={styles.chu_nut_cloud_sidebar}>Đối soát</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.nut_cloud_sidebar, styles.nut_cloud_sidebar_xanh, (dangDongBoFirebase || dangTaiFirebase) && styles.nut_tac]}
              onPress={handleDongBoMappingLenFirebase}
              disabled={dangDongBoFirebase || dangTaiFirebase}
            >
              {dangDongBoFirebase ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={[styles.chu_nut_cloud_sidebar, styles.chu_nut_cloud_sang]}>Đẩy lên</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.nut_cloud_sidebar, styles.nut_cloud_sidebar_cam, (dangDongBoFirebase || dangTaiFirebase) && styles.nut_tac]}
              onPress={handleTaiMappingTuFirebase}
              disabled={dangDongBoFirebase || dangTaiFirebase}
            >
              {dangTaiFirebase ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={[styles.chu_nut_cloud_sidebar, styles.chu_nut_cloud_sang]}>Tải về</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.khoi_noi_dung_phai}>
          <Text style={styles.moTa} numberOfLines={2}>
            <Text style={styles.inDam}>catalog_mapping</Text> (M:N). <Text style={styles.inDam}>Nhập Excel</Text> cùng cột với xuất (sheet «mapping» nếu có).{' '}
            <Text style={styles.inDam}>Lọc / Firebase</Text> bên trái; thêm từ «Thêm mapping».
          </Text>

          <View style={styles.khoi_loc}>
            <Text style={styles.nhan_loc_nho}>Lọc nhanh (bảng)</Text>
            <View style={styles.hai_o_nho}>
              <View style={styles.o_loc_co_nhan}>
                <Text style={styles.nhan_loc_nho}>Hiệu lực tại ngày</Text>
                <OChonNgayISO
                  style={styles.o_ngay_nho}
                  value={locNgay}
                  onChangeValue={setLocNgay}
                  placeholder="Trống = hôm nay"
                />
              </View>
              <View style={[styles.o_loc_co_nhan, { flex: 1, minWidth: 140 }]}>
                <Text style={styles.nhan_loc_nho}>Tìm nhanh</Text>
                <TextInput
                  style={styles.o_ngay_nho}
                  value={tuKhoa}
                  onChangeText={setTuKhoa}
                  placeholder="Mã, loại…"
                  placeholderTextColor={CD.text.placeholder}
                />
              </View>
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            style={styles.hang_hanh_dong_cuon}
            contentContainerStyle={styles.hang_hanh_dong_cuon_content}
          >
            {Platform.OS === 'web' ? (
              <input
                id={ID_INPUT_IMPORT_MAPPING}
                type="file"
                accept=".xlsx,.xls"
                style={{ display: 'none' }}
                onChange={handleImportExcelWeb}
              />
            ) : null}
            <TouchableOpacity
              style={[styles.nut_phu2, dangNhapExcel && styles.nut_tac]}
              onPress={moChonFileImportExcel}
              disabled={dangNhapExcel || !taiXong}
            >
              {dangNhapExcel ? (
                <ActivityIndicator color={CD.text.primary} size="small" />
              ) : (
                <Text style={styles.chu_nut_phu}>📤 NHẬP EXCEL</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.nut_phu2} onPress={xuatExcel}>
              <Text style={styles.chu_nut_phu}>📥 XUẤT EXCEL</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.nut_phu2} onPress={() => void inPdfDanhSachMapping()}>
              <Text style={styles.chu_nut_phu}>🖨 IN / PDF</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.nut_phu2} onPress={nap}>
              <Text style={styles.chu_nut_phu}>↻ TẢI LẠI</Text>
            </TouchableOpacity>
          </ScrollView>

          <View style={styles.vung_bang_outer}>
            {!taiXong ? (
              <Text style={styles.dang_tai}>Đang tải…</Text>
            ) : (
              <ScrollView
                horizontal
                nestedScrollEnabled
                style={styles.bang_ngang}
                contentContainerStyle={[styles.bang_ngang_content, { minWidth: rongBangToiThieu }]}
                keyboardShouldPersistTaps="handled"
              >
                <View style={[styles.bang, { width: rongBangToiThieu, minWidth: rongBangToiThieu }]}>
                  <View style={styles.dong_tieu_de_bang}>
                    <Text style={[styles.cot, styles.cot_stt]}>STT</Text>
                    <Text style={[styles.cot, styles.cot_loai]}>Loại</Text>
                    <Text style={[styles.cot, styles.cot_ma]}>Mã NC</Text>
                    <Text style={[styles.cot, styles.cot_ten]}>Tên NC</Text>
                    <Text style={[styles.cot, styles.cot_ma_cd]}>Mã TH</Text>
                    <Text style={[styles.cot, styles.cot_ten_nhom]}>Tên TH</Text>
                    <Text style={[styles.cot, styles.cot_hl]}>Hiệu lực</Text>
                    <Text style={[styles.cot, styles.cot_tt]}>TT</Text>
                    <Text style={[styles.cot, styles.cot_tac]}>Thao tác</Text>
                  </View>
                  <ScrollView nestedScrollEnabled style={styles.cuon_doc_bang} keyboardShouldPersistTaps="handled">
                    {hangLoc.map((r, i) => (
                      <View key={r.id} style={[styles.dong_du_lieu, i % 2 === 1 && styles.dong_le]}>
                        <Text style={[styles.cot, styles.cot_stt]}>{i + 1}</Text>
                        <Text style={[styles.cot, styles.cot_loai]}>{r.mapping_type}</Text>
                        <Text style={[styles.cot, styles.cot_ma]}>{maNguonHienThi(r)}</Text>
                        <Text style={[styles.cot, styles.cot_ten]}>{tenNguon(r) || '—'}</Text>
                        <Text style={[styles.cot, styles.cot_ma_cd]}>{maDichThucHien(r) || '—'}</Text>
                        <Text style={[styles.cot, styles.cot_ten_nhom]}>{tenDichThucHien(r) || '—'}</Text>
                        <Text style={[styles.cot, styles.cot_hl]}>
                          {(r.effective_from || '…') + ' → ' + (r.effective_to || '∞')}
                        </Text>
                        <Text style={[styles.cot, styles.cot_tt]}>
                          {r.is_active === false ? 'OFF' : mappingCoHieuLucTaiNgay(r) ? 'ON' : 'HẾT HL'}
                        </Text>
                        <View style={[styles.cot, styles.cot_tac, styles.cot_tac_flex]}>
                          {layCauHinhLoaiMapping(r.mapping_type)?.require_approval && r.approval_status === 'PENDING' ? (
                            <TouchableOpacity style={styles.nut_mini} onPress={() => duyet(r)}>
                              <Text style={styles.chu_mini}>Duyệt</Text>
                            </TouchableOpacity>
                          ) : null}
                          <TouchableOpacity style={styles.nut_mini} onPress={() => moSuaMapping(r)}>
                            <Text style={styles.chu_mini}>Sửa</Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={styles.nut_mini_xoa} onPress={() => xoaVinhVien(r)}>
                            <Text style={styles.chu_mini}>Xóa</Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={styles.nut_mini_do} onPress={() => voHieuHoa(r)}>
                            <Text style={styles.chu_mini}>Vô hiệu</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                    {hangLoc.length === 0 ? (
                      <Text style={styles.trong}>Chưa có bản ghi. Thêm từ cột trái hoặc chỉnh «Lọc bảng» / «Trạng thái».</Text>
                    ) : null}
                  </ScrollView>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </View>

      <ModalCatalogMapping
        visible={modalLoai != null}
        mappingTypeCoDinh={modalLoai}
        onClose={dongModalMapping}
        onLuu={gopLuu}
        bangTheoRef={bangMergedChoModal}
        banGhiChinhSua={banGhiSua}
      />
    </SafeAreaView>
  );
};

export default MappingNghiepVu;

const styles = StyleSheet.create({
  vung_an_toan: {
    flex: 1,
    backgroundColor: CD.bg.gradient_mobile,
    ...Platform.select({ web: { backgroundImage: CD.web.gradient_bg } }),
  },
  thanh_tieu_de: {
    flexShrink: 0,
    paddingHorizontal: 12,
    paddingVertical: 10,
    paddingTop: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: CD.brand.mauDam,
    borderBottomWidth: 1,
    borderBottomColor: CD.border.header,
    ...Platform.select({ web: { backgroundImage: CD.web.gradient_header, backdropFilter: CD.web.blur_header, boxShadow: CD.web.shadow_header } }),
  },
  khung_chinh_mapping: {
    flex: 1,
    flexDirection: 'row',
    minHeight: 0,
    minWidth: 0,
  },
  khung_chinh_mapping_doc: {
    flexDirection: 'column',
  },
  sidebar_trai: {
    alignSelf: 'stretch',
    flexDirection: 'column',
    minHeight: 0,
    paddingTop: 8,
    paddingHorizontal: 8,
    paddingBottom: 4,
    borderRightWidth: 1,
    borderRightColor: CD.border.glass_md,
    backgroundColor: 'rgba(0,0,0,0.24)',
    ...Platform.select({ web: { boxSizing: 'border-box' } }),
  },
  sidebar_trai_doc: {
    width: '100%',
    maxHeight: 240,
    borderRightWidth: 0,
    borderBottomWidth: 1,
    borderBottomColor: CD.border.glass_md,
  },
  chu_sidebar_tieu_de: {
    fontSize: 11,
    fontWeight: '800',
    color: CD.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 6,
    paddingBottom: 6,
    fontFamily: CD.font.family,
  },
  chu_sidebar_section: {
    marginTop: 4,
    paddingTop: 4,
  },
  gach_sidebar: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: CD.border.glass_md,
    marginVertical: 10,
    marginHorizontal: 4,
  },
  sidebar_scroll: { flex: 1, minHeight: 0 },
  sidebar_scroll_content: { paddingBottom: 16 },
  muc_list_loc: {
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: CD.border.glass,
    backgroundColor: CD.bg.glass_input,
    marginBottom: 4,
    ...Platform.select({ web: { cursor: 'pointer' } }),
  },
  muc_list_loc_chon: {
    backgroundColor: '#D81B60',
    borderColor: '#AD1457',
  },
  chu_list_loc: {
    flex: 1,
    fontSize: 10,
    lineHeight: 14,
    color: CD.text.secondary,
    fontFamily: CD.font.family,
  },
  chu_list_loc_chon: {
    color: '#FFF',
    fontWeight: '700',
  },
  chu_dem_loai_chon: {
    color: '#FFF',
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  sidebar_footer: {
    flexShrink: 0,
    paddingTop: 6,
    paddingBottom: 4,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: CD.border.glass_md,
    gap: 5,
  },
  nut_cloud_sidebar: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: CD.border.glass,
    backgroundColor: CD.bg.glass_card,
    alignItems: 'center',
    ...Platform.select({ web: { cursor: 'pointer' } }),
  },
  nut_cloud_sidebar_xanh: {
    backgroundColor: '#1565C0',
    borderColor: '#0D47A1',
  },
  nut_cloud_sidebar_cam: {
    backgroundColor: '#E65100',
    borderColor: '#BF360C',
  },
  chu_nut_cloud_sidebar: {
    color: CD.text.primary,
    fontWeight: '800',
    fontSize: 11,
    fontFamily: CD.font.family,
  },
  chu_nut_cloud_sang: { color: '#FFF' },
  nut_tac: { opacity: 0.55 },
  muc_loai_mapping: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: CD.border.glass,
    backgroundColor: CD.bg.glass_card,
    marginBottom: 4,
    ...Platform.select({ web: { cursor: 'pointer' } }),
  },
  hang_ma_va_dem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 4 },
  chu_ma_loai_mapping: {
    flex: 1,
    color: CD.text.primary,
    fontWeight: '800',
    fontSize: 10,
    fontFamily: CD.font.family,
  },
  chu_dem_loai: {
    fontSize: 10,
    fontWeight: '800',
    color: CD.text.muted,
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    overflow: 'hidden',
    fontFamily: CD.font.family,
  },
  chu_ten_loai_mapping: {
    marginTop: 2,
    fontSize: 10,
    lineHeight: 13,
    color: CD.text.secondary,
    fontFamily: CD.font.family,
  },
  khoi_noi_dung_phai: {
    flex: 1,
    minWidth: 0,
    minHeight: 0,
    flexDirection: 'column',
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 6,
    ...Platform.select({ web: { paddingLeft: 12, paddingRight: 14 } }),
  },
  nut_quay_lai: {
    padding: 10,
    backgroundColor: CD.bg.glass_input,
    borderWidth: 1,
    borderColor: CD.border.glass_md,
    borderRadius: 12,
  },
  nut_phu: {
    padding: 10,
    backgroundColor: 'rgba(200, 230, 201, 0.35)',
    borderWidth: 1,
    borderColor: '#558B2F',
    borderRadius: 12,
  },
  chu_nut_header: { color: CD.text.primary, fontWeight: 'bold', fontSize: 16, fontFamily: CD.font.family },
  chu_tieu_de: { flex: 1, textAlign: 'center', fontSize: 17, color: CD.text.primary, fontWeight: 'bold', fontFamily: CD.font.family },
  moTa: {
    fontSize: 11,
    lineHeight: 15,
    color: CD.text.secondary,
    marginBottom: 6,
    fontFamily: CD.font.family,
    flexShrink: 0,
  },
  inDam: { fontWeight: '800', color: CD.text.primary },
  khoi_loc: {
    flexShrink: 0,
    backgroundColor: CD.bg.glass_card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: CD.border.glass,
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginBottom: 6,
  },
  nhan_loc_nho: { fontSize: 11, color: CD.text.muted, marginBottom: 4, fontFamily: CD.font.family, textTransform: 'uppercase', letterSpacing: 0.3 },
  hang_sub_tab: { marginBottom: 4, maxHeight: 34 },
  chip_sub: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: CD.border.glass,
    marginRight: 5,
    backgroundColor: CD.bg.glass_input,
    maxHeight: 30,
    justifyContent: 'center',
  },
  chip_sub_chon: { backgroundColor: '#D81B60', borderColor: '#AD1457' },
  chu_chip_sub: { fontSize: 10, color: CD.text.secondary, fontFamily: CD.font.family },
  chu_chip_sub_chon: { color: '#FFF', fontWeight: '700' },
  hang_loc_phu: { marginBottom: 6 },
  hang_loc_row: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 0 },
  chip_loc_chon: { backgroundColor: '#D81B60', borderColor: '#AD1457' },
  chip_nho: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: CD.border.glass, backgroundColor: CD.bg.glass_input },
  chu_chip_nho: { fontSize: 11, color: CD.text.secondary, fontFamily: CD.font.family },
  chu_chip_loc_chon: { color: '#FFF', fontWeight: '700' },
  hai_o_nho: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, alignItems: 'flex-end' },
  o_loc_co_nhan: { minWidth: 140 },
  o_ngay_nho: {
    backgroundColor: CD.bg.glass_input,
    borderWidth: 1,
    borderColor: CD.border.input,
    borderRadius: 8,
    color: CD.text.primary,
    fontSize: 13,
    paddingVertical: 6,
    paddingHorizontal: 8,
    fontFamily: CD.font.family,
  },
  nut_loai_mapping_tac: { opacity: 0.55 },
  hang_hanh_dong_cuon: {
    flexGrow: 0,
    flexShrink: 0,
    maxHeight: 46,
    marginBottom: 6,
  },
  hang_hanh_dong_cuon_content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingRight: 8,
  },
  nut_chinh: {
    backgroundColor: '#D81B60',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
    ...Platform.select({ web: { cursor: 'pointer' } }),
  },
  chu_nut_chinh: { color: '#FFF', fontWeight: '800', fontSize: 16, fontFamily: CD.font.family },
  nut_phu2: {
    backgroundColor: CD.bg.glass_input,
    borderWidth: 1,
    borderColor: CD.border.glass_md,
    paddingVertical: 8,
    paddingHorizontal: 11,
    borderRadius: 10,
  },
  chu_nut_phu: { color: CD.text.primary, fontWeight: '700', fontSize: 12, fontFamily: CD.font.family },
  dang_tai: { color: CD.text.muted, fontSize: 16, fontFamily: CD.font.family, padding: 16 },
  vung_bang_outer: { flex: 1, minHeight: 0, minWidth: 0, paddingHorizontal: 0, paddingBottom: 4 },
  bang_ngang: { flex: 1, minHeight: 0, width: '100%' },
  bang_ngang_content: { flexGrow: 1, paddingBottom: 4 },
  bang: {
    flex: 1,
    minHeight: 0,
    flexDirection: 'column',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: CD.border.glass,
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.2)',
    alignSelf: 'stretch',
  },
  cuon_doc_bang: { flex: 1, minHeight: 0 },
  dong_tieu_de_bang: {
    flexDirection: 'row',
    backgroundColor: 'rgba(216,27,96,0.35)',
    paddingVertical: 10,
    paddingHorizontal: 8,
    flexShrink: 0,
    alignItems: 'flex-start',
  },
  dong_du_lieu: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: CD.border.divider,
    alignItems: 'flex-start',
    minHeight: 56,
  },
  dong_le: { backgroundColor: 'rgba(255,255,255,0.03)' },
  cot: {
    fontSize: 13,
    lineHeight: 20,
    color: CD.text.table_cell,
    fontFamily: CD.font.family,
    paddingHorizontal: 4,
    flexShrink: 0,
  },
  cot_stt: { width: 40 },
  cot_loai: { width: 108 },
  cot_ma: { width: 92 },
  cot_ten: { flex: 1.35, minWidth: 120 },
  cot_ma_cd: { width: 100, flexShrink: 0 },
  cot_ten_nhom: { flex: 1.15, minWidth: 130 },
  cot_hl: { width: 112 },
  cot_tt: { width: 52 },
  cot_tac: { width: 188 },
  cot_tac_flex: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, alignItems: 'center' },
  nut_mini: { paddingHorizontal: 6, paddingVertical: 4, backgroundColor: CD.bg.glass_input, borderRadius: 6, borderWidth: 1, borderColor: CD.border.glass_md },
  nut_mini_xoa: { paddingHorizontal: 6, paddingVertical: 4, backgroundColor: 'rgba(183,28,28,0.35)', borderRadius: 6, borderWidth: 1, borderColor: 'rgba(255,82,82,0.6)' },
  nut_mini_do: { paddingHorizontal: 6, paddingVertical: 4, backgroundColor: 'rgba(244,67,54,0.2)', borderRadius: 6, borderWidth: 1, borderColor: 'rgba(244,67,54,0.5)' },
  chu_mini: { fontSize: 11, color: CD.text.primary, fontWeight: '700', fontFamily: CD.font.family },
  trong: { padding: 24, textAlign: 'center', color: CD.text.muted, fontFamily: CD.font.family },
});
