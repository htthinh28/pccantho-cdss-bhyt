# CA HUẤN LUYỆN: LỖI AN TOÀN - LIỀU KHÁNG SINH QUẢL CAO

Phiên bản: 1.0
Ngày cập nhật: 06/04/2026

## 1. Mục đích

Ca này dạy AI cách phát hiện và xử lý **lỗi an toàn lâm sàng** - khi **liều kháng sinh vượt quá khuyến cáo**, gây **nguy hiểm tính mạng**.

Trọng tâm:
- Hiểu mức độ nguy hiểm của liều quá cao
- Phân biệt "cảnh báo" vs "xuất toán" vs "ngừng dùng ngay"
- Cơ chế xử lý theo Quyết định 5631/QĐ-BYT (quản lý kháng sinh)

---

## 2. Hồ sơ ví dụ

| Thông tin | Giá trị |
|-----------|--------|
| **MA_LK** | OP26000908 |
| **NGAY_VAO** | 2026-03-19 |
| **NGAY_RA** | 2026-03-22 |
| **MA_BENH_CHINH** | A09 (Tiêu chảy nhiễm khuẩn) |
| **TUOI** | 45 tuổi, DAPAT: 75kg |
| **LOAI_KCB** | 2 (ngoại trú, 3 ngày) |

** Bệnh cảnh lâm sàng:**
- Bệnh nhân vào viện vì tiêu chảy cấp, sốt
- Chẩn đoán: Tiêu chảy nhiễm khuẩn (A09)
- Điều trị: Kháng sinh đường uống

---

## 3. Phát hiện lỗi an toàn

### 3.1. Thuốc trong hồ sơ: Fluoroquinolone (Levofloxacin)

**Dòng thuốc XML2:**
```
MA_THUOC: 40.XXX (Levofloxacin)
TEN_THUOC: Levofloxacin 500mg
LIEU_DUNG: "500mg x 2 lần/ngày x 5 ngày"
SO_LUONG: 10 (viên)
TONG_LIEU_24H: 1000mg/ngày
TONG_LIEU_DIEU_TRI: 5000mg (5 ngày)
GIA_THANH_TOAN: 45.000đ
THANH_TIEN: 450.000đ
```

### 3.2. Kiểm tra hướng dẫn sử dụng

**Levofloxacin cho tiêu chảy nhiễm khuẩn - Hướng dẫn chuẩn BNF, WHO:**

| Tiêu chí | Khuyến cáo | Hồ sơ | Kết quả |
|----------|-----------|--------|---------|
| **Liều mỗi lần** | 250-500mg | 500mg ✓ | ✅ Đúng |
| **Tần suất** | 1 lần/ngày | 2 lần/ngày | ❌ SAI |
| **Liều tối đa/ngày** | 500mg/ngày | 1000mg/ngày | ❌ GẤP ĐÔI |
| **Thời gian** | 3-5 ngày | 5 ngày | ✅ Chấp nhận |
| **Thời gian tối đa** | 5 ngày | 5 ngày | ✅ Chấp nhận |

### 3.3. Rút ra kết luận

```
LEVO sử dụng:   1000mg/ngày
Khuyến cáo:      500mg/ngày
━━━━━━━━━━━━━━━━━━━━━━
VƯỢT QUÁLIỀU:    500mg/ngày (100% → GẤP ĐÔI)
```

**Mức độ lỗi:** ❌ **NGUY HIỂM LI LẠC**

---

## 4. Tại sao 1000mg/ngày là nguy hiểm?

### 4.1. Tác dụng phụ của Levofloxacin liều cao

**Nguy hiểm chính:**
1. **Tendinitis/Tendon rupture** (đứt gân, nhất là Achilles)
   - Nguy cơ tăng gấp 3-4 lần ở liều cao
   - Có thể gây tàn tật vĩnh viễn

2. **QT prolongation** (kéo dài khoảng QT trong EKG)
   - Liều cao → tăng nguy cơ rối loạn nhịp tim
   - Có thể gây nguy hiểm tính mạng (tachycardia, syncope)

3. **Viêm gân achilles**
   - Đặc biệt ở bệnh nhân cao tuổi

4. **Neurotoxicity** (độc thần kinh)
   - Mất ngủ, lú lẫn, rúng động, tremor

### 4.2. Tại sao chỉ 500mg/ngày là đủ?

- **Tiêu chảy nhiễm khuẩn** là bệnh nhẹ, không phải bệnh nặng
- **Fluoroquinolone 500mg/ngày** đã đủ hiệu quả điều trị tiêu chảy
- **Tăng liều không tăng hiệu quả**, chỉ **tăng độc tính**
- Điều trị overuse kháng sinh là **chính sách quốc tế** để giảm kháng thuốc

---

## 5. Căn cứ pháp lý

### 5.1. Luật cơ sở

**Luật BHYT 75/2014, Điều 15:**
> "Thanh toán chi phí phù hợp với bệnh lý, chẩn đoán, hướng dẫn sử dụng được phép."

### 5.2. Quyết định triển khai

**Quyết định 5631/QĐ-BYT năm 2020 (Quản lý sử dụng kháng sinh):**

**Điều 2:** "Không sử dụng quá liều tối đa khuyến cáo"
- Levofloxacin tối đa 500mg/ngày cho tiêu chảy
- Dùng 1000mg/ngày → vi phạm

**Điều 3:** "Hướng dẫn sử dụng Fluoroquinolone"
- Cho tiêu chảy nhiễm khuẩn không biến chứng: 500mg/ngày
- Không nên kéo dài quá 5 ngày

**Điều 4:** "Nếu vượt liều → phải có hội chẩn hoặc xác nhận"
- Ca này không có hội chẩn → vi phạm

### 5.3. Nguyên tắc Y học

**BNF (British National Formulary), WHO Antibiotic Guidelines:**
- Fluoroquinolone 500mg mỗi 24 giờ cho diarrhea
- Không sử dụng > 500mg/ngày ngoại trừ bệnh nhân nhập viện với bệnh nặng

### 5.4. Nghị định 188/2025

**Điều 2.2:** "Sai lạc chuyên môn gồm sử dụng quá liều, sử dụng không phù hợp hướng dẫn"

---

## 6. Cách xử lý theo mức độ lỗi

### 6.1. Mức độ 1: Vượt 10-25% → Cảnh báo

**Ví dụ:** Dùng 550mg/ngày (khuyến cáo 500mg)

**Xử lý:**
```
⚠️ CẢNH BÁO: "Liều nhẹ cao hơn khuyến cáo 10%.
Đề nghị bệnh viện xem xét giảm liều."
```

### 6.2. Mức độ 2: Vượt 25-50% → Kiểm tra thêm

**Ví dụ:** Dùng 750mg/ngày (khuyến cáo 500mg)

**Xử lý:**
```
⚠️ KIỂM TRA: "Liều cao 50%.
Cần hội chẩn hoặc bằng chứng bệnh nặng từ bệnh án."
```

### 6.3. Mức độ 3: Vượt 50%+ → Xuất toán hoặc cảnh báo nghiêm

**Ví dụ:** CA NÀY - Dùng 1000mg/ngày (khuyến cáo 500mg = GẤP ĐÔI)

**Xử lý:**

**Tùy chọn A - XUẤT TOÁN BỘ (nhẹ hơn):**
```
⛔ XUẤT TOÁN BỘ: Phần liều vượt = 500mg/ngày x 5 ngày = 2500mg
Giá: 45.000đ/viên x 5 viên = 225.000đ
→ XUẤT TOÁN 225.000đ
```

**Tùy chọn B - XUẤT TOÁN TOÀN BỘ (nặng hơn, nếu không có hội chẩn):**
```
⛔ XUẤT TOÁN TOÀN BỘ: 450.000đ
Lý do: Liều quá cao 100%, không có bằng chứng chứng minh cần liều cao
```

---

## 7. Quyết định giám định chi tiết

```
QUYẾT ĐỊNH GIÁM ĐỊNH - LỖI CHUYÊN MÔN: LIỀU QUẢL CAO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Ma LK: OP26000908
Cơ sở Y tế: [Bệnh viện X]
Ngày phát hành: 06/04/2026

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

I. KẾT LUẬN CHUNG

Khai báo tổng tiền thanh toán: [X đ]

Kiểm tra phát hiện:
- Lỗi chuyên môn: an toàn kê đơn

Quyết định:
- ⛔ XUẤT TOÁN BỘ (liều quá cao)
- Hoặc ⚠️ CẢNH BÁO (nếu nhẹ hơn)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

II. CHI TIẾT LỖI

### 2.1. Mô tả

Hồ sơ kê Levofloxacin (mã 40.XXX) với liều 500mg x 2 lần/ngày (tổng 1000mg/ngày).

Hướng dẫn sử dụng: 500mg/ngày

Chi tiết:
- Sử dụng: 1000mg/ngày
- Khuyến cáo: 500mg/ngày
- Vượt quá: 500mg/ngày = 100% (GẤP ĐÔI)

### 2.2. Căn cứ pháp lý

- Luật BHYT 75/2014, Điều 15: "Thanh toán theo hướng dẫn sử dụng"
- Quyết định 5631/QĐ-BYT năm 2020, Điều 2: "Không vượt liều tối đa"
- BNF, WHO Antibiotic Guidelines: Fluoroquinolone 500mg/24h cho tiêu chảy
- Nghị định 188/2025, Điều 2.2: "Sai phạm gồm sử dụng quá liều"

### 2.3. Phân tích rủi ro

Levofloxacin liều cao (1000mg/ngày) tăng nguy cơ:
1. **Tendon rupture** (đứt gân) - tàn tật vĩnh viễn
2. **QT kéo dài** (prolongation) - rối loạn nhịp tim
3. **Neurotoxicity** - mất ngủ, rúng động
4. **Không tăng hiệu quả điều trị** - tiêu chảy là bệnh nhẹ

Bệnh nhân không có bằng chứng bệnh nặng từ:
- Xét nghiệm máu
- Bệnh án (không nói laxative nặng)
- Chẩn đoán (A09 = tiêu chảy không biến chứng, không nặng)

### 2.4. Quyết định

⛔ **XUẤT TOÁN BỘ - 225.000đ** (phần liều vượt)

Chi tiết:
- Liều đúng: 500mg/ngày x 5 ngày = 2500mg = 5 viên = 225.000đ
- Liều kê: 1000mg/ngày x 5 ngày = 5000mg = 10 viên = 450.000đ
- Liều vượt: 5 viên = 225.000đ
- **XUẤT TOÁN: 225.000đ**

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

III. GIẢI THÍCH CHO BỆNH VIỆN

Hồ sơ OP26000908 sử dụng Levofloxacin (kháng sinh Fluoroquinolone) với liều **1000mg/ngày trong 5 ngày**, tổng **10 viên**, tổng tiền **450.000đ**.

Theo hướng dẫn sử dụng chuẩn từ WHO, BNF, và Quyết định 5631/QĐ-BYT năm 2020:
- Fluoroquinolone cho **tiêu chảy nhiễm khuẩn không biến chứng**
- Liều khuyến cáo: **500mg/ngày**

Hồ sơ kê **1000mg/ngày = GẤP ĐÔI** liều khuyến cáo.

**Vì sao xuất toán?**
1. Liều quá cao không tăng hiệu quả (bệnh tiêu chảy nhẹ)
2. Liều quá cao tăng **nguy hiểm tính mạng** (đứt gân, rối loạn nhịp)
3. Không có hội chẩn hoặc xác nhận lý do dùng liều cao
4. Không có bằng chứng bệnh nặng từ bệnh án hoặc xét nghiệm

**Xử lý:**
- Phần liều đúng (5 viên x 5 ngày = 225.000đ): **THANH TOÁN**
- Phần liều vượt (5 viên x 5 ngày = 225.000đ): **XUẤT TOÁN**

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

IV. BẢNG TÍNH CHI TIẾT

Levofloxacin 500mg
- Giá BHYT: 45.000đ/viên
- Khoảng liều đúng: 500mg/ngày x 5 ngày = 5 viên = 225.000đ ✓
- Khoảng liều kê: 1000mg/ngày x 5 ngày = 10 viên = 450.000đ
- Vượt quá: 5 viên = 225.000đ ❌

**XUẤT TOÁN: 225.000đ (phía quá cấp)**

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

V. HƯỚNG DẪN PHÚC ĐÁP

Bệnh viện có quyền phúc đáp trong 30 ngày nếu:

1. **Có hội chẩn:**
   - Bản ghi hội chẩn chứng minh bệnh nhân nặng hơn (enteropathogens phức tạp, hoại tử, etc.)
   - → Có thể tăng liều lên 1000mg/ngày

2. **Có bằng chứng bệnh nặng từ XML5 (diễn biến):**
   - "Sốt cao liên tục, tiêu chảy máu, sốc..."
   - Xét nghiệm máu: CRP cao, WBC cao, sốc điện giải
   - → Có thể chứng minh cần liều cao

3. **Chứng minh từ y lệnh:**
   - Có ghi rõ "bệnh đặc biệt cần liều cao"
   - → Có thể tái xét

**Nếu phúc đáp không chứng thực được → Quyết định xuất toán có hiệu lực.**

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

HẾT
```

---

## 8. Bài học rút ra cho AI

### 8.1. Những dấu hiệu "nguy hiểm liều cao"

| Kháng sinh | Liều tối đa/ngày | Nguyên tắc | Cảnh báo |
|-----------|-----------------|-----------|---------|
| Levofloxacin | 500mg | Tiêu chảy: 500mg | Vượt = GẤP ĐÔI |
| Aciclovir | 4g | Herpes: 4g | Vượt = Sốc thận |
| Ceftriaxone | 4g | Bình thường: 4g | 8g = GẤP ĐÔI |
| Aminoglycosides | Tùy cân nặng | Tính theo kg | Vượt = Ototoxicity |

### 8.2. Phân biệt "Cảnh báo" vs "Xuất toán"

**AR CỦA "CẢNH BÁO":**
- Liều vượt đôi chút (10-25%)
- Bệnh nhân có bệnh nặng (bằng chứng rõ)
- Có lý do hợp lý từ bệnh án

**DẤU HIỆU "XUẤT TOÁN":**
- Liều vượt đáng kể (50%+)
- KHÔNG có bằng chứng bệnh nặng
- KHÔNG có hội chẩn
- KHÔNG có giải thích từ y bác sĩ

### 8.3. Mẫu kết luận an toàn

**Xấu:**
"Liều cao → xuất toán"

**Tốt:**
"Levofloxacin 1000mg/ngày gấp đôi liều khuyến cáo (500mg/ngày).
Theo Quyết định 5631/QĐ-BYT, liều tối đa Levofloxacin cho tiêu chảy là 500mg/ngày.
Bệnh nhân không có bằng chứng bệnh nặng từ bệnh án hoặc xét nghiệm.
Không có hội chẩn để xác nhận cần liều cao.
Do đó: XUẤT TOÁN BỘ 225.000đ (phần liều vượt)"

---

## 9. Prompt học tập

### Prompt 1: Kiểm tra liều
```
"Hồ sơ OP26000908 dùng Levofloxacin 1000mg/ngày cho tiêu chảy.
Liều khuyến cáo là bao nhiêu? Cái gì là sai?"
```

### Prompt 2: Đánh giá mức độ
```
"Nếu vượt liều 100%, có nên xuất toán toàn bộ hay xuất bộ?
Tại sao? Cần xem dữ liệu gì từ hồ sơ?"
```

### Prompt 3: Soạn quyết định
```
"Soạn quyết định xuất toán choổi an toàn về liều,
bao gồm: Chẩn đoán, Liều sử dụng, Liều khuyến cáo, Nguy hiểm, Xử lý"
```

---

## 10. Ghi chú cuối

- **Có liều thấp cũng nguy hiểm** (vô hiệu) nhưng ****liều quá cao là nguy hiểm hơn** (độc)
- **Không phải tất cả liều quá cao đều xuất toán** - phải xem bằng chứng bệnh nặng
- **Đây là ca lỗi "rõ ràng"** - vượt gấp đôi, không có giải thích → XUẤT TOÁN
- **Tuân thủ Quyết định 5631 = bảo vệ bệnh nhân + bảo vệ BHYT**
