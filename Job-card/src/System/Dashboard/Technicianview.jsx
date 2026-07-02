import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { downloadJobCardPdf } from "./Jobcard/pdfUtils.js";

const Technicianview = ({ user, jobs = [], setJobs, onLogout }) => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedJob, setSelectedJob] = useState(null);
  const currentTechName = String(user?.name || "")
  .trim()
  .toLowerCase();
  const assignedJobs = jobs.filter(
  (job) =>
    String(job.assignedTo || "").trim().toLowerCase() === currentTechName
);

  const counts = useMemo(
    () => ({
      total: assignedJobs.length,
      pending: assignedJobs.filter((job) => job.status === "Pending").length,
      inProgress: assignedJobs.filter((job) => job.status === "In Progress").length,
      completed: assignedJobs.filter((job) => job.status === "Completed").length,
    }),
    [assignedJobs]
  );

  const filteredJobs = useMemo(
    () =>
      assignedJobs.filter((job) => statusFilter === "All" || job.status === statusFilter),
    [assignedJobs, statusFilter]
  );

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    navigate("/login");
  };

  const handleMarkComplete = (jobId) => {
    setJobs(jobs.map((job) => (job.id === jobId ? { ...job, status: "Completed" } : job)));
  };
 

const updateSelectedJob = (field, value) => {
  const updated = { ...selectedJob, [field]: value }
  setSelectedJob(updated)
  setJobs(jobs.map(j => j.id === updated.id ? updated : j))
}

const getDuration = (start, end) => {
  if (!start || !end) return "—"
  const [sh, sm] = start.split(":").map(Number)
  const [eh, em] = end.split(":").map(Number)
  const diff = (eh * 60 + em) - (sh * 60 + sm)
  if (diff <= 0) return "—"
  const h = Math.floor(diff / 60)
  const m = diff % 60
  return h > 0 ? `${h}h ${m}min` : `${m}min`
}

const isCompleted = selectedJob?.status === "Completed"

  return (
    <div className="main-content">
      <div className="page-header">
        <div>
          <h1>Technician</h1>
          <p>
            Welcome back,below is your job overview and assigned work.
          </p>
        </div>
        <button className="btn-cancel" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className="dashboard-summary">
        <div className="stat-card">
          <p className="stat-num">{counts.total}</p>
          <p className="stat-lbl">Assigned Jobs</p>
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

      <div className="jobcard-container">
      
<div className="jobcard-header">
    <h2>My Jobs</h2>
    <div className="filter-pills">
    {['All', 'Pending', 'In Progress', 'Completed'].map((filter) => (
        <button
    key={filter}
        className={`filter-pill ${statusFilter === filter ? 'active' : ''}`}
     onClick={() => setStatusFilter(filter)}>
        {filter}
      </button>
            ))}
   </div>
    </div>

    <div className="jobcard-list">
    {filteredJobs.length > 0 ? (
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
    {filteredJobs.map((job) => (
        <tr key={job.id}>
         <td>{job.title}</td>
       <td>
        <span className={`status ${String(job.status).toLowerCase().replace(" ", "-")}`}>
            {job.status}
       </span>
          </td>
        <td>{job.date}</td>
           <td>
     <div className="action-buttons">
        <button className="btn-view" onClick={() => navigate(`/technician/job/${job.id}`)}>
             View
     </button>
      <button
  className="btn-view"
  onClick={() => setSelectedJob(
    selectedJob?.id === job.id ? null : job
  )}>
  {selectedJob?.id === job.id ? "Close" : "View"}
</button>
        </div>
         </td>
          </tr>
           ))}
     </tbody>
      </table>
          ) : (
  <p style={{ padding: "20px", textAlign: "center", color: "var(--text-light)" }}>
      No job cards match this filter.
    </p>
          )}
</div>
      </div>
      {selectedJob && (
        <div className="job-detail-panel">

          <div className="panel-header">
            <div>
              <h2>Job Card #{selectedJob.id}</h2>
              <p>{selectedJob.title}</p>
            </div>
            <button className="btn-cancel" onClick={() => setSelectedJob(null)}>
              ✕ Close
            </button>
          </div>

          <p className="section-label">Job Information</p>
          <div className="details-card">
            <div className="details-grid">
              <div className="detail-item">
                <p className="detail-label">Job ID</p>
                <p className="detail-value">#{selectedJob.id}</p>
              </div>
              <div className="detail-item">
                <p className="detail-label">Status</p>
                <span className={`status ${selectedJob.status?.toLowerCase().replace(" ", "-")}`}>
                  {selectedJob.status}
                </span>
              </div>
              <div className="detail-item">
                <p className="detail-label">Job Title</p>
                <p className="detail-value">{selectedJob.title}</p>
              </div>
              <div className="detail-item">
                <p className="detail-label">Customer</p>
                <p className="detail-value">{selectedJob.customer}</p>
              </div>
              <div className="detail-item">
                <p className="detail-label">Assigned To</p>
                <p className="detail-value">{selectedJob.assignedTo}</p>
              </div>
              <div className="detail-item">
                <p className="detail-label">Date</p>
                <p className="detail-value">{selectedJob.date}</p>
              </div>
              <div className="detail-item full-width">
                <p className="detail-label">Description</p>
                <p className="detail-value">
                  {selectedJob.description || "No description provided"}
                </p>
              </div>
            </div>
          </div>

          <p className="section-label" style={{ marginTop: "20px" }}>Work Report</p>
          <div className="details-card">
            <div className="form-group">
              <label>Work Done *</label>
              <textarea
                placeholder="Describe the work performed on site..."
                value={selectedJob.workDone || ""}
                disabled={isCompleted}
                rows={4}
                onChange={(e) => updateSelectedJob("workDone", e.target.value)}
              />
            </div>

            <p className="section-label" style={{ marginTop: "16px" }}>Time Log</p>
            <div className="time-row">
              <div className="form-group">
                <label>Start Time</label>
                <input
                  type="time"
                  value={selectedJob.startTime || ""}
                  disabled={isCompleted}
                  onChange={(e) => updateSelectedJob("startTime", e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>End Time</label>
                <input
                  type="time"
                  value={selectedJob.endTime || ""}
                  disabled={isCompleted}
                  onChange={(e) => updateSelectedJob("endTime", e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Duration</label>
                <input
                  type="text"
                  readOnly
                  style={{ background: "#F8F9FA", color: "#6B7280" }}
                  value={getDuration(selectedJob.startTime, selectedJob.endTime)}
                />
              </div>
            </div>

            <p className="section-label" style={{ marginTop: "16px" }}>Sign Off</p>
            <div className="form-group">
              <label>Full Name (Signature)</label>
              <input
                placeholder="Type your full name to sign off..."
                value={selectedJob.technicianSignature || ""}
                disabled={isCompleted}
                onChange={(e) => updateSelectedJob("technicianSignature", e.target.value)}
              />
            </div>

            {isCompleted ? (
              <div className="completed-notice">
                This job card is completed 
              </div>
            ) : (
              <div className="form-actions">
                <button className="btn-cancel" onClick={() => setSelectedJob(null)}>
                  Cancel
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => {
                    setJobs(jobs.map(j =>
                      j.id === selectedJob.id ? { ...j, ...selectedJob } : j
                    ))
                    setSelectedJob(null)
                  }}>
                  Save Changes
                </button>
                <button
                  className="btn-submit"
                  onClick={() => {
                    const updated = { ...selectedJob, status: "Completed" }
                    setSelectedJob(updated)
                    setJobs(jobs.map(j => j.id === updated.id ? updated : j))
                  }}>
                  ✅ Mark as Complete
                </button>
              </div>
            )}
          </div>

          <p className="section-label" style={{ marginTop: "20px" }}>Download</p>
          <div className="action-row" onClick={() => downloadJobCardPdf(selectedJob)}>
            <div className="action-icon">📄</div>
            <div className="action-text">
              <p className="action-title">Download Job Card PDF</p>
              <p className="action-desc">Save a copy of this job card</p>
            </div>
            <span className="action-arrow">›</span>
          </div>

        </div>
      )}

    </div>
  );
};

export default Technicianview;