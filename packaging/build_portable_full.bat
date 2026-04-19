@echo off
chcp 65001 >nul
REM Đóng gói portable đầy đủ (web export + chỉ mục + Electron portable), thay thế bản cũ trong thư mục output.
REM Chạy từ máy BUILD (có Node.js + npm). Không cần trên máy người dùng.

cd /d "%~dp0.."

echo.
echo === CDSS BHYT — build portable đầy đủ ===
echo Output: ..\release-desktop  (cùng cấp với thư mục gốc repo)
echo.

call npm run desktop:build:win-portable:release-desktop
set ERR=%ERRORLEVEL%

echo.
if %ERR% neq 0 (
  echo Lỗi build mã %ERR%.
  pause
  exit /b %ERR%
)

echo Thành công. File .exe portable nằm trong thư mục release-desktop cạnh mã nguồn.
echo.
echo Thay bản cũ: copy đè file .exe mới cùng tên, hoặc xóa file cũ rồi copy bản mới.
pause
