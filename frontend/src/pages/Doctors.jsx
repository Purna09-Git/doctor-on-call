import React, { useEffect, useState } from "react";
import DoctorCard from "../components/DoctorCard";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import "../styles/doctors.css";
import fetchData from "../helper/apiCall";
import Loading from "../components/Loading";
import { useDispatch, useSelector } from "react-redux";
import { setLoading } from "../redux/reducers/rootSlice";
import Empty from "../components/Empty";
import { FaSearch, FaFilter } from "react-icons/fa";
import { useSearchParams } from "react-router-dom";

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    search: searchParams.get("specialization") || "",
    specialization: searchParams.get("specialization") || "",
    minRating: "",
    maxFees: ""
  });
  const [showFilters, setShowFilters] = useState(false);
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.root);

  const specializations = [...new Set(doctors.map(d => d.specialization).filter(Boolean))];

  useEffect(() => {
    fetchAllDocs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, doctors]);

  const fetchAllDocs = async () => {
    dispatch(setLoading(true));
    const data = await fetchData(`/api/doctor/getalldoctors`);
    setDoctors(data);
    setFilteredDoctors(data);
    dispatch(setLoading(false));
  };

  const applyFilters = () => {
    let result = [...doctors];
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(d => 
        d.userId?.firstname?.toLowerCase().includes(searchLower) ||
        d.userId?.lastname?.toLowerCase().includes(searchLower) ||
        d.specialization?.toLowerCase().includes(searchLower)
      );
    }
    
    if (filters.specialization) {
      result = result.filter(d => d.specialization?.toLowerCase().includes(filters.specialization.toLowerCase()));
    }
    
    if (filters.minRating) {
      result = result.filter(d => (d.rating || 0) >= parseFloat(filters.minRating));
    }
    
    if (filters.maxFees) {
      result = result.filter(d => parseFloat(d.fees || 0) <= parseFloat(filters.maxFees));
    }
    
    setFilteredDoctors(result);
  };

  const clearFilters = () => {
    setFilters({ search: "", specialization: "", minRating: "", maxFees: "" });
  };

  return (
    <>
      <Navbar />
      {loading && <Loading />}
      {!loading && (
        <section className="container doctors">
          <h2 className="page-heading">Our Doctors</h2>
          <p className="page-subtext">Meet our team of experienced healthcare professionals</p>
          
          <div className="doctors-search-bar">
            <div className="search-input-wrapper">
              <FaSearch />
              <input type="text" placeholder="Search doctors by name or specialization..." value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
            </div>
            <button className="btn filter-toggle-btn" onClick={() => setShowFilters(!showFilters)}>
              <FaFilter /> Filters
            </button>
          </div>
          
          {showFilters && (
            <div className="filters-panel">
              <div className="filter-group">
                <label>Specialization</label>
                <select value={filters.specialization} onChange={(e) => setFilters({ ...filters, specialization: e.target.value })}>
                  <option value="">All Specializations</option>
                  {specializations.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="filter-group">
                <label>Minimum Rating</label>
                <select value={filters.minRating} onChange={(e) => setFilters({ ...filters, minRating: e.target.value })}>
                  <option value="">Any Rating</option>
                  <option value="4">4+ Stars</option>
                  <option value="3">3+ Stars</option>
                  <option value="2">2+ Stars</option>
                </select>
              </div>
              <div className="filter-group">
                <label>Max Fees ($)</label>
                <input type="number" placeholder="Max fees" value={filters.maxFees} onChange={(e) => setFilters({ ...filters, maxFees: e.target.value })} />
              </div>
              <button className="btn btn-secondary clear-btn" onClick={clearFilters}>Clear Filters</button>
            </div>
          )}
          
          <p className="results-count">Showing {filteredDoctors.length} doctors</p>
          
          {filteredDoctors.length > 0 ? (
            <div className="doctors-card-container">
              {filteredDoctors.map((ele) => <DoctorCard ele={ele} key={ele._id} />)}
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

export default Doctors;
