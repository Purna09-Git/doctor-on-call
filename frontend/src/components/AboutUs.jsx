import React from "react";
import image from "../images/aboutimg.jpg";
import "../styles/hero.css";

const AboutUs = () => {
  return (
    <section className="container">
      <h2 className="page-heading about-heading">About Us</h2>
      <div className="about">
        <div className="hero-img">
          <div className="hero-img-wrapper">
            <img src={image} alt="About DoctorOnCall" />
          </div>
        </div>
        <div className="hero-content">
          <h3 style={{ fontSize: '1.75rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
            Revolutionizing Healthcare Access
          </h3>
          <p>
            DoctorOnCall is a telemedicine and healthcare service platform designed to connect 
            patients with medical professionals for consultations and treatments, primarily through 
            digital means such as mobile apps, websites, and online communication tools.
          </p>
          <p style={{ marginTop: '1rem' }}>
            This service is particularly beneficial for people who need medical advice but are 
            unable to visit a physical clinic due to location, time constraints, or health-related concerns.
            We are committed to making quality healthcare accessible to everyone, everywhere.
          </p>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
