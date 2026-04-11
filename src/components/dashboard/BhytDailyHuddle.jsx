import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  calculateALOS,
  calculateAvgOutpatientCost,
  calculateCostBreakdown,
  calculateReadmissionRate30Days,
  checkPolypharmacy,
  dinhDangPhanTramVN,
  dinhDangTienVN,
  toNumber,
} from '../../utils/KpiBhytCalculator';
import { DASHBOARD_THEME, KpiCard } from './KpiCard';

const TY_LE_TAI_NHAP_CANH_BAO = 15;
const SO_THUOC_CANH_BAO = 7;

/**
 * Dashboard Daily Huddle BHYT — real-time theo mảng XML đã parse (QĐ 130).
 * xml3Data: dự phòng mở rộng (cơ cấu DVKT chi tiết); KPI hiện tại dùng XML1 + XML2.
 *
 * @param {object} props
 * @param {object[]} [props.xml1Data] — XML1 trong kỳ lọc (KPI chi phí, ALOS, cơ cấu…)
 * @param {object[]} [props.xml2Data]
 * @param {object[]} [props.xml3Data]
 * @param {object[]} [props.xml1DataDayDuChoTaiNhap] — toàn bộ XML1 kho (chuỗi MA_BN cho tái nhập 30 ngày); mặc định = xml1Data
 * @param {boolean} [props.embedded] — true khi nằm trong ScrollView cha (tránh ScrollView lồng nhau)
 */
const fmtSoNguyen = (n) =>
  new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(toNumber(n));

export function BhytDailyHuddle({
  xml1Data = [],
  xml2Data = [],
  xml3Data = [],
  xml1DataDayDuChoTaiNhap = null,
  embedded = false,
}) {
  const { kpi, bars, canhBaoTaiNhap } = useMemo(() => {
    const x1 = Array.isArray(xml1Data) ? xml1Data : [];
    const x1TaiNhap =
      Array.isArray(xml1DataDayDuChoTaiNhap) && xml1DataDayDuChoTaiNhap.length > 0
        ? xml1DataDayDuChoTaiNhap
        : x1;
    const x2 = Array.isArray(xml2Data) ? xml2Data : [];

    const chiPhiBQNgoaiTru = calculateAvgOutpatientCost(x1);
    const alos = calculateALOS(x1);
    const readmit = calculateReadmissionRate30Days(x1TaiNhap);
    const coCau = calculateCostBreakdown(x1);
    const poly = checkPolypharmacy(x2);

    const kpiInner = {
      chiPhiBQNgoaiTru,
      alos,
      readmit,
      coCau,
      poly,
      soLuotXml3DuPhong: Array.isArray(xml3Data) ? xml3Data.length : 0,
    };

    const canhBao = readmit.tyLeTaiNhapPhanTram >= TY_LE_TAI_NHAP_CANH_BAO;

    const barsInner = [
      {
        key: 'thuoc',
        label: 'Thuốc (T_THUOC)',
        pct: coCau.phanTramThuoc,
        color: DASHBOARD_THEME.primary,
      },
      {
        key: 'cls',
        label: 'Cận lâm sàng (T_XN + T_CDHA)',
        pct: coCau.phanTramCanLamSang,
        color: '#AD1457',
      },
      {
        key: 'vtyt',
        label: 'VTYT / DVKT (T_VTYT)',
        pct: coCau.phanTramVTYT,
        color: DASHBOARD_THEME.accent,
      },
    ];

    return { kpi: kpiInner, bars: barsInner, canhBaoTaiNhap: canhBao };
  }, [xml1Data, xml1DataDayDuChoTaiNhap, xml2Data, xml3Data]);

  const { coCau, poly, readmit } = kpi;

  const noiDung = (
    <>
      <Text style={styles.heading}>Giám sát BHYT — Daily Huddle</Text>
      <Text style={styles.sub}>
        Cơ cấu chi phí trên tổng chi XML1 trong kỳ dữ liệu (
        {dinhDangTienVN(coCau.tongChiPhi)} đ)
        {kpi.soLuotXml3DuPhong > 0
          ? ` · XML3: ${fmtSoNguyen(kpi.soLuotXml3DuPhong)} dòng (tham chiếu)`
          : ''}
      </Text>

      <View style={styles.grid}>
        <View style={styles.gridItem}>
          <KpiCard
            title="Chi phí bình quân ngoại trú (01/02)"
            value={`${dinhDangTienVN(kpi.chiPhiBQNgoaiTru)} đ`}
            icon="💳"
            trend="flat"
            isAlert={false}
          />
        </View>
        <View style={styles.gridItem}>
          <KpiCard
            title="ALOS nội trú (MA_LOAI_KCB = 3)"
            value={`${dinhDangPhanTramVN(kpi.alos, 2)} ngày`}
            icon="🛏️"
            trend="flat"
            isAlert={kpi.alos > 10}
          />
        </View>
        <View style={styles.gridItem}>
          <KpiCard
            title="Tái nhập ≤30 ngày (cùng nhóm ICD-10 3 ký tự)"
            value={`${dinhDangPhanTramVN(readmit.tyLeTaiNhapPhanTram, 2)} %`}
            icon="🔁"
            trend={canhBaoTaiNhap ? 'up' : 'flat'}
            isAlert={canhBaoTaiNhap}
          />
        </View>
      </View>

      <Text style={styles.sectionTitle}>Cơ cấu chi phí</Text>
      <View style={styles.chartBox}>
        {bars.map((b) => (
          <View key={b.key} style={styles.barRow}>
            <Text style={styles.barLabel}>{b.label}</Text>
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.barFill,
                  {
                    width: `${Math.min(100, Math.max(0, b.pct))}%`,
                    backgroundColor: b.color,
                  },
                ]}
              />
            </View>
            <Text style={styles.barPct}>
              {dinhDangPhanTramVN(b.pct, 2)} %
            </Text>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Cảnh báo đa thuốc (polypharmacy)</Text>
      <View style={styles.alertBox}>
        <Text style={styles.alertLine}>
          Số thuốc khác nhau bình quân / lượt (XML2):{' '}
          <Text style={styles.alertStrong}>
            {dinhDangPhanTramVN(poly.soThuocBinhQuanMoiLuot, 2)}
          </Text>
        </Text>
        <Text style={styles.alertLine}>
          Số lượt có thuốc: {fmtSoNguyen(poly.soLuotCoThuoc)} (đếm theo MA_LK)
        </Text>
        {poly.maLkPolypharmacyTren7.length === 0 ? (
          <Text style={styles.ok}>Không có MA_LK vượt {SO_THUOC_CANH_BAO} loại thuốc.</Text>
        ) : (
          <>
            <Text style={styles.warnTitle}>
              MA_LK có trên {SO_THUOC_CANH_BAO} loại thuốc (MA_THUOC khác nhau):
            </Text>
            {poly.maLkPolypharmacyTren7.map((ma) => (
              <Text key={ma} style={styles.warnItem}>
                • {ma} ({poly.chiTietSoThuocTheoMaLk[ma]} loại)
              </Text>
            ))}
          </>
        )}
      </View>
    </>
  );

  if (embedded) {
    return (
      <View style={[styles.screen, styles.content]}>{noiDung}</View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      {noiDung}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: DASHBOARD_THEME.background,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  heading: {
    fontFamily: 'Arial',
    fontSize: 22,
    fontWeight: '700',
    color: DASHBOARD_THEME.primary,
    marginBottom: 6,
  },
  sub: {
    fontFamily: 'Arial',
    fontSize: 14,
    color: DASHBOARD_THEME.primary,
    opacity: 0.85,
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  gridItem: {
    flexGrow: 1,
    flexBasis: 240,
    minWidth: 200,
    maxWidth: '100%',
  },
  sectionTitle: {
    fontFamily: 'Arial',
    fontSize: 20,
    fontWeight: '700',
    color: DASHBOARD_THEME.primary,
    marginBottom: 10,
    marginTop: 8,
  },
  chartBox: {
    backgroundColor: DASHBOARD_THEME.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(216, 27, 96, 0.12)',
    marginBottom: 8,
    shadowColor: DASHBOARD_THEME.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 2,
  },
  barRow: {
    marginBottom: 12,
  },
  barLabel: {
    fontFamily: 'Arial',
    fontSize: 14,
    color: DASHBOARD_THEME.primary,
    marginBottom: 4,
  },
  barTrack: {
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FCE4EC',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 6,
  },
  barPct: {
    fontFamily: 'Arial',
    fontSize: 14,
    marginTop: 4,
    color: DASHBOARD_THEME.primary,
    fontWeight: '600',
  },
  alertBox: {
    backgroundColor: DASHBOARD_THEME.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(216, 27, 96, 0.12)',
  },
  alertLine: {
    fontFamily: 'Arial',
    fontSize: 14,
    color: DASHBOARD_THEME.primary,
    marginBottom: 6,
  },
  alertStrong: {
    fontWeight: '700',
    color: DASHBOARD_THEME.primary,
  },
  ok: {
    fontFamily: 'Arial',
    fontSize: 14,
    color: '#2E7D32',
    marginTop: 4,
  },
  warnTitle: {
    fontFamily: 'Arial',
    fontSize: 14,
    fontWeight: '600',
    color: DASHBOARD_THEME.primary,
    marginTop: 8,
  },
  warnItem: {
    fontFamily: 'Arial',
    fontSize: 14,
    color: '#B71C1C',
    marginLeft: 4,
    marginTop: 4,
  },
});
