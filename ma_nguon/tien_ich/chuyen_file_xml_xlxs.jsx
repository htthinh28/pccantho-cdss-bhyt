/**
 * TIỆN ÍCH: CHUYỂN ĐỔI XML QĐ130 SANG EXCEL (XLSX)
 * Chức năng: 
 * 1. Đọc file XML chứa các thẻ <FILEHOSO> chuẩn cổng GĐ BHYT.
 * 2. Giải mã Base64 (Decode UTF-8) để bảo toàn tiếng Việt.
 * 3. Bóc tách dữ liệu thành các mảng JSON tương ứng XML1, XML2, XML3, XML4, XML5...
 * 4. Xuất ra file Excel với nhiều Sheet tách biệt.
 */

import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as XLSX from 'xlsx';

const ChuyenDoiXmlSangExcel = () => {
    const [trangThai, setTrangThai] = useState('');
    const [dangXuLy, setDangXuLy] = useState(false);

    // =======================================================
    // 1. HÀM GIẢI MÃ BASE64 HỖ TRỢ TIẾNG VIỆT (UTF-8)
    // =======================================================
    const decodeBase64UTF8 = (base64Str) => {
        try {
            const binaryString = window.atob(base64Str);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            const decoder = new TextDecoder('utf-8');
            return decoder.decode(bytes);
        } catch (e) {
            console.warn("Lỗi giải mã Base64, thử phương pháp dự phòng...", e);
            try {
                return decodeURIComponent(escape(window.atob(base64Str)));
            } catch (err) {
                return window.atob(base64Str);
            }
        }
    };

    // =======================================================
    // 2. HÀM BÓC TÁCH XML THÀNH JSON OBJECT (ĐÃ FIX LỖI)
    // =======================================================
    const parseXMLToJSON = (xmlString) => {
        // Hỗ trợ tự động xuất từ XML1 đến XML15 theo chuẩn QĐ 130 mở rộng
        const result = {}; 
        
        const regexHoSo = /<LOAIHOSO>(.*?)<\/LOAIHOSO>[\s\S]*?<NOIDUNGFILE>(.*?)<\/NOIDUNGFILE>/gi;
        let matchHoSo;
        let coDuLieuBaoLanh = false;

        while ((matchHoSo = regexHoSo.exec(xmlString)) !== null) {
            coDuLieuBaoLanh = true;
            const loaiXML = matchHoSo[1].trim().toUpperCase(); 
            const base64Data = matchHoSo[2].trim();
            const innerXML = decodeBase64UTF8(base64Data);
            
            // Xóa thẻ CDATA (lấy nội dung bên trong) để dễ parse
            const cleanXML = innerXML.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1');

            // Cốt lõi mới: Regex quét các thẻ con (Leaf Node) không chứa thẻ lồng nhau
            // VD: Bắt <MA_LK>123</MA_LK>, bỏ qua <TONGHOP><MA_LK>123</MA_LK></TONGHOP>
            const leafRegex = /<([A-Z0-9_]+)>([^<]*)<\/\1>/g;

            if (!result[loaiXML]) result[loaiXML] = [];

            if (loaiXML === 'XML1') {
                const record = {};
                let matchField;
                // Quét toàn bộ XML1 để lấy các trường Leaf
                while ((matchField = leafRegex.exec(cleanXML)) !== null) {
                    record[matchField[1]] = matchField[2].trim();
                }
                if (Object.keys(record).length > 0) result.XML1.push(record);
                
            } else {
                // Khắc phục lỗi cũ: Bắt cả <CHI_TIET_THUOC> và <CHITIET_THUOC>
                // ([\\s\\S]*?) giúp bắt được nội dung kể cả khi có dấu ngắt dòng \n
                const blockRegex = /<(CHI_TIET[A-Z0-9_]*|CHITIET[A-Z0-9_]*)>([\s\S]*?)<\/\1>/gi;
                let matchBlock;
                while ((matchBlock = blockRegex.exec(cleanXML)) !== null) {
                    const blockContent = matchBlock[2]; // matchBlock[2] là ruột của khối CHI_TIET
                    const record = {};
                    let matchField;
                    // Bóc tách từng trường dữ liệu bên trong khối CHI_TIET đó
                    while ((matchField = leafRegex.exec(blockContent)) !== null) {
                        record[matchField[1]] = matchField[2].trim();
                    }
                    if (Object.keys(record).length > 0) {
                        result[loaiXML].push(record);
                    }
                }
            }
        }

        if (!coDuLieuBaoLanh) {
            throw new Error("Không tìm thấy định dạng <FILEHOSO> chuẩn QĐ130 trong file XML này.");
        }

        return result;
    };

    // =======================================================
    // 3. HÀM CHỌN FILE VÀ XUẤT EXCEL
    // =======================================================
    const handleFileSelectAndExport = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.xml';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;

            setDangXuLy(true);
            setTrangThai(`Đang đọc file: ${file.name}...`);

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    setTrangThai('Đang phân tích cấu trúc XML...');
                    const xmlContent = event.target.result;
                    const parsedData = parseXMLToJSON(xmlContent);

                    setTrangThai('Đang tạo các Sheet Excel...');
                    const wb = XLSX.utils.book_new();
                    let hasData = false;

                    // Duyệt linh hoạt qua tất cả các Key (XML1, XML2, XML3...) có dữ liệu để tạo Sheet
                    Object.keys(parsedData).forEach(sheetName => {
                        if (parsedData[sheetName] && parsedData[sheetName].length > 0) {
                            const ws = XLSX.utils.json_to_sheet(parsedData[sheetName]);
                            // Định dạng tên sheet chữ thường (xml1, xml2...) theo đúng file mẫu của bạn
                            XLSX.utils.book_append_sheet(wb, ws, sheetName.toLowerCase());
                            hasData = true;
                        }
                    });

                    if (!hasData) {
                        alert("File XML hợp lệ nhưng không chứa dữ liệu chi tiết.");
                        setDangXuLy(false);
                        setTrangThai('Hoàn tất. Không có dữ liệu để xuất.');
                        return;
                    }

                    // Tải file xuống
                    const exportFileName = `Data_BHYT_${file.name.replace('.xml', '')}.xlsx`;
                    XLSX.writeFile(wb, exportFileName);
                    
                    setTrangThai('✅ Xuất file Excel thành công!');
                } catch (error) {
                    console.error("Lỗi xử lý file XML:", error);
                    alert(`Có lỗi xảy ra: ${error.message}`);
                    setTrangThai('❌ Quá trình chuyển đổi thất bại.');
                } finally {
                    setDangXuLy(false);
                }
            };
            
            reader.onerror = () => {
                alert("Không thể đọc file XML. Vui lòng thử lại.");
                setDangXuLy(false);
            };

            reader.readAsText(file);
        };

        input.click();
    };

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.title}>🔄 CHUYỂN ĐỔI XML SANG EXCEL</Text>
                <Text style={styles.subtitle}>Công cụ bóc tách file XML chuẩn cổng GĐ BHYT (QĐ 130) thành file Excel nhiều Sheet (xml1, xml2, xml3...). Bảo toàn 100% tiếng Việt.</Text>
                
                <TouchableOpacity 
                    style={[styles.btn_action, dangXuLy && styles.btn_disabled]} 
                    onPress={handleFileSelectAndExport}
                    disabled={dangXuLy}
                >
                    <Text style={styles.btn_text}>
                        {dangXuLy ? 'ĐANG XỬ LÝ...' : '📁 CHỌN FILE XML & TẢI EXCEL'}
                    </Text>
                </TouchableOpacity>

                {dangXuLy && <ActivityIndicator size="large" color="#D81B60" style={{ marginTop: 20 }} />}
                
                {trangThai !== '' && (
                    <Text style={[styles.status_text, trangThai.includes('✅') ? styles.status_success : styles.status_error]}>
                        {trangThai}
                    </Text>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    card: {
        backgroundColor: '#FFF',
        padding: 30,
        borderRadius: 15,
        width: '100%',
        maxWidth: 600,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFD1E3',
        borderStyle: 'dashed',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#D81B60',
        marginBottom: 10,
        fontFamily: 'Arial',
    },
    subtitle: {
        fontSize: 15,
        color: '#666',
        textAlign: 'center',
        marginBottom: 25,
        lineHeight: 22,
        fontFamily: 'Arial',
    },
    btn_action: {
        backgroundColor: '#2E7D32',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 8,
        elevation: 2,
        width: '100%',
        alignItems: 'center'
    },
    btn_disabled: {
        backgroundColor: '#9E9E9E'
    },
    btn_text: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 16,
        fontFamily: 'Arial',
    },
    status_text: {
        marginTop: 20,
        fontSize: 15,
        color: '#555',
        fontStyle: 'italic',
        fontFamily: 'Arial',
    },
    status_success: {
        color: '#2E7D32',
        fontWeight: 'bold',
        fontStyle: 'normal'
    },
    status_error: {
        color: '#D32F2F',
        fontWeight: 'bold',
        fontStyle: 'normal'
    }
});

export default ChuyenDoiXmlSangExcel;