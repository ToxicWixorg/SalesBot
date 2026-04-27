@echo off
cls
echo ===========================================
echo   🚀 STARTING SYNC TO GITHUB
echo ===========================================

:: بررسی وضعیت فایل‌ها
echo [1/3] Adding changes...
git add .

:: دریافت پیام کامیت از کاربر
set /p msg="📝 Enter Update Message (or press Enter for 'update'): "
if "%msg%"=="" set msg="update"

echo [2/3] Committing changes...
git commit -m "%msg%" --no-verify

:: فرستادن کدها به گیت‌هاب
echo [3/3] Pushing to GitHub...
git push origin main

echo ===========================================
echo   ✅ DONE! Code is now on GitHub.
echo   Go to your server and select option 2.
echo ===========================================
pause
