# HƯỚNG DẪN CHI TIẾT: CHẠY TEST AI GIÁM ĐỊNH BHYT

Phiên bản tài liệu: 1.0
Ngày cập nhật: 06/04/2026

## 1. Mục Đích

Tài liệu này hướng dẫn cách **chạy test AI một cách có hệ thống** để đánh giá mức độ hiểu:
- Của AI về **5 bước giám định** (Nghị Định 188/2025)
- Của AI về **4 loại lỗi** (hành chính, an toàn, chỉ định, thanh toán)
- Của AI về **thanh toán thuốc** (danh mục, chẩn đoán, số lượng)

---

## 2. Chuẩn Bị Trước Test

### **2.1. Tài Liệu Nền Tảng AI Phải Đã Học**

Trước khi test, AI phải đã **đọc & hiểu** 3 thẻ tri thức này:

1. ✅ **Luật BHYT 2008-2024** - Lịch sử pháp lý
2. ✅ **Nghị Định 188/2025** - 5 bước giám định, 4 loại lỗi
3. ✅ **Thanh Toán Thuốc BHYT** - Danh mục, chẩn đoán, số lượng

**Xác nhận AI đã học:** Hỏi AI: "Nêu 5 bước giám định theo Nghị Định 188/2025" → Nếu trả lời đúng = OK

### **2.2. Dữ Liệu Test**

Dữ liệu test **lấy từ folder `test_xml/`**:
- Mỗi file là 1 **audit JSON** từ 1 hồ sơ thật
- Audit JSON chứa: chẩn đoán, thuốc, dịch vụ, danh sách lỗi đã phát hiện
- **Ví dụ:** `audit_000339_20260405_232511.json` = Hồ sơ 000339 được audit hôm 05/04

---

## 3. Chọn 10 CA TEST & PHÂN LOẠI ĐỘ PHỨC TẠP

### **3.1. Danh Sách 10 Ca (Từ test_xml/)**

| STT | MA_LK | File Audit | Tổng Lỗi | Loại Lỗi Chính | Độ Phức Tạp | Ghi Chú |
|-----|-------|-----------|----------|---|---|---|
| 1 | 403521 | audit_403521_*.json | 0 | (Không) | ⭐ Đơn giản | Thanh toán đúng, chuẩn |
| 2 | 000339 | audit_000339_*.json | 1 | Thanh toán (Mekoferrat sai chẩn đoán) | ⭐ Đơn giản | 1 lỗi, dễ nhận |
| 3 | 000589 | audit_000589_*.json | 2 | Hành chính + Thanh toán | ⭐⭐ Trung bình | 2 lỗi khác loại |
| 4 | OP26000908 | audit_OP26000908_*.json | 2 | An toàn + Chỉ định | ⭐⭐ Trung bình | 2 lỗi, liều cao |
| 5 | 403244 | audit_403244_*.json | 4 | Hành chính + An toàn + Chỉ định + Thanh toán | ⭐⭐⭐ Phức tạp | 4 lỗi chồng |
| 6 | 403538 | audit_403538_*.json | 1 | Thanh toán | ⭐ Đơn giản | 1 lỗi thuốc |
| 7 | 000434 | audit_000434_*.json | ? | ? | ? | Cần kiểm tra |
| 8 | 403563 | audit_403563_*.json | ? | ? | ? | Cần kiểm tra |
| 9 | 000308 | audit_000308_*.json | ? | ? | ? | Cần kiểm tra |
| 10 | (Tìm 1 ca nữa) | - | ? | ? | ? | Tìm audit khác |

### **3.2. Chọn 3 Ca Để Test (Đơn → Trung → Phức)**

Dựa trên phân loại trên, chọn:

| Cấp Độ | Ma_LK | Lý Do | Mục Tiêu Test |
|--------|-------|-------|---|
| **Cấp 1: Đơn Giản** | 403521 | Không có lỗi | AI hiểu khi nào **THANH TOÁN ĐÚNG** |
| **Cấp 2: Trung Bình** | 000589 | 2 lỗi (hành chính + thanh toán) | AI phát hiện **2 loại lỗi khác nhau** |
| **Cấp 3: Phức Tạp** | 403244 | 4 lỗi chồng (hành chính + an toàn + chỉ định + thanh toán) | AI phát hiện **4 loại lỗi, tính tiền đúng** |

---

## 4. LẤY DỮ LIỆU CHI TIẾT TỪ AUDIT JSON

### **4.1. Cách Đọc Audit JSON**

Mỗi file audit JSON có cấu trúc:

```json
{
  "meta": {
    "ma_lk": "000339",
    "total_warnings": 14,
    "by_severity": {
      "Critical": 1,
      "Error": 1,
      "Warning": 12
    }
  },
  "warnings": [
    {
      "id": "THUOC_342",
      "truong_loi": "MA_THUOC",
      "canh_bao": "⛔ [XUẤT TOÁN]: Thuốc Prodertonic...",
      "muc_do": "Warning",
      "ma_luat": "THUOC_342",
      "ten_quy_tac": "[Sắt fumarat + Acid Folic] Kiểm tra Chỉ định ICD-10"
    }
  ]
}
```

**Để hiểu ca hồ sơ, cần lấy:**
- `ma_lk` - Mã bệnh nhân
- `total_warnings` - Tổng số lỗi
- `muc_do` (Critical/Error/Warning) - Mức độ nghiêm trọng
- `canh_bao` - Nội dung lỗi
- `ma_luat` - Mã rule gây lỗi

### **4.2. Ví Dụ: Lấy Dữ Liệu CA 000339**

**File:** `test_xml/audit_000339_20260405_232511.json`

**Dữ liệu chính:**
- MA_LK = 000339
- Total_warnings = 14
- **Lỗi chính:**
  - THUOC_342: "Mekoferrat-B9 không được thanh toán cho N84.0"
  - (Các lỗi khác: hành chính, ngày vào/ra, v.v.)

**Để chuẩn bị test, tôi cần:**
1. Lấy XML gốc từ `tai_nguyen/op/PC022601324_000339.xml`
2. Kéo ra: MA_BENH_CHINH = N84.0, tên thuốc = Mekoferrat, mã = 40.429
3. Soạn prompt test dựa trên dữ liệu này

---

## 5. TEMPLATE PROMPT TEST AI

### **5.1. Prompt Chuẩn (Dùng Để Test Mỗi Ca)**

```markdown
## TEST AI GIÁM ĐỊNH BHYT

### Hồ Sơ: MA_LK = [000339]

**Thông tin hồ sơ:**
- Chẩn đoán chính: [N84.0 - Polyp buồng tử cung]
- Loại KCB: [Nội trú, 3 ngày]
- Ngày vào: [2026-03-15]
- Ngày ra: [2026-03-18]

**Danh sách dịch vụ/thuốc:**
1. Biofazolin (40.166) - 2 viên, liều 1g/viên, dự phòng
2. Mekoferrat-B9 (40.429) - 1 lọ, ngày 1 lần, 3 ngày
3. [Dịch vụ khác...]

---

### NHIỆM VỤ:

Áp dụng **5 bước giám định** từ Nghị Định 188/2025:

**Bước 1:** Kiểm tra dữ liệu hành chính
- Hồ sơ có đủ trường bắt buộc không?
- Dữ liệu có hợp lệ không?

**Bước 2:** Kiểm tra chẩn đoán
- Chẩn đoán có rõ ràng không?
- Có mâu thuẫn không?

**Bước 3:** Kiểm tra an toàn kê đơn
- Liều/tần suất có an toàn không?
- Có chống chỉ định không?

**Bước 4:** Kiểm tra thanh toán
- Dịch vụ/thuốc có trong danh mục BHYT không?
- Chẩn đoán phù hợp với danh mục thanh toán không?
- Số lượng có quá không?

**Bước 5:** Kết luận
- Hồ sơ: THANH TOÁN hay XUẤT TOÁN?
- Nếu XUẤT TOÁN: Tổng tiền và chi tiết từng lỗi

---

### ĐẦU RA MONG MUỐN:

**Danh sách lỗi:**
- Lỗi 1: [Loại lỗi] [Mô tả] [Tiền xuất toán]
- Lỗi 2: ...
- Lỗi 3: ...

**Căn cứ pháp lý:**
- Lỗi 1: Theo [Luật/QĐ/TT], ...
- ...

**Kết luận:**
- XUẤT TOÁN TOÀN BỘ / XUẤT TOÁN BỘ / THANH TOÁN ĐÚNG
- Tổng tiền: [số tiền]

---

### GHI CHÚ:
- Nêu rõ từng bước kiểm tra
- Giải thích tại sao là lỗi
- Nêu căn cứ pháp lý cho mỗi lỗi
- Tính tiền xuất toán chi tiết
```

### **5.2. Customize Prompt Cho Từng Ca**

Rồi **tuỳ từng ca**, điền vào:
- `[MA_LK]` → 000339, 000589, 403244
- `[Danh sách dịch vụ/thuốc]` → Kéo từ audit JSON
- `[Chẩn đoán chính]` → Kéo từ XML gốc

---

## 6. BẢNG ĐÁNH GIÁ KẾT QUẢ TEST (CHECKLIST)

### **6.1. Tiêu Chí Đánh Giá Từng Ca**

Sau khi AI trả lời, **chấm điểm** theo bảng này:

```
CA TEST: [000339]
ĐIỂM KIỂM TRA | CÓ | KHÔNG | GHI CHÚ
---|---|---|---
1. Tuân thủ 5 bước? | ☐ | ☐ | AI có nêu rõ từng bước không?
2. Phát hiện được lỗi? | ☐ | ☐ | AI có phát hiện THUOC_342 (Mekoferrat sai chẩn đoán)?
3. Phân loại lỗi đúng? | ☐ | ☐ | AI gọi là "Thanh toán" hay sai loại?
4. Căn cứ pháp lý rõ ràng? | ☐ | ☐ | AI có nêu "Theo TT 15/2015..."?
5. Tính tiền đúng? | ☐ | ☐ | Tiền xuất toán đúng không?
6. Giải thích dễ hiểu? | ☐ | ☐ | Người dùng có thể hiểu không?
ĐIỂM SỐ | _/6 | |
```

### **6.2. Tính Điểm Tổng Hợp**

**Công thức:**
```
Điểm AI = (Số tiêu chí ✅) / 6 * 100 %

- ≥ 90% = Excellent (AI rất tốt)
- 70-89% = Good (AI tốt, cần cải thiện chút ít)
- 50-69% = Fair (AI trung bình, cần học thêm)
- < 50% = Poor (AI yếu, cần cập nhật tài liệu)
```

### **6.3. Ví Dụ Chấm Điểm CA 000339**

| Tiêu Chí | Kỳ Vọng | AI Làm được | Chấm |
|----------|--------|------------|------|
| 5 bước | Nêu rõ từng bước | AI chỉ nêu "lỗi thanh toán" không nêu bước | ❌ |
| Phát hiện lỗi | Phát hiện THUOC_342 | ✅ | ✅ |
| Phân loại | Thanh toán | ✅ | ✅ |
| Căn cứ | TT 15/2015 | AI chỉ nói "không được thanh toán" | ❌ |
| Tính tiền | 45.000đ | ✅ | ✅ |
| Giải thích | Dễ hiểu | ✅ | ✅ |
| **TỔNG** | - | 4/6 = 67% | Fair |

---

## 7. QUY TRÌNH CHẠY TEST TỪNG CA

### **Quy trình tuần tự:**

```
CA TEST 1 (Cấp 1: Đơn giản - 403521)
    ↓
1. Chuẩn bị dữ liệu (lấy audit JSON)
2. Viết prompt test (điền MA_LK, dữ liệu)
3. Cho AI làm (paste prompt)
4. AI trả lời (nên 2-3 phút)
5. Chấm điểm (dùng checklist)
    ↓
CA TEST 2 (Cấp 2: Trung bình - 000589)
    ↓
[Lặp lại 1-5]
    ↓
CA TEST 3 (Cấp 3: Phức tạp - 403244)
    ↓
[Lặp lại 1-5]
    ↓
TỔNG HỢP ĐIỂM
    ↓
QUYẾT ĐỊNH: Cập nhật tài liệu?
```

---

## 8. CÁC TÌNH HUỐNG AI CÓ THỂ GẶP (& CÁC CẦU HỎI TIẾP)

### **Nếu AI quên bước nào?**

**Câu hỏi tiếp:** "Em quên kiểm tra bước [X]. Hãy kiểm tra lại dữ liệu ở bước đó."

**Ví dụ:** "Em quên bước 1 (kiểm tra dữ liệu hành chính). Hãy kiểm tra: Ngày vào có hợp lệ không? Có đủ trường NGAY_RA không?"

### **Nếu AI phân loại lỗi sai?**

**Câu hỏi tiếp:** "Lỗi này thuộc loại nào? Hành chính / An toàn / Chỉ định / Thanh toán?"

**Ví dụ nếu AI nhầm:**
- AI nói: "Mekoferrat liều cao → An toàn"
- Đúng: "Mekoferrat không được thanh toán cho N84.0 → Thanh toán"

### **Nếu AI không nêu căn cứ pháp lý?**

**Câu hỏi tiếp:** "Lỗi này dựa trên căn cứ pháp lý nào? Luật / QĐ / Thông Tư nào?"

**Ví dụ:**
- AI nên nói: "Theo TT 15/2015/TT-BYT, Mekoferrat thanh toán cho D50 hoặc O25, không bao gồm N84.0"
- Không phải chỉ: "Không được thanh toán"

### **Nếu AI tính tiền sai?**

**Câu hỏi tiếp:** "Tính lại tiền xuất toán. Giá thuốc là bao nhiêu? Số lượng bao nhiêu?"

---

## 9. TEMPLATE BÁO CÁO KẾT QUẢ TEST

Sau khi test xong 3 ca, viết báo cáo:

```markdown
# BÁO CÁO KẾT QUẢ TEST AI GIÁM ĐỊNH BHYT

**Ngày test:** [06/04/2026]
**Người test:** [Admin]
**Số ca test:** 3

---

## 1. TÓTA CÁ TEST

| STT | MA_LK | Cấp Độ | Lỗi Kỳ Vọng | Lỗi AI Phát Hiện | Điểm |
|-----|-------|--------|---|---|---|
| 1 | 403521 | Đơn giản | 0 lỗi | 0 lỗi | 6/6 (100%) |
| 2 | 000589 | Trung bình | 2 lỗi | 1 lỗi | 3/6 (50%) |
| 3 | 403244 | Phức tạp | 4 lỗi | 3 lỗi | 4/6 (67%) |

---

## 2. CHI TIẾT TỪNG CA

### **CA 1: 403521 (Đơn Giản)**

**Kỳ vọng:** Không lỗi → THANH TOÁN ĐÚNG

**AI làm:**
- ✅ Tuân thủ 5 bước
- ✅ Kết luận THANH TOÁN ĐÚNG
- ✅ Giải thích rõ

**Điểm:** 6/6 (100%)

**Ghi chú:** AI xử lý tốt trường hợp "không lỗi"

---

### **CA 2: 000589 (Trung Bình)**

**Kỳ vọng:** 2 lỗi → XUẤT TOÁN

**AI làm:**
- ✅ Phát hiện lỗi 1 (...)
- ❌ Bỏ sót lỗi 2 (...)
- ✅ Tính tiền một phần
- ⚠️ Giải thích không rõ bước kiểm tra

**Điểm:** 3/6 (50%)

**Ghi chú:** AI cần học thêm về [Loại lỗi X]

---

### **CA 3: 403244 (Phức Tạp)**

**Kỳ vọng:** 4 lỗi chồng → XUẤT TOÁN TOÀN BỘ

**AI làm:**
- ✅ Phát hiện 3 lỗi (ABCD)
- ❌ Bỏ sót 1 lỗi (D)
- ✓ Tính tiền gần đúng
- ✅ Giải thích rõ hầu hết

**Điểm:** 4/6 (67%)

**Ghi chú:** AI yếu ở việc phát hiện lỗi chồng lấp

---

## 3. KẾT LUẬN TỔNG HỢP

**Điểm trung bình:** (100 + 50 + 67) / 3 = **72%** (Good)

**Mức độ hiểu:**
- ✅ Tốt: Tuân thủ 5 bước, tính tiền, giải thích
- ⚠️ Cần cải: Phát hiện lỗi chồng, phân loại lỗi

**Quyết định:**
- [ ] Cập nhật tài liệu (nêu chi tiết lỗi chồng)
- [x] Tiếp tục test trên 10 ca khác
- [ ] Tạo thẻ tri thức bổ sung

---

## 4. KHUYẾN NGHỊ TIẾP THEO

1. **Tạo thẻ học về lỗi chồng:** AI cần hiểu khi nào có 2+ lỗi cùng lúc
2. **Tạo ca ví dụ lỗi chồng:** Để AI luyện tập
3. **Test ca đơn giản thêm:** Để tăng confidence AI

```

---

## 10. TIMELINE CHẠY TEST

### **Lịch Trình Cụ Thể**

**Hôm Nay (06/04) - Tối:**
- [ ] 19h: Chuẩn bị dữ liệu 3 ca
- [ ] 19h30: Viết 3 prompt test
- [ ] 20h: Chạy CA 1 (403521 - Đơn giản) - 30 phút
- [ ] 20h30: Chạy CA 2 (000589 - Trung bình) - 30 phút
- [ ] 21h: Chạy CA 3 (403244 - Phức tạp) - 30 phút
- [ ] 21h30: Chấm điểm 3 ca
- [ ] 22h: Viết báo cáo tóm tắt

**Kết quả dự kiến:**
- Có kết luận về mức độ hiểu AI
- Biết cần cập nhật thẻ tri thức nào
- Quyết định bước tiếp theo

---

## 11. GHI CHÚ QUAN TRỌNG

### **Trước khi test:**
- ✅ Xác nhận AI đã **học 3 thẻ tri thức** (Luật, Nghị Định, Thanh toán)
- ✅ Xác nhận **prompt test rõ ràng** (không nhập nhằng)
- ✅ Chuẩn bị **bảng chấm điểm** sẵn

### **Khi test:**
- 🎯 Hãy **tinh tế với AI** (nếu AI chưa hiểu, hỏi lại không chỉ trích)
- 🎯 **Ghi lại từng câu trả lời** của AI (để phân tích sau)
- 🎯 **Không bảo AI đáp án** (để đánh giá thực)

### **Sau test:**
- 📊 **Phân tích kết quả** (AI yếu chỗ nào?)
- 📊 **Có cập nhật tài liệu** hay **test thêm ca?**
- 📊 **Lập báo cáo chi tiết** để lưu trữ

---

## 12. FAQ (Câu Hỏi Thường Gặp)

### **Q: Nếu AI bỏ sót 1 lỗi, điểm có phải 0 không?**
**A:** Không. Dùng checklist: AI phát hiện được 5/6 tiêu chí = 83% (Good). Lỗi bỏ sót là 1 trong 6 tiêu chí thôi.

### **Q: Có cần test trên nhiều hơn 3 ca không?**
**A:** Nếu điểm trung bình ≥ 70%, có thể dừng. Nếu < 70%, test thêm 3 ca nữa để xác nhận.

### **Q: AI sai loại lỗi nhưng tính tiền đúng, tính sao?**
**A:** Mức độ: 4/6 (67%). Vì "phân loại lỗi đúng" là 1 tiêu chí riêng.

### **Q: Nếu AI hiểu tốt (≥ 80%), có cần cập nhật tài liệu không?**
**A:** Không. Chỉ cần test thêm 10 ca khác để xác nhận stability.

---

## Kết Luận

Tài liệu này cung cấp **quy trình systemic** để test AI:
- **Không chủ quan** (dùng checklist, điểm số)
- **Có thể lặp lại** (template prompt, bảng đánh giá)
- **Có hết cứ liệu** (ghi lại từng test)
- **Dễ phân tích** (báo cáo chi tiết)

**Anh sẵn sàng chạy test tối chưa?** 🎯
