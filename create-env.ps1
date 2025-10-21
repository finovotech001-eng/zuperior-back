# PowerShell script to create .env file for Zuperior CRM Backend
# Run with: .\create-env.ps1

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  Zuperior CRM - Environment Setup" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env already exists
if (Test-Path ".env") {
    Write-Host "⚠️  .env file already exists!" -ForegroundColor Yellow
    Write-Host ""
    $response = Read-Host "Do you want to overwrite it? (y/N)"
    
    if ($response -ne "y" -and $response -ne "Y") {
        Write-Host ""
        Write-Host "❌ Cancelled. Existing .env file kept." -ForegroundColor Red
        Write-Host ""
        exit
    }
    Write-Host ""
}

# Create .env content
$envContent = @"
# Server Configuration
PORT=5000

# JWT Secret Key for Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-12345

# Database Configuration
DATABASE_URL="file:./dev.db"

# CORS Origins
CORS_ORIGIN=http://localhost:3000,http://localhost:5000

# Environment
NODE_ENV=development
"@

# Write to .env file
try {
    $envContent | Out-File -FilePath ".env" -Encoding UTF8 -NoNewline
    Write-Host "✅ .env file created successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📁 Location: $(Get-Location)\.env" -ForegroundColor White
    Write-Host ""
    
    # Test the configuration
    Write-Host "🔍 Testing configuration..." -ForegroundColor Cyan
    Write-Host ""
    
    if (Test-Path "test-env.js") {
        node test-env.js
    } else {
        Write-Host "⚠️  test-env.js not found. Skipping configuration test." -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host "  Next Steps:" -ForegroundColor Cyan
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1. Review the .env file and update values if needed" -ForegroundColor White
    Write-Host "2. Restart the backend server (npm run dev)" -ForegroundColor White
    Write-Host "3. Clear frontend localStorage and re-login" -ForegroundColor White
    Write-Host ""
    Write-Host "The 401 authentication error should now be fixed! ✅" -ForegroundColor Green
    Write-Host ""
    
} catch {
    Write-Host "❌ Error creating .env file: $_" -ForegroundColor Red
    Write-Host ""
}

# Keep window open
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

