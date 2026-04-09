# CA HUẤN LUYỆN MẪU IP26000139 — THUOC_63 (DOMUVAR) + THUOC_417 HÀNG LOẠT — NỘI TRÚ

Phiên bản tài liệu: 1.0  
Ngày cập nhật: 06/04/2026

## 1. Mục tiêu

Huấn luyện AI trên hồ sơ **nội trú** có **đồng thời**:

- **`THUOC_63`** ×3: probiotic **DOMUVAR** (`40.718`) — cổng **ICD + mô tả** (Bacillus subtilis trong seed).
- **`THUOC_417`** ×5: **cấp dư** so với y lệnh, minh họa bằng **Cefotaxime** (`40.173`) lặp nhiều dòng.
- Cảnh báo **không thuốc** đi kèm: `CDHA_164` (MRI chờ), `HC_171`, `HC_224`, `HC_97`, `HD_10`, `XML_19`, `XML_54`, `XML_121`.

Mục tiêu nghiệp vụ: AI **tách checklist** theo phân hệ; không gom “16 cảnh báo” thành một kết luận chung.

## 2. Nguồn dữ liệu

- Audit: `test_xml/audit_PC022300479_IP26000139.json`
- `meta.claim_path`: `PC022300479_IP26000139.xml` (đường dẫn máy người dùng trong snapshot).
- **Lưu ý:** `meta.ma_lk` trong file JSON có thể ghi **`000434`** (lệch với tên file IP) — khi huấn luyện, ưu tiên **tên file + `claim_path`** làm định danh ca.

## 3. Snapshot rule (từ JSON)

- `total_warnings`: **16**
- `unique_rule_codes`: `CDHA_164`, `HC_171`, `HC_224`, `HC_97`, `HD_10`, `THUOC_417`, `THUOC_63`, `XML_121`, `XML_19`, `XML_54`

## 4. Map nhanh THUOC_63 → index XML2

Theo các block `warnings` trong audit mẫu:

- `THUOC_63` tại index **0**, **1**, **7** (cùng mã `40.718` DOMUVAR).

**Bài tập:** Giải thích vì sao **một rule ICD** có thể **lặp** nhiều lần (nhiều dòng kê cùng hoạt chất / nhiều đợt).

## 5. THUOC_417 — Cefotaxime

- Nhiều cảnh báo gắn index **3**, **4**, **5**, … (đối chiếu đầy đủ trong JSON).
- Điều kiện seed kiểu: `SO_LUONG > SL_MOI_NGAY * SO_NGAY` (sau enrich).

So sánh với ca ngoại trú **`Ca_huan_luyen_mau_000434_THUOC_417_DOMUVAR.md`** (cùng nhóm cấp dư nhưng bối cảnh khác).

## 6. XML_121 và CLN-THUOC-01

- `XML_121`: trùng kê **trong cùng ngày y lệnh** (mức XML1 / logic tổng hợp — xem text cảnh báo trong JSON).
- Khác **`CLN-THUOC-01`** (trùng `MA_THUOC` trên đơn **ngoại trú** trong `giamDinhThuoc`). AI cần **không nhầm** hai mã.

## 7. Liên kết

- Chỉ mục engine (lọc `THUOC_417` / đơn vị): `The_tri_thuc_chi_muc_giam_dinh_thuoc_engine_AI.md`  
- DOMUVAR ngoại trú + THUOC_417: `Ca_huan_luyen_mau_000434_THUOC_417_DOMUVAR.md`  
- Đa nhóm + XML_121: `Ca_huan_luyen_mau_000589_nhieu_nhom_thuoc_mot_ho_so.md`  
- Khung “sai thuốc”: `The_tri_thuc_kiem_soat_sai_thuoc_AI.md`
