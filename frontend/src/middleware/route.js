import { Navigate } from "react-router-dom";
import jwt_decode from "jwt-decode";

export const Protected = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" replace={true} />;
  }
  return children;
};

export const Public = ({ children }) => {
  const token = localStorage.getItem("token");
  if (token) {
    return <Navigate to="/" replace={true} />;
  }
  return children;
};

export const Admin = ({ children }) => {
  const token = localStorage.getItem("token");
  let user = null;
  
  if (token) {
    try {
      user = jwt_decode(token);
    } catch {
      return <Navigate to="/login" replace={true} />;
    }
  }
  
  if (!user) {
    return <Navigate to="/login" replace={true} />;
  }
  
  if (!user.isAdmin) {
    return <Navigate to="/" replace={true} />;
  }
  
  return children;
};
