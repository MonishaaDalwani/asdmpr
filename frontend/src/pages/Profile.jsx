import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Alert from '../components/Alert';

const Profile = () => {
  const { user, updateProfile } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    gender: 'Prefer not to say',
    dob: '',
    address: '',
  });

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
        gender: user.gender || 'Prefer not to say',
        dob: user.dob || '',
        address: user.address || '',
      });
    }
  }, [user]);

  const handleProfileChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMsg({ type: '', text: '' });

    try {
      await updateProfile(formData);
      setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
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
        setPasswordMsg({ type: 'success', text: 'Password updated successfully!' });
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (err) {
      setPasswordMsg({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update password.',
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="container page-container">
      <div className="page-header">
        <span className="page-subtitle">Personal Account</span>
        <h1 className="page-title">Patient Profile & Security</h1>
        <p className="page-desc">Manage your contact details, demographic info, and login credentials.</p>
      </div>

      <div className="profile-grid">
        {/* Profile Card */}
        <div className="profile-card">
          <h2 className="card-title">Personal Information</h2>
          <hr className="divider" />

          {profileMsg.text && (
            <Alert
              type={profileMsg.type}
              message={profileMsg.text}
              onClose={() => setProfileMsg({ type: '', text: '' })}
            />
          )}

          <form onSubmit={handleProfileSubmit} className="profile-form">
            <div className="form-group">
              <label className="form-label" htmlFor="nameInput">Full Name *</label>
              <input
                id="nameInput"
                type="text"
                name="name"
                className="form-input"
                value={formData.name}
                onChange={handleProfileChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="emailInput">Email Address</label>
              <input
                id="emailInput"
                type="email"
                className="form-input"
                value={formData.email}
                disabled
              />
              <small className="form-help">Email address cannot be changed.</small>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="phoneInput">Phone Number</label>
              <input
                id="phoneInput"
                type="tel"
                name="phone"
                className="form-input"
                placeholder="+1 (555) 000-0000"
                value={formData.phone}
                onChange={handleProfileChange}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="genderSelect">Gender</label>
                <select
                  id="genderSelect"
                  name="gender"
                  className="form-input"
                  value={formData.gender}
                  onChange={handleProfileChange}
                >
                  <option value="Prefer not to say">Prefer not to say</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="dobInput">Date of Birth</label>
                <input
                  id="dobInput"
                  type="date"
                  name="dob"
                  className="form-input"
                  value={formData.dob}
                  onChange={handleProfileChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="addressInput">Residential Address</label>
              <textarea
                id="addressInput"
                name="address"
                className="form-input form-textarea"
                rows="2"
                placeholder="Street address, City, State, Postal Code"
                value={formData.address}
                onChange={handleProfileChange}
              ></textarea>
            </div>

            <button type="submit" className="btn btn-primary" disabled={profileLoading}>
              {profileLoading ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>

        {/* Change Password Card */}
        <div className="profile-card">
          <h2 className="card-title">Security & Password</h2>
          <hr className="divider" />

          {passwordMsg.text && (
            <Alert
              type={passwordMsg.type}
              message={passwordMsg.text}
              onClose={() => setPasswordMsg({ type: '', text: '' })}
            />
          )}

          <form onSubmit={handlePasswordSubmit} className="password-form">
            <div className="form-group">
              <label className="form-label" htmlFor="currentPassword">Current Password *</label>
              <input
                id="currentPassword"
                type="password"
                name="currentPassword"
                className="form-input"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="newPassword">New Password (min 6 chars) *</label>
              <input
                id="newPassword"
                type="password"
                name="newPassword"
                className="form-input"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                required
                minLength={6}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="confirmPassword">Confirm New Password *</label>
              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                className="form-input"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                required
                minLength={6}
              />
            </div>

            <button type="submit" className="btn btn-outline" disabled={passwordLoading}>
              {passwordLoading ? 'Updating Password...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
