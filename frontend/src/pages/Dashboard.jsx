import React from "react";
import AdminApplications from "../components/AdminApplications";
import AdminAppointments from "../components/AdminAppointments";
import AdminDoctors from "../components/AdminDoctors";
import Sidebar from "../components/Sidebar";
import Users from "../components/Users";
import Analytics from "../components/Analytics";
import "../styles/sidebar.css";

const Dashboard = (props) => {
  const { type } = props;
  return (
    <section className="layout-section">
      <div className="layout-container">
        <Sidebar />
        {type === "users" ? (
          <Users />
        ) : type === "doctors" ? (
          <AdminDoctors />
        ) : type === "applications" ? (
          <AdminApplications />
        ) : type === "appointments" ? (
          <AdminAppointments />
        ) : type === "analytics" ? (
          <Analytics />
        ) : (
          <></>
        )}
      </div>
    </section>
  );
};

export default Dashboard;
