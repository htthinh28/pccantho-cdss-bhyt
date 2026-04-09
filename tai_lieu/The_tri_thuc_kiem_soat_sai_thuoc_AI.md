# THẺ TRI THỨC: KIỂM SOÁT “SAI THUỐC” CHO AI GIÁM ĐỊNH BHYT

Phiên bản tài liệu: 1.5  
Ngày cập nhật: 06/04/2026

## 1. Mục đích

Trong giám định BHYT, “sai thuốc” **không phải một khái niệm duy nhất**. AI cần phân tầng để:

- không gom mọi cảnh báo thuốc thành một kết luận “chỉ định sai”;
- phân biệt **rủi ro thanh toán / xuất toán** với **rủi ro an toàn lâm sàng** với **lỗi nhập liệu / nhất quán dữ liệu**;
- biết **dòng dữ liệu XML** nào phải đọc cho từng loại.

Tài liệu này là **khung nền**; các đợt thẻ theo nhóm (dot1–dot5 thuốc, kháng sinh, ngoại trú…) chi tiết hóa từng nhánh.

## 2. Định nghĩa làm việc (cho AI)

| Thuật ngữ | Ý nghĩa trong CDSS |
|-----------|-------------------|
| **Sai chỉ định thanh toán** | Thuốc hoặc cách kê không phù hợp **phạm vi thanh toán BHYT** theo chẩn đoán / nhóm thuốc / ngoại trú (ví dụ ICD không mở chỉ định). |
| **Sai liều / tần suất / thời gian** | Vượt ngưỡng rule seed (mg, lần/ngày, số ngày…) hoặc không khớp cấu trúc liều khai báo. |
| **Sai lệch y lệnh – cấp phát** | `SO_LUONG` (hoặc tương đương) **không khớp** với y lệnh suy ra từ `SL_MOI_NGAY`, `SO_NGAY` (rule `THUOC_391`). |
| **Sai đường dùng / ngữ cảnh điều trị** | Ví dụ kháng sinh **dự phòng** ghi như **điều trị** dài ngày; tiêm vs uống so với bối cảnh nội/ngoại trú. |
| **Thiếu thuốt đi kèm gói / PTTT** | Có DVKT/PTTT nhưng **XML2** không có thuốc bắt buộc theo rule (thường gắn XML3 + XML2). |
| **Lỗi danh mục / giá / hành chính đơn thuốc** | `DM-THUOC-*`, `THUOC_436` (INN đơn ngoại trú), `DM-THUOC-04` (giá) — **chưa chắc** là “sai chỉ định lâm sàng”. |
| **Phụ lục I BYT — hạng BV & cột (8)** | `MA_CSKCB` + Phụ lục I cột **(4)–(7)** và **(8)** (điều kiện, tỷ lệ) — xem `The_tri_thuc_mau_thanh_toan_thuoc_BHYT.md` §3.4, §4.5–4.6. |

## 3. Phân loại kiểm soát (bảng tra nhanh)

| STT | Loại kiểm soát | Dữ liệu ưu tiên | Gợi ý rule / nhóm |
|-----|----------------|-----------------|-------------------|
| 1 | Chỉ định theo ICD / chẩn đoán | `XML1.MA_BENH_CHINH`, `MA_BENH_KT`, `CHAN_DOAN_*`, `XML2.MA_THUOC` | `THUOC_345`, `THUOC_417`, `THUOC_342`, … |
| 2 | Ngưỡng liều / tần suất | `XML2` các trường số, `LIEU_DUNG` | `THUOC_01`…, `THUOC_392`, … |
| 3 | Sai lệch số lượng cấp vs y lệnh | `XML2.SO_LUONG`, `SL_MOI_NGAY`, `SO_NGAY` | **`THUOC_391`** |
| 4 | Kháng sinh / dự phòng / điều trị | `XML1`, `XML2.TEN_THUOC`, `MA_NHOM`, đường dùng | `THUOC_84`, `THUOC_85`, ca `403521`, `000339` |
| 5 | Ngoại trú – đơn / hạn mức / INN | `MA_LOAI_KCB`, `XML2` | `THUOC_391` (khác ngữ cảnh), `THUOC_436`, `THUOC_…` ngoại trú |
| 6 | Đồng bộ tiền thuốc | `XML1.T_THUOC`, tổng `XML2` | `XML_53`, `CLN-CHI-01` |
| 7 | Thuốc đi kèm DVKT/PTTT | `XML3`, `XML2` | `DVKT_2588`, các rule “gói” |
| 8 | **Đơn ngoại trú — trùng mã / liều / thời gian** | `XML2`, `XML1` (ICD >30 ngày) | **`CLN-THUOC-01`…`04`** (built-in, xem chỉ mục engine) |
| 9 | **Hạng BV & điều kiện/tỷ lệ Phụ lục I** | `XML1.MA_CSKCB`, Phụ lục I **(4)–(8)** | Văn bản **15/VBHN-BYT** — `The_tri_thuc_mau_thanh_toan_thuoc_BHYT.md` |

## 4. Nguyên tắc suy luận (tránh nhầm)

1. **Đọc đúng dòng XML2**: Một hồ sơ có nhiều dòng thuốc; cùng mã rule có thể lặp **theo từng index** — cần map cảnh báo với đúng dòng (tên thuốc, mã, số lượng).
2. **Một hồ sơ, nhiều lớp lỗi**: Ví dụ vừa có cảnh báo **thiếu thuốc tê trong gói mổ** (XML3+XML2) vừa có **sai lệch số lượng cấp Biofazolin** (XML2) — hai vấn đề **độc lập**, không gộp giải thích.
3. **“KIỂM TRA” ≠ “XUẤT TOÁN”**: Nhiều cảnh báo dùng từ “kiểm tra”; mức nghiệp vụ và hướng xử lý khác ⛔ xuất toán cứng.
4. **Thiếu dữ liệu**: Nếu `SL_MOI_NGAY` / `SO_NGAY` trống hoặc 0, không tự ý khẳng định “gian lận”; ghi rõ *cần đối chiếu văn bản y lệnh / hệ thống HIS*.

## 5. Prompt mẫu cho huấn luyện AI

Sau khi nạp audit JSON hoặc XML, có thể dùng:

- *“Phân loại các cảnh báo liên quan thuốc trong hồ sơ này theo bảng các loại kiểm soát trong `The_tri_thuc_kiem_soat_sai_thuoc_AI.md` (gồm cả `CLN-THUOC-*` nếu có). Mỗi loại liệt kê: mã rule, index XML2 nếu có, và kết luận nghiệp vụ một dòng.”*
- *“Với rule THUOC_391, chứng minh bằng số: SO_LUONG vs SL_MOI_NGAY × SO_NGAY cho từng dòng bị cảnh báo.”*
- *“Có tồn tại cảnh báo không phải ‘sai thuốc’ thuần túy (ví dụ giá, INN, tổng tiền) không? Tách riêng.”*

## 6. Ca huấn luyện gắn khung này

| Ca | Trọng tâm “sai thuốc” |
|----|------------------------|
| `The_tri_thuc_da_dang_nhom_thuoc_dan_muc_BV_AI.md` | **Đa nhóm thuốc danh mục BV** + bài lô 20 mục |
| `Ca_huan_luyen_mau_000589_nhieu_nhom_thuoc_mot_ho_so.md` | Một hồ sơ: ho Đông dược + KS tiêm + probiotic + XML_121 |
| `Ca_huan_luyen_mau_000308_THUOC_391_sai_lech_so_luong_y_lenh.md` | Sai lệch cấp phát vs y lệnh (`THUOC_391`) |
| `Ca_huan_luyen_mau_403538_THUOC_345_MOGASTIC.md` | Sai chỉ định thanh toán theo ICD |
| `Ca_huan_luyen_mau_000434_THUOC_417_DOMUVAR.md` | Cấp dư + ICD (DOMUVAR) |
| `Ca_huan_luyen_mau_000339_Mekoferrat_sai_chan_doan.md` | Chỉ định / chẩn đoán (Mekoferrat) |
| `Ca_huan_luyen_mau_000339_Biofazolin_du_phong_phu_khoa.md` | Kháng sinh dự phòng vs ngữ cảnh |
| `Ca_huan_luyen_mau_OP26001050_Ciprofloxacin_ngoai_tru.md` | Ngoại trú + nhiều lớp (đơn, giá, …) |
| `Ca_huan_luyen_mau_OP26000282_I10_tang_huyet_ap.md` | Ngoại trú: nhiều thuốc (KS, tim mạch, giảm đau, INN, giá) |
| `The_tri_thuc_giam_dinh_thuoc_DM_builtin_va_doi_chieu_tien_AI.md` | **DM-THUOC-01…04** + `XML_53` / `CLN-CHI-01` (đối chiếu tiền) |
| `Ca_huan_luyen_mau_000589_DM_THUOC_03_danh_muc_noibo_snapshot.md` | `DM-THUOC-03` lặp theo dòng (snapshot audit) |
| `Ca_huan_luyen_mau_OP26000908_THUOC_267_Medlon_Methylprednisolon_ICD.md` | Corticoid `THUOC_267` (Medlon) — cổng ICD |
| `Ca_huan_luyen_mau_ER26000392_THUOC_374_Magnesi_ICD_va_chong_lop.md` | Magnesi B6 `THUOC_374` + `THUOC_417` + `THUOC_436` chồng lớp |
| `Ca_huan_luyen_mau_000573_THUOC_391_Dafodin_giuong_PT.md` | `THUOC_391` (Dafodin) trong nội trú — giường / DVKT đi kèm |
| `The_tri_thuc_chi_muc_giam_dinh_thuoc_engine_AI.md` | **Bản đồ engine**: built-in vs seed, lọc ngữ cảnh, `enrichXML2` |
| `Ca_huan_luyen_mau_IP26000139_DOMUVAR_THUOC_63_va_THUOC_417_noi_tru.md` | Nội trú: `THUOC_63` ×3 + `THUOC_417` ×5 + XML_121 |

## 7. Tài liệu nền trong repo

- `The_tri_thuc_chi_muc_giam_dinh_thuoc_engine_AI.md` — luồng mã giám định thuốc và lọc cảnh báo.  
- `The_tri_thuc_giam_dinh_thuoc_DM_builtin_va_doi_chieu_tien_AI.md` — danh mục nội bộ thuốc và đối chiếu tổng tiền.
- `The_tri_thuc_mau_thanh_toan_thuoc_BHYT.md` — thanh toán vs an toàn.
- `The_tri_thuc_mau_nhom_thuoc_dot1.md` … `dot5` — từng đợt chi tiết.
- `Bo_nguon_tri_thuc_quan_ly_su_dung_khang_sinh.md`, `The_tri_thuc_phap_ly_quan_ly_su_dung_khang_sinh.md` — kháng sinh.
- Seed: `ma_nguon/tien_ich/du_lieu_luat_thuoc_muc8.jsx`.
- Đa dạng nhóm trong danh mục BV: `The_tri_thuc_da_dang_nhom_thuoc_dan_muc_BV_AI.md`.

---

*Tài liệu có thể nâng phiên bản khi bổ sung thêm loại kiểm soát hoặc rule mới; mỗi lần bổ sung nên gắn ít nhất một ca audit minh họa.*
