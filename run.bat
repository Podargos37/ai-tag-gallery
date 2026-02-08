@echo off
set PROJECT_ROOT=%~dp0
cd /d %PROJECT_ROOT%

echo [1/2] Checking Environments...

:: Node.js가 시스템에 있는지 재확인
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is installed but not found in PATH.
    echo Please restart your CMD or check your Environment Variables.
    pause
    exit /b
)

:: 프론트엔드 의존성 동기화 (없으면 설치, 있으면 빠르게 확인만 — pull 후 새 패키지도 자동 반영)
echo [INFO] Syncing frontend dependencies...
call npm install

:: Python 가상환경 및 requirements 체크
call .venv\Scripts\activate
if exist "requirements.txt" (
    pip install -r requirements.txt
)

echo [2/2] Building and launching...

:: 배포용 프로덕션 빌드 (최초 또는 코드 변경 시 수 분 소요)
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Frontend build failed.
    pause
    exit /b
)

start http://localhost:3000

:: AI 서버 실행
start "AI_BACKEND" cmd /k "cd /d %PROJECT_ROOT%server && ..\.venv\Scripts\activate && python main.py"

:: 프론트엔드 프로덕션 서버 실행
start "NEXTJS_FRONTEND" cmd /k "cd /d %PROJECT_ROOT% && call npm run start"

echo All systems go!