import React from 'react';
import { Routes, Route } from 'react-router-dom';
import  { useState } from "react";
import Home from './pages/Home';
import Login from './components/Login';
import Register from './components/Register';
import RateTeacher from './components/RateTeacher';
import AllTeachersRatings from './components/AllTeachersRatings';
import AdminPanel from './components/AdminPanel';
import ChangePassword from './components/ChangePassword';
import OTPModel from './components/OTPModel';

function App() {
  const [user, setUser] = useState(null);
  return (
    <Routes>
  <Route path="/" element={<Home />} />
  <Route path="/login" element={<Login setUser={setUser} />} /> 
  <Route path="/register" element={<Register />} />
  <Route path="/rate-teacher" element={<RateTeacher />} />
  <Route path="/view-ratings" element={<AllTeachersRatings />} />
  {/* <Route path="/admin" element={<AdminPanel />} /> */}
  <Route path="/admin" element={<AdminPanel setUser={setUser} />} />
  

  <Route path="/change-password" element={<ChangePassword />} />
  <Route path="/otp" element={<OTPModel />} />
  {/* Optional dashboard route for non-admin users */}
  {/* <Route path="/dashboard" element={<RateTeacher />} /> */}
</Routes>

  );
}

export default App;
