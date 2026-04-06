# THẺ TRI THỨC MẪU NHÓM THUỐC ĐỢT 1

Phiên bản tài liệu: 1.0  
Ngày cập nhật: 05/04/2026

## 1. Mục đích

Tài liệu này chuẩn hóa 6 thẻ tri thức mẫu đầu tiên cho nhóm rule `THUOC` trong repo `ung_dung_cdss_bhyt`.

Phạm vi của bộ này:

- Dùng để huấn luyện AI hiểu cách đọc rule thuốc trong hệ thống.
- Dùng làm mẫu để tiếp tục nhân rộng ra các rule thuốc khác.
- Không thay thế thẩm định nghiệp vụ cuối cùng của chuyên gia giám định.

## 2. Nguồn gốc tri thức

- Seed rule nguồn: `ma_nguon/tien_ich/du_lieu_luat_thuoc_muc8.jsx`
- Wrapper rule thuốc: `ma_nguon/tien_ich/luat_thuoc_hardcoded.jsx`
- Meta mapping engine: `ma_nguon/tien_ich/dong_co_giam_dinh.jsx`

Lưu ý quan trọng:

- Các rule có mã `THUOC_*` đang được engine gắn meta `THUOC_HARDCODED`.
- Chúng chạy trên luồng `XML2 -> hardcoded thuốc` và thuộc phân hệ `LUAT_THUOC`.
- Nhiều rule thuốc đồng thời đọc dữ liệu từ `XML2` và đối chiếu chẩn đoán ở `XML1`.

## 3. Nhóm rule được chọn trong đợt 1

Đợt 1 chọn 6 cụm thuốc đầu tiên trong seed để AI học được đủ các kiểu suy luận cơ bản:

- kiểm tra liều tối đa
- chống chỉ định lâm sàng
- kiểm tra chỉ định ICD-10
- kiểm tra tần suất dùng thuốc
- kiểm tra số lượng cấp phát
- kiểm tra tính nhất quán giữa hướng dẫn và số lượng kê

---

## Thẻ 1. Acetyl leucin (Gikanin)

### 1. Thông tin chung

- Chủ đề: Acetyl leucin / Gikanin
- Nhóm nghiệp vụ: Thuốc, giám định chỉ định và an toàn kê đơn
- Nguồn tài liệu: `THUOC_01`, `THUOC_02`, `THUOC_03` trong `du_lieu_luat_thuoc_muc8.jsx`
- Độ tin cậy: cao trong phạm vi rule seed hiện có

### 2. Mệnh đề nghiệp vụ cốt lõi

- Thuốc Gikanin được hệ thống theo dõi ở 3 góc: liều tối đa/ngày, chống chỉ định thai kỳ, và tính đúng chỉ định theo ICD/chẩn đoán.
- Mục tiêu giám định: tránh quá liều, tránh dùng sai đối tượng, tránh thanh toán sai chẩn đoán.

### 3. Phạm vi áp dụng

- Áp dụng cho XML: `XML2` đối với thuốc, kết hợp `XML1` đối với chẩn đoán
- Điều kiện áp dụng: `XML2.MA_THUOC == '40.685'`
- Điều kiện loại trừ / ngoại lệ: chưa thấy seed nêu ngoại lệ chuyên biệt ngoài các điều kiện chẩn đoán có sẵn

### 4. Dữ liệu cần kiểm tra

- `XML2.MA_THUOC`
- `TONG_LIEU_24H`
- `XML1.MA_BENH_CHINH`
- `XML1.MA_BENH_KT`
- `XML1.CHAN_DOAN_RV`

### 5. Cách suy luận đúng

- Nếu tổng liều 24 giờ vượt `2000mg/ngày` thì coi là vượt ngưỡng an toàn theo rule `THUOC_01`.
- Nếu hồ sơ có chẩn đoán thai nghén `O21` thì coi là chống chỉ định theo rule `THUOC_02`.
- Nếu chẩn đoán không rơi vào nhóm chóng mặt / rối loạn tiền đình (`H81`, `R42`, hoặc chẩn đoán ra viện tương ứng) thì có nguy cơ xuất toán theo `THUOC_03`.

### 6. Ví dụ

- Ví dụ đúng: bệnh nhân chóng mặt `R42`, dùng Gikanin đúng liều `<= 2000mg/ngày`.
- Ví dụ sai: hồ sơ thai nghén `O21` nhưng vẫn xuất hiện Gikanin.
- Ví dụ sai khác: hồ sơ không có `H81`, `R42`, không có mô tả chóng mặt nhưng vẫn thanh toán Gikanin.

### 7. Kiểm chứng thực tế

- Màn hình liên quan: `DocXML`, `SuaFileXML`, báo cáo chi tiết lỗi, dashboard lỗi thuốc
- File mã nguồn liên quan: `du_lieu_luat_thuoc_muc8.jsx`, `luat_thuoc_hardcoded.jsx`, `dong_co_giam_dinh.jsx`
- Cách test lại: kiểm tra dòng thuốc trong XML2 và đối chiếu chẩn đoán XML1 trước khi kết luận đúng/sai

### 8. Bài học rút ra cho AI

- Câu hỏi AI phải tự kiểm tra: thuốc này đang bị sai vì quá liều, sai chẩn đoán, hay chống chỉ định?
- Sai lầm thường gặp: chỉ nhìn mã thuốc mà không đối chiếu chẩn đoán chính, chẩn đoán kèm và chẩn đoán ra viện.
- Khuyến nghị khi trả lời người dùng: nói rõ lỗi nằm ở an toàn kê đơn hay ở điều kiện thanh toán BHYT.

---

## Thẻ 2. Aciclovir / Acyclovir

### 1. Thông tin chung

- Chủ đề: Aciclovir
- Nhóm nghiệp vụ: Thuốc kháng virus, giám định liều, chỉ định và chống chỉ định
- Nguồn tài liệu: `THUOC_04`, `THUOC_05`, `THUOC_06`, `THUOC_07`
- Độ tin cậy: cao trong phạm vi rule seed hiện có

### 2. Mệnh đề nghiệp vụ cốt lõi

- Hệ thống đang kiểm soát 4 mặt: liều tuyệt đối/24 giờ, chống chỉ định suy thận nặng, đúng chỉ định Herpes/Zona, và tần suất dùng đường uống.
- Mục tiêu giám định: tránh nguy cơ độc tính và tránh thanh toán sai bệnh.

### 3. Phạm vi áp dụng

- Áp dụng cho XML: `XML2` kết hợp `XML1`
- Điều kiện áp dụng: `XML2.MA_THUOC == '40.260'`
- Điều kiện loại trừ / ngoại lệ: chưa có ngoại lệ riêng trong seed được đọc

### 4. Dữ liệu cần kiểm tra

- `TONG_LIEU_24H`
- `TAN_SUAT`
- `XML1.MA_BENH_CHINH`
- `XML1.MA_BENH_KT`
- `XML1.CHAN_DOAN_RV`

### 5. Cách suy luận đúng

- Nếu tổng liều vượt `4000mg/ngày` thì cảnh báo quá liều nguy hiểm.
- Nếu chẩn đoán có `N18.4`, `N18.5` thì coi là chống chỉ định lâm sàng theo seed hiện tại.
- Nếu không có bằng chứng Herpes (`B00`) hoặc Zona (`B02`) thì nguy cơ xuất toán vì sai chỉ định.
- Nếu tần suất uống `> 5 lần/ngày` thì sai phác đồ.

### 6. Ví dụ

- Ví dụ đúng: hồ sơ Zona `B02`, dùng Aciclovir đúng tần suất `5 lần/ngày` và tổng liều trong ngưỡng.
- Ví dụ sai: hồ sơ viêm họng thông thường nhưng có Aciclovir.
- Ví dụ nguy hiểm: bệnh nhân suy thận nặng vẫn dùng liều cao Aciclovir.

### 7. Kiểm chứng thực tế

- Màn hình liên quan: `DocXML` tab XML2, chi tiết hồ sơ, báo cáo lỗi
- Cách test lại: đối chiếu chẩn đoán với nhóm Herpes/Zona và kiểm tra cả liều lẫn tần suất trên cùng một y lệnh

### 8. Bài học rút ra cho AI

- Câu hỏi AI phải tự kiểm tra: đây là sai chỉ định hay sai liều/tần suất, hay đồng thời cả hai?
- Sai lầm thường gặp: thấy có mã bệnh liên quan trong chẩn đoán kèm nhưng bỏ sót tình trạng suy thận nặng.
- Khuyến nghị khi trả lời người dùng: ưu tiên nêu rủi ro an toàn trước, sau đó mới nêu rủi ro xuất toán.

---

## Thẻ 3. Adrenalin

### 1. Thông tin chung

- Chủ đề: Adrenalin
- Nhóm nghiệp vụ: Thuốc cấp cứu
- Nguồn tài liệu: `THUOC_08`, `THUOC_09`, `THUOC_10`
- Độ tin cậy: cao trong phạm vi rule seed hiện có

### 2. Mệnh đề nghiệp vụ cốt lõi

- Adrenalin được xem là thuốc cấp cứu, nên hệ thống kiểm tra chặt về chống chỉ định tương đối, số lượng sử dụng bất thường và chẩn đoán cấp cứu tương ứng.
- Mục tiêu giám định: tránh thanh toán không phù hợp cho ca không có căn cứ cấp cứu.

### 3. Phạm vi áp dụng

- Áp dụng cho XML: `XML2` kết hợp `XML1`
- Điều kiện áp dụng: `XML2.MA_THUOC == '40.86'`
- Ngoại lệ: seed hiện tại mới thể hiện chống chỉ định tương đối, chưa thể hiện các ngoại lệ lâm sàng sâu hơn

### 4. Dữ liệu cần kiểm tra

- `XML2.SO_LUONG`
- `XML1.MA_BENH_CHINH`
- `XML1.MA_BENH_KT`
- `XML1.CHAN_DOAN_RV`

### 5. Cách suy luận đúng

- Nếu bệnh nhân có nhóm chẩn đoán tăng huyết áp, đau thắt ngực, rối loạn nhịp (`I10`, `I20`, `I47`) thì có cảnh báo chống chỉ định tương đối.
- Nếu dùng quá `10 ống` thì không tự kết luận sai ngay, nhưng phải chuyển sang nhánh kiểm tra diễn biến bệnh.
- Nếu không có bằng chứng sốc phản vệ, sốc, ngừng tim (`T81.1`, `R57`, `I46`) thì nguy cơ xuất toán cao.

### 6. Ví dụ

- Ví dụ đúng: hồ sơ sốc phản vệ hoặc ngừng tim, có Adrenalin với số lượng phù hợp diễn biến.
- Ví dụ kiểm tra thêm: số lượng `> 10 ống`, cần đối chiếu diễn biến bệnh án.
- Ví dụ sai: không có bệnh cảnh cấp cứu nhưng có Adrenalin trong XML2.

### 7. Kiểm chứng thực tế

- Màn hình liên quan: `DocXML`, `ChiTiet`, báo cáo chi tiết lỗi
- Cách test lại: kiểm tra mã bệnh, chẩn đoán ra viện và số lượng sử dụng; nếu số lượng lớn thì đối chiếu thêm bệnh án thực tế

### 8. Bài học rút ra cho AI

- Câu hỏi AI phải tự kiểm tra: đây là cảnh báo cần xác minh hay là lỗi đủ căn cứ xuất toán?
- Sai lầm thường gặp: thấy thuốc cấp cứu là mặc định hợp lý mà không kiểm tra chẩn đoán nền.
- Khuyến nghị khi trả lời người dùng: tách rõ cảnh báo “kiểm tra thêm” và cảnh báo “xuất toán”.

---

## Thẻ 4. Albendazol

### 1. Thông tin chung

- Chủ đề: Albendazol
- Nhóm nghiệp vụ: Thuốc tẩy giun, giám định liều và số lượng cấp phát
- Nguồn tài liệu: `THUOC_11`, `THUOC_12`
- Độ tin cậy: cao trong phạm vi rule seed hiện có

### 2. Mệnh đề nghiệp vụ cốt lõi

- Hệ thống kiểm tra Albendazol theo hai hướng: quá liều ở trẻ dưới 10kg và cấp phát dư số lượng so với y lệnh.
- Mục tiêu giám định: chặn cấp thuốc vượt liều hoặc cấp không đúng chế độ dùng ngắn ngày.

### 3. Phạm vi áp dụng

- Áp dụng cho XML: `XML2`, có dùng cân nặng từ `XML1`
- Điều kiện áp dụng: `XML2.MA_THUOC == '40.145'`

### 4. Dữ liệu cần kiểm tra

- `XML1.CAN_NANG`
- `TONG_LIEU_1_LAN`
- `XML2.SO_LUONG`
- `CALC_SL_MOI_NGAY`
- `SO_NGAY`

### 5. Cách suy luận đúng

- Nếu trẻ `< 10kg` mà liều một lần `> 200mg` thì coi là quá liều theo seed hiện tại.
- Nếu số lượng cấp vượt quá `CALC_SL_MOI_NGAY * SO_NGAY` thì coi là cấp dư, dễ bị xuất toán.

### 6. Ví dụ

- Ví dụ đúng: trẻ 8kg dùng liều 200mg/lần, số lượng đúng theo số ngày.
- Ví dụ sai: trẻ 8kg nhưng kê 400mg/lần.
- Ví dụ sai khác: cấp nhiều viên hơn số ngày điều trị thực tế.

### 7. Kiểm chứng thực tế

- Màn hình liên quan: `DocXML` XML2, hồ sơ chi tiết
- Cách test lại: đối chiếu cân nặng XML1 và số lượng/tổng liều trong XML2

### 8. Bài học rút ra cho AI

- Câu hỏi AI phải tự kiểm tra: lỗi nằm ở liều trên mỗi lần dùng hay ở tổng số lượng cấp phát?
- Sai lầm thường gặp: kiểm tra số lượng mà quên cân nặng nhi khoa.
- Khuyến nghị khi trả lời người dùng: nêu rõ đây là lỗi an toàn dùng thuốc hay lỗi cấp dư thanh toán.

---

## Thẻ 5. Alfuzosin (Alanboss XL 10)

### 1. Thông tin chung

- Chủ đề: Alfuzosin / Alanboss XL 10
- Nhóm nghiệp vụ: Thuốc điều trị phì đại tuyến tiền liệt, giám định chỉ định và cách dùng
- Nguồn tài liệu: `THUOC_13`, `THUOC_14`, `THUOC_15`
- Độ tin cậy: cao trong phạm vi rule seed hiện có

### 2. Mệnh đề nghiệp vụ cốt lõi

- Hệ thống kiểm tra thuốc này ở 3 điểm: chống chỉ định suy gan/hạ huyết áp tư thế, đúng chỉ định `N40`, và tần suất chuẩn 1 lần/ngày do là dạng phóng thích kéo dài.

### 3. Phạm vi áp dụng

- Áp dụng cho XML: `XML2` kết hợp `XML1`
- Điều kiện áp dụng: `XML2.MA_THUOC == '40.412'`

### 4. Dữ liệu cần kiểm tra

- `XML1.MA_BENH_CHINH`
- `XML1.MA_BENH_KT`
- `XML1.CHAN_DOAN_RV`
- `CALC_TAN_SUAT`

### 5. Cách suy luận đúng

- Nếu hồ sơ có `K72` hoặc `I95.1` thì seed hiện tại xem là chống chỉ định.
- Nếu không có bằng chứng `N40` hoặc mô tả phì đại tuyến tiền liệt thì có nguy cơ xuất toán do sai chỉ định.
- Nếu tần suất dùng `> 1 lần/ngày` thì sai phác đồ do thuốc dạng XL chỉ dùng 1 lần sau ăn.

### 6. Ví dụ

- Ví dụ đúng: bệnh nhân `N40`, dùng 1 lần/ngày sau ăn.
- Ví dụ sai: kê Alfuzosin cho hồ sơ không có bằng chứng phì đại tuyến tiền liệt.
- Ví dụ sai khác: kê 2 lần/ngày dù là dạng XL.

### 7. Kiểm chứng thực tế

- Màn hình liên quan: `DocXML`, `SuaFileXML`, báo cáo lỗi thuốc
- Cách test lại: đọc chẩn đoán trong XML1 rồi đối chiếu tần suất dùng thuốc trong XML2

### 8. Bài học rút ra cho AI

- Câu hỏi AI phải tự kiểm tra: thuốc đúng bệnh chưa, và dạng bào chế có đang bị dùng sai tần suất không?
- Sai lầm thường gặp: thấy đúng bệnh nhưng bỏ sót việc dùng sai tần suất của dạng XL.
- Khuyến nghị khi trả lời người dùng: nhấn mạnh dạng bào chế là chìa khóa suy luận, không chỉ là tên hoạt chất.

---

## Thẻ 6. Alimemazin tartrat (Atilene)

### 1. Thông tin chung

- Chủ đề: Alimemazin tartrat / Atilene
- Nhóm nghiệp vụ: Thuốc chống dị ứng/giảm ho, giám định chống chỉ định, chỉ định và nhất quán y lệnh
- Nguồn tài liệu: `THUOC_16`, `THUOC_17`, `THUOC_18`
- Độ tin cậy: cao trong phạm vi rule seed hiện có

### 2. Mệnh đề nghiệp vụ cốt lõi

- Thuốc này được kiểm tra theo 3 hướng: chống chỉ định ở suy gan/thận nặng, đúng chỉ định dị ứng/mày đay/ho, và số lượng có khớp với hướng dẫn kê chi tiết hay không.

### 3. Phạm vi áp dụng

- Áp dụng cho XML: `XML2` kết hợp `XML1`
- Điều kiện áp dụng: `XML2.MA_THUOC == '40.987'`

### 4. Dữ liệu cần kiểm tra

- `XML1.MA_BENH_CHINH`
- `XML1.MA_BENH_KT`
- `XML1.CHAN_DOAN_RV`
- `XML2.SO_LUONG`
- `CALC_SL_MOI_NGAY`
- `SO_NGAY`

### 5. Cách suy luận đúng

- Nếu có `N18.4`, `N18.5`, `K72` thì seed xem là chống chỉ định.
- Nếu không có bằng chứng `J30`, `L50`, `R05` hoặc mô tả viêm mũi dị ứng, mày đay, ho thì có nguy cơ xuất toán.
- Nếu `XML2.SO_LUONG != CALC_SL_MOI_NGAY * SO_NGAY` thì cảnh báo lỗi dữ liệu/y lệnh không nhất quán.

### 6. Ví dụ

- Ví dụ đúng: hồ sơ ho hoặc dị ứng, số lượng thuốc đúng theo số ngày và liều mỗi ngày.
- Ví dụ sai: hồ sơ suy gan nặng nhưng vẫn dùng Atilene.
- Ví dụ lỗi dữ liệu: hướng dẫn ngày 2 lần trong 5 ngày nhưng tổng số lượng lại không khớp 10 đơn vị.

### 7. Kiểm chứng thực tế

- Màn hình liên quan: `DocXML`, `SuaFileXML`, báo cáo chi tiết lỗi
- Cách test lại: kiểm tra cả căn cứ bệnh và phép tính số lượng kê thuốc

### 8. Bài học rút ra cho AI

- Câu hỏi AI phải tự kiểm tra: đây là sai bệnh, sai chống chỉ định, hay sai dữ liệu kê đơn?
- Sai lầm thường gặp: chỉ nhìn mã bệnh mà không so khớp tổng số lượng với hướng dẫn dùng thuốc.
- Khuyến nghị khi trả lời người dùng: nếu là lỗi dữ liệu, cần nói rõ cách tính số lượng kỳ vọng.

---

## 4. Cách dùng bộ thẻ này để huấn luyện AI

Quy trình khuyến nghị:

1. Dùng các thẻ này làm mẫu cấu trúc.
2. Mỗi lần chọn thêm 1 cụm thuốc mới trong `du_lieu_luat_thuoc_muc8.jsx`.
3. Yêu cầu AI trích xuất thành thẻ mới theo cùng khuôn.
4. Đối chiếu lại với ca hồ sơ thật trong `test_xml/` trước khi tin dùng ở mức nghiệp vụ.

## 5. Bước tiếp theo khuyến nghị

Sau bộ mẫu này, nên tiếp tục theo thứ tự:

- Allopurinol
- Ambroxol
- Nhóm thuốc cản quang
- Nhóm thuốc liên quan phẫu thuật/thủ thuật
- Nhóm thuốc hay gây false positive tại đơn vị