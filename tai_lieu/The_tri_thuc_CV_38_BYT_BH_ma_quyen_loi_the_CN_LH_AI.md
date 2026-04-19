# THẺ TRI THỨC: CÔNG VĂN 38/BYT-BH — CHUYỂN MÃ QUYỀN LỢI THẺ BHYT (CN, LH) CHO AI GIÁM ĐỊNH

Phiên bản: 1.0  
Ngày: 19/04/2026  

**Văn bản gốc (Bộ Y tế):** Công văn số **38/BYT-BH** ngày **06/01/2026** — *Về việc chuyển đổi mã quyền lợi đối tượng tham gia bảo hiểm y tế theo Nghị quyết số 261/2025/QH15* (bản PDF ký số thường mang số đăng ký **688054** trên văn bản đính kèm).  
**Tham chiếu công khai (trích đầy đủ điểm nghiệp vụ):** [LuatVietnam — Công văn 38/BYT-BH 2026](https://www.luatvietnam.vn/bao-hiem/cong-van-38-byt-bh-2026-chuyen-doi-ma-quyen-loi-doi-tuong-tham-gia-bao-hiem-y-te-423121-d6.html).

---

## 1. Căn cứ pháp lý (tóm tắt điều cần giám định)

- **Nghị quyết 261/2025/QH15**, hiệu lực **01/01/2026** — điểm **a** khoản **1** Điều **2**: người tham gia BHYT thuộc **hộ gia đình cận nghèo** và người **cao tuổi từ đủ 75 tuổi** trở lên **đang hưởng trợ cấp hưu trí xã hội** được áp dụng **100%** chi phí KCB **trong phạm vi** được hưởng.
- **Công văn 38/BYT-BH**: đề nghị **BHXH Việt Nam** chuyển đổi **mã quyền lợi** (ký tự **thứ 3** trên chuỗi `MA_THE_BHYT` theo QĐ 130 / QĐ 1018):
  - Đối tượng **CN** (hộ cận nghèo): từ mã quyền lợi **3** (95%) → **2** (100%) kể từ **01/01/2026**.
  - Đối tượng **LH** (≥75 tuổi, trợ cấp hưu trí xã hội): từ mã quyền lợi **4** (80%) → **2** (100%) kể từ **01/01/2026**.
- **Cơ sở KCB**: tra cứu thẻ, bảo đảm quyền lợi; vướng mắc phối hợp **giám định BHYT** và **BHXH** (theo CV).

---

## 2. Neo kỹ thuật trong CDSS (repo)

| Thành phần | Ý nghĩa |
|------------|---------|
| `KY_HIEU_SO_THU_BA_THE_BHYT(XML1)` | Đúng **ký tự thứ 3** đang ghi trên XML (in trên thẻ / khai báo). |
| `KY_HIEU_SO_THU_BA_THE_CHO_TYLE_TT(XML1)` | Ký tự thứ 3 **dùng suy tỷ lệ** `T_BHTT` / `T_TONGCHI_BH`: từ **01/01/2026**, **CN+3 → coi như 2**, **LH+4 → coi như 2** (hồ sơ có thể chưa cập nhật kịp ký tự in). |
| `BANG_HAI_KY_TU_THEO_KY_HIEU_SO3` | Cho phép **CN** và **LH** khớp nhóm mức **2** (và LH thêm nhóm **4**) để **HC_250** không báo sai khi thẻ đã chuyển mức. |
| Seed **`HC_25`** | Cảnh báo tỷ lệ cho thẻ **CN** (nội dung cập nhật dẫn chiếu CV 38 / NQ 261). |
| Seed **`HC_251`** | Cảnh báo tỷ lệ cho thẻ **LH** (mới). |
| `layThongTinMucHuongTuThe(XML1)` | `benefitCode` / `benefitPercent` theo **ký hiệu sau quy đổi** (phục vụ **HC-06d**). |

---

## 3. Gợi ý suy luận cho AI

1. **Không** nhầm “ký tự in trên XML” với “mức quyền lợi phải áp dụng” sau **01/01/2026** đối với **CN** và **LH** — ưu tiên đọc engine qua `KY_HIEU_SO_THU_BA_THE_CHO_TYLE_TT`.
2. Hồ sơ **trước 01/01/2026** (mốc `NGAY_VAO` / `NGAY_RA` / `NGAY_TTOAN` trong engine): **không** quy đổi 3→2 hay 4→2 theo CV 38.
3. **QĐ 1018/QĐ-BHXH** vẫn là khung **1–5** cho các đối tượng khác; CV 38 chỉ **điều chỉnh nhóm CN và LH** theo NQ 261.

---

*Cập nhật khi có văn bản sửa đổi / hướng dẫn liên tịch BHXH — Bộ Y tế bổ sung sau CV 38.*
