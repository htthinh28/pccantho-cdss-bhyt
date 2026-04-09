# Test AI giám định BHYT — 10 ca (phần tiếp theo)

Phiên bản: 2.1  
Ngày cập nhật: 06/04/2026  

Tài liệu này **bổ sung** cho `Danh_sach_10_ca_test_va_du_lieu_chi_tiet.md`: bảng snapshot đồng bộ với JSON trong repo, chi tiết **CA 7–10**, prompt mẫu và cách chạy kiểm tra fixture tự động.

---

## 1. Kiểm tra fixture nhanh (Node)

Trước khi chấm AI, xác nhận 10 file audit chuẩn còn đủ và `meta.ma_lk` khớp tên file:

```bash
npm run qa:audit-fixtures
```

Script: `scripts/qa_audit_fixtures.js` (danh sách đường dẫn cố định trong `test_xml/`).

---

## 2. Snapshot cảnh báo theo file JSON (đối chiếu khi test)

Số liệu dưới đây lấy từ `meta.total_warnings` / `unique_rule_codes` trong từng file tại thời điểm cập nhật tài liệu. Khi chỉnh luật, chạy lại `qa:audit-fixtures` và cập nhật bảng nếu cần.

| STT | MA_LK | File audit | Tổng cảnh báo | Số mã luật khác nhau |
|-----|--------|------------|---------------|------------------------|
| 1 | 403521 | audit_403521_20260405_225230.json | 8 | 8 |
| 2 | 000339 | audit_000339_20260405_232511.json | 14 | 14 |
| 3 | 403538 | audit_403538_20260405_145119.json | 47 | 19 |
| 4 | 000589 | audit_000589_20260405_232716.json | 8 | 7 |
| 5 | OP26000908 | audit_OP26000908_20260405_232932.json | 11 | 8 |
| 6 | 403244 | audit_403244_20260405_224614.json | 11 | 11 |
| 7 | 000308 | audit_000308_20260405_083942.json | 8 | 6 |
| 8 | 000375 | audit_000375_20260405_065828.json | 6 | 5 |
| 9 | 000376 | audit_000376_20260404_174042.json | 35 | 13 |
| 10 | 000502 | audit_000502_20260404_192348.json | 6 | 6 |

**Ghi chú CA 1 (403521):** Trong snapshot hiện tại, engine vẫn báo **8** cảnh báo (PTTT, hành chính, v.v.). Nếu mục tiêu bài test là “hồ sơ sạch”, cần **tách** khỏi file này hoặc tái sinh audit sau khi chỉnh rule — đừng dạy AI rằng 403521 luôn 0 lỗi nếu JSON thực tế khác.

---

## 3. CA 7 — MA_LK `000308`

- **File:** `test_xml/audit_000308_20260405_083942.json`
- **Bối cảnh:** Nội trú; có PT lấy thai lần 2+ (`13.0002.0672_GT`), thuốc Biofazolin, lỗi hồ sơ/ngày.
- **Mã luật (unique):** `DVKT_2587`, `DVKT_2588`, `HC_130`, `HC_171`, `HD_10`, `THUOC_391` (có thể thêm dòng XML chi tiết trong `warnings[]`).
- **Prompt mẫu:**

```
Giám định hồ sơ MA_LK=000308 theo 5 bước Nghị định 188/2025.
Đọc audit: test_xml/audit_000308_20260405_083942.json.
1) Nêu 5 bước và kết luận từng bước.
2) Liệt kê các nhóm lỗi: chỉ định PT vs mã O82; gói PT thiếu thuốc tê/mê; HC_130, HC_171, HD_10; THUOC_391.
3) Phân loại: hành chính / thanh toán / chỉ định lâm sàng.
4) Căn cứ: QĐ 130, NĐ 188 (không bịa mã không có trong audit).
```

**Chấm điểm gợi ý:** đủ 5 bước; nhận diện ≥5/6 nhóm mã; không nhầm với bản audit khác timestamp (`085142` có 12 cảnh báo — chỉ dùng một file làm chuẩn).

---

## 4. CA 8 — MA_LK `000375`

- **File:** `test_xml/audit_000375_20260405_065828.json`
- **Mã luật (unique):** `DVKT-OP-09` (2 dòng), `HC_171`, `HC_46`, `HC_68`, `HD_10`
- **Prompt mẫu:**

```
Với MA_LK=000375 và audit audit_000375_20260405_065828.json: giải thích vì sao có HC_171, HD_10 và các mã DVKT-OP-09, HC_46, HC_68; đề xuất thứ tự xử lý khi làm việc với BHXH.
```

---

## 5. CA 9 — MA_LK `000376`

- **File:** `test_xml/audit_000376_20260404_174042.json`
- **Độ phức tạp:** **35** cảnh báo (Critical/Error/Warning) — ca “stress test”.
- **Prompt mẫu:**

```
Case 000376: tổng hợp ý theo 5 bước giám định; không liệt kê hết 35 dòng. Nhóm theo: hành chính XML, danh mục DVKT/thuốc, PTTT/lâm sàng, hợp đồng JCI (HD_*). Nêu 5 lỗi có hệ quả thanh toán lớn nhất (suy luận từ nội dung cảnh báo).
```

---

## 6. CA 10 — MA_LK `000502`

- **File:** `test_xml/audit_000502_20260404_192348.json`
- **Đúng 6 cảnh báo, 6 mã:** `CDHA_164`, `CLN-GIUONG-01`, `HC_130`, `HC_171`, `HC_65`, `HD_10`
- **Bối cảnh ngắn:** Nội trú Phụ-Sản; MRI chờ >3 ngày; ngày giường XML3 vs `SO_NGAY_DTRI`; thiếu XML5; `NGAY_TTOAN` < `NGAY_RA`; XN thiếu chỉ số bình thường.
- **Prompt mẫu:**

```
MA_LK=000502: audit phát hiện đúng 6 mã [CDHA_164, CLN-GIUONG-01, HC_130, HC_171, HC_65, HD_10].
Yêu cầu AI giải thích từng mã, map sang XML1/3/4/5, và kết luận mức độ rủi ro xuất toán (không cần tính tiền nếu không có dữ liệu giá trong prompt).
```

**Kỳ vọng:** AI phát hiện ≥5/6 mã và phân loại đúng hướng (CDHA/quản trị vs hành chính vs JCI).

---

## 7. CA 1–6 (nhắc ngắn)

Chi tiết ngữ cảnh và bảng chọn ca “tối nay” xem `Danh_sach_10_ca_test_va_du_lieu_chi_tiet.md` mục 2–3. Luôn mở đúng **tên file** trong cột snapshot ở mục 2 của tài liệu này.

---

## 7b. Huấn luyện thuốc mở rộng (ngoài 10 ca chuẩn)

Dùng khi cần **tối đa độ phủ** rule `THUOC_*` / built-in `CLN-THUOC-*` / `DM-THUOC-*`:

- **Bản đồ engine:** `The_tri_thuc_chi_muc_giam_dinh_thuoc_engine_AI.md`
- **Ca nội trú:** `audit_PC022300479_IP26000139.json` + `Ca_huan_luyen_mau_IP26000139_DOMUVAR_THUOC_63_va_THUOC_417_noi_tru.md`
- **Cập nhật danh sách ca phụ:** `Danh_sach_10_ca_test_va_du_lieu_chi_tiet.md` (mục sau bảng 10 ca)

---

## 8. Bảng chấm điểm tóm tắt (điền khi chạy test thủ công)

| STT | MA_LK | Đủ 5 bước NĐ188 | Bám sát mã trong JSON | Phân loại lỗi | Căn cứ pháp lý | Ghi chú |
|-----|--------|-----------------|------------------------|---------------|----------------|---------|
| 7 | 000308 | ☐ | ☐ | ☐ | ☐ | |
| 8 | 000375 | ☐ | ☐ | ☐ | ☐ | |
| 9 | 000376 | ☐ | ☐ | ☐ | ☐ | |
| 10 | 000502 | ☐ | ☐ | ☐ | ☐ | |

---

## 9. So với phiên bản 1.0 (đã thay thế)

- Phiên bản cũ dùng nhánh “CA 4–13” không khớp danh sách 10 ca trong `Danh_sach_*`, và một số **số lỗi** (ví dụ 000308 = 8 hay 12) lệch theo **file audit** khác timestamp.
- Từ 2.0 trở đi, **một file audit cố định** cho mỗi STT (trùng với `qa_audit_fixtures.js`).
