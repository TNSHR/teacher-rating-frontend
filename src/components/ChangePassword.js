import React, { useState } from "react";
import API from "../api";
import "../styles/ChangePassword.css";
import OTPModal from "./OTPModel";

const ChangePassword = () => {
  const [email, setEmail] = useState("");
  const [otpModal, setOtpModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [verified, setVerified] = useState(false);
  const [message, setMessage] = useState("");

  const sendOTP = async () => {
    try {
      await API.post("/send-otp", { email });
      setOtpModal(true);
    } catch (error) {
      console.error(error);
      setMessage("Failed to send OTP");
    }
  };

  const handlePasswordChange = async () => {
    try {
      await API.post("/change-password", { email, newPassword });
      setMessage("Password updated successfully!");
      setEmail("");
      setNewPassword("");
    } catch (error) {
      setMessage("Failed to update password.");
    }
  };

  return (
    <div className="change-password-container">
      <h2>Change Password</h2>
      <input
        type="email"
        placeholder="Enter registered email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      {!verified ? (
        <button onClick={sendOTP}>Send OTP</button>
      ) : (
        <>
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <button onClick={handlePasswordChange}>Change Password</button>
        </>
      )}
      {message && <p className="msg">{message}</p>}

      {otpModal && (
        <OTPModal
          email={email}
          onVerified={() => {
            setVerified(true);
            setOtpModal(false);
          }}
          onClose={() => setOtpModal(false)}
        />
      )}
    </div>
  );
};

export default ChangePassword;
