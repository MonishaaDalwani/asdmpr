import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Alert from '../../components/Alert';
import LoadingSpinner from '../../components/LoadingSpinner';
import Pagination from '../../components/Pagination';

const DoctorsManagement = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('All');
  const [status, setStatus] = useState('all');
  const [message, setMessage] = useState({ type: '', text: '' });

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentDoctorId, setCurrentDoctorId] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const initialForm = {
    name: '',
    email: '',
    password: '',
    phone: '',
    gender: 'Prefer not to say',
    department: 'General Medicine',
    specialization: '',
    qualification: '',
    experienceYears: 1,
    doctorFee: 500,
    bio: '',
  };

  const [formData, setFormData] = useState(initialForm);

  const departmentsList = [
    'Cardiology',
    'Neurology',
    'Pediatrics',
    'Orthopedics',
    'General Medicine',
    'Dermatology',
    'Diagnostic Medicine',
  ];

  useEffect(() => {
    fetchDoctors();
  }, [page, department, status]);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 8 };
      if (department !== 'All') params.department = department;
      if (status !== 'all') params.status = status;
      if (search.trim()) params.search = search.trim();

      const res = await api.get('/doctors/admin/all', { params });
      if (res.data.success) {
        setDoctors(res.data.doctors);
        setTotal(res.data.total);
        setPages(res.data.pages);
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to load doctors list.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchDoctors();
  };

  const handleOpenAddModal = () => {
    setIsEditMode(false);
    setCurrentDoctorId(null);
    setFormData(initialForm);
    setModalOpen(true);
  };

  const handleOpenEditModal = (doc) => {
    setIsEditMode(true);
    setCurrentDoctorId(doc._id);
    setFormData({
      name: doc.name || '',
      email: doc.email || '',
      password: '', // Leave blank unless changing
      phone: doc.phone || '',
      gender: doc.gender || 'Prefer not to say',
      department: doc.department || 'General Medicine',
      specialization: doc.specialization || '',
      qualification: doc.qualification || '',
      experienceYears: doc.experienceYears || 0,
      doctorFee: doc.doctorFee || 500,
      bio: doc.bio || '',
    });
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setIsEditMode(false);
    setCurrentDoctorId(null);
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSaveDoctor = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    setMessage({ type: '', text: '' });

    try {
      if (isEditMode) {
        const updatePayload = { ...formData };
        if (!updatePayload.password) delete updatePayload.password;

        const res = await api.put(`/doctors/${currentDoctorId}`, updatePayload);
        if (res.data.success) {
          setMessage({ type: 'success', text: 'Doctor details updated successfully.' });
          handleCloseModal();
          fetchDoctors();
        }
      } else {
        const res = await api.post('/doctors', formData);
        if (res.data.success) {
          setMessage({ type: 'success', text: 'New doctor registered successfully.' });
          handleCloseModal();
          fetchDoctors();
        }
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to save doctor details.',
      });
    } finally {
      setModalLoading(false);
    }
  };

  const handleToggleStatus = async (doctor) => {
    try {
      const res = await api.patch(`/doctors/${doctor._id}/toggle-status`);
      if (res.data.success) {
        setMessage({
          type: 'success',
          text: `Dr. ${doctor.name} is now ${res.data.doctor.isActive ? 'Active' : 'Deactivated'}.`,
        });
        fetchDoctors();
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update doctor status.',
      });
    }
  };

  return (
    <div className="dashboard-content-area">
      <div className="content-header">
        <div>
          <span className="content-pretitle">STAFF DIRECTORY</span>
          <h1 className="content-title">Manage Hospital Doctors</h1>
          <p className="content-desc">
            Register new physicians, edit specializations and fees, and toggle practitioner active availability.
          </p>
        </div>
        <button onClick={handleOpenAddModal} className="btn btn-primary">
          + Add New Doctor
        </button>
      </div>

      {message.text && (
        <Alert
          type={message.type}
          message={message.text}
          onClose={() => setMessage({ type: '', text: '' })}
        />
      )}

      {/* Filter and Search Controls */}
      <div className="filter-card">
        <form onSubmit={handleSearchSubmit} className="search-row">
          <input
            type="text"
            className="form-input"
            placeholder="Search by doctor name or specialty..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">
            Search
          </button>
        </form>

        <div className="filter-select-group">
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
              <option value="All">All Departments</option>
              {departmentsList.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

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
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Doctors Table */}
      <div className="dashboard-panel">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Doctor</th>
                <th>Department & Specialty</th>
                <th>Qualifications</th>
                <th>Fee</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6">
                    <LoadingSpinner message="Loading doctors..." />
                  </td>
                </tr>
              ) : doctors.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center text-muted" style={{ padding: '2.5rem' }}>
                    No doctors found matching the search criteria.
                  </td>
                </tr>
              ) : (
                doctors.map((doc) => (
                  <tr key={doc._id}>
                    <td>
                      <div className="table-doc-info">
                        <span className="doc-avatar-icon">
                          {doc.gender === 'Female' ? '👩‍⚕️' : '👨‍⚕️'}
                        </span>
                        <div>
                          <strong>{doc.name}</strong>
                          <div className="table-subtext">{doc.email}</div>
                          {doc.phone && <div className="table-subtext">{doc.phone}</div>}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-dept">{doc.department}</span>
                      <div className="table-subtext" style={{ marginTop: '0.2rem' }}>
                        {doc.specialization}
                      </div>
                    </td>
                    <td>
                      <div>{doc.qualification || 'MBBS'}</div>
                      <div className="table-subtext">{doc.experienceYears} Years Exp.</div>
                    </td>
                    <td>
                      <strong>${doc.doctorFee}</strong>
                    </td>
                    <td>
                      {doc.isActive ? (
                        <span className="badge badge-success">Active</span>
                      ) : (
                        <span className="badge badge-danger">Inactive</span>
                      )}
                    </td>
                    <td className="text-right">
                      <div className="table-action-btns">
                        <button
                          onClick={() => handleOpenEditModal(doc)}
                          className="btn btn-outline btn-xs"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleToggleStatus(doc)}
                          className={`btn btn-xs ${doc.isActive ? 'btn-outline-danger' : 'btn-outline'}`}
                        >
                          {doc.isActive ? 'Deactivate' : 'Activate'}
                        </button>
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

      {/* Add / Edit Doctor Modal */}
      {modalOpen && (
        <div className="modal-backdrop">
          <div className="modal-box modal-box-wide">
            <div className="modal-header">
              <h3>{isEditMode ? 'Edit Doctor Profile' : 'Register New Medical Practitioner'}</h3>
              <button onClick={handleCloseModal} className="modal-close-btn">
                &times;
              </button>
            </div>
            <form onSubmit={handleSaveDoctor}>
              <div className="modal-body modal-scroll">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      className="form-input"
                      placeholder="e.g. Dr. Arthur Conan"
                      value={formData.name}
                      onChange={handleFormChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      className="form-input"
                      placeholder="arthur@hospital.com"
                      value={formData.email}
                      onChange={handleFormChange}
                      required
                      disabled={isEditMode}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">
                      {isEditMode ? 'New Password (leave empty to keep current)' : 'Password *'}
                    </label>
                    <input
                      type="password"
                      name="password"
                      className="form-input"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleFormChange}
                      required={!isEditMode}
                      minLength={6}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      className="form-input"
                      placeholder="+1 (555) 000-0000"
                      value={formData.phone}
                      onChange={handleFormChange}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Department *</label>
                    <select
                      name="department"
                      className="form-input"
                      value={formData.department}
                      onChange={handleFormChange}
                      required
                    >
                      {departmentsList.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Specialization / Specialty *</label>
                    <input
                      type="text"
                      name="specialization"
                      className="form-input"
                      placeholder="e.g. Pediatric Cardiology"
                      value={formData.specialization}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Qualifications</label>
                    <input
                      type="text"
                      name="qualification"
                      className="form-input"
                      placeholder="e.g. MBBS, MD, FRCS"
                      value={formData.qualification}
                      onChange={handleFormChange}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Experience (Years)</label>
                    <input
                      type="number"
                      name="experienceYears"
                      className="form-input"
                      min="0"
                      value={formData.experienceYears}
                      onChange={handleFormChange}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Consultation Fee ($) *</label>
                    <input
                      type="number"
                      name="doctorFee"
                      className="form-input"
                      min="0"
                      step="10"
                      value={formData.doctorFee}
                      onChange={handleFormChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Gender</label>
                    <select
                      name="gender"
                      className="form-input"
                      value={formData.gender}
                      onChange={handleFormChange}
                    >
                      <option value="Prefer not to say">Prefer not to say</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Doctor Bio & Clinical Focus</label>
                  <textarea
                    name="bio"
                    className="form-input form-textarea"
                    rows="3"
                    placeholder="Brief background summary of clinical expertise..."
                    value={formData.bio}
                    onChange={handleFormChange}
                  ></textarea>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="btn btn-ghost"
                  disabled={modalLoading}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={modalLoading}>
                  {modalLoading
                    ? 'Saving...'
                    : isEditMode
                    ? 'Update Doctor Profile'
                    : 'Create Doctor Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorsManagement;
