# CA HUẤN LUYỆN MẪU 000573 — THUOC_391 — DAFODIN TRONG HỒ SƠ NỘI TRÚ (GIƯỜNG + DVKT)

Phiên bản tài liệu: 1.0  
Ngày cập nhật: 06/04/2026

## 1. Mục tiêu

Bổ sung **ngữ cảnh thứ hai** cho **`THUOC_391`** (số lượng cấp phát **thấp hơn** y lệnh `SL_MOI_NGAY × SO_NGAY`), song song với ca mổ sản **`000308`**:

- Hồ sơ có **giường bệnh**, **DVKT**, **XML7/XML8** — AI không được kết luận “chỉ có lỗi thuốc” mà bỏ qua dòng thời gian XML3.
- Cùng một rule **`THUOC_391`** có thể **lặp** trên **hai index** khác nhau (cùng tên thuốc nếu kê nhiều lần trong XML).

## 2. Nguồn dữ liệu

- Audit: `test_xml/audit_000573_20260405_084557.json` (hoặc các bản `065622`, `080431`, `085434` cùng `MA_LK` — rule thuốc giữ nguyên; bản `085434` có thêm `XML_19`, `XML_115`, `XML_121`).
- XML gốc: thường nằm ngoài repo; `test_xml/doi_chieu_000573_*.json` có `claimPath` tham chiếu.

## 3. Dữ liệu thuốc trong audit mẫu

- Rule: **`THUOC_391`** × **2**
- Thuốc minh họa: **`[40.736] Dafodin`**
- Index trong JSON mẫu: **1** và **3** (đối chiếu từng block `warnings`).

## 4. Cảnh báo đi kèm (không thuộc thuốc nhưng cùng hồ sơ)

Ví dụ snapshot `084557`:

- `CLN-GIUONG-01`, `DVKT_2696`, `HC_171`, `HC_224`, `HC_97`, `HD_10`, `XML3-TIME-NGAY_TH_YL-AFTER-OUT`

**Bài học:** Giám định thuốc là **một phần** checklist; báo cáo cho người dùng nên **nhóm theo phân hệ** (XML2 vs XML3 vs XML7/8).

## 5. Bài tập cho AI

1. Chứng minh bằng số: với mỗi cảnh báo `THUOC_391`, so sánh `SO_LUONG` với `SL_MOI_NGAY * SO_NGAY` (trích từ XML nếu có, hoặc từ text cảnh báo).
2. So sánh **mức độ nghiệp vụ** `THUOC_391` (kiểm tra / tự túc) với `THUOC_417` (cấp dư / xuất toán trong wording seed).
3. Nêu **một** tình huốn hợp lệ khiến `SO_LUONG` < y lệnh mà **không** phải gian lận (ví dụ: tách đợt cấp, ngưng sớm — mang tính giả định, cần chứng từ).

## 6. Liên kết

- Ca `THUOC_391` (mổ sản / Biofazolin): `Ca_huan_luyen_mau_000308_THUOC_391_sai_lech_so_luong_y_lenh.md`  
- Khung phân loại: `The_tri_thuc_kiem_soat_sai_thuoc_AI.md`
