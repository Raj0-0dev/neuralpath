// backend/routes/index.js
import express from "express";

const router = express.Router();

// Root route placeholder
router.get("/", (req, res) => {
  res.json({ 
    message: "Base API router initialized successfully." 
  });
});

export default router;
