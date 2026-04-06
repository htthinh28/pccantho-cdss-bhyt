# CA HUẤN LUYỆN MẪU 403538 - THUOC_345 - MOGASTIC 80

Phiên bản tài liệu: 1.0  
Ngày cập nhật: 05/04/2026

## 1. Mục tiêu

Ca này dùng để huấn luyện AI cách đi từ audit JSON sang XML thật, rồi rút ra kết luận nghiệp vụ về sai chỉ định thuốc.

Trọng tâm của ca:

- rule `THUOC_345`
- thuốc `Mogastic 80` mã `40.750`
- đối chiếu chẩn đoán XML1 với dòng thuốc XML2

## 2. Nguồn dữ liệu

- Audit: `test_xml/audit_403538_20260405_145119.json`
- XML gốc: `tai_nguyen/xml/QD130_94170_202603_202603191106_PC-022505334.xml`
- Seed rule: `ma_nguon/tien_ich/du_lieu_luat_thuoc_muc8.jsx`

Điểm mạnh của ca này:

- khác với ca `000434`, ca này có XML thật ngay trong repo nên có thể kiểm tra trực tiếp dữ liệu nguồn.

## 3. Tóm tắt hồ sơ

- `MA_LK`: `403538`
- Hồ sơ điều trị nội trú
- Tổng cảnh báo trong audit: `47`
- Các nhóm vấn đề lớn trong hồ sơ:
  - lỗi cấu trúc/thời gian XML3 và XML5
  - lỗi thuốc `THUOC_345`
  - `XML_121` trong toàn hồ sơ

Ca này không dùng để dạy AI sửa toàn bộ hồ sơ. Ca này chỉ dùng để dạy một nhánh suy luận rõ ràng: **thuốc bị sai chỉ định thanh toán theo chẩn đoán**.

## 4. Rule đích cần huấn luyện

### 4.1. Định nghĩa rule

- Mã rule: `THUOC_345`
- Tên rule: `[Simethicon] Kiểm tra Chỉ định ICD-10`
- Điều kiện:

`XML2.MA_THUOC == '40.750' AND XML1.MA_BENH_CHINH NOT IN ('R14') AND XML1.MA_BENH_KT NOT LIKE '%R14%' AND XML1.CHAN_DOAN_RV NOT REGEXP '(?i)(ĐẦY HƠI|CHƯỚNG BỤNG)'`

- Cảnh báo seed:

`⛔ [XUẤT TOÁN]: Thuốc Simecol chỉ được thanh toán cho chẩn đoán Đầy hơi, trướng bụng (R14).`

### 4.2. Ý nghĩa nghiệp vụ

- Rule này không kiểm tra liều hay số lượng.
- Rule này kiểm tra **căn cứ thanh toán** của Simethicon.
- Nếu hồ sơ không có `R14` hoặc mô tả tương đương như `đầy hơi`, `chướng bụng`, thì thuốc có nguy cơ bị xuất toán.

## 5. Dữ liệu thật đã xác nhận từ XML1

Từ XML gốc, đã xác nhận:

- `MA_BENH_CHINH = E87.1`
- `MA_BENH_KT = K21;K30;K59.0;E83.5;I25;I10;G40.9`

Chẩn đoán ra viện có các nội dung nổi bật:

- giảm áp suất thẩm thấu và giảm Na máu
- bệnh trào ngược dạ dày - thực quản
- khó tiêu chức năng
- táo bón
- rối loạn chuyển hóa calci
- thiếu calci
- bệnh tim thiếu máu cục bộ mạn
- bệnh lý tăng huyết áp
- động kinh không đặc hiệu

Điểm AI phải nhìn ra:

- hồ sơ có `K30` và mô tả `khó tiêu chức năng`
- nhưng **không thấy `R14`**
- cũng **không thấy cụm `đầy hơi` hay `chướng bụng`** trong dữ liệu đã xác nhận

## 6. Dữ liệu thật đã xác nhận từ XML2

Trong XML2 có ít nhất 2 dòng `Mogastic 80` mã `40.750`.

### Dòng 1

- `STT = 3`
- `TEN_THUOC = Mogastic 80`
- `DON_VI_TINH = Viên`
- `SO_LUONG = 4`
- `LIEU_DUNG = Ngày Uống 2 lần, mỗi lần 2 viên (buổi sáng, buổi chiều)`
- `NGAY_YL = 202603170722`

### Dòng 2

- `STT = 5`
- `TEN_THUOC = Mogastic 80`
- `DON_VI_TINH = Viên`
- `SO_LUONG = 2`
- `LIEU_DUNG = Ngày Uống 2 lần, mỗi lần 1 viên (buổi sáng, buổi chiều)`
- `NGAY_YL = 202603180800`

Điểm AI phải nhìn ra:

- đây là 2 dòng thuốc ở 2 ngày y lệnh khác nhau
- audit đánh `THUOC_345` cho cả 2 dòng là hợp logic nếu cả hai cùng thiếu căn cứ chỉ định `R14`

## 7. Kết quả audit thực tế

Audit ghi nhận:

- `THUOC_345`: `2` lần
- Cảnh báo thực tế:

`⛔ [XUẤT TOÁN]: Thuốc Simecol chỉ được thanh toán cho chẩn đoán Đầy hơi, trướng bụng (R14). Chi tiết thuốc: [40.750] Mogastic 80.`

Điểm cần nhấn mạnh cho AI:

- audit và XML thật đang khớp nhau về mặt logic
- đây không phải ca chỉ có template cảnh báo mà đã có đủ dữ liệu nguồn để đối chiếu

## 8. Kết luận mẫu mà AI nên rút ra

Kết luận chuẩn cho ca này nên là:

1. Hồ sơ `403538` có 2 dòng `Mogastic 80` tại XML2.
2. Rule `THUOC_345` yêu cầu hồ sơ phải có `R14` hoặc mô tả đầy hơi/chướng bụng mới đủ căn cứ thanh toán.
3. Dữ liệu XML1 đã xác nhận không có `R14`, cũng chưa thấy mô tả đầy hơi/chướng bụng trong chẩn đoán đã đọc được.
4. Vì vậy, việc audit đánh `THUOC_345` cho 2 dòng `Mogastic 80` là có căn cứ.
5. Đây là lỗi **sai chỉ định thanh toán**, không phải lỗi liều hay cấp dư.

## 9. Điều AI không được kết luận quá mức

AI không nên tự khẳng định:

- thuốc này chắc chắn sai chuyên môn điều trị
- hoặc `XML_121` của hồ sơ chắc chắn do `Mogastic 80`

Lý do:

- `THUOC_345` chỉ kết luận về **điều kiện thanh toán theo rule hiện hành**
- `XML_121` là tín hiệu ở mức toàn hồ sơ, chưa đủ dữ liệu để chốt nó gắn với Mogastic nếu chưa rà hết toàn bộ XML2 theo ngày

## 10. Dữ liệu cần kiểm tra thêm nếu muốn đi sâu hơn

Nếu muốn nâng ca này từ mức huấn luyện cơ bản lên mức phân tích sâu, AI nên kiểm tra thêm:

- toàn bộ các dòng XML2 của hồ sơ để xác định nguồn gốc `XML_121`
- diễn biến lâm sàng hoặc ghi chú bệnh án xem có mô tả đầy hơi/chướng bụng ngoài các trường đã đọc hay không
- khả năng bệnh viện dùng Simethicon cho triệu chứng khó tiêu nhưng rule hiện hành chỉ chấp nhận `R14`

## 11. Bài học huấn luyện cho AI

### 11.1. Bài học nghiệp vụ

- Một thuốc có thể hợp lý về mặt điều trị nhưng vẫn không đủ căn cứ thanh toán theo rule BHYT hiện hành.
- Khi đánh sai chỉ định, AI phải nói rõ đó là vấn đề thanh toán, không tự động đồng nghĩa với sai chuyên môn.

### 11.2. Bài học kỹ thuật

- Nếu XML gốc có sẵn trong repo, AI phải ưu tiên đối chiếu lại XML thay vì chỉ tóm tắt audit JSON.
- Với rule chỉ định ICD-10, cần đọc ít nhất 3 trường:
  - `MA_BENH_CHINH`
  - `MA_BENH_KT`
  - `CHAN_DOAN_RV`

### 11.3. Bài học quy trình

- Trình tự phân tích đúng cho ca này là:
  1. đọc rule seed
  2. đọc cảnh báo audit
  3. đọc XML1 để kiểm tra chẩn đoán
  4. đọc XML2 để xác nhận dòng thuốc thực tế
  5. mới kết luận

## 12. Prompt gợi ý để luyện AI với ca này

- `/Mo Phong Ca Giam Dinh BHYT Ho so 403538, doi chieu audit_403538_20260405_145119.json va XML goc, tap trung THUOC_345`
- `/Phan Tich XML BHYT Theo Ho So MA_LK 403538, kiem tra Mogastic 80 va can cu thanh toan theo THUOC_345`
- `/Trich Xuat The Tri Thuc Giam Dinh Rut ra 1 the tri thuc tu ca 403538 cho nhom rule chi dinh thuoc theo ICD-10`

## 13. Kết luận

Ca `403538` là ca huấn luyện tốt cho mức trung cấp vì có cả audit và XML thật, giúp AI học được cách:

- nối rule seed với dữ liệu nguồn
- phân biệt sai chỉ định thanh toán với sai chuyên môn điều trị
- tránh kết luận quá mức khi tín hiệu phụ như `XML_121` chưa được kiểm tra hết