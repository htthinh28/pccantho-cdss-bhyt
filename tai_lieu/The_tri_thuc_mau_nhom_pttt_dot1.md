# THẺ TRI THỨC MẪU NHÓM PTTT ĐỢT 1

Phiên bản tài liệu: 1.0  
Ngày cập nhật: 05/04/2026

## 1. Mục tiêu

Đây là đợt huấn luyện trọn gói đầu tiên cho nhóm `PTTT`, lấy dữ liệu từ một hồ sơ XML thật trong repo và các rule built-in/seed đang chạy.

Mục tiêu của đợt này là dạy AI cách nối:

- XML1
- XML3
- XML5
- built-in PTTT trong động cơ giám định
- seed PTTT mức 11

## 2. Nguồn tri thức

- `ma_nguon/quy_tac/luat_pttt.jsx`
- `ma_nguon/tien_ich/dong_co_giam_dinh.jsx`
- `ma_nguon/tien_ich/du_lieu_luat_pttt_muc11.jsx`
- audit hồ sơ `403244`

## 3. Thẻ tri thức mẫu đợt 1

---

## Thẻ P1. XML1 phải khai MA_PTTT_QT khi hồ sơ có PTTT

### 1. Thông tin chung

- Chủ đề: liên kết XML1 với XML3 cho PTTT
- Rule tiêu biểu: `CLN-PTTT-02`
- Nguồn: built-in PTTT

### 2. Mệnh đề nghiệp vụ cốt lõi

- Nếu XML3 có dòng PTTT nhưng XML1 chưa khai `MA_PTTT_QT`, hồ sơ thiếu một trường điều phối quan trọng ở cấp hồ sơ.

### 3. Dữ liệu cần kiểm tra

- `XML1.MA_PTTT_QT`
- các dòng PTTT trong `XML3`

### 4. Cách suy luận đúng

- Đây là lỗi liên kết dữ liệu ở mức hồ sơ, không phải lỗi riêng của từng dòng XML3.

---

## Thẻ P2. Dòng PTTT ở XML3 phải có MA_PTTT_QT

### 1. Thông tin chung

- Chủ đề: tính đầy đủ dữ liệu trên dòng PTTT
- Rule tiêu biểu: `CLN-PTTT-05`
- Nguồn: built-in PTTT

### 2. Mệnh đề nghiệp vụ cốt lõi

- Khi một dịch vụ đã được xác định là PTTT, dòng XML3 tương ứng phải khai `MA_PTTT_QT` để phục vụ đối chiếu và thanh toán.

### 3. Dữ liệu cần kiểm tra

- `XML3.MA_DICH_VU`
- `XML3.MA_PTTT_QT`
- `XML1.MA_PTTT_QT`

### 4. Cách suy luận đúng

- Nếu cả XML1 và XML3 đều trống `MA_PTTT_QT` thì đây là thiếu dữ liệu đồng thời ở 2 tầng.

---

## Thẻ P3. XML5 phải có tóm tắt phẫu thuật/thủ thuật

### 1. Thông tin chung

- Chủ đề: chứng từ tóm tắt PTTT
- Rule tiêu biểu: `CLN-PTTT-13`
- Nguồn: built-in PTTT

### 2. Mệnh đề nghiệp vụ cốt lõi

- Khi XML3 có PTTT, XML5 phải có nội dung `PHAU_THUAT` hoặc tóm tắt tương đương để chứng minh quá trình thực hiện.

### 3. Dữ liệu cần kiểm tra

- sự tồn tại của dòng PTTT trong `XML3`
- nội dung `PHAU_THUAT` ở `XML5`

### 4. Cách suy luận đúng

- Đây là lớp chứng cứ hồ sơ. Thiếu chứng cứ không nhất thiết luôn đồng nghĩa với không thực hiện, nhưng làm suy yếu căn cứ thanh toán rõ rệt.

---

## Thẻ P4. Nội soi đại trực tràng gây mê cần tối thiểu 2 nhân sự

### 1. Thông tin chung

- Chủ đề: nhân sự tối thiểu cho DVKT có gây mê
- Rule tiêu biểu: `DVKT_0259`
- Nguồn: seed PTTT mức 11

### 2. Mệnh đề nghiệp vụ cốt lõi

- Dịch vụ `02.0261.0319` cần tối thiểu 2 nhân viên để phản ánh nội soi và gây mê an toàn.

### 3. Dữ liệu cần kiểm tra

- `XML3.MA_DICH_VU`
- số nhân sự ở `XML4.MA_NV`
- nhân sự ghi ở XML3 để đối chiếu logic

### 4. Cách suy luận đúng

- Nếu không đủ nhân sự ở bảng liên quan, phải xem đây là thiếu chứng cứ thực hiện đúng quy trình kỹ thuật.

---

## Thẻ P5. Vật tư/hóa chất phải đi cùng một số DVKT

### 1. Thông tin chung

- Chủ đề: chứng cứ vật tư đi kèm xét nghiệm/dịch vụ
- Rule tiêu biểu (vẫn trong seed): `DVKT_0259` — **Lưu ý (04/2026):** toàn bộ nhóm quy tắc dạng **Thực hiện -** kết hợp `COUNT_IF(DS_XML5, …)` (trong đó có các mã như CBC laser, TSH…) đã **gỡ khỏi** `du_lieu_luat_pttt_muc11.jsx` để giảm dương tính giả; khi huấn luyện AI, không trích dẫn các mã đó như còn hiệu lực.
- Nguồn: seed PTTT mức 11

### 2. Mệnh đề nghiệp vụ cốt lõi

- Một số DVKT chỉ được thanh toán chắc chắn khi XML5 có vật tư, hóa chất hoặc vật phẩm tiêu hao tương ứng.

### 3. Dữ liệu cần kiểm tra

- `XML3.MA_DICH_VU`
- `DS_XML5.TEN_VAT_TU`

### 4. Cách suy luận đúng

- Đây là kiểu rule kiểm tra bằng chứng thực hiện, không chỉ kiểm tra “có chỉ định hay không”.

## 4. Kết luận huấn luyện đợt PTTT 1

AI cần học rằng nhóm PTTT thường không chỉ xoay quanh chẩn đoán, mà còn xoay quanh:

- mã hóa PTTT đúng ở nhiều bảng
- nhân sự tham gia
- chứng cứ thực hiện
- vật tư/hóa chất đi kèm

Đây là lớp tri thức rất phù hợp để nâng AI từ đọc thuốc sang đọc chứng từ kỹ thuật và quy trình thực hiện.