import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";

const AccountSettings = () => {
  const [activeSection, setActiveSection] = useState("profile");
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [profilePicture, setProfilePicture] = useState(
    "https://readdy.ai/api/search-image?query=professional%2520headshot%2520of%2520a%2520male%2520model%2520builder%2520with%2520short%2520hair%252C%2520neutral%2520expression%252C%2520studio%2520lighting%252C%2520clean%2520background%252C%2520high%2520quality%2520portrait&width=40&height=40&seq=1&orientation=squarish"
  );

  // Form state
  const [formData, setFormData] = useState({
    displayName: "Michael Chen",
    email: "michael.chen@example.com",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Notification preferences state
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    communityUpdates: true,
    directMessages: true,
    buildComments: false,
    eventReminders: true,
  });

  // Privacy settings state
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: "public",
    showOnlineStatus: true,
    allowDirectMessages: true,
    showBuildHistory: true,
    whoCanSeeBuilds: "everyone",
  });

  // Display preferences state
  const [displayPreferences, setDisplayPreferences] = useState({
    theme: "light",
    language: "english",
    timezone: "America/New_York",
  });

  // Close dropdown when clicking outside
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

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle notification toggle changes
  const handleNotificationToggle = (setting) => {
    setNotifications({
      ...notifications,
      [setting]: !notifications[setting],
    });
  };

  // Handle privacy settings changes
  const handlePrivacyToggle = (setting) => {
    setPrivacySettings({
      ...privacySettings,
      [setting]: !privacySettings[setting],
    });
  };

  // Handle privacy radio button changes
  const handlePrivacyRadioChange = (e) => {
    setPrivacySettings({
      ...privacySettings,
      whoCanSeeBuilds: e.target.value,
    });
  };

  // Handle display preferences changes
  const handleDisplayPreferenceChange = (e) => {
    const { name, value } = e.target;
    setDisplayPreferences({
      ...displayPreferences,
      [name]: value,
    });
  };

  // Handle profile picture change
  const handleProfilePictureChange = () => {
    const newProfilePicture =
      "https://readdy.ai/api/search-image?query=professional%2520headshot%2520of%2520a%2520male%2520model%2520builder%2520with%2520short%2520hair%252C%2520confident%2520expression%252C%2520studio%2520lighting%252C%2520clean%2520background%252C%2520high%2520quality%2520portrait&width=120&height=120&seq=14&orientation=squarish";
    setProfilePicture(newProfilePicture);
  };

  // Handle form submission
  const handleSubmit = (e, section) => {
    e.preventDefault();
    alert(`${section} settings saved successfully!`);
  };

  return (
    <main className="container mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center text-sm text-gray-500">
        <NavLink to="/community" className="hover:text-blue-600">
          <i className="fas fa-home mr-2"></i>Home
        </NavLink>
        <i className="fas fa-chevron-right mx-2 text-xs"></i>
        <span className="text-gray-700 font-medium">Account Settings</span>
      </div>

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Account Settings
        </h1>
        <p className="text-gray-600">
          Manage your account information, notification preferences, privacy
          settings, and more.
        </p>
      </div>

      {/* Settings Layout */}
      <div className="flex flex-col md:flex-row">
        {/* Settings Navigation */}
        <div className="w-full md:w-1/4 mb-6 md:mb-0 md:pr-6">
          <div className="bg-white rounded-lg shadow-sm p-4 sticky top-6">
            <h2 className="font-medium text-gray-800 mb-4">Settings</h2>
            <ul className="space-y-1">
              <li>
                <button
                  onClick={() => setActiveSection("profile")}
                  className={`w-full text-left px-3 py-2 rounded-lg flex items-center ${
                    activeSection === "profile"
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <i
                    className={`fas fa-user mr-3 ${
                      activeSection === "profile"
                        ? "text-blue-500"
                        : "text-gray-500"
                    }`}
                  ></i>
                  Profile Information
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveSection("notifications")}
                  className={`w-full text-left px-3 py-2 rounded-lg flex items-center ${
                    activeSection === "notifications"
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <i
                    className={`fas fa-bell mr-3 ${
                      activeSection === "notifications"
                        ? "text-blue-500"
                        : "text-gray-500"
                    }`}
                  ></i>
                  Notification Preferences
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveSection("privacy")}
                  className={`w-full text-left px-3 py-2 rounded-lg flex items-center ${
                    activeSection === "privacy"
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <i
                    className={`fas fa-lock mr-3 ${
                      activeSection === "privacy"
                        ? "text-blue-500"
                        : "text-gray-500"
                    }`}
                  ></i>
                  Privacy Settings
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveSection("display")}
                  className={`w-full text-left px-3 py-2 rounded-lg flex items-center ${
                    activeSection === "display"
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <i
                    className={`fas fa-desktop mr-3 ${
                      activeSection === "display"
                        ? "text-blue-500"
                        : "text-gray-500"
                    }`}
                  ></i>
                  Display Preferences
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveSection("account")}
                  className={`w-full text-left px-3 py-2 rounded-lg flex items-center ${
                    activeSection === "account"
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <i
                    className={`fas fa-cog mr-3 ${
                      activeSection === "account"
                        ? "text-blue-500"
                        : "text-gray-500"
                    }`}
                  ></i>
                  Account Management
                </button>
              </li>
            </ul>
            <div className="mt-6 pt-6 border-t border-gray-200">
              <NavLink
                to="/community"
                className="flex items-center text-blue-600 hover:text-blue-700 font-medium"
              >
                <i className="fas fa-arrow-left mr-2"></i>
                Back to Community
              </NavLink>
            </div>
          </div>
        </div>

        {/* Settings Content */}
        <div className="w-full md:w-3/4">
          {/* Profile Information */}
          {activeSection === "profile" && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                Profile Information
              </h2>
              <form onSubmit={(e) => handleSubmit(e, "Profile")}>
                <div className="mb-6 flex flex-col md:flex-row items-start">
                  <div className="mb-4 md:mb-0 md:mr-8">
                    <div className="relative">
                      <img
                        src={profilePicture}
                        alt="Profile"
                        className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={handleProfilePictureChange}
                        className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 shadow-md hover:bg-blue-700 !rounded-button whitespace-nowrap cursor-pointer"
                      >
                        <i className="fas fa-camera"></i>
                      </button>
                    </div>
                  </div>
                  <div className="flex-1 w-full">
                    <p className="text-gray-600 mb-4">
                      Upload a new profile picture. This will be displayed on
                      your profile and in community posts.
                    </p>
                    <div className="flex space-x-3">
                      <button
                        type="button"
                        className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 !rounded-button whitespace-nowrap cursor-pointer"
                      >
                        Upload New Picture
                      </button>
                      <button
                        type="button"
                        className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 !rounded-button whitespace-nowrap cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6 mt-6">
                  <div className="mb-4">
                    <label
                      htmlFor="displayName"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Display Name
                    </label>
                    <input
                      type="text"
                      id="displayName"
                      name="displayName"
                      value={formData.displayName}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
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
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
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
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg mr-3 hover:bg-gray-50 !rounded-button whitespace-nowrap cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 !rounded-button whitespace-nowrap cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Notification Preferences */}
          {activeSection === "notifications" && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                Notification Preferences
              </h2>
              <form onSubmit={(e) => handleSubmit(e, "Notifications")}>
                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div>
                      <h3 className="font-medium text-gray-800">
                        Email Notifications
                      </h3>
                      <p className="text-sm text-gray-600">
                        Receive notifications via email
                      </p>
                    </div>
                    <div className="relative">
                      <button
                        type="button"
                        className={`w-12 h-6 rounded-full ${
                          notifications.emailNotifications
                            ? "bg-blue-600"
                            : "bg-gray-300"
                        } transition-colors duration-200 focus:outline-none cursor-pointer`}
                        onClick={() =>
                          handleNotificationToggle("emailNotifications")
                        }
                      >
                        <span
                          className={`block w-4 h-4 bg-white rounded-full transform transition-transform duration-200 ${
                            notifications.emailNotifications
                              ? "translate-x-7"
                              : "translate-x-1"
                          }`}
                        ></span>
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div>
                      <h3 className="font-medium text-gray-800">
                        Push Notifications
                      </h3>
                      <p className="text-sm text-gray-600">
                        Receive notifications on your device
                      </p>
                    </div>
                    <div className="relative">
                      <button
                        type="button"
                        className={`w-12 h-6 rounded-full ${
                          notifications.pushNotifications
                            ? "bg-blue-600"
                            : "bg-gray-300"
                        } transition-colors duration-200 focus:outline-none cursor-pointer`}
                        onClick={() =>
                          handleNotificationToggle("pushNotifications")
                        }
                      >
                        <span
                          className={`block w-4 h-4 bg-white rounded-full transform transition-transform duration-200 ${
                            notifications.pushNotifications
                              ? "translate-x-7"
                              : "translate-x-1"
                          }`}
                        ></span>
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div>
                      <h3 className="font-medium text-gray-800">
                        Community Updates
                      </h3>
                      <p className="text-sm text-gray-600">
                        Receive updates about community events and news
                      </p>
                    </div>
                    <div className="relative">
                      <button
                        type="button"
                        className={`w-12 h-6 rounded-full ${
                          notifications.communityUpdates
                            ? "bg-blue-600"
                            : "bg-gray-300"
                        } transition-colors duration-200 focus:outline-none cursor-pointer`}
                        onClick={() =>
                          handleNotificationToggle("communityUpdates")
                        }
                      >
                        <span
                          className={`block w-4 h-4 bg-white rounded-full transform transition-transform duration-200 ${
                            notifications.communityUpdates
                              ? "translate-x-7"
                              : "translate-x-1"
                          }`}
                        ></span>
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div>
                      <h3 className="font-medium text-gray-800">
                        Direct Messages
                      </h3>
                      <p className="text-sm text-gray-600">
                        Receive notifications for direct messages
                      </p>
                    </div>
                    <div className="relative">
                      <button
                        type="button"
                        className={`w-12 h-6 rounded-full ${
                          notifications.directMessages
                            ? "bg-blue-600"
                            : "bg-gray-300"
                        } transition-colors duration-200 focus:outline-none cursor-pointer`}
                        onClick={() =>
                          handleNotificationToggle("directMessages")
                        }
                      >
                        <span
                          className={`block w-4 h-4 bg-white rounded-full transform transition-transform duration-200 ${
                            notifications.directMessages
                              ? "translate-x-7"
                              : "translate-x-1"
                          }`}
                        ></span>
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div>
                      <h3 className="font-medium text-gray-800">
                        Build Comments
                      </h3>
                      <p className="text-sm text-gray-600">
                        Receive notifications when someone comments on your
                        builds
                      </p>
                    </div>
                    <div className="relative">
                      <button
                        type="button"
                        className={`w-12 h-6 rounded-full ${
                          notifications.buildComments
                            ? "bg-blue-600"
                            : "bg-gray-300"
                        } transition-colors duration-200 focus:outline-none cursor-pointer`}
                        onClick={() =>
                          handleNotificationToggle("buildComments")
                        }
                      >
                        <span
                          className={`block w-4 h-4 bg-white rounded-full transform transition-transform duration-200 ${
                            notifications.buildComments
                              ? "translate-x-7"
                              : "translate-x-1"
                          }`}
                        ></span>
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div>
                      <h3 className="font-medium text-gray-800">
                        Event Reminders
                      </h3>
                      <p className="text-sm text-gray-600">
                        Receive reminders about upcoming events
                      </p>
                    </div>
                    <div className="relative">
                      <button
                        type="button"
                        className={`w-12 h-6 rounded-full ${
                          notifications.eventReminders
                            ? "bg-blue-600"
                            : "bg-gray-300"
                        } transition-colors duration-200 focus:outline-none cursor-pointer`}
                        onClick={() =>
                          handleNotificationToggle("eventReminders")
                        }
                      >
                        <span
                          className={`block w-4 h-4 bg-white rounded-full transform transition-transform duration-200 ${
                            notifications.eventReminders
                              ? "translate-x-7"
                              : "translate-x-1"
                          }`}
                        ></span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg mr-3 hover:bg-gray-50 !rounded-button whitespace-nowrap cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 !rounded-button whitespace-nowrap cursor-pointer"
                  >
                    Save Preferences
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Privacy Settings */}
          {activeSection === "privacy" && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                Privacy Settings
              </h2>
              <form onSubmit={(e) => handleSubmit(e, "Privacy")}>
                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div>
                      <h3 className="font-medium text-gray-800">
                        Profile Visibility
                      </h3>
                      <p className="text-sm text-gray-600">
                        Set your profile to public or private
                      </p>
                    </div>
                    <div className="relative">
                      <button
                        type="button"
                        className={`w-12 h-6 rounded-full ${
                          privacySettings.profileVisibility === "public"
                            ? "bg-blue-600"
                            : "bg-gray-300"
                        } transition-colors duration-200 focus:outline-none cursor-pointer`}
                        onClick={() =>
                          setPrivacySettings({
                            ...privacySettings,
                            profileVisibility:
                              privacySettings.profileVisibility === "public"
                                ? "private"
                                : "public",
                          })
                        }
                      >
                        <span
                          className={`block w-4 h-4 bg-white rounded-full transform transition-transform duration-200 ${
                            privacySettings.profileVisibility === "public"
                              ? "translate-x-7"
                              : "translate-x-1"
                          }`}
                        ></span>
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div>
                      <h3 className="font-medium text-gray-800">
                        Show Online Status
                      </h3>
                      <p className="text-sm text-gray-600">
                        Allow others to see when you're online
                      </p>
                    </div>
                    <div className="relative">
                      <button
                        type="button"
                        className={`w-12 h-6 rounded-full ${
                          privacySettings.showOnlineStatus
                            ? "bg-blue-600"
                            : "bg-gray-300"
                        } transition-colors duration-200 focus:outline-none cursor-pointer`}
                        onClick={() => handlePrivacyToggle("showOnlineStatus")}
                      >
                        <span
                          className={`block w-4 h-4 bg-white rounded-full transform transition-transform duration-200 ${
                            privacySettings.showOnlineStatus
                              ? "translate-x-7"
                              : "translate-x-1"
                          }`}
                        ></span>
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div>
                      <h3 className="font-medium text-gray-800">
                        Allow Direct Messages
                      </h3>
                      <p className="text-sm text-gray-600">
                        Allow others to send you direct messages
                      </p>
                    </div>
                    <div className="relative">
                      <button
                        type="button"
                        className={`w-12 h-6 rounded-full ${
                          privacySettings.allowDirectMessages
                            ? "bg-blue-600"
                            : "bg-gray-300"
                        } transition-colors duration-200 focus:outline-none cursor-pointer`}
                        onClick={() =>
                          handlePrivacyToggle("allowDirectMessages")
                        }
                      >
                        <span
                          className={`block w-4 h-4 bg-white rounded-full transform transition-transform duration-200 ${
                            privacySettings.allowDirectMessages
                              ? "translate-x-7"
                              : "translate-x-1"
                          }`}
                        ></span>
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div>
                      <h3 className="font-medium text-gray-800">
                        Show Build History
                      </h3>
                      <p className="text-sm text-gray-600">
                        Allow others to see your build history
                      </p>
                    </div>
                    <div className="relative">
                      <button
                        type="button"
                        className={`w-12 h-6 rounded-full ${
                          privacySettings.showBuildHistory
                            ? "bg-blue-600"
                            : "bg-gray-300"
                        } transition-colors duration-200 focus:outline-none cursor-pointer`}
                        onClick={() => handlePrivacyToggle("showBuildHistory")}
                      >
                        <span
                          className={`block w-4 h-4 bg-white rounded-full transform transition-transform duration-200 ${
                            privacySettings.showBuildHistory
                              ? "translate-x-7"
                              : "translate-x-1"
                          }`}
                        ></span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="font-medium text-gray-800 mb-3">
                    Who can see my builds
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="everyone"
                        name="whoCanSeeBuilds"
                        value="everyone"
                        checked={privacySettings.whoCanSeeBuilds === "everyone"}
                        onChange={handlePrivacyRadioChange}
                        className="mr-2"
                      />
                      <label htmlFor="everyone" className="text-gray-700">
                        Everyone
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="friends"
                        name="whoCanSeeBuilds"
                        value="friends"
                        checked={privacySettings.whoCanSeeBuilds === "friends"}
                        onChange={handlePrivacyRadioChange}
                        className="mr-2"
                      />
                      <label htmlFor="friends" className="text-gray-700">
                        Friends Only
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="onlyMe"
                        name="whoCanSeeBuilds"
                        value="onlyMe"
                        checked={privacySettings.whoCanSeeBuilds === "onlyMe"}
                        onChange={handlePrivacyRadioChange}
                        className="mr-2"
                      />
                      <label htmlFor="onlyMe" className="text-gray-700">
                        Only Me
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg mr-3 hover:bg-gray-50 !rounded-button whitespace-nowrap cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 !rounded-button whitespace-nowrap cursor-pointer"
                  >
                    Update Privacy
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Display Preferences */}
          {activeSection === "display" && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                Display Preferences
              </h2>
              <form onSubmit={(e) => handleSubmit(e, "Display")}>
                <div className="space-y-6 mb-6">
                  <div>
                    <label
                      htmlFor="theme"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Theme
                    </label>
                    <div className="relative">
                      <select
                        id="theme"
                        name="theme"
                        value={displayPreferences.theme}
                        onChange={handleDisplayPreferenceChange}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                      >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="system">System Default</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                        <i className="fas fa-chevron-down"></i>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="language"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Language
                    </label>
                    <div className="relative">
                      <select
                        id="language"
                        name="language"
                        value={displayPreferences.language}
                        onChange={handleDisplayPreferenceChange}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                      >
                        <option value="english">English</option>
                        <option value="spanish">Spanish</option>
                        <option value="french">French</option>
                        <option value="german">German</option>
                        <option value="japanese">Japanese</option>
                        <option value="chinese">Chinese</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                        <i className="fas fa-chevron-down"></i>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="timezone"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Time Zone
                    </label>
                    <div className="relative">
                      <select
                        id="timezone"
                        name="timezone"
                        value={displayPreferences.timezone}
                        onChange={handleDisplayPreferenceChange}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                      >
                        <option value="America/New_York">
                          Eastern Time (ET)
                        </option>
                        <option value="America/Chicago">
                          Central Time (CT)
                        </option>
                        <option value="America/Denver">
                          Mountain Time (MT)
                        </option>
                        <option value="America/Los_Angeles">
                          Pacific Time (PT)
                        </option>
                        <option value="Europe/London">
                          Greenwich Mean Time (GMT)
                        </option>
                        <option value="Europe/Paris">
                          Central European Time (CET)
                        </option>
                        <option value="Asia/Tokyo">
                          Japan Standard Time (JST)
                        </option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                        <i className="fas fa-chevron-down"></i>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg mr-3 hover:bg-gray-50 !rounded-button whitespace-nowrap cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 !rounded-button whitespace-nowrap cursor-pointer"
                  >
                    Apply Changes
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Account Management */}
          {activeSection === "account" && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                Account Management
              </h2>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <i className="fas fa-info-circle text-blue-500 mt-0.5"></i>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">
                      Account Status
                    </h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>Your account is active and in good standing.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-medium text-gray-800 mb-3">
                  Membership Level
                </h3>
                <div className="flex items-center bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="mr-4">
                    <div className="bg-blue-100 rounded-full p-3">
                      <i className="fas fa-crown text-blue-600"></i>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium">Premium Member</h4>
                    <p className="text-sm text-gray-600">
                      Your membership renews on May 22, 2025
                    </p>
                  </div>
                  <div className="ml-auto">
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium !rounded-button whitespace-nowrap cursor-pointer">
                      Manage Subscription
                    </button>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6 mt-6">
                <h3 className="font-medium text-gray-800 mb-4">
                  Account Actions
                </h3>
                <div className="space-y-4">
                  <div>
                    <button
                      type="button"
                      className="bg-white border border-red-300 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 !rounded-button whitespace-nowrap cursor-pointer flex items-center"
                    >
                      <i className="fas fa-user-slash mr-2"></i>
                      Deactivate Account
                    </button>
                    <p className="text-sm text-gray-500 mt-1">
                      Temporarily disable your account. You can reactivate it
                      anytime.
                    </p>
                  </div>
                  <div>
                    <button
                      type="button"
                      className="bg-white border border-red-300 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 !rounded-button whitespace-nowrap cursor-pointer flex items-center"
                    >
                      <i className="fas fa-trash-alt mr-2"></i>
                      Delete Account
                    </button>
                    <p className="text-sm text-gray-500 mt-1">
                      Permanently delete your account and all associated data.
                      This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6 mt-6">
                <h3 className="font-medium text-gray-800 mb-4">
                  Data & Privacy
                </h3>
                <div className="space-y-4">
                  <div>
                    <button
                      type="button"
                      className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 !rounded-button whitespace-nowrap cursor-pointer flex items-center"
                    >
                      <i className="fas fa-download mr-2"></i>
                      Download Your Data
                    </button>
                    <p className="text-sm text-gray-500 mt-1">
                      Get a copy of all your personal data that we store.
                    </p>
                  </div>
                  <div>
                    <button
                      type="button"
                      className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 !rounded-button whitespace-nowrap cursor-pointer flex items-center"
                    >
                      <i className="fas fa-file-alt mr-2"></i>
                      Privacy Policy
                    </button>
                    <p className="text-sm text-gray-500 mt-1">
                      Read our privacy policy to understand how we handle your
                      data.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default AccountSettings;
