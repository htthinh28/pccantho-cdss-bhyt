# THẺ TRI THỨC: HÀNH CHÍNH BHYT VÀ QUY TRÌNH THANH TOÁN

Phiên bản: 1.0
Ngày cập nhật: 06/04/2026

## 1. Mục đích

Thẻ này chuẩn hóa **toàn bộ yêu cầu hành chính** để hồ sơ được thanh toán BHYT, giúp AI:

- Hiểu **quy trình hành chính từ vào viện đến thanh toán**
- Biết **dữ liệu bắt buộc** ở mỗi bước
- Phát hiện **lỗi hành chính** và xử lý tương ứng
- Phân biệt **lỗi đơn giản** vs **lỗi gian lận**

---

## 2. Quy trình hành chính thanh toán BHYT (tóm gọn)

```
VIỆN (Bệnh Viện)
  ↓
Khảm:【BN vào viện, lập XML1 (hồ sơ chính)
  ↓
 Điều trị【BN nằm/chữa, tạo XML2, XML3, XML4, XML5
  ↓
Ra viện【BN xuất viện, quản lý khoá hồ sơ
  ↓
Lập tài liệu⟡hồ sơ + hóa đơn + chứng từ
  ↓
Gửi BHXH⟡hóa đơn điện tử + XML files
  ↓
BHXH KIỂM⟡Giám định viên kiểm tra
  ↓
THANH TOÁN⟡BHXH chuyển tiền
```

---

## 3. Các bước hành chính chi tiết

### BƯỚC 1: Tiếp nhận & Lập XML1

#### 1.1. Yêu cầu hành chính

**Dữ liệu bắt buộc trong XML1:**
- `MA_BHYT` (mã BHYT của BN)
- `HO_TEN` (họ tên bệnh nhân)
- `NGAY_SINH` (ngày sinh)
- `GIOI_TINH` (giới tính)
- `NGAY_VAO` (ngày vào viện - định dạng yyyyMMddHHmm, 12 ký tự)
- `NGAY_RA` (ngày ra viện - định dạng yyyyMMddHHmm, 12 ký tự)
- `MA_BENH_CHINH` (chẩn đoán chính, ICD-10)
- `MA_BENH_KT` (chẩn đoán kèm)
- `CHAN_DOAN_RV` (chẩn đoán ra viện)
- `MA_LOAI_KCB` (loại KCB: 1=ngoại trú, 2=ngoại trú ngắn lâu, 3=nội trú)
- `PHONG_KHOA` (phòng khoa khám)

#### 1.2. Lỗi phổ biến

| Lỗi | Ví dụ | Xử lý |
|-----|--------|-------|
| Thiếu NGAY_RA | XML1 không có ngày ra | **LỖI NẶNG** - từ chối tạm thời |
| NGAY_RA < NGAY_VAO | Ngày ra 2026-03-10, nhưng ngày vào 2026-03-15 | **LỖI LOGIC** - xáo trộn, từ chối |
| Định dạng ngày sai | Ghi "03/15/2026" thay vì "202603150000" | **LỖI FORMAT** - từ chối |
| Thiếu MA_BHYT | BN không có mã BHYT (chưa được bảo hiểm) | **LỖI XÁC THỰC** - từ chối |
| Chẩn đoán thiếu ICD-10 | Viết "viêm họng" thay vì "J02" | **LỖI CHẨN ĐOÁN** - yêu cầu sửa |

#### 1.3. Quy tắc kiểm tra XML1

**Rule code:** HC_*, GB_*, XML*-REQ-* (kiểm tra hành chính)

**Ví dụ rule:**
- `HC_246`: Định dạng ngày sai
- `GB_47`: NGAY_RA < NGAY_VAO
- `XML1-REQ-NGAY_RA`: Thiếu trường bắt buộc

---

### BƯỚC 2: Điều trị & Tạo XML2, XML3, XML4, XML5

#### 2.1. Tổng quan các XML

| XML | Nội dung | Chi tiết |
|-----|---------|---------|
| **XML2** | Thuốc | MA_THUOC, SO_LUONG, GIA_THANH_TOAN, NGAY_YL |
| **XML3** | Dịch vụ kỹ thuật | DVKT_CODE, TEN_DVKT, GIA, NGAY_TTH |
| **XML4** | Xét nghiệm | MA_XN, KET_QUA, CHI_SO_BT |
| **XML5** | Diễn biến bệnh | NGAY_GIAI_THICH, TRANG_THAI, GHI_CHU |

#### 2.2. Yêu cầu XML2 (Thuốc)

**Dữ liệu bắt buộc cho mỗi dòng thuốc:**
- `MA_THUOC` (mã thuốc, VD: 40.685)
- `TEN_THUOC` (tên thuốc)
- `HAN_LUONG` (hàm lượng thuốc, VD: "500mg")
- `DANG_BAO_CHE` (dạng: viên, lọ, etc.)
- `SO_LUONG` (số lượng cấp)
- `GIA_THANH_TOAN` (giá BHYT / đơn vị)
- `THANH_TIEN` (= SO_LUONG * GIA)
- `NGAY_YL` (ngày y lệnh - phải nằm trong NGAY_VAO → NGAY_RA)
- `TONG_LIEU_24H` (nếu kê bằng liều)
- `TAN_SUAT` (tần suất, nếu kê bằng tần suất)

**Lỗi phổ biến:**
- SO_LUONG không khớp với LIEU_DUNG × SO_NGAY
- THANH_TIEN tính sai
- NGAY_YL ngoài khoảng NGAY_VAO → NGAY_RA
- MA_THUOC không tồn tại trong danh mục

#### 2.3. Yêu cầu XML3 (Dịch vụ kỹ thuật)

**Dữ liệu bắt buộc:**
- `MA_DVKT` (mã dịch vụ)
- `TEN_DVKT` (tên dịch vụ)
- `GIA_THANH_TOAN` (giá BHYT)
- `NGAY_TTH` (ngày thực hiện, nằm trong khoảng NGAY_VAO → NGAY_RA)
- `NHAN_SU` (bác sĩ thực hiện, mã CN)

#### 2.4. Yêu cầu XML4 (Xét nghiệm)

**Dữ liệu bắt buộc:**
- `MA_XN` (mã xét nghiệm)
- `TEN_XN` (tên xét nghiệm)
- `KET_QUA` (kết quả, hoặc "...")
- `CHI_SO_BT` (chỉ số bình thường - **BẮT BUỘC** theo HD 10 ở 403244)
- `NGAY_LAY_MAU` → `NGAY_PTH`

**Lỗi HD_10:**
- Thiếu `CHI_SO_BT` (chỉ số bình thường) → Không thanh toán xét nghiệm

#### 2.5. Yêu cầu XML5 (Diễn biến)

**Bắt buộc cho hồ sơ NỘI TRỰ (MA_LOAI_KCB == '3'):**
- Phải có ≥ 1 dòng diễn biến/ngày
- `NGAY_GIAI_THICH` (ngày ghi chép)
- `TRANG_THAI` (tình trạng: cải thiện, không thay đổi, xấu đi)
- `GHI_CHU` (mô tả chi tiết)

**Lỗi:**
- `HC_171`: Hồ sơ nội trú nhưng không có XML5 → từ chối

---

### BƯỚC 3: Tổng hợp & Tính toán

#### 3.1. Sự khớp chiếu

**XML1 phải khớp với tổng XML2, XML3, XML4:**

```
XML1.T_THUOC = SUM(XML2.THANH_TIEN)
XML1.T_XETNGHIEM = SUM(XML4.GIA_THANH_TOAN)
XML1.T_DVKT = SUM(XML3.GIA_THANH_TOAN)
XML1.TONG_TIEN = T_THUOC + T_XETNGHIEM + T_DVKT + T_GIUONG + ...
```

**Lỗi:**
- `CLN-CHI-01`: Chênh lệch tổng tiền > 10%

#### 3.2. Kiểm tra thời gian

**Quy tắc:**
- NGAY_VAO < NGAY_RA (phải có thứ tự)
- SO_NGAY_DTRI = DATEDIFF_DAY(NGAY_VAO, NGAY_RA)
- Mỗi NGAY_YL trong XML2 phải: NGAY_VAO ≤ NGAY_YL ≤ NGAY_RA

**Lỗi:**
- `HC_130`: Số ngày điều trị lệch
- `HC_210`: Thời gian khám = 0 phút

#### 3.3. Kiểm tra loại KCB

| MA_LOAI_KCB | Loại | Yêu cầu |
|------------|------|--------|
| 1 | Ngoại trú | Không cần XML5 |
| 2 | Ngoại trú lâu | Có thể có XML5 |
| 3 | Nội trú | **PHẢI có XML5** |

**Lỗi:**
- `HC_171`: Nội trú nhưng không có XML5

---

### BƯỚC 4: Xác minh chứng từ

#### 4.1. Hóa đơn

**Bệnh viện phải gửi:**
1. Hóa đơn gốc (hoặc bản sao được xác thực công chứng)
2. Chi tiết: Từng dóng thuốc, dịch vụ, xét nghiệm
3. Tổng tiền phải khớp với XML1

**Lỗi:**
- Hóa đơn không đầy đủ chi tiết
- Hóa đơn không khớp XML
- Thiếu chữ ký, dấu xác thực

#### 4.2. Chứng từ y tế

**Cần có:**
1. Sơ lược bệnh án (tiếp nhận, chẩn đoán, điều trị)
2. Bảng điều trị chi tiết (nếu có XML5)
3. Xét nghiệm gốc (kết quả, chỉ số bình thường)
4. Y lệnh thuốc (chữ ký bác sĩ)

---

## 4. Các loại lỗi hành chính

### Loại 1: Lỗi cấu trúc dữ liệu (Dữ liệu sai/thiếu)

**Ví dụ:**
- Thiếu NGAY_RA
- Định dạng ngày sai (14 ký tự thay 12)
- MA_BHYT không hợp lệ
- MA_LOAI_KCB không phải 1/2/3

**Xử lý:**
- LỖI NẶNG - từ chối tạm thời
- Yêu cầu bệnh viện sửa XML

**Rule code:**
- `XMLn-REQ-*` (kiểm tra trường bắt buộc)
- `HC_246` (định dạng ngày)

### Loại 2: Lỗi logic dữ liệu (Dữ liệu không hợp lý)

**Ví dụ:**
- NGAY_RA < NGAY_VAO
- NGAY_YL (y lệnh) ngoài khoảng NGAY_VAO → NGAY_RA
- SO_NGAY_DTRI không khớp NGAY_VAO/RA

**Xử lý:**
- LỖI NẶNG - xáo trộn, không thanh toán
- Yêu cầu bệnh viện sửa lại

**Rule code:**
- `GB_47` (NGAY_RA < NGAY_VAO)
- `HC_130` (Số ngày lệch)

### Loại 3: Lỗi nhất quán dữ liệu (Khoảng trống, không khớp)

**Ví dụ:**
- XML1.T_THUOC ≠ tổng XML2
- Nội trú nhưng không có XML5
- Khoảng thời gian nằm viện quá ngắn (< 4 giờ)

**Xử lý:**
- KIỂM SOÁT CHẶT - từ chối tạm thời
- Yêu cầu giải thích ± sửa XML

**Rule code:**
- `CLN-CHI-01` (chênh lệch tiền)
- `HC_171` (Nội trú thiếu XML5)
- `GB_75` (Nằm < 4 giờ)

### Loại 4: Lỗi xác thực chứng từ (Thiếu hóa đơn, chứng từ)

**Ví dụ:**
- Không gửi hóa đơn gốc
- Hóa đơn không có dấu xác thực
- Chứng từ y tế không đầy đủ

**Xử lý:**
- KIỂM SOÁT CHẶT - yêu cầu cung cấp chứng từ

---

## 5. Cách AI kiểm tra hành chính

### Quy trình 5 bước

**Bước 1: Kiểm tra XML1 (Hồ sơ chính)**
```
✓ Có MA_BHYT?
✓ Có HO_TEN?
✓ Có NGAY_VAO, NGAY_RA?
✓ Định dạng ngày đúng 12 ký tự?
✓ NGAY_RA >= NGAY_VAO?
✓ Có MA_BENH_CHINH?
```

Nếu lỗi → **LỖI NẶNG, từ chối tạm thời**

**Bước 2: Kiểm tra XML2, XML3, XML4, XML5**
```
✓ Mỗi dòng có dữ liệu bắt buộc?
✓ NGAY_YL (y lệnh) nằm trong NGAY_VAO → NGAY_RA?
✓ Nếu nội trú: có XML5?
✓ XML4: có CHI_SO_BT?
```

Nếu lỗi → **KIỂM SOÁT CHẶT, yêu cầu sửa**

**Bước 3: Kiểm tra khớp chiếu**
```
✓ XML1.T_THUOC == SUM(XML2)?
✓ XML1.TONG_TIEN == T_THUOC + T_XN + T_DVKT?
✓ Chênh lệch < 10%?
```

Nếu lỗi > 10% → **KIỂM SOÁT CHẶT, từ chối tạm thời cho phần chênh lệch**

**Bước 4: Kiểm tra xác thực**
```
✓ Có hóa đơn gốc?
✓ Hóa đơn khớp XML?
✓ Có dấu xác thực/chữ ký?
```

Nếu lỗi → **KIỂM SOÁT CHẶT, yêu cầu cung cấp**

**Bước 5: Tổng hợp kết luận**
```
- Lỗi nặng: Từ chối tạm thời toàn bộ
- Lỗi nhẹ: Từ chối bộ + yêu cầu sửa
- Không lỗi: Chuyển sang kiểm tra chuyên môn
```

---

## 6. Bảng tra cứu rule hành chính

| Rule | Lỗi | Mức độ | Xử lý |
|------|-----|--------|-------|
| XMLn-REQ-* | Thiếu trường bắt buộc | NẶNG | Từ chối tạm |
| HC_246 | Định dạng ngày sai | NẶNG | Từ chối tạm |
| GB_47 | NGAY_RA < NGAY_VAO | NẶNG | Từ chối tạm |
| HC_43 | Giờ ra < giờ vào | NẶNG | Từ chối tạm |
| HC_130 | Số ngày lệch | TRUNG | Kiểm soát |
| GB_75 | Nằm < 4 giờ | TRUNG | Kiểm soát |
| HC_171 | Nội trú không XML5 | TRUNG | Kiểm soát |
| HC_210 | Thời gian khám 0 phút | NHẸ | Cảnh báo |
| CLN-CHI-01 | Chênh lệch tiền | TRUNG | Kiểm soát |
| HD_10 | Thiếu chỉ số BT | NHẸ | Cảnh báo |

---

## 7. Bài học cho AI

### Quy tắc "Từ chối tạm thời"

**Khi nào:**
- Dữ liệu thiếu/sai nhưng có thể sửa
- Khớp chiếu lệch nhưng có giải thích
- Cần bệnh viện cung cấp thêm tài liệu

**Xử lý:**
- Ghi rõ **chính xác lỗi nào**
- Yêu cầu bệnh viện trong **15 ngày**
- Nếu bệnh viện lâu quá → chuyển **XUẤT TOÁN vĩnh viễn**

### Quy tắc "Từ chối vĩnh viễn"

**Khi nào:**
- Lỗi quá nặng (logic không có cách sửa)
- Bệnh viện không giải thích được
- Xác định gian lận

**Xử lý:**
- **XUẤT TOÁN** phần có lỗi
- Báo cáo cơ quan chức năng nếu là gian lận

---

## 8. Prompt học tập

### Prompt 1: Phát hiện lỗi hành chính
```
"Hồ sơ 000589 có NGAY_VAO = 2026-03-08 08:00, NGAY_RA = 2026-03-06 10:00.
Cái gì sai? Đây là lỗi gì? Xử lý thế nào?"
```

### Prompt 2: Kiểm tra khớp chiếu
```
"XML1.T_THUOC = 12.864.000đ, XML2_TONG = 4.932.000đ
Chênh lệch là bao nhiêu %? Nên từ chối tạm hay xuất toán?"
```

### Prompt 3: Soạn quyết định hành chính
```
"Soạn quyết định từ chối tạm thời do lỗi hành chính,
bao gồm: Lỗi, Căn cứ, Yêu cầu bệnh viện, Hạn chế"
```

---

## 9. Ghi chú cuối

- **Hành chính là lớp chắn đầu tiên** - phải kiểm tra kỹ trước khi vào chuyên môn
- **Lỗi hành chính có thể sửa được** - nên từ chối tạm thời, không ngay xuất toán
- **Từ chối tạm thời phải có thời gian** - 15-30 ngày, rõ ràng yêu cầu
- **Nếu bệnh viện quá hạn** - chuyển xuất toán
- **Lỗi hành chính lặp lại** - báo cáo, có dấu hiệu không chuyên nghiệp
