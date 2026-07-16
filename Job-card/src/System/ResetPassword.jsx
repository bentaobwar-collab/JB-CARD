import { useState, useEffect} from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Link } from "react-router-dom";
import API from "../api";
export default function ResetPassword() {
  const { token } = useParams();
  const [newPassword, setNew] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg]         = useState("");
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(null);
  const navigate = useNavigate();
  
  useEffect(() => {
     const verifyToken = async () => {
    try {
      await axios.get(
        `${API}/auth/reset-password/${token}`
      );

      setTokenValid(true);
    } catch {
      setTokenValid(false);
    }
  };

  verifyToken();
}, [token]);

  const handleSubmit = async () => {
    setMsg(""); setError("");
    if (newPassword.length < 6) return setError("Password must be at least 6 characters.");
    if (newPassword !== confirm) return setError("Passwords do not match.");
    setLoading(true);

    try {
      const { data } = await axios.post(
`${API}/auth/reset-password/${token}`,
  {
    password: newPassword,
  }
);
      setMsg(data.message);
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };
  if (tokenValid === false) {
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>Invalid Reset Link</h2>

        <p>
          This password reset link is invalid.
        </p>
        <div className="auth-footer"> 
        <Link to="/login">
                Back to Login
              </Link>
              </div>
      </div>
    </div>
    
  );
}

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Reset Password</h2>
        <p style={styles.subtitle}>Enter your new password below.</p>

        {msg   && <p style={{ color: "green", marginBottom: 12 }}>{msg}</p>}
        {error && <p style={{ color: "red",   marginBottom: 12 }}>{error}</p>}

        <label style={styles.label}>New Password</label>
        <input type="password" style={styles.input} placeholder="At least 6 characters"
          value={newPassword} onChange={e => setNew(e.target.value)} />

        <label style={styles.label}>Confirm Password</label>
        <input type="password" style={styles.input} placeholder="Re-enter new password"
          value={confirm} onChange={e => setConfirm(e.target.value)} />

        <button style={styles.button} onClick={handleSubmit} disabled={loading}>
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F8FAFC" },
  card:      { background: "#fff", padding: 32, borderRadius: 12, boxShadow: "0 2px 12px rgba(0,0,0,0.1)", width: "100%", maxWidth: 420 },
  title:     { fontSize: 22, fontWeight: 700, color: "#1E3A5F", marginBottom: 6 },
  subtitle:  { fontSize: 13, color: "#64748B", marginBottom: 24 },
  label:     { fontSize: 13, fontWeight: 600, color: "#333", display: "block", marginBottom: 6 },
  input:     { width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: 6, fontSize: 14, marginBottom: 16, boxSizing: "border-box" },
  button:    { width: "100%", padding: 12, background: "#1E3A5F", color: "#fff", border: "none", borderRadius: 6, fontSize: 15, fontWeight: 600, cursor: "pointer" },
};