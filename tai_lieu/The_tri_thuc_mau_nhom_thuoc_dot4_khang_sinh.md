# THẺ TRI THỨC MẪU NHÓM THUỐC ĐỢT 4 - KHÁNG SINH

Phiên bản tài liệu: 1.0  
Ngày cập nhật: 05/04/2026

## 1. Mục tiêu

Đợt 4 tập trung vào nhóm kháng sinh và các quy tắc quản trị sử dụng kháng sinh trong repo, nhằm dạy AI các lớp suy luận sau:

- chỉ định thanh toán theo chẩn đoán
- chống chỉ định lâm sàng
- liều tối đa theo cân nặng hoặc 24 giờ
- nhất quán y lệnh
- quản trị kháng sinh hạn chế
- quản trị dự phòng phẫu thuật

## 2. Nguồn tri thức

- `ma_nguon/tien_ich/du_lieu_luat_thuoc_muc8.jsx`
- các seed `THUOC_42` đến `THUOC_45`
- `THUOC_274` đến `THUOC_276`
- `THUOC_431` đến `THUOC_435`
- Bộ nguồn nghiệp vụ và quản lý sử dụng kháng sinh ưu tiên dùng khi giải thích hoặc phản biện rule:
	- `Quyết định 5631/QĐ-BYT năm 2020` về tài liệu hướng dẫn thực hiện quản lý sử dụng kháng sinh trong bệnh viện
	- `Sổ tay hướng dẫn thực hiện chương trình quản lý sử dụng kháng sinh dành cho bệnh viện tuyến huyện` ban hành kèm `Quyết định số 2115/QĐ-BYT ngày 11/05/2023`
	- `Hướng dẫn sử dụng kháng sinh` bản cập nhật cuối khi in `09/01/2015`
- Tài liệu nền đọc kèm:
	- `tai_lieu/Bo_nguon_tri_thuc_quan_ly_su_dung_khang_sinh.md`
	- `tai_lieu/The_tri_thuc_phap_ly_quan_ly_su_dung_khang_sinh.md`
	- `tai_lieu/Ra_soat_ca_khang_sinh_tu_XML_thuc_20260405.md`
	- `tai_lieu/Ra_soat_khoang_trong_rule_khang_sinh_20260405.md`

Lưu ý nguồn:

- Không dùng `Quyết định 772/QĐ-BYT năm 2016` làm nguồn ưu tiên cho bộ huấn luyện hiện tại.
- Khi có khác biệt giữa seed rule của repo và tài liệu nghiệp vụ, AI phải nêu rõ đây là chênh lệch giữa `logic hệ thống đang chạy` và `nguồn hướng dẫn chuyên môn`.

## 3. Thẻ tri thức mẫu đợt 4

---

## Thẻ 18. Amoxicillin/Clavulanate liều tối đa nhi

### 1. Thông tin chung

- Chủ đề: Amoxicillin + acid clavulanic
- Nguồn: `THUOC_42`
- Kiểu suy luận: an toàn liều

### 2. Mệnh đề nghiệp vụ cốt lõi

- Với trẻ em có cân nặng được khai báo, tổng liều Amoxicillin quy đổi không được vượt `90mg/kg/ngày`.

### 3. Phạm vi áp dụng

- Điều kiện nhận diện: `XML2.MA_THUOC == '40.155'`
- XML liên quan: `XML1`, `XML2`

### 4. Dữ liệu cần kiểm tra

- `XML1.CAN_NANG`
- `TONG_LIEU_24H`

### 5. Cách suy luận đúng

- Nếu `(TONG_LIEU_24H / CAN_NANG) > 90` thì phải cảnh báo quá liều.
- Đây là cảnh báo an toàn điều trị, không chỉ là câu chuyện thanh toán.

### 6. Bài học cho AI

- Các kháng sinh nhi khoa phải luôn gắn với cân nặng, không được đọc số lượng đơn thuần.

---

## Thẻ 19. Amoxicillin và căn cứ thanh toán/chống chỉ định

### 1. Thông tin chung

- Chủ đề: Amoxicillin 500mg
- Nguồn: `THUOC_43`, `THUOC_44`, `THUOC_45`
- Kiểu suy luận: chống chỉ định, chỉ định, nhất quán dữ liệu

### 2. Mệnh đề nghiệp vụ cốt lõi

- Amoxicillin không phù hợp nếu có tiền sử dị ứng Penicillin.
- Về thanh toán, seed hiện hành chỉ chấp nhận một số nhóm nhiễm khuẩn hô hấp và viêm tủy răng.
- Hệ thống còn kiểm tra số lượng kê có khớp y lệnh chi tiết hay không.

### 3. Phạm vi áp dụng

- Điều kiện nhận diện: `XML2.MA_THUOC == '40.154'`

### 4. Dữ liệu cần kiểm tra

- `XML1.MA_BENH_CHINH`
- `XML1.MA_BENH_KT`
- `XML1.CHAN_DOAN_RV`
- `XML2.SO_LUONG`
- `CALC_SL_MOI_NGAY`
- `SO_NGAY`

### 5. Cách suy luận đúng

- Có `Z88.0` thì chống chỉ định theo seed.
- Không có `J01`, `J03`, `J06`, `J15`, `J20`, `K04` hoặc mô tả tương đương thì có nguy cơ xuất toán.
- Nếu `SO_LUONG != CALC_SL_MOI_NGAY * SO_NGAY` thì có tín hiệu lỗi dữ liệu/y lệnh.

### 6. Bài học cho AI

- Một kháng sinh có thể đồng thời dính 3 lớp vấn đề: an toàn, thanh toán và chất lượng dữ liệu.

---

## Thẻ 20. Metronidazol

### 1. Thông tin chung

- Chủ đề: Metronidazol
- Nguồn: `THUOC_274`, `THUOC_275`, `THUOC_276`
- Kiểu suy luận: liều, chống chỉ định, chỉ định ICD-10

### 2. Mệnh đề nghiệp vụ cốt lõi

- Metronidazol có trần liều 24 giờ rõ ràng và chỉ phù hợp cho một số chỉ định đường tiêu hóa/nhiễm amíp theo seed hiện hành.

### 3. Phạm vi áp dụng

- Điều kiện nhận diện: `XML2.MA_THUOC == '40.212'`

### 4. Dữ liệu cần kiểm tra

- `TONG_LIEU_24H`
- `XML1.MA_BENH_CHINH`
- `XML1.MA_BENH_KT`
- `XML1.CHAN_DOAN_RV`

### 5. Cách suy luận đúng

- Nếu `TONG_LIEU_24H > 4000` thì coi là nguy cơ rất cao.
- Nếu có `K72`, `N18.4`, `N18.5` thì tăng nguy cơ chống chỉ định theo seed.
- Nếu không có `A06`, `A04`, `K25`, `K26` hoặc mô tả tương đương thì có nguy cơ xuất toán.

### 6. Bài học cho AI

- Thuốc tiêu hóa có thể vừa là kháng sinh vừa bị kiểm tra chặt về căn cứ thanh toán, không được giản lược thành “thuốc hỗ trợ”.

---

## Thẻ 21. Kháng sinh cùng nhóm Cephalosporin thế hệ 3

### 1. Thông tin chung

- Chủ đề: trùng lặp kháng sinh cùng nhóm
- Nguồn: `THUOC_431`
- Kiểu suy luận: quản trị kháng sinh và an toàn kê đơn

### 2. Mệnh đề nghiệp vụ cốt lõi

- Nếu hồ sơ có hơn 1 kháng sinh thuộc nhóm `Cephalosporin_3`, hệ thống coi đó là tín hiệu kê trùng nhóm, có nguy cơ không tối ưu chi phí và tăng rủi ro điều trị.

### 3. Phạm vi áp dụng

- Điều kiện: `COUNT_IF(XML2, NHOM_KS == 'Cephalosporin_3') > 1`

### 4. Dữ liệu cần kiểm tra

- toàn bộ các dòng kháng sinh trong `XML2`
- thuộc tính nhóm kháng sinh `NHOM_KS`

### 5. Cách suy luận đúng

- Đây là rule quản trị ở mức toàn hồ sơ, không đánh trên một dòng thuốc riêng lẻ.
- Khi bị đánh rule, cần gom toàn bộ kháng sinh cùng nhóm rồi mới kết luận.

### 6. Bài học cho AI

- Các rule dạng đếm toàn hồ sơ rất dễ bị bỏ sót nếu AI chỉ đọc từng dòng một.

---

## Thẻ 22. Kháng sinh dự phòng phẫu thuật quá 24 giờ

### 1. Thông tin chung

- Chủ đề: kháng sinh dự phòng phẫu thuật
- Nguồn: `THUOC_432`
- Kiểu suy luận: thanh toán và quản trị sử dụng kháng sinh

### 2. Mệnh đề nghiệp vụ cốt lõi

- Kháng sinh dự phòng phẫu thuật thường chỉ được chấp nhận trong vòng `24 giờ`. Kéo dài hơn mà không có bằng chứng nhiễm khuẩn sẽ có nguy cơ xuất toán.

### 3. Phạm vi áp dụng

- Điều kiện: `XML2.MA_NHOM == 'KS_DU_PHONG' AND XML2.SO_NGAY > 1 AND XML1.MA_LOAI_KCB == '3'`

### 4. Dữ liệu cần kiểm tra

- `XML2.MA_NHOM`
- `XML2.SO_NGAY`
- `XML1.MA_LOAI_KCB`
- bằng chứng nhiễm khuẩn đi kèm nếu có

### 5. Cách suy luận đúng

- Không kết luận chỉ từ tên thuốc; phải xác định đúng đây là kháng sinh dự phòng.
- Nếu thời gian kéo dài hơn 1 ngày, AI phải yêu cầu xem thêm căn cứ nhiễm khuẩn trước khi phản biện rule.

### 6. Bài học cho AI

- Đây là rule rất phù hợp để dạy AI phân biệt giữa “dự phòng” và “điều trị”.

---

## Thẻ 23. Kháng sinh hạn chế và giám sát xét nghiệm

### 1. Thông tin chung

- Chủ đề: Linezolid, nhóm G3, Vancomycin
- Nguồn: `THUOC_433`, `THUOC_434`, `THUOC_435`
- Kiểu suy luận: stewardship và theo dõi an toàn

### 2. Mệnh đề nghiệp vụ cốt lõi

- `Linezolid` cần theo dõi công thức máu định kỳ.
- Kháng sinh `G3` nên có căn cứ kháng sinh đồ hoặc hội chẩn quản lý kháng sinh.
- `Vancomycin` dùng kéo dài nên có TDM để giảm độc tính thận.

### 3. Phạm vi áp dụng

- `THUOC_433`: `XML2.MA_HOAT_CHAT == '40.228'` và thiếu `XN_CONG_THUC_MAU`
- `THUOC_434`: thuốc thuộc `NHOM_DIEU_KIEN == 'G3'` và thiếu `KS_DO`
- `THUOC_435`: `XML2.MA_HOAT_CHAT == '40.189'` và `SO_NGAY > 3` nhưng thiếu `XN_DINH_LUONG_VANCO`

### 4. Dữ liệu cần kiểm tra

- `XML2.MA_HOAT_CHAT`
- `XML2.SO_NGAY`
- `XML3.MA_DICH_VU`
- phân nhóm điều kiện kháng sinh `G3`

### 5. Cách suy luận đúng

- Đây là nhóm rule stewardship thiên về hướng dẫn và an toàn, không nên diễn đạt như lỗi kế toán đơn thuần.
- AI phải nêu rõ thiếu bằng chứng xét nghiệm hay thiếu quy trình hội chẩn, không chỉ nói “sai”.

### 6. Bài học cho AI

- Kháng sinh hạn chế là lớp tri thức rất quan trọng vì nối giữa nghiệp vụ BHYT và quản trị chất lượng điều trị.

---

## Thẻ 24. Cefazolin dự phòng phẫu thuật và bối cảnh sản khoa

### 1. Thông tin chung

- Chủ đề: Cefazolin / Biofazolin
- Nguồn: `THUOC_84`, `THUOC_85`, `THUOC_393`
- Kiểu suy luận: chống chỉ định, chỉ định dự phòng, tổng liều 24 giờ

### 2. Mệnh đề nghiệp vụ cốt lõi

- Cefazolin là ví dụ điển hình cho thuốc cần đọc cùng lúc cả chẩn đoán và bối cảnh phẫu thuật.
- Nếu chỉ nhìn ICD-10 tại XML1, AI có thể bỏ sót bối cảnh dự phòng quanh một cuộc mổ hoặc thủ thuật.

### 3. Phạm vi áp dụng

- Điều kiện nhận diện: `XML2.MA_THUOC == '40.166'`
- Rule liên quan:
	- `THUOC_84`: chống chỉ định dị ứng Cephalosporin
	- `THUOC_85`: kiểm tra chỉ định ICD-10 hoặc dự phòng phẫu thuật
	- `THUOC_393`: tổng liều Cefazolin không vượt `6g/ngày`

### 4. Dữ liệu cần kiểm tra

- `XML1.MA_BENH_CHINH`
- `XML1.MA_BENH_KT`
- `XML1.CHAN_DOAN_RV`
- `XML1.MA_PTTT_QT`
- các dòng PTTT ở `XML3`
- `XML2.SO_LUONG`
- hàm lượng g/đơn vị của Cefazolin

### 5. Cách suy luận đúng

- Có `Z88.1` thì chống chỉ định theo seed.
- Nếu không có `J15`, `L01`, `M86`, `Z29.2` hoặc mô tả `dự phòng nhiễm trùng`, phải xem thêm bối cảnh mổ/thủ thuật trước khi kết luận về chỉ định.
- Nếu `SO_LUONG * 2 > 6` thì vượt tổng liều ngày theo seed hiện hành.

### 6. Bài học cho AI

- Đây là nhóm thuốc mà false negative hoặc tranh chấp nghiệp vụ rất dễ xuất hiện nếu hệ thống chỉ bám ICD-10 mà không hiểu bối cảnh dự phòng quanh PTTT.
- Khi gặp Cefazolin trong hồ sơ phẫu thuật/sản khoa, AI phải chủ động kiểm tra thêm `MA_PTTT_QT` và XML3 thay vì đọc riêng XML1.

## 4. Kết luận huấn luyện đợt 4

Khi học nhóm kháng sinh, AI nên đi theo thứ tự:

1. Nhận diện loại kháng sinh và bối cảnh dùng.
2. Kiểm tra liều và chống chỉ định.
3. Kiểm tra chỉ định thanh toán theo ICD-10.
4. Kiểm tra quản trị sử dụng kháng sinh ở mức toàn hồ sơ.
5. Cuối cùng mới đánh giá các ngoại lệ cần bác sĩ hoặc dữ liệu bổ sung xác minh.

Khi cần viện dẫn căn cứ chuyên môn cho kháng sinh, thứ tự ưu tiên nên là:

1. Bộ hướng dẫn quản lý sử dụng kháng sinh đang còn dùng làm nguồn huấn luyện.
2. Hồ sơ XML thật và ca audit thật trong repo.
3. Seed rule và hành vi thực tế của engine trong repo.
4. Sau đó mới kết luận về việc cần sửa rule hay chỉ cần ghi nhận ngoại lệ nghiệp vụ.

Ca thực chiến nên đọc kèm cho đợt này:

- `403521` với Cefazolin/Biofazolin trong bối cảnh phẫu thuật sản khoa để luyện cách phát hiện khoảng trống giữa seed rule và bối cảnh điều trị thực tế.

Các tài liệu nên mở theo thứ tự khi huấn luyện:

1. `Bo_nguon_tri_thuc_quan_ly_su_dung_khang_sinh.md`
2. `The_tri_thuc_phap_ly_quan_ly_su_dung_khang_sinh.md`
3. `Ra_soat_ca_khang_sinh_tu_XML_thuc_20260405.md`
4. các ca huấn luyện chi tiết như `403521`, `000434`, `403244`

Các ca kháng sinh mới nên dùng tiếp:

- `000339` cho dự phòng tiêm phụ khoa
- `000589` cho điều trị tiêm và lỗi chuẩn hóa đơn vị
- `OP26000908` cho điều trị uống và nguy cơ rule quá hẹp

## 5. Bước tiếp theo khuyến nghị

Sau đợt này, nên ưu tiên thêm ca thật có XML gốc chứa kháng sinh nhóm Cepha hoặc Metronidazol để AI học từ dữ liệu nguồn, không chỉ từ seed rule.