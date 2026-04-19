# THẺ TRI THỨC: KT01.4 — VI KHUẨN NHUỘM SOI vs NUÔI CẤY ĐỊNH DANH (CV266) CHO AI GIÁM ĐỊNH

Phiên bản: 1.0  
Ngày: 19/04/2026  

**Nguồn nghiệp vụ:** Công văn 266 — chuyên đề Trung tâm Kiểm soát BHYT, **PL01 / KT01.4** (*Vi khuẩn nhuộm soi*), ngày kèm tệp tham chiếu **15/09/2025**.  
**Mã từ chối gợi ý trong văn bản:** S.005.434  

---

## 1. Nguyên tắc thanh toán (trích ý)

- **Không** thanh toán DVKT **Vi khuẩn nhuộm soi** **đồng thời** với DVKT **Vi khuẩn nuôi cấy định danh** (nhuộm soi đã nằm trong quy trình/luật giá của nuôi cấy định danh theo TT 35/2016 và quy trình **QĐ 26/QĐ-BYT**).

## 2. Bảng mã BYT (đối soát engine)

| Vai trò | Mã DVKT (BYT) | Ghi chú |
|--------|-----------------|---------|
| Nhuộm soi | **24.0001.1714** | Một dòng đủ kích hoạt nhánh «nhuộm soi» |
| Nuôi cấy + định danh (thông thường) | **24.0003.1715** | |
| Nuôi cấy + định danh (tự động) | **24.0004.1716** | |
| Nuôi cấy + định danh + kháng thuốc (tự động) | **24.0005.1716** | |
| Vi khuẩn kỵ khí — nuôi cấy + định danh | **24.0010.1692** | |

## 3. Neo mã nguồn (CDSS)

| Thành phần | Vai trò |
|------------|---------|
| `CHUYEN_DE_XML130_CO_DV_MA_VK_NHUOM_SOI_CV266` | Có dòng XML3 khớp mã **24.0001.1714** hoặc tên gợi **nhuộm soi** + **vi khuẩn** / **Gram stain**. |
| `CHUYEN_DE_XML130_CO_DV_MA_VK_NUOI_CAY_DINH_DANH_CV266` | Có dòng khớp một trong bốn mã nuôi cấy định danh **hoặc** tên gợi **nuôi cấy** kèm **định danh** / **hệ thống tự động** / **kháng thuốc** / **kỵ khí**. |
| **`Chuyen_de_604`** / `CHUYEN_DE-604` | Cả hai nhánh trên **cùng** một hồ sơ → cảnh báo xuất toán. |

---

*Khi BYT sửa mã: cập nhật bảng mã trong `luat_giam_dinh_chuyen_de_hardcoded.jsx` và thẻ này.*
