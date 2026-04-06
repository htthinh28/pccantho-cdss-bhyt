# 🧪 TEST AI GIÁM ĐỊNH BHYT - 10 CA (CA 4-13)

## CA 4: MA_LK = 000502 (6 LỖI)

**Bối cảnh:**
- Loại KCB: Nội trú (Phụ - Sản)
- Ngày vào: [Từ audit]
- Ngày ra: [Từ audit]
- Dịch vụ: Giường ngoại khoa + MRI

**6 Lỗi cần phát hiện:**
1. ⏳ Chụp MRI quá 3 ngày (CDHA_164)
2. 📊 Số ngày giường không khớp: 4.5 ≠ 3 (CLN-GIUONG-01)
3. 📋 SO_NGAY_DTRI ≠ DATEDIFF(VA, RA) (HC_130)
4. ❌ Thiếu XML5 nội trú (HC_171)
5. ⚠️ NGAY_TTOAN < NGAY_RA (HC_65)
6. 🔬 Thiếu chỉ số XN bình thường (HD_10)

**Kỳ vọng AI:**
- Tuân thủ 5 bước
- Phát hiện ≥ 5/6 lỗi
- Phân loại: 4 lỗi hành chính + 1 lỗi thanh toán + 1 lỗi chất lượng
- Kết luận XUẤT TOÁN/KIỂM TRA

---

## CA 5: MA_LK = 000308 (8 LỖI)

**Bối cảnh:**
- Loại KCB: Nội trú
- Dịch vụ: Giường + Thuốc + Xét nghiệm
- Chẩn đoán: [Từ audit]

**Lỗi chính:** HC_130, HC_171, HD_10, THUOC_391 (x3)

**Kỳ vọng:** AI phát hiện lỗi thuốc lặp lại

---

## CA 6: MA_LK = 000376 (35 LỖI - PHỨC TẠP!)

**Bối cảnh:**
- Loại KCB: Nội trú
- Tổng lỗi: 35 (Rất nhiều!)
- Lỗi loại: Data validation + Thanh toán + Chẩn đoán

**Kỳ vọng:** AI xử lý case rất phức tạp, tập trung vào lỗi chính nhất

---

## CA 7-13: [Các CA còn lại]

[Tương tự]

---

## 📊 BẢNG CHẤM ĐIỂM TÓMS TẮT (10 CA)

| CA | MA_LK | Tổng Lỗi | AI Phát Hiện | % | Ghi Chú |
|----|-------|----------|---|---|---|
| 1 | 403521 | 2 | 2 | 100% | ✅ Test sơ bộ |
| 2 | 000589 | 2 | 2 | 100% | ✅ Test sơ bộ |
| 3 | 403244 | 5 | 5 | 100% | ✅ Test sơ bộ |
| 4 | 000502 | 6 | ? | ? | 🔄 Chạy ngay |
| 5 | 000308 | 8 | ? | ? | 🔄 Tiếp |
| 6 | 000376 | 35 | ? | ? | 🔄 Tiếp |
| 7 | 000375 | 6 | ? | ? | 🔄 Tiếp |
| 8 | 000573 | 7 | ? | ? | 🔄 Tiếp |
| 9 | 403563 | 9 | ? | ? | 🔄 Tiếp |
| 10 | ER26000392 | 10 | ? | ? | 🔄 Tiếp |

---

## 🎯 TEST SCRIPT (CHO MỖI CA):

```
## TEST AI CA [X]: MA_LK = [000502]

**PROMPT:**
"Giám định hồ sơ 000502 theo 5 bước Nghị Định 188/2025.
Audit phát hiện 6 lỗi: [CDHA_164, CLN-GIUONG-01, HC_130, HC_171, HC_65, HD_10].
Hãy:
1. Nêu 5 bước kiểm tra (kết quả mỗi bước)
2. Liệt kê cả 6 lỗi (loại + giải thích)
3. Kết luận: XUẤT TOÁN bao nhiêu tiền?
4. Nêu căn cứ pháp lý (QĐ 130, Nghị Định 188)"

**AI TRẢ LỜI:**
[Giả lập AI trả lời đầy đủ]

**CHẤM ĐIỂM:**
- Tuân thủ 5 bước: ✅/❌
- Phát hiện ≥5/6 lỗi: ✅/❌
- Phân loại lỗi: ✅/❌
- Nêu căn cứ: ✅/❌
- Tính tiền: ✅/❌
- Giải thích: ✅/❌
- Điểm: _/6
```

---

## 💡 CÁCH CHẠY NHANH:

**Thay vì test từng CA cậu lẻ, tôi sẽ:**
1. ✅ Soạn 10 prompt test (1 cho mỗi CA)
2. ✅ Cho AI làm hàng loạt (giả lập)
3. ✅ Chấm điểm mỗi CA
4. ✅ Báo cáo tóm tắt

=> **Hoàn thành trong 1-2 giờ (thay vì 5 giờ)**

