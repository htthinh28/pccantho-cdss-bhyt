# THẺ TRI THỨC PHÁP LÝ VỀ QUẢN LÝ SỬ DỤNG KHÁNG SINH

Phiên bản tài liệu: 1.1  
Ngày cập nhật: 08/04/2026

## 1. Mục đích

Tài liệu này chuẩn hóa các nguyên tắc pháp lý và nghiệp vụ cốt lõi để AI dùng khi:

- phân tích ca kháng sinh điều trị
- phân tích ca kháng sinh dự phòng phẫu thuật
- giải thích vì sao một rule stewardship có ý nghĩa
- nhận diện chỗ lệch giữa `nguồn chuyên môn` và `logic engine đang chạy`

Danh mục URL và thứ tự ưu tiên nguồn gốc: **`Bo_nguon_tri_thuc_quan_ly_su_dung_khang_sinh.md`** (bản 1.1+).

Nguồn nền dùng để rút thẻ:

- `Quyết định 5631/QĐ-BYT năm 2020`
- `Quyết định 2115/QĐ-BYT ngày 11/05/2023` và sổ tay kèm theo
- `Hướng dẫn sử dụng kháng sinh` bản cập nhật cuối khi in `09/01/2015`
- `British National Formulary - BNF 85` cho nguyên tắc dùng kháng sinh trẻ em
- `15/VBHN-BYT năm 2025` cho đối chiếu phạm vi thanh toán thuốc BHYT

Lưu ý phạm vi:

- Đây là bộ `thẻ tri thức huấn luyện`, không thay thế việc mở tài liệu gốc khi cần trích nguyên văn hoặc tranh luận pháp lý chi tiết.

---

## Thẻ PL-01. Mục tiêu của chương trình quản lý sử dụng kháng sinh

### 1. Mệnh đề cốt lõi

- Quản lý sử dụng kháng sinh không chỉ nhằm giảm chi phí thanh toán.
- Mục tiêu đồng thời là:
  - tối ưu hiệu quả điều trị
  - giảm kháng thuốc
  - giảm độc tính và biến cố bất lợi
  - chuẩn hóa thực hành kê đơn trong bệnh viện

### 2. Ý nghĩa cho AI

- Khi gặp rule liên quan `hội chẩn`, `kháng sinh đồ`, `TDM`, `giám sát xét nghiệm`, AI không được diễn đạt như một lỗi kế toán đơn thuần.
- AI phải hiểu đây là lớp `stewardship` và `an toàn điều trị`.

### 3. Câu hỏi kiểm tra nhanh

- Cảnh báo này đang bảo vệ `thanh toán`, `an toàn`, hay `quản trị sử dụng kháng sinh`?

---

## Thẻ PL-02. Kháng sinh dự phòng phẫu thuật phải khác kháng sinh điều trị

### 1. Mệnh đề cốt lõi

- Kháng sinh dự phòng phẫu thuật là kháng sinh dùng để ngăn ngừa nhiễm khuẩn quanh mổ, không mặc nhiên đồng nghĩa với điều trị nhiễm khuẩn.
- Không được gộp chung mọi trường hợp `sau mổ` thành `dự phòng` nếu hồ sơ đã có bằng chứng nhiễm khuẩn.

### 2. Dữ liệu AI phải đọc

- `MA_PTTT_QT`
- XML3 có thủ thuật/phẫu thuật gì
- chẩn đoán nhiễm khuẩn ở XML1
- diễn biến bệnh ở XML5
- thời gian và thời lượng dùng thuốc ở XML2

### 3. Ý nghĩa cho AI

- Nếu hồ sơ có `mổ` nhưng đồng thời có `nhiễm`, `áp xe`, `bội nhiễm`, `viêm mủ`, AI phải đặt câu hỏi liệu đây là `điều trị` hay `dự phòng kéo dài`.

---

## Thẻ PL-03. Nguyên tắc thời điểm dùng kháng sinh dự phòng

### 1. Mệnh đề cốt lõi

- Kháng sinh dự phòng chỉ có ý nghĩa khi gắn chặt với thời điểm phẫu thuật/thủ thuật.
- Nếu thời điểm dùng lệch xa bối cảnh mổ, giá trị dự phòng giảm đi và cần xem lại chỉ định thực tế.

### 2. Dữ liệu cần đối chiếu

- `XML2.NGAY_YL`
- `XML3.NGAY_YL`
- `XML3.NGAY_TH_YL`
- các dấu mốc mổ hoặc thủ thuật trong hồ sơ

### 3. Ý nghĩa cho AI

- AI không nên chỉ đọc `SO_NGAY`; phải đọc cả `thời điểm khởi đầu` so với can thiệp phẫu thuật.

---

## Thẻ PL-04. Kháng sinh dự phòng không nên kéo dài không có căn cứ

### 1. Mệnh đề cốt lõi

- Tinh thần chung của tài liệu quản lý sử dụng kháng sinh là hạn chế kéo dài kháng sinh dự phòng khi không có bằng chứng chuyển sang nhiễm khuẩn thật.

### 2. Dấu hiệu AI cần tìm

- thời lượng dùng vượt quá khoảng dự phòng thông thường
- không có ICD hoặc diễn biến chứng minh nhiễm khuẩn
- không có xét nghiệm, cấy hoặc hội chẩn bổ sung giải thích vì sao kéo dài

### 3. Ý nghĩa cho AI

- Đây là nền giải thích cho các rule kiểu `dự phòng quá 24 giờ`.
- Nếu hồ sơ kéo dài hơn nhưng có bằng chứng nhiễm khuẩn, AI phải chuyển tư duy từ `dự phòng` sang `điều trị`.

---

## Thẻ PL-05. Kháng sinh điều trị phải gắn với chẩn đoán và ổ nhiễm khuẩn

### 1. Mệnh đề cốt lõi

- Kháng sinh điều trị phải có căn cứ từ vị trí nhiễm khuẩn, mức độ bệnh, chẩn đoán, và bối cảnh lâm sàng.

### 2. Dữ liệu cần đọc

- ICD chính và kèm theo
- chẩn đoán vào viện, ra viện
- diễn biến lâm sàng
- kết quả xét nghiệm liên quan nếu có

### 3. Ý nghĩa cho AI

- Khi phản biện các rule chỉ định thuốc theo ICD-10, AI phải nhớ rằng `ICD` là một căn cứ quan trọng nhưng không phải căn cứ duy nhất.
- Nếu bối cảnh lâm sàng mạnh mà ICD chưa phản ánh đủ, AI phải ghi nhận khả năng `thiếu mã hóa` hoặc `khoảng trống logic của rule`.

---

## Thẻ PL-06. Cần ưu tiên lấy bằng chứng vi sinh khi phù hợp

### 1. Mệnh đề cốt lõi

- Chương trình quản lý sử dụng kháng sinh nhấn mạnh việc dùng bằng chứng vi sinh và kháng sinh đồ khi cần, đặc biệt với kháng sinh phổ rộng hoặc nhóm cần kiểm soát.

### 2. Ý nghĩa cho AI

- Khi hồ sơ dùng kháng sinh mạnh, kéo dài, hoặc phối hợp nhiều loại, AI nên chủ động hỏi thêm:
  - có nuôi cấy không
  - có kháng sinh đồ không
  - có điều chỉnh thuốc theo kết quả không

### 3. Nhóm rule liên quan trong repo

- các rule về `KS_DO`
- các rule stewardship cho nhóm `G3`

---

## Thẻ PL-07. Đánh giá lại kháng sinh sau một khoảng điều trị ban đầu

### 1. Mệnh đề cốt lõi

- Tinh thần quản lý sử dụng kháng sinh là phải đánh giá lại sau giai đoạn đầu điều trị để quyết định:
  - tiếp tục
  - đổi thuốc
  - xuống thang
  - ngừng thuốc

### 2. Ý nghĩa cho AI

- Với ca nội trú kéo dài nhiều ngày, AI không nên chỉ nhìn ngày đầu kê thuốc.
- AI cần đọc toàn bộ diễn biến, xét nghiệm và thay đổi phác đồ nếu có.

---

## Thẻ PL-08. Kháng sinh cần kiểm soát phải có quy trình phê duyệt hoặc hội chẩn phù hợp

### 1. Mệnh đề cốt lõi

- Một số kháng sinh cần được quản lý chặt hơn thông qua hội chẩn, phê duyệt, hoặc điều kiện bổ sung tùy mô hình bệnh viện.

### 2. Ý nghĩa cho AI

- Khi gặp các kháng sinh hạn chế, AI phải tìm thêm bằng chứng về:
  - hội chẩn
  - ý kiến chuyên khoa
  - căn cứ vi sinh
  - lý do dùng thuốc vượt mức thông thường

### 3. Liên hệ với repo

- Đây là nền nghiệp vụ cho các rule kiểu `Linezolid`, `Vancomycin`, `G3`.

---

## Thẻ PL-09. Không để AI kết luận quá mức khi dữ liệu thiếu

### 1. Mệnh đề cốt lõi

- Nếu hồ sơ thiếu đường dùng, thiếu thời điểm mổ, thiếu diễn biến bệnh, hoặc thiếu căn cứ vi sinh, AI không được kết luận chắc chắn theo kiểu tuyệt đối.

### 2. Cách kết luận đúng

- Thay vì nói `sai chắc chắn`, AI nên nói:
  - `nghi dự phòng kéo dài chưa có đủ căn cứ`
  - `cần kiểm tra thêm XML3/XML5`
  - `có khả năng thiếu mã hóa hoặc thiếu dữ liệu`

### 3. Giá trị huấn luyện

- Đây là thẻ rất quan trọng để giảm `false positive` trong phân tích hồ sơ thật.

---

## Thẻ PL-10. Cách xử lý khi nguồn chuyên môn và engine đang lệch nhau

### 1. Mệnh đề cốt lõi

- Trong repo này, `mã nguồn đang chạy` là nguồn sự thật của hành vi hệ thống.
- Nhưng khi giải thích nghiệp vụ kháng sinh, AI vẫn phải đối chiếu với nguồn chuyên môn đã chốt.

### 2. Quy tắc trả lời đúng

- Nếu engine chưa phủ đúng tinh thần tài liệu chuyên môn:
  - nói rõ đây là `khoảng cách giữa nguồn nghiệp vụ và logic hệ thống`
  - nêu dữ liệu cần kiểm chứng thêm
  - không tự ý đề xuất sửa rule diện rộng nếu chưa có thêm ca thật đối chứng

### 3. Giá trị huấn luyện

- Thẻ này giúp AI làm việc an toàn khi gặp các ca như `403521`, nơi bối cảnh dự phòng rất rõ nhưng cảnh báo thuốc chưa chắc đã xuất hiện đúng mức.

---

## Thẻ PL-11. Kháng sinh trẻ em không được suy trực tiếp từ liều người lớn

### 1. Mệnh đề cốt lõi

- Trong nhi khoa, liều kháng sinh phải được đọc theo `cân nặng`, `tuổi`, `đường dùng`, `tần suất`, và khi cần là `chức năng thận`.
- Không được lấy liều người lớn rồi chia ước lượng cho trẻ em.

### 2. Dữ liệu AI phải kiểm tra

- `XML1.CAN_NANG`
- tuổi từ `NGAY_SINH`
- tổng liều 24 giờ
- số lần dùng trong ngày
- dạng bào chế và hàm lượng thực tế

### 3. Ý nghĩa cho AI

- Khi hồ sơ có cân nặng, AI phải ưu tiên tư duy `mg/kg/ngày` thay vì chỉ đọc `số viên`, `số gói`, `số lọ`.
- Đây là thẻ nền cho tất cả rule kháng sinh trẻ em, không chỉ riêng `Amoxicillin/Clavulanate`.

---

## Thẻ PL-12. Kháng sinh trẻ em luôn cần đối chiếu trần liều tối đa

### 1. Mệnh đề cốt lõi

- Liều tính theo cân nặng vẫn phải được chặn bởi `trần liều tối đa an toàn` nếu có.

### 2. Ý nghĩa cho AI

- Một công thức `mg/kg` đúng chưa đủ để kết luận an toàn tuyệt đối.
- AI phải kiểm tra thêm nguy cơ vượt trần liều ngày, đặc biệt với beta-lactam và các thuốc có nguy cơ độc tính cao.

### 3. Liên hệ với repo

- Các rule như `THUOC_42` là ví dụ đã có của tư duy này, nhưng phạm vi hiện còn hẹp.

---

## Thẻ PL-13. Phạm vi thanh toán thuốc BHYT không chỉ phụ thuộc tên thuốc

### 1. Mệnh đề cốt lõi

- Khi đánh giá thanh toán thuốc BHYT, AI không được nhìn mỗi `tên thương mại`.
- Phải đối chiếu đồng thời:
  - hoạt chất
  - dạng bào chế
  - nồng độ hoặc hàm lượng
  - đường dùng
  - điều kiện chỉ định và đối tượng áp dụng nếu có

### 2. Ý nghĩa cho AI

- Hai thuốc cùng hoạt chất nhưng khác hàm lượng hoặc đường dùng có thể không cùng điều kiện thanh toán.
- Đây là lớp tri thức quan trọng khi đọc các rule `THUOC_*` theo mã thuốc cụ thể.

---

## Thẻ PL-14. Quyền thanh toán BHYT của thuốc phải gắn với bối cảnh hồ sơ thực tế

### 1. Mệnh đề cốt lõi

- Một thuốc thuộc phạm vi thanh toán chưa đủ để kết luận thanh toán đúng.
- AI còn phải kiểm tra xem hồ sơ có `căn cứ chỉ định`, `bối cảnh điều trị`, và `dữ liệu mã hóa` phù hợp hay không.

### 2. Ý nghĩa cho AI

- Nếu hồ sơ có bối cảnh lâm sàng hợp lý nhưng mã hóa ICD chưa đủ, AI phải ghi nhận khả năng `thiếu mã hóa` hoặc `rule quá hẹp`.
- Nếu vừa thiếu căn cứ lâm sàng vừa thiếu mã hóa, nguy cơ xuất toán cao hơn nhiều.

---

## Thẻ PL-15. Ca trẻ em dùng kháng sinh cần kết luận thận trọng hơn ca người lớn

### 1. Mệnh đề cốt lõi

- Với ca trẻ em, AI phải mặc định mức độ thận trọng cao hơn vì sai liều hoặc sai tần suất dễ gây hậu quả hơn.

### 2. Quy trình gợi ý

- xác nhận tuổi và cân nặng
- quy đổi tổng liều ngày
- đối chiếu theo nhóm thuốc và đường dùng
- kiểm tra trần liều và tần suất
- sau đó mới bàn đến thanh toán BHYT

## 2. Cách dùng bộ thẻ này

- Đọc trước `Bo_nguon_tri_thuc_quan_ly_su_dung_khang_sinh.md` để biết nguồn nào được ưu tiên và thứ tự suy luận (XML → rule → phân biệt nghiệp vụ vs engine).
- Dùng cùng `The_tri_thuc_mau_nhom_thuoc_dot4_khang_sinh.md` khi huấn luyện nhóm thuốc.
- Dùng trước khi tạo ca `false positive`, `false negative`, hoặc ca `tranh chấp nghiệp vụ` liên quan kháng sinh.
- Dùng để giải thích vì sao một rule stewardship cần tồn tại ngay cả khi không gắn trực tiếp với xuất toán BHYT.