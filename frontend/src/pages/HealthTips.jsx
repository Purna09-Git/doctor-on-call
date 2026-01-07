import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/healthtips.css";
import axios from "axios";
import { FaTint, FaRunning, FaMoon, FaAppleAlt, FaBrain, FaStethoscope, FaDesktop, FaHandSparkles } from "react-icons/fa";

axios.defaults.baseURL = process.env.REACT_APP_BACKEND_URL;

const iconMap = {
  droplet: FaTint,
  activity: FaRunning,
  moon: FaMoon,
  apple: FaAppleAlt,
  brain: FaBrain,
  stethoscope: FaStethoscope,
  monitor: FaDesktop,
  hand: FaHandSparkles
};

const HealthTips = () => {
  const [tips, setTips] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    fetchTips();
  }, []);

  const fetchTips = async () => {
    try {
      const { data } = await axios.get("/api/healthtips");
      setTips(data);
    } catch (error) {
      console.error("Error fetching tips:", error);
      // Fallback tips
      setTips([
        { id: "1", title: "Stay Hydrated", content: "Drink at least 8 glasses of water daily.", category: "General", icon: "droplet" },
        { id: "2", title: "Regular Exercise", content: "Aim for 30 minutes of exercise daily.", category: "Fitness", icon: "activity" },
        { id: "3", title: "Quality Sleep", content: "Get 7-9 hours of sleep each night.", category: "Lifestyle", icon: "moon" },
        { id: "4", title: "Balanced Diet", content: "Eat fruits, vegetables, and lean proteins.", category: "Nutrition", icon: "apple" }
      ]);
    }
  };

  const categories = ["All", ...new Set(tips.map(tip => tip.category))];
  const filteredTips = selectedCategory === "All" ? tips : tips.filter(tip => tip.category === selectedCategory);

  return (
    <>
      <Navbar />
      <section className="health-tips-section">
        <div className="health-tips-container">
          <div className="tips-header">
            <h1>Health Tips & Wellness</h1>
            <p>Expert advice for a healthier lifestyle</p>
          </div>

          <div className="category-filter">
            {categories.map((category) => (
              <button
                key={category}
                className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="tips-grid">
            {filteredTips.map((tip) => {
              const IconComponent = iconMap[tip.icon] || FaStethoscope;
              return (
                <div key={tip.id} className="tip-card">
                  <div className="tip-icon">
                    <IconComponent />
                  </div>
                  <div className="tip-content">
                    <span className="tip-category">{tip.category}</span>
                    <h3>{tip.title}</h3>
                    <p>{tip.content}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
};

export default HealthTips;
