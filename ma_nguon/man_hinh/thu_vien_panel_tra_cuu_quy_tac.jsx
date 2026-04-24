import { useMemo, useState } from 'react';
import {
  Platform,
  ScrollView,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import {
  LOAI_NGUON,
  NHOM_GIAM_DINH_META,
  layTatCaBanGhiQuyTacPhanLap,
  locBanGhiQuyTac,
} from '../tien_ich/tra_cuu_quy_tac_phan_lap';

const RONG_SIDEBAR = 300;
const BE_RONG_HAI_COT = 820;

// Nền sáng trực quan (tách biệt theme tối của màn ngoài)
const N = {
  nen: '#F0F4F8',
  nenPhai: '#F8FAFC',
  trang: '#FFFFFF',
  vien: '#E2E8F0',
  chu: '#0F172A',
  chuNhat: '#64748B',
  accent: '#0D47A1',
  accentNhat: '#E3F2FD',
};

const ChipNguon = ({ chon, onPress, children }) => (
  <TouchableOpacity
    onPress={onPress}
    style={[NStyle.chip, chon && NStyle.chipChon]}
    activeOpacity={0.85}
  >
    <Text style={[NStyle.chipTxt, chon && NStyle.chipTxtChon]}>{children}</Text>
  </TouchableOpacity>
);

const MucMenu = ({ chon, onPress, children, demPhu }) => (
  <TouchableOpacity
    onPress={onPress}
    style={[NStyle.muc, chon && NStyle.mucChon]}
    activeOpacity={0.8}
  >
    <View style={NStyle.mucIn}>
      <Text style={[NStyle.mucChu, chon && NStyle.mucChuChon]} numberOfLines={3}>
        {children}
      </Text>
      {typeof demPhu === 'number' ? (
        <Text style={[NStyle.mucDem, chon && NStyle.mucDemChon]}>{demPhu}</Text>
      ) : null}
    </View>
  </TouchableOpacity>
);

const TheQuyTac = ({ item }) => {
  const on = item.trang_thai === 'ON';
  return (
    <View style={NStyle.card}>
      <View style={NStyle.cardHead}>
        <Text style={NStyle.cardMa} selectable>
          {item.ma_luat}
        </Text>
        <View style={NStyle.badges}>
          <View style={[NStyle.badge, on ? NStyle.badgeOn : NStyle.badgeOff]}>
            <Text style={NStyle.badgeTxt}>{on ? 'BẬT' : 'TẮT'}</Text>
          </View>
          <View style={[NStyle.badge, NStyle.badgeCung]}>
            <Text style={NStyle.badgeTxt}>Cứng</Text>
          </View>
          {item.phan_tang ? (
            <View style={NStyle.badgeL}>
              <Text style={NStyle.badgeTxtL}>{item.phan_tang}</Text>
            </View>
          ) : null}
        </View>
      </View>
      <Text style={NStyle.cardTen} selectable>
        {item.ten_quy_tac}
      </Text>
      <Text style={NStyle.cardNhan}>Cảnh báo (mẫu)</Text>
      <Text style={NStyle.cardBody} selectable>
        {item.canh_bao || '—'}
      </Text>
      <Text style={NStyle.cardNhan}>Nguyên tắc / điều kiện</Text>
      <Text style={NStyle.cardBodyMono} selectable>
        {item.nguyen_tac_lam_viec}
      </Text>
      <Text style={NStyle.cardNhan}>Ghi chú — khi dễ sai / hạn chế</Text>
      <Text style={NStyle.cardGhiChu} selectable>
        {item.ghi_chu_rui_ro}
      </Text>
    </View>
  );
};

const ThuVienPanelTraCuuQuyTac = () => {
  const { width: beRong } = useWindowDimensions();
  const dungHaiCot = beRong >= BE_RONG_HAI_COT;

  const [tuKhoa, setTuKhoa] = useState('');
  const [loaiLoc, setLoaiLoc] = useState('');
  const [nhomLoc, setNhomLoc] = useState('');

  const tatCaGoc = useMemo(() => layTatCaBanGhiQuyTacPhanLap(), []);

  const locSauKhoaVaNguon = useMemo(() => {
    const loai = loaiLoc === 'cung' ? LOAI_NGUON.LUAT_CUNG : null;
    return locBanGhiQuyTac(tatCaGoc, {
      tuKhoa,
      loaiNguonLoc: loai,
      nhomIdLoc: null,
    });
  }, [tatCaGoc, tuKhoa, loaiLoc]);

  const demTheoNhom = useMemo(() => {
    const m = new Map();
    locSauKhoaVaNguon.forEach((r) => {
      const k = r.phan_nhom_id;
      m.set(k, (m.get(k) || 0) + 1);
    });
    return m;
  }, [locSauKhoaVaNguon]);

  const sections = useMemo(() => {
    const loai = loaiLoc === 'cung' ? LOAI_NGUON.LUAT_CUNG : null;
    const loc = locBanGhiQuyTac(tatCaGoc, {
      tuKhoa,
      loaiNguonLoc: loai,
      nhomIdLoc: nhomLoc || null,
    });
    const theoNhom = new Map();
    loc.forEach((r) => {
      const k = r.phan_nhom_id;
      if (!theoNhom.has(k)) theoNhom.set(k, []);
      theoNhom.get(k).push(r);
    });
    theoNhom.forEach((arr) => {
      arr.sort((a, b) =>
        String(a.ma_luat).localeCompare(String(b.ma_luat), 'vi', { sensitivity: 'base' }),
      );
    });
    if (nhomLoc) {
      const meta = NHOM_GIAM_DINH_META.find((x) => x.id === nhomLoc);
      const data = theoNhom.get(nhomLoc) || [];
      return [
        { title: meta ? meta.ten : nhomLoc, nhomId: nhomLoc, data },
      ];
    }
    return NHOM_GIAM_DINH_META.map((m) => ({
      title: m.ten,
      nhomId: m.id,
      data: theoNhom.get(m.id) || [],
    })).filter((s) => s.data.length > 0);
  }, [tatCaGoc, tuKhoa, loaiLoc, nhomLoc]);

  const soMuc = useMemo(
    () => sections.reduce((n, s) => n + s.data.length, 0),
    [sections],
  );

  const chonTatCaNhom = () => setNhomLoc('');

  const khoiSidebar = (
    <View style={dungHaiCot ? NStyle.sidebarCot : NStyle.sidebarCotDung}>
      <Text style={NStyle.sdHead}>Nhóm giám định</Text>
      <Text style={NStyle.sdPhu}>Chọn để lọc bên phải</Text>
      <ScrollView
        style={NStyle.sdScroll}
        contentContainerStyle={NStyle.sdScrollIn}
        showsVerticalScrollIndicator
        keyboardShouldPersistTaps="handled"
      >
        <MucMenu chon={nhomLoc === ''} onPress={chonTatCaNhom} demPhu={locSauKhoaVaNguon.length}>
          Tất cả nhóm
        </MucMenu>
        {NHOM_GIAM_DINH_META.map((m) => (
          <MucMenu
            key={m.id}
            chon={nhomLoc === m.id}
            onPress={() => setNhomLoc(nhomLoc === m.id ? '' : m.id)}
            demPhu={demTheoNhom.get(m.id) || 0}
          >
            {m.ten}
          </MucMenu>
        ))}
      </ScrollView>
    </View>
  );

  const khoiNoiDung = (
    <View style={NStyle.khungPhai}>
      <View style={NStyle.dauPhai}>
        <Text style={NStyle.tieuDePanel}>Quy tắc theo phân tầng giám định (L0…L5)</Text>
        <Text style={NStyle.phuDe}>
          Sắp theo nhóm nghiệp vụ; gồm luật cứng bundle (CDHA_*, DVKT-OP-*, thuốc, hành chính…), seed PTTT mục 11 và
          danh mục mẫu ON/OFF — cùng nguồn định nghĩa với màn Quản lý quy tắc ON/OFF (trừ quy tắc chỉ do BV import qua
          Excel). Tìm theo từ khóa; BẬT/TẮT hiển thị theo mặc định trong mã.
        </Text>
        <TextInput
          value={tuKhoa}
          onChangeText={setTuKhoa}
          placeholder="Tìm: mã quy tắc, tên, cảnh báo, tầng (L0…L5)…"
          placeholderTextColor={N.chuNhat}
          style={NStyle.oTim}
          autoCapitalize="none"
          autoCorrect={false}
          {...(Platform.OS === 'ios' ? { clearButtonMode: 'while-editing' } : {})}
        />
        <View style={NStyle.hangChip}>
          <Text style={NStyle.nhanNho}>Nguồn:</Text>
          <ChipNguon chon={loaiLoc === ''} onPress={() => setLoaiLoc('')}>
            Tất cả
          </ChipNguon>
          <ChipNguon chon={loaiLoc === 'cung'} onPress={() => setLoaiLoc('cung')}>
            Luật cứng
          </ChipNguon>
        </View>
        <Text style={NStyle.demKq}>
          Kết quả: {soMuc} mục (từ {tatCaGoc.length} quy tắc; đang lọc:{' '}
          {nhomLoc ? (NHOM_GIAM_DINH_META.find((x) => x.id === nhomLoc)?.ten || nhomLoc) : 'mọi nhóm'})
        </Text>
      </View>
      <SectionList
        style={NStyle.listFlex}
        sections={sections}
        keyExtractor={(it) => it.id}
        renderSectionHeader={({ section: { title } }) => (
          <View style={NStyle.secHead}>
            <Text style={NStyle.secHeadTxt}>{title}</Text>
          </View>
        )}
        renderItem={({ item }) => <TheQuyTac item={item} />}
        contentContainerStyle={NStyle.listPad}
        stickySectionHeadersEnabled
        ListEmptyComponent={
          <View style={NStyle.trong}>
            <Text style={NStyle.trongTxt}>
              Không có quy tắc nào khớp. Thử bỏ từ khóa, chọn lại nhóm bên trái hoặc nguồn.
            </Text>
          </View>
        }
        initialNumToRender={10}
        maxToRenderPerBatch={16}
        windowSize={9}
        nestedScrollEnabled
      />
    </View>
  );

  if (dungHaiCot) {
    return (
      <View style={NStyle.split}>
        {khoiSidebar}
        {khoiNoiDung}
      </View>
    );
  }

  return (
    <View style={NStyle.splitDung}>
      {khoiSidebar}
      {khoiNoiDung}
    </View>
  );
};

const NStyle = StyleSheet.create({
  split: {
    flex: 1,
    minHeight: 0,
    flexDirection: 'row',
    backgroundColor: N.nen,
  },
  splitDung: {
    flex: 1,
    minHeight: 0,
    flexDirection: 'column',
    backgroundColor: N.nen,
  },
  sidebarCot: {
    width: RONG_SIDEBAR,
    flexGrow: 0,
    flexShrink: 0,
    alignSelf: 'stretch',
    flexDirection: 'column',
    minHeight: 0,
    backgroundColor: N.trang,
    borderRightWidth: 1,
    borderRightColor: N.vien,
    ...Platform.select({
      web: { boxShadow: '2px 0 12px rgba(15,23,42,0.06)' },
      default: { elevation: 3 },
    }),
  },
  sidebarCotDung: {
    width: '100%',
    maxHeight: 300,
    flexShrink: 0,
    flexDirection: 'column',
    minHeight: 0,
    backgroundColor: N.trang,
    borderBottomWidth: 1,
    borderBottomColor: N.vien,
  },
  sdHead: {
    color: N.chu,
    fontSize: 15,
    fontWeight: '800',
    fontFamily: 'Arial',
    paddingHorizontal: 14,
    paddingTop: 12,
  },
  sdPhu: { color: N.chuNhat, fontSize: 11, paddingHorizontal: 14, marginTop: 2, fontFamily: 'Arial' },
  sdScroll: { flex: 1, minHeight: 0 },
  sdScrollIn: { paddingHorizontal: 8, paddingTop: 8, paddingBottom: 16, gap: 2 },
  muc: {
    borderRadius: 10,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  mucChon: { backgroundColor: N.accentNhat, borderColor: N.accent },
  mucIn: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, paddingVertical: 10, paddingHorizontal: 10 },
  mucChu: { color: N.chu, fontSize: 12, fontWeight: '600', flex: 1, fontFamily: 'Arial' },
  mucChuChon: { color: N.accent, fontWeight: '800' },
  mucDem: { fontSize: 10, color: N.chuNhat, fontWeight: '700', minWidth: 32, textAlign: 'right', fontFamily: 'Arial' },
  mucDemChon: { color: N.accent },
  khungPhai: {
    flex: 1,
    minWidth: 0,
    minHeight: 0,
    backgroundColor: N.nenPhai,
  },
  dauPhai: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: N.vien,
    backgroundColor: N.trang,
  },
  tieuDePanel: { color: N.chu, fontSize: 18, fontWeight: '800', fontFamily: 'Arial' },
  phuDe: { color: N.chuNhat, fontSize: 12, lineHeight: 18, marginTop: 6, fontFamily: 'Arial' },
  oTim: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: N.vien,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    fontSize: 14,
    color: N.chu,
    marginTop: 10,
    fontFamily: 'Arial',
  },
  hangChip: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginTop: 10 },
  nhanNho: { color: N.chuNhat, fontSize: 12, marginRight: 4, fontFamily: 'Arial' },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: N.vien,
    backgroundColor: N.trang,
  },
  chipChon: { backgroundColor: N.accentNhat, borderColor: N.accent },
  chipTxt: { color: N.chu, fontSize: 12, fontWeight: '600', fontFamily: 'Arial' },
  chipTxtChon: { color: N.accent, fontWeight: '800' },
  demKq: { color: N.chuNhat, fontSize: 11, marginTop: 8, fontFamily: 'Arial' },
  listFlex: { flex: 1, minHeight: 0 },
  listPad: { paddingBottom: 28 },
  secHead: {
    backgroundColor: N.accentNhat,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderLeftWidth: 4,
    borderLeftColor: N.accent,
  },
  secHeadTxt: { color: N.accent, fontSize: 14, fontWeight: '800', fontFamily: 'Arial' },
  card: {
    marginHorizontal: 12,
    marginTop: 10,
    padding: 14,
    borderRadius: 12,
    backgroundColor: N.trang,
    borderWidth: 1,
    borderColor: N.vien,
    ...Platform.select({ web: { boxShadow: '0 1px 6px rgba(15,23,42,0.06)' }, default: { elevation: 1 } }),
  },
  cardHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, flexWrap: 'wrap' },
  cardMa: { color: N.accent, fontSize: 14, fontWeight: '800', fontFamily: 'Arial', flex: 1, minWidth: 120 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgeOn: { backgroundColor: 'rgba(46, 125, 50, 0.12)' },
  badgeOff: { backgroundColor: 'rgba(198, 40, 40, 0.1)' },
  badgeCung: { backgroundColor: 'rgba(121, 85, 72, 0.1)' },
  badgeL: { backgroundColor: '#E2E8F0', paddingHorizontal: 6, borderRadius: 4 },
  badgeTxt: { fontSize: 9, fontWeight: '800', color: N.chu, fontFamily: 'Arial' },
  badgeTxtL: { fontSize: 9, fontWeight: '800', color: N.chuNhat, fontFamily: 'Arial' },
  cardTen: { color: N.chu, fontSize: 15, fontWeight: '800', marginTop: 6, fontFamily: 'Arial' },
  cardNhan: { color: N.accent, fontSize: 11, fontWeight: '800', marginTop: 10, fontFamily: 'Arial' },
  cardBody: { color: N.chu, fontSize: 13, lineHeight: 20, marginTop: 4, fontFamily: 'Arial' },
  cardBodyMono: { color: N.chuNhat, fontSize: 12, lineHeight: 18, marginTop: 4, fontFamily: 'Arial' },
  cardGhiChu: { color: N.chuNhat, fontSize: 12, lineHeight: 19, marginTop: 4, fontStyle: 'italic' },
  trong: { padding: 24, alignItems: 'center' },
  trongTxt: { color: N.chuNhat, textAlign: 'center', lineHeight: 20, fontFamily: 'Arial' },
});

export default ThuVienPanelTraCuuQuyTac;
