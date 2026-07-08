import { useState} from "react";
import {useNavigate ,useLocation} from "react-router-dom";
import { LayoutDashboard,ClipboardList,BriefcaseBusiness,FileText,FolderOpen,Settings as SettingsIcon,
          LogOut } from "lucide-react";

export default function Sidebar({ user, onLogout }) {
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    onLogout()      
    navigate("/")    
  }
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
    : "User"

  const supervisorLinks = [
    { label: "Dashboard", path: "/supervisor", icons:<LayoutDashboard size= {18}  />},
    { label: "All Job Cards", path: "/supervisor/job-list", icons:<ClipboardList size = {18} /> },
    { label: "Create Job Card", path: "/supervisor/create-job", icons: <BriefcaseBusiness size={18} />},
    { label: "Settings", path: "/settings", icons: <SettingsIcon size={18} /> },
    
  ]

  const technicianLinks = [
    { label: "Dashboard", path: "/technician", icons:<LayoutDashboard size = {18} /> },
    { label: "My Jobs", path: "/technician/jobs", icons: <FolderOpen size={18} /> },
    { label: "Settings", path: "/settings", icons: <SettingsIcon size={18}/> },
  ]

  const customerLinks = [
    { label: "Job Cards", path: "/customer", icons: <ClipboardList size={18} /> },
    { label: "Settings", path: "/settings", icons: <SettingsIcon size={18}/> },
  ]

  const links = user?.role === "supervisor"
    ? supervisorLinks
    : user?.role === "technician"
      ? technicianLinks
      : customerLinks

  return (
    <div className="sidebar">

      <div className="sidebar-brand">
        <img src="/balck photo.png" alt="logo" width="32px" />
        <span>Copy Cat</span>
      </div>

      <div className="sidebar-user">
        <div className="sidebar-avatar">{initials || "U"}</div>
        <div className="sidebar-user-info">
          <p className="sidebar-user-name">{userName} </p>
          <span className={`sidebar-role-pill ${user?.role}`}>
            {roleLabel}
          </span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {links.map((link) => (
          <div
            key={link.path}
            className={`sidebar-link ${location.pathname === link.path ? "active" : ""}`}
            onClick={() => navigate(link.path)}
          >
            <span className="sidebar-icon">{link.icons}</span>
            <span>{link.label}</span>
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-link logout" onClick={handleLogout}>
          <LogOut className="sidebar-icon" size={18}></LogOut>
          <span style={{ fontWeight: "bold" }}>Logout</span>
        </div>
      </div>

    </div>
  )
}


