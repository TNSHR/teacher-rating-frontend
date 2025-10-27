import React, { useState } from "react";
import API from "../api";
import OTPModal from "./OTPModel";
import "../styles/Register.css";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [otpModal, setOtpModal] = useState(false);
  const [verified, setVerified] = useState(false);

  const validatePassword = (pwd) => {
    const errors = [];
    if (pwd.length < 8) errors.push("Password must be at least 8 characters long.");
    if (!/[A-Z]/.test(pwd)) errors.push("Password must include at least one uppercase letter.");
    if (!/[0-9]/.test(pwd)) errors.push("Password must include at least one number.");
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) errors.push("Password must include at least one special character.");
    return errors;
  };

  const checkUserLimit = async () => {
    try {
      const res = await API.get("/users-count");
      if (res.data.count >= 3) {
        setMessage("Registration limit reached. Only 3 users can register.");
        return false;
      }
      return true;
    } catch (err) {
      console.error(err);
      setMessage("Error checking user limit.");
      return false;
    }
  };

  const sendOTP = async (e) => {
    e.preventDefault();

    const canRegister = await checkUserLimit();
    if (!canRegister) return;

    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      setMessage(passwordErrors.join(" "));
      return;
    }

    try {
      const res = await API.post("/send-otp", { email });
      if (res.data.message === "OTP sent successfully") {
        setOtpModal(true);
        setMessage("OTP sent to your email. Please verify.");
      } else {
        setMessage(res.data.message || "Failed to send OTP.");
      }
    } catch (error) {
      console.error(error);
      setMessage(error.response?.data?.message || "Failed to send OTP. Try again later.");
    }
  };

  const handleRegister = async () => {
  try {
    const res = await API.post("/register", { email, password });
    setMessage(res.data.message || "Registered successfully!");
    setEmail("");
    setPassword("");
    setVerified(false);
  } catch (error) {
    console.error(error);
    if (error.response?.status === 400 && error.response?.data?.message === "User already exists") {
      setMessage("This email is already registered. Please login instead.");
    } else {
      setMessage(error.response?.data?.message || "Error registering user.");
    }
  }
};


  return (
    <div className="register-container">
      <h3>Register</h3>
      <form onSubmit={sendOTP}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {!verified ? (
          <button type="submit">Send OTP</button>
        ) : (
          <button type="button" onClick={handleRegister}>
            Complete Registration
          </button>
        )}
      </form>

      {message && <p className="message">{message}</p>}

      {otpModal && (
        <OTPModal
          email={email}
          onVerified={() => {
            setVerified(true);
            setOtpModal(false);
            setMessage("OTP verified successfully. Click 'Complete Registration'.");
          }}
          onClose={() => setOtpModal(false)}
        />
      )}
    </div>
  );
};

export default Register;
