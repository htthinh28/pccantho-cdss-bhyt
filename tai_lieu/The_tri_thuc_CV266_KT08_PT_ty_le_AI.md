# THẺ TRI THỨC: KT08 — TỶ LỆ PHẪU THUẬT THỨ 2+ TRONG CÙNG MỘT LẦN MỔ (CV266) CHO AI GIÁM ĐỊNH

Phiên bản: 1.0  
Ngày: 19/04/2026  

**Nguồn:** Công văn 266 — chuyên đề Trung tâm Kiểm soát BHYT, **PL01 / KT08** (*PT sai tỷ lệ*), tệp tham chiếu **15/09/2025**.  
**Mã từ chối gợi ý:** T.008.667  

---

## 1. Căn cứ (tóm tắt)

- **TT 35/2016/TT-BYT** khoản 2 Điều 4d, được sửa đổi, bổ sung tại **TT 39/2024/TT-BYT** khoản 4 Điều 1.
- Nhiều can thiệp trong **cùng một lần** phẫu thuật: thanh toán theo DVKT phức tạp nhất / giá cao nhất; các phẫu thuật phát sinh ngoài quy trình của phẫu thuật đó:
  - **50%** giá nếu vẫn do **một kíp** phẫu thuật thực hiện;
  - **80%** giá nếu phải **thay kíp** phẫu thuật khác.

## 2. Giới hạn dữ liệu XML130

- XML130 không luôn phân biệt rõ «PT chính» vs «PT phát sinh», không chuẩn hóa «cùng một lần mổ» theo giờ/phiếu GMHS.
- Cột **TYLE_TT_BH**, **MA_BAC_SI**, **MA_PTTT** trên XML3 có thể dùng để rà sâu hơn ngoài engine heuristic hiện tại.

---

## 3. Neo mã nguồn

| Ký hiệu | Ý nghĩa |
|---------|---------|
| `CHUYEN_DE_XML130_SO_DONG_TEN_PHAU_THUAT_IT_NHAT_2_CV266_KT08` | ≥2 dòng XML3 có `TEN_DICH_VU` gợi chữ «Phẫu thuật» / «Phau thuat». |
| `CHUYEN_DE_XML130_NOI_TRU_CO_KHOANG_NAM_VIEN` | Nội trú / ban ngày (MA_LOAI_KCB 03/09/04) có NGAY_VAO — NGAY_RA hợp lệ. |
| `CHUYEN_DE_XML130_NGOAI_TRU_DUOI_10_PHUT` | Proxy ngoại trú «đợt rất ngắn» (loại trừ dương giả OP). |
| **`Chuyen_de_608`** / `CHUYEN_DE-608` | (Nội trú có khoảng nằm viện **hoặc** không phải proxy OP <10 phút) **và** ≥2 dòng tên gợi phẫu thuật. |

---

*Cập nhật khi đổi logic phạm vi đợt KCB hoặc bổ sung đối chiếu TYLE_TT_BH/MA_BAC_SI: sửa `luat_giam_dinh_chuyen_de_hardcoded.jsx`.*
