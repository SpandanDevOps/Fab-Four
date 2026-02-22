@echo off
REM JAAGRUK - YOUR VOICE
REM Quick Start Setup & Verification Script (Windows)
REM This script helps you set up and verify the JAAGRUK platform is ready to run

setlocal enabledelayedexpansion

cls
echo.
echo ==========================================
echo.
echo   JAAGRUK - YOUR VOICE
echo   Quick Start Setup ^& Verification
echo.
echo ==========================================
echo.

REM Check Node.js
echo Checking Prerequisites...
echo.

node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [X] Node.js not found!
    echo.
    echo Please install Node.js 18+ from:
    echo https://nodejs.org/en/download/
    echo.
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
    echo [OK] Node.js installed: !NODE_VERSION!
)

npm -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [X] npm not found!
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('npm -v') do set NPM_VERSION=%%i
    echo [OK] npm installed: !NPM_VERSION!
)

echo.

REM Check if in correct directory
if not exist "frontend\package.json" (
    echo [X] frontend\package.json not found!
    echo.
    echo Please run this script from the JYV root directory
    echo Current directory: %cd%
    echo.
    pause
    exit /b 1
)

echo [OK] Running from correct directory: %cd%
echo.

echo.
echo Setting up Frontend...
echo.

cd frontend

if not exist "node_modules" (
    echo [+] Installing frontend dependencies...
    echo This may take 2-3 minutes...
    echo.
    call npm install --quiet
    echo [OK] Frontend dependencies installed
    echo.
) else (
    echo [OK] Frontend dependencies already installed
    echo.
)

if not exist ".env" (
    if exist ".env.example" (
        echo [+] Creating .env from .env.example...
        type .env.example > .env
        echo [OK] .env created
        echo.
        echo [!] IMPORTANT: Edit .env and add your GEMINI_API_KEY
        echo    Get it from: https://ai.google.dev/
        echo.
    )
) else (
    echo [OK] .env file exists
    echo.
)

findstr /m "your_gemini_api_key_here" .env >nul 2>&1
if %errorlevel% equ 0 (
    echo [!] WARNING: Gemini API key not configured in .env
    echo    Get it from: https://ai.google.dev/
    echo.
) else (
    echo [OK] Gemini API key appears to be configured
    echo.
)

echo Frontend Configuration:
echo ───────────────────────
dir /b .env* 2>nul
echo.

cd ..

echo.
echo Backend Status (Optional)...
echo.

cd backend

if not exist "node_modules" (
    echo [!] Backend dependencies not installed
    echo.
    echo To setup backend type:
    echo   cd backend
    echo   npm install
    echo   npm run dev
    echo.
) else (
    echo [OK] Backend dependencies installed
)

cd ..

echo.
echo ===== SETUP COMPLETE =====
echo.
echo FRONTEND LOCATION: %cd%\frontend
echo BACKEND LOCATION:  %cd%\backend
echo.
echo.
echo NEXT STEPS:
echo ═══════════
echo.
echo 1) Configure Gemini API Key:
echo    → Open: frontend\.env
echo    → Get key from: https://ai.google.dev/
echo    → Add your key: VITE_GEMINI_API_KEY=your_key_here
echo    → Save file
echo.
echo 2) Start Frontend:
echo    → Open Command Prompt/PowerShell
echo    → Navigate: cd frontend
echo    → Run: npm run dev
echo    → Opens: http://localhost:3000
echo.
echo 3) Start Backend (Optional):
echo    → Open new Command Prompt/PowerShell
echo    → Navigate: cd backend
echo    → Run: npm install   (if not done)
echo    → Run: npm run dev
echo    → Runs on: http://localhost:4000
echo.
echo 4) Test Platform:
echo    → Click "Report an Issue"
echo    → Choose Named or Anonymous
echo    → Describe incident
echo    → Select location
echo    → Add photo/video
echo    → Review & Submit
echo    → Get blockchain confirmation!
echo.
echo.
echo DOCUMENTATION:
echo ═══════════════
echo • Main README:        README.md
echo • Frontend Guide:     FRONTEND_SETUP.md
echo • Troubleshooting:    See README.md
echo.
echo.
echo USEFUL COMMANDS:
echo ════════════════
echo FRONTEND:
echo   npm run dev      - Start dev server with HMR
echo   npm run build    - Production build
echo   npm run preview  - Preview production build
echo   npm run lint     - Check TypeScript types
echo.
echo BACKEND:
echo   npm run dev      - Start dev server
echo   npm run build    - Build TypeScript
echo   npm start        - Start production
echo.
echo.
echo TROUBLESHOOTING:
echo ════════════════
echo Port already in use?
echo   npm run dev -- --port 3001
echo.
echo Clear and reinstall:
echo   rmdir /s /q frontend\node_modules
echo   npm install
echo.
echo Verify backend:
echo   curl http://localhost:4000/api/health
echo.
echo.
echo ═════════════════════════════════════════════════════
echo [OK] Setup Complete!
echo ═════════════════════════════════════════════════════
echo.
echo Ready to run?
echo   Step 1: Open Command Prompt in frontend folder
echo   Step 2: Run: npm run dev
echo   Step 3: Browser opens automatically!
echo.
echo Questions? Check README.md or FRONTEND_SETUP.md
echo.
echo Built with heart for India - JAAGRUK - Your Voice
echo.
pause
