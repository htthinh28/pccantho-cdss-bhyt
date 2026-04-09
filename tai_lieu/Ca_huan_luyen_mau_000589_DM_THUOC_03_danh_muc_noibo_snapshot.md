# CA HUẤN LUYỆN MẪU 000589 — DM-THUOC-03 — THUỐC CHƯA XÁC MINH TRONG DANH MỤC NỘI BỘ (SNAPSHOT)

Phiên bản tài liệu: 1.0  
Ngày cập nhật: 08/04/2026

## 1. Mục tiêu

Dạy AI phân biệt **`DM-THUOC-03`** (cảnh báo, cần xác minh danh mục) với **`DM-THUOC-01` / `02`** (xuất toán Critical khi logic đủ dữ liệu BYT + BV).

Đồng thời luyện cách **đếm theo dòng XML2**: cùng mã thuốc có thể **lặp** nhiều cảnh báo (index khác nhau).

## 2. Nguồn dữ liệu

- Audit: `test_xml/audit_000589_20260404_185800.json`
- `MA_LK`: `000589`
- **Lưu ý:** Snapshot cũ hơn bản `232716`; có thêm `HC-06b` Critical — khi huấn luyện nên **tách** cảnh báo đối tượng KCB khỏi nhóm thuốc.

## 3. Cảnh báo DM-THUOC-03 trong file

Theo cấu trúc JSON:

- **4** cảnh báo `DM-THUOC-03`
- Mã thuốc minh họa: **`40.173`** Tenamyd-Cefotaxime (xuất hiện ở index **0** và **3**), **`40.81`** Clorpheniramin (index **2** và **5**)

## 4. Ý nghĩa nghiệp vụ (cho AI trình bày)

- Hệ thống **không kết luận** “ngoài danh mục BYT” trong nhánh này; mà báo **chưa xác minh trong DM nội bộ BV** (thường do map chưa nạp, mã mới, hoặc lệch mã).
- Hướng xử lý: **đồng bộ danh mục thuốc nội bộ**, kiểm tra kỹ thuật `MAP_THUOC_BV`, rồi chạy lại giám định — khác với sửa ICD hay liều.

## 5. Bài tập

1. Lập bảng: `index` | `MA_THUOC` | `TEN_THUOC` | rule.
2. So sánh với audit `audit_000589_20260405_232716.json`: cùng `MA_LK` nhưng **không** có `DM-THUOC-03` — đặt giả thuyết vì sao (danh mục runtime khác / thời điểm export khác).
3. Liệt kê thứ tự ưu tiên xử lý nếu đồng thời có `HC-06b` Critical và `DM-THUOC-03`.

## 6. Liên kết

- Thẻ DM + tiền: `The_tri_thuc_giam_dinh_thuoc_DM_builtin_va_doi_chieu_tien_AI.md`  
- Ca đa nhóm thuốc cùng hồ sơ (bản 232716): `Ca_huan_luyen_mau_000589_nhieu_nhom_thuoc_mot_ho_so.md`
