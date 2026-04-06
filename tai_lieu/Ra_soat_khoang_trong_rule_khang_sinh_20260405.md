# RÀ SOÁT KHOẢNG TRỐNG RULE KHÁNG SINH

Phiên bản tài liệu: 1.1  
Ngày cập nhật: 06/04/2026

## 1. Mục tiêu

Tài liệu này tổng hợp các khoảng trống độ phủ của rule kháng sinh trong repo, dựa trên:

- bộ nguồn chuyên môn đã chốt
- kết quả quét `216` dòng kháng sinh từ XML thật
- ba audit đại diện mới sinh
- điều kiện seed và các ngoại lệ đang chạy trong engine

## 2. Kết luận tổng quan

Rule kháng sinh hiện tại có xu hướng:

- phủ khá tốt một số `mã thuốc rất cụ thể`
- nhưng chưa phủ đều theo `nhóm hoạt chất`, `bối cảnh phẫu thuật`, `nhóm bệnh`, và `chuẩn hóa đơn vị`

Điều này tạo ra 3 kiểu rủi ro:

1. `lọt cảnh báo` ở các ca dự phòng hợp lệ hoặc cần kiểm chứng thêm
2. `false positive` vì rule chỉ định quá hẹp so với bối cảnh lâm sàng thật
3. `false positive kỹ thuật` do so sánh khác đơn vị

## 3. Các khoảng trống chính

### 3.1. Khoảng trống 1 - Cefazolin dự phòng vẫn phụ thuộc ICD quá nặng

Quan sát từ dữ liệu thật:

- nhóm `tiem_or_truyen | co_the_du_phong` có `38` dòng kháng sinh
- rất nhiều ca là `Biofazolin/Cefazolin` trong sản khoa, phụ khoa, thủ thuật
- các ca như `403521` và `000339` cho thấy bối cảnh dự phòng rõ, nhưng audit không nhất thiết phát sinh cảnh báo thuốc tương ứng

Rule hiện có:

- `THUOC_84`
- `THUOC_85`
- `THUOC_393`

Điểm thiếu:

- `THUOC_85` chủ yếu đọc `ICD` và chuỗi `DỰ PHÒNG NHIỄM TRÙNG`
- chưa mô hình hóa đủ bối cảnh `MA_PTTT_QT`, DVKT mổ/thủ thuật, hoặc XML5/diễn biến hậu phẫu

Khuyến nghị:

1. thêm tầng nhận diện `dự phòng phẫu thuật` từ `MA_PTTT_QT` và XML3
2. không chỉ phụ thuộc `Z29.2` hoặc text trong chẩn đoán ra viện
3. giữ cơ chế lọc dương tính giả theo ngữ cảnh như engine đã làm với `THUOC_85`, nhưng bổ sung dữ liệu đầu vào để cảnh báo có ý nghĩa hơn

### 3.2. Khoảng trống 2 - Amoxicillin/Clavulanate người lớn ngoại trú có nguy cơ rule quá hẹp

Quan sát từ dữ liệu thật:

- nhóm `uong | co_the_dieu_tri` có `69` dòng
- `Cepmox-Clav 875/125` xuất hiện nhiều trong tai mũi họng, da mô mềm, tiết niệu, phụ khoa
- trước khi sửa, ca `OP26000908` bị `THUOC_41` dù có `H66.9` viêm tai giữa không đặc hiệu

Rule hiện có:

- `THUOC_40`: chống chỉ định
- `THUOC_41`: chỉ định ICD-10
- `THUOC_42`: liều tối đa nhi

Tình trạng hiện tại sau kiểm thử ngày `06/04/2026`:

- `THUOC_41` đã được mở rộng để nhận `H66` và chuỗi `viêm tai giữa`
- audit `OP26000908` giảm từ `11` xuống `10` cảnh báo, không còn `THUOC_41`

Điểm còn thiếu:

- `THUOC_41` chỉ cho `J01`, `J03`, `J06`, `J15`, `J20`, `L01`
- chưa phản ánh tốt một số bối cảnh tai mũi họng thực tế như `viêm tai giữa`
- phần liều đang mạnh về nhi khoa, nhưng chưa có lớp giải thích hoặc kiểm tra thêm cho người lớn ngoại trú

Khuyến nghị tiếp theo:

1. tiếp tục rà phạm vi chỉ định thanh toán với nhóm tai mũi họng khác ngoài `H66`
2. nếu nghiệp vụ xác nhận phù hợp, mở tiếp nhóm ICD hoặc regex lân cận theo tài liệu chỉ định hợp lệ tại khoản 3 Điều 8 TT 37/2024
3. giữ tách bạch giữa `chỉ định lâm sàng`, `chống chỉ định`, `liều/tần suất`, và `điều kiện thanh toán BHYT`

### 3.3. Khoảng trống 3 - Chưa có lớp rule đủ rõ cho Cefotaxime điều trị tiêm

Quan sát từ dữ liệu thật:

- nhóm `tiem_or_truyen | co_the_dieu_tri` có `64` dòng
- `Tenamyd-Cefotaxime 1000` xuất hiện lặp nhiều ở các ca `000434`, `000589`, `000393`

Điểm đáng chú ý:

- trong ca `000589`, cảnh báo nổi bật cho Cefotaxime lại là `THUOC_391` về lệch số lượng
- chưa thấy cụm seed rõ ràng cho `Cefotaxime` tương ứng với tần suất xuất hiện trong dữ liệu thật

Khuyến nghị:

1. bổ sung cụm rule riêng cho `Cefotaxime` hoặc nhóm Cephalosporin điều trị tiêm
2. tối thiểu có các lớp:
   - kiểm tra chỉ định cơ bản
   - kiểm tra liều/ngày nếu đủ dữ liệu
   - kiểm tra nhất quán y lệnh sau khi chuẩn hóa đơn vị

### 3.4. Khoảng trống 4 - Rule `THUOC_391` có nguy cơ false positive do lệch đơn vị

Chứng cứ trực tiếp ban đầu:

- ca `000589` từng bị cảnh báo `SO_LUONG = 3 < y lệnh 1650`
- `1650` ở đây rõ ràng là `mg/ngày`, không phải `lọ/ngày`

Nguyên nhân gốc:

- rule cũ so sánh:
  - `XML2.SO_LUONG`
  - với `XML2.SL_MOI_NGAY * XML2.SO_NGAY`
- nhưng chưa chắc hai vế đã cùng một đơn vị đo

Tình trạng hiện tại sau kiểm thử ngày `06/04/2026`:

- engine đã bổ sung chặn ngữ cảnh khi `SO_LUONG` nhỏ hơn cả `hàm lượng một đơn vị` sau quy đổi
- với ca `000589`, `THUOC_391` đã rơi khỏi audit, tổng cảnh báo giảm từ `8` xuống `6`
- cảnh báo còn lại tập trung vào `DOMUVAR`, hành chính, và trùng thuốc cùng ngày

Khuyến nghị tiếp theo:

1. chuẩn hóa thêm các trường hợp `hàm lượng phức hợp` hoặc `đơn vị không chuẩn` ngoài mẫu `1g`, `500mg`, `5ml`
2. cân nhắc thêm thông tin giải trình để nêu rõ lý do bỏ `THUOC_391` khi gặp dữ liệu tự mâu thuẫn
3. tiếp tục sửa tại gốc logic so sánh, không tắt hàng loạt `THUOC_391`

### 3.5. Khoảng trống 5 - Chưa có lớp tri thức hệ thống cho kháng sinh trẻ em ngoài Amoxiclav

Quan sát từ seed:

- đã có logic nhi khoa cho `Amoxicillin/Clavulanate`
- nhưng chưa thấy một lớp chuẩn hóa đủ rộng cho `kháng sinh trẻ em` ở mức hệ thống

Khuyến nghị:

1. thêm bộ tri thức hoặc helper dùng chung cho ca nhi khoa:
   - đọc cân nặng
   - quy đổi mg/kg/ngày
   - kiểm tra tần suất theo tuổi
   - chặn trần liều tối đa
2. không chỉ đóng ở mức từng mã thuốc riêng lẻ

### 3.6. Khoảng trống 6 - Thiếu lớp rule rõ cho Ciprofloxacin đường uống

Quan sát từ dữ liệu thật:

- có các ca `Ciprofloxacin` đường uống trong tiết niệu và phụ khoa, ví dụ `OP26001050`
- nhưng trong cụm seed vừa rà chưa thấy lớp rule nổi bật tương xứng

Khuyến nghị:

1. rà xem repo có rule ở file khác hay không; nếu chưa có, nên bổ sung theo nhóm chỉ định thực tế
2. với ca trẻ em, cần lớp kiểm soát chặt hơn do đây là nhóm thuốc nhạy cảm hơn trong nhi khoa

## 4. Điểm đặc biệt trong engine hiện tại

Trong `dong_co_giam_dinh.jsx`, engine đã có một số lọc ngữ cảnh hữu ích, ví dụ:

- bỏ `THUOC_85` khi đã nhận ra có phẫu thuật hoặc thủ thuật
- bỏ `THUOC_342` trong bối cảnh thai kỳ hoặc sản khoa

Điều này cho thấy hướng sửa đúng là:

- tăng cường `mô hình hóa ngữ cảnh`
- không chỉ thêm nhiều ICD cứng hơn

## 5. Thứ tự ưu tiên đề xuất nếu sửa rule

1. Mở rộng nhận diện `Cefazolin dự phòng` theo bối cảnh phẫu thuật/thủ thuật.
2. Bổ sung cụm rule rõ hơn cho `Cefotaxime` điều trị tiêm.
3. Bổ sung lớp tri thức và kiểm soát cho kháng sinh trẻ em dùng chung.
4. Rà tiếp các nhóm chỉ định tai mũi họng ngoài `H66` cho `Amoxicillin/Clavulanate`.
5. Chuẩn hóa thêm các ca kê đơn/y lệnh có đơn vị phức hợp.

## 6. Kết luận

Kho XML thật cho thấy hệ thống đã có nhiều nền tảng tốt, nhưng độ phủ rule kháng sinh hiện vẫn còn lệch giữa:

- `nhóm thuốc được seed sâu`
- và `nhóm thuốc xuất hiện thật trong hồ sơ`

Nếu muốn AI hỗ trợ giám định kháng sinh tốt hơn, cần kết hợp 3 hướng cùng lúc:

1. làm giàu tri thức pháp lý và nhi khoa
2. tăng độ phủ rule theo dữ liệu thật
3. sửa các điểm so sánh kỹ thuật dễ gây dương tính giả