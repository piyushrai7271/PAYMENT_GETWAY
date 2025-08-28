import crypto from "crypto";
import Payment from "../model/payment.model.js";
import { razorpayInstance } from "../config/razorpay.js";
import { key_secret } from "../config/razorpay.js";

// Create payment controller
const createOrder = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "User ID is required" });
    }

    const amount = 1; // Fixed for 1 year premium
    const currency = "INR";

    const options = {
      amount: amount * 100, // in paise
      currency,
      receipt: `receipt_${Date.now()}`,
      notes: {
        userId: userId.toString(),
        purpose: "1 Year Premium Subscription",
      },
    };

    const instance = razorpayInstance();
    const order = await instance.orders.create(options);

    if (!order || !order.id) {
      throw new Error("Razorpay order creation failed");
    }

    await Payment.create({
      userId,
      razorpay_order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      paymentStatus: "Pending",
    });

    return res.status(200).json({
      success: true,
      message: "Payment created successfully !!",
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    console.error("Order Creation Failed:", error);
    return res.status(500).json({
      success: false,
      message: "Order creation failed",
    });
  }
};
// Verifypayment controller
const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    // ✅ Check required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Missing payment details",
      });
    }

    // ✅ Generate signature using HMAC SHA256
    const generatedSignature = crypto
      .createHmac("sha256", key_secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    // ✅ Compare signature
    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid signature",
      });
    }

    // ✅ Update payment status in DB
    const payment = await Payment.findOneAndUpdate(
      { razorpay_order_id },
      {
        razorpay_payment_id,
        razorpay_signature,
        paymentStatus: "Success",
      },
      { new: true }
    );

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment record not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Payment is successfull !!",
      payment,
    });
  } catch (error) {
    console.error("Payment verification failed:", error);
    return res.status(500).json({
      success: false,
      message: "Verification failed",
      error: error.message,
    });
  }
};
// Webhook handler
const razorpayWebhook = async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers["x-razorpay-signature"];

    const payload = JSON.stringify(req.body); // raw body needed for signature validation

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("hex");

    if (signature !== expectedSignature) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid webhook signature" });
    }

    const event = req.body.event;
    const entity = req.body.payload;

    // Handle Razorpay events
    if (event === "payment.captured") {
      const paymentInfo = entity.payment.entity;
      await Payment.findOneAndUpdate(
        { razorpay_order_id: paymentInfo.order_id },
        {
          razorpay_payment_id: paymentInfo.id,
          paymentStatus: "Success",
        }
      );
      console.log("✅ Webhook: Payment Captured");
    }

    if (event === "payment.failed") {
      const paymentInfo = entity.payment.entity;
      await Payment.findOneAndUpdate(
        { razorpay_order_id: paymentInfo.order_id },
        {
          razorpay_payment_id: paymentInfo.id,
          paymentStatus: "Failed",
        }
      );
      console.log("❌ Webhook: Payment Failed");
    }

    if (event === "order.paid") {
      const orderInfo = entity.order.entity;
      await Payment.findOneAndUpdate(
        { razorpay_order_id: orderInfo.id },
        {
          paymentStatus: "Success",
        }
      );
      console.log("📦 Webhook: Order Paid");
    }

    return res.status(200).json({
      success: true,
      message: "Webhook received" 
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal error",
      error:error.message
    });
  }
};

export { createOrder, verifyPayment, razorpayWebhook };
