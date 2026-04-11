# Kiểm soát quy tắc placeholder CHUYEN_DE (XML130)

## Mục đích

Một số quy tắc dùng `CHUYEN_DE_XML130_CHO_XU_LY_SAU` trong `ma_nguon/tien_ich/luat_giam_dinh_chuyen_de_hardcoded.jsx`: biểu thức kỹ thuật **luôn sai** trên hồ sơ có `MA_LK`, để tránh cảnh báo giả từ DSL Excel cũ (`ma_dvkt`, `has_dvkt`, …) không còn đánh giá đúng trên XML130.

Điều này **không** biến quy tắc thành “đã triển khai thực chiến”. Chỉ khi `DIEU_KIEN` được thay bằng biểu thức XML130/handler thật (hoặc nguồn dữ liệu bổ sung) thì mới coi là sẵn sàng vận hành.

## Quy trình bắt buộc

1. **Danh sách định kỳ:** Sau mỗi lần sửa luật CHUYEN_DE, chạy:

   ```bash
   npm run chuyen-de:sync-placeholder-registry
   ```

   File sinh ra: `scripts/chuyen_de_placeholder_registry.json` (danh sách `rule_ids`, `placeholder_count`).

2. **Ý nghĩa vận hành:** Quy tắc còn trong registry **không phát cảnh báo thật** trên XML điển hình (vì điều kiện luôn false). Việc để `TRANG_THAI: 'ON'` chỉ giữ quy tắc trong cấu hình — **không** đồng nghĩa đã giám định được theo nghiệp vụ.

3. **Khuyến nghị sản phẩm:** Với quy tắc chỉ còn placeholder và chưa có lộ trình dữ liệu trong 1–2 sprint, cân nhắc chuyển `TRANG_THAI: 'OFF'` để tránh hiểu nhầm “đã bật là đã chạy”.

4. **Ghi nhận lộ trình:** Khi thay placeholder bằng điều kiện thật, xóa id khỏi danh sách (bằng cách chạy lại script sync sau khi sửa mã nguồn).

## Liên quan

- `tai_lieu/Tri_thuc_AI_CHUYEN_DE_XML130_thuc_chien.md` — phân loại điều kiện, QA (`lint`, `qa:rule-schema`, claim audit), triển khai thực chiến.
- `tai_lieu/Lo_trinh_viet_lai_CHUYEN_DE_theo_XML130.md` — lộ trình theo lô.
- `scripts/chuyen_de_batch_manifest.json` — trạng thái từng lô viết lại.
