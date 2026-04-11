# CDSS — Mapping ICD ↔ danh mục thuốc / DVKT BV (nâng cấp, tách biệt)

**Mục đích:** Kiểm tra gợi ý chuyên môn khi **đã có** bảng ánh xạ ICD → mã `MA_THUOC` / `MA_DICH_VU` trùng **danh mục nội bộ BV** (M03 / M05 trong seed hệ thống).

**Mặc định:** Hai quy tắc **`CDSS_DM_UPGRADE_01`** và **`CDSS_DM_UPGRADE_02`** ở trạng thái **OFF** trong **Quản lý quy tắc ON/OFF** — không ảnh hưởng hành vi cũ cho đến khi bật và có dữ liệu mapping.

---

## 1. Dữ liệu

| Khóa lưu trữ | Nội dung |
|--------------|----------|
| `CDSS_DATA_ICD_DM_GOI_Y_V1` | Mảng dòng mapping (JSON / chunked như các CDSS_DATA khác) |
| `CDSS_COLS_ICD_DM_GOI_Y_V1` | Tiêu đề cột (tùy chọn) |

**File seed mặc định (rỗng):** `ma_nguon/chuyen_mon/phac_do_benh_vien/cdss_icd_dm_goi_y_upgrade.seed.json`

**Cột dòng:**

| Cột | Ý nghĩa |
|-----|---------|
| `MA_ICD` | Mã ICD đã chuẩn hóa (bỏ dấu chấm), khớp cách gom ICD trên XML1 |
| `MA_THUOC_GOI_Y` | Một hoặc nhiều mã thuốc, phân tách bằng `;` hoặc `,` — **phải tồn tại** trong `MAP_THUOC_BV` |
| `MA_DVKT_GOI_Y` | Một hoặc nhiều mã DVKT, phân tách tương tự — **phải tồn tại** trong `MAP_DVKT_BV` |
| `GHI_CHU` | Tuỳ chọn (ghi chú nội bộ; chưa dùng trong cảnh báo) |

---

## 2. Logic (module `cdss_dm_matching_upgrade.jsx`)

- Với mỗi ICD trên hồ sơ (chính/kèm) **có** dòng mapping:  
  - Nếu danh sách thuốc gợi ý (sau khi lọc theo DM BV) **không rỗng** và **không** có mã nào xuất hiện trên **XML2** → cảnh báo **`CDSS_DM_UPGRADE_01`** (Info).  
  - Tương tự DVKT trên **XML3** → **`CDSS_DM_UPGRADE_02`**.
- Mã trong mapping **không** có trong danh mục BV → bỏ qua mã đó (tránh cảnh báo sai do cấu hình).

---

## 3. Bật sử dụng

1. Nạp dữ liệu mapping vào `CDSS_DATA_ICD_DM_GOI_Y_V1` (tương lai có thể thêm màn nhập / import; hiện có thể đồng bộ qua cùng cơ chế chunk như danh mục khác).
2. Trong **Quản lý quy tắc ON/OFF**, bật **ON** cho `CDSS_DM_UPGRADE_01` và/hoặc `CDSS_DM_UPGRADE_02`.

---

## 4. Giới hạn

- Chỉ kiểm tra **mã** đã có trên XML2/XML3; không đọc văn bản phác đồ tự do.
- Không thay thế giám định viên; mức **Info** — đối chiếu nghiệp vụ BV.
