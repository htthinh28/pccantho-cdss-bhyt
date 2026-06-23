# Hợp đồng khám chữa bệnh BHYT — BV Quốc tế Phương Châu (mẫu tham chiếu 2026)

Thẻ tri thức này neo **hợp đồng KCB BHYT** (bản ký với BHXH cơ sở) như một lớp pháp lý bổ sung cho Luật BHYT / NĐ 188: quyền và nghĩa vụ cụ thể của **Bên A (BHXH)** và **Bên B (CSKCB)**, thời hạn hợp đồng, phương thức thanh toán và ràng buộc **dữ liệu điện tử**.

## Nguồn gốc văn bản

- **File gốc (ngoài repo, Google Drive):**  
  `c:\Users\admin\Documents\Google Drive\BHYT\03 01 2026  94170 Hop dong BV Phuong chau 2026 .docx`
- **Bản trích chữ thuần (UTF-8, trong repo):**  
  `tai_lieu/_extract_hop_dong_phuong_chau_2026/Hop_dong_plain.txt`
- **Công cụ tái tạo bản trích:**  
  `node scripts/extract_docx_plain.js "<đường_dẫn.docx>" "tai_lieu/_extract_hop_dong_phuong_chau_2026/Hop_dong_plain.txt"`

Khi cập nhật hợp đồng năm sau hoặc đổi CSKCB, chỉ cần trỏ script tới file `.docx` mới và ghi đè hoặc tạo thư mục `_extract_…` tương ứng.

## Nhận diện hợp đồng (bản đã trích)

| Mục | Giá trị (theo văn bản trích) |
|-----|-------------------------------|
| Loại | Hợp đồng khám bệnh, chữa bệnh BHYT năm **2026** |
| Số HĐ | **27/HĐKCB-BHYT** |
| Ngày ký | **29/12/2025**, tại **BHXH cơ sở Phú Lợi** |
| Hiệu lực | **01/01/2026** — **31/12/2026** |
| Bên A | Bảo hiểm xã hội **cơ sở Phú Lợi** (Cần Thơ) |
| Bên B | Chi nhánh Công ty TNHH MTV Phương Châu Cần Thơ — **Bệnh viện Quốc tế Phương Châu Cần Thơ** |
| Mã CSKCB | **`94170`** — mã **MA_CSKCB** chuẩn XML/BHXH cho *Bệnh viện Quốc tế Phương Châu Cần Thơ* (đồng bộ `THONG_TIN_CO_SO`, luật `HD_06`). Bản trích `Hop_dong_plain.txt` có thể ghi **94027**; khi kiểm tra ưu tiên **94170**. |
| GPHĐ | **303/BYT-GPHĐ** ngày **03/12/2025** |
| Phụ lục kèm HĐ | **6 bảng** theo **QĐ 3618/QĐ-BHXH** ngày **12/12/2022** |

Thông tin địa chỉ, TK, MST, người đại diện lấy trực tiếp từ `Hop_dong_plain.txt` khi cần trích dẫn đầy đủ.

## Khối pháp lý “căn cứ” chính trong hợp đồng

Văn bản dẫn chiếu lần lượt: **Bộ luật Dân sự 91/2015**; **Luật BHYT** và các luật sửa đổi (**2024**); **NĐ 188/2025/NĐ-CP**; **NĐ 96/2023/NĐ-CP** (Luật KCB); các **QĐ BHXH** về chức năng cơ sở / thành lập BHXH cơ sở; **Công văn phân cấp ký HĐ** (ví dụ **3748/BHXH-CĐBHYT** ngày **12/12/2025** — phân cấp ký từ **01/01/2026**).

Điều này giúp AI và người đọc hiểu: **hợp đồng KCB** là thỏa thuận cụ thể hóa **NĐ 188** và **Luật BHYT** (Điều 32 tạm ứng/thanh toán, Điều 40–43 quyền trách nhiệm các bên, v.v.).

## Điểm then chốt cho kiểm tra / CDSS

1. **Thanh toán và giá:** Hợp đồng nêu phương thức theo **Điều 39 NĐ 188**; có đoạn thỏa thuận giá theo **NQ 277/NQ-HĐND** (Cần Thơ) và phần **chênh lệch do người bệnh tự chi** so với mức quỹ BHYT thanh toán — cần tách bạch khi giải thích **đồng thanh toán vs viện phí ngoài phạm vi quỹ**.
2. **Thời hạn gửi hồ sơ:** Bên B gửi tổng hợp đề nghị thanh toán **trong 15 ngày đầu tháng**, quyết toán quý **trong 15 ngày đầu quý**, chốt quý 4/năm **chậm nhất 15/01** năm sau (tham chiếu **Điều 32 Luật BHYT**).
3. **Kiểm tra và từ chối:** Bên A được **từ chối thanh toán** chi phí không đúng luật; Bên B chịu trách nhiệm **bảng kê**, **XML ký số**, **xác thực dữ liệu** (NĐ 188, khoản 9 Điều 69, **từ 01/01/2026**).
4. **Dữ liệu điện tử:** Yêu cầu **chuyển dữ liệu đã xác thực**, xử lý **lỗi dữ liệu**, **ký số XML** — liên hệ trực tiếp với luồng **XML1–XML…** và cổng kiểm tra BHXH.
5. **Không thu trùng:** Bên B **không thu thêm** của người bệnh BHYT các chi phí **đã kết cấu trong giá dịch vụ** (điểm i khoản 2 Điều 35 NĐ 188 trong văn bản HĐ).

## Liên hệ với các thẻ tri thức khác

- Nền luật tổng quát: `The_tri_thuc_mau_luat_BHYT_2008_2025.md`
- Kiểm tra chuyên đề / mã từ chối (Công văn 266): `Cong_van_266_TTKS_chuyen_de_loi_giam_dinh_BHXH.md`
- Checklist TT12 / XML: `Checklist_TT12_2026_Dieu10_khoan1_map_XML130.md`

## Lưu ý sử dụng

- Đây là **một hợp đồng cụ thể** (một CSKCB, một BHXH cơ sở, một năm). Các bệnh viện khác có **số HĐ, mã CSKCB, giá và phụ lục** khác; khi tư vấn phải đối chiếu **hợp đồng thực tế** của CSKCB đó.
- Bản `Hop_dong_plain.txt` có thể **không chứa đầy đủ bảng phụ lục** (bảng 1–6) nếu trong Word nằm dạng bảng phức tạp; khi cần chi tiết từng dòng danh mục, mở file `.docx` gốc hoặc bổ sung script trích bảng.
