# THẺ TRI THỨC: PHÁC ĐỒ CDSS CHUYÊN MÔN ↔ MÃ ICD-10 (HUẤN LUYỆN AI)

Phiên bản dữ liệu: `version` **2026-04-11** trong `du_lieu_phac_do_cdss_guidelines.seed.json` — nguồn **`FileMau_PhacDo_CDSS 4.xlsx`** (sheet `Template`) **gộp** với kho seed trước đó (`npm run phac-do:rebuild-seed`); **348** mã ICD duy nhất (đã loại dòng mẫu placeholder `icd10` / `diseaseName`).  
Ngày cập nhật thẻ tri thức: 11/04/2026  

**Phạm vi:** hướng dẫn AI và giám định viên dùng **kho phác đồ nội bộ** (mục tiêu điều trị, điều trị đặc hiệu/triệu chứng, dự phòng, tái khám…) gắn với **mã ICD-10** trên hồ sơ. **Không** thay thế Phụ lục thanh toán DVKT (17/VBHN-BYT), danh mục thuốc BYT, hay hợp đồng KCB.

---

## 1. Vai trò trong CDSS BHYT

| Khía cạnh | Nội dung |
|-----------|----------|
| **Mục đích** | Gợi ý **chuyên môn lâm sàng** (phác đồ BV) khi tra cứu theo ICD: đối chiếu mục tiêu điều trị, theo dõi, dự phòng với thuốc/DVKT thực tế trên XML — phù hợp tinh thần **Điều 15 Luật BHYT** (chất lượng KCB), ở lớp **hỗ trợ quyết định**, không quyết định thay bác sĩ. |
| **Khác gì DM1/DM2 DVKT** | [The_tri_thuc_Danh_muc_1_DVKT_dieu_kien_ty_le_gia_VBHN17_AI.md](./The_tri_thuc_Danh_muc_1_DVKT_dieu_kien_ty_le_gia_VBHN17_AI.md) và DM2 xử lý **điều kiện thanh toán BHYT theo mã DVKT**. Phác đồ CDSS xử lý **nội dung chăm sóc theo bệnh (ICD)** — hai lớp có thể cùng một hồ sơ nhưng **câu hỏi khác nhau**. |
| **Nơi lưu trong app** | Bảng module **Chuyên môn → Phác đồ**; lưu cục bộ `CDSS_DATA_PHAC_DO_V3` / `CDSS_COLS_PHAC_DO_V3`. Seed mặc định nằm trong mã nguồn: `ma_nguon/chuyen_mon/phac_do_benh_vien/du_lieu_phac_do_cdss_guidelines.seed.json`. |

---

## 2. Ánh xạ ICD-10: hồ sơ XML ↔ bảng phác đồ

- **Trường trên XML1:** `MA_BENH_CHINH`, `MA_BENH_KT`, `MA_BENHKEM` — engine gom **token ICD** (regex chữ + số), **khử trùng** (cùng mã sau khi bỏ dấu chấm chỉ giữ một), rồi so với cột **`MÃ ICD-10`** trong bảng phác đồ.
- **Chuẩn hóa khớp kho:** `chuanHoaMaIcdPhacDoCdss`: bỏ ký tự `.`, `trim`, `UPPER` (cùng quy tắc trong `phac_do_cdss_columns.js` và `dong_co_giam_dinh.jsx`).
- **Lưu ý dữ liệu bảng:** một số ô `MÃ ICD-10` có thể ghi **dải mã** hoặc ký hiệu không phải một mã XML đơn (ví dụ mô tả khoảng). **So khớp tự động trong engine** dựa trên **mã đơn** lấy từ XML; khi ô bảng là dải/ký tự đặc biệt, AI và người cần **đọc diễn giải lâm sàng** trong dòng đó, không suy **đã khớp máy** nếu map không có key.

---

## 3. Cột nội dung (hướng dẫn suy luận cho AI)

Cột hiển thị chuẩn (tiếng Việt) tương ứng khóa import tiếng Anh trong `phac_do_cdss_columns.js`:

| Cột (VN) | Gợi ý cách dùng khi phản biện hồ sơ |
|----------|-------------------------------------|
| **MÃ ICD-10** | Khóa tra cứu; luôn đối chiếu với tập ICD đã gom từ XML1. |
| **TÊN BỆNH (CHẨN ĐOÁN)** | Đối chiếu mức độ nhất quán với văn bản chẩn đoán trên hồ sơ (không thay thế ICD chính thức). |
| **MỨC ĐỘ / THỂ BỆNH** | So với mức độ diễn tả trong XML5/XML6 nếu có. |
| **MỤC TIÊU ĐIỀU TRỊ** | Lớp “cần đạt gì” — so với chỉ định thuốc/DVKT có **cùng hướng** hay chỉ xử trí triệu chứng. |
| **TIÊN LƯỢNG** | Tham chiếu giải thích rủi ro/lợi ích, không dùng làm căn cứ từ chối thanh toán đơn thuần. |
| **ĐIỀU TRỊ ĐẶC HIỆU / TRIỆU CHỨNG** | So với XML2 (thuốc), XML3 (DVKT) — gợi ý **đối chiếu phác đồ** với thực tế kê đơn. |
| **CAN THIỆP / THỦ THUẬT-PT** | Liên hệ XML3/PTTT nếu có. |
| **LỐI SỐNG / HOẠT ĐỘNG**, **DINH DƯỠNG** | Giáo dục bệnh nhân; kiểm chứng khi có nội dung tương ứng trong hồ sơ. |
| **DỰ PHÒNG** (sơ cấp / biến chứng / di chứng) | Gợi ý kiểm soát chất lượng và tính đầy đủ tư vấn. |
| **THỜI GIAN TÁI KHÁM / THEO DÕI** | So `NGAY_HEN_TAI_KHAM` (XML1/XML6) nếu có. |
| **THEO DÕI LÂM SÀNG / CẬN LÂM SÀNG** | Gợi ý xét nghiệm/chỉ định có phù hợp tình trạng. |
| **GHI CHÚ ĐẶC BIỆT** | Tình huống đặc thù (thai kỳ, chống chỉ định…). |

---

## 4. Quy tắc giám định dữ liệu (LUẬT DỮ LIỆU — seed)

| Mã luật | Mặc định | Ý nghĩa (đã chuẩn hóa phạm vi) |
|---------|----------|--------------------------------|
| **CDSS_CM_01** | ON (Info) | Có kho phác đồ và **ít nhất một** mã ICD trên XML1 **trùng khóa** trong bảng — **chỉ nhắc tra cứu**; **không** kết luận điều trị đúng/sai theo phác đồ. |
| **CDSS_CM_02** | OFF (Warning) | Có kho nhưng **không khóa ICD nào** trên XML1 trùng bảng — gợi ý bổ sung/kiểm tra dữ liệu; **không** suy ra sai phác đồ lâm sàng. |

**Hàm trong engine (No-Code):** `CO_KHO_TRI_THUC_PHAC_DO()`, `CO_PHAC_DO_CDSS_CHO_ICD(mã)`, `CO_PHAC_DO_CDSS_CHO_BAT_CU_ICD_TREN_XML1(XML1)`, `KHONG_CO_PHAC_DO_CDSS_CHO_MA_ICD_GOP_TREN_XML1(XML1)`.

**Meta:** `MAP_PHAC_DO_CDSS` chỉ chứa **khóa ICD đã chuẩn hóa** (bỏ dấu chấm, `UPPER`) — **không** chứa nội dung văn bản các cột phác đồ để so với XML2/XML3.

### 4.1. Những điểm **không thể** thực hiện đúng theo phác đồ CDSS chỉ bằng engine hiện tại

| Kỳ vọng theo phác đồ (lâm sàng) | Thực tế trong CDSS BHYT | Lý do kỹ thuật |
|--------------------------------|-------------------------|----------------|
| So khớp **mục tiêu điều trị / điều trị đặc hiệu / dự phòng** với thuốc (XML2) và DVKT (XML3) | **Không** tự động được | `MAP_PHAC_DO_CDSS` chỉ lưu **có/không** theo mã ICD (`taoMetaPhacDoCdssTuBang`); rule động không đọc chuỗi từ các cột văn bản phác đồ để so semantic với mã thuốc/mã dịch vụ. |
| Kết luận **vi phạm phác đồ** (sai thuốc, thiếu DVKT bắt buộc) | **Không** — ngoài phạm vi rule CDSS_CM | Cần ontology thuốc–chỉ định, tần suất, chống chỉ định; hiện chỉ có cảnh báo **Info** khi trùng mã ICD. |
| Khớp mọi biến thể ICD (ví dụ hồ sơ **A04.9** vs bảng chỉ ghi **A04** hoặc **A49**) | **Có thể lệch** | Khóa map = chuỗi ô `MÃ ICD-10` sau chuẩn hóa **một dòng một khóa**; không suy diễn tương đương ICD con–cha. |
| Ô `MÃ ICD-10` ghi **dải / nhiều mã** (vd. `A15 - A16`, `B20 - B24`) | **Không** tách thành nhiều khóa | Toàn bộ ô trở thành một khóa duy nhất; token ICD trên XML (từng mã đơn) thường **không** trùng chuỗi dải. |
| Thu thập ICD từ **XML5/XML6** hoặc văn bản chẩn đoán tự do | **Không** — chỉ XML1 | `layMaIcdGopChinhVaKemKhongTrung` chỉ đọc `MA_BENH_CHINH`, `MA_BENH_KT`, `MA_BENHKEM`. |
| Đối chiếu **tái khám / theo dõi** trong phác đồ với `NGAY_HEN_TAI_KHAM` | **Không** có rule CDSS_CM tích hợp | Có thể làm rule tùy chỉnh khác nếu cần; không nằm trong CDSS_CM_01/02. |

**Tóm lại:** Quy tắc chuyên môn gắn phác đồ CDSS trong hệ thống hiện tại = **lớp nhắc “có/không có dòng phác đồ cho mã ICD trên XML1”**. Mọi đánh giá **tuân thủ nội dung** phác đồ vẫn do **giám định viên / AI tra cứu** trên module Chuyên môn, không thay bằng cảnh báo tự động từ engine.

---

## 5. Phân bổ mã ICD trong kho (theo chữ cái đầu — thống kê)

| Nhóm (ký tự đầu sau chuẩn hóa) | Số dòng |
|--------------------------------|---------|
| M | 34 |
| I | 33 |
| R | 31 |
| K | 29 |
| N | 26 |
| F | 25 |
| J | 24 |
| B | 23 |
| E | 21 |
| A | 19 |
| S | 18 |
| G | 14 |
| D | 12 |
| H | 11 |
| L | 9 |
| O | 7 |
| Z | 5 |
| Q | 3 |
| C, T, P, U | 1 mỗi nhóm |

(Số liệu theo seed **2026-04-11** sau gộp FileMau v4; import Excel: `npm run phac-do:rebuild-seed -- "<đường dẫn .xlsx>"`.)

---

## 6. Prompt mẫu (huấn luyện AI)

- *“Với `MA_BENH_CHINH` / kèm trên XML1 = …, tra phác đồ CDSS nội bộ: nêu **mục tiêu điều trị** và **hai hạng mục** cần đối chiếu với XML2/XML3 (không kết luận thanh toán).”*
- *“Phân biệt **thiếu mã trong kho phác đồ** (CDSS_CM_02) với **sai chỉ định thanh toán theo DM1** (VBHN 17) — từng lớp cần trường XML nào?”*

---

## 7. Liên kết

- **Phương án triển khai chuỗi lâm sàng — CLS — chỉ định (rule có cấu trúc + AI):** [Phuong_an_trien_khai_Phac_do_Chuyen_mon_CLS_kiem_soat_chuoi.md](./Phuong_an_trien_khai_Phac_do_Chuyen_mon_CLS_kiem_soat_chuoi.md)
- Tóm tắt HTML (đồng bộ ý): [The_tri_thuc_phac_do_CDSS_chuyen_mon_giam_dinh_BHYT.html](./The_tri_thuc_phac_do_CDSS_chuyen_mon_giam_dinh_BHYT.html) (sau `npm run tai_lieu:prepare` nằm trong `public/tai_lieu/`).
- DVKT Danh mục 1 (tỷ lệ/giá): [The_tri_thuc_Danh_muc_1_DVKT_dieu_kien_ty_le_gia_VBHN17_AI.md](./The_tri_thuc_Danh_muc_1_DVKT_dieu_kien_ty_le_gia_VBHN17_AI.md).
- Đặc tả hệ thống: [Dac_ta_he_thong_CDSS_BHYT_20260405.md](./Dac_ta_he_thong_CDSS_BHYT_20260405.md).

---

## Phụ lục — Danh sách khóa `MÃ ICD-10` đã chuẩn hóa trong seed (tham chiếu nhanh)

> Dùng để tra cứu từ khóa; nội dung lâm sàng đầy đủ nằm trong từng dòng JSON/ứng dụng. Một số mục là ký hiệu dải/ghi chú từ nguồn bảng — khi so với XML chỉ các **mã đơn** trùng token mới khớp engine tự động.

```
A00, A01, A04, A05, A08, A09, A15, A15 - A16, A16, A36, A37, A39, A48, A49, A75, A852, A90-A91, A91, A97, B01, B02, B05, B06, B08, B084, B16, B171 - B182, B18, B181, B20 - B24, B26, B34, B35, B66, B67, B68, B77, B78, B81, B88, B90, B99, C34, D21, D23, D24, D25, D27, D34, D37, D38, D50, D56, D64, D69, E03, E039, E04, E05, E050, E06, E07, E10, E101, E11, E24, E27, E271, E56, E58, E60, E61, E78, E83, E87, E89, F063, F313, F320, F321, F322, F323, F332, F341, F41, F432, F513, F514, F515, F52, F520, F521, F522, F523, F524, F525, F526, F527, F528, F530, F65X, G24, G2581 (G4761), G43, G44, G47, G470 (F510), G471 (F511), G472, G473, G474, G4752, G55, G56, G58, H10, H60, H61, H65, H66, H68, H81, H82, H91, H92, H93, I050, I07, I099, I10, I11, I20, I209, I210, I25, I269, I309, I330, I340, I350, I409, I420, I421, I471, I472, I48, I480, I49, I50, I502, I503, I64, I69, I70, I702, I802, I83, I87, I88, J00, J01, J02, J03, J04, J06, J18, J189, J20, J21, J30, J31, J32, J34, J35, J37, J40, J41, J42, J44, J449, J45, J93, J96, K05, K07, K11, K12, K14, K21, K22, K25, K27, K279, K29, K30, K31, K40, K51, K52, K57, K58, K59, K60, K62, K63, K64, K74, K75, K76, K77, K80, K92, L02, L03, L04, L20, L23, L24, L29, L30, L50, M02, M06, M10, M100, M13, M16, M17, M19, M23, M329, M339, M340, M350, M353, M45, M47, M478, M48, M51, M512, M54, M65, M653, M654, M722, M75, M750, M76, M77, M79, M797, M81, M810, M86, N04, N18, N189, N20, N23, N30, N34, N39, N40, N45, N47, N48, N61, N64, N72, N75, N76, N80, N81, N84, N86, N91, N92, N93, N94, N95, O03, O20, O21, O30, O36, O60, O91, P54, Q18, Q21, Q50, R00, R002, R04, R040, R05, R06, R060, R07, R074, R10, R109, R11, R13, R17, R197, R252, R31, R32, R42, R470, R50, R509, R51, R53, R55, R59, R60, R609, R63, R634, R73, S00, S01, S20, S22, S30, S40, S42, S50, S52, S60, S61, S62, S70, S80, S82, S90, S91, S92, T78, U071, Z32, Z34, Z35, Z39, Z98
```

*Tài liệu này cố định **tư duy tri thức chuyên môn phác đồ CDSS theo ICD-10** trong repo; mọi kết luận pháp lý thanh toán vẫn căn cứ văn bản BYT/BHXH và hợp đồng KCB.*
