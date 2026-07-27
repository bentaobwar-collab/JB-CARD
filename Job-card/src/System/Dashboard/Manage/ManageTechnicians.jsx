import { useState, useEffect } from "react";
import API from "../../../api.js";

export default function ManageTechnicians() {
  const [technicians, setTechnicians] = useState([]);
  const [form, setForm] = useState({ username: "", email: "", phone_number: "", password: "" });
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  const fetchTechnicians = async () => {
    try {
      const res = await fetch(`${API}/supervisor/technicians`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setTechnicians(data);
    } catch (err) {
      console.error("Failed to load technicians", err);
    }
  };

  useEffect(() => { fetchTechnicians(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch(`${API}/supervisor/technicians`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setForm({ username: "", email: "", phone_number: "", password: "" });
      fetchTechnicians();
    } catch (err) {
      setError(err.message || "Failed to add technician");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this technician?")) return;
    try {
      const res = await fetch(`${API}/supervisor/technicians/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message);
      }
      fetchTechnicians();
    } catch (err) {
      console.error("Failed to delete technician", err);
    }
  };

  return (
    <div className="manage-panel">
      <h2>My Technicians</h2>
      <form onSubmit={handleAdd} className="add-form">
        <input placeholder="Username" value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })} required />
        <input placeholder="Email" type="email" value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <input placeholder="Phone number" value={form.phone_number}
          onChange={(e) => setForm({ ...form, phone_number: e.target.value })} />
        <input placeholder="Temporary password" type="password" value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        <button type="submit">Add Technician</button>
      </form>
      {error && <p className="error-text">{error}</p>}
      <ul className="entity-list">
        {technicians.length === 0 && <li>No technicians added yet.</li>}
        {technicians.map((t) => (
          <li key={t.id}>
            <span>{t.username} — {t.email}</span>
            <button onClick={() => handleDelete(t.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}