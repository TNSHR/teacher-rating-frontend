import axios from "axios";

const API = axios.create({
  baseURL: "https://teacher-rating-backend.onrender.com", // Replace with Render/Netlify URL when deployed
});

// Attach token automatically
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

export default API;
// https://teacher-rating-backend.onrender.com