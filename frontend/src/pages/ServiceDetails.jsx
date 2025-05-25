import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { serviceStore } from "../store/serviceStore";
import { toast } from "react-hot-toast";
import { BsStarFill, BsArrowLeft } from "react-icons/bs";
import { Phone, Mail, MapPin } from "lucide-react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Slider settings for image gallery
const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: true,
    fade: true,
};

const ServiceDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const {
        currentService,
        getServiceById,
        clearCurrentService,
        isFetchingSingleService,
        error,
        fetchServicesByCategory,
    } = serviceStore();

    const [relatedServices, setRelatedServices] = React.useState([]);
    const [activeTab, setActiveTab] = React.useState("details");

    // Fetch service details
    useEffect(() => {
        const fetchData = async () => {
            try {
                if (!id) {
                    toast.error("No service ID provided");
                    navigate("/services");
                    return;
                }
                await getServiceById(id);
            } catch (err) {
                toast.error(err.message || "Failed to load service");
                navigate("/services");
            }
        };

        fetchData();

        return () => clearCurrentService();
    }, [id, getServiceById, clearCurrentService, navigate]);

    // Fetch related services
    useEffect(() => {
        if (!currentService?.category) return;

        const fetchRelated = async () => {
            try {
                const categoryId = typeof currentService.category === "string"
                    ? currentService.category
                    : currentService.category._id;

                const response = await fetchServicesByCategory(categoryId);

                setRelatedServices(
                    response.services
                        ?.filter(s => s._id !== currentService._id)
                        ?.slice(0, 4) || []
                );
            } catch (err) {
                console.error("Error fetching related services:", err);
            }
        };

        fetchRelated();
    }, [currentService, fetchServicesByCategory]);

    const handleBookNow = () => {
        toast.success("Booking functionality coming soon!");
    };

    const handleContactClick = () => {
        const contactInfo = currentService?.email || currentService?.number;
        if (contactInfo) {
            navigator.clipboard.writeText(contactInfo);
            toast.success("Contact info copied to clipboard!");
        } else {
            toast.error("No contact information available");
        }
    };

    if (isFetchingSingleService) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-xl">Loading service details...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4">
                <div className="text-xl text-red-500 mb-4">{error}</div>
                <button
                    onClick={() => navigate("/services")}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                >
                    Back to Services
                </button>
            </div>
        );
    }

    if (!currentService) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4">
                <div className="text-xl mb-4">Service not found</div>
                <button
                    onClick={() => navigate("/services")}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                >
                    Back to Services
                </button>
            </div>
        );
    }

    return (
        <div className="py-8 bg-gray-50 min-h-screen">
            <div className="container mx-auto px-4">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center mb-6 text-blue-600 hover:text-blue-800"
                >
                    <BsArrowLeft className="mr-2" />
                    Back to Services
                </button>

                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="md:flex">
                        {/* Image Gallery */}
                        <div className="md:w-1/2">
                            {currentService.images?.length > 0 ? (
                                <Slider {...sliderSettings} className="service-image-slider">
                                    {currentService.images.map((image, index) => (
                                        <div key={index} className="h-96 relative">
                                            <img
                                                src={image}
                                                alt={`Service ${index + 1}`}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.target.src = "https://via.placeholder.com/800x600";
                                                }}
                                            />
                                        </div>
                                    ))}
                                </Slider>
                            ) : (
                                <div className="h-96 bg-gray-200 flex items-center justify-center">
                                    <span className="text-gray-500">No images available</span>
                                </div>
                            )}
                        </div>

                        {/* Service Info */}
                        <div className="p-8 md:w-1/2">
                            <div className="flex justify-between items-start">
                                <div>
                                    {/* <span className="inline-block px-3 py-1 text-sm font-semibold text-blue-800 bg-blue-100 rounded-full mb-2">
                    {typeof currentService.category === "string"
                      ? currentService.category
                      : currentService.category?.name || "Uncategorized"}
                  </span> */}
                                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                        {currentService.title}
                                    </h1>
                                </div>
                                {/* <div className="text-2xl font-bold text-blue-600">
                  Rs:{currentService.price}
                </div> */}
                                <div className="text-2xl font-bold text-blue-600">
                                    Rs: {typeof currentService.price === 'number' ? currentService.price.toFixed(2) : currentService.price}
                                </div>
                            </div>

                            {/* Rating */}
                            {/* <div className="flex items-center my-4">
                <div className="flex text-yellow-400 mr-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <BsStarFill
                      key={star}
                      size={18}
                      className={star <= (currentService.rating || 0) ? "text-yellow-400" : "text-gray-300"}
                    />
                  ))}
                </div>
                <span className="text-gray-600">
                  ({currentService.reviewCount || 0} reviews)
                </span>
              </div> */}

                            {/* Quick Info */}
                            <div className="grid grid-cols-2 gap-4 my-6">
                                {currentService.location && (
                                    <div className="flex items-center ">
                                        <MapPin className="text-gray-500 mr-2" size={18} />
                                        <span className="text-gray-700">{currentService.location}</span>
                                    </div>
                                )}
                                {currentService.email && (
                                    <div className="flex items-center">
                                        <Mail className="text-gray-500 mr-2" size={18} />
                                        <span className="text-gray-700">{currentService.email}</span>
                                    </div>
                                )}
                                {currentService.number && (
                                    <div className="flex items-center">
                                        <Phone className="text-gray-500 mr-2" size={18} />
                                        <span className="text-gray-700">{currentService.number}</span>
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-wrap gap-4 mt-6">
                                {/* <button
                                    onClick={handleBookNow}
                                    className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition duration-300"
                                >
                                    Book Now
                                </button> */}
                                <button
                                    onClick={handleContactClick}
                                    className="px-6 py-3 border border-blue-600 text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition duration-300"
                                >
                                    Contact Provider
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="border-t border-gray-200">
                        <nav className="flex">
                            <button
                                onClick={() => setActiveTab("details")}
                                className={`px-6 py-4 font-medium ${activeTab === "details"
                                        ? "text-blue-600 border-b-2 border-blue-600"
                                        : "text-gray-500 hover:text-gray-700"
                                    }`}
                            >
                                Details
                            </button>
                            <button
                                onClick={() => setActiveTab("provider")}
                                className={`px-6 py-4 font-medium ${activeTab === "provider"
                                        ? "text-blue-600 border-b-2 border-blue-600"
                                        : "text-gray-500 hover:text-gray-700"
                                    }`}
                            >
                                Provider Info
                            </button>
                        </nav>

                        {/* Tab Content */}
                        <div className="p-8">
                            {activeTab === "details" && (
                                <div>
                                    <h3 className="text-xl font-semibold mb-4">Service Description</h3>
                                    <p className="text-gray-700 mb-6">
                                        {currentService.description || "No detailed description available."}
                                    </p>
                                </div>
                            )}

                            {activeTab === "provider" && (
                                <div>
                                    <h3 className="text-xl font-semibold mb-4">Contact Information</h3>
                                    <div className="space-y-4">
                                        {currentService.email && (
                                            <div className="flex items-center">
                                                <Mail className="text-gray-500 mr-2" size={18} />
                                                <span className="text-gray-700">{currentService.email}</span>
                                            </div>
                                        )}
                                        {currentService.number && (
                                            <div className="flex items-center">
                                                <Phone className="text-gray-500 mr-2" size={18} />
                                                <span className="text-gray-700">{currentService.number}</span>
                                            </div>
                                        )}
                                        {currentService.location && (
                                            <div className="flex items-center">
                                                <MapPin className="text-gray-500 mr-2" size={18} />
                                                <span className="text-gray-700">{currentService.location}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Related Services */}
                {relatedServices.length > 0 && (
                    <div className="mt-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">
                            Related Services
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {relatedServices.map((service) => (
                                <div
                                    key={service._id}
                                    onClick={() => navigate(`/services/${service._id}`)}
                                    className="bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer transition duration-300 hover:shadow-md"
                                >
                                    <img
                                        src={service.images?.[0] || "https://via.placeholder.com/400x300"}
                                        alt={service.title}
                                        className="w-full h-40 object-cover"
                                    />
                                    <div className="p-4">
                                        <h3 className="font-semibold text-gray-900 mb-1">{service.title}</h3>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-blue-600 font-medium">
                                                ${service.price}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ServiceDetails;