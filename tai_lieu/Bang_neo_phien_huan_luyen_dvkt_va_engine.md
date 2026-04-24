# Bảng neo — phiên huấn luyện DVKT ↔ engine (repo)

Mục đích: mỗi phiên DVKT **luôn** trỏ tới **thẻ tri thức VBHN**, **ít nhất một nhóm mã `DVKT_*` / `CDHA_*` hoặc gói PTTT**, file **seed/mã**, và **ca mẫu / audit** khi có — tránh học khái niệm 17/VBHN tách khỏi dòng rule thực tế. **Khung suy luận thống nhất cho AI:** [Chuan_hoa_kien_thuc_AI_giam_dinh_DVKT.md](./Chuan_hoa_kien_thuc_AI_giam_dinh_DVKT.md).

| Phiên | MA_LUAT / ví dụ | File seed hoặc mã chính | Thẻ tri thức / chỉ mục | Ca mẫu / audit (nếu có) |
|-------|-----------------|-------------------------|-------------------------|-------------------------|
| [DVKT — 17/VBHN-BYT (tri thức tổng)](./Huan_luyen_phien_DVKT_VBHN17_Cursor.md) | Khung Điều 1–4d, DM1–3; rule ví dụ `DVKT_*`, `CDHA_*` | `dvkt_op_giam_dinh.jsx` (`VBHN_17_META`); `dong_co_giam_dinh.jsx` (`CO_SO_PHAP_LY_DVKT`, `VAN_BAN_HANH_CHINH_HIEN_HANH.VBHN_17`); `luat_cdha_hardcoded.jsx` | [The_tri_thuc_giam_dinh_DVKT_VBHN_17_BYT.md](./The_tri_thuc_giam_dinh_DVKT_VBHN_17_BYT.md); [The_tri_thuc_mau_luat_BHYT_2008_2025.md](./The_tri_thuc_mau_luat_BHYT_2008_2025.md) §11.5 | *(Không bắt buộc một ca — dùng mục F handoff QA)* |
| [Ca 000308 — Gói PT + ICD + thuốc tê/mê](./Ca_huan_luyen_mau_000308_DVKT_2587_2588_PTTT_goi_thuoc.md) | `DVKT_2587`, `DVKT_2588` | `ma_nguon/tien_ich/du_lieu_luat_pttt_muc11.jsx`; luồng XML3 + XML1 + XML2 trong `dong_co_giam_dinh.jsx` | Cùng thẻ DVKT §3.1 điểm b (PTTT), §3.4–4a (gói / không thu trùng) | `test_xml/audit_000308_20260405_083942.json` |
| [Ca 000502 — MRI, chờ >3 ngày nội trú](./Ca_huan_luyen_mau_000502_CDHA_164_MRI_noitru.md) | `CDHA_164` | `ma_nguon/tien_ich/luat_cdha_hardcoded.jsx` (`CDHA-164`); meta `CDHA_HARDCODED` trong `dong_co_giam_dinh.jsx` | Thẻ DVKT §3.7–4c (ngày điều trị / thời điểm DV); nhãn **quản trị/TAT** trong text cảnh báo | `test_xml/audit_000502_20260404_192348.json` |
| [Ca 000538 — MA_MAY “rác”, X-quang](./Ca_huan_luyen_mau_000538_CDHA_101_ma_may_XQ.md) | `CDHA_101` | `luat_cdha_hardcoded.jsx` (`CDHA-101`) | Chất lượng dữ liệu M06/thiết bị gắn XML3; liên quan giám định **mã máy** theo TT 12 / QĐ 130 (đối chiếu hướng dẫn BHXH) | `test_xml/audit_000538_20260404_221726.json` |
| [Ca 000375 — DVKT-OP-09 danh mục nội bộ](./Ca_huan_luyen_mau_000375_DVKT_OP_09_danh_muc_noibo.md) | `DVKT-OP-09` (`CHECK_INTERNAL_APPROVAL`) | `dvkt_op_giam_dinh.jsx`; `dong_co_giam_dinh.jsx` → `DVKT_OP` | Điều 3 VBHN (điều kiện CS + DM); thẻ [The_tri_thuc_giam_dinh_DVKT_VBHN_17_BYT.md](./The_tri_thuc_giam_dinh_DVKT_VBHN_17_BYT.md) §3.3 | `test_xml/audit_000375_20260405_065828.json` |

### Phân biệt nguồn rule (tóm tắt cho AI)

| Tiền tố / nhóm | Nguồn trong repo | Ghi chú huấn luyện |
|----------------|------------------|--------------------|
| `DVKT_*` (nhiều mã số) | Thường **seed PTTT mức 11** `du_lieu_luat_pttt_muc11.jsx` + pipeline `dong_co_giam_dinh.jsx` | Gói PT, ICD, thuốc kèm gói — **không** đồng nhất với toàn bộ “VBHN 17” đã mã hóa |
| `CDHA_*` | **`luat_cdha_hardcoded.jsx`** | CĐHA/XN/chất lượng tên–mã–máy; một số mang tính **JCI / nội bộ BV** |
| `DVKT-OP-*` | **`dvkt_op_giam_dinh.jsx`** (`DEFAULT_DVKT_RULES`, operator) | Toán tử **cố định trong mã** + dữ liệu nền AsyncStorage/Firebase; khác mã `DVKT_xxxx` (seed PTTT); `ma_luat` audit: `DVKT-OP-xx` |

**Quy tắc soạn phiên mới:** thêm một dòng vào bảng trên; ưu tiên có **audit JSON** trong `test_xml/` hoặc `test_xml/huan_luyen/` để lặp lại được.

**QA:** Cùng bộ lệnh repo (`npm run qa:audit-fixtures`, `npm run qa:on-off-match`) sau khi chỉnh seed DVKT/PTTT — xem [Huan_luyen_phien_DVKT_VBHN17_Cursor.md](./Huan_luyen_phien_DVKT_VBHN17_Cursor.md) mục F.

**Liên kết bảng thuốc:** [Bang_neo_phien_huan_luyen_thuoc_va_engine.md](./Bang_neo_phien_huan_luyen_thuoc_va_engine.md)
