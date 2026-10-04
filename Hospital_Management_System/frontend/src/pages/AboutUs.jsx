import React from 'react';

function AboutUs() {
  return (
    <div className="about-page">
      <section className="about-hero">
        <h1>About Our Hospital</h1>
        <p>
          Providing accessible, reliable, and patient-centered healthcare
          through technology and compassionate service.
        </p>
      </section>

      <section className="about-content">
        <h2>Who We Are</h2>
        <p>
          Our Hospital Management System is designed to make healthcare
          services simple, organized, and convenient for patients and
          healthcare professionals.
        </p>

        <h2>Our Mission</h2>
        <p>
          Our mission is to improve the healthcare experience by making
          appointments, doctor information, and patient services easier
          to access and manage.
        </p>

        <h2>Why Choose Us?</h2>
        <ul>
          <li>Easy appointment management</li>
          <li>Quick access to doctor information</li>
          <li>Simple and user-friendly interface</li>
          <li>Secure patient services</li>
          <li>Efficient healthcare management</li>
        </ul>
      </section>
    </div>
  );
}

export default AboutUs;