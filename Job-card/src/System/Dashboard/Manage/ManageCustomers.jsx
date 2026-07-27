import { useState, useEffect } from "react";
import API from "../../../api.js";

export default function ManageCustomers() {
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState({ username: "", email: "", phone_number: "", password: "" });
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  const fetchCustomers = async () => {
    try {
      const res = await fetch(`${API}/supervisor/customers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setCustomers(data);
    } catch (err) {
      console.error("Failed to load customers", err);
    }
  };

  useEffect(() => { fetchCustomers(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch(`${API}/supervisor/customers`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setForm({ username: "", email: "", phone_number: "", password: "" });
      fetchCustomers();
    } catch (err) {
      setError(err.message || "Failed to add customer");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this customer?")) return;
    try {
      const res = await fetch(`${API}/supervisor/customers/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message);
      }
      fetchCustomers();
    } catch (err) {
      console.error("Failed to delete customer", err);
    }
  };

  return (
    <div className="manage-panel">
      <h2>My Customers</h2>
      <form onSubmit={handleAdd} className="add-form">
        <input placeholder="Username" value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })} required />
        <input placeholder="Email" type="email" value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <input placeholder="Phone number" value={form.phone_number}
          onChange={(e) => setForm({ ...form, phone_number: e.target.value })} />
        <input placeholder="Temporary password" type="password" value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        <button type="submit">Add Customer</button>
      </form>
      {error && <p className="error-text">{error}</p>}
      <ul className="entity-list">
        {customers.length === 0 && <li>No customers added yet.</li>}
        {customers.map((c) => (
          <li key={c.id}>
            <span>{c.username} — {c.email}</span>
            <button onClick={() => handleDelete(c.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}