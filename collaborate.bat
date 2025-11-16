@echo off
REM Simple CLI for Inter-Claude Collaboration

if "%1"=="" goto :help
if "%1"=="pull" goto :pull
if "%1"=="push" goto :push
if "%1"=="status" goto :status
if "%1"=="watch" goto :watch
if "%1"=="task" goto :task
if "%1"=="msg" goto :msg
goto :help

:pull
echo Pulling latest from cloud...
git pull origin claude/improve-notepad-01AM48RamLqm8CMxLSYzrs4S
goto :end

:push
echo Pushing to cloud...
git add .
git commit -m "%~2"
git push origin claude/improve-notepad-01AM48RamLqm8CMxLSYzrs4S
goto :end

:status
echo Recent commits:
git log --oneline -5
echo.
echo Files changed:
git status -s
goto :end

:watch
echo Watching for updates (Ctrl+C to stop)...
:watchloop
git fetch origin -q
git log origin/claude/improve-notepad-01AM48RamLqm8CMxLSYzrs4S --oneline -1
timeout /t 5 /nobreak >nul
goto :watchloop

:task
if "%~2"=="" (
    echo Current tasks:
    type tasks.json
) else (
    echo Adding task: %~2
    REM Would update tasks.json here
)
goto :end

:msg
echo Quick message to cloud: %~2
echo {"from":"local","ts":%time%,"msg":"%~2"} >> messages.log
goto :end

:help
echo.
echo Inter-Claude Collaboration CLI
echo ==============================
echo.
echo collaborate pull          - Pull latest changes
echo collaborate push "msg"    - Commit and push with message
echo collaborate status        - Show current status
echo collaborate watch         - Watch for new commits
echo collaborate task          - Show current tasks
echo collaborate msg "text"    - Send quick message
echo.
goto :end

:end
