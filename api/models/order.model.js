import mongoose from "mongoose";
const { Schema } = mongoose;

const OrderSchema = new Schema(
  {
    gigId: {
      type: String,
      required: true,
    },
    img: {
      type: String,
      required: false,
    },
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    sellerId: {
      type: String,
      required: true,
    },
    buyerId: {
      type: String,
      required: true,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    paymentMethod: {
      type: String,
      enum: ["prepaid", "cod"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending_payment", "pending_confirmation", "processing", "shipped", "completed", "cancelled"],
      default: "pending_payment",
    },
    shippedAt: {
      type: Date,
      required: false,
    },
    completedAt: {
      type: Date,
      required: false,
    },
    completedBy: {
      type: String,
      enum: ["seller", "buyer"],
      required: false,
    },
    billGenerated: {
      type: Boolean,
      default: false,
    },
    billData: {
      type: Schema.Types.Mixed,
      required: false,
    },
    payment_intent: {
      type: String,
      required: false,
    },
    invoiceUrl: {
      type: String,
      required: false,
    },
    paymentReference: {
      type: String,
      required: false,
    },
    paymentScreenshot: {
      type: String,
      required: false,
    },
    isUserConfirmed: {
      type: Boolean,
      default: false,
    },
    deliveryTimeline: {
      type: String,
      required: false,
    },
    lateCharge: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Order", OrderSchema);