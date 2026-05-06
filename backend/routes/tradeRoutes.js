import express from "express";
import { buyStock, sellStock, getTransactions } from "../controllers/tradeController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/buy", protect, buyStock);
router.post("/sell", protect, sellStock);
router.get("/transactions", protect, getTransactions);

export default router;  