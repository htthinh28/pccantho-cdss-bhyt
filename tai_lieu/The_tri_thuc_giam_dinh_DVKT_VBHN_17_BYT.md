# THẺ TRI THỨC: GIÁM ĐỊNH DỊCH VỤ KỸ THUẬT (DVKT) THEO 17/VBHN-BYT

Phiên bản tài liệu: 1.2  
Ngày cập nhật: 10/04/2026  
Đối tượng: huấn luyện AI giám định, chuẩn hóa nguyên tắc — **không thay thế** văn bản gốc Bộ Y tế / BHXH.

---

## 1. Mục đích và phạm vi

### 1.1. Mục đích

Cung cấp cho AI (và người đào tạo) **khung tri thức** để:

- Hiểu **chuỗi văn bản** BHYT về **thanh toán DVKT** (điều kiện, tỷ lệ, giá, trùng lặp công đoạn, khám nhiều chuyên khoa, ngày giường, v.v.).
- Phân biệt **giám định tự động trên XML** (mã dịch vụ, giá, tuyến, thời gian) với **giám định chủ động / hồ sơ** (hợp lý chuyên môn, quy trình).
- **Chuẩn hóa cách dẫn chiếu** khi giải thích: ưu tiên **17/VBHN-BYT** + các TT sửa đổi được hợp nhất + **thời điểm hiệu lực** (đặc biệt **TT 39/2024** — nhiều điểm từ **01/01/2025**).

### 1.2. Phạm vi dữ liệu trong hồ sơ điện tử (CDSS)

- DVKT trong luồng XML thường gặp ở **XML3** (nhóm **M05** — `MA_DICH_VU`, `TEN_DICH_VU`, `DON_GIA`, `TYLE_TT`, `THANH_TIEN_BH`, …) và liên kết **XML1** (loại KCB, ngày vào/ra, chẩn đoán), **XML5** (diễn biến), **XML6** (PTTT — tùy ca).

### 1.3. Ranh giới an toàn (bắt buộc đọc)

| Làm | Không làm trong phạm vi “thẻ tri thức + huấn luyện” |
|-----|---------------------------------------------------|
| Dùng tài liệu này để **diễn giải**, **phân loại cảnh báo**, **gợi ý điều khoản** | **Sửa** `dong_co_giam_dinh.jsx`, **rule engine DVKT**, seed luật **nếu không có** review QA và yêu cầu riêng |
| Neo vào **mã luật có sẵn** (`DVKT_*`, `CDHA_*`, …) khi ví dụ | Coi **mỗi dòng Phụ lục** đã được mã hóa đủ trong engine — thực tế danh mục **rất lớn**, chỉ một phần được rule hóa |
| Giữ thứ tự ưu tiên: **Văn bản gốc BYT** → VBHN → TT sửa đổi → hợp đồng KCB | **Bịa** mức giá / % cụ thể nếu không có trong hồ sơ hoặc bảng giá đơn vị |

**Hệ thống hiện tại** đã có chuỗi cơ sở pháp lý gợi ý trong mã (đọc, không bắt buộc sửa): `CO_SO_PHAP_LY_DVKT`, `VAN_BAN_HANH_CHINH_HIEN_HANH.VBHN_17`, `VBHN_17_META` trong `dvkt_op_giam_dinh.jsx` / `dong_co_giam_dinh.jsx`.

---

## 2. Nguồn gốc văn bản

### 2.1. Văn bản hợp nhất gốc

- **Thông tư hợp nhất [17/VBHN-BYT năm 2024](https://thuvienphapluat.vn/van-ban/Bao-hiem/Van-ban-hop-nhat-17-VBHN-BYT-2024-Thong-tu-dieu-kien-thanh-toan-dich-vu-ky-thuat-y-te-bao-hiem-638186.aspx)** — *Ban hành Danh mục và tỷ lệ, điều kiện thanh toán đối với dịch vụ kỹ thuật y tế thuộc phạm vi được hưởng của người tham gia BHYT* (Bộ Y tế, ngày **31/12/2024**).
- File đính kèm người dùng **`17_VBHN-BYT_638186.doc`**: định dạng **.doc** (Word cũ) — trong môi trường dev **không trích xuất trực tiếp** được nội dung. Khuyến nghị:
  - Lưu **.docx** hoặc xuất **PDF** từ Bộ Y tế / Công báo, **hoặc**
  - Dùng script dự án: `node scripts/extract_docx_plain.js <file.docx> [out.txt]` (chỉ **.docx**).

### 2.2. Các văn bản được hợp nhất trong 17/VBHN (tóm tắt)

| Văn bản | Vai trò |
|---------|---------|
| **TT 35/2016/TT-BYT** | Khung gốc: Danh mục 1 & 2, điều kiện, tỷ lệ, giá |
| **TT 50/2017/TT-BYT** | Sửa đổi quy định liên quan thanh toán KCB |
| **TT 13/2020/TT-BYT** | Sửa đổi TT 35/2016 (DVKT) |
| **TT 39/2024/TT-BYT** | Sửa đổi TT 35/2016 — nhiều điều **Điều 4a–4d**, **khoản 7 Điều 4** (một lượt KCB), … — **HL 01/01/2025** cho các phần được ghi |

Khi tra cứu **một dòng** trong Phụ lục: luôn hỏi **“tại thời điểm nào”** (ngày chỉ định / ngày ra viện) để áp đúng bản sửa.

---

## 3. Cấu trúc logic của Thông tư (ánh xạ “mỗi điều = một lớp nguyên tắc”)

> **Nguyên tắc huấn luyện:** Mỗi **Điều / Điều bổ sung (4a–4d)** tương ứng một **lớp kiểm tra** trong tư duy giám định. **Mỗi dòng** trong Danh mục 1 hoặc 2 là **một quy tắc chi tiết** gắn với **mã dịch vụ** — có thể biến thể theo **ghi chú cột**, **phụ lục Excel BYT**, và **hợp đồng KCB** tại CSKCB.

### 3.1. Điều 1 — Phạm vi danh mục DVKT được hưởng

| Khối nội dung | Ý nghĩa giám định | Gợi ý dữ liệu / XML |
|---------------|-------------------|---------------------|
| Khoản 1 — các nhóm dịch vụ (khám, chữa bệnh, PHCN, thai…) trừ trường hợp **Điều 23 Luật BHYT** | DVKT phải thuộc phạm vi **được phép** và **không** thuộc loại **loại trừ** theo luật | XML1 đối tượng, loại KCB; đối chiếu danh mục từ chối BHYT (luật) |
| Điểm a — TT 43/2013, TT 21/2017 (phân tuyến kỹ thuật) | Dịch vụ phải **đúng tuyến / đúng phạm vi kỹ thuật** CSKCB | `MA_CSKCB`, hạng BV, nhóm `MA_NHOM` / dịch vụ trong DM |
| Điểm b — TT 50/2014 (PTTT) | PTTT: phân loại **phẫu thuật / thủ thuật**, định mức nhân lực | XML3 + XML6 / XML1 `MA_PTTT_QT` (tùy mẫu hồ sơ) |
| Điểm c — DVKT phê duyệt chưa có trong 43/50 | **Kỹ thuật mới tại CS** — điều kiện TT riêng | Cần chứng từ phê duyệt; thường **giám định chủ động** |
| Khoản 2 — **Danh mục 1, 2, 3** | DM1: điều kiện + tỷ lệ + **giá**; DM2: **điều kiện**; DM3: **chưa TT** | `MA_DICH_VU` khớp cột mã trong Phụ lục Excel |

**Quy tắc AI:** Luôn hỏi: *Dịch vụ có trong **Danh mục 1/2** không? Thuộc **Danh mục 3** (tạm chưa TT) không?*

### 3.2. Điều 2 — Tỷ lệ thanh toán

| Nội dung | Ý nghĩa | Gợi ý XML |
|----------|---------|-----------|
| Cột 4 Danh mục 1 — tỷ lệ % | **TYLE_TT** / cách tính thành tiền BHYT | XML3 `TYLE_TT`, `THANH_TIEN_BH` |
| Giá đã **bao** thuốc/VTYT trong DVKT | **Không** tách TT trùng cho thuốc/VT đã kết cấu | Đối chiếu mô tả giá + Điều 4a |
| Giá **chưa bao** thuốc/VTYT | TT DVKT theo TT này; thuốc/VT theo **TT danh mục thuốc/VT** | XML2 + XML3 tách dòng |

**Quy tắc AI:** Phân tầng: (1) tỷ lệ theo **cột Phụ lục** → (2) mức hưởng thẻ / đối tượng (Luật BHYT) → (3) đồng chi trả.

### 3.3. Điều 3 — Điều kiện thanh toán (điều kiện “khung”)

| Điều kiện khoản 1 | Diễn giải ngắn | Gợi ý kiểm tra |
|-------------------|----------------|----------------|
| a) Được phê duyệt thực hiện **tại CS** | DVKT phải nằm trong phạm vi được duyệt | Danh mục BYT + hợp đồng KCB |
| b) Theo **quy trình chuyên môn** đã phê duyệt; gửi QTDH đến **BHXH tỉnh** khi ban hành nội bộ | Phần lớn **chủ động** khi tranh chấp chỉ định | XML5, hồ sơ bệnh án, văn bản CS |
| c) Giá DVKT được **phê duyệt** | Khớp giá trong hợp đồng / quyết định giá | XML3 `DON_GIA`, đối chiếu bảng giá |

| Khoản 2 | DM1 & DM2: thêm điều kiện **Cột 3** (và DM1 còn có giá/tỷ lệ cột khác) | **Mỗi dòng Cột 3** = một (hoặc nhiều) điều kiện có thể mã hóa dần thành rule |

### 3.4. Điều 4 — Hướng dẫn thanh toán (công thức & loại trừ trùng)

Các điểm then chốt cho AI:

- **Khoản 2–3:** Công thức quỹ TT / người bệnh theo **giá × mức hưởng × tỷ lệ** (và trường hợp **tính theo giá DV khác** ở Cột 4).
- **Khoản 4 — không TT:** (a) DV **công đoạn** đã gộp trong giá DV khác; (b) Kết quả **tính từ** DV khác / **trùng** kết quả — tránh **đếm đôi**.
- **Khoản 5:** Kỹ thuật mới (Luật KCB Điều 69) — cần BYT quy định **điều kiện & tỷ lệ** mới TT đủ.
- **Khoản 6:** Danh mục 3 — **tạm chưa TT**.
- **Khoản 7 (TT 39/2024):** **“Một lượt khám bệnh, chữa bệnh”** = một lần khám **ngoại trú** hoặc **một đợt** điều trị; **số ngày** một lượt do **người hành nghề** quyết định — ảnh hưởng cách hiểu **khám nhiều chuyên khoa**, **đợt điều trị**, v.v.

### 3.5. Điều 4a — Nguyên tắc giá (hợp đồng KCB): chi phí **chưa** trong giá ngày giường / giá DV

Áp dụng khi phân tích **tách dòng thanh toán** (thuốc, máu, vật tư tiêm truyền, túi hậu môn nhân tạo, dung dịch loét tỳ đè **tối đa 3 lọ/đợt** độ 1, …) và **không thu trùng** phần đã kết cấu trong giá DV được BHXH TT.

**Quy tắc AI:** Khi thấy cùng lúc **ngày giường** + **DVKT** + **VTYT** — hỏi: *Khoản nào đã **gộp trong giá** theo 4a?*

### 3.6. Điều 4b — Tiền **khám bệnh**: số lần, mức giá, các case (vào nội trú sau khám, khám chuyên khoa tại khoa lâm sàng, lần khám 2 **30%**, tối đa **2 lần** giá 1 lần khám, khám lại trong ngày, **bàn khám >65 lượt/8h** — BHXH **50%** từ lượt 66, v.v.)

**Quy tắc AI:** Liên quan **công khám** (thường mã nhóm khám — XML3/XML1), **không** nhầm với từng XN lẻ trừ khi đúng mô tả danh mục.

### 3.7. Điều 4c — **Ngày giường**: số ngày, mức giá, chuyển khoa, ICU, Phaco, BV điều dưỡng…

**Quy tắc AI:** Gắn **XML1** (nội trú, ngày vào/ra, khoa) với **XML3** dòng giường / ngày giường (nếu có) và điều kiện Phụ lục.

### 3.8. Điều 4d — DVKT **đặc thù** (giá, điều kiện, tần suất…)

Nơi tập trung nhiều **một dịch vụ — một hoặc nhiều điều kiện** (xét nghiệm, chẩn đoán hình ảnh, thủ thuật đặc biệt…). Đây là **mỏ** để mở rộng rule `DVKT_*` / `CDHA_*` có kiểm soát.

### 3.9. Điều 5 — 8

- **Điều 5:** Chuyển tiếp (hồ sơ vượt thời điểm hiệu lực — thanh toán theo văn bản cũ quy định).
- **Điều 6:** Tham chiếu văn bản bị thay thế / sửa.
- **Điều 7:** Hiệu lực (cần đối chiếu phiên bản VBHN và TT sau ngày hợp nhất).
- **Điều 8:** Tổ chức thực hiện.

---

## 4. Danh mục 1, 2, 3 — ý nghĩa cột (cho AI đọc bảng)

| Danh mục | Đặc điểm | Cột điển hình (theo cấu trúc TT 35 và bản hợp nhất) |
|----------|----------|---------------------------------------------------|
| **Danh mục 1** | Điều kiện + **tỷ lệ** + **mức giá** (và thường có cột tham chiếu giá DV khác) | Mã DV, tên, **điều kiện TT** (Cột 3), **tỷ lệ/giá** (Cột 4 — theo mẫu phụ lục hiện hành) |
| **Danh mục 2** | Chủ yếu **điều kiện** thanh toán | Mã DV + **Cột 3** điều kiện |
| **Danh mục 3** | **Chưa** thanh toán (tạm) | AI cảnh báo “chưa trong phạm vi TT BHYT” nếu đúng DM3 |

**Lưu ý:** Số thứ tự cột trong Excel BYT phải lấy **đúng file Phụ lục** đính kèm Thông tư / VBHN — không đoán.

**Thẻ tri thức chi tiết (đúng tên danh mục trong VBHN):**

- **Danh mục 1** — *DVKT có quy định cụ thể điều kiện, tỷ lệ và mức giá thanh toán:* [The_tri_thuc_Danh_muc_1_DVKT_dieu_kien_ty_le_gia_VBHN17_AI.md](./The_tri_thuc_Danh_muc_1_DVKT_dieu_kien_ty_le_gia_VBHN17_AI.md)
- **Danh mục 2** — *DVKT có quy định cụ thể điều kiện thanh toán:* [The_tri_thuc_Danh_muc_2_DVKT_dieu_kien_thanh_toan_VBHN17_AI.md](./The_tri_thuc_Danh_muc_2_DVKT_dieu_kien_thanh_toan_VBHN17_AI.md)

---

## 5. Liên hệ giám định BHXH (TT 12/2026/TT-BTC, Điều 10)

Giám định tự động của BHXH nhìn chung kiểm tra: thẻ, mức hưởng, phạm vi TT thuốc–DVKT–VTYT theo danh mục, giá, tỷ lệ & điều kiện, phạm vi chuyên môn CS, phạm vi hành nghề, **hợp lý** dịch vụ, số lượng khớp đấu thầu… — **khớp hướng** với nội dung **17/VBHN** + NĐ 188 + TT BYT chi tiết.

Thẻ tri thức này **không** thay thế **QĐ 3618**, **QĐ 130** — chỉ giúp AI **ăn khớp lập luận** “điều kiện DVKT” với “điểm giám định BHXH”.

---

## 6. Neo mã nguồn dự án (chỉ đọc — không đổi chức năng cốt lõi)

| Thành phần | Vai trò |
|------------|---------|
| `ma_nguon/tien_ich/luat_cdha_hardcoded.jsx` + seed DVKT | Rule mẫu nhóm **DVKT/CĐHA** |
| `ma_nguon/tien_ich/dvkt_op_giam_dinh.jsx` | Engine DVKT no-code, metadata **VBHN_17** |
| `ma_nguon/tien_ich/dong_co_giam_dinh.jsx` | Chuỗi **CO_SO_PHAP_LY_DVKT**, lọc cảnh báo |
| `ma_nguon/man_hinh/quan_ly_xml3.jsx` | Xem/sửa **XML3** |
| `ma_nguon/quy_tac/quyluat_cautrucdulieu/xml3.jsx` | Cột chuẩn XML3 |

Việc **thêm rule mới** từ từng dòng Phụ lục: làm qua quy trình **seed / ON-OFF / QA** — mô tả trong `tai_lieu/Huong_dan_*` và script `qa:*`, không ép trong một bước “full VBHN”.

---

## 7. Mẫu huấn luyện AI (câu hỏi – không PII)

1. Một dòng XML3 có `MA_DICH_VU` nằm trong Danh mục 2 — cần kiểm tra **thêm** gì ngoài mã? *(Cột 3 điều kiện + Điều 3 khoản 1.)*
2. Hai DV cùng ngày: một là **thành phần** đã gộp trong giá DV kia — kết luận TT? *(Điều 4 khoản 4.)*
3. Hồ sơ từ **15/12/2024** ra viện **05/01/2025** — áp dụng cụm **4a–4d / khoản 7 Điều 4** thế nào? *(Thời điểm hiệu lực TT 39/2024.)*

---

## 8. Tài liệu liên quan trong repo

- `tai_lieu/Chuan_hoa_kien_thuc_AI_giam_dinh_DVKT.md` — **chuẩn hóa suy luận AI** (7 bước, ma trận nguồn rule, checklist).
- `tai_lieu/The_tri_thuc_Danh_muc_1_DVKT_dieu_kien_ty_le_gia_VBHN17_AI.md` — **Danh mục 1** (điều kiện + tỷ lệ + giá) chi tiết cho AI.
- `tai_lieu/The_tri_thuc_Danh_muc_2_DVKT_dieu_kien_thanh_toan_VBHN17_AI.md` — **Danh mục 2** (điều kiện thanh toán) chi tiết cho AI.
- `tai_lieu/Ky_nang_cot_loi_giam_dinh_AI_BHYT.md` — kỹ năng cốt lõi đa nhóm; `tai_lieu/Bai_tap_phat_trien_ky_nang_giam_dinh_AI.md` — bài tập thực hành.
- `tai_lieu/The_tri_thuc_mau_luat_BHYT_2008_2025.md` — mục **11.5** (chuỗi VBHN 17 + TT 39).
- `tai_lieu/The_tri_thuc_mau_nhom_pttt_dot1.md` — PTTT & XML3.
- `tai_lieu/Huan_luyen_phien_hanh_chinh_BHYT_bat_buoc_Cursor.md` — mô hình neo XML1 (bổ sung ngữ cảnh).
- `tai_lieu/Huan_luyen_phien_DVKT_VBHN17_Cursor.md` — phiên huấn luyện DVKT (mục A–J).
- `tai_lieu/Bang_neo_phien_huan_luyen_dvkt_va_engine.md` — neo phiên ↔ engine.
- **VTYT (vật tư — kết cấu với DVKT, VBHN 14):** `tai_lieu/Chuan_hoa_kien_thuc_AI_giam_dinh_VTYT.md`; `tai_lieu/Bang_neo_phien_huan_luyen_vtyt_va_engine.md`; mục **11.6** `tai_lieu/The_tri_thuc_mau_luat_BHYT_2008_2025.md` — trong CSDL **chưa** có seed `DM-VTYT-*`; nhánh **DVKT no-code** (`checkGhiChu`, `DVKT-OP-08`) xem bảng neo VTYT.
- `tai_lieu/Ca_huan_luyen_mau_000308_DVKT_2587_2588_PTTT_goi_thuoc.md` — ca mẫu gói PT + ICD + thuốc tê/mê (`DVKT_2587`, `DVKT_2588`).
- `tai_lieu/Ca_huan_luyen_mau_000502_CDHA_164_MRI_noitru.md` — `CDHA_164` (MRI — thời gian chờ nội trú).
- `tai_lieu/Ca_huan_luyen_mau_000538_CDHA_101_ma_may_XQ.md` — `CDHA_101` (mã máy CĐHA).
- `tai_lieu/Ca_huan_luyen_mau_000375_DVKT_OP_09_danh_muc_noibo.md` — `DVKT-OP-09` (engine no-code, danh mục nội bộ).

---

*Tài liệu này phục vụ **huấn luyện và chuẩn hóa nguyên tắc**; mọi kết luận pháp lý cuối cùng cần đối chiếu **văn bản gốc**, **Phụ lục Excel**, **hợp đồng KCB** và **hướng dẫn BHXH** tại thời điểm hồ sơ.*
