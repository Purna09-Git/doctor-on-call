import "./styles/app.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { Toaster } from "react-hot-toast";
import { Protected, Public, Admin } from "./middleware/route";
import React, { lazy, Suspense } from "react";
import Loading from "./components/Loading";

const Home = lazy(() => import("./pages/Home"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Appointments = lazy(() => import("./pages/Appointments"));
const Doctors = lazy(() => import("./pages/Doctors"));
const Profile = lazy(() => import("./pages/Profile"));
const Notifications = lazy(() => import("./pages/Notifications"));
const ApplyDoctor = lazy(() => import("./pages/ApplyDoctor"));
const Error = lazy(() => import("./pages/Error"));
const SymptomChecker = lazy(() => import("./pages/SymptomChecker"));
const Prescriptions = lazy(() => import("./pages/Prescriptions"));
const HealthTips = lazy(() => import("./pages/HealthTips"));
const DoctorDetail = lazy(() => import("./pages/DoctorDetail"));

function App() {
  return (
    <Router>
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1e293b',
            color: '#fff',
            borderRadius: '12px',
            padding: '16px 24px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
          },
          success: {
            iconTheme: { primary: '#10b981', secondary: '#fff' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#fff' },
          },
        }}
      />
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Public><Register /></Public>} />
          <Route path="/" element={<Home />} />
          <Route path="/doctors" element={<Doctors />} />
          <Route path="/doctor/:id" element={<DoctorDetail />} />
          <Route path="/symptom-checker" element={<SymptomChecker />} />
          <Route path="/health-tips" element={<HealthTips />} />
          <Route path="/appointments" element={<Protected><Appointments /></Protected>} />
          <Route path="/notifications" element={<Protected><Notifications /></Protected>} />
          <Route path="/applyfordoctor" element={<Protected><ApplyDoctor /></Protected>} />
          <Route path="/profile" element={<Protected><Profile /></Protected>} />
          <Route path="/prescriptions" element={<Protected><Prescriptions /></Protected>} />
          <Route path="/dashboard/users" element={<Admin><Dashboard type={"users"} /></Admin>} />
          <Route path="/dashboard/doctors" element={<Admin><Dashboard type={"doctors"} /></Admin>} />
          <Route path="/dashboard/appointments" element={<Protected><Dashboard type={"appointments"} /></Protected>} />
          <Route path="/dashboard/applications" element={<Admin><Dashboard type={"applications"} /></Admin>} />
          <Route path="/dashboard/analytics" element={<Admin><Dashboard type={"analytics"} /></Admin>} />
          <Route path="*" element={<Error />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
