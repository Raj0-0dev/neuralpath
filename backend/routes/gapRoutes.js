import express from "express";
import { getUserGapAnalysis, getCustomGapAnalysis } from "../controllers/gapController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/gap-analysis/my-profile
router.get("/my-profile", protect, getUserGapAnalysis);

// POST /api/gap-analysis/custom
router.post("/custom", protect, getCustomGapAnalysis);

export default router;
