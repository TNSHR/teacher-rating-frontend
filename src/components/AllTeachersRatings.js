import React, { useEffect, useState } from "react";
import API from "../api";
import "../styles/AllTeachersRatings.css";

const AllTeachersRatings = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="teachers-container">
      <h2>📊 All Teachers Ratings</h2>
      <div className="teachers-grid">
        {teachers.map((t, idx) => {
          const avg = typeof t?.average === "number" ? t.average : 0;
          const todayAvg =
            typeof t?.todayAverage === "number" ? t.todayAverage : 0;

          return (
            <div className="teacher-card" key={t?._id || idx}>
              <div className="teacher-header">
                <h3>{t?.name || "Unknown"}</h3>
                <p className="subject">{t?.subject || "Unknown subject"}</p>
              </div>

              <div className="rating-section">
                <p className="average-rating">
                  ⭐ Average Rating: <span>{avg.toFixed(1)}</span>
                </p>
                <div className="stars">{renderStars(avg)}</div>
              </div>

              <div className="today-rating">
                <p>
                  📅 <strong>Today's Rating:</strong>{" "}
                  <span>{todayAvg.toFixed(1)}</span>
                </p>
              </div>

              {t?.ratings?.length > 0 && (
                <div className="ratings-list">
                  <h4>Recent Ratings:</h4>
                  <ul>
                    {t.ratings.slice(-3).map((r, i) => (
                      <li key={i}>
                        👤 {r.studentName || r.student?.name || "Unknown Student"} — ⭐ {r.rating}
                      </li>
                    ))}
                  </ul>
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
