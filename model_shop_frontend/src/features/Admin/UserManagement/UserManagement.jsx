import React, { useState, useEffect } from "react";
import api from "../../../api/index";
import { FaSearch, FaUser } from "react-icons/fa";
import { Toastify } from "../../../components/Toastify";

const UserManagement = ({ user }) => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [isActive, setIsActive] = useState(-1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    full_name: "",
    phone_number: "",
    address: "",
    role: "user",
    gender: "",
    is_active: true,
  });
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [editUserId, setEditUserId] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [search, isActive]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const params = { search };
      if (isActive >= 0) params.is_active = isActive;
      const response = await api.get("/Usersmana.php", { params });

      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        setUsers(response.data.data);
        setError("");
      } else {
        setUsers([]);
        setError(response.data.message || "Unexpected response format from server");
      }
    } catch (err) {
      setUsers([]);
      if (err.response) {
        if (err.response.status === 403) {
          setError("You do not have permission to access this page.");
        } else if (err.response.data && err.response.data.message) {
          setError("Server error: " + err.response.data.message);
        } else {
          setError("Server error: " + (err.response.statusText || "Unknown error"));
        }
      } else {
        setError("Failed to fetch users: " + (err.message || "Unknown error"));
      }
      console.error("Fetch users error:", err);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setModalMode("add");
    setFormData({
      email: "",
      password: "",
      full_name: "",
      phone_number: "",
      address: "",
      role: "user",
      gender: "",
      is_active: true,
    });
    setProfileImage(null);
    setImagePreview(null);
    setShowModal(true);
    setError("");
  };

  const openEditModal = (user) => {
    setModalMode("edit");
    setEditUserId(user.user_id);
    setFormData({
      email: user.email || "",
      full_name: user.full_name || "",
      phone_number: user.phone_number || "",
      address: user.address || "",
      role: user.role || "user",
      gender: user.gender || "",
      is_active: Boolean(user.is_active),
    });
    setProfileImage(null);
    setImagePreview(user.profile_image ? `/Uploads/${user.profile_image}` : null);
    setShowModal(true);
    setError("");
  };

  const closeModal = () => {
    setShowModal(false);
    setEditUserId(null);
    setProfileImage(null);
    setImagePreview(null);
    setError("");
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validImageTypes = ["image/jpeg", "image/png", "image/gif"];
      const maxSize = 5 * 1024 * 1024;
      if (!validImageTypes.includes(file.type)) {
        setError("Only JPEG, PNG, and GIF images are allowed");
        return;
      }
      if (file.size > maxSize) {
        setError("Image must be less than 5MB");
        return;
      }
      setError("");
      setProfileImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (profileImage && error) return;

    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key === "is_active") {
          data.append(key, formData[key] ? "1" : "0");
        } else {
          data.append(key, formData[key] || "");
        }
      });
      if (profileImage) {
        data.append("image", profileImage);
      }

      if (modalMode === "add") {
        const response = await api.post("/Usersmana.php", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        if (response.data.success) {
          Toastify.success("User added successfully");
          fetchUsers();
          closeModal();
        } else {
          setError(response.data.message || "Failed to add user");
        }
      } else {
        const response = await api.put(`/Usersmana.php?id=${editUserId}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        if (response.data.success) {
          Toastify.success("User updated successfully");
          fetchUsers();
          closeModal();
        } else {
          setError(response.data.message || "Failed to update user");
        }
      }
    } catch (err) {
      setError(
        modalMode === "add"
          ? "Failed to add user: " + (err.message || "Unknown error")
          : "Failed to update user: " + (err.message || "Unknown error")
      );
      console.error(err);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      const response = await api.delete(`/Usersmana.php?id=${userId}`);
      if (response.data.success) {
        setUsers(users.filter((user) => user.user_id !== userId));
        setError("");
      } else {
        setError(response.data.message || "Failed to delete user");
      }
    } catch (err) {
      if (err.response && err.response.status === 403) {
        setError("You do not have permission to perform this action.");
      } else {
        setError("Failed to delete user: " + (err.message || "Unknown error"));
      }
      console.error("Delete user error:", err);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">User Management</h1>
      <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by email or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 pl-10 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          <select
            value={isActive}
            onChange={(e) => setIsActive(parseInt(e.target.value))}
            className="w-full sm:w-48 px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value={-1}>All Status</option>
            <option value={1}>Active</option>
            <option value={0}>Inactive</option>
          </select>
          <button
            onClick={openAddModal}
            className="w-full sm:w-auto bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark flex items-center justify-center"
          >
            <FaUser className="mr-2" /> Add User
          </button>
        </div>
        {error && (
          <p className="text-red-500 mb-4 bg-red-100 p-3 rounded">{error}</p>
        )}
        {loading ? (
          <p className="text-gray-500 mb-4">Loading users...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border">
              <thead>
                <tr className="flex flex-wrap bg-gray-50">
                  <th className="flex-1 px-4 py-2 border text-center font-medium text-gray-700">ID</th>
                  <th className="flex-[2] px-4 py-2 border text-center font-medium text-gray-700">Full Name</th>
                  <th className="flex-[2] px-4 py-2 border text-center font-medium text-gray-700">Email</th>
                  <th className="flex-[2] px-4 py-2 border text-center font-medium text-gray-700">Phone</th>
                  <th className="flex-[2] px-4 py-2 border text-center font-medium text-gray-700">Address</th>
                  <th className="flex-1 px-4 py-2 border text-center font-medium text-gray-700">Role</th>
                  <th className="flex-1 px-4 py-2 border text-center font-medium text-gray-700">Status</th>
                  <th className="flex-1 px-4 py-2 border text-center font-medium text-gray-700">Created At</th>
                  <th className="flex-1 px-4 py-2 border text-center font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(users) && users.length > 0 ? (
                  users.map((user) => (
                    <tr key={user.user_id} className="flex flex-wrap hover:bg-gray-100">
                      <td className="flex-1 px-4 py-2 border text-center">{user.user_id}</td>
                      <td className="flex-[2] px-4 py-2 border text-center">{user.full_name || "-"}</td>
                      <td className="flex-[2] px-4 py-2 border text-center">{user.email}</td>
                      <td className="flex-[2] px-4 py-2 border text-center">{user.phone_number || "-"}</td>
                      <td className="flex-[2] px-4 py-2 border text-center">{user.address || "-"}</td>
                      <td className="flex-1 px-4 py-2 border text-center">{user.role || "user"}</td>
                      <td className="flex-1 px-4 py-2 border text-center">
                        <span
                          className={`px-2 py-1 rounded-full text-sm ${
                            user.is_active
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {user.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="flex-1 px-4 py-2 border text-center">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="flex-1 px-4 py-2 border flex justify-center gap-2">
                        <button
                          onClick={() => openEditModal(user)}
                          className="text-blue-500 hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(user.user_id)}
                          className="text-red-500 hover:underline"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr className="flex flex-wrap">
                    <td
                      colSpan="9"
                      className="flex-1 px-4 py-2 border text-center text-gray-500"
                    >
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full" style={{ maxHeight: "70vh", overflowY: "auto" }}>
            <h2 className="text-xl font-bold mb-4">
              {modalMode === "add" ? "Add New User" : "Edit User"}
            </h2>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              {modalMode === "add" && (
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Password *</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              )}
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Phone Number</label>
                <input
                  type="text"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="user">User</option>
                  <option value="support">Support</option>
                  <option value="admin">Admin</option>
                  <option value="customizer">Customizer</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary h-24"
                />
              </div>
              {modalMode === "edit" && (
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Profile Image</label>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/gif"
                    name="image"
                    onChange={handleImageChange}
                    className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <div className="mt-2">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Profile Preview"
                        className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-white border-2 border-gray-200 rounded-lg flex items-center justify-center">
                        <FaUser className="text-gray-600" size={32} />
                      </div>
                    )}
                  </div>
                </div>
              )}
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleChange}
                    className="mr-2 h-5 w-5 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <span className="text-gray-700">Active</span>
                </label>
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark"
                >
                  {modalMode === "add" ? "Add User" : "Update User"}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;