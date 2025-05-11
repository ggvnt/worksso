import React, { useState } from "react";
import {
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaFacebookF,
  FaTwitter,
  FaInstagram,
} from "react-icons/fa";
import { contactStore } from "../store/contactStore";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("Submitting Form Data:", formData);
      await contactStore.getState().createContact(formData);
      alert("Contact form submitted successfully!");
      setFormData({ name: "", email: "", phone: "", message: "" }); // Reset form
    } catch (error) {
      console.error("Error submitting contact form:", error);
      alert("Failed to submit contact form. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-20 text-center text-white bg-blue-600">
        <h1 className="text-4xl font-bold">Get in Touch</h1>
        <p className="mt-4 text-xl">
          We’d love to hear from you. Please contact us via the form below.
        </p>
      </div>

      <div className="container px-6 py-12 mx-auto">
        <div className="grid gap-12 md:grid-cols-2">
          <div className="p-8 bg-white shadow-lg rounded-xl">
            <h2 className="mb-6 text-2xl font-semibold text-gray-800">
              Contact Us
            </h2>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Your Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-3 mt-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Your Name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Your Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-3 mt-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="youremail@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Your Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full p-3 mt-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="(123) 456-7890"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Your Message
                </label>
                <textarea
                  name="message"
                  rows="4"
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full p-3 mt-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Write your message here..."
                  required
                ></textarea>
              </div>
              <div className="mt-6">
                <button
                  type="submit"
                  className="w-full py-3 text-lg font-semibold text-white bg-blue-600 rounded-md shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                >
                  {loading ? "Submitting..." : "Submit"}
                </button>
              </div>
            </form>
          </div>

          <div className="p-8 bg-white shadow-lg rounded-xl">
            <h2 className="mb-6 text-2xl font-semibold text-gray-800">
              Contact Information
            </h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <FaPhoneAlt className="mr-4 text-xl text-blue-600" />
                <span className="text-lg">+1 234 567 890</span>
              </div>
              <div className="flex items-center">
                <FaEnvelope className="mr-4 text-xl text-blue-600" />
                <span className="text-lg">contact@yourcompany.com</span>
              </div>
              <div className="flex items-center">
                <FaMapMarkerAlt className="mr-4 text-xl text-blue-600" />
                <span className="text-lg">
                  1234 Your Address, City, Country
                </span>
              </div>
            </div>
            <div className="mt-8">
              <h3 className="text-xl font-semibold text-gray-800">Follow Us</h3>
              <div className="flex mt-4 space-x-6">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaFacebookF className="text-2xl text-blue-600 hover:text-blue-700" />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaTwitter className="text-2xl text-blue-600 hover:text-blue-700" />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaInstagram className="text-2xl text-blue-600 hover:text-blue-700" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
