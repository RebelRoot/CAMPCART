import mongoose from "mongoose";
const { Schema } = mongoose;

const schemeSchema = new Schema({
  id: {
    type: Number,
    unique: true,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['Scheme', 'Exam'],
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  focus: {
    type: String,
    required: true,
  },
  reward: {
    type: String,
    required: true,
  },
  eligibility: {
    type: String,
    required: true,
  },
  link: {
    type: String,
    required: true,
  },
  tags: {
    type: [String],
    default: [],
  },
  deadline: {
    type: String,
    default: "Open",
  },
  eligibleYears: {
    type: String,
    default: "Common",
  },
  matchCriteria: {
    state: { type: String, default: 'All' },
    gender: { type: String, default: 'All' },
    affiliation: { type: String },
  },
}, {
  timestamps: true
});

export default mongoose.model("Scheme", schemeSchema);
