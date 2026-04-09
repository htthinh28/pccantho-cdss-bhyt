# CA HUẤN LUYỆN MẪU OP26000908 — THUOC_267 — METHYLPREDNISOLON VÀ CỔNG ICD

Phiên bản tài liệu: 1.0  
Ngày cập nhật: 08/04/2026

## 1. Mục tiêu

Huấn luyện AI nhận diện rule **chỉ định thanh toán BHYT theo ICD** cho **corticoid hệ thống** (Methylprednisolon / Medlon), **độc lập** với:

- `THUOC_41` (Amoxicillin–clavulanate) trên cùng hồ sơ;
- `THUOC_436` (INN đơn ngoại trú);
- `DM-THUOC-04` (giá).

## 2. Nguồn dữ liệu

- Audit: `test_xml/audit_OP26000908_20260405_232932.json`
- XML: `tai_nguyen/op/PC022101042_OP26000908.xml`
- Seed: `du_lieu_luat_thuoc_muc8.jsx` — `THUOC_267`

## 3. Rule THUOC_267 (tóm tắt)

- **Điều kiện kích hoạt (ý niệm):** `MA_THUOC == '40.775'` (ví dụ Medlon / METHYL PREDNISOLON trong audit) **và** chẩn đoán **không** thuộc tập mở: `J45`, `J44`, `M05`, `L50` (và không khớp mô tả regex về hen, COPD, viêm khớp dạng thấp, mày đay).
- **Cảnh báo:** xuất toán theo phạm vi chỉ định đã cấu hình trong seed.

## 4. Dữ liệu trong audit mẫu

- Cảnh báo gắn `index` XML2 = **2**, thuốc: **`[40.775] METHYL PREDNISOLON 4`** (text trong JSON).
- Cùng file còn: `THUOC_41` (index 0), `THUOC_436` (nhiều dòng), `DM-THUOC-04`, `CLN-CHI-01`, `HC_*`, `XML_53`.

## 5. Bài tập cho AI

1. Vẽ **sơ đồ 4 cảnh báo** trên **cùng một dòng hoặc các dòng khác nhau** — không được gộp “một thuốc một lỗi” nếu thực tế là nhiều rule chồng lên **cùng index**.
2. Giải thích vì sao **corticoid** thường bị **cổng ICD chặt** trong giám định BHYT (dạng học, không thay thế hướng dẫn BYT đầy đủ).
3. Nếu `MA_BENH_KT` có `J44` nhưng `MA_BENH_CHINH` không phải J44 — rule có thể **tắt** cảnh báo nhờ nhánh `MA_BENH_KT` — AI phải **đọc đủ XML1**.

## 6. Liên kết

- Ca cùng hồ sơ (trọng tâm Amoxiclav / rule hẹp): `Ca_huan_luyen_mau_OP26000908_Amoxiclav_dieu_tri_uong.md`  
- Thẻ DM + tiền: `The_tri_thuc_giam_dinh_thuoc_DM_builtin_va_doi_chieu_tien_AI.md`
