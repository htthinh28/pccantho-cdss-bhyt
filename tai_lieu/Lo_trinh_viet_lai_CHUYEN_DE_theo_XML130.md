# Lộ trình viết lại toàn bộ CHUYEN_DE theo XML1 / XML3 (QĐ 130)

Phiên bản: 1.0  
Ngày: 11/04/2026  
Trạng thái: **lô 1–8 (toàn bộ 603 mã) đã gán `DIEU_KIEN` XML130 hoặc placeholder** trong mã nguồn (`CHUYEN_DE_XML130_CONVERSION_VERSION`, `scripts/chuyen_de_batch_manifest.json`). Quy tắc còn placeholder: `tai_lieu/Kiem_soat_placeholder_CHUYEN_DE_XML130.md` + `npm run chuyen-de:sync-placeholder-registry`.

## 1. Mục tiêu và phạm vi

- **603** quy tắc trong `luat_giam_dinh_chuyen_de_hardcoded.jsx` hiện dùng DSL nội bộ (`ma_dvkt`, `has_dvkt`, hàm giả lập…) không tương thích với biến `XML1`/`XML3` sau `chuanHoaRuleDong`.
- Mục tiêu: mỗi quy tắc có **`DIEU_KIEN` chỉ dùng**:
  - `XML1.<trường>` (hồ sơ chung),
  - `XML3.<trường>` hoặc `CURRENT.<trường>` khi bảng mục tiêu là XML3 (một dòng DVKT/VTYT trên XML3),
  - `DS_XML2`, `DS_XML4`, `DS_XML5`… khi thật sự cần và engine hỗ trợ (`COUNT_IF`, v.v.),
  - toán tử đã hỗ trợ trong `dong_co_giam_dinh.jsx` (không dùng `BETWEEN`, `FOR_EACH`, `has_dvkt('KÝ_HIỆU')` trừ khi đã thêm handler đặc biệt).

## 2. Nguyên tắc kỹ thuật

### 2.1. Bảng mục tiêu (`PHAN_HE` / suy luận)

- Engine gán `CURRENT` = dòng đang xét; với luật XML3, `CURRENT` là một dòng `XML3` đã qua `prepareData`.
- Trong `DIEU_KIEN` **bắt buộc** có ít nhất một tham chiếu `XML1.` hoặc `XML3.` (hoặc `CURRENT.` kèm ngữ cảnh rõ) để `inferTargetTableFromCondition` và `normalizeTargetTable` không mặc định sai bảng.
- Trường DVKT trên XML3: ưu tiên `MA_DICH_VU` / `MA_DV` (đồng nghĩa sau chuẩn hóa), `TEN_DICH_VU`, `NHOM_DV`, `MA_BAC_SI`, `NGAY_YL`, `MA_MAY`, `SO_LUONG`, `DON_GIA`, `THANH_TIEN`, `TYLE_TT`… đúng tên cột QĐ 130.

### 2.2. Thay thế `ma_dvkt == 'KÝ_HIỆU_EXCEL'`

- Tra cứu **mã dịch vụ thực** trong danh mục nội bộ M05 / bảng ship (`DANH_MUC_DVKT_M05`) hoặc liệt kê `MA_DICH_VU` thực tế của BV.
- Nếu một “ký hiệu” ánh xạ **nhiều mã**: dùng `MATCH` / `IN (...)` / `String(CURRENT.MA_DV).match(/^(03\.|22\.)/)` — cần ghi rõ trong cột ghi chú nội bộ (hoặc trong manifest theo mã).

### 2.3. Quy tắc không thể viết chỉ với XML130

- Các điều kiện phụ thuộc API BHXH, phiếu giấy, “check_overlap” đa hồ sơ, hoặc biến không có trong XML → **không ép** thành công thức giả; ghi nhận trong manifest `status: "blocked"` và giữ **OFF** + mô tả dữ liệu thiếu.

### 2.4. Quy tắc thuốc / XML2

- Nếu nghiệp vụ là thuốc: chuyển `PHAN_HE` logic sang **XML2** (`CURRENT` = dòng thuốc), hoặc tách sang bảng `LUAT_THUOC` / seed thuốc — không nhét vào XML3 nếu không có `MA_THUOC` trên dòng đó.

## 3. Lô triển khai (8 lô × ~75 mã)

| Lô | Khoảng `id` / STT | Trọng tâm | Đầu ra mỗi lô |
|----|-------------------|-----------|----------------|
| **1** | CHUYEN_DE-001 → ~075 | DVKT đơn: `MA_DV`/`TEN_DV` + XML1 `MA_GIOI_TINH`, `MA_BENH_CHINH`, `MA_BENH_KT` | PR chỉ sửa `luat_giam_dinh_chuyen_de_hardcoded.jsx` + cập nhật manifest |
| **2** | ~076 → ~150 | Cặp DVKT / `COUNT_IF` cùng `DS_XML3` | Kiểm tra hiệu năng `COUNT_IF` |
| **3** | ~151 → ~225 | Giường, `MA_GIUONG`, nội trú | Cần XML1 `MA_LOAI_KCB` + XML3 dòng giường |
| **4** | ~226 → ~300 | PT/TT, PTTT (mã gốc Excel → M05) | Phối hợp `dich_vu_ky_thuat` / DM BV |
| **5** | ~301 → ~375 | CDHA/CLS, `MA_MAY`, nhóm CĐHA | Đối chiếu `luat_cdha_hardcoded` tránh trùng |
| **6** | ~376 → ~450 | XN, chỉ định theo ICD | Token ICD trong `MA_BENH_KT` (regex giống THUOC_329) |
| **7** | ~451 → ~525 | Thuốc + tương tác XML2 | Tách hoặc `PHAN_HE` XML2 |
| **8** | ~526 → ~603 | Hành chính, đa BN, API — phần còn lại | Nhiều mục `blocked` dự kiến |

Số thứ tự “~” là chia đều; điều chỉnh theo nhóm nghiệp vụ khi làm thực tế.

## 4. Checklist cho mỗi mã (trước khi gộp PR)

- [ ] `DIEU_KIEN` không còn `ma_dvkt`, `ma_thuoc` (trừ khi đó là **tên cột XML** thật sau chuẩn hóa).
- [ ] Không còn hàm không tồn tại trong `ctx` (`has_dvkt`, `check_*` giả lập) trừ khi đã có `taoBoXuLyRuleDongDacBiet` cho `MA_LUAT` đó.
- [ ] Chạy thử `chuanHoaRuleDong` / một hồ sơ XML mẫu (hoặc script audit nội bộ) — không `ReferenceError`, không luôn false do thiếu trường.
- [ ] Cập nhật `scripts/chuyen_de_batch_manifest.json`: `status: "done"`, `commit` hoặc ngày.

## 5. Ví dụ mẫu (hướng dẫn — chưa gán cứng vào 603 dòng)

**Ý đồ nghiệp vụ:** Siêu âm đầu dò âm đạo cho bệnh nhân **nam** là không phù hợp.

- **Cũ (DSL):** `ma_dvkt == 'SIEU_AM_DAU_DO_AM_DAO' AND …`
- **Mới (hướng XML130):** trên từng dòng XML3, dùng giới tính XML1 và tên/mã DVKT thực tế, ví dụ:

```text
String(XML1.MA_GIOI_TINH) == '1'
AND (
  String(CURRENT.MA_DV) IN ('03.xxxx.xxxx','03.yyyy.yyyy')
  OR (
    String(CURRENT.TEN_DICH_VU).toUpperCase().includes('ĐẦU DÒ')
    AND String(CURRENT.TEN_DICH_VU).toUpperCase().includes('ÂM ĐẠO')
  )
)
```

Thay mã `03.xxxx…` bằng mã M05 đã thống nhất tại BV; phần `TEN_DICH_VU` chỉ là lớp dự phòng khi chưa có danh sách mã đầy đủ.

## 6. Tệp theo dõi

- `scripts/chuyen_de_batch_manifest.json` — trạng thái từng lô.
- `CHUYEN_DE_XML130_CONVERSION_VERSION` trong `luat_giam_dinh_chuyen_de_hardcoded.jsx` — đồng bộ phiên bản khi bắt đầu ghi nhận lô hoàn tất trong mã.

---

*Các phiên làm việc sau: mở một PR theo đúng một lô; cập nhật manifest và phiên bản; chạy kiểm thử giám định trên mẫu XML trước khi merge.*
