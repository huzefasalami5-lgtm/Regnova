# ==============================================================================
# Push REGNOVA to GitHub Repository
# ==============================================================================
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "  Pushing REGNOVA to GitHub" -ForegroundColor Green
Write-Host "  Repository: https://github.com/huzefasalami5-lgtm/Regnova.git" -ForegroundColor White
Write-Host "=================================================================" -ForegroundColor Cyan

$rootDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $rootDir

& "C:\Program Files\Git\cmd\git.exe" push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n[SUCCESS] All files and commits pushed to GitHub successfully!" -ForegroundColor Green
} else {
    Write-Host "`n[ACTION REQUIRED] Please authenticate with your GitHub account." -ForegroundColor Yellow
}
