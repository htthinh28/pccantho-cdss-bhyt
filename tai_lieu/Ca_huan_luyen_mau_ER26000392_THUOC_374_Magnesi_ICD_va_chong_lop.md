# CA HUẤN LUYỆN MẪU ER26000392 — THUOC_374 (MAGNESI B6) — ICD, CẤP DƯ, INN VÀ CHỒNG LỚP

Phiên bản tài liệu: 1.0  
Ngày cập nhật: 06/04/2026

## 1. Mục tiêu

Huấn luyện AI trên một hồ sơ **cấp cứu / ngoại trú** có **nhiều rule thuốc chồng lên cùng hoặc khác dòng XML2**:

- **`THUOC_374`**: cổng **ICD + mô tả** cho Magnesi B6 (`40.1055`).
- **`THUOC_417`**: cấp **dư** so với `SL_MOI_NGAY × SO_NGAY` (nhiều thuốc).
- **`THUOC_436`**: đơn ngoại trú — tên thuốc **thiếu INN trong ngoặc** (TT 26/2025).
- Phân biệt với **`THUOC_373`** (cùng mã thuốc `40.1055` — **chống chỉ định** suy thận nặng / tăng calci máu trong seed) — *có thể không kích hoạt* nếu không thỏa điều kiện.

## 2. Nguồn dữ liệu

- Audit: `test_xml/audit_ER26000392_20260404_193517.json`
- XML gốc (máy người dùng): đường dẫn lưu trong `meta.claim_path` của file JSON (OneDrive); trong repo **chỉ dùng audit làm ground truth** nếu chưa có bản XML đồng bộ.

- Seed: `ma_nguon/tien_ich/du_lieu_luat_thuoc_muc8.jsx` — `SEED_THUOC_374`, `SEED_THUOC_373`.

## 3. Rule THUOC_374 (theo seed)

- **Mã thuốc:** `40.1055` (Magnesi B6 trong audit).
- **Thanh toán BHYT theo cấu hình:** chỉ khi chẩn đoán phù hợp — `MA_BENH_CHINH` hoặc `MA_BENH_KT` có **`E83.4`** hoặc **`R25.2`**, hoặc `CHAN_DOAN_RV` khớp regex *(hạ magie | chuột rút | co giật cơ)* (không phân biệt hoa thường).
- Nếu không thỏa → cảnh báo dạng xuất toán theo nội dung seed.

## 4. Snapshot audit mẫu

- `meta.total_warnings`: **9**
- `unique_rule_codes`: `XML1-REQ-MA_DOITUONG_KCB`, `HC_06`, `THUOC_374`, `THUOC_417` (×3), `THUOC_436` (×3)

**Gợi ý bài tập map dòng:**

| Index XML2 (trong JSON) | Thuốc (rút từ cảnh báo) | Rule thuốc điển hình |
|-------------------------|-------------------------|----------------------|
| 0 | Collamino 1200 | `THUOC_417`, `THUOC_436` |
| 1 | Magnesi B6 | `THUOC_374`, `THUOC_417`, `THUOC_436` |
| 2 | Mimosa Viên an thần | `THUOC_417`, `THUOC_436` |

## 5. Bài tập cho AI

1. Với **một dòng** (index 1), liệt kê **ba lớp** lỗi khác nhau (ICD, số lượng, định dạng tên) — **không gộp** thành một câu “sai đơn thuốc”.
2. So sánh **`THUOC_374`** với **`THUOC_417`**: cái nào phụ thuộc **chẩn đoán**, cái nào chỉ cần **số học XML2**.
3. Nếu bổ sung `MA_BENH_KT` chứa `E83.4`, dự đoán **`THUOC_374`** có tắt không — **căn cứ điều kiện `LIKE`** trong seed.

## 6. Liên kết

- Khung “sai thuốc”: `The_tri_thuc_kiem_soat_sai_thuoc_AI.md`  
- Cấp dư (DOMUVAR): `Ca_huan_luyen_mau_000434_THUOC_417_DOMUVAR.md`  
- INN ngoại trú: `Ca_huan_luyen_mau_OP26001050_Ciprofloxacin_ngoai_tru.md`  
- Danh mục built-in: `The_tri_thuc_giam_dinh_thuoc_DM_builtin_va_doi_chieu_tien_AI.md`
