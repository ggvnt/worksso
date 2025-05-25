import React, { useState, useEffect, useRef } from "react";
import {
  Camera,
  Mail,
  User,
  MapPin,
  Phone,
  Info,
  Star,
  Clock,
  RefreshCw,
  Bell,
  X,
  AlertTriangle,
  BarChart2,
  Filter,
  Search,
  Plus,
  ChevronDown,
  ChevronUp,
  EyeOff,
} from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { serviceStore } from "../store/serviceStore";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import ServiceForm from "./ServiceForm";
import UpdateServiceModal from "./UpdateServiceModalPage";
import ServiceStatusBadge from "../Services/ServiceStatusBadge.jsx";
import ServiceAnalyticsChart from "../Services/ServiceAnalyticsChart.jsx";

const ProfilePage = () => {
  // State and store hooks
  const { authUser, logout, isUpdatingProfile, updateProfile } = useAuthStore();
  const {
    services,
    fetchServicesByUserId,
    deleteService,
    updateService,
    renewService,
    markServiceInactive,
    isRenewingService,
    isMarkingInactive,
  } = serviceStore();
  const navigate = useNavigate();
  const servicesEndRef = useRef(null);

  // Component state
  const [selectedImg, setSelectedImg] = useState(null);
  const [isServiceFormOpen, setIsServiceFormOpen] = useState(false);
  const [serviceToUpdate, setServiceToUpdate] = useState(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showInactiveNotification, setShowInactiveNotification] =
    useState(false);
  const [inactiveServicesCount, setInactiveServicesCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "desc",
  });
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [expandedServiceId, setExpandedServiceId] = useState(null);

  // Service statistics
  const [serviceStats, setServiceStats] = useState({
    active: 0,
    expiringSoon: 0,
    expired: 0,
    total: 0,
  });

  // Fetch services on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchServicesByUserId();
      } catch (error) {
        toast.error("Failed to load services");
        console.error("Error fetching services:", error);
      }
    };
    loadData();
  }, [fetchServicesByUserId]);

  // Calculate service statistics and check for inactive services
  useEffect(() => {
    if (services && services.length > 0) {
      const now = new Date();
      let active = 0,
        expiringSoon = 0,
        expired = 0;

      services.forEach((service) => {
        if (!service.isActive) {
          expired++;
          return;
        }

        const expiryDate = new Date(service.expiresAt);
        const minutesLeft = Math.ceil((expiryDate - now) / (1000 * 60));

        if (minutesLeft <= 0) expired++;
        else if (minutesLeft <= 5) expiringSoon++;
        else active++;
      });

      setServiceStats({
        active,
        expiringSoon,
        expired,
        total: services.length,
      });

      setInactiveServicesCount(expired);

      if (
        expired > 0 &&
        localStorage.getItem("inactiveNotificationDismissed") !== "true"
      ) {
        setShowInactiveNotification(true);
      }
    }
  }, [services]);

  // Filter and sort services
  const filteredServices = React.useMemo(() => {
    let result = services ? [...services] : [];

    // Apply search filter
    if (searchTerm) {
      result = result.filter(
        (service) =>
          service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          service.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          service.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (filter !== "all") {
      const now = new Date();
      result = result.filter((service) => {
        if (!service.isActive) return filter === "expired";
        
        const expiryDate = new Date(service.expiresAt);
        const minutesLeft = Math.ceil((expiryDate - now) / (1000 * 60));

        if (filter === "active") return minutesLeft > 5;
        if (filter === "expiring") return minutesLeft > 0 && minutesLeft <= 5;
        if (filter === "expired") return minutesLeft <= 0;
        return true;
      });
    }

    // Apply sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    return result;
  }, [services, searchTerm, filter, sortConfig]);

  // Request sort
  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Handler functions
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = async () => {
        const base64Image = reader.result;
        setSelectedImg(base64Image);
        await updateProfile({ profilePic: base64Image });
        toast.success("Profile picture updated successfully");
      };
    } catch (error) {
      toast.error("Failed to update profile picture");
      console.error("Error uploading image:", error);
    }
  };

  const handleDeleteService = async (serviceId) => {
    if (isDeleting) return;

    try {
      setIsDeleting(true);
      await deleteService(serviceId);
      toast.success("Service deleted successfully");
    } catch (error) {
      toast.error("Failed to delete service");
      console.error("Error deleting service:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRenewService = async (serviceId) => {
    try {
      await renewService(serviceId);
      toast.success("Service renewed successfully!");
    } catch (error) {
      toast.error("Failed to renew service");
      console.error("Error renewing service:", error);
    }
  };

  const handleMarkInactive = async (serviceId) => {
    try {
      await markServiceInactive(serviceId);
      toast.success("Service marked as inactive");
    } catch (error) {
      toast.error("Failed to mark service inactive");
      console.error("Error marking service inactive:", error);
    }
  };

  const handleRenewAllExpired = async () => {
    try {
      const expiredServices = filteredServices.filter((service) => {
        if (!service.isActive) return true;
        const expiryDate = new Date(service.expiresAt);
        return expiryDate <= new Date();
      });

      await Promise.all(
        expiredServices.map((service) => renewService(service._id))
      );
      toast.success(`Renewed ${expiredServices.length} services successfully!`);
    } catch (error) {
      toast.error("Failed to renew all services");
      console.error("Error renewing services:", error);
    }
  };

  const getServiceStatus = (expiresAt, isActive) => {
    if (!isActive) {
      return {
        isExpired: true,
        isExpiringSoon: false,
        minutesLeft: 0,
      };
    }

    const now = new Date();
    const expiryDate = new Date(expiresAt);
    const minutesLeft = Math.ceil((expiryDate - now) / (1000 * 60));

    return {
      isExpired: minutesLeft <= 0,
      isExpiringSoon: minutesLeft > 0 && minutesLeft <= 5,
      minutesLeft,
    };
  };

  const dismissNotification = () => {
    setShowInactiveNotification(false);
    localStorage.setItem("inactiveNotificationDismissed", "true");
  };

  const scrollToServices = () => {
    servicesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const toggleServiceExpand = (serviceId) => {
    setExpandedServiceId(expandedServiceId === serviceId ? null : serviceId);
  };

  // New handler functions for update modal
  const openUpdateModal = (service) => {
    setServiceToUpdate(service);
    setIsUpdateModalOpen(true);
  };

  const closeUpdateModal = () => {
    setIsUpdateModalOpen(false);
    setServiceToUpdate(null);
  };

  const handleServiceUpdate = async (updatedService) => {
    try {
      await updateService(serviceToUpdate._id, updatedService);
      toast.success("Service updated successfully");
      closeUpdateModal();
    } catch (error) {
      toast.error("Failed to update service");
      console.error("Error updating service:", error);
    }
  };

  // Helper Components
  const ProfileInfoItem = ({ icon, label, value }) => (
    <div className="space-y-1">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        {icon}
        {label}
      </div>
      <div className="px-3 py-2 bg-white border border-gray-200 rounded-md">
        {value || "Not provided"}
      </div>
    </div>
  );

  const SortIndicator = ({ columnKey }) => (
    <span className="ml-1">
      {sortConfig.key === columnKey ? (
        sortConfig.direction === "asc" ? (
          <ChevronUp size={14} />
        ) : (
          <ChevronDown size={14} />
        )
      ) : null}
    </span>
  );

  return (
    <div className="flex flex-col items-center justify-center py-10 bg-gray-100">
      {/* Advanced Notification System */}
      {showInactiveNotification && inactiveServicesCount > 0 && (
        <div className="fixed z-50 w-full max-w-md p-4 border-l-4 border-orange-500 rounded-lg shadow-lg top-4 right-4 bg-gradient-to-r from-yellow-100 to-orange-100 animate-pulse">
          <div className="flex items-start justify-between">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-orange-600 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-orange-800">
                  {inactiveServicesCount} Service
                  {inactiveServicesCount !== 1 ? "s" : ""} Need Attention
                </h3>
                <p className="mt-1 text-sm text-orange-600">
                  You have {inactiveServicesCount} inactive service
                  {inactiveServicesCount !== 1 ? "s" : ""}. Renew them to make them active.
                </p>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => {
                      dismissNotification();
                      scrollToServices();
                    }}
                    className="text-sm font-medium text-orange-700 underline hover:text-orange-900"
                  >
                    View Services
                  </button>
                  <button
                    onClick={handleRenewAllExpired}
                    className="flex items-center px-2 py-1 text-sm font-medium text-white bg-orange-600 rounded hover:bg-orange-700"
                  >
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Renew All
                  </button>
                </div>
              </div>
            </div>
            <button
              onClick={dismissNotification}
              className="ml-2 text-orange-600 hover:text-orange-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Profile Overview Section */}
      <div className="grid w-full max-w-6xl grid-cols-1 gap-8 p-6 bg-white rounded-md shadow-lg md:grid-cols-3">
        {/* Profile Card */}
        <div className="p-6 space-y-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl md:col-span-1">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-gray-800">
              Profile Overview
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Manage your account and services
            </p>
          </div>

          {/* Avatar Upload */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative group">
              <img
                src={
                  selectedImg ||
                  authUser.profilePic ||
                  "../../Images/avatar.png"
                }
                alt="Profile"
                className="object-cover w-32 h-32 transition-all duration-300 border-4 border-white rounded-full shadow-md group-hover:opacity-90"
              />
              <label
                htmlFor="avatar-upload"
                className={`absolute inset-0 flex items-center justify-center w-32 h-32 rounded-full bg-black bg-opacity-0 group-hover:bg-opacity-30 cursor-pointer transition-all duration-300 ${
                  isUpdatingProfile ? "animate-pulse" : ""
                }`}
              >
                <Camera className="w-6 h-6 text-white transition-opacity duration-300 opacity-0 group-hover:opacity-100" />
                <input
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUpdatingProfile}
                />
              </label>
            </div>
            <p className="text-sm text-gray-400">
              {isUpdatingProfile ? "Uploading..." : "Click image to update"}
            </p>
          </div>

          {/* Profile Info */}
          <div className="space-y-4">
            <ProfileInfoItem
              icon={<User className="w-4 h-4" />}
              label="Full Name"
              value={authUser?.fullName}
            />
            <ProfileInfoItem
              icon={<Mail className="w-4 h-4" />}
              label="Email Address"
              value={authUser?.email}
            />
            <ProfileInfoItem
              icon={<MapPin className="w-4 h-4" />}
              label="Location"
              value={authUser?.location}
            />
            <ProfileInfoItem
              icon={<Phone className="w-4 h-4" />}
              label="Phone Number"
              value={authUser?.phone}
            />
          </div>
        </div>

        {/* Stats and Analytics Card */}
        <div className="p-6 space-y-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl md:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">
              Service Analytics
            </h2>
            <button
              onClick={() => setShowAnalytics(!showAnalytics)}
              className="flex items-center text-sm text-purple-600 hover:text-purple-800"
            >
              <BarChart2 className="w-4 h-4 mr-1" />
              {showAnalytics ? "Hide Charts" : "Show Charts"}
            </button>
          </div>

          {showAnalytics && (
            <div className="mt-4">
              <ServiceAnalyticsChart services={services} />
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-4 mt-4 sm:grid-cols-3">
            <div className="p-4 bg-white rounded-lg shadow">
              <div className="text-sm font-medium text-gray-500">
                Total Services
              </div>
              <div className="mt-1 text-2xl font-semibold text-gray-900">
                {serviceStats.total}
              </div>
            </div>
            <div className="p-4 bg-white rounded-lg shadow">
              <div className="text-sm font-medium text-gray-500">
                Active Services
              </div>
              <div className="mt-1 text-2xl font-semibold text-green-600">
                {serviceStats.active}
              </div>
            </div>
            <div className="p-4 bg-white rounded-lg shadow">
              <div className="text-sm font-medium text-gray-500">
                Need Attention
              </div>
              <div className="mt-1 text-2xl font-semibold text-yellow-600">
                {serviceStats.expiringSoon + serviceStats.expired}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            <button
              onClick={() => setIsServiceFormOpen(true)}
              className="flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Service
            </button>
            <button
              onClick={() => navigate("/accountSetting")}
              className="flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <User className="w-4 h-4 mr-2" />
              Account Settings
            </button>
          </div>
        </div>
      </div>

      {/* Services Management Section */}
      <div className="w-full max-w-6xl mt-8 space-y-6">
        {/* Services Header */}
        <div className="flex flex-col justify-between p-6 bg-white rounded-lg shadow-md md:flex-row">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">
              Service Management
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your {serviceStats.total} service
              {serviceStats.total !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex items-center mt-4 md:mt-0">
            {inactiveServicesCount > 0 && (
              <button
                onClick={handleRenewAllExpired}
                className="flex items-center px-3 py-1 mr-4 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600"
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Renew All ({inactiveServicesCount})
              </button>
            )}
          </div>
        </div>

        {/* Services Toolbar */}
        <div className="p-4 bg-white rounded-lg shadow">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="relative w-full md:w-64">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="w-full py-2 pl-10 pr-3 text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-center w-full gap-4 md:w-auto">
              <div className="relative">
                <select
                  className="py-2 pl-3 pr-8 text-sm bg-white border border-gray-300 rounded-lg appearance-none focus:ring-blue-500 focus:border-blue-500"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option value="all">All Services</option>
                  <option value="active">Active</option>
                  <option value="expiring">Expiring Soon</option>
                  <option value="expired">Expired</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <Filter className="w-4 h-4 text-gray-400" />
                </div>
              </div>

              <div className="items-center hidden space-x-1 sm:flex">
                <span className="text-sm text-gray-500">Sort:</span>
                <button
                  onClick={() => requestSort("title")}
                  className="flex items-center text-sm font-medium text-gray-700 hover:text-blue-600"
                >
                  Name <SortIndicator columnKey="title" />
                </button>
                <span className="text-gray-400">|</span>
                <button
                  onClick={() => requestSort("createdAt")}
                  className="flex items-center text-sm font-medium text-gray-700 hover:text-blue-600"
                >
                  Date <SortIndicator columnKey="createdAt" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Services List */}
        <div className="space-y-4">
          {filteredServices && filteredServices.length > 0 ? (
            filteredServices.map((service) => {
              const { isExpired, isExpiringSoon, minutesLeft } =
                getServiceStatus(service.expiresAt, service.isActive);
              const isExpanded = expandedServiceId === service._id;

              return (
                <div
                  key={service._id}
                  className={`p-4 bg-white rounded-lg shadow-sm transition-all duration-200 ${
                    !service.isActive || isExpired
                      ? "border-l-4 border-red-500"
                      : isExpiringSoon
                      ? "border-l-4 border-yellow-500"
                      : "border-l-4 border-green-500"
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center">
                    {/* Service Image */}
                    <div className="relative flex-shrink-0 w-full h-40 overflow-hidden rounded-lg md:w-48">
                      <img
                        src={
                          service.images[0] || "https://via.placeholder.com/150"
                        }
                        alt={service.title}
                        className="object-cover w-full h-full"
                      />
                      <ServiceStatusBadge
                        isExpired={!service.isActive || isExpired}
                        isExpiringSoon={isExpiringSoon}
                        minutesLeft={minutesLeft}
                      />
                    </div>

                    {/* Service Details */}
                    <div className="flex-1 mt-4 md:mt-0 md:ml-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <h2 className="text-lg font-bold text-gray-900">
                            {service.title}
                          </h2>
                          <div className="flex items-center mt-1">
                            <span className="text-sm font-medium text-gray-500">
                              {} {" "}
                              {new Date(service.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="text-xl font-bold text-gray-900">
                          ${service.price}
                        </div>
                      </div>

                      <div className="mt-2">
                        <p
                          className={`text-sm text-gray-600 ${
                            isExpanded ? "" : "line-clamp-2"
                          }`}
                        >
                          {service.description}
                        </p>
                        {service.description.length > 100 && (
                          <button
                            onClick={() => toggleServiceExpand(service._id)}
                            className="mt-1 text-sm font-medium text-blue-600 hover:text-blue-800"
                          >
                            {isExpanded ? "Show less" : "Read more"}
                          </button>
                        )}
                      </div>

                      {/* Additional Details (shown when expanded) */}
                      {isExpanded && (
                        <div className="mt-3 space-y-2">
                          <div className="flex items-center text-sm text-gray-600">
                            <Phone className="w-4 h-4 mr-2 text-gray-500" />
                            <span>{service.number}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Mail className="w-4 h-4 mr-2 text-gray-500" />
                            <span>{service.email}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                            <span>{service.location}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <span className="mr-2">Status:</span>
                            {!service.isActive ? (
                              <span className="px-2 py-1 text-xs font-medium text-white bg-red-500 rounded">
                                Inactive
                              </span>
                            ) : isExpired ? (
                              <span className="px-2 py-1 text-xs font-medium text-white bg-red-500 rounded">
                                Expired
                              </span>
                            ) : isExpiringSoon ? (
                              <span className="px-2 py-1 text-xs font-medium text-white bg-yellow-500 rounded">
                                Expiring Soon
                              </span>
                            ) : (
                              <span className="px-2 py-1 text-xs font-medium text-white bg-green-500 rounded">
                                Active
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-2 mt-4">
                        <button
                          onClick={() => openUpdateModal(service)}
                          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                        >
                          Update
                        </button>
                        <button
                          onClick={() => handleDeleteService(service._id)}
                          className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600"
                          disabled={isDeleting}
                        >
                          {isDeleting ? "Deleting..." : "Delete"}
                        </button>
                        {service.isActive && (isExpiringSoon || isExpired) && (
                          <button
                            onClick={() => handleRenewService(service._id)}
                            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
                            disabled={isRenewingService}
                          >
                            <RefreshCw className="w-4 h-4 mr-1" />
                            {isRenewingService ? "Renewing..." : "Renew"}
                          </button>
                        )}
                        {service.isActive && (
                          <button
                            onClick={() => handleMarkInactive(service._id)}
                            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded-lg hover:bg-gray-700"
                            disabled={isMarkingInactive}
                          >
                            <EyeOff className="w-4 h-4 mr-1" />
                            {isMarkingInactive ? "Updating..." : "Mark Inactive"}
                          </button>
                        )}
                        <button
                          onClick={() => toggleServiceExpand(service._id)}
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                        >
                          {isExpanded ? "Less details" : "More details"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center bg-white rounded-lg shadow">
              <Info size={48} className="mb-4 text-gray-400" />
              <h3 className="text-xl font-medium text-gray-700">
                No services found
              </h3>
              <p className="mt-2 text-gray-500">
                {searchTerm || filter !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "Create your first service to get started"}
              </p>
              <button
                onClick={() => setIsServiceFormOpen(true)}
                className="px-4 py-2 mt-4 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Create Service
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {isServiceFormOpen && (
        <ServiceForm onClose={() => setIsServiceFormOpen(false)} />
      )}

      {isUpdateModalOpen && serviceToUpdate && (
        <UpdateServiceModal
          service={serviceToUpdate}
          onClose={closeUpdateModal}
          onUpdate={handleServiceUpdate}
        />
      )}

      <div ref={servicesEndRef} />
    </div>
  );
};

export default ProfilePage;