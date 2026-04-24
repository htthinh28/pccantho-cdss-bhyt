# Chuẩn hóa kiến thức giám định vật tư y tế (VTYT) cho AI

**Phiên bản:** 1.2  
**Ngày:** 09/04/2026  
**Vai trò:** Tài liệu **điểm vào** để AI suy luận **thống nhất** về VTYT trong repo — **bổ sung** [The_tri_thuc_mau_luat_BHYT_2008_2025.md](./The_tri_thuc_mau_luat_BHYT_2008_2025.md) mục **11.6**, **14/VBHN-BYT 2025**, Phụ lục BYT và hợp đồng KCB; **không** thay thế văn bản gốc.

---

## 0. Hiện trạng triển khai: **không có** bộ dữ liệu / rule seed **thanh toán VTYT** đầy đủ trong repo

**Xác nhận kỹ thuật:** Trong `ma_nguon/`, **không** có bảng luật động (kiểu `du_lieu_luat_*.jsx`) nào sinh ra cảnh báo với tiền tố **`DM-VTYT-`** — chỉ có **ánh xạ căn cứ pháp lý** khi *có* `ma_luat` bắt đầu bằng `DM-VTYT-` trong `dong_co_giam_dinh.jsx` (`CO_SO_PHAP_LY_THEO_PREFIX_MA_LUAT`). Nghĩa là **CSDL giám định tự động theo từng mã vật tư / từng điều kiện VBHN 14** **chưa được nạp** như nhánh `DVKT_*` hay `THUOC_*`.

**Hệ quả cho AI:**

- **Không** giả định “engine đã tra Phụ lục VTYT giống thuốc/DVKT” — tra cứu **điều kiện thanh toán** theo văn bản **11.6 / VBHN 14** là việc **người + tài liệu BYT**, không phải output đầy đủ từ rule seed trong repo.  
- Phần **có trong code** liên quan VTYT chủ yếu là: **cấu trúc XML3** (`MA_VAT_TU`, `GOI_VTYT`…), **đối chiếu tổng tiền** (`CLN-CHI-02` / `T_VTYT` — xem §3), **liên kết vật tư với DVKT** trong `dvkt_op_giam_dinh.jsx` (ví dụ khi DVKT đã bao gồm vật tư), và các rule **hardcoded / chuyên đề / CDHA** có chữ “VTYT” — mỗi nhóm cần đọc **trạng thái ON/OFF** và **điều kiện** riêng.  
- **Danh mục PL8 / `DM_VTYT`** trong luồng load BYT 7603 **không** đồng nghĩa đã có **tập rule giám định VTYT** tương ứng trong seed.  
- **Lộ trình khi bổ sung CSDL:** [Huan_luyen_phien_VTYT_du_phong_Cursor.md](./Huan_luyen_phien_VTYT_du_phong_Cursor.md) mục **4.2**.

---

## 1. Mục tiêu chuẩn hóa

- Neo cảnh báo / giải thích với **`VAN_BAN_HANH_CHINH_HIEN_HANH.VBHN_VTYT`** và **`CO_SO_PHAP_LY_VTYT`** trong `ma_nguon/tien_ich/dong_co_giam_dinh.jsx` (cùng chuỗi NĐ 188, QĐ 3618, TT 12/2026 Điều 10 như DVKT/thuốc khi gắn `co_so_phap_ly`).
- Phân tầng: điều kiện **tra được trên XML/mã** (QĐ 130, XML3 `MA_VAT_TU`, `TYLE_TT`…) vs **chủ động / hồ sơ giấy** (hợp lý lâm sàng, thầu, kho).
- Tránh nhầm **ba nhóm** trong thực tế engine: (1) dòng **chỉ có `MA_VAT_TU`** trên XML3 — VTYT theo TT 04 / VBHN 14; (2) **DVKT** (`MA_DICH_VU`) có **ghi chú danh mục** “đã/không kết cấu vật tư” — xử lý trong `dvkt_op_giam_dinh.jsx` (toán tử liên quan vật tư); (3) rule **chuyên đề / JCI** trong `luat_giam_dinh_chuyen_de_hardcoded.jsx` — nhiều mệnh đề mang tính **minh họa nghiệp vụ**, không đồng nghĩa mọi điều kiện đã được nối đủ biến XML trong một lần chạy.

---

## 2. Nguyên tắc vàng (P1–P5)

| # | Nguyên tắc | Hệ quả cho AI |
|---|------------|----------------|
| **P1** | **Thời điểm áp danh mục** — VBHN 14 (2025) thay thế cách đọc VBHN 06 (2018) cho hồ sơ **mới**; hồ sơ cũ có thể cần **mốc thời điểm** | Trước khi chốt điều kiện thanh toán, hỏi: **ngày vào / ngày ra / ngày y lệnh** thuộc khung nào. |
| **P2** | **Danh mục + cột điều kiện** (TT 04 gốc; bảng trong VBHN 14) | Có `MA_VAT_TU` **chưa đủ** — cần **dòng điều kiện** (chỉ định, tuyến, đối tượng, ghi chú…) đúng Phụ lục **tại thời điểm**. |
| **P3** | **Engine ⊂ toàn bộ Phụ lục** — và trong repo **chưa có** seed `DM-VTYT-*` | Không có “một phần” để mở rộng: **hiện không có** luật động VTYT trong CSDL; mọi áp dụng VBHN 14 chi tiết là **ngoài engine** (xem **§0**). |
| **P4** | **Không thu trùng** với DVKT / ngày giường / công khám khi đã **kết cấu giá** | Khi đồng thời có DVKT và dòng `MA_VAT_TU`, hỏi: vật tư đã nằm trong **giá gói DVKT** hoặc **công khám** chưa? (Tinh thần **Điều 4a TT 39/2024** sửa TT 35 — đã neo ở mục 11.5–11.6 mau_luat; trong code: `checkGhiChu` / liên kết `MA_VAT_TU` với dòng DVKT trong `dvkt_op_giam_dinh.jsx`). |
| **P5** | **Kết luận pháp lý cuối** thuộc cơ quan có thẩm quyền / BHXH | AI chỉ **hỗ trợ** đối chiếu dữ liệu và chỉ ra **căn cứ tra được**. |

---

## 3. Cạm bẫy tên trường trong **dự án này** (bắt buộc đọc trước khi giải thích “T_VTYT”)

Trong `dong_co_giam_dinh.jsx`, hàm `giamDinhTongChiPhi`:

- **`XML1.T_VTYT`** được đối chiếu với **tổng `THANH_TIEN_BV` của toàn bộ dòng XML3** (comment mã nguồn: *“T_VTYT trong schema QĐ130 của dự án này bao gồm toàn bộ chi phí DVKT (XML3)”* — không có `T_DVKT` riêng). Cảnh báo built-in: `CLN-CHI-02` (*Đối chiếu T_VTYT với tổng XML3 (DVKT)*).
- **Khác** với cách đọc từ “vật tư” trong luật: **một dòng XML3 có `MA_VAT_TU`** mới là **VTYT** theo nghiệp vụ danh mục TT 04; tổng tiền **chỉ các dòng có vật tư** có thể được rule khác so trong `du_lieu_luat_du_lieu_muc1.jsx` (ví dụ lệch `T_VTYT` với tổng dòng có `MA_VAT_TU`).

**Hệ quả cho AI:** Khi thấy `truong_loi: 'T_VTYT'` hoặc `ma_luat: 'CLN-CHI-02'`, **không** tự động kết luận “sai vật tư” — đọc **điều kiện** và **nội dung cảnh báo**; có thể đang nói về **lệch tổng DVKT–XML1**, không phải chỉ VTYT.

---

## 4. Ma trận nguồn rule / dữ liệu (tóm tắt)

| Nguồn | Ví dụ / vị trí | Ghi chú |
|--------|----------------|---------|
| **Prefix `DM-VTYT-`** | `CO_SO_PHAP_LY_THEO_PREFIX_MA_LUAT` → `CO_SO_PHAP_LY_VTYT` | **Chỉ** chuẩn bị **căn cứ pháp lý** nếu sau này có rule mang tiền tố này — **hiện không có** rule seed tương ứng trong repo (**§0**). |
| **Danh mục hệ thống** | `DM_VTYT`, `PL8_VTYT` (BYT 7603 PL8), `MAP_VTYT_BV` | Load trong `dong_co_giam_dinh.jsx`; **không** đồng nghĩa đã có **tập quy tắc giám định thanh toán VTYT** trong seed. |
| **XML3 (QĐ 130)** | `MA_VAT_TU`, `TEN_VAT_TU`, `GOI_VTYT`, `TYLE_TT` / `TYLE_TT_BH`, `DON_GIA`, `TT_THAU`, `MA_HIEU_SP`… | Schema: `ma_nguon/quy_tac/quyluat_cautrucdulieu/xml3.jsx`. |
| **Nhận dòng VTYT cho engine DVKT no-code** | `extractVtytLines` trong `dvkt_op_giam_dinh.jsx` | Dùng cho kiểm tra **vật tư đi kèm / trùng gói** với DVKT (ví dụ `checkGhiChu`). |
| **Công khám / giường / XML5** | `CK_15` (vật tư thay thế — XML5 `MA_VTYT`), `GB_35` (ICU + VTYT) | Hardcoded; điều kiện theo từng file luật. |
| **Chuyên đề** | `Chuyen_de_126`, `281`, `206`… — `loai_dv == 'VTYT'` | Thư viện **mẫu** nghiệp vụ; tra `TRANG_THAI` và luồng gọi thực tế trước khi coi là “đang chạy trên mọi hồ sơ”. |

---

## 5. Quy trình suy luận gợi ý (7 bước)

1. **Xác định đối tượng:** Dòng XML3 có **`MA_VAT_TU`** (và/hoặc `GOI_VTYT`) hay chỉ **`MA_DICH_VU`**?  
2. **Thời điểm:** Ngày KCB có thuộc khung **VBHN 14** không; có chỉ đạo **tạm thời / vùng** không (nếu có tài liệu đơn vị).  
3. **Điều kiện Phụ lục:** Tỷ lệ, chỉ định, giới hạn số lượng — **không** bịa cột nếu không có bảng.  
4. **Kết cấu với DVKT / PTTT:** Có **ghi chú** “đã bao gồm / không thanh toán riêng” trên danh mục DVKT hoặc vật tư tương ứng không?  
5. **Giá và thầu:** `DON_GIA`, `TT_THAU`, `MA_HIEU_SP` so với danh mục nội bộ / trúng thầu (khi rule hoặc quy trình BV yêu cầu).  
6. **Đối chiếu tổng XML1:** Nếu liên quan `T_VTYT` / `CLN-CHI-02` — áp dụng **§3** tài liệu này (nghĩa **kỹ thuật dự án**).  
7. **Ghi nhận giới hạn:** Rule **OFF**, thiếu seed, hoặc chuyên đề **chưa** gắn đủ XML → nêu rõ **không suy diễn** kết luận thanh toán.

---

## 6. Checklist trước khi AI “chốt” ý

- [ ] Đã phân biệt **VTYT danh mục TT 04** vs **trường `T_VTYT` XML1** (nghĩa tổng trong code)?  
- [ ] Đã kiểm tra **cùng dòng / cùng thời điểm** với DVKT khi có `MA_DICH_VU` + `MA_VAT_TU` liên quan?  
- [ ] `co_so_phap_ly` (nếu có) có trỏ **VBHN VTYT** hoặc prefix **`DM-VTYT-`** đúng bảng `dong_co_giam_dinh.jsx`?  
- [ ] Không bịa **%**, **giá trần**, **điều kiện dòng Phụ lục** khi không có trong hồ sơ hoặc seed?  
- [ ] Đã nhớ **§0**: repo **không** có bộ rule VTYT đầy đủ trong CSDL — không mô tả như thể đã tra được từ engine?

---

## 7. Liên kết trong repo

| Tài liệu | Nội dung |
|----------|----------|
| [The_tri_thuc_mau_luat_BHYT_2008_2025.md](./The_tri_thuc_mau_luat_BHYT_2008_2025.md) §**11.6** | Chuỗi pháp lý + VBHN 14 + TT 04 + VBHN 06 |
| [Ky_nang_cot_loi_giam_dinh_AI_BHYT.md](./Ky_nang_cot_loi_giam_dinh_AI_BHYT.md) | Phân lớp A–D, an toàn dữ liệu |
| [The_tri_thuc_mau_thanh_toan_thuoc_BHYT.md](./The_tri_thuc_mau_thanh_toan_thuoc_BHYT.md) | Cách đọc **cột điều kiện danh mục** (tinh thần tương tự VTYT) |
| [Huan_luyen_phien_VTYT_du_phong_Cursor.md](./Huan_luyen_phien_VTYT_du_phong_Cursor.md) | Trạng thái fixture, việc cần làm khi có audit |
| [Bang_neo_phien_huan_luyen_vtyt_va_engine.md](./Bang_neo_phien_huan_luyen_vtyt_va_engine.md) | Neo mã ↔ tri thức (VTYT + nhánh liên quan hiện có) |
| [Chuan_hoa_kien_thuc_AI_giam_dinh_DVKT.md](./Chuan_hoa_kien_thuc_AI_giam_dinh_DVKT.md) | Gói DVKT — **kết cấu vật tư** trùng / không trùng |

**Mã nguồn tham chiếu nhanh:** `dong_co_giam_dinh.jsx` (`VBHN_VTYT`, `CO_SO_PHAP_LY_VTYT`, `giamDinhTongChiPhi`); `dvkt_op_giam_dinh.jsx` (`extractVtytLines`, `checkGhiChu`); `du_lieu_luat_du_lieu_muc1.jsx` (`XML_54`); `quyluat_cautrucdulieu/xml3.jsx`.

---

*Tài liệu này cập nhật khi đổi **nghĩa trường XML1**, khi **bổ sung seed `DM-VTYT-*` thật** trong repo, hoặc khi có fixture audit VTYT trong `test_xml/`.*
