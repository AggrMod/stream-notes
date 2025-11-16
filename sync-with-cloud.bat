@echo off
echo Stream Notes - Syncing with Cloud...
echo.

cd /d "%~dp0"

:loop
echo [%time%] Checking for updates...
git fetch origin claude/improve-notepad-01AM48RamLqm8CMxLSYzrs4S 2>nul
git pull origin claude/improve-notepad-01AM48RamLqm8CMxLSYzrs4S 2>nul

if errorlevel 1 (
    echo ERROR: Failed to pull updates
) else (
    echo ✓ Synced with cloud
)

echo.
timeout /t 30 /nobreak >nul
goto loop
