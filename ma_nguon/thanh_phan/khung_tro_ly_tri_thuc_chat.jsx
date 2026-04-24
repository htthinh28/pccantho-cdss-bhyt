/**
 * Khung trò chuyện trợ lý tri thức (RAG nội bộ) — dùng chung: màn hình đầy đủ hoặc cửa sổ popup.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { CD } from '../tien_ich/chu_de_giao_dien';
import { dieuHuongMoTabMoi } from '../tien_ich/dieu_huong_mo_tab_moi';
import { docVanBan, dungDoc } from '../tien_ich/giong_doc_tri_thuc';
import taiLieuManifest from '../tien_ich/tai_lieu_manifest.json';
import { layDanhSachTriThucTuGiamDinh } from '../tien_ich/tri_thuc_tu_giam_dinh';
import { traLoiTroLyTriThuc } from '../tien_ich/tro_ly_tri_thuc_engine';

const GOI_Y_NHANH = [
  { label: 'THUOC_417', text: 'Vì sao hệ thống báo THUOC_417? Căn cứ trong thư viện nội bộ?' },
  { label: 'CK_41', text: 'Giải thích quy tắc CK_41 (công khám lần 2) theo tài liệu trong repo' },
  { label: 'Phác đồ / ICD', text: 'Phác đồ CDSS chuyên môn và gợi ý theo ICD trong tài liệu nội bộ' },
  { label: 'QĐ 4210 / XML', text: 'Cấu trúc XML theo QĐ 4210 và 7464: tài liệu thẻ tri thức nào trong thư viện nội bộ?' },
];

/**
 * @param {object} props
 * @param {'man_hinh' | 'cua_so'} props.cheDoHienThi
 * @param {import('@react-navigation/native').NavigationProp<any>} [props.navigation]
 * @param {() => void} [props.onDong] — đóng cửa sổ (popup)
 * @param {() => void} [props.onQuayLaiMenu] — khi ở cửa sổ: quay lại menu FAB
 */
const KhungTroLyTriThucChat = ({
  cheDoHienThi = 'man_hinh',
  navigation,
  onDong,
  onQuayLaiMenu,
}) => {
  const laCuaSo = cheDoHienThi === 'cua_so';
  const [tinNhan, setTinNhan] = useState([]);
  const [nhap, setNhap] = useState('');
  const [dangXuLy, setDangXuLy] = useState(false);
  const [triThuc, setTriThuc] = useState([]);
  const scrollRef = useRef(null);

  useEffect(() => {
    layDanhSachTriThucTuGiamDinh().then(setTriThuc).catch(() => setTriThuc([]));
    return () => dungDoc();
  }, []);

  const gui = useCallback(async (cauHoiRaw) => {
    const cauHoi = String(cauHoiRaw ?? nhap).trim();
    if (!cauHoi || dangXuLy) return;
    setNhap('');
    const userMsg = { role: 'user', text: cauHoi, ts: Date.now() };
    setTinNhan((prev) => [...prev, userMsg]);
    setDangXuLy(true);
    try {
      const freshTriThuc = await layDanhSachTriThucTuGiamDinh().catch(() => []);
      const ketQua = await traLoiTroLyTriThuc({
        cauHoi,
        manifestItems: taiLieuManifest.items || [],
        generatedAt: taiLieuManifest.generatedAt || '',
        triThucGiamDinh: freshTriThuc,
        gioiHanTaiFile: 12,
      });
      setTinNhan((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: ketQua.markdown || ketQua.loi || 'Không có nội dung.',
          ok: ketQua.ok,
          nguon: ketQua.nguon || [],
          ts: Date.now(),
        },
      ]);
    } catch (e) {
      setTinNhan((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: `**Lỗi xử lý:** ${String(e?.message || e)}`,
          ok: false,
          ts: Date.now(),
        },
      ]);
    } finally {
      setDangXuLy(false);
    }
  }, [dangXuLy, nhap]);

  useEffect(() => {
    const t = setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 120);
    return () => clearTimeout(t);
  }, [tinNhan, dangXuLy]);

  return (
    <View style={[styles.khung, laCuaSo && styles.khung_cua_so]}>
      <View style={[styles.header, laCuaSo && styles.header_cua_so]}>
        {laCuaSo && onQuayLaiMenu ? (
          <TouchableOpacity onPress={onQuayLaiMenu} style={styles.btn_header}>
            <Text style={styles.txt_header_btn}>←</Text>
          </TouchableOpacity>
        ) : null}
        {!laCuaSo && navigation ? (
          <TouchableOpacity onPress={() => dieuHuongMoTabMoi(navigation, 'TongQuan')} style={styles.btn_header}>
            <Text style={styles.txt_header_btn}>⬅ TỔNG QUAN</Text>
          </TouchableOpacity>
        ) : null}
        <Text style={[styles.title, laCuaSo && styles.title_cua_so]} numberOfLines={1}>
          🤖 Trợ lý tri thức
        </Text>
        <View style={styles.header_right_btns}>
          {navigation ? (
            <TouchableOpacity onPress={() => dieuHuongMoTabMoi(navigation, 'ThuVien')} style={styles.btn_header}>
              <Text style={styles.btn_side_txt}>📚</Text>
            </TouchableOpacity>
          ) : null}
          {laCuaSo && onDong ? (
            <TouchableOpacity onPress={onDong} style={styles.btn_header}>
              <Text style={styles.btn_close_txt}>✕</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ minWidth: laCuaSo ? 0 : 44 }} />
          )}
        </View>
      </View>

      <Text style={[styles.lead, laCuaSo && styles.lead_compact]}>
        Trả lời từ thư viện <Text style={styles.mono}>tai_lieu/</Text>, thẻ phác đồ/chuyên môn (CDSS), tri thức đã lưu — không tra web.
      </Text>

      <View style={[styles.chips, laCuaSo && styles.chips_compact]}>
        {GOI_Y_NHANH.map((g) => (
          <TouchableOpacity key={g.label} style={styles.chip} onPress={() => gui(g.text)} disabled={dangXuLy}>
            <Text style={styles.chip_txt}>{g.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <KeyboardAvoidingView
        style={styles.flex1}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={styles.scrollInner}
          keyboardShouldPersistTaps="handled"
        >
          {tinNhan.length === 0 ? (
            <Text style={styles.hint}>
              Hỏi mã lỗi (THUOC_391…), nghiệp vụ BHYT, hoặc phác đồ/chuyên môn (ICD, CDSS). Tri thức từ giám định đã lưu:{' '}
              <Text style={{ fontWeight: '800' }}>{triThuc.length}</Text> bản ghi.
            </Text>
          ) : null}
          {tinNhan.map((m, idx) => (
            <View
              key={`${m.ts}-${idx}`}
              style={[styles.bubble, m.role === 'user' ? styles.bubble_user : styles.bubble_bot]}
            >
              <Text style={styles.bubble_role}>{m.role === 'user' ? 'Bạn' : 'Trợ lý (RAG nội bộ)'}</Text>
              <Text style={styles.bubble_text}>{m.text}</Text>
              {m.nguon?.length ? (
                <Text style={styles.nguon}>
                  Nguồn: {m.nguon.slice(0, 6).map((n) => n.tieuDe || n.file).join(' · ')}
                  {m.nguon.length > 6 ? '…' : ''}
                </Text>
              ) : null}
              {m.role === 'assistant' && m.ok !== false ? (
                <TouchableOpacity style={styles.speak_btn} onPress={() => docVanBan(m.text)}>
                  <Text style={styles.speak_btn_txt}>🔊 Đọc</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ))}
          {dangXuLy ? (
            <View style={styles.loading_row}>
              <ActivityIndicator color={CD.brand.mauChinh} />
              <Text style={styles.loading_txt}>Đang quét tri thức nội bộ…</Text>
            </View>
          ) : null}
        </ScrollView>

        <View style={styles.input_row}>
          <TextInput
            style={styles.input}
            placeholder="Câu hỏi, mã rule, ICD, phác đồ…"
            placeholderTextColor={CD.text.muted}
            value={nhap}
            onChangeText={setNhap}
            editable={!dangXuLy}
            onSubmitEditing={() => gui()}
            returnKeyType="send"
            multiline={Platform.OS !== 'web'}
          />
          <TouchableOpacity style={styles.send_btn} onPress={() => gui()} disabled={dangXuLy}>
            <Text style={styles.send_txt}>Gửi</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.stop_speak} onPress={() => dungDoc()}>
            <Text style={styles.stop_speak_txt}>⏹</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  khung: { flex: 1, backgroundColor: CD.bg.gradient_mobile, ...Platform.select({ web: { backgroundImage: CD.web.gradient_bg } }) },
  khung_cua_so: { minHeight: 320, maxHeight: '100%' },
  flex1: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 8,
    paddingTop: Platform.OS === 'web' ? 10 : 8,
    backgroundColor: CD.brand.mauDam,
    borderBottomWidth: 1,
    borderBottomColor: CD.border.header,
  },
  header_cua_so: { paddingTop: 10 },
  header_right_btns: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  btn_header: { padding: 8 },
  txt_header_btn: { color: CD.text.primary, fontWeight: '700', fontSize: 12, fontFamily: CD.font.family },
  btn_side_txt: { fontSize: 18 },
  btn_close_txt: { fontSize: 18, color: '#FFF', fontWeight: '800' },
  title: {
    color: CD.text.primary,
    fontWeight: '800',
    fontSize: 15,
    fontFamily: CD.font.family,
    flex: 1,
    textAlign: 'center',
  },
  title_cua_so: { fontSize: 14 },
  lead: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: CD.text.secondary,
    fontSize: 12,
    lineHeight: 18,
    fontFamily: CD.font.family,
  },
  lead_compact: { paddingVertical: 6, fontSize: 11, lineHeight: 16 },
  mono: { fontFamily: CD.font.mono, fontSize: 11, color: CD.text.table_cell },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, paddingHorizontal: 12, marginBottom: 6 },
  chips_compact: { marginBottom: 4, gap: 4 },
  chip: {
    backgroundColor: CD.bg.glass_input,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: CD.border.glass,
  },
  chip_txt: { color: CD.brand.mauDam, fontWeight: '700', fontSize: 11, fontFamily: CD.font.family },
  scroll: { flex: 1 },
  scrollInner: { padding: 12, paddingBottom: 16 },
  hint: { color: CD.text.muted, fontSize: 13, lineHeight: 20, marginBottom: 8, fontFamily: CD.font.family },
  bubble: {
    marginBottom: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    maxWidth: '100%',
  },
  bubble_user: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(194, 24, 91, 0.12)',
    borderColor: CD.border.accent,
  },
  bubble_bot: {
    alignSelf: 'stretch',
    backgroundColor: CD.bg.glass_card,
    borderColor: CD.border.glass,
  },
  bubble_role: { fontSize: 10, fontWeight: '800', color: CD.text.muted, marginBottom: 4, fontFamily: CD.font.family },
  bubble_text: { fontSize: 13, lineHeight: 20, color: CD.text.table_cell, fontFamily: CD.font.family },
  nguon: { marginTop: 8, fontSize: 10, color: CD.text.muted, fontFamily: CD.font.mono },
  speak_btn: {
    alignSelf: 'flex-start',
    marginTop: 8,
    backgroundColor: CD.brand.mauNhat,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: CD.border.accent,
  },
  speak_btn_txt: { color: CD.brand.mauDam, fontWeight: '800', fontSize: 12, fontFamily: CD.font.family },
  loading_row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  loading_txt: { color: CD.text.secondary, fontSize: 12, fontFamily: CD.font.family },
  input_row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 10,
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: CD.border.header,
    backgroundColor: CD.bg.glass_input,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: CD.border.glass_md,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: CD.text.primary,
    fontFamily: CD.font.family,
    fontSize: 14,
    ...Platform.select({ web: { outlineStyle: 'none' } }),
  },
  send_btn: {
    backgroundColor: CD.brand.mauChinh,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  send_txt: { color: '#fff', fontWeight: '800', fontSize: 13, fontFamily: CD.font.family },
  stop_speak: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: CD.border.glass,
  },
  stop_speak_txt: { fontSize: 16 },
});

export default KhungTroLyTriThucChat;
