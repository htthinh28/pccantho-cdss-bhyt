# CHỈ MỤC: LUẬT BHYT → RULE GIÁM ĐỊNH (2024-2025)

Phiên bản: 1.0
Ngày cập nhật: 06/04/2026

## Mục đích

Tài liệu này là **bản đồ** giúp AI nhanh chóng tra cứu:
- **"Rule này dựa vào luật nào?"**
- **"Loại lỗi nào thuộc Luật 75/2014 vs Luật 07/2023?"**
- **"Đây là sai phạm hành chính hay chuyên môn?"**

---

## PHẦN 1: LIÊN KẾT LUẬT → LOẠI LỖI

### Luật BHYT 75/2014 (Cơ sở chính)

#### Điều 15: "Thanh toán chi phí phù hợp với bệnh lý, chẩn đoán, hướng dẫn sử dụng"

**Rule liên quan:**
- ✅ THUOC_01 (Liều Acetyl leucin > 2000mg) → SAI PHÁC ĐỒ
- ✅ THUOC_04 (Liều Aciclovir > 4000mg) → NGUY HIỂM
- ✅ THUOC_07 (Tần suất Aciclovir > 5 lần) → SAI PHÁC ĐỒ
- ✅ THUOC_12 (Liều Albendazol > 200mg ở trẻ < 10kg) → NGUY HIỂM
- ✅ THUOC_342 (Mekoferrat cho D50/O25 mà bệnh nhân không có) → XUẤT TOÁN
- ✅ CLN-CHI-01 (Chênh lệch tổng tiền thuốc) → LỖI NẶNG

**Tóm gọn:** Rule về liều, tần suất, chỉ định đều dựa vào **Điều 15** - thanh toán phù hợp

#### Điều 16: "Thanh toán phải đúng thủ tục, đầy đủ dữ liệu, không vi phạm hành chính"

**Rule liên quan:**
- ✅ XML1-REQ-NGAY_RA (Thiếu trường NGAY_RA) → LỖI NẶNG
- ✅ GB_47 (NGAY_RA < NGAY_VAO) → LỖI NẶNG
- ✅ GB_75 (Nằm viện < 4 giờ) → XUẤT TOÁN
- ✅ HC_130 (Số ngày điều trị không khớp NGAY_VAO/RA) → LỖI KẾ TOÁN
- ✅ HC_43 (Giờ ra < giờ vào) → LỖI LOGIC
- ✅ HC_246 (Định dạng ngày không đúng 12 ký tự) → LỖI FORMAT

**Tóm gọn:** Rule về dữ liệu, thủ tục, logic dữ liệu đều dựa vào **Điều 16** - đúng thủ tục

---

### Luật BHYT 07/2023/QH15 (Sửa đổi, hiệu lực 01/06/2024)

#### Điều 25: "BHXH có quyền kiểm tra, từ chối thanh toán sai lạc"

**Ý nghĩa:**
- Mở rộng quyền từ chối thanh toán từ "hành chính" sang "chuyên môn"
- Cho phép kiểm tra **50% hồ sơ bình thường** (ngẫu kiểm)
- Bắt buộc kiểm tra **100% hồ sơ có dấu hiệu sai sót**

**Rule liên quan:**
- ✅ Tất cả rule THUOC_* (kiểm tra chuyên môn)
- ✅ Tất cả rule PTTT_* (kiểm tra chuyên môn)

#### Điều 26: "Xử lý sai phạm - quyền phúc đáp"

**Ý nghĩa:**
- Bệnh viện có quyền **phúc đáp** trong **30 ngày**
- BHXH phải **xem xét lại** và trả lời
- Nếu BHXH **từ chối sai**, phải thanh toán + **lãi 0,1%/ngày**

**Ứng dụng:**
- Khi từ chối thanh toán, quyết định phải **có xuyên chứng pháp lý rõ ràng**
- Không được chỉ nói "không đúng" mà phải nêu "sai ở đâu, căn cứ là gì"

---

### Quyết định 5631/QĐ-BYT năm 2020 (Quản lý sử dụng kháng sinh)

#### Điều 2: "Không vượt liều tối đa khuyến cáo"

**Rule liên quan:**
- ✅ THUOC_04 (Aciclovir > 4000mg/ngày)
- ✅ THUOC_01 (Acetyl leucin > 2000mg/ngày)
- ✅ Tất cả rule kiểm tra liều

#### Điều 3: "Phân biệt dự phòng vs điều trị"

**Rule liên quan:**
- ✅ Tất cả rule để xác định context phẫu thuật
- ✅ Rule về thời lượng dùng kháng sinh

#### Điều 4: "Kiểm tra tương tác, chống chỉ định"

**Rule liên quan:**
- ✅ THUOC_02 (Acetyl leucin vs thai kỳ)
- ✅ THUOC_05 (Aciclovir vs suy thận nặng)
- ✅ THUOC_08 (Adrenalin vs tăng huyết áp)

---

### 15/VBHN-BYT năm 2025 (Danh mục bảo hiểm)

#### Điều 1: "Danh sách thuốc được thanh toán"

**Rule liên quan:**
- ✅ THUOC_342 (Mekoferrat chỉ cho D50, O25)
- ✅ THUOC_03 (Gikanin chỉ cho H81, R42)
- ✅ THUOC_06 (Aciclovir chỉ cho B00, B02)
- ✅ THUOC_10 (Adrenalin chỉ cho T81.1, R57, I46)

---

### Quyết định 130/QĐ-BYT (Cấu trúc dữ liệu XML)

#### Điều 1: "Cấu trúc XML bắt buộc"

**Rule liên quan:**
- ✅ XMLn-REQ-* (tất cả rule kiểm tra trường bắt buộc)
- ✅ HC_246 (Định dạng ngày 12 ký tự)

---

### Nghị định 188/2025/NĐ-CP (Quy trình giám định mới)

#### Điều 1: "Định nghĩa sai lạc: hành chính, chuyên môn, thanh toán"

**Rule liên quan:**
- ✅ **Lỗi hành chính:** XMLn-REQ-*, HC_*, GB_*
- ✅ **Lỗi chuyên môn-an toàn:** THUOC_* (liều), PTTT_* (an toàn)
- ✅ **Lỗi chuyên môn-chỉ định:** THUOC_* (chẩn đoán), quy định chỉ định
- ✅ **Lỗi thanh toán hình thức:** CLN-CHI-01, kiểm tra tính nhất quán

#### Điều 2: "Từ chối thanh toán phải có xuyên chứng pháp lý"

**Ứng dụng:**
- Mỗi quyết định xuất toán phải nêu:
  1. **Rule code** (VD: THUOC_342)
  2. **Loại lỗi** (VD: Chỉ định sai)
  3. **Căn cứ pháp lý** (VD: Luật 75/2014 + 15/VBHN-2025)
  4. **Xử lý cụ thể** (VD: Xuất toán 150.000đ)

#### Điều 3: "Quy trình kiểm tra"

**Ứng dụng:**
- BHXH phải kiểm tra **50%** hồ sơ bình thường
- Phải kiểm tra **100%** hồ sơ có dấu hiệu sai
- Phải phản hồi **trong 90 ngày**

#### Điều 4: "Quyền phúc đáp"

**Ứng dụng:**
- Bệnh viện phúc đáp trong **30 ngày**
- BHXH phải xem xét lại trong **30 ngày**
- Nếu thắng, thanh toán trong **15 ngày** + **lãi 0,1%/ngày**

---

## PHẦN 2: LIÊN KẾT LOẠI LỖI → LUẬT

### Loại 1: Lỗi Hành Chính (Dữ liệu sai/thiếu)

**Căn cứ pháp lý:**
- Luật BHYT 75/2014, **Điều 16**
- Quyết định 130/QĐ-BYT (Cấu trúc XML)
- Nghị định 188/2025, **Điều 1** (định nghĩa lỗi hành chính)

**Rule ví dụ:**
| Rule | Mô tả | Xử lý |
|------|-------|-------|
| XML1-REQ-NGAY_RA | Thiếu ngày ra | LỖI NẶNG → Từ chối tạm |
| GB_47 | NGAY_RA < NGAY_VAO | LỖI NGARNG → Từ chối tạm |
| HC_246 | Định dạng ngày sai | LỖI FORMAT → Từ chối tạm |
| CLN-CHI-01 | Chênh lệch tổng tiền | LỖI KẾ TOÁN → Kiểm soát chặt |

**Xử lý chung:**
- Từ chối thanh toán **tạm thời** (yêu cầu xác minh)
- Hoặc từ chối **vĩnh viễn** nếu không sửa được

---

### Loại 2: Lỗi Chuyên Môn - An Toàn (Liều/tần suất sai)

**Căn cứ pháp lý:**
- Luật BHYT 75/2014, **Điều 15** (thanh toán theo hướng dẫn)
- Quyết định 5631/QĐ-BYT (Quản lý kháng sinh)
- Nghị định 188/2025, **Điều 2.2** (sai phạm chuyên môn)

**Rule ví dụ:**
| Rule | Mô tả | Xử lý |
|------|-------|-------|
| THUOC_01 | Acetyl leucin > 2000mg | SAI PHÁC ĐỒ → Cảnh báo |
| THUOC_04 | Aciclovir > 4000mg | NGUY HIỂM → Cảnh báo + Xem xét |
| THUOC_07 | Aciclovir > 5 lần/ngày | SAI PHÁC ĐỒ → Xuất toán |

**Xử lý chung:**
- **Cảnh báo** nếu chỉ vượt nhẹ
- **Xuất toán bộ** nếu vượt đáng kể
- **Xuất toán toàn bộ** nếu quá nguy hiểm

---

### Loại 3: Lỗi Chuyên Môn - Chỉ Định (Chẩn đoán sai)

**Căn cứ pháp lý:**
- Luật BHYT 75/2014, **Điều 15** (phù hợp bệnh lý)
- **15/VBHN-BYT năm 2025** (danh mục bảo hiểm, phạm vi thanh toán)
- Quyết định 123/2020/NĐ-CP (phạm vi dịch vụ/thuốc được phép)
- Nghị định 188/2025, **Điều 2.3** (sai chỉ định)

**Rule ví dụ:**
| Rule | Mô tả | Xử lý |
|------|-------|-------|
| THUOC_03 | Gikanin cho H81/R42| XUẤT TOÁN |
| THUOC_06 | Aciclovir cho B00/B02 | XUẤT TOÁN |
| THUOC_10 | Adrenalin cho T81.1/R57/I46 | XUẤT TOÁN |
| THUOC_342 | Mekoferrat cho D50/O25 | XUẤT TOÁN |

**Xử lý chung:**
- **XUẤT TOÁN TOÀN BỘ** cho hầu hết lỗi chỉ định
- **Cho phúc đáp** nếu bệnh viện thêm chẩn đoán hợp lệ

---

### Loại 4: Lỗi Thanh Toán Hình Thức (Số lượng/giá sai)

**Căn cứ pháp lý:**
- Luật BHYT 75/2014, **Điều 16** (đúng thủ tục, chính xác)
- Quyết định 123/2020/NĐ-CP (tỷ lệ, mức thanh toán)
- Nghị định 188/2025, **Điều 1** (xác minh kế toán)

**Rule ví dụ:**
| Rule | Mô tả | Xử lý |
|------|-------|-------|
| CLN-CHI-01 | Chênh lệch tổng tiền | Kiểm soát chặt |
| Số lượng quá | Cấp 10 nhưng hướng dẫn 5 | Xuất toán bộ |
| Giá sai | Giá tính 20.000đ, danh mục 15.000đ | Xuất toán bộ |

**Xử lý chung:**
- **Xuất toán bộ** theo lượng/tiền sai
- **Ghi rõ** bao nhiêu tiền cần hoàn

---

## PHẦN 3: BẢNG TRA CỨU NHANH

### Nếu AI gặp rule XYZ, hãy tra:

```
THUOC_01 (Acetyl leucin > 2g)
  → Luật: 75/2014 Điều 15
  → QĐ: 5631/QĐ-BYT
  → Loại: An toàn
  → Xử lý: Cảnh báo / SAI PHÁC ĐỒ

THUOC_03 (Gikanin cho H81/R42)
  → Luật: 75/2014 Điều 15
  → QĐ: 15/VBHN-BYT
  → Loại: Chỉ định
  → Xử lý: XUẤT TOÁN

CLN-CHI-01 (Chênh lệch tiền)
  → Luật: 75/2014 Điều 16
  → QĐ: 130/QĐ-BYT, 3618/QĐ-BHXH
  → Loại: Hành chính
  → Xử lý: Kiểm soát chặt

GB_47 | HC_43 (NGAY_RA < NGAY_VAO)
  → Luật: 75/2014 Điều 16
  → QĐ: 130/QĐ-BYT
  → Loại: Hành chính
  → Xử lý: LỖI NẶNG, từ chối tạm
```

---

## PHẦN 4: CÁCH DÙNG CHỈ MỤC NÀY

### Khi giám định một hồ sơ:

**Bước 1:** Xác định rule bị vi phạm
- VD: THUOC_342 (Mekoferrat sai chẩn đoán)

**Bước 2:** Tra chỉ mục
- Loại: Chỉ định
- Luật: 75/2014 Điều 15 + 15/VBHN-2025
- Xử lý: XUẤT TOÁN

**Bước 3:** Viết quyết định
- "Theo Luật BHYT 75/2014 Điều 15 và 15/VBHN-BYT năm 2025..."
- "Thuốc X chỉ được thanh toán cho Y"
- "Bệnh nhân không có Y → XUẤT TOÁN"

**Bước 4:** Nêu xuyên chứng pháp lý
- Luật cơ sở
- Quyết định triển khai
- Phạm vi áp dụng từ danh mục

---

## PHẦN 5: BIỂU ĐỒ TÓM GỌN

```
                    LUẬT BHYT 75/2014
                           |
                    (nền tảng chính)
                           |
                ┌──────────┼──────────┐
                |          |          |
            Điều 15    Điều 16    Điều 18
            (nội dung) (hành chính) (quyền lợi)
                |          |          |
                |          |          |
        Thanh toán   Đúng thủ tục   Giới hạn
        phù hợp      & dữ liệu      thanh toán
            |          |          |
            |          |          |
     QĐ 5631, 123  QĐ 130, 3618  15/VBHN-2025
     (hướng dẫn)  (cấu trúc)    (danh mục)
            |          |          |
            ↓          ↓          ↓
        Rule           Rule         Rule
      THUOC_*      HC_*, GB_*    THUOC_*
      PTTT_*       XML*          (chỉ định)
     (liều, TDS)   (dữ liệu)
```

---

## PHẦN 6: CẬP NHẬT KHI LỚP LUẬT THAY ĐỔI

Nếu sau này có:
- **Luật BHYT mới** → Cập nhật "LIÊN KẾT LUẬT → LOẠI LỖI"
- **Quyết định mới** → Thêm vào bảng tương ứng
- **Rule mới** → Thêm vào "BẢNG TRA CỨU NHANH"

---

## Ghi chú cuối

Chỉ mục này giúp AI:
1. **Nhanh chóng** tìm căn cứ pháp lý cho mỗi rule
2. **Dễ dàng** giải thích quyết định cho bệnh viện
3. **Nhất quán** trong cách trích dẫn luật lệ

Hãy dùng nó khi viết quyết định về từ chối thanh toán, để đảm bảo **xuyên chứng pháp lý rõ ràng**.
