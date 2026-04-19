# THẺ TRI THỨC: KT01.18 — NỘI SOI DẠ DÀY TÁ TRÀNG (CHẨN ĐOÁN vs CAN THIỆP, CV266) CHO AI GIÁM ĐỊNH

Phiên bản: 1.0  
Ngày: 19/04/2026  

**Nguồn:** Công văn 266 — chuyên đề Trung tâm Kiểm soát BHYT, **PL01 / KT01.18** (*Nội soi dạ dày*), kèm tệp tham chiếu **15/09/2025**.  
**Mã từ chối gợi ý:** S.005.434  

---

## 1. Nguyên tắc thanh toán

- **Không** thanh toán đồng thời DVKT **Nội soi thực quản – dạ dày – tá tràng** (chẩn đoán / thăm dò) với DVKT **Nội soi can thiệp dạ dày – tá tràng** (đã gồm phần soi thăm dò trong quy trình can thiệp theo **QĐ 3805/QĐ-BYT** — STT 45, 46, 50, 54, 55).

## 2. Bảng mã (đối soát engine)

### Bảng 1 — Chẩn đoán / thực quản–dạ dày–tá tràng

| MA_CP |
|-------|
| 15.0237.0926 |
| 15.0237.0928 |
| 15.0233.0135 |
| 15.0232.0135 |
| 02.0255.0319 |
| 02.0305.0135 |
| 02.0304.0134 |

### Bảng 2 — Can thiệp dạ dày – tá tràng (và liên quan trong PL01)

| MA_CP |
|-------|
| 01.0232.0140 |
| 01.0351.0140 |
| 01.0353.0140 |
| 02.0264.0140 |
| 02.0265.0140 |
| 02.0267.0140 |
| 02.0298.0140 |
| 03.0155.0140 |
| 03.0157.0140 |
| 03.0159.0140 |
| 03.1056.0140 |
| 03.1057.0140 |
| 03.1040.0497 |
| 20.0060.0497 |
| 01.0217.0502 |
| 02.0252.0502 |
| 02.0277.0502 |
| 03.0154.0502 |
| 03.1041.0502 |
| 02.0266.0157 |
| 03.1034.0157 |
| 20.0057.0157 |

---

## 3. Neo mã nguồn

| Ký hiệu | Ý nghĩa |
|---------|---------|
| `CHUYEN_DE_XML130_CO_DV_MA_NS_CHAN_DOAN_TQ_DD_TT_CV266` | Có dòng XML3 thuộc **Bảng 1** (theo `MA_DICH_VU`/`MA_DV`) hoặc tên đủ **nội soi + thực quản + dạ dày + tá tràng** và **không** ghi «can thiệp». |
| `CHUYEN_DE_XML130_CO_DV_MA_NS_CAN_THIEP_DD_TA_CV266` | Có dòng thuộc **Bảng 2** hoặc tên gợi **can thiệp / cầm máu / tiêm xơ / mở thông / thắt búi / Histoacryl / clip / nong hẹp / cắt dưới niêm mạc / chảy máu** kèm nội soi. |
| **`Chuyen_de_605`** / `CHUYEN_DE-605` | Hai điều kiện trên **cùng** một hồ sơ → cảnh báo xuất toán. |

---

*Cập nhật khi BYT sửa mã: chỉnh danh sách trong `luat_giam_dinh_chuyen_de_hardcoded.jsx` và bảng trên.*
