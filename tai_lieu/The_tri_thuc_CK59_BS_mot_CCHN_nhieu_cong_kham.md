# Thẻ tri thức: CK_59 — BS một CCHN, nhiều loại công khám

## Mục đích

Cảnh báo **xuất toán** khi **một bác sỹ** (gom theo **một mã CCHN/GPHN**) thực hiện **nhiều loại công khám thuộc nhiều chuyên khoa** trong **cùng một lượt khám** (cùng hồ sơ `MA_LK`).

## Logic

| Bước | Nội dung |
|------|----------|
| 1 | Lọc dòng XML3 **có MA_DICH_VU thuộc DM_KHAM** (danh mục công khám BV đính kèm) và có thanh toán BHYT (`THANH_TIEN_BH` > 0). **Không** áp dụng DVKT/CLS/thủ thuật ngoài danh mục — không dùng heuristic `MA_NHOM=1` hay tên chứa "khám". |
| 2 | Xác định người thực hiện: `NGUOI_THUC_HIEN` → `MA_BAC_SI` → `XML1.MA_BS_KHAM`. |
| 3 | Gom theo **CCHN** (`MAP_NHAN_SU.MACCHN` hoặc mã giống CCHN trên XML). |
| 4 | Trong mỗi nhóm CCHN: nếu có **≥ 2 mã công khám khác nhau** và **≥ 2 tiền tố chuyên khoa** (`XX.YY` đầu `MA_DICH_VU`, ví dụ `02.03` vs `15.28`) → cảnh báo từ dòng thứ 2 trở đi. |

## Mã quy tắc

- **MA_LUAT:** `CK_59`
- **Tab ON/OFF:** `LUAT_CONG_KHAM`
- **Mức độ:** Warning (`⛔ [XUẤT TOÁN]`)
- **Engine:** `giamDinhBsMotCchnNhieuChuyenKhoaCongKham` — LAYER 4 trong `dong_co_giam_dinh.jsx`

## Phân biệt với quy tắc liên quan

| Mã | Khác biệt |
|----|-----------|
| `CK_58` | Nhiều công khám **cùng khoa lâm sàng** (`MA_KHOA`), không gom theo CCHN. |
| `CV4262-02` | Nhiều công khám **cùng MA_KHOA** trong một lượt (heuristic Công văn 4262). |
| `HC_104` | BN khám **> 2 chuyên khoa/ngày** (theo `MA_NHOM`), không theo BS/CCHN. |

## Danh mục DM_KHAM

- Seed repo: `ma_nguon/tien_ich/du_lieu_dm_cong_kham_seed.jsx` — **8 nhóm công khám** (mã nhóm `XX.YY`):
  - `02.03` Khám Nội tổng hợp · `02.13` Da liễu · `03.18` Nhi · `10.19` Ngoại tổng hợp
  - `13.27` Phụ sản · `14.30` Mắt · `15.28` Tai mũi họng · `16.29` Răng hàm mặt
- Khớp theo **tiền tố nhóm**: XML3 `02.03.0135` thuộc DM khi catalog có `02.03`. DVKT ngoài 8 nhóm (vd. `01.0002.1778`) **không** áp dụng CK_59.
- Runtime: `DANH_MUC_CONG_KHAM_BV` trên máy (nếu import thêm).
- Bổ sung từ Excel BV (mã đầy đủ hoặc nhóm):

```bash
npm run catalog:dm-cong-kham -- "C:/path/to/Danh muc dich vu kham.xls"
```

## Kiểm tra

```bash
npm run qa:ck59-cong-kham-cchn
```
