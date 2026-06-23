# Thẻ tri thức: Công văn 3231/BYT-KCB — phạm vi hành nghề & thanh toán BHYT

**Nguồn:** Bộ Y tế, số 3231/BYT-KCB, ngày 27/05/2025.

## Tóm tắt

Công văn trả lời vướng mắc BHXH về **xác định phạm vi hành nghề** và **thanh toán chi phí KCB BHYT**, thay thế hướng dẫn tại mục 4.2 Công văn 129/BYT-KCB.

### Phạm vi hành nghề (Mục 1)

| Mục | Nội dung chính |
|-----|----------------|
| §1.1 | NTCK được quyết định cho phép NVYT thực hiện kỹ thuật đã đào tạo/chuyển giao bằng văn bản (NĐ 96/2023 Điều 10 k3). |
| §1.2 | Y sỹ đa khoa/YHCT được khám, chữa bệnh, kê đơn theo phạm vi. |
| §1.3 | BS YHCT và BS RHM **được khám bệnh** và BHYT **thanh toán tiền khám** dù Phụ lục VI/VIII không liệt kê "Khám bệnh". |
| §1.4 | Trong quá trình khám, người hành nghề **được chỉ định CLS** (XN, CĐHA, PTTT…) kể cả khi chưa có tên trong phụ lục phạm vi. |
| §1.5 | BS đa khoa tương đương phạm vi **Y khoa**; BS CK Lao theo PL V + PL IX; BS y học gia đình theo TT 21/2019. |
| §1.8 | Điều dưỡng có CCHN PHCN + văn bản NTCK được thực hiện kỹ thuật PL XIV; ghi đủ mã NVYT trong ekip (dấu `;`). |

### Thanh toán (Mục 2)

- **Không thanh toán** DVKT điều trị do **điều dưỡng hạng IV** thực hiện (đặc biệt PHCN) — thay CV 129.
- Pháp luật KCB **không dùng hạng điều dưỡng**; chỉ xét chứng chỉ hành nghề và phạm vi được cấp.

## Mã quy tắc CDSS (built-in)

| Mã | Nội dung |
|----|----------|
| `CV3231-02` | §2 — Điều dưỡng hạng IV thực hiện DVKT điều trị/PHCN: không thanh toán |
| `CV3231-13` | §1.3 — BS YHCT/RHM được khám & TT công khám (Info) |
| `CV3231-18` | §1.8 — Gợi ý ghi đủ mã NGUOI_THUC_HIEN trong ekip (không áp dụng công khám) |

## Tích hợp engine

- **LAYER 4** `dong_co_giam_dinh.jsx` → `giamDinhCv3231Bhyt`
- **DVKT-OP-03** `checkPhamVi`: mở rộng phạm vi CV3231 (đa khoa→101, công khám BS/Y sỹ, văn bản NTCK)

## Kiểm tra

```bash
npm run qa:cv3231-phamvi
```
