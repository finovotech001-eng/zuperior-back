@echo off
echo ========================================
echo Regenerating Prisma Client
echo ========================================
echo.
echo IMPORTANT: Make sure your backend server is STOPPED before running this!
echo.
pause

echo Deleting old Prisma client...
rmdir /s /q node_modules\.prisma 2>nul

echo Generating new Prisma client with updated schema...
call npx prisma generate

echo.
echo ========================================
echo Done! You can now restart your backend server.
echo ========================================
pause

