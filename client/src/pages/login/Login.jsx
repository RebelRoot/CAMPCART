import React, { useState } from "react";
import "./Login.scss";
import newRequest from "../../utils/newRequest.js";
import { useNavigate } from "react-router-dom";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await newRequest.post("/auth/login", { username, password });
      localStorage.setItem("currentUser", JSON.stringify(res.data));
      navigate("/")
    } catch (err) {
      console.error("Login error:", err);
      if (err.response?.data) {
        setError(err.response.data);
      } else if (err.request) {
        setError("Network error. Please check your connection and try again.");
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    }
  };

  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="login">
      <div className="login-card">
        <form onSubmit={handleSubmit}>
          <div className="header">
            <h1>Welcome Back</h1>
            <p>Enter your credentials to access your account</p>
          </div>
          
          <div className="input-group">
            <label>Username</label>
            <input
              name="username"
              type="text"
              placeholder="e.g. johndoe"
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <div className="password-input">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span className="toggle-v" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? "Hide" : "Show"}
              </span>
            </div>
          </div>

          {error && <div className="error-msg">{error}</div>}
          
          <button type="submit" className="login-btn">Sign In</button>
          
          <div className="footer">
            <span>Don't have an account?</span>
            <span className="link-text" onClick={() => navigate("/register")}>Create one now</span>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
