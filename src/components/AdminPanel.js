
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import AllTeachersRatings from "./AllTeachersRatings";
import "../styles/AdminPanel.css";


const AdminPanel = ({ setUser }) => {
  const navigate = useNavigate();
  const [allUsers, setAllUsers] = React.useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false); // added for buttons
  const [activeSection, setActiveSection] = useState("home");
  const [newUser, setNewUser] = useState({ username: "", password: "" });
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState(""); // new email field
  const [teacherUsers, setTeacherUsers] = useState([]);

  // Fetch initial data
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
    }
  };
  
const fetchAllUsers = async () => {
  try {
    const token = localStorage.getItem("token"); // get JWT from localStorage
    const res = await API.get("/all-users", {
      headers: {
        Authorization: `Bearer ${token}`, // attach token
      },
    });
    setAllUsers(res.data);
    setActiveSection("allUsers"); // show users section
  } catch (err) {
    console.error("Error fetching users:", err);
  }
};



  const fetchTeacherUsers = async () => {
    try {
      const res = await API.get("/all-users");
 // Create this API route in backend
      setTeacherUsers(res.data);
    } catch (err) {
      console.error("fetchTeacherUsers error:", err);
    }
  };

  // Call on component mount
  useEffect(() => {
  fetchTeacherUsers(); // fetch once when page loads
  if (activeSection === "createUser") {
    fetchTeacherUsers(); // and again when user opens createUser section
  }
}, [activeSection]);



  useEffect(() => {
    fetchData();
  }, []);

  // Add new row safely (avoid duplicates)
  const addRow = (type) => {
    const newRow =
      type === "teachers"
         ? { _id: `t-${Date.now()}`, name: "", subject: "", grade: "" }
        : { _id: `s-${Date.now()}`, name: "", grade: "" };

    if (type === "teachers") setTeachers([...teachers, newRow]);
    else setStudents([...students, newRow]);
  };

 const removeRow = async (type, id) => {
  try {
    // call your backend via the API axios instance (base already configured)
    await API.delete(`/${type}/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    // update local state after successful deletion
    if (type === "teachers") {
      setTeachers((prev) => prev.filter((t) => t._id !== id));
    } else {
      setStudents((prev) => prev.filter((s) => s._id !== id));
    }
  } catch (error) {
    console.error("Error deleting:", error);
    setMessage("❌ Failed to delete. Try again.");
  }
};



  // Handle input change
  const handleChange = (type, id, field, value) => {
    if (type === "teachers") {
      setTeachers(
        teachers.map((t) => (t._id === id ? { ...t, [field]: value } : t))
      );
    } else {
      setStudents(
        students.map((s) => (s._id === id ? { ...s, [field]: value } : s))
      );
    }
  };

  // Save data
  const handleSave = async (type) => {
    try {
      if (type === "teachers") {
        for (let t of teachers) {
          if (t._id.startsWith("t-")) {
            const res = await API.post("/teachers", {
              name: t.name,
              subject: t.subject,
              grade: t.grade,
            });
            t._id = res.data._id;
          } else {
            await API.put(`/teachers/${t._id}`, {
              name: t.name,
              subject: t.subject,
              grade: t.grade,
            });
          }
        }
      } else {
        for (let s of students) {
          if (s._id.startsWith("s-")) {
            const res = await API.post("/students", {
              name: s.name,
              grade: s.grade,
            });
            s._id = res.data._id;
          } else {
            await API.put(`/students/${s._id}`, {
              name: s.name,
              grade: s.grade,
            });
          }
        }
      }
      setMessage(`${type} saved successfully!`);
      fetchData();
    } catch (err) {
      console.error(err);
      setMessage(`Error saving ${type}`);
    }
  };

  // 🔹 New: Clear all data
  const handleClearAll = async () => {
  if (!window.confirm("Are you sure you want to clear all data?")) return;
  setLoading(true);
  try {
    // Fetch backup as Excel first
    const res = await API.delete("/clearAll", { responseType: "blob" });
    const blob = new Blob([res.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "backup.xlsx");
    document.body.appendChild(link);
    link.click();
    link.remove();

    // Clear local state after download
    setTeachers([]);
    setStudents([]);
    setMessage("✅ All data cleared successfully! Backup downloaded.");
  } catch (err) {
    console.error(err);
    setMessage("❌ Failed to clear data.");
  } finally {
    setLoading(false);
  }
};

  // Download backup
const handleDownloadBackup = async () => {
  setLoading(true);
  try {
    const res = await API.get("/backup", { responseType: "blob" });
    const blob = new Blob([res.data], {
      type:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "backup.xlsx");
    document.body.appendChild(link);
    link.click();
    link.remove();
    setMessage("💾 Excel backup downloaded successfully!");
  } catch (err) {
    console.error(err);
    setMessage("❌ Failed to download backup.");
  } finally {
    setLoading(false);
  }
};


  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("token");
    navigate("/");
  };

  const handleCreateUser = async () => {
  if (!username || !password || !email) return setMessage("All fields required");
  try {
    const res = await API.post("/create-teacher-user", { username, password, email });
    setMessage(res.data.message);
    setTeacherUsers((prev) => [...prev, res.data.user]); // instantly show new user
    setUsername("");
    setPassword("");
    setEmail("");
  } catch (err) {
    console.error("handleCreateUser error:", err);
    setMessage(err.response?.data?.message || "Failed to create teacher user");
  }
};


  const handleDeleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await API.delete(`/delete-teacher-user/${id}`);
      setMessage("User deleted successfully!");
      fetchTeacherUsers(); // Refresh list
    } catch (err) {
      console.error("handleDeleteUser error:", err);
      setMessage(err.response?.data?.message || "Failed to delete user");
    }
  };

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h2>Admin Panel</h2>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {/* 🔹 Added two new buttons here */}
      <div className="admin-actions" style={{ marginBottom: "20px" }}>
        <button onClick={handleClearAll} disabled={loading} className="clear-btn">
          🗑️ Clear All Data
        </button>
        <button onClick={handleDownloadBackup} disabled={loading} className="backup-btn">
          💾 Download Backup
        </button>
        <button onClick={fetchAllUsers}>Show All Users</button>
        
        
      </div>

      <div className="cards-container">
        {activeSection === "home" && (
          <>
            <div className="card clickable" onClick={() => setActiveSection("teachers")}>
              <h3>Teachers</h3>
              <p>Manage teacher list</p>
            </div>

            <div className="card clickable" onClick={() => setActiveSection("students")}>
              <h3>Students</h3>
              <p>Manage student list</p>
            </div>

            <div className="card clickable" onClick={() => setActiveSection("ratings")}>
              <h3>All Ratings</h3>
              <p>View teacher ratings</p>
            </div>

            <div className="card clickable" onClick={() => setActiveSection("summary")}>
              <h3>User Summary</h3>
              <p>Total Teachers: {teachers.length}</p>
              <p>Total Students: {students.length}</p>
            </div>

            <div className="card clickable" onClick={() => setActiveSection("createUser")}>
              <h3>Create Teacher Login</h3>
              <p>Generate username & password for teachers</p>
            </div>
          </>
        )}

        {activeSection === "teachers" && (
          <div className="card">
            <h3>Teachers</h3>
            <button onClick={() => setActiveSection("home")} className="back-btn">← Back</button>
            <div className="button-group">
              <button className="add-btn" onClick={() => addRow("teachers")}>
                + Add Teacher
              </button>
              <button className="save-btn" onClick={() => handleSave("teachers")}>
                💾 Save
              </button>
            </div>

            {teachers.map((t) => (
              <div key={t._id} className="row">
                <label>
                  Name:
                  <input
                    value={t.name}
                    onChange={(e) => handleChange("teachers", t._id, "name", e.target.value)}
                    placeholder="Enter teacher name"
                  />
                </label>
                <label>
                  Subject:
                  <input
                    value={t.subject}
                    onChange={(e) => handleChange("teachers", t._id, "subject", e.target.value)}
                    placeholder="Enter subject"
                  />
                </label>
                 <label>
    Grade:
   <input
       value={t.grade}
      onChange={(e) => handleChange("teachers", t._id, "grade", e.target.value)}
      placeholder="Enter grade taught"
    />
 </label>
                <button className="remove-btn" onClick={() => removeRow("teachers", t._id)}>
                  ✖
                </button>
              </div>
            ))}
          </div>
        )}

        {activeSection === "createUser" && (
          <div className="card">
            <h3>Create Teacher Login</h3>
            <button onClick={() => setActiveSection("home")} className="back-btn">← Back</button>

            <div className="row">
              <label>
                Username:
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                />
              </label>
              <label>
                Password:
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                />
              </label>
              <label>
                Email:
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email"
                />
              </label>
            </div>

            <button className="save-btn" onClick={handleCreateUser}>
              💾 Create User
            </button>

            {/* 🔹 Corrected: Teacher Users section always visible */}
            <div className="teacher-users-list-container">
              <h4>Created Teacher Users</h4>
              {teacherUsers.length === 0 ? (
                <p>No teacher users created yet.</p>
              ) : (
                teacherUsers.map((user) => (
                  <div key={user._id} className="teacher-user-row">
                    <span className="username-label">{user.username}</span>
                    <span className="email-label">{user.email}</span>
                    <button className="remove-btn" onClick={() => handleDeleteUser(user._id)}>
                      ✖ Delete
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeSection === "students" && (
          <div className="card">
            <h3>Students</h3>
            <button onClick={() => setActiveSection("home")} className="back-btn">← Back</button>
            <div className="button-group">
              <button className="add-btn" onClick={() => addRow("students")}>
                + Add Student
              </button>
              <button className="save-btn" onClick={() => handleSave("students")}>
                💾 Save
              </button>
            </div>

            {students.map((s) => (
              <div key={s._id} className="row">
                <label>
                  Name:
                  <input
                    value={s.name}
                    onChange={(e) => handleChange("students", s._id, "name", e.target.value)}
                    placeholder="Enter student name"
                  />
                </label>
                <label>
                  Grade:
                  <input
                    value={s.grade}
                    onChange={(e) => handleChange("students", s._id, "grade", e.target.value)}
                    placeholder="Enter grade"
                  />
                </label>
                <label>
  Unique Code:
  <input
    value={s.uniqueCode || ""}
    onChange={(e) =>
      handleChange("students", s._id, "uniqueCode", e.target.value)
    }
    placeholder="Enter or auto-generate code"
  />
</label>

                <button className="remove-btn" onClick={() => removeRow("students", s._id)}>
                  ✖
                </button>
              </div>
            ))}
          </div>
        )}

        {activeSection === "ratings" && (
          <div className="card">
            <h3>Teacher Ratings</h3>
            <button onClick={() => setActiveSection("home")} className="back-btn">← Back</button>
            <AllTeachersRatings />
          </div>
        )}

        {activeSection === "summary" && (
          <div className="card summary-card">
            <h3>User Summary</h3>
            <button onClick={() => setActiveSection("home")} className="back-btn">← Back</button>
            <p>Total Teachers: {teachers.length}</p>
            <p>Total Students: {students.length}</p>
          </div>
        )}
      </div>

      {message && <div className="message">{message}</div>}
    </div>
  );
};

export default AdminPanel;
