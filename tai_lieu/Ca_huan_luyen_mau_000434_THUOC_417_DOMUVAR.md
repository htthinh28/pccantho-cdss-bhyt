# CA HUẤN LUYỆN MẪU 000434 - THUOC_417 - DOMUVAR

Phiên bản tài liệu: 1.0  
Ngày cập nhật: 05/04/2026

## 1. Mục tiêu

Tài liệu này là một ca huấn luyện mẫu để dạy AI cách phân tích một hồ sơ giám định thuốc từ dữ liệu audit thật trong repo.

Ca này dùng để huấn luyện 3 kỹ năng:

- đọc kết quả audit thật
- nối audit với rule seed đang chạy
- rút ra kết luận nghiệp vụ và bài học tái sử dụng

## 2. Nguồn dữ liệu sử dụng

- Audit gốc: `test_xml/audit_PC022300479_IP26000139.json`
- Audit đã thay biến cảnh báo: `test_xml/audit_PC022300479_IP26000139_final_bg.json`
- Rule seed liên quan:
  - `THUOC_417`
  - `THUOC_63`
- Nguồn rule: `ma_nguon/tien_ich/du_lieu_luat_thuoc_muc8.jsx`

Giới hạn dữ liệu:

- File XML gốc không nằm trong workspace hiện tại.
- Vì vậy kết luận của ca này bám trên audit đã sinh ra, không tự nhận là đã kiểm chứng trực tiếp từng dòng XML nguồn.

## 3. Bối cảnh ca hồ sơ

- Hồ sơ: `PC022300479_IP26000139.xml`
- `MA_LK`: `000434`
- Loại dữ liệu đang có: kết quả audit JSON
- Tổng cảnh báo trong bản `final_bg`: `11`

Phân bố rule chính:

- `THUOC_417`: 5 cảnh báo
- `THUOC_63`: 3 cảnh báo
- `HC_171`: 1 cảnh báo
- `HD_10`: 1 cảnh báo
- `XML_121`: 1 cảnh báo

Trọng tâm huấn luyện của ca này:

- lỗi thuốc cấp dư theo y lệnh
- lỗi thuốc sai chỉ định thanh toán
- dấu hiệu kê trùng trong cùng ngày

## 4. Vấn đề chính AI cần nhìn ra

AI phải xác định được rằng đây không chỉ là một ca có nhiều lỗi thuốc, mà là một ca có **mẫu sai lặp lại**:

- một nhóm thuốc bị cấp dư nhiều dòng
- một thuốc khác vừa cấp dư vừa sai chỉ định
- có thêm tín hiệu trùng thuốc cùng ngày

Điều này quan trọng vì nó gợi ý:

- khả năng lỗi nhập y lệnh hoặc mapping kê đơn
- khả năng lặp y lệnh theo ngày
- khả năng điều trị không phù hợp với chẩn đoán đã mã hóa

## 5. Dữ liệu đã xác nhận được từ audit

### 5.1. Rule THUOC_417 trên Tenamyd-Cefotaxime 1000

Audit `final_bg` cho thấy 4 dòng cảnh báo lặp cùng mẫu:

- Thuốc: `Tenamyd-Cefotaxime 1000`
- Mã thuốc: `40.173`
- Số lượng kê: `3`
- Y lệnh thực tế: `2 Lọ/ngày x 1 ngày`
- Phần cấp dư: `1 đơn vị`

Diễn giải nghiệp vụ:

- Nếu y lệnh thực tế là 2 lọ trong 1 ngày thì tổng lượng hợp lý là 2.
- Kê 3 lọ tạo chênh `+1`, đủ căn cứ để rule `THUOC_417` đánh cấp dư.

### 5.2. Rule THUOC_417 trên DOMUVAR

Audit `final_bg` cho thấy một cảnh báo rõ ràng:

- Thuốc: `DOMUVAR`
- Mã thuốc: `40.718`
- Số lượng kê: `6`
- Y lệnh thực tế: `2 Ống/ngày x 1 ngày`
- Phần cấp dư: `4 đơn vị`

Diễn giải nghiệp vụ:

- Y lệnh cho thấy lượng hợp lý là 2 ống.
- Kê 6 ống tạo chênh `+4`, đây là mức sai lệch lớn hơn rõ rệt so với nhóm Tenamyd.

### 5.3. Rule THUOC_63 trên DOMUVAR

Audit `final_bg` còn cho thấy 3 cảnh báo `THUOC_63`:

- DOMUVAR chỉ được thanh toán cho:
  - `A09`
  - `K59.1`
  - `R19.7`
- Audit kết luận hồ sơ không có căn cứ chẩn đoán phù hợp ở các trường đang đối chiếu.

Diễn giải nghiệp vụ:

- DOMUVAR ở ca này không chỉ bị cấp dư.
- Nó còn có nguy cơ sai điều kiện thanh toán BHYT nếu chẩn đoán không thuộc nhóm tiêu chảy / loạn khuẩn ruột.

### 5.4. Dấu hiệu kê trùng cùng ngày

Audit có thêm `XML_121`:

- Có dấu hiệu kê trùng 1 loại thuốc nhiều lần trong cùng một ngày y lệnh.

Diễn giải nghiệp vụ:

- Đây là tín hiệu bổ sung giúp AI không dừng ở kết luận “cấp dư”, mà phải nghĩ tới khả năng **trùng y lệnh hoặc lặp dòng thuốc**.

## 6. Liên hệ với rule seed đang chạy

### 6.1. Rule THUOC_417

Seed hiện hành:

- Tên: `Giám định thuốc cấp dư (Dựa trên y lệnh)`
- Điều kiện: `XML2.SO_LUONG > (XML2.SL_MOI_NGAY * XML2.SO_NGAY)`

Điểm AI phải học:

- Đây là rule dễ giải thích nhất cho nghiệp vụ vì dùng ngay dữ liệu trong dòng XML2.
- Khi audit đã thay biến, AI nên ưu tiên đọc bản `final_bg` để lấy con số thực thay vì lặp lại template `{TEN_THUOC}`.

### 6.2. Rule THUOC_63

Seed hiện hành:

- Tên: `[Bacillus subtilis] Kiểm tra Chỉ định ICD-10`
- Mã thuốc: `40.718`
- Điều kiện thanh toán: chỉ phù hợp với `A09`, `K59.1`, `R19.7` hoặc mô tả tương đương trong chẩn đoán ra viện.

Điểm AI phải học:

- Một thuốc có thể đồng thời dính 2 lớp lỗi:
  - sai số lượng
  - sai căn cứ thanh toán

## 7. Kết luận mẫu mà AI nên rút ra

Nếu AI được hỏi phân tích ca này, kết luận chuẩn nên là:

1. Hồ sơ `000434` có mẫu lỗi thuốc lặp nhiều dòng, không phải chỉ một sai sót đơn lẻ.
2. `Tenamyd-Cefotaxime 1000` bị cấp dư lặp lại nhiều dòng theo rule `THUOC_417`, mỗi dòng dư `1` đơn vị so với y lệnh thực tế.
3. `DOMUVAR` vừa bị cấp dư `4` đơn vị theo `THUOC_417`, vừa không có căn cứ chẩn đoán thanh toán phù hợp theo `THUOC_63`.
4. `XML_121` gợi ý có khả năng trùng kê thuốc cùng ngày, cần kiểm tra lại nguồn sinh y lệnh hoặc logic import XML2.
5. Đây là ca phù hợp để dạy AI cách phân biệt:
   - lỗi cấp dư do số lượng
   - lỗi sai chỉ định thanh toán
   - tín hiệu nghi ngờ lặp dòng/y lệnh

## 8. Dữ liệu AI cần yêu cầu xem thêm nếu có XML gốc

Nếu sau này có file XML gốc, AI nên yêu cầu đọc thêm:

- các dòng XML2 của thuốc `40.173` và `40.718`
- `SL_MOI_NGAY`
- `SO_NGAY`
- `SO_LUONG`
- `NGAY_YL`
- chẩn đoán ở XML1:
  - `MA_BENH_CHINH`
  - `MA_BENH_KT`
  - `CHAN_DOAN_RV`

Mục tiêu của bước này là xác nhận:

- lỗi do dữ liệu gốc thật
- hay lỗi do mapping/chuẩn hóa trong quá trình audit

## 9. Bài học huấn luyện cho AI

### 9.1. Bài học nghiệp vụ

- Một thuốc có thể sai ở nhiều lớp cùng lúc.
- Không được dừng ở một rule đầu tiên nhìn thấy.
- Cần gom các rule cùng thuốc để hiểu bản chất vấn đề.

### 9.2. Bài học kỹ thuật

- Khi có cả bản audit template và bản đã thay biến, nên ưu tiên bản đã thay biến để giải thích cho người dùng.
- Nếu thấy nhiều cảnh báo lặp cùng thuốc trong cùng hồ sơ, phải nghĩ tới khả năng trùng dòng hoặc lặp y lệnh.

### 9.3. Bài học quy trình

- Trình tự đúng khi gặp ca như vậy:
  1. đọc rule summary
  2. gom theo từng thuốc
  3. đọc số liệu thực từ cảnh báo đã thay biến
  4. đối chiếu với seed rule
  5. mới kết luận nghiệp vụ

## 10. Cách dùng ca này để huấn luyện AI

Anh có thể dùng ca này theo 3 vòng.

### Vòng 1. Cho AI đọc ca và tóm tắt

Mục tiêu:

- buộc AI đọc đúng số liệu thật
- buộc AI nhận diện thuốc nào lỗi gì

### Vòng 2. Buộc AI liên hệ lại với seed rule

Mục tiêu:

- AI không chỉ lặp lại cảnh báo audit
- AI phải hiểu vì sao rule đánh như vậy

### Vòng 3. Buộc AI rút bài học tái sử dụng

Mục tiêu:

- AI biến 1 ca hồ sơ thành tri thức dùng cho các ca sau

## 11. Prompt gợi ý để luyện AI với ca này

### Prompt 1

- `/Mo Phong Ca Giam Dinh BHYT Ho so 000434, dung audit_PC022300479_IP26000139_final_bg.json, phan tich THUOC_417 va THUOC_63`

### Prompt 2

- `/Trich Xuat The Tri Thuc Giam Dinh Rut ra 1 the tri thuc tu ca 000434 cho rule THUOC_417`

### Prompt 3

- `/Bao Cao Ket Qua Sua Ho So Neu sau nay sua XML2 cua ho so 000434, can viet bao cao ket qua nhu the nao`

## 12. Kết luận

Ca `000434` là một ca huấn luyện tốt vì nó dạy AI cùng lúc nhiều kỹ năng quan trọng:

- đọc audit thật
- giải thích rule thuốc cấp dư
- phát hiện thuốc sai chỉ định thanh toán
- nhận biết mẫu lỗi lặp do kê trùng hoặc nhập liệu chưa chuẩn

Đây là loại ca nên dùng lặp lại trong quá trình huấn luyện AI giám định BHYT vì vừa có số liệu rõ, vừa có giá trị nghiệp vụ cao.