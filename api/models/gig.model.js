import mongoose from "mongoose";
const { Schema } = mongoose;

const GigSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    desc: {
      type: String,
      required: true,
    },
    // Rating fields
    totalStars: {
      type: Number,
      default: 0,
    },
    starNumber: {
      type: Number,
      default: 0,
    },
    // Campus Marketplace Category
    cat: {
      type: String,
      required: true,
      enum: ['books', 'electronics', 'furniture', 'tutoring', 'assignments', 
             'food', 'design', 'coding', 'essentials', 'services', 'other'],
    },
    // Item condition (for physical items)
    condition: {
      type: String,
      enum: ['new', 'like-new', 'good', 'fair', 'poor'],
      default: 'good',
    },
    // Item type: product (physical) or service
    itemType: {
      type: String,
      enum: ['product', 'service', 'food'],
      default: 'product',
    },
    price: {
      type: Number,
      required: true,
    },
    // Original price for deals
    originalPrice: {
      type: Number,
      required: false,
    },
    cover: {
      type: String,
      required: true,
    },
    images: {
      type: [String],
      required: false,
    },
    // Short display info
    shortTitle: {
      type: String,
      required: false,
    },
    shortDesc: {
      type: String,
      required: false,
    },
    // For services: delivery time in hours
    deliveryTime: {
      type: Number,
      required: false,
    },
    // For food: available hours
    availableHours: {
      start: { type: String, default: '18:00' },
      end: { type: String, default: '02:00' },
    },
    // Revision/policy info
    revisionNumber: {
      type: Number,
      default: 0,
    },
    // Features/tags
    features: {
      type: [String],
      required: false,
    },
    // Location info
    location: {
      hostel: String,
      room: String,
      meetupSpot: String,
    },
    // Sales count
    sales: {
      type: Number,
      default: 0,
    },
    // Availability status
    isActive: {
      type: Boolean,
      default: true,
    },
    // Stock for physical items
    stock: {
      type: Number,
      default: 1,
    },
    codFee: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Gig", GigSchema);