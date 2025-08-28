import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
    },
    razorpay_order_id: {
      type: String,
      required: true,
      trim: true,
    },
    razorpay_payment_id: {
      type: String,
      trim: true,
    },
    razorpay_signature: {
      type: String,
      trim: true,
    },
    amount: {
      type: Number, // stored in paise (₹1 = 100)
      required: true,
      min: 100, // optional: prevent zero/invalid charges
    },
    currency: {
      type: String,
      default: "INR",
      uppercase: true,
      enum: ["INR"],
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Success", "Failed"],
      default: "Pending",
    },
    isRefunded: {
      type: Boolean,
      default: false,
    },
    refundReason: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;
