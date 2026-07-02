import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
const API = "https://localhost:5000/api";
 
export default function Jobcardlist({ user, jobs = [], setJobs }) {
  const navigate = useNavigate()
  const location = useLocation()
  const defaultFilter = location.state?.defaultFilter || "All"
  const [activeFilter, setActiveFilter] = useState(defaultFilter)
  const [searchQuery, setSearchQuery] = useState("")
  const [openDropdown, setOpenDropdown] = useState(null)
  const [editingDate, setEditingDate] = useState(null)
  const [editingJobId, setEditingJobId] = useState(null)
  const [editForm, setEditForm] = useState({})
 
 useEffect(() => {
  fetch(`${API}/jobcards`)
    .then(res => res.json())
    .then(data => {
      const normalized = data.map(job => ({
        id: job.id,
        job_number: job.job_number,
        title: job.title,
        customer_name: job.customer_name,
        customer_id: job.customer_id,
        technician_id: job.technician_id,
        assignedto: job.assignedto,
        location: job.location,
        description: job.description,
        scheduleddate: job.scheduleddate,
        status:
  job.status === "pending"
    ? "Pending"
    : job.status === "in_progress"
    ? "In Progress"
    : job.status === "completed"
    ? "Completed"
    : "Pending"
      }))

      setJobs(normalized)
    })
    .catch(err => console.log(err))
}, [])
 
  const filters = ["All", "Pending", "In Progress", "Completed"]
 
  const toggleDropdown = (jobId) => {
    setOpenDropdown(openDropdown === jobId ? null : jobId)
    setEditingDate(null)
  }
 
  const startEditing = (job) => {
    setEditingJobId(job.id)
    setEditForm({ ...job })
    setOpenDropdown(null)
    setEditingDate(null)
  }
 
  const cancelEditing = () => {
    setEditingJobId(null)
    setEditForm({})
  }
 
  const handleEditFormChange = (jobId, field, value) => {
    setEditForm((current) => ({ ...current, [field]: value }))
    if (field === "status") setOpenDropdown(null)
  }
 
  const handleSaveEdit = (jobId) => {
    setJobs(jobs.map((job) => job.id === jobId ? { ...job, ...editForm } : job))
    setEditingJobId(null)
    setEditForm({})
  }
 
  const handleDelete = (jobId) => {
    setJobs(jobs.filter((job) => job.id !== jobId))
    if (editingJobId === jobId) cancelEditing()
    if (openDropdown === jobId) setOpenDropdown(null)
  }
 
 const handleStatusChange = async (jobId, newStatus) => { 
    try {
    const dbStatus =
      newStatus === "Pending"
        ? "pending"
        : newStatus === "In Progress"
        ? "in_progress"
        : "completed";
  const res = await fetch(
      `${API}/jobcards/${jobId}/status`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          status: newStatus
        })
      }
    )

    if (!res.ok)
      throw new Error("Failed to update status")

    setJobs(
      jobs.map(job =>
        job.id === jobId
          ? { ...job, status: newStatus }
          : job
      )
    )

  } catch (err) {

    console.log(err)

  }

  setOpenDropdown(null)
}
  const toggleDateEdit = (jobId) => {
    setEditingDate(editingDate === jobId ? null : jobId)
    setOpenDropdown(null)
  }
 
  const handleDateChange = (jobId, newDate) => {
    setJobs(jobs.map((job) => job.id === jobId ? { ...job, date: newDate } : job))
    setEditingDate(null)
  }
 
  const filteredJobs = jobs.filter((job) => {
    const matchesFilter = activeFilter === "All" || job.status === activeFilter
    const matchesSearch =
  (job.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
  (job.customer_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
  (job.assignedto || job.assignedTo || "").toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })
 
  const counts = {
    All: jobs.length,
    Pending: jobs.filter(j => j.status === "Pending").length,
    "In Progress": jobs.filter(j => j.status === "In Progress").length,
    Completed: jobs.filter(j => j.status === "Completed").length,
  }
 
  return (
    <div className="main-content">
 
      <div className="page-header">
        <div>
          <h1>All Job Cards</h1>
          <p>Manage and track all technician job cards</p>
        </div>
        {user?.role === "supervisor" && (
          <button
            className="btn-submit"
            onClick={() => navigate("/supervisor/create-job")}>
            Create Job Card
          </button>
        )}
      </div>
 
      <div className="stats-row" style={{ marginBottom: "24px" }}>
        <div className="stat-card">
          <p className="stat-num">{counts.All}</p>
          <p className="stat-lbl">Total Jobs</p>
        </div>
        <div className="stat-card">
          <p className="stat-num pending">{counts.Pending}</p>
          <p className="stat-lbl">Pending</p>
        </div>
        <div className="stat-card">
          <p className="stat-num inprogress">{counts["In Progress"]}</p>
          <p className="stat-lbl">In Progress</p>
        </div>
        <div className="stat-card">
          <p className="stat-num completed">{counts.Completed}</p>
          <p className="stat-lbl">Completed</p>
        </div>
      </div>
 
      <div className="filter-bar">
        <input
          className="search-input"
          placeholder="Search by title, customer or technician..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
 
      <div className="filter-pills">
        {filters.map((filter) => (
          <button
            key={filter}
            className={`filter-pill ${activeFilter === filter ? "active" : ""}`}
            onClick={() => setActiveFilter(filter)}>
            {filter}
            <span className="filter-count">{counts[filter]}</span>
          </button>
        ))}
      </div>
 
      <div className="jobcard-container">
        {filteredJobs.length > 0 ? (
          <table className="jobcard-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Job Title</th>
                <th>Customer</th>
                <th>Assigned To</th>
                <th>Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredJobs.map((job) => (
                <tr key={job.id || job.job_number}>
                  <td style={{ color: "#6B7280" }}>{job.id}</td>
                  <td>
                    {editingJobId === job.id ? (
                      <input
                        className="row-input"
                        value={editForm.title || ""}
                        onChange={(e) => handleEditFormChange(job.id, "title", e.target.value)}
                      />
                    ) : (
                      <strong>{job.title}</strong>
                    )}
                  </td>
                  <td>
                    {editingJobId === job.id ? (
                      <input
                        className="row-input"
                        value={editForm.customer_name || ""}
                        onChange={(e) => handleEditFormChange(job.id, "customer_name", e.target.value)}
                      />
                    ) : (
                        (job.customer_name || "")
                            .split("_")
                                .map(word =>
                          word.charAt(0).toUpperCase() + word.slice(1))
                              .join(" ")
                    )}
                       
                  </td>
                  <td>
                    {editingJobId === job.id ? (
                      <input
                        className="row-input"
                        value={editForm.assignedto || ""}
                        onChange={(e) => handleEditFormChange(job.id, "assignedto", e.target.value)}
                      />
                    ) : (
                      (job.assignedto || "")
                          .split("_")
                                .map(word =>
                          word.charAt(0).toUpperCase() + word.slice(1))
                              .join(" ")
                    )}
                  </td>
                  <td>
                    {editingJobId === job.id ? (
                      <input
                        type="date"
                        className="row-input"
                        value={editForm.scheduleddate || job.scheduleddate || ""}
                        onChange={(e) => handleEditFormChange(job.id, "scheduleddate", e.target.value)}
                      />
                    ) : (
                      <div className="editable-cell">
                        {editingDate === job.id ? (
                          <div className="date-edit-wrapper">
                            <input
                              type="date"
                              className="date-input"
                              value={job.scheduleddate}
                              onChange={(e) => handleDateChange(job.id, e.target.value)}
                            />
                            <button
                              className="date-confirm-btn"
                              onClick={() => handleDateChange(job.id, job.scheduleddate)}>
                              ✓
                            </button>
                          </div>
                        ) : (
                          <span
                            className="date-display"
                            onClick={() => toggleDateEdit(job.id)}>
                            {job.scheduleddate?.split("T")[0]} ✎
                          </span>
                        )}
                      </div>
                    )}
                  </td>
                  <td>
                    {editingJobId === job.id ? (
                      <select
                        className="row-input"
                        value={editForm.status || job.status}
                        onChange={(e) => handleEditFormChange(job.id, "status", e.target.value)}>
                        {["Pending", "In Progress", "Completed"].map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    ) : (
                      <div className="status-dropdown-wrapper">
                        <span
                          className={`status ${(job.status || "").toLowerCase().replace(" ", "-")} status-clickable`}
                          onClick={() => toggleDropdown(job.id)}>
                          {job.status} ▾
                        </span>
                        {openDropdown === job.id && (
                          <div className="status-dropdown">
                            <p className="dropdown-title">Change Status</p>
                            {["Pending", "In Progress", "Completed"].map((s) => (
                              <div
                                key={s}
                                className={`status-option ${job.status === s ? "current" : ""}`}
                                onClick={() => handleStatusChange(job.id, s)}>
                                <span className={`status-dot ${s.toLowerCase().replace(" ", "-")}`} />
                                {s}
                                {job.status === s && (
                                  <span className="current-tick">✓</span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                  <td>
                    {editingJobId === job.id ? (
                      <>
                        <button
                          className="btn-submit"
                          onClick={() => handleSaveEdit(job.id)}>
                          Save
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => handleDelete(job.id)}>
                          Delete
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="btn-view"
                          onClick={() => startEditing(job)}>
                          ✏️
                        </button>
                        <button
                          className="btn-view"
                          onClick={() => navigate(`/supervisor/job/${job.id}`)}>
                          View
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <p>No job cards found</p>
            <p>Try adjusting your search or filter</p>
          </div>
        )}
      </div>
 
    </div>
  )
}
 