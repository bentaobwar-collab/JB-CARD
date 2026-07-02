import {useNavigate} from "react-router-dom"
export default function Navbar({user, onLogout}){
  const navigate = useNavigate()

  const getInitials = (name) => {
    if(!name) return "?"
    return name
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  }

  const displayName = user?.firstName || user?.FirstName || user?.name || "User";

  const handleLogoClick = () => {
    if (!user) {
      navigate("/")
    } else if (user.role === "supervisor") {
      navigate("/supervisor")
    } else {
      navigate("/technician")
    }
  }

  const handleLogout = () => {
    onLogout()
    navigate("/")
  }

  return(
    <nav className="navbar">
      <div className="navbar-left" onClick={handleLogoClick}>
        <img src="/Black-logo.png" alt="job-logo" width="40" />
        <span>Copy Cat</span>
      </div>
      <div className="navbar-right">
        <span>{getInitials(displayName)} Hi, {displayName}</span>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </nav>

  )

}