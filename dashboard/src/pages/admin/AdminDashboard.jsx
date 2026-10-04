import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import Alert from '../../components/Alert';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await api.get('/stats/admin');
      if (res.data.success) {
        setStats(res.data.stats);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load system metrics.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="badge badge-warning">Pending</span>;
      case 'accepted':
        return <span className="badge badge-info">Accepted</span>;
      case 'completed':
        return <span className="badge badge-success">Completed</span>;
      case 'rejected':
        return <span className="badge badge-danger">Rejected</span>;
      case 'cancelled':
        return <span className="badge badge-muted">Cancelled</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  if (loading) {
    return <LoadingSpinner message="Calculating real-time hospital statistics..." />;
  }

  return (
    <div className="dashboard-content-area">
      <div className="content-header">
        <div>
          <span className="content-pretitle">ADMINISTRATIVE INTELLIGENCE</span>
          <h1 className="content-title">Hospital Overview & Statistics</h1>
          <p className="content-desc">
            Real-time live clinical and operational analytics across departments and medical staff.
          </p>
        </div>
        <div className="header-actions">
          <Link to="/admin/doctors" className="btn btn-primary">
            + Add New Doctor
          </Link>
          <Link to="/admin/appointments" className="btn btn-outline">
            View All Appointments
          </Link>
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* KPI Stat Cards Grid */}
      <div className="stats-kpi-grid">
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Total Patients</span>
            <span className="kpi-icon icon-blue">👥</span>
          </div>
          <div className="kpi-value">{stats?.totalPatients || 0}</div>
          <div className="kpi-subtitle">Registered patient profiles</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Active Doctors</span>
            <span className="kpi-icon icon-teal">👨‍⚕️</span>
          </div>
          <div className="kpi-value">
            {stats?.activeDoctors || 0}{' '}
            <span className="kpi-subval">/ {stats?.totalDoctors || 0}</span>
          </div>
          <div className="kpi-subtitle">Specialists on duty</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Total Consultations</span>
            <span className="kpi-icon icon-purple">📅</span>
          </div>
          <div className="kpi-value">{stats?.totalAppointments || 0}</div>
          <div className="kpi-subtitle">All-time bookings</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Pending Confirmation</span>
            <span className="kpi-icon icon-amber">⏳</span>
          </div>
          <div className="kpi-value text-amber">{stats?.pendingAppointments || 0}</div>
          <div className="kpi-subtitle">Awaiting doctor review</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Accepted / Active</span>
            <span className="kpi-icon icon-cyan">✅</span>
          </div>
          <div className="kpi-value text-cyan">{stats?.acceptedAppointments || 0}</div>
          <div className="kpi-subtitle">Scheduled consultations</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Completed Visits</span>
            <span className="kpi-icon icon-green">🏆</span>
          </div>
          <div className="kpi-value text-green">{stats?.completedAppointments || 0}</div>
          <div className="kpi-subtitle">Fulfilled healthcare visits</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Today's Schedule</span>
            <span className="kpi-icon icon-indigo">📌</span>
          </div>
          <div className="kpi-value">{stats?.todayAppointments || 0}</div>
          <div className="kpi-subtitle">Appointments for today</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Unread Inquiries</span>
            <span className="kpi-icon icon-rose">💬</span>
          </div>
          <div className="kpi-value text-rose">{stats?.unreadMessages || 0}</div>
          <div className="kpi-subtitle">Patient messages pending</div>
        </div>
      </div>

      <div className="dashboard-two-col">
        {/* Recent Appointments Table */}
        <div className="dashboard-panel panel-wide">
          <div className="panel-header">
            <div>
              <h3>Recent Consultations</h3>
              <p className="panel-desc">Latest appointments booked across all departments</p>
            </div>
            <Link to="/admin/appointments" className="panel-link">
              View All &rarr;
            </Link>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Department</th>
                  <th>Date & Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats?.recentAppointments && stats.recentAppointments.length > 0 ? (
                  stats.recentAppointments.map((appt) => (
                    <tr key={appt._id}>
                      <td>
                        <strong>{appt.patient?.name || 'Guest'}</strong>
                        <div className="table-subtext">{appt.patient?.email}</div>
                      </td>
                      <td>
                        <strong>{appt.doctor?.name || 'Physician'}</strong>
                        <div className="table-subtext">{appt.doctor?.specialization}</div>
                      </td>
                      <td>
                        <span className="badge badge-dept">{appt.department}</span>
                      </td>
                      <td>
                        <div>{appt.appointmentDate}</div>
                        <div className="table-subtext">{appt.appointmentTimeSlot}</div>
                      </td>
                      <td>{getStatusBadge(appt.status)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center text-muted">
                      No appointments recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Department Breakdown */}
        <div className="dashboard-panel">
          <div className="panel-header">
            <h3>Department Breakdown</h3>
            <p className="panel-desc">Appointments volume by specialty</p>
          </div>

          <div className="dept-breakdown-list">
            {stats?.departmentBreakdown && stats.departmentBreakdown.length > 0 ? (
              stats.departmentBreakdown.map((item, idx) => (
                <div key={idx} className="dept-stat-row">
                  <span className="dept-stat-name">{item._id || 'General'}</span>
                  <div className="dept-stat-bar-box">
                    <span className="dept-stat-count">{item.count} visits</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted text-center" style={{ padding: '1.5rem 0' }}>
                No department bookings yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
