import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Alert from '../components/Alert';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [message, setMessage] = useState({ type: '', text: '' });

  // Cancel modal state
  const [cancellingAppt, setCancellingAppt] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, [statusFilter]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const url =
        statusFilter === 'all'
          ? '/appointments/my-appointments'
          : `/appointments/my-appointments?status=${statusFilter}`;
      const res = await api.get(url);
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

  const handleOpenCancelModal = (appointment) => {
    setCancellingAppt(appointment);
    setCancelReason('');
  };

  const handleCloseCancelModal = () => {
    setCancellingAppt(null);
    setCancelReason('');
  };

  const handleConfirmCancel = async () => {
    if (!cancellingAppt) return;
    setCancelLoading(true);

    try {
      const res = await api.patch(`/appointments/${cancellingAppt._id}/cancel`, {
        cancellationReason: cancelReason || 'Cancelled by patient',
      });

      if (res.data.success) {
        setMessage({ type: 'success', text: 'Appointment cancelled successfully.' });
        handleCloseCancelModal();
        fetchAppointments();
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to cancel appointment.',
      });
    } finally {
      setCancelLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
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
        return <span className="badge badge-default">{status}</span>;
    }
  };

  return (
    <div className="container page-container">
      <div className="page-header-flex">
        <div>
          <span className="page-subtitle">Patient Records</span>
          <h1 className="page-title">My Consultation Appointments</h1>
          <p className="page-desc">Track status updates, review doctor advice, or cancel scheduled visits.</p>
        </div>
        <Link to="/book-appointment" className="btn btn-primary">
          + Book New Appointment
        </Link>
      </div>

      {message.text && (
        <Alert
          type={message.type}
          message={message.text}
          onClose={() => setMessage({ type: '', text: '' })}
        />
      )}

      {/* Filter Tabs */}
      <div className="filter-tabs-row">
        {['all', 'pending', 'accepted', 'completed', 'cancelled'].map((tab) => (
          <button
            key={tab}
            className={`tab-btn ${statusFilter === tab ? 'active' : ''}`}
            onClick={() => setStatusFilter(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Appointments List */}
      {loading ? (
        <LoadingSpinner message="Fetching your appointments..." />
      ) : appointments.length === 0 ? (
        <EmptyState
          icon="📅"
          title="No appointments scheduled"
          description="You don't have any appointments matching this category."
          actionLabel="Book An Appointment Now"
          actionLink="/book-appointment"
        />
      ) : (
        <div className="appointments-list-grid">
          {appointments.map((appt) => {
            const canCancel = appt.status === 'pending' || appt.status === 'accepted';
            return (
              <div key={appt._id} className="appointment-card">
                <div className="appointment-card-header">
                  <div>
                    <span className="appt-dept">{appt.department}</span>
                    <h3 className="appt-doctor-name">
                      Dr. {appt.doctor?.name || 'Physician'}
                    </h3>
                    <p className="appt-doctor-spec">{appt.doctor?.specialization}</p>
                  </div>
                  <div>{getStatusBadge(appt.status)}</div>
                </div>

                <div className="appointment-meta-grid">
                  <div className="meta-box">
                    <span className="meta-label">📅 Date:</span>
                    <strong>{appt.appointmentDate}</strong>
                  </div>
                  <div className="meta-box">
                    <span className="meta-label">⏰ Slot:</span>
                    <strong>{appt.appointmentTimeSlot}</strong>
                  </div>
                  <div className="meta-box">
                    <span className="meta-label">💵 Fee:</span>
                    <strong>${appt.fee || appt.doctor?.doctorFee || 500}</strong>
                  </div>
                </div>

                <div className="appointment-reason-box">
                  <span className="reason-label">Reason for Visit:</span>
                  <p className="reason-text">{appt.reason}</p>
                </div>

                {/* Doctor's Notes & Advice (if provided) */}
                {appt.doctorNotes && (
                  <div className="doctor-notes-box">
                    <span className="notes-label">🩺 Doctor's Notes & Prescription:</span>
                    <p className="notes-text">{appt.doctorNotes}</p>
                  </div>
                )}

                {/* Cancellation Details (if cancelled) */}
                {appt.status === 'cancelled' && appt.cancellationReason && (
                  <div className="cancel-info-box">
                    <span className="cancel-label">Cancellation Reason:</span>
                    <p className="cancel-text">{appt.cancellationReason}</p>
                  </div>
                )}

                {/* Action button */}
                {canCancel && (
                  <div className="appointment-card-actions">
                    <button
                      onClick={() => handleOpenCancelModal(appt)}
                      className="btn btn-outline-danger btn-sm"
                    >
                      Cancel Appointment
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Cancellation Confirmation Modal */}
      {cancellingAppt && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <div className="modal-header">
              <h3>Cancel Appointment</h3>
              <button onClick={handleCloseCancelModal} className="modal-close-btn">
                &times;
              </button>
            </div>
            <div className="modal-body">
              <p>
                Are you sure you want to cancel your consultation with{' '}
                <strong>{cancellingAppt.doctor?.name}</strong> on{' '}
                <strong>{cancellingAppt.appointmentDate}</strong> ({cancellingAppt.appointmentTimeSlot})?
              </p>
              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label className="form-label" htmlFor="cancelReasonInput">
                  Cancellation Reason (Optional):
                </label>
                <textarea
                  id="cancelReasonInput"
                  className="form-input form-textarea"
                  rows="3"
                  placeholder="e.g. Schedule conflict, feeling better, need to reschedule..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                ></textarea>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                onClick={handleCloseCancelModal}
                className="btn btn-ghost"
                disabled={cancelLoading}
              >
                Keep Appointment
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                className="btn btn-danger"
                disabled={cancelLoading}
              >
                {cancelLoading ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAppointments;
