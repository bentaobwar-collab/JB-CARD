import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api";

export default function TechnicianJobs({ user }) {
const STATUS_LABELS = {
  in_progress: "In Progress",
  completed:   "Completed",
  pending:     "Pending",
  cancelled:   "Cancelled",
  assigned:    "Assigned",
};

const formatStatus = (raw) => {
  if (!raw) return "Pending";
  const key = String(raw).trim().toLowerCase();
  return STATUS_LABELS[key] || String(raw).replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
};

const statusClass = (raw) => {
  if (!raw) return "pending";
  return String(raw).trim().toLowerCase().replace(/\s+/g, "-");
};
  
  const navigate = useNavigate();
  const [assignedJobs, setAssignedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMyJobs = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await fetch(`${API}/jobcards/my-jobs`, {
          headers: { Authorization: `Bearer ${token}` },
        });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message);
    }
    const data = await res.json();
    console.log("jobs from DB:", data.map(j => ({ title: j.title, status: j.status }))); // ← here, inside the async
    setAssignedJobs(data);
  } catch (err) {
    console.error(err);
    setError("Could not load your jobs. Please try again.");
  } finally {
    setLoading(false);
  }
};
    fetchMyJobs();
  }, []);

  return (
    <div className="main-content">
      <div className="page-header">
        <div>
          <h1>My Jobs</h1>
          <p>All jobs assigned to you.</p>
        </div>
      </div>

      <div className="jobcard-container">
        <div className="jobcard-header">
          <h2>Assigned Jobs</h2>
        </div>
        <div className="jobcard-list">
          {loading ? (
            <p style={{ padding: "20px", textAlign: "center" }}>Loading...</p>
          ) : error ? (
            <p style={{ padding: "20px", textAlign: "center", color: "red" }}>{error}</p>
          ) : assignedJobs.length > 0 ? (
            <table className="jobcard-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {assignedJobs.map((job) => (
                  <tr key={job.id}>
                    <td>{job.title}</td>
                    <td>
                      <span className={`status ${statusClass(job.status)}`}>
  {formatStatus(job.status)}
</span>
                      
                    </td>
                    <td>{job.scheduleddate?.split("T")[0]}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-view"
                          onClick={() => navigate(`/technician/job/${job.id}`)}
                        >
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p
              style={{
                padding: "20px",
                textAlign: "center",
                color: "var(--text-light)",
              }}
            >
              No job cards assigned yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
