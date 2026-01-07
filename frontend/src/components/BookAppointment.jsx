import React, { useState } from "react";
import "../styles/bookappointment.css";
import "../styles/register.css";
import axios from "axios";
import toast from "react-hot-toast";
import { IoMdClose } from "react-icons/io";

axios.defaults.baseURL = process.env.REACT_APP_BACKEND_URL;

const BookAppointment = ({ setModalOpen, ele }) => {
  const [formDetails, setFormDetails] = useState({
    date: "",
    time: "",
    symptoms: "",
    appointmentType: "consultation"
  });

  const inputChange = (e) => {
    const { name, value } = e.target;
    setFormDetails({ ...formDetails, [name]: value });
  };

  const bookAppointment = async (e) => {
    e.preventDefault();
    try {
      if (!formDetails.date || !formDetails.time) {
        return toast.error("Please select date and time");
      }
      
      await toast.promise(
        axios.post(
          "/api/appointment/bookappointment",
          {
            doctorId: ele?.userId?._id,
            date: formDetails.date,
            time: formDetails.time,
            doctorname: `${ele?.userId?.firstname} ${ele?.userId?.lastname}`,
            symptoms: formDetails.symptoms,
            appointmentType: formDetails.appointmentType
          },
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }
        ),
        {
          success: "Appointment booked successfully",
          error: "Unable to book appointment",
          loading: "Booking appointment...",
        }
      );
      setModalOpen(false);
    } catch (error) {
      return error;
    }
  };

  return (
    <div className="modal flex-center" onClick={() => setModalOpen(false)}>
      <div className="modal__content" onClick={(e) => e.stopPropagation()}>
        <h2 className="form-heading">Book Appointment</h2>
        <IoMdClose onClick={() => setModalOpen(false)} className="close-btn" />
        <div className="book">
          <form className="register-form">
            <div>
              <label className="form-label">Appointment Type</label>
              <select name="appointmentType" className="form-input" value={formDetails.appointmentType} onChange={inputChange}>
                <option value="consultation">General Consultation</option>
                <option value="followup">Follow-up Visit</option>
                <option value="emergency">Emergency</option>
                <option value="checkup">Health Checkup</option>
              </select>
            </div>
            <div>
              <label className="form-label">Select Date</label>
              <input type="date" name="date" className="form-input" value={formDetails.date} onChange={inputChange} min={new Date().toISOString().split('T')[0]} />
            </div>
            <div>
              <label className="form-label">Select Time</label>
              <input type="time" name="time" className="form-input" value={formDetails.time} onChange={inputChange} />
            </div>
            <div>
              <label className="form-label">Describe Your Symptoms (Optional)</label>
              <textarea name="symptoms" className="form-input" placeholder="Briefly describe your symptoms..." value={formDetails.symptoms} onChange={inputChange} rows="3"></textarea>
            </div>
            <button type="submit" className="btn form-btn" onClick={bookAppointment}>Confirm Booking</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;
