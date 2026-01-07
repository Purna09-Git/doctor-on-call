import React, { useEffect, useState } from "react";
import axios from "axios";
import Loading from "./Loading";
import { setLoading } from "../redux/reducers/rootSlice";
import { useDispatch, useSelector } from "react-redux";
import Empty from "./Empty";
import "../styles/user.css";
import "../styles/analytics.css";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { FaUsers, FaUserMd, FaCalendarCheck, FaClipboardList, FaChartLine, FaCheckCircle, FaClock, FaTimesCircle } from "react-icons/fa";

axios.defaults.baseURL = process.env.REACT_APP_BACKEND_URL;

const COLORS = ['#4facfe', '#667eea', '#f093fb', '#10b981', '#f59e0b', '#ef4444'];

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.root);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    dispatch(setLoading(true));
    try {
      const { data } = await axios.get("/api/analytics/dashboard", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setAnalytics(data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    }
    dispatch(setLoading(false));
  };

  if (loading) return <Loading />;
  if (!analytics) return <Empty />;

  const appointmentPieData = [
    { name: 'Completed', value: analytics.appointmentStats.completed },
    { name: 'Pending', value: analytics.appointmentStats.pending },
    { name: 'Cancelled', value: analytics.appointmentStats.cancelled }
  ];

  return (
    <section className="analytics-section">
      <h2 className="page-heading">Dashboard Analytics</h2>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon users"><FaUsers /></div>
          <div className="stat-info">
            <h3>{analytics.totalUsers}</h3>
            <p>Total Users</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon doctors"><FaUserMd /></div>
          <div className="stat-info">
            <h3>{analytics.totalDoctors}</h3>
            <p>Verified Doctors</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon appointments"><FaCalendarCheck /></div>
          <div className="stat-info">
            <h3>{analytics.totalAppointments}</h3>
            <p>Total Appointments</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon applications"><FaClipboardList /></div>
          <div className="stat-info">
            <h3>{analytics.pendingApplications}</h3>
            <p>Pending Applications</p>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3><FaChartLine /> Monthly Appointments</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.monthlyAppointments}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
              <Bar dataKey="appointments" fill="url(#colorGradient)" radius={[4, 4, 0, 0]} />
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4facfe" />
                  <stop offset="100%" stopColor="#667eea" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Appointment Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={appointmentPieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {appointmentPieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="pie-legend">
            <span><FaCheckCircle style={{ color: COLORS[0] }} /> Completed: {analytics.appointmentStats.completed}</span>
            <span><FaClock style={{ color: COLORS[1] }} /> Pending: {analytics.appointmentStats.pending}</span>
            <span><FaTimesCircle style={{ color: COLORS[2] }} /> Cancelled: {analytics.appointmentStats.cancelled}</span>
          </div>
        </div>
      </div>

      {analytics.topSpecializations.length > 0 && (
        <div className="chart-card full-width">
          <h3>Top Specializations</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={analytics.topSpecializations} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" stroke="#64748b" />
              <YAxis dataKey="name" type="category" stroke="#64748b" width={120} />
              <Tooltip />
              <Bar dataKey="count" fill="url(#colorGradient2)" radius={[0, 4, 4, 0]} />
              <defs>
                <linearGradient id="colorGradient2" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#667eea" />
                  <stop offset="100%" stopColor="#f093fb" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
};

export default Analytics;
