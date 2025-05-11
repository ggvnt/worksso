import React, { useState, useEffect, useRef } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu, X, Search } from "lucide-react";

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const dropdownRef = useRef(null);
  const menuRef = useRef(null);
  const searchRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, authUser } = useAuthStore();
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  
  // Initialize search from URL when component mounts or location changes
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const searchQuery = searchParams.get('search');
    if (searchQuery) {
      setSearch(decodeURIComponent(searchQuery));
    } else {
      setSearch("");
    }
  }, [location.search]);

  const toggleDropdown = () => setIsDropdownOpen(prev => !prev);
  const toggleMenu = () => setIsMenuOpen(prev => !prev);
  const toggleSearch = () => {
    setIsSearchActive(prev => !prev);
    if (!isSearchActive) {
      setTimeout(() => {
        searchRef.current?.querySelector('input')?.focus();
      }, 0);
    }
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchActive(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setSuggestions(
      e.target.value
        ? ["aaa"].filter(
            (item) => item.toLowerCase().includes(e.target.value.toLowerCase())
          )
        : []
    );
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/servicePage?search=${encodeURIComponent(search)}`);
    } else {
      navigate('/servicePage');
    }
    setIsSearchActive(false);
  };

  const handleSuggestionClick = (suggestion) => {
    setSearch(suggestion);
    navigate(`/servicePage?search=${encodeURIComponent(suggestion)}`);
    setIsSearchActive(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-blue-500 shadow-md">
      <div className="flex items-center justify-between px-4 py-3 md:px-8">
        {/* Logo */}
        <img
          onClick={() => navigate("/")}
          src="/Images/wlogo.png"
          alt="Logo"
          className="w-12 h-10 cursor-pointer"
        />

        {/* Desktop Search Bar */}
        <div className="relative flex-grow hidden max-w-md mx-4 md:block">
          <form onSubmit={handleSearchSubmit} ref={searchRef}>
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={handleSearch}
                placeholder="Search services..."
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
                onFocus={() => setIsSearchActive(true)}
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
              {isSearchActive && suggestions.length > 0 && (
                <div className="absolute left-0 right-0 z-10 mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
                  {suggestions.map((item, index) => (
                    <div
                      key={index}
                      className="px-4 py-2 cursor-pointer hover:bg-blue-50"
                      onClick={() => handleSuggestionClick(item)}
                    >
                      {item}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Mobile Search Toggle */}
        <button
          className="p-2 text-white md:hidden"
          onClick={toggleSearch}
          aria-label="Search"
        >
          <Search size={24} />
        </button>

        {/* Navigation Links & Profile */}
        <div className="flex items-center space-x-5 text-white">
          <ul className="hidden space-x-5 font-medium md:flex">
            <li><a href="/" className="hover:underline">Home</a></li>
            <li><a href="/servicePage" className="hover:underline">Services</a></li>
            <li><a href="/contact" className="hover:underline">Contact</a></li>
            <li><a href="/about" className="hover:underline">About</a></li>
          </ul>
          
          {/* Profile/Login */}
          {authUser ? (
            <div className="relative" ref={dropdownRef}>
              <img
                src={authUser.profilePic || "/Images/avatar.png"}
                alt="Profile"
                className="w-10 h-10 border-gray-300 rounded-full cursor-pointer"
                onClick={toggleDropdown}
              />
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 bg-white border border-gray-200 rounded-md shadow-lg">
                  <a href="/profile" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Profile</a>
                  {authUser.role === "admin" && (
                    <a href="/admin/dashboard" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Admin Dashboard</a>
                  )}
                  <button onClick={logout} className="block w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100">
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              className="px-4 py-2 text-blue-500 bg-white rounded-md hover:bg-blue-100"
              onClick={() => navigate("/login")}
            >
              Login
            </button>
          )}
          
          {/* Mobile Menu Button */}
          <button className="text-white md:hidden" onClick={toggleMenu}>
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Search Bar */}
      {isSearchActive && (
        <div className="p-3 bg-white border-t border-gray-200 md:hidden">
          <form onSubmit={handleSearchSubmit} ref={searchRef}>
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={handleSearch}
                placeholder="Search services..."
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
                autoFocus
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
              {suggestions.length > 0 && (
                <div className="absolute left-0 right-0 z-10 mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
                  {suggestions.map((item, index) => (
                    <div
                      key={index}
                      className="px-4 py-2 cursor-pointer hover:bg-blue-50"
                      onClick={() => handleSuggestionClick(item)}
                    >
                      {item}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div ref={menuRef} className="p-4 bg-white border-t border-gray-200 md:hidden">
          <ul className="flex flex-col space-y-4 text-gray-700">
            <li><a href="/" className="hover:text-blue-500">Home</a></li>
            <li><a href="/servicePage" className="hover:text-blue-500">Services</a></li>
            <li><a href="/contact" className="hover:text-blue-500">Contact</a></li>
            <li><a href="/about" className="hover:text-blue-500">About</a></li>
            {authUser ? (
              <>
                <a href="/profile" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Profile</a>
                {authUser.role === "admin" && (
                  <a href="/admin/dashboard" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Admin Dashboard</a>
                )}
                <button onClick={logout} className="block w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100">
                  Logout
                </button>
              </>
            ) : (
              <button
                className="px-4 py-2 text-blue-500 bg-white rounded-md hover:bg-blue-100"
                onClick={() => navigate("/login")}
              >
                Login
              </button>
            )}
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;