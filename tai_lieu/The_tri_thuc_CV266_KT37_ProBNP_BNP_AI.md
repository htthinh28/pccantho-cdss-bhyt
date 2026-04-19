# THẺ TRI THỨC: KT37 — BNP vs NT‑PROBNP (THEO SUY THẬN / SUY TIM, CV266) CHO AI GIÁM ĐỊNH

Phiên bản: 1.0  
Ngày: 19/04/2026  

**Nguồn:** Công văn 266 — chuyên đề Trung tâm Kiểm soát BHYT, **PL01 / KT37** (*ProBNP / BNP*), tệp tham chiếu **15/09/2025**.  
**Mã từ chối gợi ý:** S.005.428  

---

## 1. Nguyên tắc thanh toán (tóm tắt)

- **Có suy thận** (theo bảng ICD chuyên đề) + chẩn đoán / theo dõi **suy tim**: thanh toán **«Định lượng BNP»** (giá DVKT BNP).
- **Không suy thận** + chẩn đoán / theo dõi **suy tim**: thanh toán **«Định lượng Pro‑BNP (NT‑proBNP)»** (giá Pro‑BNP), không dùng nhánh BNP máu 23.0028.1466.

## 2. Bảng mã DVKT (Bảng 1 — đối soát engine)

| Mã DVKT | Tên (theo văn bản) |
|---------|---------------------|
| 01.0298.1466 | Định lượng nhanh NT‑ProBNP … cầm tay |
| 23.0028.1466 | Định lượng BNP [Máu] |
| 23.0121.1548 | Định lượng proBNP (NT‑proBNP) [Máu] |

## 3. Bảng ICD (Bảng 2 — gợi ý trong engine)

- **Suy tim:** I50\*, I13.1, I13.2 (chẩn đoán chính / kèm theo trên XML1).
- **Suy thận / tim–thận:** I13.1, I13.2, N17\*, N18\*, N19, N990, O084, O904, P960.

---

## 4. Neo mã nguồn

| Ký hiệu | Ý nghĩa |
|---------|---------|
| `CHUYEN_DE_XML130_XML1_ICD_CO_SUY_THAN_THEO_CV266_KT37` | XML1 có ICD gợi **suy thận** / I13.1–I13.2 theo bảng KT37. |
| `CHUYEN_DE_XML130_XML1_ICD_CO_SUY_TIM_THEO_CV266_KT37` | XML1 có ICD gợi **suy tim** theo bảng KT37. |
| `CHUYEN_DE_XML130_CO_DV_MA_BNP_MAU_23_0028_1466` | Có dòng XML3 mã **23.0028.1466**. |
| `CHUYEN_DE_XML130_CO_DV_MA_PROBNP_NT_HOAC_CAM_TAY_CV266` | Có mã **23.0121.1548** / **01.0298.1466** hoặc tên gợi NT‑pro / Pro‑BNP. |
| **`Chuyen_de_607`** / `CHUYEN_DE-607` | (Suy thận + suy tim + có Pro‑BNP/NT‑pro) **hoặc** (không suy thận + suy tim + có BNP 23.0028.1466). |

---

*Cập nhật khi BYT đổi mã: sửa danh sách mã và bảng ICD trong `luat_giam_dinh_chuyen_de_hardcoded.jsx` và bảng trên.*
