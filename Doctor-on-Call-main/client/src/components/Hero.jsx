import React from "react";
import image from "../images/heroimg.jpg";
import "../styles/hero.css";

const Hero = () => {
  return (
    <section className="hero">
      <div className="hero-content">
        <h1>
          Your Health, <br />
          Our Priority
        </h1>
        <p>
        DoctorOnCall offers convenient and reliable online healthcare services, connecting you with expert doctors 
        for virtual consultations, prescriptions, and health management. Your well-being is our responsibility, 
        and we're here to ensure you get the care you need, wherever you are.
        </p>
      </div>
      <div className="hero-img">
        <img
          src={image}
          alt="hero"
        />
      </div>
    </section>
  );
};

export default Hero;
