# THẺ TRI THỨC: KT01.19 — NỘI SOI ĐẠI TRÀNG / TRỰC TRÀNG (CHẨN ĐOÁN vs CAN THIỆP, CV266) CHO AI GIÁM ĐỊNH

Phiên bản: 1.0  
Ngày: 19/04/2026  

**Nguồn:** Công văn 266 — chuyên đề Trung tâm Kiểm soát BHYT, **PL01 / KT01.19** (*Nội soi đại tràng*), tệp tham chiếu **15/09/2025**.  
**Mã từ chối gợi ý:** S.005.434  

---

## 1. Nguyên tắc thanh toán

- **Không** thanh toán đồng thời DVKT **nội soi đại tràng, trực tràng** (chẩn đoán) với DVKT **nội soi can thiệp đại tràng / trực tràng** — can thiệp ống tiêu hóa đã gồm phần soi thăm dò (**TT 35/2016**, **QĐ 3805** STT 45, 46, 50, 52, 53, 54, 55).

## 2. Bảng mã (đối soát engine)

### Bảng 1 — Chẩn đoán (đại tràng / trực tràng)

| MA_CP |
|-------|
| 02.0306.0137 |
| 02.0307.0136 |
| 03.1062.0137 |
| 20.0081.0137 |
| 02.0256.0139 |
| 02.0293.0138 |
| 02.0308.0139 |
| 02.0309.0138 |
| 02.0310.0506 |
| 03.0158.0137 |
| 02.0311.0139 |

### Bảng 2 — Can thiệp

| MA_CP |
|-------|
| 03.1064.0184 |
| 20.0071.0184 |
| 03.1063.0500 |
| 20.0070.0500 |
| 02.0294.0137 |
| 02.0257.0139 |

---

## 3. Neo mã nguồn

| Ký hiệu | Ý nghĩa |
|---------|---------|
| `CHUYEN_DE_XML130_CO_DV_MA_NS_CHAN_DOAN_DAI_TRUC_TRANG_CV266` | Dòng XML3 thuộc **Bảng 1** (mã) hoặc tên gợi **nội soi / soi đại tràng** + **đại tràng / trực tràng / sigma**, không mang từ khóa can thiệp / tiêm cầm máu / lấy dị vật / cấp cứu (heuristic). |
| `CHUYEN_DE_XML130_CO_DV_MA_NS_CAN_THIEP_DAI_TRUC_TRANG_CV266` | Dòng **Bảng 2** hoặc tên gợi can thiệp / **tiêm cầm máu** / **lấy dị vật** / **cấp cứu** kèm bối cảnh đại tràng–trực tràng. |
| **`Chuyen_de_606`** / `CHUYEN_DE-606` | Hai điều kiện **cùng** hồ sơ → cảnh báo xuất toán. |

---

*Cập nhật khi BYT đổi mã: sửa danh sách `m === '…'` trong `luat_giam_dinh_chuyen_de_hardcoded.jsx` và bảng trên.*
