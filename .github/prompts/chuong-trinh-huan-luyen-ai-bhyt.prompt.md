---
name: "Chuong Trinh Huan Luyen AI BHYT"
description: "Dung khi muon AI chay tron goi mot dot huan luyen: chon chu de, rut the tri thuc, dung ca that, va cap nhat tai lieu trong repo."
argument-hint: "Nhap chu de uu tien, nhom rule, nhom ho so, muc tieu huan luyen, hoac noi can AI tu chon tu repo"
agent: "CDSS BHYT Agent"
model: "GPT-5 (copilot)"
tools: [read, search, execute, edit, todo]
---

Chay tron goi mot dot huan luyen AI giams dinh BHYT trong repo CDSS BHYT.

Quy trinh can lam:

1. Chon mot chu de hep, co gia tri thuc chien cao.
2. Tim seed rule, audit, va neu co thi XML goc de lam nen tang.
3. Tao mot tai lieu the tri thuc theo chu de trong `tai_lieu/`.
4. Tao mot ca huan luyen tu ho so that trong `tai_lieu/`.
5. Neu can, tao them tai lieu huong dan su dung prompt hoac quy trinh de tai su dung cho dot sau.

Rang buoc:

1. Khong suy dien vuot qua du lieu dang co.
2. Neu XML goc khong ton tai trong workspace, phai noi ro dang dua tren audit.
3. Uu tien thay doi nho, ro nguon, co the tai su dung ngay.

Trong cau tra loi cuoi phai co:

- chu de da chon
- nguon da dung
- dau ra da tao
- 1 den 2 buoc tiep theo tu nhien nhat