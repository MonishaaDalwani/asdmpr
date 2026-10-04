# PowerShell Script to install dependencies for all 3 apps

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " Hospital Management System - Dependency Installer" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# Root dependencies (concurrently)
Write-Host "`n[1/4] Installing Root devDependencies..." -ForegroundColor Yellow
npm install

# Backend dependencies
Write-Host "`n[2/4] Installing Backend Dependencies..." -ForegroundColor Yellow
cd backend
npm install
cd ..

# Frontend dependencies
Write-Host "`n[3/4] Installing Patient Frontend Dependencies..." -ForegroundColor Yellow
cd frontend
npm install
cd ..

# Dashboard dependencies
Write-Host "`n[4/4] Installing Staff Dashboard Dependencies..." -ForegroundColor Yellow
cd dashboard
npm install
cd ..

Write-Host "`n==========================================================" -ForegroundColor Green
Write-Host " All dependencies installed successfully!" -ForegroundColor Green
Write-Host " You can now seed the database using: npm run seed --prefix backend" -ForegroundColor Green
Write-Host " Or start all services using: .\start-all.ps1 or npm run dev" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
