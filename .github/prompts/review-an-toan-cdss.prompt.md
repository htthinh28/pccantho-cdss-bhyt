---
name: "Review An Toan CDSS"
description: "Dung khi can review code trong repo CDSS BHYT theo kieu tim bug, rui ro, regression, storage issue, rule issue va thieu test truoc khi merge hoac deploy."
argument-hint: "Nhap file, commit, man hinh, rule, hoac pham vi can review"
agent: "CDSS BHYT Agent"
model: "GPT-5 (copilot)"
tools: [read, search, execute]
---

Thuc hien code review cho repo CDSS BHYT theo huong tim loi va rui ro, khong phai khen tong quan.

Yeu cau review:

1. Uu tien tim bug, regression, tac dong nghiep vu, rui ro storage, rui ro rule engine, va duong di dieu huong co the vo tinh bi doi.
2. Khi lien quan nghiep vu, doi chieu voi [dac ta he thong](../../tai_lieu/Dac_ta_he_thong_CDSS_BHYT_20260405.md) va ma nguon dang chay.
3. Neu thay loi, sap xep theo muc do nghiem trong va gan voi file/vi tri cu the.
4. Neu khong thay loi ro rang, noi ro da khong tim thay finding va neu test gap con thieu.

Trong cau tra loi cuoi:

- Dua findings truoc.
- Sau do moi neu cau hoi mo hoac gia dinh.
- Cuoi cung moi tom tat ngan neu can.