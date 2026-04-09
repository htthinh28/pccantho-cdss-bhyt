# Ca huấn luyện mẫu — TRAINHL419: THUOC_419 (hạng BV vs danh mục thuốc)

**Mục đích:** Neo phiên **04** với audit có mã **`THUOC_419`**, dùng **hạng cơ sở KCB** khai trong XML1 (`CSKCB_HANG_BV`) và **HANG_BV_MIN** trên dòng danh mục thuốc nội bộ (`MAP_THUOC_BV`).

**Dữ liệu (ẩn danh, tổng hợp):**

| Mục | Giá trị |
|-----|---------|
| MA_LK | `TRAINHL419` |
| XML nguồn | `test_xml/huan_luyen/TRAINHL419_hang_BV.xml` |
| Audit | `test_xml/audit_TRAINHL419_20260408.json` |
| MA_THUOC | `40.558` (có `HANG_BV_MIN` trong seed danh mục BV — cột `HANG_BV_MIN`, bản ghi cuối trùng mã trong map) |
| CSKCB_HANG_BV (XML1) | `4` — điều kiện `minHang < hangCskcb` (evaluator đặc biệt trong `dong_co_giam_dinh.jsx`) |

**Kỳ vọng:** `THUOC_419`: ≥1 trong `rule_summary`.

**Pháp lý / nghiệp vụ:** [The_tri_thuc_mau_thanh_toan_thuoc_BHYT.md](./The_tri_thuc_mau_thanh_toan_thuoc_BHYT.md) (Phụ lục I, hạng BV).

**Neo:** [Huan_luyen_phien_04_THUOC_419_hang_BV.md](./Huan_luyen_phien_04_THUOC_419_hang_BV.md).
