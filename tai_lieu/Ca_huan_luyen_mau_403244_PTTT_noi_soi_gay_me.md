# CA HUẤN LUYỆN MẪU 403244 - PTTT - NỘI SOI ĐẠI TRỰC TRÀNG GÂY MÊ

Phiên bản tài liệu: 1.0  
Ngày cập nhật: 05/04/2026

## 1. Mục tiêu

Đây là ca huấn luyện hoàn chỉnh được dựng theo đúng tinh thần của quy trình prompt trọn gói: chọn một chủ đề hẹp, bám trên XML thật và audit thật, rồi chốt thành tài liệu tái sử dụng.

Ca này tập trung vào nhóm `PTTT` và dịch vụ:

- `02.0261.0319` Nội soi đại trực tràng toàn bộ ống mềm có dùng thuốc gây mê

## 2. Nguồn dữ liệu

- XML gốc: `tai_nguyen/xml/QD130_94170_202603_202603191032_PC-022603360.xml`
- Audit: `test_xml/audit_403244_20260405_224614.json`
- Rule liên quan:
  - `CLN-PTTT-02`
  - `CLN-PTTT-05`
  - `CLN-PTTT-13`
  - `DVKT_0259`
  - `DVKT_2587` (thay thế ví dụ mã đã gỡ khỏi seed; xem `Khung_chat_luong_giam_dinh_DVKT_VBHN17.md`)

## 3. Tóm tắt hồ sơ

- `MA_LK`: `403244`
- Hồ sơ nội trú
- Chẩn đoán chính: `K52.3`
- Chẩn đoán kèm có `K63.5`, `K21`, `E11`, `I10`, `R10.4`
- Chẩn đoán ra viện có mô tả:
  - viêm đại tràng không xác định
  - polyp đại tràng
  - polyp đại tràng cắt qua nội soi

Điểm quan trọng:

- hồ sơ có dấu vết rõ ràng của can thiệp nội soi liên quan đại tràng
- nhưng dữ liệu PTTT và chứng cứ đi kèm chưa đầy đủ

## 4. Dữ liệu thật đã xác nhận từ XML

### 4.1. XML1

Đã xác nhận:

- `MA_LOAI_KCB = 03`
- `MA_PTTT_QT` đang để trống
- `NGAY_VAO = 202603160638`
- `NGAY_RA = 202603191100`

### 4.2. XML3

Có dòng dịch vụ:

- `STT = 9`
- `MA_DICH_VU = 02.0261.0319`
- `TEN_DICH_VU = Nội soi đại trực tràng toàn bộ ống mềm có dùng thuốc gây mê`
- `MA_NHOM = 18`
- `MA_PTTT_QT` để trống
- `MA_BAC_SI = 001513/CT-GPHN`
- `NGUOI_THUC_HIEN = 001513/CT-GPHN`
- `NGAY_YL = 202603160816`
- `NGAY_TH_YL = 202603160816`

### 4.3. XML5

Audit cho thấy XML5 chưa có tóm tắt `PHAU_THUAT` phù hợp cho dòng PTTT này.

## 5. Kết quả audit trọng tâm

Audit ghi nhận 11 cảnh báo. Trong đó cụm quan trọng nhất cho ca này là:

1. `CLN-PTTT-02`
2. `CLN-PTTT-05`
3. `CLN-PTTT-13`
4. `DVKT_0259`

Chi tiết nghiệp vụ:

### 5.1. `CLN-PTTT-02`

- XML3 có `1` dòng PTTT nhưng XML1 chưa khai `MA_PTTT_QT`.

### 5.2. `CLN-PTTT-05`

- Dòng `02.0261.0319` trong XML3 chưa khai `MA_PTTT_QT` ở cả XML3 và XML1.

### 5.3. `CLN-PTTT-13`

- XML3 có PTTT nhưng XML5 chưa ghi tóm tắt phẫu thuật/thủ thuật `PHAU_THUAT`.

### 5.4. `DVKT_0259`

- Nội soi đại trực tràng có gây mê cần tối thiểu 2 nhân viên.
- Audit cho rằng phần chứng cứ nhân sự ở bảng liên quan chưa đạt mức tối thiểu mong đợi.

## 6. Kết luận mẫu mà AI nên rút ra

Kết luận chuẩn cho ca này nên là:

1. Hồ sơ `403244` có một dịch vụ PTTT rõ ràng ở XML3 là nội soi đại trực tràng có dùng thuốc gây mê.
2. Dữ liệu PTTT đang thiếu ở cả cấp hồ sơ và cấp dòng vì `MA_PTTT_QT` trống ở XML1 lẫn XML3.
3. Hồ sơ cũng thiếu lớp chứng cứ tóm tắt thực hiện trên XML5, làm yếu căn cứ thanh toán kỹ thuật.
4. Ngoài thiếu mã hóa, audit còn cảnh báo thiếu cấu hình/chứng cứ nhân sự tối thiểu cho kỹ thuật có gây mê.
5. Đây là ca điển hình cho lỗi “kỹ thuật có làm nhưng hồ sơ điện tử chưa đủ chứng cứ và chưa đủ mã hóa”, không phải ca để kết luận đơn thuần là sai chẩn đoán.

## 7. Điều AI phải tránh

AI không nên tự kết luận rằng:

- dịch vụ này chắc chắn không được thực hiện
- hoặc chắc chắn là gian lận

Lý do:

- dữ liệu hiện có chỉ cho phép kết luận chắc về **thiếu chứng cứ/mã hóa hồ sơ**, chưa đủ để khẳng định bản chất chuyên môn thực tế ngoài bệnh án giấy hay nguồn khác.

## 8. Bài học huấn luyện cho AI

### 8.1. Bài học nghiệp vụ

- Với PTTT, lỗi thường nằm ở chỗ thiếu chứng cứ và thiếu đối chiếu liên bảng, không chỉ ở chẩn đoán.

### 8.2. Bài học kỹ thuật

- Khi gặp nhóm `PTTT`, AI phải đọc liên thông ít nhất `XML1`, `XML3`, `XML5`.
- Không được dừng ở một bảng duy nhất.

### 8.3. Bài học quy trình

- Trình tự đúng:
  1. xác định dịch vụ PTTT ở XML3
  2. kiểm tra `MA_PTTT_QT` ở XML1 và XML3
  3. kiểm tra tóm tắt `PHAU_THUAT` ở XML5
  4. kiểm tra nhân sự/vật tư đi kèm nếu seed rule yêu cầu
  5. mới chốt kết luận

## 9. Vì sao đây là một đợt huấn luyện trọn gói tốt

Ca này phù hợp để dùng như một vòng huấn luyện hoàn chỉnh vì nó có đủ 3 lớp:

- dữ liệu XML thật trong repo
- audit thật sinh từ đúng file đó
- cả built-in rule và seed rule cùng tham gia

Nó giúp AI học được cách làm việc không chỉ với thuốc, mà còn với dịch vụ kỹ thuật và hồ sơ chứng từ thực hiện.

## 10. Prompt gợi ý để dùng lại ca này

- `/Chuong Trinh Huan Luyen AI BHYT Chu de PTTT, dung ho so 403244 va tap trung noi soi dai truc trang gay me`
- `/Mo Phong Ca Giam Dinh BHYT Ho so 403244, phan tich CLN-PTTT-02, CLN-PTTT-05, CLN-PTTT-13, DVKT_0259`
- `/Phan Tich XML BHYT Theo Ho So MA_LK 403244, doi chieu XML1 XML3 XML5 cho dich vu 02.0261.0319`