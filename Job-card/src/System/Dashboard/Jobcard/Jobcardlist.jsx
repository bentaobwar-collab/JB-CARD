import { useNavigate } from "react-router-dom"

export default function Jobcardlist({ user }) {
  const navigate = useNavigate()

  const jobs = [
    { id: 1, title: "Printer Repair", customer: "ABC Ltd", status: "Pending" },
    { id: 2, title: "Copier Maintenance", customer: "XYZ Co", status: "Completed" },
    { id: 3, title: "Toner Replacement", customer: "DEF Inc", status: "In Progress" },
  ]

  return (
    <div className="list-container">
      <h2>All Job Cards</h2>
      {jobs.map((job) => (
        <div className="job-card" key={job.id}
          onClick={() => navigate(`/supervisor/job/${job.id}`)}>
          <h3>{job.title}</h3>
          <p>Customer: {job.customer}</p>
          <span className={`status ${job.status.toLowerCase().replace(" ", "-")}`}>
            {job.status}
          </span>
        </div>
      ))}
    </div>
  )
}