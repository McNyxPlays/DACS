import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import api from "../../../api/index";
import { FaUser, FaTrash } from "react-icons/fa";

const EditUser = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    email: "",
    full_name: "",
    phone_number: "",
    address: "",
    role: "user",
    gender: "",
    is_active: true,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get(`/Usersmana.php?id=${id}`);
        if (response.data.success && response.data.data.length > 0) {
          const user = response.data.data[0];
          setFormData({
            email: user.email || "",
            full_name: user.full_name || "",
            phone_number: user.phone_number || "",
            address: user.address || "",
            role: user.role || "user",
            gender: user.gender || "",
            is_active: Boolean(user.is_active),
          });
          setImagePreview(user.profile_image ? `/Uploads/${user.profile_image}` : null);
        } else {
          setError("User not found");
        }
      } catch (err) {
        setError("Failed to fetch user: " + (err.response?.data?.message || err.message));
        console.error(err);
      }
    };
    const checkAuth = async () => {
      try {
        const response = await api.get("/user.php");
        if (!response.data.success || response.data.user.role !== "admin") {
          setError("Unauthorized: Admin access required");
          navigate("/admin/users");
        }
      } catch (err) {
        setError("Failed to verify user: " + (err.response?.data?.message || err.message));
        navigate("/admin/users");
      }
    };
    fetchUser();
    checkAuth();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleRemoveImage = async () => {
    if (!window.confirm("Are you sure you want to remove the profile image?")) return;
    try {
      const data = new FormData();
      data.append("remove_image", "true");
      const response = await api.put(`/Usersmana.php?id=${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (response.data.success) {
        setImagePreview(null);
      } else {
        setError(response.data.message || "Failed to remove image");
      }
    } catch (err) {
      setError("Failed to remove image: " + (err.response?.data?.message || err.message));
      console.error("Error:", err.response?.data || err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        data.append(key, key === "is_active" ? (formData[key] ? "1" : "0") : formData[key]);
      });
      console.log("Sending data:", Object.fromEntries(data));

      const response = await api.put(`/Usersmana.php?id=${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (response.data.success) {
        navigate("/admin/users");
      } else {
        setError(response.data.message || "Failed to update user");
      }
    } catch (err) {
      setError("Failed to update user: " + (err.response?.data?.message || err.message));
      console.error("Error:", err.response?.data || err);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Edit User</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="max-w-4xl overflow-y-auto" style={{ maxHeight: "70vh" }}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
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
            <div>
              <label className="block text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Phone Number</label>
              <input
                type="text"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
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
            <div>
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
            <div>
              <label className="block text-gray-700 mb-2">Status</label>
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
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Address</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary h-24"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Profile Image</label>
            <div className="mt-2 flex items-center">
              {imagePreview ? (
                <>
                  <img
                    src={imagePreview}
                    alt="Profile Preview"
                    className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200 mr-4"
                  />
                  <button
                    onClick={handleRemoveImage}
                    className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 flex items-center"
                  >
                    <FaTrash className="mr-1" /> Remove
                  </button>
                </>
              ) : (
                <div className="w-20 h-20 bg-white border-2 border-gray-200 rounded-lg flex items-center justify-center">
                  <FaUser className="text-gray-600" size={32} />
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-4">
            <button
              type="submit"
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark"
            >
              Update User
            </button>
            <Link
              to="/admin/users"
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
            >
              Back
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUser;