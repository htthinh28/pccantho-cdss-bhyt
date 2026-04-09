# Checklist: TT 12/2026/TT-BTC — Điều 10 khoản 1 → trường dữ liệu XML 130 (tham chiếu)

Phiên bản: 1.0  
Ngày: 06/04/2026  
Căn cứ pháp lý: **Thông tư 12/2026/TT-BTC**, **Điều 10 khoản 1** (các nội dung rà soát hồ sơ đề nghị thanh toán — giám định **tự động**).  
Tra cứu: [Thông tư 12/2026/TT-BTC](https://thuvienphapluat.vn/van-ban/Bao-hiem/Thong-tu-12-2026-TT-BTC-thu-tuc-giam-dinh-chi-phi-kham-chua-benh-bao-hiem-y-te-694954.aspx)

Mục đích: map từng **điểm a–m** sang **lớp dữ liệu** trong hồ sơ điện tử (XML1…XML6 theo QĐ 130/BYT) để huấn luyện AI, viết rule và đối chiếu `co_so_phap_ly` trong CDSS. Đây là bản **tham chiếu kỹ thuật**, không thay thế văn bản gốc.

---

## Bảng map nhanh

| Điểm Đ10 k1 | Nội dung rà soát (tóm tắt) | Trường / nhóm XML gợi ý | Ghi chú cho engine |
|-------------|------------------------------|-------------------------|-------------------|
| **a** | Thông tin thẻ BHYT | **XML1**: `MA_THE`, `GT_THE_TU`, `GT_THE_DEN`, `MA_DKBD`, `MA_BENH_NHAN`…; tra cứu tuyến/đối tượng liên quan `MA_DOI_TUONG`, `MA_LOAI_KCB` | Lỗi cấu trúc / hết hạn thẻ → thường `XML_*` / hành chính |
| **b** | Mức hưởng, quyền lợi người bệnh | **XML1**: `MUC_HUONG`, `MUC_CUNG_CHI_TRA`, các trường liên quan đồng chi trả; **XML6** (nếu có chi tiết thanh toán) | Đối chiếu chính sách từng đối tượng BHYT |
| **c** | Phạm vi TT thuốc, TBYT, DVKT theo **danh mục tại CSKCB** | **XML2** (thuốc): `MA_THUOC`, `MA_PP_CHE_BIEN`, `DON_VI_TINH`…; **XML3** (DVKT/VTYT): `MA_DICH_VU`, `MA_VAT_TU`, `MA_NHOM`…; **XML1**: bối cảnh CS (`MA_CSKCB`, `MA_NOI_CHUYEN`) | Rule `THUOC_*`, `DM-THUOC-*`, `DVKT_*`, `DM-VTYT-*`; BYT: 15/VBHN thuốc, 17/VBHN DVKT, **14/VBHN-BYT 2025** + TT 04/2017 VTYT (mục **11.6** thẻ Luật 2025) |
| **d** | Mức thanh toán (giá, ngày giường, vận chuyển…) | **XML2**: `DON_GIA`, `THANH_TIEN`, `SO_LUONG`; **XML3**: `DON_GIA`, `THANH_TIEN`; **XML1**: thời gian nội trú `NGAY_VAO`, `NGAY_RA`, `SO_NGAY_DTRI` | Giá trúng thầu / giá BHYT; `DM-THUOC-04`, DVKT giá |
| **đ** | Tỷ lệ, **điều kiện** thanh toán (thuốc, TBYT, DVKT) | **XML1**: `MA_BENH_CHINH`, `MA_BENH_KT`, `CHAN_DOAN_*`; **XML2/3**: chỉ định ICD, nhóm DVKT; bảng quy tắc chỉ định/chống chỉ định | Luật thuốc `THUOC_32`–`THUOC_38`, DVKT ICD, tỷ lệ TT |
| **e** | Phạm vi chuyên môn, thời gian KCB của **CSKCB** | **XML1**: `MA_LOAI_KCB`, `MA_KHOA`, `MA_NOI_CHUYEN`; metadata hợp đồng/danh mục CS (ngoài XML claim) | Liên quan NĐ 188, hợp đồng KCB BHYT |
| **g** | Phạm vi hành nghề, thời gian làm việc **người hành nghề** | **XML2**: `MA_BS_CHI_DINH`; **XML3**: `MA_BS_CHI_DINH` / người thực hiện; **XML1**: `MA_BAC_SI` | Rule nhân sự / mapping DVKT–bác sĩ |
| **h** | Thời gian giữa các lần KCB | **XML1**: `NGAY_VAO`, `NGAY_RA`, `NGAY_TTOAN`; lịch sử nhiều `MA_LK` (liên thông) | Cảnh báo tái khám/trùng đợt (cần thêm rule nội bộ) |
| **i** | Dịch vụ KCB **hợp lý** theo tiêu chuẩn BYT (khoản 3 Điều 6 Luật BHYT) | Toàn bộ XML + hồ sơ lâm sàng; **XML4** CLS nếu có; chỉ định so với chẩn đoán | Giám định chủ động / chuyên môn; **điểm i** thường cần bổ sung tài liệu (khoản 2–3 Điều 10) |
| **k** | Số liệu **thống nhất** trên Bảng kê chi tiết | Đối chiếu **XML1–6** với tổng hợp; `THANH_TIEN` các bảng vs XML6 / logic tổng | `XML_53`, cảnh báo lệch tổng |
| **m** | Số lượng thuốc/TBYT khớp **đấu thầu / điều chuyển** (Điều 43 NĐ 188/2025) | **XML2** `SO_LUONG`, mã thuốc; danh mục mua sắm nội bộ / hợp đồng | Vượt khối lượng mua sắm → từ chối một phần |

---

## Điểm cần giám định chủ động (gợi ý từ khoản 2–3 Điều 10)

- **đ** (tỷ lệ, điều kiện) và **i** (hợp lý): khi hệ thống **không đủ thông tin** tự động, Bảng kê có thể chuyển trạng thái cần **tài liệu chứng minh** / điều chỉnh (Mẫu 09/BH — Phụ lục I TT 12/2026).

---

## Liên kết nội bộ dự án

- Căn cứ pháp lý tổng hợp: `The_tri_thuc_mau_luat_BHYT_2008_2025.md` mục **11.2**; chuỗi **VTYT** mục **11.6**; **Luật KCB** + NĐ 96 + TT 32 mục **11.7** (bổ sung cho điểm **e, g, i** — phạm vi CS, hành nghề, hợp lý dịch vụ / bệnh án).  
- **Văn bản đầy đủ** (Điều 10 khoản 1 đủ điểm a–m + Điều 13 khoản 1–3): `ma_nguon/tien_ich/co_so_phap_ly_tt12_2026.jsx` (`CHUOI_DAY_DU_TT12_2026_D10_VA_D13`) — được import vào `dong_co_giam_dinh.jsx` (`co_so_phap_ly`) và nối vào `resolveLegalBasis` trong `rule_engine_dvkt_no_code.jsx`.
