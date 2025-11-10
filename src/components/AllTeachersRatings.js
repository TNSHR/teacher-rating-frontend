import React, { useEffect, useState } from "react";
import API from "../api";
import "../styles/AllTeachersRatings.css";

const AllTeachersRatings = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null); // 🔹 Track clicked teacher

  useEffect(() => {
    API.get("/teachers-ratings")
      .then((res) => {
        if (Array.isArray(res.data)) setTeachers(res.data);
        else setTeachers([]);
      })
      .catch((err) => console.error("Error fetching ratings:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading teachers...</div>;
  if (!teachers || teachers.length === 0)
    return <div className="no-data">No teacher ratings available.</div>;

  // 🔹 Group teachers by name
  const grouped = teachers.reduce((acc, t) => {
    const name = t?.name || "Unknown";
    if (!acc[name]) acc[name] = [];
    acc[name].push(t);
    return acc;
  }, {});

  const renderStars = (avg) => {
    const fullStars = Math.floor(avg);
    const halfStar = avg % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    return (
      <>
        {"★".repeat(fullStars)}
        {halfStar && "☆"}
        {"☆".repeat(emptyStars)}
      </>
    );
  };

  // ✅ FIXED: Calculate overall average only from subjects that have ratings
  const calculateOverallAverage = (teacherRatings) => {
    const validAverages = teacherRatings
      .filter((t) => t.ratings && t.ratings.length > 0 && t.average > 0)
      .map((t) => t.average);
    return validAverages.length > 0
      ? validAverages.reduce((sum, val) => sum + val, 0) / validAverages.length
      : 0;
  };

  return (
    <div className="teachers-container">
      <h2>📊 All Teachers Ratings</h2>
      <div className="teachers-grid">
        {Object.entries(grouped).map(([teacherName, subjects]) => {
          const overallAvg = calculateOverallAverage(subjects);

          // ✅ today's average also only from valid rated subjects
          const ratedTodaySubjects = subjects.filter(
            (t) => t.todayAverage && t.todayAverage > 0
          );
          const overallTodayAvg =
            ratedTodaySubjects.length > 0
              ? ratedTodaySubjects.reduce((sum, t) => sum + t.todayAverage, 0) /
                ratedTodaySubjects.length
              : 0;

          return (
            <div
              key={teacherName}
              className="teacher-card"
              onClick={() =>
                setExpanded(expanded === teacherName ? null : teacherName)
              }
              style={{ cursor: "pointer" }}
            >
              <div className="teacher-header">
                <h3>{teacherName}</h3>
                <p className="subject">
                  Overall Average: {overallAvg.toFixed(1)}
                </p>
              </div>

              <div className="rating-section">
                <p className="average-rating">
                  ⭐ Average Rating: <span>{overallAvg.toFixed(1)}</span>
                </p>
                <div className="stars">{renderStars(overallAvg)}</div>
              </div>

              <div className="today-rating">
                <p>
                  📅 <strong>Today's Rating:</strong>{" "}
                  <span>{overallTodayAvg.toFixed(1)}</span>
                </p>
              </div>

              {/* 🔹 Expanded view - show subject/grade-wise + student details */}
              {expanded === teacherName && (
                <div className="ratings-list">
                  <h4>📘 Subject & Grade-wise Ratings:</h4>
                  {subjects.map((s, i) => (
                    <div key={i} className="subject-block">
                      <p>
                        <strong>
                          {s.subject || "Unknown"}{" "}
                          (Grade{" "}
                          {s.grade ||
                            s.teacherGrade ||
                            s.classGrade ||
                            s.gradeLevel ||
                            "N/A"}
                          )
                        </strong>{" "}
                        — ⭐ {s.average?.toFixed(1) || 0}
                      </p>

                      {/* 🔹 Show all student ratings for this subject */}
                      {Array.isArray(s.ratings) && s.ratings.length > 0 && (
                        <ul>
                          {s.ratings.map((r, j) => (
                            <li key={j}>
                              👤 {r.studentName} (Grade {r.grade || "?"}) — ⭐{" "}
                              {r.rating} — 📅 {r.date}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AllTeachersRatings;
