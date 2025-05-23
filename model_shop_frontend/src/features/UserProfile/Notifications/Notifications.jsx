import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import api from "../../../api/index";
import NotificationsSidebar from "./NotificationsSidebar";
import NotificationsHeader from "./NotificationsHeader";
import NotificationItem from "./NotificationItem";
import NotificationsPagination from "./NotificationsPagination";

const Notifications = () => {
  const { user } = useOutletContext();
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("Unread");
  const [category, setCategory] = useState("All Categories");
  const [sort, setSort] = useState("Newest First");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user?.user_id) return;
      setLoading(true);
      try {
        const response = await api.get("/notifications.php", {
          params: { filter, category, sort, page: currentPage },
        });
        if (response.data.success) {
          const formattedNotifications = response.data.notifications.map((n) => ({
            id: n.notification_id,
            title: n.type.charAt(0).toUpperCase() + n.type.slice(1) + " Notification",
            time: new Date(n.created_at).toLocaleString(),
            description: n.message,
            actionText: n.is_read ? "View" : "Mark as Read",
            read: n.is_read === 1,
          }));
          setNotifications(formattedNotifications);
          setTotalPages(response.data.totalPages);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, [filter, category, sort, currentPage, user]);

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setCurrentPage(1);
  };

  const handleCategoryChange = (newCategory) => {
    setCategory(newCategory);
    setCurrentPage(1);
  };

  const handleSortChange = (newSort) => {
    setSort(newSort);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => setCurrentPage(page);

  const handleMarkAsRead = async () => {
    try {
      const response = await api.post("/notifications.php", { action: "markAsRead" });
      if (response.data.success) {
        setNotifications(notifications.map((n) => ({ ...n, read: true, actionText: "View" })));
      }
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await api.post("/notifications.php", { action: "delete" });
      if (response.data.success) {
        setNotifications([]);
      }
    } catch (error) {
      console.error("Error deleting notifications:", error);
    }
  };

  const handleSingleMarkAsRead = (notificationId) => {
    setNotifications(
      notifications.map((n) => (n.id === notificationId ? { ...n, read: true, actionText: "View" } : n))
    );
  };

  return (
    <div className="container mx-auto p-4 flex flex-col md:flex-row gap-4">
      <NotificationsSidebar
        filter={filter}
        category={category}
        onFilterChange={handleFilterChange}
        onCategoryChange={handleCategoryChange}
      />
      <div className="flex-1">
        <NotificationsHeader
          sort={sort}
          onSortChange={handleSortChange}
          onMarkAsRead={handleMarkAsRead}
          onDelete={handleDelete}
        />
        {loading ? (
          <div className="text-center py-4">Loading...</div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-4">No notifications found.</div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={handleSingleMarkAsRead}
              />
            ))}
          </div>
        )}
        <NotificationsPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default Notifications;