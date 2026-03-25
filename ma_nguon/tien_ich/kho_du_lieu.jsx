/**
 * ============================================================================
 * FILE: tien_ich/kho_du_lieu.jsx
 * MỤC ĐÍCH: Quản lý lưu trữ nội bộ (Local Storage) cho ứng dụng CDSS.
 * CẬP NHẬT: Thiết kế lại cơ trúc lưu trữ theo dạng Phân mảnh (Index-Detail)
 * để vượt qua giới hạn 2MB/key của React Native AsyncStorage.
 * ============================================================================
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// Các hằng số định danh Key trong Database nội bộ
const KHO_INDEX_KEY = 'CDSS_KHO_INDEX_MA_LK';
const PREFIX_HS_KEY = 'CDSS_HS_';

/**
 * 1. LƯU HỒ SƠ VÀO KHO (Đã được tối ưu phân mảnh)
 * Hàm này được gọi từ nhap_file_xml.jsx sau khi quét lỗi xong.
 */
export const luuHoSoVaoKho = async (danhSachHoSoMoi) => {
    try {
        if (!danhSachHoSoMoi || danhSachHoSoMoi.length === 0) return;

        // B1: Lấy danh sách Mục lục (Mã liên kết) hiện có
        const indexData = await AsyncStorage.getItem(KHO_INDEX_KEY);
        let dsMaLK = indexData ? JSON.parse(indexData) : [];

        // B2: Lưu tuần tự từng hồ sơ bằng Key riêng biệt
        for (const hoSo of danhSachHoSoMoi) {
            // Xác định Mã liên kết (Hỗ trợ nhiều cấu trúc object khác nhau)
            const maLK = hoSo.ma_lk || hoSo.XML1?.MA_LK || hoSo.xml1?.MA_LK;
            if (!maLK) continue; // Bỏ qua hồ sơ rác không có mã

            const hoSoKey = `${PREFIX_HS_KEY}${maLK}`;
            
            // Lưu data hồ sơ chi tiết
            await AsyncStorage.setItem(hoSoKey, JSON.stringify(hoSo));

            // Cập nhật mục lục nếu là hồ sơ mới
            if (!dsMaLK.includes(maLK)) {
                dsMaLK.push(maLK);
            }
        }

        // B3: Lưu lại Mục lục cập nhật
        await AsyncStorage.setItem(KHO_INDEX_KEY, JSON.stringify(dsMaLK));
        console.log(`[KHO_DU_LIEU] Đã lưu an toàn ${danhSachHoSoMoi.length} hồ sơ vào Local Storage.`);
        
        return true;
    } catch (error) {
        console.error('[KHO_DU_LIEU] Lỗi nghiêm trọng khi lưu kho:', error);
        throw new Error('Lỗi tràn bộ nhớ hoặc hệ thống lưu trữ bị từ chối.');
    }
};

/**
 * 2. LẤY TOÀN BỘ HỒ SƠ TỪ KHO
 * Dùng để render danh sách bệnh nhân lên màn hình Dashboard/Bàn làm việc.
 */
export const layTatCaHoSoTuKho = async () => {
    try {
        // Đọc mục lục
        const indexData = await AsyncStorage.getItem(KHO_INDEX_KEY);
        if (!indexData) return [];

        const dsMaLK = JSON.parse(indexData);
        if (dsMaLK.length === 0) return [];

        // Tạo mảng các Key cần truy xuất
        const keysToFetch = dsMaLK.map(maLK => `${PREFIX_HS_KEY}${maLK}`);
        
        // Truy xuất đồng loạt các Key (Nhanh và không bị kẹt luồng)
        const multipleData = await AsyncStorage.multiGet(keysToFetch);
        
        // Parse dữ liệu từ String sang JSON Object
        const danhSachHoSo = multipleData
            .map(([key, value]) => value ? JSON.parse(value) : null)
            .filter(item => item !== null);

        // Sắp xếp hồ sơ mới nhất lên đầu (Dựa vào thời gian nếu có, ở đây đảo ngược mảng)
        return danhSachHoSo.reverse();
    } catch (error) {
        console.error('[KHO_DU_LIEU] Lỗi truy xuất kho:', error);
        return [];
    }
};

/**
 * 3. XÓA MỘT HỒ SƠ KHỎI KHO
 * Dùng khi bác sĩ đã xử lý xong hoặc muốn hủy bỏ hồ sơ.
 */
export const xoaHoSoKhoiKho = async (maLK_CanXoa) => {
    try {
        if (!maLK_CanXoa) return false;

        // Xóa data chi tiết
        const hoSoKey = `${PREFIX_HS_KEY}${maLK_CanXoa}`;
        await AsyncStorage.removeItem(hoSoKey);

        // Cập nhật lại Mục lục
        const indexData = await AsyncStorage.getItem(KHO_INDEX_KEY);
        if (indexData) {
            let dsMaLK = JSON.parse(indexData);
            dsMaLK = dsMaLK.filter(ma => ma !== maLK_CanXoa);
            await AsyncStorage.setItem(KHO_INDEX_KEY, JSON.stringify(dsMaLK));
        }
        
        return true;
    } catch (error) {
        console.error(`[KHO_DU_LIEU] Lỗi khi xóa hồ sơ ${maLK_CanXoa}:`, error);
        return false;
    }
};

/**
 * 4. LÀM SẠCH KHO DỮ LIỆU (CLEAR ALL)
 * Dùng cho nút "Xóa tất cả" hoặc khi hệ thống quá tải.
 */
export const xoaToanBoKho = async () => {
    try {
        const indexData = await AsyncStorage.getItem(KHO_INDEX_KEY);
        if (indexData) {
            const dsMaLK = JSON.parse(indexData);
            const keysToRemove = dsMaLK.map(maLK => `${PREFIX_HS_KEY}${maLK}`);
            
            // Xóa toàn bộ file chi tiết
            await AsyncStorage.multiRemove(keysToRemove);
        }
        // Xóa mục lục
        await AsyncStorage.removeItem(KHO_INDEX_KEY);
        
        console.log('[KHO_DU_LIEU] Đã làm sạch toàn bộ kho lưu trữ.');
        return true;
    } catch (error) {
        console.error('[KHO_DU_LIEU] Lỗi dọn dẹp kho:', error);
        return false;
    }
};