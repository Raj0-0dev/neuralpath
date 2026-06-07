import express from "express";
import {
  register,
  login,
  googleLogin,
  logout,
  getMe,
} from "../controllers/authController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/google", googleLogin);

// Protected routes
router.post("/logout", protect, logout);
router.get("/me", protect, getMe);

// Example role-restricted routes
router.get("/admin-dashboard", protect, authorize("admin"), (req, res) => {
  res.json({
    success: true,
    message: "Welcome to the admin dashboard!",
    user: req.user,
  });
});

router.get("/employee-portal", protect, authorize("employee", "admin"), (req, res) => {
  res.json({
    success: true,
    message: "Welcome to the employee portal!",
    user: req.user,
  });
});

export default router;
