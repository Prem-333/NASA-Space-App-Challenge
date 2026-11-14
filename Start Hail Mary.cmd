@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is required. Install Node.js 20 or newer, then try again.
  pause
  exit /b 1
)
if not defined PORT set PORT=4173
start "" "http://localhost:%PORT%"
node scripts\serve.mjs
pause
