import React, { useReducer, useState } from "react";
import "./Add.scss";
import { gigReducer, INITIAL_STATE } from "../../reducers/gigReducer";
import upload from "../../utils/upload";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import getCurrentUser from "../../utils/getCurrentUser.js";

const Add = () => {
  const currentUser = getCurrentUser();
  const [singleFile, setSingleFile] = useState(undefined);
  const [files, setFiles] = useState([]);
  const [coverPreview, setCoverPreview] = useState(null);
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [state, dispatch] = useReducer(gigReducer, INITIAL_STATE);

  const handleChange = (e) => {
    dispatch({
      type: "CHANGE_INPUT",
      payload: { name: e.target.name, value: e.target.value },
    });
  };
  const handleFeature = (e) => {
    e.preventDefault();
    dispatch({
      type: "ADD_FEATURE",
      payload: e.target[0].value,
    });
    e.target[0].value = "";
  };

  const handleUpload = async () => {
    if (!singleFile) {
      toast.error('❌ Please select a Main Display Thumbnail first!');
      return;
    }

    setUploading(true);
    try {
      const cover = await upload(singleFile);
  
      const images = files.length > 0 ? await Promise.all(
        [...files].map(async (file) => {
          const url = await upload(file);
          return url;
        })
      ) : [];

      toast.success('🚀 Images uploaded successfully!');
      dispatch({ type: "ADD_IMAGES", payload: { cover, images } });
    } catch (err) {
      const errorMsg = err.message || err.response?.data?.error?.message || "Upload failed. Check Cloudinary preset or file size.";
      toast.error(`❌ ${errorMsg}`);
      console.log("Cloudinary Upload Error:", err);
    }
    setUploading(false);
  };
  
  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSingleFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleGalleryChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
    const previews = selectedFiles.map(file => URL.createObjectURL(file));
    setGalleryPreviews(previews);
  };

  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (gig) => {
      return newRequest.post("/gigs", gig);
    },
    onSuccess: () => {
      // Invalidate all gig-related queries
      queryClient.invalidateQueries(["myGigs"]);
      queryClient.invalidateQueries(["gigs"]);
      queryClient.invalidateQueries(["newGigs"]);
      queryClient.invalidateQueries(["featuredGigs"]);
    },
    onError: (error) => {
      console.error("Mutation error:", error);
      const errorMsg = error?.response?.data || error?.message || "Failed to create listing";
      toast.error(errorMsg);
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!state.title || !state.desc || !state.price || !state.cat) {
      toast.error('Please fill in all required fields (Title, Description, Price, Category)');
      return;
    }
    
    if (!state.cover) {
      toast.error('Please upload a cover image first');
      return;
    }
    
    setSubmitting(true);
    
    try {
      await mutation.mutateAsync(state);
      toast.success('Gig successfully created!');
      navigate('/mygigs');
    } catch (error) {
      console.error("Create gig error:", error);
    } finally {
      setSubmitting(false);
    }
  };
  
  

  return (
    <div className="add">
      <ToastContainer position="top-center"/>
      <div className="container">
        {!currentUser?.vpa && (
           <div className="payment-warning">
              <h3>⚠️ Payment Setup Required</h3>
              <p>You must set your <strong>UPI ID</strong> in your profile settings before you can post a Gig. This ensures you can receive payments directly and for free.</p>
              <button className="settings-btn" onClick={() => navigate("/profile")}>Go to Profile Settings</button>
           </div>
        )}
        <h1>Add New Gig</h1>
        <div className="sections">
          <div className="info">
            <label htmlFor="">Title</label>
            <input
              type="text"
              name="title"
              placeholder="e.g. I will do something I'm really good at"
              onChange={handleChange}
            />
            <label htmlFor="">Category</label>
            <select name="cat" id="cat" onChange={handleChange}>
              <option value="books">Used Books & Notes</option>
              <option value="electronics">Electronics & Gadgets</option>
              <option value="furniture">Furniture</option>
              <option value="tutoring">Tutoring & Academic Help</option>
              <option value="assignments">Assignments & Projects</option>
              <option value="food">Late Night Food</option>
              <option value="design">Design Help</option>
              <option value="coding">Coding Help</option>
              <option value="essentials">Hostel Essentials</option>
              <option value="services">Other Services</option>
            </select>
            <label htmlFor="">Item Type</label>
            <select name="itemType" id="itemType" onChange={handleChange}>
              <option value="product">Physical Product</option>
              <option value="service">Service</option>
              <option value="food">Food Delivery</option>
            </select>
            <label htmlFor="">Condition</label>
            <select name="condition" id="condition" onChange={handleChange}>
              <option value="new">Brand New</option>
              <option value="like-new">Like New</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
              <option value="poor">Poor</option>
            </select>
            <div className="image-sections">
              <div className="upload-zone primary">
                <div className="label-group">
                  <label>✨ Main Display Thumbnail</label>
                  <p>This is the first image buyers see in the marketplace.</p>
                </div>
                <div className="upload-card">
                  {coverPreview ? (
                    <div className="preview-box main">
                      <img src={coverPreview} alt="cover preview" />
                      <button className="remove-tag" onClick={() => {setCoverPreview(null); setSingleFile(undefined)}}>Change</button>
                    </div>
                  ) : (
                    <label className="drop-box">
                      <span className="icon">🖼️</span>
                      <span>Click to select Thumbnail</span>
                      <input
                        type="file"
                        onChange={handleCoverChange}
                        hidden
                      />
                    </label>
                  )}
                </div>
              </div>

              <div className="upload-zone secondary">
                <div className="label-group">
                  <label>📸 Additional Gallery Photos</label>
                  <p>Add more angles or details (Optional).</p>
                </div>
                <div className="gallery-grid">
                  {galleryPreviews.map((url, i) => (
                    <div key={i} className="gallery-preview">
                      <img src={url} alt={`gallery ${i}`} />
                    </div>
                  ))}
                  {galleryPreviews.length < 4 && (
                    <label className="add-more">
                      <span>+ Add</span>
                      <input
                        type="file"
                        multiple
                        onChange={handleGalleryChange}
                        hidden
                      />
                    </label>
                  )}
                </div>
              </div>

              <button 
                type="button"
                className={`upload-all-btn ${state.cover ? 'finished' : ''}`}
                onClick={handleUpload} 
                disabled={uploading}
              >
                {uploading ? "Uploading to Cloud..." : state.cover ? "✅ Staged & Ready" : "☁️ Upload selected images"}
              </button>
            </div>
            <label htmlFor="">Description</label>
            <textarea
              name="desc"
              id=""
              placeholder="Brief descriptions to introduce your service to customers"
              cols="0"
              rows="16"
              onChange={handleChange}
            ></textarea>
            <button onClick={handleSubmit} disabled={submitting || !currentUser?.vpa}>
              {!currentUser?.vpa ? "Setup UPI to Create" : submitting ? "Creating..." : "Create"}
            </button>
          </div>
          <div className="details">
            <label htmlFor="">Service Title</label>
            <input
              type="text"
              name="shortTitle"
              placeholder="e.g. One-page web design"
              onChange={handleChange}
            />
            <label htmlFor="">Short Description</label>
            <textarea
              name="shortDesc"
              onChange={handleChange}
              id=""
              placeholder="Short description of your service"
              cols="30"
              rows="10"
            ></textarea>
            <label htmlFor="">Delivery/Response Time (hours)</label>
            <input type="number" name="deliveryTime" onChange={handleChange} placeholder="e.g. 24 for 1 day" />
            <label htmlFor="">Stock/Quantity</label>
            <input type="number" name="stock" onChange={handleChange} defaultValue="1" />
            <label htmlFor="">Revision Number</label>
            <input
              type="number"
              name="revisionNumber"
              onChange={handleChange}
            />
            <label htmlFor="">Add Features</label>
            <form action="" className="add" onSubmit={handleFeature}>
              <input type="text" placeholder="e.g. page design" />
              <button type="submit">add</button>
            </form>
            <div className="addedFeatures">
              {state?.features?.map((f) => (
                <div className="item" key={f}>
                  <button
                    onClick={() =>
                      dispatch({ type: "REMOVE_FEATURE", payload: f })
                    }
                  >
                    {f}
                    <span>X</span>
                  </button>
                </div>
              ))}
            </div>
            <label htmlFor="">Price</label>
            <input type="number" onChange={handleChange} name="price" />
            <label htmlFor="">COD Fee (optional late charge)</label>
            <input type="number" onChange={handleChange} name="codFee" placeholder="e.g. 5" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Add;