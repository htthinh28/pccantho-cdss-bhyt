# CA HUẤN LUYỆN: LỖI HÀNH CHÍNH - CHÊNH LỆCH TỔNG TIỀN

Phiên bản: 1.0
Ngày cập nhật: 06/04/2026

## 1. Mục đích

Ca này dạy AI cách phát hiện và xử lý **lỗi hành chính lớn nhất** - **CHÊNH LỆCH TỔNG TIỀN THANH TOÁN** - khi XML1 (khai báo) ≠ XML2 (chi tiết).

Trọng tâm:
- Hiểu loại lỗi hành chính dự báo sớm
- Biết phân biệt "lỗi kế toán đơn giản" vs "gian lận tiềm ẩn"
- Cách xử lý theo Nghị định 188/2025 (từ chối tạm thời + yêu cầu xác minh)

---

## 2. Hồ sơ ví dụ

| Thông tin | Giá trị |
|-----------|--------|
| **MA_LK** | 000589 |
| **NGAY_VAO** | 2026-03-08 |
| **NGAY_RA** | 2026-03-10 |
| **MA_BENH_CHINH** | J18.9 (Viêm phổi) |
| **LOAI_KCB** | 3 (nội trú, 2 ngày) |
| **Tổng chi phí KCB** | 18.560.000đ |

---

## 3. Phát hiện lỗi chênh lệch

### 3.1. Dữ liệu từ XML1 (khai báo tổng)

```XML
<XML1>
  <T_THUOC>12.864.000</T_THUOC>          ← Tổng tiền thuốc XML1
  <T_XETNGHIEM>3.200.000</T_XETNGHIEM>   ← Tổng tiền XN XML1
  <T_DVKT>2.496.000</T_DVKT>             ← Tổng tiền DV kỹ thuật XML1
  <T_GIUONG>0</T_GIUONG>                 ← Tiền giường (ko có)
  <TONG_TIEN>18.560.000</TONG_TIEN>      ← TỔNG CỘNG
</XML1>
```

**Giải thích:**
- XML1 là **tài liệu tóm tắt** (header của hồ sơ)
- Ghi tổng tiền từng nhóm dịch vụ

### 3.2. Dữ liệu từ XML2 (danh sách chi tiết thuốc)

```XML
Dòng 1: Cefotaxime 1g x 3 lần/ngày x 2 ngày
  SO_LUONG = 6 (lọ)
  GIA_THANH_TOAN = 35.000đ/lọ
  THANH_TIEN = 210.000đ

Dòng 2: Amoxiclav 625mg x 3 lần/ngày x 2 ngày
  SO_LUONG = 6 (viên)
  GIA_THANH_TOAN = 8.500đ/viên
  THANH_TIEN = 51.000đ

Dòng 3: Paracetamol 500mg x 3 lần/ngày x 2 ngày
  SO_LUONG = 6 (viên)
  GIA_THANH_TOAN = 1.200đ/viên
  THANH_TIEN = 7.200đ

... (nhiều dòng khác)

TỔNG XML2: 4.932.000đ (chỉ tính được 4.93 triệu)
```

### 3.3. Phát hiện chênh lệch

```
XML1.T_THUOC (khai báo): 12.864.000đ
XML2_TOTAL (chi tiết):    4.932.000đ
━━━━━━━━━━━━━━━━━━━━━━━
CHÊNH LỆCH:   7.932.000đ  (+161%)
```

**Diễn giải:**
- Bệnh viện **khai báo** tổng tiền thuốc là 12.86 triệu
- Nhưng **danh sách chi tiết** XML2 chỉ **tính được** 4.93 triệu
- **Thiếu 7.93 triệu (61%)** - đây là lỗi rất lớn

---

## 4. Căn cứ pháp lý

### 4.1. Luật cơ sở

**Luật BHYT 75/2014, Điều 16:**
> "Thanh toán chi phí phải đúng thủ tục, đầy đủ dữ liệu, có sự phù hợp giữa tài liệu khai báo và chứng từ chi tiết."

**Ý nghĩa:**
- Bệnh viện phải cung cấp **đầy đủ chi tiết** cho mỗi khoản chi phí
- Không được khai báo **lơ lửng** (không có chi tiết)
- Tổng XML1 phải **khớp chiếu được** với tổng XML2

### 4.2. Quyết định triển khai

**Quyết định 130/QĐ-BYT (Cấu trúc XML):**
> "XML1 là bản tóm tắt. XML2 là danh sách chi tiết. Chúng phải khớp nhau."

**Quyết định 3618/QĐ-BHXH (Xác minh dữ liệu):**
> "BHXH có quyền kiểm tra **tính nhất quán giữa khai báo tổng và chi tiết**. Nếu không nhất quán → không thanh toán cho phần chênh lệch."

### 4.3. Nghị định 188/2025

**Điều 1 (Định nghĩa lỗi hành chính):**
> "Sai lạc hành chính bao gồm lỗi kế toán, chênh lệch số liệu, không nhất quán dữ liệu."

**Điều 2.1 (Điều kiện từ chối):**
> "BHXH có quyền từ chối thanh toán nếu phát hiện **chênh lệch lớn hơn 10%**."

**Ứng dụng vào hồ sơ này:**
- Chênh lệch 61% >> 10% → **hoàn toàn có quyền từ chối**
- Từ chối được làm **tạm thời** (yêu cầu giải thích) hoặc **vĩnh viễn** (nếu không giải thích được)

---

## 5. Cách xử lý theo quy trình

### 5.1. Bước 1: Xác nhận chênh lệch

**Tính toán:**
- XML1.T_THUOC = 12.864.000đ
- ∑XML2.THANH_TIEN = 4.932.000đ
- Chênh lệch = 7.932.000đ (61%)

**Kết luận:** ⛔ **CHÊNH LỆCH LỚNHƠN 10% → LỖI HÀNH CHÍNH NẶNG**

### 5.2. Bước 2: Xác định lỗi

**Ba khả năng:**

| Khả năng | Nguyên nhân | Xử lý |
|----------|-----------|-------|
| **Lỗi nhập liệu XML1** | Bệnh viện ghi sai tổng tiền | Yêu cầu sửa XML1 |
| **Thiếu dữ liệu XML2** | Bệnh viện quên kê đầy đủ thuốc | Yêu cầu bổ sung XML2 |
| **Gian lận** | Bệnh viện cố tình khai cao | Báo cáo, xử phạt |

### 5.3. Bước 3: Quyết định tạm thời

**Vì không thể xác định ngay lỗi hay gian lận → từ chối tạm thời**

**Phương án:**
1. **Từ chối thanh toán tạm thời** cho phần chênh lệch (7.93 triệu)
2. **Yêu cầu bệnh viện trong 15 ngày:**
   - Giải thích: 7.93 triệu đó từ đâu?
   - Cung cấp hóa đơn/chứng từ gốc
   - Sửa lại XML (tùy chọn: sửa XML1 xuống, hay sửa XML2 lên)

### 5.4. Bước 4: Xem xét lại

**Nếu bệnh viện giải thích được:**
- Hóa đơn có, chi tiết rõ ràng → **thanh toán phần chênh lệch**
- Sửa XML để khớp → **thanh toán toàn bộ**

**Nếu bệnh viện không giải thích:**
- Quá hạn 15 ngày mà không trả lời → **XUẤT TOÁN 7.93 triệu**
- Trả lời nhưng không thuyết phục → **XUẤT TOÁN bộ (tùy mức)**

---

## 6. Quyết định giám định chi tiết

```
QUYẾT ĐỊNH GIÁM ĐỊNH - LỖI HÀNH CHÍNH: CHÊNH LỆCH TỔNG TIỀN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Ma LK: 000589
Cơ sở Y tế: [Bệnh viện X]
Ngày phát hành: 06/04/2026

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

I. KẾT LUẬN CHUNG

Khai báo tổng tiền thanh toán: 18.560.000đ

Kiểm tra phát hiện:
- Lỗi hành chính: CHÊNH LỆCH TỔNG TIỀN THUỐC

Quyết định:
- TỪ CHỐI THANH TOÁN TẠM THỜI cho phần chênh lệch

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

II. CHI TIẾT LỖI

### Mô tả lỗi:

Hồ sơ 000589 có chênh lệch lớn giữa khai báo tổng và chi tiết:

XML1 (Khai báo tóm tắt):
  T_THUOC = 12.864.000đ

XML2 (Danh sách chi tiết):
  TỔNG = 4.932.000đ

Chênh lệch: 7.932.000đ (61%)

### Căn cứ pháp lý:

- Luật BHYT 75/2014, Điều 16: "Thanh toán phải đúng thủ tục, đầy đủ dữ liệu, nhất quán"
- Quyết định 130/QĐ-BYT: "Cấu trúc XML bắt buộc, XML1 (tóm tắt) phải khớp XML2 (chi tiết)"
- Quyết định 3618/QĐ-BHXH: "Kiểm tra tính nhất quán giữa khai báo tổng và chi tiết"
- Nghị định 188/2025, Điều 1: "Sai lạc hành chính bao gồm chênh lệch số liệu"
- Nghị định 188/2025, Điều 2.1: "Từ chối thanh toán nếu phát hiện chênh lệch > 10%"

### Phân tích:

Chênh lệch 61% vượt far vượt qua 10% → lỗi hành chính NẶNG

Ba khả năng:
1. Lỗi nhập liệu XML1 (bệnh viện ghi sai tổng)
2. Thiếu dữ liệu XML2 (bệnh viện quên kê chi tiết)
3. Lỗi kế toán (sai sót trong tính toán)

Hiện không thể xác định ngay lỗi hay gian lận → Từ chối tạm thời.

### Quyết định:

⛔ TỪ CHỐI THANH TOÁN TẠM THỜI

Chi tiết:
- Thanh toán tạm thời: 4.932.000đ (phần có chi tiết trong XML2)
- Từ chối tạm thời: 7.932.000đ (phần chênh lệch)
- Thời hạn: Chờ bệnh viện giải thích trong **15 ngày**

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

III. YÊU CẦU ĐỐI VỚI BỆNH VIỆN

Trong vòng 15 ngày kể từ ngày nhận quyết định này, bệnh viện phải:

1. **Giải thích chênh lệch 7.932.000đ:**
   - Tiền đó từ nhóm dịch vụ nào? (thuốc, XN, hay DV khác?)
   - Có hóa đơn/chứng từ không?

2. **Cung cấp chứng cứ:**
   - Hóa đơn gốc hoặc sao chép được xác thực
   - Dữ liệu chi tiết từ hệ thống kế toán

3. **Lựa chọn sửa lại:**

   **Tùy chọn A:** Sửa XML1 (giảm khai báo tổng)
   - Nếu XML2 đúng → Sửa T_THUOC từ 12.864.000đ xuống 4.932.000đ
   - Sửa TONG_TIEN từ 18.560.000đ xuống 10.628.000đ
   - → Thanh toán 10.628.000đ

   **Tùy chọn B:** Bổ sung XML2 (thêm chi tiết)
   - Nếu thực tế cấp 12.86 triệu → Bổ sung danh sách thuốc thêm 7.93 triệu
   - Cung cấp hóa đơn gốc cho phần bổ sung
   - → Thanh toán 18.560.000đ

4. **Gửi lại hồ sơ** trong hạn 15 ngày

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

IV. THỜI GIAN XỬ LÝ

| Bước | Hạn chế |
|------|---------|
| Bệnh viện gửi giải thích | 15 ngày |
| BHXH xem xét lại | 15 ngày |
| **Tổng cộng** | **30 ngày** |

Nếu **quá thời hạn mà bệnh viện chưa giải thích → XUẤT TOÁN 7.932.000đ**

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

V. HƯỚNG DẪN PHÚC ĐÁP

Theo Nghị định 188/2025, bệnh viện có quyền phúc đáp:

- **Hạn chế:** 30 ngày kể từ ngày nhận quyết định
- **Lý do:** Nếu không đồng ý với quyết định từ chối tạm thời

Cách phúc đáp:
1. Viết tờ phúc đáp, nêu rõ lý do không đồng ý
2. Kèm theo chứng cứ (hóa đơn gốc, sao chép xác thực, etc.)
3. Gửi cho BHXH trong 30 ngày

BHXH sẽ xem xét phúc đáp trong 30 ngày và trả lời.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

HẾT
```

---

## 7. Bài học rút ra cho AI

### 7.1. Dấu hiệu "cảnh báo đỏ" khi gặp lỗi hành chính

| Dấu hiệu | Ý nghĩa | Xử lý |
|----------|---------|-------|
| Chênh lệch > 10% | Lỗi lớn | Từ chối tạm |
| Chênh lệch 10-30% | Lỗi trung bình | Kiểm soát chặt |
| Chênh lệch < 10% | Lỗi nhỏ | Cảnh báo |

### 7.2. Phân biệt "Lỗi đơn giản" vs "Gian lận tiềm ẩn"

**Lỗi đơn giản:**
- Chênh lệch nhỏ (1-5%)
- Bệnh viện giải thích được ngay
- Sửa lại XML, thanh toán bình thường

**Gian lận tiềm ẩn:**
- Chênh lệch lớn (50%+)
- Bệnh viện không giải thích được
- Không có hóa đơn gốc
- → Báo cáo cơ quan chức năng

**Ca này là "gian lận tiềm ẩn" - chênh lệch 61%, đáng báo cáo**

### 7.3. Cách viết quyết định lỗi hành chính

**Mẫu:**
```
"Hồ sơ có chênh lệch [X] giữa XML1 ([Y]đ) và XML2 ([Z]đ).

Căn cứ pháp lý: [Luật], [QĐ], [Nghị định]

Xử lý:
- TỪ CHỐI THANH TOÁN TẠM THỜI cho phần chênh lệch [X]đ
- YÊU CẦU bệnh viện trong 15 ngày: [Giải thích cụ thể]
- Nếu không giải thích → XUẤT TOÁN [X]đ"
```

---

## 8. Prompt học tập

### Prompt 1: Phát hiện lỗi
```
"Hồ sơ 000589 có T_THUOC XML1 = 12.864.000đ, XML2 = 4.932.000đ
Chênh lệch là bao nhiêu phần trăm? Đây có phải lỗi hành chính không?"
```

### Prompt 2: Xác định xử lý
```
"Nếu chênh lệch 61%, AI nên:
A) Thanh toán toàn bộ
B) Từ chối toàn bộ
C) Từ chối tạm + yêu cầu giải thích

Tại sao? Cited Luật/QĐ nào?"
```

### Prompt 3: Soạn quyết định
```
"Soạn quyết định giám định cho lỗi chênh lệch này,
bao gồm: Lỗi, Căn cứ pháp lý, Xử lý, Yêu cầu bệnh viện"
```

---

## 9. Ghi chú cuối

- **Lỗi hành chính là "lớp chắn đầu tiên"** - nếu lỗi hành chính lớn, không kiểm tra tiếp lỗi chuyên môn
- **Từ chối tạm thời ≠ xuất toán vĩnh viễn** - phải cho bệnh viện cơ hội giải thích
- **Chênh lệch lớn là dấu hiệu gian lận** - nên báo cáo, không chỉ từ chối
- **Theo Nghị định 188/2025, quyết định phải rõ ràng** - nêu chính xác lỗi, luật, giải pháp
