import { BrowserRouter,Route,Routes,Navigate } from "react-router-dom";
import Footer from "./Components/Footer.jsx";
import Navbar from "./Components/Narbar.jsx";
import Login from "./System/Login.jsx";
import Profile from "./System/Profile.jsx";
import SupervisorDashboard from "./System/Dashboard/SupervisorDashboard.jsx";
import Technicianview from "./System/Dashboard/Technicianview.jsx";
import Creationjobcard from "./System/Dashboard/Jobcard/Creationjobcard.jsx";
import Jobcarddetails from "./System/Dashboard/Jobcard/Jobcarddetails.jsx";
import Jobcardlist from "./System/Dashboard/Jobcard/Jobcardlist.jsx";
import { useState, useEffect } from "react";

export default function App() {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    const stored = localStorage.getItem("jobCardUser")
    if (stored) setUser(JSON.parse(stored))
  }, [])

  const handleLogin = (userData) => {
    localStorage.setItem("jobCardUser", JSON.stringify(userData))
    setUser(userData)
  }

  const handleLogout = () => {
    localStorage.removeItem("jobCardUser")
    setUser(null)
  }

  return (
    <BrowserRouter>
      <Navbar user={user} onLogout={handleLogout} />
      <Routes>

        
        <Route path="/" element={
          !user ? <Login onLogin={handleLogin} /> :
          user.role === "supervisor" ?
          <Navigate to="/supervisor" replace /> :
          <Navigate to="/technician" replace />
        } />

        {/* Shared route */}
        <Route path="/profile" element={<Profile user={user} />} />

        {/* Supervisor routes */}
        <Route path="/supervisor" element={<SupervisorDashboard user={user} />} />
        <Route path="/supervisor/job-list" element={<Jobcardlist user={user} />} />
        <Route path="/supervisor/create-job" element={<Creationjobcard user={user} />} />
        <Route path="/supervisor/job/:id" element={<Jobcarddetails user={user} />} />

        {/* Technician routes */}
        <Route path="/technician" element={<Technicianview user={user} />} />
        <Route path="/technician/job/:id" element={<Jobcarddetails user={user} />} />

        {/* Catch all — redirect unknown routes to login */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
      <Footer />
    </BrowserRouter>
  )
}





