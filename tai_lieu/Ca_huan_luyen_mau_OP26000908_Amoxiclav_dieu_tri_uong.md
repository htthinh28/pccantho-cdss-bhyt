# CA HUẤN LUYỆN MẪU OP26000908 - AMOXICLAV ĐIỀU TRỊ UỐNG VÀ NGUY CƠ RULE QUÁ HẸP

Phiên bản tài liệu: 1.1  
Ngày cập nhật: 06/04/2026

## 1. Mục tiêu

Ca này dùng để huấn luyện AI về `kháng sinh điều trị đường uống`, đồng thời dạy AI cách phát hiện một `rule chỉ định BHYT có nguy cơ quá hẹp` so với bối cảnh tai mũi họng thực tế.

## 2. Nguồn dữ liệu

- XML gốc: `tai_nguyen/op/PC022101042_OP26000908.xml`
- Audit trước sửa: `test_xml/audit_OP26000908_20260405_232932.json`
- Audit sau sửa: `test_xml/audit_OP26000908_20260406_075900.json`
- Rule seed liên quan:
  - `THUOC_40`
  - `THUOC_41`
  - `THUOC_42`
  - `THUOC_436`

## 3. Bối cảnh hồ sơ

- `MA_LK`: `OP26000908`
- Thuốc chính: `Cepmox-Clav 875 mg/125 mg`
- Đường dùng: `uống`
- Chẩn đoán chính: `H72`
- Chẩn đoán kèm theo có `H66.9`, `J30.3`, `K21`

Điểm quan trọng:

- Hồ sơ có yếu tố `viêm tai giữa không đặc hiệu`.
- Đây là bối cảnh tai mũi họng mà lâm sàng thực tế có thể vẫn dùng `Amoxicillin/Clavulanate`.

## 4. Dữ liệu thuốc thật đã xác nhận

- `TEN_THUOC = Cepmox-Clav 875 mg/125 mg`
- `LIEU_DUNG = 1 Viên/lần * 3 lần/ngày * 7 ngày [3 Viên/ngày]`

## 5. Kết quả audit và thay đổi sau rà chỉ định

Trước khi mở rộng rule, các cảnh báo nổi bật là:

- `THUOC_41` trên `Cepmox-Clav`
- `DM-THUOC-04` về đơn giá vượt giá trúng thầu nội bộ
- `THUOC_436` về tên thương mại không ghi INN trong ngoặc ở ngoại trú

Riêng `THUOC_41` khi đó kết luận:

- thuốc chỉ được thanh toán cho nhóm `J01, J03, J06, J15, J20, L01`
- hồ sơ này không khớp đầy đủ với danh sách đó

Sau khi rà lại theo bối cảnh tai mũi họng và cập nhật rule:

- `THUOC_41` đã được mở rộng để nhận `H66` và chuỗi `viêm tai giữa`
- audit giảm từ `11` xuống `10` cảnh báo
- ca không còn bị xuất toán bởi `THUOC_41`

## 6. Vấn đề cốt lõi cần AI học

Rule `THUOC_41` trước đây hẹp ở chỗ:

- chấp nhận nhiều nhóm nhiễm khuẩn hô hấp và da
- nhưng chưa bao phủ rõ nhóm `tai mũi họng` như `viêm tai giữa`

Do đó AI phải tách 2 tầng kết luận:

1. `Theo rule cũ`, hồ sơ bị cảnh báo là hợp logic engine.
2. `Theo bối cảnh nghiệp vụ`, đây là ca có nguy cơ false positive nên cần mở rộng rule nếu đơn vị xác nhận viêm tai giữa là chỉ định phù hợp.
3. `Theo trạng thái hiện tại`, ca đã được xử lý đúng hơn trong engine nhưng vẫn cần rà tiếp các ICD tai mũi họng lân cận.

## 7. Kết luận huấn luyện mẫu

Kết luận chuẩn sau khi đã sửa và kiểm thử lại nên là:

1. Đây là ca `Amoxicillin/Clavulanate đường uống` trong bối cảnh tai mũi họng.
2. `THUOC_41` trước đây bắn cảnh báo vì bộ ICD chưa bao phủ rõ `H66.9`, nhưng hiện đã được nới theo hướng phù hợp hơn.
3. Ca này thích hợp để dạy AI cách phân biệt giữa:
   - `rule đang chạy đánh như thế nào`
   - `nghiệp vụ thực tế có thể rộng hơn rule`

## 8. Điều AI cần đề xuất kiểm tra thêm

1. Đơn vị có chấp nhận thêm các mã tai mũi họng nào ngoài `H66` là căn cứ phù hợp cho `Amoxicillin/Clavulanate` trong phạm vi thanh toán hiện hành hay không.
2. Có cần mở rộng tiếp regex hoặc danh sách ICD của `THUOC_41` theo khoản 3 Điều 8 TT 37/2024 và tài liệu chỉ định hợp lệ hay không.
3. Nếu mở rộng tiếp, cần giới hạn đến đâu để tránh kéo rule quá rộng ngoài phạm vi thanh toán BHYT.

## 9. Bài học huấn luyện

### 9.1. Bài học nghiệp vụ

- Một rule chỉ định quá hẹp có thể tạo false positive dù dữ liệu lâm sàng không hề vô lý.

### 9.2. Bài học kỹ thuật

- Không sửa trực tiếp bằng cách tắt rule.
- Cần rà theo `nhóm bệnh`, `tài liệu thanh toán`, `ca thật`, rồi mới mở rộng danh sách ICD hoặc regex.

### 9.3. Bài học cho AI

- Khi gặp các ca tai mũi họng như `H66.9`, AI phải biết đặt nghi vấn về `độ phủ của rule` chứ không chỉ lặp lại kết luận xuất toán.