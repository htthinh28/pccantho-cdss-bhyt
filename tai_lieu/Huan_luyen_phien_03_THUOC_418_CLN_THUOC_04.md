# Phiên huấn luyện 03 — Đơn thuốc ngoại trú >30 ngày: THUOC_418 vs CLN-THUOC-04

**Mục phiên:** AI và giám định viên phân biệt **hai lớp kiểm tra** cùng chủ đề “đơn dài ngày” ngoại trú: rule **seed** `THUOC_418` và rule **built-in** `CLN-THUOC-04`; tránh gộp nghĩa hoặc kết luận sai khi chỉ nhìn `SO_NGAY` trên XML2.

**QA gợi ý trước/sau phiên:** `npm run qa:audit-fixtures` (snapshot 10 file chuẩn). **Ca + audit huấn luyện:** [Ca_huan_luyen_mau_TRAINHL03_THUOC_418_CLN_THUOC_04.md](./Ca_huan_luyen_mau_TRAINHL03_THUOC_418_CLN_THUOC_04.md) — `npm run qa:claim-audit` đã nạp seed `LUAT_THUOC` (xem `scripts/claim_audit_entry.jsx`).

**Neo engine (bắt buộc):** dòng phiên **03** trong [Bang_neo_phien_huan_luyen_thuoc_va_engine.md](./Bang_neo_phien_huan_luyen_thuoc_va_engine.md).

---

## 1. Hai tầng trong engine (neo tài liệu + mã)

| Mã | Nguồn | Ý tưởng điều kiện (tóm tắt) |
|----|--------|------------------------------|
| **THUOC_418** | Seed `du_lieu_luat_thuoc_muc8.jsx` | Ngoại trú (`MA_LOAI_KCB == '1'`), `XML2.SO_NGAY > 30`, **loại trừ** một số `MA_BENH_CHINH` (I10, E11, E10, B20) và **loại trừ** chẩn đoán ra viện khớp regex (tăng huyết áp, đái tháo đường, HIV, …). → **Xuất toán** theo cảnh báo seed. |
| **CLN-THUOC-04** | Built-in `dong_co_giam_dinh.jsx` → `giamDinhThuoc` | Ngoại trú, `max(SO_NGAY_DTRI, SO_NGAY) > 30` và **không** thuộc danh mục ICD được phép kê >30 ngày — phụ thuộc `dm.BO_QUY_TAC_ICD10_KE_DON_TREN_30_NGAY` và `isClaimAllowedPrescriptionOver30Days`. |

Chi tiết built-in: `The_tri_thuc_chi_muc_giam_dinh_thuoc_engine_AI.md` §3.1 (bảng `CLN-THUOC-04`).

**Seed THUOC_418 (trích nguyên văn điều kiện + cảnh báo):**

- `DIEU_KIEN`:  
  `XML1.MA_LOAI_KCB == '1' AND XML2.SO_NGAY > 30 AND XML1.MA_BENH_CHINH NOT IN ('I10','E11','E10','B20') AND XML1.CHAN_DOAN_RV NOT REGEXP '(?i)(TĂNG HUYẾT ÁP|CAO HUYẾT ÁP|ĐÁI THÁO ĐƯỜNG|ĐÁI THÁO ĐƯỜNG TÝP 1|HIV)'`
- `CANH_BAO`:  
  `⛔ [XUẤT TOÁN]: Đơn thuốc ngoại trú vượt quá 30 ngày (trừ bệnh mạn tính quy định tại Phụ lục TT 26/2025).`

---

## 2. Việc làm trong **Cursor** (20–30 phút)

1. Mở `The_tri_thuc_chi_muc_giam_dinh_thuoc_engine_AI.md` §3.1 — đọc dòng **CLN-THUOC-04**.  
2. Trong `du_lieu_luat_thuoc_muc8.jsx`, tìm `SEED_THUOC_418` — đối chiếu với bảng §1 file này.  
3. **Câu hỏi tự kiểm:** Một hồ sơ có thể **chỉ** trúng CLN-THUOC-04 mà **không** trúng THUOC_418 (hoặc ngược lại) trong lý thuyết? Ghi **2 bullet** lý do (gợi ý: `MA_BENH_CHINH` vs danh mục dm; `CHAN_DOAN_RV` vs `isClaimAllowedPrescriptionOver30Days`; `SO_NGAY` vs `SO_NGAY_DTRI`).  
4. (Tuỳ chọn) Tìm trong `dong_co_giam_dinh.jsx` chuỗi `CLN-THUOC-04` hoặc `KE_DON_TREN_30` — một câu mô tả “dữ liệu master cần có”.

---

## 3b. Ví dụ huấn luyện — không kết luận vội

1. **ICD chính I10, đơn 45 ngày** — THUOC_418 **không** kích (NOT IN I10); CLN-THUOC-04 **có thể** vẫn xét tùy `isClaimAllowedPrescriptionOver30Days` và bảng ICD. AI **không** được nói “hết lỗi” chỉ vì một trong hai không báo.  
2. **`MA_LOAI_KCB` không phải `'1'`** — THUOC_418 **không** áp; đơn dài ngày **nội trú/ảnh khác** do rule khác xử lý.  
3. **Chẩn đoán RV chứa từ khóa tăng huyết áp (text)** — THUOC_418 có thể **tắt** nhờ `CHAN_DOAN_RV` regex; nếu encoding/ký tự XML khác chuẩn, **regex có thể không khớp** → rủi ro báo nhầm; cần kiểm tra thực tế trường trên XML.

---

## 4. Việc làm trong **OpenClaw** (dán lần lượt)

**Bước A — Bảng đối chiếu**

```text
Workspace: ung_dung_cdss_bhyt.
Đọc tai_lieu/Huan_luyen_phien_03_THUOC_418_CLN_THUOC_04.md và tai_lieu/The_tri_thuc_chi_muc_giam_dinh_thuoc_engine_AI.md (§3.1).

Xuất bảng: Tiêu chí | THUOC_418 | CLN-THUOC-04 (nguồn, điều kiện chính, mức độ cảnh báo nếu suy từ tài liệu).
Thêm 4 câu hỏi phân biệt cho giám định viên.
Không PII; không sửa file.
```

**Bước B — Rủi ro triển khai**

```text
Dựa trên §3b của tai_lieu/Huan_luyen_phien_03_THUOC_418_CLN_THUOC_04.md, liệt kê 5 rủi ro khi AI tự động kết luận "đơn >30 ngày vi phạm" mà không đọc XML1/XML2 đủ trường.
```

**Bước C — Đề xuất ca mẫu tương lai**

```text
Đề xuất cấu trúc 1 file Ca_huan_luyen_mau_*_THUOC_418.md (metadata, bảng XML1/XML2 giả, kỳ vọng THUOC_418 vs CLN-THUOC-04). Không cần ghi file, chỉ outline markdown.
```

---

## 5. Đánh dấu hoàn thành phiên

- [ ] Đã đọc §1–§3b và ghi 2 bullet “khác biệt hai tầng”  
- [ ] OpenClaw đã trả lời A–C (lưu biên bộ nội bộ nếu cần)  
- [ ] (Khuyến nghị) Lên kế hoạch thêm 1 audit `test_xml/` có `THUOC_418` hoặc `CLN-THUOC-04`  

---

*Phiên trước:* [Huan_luyen_phien_02_THUOC_391_Cursor_OpenClaw.md](./Huan_luyen_phien_02_THUOC_391_Cursor_OpenClaw.md)  
*Phiên sau:* [Huan_luyen_phien_04_THUOC_419_hang_BV.md](./Huan_luyen_phien_04_THUOC_419_hang_BV.md)
