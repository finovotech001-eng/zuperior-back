@echo off
echo.
echo ============================================================
echo Testing Backend Environment Configuration
echo ============================================================
echo.

node test-env.js

echo.
echo ============================================================
echo.
echo If you see any errors above, please:
echo 1. Create a .env file in zuperior-back directory
echo 2. Add the required environment variables (see SETUP.md)
echo 3. Restart the backend server
echo.
echo ============================================================
echo.
pause


