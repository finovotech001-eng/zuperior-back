@echo off
echo ═══════════════════════════════════════════════════════════
echo 🚀 Starting Zuperior Backend Server
echo ═══════════════════════════════════════════════════════════
echo.
echo Backend will start on: http://localhost:5000
echo.
echo Watch for these logs when you create a deposit:
echo   🚀 NEW MANUAL DEPOSIT REQUEST RECEIVED
echo   ✅✅✅ MT5Transaction CREATED SUCCESSFULLY!
echo.
echo ═══════════════════════════════════════════════════════════
echo.

cd /d "%~dp0"
npm start

pause


