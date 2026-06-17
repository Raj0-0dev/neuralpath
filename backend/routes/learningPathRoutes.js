import express from "express";
import { getUserLearningPath, completeModule } from "../controllers/learningPathController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getUserLearningPath);
router.post("/complete", protect, completeModule);

export default router;
