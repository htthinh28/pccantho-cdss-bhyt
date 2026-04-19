/**
 * Bảng dữ liệu báo cáo — cuộn ngang; thiết kế thẻ hiện đại (glass / accent).
 */
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

const fmtCell = (v) => {
  if (v === null || v === undefined) return '';
  if (typeof v === 'boolean') return v ? 'có' : 'không';
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
};

export default function BangMoHinhMuc5({
  title,
  subtitle,
  columns,
  rows,
  maxRows = 40,
  /** Tiền tố ổn định cho key dòng (tránh trùng ma_lk giữa các bảng) */
  stableKeyPrefix,
}) {
  const slice = Array.isArray(rows) ? rows.slice(0, maxRows) : [];
  const conLai = Array.isArray(rows) && rows.length > maxRows ? rows.length - maxRows : 0;
  const keyPre = String(stableKeyPrefix || title || 'row').slice(0, 40);

  return (
    <View style={styles.wrap}>
      <View style={styles.accentBar} />
      <View style={styles.inner}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.sub}>{subtitle}</Text> : null}
        <ScrollView horizontal showsHorizontalScrollIndicator nestedScrollEnabled>
          <View style={styles.tableShell}>
            <View style={styles.rowHead}>
              {columns.map((col) => (
                <View key={col.key} style={[styles.cellHead, { minWidth: col.width || 88 }]}>
                  <Text style={styles.cellHeadTxt} numberOfLines={3}>
                    {col.label}
                  </Text>
                </View>
              ))}
            </View>
            {slice.map((row, ri) => (
              <View
                key={String(
                  row.id_dong || row.id_canh_bao || row.ma_lk || `${keyPre}-${ri}`,
                )}
                style={[styles.row, ri % 2 === 1 && styles.rowAlt]}
              >
                {columns.map((col) => (
                  <View key={`${ri}-${col.key}`} style={[styles.cell, { minWidth: col.width || 88 }]}>
                    <Text style={styles.cellTxt} numberOfLines={4}>
                      {fmtCell(row[col.key])}
                    </Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        </ScrollView>
        {conLai > 0 ? (
          <Text style={styles.note}>
            Hiển thị {maxRows}/{rows.length} dòng — dùng Xuất Excel để lấy đủ dữ liệu.
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 18,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.35)',
    ...Platform.select({
      web: {
        boxShadow: '0 8px 30px rgba(15,23,42,0.08)',
      },
      default: {
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 14,
        elevation: 3,
      },
    }),
  },
  accentBar: {
    height: 4,
    width: '100%',
    backgroundColor: '#2563eb',
  },
  inner: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 12,
  },
  title: {
    fontFamily: 'Arial',
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: 0.2,
    marginBottom: 4,
  },
  sub: {
    fontFamily: 'Arial',
    fontSize: 12,
    color: '#64748b',
    marginBottom: 12,
    lineHeight: 18,
  },
  tableShell: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  rowHead: {
    flexDirection: 'row',
    backgroundColor: '#1e3a8a',
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e2e8f0',
    backgroundColor: '#ffffff',
  },
  rowAlt: {
    backgroundColor: '#f8fafc',
  },
  cellHead: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    justifyContent: 'center',
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: 'rgba(255,255,255,0.15)',
  },
  cellHeadTxt: {
    fontFamily: 'Arial',
    fontSize: 11,
    fontWeight: '700',
    color: '#f1f5f9',
  },
  cell: {
    paddingVertical: 9,
    paddingHorizontal: 10,
    justifyContent: 'center',
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: '#f1f5f9',
  },
  cellTxt: {
    fontFamily: 'Arial',
    fontSize: 11,
    color: '#334155',
    lineHeight: 15,
  },
  note: {
    fontFamily: 'Arial',
    fontSize: 11,
    color: '#64748b',
    marginTop: 10,
    fontStyle: 'italic',
  },
});
