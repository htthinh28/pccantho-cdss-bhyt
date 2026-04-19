# THẺ TRI THỨC: KT144 — DVKT CHỈ NGOẠI TRÚ, KHÔNG TÁCH THU KÈM TIỀN GIƯỜNG NỘI TRÚ (CV266) CHO AI GIÁM ĐỊNH

Phiên bản: 1.0  
Ngày: 19/04/2026  

**Nguồn:** Công văn 266 — chuyên đề Trung tâm Kiểm soát BHYT, **PL01 / KT144** (*DVKT không TT nội trú*), tệp tham chiếu **15/09/2025**.  
**Mã từ chối gợi ý:** S.005.430  

---

## 1. Nguyên tắc

- Các DVKT trong **Bảng 1** chỉ được thanh toán trong **ngoại trú** (theo QĐ phê duyệt giá).
- **Không** thanh toán tách các DVKT đó trong **điều trị nội trú** nếu đợt đã **thanh toán tiền giường**.

## 2. Bảng mã DVKT (Bảng 1 — đối soát engine)

| MA_CP |
|-------|
| 03.1681.0075 |
| 03.1690.0075 |
| 03.1703.0075 |
| 03.2387.0212 |
| 03.2388.0212 |
| 03.2389.0212 |
| 03.2390.0212 |
| 03.2391.0215 |
| 03.3826.0075 |
| 03.4246.0198 |
| 10.9004.0075 |
| 11.0089.0215 |
| 14.0111.0075 |
| 14.0112.0075 |
| 14.0116.0075 |
| 14.0192.0075 |
| 14.0203.0075 |
| 14.0204.0075 |
| 14.0290.0212 |
| 14.0291.0212 |
| 15.0302.0075 |

---

## 3. Neo mã nguồn

| Ký hiệu | Ý nghĩa |
|---------|---------|
| `CHUYEN_DE_XML130_NOI_TRU_CO_KHOANG_NAM_VIEN` | Nội trú / ban ngày (03/09/04) có NGAY_VAO — NGAY_RA. |
| `CHUYEN_DE_XML130_CO_DV_GIUONG` | Có dòng XML3 tên gợi giường (proxy «thanh toán tiền giường»). |
| `CHUYEN_DE_XML130_CO_DV_MA_DVKT_KHONG_TT_NOI_TRU_CV266_KT144` | Có ít nhất một dòng XML3 `MA_DICH_VU`/`MA_DV` trùng Bảng 1. |
| **`Chuyen_de_609`** / `CHUYEN_DE-609` | Ba điều kiện trên **cùng** đợt. |

---

*Cập nhật khi BYT đổi mã: sửa chuỗi `m === '…'` trong `luat_giam_dinh_chuyen_de_hardcoded.jsx` và bảng trên.*
