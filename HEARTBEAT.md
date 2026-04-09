# Heartbeat — Cursor workspace `ung_dung_cdss_bhyt`

## Trạng thái làm việc chung Cursor ↔ OpenClaw

- **Tài liệu luồng:** `tai_lieu/Phien_lam_viec_chung_Cursor_va_OpenClaw.md` và `tai_lieu/Quy_trinh_lam_viec_Cursor_OpenClaw_AI_giam_dinh_BHYT.md`.
- **Neo phiên huấn luyện thuốc ↔ engine:** `tai_lieu/Bang_neo_phien_huan_luyen_thuoc_va_engine.md` (đã có ca TRAINHL03 / TRAINHL419 + audit).

---

## Giao việc OpenClaw — bảo trì chất lượng huấn luyện (dán khi cần)

```text
Workspace: ung_dung_cdss_bhyt (CDSS giám định BHYT).

Ranh giới: Cursor = sửa mã + chạy npm run qa:*; OpenClaw = tri thức, đối chiếu tài liệu — không giả định đã QA trừ khi có kết quả dán.

Đọc:
1) tai_lieu/Bang_neo_phien_huan_luyen_thuoc_va_engine.md
2) tai_lieu/Vi_du_regression_canh_bao_THUOC_XML_an_danh.md (nếu có)
3) test_xml/audit_TRAINHL03_20260408.json và audit_TRAINHL419_20260408.json (chỉ meta + rule_summary, không PII)

Việc cần làm (tiếng Việt, có heading):

A) Đối chiếu bảng neo với audit TRAINHL*: mã nào đã có snapshot? mục nào còn “chưa có” (ví dụ THUOC_416)?

B) Gợi ý 5 câu hỏi huấn luyện AI: phân biệt THUOC_418 vs CLN-THUOC-04; THUOC_419 vs chỉ nhìn MA_THUOC.

C) Nếu cần: outline cập nhật The_tri_thuc_chi_muc_giam_dinh_thuoc_engine_AI.md (không sửa file trừ khi chủ workspace yêu cầu).

Ràng buộc: không PII; không API key; không sửa file repo trừ khi chủ workspace yêu cầu rõ.
```

---

## Khi không cần làm gì

Nếu không có checklist mới và không có thay đổi tài liệu/QA đáng chú ý: **HEARTBEAT_OK**.
