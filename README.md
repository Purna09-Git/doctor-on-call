# Here are your Instructions
# DoctorOnCall 

**DoctorOnCall** is a modern telehealth platform designed to bridge the gap between patients and healthcare providers. [cite_start]It enables users to schedule appointments, participate in video consultations, and manage medical records securely from the comfort of their homes[cite: 6, 14].

## 📖 Project Overview
[cite_start]The rise in demand for telehealth services requires accessible, user-friendly solutions[cite: 4]. [cite_start]DoctorOnCall addresses this by providing a seamless interface for patients to connect with doctors, reducing wait times and improving access to healthcare in underserved locations[cite: 7, 8].

## ✨ Key Features
* [cite_start]**User Roles:** Secure login and management for Patients, Doctors, and Administrators[cite: 23].
* [cite_start]**Appointment Scheduling:** Real-time booking system for doctor appointments[cite: 19].
* [cite_start]**Doctor Dashboard:** specialized interface for doctors to manage availability, view appointments, and write prescriptions[cite: 89].
* **AI Symptom Checker:** An intelligent tool to help patients assess symptoms before booking.
* [cite_start]**Medical Records:** Secure storage for patient history, diagnoses, and prescriptions[cite: 23].
* **Reviews & Ratings:** Patients can review doctors after consultations.
* **Analytics:** Admin dashboard to track user growth and appointment statistics.

## 🛠️ Tech Stack
* **Backend:** Python, FastAPI
* **Database:** MongoDB (Motor/AsyncIO)
* **Authentication:** JWT (JSON Web Tokens) with BCrypt password hashing
* **API Documentation:** Swagger UI / OpenAPI
* [cite_start]**Frontend:** (Mention your frontend framework here, e.g., React/Angular) [cite: 108]

## 🚀 Getting Started

### Prerequisites
* Python 3.8+
* MongoDB Cluster

### Installation

1.  **Clone the repository**
    ```bash
    git clone [https://github.com/yourusername/DoctorOnCall.git](https://github.com/yourusername/DoctorOnCall.git)
    cd DoctorOnCall
    ```

2.  **Set up the Virtual Environment**
    ```bash
    python3 -m venv venv
    source venv/bin/activate  # On Windows use `venv\Scripts\activate`
    ```

3.  **Install Dependencies**
    ```bash
    cd backend
    pip install -r requirements.txt
    ```

4.  **Environment Variables**
    Create a `.env` file in the `backend` directory:
    ```env
    DB_NAME=doctoroncall
    JWT_SECRET=your_secret_key
    MONGO_URL=your_mongodb_connection_string
    ```

5.  **Run the Server**
    ```bash
    uvicorn main:app --reload
    ```
    The API will be available at `http://127.0.0.1:8000/docs`.

## 👥 Team Members
* [cite_start]**Sahithya Edamalapati** - Requirement Gathering & Video Integration [cite: 97, 94]
* [cite_start]**Ananya Pagadala** - UI Design & Chat System [cite: 98, 94]
* [cite_start]**Shivani Thokala** - Backend Development & Scheduling [cite: 99, 94]
* [cite_start]**Purna Venkata Sai Kiran Mummani** - Data Storage, Security & Testing [cite: 100, 94]

## 📄 License
[cite_start]This project is for educational purposes as part of the initial project proposal and plan[cite: 2].
