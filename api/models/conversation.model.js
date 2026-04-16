import mongoose from "mongoose";
const { Schema } = mongoose;

const ConversationSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    sellerId: {
      type: String,
      required: true,
    },
    buyerId: {
      type: String,
      required: true,
    },
    readBySeller: {
      type: Boolean,
      required: true,
    },
    readByBuyer: {
      type: Boolean,
      required: true,
    },
    lastMessage: {
      type: String,
      required: false,
    },
    // Payment Proof Data
    proof: {
      screenshot: {
        type: String,
        required: false,
      },
      utr: {
        type: String,
        required: false,
      },
      submittedAt: {
        type: Date,
        required: false,
      },
      status: {
        type: String,
        enum: ['pending', 'verified', 'rejected'],
        default: 'pending',
      },
    },
    // Chat Access Control
    chatAccess: {
      // Who can initiate/send messages
      buyerCanMessage: {
        type: Boolean,
        default: false, // Buyer cannot message until seller allows
      },
      sellerCanMessage: {
        type: Boolean,
        default: true,
      },
      // Time window for chat
      chatOpenAt: {
        type: Date,
        required: false,
      },
      chatCloseAt: {
        type: Date,
        required: false,
      },
      // Duration in minutes that chat stays open after seller enables it
      durationMinutes: {
        type: Number,
        default: 60,
      },
    },
    // Pre-built messages/templates
    templates: {
      type: [String],
      default: [
        "✅ Payment verified! Processing your order now.",
        "📦 Your item has been dispatched.",
        "⏰ I'll be available for chat in 10 minutes.",
        "❌ Payment not received. Please check and try again.",
      ],
    },
    // Order reference
    orderId: {
      type: String,
      required: false,
    },
    gigId: {
      type: String,
      required: false,
    },
    // Conversation status
    status: {
      type: String,
      enum: ['active', 'paused', 'completed', 'disputed'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Conversation", ConversationSchema);