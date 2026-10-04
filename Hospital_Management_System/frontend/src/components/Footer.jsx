import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer-main">
      <div className="container footer-container">
        <div className="footer-grid">
          <div className="footer-col brand-col">
            <div className="footer-brand">
              <div className="brand-logo-icon">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M19 10.5h-5.5V5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v5.5H5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5h5.5V19c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-5.5H19c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5z" />
                </svg>
              </div>
              <span className="footer-title">St. Jude Medical Center</span>
            </div>
            <p className="footer-desc">
              Committed to providing world-class, compassionate healthcare through advanced medical technology and distinguished medical specialists.
            </p>
            <div className="emergency-badge">
              <span className="emergency-dot"></span>
              <strong>24/7 Emergency Line:</strong> +1 (800) 555-0199
            </div>
          </div>

          <div className="footer-col">
            <h4>Quick Links</h4>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/doctors">Find a Doctor</Link></li>
              <li><Link to="/book-appointment">Book Appointment</Link></li>
              <li><Link to="/contact">Contact Support</Link></li>
              <li><a href="http://localhost:5174" target="_blank" rel="noreferrer">Staff Portal (Doctors & Admin)</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Clinical Departments</h4>
            <ul className="footer-links">
              <li>Cardiology & Heart Care</li>
              <li>Neurology & Brain Sciences</li>
              <li>Pediatrics & Neonatal Care</li>
              <li>Orthopedics & Joint Care</li>
              <li>General & Internal Medicine</li>
              <li>Dermatology & Skin Center</li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Hospital Hours</h4>
            <ul className="footer-schedule">
              <li><span>Emergency Department:</span> <strong>24 Hours / 7 Days</strong></li>
              <li><span>OPD Consultations:</span> <strong>Mon - Sat (08:00 - 18:00)</strong></li>
              <li><span>Diagnostic Lab:</span> <strong>Mon - Sun (07:00 - 20:00)</strong></li>
              <li><span>Pharmacy:</span> <strong>24 Hours Open</strong></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} St. Jude Medical Center. All Rights Reserved. Built with MERN Stack.</p>
          <div className="footer-bottom-links">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Patient Rights</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
