# Thẻ tri thức — Phân loại vi phạm cấu trúc dữ liệu XML (dashboard QPS)

Phiên bản tài liệu: 1.0  
Ngày cập nhật: 17/04/2026  
Độ tin cậy: cao (bám mã nguồn đang chạy)

## 1. Mục đích

Chuẩn hóa tri thức để AI (và người vận hành) **không nhầm** giữa:

- Cảnh báo **nghiệp vụ / CDSS** (xuất toán, cảnh báo, nhắc nhở theo quy tắc ON/OFF, mã `XML_*` trong engine giám định).
- Báo cáo **vi phạm cấu trúc / định dạng dữ liệu XML** theo lớp kiểm tra QĐ 3176 / QĐ 130 (bảng trường, kiểu dữ liệu, tiền xử lý `STRUCT-*`, mã dạng `XMLn-REQ-…`).

Ứng dụng tách nhóm này thành **`CAU_TRUC_XML`** trên dashboard **Danh mục vi phạm phát hiện (QPS)** và trong **tra cứu lỗi chi tiết**.

## 2. Thẻ XML-QPS-01 — Mệnh đề nghiệp vụ

- Một lỗi được coi là **“Vi phạm cấu trúc XML”** trong thống kê nội bộ khi hàm `laLoiCauTrucDuLieuXml` trong `ma_nguon/tien_ich/thong_ke_loi_dung_chung.jsx` trả về đúng, **trước** khi áp dụng nhánh “xuất toán / VI PHẠM” chung — tránh gộp nhầm lỗi kỹ thuật file vào xuất toán nghiệp vụ.
- Nhãn hiển thị người dùng: **“Vi phạm cấu trúc XML”** (`nhan_loai_hien_thi`).

## 3. Thẻ XML-QPS-02 — Điều kiện nhận diện (kiểm chứng mã)

Áp dụng một trong các điều kiện sau (đủ để phân loại `CAU_TRUC_XML`):

| Điều kiện | Ghi chú |
|-----------|---------|
| Mã luật bắt đầu bằng `STRUCT` (không phân biệt hoa thường ở tiền tố kiểm tra) | Ví dụ tiền xử lý `STRUCT-1` từ `layLỗiCauTrucTienXuLy` trong `dong_co_giam_dinh.jsx` |
| `dieu_kien` chuẩn hóa là **`STATIC`** và tên quy tắc (sau bỏ dấu) chứa **`CAU TRUC XML`** | Khớp `ten_quy_tac` kiểu *Kiểm tra cấu trúc XML theo QĐ3176* trong `kiem_tra_xml.jsx` |
| `dieu_kien` là **`STATIC`** và mã luật khớp mẫu **`XML` + chữ số + `-`** | Ví dụ `XML2-REQ-MA_THUOC`, `XML1-MISSING` — lỗi sinh từ engine kiểm tra cấu trúc |

**Không** dùng mẫu `XML_47` (gạch dưới sau `XML`) làm dấu hiệu duy nhất: đó thường là mã **CDSS**, không phải lớp `STATIC` của `kiem_tra_xml.jsx`.

## 4. Thẻ XML-QPS-03 — Thứ tự ưu tiên và chi phí ước tính

Trong `THU_TU_UU_TIEN_CANH_BAO` (file trên):

- `XUAT_TOAN` = 0 (cao nhất trong nhóm “nghiệp vụ thanh toán nặng”).
- `CAU_TRUC_XML` = 1 (tách riêng, hiển thị sau xuất toán, trước cảnh báo nghiệp vụ).
- `CANH_BAO` = 2, `NHAC_NHO` = 3.

`CAU_TRUC_XML` có mức **chi phí ước tính** riêng trong `tinhChiPhiUocTinhTheoLoi` (giữa mức xuất toán và cảnh báo thông thường).

## 5. Thẻ XML-QPS-04 — Giao diện dashboard

File `ma_nguon/man_hinh/tong_quan.jsx`:

- Hai hàng chip lọc (danh mục QPS và tra cứu chi tiết) có thêm mục **`Vi phạm cấu trúc XML`** (`id: CAU_TRUC_XML`).
- Thẻ màu trong bảng quy tắc: style **`rule_priority_chip_cau_truc_xml`** (tông indigo).
- Bộ lọc dùng trường `loai_hien_thi` đã gán khi `phangHoaDanhSachLoiChiTiet` / `tongHopQuyTacTuDanhSachChiTiet`.

## 6. Nguồn sinh lỗi cấu trúc (để AI truy vết)

- `ma_nguon/tien_ich/kiem_tra_xml.jsx` — kiểm tra bảng XML, trường bắt buộc, kiểu, ngày, v.v.; `dieu_kien: 'STATIC'`, `ten_quy_tac` cố định theo QĐ 3176.
- `ma_nguon/tien_ich/dong_co_giam_dinh.jsx` — `layLỗiCauTrucTienXuLy` gọi `kiemTraDinhDangXML`, chuẩn hóa thành bản ghi cảnh báo với mã `STRUCT-*` khi cần.

## 7. Câu hỏi kiểm tra nhanh cho AI

1. Lỗi này có `dieu_kien` **STATIC** và tên quy tắc “cấu trúc XML” không? → Nếu có, ưu tiên nhóm **Vi phạm cấu trúc XML**, không diễn giải như rule ON/OFF thuần CDSS.
2. Mã có dạng **`XMLn-…`** (gạch ngang) hay **`STRUCT…`** không? → Cùng nhóm cấu trúc.
3. Người dùng hỏi về chip trên dashboard QPS — trả lời đúng **năm** mức lọc: Tất cả, Xuất toán, Vi phạm cấu trúc XML, Cảnh báo, Nhắc nhở.

## 8. Đồng bộ Thư viện (module trong app)

Sau mỗi lần thêm hoặc sửa file trong `tai_lieu/`:

```bash
npm run tai_lieu:prepare
```

Tùy chọn CI / chỉ mục huấn luyện:

```bash
npm run tai_lieu:index-huan-luyen
```

File này có tiền tố `The_tri_thuc_` → được ghi nhận trong `tai_lieu/_index_kho_huan_luyen_AI.json` (nhóm `the_tri_thuc`).

## 9. Liên kết tài liệu liên quan

- Chuyên đề XML130 / quy trình QA: `Tri_thuc_AI_CHUYEN_DE_XML130_thuc_chien.md`
- Lộ trình huấn luyện tổng: `Lo_trinh_huan_luyen_AI_giam_dinh_BHYT.md`
- Mẫu thẻ: `Mau_the_tri_thuc_giam_dinh_BHYT.md`
