# THẺ TRI THỨC MẪU NHÓM CHUYÊN MÔN ICD10 ĐỢT 1

Phiên bản tài liệu: 1.0  
Ngày cập nhật: 06/04/2026

## 1. Mục tiêu

Đợt này chuyển trọng tâm huấn luyện sang suy luận chuyên môn dựa trên:

- `XML1.MA_BENH_CHINH`
- `XML1.MA_BENH_KT`
- mô tả chẩn đoán vào/ra viện

Mục tiêu là để AI không chỉ đọc rule đơn lẻ, mà biết phân nhóm hồ sơ theo chuyên môn trước khi kết luận giám định.

## 2. Nguồn tri thức

- `ma_nguon/tien_ich/du_lieu_luat_thuoc_muc8.jsx`
- các case huấn luyện thuốc và PTTT đã có trong `tai_lieu/`
- audit thật có đa bệnh kèm (ví dụ: `test_xml/audit_403244_20260405_224614.json`)

## 3. Khung suy luận ICD10 theo nhóm chuyên môn

AI phải làm theo thứ tự:

1. Chuẩn hóa ICD10 chính và ICD10 kèm (tách theo `;`, loại ký tự nhiễu, giữ tiền tố 3-4 ký tự).
2. Phân nhóm chuyên môn theo ICD10 chính.
3. Kiểm tra ICD10 kèm có làm đổi ngữ cảnh chuyên môn hoặc chống chỉ định không.
4. Chỉ sau đó mới đối chiếu rule thanh toán/an toàn.

## 4. Thẻ tri thức mẫu đợt ICD10-1

---

## Thẻ ICD-CM1. Trục chuyên môn chính từ MA_BENH_CHINH

### 1. Mệnh đề cốt lõi

- `MA_BENH_CHINH` là trục chuyên môn chính để chọn tuyến suy luận đầu tiên (tim mạch, hô hấp, tiêu hóa, tiết niệu, sản khoa...).

### 2. Dữ liệu cần kiểm tra

- `XML1.MA_BENH_CHINH`
- `XML1.CHAN_DOAN_VAO`
- `XML1.CHAN_DOAN_RV`

### 3. Cách suy luận đúng

- Không dùng thuốc/dịch vụ để đoán chuyên môn trước ICD10 chính.
- Nếu mã chính mơ hồ hoặc không chuẩn, hạ mức chắc chắn và yêu cầu đối chiếu mô tả chẩn đoán.

---

## Thẻ ICD-CM2. MA_BENH_KT là lớp điều chỉnh quyết định giám định

### 1. Mệnh đề cốt lõi

- `MA_BENH_KT` không phải thông tin phụ. Đây là lớp điều kiện có thể:
  - mở rộng chỉ định hợp lệ
  - tạo chống chỉ định
  - tăng mức rủi ro chuyên môn

### 2. Dữ liệu cần kiểm tra

- `XML1.MA_BENH_KT`
- tập ICD10 chống chỉ định/điều kiện trong rule

### 3. Cách suy luận đúng

- Luôn kiểm tra đồng thời ICD chính và ICD kèm.
- Nếu ICD chính không khớp chỉ định nhưng ICD kèm khớp, kết luận phải là "cần đối chiếu chỉ định mở rộng", không xuất toán vội.

---

## Thẻ ICD-CM3. Ưu tiên ICD10 trước, mô tả text hỗ trợ sau

### 1. Mệnh đề cốt lõi

- Khi giám định chuyên môn, thứ tự bằng chứng là:
  1) ICD10 có cấu trúc (`MA_BENH_CHINH`, `MA_BENH_KT`)  
  2) mô tả text (`CHAN_DOAN_VAO`, `CHAN_DOAN_RV`)

### 2. Cách suy luận đúng

- Chỉ dùng regex mô tả chẩn đoán để giảm false positive khi ICD chưa đủ bao phủ.
- Không để text ghi đè hoàn toàn ICD10 nếu không có căn cứ rõ.

---

## Thẻ ICD-CM4. Bản đồ nhóm chuyên môn từ tiền tố ICD10

### 1. Mệnh đề cốt lõi

- AI nên map nhanh ICD10 vào nhóm chuyên môn để điều phối phân tích:
  - `I*`: tim mạch
  - `J*`: hô hấp
  - `K*`: tiêu hóa
  - `N*`: tiết niệu - sinh dục
  - `O*`: sản khoa
  - `E*`: nội tiết - chuyển hóa
  - `M*`: cơ xương khớp
  - `L*`: da liễu

### 2. Cách suy luận đúng

- Dùng nhóm chuyên môn để chọn cụm rule phù hợp và cách giải thích nghiệp vụ.
- Không dùng map nhóm để thay thế kết luận pháp lý thanh toán.

---

## Thẻ ICD-CM5. Ma trận kết luận chuyên môn

### 1. Mệnh đề cốt lõi

- Kết luận giám định theo ICD10 nên đi theo ma trận:
  - **Khớp chỉ định + không có chống chỉ định** -> ưu tiên thanh toán
  - **Không khớp chỉ định** -> nguy cơ xuất toán
  - **Khớp chỉ định nhưng có ICD chống chỉ định** -> cảnh báo an toàn/chuyên môn cao
  - **Dữ liệu ICD mơ hồ hoặc xung đột** -> từ chối tạm, yêu cầu bổ sung chứng cứ

### 2. Cách suy luận đúng

- Luôn ghi rõ mức chắc chắn: chắc chắn / tạm thời / cần bổ sung dữ liệu.

## 5. Prompt vận hành khuyến nghị

Mẫu prompt huấn luyện theo ICD10 chuyên môn:

```
Hãy phân tích hồ sơ theo 4 bước:
1) Tách MA_BENH_CHINH và MA_BENH_KT.
2) Xác định nhóm chuyên môn chính.
3) Đối chiếu ICD10 với điều kiện chỉ định/chống chỉ định của các rule liên quan.
4) Kết luận theo ma trận: thanh toán / cảnh báo / xuất toán / từ chối tạm.
Yêu cầu nêu rõ dữ liệu nào đã đủ và dữ liệu nào còn thiếu.
```

## 6. Kết luận đợt ICD10-1

Sau đợt này, AI phải đạt tối thiểu 3 năng lực:

1. đọc đúng quan hệ giữa `MA_BENH_CHINH` và `MA_BENH_KT`
2. phân nhóm chuyên môn trước khi kết luận rule
3. tránh kết luận quá mức khi dữ liệu ICD10 chưa đủ chắc chắn
