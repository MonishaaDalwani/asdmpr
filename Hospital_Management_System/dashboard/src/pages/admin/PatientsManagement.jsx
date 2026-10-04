import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Alert from '../../components/Alert';
import LoadingSpinner from '../../components/LoadingSpinner';
import Pagination from '../../components/Pagination';

const PatientsManagement = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPatients();
  }, [page]);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search.trim()) params.search = search.trim();

      const res = await api.get('/auth/patients', { params });
      if (res.data.success) {
        setPatients(res.data.patients);
        setTotal(res.data.total);
        setPages(res.data.pages);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load patients list.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchPatients();
  };

  return (
    <div className="dashboard-content-area">
      <div className="content-header">
        <div>
          <span className="content-pretitle">PATIENT DIRECTORY</span>
          <h1 className="content-title">Registered Patients</h1>
          <p className="content-desc">
            View all patients registered in the hospital system, contact details, and historical visit counts.
          </p>
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      <div className="filter-card">
        <form onSubmit={handleSearchSubmit} className="search-row" style={{ maxWidth: '480px' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search patient by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">
            Search
          </button>
        </form>
      </div>

      <div className="dashboard-panel">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Patient Name</th>
                <th>Contact Info</th>
                <th>Demographics</th>
                <th>Address</th>
                <th>Total Consultations</th>
                <th>Registered Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6">
                    <LoadingSpinner message="Loading patient database..." />
                  </td>
                </tr>
              ) : patients.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center text-muted" style={{ padding: '2.5rem' }}>
                    No patient records found.
                  </td>
                </tr>
              ) : (
                patients.map((patient) => (
                  <tr key={patient._id}>
                    <td>
                      <div className="table-patient-info">
                        <span className="patient-avatar-icon">👤</span>
                        <div>
                          <strong>{patient.name}</strong>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div>{patient.email}</div>
                      <div className="table-subtext">{patient.phone || 'No phone recorded'}</div>
                    </td>
                    <td>
                      <div>{patient.gender || 'Not specified'}</div>
                      {patient.dob && (
                        <div className="table-subtext">DOB: {patient.dob}</div>
                      )}
                    </td>
                    <td>
                      <span className="table-address-text">
                        {patient.address || '—'}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-info">
                        {patient.totalAppointments} Consultations
                      </span>
                    </td>
                    <td>
                      <div className="table-subtext">
                        {new Date(patient.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination currentPage={page} totalPages={pages} onPageChange={(p) => setPage(p)} />
      </div>
    </div>
  );
};

export default PatientsManagement;
