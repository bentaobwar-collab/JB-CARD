import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
 
export default function TechnicianSummary({ user, jobs = [] }) {
  const navigate = useNavigate();
  const assignedJobs = useMemo(() => {
    return jobs.filter((job) => {
      const byId       = user?.id       && String(job.technician_id) === String(user.id);
      const byUsername = user?.username  && String(job.assignedto   || "").toLowerCase()
                                         === String(user.username    || "").toLowerCase();
      return byId || byUsername;
    });
  }, [jobs, user]);
 
  const counts = useMemo(() => ({
    total:      assignedJobs.length,
    pending:    assignedJobs.filter((j) => (j.status || "").toLowerCase() === "pending").length,
    inProgress: assignedJobs.filter((j) => (j.status || "").toLowerCase() === "in_progress").length,
    completed:  assignedJobs.filter((j) => (j.status || "").toLowerCase() === "completed").length,
  }), [assignedJobs]);
 
  const completionRate = counts.total > 0
    ? Math.round((counts.completed / counts.total) * 100)
    : 0;
 
  return (
    <div className="main-content">
      <div className="page-header">
        <div>
          <h1>Technician Dashboard</h1>
          <p>Welcome back, <strong>
            {(user?.username || "")
              .split("_")
              .map(w => w.charAt(0).toUpperCase() + w.slice(1))
              .join(" ") || "Technician"}
          </strong>. Here's your work summary.</p>
        </div>
      </div>
 
      <div className="section-label">Your Performance</div>
      <div className="stats-row">
        <div className="stat-card">
          <p className="stat-num">{counts.total}</p>
          <p className="stat-lbl">Total Assigned</p>
        </div>
        <div className="stat-card pending">
          <p className="stat-num">{counts.pending}</p>
          <p className="stat-lbl">Pending</p>
        </div>
        <div className="stat-card inprogress">
          <p className="stat-num">{counts.inProgress}</p>
          <p className="stat-lbl">In Progress</p>
        </div>
        <div className="stat-card completed">
          <p className="stat-num">{counts.completed}</p>
          <p className="stat-lbl">Completed</p>
        </div>
      </div>
 
      <div className="section-label" style={{ marginTop: "32px" }}>Completion Progress</div>
      <div className="progress-container">
        <div className="progress-card">
          <div className="progress-header">
            <h3>Job Completion Rate</h3>
            <span className="progress-percentage">{completionRate}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${completionRate}%` }}></div>
          </div>
          <p className="progress-text">
            {counts.completed} of {counts.total} job{counts.total !== 1 ? "s" : ""} completed
          </p>
        </div>
      </div>
 
      <div className="section-label" style={{ marginTop: "32px" }}>Quick Actions</div>
      <div className="actions-col">
        <div className="action-row" onClick={() => navigate("/technician/jobs")}>
          <div className="action-icon">📋</div>
          <div className="action-text">
            <p className="action-title">View All My Jobs</p>
            <p className="action-desc">See detailed list of all assigned jobs</p>
          </div>
          <span className="action-arrow">›</span>
        </div>
 
        {counts.pending > 0 && (
          <div className="action-row" onClick={() => navigate("/technician/jobs")} style={{ opacity: 0.8 }}>
            <div className="action-icon">⏳</div>
            <div className="action-text">
              <p className="action-title">Pending Jobs ({counts.pending})</p>
              <p className="action-desc">Review and start pending work</p>
            </div>
            <span className="action-arrow">›</span>
          </div>
        )}
 
        {counts.inProgress > 0 && (
          <div className="action-row" onClick={() => navigate("/technician/jobs")} style={{ opacity: 0.8 }}>
            <div className="action-icon">🔄</div>
            <div className="action-text">
              <p className="action-title">In Progress ({counts.inProgress})</p>
              <p className="action-desc">Continue working on active tasks</p>
            </div>
            <span className="action-arrow">›</span>
          </div>
        )}
 
        {counts.total === 0 && (
          <div className="action-row" style={{ opacity: 0.5, cursor: "default" }}>
            <div className="action-icon">📭</div>
            <div className="action-text">
              <p className="action-title">No jobs assigned yet</p>
              <p className="action-desc">Your supervisor will assign jobs to you</p>
            </div>
          </div>
        )}
 
        <button
          className="cardB"
          onClick={(e) => {
            e.stopPropagation();
            navigate("/settings");
          }}
        >
          👤 Manage Settings
        </button>
      </div>
    </div>
  );
}
 