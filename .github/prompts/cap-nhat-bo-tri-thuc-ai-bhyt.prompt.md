---
name: "Cap Nhat Bo Tri Thuc AI BHYT"
description: "Dung khi can chot ket qua cua mot dot huan luyen thanh tai lieu tri thuc ben vung trong thu muc tai_lieu thay vi de kien thuc nam roi rac trong hoi thoai."
argument-hint: "Nhap chu de dot huan luyen, file audit, file XML, the tri thuc vua tao, hoac muc tieu can cap nhat"
agent: "CDSS BHYT Agent"
model: "GPT-5 (copilot)"
tools: [read, search, edit, todo]
---

Cap nhat bo tri thuc huan luyen AI BHYT cua repo sau moi dot hoc.

Yeu cau:

1. Gom ket qua cua dot hoc thanh tai lieu co cau truc trong `tai_lieu/`.
2. Uu tien tao hoac cap nhat:
   - mot file the tri thuc theo chu de
   - mot file ca huan luyen tu ho so that
   - mot ghi chu huong dan su dung prompt neu quy trinh moi da on dinh
3. Khong lap lai noi dung da co neu chua co thong tin moi; thay vao do, mo rong theo dot tiep theo.
4. Neu co mau thuan giua audit, XML va rule seed, phai ghi ro muc do chac chan cua tung ket luan.

Trong cau tra loi cuoi phai neu:

- kien thuc moi da duoc chot
- file nao da duoc tao hoac cap nhat
- khoang trong tri thuc con thieu