# THẺ TRI THỨC: NGHỊ ĐỊNH 188/2025 - QUY TRÌNH GIÁM ĐỊNH & PHÂN LOẠI LỖI BHYT

Phiên bản tài liệu: 1.0
Ngày cập nhật: 06/04/2026

## 1. Mục Đích

**Nghị Định 188/2025/NĐ-CP** là **quy trình giám định mới nhất (2025)** của Việt Nam về Bảo Hiểm Y Tế. Thẻ này dạy AI:

- **5 Bước Kiểm Tra Giám Định** (quy trình tuần tự)
- **4 Loại Lỗi** (hành chính, an toàn, chỉ định, thanh toán)
- **Mức Xử Phạt** (kiểm tra, cảnh báo, xuất toán bộ, xuất toán toàn bộ)
- **Cách Phân Loại** lỗi của một ca bệnh
- **Cách Kết Luận** cuối cùng (xuất toán hay thanh toán)

---

## 2. Cấu Trúc Chung Nghị Định 188/2025

| Yếu Tố | Chi Tiết |
|--------|---------|
| **Tiêu đề đầy đủ** | Quy định về thanh toán chi phí KCB BHYT, thủ tục thanh toán, xử lý vi phạm hành chính |
| **Ngày duyệt** | 2025 |
| **Má hiệu** | NĐ-CP (Nghị Định của Chính Phủ) |
| **Phạm vi** | Toàn bộ BHYT Việt Nam |
| **Đối tượng áp dụng** | BV, BHXH, bệnh nhân, giám định viên |
| **Thay thế** | Luật 75/2014, Luật 07/2023 (phần giám định) |

---

## 3. 5 BƯỚC QUY TRÌNH GIÁM ĐỊNH (Trọng Tâm Nhất)

### **Bước 1: Kiểm Tra Dữ Liệu & Hành Chính**

**Câu hỏi:** "Hồ sơ có đủ dữ liệu hợp lệ để giám định không?"

**Kiểm tra:**
- ✅ Có tất cả các trường bắt buộc? (Ngày vào, ngày ra, chẩn đoán, thuốc, dịch vụ)
- ✅ Trường dữ liệu có **hợp lệ về mặt hình thức**? (Ngày hợp lệ lịch sự, không null)
- ✅ Thời gian logic **hợp lệ**? (Ngày ra ≥ ngày vào)
- ✅ **Số tiền logic**? (Không âm, không quá cao so với bình thường)

**Nếu lỗi:**
- **Loại lỗi:** HÀNH CHÍNH (Dữ liệu sai/thiếu)
- **Mức độ:** KIỂM TRA hoặc CẢnh báo
- **Kết luận:** "Thiếu/sai dữ liệu [trường nào], không thể kết luận. Yêu cầu BV cung cấp/sữa chữa."

**Nếu OK:**
- → Sang Bước 2

---

### **Bước 2: Kiểm Tra Điều Chỉ & Chẩn Đoán**

**Câu hỏi:** "Chẩn đoán có **phù hợp với bối cảnh lâm sàng** và không mâu thuẫn không?"

**Kiểm tra:**
- ✅ Chẩn đoán chính (**MA_BENH_CHINH**) có hợp lý không?
- ✅ Chẩn đoán chính + Chẩn đoán kèm (**MA_BENH_KT**) có **mâu thuẫn** không?
  - Ví dụ: "Chẩn đoán chính = Pneumonia" nhưng "Chẩn đoán kèm = Ung thư phổi giai đoạn 4" → Có thể đúng, nhưng cần xác minh
- ✅ Chẩn đoán ra viện (**CHAN_DOAN_RV**) có **nhất quán** với chẩn đoán chính?
  - Ví dụ: "Chẩn đoán chính = Headache" nhưng "Ra viện = Meningitis" → Không nhất quán

**Nếu lỗi:**
- **Loại lỗi:** CHỈ ĐỊNH (Chẩn đoán không rõ/mâu thuẫn)
- **Mức độ:** KIỂM TRA hoặc CẢnh báo
- **Kết luận:** "Chẩn đoán không rõ/ mâu thuẫn. Yêu cầu xác minh với bệnh án."

**Nếu OK:**
- → Sang Bước 3

---

### **Bước 3: Kiểm Tra Năng Suất Dịch Vụ & An Toàn**

**Câu hỏi:** "Các dịch vụ (thuốc, kiểm tra, phẫu thuật) có **An toàn lâm sàng** không?"

**Kiểm tra từng loại dịch vụ:**

#### **3.1. Thuốc (XML2)**
- Liều có **quá tối đa** không?
  - Ví dụ: Aciclovir > 4000mg/ngày → Quá liều
- Tần suất có **bất thường** không?
  - Ví dụ: Paracetamol > 4g/ngày → Quá tần suất
- Có **chống chỉ định lâm sàng** không?
  - Ví dụ: Kháng sinh cho bệnh nhân suy gan nặng → Chống chỉ định
- **Tương tác thuốc** có không?
  - Ví dụ: Dùng 2 kháng sinh đồng thời mà có tương tác → Lỗi

**→ Loại lỗi:** AN TOÀN KÊ ĐƠN

#### **3.2. Dịch Vụ Kỹ Thuật (XML3/4)**
- Chỉ định **hợp lý** không?
  - Ví dụ: Siêu âm tim cho bệnh nhân chóng mặt (không có bệnh tim) → Chỉ định không hợp lý
- Số lượng **không lặp lại** không?
  - Ví dụ: Làm CT não 5 lần trong 1 ngày → Lặp lại không cần thiết
- Kết quả **logic** không?
  - Ví dụ: "Xét nghiệm thận bình thường" nhưng "Chẩn đoán suy thận nặng" → Mâu thuẫn

**→ Loại lỗi:** CHỈ ĐỊNH (chỉ định dịch vụ không hợp lý)

#### **3.3. Phẫu Thuật / Thủ Thuật (XML3)**
- Có **yêu cầu tiền/sau phẫu thuật** không?
  - Ví dụ: Phẫu thuật cắt polyp nhưng không có giải phẫu bệnh sau → Thiếu
- Thuốc dự phòng **có không**?
  - Ví dụ: Phẫu thuật lớn nhưng không dùng kháng sinh dự phòng → Thiếu
- **Thời gian hồi phục** có hợp lý không?
  - Ví dụ: Phẫu thuật lớn nhưng chỉ nằm 2 giờ → Không hợp lý

**→ Loại lỗi:** AN TOÀN / CHỈ ĐỊNH (phẫu thuật không hợp quy chuẩn)

**Nếu lỗi:**
- **Mức độ:** CẢnh báo hoặc XUẤT TOÁN (tùy mức độ)
- **Kết luận:** "Dịch vụ [X] không an toàn lâm sàng. Lý do: [chi tiết]. Cần xuất toán hoặc cảnh báo."

**Nếu OK:**
- → Sang Bước 4

---

### **Bước 4: Kiểm Tra Thanh Toán & Danh Mục**

**Câu hỏi:** "Các dịch vụ có **nằm trong phạm vi thanh toán BHYT** không?"

**Kiểm tra từng loại:**

#### **4.1. Thuốc (XML2)**
- Mã thuốc có **trong danh mục BHYT** không?
  - Ví dụ: Thuốc Vitamin PP → Không có trong danh mục BHYT
- **Chẩn đoán có phù hợp** với danh mục thanh toán của thuốc?
  - Ví dụ: Mekoferrat (bổ sung sắt) chỉ thanh toán cho D50 hoặc O25, nhưng bệnh nhân là N84.0 → Sai
- **Số lượng có vượt** hướng dẫn thanh toán?
  - Ví dụ: Hướng dẫn 5 viên, nhưng cấp 10 viên → Quá

**→ Loại lỗi:** THANH TOÁN (thuốc không danh mục, sai chẩn đoán, quá số lượng)

#### **4.2. Dịch Vụ Kỹ Thuật (XML3/4)**
- Có **trong danh mục BHYT** không?
  - Ví dụ: Xét nghiệm gen hiếm → Không có trong danh mục
- **Chẩn đoán hợp lý** để yêu cầu không?
  - Ví dụ: Siêu âm tim cho bệnh nhân viêm họng → Không hợp lý
- **Số lần lặp lại** có quá không?
  - Ví dụ: Hướng dẫn 1 lần, nhưng làm 3 lần → Quá

**→ Loại lỗi:** THANH TOÁN (dịch vụ không danh mục, quá số lần)

#### **4.3. Phẫu Thuật (XML3)**
- Mã PTTT có **trong danh mục BHYT** không?
- **Bệnh cảnh phù hợp** không?
  - Ví dụ: PTTT cắt polyp cho bệnh nhân mũi → Không phù hợp
- **Yêu cầu phẫu thuật sơ bộ/sau** có thỏa mãn?
  - Ví dụ: Phẫu thuật lớn nhưng không có kiểm tra cơ bản trước → Không thỏa mãn

**→ Loại lỗi:** THANH TOÁN (phẫu thuật không danh mục) hoặc HÀNH CHÍNH (yêu cầu không thỏa mãn)

**Nếu lỗi:**
- **Mức độ:** XUẤT TOÁN (bộ phận hoặc toàn bộ)
- **Kết luận:** "Dịch vụ [X] không được BHYT thanh toán vì [lý do]. Xuất toán [số tiền]."

**Nếu OK:**
- → Sang Bước 5

---

### **Bước 5: Kết Luận Cuối Cùng**

**Nếu qua tất cả 4 bước:**
- ✅ **THANH TOÁN ĐÚNG**
- Kết luận: "Hồ sơ hợp lệ toàn diện. Thanh toán [số tiền] cho BHXH."

**Nếu có lỗi ở bất cứ bước nào:**
- ❌ **XUẤT TOÁN** (bộ phận hoặc toàn bộ)
- Kết luận: "Hồ sơ có lỗi sau:
  - Lỗi 1: [Mô tả]
  - Lỗi 2: [Mô tả]
  - Xuất toán tổng cộng: [số tiền]"

---

## 4. 4 LOẠI LỖI (Phân Loại Chính)

### **Loại 1: Lỗi HÀNH CHÍNH (1 điểm - khô)**

**Định nghĩa:** Dữ liệu sai/thiếu, không tuân thủ quy định về cấu trúc, định dạng, thời gian

**Ví dụ:**
- Thiếu trường bắt buộc (NGAY_RA)
- Ngày vào/ra không hợp lệ về mặt lịch pháp
- Thời gian nằm viện < 4 giờ
- Số tiền không khớp
- Trường dữ liệu vượt độ dài cho phép

**Căn cứ pháp lý:**
- Quyết Định 130/QĐ-BYT (Cấu trúc XML)
- Nghị Định 188/2025 (Yêu cầu dữ liệu bắt buộc)

**Mức độ:**
- ⚠️ KIỂM TRA (yêu cầu BV cung cấp lại)
- ⛔ CẢNH BÁO (dữ liệu thiếu nhưng không quá nghiêm trọng)
- ⛔ XUẤT TOÁN (dữ liệu sai ảnh hưởng đến chi phí)

---

### **Loại 2: Lỗi AN TOÀN KÊ ĐƠN (2 điểm - kỹ thuật)**

**Định nghĩa:** Dịch vụ không an toàn lâm sàng (liều quá tối đa, chống chỉ định, tương tác thuốc, chỉ định không hợp lý)

**Ví dụ:**
- Liều Aciclovir > 4000mg/ngày (quá tối đa)
- Dùng kháng sinh cho bệnh nhân suy thận nặng (chống chỉ định)
- Dùng 2 thuốc có tương tác (anticoagulant + NSAID)
- Paracetamol > 4g/ngày (quá tần suất)
- Phẫu thuật không có kháng sinh dự phòng (thiếu)

**Căn cứ pháp lý:**
- QĐ 5631/QĐ-BYT (Kháng sinh)
- TT 15/2015/TT-BYT (Danh mục, điều kiện sử dụng)
- Nghị Định 188/2025 (Kiểm tra an toàn)

**Mức độ:**
- ⚠️ KIỂM TRA (yêu cầu BV giải thích)
- ⚠️ CẢNH BÁO (lỗi nhẹ, không gây hại lớn)
- ⛔ XUẤT TOÁN (lỗi nặng, có nguy hiểm)

---

### **Loại 3: Lỗi CHỈ ĐỊNH (3 điểm - giám định)**

**Định nghĩa:** Chẩn đoán không rõ/mâu thuẫn, chỉ định dịch vụ không hợp lý, không do bệnh

**Ví dụ:**
- Kê Mekoferrat (bổ sung sắt) cho bệnh nhân N84.0 (polyp) không có thiếu máu
- Chẩn đoán chính = headache, ra viện = meningitis (mâu thuẫn)
- Siêu âm tim cho bệnh nhân viêm họng (chỉ định không hợp lý)
- Làm CT não 5 lần trong 1 ngày (không do bệnh, là lặp lại)
- Kháng sinh cho bệnh nhân không có bằng chứng nhiễm khuẩn

**Căn cứ pháp lý:**
- Luật 75/2014 (Chỉ định hợp lý)
- TT 15/2015/TT-BYT (Danh mục, điều kiện thanh toán)
- Nghị Định 188/2025 (Kiểm tra chẩn đoán, chỉ định)

**Mức độ:**
- ⚠️ KIỂM TRA (chẩn đoán không rõ, cần xác minh)
- ⚠️ CẢNH BÁO (chỉ định không hợp lý nhưng không quá sai)
- ⛔ XUẤT TOÁN (sai chẩn đoán, chỉ định hoàn toàn không hợp lý)

---

### **Loại 4: Lỗi THANH TOÁN (4 điểm - danh mục)**

**Định nghĩa:** Dịch vụ không trong danh mục BHYT, số lượng vượt quá, giá không đúng, không phù hợp điều kiện thanh toán

**Ví dụ:**
- Thuốc Vitamin PP (không có trong danh mục BHYT)
- Mekoferrat thanh toán cho N84.0 (không phù hợp điều kiện thanh toán)
- Cấp 10 viên Aciclovir nhưng hướng dẫn chỉ 5 viên (quá số lượng)
- Siêu âm tim (không có trong danh mục BHYT)
- PTTT nâng ngực (PTTT thẩm mỹ, không thanh toán BHYT)

**Căn cứ pháp lý:**
- TT 15/2015/TT-BYT (Danh mục thuốc, dịch vụ, PTTT)
- TT 37/2024/TT-BYT (Danh mục thuốc 2024, bản cập nhật)
- Nghị Định 188/2025 (Điều kiện thanh toán)

**Mức độ:**
- ⛔ XUẤT TOÁN BỘ (chỉ xuất toán phần không hợp lệ)
- ⛔ XUẤT TOÁN TOÀN BỘ (xuất toán hết tất cả dịch vụ liên quan)

---

## 5. So Sánh 4 Loại LỖI

| Khía Cạnh | Hành Chính | An Toàn | Chỉ Định | Thanh Toán |
|-----------|-----------|--------|---------|-----------|
| **Bước kiểm tra** | Bước 1 | Bước 3 | Bước 2 & 3 | Bước 4 |
| **Tập trung vào** | Dữ liệu | Liều/cách dùng | Chẩn đoán/hợp lý | Danh mục |
| **Nguy hiểm** | Không nghiêm | Có thể gây hại | Không do bệnh | Gian lận |
| **Ví dụ** | Ngày sai | Liều quá cao | Bệnh sai | Thuốc không danh mục |
| **Mức xử phạt** | Nhẹ | Trung bình | Trung bình | Nặng |
| **Xuất toán** | Bộ phận | Bộ phận | Bộ phận/toàn | Bộ phận/toàn |

---

## 6. CÁC BƯỚC TỪ PHÁT HIỆN LỖIĐẾN KẾT LUẬN

### **Quy Trình Lập Báo Cáo**

```
1. Phát hiện lỗi
   ↓
2. Phân loại: Lỗi gì? (Hành chính/An toàn/Chỉ định/Thanh toán)
   ↓
3. Xác định mức độ: Kiểm tra/Cảnh báo/Xuất toán bộ/Xuất toán toàn
   ↓
4. Tính số tiền:
   - Nếu xuất toán bộ: [Số tiền lỗi] = [Giá đơn vị] x [Số lượng lỗi]
   - Nếu xuất toán toàn: [Số tiền lỗi] = [Tất cả chi phí]
   ↓
5. Nêu căn cứ pháp lý: "Theo [Luật/QĐ/TT], lỗi này..."
   ↓
6. Kết luận chi tiết:
   - Tổng lỗi: [số cái]
   - Tổng tiền xuất toán: [số tiền]
   - Từng chi tiết: [lỗi 1, lỗi 2, ...]
```

---

## 7. BẢNG XỬ PHẠT HÀNH CHÍNH

Ngoài xuất toán, Nghị Định 188/2025 còn quy định **xử phạt hành chính**:

### **Mức xử phạt**

| Loại Vi Phạm | Mức Phạt | Ghi Chú |
|--------------|----------|--------|
| **Lỗi hành chính nhẹ** | 1-3 triệu đ | Dữ liệu thiếu nhưng không ảnh hưởng lớn |
| **Lỗi an toàn nhẹ** | 3-5 triệu đ | Liều nhẹ quá, không gây hại |
| **Lỗi chỉ định** | 5-10 triệu đ | Chẩn đoán không rõ |
| **Lỗi thanh toán** | 10-30 triệu đ | Gian lận danh mục, quá số lượng |
| **Lỗi nặng** | > 30 triệu đ | Quá liều nguy hiểm, gian lận hệ thống |

**Ghi chú:** Mức phạt chỉ áp dụng khi **phát hiện gian lận** (cố tình). Nếu sai sót, chỉ xuất toán.

---

## 8. Cách AI Dùng Quy Trình 5 Bước

### **Khi gặp một ca hồ sơ:**

1. **Bước 1:** Kiểm tra XML có đủ dữ liệu không?
   - "Có NGAY_RA không? Có MA_BENH_CHINH không? Có tất cả thuốc/dịch vụ không?"

2. **Bước 2:** Chẩn đoán có hợp lý không?
   - "Chẩn đoán chính, chẩn đoán kèm, chẩn đoán ra viện có mâu thuẫn không?"

3. **Bước 3:** Dịch vụ có an toàn không?
   - "Liều có quá không? Có chống chỉ định không? Có tương tác không?"

4. **Bước 4:** Dịch vụ có được thanh toán không?
   - "Mã dịch vụ/thuốc có trong danh mục không? Chẩn đoán phù hợp không? Số lượng quá không?"

5. **Bước 5:** Kết luận gì?
   - Nếu tất cả OK → THANH TOÁN
   - Nếu có lỗi → XUẤT TOÁN [số tiền]

---

## 9. Ví Dụ Thực Tế: Áp Dụng 5 Bước

### **Ca 000339: Mekoferrat-B9 (N84.0)**

**Bước 1: Dữ liệu**
- ✅ Có NGAY_VAO, NGAY_RA, MA_BENH_CHINH, thuốc, dịch vụ
- ✅ Tất cả hợp lệ về mặt hình thức
- **→ OK, sang bước 2**

**Bước 2: Chẩn đoán**
- MA_BENH_CHINH = N84.0 (Polyp buồng tử cung)
- Không mâu thuẫn
- **→ OK, sang bước 3**

**Bước 3: An toàn**
- Mekoferrat-B9: 1 lọ x 1 lần/ngày x 3 ngày
- Liều an toàn, không quá, không chống chỉ định
- **→ OK, sang bước 4**

**Bước 4: Thanh toán**
- Danh mục Mekoferrat-B9: Chỉ thanh toán cho D50 (thiếu máu) hoặc O25 (suy dinh dưỡng thai)
- Chẩn đoán bệnh nhân: N84.0 (Polyp)
- ❌ **KHÔNG PHÙ HỢP DANH MỤC**
- **→ XUẤT TOÁN**

**Bước 5: Kết luận**
- ⛔ **XUẤT TOÁN TOÀN BỘ: 45.000 đ**
- **Lý do:** Mekoferrat-B9 không được thanh toán cho chẩn đoán N84.0
- **Căn cứ:** TT 15/2015/TT-BYT, Nghị Định 188/2025

---

## 10. Tầm Quan Trọng Của Quy Trình 5 Bước

### **Nếu AI không tuân thủ 5 bước:**
- ❌ Có thể bỏ sót lỗi (chỉ kiểm tra thuốc, quên kiểm tra dữ liệu)
- ❌ Phân loại lỗi sai (gọi lỗi đó là an toàn khi nó là thanh toán)
- ❌ Không biết xuất toán ở bước nào, nên kết luận sai

### **Nếu AI tuân thủ 5 bước:**
- ✅ **Toàn diện:** Kiểm tra tất cả khía cạnh
- ✅ **Chính xác:** Phân loại lỗi đúng
- ✅ **Hiệu quả:** Xuất toán đủ lỗi, không bỏ sót
- ✅ **Minh bạch:** Có thể giải thích từng bước cho người dùng

---

## 11. Các Quyết Định & Thông Tư Liên Quan

### **Để kiểm tra Dữ Liệu (Bước 1):**
- Quyết Định 130/QĐ-BYT (Cấu trúc XML)
- Nghị Định 188/2025 (Yêu cầu bắt buộc)

### **Để kiểm tra Chẩn Đoán (Bước 2):**
- Luật 75/2014, Luật 07/2023
- Hướng dẫn lâm sàng của Bộ Y Tế

### **Để kiểm tra An Toàn (Bước 3):**
- QĐ 5631/QĐ-BYT (Kháng sinh)
- TT 15/2015/TT-BYT (Danh mục, điều kiện sử dụng)

### **Để kiểm tra Thanh Toán (Bước 4):**
- TT 15/2015/TT-BYT (Danh mục)
- TT 37/2024/TT-BYT (Danh mục 2024, cập nhật)
- Nghị Định 188/2025 (Điều kiện)

---

## 12. Bước Tiếp Theo

Sau khi đọc thẻ này, AI nên:

1. **Hiểu rõ 5 bước** giám định (thứ tự quan trọng)
2. **Phân biệt 4 loại lỗi** (hành chính, an toàn, chỉ định, thanh toán)
3. **Áp dụng 5 bước vào mỗi ca** hồ sơ
4. **Nêu rõ lỗi từng bước** khi kết luận
5. **Tham khảo các căn cứ pháp lý** đúng cho mỗi bước

---

## Ghi Chú

- **Nghị Định 188/2025 là mới nhất** → Tất cả rule hiện tại phải tuân thủ quy trình này
- **5 bước không thể bỏ qua** → Nếu bỏ bước 4, có thể kết luận sai thanh toán
- **4 loại lỗi độc lập** → Một ca có thể có nhiều lỗi từ các loại khác nhau
- **Xử lý gian lận** → Nếu phát hiện cố tình vi phạm, có thể xử phạt ngoài xuất toán
