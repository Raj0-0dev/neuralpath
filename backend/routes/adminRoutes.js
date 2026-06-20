import express from "express";
import {
  getEmployees,
  getEmployeeById,
  getCohortAnalytics,
  getRoles,
  createRole,
  deleteRole,
  getResources,
  addResource,
  deleteResource
} from "../controllers/adminController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Apply auth middleware to all admin routes
router.use(protect);
router.use(authorize("admin"));

// Employees / Candidate roster routes
router.get("/employees", getEmployees);
router.get("/employees/:uid", getEmployeeById);

// Cohort Gap Analytics route
router.get("/analytics", getCohortAnalytics);

// Competency Role benchmarks routes
router.get("/roles", getRoles);
router.post("/roles", createRole);
router.delete("/roles/:id", deleteRole);

// Curriculum Study resources routes
router.get("/resources", getResources);
router.post("/resources", addResource);
router.delete("/resources/:id", deleteResource);

export default router;
