# Thẻ tri thức: Công văn 4262/BHXH-CSYT — thanh toán chi phí KCB BHYT

**Nguồn:** Bảo hiểm xã hội Việt Nam, số 4262/BHXH-CSYT, ngày 28/10/2016.

## Tóm tắt

Công văn hướng dẫn giải quyết vướng mắc thanh toán chi phí khám chữa bệnh BHYT, gồm 5 nhóm chính:

1. **Tiền khám & giường** (§1): DVKT chỉ định sẵn không kèm công khám; một chuyên khoa/lượt một công khám; ngoại trú sau nội trú không công khám đợt cấp thuốc; giường HSTC sau mổ; không TT giường khi thiếu chế độ nội trú.
2. **Một số DVKT** (§2): CT 2 vị trí + cản quang; Hút đờm; Ambu sơ sinh; **không TT đồng thời** (PL01); TMH 3 bộ phận; XN GPB; cùng bệnh phẩm; phiên tương đương; mã hóa PL02–04.
3. **VTYT** (§3): TT43/50 tương đương TT37 — VTYT ghi chú ngoài giá DVKT.
4. **Cùng chi trả > 6 LCS** (§4): thanh toán trực tiếp BN, cộng dồn 5 năm LT, giấy miễn CCT.
5. **Đa tuyến trẻ <6 tuổi** (§5): giấy khai sinh/chứng sinh.

## Mã quy tắc CDSS (built-in)

| Mã | Nội dung |
|----|----------|
| `CV4262-01` | §1.1 — DVKT chỉ định sẵn/chu kỳ: không công khám |
| `CV4262-02` | §1.2 — Một chuyên khoa/lượt: một công khám |
| `CV4262-21` | §2.1 — CT ngực+bụng có CQ: 1 ống → 1 CQ + 1 không CQ |
| `CV4262-23` | §2.3 — Ambu chỉ hồi sức sơ sinh |
| `CV4262-25` | §2.5 — Nội soi TMH gói vs đơn lẻ |
| `CV4262-PL01-*` | §2.4 — Phụ lục 01 không thanh toán đồng thời |

## Phụ lục 01 (rút gọn)

- SA ổ bụng ⟂ SA tiết niệu / TC phần phụ / Doppler ổ bụng
- Đặt NKQ, mổ, nội soi ⟂ Hút đờm
- Thận NT cấp cứu ⟂ catheter TM trung tâm
- Test hồi phục phế quản ⟂ Đo chức năng hô hấp
- Streptokinase màng phổi ⟂ chọc dò/tháo dịch màng phổi

## Kiểm tra

```bash
npm run qa:cv4262-thanhtoan
```
