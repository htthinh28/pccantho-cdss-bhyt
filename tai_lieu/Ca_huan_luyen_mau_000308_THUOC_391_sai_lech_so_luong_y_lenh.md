# CA HUẤN LUYỆN MẪU 000308 — THUOC_391 — SAI LỆCH SỐ LƯỢNG CẤP PHÁT VỚI Y LỆNH

Phiên bản tài liệu: 1.0  
Ngày cập nhật: 08/04/2026

## 1. Mục tiêu

Huấn luyện AI nhận diện và giải thích đúng lớp lỗi **“sai lệch giữa số lượng cấp phát và y lệnh trên cùng một dòng thuốc”**, **không nhầm** với:

- sai chỉ định ICD–thuốc (như `THUOC_345`, `THUOC_417`);
- thiếu thuốc trong gói PTTT/DVKT (như `DVKT_2588` cùng hồ sơ);
- lỗi hành chính / tổng tiền.

Trọng tâm rule: **`THUOC_391`**.

## 2. Nguồn dữ liệu

- Audit: `test_xml/audit_000308_20260405_083942.json`
- XML gốc (đường dẫn lưu trong meta audit): `…\ip\PC022209964_IP26000013.xml` — nếu có bản trong repo, đối chiếu thêm; không có thì dùng **toàn bộ trường trong JSON cảnh báo** làm sự thật vận hành.
- Seed rule: `ma_nguon/tien_ich/du_lieu_luat_thuoc_muc8.jsx` — mục `THUOC_391`.

## 3. Tóm tắt hồ sơ

- `MA_LK`: `000308`
- `total_warnings`: **8** (snapshot)
- Cảnh báo thuốc: **`THUOC_391` xuất hiện 3 lần** (3 dòng `XML2` khác nhau: index `0`, `1`, `3`).
- Thuốc minh họa trong cảnh báo: **Biofazolin**, mã `40.166` (trích từ text cảnh báo).

**Cùng hồ sơ còn có** (để tập cho AI **không gộp** nghĩa):

- `DVKT_2587`, `DVKT_2588` — chỉ định/thực hiện DVKT phẫu thuật lấy thai (gói), liên quan **O82** và **thiếu thuốc tê/mê trong XML2** theo điều kiện rule.
- `HC_130`, `HC_171`, `HD_10` — hành chính / hồ sơ / JCI xét nghiệm.

## 4. Rule đích: THUOC_391

### 4.1. Định nghĩa trong seed

- **Mã:** `THUOC_391`
- **Tên:** Cảnh báo sai lệch y lệnh và số lượng
- **Điều kiện:**  
  `XML2.SO_LUONG < (XML2.SL_MOI_NGAY * XML2.SO_NGAY)`
- **Cảnh báo (gốc):**  
  `⚠️ [KIỂM TRA]: Số lượng cấp phát thấp hơn y lệnh. Vui lòng xác nhận bệnh nhân có tự túc thuốc hay không.`

### 4.2. Ý nghĩa nghiệp vụ

- Hệ thống so sánh **số lượng thực khai** (`SO_LUONG`) với **số lượng lý thuyết từ y lệnh** (`SL_MOI_NGAY × SO_NGAY`).
- Nếu **cấp ít hơn** y lệnh → cờ **KIỂM TRA**: có thể do bệnh nhân **tự mua**, **cắt liều**, **ghi sai số**, hoặc **tách đơn** — AI **không** được kết luận một chiều “vi phạm” mà phải nêu **các giả thuyết cần đối chiếu**.

### 4.3. Dữ liệu bắt buộc phải xem

Trên **từng dòng** có cảnh báo:

- `XML2.SO_LUONG`
- `XML2.SL_MOI_NGAY`
- `XML2.SO_NGAY`
- (Kèm) `XML2.TEN_THUOC`, `XML2.MA_THUOC`, `index` trong audit để map đúng dòng.

## 5. Bài tập cho AI (sau khi nạp audit)

1. Liệt kê **đủ 3** cảnh báo `THUOC_391` và ghi rõ **`index`** XML2 từng cái.
2. Với mỗi cảnh báo, viết một dòng:  
   `SO_LUONG = ?` ; `SL_MOI_NGAY × SO_NGAY = ?` ; có thỏa `<` hay không (nếu số có trong JSON/XML — nếu thiếu số trong audit, ghi “cần mở XML2 dòng index X”).
3. Giải thích **vì sao** đây **không phải** cùng một vấn đề với `DVKT_2588` (gợi ý: rule khác, bảng dữ liệu khác XML2 vs điều kiện gói trên XML3+XML2).
4. Đề xuất **câu hỏi nghiệp vụ** cho điều dược / khoa: tối thiểu 2 câu (ví dụ: có tự túc? có kê nhầm SL_MOI_NGAY/SO_NGAY?).

## 6. Bài học rút ra (chuẩn hóa cho các ca sau)

- **Cùng mã rule, nhiều dòng:** coi là **lỗi lặp theo dòng**, tổng hợp báo cáo theo thuốc / theo index cho dễ xử lý.
- **THUOC_391** thuộc nhóm **“kiểm soát nhất quán y lệnh – cấp phát”** trong khung `The_tri_thuc_kiem_soat_sai_thuoc_AI.md`.
- Luôn phân tầng: nếu user hỏi chung chung “sai thuốc”, AI hỏi lại hoặc tự phân loại theo **bảng 7 loại** trước khi kết luận.

## 7. Liên kết

- Khung phân loại: `The_tri_thuc_kiem_soat_sai_thuoc_AI.md`
- Ca Biofazolin **kháng sinh / dự phòng** (khác ngữ cảnh): `Ca_huan_luyen_mau_000339_Biofazolin_du_phong_phu_khoa.md`
