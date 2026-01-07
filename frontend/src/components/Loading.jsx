import React from "react";
import { ClipLoader } from "react-spinners";
import "../styles/loading.css";

const Loading = () => {
  return (
    <div className="loading">
      <div className="loading-spinner">
        <ClipLoader color="#4facfe" size={60} speedMultiplier={0.8} />
        <p className="loading-text">Loading...</p>
      </div>
    </div>
  );
};

export default Loading;
