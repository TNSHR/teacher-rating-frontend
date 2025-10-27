import React, { useState, useEffect } from "react";
import API from "../api";
import "../styles/TeacherPortal.css";

const TeacherPortal = ({ setUser }) => {
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [message, setMessage] = useState("");
  const [activeSection, setActiveSection] = useState("home");
  const [ratings, setRatings] = useState({}); // {id: rating}
  const [feedbacks, setFeedbacks] = useState({}); // {studentId: feedback}

  const gradeMapping = {
    1: "D",
    2: "C",
    3: "B",
    4: "A",
    5: "A+",
  };

  // Fetch all teachers and students
  const fetchData = async () => {
    try {
      const [tRes, sRes] = await Promise.all([
        API.get("/teachers"),
        API.get("/students"),
      ]);
      setTeachers(tRes.data);
      setStudents(sRes.data);
    } catch (err) {
      console.error(err);
      setMessage("Failed to fetch data.");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRatingChange = (id, value) => {
    setRatings({ ...ratings, [id]: value });
  };

  const handleFeedbackChange = (id, value) => {
    setFeedbacks({ ...feedbacks, [id]: value });
  };

  const handleSubmitRating = async (type, id) => {
    if (!ratings[id]) {
      setMessage("❌ Please select a rating");
      return;
    }
    try {
      const payload = {
        rating: ratings[id],
      };
      if (type === "student") {
        payload.feedback = feedbacks[id] || "";
      }

      // Teacher rating for teacher/student
      if (type === "teacher") payload.teacherId = id;
      else payload.studentId = id;

      await API.post("/ratings", payload);
      setMessage("✅ Rating submitted successfully!");
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to submit rating");
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  return (
    <div className="teacher-portal">
      <div className="portal-header">
        <h2>Teacher Portal</h2>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className="cards-container">
        {activeSection === "home" && (
          <>
            <div
              className="card clickable"
              onClick={() => setActiveSection("teachers")}
            >
              <h3>Teachers</h3>
              <p>Give rating to other teachers</p>
            </div>

            <div
              className="card clickable"
              onClick={() => setActiveSection("students")}
            >
              <h3>Students</h3>
              <p>Give rating & feedback to students</p>
            </div>
          </>
        )}

        {activeSection === "teachers" && (
          <div className="card">
            <h3>Rate Teachers</h3>
            <button onClick={() => setActiveSection("home")} className="back-btn">
              ← Back
            </button>

            {teachers.map((t) => (
              <div key={t._id} className="row rating-row">
                <p>{t.name}</p>
                {[1, 2, 3, 4, 5].map((n) => (
                  <span
                    key={n}
                    className={`star ${ratings[t._id] >= n ? "filled" : ""}`}
                    onClick={() => handleRatingChange(t._id, n)}
                  >
                    ★
                  </span>
                ))}
                <button
                  className="submit-btn"
                  onClick={() => handleSubmitRating("teacher", t._id)}
                >
                  Submit
                </button>
              </div>
            ))}
          </div>
        )}

        {activeSection === "students" && (
          <div className="card">
            <h3>Rate Students</h3>
            <button onClick={() => setActiveSection("home")} className="back-btn">
              ← Back
            </button>

            {students.map((s) => (
              <div key={s._id} className="row rating-row">
                <p>{s.name}</p>
                {[1, 2, 3, 4, 5].map((n) => (
                  <span
                    key={n}
                    className={`star ${ratings[s._id] >= n ? "filled" : ""}`}
                    onClick={() => handleRatingChange(s._id, n)}
                  >
                    ★
                  </span>
                ))}
                <span className="grade">
                  {ratings[s._id] ? gradeMapping[ratings[s._id]] : ""}
                </span>
                <input
                  type="text"
                  placeholder="Feedback"
                  value={feedbacks[s._id] || ""}
                  onChange={(e) => handleFeedbackChange(s._id, e.target.value)}
                />
                <button
                  className="submit-btn"
                  onClick={() => handleSubmitRating("student", s._id)}
                >
                  Submit
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {message && <div className="message">{message}</div>}
    </div>
  );
};

export default TeacherPortal;
