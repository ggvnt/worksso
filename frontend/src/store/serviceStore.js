import toast from "react-hot-toast";
import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "../store/useAuthStore";

export const serviceStore = create((set, get) => ({
  services: [],
  totalServices: 0,
  availableFilters: {
    categories: [],
    locations: [],
    priceRange: [0, 1000]
  },
  isFetchingServices: false,
  isCreatingService: false,
  isUpdatingService: false,
  isDeletingService: false,
  isRenewingService: false,
  error: null,

  // Fetch services with comprehensive filtering
  fetchAllServices: async (filters = {}) => {
    set({ isFetchingServices: true, error: null });
    try {
      const params = new URLSearchParams();

      // Pagination
      if (filters.page) params.append("page", filters.page);
      if (filters.limit) params.append("limit", filters.limit);

      // Filtering
      if (filters.category) params.append("category", filters.category);
      if (filters.minPrice) params.append("minPrice", filters.minPrice);
      if (filters.maxPrice) params.append("maxPrice", filters.maxPrice);
      if (filters.location) params.append("location", filters.location);
      if (filters.search) params.append("search", filters.search);

      // Sorting
      if (filters.sort) params.append("sort", filters.sort);

      const res = await axiosInstance.get(`/service/services?${params.toString()}`);
      
      set({
        services: res.data.services || [],
        totalServices: res.data.total || 0,
        availableFilters: {
          categories: res.data.filters?.availableCategories || [],
          locations: res.data.filters?.availableLocations || [],
          priceRange: [
            res.data.filters?.minPriceAvailable?.price || 0,
            res.data.filters?.maxPriceAvailable?.price || 1000
          ]
        }
      });

      return res.data;
    } catch (error) {
      console.error("Error in fetchAllServices:", error);
      set({ error: error.response?.data?.message || "Failed to fetch services" });
      toast.error(error.response?.data?.message || "Failed to fetch services");
      throw error;
    } finally {
      set({ isFetchingServices: false });
    }
  },

  // Fetch services by user ID
  fetchServicesByUserId: async (userId) => {
    set({ isFetchingServices: true, error: null });
    try {
      const authUser = useAuthStore.getState().authUser;
      const id = userId || authUser?._id;
      if (!id) {
        throw new Error("Unable to fetch services. Please log in.");
      }

      const res = await axiosInstance.get(`/service/user/${id}`);
      set({ services: res.data.services || [] });
      return res.data;
    } catch (error) {
      console.error("Error in fetchServicesByUserId:", error);
      set({ error: error.response?.data?.message || "Failed to fetch user services" });
      toast.error(error.response?.data?.message || "Failed to fetch user services");
      throw error;
    } finally {
      set({ isFetchingServices: false });
    }
  },

  // Create new service
  createService: async (data) => {
    set({ isCreatingService: true, error: null });
    try {
      const res = await axiosInstance.post("/service/createService", data);
      set((state) => ({ services: [res.data, ...state.services] }));
      toast.success("Service created successfully");
      return res.data;
    } catch (error) {
      console.error("Error in createService:", error);
      set({ error: error.response?.data?.message || "Failed to create service" });
      toast.error(error.response?.data?.message || "Failed to create service");
      throw error;
    } finally {
      set({ isCreatingService: false });
    }
  },

  // Update existing service
  updateService: async (id, data) => {
    set({ isUpdatingService: true, error: null });
    try {
      // const res = await axiosInstance.put(`/service/${id}`, data);
      const res = await axiosInstance.put(`/service/update-profile`, data);

      set((state) => ({
        services: state.services.map((service) =>
          service._id === id ? res.data : service
        ),
      }));
      toast.success("Service updated successfully");
      return res.data;
    } catch (error) {
      console.error("Error in updateService:", error);
      set({ error: error.response?.data?.message || "Failed to update service" });
      toast.error(error.response?.data?.message || "Failed to update service");
      throw error;
    } finally {
      set({ isUpdatingService: false });
    }
  },

  // Delete service
  deleteService: async (id) => {
    set({ isDeletingService: true, error: null });
    try {
      await axiosInstance.delete(`/service/${id}`);
      set((state) => ({
        services: state.services.filter((service) => service._id !== id),
      }));
      toast.success("Service deleted successfully");
    } catch (error) {
      console.error("Error in deleteService:", error);
      set({ error: error.response?.data?.message || "Failed to delete service" });
      toast.error(error.response?.data?.message || "Failed to delete service");
      throw error;
    } finally {
      set({ isDeletingService: false });
    }
  },

  // Renew service
  renewService: async (id) => {
    set({ isRenewingService: true, error: null });
    try {
      const res = await axiosInstance.put(`/service/renew/${id}`);
      set((state) => ({
        services: state.services.map((service) =>
          service._id === id ? res.data : service
        ),
      }));
      toast.success("Service renewed successfully");
      return res.data;
    } catch (error) {
      console.error("Error in renewService:", error);
      set({ error: error.response?.data?.message || "Failed to renew service" });
      toast.error(error.response?.data?.message || "Failed to renew service");
      throw error;
    } finally {
      set({ isRenewingService: false });
    }
  },

  fetchServicesByCategory: async (categoryId) => {
    try {
      const res = await axiosInstance.get(`/service/category/${categoryId}`);
      return res.data;
    } catch (error) {
      console.error("Error fetching services by category:", error);
      throw error;
    }
  },

  // Clear services from store
  clearServices: () => {
    set({ services: [], totalServices: 0 });
  }
}));