# THẺ TRI THỨC: ICD-10 THEO THÔNG TƯ 06/2026/TT-BYT — DANH MỤC CỜ HƯỚNG DẪN MÃ HÓA

Phiên bản: 1.0  
Ngày: 11/06/2026  

**Văn bản gốc:** **Thông tư 06/2026/TT-BYT** — Phụ lục danh mục mã bệnh ICD-10 (các cột hướng dẫn mã hóa: không dùng làm bệnh chính, mã cụ thể hơn, giới tính, nguyên nhân tử vong…).  
**Căn cứ kiểm tra BHYT bổ sung:** TT 12/2026/TT-BTC — Điều 10 khoản 1; Điều 13 khoản 1–3.

---

## 1. Bảng cờ danh mục → mã cảnh báo CDSS

| Cờ trong danh mục (`BANG_ICD10_TT06`) | Mã cảnh báo | Mức độ | Ý nghĩa | Trường XML kiểm tra |
|----------------------------------------|-------------|--------|---------|---------------------|
| `camBenhChinh` | **ICD-TT06-CAM-CHINH** | **Error** | **Không được** dùng làm bệnh chính | `MA_BENH_CHINH` |
| `khongKhuyenKhichBenhChinh` | **ICD-TT06-KK-CHINH** | Warning | Không khuyến khích làm bệnh chính | `MA_BENH_CHINH` |
| `coMaBonHoacNamKyTuCuTheHon` | **ICD-TT06-CU-THE-HON** | Warning | Nên dùng mã **4–5 ký tự** chi tiết hơn (không dùng mã “rút gọn” 3 ký tự khi đã có mã con) | `MA_BENH_CHINH` |
| `chiMaHoaNguyenNhanTuVong` | **ICD-TT06-TU-VONG** | Warning | Chỉ dùng để mã hóa **nguyên nhân tử vong** / underlying cause | `MA_BENH_CHINH` |
| `chuYeuNuGioi` | **ICD-TT06-GIOI-NU** | Warning | Mã chỉ có hoặc chủ yếu ở **nữ** — không phù hợp BN **nam** | `MA_BENH_CHINH` |
| `chuYeuNamGioi` | **ICD-TT06-GIOI-NAM** | Warning | Mã chỉ có hoặc chủ yếu ở **nam** — không phù hợp BN **nữ** | `MA_BENH_CHINH` |
| `chuYeuNuGioi` (bệnh kèm) | **ICD-TT06-GIOI-NU-KT** | Warning | Như trên, áp **mã kèm** | `MA_BENH_KT` |
| `chuYeuNamGioi` (bệnh kèm) | **ICD-TT06-GIOI-NAM-KT** | Warning | Như trên, áp **mã kèm** | `MA_BENH_KT` |

**Lưu ý:** Các cờ *cấm / không khuyến khích / mã chi tiết / tử vong* chỉ đối chiếu trên **`MA_BENH_CHINH`**. **`MA_BENH_KT`** hiện chỉ kiểm tra **giới tính**.

---

## 2. Quy mô danh mục (phiên bản bundle hiện tại)

| Chỉ số | Giá trị |
|--------|---------|
| `PHIEN_BAN_ICD10_TT06` | `2026-04-09-tt06-5395-mã` |
| Tổng mã có ≥ 1 cờ | **5.395** |
| `camBenhChinh` | **2.427** mã |
| `khongKhuyenKhichBenhChinh` | **221** mã |
| `coMaBonHoacNamKyTuCuTheHon` | **2.119** mã |
| `chiMaHoaNguyenNhanTuVong` | **12** mã |
| `chuYeuNuGioi` | **933** mã |
| `chuYeuNamGioi` | **144** mã |

**Ví dụ mã `camBenhChinh`:** nhóm tác nhân **B95–B96** (mã vi khuẩn/nguyên nhân ngoài — không đứng làm chẩn đoán chính); **J91** (tràn dịch màng phổi trong bệnh phân loại nơi khác).

**Ví dụ mã `coMaBonHoacNamKyTuCuTheHon`:** **J02**, **J03** (viêm họng/amidan — nên ghi mã 4–5 ký tự như J02.0, J03.9…).

---

## 3. Neo kỹ thuật trong CDSS (repo)

| Thành phần | Vai trò |
|------------|---------|
| `ma_nguon/thanh_phan/icd10_tt06_bang_ma.jsx` | Bundle `BANG_ICD10_TT06` — **không sửa tay** |
| `scripts/build_icd10_tt06_catalog.mjs` | Sinh lại bảng từ Excel Phụ lục TT 06 |
| `giamDinhIcd10TheoTT06(hoSo)` trong `dong_co_giam_dinh.jsx` | Built-in Layer **L23**, namespace `ICD10_TT06_BUILTIN` |
| `khoaBangIcd10TT06(ma)` | Chuẩn hóa khóa tra cứu: bỏ dấu chấm, bỏ † (vd. `A00.0` → `A000`) |
| `extractIcdCodesFromClaim(MA_BENH_CHINH)` | Tách token ICD từ chuỗi XML1 (nhiều mã `;`) |

**Tái sinh danh mục** khi BYT cập nhật file Excel:

```bash
npm run catalog:icd10-tt06 -- "đường/dẫn/danh-muc-ma-benh-tat-excel.xlsx"
```

Cột Excel (sheet 1, từ dòng 5): mã cột **17** = mã ICD; **23–28** = các cờ tương ứng `camBenhChinh` … `chuYeuNamGioi`.

---

## 4. Mẫu cảnh báo trên hồ sơ

**Cấm bệnh chính (Error):**

> Mã ICD-10 [J91] không được dùng làm bệnh chính theo Phụ lục TT 06/2026/BYT (2026-04-09-tt06-5395-mã).

**Ưu tiên mã chi tiết (Warning):**

> Mã ICD-10 [J03] không dùng khi đã có mã 4–5 ký tự cụ thể hơn (TT 06/2026/BYT) (2026-04-09-tt06-5395-mã).

---

## 5. Gợi ý suy luận cho AI / Trợ lý tri thức

1. **Phân biệt mức độ:** `ICD-TT06-CAM-CHINH` = **sai mã hóa bệnh chính** (Error); `KK-CHINH` / `CU-THE-HON` = gợi ý chỉnh mã (Warning).
2. Khi gặp mã 3 ký tự (vd. `J06`) và cảnh báo **CU-THE-HON**, đề xuất mã con 4–5 ký tự theo ICD-10 chi tiết (vd. `J06.9`).
3. Mã nhóm **B95–B96**, **Y**… thường là **tác nhân / bối cảnh** — đặt ở bệnh kèm hoặc mã bổ sung, không làm `MA_BENH_CHINH`.
4. Kiểm tra **giới tính** (`MA_GIOI_TINH`: 1 = Nam, 2 = Nữ) trước khi kết luận **GIOI-NU** / **GIOI-NAM**.
5. Tra cứu nhanh trong bundle: tìm khóa `khoaBangIcd10TT06("J91")` → `J91` trong `BANG_ICD10_TT06`.

---

*Cập nhật khi BYT ban hành Thông tư sửa đổi TT 06 hoặc thay file Excel Phụ lục — chạy lại `catalog:icd10-tt06` và bump `PHIEN_BAN_ICD10_TT06`.*
