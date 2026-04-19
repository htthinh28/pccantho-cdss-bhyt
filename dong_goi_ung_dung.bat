@echo off
REM ============================================
REM CDSS BHYT — đóng gói ZIP mã nguồn (máy dev). Bản chạy KHÔNG CÀI: dùng portable.
REM Portable đầy đủ: packaging\build_portable_full.bat  hoặc  npm run desktop:build:win-portable
REM ============================================

echo.
echo ========== ĐANG ĐÓNG GÓI ZIP MÃ NGUỒN (KHÔNG PHẢI BẢN .EXE) ==========
echo.

setlocal enabledelayedexpansion

REM Lấy ngày/giờ
for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set mydate=%%c%%a%%b)
for /f "tokens=1-2 delims=/:" %%a in ('time /t') do (set mytime=%%a%%b)

set PACKAGE_NAME=ung_dung_cdss_bhyt_v1.0_%mydate%_%mytime%.zip
set PROJECT_DIR=%~dp0

echo 📦 Tên package: %PACKAGE_NAME%
echo 📁 Thư mục: %PROJECT_DIR%

REM Kiểm tra 7-Zip hoặc WinRAR
where 7z >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Tìm thấy 7-Zip
    goto PackWith7Z
)

where winrar >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Tìm thấy WinRAR
    goto PackWithWinRAR
)

echo ❌ Cần 7-Zip hoặc WinRAR. Tải từ:
echo    7-Zip: https://7-zip.org/
echo    WinRAR: https://winrar.com/
pause
exit /b 1

:PackWith7Z
echo ⏳ Đang nén với 7-Zip...
7z a -r -x!node_modules -x!.git -x!.env -x!venv "%PACKAGE_NAME%" "%PROJECT_DIR%ung_dung_cdss_bhyt"
goto Success

:PackWithWinRAR
echo ⏳ Đang nén với WinRAR...
cd /d "%PROJECT_DIR%"
winrar a -r -x node_modules -x .git -x .env -x venv "%PACKAGE_NAME%" ung_dung_cdss_bhyt
goto Success

:Success
echo.
echo ✅ ĐÓNG GÓI THÀNH CÔNG!
echo.
echo 📦 File: %PACKAGE_NAME%
echo 📁 Vị trí: %PROJECT_DIR%
echo.
echo 📋 Bước tiếp theo:
echo    1. Copy file %PACKAGE_NAME% sang máy khác
echo    2. Giải nén, dùng hướng dẫn: HUONG_DAN_CONG_TAC_VA_CAI_DAT_MAY_MOI.md
echo    3. Chạy: npm install --legacy-peer-deps
echo    4. Chạy: pip install -r python_service/requirements.txt
echo    5. Chạy: node server.js & python -m uvicorn ...
echo.
pause
