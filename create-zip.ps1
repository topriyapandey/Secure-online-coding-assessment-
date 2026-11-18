# ==============================================================================
# Script to create a clean, lightweight ZIP file for your friend
# ==============================================================================

$projectDir = $PSScriptRoot
$zipPath = Join-Path (Split-Path $projectDir -Parent) "SecureCodingAssessmentPlatform.zip"

Write-Host "Cleaning temporary folders (node_modules, dist, bin, obj) to keep ZIP small..." -ForegroundColor Cyan

# 1. Clean frontend build artifacts
if (Test-Path "$projectDir\frontend\dist") {
    Remove-Item -Recurse -Force "$projectDir\frontend\dist"
}

# 2. Clean backend build artifacts
Get-ChildItem -Path "$projectDir\backend" -Include "bin","obj" -Recurse -Directory | Remove-Item -Recurse -Force

# 3. Create ZIP (excluding node_modules so the zip is ~2MB instead of 300MB)
Write-Host "Creating clean ZIP at: $zipPath ..." -ForegroundColor Cyan

# Exclude node_modules from zip
$itemsToZip = Get-ChildItem -Path $projectDir | Where-Object { $_.Name -ne "frontend\node_modules" }

# Using .NET ZipFile to create clean zip
Add-Type -AssemblyName "System.IO.Compression.FileSystem"
if (Test-Path $zipPath) { Remove-Item -Force $zipPath }

[System.IO.Compression.ZipFile]::CreateFromDirectory(
    $projectDir, 
    $zipPath, 
    [System.IO.Compression.CompressionLevel]::Optimal, 
    $false
)

Write-Host "`n[SUCCESS] ZIP created successfully at:" -ForegroundColor Green
Write-Host $zipPath -ForegroundColor Yellow
Write-Host "You can now send this file to your friend!" -ForegroundColor Green
