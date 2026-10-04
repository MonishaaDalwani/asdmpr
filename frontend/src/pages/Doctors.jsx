import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import Alert from '../components/Alert';

const Doctors = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialDept = searchParams.get('department') || 'All';

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDept, setSelectedDept] = useState(initialDept);
  const [searchQuery, setSearchQuery] = useState('');

  const departments = [
    'All',
    'Cardiology',
    'Neurology',
    'Pediatrics',
    'Orthopedics',
    'General Medicine',
    'Dermatology',
  ];

  useEffect(() => {
    fetchDoctors();
  }, [selectedDept]);

  const fetchDoctors = async () => {
    setLoading(true);
    setError('');
    try {
      let url = '/doctors';
      const params = {};
      if (selectedDept && selectedDept !== 'All') {
        params.department = selectedDept;
      }
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      const res = await api.get(url, { params });
      if (res.data.success) {
        setDoctors(res.data.doctors);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load doctors list. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchDoctors();
  };

  const handleDeptChange = (dept) => {
    setSelectedDept(dept);
    if (dept === 'All') {
      searchParams.delete('department');
    } else {
      searchParams.set('department', dept);
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="container page-container">
      <div className="page-header">
        <div>
          <span className="page-subtitle">Medical Staff Directory</span>
          <h1 className="page-title">Find Your Specialist Doctor</h1>
          <p className="page-desc">
            Browse our team of certified physicians, review their clinical specializations, weekly schedules, and book your consultation.
          </p>
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* Filter and Search Bar */}
      <div className="filter-search-bar">
        <form onSubmit={handleSearchSubmit} className="search-box">
          <input
            type="text"
            className="form-input"
            placeholder="Search doctor by name or specialty..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">
            Search
          </button>
        </form>

        <div className="dept-filter-tabs">
          {departments.map((dept) => (
            <button
              key={dept}
              type="button"
              className={`filter-pill ${selectedDept === dept ? 'active' : ''}`}
              onClick={() => handleDeptChange(dept)}
            >
              {dept}
            </button>
          ))}
        </div>
      </div>

      {/* Doctors List */}
      {loading ? (
        <LoadingSpinner message="Searching our medical directory..." />
      ) : doctors.length === 0 ? (
        <EmptyState
          icon="🩺"
          title="No doctors found"
          description="We couldn't find any doctors matching your selected criteria. Try adjusting your search or department filter."
          actionLabel="Show All Doctors"
          onAction={() => {
            setSelectedDept('All');
            setSearchQuery('');
          }}
        />
      ) : (
        <div className="doctors-directory-grid">
          {doctors.map((doc) => (
            <div key={doc._id} className="directory-card">
              <div className="directory-card-top">
                <div className="doctor-avatar-box">
                  {doc.gender === 'Female' ? '👩‍⚕️' : '👨‍⚕️'}
                </div>
                <div className="doctor-info-head">
                  <span className="badge badge-dept">{doc.department}</span>
                  <h3 className="doctor-title">{doc.name}</h3>
                  <p className="doctor-spec-text">{doc.specialization}</p>
                </div>
              </div>

              <div className="directory-card-details">
                <div className="detail-item">
                  <span className="detail-label">Qualification:</span>
                  <span className="detail-value">{doc.qualification || 'MBBS'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Experience:</span>
                  <span className="detail-value">{doc.experienceYears} Years</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Consultation Fee:</span>
                  <span className="detail-value fee-value">${doc.doctorFee}</span>
                </div>

                {doc.bio && (
                  <p className="doctor-bio-snippet">{doc.bio}</p>
                )}

                {/* Available Days */}
                {doc.availability && doc.availability.length > 0 && (
                  <div className="availability-box">
                    <span className="avail-label">Available Days:</span>
                    <div className="avail-days-row">
                      {doc.availability
                        .filter((a) => a.isAvailable)
                        .map((a, idx) => (
                          <span key={idx} className="day-tag">
                            {a.day.slice(0, 3)}
                          </span>
                        ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="directory-card-footer">
                <Link
                  to={`/book-appointment?doctorId=${doc._id}&department=${encodeURIComponent(doc.department)}`}
                  className="btn btn-primary btn-block"
                >
                  Book Appointment
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Doctors;
