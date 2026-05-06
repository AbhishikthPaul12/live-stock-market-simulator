import express from "express";
import { getStockBySymbol, getStockHistory, getAllStocks } from "../controllers/stockController.js";

const router = express.Router();

router.get("/all", getAllStocks);
router.get("/:symbol", getStockBySymbol);
router.get("/:symbol/history", getStockHistory);

export default router;