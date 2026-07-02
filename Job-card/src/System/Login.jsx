import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
export default function Login({onLogin}){
  const[email,setEmail] = useState("");
  const[password,setPassword] = useState("");
  const[error,setError] = useState("");
  const[showPassword,setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (email === "alice@copycat.com" && password === "1234") {
      onLogin({ firstName: "Alice", lastName: "", role: "supervisor", email, name: "Alice" })
    } else if (email === "john@copycat.com" && password === "1234") {
      onLogin({ firstName: "John", lastName: "", role: "technician", email, name: "John" })
    } else {
      setError("Invalid email or password");
    }
 }
  return (
    <div className="login-container">
      <div className="login-card">
        <div className="image">
        <img src ="/white-logo.avif" alt ="logo-image"  width = "40px"/>
        <span style = {{ fontSize: "20px", fontWeight: "bold" }}>Copy Cat</span>
        </div>
        <p style={{ padding:"12px"}}>Log in to your account</p>
        {error && <p className="error">{error}</p>}
  
        <div style={{ display: "flex", alignItems: "center", marginBottom: "20px", border: "1px solid #ccc", borderRadius: "4px", padding: "10px 12px" }}>
          <Mail size={16} color="#888" style={{ marginRight: "8px", flexShrink: 0 }} />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ 
              border: "none", 
              outline: "none", 
              flex: 1, 
              fontSize: "14px",
              fontFamily: "inherit"
            }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", marginBottom: "20px", border: "1px solid #ccc", borderRadius: "4px", padding: "10px 12px", gap: "8px" }}>
          <Lock size={16} color="#888" style={{ flexShrink: 0 }} />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ 
              border: "none", 
              outline: "none", 
              flex: 1, 
              fontSize: "14px",
              fontFamily: "inherit",
              backgroundColor: "transparent"
            }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0
            }}
          >
            {showPassword ? (
              <EyeOff size={16} color="#888" />
            ) : (
              <Eye size={16} color="#888" />
            )}
          </button>
        </div>
    
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
          <p className = "forgot-password" style={{ cursor: "pointer" }} onClick={() => navigate("/forgot-password")}>
            Forgot Password?
          </p>
        </div>
        <button type="submit" onClick={handleSubmit}>Log In</button>
      </div>
    </div>

  )

}