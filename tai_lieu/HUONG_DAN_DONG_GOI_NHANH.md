# 📦 HƯỚNG DẪN ĐÓNG GÓI ỨNG DỤNG

**Ngày tạo:** 06/04/2026

---

## 🖥️ Thành phẩm demo nội bộ — Windows, offline, không cài đặt (Portable)

Dùng **Electron + bản web export** (`dist/`): một file chạy được, không cần `npm install` trên máy demo.

### Trên máy build (có Node.js + npm)

1. Mở terminal tại thư mục gốc repo.
2. Chạy **chỉ bản Portable** (nhanh hơn bản đầy `desktop:build:win` vì không tạo NSIS):

   ```bash
   npm run desktop:build:win-portable
   ```

3. **File thành phẩm** nằm trong thư mục tạm (tránh lỗi khi repo trên Google Drive):

   - Mặc định: `%TEMP%\cdss-bhyt-release-desktop\`
   - Hoặc đặt trước khi build: `set CDSS_RELEASE_OUT=D:\PhatHanh\CDSS_BHYT_demo` rồi chạy lại lệnh trên.

4. Tìm file dạng `CDSS-BHYT-Phuong-Chau-<version>-Windows-x64.exe` (Portable) — copy sang USB hoặc máy demo, **chạy trực tiếp**, không cần cài đặt.

### Ghi chú

- **Offline (không cài đặt):** đúng với máy demo — không cần Node/Python.
- **Mạng:** giao diện và tài liệu `public/tai_lieu` đi kèm bản đóng gói; nếu tính năng trong app gọi Firebase/API/HIS thì vẫn cần mạng nội bộ hoặc cấu hình tương ứng (không thuộc phạm vi file `.exe`).
- Build đầy đủ (Portable + NSIS): `npm run desktop:build:win`.

---

## ⚡ CÁCH NHANH NHẤT (3 bước)

### **Bước 1:** Mở File Explorer

```
C:\Users\admin\Documents\Google Drive\
```

### **Bước 2:** Click Chuột Phải vào Thư Mục `ung_dung_cdss_bhyt`

```
✅ Chọn: "Send to" → "Compressed folder"
hoặc
✅ Chọn: "7-Zip" → "Add to archive"
```

### **Bước 3:** Đợi Hoàn Thành

```
✅ File sẽ tạo: ung_dung_cdss_bhyt.zip (~50-100MB)
✅ Copy file ZIP sang USB/Email/Cloud
✅ Gửi sang máy khác
```

---

## ❌ **LOẠI BỎ NHỮNG THỨ NÀY TRƯỚC KHI GÓI**

Nếu cùi bắp, hãy **xóa tạm** các thư mục này trước khi gói:

```
❌ node_modules/        (sẽ cài lại với npm install)
❌ venv/                (sẽ tạo lại với python -m venv)
❌ .git/                (cache git, không cần)
❌ .env                 (config cá nhân)
❌ *.log                (log files)
```

**Cách xóa:**
```bash
cd ung_dung_cdss_bhyt

REM Windows
rmdir /s /q node_modules
rmdir /s /q venv
rmdir /s /q .git
```

---

## 🔧 **CÁCH CHUYÊN NGHIỆP (Dùng Script)**

### Cách 1: Dùng Script Windows (Batch)

Clic hai lần vào file này:
```
dong_goi_ung_dung.bat
```

Script sẽ tự động:
- ✅ Loại bỏ `node_modules`, `venv`, `.git`
- ✅ Nén thành ZIP
- ✅ Ghi tên ngày/giờ

### Cách 2: Dùng PowerShell

```powershell
# Mở PowerShell ở thư mục project
cd "C:\Users\admin\Documents\Google Drive\ung_dung_cdss_bhyt"

# Chạy lệnh này:
Compress-Archive -Path . -DestinationPath "..\ung_dung_cdss_bhyt_backup.zip" -Force `
  -Update -WarningAction SilentlyContinue -ErrorAction Stop | `
  Where-Object { $_ -NotMatch 'node_modules|venv|\.git' }
```

### Cách 3: Dùng 7-Zip (CLI)

```bash
# Giả sử 7-Zip đã cài

cd "C:\Users\admin\Documents\Google Drive"

7z a -r -x!node_modules -x!venv -x!.git ^
  ung_dung_cdss_bhyt.zip ung_dung_cdss_bhyt\
```

---

## 📊 **DỮ LIỆU CẦN GỬI VỀ MÁY MỚI**

### ✅ CẶP GỬI (CẦN THIẾT)

| Thư mục | Dung lượng | Ghi chú |
|---------|-----------|--------|
| `ma_nguon/` | ~10MB | React Native code |
| `python_service/` | ~5MB | FastAPI backend |
| `tai_lieu/` | ~2MB | Knowledge base |
| `test_xml/` | ~5MB | Test data |
| `server.js` | 5KB | Express wrapper |
| `package.json` | 5KB | Node config |
| `requirements.txt` | 2KB | Python config |
| **.git/** | ~50MB | Version control (tùy chọn) |

**Tổng:** ~80-120MB (không có node_modules)

### ❌ KHÔNG CẦN GỬI

| Thư mục | Dung lượng | Tại sao |
|---------|-----------|--------|
| `node_modules/` | ~800MB | Cài lại với `npm install` |
| `venv/` | ~500MB | Tạo lại với `python -m venv` |
| `.env` | ~1KB | Config cá nhân mỗi máy |
| `.log` | ~100MB | Log files, không cần |

---

## 🚀 **SAU KHI GỬI SANG MÁY MỚI**

### Máy Mới Nhận File ZIP:

```bash
# 1. Giải nén
unzip ung_dung_cdss_bhyt.zip
cd ung_dung_cdss_bhyt

# 2. Cài Node dependencies
npm install --legacy-peer-deps

# 3. Tạo Python venv
python -m venv venv
venv\Scripts\activate

# 4. Cài Python dependencies
pip install -r python_service/requirements.txt

# 5. Chạy ứng dụng
node server.js
# (Terminal khác) python -m uvicorn ...
```

---

## 📈 **TỐI ƯU HÓA KÍCH THƯỚC**

Nếu muốn nhỏ nhất, hãy loại bỏ:

```bash
# Windows
rmdir /s /q node_modules
rmdir /s /q venv
rmdir /s /q .git
del .env
del *.log
```

**Trước:** 1.5GB → **Sau:** 100-120MB ✅

---

## 📋 **CHECKLIST TRƯỚC GỬI**

- [ ] Xóa `node_modules/` (nếu cần nhỏ)
- [ ] Xóa `venv/` (nếu cần nhỏ)
- [ ] Xóa `.env` (không public config)
- [ ] Xóa `*.log`
- [ ] Kiểm tra `package.json` & `requirements.txt` tồn tại
- [ ] Kiểm tra `server.js` tồn tại
- [ ] Gói ZIP thành công
- [ ] Copy hoặc upload file ZIP

---

## 💡 **MẸO NHANH**

### Nếu máy A & B trên LAN, dùng Git:

```bash
# Máy A (hiện tại)
git push origin main

# Máy B (máy mới)
git clone https://your-repo.git
cd ung_dung_cdss_bhyt
npm install --legacy-peer-deps
pip install -r python_service/requirements.txt
```

### Nếu không có Git, dùng ZIP là cớ tốt nhất.

---

**✅ Bây giờ sẵn sàng để gửi! 🎉**
