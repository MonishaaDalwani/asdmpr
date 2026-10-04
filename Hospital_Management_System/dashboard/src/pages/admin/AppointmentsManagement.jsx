import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Alert from '../../components/Alert';
import LoadingSpinner from '../../components/LoadingSpinner';
import Pagination from '../../components/Pagination';

const AppointmentsManagement = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [status, setStatus] = useState('all');
  const [department, setDepartment] = useState('all');
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  // Update status modal
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  const departmentsList = [
    'Cardiology',
    'Neurology',
    'Pediatrics',
    'Orthopedics',
    'General Medicine',
    'Dermatology',
  ];

  useEffect(() => {
    fetchAppointments();
  }, [page, status, department]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (status !== 'all') params.status = status;
      if (department !== 'all') params.department = department;
      if (search.trim()) params.search = search.trim();

      const res = await api.get('/appointments/admin/all', { params });
      if (res.data.success) {
        setAppointments(res.data.appointments);
        setTotal(res.data.total);
        setPages(res.data.pages);
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to fetch appointments.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchAppointments();
  };

  const handleOpenStatusModal = (appt) => {
    setSelectedAppt(appt);
    setNewStatus(appt.status);
    setNotes(appt.doctorNotes || '');
  };

  const handleCloseStatusModal = () => {
    setSelectedAppt(null);
    setNewStatus('');
    setNotes('');
  };

  const handleUpdateStatusSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAppt) return;
    setUpdating(true);

    try {
      const res = await api.patch(`/appointments/${selectedAppt._id}/status`, {
        status: newStatus,
        doctorNotes: notes,
      });

      if (res.data.success) {
        setMessage({ type: 'success', text: `Appointment status updated to ${newStatus}.` });
        handleCloseStatusModal();
        fetchAppointments();
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update appointment status.',
      });
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (st) => {
    switch (st) {
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
        return <span className="badge">{st}</span>;
    }
  };

  return (
    <div className="dashboard-content-area">
      <div className="content-header">
        <div>
          <span className="content-pretitle">CLINICAL SCHEDULING</span>
          <h1 className="content-title">All Hospital Appointments</h1>
          <p className="content-desc">
            Master database of all patient consultations, assigned physicians, and operational statuses.
          </p>
        </div>
      </div>

      {message.text && (
        <Alert
          type={message.type}
          message={message.text}
          onClose={() => setMessage({ type: '', text: '' })}
        />
      )}

      {/* Filter and Search */}
      <div className="filter-card">
        <form onSubmit={handleSearchSubmit} className="search-row">
          <input
            type="text"
            className="form-input"
            placeholder="Search patient, doctor, or keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">
            Search
          </button>
        </form>

        <div className="filter-select-group">
          <div className="select-wrapper">
            <label className="select-label">Status:</label>
            <select
              className="form-input"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="select-wrapper">
            <label className="select-label">Department:</label>
            <select
              className="form-input"
              value={department}
              onChange={(e) => {
                setDepartment(e.target.value);
                setPage(1);
              }}
            >
              <option value="all">All Departments</option>
              {departmentsList.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="dashboard-panel">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Date & Slot</th>
                <th>Reason for Visit</th>
                <th>Status</th>
                <th className="text-right">Manage</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6">
                    <LoadingSpinner message="Loading appointment records..." />
                  </td>
                </tr>
              ) : appointments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center text-muted" style={{ padding: '2.5rem' }}>
                    No appointments found matching current filters.
                  </td>
                </tr>
              ) : (
                appointments.map((appt) => (
                  <tr key={appt._id}>
                    <td>
                      <strong>{appt.patient?.name || 'Patient'}</strong>
                      <div className="table-subtext">{appt.patient?.phone || appt.patient?.email}</div>
                    </td>
                    <td>
                      <strong>{appt.doctor?.name || 'Physician'}</strong>
                      <div className="table-subtext">{appt.department}</div>
                    </td>
                    <td>
                      <div>📅 {appt.appointmentDate}</div>
                      <div className="table-subtext">⏰ {appt.appointmentTimeSlot}</div>
                    </td>
                    <td>
                      <span className="table-reason-snippet" title={appt.reason}>
                        {appt.reason}
                      </span>
                    </td>
                    <td>{getStatusBadge(appt.status)}</td>
                    <td className="text-right">
                      <button
                        onClick={() => handleOpenStatusModal(appt)}
                        className="btn btn-outline btn-xs"
                      >
                        Update Status
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination currentPage={page} totalPages={pages} onPageChange={(p) => setPage(p)} />
      </div>

      {/* Status Update Modal */}
      {selectedAppt && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <div className="modal-header">
              <h3>Update Appointment Status</h3>
              <button onClick={handleCloseStatusModal} className="modal-close-btn">
                &times;
              </button>
            </div>
            <form onSubmit={handleUpdateStatusSubmit}>
              <div className="modal-body">
                <p style={{ marginBottom: '1rem' }}>
                  Updating consultation for <strong>{selectedAppt.patient?.name}</strong> with{' '}
                  <strong>{selectedAppt.doctor?.name}</strong> on {selectedAppt.appointmentDate}.
                </p>

                <div className="form-group">
                  <label className="form-label">New Status *</label>
                  <select
                    className="form-input"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    required
                  >
                    <option value="pending">Pending</option>
                    <option value="accepted">Accepted / Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="rejected">Rejected</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Doctor Notes / Diagnostic Summary</label>
                  <textarea
                    className="form-input form-textarea"
                    rows="3"
                    placeholder="Enter diagnostic summary, prescription, or cancellation reason..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  onClick={handleCloseStatusModal}
                  className="btn btn-ghost"
                  disabled={updating}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={updating}>
                  {updating ? 'Saving...' : 'Update Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentsManagement;
