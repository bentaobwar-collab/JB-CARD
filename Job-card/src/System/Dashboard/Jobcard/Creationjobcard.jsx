import { useState } from "react"
import { useNavigate } from "react-router-dom"

export default function Creationjobcard({ user }) {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    title: "",
    customer: "",
    assignedTo: "",
    description: ""
  })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = () => {
    console.log("Job card created:", form)
    navigate("/supervisor")
  }

  return (
    <div className="form-container">
      <h2>Create Job Card</h2>
      <input
        name="title"
        placeholder="Job Title"
        value={form.title}
        onChange={handleChange}
      />
      <input
        name="customer"
        placeholder="Customer Name"
        value={form.customer}
        onChange={handleChange}
      />
      <input
        name="assignedTo"
        placeholder="Assign to Technician"
        value={form.assignedTo}
        onChange={handleChange}
      />
      <textarea
        name="description"
        placeholder="Job Description"
        value={form.description}
        onChange={handleChange}
      />
      <button onClick={handleSubmit}>Create Job</button>
      <button onClick={() => navigate("/supervisor")}>Cancel</button>
    </div>
  )
}
