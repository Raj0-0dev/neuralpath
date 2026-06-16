import express from "express";
import { uploadResume } from "../controllers/resumeController.js";
import { uploadResumeMiddleware } from "../middleware/uploadMiddleware.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// POST /api/resumes/upload
// Note: Includes 'protect' middleware. If you want this endpoint to be public, remove 'protect'.
router.post("/upload", protect, uploadResumeMiddleware, uploadResume);

export default router;
