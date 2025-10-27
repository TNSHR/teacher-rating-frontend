import React, { useState } from "react";
import API from "../api";
import "../styles/OTPModal.css";

const OTPModal = ({ email, onVerified, onClose }) => {
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");

  const verifyOTP = async () => {
    try {
      const res = await API.post("/verify-otp", { email, otp });

      // Check backend response
      if (res.data.message === "OTP verified successfully" || res.data.token) {
        setMessage("OTP Verified!");
        onVerified();
      } else {
        setMessage(res.data.message || "Invalid OTP.");
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Verification failed.");
      console.error("OTP verification error:", error);
    }
  };

  return (
    <div className="otp-modal">
      <div className="otp-box">
        <h3>Enter OTP sent to {email}</h3>
        <input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />
        <div className="otp-actions">
          <button onClick={verifyOTP}>Verify</button>
          <button className="cancel" onClick={onClose}>Cancel</button>
        </div>
        {message && <p className="msg">{message}</p>}
      </div>
    </div>
  );
};

export default OTPModal;
