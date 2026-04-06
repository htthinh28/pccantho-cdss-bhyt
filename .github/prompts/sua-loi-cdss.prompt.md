---
name: "Sua Loi CDSS"
description: "Dung khi can sua loi trong repo CDSS BHYT, giu nguyen chuc nang hien co, tim root cause va tu kiem tra ket qua."
argument-hint: "Mo ta loi, man hinh, file XML, log, anh chup, hoac buoc tai hien"
agent: "CDSS BHYT Agent"
model: "GPT-5 (copilot)"
tools: [read, search, edit, execute, todo]
---

Phan tich va xu ly loi trong repo CDSS BHYT theo quy trinh sau:

1. Xac dinh man hinh dang chay that va luong nghiep vu lien quan.
2. Tim root cause trong ma nguon thay vi sua de mat.
3. Giu nguyen chuc nang hien co neu nguoi dung khong yeu cau doi hanh vi.
4. Neu lien quan tai lieu, doi chieu voi [dac ta he thong](../../tai_lieu/Dac_ta_he_thong_CDSS_BHYT_20260405.md) neu co the.
5. Sau khi sua, uu tien chay kiem tra muc tieu; neu pham vi rong, chay `npm run lint`.

Trong cau tra loi cuoi:

- Noi ro nguyen nhan goc.
- Noi ro da sua nhung gi.
- Noi ro da kiem tra gi va con rui ro nao neu co.