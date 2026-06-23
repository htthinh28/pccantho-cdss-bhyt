# THẺ TRI THỨC: CÔNG VĂN CV 302/CSYT-CĐ — QUY ĐỊNH BHYT TỪ 01/7/2026

Phiên bản: 1.0  
Ngày: 11/06/2026  

**Văn bản gốc:** Công văn **CV 302/CSYT-CĐ** — BHXH Việt Nam, Ban Thực hiện CS BHYT (hiệu lực **01/7/2026**).  
**Căn cứ:** Luật BHYT (VBHN 40/VBHN-VPQH), **NĐ 188/2025/NĐ-CP**, **NĐ 161/2026/NĐ-CP**, TT 01/2025/TT-BYT, TT 24/2025/TT-BYT.

---

## 1. Mở rộng quyền lợi tự đến KCB ngoại trú (50%)

Từ **01/7/2026**, bệnh/nhóm bệnh **ngoài Phụ lục 02** (cấp cơ bản) hoặc **ngoài Phụ lục 01** (cấp chuyên sâu) được **50%** phạm vi (thay vì **0%** trước đó).

| Mã PL10 | Đối tượng |
|---------|-----------|
| **1.13** | Tự đến ngoại trú — CS cơ bản 50–70 điểm |
| **1.14** | Tự đến ngoại trú — CS cơ bản tuyến tỉnh/TW trước 01/01/2025 |
| **1.18** | Tự đến ngoại trú — CS chuyên sâu tuyến tỉnh |

Engine: `taoBoQuyTacDoiTuongKcb` + `giamDinhQuyenLoiTheoDoiTuongVaThe` (`factor === 0.5` → **HC-06f**); seed **HC_302**.

---

## 2. Mức lương cơ sở mới: **2.530.000đ**

| Chỉ tiêu | Trước 01/7/2026 | Từ 01/7/2026 |
|----------|-----------------|--------------|
| LCS | 2.340.000đ | **2.530.000đ** |
| 15% LCS (miễn CCT 1 lần KCB) | 351.000đ | **379.500đ** |
| 6× LCS (miễn CCT 5 năm LT) | 14.040.000đ | **15.180.000đ** |
| 45× LCS (trần TBYT/DVKT) | 105.300.000đ | **113.850.000đ** |

Module: `ma_nguon/tien_ich/muc_luong_co_so_bhyt.jsx` — `layLcsDongChoNgay`, `ngưỡng15PhanTramLcs`, …

Seed cập nhật: **HC_06**, **HC_09**, **XML_47**, **XML_48**, **XML_57**.  
Built-in: `giam_dinh_cv302_bhyt.jsx` — **HC-302a** … **HC-302e**.

---

## 3. Công thức CCT còn lại khi đổi LCS giữa năm 2026 (mục 2.5 CV 302)

\[
\text{CCT còn lại} = (6 - \frac{\text{Lũy kế CCT}_{01/01-30/6}}{2.340.000}) \times 2.530.000
\]

Hàm: `tinhNguongCctConLaiSauDoiLcs` — cảnh báo **HC-302c**.

---

## 4. Thanh toán trực tiếp tại BHXH (Điều 57 NĐ 188)

| Trường hợp | Trần |
|------------|------|
| Ngoại trú CS cơ bản không HĐ (điểm a) | **0,15×LCS** = 379.500đ |
| Nội trú CS cơ bản không HĐ (điểm a) | **0,5×LCS** = 1.265.000đ |
| Nội trú CS cơ bản tỉnh 50–70đ không HĐ (điểm b) | **1×LCS** = 2.530.000đ |
| Nội trú CS chuyên sâu không HĐ (điểm c) | **2,5×LCS** = 6.325.000đ |

Built-in gợi ý: **HC-302e** (khi có metadata CSKCB `HOP_DONG_BHYT`).

---

## 5. Neo kỹ thuật CDSS

| Thành phần | Vai trò |
|------------|---------|
| `MOC_LCS_BHYT_MOI_YMD` = `20260701` | Mốc đổi LCS |
| `laMotLanKcbDuoi15PhanTramLcs` | Ngoại lệ 100% phạm vi (QĐ 1018 + CV 302) |
| `giamDinhCv302Bhyt` | Layer hành chính — chỉ chạy hồ sơ ≥ 01/7/2026 |
| `PHIEN_BAN_BYT_PL10_DOI_TUONG` | Bump khi sửa PL10 (mã **1.13** 50%) |

---

*Cập nhật khi BHXH/BYT ban hành hướng dẫn chi tiết hoặc sửa NĐ 161.*
