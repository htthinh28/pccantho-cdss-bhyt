# Phiên huấn luyện AI — CDSS phác đồ Chuyên môn (FileMau v4)

**Mục tiêu:** neo quy trình nạp **FileMau_PhacDo_CDSS 4.xlsx**, quy tắc **CDSS_CM_01/02**, giám định thực chiến và tích lũy tri thức từ kết quả giám định.

---

## 1. Nhập CDSS vào module Chuyên môn

1. Mở **Tổng quan → Chuyên môn → Phác đồ Phương Châu** (component `PhacDoBenhVien`).
2. Trên Web: **Import** file `FileMau_PhacDo_CDSS 4.xlsx` (sheet `Template`); dữ liệu gộp với bảng hiện có — **ưu tiên nội dung file mới** cho trùng mã ICD (`phac_do_cdss_columns.js`).
3. **Developer / đồng bộ repo:** chạy từ thư mục gốc dự án:
   ```bash
   npm run phac-do:rebuild-seed -- "C:/đường/dẫn/FileMau_PhacDo_CDSS 4.xlsx"
   ```
   Cập nhật `ma_nguon/chuyen_mon/phac_do_benh_vien/du_lieu_phac_do_cdss_guidelines.seed.json` (gộp với seed cũ, không tự xóa mã chỉ có ở kho trước).

---

## 2. Quy tắc giám định (Luật dữ liệu — seed)

| Mã | Mặc định | Ý nghĩa (đã chuẩn hóa) |
|----|----------|-------------------------|
| **CDSS_CM_01** | ON (Info) | Chỉ xác nhận **có khóa ICD trên XML1 trùng bảng phác đồ** — nhắc tra cứu thủ công; **không** so nội dung phác đồ với thuốc/DVKT. |
| **CDSS_CM_02** | OFF (Warning) | Có kho nhưng **không khóa ICD nào** trùng — gợi ý bổ sung dữ liệu; không kết luận sai điều trị. |

Nguồn seed: `ma_nguon/tien_ich/du_lieu_luat_du_lieu_muc1.jsx`. Chi tiết giới hạn kỹ thuật: **§4.1** trong `The_tri_thuc_phac_do_CDSS_chuyen_mon_ICD10_AI.md`. Bật/tắt tại **Quản lý quy tắc ON/OFF**.

---

## 3. Tri thức huấn luyện AI (thẻ chuẩn)

- **The_tri_thuc_phac_do_CDSS_chuyen_mon_ICD10_AI.md** — vai trò CDSS vs DM DVKT, ánh xạ XML1 ↔ cột phác đồ, hàm engine, prompt mẫu.
- **Phuong_an_trien_khai_Phac_do_Chuyen_mon_CLS_kiem_soat_chuoi.md** — kiểm soát theo chuỗi chẩn đoán → CLS → thuốc/DVKT → tái khám; tầng rule có cấu trúc + giao việc AI (schema I/O).
- Sau chỉnh sửa: `npm run tai_lieu:prepare` để đồng bộ `public/tai_lieu/`.

---

## 4. Kho tri thức trong ứng dụng

- **Bảng phác đồ:** AsyncStorage / IndexedDB — khóa `CDSS_DATA_PHAC_DO_V3`, `CDSS_COLS_PHAC_DO_V3`.
- **Tri thức từ giám định:** màn **Tri thức từ giám định** (`tri_thuc_tu_giam_dinh.jsx`) — ghi bài học / xác nhận đúng-sai cảnh báo sau khi chạy engine trên hồ sơ.

---

## 5. Giám định thực chiến (CLI + thư mục `tai_nguyen/ip`)

Script `run_claim_audit.js` đã nạp **luật dữ liệu đầy đủ** và **kho phác đồ** từ seed JSON (để rule CDSS_CM hoạt động giống app).

```bash
node scripts/run_claim_audit.js "tai_nguyen/ip/<file>.xml" --out=test_xml/audit_<ma>.json --focus=CDSS_CM_01,CDSS_CM_02
```

**Lưu ý:** Cảnh báo **CDSS_CM_01** chỉ xuất hiện khi mã ICD đã gom từ XML1 **trùng** một khóa trong `MAP_PHAC_DO_CDSS` (chuẩn hóa bỏ dấu chấm). Ví dụ hồ sơ có chẩn đoán **A04.9** → khóa **A049**; nếu kho chỉ có dòng **A04** hoặc **A49** (khác nội dung chuẩn), engine có thể **không** bật Info — đó là hành vi đúng thiết kế, không phải lỗi import.

---

## 6. Kết quả giám định → kinh nghiệm cho AI

1. Sau khi xem cảnh báo trên **Chi tiết ca bệnh** hoặc file audit JSON, giám định viên ghi nhận tại **Tri thức từ giám định** (tóm tắt, bài học, tùy chọn JSON xác nhận đúng/sai từng mã luật).
2. Dữ liệu cục bộ (`CDSS_TRI_THUC_GD_V1`) phục vụ RAG / đọc lại trong module Trợ lý tri thức — **không** thay thế quyết định pháp lý; dùng để huấn luyện và cải thiện độ phù hợp rule theo thời gian.

---

## Trạng thái nạp mẫu (11/04/2026)

- **File nguồn:** `FileMau_PhacDo_CDSS 4.xlsx` (sheet `Template`, 100 dòng dữ liệu sau dòng mẫu).
- **Seed sau gộp:** **348** mã ICD duy nhất trong `du_lieu_phac_do_cdss_guidelines.seed.json`.
- **Audit mẫu:** `test_xml/audit_ip_sample_cdss_cm_20260411.json` — ví dụ **CDSS_CM_01 = 0** trên một hồ sơ IP khi ICD chuẩn hóa không trùng kho (xem mục 5).
