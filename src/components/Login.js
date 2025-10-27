import React, { useState } from "react";
import API from "../api";
import OTPModal from "./OTPModel";
import "../styles/Login.css";
import { useNavigate } from "react-router-dom";

const Login = ({ setUser }) => {
  const navigate = useNavigate();

  // 🔹 States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpModal, setOtpModal] = useState(false);
  const [resetPasswordMode, setResetPasswordMode] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");

  // ✅ LOGIN FUNCTION
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setMessage("Please enter both email and password.");
      return;
    }

    try {
      const res = await API.post("/login", {
        email: email.trim().toLowerCase(),
        password,
      });

      const { token, isAdmin } = res.data;

      if (!token) throw new Error("Token missing from response");

      // ✅ Save token & set user state
      localStorage.setItem("token", token);
      setUser({ email: email.trim().toLowerCase(), token, isAdmin });

      // ✅ Navigate based on role
      navigate(isAdmin ? "/admin" : "/rate-teacher");
    } catch (err) {
      console.error("Login frontend error:", err);
      setMessage(
        err.response?.data?.message || "Invalid credentials. Please try again."
      );
    }
  };

  // ✅ SEND OTP (Forgot Password)
  const handleForgotPassword = async () => {
    if (!email) {
      setMessage("Please enter your email first");
      return;
    }

    try {
      await API.post("/send-otp", { email: email.trim().toLowerCase() });
      setOtpModal(true);
      setResetPasswordMode(true);
      setMessage("OTP sent to your email. Verify it to reset your password.");
    } catch (err) {
      console.error("OTP error:", err);
      setMessage("Failed to send OTP. Try again later.");
    }
  };

  // ✅ RESET PASSWORD
  const handlePasswordReset = async () => {
    if (!newPassword) {
      setMessage("Enter new password");
      return;
    }

    try {
      await API.post("/reset-password", {
        email: email.trim().toLowerCase(),
        password: newPassword, // backend expects `password`
      });

      setMessage("Password reset successfully! You can now login.");
      setResetPasswordMode(false);
      setPassword(newPassword); // autofill for convenience
      setNewPassword("");
    } catch (err) {
      console.error("Password reset error:", err);
      setMessage(err.response?.data?.message || "Password reset failed.");
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleLogin}>
        <h3>Login</h3>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value.trim())}
          required
        />

        {!resetPasswordMode ? (
          <>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit">Login</button>
            <p className="forgot-password" onClick={handleForgotPassword}>
              Forgot Password?
            </p>
          </>
        ) : (
          <>
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <button type="button" onClick={handlePasswordReset}>
              Reset Password
            </button>
          </>
        )}

        {message && <p className="message">{message}</p>}
      </form>

      {otpModal && (
        <OTPModal
          email={email.trim().toLowerCase()}
          onVerified={() => {
            setMessage("OTP verified! Now enter your new password below.");
            setOtpModal(false);
          }}
          onClose={() => setOtpModal(false)}
        />
      )}
    </div>
  );
};

export default Login;
