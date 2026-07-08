import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
const API = "https://localhost:5000/api";

export default function Creationjobcard({ user, onCreate }) {
  const navigate = useNavigate()
  const [success, setSuccess] = useState(false)
  const [technicians, setTechnicians] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [errors, setErrors] = useState({})
  const [form, setForm] = useState({
    id:           "",
    title:        "",
    customer:     "",
    customer_id:  "",
    technician_id:"",
    assignedTo:   "",
    location:     "",
    description:  "",
    scheduleDate: "",
  })
  useEffect(() => {
    fetch(`${API}/users/technicians`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Technicians:", data)
        setTechnicians(data)
      })
      .catch((err) => console.log(err))

    fetch(`${API}/users/customers`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Customers:", data)
        setCustomers(data)
      })
      .catch((err) => console.log(err))
  }, [])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErrors({ ...errors, [e.target.name]: "" })
  }

  const fieldClass = (name) => `form-group ${errors[name] ? "error" : ""}`

  const validate = () => {
    const newErrors = {}
    if (!form.id)           newErrors.id           = "Job ID is required"
    if (!form.title)        newErrors.title        = "Job title is required"
    if (!form.customer)     newErrors.customer     = "Customer name is required"
    if (!form.customer_id)  newErrors.customer_id  = "Customer ID is required"
    if (!form.technician_id)newErrors.technician_id= "Technician ID is required"
    if (!form.assignedTo)   newErrors.assignedTo   = "Please assign a technician"
    if (!form.description)  newErrors.description  = "Description is required"
    if (!form.scheduleDate) newErrors.scheduleDate = "Schedule date is required"
    return newErrors
  }

  const handleSubmit = async () => {
    
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    
    const newJob = {
      job_number:form.id,
      title: form.title,
      customer_name:  form.customer,
      customer_id:  form.customer_id,
      technician_id:form.technician_id,
      assignedto:  form.assignedTo,
      location:  form.location,
      description:  form.description,
      scheduleddate: form.scheduleDate,
      supervisor_id: user.id,
      supervisor_name: user.username
    }

    try {
      const response = await fetch(`${API}/jobcards`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(newJob),
      })

      const data = await response.json()

      if (!response.ok) {
        setErrors({ general: data.message || "Failed to create job card" })
        return
      }

      if (onCreate) onCreate(data.jobcard || newJob)

      setSuccess(true)
      setTimeout(() => navigate("/supervisor/job-list"), 1200)

    } catch (error) {
      console.error(error)
      setErrors({ general: "Server not reachable. Check your backend is running." })
    }
  }

  if (success) {
    return (
      <div className="main-content">
        <div className="success-screen">
          <div className="success-icon-big">✅</div>
          <h2>Job Card Created!</h2>
          <p>Redirecting to job list...</p>
        </div>
      </div>
    )
  }


  return (
    <div className="main-content">
      <div className="page-header">
        <div>
          <h1>Create Job Card</h1>
          <p>Fill in the details below to assign a new job</p>
        </div>
        <button
          className="btn-cancel"
          onClick={() => navigate("/supervisor")}>
          ← Back
        </button>
      </div>

      <div className="form-card">

        
        {errors.general && (
          <div className="error-banner">{errors.general}</div>
        )}

        <p className="section-label">Job Information</p>
        <div className="form-grid">

          <div className={fieldClass("id")}>
            <label>Job ID</label>
            <input
              name="id"
              placeholder="e.g. J-1001"
              value={form.id}
              onChange={handleChange}
            />
            {errors.id && <p className="field-error">{errors.id}</p>}
          </div>

          <div className={fieldClass("title")}>
            <label>Job Title</label>
            <input
              name="title"
              placeholder="e.g. Printer Repair"
              value={form.title}
              onChange={handleChange}
            />
            {errors.title && <p className="field-error">{errors.title}</p>}
          </div>
          <div className={fieldClass("customer")}>
           <label>Customer Name</label>
                <select
          name="customer"
            value={form.customer}
                onChange={(e) => {
                const selectedCustomer = customers.find(
                  customer => customer.username === e.target.value
                            );

    setForm({
      ...form,
      customer: selectedCustomer.username,
      customer_id: selectedCustomer.id
    });
  }}
>
  <option value="">Select Customer</option>

  {customers.map(customer => (
    <option
      key={customer.id}
      value={customer.username}
    >
     {customer.username
      .split("_")
      .map(word =>
        word.charAt(0).toUpperCase() + word.slice(1)
      )
      .join(" ")}
    </option>
  ))}
</select>
</div>
<div className={fieldClass("assignedTo")}>
  <label>Assign To (Technician)</label>

          <select
  name="assignedTo"
  value={form.assignedTo}
  onChange={(e) => {
    const selectedTech = technicians.find(
      tech => tech.username === e.target.value
    );

    setForm({
      ...form,
      assignedTo: selectedTech.username,
      technician_id: selectedTech.id
    });
  }}
>
  <option value="">Select Technician</option>

  {technicians.map(tech => (
    <option
      key={tech.id}
      value={tech.username}
    >
      {tech.username
        .split("_")
        .map(word =>
          word.charAt(0).toUpperCase() + word.slice(1)
        )
        .join(" ")}
    </option>
  ))}
</select>
</div>

          <div className={fieldClass("customer_id")}>
            <label>Customer ID</label>
            <input
              name="customer_id"
              placeholder="e.g. C-001"
              value={form.customer_id}
              readOnly
            />
            {errors.customer_id && <p className="field-error">{errors.customer_id}</p>}
          </div>

          <div className={fieldClass("technician_id")}>
            <label>Technician ID</label>
            <input
              name="technician_id"
              placeholder="e.g. T-001"
              value={form.technician_id}
              readOnly
            />
            {errors.technician_id && <p className="field-error">{errors.technician_id}</p>}
          </div>

          <div className="form-group">
            <label>Location</label>
            <input
              name="location"
              placeholder="e.g. Westlands, Nairobi"
              value={form.location}
              onChange={handleChange}
            />
          </div>

          <div className={fieldClass("scheduleDate")}>
            <label>Scheduled Date</label>
            <input
              type="date"
              name="scheduleDate"
              value={form.scheduleDate}
              onChange={handleChange}
              min={new Date().toISOString().split("T")[0]}
            />
            {errors.scheduleDate && <p className="field-error">{errors.scheduleDate}</p>}
          </div>

        </div>

        <p className="section-label" style={{ marginTop: "24px" }}>
          Description
        </p>
        <div className={fieldClass("description")}>
          <textarea
            name="description"
            placeholder="Describe the work to be done in detail..."
            rows={5}
            value={form.description}
            onChange={handleChange}
          />
          {errors.description && <p className="field-error">{errors.description}</p>}
        </div>

        <div className="created-by-row">
          <span>👤</span>
          <p>Created by <strong>
            {user?.username
              ? user.username.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
              : "Supervisor"}
          </strong></p>
        </div>

        <div className="form-actions">
          <button
            className="btn-cancel"
            onClick={() => navigate("/supervisor")}>
            Cancel
          </button>
          <button
            className="btn-submit"
            onClick={handleSubmit}>
            Create Job Card
          </button>
        </div>

      </div>
    </div>
  )
}