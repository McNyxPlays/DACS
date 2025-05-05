import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../../api/index";

const AddUser = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    full_name: "",
    role: "user",
    is_active: true,
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

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
      await api.post("/Usersmana.php", formData);
      navigate("/admin/users");
    } catch (err) {
      if (err.response && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError("Failed to add user");
      }
      console.error(err);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Add New User</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="max-w-lg">
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
            Add User
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
  );
};

export default AddUser;
