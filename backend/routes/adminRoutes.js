import express from "express";
import {
  getEmployees,
  getEmployeeById,
  getCohortAnalytics,
  getRoles,
  createRole,
  deleteRole,
  updateRole,
  getResources,
  addResource,
  deleteResource
} from "../controllers/adminController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.use(authorize("admin"));

router.get("/employees", getEmployees);
router.get("/employees/:uid", getEmployeeById);

router.get("/analytics", getCohortAnalytics);

router.get("/roles", getRoles);
router.post("/roles", createRole);
router.put("/roles/:id", updateRole);
router.delete("/roles/:id", deleteRole);

router.get("/resources", getResources);
router.post("/resources", addResource);
router.delete("/resources/:id", deleteResource);

export default router;
