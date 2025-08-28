import express from "express";
import {
  createOrder,
  verifyPayment,
  razorpayWebhook,
} from "../controllers/payment.controller.js";
import {userAuth} from "../middlewares/userAuth.middleware.js";


const router = express.Router();

// Authenticated
router.post("/create-payment", userAuth, createOrder);
router.post("/verify-payment", userAuth, verifyPayment);

// 🪝 Razorpay Webhook route — No Auth
router.post(
  "/razorpay-webhook",
  express.raw({ type: "application/json" }),
  razorpayWebhook
);

export default router;
