/**
 * Module Mapping Danh mục — theo Đặc tả kỹ thuật v1.0:
 * bảng catalog_mapping (client), mapping_type_config, lọc + danh sách + thêm/sửa + xuất Excel.
 */

import * as XLSX from 'xlsx';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ModalCatalogMapping from '../thanh_phan/modal_catalog_mapping';
import OChonNgayISO from '../thanh_phan/o_chon_ngay_iso';
import {
  invalidateBangCatalogMappingCache,
  taiBangChoLoaiMapping,
  taiTatCaBangChoMapping,
  timTenNhieuMa,
  timTenTheoMa,
} from '../tien_ich/catalog_mapping_catalog_loaders';
import {
  laMappingNhieuMaDich,
  layCauHinhLoaiMapping,
  LAY_MAPPING_TYPE_OPTIONS,
  MAPPING_TYPE_CONFIG,
} from '../tien_ich/catalog_mapping_types';
import {
  luuTatCaBanGhiMapping,
  mappingCoHieuLucTaiNgay,
  taiTatCaBanGhiMapping,
  validateMappingMoi,
} from '../tien_ich/catalog_mapping_luu_tru';
import { CD } from '../tien_ich/chu_de_giao_dien';
import { quayLaiAnToan } from '../tien_ich/dieu_huong_an_toan';

const BO_LOC_TRANG_THAI = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'active', label: 'Đang hoạt động' },
  { value: 'inactive', label: 'Đã vô hiệu' },
];

const MappingNghiepVu = ({ navigation }) => {
  const { width: winW } = useWindowDimensions();
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

  const layNhomDvktStaff = (r) => {
    const md = r.metadata && typeof r.metadata === 'object' ? r.metadata : {};
    const norm = (a) => (Array.isArray(a) ? a.map((x) => String(x || '').trim()).filter(Boolean) : []);
    let chi = norm(md.target_codes_chi_dinh);
    let thuc = norm(md.target_codes_thuc_hien);
    if (chi.length || thuc.length) return { chi, thuc };
    if (Array.isArray(md.target_codes) && md.target_codes.length) return { chi: [], thuc: norm(md.target_codes) };
    const tc = String(r.target_code || '').trim();
    if (!tc) return { chi: [], thuc: [] };
    return { chi: [], thuc: tc.includes('|') ? tc.split('|').map((s) => s.trim()).filter(Boolean) : [tc] };
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
    return tc.includes('|') ? tc.split('|').map((s) => s.trim()).filter(Boolean) : [tc];
  };

  const laMultiMaNguonIcd = (mt) => ['ICD_DRUG', 'ICD_DVKT', 'ICD_VTYT'].includes(mt);

  /** Một bản ghi có thể gom nhiều ICD nguồn (source_code dạng A|B hoặc metadata.source_icd_codes). */
  const layMaNguonMultiIcd = (r) => {
    if (!laMultiMaNguonIcd(r.mapping_type)) return [];
    const md = r.metadata && typeof r.metadata === 'object' ? r.metadata : {};
    if (Array.isArray(md.source_icd_codes) && md.source_icd_codes.length) {
      return md.source_icd_codes.map((c) => String(c || '').trim()).filter(Boolean);
    }
    const sc = String(r.source_code || '').trim();
    if (!sc) return [];
    return sc.includes('|') ? sc.split('|').map((s) => s.trim()).filter(Boolean) : [sc];
  };

  const bangMergedChoModal = useMemo(
    () => ({ ...bangTheoRef, ...bangModalTheoLoai }),
    [bangTheoRef, bangModalTheoLoai],
  );

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
      const { chi, thuc } = r.mapping_type === 'STAFF_DVKT' ? layNhomDvktStaff(r) : { chi: [], thuc: [] };
      const extraParts = [];
      if (r.mapping_type === 'STAFF_DVKT') extraParts.push(...chi, ...thuc);
      else {
        if (laMappingNhieuMaDich(r.mapping_type)) extraParts.push(...layMaDichMultiNghiepVu(r));
        if (laMultiMaNguonIcd(r.mapping_type)) extraParts.push(...layMaNguonMultiIcd(r));
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
    if (laMultiMaNguonIcd(r.mapping_type)) return timTenNhieuMa(ds, layMaNguonMultiIcd(r));
    return timTenTheoMa(ds, r.source_code);
  };
  const tenDich = (r) => {
    const c = layCauHinhLoaiMapping(r.mapping_type);
    if (!c) return '';
    const ds = bangTheoRef[c.target_catalog] || [];
    if (r.mapping_type === 'STAFF_DVKT') {
      const { chi, thuc } = layNhomDvktStaff(r);
      const a = timTenNhieuMa(ds, chi);
      const b = timTenNhieuMa(ds, thuc);
      return [a && `CD: ${a}`, b && `TH: ${b}`].filter(Boolean).join(' · ');
    }
    if (laMappingNhieuMaDich(r.mapping_type)) {
      return timTenNhieuMa(ds, layMaDichMultiNghiepVu(r));
    }
    return timTenTheoMa(ds, r.target_code);
  };
  const maDichChiDinh = (r) => (r.mapping_type === 'STAFF_DVKT' ? layNhomDvktStaff(r).chi.join(', ') : '');
  const tenDichChiDinh = (r) => {
    if (r.mapping_type !== 'STAFF_DVKT') return '';
    const c = layCauHinhLoaiMapping(r.mapping_type);
    if (!c) return '';
    return timTenNhieuMa(bangTheoRef[c.target_catalog] || [], layNhomDvktStaff(r).chi);
  };
  const maDichThucHien = (r) => {
    if (r.mapping_type === 'STAFF_DVKT') return layNhomDvktStaff(r).thuc.join(', ');
    if (laMappingNhieuMaDich(r.mapping_type)) return layMaDichMultiNghiepVu(r).join(', ');
    return r.target_code || '';
  };
  const tenDichThucHien = (r) => {
    const c = layCauHinhLoaiMapping(r.mapping_type);
    if (!c) return '';
    const ds = bangTheoRef[c.target_catalog] || [];
    if (r.mapping_type === 'STAFF_DVKT') return timTenNhieuMa(ds, layNhomDvktStaff(r).thuc);
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

    const v = validateMappingMoi({ rows: merged, rowMoi, boQuaId: rowMoi.id });
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

  /** Bảng tối thiểu rộng bằng khung nhìn (trừ padding) để cột flex giãn full màn hình */
  const rongBangToiThieu = Math.max(1180, (winW || 800) - 24);

  const xuatExcel = () => {
    if (hangLoc.length === 0) {
      Alert.alert('Thông báo', 'Không có dòng để xuất.');
      return;
    }
    const sheet = hangLoc.map((r, i) => ({
      STT: i + 1,
      Loai: r.mapping_type,
      Ma_nguon: r.source_code,
      Ten_nguon: tenNguon(r),
      Ma_chi_dinh: maDichChiDinh(r),
      Ten_chi_dinh: tenDichChiDinh(r),
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

  return (
    <SafeAreaView style={styles.vung_an_toan}>
      <View style={styles.khoi_header_gop}>
        <View style={styles.thanh_tieu_de}>
          <TouchableOpacity onPress={() => quayLaiAnToan(navigation, 'TongQuan')} style={styles.nut_quay_lai}>
            <Text style={styles.chu_nut_header}>⬅ TỔNG QUAN</Text>
          </TouchableOpacity>
          <Text style={styles.chu_tieu_de} numberOfLines={1}>MAPPING DANH MỤC</Text>
          <TouchableOpacity onPress={() => navigation.navigate('QuanLyDanhMuc')} style={styles.nut_phu}>
            <Text style={styles.chu_nut_header}>📋 DM GỐC</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          style={styles.hang_the_header}
          contentContainerStyle={styles.hang_the_header_content}
        >
          {MAPPING_TYPE_CONFIG.map((c) => (
            <TouchableOpacity
              key={c.mapping_type}
              style={[styles.the_loai_header, dangTaiModal && styles.nut_loai_mapping_tac]}
              onPress={() => moThemMapping(c.mapping_type)}
              disabled={dangTaiModal}
            >
              <Text style={styles.chu_the_loai_ma} numberOfLines={1}>+ {c.mapping_type}</Text>
              <Text style={styles.chu_the_loai_ten} numberOfLines={1}>{c.display_name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <Text style={styles.moTa} numberOfLines={2}>
        Bảng <Text style={styles.inDam}>catalog_mapping</Text> — <Text style={styles.inDam}>mapping_type</Text>. Lưu cục bộ ·{' '}
        {MAPPING_TYPE_CONFIG.length} loại.
      </Text>

      <View style={styles.khoi_loc}>
        <Text style={styles.nhan_loc_nho}>Lọc loại (sub-tab)</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hang_sub_tab}>
          {LAY_MAPPING_TYPE_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value || 'all'}
              style={[styles.chip_sub, locLoai === opt.value && styles.chip_sub_chon]}
              onPress={() => setLocLoai(opt.value)}
            >
              <Text style={[styles.chu_chip_sub, locLoai === opt.value && styles.chu_chip_sub_chon]} numberOfLines={1}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.hang_loc_phu}>
          <Text style={styles.nhan_loc_nho}>Trạng thái</Text>
          <View style={styles.hang_loc_row}>
            {BO_LOC_TRANG_THAI.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[styles.chip_nho, locTrangThai === opt.value && styles.chip_loc_chon]}
                onPress={() => setLocTrangThai(opt.value)}
              >
                <Text style={[styles.chu_chip_nho, locTrangThai === opt.value && styles.chu_chip_loc_chon]} numberOfLines={1}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

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
          <View style={[styles.o_loc_co_nhan, { flex: 1, minWidth: 160 }]}>
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

      <View style={styles.hang_hanh_dong}>
        <TouchableOpacity style={styles.nut_phu2} onPress={xuatExcel}>
          <Text style={styles.chu_nut_phu}>📥 XUẤT EXCEL</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.nut_phu2} onPress={nap}>
          <Text style={styles.chu_nut_phu}>↻ TẢI LẠI</Text>
        </TouchableOpacity>
      </View>

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
                <Text style={[styles.cot, styles.cot_ma_cd]}>Mã chỉ định</Text>
                <Text style={[styles.cot, styles.cot_ten_nhom]}>Tên chỉ định</Text>
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
                    <Text style={[styles.cot, styles.cot_ma]}>{r.source_code}</Text>
                    <Text style={[styles.cot, styles.cot_ten]}>{tenNguon(r) || '—'}</Text>
                    <Text style={[styles.cot, styles.cot_ma_cd]}>{maDichChiDinh(r) || '—'}</Text>
                    <Text style={[styles.cot, styles.cot_ten_nhom]}>{tenDichChiDinh(r) || '—'}</Text>
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
                  <Text style={styles.trong}>Chưa có bản ghi. Thêm từ header hoặc chỉnh bộ lọc.</Text>
                ) : null}
              </ScrollView>
            </View>
          </ScrollView>
        )}
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
  khoi_header_gop: {
    flexShrink: 0,
    backgroundColor: CD.brand.mauDam,
    borderBottomWidth: 1,
    borderBottomColor: CD.border.header,
    ...Platform.select({ web: { backgroundImage: CD.web.gradient_header, backdropFilter: CD.web.blur_header, boxShadow: CD.web.shadow_header } }),
  },
  thanh_tieu_de: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    paddingTop: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  hang_the_header: { maxHeight: 52, flexGrow: 0 },
  hang_the_header_content: {
    flexDirection: 'row',
    alignItems: 'stretch',
    paddingHorizontal: 8,
    paddingBottom: 8,
    gap: 6,
  },
  the_loai_header: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    minWidth: 112,
    maxWidth: 200,
    ...Platform.select({ web: { cursor: 'pointer' } }),
  },
  chu_the_loai_ma: { color: '#FFF', fontWeight: '800', fontSize: 11, fontFamily: CD.font.family },
  chu_the_loai_ten: { color: 'rgba(255,255,255,0.9)', fontSize: 10, marginTop: 2, fontFamily: CD.font.family },
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
    fontSize: 13,
    lineHeight: 18,
    color: CD.text.secondary,
    marginHorizontal: 12,
    marginTop: 8,
    marginBottom: 6,
    fontFamily: CD.font.family,
  },
  inDam: { fontWeight: '800', color: CD.text.primary },
  khoi_loc: {
    flexShrink: 0,
    backgroundColor: CD.bg.glass_card,
    borderRadius: 0,
    borderWidth: 0,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 0,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: CD.border.glass,
  },
  nhan_loc_nho: { fontSize: 11, color: CD.text.muted, marginBottom: 4, fontFamily: CD.font.family, textTransform: 'uppercase', letterSpacing: 0.3 },
  hang_sub_tab: { marginBottom: 6, maxHeight: 40 },
  chip_sub: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: CD.border.glass,
    marginRight: 6,
    backgroundColor: CD.bg.glass_input,
    maxHeight: 34,
    justifyContent: 'center',
  },
  chip_sub_chon: { backgroundColor: '#D81B60', borderColor: '#AD1457' },
  chu_chip_sub: { fontSize: 11, color: CD.text.secondary, fontFamily: CD.font.family },
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
    fontSize: 14,
    paddingVertical: 8,
    paddingHorizontal: 10,
    fontFamily: CD.font.family,
  },
  nut_loai_mapping_tac: { opacity: 0.55 },
  hang_hanh_dong: {
    flexShrink: 0,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
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
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  chu_nut_phu: { color: CD.text.primary, fontWeight: '700', fontSize: 15, fontFamily: CD.font.family },
  dang_tai: { color: CD.text.muted, fontSize: 16, fontFamily: CD.font.family, padding: 16 },
  vung_bang_outer: { flex: 1, minHeight: 0, paddingHorizontal: 8, paddingBottom: 8 },
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
