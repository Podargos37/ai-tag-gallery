@echo off
chcp 65001 >nul
set PROJECT_ROOT=%~dp0
set "PATH=%PROJECT_ROOT%bin\node-v25.6.9-win-x64;%PATH%"
cd /d %PROJECT_ROOT%

echo ========================================
echo   AI Tag Gallery - Run
echo ========================================
echo.

:: ----------------------------------------
:: 사전 조건 확인
:: ----------------------------------------
if not exist ".venv" (
    echo [ERROR] Virtual environment not found.
    echo         Please run 'setup.bat' first.
    pause
    exit /b 1
)

if not exist "node_modules" (
    echo [ERROR] Node modules not found.
    echo         Please run 'setup.bat' first.
    pause
    exit /b 1
)

:: 가상환경 활성화
call .venv\Scripts\activate

:: ----------------------------------------
:: 빌드
:: ----------------------------------------
echo [1/3] Building frontend...
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Frontend build failed.
    echo         Try running 'setup.bat' to reinstall dependencies.
    pause
    exit /b 1
)
echo        Build complete.
echo.

:: ----------------------------------------
:: AI 백엔드 실행
:: ----------------------------------------
echo [2/3] Starting AI backend...
start "AI_BACKEND" cmd /k "cd /d %PROJECT_ROOT%server && ..\.venv\Scripts\activate && python main.py"

echo        Waiting for AI backend to be ready...
:wait_backend
timeout /t 3 /nobreak >nul
curl -s -f http://127.0.0.1:8000/health >nul 2>&1
if %errorlevel% equ 0 goto backend_ready
goto wait_backend
:backend_ready
echo        AI backend is ready.
echo.

:: ----------------------------------------
:: 프론트엔드 실행
:: ----------------------------------------
echo [3/3] Starting frontend...
start "NEXTJS_FRONTEND" cmd /k "cd /d %PROJECT_ROOT% && npm run start"

:: 브라우저 열기
timeout /t 2 /nobreak >nul
start http://localhost:3000

echo.
echo ========================================
echo   All systems go!
echo ========================================
echo.
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:8000
echo.
echo   To stop: close the terminal windows
echo            (AI_BACKEND, NEXTJS_FRONTEND)
echo.