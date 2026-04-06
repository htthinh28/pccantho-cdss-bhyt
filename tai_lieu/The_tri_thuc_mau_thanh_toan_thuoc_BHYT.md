# THẺ TRI THỨC MẪU: THANH TOÁN THUỐC BHYT

Phiên bản tài liệu: 1.0
Ngày cập nhật: 06/04/2026

## 1. Mục đích

Thẻ tri thức này nạp cho AI khái niệm về **thanh toán thuốc** trong bối cảnh giám định BHYT - tức là kiểm soát xem:

- Thuốc có nằm trong danh mục thanh toán BHYT hay không?
- Chẩn đoán/bệnh của bệnh nhân có nằm trong phạm vi thanh toán của thuốc này hay không?
- Liều, tần suất, số lượng có phù hợp hướng dẫn sử dụng được phép BHYT hay không?
- Ngày y lệnh, ngày kết quả có hợp lệ để thanh toán hay không?

**Khác biệt quan trọng:**
- **An toàn kê đơn** (an toàn lâm sàng) = điều kiện sử dụng an toàn từ góc độ y học.
- **Thanh toán** = điều kiện được BHYT chấp nhận trả tiền.

Một thuốc có thể an toàn (đúng liều, đúng bệnh nhân) nhưng vẫn **không được thanh toán** nếu:
- Chẩn đoán không nằm trong danh mục thanh toán của thuốc đó.
- Số lượng cấp vượt quá hướng dẫn thanh toán.
- Không có đủ giấy tờ hoặc điều kiện hành chính.

## 2. Nguồn gốc tri thức

Tài liệu nền:
- **15/VBHN-BYT năm 2025** - Phạm vi thanh toán thuốc BHYT (danh mục bảo hiểm)
- **Quyết định 130/QĐ-BYT** - Cấu trúc và danh mục chỉ tiêu dữ liệu XML KCB BHYT
- **Nghị định 188/2025/NĐ-CP** - Quy định thanh toán chi phí KCB BHYT
- **Quyết định 5631/QĐ-BYT năm 2020** - Hướng dẫn quản lý sử dụng kháng sinh trong BV

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
- Hệ thống giám định sẽ cảnh báo: **"XUẤT TOÁN: Cefazolin không được thanh toán cho chẩn đoán viêm họng"**.

### 3.3. Liên hệ giữa XML1 và XML2 trong thanh toán

- **XML1** chứa chẩn đoán chính, chẩn đoán kèm, chẩn đoán ra viện, thông tin bệnh nhân.
- **XML2** chứa danh sách thuốc kê, liều, tần suất, số lượng, giá đơn vị, thành tiền.

Để kiểm tra thanh toán, **phải kết hợp cả hai**:
1. Lấy mã thuốc từ XML2.
2. Lấy chẩn đoán từ XML1.
3. Kiểm tra xem chẩn đoán này có nằm trong danh mục thanh toán của thuốc không.
4. Kiểm tra xem liều, tần suất, số lượng có phù hợp hướng dẫn không.
5. Kiểm tra xem ngày y lệnh có khớp với ngày bệnh nhân nằm viện/khám hay không.

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

Kết luận ang: XUẤT TOÁN 60.000đ

Giải thích: "Cefazolin được thanh toán chỉ cho phòng phát nhiễm khuẩn sau phẫu thuật hoặc sản khoa, không được thanh toán cho viêm họng cấp"
```

### 4.3. Lỗi: Số lượng cấp vượt hướng dẫn

**Dấu hiệu:**
- Thuốc, chẩn đoán đều đúng.
- Nhưng số lượng cấp/liều dùng vượt quá hướng dẫn thanh toán của BHYT.

**Kết luận:** ⚠️ **XUẤT TOÁN BỘBỘ: Số lượng [Tên thuốc] vượt quá hướng dẫn thanh toán. Cấp [X đơn vị], được phép [Y đơn vị]. Xuất toán [Z đơn vị].**

**Ví dụ:**
```
- Ma THUOC: 40.260 (Aciclovir)
- MA_BENH_CHINH: "B02" (Zona - đúng chẩn đoán)
- So LUONG: 100 viên (phẩn không đúng)
- Huong dan thanh toan: 50 viên cho chẩn đoán Zona trong 1 lượt điều trị
- Gia thanh toan: 2.000đ/viên
- Thanh tien XML: 200.000đ
- Thanh tien SEMs được: 100.000đ

Kết luận: XUẤT TOÁN BỘ: xuất 100.000đ
```

### 4.4. Lỗi: Ngày sử dụng không hợp lệ

**Dấu hiệu:**
- Ngày y lệnh ngoài khoảng nằm viện/điều trị.
- Ngày y lệnh sau ngày ra viện.
- Ngày kết quả trước ngày y lệnh.

**Kết luận:** ⛔ **XUẤT TOÁN : Ngày y lệnh không hợp lệ. Ngày y lệnh [X] ngoài khoảng nằm viện [từ A đến B].**

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

Nếu thiếu → **KIỂM TRA: Dữ liệu hồ sơ thiếu `[trường nào]`, không thể kết luận thanh toán.**

### Bước 2: Kiểm tra danh mục

**Câu hỏi:** "Thuốc này có trong danh mục BHYT hay không?"

- Nếu không → **XUẤT TOÁN: Thuốc không nằm trong danh mục thanh toán BHYT.**
- Nếu có → Sang bước 3.

### Bước 3: Kiểm tra phạm vi chẩn đoán

**Câu hỏi:** "Chẩn đoán bệnh nhân có nằm trong phạm vi thanh toán của thuốc này không?"

- Lấy danh mục bệnh được phép thanh toán cho thuốc X từ **15/VBHN-BYT**.
- Đối chiếu `MA_BENH_CHINH` đó có trong danh mục không.
- Nếu không → **XUẤT TOÁN: [Tên thuốc] không được thanh toán cho chẩn đoán `[ICD-10]`.**
- Nếu có → Sang bước 4.

### Bước 4: Kiểm tra liều và số lượng

**Câu hỏi:** "Liều, tần suất, số lượng có phù hợp hướng dẫn không?"

- Kiểm tra: `TONG_LIEU_24H` có vượt liều tối đa?
- Kiểm tra: `TAN_SUAT` có phù hợp hướng dẫn?
- Kiểm tra: `SO_LUONG` có khớp `SO_NGAY * TTAN_SUAT`?
- Kiểm tra: `SO_LUONG` có vượt hướng dẫn thanh toán?

Nếu vượt → **XUẤT TOÁN BỘ hoặc XUẤT TOÁN TOÀN BỘ tùy mức độ.**
Nếu không vượt → Sang bước 5.

### Bước 5: Kiểm tra ngày hợp lệ

**Câu hỏi:** "Ngày y lệnh có nằm trong khoảng nằm viện/điều trị không?"

- Kiểm tra: `NGAY_Y_LENH` có >= `NGAY_VAO`?
- Kiểm tra: `NGAY_Y_LENH` có <= `NGAY_RA`?

Nếu không → **XUẤT TOÁN: Ngày y lệnh không hợp lệ.**
Nếu có → **THANH TOÁN ĐÚNG. Không lỗi về thanh toán thuốc.**

## 6. Dữ liệu cần kiểm tra trong XML

### Từ XML1 (thông tin bệnh nhân, chẩn đoán)
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
✅ Bước 2: Biofazolin trong danh mục BHYT
✅ Bước 3: Z33 nằm trong phạm vi thanh toán (phẫu thuật sản khoa)
✅ Bước 4: 4 viên = 2 lần x 2 lần/ngày phòng phát, không quá liều
✅ Bước 5: NGAY_Y_LENH hợp lệ

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
✅ Bước 2: Biofazolin trong danh mục
❌ Bước 3: J02 (viêm họng) KHÔNG nằm trong phạm vi thanh toán

Kết luận: ⛔ XUẤT TOÁN 45.000đ
Giải thích: "Cefazolin không được thanh toán cho chẩn đoán viêm họng. Danh mục thanh toán chỉ bao gồm phòng phát nhiễm khuẩn sau phẫu thuật và sau sinh"
```

## 8. Lỗi thường AI mắc phải khi giám định thanh toán

### Lỗi 1: Nhầm lẫn "an toàn" với "thanh toán"

- **Sai:** "Liều Aciclovir đúng và không vướng chống chỉ định, nên có thể thanh toán."
- **Đúng:** "Liều Aciclovir an toàn, nhưng chẩn đoán bệnh nhân là viêm họng, không nằm trong phạm vi thanh toán. Do đó XUẤT TOÁN."

### Lỗi 2: Quên kiểm tra chẩn đoán kèm hoặc chẩn đoán ra viện

- **Sai:** "MA_BENH_CHINH là viêm họng, nên Biofazolin xuất toán."
- **Đúng:** "Cần kiểm tra MA_BENH_KT (bệnh kèm) và CHAN_DOAN_RV. Nếu có ghi 'phẩu thuật sản khoa' ở chẩn đoán kèm, thì Biofazolin vẫn có thể thanh toán."

### Lỗi 3: Không biết danh mục thanh toán của từng thuốc

- **Sai:** "Vì không tìm thấy danh mục thuốc trong repo, nên không thể kết luận được."
- **Đúng:** "Cần tham khảo 15/VBHN-BYT năm 2025 hoặc danh mục bảo hiểm BV cập nhật để tra."

### Lỗi 4: Tính toán số lượng sai

- **Sai:** "Cấp 10 viên cho 5 ngày, mỗi ngày 1 viên. Không có lỗi."
- **Đúng:** "5 ngày x 1 viên/ngày = 5 viên được phép. Cấp 10 viên → XUẤT TOÁN BỘ 5 viên."

## 9. Cách dạy AI là gì

### Câu hỏi AI nên tự trả lời khi kiểm tra một dòng thuốc

1. "Mã thuốc + chẩn đoán bệnh là gì?" → Tìm hiểu dữ liệu
2. "Thuốc này có trong danh mục BHYT không?" → Biết danh mục
3. "Chẩn đoán này có được phép thanh toán cho thuốc này không?" → Biết quy tắc
4. "Liều/số lượng có phù hợp không?" → Tính toán
5. "Ngày hợp lệ không?" → Kiểm tra niên đại
6. "Kết luận cuối cùng là gì? Thanh toán hay xuất toán?" → Đưa ra quyết định

### Biến ca nào thành bài học?

Nên sử dụng **ca XUẤT TOÁN** để dạy AI nhận ra sai lầm, không chỉ ca thanh toán đúng:

- 1 ca xuất toán vì sai chẩn đoán
- 1 ca xuất toán vì số lượng quá (bộ hoặc toàn bộ)
- 1 ca xuất toán vì thuốc không danh mục
- 1 ca thanh toán đúng (để AI biết pattern tích cực)

## 10. Bước tiếp theo

Sau khi tiêu hóa thẻ này, nên:

1. **Tạo danh sách 10 thuốc thường xuyên gây xuất toán tại BV** với phạm vi thanh toán của mỗi thuốc
2. **Chọn từng thuốc, làm 1 ca XUẤT TOÁN + 1 ca THANH TOÁN ĐÚNG** để AI học đối lập
3. **Kiểm tra quy trình XML -> audit -> giám định thanh toán** bằng cách lấy audit JSON thật
4. **Cập nhật các rule kiểm tra thanh toán** trong `luat_thuoc_hardcoded.jsx` nếu cần bổ sung logic mới

---

## Ghi chú

Tài liệu này không thay thế quyết định của giám định viên chuyên gia. Nó chỉ là hướng dẫn AI để:
- Hiểu từng bước kiểm tra thanh toán
- Biết tư duy khi gặp sai lầm thanh toán
- Hỏi câu đúng để tra cứu danh mục khi cần
- Giải thích rõ ràng cho người dùng tại sao xuất toán
