import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import Alert from '../../components/Alert';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const defaultAvailability = daysOfWeek.map((day) => ({
  day,
  startTime: '09:00',
  endTime: '17:00',
  isAvailable: day !== 'Sunday',
}));

const DoctorProfile = () => {
  const { user, updateProfile } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: 'General Medicine',
    specialization: '',
    qualification: '',
    doctorFee: 500,
    bio: '',
  });

  const [availability, setAvailability] = useState(defaultAvailability);

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        department: user.department || 'General Medicine',
        specialization: user.specialization || '',
        qualification: user.qualification || '',
        doctorFee: user.doctorFee || 500,
        bio: user.bio || '',
      });

      if (user.availability && user.availability.length > 0) {
        setAvailability(user.availability);
      }
    }
  }, [user]);

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDayToggle = (index) => {
    const updated = [...availability];
    updated[index].isAvailable = !updated[index].isAvailable;
    setAvailability(updated);
  };

  const handleTimeChange = (index, field, value) => {
    const updated = [...availability];
    updated[index][field] = value;
    setAvailability(updated);
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMsg({ type: '', text: '' });

    try {
      await updateProfile({
        ...formData,
        availability,
      });
      setProfileMsg({ type: 'success', text: 'Doctor profile and schedule updated successfully!' });
    } catch (err) {
      setProfileMsg({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update profile.',
      });
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordMsg({ type: '', text: '' });

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'Password must be at least 6 characters long.' });
      return;
    }

    setPasswordLoading(true);

    try {
      const res = await api.put('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      if (res.data.success) {
        setPasswordMsg({ type: 'success', text: 'Password changed successfully.' });
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (err) {
      setPasswordMsg({
        type: 'error',
        text: err.response?.data?.message || 'Failed to change password.',
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="dashboard-content-area">
      <div className="content-header">
        <div>
          <span className="content-pretitle">PHYSICIAN SETTINGS</span>
          <h1 className="content-title">Doctor Profile & Weekly Availability</h1>
          <p className="content-desc">
            Update your clinical bio, consultation fee, and active days/hours displayed to patients.
          </p>
        </div>
      </div>

      <div className="dashboard-two-col">
        {/* Profile Info Form */}
        <div className="dashboard-panel">
          <h3>Professional Information</h3>
          <p className="panel-desc">Information visible on the public hospital directory</p>
          <hr className="divider" />

          {profileMsg.text && (
            <Alert
              type={profileMsg.type}
              message={profileMsg.text}
              onClose={() => setProfileMsg({ type: '', text: '' })}
            />
          )}

          <form onSubmit={handleProfileSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                name="name"
                className="form-input"
                value={formData.name}
                onChange={handleFormChange}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Email</label>
                <input type="email" className="form-input" value={formData.email} disabled />
              </div>

              <div className="form-group">
                <label className="form-label">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  className="form-input"
                  value={formData.phone}
                  onChange={handleFormChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Department</label>
                <input
                  type="text"
                  name="department"
                  className="form-input"
                  value={formData.department}
                  disabled
                />
              </div>

              <div className="form-group">
                <label className="form-label">Specialization</label>
                <input
                  type="text"
                  name="specialization"
                  className="form-input"
                  value={formData.specialization}
                  onChange={handleFormChange}
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
                  value={formData.qualification}
                  onChange={handleFormChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Consultation Fee ($)</label>
                <input
                  type="number"
                  name="doctorFee"
                  className="form-input"
                  value={formData.doctorFee}
                  onChange={handleFormChange}
                  min="0"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Professional Bio & Practice Focus</label>
              <textarea
                name="bio"
                className="form-input form-textarea"
                rows="3"
                value={formData.bio}
                onChange={handleFormChange}
              ></textarea>
            </div>

            {/* Weekly Schedule Setting */}
            <div className="form-group" style={{ marginTop: '1.5rem' }}>
              <label className="form-label">Weekly Schedule & Consultation Hours</label>
              <div className="schedule-table">
                {availability.map((item, index) => (
                  <div key={item.day} className="schedule-row">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={item.isAvailable}
                        onChange={() => handleDayToggle(index)}
                      />
                      <span>{item.day}</span>
                    </label>

                    {item.isAvailable ? (
                      <div className="schedule-times">
                        <input
                          type="time"
                          className="form-input-sm"
                          value={item.startTime}
                          onChange={(e) => handleTimeChange(index, 'startTime', e.target.value)}
                        />
                        <span>to</span>
                        <input
                          type="time"
                          className="form-input-sm"
                          value={item.endTime}
                          onChange={(e) => handleTimeChange(index, 'endTime', e.target.value)}
                        />
                      </div>
                    ) : (
                      <span className="badge badge-muted">Unavailable / Off</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={profileLoading}>
              {profileLoading ? 'Saving...' : 'Save Profile & Availability'}
            </button>
          </form>
        </div>

        {/* Change Password Card */}
        <div className="dashboard-panel" style={{ height: 'fit-content' }}>
          <h3>Security & Password</h3>
          <p className="panel-desc">Update your staff account password</p>
          <hr className="divider" />

          {passwordMsg.text && (
            <Alert
              type={passwordMsg.type}
              message={passwordMsg.text}
              onClose={() => setPasswordMsg({ type: '', text: '' })}
            />
          )}

          <form onSubmit={handlePasswordSubmit}>
            <div className="form-group">
              <label className="form-label">Current Password *</label>
              <input
                type="password"
                name="currentPassword"
                className="form-input"
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, currentPassword: e.target.value })
                }
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">New Password (min 6 chars) *</label>
              <input
                type="password"
                name="newPassword"
                className="form-input"
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, newPassword: e.target.value })
                }
                required
                minLength={6}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password *</label>
              <input
                type="password"
                name="confirmPassword"
                className="form-input"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                }
                required
                minLength={6}
              />
            </div>

            <button type="submit" className="btn btn-outline" disabled={passwordLoading}>
              {passwordLoading ? 'Updating...' : 'Change Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile;
