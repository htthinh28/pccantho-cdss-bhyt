/**
 * PHÂN HỆ: TRẠM GIÁM ĐỊNH & SỬA LỖI XML (PHƯƠNG CHÂU - JCI)
 * Nâng cấp 5.0: 
 * 1. Đọc hàng loạt file XML cùng lúc và duyệt bằng Tab ngang.
 * 2. Layout chia đôi màn hình: Lưới dữ liệu (trái) - Sổ tay lỗi (phải) giúp xem full nội dung.
 * 3. Tối ưu UI chuẩn Phương Châu: Đưa toàn bộ Tabs và Nút chức năng lên GÓC TRÊN PHẢI, cùng kích thước.
 * 4. Dãn dòng, dãn cột linh hoạt, tự động bao trọn Text không bị che khuất (Auto-Height).
 * 5. FIX LỖI: Sửa lỗi typo (sai chính tả) các trường MA_BENH_CHINH, MA_TINH_CU_TRU theo chuẩn QĐ 130.
 * 6. FIX LỖI TRÀN BỘ NHỚ: Tích hợp thuật toán Auto-Chunking để băm nhỏ dữ liệu khi lưu vào LocalStorage.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useRef, useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { chayBoMayGiamDinhV3 } from '../tien_ich/dong_co_giam_dinh';
import NhapFileXML from '../tien_ich/nhap_file_xml';
import { CD } from '../tien_ich/chu_de_giao_dien';

// ============================================================================
// THUẬT TOÁN CHỐNG TRÀN BỘ NHỚ LOCAL STORAGE (CHUNKING)
// ============================================================================
const luuKhoHoSoChongTranBoNho = async (key, dataArray) => {
    try {
        if (!Array.isArray(dataArray)) {
            await AsyncStorage.setItem(key, JSON.stringify(dataArray));
            return;
        }
        // Xóa các khối bộ nhớ cũ
        const oldChunksStr = await AsyncStorage.getItem(`${key}_CHUNKS`);
        if (oldChunksStr) {
            const oldChunks = parseInt(oldChunksStr, 10);
            for (let i = 0; i < oldChunks; i++) {
                await AsyncStorage.removeItem(`${key}_CHUNK_${i}`);
            }
        }
        // Băm nhỏ dữ liệu và lưu từng mảng con
        const CHUNK_SIZE = 1500;
        const totalChunks = Math.ceil(dataArray.length / CHUNK_SIZE);
        await AsyncStorage.setItem(`${key}_CHUNKS`, String(totalChunks));
        
        for (let i = 0; i < totalChunks; i++) {
            const chunk = dataArray.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
            await AsyncStorage.setItem(`${key}_CHUNK_${i}`, JSON.stringify(chunk));
        }
        console.log(`Đã lưu thành công ${dataArray.length} hồ sơ, băm thành ${totalChunks} khối.`);
    } catch (e) { 
        console.error("Lỗi Chunking Set Storage:", e); 
        alert("Lỗi tràn bộ nhớ chưa thể xử lý. Vui lòng thử nạp ít hồ sơ hơn.");
    }
};

// HÀM ĐỌC DỮ LIỆU ĐÃ BĂM TỪ LOCAL STORAGE GHÉP LẠI
const docKhoHoSoChongTranBoNho = async (key) => {
    try {
        const chunksStr = await AsyncStorage.getItem(`${key}_CHUNKS`);
        if (chunksStr) {
            const totalChunks = parseInt(chunksStr, 10);
            let fullData = [];
            for (let i = 0; i < totalChunks; i++) {
                const chunkStr = await AsyncStorage.getItem(`${key}_CHUNK_${i}`);
                if (chunkStr) fullData = fullData.concat(JSON.parse(chunkStr));
            }
            return fullData;
        }
        const raw = await AsyncStorage.getItem(key);
        return raw ? JSON.parse(raw) : null;
    } catch (e) {
        console.error("Lỗi Chunking Get Storage:", e);
        return null;
    }
};
// ============================================================================

// ĐÃ SỬA LỖI CHÍNH TẢ CHO KHỚP 100% VỚI THẺ XML QĐ 130
const CHUAN_COT_XML = {
  'XML1': [
    "MA_LK", "STT", "MA_BN", "HO_TEN", "SO_CCCD", "NGAY_SINH", "GIOI_TINH", "NHOM_MAU", 
    "MA_QUOC_TICH", "MA_DANTOC", "MA_NGHE_NGHIEP", "DIA_CHI", "MA_TINH_CU_TRU", "MA_HUYEN_CU_TRU", 
    "MA_XA_CU_TRU", "DIEN_THOAI", "MA_THE_BHYT", "MA_DKBD", "GT_THE_TU", "GT_THE_DEN", 
    "NGAY_MIEN_CCT", "LY_DO_VV", "LY_DO_VNT", "MA_LY_DO_VNT", "CHAN_DOAN_VAO", "CHAN_DOAN_RV", 
    "MA_BENH_CHINH", "MA_BENH_KT", "MA_BENH_YHCT", "MA_PTTT_QT", "MA_DOITUONG_KCB", "MA_NOI_DI", 
    "MA_NOI_DEN", "MA_TAI_NAN", "NGAY_VAO", "NGAY_VAO_NOI_TRU", "NGAY_RA", "GIAY_CHUYEN_TUYEN", 
    "SO_NGAY_DTRI", "PP_DIEU_TRI", "KET_QUA_DTRI", "MA_LOAI_RV", "GHI_CHU", "NGAY_TTOAN", 
    "T_THUOC", "T_VTYT", "T_TONGCHI_BV", "T_TONGCHI_BH", "T_BNTT", "T_BNCCT", "T_BHTT", 
    "T_NGUONKHAC", "T_BHTT_GDV", "NAM_QT", "THANG_QT", "MA_LOAI_KCB", "MA_KHOA", "MA_CSKCB", 
    "MA_KHUVUC", "CAN_NANG", "CAN_NANG_CON", "NAM_NAM_LIEN_TUC", "NGAY_TAI_KHAM", "MA_HSBA", 
    "MA_TTDV", "DU_PHONG"
  ],
  'XML2': ['MA_LK', 'STT', 'MA_THUOC', 'MA_PP_CHEBIEN', 'MA_CSKCB_THUOC', 'MA_NHOM',
  'TEN_THUOC', 'DON_VI_TINH', 'HAM_LUONG', 'DUONG_DUNG', 'DANG_BAO_CHE',
  'LIEU_DUNG', 'CACH_DUNG', 'SO_DANG_KY', 'TT_THAU', 'PHAM_VI', 'TYLE_TT_BH',
  'SO_LUONG', 'DON_GIA', 'THANH_TIEN_BV', 'THANH_TIEN_BH', 'T_NGUONKHAC_NSNN',
  'T_NGUONKHAC_VTNN', 'T_NGUONKHAC_VTTN', 'T_NGUONKHAC_CL', 'T_NGUONKHAC',
  'MUC_HUONG', 'T_BNTT', 'T_BNCCT', 'T_BHTT', 'MA_KHOA', 'MA_BAC_SI',
  'MA_DICH_VU', 'NGAY_YL', 'NGAY_TH_YL', 'MA_PTTT', 'NGUON_CTRA', 'VET_THUONG_TP',
  'DU_PHONG'],
  'XML3': ['MA_LK', 'STT', 'MA_DICH_VU', 'MA_PTTT_QT', 'MA_VAT_TU', 'MA_NHOM', 
  'GOI_VTYT', 'TEN_VAT_TU', 'TEN_DICH_VU', 'MA_XANG_DAU', 'DON_VI_TINH', 
  'PHAM_VI', 'SO_LUONG', 'DON_GIA_BV', 'DON_GIA_BH', 'TT_THAU', 
  'TYLE_TT_DV', 'TYLE_TT_BH', 'THANH_TIEN_BV', 'THANH_TIEN_BH', 
  'T_TRANTT', 'MUC_HUONG', 'T_NGUONKHAC_NSNN', 'T_NGUONKHAC_VTNN', 
  'T_NGUONKHAC_VTTN', 'T_NGUONKHAC_CL', 'T_NGUONKHAC', 'T_BNTT', 
  'T_BNCCT', 'T_BHTT', 'MA_KHOA', 'MA_GIUONG', 'MA_BAC_SI', 
  'NGUOI_THUC_HIEN', 'MA_BENH', 'MA_BENH_YHCT', 'NGAY_YL', 
  'NGAY_TH_YL', 'NGAY_KQ', 'MA_PTTT', 'VET_THUONG_TP', 'PP_VO_CAM', 
  'VI_TRI_TH_DVKT', 'MA_MAY', 'MA_HIEU_SP', 'TAI_SU_DUNG', 'DU_PHONG'],
  'XML4': ['MA_LK', 'STT', 'MA_DICH_VU', 'MA_CHI_SO', 'TEN_CHI_SO', 'GIA_TRI', 'DON_VI_DO', 'MO_TA', 'KET_LUAN', 'NGAY_KQ', 'MA_BS_DOC_KQ', 'DU_PHONG'],
  'XML5': ['MA_LK', 'STT', 'DIEN_BIEN', 'HOI_CHAN', 'PHAU_THUAT', 'NGAY_YL', 'MA_BAC_SI', 'MA_KHOA', 'DU_PHONG'],
  'XML6': ['MA_LK', 'STT', 'MA_BN', 'HO_TEN', 'SO_CCCD', 'NGAY_SINH', 'GIOI_TINH', 'DIA_CHI', 'MA_THE_BHYT', 'MA_DKBD', 'GT_THE_TU', 'GT_THE_DEN', 'MA_DOITUONG_KCB', 'NGAY_VAO', 'NGAY_RA', 'MA_BENH_CHINH', 'MA_BENH_KT', 'MA_LOAI_KCB', 'MA_KHOA', 'MA_CSKCB', 'MA_QUOC_TICH', 'MA_DANTOC', 'MA_NGHE_NGHIEP', 'THOI_DIEM_XN_HIV', 'KQ_XN_HIV', 'KQ_XNTL_VR', 'NGAY_KQ_XN_TLVR', 'MA_LOAI_BN', 'MA_CD_BD', 'NGAY_CD_BD', 'MA_PHAC_DO_BD', 'MA_BAC_SI', 'MA_TT_LAM_SANG', 'CAN_NANG', 'CHIEU_CAO', 'MA_PHU_PHAC_DO', 'NGAY_BAT_DAU_PHAC_DO', 'NGAY_KET_THUC_PHAC_DO', 'LY_DO_NGUNG_BD', 'MA_LY_DO_NGUNG_BD', 'SO_NGAY_CAP_THUOC', 'NGAY_HEN_TAI_KHAM', 'MA_LOAI_RV', 'NGAY_TTOAN', 'MA_TTDV', 'GHI_CHU', 'DU_PHONG']
};

const ManHinhDocXML = () => {
  const navigation = useNavigation();
  
  const [danhSachHoSoMo, setDanhSachHoSoMo] = useState([]); 
  const [hoSoDangXem, setHoSoDangXem] = useState(null); 
  const [ketQuaGiamDinhMap, setKetQuaGiamDinhMap] = useState({}); 
  
  const [tabHienTai, setTabHienTai] = useState('XML1');
  const [danhSachTabDong, setDanhSachTabDong] = useState([]);
  
  const mainScrollRef = useRef(null);
  const debounceTimer = useRef(null);
  const isInitialMount = useRef(true);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const savedSession = await AsyncStorage.getItem('SESSION_DOC_XML_MULTIPLE');
        if (savedSession) {
          const parsedSession = JSON.parse(savedSession);
          // Thay thế AsyncStorage.getItem bằng hàm chống tràn bộ nhớ
          const kho = await docKhoHoSoChongTranBoNho('KHO_HO_SO_BHYT');
          
          if (kho && kho.length > 0) {
            let dsKhoiPhuc = [];
            let mapLoi = {};

            parsedSession.forEach(maLK => {
              const hs = kho.find(item => item.ma_lk === maLK || (item.du_lieu_goc?.xml1?.MA_LK === maLK));
              if (hs && hs.du_lieu_goc) {
                dsKhoiPhuc.push(hs.du_lieu_goc);
                mapLoi[maLK] = hs.ket_qua_giam_dinh || [];
              }
            });

            if (dsKhoiPhuc.length > 0) {
               setDanhSachHoSoMo(dsKhoiPhuc);
               setKetQuaGiamDinhMap(mapLoi);
               chuyenDoiHoSo(dsKhoiPhuc[0], mapLoi);
            }
          }
        }
      } catch (e) {
        console.error("Lỗi khôi phục session:", e);
      } finally {
        isInitialMount.current = false;
      }
    };
    loadSession();
  }, []);

  useEffect(() => {
    if (isInitialMount.current || !hoSoDangXem) return;

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    
    debounceTimer.current = setTimeout(async () => {
      try {
        const maLK = hoSoDangXem.xml1?.MA_LK || hoSoDangXem.MA_LK;
        
        // 1. TỰ ĐỘNG CHẠY LẠI GIÁM ĐỊNH KHI DỮ LIỆU THAY ĐỔI
        const loiMoi = await chayBoMayGiamDinhV3(hoSoDangXem);

        // 2. CẬP NHẬT TRẠNG THÁI LỖI TRÊN GIAO DIỆN
        setKetQuaGiamDinhMap(prev => ({ ...prev, [maLK]: loiMoi }));

        // 3. ĐỒNG BỘ VÀO KHO LƯU TRỮ (SINGLE SOURCE OF TRUTH) BẰNG CHUNKING
        let khoHienTai = await docKhoHoSoChongTranBoNho('KHO_HO_SO_BHYT') || [];
        
        let isUpdated = false;
        const newData = khoHienTai.map(hs => {
          if (hs.ma_lk === maLK || (hs.du_lieu_goc?.xml1?.MA_LK === maLK)) {
            isUpdated = true;
            return { 
              ...hs, 
              du_lieu_goc: hoSoDangXem, 
              ket_qua_giam_dinh: loiMoi 
            };
          }
          return hs;
        });

        if (!isUpdated && maLK) {
          newData.push({
             id: `ID_${Date.now()}`,
             ma_lk: maLK,
             ten_benh_nhan: hoSoDangXem.xml1?.HO_TEN || "K.Xác định",
             du_lieu_goc: hoSoDangXem,
             ket_qua_giam_dinh: loiMoi,
             thoi_gian: new Date().toLocaleString()
          });
        }

        // Thay thế setItem bằng hàm chống tràn bộ nhớ
        await luuKhoHoSoChongTranBoNho('KHO_HO_SO_BHYT', newData);
      } catch (e) {
        console.error("Lỗi Auto-save & Giám định:", e);
      }
    }, 800);
  }, [hoSoDangXem]);

  const chuyenDoiHoSo = (hs, mapLoiHienTai = ketQuaGiamDinhMap) => {
    setHoSoDangXem(hs);
    const cacBang = Object.keys(hs).filter(k => k.toLowerCase().startsWith('xml')).map(k => k.toUpperCase()).sort();
    setDanhSachTabDong(cacBang);
    setTabHienTai(cacBang[0] || 'XML1');
  };

  const handleNhanDuLieu = async (dataList) => {
    if (dataList && dataList.length > 0) {
      let dsMoMoi = [...danhSachHoSoMo];
      let mapLoiMoi = { ...ketQuaGiamDinhMap };

      for (const hoSo of dataList) {
        const maLK = hoSo.xml1?.MA_LK;
        if (maLK && !dsMoMoi.some(hs => hs.xml1?.MA_LK === maLK)) {
           const loiChiTiet = await chayBoMayGiamDinhV3(hoSo);
           mapLoiMoi[maLK] = loiChiTiet;
           dsMoMoi.push(hoSo);
        }
      }

      setDanhSachHoSoMo(dsMoMoi);
      setKetQuaGiamDinhMap(mapLoiMoi);
      chuyenDoiHoSo(dataList[0], mapLoiMoi);
      
      const sessionKeys = dsMoMoi.map(hs => hs.xml1?.MA_LK).filter(Boolean);
      await AsyncStorage.setItem('SESSION_DOC_XML_MULTIPLE', JSON.stringify(sessionKeys));
    }
  };

  const handleQuetLai = async () => {
    if (!hoSoDangXem) return;
    const maLK = hoSoDangXem.xml1?.MA_LK;
    const loi = await chayBoMayGiamDinhV3(hoSoDangXem);
    setKetQuaGiamDinhMap(prev => ({...prev, [maLK]: loi}));
    Alert.alert("Hệ thống CDSS", `Đã cập nhật giám định: ${loi.length} lỗi.`);
  };

  const handleDongHoSo = async (maLKDong) => {
    const dsMoi = danhSachHoSoMo.filter(hs => hs.xml1?.MA_LK !== maLKDong);
    setDanhSachHoSoMo(dsMoi);
    
    if (dsMoi.length === 0) {
       setHoSoDangXem(null);
       await AsyncStorage.removeItem('SESSION_DOC_XML_MULTIPLE');
    } else if (hoSoDangXem?.xml1?.MA_LK === maLKDong) {
       chuyenDoiHoSo(dsMoi[0]);
    }

    const sessionKeys = dsMoi.map(hs => hs.xml1?.MA_LK).filter(Boolean);
    if(sessionKeys.length > 0) {
      await AsyncStorage.setItem('SESSION_DOC_XML_MULTIPLE', JSON.stringify(sessionKeys));
    }
  };

  const handleXuatXML = () => {
    if (Platform.OS !== 'web') return Alert.alert("Thông báo", "Chức năng xuất file chỉ hỗ trợ trên Web.");
    if (!hoSoDangXem) return;
    
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<HOSO>\n';
    for (const [key, value] of Object.entries(hoSoDangXem)) {
        if (!key.toLowerCase().startsWith('xml')) continue;
        const tag = key.toUpperCase();
        if (Array.isArray(value)) {
            xml += `  <DSACH_${tag}>\n`;
            value.forEach(row => {
                xml += `    <${tag}>\n`;
                (CHUAN_COT_XML[tag] || Object.keys(row)).forEach(f => {
                    if (f !== 'id') xml += `      <${f}>${row[f] || ''}</${f}>\n`;
                });
                xml += `    </${tag}>\n`;
            });
            xml += `  </DSACH_${tag}>\n`;
        } else {
            xml += `  <${tag}>\n`;
            (CHUAN_COT_XML[tag] || Object.keys(value)).forEach(f => {
                if (f !== 'id') xml += `    <${f}>${value[f] || ''}</${f}>\n`;
            });
            xml += `  </${tag}>\n`;
        }
    }
    xml += '</HOSO>';
    const blob = new Blob([xml], { type: 'text/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SAU_GIAM_DINH_${hoSoDangXem.xml1?.MA_LK || 'EDITED'}.xml`;
    a.click();
  };

  const handleJumpToError = (index, truongLoi) => {
    if (!truongLoi || truongLoi === 'UNKNOWN') {
      Alert.alert("Thông báo", "Đây là lỗi cấu trúc hệ thống.");
      return;
    }
    if (mainScrollRef.current) {
        // Tọa độ nhảy ước tính an toàn khi dùng Auto-Height
        mainScrollRef.current.scrollTo({ y: index * 70, animated: true });
    }
  };

  const handleEditCell = (rowIndex, colName, value) => {
    const key = tabHienTai.toLowerCase();
    let capNhat = { ...hoSoDangXem };
    if (Array.isArray(capNhat[key])) {
      capNhat[key][rowIndex] = { ...capNhat[key][rowIndex], [colName]: value };
    } else {
      capNhat[key] = { ...capNhat[key], [colName]: value };
    }
    
    const maLK = capNhat.xml1?.MA_LK;
    const dsMoi = danhSachHoSoMo.map(hs => hs.xml1?.MA_LK === maLK ? capNhat : hs);
    setDanhSachHoSoMo(dsMoi);
    setHoSoDangXem(capNhat); 
  };

  const renderGrid = () => {
    if (!hoSoDangXem) return null;
    const key = tabHienTai.toLowerCase();
    const duLieu = hoSoDangXem[key];
    if (!duLieu) return null;
    const mangDinhDang = Array.isArray(duLieu) ? duLieu : [duLieu];
    let cotHienThi = CHUAN_COT_XML[tabHienTai] || Object.keys(mangDinhDang[0] || {});

    const maLK = hoSoDangXem.xml1?.MA_LK;
    const ketQuaLoiHienTai = ketQuaGiamDinhMap[maLK] || [];

    return (
      <ScrollView horizontal style={styles.scroll_ngang} contentContainerStyle={{ minWidth: '100%' }}>
        <View style={{ flex: 1 }}>
          <View style={styles.header_row}>
            <View style={[styles.cell_h, { width: 60 }]}><Text style={styles.txt_h}>STT</Text></View>
            {cotHienThi.map((col, i) => {
              const isLongText = col.includes('TEN') || col.includes('HO_TEN') || col.includes('CHAN_DOAN') || col.includes('DIA_CHI') || col.includes('GHI_CHU');
              const flexScale = isLongText ? 3 : 1;
              const minW = isLongText ? 300 : 150;
              return (
                <View key={i} style={[styles.cell_h, { flex: flexScale, minWidth: minW }]}><Text style={styles.txt_h}>{col}</Text></View>
              );
            })}
          </View>

          <ScrollView ref={mainScrollRef} style={{ flex: 1 }}>
            {mangDinhDang.map((row, rIdx) => (
              <View key={rIdx} style={styles.data_row}>
                <View style={[styles.cell_d, { width: 60, backgroundColor: '#FCE4EC', alignItems: 'center' }]}><Text style={styles.txt_d}>{rIdx + 1}</Text></View>
                {cotHienThi.map((col, cIdx) => {
                  const loi = ketQuaLoiHienTai.find(l => 
                    l.phan_he === tabHienTai && 
                    (l.index === rIdx || tabHienTai === 'XML1') && 
                    (l.truong_loi === col || col.includes(l.truong_loi) || (l.truong_loi && l.truong_loi.includes(col)))
                  );
                  
                  const isLongText = col.includes('TEN') || col.includes('HO_TEN') || col.includes('CHAN_DOAN') || col.includes('DIA_CHI') || col.includes('GHI_CHU');
                  const flexScale = isLongText ? 3 : 1;
                  const minW = isLongText ? 300 : 150;

                  return (
                    <View key={cIdx} style={[styles.cell_d, { flex: flexScale, minWidth: minW, padding: 0 }, loi && styles.cell_err]}>
                      <TextInput 
                        style={[styles.input_d, loi && { color: '#D32F2F', fontWeight: 'bold' }]}
                        value={String(row[col] || '')}
                        onChangeText={(val) => handleEditCell(rIdx, col, val)}
                        multiline={true}
                        outlineStyle="none"
                      />
                    </View>
                  );
                })}
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    );
  };

  const currentLK = hoSoDangXem?.xml1?.MA_LK;
  const currentLoi = ketQuaGiamDinhMap[currentLK] || [];
  const loiSuaDuoc = currentLoi.filter(l => l.truong_loi && l.truong_loi !== 'UNKNOWN').length;
  const loiHeThong = currentLoi.length - loiSuaDuoc;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.top_nav}>
        <View style={styles.top_nav_left}>
           <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back_btn}>
             <Text style={styles.back_txt}>⬅ TRỞ VỀ</Text>
           </TouchableOpacity>
           <Text style={styles.main_title}>🛠 TRẠM GIÁM ĐỊNH</Text>
        </View>

        <View style={styles.top_nav_right}>
           {danhSachHoSoMo.length > 0 && (
             <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thanh_chon_ho_so} contentContainerStyle={{ alignItems: 'center' }}>
               {danhSachHoSoMo.map((hs, index) => {
                 const isFocused = hs.xml1?.MA_LK === currentLK;
                 const soLoi = ketQuaGiamDinhMap[hs.xml1?.MA_LK]?.length || 0;
                 return (
                   <TouchableOpacity 
                     key={hs.xml1?.MA_LK || index} 
                     style={[styles.btn_uniform, styles.tab_ho_so, isFocused && styles.tab_ho_so_on]}
                     onPress={() => chuyenDoiHoSo(hs)}
                   >
                     <Text style={[styles.txt_uniform, {color: '#555'}, isFocused && styles.txt_tab_ho_so_on]}>
                       📄 {hs.xml1?.MA_LK} {soLoi > 0 && `(${soLoi})`}
                     </Text>
                     <TouchableOpacity style={styles.btn_tat_tab} onPress={() => handleDongHoSo(hs.xml1?.MA_LK)}>
                        <Text style={styles.txt_tat_tab}>✕</Text>
                     </TouchableOpacity>
                   </TouchableOpacity>
                 );
               })}
             </ScrollView>
           )}

           {hoSoDangXem && (
             <View style={styles.actions_right}>
               <NhapFileXML onDuLieuSanSang={handleNhanDuLieu} multiple={true} styleButton={[styles.btn_uniform, {backgroundColor: '#8E24AA'}]} textButton="➕ THÊM" />
               <TouchableOpacity style={[styles.btn_uniform, {backgroundColor: '#0288D1'}]} onPress={() => navigation.navigate('ChiTiet', { maLK: currentLK })}>
                 <Text style={styles.txt_uniform}>🔎 CHI TIẾT</Text>
               </TouchableOpacity>
               <TouchableOpacity style={[styles.btn_uniform, {backgroundColor: '#43A047'}]} onPress={handleQuetLai}>
                 <Text style={styles.txt_uniform}>🔄 QUÉT LẠI</Text>
               </TouchableOpacity>
               <TouchableOpacity style={[styles.btn_uniform, { backgroundColor: '#2E7D32' }]} onPress={handleXuatXML}>
                 <Text style={styles.txt_uniform}>📥 XUẤT SẠCH</Text>
               </TouchableOpacity>
               <TouchableOpacity style={[styles.btn_uniform, { backgroundColor: '#757575' }]} onPress={() => handleDongHoSo(currentLK)}>
                 <Text style={styles.txt_uniform}>✕ ĐÓNG</Text>
               </TouchableOpacity>
             </View>
           )}
        </View>
      </View>

      {!hoSoDangXem ? (
        <View style={styles.welcome}>
          <NhapFileXML onDuLieuSanSang={handleNhanDuLieu} multiple={true} />
          <Text style={styles.hint}>Nhấn chọn (hoặc bôi đen nhiều) tệp XML. Hệ thống sẽ tự động quét lỗi.</Text>
        </View>
      ) : (
        <View style={styles.workspace}>
          
          <View style={styles.thanh_tong_hop}>
             <View style={styles.thong_tin_bn_khu_vuc}>
                <Text style={styles.p_name}>{hoSoDangXem.xml1?.HO_TEN} - {hoSoDangXem.xml1?.MA_LK}</Text>
                <Text style={styles.p_sub}>{hoSoDangXem.xml1?.CHAN_DOAN_RV}</Text>
             </View>

             <View style={[styles.the_tong_hop, { borderLeftColor: '#D81B60' }]}>
                <Text style={styles.nhan_tong_hop}>TỔNG LỖI</Text>
                <Text style={styles.so_tong_hop}>{currentLoi.length}</Text>
             </View>
             <View style={[styles.the_tong_hop, { borderLeftColor: '#43A047' }]}>
                <Text style={styles.nhan_tong_hop}>SỬA ĐƯỢC</Text>
                <Text style={[styles.so_tong_hop, { color: '#2E7D32' }]}>{loiSuaDuoc}</Text>
             </View>
             <View style={[styles.the_tong_hop, { borderLeftColor: '#D32F2F' }]}>
                <Text style={styles.nhan_tong_hop}>HỆ THỐNG</Text>
                <Text style={[styles.so_tong_hop, { color: '#C62828' }]}>{loiHeThong}</Text>
             </View>
          </View>

          <View style={styles.tab_box}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {danhSachTabDong.map(tab => (
                <TouchableOpacity key={tab} onPress={() => setTabHienTai(tab)} style={[styles.tab_btn, tabHienTai === tab && styles.tab_on]}>
                  <Text style={[styles.tab_txt, tabHienTai === tab && styles.tab_txt_on]}>{tab}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.main_content_layout}>
             <View style={styles.grid_container_split}>
                {renderGrid()}
             </View>

             <View style={styles.audit_log_container_split}>
                <Text style={styles.audit_title}>📒 SỔ TAY LỖI</Text>
                <ScrollView style={styles.audit_list}>
                  {currentLoi.filter(l => l.phan_he === tabHienTai).map((l, i) => {
                    const canFix = l.truong_loi && l.truong_loi !== 'UNKNOWN';
                    return (
                      <TouchableOpacity key={i} style={styles.log_item} onPress={() => handleJumpToError(l.index || 0, l.truong_loi)}>
                        <View style={[styles.log_tag, {backgroundColor: canFix ? '#43A047' : '#D32F2F'}]}>
                          <Text style={styles.log_tag_txt}>{canFix ? 'SỬA ĐƯỢC' : 'HỆ THỐNG'}</Text>
                        </View>
                        <View style={styles.log_content}>
                          <Text style={styles.log_field}>Trường: [{l.truong_loi || 'N/A'}] - Dòng {(l.index || 0) + 1}</Text>
                          <Text style={styles.log_msg}>{l.canh_bao}</Text>
                        </View>
                        {canFix && <Text style={styles.log_jump_icon}>📍</Text>}
                      </TouchableOpacity>
                    );
                  })}
                  {currentLoi.filter(l => l.phan_he === tabHienTai).length === 0 && (
                    <Text style={styles.log_success_txt}>✨ Không có lỗi tại bảng này.</Text>
                  )}
                </ScrollView>
             </View>
          </View>

        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CD.bg.gradient_mobile,
    ...Platform.select({ web: { background: CD.web.gradient_bg } }),
  },

  // --- HEADER / TOP NAV ---
  top_nav: {
    backgroundColor: CD.brand.mauDam,
    paddingHorizontal: 24,
    paddingVertical: 16,
    paddingTop: 35,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: CD.border.header,
    ...Platform.select({ web: { background: CD.web.gradient_header, backdropFilter: CD.web.blur_header, boxShadow: CD.web.shadow_header } }),
  },
  top_nav_left: { flexDirection: 'row', alignItems: 'center' },
  back_btn: {
    padding: 8,
    backgroundColor: CD.bg.glass_input,
    borderRadius: 10,
    marginRight: 10,
    borderWidth: 1,
    borderColor: CD.border.glass_md,
    ...Platform.select({ web: { cursor: CD.web.cursor_pointer } }),
  },
  back_txt: { color: CD.text.primary, fontWeight: 'bold', fontSize: 21, fontFamily: CD.font.family },
  main_title: { color: CD.text.primary, fontSize: 26, fontWeight: 'bold', fontFamily: CD.font.family },

  top_nav_right: { flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'flex-end', gap: 10 },
  thanh_chon_ho_so: { flexDirection: 'row', maxWidth: '50%' },

  // --- BUTTONS ---
  btn_uniform: {
    height: 45,
    paddingHorizontal: 12,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    backgroundColor: CD.brand.mauChinh,
    ...Platform.select({ web: { background: CD.web.gradient_primary, boxShadow: CD.web.shadow_btn, cursor: CD.web.cursor_pointer } }),
  },
  txt_uniform: { color: CD.text.primary, fontWeight: 'bold', fontSize: 21, fontFamily: CD.font.family },

  // --- HỒ SƠ TABS (in header) ---
  tab_ho_so: {
    flexDirection: 'row',
    backgroundColor: CD.bg.glass_card,
    borderWidth: 1,
    borderColor: CD.border.glass,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  tab_ho_so_on: {
    backgroundColor: CD.brand.mauChinh,
    borderColor: CD.brand.mauChinh,
    ...Platform.select({ web: { background: CD.web.gradient_primary, boxShadow: CD.web.shadow_btn } }),
  },
  txt_tab_ho_so_on: { color: CD.text.primary },
  btn_tat_tab: { marginLeft: 8, padding: 2 },
  txt_tat_tab: { color: CD.text.muted, fontWeight: 'bold', fontSize: 21 },

  actions_right: { flexDirection: 'row' },

  // --- WELCOME / EMPTY STATE ---
  welcome: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  hint: { fontSize: 22, color: CD.text.muted, fontStyle: 'italic', textAlign: 'center', marginTop: 25 },
  workspace: { flex: 1, padding: 10, paddingBottom: 0 },

  // --- THANH TỔNG HỢP (KPI bar) ---
  thanh_tong_hop: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
    backgroundColor: CD.bg.glass_card,
    padding: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: CD.border.divider,
    ...Platform.select({ web: { backdropFilter: CD.web.blur_card, boxShadow: CD.web.shadow_card } }),
  },
  thong_tin_bn_khu_vuc: { flex: 3, justifyContent: 'center', paddingLeft: 10 },
  p_name: { fontSize: 24, fontWeight: 'bold', color: CD.text.primary },
  p_sub: { fontSize: 22, color: CD.brand.mauNhat, marginTop: 4 },

  the_tong_hop: {
    flex: 1,
    backgroundColor: CD.bg.glass_card,
    padding: 8,
    borderRadius: 16,
    borderLeftWidth: 5,
    borderWidth: 1,
    borderColor: CD.border.divider,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...Platform.select({ web: { backdropFilter: CD.web.blur_card, boxShadow: CD.web.shadow_card } }),
  },
  nhan_tong_hop: { fontSize: 21, color: CD.text.secondary, fontWeight: 'bold' },
  so_tong_hop: { fontSize: 26, fontWeight: 'bold', color: CD.text.primary },

  // --- XML TABS (XML1–XML6) ---
  tab_box: { flexDirection: 'row', marginBottom: 10 },
  tab_btn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: CD.bg.glass_card,
    borderRadius: 10,
    marginRight: 10,
    borderWidth: 1,
    borderColor: CD.border.glass,
    ...Platform.select({ web: { cursor: CD.web.cursor_pointer } }),
  },
  tab_on: {
    backgroundColor: CD.brand.mauChinh,
    borderColor: CD.brand.mauChinh,
    ...Platform.select({ web: { background: CD.web.gradient_primary, boxShadow: CD.web.shadow_btn } }),
  },
  tab_txt: { fontSize: 21, fontWeight: 'bold', color: CD.text.secondary },
  tab_txt_on: { color: CD.text.primary },

  // --- MAIN SPLIT LAYOUT ---
  main_content_layout: { flex: 1, flexDirection: 'row', gap: 10, paddingBottom: 10 },

  // Data grid (left panel)
  grid_container_split: {
    flex: 7.5,
    backgroundColor: CD.bg.glass_card,
    borderWidth: 1,
    borderColor: CD.border.glass,
    borderRadius: 20,
    overflow: 'hidden',
    ...Platform.select({ web: { backdropFilter: CD.web.blur_card, WebkitBackdropFilter: CD.web.blur_card, boxShadow: CD.web.shadow_card } }),
  },

  // Audit log (right panel)
  audit_log_container_split: {
    flex: 2.5,
    backgroundColor: CD.bg.glass_card,
    padding: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: CD.border.accent,
    ...Platform.select({ web: { backdropFilter: CD.web.blur_card, WebkitBackdropFilter: CD.web.blur_card, boxShadow: CD.web.shadow_card } }),
  },

  // --- DATA GRID INTERNALS ---
  scroll_ngang: { flex: 1 },
  header_row: { flexDirection: 'row', backgroundColor: CD.bg.table_header },
  cell_h: { padding: 15, borderRightWidth: 1, borderColor: CD.border.divider, justifyContent: 'center' },
  txt_h: { fontSize: 22, fontWeight: '700', color: CD.text.table_header, textAlign: 'center' },

  data_row: { flexDirection: 'row', borderBottomWidth: 1, borderColor: CD.border.divider, minHeight: 60 },
  cell_d: { borderRightWidth: 1, borderColor: CD.border.divider, justifyContent: 'center' },
  txt_d: { fontSize: 22, color: CD.text.table_cell, textAlign: 'center' },
  input_d: {
    fontSize: 22,
    color: CD.text.table_cell,
    backgroundColor: CD.bg.glass_input,
    width: '100%',
    minHeight: 60,
    padding: 12,
    textAlignVertical: 'top',
    fontFamily: CD.font.family,
    ...Platform.select({ web: { outlineStyle: 'none' } }),
  },
  cell_err: { backgroundColor: 'rgba(244,67,54,0.12)', borderColor: '#F44336', borderWidth: 2 },

  // --- AUDIT LOG (SỔ TAY LỖI) ---
  audit_title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: CD.brand.mauNhat,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: CD.border.divider,
    paddingBottom: 6,
  },
  audit_list: { flex: 1 },
  log_item: {
    marginBottom: 10,
    backgroundColor: CD.bg.glass_card,
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: CD.border.divider,
    ...Platform.select({ web: { cursor: CD.web.cursor_pointer } }),
  },
  log_tag: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 4, alignSelf: 'flex-start', marginBottom: 6 },
  log_tag_txt: { color: CD.text.primary, fontSize: 21, fontWeight: 'bold' },
  log_content: { flex: 1 },
  log_field: { fontSize: 21, fontWeight: 'bold', color: CD.brand.mauNhat },
  log_msg: { fontSize: 21, color: CD.text.secondary, marginTop: 4, lineHeight: 28 },
  log_jump_icon: { fontSize: 24, position: 'absolute', right: 5, top: 5 },
  log_success_txt: { fontSize: 22, color: '#81C784', fontWeight: 'bold', textAlign: 'center', marginTop: 25 },
});

export default ManHinhDocXML;