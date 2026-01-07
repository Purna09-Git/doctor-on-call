import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Loading from "./Loading";
import { setLoading } from "../redux/reducers/rootSlice";
import { useDispatch, useSelector } from "react-redux";
import Empty from "./Empty";
import fetchData from "../helper/apiCall";
import "../styles/user.css";

axios.defaults.baseURL = process.env.REACT_APP_BACKEND_URL;

const AdminApplications = () => {
  const [applications, setApplications] = useState([]);
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.root);

  const getAllApplications = async () => {
    try {
      dispatch(setLoading(true));
      const temp = await fetchData(`/api/doctor/getnotdoctors`);
      setApplications(temp);
      dispatch(setLoading(false));
    } catch (error) {
      dispatch(setLoading(false));
    }
  };

  const acceptApplication = async (ele) => {
    try {
      await toast.promise(
        axios.put(
          "/api/doctor/acceptdoctor",
          {
            id: ele?._id,
            userId: ele?.userId?._id,
          },
          {
            headers: {
              authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        ),
        {
          success: "Application accepted",
          error: "Unable to accept application",
          loading: "Processing...",
        }
      );
      getAllApplications();
    } catch (error) {
      return error;
    }
  };

  const rejectApplication = async (ele) => {
    try {
      await toast.promise(
        axios.put(
          "/api/doctor/rejectdoctor",
          {
            id: ele?._id,
            userId: ele?.userId?._id,
          },
          {
            headers: {
              authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        ),
        {
          success: "Application rejected",
          error: "Unable to reject application",
          loading: "Processing...",
        }
      );
      getAllApplications();
    } catch (error) {
      return error;
    }
  };

  useEffect(() => {
    getAllApplications();
  }, []);

  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <section className="user-section">
          <h3 className="page-heading">Doctor Applications</h3>
          {applications.length > 0 ? (
            <div className="user-container">
              <table>
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Photo</th>
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th>Email</th>
                    <th>Mobile</th>
                    <th>Experience</th>
                    <th>Specialization</th>
                    <th>Fees</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {applications?.map((ele, i) => (
                    <tr key={ele?._id}>
                      <td>{i + 1}</td>
                      <td>
                        <img
                          className="user-table-pic"
                          src={ele?.userId?.pic || "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"}
                          alt="Applicant"
                        />
                      </td>
                      <td>{ele?.userId?.firstname}</td>
                      <td>{ele?.userId?.lastname}</td>
                      <td>{ele?.userId?.email}</td>
                      <td>{ele?.userId?.mobile || "N/A"}</td>
                      <td>{ele?.experience} yrs</td>
                      <td>{ele?.specialization}</td>
                      <td>${ele?.fees}</td>
                      <td className="select">
                        <button
                          className="btn accept-btn"
                          onClick={() => acceptApplication(ele)}
                        >
                          Accept
                        </button>
                        <button
                          className="btn user-btn"
                          onClick={() => rejectApplication(ele)}
                        >
                          Reject
                        </button>
                      </td>
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
    </>
  );
};

export default AdminApplications;
