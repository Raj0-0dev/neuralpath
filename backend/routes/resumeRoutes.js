import express from "express";
import { uploadResume, getActiveResume } from "../controllers/resumeController.js";
import { uploadResumeMiddleware } from "../middleware/uploadMiddleware.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/upload", protect, uploadResumeMiddleware, uploadResume);
router.get("/active", protect, getActiveResume);

export default router;
