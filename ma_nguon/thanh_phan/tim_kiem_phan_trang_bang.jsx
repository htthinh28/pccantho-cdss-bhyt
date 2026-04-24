/**
 * Thanh tìm kiếm đa trường + phân trang (160 / … / Tất cả) — tái sử dụng giữa các module bảng.
 */
import React from 'react';
import { Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { CD } from '../tien_ich/chu_de_giao_dien';
import { TUY_CHON_SO_DONG_BANG } from '../tien_ich/bo_loc_bang_du_lieu';

export default function TimKiemPhanTrangBang({
  tuKhoa,
  onTuKhoa,
  placeholder = 'Tìm theo mã, tên, nội dung cột… (không phân biệt dấu)',
  tongDongGoc,
  tongDongSauLoc,
  soDongMotTrang,
  onSoDongMotTrang,
  trangHienTai,
  onTrangHienTai,
  tongSoTrang,
  chiSoBatDau,
  chiSoKetThuc,
  /** Ẩn cụm phân trang khi không cần (chỉ tìm) */
  anPhanTrang = false,
  /** Ẩn ô tìm (điều khiển từ khóa ở thanh ngoài) — vẫn hiện tóm tắt + phân trang */
  anThanhTim = false,
}) {
  const coLoc = tongDongSauLoc < tongDongGoc;
  const hienThiPhanTrang = !anPhanTrang && tongDongGoc > 0;

  return (
    <View style={styles.khung}>
      {!anThanhTim ? (
        <View style={styles.hang_tim}>
          <Text style={styles.nhanTim}>🔎</Text>
          <TextInput
            style={styles.oTim}
            value={tuKhoa}
            onChangeText={onTuKhoa}
            placeholder={placeholder}
            placeholderTextColor={CD.text.placeholder}
            autoCorrect={false}
            autoCapitalize="none"
            clearButtonMode="while-editing"
            {...Platform.select({ web: { outlineStyle: 'none' } })}
          />
          {tuKhoa ? (
            <TouchableOpacity style={styles.nutXoaTim} onPress={() => onTuKhoa('')} activeOpacity={0.75}>
              <Text style={styles.chuXoaTim}>✕</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : null}

      <Text style={styles.dongTomTat} selectable>
        {tongDongGoc === 0
          ? 'Chưa có dòng dữ liệu'
          : coLoc
            ? `Lọc: ${tongDongSauLoc}/${tongDongGoc} dòng khớp`
            : `Tổng ${tongDongGoc} dòng trong bảng`}
        {hienThiPhanTrang && tongDongSauLoc > 0
          ? ` · Hiển thị ${chiSoBatDau + 1}-${chiSoKetThuc}/${tongDongSauLoc} · Trang ${trangHienTai}/${tongSoTrang}`
          : ''}
      </Text>

      {hienThiPhanTrang ? (
        <View style={styles.hangPhanTrang}>
          <Text style={styles.nhanNho}>Số dòng/trang:</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
            contentContainerStyle={styles.cuonNut}
          >
            {TUY_CHON_SO_DONG_BANG.map((opt) => {
              const active = soDongMotTrang === opt.value;
              return (
                <TouchableOpacity
                  key={String(opt.value)}
                  style={[styles.nutKichThuoc, active && styles.nutKichThuocActive]}
                  onPress={() => onSoDongMotTrang(opt.value)}
                >
                  <Text style={[styles.chuNutKichThuoc, active && styles.chuNutKichThuocActive]}>{opt.label}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          {tongSoTrang > 1 ? (
            <View style={styles.nhomPrevNext}>
              <TouchableOpacity
                style={[styles.nutTrang, trangHienTai <= 1 && styles.nutTrangTat]}
                disabled={trangHienTai <= 1}
                onPress={() => onTrangHienTai((p) => Math.max(1, p - 1))}
              >
                <Text style={styles.chuNutTrang}>←</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.nutTrang, trangHienTai >= tongSoTrang && styles.nutTrangTat]}
                disabled={trangHienTai >= tongSoTrang}
                onPress={() => onTrangHienTai((p) => Math.min(tongSoTrang, p + 1))}
              >
                <Text style={styles.chuNutTrang}>→</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  khung: {
    paddingVertical: 8,
    paddingHorizontal: 4,
    gap: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: CD.border.glass_md,
    marginBottom: 6,
  },
  hang_tim: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: CD.bg.glass_input,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: CD.border.input,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'web' ? 6 : 4,
  },
  nhanTim: { fontSize: 18 },
  oTim: {
    flex: 1,
    minWidth: 120,
    fontSize: 17,
    color: CD.text.primary,
    fontFamily: CD.font.family,
    paddingVertical: Platform.OS === 'web' ? 8 : 6,
  },
  nutXoaTim: { padding: 8 },
  chuXoaTim: { fontSize: 18, color: CD.text.muted, fontWeight: 'bold' },
  dongTomTat: {
    fontSize: 14,
    color: CD.text.secondary,
    fontFamily: CD.font.family,
    lineHeight: 20,
  },
  hangPhanTrang: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
  },
  nhanNho: { fontSize: 13, color: CD.text.muted, fontFamily: CD.font.family },
  cuonNut: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  nutKichThuoc: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: CD.border.glass_md,
    backgroundColor: CD.bg.glass_card,
  },
  nutKichThuocActive: {
    backgroundColor: CD.brand.mauChinh,
    borderColor: CD.brand.mauDam,
  },
  chuNutKichThuoc: { fontSize: 13, fontWeight: '700', color: CD.text.primary, fontFamily: CD.font.family },
  chuNutKichThuocActive: { color: CD.text.primary },
  nhomPrevNext: { flexDirection: 'row', gap: 6, marginLeft: 'auto' },
  nutTrang: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: CD.brand.mauPhu,
    borderWidth: 1,
    borderColor: CD.border.glass_md,
  },
  nutTrangTat: { opacity: 0.4 },
  chuNutTrang: { fontSize: 16, fontWeight: 'bold', color: CD.text.primary, fontFamily: CD.font.family },
});
