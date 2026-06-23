# Kế hoạch triển khai đa bệnh viện — từng bước, lint/audit, và hồ sơ cần cung cấp

Phiên bản: 1.1  
Ngày: 2026-05-25  
Phạm vi: Khung ứng dụng chung + danh mục nội bộ riêng từng BV + đăng nhập 2 cấp (bệnh viện → nhân viên)

### Bốn cơ sở đã đăng ký (`config/tenants/registry.json`)

| org_id | Tên |
|--------|-----|
| `pc_soc_trang` | Bệnh viện Quốc tế Phương Châu Sóc Trăng (legacy, Firebase `phuongchau`) |
| `pc_can_tho` | Bệnh viện Quốc tế Phương Châu Cần Thơ |
| `pc_sa_dec` | Bệnh viện Phương Châu Sa Đéc |
| `phuong_nam` | Bệnh viện Phương Nam |

**Chính sách danh mục (đã code):** `pc_soc_trang` = `legacy_bundle` (giữ DM hiện tại). Ba BV còn lại = `tenant_pack_only` (xóa trống DM; tắt quy tắc chuyên BV PCST — DM-*, DMBV-*, DVKT-OP-*, CDHA/CK/CHUYEN_DE…; giữ ON quy tắc chung XML/HC/THUOC; nạp pack Excel sau).

---

## Nguyên tắc chung mỗi bước

Mỗi bước chỉ được coi là **xong** khi đủ:

| Cổng kiểm tra | Lệnh / việc làm |
|---------------|-----------------|
| Lint & chuẩn text | `npm run lint` · `npm run text:check` |
| Audit repo (regression) | `npm run qa:audit-all` (hoặc tập con liên quan bước đó) |
| Audit XML mẫu BV | `npm run qa:claim-audit-smoke` + ≥3 hồ sơ XML vàng BV cung cấp |
| Không lẫn tenant | Test thủ công: đổi org A/B — danh mục & hồ sơ không trộn |
| Ghi nhận | Cập nhật manifest tenant + ghi chú triển khai |

---

## Phase 0 — Chuẩn bị & hồ sơ đầu vào (bạn cung cấp)

**Mục tiêu:** Khóa phạm vi BV mới (và BV mẫu tham chiếu) trước khi sửa code.

### Bạn cần cung cấp

| # | Hạng mục | Mô tả | Bắt buộc |
|---|----------|--------|----------|
| 0.1 | Định danh tenant | `org_id` (slug, vd. `benhvien_b`), tên hiển thị, mã CSKCB | Có |
| 0.2 | Kênh triển khai | Desktop portable / web LAN / Vercel riêng / không dùng cloud | Có |
| 0.3 | Danh mục nội bộ | File Excel/XML theo mẫu: M01 Khoa, M03 Thuốc, M05 DVKT, M04 VTYT, M06 TB, M02 Nhân sự (nếu bật) | Có (ít nhất M05 + M03) |
| 0.4 | Công khám / DVKT bổ sung | File kiểu FileDichVuBV…xlsx (MA_TUONG_DUONG) nếu có | Tùy BV |
| 0.5 | Chính sách ON/OFF | Danh sách nhóm rule bật/tắt; CHUYEN_DE: rule nào bật thực chiến | Có (bản nháp) |
| 0.6 | Hồ sơ XML vàng | 5–10 ca đã biết lỗi/đúng kỳ vọng (MA_LK + kết quả mong đợi) | Có |
| 0.7 | Tài khoản | Danh sách email, vai trò (ADMIN, AUDITOR, USER…); ai quản trị DM | Có |
| 0.8 | HIS (nếu có) | URL REST/FHIR, tài liệu API, IP LAN | Tùy |
| 0.9 | Firebase (nếu có) | Dùng chung project hay tách; tài khoản service cho custom claims | Tùy |
| 0.10 | Branding | Tên app, logo (icon), màu (tùy) | Tùy |

### Việc triển khai kỹ thuật ở Phase 0

- Tạo khung `config/tenants/<org_id>/profile.json` + checklist triển khai.
- Rà file Excel: cột, số dòng, mã trùng/thiếu.
- Báo cáo gap so với seed BV mẫu (Phương Châu).

### Cổng Phase 0

- Checklist ký duyệt nội bộ (xác nhận `org_id`, phạm vi DM, không chia sẻ URL giữa 2 BV trên cùng máy tester nếu chưa có prefix storage).

---

## Phase 1 — Nền tảng tenant (storage & profile)

**Mục tiêu:** Mọi dữ liệu local gắn `org_id`, chưa đổi UI đăng nhập.

### Các bước công việc

| Bước | Nội dung kỹ thuật |
|------|------------------|
| 1.1 | Module `tenant_context` / `org_profile`: đọc `org_id` từ env, file cấu hình, hoặc storage |
| 1.2 | Hàm prefix key: `CDSS_ORG_{orgId}_*` bọc AsyncStorage / IndexedDB |
| 1.3 | Migration một lần: dữ liệu cũ `CDSS_DATA_*` → `CDSS_ORG_phuongchau_*` (BV hiện tại) |
| 1.4 | Cập nhật `kho_du_lieu`, `luu_tru_danh_muc`, backup/restore, ON/OFF, RBAC keys theo org |
| 1.5 | Script `scripts/qa_tenant_isolation.mjs`: tạo 2 org giả, ghi A, đọc B → phải rỗng |
| 1.6 | Smoke: đọc seed M05 đúng org |

### Bạn cần cung cấp

- Xác nhận `org_id` BV hiện tại (vd. `phuongchau`) để migration không mất dữ liệu.
- 1 máy test: backup JSON trước migration.

### Cổng Phase 1

```
npm run lint
npm run text:check
npm run qa:config-versioning
node scripts/qa_tenant_isolation.mjs
npm run qa:audit-all
```

- Test thủ công: mở app sau migration — danh mục & kho hồ sơ vẫn đủ.

---

## Phase 2 — Gói tenant pack (import danh mục)

**Mục tiêu:** Đưa danh mục BV mới vào repo/script, không nhúng cứng vào build chung (hoặc build theo profile).

### Các bước công việc

| Bước | Nội dung |
|------|----------|
| 2.1 | Chuẩn `config/tenants/<org_id>/catalogs/` + manifest |
| 2.2 | Mở rộng script import (update_dvkt_noi_bo_from_excel.js --supplement) → import đủ M01–M06 |
| 2.3 | `scripts/import_tenant_pack.mjs`: nạp toàn bộ pack → storage format theo org |
| 2.4 | Sinh `PHIEN_BAN_*` per catalog; bump version trong `luu_tru_danh_muc` |
| 2.5 | Tài liệu: cách gửi Excel lần sau chỉ chạy supplement |

### Bạn cần cung cấp

- Bộ file danh mục đã chốt (Excel đúng mẫu cột — tham chiếu `mau_excel_chuan_danh_muc.js`).
- File công khám/DVKT bổ sung (như cập nhật tháng 5).
- (Tùy chọn) Export JSON từ BV mẫu làm template cấu trúc, không copy nội dung mã.

### Cổng Phase 2

```
npm run lint
npm run dvkt:supplement-m05
node scripts/import_tenant_pack.mjs --org=<org_id>
npm run qa:danh-muc-xml-mau
npm run qa:audit-all
```

- Đối chiếu: số dòng M05/M03 khớp Excel; spot-check 20 mã ngẫu nhiên.

---

## Phase 3 — Đăng nhập 2 cấp (UI + phiên)

**Mục tiêu:** Chọn BV → đăng nhập nhân viên → mọi màn hình trong tenant.

### Các bước công việc

| Bước | Nội dung |
|------|----------|
| 3.1 | Màn ChonBenhVien / DangNhapCoSo: danh sách org từ registry tenants |
| 3.2 | Lưu `CDSS_TENANT_SESSION` (orgId, tên BV, thời điểm chọn) |
| 3.3 | Điều hướng: chưa chọn BV → không vào DangNhap nhân viên |
| 3.4 | Đăng xuất BV: xóa tenant session + tùy chọn giữ/không giữ cache DM |
| 3.5 | Deep link / desktop: app.json / env EXPO_PUBLIC_ORG_ID cho bản cài 1 BV |
| 3.6 | RBAC: user chỉ bind trong org đã chọn |

### Bạn cần cung cấp

- Danh sách BV được phép chọn trên màn hình (1 hay nhiều).
- Quy tắc: nhân viên có được đổi BV trong ngày không (thường: không — phải đăng xuất BV).
- Logo/tên từng BV cho màn chọn.

### Cổng Phase 3

```
npm run lint
npm run text:check
npm run qa:audit-all
```

- Kịch bản test: A → login → thấy DM A; đổi BV → B → DM B, không còn hồ sơ A.

---

## Phase 4 — Cấu hình giám định theo BV (ON/OFF, chuyên đề)

**Mục tiêu:** Cùng engine, khác policy từng BV.

### Các bước công việc

| Bước | Nội dung |
|------|----------|
| 4.1 | `config/tenants/<org>/on_off/` — mặc định OFF mở rộng, ghi đè nội dung |
| 4.2 | `chuyen_de_thuc_chien_manifest.json` per org |
| 4.3 | Import policy vào `CDSS_ORG_*_ON_OFF_*` khi chọn BV / first run |
| 4.4 | Helper: Xuất/Nhập cấu hình BV (JSON) |

### Bạn cần cung cấp

- Bảng rule bật/tắt (hoặc file Excel ON/OFF nội bộ đã dùng).
- Quyết định CHUYEN_DE: placeholder giữ OFF; danh sách rule approved thực chiến.
- (Nếu có) Hợp đồng/giá DVKT đặc thù → map DM-DVKT-04, hợp đồng HD_*.

### Cổng Phase 4

```
npm run qa:on-off-match
npm run qa:rule-trang-thai
npm run chuyen-de:rollout-verify
npm run qa:chuyen-de-thuc-chien
npm run qa:claim-audit-smoke
npm run qa:audit-all
```

- Audit XML vàng BV: so sánh mã luật phát sinh với kỳ vọng.

---

## Phase 5 — Firebase & HIS (tùy chọn, theo BV)

**Mục tiêu:** Cloud/sync và HIS không lẫn org.

### Các bước công việc

| Bước | Nội dung |
|------|----------|
| 5.1 | `resolveFirebaseConfig()` đọc `orgId` từ tenant session |
| 5.2 | Custom claims `org_id` + `role` per user BV |
| 5.3 | Deploy firestore.rules / storage.rules (đã có /orgs/{orgId}) |
| 5.4 | HIS config trong profile.json — không commit IP production |

### Bạn cần cung cấp

- Firebase: uid/email service account; danh sách user + role + org_id tương ứng.
- HIS: URL, credential, môi trường test.

### Cổng Phase 5

```
npm run firebase:deploy-rules
npm run qa:his-gateway
```

---

## Phase 6 — Đóng gói & triển khai vận hành

**Mục tiêu:** Mỗi BV một artifact hoặc một URL, kèm tenant pack.

### Các bước công việc

| Bước | Nội dung |
|------|----------|
| 6.1 | Build profile: EXPO_PUBLIC_ORG_ID, tên app, icon |
| 6.2 | desktop:export:light + portable hoặc Vercel project riêng |
| 6.3 | Script cài đặt: import tenant pack lần đầu |
| 6.4 | Hướng dẫn vận hành: backup, nâng cấp khung vs nâng cấp DM |

### Bạn cần cung cấp

- Máy chủ/máy trạm triển khai; người phụ trách CNTT BV.
- Quy trình backup trước khi cập nhật (bắt buộc).

### Cổng Phase 6

```
npm run vercel:build
npm run desktop:build:win-portable
npm run qa:audit-all
```

- UAT: đăng nhập 2 cấp, import 1 XML, báo cáo, backup/restore.

---

## Phase 7 — Bàn giao & vận hành liên tục

| Bước | Nội dung |
|------|----------|
| 7.1 | Tài liệu triển khai (user + admin) |
| 7.2 | Checklist UAT ký duyệt |
| 7.3 | Lịch cập nhật: khung app (git) vs danh mục (supplement Excel) |

### Bạn cần cung cấp

- Biên bản nghiệm thu UAT.
- Đầu mối nghiệp vụ sau triển khai (cập nhật DM, ON/OFF).

---

## Thứ tự phase

```
Phase 0 (Hồ sơ) → Phase 1 (Storage) → Phase 2 (Tenant pack DM)
       → Phase 3 (Login 2 cấp) → Phase 4 (ON/OFF & CHUYEN_DE)
       → Phase 5 (Firebase/HIS, tùy chọn) → Phase 6 (Build) → Phase 7 (Bàn giao)
```

Phase 5 có thể song song Phase 4 nếu không dùng cloud.

---

## Tóm tắt: chuẩn bị tối thiểu cho một BV mới

1. org_id + tên BV + mã CSKCB
2. Excel M05 DVKT (+ M03 thuốc, M01 nếu có)
3. 5–10 XML vàng + bảng kỳ vọng cảnh báo
4. Danh sách tài khoản & vai trò
5. Chính sách ON/OFF / chuyên đề (nháp)
6. Chọn desktop hay web và có/không Firebase/HIS

---

## Ước lượng effort (tham khảo)

| Phase | Phụ thuộc bạn | Effort dev (ước lượng) |
|-------|----------------|-------------------------|
| 0 | Cung cấp file | 0.5–1 ngày (rà soát) |
| 1 | Xác nhận migration | 3–5 ngày |
| 2 | File DM đầy đủ | 2–4 ngày/BV |
| 3 | Logo/danh sách BV | 3–4 ngày |
| 4 | Bảng ON/OFF | 2–3 ngày/BV |
| 5 | Firebase/HIS | 1–3 ngày |
| 6–7 | UAT | 2–3 ngày |

BV thứ hai thường nhanh hơn nhờ tenant pack + script đã có.

---

## Kiến trúc tóm tắt (tham chiếu)

### Ba tầng

- **Nền tảng (chung):** UI, engine giám định, luật seed chuẩn BYT, parser XML, khung báo cáo.
- **Tenant (riêng BV):** Danh mục M01–M06, ON/OFF, manifest CHUYEN_DE, kho hồ sơ, cấu hình HIS.
- **Truy cập:** Đăng nhập cấp bệnh viện → đăng nhập nhân viên.

### Đăng nhập 2 cấp

1. Chọn / xác định bệnh viện (org_id) — khóa tenant cho phiên.
2. Đăng nhập nhân viên — RBAC trong phạm vi org đó.

### Phân tách chung / riêng

**Chung mọi BV:** Luồng màn hình, engine 5 tầng, luật seed, DM-DVKT/DM-THUOC built-in, DVKT no-code, script QA.

**Riêng từng BV:** Toàn bộ nội dung danh mục nội bộ, giá HD, ON/OFF đã cấu hình, hồ sơ XML, tài khoản, HIS endpoint.

### So với hiện trạng repo

| Thành phần | Hiện tại | Hướng đa BV |
|------------|----------|-------------|
| Chọn BV | orgId cố định trong app.json | Màn chọn BV + profile |
| Storage | CDSS_DATA_* không prefix org | CDSS_ORG_{orgId}_* |
| Danh mục M05 | dich_vu_ky_thuat.jsx một BV | Tenant pack per org |
| Firebase | /orgs/phuongchau/ | /orgs/{orgId}/ + claims |
| Đăng nhập | Một bước (DangNhap) | BV → nhân viên |

---

*Tài liệu sinh từ kế hoạch triển khai CDSS đa bệnh viện. Sau khi sửa, chạy `npm run tai_lieu:prepare` để đồng bộ Thư viện trong app.*
