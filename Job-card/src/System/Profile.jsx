import { useNavigate } from "react-router-dom";

export default function Profile({ user }) {
  const navigate = useNavigate();
  const displayName = user?.firstName || user?.FirstName || user?.name || "User";
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <div className="main-content">
      <div className="page-header profile-page-header">
        <div className="profile-avatar">{initials || "U"}</div>
        <div>
          <h1>My Profile</h1>
          <p>Manage your account information for {displayName}</p>
        </div>
      </div>

      <div className="card profile-page-card" style={{ maxWidth: "500px" }}>
        <h3>Account Information</h3>
        <div className="form-group" style={{ marginTop: "20px" }}>
          <label>Name</label>
          <input type="text" value={displayName} disabled />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input type="email" value={user?.email || ""} disabled />
        </div>
        <div className="form-group">
          <label>Role</label>
          <input
            type="text"
            value={user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1) || ""}
            disabled
          />
        </div>
        <button onClick={() => navigate(-1)} style={{ marginTop: "20px" }}>
          Back
        </button>
      </div>
    </div>
  );
}