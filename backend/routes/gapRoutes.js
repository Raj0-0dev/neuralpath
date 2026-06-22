import express from "express";
import { getUserGapAnalysis, getCustomGapAnalysis, getActiveRoles } from "../controllers/gapController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/my-profile", protect, getUserGapAnalysis);
router.post("/custom", protect, getCustomGapAnalysis);
router.get("/roles", protect, getActiveRoles);

export default router;
