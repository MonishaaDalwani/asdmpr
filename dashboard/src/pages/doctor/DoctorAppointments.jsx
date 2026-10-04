import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Alert from '../../components/Alert';
import LoadingSpinner from '../../components/LoadingSpinner';

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  // Complete consultation modal
  const [completingAppt, setCompletingAppt] = useState(null);
  const [diagnosisNotes, setDiagnosisNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Reject consultation modal
  const [rejectingAppt, setRejectingAppt] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchAppointments();
  }, [statusFilter, dateFilter]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (dateFilter) params.date = dateFilter;
      if (search.trim()) params.search = search.trim();

      const res = await api.get('/appointments/doctor-appointments', { params });
      if (res.data.success) {
        setAppointments(res.data.appointments);
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to load appointments.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchAppointments();
  };

  const handleAcceptAppointment = async (apptId) => {
    setActionLoading(true);
    try {
      const res = await api.patch(`/appointments/${apptId}/status`, {
        status: 'accepted',
        doctorNotes: 'Appointment accepted by physician.',
      });

      if (res.data.success) {
        setMessage({ type: 'success', text: 'Appointment accepted successfully.' });
        fetchAppointments();
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to accept appointment.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenCompleteModal = (appt) => {
    setCompletingAppt(appt);
    setDiagnosisNotes(appt.doctorNotes || '');
  };

  const handleCloseCompleteModal = () => {
    setCompletingAppt(null);
    setDiagnosisNotes('');
  };

  const handleConfirmComplete = async (e) => {
    e.preventDefault();
    if (!completingAppt) return;
    setActionLoading(true);

    try {
      const res = await api.patch(`/appointments/${completingAppt._id}/status`, {
        status: 'completed',
        doctorNotes: diagnosisNotes || 'Consultation concluded and prescriptions delivered.',
      });

      if (res.data.success) {
        setMessage({ type: 'success', text: 'Consultation marked as completed.' });
        handleCloseCompleteModal();
        fetchAppointments();
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to complete appointment.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenRejectModal = (appt) => {
    setRejectingAppt(appt);
    setRejectionReason('');
  };

  const handleCloseRejectModal = () => {
    setRejectingAppt(null);
    setRejectionReason('');
  };

  const handleConfirmReject = async (e) => {
    e.preventDefault();
    if (!rejectingAppt) return;
    setActionLoading(true);

    try {
      const res = await api.patch(`/appointments/${rejectingAppt._id}/status`, {
        status: 'rejected',
        cancellationReason: rejectionReason || 'Doctor unavailable at requested time',
      });

      if (res.data.success) {
        setMessage({ type: 'success', text: 'Appointment request rejected.' });
        handleCloseRejectModal();
        fetchAppointments();
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to reject appointment.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (st) => {
    switch (st) {
      case 'pending':
        return <span className="badge badge-warning">Pending Review</span>;
      case 'accepted':
        return <span className="badge badge-info">Accepted / Confirmed</span>;
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
          <span className="content-pretitle">CLINICAL SCHEDULE</span>
          <h1 className="content-title">Assigned Patient Appointments</h1>
          <p className="content-desc">
            Manage your patient appointments, review symptoms, accept or reject bookings, and record clinical diagnosis notes.
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

      {/* Filter and Search Bar */}
      <div className="filter-card">
        <form onSubmit={handleSearchSubmit} className="search-row">
          <input
            type="text"
            className="form-input"
            placeholder="Search patient name, email, or symptoms..."
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
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Appointments</option>
              <option value="pending">Pending Review</option>
              <option value="accepted">Accepted / Confirmed</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="select-wrapper">
            <label className="select-label">Filter Date:</label>
            <input
              type="date"
              className="form-input"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>

          {dateFilter && (
            <button
              type="button"
              className="btn btn-ghost btn-xs"
              onClick={() => setDateFilter('')}
              style={{ alignSelf: 'flex-end', marginBottom: '4px' }}
            >
              Clear Date
            </button>
          )}
        </div>
      </div>

      <div className="dashboard-panel">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Patient Details</th>
                <th>Appointment Time</th>
                <th>Clinical Reason & Symptoms</th>
                <th>Status</th>
                <th>Doctor Notes</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6">
                    <LoadingSpinner message="Loading assigned appointments..." />
                  </td>
                </tr>
              ) : appointments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center text-muted" style={{ padding: '2.5rem' }}>
                    No appointments found matching current filter parameters.
                  </td>
                </tr>
              ) : (
                appointments.map((appt) => (
                  <tr key={appt._id}>
                    <td>
                      <div className="table-patient-info">
                        <div>
                          <strong>{appt.patient?.name || 'Patient'}</strong>
                          <div className="table-subtext">{appt.patient?.email}</div>
                          <div className="table-subtext">
                            {appt.patient?.phone} {appt.patient?.gender ? `| ${appt.patient.gender}` : ''}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div>📅 {appt.appointmentDate}</div>
                      <div className="table-subtext">⏰ {appt.appointmentTimeSlot}</div>
                    </td>
                    <td>
                      <p className="table-msg-preview">{appt.reason}</p>
                    </td>
                    <td>{getStatusBadge(appt.status)}</td>
                    <td>
                      <span className="table-notes-text">
                        {appt.doctorNotes || '—'}
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="table-action-btns">
                        {appt.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleAcceptAppointment(appt._id)}
                              className="btn btn-primary btn-xs"
                              disabled={actionLoading}
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleOpenRejectModal(appt)}
                              className="btn btn-outline-danger btn-xs"
                              disabled={actionLoading}
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {appt.status === 'accepted' && (
                          <button
                            onClick={() => handleOpenCompleteModal(appt)}
                            className="btn btn-outline btn-xs btn-complete-highlight"
                            disabled={actionLoading}
                          >
                            Mark Completed
                          </button>
                        )}

                        {appt.status === 'completed' && (
                          <button
                            onClick={() => handleOpenCompleteModal(appt)}
                            className="btn btn-ghost btn-xs"
                          >
                            Edit Notes
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Complete Consultation Modal */}
      {completingAppt && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <div className="modal-header">
              <h3>Conclude Consultation & Diagnosis</h3>
              <button onClick={handleCloseCompleteModal} className="modal-close-btn">
                &times;
              </button>
            </div>
            <form onSubmit={handleConfirmComplete}>
              <div className="modal-body">
                <p style={{ marginBottom: '1rem' }}>
                  Patient: <strong>{completingAppt.patient?.name}</strong> | Complaint:{' '}
                  <em>{completingAppt.reason}</em>
                </p>

                <div className="form-group">
                  <label className="form-label">
                    Diagnosis, Prescription & Treatment Advice *
                  </label>
                  <textarea
                    className="form-input form-textarea"
                    rows="5"
                    placeholder="Enter diagnosis, prescribed medications, follow-up recommendations, or clinical advice for the patient..."
                    value={diagnosisNotes}
                    onChange={(e) => setDiagnosisNotes(e.target.value)}
                    required
                  ></textarea>
                  <small className="form-help">
                    This note will be visible to the patient on their dashboard.
                  </small>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  onClick={handleCloseCompleteModal}
                  className="btn btn-ghost"
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Saving...' : 'Save & Complete Visit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Appointment Modal */}
      {rejectingAppt && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <div className="modal-header">
              <h3>Reject Appointment Request</h3>
              <button onClick={handleCloseRejectModal} className="modal-close-btn">
                &times;
              </button>
            </div>
            <form onSubmit={handleConfirmReject}>
              <div className="modal-body">
                <p>
                  Are you sure you want to decline consultation with{' '}
                  <strong>{rejectingAppt.patient?.name}</strong> on {rejectingAppt.appointmentDate}?
                </p>

                <div className="form-group" style={{ marginTop: '1rem' }}>
                  <label className="form-label">Reason for Rejection (Optional)</label>
                  <textarea
                    className="form-input form-textarea"
                    rows="3"
                    placeholder="e.g. In emergency surgery, schedule conflict, requires referral..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  onClick={handleCloseRejectModal}
                  className="btn btn-ghost"
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-danger"
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Declining...' : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorAppointments;
