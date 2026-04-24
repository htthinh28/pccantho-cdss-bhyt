# CA HUẤN LUYỆN MẪU 000375 — DVKT-OP-09 — DANH MỤC NỘI BỘ (CHECK_INTERNAL_APPROVAL)

Phiên bản tài liệu: 1.0  
Ngày cập nhật: 09/04/2026

## 1. Mục tiêu

Huấn luyện AI nhận diện cảnh báo từ **engine DVKT no-code** (`dvkt_op_giam_dinh.jsx`): mã rule dạng **`DVKT-OP-xx`** (có **dấu gạch ngang**), **không** phải seed số **`DVKT_26xx`** trong `du_lieu_luat_pttt_muc11.jsx`.

Trọng tâm phiên này: **`DVKT-OP-09`** — toán tử **`CHECK_INTERNAL_APPROVAL`**: dịch vụ **không khớp danh mục nội bộ CSKCB** (bảng **M05** / phê duyệt nội bộ trong cấu hình engine).

**Neo pháp lý (đã gắn trong cảnh báo audit):** VBHN **17** — **Điều 3** khoản 1 điểm a, khoản 2 (điều kiện thực hiện và danh mục); kèm tham chiếu NĐ 188, TT 01/2025, QĐ 3618 — AI dùng để **giải thích hướng tra cứu**, không thay văn bản gốc.

## 2. Nguồn dữ liệu

- Audit: `test_xml/audit_000375_20260405_065828.json`
- XML gốc (meta): `…\ip\PC022112088_IP26000080.xml`
- Engine: `ma_nguon/tien_ich/dvkt_op_giam_dinh.jsx` — `DEFAULT_DVKT_RULES` mục **DVKT-OP-09**; hàm xuất: `chayGiamDinhDvktOp` / `verifyClaimDvktOp`.
- Tích hợp luồng giám định: `dong_co_giam_dinh.jsx` (meta **`DVKT_OP`** → nhánh `dvkt_op_giam_dinh`).

## 3. Tóm tắt hồ sơ

- `MA_LK`: **000375**
- `total_warnings`: **6**
- **`DVKT-OP-09`:** **2** lần — **XML3** `index` **0** và **1** (cùng mã dịch vụ minh họa **K27.1918** — giường nội khoa; nội dung cảnh báo: mã **chưa có trong danh mục để đối chiếu**).

**Cùng hồ sơ:** `HC_171`, `HC_46`, `HC_68`, `HD_10` — AI **không** gộp ý nghĩa với **`DVKT-OP-09`**.

## 4. Rule đích trong DEFAULT_DVKT_RULES

| Trường | Giá trị (mã nguồn) |
|--------|---------------------|
| **RULE_CODE** | `DVKT-OP-09` |
| **RULE_NAME** | Danh mục nội bộ được phê duyệt |
| **OPERATOR** | `CHECK_INTERNAL_APPROVAL` |
| **ALERT_MESSAGE (gốc)** | DVKT không nằm trong danh mục nội bộ được phê duyệt. |

**Lưu ý:** Trong audit, `dieu_kien` hiển thị là **`CHECK_INTERNAL_APPROVAL`** (tên toán tử). Mức độ trên bản ghi có thể là **Warning** sau chuẩn hóa pipeline — khi đối chiếu seed, xem thêm `toMucDo` / lọc nội bộ trong `dong_co_giam_dinh.jsx`.

## 5. Bài tập cho AI

1. Giải thích **một câu** sự khác biệt giữa **`DVKT-OP-09`** và **`DVKT_2587`** (cùng là “điều kiện” trên XML3 nhưng **nguồn rule** và **bảng dữ liệu** khác nhau).
2. Vì sao **hai dòng XML3** (index 0 và 1) có thể **lặp cùng mã** `DVKT-OP-09`? (Gợi ý: rule chạy **theo từng dòng DVKT**.)

## 6. Liên kết

- Bảng neo: [Bang_neo_phien_huan_luyen_dvkt_va_engine.md](./Bang_neo_phien_huan_luyen_dvkt_va_engine.md)
- Phiên tri thức DVKT: [Huan_luyen_phien_DVKT_VBHN17_Cursor.md](./Huan_luyen_phien_DVKT_VBHN17_Cursor.md)
