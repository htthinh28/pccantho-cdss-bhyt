# CHỈ MỤC ENGINE: GIÁM ĐỊNH THUỐC (MÃ NGUỒN + LUỒNG CẢNH BÁO)

Phiên bản tài liệu: 1.0  
Ngày cập nhật: 06/04/2026

## 1. Mục đích

Tài liệu này bổ sung cho các “thẻ nghiệp vụ” (`The_tri_thuc_kiem_soat_sai_thuoc_AI.md`, `The_tri_thuc_giam_dinh_thuoc_DM_builtin_va_doi_chieu_tien_AI.md`, …) bằng cách **neo AI vào đúng tầng mã** trong `ma_nguon/tien_ich/dong_co_giam_dinh.jsx` và seed `du_lieu_luat_thuoc_muc8.jsx`.

Sau khi đọc tài liệu này, AI cần trả lời được:

- Cảnh báo `THUOC_*` / `DM-THUOC-*` / `DMBV-THUOC-*` / `CLN-THUOC-*` **đến từ đâu** (built-in vs hardcoded).
- Cảnh báo có thể **biến mất sau lọc ngữ cảnh** `locCanhBaoDuongTinhGiaTheoNguCanh` vì lý do gì.
- Trường XML2 nào được **làm giàu** (`enrichXML2Data`) trước khi so sánh y lệnh — vì sao không được “cứng” `SO_LUONG` vs `SL_MOI_NGAY * SO_NGAY` mù quáng.

**Nguồn sự thật:** `dong_co_giam_dinh.jsx` (các hàm được trích dẫn bên dưới).

## 2. Phân loại mã luật thuốc (theo metadata trong code)

Trong `dong_co_giam_dinh.jsx`, nhánh gán `namespace_quy_tac` / `nguon_quy_tac` (khi export audit) quy ước khoảng:

| Tiền tố / pattern | Namespace điển hình | Nguồn | Tab gợi ý UI |
|-------------------|---------------------|-------|----------------|
| `THUOC_` + số | `THUOC_HARDCODED` | `luat_thuoc_hardcoded` | `LUAT_THUOC` |
| `DM-THUOC-`, `DMBV-THUOC-`, `CLN-THUOC-` | `THUOC_DANH_MUC_BUILTIN` | `dong_co_giam_dinh` | `LUAT_THUOC` |

Seed đầy đủ: `ma_nguon/tien_ich/du_lieu_luat_thuoc_muc8.jsx` (hàng trăm rule `THUOC_*`; điều kiện là chuỗi biểu thức được engine đánh giá trên XML1+XML2 đã chuẩn hóa).

## 3. Tầng built-in trên XML2 (cùng file `dong_co_giam_dinh.jsx`)

### 3.1. `giamDinhThuoc(hoSo, dm)` — `CLN-THUOC-01` … `04`

Chạy trên **từng dòng** XML2 (sau `enrichXML2Data`), chỉ áp dụng điều kiện BHYT thanh toán như các luồng khác.

| Mã | Điều kiện ý niệm | Ghi chú cho AI |
|----|------------------|----------------|
| **CLN-THUOC-01** | Trùng `MA_THUOC` trên hai dòng | **Chỉ ngoại trú** (`laNgoaiTru`) — nội trú không báo trùng theo nhánh này. |
| **CLN-THUOC-02** | `SO_LUONG` ≤ 0 | Error. |
| **CLN-THUOC-03** | `LIEU_DUNG` rỗng | Warning — chất lượng đơn. |
| **CLN-THUOC-04** | Ngoại trú, `max(SO_NGAY_DTRI, SO_NGAY) > 30` và **không** thuộc danh mục ICD được phép kê >30 ngày | Phụ thuộc `dm.BO_QUY_TAC_ICD10_KE_DON_TREN_30_NGAY` + `isClaimAllowedPrescriptionOver30Days(xml1, dm)`. |

### 3.2. Khối `DM-THUOC-01` … `04`

So khớp `MA_THUOC` với `MAP_THUOC_BV` và `MAP_BYT_PL5` — xem thẻ `The_tri_thuc_giam_dinh_thuoc_DM_builtin_va_doi_chieu_tien_AI.md`.

### 3.3. `DMBV-THUOC-00` … `04`

Kiểm tra **chất lượng bản ghi** danh mục BV cho mã thuốc **đã có** trong map — cùng thẻ DM §2.1.

## 4. Làm giàu XML2 và giải thích `THUOC_391` / `THUOC_417`

- Hàm **`enrichXML2Data`** (cùng file) suy ra `CALC_SL_MOI_NGAY`, `SO_NGAY`, đơn vị từ `LIEU_DUNG` / các trường số khi có thể.
- Nhiều rule seed dùng **`CALC_SL_MOI_NGAY`** hoặc `SL_MOI_NGAY` — AI phải đọc **điều kiện từng `MA_LUAT`** trong seed, không đoán.
- **`boSungChiTietCanhBaoGiaiTrinh`**: với `ma_luat === 'THUOC_391'`, engine **thêm khối “Cách tính”** (`layChiTietTinhToanThieuThuoc`) vào text cảnh báo sau khi render template.

## 5. Lọc ngữ cảnh `locCanhBaoDuongTinhGiaTheoNguCanh` — các dòng liên quan thuốc

Sau khi gom cảnh báo, một phần bị **loại bỏ** nếu ngữ cảnh hồ sơ không “đủ điều kiện hiển thị”. Các mã **trực tiếp liên quan thuốc** (trích từ logic filter trong code):

| Mã luật | Khi nào bị lọc (tóm tắt) |
|---------|---------------------------|
| **DM-THUOC-03** | Luôn loại (không hiển thị sau filter) — cần kiểm tra pipeline nếu audit cũ vẫn còn. |
| **DMBV-*** | Toàn bộ loại. |
| **THUOC_400** | Không còn dòng thuốc XML2. |
| **THUOC_85** | Có PTTT/thủ thuật thực sự trên XML3 (`coPhauThuatHoacThuThuat`). |
| **THUOC_342** | Thai kỳ / sản khoa suy từ ICD + mô tả (`coThaiKyHoacSanKhoa`). |
| **THUOC_391**, **THUOC_416**, **THUOC_417** | `coLechDonViYLenhVaCapPhatThuoc(dong)` — đơn vị cấp phát vs đơn vị y lệnh **không tương thích** (ví dụ viên vs ml) nên **không** áp so sánh số tuyến tính. |
| **THUOC_417**, **THUOC_416** | `laVuotNguongDoLamTronThuoc(dong)` — cấp dư **bằng làm tròn lên 1 đơn vị rời rạc** (viên, gói, ống, …) khi y lệnh có phần thập phân. |

**Bài học huấn luyện:** Nếu AI thấy XML2 “hụt” cảnh báo `THUOC_417` dù `SO_LUONG` > tích, hãy kiểm tra **đơn vị** và **làm tròn** trước khi kết luận lỗi engine.

## 6. Đối chiếu nhanh: rule thuốc xuất hiện trong `test_xml/` (snapshot repo)

Thống kê mang tính **tham chiếu huấn luyện**, không cố định vĩnh viễn:

- `THUOC_391` — nhiều file (nội trú / PT).
- `THUOC_417` — nhiều file (cấp dư).
- `THUOC_436`, `THUOC_207`, `THUOC_63` — đa hồ sơ.
- `DM-THUOC-04` — ngoại trú mẫu OP.
- `DMBV-THUOC-03` — vài audit (metadata danh mục).

Khi thêm rule mới, nên chạy `npm run qa:audit-fixtures` và cập nhật ca minh họa.

## 7. Gói prompt huấn luyện (xoay vòng)

1. *“Cho biết cảnh báo này thuộc built-in hay seed: [dán `ma_luat` + `nguon_quy_tac`]. Trích một điều kiện từ seed nếu là `THUOC_*`.”*
2. *“Hồ sơ ngoại trú có hai dòng cùng `MA_THUOC`. Rule nào phát sinh? Nội trú có giống không?”* (kỳ vọng: `CLN-THUOC-01` chỉ ngoại trú.)
3. *“Vì sao `THUOC_391` có thể bị lọc dù `SO_LUONG` < `SL_MOI_NGAY * SO_NGAY`?”* (đơn vị / `coLechDonViYLenhVaCapPhatThuoc`.)
4. *“Phân biệt `DM-THUOC-03` và `DMBV-THUOC-03` bằng một câu mỗi khái niệm.”*
5. *“Liệt kê các trường XML1 cần đọc để quyết định `CLN-THUOC-04`.”*

## 8. Liên kết nội bộ

- Khung phân loại “sai thuốc”: `The_tri_thuc_kiem_soat_sai_thuoc_AI.md`  
- DM + tiền + DMBV: `The_tri_thuc_giam_dinh_thuoc_DM_builtin_va_doi_chieu_tien_AI.md`  
- Đa nhóm thuốc BV: `The_tri_thuc_da_dang_nhom_thuoc_dan_muc_BV_AI.md`  
- Lộ trình: `Lo_trinh_huan_luyen_AI_giam_dinh_BHYT.md`
