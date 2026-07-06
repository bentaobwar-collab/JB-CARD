import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiClock } from "react-icons/fi";
import { downloadJobCardPdf } from "./pdfUtils.js";
import API from "../../../api";

const STATUS_CONFIG = {
  pending:     { dot: "#BA7517", label: "Pending",     bg: "#FAEEDA", color: "#633806", border: "#EF9F27" },
  in_progress: { dot: "#0F6E56", label: "In Progress", bg: "#E1F5EE", color: "#085041", border: "#5DCAA5" },
  completed:   { dot: "#1D9E75", label: "Completed",   bg: "#E1F5EE", color: "#085041", border: "#1D9E75" },
  cancelled:   { dot: "#A32D2D", label: "Cancelled",   bg: "#FCEBEB", color: "#791F1F", border: "#F09595" },
};

const NAVY   = "#1E3A5F";
const SLATE  = "#F8FAFC";
const BORDER = "#E2E8F0";
const MUTED  = "#64748B";
const TEXT   = "#1E293B";
const formatUsername = (name) => {
  if (!name) return "";
  return name
    .split("_")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export default function JobCardDetails({ user, jobs = [], setJobs }) {
    const formatCustomerName = (name) => {
  if (!name) return "";

  return name
    .split("_") 
    .map(
      word =>
        word.charAt(0).toUpperCase() +
        word.slice(1).toLowerCase()
    )
    .join(" "); 
};

  const navigate      = useNavigate();
  const { id }        = useParams();
  const isSupervisor  = user?.role === "supervisor";
  const isTechnician  = user?.role === "technician";
  const isCustomer    = user?.role === "customer";

  const [job, setJob] = useState(null);
  const [form,setForm] = useState(null);
  const [technicians, setTechnicians]= useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDelete, setShowDelete]  = useState(false);
  const [alert,  setAlert] = useState(null);
  const [supervisorName, setSupervisorName] = useState("");
  const [supervisors, setSupervisors] = useState([]);
  const [mpesa, setMpesa] = useState({ phone: "", amount: "", loading: false, result: null, msg: "" });
  const [emailing, setEmailing] = useState(false);

  const showAlert = (type, msg) => {
    setAlert({ type, msg });
    setTimeout(() => setAlert(null), 3500);
  };
  
  const calcDuration = (date, start, end) => {
    if (!start || !end || !date) return null;
    const s = new Date(`${date}T${start}`);
    const e = new Date(`${date}T${end}`);
    const diff = Math.round((e - s) / 60000);
    if (diff <= 0) return null;
    const h = Math.floor(diff / 60);
    const m = diff % 60;
    return `${h > 0 ? h + "h " : ""}${m > 0 ? m + "m" : ""}`.trim();
  };

  const totalTime = (visits = []) => {
    let total = 0;
    visits.forEach(v => {
      if (!v.date || !v.start_time || !v.end_time) return;
      const diff = Math.round(
        (new Date(`${v.date}T${v.end_time}`) - new Date(`${v.date}T${v.start_time}`)) / 60000
      );
      if (diff > 0) total += diff;
    });
    if (!total) return "—";
    const h = Math.floor(total / 60), m = total % 60;
    return `${h > 0 ? h + "h " : ""}${m > 0 ? m + "m" : ""}`.trim();
  };

  const uniqueDays = (visits = []) =>
    new Set(visits.filter(v => v.date).map(v => v.date)).size;

 useEffect(() => {
  const fetchJob = async () => {
    try {
    const jobRes  = await fetch(`${API}/jobcards/${id}`);
const jobData = await jobRes.json();

      setJob(jobData);
      setForm({
        ...jobData,
        visits:            jobData.visits            || [],
        status:            jobData.status            || "pending",
        work_done:         jobData.work_done         || "",
        customer_comments: jobData.customer_comments || "",
        payment_phone:     jobData.payment_phone     || "",
        amount:            jobData.amount            || "",
        phone_number:      jobData.phone_number      || "",  
        email:             jobData.email             || "",   
      });

      
    } catch {
      const found = jobs.find(j => String(j.id) === String(id));
      setJob(found || null);
      setForm(found ? { ...found, visits: found.visits || [] } : null);
    } finally {
      setLoading(false);
    }
  };
  fetchJob();
}, [id]);

const handleStatusChange = async (newStatus) => {
  handleChange("status", newStatus);
  try {
    const res = await fetch(`${API}/jobcards/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    const updated = await res.json();
    setJob(updated);
    setJobs(prev => prev.map(j =>
      String(j.id) === String(id) ? updated : j
    ));
    showAlert("success", "Status updated.");
  } catch {
    showAlert("error", "Failed to save status.");
  }
};

  useEffect(() => {
  fetch(`${API}/users/technicians`)
    .then(r => r.json())
    .then(setTechnicians)
    .catch(() => {});
}, []);

  useEffect(() => {
    if (!job?.supervisor_id) return;
    fetch(`${API}/users/${job.supervisor_id}`)
      .then(r => r.json())
      .then(data => setSupervisorName(data.username || "—"))
      .catch(() => {});
  }, [job]);

  useEffect(() => {
  fetch(`${API}/users/supervisors`)
    .then((res) => res.json())
    .then((data) => {
      console.log("Supervisors:", data);

      if (Array.isArray(data)) {
        setSupervisors(data);
      } else {
        setSupervisors([]);
      }
    })
    .catch((err) => {
      console.log(err);
      setSupervisors([]);
    });
}, []);
  const handleChange = (field, value) => setForm(f => ({ ...f, [field]: value }));
  const addVisit = () => {
    const today = new Date().toISOString().split("T")[0];
    setForm(f => ({
      ...f,
      visits: [...(f.visits || []), { id: Date.now(), date: today, start_time: "", end_time: "", work_done: "" }],
    }));
  };

  const updateVisit = (i, field, value) => {
    setForm(f => {
      const visits = [...(f.visits || [])];
      visits[i] = { ...visits[i], [field]: value };
      return { ...f, visits };
    });
  };

  const removeVisit = i => {
    setForm(f => ({ ...f, visits: f.visits.filter((_, idx) => idx !== i) }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const endpoint = isTechnician || isCustomer
        ? `${API}/jobcards/${id}/technician-update`
        : `${API}/jobcards/${id}`;
      const body = isTechnician
        ? {
            visits:            form.visits,
            work_done:         form.work_done,
            customer_comments: form.customer_comments,
            status:            form.status,
            email: form.email,
            phone_number: form.phone_number,
            description: form.description,
          }
        : isCustomer
          ? {
              payment_phone: form.payment_phone || form.phone_number || "",
              amount: form.amount || "",
              customer_comments: form.customer_comments,
            }
          : {
          title:          form.title,
            description:    form.description,
            location:       form.location,
            customer_name:  form.customer_name,
            phone_number:   form.phone_number,
            email:  form.email,
            technician_id:  form.technician_id  ? Number(form.technician_id)  : null,
            supervisor_id:  form.supervisor_id  ? Number(form.supervisor_id)  : null,
            supervisor_name: form.supervisor_name,
            assignedto:     form.assignedto,
          };
       const res = await fetch(endpoint, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Save failed");

      const updated = await res.json();
      setJob(updated);
      setForm(f => ({ ...f, ...updated, visits: updated.visits || f.visits || [] ,email: f.email,
  phone_number: f.phone_number,
  description: f.description,}));
      setJobs(jobs.map(j => String(j.id) === String(id) ? updated : j));                  
      showAlert("success", "Saved successfully.");
    } catch {
      setJobs(jobs.map(j => String(j.id) === String(id) ? { ...j, ...form } : j));
      showAlert("success", "Changes saved.");
    }
    setSaving(false);
  };
const handleMarkComplete = async () => {
  const updated = { ...form, status: "completed" };
  setForm(updated);
  try {
    await fetch(`${API}/jobcards/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "completed" }),
    });
    setJobs(jobs.map(j =>
      String(j.id) === String(id) ? { ...j, ...updated } : j
    ));
    showAlert("success", "Job marked as completed!");
  } catch {
    showAlert("error", "Failed to mark complete. Try saving manually.");
  }
};
  

  const handleDelete = async () => {
    try { await fetch(`${API}/jobcards/${id}`, { method: "DELETE" }); } catch {}
    setJobs(jobs.filter(j => String(j.id) !== String(id)));
    navigate("/supervisor/job-list");
    setShowDelete(false);
  };

  const handleMpesa = async () => {
    setMpesa(m => ({ ...m, loading: true, result: null }));
    const phone = isCustomer ? (form.payment_phone || form.phone_number || "") : mpesa.phone;
    const amount = isCustomer ? form.amount || "" : mpesa.amount;

    try {
      const res  = await fetch(`${API}/payments/mpesa/stk-push`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, amount, jobId: job.id }),
      });
      const data = await res.json();
      setMpesa(m => ({ ...m, loading: false, result: data.success ? "success" : "error", msg: data.message }));
    } catch {
      setMpesa(m => ({ ...m, loading: false, result: "error", msg: "Request failed. Try again." }));
    }
  };

  const handleSendEmail = async () => {
    if (!isTechnician) return;
    setEmailing(true);
    try {
      const res = await fetch(`${API}/jobcards/${id}/send-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
        jobId: id,
        customerEmail: form.customer_email || job.customer_email,
        customerName: form.customer_name || job.customer_name,
        jobTitle: form.title || job.title,
        jobNumber: job.job_number || `#${job.id}`,
        workDone: form.work_done || job.work_done,
      })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send email");
      showAlert("success", data.message || "Email sent to customer.");
    } catch (err) {
      showAlert("error", err.message || "Failed to send email.");
    }
    setEmailing(false);
  };

  if (loading) return <div style={s.page}><p style={{ color: MUTED }}>Loading...</p></div>;
  if (!job || !form) return (
    <div style={s.page}>
      <p style={{ color: TEXT }}>Job card not found.</p>
      <button style={s.btnPlain} onClick={() => navigate(-1)}>← Go back</button>
    </div>
  );

  const statusCfg = STATUS_CONFIG[form.status] || STATUS_CONFIG.pending;
  const jobDone   = form.status === "completed";
  const visits    = form.visits || [];

  return (
    <div style={s.page}>

      {alert && (
        <div style={{
          padding: "10px 14px", borderRadius: 8, marginBottom: 14, fontSize: 13,
          background: alert.type === "success" ? "#E1F5EE" : "#FCEBEB",
          color:      alert.type === "success" ? "#085041"  : "#791F1F",
          border:     `1px solid ${alert.type === "success" ? "#5DCAA5" : "#F09595"}`,
        }}>
          {alert.type === "success" ? "✓" : "⚠"} {alert.msg}
        </div>
      )}

      <div style={s.card}>
        <div style={s.header}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={s.logoBox}>
              <img src="/CopyCatGroup_Logo.png" alt="Copy Cat Limited" style={{ width: 48, height: 48, objectFit: "contain" }} />
            </div>
            <div>
              <p style={{ fontSize: 17, fontWeight: 700, color: NAVY }}>Copy Cat Limited</p>
              <p style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>
                {isTechnician ? "Technician Work Report" : "Job Card Management System"}
              </p>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: 11, color: MUTED }}>Job number</p>
            <p style={{ fontSize: 20, fontWeight: 700, color: NAVY }}>{job.job_number || `#${job.id}`}</p>
            <p style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>Created {(job.scheduleddate?.split("T")[0])}</p>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 7, padding: "4px 12px", borderRadius: 20, background: statusCfg.bg, border: `1px solid ${statusCfg.border}` }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: statusCfg.dot }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: statusCfg.color }}>{statusCfg.label}</span>
            </div>
          </div>
        </div>

        <Section label="Customer Information">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 10 }}>
            <Field label="Full Name">
             <input style={s.input} value={formatCustomerName(form.customer_name || "")} onChange={e => handleChange("customer_name", e.target.value)}
         disabled={isTechnician || isCustomer} />
            </Field>
            <Field label="Phone Number">
              <input style={s.input} value={form.phone_number || ""} onChange={e => handleChange("phone_number", e.target.value)} disabled={isTechnician || isCustomer} />
             </Field>
            <Field label="Email Address">
              <input style={s.input} value={form.email || ""} onChange={e => handleChange("email", e.target.value)} disabled={isTechnician || isCustomer} />
            </Field>
          </div>
          <Field label="Location / Address">
            <input style={s.input} value={form.location || ""} onChange={e => handleChange("location", e.target.value)} disabled={isTechnician || isCustomer} />
          </Field>
        </Section>

        <Section label="Job Details">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
            <Field label="Job Title">
              <input style={s.input} value={form.title || ""} onChange={e => handleChange("title", e.target.value)} disabled={isTechnician || isCustomer} />
            </Field>
            <Field label="Status">
              <select style={s.input} value={form.status || "pending"}  onChange={e =>isSupervisor? handleStatusChange(e.target.value): handleChange("status", e.target.value)}disabled={isTechnician || isCustomer}>
                {Object.entries(STATUS_CONFIG).map(([v, c]) => (
                  <option key={v} value={v}>{c.label}</option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Description">
            <textarea style={{ ...s.input, minHeight: 70, resize: "vertical", width: "100%" }}
              value={form.description || ""}
              onChange={e => handleChange("description", e.target.value)}
              disabled={isTechnician || isCustomer}
            />
          </Field>
        </Section>
        <Section label="Assignment">
  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
    <Field label="Technician">
      <AssignmentField
        editable={isSupervisor}
        value={form.technician_id}
        onChange={e => handleChange("technician_id", e.target.value)}
        options={technicians}
        placeholder="Select Technician"
      />
    </Field>

    <Field label="Supervisor">
      <AssignmentField
        editable={isSupervisor}
        value={form.supervisor_id}
        onChange={(e) => {
          const selected = supervisors.find(sup => String(sup.id) === e.target.value);
          if (!selected) {
            setForm(f => ({ ...f, supervisor_id: "", supervisor_name: "" }));
            return;
          }
          setForm(f => ({ ...f, supervisor_id: selected.id, supervisor_name: selected.username }));
        }}
        options={supervisors}
        placeholder="Select Supervisor"
      />
    </Field>
  </div>
</Section>
        <Section label="Work Details — Filled by Technician">

          <div style={s.summaryBar}>
            <div style={s.statCard}>
              <p style={s.statNum}>{visits.length}</p>
              <p style={s.statLbl}>Total visits</p>
            </div>
            <div style={s.statCard}>
              <p style={s.statNum}>{totalTime(visits)}</p>
              <p style={s.statLbl}>Time on site</p>
            </div>
            <div style={s.statCard}>
              <p style={s.statNum}>{uniqueDays(visits) || "—"}</p>
              <p style={s.statLbl}>Days on site</p>
            </div>
          </div>

          <Field label="Site Visits Log">
            <div style={{ overflowX: "auto", borderRadius: 8, border: `1px solid ${BORDER}` }}>
              <table style={s.tbl}>
                <thead>
                  <tr>
                    {["No", "Date", "Start Time", "End Time", "Duration", "Work Done", ""].map(h => (
                      <th key={h} style={s.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visits.map((v, i) => {
                    const dur  = calcDuration(v.date, v.start_time, v.end_time);
                    const done = jobDone || v.locked;
                    return (
                      <tr key={v.id || i} style={{ background: done ? "#F0FDF9" : i % 2 === 0 ? "#fff" : "#F8FAFC" }}>
                        <td style={{ ...s.td, width: 36, textAlign: "center" }}>
                          <div style={{ ...s.rowNum, background: done ? "#0F6E56" : NAVY }}>{i + 1}</div>
                        </td>
                        <td style={{ ...s.td, minWidth: 130 }}>
                          <input
                            type="date"
                            style={s.tdInp(done)}
                            value={v.date || ""}
                            onChange={e => updateVisit(i, "date", e.target.value)}
                            disabled={!isTechnician || jobDone}
                          />
                        </td>
                        <td style={{ ...s.td, minWidth: 120 }}>
                          <div style={s.timeCell(done)}>
                            <FiClock size={14} color={done ? "#9CA3AF" : NAVY} />
                            <input
                              type="time"
                              style={s.timeInp(done)}
                              value={v.start_time || ""}
                              onChange={e => updateVisit(i, "start_time", e.target.value)}
                              disabled={!isTechnician || jobDone}
                            />
                          </div>
                        </td>
                        <td style={{ ...s.td, minWidth: 120 }}>
                          <div style={s.timeCell(done)}>
                            <FiClock size={14} color={done ? "#9CA3AF" : NAVY} />
                            <input
                              type="time"
                              style={s.timeInp(done)}
                              value={v.end_time || ""}
                              onChange={e => updateVisit(i, "end_time", e.target.value)}
                              disabled={!isTechnician || jobDone}
                            />
                          </div>
                        </td>
                        <td style={{ ...s.td, minWidth: 90 }}>
                          {dur
                            ? <span style={s.durPill}>{dur}</span>
                            : <span style={{ fontSize: 12, color: "#9CA3AF" }}>—</span>
                          }
                        </td>
                        <td style={{ ...s.td, minWidth: 200 }}>
                          <input
                            style={s.tdInp(done)}
                            value={v.work_done || ""}
                            onChange={e => updateVisit(i, "work_done", e.target.value)}
                            placeholder="Describe work done..."
                            disabled={!isTechnician || jobDone}
                          />
                        </td>
                        <td style={{ ...s.td, width: 40, textAlign: "center" }}>
                          {!done && (
                            <button style={s.btnRm} onClick={() => removeVisit(i)} title="Remove visit">✕</button>
                          )}
                          {done && <span style={s.donePill}>✓</span>}
                        </td>
                      </tr>
                    );
                  })}
                  {visits.length === 0 && (
                    <tr>
                      <td colSpan={7} style={{ textAlign: "center", padding: "20px", fontSize: 13, color: MUTED }}>
                        No visits logged yet. Click "Add Visit" to start.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {!jobDone && isTechnician && (
              <button style={s.btnAddRow} onClick={addVisit}>
                + Add Visit
              </button>
            )}
          </Field>

          <Field label="Overall Work Summary" style={{ marginTop: 10 }}>
            <textarea
              style={{ ...s.input, minHeight: 72, resize: "vertical", width: "100%" }}
              value={form.work_done || ""}
              onChange={e => handleChange("work_done", e.target.value)}
              disabled={!isTechnician || jobDone}
              placeholder="Overall summary of all work performed across all visits..."
            />
          </Field>

          <Field label="Customer Comments">
            <textarea
              style={{ ...s.input, minHeight: 52, resize: "vertical", width: "100%" }}
              value={form.customer_comments || ""}
              onChange={isCustomer ? e => handleChange("customer_comments", e.target.value) : undefined}
              disabled={!isCustomer}
              placeholder="Any feedback or comments from the customer..."
            />
          </Field>

          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 11, color: MUTED, textTransform: "uppercase", letterSpacing: "0.4px" }}>Job Done</span>
            <span style={{
              fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 600,
              background: jobDone ? "#E1F5EE" : "#F1F5F9",
              color:      jobDone ? "#085041"  : MUTED,
              border:     `1px solid ${jobDone ? "#5DCAA5" : BORDER}`,
            }}>
              {jobDone ? "✓ Completed" : "Not yet completed"}
            </span>
          </div>

          {isTechnician && !jobDone && (
            <div style={s.warnBox}>
              <p style={{ fontSize: 12, color: "#92400E", marginBottom: 8 }}>
                Once you mark this job as complete it will become read-only.
              </p>
              <button style={s.btnGreen} onClick={handleMarkComplete}>
                ✅ Mark Job as Complete
              </button>
            </div>
          )}

          {jobDone && (
            <div style={{ marginTop: 12, padding: "10px 14px", background: "#E1F5EE", border: "1px solid #5DCAA5", borderRadius: 8, fontSize: 12, color: "#085041" }}>
              ✅ This job card is completed and is now read-only.
            </div>
          )}

        </Section>

        {isCustomer && (
        <Section label="Payment — M-Pesa">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
            <Field label="Customer Phone (07XXXXXXXX)">
              <input style={s.input} type="tel" placeholder="e.g. 0712345678"
                value={form.payment_phone || form.phone_number || ""}
                onChange={e => handleChange("payment_phone", e.target.value)} />
            </Field>
            <Field label="Amount (KES)">
              <input style={s.input} type="number" placeholder="e.g. 2500"
                value={form.amount || ""}
                onChange={e => handleChange("amount", e.target.value)} />
            </Field>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "flex-start" }}>
            <button
              style={{ ...s.btnMpesa, opacity: (mpesa.loading || !(form.payment_phone || form.amount)) ? 0.6 : 1 }}
              onClick={handleMpesa}
              disabled={mpesa.loading || !(form.payment_phone || form.amount)}>
              {mpesa.loading ? "Sending prompt..." : "Send M-Pesa Prompt"}
            </button>
          </div>
          {mpesa.result === "success" && (
            <div style={{ marginTop: 10, padding: "10px 14px", background: "#E1F5EE", border: "1px solid #5DCAA5", borderRadius: 8, fontSize: 12, color: "#085041" }}>
              ✓ STK push sent. Ask customer to enter their M-Pesa PIN.
            </div>
          )}
          {mpesa.result === "error" && (
            <div style={{ marginTop: 10, padding: "10px 14px", background: "#FCEBEB", border: "1px solid #F09595", borderRadius: 8, fontSize: 12, color: "#791F1F" }}>
              ⚠ {mpesa.msg || "Something went wrong."}
            </div>
          )}
        </Section>
        )}


        <Section label="Signatures" noBorder>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {["Customer Signature", "Supervisor Signature"].map(label => (
              <div key={label}>
                <Field label={label}>
                  <div style={s.sigBox}>
                    <p style={{ fontSize: 11, color: "#9CA3AF" }}>Sign here</p>
                  </div>
                </Field>
                <div style={s.sigLine}>
                  <span style={{ fontWeight: 600, color: TEXT }}>Signature</span>
                  <span style={{ fontWeight: 600, color: TEXT }}>Date: _______________</span>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <div style={s.actions}>
          <button style={s.btnPrimary} onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Job Card"}
          </button>
          {isTechnician && (
            <button style={{ ...s.btnPlain, color: "#0F6E56", borderColor: "#5DCAA5" }}
              onClick={handleSendEmail}
              disabled={emailing}>
              {emailing ? "Sending email..." : "Send Email"}
            </button>
          )}
          <button style={s.btnPlain} onClick={() => downloadJobCardPdf(job)}>
             Download PDF
          </button>
          {isSupervisor && (
            <button style={{ ...s.btnPlain, marginLeft: "auto", color: "#A32D2D", borderColor: "#F09595" }}
              onClick={() => setShowDelete(true)}>
              Delete
            </button>
          )}
          <button style={{ ...s.btnPlain, marginLeft: isTechnician ? "auto" : 0 }} onClick={() => navigate(-1)}>
            ← Back
          </button>
        </div>

      </div>

      {showDelete && (
        <div style={{ marginTop: 16, background: "rgba(0,0,0,0.45)", borderRadius: 12, padding: 32, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#fff", borderRadius: 12, padding: 24, maxWidth: 320, width: "90%", textAlign: "center" }}>
            <p style={{ fontSize: 30, marginBottom: 10 }}>🗑</p>
            <p style={{ fontSize: 15, fontWeight: 600, color: TEXT, marginBottom: 8 }}>Delete job card?</p>
            <p style={{ fontSize: 12, color: MUTED, marginBottom: 18 }}>
              This will permanently delete <strong>{job.job_number || `#${job.id}`}</strong> and cannot be undone.
            </p>
            <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
              <button style={s.btnPlain} onClick={() => setShowDelete(false)}>Cancel</button>
              <button style={{ ...s.btnPlain, color: "#A32D2D", borderColor: "#F09595" }} onClick={handleDelete}>Yes, delete</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}


function Section({ label, children, noBorder }) {
  return (
    <div style={{ padding: "16px 20px", borderBottom: noBorder ? "none" : `1px solid ${BORDER}` }}>
      <p style={{
        fontSize: 11, fontWeight: 700, color: NAVY,
        textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 14,
        paddingBottom: 6, borderBottom: `2px solid #E2E8F0`,
      }}>
        {label}
      </p>
      {children}
    </div>
  );
}

function Field({ label, children, style }) {
  return (
    <div style={{ marginBottom: 10, ...style }}>
      <p style={{ fontSize: 11, color: MUTED, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 600 }}>
        {label}
      </p>
      {children}
    </div>
  );
}
function AssignmentField({ editable, value, onChange, options, placeholder }) {
  return (
    <select
      style={{
        ...s.input,
        background: editable ? "#fff" : SLATE,
        color: editable ? TEXT : MUTED,
        cursor: editable ? "pointer" : "default",
      }}
      value={value || ""}
      onChange={editable ? onChange : undefined}
      disabled={!editable}
    >
      <option value="">{placeholder}</option>
      {options.map(opt => (
        <option key={opt.id} value={opt.id}>{formatUsername(opt.username)}</option>
      ))}
    </select>
  );
}


const s = {
  page:    { maxWidth: 740, margin: "0 auto", padding: 16, fontFamily: "'Inter', sans-serif" },
  card:    { background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 8px rgba(30,58,95,0.08)" },
  header:  { padding: "20px 24px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", borderBottom: `3px solid ${NAVY}`, background: "#F8FAFC" },
  logoBox: { width: 60, height: 60, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", background: "--background", flexShrink: 0 },

  input: {
    width: "100%", padding: "9px 12px", borderRadius: 7, border: `1px solid ${BORDER}`,
    background: "#fff", color: TEXT, fontSize: 13, fontFamily: "inherit",
    outline: "none", boxSizing: "border-box",
    transition: "border-color 0.15s",
  },

  summaryBar: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 },
  statCard:   { background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 8, padding: "12px", textAlign: "center" },
  statNum:    { fontSize: 20, fontWeight: 700, color: NAVY, lineHeight: 1 },
  statLbl:    { fontSize: 11, color: "#3B82F6", marginTop: 3, fontWeight: 500 },

  tbl: { width: "100%", borderCollapse: "collapse", fontSize: 12, minWidth: 600 },
  th:  { fontSize: 10, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px", padding: "9px 10px", background: "#F1F5F9", borderBottom: `1px solid ${BORDER}`, textAlign: "left", whiteSpace: "nowrap" },
  td:  { padding: "7px 8px", borderBottom: `1px solid ${BORDER}`, verticalAlign: "middle" },

  tdInp: (disabled) => ({
    width: "100%", padding: "6px 8px", borderRadius: 5,
    border: `1px solid ${disabled ? "#E2E8F0" : "#CBD5E1"}`,
    background: disabled ? "#F8FAFC" : "#fff",
    color: disabled ? "#64748B" : TEXT,
    fontSize: 12, fontFamily: "inherit", outline: "none", boxSizing: "border-box",
  }),

  timeCell: (disabled) => ({
    display: "flex", alignItems: "center", gap: 6,
    border: `1px solid ${disabled ? "#E2E8F0" : "#CBD5E1"}`,
    borderRadius: 5, padding: "0 8px",
    background: disabled ? "#F8FAFC" : "#fff", height: 34,
  }),

  timeInp: (disabled) => ({
    flex: 1, border: "none", outline: "none",
    background: "transparent", fontSize: 12,
    fontWeight: 600, color: disabled ? "#9CA3AF" : NAVY,
    fontFamily: "inherit",
  }),

  durPill: {
    fontSize: 11, color: "#085041",
    background: "#DCFCE7", border: "1px solid #86EFAC",
    borderRadius: 20, padding: "3px 10px",
    whiteSpace: "nowrap", fontWeight: 600,
  },

  donePill: {
    fontSize: 11, color: "#085041",
    background: "#E1F5EE", border: "1px solid #5DCAA5",
    borderRadius: 20, padding: "2px 8px", fontWeight: 600,
  },

  rowNum: {
    width: 22, height: 22, borderRadius: "50%",
    color: "#fff", fontSize: 10, fontWeight: 700,
    display: "inline-flex", alignItems: "center", justifyContent: "center",
  },

  btnRm: {
    padding: "3px 8px", borderRadius: 5, fontSize: 11,
    cursor: "pointer", border: "1px solid #FECACA",
    background: "#FEF2F2", color: "#B91C1C",
  },

  btnAddRow: {
    width: "100%", marginTop: 8, padding: "9px",
    borderRadius: 7, fontSize: 13, cursor: "pointer",
    border: "1px dashed #93C5FD", background: "#EFF6FF",
    color: "#1D4ED8", fontWeight: 600,
  },

  sigBox:  { border: `1px solid ${BORDER}`, borderRadius: 7, height: 72, display: "flex", alignItems: "center", justifyContent: "center", background: SLATE },
  sigLine: { display: "flex", justifyContent: "space-between", marginTop: 5, fontSize: 11, color: MUTED },

  actions:    { padding: "14px 20px", display: "flex", gap: 8, alignItems: "center", background: SLATE, borderTop: `1px solid ${BORDER}`, flexWrap: "wrap" },
  btnPrimary: { padding: "9px 18px", borderRadius: 8, fontSize: 13, cursor: "pointer", fontWeight: 600, border: "none", background: NAVY, color: "#fff" },
  btnPlain:   { padding: "9px 14px", borderRadius: 8, fontSize: 13, cursor: "pointer", border: `1px solid ${BORDER}`, background: "#fff", color: TEXT },
  btnGreen:   { padding: "9px 14px", borderRadius: 8, fontSize: 13, cursor: "pointer", border: "1px solid #5DCAA5", background: "#E1F5EE", color: "#085041", fontWeight: 600 },
  btnMpesa:   { padding: "9px 18px", borderRadius: 8, fontSize: 13, cursor: "pointer", border: "none", background: "#007A4D", color: "#fff", fontWeight: 600 },
  warnBox:    { marginTop: 14, padding: "12px 14px", background: "#FFFBEB", border: "1px solid #FCD34D", borderRadius: 8 },
};