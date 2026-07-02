import { useNavigate, useParams } from "react-router-dom"

export default function Jobcarddetails({ user }) {
  const navigate = useNavigate()
  const { id } = useParams()

  return (
    <div className="details-container">
      <h2>Job Card Details</h2>
      <div className="details-card">
        <p><strong>Job ID:</strong> #{id}</p>
        <p><strong>Title:</strong> Printer Repair</p>
        <p><strong>Customer:</strong> ABC Ltd</p>
        <p><strong>Status:</strong> Pending</p>
        <p><strong>Description:</strong> Fix paper jam issue</p>
      </div>
      <button onClick={() => navigate(-1)}>Go Back</button>
    </div>
  )
}