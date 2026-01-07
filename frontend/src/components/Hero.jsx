import React from "react";
import image from "../images/heroimg.jpg";
import "../styles/hero.css";
import { FaUserMd, FaCalendarCheck, FaShieldAlt, FaClock, FaStethoscope, FaPills, FaChartLine } from "react-icons/fa";
import { NavLink } from "react-router-dom";

const Hero = () => {
  return (
    <section className="hero">
      <div className="hero-content">
        <div className="hero-badge">
          <FaShieldAlt /> Trusted Healthcare Platform
        </div>
        <h1>
          Your Health,<br />
          <span>Our Priority</span>
        </h1>
        <p>
          DoctorOnCall offers convenient and reliable online healthcare services, 
          connecting you with expert doctors for virtual consultations, prescriptions, 
          and health management. Your well-being is our responsibility.
        </p>
        <div className="hero-buttons">
          <NavLink to="/doctors" className="btn">Find a Doctor</NavLink>
          <NavLink to="/symptom-checker" className="btn btn-secondary">Check Symptoms</NavLink>
        </div>
        <div className="hero-features">
          <div className="hero-feature">
            <FaStethoscope />
            <span>AI Symptom Checker</span>
          </div>
          <div className="hero-feature">
            <FaPills />
            <span>Digital Prescriptions</span>
          </div>
          <div className="hero-feature">
            <FaChartLine />
            <span>Health Analytics</span>
          </div>
        </div>
        <div className="hero-stats">
          <div className="hero-stat">
            <div className="hero-stat-number">1000+</div>
            <div className="hero-stat-label">Happy Patients</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-number">250+</div>
            <div className="hero-stat-label">Expert Doctors</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-number">24/7</div>
            <div className="hero-stat-label">Support</div>
          </div>
        </div>
      </div>
      <div className="hero-img">
        <div className="hero-img-wrapper">
          <img src={image} alt="Doctor consultation" />
          <div className="hero-floating-card card-1">
            <div className="floating-icon blue"><FaUserMd /></div>
            <div className="floating-text">
              <h4>Expert Doctors</h4>
              <p>Verified specialists</p>
            </div>
          </div>
          <div className="hero-floating-card card-2">
            <div className="floating-icon purple"><FaCalendarCheck /></div>
            <div className="floating-text">
              <h4>Easy Booking</h4>
              <p>Quick appointments</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
