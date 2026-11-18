# ==============================================================================
# Helper Script to verify prerequisites and start the platform
# ==============================================================================

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Secure Online Coding Assessment Platform - Environment Check" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Check Node.js
try {
    $nodeVersion = node --version
    Write-Host "[OK] Node.js is installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "[X] Node.js is not found. Please install Node.js 18+" -ForegroundColor Red
}

# 2. Check .NET SDK
$dotnetInfo = dotnet --info 2>&1
if ($dotnetInfo -match "No SDKs were found") {
    Write-Host "[!] Note: .NET Runtime is installed, but .NET 8.0 SDK is missing." -ForegroundColor Yellow
    Write-Host "    Download the .NET 8.0 SDK here: https://dotnet.microsoft.com/download/dotnet/8.0" -ForegroundColor Yellow
} else {
    Write-Host "[OK] .NET SDK is available" -ForegroundColor Green
}

# 3. Check Docker (for SQL Server)
try {
    $dockerVersion = docker --version
    Write-Host "[OK] Docker is available: $dockerVersion" -ForegroundColor Green
    Write-Host "    You can run SQL Server with: docker compose up -d" -ForegroundColor Gray
} catch {
    Write-Host "[!] Docker not detected. Please ensure SQL Server Express or LocalDB is running." -ForegroundColor Yellow
}

Write-Host "`nTo start the application:" -ForegroundColor Cyan
Write-Host "1. In backend directory:  dotnet run" -ForegroundColor White
Write-Host "2. In frontend directory: npm run dev" -ForegroundColor White
Write-Host "3. Open browser:          http://localhost:5173" -ForegroundColor White
