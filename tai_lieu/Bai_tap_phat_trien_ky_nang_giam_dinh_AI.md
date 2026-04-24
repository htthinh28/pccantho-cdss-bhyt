# Bài tập phát triển kỹ năng giám định cho AI

**Phiên bản:** 1.4  
**Ngày:** 09/04/2026  
**Cách dùng:** Bài **1–7** là tình huống giả; bài **8–10** bám **audit JSON thật** trong repo; bài **11–13** neo **chuẩn hóa VTYT** / **giới hạn CSDL** / **bảng neo**. Yêu cầu AI trả lời theo **cấu trúc**: (1) Phân loại lớp A–D trong [Ky_nang_cot_loi_giam_dinh_AI_BHYT.md](./Ky_nang_cot_loi_giam_dinh_AI_BHYT.md) §3 — (2) Dữ liệu cần mở — (3) **Không** kết luận gì nếu thiếu gì — (4) Câu hỏi cho người nghiệp vụ (nếu có).

---

## Bài 1 — Nhiều `ma_luat` trên một `MA_LK`

**Tình huống:** Một hồ sơ audit có `THUOC_391` (2 dòng), `DVKT_2587`, `HC_171` cùng lúc.

**Yêu cầu:** Giải thích vì sao đây **không phải một lỗi duy nhất**; nêu thứ tự xem xét hợp lý (hành chính trước hay chuyên môn trước?) và **một câu** tại sao.

**Gợi ý đáp án (không bắt buộc khớp từng chữ):** Ba nhóm rule độc lập (XML2 vs XML3 vs cấu trúc hồ sơ); thường ưu tiên **HC** (thiếu XML5/Schema) nếu ảnh hưởng tính hợp lệ hồ sơ, nhưng tùy quy trình đơn vị.

---

## Bài 2 — `dieu_kien` = `BUILT-IN`

**Tình huống:** Cảnh báo có `dieu_kien: "BUILT-IN"`, `ma_luat: "CLN-GIUONG-01"`.

**Yêu cầu:** AI phải nói được **BUILT-IN** gợi ý điều gì về nguồn rule; không được giả định có **dòng seed** trong `du_lieu_luat_pttt_muc11.jsx`.

**Gợi ý:** Rule tích hợp trong động cơ / luật built-in — tra cứu theo `ma_luat` trong `dong_co_giam_dinh.jsx` hoặc module built-in tương ứng.

---

## Bài 3 — Cùng XML3 `index`, hai `DVKT_*`

**Tình huống:** Hai cảnh báo `DVKT_2587` và `DVKT_2588` cùng `index` XML3.

**Yêu cầu:** Giải thích **một dòng DV** có thể kích hoạt hai rule** vì điều kiện khác nhau** (chỉ định vs thuốc kèm gói).

**Gợi ý:** So sánh điều kiện seed: ICD/XML1 vs tập XML2.

---

## Bài 4 — `DVKT-OP-09` vs `DVKT_2696`

**Tình huống:** Người mới hỏi “hai mã đều là DVKT trên XML3, có gì khác?”

**Yêu cầu:** Phân biệt **nguồn** (`dvkt_op_giam_dinh` + operator `CHECK_INTERNAL_APPROVAL` vs seed PTTT `du_lieu_luat_pttt_muc11.jsx`) và **dạng mã** (`DVKT-OP-xx` có dấu gạch ngang vs `DVKT_` số).

**Gợi ý:** [Bang_neo_phien_huan_luyen_dvkt_va_engine.md](./Bang_neo_phien_huan_luyen_dvkt_va_engine.md).

---

## Bài 5 — Thiếu Phụ lục Excel BYT

**Tình huống:** AI được hỏi “Dịch vụ X có được BHYT thanh toán 100% không?” nhưng **không** có bảng Phụ lục, chỉ có `TYLE_TT` trên XML3.

**Yêu cầu:** Viết **câu trả lời đúng chuẩn** (không bịa %): nêu cần đối chiếu gì thêm.

**Gợi ý:** Neo Điều 2 (tỷ lệ) + Cột Phụ lục tại **thời điểm** hồ sơ; nếu không có Phụ lục thì không chốt %.

---

## Bài 6 — Mốc TT 39 / 01/01/2025

**Tình huống:** Hồ sơ có ngày vào **20/12/2024**, ngày ra **05/01/2025**, có chỉ định DV liên quan **Điều 4b** (tiền khám).

**Yêu cầu:** Liệt kê **các thời điểm** cần làm rõ trước khi áp điểm HL TT 39 (không cần kết luận thanh toán cụ thể).

**Gợi ý:** Ngày chỉ định DV, ngày ra viện, định nghĩa “một lượt KCB” — xem [The_tri_thuc_mau_luat_BHYT_2008_2025.md](./The_tri_thuc_mau_luat_BHYT_2008_2025.md) mục 11.5.

---

## Bài 7 — Ẩn danh hóa khi họp hoặc chat

**Tình huống:** User dán nhầm họ tên + Số thẻ BHYT vào prompt.

**Yêu cầu:** Nêu **một** hành động đúng của AI và **một** câu nhắc lịch sự.

**Gợi ý:** Từ chối xử lý PII; yêu cầu MA_LK/XML đã khử danh tính hoặc chỉ mô tả cấu trúc.

---

## Bài 8 — Audit thật: `MA_LK` **000308** (PTTT + THUOC + HC)

**Nguồn trong repo:** `test_xml/audit_000308_20260405_083942.json` — ca mẫu: [Ca_huan_luyen_mau_000308_DVKT_2587_2588_PTTT_goi_thuoc.md](./Ca_huan_luyen_mau_000308_DVKT_2587_2588_PTTT_goi_thuoc.md).

**Yêu cầu:**

1. Đọc `meta.ma_lk`, `unique_rule_codes` (hoặc `rule_summary`) — liệt kê **các nhóm mã** (DVKT / THUOC / HC / HD).  
2. Với **`DVKT_2587`** và **`DVKT_2588`**: chỉ ra **`index`** XML3 **trùng nhau** trong `warnings` — giải thích vì sao **một dòng DV** có hai cảnh báo.  
3. Giải thích **một câu** vì sao **`THUOC_391`** (cùng audit) **không** “thay thế” hay “hợp nhất” với **`DVKT_2588`** khi phân tích.

**Gợi ý:** XML2 vs XML3; điều kiện seed khác nhau — xem `dieu_kien` trong JSON nếu cần.

---

## Bài 9 — Audit thật: `MA_LK` **000375** (`DVKT-OP-09` + HC)

**Nguồn:** `test_xml/audit_000375_20260405_065828.json` — ca: [Ca_huan_luyen_mau_000375_DVKT_OP_09_danh_muc_noibo.md](./Ca_huan_luyen_mau_000375_DVKT_OP_09_danh_muc_noibo.md).

**Yêu cầu:**

1. Tìm cảnh báo có `ma_luat` dạng **`DVKT-OP-09`** — nêu **nguồn rule** (no-code / `CHECK_INTERNAL_APPROVAL`) theo đúng phân biệt trong [Bang_neo_phien_huan_luyen_dvkt_va_engine.md](./Bang_neo_phien_huan_luyen_dvkt_va_engine.md).  
2. Chọn **một** cảnh báo **`HC_*`** trong cùng file — gán lớp **A–D** và **một câu** vì sao đó **không** phải “lỗi danh mục DVKT nội bộ”.

**Gợi ý:** `phan_he` / `truong_loi` trong từng object `warnings`.

---

## Bài 10 — Audit thật: `MA_LK` **000502** (`CDHA_164` + nhiều nhóm)

**Nguồn:** `test_xml/audit_000502_20260404_192348.json` — ca: [Ca_huan_luyen_mau_000502_CDHA_164_MRI_noitru.md](./Ca_huan_luyen_mau_000502_CDHA_164_MRI_noitru.md).

**Yêu cầu:**

1. Xác nhận có **`CDHA_164`** — nêu `index` XML3 (nếu có trong JSON).  
2. Liệt kê **ít nhất hai** `ma_luat` khác `CDHA_164` trong cùng audit — phân loại nhanh **CĐHA hardcoded** vs **HC** vs **DVKT/PTTT** (dựa trên tiền tố mã).  
3. **Một câu** so sánh ý nghiệp vụ: **`CDHA_164`** vs **`CLN-GIUONG-01`** nếu cả hai xuất hiện (hoặc giải thích vì sao không thể gộp).

**Gợi ý:** `luat_cdha_hardcoded.jsx` vs luật giường built-in — ca mẫu có ghi “song song”.

---

## Bài 11 — `XML1.T_VTYT` trong **dự án này** ≠ “chỉ tiền vật tư”

**Tình huống:** Giám định viên thấy cảnh báo gắn `truong_loi: T_VTYT` / `CLN-CHI-02` và hỏi AI: “Có phải hồ sơ sai **vật tư**?”

**Yêu cầu:** Giải thích theo [Chuan_hoa_kien_thuc_AI_giam_dinh_VTYT.md](./Chuan_hoa_kien_thuc_AI_giam_dinh_VTYT.md) §**3**: trong `dong_co_giam_dinh.jsx`, `T_VTYT` XML1 đối chiếu với **tổng tiền XML3** theo quy ước dự án — **không** tự suy ra chỉ các dòng `MA_VAT_TU`.

**Gợi ý:** Đọc comment mã nguồn `giamDinhTongChiPhi`; phân biệt với rule lệch tiền **chỉ dòng có `MA_VAT_TU`** trong `du_lieu_luat_du_lieu_muc1.jsx` (nếu được hỏi thêm).

---

## Bài 12 — Hỏi “mã vật tư X có được BHYT thanh toán không?” khi **chưa có** rule `DM-VTYT-*`

**Tình huống:** Người dùng đưa một `MA_VAT_TU` (hoặc tên vật tư) và yêu cầu AI **chốt %** và **điều kiện** theo VBHN 14.

**Yêu cầu:** AI phải nêu rõ: (1) **Trong repo hiện tại không có** bộ seed giám định **`DM-VTYT-*`** — không thể “tra engine” như DVKT/thuốc; (2) để trả lời đúng nghiệp vụ cần **Phụ lục / bảng điều kiện** tại thời điểm hồ sơ hoặc tài liệu BYT ngoài phiên; (3) **không** bịa cột điều kiện hay %.

**Gợi ý:** [Chuan_hoa_kien_thuc_AI_giam_dinh_VTYT.md](./Chuan_hoa_kien_thuc_AI_giam_dinh_VTYT.md) §**0**; [Huan_luyen_phien_VTYT_du_phong_Cursor.md](./Huan_luyen_phien_VTYT_du_phong_Cursor.md) §**4.2** (khi sau này có CSDL).

---

## Bài 13 — `CLN-CHI-02` vs `XML_54`: hai cách đối chiếu `T_VTYT`

**Tình huống:** Hai cảnh báo đều nói về **lệch tiền** gắn trường **`T_VTYT`** trên XML1, nhưng người mới nhầm là **cùng một rule**.

**Yêu cầu:** Dựa [Bang_neo_phien_huan_luyen_vtyt_va_engine.md](./Bang_neo_phien_huan_luyen_vtyt_va_engine.md) và [Chuan_hoa_kien_thuc_AI_giam_dinh_VTYT.md](./Chuan_hoa_kien_thuc_AI_giam_dinh_VTYT.md) §**3**:  
(1) Nêu **`CLN-CHI-02`** đối chiếu `XML1.T_VTYT` với **tổng nào** trên XML3.  
(2) Nêu **`XML_54`** (`du_lieu_luat_du_lieu_muc1.jsx`) đối chiếu `T_VTYT` với **tổng nào** (điều kiện dòng XML3).  
(3) **Một câu** vì sao hai công thức **khác nhau** và không được gộp giải thích.

**Gợi ý:** Ghi chú seed `XML_54` — chỉ cộng dòng có `MA_VAT_TU`.

---

## Liên kết nền

- Kỹ năng cốt lõi: [Ky_nang_cot_loi_giam_dinh_AI_BHYT.md](./Ky_nang_cot_loi_giam_dinh_AI_BHYT.md)  
- Chuẩn hóa DVKT: [Chuan_hoa_kien_thuc_AI_giam_dinh_DVKT.md](./Chuan_hoa_kien_thuc_AI_giam_dinh_DVKT.md)  
- Lộ trình tổng: [Lo_trinh_huan_luyen_AI_giam_dinh_BHYT.md](./Lo_trinh_huan_luyen_AI_giam_dinh_BHYT.md)  
- VTYT — chuẩn hóa: [Chuan_hoa_kien_thuc_AI_giam_dinh_VTYT.md](./Chuan_hoa_kien_thuc_AI_giam_dinh_VTYT.md) · bảng neo: [Bang_neo_phien_huan_luyen_vtyt_va_engine.md](./Bang_neo_phien_huan_luyen_vtyt_va_engine.md) · khung dự phòng: [Huan_luyen_phien_VTYT_du_phong_Cursor.md](./Huan_luyen_phien_VTYT_du_phong_Cursor.md)
