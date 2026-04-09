# Sprint 60 phút — Một vòng huấn luyện giám định thuốc (Cursor + OpenClaw)

**Mục tiêu thực tế trong 60 phút:** Hoàn thành **một vòng** “tri thức → engine → ca/audit → QA → ghi nhận”, *không* phải toàn bộ nghiệp vụ thuốc BHYT. Dùng song song **Cursor** (sửa/đọc repo, trace mã) và **OpenClaw** (tóm tắt, đối chiếu nhiều file, checklist) nếu gateway đang chạy.

**Tài liệu neo:** [The_tri_thuc_mau_thanh_toan_thuoc_BHYT.md](./The_tri_thuc_mau_thanh_toan_thuoc_BHYT.md), [The_tri_thuc_chi_muc_giam_dinh_thuoc_engine_AI.md](./The_tri_thuc_chi_muc_giam_dinh_thuoc_engine_AI.md), [Prompt_mau_chuan_hoa_BHYT_Cursor_OpenClaw.md](./Prompt_mau_chuan_hoa_BHYT_Cursor_OpenClaw.md).

**Mã nguồn neo:** `ma_nguon/tien_ich/dong_co_giam_dinh.jsx`, `ma_nguon/tien_ich/luat_thuoc_hardcoded.jsx`, `ma_nguon/tien_ich/du_lieu_luat_thuoc_muc8.jsx`.

---

## 0. Chuẩn bị trước khi bấm giờ (≤ 5 phút — không tính vào 60 phút hoặc gộp vào phút 0–5)

| Việc | Kiểm tra |
|------|----------|
| Repo mở đúng `ung_dung_cdss_bhyt` | ✓ |
| `GEMINI_API_KEY` + `%USERPROFILE%\.openclaw\.env` | ✓ |
| `openclaw daemon status` → gateway **running**, port **18789** | ✓ (nếu dùng OpenClaw) |
| Token client OpenClaw khớp `gateway.auth.token` trong `openclaw.json` | ✓ |
| Không mở hồ sơ có PII thật trong prompt | ✓ |

---

## Phút 0–10 — Neo tri thức & chỉ mục engine

**Cursor (bắt buộc):**

1. Mở và đọc lướt §1–§4 của `The_tri_thuc_mau_thanh_toan_thuoc_BHYT.md` (khái niệm thanh toán vs an toàn, XML1+XML2, cột Phụ lục I).
2. Đọc toàn bộ `The_tri_thuc_chi_muc_giam_dinh_thuoc_engine_AI.md` (bảng `CLN-THUOC-*`, `DM-THUOC-*`, `THUOC_*`, lọc `locCanhBaoDuongTinhGiaTheoNguCanh`).

**OpenClaw (song song, nếu có):** Dán prompt **P1** (mục M trong file Prompt mẫu).

**Kết quả chốt 10 phút:** Một dòng ghi chú tay hoặc trong chat: *“Thuốc: nguồn cảnh báo = hardcoded seed + built-in DM; phải đọc điều kiện từng `MA_LUAT` trong seed, không đoán.”*

---

## Phút 10–25 — Chọn một trục huấn luyện + một mã luật cụ thể

**Chọn 1 trong 2 trục** (đừng làm cả hai):

| Trục | Gợi ý | Việc làm trong Cursor |
|------|--------|------------------------|
| **A. Nghiệp vụ Phụ lục I / thanh toán** | §3.4–3.5 thẻ thanh toán thuốc | Liệt kê 3 điều kiện cần kiểm tra khi `MA_CSKCB = 94170` + 1 ví dụ giả. |
| **B. Engine / một mã cảnh báo** | `THUOC_391`, `THUOC_417`, hoặc `CLN-THUOC-04` | Tìm trong `du_lieu_luat_thuoc_muc8.jsx` hoặc chỉ mục engine dòng điều kiện; copy **mã luật + ý điều kiện** (không cần paste cả file). |

**OpenClaw:** Prompt **P2** — tóm tắt bảng “mã luật | ý nghĩa | file tham chiếu” từ nội dung bạn vừa trích.

**Kết quả chốt 25 phút:** Tên mã luật/chủ đề đã chọn + 3 bullet “khi nào kích hoạt / khi nào bị lọc”.

---

## Phút 25–40 — Gắn với ca mẫu hoặc audit JSON (không PII)

**Cursor:**

1. Mở **một** file trong `tai_lieu/Ca_huan_luyen_mau_*THUOC*.md` **hoặc** một `test_xml/audit_*.json` có chứa mã luật bạn chọn (dùng tìm kiếm theo `THUOC_` / `DM-THUOC`).
2. Viết 5–7 dòng: *input chính* → *kỳ vọng cảnh báo* → *có khớp seed/engine không* (nếu không khớp, ghi “cần trace thêm”).

**OpenClaw:** Prompt **P3** — đối chiếu ca mẫu với đoạn bạn trích từ chỉ mục engine (chỉ phân tích, không sửa repo trừ khi bạn yêu cầu riêng).

**Kết quả chốt 40 phút:** Đoạn “hồ sơ giả / audit” + kết luận 1 câu.

---

## Phút 40–52 — QA tự động (nếu môi trường sẵn sàng)

Từ thư mục gốc repo (PowerShell):

```powershell
npm run qa:audit-fixtures
```

Hoặc (kiểm tra khớp on/off quy tắc, nếu phù hợp ngữ cảnh hiện tại):

```powershell
npm run qa:on-off-match
```

**Cursor:** Dán output (đã cắt phần nhạy cảm) + hỏi: *“Kết luận pass/fail và có cảnh báo thuốc nào lệch với tài liệu không?”*

**OpenClaw:** Prompt **P4** — checklist 5 mục “việc cần làm nếu QA fail”.

**Kết quả chốt 52 phút:** Pass/fail + 1 hành động ưu tiên (sửa doc / sửa seed / bổ sung ca).

---

## Phút 52–60 — Bàn giao & cố định tri thức

Làm **một** việc sau (chọn một):

- Cập nhật **một dòng** vào `The_tri_thuc_chi_muc_giam_dinh_thuoc_engine_AI.md` (ví dụ: ghi chú huấn luyện mới cho mã luật đã chọn), **hoặc**
- Tạo/ghi thêm mục vào file ca mẫu liên quan (nếu team cho phép), **hoặc**
- Chỉ ghi **biên bản ngắn** trong issue nội bộ / nhật ký: ngày, mã luật, kết quả QA.

**OpenClaw:** Prompt **P5** — biên bản 8 dòng tối đa cho người không chuyên CNTT.

---

## Định nghĩa “xong trong 60 phút”

Phiên được coi là **hoàn chỉnh** khi:

- [ ] Đã đọc chỉ mục engine + một trục (A hoặc B) có tên cụ thể.
- [ ] Đã liên kết với **ít nhất một** ca/audit trong repo (hoặc giải thích vì sao không tìm thấy).
- [ ] Đã chạy **ít nhất một** lệnh `npm run qa:*` hoặc ghi rõ *“môi trường chưa chạy được — lý do”*.
- [ ] Có **một** bản ghi cập nhật (file tai_lieu hoặc biên bản).

---

## Nếu thiếu thời gian

Bỏ bớt theo thứ tự: OpenClaw P4/P5 → QA thứ hai → trục A (giữ trục B nếu ưu tiên kỹ thuật).

---

*Phiên bản: 1.0 — đồng bộ quy trình Cursor + OpenClaw cho giám định thuốc.*
