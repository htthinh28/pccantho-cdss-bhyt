# Ca huấn luyện mẫu — TRAINHL03: THUOC_418 và CLN-THUOC-04

**Mục đích:** Neo phiên huấn luyện **03** với **audit thật** từ engine (`chayGiamDinhToanDienV15`), có đồng thời **luật seed** `THUOC_418` và **built-in** `CLN-THUOC-04` (cùng bối cảnh “đơn >30 ngày ngoại trú, ICD không thuộc nhóm được kê dài”).

**Dữ liệu (ẩn danh, tổng hợp):**

| Mục | Giá trị |
|-----|---------|
| MA_LK | `TRAINHL03` |
| XML nguồn | `test_xml/huan_luyen/TRAINHL03_OP30.xml` |
| Audit | `test_xml/audit_TRAINHL03_20260408.json` |
| MA_LOAI_KCB | `1` (ngoại trú) |
| MA_BENH_CHINH | `J06` (tránh ICD được phép kê >30 ngày trong danh mục nội bộ) |
| SO_NGAY (XML2) | `35` — **phải khớp** với `LIEU_DUNG` sao cho `enrichXML2Data` **không** ghi đè `SO_NGAY` xuống &lt;30 (ví dụ ghi rõ “trong 35 ngày” trong liều dùng) |

**Kỳ vọng trong audit (focus):**

- `THUOC_419`: 0  
- `THUOC_418`: ≥1  
- `CLN-THUOC-04`: ≥1  

**Ghi chú kỹ thuật:** `npm run qa:claim-audit` nạp seed luật thuốc (`damBaoSeedLuatThuocMuc8`) để bộ luật động `LUAT_THUOC` có trong môi trường Node — xem `scripts/claim_audit_entry.jsx`.

**Neo:** [Huan_luyen_phien_03_THUOC_418_CLN_THUOC_04.md](./Huan_luyen_phien_03_THUOC_418_CLN_THUOC_04.md), [Bang_neo_phien_huan_luyen_thuoc_va_engine.md](./Bang_neo_phien_huan_luyen_thuoc_va_engine.md).
