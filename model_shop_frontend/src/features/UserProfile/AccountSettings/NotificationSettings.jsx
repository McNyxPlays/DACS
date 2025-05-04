import React, { useState } from "react";

const NotificationSettings = ({ activeSection }) => {
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    communityUpdates: true,
    directMessages: true,
    buildComments: false,
    eventReminders: true,
  });

  const handleNotificationToggle = (setting) => {
    setNotifications({
      ...notifications,
      [setting]: !notifications[setting],
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Notifications settings saved successfully!");
  };

  return (
    <>
      {activeSection === "notifications" && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">
            Notification Preferences
          </h2>
          <form onSubmit={handleSubmit}>
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
                    onClick={() => handleNotificationToggle("emailNotifications")}
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
                    onClick={() => handleNotificationToggle("pushNotifications")}
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
                    onClick={() => handleNotificationToggle("communityUpdates")}
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
                    onClick={() => handleNotificationToggle("directMessages")}
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
                    Receive notifications when someone comments on your builds
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
                    onClick={() => handleNotificationToggle("buildComments")}
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
                    onClick={() => handleNotificationToggle("eventReminders")}
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
    </>
  );
};

export default NotificationSettings;