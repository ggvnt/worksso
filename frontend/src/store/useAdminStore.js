import { create } from "zustand";
import { axiosInstance } from "../lib/axios"; // import your axiosInstance
import toast from "react-hot-toast";

// Create a store using Zustand
export const useAdminStore = create((set) => ({
  users: [],
  isLoading: false,
  allServices: [],
  isFetching: false,
  isDeleting: false,
  error: null,

  // Action to fetch users
  fetchUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.get("/admin/users");
      set({ users: response.data, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  // Action to delete a user
  deleteUser: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await axiosInstance.delete(`/admin/user/${id}`);
      set({ isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },
  // Fetch all services (admin only)
  fetchAllServices: async () => {
    set({ isFetching: true, error: null });
    try {
      const res = await axiosInstance.get("/admin/allServices");
      set({ allServices: res.data || [] });
      return res.data;
    } catch (error) {
      const errMsg = error.response?.data?.message || "Failed to fetch services";
      set({ error: errMsg });
      toast.error(errMsg);
      throw error;
    } finally {
      set({ isFetching: false });
    }
  },

  // Admin delete service
  deleteService: async (id) => {
    set({ isDeleting: true, error: null });
    try {
      await axiosInstance.delete(`/admin/${id}`);
      set((state) => ({
        allServices: state.allServices.filter(service => service._id !== id)
      }));
      toast.success("Service deleted successfully");
    } catch (error) {
      const errMsg = error.response?.data?.message || "Failed to delete service";
      set({ error: errMsg });
      toast.error(errMsg);
      throw error;
    } finally {
      set({ isDeleting: false });
    }
  },

  // Clear services
  clearServices: () => {
    set({ allServices: [] });
  }
}));
