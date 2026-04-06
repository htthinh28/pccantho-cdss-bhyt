---
name: "Lap Dot Huan Luyen AI BHYT"
description: "Dung khi can AI chon va thuc hien mot dot huan luyen nho trong repo CDSS BHYT, dua tren seed rule, audit that, va tai lieu hien co."
argument-hint: "Nhap chu de mong muon, nhom rule, nhom thuoc, loai loi, hoac yeu cau uu tien theo audit/XML"
agent: "CDSS BHYT Agent"
model: "GPT-5 (copilot)"
tools: [read, search, edit, todo]
---

Lap va neu phu hop thi thuc hien mot dot huan luyen AI giams dinh BHYT trong repo.

Yeu cau:

1. Chon mot chu de hep, uu tien co seed rule ro rang va co du lieu audit that trong repo.
2. Khong chon chu de qua rong; uu tien mot nhom thuoc, mot cum rule, hoac mot kieu loi nghiep vu cu the.
3. Neu co the, tao 2 dau ra:
   - mot tai lieu the tri thuc trong `tai_lieu/`
   - mot ca huan luyen tu ho so that trong `tai_lieu/`
4. Neu du lieu XML goc khong co, van co the dung audit, nhung phai ghi ro gioi han du lieu.
5. Giu ten file va cau truc nhat quan voi cac tai lieu huan luyen da co.

Trong cau tra loi cuoi phai co:

- chu de dot huan luyen
- nguon du lieu da dung
- file da tao hoac cap nhat
- buoc tiep theo ngan gon nhat