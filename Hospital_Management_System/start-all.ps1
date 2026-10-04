# PowerShell Script to launch Backend, Patient Frontend, and Dashboard in separate windows

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " Starting Hospital Management System (3 Services)" -ForegroundColor Cyan
Write-Host " - Backend API:       http://localhost:5000" -ForegroundColor Cyan
Write-Host " - Patient Frontend:  http://localhost:5173" -ForegroundColor Cyan
Write-Host " - Staff Dashboard:   http://localhost:5174" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$root = $PSScriptRoot

# 1. Start Backend in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\backend'; Write-Host 'Starting Backend API Server on Port 5000...' -ForegroundColor Blue; npm run dev"

# 2. Start Patient Frontend in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\frontend'; Write-Host 'Starting Patient Frontend on Port 5173...' -ForegroundColor Green; npm run dev"

# 3. Start Staff Dashboard in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\dashboard'; Write-Host 'Starting Staff Dashboard on Port 5174...' -ForegroundColor Magenta; npm run dev"

Write-Host "`nAll 3 processes have been initiated in dedicated PowerShell windows." -ForegroundColor Green
Write-Host "Keep those terminal windows open while testing." -ForegroundColor Yellow
