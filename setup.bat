@echo off
chcp 65001 >nul
set PROJECT_ROOT=%~dp0
set "PATH=%PROJECT_ROOT%bin\node-v25.6.9-win-x64;%PATH%"
cd /d %PROJECT_ROOT%

echo ========================================
echo   AI Tag Gallery - Setup / Update
echo ========================================
echo.

:: ----------------------------------------
:: 1. Git Pull (업데이트 확인)
:: ----------------------------------------
if not exist ".git" goto :skip_git

echo [1/5] Checking for updates...
git pull
if %errorlevel% neq 0 (
    echo [WARNING] Git pull failed. You may have local changes.
    echo           Continuing with current version...
    echo.
)
goto :after_git

:skip_git
echo [1/5] Skipping git pull (not a git repository)

:after_git
echo.

:: ----------------------------------------
:: 2. Node.js 확인
:: ----------------------------------------
echo [2/5] Checking Node.js...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found.
    echo Please install Node.js 18+ from https://nodejs.org/
    echo Or place portable Node in bin\node-v25.6.9-win-x64\
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node -v') do echo        Node.js %%i found.
echo.

:: ----------------------------------------
:: 3. Python 확인 및 가상환경 생성
:: ----------------------------------------
echo [3/5] Checking Python and virtual environment...
where python >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python not found.
    echo Please install Python 3.10+ from https://python.org/
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('python --version') do echo        %%i found.

if exist ".venv" goto :venv_exists

echo        Creating virtual environment (.venv)...
python -m venv .venv
if %errorlevel% neq 0 (
    echo [ERROR] Failed to create virtual environment.
    pause
    exit /b 1
)
echo        Virtual environment created.
goto :venv_activate

:venv_exists
echo        Virtual environment already exists.

:venv_activate
call .venv\Scripts\activate
echo.

:: ----------------------------------------
:: 4. Python 의존성 설치
:: ----------------------------------------
echo [4/5] Installing Python dependencies...
echo        (This may take a few minutes on first run)
pip install -r requirements.txt --quiet
if %errorlevel% neq 0 (
    echo [WARNING] Some packages may have failed to install.
    echo           Check the output above for errors.
    echo.
    echo [TIP] PyTorch must be installed separately:
    echo       - CPU:  pip install torch torchvision
    echo       - GPU:  pip install torch torchvision --index-url https://download.pytorch.org/whl/cu121
    echo.
)
echo        Python dependencies installed.
echo.

:: ----------------------------------------
:: 5. Node 의존성 설치
:: ----------------------------------------
echo [5/5] Installing Node dependencies...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] npm install failed.
    pause
    exit /b 1
)
echo        Node dependencies installed.
echo.

:: ----------------------------------------
:: 완료
:: ----------------------------------------
echo ========================================
echo   Setup complete!
echo ========================================
echo.
echo Next steps:
echo   1. If you haven't installed PyTorch yet:
echo      - CPU:  pip install torch torchvision
echo      - GPU:  pip install torch torchvision --index-url https://download.pytorch.org/whl/cu121
echo.
echo   2. Run 'run.bat' to start the application.
echo.
echo ========================================
echo.
echo 아무 키나 누르면 창이 닫힙니다...
pause >nul
