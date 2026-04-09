# Phiên huấn luyện 04 — THUOC_419: Hạng bệnh viện vs danh mục thuốc

**Mục phiên:** AI hiểu rule **THUOC_419** là so sánh **ngưỡng hạng tối thiểu trên danh mục thuốc** (`DM_THUOC.HANG_BV_MIN`) với **hạng cơ sở KCB** (`CSKCB.HANG_BV`) trong ngữ cảnh engine — và **liên hệ** với tra cứu **Phụ lục I cột (4)–(7)** trong thẻ thanh toán thuốc (không thay thế đối chiếu pháp lý tay).

**Neo pháp lý / nghiệp vụ:** [The_tri_thuc_mau_thanh_toan_thuoc_BHYT.md](./The_tri_thuc_mau_thanh_toan_thuoc_BHYT.md) (§3.4 Phụ lục I; §3.5 `MA_CSKCB` 94170 — cột **(6)** cho Phương Châu).

**Neo mã:** `ma_nguon/tien_ich/du_lieu_luat_thuoc_muc8.jsx` — `SEED_THUOC_419`.

**Ca + audit:** [Ca_huan_luyen_mau_TRAINHL419_THUOC_419.md](./Ca_huan_luyen_mau_TRAINHL419_THUOC_419.md) — engine dùng evaluator đặc biệt `THUOC_419` + cột `HANG_BV_MIN` trên danh mục thuốc BV + trường `CSKCB_HANG_BV` trên XML1 (huấn luyện).

**Neo engine (bắt buộc):** dòng phiên **04** trong [Bang_neo_phien_huan_luyen_thuoc_va_engine.md](./Bang_neo_phien_huan_luyen_thuoc_va_engine.md).

---

## 1. Seed THUOC_419 (trích)

| Trường | Giá trị |
|--------|---------|
| **MA_LUAT** | `THUOC_419` |
| **TEN_QUY_TAC** | Hạng bệnh viện thấp hơn quy định |
| **DIEU_KIEN** | `DM_THUOC.HANG_BV_MIN < CSKCB.HANG_BV` |
| **CANH_BAO** | `⛔ [VBHN 15]: Thuốc chỉ được sử dụng tại bệnh viện hạng Đặc biệt, hạng I. Bệnh viện hạng hiện tại không đủ điều kiện thanh toán.` |

**Bài học huấn luyện:** Cảnh báo gốc nêu **Đặc biệt / I**; điều kiện kỹ thuật lại là **hai biến số** từ DM và CSKCB. AI **không** được giải thích ngược đời số hạng nếu chưa biết **quy ước mã số** trong danh mục nội bộ (thứ tự số nhỏ = hạng cao hay thấp). Khi huấn luyện, yêu cầu dev/giám định **chỉ rõ bảng tra** hoặc đoạn mã gán `CSKCB.HANG_BV`.

**Gợi ý tra cứu trong repo:** Trong seed luật khác có dùng `CSKCB.HANG_BV == '1'` (ví dụ `du_lieu_luat_hanh_chinh_muc2.jsx`) — cho thấy `HANG_BV` thường là **mã dạng chuỗi** trong ngữ cảnh rule; riêng `THUOC_419` dùng toán tử **`<`** giữa `HANG_BV_MIN` và `HANG_BV` — cần xác nhận engine **so sánh số hay chuỗi** trước khi diễn giải nghiệp vụ.

---

## 2. Việc làm trong **Cursor** (20–30 phút)

1. Đọc `The_tri_thuc_mau_thanh_toan_thuoc_BHYT.md` §3.4–3.5 — ghi **một câu** liên hệ “cột Phụ lục I” với “hạng BV trên XML/danh mục”.  
2. Trong repo, tìm chỗ **nạp** `CSKCB` / `HANG_BV` cho luật động (gợi ý từ khóa: `CSKCB`, `HANG_BV`, `MA_CSKCB` trong `dong_co_giam_dinh.jsx` hoặc file map CSKCB). Ghi **đường dẫn file + tên hàm/biến** nếu tìm thấy; nếu không, ghi “cần hỏi maintainer”.  
3. So sánh **một dòng** ý nghĩa: *khi nào `HANG_BV_MIN < HANG_BV` đúng với câu chữ “BV hiện tại không đủ hạng”* — chỉ trả lời sau khi đã xác nhận quy ước số (không bịa).

---

## 3b. Ví dụ huấn luyện — cẩn trọng

1. **Thiếu `HANG_BV_MIN` trên dòng danh mục thuốc** — điều kiện có thể **không xác định** hoặc hành vi mặc định khác; AI không kết luận “đúng hạng” chỉ vì không thấy cảnh báo.  
2. **Cơ sở chi nhánh / mã CSKCB đổi** — `MA_CSKCB` 94170 và quy ước **cột (6)** Phụ lục I (thẻ tri thức nội bộ) là **bối cảnh Phương Châu**; cơ sở khác phải tra **đúng hạng** trong danh mục BHXH + Phụ lục I cho từng hoạt chất.  
3. **Chỉ định ICD đúng nhưng hạng BV sai** — vẫn có thể **xuất toán thanh toán** theo Phụ lục I dù lâm sàng hợp lý; AI phân biệt **an toàn kê đơn** vs **điều kiện BHYT thanh toán**.

---

## 4. Việc làm trong **OpenClaw** (dán lần lượt)

**Bước A — Liên hệ thẻ tri thức và seed**

```text
Workspace: ung_dung_cdss_bhyt.
Đọc tai_lieu/Huan_luyen_phien_04_THUOC_419_hang_BV.md và tai_lieu/The_tri_thuc_mau_thanh_toan_thuoc_BHYT.md (§3.4, §3.5).

Xuất:
(1) 5 bullet: Phụ lục I cột (4)–(7) liên quan gì đến THUOC_419 trong engine?
(2) Bảng: Khái niệm | Nguồn dữ liệu (XML/DM) | Rủi ro khi AI suy diễn.
Không PII; không sửa file.
```

**Bước B — Giải thích cho giám định viên**

```text
Giải thích bằng tiếng Việt đơn giản (8 câu tối đa): THUOC_419 là gì, khác gì với việc chỉ nhìn MA_THUOC trên XML2.
```

**Bước C — Outline ca mẫu tương lai**

```text
Đề xuất outline file Ca_huan_luyen_mau_*_THUOC_419.md: metadata, bảng giả XML1 (MA_CSKCB), DM thuốc (HANG_BV_MIN), kỳ vọng có/không cảnh báo. Không ghi file.
```

---

## 5. Đánh dấu hoàn thành phiên

- [ ] Đã xác minh (từ mã hoặc maintainer) **quy ước số hạng** cho `HANG_BV` / `HANG_BV_MIN`  
- [ ] Đã đọc §3.4–3.5 thẻ thanh toán thuốc  
- [ ] OpenClaw đã trả lời A–C  

---

*Phiên trước:* [Huan_luyen_phien_03_THUOC_418_CLN_THUOC_04.md](./Huan_luyen_phien_03_THUOC_418_CLN_THUOC_04.md)  
*Phiên sau:* [Huan_luyen_phien_05_THUOC_416_vs_417_Cursor_OpenClaw.md](./Huan_luyen_phien_05_THUOC_416_vs_417_Cursor_OpenClaw.md)
