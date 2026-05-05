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

  // Resolve sitekey — DEV always uses the test key, PROD uses the env var
  const sitekey = import.meta.env.DEV
    ? '1x00000000000000000000AA'
    : (import.meta.env.VITE_TURNSTILE_SITEKEY || '');

  const turnstileEnabled = Boolean(sitekey);

  React.useEffect(() => {
    if (!turnstileEnabled) {
      // No sitekey configured — skip widget, allow form to submit freely
      setTurnstileToken('bypass');
      return;
    }

    window.onTurnstileSuccess = (token) => setTurnstileToken(token);
    window.onTurnstileExpire = () => setTurnstileToken("");
    window.onTurnstileError = (code) => console.error('Turnstile Error:', code);

    let checkInterval = setInterval(() => {
      if (window.turnstile && document.getElementById('turnstile-container')) {
        clearInterval(checkInterval);
        try {
          window.turnstile.render('#turnstile-container', {
            sitekey,
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
  }, [turnstileEnabled]);

  return (
    <div className="login">
      <div className="login-visual">
        <div className="visual-content">
          <div className="logo">CampCart<span className="dot">.</span></div>
          <h2>Welcome back to your campus marketplace</h2>
          <p>Join thousands of students buying, selling, and connecting every day.</p>
          <div className="stats-row">
            <div className="stat"><strong>2,400+</strong><span>Active Sellers</span></div>
            <div className="stat"><strong>50+</strong><span>Campuses</span></div>
            <div className="stat"><strong>4.9</strong><span>Avg Rating</span></div>
          </div>
        </div>
      </div>
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
          
          {/* Cloudflare Turnstile Widget — only shown when sitekey is configured */}
          {turnstileEnabled && (
            <div id="turnstile-container" style={{ display: 'flex', justifyContent: 'center', margin: '0.2rem 0', background: 'transparent', minHeight: '65px' }}></div>
          )}

          <button 
            type="submit" 
            className="login-btn"
            disabled={turnstileEnabled && !turnstileToken}
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
