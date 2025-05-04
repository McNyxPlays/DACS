import React, { useState, useEffect } from "react";
import api from "../../../api/index";

const ProfileSettings = ({ activeSection, user, onUserUpdate }) => {
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [profilePicture, setProfilePicture] = useState(
    user?.profile_image || ""
  );
  const [formData, setFormData] = useState({
    full_name: user?.full_name || "",
    email: user?.email || "",
    phone_number: user?.phone_number || "",
    address: user?.address || "",
    gender: user?.gender || "",
    custom_gender:
      user?.gender && !["male", "female"].includes(user?.gender)
        ? user.gender
        : "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const dropdown = document.getElementById("profileDropdownMenu");
      const trigger = document.getElementById("profileDropdownTrigger");
      if (
        dropdown &&
        trigger &&
        !dropdown.contains(event.target) &&
        !trigger.contains(event.target)
      ) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (user) {
      console.log("User data received in ProfileSettings:", user); // Debug dữ liệu user
      setFormData({
        full_name: user.full_name || "",
        email: user.email || "",
        phone_number: user.phone_number || "",
        address: user.address || "",
        gender: user.gender || "",
        custom_gender:
          user.gender && !["male", "female"].includes(user.gender)
            ? user.gender
            : "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setProfilePicture(user.profile_image || "");
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleProfilePictureChange = () => {
    const newProfilePicture = prompt("Enter new profile picture URL:");
    if (newProfilePicture) {
      setProfilePicture(newProfilePicture);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.full_name.trim()) {
      newErrors.full_name = "Display Name is required.";
    }
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Valid email is required.";
    }
    if (
      formData.phone_number &&
      !/^\+?\d{10,15}$/.test(formData.phone_number)
    ) {
      newErrors.phone_number = "Invalid phone number format (10-15 digits).";
    }
    if (formData.gender === "other" && !formData.custom_gender.trim()) {
      newErrors.custom_gender = "Please specify your gender.";
    }
    if (
      formData.newPassword &&
      formData.newPassword !== formData.confirmPassword
    ) {
      newErrors.confirmPassword =
        "New password and confirm password do not match.";
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccess("");
    setIsLoading(true);

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsLoading(false);
      return;
    }

    try {
      const updateData = {
        full_name: formData.full_name,
        email: formData.email,
        phone_number: formData.phone_number || null,
        address: formData.address || null,
        gender:
          formData.gender === "other"
            ? formData.custom_gender
            : formData.gender || null,
        profile_image: profilePicture || null,
        current_password: formData.currentPassword || null,
        new_password: formData.newPassword || null,
      };

      const response = await api.put("/user.php", updateData);
      if (response.data.status === "success") {
        setSuccess("Profile settings saved successfully!");
        localStorage.setItem("user", JSON.stringify(response.data.user));
        if (onUserUpdate) {
          onUserUpdate(response.data.user);
        }
      }
    } catch (err) {
      setErrors({
        general: err.response?.data?.message || "Error updating profile.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {activeSection === "profile" && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">
            Profile Information
          </h2>
          {errors.general && (
            <p className="text-red-500 mb-4">{errors.general}</p>
          )}
          {success && <p className="text-green-500 mb-4">{success}</p>}
          <form onSubmit={handleSubmit}>
            <div className="mb-6 flex flex-col md:flex-row items-start">
              <div className="mb-4 md:mb-0 md:mr-8">
                <div className="relative">
                  <img
                    src={profilePicture || "https://via.placeholder.com/96"}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={handleProfilePictureChange}
                    className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 shadow-md hover:bg-blue-700 !rounded-button whitespace-nowrap cursor-pointer"
                    disabled={isLoading}
                  >
                    <i className="fas fa-camera"></i>
                  </button>
                </div>
              </div>
              <div className="flex-1 w-full">
                <p className="text-gray-600 mb-4">
                  Upload a new profile picture. This will be displayed on your
                  profile and in community posts.
                </p>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 !rounded-button whitespace-nowrap cursor-pointer"
                    disabled={isLoading}
                  >
                    Upload New Picture
                  </button>
                  <button
                    type="button"
                    className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 !rounded-button whitespace-nowrap cursor-pointer"
                    onClick={() => setProfilePicture("")}
                    disabled={isLoading}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6 mt-6">
              <div className="mb-4">
                <label
                  htmlFor="full_name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Display Name
                </label>
                <input
                  type="text"
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  placeholder="Enter your display name"
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                />
                {errors.full_name && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.full_name}
                  </p>
                )}
              </div>
              <div className="mb-4">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>
              <div className="mb-4">
                <label
                  htmlFor="phone_number"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone_number"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleInputChange}
                  placeholder="Enter your phone number (e.g., +1234567890)"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                />
                {errors.phone_number && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.phone_number}
                  </p>
                )}
              </div>
              <div className="mb-4">
                <label
                  htmlFor="address"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Address
                </label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Enter your address"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                ></textarea>
              </div>
              <div className="mb-4">
                <label
                  htmlFor="gender"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Gender
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full vertex border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                {formData.gender === "other" && (
                  <input
                    type="text"
                    name="custom_gender"
                    value={formData.custom_gender}
                    onChange={handleInputChange}
                    placeholder="Specify gender"
                    className="w-full mt-2 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isLoading}
                  />
                )}
                {errors.custom_gender && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.custom_gender}
                  </p>
                )}
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6 mt-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">
                Change Password
              </h3>
              <div className="mb-4">
                <label
                  htmlFor="currentPassword"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Current Password
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  placeholder="Enter current password"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  placeholder="Enter new password"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                />
              </div>
              <div className="mb-6">
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm new password"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg mr-3 hover:bg-gray-50 !rounded-button whitespace-nowrap cursor-pointer"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 !rounded-button whitespace-nowrap cursor-pointer disabled:bg-blue-400"
                disabled={isLoading}
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default ProfileSettings;
