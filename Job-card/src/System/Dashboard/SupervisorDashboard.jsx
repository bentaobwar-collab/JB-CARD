import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

const SupervisorDashboard = ({ user, jobs = [] }) => {
  const navigate = useNavigate();
  const stats = useMemo(
    () => ({
      total: jobs.length,
      pending: jobs.filter((job) => job.status === "Pending").length,
      inProgress: jobs.filter((job) => job.status === "In Progress").length,
      completed: jobs.filter((job) => job.status === "Completed").length,
    }),
    [jobs]
  );

  const userName = user?.username
  ? user.username
      .split("_")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  : "User";
  const nameParts = userName.split(" ").filter(Boolean);
  const initials = nameParts.map((part) => part[0]).join("").toUpperCase();
  const roleLabel = user?.role
    ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
    : "Supervisor";

  const navigateToFilteredList = (filter) => {
    navigate("/supervisor/job-list", { state: { defaultFilter: filter } });
  };

  return (
    <div className="main-content">

      
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Welcome back, {userName}. Here's your job card overview.</p>
        </div>
        <span className={`role-pill ${user?.role}`}>{roleLabel}</span>
      </div>
      <p className="section-label">Overview</p>
      <div className="dashboard-container">
        <div className="card1">
          
          <h3>{stats.total}</h3>
          <p>Total Job Cards</p>
          <button onClick={() => navigateToFilteredList("All")}>View All</button>
        
        </div>
        <div className="card2">
          
          <h3>{stats.pending}</h3>
          <p>Pending</p>
          <button onClick={() => navigateToFilteredList("Pending")}>Review</button>
        
        </div>
        <div className="card3">
         
          <h3>{stats.inProgress}</h3>
          <p>In Progress</p>
          <button onClick={() => navigateToFilteredList("In Progress")}>Monitor</button>
         
        </div>
        <div className="card4">
          
          <h3>{stats.completed}</h3>
          <p>Completed</p>
          <button onClick={() => navigateToFilteredList("Completed")}>View</button>
          
        </div>
      </div>

    
      <p className="section-label" style={{ marginTop: "32px" }}>
        Quick Actions
      </p>
      <div className="actions-col">
        <div className="action-row"
          onClick={() => navigate("/supervisor/create-job")}>
          <div className="action-icon"></div>
          <div className="action-text">
            <p className="action-title">Create New Job Card</p>
            <p className="action-desc">
              Create a new job card for technicians to work on
            </p>
          </div>
          <span className="action-arrow">›</span>
        </div>

        <div className="action-row"
          onClick={() => navigateToFilteredList("All")}> 
          <div className="action-icon">📋</div>
          <div className="action-text">
            <p className="action-title">View All Job Cards</p>
            <p className="action-desc">
              Review all job cards and their statuses
            </p>
          </div>
          <span className="action-arrow">›</span>
        </div>
        <button
          className="cardB"
          onClick={(e) => {
            e.stopPropagation()
            navigate("/settings")
          }}>
           👤 Manage Settings
        </button>
      </div>

    </div>
  );
};

export default SupervisorDashboard;