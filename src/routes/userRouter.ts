import { Router } from "express";
const router = Router();
import {
  login,
  logout,
  updateProfile,
  signup,
  verifyOtp,
  requestOTP,
  verifyOTPassword,
} from "../controllers/userController";
import { authenticateToken } from "../middlewares/JWTtoken";

router.post("/login", login);
router.post("/sign-up", signup);
router.post("/verify-otp", verifyOtp);
router.get("/logout", authenticateToken, logout);
router.patch("/profile", authenticateToken, updateProfile);
router.post('/request-otp', requestOTP);
router.post('/verify-otPassword', verifyOTPassword);

export default router;
