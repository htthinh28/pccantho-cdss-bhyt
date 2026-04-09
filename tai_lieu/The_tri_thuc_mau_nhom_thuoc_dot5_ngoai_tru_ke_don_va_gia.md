# THE TRI THUC MAU NHOM THUOC DOT 5 - NGOAI TRU KE DON VA GIA THUOC

Phien ban tai lieu: 1.0  
Ngay cap nhat: 06/04/2026

## 1. Muc tieu

Dot 5 tap trung vao nhom canh bao thuoc ngoai tru de day AI 3 nang luc:

- phan biet loi hanh chinh/ke toan voi loi chi dinh dieu tri
- doc canh bao theo tung dong thuoc thay vi ket luan gom mot lan
- neu ro muc do chac chan khi du lieu con thieu

## 2. Nguon tri thuc

- `test_xml/audit_OP26001050_20260406_223422.json`
- `tai_nguyen/op/PC022209289_OP26001050.xml`
- Rule lien quan trong audit:
  - `THUOC_436`
  - `DM-THUOC-04`
  - `XML_53`
  - `HC-06d`
  - `HD_10`

## 3. The tri thuc mau dot 5

---

## The 25. Kiem tra ten thuoc INN trong don ngoai tru

### 1. Thong tin chung

- Chu de: ten thuoc trong don ngoai tru
- Nguon: `THUOC_436`
- Kieu suy luan: hanh chinh + chat luong don thuoc

### 2. Menh de nghiep vu cot loi

- Don ngoai tru phai the hien ten chung quoc te (INN) hoac ten thuong mai kem INN trong ngoac.

### 3. Pham vi ap dung

- Dieu kien: `XML1.MA_LOAI_KCB == '1'`
- Dau hieu canh bao: `XML2.TEN_THUOC` khong chua cau truc `(...)`

### 4. Du lieu can kiem tra

- `XML1.MA_LOAI_KCB`
- `XML2.TEN_THUOC` theo tung dong

### 5. Cach suy luan dung

- Rule nay danh tren tung dong thuoc, co the xuat hien nhieu canh bao trong mot ho so.
- Khong ket luan la "chi dinh sai" chi tu canh bao nay; day la yeu cau chuan hoa ten thuoc.

### 6. Bai hoc cho AI

- Khi thay nhieu canh bao cung ma rule, can tong hop theo nhom "loi lap theo dong" thay vi coi la nhieu loi ban chat khac nhau.

---

## The 26. Don gia thuoc vuot gia trung thau noi bo

### 1. Thong tin chung

- Chu de: kiem tra gia thuoc
- Nguon: `DM-THUOC-04`
- Kieu suy luan: tai chinh + thanh toan BHYT

### 2. Menh de nghiep vu cot loi

- Don gia dong thuoc khai bao vuot gia trung thau noi bo da phe duyet tai co so KCB se la canh bao muc do cao.

### 3. Pham vi ap dung

- Rule danh tren tung dong `XML2`
- Can doi chieu ma thuoc, don gia va thong tin gia trung thau noi bo

### 4. Du lieu can kiem tra

- `XML2.MA_THUOC`
- `XML2.DON_GIA`
- bang gia trung thau noi bo tai co so

### 5. Cach suy luan dung

- Neu canh bao xuat hien, AI phai uu tien ket luan "rui ro tai chinh can doi chieu hoa don/chung tu".
- Khong tu dong dien giai thanh loi an toan dieu tri.

### 6. Bai hoc cho AI

- Phai tach ro "gia khong hop le" voi "thuoc khong hop chi dinh". Hai nhom nay co huong xu ly khac nhau.

---

## The 27. Lech tong tien thuoc XML1 va cong don XML2

### 1. Thong tin chung

- Chu de: doi chieu tong hop chi phi thuoc
- Nguon: `XML_53`
- Kieu suy luan: nhat quan du lieu, ke toan ho so

### 2. Menh de nghiep vu cot loi

- Tong `XML1.T_THUOC` phai khop voi tong `THANH_TIEN_BV` cua cac dong thuoc phu hop tai `XML2`.

### 3. Du lieu can kiem tra

- `XML1.T_THUOC`
- cac dong `XML2` thuoc nhom thuoc duoc tinh tong
- cong thuc tinh tong ma engine dang ap dung

### 4. Cach suy luan dung

- Day la canh bao nhat quan du lieu, chua du de ket luan nguyen nhan cuoi cung.
- AI phai ghi ro can doi chieu bo ba: XML1, XML2 va bang tong hop thanh toan.

### 5. Bai hoc cho AI

- Ket luan dung dang: "co dau hieu lech so lieu canh bao", khong nen khang dinh ngay la gian lan neu chua doi chieu chung tu goc.

## 4. Ket luan huan luyen dot 5

Thu tu doc canh bao de han che nham lan:

1. Tach nhom canh bao thanh toan/tai chinh (`DM-THUOC-04`, `XML_53`).
2. Tach nhom canh bao chuan hoa don ngoai tru (`THUOC_436`).
3. Sau do moi tong hop danh gia xu ly theo muc do rui ro va do chac chan du lieu.
