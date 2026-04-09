# DANH SÁCH 10 CA TEST & DỮ LIỆU CHI TIẾT

Phiên bản tài liệu: 1.6
Ngày cập nhật: 06/04/2026

## 1. DANH SÁCH 10 CA TIMELINE ĐƯỢC PHÂN LOẠI

Dưới đây là 10 ca được chọn từ `test_xml/` folder, **sắp xếp theo độ phức tạp** từ dễ → khó.

Cột **Tổng cảnh báo (snapshot)** lấy từ `meta.total_warnings` trong file JSON tại thời điểm cập nhật tài liệu; khi sửa luật, chạy `npm run qa:audit-fixtures` để đối chiếu lại.

| STT | MA_LK | File Audit Chính | Tổng cảnh báo (snapshot) | Loại Lỗi Chính | Cấp Độ | Lý Do Chọn | Ghi Chú |
|-----|-------|---|---|---|---|---|---|
| **1** | **403521** | audit_403521_20260405_225230.json | **8** | PTTT + hành chính + HC/HD | ⭐ Đơn giản | Hồ sơ nội trú mẫu trong repo | **Không còn 0 cảnh báo** trong bản snapshot — xem mục 2.1 |
| **2** | **000339** | audit_000339_20260405_232511.json | **14** | Ngoại trú, đa mã | ⭐ Đơn giản | Nhiều luật hành chính + thuốc | Đối chiếu `unique_rule_codes` trong file |
| **3** | **403538** | audit_403538_20260405_145119.json | **47** | XML5 + thuốc + hành chính | ⭐⭐⭐ Phức tạp | **Đã sửa tên file** (bản 225547 không tồn tại cho 403538) | THUOC_345, hàng loạt XML5 |
| **4** | **000589** | audit_000589_20260405_232716.json | **8** | Hành chính + Thuốc | ⭐⭐ Trung bình | Nhiều THUOC_* + HC_* | **CA TEST CẤP 2**; `Ca_huan_luyen_mau_000589_nhieu_nhom_thuoc_mot_ho_so.md`. Bản phụ `audit_000589_20260404_185800.json` có **DM-THUOC-03** — `Ca_huan_luyen_mau_000589_DM_THUOC_03_danh_muc_noibo_snapshot.md` |
| **5** | **OP26000908** | audit_OP26000908_20260405_232932.json | **11** | Thuốc + hành chính | ⭐⭐ Trung bình | Ngoại trú, Amoxiclav / hạn mức | `Ca_huan_luyen_mau_OP26000908_Amoxiclav_dieu_tri_uong.md`; corticoid **THUOC_267**: `Ca_huan_luyen_mau_OP26000908_THUOC_267_Medlon_Methylprednisolon_ICD.md` |
| **6** | **403244** | audit_403244_20260405_224614.json | **11** | PTTT + hành chính + HC/HD | ⭐⭐⭐ Phức tạp | Đủ nhóm lỗi | **CA TEST CẤP 3** |
| **7** | **000308** | audit_000308_20260405_083942.json | **8** | PT sản + HC + thuốc | ⭐⭐ Trung bình | Một file chuẩn cho CA7 | `THUOC_391` x3 — ca huấn luyện: `Ca_huan_luyen_mau_000308_THUOC_391_sai_lech_so_luong_y_lenh.md`; khác bản `085142` (12 cảnh báo) |
| **8** | **000375** | audit_000375_20260405_065828.json | **6** | DVKT-OP + HC + HD | ⭐ Đơn giản | Ổn định để test nhanh | |
| **9** | **000376** | audit_000376_20260404_174042.json | **35** | Rất nhiều nhóm | ⭐⭐⭐ Phức tạp | Stress test | |
| **10** | **000502** | audit_000502_20260404_192348.json | **6** | CDHA + giường + HC + HD | ⭐⭐ Trung bình | 6 mã cố định, dễ chấm | MRI, XML5, ngày ký |

**Phần test tiếp theo (CA 7–10, prompt mẫu, bảng chấm):** `Bat_dau_test_10_ca_chi_tiet.md` phiên bản 2.0.  
**Kiểm tra nhanh 10 file:** `npm run qa:audit-fixtures`.

**Ca huấn luyện thuốc ngoài bảng 10 (có audit trong `test_xml/`):** `ER26000392` — `audit_ER26000392_20260404_193517.json`, ca `Ca_huan_luyen_mau_ER26000392_THUOC_374_Magnesi_ICD_va_chong_lop.md`; `000573` — `audit_000573_20260405_084557.json`, ca `Ca_huan_luyen_mau_000573_THUOC_391_Dafodin_giuong_PT.md`; **nội trú nặng** — `audit_PC022300479_IP26000139.json`, ca `Ca_huan_luyen_mau_IP26000139_DOMUVAR_THUOC_63_va_THUOC_417_noi_tru.md`. **Chỉ mục engine thuốc:** `The_tri_thuc_chi_muc_giam_dinh_thuoc_engine_AI.md`.

---

## 2. 3 CA CHÍNH ĐƯỢC CHỌN CHO TEST HÔMNAY (TỐI)

### **CA TEST 1: CẤP 1 (403521 — cập nhật snapshot)**

**Mục tiêu:** AI đọc đúng audit JSON và **không mâu thuẫn** với số cảnh báo thực tế.

| Thông Tin | Giá Trị |
|-----------|--------|
| **MA_LK** | 403521 |
| **File Audit** | audit_403521_20260405_225230.json |
| **Tổng cảnh báo (snapshot)** | **8** (xem `meta.total_warnings`) |
| **Ví dụ mã trong file** | `CLN-PTTT-13`, `DVKT_2335`, `DVKT_2587`, `DVKT_2588`, `HC_130`, `HC_180`, `HD_09`, `HD_10` |
| **Ghi chú** | Nếu cần bài test “0 cảnh báo”, phải dùng **hồ sơ/audit khác** hoặc tái xuất sau khi chỉnh rule — không dùng mục tiêu cũ “0 lỗi” với file này. |

**Cách chuẩn bị:**
1. Đọc file audit: `test_xml/audit_403521_20260405_225230.json`
2. Kéo ra: bệnh nhân, thuốc, dịch vụ
3. Soạn prompt (xem mục 4 dưới)

---

### **CA TEST 2: CẤP 2 (Trung Bình - 000589)**

**Mục tiêu:** AI phát hiện **2 lỗi khác loại** (1 hành chính + 1 thanh toán)

| Thông Tin | Giá Trị |
|-----------|--------|
| **MA_LK** | 000589 |
| **File Audit** | audit_000589_20260405_232716.json |
| **Chẩn đoán chính** | ? (Cần kéo từ audit) |
| **Loại KCB** | Nội trú |
| **Lỗi 1 kỳ vọng** | Hành chính (dữ liệu sai/thiếu) |
| **Lỗi 2 kỳ vọng** | Thanh toán (Cefotaxime hoặc loại khác) |
| **Tổng tiền xuất toán kỳ vọng** | 61% (chênh lệch tiền - từ MEMORY) |
| **Ghi chú** | AI cần nhận ra 2 loại lỗi khác nhau |

**Cách chuẩn bị:**
1. Đọc file audit
2. Kéo ra: 2 lỗi chính
3. Soạn prompt

---

### **CA TEST 3: CẤP 3 (Phức Tạp - 403244)**

**Mục tiêu:** AI phát hiện **4 lỗi chồng** từ 4 loại khác nhau

| Thông Tin | Giá Trị |
|-----------|--------|
| **MA_LK** | 403244 |
| **File Audit** | audit_403244_20260405_224614.json |
| **Chẩn đoán chính** | Polyp phẫu thuật nội soi hoặc tương tự |
| **Loại KCB** | Nội trú |
| **Lỗi 1** | Hành chính (dữ liệu/ngày) |
| **Lỗi 2** | Phẫu thuật (yêu cầu DVKT, giải phẫu bệnh) |
| **Lỗi 3** | An toàn (liều/tần suất kháng sinh) |
| **Lỗi 4** | Thanh toán (số lượng/giá) |
| **Tổng tiền xuất toán kỳ vọng** | Toàn bộ hoặc bộ phận (cần tính) |
| **Ghi chú** | AI phải tuân thủ 5 bước để phát hiện hết |

**Cách chuẩn bị:**
1. Đọc file audit
2. Kéo ra: 4 lỗi, từng loại 1
3. Soạn prompt chi tiết

---

## 3. DỮ LIỆU CHI TIẾT TỪNG CA (SAO CHÉP TỪ AUDIT JSON)

### **CA 1: 403521 - Dữ Liệu**

*Sau khi đọc audit JSON, kéo ra:*

```
MA_LK: 403521
Chẩn đoán chính: [Từ XML1.MA_BENH_CHINH]
Ngày vào: [Từ XML1.NGAY_VAO]
Ngày ra: [Từ XML1.NGAY_RA]
Thuốc chính: Cefazolin / Biofazolin
  - Mã: 40.166
  - SO_LUONG: 2-4 viên
  - GIA_THANH_TOAN: 15.000 đ/viên

Dịch vụ: [PTTT hoặc DVKT]

Tổng lỗi: 0
→ Kỳ vọng: THANH TOÁN ĐÚNG
```

---

### **CA 2: 000589 - Dữ Liệu**

*Sau khi đọc audit JSON, kéo ra:*

```
MA_LK: 000589
Chẩn đoán chính: [Từ XML1]
Lỗi 1: [HC_130 hoặc tương tự] - Hành chính (dữ liệu sai)
Lỗi 2: [THUOC_xxx] - Thanh toán (Cefotaxime sai liều/chẩn đoán)
  - Tiền: 61% hóa đơn

Tổng lỗi: 2
→ Kỳ vọng: XUẤT TOÁN BỘ
```

---

### **CA 3: 403244 - Dữ Liệu**

*Sau khi đọc audit JSON, kéo ra:*

```
MA_LK: 403244
Chẩn đoán: Polyp phẫu thuật nội soi cắt polyp
Lỗi 1: [HC_171 hoặc tương tự] - Hành chính (thiếu XML5 diễn biến)
Lỗi 2: [DVKT_2622] - PTTT (thiếu giải phẫu bệnh)
Lỗi 3: [THUOC_xxx] - An toàn (liều kháng sinh hoặc chống chỉ định)
Lỗi 4: [THUOC_yyy] - Thanh toán (Mekoferrat sai chẩn đoán)

Tổng lỗi: 4
→ Kỳ vọng: XUẤT TOÁN TOÀN BỘ hoặc BỘ
```

---

## 4. TEMPLATE PROMPT SẴN SÀN (CHỈ CẦN ĐIỀN DỮ LIỆU)

### **PROMPT CA 1 (403521) - CẤP 1**

```markdown
## TEST AI GIÁM ĐỊNH BHYT - CA 1 (CẤP 1: ĐƠN GIẢN)

### Hồ Sơ: MA_LK = 403521

**Thông tin hồ sơ:**
- Chẩn đoán chính: Phẫu thuật sản khoa
- Loại KCB: Nội trú
- Ngày vào: 2026-03-15
- Ngày ra: 2026-03-18 (3 ngày)

**Danh sách dịch vụ/thuốc:**
1. Cefazolin / Biofazolin (40.166)
   - SO_LUONG: 2-4 viên
   - GIA_THANH_TOAN: 15.000đ/viên
   - Dự phòng sau phẫu thuật

**NHIỆM VỤ:**
Áp dụng **5 bước giám định** từ Nghị Định 188/2025. Sau mỗi bước, nêu rõ:
- Có lỗi không?
- Nếu có, lỗi gì? (Hành chính/An toàn/Chỉ định/Thanh toán)

**ĐẦU RA MONG MUỐN:**
- Kết luận: THANH TOÁN ĐÚNG hay XUẤT TOÁN?
- Nếu XUẤT TOÁN: Chi tiết từng lỗi + tổng tiền
- Ghi lại 5 bước kiểm tra rõ ràng
```

---

### **PROMPT CA 2 (000589) - CẤP 2**

```markdown
## TEST AI GIÁM ĐỊNH BHYT - CA 2 (CẤP 2: TRUNG BÌNH)

### Hồ Sơ: MA_LK = 000589

**Thông tin hồ sơ:**
- Chẩn đoán chính: [Kéo từ audit JSON]
- Loại KCB: Nội trú
- Thời gian: [Kéo từ audit]

**Danh sách dịch vụ/thuốc:**
[Kéo từ audit JSON]

**NHIỆM VỤ:**
Tuân thủ **5 bước giám định**. Phát hiện **2 lỗi**:
- Lỗi 1: Hành chính (về dữ liệu)
- Lỗi 2: Thanh toán (về danh mục/chẩn đoán)

**ĐẦU RA MONG MUỐN:**
- Danh sách 2 lỗi (loại, mô tả, tiền)
- Kết luận: XUẤT TOÁN (số tiền tổng)
- Giải thích tại sao là 2 loại lỗi khác nhau
```

---

### **PROMPT CA 3 (403244) - CẤP 3**

```markdown
## TEST AI GIÁM ĐỊNH BHYT - CA 3 (CẤP 3: PHỨC TẠP)

### Hồ Sơ: MA_LK = 403244

**Thông tin hồ sơ:**
- Chẩn đoán: Polyp phẫu thuật nội soi cắt polyp
- Loại KCB: Nội trú
- Thời gian: 3 ngày

**Danh sách dịch vụ/thuốc:**
[Kéo từ audit JSON - bao gồm PTTT + DVKT + thuốc]

**NHIỆM VỤ:**
Tuân thủ **5 bước giám định** CHẶT CHẼ. Phát hiện **4 lỗi chồng**:
- Lỗi 1: Hành chính
- Lỗi 2: Phẫu thuật/DVKT
- Lỗi 3: An toàn kê đơn
- Lỗi 4: Thanh toán

**ĐẦU RA MONG MUỐN:**
- Chi tiết 4 lỗi (từng loại 1)
- Mỗi lỗi: Mô tả, loại, tiền, căn cứ pháp lý
- Kết luận: XUẤT TOÁN (tính tổng tiền chi tiết)
- Nêu rõ 5 bước kiểm tra
```

---

## 5. LỊCH TRÌNH CHẠY TEST (CỤ THỂ)

**Tối hôm nay (06/04/2026):**

| Thời gian | Việc làm | Dự kiến |
|-----------|----------|--------|
| 19h00 | Chuẩn bị: Đọc 3 file audit, kéo dữ liệu | 30 phút |
| 19h30 | Viết 3 prompt test (điền dữ liệu vào template) | 20 phút |
| 19h50 | Test CA 1 (403521 - Đơn giản) | 10 phút |
| 20h00 | Chấm điểm CA 1 | 10 phút |
| 20h10 | Test CA 2 (000589 - Trung bình) | 10 phút |
| 20h20 | Chấm điểm CA 2 | 10 phút |
| 20h30 | Test CA 3 (403244 - Phức tạp) | 15 phút |
| 20h45 | Chấm điểm CA 3 | 10 phút |
| 20h55 | Viết báo cáo tóm tắt | 20 phút |
| 21h15 | **Hoàn thành test** | |

**Tổng thời gian:** ~2 giờ

---

## 6. CHECKLIST KỲ TRƯỚC KHI TEST

Trước khi bắt đầu test, hãy xác nhận:

- [ ] AI đã **đọc & hiểu** 3 thẻ tri thức (Luật, Nghị Định, Thanh toán)
- [ ] AI có thể **nêu 5 bước** giám định (Hỏi AI: "Nêu 5 bước theo Nghị Định 188/2025")
- [ ] AI hiểu **4 loại lỗi** (Hỏi AI: "4 loại lỗi là gì?")
- [ ] Các **3 file audit** được lấy & dữ liệu sẵn sàng
- [ ] **3 prompt test** được viết (template + dữ liệu)
- [ ] **Bảng chấm điểm** sẵn sàng (dùng template từ tài liệu trên)

---

## 7. SAI LẦM THƯỜNG GẶP & CÁCH TRỪ

### **Sai lầm 1: AI quên 5 bước**

**Dấu hiệu:** AI chỉ nêu kết luận, không nêu từng bước

**Cách xử:** Yêu cầu AI "Hãy nêu rõ từng bước 1-5 mà em kiểm tra"

**Điểm:** -0.5 điểm (từ 6 → 5.5)

---

### **Sai lầm 2: AI phân loại lỗi sai**

**Dấu hiệu:** AI gọi "Thankh toán" lỗi mà thực ra là "An toàn"

**Cách xử:** Hỏi "Lỗi này là liều quá cao (An toàn) hay không được thanh toán (Thanh toán)?"

**Điểm:** -1 điểm (từ 6 → 5)

---

### **Sai lầm 3: AI không nêu căn cứ pháp lý**

**Dấu hiệu:** AI chỉ nói "không được thanh toán" mà không nêu "Theo TT 15/2015..."

**Cách xử:** Hỏi "Căn cứ pháp lý cho kết luận này là gì?"

**Điểm:** -0.5 điểm

---

### **Sai lầm 4: AI tính tiền sai**

**Dấu hiệu:** Tiền xuất toán không khớp

**Cách xử:** "Tính lại: Giá = [X], Số lượng = [Y], Tiền = ?"

**Điểm:** -1 điểm (nếu tính hoàn toàn sai)

---

## 8. KẾT LUẬN & BẠN CÓ SẴN SÀNG CHƯA?

Tài liệu này cung cấp:
- ✅ **Danh sách 10 ca** (phân loại độ phức tạp)
- ✅ **3 ca chính** được chọn cho hôm nay
- ✅ **Template prompt** sẵn sàng (chỉ cần điền dữ liệu)
- ✅ **Bảng chấm điểm** cụ thể
- ✅ **Lịch trình & checklist** chi tiết

**Anh có sẵn sàng test AI tối nay chưa?**

Nếu có, các bước tiếp theo:
1. Hỏi AI: "Nêu 5 bước giám định?" (xác nhận AI học tốt)
2. Đọc 3 file audit, kéo dữ liệu
3. Viết 3 prompt test (điền vào template)
4. Chạy test (3 ca, ~15 phút/ca)
5. Chấm điểm & viết báo cáo

🎯 **Anh sẵn sàng?**
