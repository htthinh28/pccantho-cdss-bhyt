# Thẻ tri thức: Luận văn chuyên khoa cấp II — chi phí thanh toán BHYT (Sóc Trăng 2018–2019)

Tài liệu tổng hợp nội dung **luận văn chính thức** của **Hồ Tấn Thịnh** để AI và người dùng CDSS tra cứu **bằng chứng thực tiễn giám định / từ chối thanh toán** ở tỉnh (dữ liệu hành chính, giai đoạn 2018–2019). Đây là **nguồn học thuật bổ sung** cho văn bản pháp luật và cho rule engine — **không thay thế** văn bản luật, thông tư hiện hành sau năm 2021 (đặc biệt **Nghị định 188/2025**, **Luật BHYT sửa 2024**).

## Trích dẫn đầy đủ

- **Tác giả:** Hồ Tấn Thịnh  
- **Cơ sở đào tạo:** Trường Đại học Y Dược Cần Thơ (phối hợp Bộ GD&ĐT — Bộ Y tế)  
- **Loại:** Luận văn chuyên khoa cấp II  
- **Chuyên ngành:** Quản lý Y tế (mã 8720801.CK)  
- **Đề tài:** *Nghiên cứu tình hình chi phí thanh toán khám chữa bệnh bảo hiểm y tế tại các bệnh viện công lập tỉnh Sóc Trăng năm 2018 và năm 2019*  
- **Năm bảo vệ / hoàn thành:** 2021 (lời cảm ơn ghi 27/12/2021)  
- **Người hướng dẫn:** TS.BS. Trần Kim Sơn; BS.CKII. Trần Văn Khải  

**File PDF gốc (máy người dùng):**  
`c:\Users\admin\Downloads\1-ban cuoi_File_luan van chinh thuc_BHYT_thinh.pdf`

**Bản trích chữ đầy đủ trong repo (UTF-8, ~132 trang):**  
`tai_lieu/_extract_luan_van_BHYT_thinh/luan_van_full.txt`

**Tái tạo bản trích** (cần `pip install pypdf`):

```bash
python -c "from pathlib import Path; from pypdf import PdfReader; r=PdfReader(r'ĐƯỜNG_DẪN.pdf'); Path('tai_lieu/_extract_luan_van_BHYT_thinh').mkdir(parents=True, exist_ok=True); Path('tai_lieu/_extract_luan_van_BHYT_thinh/luan_van_full.txt').write_text('\n'.join([f'\n--- Page {i+1} ---\n'+(p.extract_text() or '') for i,p in enumerate(r.pages)]), encoding='utf-8')"
```

## Cấu trúc luận văn (mục lục)

1. **Mở đầu** — Bối cảnh BHYT, quỹ, từ chối thanh toán, mục tiêu nghiên cứu (3 mục tiêu: cơ cấu chi phí; tỷ trọng/cơ cấu bị từ chối; nguyên nhân thường gặp).  
2. **Chương 1** — Tổng quan: BHYT, phương thức thanh toán (định suất / theo giá dịch vụ / theo trường hợp bệnh), cơ cấu chi phí, **giám định**, tỷ trọng từ chối, nguyên nhân, tài liệu trong nước và quốc tế.  
3. **Chương 2** — Đối tượng, phương pháp (mô tả, số liệu thứ cấp từ BHXH/CSKCB), đạo đức nghiên cứu.  
4. **Chương 3** — Kết quả: đặc điểm mẫu; cơ cấu chi phí thanh toán; **tỷ trọng và cơ cấu chi phí bị từ chối**; phân tích nguyên nhân.  
5. **Chương 4** — Bàn luận.  
6. **Kết luận & kiến nghị** — Tóm tắt số liệu và đề xuất giảm xuất toán (tập huấn, CNTT, QĐ 4210, tích hợp kiểm tra vào HIS, v.v.).

## Số liệu then chốt (Kết luận luận văn — cần ghi nhận phạm vi thời gian/địa bàn)

### Cơ cấu chi phí thanh toán BHYT (BV công lập, tỉnh Sóc Trăng — kết quả luận văn)

- Tỷ lệ điều trị **nội trú** toàn tỉnh: **11,9%**; ngày điều trị trung bình **5,96** ngày; tỷ lệ BHYT thanh toán trong chi phí KCB **96,1%**.  
- **Thứ tự cơ cấu** (cao → thấp): Thuốc **28,6%**; Giường **24%**; Phẫu thuật – thủ thuật **18,3%**; Xét nghiệm **9,7%**; Chẩn đoán hình ảnh **6,4%**; Công khám **5,7%**; VTYT **5,4%**; Máu và chế phẩm **1,6%**; Vận chuyển **0,04%**.  
- Chi phí bình quân **một lượt** (chung): **0,46** triệu đồng; **nội trú** **2,68** triệu; **ngoại trú** **0,15** triệu.

### Tỷ trọng chi phí bị từ chối thanh toán

- **2018:** **1,68%**; **2019:** **1,53%**; **chung hai năm:** **1,60%**.  
- **Cơ cấu** phần bị từ chối (cao → thấp): PTTT **33%**; Thuốc chưa đúng **18%**; Lỗi **hành chính** **18%**; **Giường** **15%**; Xét nghiệm **8%**; CĐHA **6%**; Khám **2%**; Vận chuyển **0,12%**; VTYT **0,88%**.

### Nguyên nhân từ chối thường gặp (rút từ Kết luận — map tốt với rule giám định)

Luận văn nhóm nguyên nhân theo **chỉ định chưa phù hợp chuyên môn** (tỷ trọng lớn), **giường liên chuyên khoa**, **hành chính** (nhập viện không cần thiết, chấm công, thẻ, trùng hồ sơ), **khám ngoài thời hạn hợp đồng**, **thừa công khám trong thủ thuật**, **vượt định mức bàn khám**, **PTTT** (chênh gây mê/gây tê, chỉ định, định dạng **QĐ 4210**, sai DVKT), **thuốc** (chỉ định, điều kiện TT, giá, đấu thầu, **đã kết cấu trong giá**), **vận chuyển** (chuyển viện sai đối tượng/tuyến), **XN** (chỉ định, trùng giữa hai đợt).

Phần **bàn luận** có ví dụ cụ thể trùng khớp nhiều chủ đề CDSS hiện đại: **TT 35/2016** (điều kiện HbA1c), **tách/ghép XN** (nhuộm soi vs nuôi cấy, H.P với nội soi, XN Phaco, XN lọc máu theo **QĐ 2482**), **XN tính nội suy** (LDL Friedewald, bilirubin gián tiếp), lỗi phần mềm (ví dụ số lượt XN triglyceride bất thường).

## Giá trị cho công tác giám định (cách dùng trong CDSS)

1. **Ưu tiên rủi ro:** Tỷ trọng từ chối theo **nhóm chi phí** giúp thiết kế **dashboard** và thứ tự kiểm tra (PTTT, thuốc, giường, XN).  
2. **Giải thích cho CSKCB:** Dẫn chiếu **nghiên cứu địa phương** khi trao đổi với BV (ngôn ngữ quản lý y tế, có số liệu).  
3. **Đối chiếu chuyên đề / CV 266:** Nhiều cơ chế “tách DVKT”, điều kiện TT, trùng kỹ thuật trong luận văn **cùng hướng** với phụ lục chuyên đề — luận văn là **bằng chứng thực hành** trước khi có bộ mã hóa đầy đủ.  
4. **Hạn chế:** Số liệu **2018–2019**, **tỉnh Sóc Trăng**, chủ yếu **BV công lập**; luật và TT sau 2021 cần lấy từ `The_tri_thuc_mau_luat_BHYT_2008_2025.md` và văn bản mới nhất.

## Liên kết tài liệu trong repo

- Nền pháp lý và lộ trình luật: `The_tri_thuc_mau_luat_BHYT_2008_2025.md`  
- Checklist giám định / XML: `Checklist_TT12_2026_Dieu10_khoan1_map_XML130.md`  
- Chuyên đề BHXH (mã KT/TH): `Cong_van_266_TTKS_chuyen_de_loi_giam_dinh_BHXH.md`  
- Hợp đồng KCB (ví dụ mẫu 2026): `The_tri_thuc_hop_dong_KCB_BHYT_BV_Phuong_Chau_2026.md`

## Tài liệu tham khảo trong luận văn (gợi ý tra cứu thêm)

Luận văn trích dẫn mạng lưới văn bản then chối: **Luật BHYT**, **NĐ 146/2018** (thời điểm đó), **QĐ 1456/QĐ-BHXH** (quy trình giám định), **TT 35/2016**, **TT 39/2018**, **QĐ 4210**, **QĐ 2482**, công văn BHXH về giám định và thanh toán — danh sách đầy đủ ở cuối file trích `luan_van_full.txt`.
