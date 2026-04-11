# Khung chất lượng giám định DVKT, chuyên đề và VBHN 17

Phiên bản: 1.0  
Ngày: 11/04/2026

## 1. Mục tiêu

- Giảm **dương tính giả** (cảnh báo khi hồ sơ thực tế đúng danh mục / đúng VBHN 17).
- Tránh hiển thị cảnh báo từ quy tắc **không thể đánh giá đúng trên XML130** (thiếu biến, DSL không khớp engine).
- Giữ **một lớp quy tắc** bám **danh mục nội bộ M05/M06** và metadata VBHN 17 (điều kiện tỷ lệ, thanh toán, phân loại PTTT…) nơi đã có ánh xạ rõ ràng trong mã nguồn.

## 2. Ba lớp trong hệ thống (vai trò khác nhau)

| Lớp | Nguồn chính | Đối chiếu thực chiến | Ghi chú |
|-----|-------------|----------------------|---------|
| **A. Engine DVKT no-code** | `rule_engine_dvkt_no_code.jsx`, bảng `CDSS_DATA_LUAT_CDHA`, danh mục `DANH_MUC_DVKT_M05`, thiết bị M06 | Cao — dùng `MA_DICH_VU` / XML3, DM nội bộ | Đây là lớp ưu tiên cho “đúng mã DVKT + đúng điều kiện VBHN”. |
| **B. Seed PTTT mức 11 (`DVKT_*`)** | `du_lieu_luat_pttt_muc11.jsx` | Trung bình–cao nếu `DIEU_KIEN` chỉ dùng biến XML đã chuẩn hóa | Đã **gỡ hàng loạt** quy tắc dạng **Thực hiện - …** kết hợp `COUNT_IF(DS_XML5, …)` vì dễ FP khi XML5 không phản ánh đủ chứng cứ thực hiện. Các nhóm **Chỉ định / Thanh toán / …** vẫn có thể dùng `COUNT_IF(DS_XML5, …)` khi nghiệp vụ và dữ liệu thống nhất. |
| **C. Giám định chuyên đề (`CHUYEN_DE_*`)** | `luat_giam_dinh_chuyen_de_hardcoded.jsx` | Thấp nếu giữ nguyên DSL gốc (`ma_dvkt`, `includes(`, hàm giả lập…) | Nhiều điều kiện **không** tương thích trực tiếp với biến `XML*` trong `dong_co_giam_dinh.jsx`. Phần lớn mã được **mặc định OFF** qua `DANH_SACH_MAU_QUY_TAC_MAC_DINH_OFF` trong `quy_tac_on_off_noi_bo.jsx` để tránh “cảnh báo giả”. Nâng cấp đúng nghĩa = viết lại `DIEU_KIEN` theo `XML3`/`XML1` hoặc operator engine DVKT. |

## 3. Quy tắc vận hành (ban kiểm tra)

1. **Ưu tiên lớp A** khi thêm quy tắc mới về DVKT / thiết bị / phạm vi / giá VBHN 17.
2. **Lớp B**: trước khi thêm rule kiểm tra “có bằng chứng trên XML5”, xác nhận XML nguồn thực tế của BV **luôn** có dòng tương ứng; tránh pattern đã loại bỏ (Thực hiện + đếm XML5 mù).
3. **Lớp C**: không bật hàng loạt; chỉ bật từng mã sau khi đối chiếu một file XML mẫu và xác nhận predicate chạy đúng.
4. **Đối chiếu VBHN 17**: mỗi quy tắc nên có `co_so_phap_ly` / tham chiếu điều khoản; trùng khớp mã DVKT trên **M05 nội bộ**, không dùng mã giả lập (`CHUP_MRI`, …) trong điều kiện engine XML trừ khi đã ánh xạ sang `MA_DICH_VU`.

## 4. Lộ trình CHUYEN_DE → XML130

- Chi tiết lô (8 lô × ~75 mã), checklist và ví dụ: **`tai_lieu/Lo_trinh_viet_lai_CHUYEN_DE_theo_XML130.md`**
- Theo dõi trạng thái: **`scripts/chuyen_de_batch_manifest.json`**
- Hằng số phiên bản trong mã: `CHUYEN_DE_XML130_CONVERSION_VERSION` (`luat_giam_dinh_chuyen_de_hardcoded.jsx`)

## 5. Việc đã làm trong mã (tham chiếu)

- Xóa khỏi seed các quy tắc **Thực hiện -** có `COUNT_IF(DS_XML5` (ví dụ nhóm liên quan TSH, CBC laser, glucose dịch não tủy…); phiên bản seed ghi trong `du_lieu_luat_pttt_muc11.jsx` và lọc cache trong `seed_luat_pttt_muc11.jsx`.
- Script đối chiếu báo lỗi: bỏ nhánh xử lý riêng các mã đã gỡ (ví dụ `DVKT_2335`).

## 6. Checklist nhanh trước khi merge quy tắc DVKT

- [ ] `DIEU_KIEN` chỉ dùng tên cột / bảng mà `prepareData` và `dong_co_giam_dinh` thực sự cung cấp.
- [ ] Không phụ thuộc hàm không tồn tại trong `ctx` (trừ khi đã có `taoBoXuLyRuleDongDacBiet` cho đúng `MA_LUAT`).
- [ ] Đã chạy thử trên ít nhất một XML thật hoặc bộ test nội bộ; số cảnh báo khớp kỳ vọng nghiệp vụ.
- [ ] ON/OFF mặc định phù hợp: quy tắc thử nghiệm → OFF hoặc trong danh sách mặc định OFF.

---

*Tài liệu này là khung quản trị chất lượng; cập nhật khi thay đổi kiến trúc engine hoặc seed lớn.*
