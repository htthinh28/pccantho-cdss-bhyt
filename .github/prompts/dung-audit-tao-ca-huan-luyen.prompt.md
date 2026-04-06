---
name: "Dung Audit Tao Ca Huan Luyen"
description: "Dung khi can bien mot file audit JSON va neu co thi kem XML goc thanh mot case study huan luyen AI giams dinh BHYT co gia tri tai su dung."
argument-hint: "Nhap MA_LK, ten file audit, file XML, rule trong tam, hoac van de nghiep vu can day AI"
agent: "CDSS BHYT Agent"
model: "GPT-5 (copilot)"
tools: [read, search, execute, edit, todo]
---

Dung audit va du lieu XML trong repo de dung mot ca huan luyen AI giams dinh BHYT.

Yeu cau:

1. Xac dinh 1 hoac 2 rule trong tam thay vi om qua nhieu loi.
2. Doc audit truoc, sau do neu XML goc co trong repo thi doi chieu lai XML1/XML2/XML3 lien quan.
3. Tach ro:
   - du lieu da xac nhan
   - du lieu con thieu
   - ket luan tam thoi hay ket luan vung chac
4. Neu co tin hieu phu nhung chua du chung cu, phai noi ro la gia thuyet thay vi ket luan.
5. Tao case study trong `tai_lieu/` neu nguoi dung dang yeu cau tiep tuc xay bo tri thuc.

Trong cau tra loi cuoi phai co 4 phan:

- Van de trung tam
- Du lieu da xac nhan
- Ket luan nghiep vu
- Bai hoc rut ra cho AI