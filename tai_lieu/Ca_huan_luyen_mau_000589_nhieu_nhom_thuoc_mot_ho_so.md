# CA HUẤN LUYỆN MẪU 000589 — MỘT HỒ SƠ, NHIỀU NHÓM THUỐC (DANH MỤC BV)

Phiên bản tài liệu: 1.0  
Ngày cập nhật: 08/04/2026

## 1. Mục tiêu

Huấn luyện AI **phân tách đồng thời** nhiều cảnh báo thuốc trong **một** hồ sơ nội trú, mỗi loại thuộc **nhóm kiểm soát khác nhau** (theo `The_tri_thuc_da_dang_nhom_thuoc_dan_muc_BV_AI.md`):

- chỉ định thanh toán theo **ICD** (ho thảo dược, probiotic);
- **số lượng** cấp phát so với y lệnh (thiếu / dư);
- **trùng kê** cùng ngày (XML1).

Không gộp thành một kết luận “sai thuốc chung”.

## 2. Nguồn dữ liệu

- Audit: `test_xml/audit_000589_20260405_232716.json`  
  (có thể đối chiếu bản cùng `MA_LK`: `audit_000589_20260406_074454.json`)
- Seed: `ma_nguon/tien_ich/du_lieu_luat_thuoc_muc8.jsx` — các mục `THUOC_207`, `THUOC_63`, `THUOC_417`, `THUOC_391`.

## 3. Tóm tắt cảnh báo thuốc trong audit (snapshot)

| Rule | Số lần (ước lượng từ cấu trúc) | Ý nghĩa ngắn |
|------|--------------------------------|--------------|
| `THUOC_207` | 1 | Hoastex — chỉ định ICD J06/J20/R05 |
| `THUOC_391` | 2 | Cefotaxime — cấp phát **thấp hơn** y lệnh |
| `THUOC_417` | 1 | DOMUVAR — cấp **dư** so với y lệnh |
| `THUOC_63` | 1 | DOMUVAR — ICD không thuộc tiêu chảy / loạn khuẩn ruột |
| `XML_121` | 1 | Dấu hiệu trùng lặp kê cùng ngày (toàn hồ sơ) |

*(Số đếm chính xác: mở `meta.focus_summary` hoặc đếm mảng `warnings` trong JSON.)*

## 4. Ánh xạ sang “nhóm danh mục BV”

| Thuốc / mã (từ text cảnh báo) | Nhóm | Rule |
|-------------------------------|------|------|
| Hoastex `05C.150` | Ho / Đông dược | `THUOC_207` |
| Tenamyd-Cefotaxime `40.173` | Kháng sinh tiêm | `THUOC_391` |
| DOMUVAR `40.718` | Probiotic | `THUOC_63` + `THUOC_417` |

→ **Ba nhóm dược lý khác nhau**, ba logic kiểm tra khác nhau.

## 5. Bài tập cho AI

1. Với **DOMUVAR**: giải thích vì sao **cùng một dòng thuốc** (cùng `index` XML2 nếu có) có thể liên quan **hai rule** (`THUOC_63` và `THUOC_417`) — một cái ICD, một cái số lượng.
2. Với **Cefotaxime**: chỉ ra công thức `THUOC_391` và ý nghiệp vụ “tự túc / sai số / tách đơn”.
3. Với **Hoastex**: liệt kê ICD hoặc mô tả chẩn đoán **mở** chỉ định thanh toán theo seed.
4. `XML_121`: đây có phải “sai chỉ định thuốc” không? Nếu không, định danh đúng loại kiểm soát.

## 6. Bài học rút ra

- Hồ sơ nội trú thường **dày XML2**; AI cần **bảng kê theo index** + nhóm rule.
- **Probiotic** dễ vừa dính **ICD** vừa dính **số lượng** — hay train cùng nhau.
- Luôn giữ **`XML_121`** tách khỏi nhóm THUOC ICD/liều khi báo cáo ban giám đốc.

## 7. Liên kết

- Bảng đa dạng nhóm thuốc: `The_tri_thuc_da_dang_nhom_thuoc_dan_muc_BV_AI.md`  
- Khung kiểm soát: `The_tri_thuc_kiem_soat_sai_thuoc_AI.md`  
- Ca DOMUVAR chi tiết (ngoài bối cảnh 000589): `Ca_huan_luyen_mau_000434_THUOC_417_DOMUVAR.md`
