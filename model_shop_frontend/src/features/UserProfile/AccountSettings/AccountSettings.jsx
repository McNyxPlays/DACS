import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import ProfileSettings from "./ProfileSettings";
import NotificationSettings from "./NotificationSettings";
import PrivacySettings from "./PrivacySettings";
import DisplaySettings from "./DisplaySettings";
import AccountManagement from "./AccountManagement";

const AccountSettings = ({ user, onUserUpdate }) => {
  const [activeSection, setActiveSection] = useState("profile");

  return (
    <main className="container mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Account Settings
        </h1>
        <p className="text-gray-600">
          Manage your account information, notification preferences, privacy
          settings, and more.
        </p>
      </div>

      <div className="flex flex-col md:flex-row">
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

        <div className="w-full md:w-3/4">
          <ProfileSettings
            activeSection={activeSection}
            user={user}
            onUserUpdate={onUserUpdate}
          />
          <NotificationSettings activeSection={activeSection} />
          <PrivacySettings activeSection={activeSection} />
          <DisplaySettings activeSection={activeSection} />
          <AccountManagement activeSection={activeSection} />
        </div>
      </div>
    </main>
  );
};

export default AccountSettings;
