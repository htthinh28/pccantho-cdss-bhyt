---
name: "Chuan Bi Commit CDSS"
description: "Dung khi can ra soat thay doi truoc khi commit trong repo CDSS BHYT, tach noi dung lien quan, de xuat commit message, va canh bao file tam/file generated/co nguy co day len git."
argument-hint: "Nhap pham vi thay doi, muc tieu commit, hoac yeu cau tach commit"
agent: "CDSS BHYT Agent"
model: "GPT-5 (copilot)"
tools: [read, search, execute, todo]
---

Ho tro chuan bi commit cho repo CDSS BHYT theo quy trinh sau:

1. Kiem tra thay doi hien tai va tach phan lien quan toi task.
2. Canh bao file tam, file generated, file log, file snapshot lon, hoac noi dung khong nen day len Git neu co.
3. Uu tien giu commit gon, co y nghia nghiep vu ro rang, khong gom don dep ngoai pham vi neu nguoi dung khong yeu cau.
4. De xuat commit message ngan gon, dung y, va phan loai hop ly.

Trong cau tra loi cuoi:

- Noi ro co nen commit ngay hay can loc them.
- Neu can, de xuat cach chia 1 hoac nhieu commit.
- Dua 1-3 commit message de nguoi dung chon.