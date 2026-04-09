# Bảng neo — phiên huấn luyện thuốc ↔ engine (repo)

Mục đích: mỗi phiên **luôn** trỏ tới ít nhất một **mã rule**, **file seed/mã**, và **tài liệu chỉ mục** — tránh học tri thức tách khỏi engine.

| Phiên | MA_LUAT / built-in | File seed hoặc mã chính | Thẻ tri thực / chỉ mục engine | Ca mẫu / audit (nếu có) |
|-------|-------------------|-------------------------|------------------------------|-------------------------|
| [02 — THUOC_391](./Huan_luyen_phien_02_THUOC_391_Cursor_OpenClaw.md) | `THUOC_391`, đối chiếu `THUOC_417` | `ma_nguon/tien_ich/du_lieu_luat_thuoc_muc8.jsx` (`SEED_THUOC_391`, `SEED_THUOC_417`); `dong_co_giam_dinh.jsx` (`locCanhBaoDuongTinhGiaTheoNguCanh`, `boSungChiTietCanhBaoGiaiTrinh`) | [The_tri_thuc_chi_muc_giam_dinh_thuoc_engine_AI.md](./The_tri_thuc_chi_muc_giam_dinh_thuoc_engine_AI.md) | [Ca_huan_luyen_mau_000308…](./Ca_huan_luyen_mau_000308_THUOC_391_sai_lech_so_luong_y_lenh.md), [000573…](./Ca_huan_luyen_mau_000573_THUOC_391_Dafodin_giuong_PT.md) |
| [03 — THUOC_418 vs CLN-THUOC-04](./Huan_luyen_phien_03_THUOC_418_CLN_THUOC_04.md) | `THUOC_418` (seed), `CLN-THUOC-04` (built-in) | `du_lieu_luat_thuoc_muc8.jsx` (`SEED_THUOC_418`); `dong_co_giam_dinh.jsx` → `giamDinhThuoc` | Cùng chỉ mục engine §3.1 | [TRAINHL03](./Ca_huan_luyen_mau_TRAINHL03_THUOC_418_CLN_THUOC_04.md), `test_xml/audit_TRAINHL03_20260408.json` |
| [04 — THUOC_419](./Huan_luyen_phien_04_THUOC_419_hang_BV.md) | `THUOC_419` | `du_lieu_luat_thuoc_muc8.jsx` (`SEED_THUOC_419`); evaluator `THUOC_419` trong `dong_co_giam_dinh.jsx`; cột `HANG_BV_MIN` trong danh mục BV | [The_tri_thuc_mau_thanh_toan_thuoc_BHYT.md](./The_tri_thuc_mau_thanh_toan_thuoc_BHYT.md) §3.4–3.5 | [TRAINHL419](./Ca_huan_luyen_mau_TRAINHL419_THUOC_419.md), `test_xml/audit_TRAINHL419_20260408.json` |
| [05 — THUOC_416 vs 417](./Huan_luyen_phien_05_THUOC_416_vs_417_Cursor_OpenClaw.md) | `THUOC_416`, `THUOC_417` | `du_lieu_luat_thuoc_muc8.jsx` (`SEED_THUOC_416`, `SEED_THUOC_417`); `dong_co_giam_dinh.jsx` → `locCanhBaoDuongTinhGiaTheoNguCanh`, `laVuotNguongDoLamTronThuoc` | [The_tri_thuc_chi_muc_giam_dinh_thuoc_engine_AI.md](./The_tri_thuc_chi_muc_giam_dinh_thuoc_engine_AI.md) §4–§5 | [000589 nhiều nhóm thuốc](./Ca_huan_luyen_mau_000589_nhieu_nhom_thuoc_mot_ho_so.md) (`THUOC_417`); *chưa có* ca riêng chỉ `THUOC_416` (enrich đồng nhất CALC/SL từ `LIEU_DUNG`) |

**Quy tắc soạn phiên mới:** thêm một dòng vào bảng trên trước khi coi phiên là “đóng”.

**QA snapshot 10 file:** `npm run qa:audit-fixtures` — danh sách file cố định trong `scripts/qa_audit_fixtures.js`. Các audit `TRAINHL*` là **bổ sung huấn luyện**, không thay thế 10 file đó trừ khi đội chủ động đổi script.
