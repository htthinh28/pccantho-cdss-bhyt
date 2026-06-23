# THẺ TRI THỨC MẪU: THANH TOÁN THUỐC BHYT

Phiên bản tài liệu: 1.3  
Ngày cập nhật: 06/04/2026

## 1. Mục đích

Thẻ tri thức này nạp cho AI khái niệm về **thanh toán thuốc** trong bối cảnh kiểm tra BHYT - tức là kiểm soát xem:

- Thuốc có nằm trong danh mục thanh toán BHYT hay không?
- Chẩn đoán/bệnh của bệnh nhân có nằm trong phạm vi thanh toán của thuốc này hay không?
- Liều, tần suất, số lượng có phù hợp hướng dẫn sử dụng được phép BHYT hay không?
- Ngày y lệnh, ngày kết quả có hợp lệ để thanh toán hay không?

**Khác biệt quan trọng:**
- **An toàn kê đơn** (an toàn lâm sàng) = điều kiện sử dụng an toàn từ góc độ y học.
- **Thanh toán** = điều kiện được BHYT chấp nhận trả tiền.

Một thuốc có thể an toàn (đúng liều, đúng bệnh nhân) nhưng vẫn **không được thanh toán** nếu:
- **Hoạt chất có trong Phụ lục I** nhưng **cơ sở khám chữa bệnh không đúng hạng** so với cột **(4), (5), (6), (7)** của đúng dòng hoạt chất (đường dùng/dạng dùng).
- **Không thỏa điều kiện hoặc tỷ lệ thanh toán** ghi tại cột **(8)** của Phụ lục I (và các ghi chú kèm theo).
- Chẩn đoán không nằm trong phạm vi chỉ định thanh toán của thuốc đó (thường chi tiết hóa tại cột (8) và văn bản dẫn chiếu).
- Số lượng cấp vượt quá hướng dẫn thanh toán.
- Không có đủ giấy tờ hoặc điều kiện hành chính.

## 2. Nguồn gốc tri thức

Tài liệu nền:
- **Văn bản hợp nhất 15/VBHN-BYT năm 2024** — hợp nhất các Thông tư về **Danh mục và tỷ lệ, điều kiện thanh toán** đối với thuốc hóa dược, sinh phẩm, thuốc phóng xạ và chất đánh dấu thuộc phạm vi BHYT. **Phụ lục I** quy định cấu trúc cột **(1)–(8)** cho từng hoạt chất (đường dùng, phân hạng cơ sở, điều kiện/tỷ lệ). Đọc toàn văn và bảng Phụ lục I: [Văn bản hợp nhất 15/VBHN-BYT 2024 trên Thư viện Pháp luật](https://thuvienphapluat.vn/van-ban/Bao-hiem/Van-ban-hop-nhat-15-VBHN-BYT-2024-Thong-tu-dieu-kien-thanh-toan-sinh-pham-huong-bao-hiem-y-te-636108.aspx).
- **Thông tư 20/2022/TT-BYT** (và các văn sửa đổi được hợp nhất) — bản gốc kèm **Phụ lục I** đính kèm danh mục thuốc; khi tra cứu **cột (4)–(8)** phải dùng **bản Phụ lục I hiện hành** (file Excel/PDF Bộ Y tế hoặc bản hợp nhất mới nhất).
- **Quyết định 130/QĐ-BYT** — Cấu trúc và danh mục chỉ tiêu dữ liệu XML KCB BHYT  
- **Nghị định 188/2025/NĐ-CP** — Quy định thanh toán chi phí KCB BHYT  
- **Quyết định 5631/QĐ-BYT năm 2020** — Hướng dẫn quản lý sử dụng kháng sinh trong BV  

**Ghi chú kỹ thuật CDSS:** Engine dự án (`du_lieu_luat_thuoc_muc8.jsx`, `dong_co_giam_dinh.jsx`) **có thể chưa** mã hóa đầy đủ từng ô cột (4)–(8) cho mọi hoạt chất; kiểm tra viên và AI vẫn phải **đối chiếu Phụ lục I** khi kết luận thanh toán theo **hạng bệnh viện** và **điều kiện cột (8)**.

Mã nguồn:
- `ma_nguon/tien_ich/luat_thuoc_hardcoded.jsx` - Wrapper kiểm tra thanh toán thuốc
- `ma_nguon/tien_ich/dong_co_giam_dinh.jsx` - Engine ánh xạ dữ liệu từ XML
- `ma_nguon/man_hinh/DocXML.jsx` - Màn hình hiển thị chi tiết hồ sơ

Audit thực tế:
- Folder `test_xml/` - Các file audit JSON từ hồ sơ thật đã xử lý

## 3. Khái niệm nền

### 3.1. Danh mục thuốc BHYT

Không phải **tất cả** thuốc kê trong hóa đơn được BHYT thanh toán.

- Mỗi thuốc có một **mã thuốc** (`MA_THUOC`) trong XML2.
- Mỗi thuốc phải được ghi tên, hàm lượng, số lượng, giá thanh toán.
- BHYT chỉ thanh toán những thuốc nằm trong **danh mục bảo hiểm được phê duyệt**.

**Ví dụ:**
- Biofazolin 1gam/vial (code 40.166) được BHYT thanh toán nếu đúng chỉ định.
- Vitamin B1 400mg (code giả định) không được BHYT thanh toán ngay cả khi an toàn và có chỉ định rõ.

### 3.2. Phạm vi thanh toán của một thuốc

Mỗi thuốc có **danh sách bệnh/chẩn đoán** được BHYT chấp nhận thanh toán.

Ví dụ với **Cefazolin** (antibiotics phòng phát):
- Được thanh toán cho: phòng phát nhiễm khuẩn sau phẫu thuật, sau sinh.
- **Không được thanh toán cho**: chẩn đoán viêm họng, tiêu chảy không rõ nguyên nhân.

Nếu bác sĩ kê Cefazolin cho viêm họng, thì:
- Dữ liệu XML2 sẽ có mã thuốc **40.??? (Cefazolin)**.
- Dữ liệu XML1 sẽ có **MA_BENH_CHINH = "J02"** (viêm họng cấp).
- Hệ thống kiểm tra sẽ cảnh báo: **"XUẤT TOÁN: Cefazolin không được thanh toán cho chẩn đoán viêm họng"**.

### 3.3. Liên hệ giữa XML1 và XML2 trong thanh toán

- **XML1** chứa chẩn đoán chính, chẩn đoán kèm, chẩn đoán ra viện, thông tin bệnh nhân.
- **XML2** chứa danh sách thuốc kê, liều, tần suất, số lượng, giá đơn vị, thành tiền.

Để kiểm tra thanh toán, **phải kết hợp cả hai**:
1. Lấy mã thuốc từ XML2.
2. Lấy chẩn đoán từ XML1.
3. Kiểm tra **hạng cơ sở KCB** so với **cột (4)–(7)** của đúng dòng hoạt chất trong Phụ lục I.
4. Kiểm tra **cột (8)** — điều kiện thanh toán, **tỷ lệ** thanh toán (nếu có), ghi chú (ví dụ giới hạn tuyến, đối tượng, tài liệu kèm theo).
5. Kiểm tra xem chẩn đoán / chỉ định có nằm trong phạm vi thanh toán **theo Phụ lục I cột (8) và văn bản dẫn chiếu** không.
6. Kiểm tra xem liều, tần suất, số lượng có phù hợp hướng dẫn không.
7. Kiểm tra xem ngày y lệnh có khớp với ngày bệnh nhân nằm viện/khám hay không.

### 3.4. Phụ lục I — cột (1) đến (8) (văn bản hợp nhất 15/VBHN-BYT)

Theo quy định tại văn bản hợp nhất (Điều hướng dẫn cấu trúc danh mục Phụ lục I), **mỗi dòng** là một hoạt chất (cột 2) với **đường dùng, dạng dùng** (cột 3). AI cần tra **đúng dòng** (cùng hoạt chất + đường/dạng dùng), không chỉ tra tên thương mại trên XML2.

| Cột | Nội dung (ý chính) | Ý nghĩa kiểm tra thanh toán |
|-----|---------------------|------------------------------|
| **(1)** | STT | Thứ tự trong danh mục. |
| **(2)** | Tên hoạt chất (INN hoặc tên được cấp phép) | Khóa tra cứu chính; đối chiếu mã thuốc BYT / hoạt chất trong hồ sơ. |
| **(3)** | Đường dùng, dạng dùng | Phải khớp cách dùng thực tế (uống, tiêm, …); khác đường dùng có thể là **dòng khác** trong Phụ lục. |
| **(4)** | Hạng bệnh viện — **Đặc biệt và I** | Chỉ các cơ sở thuộc nhóm này được thanh toán thuốc nếu dòng đó **chỉ** mở tại cột (4) (theo ký hiệu/quy ước trong bảng Phụ lục). |
| **(5)** | Hạng bệnh viện — **II** | Tương tự cho hạng II. |
| **(6)** | Hạng bệnh viện — **III và IV** (và một số cơ sở tương đương theo văn bản, kể cả PKĐK thuộc BV/TTYT có phân tuyến trước 01/01/2025 như quy định) | Phạm vi rộng hơn hạng I; vẫn phải khớp **đúng cột** với hạng thực tế của nơi KCB. *Tri thức nội bộ dự án:* **Bệnh viện Quốc tế Phương Châu** áp tra cứu theo **cột (6)** — xem §3.5. |
| **(7)** | **PKĐK/PK chuyên khoa/Nhà hộ sinh tư** chưa phân tuyến (trước 01/01/2025), **TYT xã**, y tế cơ quan, tương đương | Tuyến cơ sở; thuốc chỉ ghi dấu tại (7) thì BV hạng I **không** tự động được quyền thanh toán nếu văn bản không cho phép — phải đọc **đúng ô** trên dòng hoạt chất. |
| **(8)** | **Điều kiện thanh toán, tỷ lệ thanh toán, ghi chú** | Nơi ghi **điều kiện đặc thù** (ICD, tuyến, đối tượng, phác đồ, hồ sơ kèm theo, mức % thanh toán, v.v.). **Chỉ định lâm sàng đúng nhưng không thỏa cột (8)** → BHYT **không** thanh toán (hoặc chỉ thanh toán một phần theo tỷ lệ). |

**Thuốc Phụ lục II** (phóng xạ, chất đánh dấu): theo văn bản hợp nhất, **không phân hạng bệnh viện** theo cột (4)–(7) như Phụ lục I; chỉ tại cơ sở **được cấp phép** — AI tách biệt khỏi logic Phụ lục I.

### 3.5. Tri thức nội bộ: Bệnh viện Quốc tế Phương Châu — tra Phụ lục I theo **cột (6)**

| Trường | Giá trị (chuẩn hồ sơ XML / BHXH) |
|--------|-----------------------------------|
| Tên cơ sở | **Bệnh viện Quốc tế Phương Châu Cần Thơ** |
| **`MA_CSKCB`** | **`94170`** |

Khi `XML1.MA_CSKCB === '94170'` (sau khi chuẩn hóa chuỗi), áp dụng quy tắc **Phụ lục I — cột (6)** như dưới đây. *(Một số bản scan hợp đồng hoặc trích lỗi có thể ghi khác; lấy **94170** làm mã đối chiếu với XML475/XML điện tử và danh mục CSKCB BHXH.)*

Trong phạm vi **kiểm tra và CDSS** của dự án (Tập đoàn Y tế / **Bệnh viện Quốc tế Phương Châu**, ví dụ cơ sở Cần Thơ trong cấu hình ứng dụng), khi đối chiếu **được thanh toán thuốc BHYT theo hạng cơ sở** với bảng Phụ lục I, AI và kiểm tra viên lấy **nhóm cột (6)** làm cột hạng bệnh viện áp dụng: tức là chỉ những hoạt chất có **quy định thanh toán tại cột 6** (theo ký hiệu/quy ước của file Phụ lục) mới nằm trong phạm vi thanh toán thuốc BHYT cho tuyến này — **không** được suy diễn quyền thuốc của cột **(4)** hay **(5)** nếu trên dòng đó không có dấu hiệu cho phép cột (6) hoặc tương đương theo bảng.

**Định nghĩa pháp lý của cột (6)** (trích theo cấu trúc Phụ lục I, văn bản hợp nhất **15/VBHN-BYT** — mục giải thích cột 4, 5, 6, 7):

> **Cột 6** — *Bệnh viện hạng III và hạng IV, bao gồm cả phòng khám đa khoa thuộc bệnh viện đa khoa hoặc thuộc trung tâm y tế quận, huyện, thị xã, thành phố trực thuộc tỉnh, thành phố trực thuộc trung ương, phòng khám đa khoa, phòng khám chuyên khoa, nhà hộ sinh tư nhân đã được cơ quan nhà nước có thẩm quyền phân tuyến chuyên môn kỹ thuật tương đương tuyến III trước ngày 01 tháng 01 năm 2025 sử dụng các thuốc quy định tại cột 6.*

**Cách dùng trong suy luận AI:**

1. Xác định `MA_CSKCB` trên XML1 — với **Phương Châu Cần Thơ** là **`94170`** — hoặc tên cơ sở khớp **Bệnh viện Quốc tế Phương Châu** (hoặc chi nhánh được quy ước cùng nhóm hạng).  
2. Với từng dòng thuốc, sau khi đã khóa **đúng dòng** Phụ lục I (cột 2–3), kiểm tra ô **cột (6)** và tiếp tục **cột (8)**.  
3. Nếu thuốc chỉ mở tại cột **(4)** hoặc **(5)** mà **không** thuộc phạm vi cột **(6)** theo bảng → coi là **không đủ điều kiện thanh toán BHYT tại cơ sở Phương Châu** (xuất toán hoặc tự túc, tùy nghiệp vụ và hồ sơ).

*Lưu ý:* Phân hạng hành chính chi tiết của từng chi nhánh lấy từ **quyết định phân hạng / hợp đồng KCB / danh mục CSKCB**; thẻ này chỉ cố định **quy tắc tra Phụ lục I = cột (6)** cho thương hiệu **Phương Châu** trong ngữ cảnh huấn luyện AI của dự án.

## 4. Các kiểu lỗi thanh toán thuốc

### 4.1. Lỗi: Thuốc không nằm trong danh mục BHYT

**Dấu hiệu:**
- Mã thuốc không được BHYT phê duyệt.
- Thường là đông dược, vitamin, thực phẩm bổ sung.

**Kết luận:** ⛔ **XUẤT TOÁN : Thuốc không nằm trong danh mục thanh toán BHYT. Bệnh viện cần hoàn lại [số tiền].**

**Ví dụ:**
```
- Mã THUOC: 40.XYZ (không tồn tại trong danh mục)
- Ten THUOC: "Vitamin PP 50mg"
- So LUONG: 30
- Gia thanh toan: 5.000đ/viên
- Thanh tien: 150.000đ

Kết luận: XUẤT TOÁN 150.000đ
```

### 4.2. Lỗi: Chẩn đoán không nằm trong phạm vi thanh toán

**Dấu hiệu:**
- Thuốc có trong danh mục BHYT.
- Nhưng chẩn đoán bệnh nhân không nằm trong danh sách được phép thanh toán cho thuốc này.

**Kết luận:** ⛔ **XUẤT TOÁN : [Tên thuốc] không được thanh toán cho chẩn đoán [ICD-10]. Danh mục thanh toán chỉ bao gồm [danh sách bệnh được phép].**

**Ví dụ:**
```
- Ma THUOC: 40.398 (Cefazolin)
- MA_BENH_CHINH: "J02" (Viêm họng cấp)
- So LUONG: 4
- Gia thanh toan: 15.000đ
- Thanh tien: 60.000đ

Kết luận: XUẤT TOÁN 60.000đ

Giải thích: "Cefazolin được thanh toán chỉ cho phòng phát nhiễm khuẩn sau phẫu thuật hoặc sản khoa, không được thanh toán cho viêm họng cấp"
```

### 4.3. Lỗi: Số lượng cấp vượt hướng dẫn

**Dấu hiệu:**
- Thuốc, chẩn đoán đều đúng.
- Nhưng số lượng cấp/liều dùng vượt quá hướng dẫn thanh toán của BHYT.

**Kết luận:** ⚠️ **XUẤT TOÁN BỘ: Số lượng [Tên thuốc] vượt quá hướng dẫn thanh toán. Cấp [X đơn vị], được phép [Y đơn vị]. Xuất toán [Z đơn vị].**

**Ví dụ:**
```
- Ma THUOC: 40.260 (Aciclovir)
- MA_BENH_CHINH: "B02" (Zona - đúng chẩn đoán)
- So LUONG: 100 viên (phần vượt không đúng)
- Huong dan thanh toan: 50 viên cho chẩn đoán Zona trong 1 lượt điều trị
- Gia thanh toan: 2.000đ/viên
- Thanh tien XML: 200.000đ
- Thanh tien BHYT được: 100.000đ

Kết luận: XUẤT TOÁN BỘ: xuất 100.000đ
```

### 4.4. Lỗi: Ngày sử dụng không hợp lệ

**Dấu hiệu:**
- Ngày y lệnh ngoài khoảng nằm viện/điều trị.
- Ngày y lệnh sau ngày ra viện.
- Ngày kết quả trước ngày y lệnh.

**Kết luận:** ⛔ **XUẤT TOÁN : Ngày y lệnh không hợp lệ. Ngày y lệnh [X] ngoài khoảng nằm viện [từ A đến B].**

### 4.5. Lỗi: Đúng hoạt chất và chỉ định nhưng sai **hạng cơ sở KCB** (cột 4–7)

**Dấu hiệu:**
- Dòng hoạt chất trong **Phụ lục I** chỉ cho phép thanh toán tại **một nhóm hạng** (ví dụ chỉ có dấu/quy ước tại cột **(4)** — BV đặc biệt và I).
- Cơ sở KCB thực tế là **hạng III/IV** hoặc **tuyến xã** (cột **(6)** hoặc **(7)**) — **không** được quyền thanh toán dòng đó theo Phụ lục.

**Kết luận:** ⛔ **XUẤT TOÁN: Thuốc [hoạt chất] theo Phụ lục I chỉ được thanh toán BHYT tại cơ sở hạng […], không phù hợp hạng cơ sở […].**

**Lưu ý cho AI:** Hạng BV của cơ sở thường lấy từ **danh mục CSKCB** / quyết định phân hạng, không phải từ một trường đơn lẻ trong XML2; cần `MA_CSKCB` (XML1) rồi tra ngoài hồ sơ.

### 4.6. Lỗi: Không thỏa **điều kiện hoặc tỷ lệ** tại cột **(8)**

**Dấu hiệu:**
- Cột **(8)** ghi điều kiện (ví dụ: chỉ thanh toán kèm ICD/hồ sơ chuyên khoa, giới hạn tuyến, tỷ lệ %, số ngày tối đa, v.v.).
- Hồ sơ **không đáp ứng** đúng toàn bộ điều kiện ghi tại **(8)** và văn bản được dẫn chiếu.

**Kết luận:** ⛔ **XUẤT TOÁN (hoặc xuất toán phần chênh)** theo đúng quy định tại cột **(8)** — có thể là **0%** hoặc **tỷ lệ bộ phận** nếu văn bản quy định tỷ lệ.

## 5. Cách kiểm tra thanh toán từng bước

Khi gặp một dòng thuốc trong XML2, AI nên kiểm tra theo **quy trình chuỗi** này:

### Bước 1: Kiểm tra tiêu chuẩn hành chính

**Câu hỏi:** "Hồ sơ có đủ dữ liệu để kiểm tra thanh toán không?"

- Có `MA_THUOC`?
- Có `SO_LUONG`?
- Có `GIA_THANH_TOAN`?
- Có `NGAY_Y_LENH`?
- XML1 có `MA_BENH_CHINH`?
- XML1 có `NGAY_VAO` và `NGAY_RA`?
- XML1 có `MA_CSKCB` (hoặc tương đương) để **tra hạng/tuyến cơ sở** phục vụ bước 3?

Nếu thiếu → **KIỂM TRA: Dữ liệu hồ sơ thiếu `[trường nào]`, không thể kết luận thanh toán** (đặc biệt nếu thiếu cơ sở để đối chiếu cột (4)–(7)).

### Bước 2: Kiểm tra danh mục (Phụ lục I)

**Câu hỏi:** "Hoạt chất + đường dùng/dạng dùng có nằm trong **Phụ lục I** (cột 1–3) của danh mục thanh toán BHYT hiện hành không?"

- Nếu không → **XUẤT TOÁN: Thuốc không nằm trong danh mục thanh toán BHYT.**
- Nếu có → Ghi nhận **đúng dòng** Phụ lục (để tra cột 4–8) → Sang bước 3.

### Bước 3: Kiểm tra **hạng cơ sở KCB** với cột **(4), (5), (6), (7)**

**Câu hỏi:** "Cơ sở nơi kê thuốc thuộc **hạng/tuyến** nào, và trên dòng Phụ lục I đó có **được phép** thanh toán tại hạng đó không?"

- Xác định hạng BV / tuyến cơ sở (từ `MA_CSKCB` + danh mục hành chính / quyết định phân hạng).
- Đối chiếu với **dấu hiệu/quy ước** tại cột **(4)–(7)** của **cùng dòng** hoạt chất.
- Nếu không khớp → **XUẤT TOÁN: Không đúng hạng bệnh viện/tuyến được thanh toán thuốc này theo Phụ lục I.**
- Nếu khớp → Sang bước 4.

### Bước 4: Kiểm tra cột **(8)** — điều kiện và **tỷ lệ** thanh toán

**Câu hỏi:** "Toàn bộ điều kiện, ghi chú và tỷ lệ tại cột **(8)** đã thỏa chưa?"

- Đọc kỹ **(8)**: ICD, đối tượng, hồ sơ đính kèm, giới hạn liều/ngày, **% thanh toán**, v.v.
- Nếu không thỏa → **XUẤT TOÁN** hoặc **điều chỉnh số tiền BHYT** theo tỷ lệ quy định.
- Nếu thỏa → Sang bước 5.

### Bước 5: Kiểm tra phạm vi chẩn đoán / chỉ định (kết hợp ICD và văn bản)

**Câu hỏi:** "Chẩn đoán và chỉ định có nằm trong phạm vi thanh toán **sau khi** đã thỏa (3)(4)?"

- Đối chiếu `MA_BENH_CHINH`, `MA_BENH_KT`, `CHAN_DOAN_RV` với **cột (8)** và các rule seed trong hệ thống.
- Nếu không → **XUẤT TOÁN: [Hoạt chất] không được thanh toán cho tình huống lâm sàng / ICD này.**
- Nếu có → Sang bước 6.

### Bước 6: Kiểm tra liều và số lượng

**Câu hỏi:** "Liều, tần suất, số lượng có phù hợp hướng dẫn không?"

- Kiểm tra: `TONG_LIEU_24H` có vượt liều tối đa?
- Kiểm tra: `TAN_SUAT` có phù hợp hướng dẫn?
- Kiểm tra: `SO_LUONG` có khớp `SO_NGAY` × tần suất / y lệnh?
- Kiểm tra: `SO_LUONG` có vượt hướng dẫn thanh toán (kể cả ghi trong **(8)**)?

Nếu vượt → **XUẤT TOÁN BỘ hoặc XUẤT TOÁN TOÀN BỘ tùy mức độ.**  
Nếu không vượt → Sang bước 7.

### Bước 7: Kiểm tra ngày hợp lệ

**Câu hỏi:** "Ngày y lệnh có nằm trong khoảng nằm viện/điều trị không?"

- Kiểm tra: `NGAY_Y_LENH` có >= `NGAY_VAO`?
- Kiểm tra: `NGAY_Y_LENH` có <= `NGAY_RA`?

Nếu không → **XUẤT TOÁN: Ngày y lệnh không hợp lệ.**  
Nếu có → **THANH TOÁN ĐÚNG** (về chuỗi kiểm tra này; vẫn có thể còn lỗi hành chính/DVKT khác ngoài thuốc).

## 6. Dữ liệu cần kiểm tra trong XML

### Từ XML1 (thông tin bệnh nhân, chẩn đoán, cơ sở)
- `MA_CSKCB` - Mã cơ sở KCB (dùng tra **hạng bệnh viện / tuyến** để đối chiếu cột **(4)–(7)** Phụ lục I; thường cần **danh mục CSKCB** hoặc dữ liệu nội bộ, không suy diễn từ mã thuốc)
- `MA_BENH_CHINH` - Chẩn đoán chính theo ICD-10
- `MA_BENH_KT` - Chẩn đoán kèm / nền tảng
- `CHAN_DOAN_RV` - Chẩn đoán ra viện (nếu có)
- `NGAY_VAO` - Ngày vào viện/khám
- `NGAY_RA` - Ngày ra viện/khám

### Từ XML2 (danh sách thuốc)
- `MA_THUOC` - Mã thuốc (key để tra danh mục)
- `TEN_THUOC` - Tên thuốc (dùng để xác nhận)
- `SO_LUONG` - Số lượng cấp
- `GIA_THANH_TOAN` - Giá thanh toán BHYT / 1 đơn vị
- `THANH_TIEN` - Tổng tiền = SO_LUONG * GIA_THANH_TOAN
- `NGAY_Y_LENH` - Ngày của y lệnh dùng thuốc
- `TONG_LIEU_24H` - Tổng liều trong 24 giờ (nếu hệ thống tính)
- `TAN_SUAT` - Tần suất dùng (lần/ngày)

## 7. Ví dụ cụ thể: Kiểm tra thanh toán Biofazolin

### 7.1. Thông tin thuốc

- **Tên:** Biofazolin (Cefazolin Sodium)
- **Mã:** 40.166
- **Liều:** 1g/vial
- **Danh mục BHYT:** Có, được phê duyệt
- **Phạm vi thanh toán:** Phòng phát nhiễm khuẩn sau phẫu thuật, sau sinh. **Không bao gồm**: chẩn đoán viêm họng, viêm phổi cộng đồng, tiêu chảy.

### 7.2. Trường hợp 1: Thanh toán ĐÚNG

```
Hồ sơ: MA_LK = 403521
Chẩn đoán: MA_BENH_CHINH = "Z33" (Phẩu thuật sản khoa)
Phòng phát: Dùng Biofazolin 1g x 2 lần trước/sau phẫu thuật (4 viên bán)
NGAY_Y_LENH: 2026-03-15 (nằm trong ngày nằm viện)

XML2:
- MA_THUOC: 40.166
- SO_LUONG: 4
- GIA_THANH_TOAN: 15.000đ
- THANH_TIEN: 60.000đ

Kiểm tra:
✅ Bước 1: Đủ dữ liệu
✅ Bước 2: Biofazolin (hoạt chất tương ứng) có trong Phụ lục I — đúng đường dùng/dạng dùng
✅ Bước 3: Hạng/tuyến cơ sở KCB khớp cột (4)–(7) của dòng đó *(giả định BV đủ hạng theo Phụ lục)*
✅ Bước 4: Cột (8) không loại trừ trường hợp này *(cần đọc bảng thật cho từng kỳ hiệu lực)*
✅ Bước 5: Z33 nằm trong phạm vi thanh toán (phẫu thuật sản khoa)
✅ Bước 6: 4 viên = 2 lần x 2 lần/ngày phòng phát, không quá liều
✅ Bước 7: NGAY_Y_LENH hợp lệ

Kết luận: ✅ THANH TOÁN ĐÚNG 60.000đ
```

### 7.3. Trường hợp 2: Sai chẩn đoán → XUẤT TOÁN

```
Hồ sơ: MA_LK = 000339
Chẩn đoán: MA_BENH_CHINH = "J02" (Viêm họng cấp)
Kê: Biofazolin 1g x 1 lần/ngày x 3 ngày

XML2:
- MA_THUOC: 40.166
- SO_LUONG: 3
- GIA_THANH_TOAN: 15.000đ
- THANH_TIEN: 45.000đ

Kiểm tra:
✅ Bước 1: Đủ dữ liệu
✅ Bước 2: Biofazolin trong Phụ lục I
✅ Bước 3–4: *(giả định cơ sở và cột (8) không chặn — nếu sai hạng hoặc (8) vẫn xuất toán dù ICD đúng)*
❌ Bước 5: J02 (viêm họng) KHÔNG nằm trong phạm vi thanh toán chỉ định

Kết luận: ⛔ XUẤT TOÁN 45.000đ
Giải thích: "Cefazolin không được thanh toán cho chẩn đoán viêm họng. Danh mục thanh toán chỉ bao gồm phòng phát nhiễm khuẩn sau phẫu thuật và sau sinh"
```

## 8. Lỗi thường AI mắc phải khi kiểm tra thanh toán

### Lỗi 1: Nhầm lẫn "an toàn" với "thanh toán"

- **Sai:** "Liều Aciclovir đúng và không vướng chống chỉ định, nên có thể thanh toán."
- **Đúng:** "Liều Aciclovir an toàn, nhưng chẩn đoán bệnh nhân là viêm họng, không nằm trong phạm vi thanh toán. Do đó XUẤT TOÁN."

### Lỗi 2: Quên kiểm tra chẩn đoán kèm hoặc chẩn đoán ra viện

- **Sai:** "MA_BENH_CHINH là viêm họng, nên Biofazolin xuất toán."
- **Đúng:** "Cần kiểm tra MA_BENH_KT (bệnh kèm) và CHAN_DOAN_RV. Nếu có ghi 'phẩu thuật sản khoa' ở chẩn đoán kèm, thì Biofazolin vẫn có thể thanh toán."

### Lỗi 3: Không biết danh mục thanh toán của từng thuốc

- **Sai:** "Vì không tìm thấy danh mục thuốc trong repo, nên không thể kết luận được."
- **Đúng:** "Cần tham khảo **Phụ lục I** trong văn bản hợp nhất **15/VBHN-BYT** (bản mới nhất) hoặc file danh mục BYT/BV cập nhật — đặc biệt cột **(4)–(8)**."

### Lỗi 4: Tính toán số lượng sai

- **Sai:** "Cấp 10 viên cho 5 ngày, mỗi ngày 1 viên. Không có lỗi."
- **Đúng:** "5 ngày x 1 viên/ngày = 5 viên được phép. Cấp 10 viên → XUẤT TOÁN BỘ 5 viên."

### Lỗi 5: Chỉ tra ICD hoặc chỉ tra “có trong danh mục”, bỏ qua **hạng BV** và cột **(8)**

- **Sai:** "Thuốc có trong danh mục và đúng bệnh → thanh toán."
- **Đúng:** "Phải tra **đủ dòng Phụ lục I**: (4)–(7) so với hạng cơ sở KCB, rồi **(8)** cho điều kiện và tỷ lệ. Thiếu một trong hai có thể **không được BHYT thanh toán** dù chỉ định lâm sàng hợp lý."

## 9. Cách dạy AI là gì

### Câu hỏi AI nên tự trả lời khi kiểm tra một dòng thuốc

1. "Mã thuốc / hoạt chất + chẩn đoán + **mã cơ sở KCB** là gì?" → Tìm hiểu dữ liệu
2. "Dòng Phụ lục I (cột 2–3) có khớp hoạt chất và đường dùng không?" → Biết danh mục
3. "Hạng/tuyến cơ sở có khớp **cột (4)–(7)** của dòng đó không?" → Phân hạng thanh toán
4. "Cột **(8)** yêu cầu điều kiện hoặc tỷ lệ gì — hồ sơ đã đủ chưa?" → Điều kiện & tỷ lệ BHYT
5. "Chẩn đoán / chỉ định có được phép trong phạm vi thanh toán (sau (8)) không?" → Quy tắc lâm sàng – thanh toán
6. "Liều/số lượng có phù hợp không?" → Tính toán
7. "Ngày hợp lệ không?" → Kiểm tra niên đại
8. "Kết luận cuối cùng: thanh toán đủ / tỷ lệ / xuất toán?" → Quyết định

### Biến ca nào thành bài học?

Nên sử dụng **ca XUẤT TOÁN** để dạy AI nhận ra sai lầm, không chỉ ca thanh toán đúng:

- 1 ca xuất toán vì sai chẩn đoán
- 1 ca xuất toán vì số lượng quá (bộ hoặc toàn bộ)
- 1 ca xuất toán vì thuốc không danh mục
- 1 ca xuất toán vì **sai hạng BV** so với cột (4)–(7) hoặc vì **không thỏa cột (8)**
- 1 ca thanh toán đúng (để AI biết pattern tích cực)

## 10. Bước tiếp theo

Sau khi tiêu hóa thẻ này, nên:

1. **Tạo danh sách 10 thuốc thường xuyên gây xuất toán tại BV** với phạm vi thanh toán của mỗi thuốc
2. **Chọn từng thuốc, làm 1 ca XUẤT TOÁN + 1 ca THANH TOÁN ĐÚNG** để AI học đối lập
3. **Kiểm tra quy trình XML -> audit -> kiểm tra thanh toán** bằng cách lấy audit JSON thật
4. **Cập nhật các rule kiểm tra thanh toán** trong `luat_thuoc_hardcoded.jsx` nếu cần bổ sung logic mới

5. **Phân tầng “sai thuốc”** (chỉ định vs liều vs số lượng cấp vs kháng sinh vs hành chính): xem `The_tri_thuc_kiem_soat_sai_thuoc_AI.md`, bảng đa nhóm danh mục BV `The_tri_thuc_da_dang_nhom_thuoc_dan_muc_BV_AI.md`, **bản đồ engine** `The_tri_thuc_chi_muc_giam_dinh_thuoc_engine_AI.md`, và các ca mẫu (`000308`, `000589`, `IP26000139`, …).

---

## Ghi chú

Tài liệu này không thay thế quyết định của kiểm tra viên chuyên gia. Nó chỉ là hướng dẫn AI để:
- Hiểu từng bước kiểm tra thanh toán
- Biết tư duy khi gặp sai lầm thanh toán
- Hỏi câu đúng để tra cứu danh mục khi cần
- Giải thích rõ ràng cho người dùng tại sao xuất toán
