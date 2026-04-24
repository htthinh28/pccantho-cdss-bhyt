import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Alert, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

const thongBao = (title, msg) => {
  if (typeof Alert?.alert === 'function') Alert.alert(title, String(msg));
  else console.warn(title, msg);
};

const escapeHtml = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/**
 * HTML một dòng hướng dẫn BYT (dùng cho in web / PDF native).
 */
export const taoHtmlInHuongDanBytMotDong = (columns = [], noiDungDong = null) => {
  if (!noiDungDong) return '';
  const ma = escapeHtml(noiDungDong['Mã ICD10'] ?? '');
  const parts = (columns || [])
    .map((cot) => {
      const noiDung = String(noiDungDong[cot] ?? '').trim();
      if (!noiDung) return '';
      return `<div class="phan-muc"><h2>${escapeHtml(cot)}</h2><p>${escapeHtml(noiDung).replace(/\n/g, '<br/>')}</p></div>`;
    })
    .filter(Boolean)
    .join('');
  const css = `
    * { box-sizing: border-box; }
    body { font-family: Arial, Helvetica, sans-serif; color: #333; padding: 24px; background: #f5f5f5; }
    .trang { max-width: 900px; margin: 0 auto; background: #fff; padding: 40px 48px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
    .dau { text-align: center; margin-bottom: 32px; }
    .ten-bv { font-size: 18px; font-weight: bold; color: #555; }
    .tieu-de { font-size: 22px; font-weight: bold; color: #c2185b; margin: 12px 0; }
    .ma-icd { font-size: 18px; font-weight: bold; }
    .ke { height: 3px; background: #c2185b; margin-top: 16px; }
    .phan-muc { margin-bottom: 24px; page-break-inside: avoid; }
    .phan-muc h2 { font-size: 16px; color: #c2185b; border-bottom: 1px solid #f8bbd0; padding-bottom: 6px; margin: 0 0 10px; }
    .phan-muc p { font-size: 14px; line-height: 1.65; margin: 0; text-align: justify; }
    .chan-trang { margin-top: 40px; text-align: right; }
    .chan-trang .ky { font-weight: bold; font-size: 14px; }
    .chan-trang .ghi-chu { font-size: 13px; color: #888; font-style: italic; margin-top: 6px; }
    @media print {
      body { background: #fff; padding: 0; }
      .trang { box-shadow: none; max-width: none; padding: 20px; }
    }
  `;
  return `<!DOCTYPE html><html lang="vi"><head><meta charset="utf-8"/><title>Hướng dẫn BYT ${ma}</title><style>${css}</style></head><body>
    <div class="trang">
      <div class="dau">
        <div class="ten-bv">TẬP ĐOÀN Y TẾ PHƯƠNG CHÂU</div>
        <div class="tieu-de">HƯỚNG DẪN CHẨN ĐOÁN &amp; ĐIỀU TRỊ — BỘ Y TẾ (CDSS)</div>
        <div class="ma-icd">Mã ICD-10: ${ma}</div>
        <div class="ke"></div>
      </div>
      ${parts}
      <div class="chan-trang"><div class="ky">BAN GIÁM ĐỐC PHÊ DUYỆT</div><div class="ghi-chu">(Ký và ghi rõ họ tên)</div></div>
    </div>
  </body></html>`;
};

/** Web: cửa sổ + print. Native: PDF + chia sẻ (in qua hệ thống). */
export async function inHoacChiaSeHuongDanBytMotDong({ columns = [], noiDungDong = null } = {}) {
  const html = taoHtmlInHuongDanBytMotDong(columns, noiDungDong);
  if (!html) {
    thongBao('In hướng dẫn BYT', 'Không có dữ liệu dòng.');
    return;
  }
  try {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const w = window.open('', '_blank');
      if (w) {
        w.document.open();
        w.document.write(html);
        w.document.close();
        w.focus();
        setTimeout(() => {
          try {
            w.print();
          } catch (_) {
            /* ignore */
          }
        }, 300);
      } else {
        thongBao('In', 'Trình duyệt chặn cửa sổ popup — hãy cho phép popup.');
      }
      return;
    }
    const { uri } = await Print.printToFileAsync({ html });
    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        UTI: 'com.adobe.pdf',
        dialogTitle: `HuongDan_BYT_${String(noiDungDong['Mã ICD10'] || 'dong').replace(/\s+/g, '_')}.pdf`,
      });
    } else {
      thongBao('PDF', uri);
    }
  } catch (e) {
    thongBao('In / PDF', String(e?.message || e));
  }
}

/**
 * Bản in một dòng hướng dẫn BYT (theo danh sách cột động).
 */
const InHuongDanByt = ({ maICD = '', columns = [], noiDungDong = null }) => {
  if (!noiDungDong) {
    return (
      <ScrollView style={styles.vung_an_toan}>
        <View style={styles.trang_in}>
          <Text style={styles.chu_thuong}>Chưa có dữ liệu dòng để in.</Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.vung_an_toan}>
      <View style={styles.trang_in}>
        <View style={styles.phan_dau_trang}>
          <Text style={styles.ten_benh_vien}>TẬP ĐOÀN Y TẾ PHƯƠNG CHÂU</Text>
          <Text style={styles.tieu_de_tai_lieu}>HƯỚNG DẪN CHẨN ĐOÁN & ĐIỀU TRỊ — BỘ Y TẾ (CDSS)</Text>
          <Text style={styles.ma_icd_header}>Mã ICD-10: {noiDungDong['Mã ICD10'] || maICD}</Text>
          <View style={styles.duong_ke_ngang} />
        </View>

        {(columns || []).map((cot) => {
          const noiDung = String(noiDungDong[cot] ?? '').trim();
          if (!noiDung) return null;
          return (
            <View key={cot} style={styles.phan_muc}>
              <Text style={styles.tieu_de_muc}>{cot}</Text>
              <View style={styles.noi_dung_muc}>
                <Text style={styles.chu_thuong}>{noiDung}</Text>
              </View>
            </View>
          );
        })}

        <View style={styles.phan_cuoi_trang}>
          <Text style={styles.chu_ky_ten}>BAN GIÁM ĐỐC PHÊ DUYỆT</Text>
          <Text style={styles.chu_ky_ngay}>(Ký và ghi rõ họ tên)</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  vung_an_toan: { flex: 1, backgroundColor: '#EFEFEF', padding: 20 },
  trang_in: {
    backgroundColor: '#FFFFFF',
    padding: 50,
    marginHorizontal: 'auto',
    maxWidth: 1000,
    width: '100%',
    ...Platform.select({
      web: { boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.1)' },
      android: { elevation: 5 },
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10 },
    }),
  },
  phan_dau_trang: { alignItems: 'center', marginBottom: 40 },
  ten_benh_vien: { fontFamily: 'Arial', fontSize: 24, fontWeight: 'bold', color: '#555' },
  tieu_de_tai_lieu: { fontFamily: 'Arial', fontSize: 28, fontWeight: 'bold', color: '#D81B60', marginVertical: 15, textAlign: 'center' },
  ma_icd_header: { fontFamily: 'Arial', fontSize: 24, fontWeight: 'bold', color: '#333' },
  duong_ke_ngang: { height: 3, backgroundColor: '#D81B60', width: '100%', marginTop: 20 },
  phan_muc: { marginBottom: 28 },
  tieu_de_muc: {
    fontFamily: 'Arial',
    fontSize: 22,
    fontWeight: 'bold',
    color: '#D81B60',
    borderBottomWidth: 1.5,
    borderBottomColor: '#F8BBD0',
    paddingBottom: 8,
    marginBottom: 12,
  },
  noi_dung_muc: { paddingLeft: 10 },
  chu_thuong: { fontFamily: 'Arial', fontSize: 20, color: '#333', lineHeight: 32, marginBottom: 8, textAlign: 'justify' },
  phan_cuoi_trang: { marginTop: 48, alignItems: 'flex-end', paddingRight: 50 },
  chu_ky_ten: { fontFamily: 'Arial', fontSize: 20, fontWeight: 'bold', color: '#333' },
  chu_ky_ngay: { fontFamily: 'Arial', fontSize: 18, color: '#888', fontStyle: 'italic', marginTop: 5 },
});

export default InHuongDanByt;
