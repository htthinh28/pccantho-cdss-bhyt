# THE TRI THUC MAU NHOM CHUYEN MON I10 - TANG HUYET AP (DOT 1)

Phien ban tai lieu: 1.3  
Ngay cap nhat: 06/04/2026

## 1. Muc tieu

Dot nay huan luyen AI theo truc chuyen mon `I10` (tang huyet ap), tap trung vao:

- doc dung quan he giua `MA_BENH_CHINH` va `MA_BENH_KT`
- doi chieu chi dinh/chong chi dinh cua thuoc tim mach
- tach ro loi chuyen mon voi loi hanh chinh, gia thuoc, ke toan

## 2. Nguon tri thuc

- `ma_nguon/tien_ich/du_lieu_luat_thuoc_muc8.jsx` (cum `THUOC_32` den `THUOC_38`)
- `tai_lieu/The_tri_thuc_mau_nhom_thuoc_dot3_tim_mach.md`
- `test_xml/audit_OP26000282_20260406_224330.json`
- `tai_nguyen/op/PC022515584_OP26000282.xml`
- Khuyen cao VSH/VNHA 2022 (tom tat): `tang huyet ap.pdf` (tai lieu do nguoi dung cung cap)
- Huong dan AHA/ACC va cac hoi lien quan (2025), *Circulation*: [doi:10.1161/CIR.0000000000001356](https://www.ahajournals.org/doi/10.1161/CIR.0000000000001356) — thay the huong dan ACC/AHA 2017; ban tom luoc trong `The I10-7` phuc vu **huan luyen / doi chieu quoc te**, khong tu dong thay quy dinh BHYT hay VSH neu chua co chi dao noi bo.

## 3. Khung suy luan cho ho so I10

AI phai di theo thu tu:

1. Xac dinh `I10` nam o benh chinh hay benh kem.
2. Neu co `I10`, mo cum rule tim mach va thuoc ha ap.
3. Kiem tra benh kem nguy co cao (vi du: `I95.1`, `O21`, `N18.4`, `N18.5`, `K72`) de danh gia chong chi dinh.
4. Cuoi cung moi tong hop nhom loi hanh chinh/ke toan (INN, gia trung thau, lech tong tien).

## 4. The tri thuc mau I10

---

## The I10-1. Nhan dien truc chuyen mon tang huyet ap

### Menh de cot loi

- Co `I10` trong `MA_BENH_CHINH` hoac `MA_BENH_KT` la dau hieu can bat che do phan tich tim mach.

### Du lieu can kiem tra

- `XML1.MA_BENH_CHINH`
- `XML1.MA_BENH_KT`
- `XML1.CHAN_DOAN_VAO`, `XML1.CHAN_DOAN_RV`

### Cach suy luan dung

- Neu `I10` la benh chinh -> tim mach la truc phan tich chinh.
- Neu `I10` la benh kem -> tim mach la benh nen, can dieu chinh ket luan an toan dieu tri.

---

## The I10-2. Kiem tra chi dinh thuoc ha ap theo ICD10

### Menh de cot loi

- Thuoc nhom ha ap chi hop le khi co bang chung tang huyet ap (`I10`) hoac mo ta tuong duong.

### Rule tham chieu

- `THUOC_33` (cho `40.30.501`)
- `THUOC_36` (cho `40.491`)
- `THUOC_38` (cho `40.30.497`)

### Cach suy luan dung

- Khong co `I10` trong ICD va khong co mo ta tang huyet ap -> nguy co xuat toan theo chi dinh.
- Co `I10` -> uu tien xac nhan chi dinh, sau do moi kiem tra tiep lop chong chi dinh/lieu.

---

## The I10-3. Kiem tra lop chong chi dinh trong ca tang huyet ap

### Menh de cot loi

- Co `I10` khong dong nghia voi thanh toan tu dong. Van phai soat ma benh kem nguy co.

### Rule tham chieu

- `THUOC_32`, `THUOC_35`, `THUOC_37`

### Cum ma nguy co can uu tien

- `I95.1` (ha huyet ap tu the)
- `O21` (thai ky)
- `N18.4`, `N18.5` (suy than nang)
- `K72` (suy gan)

### Cach suy luan dung

- Co ma nguy co -> nang muc canh bao chuyen mon, khong ket luan "an toan" du chi dinh dung.

---

## The I10-4. Tach nhom loi chuyen mon va nhom loi hanh chinh/tai chinh

### Menh de cot loi

- Trong ca `I10`, co the dong thoi co:
  - loi chuyen mon (chi dinh/chong chi dinh)
  - loi hanh chinh ke don (`THUOC_436`)
  - loi gia thuoc (`DM-THUOC-04`)
  - loi ke toan tong hop (`XML_53`)

### Cach suy luan dung

- Khong dung loi hanh chinh de phu dinh chi dinh chuyen mon.
- Khong dung chi dinh dung de bo qua loi gia/ke toan.

---

## The I10-5. Nguong chan doan va muc tieu dieu tri theo VSH/VNHA 2022

### Menh de cot loi

- Chan doan THA tai phong kham: `HATT >= 140` va/hoac `HATTr >= 90`.
- HA binh thuong-cao (tien THA): `130-139/85-89`.
- Con THA: `>= 180/120`, can danh gia ton thuong co quan dich de xu tri khan cap/cap cuu.

### Nguong ngoai phong kham can nho

- HATN nguong THA: `>= 135/85`
- HALT 24h nguong THA: `>= 130/80`

### Muc tieu dieu tri can uu tien trong giam dinh

- THA khong benh dong mac: muc tieu phong kham thuong den `<140/80` (co the ha den `<130/80` neu dung nap).
- THA co benh dong mac/nguy co cao: uu tien muc tieu `<130/80` neu dung nap.
- Tuoi cao can ca the hoa muc tieu theo dung nap va tinh trang gia yeu.

### Cach suy luan dung

- Khong ket luan "that bai dieu tri" chi dua 1 lan do HA.
- Can doi chieu boi canh: tuoi, benh dong mac, dung nap, va du lieu HATN/HALT neu co.

---

## The I10-6. Chien luoc thuoc nen cho nhom I10 (tham chieu huan luyen)

### Menh de cot loi

- Khuyen cao VSH/VNHA 2022 uu tien phoi hop som, lieu thap:
  - `A + C` hoac `A + D`
  - neu can: `A + C + D`
- Trong do:
  - `A`: UCMC hoac CTTA
  - `C`: chen kenh canxi
  - `D`: loi tieu (uu tien thiazide-like)

### Diem canh bao quan trong

- Khong khuyen cao phoi hop 2 thuoc uc che he RAS cung luc.
- Thai ky: chong chi dinh nhom uc che RAS (UCMC/CTTA/uc che renin truc tiep/MRA).

### Cach suy luan dung

- Neu ho so co thuoc ha ap, AI uu tien doi chieu xem co di dung truc A/C/D va co vi pham chong chi dinh theo benh kem khong.
- Van phai tach rieng loi ke don INN, gia thuoc, tong hop chi phi (khong tron vao ket luan chuyen mon I10).

---

## The I10-7. Phan loai HA va muc tieu dieu tri theo AHA/ACC 2025 (*Circulation*)

Nguon day du: [10.1161/CIR.0000000000001356](https://www.ahajournals.org/doi/10.1161/CIR.0000000000001356) (ban huong dan chung ve phong ngua, phat hien, danh gia va quan ly THA nguoi lon, 2025).

### Menh de cot loi

- Huong dan 2025 **thay the** ban ACC/AHA 2017; nhan manh tiep can **theo nguy co tim mach**, bo sung cong cu **PREVENT** (uoc tinh nguy co 10 nam) khi can quyet dinh dieu tri o vung HA “vua phai”.
- Phan loai HA (trung binh, thuong la trung binh nhieu lan do) trong ban huong dan:
  - **Binh thuong**: `<120/80`
  - **Cao binh thuong (Elevated)**: HATT `120–129` **va** HATTr `<80`
  - **THA giai doan 1**: HATT `130–139` **hoac** HATTr `80–89`
  - **THA giai doan 2**: HATT `>=140` **hoac** HATTr `>=90`
- **Muc tieu dieu tri tong quat**: uu tien dat **`<130/80`** cho nguoi lon, co **ca the hoa** khi benh nhan cham soc dai han / du kien song gioi han / hoac thai ky (theo phan huong dan rieng trong tai lieu goc).

### Khoi thuoc: khi nao xem xet thuoc (tom tat de huan luyen)

- **Bat dau thuoc** khi HA trung binh **`>=140/90`**, **hoac**
- Khi **`>=130/80`** neu co mot trong cac dieu kien: benh tim mach lam sang, dot quy/TIA truoc day, dai thao duong, benh than man, **hoac** nguy co tim mach 10 nam **`>=7.5%`** theo **PREVENT** (tuy ban tom tat huong dan).
- Voi nguoi **`130–139/80–89`** ma **nguy co thap hon** (<7.5%): thuong **uu tien doi song 3–6 thang** truoc khi xem xet thuoc neu HA van khong dat.

### So sanh nhanh voi VSH/VNHA 2022 (trong giam dinh / huan luyen)

| Noi dung | VSH/VNHA 2022 (file I10-5) | AHA/ACC 2025 (I10-7) |
|----------|----------------------------|----------------------|
| Chan doan THA phong kham (nguong chinh) | `>=140/90` | Giai doan 2: `>=140/90`; giai doan 1: `130–139` hoac `80–89` |
| Tien THA / cao binh thuong | `130–139/85–89` | Elevated `120–129/<80`; Stage 1 nhu tren |
| Muc tieu dieu tri | `<140/80` hoac chat hon `<130/80` tuy dong mac | Uu tien `<130/80` tong quat, co ca the hoa |
| Tiep can quyet dinh thuoc | Theo phac do VN | Them **nguy co** (PREVENT, dong mac) o vung `130–139/80–89` |

### Cach suy luan dung (BHYT + CDSS)

- **Giam dinh thanh toan / rule seed**: van lay **XML + luat noi bo + VSH/tai lieu BYT** lam chuan hanh dong (muc 7.1).
- **Giai thich chuyen mon / dao tao AI**: co the trich **AHA/ACC 2025** de noi ro vi sao mot ho so “HA vua phai” van co the can dieu tri manh hon o he thong tiep can theo nguy co My — tranh nham la mau thuan “sai” voi VN ma la **khac nguon huong dan**.
- Khong ket luan “sai chi dinh” chi vi lech so voi AHA neu **rule BHYT va ICD** chua gan voi nguong do.

## 5. Prompt huan luyen de tai su dung

```text
Phan tich ho so theo nhom I10:
1) Xac dinh vai tro I10 (benh chinh hay benh kem).
2) Doi chieu thuoc tim mach voi rule chi dinh/chong chi dinh.
3) Tach rieng nhom loi hanh chinh, gia thuoc, ke toan.
4) Ket luan theo 3 lop: chuyen mon, hanh chinh, tai chinh.
```

## 6. Ket luan dot I10-1

Sau dot nay, AI can dat:

1. Nhan dien dung cau truc benh hoc I10 trong ho so.
2. Ket luan dung lop chi dinh/chong chi dinh cua thuoc ha ap.
3. Khong tron lan giua loi chuyen mon va loi thanh toan/du lieu.

## 7. De xuat thong nhat (ap dung cho toan bo huan luyen I10 / ICD10)

Muc nay thong nhat cac huong da lam truoc do thanh **mot quy uoc duy nhat** cho AI va nguoi dieu phoi huan luyen.

### 7.1. Thu tu uu tien nguon chan ly

Khi ket luan giu lieu ho so BHYT, ap dung thu tu sau (tu cao xuong thap):

1. **Du lieu XML + audit thuc** trong repo (`tai_nguyen/`, `test_xml/audit_*.json`) — nguon su that ve ho so dang xet.
2. **Rule engine dang chay** — `du_lieu_luat_thuoc_muc8.jsx` va cac luat lien quan: ket qua canh bao la hanh vi he thong that.
3. **Khuyen cao chuyen mon trong nuoc** (VSH/VNHA 2022, file `tang huyet ap.pdf`) — dung de **giai thich nghiep vu, phan bien false positive/false negative, huong dieu tri/huan luyen**, khong thay the tu dong rule thanh toan neu chua sua ma.
4. **Khuyen cao quoc te bo sung** (AHA/ACC 2025, `The I10-7`) — chi de **doi chieu, cap nhat tri thuc, giai thich da nguon**; khong tu dong thay the (3) neu chua co chi dao noi bo.
5. **Tai lieu BHYT thanh toan** (15/VBHN-BYT, TT...) — khi rule hoac canh bao da dan chung trong `co_so_phap_ly` cua audit.

Neu **khuyen cao chuyen mon** va **dieu kien rule** khac nhau: AI phai neu ro hai tang — *theo engine hien tai* va *theo huong chuyen mon VSH* — va ghi *can ra soat rule / cap nhat seed* neu don vi dong y. Neu khac **VSH** va **AHA/ACC 2025**: ghi ro *hai khung huong dan* (trong nuoc vs quoc te), khong gop mot dong.

### 7.2. Luong suy luan thong nhat cho moi ho so co I10

Gom mot day duy nhat, khong tach nhanh tuy hung:

| Buoc | Noi dung |
|------|----------|
| 1 | Doc `MA_BENH_CHINH`, `MA_BENH_KT`, mo ta chan doan (vao/ra) — tham `The_tri_thuc_mau_nhom_chuyen_mon_icd10_dot1.md` |
| 2 | Gan vai tro I10: chinh / kem / nen |
| 3 | Doi chieu thuoc ha ap voi seed `THUOC_32`–`THUOC_38` (chi dinh, chong chi dinh, lieu/tan suat) |
| 4 | Can bang voi VSH 2022 va (neu can) AHA/ACC 2025 (`I10-7`): nguong, muc tieu, tiep can nguy co — chi khi huong dan huan luyen / giai thich, khong ghi de buoc 3 neu chua co rule tuong ung |
| 5 | Tach canh bao: chuyen mon vs hanh chinh (`THUOC_436`) vs tai chinh (`DM-THUOC-04`, `XML_53`) |
| 6 | Ket luan: theo **lop** + **muc chac chan** (chac chan / tam thoi / thieu du lieu) |

### 7.3. Dau ra huan luyen thong nhat moi dot

Moi dot nen co dung **hai san pham** (trung voi `Quy_trinh_prompt_huan_luyen_AI_BHYT.md`):

- **Mot file the tri thuc** theo chuyen de (vd: file I10 nay, hoac mo rong dot 2).
- **Mot ca thuc** (XML + audit) minh hoa.

### 7.4. Buoc tiep theo da thong nhat

1. **Dot I10-2**: bo sung the theo tinh huong dac biet tu VSH (thai ky, benh than man, dot quy, nguoi cao tuoi) — map sang ICD10 / truong XML khi co.
2. **Moi lan co PDF/phac do moi**: trich vao `tai_lieu/` + cap nhat muc 2 (nguon) + them the hoac tieu muc trong file chuyen de tuong ung.
3. **Khi sua rule**: bat buoc co ca kiem thu audit va ca huan luyen cap nhat, tranh chi sua theo ly thuyet.
