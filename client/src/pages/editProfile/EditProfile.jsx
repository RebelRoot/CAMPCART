import React, { useState } from "react";
import "./EditProfile.scss";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";
import getCurrentUser from "../../utils/getCurrentUser.js";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import upload from "../../utils/upload";
import UniversitySelector from "../../components/universitySelector/UniversitySelector";

function EditProfile() {
  const currentUser = getCurrentUser();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    desc: currentUser?.desc || "",
    college: currentUser?.college || "",
    hostel: currentUser?.hostel || "",
    phone: currentUser?.phone || "",
    vpa: currentUser?.vpa || "",
    gender: currentUser?.gender || "",
    state: currentUser?.state || "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const url = await upload(file);
      setFormData({ ...formData, img: url });
      toast.success("Image uploaded successfully!");
    } catch (err) {
      toast.error("Image upload failed!");
      console.log(err);
    }
    setUploading(false);
  };

  const mutation = useMutation({
    mutationFn: (updatedData) => {
      return newRequest.put(`/users/${currentUser._id}`, updatedData);
    },
    onSuccess: (res) => {
      // Update localStorage with new user data
      localStorage.setItem("currentUser", JSON.stringify(res.data));
      queryClient.invalidateQueries(["user", currentUser._id]);
      toast.success("Profile updated successfully!");
      setTimeout(() => navigate("/"), 1500);
    },
    onError: (err) => {
      toast.error(err?.response?.data || "Failed to update profile");
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (file && !formData.img) {
      toast.error("Please upload the image first");
      return;
    }
    await mutation.mutateAsync(formData);
  };

  return (
    <div className="editProfile">
      <ToastContainer position="top-center" />
      <div className="container">
        <h1>Edit Profile</h1>


        <form onSubmit={handleSubmit}>
          <div className="left">
            <label>Profile Picture</label>
            <div className="imgPreview">
              <img 
                src={formData.img || currentUser?.img || "https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=100"} 
                alt="Profile" 
              />
            </div>
            <input 
              type="file" 
              onChange={(e) => setFile(e.target.files[0])} 
            />
            <button 
              type="button" 
              onClick={handleUpload} 
              disabled={!file || uploading}
            >
              {uploading ? "Uploading..." : "Upload Image"}
            </button>

            <label>Description</label>
            <textarea
              name="desc"
              value={formData.desc}
              onChange={handleChange}
              placeholder="Tell others about yourself..."
              rows="6"
            />
          </div>

          <div className="right">
            <label>Username</label>
            <input 
              type="text" 
              value={currentUser?.username} 
              disabled 
              className="disabled"
            />

            <label>Email</label>
            <input 
              type="email" 
              value={currentUser?.email} 
              disabled 
              className="disabled"
            />

            <label>College/University</label>
            <UniversitySelector
              value={formData.college}
              onChange={(val) => setFormData(prev => ({ ...prev, college: val }))}
              placeholder="Search for your college/university..."
            />

            <label>Hostel/Location</label>
            <input
              type="text"
              name="hostel"
              value={formData.hostel}
              onChange={handleChange}
              placeholder="e.g. Hostel 5, Room 302"
            />

            <label>Gender</label>
            <select name="gender" value={formData.gender} onChange={handleChange}>
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>

            <label>State</label>
            <select name="state" value={formData.state} onChange={handleChange}>
              <option value="">Select State</option>
              <option value="Andhra Pradesh">Andhra Pradesh</option>
              <option value="Bihar">Bihar</option>
              <option value="Delhi">Delhi</option>
              <option value="Gujarat">Gujarat</option>
              <option value="Karnataka">Karnataka</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Rajasthan">Rajasthan</option>
              <option value="Uttar Pradesh">Uttar Pradesh</option>
              <option value="West Bengal">West Bengal</option>
              <option value="Other">Other</option>
            </select>

            <label>Phone Number</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="e.g. +91 98765 43210"
            />

            {currentUser.isSeller && (
              <>
                <label>UPI ID (for receiving payments)</label>
                <input
                  type="text"
                  name="vpa"
                  value={formData.vpa}
                  onChange={handleChange}
                  placeholder="e.g. username@upi"
                />
              </>
            )}

            <button type="submit" disabled={mutation.isLoading}>
              {mutation.isLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProfile;
