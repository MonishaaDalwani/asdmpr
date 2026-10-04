# 🏥 St. Jude Hospital Management System (Full MERN Stack)

A modern, enterprise-grade **Hospital Management System** built with the **MERN** stack (MongoDB, Express.js, React.js, Node.js) and Vite.

The solution is architected as three decoupled modules:
1. **Shared REST API Backend** (`backend/` on `http://localhost:5000`): Secure REST API powered by Express, MongoDB, Mongoose, and JWT authentication.
2. **Patient Frontend** (`frontend/` on `http://localhost:5173`): Patient-facing portal for booking appointments, exploring doctors, viewing consultation history, and messaging.
3. **Staff & Administration Dashboard** (`dashboard/` on `http://localhost:5174`): Specialized portal for Doctors and Hospital Administrators to manage clinical appointments, patient medical complaints, practitioner accounts, and operational analytics.

---

## 📑 Table of Contents
1. [Architecture & Technology Stack](#-architecture--technology-stack)
2. [Prerequisites on Windows](#-prerequisites-on-windows)
3. [Quick Start Guide (Windows PowerShell)](#-quick-start-guide-windows-powershell)
4. [Database Configuration (Local MongoDB vs MongoDB Atlas)](#-database-configuration)
5. [Demo User Credentials](#-demo-user-credentials)
6. [API Endpoints Reference](#-api-endpoints-reference)
7. [Running Tests](#-running-tests)
8. [Windows Troubleshooting](#-windows-troubleshooting)

---

## 🏗 Architecture & Technology Stack

| Layer | Technologies Used | Port |
| :--- | :--- | :--- |
| **Backend REST API** | Node.js, Express.js, Mongoose, JWT, bcryptjs, Vitest, Supertest | `5000` |
| **Patient Frontend** | React 18, Vite, React Router v6, Axios, Custom Responsive CSS | `5173` |
| **Doctor/Admin Dashboard** | React 18, Vite, React Router v6, Axios, Custom Responsive CSS | `5174` |
| **Database** | MongoDB (Community Server Local or MongoDB Atlas Cloud) | `27017` |

### Key System Highlights
- **Conflict Prevention**: Intelligent booking engine prevents overlapping appointments for the same doctor, date, and time slot (returns HTTP `409 Conflict`).
- **Role-Based Access Control (RBAC)**: Strict server-side verification using JWT middleware with `patient`, `doctor`, and `admin` permissions.
- **Stat Calculations**: Dashboard statistics calculated directly from database records.
- **Zero Heavy Bloatware**: Clean, responsive hospital UI without clunky external UI dependencies.

---

## 💻 Prerequisites on Windows

Ensure the following are installed on your Windows machine:
1. **Node.js** (v18.x, v20.x, or later): [Download Node.js for Windows](https://nodejs.org/)
2. **MongoDB**:
   - **Option A (Local)**: [MongoDB Community Server](https://www.mongodb.com/try/download/community) installed and running as a Windows Service (`net start MongoDB`).
   - **Option B (Cloud)**: A free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster connection string.

---

## 🚀 Quick Start Guide (Windows PowerShell)

Open **Windows PowerShell** and navigate to the project directory:

```powershell
cd Hospital_Management_System
```

### Step 1: Install Dependencies for All Applications

You can use our automated PowerShell installer:
```powershell
.\install-all.ps1
```

*Or manually install each application:*
```powershell
# Root dependencies (concurrently)
npm install

# Backend dependencies
cd backend
npm install
cd ..

# Patient frontend dependencies
cd frontend
npm install
cd ..

# Staff dashboard dependencies
cd dashboard
npm install
cd ..
```

---

### Step 2: Configure Environment Variables

The project comes pre-configured with default development `.env` files. If you need to customize them:

1. **Backend Environment** (`backend/.env`):
   ```ini
   PORT=5000
   NODE_ENV=development
   MONGO_URI=mongodb://127.0.0.1:27017/hospital_management
   JWT_SECRET=super_secret_hospital_jwt_key_2025_secure_and_long
   CLIENT_URL=http://localhost:5173
   DASHBOARD_URL=http://localhost:5174
   ```

2. **Patient Frontend Environment** (`frontend/.env`):
   ```ini
   VITE_API_URL=http://localhost:5000/api
   ```

3. **Staff Dashboard Environment** (`dashboard/.env`):
   ```ini
   VITE_API_URL=http://localhost:5000/api
   ```

---

### Step 3: Seed Database with Demo Accounts & Realistic Data

Make sure your MongoDB service is running, then run the seed script:

```powershell
npm run seed --prefix backend
```

This will automatically create:
- **1 Administrator account**
- **6 Medical Specialists** (Cardiology, Neurology, Pediatrics, Orthopedics, General Medicine, Dermatology) with schedules and consultation fees
- **2 Demo Patients**
- **4 Sample Appointments** across different statuses (`pending`, `accepted`, `completed`)
- **2 Sample Inquiries**

---

### Step 4: Start All 3 Applications

#### Option 1: One-Click Multi-Window PowerShell Launcher (Recommended for Windows)
```powershell
.\start-all.ps1
```
This opens 3 separate PowerShell windows for the Backend, Patient Frontend, and Staff Dashboard.

#### Option 2: Concurrently in a Single Terminal
```powershell
npm run dev
```

#### Option 3: Start Services in Separate Terminals Manually
Open three PowerShell tabs:

**Terminal 1 (Backend API):**
```powershell
cd Hospital_Management_System/backend
npm run dev
# Running on http://localhost:5000
```

**Terminal 2 (Patient Frontend):**
```powershell
cd Hospital_Management_System/frontend
npm run dev
# Running on http://localhost:5173
```

**Terminal 3 (Staff Dashboard):**
```powershell
cd Hospital_Management_System/dashboard
npm run dev
# Running on http://localhost:5174
```

---

## 🗄 Database Configuration

### Using Local MongoDB (Default)
1. Ensure the Windows MongoDB service is active. In PowerShell as Administrator:
   ```powershell
   net start MongoDB
   ```
2. The default URI in `backend/.env` is:
   ```ini
   MONGO_URI=mongodb://127.0.0.1:27017/hospital_management
   ```

### Using MongoDB Atlas (Cloud)
1. Sign in to [MongoDB Atlas](https://cloud.mongodb.com/) and create a free Shared Cluster.
2. In **Database Access**, create a database user (e.g. `hospital_admin` and a strong password).
3. In **Network Access**, add IP `0.0.0.0/0` (Allow Access from Anywhere) or your current IP.
4. Click **Connect** > **Drivers** > copy the connection string.
5. In `backend/.env`, replace `MONGO_URI`:
   ```ini
   MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/hospital_management?retryWrites=true&w=majority
   ```

---

## 🔑 Demo User Credentials

All seeded accounts use password: `Password123!`

### 1. Hospital Administrator
- **Portal URL**: `http://localhost:5174`
- **Email**: `admin@hospital.com`
- **Password**: `Password123!`
- **Role**: `admin`
- **Capabilities**: View operational statistics, register/edit/deactivate doctors, view patient directory, update any appointment status, reply to inquiries.

### 2. Medical Specialists (Doctors)
- **Portal URL**: `http://localhost:5174`
- **Password**: `Password123!`
- **Sample Logins**:
  - **Cardiology**: `dr.sarah@hospital.com`
  - **Neurology**: `dr.chen@hospital.com`
  - **Pediatrics**: `dr.emily@hospital.com`
  - **Orthopedics**: `dr.wilson@hospital.com`
  - **General Medicine**: `dr.priya@hospital.com`
  - **Dermatology**: `dr.adams@hospital.com`
- **Capabilities**: View assigned consultations, accept/reject requests, mark appointments completed with clinical diagnosis and prescription notes, update weekly consultation hours.

### 3. Patients
- **Portal URL**: `http://localhost:5173`
- **Password**: `Password123!`
- **Sample Logins**:
  - `john.doe@example.com`
  - `jane.smith@example.com`
- **Capabilities**: Search doctors, book consultations with conflict check, review appointment history and doctor notes, cancel scheduled visits, send contact messages.
*(Note: You can also register a brand new patient account on the frontend registration page!)*

---

## 📡 API Endpoints Reference

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Register a new patient account (Public)
- `POST /api/auth/login` - Login user (Returns JWT token and user info)
- `GET /api/auth/me` - Get profile of authenticated user (Private)
- `PUT /api/auth/profile` - Update profile information (Private)
- `PUT /api/auth/change-password` - Change account password (Private)
- `GET /api/auth/patients` - List all registered patients with appointment counts (Admin only)

### Doctors (`/api/doctors`)
- `GET /api/doctors` - Get active doctors for directory, supports `?department=` & `?search=` (Public)
- `GET /api/doctors/:id` - Get single doctor details (Public)
- `GET /api/doctors/admin/all` - List all doctors with pagination & filters (Admin only)
- `POST /api/doctors` - Register new doctor (Admin only)
- `PUT /api/doctors/:id` - Edit doctor details (Admin only)
- `PATCH /api/doctors/:id/toggle-status` - Toggle doctor active/inactive (Admin only)

### Appointments (`/api/appointments`)
- `POST /api/appointments` - Book appointment with conflict prevention (Patient only)
- `GET /api/appointments/my-appointments` - Get patient's appointments (Patient only)
- `GET /api/appointments/doctor-appointments` - Get doctor's assigned appointments (Doctor only)
- `GET /api/appointments/admin/all` - Master list of all appointments (Admin only)
- `GET /api/appointments/:id` - Get single appointment record (Authorized users)
- `PATCH /api/appointments/:id/status` - Update appointment status / add notes (Doctor or Admin)
- `PATCH /api/appointments/:id/cancel` - Cancel appointment (Patient or Admin)

### Messages & Inquiries (`/api/messages`)
- `POST /api/messages` - Send contact inquiry (Public / Patient)
- `GET /api/messages` - List all inquiries with filters & search (Admin only)
- `GET /api/messages/:id` - View message and mark read (Admin only)
- `PUT /api/messages/:id/reply` - Record official reply (Admin only)
- `DELETE /api/messages/:id` - Delete message (Admin only)

### Statistics (`/api/stats`)
- `GET /api/stats/admin` - Live dashboard KPIs and department breakdown (Admin only)
- `GET /api/stats/doctor` - Live practitioner KPIs and consultation schedule (Doctor only)

---

## 🧪 Running Tests

The backend includes comprehensive integration test suites using **Vitest** and **Supertest** covering:
- Patient registration and duplicate email rejection
- Login with valid and invalid credentials
- Protected route authentication & JWT validation
- Role-based authorization (Patients blocked from Admin routes)
- Appointment booking and input validation
- Duplicate booking prevention for same date & doctor
- Conflict prevention for same doctor, date, and time slot (HTTP 409)
- Status update workflow (Pending -> Accepted -> Completed with notes)
- Patient cancellation rules

To run the backend tests:
```powershell
cd Hospital_Management_System/backend
npm test
```

Or from the root directory:
```powershell
npm run test:backend
```

---

## 🔧 Windows Troubleshooting

1. **`MONGO_URI` connection error: `ECONNREFUSED 127.0.0.1:27017`**:
   - Check if MongoDB is running:
     ```powershell
     Get-Service -Name MongoDB
     ```
   - Start the service if stopped:
     ```powershell
     net start MongoDB
     ```
   - Alternatively, configure a free cloud MongoDB Atlas cluster in `backend/.env`.

2. **PowerShell execution policy error (`running scripts is disabled on this system`)**:
   - Run this once in PowerShell:
     ```powershell
     Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
     ```

3. **Port collision (`EADDRINUSE: address already in use :::5000`)**:
   - Find what is using port 5000:
     ```powershell
     netstat -ano | findstr :5000
     ```
   - Kill the lingering process using its PID:
     ```powershell
     Stop-Process -Id <PID> -Force
     ```

4. **Cross-Origin Requests (CORS) blocked**:
   - Verify that `CLIENT_URL=http://localhost:5173` and `DASHBOARD_URL=http://localhost:5174` match your frontend origins in `backend/.env`.
