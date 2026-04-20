/**
 * MODULE: TRÌNH BIÊN TẬP & XUẤT BẢN XML (XML VISUAL EDITOR & EXPORTER)
 * Phiên bản: 2.0 - Nâng cấp toàn diện
 * Chức năng:
 * 1. Visual Editor: Sửa trực tiếp XML1 (66 trường) và các bảng XML2-XML6 dạng grid.
 * 2. Quản lý dòng: Thêm / Xóa dòng cho các bảng dạng danh sách.
 * 3. Lưu kho: Cập nhật hồ sơ đã sửa ngược lại vào kho lưu trữ (JCI Audit Trail).
 * 4. Re-Validate: Kiểm tra lại toàn bộ lỗi sau khi sửa trước khi xuất.
 * 5. XML Exporter: Đóng gói JSON thành XML chuẩn QĐ 130, escape ký tự đặc biệt.
 * Giao diện: Pink Theme Phương Châu, Arial > 20px.
 */

import { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { kiemTraToanDienHoSo } from '../dich_vu/bo_kiem_tra_xml';
import { layDanhSachCot } from '../quy_tac/quyluat_cautrucdulieu/quyluat_cau_truc_du_lieu';
import { CD } from '../tien_ich/chu_de_giao_dien';
import { layNhieuHoSoTuKho, luuHoSoVaoKho } from '../tien_ich/kho_du_lieu';
import { DANH_MUC_QUY_TAC_NOI_BO, khopMaLuatTheoMau } from '../tien_ich/quy_tac_on_off_noi_bo';
import { xuatHoSoThanhXML130 } from '../tien_ich/xml_helper';

// Danh sách tất cả phân hệ XML
const DANH_SACH_XML = ['XML1', 'XML2', 'XML3', 'XML4', 'XML5', 'XML6'];
const MAP_TAB_QUAN_TRI_THEO_XML = {
    XML1: 'LUAT_HANH_CHINH',
    XML2: 'LUAT_THUOC',
    XML3: 'LUAT_CDHA',
    XML4: 'LUAT_CDHA',
    XML5: 'LUAT_PTTT',
    XML6: 'LUAT_HOP_DONG',
};

const cloneJson = (value) => JSON.parse(JSON.stringify(value ?? null));
const chuanHoaToken = (value) => String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .trim();

const layBangXmlTuGiaTri = (value = '') => {
    const match = String(value || '').toUpperCase().match(/XML\d+/);
    return match ? match[0] : 'XML1';
};

/** Gắn từng mục cảnh báo về đúng XML1…XML6 để lọc theo tab đang chọn */
const suyRaMaBangXmlTuLoiGiamDinh = (item) => {
    if (!item) return 'XML1';
    const raw = String(item.phan_he || item.phan_loai || '').toUpperCase();
    const m = raw.match(/XML[1-6]/);
    return m ? m[0] : 'XML1';
};

const demLoiTheoBang = (danhSach, maBang) =>
    danhSach.filter((l) => suyRaMaBangXmlTuLoiGiamDinh(l) === maBang).length;

/** Hiển thị ngắn — tránh dump JSON.stringify toàn object */
const taoDongMoTaLoiNganGon = (l) => {
    const c = String(l?.canh_bao || l?.noi_dung || l?.noi_dung_loi || l?.mo_ta || '').trim();
    if (c) return c;
    const ma = String(l?.ma_luat || '').trim();
    const vt = String(l?.truong_loi || '').trim();
    const he = String(l?.phan_he || l?.phan_loai || '').trim();
    const idx = Number.isFinite(Number(l?.index)) ? ` · dòng ${Number(l.index) + 1}` : '';
    const parts = [ma, he, vt].filter(Boolean);
    if (parts.length) return parts.join(' · ') + idx;
    return 'Cảnh báo — đối chiếu cột / dòng trên lưới';
};

const moTaViTriSua = (viTri = null) => {
    if (!viTri) return 'Chưa có vị trí lỗi cụ thể.';
    const bang = layBangXmlTuGiaTri(viTri?.phanHe || 'XML1');
    const dong = Number.isFinite(Number(viTri?.index)) ? `dòng ${Number(viTri.index) + 1}` : 'mức hồ sơ';
    const truong = String(viTri?.truongLoi || '').trim();
    return [bang, dong, truong].filter(Boolean).join(' • ');
};

const laMucTieuSua = (tabHienTai, viTri = null, tenTruong = '', rowIndex = null) => {
    if (!viTri) return false;
    const bang = layBangXmlTuGiaTri(viTri?.phanHe || 'XML1');
    if (bang !== tabHienTai) return false;
    const truongLoi = String(viTri?.truongLoi || '').trim().toUpperCase();
    const tenTruongChuan = String(tenTruong || '').trim().toUpperCase();
    if (truongLoi && tenTruongChuan && truongLoi !== tenTruongChuan && !tenTruongChuan.includes(truongLoi)) return false;
    if (rowIndex === null) return true;
    if (!Number.isFinite(Number(viTri?.index))) return true;
    return Number(viTri.index) === Number(rowIndex);
};

const suyRaTabQuanTriQuyTac = (loi = {}, viTri = null) => {
    const maLuat = String(loi?.ma_luat || '').trim();
    if (maLuat) {
        const match = DANH_MUC_QUY_TAC_NOI_BO.find((item) => khopMaLuatTheoMau(item.ma_luat, maLuat));
        if (match?.tab_id) return match.tab_id;
    }
    return MAP_TAB_QUAN_TRI_THEO_XML[layBangXmlTuGiaTri(loi?.phan_he || viTri?.phanHe || 'XML1')] || 'LUAT_HANH_CHINH';
};

const taoDauVanTayHoSo = (duLieuNguon = {}) => JSON.stringify(
    DANH_SACH_XML.reduce((acc, xmlKey) => {
        const key = xmlKey.toLowerCase();
        acc[key] = duLieuNguon?.[key] ?? duLieuNguon?.[xmlKey] ?? null;
        return acc;
    }, {})
);

const taoDuLieuVersionHoa = (duLieuNguon = {}, duLieuDaLuuCu = null, moCheDoBanSao = false) => {
    const duLieuClone = cloneJson(duLieuNguon);
    const dauVanTayMoi = taoDauVanTayHoSo(duLieuClone);
    const dauVanTayCu = duLieuDaLuuCu?.dau_van_tay_du_lieu || '';
    const phienBanCu = Number(duLieuDaLuuCu?.phien_ban_hien_hanh || 0);
    const coThayDoi = dauVanTayMoi !== dauVanTayCu;
    const phienBanMoi = coThayDoi ? phienBanCu + 1 : Math.max(phienBanCu, 1);
    const { xmlContent, tenFile } = xuatHoSoThanhXML130(duLieuClone, { tenFilePrefix: 'HOSO_QD130' });

    return {
        ...duLieuClone,
        che_do_ban_sao: moCheDoBanSao === true,
        phien_ban_hien_hanh: phienBanMoi,
        dau_van_tay_du_lieu: dauVanTayMoi,
        ban_sao_truoc_luu: duLieuDaLuuCu ? {
            phien_ban_hien_hanh: duLieuDaLuuCu.phien_ban_hien_hanh || 1,
            ten_file_xuat_ban_chuan: duLieuDaLuuCu.ten_file_xuat_ban_chuan || '',
        } : null,
        lich_su_phien_ban: [
            ...(Array.isArray(duLieuDaLuuCu?.lich_su_phien_ban) ? duLieuDaLuuCu.lich_su_phien_ban : []),
            ...(coThayDoi ? [{
                phien_ban: phienBanMoi,
                thoi_gian: new Date().toISOString(),
                che_do_ban_sao: moCheDoBanSao === true,
            }] : []),
        ],
        xml_xuat_ban_chuan: xmlContent,
        ten_file_xuat_ban_chuan: tenFile,
    };
};

const SuaFileXML = ({ route, navigation }) => {
    const { maLK, loi, moCheDoBanSao = false, viTriSua = null } = route.params || {};

    const [duLieuSua, setDuLieuSua] = useState(null);
    const [dangTai, setDangTai] = useState(true);
    const [dangLuu, setDangLuu] = useState(false);
    const [danhSachLoiHienTai, setDanhSachLoiHienTai] = useState([]);
    const [hienThiLoi, setHienThiLoi] = useState(true);
    const [duLieuDaLuu, setDuLieuDaLuu] = useState(null);
    const moTaViTriDangSua = moTaViTriSua(viTriSua);
    const maLuatDieuHuong = String(loi?.ma_luat || '').trim();

    // Tự động xác định tab từ phân hệ lỗi
    const getTabFromPhanHe = () => {
        if (!loi?.phan_he) return 'XML1';
        const match = loi.phan_he.toUpperCase().match(/XML\d/);
        return match ? match[0] : 'XML1';
    };
    const [tabHienTai, setTabHienTai] = useState(getTabFromPhanHe());

    // Chỉ nạp đúng dữ liệu trong kho — không áp dụng tự động gợi ý sửa từ route.params.loi (loi chỉ phục vụ tab/rule).
    useEffect(() => {
        const taiDuLieu = async () => {
            if (maLK) {
                const [hoSo] = await layNhieuHoSoTuKho([maLK]);
                const duLieuNguon = hoSo?.du_lieu_goc || hoSo || null;
                if (duLieuNguon) {
                    setDuLieuSua(duLieuNguon);
                    setDuLieuDaLuu(duLieuNguon?.phien_ban_hien_hanh ? duLieuNguon : null);
                    // Hiển thị danh sách lỗi ban đầu
                    const loiBanDau = kiemTraToanDienHoSo(duLieuNguon);
                    setDanhSachLoiHienTai(loiBanDau);
                }
            }
            setDangTai(false);
        };
        taiDuLieu();
    }, [maLK]);

    const loiTheoBangDangChon = useMemo(
        () => danhSachLoiHienTai.filter((l) => suyRaMaBangXmlTuLoiGiamDinh(l) === tabHienTai),
        [danhSachLoiHienTai, tabHienTai],
    );

    const COT_HIEN_THI = layDanhSachCot(tabHienTai);

    const handleMoRuleOnOff = () => {
        navigation.navigate('QuanLyQuyTacOnOff', {
            initialTabId: suyRaTabQuanTriQuyTac(loi, viTriSua),
            initialKeyword: maLuatDieuHuong || String(loi?.ten_quy_tac || '').trim(),
            highlightedMaLuat: maLuatDieuHuong,
            boLocLoaiQuyTac: chuanHoaToken(loi?.canh_bao).includes('XUAT TOAN') ? 'XUAT_TOAN' : 'TAT_CA',
        });
    };

    // ==========================================================================
    // XỬ LÝ CHỈNH SỬA DỮ LIỆU
    // ==========================================================================
    const handleUpdateField = (field, value, index = null) => {
        const key = tabHienTai.toLowerCase();
        setDuLieuSua(prev => {
            const newData = { ...prev };
            if (index !== null && Array.isArray(newData[key])) {
                const arr = [...newData[key]];
                arr[index] = { ...arr[index], [field]: value };
                newData[key] = arr;
            } else {
                newData[key] = { ...newData[key], [field]: value };
            }
            return newData;
        });
    };

    // Thêm dòng mới vào bảng array
    const handleThemDong = () => {
        const key = tabHienTai.toLowerCase();
        setDuLieuSua(prev => {
            const newData = { ...prev };
            const danhSachHienTai = Array.isArray(newData[key]) ? [...newData[key]] : [];
            const dongMoi = { id: `NEW_${Date.now()}`, MA_LK: prev.xml1?.MA_LK || '' };
            COT_HIEN_THI.forEach(col => {
                if (!dongMoi[col]) dongMoi[col] = '';
            });
            newData[key] = [...danhSachHienTai, dongMoi];
            return newData;
        });
    };

    // Xóa dòng khỏi bảng array
    const handleXoaDong = (index) => {
        const key = tabHienTai.toLowerCase();
        if (Platform.OS !== 'web') {
            Alert.alert('Xác nhận', `Xóa dòng số ${index + 1}?`, [
                { text: 'Hủy', style: 'cancel' },
                { text: 'Xóa', style: 'destructive', onPress: () => thucHienXoaDong(index) },
            ]);
            return;
        }
        thucHienXoaDong(index);
    };

    const thucHienXoaDong = (index) => {
        const key = tabHienTai.toLowerCase();
        setDuLieuSua(prev => {
            const newData = { ...prev };
            const arr = [...(newData[key] || [])];
            arr.splice(index, 1);
            newData[key] = arr;
            return newData;
        });
    };

    // ==========================================================================
    // RE-VALIDATE: KIỂM TRA LẠI SAU KHI SỬA
    // ==========================================================================
    const handleKiemTraLai = () => {
        if (!duLieuSua) return;
        const ketQua = kiemTraToanDienHoSo(duLieuSua);
        setDanhSachLoiHienTai(ketQua);
        setHienThiLoi(true);
        if (Platform.OS !== 'web') {
            if (ketQua.length === 0) {
                Alert.alert("✅ Hồ sơ hợp lệ", "Không tìm thấy lỗi nào sau khi kiểm tra lại.");
            } else {
                Alert.alert("⚠️ Còn lỗi", `Phát hiện ${ketQua.length} lỗi.`);
            }
        }
    };

    // ==========================================================================
    // LƯU VÀO KHO (CẬP NHẬT HỒ SƠ ĐÃ SỬA)
    // ==========================================================================
    const handleLuuVaoKho = async () => {
        if (!duLieuSua) return;
        setDangLuu(true);
        try {
            const duLieuVersionHoa = taoDuLieuVersionHoa(duLieuSua, duLieuDaLuu, moCheDoBanSao);
            if (duLieuDaLuu && duLieuVersionHoa.dau_van_tay_du_lieu === duLieuDaLuu.dau_van_tay_du_lieu) {
                if (Platform.OS !== 'web') {
                    Alert.alert("Thông báo", `Bản lưu hiện tại đã là phiên bản ${duLieuDaLuu.phien_ban_hien_hanh || 1}, chưa có thay đổi mới để lưu.`);
                }
                setDangLuu(false);
                return;
            }

            const hoSoLuu = {
                ma_lk: duLieuVersionHoa?.xml1?.MA_LK || maLK,
                ten_bn: duLieuVersionHoa?.xml1?.HO_TEN || '',
                du_lieu_goc: duLieuVersionHoa,
                ket_qua_giam_dinh: danhSachLoiHienTai,
            };

            const ketQua = await luuHoSoVaoKho([hoSoLuu]);
            if (ketQua) {
                setDuLieuDaLuu(duLieuVersionHoa);
                if (Platform.OS !== 'web') {
                    Alert.alert("✅ Đã lưu", `Đã lưu hồ sơ ${maLK} ở phiên bản ${duLieuVersionHoa.phien_ban_hien_hanh}.`);
                }
            } else {
                Alert.alert("❌ Lỗi lưu", ketQua.loi || "Không thể lưu hồ sơ.");
            }
        } catch (e) {
            Alert.alert("❌ Lỗi", "Đã xảy ra lỗi khi lưu: " + e.message);
        }
        setDangLuu(false);
    };

    // ==========================================================================
    // ĐỘNG CƠ XUẤT BẢN XML CHUẨN QĐ 130
    // ==========================================================================
    const handleXuatBanXML = () => {
        if (!duLieuSua) return;

        if (!duLieuDaLuu?.xml_xuat_ban_chuan) {
            if (Platform.OS === 'web') return;
            Alert.alert("Thông báo", "Chưa có bản lưu nào để xuất. Vui lòng lưu bản sao trước.");
            return;
        }

        if (taoDauVanTayHoSo(duLieuSua) !== duLieuDaLuu.dau_van_tay_du_lieu) {
            if (Platform.OS === 'web') return;
            Alert.alert("Thông báo", "Dữ liệu hiện tại khác bản đã lưu. Vui lòng lưu bản sao trước khi xuất XML.");
            return;
        }

        thucHienXuatXML();
    };

    const thucHienXuatXML = () => {
        try {
            const xmlContent = duLieuDaLuu?.xml_xuat_ban_chuan || '';
            const tenFile = duLieuDaLuu?.ten_file_xuat_ban_chuan || `HOSO_QD130_${duLieuDaLuu?.xml1?.MA_LK || maLK || 'EDITED'}.xml`;

            if (Platform.OS === 'web') {
                const blob = new Blob([xmlContent], { type: 'text/xml;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = tenFile;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                if (Platform.OS !== 'web') {
                    Alert.alert("✅ Thành công", `Đã xuất file phiên bản lưu: ${tenFile}`);
                }
            } else {
                // Mobile: Hiển thị nội dung XML để người dùng sao chép
                Alert.alert(
                    "📋 XML đã sẵn sàng",
                    `Tên file: ${tenFile}\n\nChức năng lưu file trực tiếp chỉ hỗ trợ Web.\nTrên thiết bị di động, vui lòng dùng chức năng "LƯU BẢN SAO" để cập nhật dữ liệu.`
                );
            }
        } catch (error) {
            Alert.alert("❌ Lỗi xuất XML", "Quá trình đóng gói XML thất bại: " + error.message);
        }
    };

    // ==========================================================================
    // RENDER
    // ==========================================================================
    if (dangTai) {
        return (
            <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: CD.bg.gradient_mobile, ...Platform.select({ web: { backgroundImage: CD.web.gradient_bg } }) }}>
                <ActivityIndicator size="large" color={CD.brand.mauChinh2} />
                <Text style={{ marginTop: 15, fontSize: 22, color: CD.brand.mauNhat, fontWeight: 'bold' }}>Đang tải dữ liệu gốc...</Text>
            </SafeAreaView>
        );
    }

    if (!duLieuSua) {
        return (
            <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: CD.bg.gradient_mobile, ...Platform.select({ web: { backgroundImage: CD.web.gradient_bg } }) }}>
                <Text style={{ fontSize: 22, color: '#FF6B6B', textAlign: 'center', fontWeight: 'bold', marginBottom: 20 }}>
                    ⚠️ Không tải được dữ liệu gốc cho mã LK: {maLK}
                </Text>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ paddingVertical: 16, paddingHorizontal: 24, backgroundColor: CD.brand.mauChinh, borderRadius: 14, alignItems: 'center', ...Platform.select({ web: { backgroundImage: CD.web.gradient_primary, boxShadow: CD.web.shadow_btn, cursor: CD.web.cursor_pointer } }) }}>
                    <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 20 }}>⬅ QUAY LẠI</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const renderThongTinLoi = () => {
        if (!loi && danhSachLoiHienTai.length === 0) return null;
        if (!hienThiLoi) return null;

        let dsHien = loiTheoBangDangChon;
        if (dsHien.length === 0 && loi && suyRaMaBangXmlTuLoiGiamDinh(loi) === tabHienTai) {
            dsHien = [loi];
        }

        const tongLoiHoSo = danhSachLoiHienTai.length;
        const soLoiTab = dsHien.length;
        const soLoiCriticalTab = dsHien.filter((l) => l.muc_do === 'Critical').length;

        const tieuDe =
            soLoiTab === 0
                ? `✅ Không có lỗi tại ${tabHienTai}`
                : `⚠️ ${soLoiTab} lỗi tại ${tabHienTai}${soLoiCriticalTab ? ` (${soLoiCriticalTab} Critical)` : ''}`;
        const goiYTabKhac =
            tongLoiHoSo > 0 && soLoiTab < tongLoiHoSo
                ? ` · Chọn tab khác: còn ${tongLoiHoSo - soLoiTab} lỗi`
                : '';

        return (
            <View style={styles.khung_loi}>
                <View style={styles.loi_header}>
                    <Text style={styles.loi_tieu_de}>
                        {tieuDe}
                        {goiYTabKhac ? (
                            <Text style={styles.loi_tieu_de_phu}>{goiYTabKhac}</Text>
                        ) : null}
                    </Text>
                    <TouchableOpacity onPress={() => setHienThiLoi(false)}>
                        <Text style={styles.txt_an_loi}>Ẩn ▲</Text>
                    </TouchableOpacity>
                </View>
                <ScrollView style={styles.loi_scroll} nestedScrollEnabled showsVerticalScrollIndicator>
                    {dsHien.map((l, i) => (
                        <View
                            key={`${tabHienTai}_${i}_${l.ma_luat || ''}_${l.truong_loi || ''}_${l.index ?? ''}`}
                            style={[styles.dong_loi, { borderLeftColor: l.muc_do === 'Critical' ? '#FF6B6B' : l.muc_do === 'Error' ? '#FFB74D' : '#FFF176' }]}
                        >
                            <Text style={styles.txt_loi_muc_do}>
                                [{l.muc_do || 'Info'}] {l.phan_he || l.phan_loai || ''}
                                {l.ma_luat ? ` · ${l.ma_luat}` : ''}
                            </Text>
                            <Text style={styles.txt_loi_nd}>{taoDongMoTaLoiNganGon(l)}</Text>
                        </View>
                    ))}
                </ScrollView>
            </View>
        );
    };

    const renderEditor = () => {
        const key = tabHienTai.toLowerCase();
        const data = duLieuSua[key];

        if (!data) {
            return (
                <View style={styles.khung_form}>
                    <Text style={styles.txt_empty}>Không có dữ liệu tại phân hệ {tabHienTai}.</Text>
                    {tabHienTai !== 'XML1' && (
                        <TouchableOpacity style={styles.btn_them_dong} onPress={handleThemDong}>
                            <Text style={styles.txt_btn_them}>➕ THÊM DÒNG ĐẦU TIÊN</Text>
                        </TouchableOpacity>
                    )}
                </View>
            );
        }

        if (tabHienTai === 'XML1') {
            // Form chỉnh sửa XML1 (66 trường)
            const cols = COT_HIEN_THI.length > 0 ? COT_HIEN_THI : Object.keys(data).filter(k => k !== 'id');
            return (
                <View style={styles.khung_form}>
                    <Text style={styles.tieu_de_nhom}>BẢN TIN TỔNG HỢP (XML1 - {cols.length} TRƯỜNG)</Text>
                    <View style={styles.luoi_nhap_lieu}>
                        {cols.map((col, i) => (
                            <View key={i} style={styles.o_nhap}>
                                <Text style={styles.nhan_o}>{col}</Text>
                                <TextInput
                                    style={[
                                        styles.input_o,
                                        loiTheoBangDangChon.some(l => String(l.canh_bao || l.noi_dung || '').includes(col)) && styles.input_loi,
                                        laMucTieuSua(tabHienTai, viTriSua, col) && styles.input_muc_tieu,
                                    ]}
                                    value={String(data[col] ?? "")}
                                    onChangeText={(val) => handleUpdateField(col, val)}
                                    placeholder={col}
                                    placeholderTextColor="rgba(255,255,255,0.3)"
                                />
                            </View>
                        ))}
                    </View>
                </View>
            );
        } else {
            // Grid chỉnh sửa XML2-XML6 (dạng danh sách)
            const items = Array.isArray(data) ? data : [data];
            const cols = COT_HIEN_THI.length > 0 ? COT_HIEN_THI : (items.length > 0 ? Object.keys(items[0]).filter(k => k !== 'id') : []);

            return (
                <View>
                    <View style={styles.grid_toolbar}>
                        <Text style={styles.txt_so_dong}>{items.length} dòng dữ liệu</Text>
                        <TouchableOpacity style={styles.btn_them_dong} onPress={handleThemDong}>
                            <Text style={styles.txt_btn_them}>➕ THÊM DÒNG</Text>
                        </TouchableOpacity>
                    </View>
                    <ScrollView horizontal style={styles.scroll_ngang}>
                        <View>
                            {/* Header */}
                            <View style={styles.header_grid}>
                                <View style={[styles.cell_h, { width: 60 }]}><Text style={styles.txt_h}>STT</Text></View>
                                {cols.map((col, i) => (
                                    <View key={i} style={[styles.cell_h, { width: 220 }]}><Text style={styles.txt_h}>{col}</Text></View>
                                ))}
                                <View style={[styles.cell_h, { width: 90 }]}><Text style={styles.txt_h}>XÓA</Text></View>
                            </View>
                            {/* Rows */}
                            {items.map((item, rIdx) => (
                                <View key={rIdx} style={[styles.row_grid, rIdx % 2 === 0 ? styles.row_chan : styles.row_le]}>
                                    <View style={[styles.cell_d, { width: 60, backgroundColor: 'rgba(194,24,91,0.2)' }]}>
                                        <Text style={styles.txt_d}>{rIdx + 1}</Text>
                                    </View>
                                    {cols.map((col, cIdx) => (
                                        <View key={cIdx} style={[styles.cell_d, { width: 220 }]}>
                                            <TextInput
                                                style={[
                                                    styles.input_grid,
                                                    loiTheoBangDangChon.some(l =>
                                                        String(l.canh_bao || l.noi_dung || '').includes(`Dòng ${rIdx + 1}`) ||
                                                        (Number(l.index) === rIdx && String(l.truong_loi || '').toUpperCase() === String(col).toUpperCase()),
                                                    ) && styles.input_loi,
                                                    laMucTieuSua(tabHienTai, viTriSua, col, rIdx) && styles.input_muc_tieu,
                                                ]}
                                                value={String(item[col] ?? "")}
                                                onChangeText={(val) => handleUpdateField(col, val, rIdx)}
                                            />
                                        </View>
                                    ))}
                                    <View style={[styles.cell_d, { width: 90, justifyContent: 'center', alignItems: 'center' }]}>
                                        <TouchableOpacity onPress={() => handleXoaDong(rIdx)} style={styles.btn_xoa_dong}>
                                            <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 18 }}>🗑</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </ScrollView>
                </View>
            );
        }
    };

    const soLoiCon = danhSachLoiHienTai.length;
    const dauVanTayHienTai = duLieuSua ? taoDauVanTayHoSo(duLieuSua) : '';
    const coBanLuu = !!duLieuDaLuu?.dau_van_tay_du_lieu;
    const coThayDoiChuaLuu = !!duLieuSua && (!coBanLuu || duLieuDaLuu.dau_van_tay_du_lieu !== dauVanTayHienTai);
    const phienBanHienTai = Number(duLieuDaLuu?.phien_ban_hien_hanh || 0);

    return (
        <SafeAreaView style={styles.container}>
            {/* THANH ĐIỀU HƯỚNG */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.btn_back}>
                    <Text style={styles.txt_btn}>⬅ QUAY LẠI</Text>
                </TouchableOpacity>
                <View style={{ alignItems: 'center' }}>
                    <Text style={styles.title_main}>BIÊN TẬP XML</Text>
                    <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 16 }}>Mã LK: {maLK}</Text>
                    <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14 }}>
                        {moCheDoBanSao ? 'Chế độ lưu bản sao' : 'Chế độ chỉnh sửa chuẩn'}{viTriSua?.phanHe ? ` • ${moTaViTriDangSua}` : ''}
                    </Text>
                </View>
                <View style={{ gap: 8, alignItems: 'flex-end' }}>
                    <TouchableOpacity onPress={handleXuatBanXML} style={[styles.btn_publish, !coBanLuu && styles.btn_disabled]} disabled={!coBanLuu}>
                        <Text style={styles.txt_btn}>🚀 XUẤT XML BẢN LƯU</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.body}>
                <View style={styles.khung_phien_ban}>
                    <View>
                        <Text style={styles.txt_phien_ban}>Phiên bản hiện hành: {phienBanHienTai > 0 ? `v${phienBanHienTai}` : 'Chưa lưu'}</Text>
                        <Text style={styles.txt_trang_thai_luu}>
                            {coBanLuu
                                ? (coThayDoiChuaLuu ? 'Có thay đổi chưa lưu vào bản sao hiện tại.' : 'Dữ liệu đang khớp với bản lưu gần nhất.')
                                : 'Chưa có bản lưu nào. Hãy lưu bản sao trước khi xuất.'}
                        </Text>
                        {!!viTriSua && <Text style={styles.txt_vi_tri_sua}>Vị trí đang xử lý: {moTaViTriDangSua}</Text>}
                    </View>
                    <View style={styles.badge_che_do_ban_sao}>
                        <Text style={styles.badge_che_do_ban_sao_txt}>{moCheDoBanSao ? 'COPY MODE' : 'EDIT MODE'}</Text>
                    </View>
                </View>

                {/* THANH CÔNG CỤ CHỨC NĂNG */}
                <View style={styles.thanh_cong_cu}>
                    <TouchableOpacity onPress={handleKiemTraLai} style={styles.btn_validate}>
                        <Text style={styles.txt_btn_tool}>🔍 KIỂM TRA LẠI</Text>
                    </TouchableOpacity>
                    {(loi || viTriSua) && (
                        <TouchableOpacity onPress={handleMoRuleOnOff} style={styles.btn_rule_link}>
                            <Text style={styles.txt_btn_tool}>🎚 MỞ RULE ON/OFF</Text>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity onPress={handleLuuVaoKho} style={[styles.btn_save, dangLuu && { opacity: 0.6 }]} disabled={dangLuu}>
                        <Text style={styles.txt_btn_tool}>{dangLuu ? '⏳ ĐANG LƯU...' : '💾 LƯU BẢN SAO'}</Text>
                    </TouchableOpacity>
                    {soLoiCon > 0 && !hienThiLoi && (
                        <TouchableOpacity onPress={() => setHienThiLoi(true)} style={styles.btn_show_err}>
                            <Text style={styles.txt_btn_tool}>⚠️ {soLoiCon} LỖI ▼</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* BẢNG LỖI ĐANG CẦN SỬA */}
                {renderThongTinLoi()}

                <View style={styles.body_layout}>
                    <View style={styles.sidebar_tab_trai}>
                        <Text style={styles.sidebar_tab_title}>BẢNG XML</Text>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            {DANH_SACH_XML.map((tab) => {
                                const nLoiBang = demLoiTheoBang(danhSachLoiHienTai, tab);
                                return (
                                <TouchableOpacity
                                    key={tab}
                                    onPress={() => setTabHienTai(tab)}
                                    style={[
                                        styles.tab_item,
                                        tabHienTai === tab && styles.tab_active,
                                        nLoiBang > 0 && styles.tab_co_loi
                                    ]}
                                >
                                    <Text style={[styles.txt_tab, tabHienTai === tab && styles.txt_tab_active]}>{tab}</Text>
                                    {nLoiBang > 0 ? (
                                        <Text style={styles.badge_so_loi}>{nLoiBang}</Text>
                                    ) : null}
                                </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>

                    {/* KHU VỰC CHỈNH SỬA */}
                    <ScrollView style={styles.editor_area}>
                        {renderEditor()}
                        <View style={{ height: 120 }} />
                    </ScrollView>
                </View>
            </View>
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
        ...Platform.select({ web: { backgroundImage: CD.web.gradient_header, backdropFilter: CD.web.blur_header, boxShadow: CD.web.shadow_header } }),
        backgroundColor: CD.brand.mauDam,
        borderBottomWidth: 1, borderBottomColor: CD.border.header,
        paddingHorizontal: 24, paddingVertical: 16, paddingTop: 42,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    },
    title_main: { color: CD.text.primary, fontSize: 24, fontWeight: 'bold', fontFamily: CD.font.family },
    txt_btn: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 18, fontFamily: CD.font.family },
    btn_back: {
        padding: 10,
        backgroundColor: CD.bg.glass_input, borderRadius: 10,
        borderWidth: 1, borderColor: CD.border.glass_md,
    },
    btn_publish: {
        backgroundColor: CD.brand.mauChinh, padding: 10, borderRadius: 10,
        borderWidth: 1, borderColor: CD.border.glass_md,
        ...Platform.select({ web: { backgroundImage: CD.web.gradient_primary, boxShadow: CD.web.shadow_btn, cursor: CD.web.cursor_pointer } }),
    },
    btn_disabled: { opacity: 0.45 },

    body: { flex: 1, padding: 12 },
    body_layout: { flex: 1, flexDirection: 'row', gap: 10 },

    sidebar_tab_trai: {
        flex: 1.1,
        minWidth: 140,
        maxWidth: 210,
        backgroundColor: '#F7FAFC',
        borderWidth: 1,
        borderColor: '#D8E2EE',
        borderRadius: 16,
        padding: 10,
        ...Platform.select({ web: { boxShadow: CD.web.shadow_card } }),
    },
    sidebar_tab_title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 8,
        textAlign: 'center',
        fontFamily: CD.font.family,
    },

    khung_phien_ban: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        backgroundColor: CD.bg.glass_card, borderWidth: 1, borderColor: CD.border.glass,
        borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14, marginBottom: 12,
        ...Platform.select({ web: { backdropFilter: CD.web.blur_card, WebkitBackdropFilter: CD.web.blur_card, boxShadow: CD.web.shadow_card } }),
    },
    txt_phien_ban: { fontSize: 20, fontWeight: 'bold', color: CD.brand.mauNhat, fontFamily: CD.font.family },
    txt_trang_thai_luu: { fontSize: 16, color: CD.text.secondary, marginTop: 4, fontFamily: CD.font.family },
    txt_vi_tri_sua: { fontSize: 15, color: '#90CAF9', marginTop: 6, fontFamily: CD.font.family },
    badge_che_do_ban_sao: {
        backgroundColor: 'rgba(245,124,0,0.15)', borderWidth: 1, borderColor: 'rgba(245,124,0,0.45)',
        borderRadius: 999, paddingVertical: 8, paddingHorizontal: 14,
    },
    badge_che_do_ban_sao_txt: { fontSize: 14, color: '#FFCC80', fontWeight: 'bold', fontFamily: CD.font.family },

    // Thanh công cụ
    thanh_cong_cu: { flexDirection: 'row', gap: 10, marginBottom: 10, flexWrap: 'wrap' },
    btn_validate: {
        backgroundColor: CD.bg.glass_input, borderWidth: 1, borderColor: CD.border.glass_md,
        borderRadius: 14, paddingVertical: 10, paddingHorizontal: 16,
        ...Platform.select({ web: { cursor: CD.web.cursor_pointer } }),
    },
    btn_save: {
        backgroundColor: CD.brand.mauChinh, borderRadius: 14, paddingVertical: 10, paddingHorizontal: 16,
        ...Platform.select({ web: { backgroundImage: CD.web.gradient_primary, boxShadow: CD.web.shadow_btn, cursor: CD.web.cursor_pointer } }),
    },
    btn_show_err: {
        backgroundColor: 'rgba(255,152,0,0.15)', borderWidth: 1, borderColor: 'rgba(255,152,0,0.4)',
        borderRadius: 14, paddingVertical: 10, paddingHorizontal: 16,
    },
    btn_rule_link: {
        backgroundColor: 'rgba(124,58,237,0.18)',
        borderWidth: 1,
        borderColor: 'rgba(196,181,253,0.55)',
        borderRadius: 14,
        paddingVertical: 10,
        paddingHorizontal: 16,
        ...Platform.select({ web: { cursor: CD.web.cursor_pointer } }),
    },
    txt_btn_tool: { color: CD.text.primary, fontWeight: 'bold', fontSize: 18, fontFamily: CD.font.family },

    // Khung lỗi
    khung_loi: {
        backgroundColor: CD.bg.glass_card, borderRadius: 16, padding: 14, marginBottom: 12,
        borderWidth: 1, borderColor: CD.border.glass,
        ...Platform.select({ web: { backdropFilter: CD.web.blur_card, WebkitBackdropFilter: CD.web.blur_card, boxShadow: CD.web.shadow_card } }),
    },
    loi_header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, gap: 8 },
    loi_tieu_de: { flex: 1, fontSize: 20, fontWeight: 'bold', color: '#FFF176', fontFamily: CD.font.family },
    loi_tieu_de_phu: { fontSize: 16, fontWeight: '600', color: 'rgba(255,255,255,0.75)' },
    loi_scroll: { maxHeight: 240 },
    txt_an_loi: { fontSize: 18, color: CD.brand.mauNhat, fontWeight: 'bold' },
    dong_loi: { borderLeftWidth: 4, paddingLeft: 10, marginBottom: 6, paddingVertical: 4 },
    txt_loi_muc_do: { fontSize: 16, fontWeight: 'bold', color: CD.text.secondary, fontFamily: CD.font.family },
    txt_loi_nd: { fontSize: 18, color: CD.text.table_cell, fontFamily: CD.font.family },
    txt_them_loi: { fontSize: 16, color: CD.text.muted, fontStyle: 'italic', marginTop: 4 },

    // Tabs
    tab_bar_scroll: { maxHeight: 58, marginBottom: 12 },
    tab_bar: { flexDirection: 'row', gap: 8 },
    tab_item: {
        paddingVertical: 10, paddingHorizontal: 16,
        backgroundColor: '#F7FAFC', borderRadius: 10,
        borderWidth: 1, borderColor: '#D8E2EE',
        flexDirection: 'row', alignItems: 'center', gap: 5,
        marginBottom: 8,
    },
    tab_active: {
        backgroundColor: '#0D47A1', borderRadius: 10,
        ...Platform.select({ web: { boxShadow: CD.web.shadow_btn } }),
    },
    tab_co_loi: { borderColor: 'rgba(255,152,0,0.6)', borderWidth: 2 },
    txt_tab: { fontSize: 18, fontWeight: 'bold', color: '#111827', fontFamily: CD.font.family },
    txt_tab_active: { color: '#FFFFFF' },
    badge_so_loi: {
        minWidth: 22,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10,
        overflow: 'hidden',
        fontSize: 13,
        fontWeight: 'bold',
        color: '#B71C1C',
        backgroundColor: 'rgba(255,193,7,0.95)',
        textAlign: 'center',
    },

    // Editor
    editor_area: { flex: 5.9 },
    khung_form: {
        backgroundColor: CD.bg.glass_card, padding: 18, borderRadius: 20,
        borderWidth: 1, borderColor: CD.border.glass,
        ...Platform.select({ web: { backdropFilter: CD.web.blur_card, WebkitBackdropFilter: CD.web.blur_card, boxShadow: CD.web.shadow_card } }),
    },
    tieu_de_nhom: {
        fontSize: 22, fontWeight: 'bold', color: CD.brand.mauNhat, marginBottom: 20,
        borderLeftWidth: 4, borderColor: CD.brand.mauChinh, paddingLeft: 12,
    },
    luoi_nhap_lieu: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    o_nhap: { width: '31%', marginBottom: 12 },
    nhan_o: { fontSize: 17, color: CD.text.secondary, marginBottom: 4, fontWeight: 'bold', fontFamily: CD.font.family },
    input_o: {
        backgroundColor: CD.bg.glass_input, borderWidth: 1, borderColor: CD.border.input,
        borderRadius: 12, color: CD.text.primary, fontSize: 20, paddingVertical: 14, paddingHorizontal: 16,
        fontFamily: CD.font.family,
        ...Platform.select({ web: { backdropFilter: CD.web.blur_input, outlineStyle: 'none' } }),
    },
    input_loi: { borderColor: CD.border.input_error, borderWidth: 2 },
    input_muc_tieu: { borderColor: '#38BDF8', borderWidth: 2, backgroundColor: 'rgba(56,189,248,0.10)' },
    txt_empty: { fontSize: 20, color: CD.text.muted, textAlign: 'center', marginTop: 30, fontStyle: 'italic', marginBottom: 20 },

    // Grid
    grid_toolbar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    txt_so_dong: { fontSize: 18, color: CD.text.secondary, fontWeight: 'bold' },
    btn_them_dong: {
        backgroundColor: CD.bg.glass_input, borderWidth: 1, borderColor: CD.border.glass_md,
        borderRadius: 14, paddingVertical: 10, paddingHorizontal: 18,
        ...Platform.select({ web: { cursor: CD.web.cursor_pointer } }),
    },
    txt_btn_them: { color: CD.text.primary, fontWeight: 'bold', fontSize: 18 },
    scroll_ngang: {
        backgroundColor: CD.bg.glass_card, borderRadius: 16,
        borderWidth: 1, borderColor: CD.border.glass,
    },
    header_grid: { flexDirection: 'row', backgroundColor: CD.bg.table_header },
    cell_h: { padding: 14, borderRightWidth: 1, borderColor: CD.border.divider, justifyContent: 'center' },
    txt_h: { fontSize: 17, fontWeight: 'bold', color: CD.text.table_header, textAlign: 'center', fontFamily: CD.font.family },
    row_grid: { flexDirection: 'row', borderBottomWidth: 1, borderColor: CD.border.divider },
    row_chan: { backgroundColor: CD.bg.table_row_even },
    row_le: { backgroundColor: CD.bg.table_row_odd },
    cell_d: { padding: 8, borderRightWidth: 1, borderColor: CD.border.divider, justifyContent: 'center' },
    txt_d: { fontSize: 20, textAlign: 'center', fontFamily: CD.font.family, color: CD.text.table_cell },
    input_grid: {
        fontSize: 20, width: '100%', color: CD.text.primary, fontFamily: CD.font.family, padding: 4,
        backgroundColor: 'transparent',
        ...Platform.select({ web: { outlineStyle: 'none' } }),
    },
    btn_xoa_dong: {
        backgroundColor: 'rgba(244,67,54,0.15)', borderWidth: 1, borderColor: 'rgba(244,67,54,0.4)',
        width: 40, height: 40, borderRadius: 8, justifyContent: 'center', alignItems: 'center',
    },
});

export default SuaFileXML;
