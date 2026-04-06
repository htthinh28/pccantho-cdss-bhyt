# THẺ TRI THỨC MẪU NHÓM THUỐC ĐỢT 2

Phiên bản tài liệu: 1.0  
Ngày cập nhật: 05/04/2026

## 1. Mục đích

Tài liệu này mở rộng bộ huấn luyện nhóm `THUOC` sau đợt 1, tập trung vào các mẫu suy luận có giá trị thực chiến cao hơn:

- cấp dư theo định mức chung
- cấp dư dựa trên y lệnh thực tế
- chỉ định thuốc theo ICD-10
- chống chỉ định lâm sàng
- tần suất chuẩn theo dạng dùng
- mối liên hệ giữa thuốc cản quang và dịch vụ chẩn đoán hình ảnh

## 2. Nguồn gốc tri thức

- `ma_nguon/tien_ich/du_lieu_luat_thuoc_muc8.jsx`
- `ma_nguon/tien_ich/luat_thuoc_hardcoded.jsx`
- `ma_nguon/tien_ich/dong_co_giam_dinh.jsx`

## 3. Thẻ tri thức mẫu đợt 2

---

## Thẻ 7. Allopurinol / Agigout 300

### 1. Thông tin chung

- Chủ đề: Allopurinol
- Nhóm nghiệp vụ: Thuốc điều trị Gout / sỏi uric
- Nguồn tài liệu: `THUOC_19`, `THUOC_20`, `THUOC_21`
- Độ tin cậy: cao trong phạm vi seed hiện có

### 2. Mệnh đề nghiệp vụ cốt lõi

- Hệ thống kiểm tra Allopurinol ở 3 mặt: chống chỉ định suy thận/suy gan nặng, cấp dư số lượng, và đúng chỉ định điều trị Gout hoặc sỏi acid uric.

### 3. Phạm vi áp dụng

- Áp dụng cho XML: `XML2` kết hợp `XML1`
- Điều kiện áp dụng: `XML2.MA_THUOC == '40.59'`

### 4. Dữ liệu cần kiểm tra

- `XML1.MA_BENH_CHINH`
- `XML1.MA_BENH_KT`
- `XML1.CHAN_DOAN_RV`
- `XML2.SO_LUONG`
- `CALC_SL_MOI_NGAY`
- `SO_NGAY`

### 5. Cách suy luận đúng

- Nếu có `N18.4`, `N18.5`, `K72` thì cảnh báo chống chỉ định theo seed hiện tại.
- Nếu số lượng cấp vượt `CALC_SL_MOI_NGAY * SO_NGAY` thì coi là cấp dư.
- Nếu không có `M10`, `N20` hoặc mô tả Gout / sỏi thận acid uric thì nguy cơ xuất toán cao do sai chỉ định.

### 6. Bài học rút ra cho AI

- Phải tách rõ 3 nhánh lỗi: chống chỉ định, cấp dư, sai chỉ định.
- Với thuốc điều trị mạn tính, số lượng và chẩn đoán đều quan trọng, không được kiểm tra đơn lẻ.

---

## Thẻ 8. Ambroxol

### 1. Thông tin chung

- Chủ đề: Ambroxol
- Nhóm nghiệp vụ: Thuốc long đờm / điều trị hô hấp
- Nguồn tài liệu: `THUOC_22`, `THUOC_23`, `THUOC_24`, `THUOC_25`
- Độ tin cậy: cao trong phạm vi seed hiện có

### 2. Mệnh đề nghiệp vụ cốt lõi

- Ambroxol đang được kiểm tra theo dạng dùng và bối cảnh lâm sàng:
  - viên: tối đa 3 lần/ngày
  - chai/siro: cảnh báo khi > 3 lần/ngày
  - chống chỉ định ở loét dạ dày tiến triển
  - chỉ thanh toán cho nhóm viêm hô hấp hoặc ho

### 3. Phạm vi áp dụng

- Áp dụng cho XML: `XML2` kết hợp `XML1`
- Điều kiện áp dụng: `XML2.MA_THUOC == '40.988'`

### 4. Dữ liệu cần kiểm tra

- `XML2.DON_VI_TINH`
- `CALC_TAN_SUAT`
- `XML1.MA_BENH_CHINH`
- `XML1.MA_BENH_KT`
- `XML1.CHAN_DOAN_RV`

### 5. Cách suy luận đúng

- Viên Ambroxol dùng `> 3 lần/ngày` là sai phác đồ.
- Siro/chai `> 3 lần/ngày` là cảnh báo cần xác minh thêm.
- Nếu có `K25`, `K26` thì xem là chống chỉ định.
- Nếu không có `J06`, `J20`, `R05` hoặc mô tả viêm hô hấp/ho thì có nguy cơ xuất toán.

### 6. Bài học rút ra cho AI

- Cùng một mã thuốc nhưng cách diễn giải phải phụ thuộc dạng dùng.
- Luôn phân biệt cảnh báo lâm sàng với lỗi xuất toán BHYT.

---

## Thẻ 9. Bacillus subtilis / DOMUVAR

### 1. Thông tin chung

- Chủ đề: DOMUVAR
- Nhóm nghiệp vụ: Thuốc vi sinh đường ruột
- Nguồn tài liệu: `THUOC_62`, `THUOC_63`
- Độ tin cậy: cao trong phạm vi seed hiện có

### 2. Mệnh đề nghiệp vụ cốt lõi

- DOMUVAR được hệ thống kiểm tra ở 2 mặt: chống chỉ định tắc ruột và chỉ định thanh toán theo nhóm tiêu chảy/loạn khuẩn ruột.

### 3. Phạm vi áp dụng

- Áp dụng cho XML: `XML2` kết hợp `XML1`
- Điều kiện áp dụng: `XML2.MA_THUOC == '40.718'`

### 4. Dữ liệu cần kiểm tra

- `XML1.MA_BENH_CHINH`
- `XML1.MA_BENH_KT`
- `XML1.CHAN_DOAN_RV`

### 5. Cách suy luận đúng

- Nếu có `K56` thì coi là chống chỉ định theo rule seed.
- Nếu không có `A09`, `K59.1`, `R19.7` hoặc mô tả tiêu chảy / rối loạn nhu động ruột thì nguy cơ xuất toán do sai chỉ định.

### 6. Bài học rút ra cho AI

- DOMUVAR là ví dụ tốt cho kiểu thuốc dễ bị dùng “hỗ trợ” nhưng không đủ căn cứ thanh toán BHYT.
- Cần kiểm tra cả chẩn đoán chính, chẩn đoán kèm và chẩn đoán ra viện, không chỉ một trường.

---

## Thẻ 10. Giám định thuốc cấp dư theo định mức chung

### 1. Thông tin chung

- Chủ đề: Cấp dư thuốc theo định mức tính toán
- Nhóm nghiệp vụ: Kiểm tra số lượng cấp phát
- Nguồn tài liệu: `THUOC_416`
- Độ tin cậy: cao trong phạm vi seed hiện có

### 2. Mệnh đề nghiệp vụ cốt lõi

- Rule `THUOC_416` kiểm tra xem số lượng thuốc có vượt định mức được tính từ số lượng mỗi ngày và số ngày điều trị hay không.

### 3. Phạm vi áp dụng

- Áp dụng cho XML: `XML2`
- Điều kiện áp dụng: `SO_LUONG > (CALC_SL_MOI_NGAY * SO_NGAY)`

### 4. Dữ liệu cần kiểm tra

- `SO_LUONG`
- `CALC_SL_MOI_NGAY`
- `SO_NGAY`

### 5. Cách suy luận đúng

- Nếu số lượng cấp lớn hơn định mức kỳ vọng thì coi là cấp dư.
- Đây là rule phù hợp khi engine đã tính được định mức ngày điều trị chuẩn hóa.

### 6. Bài học rút ra cho AI

- Rule này là lớp kiểm tra tổng quát, hữu ích để rà nhiều thuốc.
- Khi gặp ca thực tế, cần so sánh nó với `THUOC_417` để xem nên tin vào định mức tính toán hay y lệnh trực tiếp trong XML.

---

## Thẻ 11. Giám định thuốc cấp dư dựa trên y lệnh

### 1. Thông tin chung

- Chủ đề: Cấp dư thuốc theo y lệnh thực tế
- Nhóm nghiệp vụ: Kiểm tra số lượng cấp phát theo kê đơn cụ thể
- Nguồn tài liệu: `THUOC_417`
- Độ tin cậy: rất cao cho huấn luyện ca thực chiến vì dễ giải thích cho nghiệp vụ

### 2. Mệnh đề nghiệp vụ cốt lõi

- Rule `THUOC_417` so trực tiếp số lượng đã kê với số lượng đáng ra phải có theo `SL_MOI_NGAY * SO_NGAY` trong chính dòng XML2.

### 3. Phạm vi áp dụng

- Áp dụng cho XML: `XML2`
- Điều kiện áp dụng: `XML2.SO_LUONG > (XML2.SL_MOI_NGAY * XML2.SO_NGAY)`

### 4. Dữ liệu cần kiểm tra

- `XML2.SO_LUONG`
- `XML2.SL_MOI_NGAY`
- `XML2.SO_NGAY`
- đơn vị dùng thuốc như `Lọ`, `Ống`, `Viên`

### 5. Cách suy luận đúng

- Đây là rule dễ trình bày nhất cho người nghiệp vụ vì công thức đơn giản và nằm ngay trên y lệnh.
- Nếu số lượng kê vượt tích `SL_MOI_NGAY * SO_NGAY` thì có căn cứ rõ ràng để cảnh báo xuất toán.

### 6. Bài học rút ra cho AI

- Khi có dữ liệu `SL_MOI_NGAY` và `SO_NGAY` rõ ràng, ưu tiên dùng cách giải thích của `THUOC_417`.
- Đây là rule rất hợp để dạy AI cách đọc sai lệch thuốc theo hồ sơ thực tế.

---

## Thẻ 12. Thuốc cản quang và dịch vụ CĐHA

### 1. Thông tin chung

- Chủ đề: Thuốc cản quang
- Nhóm nghiệp vụ: Liên hệ XML2 thuốc với XML3 dịch vụ chẩn đoán hình ảnh
- Nguồn tài liệu: `THUOC_464`, `THUOC_465`
- Độ tin cậy: cao trong phạm vi seed hiện có

### 2. Mệnh đề nghiệp vụ cốt lõi

- Nếu đã dùng thuốc cản quang, hồ sơ phải có ghi nhận tiền sử dị ứng và phải có dịch vụ chẩn đoán hình ảnh tương ứng.

### 3. Phạm vi áp dụng

- Áp dụng cho XML: `XML2`, đối chiếu `XML1` và `XML3`
- Điều kiện áp dụng:
  - `XML2.MA_NHOM == 'CAN_QUANG'`
  - `COUNT_IF(XML3, MA_NHOM IN ('3','7'))`

### 4. Dữ liệu cần kiểm tra

- `XML2.MA_NHOM`
- `XML1.GHI_CHU_DI_UNG`
- `XML3.MA_NHOM`

### 5. Cách suy luận đúng

- Nếu thiếu thông tin tiền sử dị ứng thì cảnh báo chất lượng/JCI.
- Nếu có thuốc cản quang mà không có DVKT chẩn đoán hình ảnh tương ứng thì có nguy cơ xuất toán.

### 6. Bài học rút ra cho AI

- Đây là kiểu rule giao cắt nhiều XML, rất phù hợp để nâng AI từ đọc thuốc đơn thuần sang đọc quy trình giám định.
- Thuốc cản quang thường không thể kết luận chỉ từ XML2 mà phải đối chiếu XML3.

## 4. Cách dùng bộ thẻ đợt 2

Nên dùng đợt 2 theo thứ tự:

1. Học `THUOC_416` và `THUOC_417` trước để nắm kiểu lỗi cấp dư.
2. Học `THUOC_63` với DOMUVAR để nắm sai chỉ định thanh toán.
3. Học Allopurinol và Ambroxol để luyện kiểu suy luận đa điều kiện.
4. Học nhóm cản quang để tập đối chiếu liên XML.

## 5. Bước tiếp theo khuyến nghị

Sau tài liệu này, nên tiếp tục thêm:

- nhóm kháng sinh và thuốc tim mạch
- nhóm thuốc liên quan cản quang/phẫu thuật
- nhóm false positive hoặc false negative đã gặp tại đơn vị