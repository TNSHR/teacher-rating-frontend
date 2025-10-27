import React from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <h2 style={{color: "#CCFF66 "}}>Welcome to Students Feedback portal</h2>
      <div className="card-grid">
        <div className="home-card" onClick={() => navigate("/login")}>
          <h3>Login</h3>
          <p>Access your account</p>
        </div>
        {/* <div className="home-card" onClick={() => navigate("/register")}>
          <h3>Register</h3>
          <p>Create a new account</p>
        </div> */}
        <div className="home-card" onClick={() => navigate("/rate-teacher")}>
          <h3>Rate</h3>
          <p>Give your feedback</p>
        </div>
        {/* <div className="home-card" onClick={() => navigate("/view-ratings")}>
          <h3>View Ratings</h3>
          <p>See what others say</p>
        </div> */}
      </div>
    </div>
  );
};

export default Home;
