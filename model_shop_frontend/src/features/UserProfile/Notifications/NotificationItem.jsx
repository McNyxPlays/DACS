import React from "react";
import api from "../../../api/index";

const NotificationItem = ({ notification, onMarkAsRead }) => {
  const handleMarkAsRead = async () => {
    if (!notification.read) {
      try {
        const response = await api.post("/notifications.php", {
          action: "markSingleAsRead",
          notification_id: notification.id,
        });
        if (response.data.success) {
          onMarkAsRead(notification.id);
        }
      } catch (error) {
        console.error("Error marking notification as read:", error);
      }
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md flex items-start gap-4 mb-2">
      <div className="flex-1">
        <h3 className="font-semibold">{notification.title}</h3>
        <p className="text-sm text-gray-500">{notification.time}</p>
        <p className="mt-2">{notification.description}</p>
      </div>
      <button
        onClick={handleMarkAsRead}
        className={`px-4 py-2 rounded ${
          notification.read
            ? "bg-gray-300 text-gray-700 cursor-not-allowed"
            : "bg-blue-500 text-white hover:bg-blue-600"
        }`}
        disabled={notification.read}
      >
        {notification.actionText}
      </button>
    </div>
  );
};

export default NotificationItem;