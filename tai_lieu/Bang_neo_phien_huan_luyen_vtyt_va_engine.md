# Bảng neo — phiên huấn luyện VTYT ↔ engine (repo)

**Trạng thái:** Trong CSDL rule **chưa có** cảnh báo tiền tố **`DM-VTYT-*`** — bảng này neo **những gì đang có** liên quan vật tư, và chỗ **điền sau** khi có seed thật. **Chuẩn hóa suy luận AI:** [Chuan_hoa_kien_thuc_AI_giam_dinh_VTYT.md](./Chuan_hoa_kien_thuc_AI_giam_dinh_VTYT.md) (§**0**). **Lộ trình nạp rule:** [Huan_luyen_phien_VTYT_du_phong_Cursor.md](./Huan_luyen_phien_VTYT_du_phong_Cursor.md) §**4.2**.

| Mục / phiên | MA_LUAT hoặc điểm neo | File mã / nguồn | Thẻ tri thức / văn bản | Ca mẫu / audit |
|-------------|------------------------|-----------------|-------------------------|----------------|
| **Khung pháp lý + prefix** | *(sẵn mapping)* `DM-VTYT-…` → `CO_SO_PHAP_LY_VTYT` | `dong_co_giam_dinh.jsx` — `VAN_BAN_HANH_CHINH_HIEN_HANH.VBHN_VTYT`, `CO_SO_PHAP_LY_THEO_PREFIX_MA_LUAT` | [The_tri_thuc_mau_luat_BHYT_2008_2025.md](./The_tri_thuc_mau_luat_BHYT_2008_2025.md) §**11.6** | — |
| **VTYT ↔ DVKT (kết cấu / trùng gói)** | `DVKT-OP-08` (ghi chú); lỗi khi tách VTYT trái ghi chú DVKT | `dvkt_op_giam_dinh.jsx` — `extractVtytLines`, `checkGhiChu`, `DEFAULT_DVKT_RULES` | [Chuan_hoa_kien_thuc_AI_giam_dinh_DVKT.md](./Chuan_hoa_kien_thuc_AI_giam_dinh_DVKT.md) (kết cấu vật tư) | [Ca 000375 DVKT-OP-09](./Ca_huan_luyen_mau_000375_DVKT_OP_09_danh_muc_noibo.md) — cùng engine; `audit_000375_*.json` |
| **Tổng tiền XML1 vs toàn bộ XML3** | `CLN-CHI-02` — `XML1.T_VTYT` so với **tổng** `THANH_TIEN_BV` mọi dòng XML3 (quy ước dự án) | `dong_co_giam_dinh.jsx` — `giamDinhTongChiPhi` | [Chuan_hoa_kien_thuc_AI_giam_dinh_VTYT.md](./Chuan_hoa_kien_thuc_AI_giam_dinh_VTYT.md) §**3** | *(audit có `CLN-CHI-02`)* |
| **Lệch `T_VTYT` chỉ với dòng có `MA_VAT_TU`** | `XML_54` — *Lệch tiền VTYT (T_VTYT)* | `du_lieu_luat_du_lieu_muc1.jsx` (`SEED_DULIEU_54`) | Ghi chú seed: chỉ cộng dòng XML3 **có** `MA_VAT_TU` + `THANH_TIEN_BV`; **khác** công thức `CLN-CHI-02` | *(audit tùy chọn)* |
| **Công khám + VTYT thay thế (XML5)** | `CK_15` | `luat_cong_kham_hardcoded.jsx` | Mục 11.6; XML5 `MA_VTYT` | *(chưa có fixture chuyên)* |

### Hàng dự phòng — **khi đã có** seed `DM-VTYT-*`

| MA_LUAT (ví dụ) | File seed / bảng | Ghi chú |
|-----------------|-------------------|---------|
| `DM-VTYT-…` | *(điền)* `du_lieu_luat_*.jsx` hoặc cơ chế rule động đội dự án dùng | Thêm dòng vào bảng trên + `test_xml/audit_*.json` + cập nhật [Chuan_hoa_kien_thuc_AI_giam_dinh_VTYT.md](./Chuan_hoa_kien_thuc_AI_giam_dinh_VTYT.md) §**0**. |

### Phân biệt nhanh (AI)

| Nhóm | Có trong repo hiện tại? | Ghi chú |
|------|-------------------------|---------|
| **`DM-VTYT-*`** (giám định theo danh mục TT 04 / VBHN 14) | **Chưa** — chỉ có sẵn **căn cứ pháp lý** khi có `ma_luat` | Không mô tả như đã “tra được từng mã” trong engine |
| **VTYT gắn DVKT** (`checkGhiChu`, `DVKT-OP-08`) | **Có** (nhánh DVKT no-code) | Vẫn là rule **DVKT**, không thay thế bảng điều kiện VTYT đầy đủ |
| **`MA_VAT_TU` trên XML3** | Có schema + parser | Điều kiện thanh toán theo Phụ lục: **văn bản BYT** + (sau này) seed |

**QA:** `npm run qa:audit-fixtures`, `npm run qa:on-off-match` sau khi thêm rule/audit — giống [Bang_neo_phien_huan_luyen_dvkt_va_engine.md](./Bang_neo_phien_huan_luyen_dvkt_va_engine.md).

**Bảng DVKT:** [Bang_neo_phien_huan_luyen_dvkt_va_engine.md](./Bang_neo_phien_huan_luyen_dvkt_va_engine.md) · **Bảng thuốc:** [Bang_neo_phien_huan_luyen_thuoc_va_engine.md](./Bang_neo_phien_huan_luyen_thuoc_va_engine.md)

---

*Cập nhật khi có dòng `DM-VTYT-*` đầu tiên trong audit hoặc trong seed.*
