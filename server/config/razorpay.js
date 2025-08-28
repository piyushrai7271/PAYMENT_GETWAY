import Razorpay from "razorpay";

const key_id = process.env.TEST_KEY_ID;
const key_secret = process.env.TEST_KEY_SECRET;

const razorpayInstance = () => {
  return new Razorpay({ key_id, key_secret });
};

export { razorpayInstance, key_secret }; // 🔁 export secret for signature verification
