# Phiên huấn luyện — Giám định DVKT theo 17/VBHN-BYT (Cursor — đủ nội dung tri thức)

**Phiên bản:** 1.7  
**Ngày:** 10/04/2026  
**Mục phiên:** Chuẩn hóa tư duy AI giám định **dịch vụ kỹ thuật (DVKT)** theo khung **17/VBHN-BYT** + **TT 39/2024** (HL 01/01/2025 cho nhiều điểm), neo **XML1/XML3** và **mã nguồn** có sẵn — **không thay thế** văn bản gốc BYT/BHXH.

**Nguồn tri thức bắt buộc trong repo:**

- **Kỹ năng chung (mọi rule):** [Ky_nang_cot_loi_giam_dinh_AI_BHYT.md](./Ky_nang_cot_loi_giam_dinh_AI_BHYT.md) · [Bai_tap_phat_trien_ky_nang_giam_dinh_AI.md](./Bai_tap_phat_trien_ky_nang_giam_dinh_AI.md)
- **Điểm vào chuẩn hóa suy luận DVKT (đọc sau kỹ năng chung):** [Chuan_hoa_kien_thuc_AI_giam_dinh_DVKT.md](./Chuan_hoa_kien_thuc_AI_giam_dinh_DVKT.md)
- **Kiểm soát lỗi DVKT (phân loại cảnh báo theo VBHN 17 — song song thẻ “sai thuốc”):** [The_tri_thuc_kiem_soat_loi_dvkt_VBHN17_AI.md](./The_tri_thuc_kiem_soat_loi_dvkt_VBHN17_AI.md)
- **Danh mục 1 / 2 chi tiết (đúng danh pháp lý VBHN):** [The_tri_thuc_Danh_muc_1_DVKT_dieu_kien_ty_le_gia_VBHN17_AI.md](./The_tri_thuc_Danh_muc_1_DVKT_dieu_kien_ty_le_gia_VBHN17_AI.md) · [The_tri_thuc_Danh_muc_2_DVKT_dieu_kien_thanh_toan_VBHN17_AI.md](./The_tri_thuc_Danh_muc_2_DVKT_dieu_kien_thanh_toan_VBHN17_AI.md)
- [The_tri_thuc_giam_dinh_DVKT_VBHN_17_BYT.md](./The_tri_thuc_giam_dinh_DVKT_VBHN_17_BYT.md)
- [The_tri_thuc_mau_luat_BHYT_2008_2025.md](./The_tri_thuc_mau_luat_BHYT_2008_2025.md) — mục **11.5**
- (Bổ sung ngữ cảnh PTTT–XML3) [The_tri_thuc_mau_nhom_pttt_dot1.md](./The_tri_thuc_mau_nhom_pttt_dot1.md)

**Ràng buộc:** Không đưa PII vào ví dụ; không bịa **giá / % / điều kiện chi tiết từng dòng Phụ lục** — khi thiếu bảng Excel gốc, ghi rõ *cần đối chiếu Phụ lục + hợp đồng KCB tại thời điểm hồ sơ*.

---

## A. Bảng: Lớp kiểm tra ↔ Điều / cụm VBHN (17 + TT 39)

| Lớp / cụm | Câu hỏi giám định tối thiểu | Gợi ý dữ liệu XML / hồ sơ (mang tính gợi ý) |
|-----------|-----------------------------|-------------------------------------------|
| **Điều 1** — Phạm vi DM DVKT được hưởng | Dịch vụ có thuộc **Danh mục 1/2** hay rơi **Danh mục 3**? Có thuộc nhóm **loại trừ** Luật BHYT (Điều 23) không? | XML1 (đối tượng, loại KCB); `MA_DICH_VU` đối chiếu Phụ lục |
| **Điều 1 điểm a** — Tuyến / phạm vi kỹ thuật CS | CSKCB có **đủ tuyến và phạm vi kỹ thuật** để thực hiện DV không? | `MA_CSKCB`, hạng BV, nhóm dịch vụ / DM |
| **Điều 1 điểm b** — PTTT | PTTT: đúng phân loại PT/TT, đủ điều kiện theo TT 50/2014 (kết hợp VBHN)? | XML3 + XML6; XML1 `MA_PTTT_QT` (tùy mẫu) |
| **Điều 1 điểm c** — Kỹ thuật mới tại CS | Có **quyết định phê duyệt / chứng từ** kỹ thuật mới không? | Thường **giám định chủ động** + hồ sơ giấy tờ |
| **Điều 2** — Tỷ lệ thanh toán | `TYLE_TT` và thành tiền BHYT có **bám cột Phụ lục** và mức hưởng thẻ không? Giá DV đã **bao / chưa bao** thuốc–VT trong giá? | XML3 `TYLE_TT`, `THANH_TIEN_BH`, `DON_GIA`; đối chiếu XML2 nếu tách thuốc/VT |
| **Điều 3** — Điều kiện khung | (a) DV trong phạm vi được duyệt tại CS? (b) Theo **QTDH** đã ban hành? (c) Giá **được phê duyệt**? | DM BYT + HĐ KCB; XML5 / bệnh án khi tranh chấp chỉ định; XML3 giá |
| **Điều 3 khoản 2 + Cột 3 DM** | Với từng dòng DV: **Cột 3** (và ghi chú) nêu điều kiện gì (chẩn đoán, tần suất, kèm DV khác…)? | `MA_DICH_VU` + đọc đúng **cột điều kiện** trong file Phụ lục đính kèm VBHN |
| **Điều 4 khoản 2–3** — Công thức TT | Quỹ BHYT / đồng chi trả tính theo **giá × mức hưởng × tỷ lệ** (và case tính theo giá DV khác nếu Phụ lục quy định)? | XML3 các trường tiền; đối chiếu đối tượng thẻ (XML1) |
| **Điều 4 khoản 4** — Trùng / gộp | Có **đếm đôi** DV công đoạn đã gộp trong giá DV khác, hoặc kết quả **trùng** từ DV khác không? | Toàn bộ XML3 cùng ngày / cùng đợt; logic nghiệp vụ |
| **Điều 4 khoản 5** — Kỹ thuật mới (Luật KCB Điều 69) | BYT đã quy định **điều kiện & tỷ lệ** đủ để TT chưa? | Hồ sơ + văn bản BYT; không suy diễn từ XML đơn thuần |
| **Điều 4 khoản 6** — Danh mục 3 | DV thuộc DM3 → **tạm chưa TT** BHYT theo quy định? | Khớp mã với DM3 trong Phụ lục |
| **Điều 4 khoản 7 (TT 39)** — Một lượt KCB | “Một lượt khám bệnh, chữa bệnh” = một lần **ngoại trú** hoặc **một đợt** điều trị; **số ngày** một lượt do **người hành nghề** quyết định — ảnh hưởng khám nhiều chuyên khoa / đợt điều trị? | XML1 (ngày, loại KCB); XML3 theo thời gian; **thời điểm HL TT 39** |
| **Điều 4a** — Giá gộp / tách (HĐ KCB) | Khoản nào **đã kết cấu trong giá** ngày giường hoặc giá DV mà **không được thu trùng**? | Đồng thời ngày giường + DV + VTYT + XML2 — đối chiếu mô tả giá & 4a |
| **Điều 4b** — Tiền khám | Số lần khám, mức giá, các case (vào nội trú sau khám; khám CK tại khoa; lần 2 **30%**; tối đa **2 lần** giá 1 lần; khám lại trong ngày; bàn khám >65 lượt/8h → **50%** từ lượt 66…) áp thế nào? | Nhóm **công khám** trên XML3/XML1 — **không** nhầm với XN lẻ trừ khi đúng DM |
| **Điều 4c** — Ngày giường | Số ngày, mức giá, chuyển khoa, ICU, Phaco, BV điều dưỡng… đúng Phụ lục & 4c? | XML1 (nội trú, khoa); XML3 dòng giường / ngày giường |
| **Điều 4d** — DVKT đặc thù | Điều kiện **tần suất / chỉ định / kèm DV** theo từng mã (XN, CĐHA, thủ thuật…)? | XML3 `MA_DICH_VU` + Cột 3; nơi mở rộng rule `DVKT_*` / `CDHA_*` có kiểm soát |
| **Điều 5** — Chuyển tiếp | Hồ sơ **cắt mốc hiệu lực** — áp văn bản cũ hay mới theo quy định chuyển tiếp? | Ngày chỉ định / ra viện so với HL TT 39 và VBHN |
| **Điều 6–8** — Tham chiếu, HL, tổ chức thực hiện | Đối chiếu văn bị thay thế; phiên bản VBHN và TT sau ngày hợp nhất; không dùng thẻ tri thức thay **Công báo / Excel gốc** khi tranh chấp | Metadata thời điểm trong hồ sơ |

---

## B. Bảng: Danh mục 1 / 2 / 3 — vai trò và lỗi AI thường gặp

| Danh mục | Đặc điểm | Cột / điểm cần đọc (theo mẫu Phụ lục đính kèm VBHN — **không đoán số cột**) | Lỗi AI thường mắc |
|----------|----------|-----------------------------------------------------------------------------|-------------------|
| **Danh mục 1** | Điều kiện + **tỷ lệ** + **mức giá** (thường có tham chiếu giá DV khác) | Mã, tên, **điều kiện TT**, **tỷ lệ/giá** | Chỉ nhìn `MA_DICH_VU` mà bỏ **Cột 3**; bịa **% / giá** không có trong hồ sơ hoặc bảng giá đơn vị |
| **Danh mục 2** | Chủ yếu **điều kiện** thanh toán | **Cột 3** (và ghi chú) | Coi “có mã trong DM2” là đủ — bỏ qua điều kiện dòng; nhầm DM1 vs DM2 |
| **Danh mục 3** | **Chưa** thanh toán (tạm) theo quy định | Xác định đúng mã thuộc DM3 | Cảnh báo “sai” khi mã đã chuyển DM hoặc đã có quy định mới theo **thời điểm** |

---

## C. Năm phân tầng: Giám định “trên XML/mã” vs “chủ động / hồ sơ”

1. **Khớp mã – giá – tỷ lệ – thời điểm:** Engine và CDSS hỗ trợ mạnh khi có `MA_DICH_VU`, `DON_GIA`, `TYLE_TT`, ngày KCB và danh mục nội bộ **M05** — đây là lớp **có thể kiểm tra tự động có kiểm soát**.
2. **Điều kiện Cột 3 / Điều 3:** Nhiều ý đòi **chẩn đoán, tần suất, phạm vi chuyên môn, chỉ định hợp lý** — XML có gợi ý (ICD, XML5) nhưng **kết luận cuối** thường cần **bệnh án / QTDH / người có thẩm quyền**.
3. **Điều 4a–4d (TT 39):** Phân tách **gộp trong giá** vs **tách dòng**, khám, ngày giường, DV đặc thù — một phần **cấu trúc được mã hóa** trong rule, phần còn lại cần **đối chiếu giá & mô tả DV** tại CSKCB.
4. **Kỹ thuật mới, PTTT ngoài khung 43/50, tranh chấp chỉ định:** Thuộc nhóm **giám định chủ động / chứng từ** — AI chỉ **gợi ý hướng tra cứu**, không thay **biên bản BHXH** hay quyết định pháp lý.
5. **Thời điểm hiệu lực:** Hồ sơ cắt qua **31/12/2024 → 01/01/2025** phải hỏi: điểm nào của **TT 39/2024** áp cho **phần viện phí / ngày chỉ định** nào — **không** gộp một mức cho cả đợt nếu văn bản phân tách mốc.

---

## D. Ba câu hỏi trắc nghiệm tư duy (kèm đáp án gợi ý ngắn)

**Câu 1.** Một dòng XML3 có `MA_DICH_VU` khớp **Danh mục 2**. Điều gì **bắt buộc** kiểm tra thêm trước khi chấp nhận thanh toán?

- **Gợi ý đáp án:** Đọc **Cột 3** (điều kiện dòng) và ba lớp **Điều 3 khoản 1** (phạm vi CS, QTDH, giá phê duyệt). Mã đúng **chưa đủ** nếu điều kiện dòng không thỏa.

**Câu 2.** Trong cùng ngày có hai DV: DV B được mô tả là **thành phần công đoạn đã gộp** trong giá DV A. Hướng xử lý thanh toán BHYT theo tinh thần **Điều 4 khoản 4** là gì?

- **Gợi ý đáp án:** Tránh **đếm đôi** — phần đã gộp trong giá DV khác **không** thanh toán trùng; cần đối chiếu **mô tả giá & Phụ lục**, không kết luận chỉ từ hai dòng XML tách biệt nếu thiếu bảng giá.

**Câu 3.** Bệnh nhân **vào viện 28/12/2024**, **ra viện 06/01/2025**. Khi tranh luận về **một lượt KCB** và các điểm **4a–4d**, cần làm rõ điều gì trước?

- **Gợi ý đáp án:** Xác định **thời điểm áp dụng** từng quy định (ngày chỉ định DV, ngày ra viện, mốc **HL 01/01/2025** của TT 39 cho từng **loại khoản**). Không gán mác “theo TT 39 toàn bộ” hoặc “theo TT cũ toàn bộ” mà không tách mốc.

---

## E. Neo mã nguồn dự án (chỉ đọc — hiểu để huấn luyện AI)

| Tệp / thành phần | Vai trò (một dòng) | Vì sao giám định viên / AI cần biết |
|------------------|-------------------|--------------------------------------|
| `ma_nguon/tien_ich/luat_cdha_hardcoded.jsx` + seed DVKT | Rule **mẫu** nhóm DVKT/CĐHA | Ví dụ mã `DVKT_*` / `CDHA_*` gắn điều kiện cụ thể |
| `ma_nguon/tien_ich/dvkt_op_giam_dinh.jsx` | Engine DVKT **no-code**, **`VBHN_17_META`** | Giải thích cảnh báo bám **metadata VBHN 17**; không coi đủ thay Phụ lục |
| `ma_nguon/tien_ich/dong_co_giam_dinh.jsx` | **`CO_SO_PHAP_LY_DVKT`**, **`VAN_BAN_HANH_CHINH_HIEN_HANH.VBHN_17`** | Chuỗi **cơ sở pháp lý** hiển thị cho người đọc — AI học **trích dẫn đúng tầng** |
| `ma_nguon/man_hinh/quan_ly_xml3.jsx` | Xem/sửa **XML3** | Liên hệ trường thực tế với `MA_DICH_VU`, giá, tỷ lệ |
| `ma_nguon/quy_tac/quyluat_cautrucdulieu/xml3.jsx` | **Cột chuẩn** XML3 | Tránh hiểu sai tên trường khi đọc cảnh báo |

**Lưu ý nghiệp vụ:** Danh mục Phụ lục **rất lớn**; engine chỉ **một phần** rule hóa — còn lại cần **seed / ON-OFF / QA** theo `tai_lieu/Huong_dan_*` và `npm run qa:*`.

---

## F. Việc làm tiếp theo trong Cursor (mã & QA — không nhồi vào phiên tri thức thuần)

Khi cần **xác nhận hành vi engine** (khác với đọc văn bản pháp lý):

1. Trace **`MA_LUAT`** liên quan DVKT/CDHA trong seed / `luat_cdha_hardcoded.jsx`.
2. Chạy **`npm run qa:audit-fixtures`** (đủ file mẫu, MA_LK khớp) và **`npm run qa:on-off-match`** sau mỗi thay đổi seed/rule.
3. Bổ sung hoặc chỉnh **`test_xml`** / ca regression **đã khử PII** khi phát hiện lệch rule vs VBHN.
4. Review **ON/OFF** quy tắc trong module quản lý — tránh bật rule thiếu ngữ cảnh.
5. Đối chiếu **`CO_SO_PHAP_LY_DVKT`** sau chỉnh sửa — đảm bảo chuỗi trích dẫn vẫn **khớp** `VBHN_17_META`.

---

## G. Biên bản phiên (tối đa 6 câu)

Phiên huấn luyện **DVKT / 17/VBHN-BYT** đã củng cố **lớp kiểm tra theo từng Điều**, phân biệt **Danh mục 1–3**, và phân tầng **XML được hỗ trợ tự động** với **giám định chủ động**. Đã nhấn mạnh **mốc HL TT 39/2024 (01/01/2025)** và **một lượt KCB** (khoản 7 Điều 4). Neo mã nguồn **`dvkt_op_giam_dinh.jsx`** / **`dong_co_giam_dinh.jsx`** giúp AI giải thích **cơ sở pháp lý** không tách rời engine. Việc tiếp: **giám định viên** đối chiếu **Phụ lục Excel BYT + HĐ KCB** tại thời điểm hồ sơ; kỹ thuật chỉ chạy **QA & chỉnh rule** khi có yêu cầu và diff rõ.

---

## H. Ca mẫu gắn engine (bổ sung)

- **Ca 000308 — `DVKT_2587` / `DVKT_2588` (gói PT, ICD O82, thuốc tê/mê trong XML2):** [Ca_huan_luyen_mau_000308_DVKT_2587_2588_PTTT_goi_thuoc.md](./Ca_huan_luyen_mau_000308_DVKT_2587_2588_PTTT_goi_thuoc.md) — audit `test_xml/audit_000308_20260405_083942.json`, seed `du_lieu_luat_pttt_muc11.jsx`.
- **Ca 000502 — `CDHA_164` (MRI, chờ >3 ngày sau vào viện — nội trú):** [Ca_huan_luyen_mau_000502_CDHA_164_MRI_noitru.md](./Ca_huan_luyen_mau_000502_CDHA_164_MRI_noitru.md) — audit `test_xml/audit_000502_20260404_192348.json`, `luat_cdha_hardcoded.jsx`.
- **Ca 000538 — `CDHA_101` (mã máy thiết bị trên X-quang):** [Ca_huan_luyen_mau_000538_CDHA_101_ma_may_XQ.md](./Ca_huan_luyen_mau_000538_CDHA_101_ma_may_XQ.md) — audit `test_xml/audit_000538_20260404_221726.json`.
- **Ca 000375 — `DVKT-OP-09` (danh mục nội bộ / `CHECK_INTERNAL_APPROVAL`):** [Ca_huan_luyen_mau_000375_DVKT_OP_09_danh_muc_noibo.md](./Ca_huan_luyen_mau_000375_DVKT_OP_09_danh_muc_noibo.md) — audit `test_xml/audit_000375_20260405_065828.json` (nằm trong bộ **10 file** `qa:audit-fixtures`).
- **Bảng neo phiên DVKT ↔ mã:** [Bang_neo_phien_huan_luyen_dvkt_va_engine.md](./Bang_neo_phien_huan_luyen_dvkt_va_engine.md) (có bảng phân biệt `DVKT_*` / `CDHA_*` / `DVKT-OP-*`)

### Đánh dấu hoàn thành (mở rộng)

- [ ] Đã đọc mục A–G và thẻ [The_tri_thuc_giam_dinh_DVKT_VBHN_17_BYT.md](./The_tri_thuc_giam_dinh_DVKT_VBHN_17_BYT.md)
- [ ] Đã đọc thẻ kiểm soát lỗi [The_tri_thuc_kiem_soat_loi_dvkt_VBHN17_AI.md](./The_tri_thuc_kiem_soat_loi_dvkt_VBHN17_AI.md) và mục **J** (phiên 1.7)
- [ ] Đã làm bài tập trên ca **000308** (mục 6 trong file ca) hoặc rút gọn tương đương
- [ ] (Tuỳ chọn) Chạy `npm run qa:audit-fixtures` / `npm run qa:on-off-match` sau khi chỉnh seed DVKT–PTTT
- [ ] Đã đi theo **lộ trình ca** mục I (ít nhất đọc + 1 bài tập mỗi ca)

---

## I. Lộ trình ca mẫu đề xuất (thứ tự học)

Nên đi **từ tri thức tổng → gói PTTT → CĐHA hardcoded → engine no-code**, để AI phân biệt **ba nhánh mã** (`DVKT_*` số, `CDHA_*`, `DVKT-OP-*`) trước khi xử lý hồ sơ lẫn nhiều loại cảnh báo.

| Thứ tự | Nội dung | File ca | Audit JSON (tham chiếu) |
|--------|----------|---------|-------------------------|
| 1 | Tri thức VBHN + bảng Điều (chưa cần audit) | Mục A–G file này + [The_tri_thuc_giam_dinh_DVKT_VBHN_17_BYT.md](./The_tri_thuc_giam_dinh_DVKT_VBHN_17_BYT.md) | — |
| 2 | Gói PTTT, ICD, thuốc kèm gói (`DVKT_2587/2588`) | [Ca_huan_luyen_mau_000308_DVKT_2587_2588_PTTT_goi_thuoc.md](./Ca_huan_luyen_mau_000308_DVKT_2587_2588_PTTT_goi_thuoc.md) | `audit_000308_20260405_083942.json` |
| 3 | MRI — thời gian chờ nội trú (`CDHA_164`) | [Ca_huan_luyen_mau_000502_CDHA_164_MRI_noitru.md](./Ca_huan_luyen_mau_000502_CDHA_164_MRI_noitru.md) | `audit_000502_20260404_192348.json` |
| 4 | Mã máy thiết bị (`CDHA_101`) | [Ca_huan_luyen_mau_000538_CDHA_101_ma_may_XQ.md](./Ca_huan_luyen_mau_000538_CDHA_101_ma_may_XQ.md) | `audit_000538_20260404_221726.json` |
| 5 | Danh mục nội bộ M05 (`DVKT-OP-09`) | [Ca_huan_luyen_mau_000375_DVKT_OP_09_danh_muc_noibo.md](./Ca_huan_luyen_mau_000375_DVKT_OP_09_danh_muc_noibo.md) | `audit_000375_20260405_065828.json` |

**Ghi chú:** Trong repo **chỉ có audit thực tế cho `DVKT-OP-09`** trong nhóm `DVKT-OP-*`; các toán tử `DVKT-OP-05`, `DVKT-OP-13`, … cần thêm hồ sơ/audit khi có để lặp lại được.

---

## J. Kiểm soát lỗi DVKT theo VBHN 17 (bổ sung phiên 1.7)

Mục tiêu: AI và người đào tạo có **một lớp phân loại lỗi** giống cách làm với thuốc ([The_tri_thuc_kiem_soat_sai_thuoc_AI.md](./The_tri_thuc_kiem_soat_sai_thuoc_AI.md)), nhưng neo **Điều/Khoản** và **ba nhánh mã** (`DVKT_*` / `CDHA_*` / `DVKT-OP-*`).

- **Đọc:** [The_tri_thuc_kiem_soat_loi_dvkt_VBHN17_AI.md](./The_tri_thuc_kiem_soat_loi_dvkt_VBHN17_AI.md) (mục 2–4: định nghĩa, bảng tra nhanh, nguyên tắc).
- **Làm:** chọn **một** ca trong mục **H** (ưu tiên đúng thứ tự mục **I**), dùng **Prompt mẫu** trong thẻ mục 5 — đầu ra: bảng phân loại từng `ma_luat` + một dòng kết luận nghiệp vụ / giới hạn engine.
- **Không** mở rộng phạm vi sang VTYT sâu — chỉ neo chéo khi cùng dòng tiền **4a** (xem [Chuan_hoa_kien_thuc_AI_giam_dinh_VTYT.md](./Chuan_hoa_kien_thuc_AI_giam_dinh_VTYT.md)).

---

## Liên kết

- Chuẩn hóa kiến thức AI (DVKT): [Chuan_hoa_kien_thuc_AI_giam_dinh_DVKT.md](./Chuan_hoa_kien_thuc_AI_giam_dinh_DVKT.md)
- Kiểm soát lỗi DVKT (VBHN 17): [The_tri_thuc_kiem_soat_loi_dvkt_VBHN17_AI.md](./The_tri_thuc_kiem_soat_loi_dvkt_VBHN17_AI.md)
- Quy trình Cursor + OpenClaw: [Quy_trinh_lam_viec_Cursor_OpenClaw_AI_giam_dinh_BHYT.md](./Quy_trinh_lam_viec_Cursor_OpenClaw_AI_giam_dinh_BHYT.md)
- Thẻ DVKT đầy đủ: [The_tri_thuc_giam_dinh_DVKT_VBHN_17_BYT.md](./The_tri_thuc_giam_dinh_DVKT_VBHN_17_BYT.md)
- Chuỗi văn bản DVKT (mục 11.5): [The_tri_thuc_mau_luat_BHYT_2008_2025.md](./The_tri_thuc_mau_luat_BHYT_2008_2025.md)

---

*Phiên này thay thế prompt OpenClaw khi gateway không tách vai được: mục A–J + tài liệu [Chuan_hoa_kien_thuc_AI_giam_dinh_DVKT.md](./Chuan_hoa_kien_thuc_AI_giam_dinh_DVKT.md) chuẩn hóa suy luận; mục **J** + [The_tri_thuc_kiem_soat_loi_dvkt_VBHN17_AI.md](./The_tri_thuc_kiem_soat_loi_dvkt_VBHN17_AI.md) kiểm soát lỗi.*
