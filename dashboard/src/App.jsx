import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layout components
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import AdminDashboard from './pages/admin/AdminDashboard';
import DoctorsManagement from './pages/admin/DoctorsManagement';
import PatientsManagement from './pages/admin/PatientsManagement';
import AppointmentsManagement from './pages/admin/AppointmentsManagement';
import MessagesManagement from './pages/admin/MessagesManagement';

import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorAppointments from './pages/doctor/DoctorAppointments';
import DoctorProfile from './pages/doctor/DoctorProfile';

import NotFound from './pages/NotFound';

// App shell for authenticated views
const DashboardLayout = ({ children }) => {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-main-wrapper">
        <Header />
        <main>{children}</main>
      </div>
    </div>
  );
};

// Root redirect handler
const RootRedirect = () => {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (role === 'doctor') return <Navigate to="/doctor/dashboard" replace />;
  return <Navigate to="/login" replace />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<Login />} />

      {/* Admin Specific Protected Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <DashboardLayout>
              <AdminDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/doctors"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <DashboardLayout>
              <DoctorsManagement />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/patients"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <DashboardLayout>
              <PatientsManagement />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/appointments"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <DashboardLayout>
              <AppointmentsManagement />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/messages"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <DashboardLayout>
              <MessagesManagement />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Doctor Specific Protected Routes */}
      <Route
        path="/doctor/dashboard"
        element={
          <ProtectedRoute allowedRoles={['doctor']}>
            <DashboardLayout>
              <DoctorDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/appointments"
        element={
          <ProtectedRoute allowedRoles={['doctor']}>
            <DashboardLayout>
              <DoctorAppointments />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/profile"
        element={
          <ProtectedRoute allowedRoles={['doctor']}>
            <DashboardLayout>
              <DoctorProfile />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* 404 Route */}
      <Route
        path="*"
        element={
          <DashboardLayout>
            <NotFound />
          </DashboardLayout>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
