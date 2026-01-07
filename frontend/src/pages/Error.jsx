import React from "react";
import { NavLink } from "react-router-dom";
import "../styles/error.css";
import { FaHome } from "react-icons/fa";

const Error = () => {
  return (
    <div className="error-page">
      <h1>404</h1>
      <h2>Page Not Found</h2>
      <p>
        Oops! The page you're looking for doesn't exist or has been moved.
      </p>
      <NavLink to="/" className="btn">
        <FaHome /> Back to Home
      </NavLink>
    </div>
  );
};

export default Error;
