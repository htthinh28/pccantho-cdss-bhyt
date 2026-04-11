# GÓI DỮ LIỆU HUẤN LUYỆN AI — THỰC CHIẾN (CDSS BHYT)

Phiên bản: 1.0 · Cập nhật: 10/04/2026  

Tài liệu này **gom kiến thức đã chuẩn hóa trong repo** và **kho tri thức tích lũy trên máy** thành một khung làm việc cho AI khi phân tích hồ sơ, rule và ca bệnh — không thay thế người có thẩm quyền.

---

## 1. Hai tầng “kho huấn luyện”

| Tầng | Vị trí | Nội dung điển hình | Cách lấy cho AI |
|------|--------|-------------------|-----------------|
| **Kho tĩnh (repo)** | Thư mục `tai_lieu/` — `Ca_huan_luyen_mau_*.md`, `Bang_neo_*.md`, `Huan_luyen_phien_*.md`, `The_tri_thuc_*.md`, `Chuan_hoa_kien_thuc_*.md`, v.v. | Ca mẫu có MA_LK/rule, bảng neo phiên ↔ engine, thẻ tri thức VBHN/thuốc/DVKT/phác đồ | Đọc trực tiếp file; dùng **`tai_lieu/_index_kho_huan_luyen_AI.json`** (sinh bởi script, xem mục 4): **toàn bộ** `.md` trong `tai_lieu/` được liệt kê và gán `category` theo tiền tố; tên không khớp mẫu → `khac`. |
| **XML thực (GIAMDINHHS)** | Thư mục **`tai_nguyen/`** — file `.xml` claim / hồ sơ giám định (XML1… trong Base64) | Huấn luyện đọc đúng cấu trúc thật, neo `MA_LK` với ca mẫu | **`npm run tai_lieu:index-tai-nguyen`** → `tai_lieu/_index_tai_nguyen_xml.json` (đường dẫn + `ma_lk`). Chi tiết: [Huong_dan_tai_nguyen_XML_thuc_chien_AI.md](./Huong_dan_tai_nguyen_XML_thuc_chien_AI.md). |
| **Kho động (thiết bị)** | AsyncStorage key **`CDSS_TRI_THUC_GD_V1`** (tối đa 500 bản ghi) | Bài học tự soạn + **xác nhận Đúng/Sai** từng cảnh báo tại màn **Chi tiết ca bệnh** | Màn **🧠 Tri thức từ giám định** → **Copy / chia sẻ Markdown** — dán vào file trong `tai_lieu/` hoặc đưa vào phiên RAG ngoài repo. |

**Tri thức runtime** được đóng gói trong `ma_nguon/tien_ich/tri_thuc_tu_giam_dinh.jsx`: hàm `xuatTriThucRaMarkdown`, `dongGoiPhanHoiXacNhanCanhBao`, `goiYTomTatTuKetQuaGiamDinh`.

---

## 2. Cấu trúc bản ghi `CDSS_TRI_THUC_GD_V1` (cho AI / tích hợp)

Mỗi phần tử trong mảng lưu trữ gồm các trường chính:

| Trường | Ý nghĩa |
|--------|---------|
| `id` | Định danh duy nhất |
| `ma_lk`, `ma_bn`, `ho_ten` | Neo ca bệnh |
| `ngay_tao` | ISO 8601 |
| `tom_tat` | Một dòng mô tả (≤ 500 ký tự) |
| `bai_hoc` | Văn bản bài học / kết luận (≤ 12000 ký tự) |
| `loai_ghi` | `BAI_HOC` hoặc `XAC_NHAN_CANH_BAO` |
| `phan_hoi_canh_bao_json` | Chuỗi JSON: `muc[]` với `ma_luat`, `phan_he`, `ket_luan` (ĐÚNG/SAI), `canh_bao_rut_gon`, `ghi_chu` |
| `ma_luat_goi_y`, `snapshot_loi` | Gợi ý rule và snapshot cảnh báo rút gọn |

Khi huấn luyện AI “thực chiến”, ưu tiên các bản **`XAC_NHAN_CANH_BAO`** vì có nhãn đúng/sai gắn mã luật.

---

## 3. Kho tĩnh — lộ trình đọc gợi ý (đã học trong dự án)

1. **Khung tổng:** [Lo_trinh_huan_luyen_AI_giam_dinh_BHYT.md](./Lo_trinh_huan_luyen_AI_giam_dinh_BHYT.md) §5–6 (3 loại dữ liệu huấn luyện).  
2. **Kỹ năng cốt lõi:** [Ky_nang_cot_loi_giam_dinh_AI_BHYT.md](./Ky_nang_cot_loi_giam_dinh_AI_BHYT.md).  
3. **Hệ thống:** [Dac_ta_he_thong_CDSS_BHYT_20260405.md](./Dac_ta_he_thong_CDSS_BHYT_20260405.md).  
4. **DVKT (VBHN 17):** [The_tri_thuc_Danh_muc_1_DVKT_dieu_kien_ty_le_gia_VBHN17_AI.md](./The_tri_thuc_Danh_muc_1_DVKT_dieu_kien_ty_le_gia_VBHN17_AI.md), [The_tri_thuc_Danh_muc_2_DVKT_dieu_kien_thanh_toan_VBHN17_AI.md](./The_tri_thuc_Danh_muc_2_DVKT_dieu_kien_thanh_toan_VBHN17_AI.md).  
5. **Phác đồ CDSS ↔ ICD-10:** [The_tri_thuc_phac_do_CDSS_chuyen_mon_ICD10_AI.md](./The_tri_thuc_phac_do_CDSS_chuyen_mon_ICD10_AI.md).  
5b. **Báo cáo vi phạm + hồ sơ `ip` + phác đồ (thực chiến):** [Huong_dan_huan_luyen_audit_thuc_chien_va_phac_do_CDSS.md](./Huong_dan_huan_luyen_audit_thuc_chien_va_phac_do_CDSS.md) — script `npm run huan-luyen:merge-audit-ip`.  
6. **Ca mẫu:** toàn bộ `Ca_huan_luyen_mau_*.md` — mỗi file một kịch bản (thuốc, DVKT, CDHA, hành chính…).  
7. **Neo phiên ↔ engine:** `Bang_neo_phien_huan_luyen_*_va_engine.md`.

---

## 4. File chỉ mục tự động

Chạy tại thư mục gốc repo:

```bash
node scripts/build_huan_luyen_index.mjs
```

Sinh **`tai_lieu/_index_kho_huan_luyen_AI.json`**: danh sách file `.md` khớp tiền tố (ca mẫu, bảng neo, thẻ tri thức, v.v.), kèm `category`, dung lượng, `mtime`.

Sau đó nên chạy `npm run tai_lieu:prepare` nếu cần đồng bộ `public/tai_lieu/` cho bản web.

---

## 5. Prompt mẫu — dùng ngay với AI thực chiến

- *“Đọc `tai_lieu/_index_kho_huan_luyen_AI.json`, chọn **một** file `Ca_huan_luyen_mau_*` cùng nhóm rule với `MA_LUAT` …, rồi áp dụng logic đó cho đoạn XML sau.”*  
- *“Kết hợp [The_tri_thuc_Danh_muc_1…] với cảnh báo engine sau; nêu **ba** điểm cần kiểm chứng trên XML3/XML1 trước khi kết luận thanh toán.”*  
- *“Dựa trên đoạn Markdown xuất từ Tri thức từ giám định (có `ket_luan` ĐÚNG/SAI), tóm tắt **một** bài học có thể đưa vào seed luật hoặc checklist.”*  
- *“Phân biệt lớp **phác đồ CDSS** (ICD, chuyên môn) với lớp **DM1 DVKT** (tỷ lệ/giá) cho cùng hồ sơ — không gộp hai luận điểm.”*

---

## 6. Liên kết nhanh

- Quy trình prompt: [Quy_trinh_prompt_huan_luyen_AI_BHYT.md](./Quy_trinh_prompt_huan_luyen_AI_BHYT.md)  
- Hướng dẫn dùng AI trong repo: [Huong_dan_dung_AI_CDSS_BHYT.md](./Huong_dan_dung_AI_CDSS_BHYT.md)  
- Bài tập kỹ năng: [Bai_tap_phat_trien_ky_nang_giam_dinh_AI.md](./Bai_tap_phat_trien_ky_nang_giam_dinh_AI.md)

---

*Gói này cố định **cách lấy và xếp lớp** dữ liệu huấn luyện; nội dung pháp lý và số liệu cụ thể luôn lấy từ văn bản gốc và hồ sơ thật.*
