import React, { useEffect, useState } from "react";
import Empty from "../components/Empty";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import fetchData from "../helper/apiCall";
import { setLoading } from "../redux/reducers/rootSlice";
import Loading from "../components/Loading";
import { useDispatch, useSelector } from "react-redux";
import jwt_decode from "jwt-decode";
import axios from "axios";
import toast from "react-hot-toast";
import "../styles/user.css";
import "../styles/notification.css";

axios.defaults.baseURL = process.env.REACT_APP_BACKEND_URL;

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.root);
  const token = localStorage.getItem("token");
  const { userId } = token ? jwt_decode(token) : {};

  const getAllAppoint = async () => {
    try {
      dispatch(setLoading(true));
      const temp = await fetchData(`/api/appointment/getallappointments?search=${userId}`);
      setAppointments(temp);
      dispatch(setLoading(false));
    } catch (error) {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    getAllAppoint();
  }, []);

  const complete = async (ele) => {
    try {
      await toast.promise(
        axios.put(
          "/api/appointment/completed",
          {
            appointid: ele?._id,
            doctorId: ele?.doctorId?._id,
            doctorname: `${ele?.userId?.firstname} ${ele?.userId?.lastname}`,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        ),
        {
          success: "Appointment marked as completed",
          error: "Unable to update appointment",
          loading: "Updating...",
        }
      );
      getAllAppoint();
    } catch (error) {
      return error;
    }
  };

  return (
    <>
      <Navbar />
      {loading ? (
        <Loading />
      ) : (
        <section className="container notif-section">
          <h2 className="page-heading">Your Appointments</h2>
          {appointments.length > 0 ? (
            <div className="appointments">
              <table>
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Doctor</th>
                    <th>Patient</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Booked On</th>
                    <th>Status</th>
                    {userId === appointments[0]?.doctorId?._id && <th>Action</th>}
                  </tr>
                </thead>
                <tbody>
                  {appointments?.map((ele, i) => (
                    <tr key={ele?._id}>
                      <td>{i + 1}</td>
                      <td>{ele?.doctorId?.firstname + " " + ele?.doctorId?.lastname}</td>
                      <td>{ele?.userId?.firstname + " " + ele?.userId?.lastname}</td>
                      <td>{ele?.date}</td>
                      <td>{ele?.time}</td>
                      <td>{ele?.createdAt?.split("T")[0]}</td>
                      <td>
                        <span style={{
                          padding: '0.375rem 0.75rem',
                          borderRadius: '9999px',
                          fontSize: '0.8rem',
                          fontWeight: '600',
                          background: ele?.status === 'Completed' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                          color: ele?.status === 'Completed' ? '#10b981' : '#f59e0b'
                        }}>
                          {ele?.status}
                        </span>
                      </td>
                      {userId === ele?.doctorId?._id && (
                        <td>
                          <button
                            className={`btn accept-btn ${ele?.status === "Completed" ? "disable-btn" : ""}`}
                            disabled={ele?.status === "Completed"}
                            onClick={() => complete(ele)}
                          >
                            Complete
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <Empty />
          )}
        </section>
      )}
      <Footer />
    </>
  );
};

export default Appointments;
