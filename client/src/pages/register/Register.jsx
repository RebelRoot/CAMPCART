import React, { useState } from "react";
import upload from "../../utils/upload";
import "./Register.scss";
import newRequest from "../../utils/newRequest";
import { useNavigate } from "react-router-dom";
import UniversitySelector from "../../components/universitySelector/UniversitySelector";

function Register() {
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState({
    username: "",
    email: "",
    password: "",
    img: "",
    gender: "",
    state: "",
    hostel: "",
    phone: "",
    studentId: "",
    isSeller: false,
    vpa: "",
    desc: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setUser((prev) => {
      return { ...prev, [e.target.name]: e.target.value };
    });
  };

  const handleSeller = (e) => {
    setUser((prev) => {
      return { ...prev, isSeller: e.target.checked };
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let url = "";
      if (file) {
        url = await upload(file);
      }
      
      await newRequest.post("/auth/register", {
        ...user,
        img: url,
      });
      navigate("/");
    } catch (err) {
      console.error("Register error:", err);
      if (err.response?.data) {
        setError(err.response.data);
      } else if (err.request) {
        setError("Network error. Please check your connection.");
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="register">
      <div className="register-card">
        <form onSubmit={handleSubmit}>
          <div className="header">
            <h1>Join GigMart</h1>
            <p>Start buying and selling with fellow students today</p>
          </div>

          <div className="form-content">
            <div className="section left">
              <h2>Basic Information</h2>
              
              <div className="input-group">
                <label>Username</label>
                <input
                  name="username"
                  type="text"
                  placeholder="e.g. johndoe"
                  onChange={handleChange}
                  required
                  autoFocus
                />
              </div>

              <div className="input-group">
                <label>Email Address</label>
                <input
                  name="email"
                  type="email"
                  placeholder="yourname@college.edu"
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="input-group">
                <label>Password</label>
                <div className="password-input">
                  <input 
                    name="password" 
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    onChange={handleChange} 
                    required
                  />
                  <span className="toggle-v" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? "Hide" : "Show"}
                  </span>
                </div>
              </div>

              <div className="input-group">
                <label>Profile Picture</label>
                <input 
                  type="file" 
                  className="file-input"
                  onChange={(e) => setFile(e.target.files[0])} 
                />
              </div>

              <div className="input-group">
                <label>College/University</label>
                <UniversitySelector
                  value={user.college}
                  onChange={(val) => setUser(prev => ({ ...prev, college: val }))}
                  placeholder="Search for your university..."
                />
              </div>

              <div className="row">
                <div className="input-group">
                  <label>Gender</label>
                  <select name="gender" onChange={handleChange}>
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="input-group">
                  <label>State</label>
                  <select name="state" onChange={handleChange}>
                    <option value="">Select</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Rajasthan">Rajasthan</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="section right">
              <h2>Account Details</h2>
              
              <div className="seller-toggle-box">
                <div className="toggle-info">
                  <h3>Become a Seller</h3>
                  <p>Check this to list items and services</p>
                </div>
                <label className="switch">
                  <input type="checkbox" onChange={handleSeller} />
                  <span className="slider round"></span>
                </label>
              </div>

              <div className="input-group">
                <label>Phone Number</label>
                <input
                  name="phone"
                  type="text"
                  placeholder="+91 0000 0000 00"
                  onChange={handleChange}
                />
              </div>

              {user.isSeller && (
                <div className="input-group">
                  <label>UPI ID (for payments)</label>
                  <input
                    name="vpa"
                    type="text"
                    placeholder="username@upi"
                    onChange={handleChange}
                    required
                  />
                </div>
              )}

              <div className="input-group">
                <label>Hostel/Room (optional)</label>
                <input
                  name="hostel"
                  type="text"
                  placeholder="e.g. Block B, 402"
                  onChange={handleChange}
                />
              </div>

              <div className="input-group">
                <label>About You</label>
                <textarea
                  placeholder="Tell us a little about yourself..."
                  name="desc"
                  rows="4"
                  onChange={handleChange}
                ></textarea>
              </div>
            </div>
          </div>

          <div className="footer-actions">
            {error && <div className="error-msg">{error}</div>}
            <button type="submit" className="register-btn" disabled={loading}>
              {loading ? "Creating Account..." : "Create Account"}
            </button>
            <p className="login-link">
              Already have an account? <span onClick={() => navigate("/login")}>Sign In</span>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register;
