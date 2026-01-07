import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Loading from "../components/Loading";
import Empty from "../components/Empty";
import "../styles/prescriptions.css";
import axios from "axios";
import { FaPills, FaCalendarAlt, FaUserMd, FaDownload, FaNotesMedical } from "react-icons/fa";

axios.defaults.baseURL = process.env.REACT_APP_BACKEND_URL;

const Prescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrescription, setSelectedPrescription] = useState(null);

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      const { data } = await axios.get("/api/prescription/getprescriptions", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setPrescriptions(data);
    } catch (error) {
      console.error("Error fetching prescriptions:", error);
    }
    setLoading(false);
  };

  const downloadPrescription = (prescription) => {
    const content = `
========================================
        DIGITAL PRESCRIPTION
        DoctorOnCall Healthcare
========================================

Date: ${new Date(prescription.createdAt).toLocaleDateString()}
Prescription ID: ${prescription._id}

Doctor: ${prescription.doctorName}
Patient: ${prescription.patient?.firstname} ${prescription.patient?.lastname}

----------------------------------------
DIAGNOSIS:
${prescription.diagnosis}

----------------------------------------
MEDICATIONS:
${prescription.medications.map((med, i) => 
  `${i + 1}. ${med.name}
   Dosage: ${med.dosage}
   Frequency: ${med.frequency}
   Duration: ${med.duration}`
).join('\n\n')}

----------------------------------------
INSTRUCTIONS:
${prescription.instructions}

${prescription.followUpDate ? `\nFollow-up Date: ${prescription.followUpDate}` : ''}

========================================
This is a digitally generated prescription
from DoctorOnCall Healthcare Platform.
========================================
    `;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prescription_${prescription._id}.txt`;
    a.click();
  };

  return (
    <>
      <Navbar />
      {loading ? (
        <Loading />
      ) : (
        <section className="prescriptions-section">
          <div className="prescriptions-container">
            <h1 className="page-heading">My Prescriptions</h1>
            
            {prescriptions.length === 0 ? (
              <Empty />
            ) : (
              <div className="prescriptions-grid">
                {prescriptions.map((prescription) => (
                  <div key={prescription._id} className="prescription-card">
                    <div className="prescription-header">
                      <FaNotesMedical className="prescription-icon" />
                      <div>
                        <h3>{prescription.diagnosis}</h3>
                        <p className="prescription-date">
                          <FaCalendarAlt /> {new Date(prescription.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="prescription-doctor">
                      <FaUserMd /> {prescription.doctorName}
                    </div>
                    
                    <div className="medications-preview">
                      <h4><FaPills /> Medications ({prescription.medications.length})</h4>
                      <ul>
                        {prescription.medications.slice(0, 2).map((med, i) => (
                          <li key={i}>{med.name} - {med.dosage}</li>
                        ))}
                        {prescription.medications.length > 2 && (
                          <li>+{prescription.medications.length - 2} more...</li>
                        )}
                      </ul>
                    </div>
                    
                    <div className="prescription-actions">
                      <button className="btn btn-secondary" onClick={() => setSelectedPrescription(prescription)}>
                        View Details
                      </button>
                      <button className="btn" onClick={() => downloadPrescription(prescription)}>
                        <FaDownload /> Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {selectedPrescription && (
            <div className="modal flex-center" onClick={() => setSelectedPrescription(null)}>
              <div className="prescription-detail-modal" onClick={(e) => e.stopPropagation()}>
                <button className="close-btn" onClick={() => setSelectedPrescription(null)}>&times;</button>
                <h2>Prescription Details</h2>
                
                <div className="detail-section">
                  <h4>Diagnosis</h4>
                  <p>{selectedPrescription.diagnosis}</p>
                </div>
                
                <div className="detail-section">
                  <h4>Medications</h4>
                  {selectedPrescription.medications.map((med, i) => (
                    <div key={i} className="medication-item">
                      <strong>{med.name}</strong>
                      <p>Dosage: {med.dosage}</p>
                      <p>Frequency: {med.frequency}</p>
                      <p>Duration: {med.duration}</p>
                    </div>
                  ))}
                </div>
                
                <div className="detail-section">
                  <h4>Instructions</h4>
                  <p>{selectedPrescription.instructions}</p>
                </div>
                
                {selectedPrescription.followUpDate && (
                  <div className="detail-section">
                    <h4>Follow-up Date</h4>
                    <p>{selectedPrescription.followUpDate}</p>
                  </div>
                )}
                
                <button className="btn" onClick={() => downloadPrescription(selectedPrescription)}>
                  <FaDownload /> Download Prescription
                </button>
              </div>
            </div>
          )}
        </section>
      )}
      <Footer />
    </>
  );
};

export default Prescriptions;
