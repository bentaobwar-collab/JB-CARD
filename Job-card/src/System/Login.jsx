import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import API from "../api";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");

  try {
    const res = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.message || "Login failed");
      return;
    }

   
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    
    onLogin(data);

  } catch (err) {
    console.error("Login request failed:", err);
    setError(err?.message || "Server not reachable. Please accept the local HTTPS certificate warning and try again.");
  }
};

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-brand">
          <img src="/CopyCatGroup_Logo.png" alt="logo" width="44" height="44" />
          <div>
            <span className="login-brand-name">Copy Cat</span>
          </div>
        </div>

        <h2 className="login-title">Sign in to your account</h2>
        <p className="login-subtitle">Enter your credentials to continue.</p>
        {error && <p className="error">{error}</p>}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <Mail size={20} />
            <input
              className="login-input"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-label="email"
            />
          </div>

          <div className="input-group">
            <Lock size={20} />
            <input
              className="login-input"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-label="password"
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              aria-label="toggle password visibility"
              color = "black"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className="login-footer-row">
            <p className="forgot-password" onClick={() => navigate("/forgot-password")}>Forgot Password?</p>
          </div>

          <button className="btn-submit login-submit" type="submit">Log In</button>
        </form>
      </div>
    </div>
  );
}
