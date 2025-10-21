@echo off
REM Batch script to create .env file for Zuperior CRM Backend

echo.
echo ============================================================
echo   Zuperior CRM - Environment Setup
echo ============================================================
echo.

REM Check if .env already exists
if exist ".env" (
    echo WARNING: .env file already exists!
    echo.
    set /p "response=Do you want to overwrite it? (y/N): "
    
    if /i not "!response!"=="y" (
        echo.
        echo Cancelled. Existing .env file kept.
        echo.
        pause
        exit /b
    )
    echo.
)

REM Create .env file
(
echo PORT=5000
echo JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-12345
echo DATABASE_URL="file:./dev.db"
echo CORS_ORIGIN=http://localhost:3000,http://localhost:5000
echo NODE_ENV=development
) > .env

if exist ".env" (
    echo .env file created successfully!
    echo.
    echo Location: %CD%\.env
    echo.
    
    REM Test configuration if test script exists
    if exist "test-env.js" (
        echo Testing configuration...
        echo.
        node test-env.js
    )
    
    echo.
    echo ============================================================
    echo   Next Steps:
    echo ============================================================
    echo.
    echo 1. Review the .env file and update values if needed
    echo 2. Restart the backend server: npm run dev
    echo 3. Clear frontend localStorage and re-login
    echo.
    echo The 401 authentication error should now be fixed!
    echo.
) else (
    echo ERROR: Failed to create .env file
    echo.
)

pause

