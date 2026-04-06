# RÀ SOÁT CA KHÁNG SINH TỪ XML THẬT

Phiên bản tài liệu: 1.0  
Ngày cập nhật: 05/04/2026

## 1. Mục tiêu

Tài liệu này tổng hợp kết quả quét kho XML thật trong `tai_nguyen/` để chọn các ca đại diện phục vụ huấn luyện AI về:

- kháng sinh điều trị đường tiêm
- kháng sinh dự phòng đường tiêm
- kháng sinh điều trị đường uống
- kháng sinh uống có bối cảnh cần phân biệt giữa điều trị và dự phòng
- ca mơ hồ hoặc dễ tạo false positive, false negative

## 2. Phương pháp rà soát

- Dùng script: `scripts/scan_antibiotic_cases.js`
- Thư mục quét: `tai_nguyen/`
- Kết quả máy đọc được lưu tại: `test_xml/antibiotic_case_scan.json`

Script hiện làm 4 việc:

1. đi qua toàn bộ file XML trong `tai_nguyen/`
2. giải mã XML con từ `FILEHOSO` nếu hồ sơ là gói ngoài, đồng thời vẫn đọc được XML trực tiếp
3. nhận diện các dòng thuốc nghi là kháng sinh từ XML2
4. phân loại sơ bộ theo:
   - đường dùng
   - bối cảnh điều trị hay dự phòng

## 3. Kết quả tổng quan

- Số file XML đã quét: `1152`
- Số dòng thuốc nghi là kháng sinh: `216`

Phân bố sơ bộ theo nhóm:

- `uong | co_the_dieu_tri`: `69`
- `tiem_or_truyen | co_the_dieu_tri`: `64`
- `tiem_or_truyen | co_the_du_phong`: `38`
- `khong_ro | co_the_dieu_tri`: `28`
- `khong_ro | co_the_du_phong`: `11`
- `uong | co_the_du_phong`: `3`
- `uong | chua_phan_loai`: `3`

Nhận xét nhanh:

- Kho XML mới rất mạnh về ca `kháng sinh dự phòng đường tiêm`, đặc biệt là `Biofazolin / Cefazolin` trong sản khoa và các thủ thuật phụ khoa.
- Nhóm `kháng sinh điều trị đường uống` cũng khá dày, chủ yếu là `Cepmox-Clav` và `Ciprofloxacin`.
- `Kháng sinh dự phòng đường uống` xuất hiện rất ít và cần đọc kỹ bối cảnh trước khi kết luận.

## 4. Các ca đại diện nên ưu tiên huấn luyện

### 4.1. Nhóm kháng sinh dự phòng đường tiêm

#### Ca 1. `403521` - Cefazolin/Biofazolin trong sản khoa

- File: `tai_nguyen/xml/QD130_94170_202603_202603201530_PC-022601440.xml`
- `MA_LK`: `403521`
- Thuốc: `Biofazolin`
- Đường dùng: tiêm/truyền
- Bối cảnh: `O34.2`, con lần 2, thai đủ tháng, đau vết mổ cũ, chăm sóc bà mẹ vì tử cung có sẹo mổ trước đó
- Liều đọc được: `Ngày Tiêm mạch chậm 1 lần, mỗi lần 2 lọ`

Giá trị huấn luyện:

- rất phù hợp để dạy AI cách đọc `kháng sinh dự phòng quanh phẫu thuật/sản khoa`
- thích hợp cho bài học `rule coverage gap` vì có bối cảnh dự phòng rõ nhưng không phải lúc nào audit thuốc cũng bắn cảnh báo

#### Ca 2. `000435` - Biofazolin trong bối cảnh sẹo mổ cũ

- File: `tai_nguyen/op/PC022602069_000435.xml`
- `MA_LK`: `000435`
- Thuốc: `Biofazolin`
- ICD chính: `O34.2`
- Liều: `2 Lọ/lần * 1 lần/ngày * 01 ngày`

Giá trị huấn luyện:

- ca gọn, dễ đọc, rất hợp để dạy nguyên tắc `kháng sinh dự phòng ngắn ngày`

#### Ca 3. `000339` - Biofazolin trong thủ thuật phụ khoa

- File: `tai_nguyen/op/PC022601324_000339.xml`
- `MA_LK`: `000339`
- Thuốc: `Biofazolin`
- ICD chính: `N84.0`
- Bối cảnh: `Polyp thân tử cung`
- Liều: `2 Lọ/lần * 1 lần/ngày * 01 ngày`

Giá trị huấn luyện:

- dạy AI rằng dự phòng không chỉ có mổ lấy thai mà còn gặp trong các thủ thuật/surgery phụ khoa

### 4.2. Nhóm kháng sinh điều trị đường tiêm

#### Ca 4. `000434` - Tenamyd-Cefotaxime 1000

- File: `tai_nguyen/op/PC022300479_000434.xml`
- `MA_LK`: `000434`
- Thuốc: `Tenamyd-Cefotaxime 1000`
- Bối cảnh: `J02` viêm họng cấp
- Liều: `1 Lọ/lần * 2 lần/ngày * 01 ngày`

Giá trị huấn luyện:

- là ca đã có tài liệu huấn luyện sẵn
- có thể nối giữa `XML thật` và `audit thật`

#### Ca 5. `000589` - Tenamyd-Cefotaxime 1000 trong viêm amydan cấp

- File: `tai_nguyen/xml2_ip/PC022300757_000589.xml`
- `MA_LK`: `000589`
- Thuốc: `Tenamyd-Cefotaxime 1000`
- ICD chính: `J03`
- Liều: `550 mg/lần * 3 lần/ngày * 01 ngày`

Giá trị huấn luyện:

- phù hợp để so sánh với `000434` vì cùng hoạt chất nhưng khác cách ghi liều

#### Ca 6. `000393` - Tenamyd-Cefotaxime 1000 trong viêm phế quản cấp

- File: `tai_nguyen/xml2_ip/PC022406784_IP26000098.xml`
- `MA_LK`: `000393`
- Thuốc: `Tenamyd-Cefotaxime 1000`
- ICD chính: `J20`
- Liều: `550 mg/lần * 1 lần/ngày * 01 ngày`

Giá trị huấn luyện:

- cho phép AI học cách đối chiếu `kháng sinh điều trị` với bối cảnh hô hấp thay vì bối cảnh phẫu thuật

### 4.3. Nhóm kháng sinh điều trị đường uống

#### Ca 7. `OP26000908` - Amoxicillin/Clavulanate trong tai mũi họng

- File: `tai_nguyen/op/PC022101042_OP26000908.xml`
- `MA_LK`: `OP26000908`
- Thuốc: `Cepmox-Clav 875 mg/125 mg`
- Bối cảnh: thủng màng nhĩ, viêm tai giữa, viêm mũi dị ứng
- Liều: `1 Viên/lần * 3 lần/ngày * 7 ngày`

Giá trị huấn luyện:

- rất phù hợp cho thẻ `Amoxicillin/Clavulanate` vì có đường uống rõ, liều rõ, và chẩn đoán dễ hiểu

#### Ca 8. `OP26001050` - Ciprofloxacin trong viêm bàng quang / niệu đạo

- File: `tai_nguyen/op/PC022209289_OP26001050.xml`
- `MA_LK`: `OP26001050`
- Thuốc: `Ciprofloxacin`
- Bối cảnh: `N30.8`, `N34`
- Liều: `1 Viên/lần * 2 lần/ngày * 7 ngày`

Giá trị huấn luyện:

- đại diện tốt cho kháng sinh điều trị đường uống ở tiết niệu

#### Ca 9. `OP26002036` - Amoxicillin/Clavulanate trong áp xe da

- File: `tai_nguyen/op/PC022406019_OP26002036.xml`
- `MA_LK`: `OP26002036`
- Thuốc: `Cepmox-Clav 875 mg/125 mg`
- Bối cảnh: `L02.2` áp xe da, nhọt, cụm nhọt ở thân; áp xe vú đã tháo mủ
- Liều: `1 Viên/lần * 2 lần/ngày * 10 ngày`

Giá trị huấn luyện:

- phù hợp để dạy AI về bối cảnh điều trị sau dẫn lưu / xử trí ổ nhiễm khuẩn da mô mềm

### 4.4. Nhóm uống có bối cảnh cần phân biệt điều trị và dự phòng

#### Ca 10. `OP26003732` - Amoxicillin/Clavulanate sau mổ u bả lưng

- File: `tai_nguyen/op/PC022110658_OP26003732.xml`
- `MA_LK`: `OP26003732`
- Thuốc: `Cepmox-Clav 875 mg/125 mg`
- Bối cảnh: `D23.5`, mổ u bả lưng nhiễm
- Liều: `1 Viên/lần * 2 lần/ngày * 7 ngày`

Giá trị huấn luyện:

- đây là ca rất đáng dạy vì không nên kết luận vội là `dự phòng` chỉ vì có chữ `mổ`
- chữ `nhiễm` làm thay đổi đáng kể cách hiểu sang điều trị hoặc ít nhất là hậu phẫu có biến chứng nhiễm

#### Ca 11. `000402` - Tinidazol hậu phẫu hẹp môn vị

- File: `tai_nguyen/xml2_ip/PC022600755_IP26000107.xml`
- `MA_LK`: `000402`
- Thuốc: `Tinidazol`
- Bối cảnh: `A04.9`; hậu phẫu hẹp môn vị
- Liều: `1 Viên/lần * 2 lần/ngày * 01 ngày`

Giá trị huấn luyện:

- là ca hiếm để dạy AI cách phân biệt `kháng sinh/kháng khuẩn đường uống sau mổ` với `dự phòng phẫu thuật đường uống`

## 5. Các ca mơ hồ nên dùng cho huấn luyện false positive hoặc false negative

### Ca 12. `000336` - Cefotaxime nhưng route không rõ hoàn toàn

- File: `tai_nguyen/op/PC022404459_000336.xml`
- `MA_LK`: `000336`
- Thuốc: `Tenamyd-Cefotaxime 1000`
- Bối cảnh: tay chân miệng bội nhiễm, viêm họng cấp không đặc hiệu
- Liều: `750 mg/lần * 2 lần/ngày * 01 ngày`

Lý do giữ lại cho huấn luyện:

- hệ thống quét nhận diện là `không rõ đường dùng`
- đây là mẫu tốt để dạy AI không nên khẳng định quá mức khi dữ liệu route chưa đủ rõ

### Ca 13. `OP26000815` - Amoxicillin/Clavulanate ở vết thương hở, bỏng độ II

- File: `tai_nguyen/op/PC022601043_OP26000815.xml`
- `MA_LK`: `OP26000815`
- Thuốc: `Cepmox-Clav 875 mg/125 mg`
- Bối cảnh: `S91`, bỏng độ II
- Liều: `1 Viên/lần * 2 lần/ngày * 7 ngày`

Lý do giữ lại cho huấn luyện:

- không rõ ngay là điều trị nhiễm khuẩn, dự phòng vết thương, hay kê theo thói quen
- rất thích hợp cho bài tập `hãy chỉ ra dữ liệu còn thiếu trước khi kết luận`

## 6. Kết luận bước rà soát

Sau đợt quét này, bộ huấn luyện kháng sinh có thể chia thành 4 cụm rõ ràng:

1. `Cefazolin/Biofazolin dự phòng tiêm` trong sản khoa, phụ khoa và thủ thuật
2. `Cefotaxime điều trị tiêm` trong hô hấp và nhiễm khuẩn cấp
3. `Amoxicillin/Clavulanate` và `Ciprofloxacin` điều trị đường uống trong tai mũi họng, tiết niệu, da mô mềm
4. một nhóm nhỏ các ca `mơ hồ hoặc tranh chấp` để huấn luyện AI không kết luận vội

## 7. Cách dùng kết quả này cho bước tiếp theo

- Dùng `403521`, `000435`, `000339` để huấn luyện sâu về `kháng sinh dự phòng đường tiêm`.
- Dùng `000434`, `000589`, `000393` để huấn luyện `kháng sinh điều trị đường tiêm`.
- Dùng `OP26000908`, `OP26001050`, `OP26002036` để huấn luyện `kháng sinh điều trị đường uống`.
- Dùng `OP26003732`, `000402`, `OP26000815` để huấn luyện AI về `ca khó`, `ngoại lệ`, và `khoảng trống dữ liệu`.