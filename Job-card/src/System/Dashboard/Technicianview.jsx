import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Technicianview = ({ user }) => {
  const navigate = useNavigate();
  const [jobs] = useState([
    { id: 1, title: "Fix Server", status: "in-progress", date: "2026-05-25" },
    { id: 2, title: "Update Database", status: "pending", date: "2026-05-26" },
    { id: 3, title: "Network Maintenance", status: "completed", date: "2026-05-24" },
  ]);

  return (
    <div className="main-content">
      <div className="page-header">
        <h1>Technician Dashboard</h1>
        <p>Welcome back, {user?.firstName || user?.FirstName || user?.name || "Technician"}! Here are your assigned job cards.</p>
      </div>

      <div className="jobcard-container">
        <div className="jobcard-header">
          <h2>Your Job Cards</h2>
        </div>
        <div className="jobcard-list">
          {jobs.length > 0 ? (
            <table className="jobcard-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job.id}>
                    <td>{job.title}</td>
                    <td>
                      <span className={`status ${job.status}`}>
                        {job.status.replace("-", " ")}
                      </span>
                    </td>
                    <td>{job.date}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="view"
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
            <p style={{ padding: "20px", textAlign: "center", color: "var(--text-light)" }}>
              No job cards assigned yet
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Technicianview;