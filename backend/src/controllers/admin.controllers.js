import User from "../models/user.model.js";
import Service from "../models/service.model.js";
import cloudinary from "../lib/cloudinary.js";
import mongoose from "mongoose";

/**
 * @desc Admin Dashboard
 * @route GET /api/admin/dashboard
 * @access Admin Only
 */
export const adminDashboard = (req, res) => {
  res.status(200).json({ message: "Welcome Admin! This is the dashboard." });
};

/**
 * @desc Get All Users
 * @route GET /api/admin/users
 * @access Admin Only
 */
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password"); // Get all users, exclude passwords
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * @desc Delete a User
 * @route DELETE /api/admin/user/:id
 * @access Admin Only
 */
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get all services (admin only)
export const getAllServicesForAdmin = async (req, res) => {
  try {
    const services = await Service.find()
      .populate("userId", "fullName email")
      .sort({ createdAt: -1 });

    res.status(200).json(services);
  } catch (error) {
    console.error("Error in getAllServicesForAdmin:", error.message);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Admin delete service
export const adminDeleteService = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await Service.findByIdAndDelete(id);
    
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    // Delete images from Cloudinary if they exist
    if (service.images && service.images.length > 0) {
      await Promise.all(
        service.images.map(async (imageUrl) => {
          const publicId = imageUrl.split("/").pop().split(".")[0];
          await cloudinary.uploader.destroy(`services/${publicId}`);
        })
      );
    }

    res.status(200).json({ message: "Service deleted successfully" });
  } catch (error) {
    console.error("Error in adminDeleteService:", error.message);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};
