import React, { useState } from "react";
import "../styles/contact.css";
import "../styles/register.css";
import { FaEnvelope, FaUser, FaComment } from "react-icons/fa";

const Contact = () => {
  const [formDetails, setFormDetails] = useState({
    name: "",
    email: "",
    message: "",
  });

  const inputChange = (e) => {
    const { name, value } = e.target;
    return setFormDetails({
      ...formDetails,
      [name]: value,
    });
  };

  return (
    <section className="register-section flex-center contact-section" id="contact">
      <div className="contact-container flex-center contact">
        <h2 className="form-heading">Contact Us</h2>
        <p style={{ textAlign: 'center', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
          Have questions? We would love to hear from you.
        </p>
        <form
          method="POST"
          action={`https://formspree.io/f/${process.env.REACT_APP_FORMIK_SECRET}`}
          className="register-form"
        >
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              name="name"
              className="form-input"
              placeholder="Enter your name"
              value={formDetails.name}
              onChange={inputChange}
            />
          </div>
          <div style={{ position: 'relative' }}>
            <input
              type="email"
              name="email"
              className="form-input"
              placeholder="Enter your email"
              value={formDetails.email}
              onChange={inputChange}
            />
          </div>
          <div style={{ position: 'relative' }}>
            <textarea
              name="message"
              className="form-input"
              placeholder="Enter your message"
              value={formDetails.message}
              onChange={inputChange}
              rows="5"
            ></textarea>
          </div>
          <button type="submit" className="btn form-btn">
            Send Message
          </button>
        </form>
      </div>
    </section>
  );
};

export default Contact;
