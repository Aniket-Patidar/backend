import express from "express";
import {
  ValidateOrder,
  createOrder,
  getAllOrders,
  getOrderById,
  order,
  updateOrder,
} from "../controllers/orderController";

import { Router } from "express";
import { authenticateToken } from "../middlewares/JWTtoken";
import { isAdmin } from "../middlewares/adminJwt";
import Razorpay from "razorpay";
const router = Router();

// Create a new order
router.post("/", authenticateToken, createOrder);

// Get all orders
router.get("/", authenticateToken, getAllOrders);

// Get a single order by ID
router.get("/:orderId", authenticateToken, getOrderById);

router.put("/", isAdmin, updateOrder);

/* ----- */
import crypto from "crypto";

const instance = new Razorpay({
  key_id: 'rzp_test_G9Zu46fyDawOPx',
  key_secret: '06IYyrAM0zhT4E70ElIZ88Tc',
});

router.post('/createOrder', (req, res) => {
  const { amount, currency, receipt } = req.body;
  if (!amount || !currency || !receipt) {
    return res.status(400).json({ success: false, message: 'Invalid request data' });
  }
  instance.orders.create({ amount, currency, receipt }, (err, order) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Failed to create order', error: err });
    }
    res.json({ success: true, order });
  });
});

router.post('/verifyOrder', (req, res) => {
  const { order_id, payment_id } = req.body;
  const razorpay_signature = req.headers['x-razorpay-signature'];
  const key_secret = '06IYyrAM0zhT4E70ElIZ88Tc'; // Update with your actual Razorpay secret key
  const hmac = crypto.createHmac('sha256', key_secret);
  hmac.update(order_id + '|' + payment_id);
  const generated_signature = hmac.digest('hex');
  if (razorpay_signature === generated_signature) {
    res.json({ success: true, message: 'Payment has been verified' });
  } else {
    res.json({ success: false, message: 'Payment verification failed' });
  }
});

/* ------ */


export default router;
