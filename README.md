# DoctorOnCall

**DoctorOnCall** is a comprehensive telehealth platform designed to bridge the gap between patients and healthcare providers. In response to the need for remote healthcare solutions, this application enables secure, efficient, and accessible medical consultations from anywhere.

## Project Overview
The driving force behind this project is improving access to healthcare services, particularly for those in underserved or rural locations. By utilizing modern digital communication, DoctorOnCall reduces wait times and facilitates smooth doctor-patient interactions through video and chat.

## Key Features
* **Online Appointment Booking:** A seamless system for patients to view doctor schedules and book slots in real-time.
* **Remote Video Consultations:** Integrated video conferencing to allow diagnoses without physical travel.
* **Live Chat Support:** A dedicated interface for patients to communicate with support agents for general queries.
* **Doctor Dashboard:** A dynamic calendar and scheduling system for doctors to manage their availability.
* **Secure Data Management:** Role-based access control and encryption to ensure patient and doctor data remains private and compliant.

## Languages and Technologies Used
This project utilizes a modern technology stack to ensure performance, scalability, and security:

### Backend
* **Python (FastAPI):** High-performance framework for building APIs.
* **Uvicorn:** ASGI web server implementation.
* **JWT (JSON Web Tokens):** For secure user authentication and session management.

### Database
* **MongoDB:** NoSQL database for flexible data storage.
* **Motor:** Asynchronous Python driver for non-blocking database interactions.

### Frontend (
* **React / HTML / CSS:** For building a responsive user interface.

### Real-time Communication
* **WebRTC:** For secure, peer-to-peer video conferencing.
* **WebSockets:** For enabling live chat functionality.

## Getting Started

Follow these steps to run the backend server locally:

1. Prerequisites
* Python 3.10+
* MongoDB (Local or Atlas Cluster)

 2. Installation
Clone the repository and navigate to the backend directory:

```bash
git clone [https://github.com/YOUR-USERNAME/doctor-on-call.git](https://github.com/YOUR-USERNAME/doctor-on-call.git)
cd doctor-on-call/backend
```
3.Setup Virtual Environment

Create the environment
```bash
python3 -m venv venv

# Activate it (Mac/Linux)
source venv/bin/activate

# Activate it (Windows)
venv\Scripts\activate
```
4.Install Dependencies
```bash
pip install -r requirements.txt
```
5. Configuration
Create a .env file in the backend directory with your secrets:
```bash
DB_NAME=doctoroncall
JWT_SECRET=your_secure_secret_here
MONGO_URL=your_mongodb_connection_string
```
6. Run the Server
```bash
uvicorn main:app --reload
```
