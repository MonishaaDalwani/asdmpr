# Hospital Management System

This workspace contains the complete, full-stack **Hospital Management System** implemented from scratch inside the `Hospital_Management_System/` directory.

### Quick Directory Structure
- `Hospital_Management_System/`
  - `backend/` - Node.js + Express + MongoDB REST API (Port 5000)
  - `frontend/` - Patient Portal React + Vite app (Port 5173)
  - `dashboard/` - Doctor & Administrator Dashboard React + Vite app (Port 5174)
  - `README.md` - Complete documentation, setup guide, demo credentials, and API docs
  - `install-all.ps1` - Windows PowerShell dependency installer
  - `start-all.ps1` - Windows PowerShell launcher starting all 3 apps

### Quick Start (Windows PowerShell)
```powershell
cd Hospital_Management_System
.\install-all.ps1
npm run seed --prefix backend
.\start-all.ps1
```

For full details, please refer to [Hospital_Management_System/README.md](./Hospital_Management_System/README.md).
