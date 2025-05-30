import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import api from "../../../api/index";
import { FaUser } from "react-icons/fa";

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
  const [profileImage, setProfileImage] = useState(null);
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
            email: user.email,
            full_name: user.full_name || "",
            phone_number: user.phone_number || "",
            address: user.address || "",
            role: user.role,
            gender: user.gender || "",
            is_active: Boolean(user.is_active),
          });
          if (user.profile_image) {
            setImagePreview(`/Uploads/${user.profile_image}`);
          }
        } else {
          setError("User not found");
        }
      } catch (err) {
        setError("Failed to fetch user");
        console.error(err);
      }
    };
    fetchUser();
  }, [id]);

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
          data.append(key, formData[key]);
        }
      });
      if (profileImage) {
        data.append("image", profileImage);
      }

      const response = await api.put(`/Usersmana.php?id=${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (response.data.success) {
        navigate("/admin/users");
      } else {
        setError(response.data.message || "Failed to update user");
      }
    } catch (err) {
      if (err.response && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("Failed to update user");
      }
      console.error(err);
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