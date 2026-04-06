# HƯỚNG DẪN: CHẠY THỬ AI TRÊN CA HỒ SƠ THẬT & ĐÁNH GIÁ

Phiên bản: 1.0
Ngày cập nhật: 06/04/2026

## 1. Mục đích

Tài liệu này hướng dẫn cách:
- Chuẩn bị 5-10 ca hồ sơ thật từ `test_xml/`
- Chạy AI phân tích từng ca
- Đánh giá kết quả AI (mức độ hiểu, độ chính xác)
- Thu thập feedback để cải thiện tài liệu huấn luyện

---

## 2. Danh sách 10 ca hồ sơ thật - Sẵn sàng test

| Ma_LK | Tên File Audit | Lỗi Chính | Độ Phức Tạp | Ưu Tiên |
|-------|----------------|----------|-----------|--------|
| **000339** | audit_000339_20260405_232511.json | Thanh toán, hành chính | Cao | 🔴 P1 |
| **000589** | audit_000589_... | Liều quá cao, an toàn | Trung | 🟡 P2 |
| **000308** | audit_000308_... | Hành chính (thời gian) | Trung | 🟡 P2 |
| **403244** | audit_403244_... | Nhiều lỗi chồng | Cao | 🔴 P1 |
| **403521** | audit_403521_... | Kháng sinh đúng | Thấp | 🟢 P3 |
| **OP26000908** | audit_OP26000908_... | Lỗi an toàn | Trung | 🟡 P2 |
| **403538** | audit_403538_... | Dịch vụ kỹ thuật | Cao | 🔴 P1 |

**Bắt đầu từ:** Lấy toàn bộ file audit trong `test_xml/`, chọn 5 ca phức tạp nhất

---

## 3. Lấy dữ liệu ca hồ sơ

### 3.1. Cách đọc file audit JSON

**File audit có cấu trúc:**
```json
{
  "meta": {
    "ma_lk": "000339",
    "total_warnings": 14,
    "by_severity": {"Critical": 1, "Error": 1, "Warning": 12}
  },
  "unique_rule_codes": ["THUOC_342", "GB_47", "HC_171", ...],
  "rule_summary": {...},
  "warnings": [
    {
      "phan_he": "XML1",
      "truong_loi": "T_THUOC",
      "canh_bao": "...",
      "muc_do": "Error",
      "ma_luat": "CLN-CHI-01"
    },
    ...
  ]
}
```

**Cách lấy thông tin:**
1. Đọc `ma_lk` để ghi nhớ hồ sơ
2. Đọc `total_warnings` để biết số lỗi tổng
3. Đọc `warnings[]` để xem **từng lỗi chi tiết**

### 3.2. Chuẩn bị prompt cho AI

**Template prompt chạy AI:**

```
Hộp sơ 000339:

DỮ LIỆU TÓM TẮT:
- Ma LK: 000339
- NGAY_VAO: 2026-03-15
- NGAY_RA: 2026-03-18
- Chẩn đoán: N84.0 (Polyp buồng tử cung)
- Nằm viện: 3 ngày

CÁC LỖI PHÁT HIỆN:
1. CLN-CHI-01: T_THUOC XML1 (36.768đ) ≠ XML2 (34.336đ), chênh 2.432đ
2. THUOC_342: Mekoferrat cho chẩn đoán N84.0 (không phải D50/O25)
3. HC_171: Hồ sơ nội trú nhưng thiếu XML5

YÊU CẦU AI:
1. Xác định loại từng lỗi (hành chính, an toàn, chỉ định, thanh toán)
2. Nêu căn cứ pháp lý cho mỗi lỗi (Luật/QĐ nào?)
3. Quyết định xử lý (từ chối tạm, xuất toán bộ, xuất toán toàn)
4. Viết quyết định giám định chi tiết theo mẫu Nghị định 188/2025
```

---

## 4. Prompt thử AI cho từng ca

### PROMPT 1: Ca đơn giản (Chỉ có 1-2 lỗi)

**Chọn ca:** 403521 (Cefazolin phòng phát sản khoa)

```
Hồ sơ 403521:
- Chẩn đoạn: Phẫu thuật sản khoa
- Thuốc kê: Cefazolin 4 viên (1g x 1 lần phòng)
- Ngày nằm: 1 ngày

Lỗi phát hiện:
✓ Không có lỗi hành chính
✓ Không có lỗi an toàn (liều đúng)
✓ Không có lỗi chỉ định (chẩn đoán đúng)

YÊU CẦU:
1. AI có thể xác định **đây là ca ĐÚNG** (không có lỗi)?
2. AI sẽ kết luận gì?

TIÊU CHÍ ĐÁNH GIÁ:
- ✅ Xác nhận không có lỗi
- ✅ Biết căn cứ tại sao không lỗi (liều đúng, chẩn đoán đúng, hành chính đầy đủ)
- ✅ Kết luận: THANH TOÁN
```

### PROMPT 2: Ca trung bình (2-3 lỗi khác loại)

**Chọn ca:** 000589 (Lỗi hành chính chênh lệch tiền + lỗi an toàn liều cao)

```
Hồ sơ 000589:
- Chẩn đoán: A09 (Tiêu chảy)
- Thời gian: 3 ngày ngoại trú

LỖI CÓ:
1. [Hành chính] T_THUOC XML1 = 12.86M, XML2 = 4.93M (chênh 61%)
2. [An toàn] Levofloxacin 1000mg/ngày (tối đa 500mg/ngày)

YÊU CẦU:
1. Phân loại 2 lỗi trên
2. Nêu căn cứ pháp lý
3. Quyết định xử lý cho từng lỗi
4. Nếu là từ chối tạm thời: viết yêu cầu bệnh viện trong 15 ngày

TIÊU CHÍ ĐÁNH GIÁ:
- ✅ Phân biệt lỗi hành chính vs an toàn
- ✅ Biết xử lý từ chối tạm thời vs xuất toán
- ✅ Nêu rõ luật lệ
```

### PROMPT 3: Ca phức tạp (3-4 lỗi chồng chéo)

**Chọn ca:** 403244 (Lỗi hành chính + an toàn + chỉ định)

```
Hồ sơ 403244:
- Chẩn đoạn: C61 (Ung thư tuyến tiền liệt)
- Phẫu thuật: TURP

LỖI CÓ:
1. [Hành chính] Chênh lệch tiền 23.34M (51%)
2. [An toàn] Ceftriaxone 8g/ngày (tối đa 4g)
3. [Chỉ định] Aciclovir cho C61 (chỉ cho B00/B02)
4. [Chỉ định] Mekoferrat cho C61 (chỉ cho D50/O25)

YÊU CẦU:
1. Xác định từng lỗi
2. Nêu mức độ lỗi (nặng/trung/nhẹ)
3. Quyết định xử lý từng cái
4. Tính tổng tiền xuất toán
5. Viết quyết định giám định theo mẫu Nghị định 188

TIÊU CHÍ ĐÁNH GIÁ:
- ✅ Xác định chính xác 4 lỗi
- ✅ Phân biệt mức độ
- ✅ Tính toán tiền xuất toán chính xác
- ✅ Viết quyết định rõ ràng, có xuyên chứng pháp lý
```

---

## 5. Chuẩn bị và chạy thử

### BƯỚC 1: Chọn ca test

**Chọn lộ trình test:**

```
NGÀY 1: Test ca đơn giản
├─ Ca 403521 (không lỗi)
└─ Mục tiêu: AI xác nhận "THANH TOÁN"

NGÀY 2: Test ca trung bình
├─ Ca 000589 (2 lỗi)
└─ Mục tiêu: AI phân loại + xử lý 2 lỗi

NGÀY 3: Test ca phức tạp
├─ Ca 403244 (4 lỗi)
└─ Mục tiêu: AI làm việc với 4 lỗi, tính tiền, viết quyết định
```

### BƯỚC 2: Chuẩn bị dữ liệu cho AI

**Những gì AI cần:**
1. **Dữ liệu hồ sơ tóm tắt** (MA_LK, chẩn đoán, thời gian, loại KCB)
2. **Danh sách lỗi từ audit JSON** (ma_luat, mô tả, mức độ)
3. **Chi tiết dữ liệu XML nếu cần** (mã thuốc, liều, giá)

**Những gì AI KHÔNG cần:**
- ❌ Toàn bộ file XML (quá dài)
- ❌ Hình ảnh hoặc document scan (khó xử lý)
- ❌ Các lỗi không liên quan (VD: quy trình ghim)

### BƯỚC 3: Ghi lại câu hỏi rõ ràng

**Ví dụ câu hỏi TỐT:**
```
"Hồ sơ 403244 có các lỗi sau [liệt kê].
Hãy:
1. Xác định loại từng lỗi
2. Nêu luật cơ sở
3. Quyết định xử lý
4. Tính tiền xuất toán
5. Viết quyết định"
```

**Ví dụ câu hỏi XẤU:**
```
"Phân tích hồ sơ 403244"  ← Quá mở, AI không biết làm gì
```

### BƯỚC 4: Chạy AI

**Công cụ:**
- Prompt AI một cách rõ ràng (sử dụng template trên)
- Để ý AI hiểu đúng không
- Ghi lại các câu hỏi mà AI hỏi lại (dấu hiệu chưa rõ)

---

## 6. Đánh giá kết quả AI

### Tiêu chí đánh giá

#### 🔴 DỪNG - AI chưa hiểu

**Dấu hiệu:**
- AI nói "không đủ dữ liệu để kết luận"
- AI không biết phân loại lỗi
- AI không nêu được luật lệ
- AI kết luận sai (VD: XUẤT TOÁN cho lỗi không biến chứng)

**Xử lý:**
- Quay lại tài liệu huấn luyện
- Cập nhật thêm ví dụ chi tiết
- Test lại sau khi cập nhật

#### 🟡 CẢNH BÁO - AI hiểu nhưng chưa chuyên

**Dấu hiệu:**
- AI xác định lỗi đúng, nhưng:
  - Không ghi rõ luật lệ
  - Xử lý chưa chi tiết (chỉ nêu xuất toán, không ghi tiền)
  - Quyết định thiếu xuyên chứng

**Xử lý:**
- Bổ sung thêm prompt ví dụ
- Test lại ca tương tự

#### 🟢 TỐT - AI nắm vững

**Dấu hiệu:**
- ✅ Xác định loại lỗi chính xác
- ✅ Nêu luật/QĐ từng lỗi
- ✅ Quyết định xử lý hợp lý (từ chối tạm vs xuất toán)
- ✅ Tính tiền xuất toán chính xác
- ✅ Viết quyết định rõ ràng, có cấu trúc

**Xử lý:**
- Tăng độ khó (test ca phức tạp hơn)

---

## 7. Biểu mẫu đánh giá AI

### Template đánh giá từng ca

```
CA TEST: 000589
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DỮ LIỆU ĐẦU VÀO:
- Ma LK: 000589
- Lỗi: [Hành chính chênh lệch + An toàn liều cao]

KỲ VỌNG AI:
- Phân loại 2 lỗi ✓ / ✗
- Nêu luật ✓ / ✗
- Xử lý hợp lý ✓ / ✗

KẾT QUẢ THỰC TẾ:
AI: "Hồ sơ có chênh lệch 61% [OK]
     Levofloxacin 1000mg vượt quá [OK]
     → XUẤT TOÁN toàn bộ [LỖI: phải từ chối tạm cho hành chính trước]"

ĐÁNH GIÁ: 🟡 CẢNH BÁO
- Hiểu lỗi đúng
- Nhưng xử lý chưa phân biệt hành chính vs chuyên môn

HÀNH ĐỘNG:
- [ ] Cập nhật tài liệu huấn luyện
- [ ] Test lại ca 000589
- [ ] Chuyển ca 403244 (phức tạp hơn)
```

---

## 8. Bộ công cụ đánh giá nhanh

### Checklist cho từng ca

**Ca đơn giản (1-2 lỗi):**
```
□ AI xác định loại lỗi chính xác?
□ AI nêu được 1 luật/QĐ?
□ AI kết luận xử lý (thanh toán vs xuất toán)?
□ (Nếu xuất toán) AI ghi rõ tiền?

Điểm: 1.0 nếu tất cả ✓, 0.5 nếu ≥3, 0 nếu ≤2
```

**Ca trung bình (2-3 lỗi khác loại):**
```
□ AI phân loại 2 lỗi (hành chính, chuyên môn)?
□ AI ghi rõ mức độ từng lỗi (nặng/trung/nhẹ)?
□ AI nêu luật/QĐ cho từng lỗi?
□ AI xử lý khác nhau cho từng lỗi?

Điểm: 1.0 nếu tất cả ✓, 0.5 nếu ≥3, 0 nếu ≤2
```

**Ca phức tạp (3-4 lỗi chồng):**
```
□ AI xác định 3-4 lỗi chính xác?
□ AI phân biệt mức độ từng lỗi?
□ AI xử lý tương ứng (từ chối tạm vs xuất toán bộ vs toàn)?
□ AI tính toán tiền xuất toán chính xác?
□ AI viết quyết định theo mẫu (Luật+Phân tích+Kết luận)?

Điểm: 1.0 nếu tất cả ✓, 0.5 nếu ≥4, 0.25 nếu ≥3, 0 nếu ≤2
```

---

## 9. Chu kỳ cải thiện

### Vòng lặp feedback

```
Ca Test 1 (Đơn giản)
       ↓
   [ĐÁNH GIÁ]
       ↓
  [TỐT? → Ca 2]
  [XẤU? → Cập nhật tài liệu → Test lại]
       ↓
Ca Test 2 (Trung bình)
       ↓
   [ĐÁNH GIÁ]
       ↓
  [TỐT? → Ca 3]
  [XẤU? → Cập nhật → Test lại]
       ↓
Ca Test 3 (Phức tạp)
       ↓
   [ĐÁNH GIÁ]
       ↓
[HOÀN THÀNH / CẬP NHẬT LỘ TRÌNH]
```

---

## 10. Danh sách cập nhật tài liệu (nếu AI yếu)

| Hiện tượng AI yếu | Nguyên nhân | Cập nhật |
|-----------------|-----------|---------|
| Không phân loại được lỗi | Thiếu ví dụ phân loại | Thêm mục "4 loại lỗi" vào thẻ hành chính |
| Không biết luật | Chưa học thẻ pháp lý | Nhắc AI học thẻ "Luật BHYT" trước |
| Xử lý sai | Chưa hiểu Nghị định 188 | Thêm ví dụ Nghị định 188 vào ca huấn luyện |
| Tính tiền sai | Công thức phức tạp | Tạo ca đơn giản về tính tiền |
| Viết quyết định yếu | Chưa có mẫu | Cung cấp mẫu quyết định chi tiết |

---

## 11. Trang báo cáo cuối kỳ

### Template báo cáo sau chạy thử

```
BÁOCÁO CHẠY THỬ AI GIÁM ĐỊNH BHYT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

THỜI GIAN: [Ngày]
TỔNG CA TEST: [X ca]
KỲ VỌNG ĐIỂM: [Y↑ được]

KẾT QUẢ:
┌─────────────────────┬──────┬────────────────┐
│ Ca Test             │ Điểm │ Mức độ         │
├─────────────────────┼──────┼────────────────┤
│ 403521 (Đơn giản)   │ 1.0  │ 🟢 TỐT         │
│ 000589 (Trung bình) │ 0.5  │ 🟡 CẢNH BÁO    │
│ 403244 (Phức tạp)   │ 0.25 │ 🔴 DỪNG        │
└─────────────────────┴──────┴────────────────┘

ĐIỂM TRUNG BÌNH: 0.58 / 1.0 = 58%

NHẬN XÉT CHUNG:
AI tốt ở ca đơn (không lỗi), nhưng chưa xử lý tốt khi có lỗi chồng.

ĐIỂM YẾU:
1. Không phân biệt từ chối tạm vs xuất toán
2. Lỗi kế toán lớn không biết từ chối tạm thời
3. Quyết định chưa chi tiết

HÀNH ĐỘNG TIẾP THEO:
[ ] Cập nhật thẻ hành chính + Nghị định 188
[ ] Tạo thêm ca ví dụ về từ chối tạm thời
[ ] Test lại sau 3 ngày

HẹN LỊCH LẠI:
- 08/04: Cập nhật tài liệu
- 09/04: Test lại
- 10/04: Báo cáo cuối cùng
```

---

## 12. Ghi chú cuối

- **Đừng chi trả AI quá nhiều ca một lúc** - test từng ca, đánh giá, cập nhật
- **Lưu lại transcript từng ca** - có thể quay lại xem AI học gì
- **Nếu AI sai, xem đó là feedback cho tài liệu, không phải AI** - tài liệu cần được cải thiện
- **Sau 5-10 ca test, AI sẽ có độ chính xác ~90%** - nếu tài liệu tốt
