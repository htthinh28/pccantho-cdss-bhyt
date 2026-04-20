import { useCallback, useMemo } from 'react';
import {
  Alert,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CD } from '../tien_ich/chu_de_giao_dien';
import { inHoacChiaSePdfTuBang } from '../tien_ich/in_an_chung';
import taiLieuManifest from '../tien_ich/tai_lieu_manifest.json';
import { layGocUrlTaiLieu, taoUrlMoTaiLieu } from '../tien_ich/tai_lieu_url';
import { dieuHuongMoTabMoi } from '../tien_ich/dieu_huong_mo_tab_moi';

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

const nhomTaiLieu = (items) => {
  const m = new Map();
  for (const it of items) {
    const parts = String(it.relPath || '').split('/');
    const folder = parts.length > 1 ? parts.slice(0, -1).join('/') : '__root__';
    if (!m.has(folder)) m.set(folder, []);
    m.get(folder).push(it);
  }
  const keys = [...m.keys()].sort((a, b) => {
    if (a === '__root__') return -1;
    if (b === '__root__') return 1;
    return a.localeCompare(b, 'vi');
  });
  return keys.map((folder) => ({ folder, items: m.get(folder) }));
};

const ManHinhThuVien = ({ navigation }) => {
  const quayLai = useCallback(() => {
    navigation.navigate('TongQuan');
  }, [navigation]);

  const items = useMemo(() => taiLieuManifest.items || [], []);
  const nhom = useMemo(() => nhomTaiLieu(items), [items]);
  const coGoc = Boolean(layGocUrlTaiLieu());

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
      };
    });
    const columns = [
      { key: 'id', label: 'Mã' },
      { key: 'tieu_de', label: 'Tiêu đề' },
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
  }, [items]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={quayLai} style={styles.nut_quay_lai}>
          <Text style={styles.txt_back}>⬅ QUAY LẠI TỔNG QUAN</Text>
        </TouchableOpacity>
        <Text style={styles.txt_title}>📚 THƯ VIỆN</Text>
        <TouchableOpacity style={styles.nut_in} onPress={() => void inDanhSachTaiLieu()} activeOpacity={0.85}>
          <Text style={styles.txt_in}>🖨 In / PDF</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scroll_content} showsVerticalScrollIndicator={false}>
        <Text style={styles.lead}>
          Tài liệu lấy từ thư mục dự án <Text style={styles.lead_mono}>tai_lieu/</Text>: mỗi mục mở bản HTML chi tiết trong
          tab mới (web) hoặc trình duyệt hệ thống. Sau khi thêm hoặc sửa file trong{' '}
          <Text style={styles.lead_mono}>tai_lieu/</Text>, chạy{' '}
          <Text style={styles.lead_mono}>npm run tai_lieu:prepare</Text> rồi tải lại ứng dụng.
        </Text>

        {!coGoc ? (
          <View style={styles.warn_box}>
            <Text style={styles.warn_txt}>
              Không phát hiện host (ví dụ mở ngoài Expo). Hãy dùng web hoặc bản đóng gói để mở file HTML.
            </Text>
          </View>
        ) : null}

        <View style={styles.shortcut_row}>
          <TouchableOpacity style={styles.shortcut_btn} onPress={() => dieuHuongMoTabMoi(navigation, 'TroLyTriThuc')}>
            <Text style={styles.shortcut_txt}>🤖 Trợ lý tri thức</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.shortcut_btn}
            onPress={() => dieuHuongMoTabMoi(navigation, 'QuanLyChuyenMon')}
          >
            <Text style={styles.shortcut_txt}>🧠 Chuyên môn (EBM)</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.shortcut_btn} onPress={() => dieuHuongMoTabMoi(navigation, 'Helper')}>
            <Text style={styles.shortcut_txt}>🧰 Helper</Text>
          </TouchableOpacity>
        </View>

        {items.length === 0 ? (
          <View style={styles.empty_box}>
            <Text style={styles.empty_title}>Chưa có tài liệu HTML</Text>
            <Text style={styles.empty_txt}>
              Đặt file .html hoặc .md vào <Text style={styles.lead_mono}>tai_lieu/</Text>, sau đó chạy{' '}
              <Text style={styles.lead_mono}>npm run tai_lieu:prepare</Text>.
            </Text>
          </View>
        ) : (
          nhom.map(({ folder, items: ds }) => (
            <View key={folder} style={styles.group}>
              <Text style={styles.section_title}>
                {folder === '__root__' ? '📂 Thư mục gốc' : `📂 ${folder}`}
              </Text>
              {ds.map((it) => (
                <TouchableOpacity
                  key={it.id}
                  style={styles.row}
                  onPress={() => moTapHtml(it.relPath)}
                  activeOpacity={0.75}
                >
                  <View style={styles.row_text}>
                    <Text style={styles.row_title} numberOfLines={3}>
                      {it.title}
                    </Text>
                    <Text style={styles.row_meta} numberOfLines={1}>
                      {it.relPath}
                      {it.nguon === 'markdown' ? ' · từ Markdown' : ''}
                      {it.nguon === 'docx' ? ' · Word (.docx)' : ''}
                    </Text>
                  </View>
                  <Text style={styles.row_action}>Mở →</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))
        )}

        <View style={styles.footer_note}>
          <Text style={styles.footer_txt}>
            Bản build web/desktop: lệnh export đã gọi <Text style={styles.lead_mono}>tai_lieu:prepare</Text> để đóng gói
            HTML vào gói phân phối. Cập nhật lúc: {taiLieuManifest.generatedAt || '—'}.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CD.bg.gradient_mobile,
    ...Platform.select({ web: { backgroundImage: CD.web.gradient_bg } }),
  },
  header: {
    backgroundColor: CD.brand.mauDam,
    borderBottomWidth: 1,
    borderBottomColor: CD.border.header,
    paddingHorizontal: 24,
    paddingVertical: 16,
    paddingTop: 40,
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
  scroll: {
    flex: 1,
  },
  scroll_content: {
    padding: 20,
    paddingBottom: 40,
  },
  lead: {
    color: CD.text.secondary,
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 16,
  },
  lead_mono: {
    fontFamily: CD.font.mono,
    fontSize: 13,
    color: CD.text.accent,
  },
  warn_box: {
    backgroundColor: CD.severity.warning.bg,
    borderWidth: 1,
    borderColor: CD.severity.warning.border,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  warn_txt: {
    color: CD.severity.warning.text,
    fontSize: 13,
    lineHeight: 20,
  },
  shortcut_row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  shortcut_btn: {
    backgroundColor: CD.brand.mauNhat,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: CD.border.accent,
  },
  shortcut_txt: {
    color: CD.brand.mauDam,
    fontWeight: '700',
    fontSize: 13,
    fontFamily: CD.font.family,
  },
  group: {
    marginBottom: 8,
  },
  section_title: {
    color: CD.text.primary,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 10,
    marginTop: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: CD.bg.glass_card,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: CD.border.glass,
    gap: 12,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      },
    }),
  },
  row_text: {
    flex: 1,
    minWidth: 0,
  },
  row_title: {
    color: CD.text.primary,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
    fontFamily: CD.font.family,
  },
  row_meta: {
    color: CD.text.muted,
    fontSize: 11,
    fontFamily: CD.font.mono,
  },
  row_action: {
    color: CD.brand.mauChinh,
    fontWeight: '800',
    fontSize: 14,
  },
  empty_box: {
    padding: 20,
    alignItems: 'center',
  },
  empty_title: {
    color: CD.text.primary,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 8,
  },
  empty_txt: {
    color: CD.text.secondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
  footer_note: {
    marginTop: 20,
    padding: 12,
    borderRadius: 8,
    backgroundColor: CD.bg.table_row_even,
    borderWidth: 1,
    borderColor: CD.border.divider,
  },
  footer_txt: {
    color: CD.text.muted,
    fontSize: 12,
    lineHeight: 18,
  },
});

export default ManHinhThuVien;
