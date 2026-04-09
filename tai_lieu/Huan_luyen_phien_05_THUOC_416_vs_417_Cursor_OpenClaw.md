# Phiên huấn luyện 05 — THUOC_416 vs THUOC_417: hai “cấp dư” trong seed

**Mục phiên:** AI (và người đào tạo) phân biệt **hai rule cùng họ “cấp dư”** trong `du_lieu_luat_thuoc_muc8.jsx`: một dùng **`CALC_SL_MOI_NGAY`** (engine suy từ `LIEU_DUNG` / chuẩn hoá), một dùng **`SL_MOI_NGAY` trên XML2** — và hiểu **cùng một lớp lọc** `locCanhBaoDuongTinhGiaTheoNguCanh` áp cho cả hai (đơn vị, làm tròn, `max(CALC, SL)`).

**Neo engine (bắt buộc):** dòng phiên **05** trong [Bang_neo_phien_huan_luyen_thuoc_va_engine.md](./Bang_neo_phien_huan_luyen_thuoc_va_engine.md).

**Neo chỉ mục:** [The_tri_thuc_chi_muc_giam_dinh_thuoc_engine_AI.md](./The_tri_thuc_chi_muc_giam_dinh_thuoc_engine_AI.md) — §4 (làm giàu XML2), §5 (lọc `THUOC_416` / `THUOC_417`).

---

## 1. Seed — so sánh trực tiếp

| Mã | `TEN_QUY_TAC` (rút gọn) | `DIEU_KIEN` (ý niệm) |
|----|-------------------------|----------------------|
| **THUOC_416** | Giám định Thuốc cấp dư | `SO_LUONG > (CALC_SL_MOI_NGAY * SO_NGAY)` |
| **THUOC_417** | Giám định thuốc cấp dư (Dựa trên y lệnh) | `XML2.SO_LUONG > (XML2.SL_MOI_NGAY * XML2.SO_NGAY)` |

Nguồn: `ma_nguon/tien_ich/du_lieu_luat_thuoc_muc8.jsx` — `SEED_THUOC_416`, `SEED_THUOC_417`.

**Bài học huấn luyện:** Cùng là “cấp dư”, nhưng **tử số / mẫu số trong biểu thức seed khác nhau**. Trong engine hiện tại, `enrichXML2Data` có thể **đồng nhất** CALC và SL từ cùng parse `LIEU_DUNG` — nên khó có audit XML tối giản **chỉ** `THUOC_416` mà không đụng `THUOC_417`; ưu tiên đối chiếu [ca 000589](./Ca_huan_luyen_mau_000589_nhieu_nhom_thuoc_mot_ho_so.md) cho `THUOC_417`.

---

## 2. Hành vi engine sau seed (cùng file `dong_co_giam_dinh.jsx`)

1. **Ngưỡng “y lệnh thực tế” khi lọc:** Với `THUOC_417` và `THUOC_416`, trước khi giữ cảnh báo, engine kiểm tra `max(CALC_SL_MOI_NGAY, SL_MOI_NGAY)` và `SO_NGAY` — nếu không suy ra được liều/ngày > 0 và số ngày > 0 thì **bỏ cảnh báo**.
2. **Lọc đơn vị:** `coLechDonViYLenhVaCapPhatThuoc` — giống nhóm `THUOC_391` (phiên 02).
3. **Lọc làm tròn:** `laVuotNguongDoLamTronThuoc` — nếu “dư” chỉ do **làm tròn lên 1 đơn vị rời rạc** khi tích y lệnh có phần thập phân, cảnh báo có thể **không hiển thị**.

Chi tiết bảng lọc: `The_tri_thuc_chi_muc_giam_dinh_thuoc_engine_AI.md` §5.

---

## 3. Ca mẫu / audit trong repo

- [Ca_huan_luyen_mau_000589_nhieu_nhom_thuoc_mot_ho_so.md](./Ca_huan_luyen_mau_000589_nhieu_nhom_thuoc_mot_ho_so.md) — `THUOC_417`, audit `test_xml/audit_000589_*.json`.
- **THUOC_416:** xem §1 — cần mở rộng enrich hoặc hồ sơ thật để tách CALC vs SL khai trên XML.

---

## 4. Việc làm trong **Cursor** (20–30 phút)

1. Mở seed `SEED_THUOC_416` và `SEED_THUOC_417` trong `du_lieu_luat_thuoc_muc8.jsx` — chép **nguyên văn** hai dòng `DIEU_KIEN`.
2. Trong `dong_co_giam_dinh.jsx`, tìm khối `THUOC_417` / `THUOC_416` trong `locCanhBaoDuongTinhGiaTheoNguCanh` — ghi **một câu** về `max(CALC_SL_MOI_NGAY, SL_MOI_NGAY)`.
3. (Tuỳ chọn) Đọc `laVuotNguongDoLamTronThuoc` — ví dụ số minh hoạ làm tròn.

---

## 5. Việc làm trong **OpenClaw** (dán lần lượt)

**Bước A — Phân biệt hai rule**

```text
Workspace: ung_dung_cdss_bhyt.
Đọc tai_lieu/Huan_luyen_phien_05_THUOC_416_vs_417_Cursor_OpenClaw.md và tai_lieu/The_tri_thuc_chi_muc_giam_dinh_thuoc_engine_AI.md (§4–§5).

Xuất:
(1) Bảng 3 cột: Khái niệm | THUOC_416 | THUOC_417
(2) 3 bullet: Khi nào chỉ một trong hai có thể kích hoạt (không PII).
Không sửa file.
```

**Bước B — Giải thích cho giám định viên**

```text
Giải thích tiếng Việt đơn giản (tối đa 8 câu): "Cấp dư theo CALC" vs "cấp dư theo SL trên XML", và vì sao audit vẫn có thể không có THUOC_417 sau lọc làm tròn.
```

**Bước C — Chuẩn bị ca THUOC_416 (outline)**

```text
Đề xuất outline file Ca_huan_luyen_mau_*_THUOC_416.md: metadata, bảng trường XML2 cần, kỳ vọng có THUOC_416 mà không nhầm với 417. Không ghi file.
```

---

## 6. Đánh dấu hoàn thành phiên

- [ ] Đã ghi nhận sự khác biệt **CALC_SL** vs **SL_MOI_NGAY** trong seed  
- [ ] Đã đọc §5 chỉ mục engine (lọc đơn vị + làm tròn)  
- [ ] OpenClaw đã trả lời A–C  

---

*Phiên trước:* [Huan_luyen_phien_04_THUOC_419_hang_BV.md](./Huan_luyen_phien_04_THUOC_419_hang_BV.md)
