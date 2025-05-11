import Service from "../models/service.model.js";
import cloudinary from "../lib/cloudinary.js";
import mongoose from "mongoose";

// Helper function to check and update expired services
const updateExpiredServices = async () => {
  try {
    await Service.updateMany(
      {
        expiresAt: { $lte: new Date() },
        isActive: true,
      },
      { $set: { isActive: false } }
    );
  } catch (error) {
    console.error("Error updating expired services:", error);
  }
};

// Create a new service
export const createService = async (req, res) => {
  try {
    await updateExpiredServices(); // Check for expired services first

    const {
      title,
      price,
      description,
      category,
      location,
      images,
      number,
      email,
    } = req.body;
    const userId = req.user._id;

    if (!category) {
      return res.status(400).json({ message: "Category is required." });
    }

    if (images && images.length > 3) {
      return res
        .status(400)
        .json({ message: "You can only upload up to 3 images." });
    }

    let uploadedImages = [];

    if (images && images.length > 0) {
      uploadedImages = await Promise.all(
        images.map(async (image) => {
          const uploadResponse = await cloudinary.uploader.upload(image, {
            folder: "services",
            resource_type: "image",
          });
          return uploadResponse.secure_url;
        })
      );
    }

    const newService = new Service({
      title,
      price,
      description,
      category,
      location,
      images: uploadedImages,
      number,
      email,
      userId,
    });

    await newService.save();
    res.status(201).json(newService);
  } catch (error) {
    console.error("Error in createService controller:", error.message);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Get all active services (for homepage)
// export const getAllServices = async (req, res) => {
//   try {
//     await updateExpiredServices(); // Update expired services before fetching

//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 10;
//     const skip = (page - 1) * limit;

//     const services = await Service.find({ isActive: true })
//       .populate("userId", "fullName")
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(limit);

//     const totalServices = await Service.countDocuments({ isActive: true });

//     res.status(200).json({ services, total: totalServices });
//   } catch (error) {
//     console.error("Error in getAllServices controller:", error.message);
//     res
//       .status(500)
//       .json({ message: "Internal server error", error: error.message });
//   }
// };


// Get all active services (with enhanced filtering)
export const getAllServices = async (req, res) => {
  try {
    await updateExpiredServices();

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Extract filter parameters from query
    const { category, minPrice, maxPrice, location, search } = req.query;

    // Build the filter object
    const filter = { isActive: true };

    if (category) {
      filter.category = category;
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    if (location) {
      filter.location = { $regex: new RegExp(location, 'i') };
    }

    if (search) {
      filter.$or = [
        { title: { $regex: new RegExp(search, 'i') } },
        { description: { $regex: new RegExp(search, 'i') } }
      ];
    }

    const services = await Service.find(filter)
      .populate("userId", "fullName")
      .populate("category", "name") // Ensure category is populated
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalServices = await Service.countDocuments(filter);

    // Get price range
    const priceRange = await Service.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          minPrice: { $min: "$price" },
          maxPrice: { $max: "$price" }
        }
      }
    ]);

    const availableLocations = await Service.distinct("location", { isActive: true });
    const availableCategories = await Service.distinct("category", { isActive: true });

    res.status(200).json({ 
      services, 
      total: totalServices,
      filters: {
        availableCategories,
        availableLocations,
        priceRange: priceRange.length > 0 ? 
          [priceRange[0].minPrice, priceRange[0].maxPrice] : 
          [0, 1000] // Default range if no services
      }
    });
  } catch (error) {
    console.error("Error in getAllServices controller:", error.message);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Get services by user ID (shows all services regardless of active status)
export const getServicesByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    const services = await Service.find({ userId }).populate(
      "userId",
      "fullName email"
    );

    res.status(200).json({ services: services || [] });
  } catch (error) {
    console.error("Error in getServicesByUserId controller:", error.message);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Renew a service (reset expiration)
export const renewService = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedService = await Service.findByIdAndUpdate(
      id,
      {
        isActive: true,
        expiresAt: new Date(Date.now() + 20 * 60 * 1000), // Reset to 10 minutes from now
      },
      { new: true }
    );

    if (!updatedService) {
      return res.status(404).json({ message: "Service not found" });
    }

    res.status(200).json(updatedService);
  } catch (error) {
    console.error("Error in renewService controller:", error.message);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Update a service
export const updateService = async (req, res) => {
  try {
    const { title, price, description, location, images, number, email } =
      req.body;
    const serviceId = req.params.id;

    const existingService = await Service.findById(serviceId);
    if (!existingService) {
      return res.status(404).json({ message: "Service not found" });
    }

    let updatedImages = existingService.images;

    if (Array.isArray(images)) {
      if (images.length > 0) {
        await Promise.all(
          existingService.images.map(async (imageUrl) => {
            try {
              const publicId = imageUrl.split("/").pop().split(".")[0];
              await cloudinary.uploader.destroy(`services/${publicId}`);
            } catch (err) {
              console.error("Error deleting image from Cloudinary:", err);
            }
          })
        );

        updatedImages = await Promise.all(
          images.map(async (image) => {
            try {
              const uploadResponse = await cloudinary.uploader.upload(image, {
                folder: "services",
                resource_type: "image",
              });
              return uploadResponse.secure_url;
            } catch (err) {
              console.error("Error uploading image to Cloudinary:", err);
              return null;
            }
          })
        );

        updatedImages = updatedImages.filter((url) => url !== null);
      } else {
        updatedImages = [];
      }
    }

    const updatedFields = {};
    if (title !== undefined) updatedFields.title = title;
    if (price !== undefined) updatedFields.price = price;
    if (description !== undefined) updatedFields.description = description;
    if (location !== undefined) updatedFields.location = location;
    if (updatedImages !== undefined) updatedFields.images = updatedImages;
    if (number !== undefined) updatedFields.number = number;
    if (email !== undefined) updatedFields.email = email;

    const updatedService = await Service.findByIdAndUpdate(
      serviceId,
      { $set: updatedFields },
      { new: true, runValidators: true }
    );

    res.status(200).json(updatedService);
  } catch (error) {
    console.error("Error in updateService controller:", error.message);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Delete a service
export const deleteService = async (req, res) => {
  try {
    const serviceId = req.params.id;

    const service = await Service.findByIdAndDelete(serviceId);

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

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
    console.error("Error in deleteService controller:", error.message);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Get services by category ID (only active services)
export const getServiceByCategoryID = async (req, res) => {
  try {
    await updateExpiredServices(); // Update expired services first

    const categoryId = req.params.id;
    const services = await Service.find({
      category: categoryId,
      isActive: true,
    });

    if (!services) {
      return res
        .status(404)
        .json({ message: "No services found for this category" });
    }

    res.status(200).json(services);
  } catch (error) {
    console.error("Error in getServiceByCategoryID controller:", error.message);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
