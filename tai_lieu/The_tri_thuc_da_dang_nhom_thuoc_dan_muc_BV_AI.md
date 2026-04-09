# THẺ TRI THỨC: ĐA DẠNG NHÓM THUỐC DANH MỤC BỆNH VIỆN (HUẤN LUYỆN AI)

Phiên bản tài liệu: 1.3  
Ngày cập nhật: 06/04/2026

## 1. Mục đích

Bệnh viện khai **hàng trăm đến hàng nghìn mã thuốc** (`MA_THUOC`, `TEN_THUOC`). AI giám định cần:

- không học “một thuốc một kiểu” rời rạc mà nắm **nhóm chức năng kiểm soát** (chỉ định ICD, liều, số lượng, giá, INN, kháng sinh…);
- tra cứu nhanh: **thuốc ví dụ → mã → rule điển hình → file audit**;
- khi gặp mã lạ, biết **suy ra nhóm** (ví dụ “phối hợp beta-lactam”, “ho thảo dược”) để chọn đúng lớp rule.

Nguồn rule thực tế: `ma_nguon/tien_ich/du_lieu_luat_thuoc_muc8.jsx` + built-in `DM-THUOC-*`, `XML_*`.

## 2. Bảng tra nhanh: nhóm dược lý / nghiệp vụ ↔ ví dụ danh mục BV

| STT | Nhóm (mô tả nghiệp vụ) | Ví dụ tên / biệt dược trong audit | `MA_THUOC` (ví dụ) | Rule / cơ chế tiêu biểu | Audit / ca minh họa |
|-----|-------------------------|-------------------------------------|--------------------|-------------------------|----------------------|
| 1 | **Kháng sinh phối hợp uống** (beta-lactam + inhibitor) | Cepmox-Clav, Klamentin | `40.155` | `THUOC_41` (ICD hô hấp/TMH/da), `DM-THUOC-04` (giá), `THUOC_436` (INN ngoại trú) | `OP26000908`, `OP26000282` |
| 2 | **Cephalosporin tiêm** (điều trị / nội trú) | Tenamyd-Cefotaxime, Biofazolin | `40.173`, `40.166` | `THUOC_391` (cấp vs y lệnh), ngữ cảnh KS | `000589`, `000308`, `000339` (Biofazolin) |
| 3 | **Fluoroquinolon** | Ciprofloxacin (ví dụ ngoại trú) | (theo hồ sơ) | Đơn ngoại trú, INN, giá | `OP26001050` |
| 4 | **Thuốc ho / long đờm (thành phần thảo dược)** | Hoastex | `05C.150` | `THUOC_207` (J06/J20/R05 + mô tả) | `000589` |
| 5 | **Men vi sinh / probiotic đường ruột** | DOMUVAR | `40.718` | `THUOC_63` (A09, K59.1, R19.7…), `THUOC_417` (cấp dư) | `000589`, `000434` |
| 6 | **Paracetamol / giảm đau hạ sốt** | Partamol, Hapacol 650 | `40.48` | `THUOC_311` (R50, R52, M54 + mô tả), `DM-THUOC-04` | `OP26000282` |
| 7 | **Corticoid hệ thống** | Medlon (Methylprednisolon) | `40.775` | `THUOC_267` (J45, J44, M05, L50…) | `OP26000908` |
| 8 | **Simethicon / đầy hơi** | Mogastic, Simecol (Simethicon) | `40.750` | `THUOC_345` (R14 + mô tả) | `403538` |
| 9 | **Sắt uống** (thiếu máu) | Mekoferrat | (theo seed) | `THUOC_342` (D50/O25…) | `000339` (Mekoferrat) |
| 10 | **Thuốc tiêm phối hợp Amoxicillin–clavulan** | Amoxiclav (ngữ cảnh uống/tiêm theo hồ sơ) | `40.155` (thường gặp) | `THUOC_41`, có thể kèm hạn mức khác | `OP26000908` |
| 11 | **Thuốc ức bơm proton** | Esomeprazol | `40.678` | `THUOC_436` (INN ngoại trú) | `OP26000282` |
| 12 | **Insulin / hạ đường huyết** | Insuact (ví dụ trong hồ sơ OP) | `40.549` | Đối chiếu ICD đái tháo đường / nội trú (rule khác trong seed) | `OP26000282` (bối cảnh đa bệnh) |
| 13 | **Thuốc tim mạch phối hợp** | Troysar AM | `40.30.496` | Nhóm tim mạch — tra seed + ICD I10–I25… | `OP26000282` |
| 14 | **Danh mục nội bộ: giá trúng thầu** | Mọi mã có đơn giá khai báo | `XML2.DON_GIA` | `DM-THUOC-04` | `OP26000282`, `OP26001050` |
| 15 | **Chuẩn hóa đơn ngoại trú (TT 26/2025 / INN)** | Nhiều dòng `TEN_THUOC` | — | `THUOC_436` | `OP26001050`, `OP26000282` |
| 16 | **Đồng bộ tổng tiền thuốc** | Toàn bộ XML2 | — | `XML_53`, `CLN-CHI-01` | `OP26000282` |
| 17 | **Trùng lặp kê trong ngày** | — | — | `XML_121` | `000589` (cùng hồ sơ) |
| 18 | **Danh mục nội bộ — chưa xác minh (BYT/BV snapshot)** | Tenamyd-Cefotaxime, Clorpheniramin | `40.173`, `40.81` | `DM-THUOC-03` | `audit_000589_20260404_185800` — ca `Ca_huan_luyen_mau_000589_DM_THUOC_03_danh_muc_noibo_snapshot.md` |
| 19 | **Vitamin B6 + magnesi (chỉ định ICD)** | Magnesi B6 | `40.1055` | `THUOC_374` (+ có thể `THUOC_373` chống chỉ định) | `ER26000392` — `Ca_huan_luyen_mau_ER26000392_THUOC_374_Magnesi_ICD_va_chong_lop.md` |
| 20 | **Sai lệch cấp vs y lệnh (nội trú — giường/PT)** | Dafodin | `40.736` | `THUOC_391` | `000573` — `Ca_huan_luyen_mau_000573_THUOC_391_Dafodin_giuong_PT.md` |
| 21 | **Probiotic + KS cấp dư (nội trú nặng)** | DOMUVAR + Cefotaxime | `40.718`, `40.173` | `THUOC_63`, `THUOC_417` | `audit_PC022300479_IP26000139.json` — `Ca_huan_luyen_mau_IP26000139_DOMUVAR_THUOC_63_va_THUOC_417_noi_tru.md` |

*Bảng có thể mở rộng khi bổ sung ca mới; mỗi dòng mới nên có ít nhất một `MA_LK` kiểm chứng.*

## 3. Nguyên tắc gán “nhóm” cho AI

1. **Ưu tiên `MA_THUOC` + `TEN_THUOC`** từ XML2, không đoán hoạt chất nếu tên quá tắt.
2. **Đọc `MA_NHOM` / nhóm BHYT** (nếu có) để hỗ trợ phân loại nhưng **không thay rule ICD** đã gắn trong seed.
3. Cùng một hoạt chất có thể có **nhiều mã/biệt dược** → rule có thể gắn theo **mã cụ thể** trong `du_lieu_luat_thuoc_muc8.jsx`.
4. Một dòng thuốc có thể chịu **nhiều rule khác loại** (ví dụ vừa `THUOC_311` vừa `DM-THUOC-04`).

## 4. Bài lô huấn luyện (20 mục — giao cho AI)

Yêu cầu: với mỗi cặp (mã, tên) dưới đây, AI trả lời **ngắn gọn 3 dòng**: (a) nhóm nghiệp vụ, (b) rule seed cần xem trong file Excel/JSX, (c) loại kiểm soát theo `The_tri_thuc_kiem_soat_sai_thuoc_AI.md`.

1. `40.155` — Cepmox-Clav / Klamentin  
2. `40.173` — Cefotaxime  
3. `40.166` — Biofazolin  
4. `05C.150` — Hoastex  
5. `40.718` — DOMUVAR  
6. `40.48` — Partamol / Hapacol  
7. `40.775` — Medlon  
8. `40.750` — Mogastic / Simecol  
9. `40.678` — Esomeprazol  
10. `40.549` — Insuact  
11. `40.30.496` — Troysar AM  
12. `40.345` — (nếu có trong BV — tra danh mục)  
13. Mekoferrat — tra mã trong hồ sơ `000339`  
14. `40.750` + chẩn đoán không R14 — `THUOC_345`  
15. Bất kỳ dòng có `DON_GIA` > giá thầu — `DM-THUOC-04`  
16. Ngoại trú + `TEN_THUOC` không có `(INN)` — `THUOC_436`  
17. `SO_LUONG` < `SL_MOI_NGAY * SO_NGAY` — `THUOC_391`  
18. `SO_LUONG` > `SL_MOI_NGAY * SO_NGAY` — `THUOC_417`  
19. `XML1.T_THUOC` lệch tổng XML2 — `XML_53`  
20. Kháng sinh tiêm ngắn ngày quanh PTTT — xem `Bo_nguon_tri_thuc_quan_ly_su_dung_khang_sinh.md`

## 5. Prompt mẫu (đa thuốc / một hồ sơ)

- *“Đọc `audit_000589_20260405_232716.json`. Liệt kê từng **mã thuốc** bị cảnh báo, rule tương ứng, và giải thích vì sao đây là các **nhóm kiểm soát khác nhau** (ICD vs số lượng vs trùng kê).”*
- *“So sánh danh sách thuốc `OP26000282` với bảng mục 2: thuốc nào thuộc nhóm giảm đau, nhóm KS, nhóm giá/INN?”*

## 6. Liên kết

- Khung phân loại lỗi: `The_tri_thuc_kiem_soat_sai_thuoc_AI.md`  
- DM thuốc nội bộ + đối chiếu tiền + **DMBV-THUOC-***: `The_tri_thuc_giam_dinh_thuoc_DM_builtin_va_doi_chieu_tien_AI.md`  
- Ca Magnesi B6 / THUOC_374: `Ca_huan_luyen_mau_ER26000392_THUOC_374_Magnesi_ICD_va_chong_lop.md`  
- Ca Dafodin / THUOC_391 (000573): `Ca_huan_luyen_mau_000573_THUOC_391_Dafodin_giuong_PT.md`  
- Chỉ mục engine thuốc: `The_tri_thuc_chi_muc_giam_dinh_thuoc_engine_AI.md`  
- Ca nội trú DOMUVAR + THUOC_417: `Ca_huan_luyen_mau_IP26000139_DOMUVAR_THUOC_63_va_THUOC_417_noi_tru.md`  
- Ca một hồ sơ — nhiều nhóm: `Ca_huan_luyen_mau_000589_nhieu_nhom_thuoc_mot_ho_so.md`  
- Ca `DM-THUOC-03` (snapshot): `Ca_huan_luyen_mau_000589_DM_THUOC_03_danh_muc_noibo_snapshot.md`  
- Ca ngoại trú đa lớp (I10 + nhiều thuốc): `Ca_huan_luyen_mau_OP26000282_I10_tang_huyet_ap.md`  
- Đợt thẻ thuốc dot1–dot5: `The_tri_thuc_mau_nhom_thuoc_dot*.md`

---

*Cập nhật bảng mục 2 khi đơn vị thêm biệt dược mới hoặc khi seed `THUOC_*` bổ sung mã.*
