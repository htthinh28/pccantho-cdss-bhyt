# Phiên làm việc chung: Cursor AI + OpenClaw (cùng một nhiệm vụ)

## 0. Ranh giới (mọi phiên đều nhắc lại)

| | **Cursor (IDE)** | **OpenClaw (gateway / agent)** |
|--|------------------|----------------------------------|
| **Chính** | Sửa mã trong repo, trace luồng, **chạy QA** (`npm run qa:*`, audit), viết patch, cập nhật `test_xml` / seed khi cần | Đọc/tổng hợp **tri thức** trong `tai_lieu/`, soạn **báo cáo / checklist / biên bản**, đối chiếu nhiều file theo prompt |
| **Không đổi vai** | Không thay OpenClaw khi cần **diff rõ + chạy lệnh cục bộ** | Không thay Cursor khi cần **sửa engine hoặc xác nhận PASS/FAIL QA** trừ khi bạn bật tool và chấp nhận rủi ro |

Hai kênh **không tự nối API**. **Bạn** chuyển tiếp: kết quả Cursor → OpenClaw theo **§0.1** hoặc file [Mau_handoff_Cursor_sang_OpenClaw.md](./Mau_handoff_Cursor_sang_OpenClaw.md).

**Ví dụ regression (cảnh báo ≠ kết luận):** [Vi_du_regression_canh_bao_THUOC_XML_an_danh.md](./Vi_du_regression_canh_bao_THUOC_XML_an_danh.md).

---

## 0.1. Mẫu handoff Cursor → OpenClaw

Copy theo file đầy đủ: **[Mau_handoff_Cursor_sang_OpenClaw.md](./Mau_handoff_Cursor_sang_OpenClaw.md)** (rule, file nguồn, kết quả QA, 2–3 ghi chú nghiệp vụ).

---

## 1. Cách “cùng làm” trong thực tế

Hai kênh **không tự nối API** với nhau. **Bạn** giữ vai trò trung tâm:

1. **Cursor** — trợ lý trong IDE: đọc/sửa repo, trace mã, chạy `npm run qa:*`, viết patch.
2. **OpenClaw** — agent qua gateway: đọc nhiều file, tóm tắt, bảng đối chiếu, checklist, biên bản nội bộ.

**Luồng khuyến nghị:** mở **hai cửa sổ** (Cursor chat + OpenClaw), làm **theo thứ tự** dưới đây; copy kết quả từ Cursor sang OpenClaw khi prompt yêu cầu.

---

## 2. Nhiệm vụ phiên mẫu: “Khóa vòng huấn luyện giám định thuốc (THUOC_417 + QA)”

### Bước 1 — OpenClaw (dán ngay)

```text
Workspace: ung_dung_cdss_bhyt.

Đọc các file:
- tai_lieu/The_tri_thuc_chi_muc_giam_dinh_thuoc_engine_AI.md
- tai_lieu/The_tri_thuc_mau_thanh_toan_thuoc_BHYT.md (chỉ §1–§3)

Xuất:
(1) Bảng: nhóm mã CLN-THUOC / DM-THUOC / THUOC_ | vai trò | nguồn trong mã (tên file).
(2) 5 bullet: khi nào cảnh báo THUOC_417 có thể bị lọc sau filter (theo đúng chỉ mục engine).
(3) 3 câu hỏi kiểm tra cho giám định viên trước khi kết luận “cấp dư thuốc”.

Không sửa file; không dữ liệu PII.
```

### Bước 2 — Cursor (đã chuẩn bị sẵn trong phiên này — copy sang OpenClaw nếu cần)

Trích từ seed `ma_nguon/tien_ich/du_lieu_luat_thuoc_muc8.jsx` (bản ghi `SEED_THUOC_417`):

- **MA_LUAT:** `THUOC_417`
- **TEN_QUY_TAC:** Giám định thuốc cấp dư (Dựa trên y lệnh)
- **DIEU_KIEN:** `XML2.SO_LUONG > (XML2.SL_MOI_NGAY * XML2.SO_NGAY)`
- **CANH_BAO (mẫu):** Xuất toán khi số lượng kê vượt tích `SL_MOI_NGAY × SO_NGAY` (template có `{TEN_THUOC}`, `{DU_QTY}`, …).

**OpenClaw — bước 2b (dán sau khi có trích trên):**

```text
Dựa trên trích seed THUOC_417 sau:
"""
MA_LUAT: THUOC_417
DIEU_KIEN: XML2.SO_LUONG > (XML2.SL_MOI_NGAY * XML2.SO_NGAY)
TEN_QUY_TAC: Giám định thuốc cấp dư (Dựa trên y lệnh)
"""

Hãy lập bảng: Cột | Ý nghĩa | Ghi chú lọc ngữ cảnh (theo chỉ mục engine: đơn vị y lệnh vs cấp phát, làm tròn).
Không sửa mã.
```

### Bước 3 — Cursor: QA (đã chạy trong phiên hợp tác)

| Lệnh | Kết quả (snapshot) |
|------|---------------------|
| `npm run qa:audit-fixtures` | Đủ 10 file `test_xml/`, MA_LK khớp |
| `npm run qa:on-off-match` | `[OK]` toàn bộ mẫu chuẩn hóa mã ON/OFF |

**OpenClaw — bước 3b:**

```text
QA đã chạy:
- qa:audit-fixtures → đủ 10 file, MA_LK khớp
- qa:on-off-match → khớp mẫu ON/OFF ổn định

Hãy cho checklist 5 bước “nếu sau này qa:audit-fixtures fail thì làm gì” (ưu tiên giám định thuốc / test_xml).
```

### Bước 4 — OpenClaw: biên bản ngắn (P5)

```text
Viết biên bản tối đa 8 câu, tiếng Việt đơn giản:
- Chủ đề: huấn luyện giám định thuốc, mã THUOC_417
- QA: audit fixtures + on-off match đều pass trong phiên Cursor
- Việc tiếp: giám định viên xác minh ca thực tế và Phụ lục I khi kết luận thanh toán

Không ghi key API; không PII.
```

---

## 3. Biên bản phiên (điền thủ công sau khi OpenClaw trả lời)

| Hạng mục | Cursor (IDE) | OpenClaw |
|----------|----------------|----------|
| Đọc chỉ mục engine + seed THUOC_417 | Đã trích điều kiện seed | *(dán tóm tắt bảng bước 1–2b)* |
| QA | `qa:audit-fixtures` PASS; `qa:on-off-match` PASS | *(dán checklist bước 3b)* |
| Bàn giao | Patch/tài liệu (nếu có) | *(dán biên bản bước 4)* |
| Ngày / người ghi | | |

---

## 4. Liên kết

- Sprint 60 phút: [Sprint_60p_huan_luyen_giam_dinh_thuoc_Cursor_OpenClaw.md](./Sprint_60p_huan_luyen_giam_dinh_thuoc_Cursor_OpenClaw.md)
- Prompt mẫu (P1–P5): [Prompt_mau_chuan_hoa_BHYT_Cursor_OpenClaw.md](./Prompt_mau_chuan_hoa_BHYT_Cursor_OpenClaw.md) — mục **M** (handoff)
- Bảng neo phiên huấn luyện thuốc ↔ engine: [Bang_neo_phien_huan_luyen_thuoc_va_engine.md](./Bang_neo_phien_huan_luyen_thuoc_va_engine.md)
- Ví dụ regression cảnh báo THUOC/XML (ẩn danh): [Vi_du_regression_canh_bao_THUOC_XML_an_danh.md](./Vi_du_regression_canh_bao_THUOC_XML_an_danh.md)

---

*Phiên bản 1.1 — nhấn mạnh ranh giới Cursor/OpenClaw, handoff và neo engine; cập nhật khi đổi mã luật trọng tâm.*
