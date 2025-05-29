import React, { useState, useEffect, useCallback } from "react";
import api from "../../../api/index";
import { Toastify } from "../../../components/Toastify";

const ProfileSettings = ({ activeSection, user: initialUser, onUserUpdate }) => {
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const [profilePicture, setProfilePicture] = useState("");
    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        phone_number: "",
        address: "",
        gender: "",
        custom_gender: "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
        profile_image: null,
    });
    const [errors, setErrors] = useState({});
    const [success, setSuccess] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isFetched, setIsFetched] = useState(false);

    const fetchUserData = useCallback(async () => {
        try {
            const response = await api.get("/user.php");
            if (response.data.status === "success") {
                const fetchedUser = response.data.user;
                console.log("Fetched user data:", fetchedUser); // Debug fetched data
                setFormData((prev) => ({
                    ...prev,
                    full_name: fetchedUser.full_name || "Default Name",
                    email: fetchedUser.email || "",
                    phone_number: fetchedUser.phone_number || "",
                    address: fetchedUser.address || "",
                    gender: fetchedUser.gender || "",
                    custom_gender:
                        fetchedUser.gender && !["male", "female"].includes(fetchedUser.gender)
                            ? fetchedUser.gender
                            : "",
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                    profile_image: null,
                }));
                setProfilePicture(
                    fetchedUser.profile_image
                        ? `http://localhost:8080/${fetchedUser.profile_image}`
                        : ""
                );
                if (onUserUpdate) onUserUpdate(fetchedUser);
            } else {
                setErrors({ general: "Failed to fetch user data." });
                Toastify.error("Failed to fetch user data.");
            }
        } catch (err) {
            console.error("Error fetching user data:", err);
            setErrors({ general: err.response?.data?.message || "Error fetching user data." });
            Toastify.error(err.response?.data?.message || "Error fetching user data.");
        } finally {
            setIsFetched(true);
        }
    }, [onUserUpdate]);

    useEffect(() => {
        if (!isFetched) {
            fetchUserData();
        }
    }, [fetchUserData, isFetched]);

    useEffect(() => {
        if (initialUser && !isFetched) {
            console.log("Initial user prop:", initialUser); // Debug initialUser
            setFormData((prev) => ({
                ...prev,
                full_name: initialUser.full_name || "Default Name",
                email: initialUser.email || "",
                phone_number: initialUser.phone_number || "",
                address: initialUser.address || "",
                gender: initialUser.gender || "",
                custom_gender:
                    initialUser.gender && !["male", "female"].includes(initialUser.gender)
                        ? initialUser.gender
                        : "",
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
                profile_image: null,
            }));
            setProfilePicture(
                initialUser.profile_image
                    ? `http://localhost:8080/${initialUser.profile_image}`
                    : ""
            );
            setIsFetched(true);
        }
    }, [initialUser, isFetched]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        console.log(`Input changed - ${name}: ${value}`);
        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: "", general: "" }));
    };

    const handleProfilePictureChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!["image/jpeg", "image/png", "image/gif"].includes(file.type)) {
                setErrors({ profile_image: "Only JPEG, PNG, or GIF images are allowed." });
                Toastify.error("Only JPEG, PNG, or GIF images are allowed.");
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                setErrors({ profile_image: "Image size exceeds 5MB limit." });
                Toastify.error("Image size exceeds 5MB limit.");
                return;
            }
            setFormData((prev) => ({ ...prev, profile_image: file }));
            setErrors((prev) => ({ ...prev, profile_image: "" }));
            const reader = new FileReader();
            reader.onloadend = () => setProfilePicture(reader.result);
            reader.readAsDataURL(file);
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
        if (formData.phone_number) {
            const phoneRegex = /^\+?[\d\s()-]{10,15}$/;
            if (!phoneRegex.test(formData.phone_number)) {
                newErrors.phone_number =
                    "Invalid phone number format (10-15 digits, may include spaces, dashes, or parentheses).";
            }
        }
        if (formData.gender === "other" && !formData.custom_gender.trim()) {
            newErrors.custom_gender = "Please specify your gender.";
        }
        if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
            newErrors.confirmPassword = "New password and confirm password do not match.";
        }
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setSuccess("");
        setIsLoading(true);

        console.log("Form data before submission:", formData);

        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            console.log("Validation errors:", validationErrors);
            setErrors(validationErrors);
            setIsLoading(false);
            return;
        }

        const formDataToSend = new FormData();
        formDataToSend.append("full_name", formData.full_name.trim() || "Jane Doe");
        formDataToSend.append("email", formData.email);
        const sanitizedPhoneNumber = formData.phone_number
            ? formData.phone_number.replace(/[^0-9+]/g, "").replace(/^(\+\d{1,3})(\d+)/, "$1$2")
            : "";
        formDataToSend.append("phone_number", sanitizedPhoneNumber);
        formDataToSend.append("address", formData.address || "");
        formDataToSend.append(
            "gender",
            formData.gender === "other" ? formData.custom_gender : formData.gender || ""
        );
        if (formData.profile_image) {
            formDataToSend.append("profile_image", formData.profile_image);
        } else if (!initialUser?.profile_image && !profilePicture) {
            formDataToSend.append("remove_profile_image", "true");
        }
        if (formData.currentPassword) {
            formDataToSend.append("current_password", formData.currentPassword);
        }
        if (formData.newPassword) {
            formDataToSend.append("new_password", formData.newPassword);
        }

        for (let [key, value] of formDataToSend.entries()) {
            console.log(`FormData entry - ${key}: ${value}`);
        }

        try {
            const response = await api.put("/user.php", formDataToSend, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            if (response.data.status === "success") {
                setSuccess("Profile settings saved successfully!");
                const updatedUser = response.data.user;
                setFormData((prev) => ({
                    ...prev,
                    full_name: updatedUser.full_name || "",
                    email: updatedUser.email || "",
                    phone_number: updatedUser.phone_number || "",
                    address: updatedUser.address || "",
                    gender: updatedUser.gender || "",
                    custom_gender:
                        updatedUser.gender && !["male", "female"].includes(updatedUser.gender)
                            ? updatedUser.gender
                            : "",
                    profile_image: updatedUser.profile_image ? null : prev.profile_image,
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                }));
                setProfilePicture(
                    updatedUser.profile_image
                        ? `http://localhost:8080/${updatedUser.profile_image}`
                        : ""
                );
                if (onUserUpdate) onUserUpdate(updatedUser);
                Toastify.success("Profile updated successfully!");
            } else {
                setErrors({ general: response.data.message || "Failed to save changes." });
                Toastify.error(response.data.message || "Failed to save changes.");
            }
        } catch (err) {
            console.error("Error updating profile:", err);
            const errorMessage =
                err.response?.data?.message || err.message || "Error updating profile.";
            setErrors({
                general:
                    errorMessage === "Failed to upload image: Unable to move file to destination"
                        ? "Failed to upload profile image. The server may have permission issues with the upload directory. Please try again or contact support."
                        : errorMessage === "Failed to create upload directory"
                        ? "Failed to upload profile image. The server could not create the upload directory. Please contact support."
                        : errorMessage === "Upload directory is not writable"
                        ? "Failed to upload profile image. The server upload directory is not writable. Please contact support."
                        : errorMessage === "Email already exists"
                        ? "This email is already in use. Please use a different email."
                        : errorMessage === "Current password is incorrect"
                        ? "The current password you entered is incorrect."
                        : errorMessage === "Display name is required"
                        ? "Please enter a display name."
                        : "An error occurred while saving changes. Please try again.",
            });
            Toastify.error(errors.general);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            const dropdown = document.getElementById("profileDropdownMenu");
            const trigger = document.getElementById("profileDropdownTrigger");
            if (dropdown && trigger && !dropdown.contains(event.target) && !trigger.contains(event.target)) {
                setIsProfileDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <>
            {activeSection === "profile" && (
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-6">Profile Information</h2>
                    {errors.general && <p className="text-red-500 mb-4">{errors.general}</p>}
                    {success && <p className="text-green-500 mb-4">{success}</p>}
                    <form onSubmit={handleSubmit}>
                        <div className="mb-6 flex flex-col md:flex-row items-start">
                            <div className="mb-4 md:mb-0 md:mr-8">
                                <div className="relative">
                                    {profilePicture ? (
                                        <img
                                            src={profilePicture}
                                            alt="Profile"
                                            className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-sm"
                                        />
                                    ) : (
                                        <div className="w-24 h-24 rounded-full border-4 border-white shadow-sm flex items-center justify-center bg-gray-200">
                                            <i className="ri-user-line ri-3x text-gray-500"></i>
                                        </div>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => document.querySelector('input[type="file"]').click()}
                                        className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 shadow-md hover:bg-blue-700 cursor-pointer"
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
                                    <label className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 cursor-pointer">
                                        Upload New Picture
                                        <input
                                            type="file"
                                            accept="image/jpeg,image/png,image/gif"
                                            onChange={handleProfilePictureChange}
                                            className="hidden"
                                            disabled={isLoading}
                                            name="profile_image"
                                        />
                                    </label>
                                    <button
                                        type="button"
                                        className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                                        onClick={() => {
                                            setProfilePicture("");
                                            setFormData((prev) => ({ ...prev, profile_image: null }));
                                        }}
                                        disabled={isLoading}
                                    >
                                        Remove
                                    </button>
                                </div>
                                {errors.profile_image && (
                                    <p className="text-red-500 text-sm mt-1">{errors.profile_image}</p>
                                )}
                            </div>
                        </div>

                        <div className="border-t border-gray-200 pt-6 mt-6">
                            <div className="mb-4">
                                <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
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
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    disabled={isLoading}
                                />
                                {errors.full_name && (
                                    <p className="text-red-500 text-sm mt-1">{errors.full_name}</p>
                                )}
                            </div>
                            <div className="mb-4">
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
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
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    disabled={isLoading}
                                />
                                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                            </div>
                            <div className="mb-4">
                                <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-1">
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    id="phone_number"
                                    name="phone_number"
                                    value={formData.phone_number}
                                    onChange={handleInputChange}
                                    placeholder="Enter your phone number (e.g., +1234567890)"
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    disabled={isLoading}
                                />
                                {errors.phone_number && (
                                    <p className="text-red-500 text-sm mt-1">{errors.phone_number}</p>
                                )}
                            </div>
                            <div className="mb-4">
                                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                                    Address
                                </label>
                                <textarea
                                    id="address"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    placeholder="Enter your address"
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    disabled={isLoading}
                                ></textarea>
                            </div>
                            <div className="mb-4">
                                <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                                    Gender
                                </label>
                                <select
                                    id="gender"
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleInputChange}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                        className="w-full mt-2 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        disabled={isLoading}
                                    />
                                )}
                                {errors.custom_gender && (
                                    <p className="text-red-500 text-sm mt-1">{errors.custom_gender}</p>
                                )}
                            </div>
                        </div>

                        <div className="border-t border-gray-200 pt-6 mt-6">
                            <h3 className="text-lg font-medium text-gray-800 mb-4">Change Password</h3>
                            <div className="mb-4">
                                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                    Current Password
                                </label>
                                <input
                                    type="password"
                                    id="currentPassword"
                                    name="currentPassword"
                                    value={formData.currentPassword}
                                    onChange={handleInputChange}
                                    placeholder="Enter current password"
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                    New Password
                                </label>
                                <input
                                    type="password"
                                    id="newPassword"
                                    name="newPassword"
                                    value={formData.newPassword}
                                    onChange={handleInputChange}
                                    placeholder="Enter new password"
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="mb-6">
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                    Confirm New Password
                                </label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    placeholder="Confirm new password"
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    disabled={isLoading}
                                />
                                {errors.confirmPassword && (
                                    <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="button"
                                className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg mr-3 hover:bg-gray-50 cursor-pointer"
                                onClick={() => setIsProfileDropdownOpen(false)}
                                disabled={isLoading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 cursor-pointer disabled:bg-blue-400"
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