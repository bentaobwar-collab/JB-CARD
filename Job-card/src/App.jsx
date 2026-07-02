import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Footer from "./Components/Footer.jsx";
import Narbar from "./Components/Narbar.jsx";
import Sidebar from "./Components/Sidebar.jsx";
import Login from "./System/Login.jsx";
import Settings from "./System/Settings.jsx";
import SupervisorDashboard from "./System/Dashboard/SupervisorDashboard.jsx";
import TechnicianSummary from "./System/Dashboard/TechnicianSummary.jsx";
import TechnicianJobs from "./System/Dashboard/TechnicianJobs.jsx";
import Technicianview from "./System/Dashboard/Technicianview.jsx";
import Creationjobcard from "./System/Dashboard/Jobcard/Creationjobcard.jsx";
import Jobcarddetails from "./System/Dashboard/Jobcard/Jobcarddetails.jsx";
import Jobcardlist from "./System/Dashboard/Jobcard/Jobcardlist.jsx";
import CustomerPortal from "./System/Dashboard/CustomerPortal.jsx";

const DashboardLayout = ({ user, onLogout, children }) => (
  <div className="app-layout">
    <Sidebar user={user} onLogout={onLogout} />
    <div className="page-content">{children}</div>
  </div>
)

export default function App() {
  const [user, setUser] = useState(null)
  const [jobs, setJobs] = useState(() => {
    try {
    const storedJobs = localStorage.getItem("jobCards")
    return storedJobs ? JSON.parse(storedJobs) : []
  } catch {
    return []
  }
})

useEffect(() => {
  try {
    const stored = localStorage.getItem("jobCardUser")
    if (stored) setUser(JSON.parse(stored))
  } catch {
    localStorage.removeItem("jobCardUser")
  }
}, [])
const handleLogin = (data) => {
  localStorage.setItem("token", data.token)
  localStorage.setItem("jobCardUser", JSON.stringify(data.user))
  setUser(data.user)
}

const handleLogout = () => {
  localStorage.removeItem("jobCardUser")
  localStorage.removeItem("token")
  setUser(null)
}

  const handleCreateJob = (newJob) => {
    setJobs((prevJobs) => [...prevJobs, newJob])
  }

  return (
    <BrowserRouter>
      {!user && <Narbar user={user} onLogout={handleLogout} />}

      <Routes>
        <Route
          path="/"
          element={
            !user ? (
              <Login onLogin={handleLogin} />
            ) : user.role === "supervisor" ? (
            <Navigate to="/supervisor" replace />
            ) : user.role === "technician" ? (
            <Navigate to="/technician" replace />
            ) : user.role === "admin" ? (
            <Navigate to="/admin" replace />  
             ) : (
           <Navigate to="/customer" replace />
            )
          }
        />

        <Route
          path="/supervisor"
          element={
            <DashboardLayout user={user} onLogout={handleLogout}>
              <SupervisorDashboard user={user} onLogout={handleLogout} jobs={jobs} />
            </DashboardLayout>
          }
        />
        <Route
          path="/supervisor/job-list"
          element={
            <DashboardLayout user={user} onLogout={handleLogout}>
              <Jobcardlist user={user} jobs={jobs} setJobs={setJobs} />
            </DashboardLayout>
          }
        />
        <Route
          path="/supervisor/create-job"
          element={
            <DashboardLayout user={user} onLogout={handleLogout}>
              <Creationjobcard user={user} onCreate={handleCreateJob} />
            </DashboardLayout>
          }
        />
        <Route
          path="/supervisor/job/:id"
          element={
            <DashboardLayout user={user} onLogout={handleLogout}>
              <Jobcarddetails user={user} jobs={jobs} setJobs={setJobs} />
            </DashboardLayout>
          }
        />

        <Route
          path="/technician"
          element={
            <DashboardLayout user={user} onLogout={handleLogout}>
              <TechnicianSummary user={user} jobs={jobs} />
            </DashboardLayout>
          }
        />
        <Route
          path="/technician/jobs"
          element={
            <DashboardLayout user={user} onLogout={handleLogout}>
              <TechnicianJobs user={user} jobs={jobs} setJobs={setJobs} />
            </DashboardLayout>
          }
        />
        <Route
          path="/technician/view"
          element={
             <DashboardLayout user={user} onLogout={handleLogout}>
                <Technicianview user={user} jobs={jobs} />
             </DashboardLayout>
            }
        />
        <Route
          path="/technician/job/:id"
          element={
            <DashboardLayout user={user} onLogout={handleLogout}>
              <Jobcarddetails user={user} jobs={jobs} setJobs={setJobs} />
            </DashboardLayout>
          }
        />

        <Route
          path="/customer"
          element={
            <DashboardLayout user={user} onLogout={handleLogout}>
              <CustomerPortal user={user} jobs={jobs} />
            </DashboardLayout>
          }
        />
        <Route
          path="/customer/job/:id"
          element={
            <DashboardLayout user={user} onLogout={handleLogout}>
              <Jobcarddetails user={user} jobs={jobs} setJobs={setJobs} />
            </DashboardLayout>
          }
        />

        <Route
          path="/settings"
          element={
            <DashboardLayout user={user} onLogout={handleLogout}>
              <Settings user={user} />
            </DashboardLayout>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {!user && <Footer />}
    </BrowserRouter>
  )
}
