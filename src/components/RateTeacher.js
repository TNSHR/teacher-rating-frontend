
import React, { useState, useEffect } from "react";
import API from "../api";
import "../styles/RateTeacher.css";

const RateTeacher = () => {
  const [uniqueCode, setUniqueCode] = useState(""); // Student unique code
  const [verifiedStudent, setVerifiedStudent] = useState(null); // Verified student object
  const [teachers, setTeachers] = useState([]);
  const [ratings, setRatings] = useState({});
  const [submittedToday, setSubmittedToday] = useState([]);
  const [message, setMessage] = useState("");

  const handleVerifyCode = async () => {
    const code = uniqueCode.trim().toUpperCase(); // ✅ Trim whitespace & uppercase
    if (!code) return alert("Please enter your unique code!");
    try {
      const res = await API.get(`/students?uniqueCode=${code}`);
      if (res.data.length === 0) {
        alert("Invalid code! Please check and try again.");
        setVerifiedStudent(null);
        setTeachers([]);
      } else {
        const student = res.data[0];
        setVerifiedStudent(student);

        // Fetch teachers
        const tRes = await API.get(`/teachers/by-student-code/${code}`);
        setTeachers(tRes.data.teachers);

        // Fetch today’s ratings by this student
        const rRes = await API.get(`/ratings/today/${student._id}`);
        if (Array.isArray(rRes.data)) {
          setSubmittedToday(rRes.data.map((r) => r.teacherId));
        }
      }
    } catch (err) {
      console.error(err);
      alert("Error verifying code. Try again later.");
    }
  };

  const handleRating = (teacherId, value) => {
    if (submittedToday.includes(teacherId)) {
      setMessage("⚠️ You’ve already rated this teacher today!");
      return;
    }
    setRatings((prev) => ({
      ...prev,
      [teacherId]: prev[teacherId] === value ? 0 : value, // ✅ toggle rating to uncheck
    }));
  };

  const handleSubmit = async () => {
    if (!uniqueCode) {
      alert("Please enter your unique code before rating.");
      return;
    }

    const ratingEntries = Object.entries(ratings).filter(([_, v]) => v > 0); // ignore 0 ratings
    if (ratingEntries.length === 0) {
      alert("Please rate at least one teacher before submitting.");
      return;
    }

    try {
      await Promise.all(
        ratingEntries.map(([teacherId, value]) =>
          API.post("/ratings", {
            studentId: verifiedStudent._id,
            teacherId,
            rating: value,
            uniqueCode: uniqueCode.trim().toUpperCase(), // ✅ consistent code
          })
        )
      );
      setMessage("✅ Ratings submitted successfully!");
      setRatings({});
      setSubmittedToday((prev) => [...prev, ...ratingEntries.map(([id]) => id)]);
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "❌ Error submitting ratings. Try again later.");
    }
  };

  return (
    <div className="rate-container">
      <h2>⭐ Rate Your Mentors</h2>

      {/* Enter Unique Code */}
      <div className="select-group">
        <label>Enter Your Unique Code:</label>
        <input
          type="text"
          value={uniqueCode}
          onChange={(e) => setUniqueCode(e.target.value)}
          placeholder="Enter your unique code"
          className="unique-code-input"
        />
        <button className="submit-btn" onClick={handleVerifyCode}>Verify</button>
      </div>

      {/* Display Verified Student Info */}
      {verifiedStudent && (
        <p>
          ✅ Welcome: {verifiedStudent.name} (Grade: {verifiedStudent.grade})
        </p>
      )}

      {/* Teachers Rating Section */}
      {teachers.length > 0 && verifiedStudent && (
        <div className="teachers-list">
          <h3>Give Ratings (1–5 stars)</h3>
          {teachers.flatMap((t) =>
            t.subjects
              .filter((s) => s.grade === verifiedStudent.grade)
              .map((s) => {
                const teacherUniqueId = `${t._id}-${s.subject}`;
                const disabled = submittedToday.includes(teacherUniqueId);
                return (
                  <div key={teacherUniqueId} className={`teacher-card ${disabled ? "disabled" : ""}`}>
                    <div className="teacher-info">
                      <span className="teacher-name">{t.name}</span>
                      <span className="teacher-subject">({s.subject})</span>
                    </div>
                    <div className="star-rating">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <span
                          key={i}
                          className={ratings[teacherUniqueId] >= i ? "star filled" : "star"}
                          onClick={() => !disabled && handleRating(teacherUniqueId, i)}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    {disabled && <p className="already-rated">Rated today ✅</p>}
                  </div>
                );
              })
          )}
        </div>
      )}

      {/* Submit Button */}
      {teachers.length > 0 && verifiedStudent && (
        <button className="submit-btn" onClick={handleSubmit}>
          Submit Ratings
        </button>
      )}

      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default RateTeacher;
