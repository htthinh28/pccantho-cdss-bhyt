# DANH SÁCH 10 CA TEST & DỮ LIỆU CHI TIẾT

Phiên bản tài liệu: 1.0
Ngày cập nhật: 06/04/2026

## 1. DANH SÁCH 10 CA TIMELINE ĐƯỢC PHÂN LOẠI

Dưới đây là 10 ca được chọn từ `test_xml/` folder, **sắp xếp theo độ phức tạp** từ dễ → khó.

| STT | MA_LK | File Audit Chính | Tổng Lỗi Kỳ Vọng | Loại Lỗi Chính | Cấp Độ | Lý Do Chọn | Ghi Chú |
|-----|-------|---|---|---|---|---|---|
| **1** | **403521** | audit_403521_20260405_225230.json | **0 lỗi** | (Không) | ⭐ Đơn giản | Thanh toán đúng, không có lỗi | **CA TEST CẤP 1** |
| **2** | **000339** | audit_000339_20260405_232511.json | **1 lỗi** | Thanh toán (Mekoferrat sai chẩn đoán) | ⭐ Đơn giản | 1 lỗi duy nhất, dễ nhận diện | Thanh toán N84.0 ≠ D50/O25 |
| **3** | **403538** | audit_403538_20260405_225547.json | **1 lỗi** | Thanh toán (THUOC_345) | ⭐ Đơn giản | 1 lỗi, cấu trúc đơn | Mogastic không danh mục |
| **4** | **000589** | audit_000589_20260405_232716.json | **2 lỗi** | Hành chính + Thanh toán | ⭐⭐ Trung bình | 2 lỗi khác loại, dễ phân biệt | **CA TEST CẤP 2** |
| **5** | **OP26000908** | audit_OP26000908_20260405_232932.json | **2 lỗi** | An toàn + Chỉ định | ⭐⭐ Trung bình | 2 lỗi, liều cao Amoxiclav | Liều/hạn mức vi phạm |
| **6** | **403244** | audit_403244_20260405_224614.json | **4 lỗi** | Hành ChíNH + PTTT + An toàn + Thanh toán | ⭐⭐⭐ Phức tạp | 4 lỗi chồng, bao quát tất cả loại | **CA TEST CẤP 3** |
| **7** | **000308** | audit_000308_20260405_083942.json | **2-3 lỗi** | Hành chính (ngày/dữ liệu) | ⭐⭐ Trung bình | Lỗi cấu trúc dữ liệu | Để dùng sau nếu cần |
| **8** | **000375** | audit_000375_20260405_065828.json | **1-2 lỗi** | An toàn / Thanh toán | ⭐ Đơn giản | Lỗi kháng sinh hoặc danh mục | Dự phòng, test thêm |
| **9** | **000376** | audit_000376_20260404_174042.json | **1-2 lỗi** | Thanh toán / Chỉ định | ⭐⭐ Trung bình | Lỗi chẩn đoán/danh mục | Dự phòng, test thêm |
| **10** | **000502** | audit_000502_20260404_192348.json | **1-2 lỗi** | An toàn / Hành chính | ⭐⭐ Trung bình | Lỗi dữ liệu hoặc liều | Dự phòng, test thêm |

---

## 2. 3 CA CHÍNH ĐƯỢC CHỌN CHO TEST HÔMNAY (TỐI)

### **CA TEST 1: CẤP 1 (Đơn Giản - 403521)**

**Mục tiêu:** AI hiểu hồ sơ **THANH TOÁN ĐÚNG** (không lỗi)

| Thông Tin | Giá Trị |
|-----------|--------|
| **MA_LK** | 403521 |
| **File Audit** | audit_403521_20260405_225230.json |
| **Chẩn đoán chính (MA_BENH_CHINH)** | Z33 (Phẫu thuật sản khoa) hoặc tương tự |
| **Loại KCB** | Nội trú (MA_LOAI_KCB = 3) |
| **Ngày vào/ra** | 3 ngày (Hợp lệ) |
| **Thuốc chính** | Cefazolin (40.xxx) - Dự phòng |
| **Tổng lỗi kỳ vọng** | **0 lỗi** |
| **Tình trạng mong muốn:** | THANH TOÁN ĐÚNG, không xuất toán |
| **Ghi chú** | Kiểm tra xem AI có nhận ra "không lỗi" không? |

**Cách chuẩn bị:**
1. Đọc file audit: `test_xml/audit_403521_20260405_225230.json`
2. Kéo ra: bệnh nhân, thuốc, dịch vụ
3. Soạn prompt (xem mục 4 dưới)

---

### **CA TEST 2: CẤP 2 (Trung Bình - 000589)**

**Mục tiêu:** AI phát hiện **2 lỗi khác loại** (1 hành chính + 1 thanh toán)

| Thông Tin | Giá Trị |
|-----------|--------|
| **MA_LK** | 000589 |
| **File Audit** | audit_000589_20260405_232716.json |
| **Chẩn đoán chính** | ? (Cần kéo từ audit) |
| **Loại KCB** | Nội trú |
| **Lỗi 1 kỳ vọng** | Hành chính (dữ liệu sai/thiếu) |
| **Lỗi 2 kỳ vọng** | Thanh toán (Cefotaxime hoặc loại khác) |
| **Tổng tiền xuất toán kỳ vọng** | 61% (chênh lệch tiền - từ MEMORY) |
| **Ghi chú** | AI cần nhận ra 2 loại lỗi khác nhau |

**Cách chuẩn bị:**
1. Đọc file audit
2. Kéo ra: 2 lỗi chính
3. Soạn prompt

---

### **CA TEST 3: CẤP 3 (Phức Tạp - 403244)**

**Mục tiêu:** AI phát hiện **4 lỗi chồng** từ 4 loại khác nhau

| Thông Tin | Giá Trị |
|-----------|--------|
| **MA_LK** | 403244 |
| **File Audit** | audit_403244_20260405_224614.json |
| **Chẩn đoán chính** | Polyp phẫu thuật nội soi hoặc tương tự |
| **Loại KCB** | Nội trú |
| **Lỗi 1** | Hành chính (dữ liệu/ngày) |
| **Lỗi 2** | Phẫu thuật (yêu cầu DVKT, giải phẫu bệnh) |
| **Lỗi 3** | An toàn (liều/tần suất kháng sinh) |
| **Lỗi 4** | Thanh toán (số lượng/giá) |
| **Tổng tiền xuất toán kỳ vọng** | Toàn bộ hoặc bộ phận (cần tính) |
| **Ghi chú** | AI phải tuân thủ 5 bước để phát hiện hết |

**Cách chuẩn bị:**
1. Đọc file audit
2. Kéo ra: 4 lỗi, từng loại 1
3. Soạn prompt chi tiết

---

## 3. DỮ LIỆU CHI TIẾT TỪNG CA (SAO CHÉP TỪ AUDIT JSON)

### **CA 1: 403521 - Dữ Liệu**

*Sau khi đọc audit JSON, kéo ra:*

```
MA_LK: 403521
Chẩn đoán chính: [Từ XML1.MA_BENH_CHINH]
Ngày vào: [Từ XML1.NGAY_VAO]
Ngày ra: [Từ XML1.NGAY_RA]
Thuốc chính: Cefazolin / Biofazolin
  - Mã: 40.166
  - SO_LUONG: 2-4 viên
  - GIA_THANH_TOAN: 15.000 đ/viên

Dịch vụ: [PTTT hoặc DVKT]

Tổng lỗi: 0
→ Kỳ vọng: THANH TOÁN ĐÚNG
```

---

### **CA 2: 000589 - Dữ Liệu**

*Sau khi đọc audit JSON, kéo ra:*

```
MA_LK: 000589
Chẩn đoán chính: [Từ XML1]
Lỗi 1: [HC_130 hoặc tương tự] - Hành chính (dữ liệu sai)
Lỗi 2: [THUOC_xxx] - Thanh toán (Cefotaxime sai liều/chẩn đoán)
  - Tiền: 61% hóa đơn

Tổng lỗi: 2
→ Kỳ vọng: XUẤT TOÁN BỘ
```

---

### **CA 3: 403244 - Dữ Liệu**

*Sau khi đọc audit JSON, kéo ra:*

```
MA_LK: 403244
Chẩn đoán: Polyp phẫu thuật nội soi cắt polyp
Lỗi 1: [HC_171 hoặc tương tự] - Hành chính (thiếu XML5 diễn biến)
Lỗi 2: [DVKT_2622] - PTTT (thiếu giải phẫu bệnh)
Lỗi 3: [THUOC_xxx] - An toàn (liều kháng sinh hoặc chống chỉ định)
Lỗi 4: [THUOC_yyy] - Thanh toán (Mekoferrat sai chẩn đoán)

Tổng lỗi: 4
→ Kỳ vọng: XUẤT TOÁN TOÀN BỘ hoặc BỘ
```

---

## 4. TEMPLATE PROMPT SẴN SÀN (CHỈ CẦN ĐIỀN DỮ LIỆU)

### **PROMPT CA 1 (403521) - CẤP 1**

```markdown
## TEST AI GIÁM ĐỊNH BHYT - CA 1 (CẤP 1: ĐƠN GIẢN)

### Hồ Sơ: MA_LK = 403521

**Thông tin hồ sơ:**
- Chẩn đoán chính: Phẫu thuật sản khoa
- Loại KCB: Nội trú
- Ngày vào: 2026-03-15
- Ngày ra: 2026-03-18 (3 ngày)

**Danh sách dịch vụ/thuốc:**
1. Cefazolin / Biofazolin (40.166)
   - SO_LUONG: 2-4 viên
   - GIA_THANH_TOAN: 15.000đ/viên
   - Dự phòng sau phẫu thuật

**NHIỆM VỤ:**
Áp dụng **5 bước giám định** từ Nghị Định 188/2025. Sau mỗi bước, nêu rõ:
- Có lỗi không?
- Nếu có, lỗi gì? (Hành chính/An toàn/Chỉ định/Thanh toán)

**ĐẦU RA MONG MUỐN:**
- Kết luận: THANH TOÁN ĐÚNG hay XUẤT TOÁN?
- Nếu XUẤT TOÁN: Chi tiết từng lỗi + tổng tiền
- Ghi lại 5 bước kiểm tra rõ ràng
```

---

### **PROMPT CA 2 (000589) - CẤP 2**

```markdown
## TEST AI GIÁM ĐỊNH BHYT - CA 2 (CẤP 2: TRUNG BÌNH)

### Hồ Sơ: MA_LK = 000589

**Thông tin hồ sơ:**
- Chẩn đoán chính: [Kéo từ audit JSON]
- Loại KCB: Nội trú
- Thời gian: [Kéo từ audit]

**Danh sách dịch vụ/thuốc:**
[Kéo từ audit JSON]

**NHIỆM VỤ:**
Tuân thủ **5 bước giám định**. Phát hiện **2 lỗi**:
- Lỗi 1: Hành chính (về dữ liệu)
- Lỗi 2: Thanh toán (về danh mục/chẩn đoán)

**ĐẦU RA MONG MUỐN:**
- Danh sách 2 lỗi (loại, mô tả, tiền)
- Kết luận: XUẤT TOÁN (số tiền tổng)
- Giải thích tại sao là 2 loại lỗi khác nhau
```

---

### **PROMPT CA 3 (403244) - CẤP 3**

```markdown
## TEST AI GIÁM ĐỊNH BHYT - CA 3 (CẤP 3: PHỨC TẠP)

### Hồ Sơ: MA_LK = 403244

**Thông tin hồ sơ:**
- Chẩn đoán: Polyp phẫu thuật nội soi cắt polyp
- Loại KCB: Nội trú
- Thời gian: 3 ngày

**Danh sách dịch vụ/thuốc:**
[Kéo từ audit JSON - bao gồm PTTT + DVKT + thuốc]

**NHIỆM VỤ:**
Tuân thủ **5 bước giám định** CHẶT CHẼ. Phát hiện **4 lỗi chồng**:
- Lỗi 1: Hành chính
- Lỗi 2: Phẫu thuật/DVKT
- Lỗi 3: An toàn kê đơn
- Lỗi 4: Thanh toán

**ĐẦU RA MONG MUỐN:**
- Chi tiết 4 lỗi (từng loại 1)
- Mỗi lỗi: Mô tả, loại, tiền, căn cứ pháp lý
- Kết luận: XUẤT TOÁN (tính tổng tiền chi tiết)
- Nêu rõ 5 bước kiểm tra
```

---

## 5. LỊCH TRÌNH CHẠY TEST (CỤ THỂ)

**Tối hôm nay (06/04/2026):**

| Thời gian | Việc làm | Dự kiến |
|-----------|----------|--------|
| 19h00 | Chuẩn bị: Đọc 3 file audit, kéo dữ liệu | 30 phút |
| 19h30 | Viết 3 prompt test (điền dữ liệu vào template) | 20 phút |
| 19h50 | Test CA 1 (403521 - Đơn giản) | 10 phút |
| 20h00 | Chấm điểm CA 1 | 10 phút |
| 20h10 | Test CA 2 (000589 - Trung bình) | 10 phút |
| 20h20 | Chấm điểm CA 2 | 10 phút |
| 20h30 | Test CA 3 (403244 - Phức tạp) | 15 phút |
| 20h45 | Chấm điểm CA 3 | 10 phút |
| 20h55 | Viết báo cáo tóm tắt | 20 phút |
| 21h15 | **Hoàn thành test** | |

**Tổng thời gian:** ~2 giờ

---

## 6. CHECKLIST KỲ TRƯỚC KHI TEST

Trước khi bắt đầu test, hãy xác nhận:

- [ ] AI đã **đọc & hiểu** 3 thẻ tri thức (Luật, Nghị Định, Thanh toán)
- [ ] AI có thể **nêu 5 bước** giám định (Hỏi AI: "Nêu 5 bước theo Nghị Định 188/2025")
- [ ] AI hiểu **4 loại lỗi** (Hỏi AI: "4 loại lỗi là gì?")
- [ ] Các **3 file audit** được lấy & dữ liệu sẵn sàng
- [ ] **3 prompt test** được viết (template + dữ liệu)
- [ ] **Bảng chấm điểm** sẵn sàng (dùng template từ tài liệu trên)

---

## 7. SAI LẦM THƯỜNG GẶP & CÁCH TRỪ

### **Sai lầm 1: AI quên 5 bước**

**Dấu hiệu:** AI chỉ nêu kết luận, không nêu từng bước

**Cách xử:** Yêu cầu AI "Hãy nêu rõ từng bước 1-5 mà em kiểm tra"

**Điểm:** -0.5 điểm (từ 6 → 5.5)

---

### **Sai lầm 2: AI phân loại lỗi sai**

**Dấu hiệu:** AI gọi "Thankh toán" lỗi mà thực ra là "An toàn"

**Cách xử:** Hỏi "Lỗi này là liều quá cao (An toàn) hay không được thanh toán (Thanh toán)?"

**Điểm:** -1 điểm (từ 6 → 5)

---

### **Sai lầm 3: AI không nêu căn cứ pháp lý**

**Dấu hiệu:** AI chỉ nói "không được thanh toán" mà không nêu "Theo TT 15/2015..."

**Cách xử:** Hỏi "Căn cứ pháp lý cho kết luận này là gì?"

**Điểm:** -0.5 điểm

---

### **Sai lầm 4: AI tính tiền sai**

**Dấu hiệu:** Tiền xuất toán không khớp

**Cách xử:** "Tính lại: Giá = [X], Số lượng = [Y], Tiền = ?"

**Điểm:** -1 điểm (nếu tính hoàn toàn sai)

---

## 8. KẾT LUẬN & BẠN CÓ SẴN SÀNG CHƯA?

Tài liệu này cung cấp:
- ✅ **Danh sách 10 ca** (phân loại độ phức tạp)
- ✅ **3 ca chính** được chọn cho hôm nay
- ✅ **Template prompt** sẵn sàng (chỉ cần điền dữ liệu)
- ✅ **Bảng chấm điểm** cụ thể
- ✅ **Lịch trình & checklist** chi tiết

**Anh có sẵn sàng test AI tối nay chưa?**

Nếu có, các bước tiếp theo:
1. Hỏi AI: "Nêu 5 bước giám định?" (xác nhận AI học tốt)
2. Đọc 3 file audit, kéo dữ liệu
3. Viết 3 prompt test (điền vào template)
4. Chạy test (3 ca, ~15 phút/ca)
5. Chấm điểm & viết báo cáo

🎯 **Anh sẵn sàng?**
