import { useNavigate } from "react-router-dom";

const SupervisorDashboard = ({ user }) => {
  const navigate = useNavigate();
  const [stats] = useState({
    total: 24,
    pending: 8,
    inProgress: 10,
    completed: 6,
  });

  const userName = user?.firstName || user?.FirstName || user?.name || "User";
  const nameParts = userName.split(" ").filter(Boolean);
  const initials = nameParts.map((part) => part[0]).join("").toUpperCase();
  const roleLabel = user?.role
    ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
    : "Supervisor";

  return (
    <div className="main-content">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Welcome back, {userName}.Here's your job card overview.</p>
      </div>

      <div className="dashboard-container">
        <div className="card">
          <h3>{stats.total}</h3>
          <p>Total Job Cards</p>
          <button onClick={() => navigate("/supervisor/job-list")}>View All</button>
        </div>
        <div className="card">
          <h3>{stats.pending}</h3>
          <p>Pending</p>
          <button onClick={() => navigate("/supervisor/job-list")}>Review</button>
        </div>
        <div className="card">
          <h3>{stats.inProgress}</h3>
          <p>In Progress</p>
          <button onClick={() => navigate("/supervisor/job-list")}>Monitor</button>
        </div>
        <div className="card">
          <h3>{stats.completed}</h3>
          <p>Completed</p>
          <button onClick={() => navigate("/supervisor/job-list")}>View</button>
        </div>
      </div>

      <div style={{ marginTop: "40px" }}>
        <h2 style={{ color: "var(--primary)", marginBottom: "20px" }}>Quick Actions</h2>
        <div className="dashboard-cards">
          <div className="card">
            <h3>Create New Job Card</h3>
            <p>Create a new job card for technicians to work on</p>
            <button onClick={() => navigate("/supervisor/create-job")}>Create</button>
          </div>
          <div className="card">
            <h3>View All Job Cards</h3>
            <p>Review all job cards and their statuses</p>
            <button onClick={() => navigate("/supervisor/job-list")}>View</button>
          </div>
        </div>
      </div>

      <div className="dashboard-footer">
        <div className="profile-card card">
          <div className="profile-avatar">{initials || "U"}</div>
          <div className="profile-info">
            <p className="profile-role">{roleLabel}</p>
            <h3>{userName}</h3>
            <p>{user?.email || "No email available"}</p>
          </div>
          <button onClick={() => navigate("/profile")}>Manage Profile</button>
        </div>
      </div>
    </div>
  );
};

export default SupervisorDashboard;
