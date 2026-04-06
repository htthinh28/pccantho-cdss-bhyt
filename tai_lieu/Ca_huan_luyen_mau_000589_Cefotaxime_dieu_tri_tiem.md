# CA HUẤN LUYỆN MẪU 000589 - CEFOTAXIME ĐIỀU TRỊ TIÊM VÀ LỖI CHUẨN HÓA ĐƠN VỊ

Phiên bản tài liệu: 1.1  
Ngày cập nhật: 06/04/2026

## 1. Mục tiêu

Ca này dùng để dạy AI một loại lỗi khó hơn lỗi chỉ định đơn thuần: `cảnh báo số lượng sai do chưa chuẩn hóa đơn vị giữa mg và lọ`.

## 2. Nguồn dữ liệu

- XML gốc: `tai_nguyen/xml2_ip/PC022300757_000589.xml`
- Audit trước sửa: `test_xml/audit_000589_20260405_232716.json`
- Audit sau sửa: `test_xml/audit_000589_20260406_075114.json`
- Kết quả quét tổng hợp: `test_xml/antibiotic_case_scan.json`

## 3. Bối cảnh hồ sơ

- `MA_LK`: `000589`
- Kháng sinh chính cần tập trung: `Tenamyd-Cefotaxime 1000`
- Đường dùng: `tiêm/truyền`
- Chẩn đoán chính: `J03`
- Chẩn đoán ra viện: `Viêm amyđan cấp; khó tiêu chức năng`

## 4. Dữ liệu thuốc thật đã xác nhận

- `TEN_THUOC = Tenamyd-Cefotaxime 1000`
- `LIEU_DUNG = 550 mg/lần * 3 lần/ngày * 01 ngày [1650 mg/ngày]`

Điểm AI cần nhận ra:

- liều đang được mô tả bằng `mg/ngày`
- trong khi `SO_LUONG` ở XML2 thường là đơn vị cấp phát như `lọ`

## 5. Kết quả audit và thay đổi sau sửa engine

Trước khi sửa engine, audit có `8` cảnh báo, trong đó đáng chú ý là:

- `THUOC_391`: xuất hiện `2` lần trên `Tenamyd-Cefotaxime 1000`
- `THUOC_417` và `THUOC_63` lại rơi vào `DOMUVAR`, không phải kháng sinh chính của ca

Thông điệp quan trọng từ `THUOC_391` lúc đó:

- hệ thống tính: `Cấp phát 3 < y lệnh 1650`
- rồi kết luận thiếu `1647 đơn vị`

Sau khi bổ sung chặn dữ liệu tự mâu thuẫn về đơn vị trong engine:

- audit giảm còn `6` cảnh báo
- `THUOC_391` đã rơi khỏi kết quả
- các cảnh báo còn lại tập trung vào `DOMUVAR`, hành chính, và `XML_121`

## 6. Vấn đề cốt lõi

Con số `1650` ở đây là `mg/ngày`, không phải `lọ/ngày`.

Vì vậy, cảnh báo cũ rất có khả năng đang so sánh sai 2 đại lượng khác đơn vị:

- `SO_LUONG = số lọ hoặc số đơn vị cấp phát`
- `SL_MOI_NGAY = số mg/ngày` hoặc giá trị chưa chuẩn hóa về cùng đơn vị

## 7. Kết luận huấn luyện mẫu

Kết luận đúng cho ca này sau khi đã kiểm thử lại nên là:

1. Hồ sơ có `Cefotaxime` điều trị tiêm trong bối cảnh viêm amydan cấp.
2. Cảnh báo `THUOC_391` trước đây là `false positive kỹ thuật`, vì so sánh `3` với `1650` là bất thường về mặt nghiệp vụ.
3. Sau khi sửa engine, ca này trở thành ví dụ tốt cho việc `xác định đúng nguyên nhân gốc rồi sửa tại lớp chuẩn hóa/ngữ cảnh`, thay vì tắt rule hàng loạt.

## 8. Điều AI phải đề xuất kiểm tra thêm

1. `SO_LUONG` đang tính theo `lọ`, `ống`, hay `mg`?
2. `DON_VI_TINH` có đang bị khai theo hoạt chất thay vì đơn vị đóng gói không?
3. Có cần thêm bước quy đổi mở rộng cho các hàm lượng phức hợp ngoài mẫu `1g`, `500mg`, `5ml` hay không?

## 9. Bài học huấn luyện

### 9.1. Bài học nghiệp vụ

- Không phải cảnh báo số lượng nào cũng là lỗi cấp thiếu hoặc cấp dư thật.
- Với kháng sinh tiêm, phải cực kỳ chú ý tới `hàm lượng`, `lọ`, `mg` và `liều quy đổi`.

### 9.2. Bài học kỹ thuật

- Cần sửa ở gốc logic so sánh đơn vị, không nên vá bằng cách tắt cảnh báo hàng loạt.
- Điều này cũng phù hợp với tư duy thanh toán BHYT theo Điều 8 TT 37/2024: chỉ thanh toán khi dữ liệu kê đơn, chỉ định, sử dụng thuốc và căn cứ hồ sơ đủ tin cậy.

### 9.3. Bài học cho AI

- Nếu thấy một cảnh báo có chênh lệch quá lớn và vô lý như `3` so với `1650`, AI phải nghi ngay tới `unit mismatch` trước khi kết luận bệnh viện cấp thiếu thuốc.