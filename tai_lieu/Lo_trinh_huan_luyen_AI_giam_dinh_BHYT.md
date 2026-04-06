# LỘ TRÌNH HUẤN LUYỆN AI GIÁM ĐỊNH BHYT

Phiên bản tài liệu: 1.0  
Ngày cập nhật: 05/04/2026

## 1. Mục tiêu

Tài liệu này mô tả cách huấn luyện AI từng bước để hỗ trợ tốt nghiệp vụ giám định BHYT trong bối cảnh dự án `ung_dung_cdss_bhyt`.

Mục tiêu huấn luyện không phải là “nhồi hết mọi kiến thức một lần”, mà là xây dựng dần 4 năng lực:

- Hiểu hệ thống đang chạy và luồng dữ liệu thật.
- Hiểu luật, danh mục, quy tắc và điểm kiểm soát nghiệp vụ.
- Hiểu quy trình xử lý hồ sơ từ nhập XML đến giám định, sửa và báo cáo.
- Rút kinh nghiệm từ các ca thực tế để nâng chất lượng suy luận.

## 2. Nguyên tắc huấn luyện

- Luôn ưu tiên mã nguồn đang chạy là nguồn sự thật cao nhất của hệ thống.
- Kiến thức pháp lý và nghiệp vụ phải được chuẩn hóa thành từng đơn vị nhỏ, không nạp bằng mô tả dài lan man.
- Mỗi lần huấn luyện nên xoay quanh một chủ đề, một loại lỗi, một nhóm rule hoặc một ca hồ sơ cụ thể.
- AI chỉ đáng tin khi có thể chỉ ra được: nguồn tri thức, điều kiện áp dụng, ngoại lệ, và cách kiểm chứng.
- Mọi kiến thức quan trọng nên được lưu thành tài liệu hoặc “thẻ tri thức”, không chỉ nằm trong hội thoại tạm thời.

## 3. Kiến trúc huấn luyện đề xuất

Huấn luyện AI cho giám định BHYT nên đi theo 4 tầng tri thức.

### 3.1. Tầng 1: Nền hệ thống

AI phải nắm các nội dung nền sau:

- Kiến trúc hệ thống CDSS BHYT.
- Màn hình nào là luồng thật đang chạy.
- XML1 đến XML6 đang được quản lý như thế nào.
- Rule engine, báo cáo, DocXML, Sua XML, kho lưu trữ kết nối với nhau ra sao.

Nguồn dùng để nạp:

- `tai_lieu/Dac_ta_he_thong_CDSS_BHYT_20260405.md`
- `App.jsx`
- `ma_nguon/dieu_huong/tuyen_duong.jsx`
- Các file trong `ma_nguon/man_hinh`, `ma_nguon/tien_ich`, `ma_nguon/quy_tac`

Kết quả mong muốn:

- AI trả lời đúng màn hình thật, đường đi dữ liệu và chỗ nên sửa.
- AI không nhầm scaffold `app/` với luồng nghiệp vụ thật.

### 3.2. Tầng 2: Nền nghiệp vụ BHYT

AI phải nắm được lớp khái niệm nghiệp vụ cốt lõi:

- Hồ sơ BHYT là gì.
- Vai trò của XML1 đến XML6.
- Mối liên hệ giữa chẩn đoán, dịch vụ kỹ thuật, thuốc, vật tư, ngày y lệnh, ngày kết quả, bác sĩ, khoa phòng, đối tượng, nơi đăng ký KCB.
- Mục tiêu của giám định: phát hiện sai, thiếu, bất thường, không phù hợp quy định hoặc nguy cơ bị xuất toán.

Nguồn dùng để nạp:

- Tài liệu nội bộ nghiệp vụ.
- Quyết định, công văn, hướng dẫn chuyên đề.
- Bộ tài liệu quản lý và sử dụng kháng sinh dùng làm nguồn chuẩn khi huấn luyện nhóm thuốc và nhóm PTTT có dùng kháng sinh:
	- `Quyết định 5631/QĐ-BYT năm 2020` về tài liệu hướng dẫn thực hiện quản lý sử dụng kháng sinh trong bệnh viện.
	- `Sổ tay hướng dẫn thực hiện chương trình quản lý sử dụng kháng sinh dành cho bệnh viện tuyến huyện` ban hành kèm `Quyết định số 2115/QĐ-BYT ngày 11/05/2023`.
	- `Hướng dẫn sử dụng kháng sinh` bản cập nhật cuối khi in `09/01/2015` từ Cục Quản lý Khám, chữa bệnh.
	- `British National Formulary - BNF 85` dùng như nguồn tham khảo liều và nguyên tắc kháng sinh trẻ em.
	- `15/VBHN-BYT năm 2025` dùng như nguồn đối chiếu phạm vi thanh toán thuốc BHYT, trong đó có kháng sinh.
- Các ca hồ sơ thực tế đã xử lý trong đơn vị.

Kết quả mong muốn:

- AI không chỉ đọc được cấu trúc dữ liệu mà còn hiểu dữ liệu đó ảnh hưởng gì về mặt giám định.

### 3.3. Tầng 3: Tầng luật và quy tắc

Đây là lớp quan trọng nhất cho nghiệp vụ giám định.

AI cần được huấn luyện theo từng đơn vị luật nhỏ, mỗi đơn vị gồm:

- Tên rule hoặc nhóm rule.
- Mục tiêu kiểm tra.
- Điều kiện áp dụng.
- Điều kiện loại trừ.
- Dữ liệu đầu vào liên quan.
- Mức độ rủi ro hoặc ảnh hưởng chi phí.
- Cách giải thích cho người nghiệp vụ.
- Hồ sơ mẫu minh họa đúng/sai.

Nguồn dùng để nạp:

- File seed luật.
- `luat_*_hardcoded.jsx`.
- Kết quả audit thực tế trong `test_xml/`.
- Biên bản xử lý các ca false positive và false negative.

Kết quả mong muốn:

- AI biết một rule đang kiểm tra điều gì.
- AI giải thích được vì sao rule đánh đúng hoặc đánh sai.
- AI đề xuất cách kiểm tra lại an toàn trước khi sửa rule.

### 3.4. Tầng 4: Tầng ca thực chiến

Đây là lớp biến AI từ “biết lý thuyết” thành “làm được việc”.

Mỗi ca thực chiến nên nạp theo mẫu:

- Bối cảnh hồ sơ.
- Vấn đề phát hiện.
- Rule liên quan.
- Dữ liệu đã kiểm tra.
- Cách kết luận đúng/sai.
- Cách sửa hoặc cách báo cáo.
- Bài học rút ra.

Nguồn dùng để nạp:

- Hồ sơ thật đã ẩn thông tin nhạy cảm nếu cần.
- JSON audit.
- Ảnh chụp lỗi, màn hình báo cáo, bản trước/sau sửa XML.

Kết quả mong muốn:

- AI có thể trợ giúp ở mức hồ sơ cụ thể chứ không chỉ nêu lý thuyết chung.

## 4. Quy trình huấn luyện theo từng bước

### Bước 1: Chốt bộ tài liệu gốc

Anh cần xác định rõ “nguồn tri thức chuẩn” để AI học từ đó.

Ít nhất nên có 4 nhóm:

- Tài liệu hệ thống.
- Tài liệu nghiệp vụ BHYT.
- Tài liệu luật/rule/công văn.
- Ca thực tế đã xử lý.

Yêu cầu:

- Mỗi tài liệu phải có tên, ngày cập nhật, độ tin cậy, và phạm vi áp dụng.
- Nếu có mâu thuẫn giữa tài liệu và mã nguồn, phải đánh dấu rõ.
- Với nhóm kháng sinh, nên chốt sẵn một bộ nguồn ưu tiên để tránh học lẫn giữa tài liệu cũ và tài liệu đang dùng tại bệnh viện.

### Bước 2: Chuẩn hóa thành thẻ tri thức

Không nên đưa cả văn bản dài cho AI rồi kỳ vọng AI nhớ tốt.

Thay vào đó, mỗi mảng tri thức nên được chuẩn hóa thành “thẻ tri thức” gồm:

- Chủ đề.
- Mệnh đề nghiệp vụ chính.
- Điều kiện áp dụng.
- Dữ liệu cần xem.
- Ngoại lệ.
- Cách kiểm chứng.
- Ví dụ đúng/sai.

Đây là bước quan trọng nhất để AI học có cấu trúc.

### Bước 3: Dạy theo nhóm chủ đề nhỏ

Không huấn luyện một lần cho toàn bộ BHYT.

Nên chia theo đợt:

- Đợt 1: hiểu XML và luồng hệ thống.
- Đợt 2: lỗi hành chính và dữ liệu cơ bản.
- Đợt 3: thuốc.
- Đợt 4: dịch vụ kỹ thuật.
- Đợt 5: chỉ định cận lâm sàng.
- Đợt 6: nội trú, ngày giường, thủ thuật, phẫu thuật.
- Đợt 7: nhóm chuyên đề hay bị xuất toán tại đơn vị.

### Bước 4: Dạy bằng ca thật

Sau khi có nền tri thức, mỗi tuần nên đưa cho AI một số ca thật:

- 1 ca đánh đúng.
- 1 ca đánh sai false positive.
- 1 ca lọt lỗi false negative.
- 1 ca khó cần giải thích nghiệp vụ.

Sau mỗi ca, yêu cầu AI trả lời:

- Vấn đề là gì.
- Rule nào liên quan.
- Căn cứ dữ liệu nào.
- Kết luận đúng nhất là gì.
- Nếu sửa hệ thống thì sửa ở đâu.

### Bước 5: Bắt AI tự rút kinh nghiệm

Mỗi ca sau khi xử lý nên ép AI tạo phần “bài học rút ra” gồm:

- Dấu hiệu nhận biết sớm.
- Điều kiện dễ nhầm.
- Ngoại lệ cần nhớ.
- Câu hỏi kiểm tra nhanh cho các ca tương tự sau này.

### Bước 6: Đánh giá định kỳ

Mỗi 1 đến 2 tuần nên đánh giá lại AI bằng bộ ca kiểm tra riêng.

Tiêu chí đánh giá:

- Xác định đúng màn hình/luồng dữ liệu.
- Gọi đúng rule hoặc nhóm rule.
- Giải thích đúng căn cứ nghiệp vụ.
- Không bịa thông tin khi dữ liệu thiếu.
- Đề xuất bước kiểm chứng hợp lý.

## 5. Cách tổ chức dữ liệu huấn luyện

Nên tổ chức dữ liệu huấn luyện theo 3 loại.

### 5.1. Tài liệu nền

Ví dụ:

- đặc tả hệ thống
- hướng dẫn sử dụng
- mô tả màn hình
- mô tả kho dữ liệu và storage
- bộ hướng dẫn quản lý sử dụng kháng sinh và kháng sinh dự phòng đang được ưu tiên áp dụng

Riêng với mảng kháng sinh, bộ nguồn nền nên ưu tiên:

- `Quyết định 5631/QĐ-BYT năm 2020`
- `Quyết định 2115/QĐ-BYT ngày 11/05/2023` và sổ tay kèm theo cho bệnh viện tuyến huyện
- `Hướng dẫn sử dụng kháng sinh` bản cập nhật cuối khi in `09/01/2015`
- `British National Formulary - BNF 85` cho tri thức nhi khoa
- `15/VBHN-BYT năm 2025` cho phạm vi thanh toán thuốc BHYT

### 5.2. Thẻ tri thức nghiệp vụ

Mỗi thẻ nên là một đơn vị nhỏ, ví dụ:

- kiểm tra ngày y lệnh và ngày kết quả
- mối liên hệ giữa XML3 và XML5
- điều kiện hợp lệ của thuốc theo đối tượng
- logic cảnh báo nội trú/ngày giường

### 5.3. Ca học từ thực tế

Mỗi ca nên có:

- đầu bài
- dữ liệu
- kết luận đúng
- lỗi AI cũ từng mắc nếu có
- bài học rút ra

## 6. Những việc AI nên làm sau khi được huấn luyện

Nếu huấn luyện đúng, AI nên làm tốt các việc sau:

- giải thích một rule theo ngôn ngữ nghiệp vụ
- phân tích một hồ sơ XML theo `MA_LK`
- so sánh trước/sau khi sửa hồ sơ
- chỉ ra file mã nguồn hoặc tầng logic liên quan
- hỗ trợ soạn báo cáo nghiệp vụ sau khi chỉnh hồ sơ
- hỗ trợ rà soát an toàn trước khi sửa rule hoặc commit

## 7. Những việc không nên kỳ vọng quá sớm

- Không nên kỳ vọng AI tự thay thế hoàn toàn chuyên gia giám định.
- Không nên để AI tự diễn giải quy định pháp lý mà không có nguồn hoặc ca minh họa.
- Không nên để AI sửa rule diện rộng nếu chưa có ca kiểm chứng.
- Không nên dạy AI bằng dữ liệu lẫn lộn, không ghi rõ đúng sai và ngoại lệ.

## 8. Kế hoạch triển khai 4 tuần

### Tuần 1

- Chốt bộ tài liệu gốc.
- Hoàn thiện bộ prompt và agent.
- Tạo 10 đến 20 thẻ tri thức đầu tiên về kiến trúc, XML, dashboard, DocXML, Sua XML, báo cáo.

### Tuần 2

- Tạo thẻ tri thức cho 1 đến 2 nhóm rule quan trọng nhất tại đơn vị.
- Nạp 5 đến 10 ca audit thực tế.
- Bắt đầu đánh giá AI bằng câu hỏi đối chiếu hồ sơ cụ thể.

### Tuần 3

- Mở rộng sang nhóm thuốc, DVKT, chỉ định, nội trú hoặc nhóm có nhiều xuất toán.
- Chuẩn hóa false positive và false negative thành bài học.

### Tuần 4

- Đánh giá lại toàn bộ.
- Loại bỏ tri thức mơ hồ.
- Bổ sung mẫu báo cáo, mẫu giải thích nghiệp vụ, mẫu chuẩn bị commit/sửa rule.

## 9. Cách làm việc khuyến nghị với AI

Khi huấn luyện, anh nên dùng mẫu lệnh theo hướng sau:

- “Trích 1 thẻ tri thức từ tài liệu này.”
- “Giải thích rule này theo ngôn ngữ nghiệp vụ.”
- “Cho biết dữ liệu nào cần kiểm tra để kết luận rule này đúng hay sai.”
- “Biến ca audit này thành bài học huấn luyện cho AI.”
- “So sánh hai hồ sơ trước và sau sửa, rút ra dấu hiệu cần nhớ.”

## 10. Kết luận

Muốn AI làm tốt nghiệp vụ giám định BHYT, cần huấn luyện theo hệ thống:

- từ kiến trúc
- sang nghiệp vụ
- sang luật/rule
- sang ca thực chiến

Không có một prompt đơn lẻ nào thay thế được quá trình này. Cách đúng là xây “bộ nhớ có cấu trúc” cho AI bằng tài liệu nền, thẻ tri thức và ca thực tế đã kiểm chứng.