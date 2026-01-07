import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../styles/register.css";
import axios from "axios";
import toast from "react-hot-toast";
import { FaHeartbeat } from "react-icons/fa";

// ✅ FIXED: Using the variable name that matches your .env file
axios.defaults.baseURL = process.env.REACT_APP_SERVER_DOMAIN;

function Register() {
  const [file, setFile] = useState("");
  const [loading, setLoading] = useState(false);
  const [formDetails, setFormDetails] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    confpassword: "",
  });
  const navigate = useNavigate();

  const inputChange = (e) => {
    const { name, value } = e.target;
    return setFormDetails({
      ...formDetails,
      [name]: value,
    });
  };

  const onUpload = async (element) => {
    if (!element) return;

    setLoading(true);
    if (element.type === "image/jpeg" || element.type === "image/png" || element.type === "image/jpg") {
      const data = new FormData();
      data.append("file", element);
      data.append("upload_preset", process.env.REACT_APP_CLOUDINARY_PRESET);
      data.append("cloud_name", process.env.REACT_APP_CLOUDINARY_CLOUD_NAME);
      
      fetch(process.env.REACT_APP_CLOUDINARY_BASE_URL, {
        method: "POST",
        body: data,
      })
        .then((res) => res.json())
        .then((data) => {
          setFile(data.url.toString());
          setLoading(false);
          toast.success("Profile picture uploaded!");
        })
        .catch(() => {
          setLoading(false);
          toast.error("Failed to upload image");
        });
    } else {
      setLoading(false);
      toast.error("Please select an image in JPEG or PNG format");
    }
  };

  const formSubmit = async (e) => {
    try {
      e.preventDefault();

      if (loading) return;
      if (file === "") {
        return toast.error("Please upload a profile picture");
      }

      const { firstname, lastname, email, password, confpassword } = formDetails;
      if (!firstname || !lastname || !email || !password || !confpassword) {
        return toast.error("Please fill in all fields");
      } else if (firstname.length < 3) {
        return toast.error("First name must be at least 3 characters");
      } else if (lastname.length < 3) {
        return toast.error("Last name must be at least 3 characters");
      } else if (password.length < 5) {
        return toast.error("Password must be at least 5 characters");
      } else if (password !== confpassword) {
        return toast.error("Passwords do not match");
      }

      await toast.promise(
        axios.post("/api/user/register", {
          firstname,
          lastname,
          email,
          password,
          pic: file,
        }),
        {
          pending: "Creating account...",
          success: "Account created successfully!",
          error: "Unable to create account",
          loading: "Creating account...",
        }
      );
      return navigate("/login");
    } catch (error) {
      return error;
    }
  };

  return (
    <section className="register-section flex-center">
      <div className="register-container flex-center">
        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <FaHeartbeat style={{ fontSize: '3rem', color: 'var(--primary-blue)' }} />
        </div>
        <h2 className="form-heading">Create Account</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          Join DoctorOnCall today
        </p>
        <form onSubmit={formSubmit} className="register-form">
          <input
            type="text"
            name="firstname"
            className="form-input"
            placeholder="First name"
            value={formDetails.firstname}
            onChange={inputChange}
          />
          <input
            type="text"
            name="lastname"
            className="form-input"
            placeholder="Last name"
            value={formDetails.lastname}
            onChange={inputChange}
          />
          <input
            type="email"
            name="email"
            className="form-input"
            placeholder="Email address"
            value={formDetails.email}
            onChange={inputChange}
          />
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Profile Picture
            </label>
            <input
              type="file"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  onUpload(e.target.files[0]);
                }
              }}
              name="profile-pic"
              id="profile-pic"
              className="form-input"
              accept="image/jpeg,image/png"
            />
          </div>
          <input
            type="password"
            name="password"
            className="form-input"
            placeholder="Password"
            value={formDetails.password}
            onChange={inputChange}
          />
          <input
            type="password"
            name="confpassword"
            className="form-input"
            placeholder="Confirm password"
            value={formDetails.confpassword}
            onChange={inputChange}
          />
          <button
            type="submit"
            className={`btn form-btn ${loading ? 'disabled' : ''}`}
            disabled={loading}
          >
            {loading ? 'Uploading...' : 'Create Account'}
          </button>
        </form>
        <p>
          Already have an account?{" "}
          <NavLink className="login-link" to="/login">
            Sign In
          </NavLink>
        </p>
      </div>
    </section>
  );
}

export default Register;