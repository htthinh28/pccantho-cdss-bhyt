# QUY TRÌNH PROMPT HUẤN LUYỆN AI BHYT

Phiên bản tài liệu: 1.0  
Ngày cập nhật: 05/04/2026

## 1. Mục tiêu

Tài liệu này đóng gói quy trình huấn luyện AI thành một bộ prompt dùng lặp lại, để anh không phải viết lại đầu bài dài mỗi lần cần dạy AI thêm một chủ đề hoặc một ca hồ sơ thật.

## 2. Bộ prompt nên dùng

### Prompt 1. Lập đợt huấn luyện

- File: `.github/prompts/lap-dot-huan-luyen-ai-bhyt.prompt.md`
- Mục đích: chọn chủ đề hẹp, nguồn seed rule, ca audit phù hợp và đầu ra cần tạo.

### Prompt 2. Dùng audit tạo ca huấn luyện

- File: `.github/prompts/dung-audit-tao-ca-huan-luyen.prompt.md`
- Mục đích: biến một audit JSON và, nếu có, XML gốc thành case study huấn luyện có cấu trúc.

### Prompt 3. Cập nhật bộ tri thức

- File: `.github/prompts/cap-nhat-bo-tri-thuc-ai-bhyt.prompt.md`
- Mục đích: gom kết quả của một đợt huấn luyện thành tài liệu trong `tai_lieu/`.

### Prompt 4. Chạy trọn quy trình

- File: `.github/prompts/chuong-trinh-huan-luyen-ai-bhyt.prompt.md`
- Mục đích: chạy từ đầu đến cuối cho một đợt huấn luyện gồm chọn chủ đề, dựng thẻ tri thức, dựng ca thật và cập nhật tài liệu.

## 3. Cách dùng nhanh

Nếu muốn làm theo từng bước, nên dùng theo thứ tự:

1. `/Lap Dot Huan Luyen AI BHYT Chu de tim mach, uu tien rule co seed that va co audit that trong repo`
2. `/Dung Audit Tao Ca Huan Luyen Ho so 403538, tap trung THUOC_345, co XML goc trong tai_nguyen/xml`
3. `/Cap Nhat Bo Tri Thuc AI BHYT Cap nhat tai lieu sau dot huan luyen tim mach va ca 403538`

Nếu muốn chạy gói gọn trong một lệnh, dùng:

1. `/Chuong Trinh Huan Luyen AI BHYT Chu de tim mach, uu tien 1 dot the tri thuc va 1 ca ho so that`

## 4. Khi nào dùng prompt nào

### Dùng `Lap Dot Huan Luyen AI BHYT` khi

- chưa biết nên học chủ đề nào tiếp theo
- muốn AI tự chọn chủ đề hẹp từ seed rule và audit có sẵn
- muốn lên kế hoạch một đợt huấn luyện mới

### Dùng `Dung Audit Tao Ca Huan Luyen` khi

- đã có `MA_LK`, file audit hoặc file XML
- muốn biến một hồ sơ thật thành bài học có thể dùng lặp lại

### Dùng `Cap Nhat Bo Tri Thuc AI BHYT` khi

- vừa hoàn thành một đợt huấn luyện
- muốn AI cập nhật tài liệu trong `tai_lieu/` thay vì để kiến thức rời rạc trong hội thoại

### Dùng `Chuong Trinh Huan Luyen AI BHYT` khi

- muốn AI làm trọn gói từ đầu đến cuối
- muốn giảm thao tác điều phối thủ công

## 5. Quy ước đầu ra

Mỗi đợt huấn luyện nên cố định 2 đầu ra chính:

1. một tài liệu thẻ tri thức theo chủ đề
2. một case study từ hồ sơ thật

Đầu ra khuyến nghị:

- `tai_lieu/The_tri_thuc_mau_nhom_...md`
- `tai_lieu/Ca_huan_luyen_mau_...md`

## 6. Tiêu chuẩn chất lượng

Khi dùng bộ prompt này, câu trả lời tốt phải đạt các tiêu chí sau:

- có nguồn rule hoặc dữ liệu thật trong repo
- nói rõ dữ liệu nào đã xác nhận, dữ liệu nào còn thiếu
- không đánh đồng sai thanh toán với sai chuyên môn nếu rule không kết luận như vậy
- ưu tiên bám mã nguồn và audit thật hơn suy luận chung chung

## 7. Gợi ý triển khai hàng tuần

Một nhịp làm việc gọn có thể là:

1. đầu tuần chọn 1 chủ đề bằng prompt lập đợt
2. giữa tuần đưa 1 hồ sơ thật vào prompt dựng case
3. cuối tuần dùng prompt cập nhật bộ tri thức để chốt tài liệu

## 8. Kết luận

Bộ prompt này giúp anh chuyển từ kiểu làm việc theo từng hội thoại rời rạc sang quy trình huấn luyện có cấu trúc, có đầu ra lưu trữ được và có thể mở rộng dần theo từng tuần.