@echo off
set PROJECT_ROOT=%~dp0
cd /d %PROJECT_ROOT%

echo [1/2] Checking Python Environment and Dependencies...

:: 1. 가상환경 체크 및 생성
if not exist ".venv" (
    echo [INFO] Creating virtual environment...
    python -m venv .venv
)

:: 2. 가상환경 활성화 및 라이브러리 체크
call .venv\Scripts\activate
python -m pip install --upgrade pip

:: 3. 루트 폴더의 requirements.txt 설치 (없으면 설치 시도)
if exist "requirements.txt" (
    echo [INFO] Verifying libraries from requirements.txt...
    pip install -r requirements.txt
)

echo [2/2] Launching Separate Windows...

:: 브라우저 열기
start http://localhost:3000

:: 1. AI 서버용 창 실행 (제목: AI_BACKEND)
start "AI_BACKEND" cmd /k "cd /d %PROJECT_ROOT%server && ..\.venv\Scripts\activate && python main.py"

:: 2. 프론트엔드용 창 실행 (제목: NEXTJS_FRONTEND)
start "NEXTJS_FRONTEND" cmd /k "cd /d %PROJECT_ROOT% && npm run dev"

echo All services are starting in separate windows.
echo You can close this manager window.
pause