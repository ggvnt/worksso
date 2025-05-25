import express from "express";
const router = express.Router();

import {
  createService,
  getAllServices,
  updateService,
  deleteService,
  getServiceByCategoryID,
  getServicesByUserId,
  renewService,
  getServiceById,
  markServiceInactive,
} from "../controllers/service.controllers.js";
import { protectRoute } from "../middleware/auth.middleware.js";

router.post("/createService", protectRoute, createService);
router.get("/services", getAllServices);
router.get("/user/:userId", protectRoute, getServicesByUserId);
router.put("/:id", protectRoute, updateService);
router.delete("/:id", protectRoute, deleteService);
router.get("/category/:id", getServiceByCategoryID);
router.put("/renew/:id", protectRoute, renewService); // Add renew route
router.get("/:id", protectRoute, getServiceById)
router.put("/inactive/:id", protectRoute, markServiceInactive);

export default router;
