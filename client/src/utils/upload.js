import axios from "axios";

const upload = async (file) => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "campcart";

  // Debug logging
  console.log("Cloudinary Config:", {
    cloudName: cloudName || "NOT SET",
    uploadPreset,
    hasFile: !!file,
    fileName: file?.name
  });

  if (!cloudName || cloudName === "your_cloud_name") {
    throw new Error(
      "Cloudinary Cloud Name not configured. " +
      "Please add VITE_CLOUDINARY_CLOUD_NAME to your .env file and restart the dev server."
    );
  }

  const data = new FormData();
  data.append("file", file);
  data.append("upload_preset", uploadPreset);

  try {
    const res = await axios.post(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, data);
    const { url } = res.data;
    return url;
  } catch (err) {
    console.log("Cloudinary Upload Error:", err);
    
    // Provide helpful error message based on error type
    if (err.response?.status === 400) {
      const errorMsg = err.response?.data?.error?.message || "";
      
      if (errorMsg.includes("upload preset")) {
        throw new Error(
          "Cloudinary upload preset 'campcart' not found. Please create it in your Cloudinary dashboard with 'Unsigned uploads' enabled."
        );
      } else if (errorMsg.includes("unsigned")) {
        throw new Error(
          "Unsigned uploads not enabled for preset 'campcart'. Please enable it in Cloudinary settings."
        );
      } else if (errorMsg.includes("file")) {
        throw new Error("Invalid file. Please check file size (max 10MB) and format (jpg, png, webp).");
      } else {
        throw new Error(`Cloudinary upload failed: ${errorMsg || "Invalid request"}`);
      }
    }
    
    if (err.response?.status === 401) {
      throw new Error("Cloudinary authentication failed. Please check your cloud name configuration.");
    }
    
    throw new Error("Image upload failed. Please try again or check your internet connection.");
  }
};

export default upload;
