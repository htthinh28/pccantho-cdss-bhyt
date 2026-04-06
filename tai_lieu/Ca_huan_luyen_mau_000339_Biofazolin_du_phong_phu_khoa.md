# CA HUẤN LUYỆN MẪU 000339 - BIOFAZOLIN DỰ PHÒNG PHỤ KHOA

Phiên bản tài liệu: 1.0  
Ngày cập nhật: 05/04/2026

## 1. Mục tiêu

Ca này dùng để huấn luyện AI về `kháng sinh dự phòng đường tiêm` trong bối cảnh phụ khoa, khác với ca sản khoa `403521` đã có trước đó.

Trọng tâm của ca:

- nhận diện bối cảnh dự phòng quanh thủ thuật/phẫu thuật
- không kết luận sai thành điều trị nhiễm khuẩn chỉ vì có dùng kháng sinh
- phát hiện khoảng trống độ phủ khi engine không tạo cảnh báo thuốc tương ứng

## 2. Nguồn dữ liệu

- XML gốc: `tai_nguyen/op/PC022601324_000339.xml`
- Audit hiện tại: `test_xml/audit_000339_20260405_232511.json`
- Kết quả quét tổng hợp: `test_xml/antibiotic_case_scan.json`
- Rule seed liên quan để đối chiếu ý nghĩa nghiệp vụ:
  - `THUOC_84`
  - `THUOC_85`
  - `THUOC_393`

## 3. Bối cảnh hồ sơ

- `MA_LK`: `000339`
- Thuốc kháng sinh chính: `Biofazolin`
- Đường dùng: `tiêm/truyền`
- Chẩn đoán chính: `N84.0`
- Bối cảnh lâm sàng đã quét được: `Polyp thân tử cung`

Điểm cần AI nhìn ra:

- Đây là bối cảnh phụ khoa có thủ thuật hoặc phẫu thuật.
- Mẫu dùng `2 lọ x 1 lần/ngày x 01 ngày` rất giống logic `kháng sinh dự phòng ngắn ngày`.

## 4. Dữ liệu thuốc thật đã xác nhận

- `TEN_THUOC = Biofazolin`
- `SO_LUONG = 2`
- `LIEU_DUNG = 2 Lọ/lần * 1 lần/ngày * 01 ngày [2 Lọ/ngày]`

Diễn giải nhanh:

- Nếu mỗi lọ là `1g` Cefazolin, tổng liều ngày đang ở mức `2g/ngày`.
- Mức này không vượt ngưỡng `6g/ngày` theo tư duy của `THUOC_393`.

## 5. Kết quả audit hiện tại

Audit mới sinh có `14` cảnh báo, nhưng chỉ có `1` cảnh báo thuộc `THUOC_HARDCODED`, và cảnh báo đó không phải kháng sinh mà là:

- `THUOC_342` trên `Mekoferrat-B9`

Điểm đáng chú ý:

- không có cảnh báo thuốc nào cho `Biofazolin`
- audit tập trung nhiều hơn vào:
  - lỗi hành chính
  - lỗi ngày vào/ngày ra
  - yêu cầu giải phẫu bệnh ở DVKT

## 6. Cách đọc đúng cho AI

AI không nên kết luận:

- `không có cảnh báo thuốc` đồng nghĩa với `không có gì đáng học`

Kết luận đúng hơn là:

1. Hồ sơ có dùng `Biofazolin` trong bối cảnh thủ thuật phụ khoa.
2. Mẫu liều dùng ngắn ngày, một lần trong ngày, rất phù hợp với `kháng sinh dự phòng`.
3. Engine hiện tại không phát sinh cảnh báo kháng sinh tương ứng.
4. Đây là ca thích hợp để dạy AI cách nhận diện `dự phòng đúng bối cảnh` ngay cả khi audit không tạo ra rule thuốc rõ ràng.

## 7. Giá trị của ca này

Ca `000339` giúp AI học một điểm quan trọng:

- `dự phòng kháng sinh` không chỉ xuất hiện trong sản khoa mà còn có thể gặp trong phụ khoa và thủ thuật chuyên khoa

## 8. Bài học huấn luyện

### 8.1. Bài học nghiệp vụ

- Không nên dùng một danh sách ICD hẹp để hiểu toàn bộ dự phòng phẫu thuật.
- Bối cảnh DVKT và loại thủ thuật có giá trị rất lớn.

### 8.2. Bài học kỹ thuật

- Nếu rule thuốc chỉ nhìn `XML1` mà không gắn với DVKT/phẫu thuật, rất dễ lọt các ca dự phòng hợp lý như thế này.

### 8.3. Bài học quy trình

- Trình tự đọc ca này nên là:
  1. đọc chẩn đoán chính
  2. xác định có thủ thuật/phẫu thuật phụ khoa
  3. đọc dòng `Biofazolin`
  4. đối chiếu thời lượng dùng thuốc
  5. mới đánh giá xem có cần cảnh báo hay không