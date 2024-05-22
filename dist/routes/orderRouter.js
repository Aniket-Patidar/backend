"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const orderController_1 = require("../controllers/orderController");
const express_1 = require("express");
const JWTtoken_1 = require("../middlewares/JWTtoken");
const adminJwt_1 = require("../middlewares/adminJwt");
const razorpay_1 = __importDefault(require("razorpay"));
const router = (0, express_1.Router)();
// Create a new order
router.post("/", JWTtoken_1.authenticateToken, orderController_1.createOrder);
// Get all orders
router.get("/", JWTtoken_1.authenticateToken, orderController_1.getAllOrders);
// Get a single order by ID
router.get("/:orderId", JWTtoken_1.authenticateToken, orderController_1.getOrderById);
router.put("/", adminJwt_1.isAdmin, orderController_1.updateOrder);
/* ----- */
const crypto_1 = __importDefault(require("crypto"));
const instance = new razorpay_1.default({
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
    const hmac = crypto_1.default.createHmac('sha256', key_secret);
    hmac.update(order_id + '|' + payment_id);
    const generated_signature = hmac.digest('hex');
    if (razorpay_signature === generated_signature) {
        res.json({ success: true, message: 'Payment has been verified' });
    }
    else {
        res.json({ success: false, message: 'Payment verification failed' });
    }
});
/* ------ */
exports.default = router;
