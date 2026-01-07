import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../styles/navbar.css";
import { HashLink } from "react-router-hash-link";
import { useDispatch } from "react-redux";
import { setUserInfo } from "../redux/reducers/rootSlice";
import { FiMenu } from "react-icons/fi";
import { RxCross1 } from "react-icons/rx";
import { FaHeartbeat, FaStethoscope, FaLightbulb } from "react-icons/fa";
import jwt_decode from "jwt-decode";

const Navbar = () => {
  const [iconActive, setIconActive] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [token] = useState(localStorage.getItem("token") || "");
  const [user] = useState(
    localStorage.getItem("token")
      ? jwt_decode(localStorage.getItem("token"))
      : ""
  );

  const logoutFunc = () => {
    dispatch(setUserInfo({}));
    localStorage.removeItem("token");
    navigate("/login");
  };

  const closeMenu = () => setIconActive(false);

  return (
    <header>
      <nav className={iconActive ? "nav-active" : ""}>
        <h2 className="nav-logo">
          <NavLink to={"/"} onClick={closeMenu}>
            <span className="nav-logo-icon"><FaHeartbeat /></span>
            DoctorOnCall
          </NavLink>
        </h2>
        <ul className="nav-links">
          <li><NavLink to={"/"} onClick={closeMenu}>Home</NavLink></li>
          <li><NavLink to={"/doctors"} onClick={closeMenu}>Doctors</NavLink></li>
          <li><NavLink to={"/symptom-checker"} onClick={closeMenu}><FaStethoscope style={{marginRight: '5px'}} />Symptom Checker</NavLink></li>
          <li><NavLink to={"/health-tips"} onClick={closeMenu}><FaLightbulb style={{marginRight: '5px'}} />Health Tips</NavLink></li>
          {token && user.isAdmin && (
            <li><NavLink to={"/dashboard/users"} onClick={closeMenu}>Dashboard</NavLink></li>
          )}
          {token && !user.isAdmin && (
            <>
              <li><NavLink to={"/appointments"} onClick={closeMenu}>Appointments</NavLink></li>
              <li><NavLink to={"/prescriptions"} onClick={closeMenu}>Prescriptions</NavLink></li>
              <li><NavLink to={"/notifications"} onClick={closeMenu}>Notifications</NavLink></li>
              <li><NavLink to={"/applyfordoctor"} onClick={closeMenu}>Apply for Doctor</NavLink></li>
              <li><NavLink to={"/profile"} onClick={closeMenu}>Profile</NavLink></li>
            </>
          )}
          {!token ? (
            <>
              <li><NavLink className="btn btn-login" to={"/login"} onClick={closeMenu}>Login</NavLink></li>
              <li><NavLink className="btn btn-register" to={"/register"} onClick={closeMenu}>Register</NavLink></li>
            </>
          ) : (
            <li><span className="btn" onClick={() => { logoutFunc(); closeMenu(); }}>Logout</span></li>
          )}
        </ul>
      </nav>
      <div className="menu-icons">
        {!iconActive && <FiMenu className="menu-open" onClick={() => setIconActive(true)} />}
        {iconActive && <RxCross1 className="menu-close" onClick={() => setIconActive(false)} />}
      </div>
    </header>
  );
};

export default Navbar;
