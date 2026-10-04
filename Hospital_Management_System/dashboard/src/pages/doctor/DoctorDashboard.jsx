import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import Alert from '../../components/Alert';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDoctorStats();
  }, []);

  const fetchDoctorStats = async () => {
    setLoading(true);
    try {
      const res = await api.get('/stats/doctor');
      if (res.data.success) {
        setStats(res.data.stats);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch doctor dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (st) => {
    switch (st) {
      case 'pending':
        return <span className="badge badge-warning">Pending Review</span>;
      case 'accepted':
        return <span className="badge badge-info">Accepted</span>;
      case 'completed':
        return <span className="badge badge-success">Completed</span>;
      case 'rejected':
        return <span className="badge badge-danger">Rejected</span>;
      case 'cancelled':
        return <span className="badge badge-muted">Cancelled</span>;
      default:
        return <span className="badge">{st}</span>;
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading your clinical schedule..." />;
  }

  return (
    <div className="dashboard-content-area">
      <div className="content-header">
        <div>
          <span className="content-pretitle">PHYSICIAN CONSOLE</span>
          <h1 className="content-title">Clinical Practice Overview</h1>
          <p className="content-desc">
            Welcome, <strong>Dr. {user?.name}</strong> ({user?.specialization} - {user?.department}). Review patient appointments and pending consultations.
          </p>
        </div>
        <div className="header-actions">
          <Link to="/doctor/appointments" className="btn btn-primary">
            View My Full Schedule
          </Link>
          <Link to="/doctor/profile" className="btn btn-outline">
            Edit Availability
          </Link>
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* KPI Stat Cards */}
      <div className="stats-kpi-grid">
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Total Assigned Visits</span>
            <span className="kpi-icon icon-blue">📋</span>
          </div>
          <div className="kpi-value">{stats?.totalAppointments || 0}</div>
          <div className="kpi-subtitle">All-time patient consultations</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Pending Requests</span>
            <span className="kpi-icon icon-amber">⏳</span>
          </div>
          <div className="kpi-value text-amber">{stats?.pendingAppointments || 0}</div>
          <div className="kpi-subtitle">Needs doctor acceptance</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Confirmed Visits</span>
            <span className="kpi-icon icon-cyan">📅</span>
          </div>
          <div className="kpi-value text-cyan">{stats?.acceptedAppointments || 0}</div>
          <div className="kpi-subtitle">Scheduled & confirmed</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Completed Cases</span>
            <span className="kpi-icon icon-green">🏆</span>
          </div>
          <div className="kpi-value text-green">{stats?.completedAppointments || 0}</div>
          <div className="kpi-subtitle">Successfully treated</div>
        </div>
      </div>

      {/* Upcoming / Confirmed Appointments */}
      <div className="dashboard-panel">
        <div className="panel-header">
          <div>
            <h3>Upcoming Confirmed Consultations</h3>
            <p className="panel-desc">Patients awaiting examination</p>
          </div>
          <Link to="/doctor/appointments" className="panel-link">
            Manage All Appointments &rarr;
          </Link>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Patient Details</th>
                <th>Appointment Slot</th>
                <th>Symptoms / Reason</th>
                <th>Status</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {stats?.upcomingAppointments && stats.upcomingAppointments.length > 0 ? (
                stats.upcomingAppointments.map((appt) => (
                  <tr key={appt._id}>
                    <td>
                      <strong>{appt.patient?.name || 'Patient'}</strong>
                      <div className="table-subtext">
                        {appt.patient?.gender} {appt.patient?.dob ? `| DOB: ${appt.patient?.dob}` : ''}
                      </div>
                      <div className="table-subtext">{appt.patient?.phone}</div>
                    </td>
                    <td>
                      <div>📅 {appt.appointmentDate}</div>
                      <div className="table-subtext">⏰ {appt.appointmentTimeSlot}</div>
                    </td>
                    <td>
                      <p className="table-msg-preview">{appt.reason}</p>
                    </td>
                    <td>{getStatusBadge(appt.status)}</td>
                    <td className="text-right">
                      <Link to="/doctor/appointments" className="btn btn-primary btn-xs">
                        Open File
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center text-muted" style={{ padding: '2rem' }}>
                    No upcoming confirmed consultations found. Check pending requests in your appointment list.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
