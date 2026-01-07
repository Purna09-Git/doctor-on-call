import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/symptomchecker.css";
import axios from "axios";
import { FaSearch, FaExclamationTriangle, FaCheckCircle, FaInfoCircle, FaUserMd, FaArrowRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

axios.defaults.baseURL = process.env.REACT_APP_BACKEND_URL;

const COMMON_SYMPTOMS = [
  "Headache", "Fever", "Cough", "Fatigue", "Nausea", "Dizziness",
  "Chest Pain", "Shortness of Breath", "Sore Throat", "Stomach Pain",
  "Back Pain", "Joint Pain", "Skin Rash", "Anxiety", "Insomnia"
];

const SymptomChecker = () => {
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [customSymptom, setCustomSymptom] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const toggleSymptom = (symptom) => {
    if (selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms(selectedSymptoms.filter(s => s !== symptom));
    } else {
      setSelectedSymptoms([...selectedSymptoms, symptom]);
    }
  };

  const addCustomSymptom = () => {
    if (customSymptom && !selectedSymptoms.includes(customSymptom)) {
      setSelectedSymptoms([...selectedSymptoms, customSymptom]);
      setCustomSymptom("");
    }
  };

  const checkSymptoms = async () => {
    if (selectedSymptoms.length === 0) return;
    
    setLoading(true);
    try {
      const { data } = await axios.post("/api/symptom/check", {
        symptoms: selectedSymptoms
      });
      setResult(data);
    } catch (error) {
      console.error("Error checking symptoms:", error);
    }
    setLoading(false);
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "high": return "#ef4444";
      case "medium": return "#f59e0b";
      default: return "#10b981";
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case "high": return <FaExclamationTriangle />;
      case "medium": return <FaInfoCircle />;
      default: return <FaCheckCircle />;
    }
  };

  return (
    <>
      <Navbar />
      <section className="symptom-checker-section">
        <div className="symptom-checker-container">
          <div className="symptom-header">
            <h1>AI Symptom Checker</h1>
            <p>Select your symptoms to get a preliminary health assessment</p>
          </div>

          <div className="symptom-selector">
            <h3>Common Symptoms</h3>
            <div className="symptom-tags">
              {COMMON_SYMPTOMS.map((symptom) => (
                <button
                  key={symptom}
                  className={`symptom-tag ${selectedSymptoms.includes(symptom) ? 'selected' : ''}`}
                  onClick={() => toggleSymptom(symptom)}
                >
                  {symptom}
                </button>
              ))}
            </div>

            <div className="custom-symptom">
              <input
                type="text"
                placeholder="Add custom symptom..."
                value={customSymptom}
                onChange={(e) => setCustomSymptom(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addCustomSymptom()}
              />
              <button onClick={addCustomSymptom}>Add</button>
            </div>

            {selectedSymptoms.length > 0 && (
              <div className="selected-symptoms">
                <h4>Selected Symptoms ({selectedSymptoms.length})</h4>
                <div className="selected-tags">
                  {selectedSymptoms.map((symptom) => (
                    <span key={symptom} className="selected-tag">
                      {symptom}
                      <button onClick={() => toggleSymptom(symptom)}>&times;</button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            <button
              className="btn check-btn"
              onClick={checkSymptoms}
              disabled={selectedSymptoms.length === 0 || loading}
            >
              <FaSearch /> {loading ? "Analyzing..." : "Check Symptoms"}
            </button>
          </div>

          {result && (
            <div className="result-container">
              <div className="severity-indicator" style={{ borderColor: getSeverityColor(result.severity) }}>
                <span className="severity-icon" style={{ color: getSeverityColor(result.severity) }}>
                  {getSeverityIcon(result.severity)}
                </span>
                <span className="severity-text">
                  Severity Level: <strong>{result.severity.toUpperCase()}</strong>
                </span>
              </div>

              <div className="result-section">
                <h3>Possible Conditions</h3>
                <ul className="conditions-list">
                  {result.possibleConditions.map((condition, index) => (
                    <li key={index}>{condition}</li>
                  ))}
                </ul>
              </div>

              <div className="result-section">
                <h3>Recommendations</h3>
                <ul className="recommendations-list">
                  {result.recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </div>

              <div className="result-section">
                <h3>Suggested Specialists</h3>
                <div className="specialists-list">
                  {result.suggestedSpecializations.map((spec, index) => (
                    <button
                      key={index}
                      className="specialist-btn"
                      onClick={() => navigate(`/doctors?specialization=${spec}`)}
                    >
                      <FaUserMd /> {spec} <FaArrowRight />
                    </button>
                  ))}
                </div>
              </div>

              <div className="disclaimer">
                <FaInfoCircle /> {result.disclaimer}
              </div>
            </div>
          )}
        </div>
      </section>
      <Footer />
    </>
  );
};

export default SymptomChecker;
