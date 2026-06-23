# THẺ TRI THỨC: QUY ĐỊNH CHỤP CẮT LỚP VI TÍNH (CLVT) — BV QUỐC TẾ PHƯƠNG CHÂU CẦN THƠ (2025) — PHỤC VỤ KIỂM TRA / AI

Phiên bản: 1.0  
Ngày nhập kho tri thức: 10/04/2026  

## 1. Nguồn và phạm vi

- **Văn bản:** *Quyết định* ban hành *Quy định chụp cắt lớp vi tính tại Bệnh viện Quốc tế Phương Châu Cần Thơ* — Cần Thơ, **ngày 03 tháng 10 năm 2025** (số hiệu trên bản gốc: `/QĐ.BVPCST.2025`; điền đủ khi trích dẫn hành chính).
- **Căn cứ pháp lý nêu trong văn bản:** Thông tư **35/2016/TT-BYT** (danh mục, tỷ lệ, điều kiện TT DVKT BHYT); Quyết định **2775/QĐ-BYT ngày 29/08/2025** — tài liệu chuyên môn *Hướng dẫn quy trình kỹ thuật chẩn đoán hình ảnh — Điện quang, Tập 1*.
- **Neo danh mục BHYT:** **Điều 1** quy định áp dụng chụp CLVT **từ 1–32 dãy** theo **Khoản 3 Danh mục 1** TT 35/2016/TT-BYT tại đơn vị.

**Phạm vi thẻ:** Hỗ trợ **kiểm tra nội bộ / AI** đối chiếu **chỉ định — chẩn đoán — chứng từ hội chẩn**; **không** thay thế văn bản gốc, **không** tự suy ra mức giá BHYT nếu không có trong hồ sơ.

---

## 2. Điều 2 — Hiệu lực (trích ý)

- Quyết định có hiệu lực **từ ngày ký**, ban hành kèm quy định đính kèm (bảng **STT / Tên quy trình / Chỉ định**).

---

## 3. Điều 3 — Trách nhiệm và hội chẩn (trích nguyên văn ý chính)

- Bác sĩ các khoa lâm sàng, Phòng chẩn đoán hình ảnh và các đơn vị liên quan **chịu trách nhiệm thi hành** Quyết định.
- **Nguyên văn:** *«Những trường hợp bệnh khó phải hội chẩn với Ban giám đốc Bệnh viện để xin ý kiến giải quyết.»*

### 3.1. Quy tắc bổ sung cho kiểm tra (do đơn vị chỉ đạo — ăn khớp nghiệp vụ)

Khi **chỉ định CLVT không phù hợp** với **chẩn đoán** hoặc **không nằm trong phạm vi chỉ định** tương ứng **tên quy trình / chỉ định** trong bảng đính kèm (và căn cứ TT 35 — Danh mục 1), hồ sơ cần có **biên bản hội chẩn** (hoặc văn bản tương đương theo quy chế khoa/BV) **để chứng minh chỉ định hợp lý** hoặc được **thống nhất nội bộ**.

- Trường hợp **bệnh khó** theo **Điều 3** — áp dụng **hội chẩn với Ban Giám đốc** xin ý kiến như văn bản.

---

## 4. Bảng chỉ định (54 quy trình) — cách tra trong repo

Toàn bộ danh sách **STT 1–54** (*Tên quy trình* + *Chỉ định* chi tiết) đã được trích văn bản thuần từ file gốc và lưu tại:

- `tai_lieu/Phu_luc_QD_CLVT_BVPCST_2025_plain.txt`

**Cách dùng khi kiểm tra:** Xác định **mã DV / tên CLS** trên XML3 → tìm dòng tương ứng trong file → đối chiếu **chẩn đoán ICD / lâm sàng** với **gạch đầu dòng chỉ định** của quy trình đó.

---

## 5. Neo dữ liệu XML / hồ sơ

| Nội dung | Gợi ý trường / tài liệu |
|----------|-------------------------|
| Mã DV | `MA_DICH_VU`, `TEN_DICH_VU` (XML3) |
| Chẩn đoán | `MA_BENH_CHINH`, `CHAN_DOAN`, ICD kèm (XML1); `MA_BENH` trên dòng DV nếu có (XML3) |
| Chứng từ hội chẩn | Thường **ngoài XML** (biên bản, phiếu hội chẩn scan) — kiểm tra chủ động khi lệch chỉ định |
| Pháp lý BHYT tổng quát | [The_tri_thuc_giam_dinh_DVKT_VBHN_17_BYT.md](./The_tri_thuc_giam_dinh_DVKT_VBHN_17_BYT.md), [The_tri_thuc_Danh_muc_1_DVKT_dieu_kien_ty_le_gia_VBHN17_AI.md](./The_tri_thuc_Danh_muc_1_DVKT_dieu_kien_ty_le_gia_VBHN17_AI.md) |

---

## 6. Prompt mẫu cho AI

- *«Với mã DV … và ICD …, quy trình CLVT nào trong Phụ lục QĐ BVPCST 2025 là tương ứng? Chỉ định lâm sàng có nằm trong gạch đầu dòng không? Nếu không — cần loại chứng từ nào (biên bản hội chẩn / hội chẩn Ban GĐ)?»*

---

*Thẻ này nhập từ bản `.docx` do người dùng cung cấp; khi trích dẫn chính thức dùng bản có **số ký hiệu đầy đủ** và dấu đỏ đơn vị.*
