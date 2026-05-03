@echo off
cls
echo ===========================================
echo   SYNC  bot/  TO GITHUB
echo ===========================================

cd /d "%~dp0"

:: ── Git init ──────────────────────────────
if not exist ".git" (
    echo [SETUP] Initializing git...
    git init
    git branch -M main
)

:: ── Remote ────────────────────────────────
git remote get-url origin >nul 2>&1
if errorlevel 1 (
    set /p REMOTE_URL=Enter GitHub repo URL for bot e.g. https://github.com/user/bot.git : 
    git remote add origin %REMOTE_URL%
    echo [SETUP] Remote set.
)

:: ── .gitignore ────────────────────────────
if not exist ".gitignore" (
    echo [SETUP] Creating .gitignore...
    (
        echo node_modules/
        echo dist/
        echo .env
        echo *.env
        echo *.session
        echo bot.session
        echo .bun/
        echo drizzle/meta/
    ) > .gitignore
    echo [SETUP] .gitignore created.
)

:: ── Sync ──────────────────────────────────
echo.
echo [1/3] Adding changes...
git add .

set msg=update
set /p msg=Enter commit message (or press Enter for 'update'): 
if "%msg%"=="" set msg=update

echo [2/3] Committing...
git commit -m "%msg%" --no-verify

echo [3/3] Pushing to GitHub...
git push origin main --force-with-lease
if errorlevel 1 (
    echo [WARN] Push rejected. Pulling then pushing...
    git pull origin main --no-rebase -X ours
    git push origin main
)

echo.
echo ===========================================
echo   DONE! bot/ is now on GitHub.
echo   On server: bash managerLast.sh  then option 2
echo ===========================================
pause
