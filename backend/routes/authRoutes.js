import express from "express";
import {
  registerUser,
  loginUser,
  getUserProfile,
  forgotPassword,
  verifyOTP,
  resetPassword,
  resendOTP,
  guestLogin,
  resetGuestData
} from "../controllers/authController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", protect, getUserProfile);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOTP);
router.post("/reset-password", resetPassword);
router.post("/resend-otp", resendOTP);
router.post("/guest-login", guestLogin);
router.post("/reset-guest", protect, resetGuestData);

export default router;