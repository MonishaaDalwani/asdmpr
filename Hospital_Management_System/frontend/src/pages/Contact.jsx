import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/Alert';

const Contact = () => {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [alertState, setAlertState] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlertState({ type: '', text: '' });

    if (!formData.name.trim() || !formData.email.trim() || !formData.subject.trim() || !formData.message.trim()) {
      setAlertState({ type: 'error', text: 'Please fill out all required fields.' });
      return;
    }

    setSubmitting(true);

    try {
      const res = await api.post('/messages', formData);
      if (res.data.success) {
        setAlertState({
          type: 'success',
          text: 'Thank you! Your message has been received by hospital administration. We will contact you shortly.',
        });
        setFormData({
          name: user?.name || '',
          email: user?.email || '',
          phone: user?.phone || '',
          subject: '',
          message: '',
        });
      }
    } catch (err) {
      setAlertState({
        type: 'error',
        text: err.response?.data?.message || 'Failed to deliver message. Please try calling our desk directly.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container page-container">
      <div className="page-header text-center">
        <span className="page-subtitle">Get In Touch</span>
        <h1 className="page-title">Contact Hospital Helpdesk & Inquiries</h1>
        <p className="page-desc">
          Have questions about insurance coverage, department facilities, or hospital stays? We're here 24/7.
        </p>
      </div>

      <div className="contact-grid">
        {/* Contact Info Side */}
        <div className="contact-info-panel">
          <h3>Hospital Campus & Details</h3>
          <p className="contact-intro">
            We are centrally located with full emergency trauma bays, diagnostic facilities, and free visitor parking.
          </p>

          <div className="contact-detail-items">
            <div className="contact-item">
              <span className="contact-icon">📍</span>
              <div>
                <strong>Physical Address:</strong>
                <p>100 St. Jude Medical Way, Healthcare District, Metro City, 90210</p>
              </div>
            </div>

            <div className="contact-item">
              <span className="contact-icon">🚨</span>
              <div>
                <strong>Emergency Trauma Line (24/7):</strong>
                <p>+1 (800) 555-0199 / Dial 911 for ambulance</p>
              </div>
            </div>

            <div className="contact-item">
              <span className="contact-icon">📞</span>
              <div>
                <strong>General Inquiries / Appointments:</strong>
                <p>+1 (555) 012-3456</p>
              </div>
            </div>

            <div className="contact-item">
              <span className="contact-icon">✉️</span>
              <div>
                <strong>Official Email:</strong>
                <p>care@stjudemedical.org</p>
              </div>
            </div>

            <div className="contact-item">
              <span className="contact-icon">🕒</span>
              <div>
                <strong>Visiting Hours:</strong>
                <p>General Wards: 10:00 AM – 8:00 PM<br />ICU / Critical Care: 11:00 AM – 12:00 PM & 5:00 PM – 6:00 PM</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form Side */}
        <div className="contact-form-panel">
          <h3>Send Us a Direct Message</h3>
          <p className="form-subtext">Our patient liaison desk answers all inquiries within 24 hours.</p>

          {alertState.text && (
            <Alert
              type={alertState.type}
              message={alertState.text}
              onClose={() => setAlertState({ type: '', text: '' })}
            />
          )}

          <form onSubmit={handleSubmit} className="contact-form">
            <div className="form-group">
              <label className="form-label" htmlFor="contactName">Your Full Name *</label>
              <input
                id="contactName"
                type="text"
                name="name"
                className="form-input"
                placeholder="e.g. Eleanor Vance"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="contactEmail">Email Address *</label>
                <input
                  id="contactEmail"
                  type="email"
                  name="email"
                  className="form-input"
                  placeholder="eleanor@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="contactPhone">Phone Number</label>
                <input
                  id="contactPhone"
                  type="tel"
                  name="phone"
                  className="form-input"
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="contactSubject">Subject / Department of Concern *</label>
              <input
                id="contactSubject"
                type="text"
                name="subject"
                className="form-input"
                placeholder="e.g. Insurance Coverage / Lab Report Delay / General Query"
                value={formData.subject}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="contactMessage">Your Message *</label>
              <textarea
                id="contactMessage"
                name="message"
                className="form-input form-textarea"
                rows="4"
                placeholder="Please describe how we can assist you..."
                value={formData.message}
                onChange={handleChange}
                required
              ></textarea>
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
              {submitting ? 'Sending Message...' : 'Send Message'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
