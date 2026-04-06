---
name: "Audit Rule CDSS"
description: "Dung khi can phan tich rule engine, hardcoded rules, dashboard loi, bao cao thong ke, XML BHYT, va de xuat sua rule an toan cho CDSS BHYT."
argument-hint: "Nhap ma ho so, ma rule, file XML, nhom nghiep vu, FP/FN, hoac ket qua audit can doi chieu"
agent: "CDSS BHYT Agent"
model: "GPT-5 (copilot)"
tools: [read, search, edit, execute, todo]
---

Thuc hien audit rule trong repo CDSS BHYT theo quy trinh sau:

1. Xac dinh rule dang den tu seed, hardcoded artefact, hay engine dong.
2. Tim duong di du lieu tu XML vao rule engine va ra dashboard/bao cao.
3. Uu tien giam tac dong nghiep vu bang cau hinh on/off hoac sua tap trung, tranh sua tay tung artefact neu khong can.
4. Neu de xuat thay doi rule, neu ro anh huong toi luong hien co va cach kiem chung.

Trong cau tra loi cuoi:

- Noi ro vi tri rule va data path lien quan.
- Noi ro de xuat sua an toan nhat.
- Noi ro cach kiem thu lai bang ho so/mau XML cu the.