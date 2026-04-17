/**
 * Thẻ chuyên môn: Danh mục tương tác thuốc — cột cố định, đồng bộ DANH_MUC_TUONG_TAC_THUOC.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import * as XLSX from 'xlsx';

import { CD } from '../../tien_ich/chu_de_giao_dien';
import { locDongTheoTuKhoa, SO_DONG_TRANG_MAC_DINH, tinhChiSoPhanTrang } from '../../tien_ich/bo_loc_bang_du_lieu';
import { ghiMangDanhMucVaoStorage, taiBoDuLieuDanhMuc } from '../../tien_ich/luu_tru_danh_muc';
import { xoaCacheBoMayGiamDinh } from '../../tien_ich/dong_co_giam_dinh';
import TimKiemPhanTrangBang from '../../thanh_phan/tim_kiem_phan_trang_bang';
import seed from './du_lieu_tuong_tac_thuoc.seed.json';
import { NOI_DUNG_QUY_TAC_HIEN_THI } from './quy_tac_giam_dinh_tuong_tac';

const DATA_KEY = 'DANH_MUC_TUONG_TAC_THUOC';
const COLUMNS_KEY = 'COLS_DANH_MUC_TUONG_TAC_THUOC';

/** Thứ tự cột lưu trữ & hiển thị (không lệch header/body) */
const COT_LUU_TRU = [
  'id',
  'TRANG_THAI',
  'MA_TUONG_TAC',
  'MA_THUOC_A',
  'MA_THUOC_B',
  'NOI_DUNG_TUONG_TAC',
  'CANH_BAO_HE_THONG',
  'DU_LIEU_CAP_DOI_DAY_DU',
];

/** Chỉ các cột nhập liệu trong bảng (bỏ id — id chỉnh gián tiếp qua Mã TT hoặc sao chép) */
const COT_HIEN_BANG = COT_LUU_TRU.filter((k) => k !== 'id');

/**
 * flex: tỷ lệ trong phần còn lại sau cột cố định (chọn, xóa).
 * minWidth: tối thiểu khi màn hẹp (cuộn ngang).
 */
const METADATA_COT = {
  TRANG_THAI: { label: 'Bật', flex: 0.55, minWidth: 64, loai: 'toggle' },
  MA_TUONG_TAC: { label: 'Mã tương tác', flex: 1, minWidth: 118, loai: 'text' },
  MA_THUOC_A: { label: 'Mã thuốc A', flex: 0.95, minWidth: 100, loai: 'ma' },
  MA_THUOC_B: { label: 'Mã thuốc B', flex: 0.95, minWidth: 100, loai: 'ma' },
  NOI_DUNG_TUONG_TAC: { label: 'Nội dung tương tác', flex: 2.4, minWidth: 220, loai: 'long' },
  CANH_BAO_HE_THONG: { label: 'Cảnh báo hệ thống', flex: 2.4, minWidth: 240, loai: 'long' },
  DU_LIEU_CAP_DOI_DAY_DU: { label: 'Đủ cặp mã', flex: 0.45, minWidth: 72, loai: 'badge' },
};

const RONG_CHON = 44;
const RONG_XOA = 52;
const CAO_DONG_TOI_THIEU = 108;
const reBracket = /\[([^\]]+)\]/g;

const UPPER = (s) => String(s || '').trim().toUpperCase();

const chuanHoaHang = (r) => {
  const row = { ...r };
  if (!row.id) row.id = `tt-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  COT_LUU_TRU.forEach((k) => {
    if (row[k] === undefined || row[k] === null) row[k] = k === 'DU_LIEU_CAP_DOI_DAY_DU' ? '0' : '';
  });
  const t = UPPER(row.TRANG_THAI);
  row.TRANG_THAI = t === 'OFF' || t === '0' || t === 'FALSE' || t === 'TAT' ? 'OFF' : 'ON';
  const a = UPPER(row.MA_THUOC_A);
  const b = UPPER(row.MA_THUOC_B);
  row.DU_LIEU_CAP_DOI_DAY_DU = a && b ? '1' : '0';
  return row;
};

const chuanHoaDongTuExcel = (row, i) => {
  const ma = String(row['Mã tương tác'] ?? row.MA_TUONG_TAC ?? '').trim();
  if (!ma || ma.includes('Mã tương tác')) return null;
  const noiDung = String(row['Nội dung tương tác'] ?? row.NOI_DUNG_TUONG_TAC ?? '');
  const codes = [...noiDung.matchAll(reBracket)].map((m) => m[1].trim()).filter(Boolean);
  const maA = codes[0] || String(row.MA_THUOC_A ?? '').trim();
  const maB = codes[1] || String(row.MA_THUOC_B ?? '').trim();
  const ttRaw = String(row['Trạng thái'] ?? row.TRANG_THAI ?? row['Bật'] ?? 'ON').trim();
  const tt = UPPER(ttRaw);
  const trangThai = tt === 'OFF' || tt === '0' || tt === 'TẮT' || tt === 'TAT' ? 'OFF' : 'ON';
  return chuanHoaHang({
    id: String(row.id || `tt-${Date.now()}-${i}`),
    TRANG_THAI: trangThai,
    MA_TUONG_TAC: ma,
    MA_THUOC_A: maA,
    MA_THUOC_B: maB,
    NOI_DUNG_TUONG_TAC: noiDung,
    CANH_BAO_HE_THONG: String(row['Cảnh báo hệ thống'] ?? row.CANH_BAO_HE_THONG ?? ''),
    DU_LIEU_CAP_DOI_DAY_DU: maA && maB ? '1' : '0',
  });
};

const escapeHtml = (s) => String(s ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

const TuongTacThuocChuyenMon = () => {
  const { width: winW } = useWindowDimensions();
  const [data, setData] = useState([]);
  const dataRef = useRef([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [sortAsc, setSortAsc] = useState(true);
  const [caoVungBang, setCaoVungBang] = useState(0);
  const [moQuyTac, setMoQuyTac] = useState(false);
  const [tuKhoaTim, setTuKhoaTim] = useState('');
  const [soDongMotTrang, setSoDongMotTrang] = useState(SO_DONG_TRANG_MAC_DINH);
  const [trangHienTai, setTrangHienTai] = useState(1);

  const bangRong = useMemo(() => Math.max((winW || Dimensions.get('window').width) - 24, 400), [winW]);

  const hangLocChiSo = useMemo(
    () => locDongTheoTuKhoa(data, COT_HIEN_BANG, tuKhoaTim),
    [data, tuKhoaTim],
  );
  const nSauLoc = hangLocChiSo.length;
  const { tongSoTrang, trangDangXem, chiSoBatDau, chiSoKetThuc } = useMemo(
    () => tinhChiSoPhanTrang(nSauLoc, soDongMotTrang, trangHienTai),
    [nSauLoc, soDongMotTrang, trangHienTai],
  );
  const duLieuTrang = useMemo(
    () => hangLocChiSo.slice(chiSoBatDau, chiSoKetThuc),
    [hangLocChiSo, chiSoBatDau, chiSoKetThuc],
  );

  const idsTrangHienThi = useMemo(() => duLieuTrang.map(({ row }) => row.id), [duLieuTrang]);
  const tatCaDaChon = idsTrangHienThi.length > 0 && idsTrangHienThi.every((id) => selectedRows.includes(id));

  useEffect(() => {
    if (trangHienTai > tongSoTrang) setTrangHienTai(tongSoTrang);
  }, [tongSoTrang, trangHienTai]);

  useEffect(() => {
    setTrangHienTai(1);
  }, [tuKhoaTim, soDongMotTrang]);

  const napDuLieu = useCallback(async () => {
    try {
      const { data: rows } = await taiBoDuLieuDanhMuc({
        dataKey: DATA_KEY,
        columnsKey: COLUMNS_KEY,
        fallbackColumns: COT_LUU_TRU,
      });
      const raw = Array.isArray(rows) && rows.length ? rows : (Array.isArray(seed?.data) ? seed.data : []);
      setData(raw.map(chuanHoaHang));
    } catch (e) {
      console.warn(e);
    }
  }, []);

  useEffect(() => {
    napDuLieu();
  }, [napDuLieu]);

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  const luuHeThong = async (newData) => {
    const next = newData.map(chuanHoaHang);
    setData(next);
    try {
      await ghiMangDanhMucVaoStorage(DATA_KEY, next);
      await ghiMangDanhMucVaoStorage(COLUMNS_KEY, COT_LUU_TRU);
      xoaCacheBoMayGiamDinh();
    } catch (e) {
      console.warn(e);
    }
  };

  const handleCellChange = (id, col, val) => {
    luuHeThong(
      data.map((row) => {
        if (row.id !== id) return row;
        let next = { ...row, [col]: val };
        if (col === 'NOI_DUNG_TUONG_TAC') {
          const codes = [...String(val).matchAll(reBracket)].map((m) => m[1].trim()).filter(Boolean);
          if (codes.length >= 2) {
            next = { ...next, MA_THUOC_A: codes[0], MA_THUOC_B: codes[1] };
          }
        }
        return chuanHoaHang(next);
      }),
    );
  };

  const toggleTrangThai = (id) => {
    luuHeThong(
      data.map((row) => (row.id === id
        ? chuanHoaHang({ ...row, TRANG_THAI: row.TRANG_THAI === 'ON' ? 'OFF' : 'ON' })
        : row)),
    );
  };

  const datTrangThaiHangLoat = (mode) => {
    if (selectedRows.length === 0) return;
    luuHeThong(
      data.map((row) => (selectedRows.includes(row.id)
        ? chuanHoaHang({ ...row, TRANG_THAI: mode })
        : row)),
    );
  };

  const handleAddRow = () => {
    const newRow = chuanHoaHang({
      id: `tt-${Date.now()}`,
      TRANG_THAI: 'ON',
      MA_TUONG_TAC: '',
      MA_THUOC_A: '',
      MA_THUOC_B: '',
      NOI_DUNG_TUONG_TAC: '',
      CANH_BAO_HE_THONG: '',
      DU_LIEU_CAP_DOI_DAY_DU: '0',
    });
    luuHeThong([newRow, ...data]);
  };

  const handleDeleteOne = (id) => {
    luuHeThong(data.filter((r) => r.id !== id));
    setSelectedRows((s) => s.filter((x) => x !== id));
  };

  const handleDuplicate = (row) => {
    const copy = chuanHoaHang({
      ...row,
      id: `tt-${Date.now()}`,
      MA_TUONG_TAC: row.MA_TUONG_TAC ? `${row.MA_TUONG_TAC}_copy` : '',
    });
    luuHeThong([copy, ...data]);
  };

  const toggleSelectRow = (id) => setSelectedRows((prev) => (prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]));

  const toggleSelectAll = () => {
    const idsPage = duLieuTrang.map(({ row }) => row.id);
    if (idsPage.length === 0) return;
    const allPageSelected = idsPage.every((id) => selectedRows.includes(id));
    if (allPageSelected) {
      setSelectedRows((prev) => prev.filter((id) => !idsPage.includes(id)));
    } else {
      setSelectedRows((prev) => Array.from(new Set([...prev, ...idsPage])));
    }
  };

  const handleDeleteBulk = () => {
    if (selectedRows.length === 0) return;
    luuHeThong(data.filter((row) => !selectedRows.includes(row.id)));
    setSelectedRows([]);
  };

  const handleSortMa = () => {
    const sorted = [...data].sort((a, b) => {
      const va = String(a.MA_TUONG_TAC || '').toUpperCase();
      const vb = String(b.MA_TUONG_TAC || '').toUpperCase();
      return sortAsc ? va.localeCompare(vb) : vb.localeCompare(va);
    });
    setSortAsc(!sortAsc);
    luuHeThong(sorted);
  };

  const handleExport = () => {
    if (Platform.OS !== 'web') return;
    const exportData = data.map((row) => {
      const o = {};
      COT_LUU_TRU.forEach((col) => { o[col] = row[col] ?? ''; });
      return o;
    });
    const ws = XLSX.utils.json_to_sheet(exportData, { header: COT_LUU_TRU });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'TuongTacThuoc');
    XLSX.writeFile(wb, 'Danh_muc_tuong_tac_thuoc_BV.xlsx');
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const imported = XLSX.utils.sheet_to_json(ws, { defval: '' });
      const formatted = imported.map(chuanHoaDongTuExcel).filter(Boolean);
      if (formatted.length > 0) {
        const merged = gopImportVoiBangHienTai(dataRef.current, formatted);
        luuHeThong(merged);
        alert(
          `Đã nhập ${formatted.length} dòng từ file. Trùng mã quy tắc (MA_TUONG_TAC) với bảng đang có được cập nhật theo file. Tổng sau gộp: ${merged.length} dòng.`,
        );
      } else {
        alert('Không đọc được dòng hợp lệ.');
      }
      e.target.value = '';
    };
    reader.readAsBinaryString(file);
  };

  const handlePrint = () => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') {
      alert('In bảng hiện chỉ hỗ trợ trên web.');
      return;
    }
    const cols = ['STT', ...COT_HIEN_BANG.filter((k) => k !== 'id')];
    let html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Danh mục tương tác thuốc</title>
<style>
  body{font-family:Segoe UI,Arial,sans-serif;font-size:11px;margin:12px;}
  h1{font-size:14px;margin-bottom:8px;}
  table{border-collapse:collapse;width:100%;table-layout:fixed;}
  th,td{border:1px solid #333;padding:6px;vertical-align:top;word-wrap:break-word;}
  th{background:#e8e8e8;font-weight:bold;}
  @media print{@page{size:landscape;margin:10mm;}}
</style></head><body><h1>Danh mục tương tác thuốc (BV)</h1><table><thead><tr>`;
    cols.forEach((c) => {
      const lab = METADATA_COT[c]?.label || c;
      html += `<th>${escapeHtml(lab)}</th>`;
    });
    html += '</tr></thead><tbody>';
    data.forEach((row, idx) => {
      html += '<tr>';
      html += `<td>${idx + 1}</td>`;
      COT_HIEN_BANG.forEach((k) => {
        html += `<td>${escapeHtml(row[k])}</td>`;
      });
      html += '</tr>';
    });
    html += '</tbody></table></body></html>';
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => {
      w.print();
      w.close();
    }, 250);
  };

  const thongKeBang = useMemo(() => {
    let duCap = 0;
    let batOn = 0;
    const pkSeen = new Set();
    let capPhanBiet = 0;
    data.forEach((row) => {
      if (row.DU_LIEU_CAP_DOI_DAY_DU === '1') duCap += 1;
      if (row.TRANG_THAI === 'ON') batOn += 1;
      const a = UPPER(row.MA_THUOC_A);
      const b = UPPER(row.MA_THUOC_B);
      if (a && b) {
        const pk = [a, b].sort().join('|');
        if (!pkSeen.has(pk)) {
          pkSeen.add(pk);
          capPhanBiet += 1;
        }
      }
    });
    return { tong: data.length, duCap, batOn, capPhanBiet };
  }, [data]);

  const gopImportVoiBangHienTai = (current, importedRows) => {
    const map = new Map();
    const keyOf = (r) => {
      const m = String(r.MA_TUONG_TAC || '').trim().toUpperCase();
      return m || String(r.id || '');
    };
    current.forEach((r) => map.set(keyOf(r), chuanHoaHang(r)));
    importedRows.forEach((r) => map.set(keyOf(chuanHoaHang(r)), chuanHoaHang(r)));
    return Array.from(map.values());
  };

  const renderOToCot = (key, row, isHeader) => {
    const meta = METADATA_COT[key];
    const base = {
      flex: meta.flex,
      minWidth: meta.minWidth,
      borderRightWidth: StyleSheet.hairlineWidth,
      borderColor: CD.border.glass,
    };

    if (isHeader) {
      const label = (
        <Text style={styles.chu_o_tieu_de} numberOfLines={2}>
          {key === 'MA_TUONG_TAC' ? `${meta.label}${sortAsc ? ' ▼' : ' ▲'}` : meta.label}
        </Text>
      );
      if (key === 'MA_TUONG_TAC') {
        return (
          <TouchableOpacity
            key={`h-${key}`}
            style={[styles.o_tieu_de_cell, base, styles.o_sort]}
            onPress={handleSortMa}
            activeOpacity={0.7}
          >
            {label}
          </TouchableOpacity>
        );
      }
      return (
        <View key={`h-${key}`} style={[styles.o_tieu_de_cell, base]}>
          {label}
        </View>
      );
    }

    if (meta.loai === 'toggle') {
      const on = row.TRANG_THAI === 'ON';
      return (
        <View key={`c-${row.id}-${key}`} style={[styles.o_cell, base, styles.o_flex_center]}>
          <TouchableOpacity
            onPress={() => toggleTrangThai(row.id)}
            style={[styles.pill_tt, on ? styles.pill_on : styles.pill_off]}
          >
            <Text style={styles.pill_txt}>{on ? 'ON' : 'OFF'}</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (meta.loai === 'badge') {
      const ok = row.DU_LIEU_CAP_DOI_DAY_DU === '1';
      return (
        <View key={`c-${row.id}-${key}`} style={[styles.o_cell, base, styles.o_flex_center]}>
          <View style={[styles.badge, ok ? styles.badge_ok : styles.badge_no]}>
            <Text style={styles.badge_txt}>{ok ? 'Đủ' : 'Thiếu'}</Text>
          </View>
        </View>
      );
    }

    return (
      <TextInput
        key={`c-${row.id}-${key}`}
        style={[
          styles.o_cell,
          styles.o_input,
          base,
          meta.loai === 'long' ? styles.o_long : null,
          meta.loai === 'ma' ? styles.o_ma : null,
        ]}
        multiline
        textAlignVertical="top"
        scrollEnabled={false}
        value={String(row[key] ?? '')}
        onChangeText={(v) => handleCellChange(row.id, key, v)}
      />
    );
  };

  return (
    <View style={styles.root}>
      <View style={styles.thanh_cong_cu}>
        <Text style={styles.tieu_de} numberOfLines={1}>💊 Tương tác thuốc (danh mục nội bộ)</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          style={styles.hang_nut_scroll}
          contentContainerStyle={styles.mot_hang_nut}
        >
          <TouchableOpacity style={styles.btn_add} onPress={handleAddRow}>
            <Text style={styles.txt_btn}>➕ Thêm</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btn_del} onPress={handleDeleteBulk}>
            <Text style={styles.txt_btn}>🗑 Xóa ({selectedRows.length})</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btn_mute} onPress={() => datTrangThaiHangLoat('ON')}>
            <Text style={styles.txt_btn_dark}>Bật chọn</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btn_mute} onPress={() => datTrangThaiHangLoat('OFF')}>
            <Text style={styles.txt_btn_dark}>Tắt chọn</Text>
          </TouchableOpacity>
          {Platform.OS === 'web' && (
            <>
              <input type="file" accept=".xlsx,.xls" onChange={handleImport} style={{ display: 'none' }} id="import-tt-thuoc" />
              <TouchableOpacity style={styles.btn_imp} onPress={() => document.getElementById('import-tt-thuoc').click()}>
                <Text style={styles.txt_btn_small}>📤 Import</Text>
              </TouchableOpacity>
            </>
          )}
          <TouchableOpacity style={styles.btn_exp} onPress={handleExport}>
            <Text style={styles.txt_btn_small}>📥 Export</Text>
          </TouchableOpacity>
          {Platform.OS === 'web' && (
            <TouchableOpacity style={styles.btn_print} onPress={handlePrint}>
              <Text style={styles.txt_btn_small}>🖨 In</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.btn_quy_tac, moQuyTac ? styles.btn_quy_tac_mo : null]}
            onPress={() => setMoQuyTac((v) => !v)}
            accessibilityLabel="Mở hoặc đóng khung quy tắc giám định"
          >
            <Text style={styles.txt_btn_quy_tac}>{moQuyTac ? '▼' : '▶'} Quy tắc giám định</Text>
          </TouchableOpacity>
        </ScrollView>
        <Text style={styles.ghi_chu} numberOfLines={2}>
          ON mới giám định. ⧉ sao chép dòng · Tối thiểu {CAO_DONG_TOI_THIEU}px/dòng.
        </Text>
        <Text style={styles.thong_ke_dong} selectable>
          Tổng {thongKeBang.tong} dòng đã lưu · {thongKeBang.capPhanBiet} cặp mã khác nhau · Đủ A+B:{' '}
          {thongKeBang.duCap} · Đang bật ON: {thongKeBang.batOn}. Dùng ô tìm kiếm và phân trang ngay trên bảng để lọc và chuyển trang.
        </Text>
      </View>

      {moQuyTac ? (
        <View style={styles.khung_quy_tac} accessibilityRole="summary">
          <ScrollView
            nestedScrollEnabled
            style={styles.cuon_quy_tac}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator
          >
            {NOI_DUNG_QUY_TAC_HIEN_THI.map((sec) => (
              <View key={sec.key} style={styles.muc_quy_tac}>
                <Text style={styles.tieu_de_muc_quy_tac}>{sec.tieuDe}</Text>
                {sec.dong.map((line, li) => (
                  <Text key={`${sec.key}-${li}`} style={styles.dong_quy_tac}>
                    {'\u2022 '}
                    {line}
                  </Text>
                ))}
              </View>
            ))}
          </ScrollView>
        </View>
      ) : null}

      {/* Tách khỏi khung đo chiều cao bảng: gộp chung làm onLayout gồm cả thanh tìm rồi gán height cho bang → lỗi ScrollView dọc / phân trang */}
      <View style={styles.khung_tim_bang}>
        <TimKiemPhanTrangBang
          tuKhoa={tuKhoaTim}
          onTuKhoa={setTuKhoaTim}
          placeholder="Tìm theo mã TT, mã thuốc, nội dung… (không phân biệt dấu)"
          tongDongGoc={data.length}
          tongDongSauLoc={nSauLoc}
          soDongMotTrang={soDongMotTrang}
          onSoDongMotTrang={setSoDongMotTrang}
          trangHienTai={trangDangXem}
          onTrangHienTai={setTrangHienTai}
          tongSoTrang={tongSoTrang}
          chiSoBatDau={chiSoBatDau}
          chiSoKetThuc={chiSoKetThuc}
        />
      </View>

      <View
        style={styles.khung_bang_outer}
        onLayout={(e) => setCaoVungBang(Math.max(0, Math.floor(e.nativeEvent.layout.height)))}
      >
        <ScrollView
          horizontal
          nestedScrollEnabled
          keyboardShouldPersistTaps="handled"
          style={styles.khung_ngang}
          contentContainerStyle={[styles.khung_ngang_content, { minWidth: bangRong }]}
        >
          <View
            style={[
              styles.bang,
              { width: bangRong, minWidth: bangRong },
              caoVungBang > 0 ? { height: caoVungBang, maxHeight: caoVungBang } : { minHeight: 280 },
            ]}
          >
          {/* Hàng tiêu đề */}
          <View style={[styles.dong_row, styles.dong_tieu_de_bang]}>
            <View style={[styles.o_co_dinh, { width: RONG_CHON }]}>
              <TouchableOpacity onPress={toggleSelectAll} style={styles.chk_wrap}>
                <View style={[styles.checkbox, tatCaDaChon && styles.checkbox_active]}>
                  {tatCaDaChon ? <Text style={styles.chk_mark}>✓</Text> : null}
                </View>
              </TouchableOpacity>
            </View>
            <View style={[styles.o_co_dinh, { width: RONG_XOA }]}>
              <Text style={styles.chu_o_tieu_de_small}>Xóa</Text>
            </View>
            {COT_HIEN_BANG.map((key) => renderOToCot(key, {}, true))}
          </View>

          <ScrollView nestedScrollEnabled style={styles.cuon_doc} keyboardShouldPersistTaps="handled">
            {duLieuTrang.map(({ row }) => (
              <View key={row.id} style={[styles.dong_row, styles.dong_dat]}>
                <View style={[styles.o_co_dinh, styles.o_flex_center, { width: RONG_CHON }]}>
                  <TouchableOpacity
                    style={[styles.checkbox, selectedRows.includes(row.id) && styles.checkbox_active]}
                    onPress={() => toggleSelectRow(row.id)}
                  >
                    {selectedRows.includes(row.id) ? <Text style={styles.chk_mark}>✓</Text> : null}
                  </TouchableOpacity>
                </View>
                <View style={[styles.o_co_dinh, styles.o_col_actions, { width: RONG_XOA }]}>
                  <TouchableOpacity onPress={() => handleDuplicate(row)} style={styles.btn_mini} accessibilityLabel="Sao chép dòng">
                    <Text style={styles.btn_mini_txt}>⧉</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDeleteOne(row.id)} style={styles.btn_mini_del}>
                    <Text style={styles.btn_mini_txt}>🗑</Text>
                  </TouchableOpacity>
                </View>
                {COT_HIEN_BANG.map((key) => renderOToCot(key, row, false))}
              </View>
            ))}
          </ScrollView>
        </View>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, minHeight: 0, width: '100%', flexDirection: 'column' },
  /** Không dùng ScrollView bọc toolbar — tránh khoảng đen giữa toolbar và bảng trên web */
  thanh_cong_cu: {
    flexShrink: 0,
    paddingHorizontal: 12,
    paddingTop: 6,
    paddingBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: CD.border.glass,
    ...Platform.select({ web: { width: '100%' } }),
  },
  tieu_de: { fontSize: 18, fontWeight: 'bold', color: CD.text.primary, fontFamily: CD.font.family, marginBottom: 6 },
  hang_nut_scroll: { flexGrow: 0, maxHeight: 48 },
  mot_hang_nut: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingRight: 8,
    marginBottom: 4,
  },
  btn_add: { backgroundColor: CD.brand.mauChinh, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
  btn_del: { backgroundColor: '#C62828', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
  btn_mute: { backgroundColor: CD.bg.glass_input, paddingVertical: 8, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1, borderColor: CD.border.glass },
  btn_imp: { backgroundColor: '#F57C00', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
  btn_exp: { backgroundColor: '#2E7D32', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
  btn_print: { backgroundColor: '#455A64', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
  txt_btn: { color: '#FFF', fontSize: 14, fontWeight: 'bold', fontFamily: CD.font.family },
  txt_btn_dark: { color: CD.text.primary, fontSize: 13, fontWeight: 'bold', fontFamily: CD.font.family },
  txt_btn_small: { color: '#FFF', fontSize: 13, fontWeight: 'bold', fontFamily: CD.font.family },
  ghi_chu: { fontSize: 12, color: CD.text.secondary, fontFamily: CD.font.family, lineHeight: 16, marginTop: 2 },
  thong_ke_dong: {
    fontSize: 13,
    fontWeight: '600',
    color: CD.brand.mauDam,
    fontFamily: CD.font.family,
    lineHeight: 20,
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(216, 27, 96, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(216, 27, 96, 0.22)',
  },
  btn_quy_tac: {
    backgroundColor: CD.bg.glass_input,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: CD.brand.mauChinh,
  },
  btn_quy_tac_mo: { backgroundColor: 'rgba(46, 125, 50, 0.12)' },
  txt_btn_quy_tac: { color: CD.brand.mauDam, fontSize: 13, fontWeight: 'bold', fontFamily: CD.font.family },
  khung_quy_tac: {
    flexShrink: 0,
    marginHorizontal: 12,
    marginBottom: 6,
    maxHeight: 240,
    borderWidth: 1,
    borderColor: CD.border.glass_md,
    borderRadius: 10,
    backgroundColor: CD.bg.glass_input,
    overflow: 'hidden',
  },
  cuon_quy_tac: { maxHeight: 240, paddingHorizontal: 12, paddingVertical: 10 },
  muc_quy_tac: { marginBottom: 12 },
  tieu_de_muc_quy_tac: {
    fontSize: 14,
    fontWeight: 'bold',
    color: CD.brand.mauDam,
    fontFamily: CD.font.family,
    marginBottom: 6,
  },
  dong_quy_tac: {
    fontSize: 13,
    lineHeight: 20,
    color: CD.text.primary,
    fontFamily: CD.font.family,
    marginBottom: 4,
    paddingLeft: 2,
  },
  khung_bang_outer: {
    flex: 1,
    minHeight: 0,
    width: '100%',
    paddingHorizontal: 8,
    paddingTop: 4,
    paddingBottom: 8,
  },
  khung_tim_bang: {
    flexShrink: 0,
    paddingHorizontal: 8,
    paddingTop: 4,
    marginBottom: 2,
    zIndex: 2,
    ...Platform.select({ web: { position: 'relative' } }),
  },
  khung_ngang: { flex: 1, minHeight: 0, width: '100%' },
  khung_ngang_content: { flexGrow: 1, paddingBottom: 4 },
  bang: {
    alignSelf: 'flex-start',
    flexDirection: 'column',
    borderWidth: 1,
    borderColor: CD.border.glass_md,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: CD.bg.glass_card,
  },
  dong_row: { flexDirection: 'row', alignItems: 'stretch', width: '100%', borderBottomWidth: StyleSheet.hairlineWidth, borderColor: CD.border.glass },
  dong_tieu_de_bang: { flexShrink: 0 },
  dong_dat: { minHeight: CAO_DONG_TOI_THIEU, backgroundColor: CD.bg.glass_card },
  o_co_dinh: { justifyContent: 'center', paddingVertical: 6, borderRightWidth: StyleSheet.hairlineWidth, borderColor: CD.border.glass, backgroundColor: CD.bg.glass_input },
  o_tieu_de_cell: { paddingHorizontal: 8, paddingVertical: 10, justifyContent: 'center', backgroundColor: CD.bg.glass_input },
  o_sort: {},
  chu_o_tieu_de: { fontSize: 13, fontWeight: 'bold', color: CD.brand.mauDam, fontFamily: CD.font.family },
  chu_o_tieu_de_small: { fontSize: 11, fontWeight: 'bold', color: CD.brand.mauDam, textAlign: 'center', fontFamily: CD.font.family },
  o_cell: { paddingHorizontal: 8, paddingVertical: 8 },
  o_input: {
    minHeight: CAO_DONG_TOI_THIEU - 8,
    fontSize: 14,
    fontFamily: CD.font.family,
    color: CD.text.primary,
    backgroundColor: 'transparent',
  },
  o_long: { fontSize: 13, lineHeight: 20 },
  o_ma: { fontWeight: '600', color: CD.brand.mauChinh },
  o_flex_center: { justifyContent: 'center', alignItems: 'center' },
  o_col_actions: { flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 4 },
  btn_mini: { padding: 4 },
  btn_mini_del: { padding: 4 },
  btn_mini_txt: { fontSize: 16 },
  cuon_doc: { flex: 1, minHeight: 0 },
  checkbox: { width: 26, height: 26, borderWidth: 2, borderColor: CD.border.glass_md, borderRadius: 4, justifyContent: 'center', alignItems: 'center' },
  checkbox_active: { backgroundColor: CD.brand.mauChinh, borderColor: CD.brand.mauChinh },
  chk_wrap: { alignItems: 'center', justifyContent: 'center' },
  chk_mark: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  pill_tt: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, minWidth: 48, alignItems: 'center' },
  pill_on: { backgroundColor: '#2E7D32' },
  pill_off: { backgroundColor: '#757575' },
  pill_txt: { color: '#FFF', fontWeight: 'bold', fontSize: 13, fontFamily: CD.font.family },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badge_ok: { backgroundColor: '#E8F5E9' },
  badge_no: { backgroundColor: '#FFEBEE' },
  badge_txt: { fontSize: 12, fontWeight: '600', fontFamily: CD.font.family, color: '#333' },
});

export default TuongTacThuocChuyenMon;
