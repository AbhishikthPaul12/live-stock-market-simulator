import express from "express";
import { getUserWallet } from "../controllers/userController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/wallet", protect, getUserWallet);

export default router;