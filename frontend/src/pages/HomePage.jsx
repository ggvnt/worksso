import React, { useState, useEffect } from "react";
import { BsStarFill, BsClock } from "react-icons/bs";
import { Phone, AlertCircle, RefreshCw } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { serviceStore } from "../store/serviceStore";
import { categoryStore } from "../store/categoryStore";
import { toast } from "react-hot-toast";

const HomePage = () => {
  const { services, fetchAllServices, renewService } = serviceStore();
  const { fetchCategories, categories } = categoryStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredServices, setFilteredServices] = useState([]);

  const slides = [
    {
      url: "https://blog.bayiq.com/hubfs/Automotive%20Technician%20Tool%20Box.jpeg",
    },
    {
      url: "https://images.prismic.io/houzz/2498f478-e7f6-4a0e-8fa0-66f20a0be42f_AdobeStock_358617383.jpeg?auto=compress,format",
    },
    {
      url: "https://mccoymart.com/post/wp-content/uploads/The-Top-10-Benefits-Of-Hiring-A-Professional-Carpenter.jpg",
    },
    {
      url: "https://chamblissplumbing.com/wp-content/webp-express/webp-images/uploads/2023/03/whats-a-plumber-1.jpg.webp",
    },
    {
      url: "https://www.truckandmovers.lk/images/slides/need-it-moved-.jpg",
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const now = new Date();
    const activeServices = services
      .filter((service) => service.isActive)
      .map((service) => ({
        ...service,
        minutesLeft: Math.ceil((new Date(service.expiresAt) - now) / (1000 * 60)),
        isExpiringSoon:
          Math.ceil((new Date(service.expiresAt) - now) / (1000 * 60)) <= 5,
      }));
    setFilteredServices(activeServices);
  }, [services]);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchCategories(), fetchAllServices(1, 10)])
      .catch((error) => {
        console.error("Error fetching data:", error);
        toast.error("Failed to load services");
      })
      .finally(() => setLoading(false));
  }, [fetchCategories, fetchAllServices]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === slides.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const goToSlide = (index) => setCurrentIndex(index);

  const loadMore = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchAllServices(nextPage, 10);
  };

  const handleRenewService = async (serviceId) => {
    try {
      await renewService(serviceId);
      toast.success("Service renewed for another 10 minutes!");
    } catch (error) {
      toast.error("Failed to renew service");
    }
  };

  return (
    <div className="bg-gray-50">
      <div className="relative h-[600px] bg-cover bg-center transition-all duration-500 -mb-24">
        <div
          style={{ backgroundImage: `url(${slides[currentIndex].url})` }}
          className="w-full h-[500px] duration-500 bg-center bg-cover"
        ></div>

        <div className="flex justify-center mt-4">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`h-3 w-3 rounded-full mx-2 cursor-pointer ${
                currentIndex === index ? "bg-blue-500" : "bg-gray-300"
              }`}
              onClick={() => goToSlide(index)}
            ></div>
          ))}
        </div>
      </div>

      <div className="container px-4 py-16 mx-auto">
        <h2 className="text-3xl font-semibold text-center text-gray-800">
          Browse by Categories
        </h2>
        <div className="grid grid-cols-2 gap-8 mt-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {loading ? (
            <div className="text-xl text-center col-span-full">
              Loading categories...
            </div>
          ) : categories?.length > 0 ? (
            categories.map((category) => (
              <div
                key={category._id}
                className="p-6 transition duration-300 transform bg-white rounded-lg shadow-lg cursor-pointer hover:scale-105"
                onClick={() => navigate(`/services/${category._id}`)}
              >
                <img
                  src={category.logo}
                  alt={category.name}
                  className="w-20 h-20 mx-auto mb-4"
                />
                <h3 className="text-xl font-semibold text-center">
                  {category.name}
                </h3>
              </div>
            ))
          ) : (
            <div className="text-xl text-center col-span-full">
              No categories available.
            </div>
          )}
        </div>
      </div>

      <div className="py-16 bg-white">
        <div className="container px-4 mx-auto">
          <h2 className="text-3xl font-semibold text-center text-gray-800">
            Popular Services
          </h2>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-blue-500 rounded-full animate-spin border-t-transparent"></div>
            </div>
          ) : filteredServices?.length > 0 ? (
            <div className="grid grid-cols-1 gap-8 mt-8 sm:grid-cols-2 lg:grid-cols-3">
              {filteredServices.map((service) => (
                <Link
                  key={service._id}
                  to={`/servicesdetails/${service._id}`}
                  className="relative overflow-hidden transition-all duration-300 transform bg-gray-100 rounded-lg shadow-md hover:scale-105"
                >
                  {service.isExpiringSoon && (
                    <div className="absolute flex items-center px-2 py-1 text-xs font-bold text-white bg-yellow-500 rounded-full top-2 left-2">
                      <BsClock className="mr-1" />
                      {service.minutesLeft} min
                      {service.minutesLeft !== 1 ? "s" : ""} left
                    </div>
                  )}

                  <img
                    src={
                      service.images?.[0] || "https://via.placeholder.com/150"
                    }
                    alt={service.title}
                    className="object-cover w-full h-64"
                  />

                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      {service.isExpiringSoon && (
                        <button
                          onClick={(e) => {
                            e.preventDefault(); // Prevent navigation
                            e.stopPropagation(); // Stop event bubbling
                            handleRenewService(service._id);
                          }}
                          className="flex items-center px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
                        >
                          <RefreshCw size={14} className="mr-1" />
                          Renew
                        </button>
                      )}
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900">
                      {service.title}
                    </h3>
                    <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                      {service.description}
                    </p>

                    {/* <div className="flex items-center justify-between mt-4">
                      <div className="text-xl font-bold text-gray-900">
                        ${service.price}
                      </div>
                    </div> */}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle size={48} className="mb-4 text-gray-400" />
              <h3 className="text-xl font-medium text-gray-700">
                No active services available
              </h3>
              <p className="mt-2 text-gray-500">
                Check back later or create a new service
              </p>
            </div>
          )}

          {filteredServices.length > 0 && (
            <div className="flex justify-center mt-8">
              <button
                onClick={loadMore}
                className="px-6 py-2 font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Load More
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
