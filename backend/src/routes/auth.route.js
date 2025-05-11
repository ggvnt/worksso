import express from "express";
import {
  login,
  logout,
  signup,
  updateProfile,
  checkAuth,
  verifyEmail,
  forgotPassword,
  resetPassword,
} from "../controllers/auth.controllers.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/verify-email", verifyEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.post("/update-profile", protectRoute, updateProfile);
router.get("/check", protectRoute, checkAuth);
router.put('/:userId', protectRoute, updateProfile);

export default router;
