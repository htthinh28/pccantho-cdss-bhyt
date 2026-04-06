# CA HUẤN LUYỆN: VI PHẠM QUYẾT ĐỊNH 188/2025 VỀ THANH TOÁN BHYT

Phiên bản tài liệu: 1.0
Ngày cập nhật: 06/04/2026

## 1. Mục đích

Ca này dạy AI cách **áp dụng pháp luật vào quyết định giám định thực tế**, bằng cách:

- Nhận diện loại vi phạm (hành chính, chuyên môn-an toàn, chuyên môn-chỉ định, thanh toán hình thức)
- Tìm **căn cứ pháp lý rõ ràng** từ Luật BHYT và Nghị định 188/2025
- Giải thích **tại sao cần xuất toán** bằng ngôn ngữ **pháp lý chuyên nghiệp**
- Chuẩn bị **quyết định chi tiết** để bệnh viện hiểu và có thể **phúc đáp**

---

## 2. Bối cảnh tổng hợp

### 2.1. Hồ sơ ví dụ

| Thông tin | Giá trị |
|-----------|--------|
| **MA_LK** | 403244 |
| **NGAY_VAO** | 2026-03-10 |
| **NGAY_RA** | 2026-03-12 |
| **MA_BENH_CHINH** | C61 (Ung thư tuyến tiền liệt) |
| **PTTT_CODE** | Phẫu thuật cắt tuyến tiền liệt (TURP) |
| **LOAI_KCB** | 3 (nội trú) |
| **TONG_TIEN_XML1** | 45.680.000đ |
| **TONG_TIEN_XML2** | 22.340.000đ |

### 2.2. Lỗi được phát hiện

Hồ sơ này có **nhiều lỗi chồng chéo**:

✅ **Lỗi hành chính** (dữ liệu sai)
✅ **Lỗi chuyên môn - An toàn** (liều kháng sinh quá cao)
✅ **Lỗi chuyên môn - Chỉ định** (kháng sinh dự phòng không đúng bệnh)
✅ **Lỗi thanh toán hình thức** (chênh lệch tổng tiền)

**Ý nghĩa cho AI:**
- Ca này cho thấy **một hồ sơ có thể có nhiều lỗi** và cần **xác định từng cái một**
- Mỗi lỗi có **mức độ khác nhau** và **xử lý khác nhau**

---

## 3. Chi tiết từng lỗi và xuyên chứng pháp lý

### LỖI 1: Lỗi hành chính - Chênh lệch tiền thanh toán

#### 3.1.1. Dấu hiệu

**Phát hiện:**
```
XML1.T_THUOC = 45.680.000đ (khai báo tổng tiền thuốc)
XML2_TOTAL = 22.340.000đ (tổng tiền từ danh sách thuốc XML2)
Chênh lệch = 45.680.000 - 22.340.000 = 23.340.000đ (+51%)
```

**Diễn giải:**
- Bệnh viện khai báo tổng tiền thuốc 45.68 triệu
- Nhưng danh sách thuốc chi tiết (XML2) chỉ tính được 22.34 triệu
- **Chênh lệch 23.34 triệu (51%) là một con số rất lớn → cảnh báo đỏ**

#### 3.1.2. Căn cứ pháp lý

**Luật cơ sở:**
- **Luật BHYT 75/2014, Điều 16:** "Thanh toán chi phí phải đúng thủ tục và có xứng đáng với danh mục, theo hóa đơn, chứng từ."

**Quyết định triển khai:**
- **Quyết định 130/QĐ-BYT:** "Cấu trúc dữ liệu XML phải nhất quán. Tổng tiền XML1 phải khớp với chi tiết XML2."
- **Quyết định 3618/QĐ-BHXH:** "Xác minh dữ liệu kế toán là điều kiện thanh toán."

**Nghị định 188/2025:**
- **Điều 1:** "Sai lạc bao gồm lỗi kế toán - sai sót trong tính toán, chênh lệch số liệu."
- **Điều 2.1:** "BHXH có quyền từ chối thanh toán nếu phát hiện chênh lệch tiền thanh toán lớn hơn 10%."

#### 3.1.3. Mức độ lỗi

| Tiêu chí | Kết quả |
|----------|--------|
| Mức chênh lệch | 51% (vượt 10%) |
| Mức độ nghiêm trọng | **LỖI NẶNG** |
| Cần xác minh | Cần bệnh viện giải thích: 23.34 triệu đó ở đâu? |

#### 3.1.4. Kết luận và xử lý

**Quyết định:**
- ⛔ **KIỂM SOÁT CHẶT** - Từ chối thanh toán tạm thời cho 23.34 triệu cho đến khi bệnh viện giải thích
- 📋 **Yêu cầu bệnh viện:**
  - Cung cấp chi tiết tất cả thuốc được cấp (bảng excel hoặc hóa đơn)
  - Giải thích tại sao XML1 > XML2
  - Sửa lại XML2 hoặc hóa đơn để khớp với khai báo

---

### LỖI 2: Lỗi chuyên môn - An toàn (Liều kháng sinh quá cao)

#### 3.2.1. Dấu hiệu

**Trong XML2, có dòng:**
```
MA_THUOC: 40.167 (Ceftriaxone)
NGAY_YL: 2026-03-10
LIEU_DUNG: "2g [1g x 2 lọ] x 4 lần/ngày x 3 ngày"
SO_LUONG: 24 (lọ)
TONG_LIEU_24H: 8000mg/ngày
GIA_THANH_TOAN: 25.000đ/lọ
THANH_TIEN: 600.000đ

Tính toán:
- 1g x 2 lọ x 4 lần/ngày = 8g/ngày = 8000mg/ngày
- Thời gian: 3 ngày
- Tổng số lượng: 2 lọ x 4 lần x 3 ngày = 24 lọ ✓
```

#### 3.2.2. Căn cứ pháp lý

**Hướng dẫn sử dụng Ceftriaxone:**
- **Liều tối đa cho người lớn:** 4g/ngày (2g x 2 lần)
- **Liều dự phòng phẫu thuật:** 1-2g x 1 lần trước mổ
- **Liều điều trị nhiễm khuẩn:** 1-2g x 2 lần/ngày (tối đa 4g/ngày)

**Hồ sơ đang dùng:** 8g/ngày (**GẤP ĐÔI** liều tối đa)

**Luật cơ sở:**
- **Luật BHYT 75/2014, Điều 15:** "Thanh toán chi phí phù hợp với hướng dẫn sử dụng được phép."

**Quyết định triển khai:**
- **Quyết định 5631/QĐ-BYT năm 2020 (Quản lý sử dụng kháng sinh):**
  - Điều 2.1: "Không được vượt quá liều tối đa khuyến cáo."
  - Điều 3.2: "Dự phòng phẫu thuật chỉ dùng 1-2 lần, không kéo dài."
  - Điều 4: "Nếu thắc mắc liều, phải có hội chẩn."

**Nghị định 188/2025:**
- **Điều 2.2:** "Sai lạc chuyên môn bao gồm: sử dụng quá liều, sử dụng sai tần suất, sử dụng không phù hợp hướng dẫn."

#### 3.2.3. Tình trạng lâm sàng bối cảnh

**Câu hỏi quan trọng:** "Tại sao kê 8g/ngày (quá liều) cho TURP?"

**Phân tích:**
- TURP là phẫu thuật **sạch sẽ**, không phải **sạch bẩn**
- Dự phòng kháng sinh cho TURP nên chỉ dùng **1 lần trước mổ** hoặc **1-2 lần trong 24 giờ sau**
- Không nên kéo dài đến **3 ngày với liều 8g/ngày**

#### 3.2.4. Kết luận và xử lý

**Quyết định:**
- ⛔ **XUẤT TOÁN:** 600.000đ (toàn bộ chi phí Ceftriaxone)

**Giải thích chi tiết:**

"Hồ sơ 403244 sử dụng Ceftriaxone (mã 40.167) với liều 8g/ngày trong 3 ngày, tổng 24g, tổng tiền 600.000đ.

**Luật:**
- Theo Luật BHYT 75/2014, Điều 15, thanh toán chi phí phải phù hợp với hướng dẫn sử dụng được phép.
- Theo Quyết định 5631/QĐ-BYT năm 2020 (Quản lý sử dụng kháng sinh), liều tối đa Ceftriaxone là 4g/ngày.
- Bệnh nhân được phẫu thuật TURP (phẫu thuật sạch), chỉ cần dự phòng 1 lần hoặc 1-2 lần trong 24 giờ, không nên kéo dài 3 ngày.

**Phân tích:**
- Liều dùng 8g/ngày vượt xa liều tối đa (gấp 2 lần)
- Thời gian dùng (3 ngày liên tục) không phù hợp với dự phòng phẫu thuật sạch
- Dấu hiệu sử dụng sai phác đồ hoặc sai liều

**Xử lý:**
- XUẤT TOÁN 600.000đ vì sử dụng quá liều
- Yêu cầu bệnh viện giải thích: Tại sao lại dùng 8g/ngày? Có hội chẩn không?
- Nếu bệnh viện phúc đáp rằng bệnh nhân bị nhiễm khuẩn nặng, phải cung cấp bằng chứng (cấy, kiểm tra, diễn biến) từ XML5"

---

### LỖI 3: Lỗi chuyên môn - Chỉ định (Kháng sinh dự phòng cho bệnh ác tính)

#### 3.3.1. Dấu hiệu

**Bối cảnh:**
- Chẩn đoán chính: **C61** (Ung thư tuyến tiền liệt - bệnh ác tính, không phải nhiễm khuẩn)
- PTTT: **TURP** (phẫu thuật, có chỉ định dự phòng)

**Kháng sinh trong XML2:**
```
MA_THUOC: 40.167 (Ceftriaxone) - dự phòng
MA_THUOC: 40.260 (Aciclovir) - ?
MA_THUOC: 40.429 (Mekoferrat-B9) - bổ sung sắt, folic
```

**Vấn đề:**
- **Ceftriaxone cho TURP** = hợp lý (dự phòng phẫu thuật)
- **Aciclovir** = không rõ chỉ định (bệnh nhân không có Herpes/Zona, chỉ có ung thư)
- **Mekoferrat-B9** = không rõ chỉ định (bệnh nhân không có thiếu máu D50 hay bà bầu O25)

**Câu hỏi:** "Tại sao kê Aciclovir cho ung thư tuyến tiền liệt?"

#### 3.3.2. Căn cứ pháp lý

**Danh mục thanh toán Aciclovir (theo 15/VBHN-BYT năm 2025):**
- **Được thanh toán cho:** Herpes (B00), Zona (B02)
- **KHÔNG được thanh toán cho:** C61, ung thư, hoặc chẩn đoán khác

**Luật cơ sở:**
- **Luật BHYT 75/2014, Điều 15:** "Thanh toán chi phí phù hợp với bệnh lý và chẩn đoán."

**Quyết định triển khai:**
- **15/VBHN-BYT năm 2025 (Danh mục bảo hiểm BHYT):** Phạm vi thanh toán mỗi thuốc
- **Quyết định 123/2020/NĐ-CP:** "Chỉ thanh toán dịch vụ/thuốc nằm trong danh mục, cho bệnh lý được phép."

**Nghị định 188/2025:**
- **Điều 2.3:** "Sai lạc chuyên môn bao gồm: sử dụng không đúng chỉ định, sử dụng cho bệnh lý không được phép."

#### 3.3.3. Kết luận và xử lý

**Quyết định:**
- ⛔ **XUẤT TOÁN:** Chi phí Aciclovir (giả sử 150.000đ)

**Giải thích:**

"Hồ sơ 403244 kê Aciclovir (mã 40.260) cho bệnh nhân có chẩn đoán C61 (Ung thư tuyến tiền liệt), tổng tiền 150.000đ.

**Luật:**
- Theo Luật BHYT 75/2014, Điều 15, thanh toán phù hợp với bệnh lý bệnh nhân.
- Theo 15/VBHN-BYT năm 2025 (Danh mục bảo hiểm), Aciclovir chỉ được thanh toán cho Herpes (B00) hoặc Zona (B02).

**Phân tích:**
- Bệnh nhân có chẩn đoán C61 (ung thư), không có Herpes hoặc Zona
- Aciclovir không nằm trong danh mục bảo hiểm cho C61
- Sử dụng Aciclovir là sai chỉ định

**Xử lý:**
- XUẤT TOÁN 150.000đ (toàn bộ chi phí Aciclovir)
- Chỉ thanh toán lại nếu bệnh viện cung cấp bằng chứng rằng bệnh nhân có Herpes/Zona kèm theo (chẩn đoán kèm)"

---

### LỖI 4: Lỗi thanh toán hình thức (Chưa rõ mục đích dùng Mekoferrat)

#### 3.4.1. Dấu hiệu

```
MA_THUOC: 40.429 (Mekoferrat-B9)
SO_LUONG: 6
TONG_LIEU: Không rõ (giả sử 1 lọ x 1 lần x 6 ngày)
THANH_TIEN: 90.000đ
```

**Câu hỏi:** "Tại sao bệnh nhân ung thư được kê bổ sung sắt/folic? Có thiếu máu không?"

#### 3.4.2. Căn cứ pháp lý

- **15/VBHN-BYT năm 2025:** Mekoferrat-B9 chỉ thanh toán cho D50 (thiếu máu) hoặc O25 (bà bầu)
- **Luật BHYT 75/2014, Điều 15:** Thanh toán phù hợp với bệnh lý

#### 3.4.3. Kết luận

- ⛔ **XUẤT TOÁN:** 90.000đ If chẩn đoán D50/O25 không có

---

## 4. Tóm tắt tổng hợp

| Lỗi | Loại | Căn cứ | Xử lý | Tiền xuất toán |
|-----|------|--------|-------|---------|
| Chênh lệch tiền | Hành chính | Luật 75/2014, Điều 16 | Kiểm soát chặt | 23.340.000đ |
| Ceftriaxone 8g/ngày | An toàn | QĐ 5631, Luật 75/2014 | XUẤT TOÁN | 600.000đ |
| Aciclovir sai chỉ định | Chỉ định | 15/VBHN-2025, Luật 75/2014 | XUẤT TOÁN | 150.000đ |
| Mekoferrat sai chỉ định | Chỉ định | 15/VBHN-2025, Luật 75/2014 | XUẤT TOÁN | 90.000đ |
| **TỔNG** | | | | **24.180.000đ** |

---

## 5. Quyết định giám định chi tiết

### Mẫu quyết định theo Nghị định 188/2025

```

QUYẾT ĐỊNH GIÁM ĐỊNH BHYT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Hồ sơ: MA_LK 403244
Cơ sở Y tế: [Bệnh viện X]
Ngày phát hành: 06/04/2026
Giám định viên: [AI CDSS]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

I. KẾT LUẬN CHUNG

Hồ sơ lưu hành với tổng tiền thanh toán: 45.680.000đ

Kiểm tra phát hiện:
- 1 lỗi HÀNH CHÍNH
- 3 lỗi CHUYÊN MÔN

Quyết định:
- KIỂM SOÁT CHẶT (lỗi hành chính)
- XUẤT TOÁN BỘ (lỗi chuyên môn)

Tổng tiền XUẤT TOÁN: 840.000đ
Tổng tiền CHỜ XỬ LÝ: 23.340.000đ (lỗi hành chính - chênh lệch)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

II. CHI TIẾT TỪNG LỖI

### LỖI 1: CHÊNH LỆCH TIỀN THANH TOÁN

**Mô tả:**
XML1 khai báo tổng tiền thuốc 45.680.000đ
XML2 danh sách chi tiết chỉ tính 22.340.000đ
Chênh lệch: 23.340.000đ (51%)

**Căn cứ pháp lý:**
Luật BHYT 75/2014, Điều 16
Quyết định 130/QĐ-BYT (Cấu trúc XML)
Quyết định 3618/QĐ-BHXH (Xác minh dữ liệu)
Nghị định 188/2025, Điều 1, Điều 2.1

**Quyết định:**
⛔ KIỂM SOÁT CHẶT

**Chi tiết xử lý:**
1. Từ chối thanh toán tạm thời cho 23.340.000đ
2. YÊU CẦU bệnh viện trong vòng 15 ngày:
   - Cung cấp chi tiết tất cả thuốc
   - Giải thích chênh lệch
   - Sửa XML hoặc chứng thực theo hóa đơn
3. Nếu bệnh viện không giải thích → XUẤT TOÁN 23.340.000đ

### LỖI 2: CEFTRIAXONE QUẢL LIỀU

**Mô tả:**
Ceftriaxone 2g x 4 lần/ngày = 8g/ngày
Liều tối đa theo hướng dẫn: 4g/ngày
Vượt liều: GẤP ĐÔI (200%)
Thời gian: 3 ngày liên tục (quá dài cho dự phòng)

**Căn cứ pháp lý:**
Luật BHYT 75/2014, Điều 15 (Thanh toán theo hướng dẫn)
Quyết định 5631/QĐ-BYT năm 2020 (Quản lý kháng sinh)
Nghị định 188/2025, Điều 2.2 (Sai lạc gồm quá liều)

**Quyết định:**
⛔ XUẤT TOÁN TOÀN BỘ

**Chi tiết:**
- Chi phí Ceftriaxone: 600.000đ
- Lý do: Sử dụng quá liều, không phù hợp hướng dẫn sử dụng
- Phúc đáp: Bệnh viện có quyền phúc đáp nếu cung cấp bằng chứng hội chẩn hoặc nhiễm khuẩn nặng (từ XML5)

### LỖI 3: ACICLOVIR SAI CHỈ ĐỊNH

**Mô tả:**
Aciclovir (mã 40.260) kê cho bệnh nhân C61 (Ung thư)
Chẩn đoán không có Herpes (B00) hay Zona (B02)

**Căn cứ pháp lý:**
Luật BHYT 75/2014, Điều 15 (Thanh toán phù hợp bệnh lý)
15/VBHN-BYT năm 2025 (Danh mục bảo hiểm - Aciclovir chỉ cho B00, B02)
Quyết định 123/2020/NĐ-CP (Phạm vi thanh toán)
Nghị định 188/2025, Điều 2.3 (Sai lạc gồm sai chỉ định)

**Quyết định:**
⛔ XUẤT TOÁN TOÀN BỘ

**Chi tiết:**
- Chi phí Aciclovir: 150.000đ
- Lý do: Sai chỉ định - không nằm trong danh mục bảo hiểm cho C61
- Phúc đáp: Chỉ thanh toán lại nếu bệnh viện chứng minh bệnh nhân có Herpes/Zona (thêm chẩn đoán B00 hoặc B02)

### LỖI 4: MEKOFERRAT-B9 SAI CHỈ ĐỊNH

**Mô tả:**
Mekoferrat-B9 (mã 40.429) kê cho bệnh nhân C61
Không có chẩn đoán D50 (thiếu máu) hay O25 (bà bầu)

**Căn cứ pháp lý:**
15/VBHN-BYT năm 2025 (Danh mục bảo hiểm)
Luật BHYT 75/2014, Điều 15

**Quyết định:**
⛔ XUẤT TOÁN TOÀN BỘ

**Chi tiết:**
- Chi phí Mekoferrat: 90.000đ
- Lý do: Sai chỉ định - không nằm trong danh mục cho C61
- Phúc đáp: Chỉ thanh toán lại nếu bệnh viện thêm chẩn đoán D50 hoặc O25

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

III. TỔNG HỢP KẾT LUẬN

| Hạng mục | Tiền |
|---------|------|
| Tổng tiền thanh toán khai báo | 45.680.000đ |
| Lỗi hành chính (chênh lệch) | (23.340.000đ) - CHỜ XỬ LÝ |
| Lỗi an toàn - Ceftriaxone | (600.000đ) - XUẤT TOÁN |
| Lỗi chỉ định - Aciclovir | (150.000đ) - XUẤT TOÁN |
| Lỗi chỉ định - Mekoferrat | (90.000đ) - XUẤT TOÁN |
| **Tổng XUẤT TOÁN hiện tại** | **(840.000đ)** |
| **Chờ xử lý lỗi hành chính** | **(23.340.000đ)** |
| Dự kiến thanh toán (nếu không có lỗi hành chính) | 21.500.000đ |

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

IV. HƯỚNG DẪN PHÚC ĐÁP CHO BỆnh VIỆN

Theo Nghị định 188/2025, Điều 4, bệnh viện có quyền phúc đáp trong vòng **30 ngày** kể từ ngày nhận quyết định.

**Cách phúc đáp:**

1. **Lỗi hành chính (23.34 triệu):**
   - Cung cấp hóa đơn gốc hoặc sao chép được chứng thực từ kế toán
   - Sửa XML2 để khớp với hóa đơn
   - Giải thích chi tiết về 23.34 triệu đó (lần nào kê, bao gồm những thuốc gì)

2. **Ceftriaxone 8g/ngày:**
   - Nếu bệnh nhân bị nhiễm khuẩn nặng: cung cấp kết quả cấy (từ XML4)
   - Nêu bằng chứng từ diễn biến bệnh (XML5) cho thấy nhiễm khuẩn nặng
   - Nếu có hội chẩn: cung cấp bản ghi hội chẩn với lý do dùng 8g/ngày

3. **Aciclovir sai chỉ định:**
   - Cung cấp bằng chứng Herpes hoặc Zona (chẩn đoán thêm B00 hoặc B02)
   - Hoặc giải thích lý do dùng Aciclovir cho C61

4. **Mekoferrat sai chỉ định:**
   - Cung cấp bằng chứng thiếu máu (chẩn đoán D50) hoặc suy dinh dưỡng thai kỳ (O25)
   - Hoặc giải thích lý do dùng cho C61

**Lưu ý:** Nếu phúc đáp hợp lệ sẽ được xem xét lại. Nếu không phúc đáp hoặc phúc đáp không chứng thực được, quyết định xuất toán sẽ có hiệu lực.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

V. LUẬT LỆ CHỈ DẪN

Quyết định này được ra dựa trên:
- Luật BHYT 75/2014 (như sửa đổi)
- Luật BHYT 07/2023/QH15 (hiệu lực từ 01/06/2024)
- Nghị định 188/2025/NĐ-CP
- Quyết định 5631/QĐ-BYT năm 2020
- 15/VBHN-BYT năm 2025
- Quyết định 130/QĐ-BYT
- Quyết định 3618/QĐ-BHXH

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

HẾT
```

---

## 6. Bài học rút ra cho AI

### 6.1. Cách nhận diện và phân loại lỗi

Khi gặp một hồ sơ, AI nên:

1. **Trước tiên kiểm tra lỗi HÀNH CHÍNH** (dữ liệu sai/thiếu)
   - Chênh lệch tiền, ngày tháng sai, dữ liệu thiếu
   - Nếu có lỗi hành chính → từ chối thanh toán tạm thời, yêu cầu xác minh

2. **Sau đó kiểm tra lỗi CHUYÊN MÔN**
   - Liều vượt, tần suất sai (an toàn)
   - Chẩn đoán không phù hợp (chỉ định)
   - Nếu có → xem xét xuất toán bộ hoặc toàn bộ

3. **Cuối cùng kiểm tra lỗi THANH TOÁN HỞ THỨC**
   - Số lượng quá, tính toán sai, giá sai

### 6.2. Cốt lõi của Nghị định 188/2025

```
"Từ giờ, AI không chỉ kiểm tra 'Có lỗi không?'
mà còn phải trả lời 'Cái lỗi này là gì? Căn cứ pháp lý là gì? Xuất toán bao nhiêu?'"
```

Nghị định 188/2025 **tăng tiêu chuẩn** về **xuyên chứng pháp lý** và **minh bạch quyết định**.

### 6.3. Mẫu giải thích tốt

**Xấu:**
"Aciclovir là sai chỉ định → xuất toán"

**Tốt:**
"Hồ sơ kê Aciclovir cho C61 (ung thư). Theo 15/VBHN-BYT năm 2025, Aciclovir chỉ được thanh toán cho B00 (Herpes) hoặc B02 (Zona). Bệnh nhân không có chẩn đoán này → sai chỉ định → XUẤT TOÁN 150.000đ theo Nghị định 188/2025, Điều 2.3."

---

## 7. Các prompt học tập

### Prompt 1: Phân tích từng lỗi
```
"Hồ sơ 403244 có 4 lỗi. Hãy phân loại từng cái theo:
Loại, Luật cơ sở, Quyết định triển khai, Xử lý"
```

### Prompt 2: Tìm xuyên chứng pháp lý
```
"Giải thích tại sao lỗi 'Ceftriaxone 8g/ngày' phải XUẤT TOÁN,
dựa trên Luật BHYT 75/2014 và Quyết định 5631/QĐ-BYT"
```

### Prompt 3: Soạn quyết định chi tiết
```
"Soạn quyết định giám định cho lỗi 'Aciclovir sai chỉ định',
theo mẫu quyết định ở mục 5, bao gồm: Luật, Phân tích, Xử lý, Hướng dẫn phúc đáp"
```

---

## 8. Ghi chú

- Tài liệu này là **ví dụ mẫu** - các số tiền/hồ sơ có thể thay đổi
- **Quyết định thực tế** phải được **kiểm duyệt bởi giám định viên chuyên gia**
- **Phúc đáp phải được trả lời** trong **30 ngày** theo Nghị định 188/2025
- Nếu bệnh viện **phúc đáp thắng**, BHXH phải **thanh toán + lãi** trong **15 ngày**
