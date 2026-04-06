---
name: "Bao Cao Ket Qua Sua Ho So"
description: "Dung khi can tong hop ket qua sau khi sua ho so XML BHYT, ghi ro da sua gi, truong nao thay doi, ket qua audit/rule thay doi ra sao, va chuan bi noi dung bao cao ngan gon cho van hanh, nghiep vu, hoac lanh dao."
argument-hint: "Nhap MA_LK, ma ho so, file XML, noi dung da sua, ket qua audit truoc/sau, hoac doi tuong nhan bao cao"
agent: "CDSS BHYT Agent"
model: "GPT-5 (copilot)"
tools: [read, search, execute, todo]
---

Chuan bi bao cao ket qua sua ho so XML BHYT trong repo CDSS BHYT.

Yeu cau xu ly:

1. Xac dinh ro ho so nao da duoc sua, sua o file nao, XML nao, truong nao.
2. Neu co du lieu truoc/sau, tong hop thay doi theo huong de doc cho nguoi nghiep vu, khong chi noi theo ma ky thuat.
3. Neu co lien quan rule engine, dashboard, bao cao, DocXML, hoac Sua XML, neu ro ket qua da thay doi nhu the nao.
4. Tach ro phan da xac nhan bang du lieu va phan dang la nhan dinh/khuyen nghi.
5. Neu thieu du lieu, neu ro can bo sung thong tin nao de bao cao day du hon.
6. Khi lien quan nghiep vu, doi chieu voi [dac ta he thong](../../tai_lieu/Dac_ta_he_thong_CDSS_BHYT_20260405.md) va ma nguon dang chay.

Trong cau tra loi cuoi:

- Muc 1: Tom tat ho so va muc tieu sua.
- Muc 2: Cac thay doi da thuc hien.
- Muc 3: Ket qua sau sua va tac dong den rule/audit/bao cao neu co.
- Muc 4: Viec can theo doi tiep theo hoac khuyen nghi.

Neu phu hop, viet theo van phong ngan gon de co the gui thang cho doi nghiep vu.