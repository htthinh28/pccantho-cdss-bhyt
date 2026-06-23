# THẺ TRI THỨC: ICD-10 — HỆ THỐNG MÃ KÉP († DẤU GĂM / * DẤU SAO)

Phiên bản: 1.0  
Ngày: 16/06/2026  

**Căn cứ:** Quy định về mã hóa bệnh tật ICD-10 — hệ thống phân loại kép (mã dấu găm † và mã dấu sao *).

---

## 1. Ý nghĩa và nguyên tắc

| Loại mã | Ký hiệu | Vai trò | Ghi trên XML130 |
|---------|---------|---------|-----------------|
| Mã dấu găm | † | Nguyên nhân / cơ chế bệnh sinh | **MA_BENH_CHINH** (bệnh chính) |
| Mã dấu sao | * | Biểu hiện / thể hiện lâm sàng hiện tại | **MA_BENH_KT** (bệnh kèm theo) |

**Nguyên tắc bắt buộc:**

1. Mã † và mã * **luôn phải đi kèm** — gặp * thì phải có † tương ứng và ngược lại.
2. Mã * **không được** làm bệnh chính và **không được ghi đứng một mình**.
3. Trong **MA_BENH_KT**, nếu có mã *, mã * **bắt buộc đứng đầu** dãy bệnh kèm theo.
4. Trên **MA_BENH_YHCT** (Y học cổ truyền): mã † vị trí 1, mã * vị trí 2 khi cùng có cặp mã kép.

**Hình thức trong bảng phân loại:**

- Cùng có † và * trên một thuật ngữ → phân loại kép, chung một mã kèm theo.
- Chỉ có † → phân loại kép, biểu hiện tương ứng các mã * khác nhau.
- Mã 3–4 ký tự không có †/* → không phân loại kép; các mặt bệnh trong mục “bao gồm” có thể có †/*.

---

## 2. Mã cảnh báo CDSS (built-in L23)

| Mã cảnh báo | Mức độ | Ý nghĩa |
|-------------|--------|---------|
| **ICD-KEP-SAO-CHINH** | Error | Mã * ở MA_BENH_CHINH |
| **ICD-KEP-SAO-DON** | Error | Mã * trên hồ sơ nhưng không có mã † |
| **ICD-KEP-GAM-THIEU-SAO** | Error | Mã † ở bệnh chính nhưng thiếu mã * kèm theo |
| **ICD-KEP-GAM-SAO-LECH** | Error | Cặp †/* không khớp danh mục (theo tên bệnh) |
| **ICD-KEP-SAO-GAM-LECH** | Error | Mã * kèm theo không khớp mã † chính trong danh mục |
| **ICD-KEP-SAO-VI-TRI** | Error | Mã * không đứng đầu MA_BENH_KT |
| **ICD-KEP-YHCT-THU-TU** | Warning | Thứ tự †/* trên MA_BENH_YHCT chưa đúng |

Bật/tắt theo nhóm: mẫu `ICD-KEP-*` trong Quản lý quy tắc nội bộ (tab LUAT_DU_LIEU).

---

## 3. Neo kỹ thuật trong repo

| Thành phần | Vai trò |
|------------|---------|
| `ma_nguon/thanh_phan/icd10_ma_kep_bang.jsx` | Bundle `TAP_MA_GAM_ICD10`, `TAP_MA_SAO_ICD10`, cặp `CAP_GAM_SANG_SAO_ICD10` |
| `scripts/build_icd10_ma_kep_catalog.mjs` | Sinh lại bảng từ `dm_icd10_seed.jsx` |
| `giamDinhIcd10MaKep(hoSo)` trong `icd10_ma_kep_giam_dinh.jsx` | Built-in Layer **L23**, namespace `ICD10_MA_KEP_BUILTIN` |

**Tái sinh danh mục** khi cập nhật `DANH_MUC_ICD10`:

```bash
npm run catalog:icd10-ma-kep
```

---

## 4. Ví dụ

**Đúng:** `MA_BENH_CHINH = A06.5†`, `MA_BENH_KT = J99.8*;I10`

**Sai — mã * làm chính:** `MA_BENH_CHINH = G01*` → ICD-KEP-SAO-CHINH

**Sai — thiếu cặp:** `MA_BENH_CHINH = A06.5†`, `MA_BENH_KT = I10` (không có J99.8*) → ICD-KEP-GAM-THIEU-SAO / ICD-KEP-GAM-SAO-LECH

**Sai — thứ tự kèm theo:** `MA_BENH_KT = I10;J99.8*` → ICD-KEP-SAO-VI-TRI

---

*Cập nhật khi BYT thay danh mục ICD-10 — chạy lại `catalog:icd10-ma-kep` và bump `PHIEN_BAN_ICD10_MA_KEP`.*
