# THẺ TRI THỨC: GIÁM ĐỊNH TỰ ĐỘNG CDSS (ENGINE — CHUYÊN ĐỀ — DVKT-OP)

Phiên bản tài liệu: **1.0**  
Ngày cập nhật: **26/04/2026**  
Đối tượng: **AI hỗ trợ giám định BHYT** (RAG, chat, phân tích cảnh báo) — **không thay** quyết định BHXH / thanh toán thực tế.

Độ tin cậy: **trung bình → cao** tùy từng quy tắc (xem cột “Bản chất” bên dưới).

---

## 1. Mệnh đề cốt lõi

- **Giám định trong app** = tập hợp **cảnh báo** sinh ra từ **mã nguồn** khi đọc **XML130** (và danh mục nội bộ đã nạp), không phải “kết luận xuất toán” của cơ quan BHXH.
- **Hai dòng chính** cần phân biệt khi giải thích cho người dùng:
  1. **Luật động / chuyên đề** (`dong_co_giam_dinh.jsx` + `luat_giam_dinh_chuyen_de_hardcoded.jsx`, …) — biểu thức DSL hoặc handler, nhiều chỗ là **heuristic XML130**.
  2. **DVKT-OP** (`dvkt_op_giam_dinh.jsx`) — kiểm tra phạm vi hành nghề, danh mục DVKT nội bộ, neo VBHN 17/BYT.

- **Nguyên tắc an toàn cho AI:** Luôn nói rõ **“gợi kiểm tra / proxy trên XML”** khi điều kiện không đọc được hợp đồng KCB, C79, sổ phê duyệt giường thực tế của BHXH.

---

## 2. Phạm vi dữ liệu

| Thành phần | XML / dữ liệu | Ghi chú cho AI |
|--------------|---------------|----------------|
| Hồ sơ đợt KCB | XML1 … XML15 (theo mẫu QĐ 130 / 3176) | XML1: thông tin BN, loại KCB, ngày vào/ra, MA_KHOA, … |
| Danh mục CSKCB | Bảng khoa (M01), DVKT, thuốc, … nạp qua `taiDanhMucHeThong()` | Khóa `MAP_KHOA_BV`, `MAP_DVKT_BV`, … trong `dong_co_giam_dinh.jsx` |
| Luật chuyên đề | `MA_LUAT` dạng `Chuyen_de_*`, tab `LUAT_GIAM_DINH_CHUYEN_DE` | Nhiều rule đã chuyển sang điều kiện XML130; xem `CHUYEN_DE_XML130_CONVERSION_VERSION` |

---

## 3. Luồng engine (để AI neo đúng “tầng” cảnh báo)

- **V3 tổng hợp:** `chayBoMayGiamDinhV3` trong `dong_co_giam_dinh.jsx` — nạp danh mục, dựng ngữ cảnh rule động (`taoNguCanhRuleDong`), duyệt tab luật, gọi `evaluateRule` và tích hợp **DVKT-OP**.
- **Chuẩn hóa từng rule:** `chuanHoaRuleDong` — suy ra `targetTable` (XML1/XML3/…) từ `phanhe` + chuỗi `DIEU_KIEN` (ưu tiên bảng chi tiết khi có `XMLn.` trong điều kiện).
- **Biên dịch điều kiện:** `bienDichDieuKienLuatDong` → `taoHamDieuKienLuatDong` — hàm nội bộ hệ thống (`SYS_KEYWORDS_RULE_DONG`, helpers inject trong `new Function(…)`).

**Gợi ý câu hỏi AI phải tự hỏi:** “Cảnh báo này gắn **bảng XML nào** và **có phụ thuộc danh mục nội bộ** không?”

---

## 4. Thẻ con: Chuyên đề 166 — vượt công suất giường & TT22 (proxy)

- **Mã:** `Chuyen_de_166` (`CHUYEN_DE-166` trong hardcoded).
- **Ý nghiệp vụ (mục tiêu giám định):** Gợi ý trường hợp **nội trú** có **ngày giường BHYT** (theo neo KT221 trên XML3) **vượt** tổng giường phê duyệt ghi trong **danh mục khoa** (cột `GIUONG_PD`, `GIUONG_TK`, …) theo `XML1.MA_KHOA`, đồng thời các dòng giường BHYt vẫn khai **tỷ lệ thanh toán đầy đủ** (heuristic: `TYLE_TT` / `TY_LE_TT` ≥ 95 hoặc trống; `MUC_HUONG` ≥ 90 hoặc trống) — **proxy** cho “chưa phản ánh giảm giá khi vượt công suất” theo tinh thần **TT 22/2023/TT-BYT** (kế thừa TT 39/2018).

- **Điều kiện kỹ thuật (tóm tắt):** Hằng `CHUYEN_DE_166_DIEU_KIEN_TT22_XML130_M01` trong `luat_giam_dinh_chuyen_de_hardcoded.jsx`; handler `CHUYEN_DE_166_VI_PHAM_TT22_PROXY(XML1, DS_XML3)` được inject trong `taoHamDieuKienLuatDong`.

- **Dữ liệu chính:** `XML1.MA_LOAI_KCB`, `NGAY_VAO`, `NGAY_RA`, `MA_KHOA`; `DS_XML3` (`MA_NHOM`, `MA_DICH_VU`/`MA_DV`, `TEN_DICH_VU`, `SO_LUONG`, `NGUON_CTRA`/`MUC_HUONG`, `TYLE_TT`, …); hàng khoa trong `MAP_KHOA_BV`.

- **Điểm dễ nhầm (AI):**
  - Coi cảnh báo = **BHXH đã xác định xuất toán** → **sai**; đây là **rule nội bộ + heuristic**.
  - Bỏ qua chữ **“Heuristic / proxy / M01 nội bộ”** trong `CANH_BAO` / `GHI_CHU` → dễ **thổi phồng** mức độ chắc chắn.

- **Ví dụ suy luận đúng:** “Hệ thống so **tổng ngày giường BHYT trên XML3** với **tổng cột giường trong DM khoa** theo `MA_KHOA`; nếu vượt và tỷ lệ dòng vẫn đầy đủ thì **gợi** đối chiếu TT22 và hợp đồng KCB — cần hồ sơ giấy / C79 nếu kết luận cứng.”

---

## 5. Phân loại độ tin cậy gợi ý cho AI

| Nhóm | Ví dụ mã | Bản chất |
|------|-----------|----------|
| Neo mã + DM rõ ràng | Nhiều `DVKT-OP-*`, `HC_*` có trường XML đủ | Cao hơn — vẫn cần đối chiếu nhân sự / chỉ định |
| Chuyên đề XML130 đã viết lại | `Chuyen_de_*` có `DIEU_KIEN` dài, ghi rõ COUNT_IF/SUM_IF | Trung bình — phụ thuộc tên DVKT/HIS |
| Placeholder | `CHUYEN_DE_XML130_CHO_XU_LY_SAU` | Engine **cố ý không phát** — không diễn giải là đã giám định |

---

## 6. Kiểm chứng / mã nguồn tham chiếu

| Nội dung | File |
|----------|------|
| Engine V3, rule động, `MAP_KHOA_BV`, inject proxy 166 | `ma_nguon/tien_ich/dong_co_giam_dinh.jsx` |
| Quy tắc chuyên đề, phiên bản chuyển đổi XML130 | `ma_nguon/tien_ich/luat_giam_dinh_chuyen_de_hardcoded.jsx` |
| Giám định DVKT-OP | `ma_nguon/tien_ich/dvkt_op_giam_dinh.jsx` |
| Khung chat / VBHN DVKT | `tai_lieu/Khung_chat_luong_giam_dinh_DVKT_VBHN17.md` |
| Mẫu thẻ tri thức | `tai_lieu/Mau_the_tri_thuc_giam_dinh_BHYT.md` |
| Thực chiến chuyên đề | `tai_lieu/Tri_thuc_AI_CHUYEN_DE_XML130_thuc_chien.md` |

**Test nhanh sau khi sửa luật:** `npm run qa:claim-audit-smoke` (một file XML mẫu trong `tai_nguyen/ip/`).

---

## 7. Bài học rút ra cho AI (bắt buộc áp dụng khi trả lời)

1. Luôn phân tách **“máy phát hiện gì trên XML”** vs **“cần thêm chứng từ nào để kết luận”**.
2. Với **công suất giường / TT22:** nhắc **hợp đồng KCB**, **phụ lục giường BHXH**, **C79** — không khẳng định mức giảm % nếu không có trong hồ sơ.
3. Trích dẫn **mã luật** (`ma_luat`, `ten_quy_tac`) khi giải thích để người dùng đối chiếu màn Quản lý quy tắc.
4. Nếu người dùng hỏi “có đúng BHXH không?” → trả lời: **XML + rule nội bộ không thay thế giám định BHXH**; đề xuất bước đối chiếu cụ thể (trường XML, DM, văn bản).

---

## 8. Metadata cho indexer / RAG (tùy chọn)

- **Từ khóa:** CDSS, giám định tự động, XML130, Chuyen_de_166, TT22, công suất giường, MAP_KHOA_BV, DVKT-OP, VBHN 17, heuristic, proxy M01.
- **Loại thẻ:** quy trình + quy tắc đại diện + ranh giới tin cậy.
