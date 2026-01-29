@echo off
set PROJECT_ROOT=%~dp0
cd /d %PROJECT_ROOT%

echo [1/3] Checking Python Virtual Environment...
:: 루트 폴더에 .venv가 있는지 확인
if not exist ".venv" (
    echo [INFO] No virtual environment found. Creating one...
    python -m venv .venv
)

echo [2/3] Activating environment and checking libraries...
call .venv\Scripts\activate

:: pip가 최신인지 확인하고 requirements 설치
:: 이미 설치되어 있다면 "Requirement already satisfied"가 뜨며 빠르게 넘어갑니다.
python -m pip install --upgrade pip
if exist "server\requirements.txt" (
    pip install -r server\requirements.txt
)

echo [3/3] Starting Services...
start http://localhost:3000

:: AI 서버 실행 (루트에서 server 폴더로 들어가 실행)
start cmd /k "title AI_Server && cd /d %PROJECT_ROOT%server && ..\.venv\Scripts\activate && python main.py"

:: 프론트엔드 실행
echo Starting Frontend...
npm run dev

pause