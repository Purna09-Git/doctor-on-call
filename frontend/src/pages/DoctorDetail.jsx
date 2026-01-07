import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Loading from "../components/Loading";
import BookAppointment from "../components/BookAppointment";
import "../styles/doctordetail.css";
import axios from "axios";
import { FaStar, FaStethoscope, FaClock, FaDollarSign, FaUsers, FaGraduationCap, FaQuoteLeft } from "react-icons/fa";
import { toast } from "react-hot-toast";

axios.defaults.baseURL = process.env.REACT_APP_BACKEND_URL;

const DoctorDetail = () => {
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [token] = useState(localStorage.getItem("token") || "");

  useEffect(() => {
    fetchDoctor();
    fetchReviews();
  }, [id]);

  const fetchDoctor = async () => {
    try {
      const { data } = await axios.get(`/api/doctor/getdoctor/${id}`);
      setDoctor(data);
    } catch (error) {
      console.error("Error fetching doctor:", error);
    }
    setLoading(false);
  };

  const fetchReviews = async () => {
    try {
      const { data } = await axios.get(`/api/review/getreviews/${id}`);
      setReviews(data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!token) return toast.error("Please login to submit a review");
    if (!reviewForm.comment) return toast.error("Please write a review");

    try {
      await axios.post("/api/review/addreview", {
        doctorId: doctor?.userId?._id,
        rating: reviewForm.rating,
        comment: reviewForm.comment
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Review submitted successfully");
      setReviewForm({ rating: 5, comment: "" });
      fetchReviews();
      fetchDoctor();
    } catch (error) {
      toast.error("Failed to submit review");
    }
  };

  const handleBooking = () => {
    if (!token) return toast.error("Please login to book appointment");
    setModalOpen(true);
  };

  if (loading) return <Loading />;
  if (!doctor) return <div className="nothing">Doctor not found</div>;

  return (
    <>
      <Navbar />
      <section className="doctor-detail-section">
        <div className="doctor-detail-container">
          <div className="doctor-profile-card">
            <div className="doctor-profile-header">
              <img src={doctor?.userId?.pic || "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"} alt="Doctor" className="doctor-avatar" />
              <div className="doctor-info">
                <h1>Dr. {doctor?.userId?.firstname} {doctor?.userId?.lastname}</h1>
                <p className="specialization"><FaStethoscope /> {doctor?.specialization}</p>
                <div className="doctor-rating">
                  <FaStar className="star" />
                  <span>{doctor?.rating || 0}</span>
                  <span className="reviews-count">({doctor?.totalReviews || 0} reviews)</span>
                </div>
              </div>
            </div>
            
            <div className="doctor-stats">
              <div className="stat"><FaClock /><span>{doctor?.experience} Years</span><p>Experience</p></div>
              <div className="stat"><FaUsers /><span>{doctor?.totalPatients || 0}</span><p>Patients</p></div>
              <div className="stat"><FaDollarSign /><span>${doctor?.fees}</span><p>Per Visit</p></div>
            </div>

            {doctor?.about && (
              <div className="doctor-about">
                <h3>About</h3>
                <p>{doctor.about}</p>
              </div>
            )}

            {doctor?.education && (
              <div className="doctor-education">
                <h3><FaGraduationCap /> Education</h3>
                <p>{doctor.education}</p>
              </div>
            )}

            <button className="btn book-now-btn" onClick={handleBooking}>Book Appointment</button>
          </div>

          <div className="reviews-section">
            <h2>Patient Reviews</h2>
            
            {token && (
              <form className="review-form" onSubmit={submitReview}>
                <h3>Write a Review</h3>
                <div className="rating-input">
                  <label>Rating:</label>
                  <select value={reviewForm.rating} onChange={(e) => setReviewForm({ ...reviewForm, rating: parseInt(e.target.value) })}>
                    {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} Stars</option>)}
                  </select>
                </div>
                <textarea placeholder="Share your experience..." value={reviewForm.comment} onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })} rows="4"></textarea>
                <button type="submit" className="btn">Submit Review</button>
              </form>
            )}

            <div className="reviews-list">
              {reviews.length === 0 ? (
                <p className="no-reviews">No reviews yet. Be the first to review!</p>
              ) : (
                reviews.map((review) => (
                  <div key={review._id} className="review-card">
                    <div className="review-header">
                      <img src={review.userPic || "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"} alt="User" />
                      <div>
                        <h4>{review.userName}</h4>
                        <div className="review-rating">
                          {[...Array(5)].map((_, i) => (
                            <FaStar key={i} className={i < review.rating ? "star filled" : "star"} />
                          ))}
                        </div>
                      </div>
                      <span className="review-date">{new Date(review.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="review-comment"><FaQuoteLeft /> {review.comment}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>
      {modalOpen && <BookAppointment setModalOpen={setModalOpen} ele={doctor} />}
      <Footer />
    </>
  );
};

export default DoctorDetail;
