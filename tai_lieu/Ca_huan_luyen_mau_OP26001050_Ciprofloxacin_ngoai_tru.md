# CA HUAN LUYEN MAU OP26001050 - CIPROFLOXACIN NGOAI TRU VA CUM LOI KE DON/GIA

Phien ban tai lieu: 1.0  
Ngay cap nhat: 06/04/2026

## 1. Van de trung tam

Ca nay dung de day AI cach xu ly ho so ngoai tru co canh bao thuoc thuoc nhieu lop:

- chuan hoa ten thuoc tren don ngoai tru (`THUOC_436`)
- canh bao don gia vuot gia trung thau (`DM-THUOC-04`)
- canh bao lech tong tien thuoc (`XML_53`)

Muc tieu la tranh ket luan "mot loi tong quat", thay vao do tach ro theo nhom hanh chinh, tai chinh va nhat quan du lieu.

## 2. Du lieu da xac nhan

Nguon da dung:

- XML goc: `tai_nguyen/op/PC022209289_OP26001050.xml`
- Audit: `test_xml/audit_OP26001050_20260406_223422.json`

Thong tin ho so:

- `MA_LK`: `OP26001050`
- Kieu KCB: ngoai tru (`MA_LOAI_KCB = 01` theo du lieu audit)
- Chan doan lien quan tiet nieu: `N30.8`, `N34`
- Thuoc trong don:
  - `Ciprofloxacin` (`MA_THUOC: 40.227`)
  - `Partamol Tab.` (`MA_THUOC: 40.48`)
  - `SPAS-AGI` (`MA_THUOC: 40.922`)

Ket qua audit chinh:

- Tong canh bao: `7`
- Rule xuat hien:
  - `THUOC_436`: 3 dong thuoc
  - `DM-THUOC-04`: 1 dong (Partamol Tab.)
  - `XML_53`: 1 canh bao lech tong tien thuoc
  - `HC-06d`: 1 canh bao quyen loi BHYT
  - `HD_10`: 1 canh bao thieu chi so can lam sang

## 3. Du lieu con thieu hoac can doi chieu them

- Chua co bang gia trung thau noi bo day du trong bo ho so de doi chieu nguon goc gia.
- Chua co bo chung tu hoa don/quyet dinh duyet gia lien quan den dot dieu tri.
- Chua co phieu doi chieu ke toan de xac dinh nguyen nhan cu the cua `XML_53` (nhap sai, lam tron, hoac tinh sai nhom).

## 4. Ket luan nghiep vu

1. Day la ca ngoai tru co canh bao thuoc theo nhieu lop, trong do:
   - `THUOC_436` la nhom chuan hoa ten thuoc tren don, danh theo tung dong.
   - `DM-THUOC-04` la nhom rui ro tai chinh do don gia vuot gia trung thau noi bo.
   - `XML_53` la nhom lech nhat quan tong hop chi phi.
2. Khong nen danh dong 3 nhom tren thanh mot ket luan "chi dinh sai khang sinh".
3. Huong xu ly thuc hanh:
   - uu tien doi chieu chung tu gia va bang gia noi bo cho `DM-THUOC-04`
   - doi chieu so lieu XML1/XML2 va tong hop ke toan cho `XML_53`
   - chuan hoa ten thuoc theo yeu cau INN cho `THUOC_436`

## 5. Bai hoc rut ra cho AI

### 5.1. Bai hoc nghiep vu

- Ho so ngoai tru thuong co nhieu canh bao dong thoi; AI phai tach nhom canh bao theo ban chat truoc khi de xuat xu ly.

### 5.2. Bai hoc xu ly du lieu

- Neu mot rule lap lai tren nhieu dong (`THUOC_436`), can tong hop theo "mot van de lap" thay vi dem nhu nhieu van de doc lap.

### 5.3. Bai hoc ve muc do chac chan

- Voi canh bao tai chinh (`DM-THUOC-04`, `XML_53`), AI nen ket luan theo muc "can doi chieu them chung tu" neu chua co day du tai lieu gia/ke toan.

## 6. Prompt goi y de tai su dung

```
Ho so OP26001050 co cac canh bao THUOC_436, DM-THUOC-04, XML_53.
Hay:
1) Phan nhom tung canh bao theo ban chat nghiep vu.
2) Neu ro du lieu da du de ket luan va du lieu con thieu.
3) De xuat thu tu xu ly uu tien cho bo phan nghiep vu.
4) Viet ket luan ngan gon theo huong khong ket luan vuot du lieu.
```
