import {useNavigate} from "react-router-dom"
export default function Navbar({user, onLogout}){
  const navigate = useNavigate()
  const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}
  const handleLogoClick = () => {
    if (!user) {
      navigate("/")
    } else if (user.role === "supervisor") {
      navigate("/supervisor")
      } else if (user.role === "customer") {
      navigate("/customer")
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
        <img src="/balck photo.png" alt="job-logo" width="40" />
        <span>Copy Cat</span>
      </div>
      <div className="navbar-right">
        <span>{getGreeting()}, 👋 </span>
      </div>
    </nav>

  )

}