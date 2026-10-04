import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/Alert';
import LoadingSpinner from '../components/LoadingSpinner';

const BookAppointment = () => {
  const [searchParams] = useSearchParams();
  const preselectedDoctorId = searchParams.get('doctorId') || '';
  const preselectedDept = searchParams.get('department') || '';

  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState(null);

  // Form fields
  const [department, setDepartment] = useState(preselectedDept);
  const [doctorId, setDoctorId] = useState(preselectedDoctorId);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTimeSlot, setAppointmentTimeSlot] = useState('');
  const [reason, setReason] = useState('');

  const departments = [
    'Cardiology',
    'Neurology',
    'Pediatrics',
    'Orthopedics',
    'General Medicine',
    'Dermatology',
  ];

  const standardTimeSlots = [
    '09:00 - 09:30',
    '09:30 - 10:00',
    '10:00 - 10:30',
    '10:30 - 11:00',
    '11:00 - 11:30',
    '11:30 - 12:00',
    '14:00 - 14:30',
    '14:30 - 15:00',
    '15:00 - 15:30',
    '15:30 - 16:00',
    '16:00 - 16:30',
  ];

  // Fetch all active doctors
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await api.get('/doctors');
        if (res.data.success) {
          setDoctors(res.data.doctors);
        }
      } catch (err) {
        setError('Failed to fetch doctors list. Please refresh the page.');
      } finally {
        setLoadingDoctors(false);
      }
    };

    fetchDoctors();
  }, []);

  // Filter doctors by selected department
  const filteredDoctors = department
    ? doctors.filter((doc) => doc.department === department)
    : doctors;

  // Selected doctor object for fee & details
  const selectedDoctor = doctors.find((doc) => doc._id === doctorId);

  // Set today as minimum selectable date
  const todayStr = new Date().toISOString().split('T')[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isAuthenticated) {
      navigate('/login?redirect=/book-appointment');
      return;
    }

    if (!doctorId) {
      setError('Please select a doctor.');
      return;
    }

    if (!appointmentDate) {
      setError('Please select an appointment date.');
      return;
    }

    if (!appointmentTimeSlot) {
      setError('Please select a time slot.');
      return;
    }

    if (!reason.trim()) {
      setError('Please provide a reason or describe your symptoms.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await api.post('/appointments', {
        doctorId,
        appointmentDate,
        appointmentTimeSlot,
        reason: reason.trim(),
      });

      if (res.data.success) {
        setSuccessData(res.data.appointment);
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'Failed to book appointment. Please check slot availability and try again.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (successData) {
    return (
      <div className="container page-container">
        <div className="success-confirmation-card">
          <div className="success-icon-box">🎉</div>
          <h2>Appointment Booked Successfully!</h2>
          <p className="success-subtitle">
            Your appointment has been registered and is awaiting doctor confirmation.
          </p>

          <div className="confirmation-details-box">
            <div className="conf-row">
              <span className="conf-label">Doctor:</span>
              <strong className="conf-val">{successData.doctor?.name} ({successData.doctor?.specialization})</strong>
            </div>
            <div className="conf-row">
              <span className="conf-label">Department:</span>
              <span className="conf-val">{successData.department}</span>
            </div>
            <div className="conf-row">
              <span className="conf-label">Date:</span>
              <strong className="conf-val">{successData.appointmentDate}</strong>
            </div>
            <div className="conf-row">
              <span className="conf-label">Time Slot:</span>
              <strong className="conf-val">{successData.appointmentTimeSlot}</strong>
            </div>
            <div className="conf-row">
              <span className="conf-label">Patient:</span>
              <span className="conf-val">{user?.name}</span>
            </div>
            <div className="conf-row">
              <span className="conf-label">Status:</span>
              <span className="badge badge-warning">Pending Confirmation</span>
            </div>
            <div className="conf-row">
              <span className="conf-label">Consultation Fee:</span>
              <strong className="conf-val">${successData.fee || successData.doctor?.doctorFee}</strong>
            </div>
          </div>

          <div className="confirmation-actions">
            <Link to="/appointments" className="btn btn-primary">
              View My Appointments
            </Link>
            <button
              onClick={() => {
                setSuccessData(null);
                setAppointmentDate('');
                setAppointmentTimeSlot('');
                setReason('');
              }}
              className="btn btn-outline"
            >
              Book Another Appointment
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container page-container">
      <div className="page-header text-center">
        <span className="page-subtitle">Schedule Your Visit</span>
        <h1 className="page-title">Book a Doctor Consultation</h1>
        <p className="page-desc">
          Select your desired clinical department, choose an available specialist, and pick a time slot convenient for you.
        </p>
      </div>

      <div className="booking-layout">
        <div className="booking-form-card">
          {error && <Alert type="error" message={error} onClose={() => setError('')} />}

          {!isAuthenticated && (
            <div className="auth-notice-banner">
              <span>Notice: You will need to login or create an account to finalize your booking.</span>
              <Link to="/login" className="btn btn-outline btn-sm">
                Login Now
              </Link>
            </div>
          )}

          <form onSubmit={handleSubmit} className="booking-form">
            {/* Step 1: Department */}
            <div className="form-group">
              <label className="form-label" htmlFor="deptSelect">
                1. Select Medical Department *
              </label>
              <select
                id="deptSelect"
                className="form-input"
                value={department}
                onChange={(e) => {
                  setDepartment(e.target.value);
                  setDoctorId(''); // reset doctor if department changes
                }}
              >
                <option value="">-- Choose Department --</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            {/* Step 2: Doctor Selection */}
            <div className="form-group">
              <label className="form-label" htmlFor="doctorSelect">
                2. Select Specialist Doctor *
              </label>
              {loadingDoctors ? (
                <p className="form-help">Loading available doctors...</p>
              ) : (
                <select
                  id="doctorSelect"
                  className="form-input"
                  value={doctorId}
                  onChange={(e) => setDoctorId(e.target.value)}
                  required
                >
                  <option value="">-- Choose Doctor --</option>
                  {filteredDoctors.map((doc) => (
                    <option key={doc._id} value={doc._id}>
                      {doc.name} - {doc.specialization} (${doc.doctorFee})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Step 3: Date Picker */}
            <div className="form-group">
              <label className="form-label" htmlFor="appointmentDate">
                3. Choose Appointment Date *
              </label>
              <input
                id="appointmentDate"
                type="date"
                min={todayStr}
                className="form-input"
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                required
              />
            </div>

            {/* Step 4: Time Slot Selector */}
            <div className="form-group">
              <label className="form-label">4. Available Time Slot *</label>
              <div className="slot-grid">
                {standardTimeSlots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    className={`slot-pill ${appointmentTimeSlot === slot ? 'slot-selected' : ''}`}
                    onClick={() => setAppointmentTimeSlot(slot)}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 5: Reason for Visit */}
            <div className="form-group">
              <label className="form-label" htmlFor="reasonInput">
                5. Reason for Visit & Symptoms *
              </label>
              <textarea
                id="reasonInput"
                className="form-input form-textarea"
                rows="3"
                placeholder="Briefly describe your symptoms, existing conditions, or the purpose of consultation..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              ></textarea>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg btn-block"
              disabled={submitting}
            >
              {submitting ? 'Confirming Appointment...' : 'Confirm Appointment Booking'}
            </button>
          </form>
        </div>

        {/* Doctor Summary Sidebar */}
        <div className="booking-summary-sidebar">
          <div className="summary-card">
            <h3>Booking Overview</h3>
            <hr className="divider" />

            {selectedDoctor ? (
              <div className="selected-doctor-info">
                <div className="doc-avatar-small">
                  {selectedDoctor.gender === 'Female' ? '👩‍⚕️' : '👨‍⚕️'}
                </div>
                <div>
                  <h4>{selectedDoctor.name}</h4>
                  <p className="doc-specialty">{selectedDoctor.specialization}</p>
                  <p className="doc-qual">{selectedDoctor.qualification}</p>
                </div>

                <div className="summary-fee-box">
                  <span>Standard Consultation Fee:</span>
                  <strong>${selectedDoctor.doctorFee}</strong>
                </div>

                {selectedDoctor.availability && selectedDoctor.availability.length > 0 && (
                  <div className="sidebar-avail">
                    <h5>Weekly Schedule:</h5>
                    <ul className="avail-list">
                      {selectedDoctor.availability
                        .filter((a) => a.isAvailable)
                        .map((a, i) => (
                          <li key={i}>
                            <span>{a.day}:</span> <strong>{a.startTime} - {a.endTime}</strong>
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <p className="sidebar-empty-prompt">
                Please select a doctor to preview their profile and consultation fee.
              </p>
            )}

            <div className="hospital-guarantee-box">
              <div className="guarantee-item">
                <span className="guarantee-icon">🛡️</span>
                <span>Instant confirmation & zero hidden hospital charges.</span>
              </div>
              <div className="guarantee-item">
                <span className="guarantee-icon">🔄</span>
                <span>Flexible cancellation available before appointment time.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;
