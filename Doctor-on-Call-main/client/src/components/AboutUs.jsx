import React from "react";
import image from "../images/aboutimg.jpg";

const AboutUs = () => {
  return (
    <>
      <section className="container">
        <h2 className="page-heading about-heading">About Us</h2>
        <div className="about">
          <div className="hero-img">
            <img
              src={image}
              alt="hero"
            />
          </div>
          <div className="hero-content">
            <p>
            DoctorOnCall is a telemedicine and healthcare service platform designed to connect patients with medical professionals for consultations and treatments, primarily through digital means such as mobile apps, websites, and online communication tools. This service is particularly beneficial for people who need medical advice but are unable to visit a physical clinic due to location, time constraints, or health-related concerns.
            </p>
          </div>
        </div>
      </section>
    </>
  );
};

export default AboutUs;
