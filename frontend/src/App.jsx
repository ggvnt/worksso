import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import { useAuthStore } from "./store/useAuthStore";
import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";
import Footer from "./components/Footer.jsx";
import AccountSetting from "./pages/AccountSetting.jsx";
import AdminDashboard from "./pages/AdminDashboard .jsx";
import CategoryPage from "./pages/CategoryPage.jsx";
import ServicePage from "./pages/ServicePage.jsx";
import CategoryByIdPage from "./pages/CategoryByIdPage.jsx";
import UpdateServiceModal from "./pages/UpdateServiceModalPage.jsx";
import ContactPage from "./pages/ContactPage.jsx";
import EmailVerification from "./pages/EmailVerification.jsx";
import ForgetPasswordPage from "./pages/ForgetPasswordPage.jsx";
import ResetPasswordPage from "./pages/ResetPasswordPage.jsx";
import ServiceDetails from "./pages/ServiceDetails.jsx";
import AdminServicesPage from "./pages/AdminServicesPage.jsx";

const App = () => {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();

  useEffect(() => {
    checkAuth(); // Check authentication status on page load
  }, [checkAuth]);

  if (isCheckingAuth && !authUser)
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="w-10 h-10 animate-spin" />
      </div>
    );

  return (
    <div>
      <Navbar />
      <div className="pt-16">
        <Routes>
          {/* Public Routes (Accessible without login) */}
          <Route path="/" element={<HomePage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/services/:categoryId" element={<CategoryByIdPage />} />
          <Route path="/servicePage" element={<ServicePage />} />

          {/* Signup & Login (Optional) */}
          <Route
            path="/signup"
            element={!authUser ? <SignUpPage /> : <Navigate to="/" />}
          />
          <Route
            path="/login"
            element={!authUser ? <LoginPage /> : <Navigate to="/" />}
          />
          <Route path="verify-email" element={<EmailVerification />} />
          <Route path="/forgot-password" element={<ForgetPasswordPage />} />
          <Route
            path="/reset-password/:token"
            element={<ResetPasswordPage />}
          />

          {/* Protected Routes (Require login) */}
          <Route
            path="/profile"
            element={authUser ? <ProfilePage /> : <Navigate to="/login" />}
          />
          <Route
            path="/accountSetting"
            element={authUser ? <AccountSetting /> : <Navigate to="/login" />}
          />

          {/* Admin-only Routes */}
          <Route
            path="/admin/dashboard"
            element={
              authUser?.role === "admin" ? (
                <AdminDashboard />
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/admin/category"
            element={
              authUser?.role === "admin" ? (
                <CategoryPage />
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route path="/admin/services" element={<AdminServicesPage />} />

          {/* Protected Service Update Route */}
          <Route
            path="/updateService/:serviceId"
            element={
              authUser ? <UpdateServiceModal /> : <Navigate to="/login" />
            }
          />

          <Route
            path="/servicesdetails/:id"
            element={
              authUser ? <ServiceDetails /> : <Navigate to="/login" />
            }
          />
          
        </Routes>
      </div>
      <Footer />
      <Toaster />
    </div>
  );
};

export default App;
