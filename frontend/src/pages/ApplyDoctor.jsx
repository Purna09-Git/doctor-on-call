import React, { useState } from "react";
import "../styles/contact.css";
// Make sure this path is correct for your project structure
import "../styles/register.css"; 
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { FaUserMd, FaClock, FaDollarSign, FaStethoscope } from "react-icons/fa";

// Ensure your .env file has REACT_APP_SERVER_DOMAIN=http://localhost:5001
axios.defaults.baseURL = process.env.REACT_APP_SERVER_DOMAIN;

const ApplyDoctor = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formDetails, setFormDetails] = useState({
    specialization: "",
    experience: "",
    fees: "",
  });

  const inputChange = (e) => {
    const { name, value } = e.target;
    return setFormDetails({
      ...formDetails,
      [name]: value,
    });
  };

  const btnClick = async (e) => {
    e.preventDefault();
    try {
      if (!formDetails.specialization || !formDetails.experience || !formDetails.fees) {
        return toast.error("Please fill in all fields");
      }

      setIsLoading(true);

      await toast.promise(
        axios.post(
          "/api/doctor/applyfordoctor",
          formDetails, // Correctly passing data directly
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        ),
        {
          success: "Application submitted successfully!",
          error: "Unable to submit application",
          loading: "Submitting application...",
        }
      );

      setIsLoading(false);
      navigate("/");
    } catch (error) {
      setIsLoading(false);
      return error;
    }
  };

  return (
    <>
      <Navbar />
      <section className="register-section flex-center apply-doctor" id="contact">
        <div className="register-container flex-center contact">
          <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
            <FaUserMd style={{ fontSize: '3rem', color: 'var(--primary-blue)' }} />
          </div>
          <h2 className="form-heading">Apply for Doctor</h2>
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Join our team of healthcare professionals
          </p>
          <form className="register-form" onSubmit={btnClick}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: '500' }}>
                <FaStethoscope style={{ marginRight: '0.5rem' }} /> Specialization
              </label>
              <input
                type="text"
                name="specialization"
                className="form-input"
                placeholder="e.g., Cardiologist, Dermatologist"
                value={formDetails.specialization}
                onChange={inputChange}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: '500' }}>
                <FaClock style={{ marginRight: '0.5rem' }} /> Experience (in years)
              </label>
              <input
                type="number"
                name="experience"
                className="form-input"
                placeholder="e.g., 5"
                value={formDetails.experience}
                onChange={inputChange}
                min="0"
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: '500' }}>
                <FaDollarSign style={{ marginRight: '0.5rem' }} /> Consultation Fee (in USD)
              </label>
              <input
                type="number"
                name="fees"
                className="form-input"
                placeholder="e.g., 50"
                value={formDetails.fees}
                onChange={inputChange}
                min="0"
              />
            </div>
            <button
              type="submit"
              className={`btn form-btn ${isLoading ? 'disabled' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? 'Submitting...' : 'Submit Application'}
            </button>
          </form>
        </div>
      </section>
      <Footer />
    </>
  );
};

// ⬇️ THIS LINE IS CRITICAL FOR FIXING THE ERROR
export default ApplyDoctor;