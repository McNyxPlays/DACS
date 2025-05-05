import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../../api/index";

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
    role: "user",
    is_active: true,
  });
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

      console.log("API Response:", response.data);

      if (response.data && typeof response.data === "object") {
        if (
          response.data.status === "success" &&
          Array.isArray(response.data.data)
        ) {
          setUsers(response.data.data);
          setError("");
        } else if (response.data.status === "error") {
          setUsers([]);
          setError(response.data.message || "Error from server");
        } else {
          setUsers([]);
          setError("Unexpected response format from server");
        }
      } else {
        setUsers([]);
        setError("Invalid response format from server");
      }
    } catch (err) {
      setUsers([]);
      if (err.response) {
        if (err.response.status === 403) {
          setError("You do not have permission to access this page.");
        } else if (err.response.data && err.response.data.message) {
          setError("Server error: " + err.response.data.message);
        } else {
          setError(
            "Server error: " + (err.response.statusText || "Unknown error")
          );
        }
      } else {
        setError("Failed to fetch users: " + (err.message || "Unknown error"));
      }
      console.error("Fetch users error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      const response = await api.delete("/Usersmana.php?id=" + userId);
      if (response.data.status === "success") {
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

  const openAddModal = () => {
    setModalMode("add");
    setFormData({
      email: "",
      password: "",
      full_name: "",
      role: "user",
      is_active: true,
    });
    setShowModal(true);
    setError("");
  };

  const openEditModal = (user) => {
    setModalMode("edit");
    setEditUserId(user.user_id);
    setFormData({
      email: user.email,
      full_name: user.full_name || "",
      role: user.role,
      is_active: user.is_active,
      password: "", // Không điền trước password khi chỉnh sửa
    });
    setShowModal(true);
    setError("");
  };

  const closeModal = () => {
    setShowModal(false);
    setEditUserId(null);
    setError("");
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalMode === "add") {
        const response = await api.post("/Usersmana.php", formData);
        if (response.data.status === "success") {
          fetchUsers(); // Tải lại danh sách người dùng
          closeModal();
        } else {
          setError(response.data.message || "Failed to add user");
        }
      } else {
        const response = await api.put(
          `/Usersmana.php?id=${editUserId}`,
          formData
        );
        if (response.data.status === "success") {
          fetchUsers(); // Tải lại danh sách người dùng
          closeModal();
        } else {
          setError(response.data.message || "Failed to update user");
        }
      }
    } catch (err) {
      if (err.response && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError(
          modalMode === "add" ? "Failed to add user" : "Failed to update user"
        );
      }
      console.error(err);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">User Management</h1>
      <div className="mb-4 flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="Search by email or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-1/3 px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <select
          value={isActive}
          onChange={(e) => setIsActive(parseInt(e.target.value))}
          className="w-full sm:w-1/4 px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value={-1}>All Status</option>
          <option value={1}>Active</option>
          <option value={0}>Inactive</option>
        </select>
        <button
          onClick={openAddModal}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark"
        >
          Add User
        </button>
      </div>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {loading ? (
        <p className="text-gray-500 mb-4">Loading users...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border">
            <thead>
              <tr>
                <th className="px-4 py-2 border">ID</th>
                <th className="px-4 py-2 border">Full Name</th>
                <th className="px-4 py-2 border">Email</th>
                <th className="px-4 py-2 border">Phone Number</th>
                <th className="px-4 py-2 border">Address</th>
                <th className="px-4 py-2 border">Role</th>
                <th className="px-4 py-2 border">Status</th>
                <th className="px-4 py-2 border">Created At</th>
                <th className="px-4 py-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(users) && users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.user_id}>
                    <td className="px-4 py-2 border">{user.user_id}</td>
                    <td className="px-4 py-2 border">
                      {user.full_name || "-"}
                    </td>
                    <td className="px-4 py-2 border">{user.email}</td>
                    <td className="px-4 py-2 border">
                      {user.phone_number || "-"}
                    </td>
                    <td className="px-4 py-2 border">{user.address || "-"}</td>
                    <td className="px-4 py-2 border">{user.role || "user"}</td>
                    <td className="px-4 py-2 border">
                      {user.is_active ? "Active" : "Inactive"}
                    </td>
                    <td className="px-4 py-2 border">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2 border flex gap-2">
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
                <tr>
                  <td colSpan="9" className="px-4 py-2 border text-center">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full">
            <h2 className="text-xl font-bold mb-4">
              {modalMode === "add" ? "Add New User" : "Edit User"}
            </h2>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              {modalMode === "add" && (
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary"
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
                  className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="user">User</option>
                  <option value="support">Support</option>
                  <option value="admin">Admin</option>
                  <option value="customizer">Customizer</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  Active
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
