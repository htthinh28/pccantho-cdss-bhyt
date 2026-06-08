import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CD } from '../tien_ich/chu_de_giao_dien';
import { BREAKPOINTS } from '../tien_ich/diem_anh_man_hinh';
import { inHoacChiaSePdfTuBang } from '../tien_ich/in_an_chung';
import taiLieuManifest from '../tien_ich/tai_lieu_manifest.json';
import taiLieuTagCatalog from '../tien_ich/tai_lieu_tag_catalog.json';
import { layGocUrlTaiLieu, taoUrlMoTaiLieu } from '../tien_ich/tai_lieu_url';
import { dieuHuongMoTabMoi } from '../tien_ich/dieu_huong_mo_tab_moi';
import ThuVienPanelTraCuuQuyTac from './thu_vien_panel_tra_cuu_quy_tac';

const RONG_BREAKPOINT_HAI_COT = BREAKPOINTS.md;
const RONG_SIDEBAR_TOC = 300;

const moLienKet = async (url) => {
  const trimmed = String(url || '').trim();
  if (!trimmed) return;
  try {
    const supported = await Linking.canOpenURL(trimmed);
    if (supported) {
      await Linking.openURL(trimmed);
    } else {
      Alert.alert('Không mở được liên kết', trimmed);
    }
  } catch (e) {
    Alert.alert('Lỗi mở liên kết', String(e?.message || e));
  }
};

/** Chuẩn hóa để tìm kiếm không phân biệt dấu (tiếng Việt). */
const chuanHoaTimKiem = (s) =>
  String(s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();

const gopTruongTim = (it) =>
  [it.title, it.relPath, it.id, it.nguon || '', ...(Array.isArray(it.tags) ? it.tags : [])]
    .map((x) => chuanHoaTimKiem(x))
    .join(' ');

const locTheoTuKhoa = (items, tuKhoa) => {
  const q = chuanHoaTimKiem(tuKhoa);
  if (!q) return items;
  return items.filter((it) => {
    const s = gopTruongTim(it);
    return s.includes(q) || q.split(/\s+/).filter(Boolean).every((t) => s.includes(t));
  });
};

const locTheoThe = (items, tagId) => {
  if (!tagId) return items;
  return items.filter((it) => Array.isArray(it.tags) && it.tags.includes(tagId));
};

const sapXepTheoABC = (items) =>
  [...items].sort((a, b) =>
    String(a.title || '').localeCompare(String(b.title || ''), 'vi', { sensitivity: 'base' }),
  );

const laFileTxt = (relPath) => String(relPath || '').toLowerCase().endsWith('.txt');
const laFileHtml = (relPath) => {
  const l = String(relPath || '').toLowerCase();
  return l.endsWith('.html') || l.endsWith('.htm');
};

const ManHinhThuVien = ({ navigation }) => {
  const { width: beRong, height: beCao } = useWindowDimensions();
  const dungHaiCot = beRong >= RONG_BREAKPOINT_HAI_COT;

  /** 'TAI_LIEU' | 'QUY_TAC' */
  const [cheDo, setCheDo] = useState('TAI_LIEU');
  const [tuKhoa, setTuKhoa] = useState('');
  /** Lọc theo thẻ tri thức / nghiệp vụ (đồng bộ với manifest + trợ lý AI). */
  const [theLocThe, setTheLocThe] = useState(null);
  const [taiLieuDangXem, setTaiLieuDangXem] = useState(null);
  const [noiDungText, setNoiDungText] = useState('');
  const [dangTaiText, setDangTaiText] = useState(false);
  const [loiText, setLoiText] = useState('');

  const quayLai = useCallback(() => {
    navigation.navigate('TongQuan');
  }, [navigation]);

  const items = useMemo(() => taiLieuManifest.items || [], []);
  const coGoc = Boolean(layGocUrlTaiLieu());

  const itemsSAPXep = useMemo(() => sapXepTheoABC(items), [items]);
  const itemsHienThi = useMemo(
    () => locTheoThe(locTheoTuKhoa(itemsSAPXep, tuKhoa), theLocThe),
    [itemsSAPXep, tuKhoa, theLocThe],
  );

  const nhanTheTheoId = useCallback(
    (id) => {
      const row = (taiLieuTagCatalog.catalog || []).find((c) => c.id === id);
      return row?.label || id;
    },
    [],
  );

  useEffect(() => {
    if (!taiLieuDangXem) {
      setNoiDungText('');
      setLoiText('');
      setDangTaiText(false);
      return;
    }
    const rel = String(taiLieuDangXem.relPath || '');
    if (!laFileTxt(rel)) {
      setNoiDungText('');
      setLoiText('');
      setDangTaiText(false);
      return;
    }
    const url = taoUrlMoTaiLieu(rel);
    if (!url) {
      setLoiText('Không tạo được URL tài liệu.');
      setNoiDungText('');
      return;
    }
    setDangTaiText(true);
    setLoiText('');
    const ac = new AbortController();
    fetch(url, { signal: ac.signal })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.text();
      })
      .then((t) => {
        setNoiDungText(t);
        setLoiText('');
      })
      .catch((e) => {
        if (e?.name === 'AbortError') return;
        setNoiDungText('');
        setLoiText(String(e?.message || e));
      })
      .finally(() => {
        setDangTaiText(false);
      });
    return () => ac.abort();
  }, [taiLieuDangXem]);

  const moTapHtml = useCallback((relPath) => {
    const url = taoUrlMoTaiLieu(relPath);
    if (!url) {
      Alert.alert(
        'Chưa mở được tài liệu',
        'Không xác định được URL máy chủ (web hoặc Expo + Metro). Trên máy tính, hãy dùng bản web.',
      );
      return;
    }
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      moLienKet(url);
    }
  }, []);

  const inDanhSachTaiLieu = useCallback(async () => {
    if (items.length === 0) {
      Alert.alert('Thông báo', 'Chưa có mục tài liệu trong manifest.');
      return;
    }
    const rows = items.map((it) => {
      const parts = String(it.relPath || '').split('/');
      const folder = parts.length > 1 ? parts.slice(0, -1).join('/') : '(gốc)';
      return {
        id: it.id,
        tieu_de: it.title,
        thu_muc: folder,
        duong_dan: it.relPath,
        nguon: it.nguon || '',
        the: Array.isArray(it.tags) ? it.tags.map((tid) => nhanTheTheoId(tid)).join('; ') : '',
      };
    });
    const columns = [
      { key: 'id', label: 'Mã' },
      { key: 'tieu_de', label: 'Tiêu đề' },
      { key: 'the', label: 'Thẻ' },
      { key: 'thu_muc', label: 'Thư mục' },
      { key: 'duong_dan', label: 'Đường dẫn (mở)' },
      { key: 'nguon', label: 'Nguồn' },
    ];
    const exportNote = taiLieuManifest.generatedAt
      ? `Manifest tạo lúc: ${taiLieuManifest.generatedAt}`
      : undefined;
    await inHoacChiaSePdfTuBang(
      [{ sheetName: 'Tai_lieu', columns, rows, exportNote }],
      'Thư viện tài liệu (danh mục manifest)',
    );
  }, [items, nhanTheTheoId]);

  const urlDangXem = taiLieuDangXem
    ? taoUrlMoTaiLieu(taiLieuDangXem.relPath)
    : '';
  const relDangXem = taiLieuDangXem ? String(taiLieuDangXem.relPath || '') : '';
  const xemBangIframe = Boolean(
    taiLieuDangXem && coGoc && urlDangXem && laFileHtml(relDangXem),
  );
  const xemBangText = Boolean(taiLieuDangXem && coGoc && laFileTxt(relDangXem));

  const renderCuaSoDoc = () => {
    if (!taiLieuDangXem) {
      return (
        <View style={styles.man_hinh_cho}>
          <Text style={styles.icon_cho}>📚</Text>
          <Text style={styles.txt_cho_tieu_de}>Chọn một mục bên mục lục</Text>
          <Text style={styles.txt_cho_phu}>
            Tài liệu trong thư mục <Text style={styles.lead_mono}>tai_lieu/</Text>. Danh sách sắp theo tên (A–Z). Dùng ô
            tìm kiếm và <Text style={styles.lead_mono}>thẻ</Text> để lọc (đồng bộ với trợ lý tri thức). Sau khi thêm file,
            chạy <Text style={styles.lead_mono}>npm run tai_lieu:prepare</Text> rồi tải lại ứng dụng.
          </Text>
        </View>
      );
    }

    if (!coGoc) {
      return (
        <View style={styles.bao_loi_viewer}>
          <Text style={styles.warn_txt}>
            Không phát hiện host (mở ngoài Expo / thiếu gốc URL). Một số chế độ xem tài liệu có thể hạn chế; thử bản
            web hoặc bản đóng gói.
          </Text>
          {urlDangXem ? (
            <TouchableOpacity style={styles.btn_mo_ngoai} onPress={() => void moLienKet(urlDangXem)}>
              <Text style={styles.txt_mo_ngoai}>Mở bằng trình duyệt ngoài ↗</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      );
    }

    if (!urlDangXem) {
      return (
        <View style={styles.bao_loi_viewer}>
          <Text style={styles.txt_bao_loi}>Không tạo được đường dẫn tài liệu.</Text>
        </View>
      );
    }

    if (xemBangText) {
      if (dangTaiText) {
        return (
          <View style={styles.khung_tai_noi_dung}>
            <ActivityIndicator size="large" color={CD.brand.mauChinh} />
            <Text style={styles.txt_tai_noi_dung}>Đang tải nội dung văn bản…</Text>
          </View>
        );
      }
      if (loiText) {
        return (
          <View style={styles.bao_loi_viewer}>
            <Text style={styles.txt_bao_loi}>Không đọc được file: {loiText}</Text>
            <TouchableOpacity style={styles.btn_mo_ngoai} onPress={() => void moLienKet(urlDangXem)}>
              <Text style={styles.txt_mo_ngoai}>Mở URL trực tiếp ↗</Text>
            </TouchableOpacity>
          </View>
        );
      }
      return (
        <ScrollView
          style={styles.scroll_noi_dung_van_ban}
          contentContainerStyle={styles.scroll_noi_dung_van_ban_content}
        >
          <Text style={styles.noi_dung_van_ban} selectable>
            {noiDungText}
          </Text>
        </ScrollView>
      );
    }

    if (xemBangIframe && Platform.OS === 'web') {
      return (
        <iframe
          key={taiLieuDangXem.id}
          src={urlDangXem}
          style={{
            width: '100%',
            height: '100%',
            minHeight: 360,
            border: 'none',
            backgroundColor: '#fff',
            borderRadius: 8,
          }}
          title={taiLieuDangXem.title}
        />
      );
    }

    if (laFileHtml(relDangXem)) {
      return (
        <View style={styles.bao_loi_viewer}>
          <Text style={styles.txt_bao_loi}>
            Trên thiết bị này, tài liệu HTML mở tốt nhất trong trình duyệt (tab mới). Trên web, nội dung hiển thị ở khung
            bên phải.
          </Text>
          <TouchableOpacity style={styles.btn_mo_ngoai} onPress={() => moTapHtml(taiLieuDangXem.relPath)}>
            <Text style={styles.txt_mo_ngoai}>Mở tài liệu ↗</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.bao_loi_viewer}>
        <Text style={styles.txt_bao_loi}>
          Định dạng này chưa có xem nội dung tích hợp. Bạn có thể mở bằng ứng dụng bên ngoài.
        </Text>
        <TouchableOpacity style={styles.btn_mo_ngoai} onPress={() => void moLienKet(urlDangXem)}>
          <Text style={styles.txt_mo_ngoai}>Mở liên kết ↗</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const khoiMucLuc = (
    <View
      style={[
        styles.sidebar,
        dungHaiCot ? styles.sidebar_ngang : styles.sidebar_dung,
        !dungHaiCot && beCao > 0
          ? { maxHeight: Math.min(420, Math.max(260, beCao * 0.4)) }
          : null,
      ]}
    >
      <View style={styles.sidebar_head}>
        <Text style={styles.sidebar_tieu_de}>Mục lục (A–Z)</Text>
        <TextInput
          value={tuKhoa}
          onChangeText={setTuKhoa}
          placeholder="Tìm theo từ khóa…"
          placeholderTextColor={CD.text.muted}
          style={styles.o_tim_kiem}
          autoCorrect={false}
          autoCapitalize="none"
          {...(Platform.OS === 'ios' ? { clearButtonMode: 'while-editing' } : {})}
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.thanh_the_loc}
          contentContainerStyle={styles.thanh_the_loc_content}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity
            style={[styles.chip_the, !theLocThe && styles.chip_the_active]}
            onPress={() => setTheLocThe(null)}
            activeOpacity={0.85}
          >
            <Text style={!theLocThe ? styles.chip_the_txt_active : styles.chip_the_txt}>Tất cả</Text>
          </TouchableOpacity>
          {(taiLieuTagCatalog.catalog || []).map((c) => {
            const on = theLocThe === c.id;
            return (
              <TouchableOpacity
                key={c.id}
                style={[styles.chip_the, on && styles.chip_the_active]}
                onPress={() => setTheLocThe((v) => (v === c.id ? null : c.id))}
                activeOpacity={0.85}
              >
                <Text style={on ? styles.chip_the_txt_active : styles.chip_the_txt} numberOfLines={1}>
                  {c.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        <Text style={styles.dem_muc}>
          {itemsHienThi.length === itemsSAPXep.length
            ? `${itemsSAPXep.length} tài liệu`
            : `Hiển thị ${itemsHienThi.length} / ${itemsSAPXep.length} tài liệu`}
        </Text>
      </View>
      {itemsHienThi.length === 0 ? (
        <View style={styles.empty_sidebar}>
          <Text style={styles.empty_sidebar_txt}>
            {itemsSAPXep.length === 0 ? 'Chưa có tài liệu trong manifest.' : 'Không khớp từ khóa. Hãy thử từ khóa ngắn hơn.'}
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.sidebar_scroll}
          contentContainerStyle={styles.sidebar_scroll_content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator
        >
          {itemsHienThi.map((it) => {
            const active = taiLieuDangXem?.id === it.id;
            return (
              <TouchableOpacity
                key={it.id}
                style={[styles.muc_muc_luc, active && styles.muc_muc_luc_active]}
                onPress={() => setTaiLieuDangXem(it)}
                activeOpacity={0.75}
              >
                <Text style={[styles.muc_tieu_de, active && styles.muc_tieu_de_active]} numberOfLines={3}>
                  {it.title}
                </Text>
                <Text style={styles.muc_meta} numberOfLines={1}>
                  {it.relPath}
                  {it.nguon === 'markdown' ? ' · MD→HTML' : ''}
                  {it.nguon === 'text' ? ' · TXT' : ''}
                </Text>
                {Array.isArray(it.tags) && it.tags.length ? (
                  <Text style={styles.muc_the} numberOfLines={2}>
                    {it.tags.map((tid) => nhanTheTheoId(tid)).join(' · ')}
                  </Text>
                ) : null}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );

  const dauViewDoc = taiLieuDangXem ? (
    <View style={styles.dau_cua_so_doc}>
      <Text style={styles.tieu_de_tai_lieu} numberOfLines={2}>
        {taiLieuDangXem.title}
      </Text>
      {urlDangXem ? (
        <TouchableOpacity style={styles.btn_mo_tab} onPress={() => moTapHtml(taiLieuDangXem.relPath)} activeOpacity={0.85}>
          <Text style={styles.txt_mo_tab}>Mở tab mới ↗</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  ) : null;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.thanh_5_the}
        contentContainerStyle={styles.thanh_5_the_content}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity
          style={[styles.the_ngan, cheDo === 'TAI_LIEU' ? styles.the_ngan_sang : styles.the_ngan_toi]}
          onPress={() => setCheDo('TAI_LIEU')}
        >
          <Text style={cheDo === 'TAI_LIEU' ? styles.chu_ngan_sang : [styles.chu_ngan_nen, styles.chu_ngan_tren_toi]}>
            📄 Tài liệu
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.the_ngan, cheDo === 'QUY_TAC' ? styles.the_ngan_sang : styles.the_ngan_toi]}
          onPress={() => setCheDo('QUY_TAC')}
        >
          <Text style={cheDo === 'QUY_TAC' ? styles.chu_ngan_sang : [styles.chu_ngan_nen, styles.chu_ngan_tren_toi]}>
            ⚖️ Tra cứu quy tắc (phân tầng)
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.the_ngan_sang} onPress={() => dieuHuongMoTabMoi(navigation, 'TroLyTriThuc')}>
          <Text style={styles.chu_ngan_sang}>🤖 Trợ lý tri thức</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.the_ngan_sang}
          onPress={() => dieuHuongMoTabMoi(navigation, 'QuanLyChuyenMon')}
        >
          <Text style={styles.chu_ngan_sang}>🧠 Chuyên môn (EBM)</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.the_ngan_sang} onPress={() => dieuHuongMoTabMoi(navigation, 'Helper')}>
          <Text style={styles.chu_ngan_sang}>🧰 Helper</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.header}>
        <TouchableOpacity onPress={quayLai} style={styles.nut_quay_lai}>
          <Text style={styles.txt_back}>⬅ QUAY LẠI TỔNG QUAN</Text>
        </TouchableOpacity>
        <Text style={styles.txt_title}>📚 THƯ VIỆN</Text>
        <TouchableOpacity
          style={[styles.nut_in, cheDo !== 'TAI_LIEU' && styles.nut_in_mo]}
          onPress={() => void inDanhSachTaiLieu()}
          activeOpacity={0.85}
          disabled={cheDo !== 'TAI_LIEU'}
        >
          <Text style={styles.txt_in}>🖨 In / PDF</Text>
        </TouchableOpacity>
      </View>

      {cheDo === 'QUY_TAC' ? (
        <View style={styles.khung_tra_cuu_full}>
          <ThuVienPanelTraCuuQuyTac />
        </View>
      ) : (
        <View style={[styles.khung_chinh, dungHaiCot ? styles.khung_hai_cot : styles.khung_mot_cot]}>
          {khoiMucLuc}
          <View style={styles.panel_phai}>
            {dauViewDoc}
            <View style={styles.vung_loi_tren}>{!coGoc ? <View style={styles.warn_box_hinh_thanh}>
              <Text style={styles.warn_txt_nho}>
                Không phát hiện host. HTML trong khung tối ưu trên web; thiết bị khác dùng Mở tab mới.
              </Text>
            </View> : null}</View>
            <View style={styles.khung_viewer_flex}>{renderCuaSoDoc()}</View>
            <View style={styles.footer_note_hinh_thanh}>
              <Text style={styles.footer_txt}>
                Cập nhật manifest: {taiLieuManifest.generatedAt || '—'}. Bản build web: <Text style={styles.lead_mono}>tai_lieu:prepare</Text> gói HTML vào phân phối.
              </Text>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CD.bg.gradient_mobile,
    ...Platform.select({ web: { backgroundImage: CD.web.gradient_bg } }),
  },
  thanh_5_the: {
    flexGrow: 0,
    borderBottomWidth: 1,
    borderBottomColor: CD.border.divider,
    backgroundColor: CD.bg.glass_card,
  },
  thanh_5_the_content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minHeight: 48,
  },
  the_ngan: {
    borderRadius: 22,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    flexShrink: 0,
  },
  the_ngan_sang: {
    backgroundColor: CD.brand.mauNhat,
    borderColor: CD.border.accent,
    ...Platform.select({ web: { boxShadow: '0 1px 4px rgba(0,0,0,0.06)' } }),
  },
  the_ngan_toi: {
    backgroundColor: 'rgba(30, 41, 59, 0.85)',
    borderColor: 'rgba(148, 163, 184, 0.45)',
  },
  chu_ngan_nen: { fontSize: 12, fontWeight: '600', fontFamily: CD.font.family },
  chu_ngan_tren_toi: { color: 'rgba(248, 250, 252, 0.92)' },
  chu_ngan_sang: {
    color: CD.brand.mauDam,
    fontWeight: '800',
    fontSize: 12,
    fontFamily: CD.font.family,
  },
  header: {
    backgroundColor: CD.brand.mauDam,
    borderBottomWidth: 1,
    borderBottomColor: CD.border.header,
    paddingHorizontal: 24,
    paddingVertical: 16,
    paddingTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...Platform.select({
      web: {
        backgroundImage: CD.web.gradient_header,
        backdropFilter: CD.web.blur_header,
        boxShadow: CD.web.shadow_header,
      },
    }),
  },
  nut_quay_lai: {
    padding: 10,
    backgroundColor: CD.bg.glass_input,
    borderWidth: 1,
    borderColor: CD.border.glass_md,
    borderRadius: 14,
  },
  txt_back: {
    color: CD.text.primary,
    fontWeight: '700',
    fontSize: 14,
    fontFamily: CD.font.family,
  },
  txt_title: {
    color: CD.text.primary,
    fontWeight: '800',
    fontSize: 22,
    fontFamily: CD.font.family,
  },
  nut_in: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: CD.bg.glass_input,
    borderWidth: 1,
    borderColor: CD.border.glass_md,
    borderRadius: 14,
    minWidth: 120,
    alignItems: 'center',
  },
  txt_in: {
    color: CD.text.primary,
    fontWeight: '700',
    fontSize: 13,
    fontFamily: CD.font.family,
  },
  khung_tra_cuu_full: { flex: 1, minHeight: 0, backgroundColor: '#F0F4F8' },
  nut_in_mo: { opacity: 0.4 },
  khung_chinh: { flex: 1, minHeight: 0, minWidth: 0 },
  khung_hai_cot: { flexDirection: 'row', alignItems: 'stretch' },
  khung_mot_cot: { flexDirection: 'column', alignItems: 'stretch' },
  sidebar: {
    backgroundColor: CD.bg.glass_card,
    borderColor: CD.border.glass,
    borderWidth: 1,
    ...Platform.select({ web: { boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }, default: { elevation: 2 } }),
  },
  sidebar_ngang: {
    width: RONG_SIDEBAR_TOC,
    flexShrink: 0,
    borderRightWidth: 1,
    borderRightColor: CD.border.divider,
  },
  sidebar_dung: {
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: CD.border.divider,
  },
  sidebar_head: { padding: 14, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: CD.border.divider },
  sidebar_tieu_de: { color: CD.text.primary, fontSize: 16, fontWeight: '800', fontFamily: CD.font.family, marginBottom: 10 },
  o_tim_kiem: {
    backgroundColor: CD.bg.glass_input,
    borderWidth: 1,
    borderColor: CD.border.glass_md,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    fontSize: 14,
    color: CD.text.primary,
    fontFamily: CD.font.family,
    marginBottom: 6,
  },
  thanh_the_loc: { flexGrow: 0, marginBottom: 6, maxHeight: 40 },
  thanh_the_loc_content: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 2 },
  chip_the: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: CD.border.glass_md,
    backgroundColor: CD.bg.glass_input,
    flexShrink: 0,
  },
  chip_the_active: {
    backgroundColor: CD.brand.mauNhat,
    borderColor: CD.border.accent,
  },
  chip_the_txt: { fontSize: 11, color: CD.text.secondary, fontWeight: '600', fontFamily: CD.font.family },
  chip_the_txt_active: { fontSize: 11, color: CD.brand.mauDam, fontWeight: '800', fontFamily: CD.font.family },
  dem_muc: { color: CD.text.muted, fontSize: 11, fontFamily: CD.font.family },
  sidebar_scroll: { flex: 1, minHeight: 0 },
  sidebar_scroll_content: { padding: 8, paddingBottom: 20 },
  muc_muc_luc: {
    paddingVertical: 11,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  muc_muc_luc_active: {
    backgroundColor: CD.brand.mauNhat,
    borderColor: CD.border.accent,
  },
  muc_tieu_de: { color: CD.text.primary, fontSize: 14, fontWeight: '700', fontFamily: CD.font.family },
  muc_tieu_de_active: { color: CD.brand.mauDam },
  muc_meta: { color: CD.text.muted, fontSize: 10, fontFamily: CD.font.mono, marginTop: 4 },
  muc_the: {
    color: CD.brand.mauDam,
    fontSize: 10,
    fontFamily: CD.font.family,
    marginTop: 4,
    opacity: 0.92,
    lineHeight: 14,
  },
  empty_sidebar: { padding: 16, alignItems: 'center' },
  empty_sidebar_txt: { color: CD.text.secondary, textAlign: 'center', lineHeight: 20, fontSize: 13 },
  panel_phai: { flex: 1, minWidth: 0, minHeight: 0, backgroundColor: 'transparent' },
  dau_cua_so_doc: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: CD.border.divider,
    backgroundColor: CD.bg.glass_card,
  },
  tieu_de_tai_lieu: {
    color: CD.text.primary,
    fontSize: 16,
    fontWeight: '800',
    flex: 1,
    minWidth: 0,
    fontFamily: CD.font.family,
  },
  btn_mo_tab: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: CD.brand.mauNhat,
    borderWidth: 1,
    borderColor: CD.border.accent,
  },
  txt_mo_tab: { color: CD.brand.mauDam, fontWeight: '800', fontSize: 12, fontFamily: CD.font.family },
  vung_loi_tren: { paddingHorizontal: 12, paddingTop: 4 },
  warn_box_hinh_thanh: {
    backgroundColor: CD.severity.warning.bg,
    borderWidth: 1,
    borderColor: CD.severity.warning.border,
    borderRadius: 8,
    padding: 8,
  },
  warn_txt_nho: { color: CD.severity.warning.text, fontSize: 12, lineHeight: 18 },
  khung_viewer_flex: { flex: 1, minHeight: 0, paddingHorizontal: 12, paddingTop: 8, paddingBottom: 0 },
  footer_note_hinh_thanh: { paddingHorizontal: 12, paddingVertical: 8 },
  man_hinh_cho: {
    flex: 1,
    minHeight: 200,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  icon_cho: { fontSize: 42, marginBottom: 12 },
  txt_cho_tieu_de: { color: CD.text.primary, fontSize: 18, fontWeight: '800', textAlign: 'center', fontFamily: CD.font.family },
  txt_cho_phu: { color: CD.text.secondary, fontSize: 14, lineHeight: 22, textAlign: 'center', marginTop: 8 },
  lead_mono: { fontFamily: CD.font.mono, fontSize: 13, color: CD.text.accent },
  bao_loi_viewer: { flex: 1, padding: 20, alignItems: 'center', justifyContent: 'center', minHeight: 200 },
  warn_txt: { color: CD.severity.warning.text, fontSize: 13, lineHeight: 20, textAlign: 'center' },
  txt_bao_loi: { color: CD.text.secondary, fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: 12 },
  btn_mo_ngoai: { marginTop: 8, paddingVertical: 10, paddingHorizontal: 16, backgroundColor: CD.brand.mauChinh, borderRadius: 10 },
  txt_mo_ngoai: { color: '#FFFFFF', fontWeight: '800', fontSize: 14, fontFamily: CD.font.family },
  khung_tai_noi_dung: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 200, gap: 12 },
  txt_tai_noi_dung: { color: CD.text.secondary, fontSize: 14 },
  scroll_noi_dung_van_ban: { flex: 1, backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: CD.border.glass },
  scroll_noi_dung_van_ban_content: { padding: 16, paddingBottom: 32 },
  noi_dung_van_ban: { fontFamily: CD.font.mono, fontSize: 13, lineHeight: 20, color: '#1a1a1a' },
  footer_txt: { color: CD.text.muted, fontSize: 11, lineHeight: 16 },
});

export default ManHinhThuVien;
