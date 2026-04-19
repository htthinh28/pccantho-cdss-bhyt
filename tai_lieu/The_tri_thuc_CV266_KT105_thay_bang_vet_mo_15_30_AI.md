# THẺ TRI THỨC: KT105 — THAY BĂNG VẾT MỔ 15–30 CM SAU MỔ LẤY THAI (NỘI TRÚ, TỐI ĐA 3 LẦN) CHO AI GIÁM ĐỊNH

Phiên bản: 1.0  
Ngày: 19/04/2026  

**Nguồn:** Công văn 266 — chuyên đề Trung tâm Kiểm soát BHYT, **PL01 / KT105** (*thay băng vết mổ trên 15cm*), tệp tham chiếu **15/09/2025**.  
**Mã từ chối gợi ý:** S.005.433  

---

## 1. Nguyên tắc

- DVKT «Thay băng vết mổ chiều dài **trên 15cm đến 30cm**» trong **điều trị nội trú**, sau **mổ lấy thai**: áp mức giá này **tối đa 3 lần**; **không** thanh toán hợp lệ từ **lần thứ 4** trở đi (TT 35/2016 Điều 4d điểm d, sửa TT 39/2024).

## 2. Bảng mã (đối soát engine)

### Bảng 1 — Thay băng 15–30 cm (MA trong DM BYT; văn bản PDF có lỗi OCR)

| MA_CP (chuẩn DM) | Ghi chú |
|-------------------|---------|
| 15.0303.2047 | Thay băng vết mổ [15cm–30cm] |
| 03.3911.0201 | Thay băng, cắt chỉ [15cm–30cm] |
| 03.3826.2047 | Thay băng, cắt chỉ vết mổ [15cm–30cm] |

### Bảng 2 — Phẫu thuật mổ lấy thai

| MA_CP |
|-------|
| 13.0001.0676 |
| 13.0002.0672 |
| 13.0003.0674 |
| 13.0004.0675 |
| 13.0005.0675 |
| 13.0006.0673 |
| 13.0007.0671 |
| 13.0008.0670 |

---

## 3. Neo mã nguồn

| Ký hiệu | Ý nghĩa |
|---------|---------|
| `CHUYEN_DE_XML130_NOI_TRU_CO_KHOANG_NAM_VIEN` | Nội trú / ban ngày có khoảng nằm viện. |
| `CHUYEN_DE_XML130_CO_DV_MA_PT_MO_LAY_THAI_BANG2_CV266_KT105` | Có dòng XML3 MA PT thuộc Bảng 2 (bỏ `_GT`). |
| `CHUYEN_DE_XML130_SO_DONG_MA_THAY_BANG_15_30_CM_IT_NHAT_4_CV266_KT105` | ≥4 dòng XML3 mã thuộc Bảng 1 (cùng đợt). |
| **`Chuyen_de_611`** / `CHUYEN_DE-611` | Ba điều kiện trên. |

---

*Cập nhật khi BYT đổi mã: sửa danh sách `m === '…'` trong `luat_giam_dinh_chuyen_de_hardcoded.jsx`.*
