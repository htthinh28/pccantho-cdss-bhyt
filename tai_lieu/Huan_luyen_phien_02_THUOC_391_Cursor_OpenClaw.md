# Phiên huấn luyện 02 — THUOC_391 (Cursor + OpenClaw)

**Trạng thái QA snapshot:** `npm run qa:audit-fixtures` — đủ 10 file, MA_LK khớp (chạy trước phiên).

**Mục phiên:** AI (và người đào tạo) phân biệt **cấp ít hơn y lệnh** (`THUOC_391`) với **cấp dư** (`THUOC_417`), biết **khi nào cảnh báo bị lọc** (đơn vị / làm tròn), neo đúng **ca mẫu** trong repo.

**Neo engine (bắt buộc):** dòng phiên **02** trong [Bang_neo_phien_huan_luyen_thuoc_va_engine.md](./Bang_neo_phien_huan_luyen_thuoc_va_engine.md).

---

## 1. Neo seed (sự thật trong mã)

| Mã | Điều kiện (tóm tắt) | Mức độ / ý nghĩa |
|----|---------------------|------------------|
| **THUOC_391** | `XML2.SO_LUONG < (XML2.SL_MOI_NGAY * XML2.SO_NGAY)` | Kiểm tra — cấp phát **thấp hơn** tích y lệnh |
| **THUOC_417** | `XML2.SO_LUONG > (XML2.SL_MOI_NGAY * XML2.SO_NGAY)` | Xuất toán — cấp **dư** so với y lệnh |

Nguồn: `ma_nguon/tien_ich/du_lieu_luat_thuoc_muc8.jsx` (`SEED_THUOC_391`, `SEED_THUOC_417`).

Engine có thể **thêm khối “Cách tính”** cho `THUOC_391` sau render (xem `The_tri_thuc_chi_muc_giam_dinh_thuoc_engine_AI.md` §4 — `boSungChiTietCanhBaoGiaiTrinh`).

**Lọc ngữ cảnh:** `THUOC_391` có thể bị loại khi **đơn vị y lệnh vs cấp phát không tương thích** hoặc **làm tròn** — cùng nhóm lý do với `THUOC_417` trong bảng `locCanhBaoDuongTinhGiaTheoNguCanh` (đọc chỉ mục engine).

---

## 2. Ca mẫu trong repo (bắt buộc đọc một trong hai)

- [Ca_huan_luyen_mau_000308_THUOC_391_sai_lech_so_luong_y_lenh.md](./Ca_huan_luyen_mau_000308_THUOC_391_sai_lech_so_luong_y_lenh.md) — ngoại trú / Biofazolin, audit `test_xml/audit_000308_20260405_083942.json`
- [Ca_huan_luyen_mau_000573_THUOC_391_Dafodin_giuong_PT.md](./Ca_huan_luyen_mau_000573_THUOC_391_Dafodin_giuong_PT.md) — giường / PT, cùng mã `THUOC_391`

---

## 3. Việc làm trong **Cursor** (15–25 phút)

1. Mở một ca mẫu trên; đối chiếu 3 dòng trong §4 với bảng seed ở §1 file này.
2. (Tuỳ chọn) Trong `dong_co_giam_dinh.jsx`, tìm `THUOC_391` hoặc `boSungChiTietCanhBaoGiaiTrinh` — ghi **một câu** “sau bước nào cảnh báo được làm giàu”.
3. Đọc **§3b** dưới đây (đã chốt 3 tình huống giả); có thể bổ sung ví dụ số cụ thể nội bộ BV.

### 3b. Ví dụ huấn luyện — lọc ngữ cảnh (THUOC_391)

Các tình huống **giả**, không PII; mục đích: AI **không** kết luận “thiếu cấp / THUOC_391” chỉ bằng so sánh `SO_LUONG` với `SL_MOI_NGAY × SO_NGAY` khi pipeline coi là **lệch đơn vị**, **làm tròn**, hoặc **dữ liệu y lệnh không đủ** (xem `The_tri_thuc_chi_muc_giam_dinh_thuoc_engine_AI.md` §5).

1. **Đơn vị y lệnh vs đơn vị cấp phát không cùng hệ**  
   Y lệnh theo **ml/lần** (sirô, pha tiêm) nhưng kho cấp theo **ống/chai**. Logic `coLechDonViYLenhVaCapPhatThuoc` có thể khiến **không so tuyến tính** như khi hai bên cùng viên. Cần **quy đổi thủ công** theo quy ước BV trước khi kết luận thiếu cấp.

2. **Làm tròn lên một đơn vị rời (viên, ống, gói)**  
   Y lệnh có **phần thập phân** (vd 2,3 đơn vị/ngày) × số ngày → lý thuyết không nguyên; kho làm tròn **lên 1 đơn vị**. Khi áp dụng ngưỡng làm tròn (`laVuotNguongDoLamTronThuoc` và nhóm liên quan), **không** gán mác THUOC_391/417 mà **bỏ qua** ngữ cảnh làm tròn.

3. **`SL_MOI_NGAY` / `SO_NGAY` rỗng hoặc 0 sau chuẩn hóa**  
   Tích `SL_MOI_NGAY * SO_NGAY` **0 hoặc không có nghĩa** → điều kiện seed không còn giá trị lâm sàng. Ưu tiên **sửa dữ liệu** hoặc cảnh báo **chất lượng đơn** (vd `CLN-THUOC-03`), **không** cố buộc THUOC_391.

---

## 4. Việc làm trong **OpenClaw** (dán lần lượt)

**Bước A — So sánh hai mã**

```text
Workspace: ung_dung_cdss_bhyt.
Đọc tai_lieu/Huan_luyen_phien_02_THUOC_391_Cursor_OpenClaw.md và tai_lieu/The_tri_thuc_chi_muc_giam_dinh_thuoc_engine_AI.md (§4–§5).

Xuất bảng 3 cột: Tiêu chí | THUOC_391 | THUOC_417.
Thêm 5 câu hỏi phân biệt cho giám định viên (có/không có số cụ thể giả).
Không PII; không sửa file.
```

**Bước B — Gắn ca 000308**

```text
Đọc tai_lieu/Ca_huan_luyen_mau_000308_THUOC_391_sai_lech_so_luong_y_lenh.md (§1–§5).

Tóm tắt 6 bullet: mục tiêu huấn luyện; MA_LK; vì sao không nhầm với DVKT_2588; điều kiện seed; một rủi ro khi AI kết luận vội.
```

**Bước C — Biên bản 5 câu**

```text
Viết biên bản phiên huấn luyện 02 (THUOC_391) tối đa 5 câu, tiếng Việt đơn giản, cho trưởng khoa dược/chất lượng.
```

---

## 5. Đánh dấu hoàn thành phiên

- [ ] Đã đọc ca mẫu + bảng so sánh 391 vs 417  
- [ ] OpenClaw đã trả lời Bước A–C (copy vào biên bộ nội bộ nếu cần)  
- [ ] (Tuỳ chọn) `npm run qa:on-off-match` vẫn PASS  

---

*Phiên 01 (neo chung + THUOC_417): xem [Phien_lam_viec_chung_Cursor_va_OpenClaw.md](./Phien_lam_viec_chung_Cursor_va_OpenClaw.md).*  
*Phiên 03 (đơn >30 ngày): xem [Huan_luyen_phien_03_THUOC_418_CLN_THUOC_04.md](./Huan_luyen_phien_03_THUOC_418_CLN_THUOC_04.md).*
