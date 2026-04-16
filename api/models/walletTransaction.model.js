import mongoose from "mongoose";
const { Schema } = mongoose;

const WalletTransactionSchema = new Schema(
  {
    senderId: {
      type: String,
      required: true,
      index: true,
    },
    receiverId: {
      type: String,
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 1,
    },
    type: {
      type: String,
      enum: ["send", "receive", "add_money", "refund"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "completed",
    },
    description: {
      type: String,
      required: false,
    },
    referenceId: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("WalletTransaction", WalletTransactionSchema);
