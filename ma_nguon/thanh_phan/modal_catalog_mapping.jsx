import React, { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { CD } from '../tien_ich/chu_de_giao_dien';
import { layCauHinhLoaiMapping, laMappingNhieuMaDich, MAPPING_TYPE_CONFIG } from '../tien_ich/catalog_mapping_types';

/** Nhãn danh mục nội bộ theo catalog_ref (đồng bộ Quản lý danh mục) */
const TEN_DM_HIEN_THI = {
  employees: 'Nhân sự — Mẫu 02 (MA_BHXH / CCHN)',
  dvkt_items: 'DVKT — Mẫu 05 (MA_DICH_VU)',
  icd10: 'ICD-10 (MÃ BỆNH / tên bệnh)',
  drug_items: 'Thuốc — Mẫu 03 (MA_THUOC)',
  vtyt_items: 'VTYT — Mẫu 04 (MA_VAT_TU)',
  surgery_types: 'Phân loại PT — từ PHAN_LOAI_PTTT trên DVKT M05',
  bed_types: 'Giường / bàn khám BV',
  equipments: 'Trang thiết bị — Mẫu 06 (MA_MAY)',
};
import { timTenTheoMa, timTenNhieuMa } from '../tien_ich/catalog_mapping_catalog_loaders';
import { taoIdMapping } from '../tien_ich/catalog_mapping_luu_tru';
import OChonNgayISO from './o_chon_ngay_iso';

const CHON_LOAI = MAPPING_TYPE_CONFIG.map((c) => ({ value: c.mapping_type, label: c.display_name }));

const THU_TUAN_KEYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
const NHAN_THU_TUAN = {
  T2: 'T2',
  T3: 'T3',
  T4: 'T4',
  T5: 'T5',
  T6: 'T6',
  T7: 'T7',
  CN: 'CN',
};

const GIO_24 = Array.from({ length: 24 }, (_, i) => i);

function taoLichGioRong() {
  const o = {};
  THU_TUAN_KEYS.forEach((k) => {
    o[k] = [];
  });
  return o;
}

function locGioTrongKhoang(a, b) {
  const out = [];
  if (a == null || b == null) return out;
  if (a <= b) {
    for (let h = a; h <= b; h += 1) out.push(h);
  } else {
    for (let h = a; h <= 23; h += 1) out.push(h);
    for (let h = 0; h <= b; h += 1) out.push(h);
  }
  return [...new Set(out)].sort((x, y) => x - y);
}

function legacyTuDenToGio(tu, den) {
  const parse = (s) => {
    const m = String(s || '').trim().match(/^(\d{1,2})(?::(\d{2}))?$/);
    if (!m) return null;
    let h = parseInt(m[1], 10);
    if (h > 23) h = 23;
    return h;
  };
  const h1 = parse(tu);
  const h2 = parse(den);
  if (h1 == null || h2 == null) return [];
  return locGioTrongKhoang(h1, h2);
}

function hopNhatLichGio(tuMeta) {
  const base = taoLichGioRong();
  if (!tuMeta || typeof tuMeta !== 'object') return base;
  THU_TUAN_KEYS.forEach((k) => {
    const v = tuMeta[k];
    if (!v || typeof v !== 'object') return;
    if (Array.isArray(v.gio)) {
      base[k] = v.gio.filter((n) => Number.isInteger(n) && n >= 0 && n <= 23).sort((a, b) => a - b);
    } else if (v.tu != null || v.den != null) {
      base[k] = legacyTuDenToGio(v.tu, v.den);
    }
  });
  return base;
}

function hopNhatTrucGio(md) {
  const t = md?.tham_gia_truc;
  if (t && typeof t === 'object' && Array.isArray(t.gio)) {
    return t.gio.filter((n) => Number.isInteger(n) && n >= 0 && n <= 23).sort((a, b) => a - b);
  }
  if (t && typeof t === 'object' && (t.tu != null || t.den != null)) {
    return legacyTuDenToGio(t.tu, t.den);
  }
  return [];
}

function chuanHoaMangMa(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.map((c) => String(c || '').trim()).filter(Boolean);
}

/** Hai nhóm DVKT; bản ghi cũ chỉ có target_codes → gán hết vào thực hiện */
function layHaiNhomDvktTuMeta(md, targetCode) {
  const chi = chuanHoaMangMa(md?.target_codes_chi_dinh);
  const thuc = chuanHoaMangMa(md?.target_codes_thuc_hien);
  if (chi.length || thuc.length) return { chi, thuc };
  if (Array.isArray(md?.target_codes) && md.target_codes.length) {
    return { chi: [], thuc: chuanHoaMangMa(md.target_codes) };
  }
  const tc = String(targetCode || '').trim();
  if (!tc) return { chi: [], thuc: [] };
  const parts = tc.includes('|') ? tc.split('|').map((s) => s.trim()).filter(Boolean) : [tc];
  return { chi: [], thuc: parts };
}

function sapXepDvktTheoMaTuongDuong(ds) {
  const arr = [...(ds || [])];
  arr.sort((a, b) => {
    const ka = String(a.maTuongDuong || '').localeCompare(String(b.maTuongDuong || ''), 'vi', { numeric: true, sensitivity: 'base' });
    if (ka !== 0) return ka;
    return String(a.code || '').localeCompare(String(b.code || ''), 'vi', { numeric: true, sensitivity: 'base' });
  });
  return arr;
}

/** Sắp xếp danh mục đích: thuốc theo mã + hoạt chất + tên (ABC); VTYT/DVKT theo mã. */
function sapXepDanhMucDichTheoCatalog(ds, catalogRef) {
  const arr = [...(ds || [])];
  if (catalogRef === 'drug_items') {
    arr.sort((a, b) => {
      const ka = `${a.code}\t${a.tenHoatChat || ''}\t${a.name || ''}`;
      const kb = `${b.code}\t${b.tenHoatChat || ''}\t${b.name || ''}`;
      return ka.localeCompare(kb, 'vi', { numeric: true, sensitivity: 'base' });
    });
    return arr;
  }
  if (catalogRef === 'vtyt_items') {
    arr.sort((a, b) => String(a.code || '').localeCompare(String(b.code || ''), 'vi', { numeric: true, sensitivity: 'base' }));
    return arr;
  }
  if (catalogRef === 'dvkt_items') {
    return sapXepDvktTheoMaTuongDuong(arr);
  }
  return arr;
}

function sapXepDanhMucNguonTheoCatalog(ds, catalogRef) {
  const arr = [...(ds || [])];
  if (catalogRef === 'icd10') {
    arr.sort((a, b) => String(a.code || '').localeCompare(String(b.code || ''), 'vi', { numeric: true, sensitivity: 'base' }));
  }
  return arr;
}

/** Lọc toàn bộ danh sách (dùng cho STAFF_DVKT — list / listbox đầy đủ) */
function locToanBo(ds, tuKhoa) {
  const t = String(tuKhoa || '').trim().toLowerCase();
  if (!t) return ds;
  return ds.filter((x) => `${x.code} ${x.name} ${x.maTuongDuong || ''}`.toLowerCase().includes(t));
}

/** Danh sách đầy đủ + lọc (mapping không phải STAFF_DVKT): gộp thêm chức danh/CCHN, mã tương đương, ký hiệu TB… */
function locHetDanhMucDon(ds, tuKhoa) {
  const t = String(tuKhoa || '').trim().toLowerCase();
  if (!t) return ds;
  return ds.filter((x) => {
    const raw = x.raw && typeof x.raw === 'object' ? x.raw : {};
    const kyHieu = String(raw.KY_HIEU || raw.ky_hieu || '').trim();
    const s = [
      x.code,
      x.name,
      x.maTuongDuong,
      x.tenHoatChat,
      x.nhomVtyt,
      x.chucDanh,
      x.chungChi,
      kyHieu,
      raw.TEN_TB,
      raw.TEN_GIA,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return s.includes(t);
  });
}

export default function ModalCatalogMapping({
  visible,
  onClose,
  onLuu,
  bangTheoRef,
  banGhiChinhSua,
  /** Khi truyền: một popup một loại mapping — không đổi loại trong form; nạp đúng DM nguồn/đích từ cha */
  mappingTypeCoDinh = null,
}) {
  const [mappingType, setMappingType] = useState('STAFF_DVKT');
  const [sourceCode, setSourceCode] = useState('');
  const [targetCode, setTargetCode] = useState('');
  /** STAFF_DVKT: DV theo vai trò chỉ định / thực hiện */
  const [targetCodesChiDinh, setTargetCodesChiDinh] = useState([]);
  const [targetCodesThucHien, setTargetCodesThucHien] = useState([]);
  /** ICD↔thuốc, ICD↔DVKT, DVKT↔thuốc, DVKT↔VTYT, ICD↔VTYT: nhiều mã đích / một bản ghi */
  const [targetCodesNhieu, setTargetCodesNhieu] = useState([]);
  const [effectiveFrom, setEffectiveFrom] = useState('');
  const [effectiveTo, setEffectiveTo] = useState('');
  const [priority, setPriority] = useState('0');
  const [metadataText, setMetadataText] = useState('{}');
  const [isActive, setIsActive] = useState(true);
  const [tuKhoaNguon, setTuKhoaNguon] = useState('');
  const [tuKhoaDich, setTuKhoaDich] = useState('');
  const [lichGioTuan, setLichGioTuan] = useState(() => taoLichGioRong());
  const [trucGio, setTrucGio] = useState([]);
  const [loi, setLoi] = useState('');

  const cfg = useMemo(() => layCauHinhLoaiMapping(mappingType), [mappingType]);

  const dsNguon = useMemo(() => {
    if (!cfg) return [];
    const raw = bangTheoRef[cfg.source_catalog] || [];
    return sapXepDanhMucNguonTheoCatalog(raw, cfg.source_catalog);
  }, [bangTheoRef, cfg]);

  const dsDich = useMemo(() => {
    if (!cfg) return [];
    const raw = bangTheoRef[cfg.target_catalog] || [];
    return sapXepDanhMucDichTheoCatalog(raw, cfg.target_catalog);
  }, [bangTheoRef, cfg]);

  const laStaffDvkt = mappingType === 'STAFF_DVKT';
  const laMultiTarget = laMappingNhieuMaDich(mappingType);
  /** Rộng khung ngay khi mở từ thẻ (mappingType state có thể chưa kịp sync). */
  const laMultiTargetLayout = laMappingNhieuMaDich(mappingTypeCoDinh || mappingType);
  const dsDvktSapXep = useMemo(() => (laStaffDvkt ? sapXepDvktTheoMaTuongDuong(dsDich) : dsDich), [dsDich, laStaffDvkt]);
  const dsNhanSuDayDu = useMemo(() => {
    const t = String(tuKhoaNguon || '').trim().toLowerCase();
    const list = dsNguon;
    if (!t) return list;
    return list.filter((x) => {
      const s = `${x.code} ${x.name} ${x.chucDanh || ''} ${x.chungChi || ''}`.toLowerCase();
      return s.includes(t);
    });
  }, [dsNguon, tuKhoaNguon]);
  const dsDvktDayDu = useMemo(() => locToanBo(dsDvktSapXep, tuKhoaDich), [dsDvktSapXep, tuKhoaDich]);

  const dsNguonHet = useMemo(() => locHetDanhMucDon(dsNguon, tuKhoaNguon), [dsNguon, tuKhoaNguon]);
  const dsDichHet = useMemo(() => locHetDanhMucDon(dsDich, tuKhoaDich), [dsDich, tuKhoaDich]);

  useEffect(() => {
    if (!visible) return;
    setLoi('');
    if (banGhiChinhSua) {
      setMappingType(banGhiChinhSua.mapping_type || 'STAFF_DVKT');
      setSourceCode(String(banGhiChinhSua.source_code || ''));
      setTargetCode(String(banGhiChinhSua.target_code || ''));
      setEffectiveFrom(banGhiChinhSua.effective_from ? String(banGhiChinhSua.effective_from).slice(0, 10) : '');
      setEffectiveTo(banGhiChinhSua.effective_to ? String(banGhiChinhSua.effective_to).slice(0, 10) : '');
      setPriority(String(banGhiChinhSua.priority ?? 0));
      setMetadataText(
        banGhiChinhSua.metadata && typeof banGhiChinhSua.metadata === 'object'
          ? JSON.stringify(banGhiChinhSua.metadata, null, 2)
          : '{}',
      );
      setIsActive(banGhiChinhSua.is_active !== false);
      setTuKhoaNguon('');
      setTuKhoaDich('');
      const md = banGhiChinhSua.metadata && typeof banGhiChinhSua.metadata === 'object' ? banGhiChinhSua.metadata : {};
      if (banGhiChinhSua.mapping_type === 'STAFF_DVKT') {
        const hai = layHaiNhomDvktTuMeta(md, banGhiChinhSua.target_code);
        setTargetCodesChiDinh(hai.chi);
        setTargetCodesThucHien(hai.thuc);
        setLichGioTuan(hopNhatLichGio(md.lich_hanh_nghe_tuan));
        setTrucGio(hopNhatTrucGio(md));
        setTargetCodesNhieu([]);
      } else {
        setTargetCodesChiDinh([]);
        setTargetCodesThucHien([]);
        setLichGioTuan(taoLichGioRong());
        setTrucGio([]);
        if (laMappingNhieuMaDich(banGhiChinhSua.mapping_type)) {
          const md = banGhiChinhSua.metadata && typeof banGhiChinhSua.metadata === 'object' ? banGhiChinhSua.metadata : {};
          let arr = [];
          if (Array.isArray(md.target_codes) && md.target_codes.length) {
            arr = md.target_codes.map((c) => String(c || '').trim()).filter(Boolean);
          } else {
            const tc = String(banGhiChinhSua.target_code || '').trim();
            arr = tc ? (tc.includes('|') ? tc.split('|').map((s) => s.trim()).filter(Boolean) : [tc]) : [];
          }
          setTargetCodesNhieu(arr);
        } else {
          setTargetCodesNhieu([]);
        }
      }
    } else {
      setMappingType(mappingTypeCoDinh || 'STAFF_DVKT');
      setSourceCode('');
      setTargetCode('');
      setTargetCodesChiDinh([]);
      setTargetCodesThucHien([]);
      setEffectiveFrom('');
      setEffectiveTo('');
      setPriority('0');
      setMetadataText('{}');
      setIsActive(true);
      setTuKhoaNguon('');
      setTuKhoaDich('');
      setLichGioTuan(taoLichGioRong());
      setTrucGio([]);
      setTargetCodesNhieu([]);
    }
  }, [visible, banGhiChinhSua, mappingTypeCoDinh]);

  const tenNguon = timTenTheoMa(dsNguon, sourceCode);
  const tenDichChi = laStaffDvkt ? timTenNhieuMa(dsDich, targetCodesChiDinh) : '';
  const tenDichThuc = laStaffDvkt ? timTenNhieuMa(dsDich, targetCodesThucHien) : '';
  const tenDich = laStaffDvkt
    ? [tenDichChi && `Chỉ định: ${tenDichChi}`, tenDichThuc && `Thực hiện: ${tenDichThuc}`].filter(Boolean).join(' · ')
    : laMultiTarget
      ? timTenNhieuMa(dsDich, targetCodesNhieu)
      : timTenTheoMa(dsDich, targetCode);

  const handleLuu = () => {
    setLoi('');
    let metadata = {};
    try {
      metadata = metadataText.trim() ? JSON.parse(metadataText) : {};
    } catch {
      setLoi('Metadata không phải JSON hợp lệ.');
      return;
    }

    let maDichLuu = String(targetCode || '').trim();

    if (mappingType === 'STAFF_DVKT') {
      const chi = [...new Set((targetCodesChiDinh || []).map((c) => String(c || '').trim()).filter(Boolean))].sort((a, b) =>
        a.localeCompare(b, 'vi', { numeric: true, sensitivity: 'base' }),
      );
      const thuc = [...new Set((targetCodesThucHien || []).map((c) => String(c || '').trim()).filter(Boolean))].sort((a, b) =>
        a.localeCompare(b, 'vi', { numeric: true, sensitivity: 'base' }),
      );
      if (chi.length === 0 && thuc.length === 0) {
        setLoi('Chọn ít nhất một DVKT ở nhóm được chỉ định hoặc thực hiện.');
        return;
      }
      const codes = [...new Set([...chi, ...thuc])].sort((a, b) =>
        a.localeCompare(b, 'vi', { numeric: true, sensitivity: 'base' }),
      );
      maDichLuu = codes.join('|');
      metadata.target_codes_chi_dinh = chi;
      metadata.target_codes_thuc_hien = thuc;
      delete metadata.target_codes;
      const lichMeta = {};
      THU_TUAN_KEYS.forEach((k) => {
        lichMeta[k] = { gio: [...(lichGioTuan[k] || [])] };
      });
      metadata.lich_hanh_nghe_tuan = lichMeta;
      metadata.tham_gia_truc = { gio: [...trucGio] };
    }

    if (laMappingNhieuMaDich(mappingType) && mappingType !== 'STAFF_DVKT') {
      const codes = [...new Set((targetCodesNhieu || []).map((c) => String(c || '').trim()).filter(Boolean))].sort((a, b) =>
        a.localeCompare(b, 'vi', { numeric: true, sensitivity: 'base' }),
      );
      if (codes.length === 0) {
        setLoi('Chọn ít nhất một mã đích (có thể chọn nhiều mã trong một bản ghi).');
        return;
      }
      maDichLuu = codes.join('|');
      metadata.target_codes = codes;
    }

    const c = layCauHinhLoaiMapping(mappingType);
    const duyetMacDinh = banGhiChinhSua
      ? (banGhiChinhSua.approval_status || 'APPROVED')
      : (c.require_approval ? 'PENDING' : 'APPROVED');

    const row = {
      id: banGhiChinhSua?.id || taoIdMapping(),
      mapping_type: mappingType,
      source_catalog: c.source_catalog,
      target_catalog: c.target_catalog,
      source_id: 0,
      target_id: 0,
      source_code: String(sourceCode || '').trim(),
      target_code: maDichLuu,
      effective_from: effectiveFrom || null,
      effective_to: effectiveTo || null,
      priority: Number(priority) || 0,
      is_active: isActive,
      metadata: typeof metadata === 'object' && metadata !== null ? metadata : {},
      approval_status: duyetMacDinh,
      created_at: banGhiChinhSua?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: banGhiChinhSua?.created_by || '',
      updated_by: '',
    };

    onLuu(row);
  };

  const laSua = Boolean(banGhiChinhSua);
  const tenLoaiHienThi = cfg?.display_name || mappingType;
  const tieuDeChinh = laSua ? `Sửa — ${tenLoaiHienThi}` : `Thêm — ${tenLoaiHienThi}`;

  const toggleTargetMulti = (code) => {
    const c = String(code || '').trim();
    if (!c) return;
    setTargetCodesNhieu((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
  };

  const toggleDvkt = (code, nhom) => {
    const c = String(code || '').trim();
    if (!c) return;
    const setFn = nhom === 'chi' ? setTargetCodesChiDinh : setTargetCodesThucHien;
    setFn((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
  };

  const toggleGioThu = (thu, gio) => {
    setLichGioTuan((prev) => {
      const cur = [...(prev[thu] || [])];
      const idx = cur.indexOf(gio);
      if (idx >= 0) cur.splice(idx, 1);
      else cur.push(gio);
      cur.sort((a, b) => a - b);
      return { ...prev, [thu]: cur };
    });
  };

  const toggleTrucGio = (gio) => {
    setTrucGio((prev) => {
      const cur = [...prev];
      const idx = cur.indexOf(gio);
      if (idx >= 0) cur.splice(idx, 1);
      else cur.push(gio);
      return cur.sort((a, b) => a - b);
    });
  };

  const chonHet24hMotThu = (thu) => {
    setLichGioTuan((prev) => ({ ...prev, [thu]: [...GIO_24] }));
  };
  const boHetMotThu = (thu) => {
    setLichGioTuan((prev) => ({ ...prev, [thu]: [] }));
  };
  const chonHet24hCaTuan = () => {
    setLichGioTuan((prev) => {
      const next = { ...prev };
      THU_TUAN_KEYS.forEach((k) => {
        next[k] = [...GIO_24];
      });
      return next;
    });
  };
  const boHetCaTuan = () => setLichGioTuan(taoLichGioRong());
  const chonHet24hTruc = () => setTrucGio([...GIO_24]);
  const boHetTruc = () => setTrucGio([]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.nen}>
        <View
          style={[
            styles.khung,
            (laStaffDvkt || laMultiTargetLayout) && styles.khungRongStaffDvkt,
            !laStaffDvkt && !laMultiTargetLayout && mappingTypeCoDinh && styles.khungRongDon,
          ]}
        >
        <ScrollView
          style={styles.khungScroll}
          contentContainerStyle={styles.khungScrollContent}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled
        >
          <Text style={styles.tieuDe}>{tieuDeChinh}</Text>

          {mappingTypeCoDinh ? (
            <Text style={styles.nhanLoaiCoDinh}>
              {mappingType} — {TEN_DM_HIEN_THI[cfg?.source_catalog] || cfg?.source_catalog} ↔{' '}
              {TEN_DM_HIEN_THI[cfg?.target_catalog] || cfg?.target_catalog}
            </Text>
          ) : (
            <React.Fragment>
              <Text style={styles.nhan}>Loại mapping</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hang_chip}>
                {CHON_LOAI.map((opt) => (
                  <TouchableOpacity
                    key={opt.value}
                    style={[styles.chip, mappingType === opt.value && styles.chip_chon, laSua && styles.chip_tac]}
                    onPress={() => !laSua && setMappingType(opt.value)}
                    disabled={laSua}
                  >
                    <Text style={[styles.chu_chip, mappingType === opt.value && styles.chu_chip_chon]}>{opt.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </React.Fragment>
          )}

          {laStaffDvkt ? (
            <View style={styles.khoiStaffDvkt}>
              <Text style={styles.nhanMoTa}>
                Chọn nhân viên và DVKT từ danh mục nội bộ đã nạp (Mẫu 02 — Nhân sự; Mẫu 05 — DVKT).
              </Text>
              <View style={styles.haiCotStaffDvkt}>
                <View style={styles.cotNhanSu}>
                  <Text style={styles.nhan}>Danh sách nhân sự</Text>
                  <Text style={styles.nhanNho}>Mẫu 02 · mã: MA_BHXH</Text>
                  <TextInput
                    style={styles.oLoc}
                    value={tuKhoaNguon}
                    onChangeText={setTuKhoaNguon}
                    placeholder="Lọc theo họ tên hoặc mã BHXH…"
                    placeholderTextColor={CD.text.placeholder}
                    editable={!laSua}
                  />
                  <FlatList
                    data={dsNhanSuDayDu}
                    keyExtractor={(item, index) => `ns_${item.code}_${index}`}
                    style={styles.listNhanSu}
                    nestedScrollEnabled
                    keyboardShouldPersistTaps="handled"
                    initialNumToRender={14}
                    maxToRenderPerBatch={24}
                    windowSize={6}
                    removeClippedSubviews={Platform.OS === 'android'}
                    ListEmptyComponent={<Text style={styles.chuTrongList}>Không có nhân sự hoặc chưa nạp danh mục.</Text>}
                    renderItem={({ item: x }) => (
                      <TouchableOpacity
                        style={[styles.dongListNhanSu, sourceCode === x.code && styles.dongListChon]}
                        onPress={() => setSourceCode(x.code)}
                        disabled={laSua}
                        activeOpacity={0.75}
                      >
                        <Text style={styles.tenNhanSuChinh} numberOfLines={2}>{x.name}</Text>
                        <Text style={styles.maNhanSuPhu}>BHXH: {x.code}</Text>
                        {x.chucDanh ? (
                          <Text style={styles.phuNhanSu} numberOfLines={1}>Chức danh: {x.chucDanh}</Text>
                        ) : null}
                        {x.chungChi ? (
                          <Text style={styles.phuNhanSu} numberOfLines={1}>Số CCHN: {x.chungChi}</Text>
                        ) : null}
                      </TouchableOpacity>
                    )}
                  />
                </View>

                <View style={styles.cotDvkt}>
                  <Text style={styles.nhan}>Danh mục dịch vụ (DVKT)</Text>
                  <Text style={styles.nhanNho}>Mẫu 05 · sắp theo mã tương đương — hai nhóm vai trò</Text>
                  <TextInput
                    style={styles.oLoc}
                    value={tuKhoaDich}
                    onChangeText={setTuKhoaDich}
                    placeholder="Lọc chung: tên, mã DV hoặc mã tương đương…"
                    placeholderTextColor={CD.text.placeholder}
                  />
                  <View style={styles.haiNhomDvkt}>
                    <View style={styles.cotDvktNhom}>
                      <Text style={styles.nhanNhomDvkt}>NVYT được chỉ định</Text>
                      <Text style={styles.demDaChon}>Đã chọn: {targetCodesChiDinh.length}</Text>
                      <FlatList
                        data={dsDvktDayDu}
                        keyExtractor={(item, index) => `dv_chi_${item.code}_${index}`}
                        style={[styles.listBoxDvktNhom, styles.listBoxDvktChiDinh]}
                        nestedScrollEnabled
                        keyboardShouldPersistTaps="handled"
                        initialNumToRender={12}
                        maxToRenderPerBatch={20}
                        windowSize={5}
                        removeClippedSubviews={Platform.OS === 'android'}
                        ListEmptyComponent={<Text style={styles.chuTrongList}>Không có DVKT.</Text>}
                        renderItem={({ item: x }) => {
                          const chon = targetCodesChiDinh.includes(x.code);
                          return (
                            <TouchableOpacity
                              style={[styles.dongListBoxDvkt, styles.dongListDvktCoCheckbox, chon && styles.dongListChonChi]}
                              onPress={() => toggleDvkt(x.code, 'chi')}
                              activeOpacity={0.75}
                            >
                              <View style={[styles.vuongCheckbox, chon && styles.vuongCheckboxChonChi]}>
                                <Text style={styles.dauTick}>{chon ? '✓' : ' '}</Text>
                              </View>
                              <View style={styles.cotTextDvkt}>
                                <Text style={styles.tenDvktChinh} numberOfLines={3}>{x.name}</Text>
                                <Text style={styles.maDvktPhu}>{x.code}</Text>
                                {x.maTuongDuong ? (
                                  <Text style={styles.maTuongDuongPhu}>TTĐ: {x.maTuongDuong}</Text>
                                ) : null}
                              </View>
                            </TouchableOpacity>
                          );
                        }}
                      />
                    </View>
                    <View style={styles.cotDvktNhom}>
                      <Text style={styles.nhanNhomDvkt}>NVYT thực hiện</Text>
                      <Text style={styles.demDaChon}>Đã chọn: {targetCodesThucHien.length}</Text>
                      <FlatList
                        data={dsDvktDayDu}
                        keyExtractor={(item, index) => `dv_th_${item.code}_${index}`}
                        style={styles.listBoxDvktNhom}
                        nestedScrollEnabled
                        keyboardShouldPersistTaps="handled"
                        initialNumToRender={12}
                        maxToRenderPerBatch={20}
                        windowSize={5}
                        removeClippedSubviews={Platform.OS === 'android'}
                        ListEmptyComponent={<Text style={styles.chuTrongList}>Không có DVKT.</Text>}
                        renderItem={({ item: x }) => {
                          const chon = targetCodesThucHien.includes(x.code);
                          return (
                            <TouchableOpacity
                              style={[styles.dongListBoxDvkt, styles.dongListDvktCoCheckbox, chon && styles.dongListChon]}
                              onPress={() => toggleDvkt(x.code, 'th')}
                              activeOpacity={0.75}
                            >
                              <View style={[styles.vuongCheckbox, chon && styles.vuongCheckboxChon]}>
                                <Text style={styles.dauTick}>{chon ? '✓' : ' '}</Text>
                              </View>
                              <View style={styles.cotTextDvkt}>
                                <Text style={styles.tenDvktChinh} numberOfLines={3}>{x.name}</Text>
                                <Text style={styles.maDvktPhu}>{x.code}</Text>
                                {x.maTuongDuong ? (
                                  <Text style={styles.maTuongDuongPhu}>TTĐ: {x.maTuongDuong}</Text>
                                ) : null}
                              </View>
                            </TouchableOpacity>
                          );
                        }}
                      />
                    </View>
                  </View>
                </View>
              </View>
              {(sourceCode || targetCodesChiDinh.length || targetCodesThucHien.length) ? (
                <Text style={styles.tomTatChon}>
                  Đã chọn: {tenNguon || '—'} ({sourceCode || '…'}) → {tenDich || '—'}
                </Text>
              ) : null}

              <View style={styles.khoiKhungGio}>
                <Text style={styles.nhanTieu}>Giờ hành nghề trong tuần (0–23)</Text>
                <Text style={styles.nhanNho}>Chọn ô giờ theo từng thứ. Trễ đêm: chọn cả giờ cuối ngày và đầu ngày sau.</Text>
                <View style={styles.hangNhanhCaTuan}>
                  <Text style={styles.nhanNhoInline}>Chọn nhanh cả tuần:</Text>
                  <TouchableOpacity style={styles.nutNhanhGio} onPress={chonHet24hCaTuan} activeOpacity={0.8}>
                    <Text style={styles.chuNutNhanhGio}>Cả tuần — 24 giờ</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.nutNhanhGioPhu} onPress={boHetCaTuan} activeOpacity={0.8}>
                    <Text style={styles.chuNutNhanhGio}>Cả tuần — bỏ hết</Text>
                  </TouchableOpacity>
                </View>
                {THU_TUAN_KEYS.map((thu) => (
                  <View key={thu} style={styles.dongGioCheckboxCol}>
                    <View style={styles.hangNhanVaNutNhanh}>
                      <Text style={styles.nhanThuNgan}>{NHAN_THU_TUAN[thu]}</Text>
                      <TouchableOpacity style={styles.nutNhanhGioNho} onPress={() => chonHet24hMotThu(thu)} activeOpacity={0.8}>
                        <Text style={styles.chuNutNhanhGioNho}>24h</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.nutNhanhGioNho} onPress={() => boHetMotThu(thu)} activeOpacity={0.8}>
                        <Text style={styles.chuNutNhanhGioNho}>Bỏ</Text>
                      </TouchableOpacity>
                    </View>
                    <View style={styles.hang24Gio}>
                      {GIO_24.map((h) => {
                        const chon = (lichGioTuan[thu] || []).includes(h);
                        return (
                          <TouchableOpacity
                            key={`${thu}_${h}`}
                            style={[styles.oGioCheckbox, chon && styles.oGioCheckboxChon]}
                            onPress={() => toggleGioThu(thu, h)}
                          >
                            <Text style={[styles.chuGioCheckbox, chon && styles.chuGioCheckboxChon]}>{h}</Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                ))}

                <Text style={styles.nhanTieu}>Tham gia trực (giờ trong ngày 0–23)</Text>
                <Text style={styles.nhanNho}>Chọn các giờ trong ca trực (có thể nối qua nửa đêm bằng nhiều ô).</Text>
                <View style={styles.dongGioCheckboxCol}>
                  <View style={styles.hangNhanVaNutNhanh}>
                    <Text style={styles.nhanThuNgan}>Trực</Text>
                    <TouchableOpacity style={styles.nutNhanhGioNho} onPress={chonHet24hTruc} activeOpacity={0.8}>
                      <Text style={styles.chuNutNhanhGioNho}>24h</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.nutNhanhGioNho} onPress={boHetTruc} activeOpacity={0.8}>
                      <Text style={styles.chuNutNhanhGioNho}>Bỏ</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.hang24Gio}>
                    {GIO_24.map((h) => {
                      const chon = trucGio.includes(h);
                      return (
                        <TouchableOpacity
                          key={`truc_${h}`}
                          style={[styles.oGioCheckbox, chon && styles.oGioCheckboxChonTruc]}
                          onPress={() => toggleTrucGio(h)}
                        >
                          <Text style={[styles.chuGioCheckbox, chon && styles.chuGioCheckboxChon]}>{h}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.khoiHaiCotDon}>
              <View style={styles.cotBangDon}>
                <Text style={styles.nhan}>Nguồn — {TEN_DM_HIEN_THI[cfg?.source_catalog] || cfg?.source_catalog}</Text>
                <Text style={styles.nhanNho}>Chọn một dòng (danh mục nội bộ đã nạp đầy đủ)</Text>
                <TextInput
                  style={styles.oLoc}
                  value={tuKhoaNguon}
                  onChangeText={setTuKhoaNguon}
                  placeholder="Lọc theo mã, tên, chức danh…"
                  placeholderTextColor={CD.text.placeholder}
                  editable={!laSua}
                />
                <Text style={styles.demBangDon}>{dsNguonHet.length} mã</Text>
                <FlatList
                  data={dsNguonHet}
                  keyExtractor={(item, index) => `src_${item.code}_${index}`}
                  style={styles.listDonDayDu}
                  nestedScrollEnabled
                  keyboardShouldPersistTaps="handled"
                  initialNumToRender={16}
                  maxToRenderPerBatch={28}
                  windowSize={6}
                  removeClippedSubviews={Platform.OS === 'android'}
                  ListEmptyComponent={<Text style={styles.chuTrongList}>Không có dữ liệu hoặc chưa khớp bộ lọc.</Text>}
                  renderItem={({ item: x }) => {
                    const chon = sourceCode === x.code;
                    return (
                      <TouchableOpacity
                        style={[styles.dongListDon, chon && styles.dongListChon]}
                        onPress={() => {
                          setSourceCode(x.code);
                          setTuKhoaNguon('');
                        }}
                        disabled={laSua}
                        activeOpacity={0.75}
                      >
                        <Text style={styles.maListDon} numberOfLines={1}>{x.code}</Text>
                        <Text style={styles.tenListDon} numberOfLines={3}>{x.name}</Text>
                        {x.maTuongDuong ? <Text style={styles.phuListDon}>TTĐ: {x.maTuongDuong}</Text> : null}
                        {x.chucDanh ? <Text style={styles.phuListDon}>CD: {x.chucDanh}</Text> : null}
                        {x.chungChi ? <Text style={styles.phuListDon}>CCHN: {x.chungChi}</Text> : null}
                      </TouchableOpacity>
                    );
                  }}
                />
              </View>

              <View style={styles.cotBangDon}>
                <Text style={styles.nhan}>Đích — {TEN_DM_HIEN_THI[cfg?.target_catalog] || cfg?.target_catalog}</Text>
                <Text style={styles.nhanNho}>
                  {laMultiTarget
                    ? 'Chọn một hoặc nhiều mã đích (tap để bật/tắt). Một ICD có thể gắn nhiều thuốc/DVKT/VTYT; nhiều ICD khác nhau có thể cùng một mã đích — lưu thành nhiều dòng mapping.'
                    : 'Chọn một dòng đích'}
                </Text>
                <TextInput
                  style={styles.oLoc}
                  value={tuKhoaDich}
                  onChangeText={setTuKhoaDich}
                  placeholder="Lọc theo mã, tên, hoạt chất…"
                  placeholderTextColor={CD.text.placeholder}
                />
                <Text style={styles.demBangDon}>
                  {dsDichHet.length} mã
                  {laMultiTarget && cfg?.target_catalog === 'drug_items' ? ' · sắp A→Z (mã / hoạt chất / tên)' : ''}
                </Text>
                <FlatList
                  data={dsDichHet}
                  keyExtractor={(item, index) => `tgt_${item.code}_${index}`}
                  style={styles.listDonDayDu}
                  nestedScrollEnabled
                  keyboardShouldPersistTaps="handled"
                  initialNumToRender={16}
                  maxToRenderPerBatch={28}
                  windowSize={6}
                  removeClippedSubviews={Platform.OS === 'android'}
                  ListEmptyComponent={<Text style={styles.chuTrongList}>Không có dữ liệu hoặc chưa khớp bộ lọc.</Text>}
                  renderItem={({ item: x }) => {
                    const chon = laMultiTarget ? targetCodesNhieu.includes(x.code) : targetCode === x.code;
                    return (
                      <TouchableOpacity
                        style={[styles.dongListDon, chon && styles.dongListChon]}
                        onPress={() => {
                          if (laMultiTarget) {
                            toggleTargetMulti(x.code);
                          } else {
                            setTargetCode(x.code);
                            setTuKhoaDich('');
                          }
                        }}
                        activeOpacity={0.75}
                      >
                        <Text style={styles.maListDon} numberOfLines={1}>{x.code}</Text>
                        {cfg?.target_catalog === 'drug_items' && x.tenHoatChat ? (
                          <Text style={styles.phuListDon} numberOfLines={2}>
                            HC: {x.tenHoatChat}
                          </Text>
                        ) : null}
                        <Text style={styles.tenListDon} numberOfLines={3}>{x.name}</Text>
                        {x.maTuongDuong ? <Text style={styles.phuListDon}>TTĐ: {x.maTuongDuong}</Text> : null}
                        {cfg?.target_catalog === 'vtyt_items' && x.nhomVtyt ? (
                          <Text style={styles.phuListDon} numberOfLines={1}>
                            Nhóm: {x.nhomVtyt}
                          </Text>
                        ) : null}
                      </TouchableOpacity>
                    );
                  }}
                />
              </View>
            </View>
          )}

          {!laStaffDvkt && (sourceCode || targetCode || (laMultiTarget && targetCodesNhieu.length > 0)) ? (
            <Text style={styles.tomTatChonDon}>
              {tenNguon ? `${tenNguon} (${sourceCode})` : sourceCode || '…'} →{' '}
              {laMultiTarget
                ? (tenDich ? `${tenDich} (${targetCodesNhieu.join(', ')})` : targetCodesNhieu.join(', ') || '…')
                : tenDich
                  ? `${tenDich} (${targetCode})`
                  : targetCode || '…'}
            </Text>
          ) : null}

          <View style={styles.hangHaiOt}>
            <View style={styles.oCo}>
              <Text style={styles.nhan}>Hiệu lực từ</Text>
              <OChonNgayISO
                style={styles.oNhapNho}
                value={effectiveFrom}
                onChangeValue={setEffectiveFrom}
                placeholder="Chọn ngày bắt đầu"
              />
            </View>
            <View style={styles.oCo}>
              <Text style={styles.nhan}>Hiệu lực đến</Text>
              <OChonNgayISO
                style={styles.oNhapNho}
                value={effectiveTo}
                onChangeValue={setEffectiveTo}
                placeholder="Trống = không giới hạn"
              />
            </View>
            <View style={styles.oCo}>
              <Text style={styles.nhan}>Ưu tiên</Text>
              <TextInput style={styles.oNhapNho} value={priority} onChangeText={setPriority} keyboardType="numeric" placeholderTextColor={CD.text.placeholder} />
            </View>
          </View>

          <Text style={styles.nhan}>Metadata (JSON)</Text>
          <TextInput
            style={[styles.oNhap, styles.oMeta]}
            value={metadataText}
            onChangeText={setMetadataText}
            multiline
            placeholder='{"role":"primary"}'
            placeholderTextColor={CD.text.placeholder}
          />

          <View style={styles.hangNut}>
            <TouchableOpacity style={styles.nutPhu} onPress={() => setIsActive(!isActive)}>
              <Text style={styles.chuNut}>{isActive ? '✓ Đang hoạt động' : '✗ Đã vô hiệu'}</Text>
            </TouchableOpacity>
            {layCauHinhLoaiMapping(mappingType)?.require_approval && !laSua ? (
              <Text style={styles.trangThaiDuyet}>Bản ghi mới: chờ duyệt (PENDING)</Text>
            ) : null}
          </View>

          {loi ? <Text style={styles.loi}>{loi}</Text> : null}

          <View style={styles.hangHanhDong}>
            <TouchableOpacity style={styles.nutHuy} onPress={onClose}>
              <Text style={styles.chuNut}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.nutLuu} onPress={handleLuu}>
              <Text style={styles.chuNut}>Lưu</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  nen: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    padding: 16,
    ...Platform.select({ web: { alignItems: 'center' } }),
  },
  khung: {
    backgroundColor: CD.bg.glass_modal,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: CD.border.glass_md,
    padding: 20,
    maxWidth: 720,
    width: '100%',
    maxHeight: '92%',
    ...Platform.select({ web: { boxShadow: CD.web.shadow_modal } }),
  },
  khungRongStaffDvkt: {
    maxWidth: 1120,
  },
  khungRongDon: {
    maxWidth: 1040,
  },
  nhanLoaiCoDinh: {
    fontSize: 13,
    color: CD.text.muted,
    marginBottom: 14,
    lineHeight: 20,
    fontFamily: CD.font.family,
  },
  khoiHaiCotDon: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    gap: 12,
    alignItems: 'stretch',
    marginBottom: 8,
  },
  cotBangDon: {
    flex: 1,
    minWidth: 260,
  },
  listDonDayDu: {
    maxHeight: 320,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: CD.border.divider,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  dongListDon: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: CD.border.divider,
  },
  maListDon: { fontSize: 13, fontWeight: '800', color: CD.text.accent, fontFamily: CD.font.family },
  tenListDon: { fontSize: 14, color: CD.text.table_cell, marginTop: 4, fontFamily: CD.font.family },
  phuListDon: { fontSize: 11, color: CD.text.muted, marginTop: 2, fontFamily: CD.font.family },
  demBangDon: { fontSize: 12, color: CD.text.success, marginBottom: 6, fontFamily: CD.font.family },
  tomTatChonDon: {
    marginTop: 10,
    marginBottom: 6,
    fontSize: 13,
    color: CD.text.success,
    lineHeight: 20,
    fontFamily: CD.font.family,
  },
  khungScroll: {
    width: '100%',
    ...Platform.select({
      web: { maxHeight: '85vh' },
      default: { maxHeight: 640 },
    }),
  },
  khungScrollContent: {
    paddingBottom: 8,
    flexGrow: 1,
  },
  khoiStaffDvkt: { marginBottom: 8 },
  nhanMoTa: {
    fontSize: 13,
    color: CD.text.muted,
    marginBottom: 10,
    lineHeight: 20,
    fontFamily: CD.font.family,
  },
  haiCotStaffDvkt: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    gap: 14,
    alignItems: 'stretch',
  },
  cotNhanSu: { flex: 1, minWidth: 260 },
  cotDvkt: { flex: 1, minWidth: 280 },
  haiNhomDvkt: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    gap: 12,
    alignItems: 'stretch',
  },
  cotDvktNhom: { flex: 1, minWidth: 220 },
  nhanNhomDvkt: {
    fontSize: 13,
    fontWeight: '700',
    color: CD.text.accent,
    marginBottom: 4,
    fontFamily: CD.font.family,
  },
  listBoxDvktNhom: {
    maxHeight: 240,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'rgba(216,27,96,0.45)',
    backgroundColor: 'rgba(0,0,0,0.2)',
    ...Platform.select({ web: { boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.25)' } }),
  },
  listBoxDvktChiDinh: {
    borderColor: 'rgba(0,131,143,0.55)',
  },
  nhanNho: {
    fontSize: 12,
    color: CD.text.muted,
    marginBottom: 6,
    fontFamily: CD.font.family,
  },
  oLoc: {
    backgroundColor: CD.bg.glass_input,
    borderWidth: 1,
    borderColor: CD.border.input,
    borderRadius: 10,
    color: CD.text.primary,
    fontSize: 15,
    padding: 10,
    marginBottom: 8,
    fontFamily: CD.font.family,
  },
  listNhanSu: {
    maxHeight: 280,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: CD.border.divider,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  dongListNhanSu: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: CD.border.divider,
  },
  dongListBoxDvkt: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  dongListDvktCoCheckbox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  vuongCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: CD.border.input,
    backgroundColor: CD.bg.glass_input,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vuongCheckboxChon: { backgroundColor: 'rgba(216,27,96,0.45)', borderColor: '#D81B60' },
  vuongCheckboxChonChi: { backgroundColor: 'rgba(0,151,167,0.45)', borderColor: '#00838F' },
  dauTick: { fontSize: 13, color: CD.text.primary, fontWeight: '800', fontFamily: CD.font.family },
  cotTextDvkt: { flex: 1, minWidth: 0 },
  maTuongDuongPhu: { fontSize: 11, color: CD.text.muted, marginTop: 2, fontFamily: CD.font.family },
  demDaChon: { fontSize: 12, color: CD.text.success, marginBottom: 6, fontFamily: CD.font.family },
  dongListChon: {
    backgroundColor: 'rgba(216,27,96,0.35)',
    borderLeftWidth: 4,
    borderLeftColor: '#D81B60',
  },
  dongListChonChi: {
    backgroundColor: 'rgba(0,151,167,0.22)',
    borderLeftWidth: 4,
    borderLeftColor: '#00838F',
  },
  tenNhanSuChinh: { fontSize: 16, fontWeight: '700', color: CD.text.primary, fontFamily: CD.font.family },
  maNhanSuPhu: { fontSize: 13, color: CD.text.secondary, marginTop: 4, fontFamily: CD.font.family },
  phuNhanSu: { fontSize: 12, color: CD.text.muted, marginTop: 2, fontFamily: CD.font.family },
  khoiKhungGio: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: CD.border.divider,
  },
  nhanTieu: {
    fontSize: 14,
    fontWeight: '600',
    color: CD.text.secondary,
    marginBottom: 4,
    fontFamily: CD.font.family,
  },
  hangNhanhCaTuan: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  nhanNhoInline: { fontSize: 12, color: CD.text.muted, fontFamily: CD.font.family },
  nutNhanhGio: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(216,27,96,0.35)',
    borderWidth: 1,
    borderColor: '#AD1457',
    ...Platform.select({ web: { cursor: 'pointer' } }),
  },
  nutNhanhGioPhu: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: CD.bg.glass_input,
    borderWidth: 1,
    borderColor: CD.border.glass_md,
    ...Platform.select({ web: { cursor: 'pointer' } }),
  },
  chuNutNhanhGio: { fontSize: 12, color: CD.text.primary, fontWeight: '700', fontFamily: CD.font.family },
  dongGioCheckboxCol: { marginBottom: 8 },
  hangNhanVaNutNhanh: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 4,
  },
  nutNhanhGioNho: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: CD.border.input,
    ...Platform.select({ web: { cursor: 'pointer' } }),
  },
  chuNutNhanhGioNho: { fontSize: 11, color: CD.text.secondary, fontWeight: '700', fontFamily: CD.font.family },
  nhanThuNgan: {
    minWidth: 32,
    fontSize: 12,
    color: CD.text.secondary,
    fontFamily: CD.font.family,
    fontWeight: '700',
  },
  hang24Gio: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 3,
    alignItems: 'center',
  },
  oGioCheckbox: {
    minWidth: 26,
    paddingVertical: 4,
    paddingHorizontal: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: CD.border.input,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  oGioCheckboxChon: {
    backgroundColor: 'rgba(216,27,96,0.35)',
    borderColor: '#D81B60',
  },
  oGioCheckboxChonTruc: {
    backgroundColor: 'rgba(33,150,243,0.35)',
    borderColor: '#2196F3',
  },
  chuGioCheckbox: { fontSize: 10, color: CD.text.muted, fontFamily: CD.font.family },
  chuGioCheckboxChon: { color: CD.text.primary, fontWeight: '700' },
  tenDvktChinh: { fontSize: 14, fontWeight: '600', color: CD.text.table_cell, fontFamily: CD.font.family },
  maDvktPhu: { fontSize: 12, color: CD.text.accent, marginTop: 4, fontFamily: CD.font.family },
  chuTrongList: { padding: 16, color: CD.text.muted, fontSize: 14, fontFamily: CD.font.family },
  tomTatChon: {
    marginTop: 10,
    fontSize: 13,
    color: CD.text.success,
    lineHeight: 20,
    fontFamily: CD.font.family,
  },
  tieuDe: { fontSize: 22, fontWeight: 'bold', color: CD.text.primary, marginBottom: 16, fontFamily: CD.font.family },
  nhan: { fontSize: 14, color: CD.text.secondary, marginBottom: 6, fontFamily: CD.font.family },
  oNhap: {
    backgroundColor: CD.bg.glass_input,
    borderWidth: 1,
    borderColor: CD.border.input,
    borderRadius: 10,
    color: CD.text.primary,
    fontSize: 17,
    padding: 12,
    fontFamily: CD.font.family,
  },
  oNhapNho: {
    backgroundColor: CD.bg.glass_input,
    borderWidth: 1,
    borderColor: CD.border.input,
    borderRadius: 10,
    color: CD.text.primary,
    fontSize: 16,
    padding: 10,
    fontFamily: CD.font.family,
  },
  oMeta: { minHeight: 88, textAlignVertical: 'top' },
  tenPhu: { fontSize: 14, color: CD.text.success, marginBottom: 6, fontFamily: CD.font.family },
  goiY: { maxHeight: 120, marginBottom: 10 },
  dongGoiY: { flexDirection: 'row', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: CD.border.divider },
  maGoiY: { width: 120, fontSize: 14, color: CD.text.accent, fontWeight: '700', fontFamily: CD.font.family },
  tenGoiY: { flex: 1, fontSize: 14, color: CD.text.table_cell, fontFamily: CD.font.family },
  hangHaiOt: { flexDirection: 'row', gap: 10, marginBottom: 10, flexWrap: 'wrap' },
  oCo: { flex: 1, minWidth: 100 },
  hang_chip: { marginBottom: 14 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: CD.border.glass,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: CD.bg.glass_card,
  },
  chip_chon: { backgroundColor: '#D81B60', borderColor: '#AD1457' },
  chip_tac: { opacity: 0.85 },
  chu_chip: { color: CD.text.secondary, fontSize: 14, fontFamily: CD.font.family },
  chu_chip_chon: { color: '#FFF', fontWeight: '700' },
  hangNut: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 16 },
  nutPhu: { padding: 8 },
  chuNut: { color: CD.text.primary, fontWeight: '700', fontSize: 17, fontFamily: CD.font.family },
  trangThaiDuyet: { fontSize: 14, color: CD.text.secondary, fontFamily: CD.font.family },
  loi: { color: '#FF8A80', marginTop: 8, fontSize: 15, fontFamily: CD.font.family },
  hangHanhDong: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 16 },
  nutHuy: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: CD.border.glass_md,
    backgroundColor: CD.bg.glass_input,
  },
  nutLuu: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: CD.brand.mauChinh,
    ...Platform.select({ web: { cursor: 'pointer' } }),
  },
});
