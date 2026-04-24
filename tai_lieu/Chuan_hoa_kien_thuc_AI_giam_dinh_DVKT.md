# Chuẩn hóa kiến thức giám định dịch vụ kỹ thuật (DVKT) cho AI

**Phiên bản:** 1.0  
**Ngày:** 09/04/2026  
**Vai trò:** Tài liệu **điểm vào** để AI (và người đào tạo) suy luận **thống nhất** về DVKT trong repo — bổ sung, không thay thế văn bản **17/VBHN-BYT**, **TT 39/2024**, Phụ lục Excel BYT và hợp đồng KCB.

---

## 1. Mục tiêu chuẩn hóa

- Giảm trường hợp AI **lẫn** ba nhóm mã: **`DVKT_*` (seed PTTT)**, **`CDHA_*` (hardcoded)**, **`DVKT-OP-*` (no-code)**.
- Bắt buộc **phân tầng**: điều kiện **tra được trên XML/mã** vs cần **hồ sơ / chuyên môn / BHXH chủ động**.
- Neo **mọi giải thích** về chuỗi pháp lý gợi ý trong engine (`CO_SO_PHAP_LY_DVKT`, `VBHN_17_META`) khi có — không **bịa** giá, %, hoặc dòng Phụ lục.

---

## 2. Nguyên tắc vàng (bất biến)

| # | Nguyên tắc | Hệ quả cho AI |
|---|------------|----------------|
| P1 | **Thời điểm hiệu lực** — đặc biệt **TT 39/2024** (nhiều điểm **01/01/2025**) | Luôn hỏi: chỉ định / ra viện / ngày y lệnh thuộc mốc nào trước khi áp khung **4a–4d**, **khoản 7 Điều 4**. |
| P2 | **Danh mục 1 / 2 / 3** — đọc đúng **cột điều kiện** (thường **Cột 3**) | Có `MA_DICH_VU` **chưa đủ**; phải đối chiếu điều kiện dòng trong Phụ lục đính kèm VBHN (số cột lấy **đúng file** Excel). |
| P3 | **Engine ≠ toàn bộ Phụ lục** | Chỉ một phần dòng được rule hóa; còn lại cần **giám định viên** + tài liệu đơn vị. |
| P4 | **Giá đã/không kết cấu** (Điều **4a** + mô tả gói) | Khi đồng thời có ngày giường, DVKT, VTYT, thuốc — hỏi: khoản nào **đã gộp** trong giá DV/giường? |
| P5 | **Kết luận pháp lý cuối** | AI chỉ **hỗ trợ**; người có thẩm quyền + BHXH quyết định thanh toán/xuất toán. |

---

## 3. Quy trình suy luận chuẩn (7 bước)

Áp dụng cho **mỗi dòng / nhóm DVKT** cần phân tích:

1. **Neo thời điểm:** Ngày vào, ra, ngày y lệnh DV (XML1/XML3) — có cắt mốc **HL TT 39** không?
2. **Neo mã:** `MA_DICH_VU` (XML3, nhóm **M05**) — có trong **DM1/2** hay rơi **DM3** (tạm chưa TT)?
3. **Neo điều kiện dòng:** Cột điều kiện / ghi chú Phụ lục (không đoán số cột nếu không mở đúng file Excel).
4. **Neo tiền:** `DON_GIA`, `TYLE_TT`, `THANH_TIEN_BH` — đối chiếu đối tượng thẻ (XML1) và mô tả **đã bao / chưa bao** thuốc–VT.
5. **Neo liên XML:** XML1 (loại KCB, ICD, ngày); XML3 (dòng DV); XML5/6 nếu PTTT hoặc tranh chấp chỉ định.
6. **Neo nguồn cảnh báo engine:** Phân loại rule — bảng mục **4** dưới đây.
7. **Diễn giải:** Dùng `co_so_phap_ly` / `VBHN_17` nếu có; nếu trống, vẫn dẫn **Điều/Khoản** từ thẻ tri thức [The_tri_thuc_giam_dinh_DVKT_VBHN_17_BYT.md](./The_tri_thuc_giam_dinh_DVKT_VBHN_17_BYT.md), **không** chế tạo số liệu.

---

## 4. Ma trận nguồn rule trong repo (nhận diện nhanh)

| Dạng `ma_luat` | File / nguồn chính | Ý nghĩa tối thiểu |
|----------------|--------------------|-------------------|
| `DVKT_` + số | `du_lieu_luat_pttt_muc11.jsx` (+ `dong_co_giam_dinh.jsx`) | Gói PT/TT, ICD, thuốc kèm gói — điều kiện seed theo dòng |
| `CDHA_` + số | `luat_cdha_hardcoded.jsx` | CĐHA, XN, máy, MRI, JCI… — tập trung **XML3/XML4** và thiết bị |
| `DVKT-OP-` + số | `dvkt_op_giam_dinh.jsx` (`DEFAULT_DVKT_RULES`, operator) | Toán tử **CHECK_*** trên danh mục M05 nội bộ, giá, ICD mapping, … |

Chi tiết ca mẫu: [Bang_neo_phien_huan_luyen_dvkt_va_engine.md](./Bang_neo_phien_huan_luyen_dvkt_va_engine.md).

---

## 5. Checklist AI trước khi khẳng định “sai / xuất toán”

- [ ] Đã xác định **thời điểm** áp quy định (đặc biệt sau **31/12/2024**)?
- [ ] Đã đọc **điều kiện Cột 3** (hoặc tương đương) của **đúng dòng** Phụ lục — không chỉ nhìn mã DV?
- [ ] Đã kiểm tra **trùng / gộp công đoạn** (Điều 4 khoản 4) khi có nhiều DV cùng kỳ?
- [ ] Đã phân biệt cảnh báo **dữ liệu** (mã máy, thiếu XML) vs **chuyên môn / chủ động**?
- [ ] Đã ghi nhận giới hạn: **rule tắt / OFF** hoặc **thiếu seed** có thể làm im cảnh báo đáng lẽ cần người xem?

---

## 6. Tài liệu và lộ trình học trong repo (thứ tự)

0. **Kỹ năng chung (mọi nhóm rule):** [Ky_nang_cot_loi_giam_dinh_AI_BHYT.md](./Ky_nang_cot_loi_giam_dinh_AI_BHYT.md) · [Bai_tap_phat_trien_ky_nang_giam_dinh_AI.md](./Bai_tap_phat_trien_ky_nang_giam_dinh_AI.md) — nên đọc/làm **trước** khi đi sâu DVKT.  
1. Thẻ tri thức: [The_tri_thuc_giam_dinh_DVKT_VBHN_17_BYT.md](./The_tri_thuc_giam_dinh_DVKT_VBHN_17_BYT.md)  
1b. **Danh mục 1 / 2 chi tiết (VBHN 17):** [The_tri_thuc_Danh_muc_1_DVKT_dieu_kien_ty_le_gia_VBHN17_AI.md](./The_tri_thuc_Danh_muc_1_DVKT_dieu_kien_ty_le_gia_VBHN17_AI.md) · [The_tri_thuc_Danh_muc_2_DVKT_dieu_kien_thanh_toan_VBHN17_AI.md](./The_tri_thuc_Danh_muc_2_DVKT_dieu_kien_thanh_toan_VBHN17_AI.md)  
2. **Kiểm soát lỗi DVKT (phân loại cảnh báo):** [The_tri_thuc_kiem_soat_loi_dvkt_VBHN17_AI.md](./The_tri_thuc_kiem_soat_loi_dvkt_VBHN17_AI.md)  
3. Chuỗi pháp lý tóm: [The_tri_thuc_mau_luat_BHYT_2008_2025.md](./The_tri_thuc_mau_luat_BHYT_2008_2025.md) mục **11.5**  
4. Phiên huấn luyện (bảng Điều + ca): [Huan_luyen_phien_DVKT_VBHN17_Cursor.md](./Huan_luyen_phien_DVKT_VBHN17_Cursor.md) — mục **A–J** (mục **I** = thứ tự ca; **J** = kiểm soát lỗi)  
5. Lộ trình tổng **Đợt 4**: [Lo_trinh_huan_luyen_AI_giam_dinh_BHYT.md](./Lo_trinh_huan_luyen_AI_giam_dinh_BHYT.md) mục **4 — Bước 3**

---

## 7. Kiểm thử (QA) sau khi chỉnh rule / seed DVKT

Trong terminal repo:

- `npm run qa:audit-fixtures` — đủ 10 file `test_xml/`, MA_LK khớp  
- `npm run qa:on-off-match` — mẫu ON/OFF ổn định  

Chi tiết: [Huan_luyen_phien_DVKT_VBHN17_Cursor.md](./Huan_luyen_phien_DVKT_VBHN17_Cursor.md) mục **F**.

---

## 8. Liên kết vận hành

- Quy trình Cursor + OpenClaw: [Quy_trinh_lam_viec_Cursor_OpenClaw_AI_giam_dinh_BHYT.md](./Quy_trinh_lam_viec_Cursor_OpenClaw_AI_giam_dinh_BHYT.md)  
- Phiên làm việc chung: [Phien_lam_viec_chung_Cursor_va_OpenClaw.md](./Phien_lam_viec_chung_Cursor_va_OpenClaw.md)
- Kỹ năng cốt lõi (mọi nhóm rule): [Ky_nang_cot_loi_giam_dinh_AI_BHYT.md](./Ky_nang_cot_loi_giam_dinh_AI_BHYT.md)  
- Bài tập thực hành: [Bai_tap_phat_trien_ky_nang_giam_dinh_AI.md](./Bai_tap_phat_trien_ky_nang_giam_dinh_AI.md)
- Chuẩn hóa **VTYT** (vật tư — kết cấu với DVKT): [Chuan_hoa_kien_thuc_AI_giam_dinh_VTYT.md](./Chuan_hoa_kien_thuc_AI_giam_dinh_VTYT.md)  
- Bảng neo VTYT ↔ engine: [Bang_neo_phien_huan_luyen_vtyt_va_engine.md](./Bang_neo_phien_huan_luyen_vtyt_va_engine.md)

---

*Tài liệu này tóm tắt **chuẩn hóa hành vi suy luận**; cập nhật khi đổi cấu trúc rule DVKT hoặc bổ sung ca mẫu mới.*
