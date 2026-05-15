import express from "express";
import {
  registerUser,
  loginUser,
  getUserProfile,
  forgotPassword,
  verifyResetToken,
  resetPassword,
  guestLogin,
  resetGuestData
} from "../controllers/authController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", protect, getUserProfile);
router.post("/forgot-password", forgotPassword);
router.post("/verify-token", verifyResetToken);
router.post("/reset-password", resetPassword);
router.post("/guest-login", guestLogin);
router.post("/reset-guest", protect, resetGuestData);

export default router;