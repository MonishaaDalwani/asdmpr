import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const Home = () => {
  const [featuredDoctors, setFeaturedDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);

  useEffect(() => {
    const fetchTopDoctors = async () => {
      try {
        const res = await api.get('/doctors');
        if (res.data.success) {
          // Take first 3 doctors
          setFeaturedDoctors(res.data.doctors.slice(0, 3));
        }
      } catch (err) {
        console.error('Failed to load doctors:', err);
      } finally {
        setLoadingDoctors(false);
      }
    };

    fetchTopDoctors();
  }, []);

  const departments = [
    {
      name: 'Cardiology',
      icon: '❤️',
      desc: 'Expert cardiac care, advanced echocardiography, and interventional cardiovascular treatments.',
    },
    {
      name: 'Neurology',
      icon: '🧠',
      desc: 'Specialized diagnosis for cognitive disorders, stroke prevention, and advanced brain therapies.',
    },
    {
      name: 'Pediatrics',
      icon: '🧸',
      desc: 'Dedicated child healthcare, pediatric immunizations, and specialized infant wellness programs.',
    },
    {
      name: 'Orthopedics',
      icon: '🦴',
      desc: 'Joint replacement surgeries, trauma rehabilitation, and advanced sports injury recovery.',
    },
    {
      name: 'General Medicine',
      icon: '🩺',
      desc: 'Comprehensive adult health screenings, diabetes care, and internal medicine solutions.',
    },
    {
      name: 'Dermatology',
      icon: '✨',
      desc: 'Clinical skin treatments, therapeutic dermatology, and modern aesthetic clinical procedures.',
    },
  ];

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container hero-container">
          <div className="hero-content">
            <span className="hero-tag">Welcome to St. Jude Medical Center</span>
            <h1 className="hero-title">
              Exceptional Medical Care, <span className="highlight-text">Personalized for You</span>
            </h1>
            <p className="hero-desc">
              Experience seamless healthcare with our world-renowned physicians, cutting-edge diagnostic equipment, and 24/7 patient-first support.
            </p>
            <div className="hero-actions">
              <Link to="/book-appointment" className="btn btn-primary btn-lg">
                Book an Appointment
              </Link>
              <Link to="/doctors" className="btn btn-outline-white btn-lg">
                Explore Doctors
              </Link>
            </div>

            <div className="hero-features-row">
              <div className="hero-feat-item">
                <span className="feat-check">✓</span> 24/7 Emergency Ready
              </div>
              <div className="hero-feat-item">
                <span className="feat-check">✓</span> Board-Certified Doctors
              </div>
              <div className="hero-feat-item">
                <span className="feat-check">✓</span> Real-Time Booking
              </div>
            </div>
          </div>

          <div className="hero-card-side">
            <div className="emergency-card">
              <div className="emergency-icon-circle">🚨</div>
              <h3>Need Immediate Care?</h3>
              <p>Our emergency response trauma unit is operational 24/7 with zero waiting time for triage.</p>
              <div className="emergency-phone-box">
                <span className="phone-label">Direct Hotline:</span>
                <span className="phone-number">+1 (800) 555-0199</span>
              </div>
              <Link to="/contact" className="btn btn-emergency btn-block">
                Emergency & Contact Info
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Counter Bar */}
      <section className="stats-bar-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">50+</div>
              <div className="stat-label">Senior Medical Specialists</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">25,000+</div>
              <div className="stat-label">Satisfied Patients Healed</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">12+</div>
              <div className="stat-label">Specialized Departments</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">99.4%</div>
              <div className="stat-label">Patient Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Clinical Departments Section */}
      <section className="section-padded departments-section">
        <div className="container">
          <div className="section-header text-center">
            <span className="section-badge">Centres of Excellence</span>
            <h2 className="section-title">Comprehensive Clinical Departments</h2>
            <p className="section-subtitle">
              From preventative wellness checks to complex surgical interventions, our multidisciplinary teams deliver clinical excellence.
            </p>
          </div>

          <div className="departments-grid">
            {departments.map((dept, index) => (
              <div key={index} className="dept-card">
                <div className="dept-icon">{dept.icon}</div>
                <h3 className="dept-name">{dept.name}</h3>
                <p className="dept-desc">{dept.desc}</p>
                <Link to={`/doctors?department=${dept.name}`} className="dept-link">
                  Consult Specialists &rarr;
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Doctors Section */}
      <section className="section-padded doctors-section bg-light">
        <div className="container">
          <div className="section-header-flex">
            <div>
              <span className="section-badge">Our Specialists</span>
              <h2 className="section-title">Meet Our Leading Physicians</h2>
              <p className="section-subtitle">Trained at premier medical institutions with decades of clinical mastery.</p>
            </div>
            <Link to="/doctors" className="btn btn-outline">
              View All Doctors &rarr;
            </Link>
          </div>

          {loadingDoctors ? (
            <LoadingSpinner message="Loading doctors..." />
          ) : (
            <div className="doctors-grid">
              {featuredDoctors.map((doc) => (
                <div key={doc._id} className="doctor-card">
                  <div className="doctor-card-header">
                    <div className="doctor-avatar-circle">
                      {doc.gender === 'Female' ? '👩‍⚕️' : '👨‍⚕️'}
                    </div>
                    <div className="doctor-badge">{doc.department}</div>
                  </div>
                  <div className="doctor-card-body">
                    <h3 className="doctor-name">{doc.name}</h3>
                    <p className="doctor-specialization">{doc.specialization}</p>
                    <p className="doctor-qualification">{doc.qualification}</p>
                    <p className="doctor-fee">
                      Consultation Fee: <strong>${doc.doctorFee}</strong>
                    </p>
                    <div className="doctor-card-actions">
                      <Link
                        to={`/book-appointment?doctorId=${doc._id}&department=${encodeURIComponent(doc.department)}`}
                        className="btn btn-primary btn-block"
                      >
                        Book Consultation
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Patient Reviews / Testimonials */}
      <section className="section-padded testimonials-section">
        <div className="container">
          <div className="section-header text-center">
            <span className="section-badge">Patient Stories</span>
            <h2 className="section-title">What Our Patients Say</h2>
            <p className="section-subtitle">Real experiences from patients who entrusted their health to us.</p>
          </div>

          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="rating-stars">★★★★★</div>
              <p className="testimonial-quote">
                "The online booking was effortless, and Dr. Sarah Johnson took the time to explain every detail of my cardiac diagnosis with unmatched empathy."
              </p>
              <div className="testimonial-author">
                <strong>David Miller</strong>
                <span>Cardiology Patient</span>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="rating-stars">★★★★★</div>
              <p className="testimonial-quote">
                "Clean facilities, punctual doctor appointments, and top-tier pediatric care for my daughter. We couldn't ask for a better hospital experience."
              </p>
              <div className="testimonial-author">
                <strong>Maria Gonzalez</strong>
                <span>Pediatrics Patient</span>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="rating-stars">★★★★★</div>
              <p className="testimonial-quote">
                "After my sports injury, Dr. Wilson performed my arthroscopic knee surgery. Within three months I was back on the running track pain-free."
              </p>
              <div className="testimonial-author">
                <strong>Michael Reynolds</strong>
                <span>Orthopedics Patient</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="cta-banner-section">
        <div className="container cta-container">
          <div className="cta-content">
            <h2>Ready to Prioritize Your Health?</h2>
            <p>Schedule your in-person or specialist consultation in less than two minutes.</p>
          </div>
          <div className="cta-buttons">
            <Link to="/book-appointment" className="btn btn-primary btn-lg">
              Book Appointment Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
