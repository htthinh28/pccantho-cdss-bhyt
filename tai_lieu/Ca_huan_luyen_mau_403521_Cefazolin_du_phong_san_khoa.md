# CA HUẤN LUYỆN MẪU 403521 - CEFAZOLIN DỰ PHÒNG SẢN KHOA

Phiên bản tài liệu: 1.0  
Ngày cập nhật: 05/04/2026

## 1. Mục tiêu

Ca này được tạo để nối trực tiếp đợt 4 kháng sinh với một hồ sơ XML thật trong repo. Đây không phải ca “bị đánh rule thuốc rõ ràng”, mà là ca dùng để dạy AI cách kiểm chứng độ phủ rule và nhận diện khả năng false negative hoặc thiếu mô hình hóa bối cảnh.

## 2. Nguồn dữ liệu

- XML gốc: `tai_nguyen/xml/QD130_94170_202603_202603201530_PC-022601440.xml`
- Audit hiện tại: `test_xml/audit_403521_20260405_225230.json`
- Seed rule liên quan:
  - `THUOC_84`
  - `THUOC_85`
  - `THUOC_393`

## 3. Bối cảnh hồ sơ

- `MA_LK`: `403521`
- Chẩn đoán chính: `O34.2`
- Chẩn đoán vào viện: thai lần 2, thai 37 tuần, ngôi đầu, theo dõi đau vết mổ cũ, báo chuyển dạ
- Chẩn đoán ra viện có nội dung:
  - con lần 2, thai 37 1/7 tuần, chuyển dạ sanh/đau vết mổ cũ
  - chăm sóc bà mẹ vì tử cung có sẹo mổ trước đó
- `MA_PTTT_QT = 74.1`
- Loại KCB: nội trú

Điểm quan trọng:

- Hồ sơ là bối cảnh sản khoa có can thiệp phẫu thuật/thủ thuật.
- Đây là môi trường rất dễ phát sinh Cefazolin với vai trò dự phòng nhiễm trùng quanh mổ.

## 4. Dữ liệu thật đã xác nhận từ XML2

Trong XML2 có dòng thuốc:

- `MA_THUOC = 40.166`
- `TEN_THUOC = Biofazolin`
- `DON_VI_TINH = Lọ`
- `HAM_LUONG = 1g`
- `LIEU_DUNG = Ngày Tiêm mạch chậm 1 lần, mỗi lần 2 lọ (buổi sáng)`
- `SO_LUONG = 2`
- `NGAY_YL = 202603170700`

Diễn giải nhanh:

- Tổng lượng thuốc theo dòng này là `2g/ngày`.
- Mức này nằm dưới ngưỡng `6g/ngày` của seed `THUOC_393`.

## 5. Seed rule liên quan và cách đọc

### 5.1. `THUOC_84` - chống chỉ định dị ứng Cephalosporin

- Điều kiện: có `Z88.1`
- Dữ liệu hồ sơ hiện thấy: không có `Z88.1`

Kết luận:

- Hiện không có căn cứ để đánh `THUOC_84`.

### 5.2. `THUOC_393` - tổng liều Cefazolin 24 giờ

- Điều kiện: `(XML2.SO_LUONG * 2) > 6`
- Dòng thực tế: `2 lọ x 1g`, tương ứng `2g/ngày`

Kết luận:

- Hiện không có căn cứ để đánh `THUOC_393`.

### 5.3. `THUOC_85` - kiểm tra chỉ định hoặc dự phòng phẫu thuật

Seed hiện hành yêu cầu một trong các căn cứ sau:

- `J15`
- `L01`
- `M86`
- `Z29.2`
- hoặc mô tả `DỰ PHÒNG NHIỄM TRÙNG`

Dữ liệu hồ sơ đã xác nhận:

- không có `J15`, `L01`, `M86`, `Z29.2`
- không thấy cụm `dự phòng nhiễm trùng` trong chẩn đoán đã đọc
- nhưng có `MA_PTTT_QT = 74.1` và bối cảnh sản khoa/mổ lấy thai lặp lại

## 6. Kết quả audit hiện tại

Audit mới sinh cho cùng hồ sơ có `8` cảnh báo, nhưng không có cảnh báo `THUOC_*`. Các cảnh báo tập trung vào:

- `PTTT_BUILTIN`
- `PTTT_SEED`
- hành chính và JCI

Điểm AI phải nhìn ra:

- dữ liệu hồ sơ có kháng sinh Cefazolin thật
- seed rule về Cefazolin có tồn tại trong repo
- nhưng lượt audit này không phát sinh cảnh báo thuốc tương ứng

## 7. Kết luận huấn luyện mẫu

Kết luận đúng cho ca này không nên là “rule đánh sai” hoặc “hệ thống chắc chắn lỗi”. Kết luận chuẩn nên là:

1. Hồ sơ `403521` có Cefazolin thật trong bối cảnh phẫu thuật/sản khoa.
2. `THUOC_84` và `THUOC_393` hiện không có căn cứ để phát sinh cảnh báo.
3. `THUOC_85` là điểm cần kiểm chứng thêm vì seed hiện hành chủ yếu nhìn ICD-10/dòng chữ dự phòng, trong khi hồ sơ lại thể hiện bối cảnh dự phòng qua `MA_PTTT_QT` và dịch vụ phẫu thuật.
4. Audit hiện tại chưa phát sinh cảnh báo thuốc, nên đây là một ca thích hợp để huấn luyện AI theo hướng kiểm tra độ phủ rule hoặc khả năng false negative.

## 8. Điều AI cần đề xuất kiểm tra thêm

Khi gặp ca này, AI nên đề xuất kiểm tra:

1. XML3 có dịch vụ phẫu thuật nào gắn trực tiếp với mổ lấy thai và thời điểm dùng Cefazolin hay không.
2. Quy ước nội bộ hiện tại của rule engine có coi bối cảnh `MA_PTTT_QT` hoặc DVKT mổ là đủ để xem như dự phòng phẫu thuật không.
3. Có cần mở rộng `THUOC_85` để nhận biết bối cảnh dự phòng trong sản khoa/phẫu thuật thay vì chỉ đọc ICD-10 và chuỗi văn bản hay không.

## 9. Bài học huấn luyện cho AI

### 9.1. Bài học nghiệp vụ

- Không phải ca thuốc nào cũng là “đánh đúng” hoặc “đánh sai” ngay lập tức.
- Có những ca dùng để kiểm chứng xem rule hiện tại đã phủ đúng bối cảnh điều trị thực tế chưa.

### 9.2. Bài học kỹ thuật

- Nếu seed rule đọc chủ yếu từ `XML1`, còn bối cảnh dự phòng nằm ở `XML3` hoặc `MA_PTTT_QT`, AI phải cảnh giác với khoảng trống logic.

### 9.3. Bài học quy trình

- Trình tự đúng với ca này:
  1. đọc XML1 để lấy chẩn đoán và bối cảnh sản khoa
  2. đọc XML2 để xác nhận Cefazolin và liều thực tế
  3. đối chiếu seed rule liên quan
  4. đọc audit hiện tại
  5. kết luận xem đây là ca bình thường, false negative hay cần xác minh thêm

## 10. Giá trị của ca này trong bộ huấn luyện

Ca `403521` rất hữu ích vì nó dạy AI một kỹ năng khó hơn mức cơ bản:

- không chỉ đọc rule đã bắn ra
- mà còn biết nghi ngờ những chỗ rule có thể chưa phủ hết bối cảnh lâm sàng - phẫu thuật

Đây là loại ca cần có trong bộ huấn luyện nếu muốn AI sau này hỗ trợ tốt việc rà soát false negative.