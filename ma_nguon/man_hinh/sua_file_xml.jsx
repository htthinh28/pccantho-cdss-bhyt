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

import { useEffect, useState } from 'react';
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

import { layDanhSachCot } from '../quy_tac/quyluat_cautrucdulieu/quyluat_cau_truc_du_lieu';
import { kiemTraToanDienHoSo } from '../dich_vu/bo_kiem_tra_xml';
import { layHoSoTheoMaLK, luuHoSoVaoKho } from '../kho_luu_tru/tien_ich_kho';
import { CD } from '../tien_ich/chu_de_giao_dien';

// Danh sách tất cả phân hệ XML
const DANH_SACH_XML = ['XML1', 'XML2', 'XML3', 'XML4', 'XML5', 'XML6'];

// Escape ký tự đặc biệt XML để tránh hỏng cấu trúc file
const escapeXML = (val) => {
    if (val === null || val === undefined) return '';
    return String(val)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
};

const SuaFileXML = ({ route, navigation }) => {
    const { maLK, loi } = route.params || {};

    const [duLieuSua, setDuLieuSua] = useState(null);
    const [dangTai, setDangTai] = useState(true);
    const [dangLuu, setDangLuu] = useState(false);
    const [danhSachLoiHienTai, setDanhSachLoiHienTai] = useState([]);
    const [hienThiLoi, setHienThiLoi] = useState(true);

    // Tự động xác định tab từ phân hệ lỗi
    const getTabFromPhanHe = () => {
        if (!loi?.phan_he) return 'XML1';
        const match = loi.phan_he.toUpperCase().match(/XML\d/);
        return match ? match[0] : 'XML1';
    };
    const [tabHienTai, setTabHienTai] = useState(getTabFromPhanHe());

    // Tải dữ liệu gốc từ kho lưu trữ
    useEffect(() => {
        const taiDuLieu = async () => {
            if (maLK) {
                const hoSo = await layHoSoTheoMaLK(maLK, "Biên tập viên XML");
                if (hoSo && hoSo.du_lieu_goc) {
                    setDuLieuSua(hoSo.du_lieu_goc);
                    // Hiển thị danh sách lỗi ban đầu
                    const loiBanDau = kiemTraToanDienHoSo(hoSo.du_lieu_goc);
                    setDanhSachLoiHienTai(loiBanDau);
                }
            }
            setDangTai(false);
        };
        taiDuLieu();
    }, [maLK]);

    const COT_HIEN_THI = layDanhSachCot(tabHienTai);

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
        if (Platform.OS === 'web') {
            if (!confirm(`Xác nhận xóa dòng số ${index + 1}?`)) return;
        }
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
        if (ketQua.length === 0) {
            Alert.alert("✅ Hồ sơ hợp lệ", "Không tìm thấy lỗi nào sau khi kiểm tra lại. Bạn có thể xuất bản XML.");
        } else {
            Alert.alert("⚠️ Còn lỗi", `Phát hiện ${ketQua.length} lỗi. Vui lòng kiểm tra danh sách lỗi bên dưới.`);
        }
    };

    // ==========================================================================
    // LƯU VÀO KHO (CẬP NHẬT HỒ SƠ ĐÃ SỬA)
    // ==========================================================================
    const handleLuuVaoKho = async () => {
        if (!duLieuSua) return;
        setDangLuu(true);
        try {
            const ketQua = await luuHoSoVaoKho([duLieuSua], "Biên tập viên XML");
            if (ketQua.thanh_cong) {
                Alert.alert("✅ Đã lưu", `Đã cập nhật hồ sơ ${maLK} vào kho lưu trữ.`);
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

        // Kiểm tra nhanh trước khi xuất
        const loiTruocXuat = kiemTraToanDienHoSo(duLieuSua);
        const loiCritical = loiTruocXuat.filter(l => l.muc_do === 'Critical');
        if (loiCritical.length > 0) {
            Alert.alert(
                "⚠️ Cảnh báo lỗi nghiêm trọng",
                `Còn ${loiCritical.length} lỗi Critical chưa sửa.\n\n${loiCritical.slice(0, 3).map(l => l.noi_dung).join('\n')}\n\nTiếp tục xuất?`,
                [
                    { text: "Hủy", style: "cancel" },
                    { text: "Vẫn xuất", onPress: () => thucHienXuatXML() }
                ]
            );
        } else {
            thucHienXuatXML();
        }
    };

    const thucHienXuatXML = () => {
        try {
            // Tên thẻ XML map theo QĐ 130
            const tagMap = {
                xml1: { tag: 'TONG_HOP', single: true },
                xml2: { tag: 'THUOC', listTag: 'DSACH_THUOC' },
                xml3: { tag: 'DVKT', listTag: 'DSACH_DVKT' },
                xml4: { tag: 'CLS', listTag: 'DSACH_CLS' },
                xml5: { tag: 'VTYT', listTag: 'DSACH_VTYT' },
                xml6: { tag: 'LAMSANG', listTag: 'DSACH_LAMSANG' },
            };

            let xmlLines = ['<?xml version="1.0" encoding="UTF-8"?>', '<HOSO>'];

            for (const [key, value] of Object.entries(duLieuSua)) {
                const keyLower = key.toLowerCase();
                if (!keyLower.startsWith('xml')) continue;
                if (!value) continue;

                const cfg = tagMap[keyLower];
                if (!cfg) continue;

                if (cfg.single) {
                    // Bảng đơn XML1
                    xmlLines.push(`  <${cfg.tag}>`);
                    for (const [field, val] of Object.entries(value)) {
                        if (field === 'id' || field.startsWith('_')) continue;
                        xmlLines.push(`    <${field}>${escapeXML(val)}</${field}>`);
                    }
                    xmlLines.push(`  </${cfg.tag}>`);
                } else {
                    // Bảng danh sách
                    const items = Array.isArray(value) ? value : [value];
                    if (items.length === 0) continue;
                    xmlLines.push(`  <${cfg.listTag}>`);
                    items.forEach(item => {
                        xmlLines.push(`    <${cfg.tag}>`);
                        for (const [field, val] of Object.entries(item)) {
                            if (field === 'id' || field.startsWith('_')) continue;
                            xmlLines.push(`      <${field}>${escapeXML(val)}</${field}>`);
                        }
                        xmlLines.push(`    </${cfg.tag}>`);
                    });
                    xmlLines.push(`  </${cfg.listTag}>`);
                }
            }

            xmlLines.push('</HOSO>');
            const xmlContent = xmlLines.join('\n');
            const tenFile = `HOSO_QD130_${duLieuSua.xml1?.MA_LK || maLK || 'EDITED'}.xml`;

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
                Alert.alert("✅ Thành công", `Đã xuất file: ${tenFile}`);
            } else {
                // Mobile: Hiển thị nội dung XML để người dùng sao chép
                Alert.alert(
                    "📋 XML đã sẵn sàng",
                    `Tên file: ${tenFile}\n\nChức năng lưu file trực tiếp chỉ hỗ trợ Web.\nTrên thiết bị di động, vui lòng dùng chức năng "LƯU VÀO KHO" để cập nhật dữ liệu.`
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
            <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: CD.bg.gradient_mobile, ...Platform.select({ web: { background: CD.web.gradient_bg } }) }}>
                <ActivityIndicator size="large" color={CD.brand.mauChinh2} />
                <Text style={{ marginTop: 15, fontSize: 22, color: CD.brand.mauNhat, fontWeight: 'bold' }}>Đang tải dữ liệu gốc...</Text>
            </SafeAreaView>
        );
    }

    if (!duLieuSua) {
        return (
            <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: CD.bg.gradient_mobile, ...Platform.select({ web: { background: CD.web.gradient_bg } }) }}>
                <Text style={{ fontSize: 22, color: '#FF6B6B', textAlign: 'center', fontWeight: 'bold', marginBottom: 20 }}>
                    ⚠️ Không tải được dữ liệu gốc cho mã LK: {maLK}
                </Text>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ paddingVertical: 16, paddingHorizontal: 24, backgroundColor: CD.brand.mauChinh, borderRadius: 14, alignItems: 'center', ...Platform.select({ web: { background: CD.web.gradient_primary, boxShadow: CD.web.shadow_btn, cursor: CD.web.cursor_pointer } }) }}>
                    <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 20 }}>⬅ QUAY LẠI</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const renderThongTinLoi = () => {
        if (!loi && danhSachLoiHienTai.length === 0) return null;
        if (!hienThiLoi) return null;

        const loiHienThi = danhSachLoiHienTai.length > 0 ? danhSachLoiHienTai : (loi ? [loi] : []);
        const soLoi = danhSachLoiHienTai.length;
        const soLoiCritical = danhSachLoiHienTai.filter(l => l.muc_do === 'Critical').length;

        return (
            <View style={styles.khung_loi}>
                <View style={styles.loi_header}>
                    <Text style={styles.loi_tieu_de}>
                        {soLoi === 0 ? '✅ Không còn lỗi' : `⚠️ ${soLoi} LỖI CẦN SỬA (${soLoiCritical} Critical)`}
                    </Text>
                    <TouchableOpacity onPress={() => setHienThiLoi(false)}>
                        <Text style={styles.txt_an_loi}>Ẩn ▲</Text>
                    </TouchableOpacity>
                </View>
                {loiHienThi.slice(0, 5).map((l, i) => (
                    <View key={i} style={[styles.dong_loi, { borderLeftColor: l.muc_do === 'Critical' ? '#FF6B6B' : l.muc_do === 'Error' ? '#FFB74D' : '#FFF176' }]}>
                        <Text style={styles.txt_loi_muc_do}>[{l.muc_do || 'Info'}] {l.phan_loai || l.phan_he || ''}</Text>
                        <Text style={styles.txt_loi_nd}>{l.noi_dung || l.mo_ta || JSON.stringify(l)}</Text>
                    </View>
                ))}
                {loiHienThi.length > 5 && (
                    <Text style={styles.txt_them_loi}>...và {loiHienThi.length - 5} lỗi khác</Text>
                )}
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
                                        danhSachLoiHienTai.some(l => l.noi_dung?.includes(col)) && styles.input_loi
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
                                                    danhSachLoiHienTai.some(l => l.noi_dung?.includes(`Dòng ${rIdx + 1}`) && l.noi_dung?.includes(col)) && styles.input_loi
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
                </View>
                <View style={{ gap: 8, alignItems: 'flex-end' }}>
                    <TouchableOpacity onPress={handleXuatBanXML} style={styles.btn_publish}>
                        <Text style={styles.txt_btn}>🚀 XUẤT XML</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.body}>
                {/* THANH CÔNG CỤ CHỨC NĂNG */}
                <View style={styles.thanh_cong_cu}>
                    <TouchableOpacity onPress={handleKiemTraLai} style={styles.btn_validate}>
                        <Text style={styles.txt_btn_tool}>🔍 KIỂM TRA LẠI</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleLuuVaoKho} style={[styles.btn_save, dangLuu && { opacity: 0.6 }]} disabled={dangLuu}>
                        <Text style={styles.txt_btn_tool}>{dangLuu ? '⏳ ĐANG LƯU...' : '💾 LƯU VÀO KHO'}</Text>
                    </TouchableOpacity>
                    {soLoiCon > 0 && !hienThiLoi && (
                        <TouchableOpacity onPress={() => setHienThiLoi(true)} style={styles.btn_show_err}>
                            <Text style={styles.txt_btn_tool}>⚠️ {soLoiCon} LỖI ▼</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* BẢNG LỖI ĐANG CẦN SỬA */}
                {renderThongTinLoi()}

                {/* THANH CHỌN PHÂN HỆ */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tab_bar_scroll}>
                    <View style={styles.tab_bar}>
                        {DANH_SACH_XML.map(tab => (
                            <TouchableOpacity
                                key={tab}
                                onPress={() => setTabHienTai(tab)}
                                style={[
                                    styles.tab_item,
                                    tabHienTai === tab && styles.tab_active,
                                    danhSachLoiHienTai.some(l => l.phan_loai === tab || (l.phan_loai || '').startsWith(tab)) && styles.tab_co_loi
                                ]}
                            >
                                <Text style={[styles.txt_tab, tabHienTai === tab && styles.txt_tab_active]}>{tab}</Text>
                                {danhSachLoiHienTai.some(l => (l.phan_loai || '').startsWith(tab)) && (
                                    <Text style={styles.badge_loi}>!</Text>
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>

                {/* KHU VỰC CHỈNH SỬA */}
                <ScrollView style={styles.editor_area}>
                    {renderEditor()}
                    <View style={{ height: 120 }} />
                </ScrollView>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: CD.bg.gradient_mobile,
        ...Platform.select({ web: { background: CD.web.gradient_bg } }),
    },
    header: {
        ...Platform.select({ web: { background: CD.web.gradient_header, backdropFilter: CD.web.blur_header, boxShadow: CD.web.shadow_header } }),
        backgroundColor: CD.brand.mauDam,
        borderBottomWidth: 1, borderBottomColor: CD.border.header,
        paddingHorizontal: 24, paddingVertical: 16, paddingTop: 42,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    },
    title_main: { color: CD.text.primary, fontSize: 24, fontWeight: 'bold', fontFamily: CD.font.family },
    txt_btn: { color: CD.text.primary, fontWeight: 'bold', fontSize: 18, fontFamily: CD.font.family },
    btn_back: {
        padding: 10,
        backgroundColor: CD.bg.glass_input, borderRadius: 10,
        borderWidth: 1, borderColor: CD.border.glass_md,
    },
    btn_publish: {
        backgroundColor: CD.brand.mauChinh, padding: 10, borderRadius: 10,
        borderWidth: 1, borderColor: CD.border.glass_md,
        ...Platform.select({ web: { background: CD.web.gradient_primary, boxShadow: CD.web.shadow_btn, cursor: CD.web.cursor_pointer } }),
    },

    body: { flex: 1, padding: 12 },

    // Thanh công cụ
    thanh_cong_cu: { flexDirection: 'row', gap: 10, marginBottom: 10, flexWrap: 'wrap' },
    btn_validate: {
        backgroundColor: CD.bg.glass_input, borderWidth: 1, borderColor: CD.border.glass_md,
        borderRadius: 14, paddingVertical: 10, paddingHorizontal: 16,
        ...Platform.select({ web: { cursor: CD.web.cursor_pointer } }),
    },
    btn_save: {
        backgroundColor: CD.brand.mauChinh, borderRadius: 14, paddingVertical: 10, paddingHorizontal: 16,
        ...Platform.select({ web: { background: CD.web.gradient_primary, boxShadow: CD.web.shadow_btn, cursor: CD.web.cursor_pointer } }),
    },
    btn_show_err: {
        backgroundColor: 'rgba(255,152,0,0.15)', borderWidth: 1, borderColor: 'rgba(255,152,0,0.4)',
        borderRadius: 14, paddingVertical: 10, paddingHorizontal: 16,
    },
    txt_btn_tool: { color: CD.text.primary, fontWeight: 'bold', fontSize: 18, fontFamily: CD.font.family },

    // Khung lỗi
    khung_loi: {
        backgroundColor: CD.bg.glass_card, borderRadius: 16, padding: 14, marginBottom: 12,
        borderWidth: 1, borderColor: CD.border.glass,
        ...Platform.select({ web: { backdropFilter: CD.web.blur_card, WebkitBackdropFilter: CD.web.blur_card, boxShadow: CD.web.shadow_card } }),
    },
    loi_header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    loi_tieu_de: { fontSize: 20, fontWeight: 'bold', color: '#FFF176', fontFamily: CD.font.family },
    txt_an_loi: { fontSize: 18, color: CD.brand.mauNhat, fontWeight: 'bold' },
    dong_loi: { borderLeftWidth: 4, paddingLeft: 10, marginBottom: 6, paddingVertical: 4 },
    txt_loi_muc_do: { fontSize: 16, fontWeight: 'bold', color: CD.text.secondary, fontFamily: CD.font.family },
    txt_loi_nd: { fontSize: 18, color: CD.text.table_cell, fontFamily: CD.font.family },
    txt_them_loi: { fontSize: 16, color: CD.text.muted, fontStyle: 'italic', marginTop: 4 },

    // Tabs
    tab_bar_scroll: { maxHeight: 58, marginBottom: 12 },
    tab_bar: { flexDirection: 'row', gap: 8 },
    tab_item: {
        paddingVertical: 10, paddingHorizontal: 22,
        backgroundColor: CD.bg.glass_card, borderRadius: 10,
        borderWidth: 1, borderColor: CD.border.glass,
        flexDirection: 'row', alignItems: 'center', gap: 5,
    },
    tab_active: {
        backgroundColor: CD.brand.mauChinh, borderRadius: 10,
        ...Platform.select({ web: { background: CD.web.gradient_primary, boxShadow: CD.web.shadow_btn } }),
    },
    tab_co_loi: { borderColor: 'rgba(255,152,0,0.6)', borderWidth: 2 },
    txt_tab: { fontSize: 20, fontWeight: 'bold', color: CD.text.secondary, fontFamily: CD.font.family },
    txt_tab_active: { color: CD.text.primary },
    badge_loi: { fontSize: 14, color: '#FFB74D', fontWeight: 'bold' },

    // Editor
    editor_area: { flex: 1 },
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
