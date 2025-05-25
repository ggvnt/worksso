import React, { useEffect, useState, useRef } from "react";
import { serviceStore } from "../store/serviceStore";
import { categoryStore } from "../store/categoryStore";
import { BsStarFill, BsFilter } from "react-icons/bs";
import { Phone, X, Search } from "lucide-react";
import { useParams, useLocation ,Link } from "react-router-dom";
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

const ServicePage = () => {
  const { services, fetchAllServices, availableFilters } = serviceStore();
  const [categories, setCategories] = useState([]);
  const [categoryMap, setCategoryMap] = useState({});
  const [loading, setLoading] = useState(false);
  const { categoryId } = useParams();
  const location = useLocation();
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: categoryId || '',
    minPrice: null,
    maxPrice: null,
    location: '',
    search: ''
  });
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);

  

  // Initialize search from URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const searchQuery = searchParams.get('search');
    
    if (searchQuery) {
      setFilters(prev => ({
        ...prev,
        search: decodeURIComponent(searchQuery)
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        search: ''
      }));
    }
  }, [location.search]);

  useEffect(() => {
    setLoading(true);
    const loadData = async () => {
      try {
        const categoryResponse = await categoryStore.getState().fetchCategories();
        setCategories(categoryResponse);
        
        // Create ID-to-name mapping
        const map = categoryResponse.reduce((acc, cat) => {
          acc[cat._id] = cat.name;
          return acc;
        }, {});
        setCategoryMap(map);
        
        await fetchAllServices({ ...filters, page: 1, limit: 10 });
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (categoryId) {
      setFilters(prev => ({ ...prev, category: categoryId }));
    }
  }, [categoryId]);

  useEffect(() => {
    const applyFilters = async () => {
      setLoading(true);
      try {
        await fetchAllServices({ ...filters, page: 1, limit: 10 });
      } catch (error) {
        console.error("Error applying filters:", error);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      applyFilters();
    }, 500); // Debounce to prevent rapid API calls

    return () => clearTimeout(timer);
  }, [filters]);

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));

    // Generate suggestions when search term changes
    if (name === 'search') {
      if (value.trim()) {
        // Generate suggestions based on available services or common terms
        const serviceTitles = services.map(service => service.title);
        const commonTerms = ["Doctor", "Appointment", "Pharmacy", "Hospital", "Clinic"];
        const allSuggestions = [...new Set([...serviceTitles, ...commonTerms])];
        
        const filtered = allSuggestions.filter(item => 
          item.toLowerCase().includes(value.toLowerCase())
        );
        setSearchSuggestions(filtered);
        setShowSuggestions(true);
      } else {
        setSearchSuggestions([]);
        setShowSuggestions(false);
      }
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setFilters(prev => ({
      ...prev,
      search: suggestion
    }));
    setShowSuggestions(false);
  };

  const handlePriceChange = (value) => {
    setFilters(prev => ({
      ...prev,
      minPrice: value[0],
      maxPrice: value[1]
    }));
  };

  const resetFilters = () => {
    setFilters({
      category: categoryId || '',
      minPrice: null,
      maxPrice: null,
      location: '',
      search: ''
    });
    setSearchSuggestions([]);
    setShowSuggestions(false);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Calculate active filters count for display
  const activeFiltersCount = Object.values(filters).filter(
    value => value !== '' && value !== null && !(Array.isArray(value) && value.length === 0)
  ).length;

  return (
    <div className="py-8 mx-auto">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Mobile Filter Toggle */}
        <div className="md:hidden flex justify-between items-center p-4 bg-white shadow-md rounded-lg">
          <h2 className="text-xl font-semibold text-gray-800">Services</h2>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-600 rounded-lg"
          >
            <BsFilter size={20} />
            <span>Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}</span>
          </button>
        </div>

        {/* Filter Section - Desktop */}
        <div className={`${showFilters ? 'block' : 'hidden'} md:block flex-shrink-0 w-64 p-4 bg-white rounded-lg shadow-md`}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}</h3>
            <button
              onClick={resetFilters}
              className="text-sm text-blue-600 hover:underline"
            >
              Reset all
            </button>
          </div>

          {/* Search Filter with Suggestions */}
          <div className="mb-6 relative" ref={searchRef}>
            <label className="block mb-2 text-sm font-medium text-gray-700">Search</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search services..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                onFocus={() => filters.search && setShowSuggestions(true)}
                className="w-full p-2 pl-10 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
              <Search className="absolute left-3 top-3 text-gray-400" size={16} />
            </div>
            {showSuggestions && searchSuggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                {searchSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="px-4 py-2 cursor-pointer hover:bg-blue-50"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Category Filter */}
          <div className="mb-6">
            <label className="block mb-2 text-sm font-medium text-gray-700">Category</label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Price Range Filter */}
          <div className="mb-6">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Price Range:
              {(filters.minPrice !== null || filters.maxPrice !== null) && (
                <span className="ml-2 font-normal">
                  ${filters.minPrice || availableFilters.priceRange[0]} - ${filters.maxPrice || availableFilters.priceRange[1]}
                </span>
              )}
            </label>
            <Slider
              range
              min={availableFilters.priceRange[0]}
              max={availableFilters.priceRange[1]}
              value={[
                filters.minPrice !== null ? filters.minPrice : availableFilters.priceRange[0],
                filters.maxPrice !== null ? filters.maxPrice : availableFilters.priceRange[1]
              ]}
              onChange={handlePriceChange}
              trackStyle={[{ backgroundColor: '#3b82f6' }]}
              handleStyle={[
                { backgroundColor: '#3b82f6', borderColor: '#3b82f6' },
                { backgroundColor: '#3b82f6', borderColor: '#3b82f6' }
              ]}
            />
            <div className="flex justify-between mt-2 text-sm text-gray-500">
              <span>${availableFilters.priceRange[0]}</span>
              <span>${availableFilters.priceRange[1]}</span>
            </div>
          </div>

          {/* Location Filter */}
          <div className="mb-6">
            <label className="block mb-2 text-sm font-medium text-gray-700">Location</label>
            <select
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Locations</option>
              {availableFilters.locations?.map((loc, index) => (
                <option key={index} value={loc}>{loc}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Services Section */}
        <div className="flex-1">
          {/* Active Filters Display */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-4 p-4 bg-white rounded-lg shadow-md">
              {filters.search && (
                <FilterPill
                  label={`Search: ${filters.search}`}
                  onRemove={() => handleFilterChange('search', '')}
                />
              )}
              {filters.category && (
                <FilterPill
                  label={`Category: ${categoryMap[filters.category] || filters.category}`}
                  onRemove={() => handleFilterChange('category', '')}
                />
              )}
              {(filters.minPrice !== null || filters.maxPrice !== null) && (
                <FilterPill
                  label={`Price: $${filters.minPrice || availableFilters.priceRange[0]} - $${filters.maxPrice || availableFilters.priceRange[1]}`}
                  onRemove={() => {
                    handleFilterChange('minPrice', null);
                    handleFilterChange('maxPrice', null);
                  }}
                />
              )}
              {filters.location && (
                <FilterPill
                  label={`Location: ${filters.location}`}
                  onRemove={() => handleFilterChange('location', '')}
                />
              )}
            </div>
          )}

          <div className="p-4 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-800">Services</h2>
            <div className="grid grid-cols-1 gap-6 mt-6 sm:grid-cols-2 lg:grid-cols-3">
              {loading ? (
                <div className="text-xl text-center col-span-full">Loading...</div>
              ) : services.length > 0 ? (
                services.map((service) => (
                  <ServiceCard key={service._id} service={service} categoryMap={categoryMap} />
                ))
              ) : (
                <div className="text-xl text-center col-span-full">
                  No services found. Try adjusting your filters.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FilterPill = ({ label, onRemove }) => (
  <div className="flex items-center px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full">
    <span>{label}</span>
    <button
      onClick={onRemove}
      className="ml-2 text-blue-600 hover:text-blue-800"
    >
      <X size={14} />
    </button>
  </div>
);

const ServiceCard = ({ service, categoryMap }) => {
  // Get category name with fallback
  const categoryName = service.category?.name || 
                      (typeof service.category === 'string' ? categoryMap[service.category] : 'Uncategorized');

  return (
    <Link to={`/servicesdetails/${service._id}`} className="block">
    <div className="overflow-hidden transition duration-300 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md">
      <img
        src={service.images?.[0] || "https://via.placeholder.com/150"}
        alt={service.title}
        className="object-cover w-full h-56"
      />
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          {/* <div className="flex text-yellow-500">
            {Array(service.rating || 5).fill().map((_, i) => (
              <BsStarFill key={i} size={16} />
            ))}
          </div> */}
          <span className="px-2 py-1 text-xs font-semibold text-blue-800 bg-blue-100 rounded-full">
            {categoryName}
          </span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900">{service.title}</h3>
        <p className="mt-1 text-sm text-gray-600 line-clamp-2">{service.description}</p>
        {/* <div className="flex items-center justify-between mt-3">
          <div className="text-lg font-bold text-gray-900">${service.price}</div>
          <div className="flex items-center text-sm text-gray-500">
            <Phone size={16} className="mr-1" /> {service.number || "N/A"}
          </div>
        </div> */}
        {service.location && (
          <div className="mt-2 text-sm text-gray-500">
            {service.location}
          </div>
        )}
      </div>
    </div>
    </Link>
  );
};

export default ServicePage;