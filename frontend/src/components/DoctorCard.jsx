import "../styles/doctorcard.css";
import React, { useState } from "react";
import BookAppointment from "../components/BookAppointment";
import { toast } from "react-hot-toast";
import { FaUserMd, FaClock, FaDollarSign, FaStethoscope, FaStar, FaUsers } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const DoctorCard = ({ ele }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [token] = useState(localStorage.getItem("token") || "");
  const navigate = useNavigate();

  const handleModal = () => {
    if (token === "") {
      return toast.error("You must log in first");
    }
    setModalOpen(true);
  };

  const handleViewProfile = () => {
    navigate(`/doctor/${ele._id}`);
  };

  return (
    <div className="card" data-testid="doctor-card">
      <div className="card-img flex-center">
        <img
          src={ele?.userId?.pic || "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"}
          alt="Doctor profile"
        />
      </div>
      <h3 className="card-name">
        Dr. {ele?.userId?.firstname + " " + ele?.userId?.lastname}
      </h3>
      
      <div className="card-rating">
        <FaStar className="star-icon" />
        <span>{ele?.rating || 0}</span>
        <span className="reviews-count">({ele?.totalReviews || 0} reviews)</span>
      </div>
      
      <p className="specialization">
        <FaStethoscope style={{ color: 'var(--primary-blue)' }} />
        <strong>Specialization: </strong>
        {ele?.specialization}
      </p>
      <p className="experience">
        <FaClock style={{ color: 'var(--accent-purple)' }} />
        <strong>Experience: </strong>
        {ele?.experience} years
      </p>
      <p className="fees">
        <FaDollarSign style={{ color: 'var(--success)' }} />
        <strong>Consultation Fee: </strong>
        ${ele?.fees}
      </p>
      <p className="patients">
        <FaUsers style={{ color: 'var(--info)' }} />
        <strong>Patients: </strong>
        {ele?.totalPatients || 0}
      </p>
      
      <div className="card-buttons">
        <button className="btn btn-secondary view-btn" onClick={handleViewProfile}>
          View Profile
        </button>
        <button className="btn appointment-btn" onClick={handleModal} data-testid="book-appointment-btn">
          Book Now
        </button>
      </div>
      
      {modalOpen && <BookAppointment setModalOpen={setModalOpen} ele={ele} />}
    </div>
  );
};

export default DoctorCard;
