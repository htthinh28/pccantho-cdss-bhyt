# Tri thức AI & triển khai thực chiến — CHUYEN_DE theo XML130

Phiên bản đồng bộ: `CHUYEN_DE_XML130_CONVERSION_VERSION` trong `ma_nguon/tien_ich/luat_giam_dinh_chuyen_de_hardcoded.jsx` · manifest `scripts/chuyen_de_batch_manifest.json`.

## 0. Trình tự bắt buộc (mọi thay đổi quy tắc CHUYEN_DE)

Thực hiện **theo đúng thứ tự**; bước sau chỉ thực hiện khi bước trước đạt (hoặc đã ghi nhận ngoại lệ có kiểm soát).

| Bước | Nội dung | Công cụ / chứng cứ |
|------|----------|---------------------|
| **1 — Tạo quy tắc** | Sửa `DIEU_KIEN` / `CANH_BAO` trong `luat_giam_dinh_chuyen_de_hardcoded.jsx`; script lô `scripts/patch_chuyen_de_batchN_dieukien.mjs` nếu cần | PR / diff |
| **2 — Kiểm tra** | Đọ lại cú pháp biểu thức; `npm run chuyen-de:sync-placeholder-registry` | `scripts/chuyen_de_placeholder_registry.json` |
| **3 — Audit** | Rà trường XML + schema | `npm run qa:rule-schema` |
| **4 — Kiểm thử** | Hồi quy fixture + một claim XML thật | `npm run qa:audit-fixtures` + `node scripts/run_claim_audit.js <file.xml> --out=...` |
| **5 — Huấn luyện AI** | Cập nhật `tai_lieu/` (mục 5 dưới) + `npm run tai_lieu:prepare` | Thư viện / RAG đồng bộ |
| **6 — Thực chiến** | Staging → đối chiếu tên DV/ICD BV → quyết định ON/OFF theo placeholder | Checklist nghiệp vụ |

## 1. Phân lớp điều kiện (để AI / kỹ thuật không hiểu nhầm)

| Loại | Biểu hiện trong mã | Hành vi trên hồ sơ XML có `MA_LK` | Coi là “thực chiến”? |
|------|-------------------|-----------------------------------|----------------------|
| **A — XML130 / engine** | `XML1.…`, `CURRENT.…`, `COUNT_IF(DS_XML3, …)`, `TO_NUMBER(XML1.TUOI_NAM)` | Có thể **bật cảnh báo** khi khớp từ khóa/ICD | Có — cần rà soát từ khóa `TEN_DICH_VU` theo BV |
| **B — Placeholder** | `DIEU_KIEN: CHUYEN_DE_XML130_CHO_XU_LY_SAU` (= biểu thức luôn sai khi có `MA_LK`) | **Không** phát cảnh báo | **Không** — chỉ giữ cấu trúc quy tắc + CANH_BAO; phải có lộ trình thay bằng A hoặc handler |
| **C — Cần API / đa hồ sơ / phiếu giấy** | Thường đang ở dạng B cho đến khi có nguồn dữ liệu | Không | Thiết kế riêng (OFF hoặc module ngoài XML130) |

Danh sách id loại B được **tự động** hóa: `npm run chuyen-de:sync-placeholder-registry` → `scripts/chuyen_de_placeholder_registry.json`.

## 2. Các lô gần nhất — gợi ý cho AI khi giải thích / huấn luyện

### Lô 6 (376 … 450)

Đa số **loại B**; ví dụ loại **A**: **380, 382, 383, 391, 406, 407, 386, 418, 424, 447** (chi tiết xem lịch sử commit / `patch_chuyen_de_batch6`).

### Lô 7 (451 … 525) — thuốc / XML2 / PHCN / giới tính

- Đa số: **loại B** (`ma_thuoc`, `has_dvkt` ký hiệu Excel, API giả).
- Đã chuyển **loại A** (một phần — vẫn cần đối chiếu tên DV & quy ước `MA_GIOI_TINH` tại BV):
  - **468** — Proetz / hút mũi + không J32/J01/J02 trên XML1.
  - **473** — Khám + nội soi lấy dị vật (`COUNT_IF`).
  - **490** — Tuổi ≥ 16 + từ khóa xoa bóp trẻ bại não.
  - **492** — Xoa bóp liệt VII + điện châm mặt.
  - **500** — `MA_GIOI_TINH == '1'` + từ khóa SA phụ khoa / tử cung / buồng trứng (Nam chỉ định sai).
  - **501** — `MA_GIOI_TINH == '2'` + PSA (Nữ chỉ định sai).
  - **502** — Nam + Beta-hCG + không `C62` trên XML1.
  - **508** — Nội soi dạ dày HP + test hơi thở HP.
  - **509** — Tuổi &gt; 16 + giường nhi (từ khóa).
  - **525** — XQ sọ/mặt (thẳng/nghiêng) + xương chũm (hai nhóm `COUNT_IF`).

**Cảnh báo mapping giới tính:** Repo dùng `String(XML1.MA_GIOI_TINH) == '1'` cho **Nam** và `'2'` cho **Nữ** trong các mã trên; nếu HIS đổi quy ước, phải chỉnh điều kiện và tài liệu huấn luyện.

### Lô 8 (526 … 603) — hành chính / API / đa BN

- Đa số: **loại B** (`check_api_*`, `count_*_cung_thoi`, `ma_khoa_kham`, phiếu giả, XML2 thuốc không có trong `DS_XML2` của luật này).
- Đã chuyển **loại A** (từ khóa `TEN_DICH_VU` / `TEN_VAT_TU` — cần rà BV): **526** (ICU/HSCC không can thiệp nặng), **532** (truyền máu không hòa hợp), **533** (KHX không nẹp/vít trên XML5), **536** (Stapler trùng PT dạ dày), **542** (SA thai 3D/4D + `TYLE_TT`), **543** (cắt polyp không GPB), **548** (soi tươi + nhuộm âm đạo), **551** (Mantoux không nghi lao), **556–557** (tách XN niệu / SA bụng + SA thai), **560** (Na/K/Cl máu tách), **563–564** (Amidan người lớn / CNHH trẻ &lt; 5 tuổi), **571–572** (SA ổ bụng sai ICD / đo thủy tinh + SA mắt).
- Script tái lập: `scripts/patch_chuyen_de_batch8_dieukien.mjs`.

## 3. Quy trình CI / QA (khớp mục 0 — bước 3–4)

```bash
npm run lint
npm run qa:rule-schema
npm run qa:audit-fixtures
node scripts/run_claim_audit.js tai_nguyen/ip/PC022601214_IP26000001.xml --out=test_xml/claim_audit_smoke.xml
```

- **`lint`**: `expo lint` + encoding/font.
- **`qa:rule-schema`**: tham chiếu `XMLn.TRUONG` trong `DIEU_KIEN` so với schema cột QĐ 130 → `test_xml/rule_xml_schema_audit.json`.
- **`qa:audit-fixtures`**: 10 file `test_xml/audit_*.json` — hồi quy MA_LK.
- **Claim audit**: `run_claim_audit.js` **bắt buộc** có đường dẫn XML130; `npm run qa:claim-audit` không truyền file nên chỉ in usage.

Tùy chọn: `npm run qa:xml-real`.

## 4. Huấn luyện AI (RAG / trợ lý)

Sau khi **`npm run tai_lieu:prepare`**, các file trong `tai_lieu/` (gồm tài liệu này) vào Thư viện. Prompt gợi ý cho mô hình:

- *“Phân loại quy tắc CHUYEN_DE-XXX theo tài liệu Tri_thuc_AI_CHUYEN_DE_XML130_thuc_chien: điều kiện có chạy trên XML130 không, hay placeholder? Nêu rủi ro báo giả nếu tên DV khác BV.”*
- *“Liệt kê đúng thứ tự 6 bước triển khai (mục 0) trước khi coi quy tắc là thực chiến.”*
- *“Trên dashboard QPS, lỗi nào vào nhóm Vi phạm cấu trúc XML (`CAU_TRUC_XML`) thay vì Xuất toán / Cảnh báo CDSS? Đối chiếu `The_tri_thuc_phan_loi_vi_pham_cau_truc_XML_dashboard_QPS_AI.md`.”*

Khi trả lời người dùng cuối: nhấn mạnh khớp **tên dịch vụ** phụ thuộc BV; cần **mẫu XML thật** để hiệu chỉnh từ khóa.

**Bổ sung dashboard:** Báo cáo vi phạm **cấu trúc dữ liệu XML** (QĐ 3176 / tiền xử lý `kiem_tra_xml`, mã `STRUCT-*`, `XMLn-…`) được tách lớp hiển thị và lọc riêng so với cảnh báo engine CHUYEN_DE / CDSS — xem [The_tri_thuc_phan_loi_vi_pham_cau_truc_XML_dashboard_QPS_AI.md](./The_tri_thuc_phan_loi_vi_pham_cau_truc_XML_dashboard_QPS_AI.md).

## 5. Triển khai thực chiến (sản phẩm — khớp mục 0 bước 6)

1. Merge mã + chạy đủ **mục 0 (bước 1–4)** và **mục 3** trên nhánh release.
2. Trên staging: nạp **XML mẫu thật** (đã ẩn danh) và đếm: số cảnh báo CHUYEN_DE mới / trùng / false positive.
3. Với quy tắc **B** còn nhiều: cân nhắc `TRANG_THAI: 'OFF'` theo `tai_lieu/Kiem_soat_placeholder_CHUYEN_DE_XML130.md` cho đến khi có điều kiện loại A hoặc handler.
4. Đồng bộ Thư viện / RAG: sau mỗi lần sửa `tai_lieu/*.md`: `npm run tai_lieu:prepare` (**mục 0 bước 5**).

## 6. Tham chiếu nhanh file

| File | Vai trò |
|------|--------|
| `ma_nguon/tien_ich/luat_giam_dinh_chuyen_de_hardcoded.jsx` | Luật CHUYEN_DE |
| `scripts/chuyen_de_batch_manifest.json` | Trạng thái từng lô |
| `scripts/chuyen_de_placeholder_registry.json` | Id placeholder (tự động) |
| `tai_lieu/Kiem_soat_placeholder_CHUYEN_DE_XML130.md` | Chính sách placeholder |
| `tai_lieu/The_tri_thuc_phan_loi_vi_pham_cau_truc_XML_dashboard_QPS_AI.md` | Phân loại `CAU_TRUC_XML` vs CDSS; chip QPS |
| `scripts/patch_chuyen_de_batch6_dieukien.mjs` | Script tái lập lô 6 (tham khảo) |
| `scripts/patch_chuyen_de_batch7_dieukien.mjs` | Script tái lập lô 7 (tham khảo) |
| `scripts/patch_chuyen_de_batch8_dieukien.mjs` | Script tái lập lô 8 (tham khảo) |
