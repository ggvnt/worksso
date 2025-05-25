import { useEffect } from "react";
import { useAdminStore } from "../store/useAdminStore.js";
import { useAuthStore } from "../store/useAuthStore.js";
import { useNavigate } from "react-router-dom"; // Optional, for redirect

const AdminDashboard = () => {
  const { authUser } = useAuthStore(); // For checking if the user is an admin
  const { users, isLoading, error, fetchUsers, deleteUser } = useAdminStore(); // Fetch users from the store
  const navigate = useNavigate(); // Optional, to redirect

  useEffect(() => {
    // Check if the user is an admin, otherwise redirect
    if (authUser?.role !== "admin") {
      alert("You are not authorized to view this page!");
      navigate("/"); // Redirect to home if not admin
      return;
    }

    // Fetch users if the user is an admin
    fetchUsers();
  }, [authUser, fetchUsers, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-t-2 border-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500">Error: {error}</div>;
  }

  // Handle delete user action
  const handleDelete = (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      deleteUser(userId);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 p-5 text-white bg-blue-800">
        <h2 className="mb-5 text-2xl font-semibold">Admin Dashboard</h2>
        <ul>
          <li className="mb-4">
            <a href="/" className="text-white hover:text-blue-300">
              Home
            </a>
          </li>
          <li className="mb-4">
            <a
              href="/admin/dashboard"
              className="text-white hover:text-blue-300"
            >
              Dashboard
            </a>
          </li>
          <li className="mb-4">
            <a href="/profile" className="text-white hover:text-blue-300">
              Profile
            </a>
          </li>
          <li className="mb-4">
            <a href="/admin/services" className="text-white hover:text-blue-300">
              Settings
            </a>
          </li>
          <li>
            <a href="/login" className="text-white hover:text-blue-300">
              Logout
            </a>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-10">
        <h1 className="mb-5 text-3xl font-semibold text-gray-800">
          Users List
        </h1>

        {/* User List Table */}
        <div className="p-5 overflow-x-auto bg-white rounded-lg shadow-lg">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-2 text-left text-gray-600">Full Name</th>
                <th className="px-4 py-2 text-left text-gray-600">Email</th>
                <th className="px-4 py-2 text-left text-gray-600">Role</th>
                <th className="px-4 py-2 text-left text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2 text-gray-700">{user.fullName}</td>
                  <td className="px-4 py-2 text-gray-700">{user.email}</td>
                  <td className="px-4 py-2 text-gray-700">{user.role}</td>
                  <td className="flex px-4 py-2 space-x-3">
                    <button
                      onClick={() => navigate(`/admin/edit/${user._id}`)}
                      className="px-4 py-2 text-white bg-yellow-500 rounded-md hover:bg-yellow-400"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(user._id)}
                      className="px-4 py-2 text-white bg-red-500 rounded-md hover:bg-red-400"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add Category Button */}
        <div className="mt-5">
          <button
            onClick={() => navigate("/admin/category")} // Navigate to category page
            className="px-4 py-2 text-white bg-green-500 rounded-md hover:bg-green-400"
          >
            Add Category
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
