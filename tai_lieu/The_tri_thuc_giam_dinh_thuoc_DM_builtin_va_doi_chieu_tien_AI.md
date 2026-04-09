# THẺ TRI THỨC: GIÁM ĐỊNH THUỐC — DANH MỤC NỘI BỘ (DM-THUOC) VÀ ĐỐI CHIẾU TIỀN

Phiên bản tài liệu: 1.2  
Ngày cập nhật: 06/04/2026

## 1. Mục đích

Bổ sung lớp tri thức **không nằm trong seed `THUOC_*`** nhưng chiếm tỷ trọng lớn trong audit thực tế: kiểm tra **mã thuốc và giá** so với **danh mục nội bộ bệnh viện** và **đối chiếu tổng tiền** giữa XML1 và XML2.

Nguồn logic: `ma_nguon/tien_ich/dong_co_giam_dinh.jsx` (khối kiểm tra `XML2` thuốc với `MAP_THUOC_BV`, `MAP_BYT_PL5`).

## 2. Chuỗi kiểm tra DM thuốc (theo mã nguồn)

Với mỗi dòng `XML2` (BHYT thanh toán), hệ thống xác định:

- `trongBV`: mã có trong `MAP_THUOC_BV` hay không.
- `trongBYT`: mã có trong danh mục thuốc BYT (`MAP_BYT_PL5`) hay không (khi map đã nạp).

| Mã rule | Điều kiện tóm tắt | Mức độ | Ý nghĩa giám định |
|---------|-------------------|--------|-------------------|
| **DM-THUOC-01** | Có trong BYT, **không** có trong DM nội bộ BV | Critical | Thuốc **chưa được BV phê duyệt** dùng/thanh toán — rủi ro xuất toán. |
| **DM-THUOC-02** | Không trong BYT và không trong DM BV | Critical | Thuốc **ngoài cả hai** danh mục — rất nặng. |
| **DM-THUOC-03** | Không xác định được trong DM BV, BYT **chưa tra được** (map rỗng hoặc không kết luận) | Warning | **Cần xác minh / cập nhật danh mục** — không kết luận xuất toán cứng như 01/02. |
| **DM-THUOC-04** | Có trong DM BV, `DON_GIA` khai báo **vượt** giá trúng thầu nội bộ (ngưỡng ~0,1%) | Error | **Rủi ro tài chính / sai giá** — đối chiếu hợp đồng thầu, biên bản điều chỉnh. |

**AI cần nhớ:** `DM-THUOC-03` thường xuất hiện khi **dữ liệu danh mục runtime** chưa đồng bộ hoặc mã mới; khác hoàn toàn với `THUOC_207` (ICD–thuốc).

### 2.1. DMBV-THUOC-* — chất lượng **bản ghi** trong `MAP_THUOC_BV`

Khác với bảng trên (so khớp **mã hồ sơ** với danh mục), nhóm **`DMBV-THUOC-*`** kiểm tra **tính đầy đủ của từng dòng danh mục nội bộ** cho các mã thuốc **đã có** trong map — theo `dong_co_giam_dinh.jsx` (hàm kiểm tra chất lượng DM BV, lặp **theo mã thuốc duy nhất** trong XML2).

| Mã rule | Trường / ý chính | Mức độ (mặc định trong code) |
|---------|------------------|--------------------------------|
| **DMBV-THUOC-00** | Chưa nạp / rỗng cả `MAP_THUOC_BV` | Info |
| **DMBV-THUOC-01** | Thiếu `TEN_THUOC` / hoạt chất hiển thị | Warning |
| **DMBV-THUOC-02** | Thiếu `DON_GIA_THAU` / đơn giá hợp lệ (>0) | Error |
| **DMBV-THUOC-03** | Thiếu `TU_NGAY` (ngày hiệu lực) | Warning |
| **DMBV-THUOC-04** | `TRANG_THAI` không hoạt động / không hiệu lực | Warning |

**AI cần nhớ:** `DMBV-THUOC-03` **không** thay thế `DM-THUOC-03` — một cái là **lỗi metadata danh mục**, một cái là **không xác định được mã trong DM/BYT** khi chạy luồng xuất toán thuốc.

Minh họa audit có `DMBV-THUOC-03`: `test_xml/audit_000308_20260404_184800.json` (cùng các rule PTTT/DVKT khác).

## 3. Đối chiếu tổng tiền thuốc (hai luồng)

| Mã | Nơi gắn | Ý chính |
|----|---------|---------|
| **XML_53** | XML1 `T_THUOC` vs **tổng** `THANH_TIEN_BV` các dòng thuốc nhóm MA_NHOM (thường `4`, `5`) | Lệch **kế toán** theo công thức engine. |
| **CLN-CHI-01** | Built-in “đối chiếu tổng tiền thuốc” (có thể liệt kê dòng nổi bật) | Cùng mục tiêu **nhất quán XML1↔XML2**, có thể hiển thị chi tiết khác nhau theo phiên bản. |

**Bài học cho AI:** Khi thấy **cả hai** hoặc một trong hai, ưu tiên mô tả là **“lệch tổng hợp tiền thuốc”**, sau đó đề xuất kiểm tra: làm tròn, nhóm `MA_NHOM`, dòng loại trừ BHYT, trùng import.

## 4. Liên hệ với seed `THUOC_*`

- **DM-THUOC-***: phụ thuộc **bảng danh mục BV** đã nạp vào app (storage / đồng bộ).
- **THUOC_***: phụ thuộc **điều kiện biểu thức** trên XML (ICD, liều, số lượng, INN…).

Một dòng thuốc có thể đồng thời: `DM-THUOC-04` **và** `THUOC_41` **và** `THUOC_436` (ngoại trú) — AI **liệt kê từng lớp**.

## 5. `LIEU_DUNG` và TT 37 (gợi ý)

- Rule **`THUOC_392`** (trong `du_lieu_luat_thuoc_muc8.jsx`) kiểm tra **cấu trúc** `LIEU_DUNG` theo TT 37/2024 (ngoại trú vs nội trú).
- Đây là lớp **chất lượng nhập liệu đơn thuốc**, tách khỏi DM và ICD.

## 6. Prompt mẫu

- *“Phân loại các cảnh báo `DM-THUOC-*` trong audit: mỗi cái là Critical / Warning / Error và hướng xử lý nghiệp vụ tương ứng.”*
- *“Giải thích sự khác nhau giữa DM-THUOC-01 và DM-THUOC-03 khi đều nói về ‘danh mục’.”*
- *“Hồ sơ có CLN-CHI-01 và XML_53: có trùng nghĩa không? Cần kiểm chứng trường nào trên XML1/XML2?”*

## 7. Ca minh họa trong repo

- `audit_000308_20260404_184800.json` — `DMBV-THUOC-03` (thiếu `TU_NGAY` trên bản ghi DM thuốc BV) kèm PTTT/DVKT.
- `Ca_huan_luyen_mau_000589_DM_THUOC_03_danh_muc_noibo_snapshot.md` — DM-THUOC-03 lặp nhiều dòng.
- `Ca_huan_luyen_mau_OP26000908_Amoxiclav_dieu_tri_uong.md` — DM-THUOC-04 + THUOC_41 + THUOC_436.
- `Ca_huan_luyen_mau_OP26000282_I10_tang_huyet_ap.md` — DM-THUOC-04 hai mã thuốc.

## 8. Liên kết

- **Chỉ mục engine** (CLN-THUOC-01…04, lọc ngữ cảnh `THUOC_391`/`417`): `The_tri_thuc_chi_muc_giam_dinh_thuoc_engine_AI.md`  
- Khung “sai thuốc”: `The_tri_thuc_kiem_soat_sai_thuoc_AI.md`  
- Đa nhóm thuốc BV: `The_tri_thuc_da_dang_nhom_thuoc_dan_muc_BV_AI.md`  
- Thanh toán thuốc tổng quan: `The_tri_thuc_mau_thanh_toan_thuoc_BHYT.md`
