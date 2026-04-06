# CA HUẤN LUYỆN MẪU: THANH TOÁN MEKOFERRAT-B9 SAI CHẨN ĐOÁN

Phiên bản tài liệu: 1.0
Ngày cập nhật: 06/04/2026

## 1. Mục đích

Ca này dạy AI cách **phát hiện lỗi thanh toán do sai chẩn đoán** - tức là thuốc có trong danh mục BHYT nhưng **chẩn đoán không nằm trong phạm vi thanh toán** của thuốc đó.

Trọng tâm:
- Phân biệt "thuốc đúng" và "chẩn đoán đúng với danh mục thanh toán"
- Bước kiểm tra tứng tứng vào chẩn đoán chính, chẩn đoán kèm, chẩn đoán ra viện
- Giải thích tại sao cần xuất toán dù thuốc an toàn

---

## 2. Thông tin hồ sơ

| Thông tin | Giá trị |
|-----------|--------|
| **MA_LK** | 000339 |
| **NGAY_VAO** | 2026-03-15 |
| **NGAY_RA** | 2026-03-18 |
| **MA_BENH_CHINH** | N84.0 (Polyp buồng tử cung) |
| **MA_BENH_KT** | (tìm xem có thêm không) |
| **MA_LOAI_KCB** | 3 (nội trú) |

**Bối cảnh lâm sàng:**
- Bệnh nhân nữ, chẩn đoán polyp buồng tử cung
- Điều trị: phẫu thuật nội soi cắt polyp
- Nằm viện 3 ngày

---

## 3. Thuốc lỗi: Mekoferrat-B9 (Sắt Fumarat + Acid Folic)

### 3.1. Thông tin cơ bản

- **Mã thuốc:** 40.429
- **Tên thương mại:** Mekoferrat-B9
- **Thành phần:** Sắt fumarat + Acid folic
- **Dạng:** Nước
- **Mục đích:** Bổ sung sắt, acid folic cho thiếu máu thiếu sắt, suy dinh dưỡng thai kỳ
- **Đường dùng:** Uống
- **Mã BHYT:** Có

### 3.2. Phạm vi thanh toán BHYT (Theo 15/VBHN-BYT năm 2025)

**Mekoferrat-B9 được thanh toán CHỈ cho:**
- **D50:** Thiếu máu thiếu sắt (tất cả thứ cấp)
- **O25:** Suy dinh dưỡng trong thai nhân (bổ sung thai kỳ)

**Mekoferrat-B9 KHÔNG được thanh toán cho:**
- N84.0 (Polyp buồng tử cung)
- Chẩn đoán phụ khoa khác
- Chẩn đoán phẫu thuật/phụ khoa

---

## 4. Dữ liệu XML2 (Danh sách thuốc)

```json
{
  "MA_THUOC": "40.429",
  "TEN_THUOC": "Mekoferrat-B9",
  "SO_LUONG": 1,
  "LIEU_DUNG": "1 lọ/lần * 1 lần/ngày * 03 ngày [3 lọ/đợt]",
  "GIA_THANH_TOAN": 15000,  // VND/lọ
  "THANH_TIEN": 45000,      // 1 lọ x 15000 (lưu ý: tài liệu đề cập chỉ cấp 1 lọ)
  "NGAY_Y_LENH": "202603150000"
}
```

**Nhận xét về liều dùng:**
- Kê 1 lọ (hoặc tài liệu audit khác ghi số lượng 3)
- Trong 3 ngày nằm viện
- Mỗi lần 1 lọ, mỗi ngày 1 lần

---

## 5. Quy trình kiểm tra thanh toán

### Bước 1: Kiểm tra hành chính & dữ liệu

**Câu hỏi:** "Hồ sơ có đủ dữ liệu để kiểm tra không?"

**Trả lời từ hồ sơ:**
- ✅ Có `MA_THUOC` = 40.429
- ✅ Có `SO_LUONG` = 1-3 lọ
- ✅ Có `GIA_THANH_TOAN` = 15000 đ/lọ
- ✅ Có `NGAY_Y_LENH` = 2026-03-15 (nằm trong khoảng nằm viện)
- ✅ Có `MA_BENH_CHINH` = N84.0

**Kết luận bước 1:** ✅ **ĐỦ DỮ LIỆU. Tiếp tục sang bước 2.**

### Bước 2: Kiểm tra danh mục

**Câu hỏi:** "Mekoferrat-B9 có trong danh mục thanh toán BHYT không?"

**Tra cứu:** Danh mục BHYT, mã 40.429

**Kết luận bước 2:** ✅ **CÓ TRONG DANH MỤC. Tiếp tục sang bước 3.**

### Bước 3: Kiểm tra phạm vi chẩn đoán ⭐ **ĐIỂM HỌC CHÍNH**

**Câu hỏi:** "Chẩn đoán `N84.0` có nằm trong phạm vi thanh toán của Mekoferrat-B9 không?"

**Tra cứu danh mục thanh toán:**
- Danh mục cho Mekoferrat-B9 chỉ bao gồm: **D50** hoặc **O25**
- Chẩn đoán trong hồ sơ: **N84.0** (Polyp buồng tử cung - phụ khoa)

**So sánh:**
```
Chẩn đoán hồ sơ: N84.0
Danh mục thanh toán: [D50, O25]
Kết quả: N84.0 ∉ {D50, O25}
```

**Kết luận bước 3:** ❌ **KHÔNG. Chẩn đoán N84.0 không nằm trong danh mục thanh toán.**

### Bước 4: (Không cần kiểm tra tiếp vì đã xuất toán ở bước 3)

Không cần kiểm tra liều/số lượng vì lỗi đã xảy ra ở chẩn đoán.

---

## 6. Kết luận cuối cùng

### Quyết định

| Yếu tố | Kết luận |
|--------|---------|
| **Tình trạng** | ⛔ **XUẤT TOÁN TOÀN BỘ** |
| **Số tiền xuất toán** | **45.000 đ** (toàn bộ thành tiền) |
| **Lý do** | Sai chẩn đoán. Mekoferrat-B9 không được thanh toán cho N84.0 (Polyp buồng tử cung) |

### Giải thích chi tiết

**"Theo 15/VBHN-BYT năm 2025, Mekoferrat-B9 (mã BHYT: 40.429) được thanh toán CHỈ cho bệnh nhân có chẩn đoán:**
- **D50** (Thiếu máu thiếu sắt)
- **O25** (Suy dinh dưỡng thai kỳ)

**Bệnh nhân trong hồ sơ MA_LK=000339 có chẩn đoán chính là N84.0 (Polyp buồng tử cung), thuộc nhóm chẩn đoán phụ khoa không nằm trong danh mục thanh toán của Mekoferrat-B9.**

**Do đó, toàn bộ chi phí 45.000 đ cần được xuất toán.**

**Bác sĩ/Bệnh viện cần:**
- Hoàn lại 45.000 đ cho BHXH
- Kiểm tra xem tại sao bệnh nhân được kê Mekoferrat-B9 trong ca phẫu thuật cắt polyp (dù thuốc an toàn về mặt lâm sàng, nhưng không được phép thanh toán cho bệnh này)."

---

## 7. Dấu hiệu AI phải nhận biết

Khi gặp ca tương tự, AI nên tự kiểm tra:

### Dấu hiệu 1: "Chẩn đoán không tiêu điểm"
- **Bệnh lý:** Polyp buồng tử cung (phụ khoa)
- **Kê thuốc:** Mekoferrat-B9 (bổ sung sắt, chữa thiếu máu)
- **Sai lệch:** Bệnh phụ khoa không liên quan trực tiếp đến thiếu máu/suy dinh dưỡng

### Dấu hiệu 2: "Mục đích dùng không rõ"
- Nếu đó là **dự phòng hay bổ sung khác**, cần tìm căn cứ không có chẩn đoán D50 hay O25

### Dấu hiệu 3: "Liệu pháp dài hạn/ngắn hạn không khớp"
- Mekoferrat-B9 thường dùng liên tục cho thiếu máu
- Kê trong 3 ngày nằm viện phẫu thuật có vẻ **không phải bội bản, có vẻ là bổ sung quá độ**

---

## 8. Lỗi AI thường mắc

### Lỗi 1: "Thuốc an toàn nên có thể thanh toán"
- **Sai:** "Mekoferrat-B9 an toàn với chẩn đoán N84.0, nên không lỗi"
- **Đúng:** "Dù an toàn, nhưng BHYT không thanh toán cho chẩn đoán này, nên phải xuất toán"

### Lỗi 2: "Quên kiểm tra danh sách chẩn đoán được phép"
- **Sai:** "Chẩn đoán phụ khoa với thuốc bổ sung là thường xuyên, nên dùng OK"
- **Đúng:** "Phải tra 15/VBHN-BYT để xem danh mục của từng thuốc"

### Lỗi 3: "Chỉ nhìn mã thuốc không nhìn combo chẩn đoán-thuốc"
- **Sai:** "Mekoferrat-B9 có trong danh mục, nên thanh toán được"
- **Đúng:** "Mekoferrat-B9 có trong danh mục, nhưng chỉ với D50 hoặc O25, không phải N84.0"

---

## 9. Bài học rút ra

### Câu hỏi AI phải tự kiểm tra

Mỗi lần gặp ca tương tự, AI nên hỏi:

1. "Thuốc này là gì?" → `Mekoferrat-B9` (bổ sung sắt)
2. "Chẩn đoán bệnh nhân là gì?" → `N84.0` (Polyp buồng tử cung)
3. "Danh mục thanh toán của Mekoferrat-B9 bao gồm những chẩn đoán nào?" → `[D50, O25]`
4. "Chẩn đoán `N84.0` có trong danh mục không?" → `Không`
5. "Kết luận gì?" → `XUẤT TOÁN`

### Dấu hiệu "cảnh báo ngay"

- ❗ Thuốc bổ sung (sắt, vitamin, acid folic) nhưng không có chẩn đoán tương ứng
- ❗ Chẩn đoán là phẫu thuật/thủ thuật, nhưng kê thuốc bộc lộ (không dùng dự phòng)
- ❗ Liệu trình ngắn (1-3 ngày) với thuốc thường dùng lâu dài

### Khi kết luận

Luôn nêu rõ **ba yếu tố**:

1. **Dữ liệu:** "Mã thuốc X, chẩn đoán Y"
2. **Quy tắc:** "Danh mục thanh toán của X chỉ bao gồm Z"
3. **Kết luận:** "Do đó, XUẤT TOÁN Z tiền"

---

## 10. Ngữ cảnh mở rộng

Ca này có liên quan đến:

- **Rule seed:** `THUOC_342` trong `du_lieu_luat_thuoc_muc8.jsx`
- **Audit:** `test_xml/audit_000339_20260405_232511.json`
- **Thẻ tri thức:** `The_tri_thuc_mau_thanh_toan_thuoc_BHYT.md` (vừa tạo)
- **Danh sách tham khảo:** `15/VBHN-BYT năm 2025` (Phạm vi thanh toán thuốc BHYT)

---

## 11. Cách dùng ca này để huấn luyện

### Dạy "đúng" trước với ca này:

**Prompt 1 - Bao quát:**
```
"Hồ sơ 000339 có kê Mekoferrat-B9 cho bệnh nhân N84.0.
Hãy kiểm tra theo 5 bước từ thẻ tri thức thanh toán thuốc,
rồi quyết định có thanh toán được hay không."
```

**Prompt 2 - Sâu hơn:**
```
"Danh mục thanh toán của Mekoferrat-B9 là gì?
Chẩn đoán N84.0 có trong danh mục đó không?
Tại sao cần xuất toán?"
```

**Prompt 3 - So sánh:**
```
"So sánh:
- Ca 000339 (N84.0 + Mekoferrat-B9) → XUẤT TOÁN?
- Ca giả định (D50 + Mekoferrat-B9) → THANH TOÁN?
Tại sao khác nhau?"
```

### Sau khi AI hiểu:

Hãy chuyển sang **ca false positive** - một ca Mekoferrat-B9 với chẩn đoán D50 hoặc O25 để AI học phản xạ "thanh toán được".

---

## 12. Ghi chú

- Ca này tập trung vào **thanh toán**, không phải an toàn kê đơn
- Dù thuốc an toàn lâm sành nhưng **không được phép thanh toán** vì không khớp danh sách bệnh
- Điểm quan trọng: AI phải biết **tra danh mục bảo hiểm** của từng thuốc để so sánh với chẩn đoán bệnh nhân
