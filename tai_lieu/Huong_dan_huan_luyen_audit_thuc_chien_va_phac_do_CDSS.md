# HƯỚNG DẪN: HUẤN LUYỆN AI THỰC CHIẾN — BÁO CÁO VI PHẠM + HỒ SƠ `ip` + PHÁC ĐỒ CDSS

Phiên bản: 1.0 · Cập nhật: 11/04/2026  

## 1. Mục đích

Kết hợp **kết quả giám định xuất ra Excel** (sheet `DS_Loi`) với **hồ sơ XML thật** trong `tai_nguyen/ip/` và **kho phác đồ CDSS** (`du_lieu_phac_do_cdss_guidelines.seed.json`) để:

- Neo **mã lượt (`Mã LK`)** ↔ file XML ↔ **ICD chính** ↔ **có/không có phác đồ** cho ICD đó;
- Phát hiện **cảnh báo hàng loạt** (cùng mã luật lặp lại nhiều lần) trước khi đưa vào huấn luyện;
- Kiểm soát **dương tính giả** và quyết định **có nên ghi nhận** một loại lỗi làm “bài học hệ thống” hay không.

**Không** thay thế quyết định của giám định viên; dữ liệu nhạy cảm (họ tên, số thẻ) **không** đưa vào file JSON sinh bởi script (chỉ `MA_LK`, mã luật, đường dẫn file).

---

## 2. Sinh file nối (máy cục bộ)

Sau khi có file báo cáo (ví dụ `Bao_Cao_Vi_Pham_*.xlsx` trong Downloads):

```bash
node scripts/huan_luyen_merge_audit_bao_cao_voi_ip.mjs "C:/Users/admin/Downloads/Bao_Cao_Vi_Pham_1775878431265.xlsx" ip
```

Hoặc:

```bash
npm run huan-luyen:merge-audit-ip -- "C:/Users/admin/Downloads/Bao_Cao_Vi_Pham_1775878431265.xlsx" ip
```

**Output:** `tai_lieu/_huan_luyen_merge_audit_neo_ip.json` (mặc định **gitignore** — không push nếu chính sách không cho phép lộ `MA_LK`).

Nội dung gồm: `thong_ke`, `canh_bao_hang_loat_de_ra_soat`, `chi_tiet_theo_ma_lk` (cờ `co_phac_do_cdss_cho_icd_chinh`, `relPath`, danh sách `ma_luat`).

---

## 3. Ứng dụng tri thức phác đồ CDSS trong thực chiến

| Bước | Việc làm |
|------|----------|
| 1 | Đọc `chi_tiet_theo_ma_lk[]`: với từng `ma_lk` có `relPath`, mở đúng file trong repo (hoặc import vào CDSS). |
| 2 | So **ICD chính trên XML1** với cột phác đồ — nếu `co_phac_do_cdss_cho_icd_chinh: true`, AI có thể đối chiếu **mục tiêu điều trị / điều trị đặc hiệu** với XML2/XML3 (xem [The_tri_thuc_phac_do_CDSS_chuyen_mon_ICD10_AI.md](./The_tri_thuc_phac_do_CDSS_chuyen_mon_ICD10_AI.md)). |
| 3 | Phân biệt **cảnh báo thanh toán/hành chính** (DM, luật thuốc/DVKT) với **gợi ý chuyên môn phác đồ** — hai lớp câu hỏi khác nhau; không gộp kết luận. |
| 4 | Ghi bài học có nhãn vào kho động: màn **Chi tiết ca bệnh** → xác nhận **Đúng/Sai** cảnh báo → export qua [Goi_du_lieu_huan_luyen_AI_thuc_chien.md](./Goi_du_lieu_huan_luyen_AI_thuc_chien.md) (`CDSS_TRI_THUC_GD_V1`). |

---

## 4. Kiểm soát dương tính giả (false positive)

- **Đơn ca:** ưu tiên xác nhận thủ công trên **Chi tiết ca bệnh**; chỉ dùng cảnh báo làm nhãn huấn luyện khi đã có **kết luận Đúng/ Sai** gắn `ma_luat`.
- **Nghi ngờ FP:** đối chiếu XML đúng trường rule (`Chi tiết XML vi phạm` trên báo cáo), đọc lại điều kiện trong **Thiết lập quy tắc**; ghi chú vào `bai_hoc` / tắt rule tạm nếu cấu hình sai dữ liệu nguồn.

---

## 5. Lỗi hàng loạt (cùng mã luật trên nhiều hồ sơ)

Trường `canh_bao_hang_loat_de_ra_soat` trong JSON liệt kê các **mã luật** có tần suất cao (ngưỡng script: ≥80 lần hoặc ≥3% tổng dòng báo cáo).

**Trước khi ghi nhận là “lỗi nghiệp vụ lặp lại” cho AI:**

1. Kiểm tra **đúng một lần** trên mẫu nhỏ: rule có bám đúng dữ liệu XML130 / danh mục nội bộ không?
2. Nếu **đúng chuyên môn** (ví dụ cùng chỉ định sai trong đợt KCB): có thể tóm tắt **một** thẻ tri thức chung + vài `MA_LK` minh họa — tránh nhân bản 151 lần cùng một câu.
3. Nếu **sai cấu hình rule / sai mapping**: ưu tiên **sửa engine hoặc tắt rule**; **không** huấn luyện AI “học theo” lỗi hàng loạt do lỗi kỹ thuật.

---

## 6. Liên kết

- Gói dữ liệu tổng: [Goi_du_lieu_huan_luyen_AI_thuc_chien.md](./Goi_du_lieu_huan_luyen_AI_thuc_chien.md)  
- Phác đồ CDSS: [The_tri_thuc_phac_do_CDSS_chuyen_mon_ICD10_AI.md](./The_tri_thuc_phac_do_CDSS_chuyen_mon_ICD10_AI.md)  
- XML thực: [Huong_dan_tai_nguyen_XML_thuc_chien_AI.md](./Huong_dan_tai_nguyen_XML_thuc_chien_AI.md)

---

*Tài liệu cố định quy trình; file JSON nối báo cáo chỉ là công cụ — quyết định ghi nhận bài học thuộc giám định viên và chính sách đơn vị.*
