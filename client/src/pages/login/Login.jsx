import React, { useState } from "react";
import "./Login.scss";
import newRequest from "../../utils/newRequest.js";
import { useNavigate } from "react-router-dom";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [turnstileToken, setTurnstileToken] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await newRequest.post("/auth/login", { 
        username, 
        password,
        turnstileToken 
      });
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

  // Proper React integration for Turnstile
  React.useEffect(() => {
    window.onTurnstileSuccess = (token) => setTurnstileToken(token);
    window.onTurnstileExpire = () => setTurnstileToken("");
    window.onTurnstileError = (code) => console.error('Turnstile Error:', code);

    let checkInterval = setInterval(() => {
      if (window.turnstile && document.getElementById('turnstile-container')) {
        clearInterval(checkInterval);
        try {
          window.turnstile.render('#turnstile-container', {
            sitekey: import.meta.env.DEV ? '1x00000000000000000000AA' : '0x4AAAAAAC-o9YjjMsH5Evjx',
            callback: window.onTurnstileSuccess,
            'expired-callback': window.onTurnstileExpire,
            'error-callback': window.onTurnstileError,
          });
        } catch (e) {
          console.error("Turnstile render failed", e);
        }
      }
    }, 100);
    
    return () => {
      clearInterval(checkInterval);
      window.onTurnstileSuccess = null;
      window.onTurnstileExpire = null;
      window.onTurnstileError = null;
    };
  }, []);

  return (
    <div className="login">
      <div className="login-card">
        <form onSubmit={handleSubmit}>
          <div className="header">
            <h1>Welcome Back</h1>
            <p>Enter your credentials to access your account</p>
          </div>
          
          <div className="input-group">
            <label style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              Username
              <span style={{ fontSize: "0.75rem", fontWeight: "normal", color: "#888", textTransform: "none" }}>(case sensitive)</span>
            </label>
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
          
          {/* Cloudflare Turnstile Widget Placeholder */}
          <div id="turnstile-container" style={{ display: 'flex', justifyContent: 'center', margin: '0.2rem 0', background: 'transparent', minHeight: '65px' }}></div>

          <button 
            type="submit" 
            className="login-btn"
            disabled={!turnstileToken && import.meta.env.PROD}
          >
            Sign In
          </button>
          
          <div className="login-footer">
            <span>Don't have an account?</span>
            <span className="link-text" onClick={() => navigate("/register")}>Create one now</span>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
