import express from "express";
import { 
  getUserWallet, 
  getWatchlist, 
  addToWatchlist, 
  removeFromWatchlist 
} from "../controllers/userController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/wallet", protect, getUserWallet);

// Watchlist routes
router.get("/watchlist", protect, getWatchlist);
router.post("/watchlist", protect, addToWatchlist);
router.delete("/watchlist/:symbol", protect, removeFromWatchlist);

export default router;