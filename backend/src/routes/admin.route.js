import express from "express";
import { protectRoute, adminOnly } from "../middleware/auth.middleware.js";

import {
  adminDashboard,
  getAllUsers,
  deleteUser,
  getAllServicesForAdmin,
  adminDeleteService,
} from "../controllers/admin.controllers.js";


const router = express.Router();

router.get("/dashboard", protectRoute, adminOnly, adminDashboard);
router.get("/users", protectRoute, adminOnly, getAllUsers);
router.delete("/user/:id", protectRoute, adminOnly, deleteUser);
router.get("/allServices", protectRoute,adminOnly, getAllServicesForAdmin);
router.delete("/:id", protectRoute,adminOnly, adminDeleteService);

export default router;
