# CA HUAN LUYEN MAU OP26000282 - NHOM I10 TANG HUYET AP

Phien ban tai lieu: 1.0  
Ngay cap nhat: 06/04/2026

## 1. Van de trung tam

Huong dan AI phan tich ho so co `I10` la benh chinh va ket luan theo 3 lop:

1. lop chuyen mon (chi dinh/chong chi dinh)
2. lop hanh chinh ke don
3. lop tai chinh - ke toan

## 2. Nguon du lieu

- XML goc: `tai_nguyen/op/PC022515584_OP26000282.xml`
- Audit: `test_xml/audit_OP26000282_20260406_224330.json`

## 3. Du lieu da xac nhan

- `MA_LK`: `OP26000282`
- `MA_LOAI_KCB`: `01` (ngoai tru)
- `MA_BENH_CHINH`: `I10`
- `MA_BENH_KT`: `J02;E78.2;K21`

Danh sach thuoc chinh:

- `40.155` - Cepmox-Clav 875 mg/125 mg
- `40.30.496` - Troysar AM (thuoc tim mach phoi hop)
- `40.549` - Insuact 20
- `40.48` - Partamol Tab.

## 4. Ket qua audit trong tam

Tong canh bao: `9`

- `DM-THUOC-04`: 2 canh bao (don gia vuot gia trung thau noi bo)
- `THUOC_311`: 1 canh bao (Paracetamol sai nhom chan doan theo rule)
- `THUOC_436`: 5 canh bao (ten thuoc ngoai tru chua dung chuan INN)
- `XML_53`: 1 canh bao (lech tong tien thuoc XML1 va XML2)

## 5. Dien giai theo nhom chuyen mon I10

### 5.1. Lop chuyen mon

- Ho so co `I10` ro rang -> truc tim mach hop le de xet chi dinh thuoc ha ap.
- Cac canh bao hien co khong cho thay xung dot truc tiep "I10 voi thuoc ha ap" trong audit nay.
- Co 1 canh bao `THUOC_311` lien quan Paracetamol, thuoc nhom trieu chung, khong phai truc chinh I10.

### 5.2. Lop hanh chinh ke don

- `THUOC_436` xuat hien 5 lan, cho thay van de chuan hoa ten thuoc ngoai tru (INN).
- Day la loi quy trinh ke don/du lieu, khong dong nghia sai chi dinh I10.

### 5.3. Lop tai chinh - ke toan

- `DM-THUOC-04` (2 dong) va `XML_53` cho thay rui ro tai chinh ro net.
- Day la lop can uu tien doi chieu bang gia noi bo va so lieu tong hop truoc khi quyet toan.

## 6. Ket luan nghiep vu mau

1. Ve chuyen mon I10: ho so co truc tim mach ro rang, khong co bang chung tu audit nay cho thay sai chi dinh toan bo nhom ha ap.
2. Rui ro chinh hien tai nam o:
   - chuan hoa don ngoai tru (`THUOC_436`)
   - gia thuoc vuot gia trung thau (`DM-THUOC-04`)
   - lech tong hop tien thuoc (`XML_53`)
3. Huong xu ly uu tien:
   - doi chieu gia trung thau noi bo tung dong
   - doi chieu `T_THUOC` XML1 voi tong `THANH_TIEN_BV` XML2
   - chuan hoa ten INN trong don ngoai tru

## 7. Bai hoc rut ra cho AI

### 7.1. Bai hoc chuyen mon

- Khi `I10` la benh chinh, AI phai khoi dong phan tich tim mach truoc, khong de canh bao hanh chinh lam lech truc phan tich.

### 7.2. Bai hoc giam dinh

- Ho so co the "dung huong chuyen mon" nhung van "sai lop thanh toan/du lieu".

### 7.3. Bai hoc ket luan

- Ket luan tot phai ghi theo lop, tranh ket luan mot cau chung chung cho toan bo ho so.

## 8. Prompt tai su dung

```text
Phan tich ho so OP26000282 theo nhom I10:
1) Xac dinh vai tro I10 va cac benh kem.
2) Tach canh bao theo 3 lop: chuyen mon, hanh chinh, tai chinh.
3) Cho ket luan uu tien xu ly theo thu tu rui ro.
4) Neu ro phan nao da du chung cu va phan nao can doi chieu them.
```
