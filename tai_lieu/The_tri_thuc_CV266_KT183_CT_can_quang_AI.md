# THẺ TRI THỨC: KT183 — CT/CLVT MÃ «CÓ CẢN QUANG» NHƯNG KHÔNG CÓ THUỐC CẢN QUANG (CV266) CHO AI GIÁM ĐỊNH

Phiên bản: 1.0  
Ngày: 19/04/2026  

**Nguồn:** Công văn 266 — chuyên đề Trung tâm Kiểm soát BHYT, **PL01 / KT183** (*CLVT thuốc cản quang*), tệp tham chiếu **15/09/2025**.  
**Mã từ chối gợi ý:** S.005.442  

---

## 1. Nguyên tắc

- Nếu **không** dùng thuốc cản quang để chụp nhưng lại thanh toán mức giá **«CLVT có thuốc cản quang»** → điều chỉnh về mức **«không thuốc cản quang»** (theo QĐ phê duyệt giá).

## 2. Dữ liệu tham chiếu trong engine

- **Bảng 1:** Danh sách mã DVKT cột **«CÓ THUỐC CẢN QUANG»** (38 mã 18.xxxx.xxxx) — neo trong `CHUYEN_DE_XML130_CO_DV_MA_CT_CO_CAN_QUANG_CV266_KT183`.
- **Bảng 2:** Mã thuốc cản quang 40.632, 40.633, 40.634, 40.636–40.638, 40.641, 40.642, 40.644, 40.646–40.649 — neo 5 chữ số đầu (sau bỏ ký tự không phải số) trong `CHUYEN_DE_XML130_CO_THUOC_MA_BANG2_CAN_QUANG_CV266_KT183`.

## 3. Neo mã nguồn

| Ký hiệu | Ý nghĩa |
|---------|---------|
| `CHUYEN_DE_XML130_CO_DV_MA_CT_CO_CAN_QUANG_CV266_KT183` | Có dòng XML3 `MA_DICH_VU`/`MA_DV` thuộc Bảng 1 (cột có cản quang). |
| `CHUYEN_DE_XML130_CO_THUOC_GOI_CHAN_QUANG` | Tên/hoạt chất XML2 gợi cản quang (dùng chung Chuyen_de-207). |
| `CHUYEN_DE_XML130_CO_THUOC_MA_BANG2_CAN_QUANG_CV266_KT183` | `MA_THUOC` XML2 khớp 5 số đầu một mã Bảng 2. |
| `CHUYEN_DE_XML130_CO_CO_SO_THUOC_CAN_QUANG_KT183` | OR của hai predicate trên. |
| **`Chuyen_de_610`** / `CHUYEN_DE-610` | Có mã Bảng 1 **và** không có chứng cứ thuốc cản quang trên XML2. |

---

*Cập nhật khi BYT đổi mã: sửa chuỗi `m === '…'` và danh sách `p === '…'` trong `luat_giam_dinh_chuyen_de_hardcoded.jsx`.*
