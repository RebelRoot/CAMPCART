import mongoose from "mongoose";
const { Schema } = mongoose;

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  img: {
    type: String,
    required: false,
  },
  college: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: false,
  },
  state: {
    type: String,
    required: false,
  },
  affiliation: {
    type: String,
    required: false,
  },
  hostel: {
    type: String,
    required: false,
  },
  phone: {
    type: String,
    required: false,
  },
  desc: {
    type: String,
    required: false,
  },
  isSeller: {
    type: Boolean,
    default: false,
  },
  // Student verification
  studentId: {
    type: String,
    required: false,
  },
  // Role-based fields
  role: {
    type: String,
    enum: ['buyer', 'seller', 'giga', 'root', 'admin'],
    default: 'buyer',
  },
  // Seller stats
  totalSales: {
    type: Number,
    default: 0,
  },
  rating: {
    type: Number,
    default: 0,
  },
  ratingCount: {
    type: Number,
    default: 0,
  },
  // Verification status
  isVerified: {
    type: Boolean,
    default: false,
  },
  isVerifiedStore: {
    type: Boolean,
    default: false,
  },
  storeName: {
    type: String,
    required: false,
  },
  storeDescription: {
    type: String,
    required: false,
  },
  storeBanner: {
    type: String,
    required: false,
  },
  vpa: {
    type: String,
    required: false,
  },
  campCash: {
    type: Number,
    default: 0,
    min: 0,
  },
},{
  timestamps:true
});

export default mongoose.model("User", userSchema)