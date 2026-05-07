import express from "express";
import { getAlerts, createAlert, deleteAlert } from "../controllers/alertController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getAlerts);
router.post("/", protect, createAlert);
router.delete("/:id", protect, deleteAlert);

export default router;