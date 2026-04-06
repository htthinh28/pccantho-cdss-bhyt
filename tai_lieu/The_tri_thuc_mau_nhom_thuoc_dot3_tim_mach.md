# THẺ TRI THỨC MẪU NHÓM THUỐC ĐỢT 3 - TIM MẠCH

Phiên bản tài liệu: 1.0  
Ngày cập nhật: 05/04/2026

## 1. Mục đích

Đợt 3 tập trung vào nhóm thuốc tim mạch và các cảnh báo an toàn tim mạch thường gặp, nhằm dạy AI cách tách bốn lớp suy luận khác nhau:

- chống chỉ định lâm sàng
- chỉ định thanh toán theo ICD-10
- liều tối đa trong 24 giờ
- tần suất dùng thuốc chuẩn

## 2. Nguồn tri thức

- `ma_nguon/tien_ich/du_lieu_luat_thuoc_muc8.jsx`
- các seed rule `THUOC_32` đến `THUOC_39`
- `THUOC_272`, `THUOC_273`
- `THUOC_398`

## 3. Thẻ tri thức mẫu đợt 3

---

## Thẻ 13. Amlodipin + valsartan / Wamlox

### 1. Thông tin chung

- Chủ đề: thuốc phối hợp hạ áp Amlodipin + Valsartan
- Nguồn tài liệu: `THUOC_32`, `THUOC_33`, `THUOC_34`
- Mức độ ưu tiên huấn luyện: cao

### 2. Mệnh đề nghiệp vụ cốt lõi

- Thuốc phối hợp này chỉ phù hợp khi có căn cứ tăng huyết áp.
- Ngoài chỉ định, hệ thống còn kiểm tra chống chỉ định thai kỳ, suy thận nặng, suy gan nặng và tần suất dùng.

### 3. Phạm vi áp dụng

- Điều kiện nhận diện thuốc: `XML2.MA_THUOC == '40.30.501'`
- XML liên quan: `XML1`, `XML2`

### 4. Dữ liệu cần kiểm tra

- `XML1.MA_BENH_CHINH`
- `XML1.MA_BENH_KT`
- `XML1.CHAN_DOAN_RV`
- `CALC_TAN_SUAT`

### 5. Cách suy luận đúng

- Nếu không có `I10` hoặc mô tả tăng huyết áp tương đương thì nguy cơ xuất toán theo chỉ định.
- Nếu có `O21`, `N18.4`, `N18.5`, `K72` thì coi là chống chỉ định theo seed hiện có.
- Nếu dùng quá `1 lần/ngày` thì coi là sai phác đồ.

### 6. Bài học rút ra cho AI

- Thuốc tim mạch phối hợp phải được kiểm tra đồng thời ở cả ba lớp: chỉ định, an toàn, tần suất.
- Không được kết luận chỉ từ tên thuốc hoặc một ICD đơn lẻ.

---

## Thẻ 14. Amlodipine Stella 10 mg

### 1. Thông tin chung

- Chủ đề: Amlodipin đơn trị
- Nguồn tài liệu: `THUOC_35`, `THUOC_36`, `THUOC_39`
- Mức độ ưu tiên huấn luyện: cao

### 2. Mệnh đề nghiệp vụ cốt lõi

- Amlodipin được thanh toán khi có tăng huyết áp hoặc đau thắt ngực.
- Đồng thời phải kiểm tra hạ huyết áp, thai kỳ và giới hạn liều tối đa 10mg/ngày.

### 3. Phạm vi áp dụng

- Điều kiện nhận diện thuốc: `XML2.MA_THUOC == '40.491'`
- XML liên quan: `XML1`, `XML2`

### 4. Dữ liệu cần kiểm tra

- `XML1.MA_BENH_CHINH`
- `XML1.MA_BENH_KT`
- `XML1.CHAN_DOAN_RV`
- `CALC_SL_MOI_NGAY`

### 5. Cách suy luận đúng

- Không có `I10` hoặc `I20` thì nguy cơ xuất toán theo chỉ định.
- Có `I95.1` hoặc `O21` thì coi là chống chỉ định theo seed.
- Nếu lượng dùng quy đổi vượt `10mg/ngày` thì coi là sai liều.

### 6. Bài học rút ra cho AI

- Nhóm chẹn kênh canxi không chỉ là vấn đề chỉ định mà còn rất nhạy với liều tối đa.
- AI cần học cách quy đổi hàm lượng về mg/ngày khi giải thích.

---

## Thẻ 15. Amlodipine + Lisinopril / Lisonorm

### 1. Thông tin chung

- Chủ đề: phối hợp Amlodipine + Lisinopril
- Nguồn tài liệu: `THUOC_37`, `THUOC_38`
- Mức độ ưu tiên huấn luyện: trung bình đến cao

### 2. Mệnh đề nghiệp vụ cốt lõi

- Thuốc chỉ nên thanh toán cho tăng huyết áp vô căn.
- Seed hiện hành xem đây là thuốc cần tránh khi có thai, suy thận/gan nặng hoặc hạ huyết áp.

### 3. Phạm vi áp dụng

- Điều kiện nhận diện thuốc: `XML2.MA_THUOC == '40.30.497'`
- XML liên quan: `XML1`, `XML2`

### 4. Dữ liệu cần kiểm tra

- `XML1.MA_BENH_CHINH`
- `XML1.MA_BENH_KT`
- `XML1.CHAN_DOAN_RV`

### 5. Cách suy luận đúng

- Không có `I10` hoặc mô tả tăng huyết áp tương đương thì có nguy cơ xuất toán.
- Có `O21`, `N18.4`, `N18.5`, `I95.1`, `K72` thì tăng nguy cơ không phù hợp lâm sàng.

### 6. Bài học rút ra cho AI

- Thuốc phối hợp thường đi kèm nhiều điểm loại trừ hơn thuốc đơn trị.
- Khi gặp ACEI/ARB phối hợp, AI phải ưu tiên rà các mã suy thận, thai kỳ và hạ huyết áp.

---

## Thẻ 16. Metoprolol

### 1. Thông tin chung

- Chủ đề: Metoprolol
- Nguồn tài liệu: `THUOC_272`, `THUOC_273`
- Mức độ ưu tiên huấn luyện: cao

### 2. Mệnh đề nghiệp vụ cốt lõi

- Metoprolol được thanh toán khi có tăng huyết áp, đau thắt ngực hoặc suy tim.
- Nếu tần suất dùng vượt thông lệ `2 lần/ngày` thì phải xem lại bối cảnh rối loạn nhịp hoặc chỉ định đặc biệt.

### 3. Phạm vi áp dụng

- Điều kiện nhận diện thuốc: `XML2.MA_THUOC == '40.515'`
- XML liên quan: `XML1`, `XML2`

### 4. Dữ liệu cần kiểm tra

- `XML1.MA_BENH_CHINH`
- `XML1.MA_BENH_KT`
- `XML1.CHAN_DOAN_RV`
- `CALC_TAN_SUAT`

### 5. Cách suy luận đúng

- Không có `I10`, `I20`, `I50` hoặc mô tả tương đương thì nguy cơ xuất toán.
- Nếu `CALC_TAN_SUAT > 2` thì không vội kết luận sai ngay, nhưng phải yêu cầu kiểm tra thêm lý do lâm sàng.

### 6. Bài học rút ra cho AI

- Có những rule là cảnh báo để rà soát, không phải lúc nào cũng là xuất toán ngay.
- AI phải phân biệt rõ `cảnh báo` với `kết luận thanh toán`.

---

## Thẻ 17. Cảnh báo tim mạch do Domperidon

### 1. Thông tin chung

- Chủ đề: Domperidon và nguy cơ kéo dài QT
- Nguồn tài liệu: `THUOC_398`
- Mức độ ưu tiên huấn luyện: cao vì dễ dùng sai trong thực tế

### 2. Mệnh đề nghiệp vụ cốt lõi

- Dù là thuốc tiêu hóa, Domperidon có cảnh báo tim mạch rõ ràng khi liều vượt ngưỡng `30mg/ngày`.

### 3. Phạm vi áp dụng

- Điều kiện nhận diện thuốc: `XML2.MA_THUOC == '40.688'`
- XML liên quan: `XML2`

### 4. Dữ liệu cần kiểm tra

- `XML2.SO_LUONG`
- hàm lượng quy đổi 10mg/đơn vị theo seed hiện hành

### 5. Cách suy luận đúng

- Khi `(XML2.SO_LUONG * 10) > 30` thì phải cảnh báo nguy cơ kéo dài QT và đột tử.
- Rule này thiên về an toàn điều trị, không chỉ là thanh toán BHYT.

### 6. Bài học rút ra cho AI

- Một bộ huấn luyện tốt không nên chia cứng theo chuyên khoa thuốc, mà nên học cả các cảnh báo chéo có giá trị lâm sàng cao.

## 4. Kết luận huấn luyện đợt 3

Đợt 3 nên dạy AI theo chuỗi sau:

1. Nhận diện thuốc tim mạch hoặc thuốc có nguy cơ tim mạch.
2. Tách kiểm tra thành các lớp: chỉ định, chống chỉ định, liều, tần suất.
3. Gắn mỗi kết luận với trường dữ liệu cụ thể ở XML1 và XML2.
4. Khi là `cảnh báo`, không được tự động kết luận xuất toán nếu seed không nói như vậy.

## 5. Bước tiếp theo khuyến nghị

Sau đợt này nên tiếp tục một trong hai hướng:

- nhóm kháng sinh và thuốc hạn chế
- nhóm nội tiết, tiêu hóa và các thuốc dễ bị sai chỉ định thanh toán