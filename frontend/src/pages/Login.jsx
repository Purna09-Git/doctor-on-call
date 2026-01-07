import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../styles/register.css";
import axios from "axios";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { setUserInfo } from "../redux/reducers/rootSlice";
import jwt_decode from "jwt-decode";
import fetchData from "../helper/apiCall";
import { FaHeartbeat } from "react-icons/fa";

// ✅ FIX 1: Use the correct variable name from your .env file
axios.defaults.baseURL = process.env.REACT_APP_SERVER_DOMAIN;

function Login() {
  const dispatch = useDispatch();
  const [formDetails, setFormDetails] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const inputChange = (e) => {
    const { name, value } = e.target;
    return setFormDetails({
      ...formDetails,
      [name]: value,
    });
  };

  const formSubmit = async (e) => {
    try {
      e.preventDefault();
      const { email, password } = formDetails;
      if (!email || !password) {
        return toast.error("Please fill in all fields");
      } else if (password.length < 5) {
        return toast.error("Password must be at least 5 characters long");
      }

      setIsLoading(true);

      // ✅ FIX 2: Removed "/api" from here. 
      // It now combines with your Base URL to form "/api/user/login"
      const { data } = await toast.promise(
        axios.post("/api/user/login", { email, password }),
        {
          pending: "Logging in...",
          success: "Login successful!",
          error: "Unable to login",
          loading: "Logging in...",
        }
      );
      
      localStorage.setItem("token", data.token);
      dispatch(setUserInfo(jwt_decode(data.token).userId));
      getUser(jwt_decode(data.token).userId);
    } catch (error) {
      setIsLoading(false);
      // Optional: Log the real error to console to help debug
      console.error(error); 
      return error;
    }
  };

  const getUser = async (id) => {
    try {
      // ✅ FIX 3: Removed "/api" from here too
      const temp = await fetchData(`/user/getuser/${id}`);
      dispatch(setUserInfo(temp));
      setIsLoading(false);
      return navigate("/");
    } catch (error) {
      setIsLoading(false);
      return error;
    }
  };

  return (
    <section className="register-section flex-center">
      <div className="register-container flex-center">
        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <FaHeartbeat style={{ fontSize: '3rem', color: 'var(--primary-blue)' }} />
        </div>
        <h2 className="form-heading">Welcome Back</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          Sign in to continue to DoctorOnCall
        </p>
        <form onSubmit={formSubmit} className="register-form">
          <input
            type="email"
            name="email"
            className="form-input"
            placeholder="Enter your email"
            value={formDetails.email}
            onChange={inputChange}
          />
          <input
            type="password"
            name="password"
            className="form-input"
            placeholder="Enter your password"
            value={formDetails.password}
            onChange={inputChange}
          />
          <button
            type="submit"
            className={`btn form-btn ${isLoading ? 'disabled' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p>
          Don't have an account?{" "}
          <NavLink className="login-link" to="/register">
            Sign Up
          </NavLink>
        </p>
      </div>
    </section>
  );
}

export default Login;